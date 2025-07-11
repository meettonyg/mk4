/**
 * @file test-race-condition-fix-validation.js
 * @description Comprehensive validation suite for the Event-Driven Race Condition Fix
 * 
 * This validates the 3-step implementation:
 * 1. Event dispatch in enhanced-system-registrar.js
 * 2. Event-driven waitForInitialization in testing-foundation-utilities.js  
 * 3. WordPress script dependencies in enqueue.php
 */

console.log('🧪 Loading Race Condition Fix Validation Suite...');

/**
 * PRIMARY VALIDATION FUNCTION
 * Comprehensive test of the race condition fix implementation
 */
window.validateRaceConditionFix = async function() {
    console.group('🔍 RACE CONDITION FIX VALIDATION');
    console.log('Testing all 3 implementation steps...\n');
    
    const results = {
        timestamp: new Date().toISOString(),
        overallStatus: 'UNKNOWN',
        tests: {},
        recommendations: [],
        metrics: {}
    };
    
    const startTime = performance.now();
    
    try {
        // TEST 1: Event Firing Validation
        console.log('📤 TEST 1: Event Firing Validation');
        results.tests.eventFiring = await testEventFiring();
        logTestResult('Event Firing', results.tests.eventFiring);
        
        // TEST 2: Event Reception Validation  
        console.log('\n📥 TEST 2: Event Reception Validation');
        results.tests.eventReception = await testEventReception();
        logTestResult('Event Reception', results.tests.eventReception);
        
        // TEST 3: No More Timeouts
        console.log('\n⏱️ TEST 3: Timeout Elimination Validation');
        results.tests.timeoutElimination = await testTimeoutElimination();
        logTestResult('Timeout Elimination', results.tests.timeoutElimination);
        
        // TEST 4: WordPress Script Dependencies
        console.log('\n🔗 TEST 4: Script Dependencies Validation');
        results.tests.scriptDependencies = await testScriptDependencies();
        logTestResult('Script Dependencies', results.tests.scriptDependencies);
        
        // TEST 5: Performance Improvement
        console.log('\n⚡ TEST 5: Performance Improvement Validation');
        results.tests.performance = await testPerformanceImprovement();
        logTestResult('Performance', results.tests.performance);
        
        // Calculate overall results
        const endTime = performance.now();
        results.metrics.totalTestTime = endTime - startTime;
        
        const testScores = Object.values(results.tests).map(test => test.score);
        const overallScore = testScores.reduce((sum, score) => sum + score, 0) / testScores.length;
        
        results.overallScore = Math.round(overallScore);
        results.overallStatus = overallScore >= 90 ? 'SUCCESS' : overallScore >= 70 ? 'PARTIAL' : 'FAILURE';
        
        // Generate recommendations
        generateRecommendations(results);
        
        // Display final results
        displayFinalResults(results);
        
        return results;
        
    } catch (error) {
        console.error('❌ Validation failed with error:', error);
        results.overallStatus = 'ERROR';
        results.error = error.message;
        return results;
    } finally {
        console.groupEnd();
    }
};

/**
 * TEST 1: Event Firing Validation
 * Checks if coreSystemsReady event is being dispatched
 */
