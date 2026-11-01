// Ids must match the gym ids on the server (apps/server/src/data/gymWorkouts.ts)
export const GYMS = [
  { id: 'city',     name: 'City Campus' },
  { id: 'hillside', name: 'Hillside Campus' },
] as const;

export type GymId = (typeof GYMS)[number]['id'];
