// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill fetch for testing environment
global.fetch = jest.fn(url => {
  // Mock API responses based on URL
  if (url.includes('/api/status')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          limits: {
            maxFileSize: '50MB',
            maxPages: 1,
            allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
          },
        }),
    });
  }

  if (url.includes('/api/health')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'healthy',
          message: 'API is running normally',
          version: '1.0.0',
          environment: 'test',
          system: {
            platform: 'test-platform',
            nodeVersion: '18.0.0',
            memory: {
              used: 50,
            },
          },
          uptime: 3600,
          timestamp: new Date().toISOString(),
        }),
    });
  }

  // Default mock for other requests
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

// Mock URL.createObjectURL for testing environment
Object.defineProperty(global.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'data:image/png;base64,mock-data'),
});

Object.defineProperty(global.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock HTMLCanvasElement for PDF rendering
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 10 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}));

global.HTMLCanvasElement.prototype.toDataURL = jest.fn(
  () => 'data:image/png;base64,test'
);

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
