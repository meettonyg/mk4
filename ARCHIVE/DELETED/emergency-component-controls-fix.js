/**
 * EMERGENCY COMPONENT CONTROLS DIAGNOSTIC SCRIPT
 * Run this script in the browser console to diagnose and fix component controls visibility issues
 */

(function() {
    'use strict';
    
    console.log('🔧 EMERGENCY COMPONENT CONTROLS DIAGNOSTIC STARTING...');
    
    // Step 1: Check if ComponentControlsManager exists
    if (!window.componentControlsManager) {
        console.error('❌ ComponentControlsManager not found globally');
        return;
    }
    
    console.log('✅ ComponentControlsManager found');
    
    // Step 2: Check all components in DOM
    const allComponents = document.querySelectorAll('[data-component-id]');
    console.log(`📋 Found ${allComponents.length} components in DOM`);
    
    if (allComponents.length === 0) {
        console.error('❌ No components found in DOM with data-component-id attribute');
        return;
    }
    
    // Step 3: Check each component for controls
    let componentsWithControls = 0;
    let componentsWithoutControls = 0;
    
    allComponents.forEach((element, index) => {
        const componentId = element.getAttribute('data-component-id');
        const hasControls = element.querySelector('.component-controls--dynamic');
        
        if (hasControls) {
            componentsWithControls++;
            console.log(`✅ ${componentId}: Has controls`);
        } else {
            componentsWithoutControls++;
            console.log(`❌ ${componentId}: Missing controls`);
            
            // Try to attach controls
            console.log(`🔧 Attempting to attach controls to ${componentId}...`);
            const success = window.componentControlsManager.attachControls(element, componentId);
            
            if (success) {
                console.log(`✅ Successfully attached controls to ${componentId}`);
                componentsWithControls++;
                componentsWithoutControls--;
            } else {
                console.error(`❌ Failed to attach controls to ${componentId}`);
            }
        }
    });
    
    console.log(`📊 Summary: ${componentsWithControls} with controls, ${componentsWithoutControls} without controls`);
    
    // Step 4: Force show all controls for debugging
    const allControls = document.querySelectorAll('.component-controls--dynamic');
    console.log(`🎛️ Found ${allControls.length} control groups`);
    
    if (allControls.length === 0) {
        console.error('❌ No control groups found even after attachment attempts');
        return;
    }
    
    // Step 5: Test hover behavior
    console.log('🖱️ Testing hover behavior...');
    
    allComponents.forEach((element, index) => {
        const componentId = element.getAttribute('data-component-id');
        
        // Ensure element is properly configured for hover
        if (!element.style.position || element.style.position === 'static') {
            element.style.position = 'relative';
        }
        element.style.cursor = 'pointer';
        element.tabIndex = element.tabIndex >= 0 ? element.tabIndex : 0;
        
        // Test hover
        element.addEventListener('mouseenter', () => {
            console.log(`🖱️ Mouse entered: ${componentId}`);
        });
    });
    
    // Step 6: Force show controls for immediate testing
    console.log('🚨 EMERGENCY FIX: Force showing all controls...');
    
    allControls.forEach(controls => {
        // Force visible
        controls.style.opacity = '1';
        controls.style.visibility = 'visible';
        controls.style.pointerEvents = 'all';
        controls.style.transform = 'translateY(-2px)';
        
        // Add debug styling
        controls.style.border = '2px solid #0ea5e9';
        controls.style.background = 'rgba(0, 0, 0, 0.95)';
        controls.style.zIndex = '10000';
        
        // Add click handlers for testing
        const buttons = controls.querySelectorAll('.component-control');
        buttons.forEach(button => {
            const action = button.getAttribute('data-action');
            const componentId = button.getAttribute('data-component-id');
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🔘 Control clicked: ${action} on ${componentId}`);
                
                // Show toast for feedback
                if (window.showToast) {
                    window.showToast(`${action} action triggered for ${componentId}`, 'info', 2000);
                } else {
                    alert(`${action} action triggered for ${componentId}`);
                }
            });
        });
    });
    
    // Step 7: Add debug CSS
    const debugCSS = `
        [data-component-id] {
            outline: 2px dashed rgba(14, 165, 233, 0.5) !important;
            outline-offset: 2px !important;
        }
        
        .component-controls--dynamic {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: all !important;
            border: 2px solid #0ea5e9 !important;
            background: rgba(0, 0, 0, 0.95) !important;
            z-index: 10000 !important;
        }
        
        .component-control {
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            background: rgba(255, 255, 255, 0.1) !important;
        }
        
        .component-control:hover {
            background: rgba(14, 165, 233, 0.8) !important;
            transform: scale(1.1) !important;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = debugCSS;
    styleElement.id = 'emergency-controls-debug-css';
    document.head.appendChild(styleElement);
    
    console.log('✅ Debug CSS applied');
    
    // Step 8: Final summary
    console.log('🎉 EMERGENCY DIAGNOSTIC COMPLETE!');
    console.log('📋 Controls should now be visible on all components');
    console.log('🖱️ Hover over components to see controls');
    console.log('🔘 Click controls to test functionality');
    console.log('');
    console.log('🔧 Available debug commands:');
    console.log('  - debugComponentControls()  : Show detailed debug info');
    console.log('  - forceShowAllControls()    : Force show all controls');
    console.log('  - testHoverBehavior(id)     : Test hover for specific component');
    console.log('  - testComponentControls(id) : Test control attachment');
    
    // Add global flag
    window.GMKBDebugMode = true;
    document.body.classList.add('gmkb-debug-mode');
    
})();
