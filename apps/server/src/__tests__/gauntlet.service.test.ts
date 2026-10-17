import { rankGauntletEntries, formatGauntletUsername, validateGauntletEntry, splitTopEntries } from '../services/gauntlet.service';
import type { RankedGauntletEntry } from '@templegym/types';

// Builds a board of ranked entries: rank 1 is user1, rank 2 is user2, and so on.
function buildRankedBoard(size: number): RankedGauntletEntry[] {
    const board: RankedGauntletEntry[] = [];

    for (let rank = 1; rank <= size; rank++) {
        board.push({ rank: rank, userId: `user${rank}`, username: `Name${rank}`, weightKg: 200 - rank, reps: 5 });
    }

    return board;
}

describe('splitTopEntries', () => {
    it('returns everyone and no extra row when there are fewer entries than the limit', () => {
        const result = splitTopEntries(buildRankedBoard(4), 'user3', 10);

        expect(result.top).toHaveLength(4);
        expect(result.myRank).toBeNull();
    });

    it('returns only the top entries when there are more than the limit', () => {
        const result = splitTopEntries(buildRankedBoard(50), 'user1', 10);

        expect(result.top).toHaveLength(10);
        expect(result.top[0].userId).toBe('user1');
        expect(result.top[9].userId).toBe('user10');
    });

    it('gives no extra row when the user is already in the top entries', () => {
        const result = splitTopEntries(buildRankedBoard(50), 'user7', 10);

        expect(result.myRank).toBeNull();
    });

    it('gives no extra row when the user is exactly last in the top entries', () => {
        const result = splitTopEntries(buildRankedBoard(50), 'user10', 10);

        expect(result.myRank).toBeNull();
    });

    it('gives the user\'s own row with their real rank when they are just outside the top entries', () => {
        const result = splitTopEntries(buildRankedBoard(50), 'user11', 10);

        expect(result.top).toHaveLength(10);
        expect(result.myRank).not.toBeNull();
        expect(result.myRank!.rank).toBe(11);
        expect(result.myRank!.userId).toBe('user11');
    });

    it('gives the user\'s own row when they are 22nd out of 50', () => {
        const result = splitTopEntries(buildRankedBoard(50), 'user22', 10);

        expect(result.top).toHaveLength(10);
        expect(result.myRank!.rank).toBe(22);
        expect(result.myRank!.username).toBe('Name22');
    });

    it('works with a limit of 5, showing the 6th place user as their own row', () => {
        const result = splitTopEntries(buildRankedBoard(20), 'user6', 5);

        expect(result.top).toHaveLength(5);
        expect(result.top[4].userId).toBe('user5');
        expect(result.myRank!.rank).toBe(6);
    });

    it('gives no extra row when the user has no entry', () => {
        const result = splitTopEntries(buildRankedBoard(50), 'someone-who-never-entered', 10);

        expect(result.top).toHaveLength(10);
        expect(result.myRank).toBeNull();
    });

    it('returns nothing for an empty board', () => {
        const result = splitTopEntries([], 'user1', 10);

        expect(result.top).toEqual([]);
        expect(result.myRank).toBeNull();
    });
});

describe('formatGauntletUsername', () => {
    it('shows the Temple username without the email domain', () => {
        const name = formatGauntletUsername({ email: 'tua11111@temple.edu', leaderboardAnonymous: false });

        expect(name).toBe('tua11111');
    });

    it('shows Anonymous when the user opted out of the leaderboard', () => {
        const name = formatGauntletUsername({ email: 'tua11111@temple.edu', leaderboardAnonymous: true });

        expect(name).toBe('Anonymous');
    });

    it('never exposes the full email address', () => {
        const name = formatGauntletUsername({ email: 'tua11111@temple.edu', leaderboardAnonymous: false });

        expect(name).not.toContain('@');
    });
});

