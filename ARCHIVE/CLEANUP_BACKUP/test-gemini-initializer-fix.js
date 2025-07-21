/**
 * @file test-gemini-initializer-fix.js
 * @description Quick test for the initializer system fix
 */

function testInitializerFix() {
    console.log('🧪 Testing Gemini Initializer Fix...');
    console.log('=' .repeat(50));
    
    const tests = [];
    
    function test(name, condition, critical = false) {
        const status = condition ? 'PASS' : 'FAIL';
        const icon = condition ? '✅' : '❌';
        const criticality = critical ? ' (CRITICAL)' : '';
        
        console.log(`${icon} ${name}: ${status}${criticality}`);
        tests.push({ name, status, condition, critical });
        return condition;
    }
    
    // Test that initializer is registered
    const systems = window.systemRegistrar?.getAll() || {};
    test('Initializer Registered', !!systems.initializer, true);
    test('Initializer Globally Available', !!window.initializer, true);
    test('Initializer is AppInitializer', systems.initializer?.constructor?.name === 'AppInitializer', true);
    
    // Test initializer methods
    test('Initializer has initialize method', typeof window.initializer?.initialize === 'function', true);
    test('Initializer has getStatus method', typeof window.initializer?.getStatus === 'function');
    
    // Test that all required systems are present
    test('State Manager Available', !!window.stateManager, true);
    test('Component Manager Available', !!window.componentManager, true);
    test('Renderer Available', !!window.renderer, true);
    test('System Registrar Available', !!window.systemRegistrar, true);
    
    // Test initialization manager can find initializer
    const requiredGlobals = ['stateManager', 'componentManager', 'renderer', 'initializer'];
    const missingGlobals = requiredGlobals.filter(global => !window[global]);
    test('All Required Globals Present', missingGlobals.length === 0, true);
    
    if (missingGlobals.length > 0) {
        console.log('❌ Missing globals:', missingGlobals);
    }
    
    // Calculate results
    const passed = tests.filter(t => t.condition).length;
    const total = tests.length;
    const criticalFailed = tests.filter(t => t.critical && !t.condition).length;
    const successRate = total > 0 ? (passed / total * 100).toFixed(1) : 0;
    
    console.log('\n📊 RESULTS:');
    console.log(`Success Rate: ${successRate}% (${passed}/${total})`);
    
    if (criticalFailed === 0) {
        console.log('✅ All critical tests passed! Initializer fix should work.');
        console.log('🎯 The \"Required globals not available: initializer\" error should be resolved.');
    } else {
        console.log(`❌ ${criticalFailed} critical test(s) failed.`);
        console.log('🔥 The initializer system needs to be properly registered.');
    }
    
    console.log('=' .repeat(50));
    
    return { passed, total, successRate, criticalFailed };
}

function quickInitializerDiagnostic() {
    console.log('🔍 Quick Initializer Diagnostic...');
    
    const diagnostics = {
        'window.initializer exists': !!window.initializer,
        'initializer.initialize is function': typeof window.initializer?.initialize === 'function',
        'initializer in systemRegistrar': !!window.systemRegistrar?.get('initializer'),
        'systemRegistrar.list includes initializer': (window.systemRegistrar?.list() || []).includes('initializer'),
        'All required globals present': ['stateManager', 'componentManager', 'renderer', 'initializer'].every(g => !!window[g])
    };
    
    console.table(diagnostics);
    
    const allGood = Object.values(diagnostics).every(v => v);
    if (allGood) {
        console.log('✅ Initializer system appears to be correctly set up!');
    } else {
        console.log('❌ Initializer system has issues that need to be resolved.');
    }
    
    return diagnostics;
}

// Expose globally
window.testInitializerFix = testInitializerFix;
window.quickInitializerDiagnostic = quickInitializerDiagnostic;

console.log('🧪 Initializer Fix Test loaded!');
console.log('🔧 Run: testInitializerFix() or quickInitializerDiagnostic()');
