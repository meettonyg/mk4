/**
 * @file enhanced-system-registrar.js
 * @description ROOT FIX: WordPress-Compatible Enhanced System Registrar
 * Converted from ES6 modules to WordPress-compatible IIFE format
 * Registers enhanced systems with the system registrar
 * 
 * CRITICAL FIX: Removes ES6 import dependencies that fail in WordPress loading
 */

// ROOT FIX: WordPress-compatible IIFE wrapper
(function() {
    'use strict';
    
    // ROOT FIX: Create fallback utilities if imports not available
    const systemRegistrar = window.systemRegistrar || {
        register: function(name, system) {
            console.log(`Registering system: ${name}`);
            window[name] = system;
        },
        get: function(name) {
            return window[name];
        },
        list: function() {
            return Object.keys(window).filter(key => key.endsWith('Manager') || key.endsWith('Service'));
        },
        getAll: function() {
            const systems = {};
            this.list().forEach(name => {
                systems[name] = window[name];
            });
            return systems;
        }
    };
    
    const performanceMonitor = window.performanceMonitor || {
        start: () => () => {}
    };
    
    // ROOT FIX: Access enhanced systems from window (they should be loaded by now)
    const enhancedStateManager = window.enhancedStateManager;
    const enhancedComponentManager = window.enhancedComponentManager;
    const enhancedComponentRenderer = window.enhancedComponentRenderer;
    const renderingQueueManager = window.renderingQueueManager;
    const initializer = window.initializer;
    const dynamicComponentLoader = window.dynamicComponentLoader;
    const templateCache = window.templateCache;
    const enhancedErrorHandler = window.enhancedErrorHandler;
    const mkcgDataMapper = window.mkcgDataMapper;

/**
 * Registers all enhanced systems with the system registrar
 * CRITICAL FIX: Now fully synchronous for predictable initialization
 */
async function registerEnhancedSystems() {
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
            renderingQueueManager: !!renderingQueueManager,
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
        
        // ROOT FIX: Rendering Queue Manager - CRITICAL for race-condition-free rendering
        systemRegistrar.register('renderingQueueManager', renderingQueueManager);
        console.log('✅ Rendering Queue Manager: Enterprise-grade rendering coordination');
        
        // PHASE 2 INTEGRATION: Register Phase 2 rendering optimization systems
        // TEMPORARILY DISABLED - will be loaded post-initialization
        // systemRegistrar.register('renderValidator', renderValidator);
        // console.log('✅ Render Validator: PHASE 2 - Enterprise validation with health scoring (1-100 scale)');
        // 
        // systemRegistrar.register('renderRecoveryManager', renderRecoveryManager);
        // console.log('✅ Render Recovery Manager: PHASE 2 - Automatic recovery with 4 strategies (retry, fallback, reset, replace)');
        
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
        
        // PHASE 2.1: Register MKCG Data Mapper for data integration
        systemRegistrar.register('mkcgDataMapper', mkcgDataMapper);
        console.log('✅ MKCG Data Mapper: Enhanced data integration system active');
        
        // CRITICAL FIX: Expose template systems globally for compatibility
        window.dynamicComponentLoader = dynamicComponentLoader;
        window.mkTemplateCache = templateCache;
        window.renderingQueueManager = renderingQueueManager;
        console.log('✅ Template systems exposed globally: dynamicComponentLoader, mkTemplateCache');
        console.log('✅ Queue system exposed globally: renderingQueueManager');
        
        // PHASE 2 INTEGRATION: Expose Phase 2 systems globally
        // TEMPORARILY DISABLED - will be loaded post-initialization
        // window.renderValidator = renderValidator;
        // window.renderRecoveryManager = renderRecoveryManager;
        // console.log('✅ PHASE 2: Render validator exposed globally for 99%+ success rate targeting');
        // console.log('✅ PHASE 2: Render recovery manager exposed globally for automatic error recovery');
        
        // PHASE 2.3 TASK 4: Expose enhanced error handler globally
        window.enhancedErrorHandler = enhancedErrorHandler;
        console.log('✅ Enhanced Error Handler exposed globally for error panel interactions');
        
        // PHASE 2.1: Expose MKCG Data Mapper globally
        window.mkcgDataMapper = mkcgDataMapper;
        console.log('✅ MKCG Data Mapper exposed globally for component data mapping');
        
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
        
        // ROOT FIX: IMMEDIATE global exposure after registration to prevent race conditions
        console.log('🔧 ROOT FIX: Immediately exposing all core systems globally...');
        
        // Get all registered systems
        const allSystems = systemRegistrar.getAll();
        
        // Expose each system globally with validation
        Object.entries(allSystems).forEach(([name, instance]) => {
            if (instance !== null) {
                window[name] = instance;
                console.log(`✅ ROOT FIX: Exposed window.${name}`);
                
                // Special enhanced component manager validation
                if (name === 'componentManager' && instance.constructor?.name?.includes('Enhanced')) {
                    window.enhancedComponentManager = instance;
                    console.log('✅ ROOT FIX: Also exposed as window.enhancedComponentManager');
                    
                    // Validate critical methods
                    if (typeof instance.addComponent !== 'function') {
                        console.error('❌ ROOT FIX: Enhanced component manager missing addComponent method!');
                    } else {
                        console.log('✅ ROOT FIX: Enhanced component manager addComponent method confirmed');
                    }
                }
                
                // Special enhanced state manager validation
                if (name === 'stateManager' && instance.constructor?.name?.includes('Enhanced')) {
                    window.enhancedStateManager = instance;
                    console.log('✅ ROOT FIX: Also exposed as window.enhancedStateManager');
                }
            } else {
                console.warn(`⚠️ ROOT FIX: System ${name} is null, not exposing`);
            }
        });
        
        // ROOT FIX: Critical validation after exposure
        const criticalSystems = ['stateManager', 'componentManager', 'renderer', 'enhancedComponentManager'];
        const missingCritical = criticalSystems.filter(name => !window[name]);
        
        if (missingCritical.length > 0) {
            console.error('❌ ROOT FIX: Critical systems missing after exposure:', missingCritical);
            
            // EMERGENCY FIX: Try direct exposure
            if (!window.enhancedComponentManager && enhancedComponentManager) {
                window.enhancedComponentManager = enhancedComponentManager;
                console.log('🚑 ROOT FIX: Emergency exposed enhancedComponentManager directly');
            }
            
            if (!window.enhancedStateManager && enhancedStateManager) {
                window.enhancedStateManager = enhancedStateManager;
                console.log('🚑 ROOT FIX: Emergency exposed enhancedStateManager directly');
            }
            
            if (!window.componentManager && enhancedComponentManager) {
                window.componentManager = enhancedComponentManager;
                console.log('🚑 ROOT FIX: Emergency exposed componentManager as enhancedComponentManager');
            }
            
            if (!window.stateManager && enhancedStateManager) {
                window.stateManager = enhancedStateManager;
                console.log('🚑 ROOT FIX: Emergency exposed stateManager as enhancedStateManager');
            }
            
            if (!window.renderer && enhancedComponentRenderer) {
                window.renderer = enhancedComponentRenderer;
                console.log('🚑 ROOT FIX: Emergency exposed renderer as enhancedComponentRenderer');
            }
        } else {
            console.log('✅ ROOT FIX: All critical systems successfully exposed globally');
        }
        
        // ROOT FIX: Final validation that all systems are properly exposed
        const finalValidation = {
            enhancedComponentManager: !!window.enhancedComponentManager,
            componentManager: !!window.componentManager,
            enhancedStateManager: !!window.enhancedStateManager,
            stateManager: !!window.stateManager,
            renderer: !!window.renderer,
            dynamicComponentLoader: !!window.dynamicComponentLoader,
            mkTemplateCache: !!window.mkTemplateCache
        };
        
        console.log('🔍 ROOT FIX: Final system exposure validation:', finalValidation);
        
        const exposedCount = Object.values(finalValidation).filter(Boolean).length;
        const totalRequired = Object.keys(finalValidation).length;
        
        if (exposedCount === totalRequired) {
            console.log('🎉 ROOT FIX: All systems properly exposed globally!');
        } else {
            console.warn(`⚠️ ROOT FIX: Only ${exposedCount}/${totalRequired} systems exposed`);
        }
        
        // CRITICAL FIX: Validate all 9 core systems including template loading infrastructure, error handling, data mapper, and rendering queue
        // These are required for proper functionality - template systems were missing causing failures
        // PHASE 2 systems will be loaded post-initialization to prevent circular dependencies
        if (registeredSystems.length < 9) { // Require 9 core systems (Phase 2 loaded separately)
            console.error(`❌ ROOT FIX: Only ${registeredSystems.length} core systems registered, expected at least 9 (state, component, renderer, initializer, loader, cache, errorHandler, mkcgDataMapper, renderingQueueManager)`);
            
            // ROOT FIX: Show what's missing
            const expectedSystems = ['stateManager', 'componentManager', 'renderer', 'initializer', 'dynamicComponentLoader', 'templateCache', 'enhancedErrorHandler', 'mkcgDataMapper', 'renderingQueueManager'];
            const missing = expectedSystems.filter(sys => !systemRegistrar.getAll()[sys]);
            console.error('❌ ROOT FIX: Missing systems:', missing);
            
            throw new Error(`Only ${registeredSystems.length} core systems registered, expected at least 9. Missing: ${missing.join(', ')}`);
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
        
        // PHASE 2.1: Validate MKCG data mapper is working
        if (!window.mkcgDataMapper) {
            throw new Error('CRITICAL: mkcgDataMapper not exposed globally - component data mapping will fail');
        }
        
        // PHASE 2: Validate rendering queue is working
        if (!window.renderingQueueManager) {
            throw new Error('CRITICAL: renderingQueueManager not exposed globally - rendering coordination will fail');
        }
        
        // PHASE 2: Additional systems will be loaded post-initialization to prevent circular dependencies
        console.log('ℹ️ PHASE 2: Render validator and recovery manager will be loaded after core initialization');
        
        // =====================================
        // ROOT FIX: EVENT-DRIVEN NOTIFICATION
        // =====================================
        // After all systems are registered and exposed globally:
        console.log('🎉 All core systems registered and exposed globally');
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('coreSystemsReady', {
            detail: {
                systems: systemRegistrar.list(),
                timestamp: Date.now(),
                globalSystems: {
                    enhancedComponentManager: !!window.enhancedComponentManager,
                    stateManager: !!window.stateManager,
                    renderer: !!window.renderer,
                    dynamicComponentLoader: !!window.dynamicComponentLoader,
                    mkTemplateCache: !!window.mkTemplateCache,
                    enhancedErrorHandler: !!window.enhancedErrorHandler,
                    mkcgDataMapper: !!window.mkcgDataMapper,
                    renderingQueueManager: !!window.renderingQueueManager
                    // Phase 2 systems loaded post-initialization
                },
                architecture: 'enhanced-phase1',
                readyTimestamp: Date.now(),
                performanceData: {
                    initializationTime: Date.now() - window.gmkbPhase1?.startTime || 0,
                    systemCount: registeredSystems.length
                }
            }
        }));
        
        console.log('✅ coreSystemsReady event dispatched');
        
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
function getEnhancedSystemInfo() {
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
            enhancedErrorHandler: !!window.enhancedErrorHandler,
            renderingQueueManager: !!window.renderingQueueManager
            // Phase 2 systems loaded separately: renderValidator, renderRecoveryManager
        },
        types: {
            stateManager: registeredSystems.stateManager?.constructor?.name || 'Unknown',
            componentManager: registeredSystems.componentManager?.constructor?.name || 'Unknown',
            renderer: registeredSystems.renderer?.constructor?.name || 'Unknown',
            dynamicComponentLoader: registeredSystems.dynamicComponentLoader?.constructor?.name || 'Unknown',
            templateCache: registeredSystems.templateCache?.constructor?.name || 'Unknown',
            enhancedErrorHandler: registeredSystems.enhancedErrorHandler?.constructor?.name || 'Unknown',
            renderingQueueManager: registeredSystems.renderingQueueManager?.constructor?.name || 'Unknown'
        },
        methods: {
            componentManagerAddComponent: typeof registeredSystems.componentManager?.addComponent === 'function',
            componentManagerUpdateComponent: typeof registeredSystems.componentManager?.updateComponent === 'function',
            enhancedComponentManagerAddComponent: typeof window.enhancedComponentManager?.addComponent === 'function',
            enhancedComponentManagerUpdateComponent: typeof window.enhancedComponentManager?.updateComponent === 'function',
            initializerInitialize: typeof registeredSystems.initializer?.initialize === 'function',
            dynamicComponentLoaderRender: typeof window.dynamicComponentLoader?.renderComponent === 'function',
            templateCacheGet: typeof window.mkTemplateCache?.get === 'function',
            renderingQueueAdd: typeof window.renderingQueueManager?.addToQueue === 'function'
            // Phase 2 methods loaded separately
        }
    };
}

// ROOT FIX: WordPress-compatible global exposure
window.registerEnhancedSystems = registerEnhancedSystems;
window.upgradePhase3SystemsAsync = upgradePhase3SystemsAsync;
window.getEnhancedSystemInfo = getEnhancedSystemInfo;

// ROOT FIX: Also expose for immediate access
if (!window.enhancedSystemRegistrar) {
    window.enhancedSystemRegistrar = {
        registerEnhancedSystems,
        upgradePhase3SystemsAsync,
        getEnhancedSystemInfo
    };
}

console.log('✅ ROOT FIX: Enhanced System Registrar exposed globally (WordPress-compatible)');

})(); // ROOT FIX: Close IIFE wrapper