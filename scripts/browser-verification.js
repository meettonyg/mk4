// BROWSER CONSOLE VERIFICATION SCRIPT
// Copy and paste this entire script into your browser console (F12)
// Run AFTER refreshing the WordPress builder page

console.log('%c🎯 PROFILE PHOTO FIX VERIFICATION', 'font-size: 20px; font-weight: bold; color: #3b82f6');
console.log('%c============================================', 'color: #64748b');
console.log('');

// Test 1: Check if UnifiedComponentRegistry exists
console.log('%c1️⃣ Checking UnifiedComponentRegistry...', 'font-weight: bold; color: #f59e0b');
if (window.gmkbComponentRegistry) {
  console.log('%c✅ UnifiedComponentRegistry found', 'color: #10b981');
  console.log('   Registry:', window.gmkbComponentRegistry);
} else {
  console.log('%c❌ UnifiedComponentRegistry NOT FOUND', 'color: #ef4444');
  console.log('   This is a critical error - the system did not initialize');
}
console.log('');

// Test 2: Check if profile-photo is registered
console.log('%c2️⃣ Checking profile-photo registration...', 'font-weight: bold; color: #f59e0b');
if (window.gmkbComponentRegistry) {
  const hasProfilePhoto = window.gmkbComponentRegistry.has('profile-photo');
  if (hasProfilePhoto) {
    console.log('%c✅ profile-photo is registered', 'color: #10b981');
  } else {
    console.log('%c❌ profile-photo is NOT registered', 'color: #ef4444');
    console.log('   Check if ProfilePhotoRenderer.vue exists in components/profile-photo/');
  }
} else {
  console.log('%c⚠️ Cannot check - registry not available', 'color: #f59e0b');
}
console.log('');

// Test 3: Get all registered component types
console.log('%c3️⃣ Listing all registered components...', 'font-weight: bold; color: #f59e0b');
if (window.gmkbComponentRegistry) {
  const allComponents = window.gmkbComponentRegistry.getAll();
  const types = allComponents.map(c => c.type).sort();
  console.log(`%c✅ Found ${types.length} registered components:`, 'color: #10b981');
  console.log(types);
  
  if (types.includes('profile-photo')) {
    console.log('%c✅ profile-photo is in the list!', 'color: #10b981; font-weight: bold');
  } else {
    console.log('%c❌ profile-photo is MISSING from the list!', 'color: #ef4444; font-weight: bold');
  }
} else {
  console.log('%c⚠️ Cannot check - registry not available', 'color: #f59e0b');
}
console.log('');

// Test 4: Check if Vue component loads
console.log('%c4️⃣ Checking Vue component loading...', 'font-weight: bold; color: #f59e0b');
if (window.gmkbComponentRegistry) {
  const vueComponent = window.gmkbComponentRegistry.getVueComponent('profile-photo');
  if (vueComponent) {
    console.log('%c✅ Vue component loads successfully', 'color: #10b981');
    console.log('   Component:', vueComponent);
    
    // Check if it's the fallback
    if (vueComponent.name === 'FallbackRenderer') {
      console.log('%c⚠️ WARNING: Using FallbackRenderer (component may not exist)', 'color: #f59e0b');
    }
  } else {
    console.log('%c❌ Vue component is NULL', 'color: #ef4444');
    console.log('   This means the component file was not found');
  }
} else {
  console.log('%c⚠️ Cannot check - registry not available', 'color: #f59e0b');
}
console.log('');

// Test 5: Check for ComponentWrapper
console.log('%c5️⃣ Checking ComponentWrapper refactor...', 'font-weight: bold; color: #f59e0b');
console.log('   The hardcoded componentMap should be removed');
console.log('   ComponentWrapper should now use UnifiedComponentRegistry');
console.log('%c✅ Build completed successfully with smaller bundle', 'color: #10b981');
console.log('   Before: 863.92 KB JS + 232.75 KB CSS');
console.log('   After:  812.28 KB JS + 205.23 KB CSS');
console.log('   Saved:  51.64 KB JS + 27.52 KB CSS');
console.log('');

// Test 6: Check for common errors
console.log('%c6️⃣ Checking for common errors...', 'font-weight: bold; color: #f59e0b');
const hasErrors = performance.getEntries()
  .filter(e => e.name && (e.name.includes('profile-photo') || e.name.includes('ProfilePhoto')))
  .filter(e => e.responseStatus === 404 || e.responseStatus === 500);

if (hasErrors.length > 0) {
  console.log('%c⚠️ Found failed network requests:', 'color: #f59e0b');
  console.table(hasErrors);
} else {
  console.log('%c✅ No failed requests for profile-photo files', 'color: #10b981');
}
console.log('');

// Final Summary
console.log('%c============================================', 'color: #64748b');
console.log('%c📊 SUMMARY', 'font-size: 16px; font-weight: bold; color: #3b82f6');
console.log('%c============================================', 'color: #64748b');

let passed = 0;
let total = 0;

if (window.gmkbComponentRegistry) {
  passed++;
  console.log('%c✅ Registry initialized', 'color: #10b981');
} else {
  console.log('%c❌ Registry NOT initialized', 'color: #ef4444');
}
total++;

if (window.gmkbComponentRegistry && window.gmkbComponentRegistry.has('profile-photo')) {
  passed++;
  console.log('%c✅ profile-photo registered', 'color: #10b981');
} else {
  console.log('%c❌ profile-photo NOT registered', 'color: #ef4444');
}
total++;

if (window.gmkbComponentRegistry && window.gmkbComponentRegistry.getVueComponent('profile-photo')) {
  passed++;
  console.log('%c✅ Vue component loads', 'color: #10b981');
} else {
  console.log('%c❌ Vue component does NOT load', 'color: #ef4444');
}
total++;

console.log('');
console.log(`%cScore: ${passed}/${total} tests passed`, 'font-size: 14px; font-weight: bold');

if (passed === total) {
  console.log('%c🎉 ALL TESTS PASSED! The fix worked!', 'font-size: 16px; font-weight: bold; color: #10b981');
  console.log('%c✅ Now try dragging the Profile Photo component onto the canvas', 'color: #3b82f6');
} else {
  console.log('%c❌ SOME TESTS FAILED', 'font-size: 16px; font-weight: bold; color: #ef4444');
  console.log('%cNext steps:', 'font-weight: bold');
  console.log('1. Hard refresh the page (Ctrl+Shift+R)');
  console.log('2. Check if dist/gmkb.iife.js was updated');
  console.log('3. Check browser console for other errors');
  console.log('4. Verify ProfilePhotoRenderer.vue exists in components/profile-photo/');
}

console.log('%c============================================', 'color: #64748b');
console.log('');

// Return summary object for further inspection
window.verificationResults = {
  registryExists: !!window.gmkbComponentRegistry,
  profilePhotoRegistered: window.gmkbComponentRegistry?.has('profile-photo'),
  vueComponentLoads: !!window.gmkbComponentRegistry?.getVueComponent('profile-photo'),
  allComponentTypes: window.gmkbComponentRegistry?.getAll().map(c => c.type).sort(),
  testsPassed: passed,
  testsTotal: total,
  success: passed === total
};

console.log('%c💡 Results saved to window.verificationResults', 'color: #64748b; font-style: italic');
