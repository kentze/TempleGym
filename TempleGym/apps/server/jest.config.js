module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@templegym/types$': '<rootDir>/../../packages/types/src/index.ts',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
};
