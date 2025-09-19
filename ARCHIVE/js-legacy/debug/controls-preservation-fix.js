/**
 * Fix for controls disappearing after component updates
 * This ensures controls are preserved during all update operations
 */

(function() {
    'use strict';
    
    console.log('🔧 Applying controls preservation fix for updates...');
    
    // Store original functions
    const originalFunctions = {};
    
    // Wait for renderer to be available
    const applyFix = () => {
        if (!window.enhancedComponentRenderer) {
            setTimeout(applyFix, 100);
            return;
        }
        
        const renderer = window.enhancedComponentRenderer;
        
        // Store original handleComponentRerenderRequest
        originalFunctions.handleComponentRerenderRequest = renderer.handleComponentRerenderRequest;
        
        // Override with controls-preserving version
        renderer.handleComponentRerenderRequest = async function({ componentId, element, state }) {
            try {
                const perfEnd = window.performanceMonitor ? window.performanceMonitor.start('component-rerender', { componentId }) : () => {};
                
                console.log('🔧 Controls-preserving re-render for:', componentId);
                
                // Get the current element
                const currentElement = element || document.getElementById(componentId);
                if (!currentElement) {
                    console.warn('No element found for re-render:', componentId);
                    perfEnd();
                    return;
                }
                
                // CRITICAL: Save the controls element BEFORE any updates
                const controlsElement = currentElement.querySelector('.component-controls--dynamic');
                const hasControls = !!controlsElement;
                let savedControls = null;
                
                if (hasControls) {
                    // Clone the controls to preserve all event listeners and state
                    savedControls = controlsElement.cloneNode(true);
                    console.log('📌 Saved controls for:', componentId);
                }
                
                // Check if update is actually needed (dirty check)
                const currentProps = currentElement.dataset.props ? JSON.parse(currentElement.dataset.props) : {};
                const newProps = state.props || state.data || {};
                
                if (JSON.stringify(currentProps) === JSON.stringify(newProps)) {
                    console.log('Props unchanged, skipping re-render for:', componentId);
                    perfEnd();
                    return;
                }
                
                // Render new content
                const { element: newElement } = await renderer.renderComponentWithLoader(
                    componentId, 
                    state.type, 
                    state.props || state.data
                );
                
                if (!newElement) {
                    console.error('Failed to render new element for:', componentId);
                    perfEnd();
                    return;
                }
                
                // SMART UPDATE: Only update the content, not the controls
                if (currentElement && currentElement.parentNode) {
                    // Remove controls from current element temporarily
                    if (controlsElement) {
                        controlsElement.remove();
                    }
                    
                    // Update content while preserving the element itself
                    const contentToUpdate = [];
                    
                    // Copy all children except controls
                    Array.from(newElement.childNodes).forEach(child => {
                        if (!child.classList || !child.classList.contains('component-controls--dynamic')) {
                            contentToUpdate.push(child.cloneNode(true));
                        }
                    });
                    
                    // Clear current content (except controls which we already removed)
                    while (currentElement.firstChild) {
                        currentElement.removeChild(currentElement.firstChild);
                    }
                    
                    // Add new content
                    contentToUpdate.forEach(child => {
                        currentElement.appendChild(child);
                    });
                    
                    // Copy attributes from new element
                    Array.from(newElement.attributes).forEach(attr => {
                        if (attr.name !== 'id' && attr.name !== 'data-component-id') {
                            currentElement.setAttribute(attr.name, attr.value);
                        }
                    });
                    
                    // Store updated props
                    currentElement.dataset.props = JSON.stringify(state.props || state.data || {});
                    
                    // CRITICAL: Restore controls
                    if (hasControls) {
                        // Re-attach controls at the beginning
                        currentElement.insertBefore(savedControls, currentElement.firstChild);
                        console.log('✅ Controls restored for:', componentId);
                        
                        // Re-initialize hover behavior since we cloned the element
                        if (window.componentControlsManager && window.componentControlsManager.attachHoverBehavior) {
                            window.componentControlsManager.attachHoverBehavior(currentElement, savedControls);
                        }
                    } else {
                        // No controls before, try to attach new ones
                        if (window.componentControlsManager) {
                            window.componentControlsManager.attachControls(currentElement, componentId);
                        }
                    }
                    
                    // Update cache
                    renderer.componentCache.set(componentId, currentElement);
                }
                
                perfEnd();
                
                console.log('✅ Component re-rendered with controls preserved:', componentId);
                
            } catch (error) {
                console.error('Failed to re-render component:', componentId, error);
            }
        };
        
        // Also override updateComponents method
        originalFunctions.updateComponents = renderer.updateComponents;
        
        renderer.updateComponents = async function(componentIds, newState) {
            console.log('🔧 Controls-preserving batch update for', componentIds.size, 'components');
            
            const updatePromises = Array.from(componentIds).map(async (id) => {
                const componentState = newState.components[id];
                const oldElement = this.componentCache.get(id) || document.getElementById(id);
                
                if (oldElement && componentState) {
                    // Use our controls-preserving re-render
                    await this.handleComponentRerenderRequest({
                        componentId: id,
                        element: oldElement,
                        state: componentState
                    });
                }
            });
            
            await Promise.all(updatePromises);
            
            console.log('✅ Batch update completed with controls preserved');
        };
        
        console.log('✅ Controls preservation fix applied successfully!');
        console.log('Controls should now persist through all component updates.');
    };
    
    // Apply the fix
    applyFix();
    
    // Also provide manual fix function
    window.fixControlsPreservation = () => {
        applyFix();
        console.log('Controls preservation fix re-applied');
    };
    
    // Test function to verify the fix
    window.testControlsPreservation = async (componentId) => {
        if (!componentId) {
            const firstComponent = document.querySelector('[data-component-id]');
            if (firstComponent) {
                componentId = firstComponent.getAttribute('data-component-id');
            } else {
                console.error('No components found to test');
                return;
            }
        }
        
        console.log('🧪 Testing controls preservation for:', componentId);
        
        const element = document.getElementById(componentId);
        if (!element) {
            console.error('Component not found:', componentId);
            return;
        }
        
        // Check current controls
        const controlsBefore = element.querySelector('.component-controls--dynamic');
        console.log('Controls before update:', controlsBefore ? 'PRESENT' : 'MISSING');
        
        // Trigger a re-render
        if (window.eventBus) {
            window.eventBus.emit('ui:component-needs-render', {
                componentId,
                element,
                state: {
                    type: element.dataset.componentType || 'unknown',
                    props: { test: Date.now() }
                }
            });
        }
        
        // Check controls after a delay
        setTimeout(() => {
            const controlsAfter = element.querySelector('.component-controls--dynamic');
            console.log('Controls after update:', controlsAfter ? 'PRESENT ✅' : 'MISSING ❌');
            
            if (controlsAfter) {
                // Test hover
                console.log('Testing hover behavior...');
                element.dispatchEvent(new MouseEvent('mouseenter'));
                setTimeout(() => {
                    console.log('Controls opacity:', controlsAfter.style.opacity);
                    console.log('Controls pointer-events:', controlsAfter.style.pointerEvents);
                }, 100);
            }
        }, 1000);
    };
    
})();

console.log('Controls preservation fix loaded. The fix will apply automatically.');
console.log('Test with: window.testControlsPreservation()');
