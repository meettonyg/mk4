/**
 * Fix for Component Displacement from Sections
 * ROOT FIX: Ensures components remain in their assigned sections
 * 
 * Issue: After UI cleanup, components may be displaced from sections
 * Solution: Re-establish component-section relationships on any re-render
 */

(function() {
    'use strict';
    
    console.log('🔧 Component-Section Fix: Initializing...');
    
    let isMonitoring = false;
    
    /**
     * Ensure components are in their assigned sections
     */
    function ensureComponentsInSections() {
        // Get state to find component-section assignments
        const state = window.enhancedStateManager?.getState();
        if (!state || !state.sections) return;
        
        // Process each section
        state.sections.forEach(section => {
            if (!section.components || section.components.length === 0) return;
            
            const sectionElement = document.getElementById(`section-${section.section_id}`);
            if (!sectionElement) return;
            
            // Process each component assignment in this section
            section.components.forEach(assignment => {
                const { component_id, column } = assignment;
                const componentElement = document.querySelector(`[data-component-id="${component_id}"]`);
                
                if (componentElement) {
                    // Find the correct target container
                    let targetContainer = null;
                    
                    // Check for multi-column layout
                    const columns = sectionElement.querySelectorAll('.gmkb-section__column');
                    if (columns.length > 0) {
                        // Multi-column section
                        const targetColumn = Math.min(column || 1, columns.length) - 1;
                        targetContainer = columns[targetColumn];
                    } else {
                        // Single column section
                        targetContainer = sectionElement.querySelector('.gmkb-section__content, .gmkb-section__inner');
                    }
                    
                    if (targetContainer && componentElement.parentElement !== targetContainer) {
                        // Component is not in the right container - move it
                        console.log(`🔄 Moving component ${component_id} to section ${section.section_id}, column ${column || 1}`);
                        
                        // Remove any empty placeholders from the target
                        const placeholder = targetContainer.querySelector('.gmkb-section__empty');
                        if (placeholder) {
                            placeholder.remove();
                        }
                        
                        // Move the component
                        targetContainer.appendChild(componentElement);
                    }
                }
            });
        });
    }
    
    /**
     * Monitor for component displacement
     */
    function startMonitoring() {
        if (isMonitoring) return;
        isMonitoring = true;
        
        // Check on various events that might cause displacement
        const events = [
            'gmkb:component-rendered',
            'gmkb:component-updated', 
            'gmkb:sections-rendered',
            'gmkb:design-panel-opened'
        ];
        
        events.forEach(eventName => {
            document.addEventListener(eventName, () => {
                // Small delay to let DOM settle
                setTimeout(() => {
                    ensureComponentsInSections();
                }, 100);
            });
        });
        
        // Also monitor DOM mutations for displaced components
        const observer = new MutationObserver((mutations) => {
            let checkNeeded = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    // Check if any components were moved
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute('data-component-id')) {
                            checkNeeded = true;
                        }
                    });
                }
            });
            
            if (checkNeeded) {
                setTimeout(() => {
                    ensureComponentsInSections();
                }, 100);
            }
        });
        
        // Observe the main containers
        const containers = [
            document.getElementById('saved-components-container'),
            document.getElementById('gmkb-sections-container'),
            document.getElementById('components-direct-container')
        ];
        
        containers.forEach(container => {
            if (container) {
                observer.observe(container, {
                    childList: true,
                    subtree: true
                });
            }
        });
        
        console.log('✅ Component-Section Fix: Monitoring active');
    }
    
    /**
     * Initialize when systems are ready
     */
    function initialize() {
        // Initial check
        ensureComponentsInSections();
        
        // Start monitoring
        startMonitoring();
        
        console.log('✅ Component-Section Fix: Initialized');
    }
    
    // Wait for systems to be ready
    if (window.enhancedStateManager && window.sectionRenderer) {
        initialize();
    } else {
        document.addEventListener('gmkb:core-systems-ready', initialize);
    }
    
    // Also initialize on DOM ready as fallback
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initialize, 1000);
        });
    } else {
        setTimeout(initialize, 1000);
    }
    
    // Global API for manual fixes
    window.fixComponentSections = {
        check: ensureComponentsInSections,
        status: () => {
            const state = window.enhancedStateManager?.getState();
            const sections = state?.sections || [];
            const components = Object.values(state?.components || {});
            
            console.log('Component-Section Status:');
            console.log(`- Sections: ${sections.length}`);
            console.log(`- Components: ${components.length}`);
            
            sections.forEach(section => {
                const sectionComponents = section.components || [];
                console.log(`- Section ${section.section_id}: ${sectionComponents.length} components`);
            });
            
            return {
                monitoring: isMonitoring,
                sections: sections.length,
                components: components.length
            };
        }
    };
    
})();
