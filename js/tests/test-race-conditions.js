/**
 * Race Condition Test Suite for Media Kit Builder
 * Tests and validates fixes for all identified race conditions
 * 
 * LEGACY TEST SUITE - For backward compatibility
 * For enhanced testing, use: enhanced-race-condition-tests-2025.js
 * 
 * Race Conditions Identified:
 * 1. PHP Localization vs JS Execution
 * 2. Module Loading vs System Initialization  
 * 3. Template Fetching vs Component Rendering
 * 4. Concurrent State Updates vs Rendering
 * 5. DOM Ready vs Event Listener Setup
 */

import { structuredLogger } from '../utils/structured-logger.js';
import { enhancedStateManager } from '../core/enhanced-state-manager.js';
import { enhancedComponentRenderer } from '../core/enhanced-component-renderer.js';
import { initializationManager } from '../core/initialization-manager.js';

class RaceConditionTester {
    constructor() {
        this.logger = structuredLogger;
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
        this.stressTestCount = 100; // Number of iterations for stress tests
    }

    /**
     * Run all race condition tests
     */
    async runAllTests() {
        console.group('%c🏁 Race Condition Test Suite', 'font-size: 16px; font-weight: bold; color: #E91E63');
        this.logger.info('RACE', 'Starting comprehensive race condition tests');
        
        const startTime = performance.now();
        
        // Run each test
        await this.testPHPLocalization();        // RACE 1
        await this.testModuleLoading();          // RACE 2
        await this.testTemplateFetching();       // RACE 3
        await this.testConcurrentStateUpdates(); // RACE 4
        await this.testDOMEventListeners();      // RACE 5
        
        // Run stress tests
        await this.runStressTests();
        
        const duration = performance.now() - startTime;
        
        // Generate report
        this.generateReport(duration);
        console.groupEnd();
        
        return this.results;
    }

    /**
     * Test 1: PHP Localization vs JS Execution
     */
    async testPHPLocalization() {
        const testName = 'PHP Localization Race';
        this.logger.info('RACE', `Testing: ${testName}`);
        
        try {
            // Check if guestifyData is available immediately
            const check1 = !!window.guestifyData?.pluginUrl;
            
            // Simulate delayed PHP data
            const originalData = window.guestifyData;
            window.guestifyData = undefined;
            
            // Test initialization manager's handling
            const result = await this.logger.checkRaceCondition(
                'TEST',
                () => window.guestifyData?.pluginUrl,
                { timeout: 1000, expectedValue: true }
            );
            
            // Restore data
            window.guestifyData = originalData;
            
            const passed = check1 || result.success;
            this.recordResult(testName, passed, {
                immediate: check1,
                delayed: result.success,
                duration: result.duration
            });
            
        } catch (error) {
            this.recordResult(testName, false, { error: error.message });
        }
    }

    /**
     * Test 2: Module Loading vs System Initialization
     */
    async testModuleLoading() {
        const testName = 'Module Loading Race';
        this.logger.info('RACE', `Testing: ${testName}`);
        
        try {
            // Check if all required modules are loaded
            const requiredModules = [
                'stateManager',
                'componentManager', 
                'renderer',
                'initializer'
            ];
            
            const moduleChecks = requiredModules.map(module => ({
                module,
                loaded: !!window[module],
                type: typeof window[module]
            }));
            
            const allLoaded = moduleChecks.every(check => check.loaded);
            
            this.recordResult(testName, allLoaded, {
                modules: moduleChecks,
                initStatus: initializationManager.getStatus()
            });
            
        } catch (error) {
            this.recordResult(testName, false, { error: error.message });
        }
    }

    /**
     * Test 3: Template Fetching vs Component Rendering
     */
    async testTemplateFetching() {
        const testName = 'Template Fetching Race';
        this.logger.info('RACE', `Testing: ${testName}`);
        
        try {
            // Test concurrent template fetches
            const componentTypes = ['hero', 'topics', 'testimonials'];
            const fetchPromises = componentTypes.map(type => 
                window.dynamicComponentLoader?.getTemplate(type)
            );
            
            const startTime = performance.now();
            const results = await Promise.allSettled(fetchPromises);
            const duration = performance.now() - startTime;
            
            const successCount = results.filter(r => r.status === 'fulfilled').length;
            const passed = successCount === componentTypes.length;
            
            this.recordResult(testName, passed, {
                totalTypes: componentTypes.length,
                successful: successCount,
                duration,
                results: results.map((r, i) => ({
                    type: componentTypes[i],
                    status: r.status,
                    error: r.reason?.message
                }))
            });
            
        } catch (error) {
            this.recordResult(testName, false, { error: error.message });
        }
    }

