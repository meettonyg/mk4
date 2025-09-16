// PHASE 3: Complete System Integration Test
// This comprehensive test verifies the entire Media Kit Builder system

console.log('=== PHASE 3: COMPLETE SYSTEM INTEGRATION TEST ===\n');
console.log('Testing all components, data flow, themes, and save/load...\n');

// Test results collector
const testResults = {
  components: {},
  dataFlow: {},
  themes: {},
  saveLoad: {},
  rendering: {}
};

// 1. COMPONENT DISCOVERY TEST
console.log('📦 TEST 1: Component Discovery');
console.log('================================');

async function testComponentDiscovery() {
  const components = [
    'hero', 'biography', 'guest-intro', 'photo-gallery', 
    'logo-grid', 'topics-questions', 'topics', 'contact',
    'call-to-action', 'social', 'stats', 'questions',
    'testimonials', 'video-intro', 'podcast-player',
    'booking-calendar', 'authority-hook'
  ];
  
  console.log(`Testing ${components.length} components...`);
  
  for (const comp of components) {
    try {
      const renderer = await window.GMKBComponentRegistry?.get?.(comp);
      const isVue = renderer?.isVueRenderer || renderer?.framework === 'vue';
      testResults.components[comp] = {
        found: !!renderer,
        isVue: isVue
      };
      console.log(`  ${renderer ? '✅' : '❌'} ${comp}: ${renderer ? (isVue ? 'Vue' : 'Standard') : 'Not found'}`);
    } catch (error) {
      testResults.components[comp] = { found: false, error: error.message };
      console.log(`  ❌ ${comp}: Error - ${error.message}`);
    }
  }
  
  const vueCount = Object.values(testResults.components).filter(c => c.isVue).length;
  console.log(`\n  Summary: ${vueCount} Vue components, ${Object.keys(testResults.components).length - vueCount} standard components`);
}

// 2. DATA FLOW TEST
console.log('\n💾 TEST 2: Data Flow (State → Component)');
console.log('========================================');

function testDataFlow() {
  // Check if state manager exists
  const stateManager = window.GMKB?.stateManager;
  if (!stateManager) {
    console.log('  ❌ State Manager not found');
    testResults.dataFlow.stateManager = false;
    return;
  }
  
  console.log('  ✅ State Manager found');
  testResults.dataFlow.stateManager = true;
  
  // Get current state
  const state = stateManager.getState();
  console.log(`  📊 Current state has ${Object.keys(state.components || {}).length} components`);
  
  // Test adding a component with data
  console.log('\n  Testing component addition with data...');
  const testId = window.GMKB.addComponent('hero', {
    title: 'Data Flow Test Hero',
    subtitle: 'If you see this, data flow works!',
    ctaText: 'Test Button'
  });
  
  testResults.dataFlow.componentAdded = !!testId;
  console.log(`  ${testId ? '✅' : '❌'} Component added: ${testId || 'Failed'}`);
  
  // Check if component is in state
  const newState = stateManager.getState();
  const addedComponent = newState.components[testId];
  testResults.dataFlow.inState = !!addedComponent;
  console.log(`  ${addedComponent ? '✅' : '❌'} Component in state: ${!!addedComponent}`);
  
  if (addedComponent) {
    console.log(`  📝 Component data:`, addedComponent.data || addedComponent.props);
  }
  
  // Check if component rendered in DOM
  setTimeout(() => {
    const domElement = document.querySelector(`[data-component-id="${testId}"]`);
    testResults.dataFlow.inDOM = !!domElement;
    console.log(`  ${domElement ? '✅' : '❌'} Component in DOM: ${!!domElement}`);
    
    if (domElement) {
      const hasContent = domElement.textContent.includes('Data Flow Test Hero');
      testResults.dataFlow.hasContent = hasContent;
      console.log(`  ${hasContent ? '✅' : '❌'} Component displays data: ${hasContent}`);
    }
  }, 500);
}

// 3. THEME SYSTEM TEST
console.log('\n🎨 TEST 3: Theme System');
console.log('=======================');

