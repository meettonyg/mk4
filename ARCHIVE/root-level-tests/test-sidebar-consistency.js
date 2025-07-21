/**
 * ROOT FIX VALIDATION: Test Sidebar Consistency Fix
 * Tests that sidebar panel and preview area use identical data loading
 * 
 * USAGE:
 * 1. Refresh the Media Kit Builder page
 * 2. Click on a topics component to open sidebar
 * 3. Run in browser console: validateSidebarConsistency()
 * 4. Compare with preview area topics
 */

function testSidebarConsistencyFix() {
    console.log('🔧 ROOT FIX VALIDATION: Testing Sidebar Consistency');
    console.log('================================================');
    
    // Test 1: Check if unified service is active
    const sidebarContainer = document.getElementById('topics-live-editor');
    const unifiedServiceActive = sidebarContainer && sidebarContainer.getAttribute('data-unified-service') === 'true';
    
    console.log('✅ Test 1 - Unified Service Active:', unifiedServiceActive ? 'PASS' : 'FAIL');
    
    // Test 2: Count sidebar topics
    const sidebarTopics = document.querySelectorAll('.live-topic-item');
    const sidebarTopicCount = sidebarTopics.length;
    
    console.log('✅ Test 2 - Sidebar Topics Count:', sidebarTopicCount);
    
    // Test 3: Count preview topics
    const previewTopics = document.querySelectorAll('.topic-item');
    const previewTopicCount = previewTopics.length;
    
    console.log('✅ Test 3 - Preview Topics Count:', previewTopicCount);
    
    // Test 4: Compare consistency
    const isConsistent = sidebarTopicCount === previewTopicCount;
    
    console.log('✅ Test 4 - Sidebar/Preview Consistency:', isConsistent ? 'PASS' : 'FAIL');
    
    // Test 5: Check for empty state
    const emptyState = document.querySelector('.topics-empty-state');
    const hasEmptyState = !!emptyState;
    
    console.log('✅ Test 5 - Empty State Present:', hasEmptyState ? 'YES' : 'NO');
    
    // Test 6: Validate topic content
    const sidebarTopicTitles = Array.from(sidebarTopics).map(item => {
        const input = item.querySelector('.topic-input');
        return input ? input.value : '';
    });
    
    const previewTopicTitles = Array.from(previewTopics).map(item => {
        const title = item.querySelector('.topic-title');
        return title ? title.textContent.trim() : '';
    });
    
    console.log('✅ Test 6 - Sidebar Topics:', sidebarTopicTitles);
    console.log('✅ Test 6 - Preview Topics:', previewTopicTitles);
    
    // Test 7: Content consistency
    const contentMatch = JSON.stringify(sidebarTopicTitles) === JSON.stringify(previewTopicTitles);
    
    console.log('✅ Test 7 - Content Consistency:', contentMatch ? 'PASS' : 'FAIL');
    
    // Final results
    const allTestsPassed = unifiedServiceActive && isConsistent && contentMatch;
    
    console.log('');
    console.log('🎯 FINAL RESULTS:');
    console.log('   Overall Status:', allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
    console.log('   Unified Service:', unifiedServiceActive ? '✅' : '❌');
    console.log('   Count Match:', isConsistent ? '✅' : '❌');
    console.log('   Content Match:', contentMatch ? '✅' : '❌');
    console.log('');
    
    if (allTestsPassed) {
        console.log('🎉 SUCCESS: ROOT FIX COMPLETE - Sidebar now shows same topics as preview!');
    } else {
        console.log('⚠️ ISSUE: Some tests failed. Check the specific test results above.');
        
        if (!isConsistent) {
            console.log('🔍 INCONSISTENCY DETECTED:');
            console.log('   Sidebar has ' + sidebarTopicCount + ' topics');
            console.log('   Preview has ' + previewTopicCount + ' topics');
        }
        
        if (!contentMatch) {
            console.log('🔍 CONTENT MISMATCH DETECTED:');
            console.log('   Check topic titles in sidebar vs preview');
        }
    }
    
    return {
        allTestsPassed,
        unifiedServiceActive,
        sidebarTopicCount,
        previewTopicCount,
        isConsistent,
        contentMatch,
        sidebarTopics: sidebarTopicTitles,
        previewTopics: previewTopicTitles
    };
}

// Quick validation function
function quickSidebarTest() {
    const result = testSidebarConsistencyFix();
    
    if (result.allTestsPassed) {
        console.log('🎉 QUICK TEST: ✅ PASS - Sidebar consistency fixed!');
    } else {
        console.log('⚠️ QUICK TEST: ❌ FAIL - Issues detected. Run testSidebarConsistencyFix() for details.');
    }
    
    return result.allTestsPassed;
}

// Expose functions globally
window.testSidebarConsistencyFix = testSidebarConsistencyFix;
window.quickSidebarTest = quickSidebarTest;

console.log('🔧 ROOT FIX: Sidebar consistency test loaded');
console.log('📋 Available commands:');
console.log('   testSidebarConsistencyFix() - Full test suite');
console.log('   quickSidebarTest() - Quick validation');
console.log('   validateSidebarConsistency() - Built-in validation');
