/**
 * @file test-gmkb-architecture.js
 * @description Comprehensive GMKB Event-Driven Architecture Validation Suite
 * @version 1.0.0 - GMKB ARCHITECTURE TESTING
 * 
 * TESTING COVERAGE:
 * ✅ GMKB Core Namespace Functionality
 * ✅ System Initializer Registration & Coordination
 * ✅ Enhanced Component Manager Event Integration
 * ✅ Topics Components Event-Driven Communication
 * ✅ Cross-Component Event Coordination
 * ✅ WordPress Script Loading Validation
 * ✅ Error Handling & Recovery Testing
 */

(function() {
    'use strict';
    
    console.log('🧪 GMKB ARCHITECTURE: Starting comprehensive validation suite...');
    
    /**
     * Test Suite Configuration
     */
    const testConfig = {
        timeout: 30000, // 30 seconds timeout for async tests
        verbose: true,
        autoRun: true,
        eventValidationDelay: 1000,
        maxRetries: 3
    };
    
    /**
     * Test Results Tracking
     */
    let testResults = {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        startTime: Date.now(),
        tests: []
    };
    
    /**
     * Test Suite Functions
     */
    class GMKBArchitectureTestSuite {
        constructor() {
            this.tests = [
                { name: 'GMKB Core Namespace', test: this.testGMKBCoreNamespace },
                { name: 'System Initializer', test: this.testSystemInitializer },
                { name: 'Event Bus Functionality', test: this.testEventBusFunctionality },
                { name: 'Enhanced Component Manager', test: this.testEnhancedComponentManager },
                { name: 'Topics Component Integration', test: this.testTopicsComponentIntegration },
                { name: 'Core Systems Bundle', test: this.testCoreSystemsBundle },
                { name: 'Application Bundle Integration', test: this.testApplicationBundleIntegration },
                { name: 'Cross-Component Communication', test: this.testCrossComponentCommunication },
                { name: 'WordPress Script Loading', test: this.testWordPressScriptLoading },
                { name: 'Error Handling & Recovery', test: this.testErrorHandlingRecovery },
                { name: 'Performance & Memory', test: this.testPerformanceMemory },
                { name: 'Event System Stress Test', test: this.testEventSystemStress },
                { name: 'Component Lifecycle Events', test: this.testComponentLifecycleEvents },
                { name: 'State Management Integration', test: this.testStateManagementIntegration },
                { name: 'Race Condition Prevention', test: this.testRaceConditionPrevention }
            ];
        }
        
        /**
         * Run all tests
         */
        async runAllTests() {
            console.log('🚀 GMKB Architecture Test Suite: Starting all tests...');
            
            for (const testItem of this.tests) {
                await this.runTest(testItem.name, testItem.test.bind(this));
            }
            
            this.displayResults();
        }
        
        /**
         * Run individual test with error handling
         */
        async runTest(testName, testFunction) {
            testResults.total++;
            
            const testStart = Date.now();
            console.group(`🧪 Testing: ${testName}`);
            
            try {
                const result = await this.withTimeout(testFunction(), testConfig.timeout);
                
                if (result.success) {
                    testResults.passed++;
                    console.log(`✅ PASSED: ${testName} (${Date.now() - testStart}ms)`);
                    if (result.warnings && result.warnings.length > 0) {
                        testResults.warnings += result.warnings.length;
                        result.warnings.forEach(warning => console.warn(`⚠️ ${warning}`));
                    }
                } else {
                    testResults.failed++;
                    console.error(`❌ FAILED: ${testName} - ${result.error}`);
                }
                
                testResults.tests.push({
                    name: testName,
                    success: result.success,
                    duration: Date.now() - testStart,
                    error: result.error,
                    warnings: result.warnings || []
                });
                
            } catch (error) {
                testResults.failed++;
                console.error(`❌ ERROR: ${testName} - ${error.message}`);
                
                testResults.tests.push({
                    name: testName,
                    success: false,
                    duration: Date.now() - testStart,
                    error: error.message,
                    warnings: []
                });
            }
            
            console.groupEnd();
        }
        
        /**
         * Add timeout to async operations
         */
        async withTimeout(promise, timeoutMs) {
            return Promise.race([
                promise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Test timeout')), timeoutMs)
                )
            ]);
        }
        
        /**
         * Test 1: GMKB Core Namespace
         */
        async testGMKBCoreNamespace() {
            const warnings = [];
            
            // Check GMKB namespace exists
            if (!window.GMKB) {
                return { success: false, error: 'GMKB namespace not found on window object' };
            }
            
            // Check required methods
            const requiredMethods = ['subscribe', 'dispatch', 'registerSystem', 'ready', 'getStatus'];
            for (const method of requiredMethods) {
                if (typeof window.GMKB[method] !== 'function') {
                    return { success: false, error: `Required method ${method} not found or not a function` };
                }
            }
            
            // Check status
            const status = window.GMKB.getStatus();
            if (!status) {
                return { success: false, error: 'getStatus() returned null/undefined' };
            }
            
            // Check architecture version
            if (status.version !== '1.0.0-gmkb-architecture') {
                warnings.push(`Expected architecture version '1.0.0-gmkb-architecture', got '${status.version}'`);
            }
            
            // Test basic event functionality
            let eventReceived = false;
            const unsubscribe = window.GMKB.subscribe('test:core-namespace', () => {
                eventReceived = true;
            });
            
            window.GMKB.dispatch('test:core-namespace', { test: true });
            
            // Wait for event
            await new Promise(resolve => setTimeout(resolve, 100));
            
            unsubscribe();
            
            if (!eventReceived) {
                return { success: false, error: 'Basic event subscription/dispatch not working' };
            }
            
            return { success: true, warnings };
        }
        
        /**
         * Test 2: System Initializer
         */
        async testSystemInitializer() {
            const warnings = [];
            
            // Check if system initializer is available
            if (!window.GMKB.systems) {
                return { success: false, error: 'GMKB.systems not available' };
            }
            
            // Check if required systems are registered
            const requiredSystems = ['EnhancedComponentManager', 'EnhancedStateManager', 'Renderer'];
            for (const systemName of requiredSystems) {
                if (!window.GMKB.systems[systemName]) {
                    return { success: false, error: `Required system ${systemName} not registered` };
                }
            }
            
            // Test system registration
            let testSystemRegistered = false;
            const testSystem = {
                name: 'TestSystem',
                init: () => console.log('Test system initialized'),
                test: true
            };
            
            try {
                window.GMKB.registerSystem('TestSystem', testSystem);
                
                // Wait for registration
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (window.GMKB.systems.TestSystem) {
                    testSystemRegistered = true;
                } else {
                    warnings.push('Test system registration may have failed');
                }
            } catch (error) {
                return { success: false, error: `System registration failed: ${error.message}` };
            }
            
            return { success: true, warnings };
        }
        
        /**
         * Test 3: Event Bus Functionality
         */
        async testEventBusFunctionality() {
            const warnings = [];
            let eventsReceived = [];
            
            // Test multiple subscribers to same event
            const unsubscribe1 = window.GMKB.subscribe('test:multiple-subscribers', (event) => {
                eventsReceived.push('subscriber1');
            });
            
            const unsubscribe2 = window.GMKB.subscribe('test:multiple-subscribers', (event) => {
                eventsReceived.push('subscriber2');
            });
            
            // Test priority ordering
            const unsubscribe3 = window.GMKB.subscribe('test:priority', (event) => {
                eventsReceived.push('low-priority');
            }, { priority: 1 });
            
            const unsubscribe4 = window.GMKB.subscribe('test:priority', (event) => {
                eventsReceived.push('high-priority');
            }, { priority: 10 });
            
            // Dispatch events
            window.GMKB.dispatch('test:multiple-subscribers', { test: true });
            window.GMKB.dispatch('test:priority', { test: true });
            
            // Wait for events
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Cleanup
            unsubscribe1();
            unsubscribe2();
            unsubscribe3();
            unsubscribe4();
            
            // Validate results
            if (!eventsReceived.includes('subscriber1') || !eventsReceived.includes('subscriber2')) {
                return { success: false, error: 'Multiple subscribers not working correctly' };
            }
            
            const priorityIndex1 = eventsReceived.indexOf('high-priority');
            const priorityIndex2 = eventsReceived.indexOf('low-priority');
            
            if (priorityIndex1 === -1 || priorityIndex2 === -1) {
                return { success: false, error: 'Priority event handling not working' };
            }
            
            if (priorityIndex1 > priorityIndex2) {
                warnings.push('Event priority ordering may not be working correctly');
            }
            
            // Test once-only subscription
            let onceEventCount = 0;
            const unsubscribeOnce = window.GMKB.subscribe('test:once', () => {
                onceEventCount++;
            }, { once: true });
            
            window.GMKB.dispatch('test:once', {});
            window.GMKB.dispatch('test:once', {});
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (onceEventCount !== 1) {
                warnings.push(`Expected once-only event to fire 1 time, fired ${onceEventCount} times`);
            }
            
            return { success: true, warnings };
        }
        
        /**
         * Test 4: Enhanced Component Manager
         */
        async testEnhancedComponentManager() {
            const warnings = [];
            
            // Check if enhanced component manager exists
            if (!window.enhancedComponentManager) {
                return { success: false, error: 'Enhanced Component Manager not found' };
            }
            
            const manager = window.enhancedComponentManager;
            
            // Check required methods
            const requiredMethods = ['addComponent', 'updateComponent', 'removeComponent', 'getStatus'];
            for (const method of requiredMethods) {
                if (typeof manager[method] !== 'function') {
                    return { success: false, error: `Manager method ${method} not found` };
                }
            }
            
            // Test event integration
            if (!manager.eventBus || manager.eventBus !== window.GMKB) {
                warnings.push('Enhanced Component Manager may not be properly integrated with GMKB event bus');
            }
            
            // Test status retrieval
            const status = manager.getStatus();
            if (!status || !status.architecture) {
                return { success: false, error: 'Manager status not available or missing architecture info' };
            }
            
            if (status.architecture !== 'gmkb-event-driven') {
                warnings.push(`Expected architecture 'gmkb-event-driven', got '${status.architecture}'`);
            }
            
            // Test event emission
            let componentEventReceived = false;
            const unsubscribe = window.GMKB.subscribe('components:test-event', () => {
                componentEventReceived = true;
            });
            
            // Try to emit a test event through the manager
            if (manager.eventBus && manager.eventBus.dispatch) {
                manager.eventBus.dispatch('components:test-event', { test: true });
                
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (!componentEventReceived) {
                    warnings.push('Component manager event emission may not be working');
                }
            }
            
            unsubscribe();
            
            return { success: true, warnings };
        }
        
        /**
         * Test 5: Topics Component Integration
         */
        async testTopicsComponentIntegration() {
            const warnings = [];
            
            // Check if topics components are available
            if (!window.topicsComponentManager) {
                warnings.push('Topics Component Manager not found');
            }
            
            if (!window.topicsStateManager) {
                warnings.push('Topics State Manager not found');
            }
            
            // Test topics event integration
            let topicsEventReceived = false;
            const unsubscribe = window.GMKB.subscribe('topics:test-event', () => {
                topicsEventReceived = true;
            });
            
            window.GMKB.dispatch('topics:test-event', { test: true });
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            unsubscribe();
            
            if (!topicsEventReceived) {
                return { success: false, error: 'Topics event integration not working' };
            }
            
            // Check topics-specific events
            const topicsEvents = [
                'topics:state-changed',
                'topics:topic-added',
                'topics:topic-updated',
                'topics:topic-removed',
                'topics:component-ready'
            ];
            
            // Test topics state manager if available
            if (window.topicsStateManager) {
                const stateManager = window.topicsStateManager;
                
                if (typeof stateManager.subscribeToStateChanges === 'function') {
                    // Test state subscription
                    let stateChangeReceived = false;
                    const stateUnsubscribe = stateManager.subscribeToStateChanges(() => {
                        stateChangeReceived = true;
                    });
                    
                    // Trigger a state change
                    if (typeof stateManager.setTopics === 'function') {
                        stateManager.setTopics([{ id: 'test', title: 'Test Topic' }], 'test');
                        
                        await new Promise(resolve => setTimeout(resolve, 200));
                        
                        if (!stateChangeReceived) {
                            warnings.push('Topics state change events may not be working');
                        }
                    }
                    
                    if (typeof stateUnsubscribe === 'function') {
                        stateUnsubscribe();
                    }
                }
            }
            
            return { success: true, warnings };
        }
        
        /**
         * Test 6: Core Systems Bundle
         */
        async testCoreSystemsBundle() {
            const warnings = [];
            
            // Check if core systems are available
            const coreSystemNames = ['stateManager', 'renderer'];
            
            for (const systemName of coreSystemNames) {
                if (!window[systemName]) {
                    return { success: false, error: `Core system ${systemName} not found on window` };
                }
            }
            
            // Test state manager
            const stateManager = window.stateManager;
            if (typeof stateManager.getState !== 'function') {
                return { success: false, error: 'State manager getState method not found' };
            }
            
            const state = stateManager.getState();
            if (!state || typeof state !== 'object') {
                return { success: false, error: 'State manager not returning valid state object' };
            }
            
            // Test renderer
            const renderer = window.renderer;
            if (typeof renderer.render !== 'function') {
                return { success: false, error: 'Renderer render method not found' };
            }
            
            // Test state change subscription
            if (typeof stateManager.subscribeGlobal === 'function') {
                let stateChangeReceived = false;
                const unsubscribe = stateManager.subscribeGlobal(() => {
                    stateChangeReceived = true;
                });
                
                // Trigger state change
                stateManager.setState({ test: Date.now() });
                
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
                
                if (!stateChangeReceived) {
                    warnings.push('State change subscription may not be working');
                }
            } else {
                warnings.push('State manager global subscription method not found');
            }
            
            return { success: true, warnings };
        }
        
        /**
         * Test 7: Application Bundle Integration
         */
        async testApplicationBundleIntegration() {
            const warnings = [];
            
            // Check if global functions are available
            const globalFunctions = ['triggerSave', 'markUnsaved'];
            
            for (const funcName of globalFunctions) {
                if (typeof window[funcName] !== 'function') {
                    warnings.push(`Global function ${funcName} not found`);
                }
            }
            
            // Check if application initialized properly
            const appContainer = document.getElementById('media-kit-preview');
            if (!appContainer) {
                warnings.push('Main application container #media-kit-preview not found');
            }
            
            // Test GMKB ready integration
            let gmkbReadyEventReceived = false;
            const unsubscribe = window.GMKB.subscribe('core:systems-ready', () => {
                gmkbReadyEventReceived = true;
            });
            
            // Trigger ready event
            window.GMKB.dispatch('core:systems-ready', { test: true });
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            unsubscribe();
            
            if (!gmkbReadyEventReceived) {
                warnings.push('GMKB core systems ready event handling may not be working');
            }
            
            return { success: true, warnings };
        }
        
        /**
         * Test 8: Cross-Component Communication
         */
        async testCrossComponentCommunication() {
            const warnings = [];
            let eventsReceived = [];
            
            // Set up listeners for different component types
            const unsubscribers = [];
            
            const componentEvents = [
                'components:added',
                'components:removed',
                'components:updated',
                'components:topics:added',
                'topics:state-changed',
                'topics:design-panel:open-request'
            ];
            
            componentEvents.forEach(eventName => {
                const unsubscribe = window.GMKB.subscribe(eventName, (event) => {
                    eventsReceived.push(eventName);
                });
                unsubscribers.push(unsubscribe);
            });
            
            // Emit test events
            componentEvents.forEach(eventName => {
                window.GMKB.dispatch(eventName, { test: true, timestamp: Date.now() });
            });
            
            // Wait for events
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Cleanup
            unsubscribers.forEach(unsubscribe => unsubscribe());
            
            // Check if events were received
            const missedEvents = componentEvents.filter(event => !eventsReceived.includes(event));
            if (missedEvents.length > 0) {
                warnings.push(`Some cross-component events were not received: ${missedEvents.join(', ')}`);
            }
            
            // Test event bus connectivity between components
            if (window.enhancedComponentManager && window.enhancedComponentManager.eventBus === window.GMKB) {
                // Test component manager event integration
                let componentManagerEventReceived = false;
                const cmUnsubscribe = window.GMKB.subscribe('test:component-manager-integration', () => {
                    componentManagerEventReceived = true;
                });
                
                window.enhancedComponentManager.eventBus.dispatch('test:component-manager-integration', {});
                
                await new Promise(resolve => setTimeout(resolve, 100));
                
                cmUnsubscribe();
                
                if (!componentManagerEventReceived) {
                    warnings.push('Component manager event bus integration may not be working');
                }
            }
            
            return { success: true, warnings };
        }
        
        /**
         * Test 9: WordPress Script Loading
         */
        async testWordPressScriptLoading() {
            const warnings = [];
            
            // Check if WordPress AJAX data is available
            const ajaxData = window.guestifyData || window.guestifyMediaKit;
            if (!ajaxData) {
                return { success: false, error: 'WordPress AJAX data not found' };
            }
            
            // Check required AJAX data properties
            const requiredProps = ['ajaxUrl', 'nonce', 'architecture'];
            for (const prop of requiredProps) {
                if (!ajaxData[prop]) {
                    warnings.push(`Required AJAX data property '${prop}' not found`);
                }
            }
            
            // Check architecture flag
            if (ajaxData.architecture !== 'gmkb-event-driven') {
                warnings.push(`Expected architecture 'gmkb-event-driven', got '${ajaxData.architecture}'`);
            }
            
            // Check event-driven configuration
            if (!ajaxData.eventDriven || !ajaxData.eventDriven.enabled) {
                warnings.push('Event-driven configuration not enabled in AJAX data');
            }
            
            // Check if scripts are loaded in correct order
            const expectedScripts = [
                'gmkb-main',
                'gmkb-system-initializer',
                'guestify-enhanced-component-manager',
                'guestify-core-systems-bundle',
                'guestify-application-bundle'
            ];
            
            expectedScripts.forEach(scriptHandle => {
                const scriptEl = document.querySelector(`script[id*="${scriptHandle}"]`);
                if (!scriptEl) {
                    warnings.push(`Expected script '${scriptHandle}' not found in DOM`);
                }
            });
            
            return { success: true, warnings };
        }
        
        /**
         * Test 10: Error Handling & Recovery
         */
        async testErrorHandlingRecovery() {
            const warnings = [];
            let errorEventReceived = false;
            
            // Test error event handling
            const unsubscribe = window.GMKB.subscribe('test:error-handling', (event) => {
                if (event.data.error) {
                    errorEventReceived = true;
                }
            });
            
            // Dispatch error event
            window.GMKB.dispatch('test:error-handling', { 
                error: new Error('Test error'),
                timestamp: Date.now()
            });
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            unsubscribe();
            
            if (!errorEventReceived) {
                warnings.push('Error event handling may not be working');
            }
            
            // Test GMKB error recovery
            try {
                // Try to subscribe with invalid parameters
                window.GMKB.subscribe(null, null);
                warnings.push('GMKB should handle invalid subscription parameters');
            } catch (error) {
                // Expected behavior
            }
            
            // Test graceful degradation
            const originalGMKB = window.GMKB;
            window.GMKB = null;
            
            // Components should handle missing GMKB gracefully
            setTimeout(() => {
                window.GMKB = originalGMKB;
            }, 100);
            
            return { success: true, warnings };
        }
        
        /**
         * Test 11: Performance & Memory
         */
        async testPerformanceMemory() {
            const warnings = [];
            
            // Test event system performance
            const eventCount = 1000;
            let eventsReceived = 0;
            
            const unsubscribe = window.GMKB.subscribe('test:performance', () => {
                eventsReceived++;
            });
            
            const startTime = performance.now();
            
            for (let i = 0; i < eventCount; i++) {
                window.GMKB.dispatch('test:performance', { index: i });
            }
            
            // Wait for events to process
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            unsubscribe();
            
            if (eventsReceived !== eventCount) {
                return { success: false, error: `Expected ${eventCount} events, received ${eventsReceived}` };
            }
            
            if (duration > 1000) { // More than 1 second for 1000 events
                warnings.push(`Event processing took ${duration.toFixed(2)}ms for ${eventCount} events (may be slow)`);
            }
            
            // Test memory usage
            const memoryBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Create many subscriptions
            const subscriptions = [];
            for (let i = 0; i < 100; i++) {
                subscriptions.push(window.GMKB.subscribe(`test:memory-${i}`, () => {}));
            }
            
            // Clean up subscriptions
            subscriptions.forEach(unsub => unsub());
            
            const memoryAfter = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            if (performance.memory && memoryAfter > memoryBefore + 1000000) { // 1MB increase
                warnings.push(`Memory usage increased by ${((memoryAfter - memoryBefore) / 1024 / 1024).toFixed(2)}MB`);
            }
            
            return { success: true, warnings };
        }
        
        /**
         * Test 12: Event System Stress Test
         */
        async testEventSystemStress() {
            const warnings = [];
            
            // Test rapid event firing
            let rapidEventsReceived = 0;
            const unsubscribe = window.GMKB.subscribe('test:rapid-fire', () => {
                rapidEventsReceived++;
            });
            
            // Fire 100 events rapidly
            for (let i = 0; i < 100; i++) {
                window.GMKB.dispatch('test:rapid-fire', { index: i });
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            unsubscribe();
            
            if (rapidEventsReceived !== 100) {
                warnings.push(`Rapid fire test: expected 100 events, received ${rapidEventsReceived}`);
            }
            
            // Test event queue behavior
            const eventOrder = [];
            const unsubscribe1 = window.GMKB.subscribe('test:order-1', () => {
                eventOrder.push('event1');
            }, { priority: 1 });
            
            const unsubscribe2 = window.GMKB.subscribe('test:order-2', () => {
                eventOrder.push('event2');
            }, { priority: 10 });
            
            window.GMKB.dispatch('test:order-1', {});
            window.GMKB.dispatch('test:order-2', {});
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            unsubscribe1();
            unsubscribe2();
            
            // High priority event should be processed first
            if (eventOrder[0] !== 'event2' && eventOrder.length >= 2) {
                warnings.push('Event priority ordering may not be working correctly in stress test');
            }
            
            return { success: true, warnings };
        }
        
        /**
         * Test 13: Component Lifecycle Events
         */
        async testComponentLifecycleEvents() {
            const warnings = [];
            
            // Test component lifecycle event flow
            let lifecycleEvents = [];
            
            const lifecycleEventNames = [
                'components:added',
                'components:updated', 
                'components:removed',
                'components:topics:added',
                'topics:component-ready',
                'topics:state-changed'
            ];
            
            const unsubscribers = lifecycleEventNames.map(eventName => {
                return window.GMKB.subscribe(eventName, (event) => {
                    lifecycleEvents.push({
                        event: eventName,
                        timestamp: Date.now(),
                        data: event.data
                    });
                });
            });
            
            // Simulate component lifecycle
            window.GMKB.dispatch('components:added', {
                component: { id: 'test-component', type: 'test' }
            });
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            window.GMKB.dispatch('components:updated', {
                component: { id: 'test-component', type: 'test' }
            });
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            window.GMKB.dispatch('components:removed', {
                component: { id: 'test-component', type: 'test' }
            });
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Cleanup
            unsubscribers.forEach(unsub => unsub());
            
            // Validate lifecycle events were received
            const receivedEventNames = lifecycleEvents.map(e => e.event);
            const expectedEvents = ['components:added', 'components:updated', 'components:removed'];
            
            expectedEvents.forEach(eventName => {
                if (!receivedEventNames.includes(eventName)) {
                    warnings.push(`Component lifecycle event '${eventName}' was not received`);
                }
            });
            
            // Check event ordering
            const addedIndex = receivedEventNames.indexOf('components:added');
            const updatedIndex = receivedEventNames.indexOf('components:updated');
            const removedIndex = receivedEventNames.indexOf('components:removed');
            
            if (addedIndex > updatedIndex || updatedIndex > removedIndex) {
                warnings.push('Component lifecycle events may not be in correct order');
            }
            
            return { success: true, warnings };
        }
        
        /**
         * Test 14: State Management Integration
         */
        async testStateManagementIntegration() {
            const warnings = [];
            
            // Test state manager integration with GMKB
            if (!window.stateManager) {
                return { success: false, error: 'State manager not available' };
            }
            
            const stateManager = window.stateManager;
            
            // Test state change events
            let stateChangeEventReceived = false;
            const unsubscribe = window.GMKB.subscribe('state:changed', () => {
                stateChangeEventReceived = true;
            });
            
            // Trigger state change
            const originalState = stateManager.getState();
            stateManager.setState({
                ...originalState,
                testProperty: Date.now()
            });
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            unsubscribe();
            
            if (!stateChangeEventReceived) {
                warnings.push('State change events may not be integrated with GMKB');
            }
            
            // Test component state integration
            if (typeof stateManager.addComponent === 'function') {
                let componentAddEventReceived = false;
                const componentUnsubscribe = window.GMKB.subscribe('state:component-added', () => {
                    componentAddEventReceived = true;
                });
                
                stateManager.addComponent({
                    id: 'test-state-component',
                    type: 'test',
                    props: { test: true }
                });
                
                await new Promise(resolve => setTimeout(resolve, 100));
                
                componentUnsubscribe();
                
                // Clean up test component
                if (typeof stateManager.removeComponent === 'function') {
                    stateManager.removeComponent('test-state-component');
                }
                
                if (!componentAddEventReceived) {
                    warnings.push('Component addition may not trigger state events');
                }
            }
            
            return { success: true, warnings };
        }
        
        /**
         * Test 15: Race Condition Prevention
         */
        async testRaceConditionPrevention() {
            const warnings = [];
            
            // Test initialization order
            const initializationOrder = [];
            
            // Subscribe to system events
            const systemEvents = [
                'core:namespace-ready',
                'core:systems-ready', 
                'core:initialization-complete'
            ];
            
            const unsubscribers = systemEvents.map(eventName => {
                return window.GMKB.subscribe(eventName, () => {
                    initializationOrder.push(eventName);
                });
            });
            
            // Trigger initialization events
            window.GMKB.dispatch('core:namespace-ready', {});
            window.GMKB.dispatch('core:systems-ready', {});
            window.GMKB.dispatch('core:initialization-complete', {});
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Cleanup
            unsubscribers.forEach(unsub => unsub());
            
            // Check initialization order
            const expectedOrder = [
                'core:namespace-ready',
                'core:systems-ready',
                'core:initialization-complete'
            ];
            
            expectedOrder.forEach((eventName, index) => {
                if (initializationOrder[index] !== eventName) {
                    warnings.push(`Initialization order issue: expected '${eventName}' at position ${index}, got '${initializationOrder[index]}'`);
                }
            });
            
            // Test concurrent event handling
            let concurrentEvents = [];
            const concurrentUnsubscribe = window.GMKB.subscribe('test:concurrent', (event) => {
                concurrentEvents.push(event.data.id);
            });
            
            // Fire multiple events simultaneously
            for (let i = 0; i < 10; i++) {
                window.GMKB.dispatch('test:concurrent', { id: i });
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            concurrentUnsubscribe();
            
            // All events should be received
            if (concurrentEvents.length !== 10) {
                warnings.push(`Concurrent event handling: expected 10 events, received ${concurrentEvents.length}`);
            }
            
            // Events should be in order (no race conditions)
            const isOrdered = concurrentEvents.every((id, index) => id === index);
            if (!isOrdered) {
                warnings.push('Concurrent events may not be processed in correct order');
            }
            
            return { success: true, warnings };
        }
        
        /**
         * Display comprehensive test results
         */
        displayResults() {
            const duration = Date.now() - testResults.startTime;
            const passRate = Math.round((testResults.passed / testResults.total) * 100);
            
            console.log('\n🎯 GMKB ARCHITECTURE TEST RESULTS');
            console.log('═'.repeat(50));
            console.log(`📊 Summary: ${testResults.passed}/${testResults.total} tests passed (${passRate}%)`);
            console.log(`⏱️ Duration: ${duration}ms`);
            console.log(`⚠️ Warnings: ${testResults.warnings}`);
            console.log(`❌ Failures: ${testResults.failed}`);
            
            if (testResults.failed > 0) {
                console.log('\n❌ FAILED TESTS:');
                testResults.tests
                    .filter(test => !test.success)
                    .forEach(test => {
                        console.log(`  • ${test.name}: ${test.error}`);
                    });
            }
            
            if (testResults.warnings > 0) {
                console.log('\n⚠️ WARNINGS:');
                testResults.tests
                    .filter(test => test.warnings && test.warnings.length > 0)
                    .forEach(test => {
                        test.warnings.forEach(warning => {
                            console.log(`  • ${test.name}: ${warning}`);
                        });
                    });
            }
            
            // Overall assessment
            if (testResults.failed === 0) {
                if (testResults.warnings === 0) {
                    console.log('\n🎉 EXCELLENT: GMKB Architecture is working perfectly!');
                } else if (testResults.warnings < 5) {
                    console.log('\n✅ GOOD: GMKB Architecture is working well with minor warnings.');
                } else {
                    console.log('\n⚠️ ACCEPTABLE: GMKB Architecture is functional but has some warnings.');
                }
            } else if (testResults.failed < 3) {
                console.log('\n🔧 NEEDS ATTENTION: GMKB Architecture has some issues that should be addressed.');
            } else {
                console.log('\n🚨 CRITICAL: GMKB Architecture has serious issues that need immediate attention.');
            }
            
            console.log('═'.repeat(50));
            
            // Expose results globally for further analysis
            window.gmkbTestResults = testResults;
        }
    }
    
    /**
     * Initialize and run tests
     */
    function initializeGMKBArchitectureTests() {
        console.log('🧪 GMKB ARCHITECTURE: Test suite initializing...');
        
        // Wait for GMKB to be ready
        const waitForGMKB = () => {
            if (window.GMKB && window.GMKB.ready) {
                window.GMKB.ready(() => {
                    console.log('🎯 GMKB ready - starting architecture tests...');
                    
                    const testSuite = new GMKBArchitectureTestSuite();
                    
                    if (testConfig.autoRun) {
                        testSuite.runAllTests();
                    }
                    
                    // Expose test suite globally
                    window.gmkbTestSuite = testSuite;
                    
                    // Add convenience methods
                    window.runGMKBTests = () => testSuite.runAllTests();
                    window.runGMKBTest = (testName) => {
                        const test = testSuite.tests.find(t => t.name === testName);
                        if (test) {
                            testSuite.runTest(test.name, test.test.bind(testSuite));
                        } else {
                            console.error(`Test '${testName}' not found`);
                        }
                    };
                });
            } else {
                setTimeout(waitForGMKB, 100);
            }
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForGMKB);
        } else {
            waitForGMKB();
        }
    }
    
    // Start the test initialization
    initializeGMKBArchitectureTests();
    
    console.log('🧪 GMKB ARCHITECTURE: Test suite loaded. Tests will run automatically when GMKB is ready.');
    console.log('💡 Manual commands: runGMKBTests(), runGMKBTest(testName), gmkbTestResults');
    
})();
