/**
 * Topics Save Fix Validation Test
 * 
 * This script tests the root-level fixes implemented for the Topics Component Save Issue
 * Run this in the browser console on the media kit builder page to test the fixes
 */

console.log('🧪 Testing Topics Save Fix Implementation...');

// Test 1: Verify WordPress integration
function testWordPressIntegration() {
    console.log('\n=== Test 1: WordPress Integration ===');
    
    const tests = {
        'gmkbData exists': !!window.gmkbData,
        'ajaxUrl available': !!(window.gmkbData?.ajaxUrl),
        'nonce available': !!(window.gmkbData?.nonce),
        'postId available': !!(window.gmkbData?.postId),
        'debugMode status': !!(window.gmkbData?.debugMode)
    };
    
    Object.entries(tests).forEach(([test, result]) => {
        console.log(`${result ? '✅' : '❌'} ${test}: ${result}`);
    });
    
    if (window.gmkbData) {
        console.log('📊 gmkbData contents:', window.gmkbData);
    }
    
    return Object.values(tests).every(Boolean);
}

// Test 2: Test AJAX communication
async function testAjaxCommunication() {
    console.log('\n=== Test 2: AJAX Communication ===');
    
    if (!window.gmkbData?.ajaxUrl || !window.gmkbData?.nonce) {
        console.log('❌ Cannot test AJAX - missing WordPress data');
        return false;
    }
    
    try {
        console.log('📡 Testing basic AJAX connectivity...');
        
        // Create test request data
        const testData = {
            action: 'save_custom_topics',
            post_id: window.gmkbData.postId || 1,
            topics: { topic_1: 'Test Topic for Save Fix Validation' },
            save_type: 'test',
            client_timestamp: Math.floor(Date.now() / 1000),
            nonce: window.gmkbData.nonce
        };
        
        // Use enhanced AJAX method if available
        if (window.enhancedTopicsDesignPanel && window.enhancedTopicsDesignPanel.sendAjaxRequest) {
            console.log('📡 Using enhanced AJAX method...');
            const response = await window.enhancedTopicsDesignPanel.sendAjaxRequest(testData);
            console.log('✅ AJAX test successful:', response);
            return true;
        } else {
            // Fallback manual test
            console.log('📡 Using fallback manual AJAX test...');
            
            const requestBody = new URLSearchParams();
            Object.entries(testData).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    requestBody.append(key, JSON.stringify(value));
                } else {
                    requestBody.append(key, String(value || ''));
                }
            });
            
            const response = await fetch(window.gmkbData.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: requestBody,
                credentials: 'same-origin'
            });
            
            console.log(`📡 Response status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ AJAX Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    responseText: errorText.substring(0, 500)
                });
                return false;
            }
            
            const responseData = await response.json();
            console.log('✅ AJAX response:', responseData);
            return true;
        }
        
    } catch (error) {
        console.error('❌ AJAX test failed:', error);
        return false;
    }
}

// Test 3: Test Topics Design Panel
function testTopicsDesignPanel() {
    console.log('\n=== Test 3: Topics Design Panel ===');
    
    const tests = {
        'EnhancedTopicsDesignPanel exists': !!(window.enhancedTopicsDesignPanel),
        'Panel initialized': !!(window.enhancedTopicsDesignPanel?.isInitialized),
        'Post ID detected': !!(window.enhancedTopicsDesignPanel?.postId),
        'Nonce available': !!(window.enhancedTopicsDesignPanel?.nonce),
        'sendAjaxRequest method': typeof window.enhancedTopicsDesignPanel?.sendAjaxRequest === 'function',
        'performSave method': typeof window.enhancedTopicsDesignPanel?.performSave === 'function'
    };
    
    Object.entries(tests).forEach(([test, result]) => {
        console.log(`${result ? '✅' : '❌'} ${test}: ${result}`);
    });
    
    if (window.enhancedTopicsDesignPanel) {
        console.log('📊 Panel status:', {
            postId: window.enhancedTopicsDesignPanel.postId,
            topicsCount: window.enhancedTopicsDesignPanel.topics?.length || 0,
            autoSaveEnabled: window.enhancedTopicsDesignPanel.autoSaveEnabled
        });
    }
    
    return Object.values(tests).filter(Boolean).length >= 4; // At least basic functionality
}

// Test 4: Test error handling
function testErrorHandling() {
    console.log('\n=== Test 4: Error Handling ===');
    
    const tests = {
        'showUserError method': typeof window.enhancedTopicsDesignPanel?.showUserError === 'function',
        'showUserSuccess method': typeof window.enhancedTopicsDesignPanel?.showUserSuccess === 'function',
        'removeNotifications method': typeof window.enhancedTopicsDesignPanel?.removeNotifications === 'function'
    };
    
    Object.entries(tests).forEach(([test, result]) => {
        console.log(`${result ? '✅' : '❌'} ${test}: ${result}`);
    });
    
    // Test notification system if available
    if (window.enhancedTopicsDesignPanel?.showUserSuccess) {
        console.log('🧪 Testing notification system...');
        window.enhancedTopicsDesignPanel.showUserSuccess('Test notification - fixes are working!');
        
        setTimeout(() => {
            window.enhancedTopicsDesignPanel.removeNotifications();
        }, 2000);
    }
    
    return Object.values(tests).every(Boolean);
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Topics Save Fix Validation Tests...\n');
    
    const results = {
        wordpressIntegration: testWordPressIntegration(),
        topicsDesignPanel: testTopicsDesignPanel(),
        errorHandling: testErrorHandling(),
        ajaxCommunication: false // Will be set by async test
    };
    
    // Run async AJAX test
    try {
        results.ajaxCommunication = await testAjaxCommunication();
    } catch (error) {
        console.error('❌ AJAX test failed with exception:', error);
    }
    
    console.log('\n=== Test Results Summary ===');
    Object.entries(results).forEach(([test, result]) => {
        console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASS' : 'FAIL'}`);
    });
    
    const passCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n📊 Overall: ${passCount}/${totalTests} tests passed`);
    
    if (passCount === totalTests) {
        console.log('🎉 All tests passed! Topics save fix is working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Check the logs above for details.');
    }
    
    return {
        passed: passCount === totalTests,
        results: results,
        score: `${passCount}/${totalTests}`
    };
}

// Auto-run tests if this script is loaded directly
if (typeof window !== 'undefined') {
    // Wait a bit for page to fully load
    setTimeout(runAllTests, 1000);
}

// Export for manual testing
window.topicsSaveFixTest = {
    runAllTests,
    testWordPressIntegration,
    testAjaxCommunication,
    testTopicsDesignPanel,
    testErrorHandling
};

console.log('🧪 Test functions available as window.topicsSaveFixTest');
console.log('💡 Run window.topicsSaveFixTest.runAllTests() to test manually');
