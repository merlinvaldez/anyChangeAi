// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill fetch for testing environment
global.fetch = jest.fn();

// Setup test environment variables
process.env.NODE_ENV = 'test';
process.env.API_SECRET_KEY = 'test-secret-key';
process.env.NEXT_PUBLIC_APP_NAME = 'AnyChange AI';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.OCR_PROVIDER = 'tesseract';
process.env.MAX_FILE_SIZE = '10485760';
process.env.MAX_PAGES = '10';
process.env.ALLOWED_FILE_TYPES = 'pdf,jpg,jpeg,png';
process.env.DEBUG_LOGGING = 'false';
