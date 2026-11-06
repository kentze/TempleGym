import { buildGymExercises, GYM_WORKOUT_CATALOG, SIMPLE_EXERCISES } from '../data/gymWorkouts';

describe('buildGymExercises', () => {
  const exercises = buildGymExercises();
  const find = (name: string) => exercises.find((e) => e.name === name);

  it('lists each exercise once even when both gyms have it', () => {
    const names = exercises.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('tags an exercise found at both gyms with both gyms', () => {
    expect(find('Bench Press')?.gyms).toEqual(['city', 'hillside']);
  });

  it('tags a Hillside-only machine with Hillside only', () => {
    expect(find('Smith machine bench press')?.gyms).toEqual(['hillside']);
  });

  it('puts chest, shoulder and tricep exercises in PUSH, back in PULL and legs in LEGS', () => {
    expect(find('Bench Press')?.category).toBe('PUSH');
    expect(find('Cable Lateral Raise')?.category).toBe('PUSH');
    expect(find('Skull crushers')?.category).toBe('PUSH');
    expect(find('Face Pulls')?.category).toBe('PULL');
    expect(find('Leg Press')?.category).toBe('LEGS');
  });

  it('uses the muscle group as the exercise muscle group, with Tricep written as Triceps', () => {
    expect(find('Bench Press')?.muscleGroups).toEqual(['Chest']);
    expect(find('Skull crushers')?.muscleGroups).toEqual(['Triceps']);
  });

  it('includes every exercise from every gym list', () => {
    const names = new Set(exercises.map((e) => e.name));
    for (const items of Object.values(GYM_WORKOUT_CATALOG)) {
      for (const item of items) expect(names.has(item.name)).toBe(true);
    }
  });
});

describe('SIMPLE_EXERCISES', () => {
  it('is Upper Body in PUSH, Lower Body in LEGS and Cardio in CARDIO, and nothing else', () => {
    expect(SIMPLE_EXERCISES.map((e) => [e.name, e.category])).toEqual([
      ['Upper Body', 'PUSH'],
      ['Lower Body', 'LEGS'],
      ['Cardio', 'CARDIO'],
    ]);
  });

  it('never shares a name with a gym exercise, so the seed cannot overwrite one', () => {
    const gymNames = new Set(buildGymExercises().map((e) => e.name));
    for (const ex of SIMPLE_EXERCISES) expect(gymNames.has(ex.name)).toBe(false);
  });
});
