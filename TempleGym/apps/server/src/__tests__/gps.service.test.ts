// Gym configured to Temple University IBC (Independence Blue Cross) Athletic Complex
// 39.9812, -75.1502 — radius 100m
jest.mock('../config', () => ({
  config: {
    GYM_LAT: 39.9812,
    GYM_LNG: -75.1502,
    GYM_RADIUS_M: 100,
    JWT_SECRET: 'super-secret-jwt-test-key-32chars!!',
    JWT_EXPIRES_IN: '7d',
    OTP_EXPIRY_MINUTES: 10,
    PORT: 3000,
    NODE_ENV: 'test',
  },
}));

import { isAtGym } from '../services/gps.service';

describe('isAtGym', () => {
  it('returns true when the user is at exactly the gym coordinates', () => {
    expect(isAtGym(39.9812, -75.1502)).toBe(true);
  });

  it('returns true when the user is within the 100m radius', () => {
    // ~50m north of the gym centre
    expect(isAtGym(39.9817, -75.1502)).toBe(true);
  });

  it('returns false when the user is just outside the 100m radius', () => {
    // ~200m north
    expect(isAtGym(39.9830, -75.1502)).toBe(false);
  });

  it('returns false when the user is on the opposite side of campus', () => {
    // ~1km away — Bell Tower area
    expect(isAtGym(39.9762, -75.1555)).toBe(false);
  });

  it('returns false for coordinates in a completely different city', () => {
    expect(isAtGym(40.7128, -74.0060)).toBe(false); // New York City
  });
});
