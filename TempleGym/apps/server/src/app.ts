import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import meRoutes from './routes/me.routes';
import exercisesRoutes from './routes/exercises.routes';
import workoutsRoutes from './routes/workouts.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import { errorHandler } from './middleware/error.middleware';
import { prisma } from './lib/prisma';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get('/health/db', async (_req, res) => {
    try {
      const count = await prisma.user.count();
      res.json({ ok: true, userCount: count });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Database connection failed' });
    }
  });

  const authLimiter = rateLimit({ windowMs: 60_000, max: 5, message: 'Too many requests' });

  app.use('/auth', authLimiter, authRoutes);
  app.use('/me', meRoutes);
  app.use('/exercises', exercisesRoutes);
  app.use('/workouts', workoutsRoutes);
  app.use('/leaderboard', leaderboardRoutes);
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use(errorHandler);
  return app;
}