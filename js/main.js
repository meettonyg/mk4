/**
 * @file main.js
 * @description Main entry point for the Guestify Media Kit Builder.
 * This file is responsible for waiting for the DOM to be ready and then
 * kicking off the entire application initialization sequence with proper
 * race condition prevention and error handling.
 * 
 * REFACTORED: Updated to use new system architecture that prevents circular dependencies
 */

// Import the new system selection and initialization functions
import { selectAndRegisterSystems } from './core/conditional-loader.js';
import { initializeCoreSystems } from './core/system-initializer.js';
import { featureFlags } from './core/feature-flags.js';
import { initializationManager } from './core/initialization-manager.js';
import { performanceMonitor } from './utils/performance-monitor.js';
import { structuredLogger } from './utils/structured-logger.js';
import { errorBoundary } from './utils/error-boundary.js';

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
        console.log('\n🧪 Testing Commands:');
        console.log('  testArchitectureFix() - Test the architectural fixes');
    }
};

// Quick architecture test function
window.testArchitectureFix = function() {
    console.log('🧪 Testing Architectural Fix...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function test(name, condition, critical = false) {
        const status = condition ? 'PASS' : 'FAIL';
        const icon = condition ? '✅' : '❌';
        
        console.log(`${icon} ${name}: ${status}`);
        
        results.tests.push({ name, status, critical });
        
        if (condition) {
            results.passed++;
        } else {
            results.failed++;
        }
    }
    
    // Core tests
    test('System Registrar Available', !!window.systemRegistrar, true);
    test('Enhanced Component Manager Available', !!window.enhancedComponentManager, true);
    test('Enhanced CM has addComponent', typeof window.enhancedComponentManager?.addComponent === 'function', true);
    test('Enhanced CM is initialized', window.enhancedComponentManager?.isInitialized, true);
    test('Enhanced Renderer Available', !!window.renderer, true);
    test('Enhanced Renderer is initialized', window.renderer?.initialized, true);
    test('media-kit-preview element exists', !!document.getElementById('media-kit-preview'), true);
    test('Modal Elements Present', !!document.getElementById('component-library-overlay'), false);
    test('Component Grid Present', !!document.getElementById('component-grid'), false);
    
    // If component manager not initialized, show why
    if (!window.enhancedComponentManager?.isInitialized) {
        const previewExists = !!document.getElementById('media-kit-preview');
        console.log(`🔍 DIAGNOSTIC: media-kit-preview element exists: ${previewExists}`);
        if (!previewExists) {
            console.log('⚠️  The builder template may not be fully loaded yet.');
        }
    }
    
    // If renderer not initialized, show diagnostic
    if (!window.renderer?.initialized) {
        console.log('⚠️  CRITICAL: Enhanced renderer not initialized - components won\'t appear!');
        console.log('🔍  This means components are added to state but not rendered to DOM.');
    } else {
        // Renderer is initialized, check if it has state subscription
        const hasSubscription = window.renderer.stateUnsubscribe !== null;
        console.log(`🔍  Renderer state subscription active: ${hasSubscription}`);
    }
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.log(`  ✅ Passed: ${results.passed}`);
    console.log(`  ❌ Failed: ${results.failed}`);
    
    if (results.failed === 0) {
        console.log('\n🎉 All tests passed! Architecture fix appears to be working.');
        console.log('🔧 Try adding a component to test functionality.');
        return true;
    } else {
        console.log('\n⚠️ Some tests failed. Check the individual results above.');
        return false;
    }
};

/**
 * Initializes the entire application using the new architecture.
 */
async function initializeBuilder() {
    structuredLogger.info('INIT', 'Media Kit Builder: Starting enhanced initialization with new architecture');
    const startTime = performance.now();
    
    try {
        // Step 1: Validate prerequisites
        await validatePrerequisites();
        
        // Step 2: Select and register systems (no circular dependencies)
        console.log('🚀 Step 1: Selecting and registering systems...');
        selectAndRegisterSystems(featureFlags);
        
        // Step 3: Initialize systems and expose them globally
        console.log('🚀 Step 2: Initializing core systems...');
        initializeCoreSystems();
        
        // Step 4: Validate that enhanced component manager is available
        await validateEnhancedComponentManager();
        
        // Step 5: Use initialization manager for remaining setup
        console.log('🚀 Step 3: Running initialization manager sequence...');
        const success = await runInitializationSequence();
        
        if (success) {
            const duration = performance.now() - startTime;
            structuredLogger.info('INIT', 'Media Kit Builder initialization successful!', {
                duration,
                architecture: 'new-registrar-based'
            });
            
            console.log('\n✅ Media Kit Builder Ready!');
            console.log('📊 Logging commands available. Type mkLog.help() for a list.');
            console.log('🔧 Debug tools: window.getSystemInfo(), window.systemRegistrar.list()');
            
            // Dispatch custom event for any external listeners
            window.dispatchEvent(new CustomEvent('mediaKitBuilderReady', {
                detail: {
                    duration,
                    architecture: 'registrar-based',
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
                timestamp: Date.now()
            }
        }));
        
        // Attempt fallback initialization
        await attemptFallbackInitialization(error);
    }
}

/**
 * Validates that prerequisites are available before starting
 */
async function validatePrerequisites() {
    console.log('🔍 Validating prerequisites...');
    
    // Wait for DOM to be fully ready
    if (document.readyState !== 'complete') {
        console.log('⏳ Waiting for document to be complete...');
        await new Promise(resolve => {
            const checkReady = () => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    setTimeout(checkReady, 10);
                }
            };
            checkReady();
        });
    }
    
    // Check for guestifyData
    const maxWait = 2000;
    const startTime = Date.now();
    
    while (!window.guestifyData?.pluginUrl && (Date.now() - startTime) < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    if (!window.guestifyData?.pluginUrl) {
        // Try backup data
        if (window.guestifyDataBackup?.pluginUrl) {
            console.warn('⚠️ Using backup guestifyData');
            window.guestifyData = window.guestifyDataBackup;
        } else {
            throw new Error('guestifyData not available - PHP localization failed');
        }
    }
    
    // Set global plugin URL
    window.GUESTIFY_PLUGIN_URL = window.guestifyData.pluginUrl;
    
    console.log('✅ Prerequisites validated');
}

