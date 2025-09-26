/**
 * Test the Vue Theme System
 * Run this in the browser console after the page loads
 */

(function testThemeSystem() {
  console.log('🎨 Testing Vue Theme System...\n');
  
  const tests = [];
  
  // Test 1: Check if theme store exists
  tests.push({
    name: 'Theme Store Available',
    pass: !!window.themeStore,
    details: window.themeStore ? 'Theme store accessible' : 'Theme store not found'
  });
  
  // Test 2: Check if CSS variables are applied
  const computedStyle = getComputedStyle(document.documentElement);
  const primaryColor = computedStyle.getPropertyValue('--gmkb-color-primary').trim();
  
  tests.push({
    name: 'CSS Variables Applied',
    pass: primaryColor !== '' && primaryColor !== '#3b82f6',
    details: primaryColor ? `Primary color: ${primaryColor}` : 'No CSS variables found'
  });
  
  // Test 3: Check theme provider style element
  const themeStyleEl = document.getElementById('gmkb-theme-styles');
  tests.push({
    name: 'Theme Style Element',
    pass: !!themeStyleEl,
    details: themeStyleEl ? 'Style element exists' : 'Style element not found'
  });
  
  // Test 4: Check available themes
  if (window.themeStore) {
    const themes = window.themeStore.availableThemes || [];
    tests.push({
      name: 'Available Themes',
      pass: themes.length > 0,
      details: `${themes.length} themes available: ${themes.map(t => t.id).join(', ')}`
    });
  }
  
  // Test 5: Check current theme
  if (window.themeStore) {
    const currentTheme = window.themeStore.activeThemeId;
    tests.push({
      name: 'Active Theme',
      pass: !!currentTheme,
      details: `Current theme: ${currentTheme}`
    });
  }
  
  // Test 6: Try switching themes
  if (window.themeStore && window.themeStore.selectTheme) {
    try {
      // Switch to dark theme
      window.themeStore.selectTheme('dark');
      const newPrimary = getComputedStyle(document.documentElement).getPropertyValue('--gmkb-color-primary').trim();
      
      tests.push({
        name: 'Theme Switching',
        pass: newPrimary === '#8b5cf6', // Dark theme primary color
        details: `Switched to dark, primary: ${newPrimary}`
      });
      
      // Switch back to professional
      window.themeStore.selectTheme('professional');
    } catch (error) {
      tests.push({
        name: 'Theme Switching',
        pass: false,
        details: error.message
      });
    }
  }
  
  // Print results
  console.log('📊 Theme System Test Results:');
  console.log('================================');
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    const status = test.pass ? '✅' : '❌';
    const color = test.pass ? 'color: green' : 'color: red';
    console.log(`%c${status} ${test.name}`, color);
    console.log(`   ${test.details}`);
    
    if (test.pass) passed++;
    else failed++;
  });
  
  console.log('================================');
  console.log(`Total: ${passed} passed, ${failed} failed\n`);
  
  // Provide helper commands
  if (passed > failed) {
    console.log('🎉 Theme system is working!');
    console.log('\n📝 Try these commands:');
    console.log("  window.themeStore.selectTheme('dark')");
    console.log("  window.themeStore.selectTheme('creative')");
    console.log("  window.themeStore.selectTheme('minimal')");
    console.log("  window.themeStore.openCustomizer()");
    console.log("  window.themeStore.applyColorPreset('purple')");
    console.log("  window.themeStore.updateColor('primary', '#ff6b6b')");
  } else {
    console.log('⚠️ Theme system needs attention');
    console.log('Check the console for errors');
  }
  
  return { passed, failed };
})();
