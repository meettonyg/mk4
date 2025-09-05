 * @file emergency-blank-screen-fix.js
 * @description Emergency patch for blank screen issue after component addition
 * PLACE THIS SCRIPT BEFORE component renderer initialization
 */

(function() {
    'use strict';
    
    console.log('🚨 EMERGENCY BLANK SCREEN FIX: Loading...');
    
    // Wait for enhanced component renderer to be available
    function waitForRenderer() {
        if (window.enhancedComponentRenderer) {
            applyFix();
        } else {
            setTimeout(waitForRenderer, 100);
        }
    }
    
    function applyFix() {
        const originalRenderSavedComponents = window.enhancedComponentRenderer.renderSavedComponents;
        
        // Override the problematic renderSavedComponents method
        window.enhancedComponentRenderer.renderSavedComponents = async function(initialState) {
            console.log('🚨 EMERGENCY FIX: Using safe renderSavedComponents');
            
            if (!initialState || !initialState.components) {
                console.warn('EMERGENCY FIX: No initial state or components');
                return false;
            }
            
            try {
                const componentCount = Object.keys(initialState.components).length;
                console.log(`🚨 EMERGENCY FIX: Rendering ${componentCount} saved components SAFELY`);
                
                // EMERGENCY FIX: Always use preview container, don't manipulate containers
                let targetContainer = document.getElementById('media-kit-preview');
                
                if (!targetContainer) {
                    console.error('EMERGENCY FIX: No preview container found');
                    return false;
                }
                
                console.log('🚨 EMERGENCY FIX: Using preview container directly (no container switching)');
                
                // EMERGENCY FIX: Don't clear container, just append to it
                // targetContainer.innerHTML = ''; // COMMENTED OUT
                
                // Render components
                const componentIds = Object.keys(initialState.components);
                console.log(`🚨 EMERGENCY FIX: Processing ${componentIds.length} components`);
                
                for (const componentId of componentIds) {
                    try {
                        const componentState = initialState.components[componentId];
                        if (!componentState) {
                            console.warn(`EMERGENCY FIX: No state for ${componentId}`);
                            continue;
                        }
                        
                        // Check if component already exists
                        if (document.getElementById(componentId)) {
                            console.log(`🚨 EMERGENCY FIX: Component ${componentId} already exists, skipping`);
                            continue;
                        }
                        
                        const result = await this.renderComponentWithLoader(
                            componentId,
                            componentState.type,
                            componentState.props || componentState.data || {}
                        );
                        
                        if (result && result.element) {
                            targetContainer.appendChild(result.element);
                            this.componentCache.set(componentId, result.element);
                            
                            // Register with UI registry
                            this.registerComponentWithUIRegistry(componentId, result.element, componentState);
                            
                            console.log(`🚨 EMERGENCY FIX: Successfully rendered ${componentId}`);
                        } else {
                            console.error(`🚨 EMERGENCY FIX: Failed to render ${componentId}`);
                        }
                        
                    } catch (componentError) {
                        console.error(`🚨 EMERGENCY FIX: Error rendering ${componentId}:`, componentError);
                    }
                }
                
                // EMERGENCY FIX: Don't manipulate empty state visibility
                console.log('🚨 EMERGENCY FIX: Skipping empty state manipulation');
                
                const finalChildCount = targetContainer.children.length;
                console.log(`🚨 EMERGENCY FIX: Completed - ${finalChildCount} total children in container`);
                
                return finalChildCount > 0;
                
            } catch (error) {
                console.error('🚨 EMERGENCY FIX: Critical error:', error);
                return false;
            }
        };
        
        console.log('✅ EMERGENCY BLANK SCREEN FIX: Applied successfully');
    }
    
    // Apply fix when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForRenderer);
    } else {
        waitForRenderer();
    }
    
})();

// Quick manual fix function
window.emergencyUnblankScreen = function() {
    console.log('🚨 EMERGENCY UNBLANK: Starting...');
    
    // Force show all important containers
    const containers = [
        'media-kit-preview',
        'saved-components-container', 
        'media-kit-builder-container',
        'guestify-container'
    ];
    
    containers.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
            console.log(`✅ EMERGENCY UNBLANK: Showed ${id}`);
        }
    });
    
    // Force show body
    document.body.style.display = 'block';
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    
    // Try to render manually
    if (window.enhancedComponentRenderer) {
        window.enhancedComponentRenderer.render();
        console.log('✅ EMERGENCY UNBLANK: Triggered manual render');
    }
    
    console.log('🚨 EMERGENCY UNBLANK: Complete');
};

console.log('🚨 Emergency Blank Screen Fix loaded. Use emergencyUnblankScreen() if needed.');
