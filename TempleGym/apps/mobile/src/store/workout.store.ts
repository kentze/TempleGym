import { create } from 'zustand';
import type { Exercise, SessionType, SetEntry } from '@templegym/types';
import { api } from '../services/api';

interface ActiveExercise {
  slotKey:    string; // unique per slot — exerciseId:orderIndex
  exerciseId: string;
  name:       string;
  orderIndex: number;
  startedAt:  Date;
  sets:       SetEntry[];
}

interface ActiveSession {
  type:      SessionType;
  startedAt: Date;
  exercises: ActiveExercise[];
}

interface WorkoutState {
  activeSession: ActiveSession | null;
  isSubmitting:  boolean;
  startSession:  (type: SessionType, exercises?: Exercise[]) => void;
  addExercise:   (exercise: Exercise) => void;
  addSet:        (slotKey: string, set: Omit<SetEntry, 'setNumber'>) => void;
  endSession:    (gpsLat?: number, gpsLng?: number) => Promise<void>;
  clearSession:  () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeSession: null,
  isSubmitting:  false,

  startSession: (type, exercises?) => set({
    activeSession: {
      type,
      startedAt: new Date(),
      exercises: (exercises ?? []).map((ex, i) => ({
        slotKey:    `${ex.id}:${i}`,
        exerciseId: ex.id,
        name:       ex.name,
        orderIndex: i,
        startedAt:  new Date(),
        sets:       [],
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
