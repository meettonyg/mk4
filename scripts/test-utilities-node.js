#!/usr/bin/env node

/**
 * Node.js Test Runner for Deep Clone Utilities
 * 
 * Run this to test the utilities without needing a browser:
 * node test-utilities-node.js
 */

import { deepClone, generateUniqueId, deepEqual } from './src/utils/deepClone.js';

console.log('🧪 Testing Gemini Fixes (Node.js)\n');
console.log('=====================================\n');

let passed = 0;
let total = 0;

const test = (name, fn) => {
  total++;
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error('   Error:', error.message);
  }
};

// Test 1: Deep Clone - No Shared References
test('Deep Clone - No Shared References', () => {
  const original = { nested: { value: 'test', array: [1, 2, 3] } };
  const cloned = deepClone(original);
  
  original.nested.value = 'changed';
  original.nested.array.push(4);
  
  if (cloned.nested.value !== 'test') {
    throw new Error('Value was modified');
  }
  if (cloned.nested.array.length !== 3) {
    throw new Error('Array was modified');
  }
});

// Test 2: Deep Clone - Handles Dates
test('Deep Clone - Handles Dates', () => {
  const original = { date: new Date('2025-01-01') };
  const cloned = deepClone(original);
  
  if (!(cloned.date instanceof Date)) {
    throw new Error('Date not preserved');
  }
  if (cloned.date.getTime() !== original.date.getTime()) {
    throw new Error('Date value wrong');
  }
});

// Test 3: Deep Clone - Handles Arrays
test('Deep Clone - Handles Arrays', () => {
  const original = [1, 2, { nested: [3, 4] }];
  const cloned = deepClone(original);
  
  original[2].nested.push(5);
  
  if (cloned[2].nested.length !== 2) {
    throw new Error('Array deep clone failed');
  }
});

// Test 4: Generate Unique IDs
test('Generate 1000 Unique IDs', () => {
  const ids = new Set();
  
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
  
  console.log('   Generated 1000 unique IDs successfully');
});

// Test 5: Deep Equal - Identical Objects
test('Deep Equal - Identical Objects', () => {
  const obj1 = { a: 1, b: { c: 2, d: [3, 4] } };
  const obj2 = { a: 1, b: { c: 2, d: [3, 4] } };
  
  if (!deepEqual(obj1, obj2)) {
    throw new Error('Failed to detect equality');
  }
});

// Test 6: Deep Equal - Different Objects
test('Deep Equal - Different Objects', () => {
  const obj1 = { a: 1, b: { c: 2 } };
  const obj2 = { a: 1, b: { c: 3 } };
  
  if (deepEqual(obj1, obj2)) {
    throw new Error('Failed to detect difference');
  }
});

// Test 7: Performance Comparison
test('Performance: deepEqual vs JSON', () => {
  const largeObj = {};
  for (let i = 0; i < 100; i++) {
    largeObj[`key${i}`] = { nested: { value: i, array: [i, i+1, i+2] } };
  }
  
  const obj1 = deepClone(largeObj);
  const obj2 = deepClone(largeObj);
  
  // JSON method
  const jsonStart = Date.now();
  JSON.stringify(obj1) === JSON.stringify(obj2);
  const jsonTime = Date.now() - jsonStart;
  
  // deepEqual method
  const deepStart = Date.now();
  deepEqual(obj1, obj2);
  const deepTime = Date.now() - deepStart;
  
  const speedup = jsonTime / deepTime;
  
  console.log(`   JSON: ${jsonTime}ms, deepEqual: ${deepTime}ms`);
  console.log(`   ⚡ ${speedup.toFixed(1)}x faster!`);
  
  if (deepTime > jsonTime) {
    throw new Error('deepEqual slower than JSON');
  }
});

// Test 8: Real World Component Duplication
test('Component Duplication (Real World)', () => {
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
  
  // Simulate duplication
  const cloned = deepClone(originalComponent);
  cloned.id = generateUniqueId('comp');
  cloned.createdAt = Date.now();
  
  // Modify original
  originalComponent.data.title = 'Modified';
  originalComponent.data.content.nested.deep = 'changed';
  originalComponent.props.fontSize = 24;
  
  // Verify clone unchanged
  if (cloned.data.title !== 'Original') {
    throw new Error('Title was affected');
  }
  if (cloned.data.content.nested.deep !== 'value') {
    throw new Error('Nested data was affected');
  }
  if (cloned.props.fontSize !== 16) {
    throw new Error('Props were affected');
  }
  
  console.log('   Component duplication is 100% safe!');
});

// Summary
console.log('\n=====================================');
const successRate = (passed / total * 100).toFixed(1);

if (passed === total) {
  console.log(`🎉 All Tests Passed! ${passed}/${total} (${successRate}%)`);
  console.log('\n✅ Utilities are working correctly!');
  console.log('💡 Now run: npm run build');
  process.exit(0);
} else {
  console.log(`⚠️ Some Tests Failed: ${passed}/${total} (${successRate}%)`);
  console.log('\n❌ Fix the issues before building');
  process.exit(1);
}
