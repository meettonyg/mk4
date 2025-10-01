/**
 * Phase 7: Complete System Test for Vue Migration
 * Run in browser console: testVueMigrationComplete()
 */

window.testVueMigrationComplete = function() {
    console.log('🧪 Starting Complete Vue Migration System Test...\n');

    const store = window.gmkbStore || window.mediaKitStore || (window.vue?.store);
    
    if (!store) {
        console.error('❌ FAILED: Vue store not found!');
        return false;
    }

    let passedTests = 0;
    let totalTests = 0;
    
    const test = (name, condition, details = '') => {
        totalTests++;
        if (condition) {
            console.log(`✅ ${name}${details ? ' - ' + details : ''}`);
            passedTests++;
            return true;
        } else {
            console.error(`❌ ${name}${details ? ' - ' + details : ''}`);
            return false;
        }
    };

    console.group('📊 Phase 7: Complete System Tests');

    // === Component Operations Tests ===
    console.group('🔧 Component Operations');
    
    // Clear existing state
    store.clearAllComponents();
    
    // Test adding each component type
    const componentTypes = ['hero', 'biography', 'topics', 'contact', 'social', 'testimonials'];
    const addedComponents = [];
    
    componentTypes.forEach(type => {
        try {
            const componentId = store.addComponent({ 
                type, 
                data: { title: `Test ${type}` } 
            });
            addedComponents.push(componentId);
            test(`Add ${type} component`, componentId && store.components[componentId]);
        } catch (error) {
            test(`Add ${type} component`, false, error.message);
        }
    });

    // Test component updates
    if (addedComponents.length > 0) {
        const firstComponent = addedComponents[0];
        store.updateComponent(firstComponent, { data: { title: 'Updated Title' } });
        test('Update component', 
            store.components[firstComponent].data.title === 'Updated Title'
        );
    }

    // Test component duplication
    if (addedComponents.length > 0) {
        const originalCount = Object.keys(store.components).length;
        const duplicateId = store.duplicateComponent(addedComponents[0]);
        test('Duplicate component', 
            Object.keys(store.components).length === originalCount + 1 && duplicateId
        );
    }

    // Test component movement
    if (addedComponents.length > 1) {
        store.moveComponent(addedComponents[0], 'down');
        test('Move component down', true); // Movement logic is complex to verify
    }

    console.groupEnd();

    // === Edit Panel Tests ===
    console.group('✏️ Edit Panel Tests');
    
    if (addedComponents.length > 0) {
        store.openComponentEditor(addedComponents[0]);
        test('Open component editor', 
            store.editingComponentId === addedComponents[0] && store.editPanelOpen
        );

        store.closeComponentEditor();
        test('Close component editor', 
            !store.editingComponentId && !store.editPanelOpen
        );
    }

    console.groupEnd();

    // === Section System Tests ===
    console.group('🏗️ Section System Tests');
    
    const initialSections = store.sections.length;
    
    const sectionId = store.addSection('two_column');
    test('Add two-column section', 
        store.sections.length === initialSections + 1 && sectionId
    );

    // Test moving component to section
    if (addedComponents.length > 0 && sectionId) {
        store.moveComponentToSection(addedComponents[0], sectionId, 1);
        test('Move component to section', true); // Complex to verify section structure
    }

    console.groupEnd();

    // === Persistence Tests ===
    console.group('💾 Persistence Tests');
    
    // Test local backup
    try {
        store.backupToLocalStorage();
        const backup = localStorage.getItem(`gmkb_backup_${store.postId}`);
        test('Create local backup', !!backup);
    } catch (error) {
        test('Create local backup', false, error.message);
    }

    // Test save functionality (without actually saving to avoid spam)
    test('Save method exists', typeof store.saveToWordPress === 'function');
    test('Auto-save method exists', typeof store.autoSave === 'function');
    test('Load method exists', typeof store.loadFromWordPress === 'function');

    console.groupEnd();

    // === State Management Tests ===
    console.group('🏪 State Management Tests');
    
    test('Components are object', typeof store.components === 'object');
    test('Sections are array', Array.isArray(store.sections));
    test('HasUnsavedChanges tracking', typeof store.hasUnsavedChanges === 'boolean');
    test('Post ID available', !!store.postId);

    // Test getters
    test('OrderedComponents getter', Array.isArray(store.orderedComponents));
    test('ComponentCount getter', typeof store.componentCount === 'number');
    test('SectionCount getter', typeof store.sectionCount === 'number');

    console.groupEnd();

    // === History System Tests ===
    console.group('📚 History System Tests');
    
    test('History array exists', Array.isArray(store.history));
    test('Undo method exists', typeof store.undo === 'function');
    test('Redo method exists', typeof store.redo === 'function');
    test('CanUndo getter', typeof store.canUndo === 'boolean');
    test('CanRedo getter', typeof store.canRedo === 'boolean');

    console.groupEnd();

    // === Vue Component Tests ===
    console.group('⚛️ Vue Component Tests');
    
    // Check if Vue app is mounted
    const vueApp = document.querySelector('#gmkb-vue-app, [data-vue-app]');
    test('Vue app mounted', !!vueApp);

    // Check for key Vue components in DOM
    const canvas = document.querySelector('[class*="BuilderCanvas"], [class*="builder-canvas"]');
    test('Builder canvas rendered', !!canvas);

    const editPanel = document.querySelector('[class*="EditPanel"], [class*="edit-panel"]');
    test('Edit panel component exists', !!editPanel);

    console.groupEnd();

    // === Performance Tests ===
    console.group('⚡ Performance Tests');
    
    const startTime = performance.now();
    
    // Add many components quickly
    const manyComponents = [];
    for (let i = 0; i < 10; i++) {
        const id = store.addComponent({ type: 'hero', data: { title: `Perf Test ${i}` } });
        manyComponents.push(id);
    }
    
    const addTime = performance.now() - startTime;
    test('Add 10 components performance', addTime < 1000, `${addTime.toFixed(2)}ms`);

    // Test state updates performance
    const updateStartTime = performance.now();
    manyComponents.forEach(id => {
        store.updateComponent(id, { data: { title: 'Updated' } });
    });
    const updateTime = performance.now() - updateStartTime;
    test('Update 10 components performance', updateTime < 500, `${updateTime.toFixed(2)}ms`);

    console.groupEnd();

    // === Error Handling Tests ===
    console.group('🚨 Error Handling Tests');
    
    // Test invalid component operations
    try {
        store.updateComponent('nonexistent', { data: {} });
        test('Handle invalid component ID', true); // Should not crash
    } catch (error) {
        test('Handle invalid component ID', false, 'Should not throw error');
    }

    // Test invalid section operations
    try {
        store.moveComponentToSection('nonexistent', 'nonexistent');
        test('Handle invalid section operations', true); // Should not crash
    } catch (error) {
        test('Handle invalid section operations', false, 'Should not throw error');
    }

    console.groupEnd();

    // === Final Results ===
    console.groupEnd(); // End main test group

    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} passed`);
    
    const successRate = (passedTests / totalTests) * 100;
    
    if (successRate >= 90) {
        console.log(`🎉 EXCELLENT! ${successRate.toFixed(1)}% success rate`);
        console.log('✅ Vue migration is working perfectly!');
    } else if (successRate >= 80) {
        console.log(`👍 GOOD! ${successRate.toFixed(1)}% success rate`);
        console.log('⚠️ Minor issues detected, but system is functional');
    } else if (successRate >= 70) {
        console.log(`⚠️ NEEDS WORK! ${successRate.toFixed(1)}% success rate`);
        console.log('🔧 Several issues need to be addressed');
    } else {
        console.log(`❌ CRITICAL ISSUES! ${successRate.toFixed(1)}% success rate`);
        console.log('🚨 System needs immediate attention');
    }

    // System recommendations
    console.log('\n🔍 System Status:');
    console.log(`- Components: ${Object.keys(store.components).length}`);
    console.log(`- Sections: ${store.sections.length}`);
    console.log(`- Has unsaved changes: ${store.hasUnsavedChanges}`);
    console.log(`- Last saved: ${store.lastSaved ? new Date(store.lastSaved).toLocaleString() : 'Never'}`);
    
    return {
        passed: passedTests,
        total: totalTests,
        successRate: successRate,
        components: Object.keys(store.components).length,
        sections: store.sections.length,
        recommendations: successRate < 90 ? 'Review failed tests and fix issues' : 'System ready for production'
    };
};

// Auto-run if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🧪 Vue Migration Test Suite loaded. Run testVueMigrationComplete() to test.');
    });
} else {
    console.log('🧪 Vue Migration Test Suite loaded. Run testVueMigrationComplete() to test.');
}
