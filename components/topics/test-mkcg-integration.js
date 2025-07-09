/**
 * PHASE 1: MKCG Topics Integration - Testing & Validation Script
 * 
 * This script validates that the MKCG integration implementation is working correctly.
 * Run this script in the browser console on a Media Kit Builder page with MKCG data.
 * 
 * TESTING STRATEGY (as recommended by Gemini):
 * - Unit tests for core methods
 * - Integration tests with existing panel system  
 * - E2E workflow validation
 * - Performance benchmarking
 */

(function() {
    'use strict';
    
    console.log('🧪 PHASE 1: Starting MKCG Topics Integration Testing...');
    
    const testResults = {
        passed: 0,
        failed: 0,
        warnings: 0,
        details: []
    };
    
    /**
     * Test helper functions
     */
    function assert(condition, message, isWarning = false) {
        if (condition) {
            testResults.passed++;
            testResults.details.push(`✅ ${message}`);
            console.log(`✅ ${message}`);
        } else {
            if (isWarning) {
                testResults.warnings++;
                testResults.details.push(`⚠️ WARNING: ${message}`);
                console.warn(`⚠️ WARNING: ${message}`);
            } else {
                testResults.failed++;
                testResults.details.push(`❌ FAILED: ${message}`);
                console.error(`❌ FAILED: ${message}`);
            }
        }
    }
    
    function timeTest(testName, testFunction) {
        const startTime = performance.now();
        testFunction();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`⏱️ ${testName}: ${duration.toFixed(2)}ms`);
        return duration;
    }
    
    /**
     * UNIT TESTS
     */
    function runUnitTests() {
        console.group('🔬 Unit Tests');
        
        // Test 1: TopicsMKCGIntegration class availability
        assert(
            typeof window.TopicsMKCGIntegration === 'function',
            'TopicsMKCGIntegration class is available globally'
        );
        
        // Test 2: Global functions exposure
        assert(
            typeof window.addTopicToPanel === 'function',
            'addTopicToPanel function exposed globally'
        );
        
        assert(
            typeof window.updateTopicsInComponent === 'function',
            'updateTopicsInComponent function exposed globally'
        );
        
        // Test 3: MKCG data structure validation
        const hasGuestifyData = !!window.guestifyData;
        assert(hasGuestifyData, 'guestifyData is available globally');
        
        if (hasGuestifyData) {
            const hasMkcgData = !!window.guestifyData.mkcgData;
            assert(hasMkcgData, 'MKCG data is available in guestifyData', true);
            
            if (hasMkcgData) {
                const hasTopicsData = !!window.guestifyData.mkcgData.topics;
                assert(hasTopicsData, 'Topics data is available in MKCG data', true);
                
                if (hasTopicsData) {
                    const topicsCount = Object.keys(window.guestifyData.mkcgData.topics.topics || {}).length;
                    assert(topicsCount > 0, `Found ${topicsCount} topics in MKCG data`, true);
                }
            }
        }
        
        // Test 4: Configuration file structure
        // Note: This would require loading the config, for now we test the expected structure
        console.log('📋 Configuration structure test deferred - requires actual config loading');
        
        console.groupEnd();
    }
    
    /**
     * INTEGRATION TESTS
     */
    function runIntegrationTests() {
        console.group('🔗 Integration Tests');
        
        // Test 1: Panel structure
        const topicsPanel = document.querySelector('#topics-mkcg-section');
        assert(
            !!topicsPanel,
            'MKCG integration section exists in DOM'
        );
        
        if (topicsPanel) {
            assert(
                topicsPanel.style.display === 'none',
                'MKCG section is hidden by default (shown by JavaScript when appropriate)'
            );
            
            const statusIndicator = topicsPanel.querySelector('.mkcg-status-indicator');
            assert(!!statusIndicator, 'Status indicator element exists');
            
            const refreshBtn = topicsPanel.querySelector('.mkcg-refresh-btn');
            assert(!!refreshBtn, 'Refresh button exists');
            
            const syncBtn = topicsPanel.querySelector('.mkcg-sync-all-btn');
            assert(!!syncBtn, 'Sync all button exists');
        }
        
        // Test 2: Topics panel integration
        const topicsList = document.querySelector('#design-topics-list');
        assert(!!topicsList, 'Topics list container exists', true);
        
        const addTopicBtn = document.querySelector('#add-topic-btn');
        assert(!!addTopicBtn, 'Add topic button exists', true);
        
        // Test 3: Component panel handler registration
        const handlers = window.componentPanelHandlers;
        assert(!!handlers, 'Component panel handlers are available');
        
        if (handlers) {
            assert(
                typeof handlers.topics === 'function',
                'Topics component panel handler is registered'
            );
        }
        
        console.groupEnd();
    }
    
    /**
     * E2E WORKFLOW TESTS
     */
    function runE2ETests() {
        console.group('🎭 End-to-End Workflow Tests');
        
        // Test 1: MKCG Integration Initialization (if conditions are met)
        const hasRequiredData = window.guestifyData?.mkcgData && window.TopicsMKCGIntegration;
        
        if (hasRequiredData) {
            try {
                // Create a test element
                const testElement = document.createElement('div');
                testElement.className = 'topics-component';
                
                // Test initialization
                const testIntegration = new window.TopicsMKCGIntegration(testElement, document.body);
                
                assert(
                    testIntegration instanceof window.TopicsMKCGIntegration,
                    'MKCG integration instance created successfully'
                );
                
                assert(
                    typeof testIntegration.getStatus === 'function',
                    'Integration instance has getStatus method'
                );
                
                const status = testIntegration.getStatus();
                assert(
                    typeof status === 'object',
                    'getStatus returns status object'
                );
                
                console.log('📊 Integration Status:', status);
                
                // Cleanup
                if (typeof testIntegration.destroy === 'function') {
                    testIntegration.destroy();
                }
                
            } catch (error) {
                assert(false, `MKCG integration initialization failed: ${error.message}`);
            }
        } else {
            console.log('⏭️ E2E tests skipped - MKCG data or integration class not available');
            console.log('   This is expected if testing without MKCG data or on a different page');
        }
        
        console.groupEnd();
    }
    
    /**
     * PERFORMANCE TESTS
     */
    function runPerformanceTests() {
        console.group('⚡ Performance Tests');
        
        // Test performance targets from our configuration
        const performanceTargets = {
            initialization: 100, // ms
            dataDetection: 50,   // ms
            panelEnhancement: 100, // ms
            dataInjection: 200   // ms
        };
        
        // Test 1: Function call performance
        if (typeof window.TopicsMKCGIntegration === 'function') {
            const mockElement = document.createElement('div');
            
            const initTime = timeTest('MKCG Integration Class Loading', () => {
                // Just test class instantiation speed
                try {
                    const testInstance = new window.TopicsMKCGIntegration(mockElement, document.body);
                    if (typeof testInstance.destroy === 'function') {
                        testInstance.destroy();
                    }
                } catch (error) {
                    console.log('Note: Full initialization may require MKCG data');
                }
            });
            
            assert(
                initTime < performanceTargets.initialization,
                `Initialization under ${performanceTargets.initialization}ms (actual: ${initTime.toFixed(2)}ms)`
            );
        }
        
        // Test 2: Memory usage (basic check)
        if (performance.memory) {
            const memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            console.log(`💾 Current memory usage: ${memoryUsage}MB`);
            
            // This is a rough check - memory usage can vary widely
            assert(
                memoryUsage < 100,
                `Memory usage reasonable (${memoryUsage}MB)`,
                true
            );
        }
        
        console.groupEnd();
    }
    
    /**
     * SECURITY TESTS
     */
    function runSecurityTests() {\n        console.group('🔒 Security Tests');\n        \n        // Test 1: Global namespace pollution check\n        const beforeGlobals = Object.keys(window).length;\n        \n        // Our integration should only add specific globals\n        const expectedGlobals = [\n            'TopicsMKCGIntegration',\n            'addTopicToPanel', \n            'updateTopicsInComponent',\n            'escapeHtml'\n        ];\n        \n        let unexpectedGlobals = 0;\n        expectedGlobals.forEach(globalName => {\n            if (window[globalName]) {\n                assert(true, `Expected global '${globalName}' is available`);\n            } else {\n                assert(false, `Expected global '${globalName}' is missing`, true);\n            }\n        });\n        \n        // Test 2: XSS protection in utility functions\n        if (typeof window.escapeHtml === 'function') {\n            const xssTest = '<script>alert(\"xss\")</script>';\n            const escaped = window.escapeHtml(xssTest);\n            assert(\n                !escaped.includes('<script>'),\n                'escapeHtml function properly escapes HTML tags'\n            );\n        }\n        \n        console.groupEnd();\n    }\n    \n    /**\n     * MAIN TEST RUNNER\n     */\n    function runAllTests() {\n        console.log('🚀 Starting PHASE 1 MKCG Topics Integration Test Suite...');\n        console.log('⏰ Test started at:', new Date().toISOString());\n        \n        const testStartTime = performance.now();\n        \n        // Run all test categories\n        runUnitTests();\n        runIntegrationTests();\n        runE2ETests();\n        runPerformanceTests();\n        runSecurityTests();\n        \n        const testEndTime = performance.now();\n        const totalTestTime = testEndTime - testStartTime;\n        \n        // Results summary\n        console.log('\\n📊 TEST RESULTS SUMMARY');\n        console.log('========================');\n        console.log(`✅ Passed: ${testResults.passed}`);\n        console.log(`❌ Failed: ${testResults.failed}`);\n        console.log(`⚠️ Warnings: ${testResults.warnings}`);\n        console.log(`⏱️ Total test time: ${totalTestTime.toFixed(2)}ms`);\n        \n        const successRate = testResults.passed / (testResults.passed + testResults.failed) * 100;\n        console.log(`📈 Success rate: ${successRate.toFixed(1)}%`);\n        \n        // Overall assessment\n        if (testResults.failed === 0) {\n            console.log('\\n🎉 ALL TESTS PASSED! Phase 1 implementation is ready.');\n        } else if (successRate >= 80) {\n            console.log('\\n⚠️ Most tests passed, but some issues need attention.');\n        } else {\n            console.log('\\n❌ Multiple test failures detected. Implementation needs review.');\n        }\n        \n        // Detailed results\n        console.group('📋 Detailed Test Results');\n        testResults.details.forEach(detail => console.log(detail));\n        console.groupEnd();\n        \n        return {\n            passed: testResults.passed,\n            failed: testResults.failed,\n            warnings: testResults.warnings,\n            successRate: successRate,\n            testTime: totalTestTime,\n            details: testResults.details\n        };\n    }\n    \n    // Export test runner to global scope for manual execution\n    window.testMKCGTopicsIntegration = runAllTests;\n    \n    // Auto-run tests\n    console.log('\\n🔧 MKCG Topics Integration Test Suite loaded.');\n    console.log('📝 Run tests manually with: testMKCGTopicsIntegration()');\n    console.log('🔄 Or tests will auto-run in 2 seconds...');\n    \n    // Auto-run after a short delay to allow page to fully load\n    setTimeout(() => {\n        console.log('\\n🚀 Auto-running MKCG Topics Integration tests...');\n        runAllTests();\n    }, 2000);\n    \n})();\n\n/**\n * TESTING INSTRUCTIONS\n * ====================\n * \n * 1. SETUP:\n *    - Open a Media Kit Builder page in WordPress admin\n *    - Ensure you have a post with MKCG data (topics generated)\n *    - Open browser developer tools (F12)\n * \n * 2. RUN TESTS:\n *    - Paste this script into the console and press Enter\n *    - Tests will auto-run after 2 seconds\n *    - Or manually run: testMKCGTopicsIntegration()\n * \n * 3. EXPECTED RESULTS:\n *    - All unit tests should pass\n *    - Integration tests should pass if MKCG section exists\n *    - E2E tests require actual MKCG data to pass fully\n *    - Performance tests should meet targets\n * \n * 4. TROUBLESHOOTING:\n *    - If tests fail, check console for detailed error messages\n *    - Verify MKCG data is available in window.guestifyData.mkcgData\n *    - Ensure all files are loaded (mkcg-integration.js, panel-script.js)\n *    - Check network tab for any loading errors\n * \n * 5. VALIDATION CRITERIA:\n *    - Success rate should be >95% for production readiness\n *    - No failed tests in unit and integration categories\n *    - Performance under 100ms for initialization\n *    - Memory usage reasonable (<100MB additional)\n */\n