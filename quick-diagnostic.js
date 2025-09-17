// Quick check to verify component save is working
// Copy and paste this entire block into the browser console

(() => {
    console.log('🔍 COMPONENT SAVE DIAGNOSTIC');
    console.log('============================\n');
    
    // 1. Check if state manager exists
    const sm = window.stateManager || window.gmkbStateManager;
    if (!sm) {
        console.error('❌ State manager not found!');
        return;
    }
    console.log('✅ State manager found\n');
    
    // 2. Check components type
    const state = sm.getState();
    const isArray = Array.isArray(state.components);
    console.log('📊 Components Structure:');
    console.log('- Type:', typeof state.components);
    console.log('- Is Array?:', isArray ? '❌ YES (WRONG!)' : '✅ NO (correct)');
    
    if (isArray) {
        console.error('\n❌ CRITICAL: Components is an array! Running fix...');
        sm.setState({ ...state, components: {} });
        console.log('✅ Fixed: Converted to object');
    }
    
    // 3. Count components
    const componentCount = Object.keys(state.components || {}).length;
    console.log('- Component Count:', componentCount);
    
    // 4. List components
    if (componentCount > 0) {
        console.log('\n📦 Components in state.components:');
        Object.entries(state.components).forEach(([id, comp]) => {
            console.log(`  ✅ ${id}`);
            console.log(`     Type: ${comp.type}, Section: ${comp.sectionId || 'none'}`);
        });
    } else {
        console.warn('\n⚠️ No components in state.components object');
    }
    
    // 5. Check sections
    console.log('\n📂 Sections:');
    let totalInSections = 0;
    state.sections?.forEach(section => {
        const comps = section.components || [];
        console.log(`- ${section.section_id}: ${comps.length} components`);
        if (comps.length > 0) {
            comps.forEach(c => {
                const id = typeof c === 'string' ? c : c.component_id;
                console.log(`    • ${id}`);
            });
        }
        totalInSections += comps.length;
    });
    
    // 6. Check for mismatch
    console.log('\n📊 Summary:');
    console.log('- Components in state.components:', componentCount);
    console.log('- Components in sections:', totalInSections);
    
    if (componentCount === 0 && totalInSections > 0) {
        console.error('\n❌ PROBLEM FOUND:');
        console.error('Components exist in sections but NOT in the components object!');
        console.error('This is why save shows 0 components.\n');
        
        console.log('🔧 To fix, run: fixOrphanedComponents()');
        
        // Create fix function
        window.fixOrphanedComponents = () => {
            const state = sm.getState();
            let fixed = 0;
            
            state.sections?.forEach(section => {
                section.components?.forEach(compRef => {
                    const id = typeof compRef === 'string' ? compRef : compRef.component_id;
                    if (id && !state.components[id]) {
                        // Add missing component
                        state.components[id] = {
                            id: id,
                            type: id.split('_')[0], // Guess type from ID
                            sectionId: section.section_id,
                            props: {},
                            data: {}
                        };
                        fixed++;
                        console.log(`✅ Added ${id} to components object`);
                    }
                });
            });
            
            if (fixed > 0) {
                sm.setState(state);
                console.log(`\n✅ Fixed ${fixed} orphaned components`);
            } else {
                console.log('No orphaned components found');
            }
        };
    } else if (componentCount === totalInSections) {
        console.log('\n✅ All good! Components are properly tracked.');
    } else {
        console.warn('\n⚠️ Component count mismatch - investigate further');
    }
    
    // 7. Test save
    console.log('\n💾 Testing save function...');
    if (window.GMKB?.save) {
        console.log('Run: GMKB.save() to test saving');
        console.log('Or run: testSave() for detailed save test');
        
        window.testSave = async () => {
            try {
                await window.GMKB.save();
                console.log('Check the console for components_count in the save response');
            } catch (e) {
                console.error('Save failed:', e);
            }
        };
    }
    
    console.log('\n============================');
    console.log('📝 Available commands:');
    console.log('- checkComponents() : Run this diagnostic again');
    console.log('- fixOrphanedComponents() : Fix components only in sections');
    console.log('- testSave() : Test the save function');
    console.log('- GMKB.save() : Save the media kit');
    console.log('============================');
})();
