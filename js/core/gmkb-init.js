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
            console.log('🔍 PHASE 2 CHECK:', {
                componentSelectionManager: !!window.componentSelectionManager,
                componentOptionsUI: !!window.componentOptionsUI,
                ComponentSelectionManager: !!window.ComponentSelectionManager,
                ComponentOptionsUI: !!window.ComponentOptionsUI
            });
            
            if (window.componentSelectionManager && window.componentOptionsUI) {
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
         * Handle move component action
         */
        handleMoveComponent(componentId, direction) {
            GMKBDebug.log('component', `📦 Moving component ${componentId} ${direction}`);
            
            const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (!componentElement) {
                GMKBDebug.logError(`Component element not found: ${componentId}`);
                return;
            }
            
            // Find the actual container
            let container = componentElement.closest('#saved-components-container') ||
                          componentElement.closest('.saved-components-container') ||
                          componentElement.closest('#components-container') ||
                          componentElement.closest('.media-kit, #media-kit-preview');
            
            if (!container) {
                GMKBDebug.logError('Component container not found');
                return;
            }
            
            // Get all components in the same container
            const allComponents = Array.from(container.querySelectorAll(':scope > [data-component-id]'));
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
         * Fallback duplicate method
         */
        fallbackDuplicateComponent(componentElement, componentId) {
            GMKBDebug.log('component', `🔧 GLOBAL: Using fallback duplication for ${componentId}`);
            
            const duplicatedElement = componentElement.cloneNode(true);
            const newId = componentId + '-copy-' + Date.now();
            duplicatedElement.setAttribute('data-component-id', newId);
            
            const elementsWithId = duplicatedElement.querySelectorAll('[id]');
            elementsWithId.forEach(el => {
                el.id = el.id + '-copy-' + Date.now();
            });
            
            componentElement.parentNode.insertBefore(duplicatedElement, componentElement.nextSibling);
            
            // Visual feedback
            duplicatedElement.style.opacity = '0.5';
            duplicatedElement.style.transform = 'scale(0.95)';
            duplicatedElement.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                duplicatedElement.style.opacity = '1';
                duplicatedElement.style.transform = 'scale(1)';
                
                if (window.componentControlsManager) {
                    window.componentControlsManager.attachControls(duplicatedElement, newId);
                }
                
                GMKBDebug.log('component', `✅ GLOBAL: Fallback duplication complete: ${componentId} → ${newId}`);
            }, 100);
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
            
            // Visual feedback before deletion
            componentElement.style.opacity = '0.5';
            componentElement.style.transform = 'scale(0.9)';
            componentElement.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                componentElement.remove();
                GMKBDebug.log('component', `✅ Deleted component ${componentId}`);
                
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
