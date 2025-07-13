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
            components: []
        },
        init() {
            console.log('📊 State Manager Initialized');
        },
        setState(newState) {
            this._state = { ...this._state, ...newState };
            console.log('State updated:', this._state);
            document.dispatchEvent(new CustomEvent('stateChanged', { detail: this._state }));
        }
    };

    // 3. Component Manager
    const componentManager = {
        init() {
            console.log('🏗️ Component Manager Initialized');
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
            const emptyState = document.getElementById('gmkb-empty-state');

            if (!appContainer) {
                console.error('Render failed: Main application container "media-kit-preview" not found.');
                return;
            }

            // Hide the "empty state" placeholder
            if (emptyState) {
                emptyState.style.display = 'none';
            }

            // Clear previous components and render new ones
            appContainer.innerHTML = '';
            if (state.components && Array.isArray(state.components)) {
                state.components.forEach(componentName => {
                    const componentEl = document.createElement('div');
                    componentEl.className = 'media-kit-component';
                    componentEl.textContent = `Component: ${componentName}`;
                    appContainer.appendChild(componentEl);
                });
                console.log(`✅ Rendered ${state.components.length} components.`);
            }
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