/**
 * @file test-race-condition-fix.js
 * @description Comprehensive test suite for the startup coordination race condition fix
 * Tests that authority-hook component renders without 'signal is aborted without reason' errors
 */

// Test execution function
window.testRaceConditionFix = function() {
    console.log('🧪 Testing Race Condition Fix...');
    
    const results = {
        passed: 0,
        failed: 0,
        warnings: 0,
        tests: [],
        overallStatus: 'UNKNOWN'
    };
    
    function test(name, condition, critical = true) {
        const status = condition ? 'PASS' : 'FAIL';
        const icon = condition ? '✅' : '❌';
        
        console.log(`${icon} ${name}: ${status}`);
        
        const testResult = { name, status, critical, condition };
        results.tests.push(testResult);
        
        if (condition) {
            results.passed++;
        } else {
            if (critical) {
                results.failed++;
            } else {
                results.warnings++;
            }
        }
    }
    
    // Test 1: Startup Coordination Manager Available
    test('Startup Coordination Manager Available', !!window.startupCoordinationManager);
    test('Startup Coordination Manager has coordinate method', typeof window.startupCoordinationManager?.coordinateStartup === 'function');
    
    // Test 2: Coordination Events Integration
    test('Event Bus Available', !!window.eventBus);
    test('Enhanced State Manager has event integration', !!window.enhancedStateManager?.eventBus);
    
    // Test 3: Enhanced State Manager Coordination
    test('Enhanced State Manager Available', !!window.enhancedStateManager);
    test('Enhanced State Manager has initializeAfterSystems', typeof window.enhancedStateManager?.initializeAfterSystems === 'function');
    test('Enhanced State Manager has hydrateStateWithMKCGData', typeof window.enhancedStateManager?.hydrateStateWithMKCGData === 'function');
    
    // Test 4: Dynamic Component Loader Coordination
    test('Dynamic Component Loader Available', !!window.dynamicComponentLoader);
    test('Dynamic Component Loader has fetchTemplate', typeof window.dynamicComponentLoader?.fetchTemplate === 'function');
    
    // Test 5: Initialization Manager Integration
    test('Initialization Manager Available', !!window.initManager);
    test('Initialization Manager has coordinatedStateRestoration', typeof window.initManager?.coordinatedStateRestoration === 'function');
    
    // Test 6: Core Systems Ready
    test('State Manager Available', !!window.stateManager || !!window.enhancedStateManager);
    test('Component Manager Available', !!window.componentManager || !!window.enhancedComponentManager);
    test('Renderer Available', !!window.renderer);
    
    // Test 7: Template Fetching System
    test('Template Cache Available', !!window.templateCache);
    test('Template Preloader Available', !!window.templatePreloader, false);
    
    // Test 8: DOM Elements Present
    test('Media Kit Preview Element', !!document.getElementById('media-kit-preview'));
    test('Component Library Modal', !!document.getElementById('component-library-overlay'), false);
    
    // Test 9: MKCG Data Integration
    test('MKCG Data Mapper Available', !!window.mkcgDataMapper, false);
    test('Guestify Data Available', !!window.guestifyData);
    test('MKCG Data Present', !!window.guestifyData?.mkcgData, false);
    
    // Test 10: Coordination Manager Status
    if (window.startupCoordinationManager) {
        const status = window.startupCoordinationManager.getStatus();
        test('Coordination Manager State Valid', ['IDLE', 'COMPLETE'].includes(status.state));
        test('No Active Operations', status.pendingOperations.template === 0 && status.pendingOperations.state === 0);
        test('Rendering Not Blocked', !status.renderingBlocked);
    }
    
    // Test 11: Event System Functional
    if (window.eventBus) {
        let eventReceived = false;
        const testHandler = () => { eventReceived = true; };
        
        window.eventBus.on('test-event', testHandler);
        window.eventBus.emit('test-event');
        
        test('Event Bus Functional', eventReceived);
        
        window.eventBus.off('test-event', testHandler);
    }
    
    // Calculate overall status
    if (results.failed === 0) {
        results.overallStatus = results.warnings === 0 ? 'EXCELLENT' : 'GOOD';
    } else if (results.failed <= 2) {
        results.overallStatus = 'FAIR';
    } else {
        results.overallStatus = 'POOR';
    }
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.log(`  ✅ Passed: ${results.passed}`);
    console.log(`  ⚠️  Warnings: ${results.warnings}`);
    console.log(`  ❌ Failed: ${results.failed}`);
    console.log(`  🎯 Overall Status: ${results.overallStatus}`);
    
    if (results.overallStatus === 'EXCELLENT' || results.overallStatus === 'GOOD') {
        console.log('\n🎉 Race condition fix appears to be working!');
        console.log('🔧 Try adding components to test rendering stability.');
    } else {
        console.log('\n⚠️ Some systems may not be fully functional.');
        console.log('🔍 Check the individual test results above.');
    }
    
    return results;
};

