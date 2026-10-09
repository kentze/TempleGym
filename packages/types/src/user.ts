export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  gymId: string;
  heightCm: number | null;
  weightKg: number | null;
  gpsEnabled: boolean;
  preferMetric: boolean;
  leaderboardAnonymous: boolean;
  createdAt: string;
}

export interface UpdateProfileBody {
  displayName?: string;
  heightCm?: number;
  weightKg?: number;
  gpsEnabled?: boolean;
  preferMetric?: boolean;
  leaderboardAnonymous?: boolean;
}
