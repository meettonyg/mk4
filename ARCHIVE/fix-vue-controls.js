/**
 * Quick fix for Vue controls visibility
 * Run this in the console if controls don't appear after page load
 */

window.fixVueControls = function() {
  console.log('🔧 Fixing Vue controls...');
  
  // Check if controls exist
  if (!window.gmkbControlsInstance) {
    console.error('❌ Vue controls not found. They may not be initialized.');
    return;
  }
  
  // Force state update
  document.dispatchEvent(new CustomEvent('gmkb:state-updated'));
  
  // Check current state
  const state = window.stateManager?.getState();
  const componentCount = Object.keys(state?.components || {}).length;
  const sectionCount = state?.sections?.length || 0;
  
  console.log(`📊 Found ${componentCount} components and ${sectionCount} sections`);
  
  // Force multiple updates with delays
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('gmkb:state-updated'));
    console.log('✅ First update triggered');
  }, 100);
  
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('gmkb:state-updated'));
    console.log('✅ Second update triggered');
  }, 500);
  
  setTimeout(() => {
    // Check if controls are working
    const testHover = () => {
      const component = document.querySelector('[data-component-id]');
      if (component) {
        console.log('🎯 Test: Hover over component:', component.dataset.componentId);
        console.log('Controls should now appear when you hover over components');
      }
    };
    testHover();
  }, 1000);
  
  return 'Fix applied. Try hovering over components now.';
};

// Auto-run fix if controls aren't working after page load
window.addEventListener('load', () => {
  setTimeout(() => {
    // Check if controls are populated
    if (window.gmkbControlsInstance) {
      const hasComponents = window.gmkbControlsInstance.visibleComponents?.length > 0;
      const hasSections = window.gmkbControlsInstance.visibleSections?.length > 0;
      
      if (!hasComponents && !hasSections) {
        console.log('⚠️ Vue controls appear empty. Running auto-fix...');
        window.fixVueControls();
      }
    }
  }, 3000); // Wait 3 seconds after page load
});

// Export globally
console.log('💡 Vue controls fix available. Run: fixVueControls()');
