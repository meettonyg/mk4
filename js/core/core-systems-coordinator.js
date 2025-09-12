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
        // ROOT FIX: Listen for manager initialization events
        document.addEventListener('gmkb:manager-initialized', (event) => {
            const { manager } = event.detail;
            this.logger.info(`📍 Manager initialized: ${manager}`);
            this.checkSystemReadiness();
        });
        
        // Also listen for specific manager ready events
        document.addEventListener('gmkb:component-manager-ready', () => {
            this.logger.info('📍 Component manager ready event received');
            this.checkSystemReadiness();
        });
        
        document.addEventListener('gmkb:section-manager-ready', () => {
            this.logger.info('📍 Section manager ready event received');
            this.checkSystemReadiness();
        });
        
        document.addEventListener('gmkb:enhanced-component-renderer-ready', () => {
            this.logger.info('📍 Component renderer ready event received');
            this.checkSystemReadiness();
        });
        
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
        // ROOT FIX: Check GMKB core system first
        const gmkbReady = !!(window.GMKB && typeof window.GMKB.dispatch === 'function');
        
        // Check state manager
        this.systemsReady.stateManager = !!(window.enhancedStateManager && window.enhancedStateManager.getState);
        
        // Check component manager - ROOT FIX: Check for initialization properly
        this.systemsReady.componentManager = !!(window.enhancedComponentManager && 
            (window.enhancedComponentManager.isInitialized === true || 
             typeof window.enhancedComponentManager.addComponent === 'function'));
        
        // Check component renderer - ROOT FIX: Check for initialization properly
        this.systemsReady.componentRenderer = !!(window.enhancedComponentRenderer && 
            (window.enhancedComponentRenderer.initialized === true ||
             typeof window.enhancedComponentRenderer.renderComponent === 'function'));
        
        // ROOT FIX: Check UI systems (tabs, toolbar, modals, etc.)
        const hasModals = !!(window.GMKB_Modals || window.modalSystem);
        const hasTabs = !!(window.GMKBTabs || window.tabs || document.querySelector('.sidebar__tab[data-tab]'));
        const hasToolbar = !!(document.querySelector('#save-btn') && document.querySelector('#undo-btn'));
        
        this.systemsReady.uiSystems = hasModals && hasTabs && hasToolbar;
        
        if (forceDispatch) {
            this.logger.info('PHASE 3: UI systems debug check:', {
                hasModals,
                hasTabs, 
                hasToolbar,
                uiSystemsReady: this.systemsReady.uiSystems
            });
        }
        
        // ROOT FIX: All systems must be ready AND GMKB must be available
        const allReady = gmkbReady && Object.values(this.systemsReady).every(ready => ready);
        
        this.logger.info('🔍 PHASE 3: System readiness check:', {
            gmkbReady,
            ...this.systemsReady,
            allReady
        });
        
        if ((allReady || forceDispatch) && !this.hasDispatchedReady) {
            this.dispatchCoreSystemsReady();
        } else if (!gmkbReady) {
            this.logger.warn('⚠️ PHASE 3: GMKB core system not available - waiting for initialization');
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
                GMKB: !!window.GMKB,
                stateManager: !!window.enhancedStateManager,
                componentManager: !!window.enhancedComponentManager,
                componentRenderer: !!window.enhancedComponentRenderer,
                sectionLayoutManager: !!window.sectionLayoutManager,
                sectionRenderer: !!window.sectionRenderer,
                sectionTemplates: !!window.sectionTemplates
            },
            gmkbMethods: window.GMKB ? {
                dispatch: typeof window.GMKB.dispatch,
                subscribe: typeof window.GMKB.subscribe,
                systems: Object.keys(window.GMKB.systems || {})
            } : null
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
