/**
 * @file system-registrar.js
 * @description A central, lightweight registry for core application systems.
 * This module is designed to be dependency-free to avoid circular dependencies.
 * 
 * PHASE 1B CRITICAL FIXES:
 * - Added template loading systems (dynamicComponentLoader, templateCache) to fix 287s timeout
 * - Enhanced validation and error handling
 * - Added comprehensive debugging capabilities
 * 
 * @version 2.3.0-phase1b
 */

// CRITICAL FIX: Enhanced system registry with Phase 1B additions
const systems = {
    // Core systems (required for basic functionality)
    stateManager: null,
    componentManager: null,
    renderer: null,
    initializer: null,
    
    // CRITICAL FIX: Template loading systems (fixes 287s timeout issue)
    dynamicComponentLoader: null,
    templateCache: null,
    
    // ROOT FIX: Rendering coordination system
    renderingQueueManager: null,
    
    // PHASE 2.3 TASK 4: Enhanced error handling system
    enhancedErrorHandler: null,
    
    // PHASE 2.1: MKCG data mapper for component data integration
    mkcgDataMapper: null,
    
    // Enhancement systems (optional, improve functionality)
    stateValidator: null,
    uiRegistry: null,
    stateHistory: null,
    eventBus: null,
    saveService: null,
    historyService: null
};

// CRITICAL FIX: System registration statistics
const registrationStats = {
    totalRegistrations: 0,
    successfulRegistrations: 0,
    failedRegistrations: 0,
    registrationHistory: [],
    startTime: Date.now()
};

