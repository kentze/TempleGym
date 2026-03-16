import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';

const router = Router();

// GET /exercises?sessionType=PUSH|PULL
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { sessionType } = req.query;
  const where = sessionType === 'PUSH' || sessionType === 'PULL'
    ? { category: sessionType as 'PUSH' | 'PULL' }
    : {};
  const exercises = await prisma.exercise.findMany({ where, orderBy: { name: 'asc' } });
  return res.json(exercises);
});

export default router;
