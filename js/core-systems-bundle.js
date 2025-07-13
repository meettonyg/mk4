/**
 * @file core-systems-bundle.js
 * @description Simplified Core Systems Bundle with a functional renderer.
 * @version 2.2.0
 * * This bundle defines core systems, exposes them globally,
 * and includes a renderer that can draw basic components to the screen.
 */
(function() {
    'use strict';
    console.log('🚀 Core Systems Bundle loading...');

    if (window.gmkbCoreSystemsReadyFired) {
        return;
    }

    // 1. System Registrar
    const systemRegistrar = {
        systems: {},
        register(name, systemInstance) {
            this.systems[name] = systemInstance;
            window[name] = systemInstance;
            console.log(`✅ System Registered: ${name}`);
        }
    };
    window.systemRegistrar = systemRegistrar;

    // 2. State Manager
    const stateManager = {
        _state: {
            components: {}
        },
        init() {
            console.log('📊 State Manager Initialized');
        },
        setState(newState) {
            this._state = { ...this._state, ...newState };
            console.log('State updated:', this._state);
            document.dispatchEvent(new CustomEvent('stateChanged', { detail: this._state }));
        },
        loadStateFromStorage() {
            try {
                const savedState = localStorage.getItem('guestifyMediaKitState');
                if (savedState) {
                    return JSON.parse(savedState);
                }
            } catch (error) {
                console.warn('Failed to load state from storage:', error);
            }
            return null;
        },
        saveStateToStorage() {
            try {
                localStorage.setItem('guestifyMediaKitState', JSON.stringify(this._state));
                console.log('✅ State saved to storage');
                return true;
            } catch (error) {
                console.warn('Failed to save state to storage:', error);
                return false;
            }
        }
    };

    // 3. Component Manager
    const componentManager = {
        components: new Map(),
        init() {
            console.log('🏗️ Component Manager Initialized');
        },
        addComponent(id, componentData) {
            this.components.set(id, componentData);
            
            // Update state manager
            const currentState = window.stateManager._state;
            const newComponents = { ...currentState.components };
            newComponents[id] = componentData;
            
            window.stateManager.setState({
                ...currentState,
                components: newComponents
            });
            
            console.log(`✅ Component added: ${id}`);
            return true;
        },
        removeComponent(id) {
            this.components.delete(id);
            
            // Update state manager
            const currentState = window.stateManager._state;
            const newComponents = { ...currentState.components };
            delete newComponents[id];
            
            window.stateManager.setState({
                ...currentState,
                components: newComponents
            });
            
            console.log(`✅ Component removed: ${id}`);
            return true;
        }
    };

    // 4. Renderer: Renders components to the DOM.
    const renderer = {
        init() {
            document.addEventListener('stateChanged', (e) => this.render(e.detail));
            console.log('🎨 Renderer Initialized');
        },
        render(state) {
            console.log('🖌️ Rendering components with new state...');
            
            // --- THIS IS THE NEW LOGIC ---
            const appContainer = document.getElementById('media-kit-preview');
            const emptyState = document.getElementById('empty-state');

            if (!appContainer) {
                console.error('Render failed: Main application container "media-kit-preview" not found.');
                return;
            }

            // Hide the "empty state" placeholder if components exist
            if (emptyState) {
                const hasComponents = state.components && Object.keys(state.components).length > 0;
                if (hasComponents) {
                    emptyState.style.display = 'none';
                } else {
                    emptyState.style.display = 'block';
                }
            }

            // Clear previous components and render new ones
            appContainer.innerHTML = '';
            if (state.components && typeof state.components === 'object') {
                const componentIds = Object.keys(state.components);
                componentIds.forEach(componentId => {
                    const componentData = state.components[componentId];
                    const componentEl = document.createElement('div');
                    componentEl.className = 'media-kit-component mk-component component-loading';
                    componentEl.id = componentId;
                    
                    // Create loading placeholder while component HTML loads
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
                    
                    appContainer.appendChild(componentEl);
                    
                    // Load the actual component HTML via AJAX
                    this.loadComponentHTML(componentId, componentData);
                });
                console.log(`✅ Rendered ${componentIds.length} components.`);
            }
        },
        
        loadComponentHTML(componentId, componentData) {
            if (!window.guestifyData) {
                console.error('Guestify data not available for AJAX call');
                return;
            }
            
            const formData = new FormData();
            formData.append('action', 'guestify_render_component');
            formData.append('component', componentData.type);
            formData.append('props', JSON.stringify({
                componentId: componentId,
                name: componentData.data?.title || `New ${componentData.type}`,
                title: componentData.data?.subtitle || 'Professional Title',
                bio: componentData.data?.description || 'Add your description here',
                ...componentData.data
            }));
            formData.append('nonce', window.guestifyData.nonce);
            
            fetch(window.guestifyData.ajaxUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data && data.data.html) {
                    // Update the component in the DOM with actual template HTML
                    const componentEl = document.getElementById(componentId);
                    if (componentEl) {
                        componentEl.innerHTML = data.data.html;
                        componentEl.classList.remove('component-loading');
                        componentEl.classList.add('component-loaded');
                        
                        // Add hover effects and interaction
                        componentEl.addEventListener('mouseenter', () => {
                            componentEl.style.borderColor = '#3b82f6';
                            componentEl.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                        });
                        componentEl.addEventListener('mouseleave', () => {
                            componentEl.style.borderColor = '#e2e8f0';
                            componentEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        });
                        
                        console.log(`✅ Component HTML loaded: ${componentId}`);
                    }
                } else {
                    console.error('Failed to load component HTML:', data);
                    // Show error state
                    const componentEl = document.getElementById(componentId);
                    if (componentEl) {
                        componentEl.innerHTML = `
                            <div class="component-error">
                                <div class="error-icon">⚠️</div>
                                <div class="error-text">Failed to load ${componentData.type}</div>
                                <button onclick="window.componentManager?.removeComponent('${componentId}')" class="remove-btn">Remove</button>
                            </div>
                        `;
                        componentEl.classList.remove('component-loading');
                        componentEl.classList.add('component-error');
                    }
                }
            })
            .catch(error => {
                console.error('AJAX error loading component:', error);
                // Show error state
                const componentEl = document.getElementById(componentId);
                if (componentEl) {
                    componentEl.innerHTML = `
                        <div class="component-error">
                            <div class="error-icon">⚠️</div>
                            <div class="error-text">Network error loading ${componentData.type}</div>
                            <button onclick="window.componentManager?.removeComponent('${componentId}')" class="remove-btn">Remove</button>
                        </div>
                    `;
                    componentEl.classList.remove('component-loading');
                    componentEl.classList.add('component-error');
                }
            });
        }
    };

    /**
     * Initializes and registers all core systems.
     */
    function initializeCoreSystems() {
        systemRegistrar.register('stateManager', stateManager);
        systemRegistrar.register('enhancedStateManager', stateManager);
        systemRegistrar.register('componentManager', componentManager);
        systemRegistrar.register('enhancedComponentManager', componentManager);
        systemRegistrar.register('renderer', renderer);

        Object.values(systemRegistrar.systems).forEach(system => {
            if (typeof system.init === 'function') {
                system.init();
            }
        });
    }

    /**
     * Dispatches the final 'coreSystemsReady' event.
     */
    function dispatchReadyEvent() {
        document.dispatchEvent(new CustomEvent('coreSystemsReady'));
        window.gmkbCoreSystemsReadyFired = true; 
        console.log('🎉🎉 Core Systems Ready! Event dispatched and flag set.');
    }

    // --- Entry Point ---
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