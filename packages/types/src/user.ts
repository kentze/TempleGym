export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  heightCm: number | null;
  weightKg: number | null;
  preferMetric: boolean;
  leaderboardAnonymous: boolean;
  totalPoints: number;
  weeklyPoints: number;
  createdAt: string;
}

export interface UpdateProfileBody {
  displayName?: string;
  heightCm?: number;
  weightKg?: number;
  preferMetric?: boolean;
  leaderboardAnonymous?: boolean;
}
