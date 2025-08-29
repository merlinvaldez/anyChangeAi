// Health Check API Route
// This is like a "ping" endpoint that confirms our app is working

export async function GET() {
  try {
    // Basic health check with safe environment information
    const healthStatus = {
      status: 'ok',
      message: 'AnyChange AI is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      version: '0.1.0',
      uptime: process.uptime(),
      service: 'anychange-ai-api',
    };

    // Add some basic system information
    const systemInfo = {
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
      },
    };

    return Response.json({
      ...healthStatus,
      system: systemInfo,
    });
  } catch (error) {
    // If something goes wrong, return an error with details
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return Response.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
