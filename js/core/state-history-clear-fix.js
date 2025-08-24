/**
 * State History Clear Fix
 * ROOT FIX: Clear history when all components are removed
 */

(function() {
    'use strict';
    
    console.log('🔧 State History Clear Fix: Starting...');
    
    // Wait for dependencies
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
        console.log('✅ State History Clear Fix: Dependencies ready');
        
        // Listen for state changes
        if (window.enhancedStateManager && window.enhancedStateManager.subscribeGlobal) {
            window.enhancedStateManager.subscribeGlobal((state) => {
                // Check if all components have been removed
                const componentCount = Object.keys(state.components || {}).length;
                
                if (componentCount === 0 && window.stateHistory.history.length > 0) {
                    console.log('🧹 State History Clear Fix: All components removed, clearing history');
                    
                    // Clear the history
                    window.stateHistory.clear();
                    
                    // Update button states
                    if (window.updateUndoRedoButtons) {
                        window.updateUndoRedoButtons();
                    }
                }
            });
        }
        
        console.log('✅ State History Clear Fix: Monitoring state changes');
    });
})();
