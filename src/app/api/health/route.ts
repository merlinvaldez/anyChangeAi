// Health Check API Route
// This is like a "ping" endpoint that confirms our app is working

export async function GET() {
  try {
    // Check if critical environment variables are loaded
    const requiredEnvVars = [
      'API_SECRET_KEY',
      'OCR_PROVIDER',
      'MISTRAL_API_KEY',
    ];

    const missingVars = requiredEnvVars.filter(
      varName => !process.env[varName]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing environment variables: ${missingVars.join(', ')}`
      );
    }

    // Basic app status checks
    const appStatus = {
      environment: process.env.NODE_ENV || 'development',
      ocrProvider: process.env.OCR_PROVIDER,
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