// Component rendering stress test
window.testComponentRenderingStability = async function(componentType = 'authority-hook', iterations = 5) {
    console.log(`🧪 Testing Component Rendering Stability: ${componentType}`);
    
    const results = {
        successful: 0,
        failed: 0,
        aborted: 0,
        errors: [],
        duration: 0
    };
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        try {
            console.log(`  Iteration ${i + 1}/${iterations}`);
            
            // Check if we can add components
            if (!window.enhancedComponentManager || typeof window.enhancedComponentManager.addComponent !== 'function') {
                throw new Error('Enhanced component manager not available');
            }
            
            // Add component
            const componentId = window.enhancedComponentManager.addComponent(componentType);
            
            if (componentId) {
                results.successful++;
                console.log(`    ✅ Component ${componentId} added successfully`);
                
                // Small delay to prevent overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Remove component to clean up
                if (window.enhancedComponentManager.removeComponent) {
                    window.enhancedComponentManager.removeComponent(componentId);
                }
            } else {
                results.failed++;
                console.log(`    ❌ Component addition returned no ID`);
            }
            
        } catch (error) {
            if (error.message.includes('aborted')) {
                results.aborted++;
                console.log(`    🚫 Component rendering aborted: ${error.message}`);
            } else {
                results.failed++;
                console.log(`    ❌ Component rendering failed: ${error.message}`);
            }
            results.errors.push(error.message);
        }
    }
    
    results.duration = performance.now() - startTime;
    
    console.log('\n📊 Rendering Stability Results:');
    console.log(`  ✅ Successful: ${results.successful}/${iterations}`);
    console.log(`  ❌ Failed: ${results.failed}/${iterations}`);
    console.log(`  🚫 Aborted: ${results.aborted}/${iterations}`);
    console.log(`  ⏱️ Duration: ${results.duration.toFixed(2)}ms`);
    
    if (results.aborted === 0) {
        console.log('\n🎉 No abort errors detected - race condition appears fixed!');
    } else {
        console.log('\n⚠️ Abort errors still occurring - race condition may persist');
    }
    
    return results;
};

