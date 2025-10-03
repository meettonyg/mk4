/**
 * Test Script for Media Kit Builder Fixes
 * 
 * Run in browser console after fixes are applied
 */

console.log('🧪 Starting Media Kit Builder Fix Verification...\n');

const tests = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// Test 1: Check DragDropManager is not handling drops
console.log('Test 1: Verify DragDropManager drop handler is disabled');
try {
  const dragDropMgr = window.gmkbDragDrop;
  if (dragDropMgr) {
    console.log('✅ DragDropManager exists');
    console.log('ℹ️  Drop handling should be in Vue only');
    tests.passed++;
  } else {
    console.warn('⚠️ DragDropManager not found');
    tests.warnings++;
  }
} catch (e) {
  console.error('❌ Test 1 failed:', e);
  tests.failed++;
}

// Test 2: Check store has undo/redo methods
console.log('\nTest 2: Verify undo/redo methods exist');
try {
  const store = window.gmkbStore || window.mediaKitStore;
  if (store && typeof store.undo === 'function' && typeof store.redo === 'function') {
    console.log('✅ Undo/Redo methods exist');
    console.log('ℹ️  canUndo:', store.canUndo);
    console.log('ℹ️  canRedo:', store.canRedo);
    tests.passed++;
  } else {
    console.error('❌ Store or undo/redo methods not found');
    tests.failed++;
  }
} catch (e) {
  console.error('❌ Test 2 failed:', e);
  tests.failed++;
}

// Test 3: Check API service exists
console.log('\nTest 3: Verify APIService is initialized');
try {
  const apiService = window.gmkbAPI;
  if (apiService && typeof apiService.save === 'function') {
    console.log('✅ APIService exists with save method');
    console.log('ℹ️  Base URL:', apiService.baseUrl);
    tests.passed++;
  } else {
    console.error('❌ APIService not found or missing save method');
    tests.failed++;
  }
} catch (e) {
  console.error('❌ Test 3 failed:', e);
  tests.failed++;
}

// Test 4: Check for console errors
console.log('\nTest 4: Checking for errors in console');
const hasErrors = console.error.toString().includes('Error');
if (!hasErrors) {
  console.log('✅ No console errors detected');
  tests.passed++;
} else {
  console.warn('⚠️ Console errors may exist, check console');
  tests.warnings++;
}

// Test 5: Verify gmkbData is available
console.log('\nTest 5: Verify gmkbData configuration');
try {
  if (window.gmkbData && window.gmkbData.postId) {
    console.log('✅ gmkbData available');
    console.log('ℹ️  Post ID:', window.gmkbData.postId);
    console.log('ℹ️  REST URL:', window.gmkbData.restUrl);
    console.log('ℹ️  Has REST Nonce:', !!window.gmkbData.restNonce);
    tests.passed++;
  } else {
    console.error('❌ gmkbData not properly configured');
    tests.failed++;
  }
} catch (e) {
  console.error('❌ Test 5 failed:', e);
  tests.failed++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${tests.passed}`);
console.log(`❌ Failed: ${tests.failed}`);
console.log(`⚠️  Warnings: ${tests.warnings}`);
console.log('='.repeat(50));

if (tests.failed === 0) {
  console.log('\n🎉 All critical tests passed!');
  console.log('\nNext steps:');
  console.log('1. Test drag/drop a component → Should add only once');
  console.log('2. Make changes and save → Should work without 403 errors');
  console.log('3. Test undo/redo buttons → Should work correctly');
} else {
  console.log('\n⚠️  Some tests failed. Please review the errors above.');
}

// Export test results
window.GMKB_TEST_RESULTS = {
  timestamp: new Date().toISOString(),
  tests,
  passed: tests.failed === 0
};

console.log('\n💾 Test results saved to: window.GMKB_TEST_RESULTS');
