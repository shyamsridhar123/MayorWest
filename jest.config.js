export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'cli.js',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  testTimeout: 10000,
};