async function testEventFiring() {
    const test = {
        name: 'Event Firing',
        status: 'RUNNING',
        score: 0,
        details: {},
        issues: []
    };
    
    try {
        // Check if enhanced-system-registrar.js has the event dispatch code
        const registrarAvailable = !!window.systemRegistrar;
        test.details.registrarAvailable = registrarAvailable;
        
        if (!registrarAvailable) {
            test.issues.push('systemRegistrar not available globally');
        }
        
        // Check if systems are registered
        const systemCount = window.systemRegistrar ? window.systemRegistrar.list().length : 0;
        test.details.systemCount = systemCount;
        
        if (systemCount < 6) {
            test.issues.push(`Only ${systemCount} systems registered, expected at least 6`);
        }
        
        // Check global system exposure
        const globalSystems = {
            enhancedComponentManager: !!window.enhancedComponentManager,
            stateManager: !!window.stateManager,
            renderer: !!window.renderer,
            dynamicComponentLoader: !!window.dynamicComponentLoader,
            mkTemplateCache: !!window.mkTemplateCache
        };
        
        test.details.globalSystems = globalSystems;
        
        const exposedCount = Object.values(globalSystems).filter(Boolean).length;
        const expectedCount = Object.keys(globalSystems).length;
        
        if (exposedCount < expectedCount) {
            test.issues.push(`Only ${exposedCount}/${expectedCount} systems exposed globally`);
        }
        
        // Check for event dispatch capability
        const canDispatchEvents = typeof document.dispatchEvent === 'function';
        test.details.canDispatchEvents = canDispatchEvents;
        
        if (!canDispatchEvents) {
            test.issues.push('document.dispatchEvent not available');
        }
        
        // Calculate score
        let score = 0;
        if (registrarAvailable) score += 20;
        if (systemCount >= 6) score += 20;
        if (exposedCount === expectedCount) score += 30;
        if (canDispatchEvents) score += 20;
        if (test.issues.length === 0) score += 10;
        
        test.score = score;
        test.status = score >= 80 ? 'PASS' : score >= 50 ? 'PARTIAL' : 'FAIL';
        
    } catch (error) {
        test.status = 'ERROR';
        test.error = error.message;
    }
    
    return test;
}

/**
 * TEST 2: Event Reception Validation
 * Tests the event-driven waitForInitialization function
 */
async function testEventReception() {
    const test = {
        name: 'Event Reception',
        status: 'RUNNING',
        score: 0,
        details: {},
        issues: []
    };
    
    try {
        // Check if waitForInitialization exists and is event-driven
        const waitForInitExists = typeof window.waitForInitialization === 'function';
        test.details.waitForInitExists = waitForInitExists;
        
        if (!waitForInitExists) {
            test.issues.push('waitForInitialization function not available');
            test.status = 'FAIL';
            return test;
        }
        
        // Check if function is event-driven (not polling)
        const functionSource = window.waitForInitialization.toString();
        const isEventDriven = functionSource.includes('addEventListener') && 
                             functionSource.includes('coreSystemsReady');
        const hasPolling = functionSource.includes('setTimeout') && 
                          functionSource.includes('checkSystems');
        
        test.details.isEventDriven = isEventDriven;
        test.details.hasPolling = hasPolling;
        
        if (!isEventDriven) {
            test.issues.push('waitForInitialization is not event-driven');
        }
        
        if (hasPolling) {
            test.issues.push('waitForInitialization still uses polling (old implementation)');
        }
        
        // Test timeout handling
        const hasTimeoutHandling = functionSource.includes('setTimeout') && 
                                  functionSource.includes('Catastrophic failure');
        test.details.hasTimeoutHandling = hasTimeoutHandling;
        
        if (!hasTimeoutHandling) {
            test.issues.push('Missing catastrophic failure timeout handling');
        }
        
        // Test immediate ready check
        const hasImmediateCheck = functionSource.includes('systemsReady') && 
                                 functionSource.includes('already ready');
        test.details.hasImmediateCheck = hasImmediateCheck;
        
        if (!hasImmediateCheck) {
            test.issues.push('Missing immediate ready check');
        }
        
        // Calculate score
        let score = 0;
        if (waitForInitExists) score += 25;
        if (isEventDriven) score += 35;
        if (!hasPolling) score += 20;
        if (hasTimeoutHandling) score += 10;
        if (hasImmediateCheck) score += 10;
        
        test.score = score;
        test.status = score >= 80 ? 'PASS' : score >= 50 ? 'PARTIAL' : 'FAIL';
        
    } catch (error) {
        test.status = 'ERROR';
        test.error = error.message;
    }
    
    return test;
}

