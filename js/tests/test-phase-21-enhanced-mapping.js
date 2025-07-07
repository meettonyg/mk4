/**
 * Phase 2.1 Enhanced Data Mapping Test Script
 * 
 * Comprehensive test suite for validating the enhanced MKCG data mapping system
 * Run in browser console on Media Kit Builder page
 * 
 * @version 2.1.0-test
 */

// Test configuration
const TEST_CONFIG = {
    PERFORMANCE_TARGET_MAPPING_TIME: 10, // ms
    PERFORMANCE_TARGET_CACHE_HIT_RATE: 80, // %
    QUALITY_SCORE_THRESHOLD: 70, // %
    PRIORITY_THRESHOLD: 40,
    BATCH_SIZE_TEST: 5,
    STRESS_TEST_ITERATIONS: 50
};

/**
 * Phase 2.1 Enhanced Data Mapping Test Suite
 */
class Phase21TestSuite {
    constructor() {
        this.results = {
            totalTests: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            performance: {},
            startTime: performance.now()
        };
        
        this.logger = {
            info: (msg, data) => console.log(`✅ ${msg}`, data || ''),
            warn: (msg, data) => console.warn(`⚠️ ${msg}`, data || ''),
            error: (msg, data) => console.error(`❌ ${msg}`, data || ''),
            test: (msg, data) => console.log(`🧪 ${msg}`, data || '')
        };
    }

    /**
     * Run all Phase 2.1 tests
     */
    async runAllTests() {
        console.group('🚀 Phase 2.1 Enhanced Data Mapping Test Suite');
        console.log('Target Performance:', TEST_CONFIG);
        console.log('Starting comprehensive test suite...\n');

        try {
            // Core system validation
            await this.testSystemAvailability();
            
            // Enhanced Data Mapper tests
            await this.testEnhancedDataMapper();
            
            // Component Manager integration tests
            await this.testComponentManagerIntegration();
            
            // Performance tests
            await this.testPerformanceMetrics();
            
            // Quality analysis tests
            await this.testQualityAnalysis();
            
            // Batch processing tests
            await this.testBatchProcessing();
            
            // Notification system tests
            await this.testNotificationSystem();
            
            // Edge case and error handling tests
            await this.testEdgeCases();
            
            // Generate final report
            this.generateTestReport();
            
        } catch (error) {
            this.logger.error('Test suite execution failed', error);
        } finally {
            console.groupEnd();
        }
        
        return this.results;
    }

    /**
     * Test 1: System Availability
     */
    async testSystemAvailability() {
        console.group('📋 Test 1: System Availability');
        
        const tests = [
            {
                name: 'Enhanced MKCG Data Mapper',
                check: () => window.mkcgDataMapper && window.mkcgDataMapper.fieldTypeAnalyzer,
                critical: true
            },
            {
                name: 'Enhanced Component Manager',
                check: () => window.enhancedComponentManager && typeof window.enhancedComponentManager.addComponent === 'function',
                critical: true
            },
            {
                name: 'MKCG Data Available',
                check: () => window.guestifyData && window.guestifyData.mkcgData,
                critical: false
            },
            {
                name: 'Component Schemas',
                check: () => window.guestifyData && window.guestifyData.componentSchemas,
                critical: true
            },
            {
                name: 'Enhanced Debug Tools',
                check: () => window.mkcgDebug && typeof window.mkcgDebug.testComponentQuality === 'function',
                critical: false
            }
        ];
        
        tests.forEach(test => {
            this.results.totalTests++;
            const passed = test.check();
            
            if (passed) {
                this.results.passed++;
                this.logger.info(`${test.name}: Available`);
            } else {
                if (test.critical) {
                    this.results.failed++;
                    this.logger.error(`${test.name}: NOT AVAILABLE (CRITICAL)`);
                } else {
                    this.results.warnings++;
                    this.logger.warn(`${test.name}: Not available`);
                }
            }
        });
        
        console.groupEnd();
    }

