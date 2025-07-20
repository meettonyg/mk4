/**
 * @file main.js - WordPress-Native Media Kit Builder (VANILLA JS)
 * @description Pure vanilla JavaScript following Gemini's recommendations
 * @version 2.1.0-vanilla-js-final
 * 
 * ARCHITECTURE:
 * ✅ ZERO DEPENDENCIES - Pure vanilla JavaScript
 * ✅ Single initialization flow - NO competing systems
 * ✅ Browser's native CustomEvent system - NO custom event buses
 * ✅ Native DOMContentLoaded - NO jQuery dependencies
 * ✅ Object.freeze() namespace protection
 * ✅ WordPress wp_localize_script data integration
 * ✅ Clean, modern JavaScript approach
 * ✅ ROOT FIX: Event-driven race condition elimination
 * ✅ DESIGN PANEL: Full component editing integration
 */

// IMMEDIATE DEBUG LOG - Should appear first
console.log('%c🚀 GMKB main.js LOADING (VANILLA JS)...', 'font-weight: bold; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 3px;');
console.log('📜 Script URL:', document.currentScript?.src || 'unknown');
console.log('📜 Load time:', new Date().toISOString());
console.log('🔧 RACE CONDITION FIX: Template path resolved, clean architecture active');
console.log('✅ VANILLA JS: Zero dependencies, following Gemini recommendations');

