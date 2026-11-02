import type { Exercise } from '@templegym/types';
import type { SavedRoutine } from '../navigation/types';

// One part of the folder editor: a routine being typed in, not saved yet
export interface RoutineDraft {
  name: string;
  exercises: Exercise[];
}

// What a Save keeps. A blank part (no name, no exercises) is dropped quietly.
// A routine needs both a name and at least one exercise, or the save is blocked.
export function prepareRoutines(
  drafts: RoutineDraft[],
  folderId: number | 'default',
): { routines: SavedRoutine[]; missingName: boolean; missingExercises: boolean } {
  const routines: SavedRoutine[] = [];
  let missingName = false;
  let missingExercises = false;
  for (const draft of drafts) {
    const name = draft.name.trim();
    const hasExercises = draft.exercises.length > 0;
    if (!name && !hasExercises) continue;
    if (!name) { missingName = true; continue; }
    if (!hasExercises) { missingExercises = true; continue; }
    routines.push({ folderId, name, exercises: draft.exercises });
  }
  return { routines, missingName, missingExercises };
}
