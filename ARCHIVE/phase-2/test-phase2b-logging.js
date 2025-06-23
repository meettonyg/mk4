/**
 * Test script for Phase 2B: Comprehensive Logging System
 * Run this script to verify the logging system is working correctly
 */

import { structuredLogger } from './js/utils/structured-logger.js';
import { initializationTracker } from './js/utils/initialization-tracker.js';
import { errorBoundary } from './js/utils/error-boundary.js';

console.log('🧪 Testing Phase 2B: Comprehensive Logging System\n');

// Test 1: Structured Logger
console.log('Test 1: Structured Logger');
console.log('=========================');

// Test different log levels
structuredLogger.debug('TEST', 'Debug message', { data: 'test' });
structuredLogger.info('TEST', 'Info message', { count: 42 });
structuredLogger.warn('TEST', 'Warning message', { issue: 'potential problem' });
structuredLogger.error('TEST', 'Error message', new Error('Test error'), { context: 'testing' });

// Test initialization logging
const initStart = structuredLogger.logInitStart('test-step', ['dependency1', 'dependency2']);
setTimeout(() => {
    structuredLogger.logInitComplete('test-step', initStart, { result: 'success' });
}, 100);

// Test race condition logging
structuredLogger.logRaceCondition('TEST', 'expected-state', 'actual-state', { 
    module: 'test-module',
    timing: 'before-init'
});

console.log('\n');

// Test 2: Initialization Tracker
console.log('Test 2: Initialization Tracker');
console.log('===============================');

// Register test steps
initializationTracker.registerStep('step1', {
    description: 'First test step',
    critical: true,
    timeout: 1000
});

initializationTracker.registerStep('step2', {
    description: 'Second test step',
    dependencies: ['step1'],
    critical: true,
    timeout: 1000
});

initializationTracker.registerStep('step3', {
    description: 'Third test step',
    dependencies: ['step2'],
    critical: false,
    timeout: 1000
});

// Simulate step execution
async function runTestSteps() {
    try {
        // Step 1
        const step1 = await initializationTracker.startStep('step1');
        await new Promise(resolve => setTimeout(resolve, 50));
        initializationTracker.completeStep('step1', { data: 'step1-complete' });
        
        // Step 2
        const step2 = await initializationTracker.startStep('step2');
        await new Promise(resolve => setTimeout(resolve, 75));
        initializationTracker.completeStep('step2', { data: 'step2-complete' });
        
        // Step 3
        const step3 = await initializationTracker.startStep('step3');
        await new Promise(resolve => setTimeout(resolve, 100));
        initializationTracker.completeStep('step3', { data: 'step3-complete' });
        
    } catch (error) {
        console.error('Step execution error:', error);
    }
}

runTestSteps().then(() => {
    // Generate reports
    setTimeout(() => {
        initializationTracker.generateDependencyGraph();
        initializationTracker.generateTimeline();
    }, 500);
});

console.log('\n');

// Test 3: Error Boundary
console.log('Test 3: Error Boundary');
console.log('======================');

// Test error handling
const wrappedFunction = errorBoundary.catch('TEST', () => {
    throw new Error('Intentional test error');
}, {
    fallback: 'fallback-value',
    errorType: 'TestError'
});

try {
    const result = wrappedFunction();
    console.log('Wrapped function returned:', result);
} catch (error) {
    console.log('Error was not caught by boundary:', error.message);
}

// Test async error handling
const wrappedAsync = errorBoundary.wrapAsync('TEST', async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    throw new Error('Intentional async error');
}, {
    fallback: 'async-fallback'
});

wrappedAsync().then(result => {
    console.log('Async wrapped function returned:', result);
}).catch(error => {
    console.log('Async error was not caught:', error.message);
});

console.log('\n');

// Test 4: Console Commands
console.log('Test 4: Console Commands Available');
console.log('==================================');
console.log('Try these commands in the console:');
console.log('  mkLog.report()      - Show initialization report');
console.log('  mkLog.errors()      - Show error report');
console.log('  mkLog.timing()      - Show timing report');
console.log('  mkLog.search("test") - Search logs');
console.log('  mkLog.export()      - Export logs as JSON');
console.log('  mkLog.help()        - Show all available commands');

// Generate some reports after a delay
setTimeout(() => {
    console.log('\n📊 Generating Reports...\n');
    structuredLogger.generateInitReport();
    structuredLogger.generateErrorReport();
    structuredLogger.generateTimingReport();
    errorBoundary.generateReport();
}, 1000);

console.log('\n✅ Phase 2B Logging System Test Complete!');
console.log('Check the console output above for colored, structured logs.');
console.log('The logging system is now integrated throughout the Media Kit Builder.');
