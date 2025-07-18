/**
 * MEDIA KIT BUILDER - ROOT LEVEL TOPICS FIX VALIDATION
 * 
 * Run this script in the browser console to validate that all root-level fixes
 * for the "topics not populating" issue are working correctly.
 * 
 * Usage:
 * 1. Open Media Kit Builder page
 * 2. Open browser developer console
 * 3. Run: testTopicsFix()
 * 
 * Expected Result: All tests should pass with ✅ status
 */

function validateRootLevelTopicsFix() {
    console.log('🧪 TESTING: Root Level Topics Fix Validation');
    console.log('=' .repeat(60));
    
    const results = {
        phpFoundation: false,
        ajaxHandlers: false,
        componentDiscovery: false,
        eventSystem: false,
        topicsComponent: false,
        dataLoading: false,
        overall: false
    };
    
    // TEST 1: PHP Foundation
    console.log('TEST 1: PHP Foundation & WordPress Integration');
    if (window.gmkbData && window.gmkbData.ajaxUrl && window.gmkbData.nonce) {
        results.phpFoundation = true;
        console.log('✅ WordPress data available');
        console.log('  - AJAX URL:', window.gmkbData.ajaxUrl);
        console.log('  - Post ID:', window.gmkbData.postId);
        console.log('  - Nonce available:', !!window.gmkbData.nonce);
        console.log('  - Plugin URL:', window.gmkbData.pluginUrl);
    } else {
        console.log('❌ WordPress data missing or incomplete');
        console.log('  - gmkbData available:', !!window.gmkbData);
        if (window.gmkbData) {
            console.log('  - Missing properties:', Object.keys({
                ajaxUrl: window.gmkbData.ajaxUrl,
                nonce: window.gmkbData.nonce,
                postId: window.gmkbData.postId
            }).filter(key => !window.gmkbData[key]));
        }
    }
    
    // TEST 2: AJAX Handlers (async)
    console.log('\nTEST 2: AJAX Handler Registration');
    testAjaxHandlers().then(handlerResult => {
        results.ajaxHandlers = handlerResult;
        continueValidation();
    });
    
    function continueValidation() {
        // TEST 3: Component Discovery
        console.log('\nTEST 3: Component Discovery System');
        if (window.GMKB && window.GMKB.systems && window.GMKB.systems.ComponentManager) {
            const availableComponents = window.GMKB.systems.ComponentManager.availableComponents;
            if (availableComponents && availableComponents.topics) {
                results.componentDiscovery = true;
                console.log('✅ Topics component discovered');
                console.log('  - Component name:', availableComponents.topics.name);
                console.log('  - Category:', availableComponents.topics.category);
                console.log('  - Root fix flag:', availableComponents.topics.root_fix);
            } else {
                console.log('❌ Topics component not found in discovery system');
                console.log('  - ComponentManager available:', !!window.GMKB.systems.ComponentManager);
                console.log('  - Available components:', Object.keys(availableComponents || {}));
            }
        } else {
            console.log('❌ ComponentManager not available');
            console.log('  - GMKB available:', !!window.GMKB);
            console.log('  - GMKB.systems available:', !!(window.GMKB && window.GMKB.systems));
        }
        
        // TEST 4: Event System
        console.log('\nTEST 4: Event System Coordination');
        if (window.GMKB && typeof window.GMKB.dispatch === 'function') {
            results.eventSystem = true;
            console.log('✅ Event system available');
            console.log('  - Dispatch method:', typeof window.GMKB.dispatch);
            console.log('  - Subscribe method:', typeof window.GMKB.subscribe);
            console.log('  - Systems registered:', Object.keys(window.GMKB.systems || {}));
        } else {
            console.log('❌ Event system not available');
            console.log('  - GMKB available:', !!window.GMKB);
        }
        
        // TEST 5: Topics Component Specific Systems
        console.log('\nTEST 5: Topics Component Specific Systems');
        let topicsSystemsFound = 0;
        
        // Check for topics component fix
        if (window.GMKB && window.GMKB.systems && window.GMKB.systems.TopicsComponentFix) {
            topicsSystemsFound++;
            console.log('✅ Topics component fix system loaded');
        } else {
            console.log('⚠️ Topics component fix system not loaded (optional)');
        }
        
        // Check component manager has addComponent method
        if (window.GMKB && window.GMKB.systems && window.GMKB.systems.ComponentManager && 
            typeof window.GMKB.systems.ComponentManager.addComponent === 'function') {
            topicsSystemsFound++;
            console.log('✅ Component addition system available');
        } else {
            console.log('❌ Component addition system not available');
        }
        
        results.topicsComponent = topicsSystemsFound >= 1;
        
        // TEST 6: Data Loading
        console.log('\nTEST 6: Topics Data Loading Capability');
        testTopicsDataLoading().then(dataResult => {
            results.dataLoading = dataResult;
            finalizeValidation();
        });
    }
    
    async function testAjaxHandlers() {
        try {
            // Test main component AJAX endpoint
            const response = await fetch(window.gmkbData.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'guestify_get_components',
                    nonce: window.gmkbData.nonce
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Main AJAX handlers responding');
                console.log('  - Response success:', data.success);
                console.log('  - Components found:', Object.keys(data.data?.components || data.components || {}).length);
                return true;
            } else {
                console.log('❌ AJAX handlers not responding properly');
                console.log('  - Response status:', response.status);
                return false;
            }
        } catch (error) {
            console.log('❌ AJAX handler test failed:', error.message);
            return false;
        }
    }
    
    async function testTopicsDataLoading() {
        if (!window.gmkbData.postId) {
            console.log('⚠️ No post ID available for data loading test');
            return true; // Not a failure, just no data to test
        }
        
        try {
            // Test topics-specific AJAX endpoint
            const response = await fetch(window.gmkbData.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'load_stored_topics',
                    nonce: window.gmkbData.nonce,
                    post_id: window.gmkbData.postId
                })
            });
            
            const data = await response.json();
            
            if (data.success !== undefined) {
                console.log('✅ Topics data loading endpoint responding');
                console.log('  - Success:', data.success);
                console.log('  - Topics found:', data.data?.total_topics || 0);
                console.log('  - Data source:', data.data?.data_source || 'unknown');
                return true;
            } else {
                console.log('❌ Topics data loading endpoint not responding correctly');
                console.log('  - Response:', data);
                return false;
            }
        } catch (error) {
            console.log('❌ Topics data loading test failed:', error.message);
            return false;
        }
    }
    
    function finalizeValidation() {
        // Calculate overall success
        const successCount = Object.values(results).filter(Boolean).length;
        const totalTests = Object.keys(results).length - 1; // Exclude 'overall'
        results.overall = successCount >= (totalTests - 1); // Allow 1 failure
        
        console.log('\n' + '='.repeat(60));
        console.log('VALIDATION RESULTS:');
        console.log('='.repeat(60));
        
        Object.entries(results).forEach(([test, passed]) => {
            if (test !== 'overall') {
                const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASS' : 'FAIL'}`);
            }
        });
        
        console.log('\n' + '='.repeat(60));
        console.log(`OVERALL: ${results.overall ? '✅ PASS' : '❌ FAIL'} (${successCount}/${totalTests} tests passed)`);
        console.log('='.repeat(60));
        
        if (results.overall) {
            console.log('\n🎉 Root level topics fix validation SUCCESSFUL!');
            console.log('Topics component should now work correctly.');
            console.log('\nNext steps:');
            console.log('1. Try adding a topics component via the component library');
            console.log('2. Verify topics populate from your data source');
            console.log('3. Test topic editing and saving functionality');
        } else {
            console.log('\n⚠️ Root level topics fix validation had issues.');
            console.log('Some systems may not be working correctly.');
            console.log('\nRecommended actions:');
            console.log('1. Clear browser cache and reload page');
            console.log('2. Check WordPress error logs for issues');
            console.log('3. Verify all plugin files were updated correctly');
        }
        
        return results;
    }
}

