import { setSchema, submitWorkoutSchema } from '../utils/workoutSchemas';

describe('setSchema', () => {
  it('accepts a strength set with weight and reps', () => {
    expect(setSchema.safeParse({ setNumber: 1, weightKg: 60, reps: 10 }).success).toBe(true);
  });

  it('accepts a cardio set with minutes', () => {
    expect(setSchema.safeParse({ setNumber: 1, minutes: 30 }).success).toBe(true);
  });

  it('keeps the minutes of a cardio set', () => {
    const parsed = setSchema.parse({ setNumber: 2, minutes: 25 });
    expect(parsed).toEqual({ setNumber: 2, minutes: 25 });
  });

  it('rejects a cardio set with zero minutes', () => {
    expect(setSchema.safeParse({ setNumber: 1, minutes: 0 }).success).toBe(false);
  });

  it('rejects a cardio set with negative minutes', () => {
    expect(setSchema.safeParse({ setNumber: 1, minutes: -5 }).success).toBe(false);
  });

  it('rejects partial minutes', () => {
    expect(setSchema.safeParse({ setNumber: 1, minutes: 12.5 }).success).toBe(false);
  });

  it('accepts up to 600 minutes and rejects more', () => {
    expect(setSchema.safeParse({ setNumber: 1, minutes: 600 }).success).toBe(true);
    expect(setSchema.safeParse({ setNumber: 1, minutes: 601 }).success).toBe(false);
  });

  it('rejects a set that has neither minutes nor weight and reps', () => {
    expect(setSchema.safeParse({ setNumber: 1 }).success).toBe(false);
  });

  it('rejects a set that mixes minutes with weight and reps', () => {
    expect(setSchema.safeParse({ setNumber: 1, weightKg: 60, reps: 10, minutes: 30 }).success).toBe(false);
  });

  it('still limits strength sets to 50 reps and 250 kg', () => {
    expect(setSchema.safeParse({ setNumber: 1, weightKg: 60, reps: 51 }).success).toBe(false);
    expect(setSchema.safeParse({ setNumber: 1, weightKg: 251, reps: 10 }).success).toBe(false);
  });
});

describe('submitWorkoutSchema', () => {
  const base = {
    type: 'FULL_BODY',
    startedAt: '2026-11-04T10:00:00.000Z',
    endedAt: '2026-11-04T11:00:00.000Z',
  };
  const entry = (sets: unknown[]) => ({
    exerciseId: 'ckxxxxxxxxxxxxxxxxxxxxxxx',
    orderIndex: 0,
    startedAt: '2026-11-04T10:00:00.000Z',
    sets,
  });

  it('accepts a workout that mixes a strength exercise and a cardio exercise', () => {
    const body = {
      ...base,
      exercises: [
        entry([{ setNumber: 1, weightKg: 40, reps: 8 }]),
        { ...entry([{ setNumber: 1, minutes: 20 }]), orderIndex: 1 },
      ],
    };
    expect(submitWorkoutSchema.safeParse(body).success).toBe(true);
  });

  it('rejects a workout with an invalid cardio set', () => {
    const body = { ...base, exercises: [entry([{ setNumber: 1, minutes: 0 }])] };
    expect(submitWorkoutSchema.safeParse(body).success).toBe(false);
  });
});
