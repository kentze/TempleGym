import { z } from 'zod';

// A lifting set. Strict, so a set cannot carry minutes as well.
const strengthSetSchema = z.object({
  setNumber: z.number().int().min(1),
  weightKg:  z.number().min(0).max(250),
  reps:      z.number().int().min(1).max(50),
}).strict();

// A cardio entry, in whole minutes
const cardioSetSchema = z.object({
  setNumber: z.number().int().min(1),
  minutes:   z.number().int().min(1).max(600),
}).strict();

export const setSchema = z.union([strengthSetSchema, cardioSetSchema]);

export const exerciseEntrySchema = z.object({
  exerciseId: z.string().cuid(),
  orderIndex: z.number().int().min(0),
  startedAt:  z.string().datetime(),
  sets:       z.array(setSchema).min(1).max(20),
});

export const submitWorkoutSchema = z.object({
  type:      z.enum(['PUSH', 'PULL', 'LEGS', 'CARDIO', 'FULL_BODY']),
  startedAt: z.string().datetime(),
  endedAt:   z.string().datetime(),
  gpsLat:    z.number().optional(),
  gpsLng:    z.number().optional(),
  exercises: z.array(exerciseEntrySchema).min(1),
});
