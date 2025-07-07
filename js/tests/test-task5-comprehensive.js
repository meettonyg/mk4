/**
 * @file test-task5-comprehensive.js
 * @description Comprehensive test suite for Task 5: Data Refresh and Synchronization Controls
 * 
 * Tests all aspects of the implementation:
 * - Phase 1: MKCGDataRefreshManager
 * - Phase 2: DataConflictResolver  
 * - Phase 3: Template Integration
 * - Phase 4: Sync Indicator Integration
 * - Phase 5: Server-Side Refresh Support
 */

import { structuredLogger } from '../utils/structured-logger.js';
import { showToast } from '../utils/toast-polyfill.js';

/**
 * Comprehensive Task 5 Test Suite
 */
class Task5ComprehensiveTestSuite {
    constructor() {
        this.logger = structuredLogger;
        this.testResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
        
        this.logger.info('TASK5_TEST', 'Task 5 Comprehensive Test Suite initialized');
    }

    /**
     * Run all Task 5 tests
     * @returns {Promise<Object>} Test results
     */
    async runAllTests() {
        console.group('🔄 Task 5: Data Refresh and Synchronization Controls - Comprehensive Test Suite');
        
        this.logger.info('TASK5_TEST', 'Starting comprehensive Task 5 validation');
        
        try {
            // Phase 1: Test MKCGDataRefreshManager
            await this.testRefreshManager();
            
            // Phase 2: Test DataConflictResolver
            await this.testConflictResolver();
            
            // Phase 3: Test Template Integration
            this.testTemplateIntegration();
            
            // Phase 4: Test Sync Indicator Integration
            this.testSyncIndicatorIntegration();
            
            // Phase 5: Test Server-Side Integration
            await this.testServerSideIntegration();
            
            // Integration Tests
            await this.testCompleteIntegration();
            
            // Performance Tests
            this.testPerformance();
            
            // Generate final report
            this.generateFinalReport();
            
            return this.testResults;
            
        } catch (error) {
            this.logger.error('TASK5_TEST', 'Test suite failed', error);
            console.error('❌ Test suite failed:', error);
            return { ...this.testResults, error: error.message };
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Test Phase 1: MKCG Data Refresh Manager
     */
    async testRefreshManager() {
        console.group('📋 Phase 1: MKCG Data Refresh Manager Tests');
        
        // Test 1.1: Manager Availability
        this.test('1.1 Refresh Manager Available', 
            !!window.mkcgDataRefreshManager,
            'MKCG Data Refresh Manager should be available globally'
        );
        
        if (!window.mkcgDataRefreshManager) {
            console.groupEnd();
            return;
        }
        
        const refreshManager = window.mkcgDataRefreshManager;
        
        // Test 1.2: Core Methods Available
        this.test('1.2 Core Methods Available', 
            typeof refreshManager.refreshAllData === 'function' &&
            typeof refreshManager.refreshComponent === 'function' &&
            typeof refreshManager.checkForFreshData === 'function',
            'All core refresh methods should be available'
        );
        
        // Test 1.3: Configuration
        this.test('1.3 Configuration Valid', 
            refreshManager.config && 
            refreshManager.config.autoCheckInterval > 0 &&
            refreshManager.config.refreshTimeout > 0,
            'Refresh manager should have valid configuration'
        );
        
        // Test 1.4: Auto-Check Initialization
        this.test('1.4 Auto-Check System', 
            typeof refreshManager.setupAutoRefreshChecks === 'function',
            'Auto-check system should be available'
        );
        
        // Test 1.5: State Tracking
        this.test('1.5 State Tracking', 
            refreshManager.refreshState &&
            typeof refreshManager.refreshState.inProgress === 'boolean',
            'Refresh state tracking should be operational'
        );
        
        // Test 1.6: Statistics
        const stats = refreshManager.getRefreshStats();
        this.test('1.6 Statistics Available', 
            stats && typeof stats.isRefreshing === 'boolean',
            'Refresh statistics should be available'
        );
        
        console.log('📊 Refresh Manager Stats:', stats);
        
        console.groupEnd();
    }

    /**
     * Test Phase 2: Data Conflict Resolver
     */
    async testConflictResolver() {
        console.group('🔀 Phase 2: Data Conflict Resolver Tests');
        
        // Test 2.1: Resolver Class Available
        this.test('2.1 Conflict Resolver Class Available', 
            !!window.DataConflictResolver,
            'DataConflictResolver class should be available globally'
        );
        
        if (!window.DataConflictResolver) {
            console.groupEnd();
            return;
        }
        
        // Test 2.2: Create Resolver Instance
        let resolver;
        try {
            resolver = new window.DataConflictResolver();
            this.test('2.2 Resolver Instance Creation', 
                true,
                'Should be able to create resolver instance'
            );
        } catch (error) {
            this.test('2.2 Resolver Instance Creation', 
                false,
                `Failed to create resolver: ${error.message}`
            );
            console.groupEnd();
            return;
        }
        
        // Test 2.3: Core Methods
        this.test('2.3 Core Resolution Methods', 
            typeof resolver.resolveConflicts === 'function' &&
            typeof resolver.analyzeConflicts === 'function' &&
            typeof resolver.autoResolveSimpleConflicts === 'function',
            'All core resolution methods should be available'
        );
        
        // Test 2.4: Strategy Support
        this.test('2.4 Resolution Strategies', 
            resolver.strategies &&
            resolver.strategies['keep-local'] &&
            resolver.strategies['use-fresh'] &&
            resolver.strategies['smart-merge'],
            'All resolution strategies should be defined'
        );
        
        // Test 2.5: Mock Conflict Resolution
        try {
            const mockConflicts = [
                {
                    componentId: 'test-component',
                    componentType: 'biography',
                    fieldName: 'bio_text',
                    type: 'field-conflict',
                    currentValue: 'Local bio text',
                    freshValue: 'Fresh bio text',
                    severity: 'low'
                }
            ];
            
            const analysis = resolver.analyzeConflicts(mockConflicts);
            this.test('2.5 Conflict Analysis', 
                analysis && analysis.totalConflicts === 1,
                'Should be able to analyze conflicts'
            );
            
            console.log('🔍 Conflict Analysis Result:', analysis);
            
        } catch (error) {
            this.test('2.5 Conflict Analysis', 
                false,
                `Conflict analysis failed: ${error.message}`
            );
        }
        
        // Test 2.6: Statistics
        const resolverStats = resolver.getStats();
        this.test('2.6 Resolver Statistics', 
            resolverStats && typeof resolverStats.modalOpen === 'boolean',
            'Resolver statistics should be available'
        );
        
        console.log('📊 Conflict Resolver Stats:', resolverStats);
        
        console.groupEnd();
    }

    /**
     * Test Phase 3: Template Integration
     */
    testTemplateIntegration() {
        console.group('🎨 Phase 3: Template Integration Tests');
        
        // Test 3.1: MKCG Dashboard
        const dashboard = document.getElementById('mkcg-enhanced-dashboard');
        this.test('3.1 MKCG Dashboard Element', 
            !!dashboard,
            'Enhanced MKCG dashboard should be present in template'
        );
        
        // Test 3.2: Refresh Button
        const refreshBtn = document.getElementById('mkcg-refresh-data');
        this.test('3.2 Refresh Button Element', 
            !!refreshBtn,
            'Refresh data button should be present'
        );
        
        // Test 3.3: Auto-Generate Button
        const autoGenBtn = document.getElementById('mkcg-auto-generate-all');
        this.test('3.3 Auto-Generate Button Element', 
            !!autoGenBtn,
            'Auto-generate button should be present'
        );
        
        // Test 3.4: Dashboard Panel
        const dashboardPanel = document.getElementById('dashboard-panel');
        this.test('3.4 Dashboard Panel Element', 
            !!dashboardPanel,
            'Dashboard panel should be present'
        );
        
        // Test 3.5: CSS Integration
        const task5CSS = document.getElementById('task5-sync-integration-css');
        this.test('3.5 Task 5 CSS Integration', 
            !!task5CSS,
            'Task 5 CSS should be injected into page'
        );
        
        // Test 3.6: Empty State Enhancement
        const emptyState = document.getElementById('enhanced-empty-state');
        this.test('3.6 Enhanced Empty State', 
            !!emptyState,
            'Enhanced empty state should be present'
        );
        
        console.groupEnd();
    }

    /**
     * Test Phase 4: Sync Indicator Integration
     */
    testSyncIndicatorIntegration() {
        console.group('🔗 Phase 4: Sync Indicator Integration Tests');
        
        // Test 4.1: Sync Integration Available
        this.test('4.1 Sync Integration Available', 
            !!window.task5SyncIntegration,
            'Task 5 Sync Integration should be available globally'
        );
        
        if (!window.task5SyncIntegration) {
            console.groupEnd();
            return;
        }
        
        const syncIntegration = window.task5SyncIntegration;
        
        // Test 4.2: Component Sync States
        this.test('4.2 Component Sync States', 
            syncIntegration.componentSyncStates instanceof Map,
            'Component sync states should be managed via Map'
        );
        
        // Test 4.3: Global Refresh State
        this.test('4.3 Global Refresh State', 
            syncIntegration.globalRefreshState &&
            typeof syncIntegration.globalRefreshState.inProgress === 'boolean',
            'Global refresh state should be tracked'
        );
        
        // Test 4.4: Event Handlers
        this.test('4.4 Event Handler Setup', 
            typeof syncIntegration.handleRefreshStart === 'function' &&
            typeof syncIntegration.handleRefreshComplete === 'function',
            'Event handlers should be defined'
        );
        
        // Test 4.5: Component Indicator Creation
        this.test('4.5 Component Indicator Methods', 
            typeof syncIntegration.createSyncIndicator === 'function' &&
            typeof syncIntegration.createDataFreshnessIndicator === 'function',
            'Component indicator creation methods should be available'
        );
        
        // Test 4.6: Statistics
        const syncStats = syncIntegration.getStats();
        this.test('4.6 Sync Integration Statistics', 
            syncStats && typeof syncStats.componentCount === 'number',
            'Sync integration statistics should be available'
        );
        
        console.log('📊 Sync Integration Stats:', syncStats);
        
        console.groupEnd();
    }

    /**
     * Test Phase 5: Server-Side Integration
     */
    async testServerSideIntegration() {
        console.group('🌐 Phase 5: Server-Side Integration Tests');
        
        // Test 5.1: AJAX URL Available
        this.test('5.1 WordPress AJAX URL', 
            !!window.guestifyData?.ajaxurl,
            'WordPress AJAX URL should be available'
        );
        
        // Test 5.2: Nonce Available
        this.test('5.2 Security Nonce', 
            !!window.guestifyData?.nonce,
            'Security nonce should be available'
        );
        
        if (!window.guestifyData?.ajaxurl) {
            console.groupEnd();
            return;
        }
        
        // Test 5.3: Connectivity Test
        try {
            const response = await fetch(window.guestifyData.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'gmkb_connectivity_test',
                    nonce: window.guestifyData.nonce
                })
            });
            
            const result = await response.json();
            this.test('5.3 Server Connectivity', 
                result.success,
                'Should be able to connect to server'
            );
            
            console.log('🌐 Connectivity Test Result:', result);
            
        } catch (error) {
            this.test('5.3 Server Connectivity', 
                false,
                `Connectivity test failed: ${error.message}`
            );
        }
        
