/**
 * Quick save test - use this to verify components are being saved
 */

// Quick save test with correct component ID
(async function testSave() {
    console.log('=== SAVE TEST ===');
    
    // Get current state
    const state = window.stateManager.getState();
    console.log('Components in state:', Object.keys(state.components || {}));
    console.log('Component count:', Object.keys(state.components || {}).length);
    
    if (Object.keys(state.components || {}).length === 0) {
        console.warn('⚠️ No components to save!');
        console.log('Add a component first by dragging from the sidebar');
        return;
    }
    
    // Show what we're saving
    console.log('\n📤 Saving these components:');
    Object.entries(state.components).forEach(([id, comp]) => {
        console.log(`  - ${id} (type: ${comp.type})`);
    });
    
    // Save
    console.log('\n💾 Attempting save...');
    
    try {
        const result = await window.GMKB.save();
        console.log('\n✅ Save completed');
        
        // The result might be undefined if the save succeeded but response was corrupted
        // Check the console for the actual result
    } catch (error) {
        console.error('Save error:', error);
        
        // Even with error, check if data was actually saved
        console.log('\n⚠️ Save had an error, but data might have been saved.');
        console.log('Refresh the page to see if the component persists.');
    }
    
    console.log('\n💡 To verify save worked:');
    console.log('1. Refresh the page');
    console.log('2. Check if component is still there');
    console.log('3. Run: debugGMKB.showState()');
})();
