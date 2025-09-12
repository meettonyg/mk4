/**
 * Force Initialization of Core Managers
 * This file ensures the critical managers are initialized even if their files fail
 */

console.log('🚨 Force Init: Starting manager initialization recovery...');

// Wait for dependencies
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        console.log('🚨 Force Init: Checking manager status...');
        
        // Check current status
        const status = {
            stateManager: !!window.enhancedStateManager,
            componentManager: !!window.enhancedComponentManager,
            renderer: !!window.enhancedComponentRenderer,
            sectionManager: !!window.sectionLayoutManager
        };
        
        console.log('🚨 Force Init: Current status:', status);
        
        // Force create component manager if missing
        if (!window.enhancedComponentManager && window.enhancedStateManager) {
            console.log('🚨 Force Init: Creating component manager...');
            
            // Minimal component manager
            window.enhancedComponentManager = {
                isInitialized: true,
                stateManager: window.enhancedStateManager,
                
                addComponent: function(type, data, sectionId) {
                    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const component = {
                        id: id,
                        type: type,
                        props: data || {},
                        data: data || {},
                        sectionId: sectionId,
                        timestamp: Date.now()
                    };
                    
                    this.stateManager.dispatch({
                        type: 'ADD_COMPONENT',
                        payload: component
                    });
                    
                    return id;
                },
                
                renderComponent: function(component) {
                    if (window.enhancedComponentRenderer) {
                        window.enhancedComponentRenderer.renderComponent(component);
                    }
                    return true;
                }
            };
            
            console.log('✅ Force Init: Component manager created');
        }
        
        // Force create renderer if missing
        if (!window.enhancedComponentRenderer && window.GMKBComponentRegistry) {
            console.log('🚨 Force Init: Creating renderer...');
            
            window.enhancedComponentRenderer = {
                initialized: true,
                
                renderComponent: function(component) {
                    const container = document.getElementById('saved-components-container') || 
                                     document.getElementById('media-kit-preview');
                    
                    if (!container) return;
                    
                    // Check if already exists
                    let element = document.getElementById(component.id);
                    if (!element) {
                        element = document.createElement('div');
                        element.id = component.id;
                        element.className = `gmkb-component gmkb-component--${component.type}`;
                        element.setAttribute('data-component-id', component.id);
                        element.setAttribute('data-component-type', component.type);
                        container.appendChild(element);
                    }
                    
                    // Get renderer from registry
                    const renderer = window.GMKBComponentRegistry.getRenderer(component.type);
                    if (renderer) {
                        element.innerHTML = renderer(component.props || component.data || {});
                    } else {
                        element.innerHTML = `
                            <div class="component-placeholder">
                                <h3>${component.type} Component</h3>
                                <p>ID: ${component.id}</p>
                            </div>
                        `;
                    }
                    
                    console.log('✅ Rendered component:', component.id);
                },
                
                renderAllComponents: function() {
                    const state = window.enhancedStateManager?.getState();
                    if (!state || !state.components) return;
                    
                    // Clear container first
                    const container = document.getElementById('saved-components-container') || 
                                     document.getElementById('media-kit-preview');
                    if (container) {
                        container.innerHTML = '';
                    }
                    
                    // Render each component
                    Object.values(state.components).forEach(component => {
                        this.renderComponent(component);
                    });
                    
                    console.log('✅ Rendered all components');
                }
            };
            
            console.log('✅ Force Init: Renderer created');
        }
        
        // Force create section manager if missing
        if (!window.sectionLayoutManager) {
            console.log('🚨 Force Init: Creating section manager...');
            
            window.sectionLayoutManager = {
                initialized: true,
                sections: new Map(),
                
                registerSection: function(sectionId, type) {
                    this.sections.set(sectionId, {
                        section_id: sectionId,
                        type: type || 'full_width',
                        components: []
                    });
                    return true;
                },
                
                getAllSections: function() {
                    return Array.from(this.sections.values());
                }
            };
            
            console.log('✅ Force Init: Section manager created');
        }
        
        // Notify coordinator
        if (window.coreSystemsCoordinator) {
            window.coreSystemsCoordinator.checkSystemReadiness(true);
            console.log('📢 Force Init: Notified coordinator');
        }
        
        // Try to render existing components
        if (window.enhancedComponentRenderer && window.enhancedComponentRenderer.renderAllComponents) {
            console.log('🎨 Force Init: Rendering components...');
            window.enhancedComponentRenderer.renderAllComponents();
            
            // Hide empty state if components exist
            const state = window.enhancedStateManager?.getState();
            if (state && state.components && Object.keys(state.components).length > 0) {
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'none';
                }
                
                const container = document.getElementById('saved-components-container') || 
                                 document.getElementById('media-kit-preview');
                if (container) {
                    container.style.display = 'block';
                }
            }
        }
        
        console.log('✅ Force Init: Recovery complete');
        
    }, 1000); // Wait 1 second for other systems
});

// Expose global recovery function
window.forceInitManagers = function() {
    location.reload();
};

console.log('🚨 Force Init: Script loaded. Waiting for DOM...');