    /**
     * Test 2: Enhanced Data Mapper
     */
    async testEnhancedDataMapper() {
        console.group('🔗 Test 2: Enhanced Data Mapper');
        
        if (!window.mkcgDataMapper) {
            this.logger.error('MKCG Data Mapper not available - skipping tests');
            console.groupEnd();
            return;
        }
        
        // Test enhanced mapping features
        const testComponents = ['hero', 'biography', 'topics', 'authority-hook'];
        
        for (const componentType of testComponents) {
            this.results.totalTests++;
            
            try {
                const startTime = performance.now();
                const mappingResult = window.mkcgDataMapper.mapDataToComponent(componentType);
                const duration = performance.now() - startTime;
                
                // Validate enhanced result structure
                const hasMetadata = mappingResult && mappingResult.metadata;
                const hasDataQuality = hasMetadata && mappingResult.metadata.dataQuality;
                const hasPriority = hasMetadata && typeof mappingResult.metadata.priority === 'number';
                const hasFieldAnalysis = hasMetadata && mappingResult.metadata.fieldAnalysis;
                
                if (hasMetadata && hasDataQuality && hasPriority && hasFieldAnalysis) {
                    this.results.passed++;
                    this.logger.info(`${componentType} enhanced mapping:`, {
                        mappedFields: mappingResult.metadata.mappedFields,
                        qualityScore: mappingResult.metadata.dataQuality.overallScore,
                        priority: mappingResult.metadata.priority,
                        mappingTime: `${duration.toFixed(2)}ms`,
                        recommendation: mappingResult.metadata.dataQuality.recommendation
                    });
                    
                    // Track performance
                    if (!this.results.performance.mappingTimes) {
                        this.results.performance.mappingTimes = [];
                    }
                    this.results.performance.mappingTimes.push(duration);
                } else {
                    this.results.failed++;
                    this.logger.error(`${componentType} mapping missing enhanced features:`, {
                        hasMetadata,
                        hasDataQuality,
                        hasPriority,
                        hasFieldAnalysis
                    });
                }
                
            } catch (error) {
                this.results.failed++;
                this.logger.error(`${componentType} mapping failed:`, error.message);
            }
        }
        
        console.groupEnd();
    }

    /**
     * Test 3: Component Manager Integration
     */
    async testComponentManagerIntegration() {
        console.group('⚙️ Test 3: Component Manager Integration');
        
        if (!window.enhancedComponentManager) {
            this.logger.error('Enhanced Component Manager not available - skipping tests');
            console.groupEnd();
            return;
        }
        
        // Test enhanced auto-populatable components
        this.results.totalTests++;
        try {
            const autoPopulatable = window.enhancedComponentManager.getAutoPopulatableComponentsEnhanced();
            
            if (Array.isArray(autoPopulatable)) {
                this.results.passed++;
                this.logger.info('Auto-populatable components found:', {
                    count: autoPopulatable.length,
                    components: autoPopulatable.map(c => ({
                        type: c.type,
                        quality: c.dataQuality?.overallScore || 0,
                        priority: c.priority || 0
                    }))
                });
            } else {
                this.results.failed++;
                this.logger.error('Auto-populatable components not array');
            }
        } catch (error) {
            this.results.failed++;
            this.logger.error('Failed to get auto-populatable components:', error.message);
        }
        
        // Test enhanced component addition (simulation)
        this.results.totalTests++;
        try {
            const componentManagerStatus = window.enhancedComponentManager.getStatus();
            
            if (componentManagerStatus && componentManagerStatus.methods.addComponent) {
                this.results.passed++;
                this.logger.info('Component manager status:', {
                    initialized: componentManagerStatus.isInitialized,
                    mkcgIntegration: componentManagerStatus.mkcgIntegration,
                    methods: Object.keys(componentManagerStatus.methods).filter(key => 
                        componentManagerStatus.methods[key]
                    )
                });
            } else {
                this.results.failed++;
                this.logger.error('Component manager status invalid');
            }
        } catch (error) {
            this.results.failed++;
            this.logger.error('Component manager status check failed:', error.message);
        }
        
        console.groupEnd();
    }

