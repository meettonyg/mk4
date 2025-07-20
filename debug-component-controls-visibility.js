/**
 * Quick Component Controls Visibility Fix
 * This script will force the controls to be visible for debugging
 */

(function() {
    'use strict';
    
    console.group('%c🔧 COMPONENT CONTROLS VISIBILITY FIX', 'font-size: 16px; font-weight: bold; color: #ef4444; background: #fef2f2; padding: 4px 8px; border-radius: 4px;');
    
    function forceControlsVisible() {
        console.log('🔍 Searching for components with controls...');
        
        // Find all components with data-component-id
        const components = document.querySelectorAll('[data-component-id]');
        console.log(`📊 Found ${components.length} components`);
        
        components.forEach((component, index) => {
            const componentId = component.getAttribute('data-component-id');
            console.log(`🎯 Component ${index + 1}: ${componentId}`);
            
            // Check if controls exist
            const controls = component.querySelector('.component-controls');
            if (controls) {
                console.log(`  ✅ Controls found for ${componentId}`);
                
                // Force visibility
                controls.style.opacity = '1';
                controls.style.visibility = 'visible';
                controls.style.pointerEvents = 'all';
                controls.style.transform = 'translateY(0)';
                
                // Add permanent visibility class
                controls.classList.add('component-controls--visible');
                
                console.log(`  🎨 Made controls visible for ${componentId}`);
                
                // Check toolbar
                const toolbar = controls.querySelector('.component-controls__toolbar');
                if (toolbar) {
                    console.log(`  🔧 Toolbar found and styled`);
                } else {
                    console.log(`  ⚠️ No toolbar found in controls`);
                }
                
                // Check buttons
                const buttons = controls.querySelectorAll('button');
                console.log(`  🔘 Found ${buttons.length} control buttons`);
                
                buttons.forEach((button, btnIndex) => {
                    const action = button.getAttribute('data-action');
                    const title = button.getAttribute('title');
                    console.log(`    Button ${btnIndex + 1}: ${action || 'unknown'} (${title || 'no title'})`);
                });
                
            } else {
                console.log(`  ❌ No controls found for ${componentId}`);
                console.log(`  🔍 Component HTML:`, component.outerHTML.substring(0, 200) + '...');
            }
        });
    }
    
    function addDebugStyles() {
        console.log('🎨 Adding debug styles for better visibility...');
        
        const style = document.createElement('style');
        style.textContent = `
            /* DEBUG: Force component controls to be visible */
            .component-controls {
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: all !important;
                transform: translateY(0) !important;
                background: rgba(255, 0, 0, 0.1) !important;
                border: 2px solid red !important;
            }
            
            .component-controls--dynamic {
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: all !important;
                background: rgba(0, 255, 0, 0.1) !important;
                border: 2px solid green !important;
            }
            
            .component-controls__toolbar,
            .component-controls__toolbar--dynamic {
                background: rgba(0, 0, 0, 0.9) !important;
                border: 1px solid white !important;
            }
            
            /* Debug: Highlight components */
            [data-component-id] {
                border: 1px dashed blue !important;
                position: relative;
            }
            
            [data-component-id]::before {
                content: attr(data-component-id);
                position: absolute;
                top: -20px;
                left: 0;
                background: blue;
                color: white;
                font-size: 10px;
                padding: 2px 4px;
                border-radius: 2px;
                z-index: 1000;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Debug styles added');
    }
    
    function checkComponentControlsManager() {
        console.log('🔍 Checking ComponentControlsManager status...');
        
        if (window.componentControlsManager) {
            console.log('✅ ComponentControlsManager is available');
            console.log('📊 Manager status:', window.componentControlsManager.getStatus());
            
            // Try to re-attach controls
            const components = document.querySelectorAll('[data-component-id]');
            components.forEach(component => {
                const componentId = component.getAttribute('data-component-id');
                console.log(`🔄 Re-attaching controls to ${componentId}...`);
                
                const success = window.componentControlsManager.attachControls(component, componentId);
                console.log(`${success ? '✅' : '❌'} Re-attachment result: ${success}`);
            });
        } else {
            console.log('❌ ComponentControlsManager not available');
        }
    }
    
    // Run all fixes
    console.log('🚀 Starting component controls visibility fix...');
    
    addDebugStyles();
    forceControlsVisible();
    checkComponentControlsManager();
    
    // Set up hover test
    setTimeout(() => {
        console.log('\n🖱️ Hover Test: Move your mouse over the components to test hover visibility');
        
        document.querySelectorAll('[data-component-id]').forEach(component => {
            component.addEventListener('mouseenter', () => {
                console.log('🖱️ Mouse entered:', component.getAttribute('data-component-id'));
            });
        });
    }, 1000);
    
    console.log('\n💡 Debug Commands Available:');
    console.log('   debugControls.forceControlsVisible() - Make all controls visible');
    console.log('   debugControls.addDebugStyles() - Add debug styling');
    console.log('   debugControls.checkComponentControlsManager() - Check manager status');
    
    // Export functions for manual use
    window.debugControls = {
        forceControlsVisible,
        addDebugStyles,
        checkComponentControlsManager
    };
    
    console.groupEnd();
    
})();