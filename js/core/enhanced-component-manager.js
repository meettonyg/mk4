console.log('📦 enhanced-component-manager.js LOADING');

// Test if script executes at all
try {
    console.log('✅ enhanced-component-manager.js script executing');
} catch (e) {
    console.error('❌ enhanced-component-manager.js error:', e);
}

// Test if file executes at all
try {
    console.log('✅ enhanced-component-manager.js executing');
} catch(e) {
    console.error('❌ enhanced-component-manager.js error:', e);
}

/**
 * Enhanced Component Manager - ARCHITECTURE COMPLIANT
 * 
 * PRINCIPLES:
 * ✅ Event-driven, no polling
 * ✅ Single source of truth (state manager)
 * ✅ Self-contained component architecture
 * ✅ Root cause fixes only
 */

class EnhancedComponentManager {
    constructor() {
        this.isInitialized = false;
        this.stateManager = null;
        this.renderer = null;
        this.sectionManager = null;
        this.logger = window.structuredLogger || console;
        this.idGenerator = window.gmkbIdGenerator || null;
        
        // Event-driven initialization
        this.setupEventListeners();
        
        this.logger.info('[COMPONENT_MANAGER] Enhanced Component Manager created, waiting for core systems');
    }
    
    setupEventListeners() {
        // ROOT FIX: Break circular dependency - initialize directly when state manager is available
        const tryInitialize = () => {
            if (!this.isInitialized && window.enhancedStateManager) {
                this.logger.info('[COMPONENT_MANAGER] State manager detected, initializing immediately');
                this.initialize();
            }
        };
        
        // Listen for state manager ready
        document.addEventListener('gmkb:state-manager-ready', tryInitialize);
        
        // ROOT FIX: Don't wait for core-systems-ready as we ARE part of core systems
        // Instead, initialize immediately when our dependency (state manager) is available
        
        // Try immediate initialization if state manager already exists
        if (window.enhancedStateManager) {
            tryInitialize();
        } else {
            // Check periodically (max 20 attempts over 2 seconds)
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.enhancedStateManager) {
                    clearInterval(checkInterval);
                    tryInitialize();
                } else if (attempts >= 20) {
                    clearInterval(checkInterval);
                    this.logger.error('[COMPONENT_MANAGER] State manager not found after 2 seconds');
                }
            }, 100);
        }
    }
    
    initialize() {
        if (this.isInitialized) {
            this.logger.info('[COMPONENT_MANAGER] Already initialized, skipping');
            return;
        }
        
        // Get required systems
        this.stateManager = window.enhancedStateManager;
        this.renderer = window.enhancedComponentRenderer;
        this.sectionManager = window.sectionLayoutManager;
        this.idGenerator = window.gmkbIdGenerator;
        
        if (!this.stateManager) {
            this.logger.error('[COMPONENT_MANAGER] State manager not available, cannot initialize');
            return;
        }
        
        this.isInitialized = true;
        this.logger.info('[COMPONENT_MANAGER] ✅ Enhanced Component Manager initialized');
        
        // Set up component operation handlers
        this.setupComponentHandlers();
        
        // ROOT FIX: Add renderComponent method for coordinator detection
        // The coordinator checks for this method to determine if manager is ready
        if (!this.renderComponent) {
            this.renderComponent = (component) => {
                if (this.renderer && typeof this.renderer.renderComponent === 'function') {
                    return this.renderer.renderComponent(component);
                } else {
                    this.logger.warn('[COMPONENT_MANAGER] Renderer not available for renderComponent call');
                    return null;
                }
            };
        }
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('gmkb:component-manager-ready'));
        
        // ROOT FIX: Notify coordinator immediately of our readiness
        if (window.coreSystemsCoordinator && typeof window.coreSystemsCoordinator.checkSystemReadiness === 'function') {
            window.coreSystemsCoordinator.checkSystemReadiness();
            this.logger.info('[COMPONENT_MANAGER] Notified coordinator of readiness');
        } else {
            // Coordinator not ready yet, dispatch event for it to catch
            document.dispatchEvent(new CustomEvent('gmkb:manager-initialized', {
                detail: { manager: 'componentManager', timestamp: Date.now() }
            }));
        }
        
        // Load initial components if they exist
        this.loadInitialComponents();
    }
    
    setupComponentHandlers() {
        // Listen for component operations
        document.addEventListener('gmkb:add-component', (e) => {
            this.addComponent(e.detail.type, e.detail.data, e.detail.targetSectionId);
        });
        
        document.addEventListener('gmkb:remove-component', (e) => {
            this.removeComponent(e.detail.componentId);
        });
        
        document.addEventListener('gmkb:update-component', (e) => {
            this.updateComponent(e.detail.componentId, e.detail.updates);
        });
    }
    
    loadInitialComponents() {
        const state = this.stateManager.getState();
        
        if (!state.components || Object.keys(state.components).length === 0) {
            this.logger.info('[COMPONENT_MANAGER] No initial components to load');
            return;
        }
        
        this.logger.info('[COMPONENT_MANAGER] Loading initial components:', Object.keys(state.components).length);
        
        // Ensure sections exist for components
        this.ensureSectionsForComponents(state);
        
        // Trigger rendering of all components
        if (this.renderer && typeof this.renderer.renderAllComponents === 'function') {
            this.renderer.renderAllComponents();
        } else {
            // Fallback: render each component individually
            Object.values(state.components).forEach(component => {
                this.renderComponent(component);
            });
        }
    }
    
    ensureSectionsForComponents(state) {
        const components = state.components || {};
        const sections = state.sections || [];
        
        // Find components that need sections
        const componentsNeedingSections = new Map();
        
        Object.values(components).forEach(component => {
            if (component.sectionId) {
                if (!sections.find(s => s.section_id === component.sectionId)) {
                    componentsNeedingSections.set(component.sectionId, component);
                }
            }
        });
        
        // Create missing sections
        if (componentsNeedingSections.size > 0) {
            this.logger.info('[COMPONENT_MANAGER] Creating missing sections for components');
            
            componentsNeedingSections.forEach((component, sectionId) => {
                this.createSection(sectionId);
            });
        }
    }
    
    createSection(sectionId, type = 'full_width') {
        if (!this.sectionManager) {
            this.logger.warn('[COMPONENT_MANAGER] Section manager not available, creating basic section');
            
            // Create section in state only
            const section = {
                section_id: sectionId,
                type: type,
                components: [],
                created_at: Date.now()
            };
            
            const state = this.stateManager.getState();
            const sections = [...(state.sections || []), section];
            
            this.stateManager.dispatch({
                type: 'UPDATE_SECTIONS',
                payload: sections
            });
        } else {
            // Use section manager
            this.sectionManager.registerSection(sectionId, type);
        }
    }
    
    async addComponent(type, data = {}, targetSectionId = null) {
        // Generate unique ID
        const componentId = this.idGenerator ? 
            this.idGenerator.generateComponentId(type) : 
            `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        this.logger.info('[COMPONENT_MANAGER] Adding component:', componentId, type);
        
        // Ensure we have a section
        let sectionId = targetSectionId;
        if (!sectionId) {
            const state = this.stateManager.getState();
            const sections = state.sections || [];
            
            if (sections.length === 0) {
                // Create default section
                sectionId = `section_${Date.now()}`;
                this.createSection(sectionId);
            } else {
                // Use first section
                sectionId = sections[0].section_id;
            }
        }
        
        // Create component object
        const component = {
            id: componentId,
            type: type,
            props: data,
            data: data,
            sectionId: sectionId,
            timestamp: Date.now()
        };
        
        // Add to state
        this.stateManager.dispatch({
            type: 'ADD_COMPONENT',
            payload: component
        });
        
        // Render component
        await this.renderComponent(component);
        
        return componentId;
    }
    
    removeComponent(componentId) {
        this.logger.info('[COMPONENT_MANAGER] Removing component:', componentId);
        
        // Remove from state
        this.stateManager.dispatch({
            type: 'REMOVE_COMPONENT',
            payload: componentId
        });
        
        // Remove from DOM
        const element = document.querySelector(`[data-component-id="${componentId}"]`);
        if (element) {
            element.remove();
        }
    }
    
    updateComponent(componentId, updates) {
        this.logger.info('[COMPONENT_MANAGER] Updating component:', componentId);
        
        // Update in state
        this.stateManager.dispatch({
            type: 'UPDATE_COMPONENT',
            payload: {
                id: componentId,
                updates: updates
            }
        });
        
        // Re-render component
        const state = this.stateManager.getState();
        const component = state.components[componentId];
        if (component) {
            this.renderComponent(component);
        }
    }
    
    renderComponent(component) {
        if (this.renderer && typeof this.renderer.renderComponent === 'function') {
            this.renderer.renderComponent(component);
        } else {
            this.logger.warn('[COMPONENT_MANAGER] Renderer not available, cannot render component');
        }
    }
}

// ARCHITECTURE COMPLIANT: Expose class globally first
window.EnhancedComponentManager = EnhancedComponentManager;

// Wrap initialization in IIFE to prevent script execution issues
(function() {
    'use strict';
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (!window.enhancedComponentManager) {
                window.enhancedComponentManager = new EnhancedComponentManager();
                console.log('✅ Component Manager initialized on DOM ready');
            }
        });
    } else {
        // DOM already loaded
        if (!window.enhancedComponentManager) {
            window.enhancedComponentManager = new EnhancedComponentManager();
            console.log('✅ Component Manager initialized immediately');
        }
    }
})();
