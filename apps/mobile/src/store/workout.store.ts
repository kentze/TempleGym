import { create } from 'zustand';
import type { CardioSet, Exercise, SessionType, SetEntry, StrengthSet } from '@templegym/types';
import { api } from '../services/api';
import type { GroupTag, SessionSeed } from '../utils/routineSession';

interface ActiveExercise {
  slotKey:    string; // unique per slot — exerciseId:orderIndex
  exerciseId: string;
  name:       string;
  orderIndex: number;
  startedAt:  Date;
  // Cardio is logged in minutes, everything else in weight and reps
  isCardio:   boolean;
  sets:       SetEntry[];
  group?:     GroupTag; // the routine it came from, when the workout was started from a folder
}

// A set as typed in, before the store numbers it
export type NewSet = Omit<StrengthSet, 'setNumber'> | Omit<CardioSet, 'setNumber'>;

interface ActiveSession {
  type:      SessionType;
  startedAt: Date;
  exercises: ActiveExercise[];
}

interface WorkoutState {
  activeSession: ActiveSession | null;
  isSubmitting:  boolean;
  startSession:  (type: SessionType, exercises?: Exercise[]) => void;
  startSessionFrom: (type: SessionType, seeds: SessionSeed[]) => void;
  addExercise:   (exercise: Exercise) => void;
  addSet:        (slotKey: string, set: NewSet) => void;
  endSession:    (gpsLat?: number, gpsLng?: number) => Promise<void>;
  clearSession:  () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeSession: null,
  isSubmitting:  false,

  startSession: (type, exercises?) =>
    get().startSessionFrom(type, (exercises ?? []).map((exercise) => ({ exercise }))),

  startSessionFrom: (type, seeds) => set({
    activeSession: {
      type,
      startedAt: new Date(),
      exercises: seeds.map(({ exercise, group }, i) => ({
        slotKey:    `${exercise.id}:${i}`,
        exerciseId: exercise.id,
        name:       exercise.name,
        orderIndex: i,
        startedAt:  new Date(),
        isCardio:   exercise.category === 'CARDIO',
        sets:       [],
        group,
      })),
    },
  }),

  addExercise: (exercise) => {
    const session = get().activeSession;
    if (!session) return;
    if (session.exercises.some((e) => e.exerciseId === exercise.id)) return;
    const orderIndex = session.exercises.length;
    set({
      activeSession: {
        ...session,
        exercises: [...session.exercises, {
          slotKey:    `${exercise.id}:${orderIndex}`,
          exerciseId: exercise.id,
          name:       exercise.name,
          orderIndex,
          startedAt:  new Date(),
          isCardio:   exercise.category === 'CARDIO',
          sets:       [],
        }],
      },
    });
  },

  addSet: (slotKey, set_) => {
    const session = get().activeSession;
    if (!session) return;
    set({
      activeSession: {
        ...session,
        exercises: session.exercises.map((ex) =>
          ex.slotKey !== slotKey ? ex
            : { ...ex, sets: [...ex.sets, { setNumber: ex.sets.length + 1, ...set_ }] }
        ),
      },
    });
  },

  endSession: async (gpsLat, gpsLng) => {
    const session = get().activeSession;
    if (!session || get().isSubmitting) return;
    set({ isSubmitting: true });
    try {
      await api.post('/workouts', {
        type:      session.type,
        startedAt: session.startedAt.toISOString(),
        endedAt:   new Date().toISOString(),
        gpsLat,
        gpsLng,
        exercises: session.exercises
          .filter((ex) => ex.sets.length > 0)
          .map((ex) => ({
            exerciseId: ex.exerciseId,
            orderIndex: ex.orderIndex,
            startedAt:  ex.startedAt.toISOString(),
            sets:       ex.sets,
          })),
      });
      set({ activeSession: null });
    } finally {
      set({ isSubmitting: false });
    }
  },

  clearSession: () => set({ activeSession: null }),
}));
