/**
 * DOM State Checker - Simple diagnostic tool
 */

(function() {
    'use strict';
    
    window.checkDOMState = function() {
        console.group('🔍 DOM State Check');
        
        // Check containers
        const savedContainers = document.querySelectorAll('#saved-components-container');
        const previewContainers = document.querySelectorAll('#media-kit-preview');
        
        console.log(`saved-components-container count: ${savedContainers.length}`);
        console.log(`media-kit-preview count: ${previewContainers.length}`);
        
        // Check components
        const allComponents = document.querySelectorAll('[data-component-id]');
        const componentMap = new Map();
        
        allComponents.forEach(el => {
            const id = el.getAttribute('data-component-id');
            if (!componentMap.has(id)) {
                componentMap.set(id, []);
            }
            componentMap.get(id).push(el);
        });
        
        console.log(`Total components with data-component-id: ${allComponents.length}`);
        console.log(`Unique component IDs: ${componentMap.size}`);
        
        // Show duplicates
        const duplicates = [];
        componentMap.forEach((elements, id) => {
            if (elements.length > 1) {
                duplicates.push({ id, count: elements.length });
            }
        });
        
        if (duplicates.length > 0) {
            console.log('❌ DUPLICATES FOUND:');
            duplicates.forEach(({ id, count }) => {
                console.log(`  - ${id}: ${count} instances`);
            });
        } else {
            console.log('✅ No duplicates found');
        }
        
        console.groupEnd();
        
        return {
            containers: {
                saved: savedContainers.length,
                preview: previewContainers.length
            },
            components: {
                total: allComponents.length,
                unique: componentMap.size,
                duplicates: duplicates
            }
        };
    };
    
    // Also add a function to trace specific component
    window.traceComponent = function(componentId) {
        console.group(`🔍 Tracing component: ${componentId}`);
        
        const elements = document.querySelectorAll(`[data-component-id="${componentId}"]`);
        console.log(`Found ${elements.length} elements with this ID`);
        
        elements.forEach((el, index) => {
            console.log(`Element ${index + 1}:`);
            console.log(`  Parent: ${el.parentElement?.id || el.parentElement?.className || 'unknown'}`);
            console.log(`  HTML preview: ${el.outerHTML.substring(0, 100)}...`);
            
            // Trace up the DOM tree
            let parent = el.parentElement;
            const hierarchy = [];
            while (parent && parent !== document.body) {
                hierarchy.push({
                    tag: parent.tagName,
                    id: parent.id,
                    class: parent.className
                });
                parent = parent.parentElement;
            }
            console.log('  DOM hierarchy:', hierarchy);
        });
        
        console.groupEnd();
    };
    
    console.log('✅ DOM State Checker loaded. Use window.checkDOMState() or window.traceComponent(id)');
    
})();
