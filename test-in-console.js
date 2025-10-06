/**
 * Console Test Runner for Gemini Fixes
 * 
 * Copy and paste this entire file into your browser console
 * when you're on the Media Kit Builder page
 */

(async function testGeminiFixes() {
  console.log('%c🧪 Gemini Critical Fixes - Test Suite', 'font-size: 20px; color: #4CAF50; font-weight: bold;');
  console.log('=====================================\n');
  
  try {
    // Import utilities
    const { deepClone, generateUniqueId, deepEqual } = await import('./src/utils/deepClone.js');
    
    let passed = 0;
    let total = 0;
    
    const test = (name, fn) => {
      total++;
      try {
        fn();
        console.log(`%c✅ ${name}`, 'color: green; font-weight: bold;');
        passed++;
      } catch (error) {
        console.error(`%c❌ ${name}`, 'color: red; font-weight: bold;');
        console.error('   Error:', error.message);
      }
    };
    
    // Test 1
    test('Deep Clone - No Shared References', () => {
      const original = { nested: { value: 'test', array: [1, 2, 3] } };
      const cloned = deepClone(original);
      
      original.nested.value = 'changed';
      original.nested.array.push(4);
      
      if (cloned.nested.value !== 'test') throw new Error('Value was modified');
      if (cloned.nested.array.length !== 3) throw new Error('Array was modified');
    });
    
    // Test 2
    test('Deep Clone - Handles Dates', () => {
      const original = { date: new Date('2025-01-01') };
      const cloned = deepClone(original);
      
      if (!(cloned.date instanceof Date)) throw new Error('Date not preserved');
      if (cloned.date.getTime() !== original.date.getTime()) throw new Error('Date value wrong');
    });
    
    // Test 3
    test('Unique ID Generation (1000 IDs)', () => {
      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        const id = generateUniqueId('test');
        if (ids.has(id)) throw new Error(`Duplicate ID: ${id}`);
        ids.add(id);
      }
      console.log(`   Generated 1000 unique IDs`);
    });
    
    // Test 4
    test('Deep Equal - Identical Objects', () => {
      const obj1 = { a: 1, b: { c: 2, d: [3, 4] } };
      const obj2 = { a: 1, b: { c: 2, d: [3, 4] } };
      
      if (!deepEqual(obj1, obj2)) throw new Error('Failed to detect equality');
    });
    
    // Test 5
    test('Deep Equal - Different Objects', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 3 } };
      
      if (deepEqual(obj1, obj2)) throw new Error('Failed to detect difference');
    });
    
    // Test 6 - Performance
    test('Performance: deepEqual vs JSON', () => {
      const largeObj = {};
      for (let i = 0; i < 100; i++) {
        largeObj[`key${i}`] = { nested: { value: i, array: [i, i+1, i+2] } };
      }
      
      const obj1 = deepClone(largeObj);
      const obj2 = deepClone(largeObj);
      
      // JSON method
      const jsonStart = performance.now();
      JSON.stringify(obj1) === JSON.stringify(obj2);
      const jsonTime = performance.now() - jsonStart;
      
      // deepEqual method
      const deepStart = performance.now();
      deepEqual(obj1, obj2);
      const deepTime = performance.now() - deepStart;
      
      const speedup = (jsonTime / deepTime).toFixed(1);
      console.log(`   JSON: ${jsonTime.toFixed(3)}ms, deepEqual: ${deepTime.toFixed(3)}ms`);
      console.log(`   %c⚡ ${speedup}x faster!`, 'color: #4CAF50; font-weight: bold;');
      
      if (deepTime > jsonTime) throw new Error('deepEqual slower than JSON');
    });
    
    // Test 7 - Real World Component Duplication
    test('Real World: Component Duplication', () => {
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
      
      // Simulate the new duplication method
      const cloned = deepClone(originalComponent);
      cloned.id = generateUniqueId('comp');
      cloned.createdAt = Date.now();
      
      // Modify original
      originalComponent.data.title = 'Modified';
      originalComponent.data.content.nested.deep = 'changed';
      originalComponent.props.fontSize = 24;
      
      // Verify clone unchanged
      if (cloned.data.title !== 'Original') throw new Error('Title affected');
      if (cloned.data.content.nested.deep !== 'value') throw new Error('Nested data affected');
      if (cloned.props.fontSize !== 16) throw new Error('Props affected');
      
      console.log('   Component duplication is 100% safe! 🎉');
    });
    
    // Summary
    console.log('\n=====================================');
    const successRate = (passed / total * 100).toFixed(1);
    
    if (passed === total) {
      console.log(`%c🎉 All Tests Passed! ${passed}/${total} (${successRate}%)`, 
        'font-size: 16px; color: #4CAF50; font-weight: bold; background: #e8f5e9; padding: 10px;');
    } else {
      console.log(`%c⚠️ Some Tests Failed: ${passed}/${total} (${successRate}%)`, 
        'font-size: 16px; color: #f44336; font-weight: bold; background: #ffebee; padding: 10px;');
    }
    
    console.log('\n📚 For detailed testing, open: test-gemini-fixes.html');
    
  } catch (error) {
    console.error('%c❌ Failed to load utilities', 'color: red; font-weight: bold;');
    console.error('Error:', error.message);
    console.log('\n💡 Make sure you are running this on the Media Kit Builder page');
    console.log('💡 Path should be: ./src/utils/deepClone.js');
  }
})();
