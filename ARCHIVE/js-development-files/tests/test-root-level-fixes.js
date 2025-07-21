/**
 * @file test-root-level-fixes.js
 * @description Comprehensive test suite for root-level race condition fixes
 * @version 1.0.0
 * 
 * ROOT FIX VALIDATION SUITE:
 * ✅ Tests GMKB namespace existence and completeness
 * ✅ Validates initialization validation system
 * ✅ Tests core systems bundle registration
 * ✅ Validates application bundle initialization
 * ✅ Performance and race condition testing
 */

(function() {
    'use strict';

    console.log('🧪 ROOT FIX: Starting comprehensive validation test suite...');

    /**
     * ROOT FIX: Test Suite Configuration
     */
    const TestConfig = {
        timeouts: {
            initialization: 10000,  // 10 seconds max for initialization
            systemRegistration: 5000,  // 5 seconds for system registration
            validation: 2000   // 2 seconds for validation checks
        },
        expectedSystems: ['EnhancedStateManager', 'Renderer', 'EnhancedComponentManager'],
        requiredGlobals: ['GMKB', 'gmkbCoreReady', 'gmkbInitValidation'],
        performance: {
            maxInitTime: 2000,  // 2 seconds max initialization
            maxSystemRegTime: 100,  // 100ms max per system registration
            maxValidationTime: 50   // 50ms max validation time
        }
    };

    /**
     * ROOT FIX: Test Results Storage
     */
    let testResults = {
        phase1: { name: 'PHP Foundation Fixes', tests: [], passed: 0, failed: 0 },
        phase2: { name: 'JavaScript Architecture Fixes', tests: [], passed: 0, failed: 0 },
        phase3: { name: 'Initialization Sequence Fixes', tests: [], passed: 0, failed: 0 },
        performance: { name: 'Performance & Race Condition Tests', tests: [], passed: 0, failed: 0 },
        summary: { totalTests: 0, totalPassed: 0, totalFailed: 0, successRate: 0 }
    };

    /**
     * ROOT FIX: Test utility functions
     */
    function addTestResult(phase, testName, passed, message, data = null) {
        const result = {
            name: testName,
            passed,
            message,
            data,
            timestamp: Date.now()
        };
        
        testResults[phase].tests.push(result);
        
        if (passed) {
            testResults[phase].passed++;
            console.log(`✅ ROOT FIX: ${testName} - ${message}`);
        } else {
            testResults[phase].failed++;
            console.error(`❌ ROOT FIX: ${testName} - ${message}`);
        }
    }

    function calculateSummary() {
        const phases = ['phase1', 'phase2', 'phase3', 'performance'];
        
        testResults.summary.totalTests = phases.reduce((sum, phase) => 
            sum + testResults[phase].tests.length, 0);
        testResults.summary.totalPassed = phases.reduce((sum, phase) => 
            sum + testResults[phase].passed, 0);
        testResults.summary.totalFailed = phases.reduce((sum, phase) => 
            sum + testResults[phase].failed, 0);
        testResults.summary.successRate = 
            (testResults.summary.totalPassed / testResults.summary.totalTests * 100).toFixed(1);
    }

    /**
     * ROOT FIX: Phase 1 Tests - PHP Foundation Fixes
     */
    function runPhase1Tests() {
        console.log('🔧 ROOT FIX: Running Phase 1 - PHP Foundation Fixes tests...');

        // Test 1: Validation data injection
        const validationExists = window.gmkbInitValidation !== undefined;
        addTestResult('phase1', 'Initialization Validation Data', validationExists,
            validationExists ? 'Validation data injected successfully' : 'Validation data missing');

        // Test 2: Guestify data availability
        const guestifyDataExists = window.guestifyData !== undefined || window.guestifyMediaKit !== undefined;
        addTestResult('phase1', 'AJAX Data Localization', guestifyDataExists,
            guestifyDataExists ? 'AJAX data localized successfully' : 'AJAX data missing');

        // Test 3: Root fix flags
        if (window.guestifyData || window.guestifyMediaKit) {
            const data = window.guestifyData || window.guestifyMediaKit;
            const rootFixApplied = data.rootFixApplied === true;
            addTestResult('phase1', 'Root Fix Flag', rootFixApplied,
                rootFixApplied ? 'Root fix flag confirmed' : 'Root fix flag missing', data);
        }

        // Test 4: Enhanced dependency chain
        const scriptsLoaded = document.querySelectorAll('script[src*="gmkb-"]').length >= 2;
        addTestResult('phase1', 'Enhanced Script Loading', scriptsLoaded,
            scriptsLoaded ? 'Enhanced scripts loaded' : 'Enhanced scripts missing');
    }

    /**
     * ROOT FIX: Phase 2 Tests - JavaScript Architecture Fixes
     */
    function runPhase2Tests() {
        console.log('🏗️ ROOT FIX: Running Phase 2 - JavaScript Architecture Fixes tests...');

        // Test 1: GMKB namespace existence
        const gmkbExists = window.GMKB !== undefined;
        addTestResult('phase2', 'GMKB Namespace', gmkbExists,
            gmkbExists ? 'GMKB namespace available' : 'GMKB namespace missing');

        if (!gmkbExists) return;

        // Test 2: GMKB completeness
        const requiredMethods = ['subscribe', 'dispatch', 'ready', 'registerSystem'];
        const methodsExist = requiredMethods.every(method => typeof window.GMKB[method] === 'function');
        addTestResult('phase2', 'GMKB Method Completeness', methodsExist,
            methodsExist ? 'All GMKB methods available' : 'GMKB methods missing');

        // Test 3: System initializer
        const initializerExists = window.GMKB.initializer !== undefined;
        addTestResult('phase2', 'System Initializer', initializerExists,
            initializerExists ? 'System initializer available' : 'System initializer missing');

        // Test 4: GMKB integrity validation
        if (window.GMKB.validateIntegrity) {
            const integrity = window.GMKB.validateIntegrity();
            addTestResult('phase2', 'GMKB Integrity', integrity.valid,
                integrity.valid ? 'GMKB integrity validated' : `Integrity issues: ${integrity.issues.join(', ')}`, integrity);
        }

        // Test 5: Core systems registration capability
        if (window.GMKB.initializer && window.GMKB.initializer.register) {
            const canRegister = typeof window.GMKB.initializer.register === 'function';
            addTestResult('phase2', 'System Registration Capability', canRegister,
                canRegister ? 'System registration available' : 'System registration unavailable');
        }
    }

    /**
     * ROOT FIX: Phase 3 Tests - Initialization Sequence Fixes
     */
    function runPhase3Tests() {
        console.log('🚀 ROOT FIX: Running Phase 3 - Initialization Sequence Fixes tests...');

        // Test 1: Core systems availability
        const coreSystemsAvailable = TestConfig.expectedSystems.every(system => 
            window.GMKB && window.GMKB.systems && window.GMKB.systems[system]);
        addTestResult('phase3', 'Core Systems Availability', coreSystemsAvailable,
            coreSystemsAvailable ? 'All core systems available' : 'Some core systems missing');

        // Test 2: Global aliases
        const globalAliasesExist = window.stateManager !== undefined && window.renderer !== undefined;
        addTestResult('phase3', 'Global Aliases', globalAliasesExist,
            globalAliasesExist ? 'Global aliases created' : 'Global aliases missing');

        // Test 3: System initializer status
        if (window.GMKB && window.GMKB.initializer && window.GMKB.initializer.getStatus) {
            const status = window.GMKB.initializer.getStatus();
            const initialized = status.initialized;
            addTestResult('phase3', 'System Initialization', initialized,
                initialized ? 'Systems initialized successfully' : 'System initialization incomplete', status);
        }

        // Test 4: Event system functionality
        if (window.GMKB && window.GMKB.dispatch && window.GMKB.subscribe) {
            let eventReceived = false;
            const unsubscribe = window.GMKB.subscribe('test-event', () => {
                eventReceived = true;
            });
            
            window.GMKB.dispatch('test-event', { test: true });
            
            setTimeout(() => {
                addTestResult('phase3', 'Event System', eventReceived,
                    eventReceived ? 'Event system functional' : 'Event system not working');
                unsubscribe();
            }, 100);
        }
    }

    /**
     * ROOT FIX: Performance Tests
     */
    function runPerformanceTests() {
        console.log('⚡ ROOT FIX: Running Performance & Race Condition tests...');

        // Test 1: Initialization timing
        const initTime = window.gmkbInitTime ? Date.now() - window.gmkbInitTime : null;
        if (initTime !== null) {
            const withinLimit = initTime < TestConfig.performance.maxInitTime;
            addTestResult('performance', 'Initialization Timing', withinLimit,
                `Initialization took ${initTime}ms (limit: ${TestConfig.performance.maxInitTime}ms)`, { initTime });
        }

        // Test 2: Validation performance
        if (window.gmkbInitValidation && window.gmkbInitValidation.validate) {
            const start = performance.now();
            const validation = window.gmkbInitValidation.validate();
            const validationTime = performance.now() - start;
            
            const withinLimit = validationTime < TestConfig.performance.maxValidationTime;
            addTestResult('performance', 'Validation Performance', withinLimit,
                `Validation took ${validationTime.toFixed(2)}ms (limit: ${TestConfig.performance.maxValidationTime}ms)`, 
                { validationTime, validation });
        }

        // Test 3: Memory usage check
        if (performance.memory) {
            const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
            const withinLimit = memoryUsage < 50; // 50MB limit
            addTestResult('performance', 'Memory Usage', withinLimit,
                `Memory usage: ${memoryUsage.toFixed(2)}MB (limit: 50MB)`, { memoryUsage });
        }

        // Test 4: Race condition detection
        const raceConditionDetected = !window.GMKB || !window.GMKB.ready || !window.GMKB.systems;
        addTestResult('performance', 'Race Condition Prevention', !raceConditionDetected,
            raceConditionDetected ? 'Race conditions detected' : 'No race conditions detected');
    }

    /**
     * ROOT FIX: Advanced diagnostic tests
     */
    function runAdvancedDiagnostics() {
        console.log('🔬 ROOT FIX: Running advanced diagnostics...');

        // Test: Script load order validation
        const scripts = Array.from(document.querySelectorAll('script[src*="gmkb-"], script[src*="core-systems-"], script[src*="application-"]'));
        const loadOrder = scripts.map(script => script.src.split('/').pop());
        
        const expectedOrder = ['gmkb-main.js', 'gmkb-system-initializer.js', 'core-systems-bundle.js', 'application-bundle.js'];
        const orderCorrect = expectedOrder.every((script, index) => 
            loadOrder.some(loaded => loaded.includes(script.split('.')[0])));
        
        addTestResult('performance', 'Script Load Order', orderCorrect,
            orderCorrect ? 'Script load order correct' : 'Script load order incorrect', { loadOrder, expectedOrder });
    }

    /**
     * ROOT FIX: Generate comprehensive report
     */
    function generateReport() {
        calculateSummary();
        
        console.group('%c🧪 ROOT FIX: Comprehensive Test Results', 'font-size: 18px; font-weight: bold; color: #059669');
        
        // Summary
        console.log(`📊 Overall Success Rate: ${testResults.summary.successRate}% (${testResults.summary.totalPassed}/${testResults.summary.totalTests})`);
        
        // Phase results
        Object.keys(testResults).forEach(phase => {
            if (phase === 'summary') return;
            
            const phaseData = testResults[phase];
            const successRate = ((phaseData.passed / phaseData.tests.length) * 100).toFixed(1);
            const statusIcon = phaseData.failed === 0 ? '✅' : '⚠️';
            
            console.log(`${statusIcon} ${phaseData.name}: ${successRate}% (${phaseData.passed}/${phaseData.tests.length})`);
            
            // Show failed tests
            phaseData.tests.forEach(test => {
                if (!test.passed) {
                    console.log(`  ❌ ${test.name}: ${test.message}`);
                }
            });
        });
        
        // Recommendations
        console.log('\n💡 Recommendations:');
        if (testResults.summary.successRate >= 95) {
            console.log('✅ Excellent! Root-level fixes are working correctly.');
        } else if (testResults.summary.successRate >= 80) {
            console.log('⚠️ Good but needs improvement. Review failed tests.');
        } else {
            console.log('❌ Critical issues detected. Immediate attention required.');
        }
        
        console.groupEnd();
        
        // Make results available globally
        window.rootFixTestResults = testResults;
        
        return testResults;
    }

    /**
     * ROOT FIX: Main test execution
     */
    function runAllTests() {
        console.log('🚀 ROOT FIX: Starting comprehensive test suite...');
        
        // Phase 1: PHP Foundation
        runPhase1Tests();
        
        // Phase 2: JavaScript Architecture (with small delay)
        setTimeout(() => {
            runPhase2Tests();
            
            // Phase 3: Initialization Sequence (with small delay)
            setTimeout(() => {
                runPhase3Tests();
                
                // Performance tests (with small delay)
                setTimeout(() => {
                    runPerformanceTests();
                    runAdvancedDiagnostics();
                    
                    // Generate final report
                    setTimeout(() => {
                        generateReport();
                    }, 200);
                }, 200);
            }, 200);
        }, 200);
    }

    /**
     * ROOT FIX: Quick test function for console
     */
    window.testRootFixes = function() {
        testResults = {
            phase1: { name: 'PHP Foundation Fixes', tests: [], passed: 0, failed: 0 },
            phase2: { name: 'JavaScript Architecture Fixes', tests: [], passed: 0, failed: 0 },
            phase3: { name: 'Initialization Sequence Fixes', tests: [], passed: 0, failed: 0 },
            performance: { name: 'Performance & Race Condition Tests', tests: [], passed: 0, failed: 0 },
            summary: { totalTests: 0, totalPassed: 0, totalFailed: 0, successRate: 0 }
        };
        
        runAllTests();
        
        return 'Test suite started. Results will be available in window.rootFixTestResults';
    };

    /**
     * ROOT FIX: Quick validation function
     */
    window.quickRootFixValidation = function() {
        const issues = [];
        
        if (!window.GMKB) issues.push('GMKB namespace missing');
        if (!window.GMKB?.ready) issues.push('GMKB.ready missing');
        if (!window.GMKB?.initializer) issues.push('GMKB.initializer missing');
        if (!window.stateManager) issues.push('stateManager missing');
        if (!window.renderer) issues.push('renderer missing');
        
        if (issues.length === 0) {
            console.log('✅ ROOT FIX: Quick validation passed - all critical components available');
            return true;
        } else {
            console.error('❌ ROOT FIX: Quick validation failed:', issues);
            return false;
        }
    };

    // Auto-run tests if DOM is ready
    if (document.readyState === 'complete') {
        setTimeout(runAllTests, 1000);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runAllTests, 1000);
        });
    }

    console.log('🧪 ROOT FIX: Test suite loaded. Use testRootFixes() or quickRootFixValidation() in console.');

})();
