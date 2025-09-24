// Media Kit Builder - Vue Component Data Bridge Test
// Run this in the browser console after rebuilding the bundle

console.log('=== PHASE 1 DIAGNOSTIC TEST ===');
console.log('Testing Vue component data bridge fix...\n');

// Test 1: Check if state has component data
console.log('TEST 1: Checking state manager for component data...');
const state = window.GMKB?.stateManager?.getState();
if (state && state.components) {
  const componentCount = Object.keys(state.components).length;
  console.log(`✅ Found ${componentCount} components in state`);
  
  // Show first 3 components' data
  Object.values(state.components).slice(0, 3).forEach(comp => {
    console.log(`  - ${comp.type} (${comp.id}):`, comp.data || comp.props || {});
  });
} else {
  console.log('❌ No components found in state');
}

// Test 2: Check if Vue discovery is working
console.log('\nTEST 2: Checking Vue component discovery...');
if (window.GMKBVueDiscovery) {
  const discovered = window.GMKBVueDiscovery.discoveredComponents();
  if (discovered.length > 0) {
    console.log(`✅ Discovered ${discovered.length} Vue components:`, discovered);
  } else {
    console.log('⚠️ No Vue components discovered yet');
  }
} else {
  console.log('❌ Vue discovery system not initialized');
}

// Test 3: Check rendered components in DOM
console.log('\nTEST 3: Checking rendered Vue components in DOM...');
const vueWrappers = document.querySelectorAll('[class$="-vue-wrapper"]');
if (vueWrappers.length > 0) {
  console.log(`✅ Found ${vueWrappers.length} Vue component wrappers in DOM`);
  vueWrappers.forEach(wrapper => {
    const componentId = wrapper.getAttribute('data-component-id');
    const hasContent = wrapper.textContent.trim().length > 0;
    const status = hasContent ? '✅ Has content' : '❌ Empty';
    console.log(`  - ${componentId}: ${status}`);
  });
} else {
  console.log('❌ No Vue component wrappers found in DOM');
}

// Test 4: Check specific component content
console.log('\nTEST 4: Checking specific component content...');
const heroComponents = document.querySelectorAll('.hero-component');
heroComponents.forEach(hero => {
  const title = hero.querySelector('.hero__title');
  const subtitle = hero.querySelector('.hero__subtitle');
  const componentId = hero.getAttribute('data-component-id');
  
  if (title && title.textContent) {
    console.log(`✅ Hero ${componentId} has title: "${title.textContent}"`);
  } else {
    console.log(`❌ Hero ${componentId} missing title`);
  }
});

const bioComponents = document.querySelectorAll('.biography-component');
bioComponents.forEach(bio => {
  const text = bio.querySelector('.biography__text');
  const componentId = bio.getAttribute('data-component-id');
  
  if (text && text.textContent) {
    const preview = text.textContent.substring(0, 50) + '...';
    console.log(`✅ Biography ${componentId} has text: "${preview}"`);
  } else {
    console.log(`❌ Biography ${componentId} missing text`);
  }
});

// Test 5: Try to force re-render
console.log('\nTEST 5: Force re-render test...');
if (window.GMKB?.renderer) {
  console.log('Triggering re-render...');
  window.GMKB.renderer.render();
  console.log('✅ Re-render triggered - check if components now have content');
} else {
  console.log('❌ Renderer not available');
}

// Summary
console.log('\n=== DIAGNOSTIC SUMMARY ===');
console.log('If components are still empty after rebuild:');
console.log('1. Clear browser cache (Ctrl+Shift+R)');
console.log('2. Check dist/gmkb.iife.js was updated');
console.log('3. Look for errors in console above');
console.log('4. Verify component data exists in state (Test 1)');

// Helper function to manually test adding a component
window.testAddComponent = function(type = 'hero') {
  console.log(`\nAdding test ${type} component...`);
  const componentId = window.GMKB.addComponent(type, {
    title: 'Test Component Title',
    subtitle: 'This is a test subtitle',
    biography: 'Test biography content'
  });
  console.log(`✅ Added component: ${componentId}`);
  console.log('Check if it renders with data');
};

console.log('\n💡 TIP: Run testAddComponent("hero") to add a test component');
