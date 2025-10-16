/**
 * Component Architecture Test Suite - Browser Console
 * 
 * Run this in your browser console while in the Media Kit builder
 * 
 * Usage:
 * 1. Open Media Kit builder
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Run: testComponentArchitecture()
 */

(function() {
  window.testComponentArchitecture = function() {
    console.log('%c🧪 COMPONENT ARCHITECTURE TEST SUITE', 'color: #4CAF50; font-size: 20px; font-weight: bold;');
    console.log('%c' + '='.repeat(80), 'color: #4CAF50;');
    
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
    
    // Expected components
    const expectedComponents = [
      'biography',
      'hero',
      'topics',
      'social',
      'contact',
      'stats',
      'call-to-action',
      'testimonials',
      'photo-gallery',
      'video-intro',
      'logo-grid',
      'questions'
    ];
    
    console.log('\n%c📋 TEST 1: Component Elements Exist', 'color: #2196F3; font-size: 16px; font-weight: bold;');
    console.log('Checking for gmkb-component classes...\n');
    
    expectedComponents.forEach(componentType => {
      results.total++;
      const selector = `.gmkb-component--${componentType}`;
      const elements = document.querySelectorAll(selector);
      
      if (elements.length > 0) {
        results.passed++;
        console.log(`✅ ${componentType}: Found ${elements.length} instance(s)`);
        results.tests.push({
          name: `${componentType} exists`,
          status: 'passed',
          details: `Found ${elements.length} elements`
        });
      } else {
        results.warnings++;
        console.log(`⚠️  ${componentType}: Not found (may not be added to page yet)`);
        results.tests.push({
          name: `${componentType} exists`,
          status: 'warning',
          details: 'Component not on page'
        });
      }
    });
    
    console.log('\n%c📋 TEST 2: Root Class Compliance', 'color: #2196F3; font-size: 16px; font-weight: bold;');
    console.log('Verifying all components have gmkb-component base class...\n');
    
    const allComponents = document.querySelectorAll('[class*="gmkb-component--"]');
    let classCompliancePass = 0;
    let classComplianceFail = 0;
    
    allComponents.forEach(component => {
      results.total++;
      const hasBaseClass = component.classList.contains('gmkb-component');
      const componentClass = Array.from(component.classList).find(c => c.startsWith('gmkb-component--'));
      
      if (hasBaseClass) {
        classCompliancePass++;
        results.passed++;
        console.log(`✅ ${componentClass}: Has base class`);
        results.tests.push({
          name: `${componentClass} base class`,
          status: 'passed'
        });
      } else {
        classComplianceFail++;
        results.failed++;
        console.log(`❌ ${componentClass}: Missing gmkb-component base class!`);
        results.tests.push({
          name: `${componentClass} base class`,
          status: 'failed',
          details: 'Missing gmkb-component class'
        });
      }
    });
    
    console.log('\n%c📋 TEST 3: No Legacy Classes', 'color: #2196F3; font-size: 16px; font-weight: bold;');
    console.log('Checking for old component class patterns...\n');
    
    const legacyPatterns = [
      'biography-component',
      'gmkb-hero-component',
      'gmkb-topics-component',
      'gmkb-social-component',
      'gmkb-contact-component',
      'gmkb-stats-component',
      'gmkb-cta-component',
      'gmkb-testimonials-component'
    ];
    
    let legacyFound = false;
    legacyPatterns.forEach(pattern => {
      results.total++;
      const legacy = document.querySelectorAll(`.${pattern}`);
      
      if (legacy.length > 0) {
        legacyFound = true;
        results.failed++;
        console.log(`❌ Found legacy class: .${pattern} (${legacy.length} instances)`);
        results.tests.push({
          name: `No legacy ${pattern}`,
          status: 'failed',
          details: `Found ${legacy.length} instances`
        });
      } else {
        results.passed++;
        console.log(`✅ No legacy .${pattern} classes found`);
        results.tests.push({
          name: `No legacy ${pattern}`,
          status: 'passed'
        });
      }
    });
    
    console.log('\n%c📋 TEST 4: Component Data Attributes', 'color: #2196F3; font-size: 16px; font-weight: bold;');
    console.log('Verifying data-component-id attributes...\n');
    
    allComponents.forEach(component => {
      results.total++;
      const componentId = component.getAttribute('data-component-id');
      const componentClass = Array.from(component.classList).find(c => c.startsWith('gmkb-component--'));
      
      if (componentId) {
        results.passed++;
        console.log(`✅ ${componentClass}: Has data-component-id="${componentId}"`);
        results.tests.push({
          name: `${componentClass} data-component-id`,
          status: 'passed',
          details: componentId
        });
      } else {
        results.failed++;
        console.log(`❌ ${componentClass}: Missing data-component-id attribute`);
        results.tests.push({
          name: `${componentClass} data-component-id`,
          status: 'failed'
        });
      }
    });
    
    console.log('\n%c📋 TEST 5: Vue Component Check', 'color: #2196F3; font-size: 16px; font-weight: bold;');
    console.log('Checking for Vue component instances...\n');
    
    if (window.Vue || window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      results.passed++;
      console.log('✅ Vue detected on page');
      results.tests.push({
        name: 'Vue detected',
        status: 'passed'
      });
    } else {
      results.warnings++;
      console.log('⚠️  Vue not detected (may not be loaded yet)');
      results.tests.push({
        name: 'Vue detected',
        status: 'warning'
      });
    }
    
    console.log('\n%c📋 TEST 6: Design System CSS Check', 'color: #2196F3; font-size: 16px; font-weight: bold;');
    console.log('Verifying design system styles are loaded...\n');
    
    results.total++;
    const testElement = document.createElement('div');
    testElement.className = 'gmkb-component gmkb-component--biography';
    testElement.style.visibility = 'hidden';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    const hasMarginBottom = computedStyle.marginBottom !== '0px';
    
    document.body.removeChild(testElement);
    
    if (hasMarginBottom) {
      results.passed++;
      console.log('✅ Design system CSS is loaded and active');
      results.tests.push({
        name: 'Design system CSS loaded',
        status: 'passed'
      });
    } else {
      results.failed++;
      console.log('❌ Design system CSS may not be loaded');
      results.tests.push({
        name: 'Design system CSS loaded',
        status: 'failed'
      });
    }
    
    // Generate summary
    console.log('\n' + '='.repeat(80));
    console.log('%c📊 TEST SUMMARY', 'color: #FF9800; font-size: 18px; font-weight: bold;');
    console.log('='.repeat(80));
    
    const passRate = ((results.passed / results.total) * 100).toFixed(1);
    
    console.log(`
Total Tests:    ${results.total}
✅ Passed:      ${results.passed}
❌ Failed:      ${results.failed}
⚠️  Warnings:   ${results.warnings}
Pass Rate:      ${passRate}%
    `);
    
    if (results.failed === 0) {
      console.log('%c🎉 ALL TESTS PASSED!', 'color: #4CAF50; font-size: 20px; font-weight: bold;');
      console.log('%cComponent architecture is correctly implemented!', 'color: #4CAF50; font-size: 14px;');
    } else {
      console.log('%c⚠️  SOME TESTS FAILED', 'color: #F44336; font-size: 20px; font-weight: bold;');
      console.log('%cPlease review the failed tests above', 'color: #F44336; font-size: 14px;');
    }
    
    console.log('\n' + '='.repeat(80));
    
    // Return results object for programmatic access
    return results;
  };
  
  // Quick test function for individual components
  window.testComponent = function(componentType) {
    console.log(`%c🔍 Testing ${componentType} component...`, 'color: #2196F3; font-weight: bold;');
    
    const selector = `.gmkb-component--${componentType}`;
    const elements = document.querySelectorAll(selector);
    
    if (elements.length === 0) {
      console.log(`❌ No ${componentType} components found on page`);
      return null;
    }
    
    console.log(`Found ${elements.length} ${componentType} component(s)`);
    
    elements.forEach((element, index) => {
      console.log(`\n--- Component ${index + 1} ---`);
      console.log('Classes:', Array.from(element.classList));
      console.log('Component ID:', element.getAttribute('data-component-id'));
      console.log('Has base class:', element.classList.contains('gmkb-component'));
      console.log('Element:', element);
    });
    
    return elements;
  };
  
  // Export test function
  console.log('%c✅ Component Architecture Tests Loaded!', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
  console.log('%cRun: testComponentArchitecture()', 'color: #2196F3; font-size: 14px;');
  console.log('%cOr: testComponent("biography")', 'color: #2196F3; font-size: 14px;');
})();
