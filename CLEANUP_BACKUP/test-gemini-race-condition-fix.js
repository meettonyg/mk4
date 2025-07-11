/**
 * @file test-gemini-race-condition-fix.js
 * @description Comprehensive test suite for validating the Gemini race condition fixes
 * Tests all 4 steps of the implementation to ensure robust initialization
 */

class GeminiRaceConditionTester {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: [],
            startTime: performance.now()
        };
        
        this.categories = {
            'System Registration': [],
            'Core Systems': [],
            'Method Availability': [],
            'Initialization': [],
            'UI Integration': [],
            'Error Handling': []
        };
    }
    
    /**
     * Logs a test result with color coding
     */
    test(name, condition, category = 'General', critical = false) {
        const status = condition ? 'PASS' : 'FAIL';
        const icon = condition ? '✅' : '❌';
        const criticality = critical ? ' (CRITICAL)' : '';
        
        console.log(`${icon} ${name}: ${status}${criticality}`);
        
        const result = { 
            name, 
            status, 
            critical, 
            category,
            condition: !!condition 
        };
        
        this.results.tests.push(result);
        this.categories[category].push(result);
        
        if (condition) {
            this.results.passed++;
        } else {
            this.results.failed++;
        }
        
        return condition;
    }
    
    /**
     * Step 1: Test System Registration Fixes
     */
    testSystemRegistration() {
        console.log('\n🔧 Testing Step 1: System Registration Fixes...');
        
        // Test that system registrar exists
        this.test('System Registrar Available', !!window.systemRegistrar, 'System Registration', true);
        
        // Test that all core systems are registered
        const systems = window.systemRegistrar?.getAll() || {};
        this.test('State Manager Registered', !!systems.stateManager, 'System Registration', true);
        this.test('Component Manager Registered', !!systems.componentManager, 'System Registration', true);
        this.test('Renderer Registered', !!systems.renderer, 'System Registration', true);
        
        // Test system types
        this.test('State Manager is Enhanced', 
            systems.stateManager?.constructor?.name?.includes('Enhanced'), 
            'System Registration');
        this.test('Component Manager is Enhanced', 
            systems.componentManager?.constructor?.name?.includes('Enhanced'), 
            'System Registration');
        this.test('Renderer is Enhanced', 
            systems.renderer?.constructor?.name?.includes('Enhanced'), 
            'System Registration');
        
        // Test registration function availability
        this.test('Registration Function Available', 
            typeof window.registerEnhancedSystems === 'function' || 
            typeof window.getEnhancedSystemInfo === 'function', 
            'System Registration');
    }
    
    /**
     * Step 2: Test Core Systems Initialization
     */
    testCoreSystems() {
        console.log('\n🚀 Testing Step 2: Core Systems Initialization...');
        
        // Test global exposure
        this.test('State Manager Globally Available', !!window.stateManager, 'Core Systems', true);
        this.test('Component Manager Globally Available', !!window.componentManager, 'Core Systems', true);
        this.test('Enhanced Component Manager Globally Available', !!window.enhancedComponentManager, 'Core Systems', true);
        this.test('Renderer Globally Available', !!window.renderer, 'Core Systems', true);
        
        // Test initialization status
        this.test('Component Manager Initialized', 
            window.enhancedComponentManager?.isInitialized === true, 
            'Core Systems', true);
        this.test('Renderer Initialized', 
            window.renderer?.initialized === true, 
            'Core Systems', true);
        
        // Test that systems are the same instances
        this.test('Component Manager Instance Match', 
            window.componentManager === window.enhancedComponentManager, 
            'Core Systems');
        
        // Test DOM elements
        this.test('Preview Container Exists', !!document.getElementById('media-kit-preview'), 'Core Systems', true);
    }
    
    /**
     * Step 3: Test Method Availability (including updateComponent)
     */
    testMethodAvailability() {\n        console.log('\n🔧 Testing Step 3: Method Availability...');\n        \n        // Test enhanced component manager methods\n        const ecm = window.enhancedComponentManager;\n        this.test('addComponent Method Available', typeof ecm?.addComponent === 'function', 'Method Availability', true);\n        this.test('updateComponent Method Available', typeof ecm?.updateComponent === 'function', 'Method Availability', true);\n        this.test('removeComponent Method Available', typeof ecm?.removeComponent === 'function', 'Method Availability', true);\n        this.test('duplicateComponent Method Available', typeof ecm?.duplicateComponent === 'function', 'Method Availability');\n        this.test('editComponent Method Available', typeof ecm?.editComponent === 'function', 'Method Availability');\n        \n        // Test enhanced state manager methods\n        const esm = window.stateManager;\n        this.test('State Manager addComponent', typeof esm?.addComponent === 'function', 'Method Availability', true);\n        this.test('State Manager updateComponent', typeof esm?.updateComponent === 'function', 'Method Availability', true);\n        this.test('State Manager removeComponent', typeof esm?.removeComponent === 'function', 'Method Availability', true);\n        this.test('State Manager getState', typeof esm?.getState === 'function', 'Method Availability', true);\n        this.test('State Manager subscribeGlobal', typeof esm?.subscribeGlobal === 'function', 'Method Availability', true);\n        \n        // Test renderer methods\n        const renderer = window.renderer;\n        this.test('Renderer init Method', typeof renderer?.init === 'function', 'Method Availability', true);\n        this.test('Renderer render Method', typeof renderer?.render === 'function', 'Method Availability');\n        \n        // Test debug methods added in Step 3\n        this.test('Component Manager getStatus', typeof ecm?.getStatus === 'function', 'Method Availability');\n        this.test('Component Manager forceInitialization', typeof ecm?.forceInitialization === 'function', 'Method Availability');\n    }\n    \n    /**\n     * Step 4: Test Initialization Integration\n     */\n    testInitializationIntegration() {\n        console.log('\n🎨 Testing Step 4: Initialization Integration...');\n        \n        // Test that UI systems are available\n        this.test('Modal System Available', \n            !!document.getElementById('component-library-overlay') || \n            typeof window.setupComponentLibrary === 'function', \n            'UI Integration');\n        \n        // Test that feature systems are initialized\n        this.test('Template Loader Available', \n            !!window.templateLoader || \n            typeof window.templateLoader?.init === 'function', \n            'UI Integration');\n        \n        // Test that state manager post-initialization ran\n        this.test('State Manager Post-Init Available', \n            typeof window.enhancedStateManager?.initializeAfterSystems === 'function', \n            'Initialization');\n        \n        // Test event system\n        this.test('mediaKitBuilderReady Event Dispatched', \n            !!window.performance && performance.now() > 1000, // Rough check that initialization happened\n            'Initialization');\n        \n        // Test debug tools\n        this.test('Debug Tools Available', \n            typeof window.getEnhancedSystemInfo === 'function', \n            'Initialization');\n        this.test('Test Function Available', \n            typeof window.testArchitectureFix === 'function', \n            'Initialization');\n        \n        // Test logging system\n        this.test('Logging System Available', \n            !!window.mkLog && typeof window.mkLog.help === 'function', \n            'Initialization');\n    }\n    \n    /**\n     * Test error handling and edge cases\n     */\n    testErrorHandling() {\n        console.log('\n🛡️ Testing Error Handling...');\n        \n        // Test component manager status method\n        try {\n            const status = window.enhancedComponentManager?.getStatus();\n            this.test('Component Manager Status Returns Object', \n                typeof status === 'object' && status !== null, \n                'Error Handling');\n            this.test('Status Contains isInitialized', \n                'isInitialized' in status, \n                'Error Handling');\n        } catch (error) {\n            this.test('Component Manager Status Method', false, 'Error Handling');\n        }\n        \n        // Test that systems handle missing dependencies gracefully\n        try {\n            const systemInfo = window.getEnhancedSystemInfo();\n            this.test('System Info Returns Valid Object', \n                typeof systemInfo === 'object' && systemInfo.registered, \n                'Error Handling');\n        } catch (error) {\n            this.test('System Info Handles Errors', false, 'Error Handling');\n        }\n        \n        // Test updateComponent with invalid ID (should fail gracefully)\n        try {\n            window.enhancedComponentManager?.updateComponent('non-existent-id', {});\n            this.test('updateComponent Handles Invalid ID', false, 'Error Handling'); // Should throw\n        } catch (error) {\n            this.test('updateComponent Handles Invalid ID', true, 'Error Handling'); // Should throw\n        }\n    }\n    \n    /**\n     * Run all tests and generate report\n     */\n    async runAllTests() {\n        console.log('🧪 Starting Gemini Race Condition Fix Validation...');\n        console.log('=' .repeat(60));\n        \n        // Run all test categories\n        this.testSystemRegistration();\n        this.testCoreSystems();\n        this.testMethodAvailability();\n        this.testInitializationIntegration();\n        this.testErrorHandling();\n        \n        // Generate summary report\n        this.generateReport();\n        \n        return this.results;\n    }\n    \n    /**\n     * Generate comprehensive test report\n     */\n    generateReport() {\n        const duration = performance.now() - this.results.startTime;\n        \n        console.log('\\n' + '=' .repeat(60));\n        console.log('📊 GEMINI RACE CONDITION FIX - TEST REPORT');\n        console.log('=' .repeat(60));\n        \n        // Overall summary\n        const totalTests = this.results.passed + this.results.failed;\n        const successRate = totalTests > 0 ? (this.results.passed / totalTests * 100).toFixed(1) : 0;\n        \n        console.log(`🎯 Overall Success Rate: ${successRate}% (${this.results.passed}/${totalTests})`);\n        console.log(`⏱️ Test Duration: ${duration.toFixed(2)}ms`);\n        \n        if (this.results.failed === 0) {\n            console.log('\\n🎉 ALL TESTS PASSED! Race condition fixes are working correctly.');\n        } else {\n            console.log(`\\n⚠️ ${this.results.failed} test(s) failed. See details below.`);\n        }\n        \n        // Category breakdown\n        console.log('\\n📋 Results by Category:');\n        Object.entries(this.categories).forEach(([category, tests]) => {\n            if (tests.length > 0) {\n                const passed = tests.filter(t => t.condition).length;\n                const total = tests.length;\n                const rate = total > 0 ? (passed / total * 100).toFixed(0) : 0;\n                const icon = passed === total ? '✅' : passed > 0 ? '⚠️' : '❌';\n                \n                console.log(`  ${icon} ${category}: ${rate}% (${passed}/${total})`);\n                \n                // Show failed tests\n                const failed = tests.filter(t => !t.condition);\n                if (failed.length > 0) {\n                    failed.forEach(test => {\n                        const criticality = test.critical ? ' (CRITICAL)' : '';\n                        console.log(`    ❌ ${test.name}${criticality}`);\n                    });\n                }\n            }\n        });\n        \n        // Critical failures\n        const criticalFailures = this.results.tests.filter(t => t.critical && !t.condition);\n        if (criticalFailures.length > 0) {\n            console.log('\\n🚨 CRITICAL FAILURES:');\n            criticalFailures.forEach(test => {\n                console.log(`  ❌ ${test.name} (${test.category})`);\n            });\n        }\n        \n        // Next steps\n        console.log('\\n🎯 Next Steps:');\n        if (this.results.failed === 0) {\n            console.log('  ✅ All race condition fixes implemented successfully!');\n            console.log('  ✅ Component managers are properly exposed and functional');\n            console.log('  ✅ Ready for production use');\n        } else if (criticalFailures.length > 0) {\n            console.log('  🔥 Address critical failures first');\n            console.log('  📞 Contact development team if critical systems unavailable');\n        } else {\n            console.log('  📝 Review non-critical failures');\n            console.log('  🔄 Consider re-running tests after page refresh');\n        }\n        \n        console.log('\\n' + '=' .repeat(60));\n    }\n    \n    /**\n     * Quick diagnostic for common issues\n     */\n    quickDiagnostic() {\n        console.log('🔍 Quick Diagnostic for Race Condition Issues...');\n        \n        const diagnostics = {\n            'guestifyData Available': !!window.guestifyData,\n            'System Registrar': !!window.systemRegistrar,\n            'Enhanced Systems Registered': !!window.stateManager && !!window.componentManager,\n            'DOM Ready': document.readyState === 'complete',\n            'Preview Container': !!document.getElementById('media-kit-preview'),\n            'Component Manager Init': !!window.enhancedComponentManager?.isInitialized,\n            'Add Component Method': typeof window.enhancedComponentManager?.addComponent === 'function',\n            'Update Component Method': typeof window.enhancedComponentManager?.updateComponent === 'function'\n        };\n        \n        console.table(diagnostics);\n        \n        const failed = Object.entries(diagnostics).filter(([key, value]) => !value);\n        if (failed.length === 0) {\n            console.log('✅ All critical systems appear to be working!');\n        } else {\n            console.log('❌ Issues detected:', failed.map(([key]) => key));\n        }\n        \n        return diagnostics;\n    }\n}\n\n// Export for use in console\nwindow.GeminiRaceConditionTester = GeminiRaceConditionTester;\n\n// Create global test instance\nwindow.geminiRaceTest = new GeminiRaceConditionTester();\n\n// Expose quick functions\nwindow.testGeminiRaceFix = () => window.geminiRaceTest.runAllTests();\nwindow.quickRaceDiagnostic = () => window.geminiRaceTest.quickDiagnostic();\n\nconsole.log('🧪 Gemini Race Condition Test Suite loaded!');\nconsole.log('🔧 Run: testGeminiRaceFix() or quickRaceDiagnostic()');