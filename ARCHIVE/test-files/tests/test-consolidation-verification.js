/**
 * GMKB Script Consolidation Verification Script
 * Run this in browser console after the Media Kit Builder loads
 * 
 * Expected Results After Phase 2 Cleanup:
 * ✅ State Manager: 1 instance (enhancedStateManager)
 * ✅ Component Renderer: 1 instance (enhancedComponentRenderer) 
 * ✅ Section Systems: 2 instances (Phase 3 - expected)
 * ✅ Scripts loaded: <50 (reduced from 66)
 * ✅ No duplicate conflicts
 */

console.log('\n🚀 GMKB SCRIPT CONSOLIDATION VERIFICATION');
console.log('===========================================\n');

// 1. Core System Verification
console.log('📊 CORE SYSTEMS:');
console.log('State Manager:', window.enhancedStateManager ? '✅ Ready' : '❌ Missing');
console.log('Component Renderer:', window.enhancedComponentRenderer ? '✅ Ready' : '❌ Missing');
console.log('');

// 2. Duplicate Detection (should be minimal now)
console.log('🔍 DUPLICATE SYSTEM CHECK:');
const stateManagers = Object.keys(window).filter(k => k.toLowerCase().includes('statemanager'));
const renderers = Object.keys(window).filter(k => k.toLowerCase().includes('renderer'));
console.log('State Managers Found:', stateManagers.length, '→', stateManagers);
console.log('Renderers Found:', renderers.length, '→', renderers);
console.log('');

// 3. Expected vs Actual Analysis
console.log('📈 CONSOLIDATION ANALYSIS:');
console.log('Expected State Managers: 2 (EnhancedStateManager class + enhancedStateManager instance)');
console.log('Actual State Managers:', stateManagers.length, stateManagers.length <= 2 ? '✅ Good' : '❌ Still duplicates');
console.log('');
console.log('Expected Renderers: 3-4 (SimplifiedComponentRenderer, enhancedComponentRenderer, SectionRenderer, sectionRenderer)');
console.log('Actual Renderers:', renderers.length, renderers.length <= 4 ? '✅ Good' : '❌ Still duplicates');
console.log('');

// 4. Performance Check
console.log('⚡ PERFORMANCE CHECK:');
const jsScripts = performance.getEntriesByType('resource').filter(r => r.name.includes('.js')).length;
console.log('JavaScript Files Loaded:', jsScripts, jsScripts < 50 ? '✅ Improved' : '⚠️ Still high');
console.log('');

// 5. System Health Check
console.log('🏥 SYSTEM HEALTH:');
let healthScore = 0;
if (window.enhancedStateManager) healthScore += 25;
if (window.enhancedComponentRenderer) healthScore += 25;
if (stateManagers.length <= 2) healthScore += 25;
if (renderers.length <= 4) healthScore += 25;

console.log('Overall Health Score:', healthScore + '%', 
    healthScore >= 90 ? '🎉 Excellent' : 
    healthScore >= 70 ? '✅ Good' : 
    healthScore >= 50 ? '⚠️ Needs work' : '❌ Issues remain');
console.log('');

// 6. Functional Testing
console.log('🧪 FUNCTIONAL TESTING:');
try {
    if (window.enhancedStateManager && typeof window.enhancedStateManager.getState === 'function') {
        const state = window.enhancedStateManager.getState();
        console.log('State Access: ✅ Working -', Object.keys(state?.components || {}).length, 'components');
    } else {
        console.log('State Access: ❌ Not working');
    }
    
    if (window.enhancedComponentRenderer && typeof window.enhancedComponentRenderer.getStats === 'function') {
        const stats = window.enhancedComponentRenderer.getStats();
        console.log('Renderer Stats: ✅ Working -', stats.cachedComponents || 0, 'cached components');
    } else {
        console.log('Renderer Stats: ❌ Not working');
    }
} catch (error) {
    console.log('Functional Test: ❌ Error -', error.message);
}
console.log('');

// 7. Component Addition Test
console.log('➕ COMPONENT ADDITION TEST:');
console.log('Try adding a component via the modal to test full functionality...');
console.log('Expected: Component should add smoothly without console errors');
console.log('');

// 8. Debugging Commands
console.log('🛠️ DEBUGGING COMMANDS AVAILABLE:');
console.log('• window.enhancedStateManager.getState() - View current state');
console.log('• window.enhancedComponentRenderer.getStats() - View renderer stats');
console.log('• Object.keys(window).filter(k => k.includes("render")) - Find all render objects');
console.log('• Object.keys(window).filter(k => k.includes("state")) - Find all state objects');
console.log('');

console.log('🎯 CONSOLIDATION COMPLETE! Test component addition to verify full functionality.');

// Return summary for easy viewing
return {
    stateManagers: stateManagers.length,
    renderers: renderers.length,
    scriptsLoaded: jsScripts,
    healthScore: healthScore + '%',
    ready: healthScore >= 70
};
