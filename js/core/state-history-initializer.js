/**
 * State History Initializer
 * ROOT FIX: Ensures state history captures initial state
 */

(function() {
    'use strict';
    
    console.log('🔧 State History Initializer: Starting...');
    
    // Wait for both state history and state manager to be ready
    const waitForDependencies = function(callback) {
        const checkDependencies = function() {
            if (window.stateHistory && window.enhancedStateManager) {
                callback();
            } else {
                setTimeout(checkDependencies, 50);
            }
        };
        checkDependencies();
    };
    
    waitForDependencies(function() {
        console.log('✅ State History Initializer: Dependencies ready');
        
        // ROOT FIX: Don't capture empty initial state
        // Only capture if there are actually components
        const currentState = window.enhancedStateManager.getState();
        const hasComponents = currentState && currentState.components && Object.keys(currentState.components).length > 0;
        
        if (window.stateHistory.history.length === 0 && hasComponents) {
            console.log('📸 State History Initializer: Capturing initial state with components...');
            
            // Manually capture the initial state
            window.stateHistory.captureSnapshot(currentState, {
                label: 'initial-state',
                source: 'initializer'
            });
            
            console.log('✅ State History Initializer: Initial state captured');
            console.log('History length:', window.stateHistory.history.length);
            console.log('Can undo:', window.stateHistory.canUndo());
            
            // Update button states
            if (window.updateUndoRedoButtons) {
                window.updateUndoRedoButtons();
            }
        } else if (window.stateHistory.history.length > 0) {
            console.log('✅ State History Initializer: History already has snapshots:', window.stateHistory.history.length);
        } else {
            console.log('⏳ State History Initializer: No components yet, waiting for user actions');
        }
        
        // ROOT FIX: Always update button states on init
        setTimeout(() => {
            if (window.updateUndoRedoButtons) {
                window.updateUndoRedoButtons();
            }
        }, 100);
    });
})();