describe('rankGauntletEntries', () => {
    it('ranks a single entry as rank 1', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 8, submittedAt: new Date('2026-11-02T10:00:00Z') },
        ]);

        expect(result).toEqual([
            { rank: 1, userId: 'u1', username: 'Alice', weightKg: 90, reps: 8 },
        ]);
    });

    it('ranks higher weight above lower weight', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 80, reps: 10, submittedAt: new Date('2026-11-02T10:00:00Z') },
            { userId: 'u2', username: 'Bob', weightKg: 90, reps: 5, submittedAt: new Date('2026-11-02T10:00:00Z') },
        ]);

        expect(result[0].userId).toBe('u2');
        expect(result[1].userId).toBe('u1');
    });

    it('breaks a weight tie using higher reps', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10, submittedAt: new Date('2026-11-02T10:00:00Z') },
            { userId: 'u2', username: 'Bob', weightKg: 90, reps: 11, submittedAt: new Date('2026-11-09T10:00:00Z') },
        ]);

        expect(result[0].userId).toBe('u2');
        expect(result[0].reps).toBe(11);
        expect(result[1].userId).toBe('u1');
    });

    it('breaks a weight and reps tie using the earlier submission', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10, submittedAt: new Date('2026-11-09T10:00:00Z') },
            { userId: 'u2', username: 'Bob', weightKg: 90, reps: 10, submittedAt: new Date('2026-11-02T10:00:00Z') },
        ]);

        expect(result[0].userId).toBe('u2');
        expect(result[1].userId).toBe('u1');
    });

    it('gives the same order when the entries are passed in the other order', () => {
        const result = rankGauntletEntries([
            { userId: 'u2', username: 'Bob', weightKg: 90, reps: 10, submittedAt: new Date('2026-11-09T10:00:00Z') },
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10, submittedAt: new Date('2026-11-02T10:00:00Z') },
        ]);

        expect(result[0].userId).toBe('u1');
        expect(result[1].userId).toBe('u2');
    });

    it('does not let a later identical lift outrank an earlier one', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10, submittedAt: new Date('2026-11-02T10:00:00Z') },
            { userId: 'u2', username: 'Bob', weightKg: 100, reps: 5, submittedAt: new Date('2026-11-02T10:00:00Z') },
            { userId: 'u3', username: 'Cara', weightKg: 90, reps: 10, submittedAt: new Date('2026-11-09T10:00:00Z') },
        ]);

        expect(result[0].userId).toBe('u2');
        expect(result[1].userId).toBe('u1');
        expect(result[2].userId).toBe('u3');
        expect(result[2].rank).toBe(3);
    });

    it('uses each user\'s single best entry when they have multiple', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 80, reps: 10, submittedAt: new Date('2026-11-02T10:00:00Z') },
            { userId: 'u1', username: 'Alice', weightKg: 100, reps: 5, submittedAt: new Date('2026-11-02T10:00:00Z') },
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 8, submittedAt: new Date('2026-11-02T10:00:00Z') },
        ]);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ rank: 1, userId: 'u1', username: 'Alice', weightKg: 100, reps: 5 });
    });

    it('counts a user\'s earliest submission when they repeat the same lift', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10, submittedAt: new Date('2026-11-09T10:00:00Z') },
            { userId: 'u2', username: 'Bob', weightKg: 90, reps: 10, submittedAt: new Date('2026-11-05T10:00:00Z') },
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10, submittedAt: new Date('2026-11-02T10:00:00Z') },
        ]);

        // Alice's earliest identical lift is before Bob's, so she stays first.
        expect(result[0].userId).toBe('u1');
        expect(result[1].userId).toBe('u2');
    });

    it('ranks more reps first when nobody has a weight', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: null, reps: 12, submittedAt: new Date('2027-01-02T10:00:00Z') },
            { userId: 'u2', username: 'Bob', weightKg: null, reps: 20, submittedAt: new Date('2027-01-09T10:00:00Z') },
        ]);

        expect(result[0].userId).toBe('u2');
        expect(result[1].userId).toBe('u1');
    });

    it('breaks a reps-only tie using the earlier submission', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: null, reps: 15, submittedAt: new Date('2027-01-09T10:00:00Z') },
            { userId: 'u2', username: 'Bob', weightKg: null, reps: 15, submittedAt: new Date('2027-01-02T10:00:00Z') },
        ]);

        expect(result[0].userId).toBe('u2');
        expect(result[1].userId).toBe('u1');
    });

    it('keeps the weight as null in a reps-only result and uses the best reps', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: null, reps: 8, submittedAt: new Date('2027-01-02T10:00:00Z') },
            { userId: 'u1', username: 'Alice', weightKg: null, reps: 14, submittedAt: new Date('2027-01-03T10:00:00Z') },
        ]);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ rank: 1, userId: 'u1', username: 'Alice', weightKg: null, reps: 14 });
    });

    it('ranks an entry with no weight below any entry that has a weight', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: null, reps: 30, submittedAt: new Date('2026-11-02T10:00:00Z') },
            { userId: 'u2', username: 'Bob', weightKg: 20, reps: 4, submittedAt: new Date('2026-11-02T10:00:00Z') },
        ]);

        expect(result[0].userId).toBe('u2');
        expect(result[1].userId).toBe('u1');
    });

    it('returns an empty array for no entries', () => {
        expect(rankGauntletEntries([])).toEqual([]);
    });
});

