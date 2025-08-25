/**
 * Test D1: WordPress Integration - Localized Data Presence
 * Tests WordPress localized data availability and structure
 */

if (typeof GMKBTest === 'undefined') {
    throw new Error('GMKBTest harness not loaded');
}

GMKBTest.tests.D1 = async function() {
    console.log('🔌 D1: Testing WordPress integration and localized data...');
    
    try {
        // Step 1: Check WordPress data availability
        console.log('📡 Step 1: Checking WordPress data availability...');
        
        GMKBTest.assert(window.gmkbData, 'gmkbData should be available from wp_localize_script');
        console.log('✅ gmkbData is available');
        
        // Step 2: Verify required WordPress fields
        console.log('🔍 Step 2: Verifying required WordPress fields...');
        
        const requiredFields = {
            ajaxUrl: 'AJAX endpoint URL',
            nonce: 'Security nonce',
            postId: 'Current post ID',
            pluginUrl: 'Plugin URL',
            components: 'Component definitions',
            categories: 'Component categories'
        };
        
        const fieldResults = {};
        
        Object.entries(requiredFields).forEach(([field, description]) => {
            const exists = window.gmkbData.hasOwnProperty(field);
            const hasValue = exists && window.gmkbData[field] !== null && window.gmkbData[field] !== '';
            
            fieldResults[field] = { exists, hasValue, value: window.gmkbData[field] };
            
            if (hasValue) {
                console.log(`  ✅ ${field}: ${description} - ${typeof window.gmkbData[field]}`);
            } else {
                console.log(`  ⚠️ ${field}: ${description} - missing or empty`);
            }
        });
        
        // Step 3: Validate AJAX URL
        console.log('🌐 Step 3: Validating AJAX URL...');
        
        let ajaxUrlValid = false;
        if (fieldResults.ajaxUrl.hasValue) {
            const ajaxUrl = window.gmkbData.ajaxUrl;
            
            // Check if it's a proper WordPress admin-ajax.php URL
            const isValidAjaxUrl = ajaxUrl.includes('admin-ajax.php') || ajaxUrl.includes('wp-admin');
            
            if (isValidAjaxUrl) {
                ajaxUrlValid = true;
                console.log(`  ✅ AJAX URL is valid: ${ajaxUrl}`);
            } else {
                console.log(`  ⚠️ AJAX URL may be invalid: ${ajaxUrl}`);
            }
        }
        
        // Step 4: Validate nonce
        console.log('🔐 Step 4: Validating security nonce...');
        
        let nonceValid = false;
        if (fieldResults.nonce.hasValue) {
            const nonce = window.gmkbData.nonce;
            
            // WordPress nonces are typically 10 characters
            const isValidNonce = typeof nonce === 'string' && nonce.length >= 8;
            
            if (isValidNonce) {
                nonceValid = true;
                console.log(`  ✅ Nonce appears valid: ${nonce.substring(0, 4)}... (${nonce.length} chars)`);
            } else {
                console.log(`  ⚠️ Nonce may be invalid: ${nonce}`);
            }
        }
        
        // Step 5: Validate post ID
        console.log('🆔 Step 5: Validating post ID...');
        
        let postIdValid = false;
        if (fieldResults.postId.hasValue) {
            const postId = window.gmkbData.postId || window.gmkbData.post_id;
            
            const isValidPostId = Number.isInteger(postId) && postId > 0;
            
            if (isValidPostId) {
                postIdValid = true;
                console.log(`  ✅ Post ID is valid: ${postId}`);
            } else {
                console.log(`  ⚠️ Post ID may be invalid: ${postId}`);
            }
        }
        
        // Step 6: Test AJAX connectivity (simple ping)
        console.log('📞 Step 6: Testing AJAX connectivity...');
        
        let ajaxConnectivityWorked = false;
        
        if (ajaxUrlValid && nonceValid) {
            try {
                const testData = new FormData();
                testData.append('action', 'gmkb_ping_test'); // Non-existent action for testing
                testData.append('nonce', window.gmkbData.nonce);
                
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    body: testData
                });
                
                // Even if the action doesn't exist, we should get a proper WordPress response
                if (response.ok || response.status === 400) {
                    ajaxConnectivityWorked = true;
                    console.log('  ✅ AJAX endpoint is reachable');
                } else {
                    console.log(`  ⚠️ AJAX endpoint returned status: ${response.status}`);
                }
            } catch (error) {
                console.log(`  ⚠️ AJAX connectivity test failed: ${error.message}`);
            }
        } else {
            console.log('  ⚠️ Cannot test AJAX connectivity - invalid URL or nonce');
        }
        
        // Step 7: Check WordPress global variables
        console.log('🌐 Step 7: Checking WordPress global variables...');
        
        const wpGlobals = {
            wp: 'WordPress core object',
            ajaxurl: 'Global AJAX URL (admin context)',
            pagenow: 'Current page identifier',
            adminpage: 'Admin page identifier'
        };
        
        const wpGlobalResults = {};
        
        Object.entries(wpGlobals).forEach(([global, description]) => {
            const exists = window.hasOwnProperty(global);
            wpGlobalResults[global] = exists;
            
            if (exists) {
                console.log(`  ✅ ${global}: ${description} - available`);
            } else {
                console.log(`  ⚠️ ${global}: ${description} - not available (may be frontend)`);
            }
        });
        
        // Step 8: Check plugin-specific data structure
        console.log('📦 Step 8: Checking plugin-specific data structure...');
        
        const pluginDataChecks = {
            architecture: window.gmkbData.architecture === 'wordpress-global-namespace',
            debugMode: typeof window.gmkbData.debugMode === 'boolean',
            builderPage: window.gmkbData.builderPage === true,
            moduleSupport: window.gmkbData.moduleSupport === false, // Should be false for WordPress compatibility
            es6Converted: window.gmkbData.es6Converted === true
        };
        
        Object.entries(pluginDataChecks).forEach(([check, expected]) => {
            if (expected) {
                console.log(`  ✅ ${check}: correctly configured`);
            } else {
                console.log(`  ⚠️ ${check}: may not be correctly configured`);
            }
        });
        
        // Step 9: Test data consistency with DOM
        console.log('🔄 Step 9: Testing data consistency with DOM...');
        
        let dataConsistencyValid = false;
        
        // Check if post ID in data matches DOM
        const domPostId = document.body.dataset.postId || 
                         document.querySelector('[data-post-id]')?.dataset.postId ||
                         document.documentElement.dataset.postId;
        
        if (domPostId && parseInt(domPostId) === parseInt(window.gmkbData.postId || window.gmkbData.post_id)) {
            dataConsistencyValid = true;
            console.log('  ✅ Post ID consistent between data and DOM');
        } else if (!domPostId) {
            console.log('  ⚠️ No post ID found in DOM to compare');
        } else {
            console.log(`  ⚠️ Post ID mismatch - Data: ${window.gmkbData.postId}, DOM: ${domPostId}`);
        }
        
        // Step 10: Check localization completeness
        console.log('📊 Step 10: Checking localization completeness...');
        
        const totalDataKeys = Object.keys(window.gmkbData).length;
        const requiredDataKeys = Object.keys(requiredFields).length;
        const completenessScore = (Object.values(fieldResults).filter(f => f.hasValue).length / requiredDataKeys) * 100;
        
        console.log(`  📊 Data completeness: ${completenessScore.toFixed(1)}% (${totalDataKeys} total keys)`);
        
        const isWellFormed = totalDataKeys >= 10 && completenessScore >= 80;
        
        if (isWellFormed) {
            console.log('  ✅ WordPress integration appears well-formed');
        } else {
            console.log('  ⚠️ WordPress integration may have issues');
        }
        
        return {
            ok: isWellFormed && ajaxUrlValid && nonceValid && postIdValid,
            details: {
                fieldResults: fieldResults,
                ajaxUrlValid: ajaxUrlValid,
                nonceValid: nonceValid,
                postIdValid: postIdValid,
                ajaxConnectivityWorked: ajaxConnectivityWorked,
                wpGlobalResults: wpGlobalResults,
                pluginDataChecks: pluginDataChecks,
                dataConsistencyValid: dataConsistencyValid,
                totalDataKeys: totalDataKeys,
                completenessScore: completenessScore,
                gmkbDataKeys: Object.keys(window.gmkbData)
            }
        };
        
    } catch (error) {
        console.error('❌ D1 Test failed:', error);
        
        return {
            ok: false,
            error: error.message,
            details: {
                gmkbDataExists: !!window.gmkbData,
                windowKeys: Object.keys(window).filter(key => key.includes('gmkb') || key.includes('wp')),
                documentReady: document.readyState,
                wpLocalized: !!window.wp
            }
        };
    }
};

// Auto-run if called directly
if (typeof module === 'undefined' && typeof window !== 'undefined') {
    console.log('🧪 D1 Test loaded - run with: await GMKBTest.tests.D1()');
}
