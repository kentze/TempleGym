export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  weeklyScore: number;
}

export interface LeaderboardResponse {
  week: string;
  resetAt: string;
  entries: LeaderboardEntry[];
  myRank: { rank: number; weeklyScore: number } | null;
}
