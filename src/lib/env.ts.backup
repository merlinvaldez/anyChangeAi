/**
 * Environment Configuration with Zod Validation
 *
 * This file centralizes all environment variable acce      error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path.join('.');
        console.error(`  • ${field}: ${err.message}`);
      });nd provides
 * type safety and validation using Zod schemas.
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
// SCHEMA DEFINITIONS
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
// MAIN ENVIRONMENT SCHEMA
// =============================================================================

const envSchema = z.object({
  // Node.js environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // App configuration (public)
  NEXT_PUBLIC_APP_NAME: z.string().default('AnyChange AI'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // API Security (server-only)
  API_SECRET_KEY: z.string().min(1, 'API_SECRET_KEY is required for security'),

  // OCR Configuration
  OCR_PROVIDER: z.enum(['tesseract', 'mistral']).default('tesseract'),
  MISTRAL_API_KEY: z.string().optional(),
  MISTRAL_API_URL: z.string().url().default('https://api.mistral.ai/v1'),

  // File Processing
  MAX_FILE_SIZE: numberSchema(10485760), // 10MB default
  MAX_PAGES: numberSchema(10),
  ALLOWED_FILE_TYPES: csvSchema('pdf,jpg,jpeg,png'),

  // Development Settings
  DEBUG_LOGGING: booleanSchema,

  // Optional: Future features
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
});

// =============================================================================
// VALIDATION LOGIC
// =============================================================================

// =============================================================================
// VALIDATION LOGIC
// =============================================================================

/**
 * Parse and validate environment variables using Zod
 * This will throw helpful errors if any required variables are missing
 */
function parseEnvironment() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment Configuration Error:');
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

// Parse environment variables and make them available
const rawEnv = parseEnvironment();

// =============================================================================
// TYPED ENVIRONMENT OBJECT
// =============================================================================

export const env = {
  // App Configuration
  app: {
    name: rawEnv.NEXT_PUBLIC_APP_NAME,
    url: rawEnv.NEXT_PUBLIC_APP_URL,
    nodeEnv: rawEnv.NODE_ENV,
    isDevelopment: rawEnv.NODE_ENV === 'development',
    isProduction: rawEnv.NODE_ENV === 'production',
  },

  // API Security
  api: {
    secretKey: rawEnv.API_SECRET_KEY,
  },

  // OCR Configuration
  ocr: {
    provider: rawEnv.OCR_PROVIDER,
    mistral: {
      apiKey: rawEnv.MISTRAL_API_KEY,
      apiUrl: rawEnv.MISTRAL_API_URL,
    },
  },

  // File Processing
  files: {
    maxSize: rawEnv.MAX_FILE_SIZE,
    maxPages: rawEnv.MAX_PAGES,
    allowedTypes: rawEnv.ALLOWED_FILE_TYPES,
  },

  // Development Settings
  debug: {
    logging: rawEnv.DEBUG_LOGGING,
  },

  // Future features (optional)
  aws: {
    region: rawEnv.AWS_REGION,
    s3Bucket: rawEnv.AWS_S3_BUCKET,
    accessKeyId: rawEnv.AWS_ACCESS_KEY_ID,
    secretAccessKey: rawEnv.AWS_SECRET_ACCESS_KEY,
  },

  database: {
    url: rawEnv.DATABASE_URL,
  },
} as const;

// =============================================================================
// ADDITIONAL VALIDATION
// =============================================================================

/**
 * Validates business logic rules for environment configuration
 * Call this at app startup to catch configuration issues early
 */
export function validateEnvironment(): void {
  console.log('🔍 Validating environment configuration...');

  try {
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

// Export types for use in other files
export type OcrProvider = typeof env.ocr.provider;
export type EnvironmentConfig = typeof env;
