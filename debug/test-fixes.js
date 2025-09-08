/**
 * Test Script for Media Kit Builder Fixes
 * Run this in console to verify all fixes are working
 * 
 * @version 1.0.0
 * @date 2025-01-03
 */

(function() {
    'use strict';
    
    console.log('🧪 TESTING MEDIA KIT BUILDER FIXES');
    console.log('=' .repeat(60));
    
    const results = {
        moveButtons: false,
        devicePreview: false,
        themeCustomizer: false,
        componentCount: 0,
        issues: []
    };
    
    // Test 1: Check if move buttons exist and are visible
    console.log('\n📍 TEST 1: Move Up/Down Buttons');
    const testMoveButtons = () => {
        const moveGroups = document.querySelectorAll('.component-control-group--move');
        const moveUpButtons = document.querySelectorAll('.component-control--move-up');
        const moveDownButtons = document.querySelectorAll('.component-control--move-down');
        
        console.log(`  Found ${moveGroups.length} move groups`);
        console.log(`  Found ${moveUpButtons.length} move up buttons`);
        console.log(`  Found ${moveDownButtons.length} move down buttons`);
        
        if (moveUpButtons.length > 0 && moveDownButtons.length > 0) {
            // Check if they're visible
            const firstMoveUp = moveUpButtons[0];
            const styles = window.getComputedStyle(firstMoveUp);
            const isVisible = styles.display !== 'none' && styles.visibility !== 'hidden';
            
            if (isVisible) {
                console.log('  ✅ Move buttons exist and are styled to be visible');
                results.moveButtons = true;
            } else {
                console.log('  ⚠️ Move buttons exist but may not be visible');
                results.issues.push('Move buttons exist but visibility issue detected');
            }
            
            // Test functionality
            const testComponent = document.querySelector('[data-component-id]');
            if (testComponent) {
                const componentId = testComponent.getAttribute('data-component-id');
                console.log(`  Testing move functionality for: ${componentId}`);
                
                // Simulate move up event
                document.dispatchEvent(new CustomEvent('gmkb:component-move-up-requested', {
                    detail: { componentId }
                }));
                
                console.log('  ✅ Move up event dispatched successfully');
            }
        } else {
            console.log('  ❌ Move buttons not found or insufficient');
            results.issues.push('Move buttons not generated for components');
        }
    };
    testMoveButtons();
    
    // Test 2: Check device preview buttons
    console.log('\n📍 TEST 2: Device Preview Buttons');
    const testDevicePreview = () => {
        let previewButtons = document.querySelectorAll('.toolbar__preview-btn');
        
        if (!previewButtons.length) {
            console.log('  Creating device preview buttons...');
            // Try to trigger creation
            if (window.consolidatedToolbar && window.consolidatedToolbar.createDevicePreviewButtons) {
                window.consolidatedToolbar.createDevicePreviewButtons();
                previewButtons = document.querySelectorAll('.toolbar__preview-btn');
            }
        }
        
        console.log(`  Found ${previewButtons.length} device preview buttons`);
        
        if (previewButtons.length >= 3) {
            console.log('  ✅ Device preview buttons exist');
            results.devicePreview = true;
            
            // Check for responsive styles
            const deviceStyles = document.getElementById('device-preview-styles');
            if (deviceStyles) {
                console.log('  ✅ Device preview styles loaded');
            } else {
                console.log('  ⚠️ Device preview styles not found');
                results.issues.push('Device preview styles not loaded');
            }
        } else {
            console.log('  ❌ Device preview buttons missing');
            results.issues.push('Device preview buttons not created');
        }
    };
    testDevicePreview();
    
    // Test 3: Check theme customizer
    console.log('\n📍 TEST 3: Theme Customizer');
    const testThemeCustomizer = () => {
        const themeButton = document.querySelector('.gmkb-theme-button');
        const themeDropdown = document.querySelector('.gmkb-theme-dropdown');
        const customizerPanel = document.getElementById('gmkb-theme-customizer');
        
        console.log(`  Theme button: ${themeButton ? 'Found' : 'Not found'}`);
        console.log(`  Theme dropdown: ${themeDropdown ? 'Found' : 'Not found'}`);
        console.log(`  Customizer panel: ${customizerPanel ? 'Found' : 'Not found'}`);
        
        if (themeButton && themeDropdown) {
            console.log('  ✅ Theme customizer UI exists');
            results.themeCustomizer = true;
            
            // Check if theme manager is available
            if (window.themeManager) {
                const themes = window.themeManager.getAvailableThemes();
                console.log(`  ✅ Theme manager loaded with ${themes.length} themes`);
            } else {
                console.log('  ⚠️ Theme manager not loaded');
                results.issues.push('Theme manager not initialized');
            }
        } else {
            console.log('  ❌ Theme customizer UI missing');
            results.issues.push('Theme customizer UI not created');
        }
    };
    testThemeCustomizer();
    
    // Test 4: Count visible components
    console.log('\n📍 TEST 4: Component Count');
    const testComponentCount = () => {
        const allComponents = document.querySelectorAll('[data-component-id]');
        const visibleComponents = Array.from(allComponents).filter(el => {
            const styles = window.getComputedStyle(el);
            return styles.display !== 'none' && styles.visibility !== 'hidden';
        });
        
        console.log(`  Total components in DOM: ${allComponents.length}`);
        console.log(`  Visible components: ${visibleComponents.length}`);
        
        results.componentCount = visibleComponents.length;
        
        if (allComponents.length > visibleComponents.length) {
            console.log('  ⚠️ Some components are hidden');
            results.issues.push(`${allComponents.length - visibleComponents.length} components are hidden`);
            
            // Check container visibility
            const savedContainer = document.getElementById('saved-components-container');
            const previewContainer = document.getElementById('media-kit-preview');
            
            if (savedContainer) {
                const containerStyle = window.getComputedStyle(savedContainer);
                console.log(`  saved-components-container display: ${containerStyle.display}`);
            }
            
            if (previewContainer) {
                const containerStyle = window.getComputedStyle(previewContainer);
                console.log(`  media-kit-preview display: ${containerStyle.display}`);
            }
        } else {
            console.log('  ✅ All components are visible');
        }
    };
    testComponentCount();
    
    // Test 5: Force show controls for debugging
    console.log('\n📍 TEST 5: Component Controls Visibility');
    const testControls = () => {
        // Enable debug mode to force show controls
        document.body.classList.add('gmkb-debug-mode');
        
        const allControls = document.querySelectorAll('.component-controls, .component-controls--dynamic');
        console.log(`  Found ${allControls.length} control groups`);
        
        if (allControls.length > 0) {
            // Force show all controls
            allControls.forEach(control => {
                control.style.opacity = '1';
                control.style.visibility = 'visible';
                control.style.pointerEvents = 'all';
                control.style.border = '2px solid lime';
            });
            
            console.log('  ✅ Forced all controls to be visible (debug mode)');
            console.log('  Try hovering over components to test controls');
        }
    };
    testControls();
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST SUMMARY:');
    console.log(`  Move Buttons: ${results.moveButtons ? '✅ Working' : '❌ Not Working'}`);
    console.log(`  Device Preview: ${results.devicePreview ? '✅ Working' : '❌ Not Working'}`);
    console.log(`  Theme Customizer: ${results.themeCustomizer ? '✅ Working' : '❌ Not Working'}`);
    console.log(`  Component Count: ${results.componentCount} visible`);
    
    if (results.issues.length > 0) {
        console.log('\n⚠️ ISSUES FOUND:');
        results.issues.forEach(issue => {
            console.log(`  - ${issue}`);
        });
    } else {
        console.log('\n✅ ALL TESTS PASSED!');
    }
    
    // Provide manual test commands
    console.log('\n🔧 MANUAL TEST COMMANDS:');
    console.log('  window.testMoveComponent("component-id") - Test move functionality');
    console.log('  window.toggleDevicePreview("mobile") - Switch device preview');
    console.log('  window.openThemeCustomizer() - Open theme customizer');
    console.log('  window.showAllComponents() - Force show all components');
    console.log('  window.debugControls() - Debug component controls');
    
    // Add manual test functions
    window.testMoveComponent = (componentId) => {
        if (!componentId) {
            const firstComponent = document.querySelector('[data-component-id]');
            componentId = firstComponent?.getAttribute('data-component-id');
        }
        
        if (!componentId) {
            console.error('No component ID provided or found');
            return;
        }
        
        console.log(`Testing move for: ${componentId}`);
        
        // Test move up
        document.dispatchEvent(new CustomEvent('gmkb:component-move-up-requested', {
            detail: { componentId }
        }));
        
        setTimeout(() => {
            // Test move down
            document.dispatchEvent(new CustomEvent('gmkb:component-move-down-requested', {
                detail: { componentId }
            }));
            console.log('Move test completed - check if component moved');
        }, 1000);
    };
    
    window.toggleDevicePreview = (mode) => {
        const button = document.querySelector(`[data-preview="${mode}"]`);
        if (button) {
            button.click();
            console.log(`Switched to ${mode} preview`);
        } else {
            console.error(`Preview button for ${mode} not found`);
        }
    };
    
    window.openThemeCustomizer = () => {
        if (window.themeCustomizer && window.themeCustomizer.open) {
            window.themeCustomizer.open();
            console.log('Theme customizer opened');
        } else {
            console.error('Theme customizer not available');
        }
    };
    
    window.showAllComponents = () => {
        const allComponents = document.querySelectorAll('[data-component-id]');
        const containers = [
            document.getElementById('saved-components-container'),
            document.getElementById('media-kit-preview'),
            document.getElementById('empty-state')
        ];
        
        // Show containers
        containers.forEach(container => {
            if (container) {
                container.style.display = 'block';
                container.style.visibility = 'visible';
                container.style.opacity = '1';
            }
        });
        
        // Show all components
        allComponents.forEach(component => {
            component.style.display = 'block';
            component.style.visibility = 'visible';
            component.style.opacity = '1';
        });
        
        console.log(`Forced ${allComponents.length} components to be visible`);
    };
    
    window.debugControls = () => {
        if (window.componentControlsManager) {
            window.componentControlsManager.attachControlsToAllExistingComponents();
            console.log('Re-attached controls to all components');
        }
        
        // Force show all controls
        const allControls = document.querySelectorAll('.component-controls, .component-controls--dynamic');
        allControls.forEach(control => {
            control.style.cssText = `
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: all !important;
                border: 2px solid lime !important;
                background: rgba(0, 255, 0, 0.1) !important;
            `;
        });
        
        console.log(`Forced ${allControls.length} control groups to be visible`);
    };
    
    return results;
})();
