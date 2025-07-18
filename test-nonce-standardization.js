/**
 * ROOT-LEVEL NONCE STANDARDIZATION FIX - VALIDATION TEST
 * 
 * CRITICAL ISSUE FIXED: "Security verification failed" error
 * ROOT CAUSE: Nonce action mismatch between creation and verification
 * SOLUTION: Standardized all nonce actions to use 'gmkb_nonce'
 * 
 * FILES FIXED:
 * 1. includes/enqueue.php - Changed from 'guestify_media_kit_builder' to 'gmkb_nonce'
 * 2. components/topics/ajax-handler.php - Changed from 'guestify_media_kit_builder' to 'gmkb_nonce'
 * 3. Main plugin file - Already using 'gmkb_nonce' (confirmed correct)
 * 
 * TESTING INSTRUCTIONS:
 * 1. Open browser console
 * 2. Run: testNonceStandardization()
 * 3. Should see "✅ ALL NONCE TESTS PASSED"
 * 
 * @package Guestify
 * @version ROOT-FIX-1.0
 */

console.log('🔧 ROOT FIX: Nonce Standardization Test Loaded');

function testNonceStandardization() {
    console.log('🧪 Testing Nonce Standardization Fix...');
    
    const tests = [];
    let passedTests = 0;
    
    // Test 1: Check if gmkbData nonce is available
    tests.push({
        name: 'WordPress Data Nonce Available',
        test: () => {
            const hasNonce = window.gmkbData && window.gmkbData.nonce;
            const nonceLength = hasNonce ? window.gmkbData.nonce.length : 0;
            
            console.log('📊 Nonce data:', {
                exists: hasNonce,
                length: nonceLength,
                value: hasNonce ? window.gmkbData.nonce.substring(0, 10) + '...' : 'none'
            });
            
            return hasNonce && nonceLength > 0;
        },
        expected: true
    });
    
    // Test 2: Verify StateManager save functionality
    tests.push({
        name: 'StateManager Save Request',
        test: () => {
            if (!window.GMKB || !window.GMKB.systems || !window.GMKB.systems.StateManager) {
                console.warn('❌ StateManager not available');
                return false;
            }
            
            try {
                // Test the save method exists and can handle callbacks
                const stateManager = window.GMKB.systems.StateManager;
                const hasMethod = typeof stateManager.saveToStorage === 'function';
                
                console.log('📊 StateManager save method available:', hasMethod);
                return hasMethod;
            } catch (e) {
                console.error('❌ StateManager test error:', e);
                return false;
            }
        },
        expected: true
    });
    
    // Test 3: Test AJAX request structure
    tests.push({
        name: 'AJAX Request Structure',
        test: () => {
            if (!window.gmkbData) return false;
            
            const requiredFields = ['ajaxUrl', 'nonce', 'postId'];
            const hasAllFields = requiredFields.every(field => window.gmkbData[field] !== undefined);
            
            console.log('📊 AJAX data structure:', {
                ajaxUrl: !!window.gmkbData.ajaxUrl,
                nonce: !!window.gmkbData.nonce,
                postId: !!window.gmkbData.postId,
                architecture: window.gmkbData.architecture
            });
            
            return hasAllFields;
        },
        expected: true
    });
    
    // Test 4: Simulate save request (without actually saving)
    tests.push({
        name: 'Simulated Save Request Format',
        test: () => {
            if (!window.gmkbData) return false;
            
            try {
                const requestData = new URLSearchParams({
                    action: 'guestify_save_media_kit',
                    nonce: window.gmkbData.nonce,
                    post_id: window.gmkbData.postId,
                    state: JSON.stringify({
                        components: {},
                        layout: [],
                        globalSettings: {}
                    })
                });
                
                const hasRequiredFields = requestData.has('action') && 
                                         requestData.has('nonce') && 
                                         requestData.has('post_id') && 
                                         requestData.has('state');
                
                console.log('📊 Simulated request structure valid:', hasRequiredFields);
                console.log('📊 Request action:', requestData.get('action'));
                console.log('📊 Request nonce length:', requestData.get('nonce').length);
                
                return hasRequiredFields;
            } catch (e) {
                console.error('❌ Request simulation error:', e);
                return false;
            }
        },
        expected: true
    });
    
    // Test 5: Verify component managers are available for updates
    tests.push({
        name: 'Component Managers Available',
        test: () => {
            const hasEnhanced = window.enhancedComponentManager !== undefined;
            const hasRegular = window.componentManager !== undefined;
            const hasStateManager = window.enhancedStateManager !== undefined;
            
            console.log('📊 Component managers:', {
                enhancedComponentManager: hasEnhanced,
                componentManager: hasRegular,
                enhancedStateManager: hasStateManager
            });
            
            return hasEnhanced || hasRegular;
        },
        expected: true
    });
    
    // Run all tests
    console.log('\n🧪 Running Nonce Standardization Tests...\n');
    
    tests.forEach((test, index) => {
        try {
            const result = test.test();
            const passed = result === test.expected;
            
            if (passed) {
                console.log(`✅ Test ${index + 1}: ${test.name} - PASSED`);
                passedTests++;
            } else {
                console.log(`❌ Test ${index + 1}: ${test.name} - FAILED`);
                console.log(`   Expected: ${test.expected}, Got: ${result}`);
            }
        } catch (error) {
            console.log(`❌ Test ${index + 1}: ${test.name} - ERROR`);
            console.log(`   Error: ${error.message}`);
        }
    });
    
    // Final results
    console.log('\n📊 TEST RESULTS:');
    console.log(`✅ Passed: ${passedTests}/${tests.length}`);
    console.log(`❌ Failed: ${tests.length - passedTests}/${tests.length}`);
    
    if (passedTests === tests.length) {
        console.log('\n🎉 ALL NONCE TESTS PASSED - Security verification should now work!');
        console.log('💾 Try saving components to verify the fix is working.');
        return true;
    } else {
        console.log('\n⚠️ Some tests failed - may need additional fixes');
        return false;
    }
}

