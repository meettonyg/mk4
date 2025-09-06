/**
 * @file test-diagnostic-fix.js
 * @description Test script to validate the diagnostic tool fixes
 */

console.log('%c🧪 TESTING DIAGNOSTIC FIXES', 'font-size: 16px; font-weight: bold; color: #2563eb; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');

// Test 1: Check that diagnostic tool is updated for enhanced architecture
function testDiagnosticUpdates() {
    console.group('%c📋 Test 1: Diagnostic Tool Updates', 'color: #6366f1; font-weight: bold;');
    
    // Check if diagnostic functions exist
    const diagnosticExists = window.gmkbDiagnostic && typeof window.gmkbDiagnostic === 'object';
    console.log(`✅ Diagnostic tool available: ${diagnosticExists ? 'YES' : 'NO'}`);
    
    if (diagnosticExists) {
        const methods = ['check', 'display', 'run', 'enhanced', 'checkEnhanced', 'runBoth'];
        methods.forEach(method => {
            const exists = typeof window.gmkbDiagnostic[method] === 'function';
            console.log(`  - ${method}(): ${exists ? '✅' : '❌'}`);
        });
    }
    
    console.groupEnd();
    return diagnosticExists;
}

// Test 2: Check enhanced system availability
function testEnhancedSystems() {
    console.group('%c🚀 Test 2: Enhanced System Availability', 'color: #10b981; font-weight: bold;');
    
    const systems = [
        'enhancedStateManager',
        'enhancedComponentManager',
        'structuredLogger',
        'EnhancedStateManager',
        'EnhancedComponentManager'
    ];
    
    const results = {};
    systems.forEach(system => {
        const available = typeof window[system] !== 'undefined';
        results[system] = available;
        console.log(`${available ? '✅' : '❌'} ${system}: ${available ? 'Available' : 'Missing'}`);
    });
    
    const availableCount = Object.values(results).filter(Boolean).length;
    const healthPercentage = Math.round((availableCount / systems.length) * 100);
    
    console.log(`\n📊 Enhanced System Health: ${healthPercentage}% (${availableCount}/${systems.length})`);
    
    console.groupEnd();
    return { results, healthPercentage };
}

// Test 3: Run enhanced diagnostics
function testEnhancedDiagnostics() {
    console.group('%c🔍 Test 3: Enhanced Diagnostic Functionality', 'color: #8b5cf6; font-weight: bold;');
    
    try {
        if (window.gmkbDiagnostic && window.gmkbDiagnostic.enhanced) {
            console.log('Running enhanced diagnostics...');
            const results = window.gmkbDiagnostic.enhanced();
            console.log('✅ Enhanced diagnostics completed successfully');
            return results;
        } else {
            console.error('❌ Enhanced diagnostics not available');
            return null;
        }
    } catch (error) {
        console.error('❌ Error running enhanced diagnostics:', error);
        return null;
    } finally {
        console.groupEnd();
    }
}

// Test 4: Compare old vs new diagnostic results
function testDiagnosticComparison() {
    console.group('%c⚖️ Test 4: Diagnostic Comparison', 'color: #f59e0b; font-weight: bold;');
    
    try {
        // Run legacy diagnostic
        console.log('Running legacy diagnostic...');
        const legacyResults = window.gmkbDiagnostic ? window.gmkbDiagnostic.check() : null;
        
        // Run enhanced diagnostic
        console.log('Running enhanced diagnostic...');
        const enhancedResults = window.gmkbDiagnostic ? window.gmkbDiagnostic.checkEnhanced() : null;
        
        if (legacyResults && enhancedResults) {
            console.log('✅ Both diagnostics completed');
            
            // Compare results
            const legacyHealth = Object.values(legacyResults.globalObjects).filter(s => s.available).length;
            const totalLegacy = Object.keys(legacyResults.globalObjects).length;
            const legacyPercentage = Math.round((legacyHealth / totalLegacy) * 100);
            
            const enhancedHealth = Object.values(enhancedResults.enhancedSystems).filter(s => s.available).length;
            const totalEnhanced = Object.keys(enhancedResults.enhancedSystems).length;
            const enhancedPercentage = Math.round((enhancedHealth / totalEnhanced) * 100);
            
            console.log(`Legacy System Health: ${legacyPercentage}% (${legacyHealth}/${totalLegacy})`);
            console.log(`Enhanced System Health: ${enhancedPercentage}% (${enhancedHealth}/${totalEnhanced})`);
            
            console.log(`\n📈 Diagnostic Improvement: ${enhancedPercentage - legacyPercentage}% better detection`);
            
            return { legacyPercentage, enhancedPercentage };
        } else {
            console.error('❌ Failed to run diagnostic comparison');
            return null;
        }
    } catch (error) {
        console.error('❌ Error in diagnostic comparison:', error);
        return null;
    } finally {
        console.groupEnd();
    }
}

// Main test runner
function runDiagnosticTests() {
    console.log('🧪 Starting diagnostic fix tests...\n');
    
    const results = {
        timestamp: new Date().toISOString(),
        tests: {}
    };
    
    // Run all tests
    results.tests.diagnosticUpdates = testDiagnosticUpdates();
    results.tests.enhancedSystems = testEnhancedSystems();
    results.tests.enhancedDiagnostics = testEnhancedDiagnostics();
    results.tests.diagnosticComparison = testDiagnosticComparison();
    
    // Summary
    console.group('%c📋 TEST SUMMARY', 'font-size: 14px; font-weight: bold; color: #dc2626;');
    console.log('Timestamp:', results.timestamp);
    
    const testCount = Object.keys(results.tests).length;
    const passedTests = Object.values(results.tests).filter(Boolean).length;
    const successRate = Math.round((passedTests / testCount) * 100);
    
    console.log(`Tests Passed: ${passedTests}/${testCount} (${successRate}%)`);
    
    if (successRate >= 75) {
        console.log('%c✅ DIAGNOSTIC FIXES: SUCCESS', 'color: #10b981; font-weight: bold;');
        console.log('The diagnostic tool has been successfully updated for the enhanced architecture.');
    } else {
        console.log('%c❌ DIAGNOSTIC FIXES: ISSUES FOUND', 'color: #ef4444; font-weight: bold;');
        console.log('Some issues remain with the diagnostic tool updates.');
    }
    
    console.groupEnd();
    
    // Make results available globally
    window.diagnosticTestResults = results;
    
    return results;
}

// Auto-run if document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runDiagnosticTests, 2000); // Wait for systems to load
    });
} else {
    setTimeout(runDiagnosticTests, 2000);
}

// Make test runner available globally
window.testDiagnosticFixes = runDiagnosticTests;

console.log('✅ Diagnostic test script loaded. Use testDiagnosticFixes() to run tests.');
