/**
 * @file core-systems-bundle.js - ROOT FIX VERSION
 * @description Enhanced Core Systems Bundle that preserves Enhanced Component Manager
 * @version ROOT-FIX-1.0.0
 * 
 * ROOT FIX FEATURES:
 * ✅ Preserves Enhanced Component Manager from overwriting
 * ✅ Maintains event system functionality
 * ✅ Provides fallback for basic functionality
 * ✅ Proper initialization order coordination
 * ✅ No race conditions or component manager conflicts
 */
(function() {
    'use strict';
    
    console.log('🚀 ROOT FIX: Core Systems Bundle loading with Enhanced Manager preservation...');

    // ROOT FIX: Check if already initialized to prevent duplicates
    if (window.gmkbCoreSystemsReadyFired) {
        console.log('✅ ROOT FIX: Core Systems already initialized, skipping...');
        return;
    }

    // ROOT FIX: Enhanced Component Manager preservation check
    const hasEnhancedManager = !!(window.enhancedComponentManager && 
                                  typeof window.enhancedComponentManager.getEventTrackingStats === 'function');
    
    if (hasEnhancedManager) {
        console.log('✅ ROOT FIX: Enhanced Component Manager detected and will be preserved');
        console.log('🎯 ROOT FIX: Event system status:', window.enhancedComponentManager.getEventTrackingStats());
    } else {
        console.warn('⚠️ ROOT FIX: Enhanced Component Manager not found - providing fallback');
    }

    // 1. System Registrar
    const systemRegistrar = {
        systems: {},
        register(name, systemInstance) {
            // ROOT FIX: Preserve existing enhanced systems
            if (name === 'enhancedComponentManager' && window.enhancedComponentManager) {
                console.log('✅ ROOT FIX: Preserving existing Enhanced Component Manager');
                this.systems[name] = window.enhancedComponentManager;
                return;
            }
            
            this.systems[name] = systemInstance;
            window[name] = systemInstance;
            console.log(`✅ ROOT FIX: System Registered: ${name}`);
        },
        getSystem(name) {
            return this.systems[name] || window[name];
        }
    };
    window.systemRegistrar = systemRegistrar;

    // 2. Enhanced State Manager
    const stateManager = {
        _state: {
            components: {},
            layout: [],
            metadata: {}
        },
        
        init() {
            console.log('📊 ROOT FIX: Enhanced State Manager Initialized');
            this.loadStateFromStorage();
        },
        
        getState() {
            return { ...this._state };
        },
        
        setState(newState) {
            const oldState = { ...this._state };
            this._state = { ...this._state, ...newState };
            
            console.log('🔄 ROOT FIX: State updated:', this._state);
            
            // Dispatch state change event
            this.dispatchStateChange(oldState, this._state);
        },
        
        // ROOT FIX: Enhanced component management methods
        addComponent(component) {
            if (!component || !component.id) {
                console.error('❌ ROOT FIX: Cannot add component without ID');
                return false;
            }
            
            const newComponents = { ...this._state.components };
            newComponents[component.id] = component;
            
            const newLayout = [...this._state.layout];
            if (!newLayout.includes(component.id)) {
                newLayout.push(component.id);
            }
            
            this.setState({
                components: newComponents,
                layout: newLayout
            });
            
            console.log(`✅ ROOT FIX: Component added: ${component.id}`);
            return true;
        },
        
        removeComponent(componentId) {
            if (!componentId) return false;
            
            const newComponents = { ...this._state.components };
            delete newComponents[componentId];
            
            const newLayout = this._state.layout.filter(id => id !== componentId);
            
            this.setState({
                components: newComponents,
                layout: newLayout
            });
            
            console.log(`✅ ROOT FIX: Component removed: ${componentId}`);
            return true;
        },
        
        updateComponent(componentId, newProps) {
            if (!componentId || !this._state.components[componentId]) {
                console.error('❌ ROOT FIX: Cannot update non-existent component:', componentId);
                return false;
            }
            
            const newComponents = { ...this._state.components };
            newComponents[componentId] = {
                ...newComponents[componentId],
                props: { ...newComponents[componentId].props, ...newProps },
                lastUpdated: Date.now()
            };
            
            this.setState({
                components: newComponents
            });
            
            console.log(`✅ ROOT FIX: Component updated: ${componentId}`);
            return true;
        },
        
        getComponent(componentId) {
            return this._state.components[componentId] || null;
        },
        
        moveComponent(componentId, direction) {
            const layout = [...this._state.layout];
            const currentIndex = layout.indexOf(componentId);
            
            if (currentIndex === -1) return false;
            
            let newIndex;
            if (direction === 'up') {
                newIndex = Math.max(0, currentIndex - 1);
            } else {
                newIndex = Math.min(layout.length - 1, currentIndex + 1);
            }
            
            if (newIndex !== currentIndex) {
                // Swap positions
                [layout[currentIndex], layout[newIndex]] = [layout[newIndex], layout[currentIndex]];
                
                this.setState({ layout });
                console.log(`🔄 ROOT FIX: Component moved ${direction}: ${componentId}`);
                return true;
            }
            
            return false;
        },
        
        // ROOT FIX: Batch update support for performance
        startBatchUpdate() {
            this._batchMode = true;
            this._batchChanges = [];
        },
        
        endBatchUpdate() {
            if (this._batchMode && this._batchChanges.length > 0) {
                // Apply all batched changes at once
                const finalState = this._batchChanges.reduce((state, change) => {
                    return { ...state, ...change };
                }, this._state);
                
                this._state = finalState;
                this.dispatchStateChange({}, this._state);
                
                console.log(`✅ ROOT FIX: Batch update completed (${this._batchChanges.length} changes)`);
            }
            
            this._batchMode = false;
            this._batchChanges = [];
        },
        
        dispatchStateChange(oldState, newState) {
            // Don't dispatch during batch mode
            if (this._batchMode) {
                return;
            }
            
            const changeEvent = new CustomEvent('stateChanged', { 
                detail: { 
                    oldState, 
                    newState,
                    timestamp: Date.now()
                } 
            });
            
            document.dispatchEvent(changeEvent);
            
            // ROOT FIX: Also dispatch component-specific events
            if (newState.components !== oldState.components) {
                const componentChangeEvent = new CustomEvent('componentsChanged', {
                    detail: {
                        components: newState.components,
                        timestamp: Date.now()
                    }
                });
                document.dispatchEvent(componentChangeEvent);
            }
        },
        
        loadStateFromStorage() {
            try {
                const savedState = localStorage.getItem('guestifyMediaKitState');
                if (savedState) {
                    const parsedState = JSON.parse(savedState);
                    this._state = { ...this._state, ...parsedState };
                    console.log('✅ ROOT FIX: State loaded from storage');
                    return parsedState;
                }
            } catch (error) {
                console.warn('⚠️ ROOT FIX: Failed to load state from storage:', error);
            }
            return null;
        },
        
        saveStateToStorage() {
            try {
                localStorage.setItem('guestifyMediaKitState', JSON.stringify(this._state));
                console.log('✅ ROOT FIX: State saved to storage');
                return true;
            } catch (error) {
                console.warn('⚠️ ROOT FIX: Failed to save state to storage:', error);
                return false;
            }
        },
        
        // ROOT FIX: Global subscriptions for enhanced manager integration
        subscribeGlobal(callback) {
            const handleStateChange = (e) => {
                if (e.detail && e.detail.newState) {
                    callback(e.detail.newState);
                }
            };
            
            document.addEventListener('stateChanged', handleStateChange);
            
            // Return unsubscribe function
            return () => {
                document.removeEventListener('stateChanged', handleStateChange);
            };
        }
    };

    // 3. ROOT FIX: Component Manager - Fallback only if Enhanced Manager not available
    const componentManager = {
        components: new Map(),
        
        init() {
            console.log('🏗️ ROOT FIX: Basic Component Manager Initialized (Fallback)');
        },
        
        addComponent(id, componentData) {
            // ROOT FIX: Delegate to enhanced manager if available
            if (hasEnhancedManager && window.enhancedComponentManager.addComponent) {
                return window.enhancedComponentManager.addComponent(componentData.type, componentData.props || {});
            }
            
            // Fallback implementation
            this.components.set(id, componentData);
            
            const currentState = window.stateManager._state;
            const newComponents = { ...currentState.components };
            newComponents[id] = componentData;
            
            window.stateManager.setState({
                ...currentState,
                components: newComponents
            });
            
            console.log(`✅ ROOT FIX: Component added (fallback): ${id}`);
            return true;
        },
        
        removeComponent(id) {
            // ROOT FIX: Delegate to enhanced manager if available
            if (hasEnhancedManager && window.enhancedComponentManager.removeComponent) {
                return window.enhancedComponentManager.removeComponent(id);
            }
            
            // Fallback implementation
            this.components.delete(id);
            return window.stateManager.removeComponent(id);
        },
        
        updateComponent(id, newProps) {
            // ROOT FIX: Delegate to enhanced manager if available
            if (hasEnhancedManager && window.enhancedComponentManager.updateComponent) {
                return window.enhancedComponentManager.updateComponent(id, newProps);
            }
            
            // Fallback implementation
            return window.stateManager.updateComponent(id, newProps);
        }
    };

    // 4. ROOT FIX: Enhanced Renderer with component management integration
    const renderer = {
        init() {
            document.addEventListener('stateChanged', (e) => this.render(e.detail.newState));
            console.log('🎨 ROOT FIX: Enhanced Renderer Initialized');
        },
        
        render(state) {
            console.log('🖌️ ROOT FIX: Rendering components with enhanced state...');
            
            const appContainer = document.getElementById('media-kit-preview');
            const emptyState = document.getElementById('empty-state');

            if (!appContainer) {
                console.error('❌ ROOT FIX: Main application container "media-kit-preview" not found.');
                return;
            }

            // Hide/show empty state based on components
            if (emptyState) {
                const hasComponents = state.components && Object.keys(state.components).length > 0;
                emptyState.style.display = hasComponents ? 'none' : 'block';
            }

            // ROOT FIX: Preserve existing component elements that are still valid
            const existingComponents = new Map();
            const existingElements = appContainer.querySelectorAll('[data-component-id]');
            existingElements.forEach(el => {
                const componentId = el.getAttribute('data-component-id');
                if (componentId) {
                    existingComponents.set(componentId, el);
                }
            });

            // Clear container
            appContainer.innerHTML = '';
            
            if (state.components && typeof state.components === 'object') {
                // Use layout order if available, otherwise use object keys
                const componentOrder = state.layout && state.layout.length > 0 ? 
                                     state.layout : Object.keys(state.components);
                
                componentOrder.forEach(componentId => {
                    const componentData = state.components[componentId];
                    if (!componentData) return;
                    
                    let componentEl = existingComponents.get(componentId);
                    
                    if (componentEl) {
                        // Reuse existing element
                        console.log(`♻️ ROOT FIX: Reusing existing component: ${componentId}`);
                        appContainer.appendChild(componentEl);
                    } else {
                        // Create new element
                        componentEl = this.createComponentElement(componentId, componentData);
                        appContainer.appendChild(componentEl);
                        
                        // Load component HTML
                        this.loadComponentHTML(componentId, componentData);
                    }
                });
                
                console.log(`✅ ROOT FIX: Rendered ${componentOrder.length} components.`);
            }
        },
        
        createComponentElement(componentId, componentData) {
            const componentEl = document.createElement('div');
            componentEl.className = 'media-kit-component mk-component component-loading editable-element';
            componentEl.setAttribute('data-component-id', componentId);
            componentEl.setAttribute('data-component', componentData.type);
            componentEl.id = componentId;
            
            // Create loading placeholder
            componentEl.innerHTML = `
                <div class="component-loading-state">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading ${componentData.type}...</div>
                </div>
            `;
            
            // Add component styling
            componentEl.style.cssText = `
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                margin: 16px 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                position: relative;
                transition: all 0.2s ease;
                min-height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            return componentEl;
        },
        
        loadComponentHTML(componentId, componentData) {
            if (!window.guestifyData && !window.guestifyMediaKit) {
                console.error('❌ ROOT FIX: No AJAX data available for component loading');
                return;
            }
            
            const ajaxData = window.guestifyData || window.guestifyMediaKit;
            
            const formData = new FormData();
            formData.append('action', 'guestify_render_component');
            formData.append('component', componentData.type);
            formData.append('props', JSON.stringify({
                componentId: componentId,
                name: componentData.props?.name || componentData.data?.title || `New ${componentData.type}`,
                title: componentData.props?.title || componentData.data?.subtitle || 'Professional Title',
                bio: componentData.props?.bio || componentData.data?.description || 'Add your description here',
                ...componentData.props,
                ...componentData.data
            }));
            formData.append('nonce', ajaxData.nonce);
            
            fetch(ajaxData.ajaxUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data && data.data.html) {
                    const componentEl = document.getElementById(componentId);
                    if (componentEl) {
                        componentEl.innerHTML = data.data.html;
                        componentEl.classList.remove('component-loading');
                        componentEl.classList.add('component-loaded');
                        
                        // Add interaction effects
                        this.addComponentInteractions(componentEl);
                        
                        console.log(`✅ ROOT FIX: Component HTML loaded: ${componentId}`);
                        
                        // ROOT FIX: Trigger component loaded event
                        const loadedEvent = new CustomEvent('componentLoaded', {
                            detail: { componentId, componentType: componentData.type }
                        });
                        document.dispatchEvent(loadedEvent);
                    }
                } else {
                    console.error('❌ ROOT FIX: Failed to load component HTML:', data);
                    this.showComponentError(componentId, componentData);
                }
            })
            .catch(error => {
                console.error('❌ ROOT FIX: AJAX error loading component:', error);
                this.showComponentError(componentId, componentData);
            });
        },
        
        addComponentInteractions(componentEl) {
            componentEl.addEventListener('mouseenter', () => {
                componentEl.style.borderColor = '#3b82f6';
                componentEl.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
            });
            
            componentEl.addEventListener('mouseleave', () => {
                componentEl.style.borderColor = '#e2e8f0';
                componentEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            });
        },
        
        showComponentError(componentId, componentData) {
            const componentEl = document.getElementById(componentId);
            if (componentEl) {
                componentEl.innerHTML = `
                    <div class="component-error">
                        <div class="error-icon">⚠️</div>
                        <div class="error-text">Failed to load ${componentData.type}</div>
                        <button onclick="window.stateManager?.removeComponent('${componentId}')" class="remove-btn">Remove</button>
                    </div>
                `;
                componentEl.classList.remove('component-loading');
                componentEl.classList.add('component-error');
            }
        }
    };

    /**
     * ROOT FIX: Initialize and register all core systems with Enhanced Manager preservation
     */
    function initializeCoreSystems() {
        console.log('🏗️ ROOT FIX: Initializing core systems with enhanced manager preservation...');
        
        // Register systems in proper order
        systemRegistrar.register('stateManager', stateManager);
        systemRegistrar.register('enhancedStateManager', stateManager); // Alias for compatibility
        
        // ROOT FIX: Enhanced Component Manager preservation
        if (hasEnhancedManager) {
            console.log('✅ ROOT FIX: Registering existing Enhanced Component Manager');
            systemRegistrar.register('enhancedComponentManager', window.enhancedComponentManager);
            systemRegistrar.register('componentManager', window.enhancedComponentManager); // Use enhanced as primary
        } else {
            console.log('⚠️ ROOT FIX: Using fallback component manager');
            systemRegistrar.register('componentManager', componentManager);
            systemRegistrar.register('enhancedComponentManager', componentManager); // Alias
        }
        
        systemRegistrar.register('renderer', renderer);

        // Initialize all systems
        Object.values(systemRegistrar.systems).forEach(system => {
            if (typeof system.init === 'function') {
                system.init();
            }
        });
        
        console.log('✅ ROOT FIX: All core systems initialized successfully');
    }

    /**
     * ROOT FIX: Enhanced ready event dispatch with validation
     */
    function dispatchReadyEvent() {
        console.log('🔍 ROOT FIX: Validating system initialization before ready event...');
        
        // Validate Enhanced Component Manager status
        if (window.enhancedComponentManager && typeof window.enhancedComponentManager.getEventTrackingStats === 'function') {
            console.log('✅ ROOT FIX: Enhanced Component Manager with event system CONFIRMED ACTIVE!');
            
            try {
                const stats = window.enhancedComponentManager.getEventTrackingStats();
                console.log('📊 ROOT FIX: Event tracking stats:', stats);
                
                // Verify debug functions are available
                console.log('🛠️ ROOT FIX: Debug functions status:', {
                    debugComponentEvents: typeof window.debugComponentEvents,
                    testComponentEvents: typeof window.testComponentEvents,
                    getEnhancedComponentManagerStatus: typeof window.getEnhancedComponentManagerStatus
                });
            } catch (error) {
                console.error('❌ ROOT FIX: Error validating event system:', error);
            }
        } else {
            console.warn('⚠️ ROOT FIX: Enhanced Component Manager event system NOT available');
        }
        
        // Dispatch the ready event
        const readyEvent = new CustomEvent('coreSystemsReady', {
            detail: {
                timestamp: Date.now(),
                enhancedManagerActive: hasEnhancedManager,
                systemsRegistered: Object.keys(systemRegistrar.systems),
                rootFixVersion: 'ROOT-FIX-1.0.0'
            }
        });
        
        document.dispatchEvent(readyEvent);
        window.gmkbCoreSystemsReadyFired = true;
        
        console.log('🎉🎉 ROOT FIX: Core Systems Ready! Enhanced architecture preserved and active.');
    }

    // ROOT FIX: Entry Point with proper initialization order
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeCoreSystems();
            dispatchReadyEvent();
        });
    } else {
        initializeCoreSystems();
        dispatchReadyEvent();
    }

})();