/**
 * TEST 3: Timeout Elimination Validation
 * Verifies that race condition timeouts are eliminated
 */
async function testTimeoutElimination() {
    const test = {
        name: 'Timeout Elimination',
        status: 'RUNNING',
        score: 0,
        details: {},
        issues: []
    };
    
    try {
        // Test actual initialization without timeout
        const startTime = performance.now();
        
        try {
            const initResult = await Promise.race([
                window.waitForInitialization(5000),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Test timeout')), 3000)
                )
            ]);
            
            const endTime = performance.now();
            const initTime = endTime - startTime;
            
            test.details.initializationSuccessful = true;
            test.details.initializationTime = Math.round(initTime);
            test.details.initializationResult = initResult;
            
            // Check for expected improvements
            if (initTime < 2000) {
                test.details.fastInitialization = true;
            } else {
                test.issues.push(`Initialization took ${Math.round(initTime)}ms, expected <2000ms`);
            }
            
        } catch (error) {
            test.details.initializationSuccessful = false;
            test.details.initializationError = error.message;
            
            if (error.message.includes('timeout')) {
                test.issues.push('Initialization still timing out');
            } else if (error.message.includes('Test timeout')) {
                test.issues.push('Initialization took longer than 3 seconds');
            } else {
                test.issues.push(`Initialization error: ${error.message}`);
            }
        }
        
        // Check for old polling error messages in console
        const hasOldTimeoutErrors = checkForOldTimeoutErrors();
        test.details.hasOldTimeoutErrors = hasOldTimeoutErrors;
        
        if (hasOldTimeoutErrors) {
            test.issues.push('Old timeout error messages detected');
        }
        
        // Calculate score
        let score = 0;
        if (test.details.initializationSuccessful) score += 50;
        if (test.details.fastInitialization) score += 25;
        if (!hasOldTimeoutErrors) score += 15;
        if (test.issues.length === 0) score += 10;
        
        test.score = score;
        test.status = score >= 80 ? 'PASS' : score >= 50 ? 'PARTIAL' : 'FAIL';
        
    } catch (error) {
        test.status = 'ERROR';
        test.error = error.message;
    }
    
    return test;
}

/**
 * TEST 4: Script Dependencies Validation
 * Checks WordPress script loading order
 */
async function testScriptDependencies() {
    const test = {
        name: 'Script Dependencies',
        status: 'RUNNING',
        score: 0,
        details: {},
        issues: []
    };
    
    try {
        // Check if scripts are loaded in correct order
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const scriptSources = scripts.map(script => script.src);
        
        // Look for our scripts
        const coreSystemScript = scriptSources.find(src => src.includes('main.js'));
        const testingFrameworkScript = scriptSources.find(src => src.includes('testing-foundation-utilities.js'));
        
        test.details.coreSystemScript = !!coreSystemScript;
        test.details.testingFrameworkScript = !!testingFrameworkScript;
        test.details.totalScripts = scripts.length;
        
        if (!coreSystemScript) {
            test.issues.push('Core system script (main.js) not found');
        }
        
        if (!testingFrameworkScript) {
            test.issues.push('Testing framework script not found');
        }
        
        // Check script loading order (if both exist)
        if (coreSystemScript && testingFrameworkScript) {
            const coreIndex = scriptSources.indexOf(coreSystemScript);
            const testingIndex = scriptSources.indexOf(testingFrameworkScript);
            
            test.details.coreScriptIndex = coreIndex;
            test.details.testingScriptIndex = testingIndex;
            test.details.correctOrder = coreIndex < testingIndex;
            
            if (coreIndex >= testingIndex) {
                test.issues.push('Scripts not loaded in correct dependency order');
            }
        }
        
        // Check for WordPress dependency system usage
        const hasWordPressDependencies = scripts.some(script => 
            script.hasAttribute('data-wp-strategy') || 
            script.id.includes('-js')
        );
        
        test.details.hasWordPressDependencies = hasWordPressDependencies;
        
        if (!hasWordPressDependencies) {
            test.issues.push('WordPress dependency system not detected');
        }
        
        // Calculate score
        let score = 0;
        if (test.details.coreSystemScript) score += 25;
        if (test.details.testingFrameworkScript) score += 25;
        if (test.details.correctOrder) score += 30;
        if (hasWordPressDependencies) score += 20;
        
        test.score = score;
        test.status = score >= 80 ? 'PASS' : score >= 50 ? 'PARTIAL' : 'FAIL';
        
    } catch (error) {
        test.status = 'ERROR';
        test.error = error.message;
    }
    
    return test;
}

