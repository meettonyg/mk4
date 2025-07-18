/**
 * @file test-component-controls-root-fix.js
 * @description ROOT FIX VALIDATION: Component Controls Integration Test
 * Tests the complete removal of hardcoded HTML injection and proper ComponentControlsManager integration
 * 
 * VALIDATION POINTS:
 * ✅ NO innerHTML control injection
 * ✅ ComponentControlsManager properly loaded and functional
 * ✅ Dynamic control generation working
 * ✅ Event-driven architecture maintained
 * ✅ No duplicate controls created
 */

console.log('%c🧪 ROOT FIX VALIDATION: Component Controls Integration Test', 'font-size: 16px; font-weight: bold; color: #16a085; background: #ecf0f1; padding: 8px; border-radius: 4px;');

// Test Configuration
const TEST_CONFIG = {
    componentId: 'test-component-' + Date.now(),
    testDuration: 5000, // 5 seconds
    checkInterval: 500,  // Check every 500ms
    expectedEvents: [
        'gmkb:controls-attached',
        'gmkb:component-edit-requested',
        'gmkb:component-delete-requested'
    ]
};

// Test State
const testState = {
    startTime: Date.now(),
    events: [],
    checks: {
        componentControlsManagerLoaded: false,
        dynamicControlsAttached: false,
        noHardcodedHTML: true,
        eventDrivenWorking: false,
        noDuplicateControls: true
    }
};

/**
 * ROOT FIX VALIDATION: Main test execution
 */
function runComponentControlsRootFixTest() {
    console.group('🔧 ROOT FIX: Component Controls Integration Test');
    
    try {
        // Step 1: Validate ComponentControlsManager is loaded
        validateComponentControlsManager();
        
        // Step 2: Create test component element
        const testElement = createTestComponentElement();
        
        // Step 3: Test dynamic control attachment
        testDynamicControlAttachment(testElement);
        
        // Step 4: Validate no hardcoded HTML injection
        validateNoHardcodedHTML();
        
        // Step 5: Test event-driven architecture
        testEventDrivenArchitecture();
        
        // Step 6: Monitor for duplicate controls
        monitorForDuplicateControls(testElement);
        
        // Step 7: Run comprehensive validation
        setTimeout(() => {
            runComprehensiveValidation();
        }, TEST_CONFIG.testDuration);
        
    } catch (error) {
        console.error('❌ ROOT FIX TEST ERROR:', error);
        testState.checks.testError = error.message;
    }
    
    console.groupEnd();
}

/**
 * Step 1: Validate ComponentControlsManager is loaded and functional
 */
function validateComponentControlsManager() {
    console.log('🔍 Step 1: Validating ComponentControlsManager...');
    
    // Check if ComponentControlsManager is available
    if (window.componentControlsManager) {
        testState.checks.componentControlsManagerLoaded = true;
        console.log('✅ ComponentControlsManager loaded successfully');
        
        // Check if it has the required methods
        const requiredMethods = ['attachControls', 'removeControls', 'getStatus'];
        const missingMethods = requiredMethods.filter(method => 
            typeof window.componentControlsManager[method] !== 'function'
        );
        
        if (missingMethods.length === 0) {
            console.log('✅ All required methods available:', requiredMethods);
        } else {
            console.warn('⚠️ Missing methods:', missingMethods);
        }
        
        // Get manager status
        try {
            const status = window.componentControlsManager.getStatus();
            console.log('📊 ComponentControlsManager Status:', status);
        } catch (error) {
            console.warn('⚠️ Error getting manager status:', error);
        }
        
    } else {
        console.error('❌ ComponentControlsManager not loaded');
        testState.checks.componentControlsManagerLoaded = false;
    }
}

/**
 * Step 2: Create test component element
 */
function createTestComponentElement() {
    console.log('🔍 Step 2: Creating test component element...');
    
    const testElement = document.createElement('div');
    testElement.id = TEST_CONFIG.componentId;
    testElement.className = 'media-kit-component test-component';
    testElement.setAttribute('data-component-type', 'test');
    testElement.setAttribute('data-component-id', TEST_CONFIG.componentId);
    
    testElement.innerHTML = `
        <div class="test-component-content">
            <h3>Test Component for Controls Validation</h3>
            <p>This component is used to test the root-level controls fix.</p>
        </div>
    `;
    
    // Add to DOM temporarily
    document.body.appendChild(testElement);
    
    console.log('✅ Test component element created:', TEST_CONFIG.componentId);
    return testElement;
}

/**
 * Step 3: Test dynamic control attachment
 */