function testThemeSystem() {
  // Check if theme manager exists
  const themeManager = window.themeManager;
  if (!themeManager) {
    console.log('  ❌ Theme Manager not found');
    testResults.themes.manager = false;
    return;
  }
  
  console.log('  ✅ Theme Manager found');
  testResults.themes.manager = true;
  
  // Check available themes
  const themes = themeManager.getAvailableThemes?.() || [];
  console.log(`  📚 Available themes: ${themes.length}`);
  themes.forEach(theme => {
    console.log(`    - ${theme.id}: ${theme.name}`);
  });
  
  // Check CSS variables
  const rootStyles = getComputedStyle(document.documentElement);
  const cssVars = {
    primary: rootStyles.getPropertyValue('--gmkb-color-primary'),
    text: rootStyles.getPropertyValue('--gmkb-color-text'),
    background: rootStyles.getPropertyValue('--gmkb-color-background'),
    surface: rootStyles.getPropertyValue('--gmkb-color-surface')
  };
  
  const hasVars = Object.values(cssVars).some(v => v.trim() !== '');
  testResults.themes.cssVariables = hasVars;
  console.log(`  ${hasVars ? '✅' : '❌'} CSS Variables set:`, hasVars ? 'Yes' : 'No');
  
  if (hasVars) {
    console.log('  CSS Variable values:');
    Object.entries(cssVars).forEach(([key, value]) => {
      if (value.trim()) {
        console.log(`    --gmkb-color-${key}: ${value.trim()}`);
      }
    });
  }
}

// 4. RENDERING TEST
console.log('\n🖼️ TEST 4: Component Rendering');
console.log('===============================');

function testRendering() {
  // Check containers
  const containers = {
    'saved-components-container': document.getElementById('saved-components-container'),
    'gmkb-sections-container': document.getElementById('gmkb-sections-container'),
    'components-direct-container': document.getElementById('components-direct-container'),
    'empty-state': document.getElementById('empty-state')
  };
  
  console.log('  Container status:');
  Object.entries(containers).forEach(([id, element]) => {
    const exists = !!element;
    const visible = exists && element.style.display !== 'none';
    console.log(`    ${exists ? '✅' : '❌'} ${id}: ${exists ? (visible ? 'Visible' : 'Hidden') : 'Not found'}`);
    testResults.rendering[id] = { exists, visible };
  });
  
  // Count rendered components
  const renderedComponents = document.querySelectorAll('.gmkb-component');
  console.log(`\n  📊 Rendered components: ${renderedComponents.length}`);
  
  // Check each rendered component
  if (renderedComponents.length > 0) {
    console.log('  Component details:');
    renderedComponents.forEach((comp, index) => {
      const type = comp.getAttribute('data-component-type') || comp.className.match(/gmkb-component--(\w+)/)?.[1];
      const id = comp.getAttribute('data-component-id');
      const hasContent = comp.textContent.trim().length > 0;
      const vueWrapper = comp.querySelector('[class$="-vue-wrapper"]');
      
      console.log(`    ${index + 1}. ${type || 'unknown'} (${id})`);
      console.log(`       ${hasContent ? '✅' : '❌'} Has content: ${hasContent}`);
      console.log(`       ${vueWrapper ? '✅' : '❌'} Vue component: ${!!vueWrapper}`);
    });
  }
}

// 5. SAVE/LOAD TEST
console.log('\n💾 TEST 5: Save/Load Functionality');
console.log('==================================');

async function testSaveLoad() {
  const apiService = window.GMKB?.apiService;
  if (!apiService) {
    console.log('  ❌ API Service not found');
    testResults.saveLoad.apiService = false;
    return;
  }
  
  console.log('  ✅ API Service found');
  testResults.saveLoad.apiService = true;
  
  // Check post ID
  const postId = apiService.postId || window.gmkbData?.postId;
  console.log(`  📝 Post ID: ${postId || 'Not set'}`);
  testResults.saveLoad.postId = !!postId;
  
  // Test save
  console.log('\n  Testing save functionality...');
  try {
    const state = window.GMKB.stateManager.getState();
    console.log(`  Saving ${Object.keys(state.components || {}).length} components...`);
    
    await window.GMKB.save();
    console.log('  ✅ Save completed');
    testResults.saveLoad.save = true;
  } catch (error) {
    console.log(`  ❌ Save failed: ${error.message}`);
    testResults.saveLoad.save = false;
  }
}

// 6. PODS DATA INTEGRATION TEST
console.log('\n🔗 TEST 6: Pods Data Integration');
console.log('================================');

