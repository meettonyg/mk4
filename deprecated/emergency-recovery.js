/**
 * Emergency Component System Initializer
 * 
 * This file forces initialization of component manager and renderer
 * when they fail to auto-initialize due to script loading issues
 */

(function() {
    'use strict';
    
    console.log('🚨 EMERGENCY: Starting component system recovery...');
    
    let initAttempts = 0;
    const maxAttempts = 10;
    
    function attemptInitialization() {
        initAttempts++;
        console.log(`🔧 Recovery attempt ${initAttempts}/${maxAttempts}`);
        
        // Check if state manager is ready first
        if (!window.enhancedStateManager) {
            console.log('⏳ State manager not ready yet...');
            if (initAttempts < maxAttempts) {
                setTimeout(attemptInitialization, 500);
            }
            return;
        }
        
        // Force create Component Manager
        if (!window.enhancedComponentManager) {
            try {
                // Define the class inline if it's not available
                if (typeof EnhancedComponentManager === 'undefined') {
                    console.log('📦 Creating inline Component Manager class...');
                    
                    window.EnhancedComponentManager = class {
                        constructor() {
                            this.isInitialized = false;
                            this.stateManager = window.enhancedStateManager;
                            this.logger = window.structuredLogger || console;
                            this.idGenerator = window.gmkbIdGenerator || null;
                            
                            // Immediate initialization
                            this.isInitialized = true;
                            this.logger.info('[RECOVERY] Component Manager initialized');
                        }
                        
                        addComponent(type, data = {}) {
                            const componentId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                            const component = {
                                id: componentId,
                                type: type,
                                props: data,
                                data: data,
                                timestamp: Date.now()
                            };
                            
                            this.stateManager.dispatch({
                                type: 'ADD_COMPONENT',
                                payload: component
                            });
                            
                            return componentId;
                        }
                        
                        renderComponent() {
                            // Stub for coordinator
                            return true;
                        }
                    };
                }
                
                window.enhancedComponentManager = new (window.EnhancedComponentManager)();
                console.log('✅ Component Manager created via recovery');
            } catch (error) {
                console.error('❌ Failed to create Component Manager:', error);
            }
        }
        
        // Force create Renderer
        if (!window.enhancedComponentRenderer) {
            try {
                // Define simplified renderer inline
                console.log('📦 Creating inline Renderer...');
                
                window.enhancedComponentRenderer = {
                    initialized: true,
                    
                    renderComponent: function(component) {
                        const container = document.getElementById('saved-components-container') || 
                                        document.getElementById('media-kit-preview');
                        
                        if (!container) {
                            console.error('No container for rendering');
                            return;
                        }
                        
                        // Check if already rendered
                        if (document.getElementById(component.id)) {
                            return;
                        }
                        
                        // Create element
                        const element = document.createElement('div');
                        element.id = component.id;
                        element.className = `gmkb-component gmkb-component--${component.type}`;
                        element.setAttribute('data-component-id', component.id);
                        element.setAttribute('data-component-type', component.type);
                        
                        // Get renderer from registry
                        if (window.GMKBComponentRegistry) {
                            const renderer = window.GMKBComponentRegistry.getRenderer(component.type);
                            if (renderer) {
                                element.innerHTML = renderer(component.props || component.data || {});
                            } else {
                                element.innerHTML = `
                                    <div class="component-fallback">
                                        <h3>${component.type} Component</h3>
                                        <p>ID: ${component.id}</p>
                                    </div>
                                `;
                            }
                        } else {
                            element.innerHTML = `
                                <div class="component-fallback">
                                    <h3>${component.type} Component</h3>
                                    <p>ID: ${component.id}</p>
                                </div>
                            `;
                        }
                        
                        container.appendChild(element);
                        console.log('✅ Rendered component:', component.id);
                    },
                    
                    renderAllComponents: function() {
                        const state = window.enhancedStateManager?.getState();
                        if (!state || !state.components) return;
                        
                        Object.values(state.components).forEach(component => {
                            this.renderComponent(component);
                        });
                    }
                };
                
                console.log('✅ Renderer created via recovery');
            } catch (error) {
                console.error('❌ Failed to create Renderer:', error);
            }
        }
        
        // Force Section Manager if needed
        if (!window.sectionLayoutManager) {
            window.sectionLayoutManager = {
                initialized: true,
                sections: new Map(),
                registerSection: function() { return true; },
                getAllSections: function() { return []; }
            };
            console.log('✅ Section Manager stub created');
        }
        
        // Trigger coordinator check
        if (window.coreSystemsCoordinator) {
            window.coreSystemsCoordinator.checkSystemReadiness(true);
            console.log('📢 Notified coordinator of recovery');
        }
        
        // Try to render existing components
        setTimeout(() => {
            const state = window.enhancedStateManager?.getState();
            if (state && state.components && Object.keys(state.components).length > 0) {
                console.log('🎨 Attempting to render', Object.keys(state.components).length, 'components...');
                
                if (window.enhancedComponentRenderer && window.enhancedComponentRenderer.renderAllComponents) {
                    window.enhancedComponentRenderer.renderAllComponents();
                } else {
                    // Manual render
                    Object.values(state.components).forEach(component => {
                        if (window.enhancedComponentRenderer) {
                            window.enhancedComponentRenderer.renderComponent(component);
                        }
                    });
                }
            }
        }, 500);
    }
    
    // Start recovery process
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attemptInitialization);
    } else {
        // Already loaded, start immediately
        setTimeout(attemptInitialization, 100);
    }
    
    // Expose recovery function globally
    window.forceComponentSystemRecovery = attemptInitialization;
    
    console.log('🚨 EMERGENCY: Recovery system ready. Call forceComponentSystemRecovery() to retry.');
})();
