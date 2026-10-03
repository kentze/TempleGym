import { computePoints, computeVolumeScore } from '../services/points.service';

describe('computePoints', () => {
  it('returns the base score when there is no duration, volume, or GPS', () => {
    expect(computePoints({ durationMinutes: 0, volumeScore: 0, gpsVerified: false })).toBe(50);
  });

  it('adds a duration bonus in 10-point increments per 10 minutes', () => {
    expect(computePoints({ durationMinutes: 30, volumeScore: 0, gpsVerified: false })).toBe(80);
  });

  it('caps the duration bonus at 150', () => {
    expect(computePoints({ durationMinutes: 200, volumeScore: 0, gpsVerified: false })).toBe(200);
    expect(computePoints({ durationMinutes: 150, volumeScore: 0, gpsVerified: false })).toBe(200);
    expect(computePoints({ durationMinutes: 151, volumeScore: 0, gpsVerified: false })).toBe(200);
  });

  it('adds a volume bonus of 5 points per 1000 kg lifted', () => {
    expect(computePoints({ durationMinutes: 0, volumeScore: 5000, gpsVerified: false })).toBe(75);
  });

  it('truncates partial 1000-kg volume increments', () => {
    expect(computePoints({ durationMinutes: 0, volumeScore: 1999, gpsVerified: false })).toBe(55);
  });

  it('adds 25 points when GPS is verified', () => {
    expect(computePoints({ durationMinutes: 0, volumeScore: 0, gpsVerified: true })).toBe(75);
  });

  it('computes the correct total for a typical session', () => {
    // 30 min (30) + 5000 volume (25) + GPS (25) + base (50) = 130
    expect(computePoints({ durationMinutes: 30, volumeScore: 5000, gpsVerified: true })).toBe(130);
  });
});

describe('computeVolumeScore', () => {
  it('returns 0 for an empty exercise list', () => {
    expect(computeVolumeScore([])).toBe(0);
  });

  it('returns 0 for exercises with no sets', () => {
    expect(computeVolumeScore([{ sets: [] }])).toBe(0);
  });

  it('sums weightKg * reps across all sets and exercises', () => {
    const exercises = [
      { sets: [{ setNumber: 1, weightKg: 60, reps: 10 }] },
      { sets: [{ setNumber: 1, weightKg: 80, reps: 5 }, { setNumber: 2, weightKg: 80, reps: 5 }] },
    ];
    // 60*10 + 80*5 + 80*5 = 600 + 400 + 400 = 1400
    expect(computeVolumeScore(exercises)).toBe(1400);
  });
});
