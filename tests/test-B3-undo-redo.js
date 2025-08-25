/**
 * Test B3: Undo/Redo Sequence
 * Tests undo and redo functionality for state history
 */

if (typeof GMKBTest === 'undefined') {
    throw new Error('GMKBTest harness not loaded');
}

GMKBTest.tests.B3 = async function() {
    console.log('↶ B3: Testing undo/redo functionality...');
    
    const initialState = GMKBTest.snapshot('B3-initial');
    const testComponentIds = [];
    
    try {
        // Step 1: Check if undo/redo system is available
        console.log('🔍 Step 1: Checking undo/redo system availability...');
        
        const undoRedoSystems = {
            stateHistory: window.stateHistory,
            historyService: window.historyService,
            stateManager: window.enhancedStateManager
        };
        
        const availableSystems = Object.entries(undoRedoSystems)
            .filter(([name, system]) => !!system)
            .map(([name]) => name);
        
        console.log(`Available systems: ${availableSystems.join(', ')}`);
        GMKBTest.assert(availableSystems.length > 0, 'At least one history system should be available');
        
        // Step 2: Perform actions to create history
        console.log('📝 Step 2: Performing actions to create history...');
        
        // Action 1: Add component
        console.log('  ➕ Adding first component...');
        const componentId1 = await GMKBTest.addComponent('hero', {
            title: 'Undo Test Component 1'
        });
        testComponentIds.push(componentId1);
        await GMKBTest.sleep(300);
        
        const state1 = GMKBTest.snapshot('after-add-1');
        
        // Action 2: Add another component
        console.log('  ➕ Adding second component...');
        const componentId2 = await GMKBTest.addComponent('biography', {
            title: 'Undo Test Component 2'
        });
        testComponentIds.push(componentId2);
        await GMKBTest.sleep(300);
        
        const state2 = GMKBTest.snapshot('after-add-2');
        
        // Action 3: Edit first component
        console.log('  ✏️ Editing first component...');
        if (window.enhancedStateManager?.updateComponent) {
            window.enhancedStateManager.updateComponent(componentId1, {
                title: 'Modified Undo Test Component 1',
                edited: true
            });
            await GMKBTest.sleep(300);
        }
        
        const state3 = GMKBTest.snapshot('after-edit');
        
        // Verify we have created some history
        const currentComponents = document.querySelectorAll(GMKBTest.selectors.componentItem);
        GMKBTest.assert(currentComponents.length >= 2, 'Should have at least 2 components after actions');
        console.log(`✅ Created ${currentComponents.length} components for history testing`);
        
        // Step 3: Test undo functionality
        console.log('↶ Step 3: Testing undo functionality...');
        
        let undoWorked = false;
        let undoMethod = null;
        
        // Method 1: Try keyboard shortcut (Ctrl+Z)
        console.log('  ⌨️ Trying Ctrl+Z keyboard shortcut...');
        
        document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true
        }));
        
        await GMKBTest.sleep(500);
        
        const afterCtrlZ = document.querySelectorAll(GMKBTest.selectors.componentItem).length;
        if (afterCtrlZ !== currentComponents.length) {
            undoWorked = true;
            undoMethod = 'keyboard';
            console.log('✅ Undo worked via Ctrl+Z');
        }
        
        // Method 2: Try undo button
        if (!undoWorked) {
            console.log('  🔘 Looking for undo button...');
            
            const undoSelectors = [
                '#undo-btn',
                '.undo-btn',
                '[data-action="undo"]',
                'button[title*="Undo"]',
                '.toolbar .undo'
            ];
            
            let undoButton = null;
            for (const selector of undoSelectors) {
                undoButton = document.querySelector(selector);
                if (undoButton) break;
            }
            
            if (undoButton && !undoButton.disabled) {
                console.log('  ✅ Undo button found, clicking...');
                undoButton.click();
                await GMKBTest.sleep(500);
                
                const afterUndoBtn = document.querySelectorAll(GMKBTest.selectors.componentItem).length;
                if (afterUndoBtn !== currentComponents.length) {
                    undoWorked = true;
                    undoMethod = 'button';
                    console.log('✅ Undo worked via button');
                }
            } else {
                console.log('  ⚠️ No enabled undo button found');
            }
        }
        
        // Method 3: Try state manager undo
        if (!undoWorked && window.enhancedStateManager?.rollbackLastTransaction) {
            console.log('  ⚙️ Trying state manager rollback...');
            
            const rollbackResult = window.enhancedStateManager.rollbackLastTransaction();
            if (rollbackResult) {
                await GMKBTest.sleep(300);
                
                const afterRollback = document.querySelectorAll(GMKBTest.selectors.componentItem).length;
                if (afterRollback !== currentComponents.length) {
                    undoWorked = true;
                    undoMethod = 'state-manager';
                    console.log('✅ Undo worked via state manager rollback');
                }
            }
        }
        
        // Method 4: Try history service
        if (!undoWorked && window.historyService?.undo) {
            console.log('  📚 Trying history service undo...');
            
            try {
                await window.historyService.undo();
                await GMKBTest.sleep(300);
                
                const afterHistoryUndo = document.querySelectorAll(GMKBTest.selectors.componentItem).length;
                if (afterHistoryUndo !== currentComponents.length) {
                    undoWorked = true;
                    undoMethod = 'history-service';
                    console.log('✅ Undo worked via history service');
                }
            } catch (error) {
                console.log('  ⚠️ History service undo failed:', error.message);
            }
        }
        
        if (!undoWorked) {
            console.log('⚠️ No undo method worked - will test what systems are available');
        }
        
        // Step 4: Test redo functionality (if undo worked)
        console.log('↷ Step 4: Testing redo functionality...');
        
        let redoWorked = false;
        let redoMethod = null;
        
        if (undoWorked) {
            const componentsAfterUndo = document.querySelectorAll(GMKBTest.selectors.componentItem).length;
            
            // Method 1: Try keyboard shortcut (Ctrl+Y or Ctrl+Shift+Z)
            console.log('  ⌨️ Trying Ctrl+Y keyboard shortcut...');
            
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'y',
                ctrlKey: true,
                bubbles: true
            }));
            
            await GMKBTest.sleep(500);
            
            const afterCtrlY = document.querySelectorAll(GMKBTest.selectors.componentItem).length;
            if (afterCtrlY !== componentsAfterUndo) {
                redoWorked = true;
                redoMethod = 'keyboard-y';
                console.log('✅ Redo worked via Ctrl+Y');
            }
            
            // Try Ctrl+Shift+Z if Ctrl+Y didn't work
            if (!redoWorked) {
                console.log('  ⌨️ Trying Ctrl+Shift+Z keyboard shortcut...');
                
                document.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'z',
                    ctrlKey: true,
                    shiftKey: true,
                    bubbles: true
                }));
                
                await GMKBTest.sleep(500);
                
                const afterCtrlShiftZ = document.querySelectorAll(GMKBTest.selectors.componentItem).length;
                if (afterCtrlShiftZ !== componentsAfterUndo) {
                    redoWorked = true;
                    redoMethod = 'keyboard-shift-z';
                    console.log('✅ Redo worked via Ctrl+Shift+Z');
                }
            }
            
            // Method 2: Try redo button
            if (!redoWorked) {
                console.log('  🔘 Looking for redo button...');
                
                const redoSelectors = [
                    '#redo-btn',
                    '.redo-btn',
                    '[data-action="redo"]',
                    'button[title*="Redo"]',
                    '.toolbar .redo'
                ];
                
                let redoButton = null;
                for (const selector of redoSelectors) {
                    redoButton = document.querySelector(selector);
                    if (redoButton) break;
                }
                
                if (redoButton && !redoButton.disabled) {
                    console.log('  ✅ Redo button found, clicking...');
                    redoButton.click();
                    await GMKBTest.sleep(500);
                    
                    const afterRedoBtn = document.querySelectorAll(GMKBTest.selectors.componentItem).length;
                    if (afterRedoBtn !== componentsAfterUndo) {
                        redoWorked = true;
                        redoMethod = 'button';
                        console.log('✅ Redo worked via button');
                    }
                } else {
                    console.log('  ⚠️ No enabled redo button found');
                }
            }
            
            // Method 3: Try history service
            if (!redoWorked && window.historyService?.redo) {
                console.log('  📚 Trying history service redo...');
                
                try {
                    await window.historyService.redo();
                    await GMKBTest.sleep(300);
                    
                    const afterHistoryRedo = document.querySelectorAll(GMKBTest.selectors.componentItem).length;
                    if (afterHistoryRedo !== componentsAfterUndo) {
                        redoWorked = true;
                        redoMethod = 'history-service';
                        console.log('✅ Redo worked via history service');
                    }
                } catch (error) {
                    console.log('  ⚠️ History service redo failed:', error.message);
                }
            }
        } else {
            console.log('⚠️ Cannot test redo since undo did not work');
        }
        
        // Step 5: Test undo/redo sequence accuracy
        console.log('🔄 Step 5: Testing undo/redo sequence accuracy...');
        
        let sequenceAccurate = false;
        
        if (undoWorked && redoWorked) {
            // Take snapshot after redo
            const finalState = GMKBTest.getState();
            
            // Compare with state before undo
            const differences = GMKBTest.diff(state3, finalState);
            
            if (differences.length === 0) {
                sequenceAccurate = true;
                console.log('✅ Undo/redo sequence is accurate - state restored perfectly');
            } else {
                console.log('⚠️ Undo/redo sequence may not be perfectly accurate');
                console.log('Differences:', differences);
            }
        }
        
        // Step 6: Test history limits/bounds
        console.log('📊 Step 6: Testing history limits...');
        
        let historyInfo = {};
        
        // Get history information if available
        if (window.stateHistory?.getHistory) {
            const history = window.stateHistory.getHistory();
            historyInfo.totalEntries = history.length;
            historyInfo.currentIndex = window.stateHistory.currentIndex || 0;
        }
        
        if (window.historyService?.getHistoryInfo) {
            const info = window.historyService.getHistoryInfo();
            historyInfo = { ...historyInfo, ...info };
        }
        
        if (window.enhancedStateManager?.getTransactionHistory) {
            const transactions = window.enhancedStateManager.getTransactionHistory();
            historyInfo.transactionCount = transactions.length;
        }
        
        console.log('📊 History info:', historyInfo);
        
        // Step 7: Test multiple undo/redo cycles
        console.log('🔁 Step 7: Testing multiple undo/redo cycles...');
        
        let multipleUndoRedoWorked = false;
        
        if (undoMethod && redoMethod) {
            try {
                // Perform multiple undo/redo cycles
                for (let i = 0; i < 3; i++) {
                    if (undoMethod === 'keyboard') {
                        document.dispatchEvent(new KeyboardEvent('keydown', {
                            key: 'z',
                            ctrlKey: true,
                            bubbles: true
                        }));
                    } else if (undoMethod === 'history-service' && window.historyService?.undo) {
                        await window.historyService.undo();
                    }
                    
                    await GMKBTest.sleep(200);
                    
                    if (redoMethod === 'keyboard-y') {
                        document.dispatchEvent(new KeyboardEvent('keydown', {
                            key: 'y',
                            ctrlKey: true,
                            bubbles: true
                        }));
                    } else if (redoMethod === 'history-service' && window.historyService?.redo) {
                        await window.historyService.redo();
                    }
                    
                    await GMKBTest.sleep(200);
                }
                
                multipleUndoRedoWorked = true;
                console.log('✅ Multiple undo/redo cycles completed without errors');
                
            } catch (error) {
                console.log('⚠️ Multiple undo/redo cycles failed:', error.message);
            }
        }
        
        return {
            ok: undoWorked || redoWorked, // At least one should work
            details: {
                testComponentIds: testComponentIds,
                availableSystems: availableSystems,
                undoWorked: undoWorked,
                undoMethod: undoMethod,
                redoWorked: redoWorked,
                redoMethod: redoMethod,
                sequenceAccurate: sequenceAccurate,
                multipleUndoRedoWorked: multipleUndoRedoWorked,
                historyInfo: historyInfo,
                undoButtonFound: !!document.querySelector('#undo-btn, .undo-btn, [data-action="undo"]'),
                redoButtonFound: !!document.querySelector('#redo-btn, .redo-btn, [data-action="redo"]')
            }
        };
        
    } catch (error) {
        console.error('❌ B3 Test failed:', error);
        
        return {
            ok: false,
            error: error.message,
            details: {
                testComponentIds: testComponentIds,
                stateHistoryAvailable: !!window.stateHistory,
                historyServiceAvailable: !!window.historyService,
                stateManagerAvailable: !!window.enhancedStateManager,
                componentsInDOM: document.querySelectorAll(GMKBTest.selectors.componentItem).length
            }
        };
    }
};

// Auto-run if called directly
if (typeof module === 'undefined' && typeof window !== 'undefined') {
    console.log('🧪 B3 Test loaded - run with: await GMKBTest.tests.B3()');
}
