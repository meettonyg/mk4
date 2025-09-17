/**
 * @file refactored-services-diagnostic.js
 * @description Debug script to check if refactored services are loading
 */

console.log('🔧 Refactored Services Diagnostic: Loading...');

// Make diagnostic functions available immediately
window.testRefactoredServices = function() {
    console.log('🧪 Manual Service Test:');
    
    if (window.componentStateManager) {
        console.log('✅ Testing ComponentStateManager...');
        try {
            const testState = { components: { test: { type: 'hero' } }, layout: ['test'] };
            const hash = window.componentStateManager.generateStateHash(testState);
            console.log('  Generated hash:', hash);
        } catch (error) {
            console.log('  Error:', error);
        }
    } else {
        console.log('❌ ComponentStateManager not available');
    }
    
    if (window.componentDOMManager) {
        console.log('✅ Testing ComponentDOMManager...');
        try {
            const stats = window.componentDOMManager.getStats();
            console.log('  DOM Manager stats:', stats);
        } catch (error) {
            console.log('  Error:', error);
        }
    } else {
        console.log('❌ ComponentDOMManager not available');
    }
    
    if (window.enhancedComponentRenderer) {
        console.log('✅ Testing Enhanced Component Renderer...');
        try {
            const health = window.enhancedComponentRenderer.generateHealthReport();
            console.log('  Health report:', health);
        } catch (error) {
            console.log('  Error:', error);
        }
    } else {
        console.log('❌ Enhanced Component Renderer not available');
    }
    
    console.log('🔧 Service availability summary:');
    console.log('  ComponentStateManager:', !!window.componentStateManager);
    console.log('  ComponentDOMManager:', !!window.componentDOMManager);  
    console.log('  ComponentRenderEngine:', !!window.componentRenderEngine);
    console.log('  ComponentUIIntegration:', !!window.componentUIIntegration);
    console.log('  ComponentPerformanceMonitor:', !!window.componentPerformanceMonitor);
    console.log('  ComponentContainerManager:', !!window.componentContainerManager);
    console.log('  EnhancedComponentRenderer:', !!window.enhancedComponentRenderer);
};

(function() {
    'use strict';
    
    console.log('🔧 Refactored Services Diagnostic: Starting...');
    
    // Wait a bit for services to load
    setTimeout(() => {
        console.log('🔧 Refactored Services Diagnostic: Checking service availability...');
        
        const services = {
            'ComponentStateManager': window.ComponentStateManager,
            'componentStateManager': window.componentStateManager,
            'ComponentDOMManager': window.ComponentDOMManager,
            'componentDOMManager': window.componentDOMManager,
            'ComponentRenderEngine': window.ComponentRenderEngine,
            'componentRenderEngine': window.componentRenderEngine,
            'ComponentUIIntegration': window.ComponentUIIntegration,
            'componentUIIntegration': window.componentUIIntegration,
            'ComponentPerformanceMonitor': window.ComponentPerformanceMonitor,
            'componentPerformanceMonitor': window.componentPerformanceMonitor,
            'ComponentContainerManager': window.ComponentContainerManager,
            'componentContainerManager': window.componentContainerManager,
            'EnhancedComponentRenderer (new)': window.enhancedComponentRenderer,
            'EnhancedComponentRendererRefactored': window.enhancedComponentRendererRefactored
        };
        
        console.log('🔧 Service Availability Check:');
        Object.entries(services).forEach(([name, service]) => {
            const status = service ? '✅' : '❌';
            console.log(`  ${status} ${name}`);
        });
        
        // Check for initialization events
        const eventCheckStartTime = Date.now();
        let eventCount = 0;
        
        const events = [
            'gmkb:component-state-manager-ready',
            'gmkb:component-dom-manager-ready',
            'gmkb:component-render-engine-ready',
            'gmkb:component-ui-integration-ready',
            'gmkb:component-performance-monitor-ready',
            'gmkb:component-container-manager-ready',
            'gmkb:enhanced-component-renderer-ready'
        ];
        
        console.log('🔧 Listening for service ready events...');
        
        events.forEach(eventName => {
            document.addEventListener(eventName, (event) => {
                eventCount++;
                console.log(`🔧 Event received: ${eventName}`, event.detail);
            });
        });
        
        // Report after 5 seconds
        setTimeout(() => {
            console.log(`🔧 Event Summary: Received ${eventCount}/${events.length} service ready events`);
            
            if (window.enhancedComponentRenderer) {
                if (window.enhancedComponentRenderer.initialized) {
                    console.log('✅ Enhanced Component Renderer is initialized');
                    try {
                        console.log('📊 Renderer stats:', window.enhancedComponentRenderer.getStats());
                    } catch (error) {
                        console.log('❌ Error getting renderer stats:', error);
                    }
                } else {
                    console.log('⚠️ Enhanced Component Renderer exists but not initialized');
                }
            } else {
                console.log('❌ Enhanced Component Renderer not found');
            }
        }, 5000);
        
    }, 2000);
    
    console.log('🔧 Diagnostic script loaded. Run testRefactoredServices() to manually test services.');
    
})();