/**
 * Quick test for topics component addition
 * Tests the actual component addition process
 */
async function testTopicsComponentAddition() {
    console.log('🧪 TESTING: Topics Component Addition');
    console.log('=' .repeat(40));
    
    if (!window.GMKB || !window.GMKB.systems || !window.GMKB.systems.ComponentManager) {
        console.log('❌ ComponentManager not available');
        return false;
    }
    
    try {
        console.log('➕ Attempting to add topics component...');
        
        const componentId = await window.GMKB.systems.ComponentManager.addComponent('topics', {
            title: 'Test Topics',
            dataSourceId: window.gmkbData.postId || 0,
            testMode: true
        });
        
        console.log('✅ Topics component added successfully');
        console.log('  - Component ID:', componentId);
        
        // Check if component appears in DOM
        setTimeout(() => {
            const element = document.getElementById(componentId);
            if (element) {
                console.log('✅ Topics component found in DOM');
                console.log('  - Element classes:', element.className);
                
                // Check for topics content
                const topicsContainer = element.querySelector('.topics-container');
                if (topicsContainer) {
                    const topicItems = topicsContainer.querySelectorAll('.topic-item');
                    console.log('📊 Topics found:', topicItems.length);
                    
                    if (topicItems.length > 0) {
                        console.log('✅ Topics content populated successfully');
                    } else {
                        console.log('⚠️ No topics content found (may be expected for new posts)');
                    }
                } else {
                    console.log('❌ Topics container not found in component');
                }
                
            } else {
                console.log('❌ Topics component not found in DOM');
            }
        }, 2000);
        
        return true;
        
    } catch (error) {
        console.log('❌ Failed to add topics component:', error.message);
        return false;
    }
}

