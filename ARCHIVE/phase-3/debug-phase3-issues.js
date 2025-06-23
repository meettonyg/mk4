// PHASE 3 DEBUG SCRIPT - Run this in browser console to diagnose issues

console.log('%c🔍 Phase 3 Debug Analysis', 'font-size: 16px; font-weight: bold; color: #FF5722');
console.log('==========================================\n');

// Check 1: Are the expected console messages appearing?
console.log('🔍 Step 1: Checking console messages...');
console.log('Expected messages should include:');
console.log('   - "🔧 ConditionalLoader: Starting system initialization..."');
console.log('   - "🚀 ConditionalLoader: Initializing Phase 3 systems..."');
console.log('   - "✅ ConditionalLoader: X/5 Phase 3 systems initialized"');
console.log('\nIf you don\'t see these messages, the conditional-loader.js changes aren\'t executing.\n');

// Check 2: Module loading status
console.log('🔍 Step 2: Current system availability...');
const systemStatus = {
    enhancedStateManager: !!window.enhancedStateManager,
    stateValidator: !!window.stateValidator,
    uiRegistry: !!window.uiRegistry,
    stateHistory: !!window.stateHistory,
    eventBus: !!window.eventBus,
    saveService: !!window.saveService,
    stateManager: !!window.stateManager,
    componentManager: !!window.componentManager,
    renderer: !!window.renderer,
    initializer: !!window.initializer,
    getSystemInfo: !!window.getSystemInfo
};

console.table(systemStatus);

// Check 3: Look for any JavaScript errors
console.log('\n🔍 Step 3: Error checking...');
if (window.console && window.console.memory) {
    console.log('Memory usage:', window.console.memory);
}

// Check 4: Try to manually access the modules
console.log('\n🔍 Step 4: Testing manual module access...');

// Test if we can manually import modules
try {
    console.log('Testing dynamic import...');
    
    // This will fail in browser console but shows if imports work
    eval(`
        (async () => {
            try {
                const { stateValidator } = await import('./js/core/state-validator.js');
                console.log('✅ Manual import successful:', !!stateValidator);
                window.manualStateValidator = stateValidator;
            } catch (error) {
                console.log('❌ Manual import failed:', error.message);
            }
        })();
    `);
} catch (error) {
    console.log('❌ Manual import test failed:', error.message);
}

// Check 5: Check if files exist
console.log('\n🔍 Step 5: File existence check...');
const filesToCheck = [
    'js/core/state-validator.js',
    'js/core/ui-registry.js', 
    'js/core/state-history.js',
    'js/core/conditional-loader.js'
];

filesToCheck.forEach(file => {
    fetch(file)
        .then(response => {
            console.log(`${response.ok ? '✅' : '❌'} ${file}: ${response.ok ? 'EXISTS' : 'NOT FOUND'} (${response.status})`);
        })
        .catch(error => {
            console.log(`❌ ${file}: FETCH ERROR - ${error.message}`);
        });
});

// Check 6: Cache busting test
console.log('\n🔍 Step 6: Cache busting test...');
console.log('Try hard refresh: Ctrl+F5 or Ctrl+Shift+R');
console.log('If that doesn\'t work, we may need to add cache busting parameters.');

// Check 7: Feature flags
console.log('\n🔍 Step 7: Feature flags check...');
if (window.guestifyData) {
    console.log('guestifyData available:', !!window.guestifyData);
    console.log('Plugin URL:', window.guestifyData.pluginUrl);
    console.log('Features:', window.guestifyData.features);
} else {
    console.log('❌ guestifyData not available - this could be the root issue');
}

// Check 8: DOM readiness
console.log('\n🔍 Step 8: DOM and initialization state...');
console.log('Document ready state:', document.readyState);
console.log('Initialization started:', !!window.initializationStarted);

if (typeof window.initializationStarted === 'function') {
    console.log('Initialization started status:', window.initializationStarted());
}

// Summary
console.log('\n📋 SUMMARY');
console.log('=========');
console.log('If no console messages appear about ConditionalLoader, the changes aren\'t being executed.');
console.log('Most likely causes:');
console.log('1. Browser cache (try hard refresh)');
console.log('2. File not being loaded (check network tab)');
console.log('3. JavaScript error preventing execution');
console.log('4. Import path issues');

// Recommendations
console.log('\n💡 RECOMMENDED ACTIONS');
console.log('=====================');
console.log('1. Hard refresh the page (Ctrl+F5)');
console.log('2. Check Network tab in DevTools for failed JS file loads');
console.log('3. Check Console tab for any JavaScript errors');
console.log('4. If still failing, we may need to add timestamp cache busting');

console.log('\n🔧 MANUAL FIX TEST');
console.log('==================');
console.log('Try manually running this in console:');
console.log(`
// Test manual assignment
import('./js/core/state-validator.js').then(module => {
    window.stateValidator = module.stateValidator;
    console.log('Manual state validator:', !!window.stateValidator);
});
`);
