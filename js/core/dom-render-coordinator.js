/**
 * @file dom-render-coordinator.js
 * @description ROOT FIX: DOM Render Coordinator
 * 
 * CRITICAL PROBLEM SOLVED:
 * - Prevents DOM duplication of components (24 elements for 4 components)
 * - Ensures only ONE DOM element per component ID
 * - Coordinates all rendering operations through a single pipeline
 * - Eliminates race conditions in component rendering
 * 
 * ARCHITECTURAL PRINCIPLES:
 * ✅ Single Render Pipeline: All component rendering goes through one coordinator
 * ✅ Duplicate Prevention: Aggressive deduplication before and after rendering
 * ✅ Event-Driven: No polling, pure event-based coordination
 * ✅ State Consistency: DOM always matches component state exactly
 * ✅ Controls Integration: Ensures controls can attach to unique elements
 */

(function() {
    'use strict';
    
    // Dependencies with fallbacks
    const structuredLogger = window.structuredLogger || {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };

    /**
     * ROOT FIX: DOM Render Coordinator
     * Single source of truth for all component DOM operations
     */
    class DOMRenderCoordinator {
        constructor() {
            this.isInitialized = false;
            this.renderingInProgress = false;
            this.renderQueue = new Map(); // componentId -> renderRequest
            this.domRegistry = new Map(); // componentId -> element
            this.preventDuplicates = true;
            this.renderingMode = 'coordinated'; // 'coordinated' | 'direct'
            
            // Performance tracking
            this.renderStats = {
                totalRenders: 0,
                duplicatesBlocked: 0,
                forcedCleanups: 0,
                lastRenderTime: 0
            };
            
            this.logger = structuredLogger;
        }
        
        /**
         * Initialize the coordinator
         */
        init() {
            if (this.isInitialized) return;
            
            this.setupEventListeners();
            this.isInitialized = true;
            
            this.logger.info('DOM_COORDINATOR', 'DOM Render Coordinator initialized - preventing duplication');
            
            // Dispatch ready event
            document.dispatchEvent(new CustomEvent('gmkb:dom-coordinator-ready', {
                detail: { coordinator: this }
            }));
        }
        
        /**
         * ROOT FIX: Coordinated component rendering with duplication prevention
         * @param {string} componentId - Unique component ID
         * @param {HTMLElement} newElement - New DOM element to render
         * @param {string} targetContainerId - Container to render into
         * @param {Object} options - Rendering options
         */
        async renderComponent(componentId, newElement, targetContainerId = 'media-kit-preview', options = {}) {
            if (!componentId || !newElement) {
                this.logger.error('DOM_COORDINATOR', 'Invalid render request', { componentId, hasElement: !!newElement });
                return false;
            }
            
            try {
                // ROOT FIX: AGGRESSIVE duplicate prevention BEFORE rendering
                this.aggressiveDeduplication(componentId);
                
                // Get target container
                const targetContainer = document.getElementById(targetContainerId);
                if (!targetContainer) {
                    this.logger.error('DOM_COORDINATOR', `Target container not found: ${targetContainerId}`);
                    return false;
                }
                
                // ROOT FIX: Ensure the new element has the correct ID and attributes
                newElement.id = componentId;
                newElement.setAttribute('data-component-id', componentId);
                newElement.setAttribute('data-render-coordinator', 'true');
                newElement.setAttribute('data-render-time', Date.now().toString());
                
                // ROOT FIX: Check for existing element ONE MORE TIME before insertion
                const existingElement = this.domRegistry.get(componentId) || document.getElementById(componentId);
                if (existingElement && existingElement.parentNode) {
                    this.logger.debug('DOM_COORDINATOR', `Replacing existing element for ${componentId}`);
                    existingElement.replaceWith(newElement);
                } else {
                    this.logger.debug('DOM_COORDINATOR', `Inserting new element for ${componentId}`);
                    targetContainer.appendChild(newElement);
                }
                
                // ROOT FIX: Register in DOM registry for tracking
                this.domRegistry.set(componentId, newElement);
                
                // ROOT FIX: Verify no duplicates after insertion
                const verification = this.verifyUniqueElement(componentId);
                if (!verification.isUnique) {
                    this.logger.warn('DOM_COORDINATOR', `Duplicate elements detected after render for ${componentId}`, verification);
                    this.emergencyDeduplication(componentId);
                }
                
                // Update stats
                this.renderStats.totalRenders++;
                this.renderStats.lastRenderTime = Date.now();
                
                // ROOT FIX: Attach component controls immediately after successful render
                // Use the actual element from DOM, not the pre-render element
                const actualElement = document.getElementById(componentId);
                if (actualElement) {
                    this.attachControlsToComponent(actualElement, componentId);
                } else {
                    this.logger.error('DOM_COORDINATOR', `Could not find element ${componentId} after render`);
                }
                
                this.logger.info('DOM_COORDINATOR', `Successfully rendered ${componentId}`, {
                    targetContainer: targetContainerId,
                    renderMode: 'coordinated'
                });
                
                // Dispatch render success event
                document.dispatchEvent(new CustomEvent('gmkb:component-rendered-coordinated', {
                    detail: {
                        componentId,
                        element: actualElement || newElement,
                        targetContainer: targetContainerId,
                        renderTime: Date.now(),
                        verification
                    }
                }));
                
                return true;
                
            } catch (error) {
                this.logger.error('DOM_COORDINATOR', `Failed to render component ${componentId}`, error);
                return false;
            }
        }
        
        /**
         * ROOT FIX: Aggressive deduplication before rendering
         * Removes ALL existing elements with the same component ID
         */
        aggressiveDeduplication(componentId) {
            // Method 1: Query by ID
            const elementById = document.getElementById(componentId);
            if (elementById) {
                elementById.remove();
                this.renderStats.duplicatesBlocked++;
                this.logger.debug('DOM_COORDINATOR', `Removed existing element by ID: ${componentId}`);
            }
            
            // Method 2: Query by data-component-id attribute
            const elementsByDataId = document.querySelectorAll(`[data-component-id="${componentId}"]`);
            if (elementsByDataId.length > 0) {
                elementsByDataId.forEach((element, index) => {
                    element.remove();
                    this.renderStats.duplicatesBlocked++;
                    this.logger.debug('DOM_COORDINATOR', `Removed duplicate element ${index + 1} for ${componentId}`);
                });
            }
            
            // Method 3: Clean up registry
            this.domRegistry.delete(componentId);
            
            this.logger.debug('DOM_COORDINATOR', `Aggressive deduplication completed for ${componentId}`, {
                removedById: elementById ? 1 : 0,
                removedByDataId: elementsByDataId.length,
                totalBlocked: this.renderStats.duplicatesBlocked
            });
        }
        
        /**
         * ROOT FIX: Verify element uniqueness after rendering
         */
        verifyUniqueElement(componentId) {
            const elementsById = document.querySelectorAll(`#${componentId}`);
            const elementsByDataId = document.querySelectorAll(`[data-component-id="${componentId}"]`);
            
            const verification = {
                componentId,
                isUnique: elementsById.length === 1 && elementsByDataId.length === 1,
                countById: elementsById.length,
                countByDataId: elementsByDataId.length,
                inRegistry: this.domRegistry.has(componentId)
            };
            
            if (!verification.isUnique) {
                this.logger.warn('DOM_COORDINATOR', `Uniqueness verification failed for ${componentId}`, verification);
            }
            
            return verification;
        }
        
        /**
         * ROOT FIX: Emergency deduplication when verification fails
         */
        emergencyDeduplication(componentId) {
            this.logger.warn('DOM_COORDINATOR', `EMERGENCY: Forcing deduplication for ${componentId}`);
            
            // Get all elements with this ID
            const allElements = [
                ...document.querySelectorAll(`#${componentId}`),
                ...document.querySelectorAll(`[data-component-id="${componentId}"]`)
            ];
            
            // Keep only the first element, remove all others
            const uniqueElements = new Map();
            allElements.forEach(element => {
                if (!uniqueElements.has(componentId)) {
                    // Keep first element
                    uniqueElements.set(componentId, element);
                    this.domRegistry.set(componentId, element);
                } else {
                    // Remove duplicate
                    element.remove();
                    this.renderStats.forcedCleanups++;
                }
            });
            
            this.logger.warn('DOM_COORDINATOR', `Emergency deduplication completed for ${componentId}`, {
                totalElements: allElements.length,
                duplicatesRemoved: allElements.length - uniqueElements.size,
                keptElement: uniqueElements.has(componentId)
            });
        }
        
        /**
         * ROOT FIX: Remove component from DOM and registry
         */
        removeComponent(componentId) {
            if (!componentId) return false;
            
            try {
                // Remove from DOM
                const element = this.domRegistry.get(componentId) || document.getElementById(componentId);
                if (element && element.parentNode) {
                    element.remove();
                    this.logger.debug('DOM_COORDINATOR', `Removed component from DOM: ${componentId}`);
                }
                
                // Clean up any duplicates
                const duplicates = document.querySelectorAll(`[data-component-id="${componentId}"]`);
                duplicates.forEach(duplicate => {
                    duplicate.remove();
                    this.logger.debug('DOM_COORDINATOR', `Removed duplicate element for ${componentId}`);
                });
                
                // Remove from registry
                this.domRegistry.delete(componentId);
                
                // Dispatch removal event
                document.dispatchEvent(new CustomEvent('gmkb:component-removed-coordinated', {
                    detail: { componentId, removedAt: Date.now() }
                }));
                
                return true;
                
            } catch (error) {
                this.logger.error('DOM_COORDINATOR', `Failed to remove component ${componentId}`, error);
                return false;
            }
        }
        
        /**
         * ROOT FIX: Reorder components according to layout
         */
        reorderComponents(layout) {
            if (!Array.isArray(layout) || layout.length === 0) {
                this.logger.debug('DOM_COORDINATOR', 'No layout provided for reordering');
                return;
            }
            
            const targetContainer = document.getElementById('media-kit-preview');
            if (!targetContainer) {
                this.logger.error('DOM_COORDINATOR', 'Preview container not found for reordering');
                return;
            }
            
            try {
                // Create a map of elements for efficient reordering
                const elementMap = new Map();
                layout.forEach(componentId => {
                    const element = this.domRegistry.get(componentId) || document.getElementById(componentId);
                    if (element) {
                        elementMap.set(componentId, element);
                    }
                });
                
                // Reorder elements according to layout
                layout.forEach((componentId, index) => {
                    const element = elementMap.get(componentId);
                    if (element) {
                        const currentPosition = Array.from(targetContainer.children).indexOf(element);
                        if (currentPosition !== index) {
                            const nextSibling = targetContainer.children[index];
                            targetContainer.insertBefore(element, nextSibling || null);
                        }
                    }
                });
                
                this.logger.debug('DOM_COORDINATOR', `Reordered ${elementMap.size} components`, { layout });
                
            } catch (error) {
                this.logger.error('DOM_COORDINATOR', 'Failed to reorder components', error);
            }
        }
        
        /**
         * ROOT FIX: Attach component controls to newly rendered element
         */
        attachControlsToComponent(element, componentId) {
            if (!window.componentControlsManager) {
                this.logger.debug('DOM_COORDINATOR', 'Component controls manager not available');
                return false;
            }
            
            try {
                // Ensure element is properly prepared for controls
                element.style.position = element.style.position || 'relative';
                element.setAttribute('data-controls-ready', 'true');
                
                // Attach controls
                const success = window.componentControlsManager.attachControls(element, componentId);
                
                if (success) {
                    this.logger.debug('DOM_COORDINATOR', `Controls attached to ${componentId} via coordinator`);
                } else {
                    this.logger.warn('DOM_COORDINATOR', `Failed to attach controls to ${componentId}`);
                }
                
                return success;
                
            } catch (error) {
                this.logger.error('DOM_COORDINATOR', `Error attaching controls to ${componentId}`, error);
                return false;
            }
        }
        
        /**
         * ROOT FIX: Complete DOM state analysis for debugging
         */
        analyzeDOMState() {
            const analysis = {
                timestamp: Date.now(),
                domRegistry: {
                    size: this.domRegistry.size,
                    components: Array.from(this.domRegistry.keys())
                },
                domElements: {},
                duplicates: {},
                orphans: [],
                stats: { ...this.renderStats }
            };
            
            // Analyze each component in registry
            this.domRegistry.forEach((element, componentId) => {
                const elementsById = document.querySelectorAll(`#${componentId}`);
                const elementsByDataId = document.querySelectorAll(`[data-component-id="${componentId}"]`);
                
                analysis.domElements[componentId] = {
                    inRegistry: true,
                    elementsById: elementsById.length,
                    elementsByDataId: elementsByDataId.length,
                    inDOM: element.parentNode ? true : false,
                    hasControls: element.querySelector('.component-controls--dynamic') ? true : false
                };
                
                // Track duplicates
                if (elementsById.length > 1 || elementsByDataId.length > 1) {
                    analysis.duplicates[componentId] = {
                        countById: elementsById.length,
                        countByDataId: elementsByDataId.length
                    };
                }
            });
            
            // Find orphan elements (in DOM but not in registry)
            const allComponentElements = document.querySelectorAll('[data-component-id]');
            allComponentElements.forEach(element => {
                const componentId = element.getAttribute('data-component-id');
                if (componentId && !this.domRegistry.has(componentId)) {
                    analysis.orphans.push(componentId);
                }
            });
            
            return analysis;
        }
        
        /**
         * ROOT FIX: Force cleanup all duplicates in DOM
         */
        forceCleanupAllDuplicates() {
            this.logger.info('DOM_COORDINATOR', 'Starting force cleanup of all duplicates');
            
            const allComponents = document.querySelectorAll('[data-component-id]');
            const componentCounts = new Map();
            const elementsToRemove = [];
            
            // Count occurrences of each component ID
            allComponents.forEach(element => {
                const componentId = element.getAttribute('data-component-id');
                if (componentId) {
                    if (!componentCounts.has(componentId)) {
                        componentCounts.set(componentId, []);
                    }
                    componentCounts.get(componentId).push(element);
                }
            });
            
            // Remove duplicates (keep first, remove rest)
            let totalRemoved = 0;
            componentCounts.forEach((elements, componentId) => {
                if (elements.length > 1) {
                    // Keep first element, remove others
                    const [firstElement, ...duplicates] = elements;
                    
                    duplicates.forEach(duplicate => {
                        duplicate.remove();
                        totalRemoved++;
                    });
                    
                    // Update registry with the kept element
                    this.domRegistry.set(componentId, firstElement);
                    
                    this.logger.debug('DOM_COORDINATOR', `Cleaned up ${duplicates.length} duplicates for ${componentId}`);
                }
            });
            
            this.renderStats.forcedCleanups += totalRemoved;
            
            this.logger.info('DOM_COORDINATOR', `Force cleanup completed: removed ${totalRemoved} duplicates`);
            
            return {
                totalRemoved,
                uniqueComponents: componentCounts.size,
                cleanupTime: Date.now()
            };
        }
        
        /**
         * Setup event listeners for coordination
         */
        setupEventListeners() {
            // Listen for render requests from enhanced component renderer
            document.addEventListener('gmkb:coordinate-render-request', (event) => {
                const { componentId, element, targetContainer, options } = event.detail;
                this.renderComponent(componentId, element, targetContainer, options);
            });
            
            // Listen for removal requests
            document.addEventListener('gmkb:coordinate-remove-request', (event) => {
                const { componentId } = event.detail;
                this.removeComponent(componentId);
            });
            
            // Listen for reorder requests
            document.addEventListener('gmkb:coordinate-reorder-request', (event) => {
                const { layout } = event.detail;
                this.reorderComponents(layout);
            });
            
            this.logger.debug('DOM_COORDINATOR', 'Event listeners setup complete');
        }
        
        /**
         * Get coordinator status
         */
        getStatus() {
            return {
                isInitialized: this.isInitialized,
                renderingInProgress: this.renderingInProgress,
                domRegistrySize: this.domRegistry.size,
                renderStats: { ...this.renderStats },
                renderingMode: this.renderingMode,
                preventDuplicates: this.preventDuplicates
            };
        }
        
        /**
         * Debug coordinator state
         */
        debug() {
            console.group('%c🎯 DOM Render Coordinator Debug', 'font-size: 14px; font-weight: bold; color: #e74c3c');
            
            console.log('Coordinator Status:', this.getStatus());
            console.log('DOM Analysis:', this.analyzeDOMState());
            
            // Show registry vs DOM comparison
            console.log('Registry vs DOM:');
            this.domRegistry.forEach((element, componentId) => {
                const inDOM = element.parentNode ? 'YES' : 'NO';
                const duplicates = document.querySelectorAll(`[data-component-id="${componentId}"]`).length;
                console.log(`  ${componentId}: InDOM=${inDOM}, Duplicates=${duplicates}`);
            });
            
            console.groupEnd();
        }
    }

    // Create and expose DOM Render Coordinator globally
    const domRenderCoordinator = new DOMRenderCoordinator();
    
    // WordPress-compatible global exposure
    window.domRenderCoordinator = domRenderCoordinator;
    window.DOMRenderCoordinator = DOMRenderCoordinator;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            domRenderCoordinator.init();
        });
    } else {
        domRenderCoordinator.init();
    }
    
    // Global debug functions
    window.debugDOMCoordinator = () => domRenderCoordinator.debug();
    window.analyzeDOMState = () => domRenderCoordinator.analyzeDOMState();
    window.forceCleanupDuplicates = () => domRenderCoordinator.forceCleanupAllDuplicates();
    
    structuredLogger.info('DOM_COORDINATOR', '✅ DOM Render Coordinator loaded - preventing component duplication');
    
})();
