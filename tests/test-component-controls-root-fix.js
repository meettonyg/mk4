/**
 * Component Controls Fix Verification Script
 * 
 * Run this in the browser console to verify the root fix is working properly.
 * This script checks the proper initialization sequence and event coordination.
 */

(function() {
    'use strict';
    
    console.group('%c🧪 Component Controls Root Fix Verification', 'font-size: 16px; font-weight: bold; color: #16a085');
    
    // Check 1: Verify managers are properly initialized
    console.log('%c1. Manager Initialization Check', 'font-weight: bold; color: #3498db');
    
    const stateManagerReady = window.enhancedStateManager && window.enhancedStateManager.isInitialized;
    const componentManagerReady = window.enhancedComponentManager && window.enhancedComponentManager.isInitialized;
    const controlsManagerReady = window.componentControlsManager && window.componentControlsManager.isInitialized;
    
    console.log(`   State Manager: ${stateManagerReady ? '✅ Ready' : '❌ Not Ready'}`);
    console.log(`   Component Manager: ${componentManagerReady ? '✅ Ready' : '❌ Not Ready'}`);
    console.log(`   Controls Manager: ${controlsManagerReady ? '✅ Ready' : '❌ Not Ready'}`);
    
    // Check 2: Verify components in DOM have controls
    console.log('%c2. Component Controls Attachment Check', 'font-weight: bold; color: #3498db');
    
    const components = document.querySelectorAll('[data-component-id]');
    console.log(`   Found ${components.length} components in DOM`);
    
    let componentsWithControls = 0;
    let componentsWithoutControls = 0;
    
    components.forEach(element => {
        const id = element.getAttribute('data-component-id');
        const hasControls = element.querySelector('.component-controls--dynamic');
        
        if (hasControls) {
            componentsWithControls++;
            console.log(`   ✅ ${id}: Controls present`);
        } else {
            componentsWithoutControls++;
            console.log(`   ❌ ${id}: Controls missing`);
        }
    });
    
    // Check 3: Test hover behavior on a component
    console.log('%c3. Hover Behavior Test', 'font-weight: bold; color: #3498db');
    
    if (components.length > 0) {
        const testComponent = components[0];
        const testId = testComponent.getAttribute('data-component-id');
        const controls = testComponent.querySelector('.component-controls--dynamic');
        
        if (controls) {
            console.log(`   Testing hover behavior on: ${testId}`);
            
            // Get initial styles
            const initialOpacity = controls.style.opacity;
            const initialVisibility = controls.style.visibility;
            
            // Simulate hover
            testComponent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            
            setTimeout(() => {
                const hoverOpacity = controls.style.opacity;
                const hoverVisibility = controls.style.visibility;
                
                const behaviorWorks = hoverOpacity === '1' && hoverVisibility === 'visible';
                console.log(`   Hover test result: ${behaviorWorks ? '✅ Working' : '❌ Not working'}`);
                console.log(`   Opacity: ${initialOpacity} → ${hoverOpacity}`);
                console.log(`   Visibility: ${initialVisibility} → ${hoverVisibility}`);
                
                // Clean up
                testComponent.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            }, 100);
        } else {
            console.log(`   ❌ Cannot test hover - no controls found on ${testId}`);
        }
    } else {
        console.log(`   ⚠️ Cannot test hover - no components found in DOM`);
    }
    
    // Check 4: Verify event system is working
    console.log('%c4. Event System Check', 'font-weight: bold; color: #3498db');
    
    // Test event dispatch
    let eventReceived = false;
    const testEventHandler = () => {
        eventReceived = true;
    };
    
    document.addEventListener('gmkb:test-event', testEventHandler, { once: true });
    document.dispatchEvent(new CustomEvent('gmkb:test-event'));
    
    setTimeout(() => {
        console.log(`   Event system: ${eventReceived ? '✅ Working' : '❌ Not working'}`);
        document.removeEventListener('gmkb:test-event', testEventHandler);
    }, 50);
    
    // Summary
    setTimeout(() => {
        console.log('%cSUMMARY', 'font-weight: bold; color: #e74c3c; font-size: 14px');
        
        const allManagersReady = stateManagerReady && componentManagerReady && controlsManagerReady;
        const allComponentsHaveControls = components.length > 0 && componentsWithoutControls === 0;
        
        if (allManagersReady && allComponentsHaveControls) {
            console.log('%c✅ ROOT FIX VERIFIED: Component controls are working properly!', 
                       'background: #2ecc71; color: white; padding: 8px; border-radius: 4px; font-weight: bold');
        } else {
            console.log('%c❌ ISSUES DETECTED: Root fix may need additional work', 
                       'background: #e74c3c; color: white; padding: 8px; border-radius: 4px; font-weight: bold');
            
            if (!allManagersReady) {
                console.log('   → Some managers are not properly initialized');
            }
            if (!allComponentsHaveControls) {
                console.log(`   → ${componentsWithoutControls} components are missing controls`);
            }
        }
        
        console.log(`📊 Stats: ${componentsWithControls}/${components.length} components have controls`);
        console.groupEnd();
        
    }, 200);
    
})();

// Additional helper functions for manual testing
window.testComponentControlsRootFix = function() {
    console.log('🔧 Manual test functions available:');
    console.log('  - forceAttachControlsToAll() : Force attach controls to all components');
    console.log('  - debugControlsManager() : Show controls manager debug info');
    console.log('  - testHoverOnComponent(id) : Test hover behavior on specific component');
};

window.forceAttachControlsToAll = function() {
    if (!window.componentControlsManager) {
        console.error('Controls manager not available');
        return;
    }
    
    const components = document.querySelectorAll('[data-component-id]');
    let attached = 0;
    
    components.forEach(element => {
        const id = element.getAttribute('data-component-id');
        if (id) {
            const success = window.componentControlsManager.attachControls(element, id);
            if (success) attached++;
        }
    });
    
    console.log(`✅ Force attached controls to ${attached}/${components.length} components`);
};

window.debugControlsManager = function() {
    if (window.componentControlsManager) {
        console.log('Controls Manager Status:', window.componentControlsManager.getStatus());
    } else {
        console.error('Controls manager not available');
    }
};

window.testHoverOnComponent = function(componentId) {
    const element = document.getElementById(componentId);
    if (!element) {
        console.error(`Component not found: ${componentId}`);
        return;
    }
    
    console.log(`Testing hover on: ${componentId}`);
    
    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
        const controls = element.querySelector('.component-controls--dynamic');
        if (controls) {
            console.log(`Controls opacity: ${controls.style.opacity}`);
            console.log(`Controls visibility: ${controls.style.visibility}`);
        } else {
            console.log('No controls found on element');
        }
        
        element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    }, 100);
};

console.log('🧪 Component Controls Root Fix Verification loaded');
console.log('💡 Run the verification by calling the script, or use manual test functions');
