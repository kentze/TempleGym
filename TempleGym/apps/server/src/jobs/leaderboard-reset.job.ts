import cron from 'node-cron';
import { prisma } from '../utils/prisma';

export function startLeaderboardResetJob() {
  // Every Sunday at 23:59 JST
  cron.schedule('59 23 * * 0', async () => {
    console.log('[cron] Resetting weekly points...');
    const result = await prisma.user.updateMany({ data: { weeklyPoints: 0 } });
    console.log(`[cron] Reset weekly points for ${result.count} users.`);
  }, { timezone: 'Asia/Tokyo' });

  console.log('[cron] Leaderboard reset job scheduled (Sunday 23:59 JST).');
}
