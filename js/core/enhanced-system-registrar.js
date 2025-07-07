/**
 * @file enhanced-system-registrar.js
 * @description Registers enhanced systems with the system registrar
 * CRITICAL FIX: Converted to static imports to eliminate race conditions
 */

import { systemRegistrar } from './system-registrar.js';
import { performanceMonitor } from '../utils/performance-monitor.js';

// CRITICAL FIX: Static imports to eliminate race conditions for core systems
import { enhancedStateManager } from './enhanced-state-manager.js';
import { enhancedComponentManager } from './enhanced-component-manager.js';
import { enhancedComponentRenderer } from './enhanced-component-renderer.js';

// CRITICAL FIX: Import the initializer system
import { initializer } from './media-kit-builder-init.js';

// CRITICAL FIX: Import missing template loading systems that caused 287s timeout
import { dynamicComponentLoader } from '../components/dynamic-component-loader.js';
import { templateCache } from '../utils/template-cache.js';

// PHASE 2.3 TASK 4: Import Enhanced Error Handler for comprehensive user guidance
import { enhancedErrorHandler } from '../utils/enhanced-error-handler.js';

/**
 * Registers all enhanced systems with the system registrar
 * CRITICAL FIX: Now fully synchronous for predictable initialization
 */
export async function registerEnhancedSystems() {
    const perfEnd = performanceMonitor.start('register-enhanced-systems');
    
    console.log('🔧 Enhanced System Registrar: Starting system registration...');
    
    try {
        // CRITICAL FIX: Validate core systems are available (they should be since they're static imports)
        console.log('📦 Validating core enhanced systems...');
        
        // Add comprehensive validation including missing template systems
        const validationResults = {
            stateManager: !!enhancedStateManager,
            componentManager: !!enhancedComponentManager,
            renderer: !!enhancedComponentRenderer,
            dynamicComponentLoader: !!dynamicComponentLoader,
            templateCache: !!templateCache,
            stateManagerMethods: typeof enhancedStateManager?.addComponent === 'function',
            componentManagerMethods: typeof enhancedComponentManager?.addComponent === 'function',
            rendererMethods: typeof enhancedComponentRenderer?.init === 'function',
            loaderMethods: typeof dynamicComponentLoader?.renderComponent === 'function',
            cacheMethods: typeof templateCache?.get === 'function'
        };
        
        console.log('🔍 System validation results:', validationResults);
        
        if (!enhancedStateManager) {
            throw new Error('Enhanced State Manager not available after static import');
        }
        
        if (!enhancedComponentManager) {
            throw new Error('Enhanced Component Manager not available after static import');
        }
        
        if (!enhancedComponentRenderer) {
            throw new Error('Enhanced Component Renderer not available after static import');
        }
        
        if (!dynamicComponentLoader) {
            throw new Error('Dynamic Component Loader not available after static import - this was causing 287s timeout!');
        }
        
        if (!templateCache) {
            throw new Error('Template Cache not available after static import - this was causing template system failures!');
        }
        
        console.log('✅ All core enhanced systems validated (including template loading infrastructure)');        
        
        // Register Core Enhanced Systems (synchronous)
        console.log('📝 Registering core enhanced systems...');
        
        // State Manager
        systemRegistrar.register('stateManager', enhancedStateManager);
        console.log('✅ State Manager: Enhanced');
        
        // Component Manager - CRITICAL
        systemRegistrar.register('componentManager', enhancedComponentManager);
        console.log('✅ Component Manager: Enhanced');
        
        // Renderer
        systemRegistrar.register('renderer', enhancedComponentRenderer);
        console.log('✅ Renderer: Enhanced');
        
        // CRITICAL FIX: Register the initializer system
        systemRegistrar.register('initializer', initializer);
        console.log('✅ Initializer: Enhanced');
        
        // CRITICAL FIX: Register missing template loading systems (ROOT CAUSE OF 287s TIMEOUT)
        systemRegistrar.register('dynamicComponentLoader', dynamicComponentLoader);
        console.log('✅ Dynamic Component Loader: Enhanced (FIXES 287s timeout)');
        
        systemRegistrar.register('templateCache', templateCache);
        console.log('✅ Template Cache: Enhanced (FIXES template system failures)');
        
        // PHASE 2.3 TASK 4: Register Enhanced Error Handler for user guidance
        systemRegistrar.register('enhancedErrorHandler', enhancedErrorHandler);
        console.log('✅ Enhanced Error Handler: Phase 2.3 Task 4 - User guidance system active');
        
        // CRITICAL FIX: Expose template systems globally for compatibility
        window.dynamicComponentLoader = dynamicComponentLoader;
        window.mkTemplateCache = templateCache;
        console.log('✅ Template systems exposed globally: dynamicComponentLoader, mkTemplateCache');
        
        // PHASE 2.3 TASK 4: Expose enhanced error handler globally
        window.enhancedErrorHandler = enhancedErrorHandler;
        console.log('✅ Enhanced Error Handler exposed globally for error panel interactions');
        
        // Validate enhanced component manager
        console.log('🔍 Enhanced Component Manager validation:', {
            imported: !!enhancedComponentManager,
            type: typeof enhancedComponentManager,
            constructor: enhancedComponentManager?.constructor?.name,
            hasAddComponent: typeof enhancedComponentManager?.addComponent === 'function',
            hasInit: typeof enhancedComponentManager?.init === 'function',
            hasUpdateComponent: typeof enhancedComponentManager?.updateComponent === 'function'
        });
        
        // CRITICAL FIX: Validate initializer system
        console.log('🔍 Initializer validation:', {
            imported: !!initializer,
            type: typeof initializer,
            constructor: initializer?.constructor?.name,
            hasInitialize: typeof initializer?.initialize === 'function',
            getStatus: initializer?.getStatus()
        });
        
        // CRITICAL FIX: Phase 3 Systems - Optional enhancements that won't block initialization
        console.log('📝 Registering Phase 3 systems (optional enhancements)...');
        
        // These are optional and won't block initialization if they fail
        upgradePhase3SystemsAsync();
        
        // Services registration (also optional)
        systemRegistrar.register('saveService', null);
        systemRegistrar.register('historyService', null);
        
        console.log('✅ Phase 3 Systems: Will upgrade asynchronously in background');
        
        // Verify registration worked
        const registeredSystems = systemRegistrar.list();
        console.log('✅ Enhanced System Registrar: Core registration complete');
        console.log('📋 Registered systems:', registeredSystems);
        
        // CRITICAL FIX: Validate all 7 core systems including template loading infrastructure and error handling
        // These are required for proper functionality - template systems were missing causing failures
        if (registeredSystems.length < 7) { // Require all 7 core systems (was 6, added error handler)
            throw new Error(`Only ${registeredSystems.length} core systems registered, expected at least 7 (state, component, renderer, initializer, loader, cache, errorHandler)`);
        }
        
        // Validate critical template systems are working
        if (!window.dynamicComponentLoader) {
            throw new Error('CRITICAL: dynamicComponentLoader not exposed globally - template loading will fail');
        }
        
        if (!window.mkTemplateCache) {
            throw new Error('CRITICAL: mkTemplateCache not exposed globally - template caching will fail');
        }
        
        // PHASE 2.3 TASK 4: Validate enhanced error handler is working
        if (!window.enhancedErrorHandler) {
            throw new Error('CRITICAL: enhancedErrorHandler not exposed globally - error guidance will fail');
        }
        
        perfEnd();
        return true;
        
    } catch (error) {
        console.error('❌ Enhanced System Registrar failed:', error);
        perfEnd();
        throw error;
    }
}

