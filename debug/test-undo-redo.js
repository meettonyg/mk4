/**
 * Undo/Redo System Diagnostic Tool
 * ROOT FIX: Comprehensive testing and debugging for undo/redo functionality
 */

console.log('🔧 Loading Undo/Redo Diagnostic Tool...');

window.testUndoRedo = function() {
    console.group('🔍 Undo/Redo System Diagnostic');
    
    // Step 1: Check if scripts are loaded
    console.group('📦 Script Loading Check');
    const scripts = {
        'stateHistory': window.stateHistory,
        'historyService': window.historyService,
        'toolbarInteractions': window.toolbarInteractions,
        'enhancedStateManager': window.enhancedStateManager,
        'eventBus': window.eventBus
    };
    
    Object.entries(scripts).forEach(([name, obj]) => {
        if (obj) {
            console.log(`✅ ${name}: Loaded`);
        } else {
            console.error(`❌ ${name}: NOT LOADED`);
        }
    });
    console.groupEnd();
    
    // Step 2: Check button elements
    console.group('🔘 Button Elements Check');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn) {
        console.log('✅ Undo button found:', {
            disabled: undoBtn.disabled,
            classes: undoBtn.className,
            hasListeners: !!undoBtn.onclick || undoBtn.hasAttribute('data-preview-listener-attached')
        });
    } else {
        console.error('❌ Undo button NOT FOUND');
    }
    
    if (redoBtn) {
        console.log('✅ Redo button found:', {
            disabled: redoBtn.disabled,
            classes: redoBtn.className,
            hasListeners: !!redoBtn.onclick || redoBtn.hasAttribute('data-preview-listener-attached')
        });
    } else {
        console.error('❌ Redo button NOT FOUND');
    }
    console.groupEnd();
    
    // Step 3: Check state history
    console.group('📜 State History Check');
    if (window.stateHistory) {
        const stats = window.stateHistory.getStats ? window.stateHistory.getStats() : {
            error: 'getStats method not available'
        };
        console.log('State History Stats:', stats);
        console.log('Can Undo:', window.stateHistory.canUndo());
        console.log('Can Redo:', window.stateHistory.canRedo());
        console.log('Current Index:', window.stateHistory.currentIndex);
        console.log('History Length:', window.stateHistory.history?.length || 0);
    } else {
        console.error('❌ State History not available');
    }
    console.groupEnd();
    
    // Step 4: Test creating a history entry
    console.group('🧪 Test History Entry Creation');
    try {
        if (window.enhancedStateManager) {
            const currentState = window.enhancedStateManager.getState();
            console.log('Current state components:', Object.keys(currentState.components || {}).length);
            
            // Add a test component to create history
            const testComponent = {
                id: 'test-' + Date.now(),
                type: 'hero',
                props: {
                    title: 'Test Component for Undo/Redo'
                }
            };
            
            console.log('Adding test component...');
            window.enhancedStateManager.dispatch({
                type: 'ADD_COMPONENT',
                payload: testComponent
            });
            
            setTimeout(() => {
                console.log('After adding component:');
                console.log('Can Undo:', window.stateHistory?.canUndo());
                console.log('History Length:', window.stateHistory?.history?.length || 0);
                
                // Update button states
                if (window.updateUndoRedoButtons) {
                    window.updateUndoRedoButtons();
                    console.log('✅ Button states updated');
                }
            }, 100);
        } else {
            console.error('❌ Enhanced State Manager not available');
        }
    } catch (error) {
        console.error('❌ Error testing history:', error);
    }
    console.groupEnd();
    
    // Step 5: Manual undo/redo test functions
    console.group('🎮 Manual Test Functions');
    console.log('Use these functions to test:');
    console.log('- testUndo() : Perform undo operation');
    console.log('- testRedo() : Perform redo operation');
    console.log('- testAddComponent() : Add a test component');
    console.log('- testRemoveComponent() : Remove last component');
    console.groupEnd();
    
    console.groupEnd();
};

// Manual test functions
window.testUndo = function() {
    console.log('🔄 Testing Undo...');
    if (window.stateHistory && window.stateHistory.undo) {
        const success = window.stateHistory.undo();
        console.log(success ? '✅ Undo successful' : '❌ Undo failed');
        
        // Update button states
        if (window.updateUndoRedoButtons) {
            window.updateUndoRedoButtons();
        }
    } else {
        console.error('❌ Undo function not available');
    }
};

window.testRedo = function() {
    console.log('🔄 Testing Redo...');
    if (window.stateHistory && window.stateHistory.redo) {
        const success = window.stateHistory.redo();
        console.log(success ? '✅ Redo successful' : '❌ Redo failed');
        
        // Update button states
        if (window.updateUndoRedoButtons) {
            window.updateUndoRedoButtons();
        }
    } else {
        console.error('❌ Redo function not available');
    }
};

window.testAddComponent = function() {
    console.log('➕ Adding test component...');
    if (window.enhancedStateManager) {
        const testComponent = {
            id: 'test-' + Date.now(),
            type: 'hero',
            props: {
                title: 'Test Component ' + new Date().toLocaleTimeString()
            }
        };
        
        window.enhancedStateManager.dispatch({
            type: 'ADD_COMPONENT',
            payload: testComponent
        });
        
        console.log('✅ Component added:', testComponent.id);
        
        // Update button states after a delay
        setTimeout(() => {
            if (window.updateUndoRedoButtons) {
                window.updateUndoRedoButtons();
            }
        }, 100);
    } else {
        console.error('❌ State manager not available');
    }
};

window.testRemoveComponent = function() {
    console.log('➖ Removing last component...');
    if (window.enhancedStateManager) {
        const state = window.enhancedStateManager.getState();
        const componentIds = Object.keys(state.components || {});
        
        if (componentIds.length > 0) {
            const lastId = componentIds[componentIds.length - 1];
            
            window.enhancedStateManager.dispatch({
                type: 'REMOVE_COMPONENT',
                payload: { id: lastId }
            });
            
            console.log('✅ Component removed:', lastId);
            
            // Update button states after a delay
            setTimeout(() => {
                if (window.updateUndoRedoButtons) {
                    window.updateUndoRedoButtons();
                }
            }, 100);
        } else {
            console.log('⚠️ No components to remove');
        }
    } else {
        console.error('❌ State manager not available');
    }
};

// Auto-run diagnostic on load
setTimeout(() => {
    console.log('🚀 Undo/Redo Diagnostic Tool Ready!');
    console.log('Run testUndoRedo() to perform full diagnostic');
}, 1000);

console.log('✅ Undo/Redo Diagnostic Tool loaded');
