export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  heightCm: number | null;
  weightKg: number | null;
  gpsEnabled: boolean;
  preferMetric: boolean;
  leaderboardAnonymous: boolean;
  totalPoints: number;
  weeklyPoints: number;
  createdAt: string;
  daysThisWeek: number;
  weekStreak: number;
  weeklyGoal: number;
}

export interface UpdateProfileBody {
  displayName?: string;
  heightCm?: number;
  weightKg?: number;
  weeklyGoal?: number;
  gpsEnabled?: boolean;
  preferMetric?: boolean;
  leaderboardAnonymous?: boolean;
}
