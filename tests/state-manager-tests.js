/**
 * State Manager Test Suite
 * 
 * Tests for Phase 2: Enhanced State Management with Reducer Pattern
 * Run in browser console after loading the Media Kit Builder
 */

// Test helper function
function runTests() {
    console.group('🧪 Enhanced State Manager Tests');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function test(name, fn) {
        try {
            fn();
            console.log(`✅ ${name}`);
            results.passed++;
            results.tests.push({ name, status: 'passed' });
        } catch (error) {
            console.error(`❌ ${name}:`, error.message);
            results.failed++;
            results.tests.push({ name, status: 'failed', error: error.message });
        }
    }
    
    function assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }
    
    // Get the state manager instance
    const stateManager = window.GMKB?.stateManager;
    
    if (!stateManager) {
        console.error('State Manager not found. Make sure Media Kit Builder is loaded.');
        return;
    }
    
    // Test 1: State Manager exists and has required methods
    test('State Manager has required methods', () => {
        assert(typeof stateManager.dispatch === 'function', 'dispatch method missing');
        assert(typeof stateManager.getState === 'function', 'getState method missing');
        assert(typeof stateManager.subscribe === 'function', 'subscribe method missing');
        assert(typeof stateManager.addComponent === 'function', 'addComponent method missing');
        assert(typeof stateManager.removeComponent === 'function', 'removeComponent method missing');
    });
    
    // Test 2: Dispatch with action types
    test('Dispatch accepts action with type and payload', () => {
        const initialState = stateManager.getState();
        const testComponent = {
            id: 'test_component_' + Date.now(),
            type: 'test',
            props: { title: 'Test Component' }
        };
        
        stateManager.dispatch({
            type: 'ADD_COMPONENT',
            payload: testComponent
        });
        
        const newState = stateManager.getState();
        assert(newState.components[testComponent.id], 'Component not added to state');
        assert(newState.components[testComponent.id].type === 'test', 'Component type mismatch');
        
        // Clean up
        stateManager.dispatch({
            type: 'REMOVE_COMPONENT',
            payload: testComponent.id
        });
    });
    
    // Test 3: Action validation
    test('Invalid actions are handled gracefully', () => {
        const stateBefore = JSON.stringify(stateManager.getState());
        
        // Dispatch invalid action type
        stateManager.dispatch({
            type: 'INVALID_ACTION_TYPE_12345',
            payload: {}
        });
        
        const stateAfter = JSON.stringify(stateManager.getState());
        // State should not change for invalid actions (in production mode)
        // Note: May show warning in console but shouldn't crash
    });
    
    // Test 4: Batch operations
    test('Batch operations work correctly', () => {
        
        const componentIds = [];
        
        // Start batch
        stateManager.startBatch();
        
        // Add multiple components
        for (let i = 0; i < 3; i++) {
            const id = `batch_test_${i}_${Date.now()}`;
            componentIds.push(id);
            stateManager.addComponent({
                id,
                type: 'test',
                props: { index: i }
            });
        }
        
        // End batch
        stateManager.endBatch();
        
        // Check all components were added
        const state = stateManager.getState();
        componentIds.forEach((id, index) => {
            assert(state.components[id], `Batch component ${index} not found`);
        });
        
        // Clean up
        componentIds.forEach(id => {
            stateManager.removeComponent(id);
        });
    });
    
    // Test 5: State subscription
    test('State subscriptions work', (done) => {
        let subscriptionCalled = false;
        const testComponentId = 'subscription_test_' + Date.now();
        
        // Subscribe to state changes
        const unsubscribe = stateManager.subscribe((state) => {
            if (state.components[testComponentId]) {
                subscriptionCalled = true;
            }
        });
        
        // Add component (should trigger subscription)
        stateManager.addComponent({
            id: testComponentId,
            type: 'test',
            props: {}
        });
        
        // Check subscription was called
        setTimeout(() => {
            assert(subscriptionCalled, 'Subscription not triggered');
            
            // Clean up
            stateManager.removeComponent(testComponentId);
            unsubscribe();
        }, 100);
    });
    
    // Test 6: Component CRUD operations
    test('Component CRUD operations', () => {
        const componentId = 'crud_test_' + Date.now();
        
        // Create
        stateManager.addComponent({
            id: componentId,
            type: 'test',
            props: { title: 'Original' }
        });
        
        let state = stateManager.getState();
        assert(state.components[componentId], 'Component not created');
        
        // Read
        const component = stateManager.getComponent ? 
            stateManager.getComponent(componentId) : 
            state.components[componentId];
        assert(component.props.title === 'Original', 'Component props incorrect');
        
        // Update
        stateManager.updateComponent(componentId, {
            props: { title: 'Updated' }
        });
        
        state = stateManager.getState();
        assert(state.components[componentId].props.title === 'Updated', 'Component not updated');
        
        // Delete
        stateManager.removeComponent(componentId);
        state = stateManager.getState();
        assert(!state.components[componentId], 'Component not deleted');
    });
    
    // Test 7: Section operations
    test('Section operations', () => {
        const sectionId = 'section_test_' + Date.now();
        
        // Add section
        stateManager.addSection({
            section_id: sectionId,
            type: 'full_width',
            components: []
        });
        
        let state = stateManager.getState();
        const section = state.sections.find(s => s.section_id === sectionId);
        assert(section, 'Section not added');
        assert(section.type === 'full_width', 'Section type incorrect');
        
        // Update section
        if (stateManager.updateSection) {
            stateManager.updateSection(sectionId, {
                type: 'two_column'
            });
            
            state = stateManager.getState();
            const updatedSection = state.sections.find(s => s.section_id === sectionId);
            assert(updatedSection.type === 'two_column', 'Section not updated');
        }
        
        // Delete section
        if (stateManager.deleteSection) {
            stateManager.deleteSection(sectionId);
            state = stateManager.getState();
            const deletedSection = state.sections.find(s => s.section_id === sectionId);
            assert(!deletedSection, 'Section not deleted');
        }
    });
    
    // Test 8: Theme operations
    test('Theme operations', () => {
        const initialTheme = stateManager.getTheme ? 
            stateManager.getTheme() : 
            stateManager.getState().theme;
        
        // Set theme
        stateManager.setTheme('test_theme');
        
        const newTheme = stateManager.getTheme ? 
            stateManager.getTheme() : 
            stateManager.getState().theme;
        
        assert(newTheme === 'test_theme', 'Theme not updated');
        
        // Restore original theme
        stateManager.setTheme(initialTheme);
    });
    
    // Test 9: Global settings
    test('Global settings operations', () => {
        const initialSettings = stateManager.getGlobalSettings ? 
            stateManager.getGlobalSettings() : 
            stateManager.getState().globalSettings;
        
        // Update settings
        stateManager.updateGlobalSettings({
            testSetting: 'testValue',
            anotherSetting: 123
        });
        
        const newSettings = stateManager.getGlobalSettings ? 
            stateManager.getGlobalSettings() : 
            stateManager.getState().globalSettings;
        
        assert(newSettings.testSetting === 'testValue', 'Settings not updated');
        assert(newSettings.anotherSetting === 123, 'Numeric setting not updated');
        
        // Clean up - restore original settings
        stateManager.updateGlobalSettings(initialSettings);
    });
    
    // Test 10: Undo/Redo operations
    test('Undo/Redo operations', () => {
        if (!stateManager.undo || !stateManager.redo) {
            console.warn('Undo/Redo not available');
            return;
        }
        
        const componentId = 'undo_test_' + Date.now();
        
        // Add component
        stateManager.addComponent({
            id: componentId,
            type: 'test',
            props: { title: 'For Undo Test' }
        });
        
        let state = stateManager.getState();
        assert(state.components[componentId], 'Component not added');
        
        // Undo
        stateManager.undo();
        state = stateManager.getState();
        assert(!state.components[componentId], 'Undo failed - component still exists');
        
        // Redo
        stateManager.redo();
        state = stateManager.getState();
        assert(state.components[componentId], 'Redo failed - component not restored');
        
        // Clean up
        stateManager.removeComponent(componentId);
    });
    
    // Test 11: State persistence
    test('State persistence to localStorage', () => {
        if (!stateManager.saveToStorage || !stateManager.loadFromStorage) {
            console.warn('Storage methods not available');
            return;
        }
        
        const testComponentId = 'persistence_test_' + Date.now();
        
        // Add test component
        stateManager.addComponent({
            id: testComponentId,
            type: 'test',
            props: { persistent: true }
        });
        
        // Save to storage
        stateManager.saveToStorage();
        
        // Check localStorage
        const saved = localStorage.getItem('gmkb_state');
        assert(saved, 'State not saved to localStorage');
        
        const savedState = JSON.parse(saved);
        assert(savedState.components[testComponentId], 'Component not in saved state');
        
        // Clean up
        stateManager.removeComponent(testComponentId);
    });
    
    // Test 12: Middleware system
    test('Middleware system works', () => {
        let middlewareCalled = false;
        const testMiddleware = (state, action, manager) => {
            if (action.type === 'TEST_MIDDLEWARE_ACTION') {
                middlewareCalled = true;
            }
            return action;
        };
        
        // Add middleware
        stateManager.addMiddleware(testMiddleware);
        
        // Dispatch test action
        stateManager.dispatch({
            type: 'TEST_MIDDLEWARE_ACTION',
            payload: {}
        });
        
        assert(middlewareCalled, 'Middleware not called');
    });
    
    // Summary
    console.groupEnd();
    console.group('📊 Test Results Summary');
    console.log(`Total Tests: ${results.passed + results.failed}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
    
    if (results.failed > 0) {
        console.group('Failed Tests Details');
        results.tests.filter(t => t.status === 'failed').forEach(t => {
            console.error(`- ${t.name}: ${t.error}`);
        });
        console.groupEnd();
    }
    
    console.groupEnd();
    
    return results;
}

// Export for use in browser console
window.runStateManagerTests = runTests;

// Auto-run if in test mode
if (window.gmkbData?.testMode) {
    setTimeout(runTests, 1000);
}

console.log('📝 State Manager Test Suite loaded. Run window.runStateManagerTests() to execute tests.');
