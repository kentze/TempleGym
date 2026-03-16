import { prisma } from '../utils/prisma';

export interface LeaderboardRow {
  rank: number;
  userId: string;
  displayName: string | null;
  weeklyScore: number;
}

type RawRow = {
  rank: bigint;
  user_id: string;
  display_name: string | null;
  weekly_score: bigint;
};

export async function getWeeklyLeaderboard(weekLabel: string): Promise<LeaderboardRow[]> {
  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT
      RANK() OVER (ORDER BY SUM(ws."pointsEarned") DESC)::int AS rank,
      u.id          AS user_id,
      u."displayName" AS display_name,
      SUM(ws."pointsEarned")::int AS weekly_score
    FROM "User" u
    JOIN "WorkoutSession" ws ON ws."userId" = u.id
    WHERE ws."weekLabel" = ${weekLabel}
    GROUP BY u.id, u."displayName"
    ORDER BY weekly_score DESC
    LIMIT 100
  `;

  return rows.map((r: RawRow) => ({
    rank:        Number(r.rank),
    userId:      r.user_id,
    displayName: r.display_name,
    weeklyScore: Number(r.weekly_score),
  }));
}
