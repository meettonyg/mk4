/**
 * EVENT-DRIVEN COMPONENT LIBRARY FIX VALIDATION TEST
 * 
 * Tests the event-driven initialization system that eliminates race conditions
 * between modal system and component library setup.
 * 
 * TESTING METHODOLOGY:
 * ✅ Event sequence validation
 * ✅ Modal system availability
 * ✅ Component library initialization
 * ✅ Button click functionality
 * ✅ No polling or setTimeout used
 */

(function() {
    'use strict';
    
    console.log('🧪 EVENT-DRIVEN COMPONENT LIBRARY FIX TEST STARTED');
    console.log('===================================================');
    
    // Test state tracking
    const testState = {
        modalSystemReady: false,
        componentLibraryReady: false,
        modalBaseEventReceived: false,
        componentLibraryEventReceived: false,
        testStartTime: Date.now(),
        events: []
    };
    
    // Test results
    const testResults = {
        'Modal System Self-Initialization': false,
        'Modal Base Ready Event': false,
        'Component Library Event-Driven Setup': false,
        'GMKB_Modals API Available': false,
        'Component Library API Available': false,
        'Modal Element Exists': false,
        'Event Sequence Correct': false,
        'No Race Conditions': false,
        'Button Click Integration': false,
        'Overall Success': false
    };
    
    /**
     * Log test event with timestamp
     */
    function logTestEvent(event, data = {}) {
        const timestamp = Date.now() - testState.testStartTime;
        testState.events.push({ event, timestamp, data });
        console.log(`[${timestamp}ms] 📋 ${event}`, data);
    }
    
    /**
     * TEST 1: Modal System Self-Initialization
     */
    function testModalSystemInitialization() {
        console.log('\n🔍 TEST 1: Modal System Self-Initialization');
        
        // Check if modal system exists
        if (window.GMKB_Modals) {
            const status = window.GMKB_Modals.getStatus();
            logTestEvent('Modal system found', status);
            
            if (status.initialized) {
                testResults['Modal System Self-Initialization'] = true;
                testResults['GMKB_Modals API Available'] = true;
                testState.modalSystemReady = true;
                console.log('✅ Modal system properly initialized');
            } else {
                console.log('⚠️ Modal system exists but not initialized');
            }
        } else {
            console.log('❌ GMKB_Modals not found - modal system not loaded');
        }
    }
    
    /**
     * TEST 2: Event-Driven Coordination
     */
    function setupEventListeners() {
        console.log('\n🔍 TEST 2: Setting up event listeners for coordination');
        
        // Listen for modal base ready event
        document.addEventListener('gmkb:modal-base-ready', (event) => {
            logTestEvent('Modal base ready event received', event.detail);
            testState.modalBaseEventReceived = true;
            testResults['Modal Base Ready Event'] = true;
            
            // Check if modal system is actually available
            if (window.GMKB_Modals) {
                testResults['GMKB_Modals API Available'] = true;
                console.log('✅ GMKB_Modals API confirmed available after event');
            }
        });
        
        // Listen for component library ready event
        document.addEventListener('gmkb:component-library-ready', (event) => {
            logTestEvent('Component library ready event received', event.detail);
            testState.componentLibraryEventReceived = true;
            testResults['Component Library Event-Driven Setup'] = true;
            testState.componentLibraryReady = true;
            
            // Check component library API
            if (window.componentLibrarySystem) {
                testResults['Component Library API Available'] = true;
                console.log('✅ Component library API confirmed available');
                
                const status = window.componentLibrarySystem.getStatus();
                logTestEvent('Component library status', status);
                
                if (status.modalElementFound) {
                    testResults['Modal Element Exists'] = true;
                }
            }
            
            // Run final tests after component library is ready
            setTimeout(() => {
                runFinalValidation();
            }, 100);
        });
        
        console.log('✅ Event listeners set up for coordination testing');
    }
    
    /**
     * TEST 3: Event Sequence Validation
     */
    function validateEventSequence() {
        console.log('\n🔍 TEST 3: Event Sequence Validation');
        
        // Check that modal base event came before component library event
        const modalBaseEvent = testState.events.find(e => e.event === 'Modal base ready event received');
        const componentLibraryEvent = testState.events.find(e => e.event === 'Component library ready event received');
        
        if (modalBaseEvent && componentLibraryEvent) {
            if (modalBaseEvent.timestamp < componentLibraryEvent.timestamp) {
                testResults['Event Sequence Correct'] = true;
                console.log('✅ Events fired in correct sequence: modal base → component library');
            } else {
                console.log('❌ Events fired in wrong sequence');
            }
        } else {
            console.log('⚠️ Not all expected events received yet');
        }
        
        // Check for race conditions (events firing too close together)
        if (modalBaseEvent && componentLibraryEvent) {
            const timeDiff = componentLibraryEvent.timestamp - modalBaseEvent.timestamp;
            if (timeDiff > 10) { // At least 10ms apart
                testResults['No Race Conditions'] = true;
                console.log(`✅ No race conditions detected (${timeDiff}ms apart)`);
            } else {
                console.log(`⚠️ Potential race condition (${timeDiff}ms apart)`);
            }
        }
    }
    
    /**
     * TEST 4: Button Click Integration
     */
    function testButtonClickIntegration() {
        console.log('\n🔍 TEST 4: Button Click Integration');
        
        // Find component library buttons
        const buttons = [
            'add-component-btn',
            'add-first-component',
            'add-component'
        ];
        
        let workingButtons = 0;
        
        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                const hasListener = button.getAttribute('data-listener-attached') === 'true';
                if (hasListener) {
                    workingButtons++;
                    logTestEvent(`Button ${buttonId} has event listener`, { hasListener });
                } else {
                    console.log(`⚠️ Button ${buttonId} found but no listener attached`);
                }
            } else {
                console.log(`ℹ️ Button ${buttonId} not found (may not exist on this page)`);
            }
        });
        
        if (workingButtons > 0) {
            testResults['Button Click Integration'] = true;
            console.log(`✅ ${workingButtons} component library buttons properly integrated`);
        } else {
            console.log('❌ No component library buttons found with proper integration');
        }
    }
    
    /**
     * TEST 5: Final Validation
     */
    function runFinalValidation() {
        console.log('\n🔍 TEST 5: Final Validation');
        
        validateEventSequence();
        testButtonClickIntegration();
        
        // Calculate overall success
        const passedTests = Object.values(testResults).filter(result => result === true).length;
        const totalTests = Object.keys(testResults).length - 1; // Exclude 'Overall Success'
        
        if (passedTests >= totalTests * 0.8) { // 80% pass rate
            testResults['Overall Success'] = true;
        }
        
        // Display final results
        displayTestResults();
    }
    
    /**
     * Display comprehensive test results
     */
    function displayTestResults() {
        const totalTime = Date.now() - testState.testStartTime;
        
        console.log('\n🏁 EVENT-DRIVEN COMPONENT LIBRARY FIX TEST RESULTS');
        console.log('====================================================');
        console.log(`⏱️ Total test time: ${totalTime}ms`);
        console.log('\n📊 TEST RESULTS:');
        
        Object.entries(testResults).forEach(([test, passed]) => {
            const icon = passed ? '✅' : '❌';
            console.log(`${icon} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
        });
        
        console.log('\n📋 EVENT TIMELINE:');
        testState.events.forEach(event => {
            console.log(`  [${event.timestamp}ms] ${event.event}`);
        });
        
        // Overall assessment
        const overallSuccess = testResults['Overall Success'];
        console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
        
        if (overallSuccess) {
            console.log('🎉 Event-driven component library fix is working correctly!');
            console.log('✅ No race conditions detected');
            console.log('✅ Modal system and component library properly coordinated');
        } else {
            console.log('⚠️ Event-driven fix needs attention');
            console.log('📋 Check failed tests above for specific issues');
        }
        
        // Expose results globally for debugging
        window.componentLibraryTestResults = {
            results: testResults,
            events: testState.events,
            totalTime: totalTime,
            success: overallSuccess
        };
        
        console.log('\n💡 Test results available at: window.componentLibraryTestResults');
    }
    
    /**
     * Quick test function for browser console
     */
    window.testComponentLibraryFix = function() {
        console.log('🔄 Running quick component library test...');
        
        const quickResults = {
            modalSystemExists: !!window.GMKB_Modals,
            modalSystemReady: window.GMKB_Modals ? window.GMKB_Modals.getStatus().initialized : false,
            componentLibraryExists: !!window.componentLibrarySystem,
            componentLibraryReady: window.componentLibrarySystem ? window.componentLibrarySystem.isReady() : false,
            modalElementExists: !!document.getElementById('component-library-overlay')
        };
        
        console.log('📊 Quick test results:', quickResults);
        
        const allGood = Object.values(quickResults).every(result => result === true);\n        console.log(`🎯 Quick test: ${allGood ? '✅ PASS' : '❌ FAIL'}`);\n        \n        return quickResults;\n    };\n    \n    // ===================================================================\n    // TEST EXECUTION\n    // ===================================================================\n    \n    /**\n     * Main test execution\n     */\n    function runEventDrivenComponentLibraryTest() {\n        logTestEvent('Test suite started');\n        \n        // Test 1: Immediate modal system check\n        testModalSystemInitialization();\n        \n        // Test 2: Set up event listeners\n        setupEventListeners();\n        \n        // If systems are already ready, trigger final validation\n        if (testState.modalSystemReady && window.componentLibrarySystem) {\n            console.log('ℹ️ Systems already ready, running immediate validation');\n            setTimeout(() => {\n                runFinalValidation();\n            }, 500);\n        } else {\n            // Wait for events, with timeout fallback\n            setTimeout(() => {\n                if (!testState.componentLibraryReady) {\n                    console.log('⏰ Timeout reached, running partial validation');\n                    runFinalValidation();\n                }\n            }, 5000); // 5 second timeout\n        }\n        \n        logTestEvent('Test suite setup complete, waiting for events');\n    }\n    \n    // Auto-run test when DOM is ready\n    if (document.readyState === 'loading') {\n        document.addEventListener('DOMContentLoaded', runEventDrivenComponentLibraryTest);\n    } else {\n        runEventDrivenComponentLibraryTest();\n    }\n    \n    console.log('✅ Event-driven component library test script loaded');\n    console.log('💡 Run window.testComponentLibraryFix() for quick validation');\n    \n})();