/**
 * Validates that the enhanced component manager is properly available
 */
async function validateEnhancedComponentManager() {
    console.log('🔍 Validating enhanced component manager availability...');
    
    const checks = {
        windowComponentManager: !!window.componentManager,
        windowEnhancedComponentManager: !!window.enhancedComponentManager,
        hasAddComponent: typeof window.componentManager?.addComponent === 'function',
        hasInit: typeof window.componentManager?.init === 'function',
        isEnhancedType: window.componentManager?.constructor?.name?.includes('Enhanced')
    };
    
    console.log('📊 Enhanced Component Manager validation:', checks);
    
    if (!checks.windowComponentManager) {
        throw new Error('CRITICAL: No component manager available on window object');
    }
    
    if (!checks.hasAddComponent) {
        throw new Error('CRITICAL: Component manager missing addComponent method');
    }
    
    if (featureFlags.USE_ENHANCED_COMPONENT_MANAGER && !checks.isEnhancedType) {
        console.warn('⚠️ Expected enhanced component manager but got different type');
    }
    
    console.log('✅ Enhanced component manager validation passed');
}

/**
 * Runs the initialization sequence using the initialization manager
 */
async function runInitializationSequence() {
    try {
        // Use a simplified initialization sequence since core systems are already loaded
        return await initializationManager.initialize();
    } catch (error) {
        console.error('❌ Initialization manager failed:', error);
        
        // Try direct initializer if available
        if (window.initializer && typeof window.initializer === 'function') {
            console.log('🔄 Trying direct initializer as fallback...');
            try {
                await window.initializer();
                console.log('✅ Direct initializer succeeded');
                return true;
            } catch (initError) {
                console.error('❌ Direct initializer also failed:', initError);
                throw initError;
            }
        }
        
        throw error;
    }
}

/**
 * Shows a user-friendly error message when initialization fails
 * @param {Error} error - The initialization error
 */
function showInitializationError(error) {
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
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 10px; overflow: auto;">${JSON.stringify(window.getSystemInfo?.() || {}, null, 2)}</pre>
                </details>
            </div>
        `;
    }
}

/**
 * Attempts a fallback initialization using direct methods
 * @param {Error} originalError - The original initialization error
 */
async function attemptFallbackInitialization(originalError) {
    structuredLogger.warn('INIT', 'Attempting fallback initialization', {
        originalError: originalError.message
    });
    
    try {
        // If systems are registered but initialization failed, try manual setup
        if (window.componentManager && window.stateManager) {
            console.log('🔄 Systems available, attempting manual initialization...');
            
            // Manual component manager initialization
            if (typeof window.componentManager.init === 'function') {
                window.componentManager.init();
            }
            
            // Manual state restoration
            const { saveService } = await import('./services/save-service.js');
            if (saveService && saveService.loadState) {
                const savedState = saveService.loadState();
                if (savedState && window.stateManager.setInitialState) {
                    window.stateManager.setInitialState(savedState);
                }
            }
            
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
            throw new Error('Core systems not available for fallback');
        }
        
    } catch (fallbackError) {
        structuredLogger.error('INIT', 'Fallback initialization also failed', fallbackError, {
            originalError: originalError.message
        });
        
        // Generate comprehensive error report
        structuredLogger.generateErrorReport();
    }
}

// Global flag to prevent double initialization
let initializationStarted = false;

/**
 * Safe initialization wrapper that prevents double execution
 */
function safeInitializeBuilder() {
    if (initializationStarted) {
        structuredLogger.warn('INIT', 'Initialization already started, skipping duplicate call');
        return;
    }
    
    initializationStarted = true;
    structuredLogger.info('INIT', 'Starting Media Kit Builder initialization with new architecture');
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