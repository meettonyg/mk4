/**
 * Test script to verify save functionality after fixes
 * Run this in the console to test the save system
 */

console.log('🔧 Testing Media Kit Save Functionality...');
console.log('=====================================');

// Test 1: Check if GMKBComponentRegistry exists
console.log('\n1️⃣ Testing Component Registry...');
if (typeof window.GMKBComponentRegistry !== 'undefined') {
    console.log('✅ GMKBComponentRegistry exists');
    console.log('   Methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.GMKBComponentRegistry)));
} else {
    console.error('❌ GMKBComponentRegistry not found!');
}

// Test 2: Check if SaveService exists
console.log('\n2️⃣ Testing Save Service...');
if (window.GMKB && window.GMKB.SaveService) {
    console.log('✅ SaveService exists');
    console.log('   Post ID:', window.GMKB.SaveService.postId);
    console.log('   Auto-save enabled:', window.GMKB.SaveService.autoSaveEnabled);
} else {
    console.error('❌ SaveService not found!');
}

// Test 3: Check gmkbData
console.log('\n3️⃣ Testing gmkbData...');
if (typeof gmkbData !== 'undefined') {
    console.log('✅ gmkbData exists');
    console.log('   Post ID:', gmkbData.postId || gmkbData.post_id || 'MISSING');
    console.log('   AJAX URL:', gmkbData.ajaxUrl || 'MISSING');
    console.log('   Nonce:', gmkbData.nonce ? gmkbData.nonce.substring(0, 10) + '...' : 'MISSING');
} else {
    console.error('❌ gmkbData not found!');
}

// Test 4: Get current state
console.log('\n4️⃣ Testing State Retrieval...');
let state = null;
if (window.GMKB && window.GMKB.SaveService) {
    state = window.GMKB.SaveService.getState();
    if (state) {
        console.log('✅ State retrieved successfully');
        console.log('   Components:', Object.keys(state.components || {}).length);
        console.log('   Layout items:', (state.layout || []).length);
        console.log('   Theme:', state.theme);
    } else {
        console.error('❌ Failed to retrieve state');
    }
}

// Test 5: Perform test save
console.log('\n5️⃣ Testing Save Functionality...');
console.log('Attempting to save current state...');

if (window.saveMediaKit) {
    window.saveMediaKit().then(result => {
        console.log('✅ Save test completed successfully!');
        console.log('   Response:', result);
    }).catch(error => {
        console.error('❌ Save test failed:', error);
    });
} else {
    console.error('❌ saveMediaKit function not available');
}

console.log('\n=====================================');
console.log('Test script completed. Check results above.');
console.log('\nManual save command: saveMediaKit()');
console.log('Stop auto-save: GMKB.SaveService.stopAutoSave()');
console.log('Start auto-save: GMKB.SaveService.startAutoSave()');
