/**
 * Clean up test files from debug directory
 * Run this in browser console
 */

console.log('Starting test file cleanup...');

// List of test files found in debug directory
const testFilesToMove = [
    'quick-undo-test.js',
    'section-component-integration-fix-test.js',
    'section-component-integration-test.js',
    'test-component-interactions.js',
    'test-component-selection.js',
    'test-edit-functionality.js',
    'test-overlapping-controls-fix.js',
    'test-pods-enrichment.js',
    'test-post-id-flow.js',
    'test-section-edit-panel.js',
    'test-section-fix.js',
    'test-template-router.php',
    'test-theme-system.js',
    'test-undo-redo.js',
    'test-wordpress-save-load.js',
    'undo-redo-fix-test.js'
];

console.log(`Found ${testFilesToMove.length} test files to archive`);
console.log('Files:', testFilesToMove);

console.log('\n📝 Manual Move Instructions:');
console.log('1. These files should be moved from: debug/');
console.log('2. To: ARCHIVE/test-files/debug-tests/');
console.log('\nTest files have been identified for archiving.');
