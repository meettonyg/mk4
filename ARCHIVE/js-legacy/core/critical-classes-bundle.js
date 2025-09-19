/**
 * Critical Classes Bundle
 * 
 * This file contains the essential manager classes that fail to load individually
 * WordPress-compatible single file approach
 */

(function() {
    'use strict';
    
    console.log('📦 Loading critical classes bundle...');
    
    // Only define if not already defined
    if (typeof window.EnhancedComponentManager === 'undefined') {
        
        /**
         * Minimal Enhanced Component Manager
         */
        window.EnhancedComponentManager = class {
            constructor() {
                this.isInitialized = false;
                this.stateManager = window.enhancedStateManager || null;
                this.logger = window.structuredLogger || console;
                this.idGenerator = window.gmkbIdGenerator || null;
                
                if (this.stateManager) {
                    this.isInitialized = true;
                    this.logger.info('[COMPONENT_MANAGER] Minimal Component Manager initialized');
                    this.loadInitialComponents();
                }
            }
            
            loadInitialComponents() {
                const state = this.stateManager.getState();
                if (state && state.components) {
                    this.logger.info('[COMPONENT_MANAGER] Found components in state:', Object.keys(state.components).length);
                }
            }
            
            addComponent(type, data = {}) {
                const componentId = this.idGenerator ? 
                    this.idGenerator.generateComponentId(type) : 
                    `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                const component = {
                    id: componentId,
                    type: type,
                    props: data,
                    timestamp: Date.now()
                };
                
                this.stateManager.dispatch({
                    type: 'ADD_COMPONENT',
                    payload: component
                });
                
                return componentId;
            }
            
            renderComponent(component) {
                // Stub for coordinator
                return true;
            }
        };
    }
    
    if (typeof window.SimplifiedComponentRenderer === 'undefined') {
        
        /**
         * Minimal Simplified Component Renderer
         */
        window.SimplifiedComponentRenderer = class {
            constructor() {
                this.stateManager = window.enhancedStateManager || null;
                this.logger = window.structuredLogger || console;
                this.componentRegistry = window.GMKBComponentRegistry || null;
                
                this.logger.info('[RENDERER] Minimal Component Renderer initialized');
                
                // Auto-render after short delay
                setTimeout(() => this.renderAllComponents(), 500);
            }
            
            renderAllComponents() {
                if (!this.stateManager) {
                    this.logger.warn('[RENDERER] No state manager available');
                    return;
                }
                
                const state = this.stateManager.getState();
                if (!state || !state.components) {
                    this.logger.info('[RENDERER] No components to render');
                    return;
                }
                
                const container = document.getElementById('saved-components-container') || 
                                document.getElementById('media-kit-preview');
                
                if (!container) {
                    this.logger.error('[RENDERER] No container found for rendering');
                    return;
                }
                
                // Clear and render
                container.innerHTML = '';
                
                Object.values(state.components).forEach(component => {
                    this.renderComponent(component);
                });
                
                // Hide empty state
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'none';
                }
                
                this.logger.info('[RENDERER] Rendered', Object.keys(state.components).length, 'components');
            }
            
            renderComponent(component) {
                const container = document.getElementById('saved-components-container') || 
                                document.getElementById('media-kit-preview');
                
                if (!container) return;
                
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
                
                // Try to get renderer from registry
                if (this.componentRegistry) {
                    const renderer = this.componentRegistry.getRenderer(component.type);
                    if (renderer) {
                        element.innerHTML = renderer(component.props || component.data || {});
                    } else {
                        element.innerHTML = this.getFallbackHTML(component);
                    }
                } else {
                    element.innerHTML = this.getFallbackHTML(component);
                }
                
                container.appendChild(element);
                this.logger.info('[RENDERER] Rendered component:', component.id);
            }
            
            getFallbackHTML(component) {
                return `
                    <div class="gmkb-component-content">
                        <h3>${component.type} Component</h3>
                        <p>ID: ${component.id}</p>
                        ${component.props?.biography ? `<div>${component.props.biography}</div>` : ''}
                    </div>
                `;
            }
        };
    }
    
    if (typeof window.SectionLayoutManager === 'undefined') {
        
        /**
         * Minimal Section Layout Manager
         */
        window.SectionLayoutManager = class {
            constructor() {
                this.sections = new Map();
                this.logger = window.structuredLogger || console;
                this.logger.info('[SECTION_MANAGER] Minimal Section Manager initialized');
            }
            
            registerSection(sectionId, type) {
                this.sections.set(sectionId, { id: sectionId, type: type });
                return true;
            }
            
            getAllSections() {
                return Array.from(this.sections.values());
            }
        };
    }
    
    if (typeof window.SectionRenderer === 'undefined') {
        
        /**
         * Minimal Section Renderer
         */
        window.SectionRenderer = class {
            constructor() {
                this.logger = window.structuredLogger || console;
                this.logger.info('[SECTION_RENDERER] Minimal Section Renderer initialized');
            }
            
            renderSection(section) {
                return true;
            }
        };
    }
    
    console.log('✅ Critical classes bundle loaded');
    
    // Now initialize them
    setTimeout(() => {
        if (!window.enhancedComponentManager && window.EnhancedComponentManager) {
            window.enhancedComponentManager = new window.EnhancedComponentManager();
            console.log('✅ Component Manager instantiated from bundle');
        }
        
        if (!window.enhancedComponentRenderer && window.SimplifiedComponentRenderer) {
            window.enhancedComponentRenderer = new window.SimplifiedComponentRenderer();
            console.log('✅ Component Renderer instantiated from bundle');
        }
        
        if (!window.sectionLayoutManager && window.SectionLayoutManager) {
            window.sectionLayoutManager = new window.SectionLayoutManager();
            console.log('✅ Section Manager instantiated from bundle');
        }
        
        if (!window.sectionRenderer && window.SectionRenderer) {
            window.sectionRenderer = new window.SectionRenderer();
            console.log('✅ Section Renderer instantiated from bundle');
        }
        
        // Notify coordinator
        if (window.coreSystemsCoordinator) {
            window.coreSystemsCoordinator.checkSystemReadiness(true);
        }
    }, 100);
    
})();