        // Test 5.4: MKCG Data Integration Class
        this.test('5.4 GMKB Integration Class Available', 
            window.guestifyData?.integration_available !== false,
            'GMKB MKCG Integration class should be available on server'
        );
        
        console.groupEnd();
    }

    /**
     * Test Complete Integration
     */
    async testCompleteIntegration() {
        console.group('🎯 Integration Tests');
        
        // Test I.1: Task 5 Integration Manager
        this.test('I.1 Task 5 Integration Manager', 
            !!window.task5Integration,
            'Task 5 Integration Manager should be available'
        );
        
        if (!window.task5Integration) {
            console.groupEnd();
            return;
        }
        
        const integration = window.task5Integration;
        
        // Test I.2: Integration Status
        const status = integration.getStatus();
        this.test('I.2 Integration Initialized', 
            status.initialized,
            'Task 5 integration should be initialized'
        );
        
        // Test I.3: Component Status
        this.test('I.3 All Components Available', 
            status.components.refreshManager.available &&
            status.components.conflictResolver.available &&
            status.components.syncIntegration.available,
            'All Task 5 components should be available'
        );
        
        // Test I.4: Global API
        this.test('I.4 Global Task 5 API', 
            !!window.task5 &&
            typeof window.task5.refreshAll === 'function' &&
            typeof window.task5.getStatus === 'function',
            'Global Task 5 API should be available'
        );
        
        // Test I.5: Component Detection
        if (window.enhancedStateManager) {
            const components = window.enhancedStateManager.getComponents();
            this.test('I.5 Component State Manager Integration', 
                Array.isArray(components),
                'Should be able to access component state'
            );
            
            console.log('🔍 Current Components:', components.length);
        }
        
        // Test I.6: Main.js Integration
        this.test('I.6 Main.js Integration', 
            typeof window.testArchitectureFix === 'function',
            'Task 5 should be integrated into main.js'
        );
        
        console.log('📊 Integration Status:', status);
        console.log('🎯 Global API:', Object.keys(window.task5 || {}));
        
        console.groupEnd();
    }

    /**
     * Test Performance
     */
    testPerformance() {
        console.group('⚡ Performance Tests');
        
        // Test P.1: Memory Usage
        const memoryUsage = performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : null;
        
        if (memoryUsage) {
            this.test('P.1 Memory Usage Reasonable', 
                memoryUsage.used < 100,
                `Memory usage should be under 100MB (current: ${memoryUsage.used}MB)`
            );
            
            console.log('💾 Memory Usage:', memoryUsage);
        }
        
        // Test P.2: Component Count
        const componentCount = window.task5SyncIntegration?.componentSyncStates?.size || 0;
        this.test('P.2 Component Tracking Efficient', 
            componentCount < 1000,
            `Component tracking should be efficient (tracking: ${componentCount} components)`
        );
        
        // Test P.3: Event Listener Count
        this.test('P.3 Event System Efficiency', 
            !window.eventBus || typeof window.eventBus.getListenerCount !== 'function' || 
            window.eventBus.getListenerCount() < 100,
            'Event system should not have excessive listeners'
        );
        
        console.groupEnd();
    }

    /**
     * Generate Final Report
     */
    generateFinalReport() {
        console.group('📋 Task 5 Final Test Report');
        
        const summary = {
            total: this.testResults.tests.length,
            passed: this.testResults.passed,
            failed: this.testResults.failed,
            warnings: this.testResults.warnings,
            successRate: Math.round((this.testResults.passed / this.testResults.tests.length) * 100)
        };
        
        console.log('📊 Test Summary:');
        console.log(`  ✅ Passed: ${summary.passed}`);
        console.log(`  ❌ Failed: ${summary.failed}`);
        console.log(`  ⚠️  Warnings: ${summary.warnings}`);
        console.log(`  📈 Success Rate: ${summary.successRate}%`);
        
        // Show failed tests
        if (summary.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.tests
                .filter(test => !test.passed)
                .forEach(test => {
                    console.log(`  - ${test.name}: ${test.reason}`);
                });
        }
        
        // Show warnings
        if (summary.warnings > 0) {
            console.log('\n⚠️ Warnings:');
            this.testResults.tests
                .filter(test => test.warning)
                .forEach(test => {
                    console.log(`  - ${test.name}: ${test.reason}`);
                });
        }
        
        // Overall assessment
        if (summary.successRate >= 95) {
            console.log('\n🎉 EXCELLENT: Task 5 implementation is comprehensive and working well!');
            showToast('Task 5 validation passed with flying colors! 🎉', 'success');
        } else if (summary.successRate >= 80) {
            console.log('\n✅ GOOD: Task 5 implementation is solid with minor issues.');
            showToast('Task 5 validation mostly successful ✅', 'info');
        } else if (summary.successRate >= 60) {
            console.log('\n⚠️ NEEDS WORK: Task 5 implementation has some issues that need attention.');
            showToast('Task 5 validation found some issues ⚠️', 'warning');
        } else {
            console.log('\n❌ CRITICAL: Task 5 implementation has significant problems.');
            showToast('Task 5 validation found critical issues ❌', 'error');
        }
        
        // Generate detailed report
        this.generateDetailedReport(summary);
        
        console.groupEnd();
        
        return summary;
    }

    /**
     * Generate Detailed Report
     */
    generateDetailedReport(summary) {
        const report = {
            timestamp: new Date().toISOString(),
            summary,
            tests: this.testResults.tests,
            environment: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                hasGuestifyData: !!window.guestifyData,
                hasMKCGData: !!window.guestifyData?.mkcgData,
                postId: window.guestifyData?.postId
            },
            integrationStatus: window.task5Integration?.getStatus() || null,
            refreshManagerStats: window.mkcgDataRefreshManager?.getRefreshStats() || null,
            syncIntegrationStats: window.task5SyncIntegration?.getStats() || null
        };
        
        // Store report globally for access
        window.task5TestReport = report;
        
        console.log('\n📄 Detailed report available at: window.task5TestReport');
        console.log('💾 To export report: JSON.stringify(window.task5TestReport, null, 2)');
        
        this.logger.info('TASK5_TEST', 'Comprehensive test completed', {
            summary,
            reportStored: true
        });
    }

    /**
     * Helper method to run a test
     */
    test(name, condition, reason, warning = false) {
        const passed = !!condition;
        
        const result = {
            name,
            passed,
            reason,
            warning: warning && passed,
            timestamp: Date.now()
        };
        
        this.testResults.tests.push(result);
        
        if (passed) {
            if (warning) {
                this.testResults.warnings++;
                console.log(`⚠️  ${name}: PASS (with warning) - ${reason}`);
            } else {
                this.testResults.passed++;
                console.log(`✅ ${name}: PASS`);
            }
        } else {
            this.testResults.failed++;
            console.log(`❌ ${name}: FAIL - ${reason}`);
        }
        
        return passed;
    }
}

/**
 * Export test suite
 */
export { Task5ComprehensiveTestSuite };

/**
 * Global test runner function
 */
window.testTask5Comprehensive = async function() {
    const testSuite = new Task5ComprehensiveTestSuite();
    return await testSuite.runAllTests();
};

// Make test suite available globally
window.Task5ComprehensiveTestSuite = Task5ComprehensiveTestSuite;

console.log('🧪 Task 5 Comprehensive Test Suite loaded. Run with: testTask5Comprehensive()');
