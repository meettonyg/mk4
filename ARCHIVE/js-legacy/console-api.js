/**
 * Media Kit Builder Console API
 * ARCHITECTURE COMPLIANT: Exposes commands for console access
 * Loads after the main bundle to ensure commands are available
 */

(function() {
    'use strict';
    
    console.log('📦 GMKB Console API: Initializing...');
    
    // Helper to find the store/state manager from the bundle
    function findStore() {
        // Check multiple possible locations where the bundle might expose the store
        if (window.stateManager) return window.stateManager;
        if (window.gmkbStateManager) return window.gmkbStateManager;
        if (window.gmkbStore) return window.gmkbStore;
        if (window.GMKB && window.GMKB.stateManager) return window.GMKB.stateManager;
        
        // Try to find it from the Vue app
        if (window.gmkbApp && window.gmkbApp.$store) return window.gmkbApp.$store;
        
        // Check for bundled app references
        const app = document.querySelector('#gmkb-app')?.__vue_app__;
        if (app?.config?.globalProperties?.$store) {
            return app.config.globalProperties.$store;
        }
        
        console.warn('Console API: Store not found, commands may not work');
        return null;
    }
    
    // Section management commands
    window.getSections = function() {
        const store = findStore();
        if (store && typeof store.getState === 'function') {
            const state = store.getState();
            const sections = state.sections || [];
            console.log(`Found ${sections.length} sections:`, sections);
            return sections;
        }
        console.error('Unable to get sections - store not found');
        return [];
    };
    
    window.addSection = function(type = 'full_width') {
        // First try the GMKB API if available
        if (window.GMKB && typeof window.GMKB.addSection === 'function') {
            return window.GMKB.addSection(type);
        }
        
        // Otherwise try direct dispatch
        const store = findStore();
        if (store && typeof store.dispatch === 'function') {
            const sectionId = `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const section = {
                id: sectionId,
                section_id: sectionId,
                type: type,
                components: []
            };
            
            store.dispatch({ 
                type: 'ADD_SECTION', 
                payload: section 
            });
            
            console.log(`✅ Section added:`, section);
            return section;
        }
        
        console.error('Unable to add section - no dispatch method found');
        return null;
    };
    
    window.removeSection = function(sectionId) {
        // First try the GMKB API if available
        if (window.GMKB && typeof window.GMKB.removeSection === 'function') {
            return window.GMKB.removeSection(sectionId);
        }
        
        // Otherwise try direct dispatch
        const store = findStore();
        if (store && typeof store.dispatch === 'function') {
            store.dispatch({ 
                type: 'REMOVE_SECTION', 
                payload: sectionId 
            });
            
            console.log(`✅ Section removed: ${sectionId}`);
            return true;
        }
        
        console.error('Unable to remove section - no dispatch method found');
        return false;
    };
    
    window.getState = function() {
        const store = findStore();
        if (store && typeof store.getState === 'function') {
            return store.getState();
        }
        console.error('Unable to get state - store not found');
        return {};
    };
    
    window.debugGMKB = function() {
        console.group('🔍 GMKB Debug Info');
        
        // Check what's available
        console.log('window.GMKB:', typeof window.GMKB !== 'undefined' ? '✅' : '❌');
        console.log('window.stateManager:', typeof window.stateManager !== 'undefined' ? '✅' : '❌');
        console.log('window.gmkbApp:', typeof window.gmkbApp !== 'undefined' ? '✅' : '❌');
        
        const store = findStore();
        console.log('Store found:', store ? '✅' : '❌');
        
        if (store) {
            const state = store.getState ? store.getState() : {};
            console.log('Current state:', state);
            console.log('Sections:', state.sections || []);
            console.log('Components:', Object.keys(state.components || {}).length);
        }
        
        // Check DOM
        const sections = document.querySelectorAll('.gmkb-section, [data-section-id]');
        console.log(`DOM sections: ${sections.length}`);
        
        console.groupEnd();
    };
    
    // Wait for the bundle to load
    function checkAndInitialize() {
        const store = findStore();
        if (store) {
            console.log(`✅ GMKB Console API: Ready!
            
🎯 Section Commands Available:
• getSections() - View all sections
• addSection('two_column') - Add a section  
• removeSection(sectionId) - Remove a section
• getState() - View complete state
• debugGMKB() - Debug system status

Current sections: ${getSections().length}
            `);
        } else {
            console.warn('GMKB Console API: Waiting for bundle to load...');
        }
    }
    
    // Check immediately
    checkAndInitialize();
    
    // Also check after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndInitialize);
    }
    
    // Listen for the ready event from the bundle
    document.addEventListener('gmkb:ready', checkAndInitialize);
    
})();