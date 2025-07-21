/**
 * TEST: Unified Post ID Detection Fix
 * Tests that both preview and sidebar use identical post ID detection
 * 
 * Usage: Run in browser console on Media Kit Builder page
 */

function testUnifiedPostIdFix() {
    console.log('🧪 TESTING: Unified Post ID Detection Fix');
    console.log('═'.repeat(60));
    
    // Test 1: Check JavaScript has post ID
    const jsPostId = window.gmkbData?.postId;
    console.log(`1️⃣ JavaScript Post ID: ${jsPostId || 'MISSING'}`);
    
    // Test 2: Check if design panel will pass post ID
    const mockAjaxData = new FormData();
    mockAjaxData.append('action', 'guestify_render_design_panel');
    mockAjaxData.append('component', 'topics');
    mockAjaxData.append('post_id', jsPostId); // ✅ This is the fix
    mockAjaxData.append('nonce', window.guestifyData?.nonce || 'test');
    
    console.log(`2️⃣ AJAX Request will include post_id: ${jsPostId ? '✅ YES' : '❌ NO'}`);
    
    // Test 3: Check current sidebar data
    const sidebarTopics = document.querySelectorAll('.live-topic-item').length;
    const sidebarMessage = document.querySelector('.empty-state-message')?.textContent?.trim();
    
    console.log(`3️⃣ Current Sidebar Topics: ${sidebarTopics}`);
    if (sidebarMessage) {
        console.log(`3️⃣ Sidebar Message: "${sidebarMessage}"`);
    }
    
    // Test 4: Check preview data
    const previewTopics = document.querySelectorAll('.topic-item').length;
    const previewContainer = document.querySelector('.topics-container');
    const previewPostId = previewContainer?.getAttribute('data-post-id');
    
    console.log(`4️⃣ Preview Topics: ${previewTopics}`);
    console.log(`4️⃣ Preview Post ID: ${previewPostId || 'MISSING'}`);
    
    // Test 5: Comparison
    console.log('═'.repeat(60));
    console.log('📊 COMPARISON RESULTS:');
    
    const unifiedPostId = jsPostId === previewPostId;
    const bothHaveData = sidebarTopics > 0 && previewTopics > 0;
    const bothEmpty = sidebarTopics === 0 && previewTopics === 0;
    const consistent = bothHaveData || bothEmpty;
    
    console.log(`   Post ID Unified: ${unifiedPostId ? '✅ YES' : '❌ NO'} (JS: ${jsPostId}, Preview: ${previewPostId})`);
    console.log(`   Data Consistent: ${consistent ? '✅ YES' : '❌ NO'} (Sidebar: ${sidebarTopics}, Preview: ${previewTopics})`);
    
    // Test 6: Fix Status
    console.log('═'.repeat(60));
    if (unifiedPostId && consistent) {
        console.log('🎉 FIX STATUS: ✅ SUCCESS - Unified post ID detection working!');
        console.log('   Both sidebar and preview should show identical data');
    } else if (unifiedPostId && !consistent) {
        console.log('⚠️ FIX STATUS: 🔄 PARTIAL - Post ID unified but data inconsistent');
        console.log('   May need to refresh design panel to see fix');
    } else {
        console.log('❌ FIX STATUS: 🚨 FAILED - Post ID detection still inconsistent');
        console.log('   Check if gmkbData.postId is available and fix is applied');
    }
    
    return {
        jsPostId,
        previewPostId,
        sidebarTopics,
        previewTopics,
        unifiedPostId,
        consistent,
        fixWorking: unifiedPostId && consistent
    };
}

// Auto-run test
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testUnifiedPostIdFix);
} else {
    testUnifiedPostIdFix();
}

// Make available globally
window.testUnifiedPostIdFix = testUnifiedPostIdFix;

console.log('🧪 Unified Post ID Fix Test loaded. Run testUnifiedPostIdFix() to test.');
