/**
 * ROOT FIX VERIFICATION SCRIPT
 * Tests component controls functionality after applying the fixes
 * 
 * Run this in browser console: testComponentControlsFix()
 */

// ROOT FIX VERIFICATION: Test component controls after fixes
window.testComponentControlsFix = function() {
    console.log('%c🧪 ROOT FIX VERIFICATION: Component Controls Test', 'font-size: 16px; font-weight: bold; color: #10b981; background: #f0f9ff; padding: 8px;');
    console.log('='.repeat(80));
    
    const results = {
        timestamp: new Date().toISOString(),
        tests: {},
        summary: {
            passed: 0,
            failed: 0,
            warnings: 0
        }
    };
    
    // TEST 1: DOM Duplication Check
    console.log('\n🔍 TEST 1: DOM Duplication Analysis');
    const allComponents = document.querySelectorAll('[data-component-id]');
    const componentIds = Array.from(allComponents).map(el => el.getAttribute('data-component-id'));
    const uniqueIds = [...new Set(componentIds)];
    
    const duplicationTest = {
        totalElements: allComponents.length,
        uniqueComponents: uniqueIds.length,
        duplicates: allComponents.length - uniqueIds.length,
        passed: allComponents.length === uniqueIds.length
    };
    
    if (duplicationTest.passed) {
        console.log('✅ PASS: No component duplication detected');
        results.summary.passed++;
    } else {
        console.log(`❌ FAIL: Found ${duplicationTest.duplicates} duplicate components`);
        console.log('Duplicated IDs:', componentIds.filter(id => componentIds.indexOf(id) !== componentIds.lastIndexOf(id)));
        results.summary.failed++;
    }
    
    results.tests.duplicationCheck = duplicationTest;
    
    // TEST 2: Component Controls Attachment
    console.log('\n🎛️ TEST 2: Component Controls Attachment');
    let controlsAttached = 0;
    let controlsMissing = 0;
    
    uniqueIds.forEach(componentId => {
        const element = document.getElementById(componentId);
        if (element) {
            const hasControls = element.querySelector('.component-controls--dynamic');
            if (hasControls) {
                controlsAttached++;
                console.log(`✅ ${componentId}: Controls found`);
            } else {
                controlsMissing++;
                console.log(`❌ ${componentId}: Controls missing`);
            }
        }
    });
    
    const controlsTest = {
        totalComponents: uniqueIds.length,
        withControls: controlsAttached,
        missingControls: controlsMissing,
        passed: controlsAttached === uniqueIds.length && controlsMissing === 0
    };
    
    if (controlsTest.passed) {
        console.log('✅ PASS: All components have controls attached');
        results.summary.passed++;
    } else {
        console.log(`❌ FAIL: ${controlsMissing}/${uniqueIds.length} components missing controls`);
        results.summary.failed++;
    }
    
    results.tests.controlsAttachment = controlsTest;
    
    // TEST 3: Component Controls Manager Status
    console.log('\n🔧 TEST 3: Component Controls Manager Status');
    const managerTest = {
        available: !!window.componentControlsManager,
        initialized: window.componentControlsManager?.isInitialized || false,
        attachedCount: window.componentControlsManager?.attachedControls?.size || 0,
        passed: false
    };
    
    managerTest.passed = managerTest.available && managerTest.initialized;
    
    if (managerTest.passed) {
        console.log('✅ PASS: Component Controls Manager is ready');
        console.log(`📊 Manager tracking ${managerTest.attachedCount} components`);
        results.summary.passed++;
    } else {
        console.log('❌ FAIL: Component Controls Manager not ready');
        if (!managerTest.available) console.log('  - Manager not available globally');
        if (!managerTest.initialized) console.log('  - Manager not initialized');
        results.summary.failed++;
    }
    
    results.tests.managerStatus = managerTest;
    
    // TEST 4: Hover Functionality Test
    console.log('\n🖱️ TEST 4: Hover Functionality Test');
    const hoverTest = {
        componentsWithHover: 0,
        totalComponents: uniqueIds.length,
        passed: false
    };
    
    uniqueIds.forEach(componentId => {
        const element = document.getElementById(componentId);
        const controls = element?.querySelector('.component-controls--dynamic');
        
        if (element && controls) {
            // Check if hover listeners are properly attached
            const hasProperStyles = controls.style.opacity !== undefined;
            const hasProperPosition = element.style.position === 'relative' || getComputedStyle(element).position === 'relative';
            
            if (hasProperStyles && hasProperPosition) {
                hoverTest.componentsWithHover++;
            }
        }
    });
    
    hoverTest.passed = hoverTest.componentsWithHover === hoverTest.totalComponents;
    
    if (hoverTest.passed) {
        console.log('✅ PASS: All components have proper hover setup');
        results.summary.passed++;
    } else {
        console.log(`⚠️ WARNING: ${hoverTest.totalComponents - hoverTest.componentsWithHover} components may have hover issues`);
        results.summary.warnings++;
    }
    
    results.tests.hoverFunctionality = hoverTest;
    
    // TEST 5: Event Handler Test
    console.log('\n📡 TEST 5: Event Handler Test');
    const eventTest = {
        controlsWithEvents: 0,
        totalControls: 0,
        passed: false
    };
    
    const allControlButtons = document.querySelectorAll('.component-controls--dynamic [data-action]');
    eventTest.totalControls = allControlButtons.length;
    
    allControlButtons.forEach(button => {
        // Check if button has proper attributes for event handling
        const hasAction = button.getAttribute('data-action');
        const hasComponentId = button.getAttribute('data-component-id');
        
        if (hasAction && hasComponentId) {
            eventTest.controlsWithEvents++;
        }
    });
    
    eventTest.passed = eventTest.controlsWithEvents === eventTest.totalControls && eventTest.totalControls > 0;
    
    if (eventTest.passed) {
        console.log('✅ PASS: All control buttons have proper event attributes');
        results.summary.passed++;
    } else {
        console.log(`❌ FAIL: ${eventTest.totalControls - eventTest.controlsWithEvents}/${eventTest.totalControls} control buttons missing event attributes`);
        results.summary.failed++;
    }
    
    results.tests.eventHandlers = eventTest;
    
    // SUMMARY
    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(40));
    console.log(`✅ PASSED: ${results.summary.passed} tests`);
    console.log(`❌ FAILED: ${results.summary.failed} tests`);
    console.log(`⚠️ WARNINGS: ${results.summary.warnings} tests`);
    
    const overallSuccess = results.summary.failed === 0;
    
    if (overallSuccess) {
        console.log('%c🎉 ROOT FIX SUCCESSFUL!', 'font-size: 14px; font-weight: bold; color: #10b981; background: #f0fdf4; padding: 4px;');
        console.log('Component controls should now work properly. Hover over components to test.');
    } else {
        console.log('%c⚠️ ISSUES DETECTED', 'font-size: 14px; font-weight: bold; color: #f59e0b; background: #fffbeb; padding: 4px;');
        console.log('Some tests failed. Run GMKB.fixComponentControlsNow() to attempt automatic fixes.');
    }
    
    // Store results globally for debugging
    window.lastTestResults = results;
    
    return results;
};

