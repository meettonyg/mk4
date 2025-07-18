/**
 * Root Fix Validation: Topics Data Population Test
 * 
 * This script validates that the topics component is now receiving data correctly
 * after the root-level fix to the data source ID detection.
 */

(function() {
    'use strict';
    
    console.group('%c🔧 ROOT FIX: Topics Data Population Test', 'font-size: 16px; font-weight: bold; color: #10b981');
    
    /**
     * Test 1: Verify topics components exist and their data sources
     */
    function testTopicsComponentDataSources() {
        console.log('%c📊 Testing Topics Component Data Sources...', 'font-weight: bold; color: #3b82f6');
        
        const topicsComponents = document.querySelectorAll('[data-component="topics"]');
        
        if (topicsComponents.length === 0) {
            console.warn('❌ No topics components found on page');
            return { status: 'no_components', count: 0 };
        }
        
        const results = [];
        
        topicsComponents.forEach((component, index) => {
            const componentId = component.id || component.getAttribute('data-component-id');
            const postId = component.getAttribute('data-post-id');
            const loadingSource = component.getAttribute('data-loading-source');
            const hasTopics = component.getAttribute('data-has-topics') === 'true';
            const topicsCount = parseInt(component.getAttribute('data-topics-count') || '0');
            
            // Check for actual topic content in the DOM
            const topicItems = component.querySelectorAll('.topic-item, [data-topic-index]');
            const actualTopicsCount = topicItems.length;
            
            const result = {
                componentId,
                postId,
                loadingSource,
                hasTopics,
                declaredCount: topicsCount,
                actualCount: actualTopicsCount,
                isPopulated: actualTopicsCount > 0,
                status: actualTopicsCount > 0 ? 'SUCCESS' : 'EMPTY'
            };
            
            results.push(result);
            
            console.log(`🎯 Component ${index + 1}:`, {
                id: componentId,
                postId: postId,
                source: loadingSource,
                populated: result.isPopulated,
                topics: `${actualTopicsCount}/${topicsCount}`,
                status: result.status
            });
        });
        
        return {
            status: 'found_components',
            count: topicsComponents.length,
            results: results,
            populatedCount: results.filter(r => r.isPopulated).length
        };
    }
    
    /**
     * Test 2: Test AJAX component rendering with post ID
     */
    async function testAjaxComponentRendering() {
        console.log('%c🔄 Testing AJAX Component Rendering...', 'font-weight: bold; color: #3b82f6');
        
        if (!window.guestifyData?.ajaxUrl || !window.guestifyData?.nonce) {
            console.warn('❌ Required WordPress AJAX data not available');
            return { status: 'no_ajax_data' };
        }
        
        const postId = window.guestifyData.postId || 
                      new URLSearchParams(window.location.search).get('post_id') ||
                      document.body.getAttribute('data-post-id');
                      
        if (!postId) {
            console.warn('❌ No post ID available for testing');
            return { status: 'no_post_id' };
        }
        
        try {
            const formData = new FormData();
            formData.append('action', 'guestify_render_component');
            formData.append('component', 'topics');
            formData.append('nonce', window.guestifyData.nonce);
            formData.append('props', JSON.stringify({
                post_id: postId,
                component_id: 'test-topics-component',
                title: 'Test Topics'
            }));
            
            console.log('📤 Sending AJAX request with post_id:', postId);
            
            const response = await fetch(window.guestifyData.ajaxUrl, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ AJAX render successful');
                
                // Parse the HTML to check for topics
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = result.data.html;
                
                const topicItems = tempDiv.querySelectorAll('.topic-item, [data-topic-index]');
                const noTopicsMessage = tempDiv.querySelector('.no-topics-message');
                
                const testResult = {
                    status: 'success',
                    topicsFound: topicItems.length,
                    hasNoTopicsMessage: !!noTopicsMessage,
                    htmlLength: result.data.html.length,
                    scriptsIncluded: result.data.scripts?.length || 0
                };
                
                console.log('📊 AJAX Result Analysis:', testResult);
                
                return testResult;
            } else {
                console.error('❌ AJAX render failed:', result.data);
                return { status: 'ajax_error', error: result.data };
            }
            
        } catch (error) {
            console.error('❌ AJAX request failed:', error);
            return { status: 'network_error', error: error.message };
        }
    }
    
    /**
     * Test 3: Validate debug information in console
     */
    function testDebugInformation() {
        console.log('%c🔍 Checking Debug Information...', 'font-weight: bold; color: #3b82f6');
        
        // Look for ROOT FIX debug messages in console history
        const debugIndicators = {
            rootFixActive: false,
            dataSourceDetected: false,
            topicsLoaded: false,
            singleStepRender: false
        };
        
        // Check DOM elements for debug information
        const topicsComponents = document.querySelectorAll('[data-component="topics"]');
        
        topicsComponents.forEach(component => {
            if (component.hasAttribute('data-single-step-render')) {
                debugIndicators.singleStepRender = true;
            }
            
            if (component.hasAttribute('data-root-fix')) {
                debugIndicators.rootFixActive = true;
            }
            
            const loadingSource = component.getAttribute('data-loading-source');
            if (loadingSource && loadingSource.includes('single_step_render')) {
                debugIndicators.dataSourceDetected = true;
            }
            
            const topicsCount = parseInt(component.getAttribute('data-topics-count') || '0');
            if (topicsCount > 0) {
                debugIndicators.topicsLoaded = true;
            }
        });
        
        console.log('🔍 Debug Indicators:', debugIndicators);
        
        return debugIndicators;
    }
    
    /**
     * Test 4: Performance validation
     */
    function testPerformance() {
        console.log('%c⚡ Testing Performance...', 'font-weight: bold; color: #3b82f6');
        
        const topicsComponents = document.querySelectorAll('[data-component="topics"]');
        const performanceMetrics = {
            componentsCount: topicsComponents.length,
            loadingStates: 0,
            renderTime: 'unknown',
            cacheHits: 0
        };
        
        // Check for any loading states (should be eliminated)
        topicsComponents.forEach(component => {
            const loadingElements = component.querySelectorAll('[data-loading="true"], .loading-indicator, .loading-message');
            performanceMetrics.loadingStates += loadingElements.length;
        });
        
        // Check for cache information
        if (window.mkTemplateCache) {
            const cacheStats = window.mkTemplateCache.getStats();
            performanceMetrics.cacheHits = cacheStats.hitRate;
        }
        
        console.log('⚡ Performance Metrics:', performanceMetrics);
        
        return performanceMetrics;
    }
    
    /**
     * Main test execution
     */
    async function runAllTests() {
        console.log('🚀 Starting comprehensive topics data fix validation...');
        
        const results = {
            timestamp: new Date().toISOString(),
            postId: window.guestifyData?.postId || new URLSearchParams(window.location.search).get('post_id'),
            url: window.location.href
        };
        
        // Test 1: Component data sources
        results.componentTest = testTopicsComponentDataSources();
        
        // Test 2: AJAX rendering
        console.log('⏳ Testing AJAX rendering (this may take a moment)...');
        results.ajaxTest = await testAjaxComponentRendering();
        
        // Test 3: Debug information
        results.debugTest = testDebugInformation();
        
        // Test 4: Performance
        results.performanceTest = testPerformance();
        
        // Overall assessment
        const isFixed = results.componentTest.populatedCount > 0 || 
                       (results.ajaxTest.status === 'success' && results.ajaxTest.topicsFound > 0);
        
        results.overallStatus = isFixed ? 'FIXED' : 'NEEDS_ATTENTION';
        results.summary = {
            componentsFound: results.componentTest.count,
            componentsPopulated: results.componentTest.populatedCount,
            ajaxWorking: results.ajaxTest.status === 'success',
            rootFixActive: results.debugTest.rootFixActive,
            performance: results.performanceTest.loadingStates === 0 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT'
        };
        
        // Final report
        console.log(`%c${results.overallStatus === 'FIXED' ? '✅' : '❌'} ROOT FIX VALIDATION COMPLETE`, 
                   `font-size: 18px; font-weight: bold; color: ${results.overallStatus === 'FIXED' ? '#10b981' : '#ef4444'}`);
        
        console.log('📋 Summary:', results.summary);
        
        if (results.overallStatus === 'FIXED') {
            console.log('%c🎉 Topics data population is now working correctly!', 'font-size: 16px; color: #10b981; font-weight: bold');
        } else {
            console.log('%c⚠️ Issues detected - check individual test results above', 'font-size: 16px; color: #ef4444; font-weight: bold');
        }
        
        // Store results globally for inspection
        window.topicsFixTestResults = results;
        
        return results;
    }
    
    // Auto-run tests
    if (document.readyState === 'complete') {
        runAllTests();
    } else {
        document.addEventListener('DOMContentLoaded', runAllTests);
    }
    
    // Expose test functions globally
    window.testTopicsDataFix = runAllTests;
    window.testTopicsAjax = testAjaxComponentRendering;
    
    console.groupEnd();
    
})();

// Quick test command for easy access
console.log('%c💡 Quick Test Command: testTopicsDataFix()', 'color: #6366f1; font-weight: bold');