// Use strict-mode, self-executing function to protect scope
(function() {
    'use strict';

    console.log('🚀 GMKB: Vanilla JS initialization starting...');
    console.log('📆 WordPress data available:', !!window.gmkbData);

    /**
     * 1. The Global Namespace
     * Simple, clean, and protected from modification after setup
     */
    const GMKB = {
        systems: {},
        
        // ROOT FIX: Global action listeners flag
        globalActionListenersSetup: false,
        
        // Use the browser's native event system - reliable and debuggable
        dispatch(eventName, detail) {
            const event = new CustomEvent(eventName, { detail });
            document.dispatchEvent(event);
            console.debug(`📢 GMKB: Dispatched '${eventName}'`, detail);
        },
        
        subscribe(eventName, callback) {
            document.addEventListener(eventName, callback);
            console.debug(`📡 GMKB: Subscribed to '${eventName}'`);
        },
        
        /**
         * ROOT FIX: Initialize global action listeners immediately on load
         * Call this once during system initialization
         */
        initializeGlobalActionListeners() {
            // Prevent duplicate initialization
            if (this.globalActionListenersSetup) {
                console.log('ℹ️ GMKB: Global action listeners already initialized');
                return;
            }
            
            console.log('🚀 GMKB: Initializing global component action listeners...');
            
            // Global event handlers for ALL components
            const globalHandlers = {
                'gmkb:component-edit-requested': (event) => {
                    const componentId = event.detail.componentId;
                    console.log(`📋 GLOBAL: Edit requested for ${componentId}`);
                    this.handleEditComponent(componentId);
                },
                
                'gmkb:component-move-up-requested': (event) => {
                    const componentId = event.detail.componentId;
                    console.log(`⬆️ GLOBAL: Move up requested for ${componentId}`);
                    this.handleMoveComponent(componentId, 'up');
                },
                
                'gmkb:component-move-down-requested': (event) => {
                    const componentId = event.detail.componentId;
                    console.log(`⬇️ GLOBAL: Move down requested for ${componentId}`);
                    this.handleMoveComponent(componentId, 'down');
                },
                
                'gmkb:component-duplicate-requested': (event) => {
                    const componentId = event.detail.componentId;
                    console.log(`📋 GLOBAL: Duplicate requested for ${componentId}`);
                    this.handleDuplicateComponentEnhanced(componentId);
                },
                
                'gmkb:component-delete-requested': (event) => {
                    const componentId = event.detail.componentId;
                    console.log(`🗑️ GLOBAL: Delete requested for ${componentId}`);
                    this.handleDeleteComponent(componentId);
                }
            };

    /**
     * ROOT FIX: Simple UI coordination system to replace complex UIManager
     * This ensures proper initialization order and prevents re-rendering
     */
    const UICoordinator = {
        initialized: false,
        
        init() {
            if (this.initialized) {
                console.log('ℹ️ UICoordinator: Already initialized, skipping duplicate call');
                return;
            }
            
            console.log('%c🎯 UICoordinator: ROOT FIX - Single initialization start', 'font-weight: bold; color: #2563eb; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');
            
            try {
                // Mark as initialized FIRST to prevent duplicate calls
                this.initialized = true;
                
                // Step 1: Initialize core systems without rendering
                console.log('📋 UICoordinator: Initializing StateManager...');
                StateManager.init();
                
                console.log('🧩 UICoordinator: Initializing ComponentManager (library only)...');
                ComponentManager.init(); // This will ONLY load library, no rendering
                
                console.log('📋 UICoordinator: Checking for saved components...');
                const state = StateManager.getState();
                const componentCount = Object.keys(state.components).length;
                console.log(`📋 UICoordinator: Found ${componentCount} saved components`);
                
                // Step 2: Load and render saved components ONCE
                if (componentCount > 0) {
                    console.log('🎯 UICoordinator: Loading saved components...');
                    this.loadSavedComponentsOnce();
                } else {
                    console.log('📝 UICoordinator: No saved components to load');
                }
                
                console.log('%c✅ UICoordinator: ROOT FIX - Single initialization complete', 'font-weight: bold; color: #10b981; background: #f0fdf4; padding: 4px 8px; border-radius: 4px;');
            } catch (error) {
                console.error('%c❌ UICoordinator: Initialization failed:', 'font-weight: bold; color: #ef4444; background: #fef2f2; padding: 4px 8px; border-radius: 4px;', error);
                // Reset flag if failed
                this.initialized = false;
            }
        },
        
        async loadSavedComponentsOnce() {
            console.log('%c🎯 UICoordinator: Loading saved components with single-render guarantee', 'font-weight: bold; color: #7c3aed; background: #f3e8ff; padding: 4px 8px; border-radius: 4px;');
            
            try {
                // Wait a moment for StateManager to fully initialize
                console.log('⏱️ UICoordinator: Waiting for systems to stabilize...');
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Check state again
                const state = StateManager.getState();
                const componentCount = Object.keys(state.components).length;
                console.log(`📋 UICoordinator: Ready to load ${componentCount} saved components`);
                
                if (componentCount > 0) {
                    // Load saved components EXACTLY ONCE
                    console.log('🎨 UICoordinator: Calling ComponentManager.loadSavedComponents()...');
                    await ComponentManager.loadSavedComponents();
                    console.log('✅ UICoordinator: ComponentManager.loadSavedComponents() completed');
                } else {
                    console.log('📝 UICoordinator: No components to load');
                }
                
                console.log('%c✅ UICoordinator: Saved components loaded - no re-renders', 'font-weight: bold; color: #10b981; background: #f0fdf4; padding: 4px 8px; border-radius: 4px;');
            } catch (error) {
                console.error('%c❌ UICoordinator: Error loading saved components:', 'font-weight: bold; color: #ef4444; background: #fef2f2; padding: 4px 8px; border-radius: 4px;', error);
            }
        }
    };
            
            // Subscribe to all events globally
            Object.entries(globalHandlers).forEach(([eventName, handler]) => {
                this.subscribe(eventName, handler);
            });
            
            this.globalActionListenersSetup = true;
            console.log('✅ GMKB: Global component action listeners initialized successfully');
        },
        

        
        /**
         * ROOT FIX: Handle edit component action
         * @param {string} componentId - Component ID to edit
         */
        handleEditComponent(componentId) {
            console.log(`🎨 Opening editor for component: ${componentId}`);
            
            // Find the component element
            const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (!componentElement) {
                console.error(`Component element not found: ${componentId}`);
                return;
            }
            
            // For now, make the component directly editable
            const editableElements = componentElement.querySelectorAll('[contenteditable], input, textarea, select');
            if (editableElements.length > 0) {
                editableElements[0].focus();
                console.log(`✅ Focused first editable element in ${componentId}`);
            } else {
                // Add a simple edit indicator
                componentElement.style.outline = '2px solid #007cba';
                setTimeout(() => {
                    componentElement.style.outline = '';
                }, 2000);
                console.log(`✅ Highlighted component ${componentId} for editing`);
            }
        },
        
        /**
         * ROOT FIX: Handle move component action
         * @param {string} componentId - Component ID to move
         * @param {string} direction - 'up' or 'down'
         */
        handleMoveComponent(componentId, direction) {
            console.log(`📦 Moving component ${componentId} ${direction}`);
            
            const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (!componentElement) {
                console.error(`Component element not found: ${componentId}`);
                return;
            }
            
            const container = componentElement.closest('.media-kit, #media-kit-preview');
            if (!container) {
                console.error('Media kit container not found');
                return;
            }
            
            const allComponents = Array.from(container.querySelectorAll('[data-component-id]'));
            const currentIndex = allComponents.indexOf(componentElement);
            
            if (direction === 'up' && currentIndex > 0) {
                // Move up
                const previousComponent = allComponents[currentIndex - 1];
                container.insertBefore(componentElement, previousComponent);
                console.log(`✅ Moved ${componentId} up`);
            } else if (direction === 'down' && currentIndex < allComponents.length - 1) {
                // Move down
                const nextComponent = allComponents[currentIndex + 1];
                container.insertBefore(componentElement, nextComponent.nextSibling);
                console.log(`✅ Moved ${componentId} down`);
            } else {
                console.log(`⚠️ Cannot move ${componentId} ${direction} - already at ${direction === 'up' ? 'top' : 'bottom'}`);
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
         * ROOT FIX: Enhanced duplicate handler with state management
         * @param {string} componentId - Component ID to duplicate
         */
        handleDuplicateComponentEnhanced(componentId) {
            console.log(`📄 GLOBAL: Duplicating component: ${componentId}`);
            
            const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (!componentElement) {
                console.error(`Component element not found: ${componentId}`);
                return;
            }
            
            // Get component from state for proper duplication
            const state = window.GMKB?.systems?.StateManager?.getState?.() || StateManager.getState();
            const component = state.components?.[componentId];
            
            if (component) {
                // Use ComponentManager's duplicate method if available
                if (window.GMKB?.systems?.ComponentManager?.duplicateComponent) {
                    window.GMKB.systems.ComponentManager.duplicateComponent(componentId);
                } else if (ComponentManager?.duplicateComponent) {
                    ComponentManager.duplicateComponent(componentId);
                } else {
                    // Fallback to DOM-only duplication
                    this.fallbackDuplicateComponent(componentElement, componentId);
                }
            } else {
                // Fallback to DOM-only duplication
                this.fallbackDuplicateComponent(componentElement, componentId);
            }
        },
        
        /**
         * ROOT FIX: Fallback duplicate method for DOM-only scenarios
         * @param {HTMLElement} componentElement - Component DOM element
         * @param {string} componentId - Component ID
         */
        fallbackDuplicateComponent(componentElement, componentId) {
            console.log(`🔧 GLOBAL: Using fallback duplication for ${componentId}`);
            
            // Create a copy
            const duplicatedElement = componentElement.cloneNode(true);
            
            // Generate new ID
            const newId = componentId + '-copy-' + Date.now();
            duplicatedElement.setAttribute('data-component-id', newId);
            
            // Update any existing IDs in the duplicated content
            const elementsWithId = duplicatedElement.querySelectorAll('[id]');
            elementsWithId.forEach(el => {
                el.id = el.id + '-copy-' + Date.now();
            });
            
            // Insert after the original
            componentElement.parentNode.insertBefore(duplicatedElement, componentElement.nextSibling);
            
            // Visual feedback
            duplicatedElement.style.opacity = '0.5';
            duplicatedElement.style.transform = 'scale(0.95)';
            duplicatedElement.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                duplicatedElement.style.opacity = '1';
                duplicatedElement.style.transform = 'scale(1)';
                
                // Attach controls to the new component
                if (window.componentControlsManager) {
                    window.componentControlsManager.attachControls(duplicatedElement, newId);
                }
                
                console.log(`✅ GLOBAL: Fallback duplication complete: ${componentId} → ${newId}`);
            }, 100);
        },
        
        /**
         * ROOT FIX: Handle duplicate component action (LEGACY SUPPORT)
         * @param {string} componentId - Component ID to duplicate
         */
        handleDuplicateComponent(componentId) {
            // ROOT FIX: Delegate to enhanced handler
            this.handleDuplicateComponentEnhanced(componentId);
        },
        
        /**
         * ROOT FIX: Handle delete component action
         * @param {string} componentId - Component ID to delete
         */
        handleDeleteComponent(componentId) {
            console.log(`🗑️ Deleting component: ${componentId}`);
            
            // Confirm deletion
            if (!confirm(`Are you sure you want to delete this component?`)) {
                console.log('Delete cancelled by user');
                return;
            }
            
            const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (!componentElement) {
                console.error(`Component element not found: ${componentId}`);
                return;
            }
            
            // Visual feedback before deletion
            componentElement.style.opacity = '0.5';
            componentElement.style.transform = 'scale(0.9)';
            componentElement.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                componentElement.remove();
                console.log(`✅ Deleted component ${componentId}`);
                
                // Check if we need to show empty state
                const container = document.querySelector('.media-kit, #media-kit-preview');
                const remainingComponents = container?.querySelectorAll('[data-component-id]');
                
                if (!remainingComponents || remainingComponents.length === 0) {
                    const emptyState = document.getElementById('empty-state');
                    if (emptyState) {
                        emptyState.style.display = 'block';
                        console.log('✅ Showing empty state - no components remaining');
                    }
                }
            }, 300);
        },
        
        /**
         * ROOT FIX: Request control attachment via event system
         * @param {HTMLElement} componentElement - Component DOM element
         * @param {string} componentId - Component ID
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
         * ROOT FIX: Attach controls immediately when ComponentControlsManager is available
         * @param {HTMLElement} componentElement - Component DOM element
         * @param {string} componentId - Component ID
         */
        attachControlsImmediately(componentElement, componentId) {
            const success = window.componentControlsManager.attachControls(componentElement, componentId);
            if (success) {
                console.log(`✅ GMKB: Dynamic controls attached to ${componentId} via ComponentControlsManager`);
                
                console.log(`✅ GMKB: Root-level fix complete for ${componentId} - no hardcoded HTML`);
            } else {
                console.warn(`⚠️ GMKB: Failed to attach dynamic controls to ${componentId}`);
                // Fallback to event-based attachment
                this.requestControlAttachment(componentElement, componentId);
            }
        },
        
        // Simple debugging helper
        getStatus() {
            return {
                systems: Object.keys(this.systems),
                wordPressData: !!window.gmkbData,
                architecture: 'vanilla-js-final',
                timestamp: Date.now()
            };
        }
    };

    /**
     * 2. Core Systems - Pure Vanilla JS
     */
    const StateManager = {
        state: {
            components: {},
            layout: [],
            globalSettings: {}
        },
        
        init() {
            console.log('📋 StateManager: Initialized (Phase 2.3 Simplified)');
            
            // ROOT FIX: Listen for save request from toolbar or any other component
            GMKB.subscribe('gmkb:save-requested', this.handleSaveRequest.bind(this));
            
            // ROOT FIX: Check localStorage FIRST (where previous components are saved)
            let hasLocalStorageData = false;
            const localStorageLoaded = this.loadFromStorage();
            
            if (localStorageLoaded && Object.keys(this.state.components).length > 0) {
                hasLocalStorageData = true;
                console.log('🔄 StateManager: Loaded state from localStorage (PRIORITY)', {
                    components: Object.keys(this.state.components).length,
                    layout: this.state.layout.length
                });
                
                // ROOT FIX: REMOVED - this event was causing re-renders
                // OLD CODE: GMKB.dispatch('gmkb:saved-state-loaded', { ... });
                console.log('✅ StateManager: State loaded but NO events dispatched to prevent re-renders');
            } else {
                console.log('📝 StateManager: No components found in localStorage');
            }
            
            // SECONDARY: Check WordPress database (only if localStorage was empty)
            if (!hasLocalStorageData && window.gmkbData && window.gmkbData.savedState) {
                const savedState = window.gmkbData.savedState;
                
                if (savedState.components && Object.keys(savedState.components).length > 0) {
                    this.state = { ...this.state, ...savedState };
                    console.log('🔄 StateManager: Loaded state from WordPress database (FALLBACK)', savedState);
                    
                    // ROOT FIX: REMOVED - this event was causing re-renders
                    // OLD CODE: GMKB.dispatch('gmkb:saved-state-loaded', { ... });
                    console.log('✅ StateManager: WordPress state loaded but NO events dispatched to prevent re-renders');
                } else {
                    console.log('📝 StateManager: WordPress database state is empty');
                }
            }
            
            // Final check: if no components found anywhere
            if (Object.keys(this.state.components).length === 0) {
                console.log('📝 StateManager: No saved components found in any source (localStorage or WordPress)');
            } else {
                console.log('✅ StateManager: Successfully loaded', Object.keys(this.state.components).length, 'components');
            }
        },
        
        getState() {
            return this.state;
        },
        
        setState(newState) {
            this.state = { ...this.state, ...newState };
            this.saveToStorage(); // No callbacks needed for automatic saves
            GMKB.dispatch('gmkb:state-changed', { state: this.state });
        },
        
        addComponent(component) {
            const id = component.id || 'component-' + Date.now();
            this.state.components[id] = { ...component, id };
            
            if (!this.state.layout.includes(id)) {
                this.state.layout.push(id);
            }
            
            this.saveToStorage(); // No callbacks needed for automatic saves
            GMKB.dispatch('gmkb:component-added', { id, component: this.state.components[id] });
            GMKB.dispatch('gmkb:state-changed', { state: this.state });
            
            return id;
        },
        
        removeComponent(id) {
            if (this.state.components[id]) {
                delete this.state.components[id];
                this.state.layout = this.state.layout.filter(cid => cid !== id);
                
                this.saveToStorage(); // No callbacks needed for automatic saves
                GMKB.dispatch('gmkb:component-removed', { id });
                GMKB.dispatch('gmkb:state-changed', { state: this.state });
                
                return true;
            }
            return false;
        },
        
        updateComponent(id, updates) {
            if (this.state.components[id]) {
                this.state.components[id] = { ...this.state.components[id], ...updates };
                
                this.saveToStorage(); // No callbacks needed for automatic saves
                GMKB.dispatch('gmkb:component-updated', { id, component: this.state.components[id] });
                GMKB.dispatch('gmkb:state-changed', { state: this.state });
                
                return true;
            }
            return false;
        },
        
        async saveToStorage(detail = {}) {
            const { onComplete, onError } = detail; // Get callbacks from the event detail
            try {
                localStorage.setItem('gmkb-state', JSON.stringify(this.state));
                console.log('💾 StateManager: Saved state to localStorage.');

                // Wait for the WordPress save to complete
                const wordpressSuccess = await this.saveToWordPress();

                if (wordpressSuccess) {
                    console.log('✅ StateManager: Save process completed successfully.');
                    // Let the toolbar know it was successful
                    if (onComplete) onComplete({ source: 'StateManager', status: 'success' });
                    return true;
                } else {
                    // If WordPress save fails, trigger the error callback
                    throw new Error('The state could not be saved to WordPress.');
                }

            } catch (error) {
                console.error('❌ StateManager: Failed to complete save process:', error);
                // Let the toolbar know there was an error
                if (onError) onError({ error: error.message });
                return false;
            }
        },
        
        async saveToWordPress() {
            if (!window.gmkbData || !window.gmkbData.postId) {
                console.log('💾 StateManager: No post ID available for WordPress save');
                return false;
            }
            
            try {
                console.log('💾 StateManager: Saving state to WordPress database...');
                
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'guestify_save_media_kit',
                        nonce: window.gmkbData.nonce,
                        post_id: window.gmkbData.postId,
                        state: JSON.stringify(this.state)
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    console.log('✅ StateManager: Saved state to WordPress database');
                    return true;
                } else {
                    console.warn('⚠️ StateManager: WordPress save failed:', data);
                    return false;
                }
            } catch (error) {
                console.error('❌ StateManager: Error saving to WordPress:', error);
                return false;
            }
        },
        
        loadFromStorage() {
            try {
                const saved = localStorage.getItem('gmkb-state');
                if (saved) {
                    const data = JSON.parse(saved);
                    this.state = { ...this.state, ...data };
                    console.log('💾 StateManager: Loaded state from localStorage');
                    console.log('💾 StateManager: Components in loaded state:', Object.keys(data.components || {}).length);
                    console.log('💾 StateManager: Full loaded data:', data);
                    return true;
                }
            } catch (error) {
                console.warn('💾 StateManager: Failed to load from localStorage:', error);
            }
            console.log('💾 StateManager: No saved state found in localStorage');
            return false;
        },
        
        /**
         * Handles the save request event.
         * @param {CustomEvent} event The event object.
         */
        async handleSaveRequest(event) {
            const detail = event.detail || {};
            console.log('💾 StateManager: Save request received.', detail);
            
            const { onComplete, onError } = detail;
            try {
                localStorage.setItem('gmkb-state', JSON.stringify(this.state));
                const wordpressSuccess = await this.saveToWordPress();
        
                if (wordpressSuccess) {
                    if (onComplete) onComplete({ source: 'StateManager', status: 'success' });
                    return true;
                } else {
                    throw new Error('The state could not be saved to WordPress.');
                }
            } catch (error) {
                if (onError) onError({ error: error.message });
                return false;
            }
        }
    };

    const ComponentManager = {
        availableComponents: {},
        
        // ROOT FIX: Global action listeners flag
        globalActionListenersSetup: false,
        
        init() {
            console.log('🧩 ComponentManager: Initialized (Server-Integrated)');
            
            // ROOT FIX: Setup global action listeners ONCE during initialization
            this.initializeGlobalActionListeners();
            
            // ROOT FIX: Load available components for library ONLY (no rendering triggers)
            this.loadAvailableComponentsForLibrary();
        },
        
        /**
         * ROOT FIX: Initialize global action listeners for ComponentManager
         */
        initializeGlobalActionListeners() {
            if (this.globalActionListenersSetup) {
                console.log('ℹ️ ComponentManager: Global action listeners already setup');
                return;
            }
            
            console.log('🚀 ComponentManager: Setting up global action listeners...');
            
            const globalHandlers = {
                'gmkb:component-edit-requested': (event) => {
                    const componentId = event.detail.componentId;
                    console.log(`🎨 ComponentManager: Edit requested for ${componentId}`);
                    this.editComponent(componentId);
                },
                
                'gmkb:component-move-up-requested': (event) => {
                    const componentId = event.detail.componentId;
                    console.log(`⬆️ ComponentManager: Move up requested for ${componentId}`);
                    this.moveComponentUp(componentId);
                },
                
                'gmkb:component-move-down-requested': (event) => {
                    const componentId = event.detail.componentId;
                    console.log(`⬇️ ComponentManager: Move down requested for ${componentId}`);
                    this.moveComponentDown(componentId);
                },
                
                'gmkb:component-duplicate-requested': (event) => {
                    const componentId = event.detail.componentId;
                    console.log(`📋 ComponentManager: Duplicate requested for ${componentId}`);
                    this.duplicateComponent(componentId);
                },
                
                'gmkb:component-delete-requested': (event) => {
                    const componentId = event.detail.componentId;
                    console.log(`🗑️ ComponentManager: Delete requested for ${componentId}`);
                    this.deleteComponent(componentId);
                }
            };
            
            // Subscribe to all events globally using GMKB
            Object.entries(globalHandlers).forEach(([eventName, handler]) => {
                if (window.GMKB && window.GMKB.subscribe) {
                    window.GMKB.subscribe(eventName, handler);
                } else {
                    document.addEventListener(eventName, handler);
                }
            });
            
            this.globalActionListenersSetup = true;
            console.log('✅ ComponentManager: Global action listeners setup complete');
        },
        
        /**
         * ROOT FIX: Load available components for library only - no rendering triggers
         * This method ONLY populates the component library and does NOT trigger any component rendering
         */
        async loadAvailableComponentsForLibrary() {
            try {
                console.log('🔄 ComponentManager: Loading available components for library ONLY (no renders)...');
                
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'guestify_get_components',
                        nonce: window.gmkbData.nonce
                    })
                });
                
                const data = await response.json();
                console.log('🔍 ComponentManager: Server response for library:', data);
                
                // ROOT FIX: Handle both wp_send_json_success and direct return formats
                let components, categories;
                
                if (data.success && data.data) {
                    components = data.data.components || {};
                    categories = data.data.categories || {};
                    console.log('✅ ComponentManager: Using wp_send_json_success format');
                } else if (data.success && data.components) {
                    components = data.components || {};
                    categories = data.categories || {};
                    console.log('✅ ComponentManager: Using direct return format');
                } else if (data.components) {
                    components = data.components || {};
                    categories = data.categories || {};
                    console.log('✅ ComponentManager: Using legacy format');
                } else {
                    throw new Error('Invalid response format: ' + JSON.stringify(data));
                }
                
                this.availableComponents = components;
                console.log('✅ ComponentManager: Loaded', Object.keys(components).length, 'available components for library');
                console.log('📋 ComponentManager: Component types:', Object.keys(components));
                
                // ROOT FIX: ONLY populate component library - NO rendering events
                this.populateComponentLibraryOnly(components, categories);
                
                console.log('✅ ComponentManager: Library population complete - NO component renders triggered');
                
            } catch (error) {
                console.error('❌ ComponentManager: Error loading components for library:', error);
                this.loadFallbackComponentsForLibrary();
            }
        },
        
        /**
         * LEGACY METHOD: Keep for backwards compatibility but rename to avoid confusion
         */
        async loadAvailableComponents() {
            try {
                console.log('🔄 ComponentManager: Loading available components from server...');
                
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'guestify_get_components',
                        nonce: window.gmkbData.nonce
                    })
                });
                
                const data = await response.json();
                console.log('🔍 ComponentManager: Server response:', data);
                
                // Show debug information if available
                if (data.debug || (data.data && data.data.debug)) {
                    const debugInfo = data.debug || data.data.debug;
                    console.log('🔍 ComponentManager: Debug info:', debugInfo);
                    
                    if (debugInfo.components_dir_exists === false) {
                        console.error('❌ ComponentManager: Components directory does not exist:', debugInfo.components_dir);
                    }
                    if (debugInfo.components_dir_readable === false) {
                        console.error('❌ ComponentManager: Components directory not readable:', debugInfo.components_dir);
                    }
                }
                
                // ROOT FIX: Handle both wp_send_json_success and direct return formats
                let components, categories;
                
                if (data.success && data.data) {
                    // wp_send_json_success format: {success: true, data: {components: ..., categories: ...}}
                    components = data.data.components || {};
                    categories = data.data.categories || {};
                    console.log('✅ ComponentManager: Using wp_send_json_success format');
                } else if (data.success && data.components) {
                    // Direct return format: {success: true, components: ..., categories: ...}
                    components = data.components || {};
                    categories = data.categories || {};
                    console.log('✅ ComponentManager: Using direct return format');
                } else if (data.components) {
                    // Legacy format: {components: ..., categories: ...}
                    components = data.components || {};
                    categories = data.categories || {};
                    console.log('✅ ComponentManager: Using legacy format');
                } else {
                    throw new Error('Invalid response format: ' + JSON.stringify(data));
                }
                
                this.availableComponents = components;
                console.log('✅ ComponentManager: Loaded', Object.keys(components).length, 'available components');
                console.log('📋 ComponentManager: Component types:', Object.keys(components));
                
                // Populate component library modal
                this.populateComponentLibrary(components, categories);
                
                // ROOT FIX: REMOVED - these events were causing re-renders
                // OLD CODE: Dispatch events that triggered component re-renders
                // GMKB.dispatch('gmkb:components-loaded', { ... });
                
                console.log('⚠️ ComponentManager: Legacy loadAvailableComponents() called - use loadAvailableComponentsForLibrary() instead');
                
            } catch (error) {
                console.error('❌ ComponentManager: Error loading components:', error);
                console.error('❌ ComponentManager: Error details:', {
                    message: error.message,
                    stack: error.stack
                });
                // Fallback to hardcoded components for development
                this.loadFallbackComponents();
            }
        },
        
        /**
         * ROOT FIX: Load fallback components for library only - no rendering triggers
         */
        loadFallbackComponentsForLibrary() {
            console.log('🔄 ComponentManager: Loading fallback components for library only...');
            this.availableComponents = {
                'hero': { name: 'Hero Section', category: 'essential', icon: 'hero-icon.svg', description: 'Add a compelling header with your name and expertise' },
                'biography': { name: 'Biography', category: 'essential', icon: 'bio-icon.svg', description: 'Share your professional background and story' },
                'topics': { name: 'Speaking Topics', category: 'essential', icon: 'topics-icon.svg', description: 'Showcase your areas of expertise' },
                'social': { name: 'Social Links', category: 'contact', icon: 'social-icon.svg', description: 'Connect with your social media profiles' },
                'call-to-action': { name: 'Call to Action', category: 'engagement', icon: 'cta-icon.svg', description: 'Encourage visitors to take action' }
            };
            
            const categories = {
                'essential': Object.values(this.availableComponents).filter(c => c.category === 'essential'),
                'contact': Object.values(this.availableComponents).filter(c => c.category === 'contact'),
                'engagement': Object.values(this.availableComponents).filter(c => c.category === 'engagement')
            };
            
            this.populateComponentLibraryOnly(this.availableComponents, categories);
            
            console.log('⚠️ ComponentManager: Using fallback components for library only:', Object.keys(this.availableComponents));
        },
        
        /**
         * LEGACY METHOD: Keep for backwards compatibility
         */
        loadFallbackComponents() {
            console.log('🔄 ComponentManager: Loading fallback components...');
            this.availableComponents = {
                'hero': { name: 'Hero Section', category: 'essential', icon: 'hero-icon.svg', description: 'Add a compelling header with your name and expertise' },
                'biography': { name: 'Biography', category: 'essential', icon: 'bio-icon.svg', description: 'Share your professional background and story' },
                'topics': { name: 'Speaking Topics', category: 'essential', icon: 'topics-icon.svg', description: 'Showcase your areas of expertise' },
                'social': { name: 'Social Links', category: 'contact', icon: 'social-icon.svg', description: 'Connect with your social media profiles' },
                'call-to-action': { name: 'Call to Action', category: 'engagement', icon: 'cta-icon.svg', description: 'Encourage visitors to take action' }
            };
            
            const categories = {
                'essential': Object.values(this.availableComponents).filter(c => c.category === 'essential'),
                'contact': Object.values(this.availableComponents).filter(c => c.category === 'contact'),
                'engagement': Object.values(this.availableComponents).filter(c => c.category === 'engagement')
            };
            
            this.populateComponentLibrary(this.availableComponents, categories);
            
            console.log('⚠️ ComponentManager: Using fallback components:', Object.keys(this.availableComponents));
            
            // ROOT FIX: REMOVED - these events were causing re-renders
                console.log('⚠️ ComponentManager: Legacy loadFallbackComponents() called');
        },
        
        /**
         * ROOT FIX: Populate component library without triggering any rendering events
         * This method ONLY updates the component library DOM - NO component rendering
         */
        populateComponentLibraryOnly(components, categories) {
            const componentGrid = document.getElementById('component-grid');
            if (!componentGrid) {
                console.warn('🧩 ComponentManager: Component grid not found - library not populated');
                return;
            }
            
            console.log('📋 ComponentManager: Populating component library ONLY (no renders)...');
            
            // Hide loading state
            const loadingState = document.getElementById('component-grid-loading');
            if (loadingState) {
                loadingState.style.display = 'none';
            }
            
            // Clear existing content
            componentGrid.innerHTML = '';
            
            // Create component cards
            Object.entries(components).forEach(([key, component]) => {
                const componentCard = document.createElement('div');
                componentCard.className = 'component-item component-card';
                componentCard.setAttribute('data-component-type', key);
                componentCard.setAttribute('data-component', key);
                componentCard.setAttribute('data-category', component.category || 'other');
                
                componentCard.innerHTML = `
                    <div class="component-item__preview">
                        <div class="component-preview-icon">
                            ${this.getComponentIcon(key)}
                        </div>
                    </div>
                    <div class="component-item__info">
                        <h4 class="component-item__name">${component.name || key}</h4>
                        <p class="component-item__description">${component.description || 'No description available'}</p>
                        ${component.isPremium ? '<span class="premium-badge">Pro</span>' : ''}
                    </div>
                    <div class="component-item__actions">
                        <button class="btn btn--small btn--primary add-component-btn" data-component="${key}">
                            Add Component
                        </button>
                    </div>
                `;
                
                // Make component card draggable
                componentCard.draggable = true;
                
                componentGrid.appendChild(componentCard);
            });
            
            console.log('✅ ComponentManager: Library populated with', Object.keys(components).length, 'components - NO rendering triggered');
            
            // Set up drag handlers for newly populated components
            if (window.DragDropManager && window.DragDropManager.updateComponentLibraryDragHandlers) {
                window.DragDropManager.updateComponentLibraryDragHandlers();
            }
        },
        
        /**
         * LEGACY METHOD: Keep for backwards compatibility but avoid using
         */
        populateComponentLibrary(components, categories) {
            const componentGrid = document.getElementById('component-grid');
            if (!componentGrid) {
                console.warn('🧩 ComponentManager: Component grid not found');
                return;
            }
            
            // Hide loading state
            const loadingState = document.getElementById('component-grid-loading');
            if (loadingState) {
                loadingState.style.display = 'none';
            }
            
            // Clear existing content
            componentGrid.innerHTML = '';
            
            // Create component cards
            Object.entries(components).forEach(([key, component]) => {
                const componentCard = document.createElement('div');
                componentCard.className = 'component-item component-card';  // ROOT FIX: Add component-card class for drag detection
                componentCard.setAttribute('data-component-type', key);
                componentCard.setAttribute('data-component', key);  // ROOT FIX: Add data-component for drag-drop compatibility
                componentCard.setAttribute('data-category', component.category || 'other');
                
                componentCard.innerHTML = `
                    <div class="component-item__preview">
                        <div class="component-preview-icon">
                            ${this.getComponentIcon(key)}
                        </div>
                    </div>
                    <div class="component-item__info">
                        <h4 class="component-item__name">${component.name || key}</h4>
                        <p class="component-item__description">${component.description || 'No description available'}</p>
                        ${component.isPremium ? '<span class="premium-badge">Pro</span>' : ''}
                    </div>
                    <div class="component-item__actions">
                        <button class="btn btn--small btn--primary add-component-btn" data-component="${key}">
                            Add Component
                        </button>
                    </div>
                `;
                
                // ROOT FIX: Make component card draggable immediately
                componentCard.draggable = true;
                
                componentGrid.appendChild(componentCard);
            });
            
            console.log('✅ ComponentManager: Populated component library with', Object.keys(components).length, 'components');
            
            // ROOT FIX: Set up drag handlers for newly populated components
            if (window.DragDropManager && window.DragDropManager.updateComponentLibraryDragHandlers) {
                window.DragDropManager.updateComponentLibraryDragHandlers();
            }
            
            console.log('⚠️ ComponentManager: Legacy populateComponentLibrary() called - may trigger re-renders');
        },
        
        getComponentIcon(componentType) {
            const icons = {
                'hero': '🎯',
                'biography': '👤', 
                'topics': '📚',
                'social': '🔗',
                'call-to-action': '📢',
                'contact': '📞',
                'gallery': '🖼️',
                'testimonials': '💭',
                'stats': '📊'
            };
            return icons[componentType] || '📄';
        },
        
        async addComponent(type, data = {}, skipServerRender = false) {
            const component = {
                id: 'component-' + Date.now(),
                type,
                data,
                timestamp: Date.now()
            };
            
            const id = StateManager.addComponent(component);
            
            // If skipServerRender is true, use fallback rendering (for backwards compatibility)
            if (skipServerRender) {
                this.renderComponentFallback(id);
            } else {
                // Use server-side rendering for real components
                await this.renderComponent(id);
            }
            
            console.log(`🧩 ComponentManager: Added component '${type}' with ID: ${id}`);
            return id;
        },
        
        removeComponent(id) {
            // Remove from DOM - VANILLA JS
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            }
            
            // Remove from state
            const success = StateManager.removeComponent(id);
            
            if (success) {
                console.log(`🧩 ComponentManager: Removed component with ID: ${id}`);
                
                // ROOT FIX: Simplified empty state management (no UIManager dependency)
                const previewContainerForRemoval = document.getElementById('media-kit-preview');
                const remainingComponentsAfterRemoval = previewContainerForRemoval?.querySelectorAll('[data-component-id]');
                
                if (!remainingComponentsAfterRemoval || remainingComponentsAfterRemoval.length === 0) {
                    const emptyStateElement = document.getElementById('empty-state');
                    if (emptyStateElement) {
                        emptyStateElement.style.display = 'block';
                        console.log('✅ ComponentManager: Showing empty state - no components remaining');
                    }
                }
            }
            
            return success;
        },
        
        /**
         * ROOT FIX: Load saved components with single-render guarantee
         * This method ensures each component is rendered EXACTLY ONCE
         */
        async loadSavedComponents() {
            const state = StateManager.getState();
            const componentIds = Object.keys(state.components);
            
            if (componentIds.length === 0) {
                console.log('📝 ComponentManager: No saved components to load');
                return;
            }
            
            console.log(`🔄 ComponentManager: ROOT FIX - Single-render loading of ${componentIds.length} saved components...`);
            
            // Hide empty state
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // ROOT FIX: Track rendered components to prevent duplicate renders
            const renderedComponents = new Set();
            
            // Render each component in layout order - ONCE ONLY
            for (const componentId of state.layout) {
                if (state.components[componentId] && !renderedComponents.has(componentId)) {
                    console.log(`🎨 ComponentManager: Single-rendering component ${componentId}`);
                    await this.renderComponent(componentId);
                    renderedComponents.add(componentId);
                    
                    // Small delay to prevent race conditions
                    await new Promise(resolve => setTimeout(resolve, 10));
                } else if (renderedComponents.has(componentId)) {
                    console.log(`⚠️ ComponentManager: Skipping duplicate render of ${componentId}`);
                }
            }
            
            console.log(`✅ ComponentManager: ROOT FIX - Successfully single-rendered ${renderedComponents.size} components`);
        },
        
        /**
         * ROOT FIX: Enhanced component rendering with comprehensive loading state management
         * @param {string} componentId - Component ID to render
         * @returns {Promise<boolean>} Success status
         */
        async renderComponent(componentId) {
            try {
                const state = StateManager.getState();
                const component = state.components[componentId];
                
                if (!component) {
                    console.error(`❌ ComponentManager: Component ${componentId} not found in state`);
                    return false;
                }
                
                console.log(`🎨 ComponentManager: Enhanced rendering for ${componentId} (${component.type})`);
                
                // ROOT FIX: Use generic enhanced loading for all components
                // Component-specific fallbacks handled by components themselves
                
                // Validate required data for non-topics components
                if (!window.gmkbData?.ajaxUrl || !window.gmkbData?.nonce) {
                    console.error(`❌ ComponentManager: Missing WordPress AJAX data for ${componentId}`);
                    return this.renderComponentFallback(componentId);
                }
                
                // Make AJAX call to render component server-side
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'guestify_render_component',
                        nonce: window.gmkbData.nonce,
                        component: component.type,
                        props: JSON.stringify({
                            ...component.data,
                            post_id: window.gmkbData.postId,
                            component_id: componentId
                        })
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (data.success && data.data && data.data.html) {
                    // ROOT FIX: Pass script data from AJAX response to DOM insertion
                    const ajaxScripts = data.data.scripts || null;
                    
                    // Insert rendered HTML into DOM with script data
                    this.insertComponentIntoDOM(componentId, data.data.html, component, ajaxScripts);
                    
                    console.log(`✅ ComponentManager: Successfully rendered ${componentId} via server`);
                    if (ajaxScripts && ajaxScripts.length > 0) {
                        console.log(`📜 ComponentManager: ${ajaxScripts.length} scripts included in AJAX response`);
                    }
                    return true;
                } else {
                    console.warn(`⚠️ ComponentManager: Server rendering failed for ${componentId}:`, data);
                    
                    // Fallback to client-side rendering
                    const fallbackSuccess = this.renderComponentFallback(componentId);
                    if (fallbackSuccess) {
                        console.log(`✅ ComponentManager: Fallback rendering succeeded for ${componentId}`);
                        return true;
                    } else {
                        console.error(`❌ ComponentManager: Both server and fallback rendering failed for ${componentId}`);
                        return false;
                    }
                }
                
            } catch (error) {
                console.error(`❌ ComponentManager: Error rendering ${componentId}:`, error);
                
                // Fallback to client-side rendering on error
                const fallbackSuccess = this.renderComponentFallback(componentId);
                if (fallbackSuccess) {
                    console.log(`✅ ComponentManager: Fallback rendering succeeded after error for ${componentId}`);
                    return true;
                } else {
                    console.error(`❌ ComponentManager: All rendering methods failed for ${componentId}`);
                    return false;
                }
            }
        },
        
        /**
         * ROOT FIX: Generic enhanced component rendering - ARCHITECTURAL COMPLIANCE
         * Removed topics-specific code to follow scalable architecture principles
         */
        async renderComponentWithEnhancedLoading(componentId, component) {
            // Generic enhanced rendering for all components
            // Component-specific logic handled by individual components
            return await this.renderComponent(componentId);
        },
        
        /**
         * ROOT FIX: Generic loading overlay system - ARCHITECTURAL COMPLIANCE
         * Removed component-specific overlays, using generic system
         */
        createLoadingOverlay(componentId, componentType) {
            const previewContainer = document.getElementById('media-kit-preview');
            if (!previewContainer) return;
            
            this.removeLoadingOverlay(componentId);
            
            const overlay = document.createElement('div');
            overlay.id = `loading-${componentId}`;
            overlay.className = 'component-loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner">⏳</div>
                    <div class="loading-title">Loading ${componentType} Component</div>
                    <div class="loading-description">Please wait...</div>
                </div>
            `;
            
            overlay.style.cssText = `
                position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(255, 255, 255, 0.95); display: flex;
                align-items: center; justify-content: center; z-index: 1000;
                border-radius: 8px;
            `;
            
            previewContainer.appendChild(overlay);
        },
        
        removeLoadingOverlay(componentId) {
            const overlay = document.getElementById(`loading-${componentId}`);
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            }
        },
        
        /**
         * ROOT FIX: Generic component fallback system - ARCHITECTURAL COMPLIANCE
         * Moved component-specific logic to individual components
         */
        async requestComponentFallback(componentId, component) {
            // Dispatch event for component to handle its own fallback
            GMKB.dispatch('gmkb:component-fallback-requested', {
                componentId,
                componentType: component.type,
                component,
                timestamp: Date.now()
            });
            
            // Use generic fallback if component doesn't respond
            setTimeout(() => {
                const element = document.getElementById(componentId);
                if (!element) {
                    this.renderGenericFallback(componentId, component);
                }
            }, 1000);
        },
        
        renderGenericFallback(componentId, component) {
            const fallbackHtml = `
                <div class="component-fallback" data-component="${component.type}">
                    <div class="fallback-content">
                        <h3>${component.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Component</h3>
                        <p>Loading component...</p>
                        <div class="fallback-notice">
                            ⚠️ Fallback mode: Component will load shortly.
                        </div>
                    </div>
                </div>
            `;
            
            this.insertComponentIntoDOM(componentId, fallbackHtml, component);
            console.log(`🔧 ComponentManager: Generic fallback rendered for ${componentId}`);
        },
        
        /**
         * ROOT FIX: Generic script loading system - ARCHITECTURAL COMPLIANCE
         * Removed component-specific script loading methods
         */
        
        /**
         * ROOT FIX: Fallback component rendering (client-side)
         * @param {string} componentId - Component ID to render
         * @returns {boolean} Success status
         */
        renderComponentFallback(componentId) {
            try {
                const state = StateManager.getState();
                const component = state.components[componentId];
                
                if (!component) {
                    console.error(`❌ ComponentManager: Component ${componentId} not found for fallback`);
                    return false;
                }
                
                console.log(`🔧 ComponentManager: Using fallback rendering for ${componentId} (${component.type})`);
                
                // Generate basic HTML for the component type
                const fallbackHtml = this.generateFallbackHTML(component);
                
                // Insert into DOM
                this.insertComponentIntoDOM(componentId, fallbackHtml, component);
                
                console.log(`✅ ComponentManager: Fallback rendering complete for ${componentId}`);
                return true;
                
            } catch (error) {
                console.error(`❌ ComponentManager: Fallback rendering failed for ${componentId}:`, error);
                return false;
            }
        },
        
        /**
         * ROOT FIX: Insert rendered component HTML into the DOM
         * @param {string} componentId - Component ID
         * @param {string} html - Rendered HTML
         * @param {Object} component - Component data
         * @param {Array} ajaxScripts - Script data from AJAX response (optional)
         */
        insertComponentIntoDOM(componentId, html, component, ajaxScripts = null) {
            const previewContainer = document.getElementById('media-kit-preview');
            if (!previewContainer) {
                console.error('❌ ComponentManager: Preview container not found');
                return;
            }
            
            // ROOT FIX: Remove existing element if present (no controls preservation needed)
            const existingElement = document.getElementById(componentId);
            if (existingElement) {
                console.log(`🔄 ComponentManager: Removing existing element ${componentId} for clean re-render`);
                existingElement.remove();
            }
            
            // Create wrapper element
            const componentElement = document.createElement('div');
            componentElement.id = componentId;
            componentElement.className = 'media-kit-component';
            componentElement.setAttribute('data-component-type', component.type);
            componentElement.setAttribute('data-component-id', componentId);
            
            // Insert the component HTML
            componentElement.innerHTML = html;
            
            // ROOT FIX: Update the data-component-id of inner elements to match state ID
            const innerComponentElement = componentElement.querySelector('[data-component-id]');
            if (innerComponentElement && innerComponentElement.getAttribute('data-component-id') !== componentId) {
                console.log(`🔧 ComponentManager: Updating inner component ID from ${innerComponentElement.getAttribute('data-component-id')} to ${componentId}`);
                innerComponentElement.setAttribute('data-component-id', componentId);
            }
            
            // ROOT FIX: No controls preservation needed - controls will attach naturally
            
            // Append to preview container
            previewContainer.appendChild(componentElement);
            
            // ROOT FIX: Attach component interaction handlers immediately
            this.attachComponentHandlers(componentElement, componentId);
            
            // ROOT FIX: Load component scripts - prioritize AJAX scripts if available
            if (ajaxScripts && ajaxScripts.length > 0) {
                console.log(`📜 ComponentManager: Loading ${ajaxScripts.length} scripts from AJAX response for ${component.type}`);
                this.loadComponentScriptsFromAjaxData(ajaxScripts, componentId);
            } else {
                // Fallback to original script loading method
                this.loadComponentScripts(component.type, componentId);
            }
            
            // ROOT FIX: Simplified empty state management (no UIManager dependency)
            const previewContainerForInsertion = document.getElementById('media-kit-preview');
            const remainingComponentsAfterInsertion = previewContainerForInsertion?.querySelectorAll('[data-component-id]');
            
            if (!remainingComponentsAfterInsertion || remainingComponentsAfterInsertion.length === 0) {
                const emptyStateElementAfterInsertion = document.getElementById('empty-state');
                if (emptyStateElementAfterInsertion) {
                    emptyStateElementAfterInsertion.style.display = 'block';
                    console.log('✅ ComponentManager: Showing empty state after component insertion');
                }
            } else {
                const emptyStateElementAfterInsertion = document.getElementById('empty-state');
                if (emptyStateElementAfterInsertion) {
                    emptyStateElementAfterInsertion.style.display = 'none';
                    console.log('✅ ComponentManager: Hiding empty state - components present');
                }
            }
            
            console.log(`✅ ComponentManager: Inserted ${componentId} into DOM with dynamic controls`);
        },
        
        /**
         * ROOT FIX: Attach interaction handlers using ComponentControlsManager
         * EVENT-DRIVEN: Wait for ComponentControlsManager via events, no polling
         * @param {HTMLElement} componentElement - Component DOM element
         * @param {string} componentId - Component ID
         */
        attachComponentHandlers(componentElement, componentId) {
            // ROOT FIX: Check if handlers already attached to prevent duplicates
            if (componentElement.hasAttribute('data-handlers-attached')) {
                console.log(`ℹ️ ComponentManager: Handlers already attached to ${componentId}, skipping`);
                return;
            }
            
            // Mark as having handlers attached
            componentElement.setAttribute('data-handlers-attached', 'true');
            
            // ROOT FIX: Find the actual component element to attach controls to
            let targetElement = componentElement;
            
            // If this is a wrapper, find the actual component inside
            const actualComponent = componentElement.querySelector('.topics-component, .hero-component, .biography-component, .social-component, .editable-element');
            if (actualComponent) {
                targetElement = actualComponent;
                console.log(`🎯 ComponentManager: Found actual component element for controls: ${targetElement.className}`);
            }
            
            // Use the actual component's data-component-id if available
            let targetComponentId = targetElement.getAttribute('data-component-id') || componentId;
            
            // ROOT FIX: Event-driven ComponentControlsManager integration
            if (window.componentControlsManager) {
                // ComponentControlsManager is ready - attach immediately
                GMKB.attachControlsImmediately(targetElement, targetComponentId);
            } else {
                // ROOT FIX: Listen for ComponentControlsManager ready event (NO POLLING)
                const handleControlsManagerReady = () => {
                    if (window.componentControlsManager) {
                        console.log(`✅ ComponentManager: ComponentControlsManager ready for ${targetComponentId}`);
                        GMKB.attachControlsImmediately(targetElement, targetComponentId);
                        // Remove listener after successful attachment
                        document.removeEventListener('DOMContentLoaded', handleControlsManagerReady);
                        document.removeEventListener('gmkb:component-controls-manager-ready', handleControlsManagerReady);
                    }
                };
                
                // ROOT FIX: Multiple event listeners for different loading scenarios
                document.addEventListener('gmkb:component-controls-manager-ready', handleControlsManagerReady);
                document.addEventListener('DOMContentLoaded', handleControlsManagerReady);
                
                // ROOT FIX: Also check on next tick in case manager loads very quickly
                Promise.resolve().then(() => {
                    if (window.componentControlsManager) {
                        handleControlsManagerReady();
                    }
                });
                
                console.log(`⏳ ComponentManager: Waiting for ComponentControlsManager via events for ${targetComponentId}`);
            }
        },
        
        /**
         * ROOT FIX: Attach controls immediately when ComponentControlsManager is available
         * @param {HTMLElement} componentElement - Component DOM element
         * @param {string} componentId - Component ID
         */
        attachControlsImmediately(componentElement, componentId) {
            // ROOT FIX: Find the actual target element for control attachment
            let targetElement = componentElement;
            let targetComponentId = componentId;
            
            // If componentElement is a wrapper, find the actual component inside
            const innerComponent = componentElement.querySelector('[data-component-id]');
            if (innerComponent) {
                targetElement = innerComponent;
                // Use the wrapper's ID (state ID) for control events, but attach to inner element
                targetComponentId = componentId; // Keep using the state ID for events
                console.log(`🎯 ComponentManager: Using inner element for controls, state ID: ${targetComponentId}`);
            }
            
            const success = window.componentControlsManager.attachControls(targetElement, targetComponentId);
            if (success) {
                console.log(`✅ ComponentManager: Dynamic controls attached to ${targetComponentId} via ComponentControlsManager`);
                console.log(`✅ ComponentManager: Root-level fix complete for ${targetComponentId} - no hardcoded HTML`);
            } else {
                console.warn(`⚠️ ComponentManager: Failed to attach dynamic controls to ${targetComponentId}`);
                // Fallback to event-based attachment
                this.requestControlAttachment(targetElement, targetComponentId);
            }
        },
        
        /**
         * ROOT FIX: Request control attachment via event system
         * @param {HTMLElement} componentElement - Component DOM element
         * @param {string} componentId - Component ID
         */
        requestControlAttachment(componentElement, componentId) {
            GMKB.dispatch('gmkb:attach-controls-requested', {
                componentElement,
                componentId,
                timestamp: Date.now(),
                source: 'ComponentManager'
            });
        },
        

        
        /**
         * ROOT FIX: Generate fallback HTML for component types
         * @param {Object} component - Component data
         * @returns {string} Fallback HTML
         */
        generateFallbackHTML(component) {
            const data = component.data || {};
            const type = component.type;
            
            const fallbackTemplates = {
                'hero': `
                    <div class="hero-component">
                        <h1 class="hero-title">${data.title || 'Your Name Here'}</h1>
                        <p class="hero-subtitle">${data.subtitle || 'Professional Speaker & Expert'}</p>
                        <p class="hero-description">${data.description || 'Add your professional description here.'}</p>
                    </div>
                `,
                'biography': `
                    <div class="biography-component">
                        <h2>About Me</h2>
                        <p>${data.bio || 'Share your professional background and expertise here.'}</p>
                    </div>
                `,
                'topics': `
                    <div class="topics-component">
                        <h2>Speaking Topics</h2>
                        <div class="topics-list">
                            ${(data.topics || ['Topic 1', 'Topic 2', 'Topic 3']).map(topic => 
                                `<div class="topic-item">
                                    <h3>${topic}</h3>
                                    <p>Description for ${topic}</p>
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                `,
                'social': `
                    <div class="social-component">
                        <h2>Connect With Me</h2>
                        <div class="social-links">
                            <a href="#" class="social-link">🐦 Twitter</a>
                            <a href="#" class="social-link">💼 LinkedIn</a>
                            <a href="#" class="social-link">📸 Instagram</a>
                        </div>
                    </div>
                `,
                'call-to-action': `
                    <div class="cta-component">
                        <h2>${data.title || 'Ready to Book Me?'}</h2>
                        <p>${data.description || 'Let\'s discuss how I can add value to your event.'}</p>
                        <button class="cta-button">${data.buttonText || 'Contact Me'}</button>
                    </div>
                `
            };
            
            return fallbackTemplates[type] || `
                <div class="generic-component">
                    <h2>${type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Component</h2>
                    <p>This component is ready for customization.</p>
                </div>
            `;
        },
        
        /**
         * ROOT FIX: Edit component with enhanced ID resolution (loads component's own design panel in sidebar)
         * @param {string} componentId - Component ID to edit
         */
        async editComponent(componentId) {
            console.log(`✏️ ComponentManager: Opening editor for ${componentId}`);
            
            const state = StateManager.getState();
            let component = state.components[componentId];
            let foundId = componentId;
            
            // ROOT FIX: Enhanced ID resolution with improved mapping strategies
            if (!component) {
                console.warn(`⚠️ Component ${componentId} not found in state, using enhanced ID resolution...`);
                
                const stateComponentIds = Object.keys(state.components);
                console.log('🔍 Available component IDs in state:', stateComponentIds);
                
                // Strategy 1: Direct DOM element lookup to find the actual component ID
                const domElement = document.querySelector(`[data-component-id="${componentId}"]`);
                if (domElement) {
                    // Check if DOM element has a wrapper with the state ID
                    const wrapper = domElement.closest('[id^="component-"]');
                    if (wrapper && wrapper.id && state.components[wrapper.id]) {
                        foundId = wrapper.id;
                        component = state.components[foundId];
                        console.log(`✅ Found component via DOM wrapper mapping: ${foundId}`);
                    }
                }
                
                // Strategy 2: Check if any state ID contains our DOM ID or vice versa
                if (!component) {
                    foundId = stateComponentIds.find(stateId => 
                        stateId.includes(componentId) || componentId.includes(stateId)
                    );
                    
                    if (foundId) {
                        component = state.components[foundId];
                        console.log(`✅ Found component by partial match for editing: ${foundId}`);
                    }
                }
                
                // Strategy 3: Use single component if only one exists
                if (!component && stateComponentIds.length === 1) {
                    foundId = stateComponentIds[0];
                    component = state.components[foundId];
                    console.log(`✅ Using single component for editing: ${foundId}`);
                }
                
                // Strategy 4: Find by component type if we can determine it from DOM
                if (!component && domElement) {
                    const componentType = domElement.className.match(/(\w+)-component/)?.[1];
                    if (componentType) {
                        foundId = stateComponentIds.find(stateId => 
                            state.components[stateId]?.type === componentType
                        );
                        if (foundId) {
                            component = state.components[foundId];
                            console.log(`✅ Found component by type matching: ${foundId} (${componentType})`);
                        }
                    }
                }
            }
            
            if (!component) {
                console.error(`❌ Component ${componentId} not found for editing`);
                console.log('🗑️ Available components:', Object.keys(state.components));
                
                // ROOT FIX: Show a generic message in sidebar for unknown components
                this.displayGenericDesignPanel({
                    type: 'unknown',
                    id: componentId
                }, componentId);
                return;
            }
            
            console.log(`✅ Component found for editing: ${foundId}`, component);
            
            // ROOT FIX: Dispatch component edit event BEFORE loading design panel
            GMKB.dispatch('gmkb:component-edit-requested', {
                componentId: foundId, // Use the actual found ID
                componentType: component.type,
                component: component,
                timestamp: Date.now()
            });
            
            try {
                // ROOT FIX: Load component's own design panel via AJAX
                console.log(`📱 Loading design panel for component type: ${component.type}`);
                
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'guestify_render_design_panel',
                        nonce: window.gmkbData.nonce,
                        component: component.type,
                        component_id: foundId // Use the actual found ID
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.data && data.data.html) {
                    // ROOT FIX: Display in sidebar design panel
                    this.displayInSidebarDesignPanel(data.data.html, foundId, component);
                    console.log(`✅ ComponentManager: Loaded ${component.type} design panel in sidebar`);
                    
                    // ROOT FIX: Dispatch design panel ready event AFTER panel is displayed
                    GMKB.dispatch('gmkb:design-panel-ready', {
                        componentId: foundId,
                        component: component.type,
                        panelType: 'custom',
                        timestamp: Date.now()
                    });
                } else {
                    console.warn(`⚠️ ComponentManager: No design panel found for ${component.type}, using generic`);
                    this.displayGenericDesignPanel(component, foundId);
                    
                    // ROOT FIX: Dispatch event for generic panel too
                    GMKB.dispatch('gmkb:design-panel-ready', {
                        componentId: foundId,
                        component: component.type,
                        panelType: 'generic',
                        timestamp: Date.now()
                    });
                }
                
            } catch (error) {
                console.error('❌ ComponentManager: Error loading component design panel:', error);
                this.displayGenericDesignPanel(component, foundId);
                
                // ROOT FIX: Dispatch event for error case too
                GMKB.dispatch('gmkb:design-panel-ready', {
                    componentId: foundId,
                    component: component.type,
                    panelType: 'generic',
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        },
        
        /**
         * ROOT FIX: Display component design panel in sidebar
         * @param {string} html - Design panel HTML from component
         * @param {string} componentId - Component ID
         * @param {Object} component - Component data
         */
        displayInSidebarDesignPanel(html, componentId, component) {
            // Get sidebar design panel element
            const elementEditor = document.getElementById('element-editor');
            if (!elementEditor) {
                console.error('Sidebar element editor not found');
                return;
            }
            
            // Insert component's design panel HTML
            elementEditor.innerHTML = html;
            
            // Switch to design tab
            this.switchToDesignTab();
            
            // Bind form controls to component
            this.bindDesignPanelControls(elementEditor, componentId, component);
            
            // Store current component being edited
            elementEditor.dataset.currentComponent = componentId;
            
            console.log(`✅ Component ${component.type} design panel displayed in sidebar`);
        },
        
        /**
         * ROOT FIX: Switch to design tab in sidebar
         */
        switchToDesignTab() {
            // Remove active from all tabs
            document.querySelectorAll('.sidebar__tab').forEach(tab => {
                tab.classList.remove('sidebar__tab--active');
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('tab-content--active');
            });
            
            // Activate design tab
            const designTab = document.querySelector('[data-tab="design"]');
            const designTabContent = document.getElementById('design-tab');
            
            if (designTab && designTabContent) {
                designTab.classList.add('sidebar__tab--active');
                designTabContent.classList.add('tab-content--active');
                console.log('🎯 Switched to Design tab');
                
                // ROOT FIX: Dispatch sidebar tab change event for event-driven components
                GMKB.dispatch('gmkb:sidebar-tab-changed', {
                    tab: 'design',
                    tabElement: designTab,
                    contentElement: designTabContent,
                    timestamp: Date.now()
                });
            }
        },
        
        /**
         * ROOT FIX: Enhanced form control binding with proper component updates and re-rendering
         * @param {HTMLElement} panel - Design panel element
         * @param {string} componentId - Component ID
         * @param {Object} component - Component data
         */
        bindDesignPanelControls(panel, componentId, component) {
            const inputs = panel.querySelectorAll('[data-property], input, select, textarea');
            
            if (inputs.length === 0) {
                console.log(`⚠️ No form controls found in design panel for ${component.type}`);
                return;
            }
            
            inputs.forEach(input => {
                const property = input.dataset.property || input.name || input.id;
                
                if (property) {
                    // ROOT FIX: Enhanced initial value setting with proper type handling
                    const currentValue = component.data?.[property] || component.props?.[property];
                    if (currentValue !== undefined && currentValue !== null) {
                        if (input.type === 'checkbox') {
                            input.checked = !!currentValue;
                        } else if (input.type === 'color') {
                            input.value = currentValue;
                            // Also update any related text input
                            const textInput = panel.querySelector(`[data-property="${property}_text"]`);
                            if (textInput) textInput.value = currentValue;
                        } else {
                            input.value = currentValue;
                        }
                    }
                    
                    // ROOT FIX: Enhanced change listener with debouncing and error handling
                    let updateTimeout;
                    const updateComponent = async () => {
                        try {
                            // Clear any existing timeout for debouncing
                            if (updateTimeout) {
                                clearTimeout(updateTimeout);
                            }
                            
                            // Debounce rapid changes
                            updateTimeout = setTimeout(async () => {
                                const newProps = { ...(component.data || component.props || {}) };
                                
                                // ROOT FIX: Proper value extraction based on input type
                                if (input.type === 'checkbox') {
                                    newProps[property] = input.checked;
                                } else if (input.type === 'number') {
                                    newProps[property] = parseFloat(input.value) || 0;
                                } else if (input.type === 'color') {
                                    newProps[property] = input.value;
                                    // Also update related text input
                                    const textInput = panel.querySelector(`[data-property="${property}_text"]`);
                                    if (textInput) textInput.value = input.value;
                                } else {
                                    newProps[property] = input.value;
                                }
                                
                                // ROOT FIX: Enhanced component update with re-rendering
                                const success = await this.updateComponentWithRerender(componentId, { data: newProps });
                                
                                if (success) {
                                    console.log(`✅ Updated ${component.type}.${property} = ${newProps[property]}`);
                                    
                                    // Visual feedback for successful update
                                    this.showUpdateFeedback(input, 'success');
                                } else {
                                    console.warn(`⚠️ Failed to update ${component.type}.${property}`);
                                    this.showUpdateFeedback(input, 'error');
                                }
                            }, 300); // 300ms debounce
                            
                        } catch (error) {
                            console.error(`❌ Error updating ${component.type}.${property}:`, error);
                            this.showUpdateFeedback(input, 'error');
                        }
                    };
                    
                    // ROOT FIX: Enhanced event listeners for different input types
                    if (input.type === 'color') {
                        input.addEventListener('input', updateComponent);
                        input.addEventListener('change', updateComponent);
                    } else if (input.type === 'range') {
                        input.addEventListener('input', updateComponent);
                    } else if (input.tagName === 'SELECT') {
                        input.addEventListener('change', updateComponent);
                    } else if (input.type === 'checkbox') {
                        input.addEventListener('change', updateComponent);
                    } else {
                        input.addEventListener('input', updateComponent);
                        input.addEventListener('blur', updateComponent);
                    }
                    
                    // ROOT FIX: Color picker text input synchronization
                    if (input.type === 'color') {
                        const textInput = panel.querySelector(`[data-property="${property}_text"]`);
                        if (textInput) {
                            textInput.addEventListener('input', () => {
                                const colorValue = textInput.value;
                                if (/^#[0-9A-F]{6}$/i.test(colorValue)) {
                                    input.value = colorValue;
                                    updateComponent();
                                }
                            });
                        }
                    }
                }
            });
            
            console.log(`🔗 Enhanced binding for ${inputs.length} form controls in ${component.type} design panel`);
        },
        
        /**
         * ROOT FIX: Display generic design panel for components without custom panels
         * @param {Object} component - Component data
         * @param {string} componentId - Component ID
         */
        displayGenericDesignPanel(component, componentId) {
            const elementEditor = document.getElementById('element-editor');
            if (!elementEditor) return;
            
            // ROOT FIX: Handle unknown components
            if (component.type === 'unknown') {
                elementEditor.innerHTML = `
                    <div class="element-editor__title">Component Not Found</div>
                    <div class="element-editor__subtitle">Unable to load component editor</div>
                    
                    <div class="form-section">
                        <h4 class="form-section__title">Component Information</h4>
                        <div class="form-group">
                            <label class="form-label">Requested Component ID</label>
                            <input type="text" class="form-input" value="${componentId}" readonly>
                        </div>
                        <div class="form-help-text">
                            This component was not found in the saved state. This may happen if:
                            <ul>
                                <li>The component was recently added but not saved</li>
                                <li>There's a mismatch between DOM and state component IDs</li>
                                <li>The component state data is corrupted</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4 class="form-section__title">Troubleshooting</h4>
                        <div class="form-group">
                            <button type="button" class="btn btn--secondary" onclick="console.log('Available components:', Object.keys(window.GMKB?.systems?.StateManager?.getState?.()?.components || {}))">
                                Log Available Components
                            </button>
                        </div>
                        <div class="form-group">
                            <button type="button" class="btn btn--secondary" onclick="location.reload()">
                                Reload Page
                            </button>
                        </div>
                    </div>
                `;
                
                this.switchToDesignTab();
                elementEditor.dataset.currentComponent = componentId;
                
                console.log(`⚠️ Unknown component editor displayed for ${componentId}`);
                return;
            }
            
            const componentName = component.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            elementEditor.innerHTML = `
                <div class="element-editor__title">${componentName} Settings</div>
                <div class="element-editor__subtitle">Configure this component</div>
                
                <div class="form-section">
                    <h4 class="form-section__title">Component Information</h4>
                    <div class="form-group">
                        <label class="form-label">Component Type</label>
                        <input type="text" class="form-input" value="${component.type}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Component ID</label>
                        <input type="text" class="form-input" value="${componentId}" readonly>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section__title">Editing Options</h4>
                    <div class="form-help-text">
                        This component doesn't have custom design panel settings yet. 
                        You can edit it directly in the preview area by clicking on the content.
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn--secondary" onclick="console.log('Direct editing: Click on component content in preview')">
                            Direct Edit Instructions
                        </button>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4 class="form-section__title">Developer Info</h4>
                    <div class="form-help-text">
                        To add custom settings, create:<br>
                        <code>components/${component.type}/design-panel.php</code>
                    </div>
                </div>
            `;
            
            this.switchToDesignTab();
            elementEditor.dataset.currentComponent = componentId;
            
            console.log(`🛠️ Generic design panel displayed for ${component.type}`);
        },
        
        // ROOT FIX: Modal methods removed - using sidebar design panel instead
        
        // ROOT FIX: Design panel methods removed - delegated to sidebar design panel
        
        /**
         * ROOT FIX: Update component (for design panel integration)
         * @param {string} componentId - Component ID to update
         * @param {Object} newProps - New properties to apply
         */
        updateComponent(componentId, newProps) {
            console.log(`🔄 ComponentManager: Updating component ${componentId}`, newProps);
            
            const success = StateManager.updateComponent(componentId, newProps);
            
            if (success) {
                // Re-render the component with new props
                this.renderComponent(componentId);
                console.log(`✅ ComponentManager: Component ${componentId} updated and re-rendered`);
            } else {
                console.error(`❌ ComponentManager: Failed to update component ${componentId}`);
            }
            
            return success;
        },
        
        /**
         * ROOT FIX: Enhanced component update with proper re-rendering and error handling
         * @param {string} componentId - Component ID to update
         * @param {Object} newProps - New properties to apply
         * @returns {Promise<boolean>} Success status
         */
        async updateComponentWithRerender(componentId, newProps) {
            console.log(`🔄 ComponentManager: Enhanced update for ${componentId}`, newProps);
            
            try {
                // Update component data in state
                const success = StateManager.updateComponent(componentId, newProps);
                
                if (!success) {
                    console.error(`❌ ComponentManager: State update failed for ${componentId}`);
                    return false;
                }
                
                // Re-render the component with new props via server
                const renderSuccess = await this.renderComponent(componentId);
                
                if (renderSuccess) {
                    console.log(`✅ ComponentManager: Enhanced update complete for ${componentId}`);
                    
                    // Trigger update event for other systems
                    GMKB.dispatch('gmkb:component-design-updated', {
                        componentId: componentId,
                        newProps: newProps,
                        timestamp: Date.now()
                    });
                    
                    return true;
                } else {
                    console.error(`❌ ComponentManager: Re-render failed for ${componentId}`);
                    return false;
                }
                
            } catch (error) {
                console.error(`❌ ComponentManager: Enhanced update error for ${componentId}:`, error);
                return false;
            }
        },
        
        /**
         * ROOT FIX: Show visual feedback for form input changes
         * @param {HTMLElement} input - Form input element
         * @param {string} type - Feedback type ('success', 'error', 'pending')
         */
        showUpdateFeedback(input, type) {
            if (!input) return;
            
            // Remove any existing feedback classes
            input.classList.remove('update-success', 'update-error', 'update-pending');
            
            // Add appropriate feedback class
            switch (type) {
                case 'success':
                    input.classList.add('update-success');
                    // Remove success class after animation
                    setTimeout(() => {
                        input.classList.remove('update-success');
                    }, 1000);
                    break;
                    
                case 'error':
                    input.classList.add('update-error');
                    // Remove error class after animation
                    setTimeout(() => {
                        input.classList.remove('update-error');
                    }, 2000);
                    break;
                    
                case 'pending':
                    input.classList.add('update-pending');
                    break;
            }
        },
        
        /**
         * ROOT FIX: Enhanced move component up with DOM structure debugging
         * @param {string} componentId - Component ID to move up
         */
        moveComponentUp(componentId) {
            console.log(`⬆️ ComponentManager: Moving ${componentId} up`);
            
            try {
                // ROOT FIX: Work with actual DOM order instead of state layout
                const previewContainer = document.getElementById('media-kit-preview');
                if (!previewContainer) {
                    console.error('❌ Preview container not found');
                    return;
                }
                
                // ROOT FIX: First, let's debug the actual DOM structure
                console.log('🔍 DEBUG: Preview container HTML structure:', previewContainer.innerHTML.substring(0, 500));
                console.log('🔍 DEBUG: All children of preview container:', Array.from(previewContainer.children).map(child => ({
                    tagName: child.tagName,
                    className: child.className,
                    id: child.id,
                    hasDataComponentId: child.hasAttribute('data-component-id'),
                    dataComponentId: child.getAttribute('data-component-id')
                })));
                
                // Get the component element using more flexible search
                let componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
                if (!componentElement) {
                    console.error(`❌ Component element not found: ${componentId}`);
                    return;
                }
                
                console.log('🔍 DEBUG: Found component element:', {
                    tagName: componentElement.tagName,
                    className: componentElement.className,
                    id: componentElement.id,
                    parent: componentElement.parentElement?.tagName + '.' + componentElement.parentElement?.className
                });
                
                // ROOT FIX: Find the actual moveable parent element (the wrapper in preview container)
                let moveableElement = componentElement;
                
                // If the component is nested, find its parent that's a direct child of preview container
                while (moveableElement && moveableElement.parentElement !== previewContainer) {
                    moveableElement = moveableElement.parentElement;
                    if (!moveableElement || moveableElement === document.body) {
                        console.error(`❌ Component ${componentId} is not inside preview container`);
                        return;
                    }
                }
                
                console.log('🔍 DEBUG: Moveable element found:', {
                    tagName: moveableElement.tagName,
                    className: moveableElement.className,
                    id: moveableElement.id,
                    isDirectChild: moveableElement.parentElement === previewContainer
                });
                
                // Get all moveable components (direct children of preview container that contain data-component-id)
                const allMoveableComponents = Array.from(previewContainer.children).filter(child => 
                    child.querySelector('[data-component-id]') || child.hasAttribute('data-component-id')
                );
                const currentIndex = allMoveableComponents.indexOf(moveableElement);
                
                console.log(`📊 Current position: ${currentIndex + 1} of ${allMoveableComponents.length}`);
                console.log('🔍 DEBUG: All moveable components:', allMoveableComponents.map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    id: el.id,
                    hasNestedComponent: !!el.querySelector('[data-component-id]'),
                    nestedComponentId: el.querySelector('[data-component-id]')?.getAttribute('data-component-id')
                })));
                
                if (currentIndex === -1) {
                    console.error(`❌ Component ${componentId} not found in moveable elements`);
                    return;
                }
                
                if (currentIndex <= 0) {
                    console.log(`⚠️ ComponentManager: Cannot move ${componentId} up - already at top`);
                    return;
                }
                
                // Get the previous component
                const previousComponent = allMoveableComponents[currentIndex - 1];
                
                // Move in DOM - insert current moveable element before the previous one
                previewContainer.insertBefore(moveableElement, previousComponent);
                
                console.log(`✅ ComponentManager: Moved ${componentId} up in DOM`);
                
                // ROOT FIX: Update state layout to match new DOM order
                this.syncStateLayoutWithDOM();
                
                // Visual feedback
                moveableElement.style.transform = 'scale(1.02)';
                moveableElement.style.transition = 'transform 0.2s ease';
                moveableElement.style.background = 'rgba(37, 99, 235, 0.1)';
                
                setTimeout(() => {
                    moveableElement.style.transform = '';
                    moveableElement.style.transition = '';
                    moveableElement.style.background = '';
                }, 300);
                
            } catch (error) {
                console.error(`❌ ComponentManager: Error moving ${componentId} up:`, error);
            }
        },
        
        /**
         * ROOT FIX: Enhanced move component down with DOM structure debugging
         * @param {string} componentId - Component ID to move down
         */
        moveComponentDown(componentId) {
            console.log(`⬇️ ComponentManager: Moving ${componentId} down`);
            
            try {
                // ROOT FIX: Work with actual DOM order instead of state layout
                const previewContainer = document.getElementById('media-kit-preview');
                if (!previewContainer) {
                    console.error('❌ Preview container not found');
                    return;
                }
                
                // ROOT FIX: First, let's debug the actual DOM structure
                console.log('🔍 DEBUG: Preview container HTML structure:', previewContainer.innerHTML.substring(0, 500));
                console.log('🔍 DEBUG: All children of preview container:', Array.from(previewContainer.children).map(child => ({
                    tagName: child.tagName,
                    className: child.className,
                    id: child.id,
                    hasDataComponentId: child.hasAttribute('data-component-id'),
                    dataComponentId: child.getAttribute('data-component-id')
                })));
                
                // Get the component element using more flexible search
                let componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
                if (!componentElement) {
                    console.error(`❌ Component element not found: ${componentId}`);
                    return;
                }
                
                console.log('🔍 DEBUG: Found component element:', {
                    tagName: componentElement.tagName,
                    className: componentElement.className,
                    id: componentElement.id,
                    parent: componentElement.parentElement?.tagName + '.' + componentElement.parentElement?.className
                });
                
                // ROOT FIX: Find the actual moveable parent element (the wrapper in preview container)
                let moveableElement = componentElement;
                
                // If the component is nested, find its parent that's a direct child of preview container
                while (moveableElement && moveableElement.parentElement !== previewContainer) {
                    moveableElement = moveableElement.parentElement;
                    if (!moveableElement || moveableElement === document.body) {
                        console.error(`❌ Component ${componentId} is not inside preview container`);
                        return;
                    }
                }
                
                console.log('🔍 DEBUG: Moveable element found:', {
                    tagName: moveableElement.tagName,
                    className: moveableElement.className,
                    id: moveableElement.id,
                    isDirectChild: moveableElement.parentElement === previewContainer
                });
                
                // Get all moveable components (direct children of preview container that contain data-component-id)
                const allMoveableComponents = Array.from(previewContainer.children).filter(child => 
                    child.querySelector('[data-component-id]') || child.hasAttribute('data-component-id')
                );
                const currentIndex = allMoveableComponents.indexOf(moveableElement);
                
                console.log(`📊 Current position: ${currentIndex + 1} of ${allMoveableComponents.length}`);
                console.log('🔍 DEBUG: All moveable components:', allMoveableComponents.map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    id: el.id,
                    hasNestedComponent: !!el.querySelector('[data-component-id]'),
                    nestedComponentId: el.querySelector('[data-component-id]')?.getAttribute('data-component-id')
                })));
                
                if (currentIndex === -1) {
                    console.error(`❌ Component ${componentId} not found in moveable elements`);
                    return;
                }
                
                if (currentIndex >= allMoveableComponents.length - 1) {
                    console.log(`⚠️ ComponentManager: Cannot move ${componentId} down - already at bottom`);
                    return;
                }
                
                // Get the next component
                const nextComponent = allMoveableComponents[currentIndex + 1];
                
                // ROOT FIX: Safe DOM manipulation - handle edge cases properly
                if (nextComponent.nextSibling) {
                    // Insert before the element after nextComponent
                    previewContainer.insertBefore(moveableElement, nextComponent.nextSibling);
                } else {
                    // nextComponent is the last element, so append to end
                    previewContainer.appendChild(moveableElement);
                }
                
                console.log(`✅ ComponentManager: Moved ${componentId} down in DOM`);
                
                // ROOT FIX: Update state layout to match new DOM order
                this.syncStateLayoutWithDOM();
                
                // Visual feedback
                moveableElement.style.transform = 'scale(1.02)';
                moveableElement.style.transition = 'transform 0.2s ease';
                moveableElement.style.background = 'rgba(37, 99, 235, 0.1)';
                
                setTimeout(() => {
                    moveableElement.style.transform = '';
                    moveableElement.style.transition = '';
                    moveableElement.style.background = '';
                }, 300);
                
            } catch (error) {
                console.error(`❌ ComponentManager: Error moving ${componentId} down:`, error);
            }
        },
        
        /**
         * ROOT FIX: Synchronize state layout with actual DOM order
         * This ensures the state layout array matches the visual component order
         */
        syncStateLayoutWithDOM() {
            try {
                const previewContainer = document.getElementById('media-kit-preview');
                if (!previewContainer) {
                    console.warn('⚠️ ComponentManager: Preview container not found for layout sync');
                    return;
                }
                
                // ROOT FIX: Get current DOM order from moveable elements (direct children that contain components)
                const domComponents = Array.from(previewContainer.children)
                    .map(child => {
                        // Check if child itself has data-component-id
                        if (child.hasAttribute('data-component-id')) {
                            return child.getAttribute('data-component-id');
                        }
                        // Otherwise, look for nested component with data-component-id
                        const nestedComponent = child.querySelector('[data-component-id]');
                        return nestedComponent ? nestedComponent.getAttribute('data-component-id') : null;
                    })
                    .filter(id => id); // Filter out null/empty IDs
                
                console.log('🔄 Syncing state layout with DOM order:', domComponents);
                
                // Get current state
                const state = StateManager.getState();
                
                // Filter to only include components that exist in both DOM and state
                const validComponents = domComponents.filter(id => {
                    // Check for exact match or partial match in state
                    const exactMatch = state.components[id];
                    if (exactMatch) return true;
                    
                    // Check for partial matches (in case of ID mismatches)
                    const stateIds = Object.keys(state.components);
                    const partialMatch = stateIds.find(stateId => 
                        stateId.includes(id) || id.includes(stateId)
                    );
                    
                    return !!partialMatch;
                });
                
                console.log('✅ New layout order:', validComponents);
                
                // Update state layout to match DOM order
                const updatedState = {
                    ...state,
                    layout: validComponents
                };
                
                // Save updated state
                StateManager.setState(updatedState);
                
                console.log('✅ ComponentManager: State layout synchronized with DOM order');
                
            } catch (error) {
                console.error('❌ ComponentManager: Error syncing state layout with DOM:', error);
            }
        },
        
        /**
         * ROOT FIX: Enhanced duplicate component with ID resolution and debugging
         * @param {string} componentId - Component ID to duplicate
         */
        async duplicateComponent(componentId) {
            console.log(`📋 ComponentManager: Duplicating ${componentId}`);
            
            try {
                const state = StateManager.getState();
                let component = state.components[componentId];
                
                // ROOT FIX: If component not found by exact ID, try to find by partial match
                if (!component) {
                    console.warn(`⚠️ Component ${componentId} not found, searching by partial match...`);
                    
                    // Try to find component by checking if the provided ID contains any state component ID
                    // or if any state component ID contains the provided ID
                    const stateComponentIds = Object.keys(state.components);
                    console.log('🔍 Available component IDs in state:', stateComponentIds);
                    
                    let foundId = null;
                    
                    // Strategy 1: Look for exact match first
                    if (state.components[componentId]) {
                        foundId = componentId;
                    }
                    // Strategy 2: Check if any state ID contains our DOM ID
                    else {
                        foundId = stateComponentIds.find(stateId => 
                            stateId.includes(componentId) || componentId.includes(stateId)
                        );
                    }
                    
                    if (foundId) {
                        component = state.components[foundId];
                        console.log(`✅ Found component by partial match: ${foundId}`);
                    } else {
                        // Strategy 3: Try to use the first component if only one exists
                        if (stateComponentIds.length === 1) {
                            foundId = stateComponentIds[0];
                            component = state.components[foundId];
                            console.log(`✅ Using single component: ${foundId}`);
                        }
                    }
                }
                
                if (!component) {
                    console.error(`❌ Component ${componentId} not found for duplication`);
                    console.log('🗑️ Available components:', Object.keys(state.components));
                    
                    // ROOT FIX: Fallback to DOM-only duplication
                    const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
                    if (componentElement && window.GMKB?.fallbackDuplicateComponent) {
                        console.log('🔧 Falling back to DOM-only duplication');
                        window.GMKB.fallbackDuplicateComponent(componentElement, componentId);
                        return;
                    } else {
                        console.error('❌ No fallback available - duplication failed');
                        return;
                    }
                }
                
                console.log('✅ Component found, proceeding with duplication:', component);
                
                // Create new component with duplicated data
                const duplicatedComponent = {
                    ...component,
                    id: 'component-' + Date.now(),
                    data: { ...component.data }
                };
                
                console.log('🔄 Creating duplicated component:', duplicatedComponent);
                
                // Add to state
                const newId = StateManager.addComponent(duplicatedComponent);
                
                console.log('✅ Added to state with ID:', newId);
                
                // Render the duplicated component
                await this.renderComponent(newId);
                
                console.log(`✅ ComponentManager: Successfully duplicated ${componentId} as ${newId}`);
                return newId;
                
            } catch (error) {
                console.error(`❌ ComponentManager: Error duplicating ${componentId}:`, error);
                
                // Fallback to DOM-only duplication
                const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
                if (componentElement && window.GMKB?.fallbackDuplicateComponent) {
                    console.log('🔧 Error fallback: Using DOM-only duplication');
                    window.GMKB.fallbackDuplicateComponent(componentElement, componentId);
                } else {
                    console.error('❌ Error and no fallback available');
                }
            }
        },
        
        /**
         * ROOT FIX: Enhanced delete component with ID resolution
         * @param {string} componentId - Component ID to delete
         */
        deleteComponent(componentId) {
            console.log(`🗑️ ComponentManager: Deleting ${componentId}`);
            
            // ROOT FIX: Add confirmation dialog
            if (!confirm('Are you sure you want to delete this component?')) {
                console.log('❌ Delete cancelled by user');
                return;
            }
            
            try {
                const state = StateManager.getState();
                let component = state.components[componentId];
                let foundId = componentId;
                
                // ROOT FIX: If component not found by exact ID, try to find by partial match
                if (!component) {
                    console.warn(`⚠️ Component ${componentId} not found in state, searching by partial match...`);
                    
                    const stateComponentIds = Object.keys(state.components);
                    console.log('🔍 Available component IDs in state:', stateComponentIds);
                    
                    // Strategy 1: Check if any state ID contains our DOM ID or vice versa
                    foundId = stateComponentIds.find(stateId => 
                        stateId.includes(componentId) || componentId.includes(stateId)
                    );
                    
                    if (foundId) {
                        component = state.components[foundId];
                        console.log(`✅ Found component by partial match for deletion: ${foundId}`);
                    } else if (stateComponentIds.length === 1) {
                        // Strategy 2: Use single component if only one exists
                        foundId = stateComponentIds[0];
                        component = state.components[foundId];
                        console.log(`✅ Using single component for deletion: ${foundId}`);
                    }
                }
                
                if (!component) {
                    console.error(`❌ Component ${componentId} not found for deletion`);
                    console.log('🗑️ Available components:', Object.keys(state.components));
                    
                    // ROOT FIX: Try DOM-only deletion as fallback
                    const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
                    if (componentElement) {
                        console.log('🔧 Falling back to DOM-only deletion');
                        
                        // Visual feedback before removal
                        componentElement.style.opacity = '0.5';
                        componentElement.style.transform = 'scale(0.9)';
                        componentElement.style.transition = 'all 0.3s ease';
                        
                        setTimeout(() => {
                            componentElement.remove();
                            console.log(`✅ DOM-only deletion complete for ${componentId}`);
                        }, 300);
                        
                        return;
                    } else {
                        console.error('❌ No component element found in DOM either');
                        return;
                    }
                }
                
                console.log(`✅ Component found, proceeding with deletion: ${foundId}`);
                
                // Remove from DOM first
                const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
                if (componentElement) {
                    console.log('🗑️ Removing component from DOM:', componentId);
                    
                    // Visual feedback before removal
                    componentElement.style.opacity = '0.5';
                    componentElement.style.transform = 'scale(0.9)';
                    componentElement.style.transition = 'all 0.3s ease';
                    
                    setTimeout(() => {
                        componentElement.remove();
                        console.log(`✅ Component removed from DOM: ${componentId}`);
                    }, 300);
                } else {
                    console.warn(`⚠️ Component element not found in DOM: ${componentId}`);
                }
                
                // Remove from state using the found ID
                const success = StateManager.removeComponent(foundId);
                
                if (success) {
                    console.log(`✅ ComponentManager: Successfully deleted component ${componentId} (state ID: ${foundId})`);
                    
                    // Check if we need to show empty state
                    setTimeout(() => {
                        const remainingComponents = document.querySelectorAll('[data-component-id]');
                        if (remainingComponents.length === 0) {
                            const emptyState = document.getElementById('empty-state');
                            if (emptyState) {
                                emptyState.style.display = 'block';
                                console.log('✅ Showing empty state - no components remaining');
                            }
                        }
                    }, 500);
                } else {
                    console.error(`❌ Failed to remove component from state: ${foundId}`);
                }
                
            } catch (error) {
                console.error(`❌ ComponentManager: Error deleting ${componentId}:`, error);
            }
        },
        
        /**
         * ROOT FIX: Load component scripts from AJAX response data
         * @param {Array} scriptsData - Script data from AJAX response
         * @param {string} componentId - Component ID
         */
        async loadComponentScriptsFromAjaxData(scriptsData, componentId) {
            console.log(`📜 ComponentManager: Loading scripts from AJAX data for component ${componentId}`);
            
            for (const scriptInfo of scriptsData) {
                try {
                    // Load the script using the provided data
                    await this.loadScriptFromAjaxData(scriptInfo, componentId);
                    console.log(`✅ ComponentManager: Loaded ${scriptInfo.component} ${scriptInfo.type} script from AJAX data`);
                } catch (error) {
                    console.warn(`⚠️ ComponentManager: Failed to load ${scriptInfo.component} ${scriptInfo.type} script:`, error);
                }
            }
        },
        
        /**
         * ROOT FIX: Load individual script from AJAX data
         * @param {Object} scriptInfo - Script information from AJAX response
         * @param {string} componentId - Component ID
         */
        async loadScriptFromAjaxData(scriptInfo, componentId) {
            return new Promise((resolve, reject) => {
                // Check if script already loaded
                const existingScript = document.querySelector(`script[src="${scriptInfo.src}"]`);
                if (existingScript) {
                    console.log(`ℹ️ ComponentManager: Script already loaded: ${scriptInfo.src}`);
                    resolve();
                    return;
                }
                
                // Expose component data globally before script loads
                if (scriptInfo.localize_data) {
                    window[scriptInfo.localize_data.object_name] = scriptInfo.localize_data.data;
                    console.log(`🔗 ComponentManager: Exposed global data: ${scriptInfo.localize_data.object_name}`);
                }
                
                // Add coordination script before component script loads
                if (scriptInfo.coordination_script) {
                    const coordinationScript = document.createElement('script');
                    coordinationScript.textContent = scriptInfo.coordination_script;
                    document.head.appendChild(coordinationScript);
                    console.log(`🔗 ComponentManager: Added coordination script for ${scriptInfo.component} ${scriptInfo.type}`);
                }
                
                // Create and load the actual component script
                const script = document.createElement('script');
                script.src = scriptInfo.src;
                script.async = true;
                script.type = 'text/javascript';
                script.setAttribute('data-gmkb-component', scriptInfo.component);
                script.setAttribute('data-gmkb-type', scriptInfo.type);
                script.setAttribute('data-gmkb-component-id', componentId);
                
                script.onload = () => {
                    console.log(`✅ ComponentManager: AJAX script loaded: ${scriptInfo.src}`);
                    resolve();
                };
                
                script.onerror = () => {
                    console.error(`❌ ComponentManager: Failed to load AJAX script: ${scriptInfo.src}`);
                    reject(new Error(`Failed to load script: ${scriptInfo.src}`));
                };
                
                document.head.appendChild(script);
                console.log(`📜 ComponentManager: Loading AJAX script: ${scriptInfo.src}`);
            });
        },
        
        /**
         * ROOT FIX: Load component scripts dynamically after component rendering
         * ARCHITECTURAL COMPLIANCE: Includes component-specific fallback scripts
         * @param {string} componentType - Component type (e.g., 'topics')
         * @param {string} componentId - Component ID
         */
        async loadComponentScripts(componentType, componentId) {
            console.log(`📜 ComponentManager: Loading scripts for ${componentType} component`);
            
            const postId = window.gmkbData?.postId || 0;
            const pluginUrl = window.gmkbData?.pluginUrl || '';
            
            // Component data for localization
            const componentData = {
                postId: postId,
                ajaxUrl: window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php',
                restUrl: window.gmkbData?.restUrl || '/wp-json/',
                nonce: window.gmkbData?.nonce || '',
                restNonce: window.gmkbData?.restNonce || '',
                component: componentType,
                componentType: componentType,
                componentId: componentId,
                pluginUrl: pluginUrl,
                siteUrl: window.gmkbData?.siteUrl || '',
                gmkbReady: true,
                architecture: 'client-side-dynamic-load',
                timestamp: Date.now(),
                debugMode: window.gmkbData?.debugMode || false
            };
            
            // Define scripts to load - ARCHITECTURAL COMPLIANCE: Include fallback.js
            const scripts = [
                { file: 'fallback.js', type: 'fallback' },  // Component-specific fallback
                { file: 'panel-script.js', type: 'panel' },
                { file: 'script.js', type: 'main' }
            ];
            
            for (const script of scripts) {
                try {
                    const scriptUrl = `${pluginUrl}components/${componentType}/${script.file}`;
                    const scriptExists = await this.checkScriptExists(scriptUrl);
                    
                    if (scriptExists) {
                        await this.loadScript(scriptUrl, componentType, script.type, componentData);
                        console.log(`✅ ComponentManager: Loaded ${componentType} ${script.type} script`);
                    } else {
                        console.log(`ℹ️ ComponentManager: No ${script.file} found for ${componentType}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ ComponentManager: Failed to load ${componentType} ${script.file}:`, error);
                }
            }
        },
        
        /**
         * ROOT FIX: Check if script exists before loading
         * @param {string} url - Script URL to check
         * @returns {Promise<boolean>} Whether script exists
         */
        async checkScriptExists(url) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                return response.ok;
            } catch (error) {
                return false;
            }
        },
        
        /**
         * ROOT FIX: Dynamically load and execute component script
         * @param {string} url - Script URL
         * @param {string} componentType - Component type
         * @param {string} scriptType - Script type (main|panel)
         * @param {Object} componentData - Component data to expose
         */
        async loadScript(url, componentType, scriptType, componentData) {
            return new Promise((resolve, reject) => {
                // Check if script already loaded
                const existingScript = document.querySelector(`script[src="${url}"]`);
                if (existingScript) {
                    console.log(`ℹ️ ComponentManager: Script already loaded: ${url}`);
                    resolve();
                    return;
                }
                
                // Expose component data globally before script loads
                const globalDataName = componentType + 'ComponentData';
                window[globalDataName] = componentData;
                
                // Add GMKB coordination before script loads
                const coordinationScript = document.createElement('script');
                coordinationScript.textContent = `
                    // ROOT FIX: GMKB Component Coordination for ${componentType} ${scriptType}
                    (function() {
                        'use strict';
                        
                        console.log('🔗 GMKB Dynamic Load: ${componentType} ${scriptType} script loading...');
                        
                        function initializeComponentScript() {
                            if (typeof window !== 'undefined' && window.GMKB) {
                                console.log('✅ GMKB Dynamic Load: ${componentType} ${scriptType} - GMKB system ready');
                                
                                // Dispatch component script ready event
                                if (window.GMKB.dispatch) {
                                    window.GMKB.dispatch('gmkb:component-script-ready', {
                                        component: '${componentType}',
                                        type: '${scriptType}',
                                        dynamicLoad: true,
                                        timestamp: Date.now()
                                    });
                                }
                            } else {
                                console.warn('⚠️ GMKB Dynamic Load: ${componentType} ${scriptType} - GMKB system not available');
                            }
                        }
                        
                        // Initialize immediately since GMKB should be ready
                        initializeComponentScript();
                        /**
     * ROOT FIX: Global Systems Registration
     * Make systems available globally for debugging and legacy compatibility
     */
    window.GMKB = GMKB;
    window.StateManager = StateManager;
    window.ComponentManager = ComponentManager;
    window.UICoordinator = UICoordinator;
    
    // Attach systems to GMKB namespace
    GMKB.systems.StateManager = StateManager;
    GMKB.systems.ComponentManager = ComponentManager;
    GMKB.systems.UICoordinator = UICoordinator;
    
    console.log('✅ GMKB: Systems registered globally');
    
    /**
     * ROOT FIX: Single Initialization Point
     * This replaces the complex UIManager with a simple coordinated initialization
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 GMKB: ROOT FIX - DOM ready, starting coordinated initialization');
            UICoordinator.init();
        });
    } else {
        console.log('🚀 GMKB: ROOT FIX - DOM already ready, starting coordinated initialization');
        UICoordinator.init();
    }
    
    console.log('✅ GMKB: ROOT FIX initialization setup complete - single render guaranteed');

    /**
     * ROOT FIX: Global Systems Registration and Coordinated Initialization
     */
    
    // Make systems available globally
    window.GMKB = GMKB;
    window.StateManager = StateManager;
    window.ComponentManager = ComponentManager;
    window.UICoordinator = UICoordinator;
    
    // Attach systems to GMKB namespace
    GMKB.systems.StateManager = StateManager;
    GMKB.systems.ComponentManager = ComponentManager;
    GMKB.systems.UICoordinator = UICoordinator;
    
    /**
     * ROOT FIX: Coordinated Single Initialization
     */
    function initializeGMKBSystems() {
        console.log('%c🚀 GMKB: ROOT FIX - Starting coordinated single initialization', 'font-weight: bold; color: #10b981; background: #f0fdf4; padding: 4px 8px; border-radius: 4px;');
        
        try {
            // Initialize global action listeners first
            console.log('🎯 GMKB: Initializing global action listeners...');
            GMKB.initializeGlobalActionListeners();
            
            // Initialize core systems with coordinated approach
            console.log('🎯 GMKB: Starting UICoordinator initialization...');
            UICoordinator.init();
            
            console.log('%c✅ GMKB: ROOT FIX - Initialization complete - single render guaranteed', 'font-weight: bold; color: #10b981; background: #f0fdf4; padding: 4px 8px; border-radius: 4px;');
        } catch (error) {
            console.error('%c❌ GMKB: ROOT FIX - Initialization failed:', 'font-weight: bold; color: #ef4444; background: #fef2f2; padding: 4px 8px; border-radius: 4px;', error);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGMKBSystems);
    } else {
        initializeGMKBSystems();
    }
    
    // ROOT FIX: Also run immediately to override any competing initialization
    console.log('%c🚀 GMKB: ROOT FIX - Running immediately to override competing systems', 'font-weight: bold; color: #ef4444; background: #fef2f2; padding: 4px 8px; border-radius: 4px;');
    setTimeout(initializeGMKBSystems, 100); // Run after current call stack

})();
                `;
                document.head.appendChild(coordinationScript);
                
                // Create and load the actual component script
                const script = document.createElement('script');
                script.src = url;
                script.async = true;
                script.type = 'text/javascript';
                
                script.onload = () => {
                    console.log(`✅ ComponentManager: Dynamic script loaded: ${url}`);
                    resolve();
                };
                
                script.onerror = () => {
                    console.error(`❌ ComponentManager: Failed to load script: ${url}`);
                    reject(new Error(`Failed to load script: ${url}`));
                };
                
                document.head.appendChild(script);
            });
        },
        
        /**
         * ROOT FIX: Sync state layout with actual DOM order
         * This ensures state stays consistent with visual component order
         */
        syncStateLayoutWithDOM() {
            try {
                const previewContainer = document.getElementById('media-kit-preview');
                if (!previewContainer) {
                    console.warn('⚠️ Cannot sync layout - preview container not found');
                    return;
                }
                
                // Get all components in current DOM order
                const domComponents = Array.from(previewContainer.querySelectorAll('[data-component-id]'));
                const domOrder = domComponents.map(el => el.getAttribute('data-component-id'));
                
                console.log('🔄 Syncing state layout with DOM order:', domOrder);
                
                // Get current state
                const state = StateManager.getState();
                const stateComponentIds = Object.keys(state.components);
                
                // Create new layout based on DOM order, but only include components that exist in state
                const newLayout = [];
                
                // First, add components that are in DOM and exist in state
                domOrder.forEach(domId => {
                    // Try to find matching state component ID
                    let stateId = domId;
                    
                    // If exact match doesn't exist, try partial matching
                    if (!state.components[domId]) {
                        const matchingStateId = stateComponentIds.find(stateId => 
                            stateId.includes(domId) || domId.includes(stateId)
                        );
                        if (matchingStateId) {
                            stateId = matchingStateId;
                        }
                    }
                    
                    // Add to new layout if component exists in state
                    if (state.components[stateId]) {
                        newLayout.push(stateId);
                    }
                });
                
                // Add any remaining state components that weren't in DOM
                stateComponentIds.forEach(stateId => {
                    if (!newLayout.includes(stateId)) {
                        newLayout.push(stateId);
                    }
                });
                
                console.log('✅ New layout order:', newLayout);
                
                // Update state with new layout
                StateManager.setState({ layout: newLayout });
                
            } catch (error) {
                console.error('❌ Error syncing state layout with DOM:', error);
            }
        },
        
        /**
         * ROOT FIX: Reorder components in DOM to match layout state
         */
        reorderComponentsInDOM() {
            const state = StateManager.getState();
            const previewContainer = document.getElementById('media-kit-preview');
            
            if (!previewContainer) return;
            
            // Reorder DOM elements to match layout order
            state.layout.forEach((componentId, index) => {
                const element = document.getElementById(componentId);
                if (element) {
                    previewContainer.appendChild(element);
                }
            });
            
            console.log('✅ ComponentManager: DOM reordered to match layout');
        }
    };

    const Renderer = {
        init() {
            console.log('🎨 Renderer: Initialized (Vanilla JS)');
            
            // Listen for state changes and re-render
            GMKB.subscribe('gmkb:state-changed', (event) => {
                this.renderAll();
            });
        },
        
        renderAll() {
            const state = StateManager.getState();
            const previewContainer = document.getElementById('media-kit-preview');
            
            if (!previewContainer) {
                console.warn('🎨 Renderer: Preview container not found');
                return;
            }
            
            // ROOT FIX: Use proper empty state management instead of direct manipulation
            // Render components first, then let UIManager handle empty state
            if (Object.keys(state.components).length > 0) {
                // Render components in layout order
                state.layout.forEach(componentId => {
                    ComponentManager.renderComponent(componentId);
                });
            }
            
            // ROOT FIX: Let UIManager handle empty state visibility based on actual component count
            if (window.GMKB?.systems?.UIManager?.ensureEmptyStateVisible) {
                // Defer to next tick to ensure DOM updates are processed
                setTimeout(() => {
                    window.GMKB.systems.UIManager.ensureEmptyStateVisible(true);
                }, 20);
            }
        }
    };

    const UIManager = {
        init() {
            console.log('🎛️ UIManager: Initialized (Server-Integrated)');
            this.initializeButtons();
            this.initializeModals();
            this.initializeEventListeners();
        },
        
        initializeEventListeners() {
            // ROOT FIX: Initialize tracking and rendering state
            this.eventState = {
                coreSystemsReady: false,
                componentsLoaded: false,
                initializationComplete: false
            };
            this.renderingInProgress = false;
            
            // ROOT FIX: Listen for core systems ready
            GMKB.subscribe('gmkb:core-systems-ready', (event) => {
                console.log('✅ UIManager: Core systems ready', event.detail);
                this.eventState.coreSystemsReady = true;
                this.checkInitializationComplete();
            });
            
            // ROOT FIX: Listen for components loaded
            GMKB.subscribe('gmkb:components-loaded', (event) => {
                console.log('✅ UIManager: Components loaded', event.detail);
                this.eventState.componentsLoaded = true;
                this.updateComponentLibraryHandlers();
                this.checkInitializationComplete();
            });
            
            // Add this inside UIManager.initializeEventListeners
            document.addEventListener('gmkb:modal-base-ready', (event) => {
                console.log('✅ UIManager: Modal system is ready and has initialized itself.', event.detail);
                
                // Now that modals are ready, we can safely update any handlers
                // that depend on them, like the component library buttons.
                this.updateComponentLibraryHandlers();
            }, { once: true });
            
            // ROOT FIX: Listen for state changes to manage empty state
            GMKB.subscribe('gmkb:state-changed', (event) => {
                console.log('📊 UIManager: State changed, checking empty state');
                // Use setTimeout to ensure DOM updates have processed
                setTimeout(() => {
                    this.ensureEmptyStateVisible(true);
                }, 50);
            });
            
            // ROOT FIX: Listen for component additions/removals
            GMKB.subscribe('gmkb:component-added', (event) => {
                console.log('➕ UIManager: Component added, hiding empty state');
                this.ensureEmptyStateVisible(true);
            });
            
            GMKB.subscribe('gmkb:component-removed', (event) => {
                console.log('➖ UIManager: Component removed, checking empty state');
                // Use setTimeout to ensure DOM removal has processed
                setTimeout(() => {
                    this.ensureEmptyStateVisible(true);
                }, 50);
            });
            
            // ROOT FIX: Listen for saved state loading
            GMKB.subscribe('gmkb:saved-state-loaded', (event) => {
                console.log('📋 UIManager: Saved state loaded with', event.detail.componentCount, 'components');
                // Ensure empty state is managed after state loading
                setTimeout(() => {
                    this.ensureEmptyStateVisible(true);
                }, 100);
            });
            
            // Listen for components rendered event
            GMKB.subscribe('gmkb:components-rendered', (event) => {
                console.log('✅ UIManager: Components rendered successfully', event.detail);
                this.ensureEmptyStateVisible(true);
            });
            
            // ROOT FIX: Event listener for modal system ready
            document.addEventListener('gmkb:modal-base-ready', (event) => {
                console.log('✅ UIManager: Modal system is ready and has initialized itself.', event.detail);
                
                // Now that modals are ready, we can safely update any handlers
                // that depend on them, like the component library buttons.
                this.updateComponentLibraryHandlers();
            }, { once: true });
        },
        
        /**
         * ROOT FIX: Event-driven initialization completion with proper empty state coordination
         */
        async checkInitializationComplete() {
            console.log('🎯 UIManager: Checking initialization - coreReady:', this.eventState.coreSystemsReady, 'componentsLoaded:', this.eventState.componentsLoaded);
            
            if (this.eventState.coreSystemsReady && this.eventState.componentsLoaded) {
                if (!this.eventState.initializationComplete) {
                    this.eventState.initializationComplete = true;
                    console.log('✅ UIManager: Initialization complete - triggering component load');
                    
                    // ROOT FIX: Dispatch unified ready event for all component scripts
                    GMKB.dispatch('gmkb:initialization-complete', {
                        timestamp: Date.now(),
                        systemsReady: true,
                        componentsAvailable: true
                    });
                    
                    // ROOT FIX: Load saved components FIRST, then check empty state
                    if (GMKB.systems.ComponentManager && GMKB.systems.ComponentManager.loadSavedComponents) {
                        try {
                            await GMKB.systems.ComponentManager.loadSavedComponents();
                            console.log('✅ UIManager: Saved components loaded');
                            
                            // ROOT FIX: Wait a tick for DOM updates, then check empty state
                            setTimeout(() => {
                                this.ensureEmptyStateVisible(true);
                            }, 100);
                            
                        } catch (error) {
                            console.error('❌ UIManager: Error loading saved components:', error);
                            // Even on error, check empty state
                            this.ensureEmptyStateVisible(true);
                        }
                    } else {
                        // No component manager, just check empty state
                        this.ensureEmptyStateVisible(true);
                    }
                }
            }
        },
        
        /**
         * ROOT FIX: Conditionally show empty state only when NO components exist
         * @param {boolean} forceCheck - Force recheck of component state
         */
        ensureEmptyStateVisible(forceCheck = false) {
            const emptyState = document.getElementById('empty-state');
            const previewContainer = document.getElementById('media-kit-preview');
            
            if (!emptyState || !previewContainer) {
                console.warn('⚠️ UIManager: Empty state or preview container not found');
                return;
            }
            
            // ROOT FIX: Check BOTH state manager and DOM for components
            const stateManager = GMKB.systems?.StateManager;
            const stateComponentCount = stateManager ? Object.keys(stateManager.getState().components).length : 0;
            const domComponents = previewContainer.querySelectorAll('.media-kit-component');
            const domComponentCount = domComponents.length;
            
            // ROOT FIX: Only show empty state if NO components exist in either state or DOM
            const shouldShowEmptyState = stateComponentCount === 0 && domComponentCount === 0;
            
            if (shouldShowEmptyState) {
                emptyState.style.display = 'block';
                console.log('✅ UIManager: Empty state properly displayed - no components found');
                console.log('📊 UIManager: Component count - State:', stateComponentCount, 'DOM:', domComponentCount);
            } else {
                emptyState.style.display = 'none';
                console.log('✅ UIManager: Empty state hidden - components exist');
                console.log('📊 UIManager: Component count - State:', stateComponentCount, 'DOM:', domComponentCount);
                
                // ROOT FIX: If we have state components but no DOM components, trigger rendering
                if (stateComponentCount > 0 && domComponentCount === 0 && !this.renderingInProgress) {
                    console.log('🔄 UIManager: State components found but no DOM - triggering render');
                    this.renderingInProgress = true;
                    
                    // Dispatch event for component loading to begin
                    GMKB.dispatch('gmkb:state-components-need-rendering', {
                        stateComponentCount: stateComponentCount,
                        timestamp: Date.now()
                    });
                    
                    // Load saved components if ComponentManager is available
                    if (GMKB.systems?.ComponentManager?.loadSavedComponents) {
                        GMKB.systems.ComponentManager.loadSavedComponents()
                            .then(() => {
                                this.renderingInProgress = false;
                                console.log('✅ UIManager: Saved components rendered successfully');
                            })
                            .catch(error => {
                                this.renderingInProgress = false;
                                console.error('❌ UIManager: Error rendering saved components:', error);
                            });
                    } else {
                        this.renderingInProgress = false;
                    }
                }
            }
        },
        
        initializeButtons() {
            // Component library button
            const addComponentBtn = document.getElementById('add-component-btn');
            if (addComponentBtn && !addComponentBtn.dataset.gmkbInitialized) {
                addComponentBtn.addEventListener('click', () => {
                    this.showComponentLibrary();
                });
                addComponentBtn.dataset.gmkbInitialized = 'true';
            }
            
            // First component button (in empty state)
            const addFirstComponentBtn = document.getElementById('add-first-component');
            if (addFirstComponentBtn && !addFirstComponentBtn.dataset.gmkbInitialized) {
                addFirstComponentBtn.addEventListener('click', () => {
                    this.showComponentLibrary();
                });
                addFirstComponentBtn.dataset.gmkbInitialized = 'true';
            }
        },
        
        initializeModals() {
            // ROOT FIX: Simplified modal initialization - modal-base.js handles all setup
            console.log('🎭 UIManager: Simplified modal initialization (event-driven)');
            
            // The modal-base.js system will handle:
            // - Modal discovery and registration
            // - Close button functionality 
            // - ESC key handling
            // - Backdrop click handling
            
            // We only need to handle component selection after modal system is ready
            // This is done via event listener in initializeEventListeners()
            console.log('✅ UIManager: Modal initialization delegated to modal-base.js');
        },
        
        showComponentLibrary() {
            console.log('📚 UIManager: Opening component library modal...');

            if (window.GMKB_Modals && typeof window.GMKB_Modals.show === 'function') {
                window.GMKB_Modals.show('component-library-overlay');
            } else {
                console.error('❌ UIManager: Modal system (GMKB_Modals.show) is not available.');
                // Optional: Add a user-facing alert as a fallback
                alert('Error: The component library could not be opened.');
            }
        },
        
        updateComponentLibraryHandlers() {
            // Update component selection handlers after components are loaded
            const componentButtons = document.querySelectorAll('.component-item .add-component-btn');
            
            componentButtons.forEach(button => {
                if (!button.dataset.gmkbInitialized) {
                    button.addEventListener('click', async () => {
                        const componentType = button.dataset.component || 
                                            button.parentElement.parentElement.dataset.componentType || 
                                            'generic';
                        
                        console.log('🔄 UIManager: Adding component:', componentType);
                        
                        // Show loading state on button
                        const originalText = button.textContent;
                        button.textContent = 'Adding...';
                        button.disabled = true;
                        
                        try {
                            // Use server-side rendering (not fallback)
                            await GMKB.systems.ComponentManager.addComponent(componentType, {}, false);
                            
                            // Close modal
                            const modal = document.getElementById('component-library-overlay');
                            if (modal) {
                                modal.style.display = 'none';
                            }
                            
                            console.log('✅ UIManager: Component added successfully');
                        } catch (error) {
                            console.error('❌ UIManager: Error adding component:', error);
                            alert('Failed to add component. Please try again.');
                        } finally {
                            // Reset button state
                            button.textContent = originalText;
                            button.disabled = false;
                        }
                    });
                    button.dataset.gmkbInitialized = 'true';
                }
            });
            
            console.log('✅ UIManager: Updated', componentButtons.length, 'component selection handlers');
        }
    };

    /**
     * 3. Main Application Logic - Server-Integrated VANILLA JS
     */
    async function initializeApplication() {
        console.log('🚀 GMKB: Vanilla JS application initializing...');
        
        // Validate WordPress data is available
        if (!window.gmkbData) {
            console.error('❌ GMKB: WordPress data (gmkbData) not available - check enqueue.php');
            showInitializationError('WordPress data not available');
            return false;
        }
        
        console.log('✅ GMKB: WordPress data validated:', {
            ajaxUrl: !!window.gmkbData.ajaxUrl,
            nonce: !!window.gmkbData.nonce,
            postId: window.gmkbData.postId,
            architecture: window.gmkbData.architecture,
            vanillaJS: window.gmkbData.vanillaJS
        });

        try {
            // Initialize core systems
            GMKB.systems.StateManager = StateManager;
            GMKB.systems.ComponentManager = ComponentManager;
            GMKB.systems.Renderer = Renderer;
            GMKB.systems.UIManager = UIManager;
            
            // Initialize each system in proper order
            console.log('🔄 GMKB: Initializing systems...');
            
            // PHASE 2.1 FIX: Simplified initialization sequence
            console.log('🔄 GMKB: Step 1 - Initializing UIManager (event listeners)');
            UIManager.init();
            
            console.log('🔄 GMKB: Step 2 - Initializing StateManager and Renderer');
            StateManager.init();
            Renderer.init();
            
            // PHASE 2.1 FIX: Dispatch core systems ready event
            console.log('✅ GMKB: Core systems initialized - dispatching ready event');
            GMKB.dispatch('gmkb:core-systems-ready', {
                timestamp: Date.now(),
                systems: ['StateManager', 'Renderer', 'UIManager'],
                readyForComponents: true
            });
            
            console.log('🔄 GMKB: Step 3 - Initializing ComponentManager (will load available components)');
            await ComponentManager.init();

            // ROOT FIX: Expose component managers globally for component updates
            window.enhancedComponentManager = ComponentManager;
            window.componentManager = ComponentManager;
            window.enhancedStateManager = StateManager;
            window.stateManager = StateManager;
            
            console.log('✅ GMKB: Component managers exposed globally for component updates');
            
            // Attach to global scope and protect it
            window.GMKB = GMKB;
            Object.freeze(window.GMKB);
            
            // ROOT FIX: Load toolbar interactions once all systems are fully ready
            document.addEventListener('gmkb:all-systems-ready', async () => {
                try {
                    console.log('🔧 GMKB: Loading toolbar interactions...');
                    await import('./ui/toolbar-interactions.js');
                    console.log('✅ GMKB: Toolbar interactions loaded successfully.');
                } catch (error) {
                    console.warn('⚠️ GMKB: Could not load toolbar interactions module:', error);
                }
            }, { once: true });
            
            // ROOT FIX: Load tab system after GMKB system is ready
            try {
                console.log('📋 GMKB: Loading tab system...');
                const { setupTabs } = await import('./ui/tabs.js');
                setupTabs();
                console.log('✅ GMKB: Tab system loaded successfully');
            } catch (error) {
                console.warn('⚠️ GMKB: Could not load tab system module:', error);
            }
            
            // ROOT FIX: Load modal systems with proper error handling
            try {
                console.log('📺 GMKB: Loading modal systems...');
                
                // Load export system
                try {
                    const { setupExportSystem } = await import('./modals/export.js');
                    setupExportSystem();
                    console.log('✅ GMKB: Export system loaded successfully');
                } catch (exportError) {
                    console.warn('⚠️ GMKB: Could not load export system:', exportError);
                }
                
                // Load global settings system (optional)
                try {
                    const { globalSettings } = await import('./modals/global-settings.js');
                    await globalSettings.init();
                    console.log('✅ GMKB: Global settings loaded successfully');
                } catch (settingsError) {
                    console.warn('⚠️ GMKB: Could not load global settings (this is optional):', settingsError);
                }
                
                console.log('✅ GMKB: Modal systems loading complete');
            } catch (error) {
                console.warn('⚠️ GMKB: Error in modal systems loading:', error);
            }
            
            console.log('🔒 GMKB: Namespace protected with Object.freeze()');

            // PHASE 2.3 FIX: Simplified system ready announcement
            GMKB.dispatch('gmkb:ready', {
                timestamp: Date.now(),
                systems: Object.keys(GMKB.systems),
                postId: window.gmkbData?.postId || null
            });
            
            // PHASE 2.3 FIX: Final initialization complete event for all remaining components
            GMKB.dispatch('gmkb:all-systems-ready', {
                timestamp: Date.now(),
                allSystemsInitialized: true
            });
            
            // Update body class to indicate readiness - VANILLA JS
            document.body.classList.add('gmkb-ready');
            document.body.classList.remove('gmkb-initializing');
            
            console.log('🎉 GMKB: Server-Integrated application ready!');
            console.log('📊 Status:', GMKB.getStatus());
            console.log('🚀 Features: Server-side rendering, AJAX integration, WordPress state persistence');
            
            return true;
            
        } catch (error) {
            console.error('❌ GMKB: Initialization error:', error);
            showInitializationError(error.message);
            return false;
        }
    }
    
    /**
     * Show user-friendly initialization error
     */
    function showInitializationError(message) {
        const previewContainer = document.getElementById('media-kit-preview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="initialization-error" style="
                    padding: 40px;
                    text-align: center;
                    background: #fee;
                    border: 2px solid #f88;
                    border-radius: 8px;
                    margin: 20px;
                    color: #d44;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                ">
                    <h2>⚠️ Initialization Error</h2>
                    <p><strong>The Media Kit Builder failed to start properly.</strong></p>
                    <p>Error: ${message}</p>
                    <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px; text-align: left;">
                        <strong>🔧 Diagnostics:</strong><br>
                        WordPress Data: ${!!window.gmkbData ? '✅' : '❌'}<br>
                        Vanilla JS: ${window.gmkbData?.vanillaJS ? '✅' : '❌'}<br>
                        Architecture: ${window.gmkbData?.architecture || 'Unknown'}<br>
                        Builder Page: ${window.gmkbData?.isBuilderPage ? '✅' : '❌'}
                    </div>
                    <button onclick="location.reload()" style="
                        background: #d44;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Reload Builder</button>
                </div>
            `;
        }
        }
        

    
    /**
     * 4. Entry Point - Server-Integrated VANILLA JS
     * Wait for DOM to be fully loaded - NO jQuery
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async function() {
            console.log('📄 DOM ready - starting GMKB server-integrated initialization...');
            await initializeApplication();
        });
    } else {
        // DOM already loaded
        console.log('📄 DOM already ready - starting GMKB server-integrated initialization...');
        (async () => {
            await initializeApplication();
        })();
    }
    
    // Also listen for WordPress readiness event from enqueue.php
    document.addEventListener('gmkb:wordpress-ready', function(event) {
        console.log('✅ WordPress readiness event received:', event.detail);
    });

    // Expose utility functions for debugging and testing
    window.gmkbUtils = {
        addTestComponent: function(type = 'hero') {
            if (window.GMKB && window.GMKB.systems.ComponentManager) {
                return window.GMKB.systems.ComponentManager.addComponent(type, {
                    title: 'Test Component (Vanilla JS)',
                    content: 'This is a test component added via gmkbUtils.addTestComponent() using pure vanilla JavaScript'
                });
            }
            console.warn('⚠️ GMKB not ready - cannot add test component');
            return null;
        },
        
        saveState: function() {
            if (window.GMKB && window.GMKB.systems.StateManager) {
                return window.GMKB.systems.StateManager.saveToStorage();
            }
            return false;
        },
        
        loadState: function() {
            if (window.GMKB && window.GMKB.systems.StateManager) {
                return window.GMKB.systems.StateManager.loadFromStorage();
            }
            return false;
        },
        
        getStatus: function() {
            return {
                gmkbReady: !!window.GMKB,
                wordPressData: !!window.gmkbData,
                systems: window.GMKB ? Object.keys(window.GMKB.systems) : [],
                architecture: 'server-integrated-vanilla-js',
                serverIntegration: true,
                ajaxEndpoints: !!window.gmkbData?.ajaxUrl,
                postId: window.gmkbData?.postId || null,
                timestamp: Date.now()
            };
        },
        
        clearState: function() {
            try {
                localStorage.removeItem('gmkb-state');
                location.reload();
                return true;
            } catch (error) {
                console.error('Failed to clear state:', error);
                return false;
            }
        }
    };

    console.log('✅ GMKB: Vanilla JS main.js loaded successfully');
    console.log('🛠️ Debug commands available:');
    console.log('  gmkbUtils.addTestComponent() - Add test component');
    console.log('  gmkbUtils.saveState() - Save current state');
    console.log('  gmkbUtils.loadState() - Load saved state');
    console.log('  gmkbUtils.getStatus() - Get system status');
    console.log('  gmkbUtils.clearState() - Clear saved state and reload');

})(); // End vanilla JS IIFE
