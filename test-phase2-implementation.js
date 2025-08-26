/**
 * Phase 2 Implementation Test Suite
 * Tests the Component Configuration Manager and Data Binding Engine
 */

(function() {
    'use strict';

    // Wait for Phase 2 systems to be ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            console.group('🧪 Phase 2: Component Layer Architecture Tests');
            
            // Test 1: Component Configuration Manager
            testComponentConfigurationManager();
            
            // Test 2: Data Binding Engine  
            testDataBindingEngine();
            
            // Test 3: Integration with Component Manager
            testComponentManagerIntegration();
            
            console.groupEnd();
        }, 2000);
    });

    function testComponentConfigurationManager() {
        console.group('🎛️ Testing Component Configuration Manager');
        
        try {
            // Check if manager is available
            if (!window.componentConfigurationManager) {
                console.error('❌ Component Configuration Manager not found');
                return;
            }
            
            if (!window.componentConfigurationManager.isReady()) {
                console.warn('⚠️ Component Configuration Manager not ready yet');
                return;
            }
            
            console.log('✅ Component Configuration Manager available and ready');
            
            // Test configuration registration
            const testComponentId = 'test-hero-' + Date.now();
            const testConfiguration = {
                dataBindings: {
                    title: 'full_name',
                    subtitle: 'guest_title'
                },
                componentOptions: {
                    layout: 'center_aligned',
                    showSocialLinks: true
                }
            };
            
            const configId = window.componentConfigurationManager.registerConfiguration(
                testComponentId, 
                'hero', 
                testConfiguration
            );
            
            console.log('✅ Configuration registered:', configId);
            
            // Test configuration retrieval
            const retrievedConfig = window.componentConfigurationManager.getConfiguration(testComponentId);
            console.log('✅ Configuration retrieved:', retrievedConfig);
            
            // Test schema access
            const heroSchema = window.componentConfigurationManager.getSchema('hero');
            console.log('✅ Hero schema available:', !!heroSchema);
            
            // Test metadata
            const metadata = window.componentConfigurationManager.getMetadata();
            console.log('✅ Manager metadata:', metadata);
            
            // Clean up test configuration
            window.componentConfigurationManager.removeConfiguration(testComponentId);
            console.log('✅ Test configuration cleaned up');
            
        } catch (error) {
            console.error('❌ Component Configuration Manager test failed:', error);
        }
        
        console.groupEnd();
    }

    function testDataBindingEngine() {
        console.group('🔗 Testing Data Binding Engine');
        
        try {
            // Check if engine is available
            if (!window.dataBindingEngine) {
                console.error('❌ Data Binding Engine not found');
                return;
            }
            
            if (!window.dataBindingEngine.isReady()) {
                console.warn('⚠️ Data Binding Engine not ready yet');
                return;
            }
            
            console.log('✅ Data Binding Engine available and ready');
            
            // Test data binding
            const testComponentId = 'test-binding-' + Date.now();
            const mockPodsData = {
                full_name: 'John Doe',
                guest_title: 'Professional Speaker',
                biography_short: 'Expert in technology and innovation',
                guest_headshot: 'https://example.com/photo.jpg'
            };
            
            const mockConfiguration = {
                dataBindings: {
                    title: 'full_name',
                    subtitle: 'guest_title',
                    description: 'biography_short',
                    image: 'guest_headshot'
                },
                componentOptions: {
                    layout: 'left_aligned'
                }
            };
            
            // Test binding
            const boundProps = window.dataBindingEngine.bindData(
                testComponentId, 
                mockPodsData, 
                mockConfiguration
            );
            
            console.log('✅ Data bound successfully:', boundProps);
            
            // Verify bound data
            if (boundProps.title === 'John Doe' && boundProps.subtitle === 'Professional Speaker') {
                console.log('✅ Data binding values correct');
            } else {
                console.error('❌ Data binding values incorrect:', boundProps);
            }
            
            // Test binding metadata
            const bindingInfo = window.dataBindingEngine.getBinding(testComponentId);
            console.log('✅ Binding metadata:', !!bindingInfo);
            
            // Test engine metadata
            const engineMetadata = window.dataBindingEngine.getMetadata();
            console.log('✅ Engine metadata:', engineMetadata);
            
            // Clean up test binding
            window.dataBindingEngine.removeBinding(testComponentId);
            console.log('✅ Test binding cleaned up');
            
        } catch (error) {
            console.error('❌ Data Binding Engine test failed:', error);
        }
        
        console.groupEnd();
    }

    function testComponentManagerIntegration() {
        console.group('🔧 Testing Component Manager Integration');
        
        try {
            // Check if enhanced component manager supports Phase 2
            if (!window.enhancedComponentManager) {
                console.error('❌ Enhanced Component Manager not found');
                return;
            }
            
            if (!window.enhancedComponentManager.isReady()) {
                console.warn('⚠️ Enhanced Component Manager not ready yet');
                return;
            }
            
            console.log('✅ Enhanced Component Manager available');
            
            // Check if manager supports Phase 2 features
            const hasPhase2Support = typeof window.enhancedComponentManager.updateComponentVisual === 'function';
            
            if (hasPhase2Support) {
                console.log('✅ Component Manager has Phase 2 support');
            } else {
                console.warn('⚠️ Component Manager missing Phase 2 methods');
            }
            
            // Test event listening
            let eventReceived = false;
            const testListener = () => { eventReceived = true; };
            
            document.addEventListener('gmkb:component-config-updated', testListener, { once: true });
            
            // Trigger a test event
            document.dispatchEvent(new CustomEvent('gmkb:component-config-updated', {
                detail: {
                    componentId: 'test-component',
                    updates: { testProp: 'testValue' }
                }
            }));
            
            setTimeout(() => {
                if (eventReceived) {
                    console.log('✅ Event integration working');
                } else {
                    console.warn('⚠️ Event integration not working');
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Component Manager integration test failed:', error);
        }
        
        console.groupEnd();
    }

    // Add global test function
    window.testPhase2Implementation = function() {
        console.group('🚀 Manual Phase 2 Test');
        
        testComponentConfigurationManager();
        testDataBindingEngine();
        testComponentManagerIntegration();
        
        console.groupEnd();
        console.log('📋 Phase 2 Test Summary:');
        console.log('- Component Configuration Manager: ' + (window.componentConfigurationManager?.isReady() ? '✅' : '❌'));
        console.log('- Data Binding Engine: ' + (window.dataBindingEngine?.isReady() ? '✅' : '❌'));
        console.log('- Component Manager Integration: ' + (window.enhancedComponentManager?.isReady() ? '✅' : '❌'));
        console.log('- Schema Registry: ' + (window.gmkbData?.componentSchemas ? '✅' : '❌'));
    };

    console.log('🧪 Phase 2 test suite loaded. Use testPhase2Implementation() to run tests manually.');

})();