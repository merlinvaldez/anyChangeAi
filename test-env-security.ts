/**
 * Test file to verify client/server environment separation
 * This helps us confirm our security implementation works
 */

// Load environment variables (needed when running outside Next.js)
import { config } from 'dotenv';
config({ path: '.env.local' });

// Test 1: Import both environment configs
import { clientEnv, serverEnv } from '@/lib/env';

console.log('🧪 Testing Environment Security Implementation');

// Test 2: Client environment should always work
console.log('✅ Client Environment Test:');
console.log('   App Name:', clientEnv.app.name);
console.log('   App URL:', clientEnv.app.url);
console.log('   Environment:', clientEnv.app.nodeEnv);

// Test 3: Server environment should work on server, fail on client
console.log('🔒 Server Environment Test:');
try {
  // This should work on server, fail on client
  console.log('   OCR Provider:', serverEnv.ocr.provider);
  console.log('   ✅ Server environment accessible (this is server-side code)');
} catch (error) {
  console.log('   🚨 Server environment blocked (this is client-side code)');
  console.log('   Error:', (error as Error).message);
}

console.log('🎯 Test complete!');
