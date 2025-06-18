# Media Kit Builder Testing Guide

This document explains how to run and write tests for the Media Kit Builder plugin.

## Running Tests

The project uses Vitest for testing. Here are the available commands:

```bash
# Run all tests once
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage reports
npm run test:coverage

# Run tests with UI interface
npm run test:ui
```

## Test Structure

Tests are organized in the following directories:

- `tests/unit/` - Unit tests for individual modules
- `tests/integration/` - Integration tests for multiple components working together

## Writing Tests

### 1. Create a new test file

Create a new file in the appropriate directory with the `.test.js` extension. For example:

```js
// tests/unit/example.test.js
import { describe, it, expect } from 'vitest';
import { someFunction } from '../../js/utils/example.js';

describe('Example Module', () => {
  it('should work correctly', () => {
    expect(someFunction()).toBe(true);
  });
});
```

### 2. Running specific tests

You can run specific test files or filter by test name:

```bash
# Run tests matching a specific file pattern
npm test -- unit/state-manager

# Run tests with specific name pattern
npm test -- -t "should update component"
```

## WordPress Mocks

WordPress globals and plugin-specific globals are mocked in `tests/setup.js`. If you need to add or modify mocks, edit that file.

## Coverage Reports

After running `npm run test:coverage`, you can view the coverage report in:

- Console output
- HTML format in the `coverage/` directory

## CI Integration

Tests are automatically run on GitHub Actions for all push and pull request events to main branches. The workflow configuration is in `.github/workflows/test.yml`.
