#!/bin/bash

# CPQ Test Runner Script
# Usage: ./run-tests.sh [category] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
CATEGORY=""
HEADED="--headed"
VERBOSE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --category|-c)
      CATEGORY="$2"
      shift 2
      ;;
    --headless)
      HEADED=""
      shift
      ;;
    --verbose|-v)
      VERBOSE="--reporter=line"
      shift
      ;;
    --help|-h)
      echo "CPQ Test Runner"
      echo ""
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  -c, --category CATEGORY    Run tests in specific category (e2e, integration, unit, regression)"
      echo "      --headless             Run tests in headless mode"
      echo "  -v, --verbose             Verbose output"
      echo "  -h, --help                Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                        # Run all tests"
      echo "  $0 -c regression          # Run regression tests only"
      echo "  $0 -c e2e --headless      # Run E2E tests in headless mode"
      echo "  $0 -c unit -v             # Run unit tests with verbose output"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🧪 CPQ Test Runner${NC}"
echo "=================="

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx not found. Please install Node.js and npm.${NC}"
    exit 1
fi

# Check if tests directory exists
if [ ! -d "tests" ]; then
    echo -e "${RED}❌ Tests directory not found. Please run from project root.${NC}"
    exit 1
fi

# Build test command
if [ -n "$CATEGORY" ]; then
    if [ ! -d "tests/$CATEGORY" ]; then
        echo -e "${RED}❌ Category '$CATEGORY' not found. Available categories: e2e, integration, unit, regression${NC}"
        exit 1
    fi
    TEST_COMMAND="npx playwright test tests/$CATEGORY/ $HEADED $VERBOSE"
    echo -e "${YELLOW}📁 Running $CATEGORY tests...${NC}"
else
    TEST_COMMAND="npx playwright test $HEADED $VERBOSE"
    echo -e "${YELLOW}📁 Running all tests...${NC}"
fi

echo -e "${BLUE}Command: $TEST_COMMAND${NC}"
echo ""

# Run tests
if eval $TEST_COMMAND; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Check the output above.${NC}"
    exit 1
fi
