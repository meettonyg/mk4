/**
 * @file component-state-manager.js
 * @description Component State Management Service
 * Handles state diffing, validation, hashing, and comparison operations
 * 
 * ROOT FIX: Extracted from enhanced-component-renderer.js for better maintainability
 * Following checklist: Event-Driven, Simplicity First, Code Reduction
 */

(function() {
    'use strict';
    
    // ✅ CHECKLIST COMPLIANT: Pure event-driven initialization  
    const initWhenReady = () => {
        // Check if structured logger is already available
        if (window.structuredLogger) {
            initializeStateManager();
            return;
        }
        
        // ✅ NO POLLING: Listen for logger ready event only
        document.addEventListener('gmkb:structured-logger-ready', () => {
            if (window.structuredLogger) {
                initializeStateManager();
            }
        }, { once: true });
        
        // ✅ EVENT-DRIVEN: Fallback to core systems ready
        document.addEventListener('gmkb:core-systems-ready', () => {
            if (window.structuredLogger) {
                initializeStateManager();
            } else {
                console.error('❌ ComponentStateManager: Logger not available even after core systems ready');
            }
        }, { once: true });
    };
    
    const initializeStateManager = () => {
        // ✅ ROOT CAUSE FIX: Dependencies guaranteed to be available
        const structuredLogger = window.structuredLogger;
        const eventBus = window.eventBus || {
            emit: () => {},
            on: () => {},
            off: () => {}
        };
        
        if (!structuredLogger) {
            console.error('❌ CRITICAL: StructuredLogger not available in ComponentStateManager');
            return;
        }
        
        structuredLogger.info('STATE', 'ComponentStateManager initializing with event-driven architecture...');

        class ComponentStateManager {
            constructor() {
                this.logger = structuredLogger;
                this.lastStateHash = null;
                this.lastState = null;
            }

            /**
             * Generate a hash of the state for duplicate render prevention
             */
            generateStateHash(state) {
                try {
                    if (!state || !state.components) {
                        return 'empty-state';
                    }
                    
                    // Create a simplified hash from component IDs and their types
                    const componentData = Object.entries(state.components || {})
                        .map(([id, data]) => `${id}:${data.type}:${JSON.stringify(data.props || {})}`)
                        .sort()
                        .join('|');
                    
                    const layoutData = Array.isArray(state.layout) ? state.layout.join(',') : '';
                    
                    return `${componentData}#${layoutData}`;
                } catch (error) {
                    this.logger.warn('STATE', 'Failed to generate state hash:', error);
                    return Date.now().toString(); // Fallback to timestamp
                }
            }

            /**
             * Validate and normalize state object to prevent undefined errors
             */
            validateAndNormalizeState(state) {
                if (!state || typeof state !== 'object') {
                    return {
                        hasComponents: false,
                        components: {},
                        componentKeys: [],
                        layout: []
                    };
                }
                
                const components = state.components && typeof state.components === 'object' ? state.components : {};
                const componentKeys = Object.keys(components);
                const layout = Array.isArray(state.layout) ? state.layout : [];
                
                return {
                    hasComponents: componentKeys.length > 0,
                    components,
                    componentKeys,
                    layout
                };
            }

            /**
             * Validate and normalize layout array
             */
            validateAndNormalizeLayout(layout) {
                if (!Array.isArray(layout)) {
                    // Try to get layout from state manager as fallback
                    try {
                        const enhancedStateManager = window.enhancedStateManager;
                        const fallbackLayout = enhancedStateManager?.getLayout ? enhancedStateManager.getLayout() : [];
                        return Array.isArray(fallbackLayout) ? fallbackLayout : [];
                    } catch (error) {
                        this.logger.warn('STATE', 'Failed to get fallback layout:', error);
                        return [];
                    }
                }
                
                // Filter out any non-string values from layout
                return layout.filter(item => typeof item === 'string' && item.length > 0);
            }

            /**
             * Comprehensive state diffing with enhanced null safety
             */
            diffState(oldState, newState) {
                const changes = {
                    added: new Set(),
                    removed: new Set(),
                    updated: new Set(),
                    moved: new Set()
                };

                try {
                    // Validate and normalize states
                    const safeOldState = this.validateAndNormalizeState(oldState);
                    const safeNewState = this.validateAndNormalizeState(newState);
                    
                    // If both states are empty, no changes
                    if (!safeOldState.hasComponents && !safeNewState.hasComponents) {
                        this.logger.debug('STATE', 'diffState: Both states empty, no changes');
                        return changes;
                    }
                    
                    // If no old state, all components in new state are additions
                    if (!safeOldState.hasComponents && safeNewState.hasComponents) {
                        safeNewState.componentKeys.forEach(id => changes.added.add(id));
                        this.logger.debug('STATE', `diffState: No old state, ${changes.added.size} additions`);
                        return changes;
                    }
                    
                    // If no new state, all components in old state are removals
                    if (safeOldState.hasComponents && !safeNewState.hasComponents) {
                        safeOldState.componentKeys.forEach(id => changes.removed.add(id));
                        this.logger.debug('STATE', `diffState: No new state, ${changes.removed.size} removals`);
                        return changes;
                    }
                    
                    // Both states have components, perform detailed diff
                    const oldKeys = new Set(safeOldState.componentKeys);
                    const newKeys = new Set(safeNewState.componentKeys);

                    // Find additions
                    newKeys.forEach(key => {
                        if (!oldKeys.has(key)) {
                            changes.added.add(key);
                        }
                    });

                    // Find removals
                    oldKeys.forEach(key => {
                        if (!newKeys.has(key)) {
                            changes.removed.add(key);
                        }
                    });

                    // Find updates (components that exist in both but have changed)
                    newKeys.forEach(key => {
                        if (oldKeys.has(key)) {
                            try {
                                const oldComponent = safeOldState.components[key];
                                const newComponent = safeNewState.components[key];
                                
                                if (oldComponent && newComponent && 
                                    JSON.stringify(oldComponent) !== JSON.stringify(newComponent)) {
                                    changes.updated.add(key);
                                }
                            } catch (error) {
                                this.logger.warn('STATE', `Error comparing component ${key}:`, error);
                                // Treat as update if comparison fails
                                changes.updated.add(key);
                            }
                        }
                    });

                    // Proper move detection by comparing old and new layouts
                    const oldLayout = safeOldState.layout || [];
                    const newLayout = safeNewState.layout || [];
                    
                    // Check if components just moved positions
                    if (oldLayout.length === newLayout.length && oldLayout.length > 0) {
                        const oldPositions = {};
                        const newPositions = {};
                        
                        oldLayout.forEach((id, index) => oldPositions[id] = index);
                        newLayout.forEach((id, index) => newPositions[id] = index);
                        
                        Object.keys(oldPositions).forEach(id => {
                            if (newPositions[id] !== undefined && 
                                oldPositions[id] !== newPositions[id] &&
                                !changes.added.has(id) && 
                                !changes.removed.has(id) &&
                                !changes.updated.has(id)) {
                                changes.moved.add(id);
                            }
                        });
                    }
                    
                    this.logger.debug('STATE', 'diffState completed:', {
                        added: changes.added.size,
                        removed: changes.removed.size,
                        updated: changes.updated.size,
                        moved: changes.moved.size
                    });
                    
                    return changes;
                    
                } catch (error) {
                    this.logger.error('STATE', 'Critical error in diffState:', error);
                    // Return empty changes to prevent cascading failures
                    return {
                        added: new Set(),
                        removed: new Set(),
                        updated: new Set(),
                        moved: new Set()
                    };
                }
            }

            /**
             * Detect render type based on changes
             */
            detectRenderType(changes) {
                if (changes.moved.size > 0 && 
                    changes.added.size === 0 && 
                    changes.removed.size === 0 && 
                    changes.updated.size === 0) {
                    return 'reorder-only';
                }
                if (changes.added.size > 0) return 'add-components';
                if (changes.removed.size > 0) return 'remove-components';
                if (changes.updated.size > 0) return 'update-components';
                return 'full-render';
            }

            /**
             * Clone state object safely
             */
            cloneState(state) {
                return state ? JSON.parse(JSON.stringify(state)) : null;
            }

            /**
             * Check if state has actually changed
             */
            hasStateChanged(newState) {
                const newHash = this.generateStateHash(newState);
                const hasChanged = this.lastStateHash !== newHash;
                
                if (hasChanged) {
                    this.lastStateHash = newHash;
                    this.lastState = this.cloneState(newState);
                }
                
                return hasChanged;
            }

            /**
             * Update internal state tracking
             */
            updateLastState(state) {
                this.lastState = this.cloneState(state);
                this.lastStateHash = this.generateStateHash(state);
            }

            /**
             * Get last processed state
             */
            getLastState() {
                return this.lastState;
            }

            /**
             * Get current state hash
             */
            getLastStateHash() {
                return this.lastStateHash;
            }

            /**
             * Reset state tracking (for initialization)
             */
            resetStateTracking() {
                this.lastState = null;
                this.lastStateHash = null;
                this.logger.debug('STATE', 'State tracking reset');
            }
            
            /**
             * Get component state manager statistics
             */
            getStats() {
                return {
                    lastStateHash: this.lastStateHash,
                    hasLastState: !!this.lastState,
                    lastStateComponentCount: this.lastState && this.lastState.components ? Object.keys(this.lastState.components).length : 0
                };
            }
        }

        // Export to global scope for WordPress compatibility
        window.ComponentStateManager = ComponentStateManager;
        
        // Create singleton instance
        if (!window.componentStateManager) {
            window.componentStateManager = new ComponentStateManager();
        }

        // Emit ready event
        document.dispatchEvent(new CustomEvent('gmkb:component-state-manager-ready', {
            detail: { 
                manager: window.componentStateManager,
                timestamp: Date.now()
            }
        }));
        
        structuredLogger.info('STATE', 'ComponentStateManager ready and event emitted');
    };
    
    // ✅ EVENT-DRIVEN: Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    } else {
        initWhenReady();
    }
    
})();