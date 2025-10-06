/**
 * Test Suite for Deep Clone Utilities
 * 
 * Run this in browser console or add to your test framework
 */

import { deepClone, generateUniqueId, deepEqual } from './deepClone.js';

export const testDeepCloneUtilities = () => {
  console.log('🧪 Testing Deep Clone Utilities...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Helper function
  const test = (name, fn) => {
    totalTests++;
    try {
      fn();
      console.log(`✅ ${name}`);
      passedTests++;
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
    }
  };
  
  // Test 1: Deep Clone - No Shared References
  test('deepClone creates independent copies', () => {
    const original = {
      id: '1',
      nested: { value: 'test', array: [1, 2, 3] }
    };
    
    const cloned = deepClone(original);
    
    // Modify original
    original.nested.value = 'changed';
    original.nested.array.push(4);
    
    // Cloned should be unchanged
    if (cloned.nested.value !== 'test') {
      throw new Error('Deep clone failed - value was modified');
    }
    if (cloned.nested.array.length !== 3) {
      throw new Error('Deep clone failed - array was modified');
    }
  });
  
  // Test 2: Deep Clone - Handles Dates
  test('deepClone handles Date objects', () => {
    const original = {
      date: new Date('2025-01-01'),
      nested: { timestamp: new Date() }
    };
    
    const cloned = deepClone(original);
    
    if (!(cloned.date instanceof Date)) {
      throw new Error('Date object not preserved');
    }
    if (cloned.date.getTime() !== original.date.getTime()) {
      throw new Error('Date value not preserved');
    }
  });
  
  // Test 3: Deep Clone - Handles Arrays
  test('deepClone handles arrays correctly', () => {
    const original = [1, 2, { nested: [3, 4] }];
    const cloned = deepClone(original);
    
    original[2].nested.push(5);
    
    if (cloned[2].nested.length !== 2) {
      throw new Error('Array deep clone failed');
    }
  });
  
  // Test 4: Generate Unique IDs
  test('generateUniqueId produces unique IDs', () => {
    const ids = new Set();
    
    // Generate 1000 IDs rapidly
    for (let i = 0; i < 1000; i++) {
      const id = generateUniqueId('test');
      if (ids.has(id)) {
        throw new Error(`Duplicate ID found: ${id}`);
      }
      ids.add(id);
    }
    
    if (ids.size !== 1000) {
      throw new Error('Not all IDs are unique');
    }
  });
  
  // Test 5: Deep Equal - Identical Objects
  test('deepEqual returns true for identical objects', () => {
    const obj1 = { a: 1, b: { c: 2, d: [3, 4] } };
    const obj2 = { a: 1, b: { c: 2, d: [3, 4] } };
    
    if (!deepEqual(obj1, obj2)) {
      throw new Error('deepEqual failed for identical objects');
    }
  });
  
  // Test 6: Deep Equal - Different Objects
  test('deepEqual returns false for different objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 3 } };
    
    if (deepEqual(obj1, obj2)) {
      throw new Error('deepEqual failed to detect difference');
    }
  });
  
  // Test 7: Deep Equal - Performance
  test('deepEqual is faster than JSON.stringify', () => {
    const largeObj = {};
    for (let i = 0; i < 100; i++) {
      largeObj[`key${i}`] = { nested: { value: i, array: [i, i+1, i+2] } };
    }
    
    const obj1 = deepClone(largeObj);
    const obj2 = deepClone(largeObj);
    
    // Test JSON method
    const jsonStart = performance.now();
    const jsonResult = JSON.stringify(obj1) === JSON.stringify(obj2);
    const jsonTime = performance.now() - jsonStart;
    
    // Test deepEqual method
    const deepStart = performance.now();
    const deepResult = deepEqual(obj1, obj2);
    const deepTime = performance.now() - deepStart;
    
    console.log(`  ⏱️  JSON: ${jsonTime.toFixed(3)}ms, deepEqual: ${deepTime.toFixed(3)}ms`);
    console.log(`  🚀 deepEqual is ${(jsonTime / deepTime).toFixed(1)}x faster`);
    
    if (deepTime > jsonTime) {
      throw new Error('deepEqual is not faster than JSON method');
    }
  });
  
  // Test 8: Component Duplication Simulation
  test('Component duplication prevents data bleeding', () => {
    // Simulate a component
    const originalComponent = {
      id: 'comp1',
      type: 'hero',
      data: {
        title: 'Original',
        content: { text: 'Test', nested: { deep: 'value' } }
      },
      props: { fontSize: 16 },
      settings: { visible: true }
    };
    
    // Simulate duplication (the way it's now done in store)
    const cloned = deepClone(originalComponent);
    cloned.id = generateUniqueId('comp');
    cloned.createdAt = Date.now();
    
    // Modify original
    originalComponent.data.title = 'Modified';
    originalComponent.data.content.nested.deep = 'changed';
    originalComponent.props.fontSize = 24;
    
    // Verify clone is unchanged
    if (cloned.data.title !== 'Original') {
      throw new Error('Title was affected');
    }
    if (cloned.data.content.nested.deep !== 'value') {
      throw new Error('Nested data was affected');
    }
    if (cloned.props.fontSize !== 16) {
      throw new Error('Props were affected');
    }
  });
  
  // Summary
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! ✅\n');
    return true;
  } else {
    console.error(`⚠️ ${totalTests - passedTests} tests failed\n`);
    return false;
  }
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.testDeepCloneUtilities = testDeepCloneUtilities;
  console.log('💡 Run testDeepCloneUtilities() to test the utilities');
}
