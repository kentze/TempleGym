import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { buildExerciseWhere } from '../services/exercises.service';

const router = Router();

// GET /exercises?sessionType=PUSH|PULL|LEGS|CARDIO|FULL_BODY
// Only returns exercises available at the user's gym.
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where:  { id: req.user!.id },
    select: { gymId: true },
  });
  const sessionType = typeof req.query.sessionType === 'string' ? req.query.sessionType : undefined;
  const where = buildExerciseWhere(user?.gymId ?? 'city', sessionType);
  const exercises = await prisma.exercise.findMany({ where, orderBy: { name: 'asc' } });
  return res.json(exercises);
});

export default router;
