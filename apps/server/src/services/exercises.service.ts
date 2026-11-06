import { GYM_WORKOUT_CATALOG } from '../data/gymWorkouts';

const SESSION_TYPES = ['PUSH', 'PULL', 'LEGS', 'CARDIO', 'FULL_BODY'] as const;
type SessionType = typeof SESSION_TYPES[number];

const DEFAULT_GYM = 'city';

interface ExerciseWhere {
  gyms: { has: string };
  category?: SessionType | { in: SessionType[] };
}

export function buildExerciseWhere(gymId: string, sessionType?: string): ExerciseWhere {
  const gym = Object.keys(GYM_WORKOUT_CATALOG).includes(gymId) ? gymId : DEFAULT_GYM;
  const where: ExerciseWhere = { gyms: { has: gym } };
  if (SESSION_TYPES.includes(sessionType as SessionType)) {
    where.category = sessionType === 'FULL_BODY'
      ? { in: ['PUSH', 'PULL', 'FULL_BODY'] }
      : (sessionType as SessionType);
  }
  return where;
}
