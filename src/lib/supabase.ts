/**
 * Supabase Client Configuration
 *
 * This file provides properly configured Supabase clients for different use cases:
 * - Client-side: For browser operations (limited permissions)
 * - Server-side: For API routes (full admin permissions)
 *
 * Why separate clients?
 * - Security: Server client has elevated permissions
 * - Performance: Client can cache user sessions
 * - Functionality: Different auth contexts need different capabilities
 */

import { createClient } from '@supabase/supabase-js';
import { serverEnv } from './env';

// =============================================================================
// CLIENT-SIDE SUPABASE CLIENT
// =============================================================================

/**
 * Browser-safe Supabase client
 * Uses anon key - limited permissions based on RLS policies
 * Safe to use in React components
 */
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  // Only create client if we have the required environment variables
  if (typeof window === 'undefined') {
    throw new Error(
      'getSupabaseClient() should only be called on the client side'
    );
  }

  if (!supabaseClient) {
    // In production, these would be NEXT_PUBLIC_ variables
    // For now, we'll need to pass them from the server
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
      );
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}

// =============================================================================
// SERVER-SIDE SUPABASE CLIENT
// =============================================================================

/**
 * Server-only Supabase client with admin privileges
 * Uses service role key - bypasses RLS policies
 * Only use in API routes, never expose to client
 */
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'getSupabaseAdmin() should only be called on the server side'
    );
  }

  if (!supabaseAdmin) {
    const { url, serviceRoleKey } = serverEnv.supabase;

    if (!url || !serviceRoleKey) {
      throw new Error(
        'Missing Supabase server configuration. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env.local file.'
      );
    }

    supabaseAdmin = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdmin;
}

// =============================================================================
// STORAGE UTILITIES
// =============================================================================

/**
 * Get the default storage bucket name
 */
export function getStorageBucket(): string {
  return serverEnv.supabase.storageBucket;
}

/**
 * Generate a unique file path for uploads
 */
export function generateFilePath(originalFileName: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const fileExtension = originalFileName.split('.').pop();

  return `uploads/${timestamp}-${randomId}.${fileExtension}`;
}

/**
 * Get public URL for a file in storage
 */
export function getFileUrl(filePath: string): string {
  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage
    .from(getStorageBucket())
    .getPublicUrl(filePath);

  return data.publicUrl;
}
