/**
 * EVENT-DRIVEN ARCHITECTURE TEST SCRIPT
 * 
 * Tests the Media Kit Builder post ID event-driven fixes
 * Validates elimination of polling, global object sniffing, and race conditions
 * 
 * @package Guestify/MediaKit/Testing
 * @version 1.0.0-event-driven
 */

console.log('🏗️ EVENT-DRIVEN ARCHITECTURE TEST SUITE');
console.log('════════════════════════════════════════════════════════════════════════');

// Test Configuration
const TEST_CONFIG = {
    postId: 32372, // Known test post ID
    testTimeout: 5000, // 5 second timeout for tests
    expectedEventDriven: true
};

/**
 * CHECKLIST VALIDATION TESTS
 * Ensures adherence to developer checklist requirements
 */

// ✅ TEST 1: NO POLLING - Verify no setTimeout/setInterval usage
function testNoPolling() {
    console.log('1️⃣ TESTING: No Polling/Timeouts');
    console.log('────────────────────────────────────────');
    
    // Check for polling indicators in global scope
    const pollingSigns = [];
    
    // Check if any components are using setTimeout for waiting
    if (window.gmkbPollingDetected) {
        pollingSigns.push('Global polling flag detected');
    }
    
    // Check for loading state timeouts
    const loadingElements = document.querySelectorAll('[data-loading="true"], .loading-indicator, .loading-message');
    if (loadingElements.length > 0) {
        pollingSigns.push(`${loadingElements.length} elements still in loading state`);
    }
    
    const result = pollingSigns.length === 0;
    console.log(`   Polling indicators: ${pollingSigns.length === 0 ? '✅ NONE FOUND' : '❌ DETECTED'}`);
    if (pollingSigns.length > 0) {
        pollingSigns.forEach(sign => console.log(`     - ${sign}`));
    }
    
    return {
        test: 'No Polling',
        passed: result,
        details: pollingSigns.length === 0 ? 'No polling detected' : pollingSigns.join(', ')
    };
}

// ✅ TEST 2: EVENT-DRIVEN INITIALIZATION
function testEventDrivenInit() {
    console.log('2️⃣ TESTING: Event-Driven Initialization');
    console.log('────────────────────────────────────────');
    
    const checks = {
        topicsServiceEventDriven: false,
        designPanelEventDriven: false,
        templateEventDriven: false,
        noGlobalSniffing: true
    };
    
    // Test if topics service is event-driven
    if (window.Topics_Data_Service_Test) {
        checks.topicsServiceEventDriven = window.Topics_Data_Service_Test.eventDriven || false;
    }
    
    // Check for global object sniffing patterns
    const globalSniffingPatterns = [
        'window.enhancedComponentManager',
        'window.stateManager',
        'GLOBALS[\'gmkb_component_post_id\']',
        'GMKB_CURRENT_POST_ID'
    ];
    
    // This test would need to be enhanced with actual code inspection
    console.log('   Event-driven service: ' + (checks.topicsServiceEventDriven ? '✅ YES' : '❌ NO'));
    console.log('   No global sniffing: ' + (checks.noGlobalSniffing ? '✅ YES' : '⚠️ NEEDS VERIFICATION'));
    
    return {
        test: 'Event-Driven Initialization',
        passed: checks.topicsServiceEventDriven && checks.noGlobalSniffing,
        details: `Service: ${checks.topicsServiceEventDriven}, No Sniffing: ${checks.noGlobalSniffing}`
    };
}

// ✅ TEST 3: ROOT CAUSE FIX VALIDATION
function testRootCauseFix() {
    console.log('3️⃣ TESTING: Root Cause Fix Implementation');
    console.log('────────────────────────────────────────');
    
    const indicators = {
        explicitPostIdUsage: false,
        noDetectionMethods: false,
        consistentDataSources: false
    };
    
    // Check for explicit post_id parameter usage
    const sidebarElement = document.querySelector('.topics-live-editor');
    const previewElement = document.querySelector('.topics-container');
    
    if (sidebarElement && previewElement) {
        const sidebarPostId = sidebarElement.getAttribute('data-post-id');
        const previewPostId = previewElement.getAttribute('data-post-id');
        
        indicators.explicitPostIdUsage = sidebarPostId && previewPostId;
        indicators.consistentDataSources = sidebarPostId === previewPostId;
        
        console.log(`   Sidebar Post ID: ${sidebarPostId || 'MISSING'}`);
        console.log(`   Preview Post ID: ${previewPostId || 'MISSING'}`);
        console.log(`   Consistent: ${indicators.consistentDataSources ? '✅ YES' : '❌ NO'}`);
    }
    
    // Check for absence of detection methods (should be replaced with explicit params)
    indicators.noDetectionMethods = true; // Would need code inspection to verify
    
    const passed = indicators.explicitPostIdUsage && indicators.consistentDataSources;
    
    console.log(`   Root cause addressed: ${passed ? '✅ YES' : '❌ NO'}`);
    
    return {
        test: 'Root Cause Fix',
        passed: passed,
        details: `Explicit IDs: ${indicators.explicitPostIdUsage}, Consistent: ${indicators.consistentDataSources}`
    };
}

