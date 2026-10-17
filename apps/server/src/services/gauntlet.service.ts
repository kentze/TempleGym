import type { RankedGauntletEntry } from '@templegym/types';

interface GauntletEntryInput {
    userId: string;
    username: string;
    weightKg: number | null;
    reps: number;
    submittedAt: Date;
}

export interface GauntletRules {
    minReps: number;
    requiresWeight: boolean;
}

// Sanity limits that apply to every cycle, whatever its rules say.
const MAX_WEIGHT_KG = 500;
const MAX_REPS = 200;

// Same display rule as the weekly leaderboard: never expose the full email.
export function formatGauntletUsername(user: { email: string; leaderboardAnonymous: boolean }): string {
    if (user.leaderboardAnonymous) {
        return 'Anonymous';
    }

    return user.email.replace('@temple.edu', '');
}

// Returns a message for the student, or null when the entry follows the rules.
export function validateGauntletEntry(rules: GauntletRules, weightKg: number | undefined, reps: number): string | null {
    if (rules.requiresWeight) {
        if (weightKg === undefined || Number.isNaN(weightKg) || weightKg <= 0 || weightKg > MAX_WEIGHT_KG) {
            return 'Enter a valid weight.';
        }
    }

    if (!Number.isInteger(reps)) {
        return 'Reps must be a whole number.';
    }

    if (reps < rules.minReps) {
        return `Reps must be at least ${rules.minReps}.`;
    }

    if (reps > MAX_REPS) {
        return `Reps must be ${MAX_REPS} or fewer.`;
    }

    return null;
}

function compareEntries(a: GauntletEntryInput, b: GauntletEntryInput): number {
    // No weight (a reps-only cycle) counts as 0, so reps decide the order.
    const weightA = a.weightKg ?? 0;
    const weightB = b.weightKg ?? 0;

    if (weightA != weightB)
        return weightB - weightA;

    if (b.reps != a.reps)
        return b.reps - a.reps;

    // Same weight and reps: whoever lifted it first wins.
    return a.submittedAt.getTime() - b.submittedAt.getTime();
}

// Takes the top of an already ranked board. If the user is ranked below that,
// also returns their own row, so they can still see where they stand.
export function splitTopEntries(
    ranked: RankedGauntletEntry[],
    userId: string,
    topCount: number
): { top: RankedGauntletEntry[]; myRank: RankedGauntletEntry | null } {
    const top = ranked.slice(0, topCount);
    let myRank: RankedGauntletEntry | null = null;

    for (const entry of ranked) {
        if (entry.userId === userId && entry.rank > topCount) {
            myRank = entry;
        }
    }

    return { top, myRank };
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