/**
 * CRITICAL FIX: Asynchronously upgrade Phase 3 systems without blocking initialization
 * This allows optional enhancements without creating race conditions
 */
async function upgradePhase3SystemsAsync() {
    console.log('🔄 Attempting async upgrade of Phase 3 systems...');
    
    // Register placeholders first so they appear in the system list
    systemRegistrar.register('stateValidator', null);
    systemRegistrar.register('uiRegistry', null);
    systemRegistrar.register('stateHistory', null);
    systemRegistrar.register('eventBus', null);
    
    // These upgrades happen in background and won't affect core functionality
    const upgrades = [
        upgradeStateValidator(),
        upgradeUIRegistry(),
        upgradeStateHistory(),
        upgradeEventBus()
    ];
    
    try {
        await Promise.allSettled(upgrades);
        console.log('✅ Phase 3 system upgrades completed');
    } catch (error) {
        console.warn('⚠️ Some Phase 3 upgrades failed, but core functionality unaffected:', error);
    }
}

async function upgradeStateValidator() {
    try {
        const { stateValidator } = await import('./state-validator.js');
        if (stateValidator) {
            systemRegistrar.register('stateValidator', stateValidator);
            console.log('✅ State Validator: Upgraded');
        }
    } catch (error) {
        console.debug('📝 State Validator: Not available');
    }
}

