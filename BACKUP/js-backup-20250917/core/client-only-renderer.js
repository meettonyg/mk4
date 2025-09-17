/**
 * Client-Only Component Renderer
 * 
 * ARCHITECTURE: Single rendering path - JavaScript only
 * - No PHP hydration
 * - No duplicate checking
 * - No complex state reconciliation
 * - Components ONLY render through sections
 */

(function() {
    'use strict';
    
    class ClientOnlyRenderer {
        constructor() {
            this.logger = window.structuredLogger || console;
            this.stateManager = null;
            this.renderedComponents = new Map();
            
            this.logger.info('CSR', '🎨 Client-Only Renderer initializing...');
            this.init();
        }
        
        async init() {
            // Wait for state manager
            if (!window.enhancedStateManager) {
                document.addEventListener('gmkb:state-manager:ready', (e) => {
                    this.stateManager = e.detail.stateManager;
                    this.startRendering();
                }, { once: true });
            } else {
                this.stateManager = window.enhancedStateManager;
                this.startRendering();
            }
            
            // Listen for section events
            document.addEventListener('gmkb:section-rendered', (e) => {
                this.renderComponentsInSection(e.detail.sectionId);
            });
            
            // Emit ready event
            document.dispatchEvent(new CustomEvent('gmkb:client-renderer-ready', {
                detail: { renderer: this }
            }));
        }
        
        startRendering() {
            const state = this.stateManager.getState();
            this.logger.info('CSR', `Starting initial render with ${Object.keys(state.components || {}).length} components`);
            
            // Update container visibility
            this.updateContainerVisibility(state);
            
            // Sections handle their own rendering
            // We just need to ensure container visibility
        }
        
        /**
         * Render components in a specific section
         * Called when a section is rendered
         */
        async renderComponentsInSection(sectionId) {
            const state = this.stateManager.getState();
            const components = Object.values(state.components || {}).filter(c => c.sectionId === sectionId);
            
            if (components.length === 0) {
                this.logger.debug('CSR', `No components for section ${sectionId}`);
                return;
            }
            
            const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
            if (!sectionElement) {
                this.logger.error('CSR', `Section element not found: ${sectionId}`);
                return;
            }
            
            // Find container in section
            const container = sectionElement.querySelector('.gmkb-section__content') ||
                            sectionElement.querySelector('.gmkb-section__inner');
            
            if (!container) {
                this.logger.error('CSR', `No container in section ${sectionId}`);
                return;
            }
            
            // Render each component
            for (const component of components) {
                // SINGLE CHECK: Has this component been rendered?
                if (this.renderedComponents.has(component.id)) {
                    this.logger.debug('CSR', `Component ${component.id} already rendered`);
                    continue;
                }
                
                const element = await this.renderComponent(component);
                if (element) {
                    container.appendChild(element);
                    this.renderedComponents.set(component.id, element);
                    this.logger.info('CSR', `✅ Rendered ${component.id} in section ${sectionId}`);
                }
            }
        }
        
        /**
         * Render a single component
         * Pure and simple - no complex logic
         */
        async renderComponent(component) {
            const element = document.createElement('div');
            element.id = component.id;
            element.className = 'gmkb-component';
            element.setAttribute('data-component-id', component.id);
            element.setAttribute('data-component-type', component.type);
            
            // Get HTML from registry
            let html = '';
            if (window.GMKBComponentRegistry) {
                try {
                    const renderer = window.GMKBComponentRegistry.getRenderer(component.type);
                    html = renderer(component.props || {}, {});
                } catch (error) {
                    this.logger.error('CSR', `Failed to render ${component.type}:`, error);
                    html = `<div class="error">Failed to render ${component.type}</div>`;
                }
            } else {
                html = `<div>${component.type} component</div>`;
            }
            
            element.innerHTML = html;
            
            // Attach controls
            this.attachControls(element, component.id);
            
            return element;
        }
        
        /**
         * Attach controls to a component
         * Single, simple control attachment
         */
        attachControls(element, componentId) {
            // Only attach if no controls exist
            if (element.querySelector('.gmkb-component__controls')) {
                return;
            }
            
            const controls = document.createElement('div');
            controls.className = 'gmkb-component__controls';
            controls.innerHTML = `
                <button data-action="move-up" title="Move Up">↑</button>
                <button data-action="move-down" title="Move Down">↓</button>
                <button data-action="edit" title="Edit">✏️</button>
                <button data-action="delete" title="Delete">🗑️</button>
            `;
            
            element.appendChild(controls);
            
            // Add event listeners
            controls.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action) {
                    this.handleControlAction(action, componentId);
                }
            });
        }
        
        handleControlAction(action, componentId) {
            this.logger.info('CSR', `Control action: ${action} for ${componentId}`);
            
            // Dispatch events for other systems to handle
            document.dispatchEvent(new CustomEvent(`gmkb:component-${action}`, {
                detail: { componentId }
            }));
        }
        
        /**
         * Update container visibility based on state
         * Simple show/hide logic
         */
        updateContainerVisibility(state) {
            const hasContent = (state.components && Object.keys(state.components).length > 0) ||
                             (state.sections && state.sections.length > 0);
            
            const savedContainer = document.getElementById('saved-components-container');
            const emptyState = document.getElementById('empty-state');
            
            if (savedContainer) {
                savedContainer.style.display = hasContent ? 'block' : 'none';
            }
            
            if (emptyState) {
                emptyState.style.display = hasContent ? 'none' : 'block';
            }
            
            this.logger.info('CSR', `Container visibility updated - has content: ${hasContent}`);
        }
    }
    
    // Initialize when ready
    if (window.GMKB_RENDER_MODE === 'client') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.clientOnlyRenderer = new ClientOnlyRenderer();
            });
        } else {
            window.clientOnlyRenderer = new ClientOnlyRenderer();
        }
        
        console.log('✅ Client-Only Renderer: Ready for JavaScript-only rendering');
    }
    
})();
