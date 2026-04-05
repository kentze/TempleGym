export type SessionType =
  | "PUSH"
  | "PULL"
  | "LEGS"
  | "CARDIO"
  | "CORE"
  | "FULL_BODY";

export interface SetEntry {
  setNumber: number;
  weightKg: number;
  reps: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: SessionType;
  subCategory: string | null;
  muscleGroups: string[];
}

export interface WorkoutExerciseEntry {
  exerciseId: string;
  orderIndex: number;
  startedAt: string;
  sets: SetEntry[];
}

export interface SubmitWorkoutBody {
  type: SessionType;
  startedAt: string;
  endedAt: string;
  gpsLat?: number;
  gpsLng?: number;
  exercises: WorkoutExerciseEntry[];
}

export interface WorkoutSessionExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  orderIndex: number;
  startedAt: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: string;
  type: SessionType;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  pointsEarned: number;
  gpsVerified: boolean;
  volumeScore: number;
  weekLabel: string;
  exercises: WorkoutSessionExercise[];
  createdAt: string;
}

export interface WorkoutsListResponse {
  sessions: WorkoutSession[];
  total: number;
}