    /**
     * Test 4: Concurrent State Updates vs Rendering (Phase 3 Focus)
     */
    async testConcurrentStateUpdates() {
        const testName = 'Concurrent State Updates';
        this.logger.info('RACE', `Testing: ${testName}`);
        
        try {
            let renderCount = 0;
            let stateUpdateCount = 0;
            let inconsistencies = 0;
            
            // Subscribe to state changes
            const unsubscribe = enhancedStateManager.subscribeGlobal((state) => {
                renderCount++;
            });
            
            // Start batch update
            enhancedStateManager.startBatchUpdate();
            
            // Perform multiple rapid state updates
            const updates = Array(10).fill(0).map((_, i) => ({
                id: `test-component-${i}`,
                type: 'test',
                props: { index: i }
            }));
            
            // Add components rapidly
            for (const update of updates) {
                enhancedStateManager.addComponent(update);
                stateUpdateCount++;
            }
            
            // Check if renders are batched
            const rendersBefore = renderCount;
            
            // End batch - should trigger single render
            enhancedStateManager.endBatchUpdate();
            
            // Wait for render
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const rendersAfter = renderCount;
            const batchedCorrectly = (rendersAfter - rendersBefore) === 1;
            
            // Verify state consistency
            const state = enhancedStateManager.getState();
            const actualComponents = Object.keys(state.components).filter(id => 
                id.startsWith('test-component-')
            ).length;
            
            inconsistencies = Math.abs(actualComponents - updates.length);
            
            // Cleanup
            updates.forEach(update => {
                enhancedStateManager.removeComponent(update.id);
            });
            unsubscribe();
            
            const passed = batchedCorrectly && inconsistencies === 0;
            
            this.recordResult(testName, passed, {
                stateUpdates: stateUpdateCount,
                renders: renderCount,
                batchedCorrectly,
                inconsistencies,
                finalComponentCount: actualComponents
            });
            
        } catch (error) {
            this.recordResult(testName, false, { error: error.message });
        }
    }

    /**
     * Test 5: DOM Ready vs Event Listener Setup (Phase 3 Focus)
     */
    async testDOMEventListeners() {
        const testName = 'DOM Event Listeners';
        this.logger.info('RACE', `Testing: ${testName}`);
        
        try {
            // Check critical UI buttons
            const criticalButtons = [
                { id: 'add-component-btn', name: 'Add Component' },
                { id: 'load-template', name: 'Load Template' },
                { id: 'global-theme-btn', name: 'Global Theme' }
            ];
            
            const buttonChecks = criticalButtons.map(btn => {
                const element = document.getElementById(btn.id);
                const hasListener = element?.hasAttribute('data-listener-attached');
                const clickable = element && !element.disabled;
                
                return {
                    ...btn,
                    exists: !!element,
                    hasListener,
                    clickable,
                    passed: !!element && hasListener && clickable
                };
            });
            
            const allPassed = buttonChecks.every(check => check.passed);
            
            this.recordResult(testName, allPassed, {
                buttons: buttonChecks,
                domReady: document.readyState,
                initComplete: initializationManager.getStatus().state === 'complete'
            });
            
        } catch (error) {
            this.recordResult(testName, false, { error: error.message });
        }
    }

    /**
     * Run stress tests for race conditions
     */
    async runStressTests() {
        this.logger.info('RACE', 'Running stress tests');
        
        const stressTests = [
            {
                name: 'Rapid State Updates',
                test: () => this.stressTestStateUpdates()
            },
            {
                name: 'Concurrent Component Operations',
                test: () => this.stressTestComponentOperations()
            },
            {
                name: 'Event Bus Overload',
                test: () => this.stressTestEventBus()
            }
        ];
        
        for (const stress of stressTests) {
            try {
                await stress.test();
            } catch (error) {
                this.recordResult(`Stress: ${stress.name}`, false, { 
                    error: error.message 
                });
            }
        }
    }

    /**
     * Stress test rapid state updates
     */
    async stressTestStateUpdates() {
        const testName = 'Stress: Rapid State Updates';
        
        let errors = 0;
        let successfulUpdates = 0;
        const startTime = performance.now();
        
        // Perform rapid fire updates
        for (let i = 0; i < this.stressTestCount; i++) {
            try {
                const component = {
                    id: `stress-test-${i}`,
                    type: 'test',
                    props: { timestamp: Date.now() }
                };
                
                enhancedStateManager.addComponent(component);
                successfulUpdates++;
                
                // Immediately update
                enhancedStateManager.updateComponent(component.id, {
                    updated: true,
                    iteration: i
                });
                
                // Random move operations
                if (Math.random() > 0.5) {
                    enhancedStateManager.moveComponent(component.id, 'up');
                }
                
            } catch (error) {
                errors++;
            }
        }
        
        // Cleanup
        for (let i = 0; i < this.stressTestCount; i++) {
            try {
                enhancedStateManager.removeComponent(`stress-test-${i}`);
            } catch (e) {
                // Ignore cleanup errors
            }
        }
        
        const duration = performance.now() - startTime;
        const passed = errors === 0;
        
        this.recordResult(testName, passed, {
            iterations: this.stressTestCount,
            successful: successfulUpdates,
            errors,
            duration,
            opsPerSecond: (this.stressTestCount / duration * 1000).toFixed(2)
        });
    }

