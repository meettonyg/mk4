/**
 * Debug script for testing hover controls
 * Run these commands in the browser console after the page loads
 */

// Function to check current state of hover controls
window.debugHoverControls = {
  // Check if components have data-component-id attribute
  checkComponents: function() {
    const components = document.querySelectorAll('[data-component-id]');
    console.log('Components with data-component-id:', components.length);
    components.forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.getAttribute('data-component-id')} - ${comp.className}`);
    });
    return components.length;
  },
  
  // Check if controls exist in DOM
  checkControls: function() {
    const controls = document.querySelectorAll('.gmkb-component-controls');
    console.log('Control elements in DOM:', controls.length);
    controls.forEach(control => {
      console.log('  Control visibility:', control.style.display !== 'none' ? 'visible' : 'hidden');
    });
    return controls.length;
  },
  
  // Manually trigger hover listeners setup
  setupListeners: function() {
    console.log('Attempting to manually setup hover listeners...');
    
    // Try different methods to access the setup function
    if (typeof window.gmkbSetupHoverListeners === 'function') {
      window.gmkbSetupHoverListeners();
      console.log('✓ Called window.gmkbSetupHoverListeners()');
    } else {
      console.log('✗ window.gmkbSetupHoverListeners not found');
    }
    
    // Also try to find components and manually add listeners
    const components = document.querySelectorAll('[data-component-id]');
    console.log(`Manually adding listeners to ${components.length} components...`);
    
    components.forEach(comp => {
      // Add visual feedback
      comp.addEventListener('mouseenter', function(e) {
        console.log('Mouse entered component:', this.getAttribute('data-component-id'));
        this.style.outline = '2px solid red';
      });
      
      comp.addEventListener('mouseleave', function(e) {
        console.log('Mouse left component:', this.getAttribute('data-component-id'));
        this.style.outline = '';
      });
    });
    
    return components.length;
  },
  
  // Simulate hover event on first component
  simulateHover: function() {
    const firstComponent = document.querySelector('[data-component-id]');
    if (firstComponent) {
      const componentId = firstComponent.getAttribute('data-component-id');
      console.log('Simulating hover on:', componentId);
      
      // Create and dispatch mouseenter event
      const event = new MouseEvent('mouseenter', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      firstComponent.dispatchEvent(event);
      
      // Check if controls appeared
      setTimeout(() => {
        const visibleControls = document.querySelectorAll('.gmkb-component-controls:not([style*="display: none"])');
        if (visibleControls.length > 0) {
          console.log('✓ Controls appeared!');
        } else {
          console.log('✗ Controls did not appear');
        }
      }, 100);
    } else {
      console.log('No components found to hover');
    }
  },
  
  // Full diagnostic
  runDiagnostic: function() {
    console.log('=== HOVER CONTROLS DIAGNOSTIC ===');
    console.log('1. Checking components...');
    this.checkComponents();
    
    console.log('\n2. Checking control elements...');
    this.checkControls();
    
    console.log('\n3. Checking Vue app...');
    const vueApp = document.querySelector('[data-v-app]');
    console.log('Vue app mounted:', vueApp ? 'Yes' : 'No');
    
    console.log('\n4. Checking ControlsOverlay...');
    const overlay = document.querySelector('.gmkb-controls-overlay');
    console.log('ControlsOverlay exists:', overlay ? 'Yes' : 'No');
    
    console.log('\n5. Setting up listeners manually...');
    this.setupListeners();
    
    console.log('\n6. Testing hover simulation...');
    setTimeout(() => this.simulateHover(), 500);
    
    console.log('\n=== END DIAGNOSTIC ===');
  }
};

// Auto-run diagnostic after 2 seconds if page is loaded
if (document.readyState === 'complete') {
  setTimeout(() => {
    console.log('Auto-running hover controls diagnostic...');
    debugHoverControls.runDiagnostic();
  }, 2000);
} else {
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('Auto-running hover controls diagnostic...');
      debugHoverControls.runDiagnostic();
    }, 2000);
  });
}

// Export for manual use
console.log(`
🔧 Hover Controls Debug Tools Loaded
Available commands:
- debugHoverControls.checkComponents() - Check for components with data-component-id
- debugHoverControls.checkControls() - Check for control elements in DOM
- debugHoverControls.setupListeners() - Manually setup hover listeners
- debugHoverControls.simulateHover() - Simulate hover on first component
- debugHoverControls.runDiagnostic() - Run full diagnostic

Run debugHoverControls.runDiagnostic() to start debugging.
`);
