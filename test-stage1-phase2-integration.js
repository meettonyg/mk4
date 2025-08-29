/**
 * STAGE 1 TEST: Enhanced Component Renderer Phase 2 Integration
 * 
 * Tests the integration of ComponentConfigurationManager and DataBindingEngine
 * with the enhanced component renderer.
 * 
 * @version 1.0.0-stage1-test
 */

(function() {
    'use strict';
    
    // Wait for systems to be ready
    document.addEventListener('gmkb:core-systems-ready', () => {
        setTimeout(() => {
            runStage1Tests();
        }, 1000);
    });
    
    function runStage1Tests() {
        console.log('🧪 STAGE 1 TEST: Starting Phase 2 Integration Tests');
        
        const results = {
            dependencies: testDependencies(),
            configurationManager: testConfigurationManager(),
            dataBindingEngine: testDataBindingEngine(),
            rendererIntegration: testRendererIntegration(),
            componentGeneration: testComponentGeneration()
        };
        
        // Display results
        displayTestResults(results);
        
        // Add test components if all tests pass
        if (allTestsPass(results)) {
            addTestComponents();
        }
        
        return results;
    }
    
    function testDependencies() {
        console.log('🔍 Testing Phase 2 dependencies...');
        
        const tests = {
            componentConfigurationManager: !!window.componentConfigurationManager,
            dataBindingEngine: !!window.dataBindingEngine,
            enhancedComponentRenderer: !!window.enhancedComponentRenderer,
            structuredLogger: !!window.structuredLogger,
            enhancedStateManager: !!window.enhancedStateManager
        };
        
        console.log('Dependencies:', tests);
        return tests;
    }
    
    function testConfigurationManager() {
        console.log('🔧 Testing ComponentConfigurationManager...');
        
        if (!window.componentConfigurationManager) {
            return { error: 'ComponentConfigurationManager not available' };
        }
        
        const manager = window.componentConfigurationManager;
        const tests = {};
        
        try {
            // Test schema availability
            tests.hasSchemas = manager.getAvailableComponentTypes().length > 0;
            tests.schemaTypes = manager.getAvailableComponentTypes();
            
            // Test configuration registration
            const testConfig = manager.registerConfiguration('test_hero', 'hero');
            tests.configurationRegistration = !!testConfig;
            tests.configurationHasBindings = !!(testConfig && testConfig.dataBindings);
            tests.configurationHasOptions = !!(testConfig && testConfig.componentOptions);
            
            // Test schema retrieval
            const heroSchema = manager.getSchema('hero');
            tests.schemaRetrieval = !!heroSchema;
            tests.schemaHasBindings = !!(heroSchema && heroSchema.dataBindings);
            
        } catch (error) {
            tests.error = error.message;
        }
        
        console.log('Configuration Manager Tests:', tests);
        return tests;
    }
    
    function testDataBindingEngine() {\n        console.log('🔗 Testing DataBindingEngine...');\n        \n        if (!window.dataBindingEngine) {\n            return { error: 'DataBindingEngine not available' };\n        }\n        \n        const engine = window.dataBindingEngine;\n        const tests = {};\n        \n        try {\n            // Test data binding\n            const testData = {\n                full_name: 'John Doe',\n                guest_title: 'Senior Developer',\n                biography: 'Experienced developer with expertise in web technologies.',\n                guest_headshot: 'https://example.com/image.jpg'\n            };\n            \n            const boundData = engine.bindComponentData(\n                'test_hero_binding',\n                'hero',\n                {\n                    title: 'full_name',\n                    subtitle: 'guest_title',\n                    description: 'biography',\n                    image: 'guest_headshot'\n                },\n                testData\n            );\n            \n            tests.dataBinding = !!boundData;\n            tests.boundDataComplete = !!(boundData.title && boundData.subtitle && boundData.description);\n            tests.boundDataValues = {\n                title: boundData.title,\n                subtitle: boundData.subtitle,\n                description: boundData.description ? boundData.description.substring(0, 50) + '...' : null\n            };\n            \n        } catch (error) {\n            tests.error = error.message;\n        }\n        \n        console.log('Data Binding Engine Tests:', tests);\n        return tests;\n    }\n    \n    function testRendererIntegration() {\n        console.log('🎨 Testing Renderer Integration...');\n        \n        if (!window.enhancedComponentRenderer) {\n            return { error: 'Enhanced Component Renderer not available' };\n        }\n        \n        const renderer = window.enhancedComponentRenderer;\n        const tests = {};\n        \n        try {\n            // Test Phase 2 methods existence\n            tests.hasConfigurationMethod = typeof renderer.generateConfigurationDrivenHTML === 'function';\n            tests.hasConfiguredHTMLMethod = typeof renderer.generateConfiguredHTML === 'function';\n            tests.hasConfiguredTopicsMethod = typeof renderer.generateConfiguredTopicsHTML === 'function';\n            tests.hasConfiguredHeroMethod = typeof renderer.generateConfiguredHeroHTML === 'function';\n            tests.hasConfiguredContactMethod = typeof renderer.generateConfiguredContactHTML === 'function';\n            \n            // Test basic renderer functionality\n            tests.rendererInitialized = renderer.initialized;\n            tests.rendererStats = renderer.getStats();\n            tests.phase2Support = renderer.getStats().phase2;\n            \n        } catch (error) {\n            tests.error = error.message;\n        }\n        \n        console.log('Renderer Integration Tests:', tests);\n        return tests;\n    }\n    \n    function testComponentGeneration() {\n        console.log('🏗️ Testing Component Generation...');\n        \n        const tests = {};\n        \n        try {\n            if (window.enhancedComponentRenderer && \n                window.componentConfigurationManager && \n                window.dataBindingEngine) {\n                \n                const renderer = window.enhancedComponentRenderer;\n                \n                // Test configured HTML generation\n                const testBoundData = {\n                    title: 'Test Hero Title',\n                    subtitle: 'Test Subtitle',\n                    description: 'Test description for hero component',\n                    image: 'https://example.com/test-image.jpg'\n                };\n                \n                const testOptions = {\n                    layout: 'center_aligned',\n                    imageStyle: 'rounded',\n                    showSocialLinks: true,\n                    backgroundColor: '#f0f0f0',\n                    textColor: '#333333'\n                };\n                \n                const heroHTML = renderer.generateConfiguredHeroHTML(testBoundData, testOptions);\n                tests.heroHTMLGeneration = !!heroHTML;\n                tests.heroHTMLContainsTitle = heroHTML.includes('Test Hero Title');\n                tests.heroHTMLContainsPhase2Badge = heroHTML.includes('[PHASE 2 CONFIGURED');\n                tests.heroHTMLContainsLayout = heroHTML.includes('center_aligned');\n                \n                const topicsHTML = renderer.generateConfiguredTopicsHTML(\n                    {\n                        title: 'My Topics',\n                        topics: [\n                            { topic_title: 'JavaScript', topic_description: 'Modern JS development' },\n                            { topic_title: 'React', topic_description: 'Component-based UI' }\n                        ]\n                    },\n                    { layout: 'grid', columnsDesktop: '2' }\n                );\n                tests.topicsHTMLGeneration = !!topicsHTML;\n                tests.topicsHTMLContainsTitle = topicsHTML.includes('My Topics');\n                tests.topicsHTMLContainsGrid = topicsHTML.includes('grid-template-columns: repeat(2, 1fr)');\n                \n            } else {\n                tests.error = 'Required systems not available for component generation test';\n            }\n            \n        } catch (error) {\n            tests.error = error.message;\n        }\n        \n        console.log('Component Generation Tests:', tests);\n        return tests;\n    }\n    \n    function displayTestResults(results) {\n        console.log('\\n📊 STAGE 1 TEST RESULTS:');\n        console.log('=' + '='.repeat(50));\n        \n        Object.keys(results).forEach(testSuite => {\n            const result = results[testSuite];\n            const passed = !result.error && Object.values(result).every(val => \n                val !== false && val !== null && val !== undefined\n            );\n            \n            console.log(`${passed ? '✅' : '❌'} ${testSuite.toUpperCase()}: ${passed ? 'PASS' : 'FAIL'}`);\n            \n            if (result.error) {\n                console.log(`   Error: ${result.error}`);\n            } else {\n                Object.keys(result).forEach(test => {\n                    const value = result[test];\n                    const status = value ? '✓' : '✗';\n                    console.log(`   ${status} ${test}: ${JSON.stringify(value)}`);\n                });\n            }\n        });\n        \n        console.log('=' + '='.repeat(50));\n        \n        const overallPass = allTestsPass(results);\n        console.log(`🎯 OVERALL STAGE 1 RESULT: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);\n        \n        if (overallPass) {\n            console.log('🚀 Phase 2 Integration is working correctly!');\n            console.log('✅ ComponentConfigurationManager integrated');\n            console.log('✅ DataBindingEngine integrated'); \n            console.log('✅ Configuration-driven rendering active');\n            console.log('✅ Ready for Stage 2 testing!');\n        } else {\n            console.log('⚠️ Some tests failed. Check the errors above.');\n        }\n    }\n    \n    function allTestsPass(results) {\n        return Object.values(results).every(result => \n            !result.error && Object.values(result).every(val => \n                val !== false && val !== null && val !== undefined\n            )\n        );\n    }\n    \n    function addTestComponents() {\n        console.log('🧪 Adding test components to demonstrate Phase 2 functionality...');\n        \n        if (!window.enhancedComponentManager) {\n            console.log('❌ Component manager not available');\n            return;\n        }\n        \n        // Add a hero component to test configuration-driven rendering\n        setTimeout(() => {\n            window.enhancedComponentManager.addComponent('hero', {\n                id: 'stage1_test_hero',\n                data: {\n                    full_name: 'Phase 2 Test User',\n                    guest_title: 'Configuration Expert',\n                    biography: 'This hero component is rendered using the Phase 2 configuration system with data binding.',\n                    guest_headshot: 'https://via.placeholder.com/300x300/295cff/white?text=PHASE+2'\n                }\n            });\n            \n            console.log('✅ Test hero component added');\n        }, 500);\n        \n        // Add a topics component to test layout options\n        setTimeout(() => {\n            window.enhancedComponentManager.addComponent('topics', {\n                id: 'stage1_test_topics',\n                data: {\n                    topics: [\n                        {\n                            topic_title: 'Configuration-Driven Architecture',\n                            topic_description: 'Building scalable component systems with configuration management'\n                        },\n                        {\n                            topic_title: 'Data Binding Patterns',\n                            topic_description: 'Effective patterns for binding data sources to UI components'\n                        },\n                        {\n                            topic_title: 'Phase 2 Implementation',\n                            topic_description: 'Successfully implementing component configuration layers'\n                        }\n                    ]\n                }\n            });\n            \n            console.log('✅ Test topics component added');\n        }, 1000);\n        \n        console.log('🎉 Test components will appear shortly to demonstrate Phase 2 functionality!');\n    }\n    \n    // Make test function available globally for manual testing\n    window.runStage1Tests = runStage1Tests;\n    \n    console.log('🧪 STAGE 1 TEST: Loaded. Tests will run automatically when systems are ready.');\n    console.log('💡 TIP: Run manually with: runStage1Tests()');\n    \n})();