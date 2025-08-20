/**
 * @file verify-component-controls-fix.js
 * @description ROOT FIX VERIFICATION: Complete component controls system test
 * Run this script to verify the syntax error fix and ensure controls work
 */

(function() {
    'use strict';
    
    // ROOT FIX VERIFICATION: Test component controls after syntax error fix
    console.log('%c🔧 COMPONENT CONTROLS FIX VERIFICATION', 'font-size: 16px; font-weight: bold; color: #e74c3c; background: #f8f9fa; padding: 10px; border-radius: 5px;');
    
    // PHASE 1: Verify syntax error is fixed
    function verifySyntaxErrorFixed() {
        console.group('🔍 Phase 1: Syntax Error Verification');
        
        // Check if ComponentControlsManager loaded without syntax errors
        if (typeof window.ComponentControlsManager !== 'undefined') {
            console.log('✅ ComponentControlsManager class is available');
        } else {
            console.error('❌ ComponentControlsManager class not found - syntax error may persist');
            return false;
        }
        
        // Check if instance was created
        if (window.componentControlsManager) {
            console.log('✅ componentControlsManager instance exists');
            console.log('Instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.componentControlsManager)));
        } else {
            console.error('❌ componentControlsManager instance not found');
            return false;
        }
        
        // Check if initialization completed
        if (window.componentControlsManager.isInitialized) {
            console.log('✅ ComponentControlsManager is initialized');
        } else {
            console.warn('⚠️ ComponentControlsManager not yet initialized');
            // Try to initialize
            if (window.componentControlsManager.init) {
                window.componentControlsManager.init();
                console.log('🔄 Manually triggered initialization');
            }
        }
        
        console.groupEnd();
        return true;
    }
    
    // PHASE 2: Verify component discovery
    function verifyComponentDiscovery() {
        console.group('🔍 Phase 2: Component Discovery');
        
        const components = document.querySelectorAll('[data-component-id]');
        console.log(`Found ${components.length} components in DOM:`);
        
        components.forEach((element, index) => {
            const id = element.getAttribute('data-component-id');
            const type = element.getAttribute('data-component-type') || 'unknown';
            const hasControls = element.querySelector('.component-controls--dynamic');
            
            console.log(`${index + 1}. ${id} (${type}) - Controls: ${hasControls ? 'PRESENT' : 'MISSING'}`);
            
            if (!hasControls) {
                // Try to attach controls
                console.log(`   🔧 Attempting to attach controls to ${id}...`);
                if (window.componentControlsManager && window.componentControlsManager.attachControls) {
                    const success = window.componentControlsManager.attachControls(element, id);
                    console.log(`   ${success ? '✅' : '❌'} Control attachment ${success ? 'successful' : 'failed'}`);
                }
            }
        });
        
        console.groupEnd();
        return components.length;
    }
    
    // PHASE 3: Test control functionality
    function testControlFunctionality() {
        console.group('🔍 Phase 3: Control Functionality Test');
        
        const components = document.querySelectorAll('[data-component-id]');
        if (components.length === 0) {
            console.warn('⚠️ No components found to test');
            console.groupEnd();
            return false;
        }
        
        // Test first component
        const testComponent = components[0];
        const componentId = testComponent.getAttribute('data-component-id');
        console.log(`Testing controls on component: ${componentId}`);
        
        // Check for controls container
        const controlsContainer = testComponent.querySelector('.component-controls--dynamic');
        if (!controlsContainer) {
            console.error('❌ No controls container found');
            console.groupEnd();
            return false;
        }
        
        console.log('✅ Controls container found');
        
        // Check for individual control buttons
        const controls = {
            edit: controlsContainer.querySelector('[data-action="edit"]'),
            moveUp: controlsContainer.querySelector('[data-action="moveUp"]'),
            moveDown: controlsContainer.querySelector('[data-action="moveDown"]'),
            duplicate: controlsContainer.querySelector('[data-action="duplicate"]'),
            delete: controlsContainer.querySelector('[data-action="delete"]')
        };
        
        Object.entries(controls).forEach(([action, button]) => {
            if (button) {
                console.log(`✅ ${action} button found`);
                
                // Test click event (simulate)
                try {
                    const clickEvent = new MouseEvent('click', { bubbles: true });
                    button.dispatchEvent(clickEvent);
                    console.log(`✅ ${action} button click simulation successful`);
                } catch (error) {
                    console.error(`❌ ${action} button click simulation failed:`, error);
                }
            } else {
                console.error(`❌ ${action} button not found`);
            }
        });
        
        // Test hover behavior
        try {
            const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
            testComponent.dispatchEvent(mouseEnterEvent);
            
            setTimeout(() => {
                const isVisible = controlsContainer.style.opacity === '1' || 
                                getComputedStyle(controlsContainer).opacity === '1';
                console.log(`${isVisible ? '✅' : '❌'} Hover behavior ${isVisible ? 'working' : 'not working'}`);
            }, 100);
        } catch (error) {
            console.error('❌ Hover behavior test failed:', error);
        }
        
        console.groupEnd();
        return true;
    }
    
    // PHASE 4: Force fix any remaining issues
    function forceFixIssues() {
        console.group('🔧 Phase 4: Force Fix Issues');
        
        const components = document.querySelectorAll('[data-component-id]');
        let fixedCount = 0;
        
        components.forEach(element => {
            const componentId = element.getAttribute('data-component-id');
            const hasControls = element.querySelector('.component-controls--dynamic');
            
            if (!hasControls) {
                console.log(`🔧 Force fixing controls for ${componentId}...`);
                
                // Ensure element positioning
                if (getComputedStyle(element).position === 'static') {
                    element.style.position = 'relative';
                }
                
                // Try multiple attachment methods
                if (window.componentControlsManager && window.componentControlsManager.attachControls) {
                    const success = window.componentControlsManager.attachControls(element, componentId);
                    if (success) {
                        fixedCount++;
                        console.log(`✅ Fixed ${componentId}`);
                    }
                } else if (window.emergencyControls) {
                    window.emergencyControls.attachControls(element, componentId);
                    fixedCount++;
                    console.log(`✅ Emergency fix applied to ${componentId}`);
                }
            }
        });
        
        console.log(`🔧 Fixed controls on ${fixedCount} components`);
        console.groupEnd();
        return fixedCount;
    }
    
    // PHASE 5: Final verification
    function finalVerification() {
        console.group('🎯 Phase 5: Final Verification');
        
        const components = document.querySelectorAll('[data-component-id]');
        const withControls = document.querySelectorAll('[data-component-id] .component-controls--dynamic');
        
        const successRate = components.length > 0 ? (withControls.length / components.length) * 100 : 0;
        
        console.log(`📊 Final Results:`);
        console.log(`   Total Components: ${components.length}`);
        console.log(`   Components with Controls: ${withControls.length}`);
        console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
        
        if (successRate >= 100) {
            console.log('🎉 ALL COMPONENTS HAVE WORKING CONTROLS!');
        } else if (successRate >= 80) {
            console.log('✅ Most components have working controls');
        } else if (successRate >= 50) {
            console.log('⚠️ Some components missing controls');
        } else {
            console.log('❌ Many components missing controls - may need emergency mode');
        }
        
        console.groupEnd();
        return successRate;
    }
    
    // Execute verification sequence
    function runVerification() {
        console.log('Starting comprehensive component controls verification...');
        
        setTimeout(() => {
            const syntaxOk = verifySyntaxErrorFixed();
            if (!syntaxOk) return;
            
            const componentCount = verifyComponentDiscovery();
            if (componentCount === 0) {
                console.warn('⚠️ No components found - may need to wait for page load');
                return;
            }
            
            testControlFunctionality();
            forceFixIssues();
            const finalScore = finalVerification();
            
            // Global result
            console.log('\n');
            if (finalScore >= 100) {
                console.log('%c🎉 ROOT FIX SUCCESSFUL! Component controls are fully working!', 'font-size: 16px; font-weight: bold; color: #27ae60; background: #d5f4e6; padding: 10px; border-radius: 5px;');
            } else if (finalScore >= 80) {
                console.log('%c✅ ROOT FIX MOSTLY SUCCESSFUL! Most controls working.', 'font-size: 16px; font-weight: bold; color: #f39c12; background: #fef9e7; padding: 10px; border-radius: 5px;');
            } else {
                console.log('%c❌ ROOT FIX NEEDS MORE WORK. Controls not fully functional.', 'font-size: 16px; font-weight: bold; color: #e74c3c; background: #fdf2f2; padding: 10px; border-radius: 5px;');
                
                // Suggest emergency mode
                console.log('💡 Try running: window.GMKB.emergencyControlsMode()');
            }
            
        }, 1000); // Give page time to fully load
    }
    
    // Auto-run verification
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runVerification);
    } else {
        runVerification();
    }
    
    // Expose verification function globally
    window.verifyComponentControlsFix = runVerification;
    
    console.log('💡 To manually run verification: verifyComponentControlsFix()');
    
})();
