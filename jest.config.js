export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/src/tests/**/*.test.ts'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
};