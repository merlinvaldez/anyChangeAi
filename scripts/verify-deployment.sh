#!/usr/bin/env bash
set -euo pipefail

# Deployment Verification Script
# Runs automated smoke tests against a deployed instance
# Usage: bash scripts/verify-deployment.sh [URL]
# Example: bash scripts/verify-deployment.sh https://myapp.vercel.app

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default URL (can be overridden)
BASE_URL="${1:-http://localhost:3000}"

echo -e "${BLUE}🚀 AnyChange AI Deployment Verification${NC}"
echo -e "${BLUE}Testing deployment at: ${BASE_URL}${NC}"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_TOTAL=0

# Helper function to run a test
run_test() {
  local test_name="$1"
  local url="$2"
  local expected_pattern="$3"
  
  echo -n "Testing ${test_name}... "
  TESTS_TOTAL=$((TESTS_TOTAL + 1))
  
  # Try multiple times with a delay (for Windows/startup issues)
  for i in {1..3}; do
    if response=$(curl -s -w '\n%{http_code}' "$url" 2>/dev/null | tr -d '\r'); then
      http_code=$(echo "$response" | tail -n1)
      body=$(echo "$response" | head -n -1)
      
      if [[ "$http_code" == "200" ]] && echo "$body" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✓ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
      fi
    fi
    
    if [[ $i -lt 3 ]]; then
      sleep 2
    fi
  done
  
  echo -e "${RED}✗ FAIL${NC} (request failed or unexpected response)"
  echo "  Expected pattern: $expected_pattern"
  echo "  HTTP Code: ${http_code:-'none'}"
  echo "  Response: ${body:-'none'}"
  return 1
}

# Test 1: Health Check
echo -e "${YELLOW}📋 Running Health Check${NC}"
run_test "Health endpoint" \
  "${BASE_URL}/api/health" \
  '"status":"ok"'

# Test 2: Status Check  
echo -e "${YELLOW}📋 Running API Status Check${NC}"
run_test "Status endpoint" \
  "${BASE_URL}/api/status" \
  '"status":"operational"'

# Test 3: Frontend Check
echo -e "${YELLOW}📋 Running Frontend Check${NC}"
run_test "Homepage loads" \
  "${BASE_URL}" \
  'AnyChange AI'

# Test 4: Environment Info Check
echo -e "${YELLOW}📋 Checking Environment Configuration${NC}"
if response=$(curl -s "${BASE_URL}/api/status" 2>/dev/null); then
  echo "Environment Details:"
  echo "$response" | grep -o '"environment":"[^"]*"' | sed 's/"environment":/  Environment: /' | sed 's/"//g' || echo "  Environment: unknown"
  echo "$response" | grep -o '"provider":"[^"]*"' | sed 's/"provider":/  OCR Provider: /' | sed 's/"//g' || echo "  OCR Provider: unknown"
  echo "$response" | grep -o '"maxFileSize":"[^"]*"' | sed 's/"maxFileSize":/  Max File Size: /' | sed 's/"//g' || echo "  Max File Size: unknown"
fi

echo ""
echo -e "${BLUE}📊 Test Results${NC}"
echo -e "Passed: ${GREEN}${TESTS_PASSED}${NC} / ${TESTS_TOTAL}"

if [ "$TESTS_PASSED" -eq "$TESTS_TOTAL" ]; then
  echo -e "${GREEN}🎉 All tests passed! Deployment is healthy.${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Check the deployment.${NC}"
  echo ""
  echo -e "${YELLOW}💡 Troubleshooting Tips:${NC}"
  echo "1. Check environment variables are set correctly"
  echo "2. Verify the app is fully deployed (not still building)"
  echo "3. Check deployment logs for errors"
  echo "4. Ensure all required services are running"
  exit 1
fi