function testPodsData() {
  const podsData = window.gmkbData?.pods_data;
  if (!podsData) {
    console.log('  ❌ No Pods data found');
    testResults.podsData = { found: false };
    return;
  }
  
  console.log('  ✅ Pods data found');
  testResults.podsData = { found: true };
  
  // Check available fields
  const fields = Object.keys(podsData);
  console.log(`  📊 Available fields: ${fields.length}`);
  
  // Show some sample data
  const sampleFields = ['full_name', 'biography', 'guest_title', 'company'];
  console.log('  Sample data:');
  sampleFields.forEach(field => {
    if (podsData[field]) {
      const value = typeof podsData[field] === 'string' 
        ? podsData[field].substring(0, 50) + (podsData[field].length > 50 ? '...' : '')
        : podsData[field];
      console.log(`    ${field}: "${value}"`);
    }
  });
}

// RUN ALL TESTS
async function runAllTests() {
  await testComponentDiscovery();
  testDataFlow();
  
  setTimeout(() => {
    testThemeSystem();
    testRendering();
    testSaveLoad().then(() => {
      testPodsData();
      
      // FINAL SUMMARY
      console.log('\n' + '='.repeat(50));
      console.log('📊 PHASE 3 TEST SUMMARY');
      console.log('='.repeat(50));
      
      // Calculate scores
      const componentScore = Object.values(testResults.components).filter(c => c.found).length;
      const dataFlowScore = Object.values(testResults.dataFlow).filter(v => v === true).length;
      const themeScore = testResults.themes.manager && testResults.themes.cssVariables ? 2 : 0;
      const renderingScore = Object.values(testResults.rendering).filter(r => r.exists).length;
      
      console.log(`\n✅ Components: ${componentScore}/${Object.keys(testResults.components).length} discovered`);
      console.log(`✅ Data Flow: ${dataFlowScore}/5 tests passed`);
      console.log(`✅ Themes: ${themeScore}/2 systems working`);
      console.log(`✅ Rendering: ${renderingScore}/${Object.keys(testResults.rendering).length} containers found`);
      console.log(`✅ Save/Load: ${testResults.saveLoad.save ? 'Working' : 'Not working'}`);
      console.log(`✅ Pods Data: ${testResults.podsData?.found ? 'Integrated' : 'Not found'}`);
      
      // Overall status
      const allPassed = componentScore > 0 && dataFlowScore >= 3 && themeScore >= 1 && renderingScore >= 2;
      
      console.log('\n' + '='.repeat(50));
      if (allPassed) {
        console.log('🎉 PHASE 3 COMPLETE: System is functional!');
        console.log('The Media Kit Builder is ready for use.');
      } else {
        console.log('⚠️ PHASE 3 INCOMPLETE: Some issues remain');
        console.log('\nTroubleshooting:');
        if (componentScore === 0) console.log('  - No components discovered: Check VueComponentDiscovery');
        if (dataFlowScore < 3) console.log('  - Data flow issues: Check state manager and renderer');
        if (themeScore === 0) console.log('  - Theme system not working: Check ThemeManager');
        if (renderingScore < 2) console.log('  - Rendering issues: Check container visibility');
      }
      
      console.log('\n💡 Next steps:');
      console.log('  1. Fix any failing tests');
      console.log('  2. Add more components with real data');
      console.log('  3. Test theme switching');
      console.log('  4. Verify save/load persistence');
    });
  }, 1000);
}

// Start tests
runAllTests();

// Helper functions
window.phase3 = {
  results: testResults,
  
  // Add test component with Pods data
  addPodsComponent: function(type = 'biography') {
    const podsData = window.gmkbData?.pods_data || {};
    return window.GMKB.addComponent(type, podsData);
  },
  
  // Clear all test components
  clearAll: function() {
    const state = window.GMKB.stateManager.getState();
    Object.keys(state.components).forEach(id => {
      window.GMKB.removeComponent(id);
    });
    console.log('✅ All components cleared');
  },
  
  // Force re-render
  rerender: function() {
    window.GMKB.renderer.render();
    console.log('✅ Re-render triggered');
  },
  
  // Switch theme
  switchTheme: function(themeId) {
    if (window.themeManager) {
      window.themeManager.applyTheme(themeId);
      console.log(`✅ Switched to theme: ${themeId}`);
    }
  }
};

console.log('\n💡 Helper functions available:');
console.log('  phase3.addPodsComponent(type) - Add component with Pods data');
console.log('  phase3.clearAll() - Clear all components');
console.log('  phase3.rerender() - Force re-render');
console.log('  phase3.switchTheme(id) - Switch theme');