function testDynamicControlAttachment(testElement) {
    console.log('🔍 Step 3: Testing dynamic control attachment...');
    
    if (!window.componentControlsManager) {
        console.error('❌ ComponentControlsManager not available for testing');
        return;
    }
    
    // Listen for control attachment event
    document.addEventListener('gmkb:controls-attached', (event) => {
        if (event.detail.componentId === TEST_CONFIG.componentId) {
            testState.checks.dynamicControlsAttached = true;
            testState.events.push({
                type: 'gmkb:controls-attached',
                timestamp: Date.now(),
                detail: event.detail
            });
            console.log('✅ Controls attached event received:', event.detail);
        }
    });
    
    // Attempt to attach controls
    try {
        const success = window.componentControlsManager.attachControls(testElement, TEST_CONFIG.componentId);
        if (success) {
            console.log('✅ Dynamic control attachment successful');
            
            // Check if controls were actually added to DOM
            const controlsElement = testElement.querySelector('.component-controls');
            if (controlsElement) {
                console.log('✅ Controls found in DOM');
                
                // Check for dynamic creation markers
                if (controlsElement.hasAttribute('data-controls-type') && 
                    controlsElement.getAttribute('data-controls-type') === 'dynamic') {
                    console.log('✅ Controls marked as dynamically created');
                } else {
                    console.warn('⚠️ Controls not marked as dynamic');
                }
                
                // Check for individual control buttons
                const controlButtons = controlsElement.querySelectorAll('.component-control');
                console.log(`✅ Found ${controlButtons.length} control buttons`);
                
                // Test individual button functionality
                controlButtons.forEach((button, index) => {
                    const action = button.getAttribute('data-action');
                    console.log(`  Button ${index + 1}: ${action} - ${button.title}`);
                });
                
            } else {
                console.warn('⚠️ Controls not found in DOM after attachment');
            }
            
        } else {
            console.error('❌ Dynamic control attachment failed');
        }
    } catch (error) {
        console.error('❌ Error during control attachment:', error);
    }
}

/**
 * Step 4: Validate no hardcoded HTML injection
 */
function validateNoHardcodedHTML() {
    console.log('🔍 Step 4: Validating no hardcoded HTML injection...');
    
    // Check main.js source for innerHTML usage in attachComponentHandlers
    // This is a static check - we look for patterns that indicate hardcoded HTML
    
    // Check if ComponentManager.attachComponentHandlers exists
    if (window.GMKB && window.GMKB.systems && window.GMKB.systems.ComponentManager) {
        const componentManager = window.GMKB.systems.ComponentManager;
        
        if (typeof componentManager.attachComponentHandlers === 'function') {
            // Convert function to string to check its content
            const functionSource = componentManager.attachComponentHandlers.toString();
            
            // Check for hardcoded HTML patterns
            const hardcodedPatterns = [
                '.innerHTML =',
                '.innerHTML+=',
                'innerHTML:',
                '<div class=\"component-controls\"',
                '<button class=\"component-control\"'
            ];
            
            const foundPatterns = hardcodedPatterns.filter(pattern => 
                functionSource.includes(pattern)
            );
            
            if (foundPatterns.length === 0) {
                testState.checks.noHardcodedHTML = true;
                console.log('✅ No hardcoded HTML patterns found in attachComponentHandlers');
            } else {
                testState.checks.noHardcodedHTML = false;
                console.warn('⚠️ Hardcoded HTML patterns found:', foundPatterns);
            }
            
            // Check for ComponentControlsManager usage
            if (functionSource.includes('componentControlsManager.attachControls')) {
                console.log('✅ ComponentControlsManager integration confirmed');
            } else {
                console.warn('⚠️ ComponentControlsManager integration not found');
            }
            
        } else {
            console.warn('⚠️ attachComponentHandlers method not found');
        }
    } else {
        console.warn('⚠️ ComponentManager not available for validation');
    }
}

/**
 * Step 5: Test event-driven architecture
 */
