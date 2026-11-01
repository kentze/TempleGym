import { buildExerciseWhere } from '../services/exercises.service';

describe('buildExerciseWhere', () => {
  it('only returns exercises available at the given gym', () => {
    expect(buildExerciseWhere('hillside')).toEqual({ gyms: { has: 'hillside' } });
  });

  it('falls back to the City gym when the gym is unknown', () => {
    expect(buildExerciseWhere('nowhere')).toEqual({ gyms: { has: 'city' } });
  });

  it('narrows to one session type when it is valid', () => {
    expect(buildExerciseWhere('city', 'PULL')).toEqual({
      gyms: { has: 'city' },
      category: 'PULL',
    });
  });

  it('includes push, pull and full body exercises for a full body session', () => {
    expect(buildExerciseWhere('city', 'FULL_BODY')).toEqual({
      gyms: { has: 'city' },
      category: { in: ['PUSH', 'PULL', 'FULL_BODY'] },
    });
  });

  it('ignores a session type it does not know', () => {
    expect(buildExerciseWhere('city', 'YOGA')).toEqual({ gyms: { has: 'city' } });
  });
});