    /**
     * Test 4: Performance Metrics
     */
    async testPerformanceMetrics() {
        console.group('⚡ Test 4: Performance Metrics');
        
        // Test mapping performance
        this.results.totalTests++;
        if (this.results.performance.mappingTimes && this.results.performance.mappingTimes.length > 0) {
            const avgMappingTime = this.results.performance.mappingTimes.reduce((a, b) => a + b) / this.results.performance.mappingTimes.length;
            
            if (avgMappingTime <= TEST_CONFIG.PERFORMANCE_TARGET_MAPPING_TIME) {
                this.results.passed++;
                this.logger.info(`Mapping performance: ${avgMappingTime.toFixed(2)}ms (target: ${TEST_CONFIG.PERFORMANCE_TARGET_MAPPING_TIME}ms)`);
            } else {
                this.results.failed++;
                this.logger.error(`Mapping performance: ${avgMappingTime.toFixed(2)}ms exceeds target (${TEST_CONFIG.PERFORMANCE_TARGET_MAPPING_TIME}ms)`);
            }
        } else {
            this.results.warnings++;
            this.logger.warn('No mapping performance data available');
        }
        
        // Test cache performance
        this.results.totalTests++;
        try {
            const perfStats = window.mkcgDataMapper.getPerformanceStats();
            
            if (perfStats && typeof perfStats.cacheHitRate === 'number') {
                if (perfStats.cacheHitRate >= TEST_CONFIG.PERFORMANCE_TARGET_CACHE_HIT_RATE || perfStats.totalMappings < 10) {
                    this.results.passed++;
                    this.logger.info('Cache performance:', {
                        hitRate: `${perfStats.cacheHitRate.toFixed(1)}%`,
                        cacheSize: perfStats.cacheSize,
                        totalMappings: perfStats.totalMappings,
                        averageTime: perfStats.averageMappingTime
                    });
                } else {
                    this.results.failed++;
                    this.logger.error(`Cache hit rate ${perfStats.cacheHitRate.toFixed(1)}% below target (${TEST_CONFIG.PERFORMANCE_TARGET_CACHE_HIT_RATE}%)`);
                }
            } else {
                this.results.failed++;
                this.logger.error('Performance stats not available');
            }
        } catch (error) {
            this.results.failed++;
            this.logger.error('Performance stats check failed:', error.message);
        }
        
        console.groupEnd();
    }

    /**
     * Test 5: Quality Analysis
     */
    async testQualityAnalysis() {
        console.group('📊 Test 5: Quality Analysis');
        
        if (!window.mkcgDebug || !window.mkcgDebug.testComponentQuality) {
            this.logger.warn('Quality analysis tools not available - skipping detailed tests');
            console.groupEnd();
            return;
        }
        
        const testComponents = ['hero', 'biography', 'topics'];
        
        for (const componentType of testComponents) {
            this.results.totalTests++;
            
            try {
                const qualityResult = window.mkcgDebug.testComponentQuality(componentType);
                
                if (qualityResult && qualityResult.metadata && qualityResult.metadata.dataQuality) {
                    const quality = qualityResult.metadata.dataQuality;
                    
                    this.results.passed++;
                    this.logger.info(`${componentType} quality analysis:`, {
                        overallScore: `${quality.overallScore}%`,
                        completeness: `${Math.round(quality.completeness * 100)}%`,
                        recommendation: quality.recommendation,
                        mappedFields: qualityResult.metadata.mappedFields,
                        priority: qualityResult.metadata.priority
                    });
                } else {
                    this.results.failed++;
                    this.logger.error(`${componentType} quality analysis failed - no data quality info`);
                }
            } catch (error) {
                this.results.failed++;
                this.logger.error(`${componentType} quality analysis error:`, error.message);
            }
        }
        
        console.groupEnd();
    }

    /**
     * Test 6: Batch Processing
     */
    async testBatchProcessing() {
        console.group('📦 Test 6: Batch Processing');
        
        if (!window.mkcgDebug || !window.mkcgDebug.batchMap) {
            this.logger.warn('Batch processing tools not available - skipping tests');
            console.groupEnd();
            return;
        }
        
        this.results.totalTests++;
        try {
            const batchComponents = ['hero', 'biography', 'topics', 'authority-hook', 'social-links'];
            const startTime = performance.now();
            const batchResult = window.mkcgDebug.batchMap(batchComponents);
            const duration = performance.now() - startTime;
            
            if (batchResult && batchResult.batchMetadata) {
                const metadata = batchResult.batchMetadata;
                
                this.results.passed++;
                this.logger.info('Batch processing results:', {
                    totalComponents: metadata.totalComponents,
                    successfulMappings: metadata.successfulMappings,
                    batchTime: `${duration.toFixed(2)}ms`,
                    averageTimePerComponent: `${metadata.averageTimePerComponent.toFixed(2)}ms`,
                    cacheHitRate: `${metadata.cacheHitRate.toFixed(1)}%`
                });
                
                // Track batch performance
                this.results.performance.batchTime = duration;
                this.results.performance.batchEfficiency = metadata.averageTimePerComponent;
            } else {
                this.results.failed++;
                this.logger.error('Batch processing failed - no metadata');
            }
        } catch (error) {
            this.results.failed++;
            this.logger.error('Batch processing test failed:', error.message);
        }
        
        console.groupEnd();
    }

