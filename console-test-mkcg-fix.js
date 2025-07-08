/**
 * COPY THIS ENTIRE SCRIPT INTO BROWSER CONSOLE
 * This script verifies that the mkcgDataMapper registration fix is working
 */

console.log('🔧 TESTING MKCG DATA MAPPER REGISTRATION FIX');
console.log('============================================');

// Test 1: Check if system registrar recognizes mkcgDataMapper
console.group('📋 Test 1: System Registrar Validation');
if (window.systemRegistrar) {
    const systems = window.systemRegistrar.getAll();
    const hasMkcgDataMapper = systems.hasOwnProperty('mkcgDataMapper');
    console.log(`${hasMkcgDataMapper ? '✅' : '❌'} mkcgDataMapper is a valid system: ${hasMkcgDataMapper}`);
    
    // List all valid systems
    console.log('📋 All valid systems:', Object.keys(systems));
} else {
    console.error('❌ System registrar not available');
}
console.groupEnd();

// Test 2: Check if mkcgDataMapper is registered
console.group('🔍 Test 2: Registration Status');
if (window.systemRegistrar) {
    const mkcgDataMapper = window.systemRegistrar.get('mkcgDataMapper');
    const isRegistered = mkcgDataMapper !== null;
    console.log(`${isRegistered ? '✅' : '⏳'} mkcgDataMapper registered: ${isRegistered}`);
    
    if (isRegistered) {
        console.log('📦 mkcgDataMapper instance:', mkcgDataMapper);
        console.log('🔧 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(mkcgDataMapper)).filter(m => typeof mkcgDataMapper[m] === 'function'));
    }
} else {
    console.error('❌ System registrar not available');
}
console.groupEnd();

// Test 3: Check core systems readiness
console.group('🏗️ Test 3: Core Systems Status');
if (window.checkCoreSystemsReady) {
    const coreSystemsStatus = window.checkCoreSystemsReady();
    console.log(`${coreSystemsStatus.ready ? '✅' : '❌'} Core systems ready: ${coreSystemsStatus.ready}`);
    console.log(`📊 Registered: ${coreSystemsStatus.registered}/${coreSystemsStatus.total}`);
    
    if (!coreSystemsStatus.ready) {
        console.log('⚠️ Missing systems:', coreSystemsStatus.missing);
    }
} else {
    console.error('❌ checkCoreSystemsReady function not available');
}
console.groupEnd();

// Test 4: Check if the registration fix resolved the initialization error
console.group('🚀 Test 4: Initialization Status');
const initErrors = {
    enhancedTimeout: document.querySelector('.initialization-error') !== null,
    consoleErrors: false // We can't check past console errors from script
};

if (!initErrors.enhancedTimeout) {
    console.log('✅ No initialization timeout error displayed');
} else {
    console.log('❌ Initialization error still present on page');
}

// Check if critical systems are available
const criticalSystemsAvailable = {
    enhancedComponentManager: !!window.enhancedComponentManager,
    enhancedStateManager: !!window.enhancedStateManager,
    mkcgDataMapper: !!window.mkcgDataMapper,
    stateManager: !!window.stateManager,
    componentManager: !!window.componentManager
};

const allCriticalAvailable = Object.values(criticalSystemsAvailable).every(v => v);
console.log(`${allCriticalAvailable ? '✅' : '❌'} All critical systems available: ${allCriticalAvailable}`);

if (!allCriticalAvailable) {
    console.log('🔍 System availability:', criticalSystemsAvailable);
}
console.groupEnd();

// Test 5: Get registration statistics
console.group('📊 Test 5: Registration Statistics');
if (window.systemRegistrar && window.systemRegistrar.getStats) {
    const stats = window.systemRegistrar.getStats();
    console.log('📈 Registration stats:', {
        totalAttempts: stats.totalRegistrations,
        successful: stats.successfulRegistrations,
        failed: stats.failedRegistrations,
        coreSystemCount: stats.coreSystemCount,
        totalSystemCount: stats.systemCount
    });
    
    // Check if there were any failed registrations
    if (stats.failedRegistrations > 0) {
        console.warn('⚠️ There were failed registration attempts');
        console.log('📋 Check registration history:', stats.registrationHistory.filter(r => !r.success));
    }
} else {
    console.error('❌ Registration statistics not available');
}
console.groupEnd();

// Summary
console.log('');
console.log('📊 SUMMARY');
console.log('==========');
console.log('The mkcgDataMapper registration fix has been applied.');
console.log('');
console.log('🔧 Next steps:');
console.log('1. If you still see errors, refresh the page to load with the fix');
console.log('2. After refresh, run this script again to verify');
console.log('3. Once all systems are registered, run: await testAllFixes()');
console.log('');
console.log('💡 For detailed debugging:');
console.log('   window.debugSystemRegistrar()  // Full system registrar report');
console.log('   emergencyDiagnostic()          // If available after refresh');
