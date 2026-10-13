import { rankGauntletEntries, formatGauntletUsername } from '../services/gauntlet.service';

const EARLY = new Date('2026-11-02T10:00:00Z');
const LATE = new Date('2026-11-09T10:00:00Z');

describe('formatGauntletUsername', () => {
    it('shows the Temple username without the email domain', () => {
        expect(formatGauntletUsername({ email: 'tua11111@temple.edu', leaderboardAnonymous: false }))
            .toBe('tua11111');
    });

    it('shows Anonymous when the user opted out of the leaderboard', () => {
        expect(formatGauntletUsername({ email: 'tua11111@temple.edu', leaderboardAnonymous: true }))
            .toBe('Anonymous');
    });

    it('never exposes the full email address', () => {
        const name = formatGauntletUsername({ email: 'tua11111@temple.edu', leaderboardAnonymous: false });
        expect(name).not.toContain('@');
    });
});

describe('rankGauntletEntries', () => {
    it('ranks a single query as rank 1', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 8, submittedAt: EARLY },
        ]);
        expect(result).toEqual([
            { rank: 1, userId: 'u1', username: 'Alice', weightKg: 90, reps: 8 },
        ]);
    });

    it('ranks higher weight above lower weight', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 80, reps: 10, submittedAt: EARLY },
            { userId: 'u2', username: 'Bob', weightKg: 90, reps: 5, submittedAt: EARLY },
        ]);
        expect(result[0].userId).toBe('u2');
        expect(result[1].userId).toBe('u1');
    });

    it('breaks a weight tie using higher reps', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10, submittedAt: EARLY },
            { userId: 'u2', username: 'Bob', weightKg: 90, reps: 11, submittedAt: LATE },
        ]);
        expect(result[0].userId).toBe('u2');
        expect(result[0].reps).toBe(11);
        expect(result[1].userId).toBe('u1');
    });

    it('breaks a weight and reps tie using the earlier submission', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10, submittedAt: LATE },
            { userId: 'u2', username: 'Bob', weightKg: 90, reps: 10, submittedAt: EARLY },
        ]);
        expect(result.map((r) => r.userId)).toEqual(['u2', 'u1']);
    });

    it('gives the same order regardless of the order entries are passed in', () => {
        const alice = { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10, submittedAt: EARLY };
        const bob = { userId: 'u2', username: 'Bob', weightKg: 90, reps: 10, submittedAt: LATE };

        expect(rankGauntletEntries([alice, bob]).map((r) => r.userId)).toEqual(['u1', 'u2']);
        expect(rankGauntletEntries([bob, alice]).map((r) => r.userId)).toEqual(['u1', 'u2']);
    });

    it('does not let a later identical lift outrank an earlier one', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10, submittedAt: EARLY },
            { userId: 'u2', username: 'Bob', weightKg: 100, reps: 5, submittedAt: EARLY },
            { userId: 'u3', username: 'Cara', weightKg: 90, reps: 10, submittedAt: LATE },
        ]);
        expect(result.map((r) => r.userId)).toEqual(['u2', 'u1', 'u3']);
        expect(result.map((r) => r.rank)).toEqual([1, 2, 3]);
    });

    it('uses each user\'s single best entry when they have multiple', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 80, reps: 10, submittedAt: EARLY },
            { userId: 'u1', username: 'Alice', weightKg: 100, reps: 5, submittedAt: EARLY },
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 8, submittedAt: EARLY },
        ]);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ rank: 1, userId: 'u1', username: 'Alice', weightKg: 100, reps: 5 });
    });

    it('counts a user\'s earliest submission when they repeat the same lift', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10, submittedAt: LATE },
            { userId: 'u2', username: 'Bob', weightKg: 90, reps: 10, submittedAt: new Date('2026-11-05T10:00:00Z') },
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10, submittedAt: EARLY },
        ]);
        // Alice's best entry is the EARLY one, which is before Bob's, so she stays first.
        expect(result.map((r) => r.userId)).toEqual(['u1', 'u2']);
    });

    it('returns an empty array for no entries', () => {
        expect(rankGauntletEntries([])).toEqual([]);
    });
});
