import { rankGauntletEntries } from '../services/gauntlet.service';

describe('rankGauntletEntries', () => {
    it('ranks a single query as rank 1', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 8},
        ]);
        expect(result).toEqual([
            { rank: 1, userId: 'u1', username: 'Alice', weightKg: 90, reps: 8 },
        ]);
    });

    it('ranks higher weight above lower weight', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 80, reps: 10 },
            { userId: 'u2', username: 'Bob', weightKg: 90, reps: 5 },
        ]);
        expect(result[0].userId).toBe('u2');
        expect(result[1].userId).toBe('u1');
    });

    it('breaks a weight tie using higher reps', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 10 },
            { userId: 'u2', username: 'Bob', weightKg: 90, reps: 11 },
        ]);
        expect(result[0].userId).toBe('u2');
        expect(result[0].reps).toBe(11);
        expect(result[1].userId).toBe('u1');
    });

    it('uses each user\'s single best entry when they have multiple', () => {
        const result = rankGauntletEntries([
            { userId: 'u1', username: 'Alice', weightKg: 80, reps: 10 },
            { userId: 'u1', username: 'Alice', weightKg: 100, reps: 5 },
            { userId: 'u1', username: 'Alice', weightKg: 90, reps: 8 },
        ]);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ rank: 1, userId: 'u1', username: 'Alice', weightKg: 100, reps: 5 });
    });

    it('returns an empty array for no entries', () => {
        expect(rankGauntletEntries([])).toEqual([]);
    });
});
