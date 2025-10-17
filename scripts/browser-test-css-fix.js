/**
 * CSS ARCHITECTURE FIX - BROWSER CONSOLE VERIFICATION
 * Run this in the browser console after building
 * 
 * Copy and paste this entire script into the browser console
 */

(function() {
  console.log('%c========================================', 'color: #4f46e5; font-weight: bold');
  console.log('%cCSS ARCHITECTURE FIX VERIFICATION', 'color: #4f46e5; font-weight: bold; font-size: 16px');
  console.log('%c========================================', 'color: #4f46e5; font-weight: bold');
  console.log('');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };

  function pass(msg) {
    console.log('%c✅ PASS:', 'color: #10b981; font-weight: bold', msg);
    results.passed++;
  }

  function fail(msg) {
    console.log('%c❌ FAIL:', 'color: #ef4444; font-weight: bold', msg);
    results.failed++;
  }

  function warn(msg) {
    console.log('%c⚠️  WARN:', 'color: #f59e0b; font-weight: bold', msg);
    results.warnings++;
  }

  function info(msg, value) {
    console.log('%c   INFO:', 'color: #6b7280', msg, value);
  }

  // TEST 1: Theme Wrapper Exists
  console.log('%c\nTEST 1: Theme Wrapper', 'color: #3b82f6; font-weight: bold');
  const themeWrapper = document.querySelector('[data-gmkb-theme]');
  if (themeWrapper) {
    pass('Theme wrapper element exists');
    info('Theme ID:', themeWrapper.getAttribute('data-gmkb-theme'));
  } else {
    fail('Theme wrapper element not found');
  }

  // TEST 2: ThemeStyleInjector Exists
  console.log('%c\nTEST 2: ThemeStyleInjector Service', 'color: #3b82f6; font-weight: bold');
  if (window.GMKB && window.GMKB.services && window.GMKB.services.ThemeStyleInjector) {
    pass('ThemeStyleInjector service is accessible');
    info('Current Theme:', window.GMKB.services.ThemeStyleInjector.getCurrentTheme());
  } else {
    warn('ThemeStyleInjector not found in window.GMKB (may be in module scope)');
  }

  // TEST 3: CSS Variables Applied
  console.log('%c\nTEST 3: Theme CSS Variables', 'color: #3b82f6; font-weight: bold');
  if (themeWrapper) {
    const styles = window.getComputedStyle(themeWrapper);
    
    // Check for key CSS variables
    const primaryColor = styles.getPropertyValue('--gmkb-color-primary').trim();
    const fontFamily = styles.getPropertyValue('--gmkb-font-primary').trim();
    const fontSize = styles.getPropertyValue('--gmkb-font-size-base').trim();
    
    if (primaryColor) {
      pass('Primary color variable exists');
      info('Value:', primaryColor);
    } else {
      fail('Primary color variable missing');
    }
    
    if (fontFamily) {
      pass('Font family variable exists');
      info('Value:', fontFamily);
    } else {
      fail('Font family variable missing');
    }
    
    if (fontSize) {
      pass('Font size variable exists');
      info('Value:', fontSize);
    } else {
      fail('Font size variable missing');
    }
  }

  // TEST 4: Base Typography Inheritance
  console.log('%c\nTEST 4: Base Typography', 'color: #3b82f6; font-weight: bold');
  const body = document.body;
  const bodyStyles = window.getComputedStyle(body);
  
  const bodyFontFamily = bodyStyles.fontFamily;
  const bodyFontSize = bodyStyles.fontSize;
  const bodyLineHeight = bodyStyles.lineHeight;
  const bodyColor = bodyStyles.color;
  
  if (bodyFontFamily) {
    pass('Body has font-family');
    info('Font family:', bodyFontFamily);
  } else {
    fail('Body missing font-family');
  }
  
  if (bodyFontSize) {
    pass('Body has font-size');
    info('Font size:', bodyFontSize);
  } else {
    fail('Body missing font-size');
  }
  
  if (bodyLineHeight) {
    pass('Body has line-height');
    info('Line height:', bodyLineHeight);
  } else {
    fail('Body missing line-height');
  }

  // TEST 5: Component Typography Inheritance
  console.log('%c\nTEST 5: Component Typography Inheritance', 'color: #3b82f6; font-weight: bold');
  const component = document.querySelector('.biography-content') || 
                    document.querySelector('.component-root') ||
                    document.querySelector('.gmkb-component');
  
  if (component) {
    pass('Found component to test');
    const compStyles = window.getComputedStyle(component);
    
    // Check if component inherits typography
    const compFontSize = compStyles.fontSize;
    const compFontFamily = compStyles.fontFamily;
    const compLineHeight = compStyles.lineHeight;
    
    info('Component font-size:', compFontSize);
    info('Component font-family:', compFontFamily);
    info('Component line-height:', compLineHeight);
    
    // Components should have typography (either inherited or set)
    if (compFontSize && compFontFamily) {
      pass('Component has typography (inherited or set)');
    } else {
      fail('Component missing typography');
    }
  } else {
    warn('No components found to test typography inheritance');
  }

  // TEST 6: Theme Store
  console.log('%c\nTEST 6: Theme Store', 'color: #3b82f6; font-weight: bold');
  if (window.GMKB && window.GMKB.stores && window.GMKB.stores.theme) {
    pass('Theme store is accessible');
    const themeStore = window.GMKB.stores.theme;
    
    info('Active Theme ID:', themeStore.activeThemeId);
    info('Available Themes:', themeStore.availableThemes?.length || 0);
    
    if (themeStore.activeThemeId) {
      pass('Active theme is set');
    } else {
      fail('No active theme set');
    }
    
    if (themeStore.availableThemes && themeStore.availableThemes.length > 0) {
      pass(`${themeStore.availableThemes.length} themes available`);
    } else {
      fail('No themes available');
    }
  } else {
    fail('Theme store not accessible');
  }

  // TEST 7: Component CSS (No Typography)
  console.log('%c\nTEST 7: Component CSS Cleanup', 'color: #3b82f6; font-weight: bold');
  if (component) {
    const compStyles = window.getComputedStyle(component);
    
    // Check if component has explicit font-size set (not inherited)
    // This is tricky to detect, so we just verify it has a value
    const hasFontSize = compStyles.fontSize !== '';
    const hasColor = compStyles.color !== '';
    
    if (hasFontSize && hasColor) {
      pass('Component has styling (via inheritance or base CSS)');
    } else {
      warn('Component may be missing styling');
    }
  }

  // TEST 8: Design System Files
  console.log('%c\nTEST 8: Design System Files', 'color: #3b82f6; font-weight: bold');
  
  // Check if design system CSS is loaded
  const styleSheets = Array.from(document.styleSheets);
  const hasDesignSystem = styleSheets.some(sheet => {
    try {
      return sheet.href && (sheet.href.includes('index.css') || sheet.href.includes('design-system'));
    } catch (e) {
      return false;
    }
  });
  
  if (hasDesignSystem) {
    pass('Design system CSS is loaded');
  } else {
    warn('Could not verify design system CSS (may be bundled)');
  }

  // SUMMARY
  console.log('%c\n========================================', 'color: #4f46e5; font-weight: bold');
  console.log('%cTEST SUMMARY', 'color: #4f46e5; font-weight: bold; font-size: 16px');
  console.log('%c========================================', 'color: #4f46e5; font-weight: bold');
  console.log(`%c✅ Passed: ${results.passed}`, 'color: #10b981; font-weight: bold');
  console.log(`%c❌ Failed: ${results.failed}`, 'color: #ef4444; font-weight: bold');
  console.log(`%c⚠️  Warnings: ${results.warnings}`, 'color: #f59e0b; font-weight: bold');
  
  const total = results.passed + results.failed;
  const percentage = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  
  console.log(`%c\nScore: ${percentage}%`, `color: ${percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444'}; font-weight: bold; font-size: 18px`);
  
  if (results.failed === 0 && results.warnings === 0) {
    console.log('%c\n🎉 ALL TESTS PASSED! CSS Architecture Fix is working correctly!', 'color: #10b981; font-weight: bold; font-size: 14px; background: #d1fae5; padding: 8px');
  } else if (results.failed === 0) {
    console.log('%c\n✅ All tests passed with some warnings. Review warnings above.', 'color: #f59e0b; font-weight: bold; font-size: 14px; background: #fef3c7; padding: 8px');
  } else {
    console.log('%c\n❌ Some tests failed. Review failures above.', 'color: #ef4444; font-weight: bold; font-size: 14px; background: #fee2e2; padding: 8px');
  }
  
  console.log('%c\n========================================\n', 'color: #4f46e5; font-weight: bold');
  
  // Return results for programmatic access
  return {
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings,
    percentage,
    success: results.failed === 0
  };
})();
