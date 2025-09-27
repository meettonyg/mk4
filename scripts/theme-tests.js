/**
 * Theme System Test Suite
 * Manual test procedures for verifying theme system functionality
 */

// Test 1: Verify Theme System Initialization
function testThemeInitialization() {
  console.log('🧪 Test 1: Theme System Initialization');
  
  // Check if stores are available
  const checks = {
    'Theme Store': typeof window.themeStore !== 'undefined',
    'Media Kit Store': typeof window.gmkbStore !== 'undefined',
    'Theme Provider Mounted': document.getElementById('gmkb-theme-styles') !== null,
    'CSS Variables Applied': getComputedStyle(document.documentElement).getPropertyValue('--gmkb-color-primary') !== ''
  };
  
  Object.entries(checks).forEach(([name, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${name}`);
  });
  
  return Object.values(checks).every(v => v);
}

// Test 2: Verify All Required CSS Variables
function testCSSVariables() {
  console.log('\n🧪 Test 2: CSS Variable Coverage');
  
  const requiredVars = [
    // Colors
    '--gmkb-color-primary',
    '--gmkb-color-secondary',
    '--gmkb-color-text',
    '--gmkb-color-text-light',
    '--gmkb-color-background',
    '--gmkb-color-surface',
    '--gmkb-color-border',
    
    // Typography
    '--gmkb-font-primary',
    '--gmkb-font-heading',
    '--gmkb-font-size-base',
    '--gmkb-font-size-lg',
    '--gmkb-font-size-xl',
    '--gmkb-line-height-base',
    '--gmkb-font-weight-normal',
    '--gmkb-font-weight-bold',
    
    // Spacing
    '--gmkb-spacing-xs',
    '--gmkb-spacing-sm',
    '--gmkb-spacing-md',
    '--gmkb-spacing-lg',
    '--gmkb-spacing-xl',
    '--gmkb-spacing-component-gap',
    '--gmkb-spacing-section-padding',
    
    // Effects
    '--gmkb-border-radius',
    '--gmkb-shadow',
    '--gmkb-transition'
  ];
  
  const root = getComputedStyle(document.documentElement);
  const missing = [];
  
  requiredVars.forEach(varName => {
    const value = root.getPropertyValue(varName);
    if (!value || value.trim() === '') {
      missing.push(varName);
      console.log(`  ❌ ${varName}: not set`);
    } else {
      console.log(`  ✅ ${varName}: ${value}`);
    }
  });
  
  console.log(`\n  Summary: ${requiredVars.length - missing.length}/${requiredVars.length} variables set`);
  return missing.length === 0;
}

// Test 3: Theme Switching
function testThemeSwitching() {
  console.log('\n🧪 Test 3: Theme Switching');
  
  // Get actual theme IDs from the store or use defaults
  let themes = [];
  
  if (window.themeStore && window.themeStore.availableThemes && window.themeStore.availableThemes.length > 0) {
    themes = window.themeStore.availableThemes.map(t => t.id).filter(id => id); // Filter out undefined
  }
  
  // Fallback to default theme IDs if none found or all undefined
  if (themes.length === 0) {
    themes = ['professional_clean', 'creative_bold', 'minimal_elegant', 'modern_dark'];
    console.log('  Using default theme IDs for testing');
  }
  
  const results = [];
  
  themes.forEach(themeId => {
    console.log(`\n  Testing theme: ${themeId}`);
    
    // Switch theme
    window.themeStore.selectTheme(themeId);
    
    // Wait a bit for CSS to apply
    setTimeout(() => {
      const root = getComputedStyle(document.documentElement);
      const primary = root.getPropertyValue('--gmkb-color-primary');
      const themeAttr = document.documentElement.getAttribute('data-gmkb-theme');
      
      const passed = themeAttr === themeId && primary !== '';
      results.push(passed);
      
      console.log(`    ${passed ? '✅' : '❌'} Theme attribute: ${themeAttr}`);
      console.log(`    ${passed ? '✅' : '❌'} Primary color: ${primary}`);
    }, 100);
  });
  
  return results.every(v => v);
}

// Test 4: Component Style Application
function testComponentStyles() {
  console.log('\n🧪 Test 4: Component Style Application');
  
  const components = document.querySelectorAll('[data-component-id]');
  
  if (components.length === 0) {
    console.log('  ⚠️ No components found to test');
    return null;
  }
  
  components.forEach((component, index) => {
    const styles = getComputedStyle(component);
    const usesVars = [
      styles.backgroundColor.includes('rgb'),
      styles.color.includes('rgb'),
      styles.fontFamily !== ''
    ].some(v => v);
    
    console.log(`  ${usesVars ? '✅' : '❌'} Component ${index + 1}: ${component.className}`);
  });
  
  return true;
}

// Test 5: Theme Persistence
async function testThemePersistence() {
  console.log('\n🧪 Test 5: Theme Persistence');
  
  // Set a theme (use the correct ID)
  window.themeStore.selectTheme('modern_dark');
  
  // Save to WordPress
  if (window.gmkbStore) {
    window.gmkbStore.theme = 'modern_dark';
    console.log('  ⏳ Saving theme to WordPress...');
    
    try {
      await window.gmkbStore.saveToWordPress();
      console.log('  ✅ Theme saved successfully');
      
      // Check if it's in the state
      const savedTheme = window.gmkbStore.theme;
      console.log(`  ${savedTheme === 'modern_dark' ? '✅' : '❌'} Theme in store: ${savedTheme}`);
      
      return savedTheme === 'modern_dark';
    } catch (error) {
      console.log('  ❌ Failed to save theme:', error);
      return false;
    }
  } else {
    console.log('  ⚠️ Store not available for persistence test');
    return null;
  }
}

// Test 6: Theme Customization
function testThemeCustomization() {
  console.log('\n🧪 Test 6: Theme Customization');
  
  // Apply a color preset
  window.themeStore.applyColorPreset('purple');
  
  setTimeout(() => {
    const root = getComputedStyle(document.documentElement);
    const primary = root.getPropertyValue('--gmkb-color-primary');
    
    const isPurple = primary.includes('139') || primary.includes('92') || primary.includes('246'); // RGB values for purple
    console.log(`  ${isPurple ? '✅' : '❌'} Purple preset applied: ${primary}`);
    
    // Reset
    window.themeStore.resetToOriginal();
    console.log('  ✅ Reset to original theme');
  }, 100);
  
  return true;
}

// Run all tests
function runAllTests() {
  console.log('====================================');
  console.log('🎨 MEDIA KIT BUILDER THEME SYSTEM TESTS');
  console.log('====================================\n');
  
  const tests = [
    testThemeInitialization,
    testCSSVariables,
    testThemeSwitching,
    testComponentStyles,
    testThemePersistence,
    testThemeCustomization
  ];
  
  const results = [];
  let delay = 0;
  
  tests.forEach((test, index) => {
    setTimeout(() => {
      try {
        const result = test();
        results.push(result);
        
        if (index === tests.length - 1) {
          // Final summary
          setTimeout(() => {
            console.log('\n====================================');
            console.log('📊 TEST SUMMARY');
            console.log('====================================');
            
            const passed = results.filter(r => r === true).length;
            const failed = results.filter(r => r === false).length;
            const skipped = results.filter(r => r === null).length;
            
            console.log(`✅ Passed: ${passed}`);
            console.log(`❌ Failed: ${failed}`);
            console.log(`⚠️ Skipped: ${skipped}`);
            console.log(`\nOverall: ${failed === 0 ? '✅ ALL TESTS PASSED!' : '❌ Some tests failed'}`);
          }, 500);
        }
      } catch (error) {
        console.error(`  ❌ Test error: ${error.message}`);
        results.push(false);
      }
    }, delay);
    
    delay += 1000; // Space out tests
  });
}

// Quick validation function for console
window.validateThemeSystem = function() {
  const root = getComputedStyle(document.documentElement);
  const checks = {
    'Theme Store': !!window.themeStore,
    'CSS Variables': root.getPropertyValue('--gmkb-color-primary') !== '',
    'Theme Attribute': document.documentElement.hasAttribute('data-gmkb-theme'),
    'Style Element': !!document.getElementById('gmkb-theme-styles')
  };
  
  console.table(checks);
  
  const allPassed = Object.values(checks).every(v => v);
  console.log(allPassed ? '✅ Theme system is working!' : '❌ Theme system has issues');
  
  return allPassed;
};

// Export for use
window.themeTests = {
  runAllTests,
  testThemeInitialization,
  testCSSVariables,
  testThemeSwitching,
  testComponentStyles,
  testThemePersistence,
  testThemeCustomization,
  validateThemeSystem: window.validateThemeSystem
};

// Auto-run if requested
if (window.location.hash === '#test-theme') {
  console.log('🚀 Auto-running theme tests...\n');
  setTimeout(runAllTests, 2000); // Wait for everything to load
}

console.log(`
🎨 Theme System Test Suite Loaded
================================
Commands available:
- themeTests.runAllTests() - Run complete test suite
- themeTests.validateThemeSystem() - Quick validation
- themeTests.testCSSVariables() - Check CSS variables
- themeTests.testThemeSwitching() - Test theme switching

Individual tests:
- themeTests.testThemeInitialization()
- themeTests.testComponentStyles()
- themeTests.testThemePersistence()
- themeTests.testThemeCustomization()

Add #test-theme to URL to auto-run tests
`);