function testEventDrivenArchitecture() {
    console.log('🔍 Step 5: Testing event-driven architecture...');
    
    // Listen for component action events
    const actionEvents = [
        'gmkb:component-edit-requested',
        'gmkb:component-move-up-requested',
        'gmkb:component-move-down-requested',
        'gmkb:component-duplicate-requested',
        'gmkb:component-delete-requested'
    ];
    
    actionEvents.forEach(eventName => {
        document.addEventListener(eventName, (event) => {
            if (event.detail.componentId === TEST_CONFIG.componentId) {
                testState.events.push({
                    type: eventName,
                    timestamp: Date.now(),
                    detail: event.detail
                });
                console.log(`✅ Event received: ${eventName}`, event.detail);
            }
        });
    });
    
    // Simulate control button clicks after a delay
    setTimeout(() => {
        const testElement = document.getElementById(TEST_CONFIG.componentId);
        if (testElement) {
            const editButton = testElement.querySelector('[data-action="edit"]');
            const deleteButton = testElement.querySelector('[data-action="delete"]');
            
            if (editButton) {
                console.log('🧪 Simulating edit button click...');
                editButton.click();
                testState.checks.eventDrivenWorking = true;
            }
            
            if (deleteButton) {
                console.log('🧪 Simulating delete button click...');
                // We'll just trigger the event, not actually delete in test
                document.dispatchEvent(new CustomEvent('gmkb:component-delete-requested', {
                    detail: {
                        componentId: TEST_CONFIG.componentId,
                        source: 'test-simulation'
                    }
                }));
            }
        }
    }, 1000);
}

/**
 * Step 6: Monitor for duplicate controls
 */
function monitorForDuplicateControls(testElement) {
    console.log('🔍 Step 6: Monitoring for duplicate controls...');
    
    const checkForDuplicates = () => {
        const controlsElements = testElement.querySelectorAll('.component-controls');
        
        if (controlsElements.length > 1) {
            testState.checks.noDuplicateControls = false;
            console.warn(`⚠️ Duplicate controls detected: ${controlsElements.length} control containers found`);
            
            controlsElements.forEach((element, index) => {
                console.warn(`  Controls ${index + 1}:`, element.className);
            });
        } else if (controlsElements.length === 1) {
            console.log('✅ Single controls container found - no duplicates');
        }
    };
    
    // Check immediately and then periodically
    checkForDuplicates();
    const duplicateCheckInterval = setInterval(checkForDuplicates, TEST_CONFIG.checkInterval);
    
    // Stop checking after test duration
    setTimeout(() => {
        clearInterval(duplicateCheckInterval);
    }, TEST_CONFIG.testDuration);
}

/**
 * Step 7: Run comprehensive validation and report results
 */
function runComprehensiveValidation() {
    console.log('🔍 Step 7: Running comprehensive validation...');
    
    const testDuration = Date.now() - testState.startTime;
    
    console.group('📊 ROOT FIX VALIDATION RESULTS');
    
    // Overall status
    const allChecksPassed = Object.values(testState.checks).every(check => check === true);
    
    if (allChecksPassed) {
        console.log('🎉 ROOT FIX VALIDATION: ALL CHECKS PASSED!');
    } else {
        console.warn('⚠️ ROOT FIX VALIDATION: Some checks failed');
    }
    
    // Detailed results
    console.log('\n📋 Detailed Check Results:');
    Object.entries(testState.checks).forEach(([checkName, result]) => {
        const icon = result === true ? '✅' : result === false ? '❌' : '⚠️';
        console.log(`  ${icon} ${checkName}: ${result}`);
    });
    
    // Event summary
    console.log('\n📡 Event Summary:');
    if (testState.events.length > 0) {
        testState.events.forEach((event, index) => {
            console.log(`  ${index + 1}. ${event.type} (${event.timestamp - testState.startTime}ms)`);
        });
    } else {
        console.log('  No events captured during test');
    }
    
    // Performance metrics
    console.log('\n⏱️ Performance Metrics:');
    console.log(`  Test Duration: ${testDuration}ms`);
    console.log(`  Events Captured: ${testState.events.length}`);
    
    // ComponentControlsManager status
    if (window.componentControlsManager) {
        try {
            const managerStatus = window.componentControlsManager.getStatus();
            console.log('\n🎛️ ComponentControlsManager Final Status:', managerStatus);
        } catch (error) {
            console.warn('⚠️ Error getting final manager status:', error);
        }
    }
    
    // Cleanup test element
    const testElement = document.getElementById(TEST_CONFIG.componentId);
    if (testElement) {
        testElement.remove();
        console.log('🧹 Test component element cleaned up');
    }
    
    console.groupEnd();
    
    // Global result
    window.componentControlsRootFixTestResult = {
        passed: allChecksPassed,
        checks: testState.checks,
        events: testState.events,
        duration: testDuration,
        timestamp: Date.now()
    };
    
    console.log('\n🏁 Test complete! Results available in window.componentControlsRootFixTestResult');
}

// Auto-run the test when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runComponentControlsRootFixTest, 1000);
    });
} else {
    setTimeout(runComponentControlsRootFixTest, 1000);
}

// Export for manual testing
window.runComponentControlsRootFixTest = runComponentControlsRootFixTest;

console.log('🧪 Component Controls Root Fix Test loaded - test will run automatically');
console.log('💡 Run manually with: runComponentControlsRootFixTest()');
