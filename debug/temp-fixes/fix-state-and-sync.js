// DIAGNOSE AND FIX STATE BLOAT
(function() {
    const state = window.enhancedStateManager.getState();
    
    // Analyze state size
    console.log('=== STATE SIZE ANALYSIS ===');
    
    const sizes = {};
    for (let key in state) {
        const size = JSON.stringify(state[key]).length;
        sizes[key] = size;
        console.log(`${key}: ${(size/1024).toFixed(2)}KB`);
    }
    
    // Find the culprit
    const sorted = Object.entries(sizes).sort((a, b) => b[1] - a[1]);
    console.log('\n=== LARGEST ITEMS ===');
    sorted.slice(0, 5).forEach(([key, size]) => {
        console.log(`${key}: ${(size/1024).toFixed(2)}KB (${((size/332486)*100).toFixed(1)}% of total)`);
    });
    
    // Check components for duplicate data
    if (state.components) {
        console.log('\n=== COMPONENT ANALYSIS ===');
        Object.entries(state.components).forEach(([id, comp]) => {
            const size = JSON.stringify(comp).length;
            console.log(`${id}: ${(size/1024).toFixed(2)}KB`);
            
            // Check for large properties
            if (size > 10000) {
                console.log('  Large properties in this component:');
                for (let prop in comp) {
                    const propSize = JSON.stringify(comp[prop]).length;
                    if (propSize > 1000) {
                        console.log(`    ${prop}: ${(propSize/1024).toFixed(2)}KB`);
                    }
                }
            }
        });
    }
    
    // FIX: Clean up bloated state
    console.log('\n=== CLEANING STATE ===');
    
    // Remove history if it exists
    if (state.history && Array.isArray(state.history)) {
        const historySize = JSON.stringify(state.history).length;
        console.log(`Removing history: ${(historySize/1024).toFixed(2)}KB`);
        delete state.history;
    }
    
    // Remove undo/redo stacks
    if (state.undoStack) {
        delete state.undoStack;
        console.log('Removed undoStack');
    }
    if (state.redoStack) {
        delete state.redoStack;
        console.log('Removed redoStack');
    }
    
    // Clean up components
    if (state.components) {
        Object.keys(state.components).forEach(id => {
            const comp = state.components[id];
            
            // Remove duplicate/large properties
            if (comp.props?.loaded_topics && typeof comp.props.loaded_topics === 'string') {
                delete comp.props.loaded_topics;
            }
            if (comp.data?.loaded_topics && typeof comp.data.loaded_topics === 'string') {
                delete comp.data.loaded_topics;
            }
            
            // Remove any circular references or debug data
            delete comp._debug;
            delete comp._cache;
            delete comp._temp;
        });
    }
    
    // Update state
    window.enhancedStateManager.setState(state);
    
    const newSize = JSON.stringify(state).length;
    console.log(`\n✅ NEW STATE SIZE: ${(newSize/1024).toFixed(2)}KB`);
    console.log(`Reduced by: ${((332486-newSize)/1024).toFixed(2)}KB`);
    
    return newSize;
})();

// THEN FIX BI-DIRECTIONAL SYNC
(function fixSync() {
    const panel = document.querySelector('.component-options__content');
    if (!panel) {
        console.log('Please open the Topics editor first');
        return;
    }
    
    const inputs = panel.querySelectorAll('.topic-editor__field input');
    const items = document.querySelectorAll('.gmkb-topics__item h4');
    
    inputs.forEach((input, i) => {
        if (items[i]) {
            // Sidebar to preview
            input.oninput = () => items[i].textContent = input.value;
            
            // Preview to sidebar
            items[i].contentEditable = true;
            items[i].style.cursor = 'text';
            items[i].onblur = function() {
                input.value = this.textContent;
                input.dispatchEvent(new Event('input', {bubbles: true}));
            };
        }
    });
    
    console.log('✅ Bi-directional sync fixed!');
})();