module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@templegym/types$': '<rootDir>/../../packages/types/src/index.ts',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/services/points.service.ts',
    'src/services/jwt.service.ts',
    'src/services/gps.service.ts',
    'src/services/otp.service.ts',
    'src/utils/haversine.ts',
    'src/utils/weekLabel.ts',
  ],
};
