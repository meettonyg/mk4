/**
 * GMKB Script Isolation Test Suite
 * 
 * Tests the comprehensive plugin isolation system to ensure
 * only required Media Kit Builder scripts are loading
 * 
 * Usage:
 * 1. Add ?test_isolation=1 to Media Kit Builder URL
 * 2. Open browser console
 * 3. Run: testScriptIsolation()
 * 
 * @version 1.0.0
 * @author Guestify Team
 */

window.testScriptIsolation = function() {
    console.group('🧪 GMKB SCRIPT ISOLATION TEST SUITE');
    
    // Test 1: Check blocked scripts are not present
    console.log('📋 Test 1: Blocked Scripts Detection');
    const shouldBeBlocked = [
        'lp-load-ajax',         // LearnPress
        'gpf-infinite-scroll',  // Guestify Podcast Feeds
        'podcast-selection',    // Interview Finder
        'breeze-prefetch',      // Breeze Cache
        'guestify-navigation',  // Theme
        'elementor-frontend',   // Elementor
        'sortablejs',          // Sortable library
        'modal-system',        // General modal
        'copytoclipboard'      // Utility
    ];
    
    let blockedFound = 0;
    shouldBeBlocked.forEach(script => {
        const element = document.getElementById(script + '-js');
        if (element) {
            console.warn('❌ Blocked script still present:', script);
            blockedFound++;
        } else {
            console.log('✅ Successfully blocked:', script);
        }
    });
    
    // Test 2: Check GMKB scripts are present
    console.log('\n📋 Test 2: Required GMKB Scripts Detection');
    const shouldBePresent = [
        'gmkb-structured-logger',
        'gmkb-enhanced-state-manager', 
        'gmkb-enhanced-component-manager',
        'gmkb-dynamic-component-loader',
        'gmkb-enhanced-component-renderer',
        'gmkb-main-script'
    ];
    
    let requiredFound = 0;
    shouldBePresent.forEach(script => {
        const element = document.getElementById(script + '-js');
        if (element) {
            console.log('✅ Required script present:', script);
            requiredFound++;
        } else {
            console.warn('❌ Required script missing:', script);
        }
    });
    
    // Test 3: jQuery isolation test
    console.log('\n📋 Test 3: jQuery Isolation Test');
    if (typeof jQuery === 'undefined') {
        console.log('✅ jQuery successfully isolated');
    } else {
        console.warn('⚠️ jQuery still present (may be needed by WordPress core)');
    }
    
    // Test 4: Performance impact
    console.log('\n📋 Test 4: Performance Impact Analysis');
    const totalScripts = document.querySelectorAll('script[id$="-js"]').length;
    const gmkbScripts = document.querySelectorAll('script[id^="gmkb-"]').length;
    const otherScripts = totalScripts - gmkbScripts;
    
    console.log(`📊 Total scripts loaded: ${totalScripts}`);
    console.log(`📊 GMKB scripts: ${gmkbScripts}`);
    console.log(`📊 Other scripts: ${otherScripts}`);
    
    // Test 5: Calculate isolation score
    console.log('\n📋 Test 5: Isolation Effectiveness Score');
    const blockingEffectiveness = ((shouldBeBlocked.length - blockedFound) / shouldBeBlocked.length) * 100;
    const loadingEffectiveness = (requiredFound / shouldBePresent.length) * 100;
    const overallScore = (blockingEffectiveness + loadingEffectiveness) / 2;
    
    console.log(`🛡️ Blocking effectiveness: ${Math.round(blockingEffectiveness)}%`);
    console.log(`⚡ Loading effectiveness: ${Math.round(loadingEffectiveness)}%`);
    console.log(`📊 Overall isolation score: ${Math.round(overallScore)}%`);
    
    // Final result
    if (overallScore >= 95) {
        console.log('🎉 EXCELLENT: Script isolation working perfectly!');
    } else if (overallScore >= 80) {
        console.log('✅ GOOD: Script isolation working well');
    } else if (overallScore >= 60) {
        console.log('⚠️ FAIR: Script isolation needs improvement');
    } else {
        console.log('❌ POOR: Script isolation system not working properly');
    }
    
    console.groupEnd();
    
    // Return results for programmatic testing
    return {
        blockedFound,
        requiredFound,
        totalScripts,
        blockingEffectiveness,
        loadingEffectiveness,
        overallScore,
        jqueryIsolated: typeof jQuery === 'undefined'
    };
};

// Quick test function for console
window.quickIsolationTest = function() {
    const results = testScriptIsolation();
    console.log(`Quick Test Result: ${Math.round(results.overallScore)}% isolation effectiveness`);
    return results.overallScore;
};

// Auto-run test if URL parameter is present
if (window.location.href.includes('test_isolation=1') || window.location.href.includes('debug_guestify=1')) {
    // Wait for page to fully load
    window.addEventListener('load', () => {
        setTimeout(() => {
            console.log('🔍 Auto-running script isolation test...');
            testScriptIsolation();
        }, 1000);
    });
}

console.log('🧪 GMKB Script Isolation Test Suite loaded. Run testScriptIsolation() or quickIsolationTest() to test.');
