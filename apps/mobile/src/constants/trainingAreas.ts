import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type AreaId = 'UPPER' | 'LOWER' | 'CARDIO';

export interface TrainingArea {
  id: AreaId;
  // Must match SIMPLE_EXERCISES in apps/server/src/data/gymWorkouts.ts
  name: string;
  // What it trains, in plain words
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}

// The areas a beginner picks from. The Simple tab, the help popup and the day suggestion all read this list,
// so their wording always matches.
export const TRAINING_AREAS: TrainingArea[] = [
  { id: 'UPPER',  name: 'Upper Body', description: 'Chest, back, shoulders and arms', icon: 'barbell' },
  { id: 'LOWER',  name: 'Lower Body', description: 'Legs and glutes',                 icon: 'walk' },
  { id: 'CARDIO', name: 'Cardio',     description: 'Running, biking, rowing and more', icon: 'heart' },
];