export const systemRegistrar = {
    /**
     * CRITICAL FIX: Enhanced system registration with validation and statistics
     */
    register: (name, instance) => {
        const registrationStart = Date.now();
        registrationStats.totalRegistrations++;
        
        try {
            if (systems.hasOwnProperty(name)) {
                const previousInstance = systems[name];
                systems[name] = instance;
                
                // CRITICAL FIX: Enhanced registration logging
                const registrationInfo = {
                    name,
                    timestamp: registrationStart,
                    instanceType: instance?.constructor?.name || (typeof instance),
                    isNull: instance === null,
                    wasReplacement: previousInstance !== null,
                    success: true
                };
                
                registrationStats.registrationHistory.push(registrationInfo);
                registrationStats.successfulRegistrations++;
                
                if (instance === null) {
                    console.log(`📝 System placeholder registered: ${name}`);
                } else {
                    console.log(`📝 System registered: ${name} (${registrationInfo.instanceType})`);
                    
                    // CRITICAL FIX: Validate system has expected methods for core systems
                    if (['stateManager', 'componentManager', 'renderer', 'dynamicComponentLoader', 'templateCache', 'enhancedErrorHandler', 'mkcgDataMapper', 'renderingQueueManager'].includes(name)) {
                        systemRegistrar.validateCoreSystem(name, instance);
                    }
                }
                
            } else {
                // CRITICAL FIX: Better error handling for unknown systems
                const errorInfo = {
                    name,
                    timestamp: registrationStart,
                    error: 'Unknown system',
                    success: false
                };
                
                registrationStats.registrationHistory.push(errorInfo);
                registrationStats.failedRegistrations++;
                
                console.warn(`⚠️ Unknown system registration attempted: ${name}`);
                console.warn(`📋 Valid system names: ${Object.keys(systems).join(', ')}`);
            }
            
        } catch (error) {
            registrationStats.failedRegistrations++;
            console.error(`❌ System registration failed for ${name}:`, error);
        }
    },
    
    /**
     * CRITICAL FIX: Enhanced system retrieval with validation
     */
    get: (name) => {
        if (!systems.hasOwnProperty(name)) {
            console.warn(`⚠️ Attempted to get unknown system: ${name}`);
            return null;
        }
        return systems[name];
    },
    
    /**
     * CRITICAL FIX: Enhanced system listing with metadata
     */
    getAll: () => ({ ...systems }),
    
    /**
     * CRITICAL FIX: Enhanced list function with detailed information
     */
    list: () => {
        const registeredSystems = Object.keys(systems).filter(name => systems[name] !== null);
        const systemDetails = registeredSystems.map(name => ({
            name,
            type: systems[name]?.constructor?.name || 'Unknown',
            hasInit: typeof systems[name]?.init === 'function',
            isCore: ['stateManager', 'componentManager', 'renderer', 'initializer', 'dynamicComponentLoader', 'templateCache', 'enhancedErrorHandler', 'mkcgDataMapper', 'renderingQueueManager'].includes(name)
        }));
        
        console.log('📋 Registered systems:', registeredSystems);
        console.log('📊 System details:', systemDetails);
        
        return registeredSystems;
    },
    
    /**
     * CRITICAL FIX: Validate core system has expected methods
     */
    validateCoreSystem: (name, instance) => {
        const expectedMethods = {
            stateManager: ['getState', 'addComponent'],
            componentManager: ['addComponent', 'init'],
            renderer: ['init', 'renderComponent'],
            dynamicComponentLoader: ['renderComponent', 'getTemplate'],
            templateCache: ['get', 'set'],
            enhancedErrorHandler: ['handleError', 'displayError'],
            mkcgDataMapper: ['mapDataToComponent', 'getDataAvailability'],
            renderingQueueManager: ['addToQueue', 'getStatistics']
        };
        
        const requiredMethods = expectedMethods[name];
        if (requiredMethods) {
            const missingMethods = requiredMethods.filter(method => 
                typeof instance[method] !== 'function'
            );
            
            if (missingMethods.length > 0) {
                console.warn(`⚠️ System ${name} missing expected methods:`, missingMethods);
            } else {
                console.log(`✅ System ${name} validation passed`);
            }
        }
    },
    
    /**
     * CRITICAL FIX: Get registration statistics for debugging
     */
    getStats: () => ({
        ...registrationStats,
        uptime: Date.now() - registrationStats.startTime,
        systemCount: Object.keys(systems).filter(name => systems[name] !== null).length,
        coreSystemCount: ['stateManager', 'componentManager', 'renderer', 'initializer', 'dynamicComponentLoader', 'templateCache', 'enhancedErrorHandler', 'mkcgDataMapper']
            .filter(name => systems[name] !== null).length
    }),
    
    /**
     * CRITICAL FIX: Generate comprehensive debug report
     */
    generateDebugReport: () => {
        const stats = systemRegistrar.getStats();
        const registeredSystems = systemRegistrar.list();
        
        console.group('🔍 System Registrar Debug Report');
        console.log('📊 Statistics:', stats);
        console.log('📋 Registered Systems:', registeredSystems);
        console.log('🕒 Registration History:', registrationStats.registrationHistory);
        console.groupEnd();
        
        return {
            stats,
            registeredSystems,
            registrationHistory: registrationStats.registrationHistory
        };
    },
    
    /**
     * CRITICAL FIX: Check if all core systems are registered
     */
    areCoreSytemsReady: () => {
        const coreSystemNames = ['stateManager', 'componentManager', 'renderer', 'initializer', 'dynamicComponentLoader', 'templateCache', 'enhancedErrorHandler', 'mkcgDataMapper', 'renderingQueueManager'];
        const missingCoreSystems = coreSystemNames.filter(name => systems[name] === null);
        
        return {
            ready: missingCoreSystems.length === 0,
            missing: missingCoreSystems,
            total: coreSystemNames.length,
            registered: coreSystemNames.length - missingCoreSystems.length
        };
    }
};

// CRITICAL FIX: Enhanced global exposure for debugging
window.systemRegistrar = systemRegistrar;

// CRITICAL FIX: Expose additional debugging helpers
window.debugSystemRegistrar = () => systemRegistrar.generateDebugReport();
window.checkCoreSystemsReady = () => systemRegistrar.areCoreSytemsReady();

console.log('📋 PHASE 1B: Enhanced System Registrar v2.3.0-phase1b ready');
console.log('🔧 Debug commands: window.debugSystemRegistrar(), window.checkCoreSystemsReady()');