/**
 * Vue Media Kit Builder - Pure Vue Mode
 * This script ensures ONLY Vue renders components
 */

(function() {
  'use strict';
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPureVueMode);
  } else {
    initPureVueMode();
  }
  
  function initPureVueMode() {
    console.log('🎯 Initializing Pure Vue Mode - Disabling ALL legacy rendering');
    
    // ROOT FIX: Disable ALL legacy rendering systems
    const legacySystemsToDisable = [
      'enhancedComponentManager',
      'ComponentRenderer', 
      'componentManager',
      'stateManager',
      'renderManager',
      'sectionLayoutManager',
      'sectionRenderer',
      'componentControlsManager'
    ];
    
    legacySystemsToDisable.forEach(system => {
      if (window[system]) {
        console.log(`🚫 Disabling legacy system: ${system}`);
        
        // Override all rendering methods
        const overrides = [
          'render',
          'renderComponent',
          'renderComponents',
          'renderSection',
          'renderSections',
          'init',
          'initialize',
          'start'
        ];
        
        overrides.forEach(method => {
          if (typeof window[system][method] === 'function') {
            window[system][method] = function() {
              console.log(`Legacy ${system}.${method}() blocked - Vue handles rendering`);
              return null;
            };
          }
        });
        
        // Mark as disabled
        window[system]._disabled = true;
      }
    });
    
    // ROOT FIX: Remove legacy DOM elements
    function cleanupLegacyDOM() {
      const legacySelectors = [
        '.gmkb-component-wrapper:not([data-vue])',
        '.gmkb-hero-component:not([data-vue])',
        '.gmkb-sections-container:not([data-vue])',
        '.saved-components:not([data-vue])',
        '#saved-components-container',
        '#empty-state'
      ];
      
      legacySelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (!el.closest('#vue-media-kit-app')) {
            console.log(`🗑️ Removing legacy element: ${selector}`);
            el.remove();
          }
        });
      });
    }
    
    // Clean up immediately
    cleanupLegacyDOM();
    
    // Clean up again after a short delay (in case legacy code tries to render)
    setTimeout(cleanupLegacyDOM, 100);
    setTimeout(cleanupLegacyDOM, 500);
    setTimeout(cleanupLegacyDOM, 1000);
    
    // ROOT FIX: Intercept and block legacy AJAX calls that might trigger rendering
    const originalAjax = window.jQuery ? window.jQuery.ajax : null;
    if (originalAjax) {
      window.jQuery.ajax = function(options) {
        if (options.url && options.url.includes('gmkb_render_component')) {
          console.log('🚫 Blocked legacy component render AJAX call');
          return Promise.resolve({ success: false, message: 'Vue handles rendering' });
        }
        return originalAjax.apply(this, arguments);
      };
    }
    
    // Monitor for any new legacy elements and remove them
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check if it's a legacy component
            if (node.classList && (
              node.classList.contains('gmkb-component-wrapper') ||
              node.classList.contains('gmkb-hero-component')
            )) {
              if (!node.hasAttribute('data-vue') && !node.closest('#vue-media-kit-app')) {
                console.log('🚫 Removing newly added legacy component');
                node.remove();
              }
            }
          }
        });
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Make cleanup function globally available
    window.gmkbCleanupLegacy = cleanupLegacyDOM;
    
    console.log('✅ Pure Vue Mode initialized - Legacy rendering disabled');
  }
})();
