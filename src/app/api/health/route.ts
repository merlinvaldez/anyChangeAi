// Health Check API Route
// This is like a "ping" endpoint that confirms our app is working

import { serverEnv } from '@/lib/env';

export async function GET() {
  try {
    // Use serverEnv to access environment configuration securely
    // This automatically validates all environment variables
    const env = serverEnv;

    // Basic app status checks
    const appStatus = {
      environment: env.app.nodeEnv,
      ocrProvider: env.ocr.provider,
      timestamp: new Date().toISOString(),
    };

    // If we get here, everything is working!
    return Response.json({
      status: 'ok',
      message: 'AnyChange AI is healthy',
      ...appStatus,
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
