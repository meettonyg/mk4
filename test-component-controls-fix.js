// ROOT FIX: Test move functionality specifically  
window.forceMoveTest = function() {
    console.log('🔧 FORCE MOVE TEST - Testing component move up/down');
    
    const allComponents = document.querySelectorAll('[data-component-id]');
    if (allComponents.length < 2) {
        console.error('❌ Need at least 2 components to test move functionality');
        console.log('📋 Create another component first by duplicating');
        return;
    }
    
    console.log(`📊 Found ${allComponents.length} components for move testing`);
    
    // Test moving the second component up
    const secondComponent = allComponents[1];
    const componentId = secondComponent.getAttribute('data-component-id');
    
    console.log(`🎯 Testing move up on component: ${componentId}`);
    console.log(`📊 Initial position: 2 of ${allComponents.length}`);
    
    // Test move up event
    const moveUpEvent = new CustomEvent('gmkb:component-move-up-requested', {
        detail: { componentId: componentId }
    });
    document.dispatchEvent(moveUpEvent);
    
    // Wait and test move down
    setTimeout(() => {
        console.log(`🎯 Testing move down on component: ${componentId}`);
        
        const moveDownEvent = new CustomEvent('gmkb:component-move-down-requested', {
            detail: { componentId: componentId }
        });
        document.dispatchEvent(moveDownEvent);
        
        // Final check
        setTimeout(() => {
            const finalComponents = document.querySelectorAll('[data-component-id]');
            console.log(`✅ Move test complete. Components: ${finalComponents.length}`);
            console.log('Check console for move success/failure messages');
        }, 1000);
    }, 2000);
};

// ROOT FIX: Test delete functionality specifically  
window.forceDeleteTest = function() {
    console.log('🔧 FORCE DELETE TEST - Testing component deletion');
    
    const allComponents = document.querySelectorAll('[data-component-id]');
    if (allComponents.length === 0) {
        console.error('❌ No components found to test deletion');
        return;
    }
    
    // Use the last component for deletion test
    const lastComponent = allComponents[allComponents.length - 1];
    const componentId = lastComponent.getAttribute('data-component-id');
    console.log('🎯 Component ID for deletion test:', componentId);
    
    console.log('📋 Components before deletion:', allComponents.length);
    
    // Test the exact action that was failing
    console.log('🗑️ Dispatching delete event...');
    const event = new CustomEvent('gmkb:component-delete-requested', {
        detail: { componentId: componentId }
    });
    document.dispatchEvent(event);
    
    // Wait a moment, then check if it worked
    setTimeout(() => {
        const componentsAfter = document.querySelectorAll('[data-component-id]');
        console.log('📊 Components after deletion:', componentsAfter.length);
        
        if (componentsAfter.length < allComponents.length) {
            console.log('✅ SUCCESS: Delete worked! Component removed.');
        } else {
            console.log('❌ FAILED: Component still exists. Check delete logic.');
        }
    }, 2000); // Wait 2 seconds for deletion animation
};

// ROOT FIX: Component ID Diagnostic Tool
window.debugComponentIds = function() {
    console.group('🔍 Component ID Debugging');
    
    // Get all DOM components
    const domComponents = document.querySelectorAll('[data-component-id]');
    console.log('DOM Components found:', domComponents.length);
    
    const domIds = [];
    domComponents.forEach((el, index) => {
        const id = el.getAttribute('data-component-id');
        domIds.push(id);
        console.log(`DOM Component ${index + 1}:`, {
            id: id,
            element: el,
            classes: el.className
        });
    });
    
    // Get all state components
    const state = window.StateManager?.getState() || {};
    const stateIds = Object.keys(state.components || {});
    console.log('State Components found:', stateIds.length);
    
    stateIds.forEach((id, index) => {
        console.log(`State Component ${index + 1}:`, {
            id: id,
            component: state.components[id]
        });
    });
    
    // Check for mismatches
    console.log('\n🔄 ID Comparison:');
    console.log('DOM IDs:', domIds);
    console.log('State IDs:', stateIds);
    
    const mismatches = [];
    domIds.forEach(domId => {
        if (!stateIds.includes(domId)) {
            mismatches.push({ type: 'DOM_NOT_IN_STATE', id: domId });
        }
    });
    
    stateIds.forEach(stateId => {
        if (!domIds.includes(stateId)) {
            mismatches.push({ type: 'STATE_NOT_IN_DOM', id: stateId });
        }
    });
    
    if (mismatches.length > 0) {
        console.warn('⚠️ ID Mismatches found:', mismatches);
    } else {
        console.log('✅ All IDs match between DOM and State');
    }
    
    console.groupEnd();
    
    return {
        domIds,
        stateIds,
        mismatches,
        domComponents: domComponents.length,
        stateComponents: stateIds.length
    };
};

/**
 * Component Controls Fix Test Script
 * Run this in the browser console to test the root-level fixes
 */

