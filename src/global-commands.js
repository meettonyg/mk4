/**
 * Global Commands Module
 * ARCHITECTURE COMPLIANT: Self-contained module that exposes commands globally
 * This ensures commands are available even in optimized bundles
 */

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
      console.error('State manager not found');
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
      console.error('State manager not found');
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
