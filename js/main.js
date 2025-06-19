/**
 * @file main.js
 * @description Main entry point for the Guestify Media Kit Builder.
 * This file is responsible for waiting for the DOM to be ready and then
 * kicking off the entire application initialization sequence with proper
 * race condition prevention and error handling.
 */

import {
    initializationManager
} from './core/initialization-manager.js';
import {
    performanceMonitor
} from './utils/performance-monitor.js';

// Expose global objects for debugging and monitoring
window.mk = {};
window.mkPerf = performanceMonitor;

/**
 * Enhanced initialization function that uses the initialization manager
 * to prevent race conditions and provide proper error handling.
 */
async function initializeBuilder() {
    console.log('🚀 Guestify Media Kit Builder: Starting enhanced initialization...');
    
    try {
        // Use the initialization manager to handle the complete sequence
        const success = await initializationManager.initialize();
        
        if (success) {
            console.log('✅ Media Kit Builder: Initialization successful!');
            console.log('📊 Performance monitoring available. Use mkPerf.report() to view metrics.');
            console.log('🔧 Debug tools available: window.initManager.getStatus()');
            
            // Dispatch custom event for any external listeners
            window.dispatchEvent(new CustomEvent('mediaKitBuilderReady', {
                detail: {
                    status: initializationManager.getStatus(),
                    timestamp: Date.now()
                }
            }));
        } else {
            throw new Error('Initialization manager returned false');
        }
        
    } catch (error) {
        console.error('❌ Media Kit Builder: Initialization failed:', error);
        
        // Show user-friendly error message
        showInitializationError(error);
        
        // Dispatch error event
        window.dispatchEvent(new CustomEvent('mediaKitBuilderError', {
            detail: {
                error: error.message,
                status: initializationManager.getStatus(),
                timestamp: Date.now()
            }
        }));
        
        // Attempt fallback initialization
        attemptFallbackInitialization(error);
    }
}

/**
 * Shows a user-friendly error message when initialization fails
 * @param {Error} error - The initialization error
 */
function showInitializationError(error) {
    // Try to find the preview container to show error
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
            ">
                <h2>⚠️ Initialization Error</h2>
                <p><strong>The Media Kit Builder failed to start properly.</strong></p>
                <p>Error: ${error.message}</p>
                <p style="margin-top: 20px;">
                    <button onclick="location.reload()" style="
                        background: #d44;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Try Again</button>
                </p>
                <details style="margin-top: 20px; text-align: left;">
                    <summary style="cursor: pointer;">Debug Information</summary>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 10px; overflow: auto;">${JSON.stringify(initializationManager.getStatus(), null, 2)}</pre>
                </details>
            </div>
        `;
    }
}

/**
 * Attempts a fallback initialization using legacy methods
 * @param {Error} originalError - The original initialization error
 */
async function attemptFallbackInitialization(originalError) {
    console.log('🔄 Attempting fallback initialization...');
    
    try {
        // Try to load systems manually
        const { initializeSystems } = await import('./core/conditional-loader.js');
        const { featureFlags } = await import('./core/feature-flags.js');
        
        // Validate basic requirements
        if (!window.guestifyData?.pluginUrl) {
            throw new Error('Cannot proceed: guestifyData still not available');
        }
        
        // Set plugin URL manually
        window.GUESTIFY_PLUGIN_URL = window.guestifyData.pluginUrl;
        
        // Load systems
        initializeSystems(featureFlags);
        
        // Try manual initialization
        if (window.initializer && typeof window.initializer === 'function') {
            await window.initializer();
            console.log('✅ Fallback initialization successful');
            
            // Update error display with success message
            const errorEl = document.querySelector('.initialization-error');
            if (errorEl) {
                errorEl.style.background = '#efe';
                errorEl.style.borderColor = '#8f8';
                errorEl.style.color = '#484';
                errorEl.innerHTML = `
                    <h2>✅ Recovery Successful</h2>
                    <p>The application has been recovered using fallback initialization.</p>
                    <p><button onclick="location.reload()" style="
                        background: #484;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Reload for Clean Start</button></p>
                `;
            }
        } else {
            throw new Error('Fallback: No initializer function available');
        }
        
    } catch (fallbackError) {
        console.error('❌ Fallback initialization also failed:', fallbackError);
        console.error('📋 Original error was:', originalError);
        
        // Log comprehensive failure information
        console.group('🚨 Complete Initialization Failure');
        console.log('Available globals:', {
            guestifyData: !!window.guestifyData,
            guestifyDataBackup: !!window.guestifyDataBackup,
            guestifyDataReady: !!window.guestifyDataReady,
            stateManager: !!window.stateManager,
            componentManager: !!window.componentManager,
            renderer: !!window.renderer,
            initializer: !!window.initializer
        });
        console.log('DOM readiness:', document.readyState);
        console.log('Required elements:', {
            preview: !!document.getElementById('media-kit-preview'),
            sidebar: !!document.querySelector('.sidebar'),
            toolbar: !!document.querySelector('.toolbar')
        });
        console.groupEnd();
    }
}

// Single DOMContentLoaded listener - the source of truth for initialization timing
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM ready, starting Media Kit Builder initialization...');
    initializeBuilder();
});

// Additional safety net for cases where DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // DOM hasn't finished loading, event listener will handle it
} else {
    // DOM is already ready, start immediately
    console.log('📄 DOM was already ready, starting initialization immediately...');
    initializeBuilder();
}