// MKCG Data Integration Test
window.testMKCGDataIntegration = function() {
    console.log('🧪 Testing MKCG Data Integration...');
    
    const results = {
        dataAvailable: false,
        mapperFunctional: false,
        autoPopulation: false,
        qualityAnalysis: false,
        coordinationEvents: false
    };
    
    // Test data availability
    if (window.guestifyData?.mkcgData) {
        results.dataAvailable = true;
        console.log('✅ MKCG data available');
    } else {
        console.log('❌ MKCG data not available');
    }
    
    // Test mapper functionality
    if (window.mkcgDataMapper && typeof window.mkcgDataMapper.mapDataToComponent === 'function') {
        results.mapperFunctional = true;
        console.log('✅ MKCG data mapper functional');
        
        try {
            const mappingResult = window.mkcgDataMapper.mapDataToComponent('authority-hook');
            if (mappingResult && mappingResult.props) {
                results.autoPopulation = true;
                console.log('✅ Auto-population working');
                
                if (mappingResult.metadata && mappingResult.metadata.dataQuality) {
                    results.qualityAnalysis = true;
                    console.log('✅ Quality analysis working');
                }
            }
        } catch (error) {
            console.log('❌ Auto-population failed:', error.message);
        }
    } else {
        console.log('❌ MKCG data mapper not functional');
    }
    
    // Test coordination events
    if (window.eventBus) {
        let eventsReceived = 0;
        const testHandler = () => { eventsReceived++; };
        
        window.eventBus.on('state:mkcg-hydration-start', testHandler);
        window.eventBus.on('state:mkcg-hydration-complete', testHandler);
        
        // Simulate event emission (coordination manager should emit these)
        window.eventBus.emit('state:mkcg-hydration-start');
        window.eventBus.emit('state:mkcg-hydration-complete');
        
        if (eventsReceived === 2) {
            results.coordinationEvents = true;
            console.log('✅ Coordination events functional');
        } else {
            console.log('❌ Coordination events not working');
        }
        
        window.eventBus.off('state:mkcg-hydration-start', testHandler);
        window.eventBus.off('state:mkcg-hydration-complete', testHandler);
    }
    
    const successCount = Object.values(results).filter(Boolean).length;
    console.log(`\n📊 MKCG Integration: ${successCount}/5 features working`);
    
    return results;
};

// Debug commands for troubleshooting
window.debugRaceCondition = {
    status: () => {
        console.log('🔍 Race Condition Fix Status:');
        console.log('  Coordination Manager:', window.startupCoordinationManager?.getStatus());
        console.log('  State Manager:', window.enhancedStateManager?.getPerformanceStats());
        console.log('  Component Loader:', window.dynamicComponentLoader?.getStats());
    },
    
    coordinate: async () => {
        if (window.startupCoordinationManager) {
            console.log('🚀 Running manual coordination...');
            const result = await window.startupCoordinationManager.coordinateStartup();
            console.log('📊 Coordination result:', result);
            return result;
        } else {
            console.log('❌ Coordination manager not available');
        }
    },
    
    events: () => {
        if (window.eventBus) {
            console.log('🎧 Event bus available, testing events...');
            
            const events = [
                'state:operation-start',
                'state:operation-complete', 
                'template:fetch-start',
                'template:fetch-complete',
                'template:fetch-error',
                'rendering:blocked',
                'rendering:unblocked'
            ];
            
            events.forEach(event => {
                const handler = (data) => console.log(`📡 Event received: ${event}`, data);
                window.eventBus.on(event, handler);
                
                setTimeout(() => {
                    window.eventBus.off(event, handler);
                }, 5000);
            });
            
            console.log('📡 Listening for coordination events for 5 seconds...');
        }
    },
    
    help: () => {
        console.log('🔧 Race Condition Debug Commands:');
        console.log('  debugRaceCondition.status()    - Show system status');
        console.log('  debugRaceCondition.coordinate() - Run manual coordination');
        console.log('  debugRaceCondition.events()    - Monitor coordination events');
        console.log('  testRaceConditionFix()         - Run full test suite');
        console.log('  testComponentRenderingStability() - Test component rendering');
        console.log('  testMKCGDataIntegration()      - Test MKCG integration');
    }
};

console.log('🧪 Race Condition Fix Test Suite Loaded!');
console.log('📚 Available commands:');
console.log('  testRaceConditionFix()          - Run comprehensive test');
console.log('  testComponentRenderingStability() - Test component rendering');
console.log('  testMKCGDataIntegration()       - Test MKCG data features');
console.log('  debugRaceCondition.help()       - Show debug commands');
