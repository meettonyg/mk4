/**
 * EMERGENCY PHP ERROR DIAGNOSTIC
 * Paste this into browser console to identify PHP errors preventing event-driven fix
 */

console.log('🚨 EMERGENCY PHP ERROR DIAGNOSTIC');
console.log('════════════════════════════════════════════════════════════════════════');

async function emergencyPhpDiagnostic() {
    console.log('🔍 Testing AJAX call with detailed error reporting...');
    
    try {
        const formData = new FormData();
        formData.append('action', 'guestify_render_design_panel');
        formData.append('component', 'topics');
        formData.append('post_id', '32372');
        formData.append('nonce', window.gmkbData?.nonce || '');
        
        console.log('📤 Sending AJAX request...');
        console.log('   Action: guestify_render_design_panel');
        console.log('   Component: topics');
        console.log('   Post ID: 32372');
        console.log('   Nonce: ' + (window.gmkbData?.nonce || 'MISSING'));
        
        const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });
        
        console.log('📥 Response received:');
        console.log('   Status: ' + response.status);
        console.log('   Status Text: ' + response.statusText);
        console.log('   Content-Type: ' + response.headers.get('content-type'));
        
        const responseText = await response.text();
        console.log('📄 Raw Response:');
        console.log(responseText);
        
        // Try to parse as JSON
        let parsedData = null;
        try {
            parsedData = JSON.parse(responseText);
            console.log('✅ JSON parsed successfully:');
            console.log(parsedData);
        } catch (jsonError) {
            console.log('❌ JSON parse error: ' + jsonError.message);
            console.log('🔍 Looking for PHP errors in response...');
            
            // Look for PHP errors
            if (responseText.includes('Fatal error')) {
                console.log('🚨 FATAL PHP ERROR DETECTED!');
                const errorMatch = responseText.match(/Fatal error:([^<\n]+)/);
                if (errorMatch) {
                    console.log('   Error: ' + errorMatch[1].trim());
                }
            }
            
            if (responseText.includes('Warning:')) {
                console.log('⚠️ PHP WARNING DETECTED!');
                const warningMatches = responseText.match(/Warning:([^<\n]+)/g);
                if (warningMatches) {
                    warningMatches.forEach(warning => {
                        console.log('   Warning: ' + warning.replace('Warning:', '').trim());
                    });
                }
            }
            
            if (responseText.includes('Parse error')) {
                console.log('🚨 PHP PARSE ERROR DETECTED!');
                const parseMatch = responseText.match(/Parse error:([^<\n]+)/);
                if (parseMatch) {
                    console.log('   Error: ' + parseMatch[1].trim());
                }
            }
            
            // Look for stack traces
            if (responseText.includes('Stack trace:')) {
                console.log('📍 Stack trace found in response');
            }
        }
        
        return {
            status: response.status,
            success: response.ok && parsedData?.success === true,
            error: !response.ok || parsedData?.success !== true,
            responseText: responseText,
            parsedData: parsedData
        };
        
    } catch (networkError) {
        console.log('🚨 NETWORK ERROR: ' + networkError.message);
        return {
            status: 0,
            success: false,
            error: true,
            networkError: networkError.message
        };
    }
}

// Test WordPress error logging
async function testWordPressErrorLog() {
    console.log('📋 Checking WordPress error logging...');
    
    // Check if debug mode is enabled
    console.log('   WP_DEBUG enabled: ' + (window.gmkbData?.debugMode ? 'YES' : 'NO'));
    
    // Test a simple AJAX call to see if basic functionality works
    try {
        const formData = new FormData();
        formData.append('action', 'heartbeat');
        formData.append('data', JSON.stringify({}));
        
        const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });
        
        const text = await response.text();
        console.log('   WordPress heartbeat: ' + (response.ok ? 'WORKING' : 'FAILED'));
        
    } catch (error) {
        console.log('   WordPress heartbeat: FAILED - ' + error.message);
    }
}

// Check file permissions and existence
function checkFileSystemStatus() {
    console.log('📁 Checking file system status...');
    
    // This would need to be enhanced with server-side checks
    console.log('   Plugin URL: ' + (window.gmkbData?.pluginUrl || 'MISSING'));
    console.log('   AJAX URL: ' + (window.gmkbData?.ajaxUrl || 'MISSING'));
    
    // Test if we can load any plugin assets
    const testScript = document.createElement('script');
    testScript.onload = () => console.log('   ✅ Plugin assets loadable');
    testScript.onerror = () => console.log('   ❌ Plugin assets not loadable');
    testScript.src = window.gmkbData?.pluginUrl + 'js/main.js';
    // Don't actually append to avoid side effects
}

// Main diagnostic function
async function runEmergencyDiagnostic() {
    console.log('🚀 STARTING EMERGENCY DIAGNOSTIC...');
    console.log('');
    
    // Test 1: File system
    checkFileSystemStatus();
    console.log('');
    
    // Test 2: WordPress functionality
    await testWordPressErrorLog();
    console.log('');
    
    // Test 3: AJAX call with error detection
    const result = await emergencyPhpDiagnostic();
    console.log('');
    
    console.log('🎯 DIAGNOSTIC COMPLETE');
    console.log('════════════════════════════════════════════════════════════════════════');
    
    if (result.success) {
        console.log('✅ AJAX working - issue may be in data processing');
    } else {
        console.log('❌ AJAX failing - PHP error or configuration issue');
        console.log('🔧 NEXT STEPS:');
        console.log('   1. Check WordPress error logs');
        console.log('   2. Verify file permissions');
        console.log('   3. Check PHP syntax in modified files');
        console.log('   4. Clear any caching');
    }
    
    return result;
}

// Auto-run
console.log('🏃‍♂️ Running emergency diagnostic...');
runEmergencyDiagnostic();

// Expose functions
window.emergencyPhpDiagnostic = emergencyPhpDiagnostic;
window.runEmergencyDiagnostic = runEmergencyDiagnostic;