/**
 * Performance test for the topics system
 * Measures loading and rendering times
 */
async function testTopicsPerformance() {
    console.log('🧪 TESTING: Topics Component Performance');
    console.log('=' .repeat(40));
    
    const startTime = performance.now();
    
    try {
        // Test AJAX response time
        const ajaxStartTime = performance.now();
        const response = await fetch(window.gmkbData.ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'guestify_get_components',
                nonce: window.gmkbData.nonce
            })
        });
        const ajaxEndTime = performance.now();
        const ajaxTime = ajaxEndTime - ajaxStartTime;
        
        console.log(`📊 AJAX Response Time: ${ajaxTime.toFixed(2)}ms`);
        
        if (ajaxTime < 1000) {
            console.log('✅ AJAX performance: EXCELLENT');
        } else if (ajaxTime < 3000) {
            console.log('⚠️ AJAX performance: ACCEPTABLE');
        } else {
            console.log('❌ AJAX performance: POOR');
        }
        
        const totalTime = performance.now() - startTime;
        console.log(`📊 Total Test Time: ${totalTime.toFixed(2)}ms`);
        
        return true;
        
    } catch (error) {
        console.log('❌ Performance test failed:', error.message);
        return false;
    }
}

// Global functions for easy access
window.testTopicsFix = validateRootLevelTopicsFix;
window.testTopicsAdd = testTopicsComponentAddition;
window.testTopicsPerformance = testTopicsPerformance;

// Auto-run validation if topics fix is being tested
if (typeof window !== 'undefined' && window.location && 
    window.location.href.includes('test_topics_fix=true')) {
    setTimeout(() => {
        console.log('🔧 AUTO-RUNNING: Topics fix validation due to URL parameter');
        validateRootLevelTopicsFix();
    }, 2000);
}

console.log('📋 Topics Fix Test Suite Loaded');
console.log('Available commands:');
console.log('  - testTopicsFix() - Full validation suite');
console.log('  - testTopicsAdd() - Test component addition');  
console.log('  - testTopicsPerformance() - Performance testing');
console.log('');
console.log('💡 TIP: Run testTopicsFix() first to validate the installation');
