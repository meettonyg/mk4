/**
 * @file test-root-fix-verification.js
 * @description Test script to verify the root fix for the 10-second timeout issue
 */

(function() {
    'use strict';
    
    console.log('🧪 ROOT FIX VERIFICATION: Starting test suite');
    
    /**
     * Test 1: Verify WordPress data is immediately available
     */
    function testWordPressDataAvailability() {
        console.log('\n📋 Test 1: WordPress Data Availability');
        
        const dataSources = [
            { name: 'gmkbData', data: window.gmkbData },
            { name: 'guestifyData', data: window.guestifyData },
            { name: 'MKCG', data: window.MKCG },
            { name: 'wordpressDataCache', data: window.wordpressDataCache }
        ];
        
        let hasValidData = false;
        
        dataSources.forEach(source => {
            const isValid = source.data && source.data.ajaxUrl && source.data.nonce;
            console.log(`  ${isValid ? '✅' : '❌'} ${source.name}: ${isValid ? 'Valid' : 'Invalid/Missing'}`);
            if (isValid) {
                hasValidData = true;
                console.log(`    - AJAX URL: ${source.data.ajaxUrl}`);
                console.log(`    - Nonce: ${source.data.nonce.substring(0, 8)}...`);
                console.log(`    - Post ID: ${source.data.postId}`);
                console.log(`    - Components: ${source.data.components?.length || 0}`);
            }
        });
        
        return hasValidData;
    }
    
    /**
     * Test 2: Test enhanced component manager data access
     */
    function testComponentManagerDataAccess() {
        console.log('\n📋 Test 2: Component Manager Data Access');
        
        if (!window.enhancedComponentManager) {
            console.log('  ❌ Enhanced component manager not available');
            return false;
        }
        
        try {
            const wpData = window.enhancedComponentManager.getWordPressData();
            console.log('  ✅ getWordPressData() succeeded');
            console.log(`    - Source: ${wpData === window.gmkbData ? 'gmkbData' : 
                                      wpData === window.guestifyData ? 'guestifyData' : 
                                      wpData === window.MKCG ? 'MKCG' : 
                                      wpData === window.wordpressDataCache ? 'wordpressDataCache' : 'unknown'}`);
            console.log(`    - Has AJAX URL: ${!!wpData.ajaxUrl}`);
            console.log(`    - Has Nonce: ${!!wpData.nonce}`);
            console.log(`    - Has Post ID: ${!!wpData.postId}`);
            return true;
        } catch (error) {
            console.log('  ❌ getWordPressData() failed:', error.message);
            return false;
        }
    }
    
    /**
     * Test 3: Test component addition without timeout
     */
    async function testComponentAddition() {
        console.log('\n📋 Test 3: Component Addition Speed Test');
        
        if (!window.enhancedComponentManager) {
            console.log('  ❌ Enhanced component manager not available');
            return false;
        }
        
        if (!window.enhancedComponentManager.isReady()) {
            try {
                window.enhancedComponentManager.initialize();
                console.log('  ✅ Component manager initialized');
            } catch (error) {
                console.log('  ❌ Component manager initialization failed:', error.message);
                return false;
            }
        }
        
        try {
            console.log('  ⏱️ Starting component addition test...');
            const startTime = performance.now();
            
            // Test adding a component (this should not timeout anymore)
            const componentId = await window.enhancedComponentManager.addComponent('hero', {
                title: 'Test Hero Component',
                subtitle: 'Root fix verification test'
            });
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.log(`  ✅ Component added successfully in ${duration.toFixed(2)}ms`);
            console.log(`    - Component ID: ${componentId}`);
            console.log(`    - Duration was ${duration < 1000 ? 'FAST' : duration < 5000 ? 'MODERATE' : 'SLOW'}`);
            
            // Clean up - remove the test component
            try {
                await window.enhancedComponentManager.removeComponent(componentId);
                console.log('  ✅ Test component cleaned up');
            } catch (cleanupError) {
                console.log('  ⚠️ Cleanup failed:', cleanupError.message);
            }
            
            return duration < 10000; // Should be much faster than 10 seconds now
            
        } catch (error) {
            console.log('  ❌ Component addition failed:', error.message);
            return false;
        }
    }
    
    /**
     * Test 4: Verify no race conditions
     */
    function testRaceConditionElimination() {
        console.log('\n📋 Test 4: Race Condition Elimination');
        
        let successCount = 0;
        const testCount = 5;
        
        for (let i = 0; i < testCount; i++) {
            try {
                if (window.enhancedComponentManager) {
                    // Clear cache to simulate fresh access
                    window.enhancedComponentManager.clearWordPressDataCache();
                    
                    // Try to access data immediately
                    const wpData = window.enhancedComponentManager.getWordPressData();
                    if (wpData && wpData.ajaxUrl && wpData.nonce) {
                        successCount++;
                    }
                }
            } catch (error) {
                console.log(`    ❌ Attempt ${i + 1} failed: ${error.message}`);
            }
        }
        
        console.log(`  📊 Success rate: ${successCount}/${testCount} (${(successCount/testCount*100).toFixed(1)}%)`);
        
        if (successCount === testCount) {
            console.log('  ✅ No race conditions detected - data consistently available');
            return true;
        } else {
            console.log('  ❌ Race conditions still present');
            return false;
        }
    }
    
    /**
     * Run all tests
     */
    async function runAllTests() {
        console.log('🧪 ROOT FIX VERIFICATION: Running comprehensive test suite\n');
        
        const results = {
            dataAvailability: testWordPressDataAvailability(),
            componentManagerAccess: testComponentManagerDataAccess(),
            raceConditionElimination: testRaceConditionElimination()
        };
        
        // Component addition test (async)
        results.componentAddition = await testComponentAddition();
        
        // Summary
        console.log('\n📊 TEST RESULTS SUMMARY:');
        console.log('=====================================');
        
        const testResults = [
            { name: 'WordPress Data Availability', result: results.dataAvailability },
            { name: 'Component Manager Access', result: results.componentManagerAccess },
            { name: 'Race Condition Elimination', result: results.raceConditionElimination },
            { name: 'Component Addition Speed', result: results.componentAddition }
        ];
        
        testResults.forEach(test => {
            console.log(`  ${test.result ? '✅' : '❌'} ${test.name}`);
        });
        
        const passedTests = testResults.filter(test => test.result).length;
        const totalTests = testResults.length;
        
        console.log(`\n🎯 OVERALL RESULT: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('🎉 ROOT FIX VERIFICATION: ALL TESTS PASSED!');
            console.log('✅ The 10-second timeout issue has been resolved');
            console.log('✅ Components should now add immediately without delays');
        } else {
            console.log('❌ ROOT FIX VERIFICATION: Some tests failed');
            console.log('⚠️ The root fix may need additional adjustments');
        }
        
        return { passedTests, totalTests, success: passedTests === totalTests };
    }
    
    // Auto-run tests when script loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runAllTests, 1000); // Give systems time to initialize
        });
    } else {
        setTimeout(runAllTests, 1000);
    }
    
    // Expose for manual testing
    window.rootFixVerification = {
        runAllTests,
        testWordPressDataAvailability,
        testComponentManagerDataAccess,
        testComponentAddition,
        testRaceConditionElimination
    };
    
    console.log('🧪 ROOT FIX VERIFICATION: Test suite loaded');
    console.log('💡 Run manually with: window.rootFixVerification.runAllTests()');
    
})();
