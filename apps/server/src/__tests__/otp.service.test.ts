// Mock config and prisma before importing the service so the module can load
// without a live database or environment variables.
jest.mock('../config', () => ({
  config: {
    OTP_EXPIRY_MINUTES: 10,
    JWT_SECRET: 'super-secret-jwt-test-key-32chars!!',
    JWT_EXPIRES_IN: '7d',
    GYM_LAT: 39.9812,
    GYM_LNG: -75.1502,
    GYM_RADIUS_M: 100,
    PORT: 3000,
    NODE_ENV: 'test',
  },
}));
jest.mock('../utils/prisma', () => ({ prisma: {} }));

import { generateOtp, hashOtp } from '../services/otp.service';

describe('generateOtp', () => {
  it('returns a 6-digit numeric string', () => {
    const code = generateOtp();
    expect(code).toMatch(/^\d{6}$/);
  });

  it('generates a number in the range 100000–999999', () => {
    for (let i = 0; i < 20; i++) {
      const n = Number(generateOtp());
      expect(n).toBeGreaterThanOrEqual(100000);
      expect(n).toBeLessThanOrEqual(999999);
    }
  });

  it('does not return codes shorter than 6 digits', () => {
    for (let i = 0; i < 10; i++) {
      expect(generateOtp().length).toBe(6);
    }
  });
});

describe('hashOtp', () => {
  it('returns a 64-character hex string (SHA-256)', () => {
    expect(hashOtp('123456')).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is deterministic — same input always yields same hash', () => {
    expect(hashOtp('123456')).toBe(hashOtp('123456'));
  });

  it('produces different hashes for different codes', () => {
    expect(hashOtp('123456')).not.toBe(hashOtp('654321'));
  });

  it('hashes an arbitrary string without throwing', () => {
    expect(() => hashOtp('000000')).not.toThrow();
  });
});
