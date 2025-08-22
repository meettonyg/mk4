/**
 * @file duplication-detector.js
 * @description ROOT CAUSE DETECTOR: Find what's duplicating components
 * 
 * This debug script uses MutationObserver to track DOM mutations
 * and identify the source of component duplication
 */

(function() {
    'use strict';
    
    console.log('🔍 ROOT CAUSE DETECTOR: Duplication detector activated');
    
    // Track all mutations to find duplication source
    const mutationLog = [];
    let observerActive = false;
    
    // Create mutation observer
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Check for added nodes with data-component-id
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if this element or its children have data-component-id
                        const componentsAdded = [];
                        
                        if (node.hasAttribute && node.hasAttribute('data-component-id')) {
                            componentsAdded.push({
                                id: node.getAttribute('data-component-id'),
                                element: node
                            });
                        }
                        
                        // Check children
                        if (node.querySelectorAll) {
                            const childComponents = node.querySelectorAll('[data-component-id]');
                            childComponents.forEach(child => {
                                componentsAdded.push({
                                    id: child.getAttribute('data-component-id'),
                                    element: child
                                });
                            });
                        }
                        
                        if (componentsAdded.length > 0) {
                            const logEntry = {
                                timestamp: Date.now(),
                                target: mutation.target,
                                targetId: mutation.target.id,
                                targetClass: mutation.target.className,
                                componentsAdded: componentsAdded,
                                stack: new Error().stack
                            };
                            
                            mutationLog.push(logEntry);
                            
                            // Check for duplicates immediately
                            componentsAdded.forEach(comp => {
                                const allWithId = document.querySelectorAll(`[data-component-id="${comp.id}"]`);
                                if (allWithId.length > 1) {
                                    console.error(`🚨 DUPLICATION DETECTED: Component ${comp.id} now has ${allWithId.length} instances!`);
                                    console.log('Mutation that caused it:', logEntry);
                                    console.log('Stack trace:', logEntry.stack);
                                    
                                    // Log parent hierarchy
                                    let parent = mutation.target;
                                    const hierarchy = [];
                                    while (parent && parent !== document.body) {
                                        hierarchy.push({
                                            tag: parent.tagName,
                                            id: parent.id,
                                            class: parent.className
                                        });
                                        parent = parent.parentElement;
                                    }
                                    console.log('Parent hierarchy:', hierarchy);
                                }
                            });
                        }
                    }
                });
            }
            
            // Also check for attribute mutations on data-component-id
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-component-id') {
                console.log('data-component-id attribute changed:', {
                    target: mutation.target,
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.getAttribute('data-component-id')
                });
            }
        });
    });
    
    // Start observing
    window.startDuplicationDetector = function() {
        if (observerActive) {
            console.log('Duplication detector already active');
            return;
        }
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ['data-component-id']
        });
        
        observerActive = true;
        console.log('✅ Duplication detector started - monitoring all DOM mutations');
    };
    
    // Stop observing
    window.stopDuplicationDetector = function() {
        observer.disconnect();
        observerActive = false;
        console.log('🛑 Duplication detector stopped');
    };
    
    // Get mutation log
    window.getDuplicationLog = function() {
        return mutationLog;
    };
    
    // Clear log
    window.clearDuplicationLog = function() {
        mutationLog.length = 0;
        console.log('Log cleared');
    };
    
    // Analyze current DOM for duplicates
    window.analyzeDuplicates = function() {
        const componentMap = new Map();
        const duplicates = [];
        
        // Find all elements with data-component-id
        const allComponents = document.querySelectorAll('[data-component-id]');
        
        allComponents.forEach((element) => {
            const id = element.getAttribute('data-component-id');
            if (!componentMap.has(id)) {
                componentMap.set(id, []);
            }
            componentMap.get(id).push(element);
        });
        
        // Find duplicates
        componentMap.forEach((elements, id) => {
            if (elements.length > 1) {
                duplicates.push({
                    id: id,
                    count: elements.length,
                    elements: elements,
                    locations: elements.map(el => ({
                        parent: el.parentElement?.id || el.parentElement?.className || 'unknown',
                        html: el.outerHTML.substring(0, 100) + '...'
                    }))
                });
            }
        });
        
        console.group('🔍 Duplicate Analysis');
        console.log(`Total components: ${allComponents.length}`);
        console.log(`Unique IDs: ${componentMap.size}`);
        console.log(`Duplicated IDs: ${duplicates.length}`);
        
        if (duplicates.length > 0) {
            console.log('Duplicates found:');
            duplicates.forEach(dup => {
                console.log(`- ${dup.id}: ${dup.count} instances`);
                dup.locations.forEach((loc, i) => {
                    console.log(`  ${i + 1}. Parent: ${loc.parent}`);
                });
            });
        }
        
        console.groupEnd();
        
        return duplicates;
    };
    
    // Auto-start on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.startDuplicationDetector();
        });
    } else {
        window.startDuplicationDetector();
    }
    
})();
