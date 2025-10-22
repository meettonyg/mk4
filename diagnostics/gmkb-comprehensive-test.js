/**
 * GMKB COMPREHENSIVE THEME DIAGNOSTIC TEST
 * 
 * Tests ALL theme customizer fields and CSS variable injection
 * This is the COMPLETE validation of your theme system
 * 
 * Usage:
 * 1. Navigate to a media kit page (frontend or builder)
 * 2. Open browser console (F12)
 * 3. Paste this entire script and press Enter
 * 4. Review detailed output
 */

(async function() {
  console.clear();
  console.log('%c🔍 GMKB COMPREHENSIVE THEME DIAGNOSTIC', 'font-size: 18px; font-weight: bold; color: #3b82f6; background: #eff6ff; padding: 8px;');
  console.log('═'.repeat(100));
  console.log('Timestamp:', new Date().toISOString());
  console.log('');

  const results = {
    timestamp: new Date().toISOString(),
    postId: null,
    theme: null,
    tests: [],
    cssVariables: {
      colors: {},
      typography: {},
      spacing: {},
      effects: {},
      layout: {},
      components: {}
    },
    summary: { 
      total: 0, 
      passed: 0, 
      failed: 0, 
      warnings: 0,
      cssVarsFound: 0,
      cssVarsTotal: 0
    }
  };

  function log(message, type = 'info') {
    const styles = {
      info: 'color: #3b82f6',
      success: 'color: #10b981; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold',
      warning: 'color: #f59e0b; font-weight: bold',
      section: 'color: #8b5cf6; font-weight: bold; font-size: 14px'
    };
    console.log(`%c${message}`, styles[type] || styles.info);
  }

  function addTest(name, passed, details = {}, warnings = []) {
    results.tests.push({ name, passed, details, warnings });
    results.summary.total++;
    if (passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
    if (warnings.length > 0) {
      results.summary.warnings += warnings.length;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 1: Detect Post ID
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n━━ TEST 1: Post ID Detection ━━');

  let postId = null;
  const container = document.querySelector('[data-gmkb-post-id]');
  
  if (container) {
    postId = container.dataset.gmkbPostId;
    log('✅ Post ID from DOM: ' + postId, 'success');
  } else if (window.gmkbData?.postId) {
    postId = window.gmkbData.postId;
    log('✅ Post ID from gmkbData: ' + postId, 'success');
  } else {
    // Try to extract from URL
    const urlParams = new URLSearchParams(window.location.search);
    postId = urlParams.get('mkcg_id') || urlParams.get('post_id');
    if (postId) {
      log('✅ Post ID from URL: ' + postId, 'success');
    }
  }

  if (!postId) {
    log('❌ Could not detect Post ID', 'error');
    log('⚠️ Please ensure you are on a media kit page', 'warning');
    addTest('Post ID Detection', false, { postId: null });
    console.log('\n⚠️ Cannot continue without Post ID. Please navigate to a media kit page.');
    return results;
  }

  results.postId = postId;
  addTest('Post ID Detection', true, { postId });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 2: REST API v2 - Media Kit Data
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n━━ TEST 2: REST API v2 - Media Kit Data ━━');

  const apiUrl = `/wp-json/gmkb/v2/mediakit/${postId}`;
  log('Testing: ' + window.location.origin + apiUrl);

  let mediaKitData = null;
  try {
    const response = await fetch(apiUrl);
    log('Status: ' + response.status, response.ok ? 'success' : 'error');
    
    if (response.ok) {
      mediaKitData = await response.json();
      const state = mediaKitData.state || {};
      
      results.theme = state.theme;
      
      log('✅ Media Kit Data Retrieved', 'success');
      log('  Theme: ' + (state.theme || 'not set'));
      log('  Components: ' + (Object.keys(state.components || {}).length));
      log('  Sections: ' + ((state.sections || []).length));
      log('  Has Customizations: ' + (Object.keys(state.themeCustomizations || {}).length > 0 ? 'Yes' : 'No'));
      
      addTest('REST API v2 - Media Kit Data', true, {
        theme: state.theme,
        componentCount: Object.keys(state.components || {}).length,
        sectionCount: (state.sections || []).length,
        hasCustomizations: Object.keys(state.themeCustomizations || {}).length > 0
      });
    } else {
      const error = await response.json();
      log('❌ API Error: ' + error.message, 'error');
      addTest('REST API v2 - Media Kit Data', false, { error: error.message, status: response.status });
    }
  } catch (error) {
    log('❌ Request Failed: ' + error.message, 'error');
    addTest('REST API v2 - Media Kit Data', false, { error: error.message });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 3: ALL CSS VARIABLES - COMPREHENSIVE CHECK
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n━━ TEST 3: CSS Variables - COMPREHENSIVE CHECK ━━');

  const rootStyles = getComputedStyle(document.documentElement);
  
  // Define ALL CSS variables that should be present
  const cssVariableGroups = {
    colors: [
      '--gmkb-color-primary',
      '--gmkb-color-primary-dark',
      '--gmkb-color-primary-light',
      '--gmkb-color-secondary',
      '--gmkb-color-secondary-dark',
      '--gmkb-color-secondary-light',
      '--gmkb-color-accent',
      '--gmkb-color-background',
      '--gmkb-color-surface',
      '--gmkb-color-text',
      '--gmkb-color-text-light',
      '--gmkb-color-text-muted',
      '--gmkb-color-border',
      '--gmkb-color-link',
      '--gmkb-color-link-hover',
      '--gmkb-color-success',
      '--gmkb-color-warning',
      '--gmkb-color-error',
      '--gmkb-color-info'
    ],
    typography: [
      '--gmkb-font-primary',
      '--gmkb-font-secondary',
      '--gmkb-font-heading',
      '--gmkb-font-size-base',
      '--gmkb-font-size-xs',
      '--gmkb-font-size-sm',
      '--gmkb-font-size-md',
      '--gmkb-font-size-lg',
      '--gmkb-font-size-xl',
      '--gmkb-font-size-2xl',
      '--gmkb-font-size-3xl',
      '--gmkb-font-weight-normal',
      '--gmkb-font-weight-medium',
      '--gmkb-font-weight-semibold',
      '--gmkb-font-weight-bold',
      '--gmkb-line-height-tight',
      '--gmkb-line-height-normal',
      '--gmkb-line-height-relaxed',
      '--gmkb-line-height-loose',
      '--gmkb-letter-spacing-tight',
      '--gmkb-letter-spacing-normal',
      '--gmkb-letter-spacing-wide'
    ],
    spacing: [
      '--gmkb-spacing-xs',
      '--gmkb-spacing-sm',
      '--gmkb-spacing-md',
      '--gmkb-spacing-lg',
      '--gmkb-spacing-xl',
      '--gmkb-spacing-2xl',
      '--gmkb-spacing-3xl',
      '--gmkb-spacing-component-gap',
      '--gmkb-spacing-section-gap',
      '--gmkb-spacing-section-padding',
      '--gmkb-spacing-container-padding'
    ],
    effects: [
      '--gmkb-border-radius',
      '--gmkb-border-radius-sm',
      '--gmkb-border-radius-md',
      '--gmkb-border-radius-lg',
      '--gmkb-border-radius-xl',
      '--gmkb-border-radius-full',
      '--gmkb-border-width',
      '--gmkb-shadow-sm',
      '--gmkb-shadow-md',
      '--gmkb-shadow-lg',
      '--gmkb-shadow-xl',
      '--gmkb-transition-fast',
      '--gmkb-transition-normal',
      '--gmkb-transition-slow',
      '--gmkb-opacity-disabled',
      '--gmkb-opacity-hover'
    ],
    layout: [
      '--gmkb-container-max-width',
      '--gmkb-container-width',
      '--gmkb-sidebar-width',
      '--gmkb-header-height',
      '--gmkb-footer-height',
      '--gmkb-content-width',
      '--gmkb-breakpoint-sm',
      '--gmkb-breakpoint-md',
      '--gmkb-breakpoint-lg',
      '--gmkb-breakpoint-xl'
    ]
  };

  // Check each group
  let totalVarsChecked = 0;
  let totalVarsFound = 0;

  for (const [groupName, variables] of Object.entries(cssVariableGroups)) {
    log(`\n  📦 ${groupName.toUpperCase()}`, 'section');
    
    let groupFound = 0;
    
    for (const varName of variables) {
      const value = rootStyles.getPropertyValue(varName).trim();
      totalVarsChecked++;
      
      if (value) {
        log(`    ✅ ${varName}: ${value}`, 'success');
        results.cssVariables[groupName][varName] = value;
        groupFound++;
        totalVarsFound++;
      } else {
        log(`    ❌ ${varName}: NOT FOUND`, 'error');
        results.cssVariables[groupName][varName] = null;
      }
    }
    
    const groupPercent = Math.round((groupFound / variables.length) * 100);
    log(`  ${groupName}: ${groupFound}/${variables.length} (${groupPercent}%)`, 
        groupPercent === 100 ? 'success' : groupPercent >= 50 ? 'warning' : 'error');
  }

  results.summary.cssVarsTotal = totalVarsChecked;
  results.summary.cssVarsFound = totalVarsFound;

  const overallPercent = Math.round((totalVarsFound / totalVarsChecked) * 100);
  
  log(`\n📊 OVERALL CSS VARIABLES: ${totalVarsFound}/${totalVarsChecked} (${overallPercent}%)`, 
      overallPercent === 100 ? 'success' : overallPercent >= 70 ? 'warning' : 'error');

  const cssTestPassed = totalVarsFound >= Math.ceil(totalVarsChecked * 0.7); // At least 70%
  
  addTest('CSS Variables - Comprehensive', cssTestPassed, {
    total: totalVarsChecked,
    found: totalVarsFound,
    percentage: overallPercent,
    groups: Object.keys(cssVariableGroups).reduce((acc, key) => {
      const vars = cssVariableGroups[key];
      const found = Object.values(results.cssVariables[key]).filter(v => v !== null).length;
      acc[key] = { total: vars.length, found, percentage: Math.round((found / vars.length) * 100) };
      return acc;
    }, {})
  }, cssTestPassed ? [] : ['Less than 70% of CSS variables found - theme may not be fully applied']);

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 4: Theme Style Tags in DOM
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n━━ TEST 4: Theme Style Tags in DOM ━━');

  const styleTagChecks = [
    { id: `gmkb-theme-vars-${postId}`, name: 'Theme CSS Variables', required: true },
    { id: `gmkb-theme-customizations-${postId}`, name: 'Theme Customizations', required: false },
    { id: `gmkb-theme-css-${results.theme || 'unknown'}`, name: 'Base Theme CSS', required: true },
    { id: `gmkb-component-styles`, name: 'Component Styles', required: false },
    { id: `gmkb-global-styles`, name: 'Global Styles', required: false }
  ];

  const foundTags = [];
  const missingRequired = [];

  log('Checking for style tags...');
  for (const check of styleTagChecks) {
    const tag = document.getElementById(check.id);
    if (tag) {
      log(`  ✅ ${check.name}: Found`, 'success');
      foundTags.push(check.name);
    } else {
      if (check.required) {
        log(`  ❌ ${check.name}: MISSING (REQUIRED)`, 'error');
        missingRequired.push(check.name);
      } else {
        log(`  ⚠️ ${check.name}: Not found (optional)`, 'warning');
      }
    }
  }

  const styleTagsPassed = missingRequired.length === 0;
  addTest('Theme Style Tags', styleTagsPassed, {
    foundTags,
    missingRequired,
    totalChecked: styleTagChecks.length,
    totalFound: foundTags.length
  }, styleTagsPassed ? [] : missingRequired.map(tag => `Required style tag missing: ${tag}`));

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 5: Theme Customizations in State
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n━━ TEST 5: Theme Customizations in State ━━');

  if (mediaKitData && mediaKitData.state) {
    const customizations = mediaKitData.state.themeCustomizations || {};
    
    log('Checking theme customization structure...');
    
    const customizationGroups = ['colors', 'typography', 'spacing', 'effects'];
    const foundGroups = [];
    const emptyGroups = [];
    
    for (const group of customizationGroups) {
      if (customizations[group]) {
        const count = Object.keys(customizations[group]).length;
        if (count > 0) {
          log(`  ✅ ${group}: ${count} properties`, 'success');
          foundGroups.push(group);
        } else {
          log(`  ⚠️ ${group}: Empty`, 'warning');
          emptyGroups.push(group);
        }
      } else {
        log(`  ❌ ${group}: Missing`, 'error');
        emptyGroups.push(group);
      }
    }
    
    const hasCustomizations = foundGroups.length > 0;
    
    addTest('Theme Customizations Structure', true, {
      foundGroups,
      emptyGroups,
      hasCustomizations,
      customizationDetails: foundGroups.reduce((acc, group) => {
        acc[group] = Object.keys(customizations[group]).length;
        return acc;
      }, {})
    }, hasCustomizations ? [] : ['No theme customizations found - using defaults']);
  } else {
    log('⚠️ Media kit data not available', 'warning');
    addTest('Theme Customizations Structure', false, {}, ['Could not retrieve media kit data']);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 6: Component Rendering
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n━━ TEST 6: Component Rendering ━━');

  const components = document.querySelectorAll('[data-component-id], .gmkb-component');
  log(`Found ${components.length} components in DOM`);

  if (components.length > 0) {
    const componentDetails = Array.from(components).slice(0, 10).map(comp => ({
      id: comp.dataset?.componentId || 'unknown',
      type: comp.dataset?.componentType || comp.className.match(/gmkb-component-(\w+)/)?.[1] || 'unknown',
      visible: comp.offsetParent !== null,
      hasStyles: !!comp.style.cssText
    }));

    log('Sample Components (first 10):');
    componentDetails.forEach(comp => {
      log(`  - ${comp.type} (${comp.id}): ${comp.visible ? 'Visible ✅' : 'Hidden ⚠️'}`, 
          comp.visible ? 'success' : 'warning');
    });

    addTest('Component Rendering', true, {
      totalComponents: components.length,
      sampleComponents: componentDetails
    });
  } else {
    log('⚠️ No components found - this may be normal if you\'re not on a media kit page', 'warning');
    addTest('Component Rendering', false, { totalComponents: 0 }, 
            ['No components found - ensure you are on a media kit page']);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(100));
  console.log('%c📊 COMPREHENSIVE TEST SUMMARY', 'font-size: 16px; font-weight: bold; color: #3b82f6; background: #eff6ff; padding: 8px;');
  console.log('═'.repeat(100));
  console.log('');
  
  log(`Post ID: ${results.postId}`);
  log(`Theme: ${results.theme || 'Unknown'}`);
  log(``);
  log(`Total Tests: ${results.summary.total}`);
  log(`✅ Passed: ${results.summary.passed}`, 'success');
  
  if (results.summary.failed > 0) {
    log(`❌ Failed: ${results.summary.failed}`, 'error');
  }
  if (results.summary.warnings > 0) {
    log(`⚠️ Warnings: ${results.summary.warnings}`, 'warning');
  }
  
  log(``);
  log(`CSS Variables: ${results.summary.cssVarsFound}/${results.summary.cssVarsTotal} (${Math.round((results.summary.cssVarsFound / results.summary.cssVarsTotal) * 100)}%)`);
  
  console.log('');
  
  // Determine overall status
  const passRate = (results.summary.passed / results.summary.total) * 100;
  const cssVarRate = (results.summary.cssVarsFound / results.summary.cssVarsTotal) * 100;
  
  if (results.summary.failed === 0 && cssVarRate >= 90) {
    console.log('%c✅ EXCELLENT - ALL SYSTEMS OPERATIONAL', 'font-size: 16px; font-weight: bold; color: #10b981; background: #d1fae5; padding: 8px;');
  } else if (results.summary.failed === 0 && cssVarRate >= 70) {
    console.log('%c✅ GOOD - System operational with minor warnings', 'font-size: 16px; font-weight: bold; color: #f59e0b; background: #fef3c7; padding: 8px;');
  } else if (passRate >= 70) {
    console.log('%c⚠️ NEEDS ATTENTION - Some critical issues found', 'font-size: 16px; font-weight: bold; color: #f59e0b; background: #fef3c7; padding: 8px;');
  } else {
    console.log('%c❌ CRITICAL ISSUES - System not functioning properly', 'font-size: 16px; font-weight: bold; color: #ef4444; background: #fee2e2; padding: 8px;');
  }
  
  console.log('');
  console.log('═'.repeat(100));
  console.log('');
  console.log('💾 Full results stored in: window.GMKB_ComprehensiveTest');
  console.log('📋 To export results: copy(JSON.stringify(window.GMKB_ComprehensiveTest, null, 2))');
  console.log('');
  
  window.GMKB_ComprehensiveTest = results;
  
  return results;
})();
