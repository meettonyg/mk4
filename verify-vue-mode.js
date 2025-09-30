// Media Kit Builder - Vue-Only Mode Verification Script
// Run this in the browser console to verify Vue-only mode is working correctly

(function() {
    console.log('%c🔍 Media Kit Builder - Vue Mode Verification', 'font-size: 16px; font-weight: bold; color: #42b883;');
    console.log('================================================');
    
    const checks = {
        'Vue App Loaded': false,
        'No jQuery': false,
        'No Legacy Scripts': false,
        'REST API Available': false,
        'Pinia Store': false,
        'Components Registered': false,
        'Single Bundle': false,
        'No Global Pollution': false
    };
    
    // Check 1: Vue App
    if (window.gmkbApp || document.querySelector('#gmkb-app').__vueApp__) {
        checks['Vue App Loaded'] = true;
    } else if (document.querySelector('[data-v-]')) {
        checks['Vue App Loaded'] = true; // Vue components detected
    }
    
    // Check 2: No jQuery
    if (typeof jQuery === 'undefined' && typeof $ === 'undefined') {
        checks['No jQuery'] = true;
    } else if (typeof jQuery !== 'undefined' && !jQuery.fn) {
        checks['No jQuery'] = true; // jQuery exists but not used
    }
    
    // Check 3: No Legacy Scripts
    const scripts = Array.from(document.scripts);
    const legacyScripts = scripts.filter(s => 
        s.src && (
            s.src.includes('/js/') && !s.src.includes('/dist/') ||
            s.src.includes('enhanced-state-manager') ||
            s.src.includes('component-controls-manager') ||
            s.src.includes('structured-logger')
        )
    );
    
    if (legacyScripts.length === 0) {
        checks['No Legacy Scripts'] = true;
    } else {
        console.warn('Legacy scripts found:', legacyScripts.map(s => s.src));
    }
    
    // Check 4: REST API
    if (window.gmkbData && window.gmkbData.api) {
        checks['REST API Available'] = true;
    }
    
    // Check 5: Pinia Store
    if (window.__PINIA__ || (window.gmkbApp && window.gmkbApp._instance && window.gmkbApp._instance.proxy.$pinia)) {
        checks['Pinia Store'] = true;
    }
    
    // Check 6: Components
    const vueComponents = document.querySelectorAll('[data-v-]').length;
    if (vueComponents > 0) {
        checks['Components Registered'] = true;
        console.log(`Found ${vueComponents} Vue components in DOM`);
    }
    
    // Check 7: Single Bundle
    const bundleScripts = scripts.filter(s => 
        s.src && s.src.includes('gmkb.iife.js')
    );
    
    if (bundleScripts.length === 1) {
        checks['Single Bundle'] = true;
    }
    
    // Check 8: No Global Pollution
    const legacyGlobals = [
        'enhancedStateManager',
        'componentControlsManager',
        'structuredLogger',
        'gmkb',
        'GMKB'
    ];
    
    const foundGlobals = legacyGlobals.filter(g => window[g]);
    if (foundGlobals.length === 0) {
        checks['No Global Pollution'] = true;
    } else {
        console.warn('Legacy globals found:', foundGlobals);
    }
    
    // Display Results
    console.log('\n📊 Verification Results:');
    console.log('------------------------');
    
    let passCount = 0;
    let failCount = 0;
    
    for (const [check, passed] of Object.entries(checks)) {
        const icon = passed ? '✅' : '❌';
        const color = passed ? 'color: green' : 'color: red';
        console.log(`${icon} ${check}`, passed ? '' : '- FAILED');
        
        if (passed) passCount++;
        else failCount++;
    }
    
    console.log('\n📈 Summary:');
    console.log(`   Passed: ${passCount}/${Object.keys(checks).length}`);
    console.log(`   Failed: ${failCount}/${Object.keys(checks).length}`);
    
    // Performance Metrics
    console.log('\n⚡ Performance Metrics:');
    const scripts_loaded = scripts.length;
    const bundle_size = bundleScripts[0] ? 
        (performance.getEntriesByName(bundleScripts[0].src)[0]?.transferSize / 1024).toFixed(2) + ' KB' :
        'N/A';
    
    console.log(`   Scripts Loaded: ${scripts_loaded}`);
    console.log(`   Bundle Size: ${bundle_size}`);
    console.log(`   Vue Components: ${vueComponents}`);
    
    // Memory Usage
    if (performance.memory) {
        const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
        console.log(`   Memory Usage: ${memoryMB} MB`);
    }
    
    // Final Status
    const allPassed = passCount === Object.keys(checks).length;
    
    if (allPassed) {
        console.log('%c\n🎉 SUCCESS: Vue-only mode is working perfectly!', 'font-size: 14px; font-weight: bold; color: #42b883;');
        console.log('All legacy code has been successfully removed.');
    } else {
        console.log('%c\n⚠️ WARNING: Some legacy code still detected', 'font-size: 14px; font-weight: bold; color: orange;');
        console.log('Run archive-legacy-code.bat to clean up remaining files.');
    }
    
    console.log('\n================================================');
    
    // Return results for programmatic use
    return {
        passed: passCount === Object.keys(checks).length,
        checks: checks,
        metrics: {
            scripts: scripts_loaded,
            bundleSize: bundle_size,
            components: vueComponents
        }
    };
})();

