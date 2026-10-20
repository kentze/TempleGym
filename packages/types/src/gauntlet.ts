export interface GauntletCycleSummary {
  id: string;
  label: string;
  exercise: string;
  startDate: string;
  endDate: string;
  minReps: number;
  requiresWeight: boolean;
}

export interface RankedGauntletEntry {
  rank: number;
  userId: string;
  username: string;
  weightKg: number | null;
  reps: number;
}

export interface GauntletCurrentResponse {
  cycle: GauntletCycleSummary | null;
  entries: RankedGauntletEntry[];
  // The student's own row with their real rank, only when it is below the entries shown.
  myRank: RankedGauntletEntry | null;
  myEntryCount: number;
  maxEntries: number;
}

export interface SubmitGauntletEntryBody {
  weightKg?: number;
  reps: number;
}
