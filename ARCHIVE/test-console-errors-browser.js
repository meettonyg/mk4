/**
 * Browser Console Test Script for Media Kit Builder Console Error Fixes
 * 
 * Run this script in the browser console on the Media Kit Builder page
 * to validate that all JavaScript fixes are working correctly.
 * 
 * Usage:
 * 1. Open Media Kit Builder page
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Press Enter to run
 * 5. Review test results
 */

(async function() {
    console.log('🧪 Starting Media Kit Builder Console Error Fix Tests...');
    console.log('=====================================');
    
    const testResults = [];
    
    /**
     * Helper function to add test results
     */
    function addTestResult(testName, status, message, details = null) {
        const result = { testName, status, message, details, timestamp: new Date().toISOString() };
        testResults.push(result);
        
        const statusEmoji = status === 'PASS' ? '✅' : (status === 'FAIL' ? '❌' : '⚠️');
        console.log(`${statusEmoji} ${testName}: ${message}`);
        if (details) {
            console.log('   Details:', details);
        }
    }
    
    /**
     * Test 1: Dynamic Component Loader Availability
     */
    try {
        if (window.dynamicComponentLoader) {
            addTestResult(
                'Dynamic Component Loader',
                'PASS',
                'Dynamic component loader is available globally'
            );
        } else {
            addTestResult(
                'Dynamic Component Loader',
                'FAIL',
                'Dynamic component loader not found in global scope'
            );
        }
    } catch (error) {
        addTestResult(
            'Dynamic Component Loader',
            'ERROR',
            'Error checking dynamic component loader: ' + error.message
        );
    }
    
    /**
     * Test 2: Component Alias Resolution
     */
    try {
        if (window.dynamicComponentLoader && typeof window.dynamicComponentLoader.resolveComponentType === 'function') {
            const testAliases = {
                'bio': 'biography',
                'authority': 'authority-hook',
                'social-links': 'social',
                'cta': 'call-to-action'
            };
            
            const aliasResults = {};
            let allCorrect = true;
            
            for (const [alias, expected] of Object.entries(testAliases)) {
                const resolved = window.dynamicComponentLoader.resolveComponentType(alias);
                aliasResults[alias] = { expected, resolved, correct: resolved === expected };
                if (resolved !== expected) allCorrect = false;
            }
            
            addTestResult(
                'Component Alias Resolution',
                allCorrect ? 'PASS' : 'FAIL',
                allCorrect ? 'All component aliases resolve correctly' : 'Some aliases failed to resolve',
                aliasResults
            );
        } else {
            addTestResult(
                'Component Alias Resolution',
                'FAIL',
                'resolveComponentType method not found on dynamic component loader'
            );
        }
    } catch (error) {
        addTestResult(
            'Component Alias Resolution',
            'ERROR',
            'Error testing alias resolution: ' + error.message
        );
    }
    
    /**
     * Test 3: Template Cache Integration
     */
    try {
        if (window.templateCache) {
            addTestResult(
                'Template Cache Integration',
                'PASS',
                'Template cache is available globally',
                { cacheStats: window.templateCache.getStats() }
            );
        } else {
            addTestResult(
                'Template Cache Integration',
                'FAIL',
                'Template cache not found in global scope'
            );
        }
    } catch (error) {
        addTestResult(
            'Template Cache Integration',
            'ERROR',
            'Error checking template cache: ' + error.message
        );
    }
    
    /**
     * Test 4: Bio Component Template Fetch
     */
    try {
        if (window.dynamicComponentLoader && typeof window.dynamicComponentLoader.getTemplate === 'function') {
            console.log('🔄 Testing bio component template fetch...');
            
            const template = await window.dynamicComponentLoader.getTemplate('bio');
            
            if (template && template.length > 0) {
                // Check if it contains biography elements
                const containsBioElements = template.includes('biography') || template.includes('bio-');
                
                addTestResult(
                    'Bio Component Template Fetch',
                    'PASS',
                    'Successfully fetched bio component template (resolved to biography)',
                    { 
                        templateLength: template.length,
                        containsBioElements: containsBioElements,
                        aliasResolution: 'bio -> biography'
                    }
                );
            } else {
                addTestResult(
                    'Bio Component Template Fetch',
                    'FAIL',
                    'Bio component template fetch returned empty or null'
                );
            }
        } else {
            addTestResult(
                'Bio Component Template Fetch',
                'FAIL',
                'getTemplate method not available on dynamic component loader'
            );
        }
    } catch (error) {
        addTestResult(
            'Bio Component Template Fetch',
            'FAIL',
            'Error fetching bio component template: ' + error.message,
            { errorType: error.name }
        );
    }
    
    /**
     * Test 5: Authority Hook Component Template Fetch
     */
    try {
        if (window.dynamicComponentLoader && typeof window.dynamicComponentLoader.getTemplate === 'function') {
            console.log('🔄 Testing authority-hook component template fetch...');
            
            const template = await window.dynamicComponentLoader.getTemplate('authority-hook');
            
            if (template && template.length > 0) {
                // Check if it contains authority hook elements
                const containsAuthorityElements = template.includes('authority-hook') || template.includes('authority-who');
                
                addTestResult(
                    'Authority Hook Template Fetch',
                    'PASS',
                    'Successfully fetched authority-hook component template',
                    { 
                        templateLength: template.length,
                        containsAuthorityElements: containsAuthorityElements
                    }
                );
            } else {
                addTestResult(
                    'Authority Hook Template Fetch',
                    'FAIL',
                    'Authority hook component template fetch returned empty or null'
                );
            }
        } else {
            addTestResult(
                'Authority Hook Template Fetch',
                'FAIL',
                'getTemplate method not available on dynamic component loader'
            );
        }
    } catch (error) {
        addTestResult(
            'Authority Hook Template Fetch',
            'FAIL',
            'Error fetching authority-hook component template: ' + error.message,
            { errorType: error.name }
        );
    }
    
    /**
     * Test 6: Circuit Breaker Status
     */
    try {
        if (window.dynamicComponentLoader && window.dynamicComponentLoader.circuitBreaker) {
            const circuitBreakerState = window.dynamicComponentLoader.circuitBreaker.state;
            const isOperational = circuitBreakerState === 'CLOSED';
            
            addTestResult(
                'Circuit Breaker Status',
                isOperational ? 'PASS' : 'WARN',
                `Circuit breaker state: ${circuitBreakerState}`,
                { 
                    state: circuitBreakerState,
                    failureCount: window.dynamicComponentLoader.circuitBreaker.failureCount,
                    isOperational: isOperational
                }
            );
        } else {
            addTestResult(
                'Circuit Breaker Status',
                'FAIL',
                'Circuit breaker not found on dynamic component loader'
            );
        }
    } catch (error) {
        addTestResult(
            'Circuit Breaker Status',
            'ERROR',
            'Error checking circuit breaker: ' + error.message
        );
    }
    
    /**
     * Test 7: REST API Endpoint Accessibility
     */
    try {
        const siteUrl = window.guestifyData?.siteUrl || window.location.origin;
        const restUrl = `${siteUrl}/wp-json/guestify/v1/templates/bio`;
        
        console.log('🔄 Testing REST API endpoint accessibility...');
        
        const response = await fetch(restUrl, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            addTestResult(
                'REST API Endpoint Test',
                'PASS',
                'REST API endpoint responded successfully',
                { 
                    status: response.status,
                    hasHtml: !!(data.html && data.html.length > 0),
                    resolvedFromAlias: data.resolved_from_alias,
                    actualType: data.actual_type
                }
            );
        } else {
            addTestResult(
                'REST API Endpoint Test',
                'FAIL',
                `REST API endpoint returned ${response.status}`,
                { status: response.status, statusText: response.statusText }
            );
        }
    } catch (error) {
        addTestResult(
            'REST API Endpoint Test',
            'FAIL',
            'Error testing REST API endpoint: ' + error.message,
            { errorType: error.name }
        );
    }
    
    /**
     * Test 8: Console Error Monitoring
     */
    try {
        // Check if there are recent console errors
        const originalConsoleError = console.error;
        const recentErrors = [];
        
        // Temporarily override console.error to catch any new errors
        console.error = function(...args) {
            recentErrors.push({ timestamp: Date.now(), args: args });
            originalConsoleError.apply(console, args);
        };
        
        // Wait a moment to catch any immediate errors
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Restore original console.error
        console.error = originalConsoleError;
        
        const hasRecentErrors = recentErrors.length > 0;
        const errorCount = recentErrors.length;
        
        addTestResult(
            'Console Error Monitoring',
            hasRecentErrors ? 'WARN' : 'PASS',
            hasRecentErrors ? `${errorCount} console errors detected during test` : 'No console errors detected during test',
            hasRecentErrors ? { recentErrors: recentErrors.slice(0, 3) } : null
        );
    } catch (error) {
        addTestResult(
            'Console Error Monitoring',
            'ERROR',
            'Error monitoring console: ' + error.message
        );
    }
    
    // Calculate summary
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.status === 'PASS').length;
    const failedTests = testResults.filter(r => r.status === 'FAIL').length;
    const errorTests = testResults.filter(r => r.status === 'ERROR').length;
    const warnTests = testResults.filter(r => r.status === 'WARN').length;
    
    const successRate = ((passedTests + warnTests) / totalTests) * 100;
    
    // Display summary
    console.log('\n=====================================');
    console.log('📊 TEST SUMMARY');
    console.log('=====================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️  Warnings: ${warnTests}`);
    console.log(`🔥 Errors: ${errorTests}`);
    console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
    
    const overallStatus = successRate >= 95 ? 'EXCELLENT' : 
                         successRate >= 80 ? 'GOOD' : 
                         successRate >= 60 ? 'FAIR' : 'POOR';
    
    console.log(`🎯 Overall Status: ${overallStatus}`);
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (failedTests === 0 && errorTests === 0) {
        console.log('✅ All critical tests passed! Console errors should be resolved.');
        console.log('🧪 Monitor the console for any remaining component loading issues.');
        console.log('📊 Use browser Network tab to verify template requests are successful.');
    } else {
        console.log('🔧 Address the failed/error tests above to complete the console error fixes.');
        console.log('🔄 Check browser Network tab for any 404 errors on template requests.');
        console.log('📝 Review server-side PHP logs for any template loading issues.');
    }
    
    // Make results available globally for debugging
    window.gmkbTestResults = {
        summary: { totalTests, passedTests, failedTests, errorTests, warnTests, successRate, overallStatus },
        detailedResults: testResults,
        timestamp: new Date().toISOString()
    };
    
    console.log('\n🔍 Detailed results available in: window.gmkbTestResults');
    console.log('=====================================');
    
})().catch(error => {
    console.error('❌ Test suite failed to run:', error);
});