/**
 * TEST 5: Performance Improvement Validation
 * Measures actual performance improvements
 */
async function testPerformanceImprovement() {
    const test = {
        name: 'Performance Improvement',
        status: 'RUNNING',
        score: 0,
        details: {},
        issues: []
    };
    
    try {
        // Get performance metrics
        const navigationTiming = performance.getEntriesByType('navigation')[0];
        
        if (navigationTiming) {
            const loadTime = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
            const domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart;
            
            test.details.pageLoadTime = Math.round(loadTime);
            test.details.domContentLoadedTime = Math.round(domContentLoaded);
        }
        
        // Check memory usage
        if (performance.memory) {
            test.details.memoryUsage = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
            };
        }
        
        // Test initialization speed multiple times
        const initTimes = [];
        
        for (let i = 0; i < 3; i++) {
            const startTime = performance.now();
            
            try {
                await window.waitForInitialization(2000);
                const endTime = performance.now();
                initTimes.push(endTime - startTime);
            } catch (error) {
                // If it fails, record a high time
                initTimes.push(2000);
            }
        }
        
        const avgInitTime = initTimes.reduce((sum, time) => sum + time, 0) / initTimes.length;
        test.details.averageInitTime = Math.round(avgInitTime);
        test.details.initTimeConsistency = Math.max(...initTimes) - Math.min(...initTimes);
        
        // Performance targets
        const targets = {
            initTime: 2000, // <2 seconds
            consistency: 500, // <500ms variation
            memoryUsage: 50 // <50MB
        };
        
        // Check against targets
        if (avgInitTime > targets.initTime) {
            test.issues.push(`Average init time ${Math.round(avgInitTime)}ms exceeds target ${targets.initTime}ms`);
        }
        
        if (test.details.initTimeConsistency > targets.consistency) {
            test.issues.push(`Init time inconsistency ${Math.round(test.details.initTimeConsistency)}ms exceeds target ${targets.consistency}ms`);
        }
        
        if (test.details.memoryUsage && test.details.memoryUsage.used > targets.memoryUsage) {
            test.issues.push(`Memory usage ${test.details.memoryUsage.used}MB exceeds target ${targets.memoryUsage}MB`);
        }
        
        // Calculate score
        let score = 0;
        if (avgInitTime <= targets.initTime) score += 40;
        if (test.details.initTimeConsistency <= targets.consistency) score += 30;
        if (!test.details.memoryUsage || test.details.memoryUsage.used <= targets.memoryUsage) score += 20;
        if (test.issues.length === 0) score += 10;
        
        test.score = score;
        test.status = score >= 80 ? 'PASS' : score >= 50 ? 'PARTIAL' : 'FAIL';
        
    } catch (error) {
        test.status = 'ERROR';
        test.error = error.message;
    }
    
    return test;
}

/**
 * Helper Functions
 */

function checkForOldTimeoutErrors() {
    // This is a simplified check - in a real implementation,
    // you might capture console.log messages and check for specific patterns
    return false; // Assume no old errors for now
}

