import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { SavedRoutine } from '../navigation/types';

const k = (userId: string, key: string) => `${userId}_${key}`;
const folderKey = (userId: string, id: number) => `${userId}_tg_folder_${id}`;

export const DEFAULT_ROUTINE_NAME = 'My Routine';
export const MAX_FOLDER_NAME = 30;

// A folder name with the spaces around it removed, or an empty string when there is nothing left
export function cleanFolderName(raw: string): string {
  return raw.trim().slice(0, MAX_FOLDER_NAME);
}

export interface RoutineFolder {
  id:    number;
  name:  string;
  open:  boolean;
  items: SavedRoutine[];
}

interface RoutinesState {
  userId:          string | null;
  folders:         RoutineFolder[];
  defaultItems:    SavedRoutine[];
  _defaultOpen:    boolean;
  _defaultHidden:  boolean;
  _defaultName:    string;
  hydrated:        boolean;

  hydrate:              (userId: string) => Promise<void>;
  addFolder:            (name: string) => void;
  toggleFolder:         (id: number) => void;
  addToFolder:          (folderId: number, routine: SavedRoutine) => void;
  addToDefault:         (routine: SavedRoutine) => void;
  setDefaultOpen:       (open: boolean) => void;
  renameFolder:         (id: number, name: string) => void;
  renameDefaultFolder:  (name: string) => void;
  removeRoutineItem:    (folderId: number | 'default', index: number) => void;
  duplicateRoutineItem: (folderId: number | 'default', index: number) => void;
  replaceRoutineItem:   (folderId: number | 'default', index: number, routine: SavedRoutine) => void;
  deleteFolder:         (id: number) => void;
  deleteDefaultFolder:  () => void;
}

async function safe_set(key: string, value: string) {
  try { await SecureStore.setItemAsync(key, value); } catch {}
}

async function safe_get(key: string): Promise<string | null> {
  try { return await SecureStore.getItemAsync(key); } catch { return null; }
}

