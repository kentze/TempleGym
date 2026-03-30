import { Router, Request, Response } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { isAtGym } from '../services/gps.service';
import { computePoints, computeVolumeScore } from '../services/points.service';
import { getWeekLabel } from '../utils/weekLabel';

const router = Router();

const setSchema = z.object({
  setNumber: z.number().int().min(1),
  weightKg:  z.number().min(0).max(250),
  reps:      z.number().int().min(1).max(50),
});

const exerciseEntrySchema = z.object({
  exerciseId: z.string().cuid(),
  orderIndex: z.number().int().min(0),
  startedAt:  z.string().datetime(),
  sets:       z.array(setSchema).min(1).max(20),
});

const submitWorkoutSchema = z.object({
  type:      z.enum(['PUSH', 'PULL']),
  startedAt: z.string().datetime(),
  endedAt:   z.string().datetime(),
  gpsLat:    z.number().optional(),
  gpsLng:    z.number().optional(),
  exercises: z.array(exerciseEntrySchema).min(1),
});

// POST /workouts
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const parsed = submitWorkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { type, startedAt, endedAt, gpsLat, gpsLng, exercises } = parsed.data;

  const exerciseIds     = exercises.map((e) => e.exerciseId);
  const foundExercises  = await prisma.exercise.findMany({ where: { id: { in: exerciseIds } } });
  if (foundExercises.length !== exerciseIds.length) {
    return res.status(400).json({ error: 'One or more exercises not found' });
  }

  const start           = new Date(startedAt);
  const end             = new Date(endedAt);
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  const gpsVerified     = gpsLat != null && gpsLng != null ? isAtGym(gpsLat, gpsLng) : false;
  const volumeScore     = computeVolumeScore(exercises);
  const pointsEarned    = computePoints({ durationMinutes, volumeScore, gpsVerified });
  const weekLabel       = getWeekLabel(start);

  const session = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const s = await tx.workoutSession.create({
      data: {
        userId: req.user!.id, type, startedAt: start, endedAt: end,
        durationMinutes, pointsEarned, gpsLat, gpsLng, gpsVerified, volumeScore, weekLabel,
        exercises: {
          create: exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            orderIndex: ex.orderIndex,
            startedAt:  new Date(ex.startedAt),
            sets:       ex.sets,
          })),
        },
      },
      include: { exercises: { include: { exercise: true } } },
    });
    await tx.user.update({
      where: { id: req.user!.id },
      data:  { totalPoints: { increment: pointsEarned }, weeklyPoints: { increment: pointsEarned } },
    });
    return s;
  });

  return res.status(201).json(session);
});

export default router;
