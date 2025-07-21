/**
 * PHASE 1.1 ROOT FIX VALIDATION SCRIPT
 * Run this in browser console to validate all fixes are working
 */

function validatePhase11Fixes() {
    console.group('🔍 PHASE 1.1 ROOT FIX VALIDATION');
    
    // 1. Check URL post_id detection
    const urlParams = new URLSearchParams(window.location.search);
    const urlPostId = urlParams.get('post_id');
    console.log('✅ URL post_id detected:', urlPostId);
    
    // 2. Check global data availability
    console.log('✅ Global data objects:');
    console.log('   - window.gmkbData?.postId:', window.gmkbData?.postId);
    console.log('   - window.guestifyData?.postId:', window.guestifyData?.postId);
    console.log('   - window.ajaxurl:', window.ajaxurl || window.gmkbData?.ajaxUrl);
    console.log('   - Nonce available:', !!(window.gmkbData?.nonce || window.guestifyData?.nonce));
    
    // 3. Check topics components
    const topicsElements = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]');
    console.log('✅ Topics components found:', topicsElements.length);
    
    topicsElements.forEach((element, index) => {
        const postId = element.dataset.postId;
        const loadingResolved = element.getAttribute('data-loading-resolved');
        console.log(`   Component ${index + 1}: postId=${postId}, loadingResolved=${loadingResolved}`);
    });
    
    // 4. Check for loading states
    const loadingElements = document.querySelectorAll('.loading-indicator, .loading-message, [data-loading="true"]');
    console.log('✅ Stuck loading elements:', loadingElements.length);
    if (loadingElements.length > 0) {
        console.warn('⚠️ Found stuck loading elements:', loadingElements);
    }
    
    // 5. Test AJAX call simulation
    console.log('✅ Testing AJAX call simulation...');
    const testFormData = new FormData();
    testFormData.append('action', 'save_custom_topics');
    testFormData.append('post_id', urlPostId || '32372');
    testFormData.append('media_kit_post_id', urlPostId || '32372');
    testFormData.append('nonce', window.gmkbData?.nonce || 'test');
    testFormData.append('topics', JSON.stringify({topic_1: 'Test Topic'}));
    
    console.log('   FormData contents:');
    for (let [key, value] of testFormData.entries()) {
        console.log(`   - ${key}: ${value}`);
    }
    
    // 6. Check template debugging
    const debugSections = document.querySelectorAll('details');
    console.log('✅ Debug sections available:', debugSections.length);
    
    console.groupEnd();
    
    // Summary
    const hasPostId = !!(urlPostId || window.gmkbData?.postId);
    const hasComponents = topicsElements.length > 0;
    const noStuckLoading = loadingElements.length === 0;
    
    console.log('📊 PHASE 1.1 VALIDATION SUMMARY:');
    console.log(`   ✅ Post ID Available: ${hasPostId}`);
    console.log(`   ✅ Components Found: ${hasComponents}`);
    console.log(`   ✅ No Stuck Loading: ${noStuckLoading}`);
    console.log(`   ✅ Overall Status: ${hasPostId && hasComponents && noStuckLoading ? 'PASS' : 'NEEDS_ATTENTION'}`);
    
    return {
        hasPostId,
        hasComponents,
        noStuckLoading,
        postId: urlPostId || window.gmkbData?.postId,
        componentsCount: topicsElements.length,
        stuckLoadingCount: loadingElements.length
    };
}

// Auto-run validation
validatePhase11Fixes();

// Make available globally
window.validatePhase11 = validatePhase11Fixes;

console.log('🔧 Phase 1.1 validation loaded. Run validatePhase11() anytime to check status.');
