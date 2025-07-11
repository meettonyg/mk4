/**
 * REAL-TIME SYSTEM VALIDATION - Root Fix Verification
 * 
 * This script validates that our root fixes are working in real-time
 * and helps identify any remaining initialization issues.
 */

console.log('🔧 REAL-TIME SYSTEM VALIDATION - Testing root fixes...');
console.log('='.repeat(60));

// Test 1: Check if methods are immediately available
console.log('🧪 TEST 1: Method Availability Check');
try {
    // Import and test Enhanced Error Handler
    import('./utils/enhanced-error-handler.js').then(module => {
        const { enhancedErrorHandler } = module;
        
        console.log('✅ Enhanced Error Handler imported');
        console.log('✅ handleError method:', typeof enhancedErrorHandler.handleError);
        console.log('✅ displayError method:', typeof enhancedErrorHandler.displayError);
        
        if (typeof enhancedErrorHandler.handleError === 'function' && 
            typeof enhancedErrorHandler.displayError === 'function') {
            console.log('🎉 Enhanced Error Handler: ALL METHODS AVAILABLE');
        } else {
            console.error('❌ Enhanced Error Handler: Methods still missing');
        }
    });
    
    // Import and test MKCG Data Mapper
    import('./utils/mkcg-data-mapper.js').then(module => {
        const { mkcgDataMapper } = module;
        
        console.log('✅ MKCG Data Mapper imported');
        console.log('✅ mapDataToComponent method:', typeof mkcgDataMapper.mapDataToComponent);
        console.log('✅ getDataAvailability method:', typeof mkcgDataMapper.getDataAvailability);
        
        if (typeof mkcgDataMapper.mapDataToComponent === 'function' && 
            typeof mkcgDataMapper.getDataAvailability === 'function') {
            console.log('🎉 MKCG Data Mapper: ALL METHODS AVAILABLE');
        } else {
            console.error('❌ MKCG Data Mapper: Methods still missing');
        }
    });
    
} catch (error) {
    console.error('❌ Import test failed:', error);
}

// Test 2: Check current console for validation messages
console.log('\n🧪 TEST 2: Console Validation Messages Check');
console.log('Look for these SUCCESS messages in console:');
console.log('  ✅ Enhanced Error Handler: Required methods immediately available for validation');
console.log('  ✅ MKCG Data Mapper: Required getDataAvailability method immediately available for validation');

// Test 3: Check system registrar validation
console.log('\n🧪 TEST 3: System Registrar Validation');
if (window.systemRegistrar) {
    const stats = window.systemRegistrar.getStats();
    console.log('System registrar stats:', stats);
    
    const coreSystems = window.systemRegistrar.areCoreSytemsReady();
    console.log('Core systems ready:', coreSystems);
    
    if (coreSystems.missing.length > 0) {
        console.warn('⚠️ Missing core systems:', coreSystems.missing);
    } else {
        console.log('✅ All core systems registered');
    }
} else {
    console.warn('⚠️ System registrar not available');
}

// Test 4: Check for remaining warning patterns
console.log('\n🧪 TEST 4: Browser Cache and Warning Check');
console.log('If you still see warnings, try:');
console.log('1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
console.log('2. Clear browser cache for this site');
console.log('3. Open DevTools Network tab and check "Disable cache"');

// Test 5: Check what the current error message actually says
console.log('\n🧪 TEST 5: Current Error Analysis');
console.log('The message you showed:');
console.log('  "🚀 Using fallback window load trigger for initialization"');
console.log('');
console.log('This is DIFFERENT from the original missing methods warnings.');
console.log('This suggests the method fixes WORKED and this is a new/different issue.');
console.log('');
console.log('Original warnings that should be GONE:');
console.log('  ❌ System enhancedErrorHandler missing expected methods: [handleError, displayError]');
console.log('  ❌ System mkcgDataMapper missing expected methods: [getDataAvailability]');

// Test 6: Force method validation right now
console.log('\n🧪 TEST 6: Force Validation Test');
try {
    // Test the enhanced error handler methods directly
    if (window.enhancedErrorHandler) {
        console.log('Direct test - enhancedErrorHandler available');
        console.log('handleError type:', typeof window.enhancedErrorHandler.handleError);
        console.log('displayError type:', typeof window.enhancedErrorHandler.displayError);
        
        // Try calling the methods with test parameters
        try {
            window.enhancedErrorHandler.handleError('Test error', { module: 'TEST' });
            console.log('✅ handleError method callable');
        } catch (e) {
            console.log('⚠️ handleError method exists but threw:', e.message);
        }
        
        try {
            window.enhancedErrorHandler.displayError('Test display error');
            console.log('✅ displayError method callable');
        } catch (e) {
            console.log('⚠️ displayError method exists but threw:', e.message);
        }
    } else {
        console.log('❌ window.enhancedErrorHandler not available');
    }
    
    // Test the MKCG data mapper methods directly
    if (window.mkcgDataMapper) {
        console.log('Direct test - mkcgDataMapper available');
        console.log('mapDataToComponent type:', typeof window.mkcgDataMapper.mapDataToComponent);
        console.log('getDataAvailability type:', typeof window.mkcgDataMapper.getDataAvailability);
        
        // Try calling the methods with test parameters
        try {
            const availability = window.mkcgDataMapper.getDataAvailability();
            console.log('✅ getDataAvailability method callable, result:', availability);
        } catch (e) {
            console.log('⚠️ getDataAvailability method exists but threw:', e.message);
        }
    } else {
        console.log('❌ window.mkcgDataMapper not available');
    }
    
} catch (error) {
    console.error('❌ Direct validation test failed:', error);
}

console.log('\n='.repeat(60));
console.log('🎯 CONCLUSION:');
console.log('If the original "missing methods" warnings are gone, the ROOT FIX WORKED!');
console.log('The new message about "fallback window load trigger" is a different issue.');
console.log('Please confirm: Are you still seeing the ORIGINAL missing methods warnings?');
console.log('='.repeat(60));
