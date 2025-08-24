/**
 * Quick Undo/Redo Button Test
 * Directly tests button functionality
 */

console.log('🔧 Quick Undo/Redo Test');

// Wait a bit for everything to load
setTimeout(() => {
    console.group('🧪 Testing Undo/Redo Buttons');
    
    // Check if buttons exist
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    console.log('Undo button exists:', !!undoBtn);
    console.log('Redo button exists:', !!redoBtn);
    
    if (undoBtn) {
        console.log('Undo button disabled:', undoBtn.disabled);
        console.log('Undo button classes:', undoBtn.className);
    }
    
    if (redoBtn) {
        console.log('Redo button disabled:', redoBtn.disabled);
        console.log('Redo button classes:', redoBtn.className);
    }
    
    // Check if state history is available
    console.log('State History available:', !!window.stateHistory);
    console.log('History Service available:', !!window.historyService);
    
    if (window.stateHistory) {
        console.log('Can undo:', window.stateHistory.canUndo());
        console.log('Can redo:', window.stateHistory.canRedo());
        console.log('History length:', window.stateHistory.history?.length || 0);
        console.log('Current index:', window.stateHistory.currentIndex);
    }
    
    // Try to manually enable buttons for testing
    if (undoBtn && redoBtn) {
        console.log('🔧 Manually updating button states...');
        
        // Force update button states
        if (window.updateUndoRedoButtons) {
            window.updateUndoRedoButtons();
            console.log('✅ Called updateUndoRedoButtons()');
        } else {
            console.log('❌ updateUndoRedoButtons not found');
        }
        
        // Also try history service update
        if (window.historyService && window.historyService.updateUI) {
            window.historyService.updateUI();
            console.log('✅ Called historyService.updateUI()');
        }
    }
    
    console.groupEnd();
}, 2000);

// Provide manual test function
window.quickUndoTest = function() {
    console.log('🎯 Quick Undo Test');
    
    // Add a component to create history
    if (window.enhancedStateManager) {
        const testComponent = {
            id: 'undo-test-' + Date.now(),
            type: 'hero',
            props: {
                title: 'Undo Test Component'
            }
        };
        
        console.log('Adding test component...');
        window.enhancedStateManager.dispatch({
            type: 'ADD_COMPONENT',
            payload: testComponent
        });
        
        setTimeout(() => {
            console.log('State after adding:');
            console.log('Can undo:', window.stateHistory?.canUndo());
            console.log('History length:', window.stateHistory?.history?.length);
            
            // Update buttons
            if (window.updateUndoRedoButtons) {
                window.updateUndoRedoButtons();
            }
            
            console.log('Undo button disabled:', document.getElementById('undo-btn')?.disabled);
        }, 500);
    }
};

console.log('✅ Quick test loaded. Run quickUndoTest() to test');
