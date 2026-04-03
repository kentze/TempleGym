import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { SavedRoutine } from '../navigation/types';

const k = (userId: string, key: string) => `${userId}_${key}`;
const folderKey = (userId: string, id: number) => `${userId}_tg_folder_${id}`;

export interface RoutineFolder {
  id:    number;
  name:  string;
  open:  boolean;
  items: SavedRoutine[];
}

interface RoutinesState {
  userId:       string | null;
  folders:      RoutineFolder[];
  defaultItems: SavedRoutine[];
  _defaultOpen: boolean;
  hydrated:     boolean;

  hydrate:              (userId: string) => Promise<void>;
  addFolder:            (name: string) => void;
  toggleFolder:         (id: number) => void;
  addToFolder:          (folderId: number, routine: SavedRoutine) => void;
  addToDefault:         (routine: SavedRoutine) => void;
  setDefaultOpen:       (open: boolean) => void;
  removeRoutineItem:    (folderId: number | 'default', index: number) => void;
  duplicateRoutineItem: (folderId: number | 'default', index: number) => void;
  replaceRoutineItem:   (folderId: number | 'default', index: number, routine: SavedRoutine) => void;
}

async function safe_set(key: string, value: string) {
  try { await SecureStore.setItemAsync(key, value); } catch {}
}

async function safe_get(key: string): Promise<string | null> {
  try { return await SecureStore.getItemAsync(key); } catch { return null; }
}

export const useRoutinesStore = create<RoutinesState>((set, get) => ({
  userId:       null,
  folders:      [],
  defaultItems: [],
  _defaultOpen: false,
  hydrated:     false,

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
        return { id, name: f.name, open: f.open ?? false, items: f.items ?? [] } as RoutineFolder;
      })
    ).then((arr) => arr.filter(Boolean) as RoutineFolder[]);

    // Load default items
    const defRaw  = await safe_get(k(userId, 'tg_default_items'));
    const defOpen = await safe_get(k(userId, 'tg_default_open'));

    set({
      userId,
      folders,
      defaultItems: defRaw ? JSON.parse(defRaw) : [],
      _defaultOpen: defOpen === '1',
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
      return { defaultItems: next, _defaultOpen: true };
    });
  },

  setDefaultOpen: (open) => {
    const userId = get().userId ?? '';
    safe_set(k(userId, 'tg_default_open'), open ? '1' : '0');
    set({ _defaultOpen: open });
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
}));
