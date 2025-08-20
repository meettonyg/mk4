/**
 * EMERGENCY COMPONENT CONTROLS VISIBILITY FIX
 * This script will force component controls to be visible and diagnose any CSS conflicts
 */

(function() {
    'use strict';
    
    console.log('🚨 EMERGENCY COMPONENT CONTROLS VISIBILITY FIX STARTING...');
    
    // Step 1: Check current state
    const allComponents = document.querySelectorAll('[data-component-id]');
    console.log(`📋 Found ${allComponents.length} components with data-component-id`);
    
    allComponents.forEach((element, index) => {
        const id = element.getAttribute('data-component-id');
        console.log(`Component ${index + 1}: ${id}`);
        console.log(`  - Element:`, element);
        console.log(`  - Position:`, window.getComputedStyle(element).position);
        console.log(`  - Z-index:`, window.getComputedStyle(element).zIndex);
        
        const controls = element.querySelector('.component-controls--dynamic');
        if (controls) {
            console.log(`  - Controls found:`, controls);
            console.log(`  - Controls display:`, window.getComputedStyle(controls).display);
            console.log(`  - Controls opacity:`, window.getComputedStyle(controls).opacity);
            console.log(`  - Controls visibility:`, window.getComputedStyle(controls).visibility);
            console.log(`  - Controls z-index:`, window.getComputedStyle(controls).zIndex);
            console.log(`  - Controls position:`, window.getComputedStyle(controls).position);
        } else {
            console.log(`  - ❌ No controls found`);
        }
    });
    
    // Step 2: Force attach controls to all components
    console.log('🔧 Force attaching controls to all components...');
    
    allComponents.forEach((element) => {
        const id = element.getAttribute('data-component-id');
        if (id && window.componentControlsManager) {
            // Remove any existing controls first
            const existingControls = element.querySelectorAll('.component-controls');
            existingControls.forEach(ctrl => ctrl.remove());
            
            // Force attach
            const success = window.componentControlsManager.attachControls(element, id);
            console.log(`  - ${id}: attachment ${success ? 'SUCCESS' : 'FAILED'}`);
        }
    });
    
    // Step 3: Create emergency controls CSS override
    console.log('💊 Applying emergency CSS override...');
    
    const emergencyCSS = `
        /* EMERGENCY COMPONENT CONTROLS OVERRIDE */
        .component-controls,
        .component-controls--dynamic {
            position: absolute !important;
            top: 8px !important;
            right: 8px !important;
            z-index: 999999 !important;
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: all !important;
            display: flex !important;
            background: rgba(0, 0, 0, 0.95) !important;
            border: 2px solid #0ea5e9 !important;
            border-radius: 6px !important;
            padding: 4px !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8) !important;
            transform: none !important;
            margin: 0 !important;
            width: auto !important;
            height: auto !important;
            overflow: visible !important;
            clip: none !important;
            clip-path: none !important;
        }
        
        .component-controls__toolbar,
        .component-controls__toolbar--dynamic {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            background: transparent !important;
        }
        
        .component-control {
            width: 28px !important;
            height: 28px !important;
            background: rgba(255, 255, 255, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 4px !important;
            color: white !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 14px !important;
            transition: all 0.2s ease !important;
            pointer-events: all !important;
            opacity: 1 !important;
            visibility: visible !important;
            position: relative !important;
            z-index: 999999 !important;
        }
        
        .component-control:hover {
            background: rgba(14, 165, 233, 0.8) !important;
            border-color: #0ea5e9 !important;
            transform: scale(1.1) !important;
        }
        
        .component-control svg {
            fill: none !important;
            stroke: currentColor !important;
            stroke-width: 2 !important;
            width: 14px !important;
            height: 14px !important;
        }
        
        /* Ensure parent components are positioned for controls */
        [data-component-id] {
            position: relative !important;
        }
        
        /* Remove any potential conflicts */
        .component-controls * {
            box-sizing: border-box !important;
        }
        
        /* Move controls group styling */
        .component-control-group--move {
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
            background: rgba(107, 114, 128, 0.3) !important;
            border: 1px solid rgba(107, 114, 128, 0.5) !important;
            border-radius: 4px !important;
            padding: 2px !important;
        }
        
        .component-control--move-up,
        .component-control--move-down {
            width: 20px !important;
            height: 20px !important;
        }
    `;
    
    // Remove existing emergency styles
    const existingStyle = document.getElementById('emergency-controls-override');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // Apply new styles
    const styleElement = document.createElement('style');
    styleElement.id = 'emergency-controls-override';
    styleElement.textContent = emergencyCSS;
    document.head.appendChild(styleElement);
    
    // Step 4: Force create controls manually if they don't exist
    console.log('🛠️ Creating emergency manual controls...');
    
    allComponents.forEach((element) => {
        const id = element.getAttribute('data-component-id');
        if (!id) return;
        
        let controls = element.querySelector('.component-controls--dynamic');
        
        if (!controls) {
            console.log(`Creating manual controls for ${id}`);
            
            // Create controls container
            controls = document.createElement('div');
            controls.className = 'component-controls component-controls--dynamic emergency-manual-controls';
            controls.setAttribute('data-controls-type', 'emergency-manual');
            
            // Create toolbar
            const toolbar = document.createElement('div');
            toolbar.className = 'component-controls__toolbar component-controls__toolbar--dynamic';
            
            // Create buttons
            const buttons = [
                { action: 'edit', title: 'Edit Component', icon: '✏️' },
                { action: 'duplicate', title: 'Duplicate Component', icon: '📄' },
                { action: 'delete', title: 'Delete Component', icon: '🗑️' }
            ];
            
            buttons.forEach(buttonConfig => {
                const button = document.createElement('button');
                button.className = `component-control component-control--${buttonConfig.action}`;
                button.setAttribute('data-action', buttonConfig.action);
                button.setAttribute('data-component-id', id);
                button.setAttribute('title', buttonConfig.title);
                button.textContent = buttonConfig.icon;
                button.type = 'button';
                
                // Add click handler
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🔘 EMERGENCY CONTROL CLICKED: ${buttonConfig.action} on ${id}`);
                    
                    // Show alert for now
                    alert(`${buttonConfig.action} action triggered for component: ${id}`);
                    
                    // Try to dispatch proper event
                    if (window.GMKB && window.GMKB.dispatch) {
                        window.GMKB.dispatch(`gmkb:component-${buttonConfig.action}-requested`, {
                            componentId: id,
                            source: 'emergency-manual-controls'
                        });
                    }
                });
                
                toolbar.appendChild(button);
            });
            
            controls.appendChild(toolbar);
            element.appendChild(controls);
            
            console.log(`✅ Manual controls created for ${id}`);
        }
    });
    
    // Step 5: Final visibility check
    setTimeout(() => {
        console.log('🔍 Final visibility check...');
        
        const allControls = document.querySelectorAll('.component-controls--dynamic, .emergency-manual-controls');
        console.log(`Found ${allControls.length} control groups after emergency fix`);
        
        allControls.forEach((controls, index) => {
            const rect = controls.getBoundingClientRect();
            const computed = window.getComputedStyle(controls);
            
            console.log(`Control group ${index + 1}:`);
            console.log(`  - Visible on screen:`, rect.width > 0 && rect.height > 0);
            console.log(`  - Position:`, rect.x, rect.y, rect.width, rect.height);
            console.log(`  - Computed opacity:`, computed.opacity);
            console.log(`  - Computed visibility:`, computed.visibility);
            console.log(`  - Computed display:`, computed.display);
            console.log(`  - Computed z-index:`, computed.zIndex);
        });
        
        // Add visual debugging border to all components
        allComponents.forEach(element => {
            element.style.border = '2px dashed rgba(0, 255, 0, 0.5)';
            element.style.minHeight = '100px';
        });
        
        console.log('🎉 EMERGENCY FIX COMPLETE!');
        console.log('💡 Component controls should now be visible in the top-right corner of each component');
        console.log('🔍 Look for components with green dashed borders');
        
    }, 500);
    
    // Step 6: Add global debugging flag
    window.GMKBEmergencyControlsActive = true;
    document.body.classList.add('gmkb-emergency-controls-active');
    
    // Step 7: Test function
    window.testEmergencyControls = () => {
        const controls = document.querySelectorAll('.component-controls--dynamic, .emergency-manual-controls');
        console.log('Testing emergency controls:', controls.length);
        
        controls.forEach((control, index) => {
            control.style.border = '3px solid red';
            control.style.background = 'rgba(255, 0, 0, 0.8)';
            
            setTimeout(() => {
                control.style.border = '2px solid #0ea5e9';
                control.style.background = 'rgba(0, 0, 0, 0.95)';
            }, 1000);
        });
    };
    
    console.log('🔧 Run testEmergencyControls() to flash the controls for visibility test');
    
})();
