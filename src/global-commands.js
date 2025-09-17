/**
 * Global Commands Module
 * ARCHITECTURE COMPLIANT: Self-contained module that exposes commands globally
 * This ensures commands are available even in optimized bundles
 */

// Diagnostic function for architecture info
window.gmkbArchInfo = function() {
  const info = {
    mode: 'VUE',
    version: '3.0.0',
    vueApp: !!window.gmkbApp,
    stateManager: !!window.stateManager,
    pinia: !!window.gmkbPinia,
    components: window.GMKB?.vueDiscovery?.discoveredComponents?.size || 0,
    sections: window.stateManager?.getState()?.sections?.length || 0,
    scriptsLoaded: 1,
    bundleUrl: window.gmkbData?.bundleUrl || 'dist/gmkb.iife.js',
    ajaxUrl: window.gmkbData?.ajaxUrl || window.ajaxurl || 'Not set',
    postId: window.gmkbData?.postId || 'Not set'
  };
  
  console.log(`
🏗️ GMKB Architecture Info
========================
Mode: ${info.mode}
Version: ${info.version}
Vue App: ${info.vueApp ? '✅' : '❌'}
State Manager: ${info.stateManager ? '✅' : '❌'}
Pinia Store: ${info.pinia ? '✅' : '❌'}
Vue Components: ${info.components}
Sections: ${info.sections}
Scripts Loaded: ${info.scriptsLoaded} (lean bundle)
AJAX URL: ${info.ajaxUrl}
Post ID: ${info.postId}
========================`);
  
  return info;
};

export function initializeGlobalCommands() {
  // Wait for state manager to be available
  const setupCommands = () => {
    // Find the state manager from various possible locations
    const findStateManager = () => {
      return window.stateManager || 
             window.gmkbStateManager || 
             window.gmkbStore ||
             window.GMKB?.stateManager ||
             null;
    };
    
    // Find the GMKB API object
    const findGMKB = () => {
      return window.GMKB || null;
    };
    
    // Section commands
    window.getSections = () => {
      const stateManager = findStateManager();
      if (stateManager) {
        const state = stateManager.getState();
        console.log('Current sections:', state.sections || []);
        return state.sections || [];
      }
      // State manager not found - silently return
      return [];
    };
    
    window.addSection = (type = 'full_width') => {
      const gmkb = findGMKB();
      if (gmkb && gmkb.addSection) {
        return gmkb.addSection(type);
      }
      
      // Fallback: Try to dispatch directly
      const stateManager = findStateManager();
      if (stateManager) {
        const sectionId = `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const section = {
          id: sectionId,
          section_id: sectionId,
          type,
          components: []
        };
        
        // Try to find ACTION_TYPES
        const ACTION_TYPES = window.ACTION_TYPES || { ADD_SECTION: 'ADD_SECTION' };
        
        stateManager.dispatch({ 
          type: ACTION_TYPES.ADD_SECTION, 
          payload: section 
        });
        console.log('✅ Section added:', section);
        return section;
      }
      
      console.error('Unable to add section - manager not found');
      return null;
    };
    
    window.removeSection = (sectionId) => {
      const gmkb = findGMKB();
      if (gmkb && gmkb.removeSection) {
        gmkb.removeSection(sectionId);
        return;
      }
      
      // Fallback: Try to dispatch directly
      const stateManager = findStateManager();
      if (stateManager) {
        const ACTION_TYPES = window.ACTION_TYPES || { REMOVE_SECTION: 'REMOVE_SECTION' };
        stateManager.dispatch({ 
          type: ACTION_TYPES.REMOVE_SECTION, 
          payload: sectionId 
        });
        console.log('✅ Section removed:', sectionId);
        return;
      }
      
      console.error('Unable to remove section - manager not found');
    };
    
    window.getState = () => {
      const stateManager = findStateManager();
      if (stateManager) {
        return stateManager.getState();
      }
      // State manager not found - silently return
      return {};
    };
    
    window.debugSections = () => {
      console.group('🔍 Section System Debug');
      
      const stateManager = findStateManager();
      const gmkb = findGMKB();
      
      console.log('State Manager:', stateManager ? '✅ Found' : '❌ Not found');
      console.log('GMKB API:', gmkb ? '✅ Found' : '❌ Not found');
      
      if (stateManager) {
        const state = stateManager.getState();
        console.log('State:', state);
        console.log('Sections:', state.sections || []);
        console.log('Components:', state.components || {});
      }
      
      // Check DOM
      const domSections = document.querySelectorAll('.gmkb-section, [data-section-id]');
      console.log(`DOM Sections: ${domSections.length} found`);
      domSections.forEach((section, index) => {
        console.log(`  ${index + 1}. ${section.className} - ${section.dataset.sectionId || 'no-id'}`);
      });
      
      console.groupEnd();
    };
    
    // Log available commands
    console.log(`
🎯 Global Section Commands Ready:
- getSections() - View current sections
- addSection('two_column') - Add a new section
- removeSection(sectionId) - Remove a section
- getState() - View complete state
- debugSections() - Debug section system

Current sections: ${window.getSections().length}
    `);
  };
  
  // Try to set up immediately if state manager exists
  if (window.stateManager || window.GMKB) {
    setupCommands();
  } else {
    // Listen for ready events
    document.addEventListener('gmkb:ready', setupCommands);
    document.addEventListener('DOMContentLoaded', setupCommands);
    
    // Also try after a short delay as fallback
    setTimeout(setupCommands, 1000);
  }
}

// Auto-initialize when module loads
initializeGlobalCommands();
