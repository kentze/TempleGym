import type { Exercise } from '@templegym/types';
import { TRAINING_AREAS } from './trainingAreas';

// What the Simple tab offers: the training areas, with their wording
export const SIMPLE_OPTIONS = TRAINING_AREAS.map((area) => ({ name: area.name, blurb: area.description }));

export function isSimpleExercise(exercise: Exercise): boolean {
  return SIMPLE_OPTIONS.some((o) => o.name === exercise.name);
}
