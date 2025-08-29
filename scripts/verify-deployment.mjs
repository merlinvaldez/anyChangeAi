#!/usr/bin/env node

/**
 * Cross-platform deployment verification script
 * Works on Windows, Mac, and Linux
 * Usage: node scripts/verify-deployment.mjs [URL]
 */

import https from 'https';
import http from 'http';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

// Get URL from command line or use default
const BASE_URL = process.argv[2] || 'http://localhost:3000';
const isHttps = BASE_URL.startsWith('https');

console.log(
  `${colors.blue}🚀 AnyChange AI Deployment Verification${colors.reset}`
);
console.log(
  `${colors.blue}Testing deployment at: ${BASE_URL}${colors.reset}\n`
);

let testsTotal = 0;
let testsPassed = 0;

/**
 * Make HTTP/HTTPS request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = isHttps ? https : http;
    const req = client.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Run a single test
 */
async function runTest(testName, endpoint, expectedPattern) {
  process.stdout.write(`Testing ${testName}... `);
  testsTotal++;

  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await makeRequest(url);

    if (
      response.statusCode === 200 &&
      response.body.includes(expectedPattern)
    ) {
      console.log(`${colors.green}✓ PASS${colors.reset}`);
      testsPassed++;
      return true;
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} (unexpected response)`);
      console.log(`  Expected pattern: ${expectedPattern}`);
      console.log(`  Status: ${response.statusCode}`);
      console.log(`  Body preview: ${response.body.substring(0, 100)}...`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} (${error.message})`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  // Test 1: Health Check
  console.log(`${colors.yellow}📋 Running Health Check${colors.reset}`);
  await runTest('Health endpoint', '/api/health', '"status":"ok"');

  // Test 2: Status Check
  console.log(`${colors.yellow}📋 Running API Status Check${colors.reset}`);
  await runTest('Status endpoint', '/api/status', '"status":"operational"');

  // Test 3: Frontend Check
  console.log(`${colors.yellow}📋 Running Frontend Check${colors.reset}`);
  await runTest('Homepage loads', '', 'AnyChange AI');

  // Test 4: Show environment info
  console.log(
    `${colors.yellow}📋 Checking Environment Configuration${colors.reset}`
  );
  try {
    const response = await makeRequest(`${BASE_URL}/api/status`);
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log('Environment Details:');
      console.log(`  Environment: ${data.api?.environment || 'unknown'}`);
      console.log(
        `  OCR Provider: ${data.services?.ocr?.provider || 'unknown'}`
      );
      console.log(`  Max File Size: ${data.limits?.maxFileSize || 'unknown'}`);
    }
  } catch (error) {
    console.log('  Could not retrieve environment details');
  }

  // Results
  console.log(`\n${colors.blue}📊 Test Results${colors.reset}`);
  console.log(
    `Passed: ${colors.green}${testsPassed}${colors.reset} / ${testsTotal}`
  );

  if (testsPassed === testsTotal) {
    console.log(
      `${colors.green}🎉 All tests passed! Deployment is healthy.${colors.reset}`
    );
    process.exit(0);
  } else {
    console.log(
      `${colors.red}❌ Some tests failed. Check the deployment.${colors.reset}`
    );
    console.log(`\n${colors.yellow}💡 Troubleshooting Tips:${colors.reset}`);
    console.log('1. Check environment variables are set correctly');
    console.log('2. Verify the app is fully deployed (not still building)');
    console.log('3. Check deployment logs for errors');
    console.log('4. Ensure all required services are running');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(
    `${colors.red}Error running tests: ${error.message}${colors.reset}`
  );
  process.exit(1);
});
