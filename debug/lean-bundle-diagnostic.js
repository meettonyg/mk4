/**
 * Lean Bundle Diagnostic
 * Verifies that the Vue/Vite lean bundle is working correctly
 * and that legacy scripts are NOT loading
 */

(function() {
    'use strict';
    
    console.log('🔍 LEAN BUNDLE DIAGNOSTIC STARTING...');
    console.log('='.repeat(60));
    
    // Check for Vue
    const hasVue = typeof Vue !== 'undefined' || window.Vue || window.gmkbVueInstance;
    console.log(`Vue.js: ${hasVue ? '✅ LOADED' : '❌ NOT FOUND'}`);
    
    // Check for Pinia
    const hasPinia = window.gmkbPinia || (window.Pinia && typeof window.Pinia !== 'undefined');
    console.log(`Pinia: ${hasPinia ? '✅ LOADED' : '❌ NOT FOUND'}`);
    
    // Check for lean bundle systems
    const leanSystems = {
        'GMKB (main namespace)': !!window.GMKB,
        'StateManager': !!window.stateManager,
        'Vue App': !!window.gmkbApp,
        'Vue Instance': !!window.gmkbVueInstance,
        'Pinia Store': !!window.gmkbPinia
    };
    
    console.log('\n📦 LEAN BUNDLE SYSTEMS:');
    Object.entries(leanSystems).forEach(([name, loaded]) => {
        console.log(`  ${name}: ${loaded ? '✅' : '❌'}`);
    });
    
    // Check for legacy systems that SHOULD NOT be loaded
    const legacySystems = {
        'enhancedComponentRenderer': window.enhancedComponentRenderer,
        'SimplifiedComponentRenderer': window.SimplifiedComponentRenderer,
        'clientOnlyRenderer': window.clientOnlyRenderer,
        'componentControlsManager': window.componentControlsManager,
        'enhancedStateManager': window.enhancedStateManager,
        'sectionLayoutManager': window.sectionLayoutManager,
        'themeManager': window.themeManager
    };
    
    console.log('\n⚠️ LEGACY SYSTEMS (should NOT be loaded with lean bundle):');
    let legacyCount = 0;
    Object.entries(legacySystems).forEach(([name, system]) => {
        if (system) {
            console.log(`  ${name}: ❌ LOADED (SHOULD NOT BE!)`);
            legacyCount++;
        } else {
            console.log(`  ${name}: ✅ Not loaded (correct)`);
        }
    });
    
    // Check loaded scripts
    const scripts = Array.from(document.querySelectorAll('script[src*="gmkb"], script[src*="media-kit"], script[src*="/mk4/"]'));
    console.log(`\n📜 TOTAL SCRIPTS LOADED: ${scripts.length}`);
    
    if (scripts.length > 10) {
        console.log('❌ TOO MANY SCRIPTS! Should only load lean bundle + minimal CSS');
        console.log('Scripts found:');
        scripts.forEach(script => {
            const src = script.src;
            const filename = src.split('/').pop().split('?')[0];
            if (filename.includes('gmkb.iife.js')) {
                console.log(`  ✅ ${filename} (LEAN BUNDLE - CORRECT)`);
            } else {
                console.log(`  ❌ ${filename} (LEGACY - SHOULD NOT LOAD)`);
            }
        });
    } else {
        console.log('✅ Script count looks reasonable');
    }
    
    // Check if lean bundle is loaded
    const leanBundle = document.querySelector('script[src*="gmkb.iife.js"]');
    if (leanBundle) {
        console.log('\n✅ LEAN BUNDLE SCRIPT FOUND:', leanBundle.src);
    } else {
        console.log('\n❌ LEAN BUNDLE SCRIPT NOT FOUND!');
        console.log('Expected: dist/gmkb.iife.js');
    }
    
    // Architecture compliance check
    console.log('\n🏗️ ARCHITECTURE COMPLIANCE:');
    const isCompliant = hasVue && 
                        leanSystems['GMKB (main namespace)'] && 
                        legacyCount === 0 && 
                        scripts.length <= 10;
    
    if (isCompliant) {
        console.log('✅ ARCHITECTURE COMPLIANT - Vue/Vite lean bundle active');
    } else {
        console.log('❌ NOT COMPLIANT - Issues detected:');
        if (!hasVue) console.log('  - Vue not loaded');
        if (!leanSystems['GMKB (main namespace)']) console.log('  - GMKB namespace missing');
        if (legacyCount > 0) console.log(`  - ${legacyCount} legacy systems loaded`);
        if (scripts.length > 10) console.log(`  - Too many scripts (${scripts.length})`);
    }
    
    // Provide fix suggestions
    if (!isCompliant) {
        console.log('\n🔧 TO FIX:');
        console.log('1. Check that GMKB_USE_LEAN_BUNDLE is true in enqueue.php');
        console.log('2. Rebuild the bundle: npm run build');
        console.log('3. Clear browser cache and reload');
        console.log('4. Check console for PHP errors preventing early return');
    }
    
    console.log('='.repeat(60));
    
    // Return diagnostic object
    return {
        hasVue,
        hasPinia,
        leanSystems,
        legacySystems,
        scriptCount: scripts.length,
        isCompliant,
        leanBundleLoaded: !!leanBundle
    };
})();

// Expose diagnostic function globally
window.runLeanBundleDiagnostic = function() {
    console.clear();
    return window.leanBundleDiagnostic();
};

// Auto-run after a delay to ensure all scripts have loaded
setTimeout(() => {
    window.leanBundleDiagnostic = arguments[0];
    const result = window.leanBundleDiagnostic();
    
    if (!result.isCompliant) {
        console.warn('⚠️ Architecture not compliant! Run runLeanBundleDiagnostic() for details');
    }
}, 2000);
