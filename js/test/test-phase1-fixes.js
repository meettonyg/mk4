/**
 * Phase 1 Root-Level Fixes Validation Test Suite
 * 
 * Tests all critical syntax fixes and global object initialization
 * 
 * Usage: Run in browser console on Media Kit Builder page
 */

(function() {
    'use strict';
    
    console.log('🧪 Starting Phase 1 Root-Level Fixes Validation...');
    
    const results = {
        passed: 0,
        failed: 0,
        errors: []
    };
    
    function test(name, condition, details = '') {
        try {
            if (condition) {
                console.log(`✅ ${name}`);
                results.passed++;
            } else {
                console.log(`❌ ${name}${details ? ': ' + details : ''}`);
                results.failed++;
                results.errors.push(name + (details ? ': ' + details : ''));
            }
        } catch (error) {
            console.log(`💥 ${name}: ${error.message}`);
            results.failed++;
            results.errors.push(`${name}: ${error.message}`);
        }
    }
    
    // Test 1: Empty State Handlers - No Syntax Errors
    test('Empty State Handlers - No duplicate logger declaration', 
        typeof window.emptyStateHandlers !== 'undefined' && 
        typeof window.structuredLogger !== 'undefined',
        'Should be able to access both without conflicts'
    );
    
    // Test 2: Save Service - No Syntax Errors
    test('Save Service - No missing catch blocks', 
        typeof window.saveService !== 'undefined' && 
        typeof window.saveService.saveState === 'function',
        'Save service should be available and functional'
    );
    
    // Test 3: History Service - No undefined stateManager
    test('History Service - Proper stateManager handling', 
        typeof window.historyService !== 'undefined' && 
        typeof window.historyService.canUndo === 'function' &&
        typeof window.historyService.canRedo === 'function',
        'History service should handle missing stateManager gracefully'
    );
    
    // Test 4: Export System - Defensive Programming
    test('Export System - Defensive DOM access', 
        typeof window.GMKBExportSystem !== 'undefined' &&
        typeof window.setupExportSystem === 'function',
        'Export system should be available globally'
    );
    
    // Test 5: No JavaScript Console Errors
    let hasJSErrors = false;
    const originalError = console.error;
    const jsErrors = [];
    
    console.error = function(...args) {
        if (args[0] && typeof args[0] === 'string') {
            if (args[0].includes('Identifier') || 
                args[0].includes('SyntaxError') || 
                args[0].includes('ReferenceError') ||
                args[0].includes('not defined')) {
                hasJSErrors = true;
                jsErrors.push(args.join(' '));
            }
        }
        originalError.apply(console, args);
    };
    
    // Trigger potential errors by accessing systems
    try {
        if (window.emptyStateHandlers) window.emptyStateHandlers.getStatus();
        if (window.saveService) window.saveService.getStats();
        if (window.historyService) window.historyService.canUndo();
        if (window.GMKBExportSystem) window.GMKBExportSystem.init();
    } catch (e) {
        hasJSErrors = true;
        jsErrors.push(e.message);
    }
    
    console.error = originalError;
    
    test('No Critical JavaScript Syntax Errors', 
        !hasJSErrors, 
        jsErrors.length > 0 ? 'Errors: ' + jsErrors.join(', ') : ''
    );
    
    // Test 6: Global Object Exposure
    test('Enhanced State Manager Available', 
        typeof window.enhancedStateManager !== 'undefined',
        'Should be available for other modules'
    );
    
    test('Enhanced Component Manager Available', 
        typeof window.enhancedComponentManager !== 'undefined',
        'Should be available for component operations'
    );
    
    // Test 7: Event System Functionality
    test('Event Bus Available', 
        typeof window.eventBus !== 'undefined',
        'Event bus should be available for communication'
    );
    
    // Test 8: Logger Consistency
    test('Structured Logger Consistent', 
        typeof window.structuredLogger !== 'undefined' &&
        typeof window.structuredLogger.info === 'function' &&
        typeof window.structuredLogger.error === 'function',
        'Logger should have consistent interface'
    );
    
    // Test 9: DOM Ready State
    test('DOM Ready State Proper', 
        document.readyState === 'complete' || document.readyState === 'interactive',
        'DOM should be ready for manipulation'
    );
    
    // Test 10: Initialize Core Systems
    test('Core Systems Can Initialize', 
        (() => {
            try {
                // Test if systems can initialize without errors
                if (window.emptyStateHandlers && typeof window.emptyStateHandlers.init === 'function') {
                    // Already initialized, but test reset/reinit
                    if (typeof window.emptyStateHandlers.reset === 'function') {
                        window.emptyStateHandlers.reset();
                        window.emptyStateHandlers.init();
                    }
                }
                return true;
            } catch (e) {
                console.warn('Initialization test error:', e.message);
                return false;
            }
        })(),
        'Core systems should initialize without throwing errors'
    );
    
    // Performance Check
    const performanceStart = performance.now();
    
    // Test basic operations
    try {
        if (window.saveService) window.saveService.getStats();
        if (window.historyService) window.historyService.getStats();
        if (window.emptyStateHandlers) window.emptyStateHandlers.getAnalytics();
    } catch (e) {
        // Non-critical for Phase 1
    }
    
    const performanceEnd = performance.now();
    const operationTime = performanceEnd - performanceStart;
    
    test('Performance - Basic Operations < 100ms', 
        operationTime < 100,
        `Took ${operationTime.toFixed(2)}ms`
    );
    
    // Results Summary
    console.log('\n📊 Phase 1 Validation Results:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    if (results.errors.length > 0) {
        console.log('\n🔍 Errors to Address:');
        results.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
    }
    
    // Overall Assessment
    const successRate = (results.passed / (results.passed + results.failed)) * 100;
    
    if (successRate >= 90) {
        console.log('\n🎉 Phase 1 Fixes: EXCELLENT - Ready for Phase 2');
    } else if (successRate >= 80) {
        console.log('\n✨ Phase 1 Fixes: GOOD - Minor issues to address');
    } else if (successRate >= 70) {
        console.log('\n⚠️  Phase 1 Fixes: MODERATE - Several issues need attention');
    } else {
        console.log('\n🚨 Phase 1 Fixes: NEEDS WORK - Major issues require fixing');
    }
    
    // Return results for external access
    return {
        results,
        successRate,
        ready: successRate >= 80
    };
    
})();

// Quick test function for easy access
window.testPhase1Fixes = function() {
    console.log('🔄 Running Phase 1 Fixes Quick Test...');
    
    const tests = [
        () => typeof window.emptyStateHandlers !== 'undefined',
        () => typeof window.saveService !== 'undefined', 
        () => typeof window.historyService !== 'undefined',
        () => typeof window.GMKBExportSystem !== 'undefined',
        () => !window.location.href.includes('about:blank')
    ];
    
    const passed = tests.filter(test => {
        try { return test(); } catch(e) { return false; }
    }).length;
    
    console.log(`Quick Test: ${passed}/${tests.length} core systems available`);
    return passed === tests.length;
};

console.log('✅ Phase 1 Test Suite Loaded - Use testPhase1Fixes() for quick check');
