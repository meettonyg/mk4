/**
 * Pods Data Flow Debugging Script
 * 
 * USAGE:
 * 1. Open builder page in browser
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 5. Review the diagnostic output
 * 
 * This will check every step of Pods data flow from gmkbData to components
 */

(function() {
    console.log('%c===========================================', 'color: #2563eb; font-weight: bold');
    console.log('%c🔍 PODS DATA FLOW DIAGNOSTIC', 'color: #2563eb; font-weight: bold; font-size: 16px');
    console.log('%c===========================================', 'color: #2563eb; font-weight: bold');
    console.log('');
    
    let issuesFound = [];
    let testsRun = 0;
    let testsPassed = 0;
    
    // Helper functions
    function pass(message) {
        console.log('%c✅ PASS:', 'color: #16a34a; font-weight: bold', message);
        testsPassed++;
    }
    
    function fail(message, suggestion) {
        console.log('%c❌ FAIL:', 'color: #dc2626; font-weight: bold', message);
        if (suggestion) {
            console.log('%c   💡 FIX:', 'color: #f59e0b; font-weight: bold', suggestion);
        }
        issuesFound.push(message);
    }
    
    function warn(message, suggestion) {
        console.log('%c⚠️  WARN:', 'color: #f59e0b; font-weight: bold', message);
        if (suggestion) {
            console.log('%c   💡 NOTE:', 'color: #3b82f6', suggestion);
        }
    }
    
    function section(title) {
        testsRun++;
        console.log('');
        console.log('%c' + title, 'color: #3b82f6; font-weight: bold; font-size: 14px');
        console.log('%c' + '─'.repeat(50), 'color: #3b82f6');
    }
    
    // TEST 1: Check if gmkbData exists
    section('Test 1: Global gmkbData Object');
    
    if (typeof window.gmkbData === 'undefined') {
        fail('window.gmkbData is NOT defined', 
            'Check PHP enqueue.php - gmkb_prepare_data_for_injection() may have failed');
        console.log('   Check WordPress debug.log for PHP errors');
        return; // Can't continue without gmkbData
    } else {
        pass('window.gmkbData exists');
        console.log('   Type:', typeof window.gmkbData);
        console.log('   Keys:', Object.keys(window.gmkbData));
    }
    
    // TEST 2: Check pods_data in gmkbData
    section('Test 2: Pods Data in gmkbData');
    
    if (!window.gmkbData.pods_data) {
        fail('gmkbData.pods_data is missing', 
            'Check gmkb_get_pods_data() in includes/enqueue.php');
        console.log('   This should be set by PHP before Vue loads');
    } else if (typeof window.gmkbData.pods_data !== 'object') {
        fail('gmkbData.pods_data is not an object', 
            'Expected object, got: ' + typeof window.gmkbData.pods_data);
    } else if (Object.keys(window.gmkbData.pods_data).length === 0) {
        warn('gmkbData.pods_data is empty (no fields)', 
            'This may be normal if no guest is selected or Pods has no data');
        console.log('   Post ID:', window.gmkbData.postId);
    } else {
        pass('gmkbData.pods_data exists with ' + Object.keys(window.gmkbData.pods_data).length + ' fields');
        console.log('   Sample fields:', Object.keys(window.gmkbData.pods_data).slice(0, 5));
        console.log('   Full data:', window.gmkbData.pods_data);
    }
    
    // TEST 3: Check Pinia store
    section('Test 3: Pinia Store State');
    
    if (typeof window.__PINIA__ === 'undefined') {
        fail('Pinia store not initialized', 
            'Vue app may not be loaded yet. Wait a moment and try again.');
    } else {
        pass('Pinia store exists');
        
        // Try to access the main store
        const stores = window.__PINIA__.state.value;
        console.log('   Available stores:', Object.keys(stores));
        
        // Check if main store has pods data
        if (stores.main) {
            console.log('   Main store state keys:', Object.keys(stores.main));
            
            if (stores.main.podsData) {
                pass('Main store has podsData');
                console.log('   Pods data keys:', Object.keys(stores.main.podsData));
                console.log('   Pods data:', stores.main.podsData);
            } else {
                fail('Main store missing podsData', 
                    'Store should initialize with gmkbData.pods_data');
            }
        } else {
            warn('Main store not found', 
                'Store may use different name. Available: ' + Object.keys(stores).join(', '));
        }
    }
    
    // TEST 4: Check usePodsData composable
    section('Test 4: usePodsData Composable Access');
    
    console.log('Testing if components can access Pods data...');
    console.log('Checking a few common fields:');
    
    const testFields = ['first_name', 'last_name', 'biography', 'email', '1_twitter'];
    let fieldsFound = 0;
    
    if (window.gmkbData && window.gmkbData.pods_data) {
        testFields.forEach(field => {
            const value = window.gmkbData.pods_data[field];
            if (value !== undefined && value !== null && value !== '') {
                console.log('   ✅', field + ':', value);
                fieldsFound++;
            } else {
                console.log('   ⚪', field + ':', 'empty/null');
            }
        });
        
        if (fieldsFound === 0) {
            warn('No test fields have data', 
                'Either no guest data exists in Pods, or wrong post type');
        } else {
            pass(fieldsFound + '/' + testFields.length + ' test fields have data');
        }
    }
    
    // TEST 5: Check REST API
    section('Test 5: REST API v2 Response');
    
    const postId = window.gmkbData?.postId;
    
    if (!postId) {
        fail('No post ID available', 'Cannot test REST API without post ID');
    } else {
        console.log('   Testing REST API for post #' + postId);
        console.log('   Making request...');
        
        fetch(window.gmkbData.restUrl + 'gmkb/v2/mediakit/' + postId, {
            headers: {
                'X-WP-Nonce': window.gmkbData.restNonce
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ': ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('   ✅ REST API Response received');
            console.log('   Response keys:', Object.keys(data));
            
            if (data.podsData) {
                pass('REST API returns podsData with ' + Object.keys(data.podsData).length + ' fields');
                console.log('   Sample fields:', Object.keys(data.podsData).slice(0, 5));
                console.log('   Full podsData:', data.podsData);
                
                // Compare with gmkbData
                const gmkbFields = Object.keys(window.gmkbData.pods_data || {}).length;
                const apiFields = Object.keys(data.podsData).length;
                
                if (gmkbFields !== apiFields) {
                    warn('Field count mismatch', 
                        'gmkbData has ' + gmkbFields + ' fields, API returns ' + apiFields + ' fields');
                }
            } else {
                fail('REST API response missing podsData', 
                    'Check class-gmkb-rest-api-v2.php fetch_all_pods_data()');
            }
        })
        .catch(error => {
            fail('REST API request failed: ' + error.message, 
                'Check WordPress REST API permissions and nonce');
            console.error('   Error details:', error);
        });
    }
    
    // TEST 6: Check ComponentDiscovery
    section('Test 6: Component Registry & Pods Config');
    
    if (!window.gmkbData.componentRegistry) {
        fail('componentRegistry missing from gmkbData', 
            'Check gmkb_get_component_registry_data() in enqueue.php');
    } else {
        const components = Object.values(window.gmkbData.componentRegistry);
        pass('Component registry has ' + components.length + ' components');
        
        // Check which components have Pods requirements
        let componentsWithPods = 0;
        console.log('   Components with Pods data requirements:');
        
        // Note: pods-config.json data isn't typically included in registry
        // But we can check which components are commonly Pods-dependent
        const podsComponents = [
            'biography', 'guest-intro', 'hero', 'contact', 
            'social', 'topics', 'questions', 'video-intro'
        ];
        
        components.forEach(comp => {
            if (podsComponents.includes(comp.type)) {
                console.log('   • ' + comp.name + ' (' + comp.type + ')');
                componentsWithPods++;
            }
        });
        
        if (componentsWithPods === 0) {
            warn('No known Pods-dependent components in registry', 
                'This may indicate component discovery issues');
        } else {
            console.log('   Found ' + componentsWithPods + ' Pods-dependent components');
        }
    }
    
    // TEST 7: Check actual component instances
    section('Test 7: Rendered Component Data Binding');
    
    console.log('Checking if components are actually displaying Pods data...');
    
    // Try to find component elements in DOM
    const componentElements = document.querySelectorAll('[data-component-type]');
    
    if (componentElements.length === 0) {
        warn('No rendered components found in DOM', 
            'Components may not be added yet, or using different data attributes');
    } else {
        console.log('   Found ' + componentElements.length + ' component elements in DOM');
        
        // Check a few for data binding
        let componentsWithData = 0;
        componentElements.forEach((el, idx) => {
            if (idx < 3) { // Check first 3 components
                const type = el.getAttribute('data-component-type');
                const text = el.textContent.trim();
                
                if (text.length > 10) {
                    componentsWithData++;
                    console.log('   ✅ Component ' + (idx + 1) + ' (' + type + '): Has content (' + text.length + ' chars)');
                } else {
                    console.log('   ⚪ Component ' + (idx + 1) + ' (' + type + '): Empty or minimal content');
                }
            }
        });
        
        if (componentsWithData > 0) {
            pass('At least some components have content');
        } else {
            warn('Components rendered but appear empty', 
                'Data may not be binding correctly in Vue components');
        }
    }
    
    // TEST 8: Check Vue devtools
    section('Test 8: Vue DevTools Availability');
    
    if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
        pass('Vue DevTools detected');
        console.log('   💡 TIP: Open Vue DevTools to inspect component props and data');
        console.log('   Look for components like BiographyRenderer, HeroRenderer, etc.');
        console.log('   Check their props for podsData or enrichedData');
    } else {
        warn('Vue DevTools not detected', 
            'Install Vue DevTools browser extension for better debugging');
    }
    
    // SUMMARY
    console.log('');
    console.log('%c===========================================', 'color: #2563eb; font-weight: bold');
    console.log('%c📊 DIAGNOSTIC SUMMARY', 'color: #2563eb; font-weight: bold; font-size: 16px');
    console.log('%c===========================================', 'color: #2563eb; font-weight: bold');
    console.log('');
    console.log('Tests Run:', testsRun);
    console.log('Tests Passed:', testsPassed);
    console.log('');
    
    if (issuesFound.length === 0) {
        console.log('%c✅ No critical issues found!', 'color: #16a34a; font-weight: bold; font-size: 14px');
        console.log('');
        console.log('If fields still not showing, check:');
        console.log('1. Pods plugin is active');
        console.log('2. Correct post type (mkcg or guests)');
        console.log('3. Guest has data in Pods fields');
        console.log('4. Component is using usePodsData() composable correctly');
        console.log('5. Vue component templates are binding to the right data');
    } else {
        console.log('%c❌ Issues Found:', 'color: #dc2626; font-weight: bold; font-size: 14px');
        issuesFound.forEach((issue, idx) => {
            console.log((idx + 1) + '. ' + issue);
        });
        console.log('');
        console.log('%cNext Steps:', 'color: #f59e0b; font-weight: bold');
        console.log('1. Review the FAIL messages above');
        console.log('2. Follow the suggested fixes');
        console.log('3. Check WordPress debug.log for PHP errors');
        console.log('4. Re-run this diagnostic after fixes');
    }
    
    console.log('');
    console.log('%cFull Data Dump:', 'color: #6366f1; font-weight: bold');
    console.log('───────────────────────────────────────────');
    console.log('gmkbData:', window.gmkbData);
    console.log('Pinia stores:', window.__PINIA__?.state?.value);
    console.log('');
    console.log('%c✨ Diagnostic Complete', 'color: #2563eb; font-weight: bold');
    
})();
