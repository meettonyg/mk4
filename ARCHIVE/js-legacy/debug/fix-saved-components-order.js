/**
 * @file fix-saved-components-order.js
 * @description Emergency fix for saved_components rendering order
 * ROOT FIX: Forces renderer to use correct component order from WordPress data
 */

(function() {
    'use strict';
    
    // Expose fix function globally
    window.fixSavedComponentsOrder = function() {
        console.log('🔧 EMERGENCY FIX: Attempting to fix saved components order...');
        
        try {
            // Step 1: Get WordPress data
            const wpData = window.gmkbData || window.guestifyData || window.MKCG;
            if (!wpData || !wpData.saved_components || !Array.isArray(wpData.saved_components)) {
                console.error('❌ No saved_components array found in WordPress data');
                return false;
            }
            
            console.log('✅ Found saved_components array with', wpData.saved_components.length, 'components');
            const correctOrder = wpData.saved_components.map(c => c.id);
            console.log('✅ Correct order should be:', correctOrder);
            
            // Step 2: Check current DOM order
            const container = document.getElementById('saved-components-container') || document.getElementById('media-kit-preview');
            if (!container) {
                console.error('❌ No container found for components');
                return false;
            }
            
            const currentOrder = Array.from(container.children).map(c => c.id).filter(id => id);
            console.log('📋 Current DOM order:', currentOrder);
            
            // Step 3: Check if reorder is needed
            const orderMatches = JSON.stringify(correctOrder) === JSON.stringify(currentOrder);
            if (orderMatches) {
                console.log('✅ Components are already in correct order');
                return true;
            }
            
            console.log('🔄 Reordering components to match saved_components order...');
            
            // Step 4: Reorder DOM elements
            const fragment = document.createDocumentFragment();
            let reorderedCount = 0;
            
            correctOrder.forEach(componentId => {
                const element = document.getElementById(componentId);
                if (element && element.parentElement === container) {
                    fragment.appendChild(element);
                    reorderedCount++;
                    console.log(`✅ Moved ${componentId} to correct position`);
                } else if (element) {
                    console.warn(`⚠️ Component ${componentId} found but not in expected container`);
                } else {
                    console.warn(`⚠️ Component ${componentId} not found in DOM`);
                }
            });
            
            // Clear container and append reordered elements
            container.innerHTML = '';
            container.appendChild(fragment);
            
            // Step 5: Verify fix
            const finalOrder = Array.from(container.children).map(c => c.id).filter(id => id);
            const fixSuccess = JSON.stringify(correctOrder) === JSON.stringify(finalOrder);
            
            console.log('🎯 Final DOM order:', finalOrder);
            console.log(fixSuccess ? '✅ SUCCESS: Components reordered correctly!' : '❌ FAILED: Reorder did not work');
            
            // Step 6: Update state manager to match
            if (fixSuccess && window.enhancedStateManager) {
                try {
                    window.enhancedStateManager.setLayout(correctOrder);
                    console.log('✅ Updated state manager layout to match DOM order');
                } catch (error) {
                    console.warn('⚠️ Could not update state manager layout:', error.message);
                }
            }
            
            return fixSuccess;
            
        } catch (error) {
            console.error('❌ Error during fix:', error);
            return false;
        }
    };
    
    // Also expose a function to force re-render with correct order
    window.forceRerenderWithCorrectOrder = async function() {
        console.log('🔧 FORCE RE-RENDER: Forcing components to re-render in correct order...');
        
        try {
            const wpData = window.gmkbData || window.guestifyData || window.MKCG;
            if (!wpData || !wpData.saved_components) {
                console.error('❌ No saved_components data available');
                return false;
            }
            
            // Create corrected state with saved_components
            const correctedState = {
                components: {},
                layout: wpData.saved_components.map(c => c.id),
                saved_components: wpData.saved_components,
                globalSettings: wpData.global_settings || {},
                version: '2.2.0'
            };
            
            // Convert saved_components to components object format
            wpData.saved_components.forEach(comp => {
                correctedState.components[comp.id] = comp;
            });
            
            console.log('✅ Created corrected state:', correctedState);
            
            // Force state manager to use corrected state
            if (window.enhancedStateManager) {
                // Clear current state
                window.enhancedStateManager.state = correctedState;
                console.log('✅ Updated state manager with corrected state');
                
                // Force re-render
                if (window.enhancedComponentRenderer) {
                    await window.enhancedComponentRenderer.renderSavedComponents(correctedState);
                    console.log('✅ Forced re-render complete');
                    return true;
                } else {
                    console.error('❌ Component renderer not available');
                }
            } else {
                console.error('❌ State manager not available');
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Error during force re-render:', error);
            return false;
        }
    };
    
    // Expose shortcuts
    window.fixOrder = window.fixSavedComponentsOrder;
    window.forceRerender = window.forceRerenderWithCorrectOrder;
    
    console.log('🔧 COMPONENT ORDER FIXER LOADED: Use fixSavedComponentsOrder() or fixOrder() to fix order');
    console.log('🔧 FORCE RE-RENDER LOADED: Use forceRerenderWithCorrectOrder() or forceRerender() to force re-render');
    
})();
