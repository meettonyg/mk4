/**
 * Disable Legacy Control System
 * This file completely disables the old control system in favor of Vue controls
 */

export function disableLegacyControls() {
  console.log('🔄 Disabling legacy control system...');
  
  // Remove all legacy control event listeners
  const removeListeners = () => {
    // Remove old control click handlers
    document.querySelectorAll('.component-controls').forEach(controls => {
      const newControls = controls.cloneNode(true);
      controls.parentNode.replaceChild(newControls, controls);
    });
    
    // Remove legacy hover handlers
    document.querySelectorAll('.gmkb-component').forEach(component => {
      component.onmouseenter = null;
      component.onmouseleave = null;
    });
    
    // Disable legacy control manager if it exists
    if (window.componentControlsManager) {
      window.componentControlsManager.disable?.();
      delete window.componentControlsManager;
    }
    
    // Remove legacy control CSS classes
    document.querySelectorAll('.has-legacy-controls').forEach(el => {
      el.classList.remove('has-legacy-controls');
    });
  };
  
  // Run immediately
  removeListeners();
  
  // Also run after a delay to catch any late-loading components
  setTimeout(removeListeners, 1000);
  
  // Prevent legacy control initialization
  window.LEGACY_CONTROLS_DISABLED = true;
  
  console.log('✅ Legacy control system disabled');
}

// Auto-run on import
disableLegacyControls();

// Also expose globally for debugging
window.disableLegacyControls = disableLegacyControls;
