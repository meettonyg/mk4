/**
 * @file test-architecture-fix.js
 * @description Quick test to validate the architectural fixes
 * Run this in the browser console after the page loads
 */

function testArchitectureFix() {
    console.log('🧪 Testing Architectural Fix...\n');
    
    // Test 1: Check if system registrar is available
    console.log('1. System Registrar:', !!window.systemRegistrar ? '✅ Available' : '❌ Missing');
    
    // Test 2: Check if core systems are registered
    if (window.systemRegistrar) {
        const systems = window.systemRegistrar.getAll();
        console.log('2. Registered Systems:');
        console.log('   - stateManager:', !!systems.stateManager ? '✅' : '❌');
        console.log('   - componentManager:', !!systems.componentManager ? '✅' : '❌');
        console.log('   - renderer:', !!systems.renderer ? '✅' : '❌');
        console.log('   - initializer:', !!systems.initializer ? '✅' : '❌');
    }
    
    // Test 3: Check global exposure
    console.log('3. Global Systems:');
    console.log('   - window.stateManager:', !!window.stateManager ? '✅' : '❌');
    console.log('   - window.componentManager:', !!window.componentManager ? '✅' : '❌');
    console.log('   - window.enhancedComponentManager:', !!window.enhancedComponentManager ? '✅' : '❌');
    console.log('   - window.renderer:', !!window.renderer ? '✅' : '❌');
    console.log('   - window.initializer:', !!window.initializer ? '✅' : '❌');
    
    // Test 4: Enhanced Component Manager validation
    console.log('4. Enhanced Component Manager:');
    if (window.enhancedComponentManager) {
        console.log('   - Available:', '✅');
        console.log('   - Has addComponent:', typeof window.enhancedComponentManager.addComponent === 'function' ? '✅' : '❌');
        console.log('   - Has init:', typeof window.enhancedComponentManager.init === 'function' ? '✅' : '❌');
        console.log('   - Type:', window.enhancedComponentManager.constructor.name);
    } else {
        console.log('   - Available:', '❌ Missing');
    }
    
    // Test 5: Component addition test
    console.log('5. Component Addition Test:');
    try {
        if (window.enhancedComponentManager && typeof window.enhancedComponentManager.addComponent === 'function') {
            console.log('   - Method callable:', '✅');
            console.log('   - Ready for component addition');
        } else {
            console.log('   - Method callable:', '❌ Not available');
        }
    } catch (error) {
        console.log('   - Error:', '❌', error.message);
    }
    
    // Test 6: Modal elements
    console.log('6. Modal Elements:');
    const modalElements = ['component-library-overlay', 'component-grid', 'add-component-button'];
    modalElements.forEach(id => {
        console.log(`   - ${id}:`, document.getElementById(id) ? '✅' : '❌');
    });
    
    // Test 7: Check for console errors
    console.log('7. Error Check:');
    console.log('   - Look above for any "CRITICAL" or "initializeSystems is not a function" errors');
    console.log('   - If none, the fix is working! ✅');
    
    // Summary
    console.log('\n📋 Summary:');
    const hasSystemRegistrar = !!window.systemRegistrar;
    const hasEnhancedComponentManager = !!window.enhancedComponentManager;
    const hasAddComponent = typeof window.enhancedComponentManager?.addComponent === 'function';
    
    if (hasSystemRegistrar && hasEnhancedComponentManager && hasAddComponent) {
        console.log('🎉 SUCCESS: Architecture fix appears to be working!');
        console.log('🔧 You should now be able to add components properly.');
        return true;
    } else {
        console.log('⚠️ PARTIAL: Some issues may remain, check the individual tests above.');
        return false;
    }
}

// Expose globally
window.testArchitectureFix = testArchitectureFix;

// Auto-run after a delay
setTimeout(() => {
    console.log('🚀 Auto-running architecture fix test...');
    testArchitectureFix();
}, 2000);

console.log('📋 Architecture fix test loaded. Run testArchitectureFix() manually if needed.');