describe('validateGauntletEntry with bench press rules', () => {
    it('accepts the minimum number of reps', () => {
        const error = validateGauntletEntry({ minReps: 4, requiresWeight: true }, 100, 4);

        expect(error).toBeNull();
    });

    it('accepts a large number of reps because there is no maximum', () => {
        const error = validateGauntletEntry({ minReps: 4, requiresWeight: true }, 100, 30);

        expect(error).toBeNull();
    });

    it('rejects reps below the minimum', () => {
        const error = validateGauntletEntry({ minReps: 4, requiresWeight: true }, 100, 3);

        expect(error).toBe('Reps must be at least 4.');
    });

    it('rejects a missing weight', () => {
        const error = validateGauntletEntry({ minReps: 4, requiresWeight: true }, undefined, 5);

        expect(error).toBe('Enter a valid weight.');
    });

    it('rejects a weight of zero', () => {
        const error = validateGauntletEntry({ minReps: 4, requiresWeight: true }, 0, 5);

        expect(error).toBe('Enter a valid weight.');
    });

    it('rejects a negative weight', () => {
        const error = validateGauntletEntry({ minReps: 4, requiresWeight: true }, -20, 5);

        expect(error).toBe('Enter a valid weight.');
    });

    it('rejects a weight over 500', () => {
        const error = validateGauntletEntry({ minReps: 4, requiresWeight: true }, 501, 5);

        expect(error).toBe('Enter a valid weight.');
    });

    it('accepts a weight of exactly 500', () => {
        const error = validateGauntletEntry({ minReps: 4, requiresWeight: true }, 500, 5);

        expect(error).toBeNull();
    });

    it('rejects a weight that is not a number', () => {
        const error = validateGauntletEntry({ minReps: 4, requiresWeight: true }, NaN, 5);

        expect(error).toBe('Enter a valid weight.');
    });

    it('rejects reps that are not a whole number', () => {
        const error = validateGauntletEntry({ minReps: 4, requiresWeight: true }, 100, 4.5);

        expect(error).toBe('Reps must be a whole number.');
    });

    it('rejects reps that are not a number', () => {
        const error = validateGauntletEntry({ minReps: 4, requiresWeight: true }, 100, NaN);

        expect(error).toBe('Reps must be a whole number.');
    });

    it('rejects more than 200 reps', () => {
        const error = validateGauntletEntry({ minReps: 4, requiresWeight: true }, 100, 201);

        expect(error).toBe('Reps must be 200 or fewer.');
    });
});

describe('validateGauntletEntry with pull-up rules', () => {
    it('accepts one rep with no weight', () => {
        const error = validateGauntletEntry({ minReps: 1, requiresWeight: false }, undefined, 1);

        expect(error).toBeNull();
    });

    it('accepts a high number of reps with no weight', () => {
        const error = validateGauntletEntry({ minReps: 1, requiresWeight: false }, undefined, 40);

        expect(error).toBeNull();
    });

    it('ignores a weight sent by an older app version', () => {
        const error = validateGauntletEntry({ minReps: 1, requiresWeight: false }, 9999, 10);

        expect(error).toBeNull();
    });

    it('rejects zero reps', () => {
        const error = validateGauntletEntry({ minReps: 1, requiresWeight: false }, undefined, 0);

        expect(error).toBe('Reps must be at least 1.');
    });

    it('rejects more than 200 reps', () => {
        const error = validateGauntletEntry({ minReps: 1, requiresWeight: false }, undefined, 201);

        expect(error).toBe('Reps must be 200 or fewer.');
    });
});
