/**
 * Test Undo/Redo System with Vue Integration
 * Run these commands in the browser console to test specific scenarios
 * 
 * @version 1.0.0
 */

console.log('%c🧪 Undo/Redo Test Suite Loaded', 'color: #4CAF50; font-size: 16px; font-weight: bold');
console.log('Available test commands: testUndoRedo.runAll(), testUndoRedo.status(), etc.');

window.testUndoRedo = {
    /**
     * Check system status
     */
    status() {
        console.group('📊 Undo/Redo System Status');
        
        // Check if UndoRedoManager exists
        const undoRedoExists = !!window.undoRedoManager;
        console.log('UndoRedoManager:', undoRedoExists ? '✅ Loaded' : '❌ Not loaded');
        
        if (undoRedoExists) {
            const stats = window.undoRedoManager.getStats();
            console.log('History Length:', stats.totalStates);
            console.log('Current Index:', stats.currentIndex);
            console.log('Can Undo:', stats.canUndo);
            console.log('Can Redo:', stats.canRedo);
            console.log('Recent Actions:', stats.recentActions);
        }
        
        // Check if Vue Bridge exists
        const bridgeExists = !!window.vueUndoRedoBridge;
        console.log('Vue-Undo Bridge:', bridgeExists ? '✅ Connected' : '❌ Not connected');
        
        if (bridgeExists) {
            const bridgeStatus = window.vueUndoRedoBridge.getStatus();
            console.log('Bridge Status:', bridgeStatus);
        }
        
        // Check if Vue store exists
        const storeExists = !!(window.mediaKitStore || window.gmkbApp?.$pinia);
        console.log('Vue Store:', storeExists ? '✅ Available' : '❌ Not available');
        
        // Check if Enhanced State Manager exists
        const stateManagerExists = !!window.enhancedStateManager;
        console.log('Enhanced State Manager:', stateManagerExists ? '✅ Loaded' : '❌ Not loaded');
        
        console.groupEnd();
        
        return {
            undoRedoManager: undoRedoExists,
            bridge: bridgeExists,
            store: storeExists,
            stateManager: stateManagerExists
        };
    },
    
    /**
     * Test 1: Add Component and Undo
     */
    async test1_AddComponentUndo() {
        console.group('Test 1: Add Component and Undo');
        
        try {
            // Get the store
            const store = this.getStore();
            if (!store) {
                console.error('❌ Store not available');
                console.groupEnd();
                return false;
            }
            
            // Initial state
            const initialCount = Object.keys(store.components).length;
            console.log('Initial component count:', initialCount);
            
            // Add a component
            console.log('Adding hero component...');
            const componentId = store.addComponent({
                type: 'hero',
                data: { title: 'Test Hero' }
            });
            
            // Wait for state to update
            await this.wait(100);
            
            const afterAddCount = Object.keys(store.components).length;
            console.log('After add count:', afterAddCount);
            console.log('Component added:', componentId);
            
            // Undo
            console.log('Performing undo...');
            window.undoRedoManager.undo();
            
            // Wait for state to update
            await this.wait(100);
            
            const afterUndoCount = Object.keys(store.components).length;
            console.log('After undo count:', afterUndoCount);
            
            const success = afterUndoCount === initialCount;
            console.log(success ? '✅ Test passed' : '❌ Test failed');
            
            console.groupEnd();
            return success;
        } catch (error) {
            console.error('❌ Test error:', error);
            console.groupEnd();
            return false;
        }
    },
    
    /**
     * Test 2: Multiple Changes with Undo/Redo
     */
    async test2_MultipleChanges() {
        console.group('Test 2: Multiple Changes with Undo/Redo');
        
        try {
            const store = this.getStore();
            if (!store) {
                console.error('❌ Store not available');
                console.groupEnd();
                return false;
            }
            
            // Add multiple components
            console.log('Adding 3 components...');
            const ids = [];
            
            ids.push(store.addComponent({ type: 'hero', data: { title: 'Hero 1' } }));
            await this.wait(100);
            
            ids.push(store.addComponent({ type: 'biography', data: { content: 'Bio 1' } }));
            await this.wait(100);
            
            ids.push(store.addComponent({ type: 'contact', data: { email: 'test@test.com' } }));
            await this.wait(100);
            
            console.log('Added components:', ids);
            console.log('Component count:', Object.keys(store.components).length);
            
            // Undo twice
            console.log('Undoing twice...');
            window.undoRedoManager.undo();
            await this.wait(100);
            window.undoRedoManager.undo();
            await this.wait(100);
            
            console.log('After 2 undos, count:', Object.keys(store.components).length);
            
            // Redo once
            console.log('Redoing once...');
            window.undoRedoManager.redo();
            await this.wait(100);
            
            console.log('After 1 redo, count:', Object.keys(store.components).length);
            
            const success = Object.keys(store.components).length === 2; // Should have 2 components
            console.log(success ? '✅ Test passed' : '❌ Test failed');
            
            console.groupEnd();
            return success;
        } catch (error) {
            console.error('❌ Test error:', error);
            console.groupEnd();
            return false;
        }
    },
    
    /**
     * Test 3: Keyboard Shortcuts
     */
    async test3_KeyboardShortcuts() {
        console.group('Test 3: Keyboard Shortcuts (Ctrl+Z/Y)');
        
        try {
            const store = this.getStore();
            if (!store) {
                console.error('❌ Store not available');
                console.groupEnd();
                return false;
            }
            
            // Add a component
            console.log('Adding component...');
            const componentId = store.addComponent({ type: 'topics', data: {} });
            await this.wait(100);
            
            const beforeUndo = Object.keys(store.components).length;
            console.log('Before undo:', beforeUndo);
            
            // Simulate Ctrl+Z
            console.log('Simulating Ctrl+Z...');
            const undoEvent = new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                bubbles: true
            });
            document.dispatchEvent(undoEvent);
            
            await this.wait(200);
            
            const afterUndo = Object.keys(store.components).length;
            console.log('After Ctrl+Z:', afterUndo);
            
            // Simulate Ctrl+Y
            console.log('Simulating Ctrl+Y...');
            const redoEvent = new KeyboardEvent('keydown', {
                key: 'y',
                ctrlKey: true,
                bubbles: true
            });
            document.dispatchEvent(redoEvent);
            
            await this.wait(200);
            
            const afterRedo = Object.keys(store.components).length;
            console.log('After Ctrl+Y:', afterRedo);
            
            const success = afterUndo < beforeUndo && afterRedo === beforeUndo;
            console.log(success ? '✅ Test passed' : '❌ Test failed');
            
            console.groupEnd();
            return success;
        } catch (error) {
            console.error('❌ Test error:', error);
            console.groupEnd();
            return false;
        }
    },
    
    /**
     * Test 4: Component Update Tracking
     */
    async test4_ComponentUpdate() {
        console.group('Test 4: Component Update Tracking');
        
        try {
            const store = this.getStore();
            if (!store) {
                console.error('❌ Store not available');
                console.groupEnd();
                return false;
            }
            
            // Add a component
            console.log('Adding component...');
            const componentId = store.addComponent({
                type: 'hero',
                data: { title: 'Original Title' }
            });
            await this.wait(100);
            
            console.log('Original title:', store.components[componentId].data.title);
            
            // Update the component
            console.log('Updating component...');
            store.updateComponent(componentId, {
                data: { title: 'Updated Title' }
            });
            await this.wait(100);
            
            console.log('Updated title:', store.components[componentId].data.title);
            
            // Undo the update
            console.log('Undoing update...');
            window.undoRedoManager.undo();
            await this.wait(100);
            
            const titleAfterUndo = store.components[componentId]?.data?.title;
            console.log('Title after undo:', titleAfterUndo);
            
            const success = titleAfterUndo === 'Original Title';
            console.log(success ? '✅ Test passed' : '❌ Test failed');
            
            console.groupEnd();
            return success;
        } catch (error) {
            console.error('❌ Test error:', error);
            console.groupEnd();
            return false;
        }
    },
    
    /**
     * Test 5: Section Changes
     */
    async test5_SectionChanges() {
        console.group('Test 5: Section Changes with Undo/Redo');
        
        try {
            const store = this.getStore();
            if (!store) {
                console.error('❌ Store not available');
                console.groupEnd();
                return false;
            }
            
            const initialSections = store.sections.length;
            console.log('Initial sections:', initialSections);
            
            // Add a section
            console.log('Adding section...');
            const sectionId = store.addSection('two_column');
            await this.wait(100);
            
            console.log('After add sections:', store.sections.length);
            
            // Undo
            console.log('Undoing section add...');
            window.undoRedoManager.undo();
            await this.wait(100);
            
            const afterUndo = store.sections.length;
            console.log('After undo sections:', afterUndo);
            
            const success = afterUndo === initialSections;
            console.log(success ? '✅ Test passed' : '❌ Test failed');
            
            console.groupEnd();
            return success;
        } catch (error) {
            console.error('❌ Test error:', error);
            console.groupEnd();
            return false;
        }
    },
    
    /**
     * Run all tests
     */
    async runAll() {
        console.log('%c🚀 Running All Undo/Redo Tests', 'color: #2196F3; font-size: 18px; font-weight: bold');
        
        const results = {
            status: this.status(),
            test1: await this.test1_AddComponentUndo(),
            test2: await this.test2_MultipleChanges(),
            test3: await this.test3_KeyboardShortcuts(),
            test4: await this.test4_ComponentUpdate(),
            test5: await this.test5_SectionChanges()
        };
        
        console.log('%c📊 Test Results', 'color: #FF9800; font-size: 16px; font-weight: bold');
        console.table(results);
        
        const allPassed = Object.values(results).every(r => r === true || (typeof r === 'object' && Object.values(r).every(v => v)));
        
        if (allPassed) {
            console.log('%c✅ All tests passed!', 'color: #4CAF50; font-size: 18px; font-weight: bold');
        } else {
            console.log('%c❌ Some tests failed', 'color: #F44336; font-size: 18px; font-weight: bold');
        }
        
        return results;
    },
    
    /**
     * Manual test instructions
     */
    manual() {
        console.log('%c📝 Manual Undo/Redo Test Instructions', 'color: #9C27B0; font-size: 16px; font-weight: bold');
        console.log('1. Add a component from the component library');
        console.log('2. Press Ctrl+Z (or Cmd+Z on Mac) - component should disappear');
        console.log('3. Press Ctrl+Y (or Cmd+Y on Mac) - component should reappear');
        console.log('4. Edit a component\'s text');
        console.log('5. Press Ctrl+Z - text should revert');
        console.log('6. Add multiple components');
        console.log('7. Press Ctrl+Z multiple times - components should disappear one by one');
        console.log('8. Press Ctrl+Y multiple times - components should reappear');
        console.log('\nCheck undo/redo button states in the toolbar');
        console.log('Run testUndoRedo.monitor() to watch state changes in real-time');
    },
    
    /**
     * Monitor state changes in real-time
     */
    monitor() {
        console.log('%c👁️ Monitoring Undo/Redo State Changes', 'color: #00BCD4; font-size: 16px; font-weight: bold');
        console.log('Perform actions and watch the state update...');
        console.log('Press Ctrl+C to stop monitoring');
        
        const interval = setInterval(() => {
            if (window.undoRedoManager) {
                const stats = window.undoRedoManager.getStats();
                console.clear();
                console.log('%c👁️ Undo/Redo Monitor', 'color: #00BCD4; font-size: 14px; font-weight: bold');
                console.log('History:', stats.totalStates, 'states');
                console.log('Position:', stats.currentIndex);
                console.log('Can Undo:', stats.canUndo ? '✅' : '❌');
                console.log('Can Redo:', stats.canRedo ? '✅' : '❌');
                if (stats.recentActions && stats.recentActions.length > 0) {
                    console.log('Recent Actions:');
                    stats.recentActions.forEach((action, i) => {
                        console.log(`  ${i + 1}. ${action}`);
                    });
                }
            }
        }, 1000);
        
        // Store interval ID for manual stopping
        window.undoRedoMonitorInterval = interval;
        
        console.log('To stop: clearInterval(window.undoRedoMonitorInterval)');
    },
    
    /**
     * Helper: Get the Vue store
     */
    getStore() {
        // Try different methods to get the store
        if (window.mediaKitStore) {
            return window.mediaKitStore;
        }
        
        if (window.gmkbApp?.$pinia) {
            const stores = window.gmkbApp.$pinia._s;
            if (stores && stores.size > 0) {
                for (const [key, store] of stores) {
                    if (key === 'mediaKit' || store.$id === 'mediaKit') {
                        return store;
                    }
                }
            }
        }
        
        if (window.useMediaKitStore) {
            try {
                return window.useMediaKitStore();
            } catch (e) {
                console.debug('Cannot instantiate store');
            }
        }
        
        return null;
    },
    
    /**
     * Helper: Wait for async operations
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    /**
     * Debug the current state
     */
    debug() {
        console.group('%c🔍 Undo/Redo Debug Information', 'color: #9E9E9E; font-size: 14px; font-weight: bold');
        
        if (window.undoRedoManager) {
            window.undoRedoManager.debug();
        }
        
        if (window.vueUndoRedoBridge) {
            window.vueUndoRedoBridge.debug();
        }
        
        console.groupEnd();
    }
};

// Show available commands
console.log('Commands:');
console.log('  testUndoRedo.status()    - Check system status');
console.log('  testUndoRedo.runAll()    - Run all automated tests');
console.log('  testUndoRedo.manual()    - Show manual test instructions');
console.log('  testUndoRedo.monitor()   - Monitor state changes');
console.log('  testUndoRedo.debug()     - Show debug information');
console.log('');
console.log('Individual tests:');
console.log('  testUndoRedo.test1_AddComponentUndo()');
console.log('  testUndoRedo.test2_MultipleChanges()');
console.log('  testUndoRedo.test3_KeyboardShortcuts()');
console.log('  testUndoRedo.test4_ComponentUpdate()');
console.log('  testUndoRedo.test5_SectionChanges()');
