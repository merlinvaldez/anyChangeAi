/**
 * Environment Configuration with Zod Validation
 *
 * This file centralizes all environment variable access and provides
 * type safety and validation using Zod schemas, while properly separating
 * client-safe and server-only variables.
 *
 * SECURITY IMPORTANT:
 * - Only NEXT_PUBLIC_ variables are exposed to the browser
 * - Server-only variables contain secrets and must never leak to client
 * - Use serverEnv for server-side code, clientEnv for components
 *
 * Why use Zod for environment variables?
 * 1. Type safety - catch missing env vars at build time
 * 2. Schema validation - ensure correct data types and formats
 * 3. Clear error messages - know exactly what's wrong
 * 4. Default values - provide sensible fallbacks
 * 5. Documentation - schema serves as living documentation
 */

import { z } from 'zod';

// =============================================================================
// ENVIRONMENT DETECTION
// =============================================================================

/**
 * Detect if we're running on server or client
 * This is crucial for preventing server-only variables from leaking to browser
 */
const isClient = typeof window !== 'undefined';

// =============================================================================
// SCHEMA UTILITIES
// =============================================================================

/**
 * Transform string to boolean for environment variables
 * Accepts: 'true', 'false', '1', '0', undefined
 */
const booleanSchema = z
  .string()
  .optional()
  .transform(val => val === 'true' || val === '1')
  .default(false);

/**
 * Transform string to number for environment variables
 * Provides a default value if not set
 */
const numberSchema = (defaultValue: number) =>
  z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : defaultValue))
    .refine(val => !isNaN(val), { message: 'Must be a valid number' });

/**
 * Transform comma-separated string to array
 */
const csvSchema = (defaultValue: string) =>
  z
    .string()
    .default(defaultValue)
    .transform(val => val.split(',').map(item => item.trim()));

// =============================================================================
// CLIENT-SAFE SCHEMA (NEXT_PUBLIC_ variables only)
// =============================================================================

/**
 * Schema for variables that are safe to expose to the browser
 * These MUST be prefixed with NEXT_PUBLIC_ in Next.js
 */
const clientEnvSchema = z.object({
  // App information that frontend needs
  NEXT_PUBLIC_APP_NAME: z.string().default('AnyChange AI'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Environment indicator (Node.js provides this automatically)
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

// =============================================================================
// SERVER-ONLY SCHEMA (Sensitive variables)
// =============================================================================

/**
 * Schema for server-only variables that contain secrets
 * These must NEVER be prefixed with NEXT_PUBLIC_
 */
const serverEnvSchema = z.object({
  // Include all client variables first
  ...clientEnvSchema.shape,

  // API Security (server-only)
  API_SECRET_KEY: z.string().min(1, 'API_SECRET_KEY is required for security'),

  // OCR Configuration (server-only - contains API keys)
  OCR_PROVIDER: z.enum(['tesseract', 'mistral']).default('tesseract'),
  MISTRAL_API_KEY: z.string().optional(),
  MISTRAL_API_URL: z.string().url().default('https://api.mistral.ai/v1'),

  // File Processing Limits (server-only - security policy)
  MAX_FILE_SIZE: numberSchema(52428800), // 50MB default
  MAX_PAGES: numberSchema(0), // 0 = no page limit
  ALLOWED_FILE_TYPES: csvSchema('pdf,jpg,jpeg,png'),

  // Development Settings (server-only)
  DEBUG_LOGGING: booleanSchema,

  // Cloud Services (server-only - contain credentials)
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // Database (server-only - contains credentials)
  DATABASE_URL: z.string().optional(),
});

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Parse and validate environment variables using appropriate schema
 */
function parseClientEnvironment() {
  try {
    return clientEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Client Environment Configuration Error:');
      console.error(
        'The following public environment variables are invalid or missing:\n'
      );

      error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path.join('.');
        console.error(`  • ${field}: ${err.message}`);
      });

      console.error('\n💡 Quick fix:');
      console.error('  1. Check your .env.local file exists');
      console.error(
        '  2. Copy missing NEXT_PUBLIC_ variables from .env.example'
      );
      console.error('  3. Restart your development server\n');
    }
    throw error;
  }
}

function parseServerEnvironment() {
  if (isClient) {
    throw new Error(
      '🚨 SECURITY ERROR: Attempted to access server environment from client code!\n' +
        'Server environment contains secrets and must only be used in:\n' +
        '  • API routes (/api/*)\n' +
        '  • Server components\n' +
        '  • Middleware\n' +
        '  • Build scripts'
    );
  }

  try {
    return serverEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Server Environment Configuration Error:');
      console.error(
        'The following environment variables are invalid or missing:\n'
      );

      error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path.join('.');
        console.error(`  • ${field}: ${err.message}`);
      });

      console.error('\n💡 Quick fix:');
      console.error('  1. Check your .env.local file exists');
      console.error('  2. Copy missing variables from .env.example');
      console.error('  3. Restart your development server\n');
    }
    throw error;
  }
}

// =============================================================================
// EXPORTED ENVIRONMENT OBJECTS
// =============================================================================

/**
 * Client-safe environment variables
 * Safe to use in React components and browser code
 * Contains only NEXT_PUBLIC_ variables
 */