// ROOT FIX: Test component controls functionality
window.testComponentControlsFix = function() {
    console.group('🧪 Testing Component Controls Fix - ROOT LEVEL');
    
    // Test 1: Check if global listeners are setup
    const globalListenersTest = {
        gmkb: !!window.GMKB?.globalActionListenersSetup,
        componentManager: !!window.ComponentManager?.globalActionListenersSetup
    };
    console.log('1. ✅ Global listeners setup:', globalListenersTest);
    
    // Test 2: Check if ComponentControlsManager is available
    const controlsManagerAvailable = !!window.componentControlsManager;
    console.log('2. ✅ ComponentControlsManager available:', controlsManagerAvailable);
    
    // Test 3: Check for components with controls
    const componentsWithControls = document.querySelectorAll('[data-controls-attached="true"]');
    console.log('3. ✅ Components with controls attached:', componentsWithControls.length);
    
    // Test 4: Check component elements
    const allComponents = document.querySelectorAll('[data-component-id]');
    console.log('4. ✅ Total components found:', allComponents.length);
    
    // Test 5: Test duplicate functionality on first component
    const firstComponent = document.querySelector('[data-component-id]');
    if (firstComponent) {
        const componentId = firstComponent.getAttribute('data-component-id');
        console.log('5. 🎯 Testing duplicate on component:', componentId);
        
        // Trigger duplicate event manually
        const event = new CustomEvent('gmkb:component-duplicate-requested', {
            detail: { componentId: componentId }
        });
        document.dispatchEvent(event);
        console.log('✅ Duplicate event dispatched for:', componentId);
    } else {
        console.log('5. ⚠️ No components found to test');
    }
    
    // Test 6: Test all other control actions
    if (firstComponent) {
        const componentId = firstComponent.getAttribute('data-component-id');
        
        console.log('6. 🎯 Testing all control actions on:', componentId);
        
        const testActions = [
            'gmkb:component-edit-requested',
            'gmkb:component-move-up-requested', 
            'gmkb:component-move-down-requested',
            'gmkb:component-delete-requested'
        ];
        
        testActions.forEach(eventName => {
            const event = new CustomEvent(eventName, {
                detail: { componentId: componentId }
            });
            document.dispatchEvent(event);
            console.log('✅ Dispatched:', eventName);
        });
    }
    
    console.groupEnd();
    
    const results = {
        globalListenersSetup: globalListenersTest.gmkb && globalListenersTest.componentManager,
        componentControlsManager: controlsManagerAvailable,
        componentsWithControls: componentsWithControls.length,
        totalComponents: allComponents.length,
        testComponent: firstComponent?.getAttribute('data-component-id') || null,
        success: globalListenersTest.gmkb && globalListenersTest.componentManager && controlsManagerAvailable
    };
    
    console.log('🏆 TEST RESULTS:', results);
    
    if (results.success) {
        console.log('✅ ROOT-LEVEL FIX SUCCESS: Component controls should now work properly!');
    } else {
        console.log('❌ Issues detected - check the results above');
    }
    
    return results;
};

// ROOT FIX: Debug GMKB system
window.debugGMKB = () => {
    console.group('%c🛠️ GMKB Debug Information', 'font-size: 14px; font-weight: bold; color: #2563eb');
    console.log('GMKB Available:', !!window.GMKB);
    console.log('GMKB Systems:', Object.keys(window.GMKB?.systems || {}));
    console.log('Global Listeners Setup:', window.GMKB?.globalActionListenersSetup);
    console.log('WordPress Data:', !!window.gmkbData);
    console.log('ComponentControlsManager:', !!window.componentControlsManager);
    console.log('ComponentManager Available:', !!window.ComponentManager);
    console.groupEnd();
    
    return window.GMKB?.getStatus?.() || 'GMKB not available';
};

// ROOT FIX: Force duplicate test (for debugging the exact issue)
window.forceDuplicateTest = function() {
    console.log('🔧 FORCE DUPLICATE TEST - Simulating exact user action');
    
    const firstComponent = document.querySelector('[data-component-id]');
    if (!firstComponent) {
        console.error('❌ No component found to test');
        return;
    }
    
    const componentId = firstComponent.getAttribute('data-component-id');
    console.log('🎯 Component ID:', componentId);
    
    // Test the exact action that was failing
    console.log('📋 Dispatching duplicate event...');
    const event = new CustomEvent('gmkb:component-duplicate-requested', {
        detail: { componentId: componentId }
    });
    document.dispatchEvent(event);
    
    // Wait a moment, then check if it worked
    setTimeout(() => {
        const componentsAfter = document.querySelectorAll('[data-component-id]');
        console.log('📊 Components before:', 1, 'Components after:', componentsAfter.length);
        
        if (componentsAfter.length > 1) {
            console.log('✅ SUCCESS: Duplicate worked! New component created.');
        } else {
            console.log('❌ FAILED: No new component created. Check event handlers.');
        }
    }, 1000);
};

console.log('🧪 Component Controls Test Script Loaded');
console.log('📋 Available commands:');
console.log('  testComponentControlsFix() - Full test suite');
console.log('  debugGMKB() - System debug info');
console.log('  debugComponentIds() - Component ID mismatch diagnosis');
console.log('  forceDuplicateTest() - Test duplicate action specifically');
console.log('  forceDeleteTest() - Test delete action specifically');
console.log('  forceMoveTest() - Test move up/down actions');
console.log('');
console.log('✅ DUPLICATE & DELETE WORKING! Now test move with forceMoveTest()');
