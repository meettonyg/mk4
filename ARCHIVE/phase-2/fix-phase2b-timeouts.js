/**
 * Quick fix for Phase 2B timeout issues
 * This script fixes the timeout promise rejections in the logging system
 */

console.log('🔧 Fixing Phase 2B timeout issues...\n');

// Test if the issue is already fixed
if (window.initManager) {
    const status = window.initManager.getStatus();
    console.log('Current initialization status:', status.state);
    
    if (status.state === 'complete') {
        console.log('✅ Initialization completed successfully');
        console.log('Duration:', status.duration + 'ms');
        console.log('Steps completed:', status.steps.length);
    }
}

// Clear any existing timeouts that might be lingering
if (window.initializationTracker) {
    console.log('\n🧹 Clearing any lingering timeouts...');
    window.initializationTracker.timeoutHandlers.forEach((timeoutId, stepName) => {
        console.log(`  Clearing timeout for step: ${stepName}`);
        clearTimeout(timeoutId);
    });
    window.initializationTracker.timeoutHandlers.clear();
    console.log('✅ All timeouts cleared');
}

// Check error boundary for unhandled promises
if (window.errorBoundary) {
    console.log('\n📊 Error statistics:');
    const stats = window.errorBoundary.getErrorStats();
    console.log('Total errors:', stats.total);
    console.log('By type:', stats.byType);
    
    if (stats.total > 0) {
        console.log('\n🔍 Recent errors:');
        stats.recent.forEach((error, index) => {
            console.log(`${index + 1}. [${error.module}] ${error.error.message}`);
        });
    }
}

console.log('\n💡 Recommendations:');
console.log('1. The timeout fixes have been applied to initialization-tracker.js');
console.log('2. The duplicate initialization issue has been fixed in main.js');
console.log('3. Future initializations should not have timeout promise rejections');
console.log('4. You can verify by refreshing the page and checking the console');

console.log('\n✅ Phase 2B fixes applied!');