const rawClientEnv = parseClientEnvironment();
export const clientEnv = {
  app: {
    name: rawClientEnv.NEXT_PUBLIC_APP_NAME,
    url: rawClientEnv.NEXT_PUBLIC_APP_URL,
    nodeEnv: rawClientEnv.NODE_ENV,
    isDevelopment: rawClientEnv.NODE_ENV === 'development',
    isProduction: rawClientEnv.NODE_ENV === 'production',
  },
} as const;

/**
 * Complete server environment variables
 * Contains sensitive data - ONLY use in server-side code
 * Will throw an error if accessed from client code
 */
let _serverEnv: ReturnType<typeof createServerEnv> | null = null;

function createServerEnv() {
  const rawServerEnv = parseServerEnvironment();

  return {
    // Include all client-safe variables
    app: {
      name: rawServerEnv.NEXT_PUBLIC_APP_NAME,
      url: rawServerEnv.NEXT_PUBLIC_APP_URL,
      nodeEnv: rawServerEnv.NODE_ENV,
      isDevelopment: rawServerEnv.NODE_ENV === 'development',
      isProduction: rawServerEnv.NODE_ENV === 'production',
    },

    // Server-only configuration
    api: {
      secretKey: rawServerEnv.API_SECRET_KEY,
    },

    ocr: {
      provider: rawServerEnv.OCR_PROVIDER,
      mistral: {
        apiKey: rawServerEnv.MISTRAL_API_KEY,
        apiUrl: rawServerEnv.MISTRAL_API_URL,
      },
    },

    files: {
      maxSize: rawServerEnv.MAX_FILE_SIZE,
      maxPages: rawServerEnv.MAX_PAGES,
      allowedTypes: rawServerEnv.ALLOWED_FILE_TYPES,
    },

    debug: {
      logging: rawServerEnv.DEBUG_LOGGING,
    },

    aws: {
      region: rawServerEnv.AWS_REGION,
      s3Bucket: rawServerEnv.AWS_S3_BUCKET,
      accessKeyId: rawServerEnv.AWS_ACCESS_KEY_ID,
      secretAccessKey: rawServerEnv.AWS_SECRET_ACCESS_KEY,
    },

    database: {
      url: rawServerEnv.DATABASE_URL,
    },
  } as const;
}

export const serverEnv = new Proxy({} as ReturnType<typeof createServerEnv>, {
  get(target, prop) {
    // Lazy load server environment only when accessed
    if (!_serverEnv) {
      _serverEnv = createServerEnv();
    }
    return _serverEnv[prop as keyof typeof _serverEnv];
  },
});

// =============================================================================
// BACKWARDS COMPATIBILITY (DEPRECATED)
// =============================================================================

/**
 * @deprecated Use clientEnv or serverEnv instead for better security
 * This export is kept for backwards compatibility but will be removed
 */
export const env = new Proxy({} as ReturnType<typeof createServerEnv>, {
  get(target, prop) {
    console.warn(
      `⚠️  DEPRECATION WARNING: Using 'env.${String(prop)}' is deprecated.\n` +
        `   Use 'clientEnv.${String(prop)}' for components or 'serverEnv.${String(prop)}' for server code.\n` +
        `   This ensures proper client/server environment separation.`
    );

    if (isClient) {
      // On client, only allow access to client-safe properties
      const clientSafeProps = ['app'];
      const topLevelProp = String(prop);

      if (clientSafeProps.includes(topLevelProp)) {
        return clientEnv[topLevelProp as keyof typeof clientEnv];
      } else {
        throw new Error(
          `🚨 SECURITY ERROR: Cannot access '${String(prop)}' from client code.\n` +
            `This property contains server-only data. Use 'clientEnv' instead.`
        );
      }
    } else {
      // On server, allow full access but warn about deprecation
      return serverEnv[prop as keyof typeof serverEnv];
    }
  },
});

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validates business logic rules for environment configuration
 * Call this at app startup to catch configuration issues early
 */
export function validateEnvironment(): void {
  console.log('🔍 Validating environment configuration...');

  try {
    const env = serverEnv; // Use server env for validation

    // Additional business logic validation
    if (
      env.ocr.provider === 'mistral' &&
      (!env.ocr.mistral.apiKey || env.ocr.mistral.apiKey.trim() === '')
    ) {
      throw new Error(
        'MISTRAL_API_KEY is required when OCR_PROVIDER is set to "mistral"'
      );
    }

    console.log('✅ Environment configuration is valid');

    if (env.debug.logging) {
      console.log('📋 Current configuration:');
      console.log(`   App: ${env.app.name} (${env.app.nodeEnv})`);
      console.log(`   OCR Provider: ${env.ocr.provider}`);
      console.log(
        `   Max file size: ${(env.files.maxSize / 1024 / 1024).toFixed(1)}MB`
      );
      console.log(`   Max pages: ${env.files.maxPages}`);
      console.log(`   Allowed types: ${env.files.allowedTypes.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Environment configuration error:');
    console.error(error);

    if (process.env.NODE_ENV === 'development') {
      console.log('\n💡 Quick fix:');
      console.log('   1. Check your .env.local file exists');
      console.log('   2. Copy missing variables from .env.example');
      console.log('   3. Restart your development server');
    }

    throw error;
  }
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ClientEnvironmentConfig = typeof clientEnv;
export type ServerEnvironmentConfig = typeof serverEnv;
export type OcrProvider = typeof serverEnv.ocr.provider;