export const useRoutinesStore = create<RoutinesState>((set, get) => ({
  userId:         null,
  folders:        [],
  defaultItems:   [],
  _defaultOpen:   false,
  _defaultHidden: false,
  _defaultName:   DEFAULT_ROUTINE_NAME,
  hydrated:       false,

  hydrate: async (userId) => {
    // Load folder IDs
    const idsRaw = await safe_get(k(userId, 'tg_folder_ids'));
    const ids: number[] = idsRaw ? JSON.parse(idsRaw) : [];

    // Load each folder
    const folders: RoutineFolder[] = await Promise.all(
      ids.map(async (id) => {
        const raw = await safe_get(folderKey(userId, id));
        if (!raw) return null;
        const f = JSON.parse(raw);
        return { id, name: f.name, open: false, items: f.items ?? [] } as RoutineFolder;
      })
    ).then((arr) => arr.filter(Boolean) as RoutineFolder[]);

    // Load default items
    const defRaw    = await safe_get(k(userId, 'tg_default_items'));
    const defHidden = await safe_get(k(userId, 'tg_default_hidden'));
    const defName   = await safe_get(k(userId, 'tg_default_name'));

    const defaultItems: SavedRoutine[] = defRaw ? JSON.parse(defRaw) : [];

    set({
      userId,
      folders,
      defaultItems,
      // A routine list with nothing saved starts open so the empty message is visible
      _defaultOpen:   defaultItems.length === 0,
      _defaultHidden: defHidden === '1',
      _defaultName:   cleanFolderName(defName ?? '') || DEFAULT_ROUTINE_NAME,
      hydrated: true,
    });
  },

  addFolder: (name) => {
    const userId = get().userId ?? '';
    const id   = Date.now();
    const folder: RoutineFolder = { id, name, open: false, items: [] };
    set((s) => {
      const next = [folder, ...s.folders];
      const ids  = next.map((f) => f.id);
      safe_set(k(userId, 'tg_folder_ids'), JSON.stringify(ids));
      safe_set(folderKey(userId, id), JSON.stringify({ name, open: false, items: [] }));
      return { folders: next };
    });
  },

  toggleFolder: (id) => {
    const userId = get().userId ?? '';
    set((s) => {
      const next = s.folders.map((f) => f.id === id ? { ...f, open: !f.open } : f);
      const f    = next.find((x) => x.id === id);
      if (f) safe_set(folderKey(userId, id), JSON.stringify({ name: f.name, open: f.open, items: f.items }));
      return { folders: next };
    });
  },

  addToFolder: (folderId, routine) => {
    const userId = get().userId ?? '';
    set((s) => {
      const next = s.folders.map((f) =>
        f.id === folderId ? { ...f, items: [...f.items, routine], open: true } : f
      );
      const f = next.find((x) => x.id === folderId);
      if (f) safe_set(folderKey(userId, folderId), JSON.stringify({ name: f.name, open: true, items: f.items }));
      return { folders: next };
    });
  },

  addToDefault: (routine) => {
    const userId = get().userId ?? '';
    set((s) => {
      const next = [...s.defaultItems, routine];
      safe_set(k(userId, 'tg_default_items'), JSON.stringify(next));
      safe_set(k(userId, 'tg_default_open'), '1');
      safe_set(k(userId, 'tg_default_hidden'), '0');
      return { defaultItems: next, _defaultOpen: true, _defaultHidden: false };
    });
  },

  setDefaultOpen: (open) => {
    const userId = get().userId ?? '';
    safe_set(k(userId, 'tg_default_open'), open ? '1' : '0');
    set({ _defaultOpen: open });
  },

  renameFolder: (id, name) => {
    const userId = get().userId ?? '';
    const clean  = cleanFolderName(name);
    if (!clean) return;
    set((s) => {
      const next = s.folders.map((f) => {
        if (f.id !== id) return f;
        safe_set(folderKey(userId, id), JSON.stringify({ name: clean, open: f.open, items: f.items }));
        return { ...f, name: clean };
      });
      return { folders: next };
    });
  },

  renameDefaultFolder: (name) => {
    const userId = get().userId ?? '';
    const clean  = cleanFolderName(name);
    if (!clean) return;
    safe_set(k(userId, 'tg_default_name'), clean);
    set({ _defaultName: clean });
  },

  removeRoutineItem: (folderId, index) => {
    const userId = get().userId ?? '';
    if (folderId === 'default') {
      set((s) => {
        const next = s.defaultItems.filter((_, i) => i !== index);
        safe_set(k(userId, 'tg_default_items'), JSON.stringify(next));
        return { defaultItems: next };
      });
    } else {
      set((s) => {
        const next = s.folders.map((f) => {
          if (f.id !== folderId) return f;
          const items = f.items.filter((_, i) => i !== index);
          safe_set(folderKey(userId, f.id), JSON.stringify({ name: f.name, open: f.open, items }));
          return { ...f, items };
        });
        return { folders: next };
      });
    }
  },

  duplicateRoutineItem: (folderId, index) => {
    const userId = get().userId ?? '';
    if (folderId === 'default') {
      set((s) => {
        const item = s.defaultItems[index];
        if (!item) return s;
        const copy = { ...item, name: `${item.name} (copy)` };
        const next = [...s.defaultItems.slice(0, index + 1), copy, ...s.defaultItems.slice(index + 1)];
        safe_set(k(userId, 'tg_default_items'), JSON.stringify(next));
        return { defaultItems: next };
      });
    } else {
      set((s) => {
        const next = s.folders.map((f) => {
          if (f.id !== folderId) return f;
          const item = f.items[index];
          if (!item) return f;
          const copy = { ...item, name: `${item.name} (copy)` };
          const items = [...f.items.slice(0, index + 1), copy, ...f.items.slice(index + 1)];
          safe_set(folderKey(userId, f.id), JSON.stringify({ name: f.name, open: f.open, items }));
          return { ...f, items };
        });
        return { folders: next };
      });
    }
  },

  replaceRoutineItem: (folderId, index, routine) => {
    const userId = get().userId ?? '';
    if (folderId === 'default') {
      set((s) => {
        const next = s.defaultItems.map((item, i) => i === index ? routine : item);
        safe_set(k(userId, 'tg_default_items'), JSON.stringify(next));
        return { defaultItems: next };
      });
    } else {
      set((s) => {
        const next = s.folders.map((f) => {
          if (f.id !== folderId) return f;
          const items = f.items.map((item, i) => i === index ? routine : item);
          safe_set(folderKey(userId, f.id), JSON.stringify({ name: f.name, open: f.open, items }));
          return { ...f, items };
        });
        return { folders: next };
      });
    }
  },

  deleteFolder: (id) => {
    const userId = get().userId ?? '';
    set((s) => {
      const next = s.folders.filter((f) => f.id !== id);
      const ids  = next.map((f) => f.id);
      safe_set(k(userId, 'tg_folder_ids'), JSON.stringify(ids));
      SecureStore.deleteItemAsync(folderKey(userId, id)).catch(() => {});
      return { folders: next };
    });
  },

  deleteDefaultFolder: () => {
    const userId = get().userId ?? '';
    safe_set(k(userId, 'tg_default_hidden'), '1');
    set({ _defaultHidden: true, _defaultOpen: false });
  },
}));
