import type { RankedGauntletEntry } from '@templegym/types';

interface GauntletEntryInput {
    userId: string;
    username: string;
    weightKg: number;
    reps: number;
}

function compareEntries(a: GauntletEntryInput, b: GauntletEntryInput): number {
    if (b.weightKg != a.weightKg)
        return b.weightKg - a.weightKg;

    return b.reps - a.reps;
}

export function rankGauntletEntries(entries: GauntletEntryInput[]): RankedGauntletEntry[] {
    const bestByUser = new Map<string, GauntletEntryInput>();

    for (const entry of entries) {
        const current = bestByUser.get(entry.userId);

        if (!current || compareEntries(entry, current) < 0) {
            bestByUser.set(entry.userId, entry);
        }
    }

    const sorted = [...bestByUser.values()].sort(compareEntries);

    return sorted.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.username,
        weightKg: entry.weightKg,
        reps: entry.reps,
    }));
}