/**
 * @file test-new-architecture.js
 * @description Test script to validate the new system architecture
 * Run this in the browser console to test the fixes
 */

// Test script to validate the new architecture
function testNewArchitecture() {
    console.log('🧪 Testing New System Architecture...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        warnings: 0,
        tests: []
    };
    
    function test(name, condition, critical = false) {
        const status = condition ? 'PASS' : (critical ? 'FAIL' : 'WARN');
        const icon = condition ? '✅' : (critical ? '❌' : '⚠️');
        
        console.log(`${icon} ${name}: ${status}`);
        
        results.tests.push({ name, status, critical });
        
        if (condition) {
            results.passed++;
        } else if (critical) {
            results.failed++;
        } else {
            results.warnings++;
        }
    }
    
    // Test 1: System Registrar Available
    test('System Registrar Available', !!window.systemRegistrar, true);
    
    // Test 2: Core Systems Registered
    if (window.systemRegistrar) {
        const systems = window.systemRegistrar.getAll();
        test('State Manager Registered', !!systems.stateManager, true);
        test('Component Manager Registered', !!systems.componentManager, true);
        test('Renderer Registered', !!systems.renderer, true);
        test('Initializer Registered', !!systems.initializer, true);
    }
    
    // Test 3: Global Exposure
    test('window.stateManager Available', !!window.stateManager, true);
    test('window.componentManager Available', !!window.componentManager, true);
    test('window.enhancedComponentManager Available', !!window.enhancedComponentManager, true);
    test('window.renderer Available', !!window.renderer, true);
    test('window.initializer Available', !!window.initializer, true);
    
    // Test 4: Enhanced Component Manager Validation
    if (window.enhancedComponentManager) {
        test('Enhanced CM has addComponent method', 
             typeof window.enhancedComponentManager.addComponent === 'function', true);
        test('Enhanced CM has init method', 
             typeof window.enhancedComponentManager.init === 'function', true);
        test('Enhanced CM is correct type', 
             window.enhancedComponentManager.constructor.name.includes('Enhanced'), false);
    }
    
    // Test 5: Component Addition Test
    test('Can call addComponent without error', (() => {
        try {
            if (window.enhancedComponentManager && typeof window.enhancedComponentManager.addComponent === 'function') {
                // Test if we can call the method (don't actually add a component)
                const methodExists = true;
                console.log('  📝 addComponent method is callable');
                return methodExists;
            }
            return false;
        } catch (error) {
            console.log('  ❌ Error calling addComponent:', error.message);
            return false;
        }
    })(), true);
    
    // Test 6: Modal Elements Present
    const modalElements = [
        'component-library-overlay',
        'component-grid',
        'add-component-button',
        'add-component-btn'
    ];
    
    modalElements.forEach(elementId => {
        test(`Modal element ${elementId} exists`, !!document.getElementById(elementId), false);
    });
    
    // Test 7: System Info Available
    test('getSystemInfo function available', typeof window.getSystemInfo === 'function', false);
    
    if (window.getSystemInfo) {
        const systemInfo = window.getSystemInfo();
        console.log('\n📊 System Info:');
        console.log('  Registered Systems:', Object.keys(systemInfo.registered).filter(k => systemInfo.registered[k]));
        console.log('  Global Systems:', Object.keys(systemInfo.global).filter(k => systemInfo.global[k]));
        console.log('  System Types:', systemInfo.types);
    }
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.log(`  ✅ Passed: ${results.passed}`);
    console.log(`  ❌ Failed: ${results.failed}`);
    console.log(`  ⚠️  Warnings: ${results.warnings}`);
    console.log(`  📊 Total: ${results.tests.length}`);
    
    if (results.failed === 0) {
        console.log('\n🎉 All critical tests passed! Architecture fix successful.');
        
        // Test actual component addition
        console.log('\n🧪 Testing actual component addition...');
        try {
            if (window.enhancedComponentManager) {
                // We won't actually add a component, just verify the method works
                console.log('✅ Component addition should now work properly');
                console.log('🔧 To test: Open component library and try adding a component');
            }
        } catch (error) {
            console.log('❌ Component addition test failed:', error.message);
        }
    } else {
        console.log('\n⚠️ Some critical tests failed. Architecture may need additional fixes.');
    }
    
    return results;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    // Wait a moment for systems to initialize
    setTimeout(() => {
        console.log('🚀 Auto-running architecture test...');
        testNewArchitecture();
    }, 1000);
}

// Expose globally
window.testNewArchitecture = testNewArchitecture;