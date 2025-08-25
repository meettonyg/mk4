/**
 * GMKB Test Runlists
 * Predefined test combinations for different scenarios
 */

if (typeof GMKBTest === 'undefined') {
    console.error('❌ GMKBTest harness not loaded. Please load console-test-suite.js first.');
} else {
    
    /**
     * Test runlists configuration
     */
    GMKBTest.runlists = {
        
        // Smoke tests - Safe, fast, essential functionality
        smoke: {
            name: 'Smoke Tests',
            description: 'Quick verification of essential functionality',
            tests: ['A1', 'A2', 'A3', 'B2', 'C2', 'D1'],
            timeout: 30000, // 30 seconds total
            config: {
                cleanup: true,
                verbose: true,
                failFast: false
            }
        },
        
        // Full test suite - Comprehensive testing
        full: {
            name: 'Full Test Suite',
            description: 'Comprehensive testing of all functionality',
            tests: [
                'A1', 'A2', 'A3', 'A4', 'A5', 'A6', // Component System
                'B1', 'B2', 'B3', // State Management (B4 not implemented in this example)
                'C1', 'C2', // UI Integration (C3, C4 not implemented in this example)
                'D1', 'D2', // WordPress Integration (D3 not implemented)
                // 'E1', 'E2', // MKCG Integration (not implemented in this example)
                // 'F1', 'F2', 'F3' // Performance tests (not implemented in this example)
            ],
            timeout: 120000, // 2 minutes total
            config: {
                cleanup: true,
                verbose: true,
                failFast: false
            }
        },
        
        // Component-focused tests
        components: {
            name: 'Component System Tests',
            description: 'All component-related functionality',
            tests: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
            timeout: 60000,
            config: {
                cleanup: true,
                verbose: true,
                failFast: false
            }
        },
        
        // State management tests
        state: {
            name: 'State Management Tests',
            description: 'State persistence, undo/redo, and data integrity',
            tests: ['B1', 'B2', 'B3'],
            timeout: 45000,
            config: {
                cleanup: true,
                verbose: true,
                failFast: false
            }
        },
        
        // UI integration tests
        ui: {
            name: 'UI Integration Tests',
            description: 'User interface and interaction testing',
            tests: ['C1', 'C2'], // Add C3, C4 when implemented
            timeout: 30000,
            config: {
                cleanup: true,
                verbose: true,
                failFast: false
            }
        },
        
        // WordPress integration tests
        wordpress: {
            name: 'WordPress Integration Tests',
            description: 'WordPress-specific functionality and AJAX',
            tests: ['D1', 'D2'], // Add D3 when implemented
            timeout: 30000,
            config: {
                cleanup: true,
                verbose: true,
                failFast: false
            }
        },
        
        // Quick diagnostic tests
        diagnostic: {
            name: 'Quick Diagnostic',
            description: 'Rapid system health check',
            tests: ['A1', 'D1'],
            timeout: 10000,
            config: {
                cleanup: true,
                verbose: true,
                failFast: true
            }
        }
    };
    
    /**
     * Enhanced run method with runlist support
     */
    const originalRun = GMKBTest.run;
    
    GMKBTest.run = async function(testList = 'smoke') {
        // Check if testList is a predefined runlist
        if (this.runlists[testList]) {
            const runlistConfig = this.runlists[testList];
            
            console.log(`🧪 Running ${runlistConfig.name}: ${runlistConfig.description}`);
            console.log(`📋 Tests: ${runlistConfig.tests.join(', ')}`);
            console.log(`⏱️ Timeout: ${runlistConfig.timeout}ms`);
            
            // Apply runlist configuration
            const originalConfig = { ...this.config };
            Object.assign(this.config, runlistConfig.config);
            
            try {
                // Set timeout for entire runlist
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`Runlist timeout after ${runlistConfig.timeout}ms`)), runlistConfig.timeout);
                });
                
                const runPromise = originalRun.call(this, runlistConfig.tests);
                
                const results = await Promise.race([runPromise, timeoutPromise]);
                
                // Restore original configuration
                this.config = originalConfig;
                
                return results;
                
            } catch (error) {
                // Restore original configuration on error
                this.config = originalConfig;
                throw error;
            }
        } else {
            // Use original run method for custom test lists
            return originalRun.call(this, testList);
        }
    };
    
    /**
     * List available runlists
     */
    GMKBTest.listRunlists = function() {
        console.log('📋 Available Test Runlists:');
        console.log('═══════════════════════════════════');
        
        Object.entries(this.runlists).forEach(([key, runlist]) => {
            console.log(`\n🧪 ${key}:`);
            console.log(`   Name: ${runlist.name}`);
            console.log(`   Description: ${runlist.description}`);
            console.log(`   Tests: ${runlist.tests.join(', ')}`);
            console.log(`   Timeout: ${runlist.timeout}ms`);
            console.log(`   Command: GMKBTest.run('${key}')`);
        });
        
        console.log('\n📝 Custom Examples:');
        console.log('   GMKBTest.run(["A1", "A2"])  - Run specific tests');
        console.log('   GMKBTest.run("A1")           - Run single test');
    };
    
    /**
     * Run with performance monitoring
     */
    GMKBTest.runWithPerfMonitoring = async function(testList = 'smoke') {
        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : null;
        
        console.log('🚀 Starting performance-monitored test run...');
        if (startMemory) {
            console.log(`💾 Initial memory usage: ${(startMemory / 1024 / 1024).toFixed(2)} MB`);
        }
        
        try {
            const results = await this.run(testList);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            const endMemory = performance.memory ? performance.memory.usedJSHeapSize : null;
            
            console.log('\n📊 Performance Summary:');
            console.log(`⏱️ Total duration: ${duration.toFixed(2)}ms`);
            console.log(`📈 Average per test: ${(duration / (results.passed + results.failed)).toFixed(2)}ms`);
            
            if (startMemory && endMemory) {
                const memoryDelta = endMemory - startMemory;
                console.log(`💾 Memory delta: ${(memoryDelta / 1024 / 1024).toFixed(2)} MB`);
                console.log(`💾 Final memory usage: ${(endMemory / 1024 / 1024).toFixed(2)} MB`);
            }
            
            return { ...results, performance: { duration, memoryDelta: endMemory - startMemory } };
            
        } catch (error) {
            const endTime = performance.now();
            console.log(`⏱️ Failed after: ${(endTime - startTime).toFixed(2)}ms`);
            throw error;
        }
    };
    
    console.log('✅ GMKB Test Runlists loaded');
    console.log('📋 Use GMKBTest.listRunlists() to see available options');
    console.log('🚀 Use GMKBTest.run("smoke") to run smoke tests');
    console.log('⚡ Use GMKBTest.runWithPerfMonitoring("full") for performance monitoring');
}