    /**
     * Stress test concurrent component operations
     */
    async stressTestComponentOperations() {
        const testName = 'Stress: Concurrent Operations';
        
        const operations = [];
        let conflicts = 0;
        
        // Create multiple concurrent operations
        for (let i = 0; i < 20; i++) {
            operations.push(
                Promise.resolve().then(() => {
                    const id = `concurrent-${i}`;
                    enhancedStateManager.addComponent({
                        id,
                        type: 'test',
                        props: {}
                    });
                    
                    // Concurrent operations on same component
                    return Promise.all([
                        enhancedStateManager.updateComponent(id, { op: 1 }),
                        enhancedStateManager.updateComponent(id, { op: 2 }),
                        enhancedStateManager.moveComponent(id, 'down')
                    ]);
                }).catch(() => {
                    conflicts++;
                })
            );
        }
        
        await Promise.allSettled(operations);
        
        // Cleanup
        for (let i = 0; i < 20; i++) {
            try {
                enhancedStateManager.removeComponent(`concurrent-${i}`);
            } catch (e) {
                // Ignore
            }
        }
        
        const passed = conflicts === 0;
        
        this.recordResult(testName, passed, {
            totalOperations: operations.length,
            conflicts,
            successRate: ((operations.length - conflicts) / operations.length * 100).toFixed(2) + '%'
        });
    }

    /**
     * Stress test event bus with rapid events
     */
    async stressTestEventBus() {
        const testName = 'Stress: Event Bus';
        
        let eventsReceived = 0;
        let eventsSent = 0;
        let errors = 0;
        
        // Create test listener
        const testHandler = (event) => {
            eventsReceived++;
        };
        
        document.addEventListener('test-event', testHandler);
        
        const startTime = performance.now();
        
        // Fire rapid events
        for (let i = 0; i < this.stressTestCount; i++) {
            try {
                const event = new CustomEvent('test-event', {
                    detail: { index: i, timestamp: Date.now() }
                });
                document.dispatchEvent(event);
                eventsSent++;
            } catch (error) {
                errors++;
            }
        }
        
        // Wait for events to settle
        await new Promise(resolve => setTimeout(resolve, 100));
        
        document.removeEventListener('test-event', testHandler);
        
        const duration = performance.now() - startTime;
        const passed = eventsReceived === eventsSent && errors === 0;
        
        this.recordResult(testName, passed, {
            sent: eventsSent,
            received: eventsReceived,
            lost: eventsSent - eventsReceived,
            errors,
            duration,
            eventsPerSecond: (eventsSent / duration * 1000).toFixed(2)
        });
    }

    /**
     * Record test result
     */
    recordResult(testName, passed, details = {}) {
        const result = {
            test: testName,
            passed,
            timestamp: Date.now(),
            details
        };
        
        this.results.tests.push(result);
        
        if (passed) {
            this.results.passed++;
            this.logger.info('RACE', `✅ ${testName} PASSED`, details);
        } else {
            this.results.failed++;
            this.logger.error('RACE', `❌ ${testName} FAILED`, null, details);
        }
    }

    /**
     * Generate test report
     */
    generateReport(duration) {
        const total = this.results.passed + this.results.failed;
        const successRate = (this.results.passed / total * 100).toFixed(2);
        
        console.group('%c📊 Race Condition Test Report', 'font-weight: bold; font-size: 14px');
        console.log('%c' + '='.repeat(80), 'color: #666');
        
        // Summary
        console.log('%cSummary:', 'font-weight: bold; font-size: 12px');
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${this.results.passed} ✅`);
        console.log(`Failed: ${this.results.failed} ❌`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Duration: ${duration.toFixed(2)}ms`);
        
        // Individual Results
        console.log('\n%cTest Results:', 'font-weight: bold; font-size: 12px');
        this.results.tests.forEach(test => {
            const icon = test.passed ? '✅' : '❌';
            const color = test.passed ? 'color: #4CAF50' : 'color: #F44336';
            console.log(`%c${icon} ${test.test}`, color);
            
            if (!test.passed || Object.keys(test.details).length > 0) {
                console.log('   Details:', test.details);
            }
        });
        
