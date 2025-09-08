/**
 * Move Buttons Diagnostic Script
 * Diagnoses why move buttons are not appearing
 * 
 * @version 1.0.0
 * @date 2025-01-03
 */

(function() {
    'use strict';
    
    console.log('🔍 MOVE BUTTONS DIAGNOSTIC');
    console.log('=' .repeat(60));
    
    // Check 1: Component Controls Manager Status
    console.log('\n1️⃣ COMPONENT CONTROLS MANAGER STATUS:');
    if (window.componentControlsManager) {
        const status = window.componentControlsManager.getStatus();
        console.log('  ✅ Manager exists');
        console.log('  - Initialized:', status.isInitialized);
        console.log('  - Attached controls:', status.attachedControls);
        console.log('  - Event listeners:', status.eventListeners);
        console.log('  - Control definitions:', status.controlDefinitions);
        
        // Check control definitions
        const controlDefs = window.componentControlsManager.controlDefinitions;
        if (controlDefs) {
            console.log('\n  Control definitions check:');
            console.log('  - move-up:', controlDefs['move-up'] ? '✅ Defined' : '❌ Missing');
            console.log('  - move-down:', controlDefs['move-down'] ? '✅ Defined' : '❌ Missing');
        }
    } else {
        console.log('  ❌ Component Controls Manager not found!');
    }
    
    // Check 2: Components in DOM
    console.log('\n2️⃣ COMPONENTS IN DOM:');
    const components = document.querySelectorAll('[data-component-id]');
    console.log(`  Found ${components.length} components with data-component-id`);
    
    components.forEach((comp, index) => {
        const componentId = comp.getAttribute('data-component-id');
        const hasControls = comp.querySelector('.component-controls--dynamic');
        const controlsCount = comp.querySelectorAll('.component-control').length;
        console.log(`\n  Component ${index + 1}: ${componentId}`);
        console.log(`    - Has controls container: ${hasControls ? '✅' : '❌'}`);
        console.log(`    - Control buttons found: ${controlsCount}`);
        
        if (hasControls) {
            const moveUpBtn = comp.querySelector('[data-action="move-up"]');
            const moveDownBtn = comp.querySelector('[data-action="move-down"]');
            console.log(`    - Move up button: ${moveUpBtn ? '✅' : '❌'}`);
            console.log(`    - Move down button: ${moveDownBtn ? '✅' : '❌'}`);
        }
    });
    
    // Check 3: Try to manually attach controls
    console.log('\n3️⃣ MANUAL CONTROL ATTACHMENT TEST:');
    if (window.componentControlsManager && components.length > 0) {
        const testComponent = components[0];
        const testId = testComponent.getAttribute('data-component-id');
        console.log(`  Testing on component: ${testId}`);
        
        // Remove any existing controls
        const existing = testComponent.querySelector('.component-controls--dynamic');
        if (existing) {
            existing.remove();
            console.log('  - Removed existing controls');
        }
        
        // Try to attach
        console.log('  - Attempting to attach controls...');
        const success = window.componentControlsManager.attachControls(testComponent, testId);
        console.log(`  - Attachment result: ${success ? '✅ Success' : '❌ Failed'}`);
        
        // Check what was created
        if (success) {
            const newControls = testComponent.querySelector('.component-controls--dynamic');
            if (newControls) {
                const buttons = newControls.querySelectorAll('.component-control');
                console.log(`  - Created ${buttons.length} control buttons:`);
                buttons.forEach(btn => {
                    const action = btn.getAttribute('data-action');
                    console.log(`    • ${action}`);
                });
                
                // Force visibility
                newControls.style.cssText = 'opacity: 1 !important; visibility: visible !important; pointer-events: all !important; border: 2px solid red !important;';
                console.log('  - Controls made visible for inspection');
            }
        }
    }
    
    // Check 4: Event System
    console.log('\n4️⃣ EVENT SYSTEM CHECK:');
    
    // Test if component manager is listening
    const testEventPromise = new Promise((resolve) => {
        const handler = (event) => {
            console.log('  ✅ Event system working - received test event');
            document.removeEventListener('gmkb:test-event', handler);
            resolve(true);
        };
        document.addEventListener('gmkb:test-event', handler);
        
        setTimeout(() => {
            document.removeEventListener('gmkb:test-event', handler);
            resolve(false);
        }, 100);
    });
    
    document.dispatchEvent(new CustomEvent('gmkb:test-event', {
        detail: { test: true }
    }));
    
    testEventPromise.then(received => {
        if (!received) {
            console.log('  ❌ Event system not responding');
        }
    });
    
    // Check 5: Script Loading Order
    console.log('\n5️⃣ SCRIPT LOADING CHECK:');
    const scriptsToCheck = [
        'component-controls-manager.js',
        'enhanced-component-manager.js',
        'enhanced-state-manager.js'
    ];
    
    scriptsToCheck.forEach(scriptName => {
        const scriptTag = document.querySelector(`script[src*="${scriptName}"]`);
        if (scriptTag) {
            console.log(`  ✅ ${scriptName} loaded`);
        } else {
            console.log(`  ❌ ${scriptName} not found in DOM`);
        }
    });
    
    // Check 6: Try attachControlsToAllExistingComponents
    console.log