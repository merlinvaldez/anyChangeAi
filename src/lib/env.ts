/**
 * Environment Configuration
 *
 * This file centralizes all environment variable access and provides
 * type safety and validation for your environment variables.
 *
 * Why do this?
 * 1. Type safety - catch missing env vars at build time
 * 2. Documentation - clear list of what your app needs
 * 3. Validation - ensure required values are present
 * 4. Default values - provide sensible fallbacks
 */

// Helper function to get environment variables with validation
function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `Please check your .env.local file and ensure ${name} is set.`
    );
  }

  return value;
}

// Helper function for optional environment variables
function getOptionalEnvVar(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

// Helper function for numeric environment variables
function getNumericEnvVar(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(
      `Environment variable ${name} must be a valid number, got: ${value}`
    );
  }

  return parsed;
}

// Helper function for boolean environment variables
function getBooleanEnvVar(
  name: string,
  defaultValue: boolean = false
): boolean {
  const value = process.env[name];
  if (!value) return defaultValue;

  return value.toLowerCase() === 'true';
}

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

export const env = {
  // App Configuration
  app: {
    name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'AnyChange AI'),
    url: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',
    isProduction: getEnvVar('NODE_ENV', 'development') === 'production',
  },

  // API Security
  api: {
    secretKey: getEnvVar('API_SECRET_KEY'),
  },

  // OCR Configuration
  ocr: {
    provider: getEnvVar('OCR_PROVIDER', 'tesseract') as 'tesseract' | 'mistral',
    mistral: {
      apiKey: getOptionalEnvVar('MISTRAL_API_KEY'),
      apiUrl: getOptionalEnvVar('MISTRAL_API_URL', 'https://api.mistral.ai/v1'),
    },
  },

  // File Processing
  files: {
    maxSize: getNumericEnvVar('MAX_FILE_SIZE', 10485760), // 10MB default
    maxPages: getNumericEnvVar('MAX_PAGES', 10),
    allowedTypes: getOptionalEnvVar('ALLOWED_FILE_TYPES', 'pdf,jpg,jpeg,png')
      .split(',')
      .map(type => type.trim()),
  },

  // Development Settings
  debug: {
    logging: getBooleanEnvVar('DEBUG_LOGGING', true),
  },

  // Future features (optional)
  aws: {
    region: getOptionalEnvVar('AWS_REGION'),
    s3Bucket: getOptionalEnvVar('AWS_S3_BUCKET'),
    accessKeyId: getOptionalEnvVar('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getOptionalEnvVar('AWS_SECRET_ACCESS_KEY'),
  },

  database: {
    url: getOptionalEnvVar('DATABASE_URL'),
  },
} as const;

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validates that all required environment variables are present
 * Call this at app startup to catch configuration issues early
 */
export function validateEnvironment(): void {
  console.log('🔍 Validating environment configuration...');

  try {
    // Test that all required env vars are accessible
    env.app.name;
    env.api.secretKey;
    env.ocr.provider;

    // Validate OCR provider choice
    if (!['tesseract', 'mistral'].includes(env.ocr.provider)) {
      throw new Error(
        `Invalid OCR_PROVIDER: ${env.ocr.provider}. Must be 'tesseract' or 'mistral'`
      );
    }

    // If using Mistral, ensure API key is present
    if (env.ocr.provider === 'mistral' && !env.ocr.mistral.apiKey) {
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
