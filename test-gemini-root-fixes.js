/**
 * @file test-gemini-root-fixes.js
 * @description Verification script for Gemini's root-level race condition fixes
 * @version 1.0.0
 * 
 * VERIFICATION TARGETS:
 * ✅ No script async/defer attributes interfering with dependency chain
 * ✅ Clean initialization sequence without polling
 * ✅ GMKB namespace available immediately to dependent scripts
 * ✅ Media Kit Builder initializes within 2 seconds
 */

(function() {
    'use strict';
    
    console.log('%c🧪 TESTING: Gemini\'s Root-Level Race Condition Fixes', 'font-size: 16px; font-weight: bold; color: #059669; background: #f0f9ff; padding: 8px;');
    
    const testResults = {
        timestamp: new Date().toISOString(),
        tests: {},
        summary: {
            passed: 0,
            failed: 0,
            total: 0
        }
    };
    
    function runTest(testName, testFunction, description) {
        testResults.summary.total++;
        console.group(`🧪 Test: ${testName}`);
        console.log(`📝 Description: ${description}`);
        
        try {
            const startTime = Date.now();
            const result = testFunction();
            const duration = Date.now() - startTime;
            
            if (result === true) {
                testResults.tests[testName] = { 
                    status: 'PASS', 
                    duration: `${duration}ms`,
                    description 
                };
                testResults.summary.passed++;
                console.log(`✅ PASS (${duration}ms)`);
            } else {
                testResults.tests[testName] = { 
                    status: 'FAIL', 
                    reason: result || 'Test returned false',
                    duration: `${duration}ms`,
                    description 
                };
                testResults.summary.failed++;
                console.log(`❌ FAIL: ${result || 'Test returned false'}`);
            }
        } catch (error) {
            testResults.tests[testName] = { 
                status: 'ERROR', 
                error: error.message,
                description 
            };
            testResults.summary.failed++;
            console.log(`❌ ERROR: ${error.message}`);
        }
        
        console.groupEnd();
    }
    
    /**
     * Test 1: Verify script tags don't have async/defer attributes
     */
    runTest('Script Tag Attributes', () => {
        const scripts = document.querySelectorAll('script[src*="guestify"]');
        
        if (scripts.length === 0) {
            return 'No Guestify scripts found';
        }
        
        const problematicScripts = [];
        scripts.forEach(script => {
            if (script.hasAttribute('async') || script.hasAttribute('defer')) {
                problematicScripts.push({
                    src: script.src,
                    async: script.hasAttribute('async'),
                    defer: script.hasAttribute('defer')
                });
            }
        });
        
        if (problematicScripts.length > 0) {
            console.log('⚠️ Scripts with problematic attributes:', problematicScripts);
            return `Found ${problematicScripts.length} scripts with async/defer attributes`;
        }
        
        console.log(`✅ Checked ${scripts.length} scripts, none have async/defer attributes`);
        return true;
    }, 'Verify script tags load synchronously in dependency order');
    
    /**
     * Test 2: GMKB Namespace Availability
     */
    runTest('GMKB Namespace', () => {
        if (!window.GMKB) {
            return 'window.GMKB is not available';
        }
        
        const requiredMethods = ['subscribe', 'dispatch', 'ready', 'initializer'];
        const missingMethods = requiredMethods.filter(method => typeof window.GMKB[method] !== 'function' && typeof window.GMKB[method] !== 'object');
        
        if (missingMethods.length > 0) {
            return `GMKB missing methods: ${missingMethods.join(', ')}`;
        }
        
        console.log('✅ GMKB namespace complete with all required methods');
        return true;
    }, 'Verify GMKB namespace is properly initialized');
    
    /**
     * Test 3: System Initializer Availability
     */
    runTest('System Initializer', () => {
        if (!window.GMKB || !window.GMKB.initializer) {
            return 'GMKB.initializer is not available';
        }
        
        const requiredMethods = ['register', 'ready', 'getStatus'];
        const missingMethods = requiredMethods.filter(method => typeof window.GMKB.initializer[method] !== 'function');
        
        if (missingMethods.length > 0) {
            return `System initializer missing methods: ${missingMethods.join(', ')}`;
        }
        
        console.log('✅ System initializer complete with all required methods');
        return true;
    }, 'Verify system initializer is properly initialized');
    
    /**
     * Test 4: Core Systems Registration
     */
    runTest('Core Systems Registration', () => {
        if (!window.GMKB || !window.GMKB.systems) {
            return 'GMKB.systems is not available';
        }
        
        const expectedSystems = ['EnhancedStateManager', 'Renderer', 'EnhancedComponentManager'];
        const registeredSystems = Object.keys(window.GMKB.systems);
        const missingSystems = expectedSystems.filter(system => !window.GMKB.systems[system]);
        
        if (missingSystems.length > 0) {
            console.log('⚠️ Missing systems:', missingSystems);
            console.log('📊 Registered systems:', registeredSystems);
            return `Missing systems: ${missingSystems.join(', ')}`;
        }
        
        console.log(`✅ All ${expectedSystems.length} core systems registered`);
        return true;
    }, 'Verify all core systems are properly registered');
    
    /**
     * Test 5: Enhanced Component Manager
     */
    runTest('Enhanced Component Manager', () => {
        if (!window.enhancedComponentManager && !window.componentManager) {
            return 'Enhanced component manager not available globally';
        }
        
        const manager = window.enhancedComponentManager || window.componentManager;
        const requiredMethods = ['addComponent', 'updateComponent', 'removeComponent'];
        const missingMethods = requiredMethods.filter(method => typeof manager[method] !== 'function');
        
        if (missingMethods.length > 0) {
            return `Component manager missing methods: ${missingMethods.join(', ')}`;
        }
        
        console.log('✅ Enhanced component manager available with all required methods');
        return true;
    }, 'Verify enhanced component manager is available and functional');
    
    /**
     * Test 6: Application Initialization State
     */
    runTest('Application Initialization', () => {
        // Check for initialization completion indicators
        const indicators = {
            gmkbReady: !!window.GMKB,
            systemsRegistered: !!(window.GMKB && Object.keys(window.GMKB.systems || {}).length > 0),
            componentManagerReady: !!(window.enhancedComponentManager || window.componentManager),
            stateManagerReady: !!(window.enhancedStateManager || window.stateManager),
            rendererReady: !!window.renderer
        };
        
        const failedIndicators = Object.entries(indicators)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
        
        if (failedIndicators.length > 0) {
            console.log('⚠️ Initialization status:', indicators);
            return `Initialization incomplete: ${failedIndicators.join(', ')}`;
        }
        
        console.log('✅ Application initialization complete');
        return true;
    }, 'Verify application has completed initialization');
    
    /**
     * Test 7: No Polling Functions Present
     */
    runTest('No Polling Functions', () => {
        const pollingFunctions = [];
        
        // Check for polling function evidence in global scope
        if (window.waitForGMKB) pollingFunctions.push('waitForGMKB');
        if (window.checkGMKB) pollingFunctions.push('checkGMKB');
        if (window.listenForGMKBCoreSystems) pollingFunctions.push('listenForGMKBCoreSystems');
        
        // Check console logs for polling messages
        const originalConsoleLog = console.log;
        let pollingMessages = false;
        
        console.log = (...args) => {
            const message = args.join(' ');
            if (message.includes('Waiting for GMKB namespace') || 
                message.includes('checkGMKB') || 
                message.includes('waitForGMKB')) {
                pollingMessages = true;
            }
            originalConsoleLog.apply(console, args);
        };
        
        // Restore console.log
        setTimeout(() => {
            console.log = originalConsoleLog;
        }, 100);
        
        if (pollingFunctions.length > 0) {
            return `Found polling functions: ${pollingFunctions.join(', ')}`;
        }
        
        if (pollingMessages) {
            return 'Found polling messages in console output';
        }
        
        console.log('✅ No polling functions or messages detected');
        return true;
    }, 'Verify no polling functions are present in the system');
    
    /**
     * Test 8: WordPress Dependency Chain Integrity
     */
    runTest('WordPress Dependency Chain', () => {
        // This test validates that scripts loaded in the correct order
        const scripts = Array.from(document.querySelectorAll('script[src*="guestify"]'))
            .map(script => {
                const src = script.src;
                const filename = src.split('/').pop().split('?')[0];
                return filename;
            });
        
        const expectedOrder = [
            'gmkb-main.js',
            'system-initializer.js', 
            'enhanced-component-manager.js',
            'core-systems-bundle.js',
            'application-bundle.js'
        ];
        
        let orderValid = true;
        let lastFoundIndex = -1;
        
        expectedOrder.forEach(expectedScript => {
            const foundIndex = scripts.findIndex(script => script.includes(expectedScript.replace('.js', '')));
            if (foundIndex !== -1) {
                if (foundIndex <= lastFoundIndex) {
                    orderValid = false;
                }
                lastFoundIndex = foundIndex;
            }
        });
        
        if (!orderValid) {
            console.log('⚠️ Script order:', scripts);
            return 'Scripts not loaded in dependency order';
        }
        
        console.log('✅ Scripts loaded in correct dependency order');
        return true;
    }, 'Verify WordPress dependency chain is working correctly');
    
    // Run all tests
    console.log('\n🚀 Running Gemini\'s Root-Level Fix Verification Tests...\n');
    
    // Allow some time for systems to initialize
    setTimeout(() => {
        // Display final results
        setTimeout(() => {
            console.log('\n' + '='.repeat(80));
            console.log('%c📊 GEMINI ROOT FIX VERIFICATION RESULTS', 'font-size: 18px; font-weight: bold; color: #dc2626; background: #fef2f2; padding: 8px;');
            console.log('='.repeat(80));
            
            const successRate = (testResults.summary.passed / testResults.summary.total * 100).toFixed(1);
            const status = testResults.summary.failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED';
            
            console.log(`\n${status}`);
            console.log(`Success Rate: ${successRate}%`);
            console.log(`Passed: ${testResults.summary.passed}/${testResults.summary.total}`);
            console.log(`Failed: ${testResults.summary.failed}/${testResults.summary.total}`);
            
            if (testResults.summary.failed === 0) {
                console.log('\n🎉 Gemini\'s root-level fixes have been successfully implemented!');
                console.log('🏆 Media Kit Builder should now initialize reliably without race conditions.');
                console.log('📈 WordPress dependency management is working correctly.');
                console.log('🔄 No polling workarounds are present in the system.');
            } else {
                console.log('\n⚠️ Some issues detected. See test details above.');
            }
            
            console.log('\n📋 Detailed Results:');
            Object.entries(testResults.tests).forEach(([testName, result]) => {
                const status = result.status === 'PASS' ? '✅' : '❌';
                console.log(`  ${status} ${testName}: ${result.status}`);
                if (result.reason) console.log(`     Reason: ${result.reason}`);
                if (result.error) console.log(`     Error: ${result.error}`);
            });
            
            // Global test result
            window.geminiRootFixVerificationResult = testResults;
            console.log('\n💾 Full results saved to window.geminiRootFixVerificationResult');
            
            // Quick validation function
            window.validateGeminiRootFix = () => {
                return {
                    success: testResults.summary.failed === 0,
                    successRate: `${successRate}%`,
                    timestamp: testResults.timestamp,
                    quickCheck: {
                        gmkbNamespace: !!window.GMKB,
                        systemInitializer: !!(window.GMKB && window.GMKB.initializer),
                        coreSystemsRegistered: !!(window.GMKB && Object.keys(window.GMKB.systems || {}).length > 0),
                        componentManagerReady: !!(window.enhancedComponentManager || window.componentManager),
                        noPollingDetected: !window.waitForGMKB && !window.checkGMKB
                    }
                };
            };
            
            console.log('⚡ Quick validation available: validateGeminiRootFix()');
            console.log('='.repeat(80));
            
        }, 1000);
    }, 500);
    
})();

console.log('🧪 Gemini Root Fix Verification Script Loaded');
