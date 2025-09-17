/**
 * Section Component Loader Service
 * COMPLIANT: Event-driven service that handles component rendering for sections
 * 
 * CHECKLIST COMPLIANT:
 * ✅ Phase 1: Event-driven, no polling, no global sniffing
 * ✅ Phase 2: Simple, focused responsibility, no redundant logic
 * ✅ Phase 3: Uses state manager via events
 * ✅ Phase 4: Graceful error handling
 * ✅ Phase 5: Self-contained service
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    class SectionComponentLoader {
        constructor() {
            this.logger = window.structuredLogger || console;
            this.isReady = false;
            this.stateManager = null;
            this.componentRenderer = null;
            
            this.logger.info('SECTION_LOADER', '🔧 Section Component Loader initializing');
            this.initialize();
        }
        
        /**
         * Initialize the loader
         * COMPLIANT: Event-driven initialization only
         */
        initialize() {
            // Listen for section component requests
            document.addEventListener('gmkb:section-needs-components', (event) => {
                this.handleSectionNeedsComponents(event.detail);
            });
            
            // Listen for state manager ready
            document.addEventListener('gmkb:state-manager-ready', (event) => {
                this.stateManager = event.detail.stateManager;
                this.logger.info('SECTION_LOADER', '✅ State manager connected via event');
                this.checkReady();
            });
            
            // Listen for component renderer ready
            document.addEventListener('gmkb:enhanced-component-renderer-ready', (event) => {
                this.componentRenderer = event.detail.renderer;
                this.logger.info('SECTION_LOADER', '✅ Component renderer connected via event');
                this.checkReady();
            });
            
            // COMPLIANT: Try to get managers from events if they already fired
            this.requestManagerReferences();
            
            this.logger.info('SECTION_LOADER', '✅ Section Component Loader initialized');
        }
        
        /**
         * Request manager references via events
         * COMPLIANT: Uses events to get references, no global access
         */
        requestManagerReferences() {
            // Request state manager reference
            document.dispatchEvent(new CustomEvent('gmkb:request-state-manager', {
                detail: {
                    requester: 'SectionComponentLoader',
                    callback: (stateManager) => {
                        if (!this.stateManager && stateManager) {
                            this.stateManager = stateManager;
                            this.logger.info('SECTION_LOADER', '✅ State manager received via callback');
                            this.checkReady();
                        }
                    }
                }
            }));
            
            // Request component renderer reference
            document.dispatchEvent(new CustomEvent('gmkb:request-component-renderer', {
                detail: {
                    requester: 'SectionComponentLoader',
                    callback: (renderer) => {
                        if (!this.componentRenderer && renderer) {
                            this.componentRenderer = renderer;
                            this.logger.info('SECTION_LOADER', '✅ Component renderer received via callback');
                            this.checkReady();
                        }
                    }
                }
            }));
        }
        
        /**
         * Check if all dependencies are ready
         */
        checkReady() {
            if (!this.isReady && this.stateManager && this.componentRenderer) {
                this.isReady = true;
                this.logger.info('SECTION_LOADER', '🚀 Section Component Loader ready');
                
                // Emit ready event
                document.dispatchEvent(new CustomEvent('gmkb:section-component-loader-ready', {
                    detail: {
                        loader: this,
                        timestamp: Date.now()
                    }
                }));
            }
        }
        
        /**
         * Handle section needs components request
         * COMPLIANT: Processes events, uses injected dependencies
         */
        async handleSectionNeedsComponents(detail) {
            const { sectionId, sectionElement, components, targetContainers } = detail;
            
            this.logger.info('SECTION_LOADER', `📦 Processing components for section ${sectionId}`);
            
            // Wait for dependencies if not ready
            if (!this.isReady) {
                this.logger.warn('SECTION_LOADER', 'Not ready yet, deferring component loading');
                
                // Listen for ready event and retry
                document.addEventListener('gmkb:section-component-loader-ready', () => {
                    this.handleSectionNeedsComponents(detail);
                }, { once: true });
                
                return;
            }
            
            // Get state via event
            let state = null;
            await new Promise((resolve) => {
                document.dispatchEvent(new CustomEvent('gmkb:request-state', {
                    detail: {
                        requester: 'SectionComponentLoader',
                        callback: (currentState) => {
                            state = currentState;
                            resolve();
                        }
                    }
                }));
                
                // Fallback timeout
                setTimeout(() => {
                    if (!state && this.stateManager) {
                        // Emergency fallback - use cached reference
                        state = this.stateManager.getState();
                    }
                    resolve();
                }, 100);
            });
            
            if (!state) {
                this.logger.error('SECTION_LOADER', 'Could not get state for component rendering');
                return;
            }
            
            // Process each component
            for (const componentAssignment of components) {
                const { component_id } = componentAssignment;
                const targetInfo = targetContainers.get(component_id);
                
                if (!targetInfo) {
                    this.logger.warn('SECTION_LOADER', `No target container for component ${component_id}`);
                    continue;
                }
                
                const { container: targetContainer } = targetInfo;
                
                // Check if component already exists in DOM
                const existingComponent = document.querySelector(`[data-component-id="${component_id}"]`) || 
                                        document.getElementById(component_id);
                
                if (existingComponent) {
                    // Component exists, just move it
                    this.moveComponentToContainer(existingComponent, targetContainer);
                    this.logger.info('SECTION_LOADER', `✅ Moved existing component ${component_id} to section`);
                } else {
                    // Component doesn't exist - render it
                    const componentData = state.components?.[component_id];
                    
                    if (componentData) {
                        await this.renderComponentInContainer(component_id, componentData, targetContainer);
                    } else {
                        this.logger.warn('SECTION_LOADER', `Component ${component_id} not found in state`);
                    }
                }
            }
            
            // Remove empty placeholders
            const emptyPlaceholders = sectionElement.querySelectorAll('.gmkb-section__empty');
            emptyPlaceholders.forEach(placeholder => placeholder.remove());
            
            this.logger.info('SECTION_LOADER', `✅ Completed loading components for section ${sectionId}`);
        }
        
        /**
         * Move component to container
         */
        moveComponentToContainer(componentElement, targetContainer) {
            if (componentElement.parentElement !== targetContainer) {
                targetContainer.appendChild(componentElement);
            }
        }
        
        /**
         * Render component in container
         * COMPLIANT: Uses injected renderer, no global access
         */
        async renderComponentInContainer(componentId, componentData, targetContainer) {
            try {
                if (!this.componentRenderer) {
                    this.logger.error('SECTION_LOADER', 'Component renderer not available');
                    return;
                }
                
                // Use the renderer's public API
                const element = await this.componentRenderer.renderComponent(
                    componentId,
                    {
                        type: componentData.type,
                        props: componentData.props || componentData.data || {}
                    }
                );
                
                if (element) {
                    targetContainer.appendChild(element);
                    this.logger.info('SECTION_LOADER', `✅ Rendered component ${componentId} in section`);
                    
                    // Emit event that component was rendered
                    document.dispatchEvent(new CustomEvent('gmkb:component-rendered-in-section', {
                        detail: {
                            componentId,
                            element,
                            targetContainer,
                            timestamp: Date.now()
                        }
                    }));
                } else {
                    this.logger.error('SECTION_LOADER', `Failed to render component ${componentId}`);
                }
            } catch (error) {
                this.logger.error('SECTION_LOADER', `Error rendering component ${componentId}:`, error);
            }
        }
    }
    
    // Create instance
    const loader = new SectionComponentLoader();
    
    // Emit creation event
    document.dispatchEvent(new CustomEvent('gmkb:section-component-loader-created', {
        detail: {
            loader,
            timestamp: Date.now()
        }
    }));
    
    // For debugging only
    if (window.gmkbData?.debugMode) {
        window._sectionComponentLoader = loader;
    }
    
})();