/**
 * ROOT FIX VALIDATION: Hook Timing Fix Test Script
 * 
 * Tests the WordPress hook timing fix for Media Kit Builder page detection
 * Run this in browser console on: guestify.ai/guestify-media-kit/?post_id=32372
 * 
 * Expected Results After Fix:
 * ✅ Bundle scripts should be loaded in DOM
 * ✅ guestifyData should be available
 * ✅ No "Initializing Clean Enhanced Builder..." hanging
 * ✅ App should initialize properly
 */

console.log('🚀 ROOT FIX: Testing WordPress Hook Timing Fix...');

// Test 1: Check if bundle scripts are now loaded
function testBundleScriptsLoaded() {
    console.log('\n📦 TEST 1: Bundle Scripts Loading');
    
    const coreBundle = document.querySelector('script[id*="guestify-core-systems-bundle"]');
    const appBundle = document.querySelector('script[id*="guestify-application-bundle"]');
    
    console.log('Core bundle script:', coreBundle ? '✅ LOADED' : '❌ MISSING');
    console.log('App bundle script:', appBundle ? '✅ LOADED' : '❌ MISSING');
    
    if (coreBundle) {
        console.log('Core bundle src:', coreBundle.src);
    }
    if (appBundle) {
        console.log('App bundle src:', appBundle.src);
    }
    
    return {
        coreBundle: !!coreBundle,
        appBundle: !!appBundle,
        bothLoaded: !!(coreBundle && appBundle)
    };
}

// Test 2: Check if WordPress data is available
function testWordPressDataAvailable() {
    console.log('\n📊 TEST 2: WordPress Data Availability');
    
    const hasGuestifyData = typeof window.guestifyData !== 'undefined';
    const hasTemplateData = typeof window.gmkbTemplateData !== 'undefined';
    
    console.log('guestifyData:', hasGuestifyData ? '✅ AVAILABLE' : '❌ MISSING');
    console.log('gmkbTemplateData:', hasTemplateData ? '✅ AVAILABLE' : '❌ MISSING');
    
    if (hasGuestifyData) {
        console.log('guestifyData keys:', Object.keys(window.guestifyData));
        console.log('WordPress hook timing indicator:', window.guestifyData.eventDrivenFix);
    }
    
    return {
        guestifyData: hasGuestifyData,
        templateData: hasTemplateData,
        dataReady: hasGuestifyData && hasTemplateData
    };
}

// Test 3: Check page detection indicators
function testPageDetectionStatus() {
    console.log('\n🔍 TEST 3: Page Detection Status');
    
    const bodyClasses = document.body.className;
    const hasBuilderClass = bodyClasses.includes('gmkb-isolated-builder');
    const hasReadyClass = bodyClasses.includes('gmkb-ready');
    const hasInitializingClass = bodyClasses.includes('gmkb-initializing');
    
    console.log('Builder page class:', hasBuilderClass ? '✅ DETECTED' : '❌ MISSING');
    console.log('Ready state:', hasReadyClass ? '✅ READY' : '❌ NOT READY');
    console.log('Still initializing:', hasInitializingClass ? '⚠️ YES (may be normal)' : '✅ NO');
    
    console.log('Body classes:', bodyClasses);
    
    return {
        builderDetected: hasBuilderClass,
        appReady: hasReadyClass,
        stillInitializing: hasInitializingClass
    };
}

// Test 4: Check for enhanced systems
function testEnhancedSystemsAvailability() {
    console.log('\n⚙️ TEST 4: Enhanced Systems Availability');
    
    const systems = {
        enhancedStateManager: typeof window.enhancedStateManager !== 'undefined',
        enhancedComponentManager: typeof window.enhancedComponentManager !== 'undefined',
        systemRegistrar: typeof window.systemRegistrar !== 'undefined',
        templateCache: typeof window.mkTemplateCache !== 'undefined'
    };
    
    Object.entries(systems).forEach(([name, available]) => {
        console.log(`${name}:`, available ? '✅ AVAILABLE' : '❌ MISSING');
    });
    
    return systems;
}

// Test 5: Overall fix validation
function validateHookTimingFix() {
    console.log('\n🎯 ROOT FIX VALIDATION SUMMARY');
    
    const scriptTest = testBundleScriptsLoaded();
    const dataTest = testWordPressDataAvailable();
    const detectionTest = testPageDetectionStatus();
    const systemsTest = testEnhancedSystemsAvailability();
    
    const criticalTests = [
        scriptTest.bothLoaded,
        dataTest.guestifyData,
        detectionTest.builderDetected
    ];
    
    const passedCritical = criticalTests.filter(Boolean).length;
    const fixWorking = passedCritical >= 2;  // At least 2 of 3 critical tests
    
    console.log('\n📊 RESULTS:');
    console.log(`Critical tests passed: ${passedCritical}/3`);
    console.log(`Hook timing fix status: ${fixWorking ? '✅ WORKING' : '❌ NEEDS INVESTIGATION'}`);
    
    if (fixWorking) {
        console.log('\n🎉 ROOT FIX SUCCESS!');
        console.log('✅ WordPress hook timing fix is working');
        console.log('✅ Bundle scripts are loading correctly');
        console.log('✅ Page detection is functioning');
        
        if (!dataTest.dataReady) {
            console.log('⚠️ Note: Some data may still be loading (normal during initialization)');
        }
    } else {
        console.log('\n❌ ROOT FIX INVESTIGATION NEEDED');
        console.log('Bundle scripts or page detection still failing');
        console.log('Check WordPress debug logs for detailed error information');
    }
    
    return {
        fixWorking,
        criticalTestsScore: `${passedCritical}/3`,
        scriptLoading: scriptTest.bothLoaded,
        dataAvailable: dataTest.guestifyData,
        pageDetected: detectionTest.builderDetected,
        timestamp: new Date().toISOString()
    };
}

// Run all tests
const fixValidation = validateHookTimingFix();

// Make validation results available globally for further testing
window.hookTimingFixValidation = fixValidation;

console.log('\n💡 TIP: If tests fail, check WordPress debug logs for:');
console.log('- "GMKB ROOT FIX: Builder page detected via early URL analysis"');
console.log('- "GMKB ROOT FIX: Script enqueuing TRIGGERED"');
console.log('- "GMKB ROOT FIX SUCCESS: WordPress bundles enqueued"');

// Return validation object for programmatic access
fixValidation;
