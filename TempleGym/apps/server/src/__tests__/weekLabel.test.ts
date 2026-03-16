import { getWeekLabel } from '../utils/weekLabel';

describe('getWeekLabel', () => {
  it('returns the correct week label for a normal Monday in JST', () => {
    // 2026-03-16T00:00:00Z = 2026-03-16T09:00:00+09:00 (Monday, week 12)
    expect(getWeekLabel(new Date('2026-03-16T00:00:00Z'))).toBe('2026-W12');
  });

  it('returns the correct week label for a Sunday in JST', () => {
    // 2026-03-15T00:00:00Z = 2026-03-15T09:00:00+09:00 (Sunday, still week 11)
    expect(getWeekLabel(new Date('2026-03-15T00:00:00Z'))).toBe('2026-W11');
  });

  it('handles a UTC timestamp that is already Monday in JST but Sunday in UTC', () => {
    // 2026-03-15T15:00:00Z = 2026-03-16T00:00:00+09:00 (Monday JST, week 12)
    expect(getWeekLabel(new Date('2026-03-15T15:00:00Z'))).toBe('2026-W12');
  });

  it('assigns the correct year-crossing ISO week when Dec rolls into the next year', () => {
    // 2023-12-31T15:00:00Z = 2024-01-01T00:00:00+09:00 (Monday Jan 1, 2024 = week 1 of 2024)
    expect(getWeekLabel(new Date('2023-12-31T15:00:00Z'))).toBe('2024-W01');
  });

  it('pads single-digit week numbers with a leading zero', () => {
    // 2026-01-05T00:00:00Z = 2026-01-05T09:00:00+09:00 (Monday, week 2)
    expect(getWeekLabel(new Date('2026-01-05T00:00:00Z'))).toBe('2026-W02');
  });
});
