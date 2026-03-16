import type { SetEntry } from '@templegym/types';

interface PointsInput {
  durationMinutes: number;
  volumeScore: number;
  gpsVerified: boolean;
}

export function computePoints({ durationMinutes, volumeScore, gpsVerified }: PointsInput): number {
  const base          = 50;
  const durationBonus = Math.min(Math.floor(durationMinutes / 10) * 10, 150);
  const volumeBonus   = Math.floor(volumeScore / 1000) * 5;
  const gpsBonus      = gpsVerified ? 25 : 0;
  return base + durationBonus + volumeBonus + gpsBonus;
}

export function computeVolumeScore(exercises: { sets: SetEntry[] }[]): number {
  return exercises.reduce((total, ex) =>
    total + ex.sets.reduce((s, set) => s + set.weightKg * set.reps, 0), 0);
}