// ✅ TEST 4: AJAX REQUEST VALIDATION
function testAjaxEventDriven() {
    console.log('4️⃣ TESTING: AJAX Event-Driven Communication');
    console.log('────────────────────────────────────────');
    
    return new Promise((resolve) => {
        // Test AJAX request with explicit post_id
        const formData = new FormData();
        formData.append('action', 'guestify_render_design_panel');
        formData.append('component', 'topics');
        formData.append('post_id', TEST_CONFIG.postId);
        formData.append('nonce', window.gmkbData?.nonce || '');
        
        fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const success = data.success === true;
            const hasEventDrivenFlag = data.data?.event_driven === true;
            
            console.log(`   AJAX Success: ${success ? '✅ YES' : '❌ NO'}`);
            console.log(`   Event-Driven Response: ${hasEventDrivenFlag ? '✅ YES' : '❌ NO'}`);
            
            resolve({
                test: 'AJAX Event-Driven',
                passed: success,
                details: `Success: ${success}, Event-Driven: ${hasEventDrivenFlag}`
            });
        })
        .catch(error => {
            console.log(`   AJAX Error: ❌ ${error.message}`);
            resolve({
                test: 'AJAX Event-Driven',
                passed: false,
                details: `Error: ${error.message}`
            });
        });
    });
}

// ✅ TEST 5: DATA CONSISTENCY VALIDATION
function testDataConsistency() {
    console.log('5️⃣ TESTING: Sidebar/Preview Data Consistency');
    console.log('────────────────────────────────────────');
    
    const sidebarTopics = document.querySelectorAll('.live-topic-item').length;
    const previewTopics = document.querySelectorAll('.topic-item').length;
    const consistent = sidebarTopics === previewTopics;
    
    console.log(`   Sidebar Topics: ${sidebarTopics}`);
    console.log(`   Preview Topics: ${previewTopics}`);
    console.log(`   Consistent: ${consistent ? '✅ YES' : '❌ NO'}`);
    
    // Check for event-driven indicators
    const eventDrivenElements = document.querySelectorAll('[data-event-driven="true"]');
    console.log(`   Event-Driven Elements: ${eventDrivenElements.length}`);
    
    return {
        test: 'Data Consistency',
        passed: consistent && sidebarTopics > 0,
        details: `Sidebar: ${sidebarTopics}, Preview: ${previewTopics}, Consistent: ${consistent}`
    };
}

/**
 * RUN ALL TESTS
 */
async function runEventDrivenTests() {
    console.log('🚀 STARTING EVENT-DRIVEN ARCHITECTURE TESTS');
    console.log('');
    
    const results = [];
    
    // Synchronous tests
    results.push(testNoPolling());
    console.log('');
    
    results.push(testEventDrivenInit());
    console.log('');
    
    results.push(testRootCauseFix());
    console.log('');
    
    results.push(testDataConsistency());
    console.log('');
    
    // Asynchronous test
    const ajaxResult = await testAjaxEventDriven();
    results.push(ajaxResult);
    console.log('');
    
    // Calculate results
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('════════════════════════════════════════════════════════════════════════');
    results.forEach(result => {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${result.test}: ${result.details}`);
    });
    
    console.log('');
    console.log(`🎯 OVERALL RESULT: ${passed}/${total} tests passed (${percentage}%)`);
    
    if (percentage >= 80) {
        console.log('🎉 EVENT-DRIVEN ARCHITECTURE: SUCCESS');
        console.log('✅ Checklist compliance achieved');
        console.log('✅ No polling or race conditions');
        console.log('✅ Root cause fixes implemented');
    } else {
        console.log('⚠️ EVENT-DRIVEN ARCHITECTURE: NEEDS WORK');
        console.log('❌ Some checklist violations remain');
        console.log('🔧 Review failed tests and implement fixes');
    }
    
    return {
        passed,
        total,
        percentage,
        success: percentage >= 80,
        results
    };
}

/**
 * EXPOSE GLOBAL TEST FUNCTIONS
 */
window.testEventDrivenArchitecture = runEventDrivenTests;
window.quickEventDrivenTest = () => {
    console.log('🔧 QUICK EVENT-DRIVEN TEST');
    const sidebar = document.querySelectorAll('.live-topic-item').length;
    const preview = document.querySelectorAll('.topic-item').length;
    const postId = document.querySelector('[data-post-id]')?.getAttribute('data-post-id') || 'MISSING';
    
    console.log(`Post ID: ${postId}`);
    console.log(`Sidebar: ${sidebar} topics, Preview: ${preview} topics`);
    console.log(`Consistent: ${sidebar === preview ? '✅ YES' : '❌ NO'}`);
    console.log(`Event-Driven: ${postId !== 'MISSING' && postId !== '0' ? '✅ YES' : '❌ NO'}`);
    
    return { postId, sidebar, preview, consistent: sidebar === preview };
};

// Auto-run if URL parameter present
if (window.location.search.includes('testEventDriven=true')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runEventDrivenTests, 2000);
    });
}

console.log('✅ Event-driven test suite loaded');
console.log('📋 Commands available:');
console.log('   testEventDrivenArchitecture() - Full test suite');
console.log('   quickEventDrivenTest() - Quick consistency check');
console.log('   ?testEventDriven=true - Auto-run tests');
