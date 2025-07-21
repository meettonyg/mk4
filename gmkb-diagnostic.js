/**
 * @file gmkb-diagnostic.js - GMKB System Diagnostic Tool
 * @description Simple diagnostic to check if all systems are working properly
 */

console.log('%c🔍 GMKB DIAGNOSTIC TOOL LOADING...', 'font-weight: bold; color: #2563eb; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');

// ROOT FIX: Check global system availability
function checkGlobalSystems() {
    const diagnostics = {
        timestamp: new Date().toISOString(),
        systems: {},
        errors: [],
        warnings: [],
        globalObjects: {}
    };
    
    // Check core global objects
    const expectedGlobals = [
        'GMKB',
        'StateManager', 
        'ComponentManager',
        'UICoordinator',
        'structuredLogger',
        'GMKBHelpers',
        'enhancedErrorHandler'
    ];
    
    expectedGlobals.forEach(globalName => {
        const available = typeof window[globalName] !== 'undefined';
        diagnostics.globalObjects[globalName] = {
            available,
            type: available ? typeof window[globalName] : 'undefined'
        };
        
        if (!available) {
            diagnostics.errors.push(`Global object '${globalName}' not available`);
        }
    });
    
    // Check WordPress data
    diagnostics.systems.wordPressData = {
        available: !!window.gmkbData,
        data: window.gmkbData ? {
            ajaxUrl: !!window.gmkbData.ajaxUrl,
            nonce: !!window.gmkbData.nonce,
            postId: !!window.gmkbData.postId
        } : null
    };
    
    // Check module loading issues
    const modulesWithErrors = document.querySelectorAll('script[src*="enhanced-state-manager"], script[src*="main.js"]');
    modulesWithErrors.forEach(script => {
        if (script.onerror) {
            diagnostics.errors.push(`Script failed to load: ${script.src}`);
        }
    });
    
    return diagnostics;
}

// ROOT FIX: Display diagnostic results
function displayDiagnostics() {
    const results = checkGlobalSystems();
    
    console.group('%c🔍 GMKB SYSTEM DIAGNOSTICS', 'font-size: 16px; font-weight: bold; color: #2563eb;');
    console.log('Timestamp:', results.timestamp);
    
    // Global Objects Status
    console.group('📦 Global Objects');
    Object.entries(results.globalObjects).forEach(([name, status]) => {
        const emoji = status.available ? '✅' : '❌';
        console.log(`${emoji} ${name}:`, status.available ? `Available (${status.type})` : 'Missing');
    });
    console.groupEnd();
    
    // WordPress Data
    console.group('🔧 WordPress Integration');
    const wpEmoji = results.systems.wordPressData.available ? '✅' : '❌';
    console.log(`${wpEmoji} WordPress Data:`, results.systems.wordPressData.available ? 'Available' : 'Missing');
    if (results.systems.wordPressData.data) {
        console.log('  - AJAX URL:', results.systems.wordPressData.data.ajaxUrl ? '✅' : '❌');
        console.log('  - Nonce:', results.systems.wordPressData.data.nonce ? '✅' : '❌');
        console.log('  - Post ID:', results.systems.wordPressData.data.postId ? '✅' : '❌');
    }
    console.groupEnd();
    
    // Errors and Warnings
    if (results.errors.length > 0) {
        console.group('❌ Errors');
        results.errors.forEach(error => console.error(error));
        console.groupEnd();
    }
    
    if (results.warnings.length > 0) {
        console.group('⚠️ Warnings');
        results.warnings.forEach(warning => console.warn(warning));
        console.groupEnd();
    }
    
    // Summary
    const totalSystems = Object.keys(results.globalObjects).length;
    const availableSystems = Object.values(results.globalObjects).filter(s => s.available).length;
    const healthPercentage = Math.round((availableSystems / totalSystems) * 100);
    
    console.log(`\n📊 System Health: ${healthPercentage}% (${availableSystems}/${totalSystems} systems available)`);
    
    if (healthPercentage >= 80) {
        console.log('%c🎉 SYSTEM STATUS: HEALTHY', 'color: #10b981; font-weight: bold;');
    } else if (healthPercentage >= 60) {
        console.log('%c⚠️ SYSTEM STATUS: DEGRADED', 'color: #f59e0b; font-weight: bold;');
    } else {
        console.log('%c❌ SYSTEM STATUS: CRITICAL', 'color: #ef4444; font-weight: bold;');
    }
    
    console.groupEnd();
    
    // Make results available globally for debugging
    window.gmkbDiagnostics = results;
    
    return results;
}

// ROOT FIX: Initialize diagnostics
function initializeDiagnostics() {
    console.log('🔍 GMKB Diagnostic: Starting system check...');
    
    // Wait a moment for scripts to load
    setTimeout(() => {
        const results = displayDiagnostics();
        
        // Check for critical issues
        const criticalIssues = results.errors.filter(error => 
            error.includes('GMKB') || 
            error.includes('StateManager') || 
            error.includes('ComponentManager')
        );
        
        if (criticalIssues.length > 0) {
            console.error('🚨 CRITICAL ISSUES DETECTED:');
            criticalIssues.forEach(issue => console.error(`  - ${issue}`));
            
            // Provide troubleshooting suggestions
            console.group('🔧 TROUBLESHOOTING SUGGESTIONS');
            console.log('1. Check browser console for JavaScript errors');
            console.log('2. Verify all script files are loading correctly');
            console.log('3. Check WordPress enqueue configuration');
            console.log('4. Ensure proper dependency order in enqueue.php');
            console.groupEnd();
        }
        
    }, 1000);
}

// ROOT FIX: Auto-run diagnostics when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDiagnostics);
} else {
    initializeDiagnostics();
}

// ROOT FIX: Make diagnostic functions available globally
window.gmkbDiagnostic = {
    check: checkGlobalSystems,
    display: displayDiagnostics,
    run: initializeDiagnostics
};

console.log('✅ GMKB Diagnostic Tool loaded. Use gmkbDiagnostic.run() to check system health.');
