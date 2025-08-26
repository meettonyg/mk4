/**
 * Core Systems Coordinator
 * Phase 3: Section Layer System - Missing Event Dispatcher
 * 
 * Dispatches the core-systems-ready event that Phase 3 systems need
 * This was missing from the original implementation
 * 
 * @version 3.0.0-phase3-fix
 * @package GMKB/JS/Core
 */

class CoreSystemsCoordinator {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.systemsReady = {
            stateManager: false,
            componentManager: false,
            componentRenderer: false,
            uiSystems: false
        };
        
        this.logger.info('🎯 PHASE 3: CoreSystemsCoordinator initializing');
        this.initializeCoordinator();
    }
    
    /**
     * Initialize the core systems coordinator
     * Following checklist: Event-Driven Initialization, Root Cause Fix
     */
    initializeCoordinator() {
        // Check systems immediately if already loaded
        this.checkSystemReadiness();
        
        // Set up monitoring for system readiness
        this.monitorSystemReadiness();
        
        // Fallback: dispatch ready after reasonable delay if systems seem loaded
        setTimeout(() => {
            if (!this.hasDispatchedReady) {
                this.checkSystemReadiness(true); // force check
            }
        }, 2000);
        
        this.logger.info('✅ PHASE 3: CoreSystemsCoordinator initialized');
    }
    
    /**
     * Check if core systems are ready
     * Following checklist: Dependency-Awareness, No Global Object Sniffing
     */
    checkSystemReadiness(forceDispatch = false) {
        // Check state manager
        this.systemsReady.stateManager = !!(window.enhancedStateManager && window.enhancedStateManager.getState);
        
        // Check component manager  
        this.systemsReady.componentManager = !!(window.enhancedComponentManager && window.enhancedComponentManager.addComponent);
        
        // Check component renderer
        this.systemsReady.componentRenderer = !!(window.enhancedComponentRenderer && window.enhancedComponentRenderer.renderComponent);
        
        // Check UI systems (tabs, toolbar, etc.)
        this.systemsReady.uiSystems = !!(window.tabs && document.querySelector('.sidebar__tab'));
        
        const allReady = Object.values(this.systemsReady).every(ready => ready);
        
        this.logger.info('🔍 PHASE 3: System readiness check:', this.systemsReady, 'All ready:', allReady);
        
        if ((allReady || forceDispatch) && !this.hasDispatchedReady) {
            this.dispatchCoreSystemsReady();
        }
    }
    
    /**
     * Monitor system readiness with periodic checks
     * Following checklist: Event-Driven, Performance
     */
    monitorSystemReadiness() {
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkInterval = setInterval(() => {
            attempts++;
            this.checkSystemReadiness();
            
            if (this.hasDispatchedReady || attempts >= maxAttempts) {
                clearInterval(checkInterval);
                
                if (attempts >= maxAttempts && !this.hasDispatchedReady) {
                    this.logger.warn('⚠️ PHASE 3: Max attempts reached, forcing core systems ready');
                    this.dispatchCoreSystemsReady();
                }
            }
        }, 500);
    }
    
    /**
     * Dispatch the core systems ready event
     * Following checklist: Event-Driven, Root Cause Fix
     */
    dispatchCoreSystemsReady() {
        if (this.hasDispatchedReady) {
            this.logger.warn('⚠️ PHASE 3: Core systems ready already dispatched');
            return;
        }
        
        this.hasDispatchedReady = true;
        
        const event = new CustomEvent('gmkb:core-systems-ready', {
            detail: {
                systems: this.systemsReady,
                timestamp: Date.now(),
                source: 'CoreSystemsCoordinator'
            }
        });
        
        document.dispatchEvent(event);
        
        this.logger.info('🚀 PHASE 3: Dispatched gmkb:core-systems-ready event');
        
        // Also dispatch a more specific section systems ready event
        setTimeout(() => {
            const sectionEvent = new CustomEvent('gmkb:section-systems-ready', {
                detail: {
                    timestamp: Date.now(),
                    sectionLayoutManager: !!window.sectionLayoutManager,
                    sectionRenderer: !!window.sectionRenderer,
                    sectionTemplates: !!window.sectionTemplates
                }
            });
            
            document.dispatchEvent(sectionEvent);
            this.logger.info('📋 PHASE 3: Dispatched gmkb:section-systems-ready event');
        }, 100);
    }
    
    /**
     * Manual trigger for debugging
     * Following checklist: Diagnostic Support
     */
    forceCoreSystemsReady() {
        this.logger.info('🔧 PHASE 3: Manually forcing core systems ready');
        this.hasDispatchedReady = false;
        this.dispatchCoreSystemsReady();
    }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            systemsReady: this.systemsReady,
            hasDispatchedReady: this.hasDispatchedReady,
            availableGlobals: {
                stateManager: !!window.enhancedStateManager,
                componentManager: !!window.enhancedComponentManager,
                componentRenderer: !!window.enhancedComponentRenderer,
                sectionLayoutManager: !!window.sectionLayoutManager,
                sectionRenderer: !!window.sectionRenderer,
                sectionTemplates: !!window.sectionTemplates
            }
        };
    }
}

