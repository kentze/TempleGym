import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getWeeklyLeaderboard } from '../services/leaderboard.service';
import { getWeekLabel, getNextResetTimestamp } from '../utils/weekLabel';

const router = Router();

// GET /leaderboard/weekly?week=2026-W11
router.get('/weekly', requireAuth, async (req: Request, res: Response) => {
  const week    = (req.query.week as string) || getWeekLabel();
  const allEntries = await getWeeklyLeaderboard(week);
  const myEntry    = allEntries.find((e) => e.userId === req.user!.id) ?? null;
  const myRank     = myEntry ? { rank: myEntry.rank, weeklyScore: myEntry.weeklyScore } : null;
  const entries    = allEntries.slice(0, 20);

  return res.json({
    week,
    resetAt: getNextResetTimestamp().toISOString(),
    entries,
    myRank,
  });
});

export default router;
