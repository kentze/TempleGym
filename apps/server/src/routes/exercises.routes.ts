import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';

const router = Router();

const SESSION_TYPES = ['PUSH', 'PULL', 'LEGS', 'CARDIO', 'FULL_BODY'] as const;
type SessionType = typeof SESSION_TYPES[number];

// GET /exercises?sessionType=PUSH|PULL|LEGS|CARDIO|FULL_BODY
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { sessionType } = req.query;
  let where = {};
  if (SESSION_TYPES.includes(sessionType as SessionType)) {
    where = sessionType === 'FULL_BODY'
      ? { category: { in: ['PUSH', 'PULL', 'FULL_BODY'] } }
      : { category: sessionType as SessionType };
  }
  const exercises = await prisma.exercise.findMany({ where, orderBy: { name: 'asc' } });
  return res.json(exercises);
});

export default router;
