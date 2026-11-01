import type { Exercise } from '@templegym/types';

// Names must match SIMPLE_EXERCISES in apps/server/src/data/gymWorkouts.ts
export const SIMPLE_OPTIONS = [
  { name: 'Upper Body', blurb: 'Chest, back, shoulders and arms' },
  { name: 'Lower Body', blurb: 'Legs and glutes' },
  { name: 'Cardio',     blurb: 'Running, biking, rowing and more' },
];

export function isSimpleExercise(exercise: Exercise): boolean {
  return SIMPLE_OPTIONS.some((o) => o.name === exercise.name);
}
