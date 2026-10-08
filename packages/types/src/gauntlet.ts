export interface GauntletCycleSummary {
  id: string;
  label: string;
  exercise: string;
  startDate: string;
  endDate: string;
}

export interface RankedGauntletEntry {
  rank: number;
  userId: string;
  username: string;
  weightKg: number;
  reps: number;
}

export interface GauntletCurrentResponse {
  cycle: GauntletCycleSummary | null;
  entries: RankedGauntletEntry[];
}

export interface SubmitGauntletEntryBody {
  weightKg: number;
  reps: number;
}