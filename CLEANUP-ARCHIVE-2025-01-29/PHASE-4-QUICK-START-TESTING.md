# Phase 4: Quick Start Guide for Testing

## 🎯 Goal
Complete unit tests for 16 remaining components to achieve >80% test coverage.

---

## ⚡ Quick Start (5 minutes)

### Step 1: Generate Test Files
```bash
# Windows
generate-tests.bat

# Or manually:
node scripts/generate-component-tests.js
```

This creates test templates for all components in `tests/unit/components/`.

### Step 2: Pick a Component to Test

Start with P0 components:
1. ✅ Hero (already done - use as reference)
2. Biography
3. Topics
4. Contact
5. Social

### Step 3: Fill in the Template

Open a generated test file (e.g., `BiographyRenderer.spec.js`) and:
1. Add component-specific default data
2. Add component-specific test cases
3. Run the test
4. Fix any failures
5. Check coverage

### Step 4: Run Tests
```bash
# Watch mode (recommended)
npm run test:watch

# Or run once
npm test

# With coverage
npm run test:coverage
```

---

## 📝 Test Template Walkthrough

### 1. Add Default Data

Find this section in the generated template:
```javascript
const defaultProps = {
  componentId: 'biography-test-1',
  data: {
    // TODO: Add component-specific default data
  }
};
```

Replace with actual component data:
```javascript
const defaultProps = {
  componentId: 'biography-test-1',
  data: {
    biography: 'Test biography text',
    headshot: 'https://example.com/image.jpg',
    name: 'John Doe',
    title: 'Professional Speaker'
  }
};
```

### 2. Update Rendering Tests

Find placeholder tests like:
```javascript
it('displays content when provided', () => {
  // TODO: Add specific content display tests
  expect(wrapper.element).toBeTruthy();
});
```

Replace with specific assertions:
```javascript
it('displays biography text', () => {
  expect(wrapper.find('.biography-text').text()).toBe('Test biography text');
});

it('displays headshot image', () => {
  const img = wrapper.find('.biography-headshot img');
  expect(img.exists()).toBe(true);
  expect(img.attributes('src')).toBe('https://example.com/image.jpg');
});
```

### 3. Add Component-Specific Tests

At the bottom of the file, add tests for unique features:
```javascript
describe('Biography-Specific Features', () => {
  it('handles markdown in biography text', () => {
    // Test markdown rendering if applicable
  });

  it('displays social links if provided', () => {
    // Test social links integration
  });
});
```

---

## 🔍 Reference: Hero Component Test

The Hero component test (`HeroRenderer.spec.js`) is a complete example. Use it as a reference for:

1. **Structure**: How tests are organized
2. **Assertions**: What to test and how
3. **Edge Cases**: Error handling patterns
4. **Best Practices**: Naming, mocking, etc.

Key sections to review:
- Rendering tests
- Props handling
- User interactions
- Error handling
- Accessibility

---

## 📋 Testing Checklist Per Component

For each component, ensure you test:

### Rendering
- [ ] Component mounts without errors
- [ ] Required elements are present
- [ ] Content displays when provided
- [ ] Conditional elements show/hide correctly
- [ ] Default values work when data missing

### Props
- [ ] All props accepted
- [ ] Props update component
- [ ] Alternative prop names work (if any)
- [ ] Prop validation works

### Events
- [ ] User interactions trigger events
- [ ] Events emit correct data
- [ ] Click handlers work
- [ ] Form submissions work (editors)

### Error Handling
- [ ] Missing data handled gracefully
- [ ] Null values don't crash
- [ ] Undefined values don't crash
- [ ] Empty objects handled
- [ ] Invalid data types handled

### Accessibility
- [ ] Semantic HTML used
- [ ] Images have alt text
- [ ] Buttons have text
- [ ] Forms have labels

---

## 🎯 Priority Order

Complete tests in this order for maximum impact:

### Week 1: P0 Components (Essential)
1. **Biography** - High complexity, Pods integration
2. **Contact** - Form validation critical
3. **Topics** - Array handling
4. **Social** - Link management

### Week 2: P1 Components (Important)
5. **Questions** - Array handling similar to Topics
6. **Testimonials** - Array/grid layout
7. **Call to Action** - Button variations
8. **Guest Intro** - Pods integration
9. **Authority Hook** - Credential display

### Week 3: P2 Components (Additional)
10. **Photo Gallery** - Image handling
11. **Video Intro** - Embed handling
12. **Podcast Player** - Audio integration
13. **Booking Calendar** - External integration
14. **Logo Grid** - Image grid
15. **Stats** - Number formatting
16. **Topics-Questions** - Combined component

---

## 💡 Common Patterns

### Testing Text Display
```javascript
it('displays the title', () => {
  expect(wrapper.find('.title').text()).toBe('Expected Title');
});
```

