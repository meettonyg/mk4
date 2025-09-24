/**
 * Test Component Controls Fix
 * Verifies that component controls are working after the fixes
 */

(function() {
    'use strict';
    
    console.log('🧪 Component Controls Test Starting...');
    
    // Test function
    window.testComponentControlsFix = function() {
        console.log('='.repeat(60));
        console.log('🧪 TESTING COMPONENT CONTROLS FIX');
        console.log('='.repeat(60));
        
        // Check all components
        const components = document.querySelectorAll('[data-component-id]');
        console.log(`Found ${components.length} components to test`);
        
        let passed = 0;
        let failed = 0;
        const issues = [];
        
        components.forEach(component => {
            const id = component.getAttribute('data-component-id');
            const controls = component.querySelector('.component-controls--dynamic');
            
            if (controls) {
                // Check control visibility on hover
                const originalOpacity = controls.style.opacity;
                const originalVisibility = controls.style.visibility;
                
                // Simulate hover
                component.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                
                // Check if controls become visible
                setTimeout(() => {
                    const isVisible = controls.style.opacity === '1' && 
                                    controls.style.visibility === 'visible';
                    
                    if (isVisible) {
                        console.log(`✅ ${id}: Controls present and responsive to hover`);
                        passed++;
                    } else {
                        console.log(`⚠️ ${id}: Controls present but not showing on hover`);
                        issues.push({
                            id,
                            issue: 'Controls not showing on hover',
                            opacity: controls.style.opacity,
                            visibility: controls.style.visibility
                        });
                        failed++;
                    }
                    
                    // Reset hover
                    component.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                }, 100);
            } else {
                console.log(`❌ ${id}: No controls found`);
                issues.push({
                    id,
                    issue: 'No controls element'
                });
                failed++;
            }
        });
        
        // Summary after delay for async checks
        setTimeout(() => {
            console.log('\n📊 TEST SUMMARY:');
            console.log(`  Total components: ${components.length}`);
            console.log(`  ✅ Passed: ${passed}`);
            console.log(`  ❌ Failed: ${failed}`);
            
            if (issues.length > 0) {
                console.log('\n⚠️ ISSUES FOUND:');
                issues.forEach(issue => {
                    console.log(`  - ${issue.id}: ${issue.issue}`);
                });
                
                console.log('\n🔧 SUGGESTED FIX:');
                console.log('  Run: fixDuplicatesAndControls()');
            } else {
                console.log('\n✅ ALL TESTS PASSED!');
            }
            
            console.log('='.repeat(60));
        }, 500);
        
        return {
            total: components.length,
            passed,
            failed,
            issues
        };
    };
    
    // Visual test - make all controls visible
    window.showAllControls = function() {
        console.log('👁️ Making all controls visible for visual inspection...');
        
        const allControls = document.querySelectorAll('.component-controls--dynamic');
        allControls.forEach(controls => {
            controls.style.opacity = '1';
            controls.style.visibility = 'visible';
            controls.style.pointerEvents = 'all';
            controls.style.border = '2px solid lime';
        });
        
        console.log(`✅ Made ${allControls.length} control sets visible`);
        console.log('  Controls are now outlined in lime green');
        
        return allControls.length;
    };
    
    // Hide all controls
    window.hideAllControls = function() {
        console.log('👁️ Hiding all controls...');
        
        const allControls = document.querySelectorAll('.component-controls--dynamic');
        allControls.forEach(controls => {
            controls.style.opacity = '';
            controls.style.visibility = '';
            controls.style.pointerEvents = '';
            controls.style.border = '';
        });
        
        console.log(`✅ Reset ${allControls.length} control sets to normal`);
        
        return allControls.length;
    };
    
    // Test control functionality
    window.testControlActions = function(componentId) {
        if (!componentId) {
            const firstComponent = document.querySelector('[data-component-id]');
            if (firstComponent) {
                componentId = firstComponent.getAttribute('data-component-id');
                console.log(`Testing first component: ${componentId}`);
            } else {
                console.error('No components found');
                return;
            }
        }
        
        console.log(`🧪 Testing control actions for ${componentId}`);
        
        const component = document.getElementById(componentId) || 
                         document.querySelector(`[data-component-id="${componentId}"]`);
        
        if (!component) {
            console.error('Component not found');
            return;
        }
        
        const controls = component.querySelector('.component-controls--dynamic');
        if (!controls) {
            console.error('Controls not found');
            return;
        }
        
        // Make controls visible
        controls.style.opacity = '1';
        controls.style.visibility = 'visible';
        controls.style.pointerEvents = 'all';
        
        // Test each button
        const buttons = controls.querySelectorAll('button[data-action]');
        console.log(`Found ${buttons.length} control buttons`);
        
        buttons.forEach(button => {
            const action = button.getAttribute('data-action');
            console.log(`  Button: ${action}`);
            console.log(`    Title: ${button.getAttribute('title')}`);
            console.log(`    Enabled: ${!button.disabled}`);
        });
        
        console.log('\n💡 To test a button, click it manually or run:');
        console.log(`  document.querySelector('[data-component-id="${componentId}"] button[data-action="edit"]').click()`);
        
        return {
            componentId,
            hasControls: true,
            buttonCount: buttons.length,
            buttons: Array.from(buttons).map(b => b.getAttribute('data-action'))
        };
    };
    
    // Auto-run test on load
    setTimeout(() => {
        console.log('\n🚀 Running automatic component controls test...');
        window.testComponentControlsFix();
    }, 2000);
    
    console.log('✅ Component Controls Test Ready');
    console.log('  Commands available:');
    console.log('  - testComponentControlsFix() - Test all components');
    console.log('  - showAllControls() - Make all controls visible');
    console.log('  - hideAllControls() - Hide all controls');
    console.log('  - testControlActions(componentId) - Test specific component');
    
})();