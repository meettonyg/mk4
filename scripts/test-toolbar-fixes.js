/**
 * Toolbar Fixes - Browser Console Test
 * 
 * Paste this into the browser console to verify both fixes are working
 */

(function() {
  console.clear();
  console.log('🧪 Testing Toolbar Fixes...\n');
  
  let passed = 0;
  let failed = 0;
  
  function test(name, fn) {
    try {
      const result = fn();
      if (result) {
        console.log(`✅ ${name}`);
        passed++;
      } else {
        console.error(`❌ ${name}`);
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${name} - Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log('📱 TESTING DEVICE PREVIEW\n');
  
  test('1. Preview area exists', () => {
    return document.getElementById('media-kit-preview') !== null;
  });
  
  test('2. Main content area exists', () => {
    return document.getElementById('gmkb-main-content') !== null;
  });
  
  test('3. DevicePreview component rendered', () => {
    return document.querySelector('.device-preview') !== null;
  });
  
  test('4. All three device buttons exist', () => {
    return document.querySelectorAll('.device-preview__btn').length === 3;
  });
  
  test('5. Desktop button active by default', () => {
    const active = document.querySelector('.device-preview__btn--active');
    return active && active.textContent.includes('Desktop');
  });
  
  console.log('\n🎨 TESTING THEME DROPDOWN\n');
  
  test('6. Theme button exists', () => {
    return document.getElementById('global-theme-btn') !== null;
  });
  
  test('7. ThemeSwitcher component exists', () => {
    return window.themeStore !== undefined;
  });
  
  console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed\n`);
  
  if (failed === 0) {
    console.log('🎉 All basic tests passed!\n');
    console.log('📋 MANUAL TESTING REQUIRED:\n');
    console.log('Device Preview:');
    console.log('  1. Click Tablet button → preview should be 768px wide');
    console.log('  2. Click Mobile button → preview should be 375px wide');
    console.log('  3. Click Desktop button → preview should be full width');
    console.log('  4. Try Ctrl+1, Ctrl+2, Ctrl+3 shortcuts\n');
    console.log('Theme Dropdown:');
    console.log('  1. Click Theme button');
    console.log('  2. Slowly move mouse from button to dropdown');
    console.log('  3. Dropdown should stay open');
    console.log('  4. Hover over "Customize Theme" button');
    console.log('  5. Button should show hover effect');
    console.log('  6. Click "Customize Theme"');
    console.log('  7. Theme customizer should open');
  } else {
    console.error('⚠️  Some tests failed. Check:');
    console.log('  1. Has Vue finished mounting?');
    console.log('  2. Are all scripts loaded?');
    console.log('  3. Check for JavaScript errors in console');
  }
  
  console.log('\n💡 TIP: Watch the console while testing for debug messages');
})();
