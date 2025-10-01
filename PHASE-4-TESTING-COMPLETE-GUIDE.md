# Phase 4: Component Testing Guide

## Overview

This guide provides instructions for running and creating tests for all Vue components in the Media Kit Builder.

## Test Setup

### Prerequisites

1. Install test dependencies:
```bash
npm install
```

Required packages:
- `vitest` - Test runner
- `@vue/test-utils` - Vue component testing utilities
- `@pinia/testing` - Pinia store testing utilities
- `jsdom` - DOM environment for tests
- `@vitest/ui` - Test UI interface
- `@vitest/coverage-v8` - Code coverage reports

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Open test UI in browser
npm run test:ui
```

## Test Structure

### Directory Layout

```
tests/
â"œâ"€â"€ setup.js                    # Global test setup
â"œâ"€â"€ unit/
â"‚   â"œâ"€â"€ components/             # Component tests
â"‚   â"‚   â"œâ"€â"€ HeroRenderer.spec.js
â"‚   â"‚   â"œâ"€â"€ BiographyRenderer.spec.js
â"‚   â"‚   â""â"€â"€ ...
â"‚   â"œâ"€â"€ stores/                 # Store tests
â"‚   â""â"€â"€ services/               # Service tests
â"œâ"€â"€ integration/                # Integration tests
â""â"€â"€ e2e/                        # End-to-end tests (Cypress)
```

### Test File Naming

- Unit tests: `ComponentName.spec.js`
- Integration tests: `feature-name.spec.js`
- E2E tests: `user-workflow.cy.js`

## Writing Component Tests

### Test Template

```javascript
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ComponentRenderer from '../../../components/component-name/ComponentRenderer.vue';

