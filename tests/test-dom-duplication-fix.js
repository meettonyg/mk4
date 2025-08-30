/**
 * Test script to verify DOM duplication fix
 * Run this in the browser console after page load
 */

console.log('🧪 TESTING DOM DUPLICATION FIX');
console.log('=' .repeat(50));

// Test 1: Check for duplicate components
console.log('\n📊 TEST 1: Checking for duplicate components...');
const analysis = window.GMKB.analyzeComponentDuplication();
console.log('Total DOM elements with component ID:', analysis.totalElements);
console.log('Unique component IDs:', analysis.uniqueIds);
console.log('Duplicated component IDs:', analysis.duplicatedIds);

if (analysis.duplicatedIds === 0) {
    console.log('✅ PASS: No duplicate components found!');
} else {
    console.error('❌ FAIL: Found duplicate components:', analysis.duplicates);
}

// Test 2: Check renderer state
console.log('\n📊 TEST 2: Checking renderer state...');
if (window.enhancedComponentRenderer) {
    const stats = window.enhancedComponentRenderer.getStats();
    console.log('Renderer initialized:', stats.initialized);
    console.log('Cached components:', stats.cachedComponents);
    console.log('Rendering mode:', stats.renderingMode);
    
    // Check for render guard
    const hasRenderGuard = window.enhancedComponentRenderer.hasOwnProperty('renderingSavedComponents');
    console.log('Has render guard:', hasRenderGuard);
    
    if (hasRenderGuard) {
        console.log('✅ PASS: Render guard implemented');
    } else {
        console.warn('⚠️ WARNING: Render guard not found');
    }
} else {
    console.error('❌ Component renderer not available');
}

// Test 3: Check DOM Render Coordinator
console.log('\n📊 TEST 3: Checking DOM Render Coordinator...');
if (window.domRenderCoordinator) {
    const status = window.domRenderCoordinator.getStatus();
    console.log('Coordinator initialized:', status.isInitialized);
    console.log('DOM Registry size:', status.domRegistrySize);
    console.log('Duplicates blocked:', status.renderStats.duplicatesBlocked);
    console.log('Forced cleanups:', status.renderStats.forcedCleanups);
    
    if (status.renderStats.forcedCleanups === 0) {
        console.log('✅ PASS: No emergency cleanups needed');
    } else {
        console.warn('⚠️ WARNING: Emergency cleanups were performed:', status.renderStats.forcedCleanups);
    }
} else {
    console.error('❌ DOM Render Coordinator not available');
}

// Test 4: Check component controls
console.log('\n📊 TEST 4: Checking component controls...');
const componentsWithControls = document.querySelectorAll('[data-controls-attached="true"]');
const totalComponents = document.querySelectorAll('[data-component-id]');
console.log(`Components with controls: ${componentsWithControls.length}/${totalComponents.length}`);

if (componentsWithControls.length === totalComponents.length) {
    console.log('✅ PASS: All components have controls attached');
} else {
    console.warn('⚠️ WARNING: Some components missing controls');
    
    // Find components without controls
    const missingControls = [];
    totalComponents.forEach(comp => {
        if (!comp.hasAttribute('data-controls-attached')) {
            missingControls.push(comp.getAttribute('data-component-id'));
        }
    });
    
    if (missingControls.length > 0) {
        console.log('Components missing controls:', missingControls);
    }
}

// Test 5: Performance check
console.log('\n📊 TEST 5: Performance metrics...');
if (window.performanceMonitor && window.performanceMonitor.getMetrics) {
    const metrics = window.performanceMonitor.getMetrics();
    console.log('Performance metrics:', metrics);
}

// Summary
console.log('\n' + '=' .repeat(50));
console.log('🎯 TEST SUMMARY:');

const allTestsPassed = 
    analysis.duplicatedIds === 0 && 
    window.enhancedComponentRenderer?.renderingSavedComponents !== undefined &&
    window.domRenderCoordinator?.getStatus().renderStats.forcedCleanups === 0 &&
    componentsWithControls.length === totalComponents.length;

if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED - DOM duplication fix is working correctly!');
} else {
    console.log('⚠️ Some tests failed or had warnings - review the results above');
}

// Provide fix command if issues detected
if (analysis.duplicatedIds > 0) {
    console.log('\n🔧 To fix duplicates now, run:');
    console.log('window.domRenderCoordinator.forceCleanupAllDuplicates()');
}

// Export results for debugging
window.domDuplicationTestResults = {
    timestamp: new Date().toISOString(),
    duplicateAnalysis: analysis,
    rendererHasGuard: window.enhancedComponentRenderer?.renderingSavedComponents !== undefined,
    coordinatorCleanups: window.domRenderCoordinator?.getStatus().renderStats.forcedCleanups || 0,
    controlsAttached: `${componentsWithControls.length}/${totalComponents.length}`,
    allTestsPassed
};

console.log('\n📋 Test results saved to: window.domDuplicationTestResults');
