import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { SessionType } from '@templegym/types';

export interface SessionTypeInfo {
  type: SessionType;
  label: string;
  // What the session trains, in plain words
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}

// The session types explained in the help popup on Home. The day suggestion uses the same wording.
export const SESSION_TYPES: SessionTypeInfo[] = [
  { type: 'PUSH',      label: 'Push',      description: 'Chest, shoulders and triceps',                  icon: 'arrow-up-circle' },
  { type: 'PULL',      label: 'Pull',      description: 'Back, biceps and rear delts',                   icon: 'arrow-down-circle' },
  { type: 'LEGS',      label: 'Legs',      description: 'Quads, hamstrings, glutes and calves',          icon: 'walk' },
  { type: 'CARDIO',    label: 'Cardio',    description: 'Running, cycling, rowing and more',                  icon: 'heart' },
  { type: 'FULL_BODY', label: 'Full Body', description: 'A mix of upper and lower body exercises',       icon: 'body' },
];
