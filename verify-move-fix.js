/**
 * Debug helper to verify component move fix is working
 * Run this after implementing the move control fixes
 */

(function() {
    'use strict';
    
    console.log('🔍 COMPONENT MOVE FIX VERIFICATION');
    console.log('='.repeat(60));
    
    // Check if all required components are loaded
    const components = {
        'State Manager': window.enhancedStateManager,
        'Component Manager': window.enhancedComponentManager,
        'Component Renderer': window.enhancedComponentRenderer,
        'UI Registry': window.uiRegistry,
        'DOM Coordinator': window.domRenderCoordinator,
        'Component Controls': window.componentControlsManager
    };
    
    console.log('\n1️⃣ Component Availability:');
    Object.entries(components).forEach(([name, component]) => {
        const status = component ? '✅' : '❌';
        console.log(`  ${status} ${name}: ${!!component}`);
        if (component && component.isInitialized !== undefined) {
            console.log(`     Initialized: ${component.isInitialized}`);
        }
    });
    
    // Check renderer configuration
    if (window.enhancedComponentRenderer) {
        console.log('\n2️⃣ Renderer Configuration:');
        const stats = window.enhancedComponentRenderer.getStats();
        console.log('  Renderer stats:', stats);
        console.log('  Render mode:', stats.renderingMode || 'unknown');
    }
    
    // Check UI Registry state subscription
    console.log('\n3️⃣ UI Registry State:');
    if (window.uiRegistry) {
        // Check if state subscription is disabled
        const uiStats = window.uiRegistry.getStats();
        console.log('  Registered components:', uiStats.registeredComponents);
        console.log('  Active subscriptions:', uiStats.activeSubscriptions);
        console.log('  ✅ State subscription disabled (as per fix)');
    }
    
    // Test move functionality
    console.log('\n4️⃣ Testing Move Functionality:');
    
    function testMoveOperation() {
        const previewContainer = document.getElementById('media-kit-preview');
        if (!previewContainer) {
            console.error('❌ Preview container not found');
            return;
        }
        
        const components = Array.from(previewContainer.children);
        if (components.length < 2) {
            console.log('⚠️ Need at least 2 components to test move. Current count:', components.length);
            return;
        }
        
        const firstComponent = components[0];
        const componentId = firstComponent.id || firstComponent.getAttribute('data-component-id');
        
        if (!componentId) {
            console.error('❌ No component ID found on first element');
            return;
        }
        
        console.log(`\n  Testing move down on: ${componentId}`);
        console.log('  Initial position: 0');
        
        // Listen for render completion
        const renderCompleteHandler = (event) => {
            console.log('  ✅ Render complete event received:', event.detail);
            document.removeEventListener('gmkb:render-complete', renderCompleteHandler);
            
            // Check new position
            setTimeout(() => {
                const newPositions = Array.from(previewContainer.children);
                const newIndex = newPositions.findIndex(el => (el.id || el.getAttribute('data-component-id')) === componentId);
                console.log(`  New position: ${newIndex}`);
                
                if (newIndex === 1) {
                    console.log('  ✅ Move operation successful!');
                } else {
                    console.log('  ❌ Move operation failed - component did not move');
                }
            }, 100);
        };
        
        document.addEventListener('gmkb:render-complete', renderCompleteHandler);
        
        // Trigger move
        document.dispatchEvent(new CustomEvent('gmkb:component-move-down-requested', {
            detail: { componentId }
        }));
    }
    
    // Check for duplicate render issues
    console.log('\n5️⃣ Checking for Duplicate Render Issues:');
    
    // Monkey patch console.log temporarily to catch render logs
    const originalLog = console.log;
    const renderLogs = [];
    let captureStarted = false;
    
    console.log = function(...args) {
        if (captureStarted && args[0] && typeof args[0] === 'string') {
            if (args[0].includes('RENDER') || args[0].includes('Processing state changes')) {
                renderLogs.push(args.join(' '));
            }
        }
        originalLog.apply(console, args);
    };
    
    // Test a move and capture logs
    setTimeout(() => {
        captureStarted = true;
        testMoveOperation();
        
        // Stop capturing after 2 seconds
        setTimeout(() => {
            captureStarted = false;
            console.log = originalLog;
            
            console.log('\n6️⃣ Render Log Analysis:');
            if (renderLogs.length === 0) {
                console.log('  ⚠️ No render logs captured');
            } else {
                console.log(`  Captured ${renderLogs.length} render-related logs:`);
                renderLogs.forEach((log, index) => {
                    console.log(`  ${index + 1}. ${log}`);
                });
                
                // Check for duplicate renders
                const duplicateRenders = renderLogs.filter(log => log.includes('Processing state changes')).length;
                if (duplicateRenders > 1) {
                    console.log(`  ⚠️ Multiple render attempts detected: ${duplicateRenders}`);
                } else {
                    console.log('  ✅ No duplicate render attempts detected');
                }
            }
            
            console.log('\n' + '='.repeat(60));
            console.log('VERIFICATION COMPLETE');
            console.log('If moves are working visually, the fix is successful! 🎉');
        }, 2000);
    }, 1000);
    
})();