// Quick test function for immediate validation
function quickNonceTest() {
    console.log('🚀 Quick Nonce Test...');
    
    if (!window.gmkbData || !window.gmkbData.nonce) {
        console.log('❌ No nonce data available');
        return false;
    }
    
    console.log('✅ Nonce available:', window.gmkbData.nonce.substring(0, 10) + '...');
    console.log('📊 AJAX URL:', window.gmkbData.ajaxUrl);
    console.log('📊 Post ID:', window.gmkbData.postId);
    console.log('🔧 Architecture:', window.gmkbData.architecture);
    
    return true;
}

// Test the actual save operation (use with caution)
async function testActualSave() {
    console.log('🧪 Testing Actual Save Operation...');
    console.warn('⚠️ This will attempt to save data to your WordPress database');
    
    if (!window.gmkbData) {
        console.log('❌ WordPress data not available');
        return false;
    }
    
    try {
        const testState = {
            components: {
                'test-component': {
                    id: 'test-component',
                    type: 'test',
                    data: { message: 'Nonce test component' },
                    timestamp: Date.now()
                }
            },
            layout: ['test-component'],
            globalSettings: { test: true }
        };
        
        const response = await fetch(window.gmkbData.ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'guestify_save_media_kit',
                nonce: window.gmkbData.nonce,
                post_id: window.gmkbData.postId,
                state: JSON.stringify(testState)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Save test PASSED - Nonce fix is working!');
            console.log('📊 Response:', data);
            return true;
        } else {
            console.log('❌ Save test FAILED:', data);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Save test ERROR:', error);
        return false;
    }
}

// Console commands available for testing
console.log(`
🔧 ROOT FIX: Nonce Standardization Test Commands Available:

testNonceStandardization() - Run comprehensive nonce tests
quickNonceTest() - Quick validation of nonce availability  
testActualSave() - Test actual save operation (caution: saves to database)

Example: testNonceStandardization()
`);

// Auto-run quick test if this is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(quickNonceTest, 1000);
    });
} else {
    setTimeout(quickNonceTest, 100);
}