// Additional helper functions
window.gmkbVerify = {
    // Check specific features
    checkAPI: function() {
        if (window.gmkbData && window.gmkbData.api) {
            console.log('✅ API Configuration:', window.gmkbData.api);
            return true;
        }
        console.log('❌ API not configured');
        return false;
    },
    
    // Check store
    checkStore: function() {
        try {
            const app = document.querySelector('#gmkb-app').__vueApp__;
            const store = app.config.globalProperties.$pinia._s.get('mediaKit');
            console.log('✅ Store found:', store);
            console.log('   Components:', Object.keys(store.components || {}).length);
            console.log('   Sections:', (store.sections || []).length);
            return true;
        } catch (e) {
            console.log('❌ Store not accessible:', e.message);
            return false;
        }
    },
    
    // List all loaded scripts
    listScripts: function() {
        const scripts = Array.from(document.scripts)
            .filter(s => s.src)
            .map(s => {
                const url = new URL(s.src);
                return url.pathname.split('/').pop();
            });
        console.log('Loaded scripts:', scripts);
        return scripts;
    },
    
    // Check for legacy remnants
    checkLegacy: function() {
        const legacy = {
            jQuery: typeof jQuery !== 'undefined',
            enhancedStateManager: typeof enhancedStateManager !== 'undefined',
            componentControlsManager: typeof componentControlsManager !== 'undefined',
            GMKB: typeof GMKB !== 'undefined',
            gmkb: typeof gmkb !== 'undefined'
        };
        
        const found = Object.entries(legacy)
            .filter(([k, v]) => v)
            .map(([k]) => k);
        
        if (found.length > 0) {
            console.log('⚠️ Legacy code found:', found);
        } else {
            console.log('✅ No legacy code detected');
        }
        
        return found;
    },
    
    // Full diagnostic
    fullDiagnostic: function() {
        console.log('\n🔬 Full System Diagnostic\n' + '='.repeat(40));
        this.checkAPI();
        this.checkStore();
        this.checkLegacy();
        this.listScripts();
        console.log('='.repeat(40));
    }
};

console.log('\n💡 Additional commands available:');
console.log('   gmkbVerify.checkAPI()     - Check API configuration');
console.log('   gmkbVerify.checkStore()   - Check Pinia store');
console.log('   gmkbVerify.checkLegacy()  - Check for legacy code');
console.log('   gmkbVerify.listScripts()  - List all loaded scripts');
console.log('   gmkbVerify.fullDiagnostic() - Run full diagnostic');