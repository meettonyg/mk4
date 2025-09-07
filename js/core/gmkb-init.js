/**
 * Consolidated GMKB Core Initialization
 * Combines: gmkb.js, debug-control.js, disable-legacy-controls.js
 * 
 * ROOT FIX: Single file for all core initialization to reduce script count
 * Follows project checklist: No polling, event-driven, simplified code
 * 
 * @version 3.0.0-consolidated
 * @package GMKB
 */

(function() {
    'use strict';
    
    // ============================================
    // PART 1: Debug Control System
    // ============================================
    
    // Check URL parameters for debug flags
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');
    const debugCategories = urlParams.get('debug_categories');
    
    // Check localStorage for persistent debug settings
    const storedDebugSettings = localStorage.getItem('GMKBDebugSettings');
    const savedSettings = storedDebugSettings ? JSON.parse(storedDebugSettings) : {};
    
    /**
     * Global Debug Control System
     */
    window.GMKBDebug = {
        // Master switch
        enabled: debugParam === 'true' || savedSettings.enabled || false,
        
        // Category-specific switches
        categories: {
            hover: false,       // Component hover events (very noisy)
            init: false,        // Initialization success messages
            render: true,       // Render operations (important)
            state: true,        // State changes (important)
            controls: true,     // Control actions (important)
            component: true,    // Component operations (important)
            error: true,        // Errors (always show)
            perf: false,        // Performance metrics
            loader: false,      // Template loader operations
            save: true,         // Save operations (important)
            ...savedSettings.categories // Override with saved settings
        },
        
        // Log function with category filtering
        log: function(category, ...args) {
            if (category === 'error') {
                console.error(...args);
                return;
            }
            if (this.enabled || this.categories[category]) {
                console.log(...args);
            }
        },
        
        // Convenience methods
        logHover: function(...args) { this.log('hover', ...args); },
        logInit: function(...args) { this.log('init', ...args); },
        logRender: function(...args) { this.log('render', ...args); },
        logState: function(...args) { this.log('state', ...args); },
        logError: function(...args) { this.log('error', ...args); },
        
        // Enable/disable debug mode
        enable: function(categories = null) {
            this.enabled = true;
            if (categories) {
                categories.forEach(cat => {
                    if (this.categories.hasOwnProperty(cat)) {
                        this.categories[cat] = true;
                    }
                });
            }
            this.saveSettings();
            console.log('🐛 GMKB Debug enabled');
        },
        
        disable: function() {
            this.enabled = false;
            this.saveSettings();
            console.log('🐛 GMKB Debug disabled');
        },
        
        // Enable specific categories
        enableCategory: function(category) {
            if (this.categories.hasOwnProperty(category)) {
                this.categories[category] = true;
                this.saveSettings();
                console.log(`🐛 GMKB Debug category enabled: ${category}`);
            }
        },
        
        disableCategory: function(category) {
            if (this.categories.hasOwnProperty(category)) {
                this.categories[category] = false;
                this.saveSettings();
                console.log(`🐛 GMKB Debug category disabled: ${category}`);
            }
        },
        
        // Save settings to localStorage
        saveSettings: function() {
            const settings = {
                enabled: this.enabled,
                categories: this.categories
            };
            localStorage.setItem('GMKBDebugSettings', JSON.stringify(settings));
        },
        
        // Clear all debug settings
        reset: function() {
            localStorage.removeItem('GMKBDebugSettings');
            this.enabled = false;
            Object.keys(this.categories).forEach(cat => {
                this.categories[cat] = ['error', 'render', 'state', 'controls', 'component', 'save'].includes(cat);
            });
            console.log('🐛 GMKB Debug settings reset to defaults');
        },
        
        // Show current status
        status: function() {
            console.group('🐛 GMKB Debug Status');
            console.log('Master switch:', this.enabled ? 'ON' : 'OFF');
            console.log('Categories:');
            console.table(this.categories);
            console.log('\nUsage:');
            console.log('- Enable all: GMKBDebug.enable()');
            console.log('- Enable specific: GMKBDebug.enableCategory("hover")');
            console.log('- Disable all: GMKBDebug.disable()');
            console.log('- Reset to defaults: GMKBDebug.reset()');
            console.groupEnd();
        }
    };
    
    // Parse URL debug categories if provided
    if (debugCategories) {
        const cats = debugCategories.split(',');
        cats.forEach(cat => {
            if (GMKBDebug.categories.hasOwnProperty(cat)) {
                GMKBDebug.categories[cat] = true;
            }
        });
    }
    

    
    // ============================================
    // PART 2: GMKB Global Namespace & Event Bus
    // ============================================
    
    /**
     * The Global Namespace
     * Simple, clean, and protected from modification after setup
     */
    const GMKB = {
        systems: {},
        globalActionListenersSetup: false,
        
        // Use the browser's native event system
        dispatch(eventName, detail) {
            const event = new CustomEvent(eventName, { detail });
            document.dispatchEvent(event);
            if (GMKBDebug.categories.component) {
                console.debug(`📢 GMKB: Dispatched '${eventName}'`, detail);
            }
        },
        
        subscribe(eventName, callback) {
            document.addEventListener(eventName, callback);
            if (GMKBDebug.categories.component) {
                console.debug(`📡 GMKB: Subscribed to '${eventName}'`);
            }
        },
        
        /**
         * Initialize global action listeners
         */
        initializeGlobalActionListeners() {
            if (this.globalActionListenersSetup) {
                GMKBDebug.logInit('ℹ️ GMKB: Global action listeners already initialized');
                return;
            }
            
            GMKBDebug.logInit('🚀 GMKB: Initializing global component action listeners...');
            
            // Global event handlers for ALL components
            const globalHandlers = {
                'gmkb:component-edit-requested': (event) => {
                    const componentId = event.detail.componentId;
                    GMKBDebug.log('component', `📋 GLOBAL: Edit requested for ${componentId}`);
                    this.handleEditComponent(componentId);
                },
                
                'gmkb:component-move-up-requested': (event) => {
                    const componentId = event.detail.componentId;
                    GMKBDebug.log('component', `⬆️ GLOBAL: Move up requested for ${componentId}`);
                    this.handleMoveComponent(componentId, 'up');
                },
                
                'gmkb:component-move-down-requested': (event) => {
                    const componentId = event.detail.componentId;
                    GMKBDebug.log('component', `⬇️ GLOBAL: Move down requested for ${componentId}`);
                    this.handleMoveComponent(componentId, 'down');
                },
                
                'gmkb:component-duplicate-requested': (event) => {
                    const componentId = event.detail.componentId;
                    GMKBDebug.log('component', `📋 GLOBAL: Duplicate requested for ${componentId}`);
                    this.handleDuplicateComponentEnhanced(componentId);
                },
                
                'gmkb:component-delete-requested': (event) => {
                    const componentId = event.detail.componentId;
                    GMKBDebug.log('component', `🗑️ GLOBAL: Delete requested for ${componentId}`);
                    this.handleDeleteComponent(componentId);
                }
            };
            
            // Subscribe to all events globally
            Object.entries(globalHandlers).forEach(([eventName, handler]) => {
                this.subscribe(eventName, handler);
            });
            
            this.globalActionListenersSetup = true;
            GMKBDebug.logInit('✅ GMKB: Global component action listeners initialized successfully');
        },
        
        /**
         * Handle edit component action
         */
        handleEditComponent(componentId) {
            GMKBDebug.log('component', `🎨 Opening editor for component: ${componentId}`);
            
            const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (!componentElement) {
                GMKBDebug.logError(`Component element not found: ${componentId}`);
                return;
            }
            
            // ROOT FIX: Check if Phase 2 Component Options UI is available
            // Check both direct window references and GMKB.phase2
            const phase2Available = (window.componentSelectionManager && window.componentOptionsUI) || 
                                  (GMKB.phase2?.available && GMKB.phase2?.componentOptionsUI);
            
            console.log('🔍 PHASE 2 CHECK:', {
                directSelectionManager: !!window.componentSelectionManager,
                directOptionsUI: !!window.componentOptionsUI,
                gmkbPhase2: !!GMKB.phase2?.available,
                phase2Available: phase2Available
            });
            
            if (phase2Available) {
                const optionsUI = window.componentOptionsUI || GMKB.phase2?.componentOptionsUI;
                const selectionManager = window.componentSelectionManager || GMKB.phase2?.componentSelectionManager;
                console.log('🚀 PHASE 2: Using Component Options UI for', componentId);
                
                // Get component type
                const componentType = componentElement.dataset.componentType || 
                    componentElement.className.match(/gmkb-component--(\w+)/)?.[1];
                
                // Select component using Phase 2 system
                window.componentSelectionManager.selectComponentById(componentId);
                
                // Trigger Phase 2 Component Options UI
                document.dispatchEvent(new CustomEvent('gmkb:component-selected', {
                    detail: {
                        componentId,
                        componentType,
                        element: componentElement,
                        timestamp: Date.now()
                    }
                }));
                
                // Switch to Design tab
                const designTab = document.querySelector('[data-tab="design"]');
                if (designTab) {
                    designTab.click();
                }
                
                console.log(`✅ Phase 2 Component Options opened for ${componentId}`);
                return;
            }
            
            console.log('⚠️ PHASE 2: Not available, falling back to old system');
            
            // Fallback to old system if Phase 2 not available
            // For now, make the component directly editable
            const editableElements = componentElement.querySelectorAll('[contenteditable], input, textarea, select');
            if (editableElements.length > 0) {
                editableElements[0].focus();
                GMKBDebug.log('component', `✅ Focused first editable element in ${componentId}`);
            } else {
                // Add a simple edit indicator
                componentElement.style.outline = '2px solid #007cba';
                setTimeout(() => {
                    componentElement.style.outline = '';
                }, 2000);
                GMKBDebug.log('component', `✅ Highlighted component ${componentId} for editing`);
            }
        },
        
        /**
        * Handle move component action - Fixed for sections
        */
        handleMoveComponent(componentId, direction) {
        GMKBDebug.log('component', `📦 Moving component ${componentId} ${direction}`);
        
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!componentElement) {
        GMKBDebug.logError(`Component element not found: ${componentId}`);
        return;
        }
        
        // ROOT FIX: Check if component is in a section first
        const sectionContainer = componentElement.closest('.gmkb-section__content, .gmkb-section__column, .section-content');
        
        let container;
        let allComponents;
        
        if (sectionContainer) {
        // Component is in a section - get components within the same section column
        container = sectionContainer;
            allComponents = Array.from(container.querySelectorAll('[data-component-id]'));
            GMKBDebug.log('component', `Component is in section container: ${sectionContainer.className}`);
        } else {
            // Component is in main container
            container = componentElement.closest('#saved-components-container') ||
                          componentElement.closest('.saved-components-container') ||
                          componentElement.closest('#components-container') ||
                      componentElement.closest('.media-kit, #media-kit-preview');
        
            if (!container) {
                GMKBDebug.logError('Component container not found');
                return;
        }
        
        // Get all components in the same container (direct children only)
        allComponents = Array.from(container.querySelectorAll(':scope > [data-component-id]'));
        }
        
        const currentIndex = allComponents.indexOf(componentElement);
        
        if (currentIndex === -1) {
        GMKBDebug.logError('Component not found in container children');
        return;
        }
        
        if (direction === 'up' && currentIndex > 0) {
        const previousComponent = allComponents[currentIndex - 1];
        container.insertBefore(componentElement, previousComponent);
        GMKBDebug.log('component', `✅ Moved ${componentId} up`);
        
        if (window.enhancedStateManager) {
                window.enhancedStateManager.moveComponent(componentId, 'up');
        }
        } else if (direction === 'down' && currentIndex < allComponents.length - 1) {
            const nextComponent = allComponents[currentIndex + 1];
            if (nextComponent.nextSibling) {
                container.insertBefore(componentElement, nextComponent.nextSibling);
            } else {
                container.appendChild(componentElement);
        }
        GMKBDebug.log('component', `✅ Moved ${componentId} down`);
            
                if (window.enhancedStateManager) {
                        window.enhancedStateManager.moveComponent(componentId, 'down');
                    }
                } else {
                    GMKBDebug.log('component', `⚠️ Cannot move ${componentId} ${direction}`);
                }
                
                // Visual feedback
                componentElement.style.transform = 'scale(1.02)';
                componentElement.style.transition = 'transform 0.2s ease';
                setTimeout(() => {
                    componentElement.style.transform = '';
                    componentElement.style.transition = '';
                }, 200);
                
                // Trigger auto-save
                document.dispatchEvent(new CustomEvent('gmkb:state-changed', {
                    detail: { source: 'component-move', componentId }
                }));
            },
        
        /**
         * Enhanced duplicate handler
         */
        handleDuplicateComponentEnhanced(componentId) {
            GMKBDebug.log('component', `📄 GLOBAL: Duplicating component: ${componentId}`);
            
            const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (!componentElement) {
                GMKBDebug.logError(`Component element not found: ${componentId}`);
                return;
            }
            
            // Get component from state for proper duplication
            const state = window.GMKB?.systems?.StateManager?.getState?.() || 
                        window.enhancedStateManager?.getState();
            const component = state?.components?.[componentId];
            
            if (component) {
                // Use ComponentManager's duplicate method if available
                if (window.GMKB?.systems?.ComponentManager?.duplicateComponent) {
                    window.GMKB.systems.ComponentManager.duplicateComponent(componentId);
                } else if (window.enhancedComponentManager?.duplicateComponent) {
                    window.enhancedComponentManager.duplicateComponent(componentId);
                } else {
                    this.fallbackDuplicateComponent(componentElement, componentId);
                }
            } else {
                this.fallbackDuplicateComponent(componentElement, componentId);
            }
        },
        
        /**
         * Fallback duplicate method - Fixed for controls AND Phase 2 configuration
         */
        fallbackDuplicateComponent(componentElement, componentId) {
            GMKBDebug.log('component', `🔧 GLOBAL: Using fallback duplication for ${componentId}`);
            
            const newId = componentId + '-copy-' + Date.now();
            
            // ROOT FIX: Get original component data and configuration
            const state = window.enhancedStateManager?.getState();
            const originalComponent = state?.components?.[componentId];
            const componentType = componentElement.dataset.componentType || originalComponent?.type;
            
            if (!originalComponent) {
                GMKBDebug.logError(`Component data not found in state: ${componentId}`);
                return;
            }
            
            // Create new component data with Phase 2 configuration preserved
            const duplicatedData = {
                ...originalComponent,
                id: newId,
                duplicatedFrom: componentId,
                timestamp: Date.now()
            };
            
            // ROOT FIX: Add to state FIRST before DOM manipulation
            if (window.enhancedStateManager) {
                window.enhancedStateManager.dispatch({
                    type: 'ADD_COMPONENT',
                    payload: {
                        componentId: newId,
                        componentData: duplicatedData
                    }
                });
                GMKBDebug.log('component', `✅ Added duplicated component to state: ${newId}`);
            }
            
            // ROOT FIX: Duplicate Phase 2 configuration
            if (window.componentConfigurationManager && window.dataBindingEngine) {
                // Get the original configuration
                const originalConfig = window.componentConfigurationManager.getComponentConfiguration(componentId);
                
                if (originalConfig) {
                    // Register configuration for the new component
                    const newConfig = window.componentConfigurationManager.registerConfiguration(
                        newId, 
                        componentType,
                        {
                            ...originalConfig.componentOptions,
                            duplicatedFrom: componentId
                        }
                    );
                    
                    // Bind data using the configuration
                    const sourceData = duplicatedData.props || duplicatedData.data || {};
                    window.dataBindingEngine.bindComponentData(
                        newId,
                        componentType,
                        newConfig.dataBindings,
                        sourceData
                    );
                    
                    GMKBDebug.log('component', `✅ Phase 2 configuration duplicated for ${newId}`);
                }
            }
            
            // Let the renderer handle the actual DOM creation
            // This ensures Phase 2 configuration is used
            if (window.enhancedComponentRenderer) {
                // The state change will trigger the renderer to add the component
                GMKBDebug.log('component', `✅ Component renderer will handle DOM for ${newId}`);
            } else {
                // Fallback: Clone DOM element if renderer not available
                const duplicatedElement = componentElement.cloneNode(true);
                duplicatedElement.setAttribute('data-component-id', newId);
                duplicatedElement.id = newId;
                
                // Remove ALL existing controls from the cloned element
                const existingControls = duplicatedElement.querySelectorAll('.element-controls, .component-controls, .control-btn, [class*="control-toolbar"]');
                existingControls.forEach(control => {
                    control.remove();
                });
                
                componentElement.parentNode.insertBefore(duplicatedElement, componentElement.nextSibling);
                
                // Visual feedback
                duplicatedElement.style.opacity = '0.5';
                duplicatedElement.style.transform = 'scale(0.95)';
                duplicatedElement.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    duplicatedElement.style.opacity = '1';
                    duplicatedElement.style.transform = 'scale(1)';
                    
                    // Attach fresh controls to the new component
                    if (window.componentControlsManager) {
                        window.componentControlsManager.attachControls(duplicatedElement, newId);
                        GMKBDebug.log('component', `✅ Attached fresh controls to duplicated component: ${newId}`);
                    }
                }, 100);
            }
            
            // Dispatch duplication complete event
            document.dispatchEvent(new CustomEvent('gmkb:component-duplicated', {
                detail: {
                    originalId: componentId,
                    newId: newId,
                    componentData: duplicatedData,
                    phase2: true
                }
            }));
            
            // Trigger auto-save
            document.dispatchEvent(new CustomEvent('gmkb:state-changed', {
                detail: { source: 'component-duplicate', componentId: newId }
            }));
            
            GMKBDebug.log('component', `✅ GLOBAL: Fallback duplication complete with Phase 2: ${componentId} → ${newId}`);
        },
        

        
        /**
         * Handle delete component action
         */
        handleDeleteComponent(componentId) {
            GMKBDebug.log('component', `🗑️ Deleting component: ${componentId}`);
            
            if (!confirm(`Are you sure you want to delete this component?`)) {
                GMKBDebug.log('component', 'Delete cancelled by user');
                return;
            }
            
            const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (!componentElement) {
                GMKBDebug.logError(`Component element not found: ${componentId}`);
                return;
            }
            
            // ROOT FIX: Remove from state FIRST before DOM manipulation
            // This ensures save operations get the correct state
            if (window.enhancedStateManager) {
                window.enhancedStateManager.removeComponent(componentId);
                GMKBDebug.log('component', `✅ Removed ${componentId} from state`);
            }
            
            // Also remove from component manager if available
            if (window.enhancedComponentManager && window.enhancedComponentManager.removeComponent) {
                try {
                    window.enhancedComponentManager.removeComponent(componentId);
                    GMKBDebug.log('component', `✅ Removed ${componentId} from component manager`);
                } catch (error) {
                    GMKBDebug.logError(`Failed to remove from component manager: ${error.message}`);
                }
            }
            
            // Visual feedback before deletion
            componentElement.style.opacity = '0.5';
            componentElement.style.transform = 'scale(0.9)';
            componentElement.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                componentElement.remove();
                GMKBDebug.log('component', `✅ Deleted component ${componentId} from DOM`);
                
                // Check if we need to show empty state
                const container = document.querySelector('.media-kit, #media-kit-preview');
                const remainingComponents = container?.querySelectorAll('[data-component-id]');
                
                if (!remainingComponents || remainingComponents.length === 0) {
                    const emptyState = document.getElementById('empty-state');
                    if (emptyState) {
                        emptyState.style.display = 'block';
                        GMKBDebug.log('component', '✅ Showing empty state - no components remaining');
                    }
                }
                
                // ROOT FIX: Dispatch component deleted event AFTER state update
                // This ensures any auto-save triggered will have the correct state
                document.dispatchEvent(new CustomEvent('gmkb:component-deleted', {
                    detail: {
                        componentId,
                        timestamp: Date.now()
                    }
                }));
                
                // Also trigger state changed event for auto-save
                document.dispatchEvent(new CustomEvent('gmkb:state-changed', {
                    detail: { 
                        source: 'component-delete', 
                        componentId,
                        action: 'delete'
                    }
                }));
            }, 300);
        },
        
        /**
         * Request control attachment via event system
         */
        requestControlAttachment(componentElement, componentId) {
            this.dispatch('gmkb:attach-controls-requested', {
                componentElement,
                componentId,
                timestamp: Date.now(),
                source: 'GMKB'
            });
        },
        
        /**
         * Attach controls immediately when ComponentControlsManager is available
         */
        attachControlsImmediately(componentElement, componentId) {
            const success = window.componentControlsManager?.attachControls(componentElement, componentId);
            if (success) {
                GMKBDebug.log('controls', `✅ GMKB: Dynamic controls attached to ${componentId}`);
            } else {
                GMKBDebug.log('controls', `⚠️ GMKB: Failed to attach dynamic controls to ${componentId}`);
                this.requestControlAttachment(componentElement, componentId);
            }
        },
        
        // Simple debugging helper
        getStatus() {
            return {
                systems: Object.keys(this.systems),
                wordPressData: !!window.gmkbData,
                architecture: 'consolidated-init',
                timestamp: Date.now(),
                debug: GMKBDebug.enabled
            };
        }
    };
    
    // PART 3: Legacy controls removed - no longer needed
    
    // ============================================
    // PART 4: Initialize and Export
    // ============================================
    
    // Make GMKB available globally
    window.GMKB = GMKB;
    
    // ROOT FIX: Track Phase 2 availability
    let phase2Available = false;
    
    // Listen for Phase 2 ready event
    document.addEventListener('gmkb:phase2-ready', (event) => {
        phase2Available = true;
        console.log('✅ GMKB: Phase 2 Component Options UI detected and available');
        
        // Store references for easy access
        if (event.detail) {
            GMKB.phase2 = {
                componentOptionsUI: event.detail.componentOptionsUI,
                componentSelectionManager: event.detail.componentSelectionManager,
                available: true
            };
        }
    });
    
    // Initialize global action listeners when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            GMKB.initializeGlobalActionListeners();
        });
    } else {
        // DOM already loaded, initialize immediately
        GMKB.initializeGlobalActionListeners();
    }
    
    // Log initial status if debug is enabled
    if (GMKBDebug.enabled) {
        console.log('🐛 GMKB Debug Control initialized');
        GMKBDebug.status();
    }
    
    console.log('✅ Consolidated GMKB Core: Initialized (combines gmkb.js + debug-control.js + disable-legacy-controls.js)');
    
})();