### Testing Image Rendering
```javascript
it('renders image when provided', () => {
  const img = wrapper.find('img');
  expect(img.exists()).toBe(true);
  expect(img.attributes('src')).toBe('expected-url.jpg');
  expect(img.attributes('alt')).toBeTruthy();
});
```

### Testing Conditional Rendering
```javascript
it('hides element when data missing', async () => {
  await wrapper.setProps({ data: { showElement: false } });
  expect(wrapper.find('.element').exists()).toBe(false);
});
```

### Testing Event Emission
```javascript
it('emits event on button click', async () => {
  await wrapper.find('button').trigger('click');
  expect(wrapper.emitted('button-click')).toBeTruthy();
  expect(wrapper.emitted('button-click')[0][0]).toEqual({ expected: 'data' });
});
```

### Testing Arrays/Lists
```javascript
it('renders all items in array', async () => {
  await wrapper.setProps({
    data: {
      items: ['Item 1', 'Item 2', 'Item 3']
    }
  });
  
  const items = wrapper.findAll('.item');
  expect(items).toHaveLength(3);
  expect(items[0].text()).toBe('Item 1');
});
```

### Testing Pods Data
```javascript
it('displays data from Pods', () => {
  // Pods data is passed via props.data
  expect(wrapper.find('.pods-field').text()).toBe(wrapper.props('data').podsField);
});
```

---

## 🐛 Debugging Tips

### Test Failing?

1. **Check the HTML**
   ```javascript
   console.log(wrapper.html());
   ```

2. **Check Component State**
   ```javascript
   console.log(wrapper.vm.$data);
   ```

3. **Check Props**
   ```javascript
   console.log(wrapper.props());
   ```

4. **Use Test UI**
   ```bash
   npm run test:ui
   ```
   Open browser to see visual test runner

### Common Issues

**Issue**: "Cannot find element"  
**Fix**: Element might not exist yet. Use `await wrapper.vm.$nextTick()`

**Issue**: "Pinia store not initialized"  
**Fix**: Ensure `createTestingPinia()` in global plugins

**Issue**: "Module not found"  
**Fix**: Check import paths, might need `../../../` to reach components

---

## 📊 Tracking Progress

### Check Current Coverage
```bash
npm run test:coverage
```

Look for:
- **Overall**: Should be >80%
- **Components**: Should be >85%
- **Uncovered Lines**: Focus testing efforts here

### Coverage Report Location
```
coverage/
├── index.html          # Open this in browser
├── coverage-final.json # JSON data
└── ...
```

### Update Progress

Edit `PHASE-4-CHECKLIST.md` to mark tests complete:
```markdown
- [x] BiographyRenderer.spec.js - Complete
- [x] TopicsRenderer.spec.js - Complete
```

---

## 🎓 Learning Resources

### Official Docs
- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)

### Project Files
- `tests/unit/components/HeroRenderer.spec.js` - Complete example
- `PHASE-4-TESTING-COMPLETE-GUIDE.md` - Comprehensive guide
- `tests/setup.js` - See what's mocked globally

---

## ⏱️ Time Estimates

Based on complexity:

**Simple Components** (15-30 min):
- Social, Stats, Logo Grid

**Medium Components** (30-60 min):
- Contact, Call to Action, Guest Intro

**Complex Components** (60-90 min):
- Biography, Topics, Questions, Testimonials

**Very Complex** (90+ min):
- Photo Gallery, Video Player, Podcast Player

**Total Estimate**: 12-20 hours for all 16 components

---

## ✅ Daily Goals

### Day 1 (2-3 hours)
- [ ] Generate all test files
- [ ] Complete Biography test
- [ ] Complete Contact test

### Day 2 (2-3 hours)
- [ ] Complete Topics test
- [ ] Complete Social test
- [ ] Complete Questions test

### Day 3 (2-3 hours)
- [ ] Complete Testimonials test
- [ ] Complete Guest Intro test
- [ ] Complete Authority Hook test

### Day 4 (2-3 hours)
- [ ] Complete Call to Action test
- [ ] Complete 2-3 P2 components

### Day 5 (2-3 hours)
- [ ] Complete remaining P2 components
- [ ] Run full coverage
- [ ] Fix any gaps

---

## 🎉 When You're Done

### Final Steps
1. Run full test suite: `npm test`
2. Check coverage: `npm run test:coverage`
3. Verify >80% coverage achieved
4. Update `PHASE-4-CHECKLIST.md`
5. Commit all tests to git

### Celebrate! 🎊
You've completed Phase 4 testing and achieved >80% code coverage!

---

## 💬 Need Help?

### Resources
1. Review `HeroRenderer.spec.js` for examples
2. Read `PHASE-4-TESTING-COMPLETE-GUIDE.md`
3. Check official Vitest/Vue Test Utils docs
4. Use `npm run test:ui` for visual debugging

### Quick Commands
```bash
generate-tests.bat           # Generate test files
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
npm run test:ui             # Visual test UI
```

---

**Good luck! You've got this! 💪**
