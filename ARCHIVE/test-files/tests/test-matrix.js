/**
 * GMKB Test Matrix - Quick Reference Table
 * Run this script to see all available tests
 */

if (typeof GMKBTest === 'undefined') {
    console.error('❌ GMKBTest harness not loaded. Please load console-test-suite.js first.');
} else {
    // Test matrix data
    const testMatrix = [
        // Component System Tests
        { id: 'A1', category: 'Component System', purpose: 'Component Discovery & Availability', command: 'GMKBTest.tests.A1()' },
        { id: 'A2', category: 'Component System', purpose: 'Add Component → Render → Attach Controls', command: 'GMKBTest.tests.A2()' },
        { id: 'A3', category: 'Component System', purpose: 'Edit Component via Design Panel', command: 'GMKBTest.tests.A3()' },
        { id: 'A4', category: 'Component System', purpose: 'Duplicate Component', command: 'GMKBTest.tests.A4()' },
        { id: 'A5', category: 'Component System', purpose: 'Delete Component', command: 'GMKBTest.tests.A5()' },
        { id: 'A6', category: 'Component System', purpose: 'Reorder Components', command: 'GMKBTest.tests.A6()' },
        
        // State Management Tests
        { id: 'B1', category: 'State Management', purpose: 'Initialize from Saved Data', command: 'GMKBTest.tests.B1()' },
        { id: 'B2', category: 'State Management', purpose: 'Auto-save after Edits', command: 'GMKBTest.tests.B2()' },
        { id: 'B3', category: 'State Management', purpose: 'Undo/Redo Sequence', command: 'GMKBTest.tests.B3()' },
        { id: 'B4', category: 'State Management', purpose: 'State Snapshot & Compare', command: 'GMKBTest.tests.B4()' },
        
        // UI Integration Tests
        { id: 'C1', category: 'UI Integration', purpose: 'Component Library Modal', command: 'GMKBTest.tests.C1()' },
        { id: 'C2', category: 'UI Integration', purpose: 'Toolbar Button Functionality', command: 'GMKBTest.tests.C2()' },
        { id: 'C3', category: 'UI Integration', purpose: 'Sidebar Tabs & Design Panel', command: 'GMKBTest.tests.C3()' },
        { id: 'C4', category: 'UI Integration', purpose: 'Device Viewport Switching', command: 'GMKBTest.tests.C4()' },
        
        // WordPress Integration Tests
        { id: 'D1', category: 'WordPress Integration', purpose: 'Localized Data Presence', command: 'GMKBTest.tests.D1()' },
        { id: 'D2', category: 'WordPress Integration', purpose: 'AJAX Nonce Validation', command: 'GMKBTest.tests.D2()' },
        { id: 'D3', category: 'WordPress Integration', purpose: 'Error Handling Surface', command: 'GMKBTest.tests.D3()' },
        
        // MKCG Integration Tests
        { id: 'E1', category: 'MKCG Integration', purpose: 'Mapped Data Population', command: 'GMKBTest.tests.E1()' },
        { id: 'E2', category: 'MKCG Integration', purpose: 'Field Format Translation', command: 'GMKBTest.tests.E2()' },
        
        // Performance & Resilience Tests
        { id: 'F1', category: 'Performance', purpose: 'Burst Operations Handling', command: 'GMKBTest.tests.F1()' },
        { id: 'F2', category: 'Performance', purpose: 'Render Time Metrics', command: 'GMKBTest.tests.F2()' },
        { id: 'F3', category: 'Performance', purpose: 'Memory Usage Sanity Check', command: 'GMKBTest.tests.F3()' }
    ];
    
    console.clear();
    console.log('🧪 GMKB Console Test Suite - Test Matrix');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    
    // Group by category
    const categories = [...new Set(testMatrix.map(test => test.category))];
    
    categories.forEach(category => {
        console.group(`📂 ${category}`);
        const categoryTests = testMatrix.filter(test => test.category === category);
        console.table(categoryTests, ['id', 'purpose', 'command']);
        console.groupEnd();
        console.log('');
    });
    
    console.log('📋 Quick Commands:');
    console.log('  GMKBTest.run("smoke")  - Run smoke tests (safe, fast)');
    console.log('  GMKBTest.run("full")   - Run all tests (comprehensive)');
    console.log('  GMKBTest.cleanup()    - Clean up test artifacts');
    console.log('  GMKBTest.snapshot("name") - Take state snapshot');
    console.log('');
    console.log('🔧 Configuration:');
    console.log('  GMKBTest.config.timeout = 5000    - Set timeout (ms)');
    console.log('  GMKBTest.config.verbose = true     - Enable verbose logging');
    console.log('  GMKBTest.config.cleanup = true     - Auto-cleanup between tests');
    console.log('  GMKBTest.config.failFast = false   - Stop on first failure');
    console.log('');
    console.log('✨ Example Usage:');
    console.log('  await GMKBTest.tests.A1()  - Run single test');
    console.log('  await GMKBTest.run("smoke") - Run smoke test suite');
    console.log('');
    
    // Export the matrix for reference
    window.GMKBTestMatrix = testMatrix;
}
