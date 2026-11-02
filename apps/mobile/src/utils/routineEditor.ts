import type { Exercise } from '@templegym/types';
import type { SavedRoutine } from '../navigation/types';

// One part of the folder editor: a routine being typed in, not saved yet
export interface RoutineDraft {
  name: string;
  exercises: Exercise[];
}

// What a Save keeps. A blank part is dropped quietly. A part with exercises but no name blocks the save.
export function prepareRoutines(
  drafts: RoutineDraft[],
  folderId: number | 'default',
): { routines: SavedRoutine[]; missingName: boolean } {
  const routines: SavedRoutine[] = [];
  let missingName = false;
  for (const draft of drafts) {
    const name = draft.name.trim();
    if (!name) {
      if (draft.exercises.length > 0) missingName = true;
      continue;
    }
    routines.push({ folderId, name, exercises: draft.exercises });
  }
  return { routines, missingName };
}
