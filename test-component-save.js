/**
 * Quick component save test
 * Run this after adding a component to test the save functionality
 */

// Test the current state and save
(function testComponentSave() {
    console.log('=== Component Save Test ===');
    
    // 1. Check state manager exists
    const sm = window.stateManager || window.gmkbStateManager;
    if (!sm) {
        console.error('❌ State manager not found!');
        return;
    }
    
    // 2. Get current state
    const state = sm.getState();
    console.log('\n📊 Current State:');
    console.log('- Components type:', typeof state.components, Array.isArray(state.components) ? '(ARRAY - WRONG!)' : '(OBJECT - CORRECT!)');
    console.log('- Component count:', Object.keys(state.components || {}).length);
    console.log('- Section count:', (state.sections || []).length);
    
    // 3. Check if components exist in sections
    let componentsInSections = 0;
    if (state.sections && Array.isArray(state.sections)) {
        state.sections.forEach(section => {
            if (section.components && Array.isArray(section.components)) {
                componentsInSections += section.components.length;
                console.log(`- Section ${section.section_id} has ${section.components.length} components`);
            }
        });
    }
    console.log('- Total components in sections:', componentsInSections);
    
    // 4. List all component IDs
    const componentIds = Object.keys(state.components || {});
    if (componentIds.length > 0) {
        console.log('\n✅ Components found:');
        componentIds.forEach(id => {
            const comp = state.components[id];
            console.log(`  - ${id} (type: ${comp?.type || 'unknown'})`);
        });
    } else {
        console.warn('⚠️ No components in state.components object!');
    }
    
    // 5. Check what will be sent to save
    const saveData = {
        components: state.components || {},
        layout: state.layout || [],
        sections: state.sections || [],
        theme: state.theme || 'default',
        themeSettings: state.themeSettings || [],
        globalSettings: state.globalSettings || {}
    };
    
    console.log('\n📤 Data to be saved:');
    console.log('- Components to save:', Object.keys(saveData.components).length);
    console.log('- Sections to save:', saveData.sections.length);
    
    // 6. Try to save manually
    console.log('\n💾 Attempting manual save...');
    
    const apiService = window.GMKB?.apiService;
    if (apiService) {
        apiService.save(saveData).then(result => {
            console.log('✅ Save successful!');
            console.log('Result:', result);
            if (result.components_count !== undefined) {
                if (result.components_count === Object.keys(saveData.components).length) {
                    console.log('✅ Component count matches!');
                } else {
                    console.error('❌ Component count mismatch!');
                    console.log(`  Sent: ${Object.keys(saveData.components).length}, Received: ${result.components_count}`);
                }
            }
        }).catch(error => {
            console.error('❌ Save failed:', error);
        });
    } else {
        console.error('❌ API service not found!');
    }
    
    // 7. Provide helper command
    console.log('\n💡 To add a test component, run:');
    console.log('  GMKB.addComponent("hero", { title: "Test Hero" })');
    console.log('\n💡 To check state after adding, run:');
    console.log('  debugGMKB.showState()');
})();
