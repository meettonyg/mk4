/**
 * SAVE OPERATION DIAGNOSTIC - ROOT CAUSE INVESTIGATION
 * 
 * ISSUE: WordPress save returning 'Failed to save media kit'
 * STATUS: Nonce fixed ✅, now investigating AJAX response format
 * 
 * This script will help us understand what's happening in the save operation
 */

console.log('🔍 SAVE DIAGNOSTIC: Script loaded');

async function diagnoseSaveOperation() {
    console.log('🔍 SAVE DIAGNOSTIC: Starting comprehensive save analysis...');
    
    // Check WordPress data first
    if (!window.gmkbData) {
        console.error('❌ WordPress data not available');
        return false;
    }
    
    console.log('✅ WordPress data available:', {
        ajaxUrl: window.gmkbData.ajaxUrl,
        nonce: window.gmkbData.nonce ? window.gmkbData.nonce.substring(0, 10) + '...' : 'missing',
        postId: window.gmkbData.postId,
        architecture: window.gmkbData.architecture
    });
    
    // Test the actual save request with debugging
    try {
        console.log('🔍 Testing save request with enhanced debugging...');
        
        // Create test state
        const testState = {
            components: {
                'diagnostic-test': {
                    id: 'diagnostic-test',
                    type: 'test',
                    data: { message: 'Save diagnostic test' },
                    timestamp: Date.now()
                }
            },
            layout: ['diagnostic-test'],
            globalSettings: { 
                test: true,
                diagnostic: 'save-investigation',
                timestamp: Date.now()
            }
        };
        
        console.log('📤 Sending save request with test state:', testState);
        
        const requestBody = new URLSearchParams({
            action: 'guestify_save_media_kit',
            nonce: window.gmkbData.nonce,
            post_id: window.gmkbData.postId,
            state: JSON.stringify(testState)
        });
        
        console.log('📤 Request body parameters:', {
            action: 'guestify_save_media_kit',
            nonce: window.gmkbData.nonce.substring(0, 10) + '...',
            post_id: window.gmkbData.postId,
            state: 'JSON string (' + JSON.stringify(testState).length + ' chars)'
        });
        
        const response = await fetch(window.gmkbData.ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: requestBody
        });
        
        console.log('📥 Response status:', response.status, response.statusText);
        console.log('📥 Response headers:', Object.fromEntries(response.headers));
        
        // Try to get response as text first to see raw content
        const responseText = await response.text();
        console.log('📥 Raw response text:', responseText);
        
        // Try to parse as JSON
        let responseData;
        try {
            responseData = JSON.parse(responseText);
            console.log('📥 Parsed response JSON:', responseData);
        } catch (parseError) {
            console.error('❌ Failed to parse response as JSON:', parseError);
            console.log('📄 Response might not be valid JSON. Raw text:', responseText);
            return false;
        }
        
        // Analyze the response
        if (responseData.success) {
            console.log('✅ Save request returned success:', responseData);
            return true;
        } else {
            console.log('❌ Save request failed:', responseData);
            
            // Additional debugging for failure
            if (responseData.data) {
                console.log('📊 Error data:', responseData.data);
            }
            if (responseData.message) {
                console.log('📊 Error message:', responseData.message);
            }
            
            return false;
        }
        
    } catch (error) {
        console.error('❌ Save diagnostic error:', error);
        return false;
    }
}

// Quick test function
async function quickSaveDiagnostic() {
    console.log('🚀 Quick Save Diagnostic...');
    
    if (!window.gmkbData) {
        console.log('❌ No WordPress data');
        return;
    }
    
    try {
        // Minimal save test
        const response = await fetch(window.gmkbData.ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'guestify_save_media_kit',
                nonce: window.gmkbData.nonce,
                post_id: window.gmkbData.postId,
                state: JSON.stringify({ components: {}, layout: [], globalSettings: {} })
            })
        });
        
        const data = await response.json();
        console.log('📊 Quick save result:', data);
        
        return data.success;
        
    } catch (error) {
        console.error('❌ Quick save error:', error);
        return false;
    }
}

// Debug the StateManager save process
function debugStateManagerSave() {
    console.log('🔍 Debugging StateManager save process...');
    
    if (!window.GMKB || !window.GMKB.systems || !window.GMKB.systems.StateManager) {
        console.log('❌ StateManager not available');
        return;
    }
    
    const stateManager = window.GMKB.systems.StateManager;
    const currentState = stateManager.getState();
    
    console.log('📊 Current state:', currentState);
    console.log('📊 State size:', JSON.stringify(currentState).length, 'characters');
    console.log('📊 Components count:', Object.keys(currentState.components).length);
    console.log('📊 Layout length:', currentState.layout.length);
    
    // Try to trigger a save manually
    console.log('🔍 Triggering manual save...');
    
    stateManager.saveToStorage({
        onComplete: (result) => {
            console.log('✅ Manual save completed:', result);
        },
        onError: (error) => {
            console.error('❌ Manual save failed:', error);
        }
    });
}

// Test the specific AJAX endpoint
async function testAjaxEndpoint() {
    console.log('🔍 Testing AJAX endpoint directly...');
    
    try {
        // Test with minimal data
        const response = await fetch(window.gmkbData.ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'guestify_save_media_kit',
                nonce: window.gmkbData.nonce,
                post_id: window.gmkbData.postId,
                state: '{"components":{},"layout":[],"globalSettings":{}}'
            })
        });
        
        if (!response.ok) {
            console.error('❌ HTTP error:', response.status, response.statusText);
            return false;
        }
        
        const text = await response.text();
        console.log('📄 Raw response:', text);
        
        try {
            const data = JSON.parse(text);
            console.log('📊 Parsed response:', data);
        } catch (e) {
            console.error('❌ Invalid JSON response:', e);
        }
        
    } catch (error) {
        console.error('❌ Endpoint test error:', error);
    }
}

// Available commands
console.log(`
🔍 SAVE DIAGNOSTIC COMMANDS:

diagnoseSaveOperation() - Comprehensive save analysis
quickSaveDiagnostic() - Quick save test
debugStateManagerSave() - Debug StateManager process
testAjaxEndpoint() - Test raw AJAX endpoint

Start with: diagnoseSaveOperation()
`);

// Auto-run quick diagnostic
setTimeout(quickSaveDiagnostic, 500);
