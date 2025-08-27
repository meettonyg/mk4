/**
 * @file component-render-engine.js
 * @description Core Component Rendering Engine
 * Handles individual component rendering with dynamic loader integration
 * 
 * ROOT FIX: Extracted from enhanced-component-renderer.js for better maintainability
 * Following checklist: Event-Driven, Root Cause Fix, Graceful Failure
 */

(function() {
    'use strict';
    
    // Fallback utilities
    const structuredLogger = window.structuredLogger || {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };
    
    const dynamicComponentLoader = window.dynamicComponentLoader || {
        renderComponent: async () => {
            const div = document.createElement('div');
            div.textContent = 'Component loading...';
            return div;
        }
    };
    
    const performanceMonitor = window.performanceMonitor || {
        start: () => () => {}
    };

    class ComponentRenderEngine {
        constructor() {
            this.logger = structuredLogger;
            this.renderCalls = new Map(); // Track render calls to prevent duplicates
        }

        /**
         * Render a single component using the dynamic component loader
         * Enhanced with comprehensive debugging and error handling
         */
        async renderComponent(componentConfig) {
            try {
                // Handle different input formats for maximum compatibility
                const config = {
                    id: componentConfig.id || `component-${Date.now()}`,
                    type: componentConfig.type || componentConfig.componentType,
                    props: componentConfig.props || componentConfig.data || {}
                };

                // ROOT CAUSE TRACKING: Check if this component is being rendered multiple times
                const callCount = (this.renderCalls.get(config.id) || 0) + 1;
                this.renderCalls.set(config.id, callCount);
                
                if (callCount > 1) {
                    this.logger.error('RENDER', `DUPLICATE RENDER DETECTED: Component ${config.id} is being rendered ${callCount} times!`);
                }
                
                this.logger.debug('RENDER', `renderComponent called:`, { 
                    id: config.id, 
                    type: config.type, 
                    propsKeys: Object.keys(config.props || {}), 
                    callCount 
                });
                
                // Verify dynamicComponentLoader is available
                if (!dynamicComponentLoader) {
                    throw new Error('dynamicComponentLoader not available');
                }
                
                // Call the dynamic component loader
                const element = await dynamicComponentLoader.renderComponent({
                    type: config.type,
                    id: config.id,
                    props: config.props
                });
                
                if (!element) {
                    throw new Error('Template produced no element');
                }
                
                // Set render timestamp for tracking
                element.setAttribute('data-render-time', Date.now().toString());
                
                this.logger.debug('RENDER', `Successfully rendered component ${config.id}:`, {
                    elementTagName: element.tagName,
                    elementId: element.id,
                    hasContent: element.innerHTML.length > 0
                });
                
                return {
                    id: config.id,
                    element,
                    success: true
                };
                
            } catch (error) {
                this.logger.error('RENDER', `Error rendering component ${componentConfig.id} (${componentConfig.type}):`, error);
                
                // Create informative error element
                const errorElement = this.createErrorElement(componentConfig, error);
                
                return {
                    id: componentConfig.id,
                    element: errorElement,
                    success: false,
                    error: error.message
                };
            }
        }

        /**
         * Render multiple components sequentially
         */
        async renderComponents(componentConfigs) {
            const results = [];
            const perfEnd = performanceMonitor.start('render-multiple-components', {
                count: componentConfigs.length
            });
            
            for (const config of componentConfigs) {
                const result = await this.renderComponent(config);
                results.push(result);
            }
            
            perfEnd();
            
            const successful = results.filter(r => r.success).length;
            const failed = results.length - successful;
            
            this.logger.info('RENDER', `Batch render completed: ${successful} successful, ${failed} failed`);
            
            return results;
        }

        /**
         * Create error element for failed renders
         */
        createErrorElement(componentConfig, error) {
            const errorElement = document.createElement('div');
            errorElement.id = componentConfig.id;
            errorElement.className = 'component-error';
            errorElement.setAttribute('data-component-id', componentConfig.id);
            
            errorElement.innerHTML = `
                <div style="
                    border: 2px solid #ff6b6b;
                    background: #ffe0e0;
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 8px;
                    text-align: center;
                ">
                    <h4 style="margin: 0 0 10px 0; color: #d63031;">Error rendering ${componentConfig.type}</h4>
                    <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">${error.message}</p>
                    <button onclick="console.log('Component error details:', ${JSON.stringify({ 
                        id: componentConfig.id, 
                        type: componentConfig.type, 
                        error: error.message 
                    })})" style="
                        padding: 5px 10px;
                        background: #d63031;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Debug Info</button>
                </div>
            `;
            
            return errorElement;
        }

        /**
         * Update component props without full re-render
         */
        async updateComponentProps(element, newProps) {
            try {
                if (typeof window.updateComponentProps === 'function') {
                    window.updateComponentProps(element, newProps);
                    this.logger.debug('RENDER', 'Component props updated via updateComponentProps');
                    return true;
                }
                
                // Fallback: store props for future dirty checking
                element.dataset.props = JSON.stringify(newProps || {});
                this.logger.debug('RENDER', 'Component props stored in dataset');
                return true;
                
            } catch (error) {
                this.logger.error('RENDER', 'Failed to update component props:', error);
                return false;
            }
        }

        /**
         * Check if component needs re-rendering based on props
         */
        needsRerender(element, newProps) {
            try {
                const currentProps = element.dataset.props ? JSON.parse(element.dataset.props) : {};
                const propsChanged = JSON.stringify(currentProps) !== JSON.stringify(newProps || {});
                
                this.logger.debug('RENDER', 'Props comparison:', {
                    elementId: element.id,
                    propsChanged,
                    currentPropsKeys: Object.keys(currentProps),
                    newPropsKeys: Object.keys(newProps || {})
                });
                
                return propsChanged;
                
            } catch (error) {
                this.logger.warn('RENDER', 'Error comparing props, assuming re-render needed:', error);
                return true;
            }
        }

        /**
         * Update component content without full re-render
         */
        async updateComponentContent(oldElement, newElement) {
            try {
                // Find content wrapper selectors
                const contentSelectors = [
                    '.component-content',
                    '.component-inner',
                    '.content-wrapper',
                    '[data-content]',
                    'article',
                    '.editable-element'
                ];
                
                let contentUpdated = false;
                
                for (const selector of contentSelectors) {
                    const oldContent = oldElement.querySelector(selector);
                    const newContent = newElement.querySelector(selector);
                    
                    if (oldContent && newContent) {
                        // Update only the content area, preserving controls
                        oldContent.innerHTML = newContent.innerHTML;
                        contentUpdated = true;
                        this.logger.debug('RENDER', `Updated content via selector: ${selector}`);
                        break;
                    }
                }
                
                // If no content wrapper found, update more carefully
                if (!contentUpdated) {
                    // Save all children that are NOT controls
                    const childrenToPreserve = [];
                    Array.from(oldElement.children).forEach(child => {
                        if (!child.classList.contains('component-controls--dynamic') && 
                            !child.classList.contains('component-controls')) {
                            childrenToPreserve.push(child);
                        }
                    });
                    
                    // Remove only non-control children
                    childrenToPreserve.forEach(child => child.remove());
                    
                    // Add new content (skip controls from new element)
                    Array.from(newElement.children).forEach(child => {
                        if (!child.classList.contains('component-controls--dynamic') && 
                            !child.classList.contains('component-controls')) {
                            oldElement.appendChild(child.cloneNode(true));
                        }
                    });
                    
                    contentUpdated = true;
                    this.logger.debug('RENDER', 'Updated content via careful replacement');
                }
                
                // Preserve data attributes
                Array.from(newElement.attributes).forEach(attr => {
                    if (attr.name.startsWith('data-') && attr.name !== 'data-component-id') {
                        oldElement.setAttribute(attr.name, attr.value);
                    }
                });
                
                return contentUpdated;
                
            } catch (error) {
                this.logger.error('RENDER', 'Failed to update component content:', error);
                return false;
            }
        }

        /**
         * Render component from saved state
         */
        async renderSavedComponent(savedComponent, componentState) {
            try {
                // Create unified config from saved component and state
                const config = {
                    id: savedComponent.id,
                    type: savedComponent.type,
                    props: savedComponent.props || savedComponent.data || componentState?.props || componentState?.data || {}
                };
                
                this.logger.debug('RENDER', `Rendering saved component: ${config.id}`);
                
                return await this.renderComponent(config);
                
            } catch (error) {
                this.logger.error('RENDER', `Failed to render saved component ${savedComponent.id}:`, error);
                return {
                    id: savedComponent.id,
                    element: this.createErrorElement(savedComponent, error),
                    success: false,
                    error: error.message
                };
            }
        }

        /**
         * Clear render call tracking
         */
        clearRenderTracking() {
            this.renderCalls.clear();
            this.logger.debug('RENDER', 'Render call tracking cleared');
        }

        /**
         * Get render engine statistics
         */
        getStats() {
            return {
                totalRenderCalls: Array.from(this.renderCalls.values()).reduce((sum, count) => sum + count, 0),
                uniqueComponents: this.renderCalls.size,
                duplicateRenders: Array.from(this.renderCalls.values()).filter(count => count > 1).length
            };
        }
    }

    // Export to global scope for WordPress compatibility
    window.ComponentRenderEngine = ComponentRenderEngine;
    
    // Create singleton instance
    if (!window.componentRenderEngine) {
        window.componentRenderEngine = new ComponentRenderEngine();
    }

    // Emit ready event
    document.dispatchEvent(new CustomEvent('gmkb:component-render-engine-ready', {
        detail: { 
            engine: window.componentRenderEngine,
            timestamp: Date.now()
        }
    }));

})();