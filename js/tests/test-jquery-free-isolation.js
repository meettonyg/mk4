/**
 * @file test-jquery-free-isolation.js
 * @description Comprehensive test suite to validate jQuery-free isolation system
 * 
 * This script validates that:
 * 1. No jQuery is loaded on the page
 * 2. No problematic plugin scripts are loading
 * 3. Only allowed Media Kit Builder scripts are present
 * 4. All builder functionality works without jQuery
 * 
 * Usage: Open console and run testJQueryFreeIsolation()
 */

(function() {
    'use strict';

    // Test configuration
    const TEST_CONFIG = {
        expectedScripts: [
            'guestify-builder-script',
            'sortable-js'
        ],
        blockedPlugins: [
            'learn-press', 'lp-', 'learnpress',
            'frm_', 'formidable', 
            'wp-emoji', 'emoji',
            'jquery', 'jquery-core', 'jquery-migrate',
            'elementor', 'hello-elementor'
        ],
        jqueryVariants: [
            'jquery', 'jQuery', '$', 'jquery-core', 'jquery-migrate'
        ]
    };

    /**
     * Main test function - run all isolation tests
     */
    function testJQueryFreeIsolation() {
        console.log('🧪 TESTING: jQuery-Free Isolation System');
        console.log('==========================================\n');

        const results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };

        // Run all test categories
        testJQueryAbsence(results);
        testScriptIsolation(results);
        testBuilderFunctionality(results);
        testPerformanceMetrics(results);
        testDataValidation(results);

        // Generate final report
        generateTestReport(results);
        return results;
    }

    /**
     * Test 1: Validate no jQuery is present
     */
    function testJQueryAbsence(results) {
        console.log('🔍 Category 1: jQuery Absence Tests');
        console.log('----------------------------------');

        // Test 1.1: No jQuery global variables
        const jqueryGlobals = TEST_CONFIG.jqueryVariants.filter(variant => {
            return window[variant] !== undefined;
        });

        test(results, 'No jQuery global variables', jqueryGlobals.length === 0, true, {
            found: jqueryGlobals,
            expected: 'None'
        });

        // Test 1.2: No jQuery in loaded scripts
        const scripts = Array.from(document.scripts);
        const jqueryScripts = scripts.filter(script => {
            const src = script.src || '';
            return TEST_CONFIG.jqueryVariants.some(variant => 
                src.toLowerCase().includes(variant.toLowerCase())
            );
        });

        test(results, 'No jQuery scripts loaded', jqueryScripts.length === 0, true, {
            found: jqueryScripts.map(s => s.src),
            expected: 'None'
        });

        // Test 1.3: WordPress emoji scripts blocked
        const emojiScripts = scripts.filter(script => {
            const src = script.src || '';
            return src.includes('wp-emoji') || src.includes('emoji');
        });

        test(results, 'WordPress emoji scripts blocked', emojiScripts.length === 0, false, {
            found: emojiScripts.length,
            expected: 0
        });

        console.log('');
    }

    /**
     * Test 2: Validate script isolation
     */
    function testScriptIsolation(results) {
        console.log('🛡️ Category 2: Script Isolation Tests');
        console.log('------------------------------------');

        const scripts = Array.from(document.scripts);
        
        // Test 2.1: Only expected scripts are loaded
        const allowedScripts = scripts.filter(script => {
            const src = script.src || '';
            return TEST_CONFIG.expectedScripts.some(expected => 
                src.includes(expected)
            ) || src.includes('sortable') || src.includes('guestify');
        });

        test(results, 'Expected scripts are present', allowedScripts.length >= 2, true, {
            found: allowedScripts.map(s => s.src),
            expected: TEST_CONFIG.expectedScripts
        });

        // Test 2.2: Problematic plugin scripts are blocked
        const blockedScripts = scripts.filter(script => {
            const src = script.src || '';
            return TEST_CONFIG.blockedPlugins.some(blocked => 
                src.toLowerCase().includes(blocked.toLowerCase())
            );
        });

        test(results, 'Problematic plugin scripts blocked', blockedScripts.length === 0, true, {
            found: blockedScripts.map(s => s.src),
            expected: 'None'
        });

        // Test 2.3: LearnPress specific blocking
        const learnPressScripts = scripts.filter(script => {
            const src = script.src || '';
            return src.includes('learn-press') || src.includes('lp-') || 
                   document.getElementById('lpData') !== null;
        });

        test(results, 'LearnPress scripts blocked', learnPressScripts.length === 0, true, {
            found: learnPressScripts.length,
            lpDataElement: document.getElementById('lpData') !== null
        });

        // Test 2.4: Formidable Forms specific blocking
        const formidableScripts = scripts.filter(script => {
            const src = script.src || '';
            return src.includes('formidable') || src.includes('frm_');
        });

        test(results, 'Formidable Forms scripts blocked', formidableScripts.length === 0, true, {
            found: formidableScripts.length
        });

        console.log('');
    }

    /**
     * Test 3: Validate builder functionality works without jQuery
     */
    function testBuilderFunctionality(results) {
        console.log('⚙️ Category 3: Builder Functionality Tests');
        console.log('-----------------------------------------');

        // Test 3.1: Core builder elements exist
        const builderElements = [
            'media-kit-preview',
            'component-library-overlay',
            'global-settings-modal'
        ];

        builderElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            test(results, `${elementId} element exists`, element !== null, true, {
                found: element !== null,
                expected: true
            });
        });

        // Test 3.2: Enhanced systems are available
        const enhancedSystems = [
            'enhancedComponentManager',
            'stateManager',
            'renderer'
        ];

        enhancedSystems.forEach(system => {
            test(results, `${system} globally available`, window[system] !== undefined, true, {
                found: typeof window[system],
                expected: 'object'
            });
        });

        // Test 3.3: guestifyData is properly loaded
        test(results, 'guestifyData available', window.guestifyData !== undefined, true, {
            found: typeof window.guestifyData,
            jqueryFree: window.guestifyData?.jqueryFree,
            systemType: window.guestifyData?.systemType
        });

        // Test 3.4: jQuery-free flags are set
        if (window.guestifyData) {
            test(results, 'jQuery-free flag is true', window.guestifyData.jqueryFree === true, true, {
                found: window.guestifyData.jqueryFree,
                systemType: window.guestifyData.systemType
            });

            test(results, 'Isolation active flag', window.guestifyData.isolationActive === true, true, {
                found: window.guestifyData.isolationActive,
                pluginBlockingEnabled: window.guestifyData.pluginBlockingEnabled
            });
        }

        console.log('');
    }

    /**
     * Test 4: Performance metrics
     */
    function testPerformanceMetrics(results) {
        console.log('📊 Category 4: Performance Tests');
        console.log('--------------------------------');

        // Test 4.1: Script count is reasonable
        const totalScripts = document.scripts.length;
        test(results, 'Reasonable script count', totalScripts <= 10, false, {
            found: totalScripts,
            expected: '<= 10',
            note: 'Lower is better for isolation'
        });

        // Test 4.2: DOM load performance
        const domLoadTime = performance.timing?.domContentLoadedEventEnd - 
                           performance.timing?.navigationStart;
        
        if (domLoadTime) {
            test(results, 'Fast DOM loading', domLoadTime < 2000, false, {
                found: `${domLoadTime}ms`,
                expected: '< 2000ms'
            });
        }

        // Test 4.3: Memory usage check (if available)
        if (performance.memory) {
            const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            test(results, 'Reasonable memory usage', memoryMB < 50, false, {
                found: `${memoryMB}MB`,
                expected: '< 50MB'
            });
        }

        console.log('');
    }

    /**
     * Test 5: Data validation
     */
    function testDataValidation(results) {
        console.log('📋 Category 5: Data Validation Tests');
        console.log('-----------------------------------');

        if (window.guestifyData) {
            const data = window.guestifyData;

            // Test required data fields
            const requiredFields = [
                'pluginUrl', 'components', 'restUrl', 'nonce'
            ];

            requiredFields.forEach(field => {
                test(results, `${field} is present`, data[field] !== undefined && data[field] !== '', true, {
                    found: typeof data[field],
                    value: typeof data[field] === 'string' ? data[field].substring(0, 50) + '...' : data[field]
                });
            });

            // Test component data
            if (Array.isArray(data.components)) {
                test(results, 'Components array has data', data.components.length > 0, true, {
                    found: data.components.length,
                    expected: '> 0'
                });
            }
        }

        console.log('');
    }

    /**
     * Helper function to run individual tests
     */
    function test(results, name, condition, critical = false, details = {}) {
        const status = condition ? 'PASS' : 'FAIL';
        const icon = condition ? '✅' : (critical ? '❌' : '⚠️');
        
        console.log(`${icon} ${name}: ${status}`);
        
        if (details && Object.keys(details).length > 0) {
            console.log(`   Details:`, details);
        }
        
        results.tests.push({ 
            name, 
            status, 
            critical,
            details 
        });
        
        if (condition) {
            results.passed++;
        } else {
            if (critical) {
                results.failed++;
            } else {
                results.warnings++;
            }
        }
    }

    /**
     * Generate comprehensive test report
     */
    function generateTestReport(results) {
        console.log('📋 FINAL TEST REPORT');
        console.log('===================');
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`⚠️ Warnings: ${results.warnings}`);
        console.log(`📊 Total: ${results.tests.length}`);

        const criticalFailures = results.tests.filter(t => !t.status.includes('PASS') && t.critical);
        const warningCount = results.tests.filter(t => !t.status.includes('PASS') && !t.critical).length;

        if (criticalFailures.length === 0 && results.failed === 0) {
            console.log('\n🎉 ALL CRITICAL TESTS PASSED!');
            console.log('✨ jQuery-free isolation is working correctly!');
            
            if (warningCount > 0) {
                console.log(`⚠️ ${warningCount} non-critical warnings - consider reviewing`);
            }
        } else {
            console.log('\n❌ CRITICAL ISSUES FOUND:');
            criticalFailures.forEach(failure => {
                console.log(`   • ${failure.name}`);
                if (failure.details) {
                    console.log(`     Details:`, failure.details);
                }
            });
        }

        // Additional diagnostic info
        console.log('\n🔍 DIAGNOSTIC INFORMATION:');
        console.log(`   • Total scripts on page: ${document.scripts.length}`);
        console.log(`   • jQuery presence: ${window.jQuery ? 'DETECTED ❌' : 'NONE ✅'}`);
        console.log(`   • $ global: ${window.$ ? 'DETECTED ❌' : 'NONE ✅'}`);
        console.log(`   • Builder ready: ${window.enhancedComponentManager ? 'YES ✅' : 'NO ❌'}`);
        
        return results;
    }

    /**
     * Quick test function for immediate validation
     */
    function quickJQueryCheck() {
        console.log('🚀 QUICK JQUERY CHECK');
        console.log('====================');
        
        const checks = {
            'jQuery global': !window.jQuery,
            '$ global': !window.$,
            'jQuery scripts': !Array.from(document.scripts).some(s => s.src?.includes('jquery')),
            'Builder ready': !!window.enhancedComponentManager,
            'Data ready': !!window.guestifyData?.jqueryFree
        };
        
        Object.entries(checks).forEach(([check, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
        });
        
        const allPassed = Object.values(checks).every(Boolean);
        console.log(`\n${allPassed ? '🎉 ALL CHECKS PASSED!' : '❌ SOME CHECKS FAILED'}`);
        
        return allPassed;
    }

    // Expose test functions globally for console access
    window.testJQueryFreeIsolation = testJQueryFreeIsolation;
    window.quickJQueryCheck = quickJQueryCheck;

    // Auto-run quick check when script loads
    if (document.readyState === 'complete') {
        setTimeout(() => {
            console.log('🔧 jQuery-Free Isolation Test Suite Loaded');
            console.log('Commands: testJQueryFreeIsolation() or quickJQueryCheck()');
        }, 1000);
    } else {
        window.addEventListener('load', () => {
            setTimeout(() => {
                console.log('🔧 jQuery-Free Isolation Test Suite Loaded');
                console.log('Commands: testJQueryFreeIsolation() or quickJQueryCheck()');
            }, 1000);
        });
    }

})();
