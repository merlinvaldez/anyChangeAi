/**
 * Tests for the Health API endpoint
 * This ensures our API is working correctly and returns the expected data
 */

import { GET } from '../route';

// Mock the global Response object for Jest testing environment
const mockResponse = (data: unknown, status = 200) => ({
  status,
  json: () => Promise.resolve(data),
});

global.Response = {
  json: (data: unknown) => mockResponse(data),
} as typeof Response;

describe('/api/health', () => {
  it('should return health status with ok status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.message).toBe('AnyChange AI is healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.environment).toBeDefined();
    expect(data.version).toBe('0.1.0');
    expect(data.service).toBe('anychange-ai-api');
  });

  it('should include system information', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.system).toBeDefined();
    expect(data.system.platform).toBeDefined();
    expect(data.system.nodeVersion).toBeDefined();
    expect(data.system.memory).toBeDefined();
    expect(data.system.memory.used).toBeGreaterThan(0);
    expect(data.system.memory.total).toBeGreaterThan(0);
  });

  it('should include uptime information', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.uptime).toBeDefined();
    expect(typeof data.uptime).toBe('number');
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return valid timestamp format', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    // Check if it's a valid ISO timestamp
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });
});