describe('ComponentRenderer', () => {
  let wrapper;

  const defaultProps = {
    componentId: 'test-component-1',
    data: {
      // Component-specific data
    }
  };

  beforeEach(() => {
    wrapper = mount(ComponentRenderer, {
      props: defaultProps,
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ]
      }
    });
  });

  describe('Rendering', () => {
    it('renders component correctly', () => {
      expect(wrapper.find('.component-class').exists()).toBe(true);
    });
  });

  describe('Props Handling', () => {
    it('handles data props correctly', async () => {
      // Test prop handling
    });
  });

  describe('User Interactions', () => {
    it('handles user interactions', async () => {
      // Test events
    });
  });

  describe('Error Handling', () => {
    it('handles missing data gracefully', () => {
      // Test error cases
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      // Test accessibility
    });
  });
});
```

### Required Test Categories

Every component renderer test should include:

1. **Rendering Tests**
   - Component mounts successfully
   - All required elements present
   - Conditional rendering works
   - Default values display correctly

2. **Props Handling Tests**
   - All props accepted correctly
   - Alternative prop names work
   - Prop changes trigger re-render
   - Default props work

3. **User Interaction Tests**
   - Click events work
   - Form inputs update
   - Events emitted correctly
   - Navigation works

4. **Error Handling Tests**
   - Missing data handled gracefully
   - Invalid data doesn't crash
   - Null/undefined values handled
   - Empty states display

5. **Accessibility Tests**
   - Semantic HTML used
   - ARIA labels present
   - Alt text for images
   - Keyboard navigation works

### Testing Editor Components

Editor components should additionally test:

```javascript
describe('ComponentEditor', () => {
  describe('Form Interactions', () => {
    it('updates local data on input', async () => {
      const input = wrapper.find('input[id="field-name"]');
      await input.setValue('New Value');
      expect(wrapper.vm.localData.fieldName).toBe('New Value');
    });

    it('debounces store updates', async () => {
      vi.useFakeTimers();
      const input = wrapper.find('input[id="field-name"]');
      await input.setValue('New Value');
      
      // Should not update immediately
      expect(store.updateComponent).not.toHaveBeenCalled();
      
      // Should update after debounce
      vi.advanceTimersByTime(300);
      expect(store.updateComponent).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('emits update event on change', async () => {
      const input = wrapper.find('input[id="field-name"]');
      await input.setValue('New Value');
      
      vi.advanceTimersByTime(300);
      expect(wrapper.emitted('update')).toBeTruthy();
    });
  });

  describe('Close Functionality', () => {
    it('emits close event when close button clicked', async () => {
      await wrapper.find('.close-btn').trigger('click');
      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });
});
```

## Component Test Checklist

For each component, ensure:

### Renderer Component
- [ ] Component mounts without errors
- [ ] All props render correctly
- [ ] Conditional elements show/hide properly
- [ ] Default values work
- [ ] User interactions work
- [ ] Events emitted correctly
- [ ] Error states handled
- [ ] Accessibility requirements met
- [ ] CSS variables used (no inline styles)
- [ ] Responsive design works

### Editor Component
- [ ] Editor mounts without errors
- [ ] All form fields present
- [ ] Input changes update localData
- [ ] Updates debounced (300ms)
- [ ] Store updated correctly
- [ ] Events emitted correctly
- [ ] Close button works
- [ ] Validation works (if applicable)
- [ ] Error messages display
- [ ] Accessibility requirements met

## Testing Best Practices

### 1. Use Descriptive Test Names

```javascript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('displays title when provided in props', () => { ... });
```

### 2. Test Behavior, Not Implementation

```javascript
// ❌ Bad - testing implementation
it('calls handleClick method', () => {
  const spy = vi.spyOn(wrapper.vm, 'handleClick');
  wrapper.find('button').trigger('click');
  expect(spy).toHaveBeenCalled();
});

// ✅ Good - testing behavior
it('emits button-click event when button clicked', async () => {
  await wrapper.find('button').trigger('click');
  expect(wrapper.emitted('button-click')).toBeTruthy();
});
```

### 3. Isolate Tests

Each test should be independent and not rely on other tests.

```javascript
beforeEach(() => {
  // Reset state before each test
  wrapper = mount(Component, { ... });
});
```

### 4. Test Edge Cases

```javascript
describe('Error Handling', () => {
  it('handles empty data', () => { ... });
  it('handles null values', () => { ... });
  it('handles undefined values', () => { ... });
  it('handles invalid data types', () => { ... });
});
```

### 5. Mock External Dependencies

```javascript
// Mock API calls
vi.mock('../services/APIService', () => ({
  APIService: vi.fn(() => ({
    load: vi.fn().mockResolvedValue({ data: {} }),
    save: vi.fn().mockResolvedValue({ success: true })
  }))
}));

// Mock window methods
const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
// ... test code ...
windowOpen.mockRestore();
```

## Coverage Goals

### Minimum Requirements

- **Overall Coverage**: >80%
- **Component Coverage**: >85%
- **Store Coverage**: >90%
- **Service Coverage**: >75%

### Generating Coverage Reports

```bash
npm run test:coverage
```

This generates:
- Console summary
- HTML report in `coverage/index.html`
- JSON report for CI/CD

### Viewing Coverage Report

```bash
# Open HTML coverage report
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

## Common Testing Patterns

### Testing Async Operations

```javascript
it('loads data asynchronously', async () => {
  // Wait for promises to resolve
  await wrapper.vm.$nextTick();
  
  // Or use waitFor from test-utils
  await wrapper.find('.loaded-element').exists();
});
```

### Testing Vuex/Pinia Stores

```javascript
import { createTestingPinia } from '@pinia/testing';
import { useMediaKitStore } from '@/stores/mediaKit';

it('updates store correctly', () => {
  const wrapper = mount(Component, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn })]
    }
  });
  
  const store = useMediaKitStore();
  
  // Trigger action
  wrapper.vm.someAction();
  
  // Assert store was updated
  expect(store.updateComponent).toHaveBeenCalled();
});
```

### Testing Emitted Events

```javascript
it('emits correct event data', async () => {
  await wrapper.find('button').trigger('click');
  
  const emitted = wrapper.emitted('event-name');
  expect(emitted).toBeTruthy();
  expect(emitted[0][0]).toEqual({ expected: 'data' });
});
```

### Testing Slots

```javascript
it('renders slot content', () => {
  const wrapper = mount(Component, {
    slots: {
      default: 'Slot Content'
    }
  });
  
  expect(wrapper.text()).toContain('Slot Content');
});
```

### Testing Conditional Rendering

```javascript
it('shows element when condition is true', async () => {
  await wrapper.setProps({ showElement: true });
  expect(wrapper.find('.element').exists()).toBe(true);
  
  await wrapper.setProps({ showElement: false });
  expect(wrapper.find('.element').exists()).toBe(false);
});
```

## Debugging Tests

### Using console.log

```javascript
it('debugs component state', () => {
  console.log(wrapper.html()); // Component HTML
  console.log(wrapper.vm);     // Component instance
  console.log(wrapper.props()); // Component props
});
```

### Using the Test UI

```bash
npm run test:ui
```

This opens a browser interface where you can:
- See test results in real-time
- View component state
- Inspect failures
- Re-run specific tests

### Setting Breakpoints

```javascript
it('pauses at breakpoint', () => {
  debugger; // Execution pauses here
  // Test code...
});
```

Then run tests with Node inspector:
```bash
node --inspect-brk node_modules/.bin/vitest
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Component Test Priority

### Phase 4 Testing Order

1. **P0 Components** (Critical - Test First)
   - Hero
   - Biography
   - Topics
   - Contact
   - Social

2. **P1 Components** (Important - Test Next)
   - Testimonials
   - Guest Intro
   - Authority Hook
   - Call to Action
   - Questions

3. **P2 Components** (Nice to Have - Test Last)
   - Photo Gallery
   - Video Intro
   - Podcast Player
   - Booking Calendar
   - Logo Grid
   - Stats

## Next Steps

1. **Create Tests for All Components**
   - Use HeroRenderer.spec.js as template
   - Follow checklist for each component
   - Aim for >80% coverage

2. **Run Full Test Suite**
   ```bash
   npm run test:coverage
   ```

3. **Review Coverage Report**
   - Identify gaps
   - Add missing tests
   - Improve weak areas

4. **Set Up CI/CD**
   - Add to GitHub Actions
   - Require tests to pass before merge
   - Track coverage over time

5. **Document Edge Cases**
   - Create issues for found bugs
   - Document expected behavior
   - Add regression tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)
- [Testing Library](https://testing-library.com/)

## Support

For questions or issues with testing:
1. Check existing tests as examples
2. Review this guide
3. Consult official documentation
4. Create issue in project repository
