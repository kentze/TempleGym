import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { SavedRoutine } from '../navigation/types';
import { isFirstVisit } from '../utils/routineIntro';

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
  setFolderRoutines:    (folderId: number | 'default', routines: SavedRoutine[]) => void;
  setDefaultOpen:       (open: boolean) => void;
  renameFolder:         (id: number, name: string) => void;
  renameDefaultFolder:  (name: string) => void;
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
    ).then((arr) => (arr.filter(Boolean) as RoutineFolder[]).sort((a, b) => a.id - b.id));

    // Load default items
    const defRaw    = await safe_get(k(userId, 'tg_default_items'));
    const defHidden = await safe_get(k(userId, 'tg_default_hidden'));
    const defName   = await safe_get(k(userId, 'tg_default_name'));
    const introSeen = await safe_get(k(userId, 'tg_intro_seen'));

    const defaultItems: SavedRoutine[] = defRaw ? JSON.parse(defRaw) : [];

    const firstVisit = isFirstVisit({
      seenBefore:        introSeen === '1',
      folderCount:       folders.length,
      savedRoutineCount: defaultItems.length,
    });
    // Remember it, so the open My Routine only ever happens once per account
    if (introSeen !== '1') safe_set(k(userId, 'tg_intro_seen'), '1');

    set({
      userId,
      folders,
      defaultItems,
      _defaultOpen:   firstVisit,
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
      const next = [...s.folders, folder];
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

  // Replace every routine in a folder with the given list, and open the folder
  setFolderRoutines: (folderId, routines) => {
    const userId = get().userId ?? '';
    if (folderId === 'default') {
      safe_set(k(userId, 'tg_default_items'), JSON.stringify(routines));
      safe_set(k(userId, 'tg_default_open'), '1');
      safe_set(k(userId, 'tg_default_hidden'), '0');
      set({ defaultItems: routines, _defaultOpen: true, _defaultHidden: false });
      return;
    }
    set((s) => {
      const target = s.folders.find((f) => f.id === folderId);
      if (!target) return s;
      safe_set(folderKey(userId, folderId), JSON.stringify({ name: target.name, open: true, items: routines }));
      return { folders: s.folders.map((f) => (f.id === folderId ? { ...f, items: routines, open: true } : f)) };
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
    safe_set(k(userId, 'tg_default_items'), '[]');
    set({ _defaultHidden: true, _defaultOpen: false, defaultItems: [] });
  },
}));
