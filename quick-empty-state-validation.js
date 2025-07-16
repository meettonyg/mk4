/**
 * QUICK EMPTY STATE FIX VALIDATION
 * 
 * Paste this into browser console for immediate validation
 */

console.log('\n🎯 QUICK EMPTY STATE FIX VALIDATION');
console.log('=====================================\n');

// Check current state
const emptyState = document.getElementById('empty-state');
const previewContainer = document.getElementById('media-kit-preview');
const stateManager = window.GMKB?.systems?.StateManager;

if (!emptyState || !previewContainer || !stateManager) {
    console.log('❌ Required elements not found - check if page fully loaded');
} else {
    const state = stateManager.getState();
    const stateComponentCount = Object.keys(state.components || {}).length;
    const domComponentCount = previewContainer.querySelectorAll('.media-kit-component').length;
    const emptyStateVisible = window.getComputedStyle(emptyState).display !== 'none';
    
    console.log('📊 CURRENT STATUS:');
    console.log(`   State components: ${stateComponentCount}`);
    console.log(`   DOM components: ${domComponentCount}`);
    console.log(`   Empty state visible: ${emptyStateVisible}`);
    
    // Validate fix
    const shouldBeVisible = stateComponentCount === 0 && domComponentCount === 0;
    const isCorrect = emptyStateVisible === shouldBeVisible;
    
    console.log('\n🔍 FIX VALIDATION:');
    if (isCorrect) {
        console.log('✅ EMPTY STATE FIX WORKING CORRECTLY!');
        if (shouldBeVisible) {
            console.log('   Empty state correctly shown (no components)');
        } else {
            console.log('   Empty state correctly hidden (components exist)');
        }
        
        if (stateComponentCount > 0 && domComponentCount === 0) {
            console.log('⚠️  State has components but DOM is empty - triggering render...');
            window.GMKB?.systems?.UIManager?.ensureEmptyStateVisible?.(true);
        }
    } else {
        console.log('❌ EMPTY STATE FIX NEEDS ATTENTION');
        console.log(`   Expected visible: ${shouldBeVisible}`);
        console.log(`   Actual visible: ${emptyStateVisible}`);
        
        console.log('\n🔄 Attempting fix...');
        if (window.GMKB?.systems?.UIManager?.ensureEmptyStateVisible) {
            window.GMKB.systems.UIManager.ensureEmptyStateVisible(true);
            console.log('✅ Fix triggered - check again in 1 second');
        }
    }
}

console.log('\n💡 Additional commands:');
console.log('   testEmptyStateFix.quickTest() - Quick test');
console.log('   testEmptyStateFix.runAllTests() - Complete test suite');
console.log('   testEmptyStateFix.forceEmptyStateCheck() - Force recalculation');
