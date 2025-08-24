/**
 * Undo/Redo Fix Test
 * ROOT FIX: Force proper undo/redo functionality
 */

console.log('🔧 Undo/Redo Fix Test Loading...');

// Function to fix undo/redo
window.fixUndoRedo = function() {
    console.group('🔧 Fixing Undo/Redo System');
    
    // Step 1: Check dependencies
    if (!window.stateHistory) {
        console.error('❌ State History not available');
        console.groupEnd();
        return;
    }
    
    if (!window.enhancedStateManager) {
        console.error('❌ Enhanced State Manager not available');
        console.groupEnd();
        return;
    }
    
    console.log('✅ Dependencies available');
    
    // Step 2: Clear any bad state
    if (window.stateHistory.history.length === 1) {
        const firstSnapshot = window.stateHistory.history[0];
        if (firstSnapshot && firstSnapshot.state && firstSnapshot.state.data) {
            const componentCount = Object.keys(firstSnapshot.state.data.components || {}).length;
            if (componentCount === 0) {
                console.log('🧹 Clearing empty initial snapshot');
                window.stateHistory.clear();
            }
        }
    }
    
    // Step 3: Force capture current state if components exist
    const currentState = window.enhancedStateManager.getState();
    const hasComponents = currentState && currentState.components && Object.keys(currentState.components).length > 0;
    
    if (hasComponents && window.stateHistory.history.length === 0) {
        console.log('📸 Capturing current state with components');
        window.stateHistory.captureSnapshot(currentState, {
            label: 'manual-fix',
            source: 'fix-script'
        });
    }
    
    // Step 4: Force update button states
    console.log('🔄 Updating button states...');
    
    // Get the actual update function
    const updateButtons = window.updateUndoRedoButtons || window._updateButtonStates;
    if (updateButtons) {
        updateButtons();
        console.log('✅ Button states updated');
    } else {
        console.log('⚠️ Button update function not found, trying manual update...');
        
        // Manual button update
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            const canUndo = window.stateHistory.canUndo();
            undoBtn.disabled = !canUndo;
            undoBtn.classList.toggle('disabled', !canUndo);
            console.log('✅ Undo button updated:', canUndo ? 'enabled' : 'disabled');
        }
        
        if (redoBtn) {
            const canRedo = window.stateHistory.canRedo();
            redoBtn.disabled = !canRedo;
            redoBtn.classList.toggle('disabled', !canRedo);
            console.log('✅ Redo button updated:', canRedo ? 'enabled' : 'disabled');
        }
    }
    
    // Step 5: Show current status
    console.log('\n📊 Current Status:');
    console.log('History length:', window.stateHistory.history.length);
    console.log('Current index:', window.stateHistory.currentIndex);
    console.log('Can undo:', window.stateHistory.canUndo());
    console.log('Can redo:', window.stateHistory.canRedo());
    console.log('Components:', Object.keys(currentState.components || {}).length);
    
    console.groupEnd();
};

// Function to test undo/redo by adding a component
window.testUndoRedoWithComponent = function() {
    console.group('🧪 Testing Undo/Redo with Component');
    
    // First fix the system
    fixUndoRedo();
    
    // Add a test component
    if (window.enhancedStateManager) {
        const testComponent = {
            id: 'undo-test-' + Date.now(),
            type: 'hero',
            props: {
                title: 'Test for Undo/Redo'
            }
        };
        
        console.log('➕ Adding test component...');
        window.enhancedStateManager.dispatch({
            type: 'ADD_COMPONENT',
            payload: testComponent
        });
        
        // Wait and check
        setTimeout(() => {
            console.log('\n📊 After adding component:');
            console.log('History length:', window.stateHistory?.history?.length);
            console.log('Can undo:', window.stateHistory?.canUndo());
            console.log('Undo button disabled:', document.getElementById('undo-btn')?.disabled);
            
            // Force button update
            if (window.updateUndoRedoButtons) {
                window.updateUndoRedoButtons();
                console.log('✅ Buttons updated');
            }
            
            console.groupEnd();
        }, 500);
    }
};

// Auto-fix on load
setTimeout(() => {
    console.log('🔧 Running auto-fix...');
    fixUndoRedo();
}, 1000);

console.log('✅ Undo/Redo Fix Test Ready!');
console.log('Commands:');
console.log('- fixUndoRedo() : Fix the undo/redo system');
console.log('- testUndoRedoWithComponent() : Test by adding a component');
