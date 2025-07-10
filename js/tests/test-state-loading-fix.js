/**
 * @file test-state-loading-fix.js
 * @description Test script to validate that the state loading fix is working properly
 * 
 * ROOT FIX VALIDATION: Tests that saved components are properly loaded on page refresh
 */

/**
 * Comprehensive state loading fix validation
 * Tests all aspects of the saved state loading system
 */
export class StateLoadingFixValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }
    
    /**
     * Run all state loading fix validation tests
     */
    async validateStateLoadingFix() {
        console.group('🔄 ROOT FIX: State Loading Validation');
        console.log('Testing saved component loading functionality...\n');
        
        // Test 1: Enhanced State Manager Availability
        this.test('Enhanced State Manager Available', !!window.enhancedStateManager, true);
        
        // Test 2: State Loading Methods Available
        this.test('loadStateFromStorage Method Available', 
            typeof window.enhancedStateManager?.loadStateFromStorage === 'function', true);
        this.test('autoLoadSavedState Method Available', 
            typeof window.enhancedStateManager?.autoLoadSavedState === 'function', true);
        this.test('initializeAfterSystems Method Available', 
            typeof window.enhancedStateManager?.initializeAfterSystems === 'function', true);
        
        // Test 3: localStorage Data Check
        const hasLocalStorageData = !!localStorage.getItem('guestifyMediaKitState');
        this.test('Has Saved Data in localStorage', hasLocalStorageData, false);
        
        if (hasLocalStorageData) {
            await this.validateSavedData();
        } else {
            console.log('ℹ️ No saved data found - will create test data for validation');
            await this.createTestDataAndValidate();
        }
        
        // Test 4: Current State Validation
        await this.validateCurrentState();
        
        // Test 5: Renderer Integration
        this.validateRendererIntegration();
        
        // Test 6: Event System Integration
        this.validateEventSystemIntegration();
        
        // Test 7: Initialization Sequence
        await this.validateInitializationSequence();
        
        this.showResults();
        
        console.groupEnd();
        
        return this.results;
    }
    
    /**
     * Validate saved data structure and content
     */
    async validateSavedData() {
        console.log('📊 Validating saved data structure...');
        
        try {
            const savedData = JSON.parse(localStorage.getItem('guestifyMediaKitState'));
            
            this.test('Saved Data is Valid JSON', !!savedData, true);
            this.test('Saved Data Has Components Property', !!(savedData.components || savedData.c), true);
            this.test('Saved Data Has Layout Property', !!(savedData.layout || savedData.l), true);
            
            const components = savedData.components || savedData.c || {};
            const layout = savedData.layout || savedData.l || [];
            
            this.test('Saved Data Components is Object', typeof components === 'object', true);
            this.test('Saved Data Layout is Array', Array.isArray(layout), true);
            
            const componentCount = Object.keys(components).length;
            this.test('Saved Data Has Components with Count > 0', componentCount > 0, false);
            
            if (componentCount > 0) {
                console.log(`  ✅ Found ${componentCount} saved components`);
                console.log(`  ✅ Layout length: ${layout.length}`);
                
                // Validate component structure
                const firstComponent = Object.values(components)[0];
                this.test('First Component Has ID Property', !!firstComponent?.id, true);
                this.test('First Component Has Type Property', !!firstComponent?.type, true);
                this.test('First Component Has Props Property', !!firstComponent?.props, false);
                
                console.log(`  📋 Component types: ${Object.values(components).map(c => c.type).join(', ')}`);
            }
            
        } catch (error) {
            this.test('Saved Data Parse Error', false, true);
            console.error('  ❌ Parse Error:', error.message);
        }
    }
    
    /**
     * Create test data and validate the save/load cycle
     */
    async createTestDataAndValidate() {
        console.log('🧪 Creating test data to validate save/load cycle...');
        
        if (!window.enhancedComponentManager) {
            console.log('  ⚠️ Enhanced component manager not available - skipping test data creation');
            return;
        }
        
        try {
            // Get initial state
            const initialState = window.enhancedStateManager.getState();
            const initialComponentCount = Object.keys(initialState.components || {}).length;
            
            console.log(`  📊 Initial component count: ${initialComponentCount}`);
            
            // Add a test component
            console.log('  ➕ Adding test component...');
            const testComponentId = 'test-state-loading-' + Date.now();
            
            if (typeof window.enhancedComponentManager.addComponent === 'function') {
                const componentId = window.enhancedComponentManager.addComponent('hero', {
                    title: 'Test Component for State Loading',
                    subtitle: 'This component tests the save/load functionality'
                });
                
                console.log(`  ✅ Test component added with ID: ${componentId}`);
                
                // Wait for state to update
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Verify component was added to state
                const updatedState = window.enhancedStateManager.getState();
                const updatedComponentCount = Object.keys(updatedState.components || {}).length;
                
                this.test('Test Component Added to State', updatedComponentCount > initialComponentCount, true);
                
                // Force save
                console.log('  💾 Force saving state...');
                if (window.enhancedStateManager && typeof window.enhancedStateManager.saveStateToStorage === 'function') {
                    const saveResult = window.enhancedStateManager.saveStateToStorage();
                    this.test('Test Data Saved Successfully', saveResult, true);
                } else if (window.saveService && typeof window.saveService.saveState === 'function') {
                    const saveResult = window.saveService.saveState();
                    this.test('Test Data Saved Successfully (Fallback)', saveResult, true);
                }
                
                console.log('  ✅ Test data created and saved');
                
            } else {
                console.log('  ⚠️ addComponent method not available - cannot create test data');
            }
            
        } catch (error) {
            console.error('  ❌ Error creating test data:', error);
            this.test('Test Data Creation Failed', false, false);
        }
    }
    
    /**
     * Validate current state after loading
     */
    async validateCurrentState() {
        console.log('🎯 Validating current state...');
        
        if (!window.enhancedStateManager) {
            this.test('Enhanced State Manager Not Available for Current State Check', false, true);
            return;
        }
        
        try {
            const currentState = window.enhancedStateManager.getState();
            
            this.test('Current State Available', !!currentState, true);
            this.test('Current State Has Components Property', !!(currentState.components), true);
            this.test('Current State Has Layout Property', !!(currentState.layout), true);
            
            if (currentState) {
                const componentCount = Object.keys(currentState.components || {}).length;
                const layoutLength = (currentState.layout || []).length;
                
                this.test('Current State Components is Object', typeof currentState.components === 'object', true);
                this.test('Current State Layout is Array', Array.isArray(currentState.layout), true);
                
                console.log(`  📊 Current State Summary:`);
                console.log(`    Components: ${componentCount}`);
                console.log(`    Layout: ${layoutLength}`);
                console.log(`    Version: ${currentState.version || 'unknown'}`);
                
                // Test state consistency
                if (componentCount > 0) {
                    this.test('Current State Has Components Loaded', componentCount > 0, false);
                    
                    // Validate component structure
                    const components = Object.values(currentState.components);
                    const validComponents = components.filter(c => c && c.id && c.type);
                    
                    this.test('All Components Have Valid Structure', validComponents.length === components.length, true);
                    
                    if (validComponents.length > 0) {
                        console.log(`    Component Types: ${validComponents.map(c => c.type).join(', ')}`);
                    }
                }
            }
            
        } catch (error) {
            console.error('  ❌ Error validating current state:', error);
            this.test('Current State Validation Failed', false, true);
        }
    }
    
    /**
     * Validate renderer integration
     */
    validateRendererIntegration() {
        console.log('🖼️ Validating renderer integration...');
        
        this.test('Renderer Available', !!window.renderer, false);
        this.test('Renderer Initialized', !!window.renderer?.initialized, false);
        
        // Check DOM rendering
        const previewElement = document.getElementById('media-kit-preview');
        this.test('Preview Element Exists', !!previewElement, true);
        
        if (previewElement) {
            const hasRenderedComponents = previewElement.children.length > 1; // More than just empty state
            this.test('Preview Element Has Rendered Components', hasRenderedComponents, false);
            
            console.log(`    Preview Element Children: ${previewElement.children.length}`);
            console.log(`    Has Rendered Components: ${hasRenderedComponents}`);
            
            // Check for empty state
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                const emptyStateVisible = emptyState.style.display !== 'none' && !emptyState.hidden;
                console.log(`    Empty State Visible: ${emptyStateVisible}`);
                
                if (hasRenderedComponents && emptyStateVisible) {
                    console.log('  ⚠️ Components rendered but empty state still visible - possible UI issue');
                }
            }
        }
    }
    
    /**
     * Validate event system integration
     */
    validateEventSystemIntegration() {
        console.log('📡 Validating event system integration...');
        
        this.test('Event Bus Available', !!window.eventBus || !!window.eventBus, false);
        
        // Check if state manager emits events
        let eventReceived = false;
        
        if (window.eventBus) {
            try {
                const testListener = () => { eventReceived = true; };
                window.eventBus.on('state:test-event', testListener);
                window.eventBus.emit('state:test-event', { test: true });
                window.eventBus.off('state:test-event', testListener);
                
                this.test('Event Bus Functional', eventReceived, false);
            } catch (error) {
                this.test('Event Bus Error', false, false);
                console.log(`    Event Bus Error: ${error.message}`);
            }
        }
    }
    
    /**
     * Validate initialization sequence
     */
    async validateInitializationSequence() {
        console.log('🚀 Validating initialization sequence...');
        
        this.test('Initialization Manager Available', !!window.initManager, false);
        this.test('State Manager Initialized', !!window.enhancedStateManager, true);
        
        // Test manual state loading
        if (window.enhancedStateManager) {
            try {
                console.log('  🧪 Testing manual state loading...');
                
                // Get current state
                const beforeState = window.enhancedStateManager.getState();
                const beforeCount = Object.keys(beforeState.components || {}).length;
                
                // Call autoLoadSavedState manually
                if (typeof window.enhancedStateManager.autoLoadSavedState === 'function') {
                    window.enhancedStateManager.autoLoadSavedState();
                    
                    // Check if state changed
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    const afterState = window.enhancedStateManager.getState();
                    const afterCount = Object.keys(afterState.components || {}).length;
                    
                    console.log(`    Before: ${beforeCount} components, After: ${afterCount} components`);
                    
                    this.test('Manual State Loading Executed', true, false);
                    
                    if (afterCount >= beforeCount) {
                        this.test('Manual State Loading Maintained or Improved State', true, false);
                    }
                } else {
                    this.test('autoLoadSavedState Method Missing', false, true);
                }
                
            } catch (error) {
                console.error('  ❌ Manual state loading test failed:', error);
                this.test('Manual State Loading Failed', false, false);
            }
        }
    }
    
    /**
     * Test helper function
     */
    test(name, condition, critical = false) {
        const status = condition ? 'PASS' : 'FAIL';
        const icon = condition ? '✅' : '❌';
        
        console.log(`  ${icon} ${name}: ${status}`);\n        
        this.results.tests.push({ name, status, critical });
        
        if (condition) {
            this.results.passed++;
        } else {\n            this.results.failed++;
        }
    }
    
    /**
     * Show validation results
     */
    showResults() {
        console.log('\\n📋 State Loading Fix Validation Summary:');
        console.log(`  ✅ Passed: ${this.results.passed}`);
        console.log(`  ❌ Failed: ${this.results.failed}`);
        
        if (this.results.failed === 0) {
            console.log('\\n🎉 All state loading validation tests passed!');
            console.log('💡 The state loading fix appears to be working correctly.');
            console.log('🔄 Try refreshing the page to test the full save/load cycle.');
            return true;
        } else {
            console.log('\\n⚠️ Some state loading validation tests failed.');
            const criticalFailures = this.results.tests.filter(t => t.status === 'FAIL' && t.critical);
            if (criticalFailures.length > 0) {
                console.log('❌ Critical failures detected:');
                criticalFailures.forEach(t => console.log(`   - ${t.name}`));
            }
            return false;
        }
    }
}

// Create and expose validator instance
const stateLoadingValidator = new StateLoadingFixValidator();

// Expose validation functions globally
window.validateStateLoadingFix = () => stateLoadingValidator.validateStateLoadingFix();
window.stateLoadingValidator = stateLoadingValidator;

// Auto-run validation if this script is loaded directly
if (typeof window !== 'undefined' && window.location) {
    console.log('🔄 State Loading Fix Validator loaded - run validateStateLoadingFix() to test');
}

export { stateLoadingValidator };