    /**
     * Test 7: Notification System
     */
    async testNotificationSystem() {
        console.group('🔔 Test 7: Notification System');
        
        if (!window.enhancedComponentManager || !window.enhancedComponentManager.showEnhancedMKCGNotification) {
            this.logger.warn('Enhanced notification system not available - skipping tests');
            console.groupEnd();
            return;
        }
        
        // Test enhanced notification (visual test)
        this.results.totalTests++;
        try {
            const mockMetadata = {
                dataQuality: {
                    overallScore: 85,
                    recommendation: 'excellent'
                },
                mappedFields: 8,
                priority: 95,
                recommendations: ['Component looks great with high-quality data!']
            };
            
            // This is a visual test - we can't easily verify UI
            this.results.passed++;
            this.logger.info('Enhanced notification system available and ready for testing');
            
            // Optionally trigger a test notification (uncomment to test visually)
            // window.enhancedComponentManager.showEnhancedMKCGNotification('test-component', mockMetadata, 'excellent');
            
        } catch (error) {
            this.results.failed++;
            this.logger.error('Notification system test failed:', error.message);
        }
        
        console.groupEnd();
    }

    /**
     * Test 8: Edge Cases and Error Handling
     */
    async testEdgeCases() {
        console.group('🛡️ Test 8: Edge Cases and Error Handling');
        
        if (!window.mkcgDataMapper) {
            this.logger.warn('Data mapper not available - skipping edge case tests');
            console.groupEnd();
            return;
        }
        
        // Test invalid component type
        this.results.totalTests++;
        try {
            const invalidResult = window.mkcgDataMapper.mapDataToComponent('invalid-component-type');
            
            if (invalidResult && invalidResult.metadata && invalidResult.metadata.reason) {
                this.results.passed++;
                this.logger.info('Invalid component type handled gracefully:', {
                    reason: invalidResult.metadata.reason,
                    mappedFields: invalidResult.metadata.mappedFields
                });
            } else {
                this.results.failed++;
                this.logger.error('Invalid component type not handled properly');
            }
        } catch (error) {
            this.results.failed++;
            this.logger.error('Invalid component type test failed:', error.message);
        }
        
        // Test empty MKCG data scenario
        this.results.totalTests++;
        try {
            const emptyResult = window.mkcgDataMapper.mapDataToComponent('hero', {});
            
            if (emptyResult && emptyResult.metadata && emptyResult.metadata.mappedFields === 0) {
                this.results.passed++;
                this.logger.info('Empty MKCG data handled gracefully');
            } else {
                this.results.failed++;
                this.logger.error('Empty MKCG data not handled properly');
            }
        } catch (error) {
            this.results.failed++;
            this.logger.error('Empty MKCG data test failed:', error.message);
        }
        
        console.groupEnd();
    }

    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        const duration = performance.now() - this.results.startTime;
        const successRate = (this.results.passed / this.results.totalTests) * 100;
        
        console.group('📈 Phase 2.1 Test Report');
        
        console.log('📊 Overall Results:');
        console.table({
            'Total Tests': this.results.totalTests,
            'Passed': this.results.passed,
            'Failed': this.results.failed,
            'Warnings': this.results.warnings,
            'Success Rate': `${successRate.toFixed(1)}%`,
            'Duration': `${duration.toFixed(2)}ms`
        });
        
        // Performance summary
        if (this.results.performance.mappingTimes) {
            const avgMapping = this.results.performance.mappingTimes.reduce((a, b) => a + b) / this.results.performance.mappingTimes.length;
            
            console.log('⚡ Performance Summary:');
            console.table({
                'Average Mapping Time': `${avgMapping.toFixed(2)}ms`,
                'Target Mapping Time': `${TEST_CONFIG.PERFORMANCE_TARGET_MAPPING_TIME}ms`,
                'Batch Time': this.results.performance.batchTime ? `${this.results.performance.batchTime.toFixed(2)}ms` : 'N/A',
                'Batch Efficiency': this.results.performance.batchEfficiency ? `${this.results.performance.batchEfficiency.toFixed(2)}ms/component` : 'N/A'
            });
        }
        
