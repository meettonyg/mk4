/**
 * GMKB Quick REST API Test - v2 Endpoints (No jQuery Required)
 * 
 * Tests the ACTUAL endpoints used by the frontend Vue application
 * 
 * Usage:
 * 1. Open browser console on any WordPress page
 * 2. Paste this script and press Enter
 * 3. All tests should pass (v2 API is always active)
 */

(async function() {
  console.clear();
  console.log('%c🔍 GMKB REST API v2 VERIFICATION', 'font-size: 16px; font-weight: bold; color: #3b82f6;');
  console.log('═'.repeat(60));
  console.log('');
  
  const postId = 32372; // Change this to your post ID
  const baseUrl = window.location.origin;
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: { passed: 0, failed: 0 }
  };
  
  function log(message, type = 'info') {
    const styles = {
      info: 'color: #3b82f6',
      success: 'color: #10b981; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold'
    };
    console.log(`%c${message}`, styles[type] || styles.info);
  }
  
  // ═══════════════════════════════════════════════════════════
  // TEST 1: Media Kit Data Endpoint (v2 - ACTUAL FRONTEND API)
  // ═══════════════════════════════════════════════════════════
  console.log('━━ TEST 1: Media Kit Data Endpoint (v2) ━━');
  
  const mediaKitUrl = `${baseUrl}/wp-json/gmkb/v2/mediakit/${postId}`;
  log('Testing: ' + mediaKitUrl);
  
  try {
    const response = await fetch(mediaKitUrl);
    log('Status: ' + response.status + ' ' + response.statusText, response.ok ? 'success' : 'error');
    
    if (response.ok) {
      const data = await response.json();
      log('✅ TEST 1 PASSED', 'success');
      log('  - Post ID: ' + data.postId);
      log('  - Theme: ' + data.theme);
      log('  - Components: ' + Object.keys(data.components || {}).length);
      log('  - Timestamp: ' + data.timestamp);
      
      results.tests.push({
        name: 'Media Kit Data',
        passed: true,
        data: { theme: data.theme, components: Object.keys(data.components || {}).length }
      });
      results.summary.passed++;
    } else {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      log('❌ TEST 1 FAILED: ' + error.message, 'error');
      
      if (response.status === 404) {
        log('⚠️ CRITICAL: v2 API not loaded!', 'error');
        log('   Check: class-gmkb-rest-api-v2.php is included in main plugin file', 'error');
      }
      
      results.tests.push({
        name: 'Media Kit Data',
        passed: false,
        error: error.message,
        status: response.status
      });
      results.summary.failed++;
    }
  } catch (error) {
    log('❌ TEST 1 FAILED: ' + error.message, 'error');
    results.tests.push({
      name: 'Media Kit Data',
      passed: false,
      error: error.message
    });
    results.summary.failed++;
  }
  
  console.log('');
  
  // ═══════════════════════════════════════════════════════════
  // TEST 2: Component Metadata Endpoint (v2)
  // ═══════════════════════════════════════════════════════════
  console.log('━━ TEST 2: Component Metadata Endpoint (v2) ━━');
  
  const customizationsUrl = `${baseUrl}/wp-json/gmkb/v2/components`;
  log('Testing: ' + customizationsUrl);
  
  try {
    const response = await fetch(customizationsUrl);
    log('Status: ' + response.status + ' ' + response.statusText, response.ok ? 'success' : 'error');
    
    if (response.ok) {
      const data = await response.json();
      log('✅ TEST 2 PASSED', 'success');
      log('  - Components Available: ' + (data.components?.length || 0));
      log('  - Categories: ' + (data.categories ? Object.keys(data.categories).length : 0));
      log('  - API Version: ' + (data.version || 'unknown'));
      
      results.tests.push({
        name: 'Component Metadata',
        passed: true,
        data: { componentCount: data.components?.length || 0 }
      });
      results.summary.passed++;
    } else {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      log('❌ TEST 2 FAILED: ' + error.message, 'error');
      
      if (response.status === 404) {
        log('⚠️ CRITICAL: v2 API not loaded!', 'error');
        log('   Check: class-gmkb-rest-api-v2.php is included in main plugin file', 'error');
      }
      
      results.tests.push({
        name: 'Component Metadata',
        passed: false,
        error: error.message,
        status: response.status
      });
      results.summary.failed++;
    }
  } catch (error) {
    log('❌ TEST 2 FAILED: ' + error.message, 'error');
    results.tests.push({
      name: 'Component Metadata',
      passed: false,
      error: error.message
    });
    results.summary.failed++;
  }
  
  console.log('');
  
  // ═══════════════════════════════════════════════════════════
  // TEST 3: CSS Variables in DOM
  // ═══════════════════════════════════════════════════════════
  console.log('━━ TEST 3: CSS Variables in DOM ━━');
  
  const criticalVars = [
    '--gmkb-color-primary',
    '--gmkb-color-background',
    '--gmkb-font-primary',
    '--gmkb-border-radius',
    '--gmkb-spacing-md'
  ];
  
  const rootStyles = getComputedStyle(document.documentElement);
  const foundVars = {};
  let foundCount = 0;
  
  for (const varName of criticalVars) {
    const value = rootStyles.getPropertyValue(varName).trim();
    foundVars[varName] = value || null;
    if (value) {
      log(`✅ ${varName}: ${value}`, 'success');
      foundCount++;
    } else {
      log(`❌ ${varName}: Not found`, 'error');
    }
  }
  
  const allFound = foundCount === criticalVars.length;
  
  if (allFound) {
    log('✅ TEST 3 PASSED - All CSS variables found', 'success');
    results.tests.push({
      name: 'CSS Variables',
      passed: true,
      data: { foundCount, totalCount: criticalVars.length }
    });
    results.summary.passed++;
  } else {
    log(`⚠️ TEST 3 PARTIAL: ${foundCount}/${criticalVars.length} variables found`, 'error');
    
    if (foundCount === 0) {
      log('⚠️ This may be normal if:', 'error');
      log('   1. You\'re not on a media kit page', 'error');
      log('   2. The template hasn\'t loaded yet', 'error');
      log('   3. Theme customizations are empty', 'error');
    }
    
    results.tests.push({
      name: 'CSS Variables',
      passed: false,
      data: { foundCount, totalCount: criticalVars.length, variables: foundVars }
    });
    results.summary.failed++;
  }
  
  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('');
  console.log('═'.repeat(60));
  console.log('%c📊 TEST SUMMARY', 'font-size: 16px; font-weight: bold; color: #3b82f6;');
  console.log('═'.repeat(60));
  console.log('');
  
  log('Total Tests: ' + (results.summary.passed + results.summary.failed));
  log('✅ Passed: ' + results.summary.passed, 'success');
  log('❌ Failed: ' + results.summary.failed, results.summary.failed > 0 ? 'error' : 'success');
  
  console.log('');
  
  if (results.summary.failed === 0) {
    console.log('%c✅ ALL TESTS PASSED!', 'font-size: 18px; font-weight: bold; color: #10b981;');
    console.log('The v2 REST API (used by frontend) is working correctly.');
  } else if (results.tests[0] && !results.tests[0].passed && results.tests[0].status === 404) {
    console.log('%c⚠️ REST API v2 NOT LOADED', 'font-size: 18px; font-weight: bold; color: #ef4444;');
    console.log('');
    console.log('SOLUTION:');
    console.log('1. Check that class-gmkb-rest-api-v2.php exists');
    console.log('2. Verify it\'s included in guestify-media-kit-builder.php');
    console.log('3. Deactivate/reactivate the plugin');
    console.log('4. Re-run this test');
  } else {
    console.log('%c⚠️ SOME TESTS FAILED', 'font-size: 18px; font-weight: bold; color: #f59e0b;');
    console.log('Review the detailed output above.');
  }
  
  console.log('');
  console.log('═'.repeat(60));
  console.log('');
  console.log('💾 Full results stored in: window.GMKB_QuickTest');
  window.GMKB_QuickTest = results;
  
  return results;
})();
