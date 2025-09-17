/**
 * Fix Components Array Issue
 * This script ensures components is always an object, not an array
 */

(function() {
    console.log('🔧 Running components array fix...');
    
    // Wait for state manager to be available
    const checkAndFix = () => {
        if (window.stateManager || window.gmkbStateManager) {
            const sm = window.stateManager || window.gmkbStateManager;
            const state = sm.getState();
            
            console.log('Current components type:', Array.isArray(state.components) ? 'ARRAY (WRONG!)' : 'OBJECT (CORRECT)');
            console.log('Components value:', state.components);
            
            if (Array.isArray(state.components)) {
                console.warn('⚠️ Components is an array - fixing now...');
                
                // Convert array to object
                const componentsObj = {};
                if (state.components.length > 0) {
                    state.components.forEach(comp => {
                        if (comp && comp.id) {
                            componentsObj[comp.id] = comp;
                        }
                    });
                }
                
                // Update state with object
                sm.setState({
                    ...state,
                    components: componentsObj
                });
                
                console.log('✅ Components converted to object');
                console.log('New components:', sm.getState().components);
            } else {
                console.log('✅ Components is already an object');
            }
            
            // Add helper function
            window.fixComponentsArray = () => {
                const state = sm.getState();
                if (Array.isArray(state.components)) {
                    sm.setState({
                        ...state,
                        components: {}
                    });
                    console.log('✅ Fixed components array');
                } else {
                    console.log('✅ Components is already an object');
                }
            };
            
            console.log('Helper function added: fixComponentsArray()');
            
        } else {
            // Retry in 100ms
            setTimeout(checkAndFix, 100);
        }
    };
    
    // Start checking
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndFix);
    } else {
        checkAndFix();
    }
})();
