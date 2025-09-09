# CPQ Test Suite

This directory contains the organized test suite for the CPQ (Configure, Price, Quote) application.

## Test Structure

### 📁 `/e2e` - End-to-End Tests
Complete user workflow tests that simulate real user interactions from start to finish.

- `complete-flow-discovery.spec.js` - Complete workflow discovery and validation
- `comprehensive.spec.js` - Comprehensive end-to-end testing
- `enhanced-workflow.spec.js` - Enhanced workflow testing
- `workflow.spec.js` - Core workflow functionality

### 📁 `/integration` - Integration Tests
Tests that verify the interaction between different components and systems.

- `print-functionality.spec.js` - Print preview and PDF generation
- `room-processing-inheritance.spec.js` - Room-based processing inheritance
- `room-processing-inheritance-fixed.spec.js` - Fixed inheritance logic
- `integration-performance.spec.js` - Performance and load testing

### 📁 `/unit` - Unit Tests
Tests for individual components and functions.

- `smoke.spec.js` - Basic smoke tests
- `working-tests.spec.js` - Core functionality tests
- `edge-cases.spec.js` - Edge case handling

### 📁 `/regression` - Regression Tests
Critical tests that must pass to ensure no regressions in core functionality.

- `test-working-processing-print.spec.js` - **CRITICAL**: Processing options in print preview

## Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run by Category
```bash
# E2E tests
npx playwright test tests/e2e/

# Integration tests
npx playwright test tests/integration/

# Unit tests
npx playwright test tests/unit/

# Regression tests
npx playwright test tests/regression/
```

### Run Specific Test
```bash
npx playwright test tests/regression/test-working-processing-print.spec.js
```

## Test Helpers

The `helpers/test-helpers.js` file contains shared utility functions used across multiple test files.

## Critical Regression Test

The `test-working-processing-print.spec.js` test is **CRITICAL** and must always pass. It verifies:

1. ✅ Product selection in processing phase
2. ✅ Processing application with options
3. ✅ Processing options modal functionality
4. ✅ Quote state persistence
5. ✅ Print preview display of processings and options

**This test ensures the core processing functionality works end-to-end.**

## Test Data

Tests use the sample data defined in `src/data/sampleData.ts` including:
- Products (cabinets, countertops, etc.)
- Processings (paint, stain, hardware, etc.)
- Processing options (paint colors, finishes, etc.)
- Customer data
- Room configurations

## Notes

- All tests run in headed mode by default for visual verification
- Tests include screenshots for debugging and documentation
- Console logging is used for test progress tracking
- Tests are designed to be independent and can run in any order
