/**
 * Comprehensive Diagnostic Tool for Media Kit Builder
 * Based on Gemini's feedback - checks all possible causes
 */

(function() {
  'use strict';
  
  console.log('🔍 Starting Comprehensive Diagnostics...\n');
  
  const diagnostics = {
    passed: [],
    warnings: [],
    errors: []
  };
  
  // 1. Check Component Registration
  console.group('1️⃣ Component Registration Check');
  
  // Check if registry exists
  const registry = window.UnifiedComponentRegistry || window.gmkbComponentRegistry;
  if (registry) {
    diagnostics.passed.push('Component registry found');
    
    // Get registered types
    const types = registry.getAvailableTypes?.() || registry.getComponentTypes?.() || [];
    console.log('Registered component types:', types);
    
    // Check for unknown_type
    if (types.includes('unknown_type')) {
      diagnostics.errors.push('❌ "unknown_type" is registered as a valid component!');
    } else {
      diagnostics.passed.push('✅ "unknown_type" is not in registry');
    }
    
    // Check for dynamic component issues
    const store = window.gmkbStore || window.mediaKitStore;
    if (store && store.components) {
      const invalidComponents = Object.entries(store.components).filter(([id, comp]) => 
        !comp.type || comp.type === 'unknown_type' || !types.includes(comp.type)
      );
      
      if (invalidComponents.length > 0) {
        diagnostics.errors.push(`❌ Found ${invalidComponents.length} invalid components in store`);
        console.error('Invalid components:', invalidComponents);
      } else {
        diagnostics.passed.push('✅ All components in store have valid types');
      }
    }
  } else {
    diagnostics.errors.push('❌ Component registry not found');
  }
  console.groupEnd();
  
  // 2. Check Nonce Configuration
  console.group('2️⃣ Nonce Configuration Check');
  
  const gmkbData = window.gmkbData || {};
  const mkcgVars = window.mkcg_vars || {};
  
  // Check for nonces
  const nonces = {
    gmkb_nonce: gmkbData.nonce,
    mkcg_nonce: mkcgVars.nonce,
    wp_rest: gmkbData.restNonce
  };
  
  console.log('Available nonces:', Object.entries(nonces).filter(([k,v]) => v).map(([k,v]) => `${k}: ${v.substring(0,10)}...`));
  
  if (gmkbData.nonce) {
    diagnostics.passed.push('✅ gmkb_nonce available');
  } else {
    diagnostics.warnings.push('⚠️ gmkb_nonce not found');
  }
  
  if (gmkbData.ajaxUrl) {
    diagnostics.passed.push('✅ AJAX URL configured');
    console.log('AJAX URL:', gmkbData.ajaxUrl);
  } else {
    diagnostics.errors.push('❌ AJAX URL not configured');
  }
  
  console.groupEnd();
  
  // 3. Check User Authentication
  console.group('3️⃣ User Authentication Check');
  
  // Check if we can detect user status from the page
  const isLoggedIn = document.body.classList.contains('logged-in') || 
                      document.querySelector('#wpadminbar') !== null;
  
  if (isLoggedIn) {
    diagnostics.passed.push('✅ User appears to be logged in');
  } else {
    diagnostics.warnings.push('⚠️ User might not be logged in (403 errors expected)');
  }
  
  // Check user capabilities (if available in gmkbData)
  if (gmkbData.userCaps) {
    console.log('User capabilities:', gmkbData.userCaps);
  }
  
  console.groupEnd();
  
  // 4. Check for Security Plugins
  console.group('4️⃣ Security Plugin Detection');
  
  // Look for common security plugin indicators
  const securityIndicators = {
    'Wordfence': window.wordfenceAjax || document.querySelector('[class*="wordfence"]'),
    'Sucuri': document.querySelector('[class*="sucuri"]'),
    'iThemes Security': document.querySelector('[class*="ithemes"]'),
    'All In One WP Security': document.querySelector('[class*="aiowps"]')
  };
  
  const activePlugins = Object.entries(securityIndicators)
    .filter(([name, indicator]) => indicator)
    .map(([name]) => name);
  
  if (activePlugins.length > 0) {
    diagnostics.warnings.push(`⚠️ Security plugins detected: ${activePlugins.join(', ')}`);
    console.log('These plugins might interfere with AJAX requests');
  } else {
    diagnostics.passed.push('✅ No common security plugins detected');
  }
  
  console.groupEnd();
  
  // 5. Test AJAX Endpoint
  console.group('5️⃣ AJAX Endpoint Test');
  
  if (gmkbData.ajaxUrl && gmkbData.nonce) {
    console.log('Testing custom themes endpoint...');
    
    const formData = new FormData();
    formData.append('action', 'gmkb_load_custom_themes');
    formData.append('nonce', gmkbData.nonce);
    
    fetch(gmkbData.ajaxUrl, {
      method: 'POST',
      body: formData
    }).then(response => {
      console.log('Response status:', response.status);
      
      if (response.status === 200) {
        diagnostics.passed.push('✅ Custom themes endpoint working');
      } else if (response.status === 403) {
        diagnostics.errors.push('❌ 403 Forbidden - Check nonce or user permissions');
      } else if (response.status === 404) {
        diagnostics.warnings.push('⚠️ 404 Not Found - Endpoint might not be registered');
      } else {
        diagnostics.warnings.push(`⚠️ Unexpected status: ${response.status}`);
      }
      
      return response.text();
    }).then(text => {
      try {
        const json = JSON.parse(text);
        console.log('Response:', json);
      } catch (e) {
        console.log('Raw response:', text.substring(0, 200));
      }
    }).catch(error => {
      diagnostics.errors.push('❌ Network error testing endpoint');
      console.error('Error:', error);
    });
  } else {
    console.log('Cannot test - missing AJAX URL or nonce');
  }
  
  console.groupEnd();
  
  // 6. Check Build/Cache Status
  console.group('6️⃣ Build & Cache Status');
  
  // Check script version
  const scripts = Array.from(document.querySelectorAll('script[src*="gmkb"]'));
  scripts.forEach(script => {
    const src = script.src;
    const version = src.match(/[?&]v=([^&]+)/);
    if (version) {
      console.log(`Script version: ${version[1]}`);
    }
  });
  
  // Check if running from dist
  const distScript = document.querySelector('script[src*="/dist/gmkb.iife.js"]');
  if (distScript) {
    diagnostics.passed.push('✅ Running from built bundle');
    
    // Get file timestamp if available
    const timestamp = distScript.src.match(/\?(\d+)$/);
    if (timestamp) {
      const date = new Date(parseInt(timestamp[1]) * 1000);
      console.log('Bundle built:', date.toLocaleString());
    }
  } else {
    diagnostics.warnings.push('⚠️ Not running from dist bundle');
  }
  
  console.groupEnd();
  
  // Final Report
  console.group('📋 DIAGNOSTIC SUMMARY');
  
  if (diagnostics.errors.length > 0) {
    console.error('ERRORS (' + diagnostics.errors.length + ')');
    diagnostics.errors.forEach(e => console.error(e));
  }
  
  if (diagnostics.warnings.length > 0) {
    console.warn('WARNINGS (' + diagnostics.warnings.length + ')');
    diagnostics.warnings.forEach(w => console.warn(w));
  }
  
  if (diagnostics.passed.length > 0) {
    console.log('PASSED (' + diagnostics.passed.length + ')');
    diagnostics.passed.forEach(p => console.log(p));
  }
  
  console.groupEnd();
  
  // Recommendations
  console.group('💡 RECOMMENDATIONS');
  
  if (diagnostics.errors.some(e => e.includes('unknown_type'))) {
    console.log('1. Rebuild the bundle: npm run build');
    console.log('2. Clear browser cache');
    console.log('3. Check test files for code adding "unknown_type"');
  }
  
  if (diagnostics.errors.some(e => e.includes('403'))) {
    console.log('1. Verify user is logged in');
    console.log('2. Check nonce generation matches verification');
    console.log('3. Review user capabilities in AJAX handler');
    console.log('4. Temporarily disable security plugins');
  }
  
  console.groupEnd();
  
  // Make available globally
  window.gmkbDiagnostics = diagnostics;
  
  return diagnostics;
})();
