/**
 * @file application-bundle.js
 * @description Final Application Bundle that initializes and performs an initial render.
 * @version 2.2.0
 * * This version triggers an initial state change to confirm the rendering pipeline is working.
 */
(function() {
    'use strict';

    let isInitializationComplete = false;

    /**
     * Main function to initialize the entire application.
     */
    async function initializeApplication() {
        if (isInitializationComplete) {
            return;
        }
        console.log('🚀 Initializing Application Systems...');

        if (!window.stateManager || !window.componentManager || !window.renderer) {
            console.error('❌ CRITICAL: Core systems are not available.');
            return;
        }
        console.log('✅ Core systems validated.');

        try {
            // Initialize all systems
            initializeUISystems();
            initializeMKCGFunctionality();
            exposeGlobalCommands();

            isInitializationComplete = true;
            console.log('🎉🎉 Application Bundle successfully initialized!');

            // --- FINAL FIX ---
            // Trigger the first render by setting an initial state.
            // This confirms the entire system is working end-to-end.
            console.log('🎨 Triggering initial render...');
            window.stateManager.setState({
                status: 'Ready',
                message: 'Welcome to your Media Kit!',
                components: ['Hero', 'Biography', 'Gallery']
            });

        } catch (error) {
            console.error('❌ A fatal error occurred during application initialization:', error);
        }
    }

    function initializeUISystems() {
        // Mocked save/undo/redo functions for demonstration
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => window.stateManager.saveStateToStorage());
        
        console.log('✅ UI Systems Initialized');
    }

    function initializeMKCGFunctionality() {
        const previewContainer = document.getElementById('preview-container');
        if (previewContainer) {
            document.querySelectorAll('.toolbar__preview-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const previewMode = this.dataset.preview;
                    previewContainer.className = 'preview-container'; // Reset classes
                    previewContainer.classList.add(`preview--${previewMode}`);
                    console.log(`📱 Preview mode changed to: ${previewMode}`);
                });
            });
        }
        console.log('✅ MKCG Functionality Initialized');
    }

    function exposeGlobalCommands() {
        window.triggerSave = () => window.stateManager.saveStateToStorage();
        console.log('✅ Global Commands Exposed');
    }

    /**
     * Waits for the 'coreSystemsReady' event OR checks if it already fired.
     */
    function listenForCoreSystems() {
        if (window.gmkbCoreSystemsReadyFired) {
            console.log('✅ Core event flag was already set. Initializing application immediately.');
            initializeApplication();
            return;
        }

        console.log('🎧 Waiting for core systems to be ready...');
        document.addEventListener('coreSystemsReady', function onCoreSystemsReady() {
            console.log('✅ Event "coreSystemsReady" received! Starting application.');
            initializeApplication();
        }, { once: true });
    }

    // Start the process
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', listenForCoreSystems);
    } else {
        listenForCoreSystems();
    }

})();