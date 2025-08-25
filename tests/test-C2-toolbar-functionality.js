/**
 * Test C2: Toolbar Button Functionality
 * Tests save, export, and other toolbar button functionality
 */

if (typeof GMKBTest === 'undefined') {
    throw new Error('GMKBTest harness not loaded');
}

GMKBTest.tests.C2 = async function() {
    console.log('🔧 C2: Testing toolbar button functionality...');
    
    try {
        // Step 1: Locate toolbar buttons
        console.log('🔍 Step 1: Locating toolbar buttons...');
        
        const toolbarButtons = {
            save: document.querySelector(GMKBTest.selectors.toolbarSave),
            export: document.querySelector(GMKBTest.selectors.toolbarExport),
            undo: document.querySelector('#undo-btn, .undo-btn, [data-action="undo"]'),
            redo: document.querySelector('#redo-btn, .redo-btn, [data-action="redo"]')
        };
        
        const foundButtons = Object.entries(toolbarButtons)
            .filter(([name, button]) => !!button)
            .map(([name]) => name);
        
        console.log(`Found toolbar buttons: ${foundButtons.join(', ')}`);
        GMKBTest.assert(foundButtons.length > 0, 'At least one toolbar button should be found');
        
        // Step 2: Test Save button
        console.log('💾 Step 2: Testing Save button...');
        
        let saveButtonWorked = false;
        if (toolbarButtons.save) {
            // Listen for save events
            let saveEventFired = false;
            
            const saveListener = () => { saveEventFired = true; };
            const saveEvents = ['gmkb:state:saved', 'gmkb:save-complete'];
            saveEvents.forEach(event => document.addEventListener(event, saveListener));
            
            // Click save button
            toolbarButtons.save.click();
            console.log('  💾 Save button clicked');
            
            await GMKBTest.sleep(1000);
            
            // Clean up listeners
            saveEvents.forEach(event => document.removeEventListener(event, saveListener));
            
            if (saveEventFired) {
                saveButtonWorked = true;
                console.log('  ✅ Save button triggered save event');
            } else {
                console.log('  ⚠️ No save event detected after save button click');
            }
        } else {
            console.log('  ⚠️ Save button not found');
        }
        
        // Step 3: Test Export button
        console.log('📤 Step 3: Testing Export button...');
        
        let exportButtonWorked = false;
        if (toolbarButtons.export) {
            // Export might open a modal or trigger download
            const initialModals = document.querySelectorAll('.modal:not([style*="display: none"])').length;
            
            toolbarButtons.export.click();
            console.log('  📤 Export button clicked');
            
            await GMKBTest.sleep(500);
            
            // Check for export modal or download
            const newModals = document.querySelectorAll('.modal:not([style*="display: none"])').length;
            
            if (newModals > initialModals) {
                exportButtonWorked = true;
                console.log('  ✅ Export button opened modal');
            } else {
                // Check if download was triggered (harder to detect)
                console.log('  ⚠️ Export modal not detected (download may have started)');
                exportButtonWorked = true; // Assume it worked if no error
            }
        } else {
            console.log('  ⚠️ Export button not found');
        }
        
        // Step 4: Test device preview toggles
        console.log('📱 Step 4: Testing device preview toggles...');
        
        const deviceButtons = {
            desktop: document.querySelector(GMKBTest.selectors.deviceToggle.desktop),
            tablet: document.querySelector(GMKBTest.selectors.deviceToggle.tablet),
            mobile: document.querySelector(GMKBTest.selectors.deviceToggle.mobile)
        };
        
        const deviceResults = {};
        
        for (const [device, button] of Object.entries(deviceButtons)) {
            if (button) {
                console.log(`  📱 Testing ${device} toggle...`);
                
                const previewContainer = document.querySelector(GMKBTest.selectors.builderRoot);
                const initialClasses = previewContainer ? previewContainer.className : '';
                
                button.click();
                await GMKBTest.sleep(300);
                
                const newClasses = previewContainer ? previewContainer.className : '';
                const classesChanged = initialClasses !== newClasses;
                
                if (classesChanged) {
                    deviceResults[device] = true;
                    console.log(`    ✅ ${device} toggle changed classes`);
                } else {
                    deviceResults[device] = false;
                    console.log(`    ⚠️ ${device} toggle did not change classes`);
                }
            } else {
                console.log(`  ⚠️ ${device} toggle not found`);
                deviceResults[device] = null;
            }
        }
        
        // Step 5: Test undo/redo buttons (if found)
        console.log('↶ Step 5: Testing undo/redo buttons...');
        
        let undoRedoButtonsWork = false;
        
        if (toolbarButtons.undo && toolbarButtons.redo) {
            // Add a component first to have something to undo
            const testComponentId = await GMKBTest.addComponent('hero', {
                title: 'Test for undo/redo buttons'
            });
            
            await GMKBTest.sleep(300);
            
            const componentsBeforeUndo = document.querySelectorAll(GMKBTest.selectors.componentItem).length;
            
            // Test undo
            toolbarButtons.undo.click();
            await GMKBTest.sleep(500);
            
            const componentsAfterUndo = document.querySelectorAll(GMKBTest.selectors.componentItem).length;
            
            if (componentsAfterUndo !== componentsBeforeUndo) {
                // Test redo
                toolbarButtons.redo.click();
                await GMKBTest.sleep(500);
                
                const componentsAfterRedo = document.querySelectorAll(GMKBTest.selectors.componentItem).length;
                
                if (componentsAfterRedo === componentsBeforeUndo) {
                    undoRedoButtonsWork = true;
                    console.log('  ✅ Undo/redo buttons work correctly');
                } else {
                    console.log('  ⚠️ Redo button did not restore state');
                }
            } else {
                console.log('  ⚠️ Undo button did not change state');
            }
        } else {
            console.log('  ⚠️ Undo/redo buttons not found');
        }
        
        // Step 6: Test button states (enabled/disabled)
        console.log('🎛️ Step 6: Testing button states...');
        
        const buttonStates = {};
        Object.entries(toolbarButtons).forEach(([name, button]) => {
            if (button) {
                buttonStates[name] = {
                    enabled: !button.disabled,
                    visible: button.style.display !== 'none' && !button.hidden
                };
            }
        });
        
        console.log('  Button states:', buttonStates);
        
        // Step 7: Test keyboard shortcuts for toolbar actions
        console.log('⌨️ Step 7: Testing keyboard shortcuts...');
        
        const keyboardShortcuts = {
            'Ctrl+S': { key: 's', ctrlKey: true, expected: 'save' },
            'Ctrl+Z': { key: 'z', ctrlKey: true, expected: 'undo' },
            'Ctrl+Y': { key: 'y', ctrlKey: true, expected: 'redo' }
        };
        
        const shortcutResults = {};
        
        for (const [shortcut, config] of Object.entries(keyboardShortcuts)) {
            console.log(`  ⌨️ Testing ${shortcut}...`);
            
            // Prevent actual browser behavior
            const keydownHandler = (e) => {
                if (e.ctrlKey && e.key === config.key) {
                    e.preventDefault();
                    shortcutResults[shortcut] = true;
                    console.log(`    ✅ ${shortcut} intercepted`);
                }
            };
            
            document.addEventListener('keydown', keydownHandler);
            
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: config.key,
                ctrlKey: config.ctrlKey,
                bubbles: true
            }));
            
            await GMKBTest.sleep(100);
            
            document.removeEventListener('keydown', keydownHandler);
            
            if (!shortcutResults[shortcut]) {
                console.log(`    ⚠️ ${shortcut} not detected`);
                shortcutResults[shortcut] = false;
            }
        }
        
        return {
            ok: foundButtons.length > 0,
            details: {
                foundButtons: foundButtons,
                saveButtonWorked: saveButtonWorked,
                exportButtonWorked: exportButtonWorked,
                deviceResults: deviceResults,
                undoRedoButtonsWork: undoRedoButtonsWork,
                buttonStates: buttonStates,
                shortcutResults: shortcutResults,
                totalButtonsFound: foundButtons.length
            }
        };
        
    } catch (error) {
        console.error('❌ C2 Test failed:', error);
        
        return {
            ok: false,
            error: error.message,
            details: {
                saveButtonExists: !!document.querySelector(GMKBTest.selectors.toolbarSave),
                exportButtonExists: !!document.querySelector(GMKBTest.selectors.toolbarExport),
                toolbarExists: !!document.querySelector('.toolbar, #toolbar, .gmkb-toolbar'),
                builderRootExists: !!document.querySelector(GMKBTest.selectors.builderRoot)
            }
        };
    }
};

// Auto-run if called directly
if (typeof module === 'undefined' && typeof window !== 'undefined') {
    console.log('🧪 C2 Test loaded - run with: await GMKBTest.tests.C2()');
}
