/**
 * PHASE 1.2 ROOT FIX VALIDATION SCRIPT
 * Tests the ComponentLoader integration fixes
 */

function validatePhase12Fixes() {
    console.group('🔍 PHASE 1.2 ROOT FIX VALIDATION');
    
    // 1. Check URL post_id detection
    const urlParams = new URLSearchParams(window.location.search);
    const urlPostId = urlParams.get('post_id');
    console.log('✅ URL post_id detected:', urlPostId);
    
    // 2. Check global data availability
    console.log('✅ Global data objects:');
    console.log('   - window.gmkbData?.postId:', window.gmkbData?.postId);
    console.log('   - AJAX URL:', window.gmkbData?.ajaxUrl);
    console.log('   - Nonce available:', !!(window.gmkbData?.nonce));
    
    // 3. Check topics components with Phase 1.2 markers
    const topicsElements = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]');
    console.log('✅ Topics components found:', topicsElements.length);
    
    topicsElements.forEach((element, index) => {
        const postId = element.dataset.postId;
        const loadingResolved = element.getAttribute('data-loading-resolved');
        const phase = element.getAttribute('data-phase');
        console.log(`   Component ${index + 1}: postId=${postId}, loadingResolved=${loadingResolved}, phase=${phase}`);
        
        // Check for Phase 1.2 markers
        if (phase === '1.2-complete') {
            console.log(`   ✅ Component ${index + 1} shows Phase 1.2 completion`);
        } else {
            console.warn(`   ⚠️ Component ${index + 1} not showing Phase 1.2 completion (phase=${phase})`);
        }
    });
    
    // 4. Check for loading states
    const loadingElements = document.querySelectorAll('.loading-indicator, .loading-message, [data-loading="true"]');
    console.log('✅ Stuck loading elements:', loadingElements.length);
    
    // 5. Check for "Loading your topics..." text
    const loadingText = document.body.innerHTML.includes('Loading your topics');
    console.log('✅ "Loading your topics..." text found:', loadingText);
    
    // 6. Check topics containers specifically
    const topicsContainers = document.querySelectorAll('.topics-container');
    console.log('✅ Topics containers found:', topicsContainers.length);
    
    topicsContainers.forEach((container, index) => {
        const phase = container.getAttribute('data-phase');
        const postId = container.getAttribute('data-post-id');
        console.log(`   Container ${index + 1}: phase=${phase}, post-id=${postId}`);
        
        if (container.innerHTML.includes('ComponentLoader post_id')) {
            console.log(`   ✅ Container ${index + 1} shows Phase 1.2 debug info`);
        }
    });
    
    // 7. Test AJAX call simulation with Phase 1.2 enhancement
    console.log('✅ Testing Phase 1.2 AJAX call simulation...');
    const testFormData = new FormData();
    testFormData.append('action', 'guestify_render_component');
    testFormData.append('component', 'topics');
    testFormData.append('nonce', window.gmkbData?.nonce || 'test');
    testFormData.append('props', JSON.stringify({
        post_id: parseInt(urlPostId) || 32372,
        component_id: 'test-validation-' + Date.now()
    }));
    
    console.log('   AJAX FormData for Phase 1.2:');
    for (let [key, value] of testFormData.entries()) {
        if (key === 'props') {
            console.log(`   - ${key}: ${value} (parsed post_id: ${JSON.parse(value).post_id})`);
        } else {
            console.log(`   - ${key}: ${value}`);
        }
    }
    
    console.groupEnd();
    
    // Summary
    const hasPostId = !!(urlPostId || window.gmkbData?.postId);
    const hasComponents = topicsElements.length > 0;
    const noStuckLoading = loadingElements.length === 0;
    const hasPhase12Markers = Array.from(topicsElements).some(el => 
        el.getAttribute('data-phase') === '1.2-complete'
    );
    
    console.log('📊 PHASE 1.2 VALIDATION SUMMARY:');
    console.log(`   ✅ Post ID Available: ${hasPostId} (${urlPostId || window.gmkbData?.postId})`);
    console.log(`   ✅ Components Found: ${hasComponents} (${topicsElements.length})`);
    console.log(`   ✅ No Stuck Loading: ${noStuckLoading}`);
    console.log(`   ✅ Phase 1.2 Markers: ${hasPhase12Markers}`);
    console.log(`   ✅ Overall Status: ${hasPostId && hasComponents && noStuckLoading && hasPhase12Markers ? '✅ PASS' : '⚠️ NEEDS_ATTENTION'}`);
    
    if (!hasPhase12Markers) {
        console.warn('⚠️ Phase 1.2 markers not found - may need cache clear or hard refresh');
    }
    
    return {
        hasPostId,
        hasComponents,
        noStuckLoading,
        hasPhase12Markers,
        postId: urlPostId || window.gmkbData?.postId,
        componentsCount: topicsElements.length,
        phase: '1.2'
    };
}

// Auto-run validation
validatePhase12Fixes();

// Make available globally
window.validatePhase12 = validatePhase12Fixes;

console.log('🔧 Phase 1.2 validation loaded. Run validatePhase12() to check ComponentLoader integration status.');
