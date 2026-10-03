jest.mock('../config', () => ({
  config: {
    JWT_SECRET: 'super-secret-jwt-test-key-32chars!!',
    JWT_EXPIRES_IN: '7d',
    OTP_EXPIRY_MINUTES: 10,
    GYM_LAT: 39.9812,
    GYM_LNG: -75.1502,
    GYM_RADIUS_M: 100,
    PORT: 3000,
    NODE_ENV: 'test',
  },
}));

import { signToken, verifyToken } from '../services/jwt.service';

const SAMPLE_PAYLOAD = { userId: 'user-abc-123', email: 'tu12345@temple.edu' };

describe('signToken', () => {
  it('returns a non-empty JWT string', () => {
    const token = signToken(SAMPLE_PAYLOAD);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('produces a three-part JWT (header.payload.signature)', () => {
    const token = signToken(SAMPLE_PAYLOAD);
    expect(token.split('.')).toHaveLength(3);
  });
});

describe('verifyToken', () => {
  it('round-trips userId and email from the payload', () => {
    const token   = signToken(SAMPLE_PAYLOAD);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(SAMPLE_PAYLOAD.userId);
    expect(decoded.email).toBe(SAMPLE_PAYLOAD.email);
  });

  it('throws on a token signed with a different secret', () => {
    // Manually forge a token with a different secret
    const jwt = require('jsonwebtoken');
    const badToken = jwt.sign(SAMPLE_PAYLOAD, 'wrong-secret-entirely');
    expect(() => verifyToken(badToken)).toThrow();
  });

  it('throws on a structurally invalid token string', () => {
    expect(() => verifyToken('not.a.valid.token')).toThrow();
  });

  it('throws on an empty string', () => {
    expect(() => verifyToken('')).toThrow();
  });
});
