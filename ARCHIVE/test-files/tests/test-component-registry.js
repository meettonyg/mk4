/**
 * @file test-component-registry.js
 * @description Test Suite for Component Registry System
 * 
 * USAGE: Load this script and run window.testComponentRegistry() in console
 */

(function() {
    'use strict';
    
    function testComponentRegistry() {
        const tests = {
            registryExists: () => {
                return !!window.GMKBComponentRegistry;
            },
            
            registryInitialized: () => {
                return window.GMKBComponentRegistry?.initialized === true;
            },
            
            componentsRegistered: () => {
                const registry = window.GMKBComponentRegistry;
                if (!registry) return false;
                
                const registered = registry.getRegisteredTypes();
                console.log('Registered components:', registered);
                
                // We should have at least hero and topics registered
                return registered.includes('hero') && registered.includes('topics');
            },
            
            heroRendererWorks: () => {
                const registry = window.GMKBComponentRegistry;
                if (!registry || !registry.isRegistered('hero')) return false;
                
                const renderer = registry.getRenderer('hero');
                const testData = {
                    title: 'Test Hero',
                    subtitle: 'Test Subtitle',
                    description: 'Test Description'
                };
                const testOptions = {
                    layout: 'center_aligned'
                };
                
                try {
                    const html = renderer(testData, testOptions);
                    return html.includes('Test Hero') && html.includes('center_aligned');
                } catch (e) {
                    console.error('Hero renderer error:', e);
                    return false;
                }
            },
            
            topicsRendererWorks: () => {
                const registry = window.GMKBComponentRegistry;
                if (!registry || !registry.isRegistered('topics')) return false;
                
                const renderer = registry.getRenderer('topics');
                const testData = {
                    title: 'Test Topics',
                    topics: [
                        { topic_title: 'Topic 1', topic_description: 'Description 1' },
                        { topic_title: 'Topic 2', topic_description: 'Description 2' }
                    ]
                };
                const testOptions = {
                    layout: 'list'
                };
                
                try {
                    const html = renderer(testData, testOptions);
                    return html.includes('Test Topics') && html.includes('Topic 1') && html.includes('list');
                } catch (e) {
                    console.error('Topics renderer error:', e);
                    return false;
                }
            },
            
            genericRendererFallback: () => {
                const registry = window.GMKBComponentRegistry;
                if (!registry) return false;
                
                const renderer = registry.getRenderer('non-existent-component');
                const html = renderer({ test: 'data' }, { type: 'non-existent-component' });
                
                return html.includes('gmkb-generic') && html.includes('Non-existent-component');
            },
            
            schemaValidation: () => {
                const registry = window.GMKBComponentRegistry;
                if (!registry) return false;
                
                // Get hero schema
                const heroSchema = registry.getSchema('hero');
                if (!heroSchema) return false;
                
                return heroSchema.dataBindings && 
                       heroSchema.layouts && 
                       heroSchema.defaults &&
                       Array.isArray(heroSchema.layouts);
            },
            
            errorHandling: () => {
                const registry = window.GMKBComponentRegistry;
                if (!registry) return false;
                
                // Try to register with invalid data
                const errorsBefore = registry.getRegistrationErrors().length;
                const result = registry.register(null, 'not-a-function', {});
                const errorsAfter = registry.getRegistrationErrors().length;
                
                return result === false && errorsAfter > errorsBefore;
            },
            
            rendererIntegration: () => {
                // Test if the enhanced renderer can use the registry
                if (!window.enhancedComponentRenderer) {
                    console.warn('Enhanced renderer not available for integration test');
                    return 'skipped';
                }
                
                // Try to generate HTML using the registry
                const testData = {
                    title: 'Integration Test',
                    subtitle: 'Testing Registry Integration'
                };
                
                try {
                    const html = window.enhancedComponentRenderer.generateConfiguredHTML('hero', testData, {});
                    return html.includes('Integration Test');
                } catch (e) {
                    console.error('Integration error:', e);
                    return false;
                }
            }
        };
        
        // Run tests
        console.log('🧪 Running Component Registry Tests...');
        console.log('=====================================');
        
        const results = {};
        let passed = 0;
        let failed = 0;
        let skipped = 0;
        
        for (const [name, test] of Object.entries(tests)) {
            try {
                const result = test();
                if (result === 'skipped') {
                    results[name] = '⚪ SKIPPED';
                    skipped++;
                } else if (result) {
                    results[name] = '✅ PASS';
                    passed++;
                } else {
                    results[name] = '❌ FAIL';
                    failed++;
                }
            } catch (e) {
                results[name] = `❌ ERROR: ${e.message}`;
                failed++;
            }
        }
        
        console.table(results);
        console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
        
        // Additional diagnostics
        if (window.GMKBComponentRegistry) {
            const stats = window.GMKBComponentRegistry.getStats();
            console.log('\n📈 Registry Statistics:');
            console.log(`  - Registered Components: ${stats.registeredComponents}`);
            console.log(`  - Components with Schemas: ${stats.componentsWithSchemas}`);
            console.log(`  - Registration Errors: ${stats.registrationErrors}`);
            console.log(`  - Component Types: ${stats.types.join(', ')}`);
        }
        
        return { results, passed, failed, skipped };
    }
    
    // Make test function globally available
    window.testComponentRegistry = testComponentRegistry;
    
    // Auto-run if in debug mode
    if (window.gmkbData?.debugMode) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                console.log('Auto-running component registry tests...');
                testComponentRegistry();
            }, 2000); // Wait for components to register
        });
    }
    
    console.log('💡 Component Registry Test Suite loaded. Run window.testComponentRegistry() to test.');
    
})();