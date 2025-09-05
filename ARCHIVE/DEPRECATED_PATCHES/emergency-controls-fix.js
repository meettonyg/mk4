/**
 * Emergency Controls Fix Script
 * Run this to fix the controls visibility issue immediately
 */

window.emergencyControlsFix = function() {
    console.log('🚨 EMERGENCY CONTROLS FIX ACTIVATED');
    console.log('='.repeat(60));
    
    // Step 1: Remove visibility:hidden from all controls
    const allControls = document.querySelectorAll('.component-controls--dynamic');
    console.log(`Found ${allControls.length} control groups to fix`);
    
    allControls.forEach((controls, index) => {
        // Remove any inline visibility:hidden
        const currentStyle = controls.getAttribute('style') || '';
        const newStyle = currentStyle
            .replace(/visibility:\s*hidden\s*;?/gi, '')
            .replace(/pointer-events:\s*none\s*;?/gi, 'pointer-events: none;');
        controls.setAttribute('style', newStyle);
        
        console.log(`Fixed control group ${index + 1}`);
    });
    
    // Step 2: Override the hover behavior functions
    if (window.componentControlsManager) {
        // Store original attachHoverBehavior if exists
        const originalAttachHover = window.componentControlsManager.attachHoverBehavior;
        
        // Override with fixed version
        window.componentControlsManager.attachHoverBehavior = function(componentElement, controlsContainer) {
            let hoverTimeout = null;
            
            const showControls = () => {
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    hoverTimeout = null;
                }
                
                console.log('🎛️ Showing controls for:', componentElement.id);
                controlsContainer.style.opacity = '1';
                controlsContainer.style.pointerEvents = 'all';
                controlsContainer.style.transform = 'translateY(0)';
                // NO visibility:visible - let opacity handle it
            };
            
            const hideControls = () => {
                hoverTimeout = setTimeout(() => {
                    console.log('🎛️ Hiding controls for:', componentElement.id);
                    controlsContainer.style.opacity = '0';
                    controlsContainer.style.pointerEvents = 'none';
                    controlsContainer.style.transform = 'translateY(-2px)';
                    // NO visibility:hidden - let opacity handle it
                }, 100);
            };
            
            // Attach all the event listeners
            componentElement.addEventListener('mouseenter', showControls);
            componentElement.addEventListener('mouseleave', hideControls);
            componentElement.addEventListener('focus', showControls);
            componentElement.addEventListener('blur', hideControls);
            
            controlsContainer.addEventListener('mouseenter', showControls);
            controlsContainer.addEventListener('mouseleave', hideControls);
        };
        
        console.log('✅ Hover behavior override applied');
    }
    
    // Step 3: Re-attach controls to all components with fixed behavior
    const allComponents = document.querySelectorAll('[data-component-id]');
    let reattachedCount = 0;
    
    allComponents.forEach(component => {
        const componentId = component.getAttribute('data-component-id');
        const existingControls = component.querySelector('.component-controls--dynamic');
        
        if (existingControls) {
            // Remove and re-attach with fixed behavior
            existingControls.remove();
            if (window.componentControlsManager) {
                window.componentControlsManager.attachControls(component, componentId);
                reattachedCount++;
            }
        }
    });
    
    console.log(`✅ Re-attached controls to ${reattachedCount} components`);
    
    // Step 4: Add emergency CSS to override any remaining issues
    const styleId = 'emergency-controls-css';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
            /* Emergency Controls Fix CSS */
            .component-controls--dynamic {
                visibility: visible !important;
                transition: opacity 0.2s ease !important;
            }
            
            /* Hover state */
            [data-component-id]:hover .component-controls--dynamic {
                opacity: 1 !important;
                pointer-events: all !important;
            }
            
            /* Default state */
            .component-controls--dynamic:not(:hover) {
                opacity: 0;
                pointer-events: none;
            }
            
            /* Keep visible when hovering controls */
            .component-controls--dynamic:hover {
                opacity: 1 !important;
                pointer-events: all !important;
            }
        `;
        document.head.appendChild(styleEl);
        console.log('✅ Emergency CSS applied');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 EMERGENCY FIX COMPLETE!');
    console.log('Controls should now work on hover.');
    console.log('If they still don\'t appear, run: window.enableControlsDebug()');
    
    return {
        controlsFixed: allControls.length,
        componentsReattached: reattachedCount,
        cssApplied: true
    };
};

// Auto-run the fix after a brief delay
setTimeout(() => {
    console.log('Auto-running emergency controls fix...');
    window.emergencyControlsFix();
}, 1000);

console.log('Emergency controls fix loaded. Run window.emergencyControlsFix() to apply immediately.');
