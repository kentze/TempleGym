import type { Exercise } from '@templegym/types';
import type { SavedRoutine } from '../navigation/types';

// Which routine an exercise in a workout came from. Two routines can share a name, so the key tells them apart.
export interface GroupTag {
  key: string;
  name: string;
}

export interface SessionSeed {
  exercise: Exercise;
  group?: GroupTag;
}

// Every exercise from every routine in a folder, in order, each tagged with its routine.
export function seedFromRoutines(routines: SavedRoutine[]): SessionSeed[] {
  return routines.flatMap((routine, index) =>
    routine.exercises.map((exercise) => ({
      exercise,
      group: { key: String(index), name: routine.name },
    })),
  );
}

export interface SectionMark {
  // Draw a line above this exercise
  divider: boolean;
  // Routine name to show above this exercise, when it starts a routine
  label?: string;
}

// Where the workout screen draws routine labels and the lines between routines.
// A workout from one routine, or from no routine, is drawn plain.
export function sectionMarks(groups: (GroupTag | undefined)[]): SectionMark[] {
  const routineKeys = new Set(groups.filter((g): g is GroupTag => !!g).map((g) => g.key));
  const split = routineKeys.size >= 2;

  return groups.map((group, i) => {
    const startsSection = split && (i === 0 || group?.key !== groups[i - 1]?.key);
    if (!startsSection) return { divider: false };
    const mark: SectionMark = { divider: i > 0 };
    if (group) mark.label = group.name;
    return mark;
  });
}
