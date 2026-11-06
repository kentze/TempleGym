import type { SetEntry } from '@templegym/types';

interface WorkoutRow {
  exerciseId: string;
  exercise:   unknown;
  session:    { startedAt: Date };
  sets:       unknown;
}

export interface BestSet {
  exercise:     unknown;
  bestWeightKg: number;
  bestReps:     number;
  achievedAt:   Date;
}

// The heaviest set of each exercise across every workout. Cardio entries have no weight, so they are skipped.
export function bestSetPerExercise(rows: WorkoutRow[]): BestSet[] {
  const best = new Map<string, BestSet>();

  for (const row of rows) {
    for (const set of row.sets as SetEntry[]) {
      if ('minutes' in set) continue;
      const existing = best.get(row.exerciseId);
      if (!existing || set.weightKg > existing.bestWeightKg) {
        best.set(row.exerciseId, {
          exercise:     row.exercise,
          bestWeightKg: set.weightKg,
          bestReps:     set.reps,
          achievedAt:   row.session.startedAt,
        });
      }
    }
  }

  return Array.from(best.values());
}