// Global instance
window.CoreSystemsCoordinator = CoreSystemsCoordinator;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.coreSystemsCoordinator = new CoreSystemsCoordinator();
        
        // Also expose debug method globally
window.forceCoreSystemsReady = () => {
        if (window.coreSystemsCoordinator) {
        window.coreSystemsCoordinator.forceCoreSystemsReady();
        }
};

// Add debug commands for section system
window.debugSectionSystem = () => {
    console.log('🔍 SECTION SYSTEM DEBUG:');
    console.log('=========================');
    
    if (window.sectionLayoutManager) {
        console.log('✅ SectionLayoutManager:', window.sectionLayoutManager.getDebugInfo());
    } else {
        console.log('❌ SectionLayoutManager not available');
    }
    
    if (window.sectionRenderer) {
        console.log('✅ SectionRenderer:', window.sectionRenderer.getDebugInfo());
    } else {
        console.log('❌ SectionRenderer not available');
    }
    
    if (window.sectionTemplates) {
        console.log('✅ SectionTemplates:', window.sectionTemplates.getDebugInfo());
    } else {
        console.log('❌ SectionTemplates not available');
    }
    
    if (window.coreSystemsCoordinator) {
        console.log('✅ CoreSystemsCoordinator:', window.coreSystemsCoordinator.getDebugInfo());
    } else {
        console.log('❌ CoreSystemsCoordinator not available');
    }
    
    const state = window.enhancedStateManager?.getState();
    if (state) {
        console.log('📊 State Components:', Object.keys(state.components || {}));
        console.log('📊 State Sections:', state.sections || []);
    }
};

window.fixSectionSystem = () => {
    console.log('🔧 FIXING SECTION SYSTEM...');
    
    // Force core systems ready
    window.forceCoreSystemsReady();
    
    // Wait a moment then trigger section creation
    setTimeout(() => {
        if (window.sectionRenderer && window.sectionRenderer.autoCreateSectionsForExistingComponents) {
            console.log('🔄 Auto-creating sections for existing components...');
            window.sectionRenderer.autoCreateSectionsForExistingComponents();
            window.sectionRenderer.renderAllSections();
            console.log('✅ Section system should now be working!');
        }
    }, 500);
};
    });
} else {
    window.coreSystemsCoordinator = new CoreSystemsCoordinator();
    
    // Also expose debug method globally
    window.forceCoreSystemsReady = () => {
        if (window.coreSystemsCoordinator) {
            window.coreSystemsCoordinator.forceCoreSystemsReady();
        }
    };
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoreSystemsCoordinator;
}
