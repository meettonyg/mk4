/**
 * Test Vue-native Undo/Redo System
 * Pure Vue/Pinia implementation - no legacy dependencies
 * 
 * Run these commands in the browser console
 */

console.log('%c🧪 Vue Undo/Redo Test Suite', 'color: #4CAF50; font-size: 16px; font-weight: bold');

window.testVueUndo = {
    /**
     * Check system status
     */
    status() {
        const store = window.gmkbStore || window.mediaKitStore;
        if (!store) {
            console.error('❌ Store not available');
            return false;
        }
        
        console.group('📊 Vue Undo/Redo Status');
        console.log('Store available:', '✅');
        console.log('History size:', store._history?.length || 0);
        console.log('History index:', store._historyIndex || 0);
        console.log('Can undo:', store.canUndo ? store.canUndo() : false);
        console.log('Can redo:', store.canRedo ? store.canRedo() : false);
        console.groupEnd();
        
        return {
            storeAvailable: true,
            historySize: store._history?.length || 0,
            canUndo: store.canUndo ? store.canUndo() : false,
            canRedo: store.canRedo ? store.canRedo() : false
        };
    },
    
    /**
     * Test adding and undoing
     */
    async testAddUndo() {
        console.group('Test: Add Component & Undo');
        
        const store = window.gmkbStore || window.mediaKitStore;
        if (!store) {
            console.error('❌ Store not available');
            console.groupEnd();
            return false;
        }
        
        const initialCount = Object.keys(store.components).length;
        console.log('Initial components:', initialCount);
        
        // Add component
        const id = store.addComponent({ type: 'hero', data: { title: 'Test' } });
        console.log('Added component:', id);
        
        await new Promise(r => setTimeout(r, 100));
        
        const afterAdd = Object.keys(store.components).length;
        console.log('After add:', afterAdd);
        
        // Undo
        store.undo();
        console.log('Performed undo');
        
        await new Promise(r => setTimeout(r, 100));
        
        const afterUndo = Object.keys(store.components).length;
        console.log('After undo:', afterUndo);
        
        const success = afterUndo === initialCount;
        console.log(success ? '✅ Test passed' : '❌ Test failed');
        console.groupEnd();
        
        return success;
    },
    
    /**
     * Test keyboard shortcuts
     */
    testKeyboard() {
        console.group('Test: Keyboard Shortcuts');
        console.log('1. Add a component manually');
        console.log('2. Press Ctrl+Z to undo');
        console.log('3. Press Ctrl+Y to redo');
        console.log('4. Check if component disappears/reappears');
        console.groupEnd();
    },
    
    /**
     * Run all tests
     */
    async runAll() {
        console.log('%c🚀 Running Vue Undo/Redo Tests', 'color: #2196F3; font-size: 18px');
        
        const results = {
            status: this.status(),
            addUndo: await this.testAddUndo()
        };
        
        console.log('%c📊 Results:', 'color: #FF9800; font-size: 16px');
        console.table(results);
        
        this.testKeyboard();
        
        return results;
    },
    
    /**
     * Manual commands for testing
     */
    commands() {
        console.log('%c📝 Manual Test Commands:', 'color: #9C27B0; font-size: 14px');
        console.log('testVueUndo.status()    - Check status');
        console.log('testVueUndo.testAddUndo() - Test add & undo');
        console.log('testVueUndo.runAll()    - Run all tests');
        console.log('');
        console.log('Direct store commands:');
        console.log('gmkbStore.undo()        - Undo last action');
        console.log('gmkbStore.redo()        - Redo action');
        console.log('gmkbStore.canUndo()     - Check if can undo');
        console.log('gmkbStore.canRedo()     - Check if can redo');
        console.log('gmkbStore.getHistoryInfo() - Get history details');
        console.log('gmkbStore.clearHistory() - Clear all history');
    }
};

// Show available commands
testVueUndo.commands();