        // Race Condition Status
        console.log('\n%cRace Condition Status:', 'font-weight: bold; font-size: 12px');
        const raceConditions = [
            { name: 'PHP Localization', test: 'PHP Localization Race' },
            { name: 'Module Loading', test: 'Module Loading Race' },
            { name: 'Template Fetching', test: 'Template Fetching Race' },
            { name: 'Concurrent State Updates', test: 'Concurrent State Updates' },
            { name: 'DOM Event Listeners', test: 'DOM Event Listeners' }
        ];
        
        raceConditions.forEach(rc => {
            const result = this.results.tests.find(t => t.test === rc.test);
            const status = result?.passed ? 'RESOLVED ✅' : 'ACTIVE ❌';
            const color = result?.passed ? 'color: #4CAF50' : 'color: #F44336';
            console.log(`%c${rc.name}: ${status}`, color);
        });
        
        console.log('%c' + '='.repeat(80), 'color: #666');
        console.groupEnd();
        
        // Log to structured logger
        this.logger.info('RACE', 'Test suite complete', {
            total,
            passed: this.results.passed,
            failed: this.results.failed,
            successRate,
            duration
        });
    }

    /**
     * Get specific race condition status
     */
    getRaceConditionStatus(raceName) {
        const test = this.results.tests.find(t => t.test.includes(raceName));
        return test ? test.passed : false;
    }

    /**
     * Export test results
     */
    exportResults() {
        return {
            summary: {
                total: this.results.passed + this.results.failed,
                passed: this.results.passed,
                failed: this.results.failed,
                successRate: (this.results.passed / (this.results.passed + this.results.failed) * 100).toFixed(2) + '%'
            },
            tests: this.results.tests,
            timestamp: Date.now()
        };
    }
}

// Create and export singleton
export const raceConditionTester = new RaceConditionTester();

// Expose globally for easy testing
window.raceTest = raceConditionTester;

// Enhanced test suite integration
window.runBothRaceTests = async () => {
    console.log('%c🔄 Running Both Legacy and Enhanced Race Tests', 'font-size: 16px; font-weight: bold; color: #9C27B0');
    
    console.log('\n1️⃣ Running Legacy Race Tests...');
    const legacyResults = await raceConditionTester.runAllTests();
    
    console.log('\n2️⃣ Running Enhanced Race Tests...');
    try {
        const enhancedModule = await import(`${window.guestifyData?.pluginUrl || window.guestifyDataBackup?.pluginUrl}js/tests/enhanced-race-condition-tests-2025.js`);
        const enhancedResults = await enhancedModule.enhancedRaceConditionTester.runEnhancedTestSuite();
        
        // Combined summary
        const legacyTotal = legacyResults.passed + legacyResults.failed;
        const enhancedTotal = enhancedResults.passed + enhancedResults.failed;
        const totalTests = legacyTotal + enhancedTotal;
        const totalPassed = legacyResults.passed + enhancedResults.passed;
        const totalFailed = legacyResults.failed + enhancedResults.failed;
        const overallRate = (totalPassed / totalTests * 100).toFixed(1);
        
        console.log('\n%c📊 COMBINED RACE TEST SUMMARY', 'font-weight: bold; font-size: 16px; color: #9C27B0');
        console.log(`Total Tests: ${totalTests} | Passed: ${totalPassed} ✅ | Failed: ${totalFailed} ❌`);
        console.log(`Overall Success Rate: ${overallRate}%`);
        console.log(`Legacy: ${legacyResults.passed}/${legacyTotal} | Enhanced: ${enhancedResults.passed}/${enhancedTotal}`);
        
        if (totalFailed === 0) {
            console.log('%c🎉 ALL RACE CONDITION TESTS PASSED!', 'color: #4CAF50; font-weight: bold; font-size: 14px');
        } else {
            console.log('%c⚠️ Some race condition tests failed', 'color: #FF9800; font-weight: bold; font-size: 14px');
        }
        
        return {
            legacy: legacyResults,
            enhanced: enhancedResults,
            combined: {
                total: totalTests,
                passed: totalPassed,
                failed: totalFailed,
                successRate: overallRate + '%'
            }
        };
        
    } catch (error) {
        console.error('❌ Enhanced tests failed to load:', error);
        return { legacy: legacyResults, enhanced: null, error: error.message };
    }
};

// Auto-run logic with enhanced support
if (window.location.search.includes('runRaceTests=true')) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.location.search.includes('enhanced=true')) {
                window.runBothRaceTests();
            } else {
                raceConditionTester.runAllTests();
            }
        }, 2000);
    });
}

// Legacy compatibility commands
console.log('%c🔗 Race Test Integration Ready', 'color: #9C27B0; font-weight: bold');
console.log('Commands: runBothRaceTests(), window.raceTest.runAllTests()');
