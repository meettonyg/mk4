/**
 * @file debug-duplicate-controls.js
 * @description ROOT CAUSE DIAGNOSTIC: Debug script to identify why controls are appearing twice
 * Load this script to diagnose the duplicate controls issue
 */

(function() {
    'use strict';
    
    console.log('🔍 DUPLICATE CONTROLS DEBUGGER LOADED');
    
    // Track all control attachments
    window.controlAttachmentLog = [];
    
    // Override the attachControls method to log calls
    if (window.componentControlsManager) {
        const originalAttachControls = window.componentControlsManager.attachControls.bind(window.componentControlsManager);
        
        window.componentControlsManager.attachControls = function(componentElement, componentId) {
            const stack = new Error().stack;
            const entry = {
                componentId,
                timestamp: Date.now(),
                elementId: componentElement?.id,
                hasExistingControls: !!componentElement?.querySelector('.component-controls'),
                callStack: stack
            };
            
            window.controlAttachmentLog.push(entry);
            
            console.log('📎 attachControls called:', {
                componentId,
                hasExistingControls: entry.hasExistingControls,
                callNumber: window.controlAttachmentLog.filter(e => e.componentId === componentId).length
            });
            
            // Call original method
            return originalAttachControls(componentElement, componentId);
        };
    }
    
    // Monitor DOM mutations for control elements
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.classList) {
                    if (node.classList.contains('component-controls') || 
                        node.classList.contains('component-controls--dynamic')) {
                        
                        const parent = node.parentElement;
                        const componentId = parent?.getAttribute('data-component-id') || parent?.id;
                        
                        console.log('🎛️ Control element added to DOM:', {
                            componentId,
                            controlClass: node.className,
                            parentId: parent?.id,
                            timestamp: Date.now()
                        });
                    }
                }
            });
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Diagnostic function to analyze current state
    window.diagnoseDuplicateControls = function() {
        console.group('🔍 DUPLICATE CONTROLS DIAGNOSIS');
        
        // Find all components
        const allComponents = document.querySelectorAll('[data-component-id]');
        console.log(`Found ${allComponents.length} components in DOM`);
        
        const duplicateControlsFound = [];
        
        allComponents.forEach((component) => {
            const componentId = component.getAttribute('data-component-id');
            const controls = component.querySelectorAll('.component-controls, .component-controls--dynamic');
            
            if (controls.length > 1) {
                duplicateControlsFound.push({
                    componentId,
                    controlCount: controls.length,
                    element: component
                });
                
                console.warn(`❌ Component ${componentId} has ${controls.length} control sets!`);
                
                // Log details about each control set
                controls.forEach((control, index) => {
                    console.log(`  Control Set ${index + 1}:`, {
                        className: control.className,
                        parent: control.parentElement?.tagName,
                        hasToolbar: !!control.querySelector('.component-controls__toolbar'),
                        buttonCount: control.querySelectorAll('button').length
                    });
                });
            } else if (controls.length === 1) {
                console.log(`✅ Component ${componentId} has 1 control set (correct)`);
            } else {
                console.log(`⚠️ Component ${componentId} has NO controls`);
            }
        });
        
        // Check attachment log
        console.log('\n📋 Control Attachment Log:');
        const attachmentsByComponent = {};
        window.controlAttachmentLog.forEach((entry) => {
            if (!attachmentsByComponent[entry.componentId]) {
                attachmentsByComponent[entry.componentId] = [];
            }
            attachmentsByComponent[entry.componentId].push(entry);
        });
        
        Object.entries(attachmentsByComponent).forEach(([componentId, entries]) => {
            if (entries.length > 1) {
                console.warn(`Component ${componentId} had attachControls called ${entries.length} times!`);
                entries.forEach((entry, index) => {
                    console.log(`  Call ${index + 1} at ${new Date(entry.timestamp).toLocaleTimeString()}`);
                });
            }
        });
        
        console.log('\n📊 Summary:');
        console.log(`- Components with duplicate controls: ${duplicateControlsFound.length}`);
        console.log(`- Total control attachment calls: ${window.controlAttachmentLog.length}`);
        console.log(`- Unique components with attachments: ${Object.keys(attachmentsByComponent).length}`);
        
        console.groupEnd();
        
        return {
            duplicateControlsFound,
            attachmentLog: window.controlAttachmentLog,
            attachmentsByComponent
        };
    };
    
    // Auto-run diagnosis after 3 seconds
    setTimeout(() => {
        console.log('🔍 Running automatic diagnosis...');
        window.diagnoseDuplicateControls();
    }, 3000);
    
    console.log('💡 Use window.diagnoseDuplicateControls() to run diagnosis manually');
    
})();
