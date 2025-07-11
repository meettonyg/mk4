/**
 * @file emergency-system-diagnostic.js
 * @description Emergency diagnostic to check core system availability
 * 
 * USAGE: Copy and paste into browser console to check system status
 */

console.log('🚨 EMERGENCY SYSTEM DIAGNOSTIC');
console.log('==============================');

(function emergencyDiagnostic() {
    const systems = {
        // Core WordPress/Plugin Systems
        guestifyData: {
            exists: !!window.guestifyData,
            hasPluginUrl: !!(window.guestifyData?.pluginUrl),
            hasMKCGData: !!(window.guestifyData?.mkcgData)
        },
        
        // Core State Management
        stateManager: {
            exists: !!window.stateManager,
            type: window.stateManager?.constructor?.name || 'unknown'
        },
        
        // Component Management
        componentManager: {
            exists: !!window.componentManager,
            type: window.componentManager?.constructor?.name || 'unknown'
        },
        
        enhancedComponentManager: {
            exists: !!window.enhancedComponentManager,
            isInitialized: window.enhancedComponentManager?.isInitialized,
            hasAddComponent: typeof window.enhancedComponentManager?.addComponent === 'function',
            type: window.enhancedComponentManager?.constructor?.name || 'unknown'
        },
        
        // Enhanced Systems
        enhancedStateManager: {
            exists: !!window.enhancedStateManager,
            isInitialized: window.enhancedStateManager?.isInitialized,
            type: window.enhancedStateManager?.constructor?.name || 'unknown'
        },
        
        // System Registration
        systemRegistrar: {
            exists: !!window.systemRegistrar,
            type: window.systemRegistrar?.constructor?.name || 'unknown'
        },
        
        // Renderer
        renderer: {
            exists: !!window.renderer,
            initialized: window.renderer?.initialized,
            type: window.renderer?.constructor?.name || 'unknown'
        },
        
        // Initialization
        initializationManager: {
            exists: !!window.initializationManager,
            type: window.initializationManager?.constructor?.name || 'unknown'
        },
        
        // Testing Systems
        testingFoundation: {
            exists: !!window.testingFoundation,
            type: window.testingFoundation?.constructor?.name || 'unknown'
        },
        
        implementationValidator: {
            exists: !!window.implementationValidator,
            type: window.implementationValidator?.constructor?.name || 'unknown'
        }
    };
    
    console.group('🔍 System Availability Check');
    
    Object.entries(systems).forEach(([systemName, system]) => {
        const exists = system.exists;
        const details = Object.entries(system)
            .filter(([key]) => key !== 'exists')
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        
        console.log(`${exists ? '✅' : '❌'} ${systemName}: ${exists ? 'Available' : 'Missing'}${details ? ` (${details})` : ''}`);
    });
    
    console.groupEnd();
    
    // Check DOM elements
    console.group('🏗️ DOM Elements Check');
    
    const domElements = {
        'media-kit-preview': document.getElementById('media-kit-preview'),
        'component-library-overlay': document.getElementById('component-library-overlay'),
        'component-grid': document.getElementById('component-grid'),
        'builder template': document.querySelector('.gmkb-builder-template'),
        'empty state container': document.querySelector('.empty-state-enhanced')
    };
    
    Object.entries(domElements).forEach(([name, element]) => {
        console.log(`${element ? '✅' : '❌'} ${name}: ${element ? 'Found' : 'Missing'}`);
    });
    
    console.groupEnd();
    
    // Check initialization status
    console.group('🚀 Initialization Status');
    
    const initFlags = {
        'mediaKitBuilderReady': window.mediaKitBuilderReady,
        'initializationStarted': window.initializationStarted,
        'gmkbIsolated': window.gmkbIsolated,
        'guestifyDataReady': window.guestifyDataReady,
        'guestifyBackupReady': window.guestifyBackupReady
    };
    
    Object.entries(initFlags).forEach(([flag, value]) => {
        console.log(`${value ? '✅' : '❌'} ${flag}: ${value || 'false'}`);
    });
    
    console.groupEnd();
    
    // Generate recommendations
    console.group('💡 Recommendations');
    
    const criticalMissing = Object.entries(systems)
        .filter(([name, system]) => !system.exists && ['enhancedComponentManager', 'stateManager', 'componentManager'].includes(name))
        .map(([name]) => name);
    
    if (criticalMissing.length > 0) {
        console.log('🔴 CRITICAL: Missing core systems:', criticalMissing.join(', '));
        console.log('📋 Action: Check system registration and initialization in main.js');
    }
    
    if (!window.enhancedComponentManager?.isInitialized) {
        console.log('⚠️ Enhanced component manager not initialized');
        console.log('📋 Action: Check initialization sequence');
    }
    
    if (!document.getElementById('media-kit-preview')) {
        console.log('⚠️ Builder template not loaded properly');
        console.log('📋 Action: Check template loading in PHP');
    }
    
    if (!window.mediaKitBuilderReady && !window.initializationStarted) {
        console.log('⚠️ Initialization has not started');
        console.log('📋 Action: Check main.js loading and execution');
    }
    
    console.groupEnd();
    
    // Summary
    const totalSystems = Object.keys(systems).length;
    const availableSystems = Object.values(systems).filter(system => system.exists).length;
    const availabilityRate = Math.round((availableSystems / totalSystems) * 100);
    
    console.log('');
    console.log('📊 SYSTEM AVAILABILITY SUMMARY');
    console.log('==============================');
    console.log(`Available Systems: ${availableSystems}/${totalSystems} (${availabilityRate}%)`);
    
    if (availabilityRate >= 80) {
        console.log('%c✅ System availability is good', 'color: #10b981; font-weight: bold;');
    } else if (availabilityRate >= 60) {
        console.log('%c⚠️ System availability needs attention', 'color: #f59e0b; font-weight: bold;');
    } else {
        console.log('%c🔴 Critical system availability issues', 'color: #ef4444; font-weight: bold;');
    }
    
    // Store results
    window.emergencyDiagnosticResults = {
        systems,
        domElements,
        initFlags,
        availabilityRate,
        criticalMissing,
        timestamp: new Date().toISOString()
    };
    
    console.log('');
    console.log('📋 Results stored in: window.emergencyDiagnosticResults');
    
    return window.emergencyDiagnosticResults;
})();

console.log(`
🔧 Emergency System Diagnostic Complete!

Key commands:
• emergencyDiagnostic()           // Re-run diagnostic
• window.emergencyDiagnosticResults  // View detailed results

If systems are missing, check:
1. main.js imports and loading
2. System registration in enhanced-system-registrar.js  
3. Template loading in PHP
4. Initialization sequence timing
`);
