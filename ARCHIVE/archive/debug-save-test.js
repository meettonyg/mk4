/**
 * Topics Save Functionality Debug Test
 * Use this in browser console to debug save issues
 */

console.log('🔧 Topics Save Debug Test Loaded');

// Test 1: Check if components are loaded
function testComponentsLoaded() {
    console.log('=== TEST 1: Component Loading ===');
    
    if (typeof window.topicsComponentManager === 'undefined') {
        console.error('❌ topicsComponentManager not found');
        return false;
    }
    
    const components = window.topicsComponentManager.components;
    console.log(`✅ Found ${components.size} topics components`);
    
    for (let [id, component] of components) {
        console.log(`📋 Component ${id}:`, {
            postId: component.postId,
            topicsCount: component.topics.length,
            hasNonce: !!component.nonce,
            saveStatus: component.saveStatus
        });
    }
    
    return components.size > 0;
}

// Test 2: Check topic data
function testTopicData() {
    console.log('=== TEST 2: Topic Data ===');
    
    const components = window.topicsComponentManager.components;
    
    for (let [id, component] of components) {
        console.log(`📊 Component ${id} topics:`);
        component.topics.forEach((topic, index) => {
            console.log(`  Topic ${index + 1}: "${topic.title}" (${topic.title.length} chars)`);
            console.log(`    - Has extra spaces: ${topic.title !== topic.title.trim()}`);
            console.log(`    - Element exists: ${!!topic.titleElement}`);
        });
    }
}

// Test 3: Test save functionality
async function testSave() {
    console.log('=== TEST 3: Save Functionality ===');
    
    const components = window.topicsComponentManager.components;
    
    for (let [id, component] of components) {
        console.log(`💾 Testing save for component ${id}`);
        
        try {
            await component.performSave('debug_test');
            console.log('✅ Save completed');
        } catch (error) {
            console.error('❌ Save failed:', error);
        }
    }
}

// Test 4: Check AJAX configuration
function testAjaxConfig() {
    console.log('=== TEST 4: AJAX Configuration ===');
    
    console.log('guestifyMediaKit:', window.guestifyMediaKit);
    console.log('guestifyData:', window.guestifyData);
    
    if (window.guestifyMediaKit) {
        console.log('✅ guestifyMediaKit found:', {
            ajaxUrl: window.guestifyMediaKit.ajaxUrl,
            nonce: window.guestifyMediaKit.nonce ? 'present' : 'missing',
            postId: window.guestifyMediaKit.postId,
            saveAction: window.guestifyMediaKit.saveAction
        });
    } else {
        console.error('❌ guestifyMediaKit not found');
    }
}

// Test 5: Manual topic edit simulation
function testTopicEdit() {
    console.log('=== TEST 5: Topic Edit Simulation ===');
    
    const components = window.topicsComponentManager.components;
    
    for (let [id, component] of components) {
        if (component.topics.length > 0) {
            const topic = component.topics[0];
            const oldValue = topic.title;
            const newValue = 'Debug Test Topic ' + Date.now();
            
            console.log(`📝 Simulating edit: "${oldValue}" → "${newValue}"`);
            
            // Simulate the edit
            component.handleTopicChange(topic, 'title', newValue);
            
            console.log(`✅ Edit simulation complete. New value: "${topic.title}"`);
            console.log(`📊 Unsaved changes: ${component.unsavedChanges}`);
            console.log(`🔔 Save status: ${component.saveStatus}`);
        }
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running All Topics Save Debug Tests');
    console.log('=====================================');
    
    testComponentsLoaded();
    testTopicData();
    testAjaxConfig();
    testTopicEdit();
    
    console.log('⏳ Testing save (this will make an AJAX call)...');
    await testSave();
    
    console.log('🎯 All tests complete! Check above for any ❌ errors.');
}

// Global functions
window.testTopicsSave = runAllTests;
window.testComponentsLoaded = testComponentsLoaded;
window.testTopicData = testTopicData;
window.testSave = testSave;
window.testAjaxConfig = testAjaxConfig;
window.testTopicEdit = testTopicEdit;

console.log('🎯 Debug functions available:');
console.log('  - testTopicsSave() - Run all tests');
console.log('  - testComponentsLoaded() - Check if components loaded');
console.log('  - testTopicData() - Check topic data');
console.log('  - testSave() - Test save functionality');
console.log('  - testAjaxConfig() - Check AJAX setup');
console.log('  - testTopicEdit() - Simulate topic edit');
console.log('  - debugTopicsComponent() - Debug specific component');
console.log('  - triggerTopicsSave() - Trigger save for all components');
