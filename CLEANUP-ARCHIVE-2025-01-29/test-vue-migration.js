/**
 * Test Vue Migration - Verify dual rendering is fixed
 * Run this in the browser console to check the migration status
 */

window.testVueMigration = function() {
    console.log('🔍 Testing Vue Migration Status...\n');
    
    const results = {
        vueMode: false,
        legacyDisabled: false,
        componentCount: { store: 0, dom: 0 },
        duplicates: false,
        errors: []
    };
    
    // Check if Vue mode is active
    results.vueMode = window.GMKB_PURE_VUE_MODE === true;
    console.log(`✅ Vue Mode Active: ${results.vueMode}`);
    
    // Check if legacy systems are disabled
    const legacyChecks = [
        { name: 'enhancedComponentManager', obj: window.enhancedComponentManager },
        { name: 'ComponentRenderer', obj: window.ComponentRenderer },
        { name: 'stateManager', obj: window.stateManager },
        { name: 'Renderer', obj: window.Renderer }
    ];
    
    let disabledCount = 0;
    legacyChecks.forEach(check => {
        if (check.obj && check.obj._legacyDisabled) {
            disabledCount++;
            console.log(`✅ ${check.name}: Disabled`);
        } else if (!check.obj) {
            disabledCount++;
            console.log(`✅ ${check.name}: Not loaded`);
        } else {
            console.log(`❌ ${check.name}: Still active!`);
            results.errors.push(`${check.name} is still active`);
        }
    });
    
    results.legacyDisabled = disabledCount === legacyChecks.length;
    
    // Check component counts
    if (window.gmkbStore) {
        results.componentCount.store = window.gmkbStore.components?.length || 0;
        console.log(`\n📊 Store Components: ${results.componentCount.store}`);
    }
    
    // Count DOM components
    const domComponents = document.querySelectorAll('.gmkb-component, .vue-component, [data-component-id]');
    results.componentCount.dom = domComponents.length;
    console.log(`📊 DOM Components: ${results.componentCount.dom}`);
    
    // Check for duplicates
    results.duplicates = results.componentCount.dom > results.componentCount.store && results.componentCount.store > 0;
    if (results.duplicates) {
        console.log(`\n⚠️ DUPLICATES DETECTED! DOM has ${results.componentCount.dom - results.componentCount.store} extra components`);
        results.errors.push('Duplicate components detected');
    } else {
        console.log(`\n✅ No duplicates - counts match!`);
    }
    
    // Check for Vue app
    const vueApp = window.gmkbApp || window.vueApp;
    if (vueApp) {
        console.log('\n✅ Vue App Found');
        console.log('   Version:', vueApp.version);
    } else {
        console.log('\n❌ Vue App Not Found');
        results.errors.push('Vue app not initialized');
    }
    
    // Check mount point
    const mountPoint = document.getElementById('gmkb-vue-app') || 
                       document.getElementById('vue-media-kit-app');
    if (mountPoint) {
        console.log('✅ Vue Mount Point Found:', mountPoint.id);
    } else {
        console.log('❌ Vue Mount Point Missing');
        results.errors.push('Vue mount point not found');
    }
    
    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('MIGRATION STATUS SUMMARY:');
    console.log('='.repeat(50));
    
    const success = results.vueMode && 
                   results.legacyDisabled && 
                   !results.duplicates && 
                   results.errors.length === 0;
    
    if (success) {
        console.log('✅ ✅ ✅ MIGRATION SUCCESSFUL! ✅ ✅ ✅');
        console.log('Vue is handling all rendering');
        console.log('No duplicates detected');
        console.log('Legacy systems disabled');
    } else {
        console.log('❌ MIGRATION INCOMPLETE');
        if (results.errors.length > 0) {
            console.log('\nIssues found:');
            results.errors.forEach(err => console.log(`  - ${err}`));
        }
        console.log('\nTroubleshooting:');
        console.log('1. Ensure GMKB_USE_LEAN_BUNDLE is true in enqueue.php');
        console.log('2. Clear browser cache and reload');
        console.log('3. Check browser console for errors');
    }
    
    return results;
};

// Auto-run on load
if (document.readyState === 'complete') {
    setTimeout(() => {
        console.log('Running Vue Migration Test...');
        window.testVueMigration();
    }, 1000);
} else {
    window.addEventListener('load', () => {
        setTimeout(() => {
            console.log('Running Vue Migration Test...');
            window.testVueMigration();
        }, 1000);
    });
}

console.log('Vue Migration Test loaded. Run testVueMigration() to check status.');