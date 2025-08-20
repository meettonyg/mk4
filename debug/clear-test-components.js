/**
 * @file clear-test-components.js
 * @description Utility to clear any test components that were added during debugging
 * 
 * USAGE: Run this once to clean up test components
 */

(function() {
    'use strict';
    
    console.log('🧹 CLEANUP: Removing test components...');
    
    function clearTestComponents() {
        let removedCount = 0;
        
        // Clear from state manager if available
        if (window.enhancedStateManager) {
            const state = window.enhancedStateManager.getState();
            const componentIds = Object.keys(state.components || {});
            
            componentIds.forEach(componentId => {
                const component = state.components[componentId];
                
                // Remove components that look like test components
                if (componentId.includes('test') || 
                    componentId.includes('hero-175') || // Debug timestamp pattern
                    componentId.includes('hero-1755712') || // Current debug session pattern
                    (component.props && component.props.title === 'Test Hero Component') ||
                    (component.props && component.props.subtitle === 'Added via diagnostic test')) {
                    
                    console.log(`🧹 Removing test component: ${componentId}`);
                    window.enhancedStateManager.removeComponent(componentId);
                    removedCount++;
                }
            });
        }
        
        // Clear from DOM
        const testElements = document.querySelectorAll('[id*="test"], [id*="hero-175"], [id*="hero-1755712"]');
        testElements.forEach(element => {
            if (element.id) {
                console.log(`🧹 Removing test element from DOM: ${element.id}`);
                element.remove();
                removedCount++;
            }
        });
        
        // Clear from localStorage
        try {
            const savedState = localStorage.getItem('guestifyMediaKitState');
            if (savedState) {
                const data = JSON.parse(savedState);
                if (data.components) {
                    const originalCount = Object.keys(data.components).length;
                    
                    // Filter out test components
                    const cleanComponents = {};
                    Object.keys(data.components).forEach(id => {
                        const component = data.components[id];
                        if (!id.includes('test') && 
                            !id.includes('hero-175') &&
                            !id.includes('hero-1755712') &&
                            !(component.props && component.props.title === 'Test Hero Component') &&
                            !(component.props && component.props.subtitle === 'Added via diagnostic test')) {
                            cleanComponents[id] = component;
                        } else {
                            console.log(`🧹 Removing test component from localStorage: ${id}`);
                            removedCount++;
                        }
                    });
                    
                    // Update localStorage if changes were made
                    if (Object.keys(cleanComponents).length !== originalCount) {
                        data.components = cleanComponents;
                        data.layout = data.layout.filter(id => cleanComponents[id]);
                        localStorage.setItem('guestifyMediaKitState', JSON.stringify(data));
                        console.log('🧹 Updated localStorage with clean state');
                    }
                }
            }
        } catch (error) {
            console.warn('Could not clean localStorage:', error);
        }
        
        // Force update empty state display
        if (window.enhancedComponentRenderer) {
            const currentState = window.enhancedStateManager?.getState() || { components: {} };
            window.enhancedComponentRenderer.updateEmptyState(currentState);
        }
        
        console.log(`✅ CLEANUP: Removed ${removedCount} test components`);
        
        // Show summary
        if (window.enhancedStateManager) {
            const finalState = window.enhancedStateManager.getState();
            const remainingCount = Object.keys(finalState.components || {}).length;
            console.log(`📊 CLEANUP: ${remainingCount} components remaining`);
            
            if (remainingCount === 0) {
                console.log('✅ CLEANUP: Media kit is now clean (empty state)');
            } else {
                console.log('📋 CLEANUP: Remaining components:', Object.keys(finalState.components));
            }
        }
        
        return removedCount;
    }
    
    // Run cleanup immediately on load if there are existing test components
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Wait for systems to be ready
            setTimeout(clearTestComponents, 2000);
        });
    } else {
        // Run immediately if DOM is already ready
        setTimeout(clearTestComponents, 1000);
    }
    
    // Expose function for manual use
    window.clearTestComponents = clearTestComponents;
    
    console.log('🧹 Test component cleanup script loaded');
    
})();
