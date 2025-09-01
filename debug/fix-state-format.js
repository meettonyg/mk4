/**
 * Quick fix to check and repair saved state format
 * This will ensure components are saved as objects, not arrays
 */

(function() {
    'use strict';
    
    console.log('%c🔧 STATE FORMAT REPAIR TOOL', 'font-size: 16px; font-weight: bold; color: #4ecdc4');
    
    // Function to check current state format
    window.checkStateFormat = function() {
        const state = window.enhancedStateManager?.getState();
        if (!state) {
            console.error('No state manager found');
            return;
        }
        
        console.group('📊 Current State Format');
        console.log('Components type:', Array.isArray(state.components) ? 'ARRAY (WRONG!)' : 'OBJECT (CORRECT)');
        console.log('Components:', state.components);
        console.log('Layout:', state.layout);
        
        // Check if components is incorrectly an array
        if (Array.isArray(state.components)) {
            console.error('❌ PROBLEM: Components is an array, should be an object!');
            console.log('This will cause empty data when loaded from WordPress');
        } else {
            console.log('✅ Components is correctly an object');
        }
        console.groupEnd();
    };
    
    // Function to repair state format
    window.repairStateFormat = function() {
        const stateManager = window.enhancedStateManager;
        if (!stateManager) {
            console.error('No state manager found');
            return;
        }
        
        const state = stateManager.getState();
        
        // Check if components is an array
        if (Array.isArray(state.components)) {
            console.log('🔧 Repairing components format from array to object...');
            
            // Convert array to object
            const componentsObject = {};
            if (state.components.length > 0) {
                state.components.forEach(comp => {
                    if (comp && comp.id) {
                        componentsObject[comp.id] = comp;
                    }
                });
            }
            
            // Update state with corrected format
            stateManager.dispatch({
                type: 'SET_STATE',
                payload: {
                    ...state,
                    components: componentsObject
                }
            });
            
            console.log('✅ State format repaired!');
            console.log('New components format:', stateManager.getState().components);
            
            // Force save to database
            if (window.wordPressSaveIntegration) {
                console.log('💾 Saving repaired state to database...');
                window.wordPressSaveIntegration.save('format-repair').then(result => {
                    console.log('✅ Repaired state saved:', result);
                }).catch(error => {
                    console.error('❌ Save failed:', error);
                });
            }
        } else {
            console.log('✅ Components format is already correct (object)');
        }
    };
    
    // Function to verify WordPress data format
    window.checkWordPressData = function() {
        console.group('🌐 WordPress Data Format Check');
        
        const wpData = window.gmkbData;
        if (!wpData) {
            console.error('No WordPress data found');
            console.groupEnd();
            return;
        }
        
        console.log('saved_state:', wpData.saved_state);
        
        if (wpData.saved_state) {
            console.log('Components type in saved_state:', 
                Array.isArray(wpData.saved_state.components) ? 'ARRAY' : 'OBJECT');
            console.log('Components data:', wpData.saved_state.components);
            
            // Check if it's an empty array
            if (Array.isArray(wpData.saved_state.components) && wpData.saved_state.components.length === 0) {
                console.error('❌ PROBLEM: WordPress returned empty components array');
                console.log('This means the data was saved incorrectly or PHP is converting it');
            }
        }
        
        console.groupEnd();
    };
    
    // Auto-check on load
    console.log('\n🔍 Running automatic format check...');
    checkStateFormat();
    checkWordPressData();
    
    console.log('\n💡 Available commands:');
    console.log('- checkStateFormat() - Check current state format');
    console.log('- repairStateFormat() - Fix components format and save');
    console.log('- checkWordPressData() - Check WordPress data format');
    
    // Check if we need to auto-repair
    const state = window.enhancedStateManager?.getState();
    if (state && Array.isArray(state.components)) {
        console.warn('\n⚠️ Auto-repair needed! Run repairStateFormat() to fix');
    }
    
})();