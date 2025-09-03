// Mock for pdfjs-dist library used in tests
// This mock simulates the PDF.js library behavior for testing

const mockPage = {
  getViewport: jest.fn(() => ({ width: 200, height: 300 })),
  render: jest.fn(() => ({
    promise: Promise.resolve(),
  })),
};

const mockDocument = {
  numPages: 1,
  getPage: jest.fn(() => Promise.resolve(mockPage)),
  destroy: jest.fn(),
};

const getDocument = jest.fn(() => ({
  promise: Promise.resolve(mockDocument),
}));

// Export the mock API
module.exports = {
  getDocument,
  GlobalWorkerOptions: {
    workerSrc: 'mock-worker.js',
  },
  // For CommonJS compatibility
  default: {
    getDocument,
    GlobalWorkerOptions: {
      workerSrc: 'mock-worker.js',
    },
  },
};
