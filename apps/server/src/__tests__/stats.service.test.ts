import { bestSetPerExercise } from '../services/stats.service';

const day1 = new Date('2026-11-01T10:00:00Z');
const day2 = new Date('2026-11-02T10:00:00Z');

const row = (exerciseId: string, sets: unknown[], startedAt = day1) => ({
  exerciseId,
  exercise: { id: exerciseId, name: exerciseId },
  session: { startedAt },
  sets,
});

describe('bestSetPerExercise', () => {
  it('returns nothing when there are no workouts', () => {
    expect(bestSetPerExercise([])).toEqual([]);
  });

  it('keeps the heaviest set of an exercise', () => {
    const result = bestSetPerExercise([
      row('bench', [
        { setNumber: 1, weightKg: 60, reps: 10 },
        { setNumber: 2, weightKg: 80, reps: 5 },
        { setNumber: 3, weightKg: 70, reps: 8 },
      ]),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ bestWeightKg: 80, bestReps: 5, achievedAt: day1 });
  });

  it('compares across workouts and reports when the best set was lifted', () => {
    const result = bestSetPerExercise([
      row('bench', [{ setNumber: 1, weightKg: 60, reps: 10 }], day1),
      row('bench', [{ setNumber: 1, weightKg: 90, reps: 3 }], day2),
    ]);
    expect(result[0]).toMatchObject({ bestWeightKg: 90, bestReps: 3, achievedAt: day2 });
  });

  it('gives each exercise its own best set', () => {
    const result = bestSetPerExercise([
      row('bench', [{ setNumber: 1, weightKg: 80, reps: 5 }]),
      row('squat', [{ setNumber: 1, weightKg: 120, reps: 5 }]),
    ]);
    expect(result.map((r) => r.bestWeightKg).sort((a, b) => a - b)).toEqual([80, 120]);
  });

  it('skips cardio sets, which have minutes and no weight', () => {
    const result = bestSetPerExercise([
      row('cardio', [{ setNumber: 1, minutes: 30 }]),
      row('bench', [{ setNumber: 1, weightKg: 60, reps: 10 }]),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ bestWeightKg: 60 });
  });

  it('never reports a record without a weight', () => {
    const result = bestSetPerExercise([
      row('cardio', [{ setNumber: 1, minutes: 30 }, { setNumber: 2, minutes: 10 }]),
    ]);
    for (const r of result) expect(Number.isFinite(r.bestWeightKg)).toBe(true);
    expect(result).toEqual([]);
  });

  it('ignores the cardio sets of an exercise that also has strength sets', () => {
    const result = bestSetPerExercise([
      row('mixed', [{ setNumber: 1, minutes: 30 }, { setNumber: 2, weightKg: 50, reps: 12 }]),
    ]);
    expect(result[0]).toMatchObject({ bestWeightKg: 50, bestReps: 12 });
  });
});