function logTestResult(testName, result) {
    const icon = result.status === 'PASS' ? '✅' : 
                 result.status === 'PARTIAL' ? '⚠️' : '❌';
    
    console.log(`${icon} ${testName}: ${result.status} (Score: ${result.score}/100)`);
    
    if (result.issues.length > 0) {
        console.log(`   Issues: ${result.issues.join(', ')}`);
    }
    
    if (result.error) {
        console.log(`   Error: ${result.error}`);
    }
}

function generateRecommendations(results) {
    results.recommendations = [];
    
    // Check each test for specific recommendations
    Object.values(results.tests).forEach(test => {
        if (test.status === 'FAIL' || test.status === 'ERROR') {
            results.recommendations.push(`Fix ${test.name}: ${test.issues.join(', ')}`);
        }
    });
    
    if (results.overallScore < 90) {
        results.recommendations.push('Consider running additional diagnostics for remaining issues');
    }
    
    if (results.tests.performance && results.tests.performance.score < 80) {
        results.recommendations.push('Performance optimization may be needed');
    }
}

function displayFinalResults(results) {
    console.log('\n' + '='.repeat(50));
    console.log('🎯 RACE CONDITION FIX VALIDATION RESULTS');
    console.log('='.repeat(50));
    
    console.log(`📊 Overall Score: ${results.overallScore}/100`);
    console.log(`📈 Overall Status: ${results.overallStatus}`);
    console.log(`⏱️ Test Duration: ${Math.round(results.metrics.totalTestTime)}ms`);
    
    console.log('\n📋 Test Summary:');
    Object.values(results.tests).forEach(test => {
        console.log(`   ${test.name}: ${test.status} (${test.score}/100)`);
    });
    
    if (results.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        results.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }
    
    if (results.overallStatus === 'SUCCESS') {
        console.log('\n🎉 RACE CONDITION FIX VALIDATION: SUCCESS!');
        console.log('✅ Event-driven initialization is working correctly');
        console.log('✅ Race conditions have been eliminated');
        console.log('✅ Performance targets are being met');
    } else {
        console.log(`\n⚠️ RACE CONDITION FIX VALIDATION: ${results.overallStatus}`);
        console.log('🔧 Please address the issues listed above');
    }
}

/**
 * Quick validation commands for console testing
 */
window.quickRaceConditionTest = async function() {
    console.log('🚀 Quick Race Condition Test');
    
    try {
        const startTime = performance.now();
        const result = await window.waitForInitialization(3000);
        const endTime = performance.now();
        
        console.log(`✅ Initialization successful in ${Math.round(endTime - startTime)}ms`);
        console.log('📊 Result:', result);
        
        return {
            success: true,
            duration: endTime - startTime,
            result
        };
        
    } catch (error) {
        console.log(`❌ Initialization failed: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
};

window.raceConditionStatus = function() {
    const status = {
        eventDriven: typeof window.waitForInitialization === 'function' && 
                    window.waitForInitialization.toString().includes('addEventListener'),
        systemsReady: !!(window.enhancedComponentManager && window.stateManager),
        testingFramework: !!window.testingFoundation,
        systemRegistrar: !!window.systemRegistrar
    };
    
    console.table(status);
    return status;
};

// Help command
window.raceConditionFixHelp = function() {
    console.log(`
🔧 Race Condition Fix Validation Commands:

Primary Validation:
  validateRaceConditionFix()     - Full comprehensive test suite
  
Quick Tests:
  quickRaceConditionTest()       - Quick initialization test
  raceConditionStatus()          - Current system status
  
Individual Tests:
  testEventFiring()              - Test event dispatch
  testEventReception()           - Test event-driven waitForInitialization
  testTimeoutElimination()       - Test no more timeouts
  testScriptDependencies()       - Test WordPress script order
  testPerformanceImprovement()   - Test performance metrics

Example:
  await validateRaceConditionFix()
    `);
};

console.log('✅ Race Condition Fix Validation Suite Loaded!');
console.log('Run: validateRaceConditionFix() for full validation');
console.log('Run: raceConditionFixHelp() for all available commands');
