/**
 * COMPONENT CONTROLS FUNCTIONALITY TEST - COMPLETE EVENT FLOW VERIFICATION
 * 
 * This script tests the COMPLETE chain from controls to functionality:
 * 1. Visual controls presence ✅ (already working)
 * 2. Event dispatching from controls ⚠️ (need to test)
 * 3. Event listeners receiving events ⚠️ (need to test)
 * 4. Actual functionality execution ⚠️ (need to test)
 */

console.log('🔧 COMPONENT CONTROLS FUNCTIONALITY TEST');
console.log('==========================================');

// STEP 1: Verify all managers are available
console.log('\n1. Manager Availability Check...');
const managersCheck = {
    componentControlsManager: !!window.componentControlsManager,
    enhancedComponentManager: !!window.enhancedComponentManager,
    enhancedStateManager: !!window.enhancedStateManager,
    showToast: !!window.showToast
};

console.log('Managers Status:', managersCheck);

// STEP 2: Test event dispatching from controls
console.log('\n2. Testing Event Dispatching...');

const testEvents = [];

// Override addEventListener to capture event registrations
const originalAddEventListener = document.addEventListener;
document.addEventListener = function(type, listener, options) {
    if (type.startsWith('gmkb:component-')) {
        testEvents.push({ type, hasListener: true });
        console.log(`📡 Event listener registered: ${type}`);
    }
    return originalAddEventListener.call(this, type, listener, options);
};

// Override dispatchEvent to capture event dispatching
const originalDispatchEvent = document.dispatchEvent;
document.dispatchEvent = function(event) {
    if (event.type && event.type.startsWith('gmkb:component-')) {
        console.log(`🚀 Event dispatched: ${event.type}`, event.detail);
        testEvents.push({ 
            type: event.type, 
            dispatched: true, 
            detail: event.detail 
        });
    }
    return originalDispatchEvent.call(this, event);
};

// STEP 3: Find and test an actual component
console.log('\n3. Finding Components to Test...');
const allComponents = document.querySelectorAll('[data-component-id]');
console.log(`Found ${allComponents.length} components in DOM`);

if (allComponents.length === 0) {
    console.error('❌ No components found! Cannot test functionality.');
} else {
    const testComponent = allComponents[0];
    const componentId = testComponent.getAttribute('data-component-id');
    console.log(`🎯 Testing component: ${componentId}`);
    
    // STEP 4: Test control button existence and clicking
    console.log('\n4. Testing Control Button Clicks...');
    
    const controls = testComponent.querySelector('.component-controls--dynamic');
    if (!controls) {
        console.error('❌ No controls found for component');
    } else {
        console.log('✅ Controls found, testing buttons...');
        
        // Test each button type
        const buttonTests = [
            { selector: '[data-action="edit"]', action: 'edit' },
            { selector: '[data-action="moveUp"]', action: 'moveUp' },
            { selector: '[data-action="moveDown"]', action: 'moveDown' },
            { selector: '[data-action="duplicate"]', action: 'duplicate' },
            { selector: '[data-action="delete"]', action: 'delete' }
        ];
        
        let testIndex = 0;
        
        const testNextButton = () => {
            if (testIndex >= buttonTests.length) {
                console.log('\n📊 EVENT TEST RESULTS:');
                testEvents.forEach(event => {
                    console.log(`  ${event.type}: ${event.dispatched ? '✅ DISPATCHED' : '❌ NOT DISPATCHED'}`);
                });
                return;
            }
            
            const test = buttonTests[testIndex];
            const button = controls.querySelector(test.selector);
            
            if (button) {
                console.log(`🖱️ Clicking ${test.action} button...`);
                
                // Force show controls first
                controls.style.opacity = '1';
                controls.style.visibility = 'visible';
                controls.style.pointerEvents = 'all';
                
                // Click the button
                button.click();
                
                // Wait and test next button
                setTimeout(() => {
                    testIndex++;
                    testNextButton();
                }, 1000);
            } else {
                console.error(`❌ ${test.action} button not found`);
                testIndex++;
                testNextButton();
            }
        };
        
        // Start testing buttons
        testNextButton();
    }
}

// STEP 5: Test direct event dispatching (bypass controls)
console.log('\n5. Testing Direct Event Dispatching...');

setTimeout(() => {
    console.log('🧪 Testing direct event dispatch (bypassing controls)...');
    
    if (allComponents.length > 0) {
        const componentId = allComponents[0].getAttribute('data-component-id');
        
        // Test direct event dispatch
        const testEvents = [
            'gmkb:component-edit-requested',
            'gmkb:component-duplicate-requested',
            'gmkb:component-delete-requested'
        ];
        
        testEvents.forEach((eventType, index) => {
            setTimeout(() => {
                console.log(`📡 Directly dispatching: ${eventType}`);
                document.dispatchEvent(new CustomEvent(eventType, {
                    detail: { 
                        componentId,
                        source: 'direct-test',
                        timestamp: Date.now()
                    }
                }));
            }, index * 2000);
        });
    }
}, 8000);

// STEP 6: Restore original functions after tests
setTimeout(() => {
    console.log('\n6. Test Complete - Restoring Original Functions...');
    document.addEventListener = originalAddEventListener;
    document.dispatchEvent = originalDispatchEvent;
    console.log('✅ Original functions restored');
    
    // Summary
    setTimeout(() => {
        console.log('\n🎯 FUNCTIONALITY TEST SUMMARY');
        console.log('===========================');
        console.log('If you saw events being dispatched but no actual actions occurred,');
        console.log('then the issue is in the event handlers, not the controls.');
        console.log('');
        console.log('Next steps:');
        console.log('- Check browser console for JavaScript errors');
        console.log('- Run debugComponentControls() to verify control status');
        console.log('- Run checkComponentSync() to verify component synchronization');
    }, 1000);
    
}, 15000);
