/**
 * @file test-overlapping-controls-fix.js
 * @description ROOT FIX TEST: Verify overlapping controls are fixed
 * Run this to test the aggressive deduplication fix
 */

(function() {
    'use strict';
    
    console.log('%c🧹 OVERLAPPING CONTROLS FIX TEST', 'font-size: 16px; font-weight: bold; color: #e74c3c; background: #f8f9fa; padding: 10px; border-radius: 5px;');
    
    function testOverlappingControlsFix() {
        console.group('🔍 Testing Overlapping Controls Fix');
        
        // Step 1: Count existing controls
        const allControlsBeforeCleanup = document.querySelectorAll('.component-controls, .component-controls--dynamic, .emergency-controls');
        console.log(`📊 Controls found before cleanup: ${allControlsBeforeCleanup.length}`);
        
        // Step 2: Identify components
        const components = document.querySelectorAll('[data-component-id]');
        console.log(`📦 Components found: ${components.length}`);
        
        // Step 3: Check for overlapping/multiple controls per component
        let componentsWithOverlappingControls = 0;
        const componentControlCounts = {};
        
        components.forEach(component => {
            const id = component.getAttribute('data-component-id');
            const controlsInComponent = component.querySelectorAll('.component-controls, .component-controls--dynamic, .emergency-controls');
            const count = controlsInComponent.length;
            
            componentControlCounts[id] = count;
            
            if (count > 1) {
                componentsWithOverlappingControls++;
                console.warn(`⚠️ Component ${id} has ${count} control sets (OVERLAPPING)`);
                
                // Show details about overlapping controls
                controlsInComponent.forEach((ctrl, index) => {
                    console.log(`   Control ${index + 1}: ${ctrl.className}`);
                });
            } else if (count === 1) {
                console.log(`✅ Component ${id} has exactly 1 control set`);
            } else {
                console.log(`❌ Component ${id} has no controls`);
            }
        });
        
        // Step 4: Force cleanup overlapping controls
        if (componentsWithOverlappingControls > 0) {
            console.log(`🧹 Found ${componentsWithOverlappingControls} components with overlapping controls - cleaning up...`);
            
            // Use GMKB cleanup function if available
            if (window.GMKB && window.GMKB.cleanupOverlappingControls) {
                window.GMKB.cleanupOverlappingControls();
            } else {
                // Manual cleanup
                const allOverlappingControls = document.querySelectorAll('.component-controls, .emergency-controls');
                allOverlappingControls.forEach(control => control.remove());
                console.log(`🧹 Manually cleaned up ${allOverlappingControls.length} overlapping controls`);
            }
            
            // Wait a moment then re-attach properly
            setTimeout(() => {
                console.log('🔧 Re-attaching controls properly...');
                components.forEach(component => {
                    const id = component.getAttribute('data-component-id');
                    if (window.componentControlsManager && window.componentControlsManager.attachControls) {
                        window.componentControlsManager.attachControls(component, id);
                    }
                });
                
                // Verify fix
                setTimeout(() => {
                    console.log('✅ Verifying fix...');
                    const fixedComponents = document.querySelectorAll('[data-component-id]');
                    let fixedCount = 0;
                    
                    fixedComponents.forEach(component => {
                        const id = component.getAttribute('data-component-id');
                        const controlsAfterFix = component.querySelectorAll('.component-controls--dynamic');
                        
                        if (controlsAfterFix.length === 1) {
                            fixedCount++;
                            console.log(`✅ Component ${id}: Fixed - exactly 1 control set`);
                        } else if (controlsAfterFix.length > 1) {
                            console.warn(`⚠️ Component ${id}: Still has ${controlsAfterFix.length} control sets`);
                        } else {
                            console.warn(`❌ Component ${id}: No controls after fix`);
                        }
                    });
                    
                    const successRate = components.length > 0 ? (fixedCount / components.length) * 100 : 0;
                    console.log(`📊 Fix Success Rate: ${successRate.toFixed(1)}% (${fixedCount}/${components.length})`);
                    
                    if (successRate >= 100) {
                        console.log('%c🎉 OVERLAPPING CONTROLS COMPLETELY FIXED!', 'font-size: 14px; font-weight: bold; color: #27ae60; background: #d5f4e6; padding: 8px; border-radius: 4px;');
                    } else if (successRate >= 80) {
                        console.log('%c✅ Mostly fixed - minor issues remaining', 'font-size: 14px; font-weight: bold; color: #f39c12; background: #fef9e7; padding: 8px; border-radius: 4px;');
                    } else {
                        console.log('%c❌ Fix not fully successful - may need manual intervention', 'font-size: 14px; font-weight: bold; color: #e74c3c; background: #fdf2f2; padding: 8px; border-radius: 4px;');
                    }
                }, 500);
            }, 100);
            
        } else {
            console.log('✅ No overlapping controls detected - system is working correctly!');
        }
        
        console.groupEnd();
    }
    
    // Auto-run test after page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(testOverlappingControlsFix, 1000);
        });
    } else {
        setTimeout(testOverlappingControlsFix, 1000);
    }
    
    // Expose test function globally
    window.testOverlappingControlsFix = testOverlappingControlsFix;
    
    console.log('💡 To manually run test: testOverlappingControlsFix()');
    
})();
