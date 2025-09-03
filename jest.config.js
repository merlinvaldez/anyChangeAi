/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
  collectCoverageFrom: ['src/**/*.(js|jsx|ts|tsx)', '!src/**/*.d.ts'],
  // Handle ES modules that Jest can't transform by default
  transformIgnorePatterns: ['node_modules/(?!(pdfjs-dist)/)'],
  // Mock modules that cause issues in test environment
  moduleNameMapper: {
    '^pdfjs-dist$': '<rootDir>/__mocks__/pdfjs-dist.js',
    '^pdfjs-dist/(.*)$': '<rootDir>/__mocks__/pdfjs-dist.js',
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