async function upgradeUIRegistry() {
    try {
        const { uiRegistry } = await import('./ui-registry.js');
        if (uiRegistry) {
            systemRegistrar.register('uiRegistry', uiRegistry);
            console.log('✅ UI Registry: Upgraded');
        }
    } catch (error) {
        console.debug('📝 UI Registry: Not available');
    }
}

async function upgradeStateHistory() {
    try {
        const { stateHistory } = await import('./state-history.js');
        if (stateHistory) {
            systemRegistrar.register('stateHistory', stateHistory);
            console.log('✅ State History: Upgraded');
        }
    } catch (error) {
        console.debug('📝 State History: Not available');
    }
}

async function upgradeEventBus() {
    try {
        const { eventBus } = await import('./event-bus.js');
        if (eventBus) {
            systemRegistrar.register('eventBus', eventBus);
            console.log('✅ Event Bus: Upgraded');
        }
    } catch (error) {
        console.debug('📝 Event Bus: Not available');
    }
}

/**
 * Gets the current system configuration for debugging
 * @returns {object} Current system information
 */
export function getEnhancedSystemInfo() {
    const registeredSystems = systemRegistrar.getAll();
    
    return {
        registered: Object.keys(registeredSystems).reduce((acc, name) => {
            acc[name] = !!registeredSystems[name];
            return acc;
        }, {}),
        global: {
            stateManager: !!window.stateManager,
            componentManager: !!window.componentManager,
            enhancedComponentManager: !!window.enhancedComponentManager,
            renderer: !!window.renderer,
            initializer: !!window.initializer,
            dynamicComponentLoader: !!window.dynamicComponentLoader,
            mkTemplateCache: !!window.mkTemplateCache,
            enhancedErrorHandler: !!window.enhancedErrorHandler
        },
        types: {
            stateManager: registeredSystems.stateManager?.constructor?.name || 'Unknown',
            componentManager: registeredSystems.componentManager?.constructor?.name || 'Unknown',
            renderer: registeredSystems.renderer?.constructor?.name || 'Unknown',
            dynamicComponentLoader: registeredSystems.dynamicComponentLoader?.constructor?.name || 'Unknown',
            templateCache: registeredSystems.templateCache?.constructor?.name || 'Unknown',
            enhancedErrorHandler: registeredSystems.enhancedErrorHandler?.constructor?.name || 'Unknown'
        },
        methods: {
            componentManagerAddComponent: typeof registeredSystems.componentManager?.addComponent === 'function',
            componentManagerUpdateComponent: typeof registeredSystems.componentManager?.updateComponent === 'function',
            enhancedComponentManagerAddComponent: typeof window.enhancedComponentManager?.addComponent === 'function',
            enhancedComponentManagerUpdateComponent: typeof window.enhancedComponentManager?.updateComponent === 'function',
            initializerInitialize: typeof registeredSystems.initializer?.initialize === 'function',
            dynamicComponentLoaderRender: typeof window.dynamicComponentLoader?.renderComponent === 'function',
            templateCacheGet: typeof window.mkTemplateCache?.get === 'function'
        }
    };
}

// Expose system info globally for debugging
window.getEnhancedSystemInfo = getEnhancedSystemInfo;