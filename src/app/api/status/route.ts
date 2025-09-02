// API Status endpoint
// Provides detailed API status and configuration

import { serverEnv } from '@/lib/env';

export async function GET() {
  try {
    // Safely access environment configuration
    const env = serverEnv;

    const statusInfo = {
      api: {
        status: 'operational',
        version: '0.1.0',
        environment: env.app.nodeEnv,
        uptime: process.uptime(),
      },
      services: {
        ocr: {
          provider: env.ocr.provider,
          status: env.ocr.provider === 'tesseract' ? 'ready' : 'configured',
        },
        database: {
          status: env.database.url ? 'configured' : 'not-configured',
        },
        storage: {
          supabase: {
            status: env.supabase.storageBucket
              ? 'configured'
              : 'not-configured',
          },
        },
      },
      limits: {
        maxFileSize: `${(env.files.maxSize / 1024 / 1024).toFixed(1)}MB`,
        maxPages: env.files.maxPages,
        allowedTypes: env.files.allowedTypes,
      },
      features: {
        debugLogging: env.debug.logging,
        healthCheck: true,
        apiInfo: true,
        versionInfo: true,
      },
      timestamp: new Date().toISOString(),
    };

    return Response.json(statusInfo);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return Response.json(
      {
        api: {
          status: 'error',
          version: '0.1.0',
          environment: process.env.NODE_ENV || 'unknown',
        },
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
