/**
 * Fixed Vue Migration System Test
 * Addresses the 3 failing tests with correct selectors
 */

window.testVueMigrationFixed = function() {
    console.log('🧪 Starting FIXED Vue Migration System Test...\n');

    const store = window.gmkbStore || window.mediaKitStore || (window.vue?.store);
    
    if (!store) {
        console.error('❌ FAILED: Vue store not found!');
        return false;
    }

    let passedTests = 0;
    let totalTests = 0;
    
    const test = (name, condition, details = '') => {
        totalTests++;
        if (condition) {
            console.log(`✅ ${name}${details ? ' - ' + details : ''}`);
            passedTests++;
            return true;
        } else {
            console.error(`❌ ${name}${details ? ' - ' + details : ''}`);
            return false;
        }
    };

    console.group('📊 FIXED Vue Component Tests');

    // === Vue Component Tests with CORRECT selectors ===
    console.group('⚛️ Vue Component Tests - FIXED');
    
    // Check if Vue app is mounted - use the correct ID
    const vueApp = document.querySelector('#gmkb-app') || 
                   document.querySelector('#gmkb-vue-app') || 
                   document.querySelector('.gmkb-vue-wrapper');
    test('Vue app mounted', !!vueApp, vueApp ? `Found: ${vueApp.id || vueApp.className}` : 'Not found');

    // Check for builder canvas with better selectors
    const canvas = document.querySelector('.builder-canvas') || 
                   document.querySelector('[data-builder-canvas]') ||
                   document.querySelector('.gmkb-builder-canvas') ||
                   document.querySelector('#builder-canvas');
    test('Builder canvas rendered', !!canvas, canvas ? `Found: ${canvas.className}` : 'Not found');

    // Check for edit panel with better selectors  
    const editPanel = document.querySelector('.editor-panel') ||
                      document.querySelector('[data-editor-panel]') ||
                      document.querySelector('.gmkb-edit-panel') ||
                      document.querySelector('.component-edit-panel');
    test('Edit panel component exists', !!editPanel, editPanel ? `Found: ${editPanel.className}` : 'Not found');

    // Additional Vue-specific checks
    const vueComponents = document.querySelectorAll('[data-component-id]');
    test('Vue components rendered', vueComponents.length > 0, `Found ${vueComponents.length} components`);

    // Check for section layouts
    const sections = document.querySelectorAll('[data-section-id], .section-wrapper, .gmkb-section');
    test('Sections rendered', sections.length > 0, `Found ${sections.length} sections`);

    console.groupEnd();

    // === Theme System Tests ===
    console.group('🎨 Theme System Tests');
    
    // Check if theme is correctly set
    test('Theme is set', !!store.theme, `Current theme: ${store.theme}`);
    
    // Check if theme is valid
    const validThemes = ['professional_clean', 'creative_bold', 'minimal_elegant', 'modern_dark'];
    test('Theme is valid', validThemes.includes(store.theme), `Theme "${store.theme}" in valid list`);
    
    // Check if CSS variables are applied
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColor = rootStyles.getPropertyValue('--gmkb-color-primary');
    test('Theme CSS variables applied', !!primaryColor, primaryColor ? `Primary: ${primaryColor}` : 'No CSS vars');
    
    // Check theme attribute on document
    const themeAttr = document.documentElement.getAttribute('data-gmkb-theme');
    test('Theme attribute on HTML', !!themeAttr, themeAttr || 'Not set');
    
    console.groupEnd();

    // === Store State Verification ===
    console.group('🏪 Store State Verification');
    
    test('Components object exists', typeof store.components === 'object' && store.components !== null);
    test('Sections array exists', Array.isArray(store.sections));
    test('Theme is not "default"', store.theme !== 'default', `Current: ${store.theme}`);
    test('Theme is not "professional"', store.theme !== 'professional', `Current: ${store.theme}`);
    
    console.groupEnd();

    // === DOM Structure Analysis ===
    console.group('🔍 DOM Structure Analysis');
    
    console.log('App containers found:');
    const appContainers = document.querySelectorAll('[id*="gmkb"], [class*="gmkb"]');
    appContainers.forEach(el => {
        console.log(`  - ${el.tagName}: ${el.id || el.className}`);
    });
    
    console.log('\nVue markers found:');
    const vueMarkers = document.querySelectorAll('[data-v-], [_v-]');
    console.log(`  - ${vueMarkers.length} Vue-compiled elements`);
    
    console.groupEnd();

    // === Final Results ===
    console.groupEnd();

    const successRate = (passedTests / totalTests) * 100;
    
    console.log(`\n📊 FIXED Test Results: ${passedTests}/${totalTests} passed (${successRate.toFixed(1)}%)`);
    
    if (successRate === 100) {
        console.log('🎉 PERFECT! All issues fixed!');
    } else if (successRate >= 90) {
        console.log('✅ EXCELLENT! System working well');
    } else {
        console.log('⚠️ Some issues remain');
    }

    return {
        passed: passedTests,
        total: totalTests,
        successRate: successRate,
        issues: totalTests - passedTests
    };
};

// Quick diagnostic function
window.diagnoseVueApp = function() {
    console.group('🔬 Vue App Diagnostic');
    
    console.log('1. Checking for Vue app mount points:');
    ['#gmkb-app', '#gmkb-vue-app', '.gmkb-vue-wrapper', '#app'].forEach(selector => {
        const el = document.querySelector(selector);
        console.log(`   ${selector}: ${el ? '✅ Found' : '❌ Not found'}`);
    });
    
    console.log('\n2. Checking for Vue components:');
    const components = document.querySelectorAll('[data-component-id]');
    console.log(`   Components with data-component-id: ${components.length}`);
    
    console.log('\n3. Checking store:');
    const store = window.gmkbStore || window.mediaKitStore;
    if (store) {
        console.log(`   ✅ Store found`);
        console.log(`   - Theme: ${store.theme}`);
        console.log(`   - Components: ${Object.keys(store.components || {}).length}`);
        console.log(`   - Sections: ${(store.sections || []).length}`);
    } else {
        console.log('   ❌ Store not found');
    }
    
    console.log('\n4. Checking CSS variables:');
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVars = ['--gmkb-color-primary', '--gmkb-color-text', '--gmkb-font-primary'];
    cssVars.forEach(varName => {
        const value = rootStyles.getPropertyValue(varName);
        console.log(`   ${varName}: ${value || '❌ Not set'}`);
    });
    
    console.groupEnd();
};

console.log('🧪 Fixed test loaded. Run testVueMigrationFixed() or diagnoseVueApp() to check.');
