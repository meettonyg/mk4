/**
 * Complete Vue Migration Diagnostic & Fix Tool
 * Run this to diagnose and fix remaining issues
 */

window.diagnoseAndFix = function() {
    console.group('🔧 Vue Migration Diagnostic & Fix Tool');
    
    const store = window.gmkbStore || window.mediaKitStore;
    const themeStore = window.themeStore;
    
    console.log('\n1️⃣ Checking Store...');
    if (!store) {
        console.error('❌ Store not found!');
        return;
    }
    console.log('✅ Store found');
    
    // Fix theme if it's still "default"
    console.log('\n2️⃣ Checking Theme...');
    console.log(`Current theme: "${store.theme}"`);
    
    if (store.theme === 'default' || store.theme === 'professional') {
        console.log('🔧 Fixing invalid theme...');
        store.theme = 'professional_clean';
        console.log('✅ Theme fixed to "professional_clean"');
        
        // Trigger theme update
        if (themeStore && themeStore.setTheme) {
            themeStore.setTheme('professional_clean');
        }
        
        // Save the fix
        store.autoSave();
        console.log('💾 Auto-save triggered');
    } else if (!['professional_clean', 'creative_bold', 'minimal_elegant', 'modern_dark'].includes(store.theme)) {
        console.warn(`⚠️ Unknown theme: ${store.theme}`);
        store.theme = 'professional_clean';
        console.log('✅ Reset to professional_clean');
    } else {
        console.log('✅ Theme is valid');
    }
    
    // Check DOM structure
    console.log('\n3️⃣ Checking DOM Structure...');
    
    const checks = {
        'Vue App Container': [
            '#gmkb-app',
            '#gmkb-vue-app', 
            '.gmkb-vue-wrapper',
            '#app',
            '[data-vue-app]'
        ],
        'Builder Canvas': [
            '.builder-canvas',
            '.gmkb-builder-canvas',
            '#builder-canvas',
            '[data-builder-canvas]',
            '.gmkb-preview-area'
        ],
        'Edit Panel': [
            '.editor-panel',
            '.component-edit-panel',
            '.gmkb-edit-panel',
            '[data-editor-panel]',
            '.edit-panel'
        ],
        'Sections': [
            '.gmkb-section',
            '[data-section-id]',
            '.section-wrapper',
            '.gmkb-sections-container'
        ],
        'Components': [
            '[data-component-id]',
            '.gmkb-component-wrapper',
            '.component-wrapper'
        ]
    };
    
    const domResults = {};
    for (const [name, selectors] of Object.entries(checks)) {
        let found = null;
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el) {
                found = selector;
                break;
            }
        }
        domResults[name] = found;
        if (found) {
            console.log(`✅ ${name}: Found with selector "${found}"`);
        } else {
            console.log(`❌ ${name}: Not found`);
        }
    }
    
    // Check CSS Variables
    console.log('\n4️⃣ Checking CSS Variables...');
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVars = {
        '--gmkb-color-primary': 'Primary color',
        '--gmkb-color-text': 'Text color',
        '--gmkb-font-primary': 'Primary font',
        '--gmkb-color-background': 'Background color',
        '--gmkb-border-radius': 'Border radius'
    };
    
    let cssVarsOk = true;
    for (const [varName, description] of Object.entries(cssVars)) {
        const value = rootStyles.getPropertyValue(varName);
        if (value) {
            console.log(`✅ ${description}: ${value.trim()}`);
        } else {
            console.log(`❌ ${description}: Not set`);
            cssVarsOk = false;
        }
    }
    
    // Check state integrity
    console.log('\n5️⃣ Checking State Integrity...');
    console.log(`Components: ${Object.keys(store.components || {}).length}`);
    console.log(`Sections: ${(store.sections || []).length}`);
    console.log(`Has unsaved changes: ${store.hasUnsavedChanges}`);
    console.log(`Post ID: ${store.postId}`);
    
    // Generate report
    console.log('\n📊 DIAGNOSTIC REPORT:');
    const issues = [];
    const fixes = [];
    
    if (store.theme === 'default' || store.theme === 'professional') {
        issues.push('Theme needs migration');
        fixes.push('Theme auto-fixed to professional_clean');
    }
    
    if (!domResults['Vue App Container']) {
        issues.push('Vue app container not found with standard selectors');
        fixes.push('Check if app is using custom mount point');
    }
    
    if (!cssVarsOk) {
        issues.push('Some CSS variables missing');
        fixes.push('Theme may need re-initialization');
    }
    
    if (issues.length === 0) {
        console.log('🎉 No issues found! System is healthy.');
    } else {
        console.log('⚠️ Issues found:');
        issues.forEach(issue => console.log(`  - ${issue}`));
        console.log('\n✅ Fixes applied:');
        fixes.forEach(fix => console.log(`  - ${fix}`));
    }
    
    console.groupEnd();
    
    return {
        healthy: issues.length === 0,
        issues: issues,
        fixes: fixes,
        dom: domResults,
        theme: store.theme,
        components: Object.keys(store.components || {}).length,
        sections: (store.sections || []).length
    };
};

// Quick action functions
window.fixTheme = function() {
    const store = window.gmkbStore || window.mediaKitStore;
    if (store) {
        store.theme = 'professional_clean';
        store.autoSave();
        console.log('✅ Theme fixed and saved');
    }
};

window.clearBadState = function() {
    const store = window.gmkbStore || window.mediaKitStore;
    if (store && store.postId) {
        localStorage.removeItem(`gmkb_backup_${store.postId}`);
        console.log('✅ Cleared local backup');
    }
};

window.inspectVueApp = function() {
    console.group('🔍 Vue App Deep Inspection');
    
    // Check for Vue in different ways
    console.log('Checking for Vue instances...');
    
    // Check window.__VUE__
    if (window.__VUE__) {
        console.log('✅ Vue 3 detected via __VUE__');
    }
    
    // Check for Vue devtools hook
    if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('✅ Vue DevTools hook detected');
        const apps = window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps;
        if (apps && apps.size > 0) {
            console.log(`✅ ${apps.size} Vue app(s) registered with DevTools`);
        }
    }
    
    // Check for Pinia
    if (window.$pinia || window.pinia) {
        console.log('✅ Pinia store detected');
    }
    
    // Look for Vue-compiled elements
    const vueElements = document.querySelectorAll('[data-v-], [_v-]');
    if (vueElements.length > 0) {
        console.log(`✅ ${vueElements.length} Vue-compiled elements found`);
    }
    
    // Check specific app containers
    const containers = [
        document.querySelector('.gmkb-builder-container'),
        document.querySelector('.gmkb-preview-area'),
        document.querySelector('#gmkb-template-error-boundary')
    ].filter(Boolean);
    
    console.log(`\nFound ${containers.length} potential Vue containers:`);
    containers.forEach(el => {
        console.log(`  - ${el.tagName}.${el.className || el.id}`);
    });
    
    console.groupEnd();
};

console.log(`
🔧 Vue Migration Diagnostic Tools Loaded
=====================================
Commands:
- diagnoseAndFix() - Complete diagnostic and auto-fix
- fixTheme() - Quick fix for theme issues
- clearBadState() - Clear corrupted local storage
- inspectVueApp() - Deep Vue app inspection

Run diagnoseAndFix() to start!
`);

// Auto-run if there are issues
setTimeout(() => {
    const store = window.gmkbStore || window.mediaKitStore;
    if (store && (store.theme === 'default' || store.theme === 'professional')) {
        console.log('⚠️ Detected theme issue, running auto-fix...');
        diagnoseAndFix();
    }
}, 1000);