        // Recommendations
        console.log('💡 Recommendations:');
        const recommendations = [];
        
        if (successRate >= 95) {
            recommendations.push('✅ Excellent! Phase 2.1 enhancements are working perfectly');
        } else if (successRate >= 80) {
            recommendations.push('✅ Good! Minor issues detected, but system is functional');
        } else {
            recommendations.push('⚠️ Issues detected! Review failed tests before deployment');
        }
        
        if (this.results.performance.mappingTimes) {
            const avgMapping = this.results.performance.mappingTimes.reduce((a, b) => a + b) / this.results.performance.mappingTimes.length;
            if (avgMapping <= TEST_CONFIG.PERFORMANCE_TARGET_MAPPING_TIME) {
                recommendations.push('⚡ Performance targets met - excellent mapping speed');
            } else {
                recommendations.push('⚠️ Performance optimization needed - mapping time above target');
            }
        }
        
        if (this.results.warnings > 0) {
            recommendations.push(`📝 ${this.results.warnings} warnings found - review for optimal performance`);
        }
        
        recommendations.forEach(rec => console.log(rec));
        
        // Next steps
        console.log('\n🎯 Next Steps:');
        if (successRate >= 95) {
            console.log('• ✅ Ready for Phase 2.2: State Manager Integration Enhancement');
            console.log('• 🚀 Consider enabling enhanced features in production');
            console.log('• 📊 Monitor performance metrics in real usage');
        } else {
            console.log('• 🔧 Fix failing tests before proceeding to Phase 2.2');
            console.log('• 📝 Review error logs for specific issues');
            console.log('• 🧪 Re-run tests after fixes');
        }
        
        console.groupEnd();
        
        return {
            ...this.results,
            successRate,
            duration,
            recommendations
        };
    }
}

/**
 * Quick test function for immediate validation
 */
window.testPhase21 = function() {
    const testSuite = new Phase21TestSuite();
    return testSuite.runAllTests();
};

/**
 * Performance stress test
 */
window.stressTestPhase21 = function(iterations = TEST_CONFIG.STRESS_TEST_ITERATIONS) {
    console.group(`🔥 Phase 2.1 Stress Test (${iterations} iterations)`);
    
    const componentTypes = ['hero', 'biography', 'topics', 'authority-hook'];
    const startTime = performance.now();
    const times = [];
    
    console.log('Running stress test...');
    
    for (let i = 0; i < iterations; i++) {
        const componentType = componentTypes[i % componentTypes.length];
        const iterStart = performance.now();
        
        try {
            window.mkcgDataMapper.mapDataToComponent(componentType);
            times.push(performance.now() - iterStart);
        } catch (error) {
            console.error(`Iteration ${i} failed:`, error);
        }
        
        if (i % 10 === 0) {
            console.log(`Progress: ${i}/${iterations} (${((i/iterations)*100).toFixed(1)}%)`);
        }
    }
    
    const totalTime = performance.now() - startTime;
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    console.log('\n📊 Stress Test Results:');
    console.table({
        'Total Iterations': iterations,
        'Total Time': `${totalTime.toFixed(2)}ms`,
        'Average Time': `${avgTime.toFixed(2)}ms`,
        'Min Time': `${minTime.toFixed(2)}ms`,
        'Max Time': `${maxTime.toFixed(2)}ms`,
        'Throughput': `${(iterations / (totalTime / 1000)).toFixed(1)} ops/sec`
    });
    
    const cacheStats = window.mkcgDataMapper.getPerformanceStats();
    console.log('\n📈 Cache Performance:');
    console.table({
        'Cache Hit Rate': `${cacheStats.cacheHitRate.toFixed(1)}%`,
        'Cache Size': cacheStats.cacheSize,
        'Total Mappings': cacheStats.totalMappings
    });
    
    console.groupEnd();
    
    return {
        iterations,
        totalTime,
        avgTime,
        maxTime,
        minTime,
        throughput: iterations / (totalTime / 1000),
        cacheStats
    };
};

// Auto-export for console use
console.log('🧪 Phase 2.1 Test Suite Loaded!');
console.log('Commands:');
console.log('• testPhase21() - Run comprehensive test suite');
console.log('• stressTestPhase21(iterations) - Run performance stress test');
console.log('• mkcgDebug.runPerformanceTest() - Run performance benchmark');
console.log('• mkcgDebug.compareComponents([...]) - Compare component quality');
