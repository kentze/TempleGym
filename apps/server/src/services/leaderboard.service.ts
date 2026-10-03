import { prisma } from '../utils/prisma';

export interface LeaderboardRow {
  rank: number;
  userId: string;
  username: string;
  weeklyScore: number;
}

type RawRow = {
  rank: bigint;
  user_id: string;
  email: string;
  anonymous: boolean;
  weekly_score: bigint;
};

export async function getWeeklyLeaderboard(weekLabel: string): Promise<LeaderboardRow[]> {
  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT
      RANK() OVER (ORDER BY SUM(ws."pointsEarned") DESC)::int AS rank,
      u.id      AS user_id,
      u.email,
      u."leaderboardAnonymous" AS anonymous,
      SUM(ws."pointsEarned")::int AS weekly_score
    FROM "User" u
    JOIN "WorkoutSession" ws ON ws."userId" = u.id
    WHERE ws."weekLabel" = ${weekLabel}
    GROUP BY u.id, u.email, u."leaderboardAnonymous"
    ORDER BY weekly_score DESC
    LIMIT 100
  `;

  return rows.map((r: RawRow) => ({
    rank:        Number(r.rank),
    userId:      r.user_id,
    username:    r.anonymous ? 'Anonymous' : r.email.replace('@temple.edu', ''),
    weeklyScore: Number(r.weekly_score),
  }));
}
