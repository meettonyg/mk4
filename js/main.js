/**
 * @file main.js
 * @description Main entry point for the Guestify Media Kit Builder.
 * This file is responsible for waiting for the DOM to be ready and then
 * kicking off the entire application initialization sequence with proper
 * race condition prevention and error handling.
 * 
 * Phase 2B Enhancement: Integrated comprehensive logging system
 */

import {
    initializationManager
} from './core/initialization-manager.js';
import {
    performanceMonitor
} from './utils/performance-monitor.js';
import {
    structuredLogger
} from './utils/structured-logger.js';
import {
    errorBoundary
} from './utils/error-boundary.js';

// Expose global objects for debugging and monitoring
window.mk = {};
window.mkPerf = performanceMonitor;

// Expose logging console commands
window.mkLog = {
    report: () => structuredLogger.generateInitReport(),
    errors: () => structuredLogger.generateErrorReport(),
    timing: () => structuredLogger.generateTimingReport(),
    export: (format = 'json') => structuredLogger.exportLogs(format),
    setLevel: (level) => structuredLogger.setLogLevel(level),
    clear: () => structuredLogger.clear(),
    search: (query) => structuredLogger.search(query),
    performance: () => window.mkPerf.report(),
    errorBoundary: () => errorBoundary.generateReport(),
    help: () => {
        console.log('📚 Media Kit Builder Logging Commands:');
        console.log('  mkLog.report()      - Show initialization report');
        console.log('  mkLog.errors()      - Show error report');
        console.log('  mkLog.timing()      - Show timing report');
        console.log('  mkLog.export()      - Export logs (json/csv)');
        console.log('  mkLog.setLevel()    - Set log level (debug/info/warn/error)');
        console.log('  mkLog.clear()       - Clear all logs');
        console.log('  mkLog.search(query) - Search logs');
        console.log('  mkLog.performance() - Show performance metrics');
        console.log('  mkLog.errorBoundary() - Show error boundary report');
        console.log('\n📊 Performance Commands:');
        console.log('  mkPerf.report()     - Show performance report');
        console.log('  mkPerf.reset()      - Reset metrics');
        console.log('  mkPerf.setDebugMode(true/false) - Toggle debug mode');
    }
};

// Log initial setup
structuredLogger.info('INIT', 'Media Kit Builder main.js loaded', {
    globals: {
        guestifyData: !!window.guestifyData,
        mkPerf: !!window.mkPerf,
        mkLog: !!window.mkLog
    }
});

/**
 * Enhanced initialization function that uses the initialization manager
 * to prevent race conditions and provide proper error handling.
 */
async function initializeBuilder() {
    structuredLogger.info('INIT', 'Guestify Media Kit Builder: Starting enhanced initialization');
    
    try {
        // Use the initialization manager to handle the complete sequence
        const success = await initializationManager.initialize();
        
        if (success) {
            structuredLogger.info('INIT', 'Media Kit Builder initialization successful!', {
                status: initializationManager.getStatus()
            });
            
            console.log('\n✅ Media Kit Builder Ready!');
            console.log('📊 Logging commands available. Type mkLog.help() for a list.');
            console.log('🔧 Debug tools: window.initManager.getStatus()');
            
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
        structuredLogger.error('INIT', 'Media Kit Builder initialization failed', error);
        
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
    structuredLogger.warn('INIT', 'Attempting fallback initialization', {
        originalError: originalError.message
    });
    
    try {
        // Try to load systems manually
        const { initializeSystems } = await import('./core/conditional-loader.js');
        const { featureFlags } = await import('./core/feature-flags.js');
        
        // Validate basic requirements
        if (!window.guestifyData?.pluginUrl) {
            structuredLogger.error('INIT', 'Cannot proceed: guestifyData still not available');
            throw new Error('Cannot proceed: guestifyData still not available');
        }
        
        // Set plugin URL manually
        window.GUESTIFY_PLUGIN_URL = window.guestifyData.pluginUrl;
        
        // Load systems
        initializeSystems(featureFlags);
        
        // Try manual initialization
        if (window.initializer && typeof window.initializer === 'function') {
            await window.initializer();
            structuredLogger.info('INIT', 'Fallback initialization successful');
            
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
        structuredLogger.error('INIT', 'Fallback initialization also failed', fallbackError, {
            originalError: originalError.message
        });
        
        // Log comprehensive failure information
        structuredLogger.error('INIT', 'Complete initialization failure', null, {
            availableGlobals: {
                guestifyData: !!window.guestifyData,
                guestifyDataBackup: !!window.guestifyDataBackup,
                guestifyDataReady: !!window.guestifyDataReady,
                stateManager: !!window.stateManager,
                componentManager: !!window.componentManager,
                renderer: !!window.renderer,
                initializer: !!window.initializer
            },
            domReadiness: document.readyState,
            requiredElements: {
                preview: !!document.getElementById('media-kit-preview'),
                sidebar: !!document.querySelector('.sidebar'),
                toolbar: !!document.querySelector('.toolbar')
            }
        });
        
        // Generate comprehensive error report
        structuredLogger.generateErrorReport();
    }
}

// Global flag to prevent double initialization
let initializationStarted = false;

// Expose globally for debugging
window.initializationStarted = () => initializationStarted;

/**
 * Safe initialization wrapper that prevents double execution
 */
function safeInitializeBuilder() {
    if (initializationStarted) {
        structuredLogger.warn('INIT', 'Initialization already started, skipping duplicate call');
        return;
    }
    
    initializationStarted = true;
    structuredLogger.info('INIT', 'Starting Media Kit Builder initialization from DOMContentLoaded');
    initializeBuilder();
}

// Check if we need to wait for DOMContentLoaded or start immediately
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', safeInitializeBuilder);
} else {
    // DOM is already ready (interactive or complete), start immediately
    structuredLogger.info('INIT', 'DOM was already ready, starting initialization immediately', {
        readyState: document.readyState
    });
    // Use setTimeout to ensure this runs after current script execution
    setTimeout(safeInitializeBuilder, 0);
}