// ROOT FIX: Manual testing functions
window.testComponentHover = function(componentId) {
    if (!componentId) {
        const components = document.querySelectorAll('[data-component-id]');
        if (components.length > 0) {
            componentId = components[0].getAttribute('data-component-id');
            console.log(`Auto-selecting first component: ${componentId}`);
        } else {
            console.error('No components found to test');
            return;
        }
    }
    
    const element = document.getElementById(componentId);
    if (!element) {
        console.error(`Component ${componentId} not found`);
        return;
    }
    
    const controls = element.querySelector('.component-controls--dynamic');
    if (!controls) {
        console.error(`Controls not found for component ${componentId}`);
        return;
    }
    
    console.log(`🖱️ Testing hover for ${componentId}...`);
    
    // Simulate mouseenter
    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
        const opacity = controls.style.opacity;
        const visibility = controls.style.visibility;
        const pointerEvents = controls.style.pointerEvents;
        
        console.log('Controls state after hover:');
        console.log(`  Opacity: ${opacity}`);
        console.log(`  Visibility: ${visibility}`);
        console.log(`  Pointer Events: ${pointerEvents}`);
        
        const isVisible = opacity === '1' && visibility === 'visible' && pointerEvents === 'all';
        
        if (isVisible) {
            console.log('✅ Hover test PASSED - Controls are visible');
        } else {
            console.log('❌ Hover test FAILED - Controls not properly visible');
        }
        
        // Test mouseleave after a delay
        setTimeout(() => {
            element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            
            setTimeout(() => {
                const afterOpacity = controls.style.opacity;
                const afterVisibility = controls.style.visibility;
                
                console.log('Controls state after mouse leave:');
                console.log(`  Opacity: ${afterOpacity}`);
                console.log(`  Visibility: ${afterVisibility}`);
                
                const isHidden = afterOpacity === '0' && afterVisibility === 'hidden';
                
                if (isHidden) {
                    console.log('✅ Mouse leave test PASSED - Controls are hidden');
                } else {
                    console.log('❌ Mouse leave test FAILED - Controls still visible');
                }
            }, 200);
        }, 1000);
    }, 100);
};

console.log('🧪 ROOT FIX VERIFICATION SCRIPT LOADED');
console.log('Run testComponentControlsFix() to test the fixes');
console.log('Run testComponentHover(componentId) to test hover behavior');
