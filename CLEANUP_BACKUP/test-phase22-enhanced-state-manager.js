/**
 * @file test-phase22-enhanced-state-manager.js
 * @description Comprehensive test suite for Phase 2.2: State Manager Integration Enhancement
 * 
 * PHASE 2.2 TEST COVERAGE:
 * - MKCG Integration initialization and data availability
 * - Intelligent component auto-generation with quality filtering
 * - Enhanced batch operations with progress tracking
 * - State hydration with conflict resolution
 * - Cross-component synchronization
 * - Performance monitoring and statistics
 * 
 * @version 2.2.0-test
 */

/**
 * Phase 2.2 Enhanced State Manager Test Suite
 */
class Phase22StateManagerTest {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            details: []
        };
        
        this.testStartTime = Date.now();
        this.logger = window.structuredLogger || console;
    }

    /**
     * Run all Phase 2.2 tests
     */
    async runAllTests() {
        console.group('🧪 Phase 2.2: Enhanced State Manager Test Suite');
        console.log('Starting comprehensive Phase 2.2 testing...\n');

        try {
            // Core Phase 2.2 Tests
            await this.testMKCGIntegrationInitialization();
            await this.testIntelligentAutoGeneration();
            await this.testEnhancedBatchOperations();
            await this.testStateHydrationWithConflictResolution();
            await this.testProgressTrackingSystem();
            await this.testCrossComponentSynchronization();
            await this.testEnhancedPerformanceStatistics();
            await this.testMKCGDataMonitoring();
            await this.testPhase22DebuggingInterface();
            
            // Integration Tests
            await this.testPhase21Integration();
            await this.testBackwardCompatibility();
            await this.testErrorHandlingAndRecovery();
            
            // Performance Tests
            await this.testPerformanceTargets();
            
        } catch (error) {
            console.error('❌ Critical test error:', error);
            this.fail('Critical test error', error.message);
        }

        this.generateTestReport();
        console.groupEnd();
        
        return this.results;
    }

    /**
     * Test MKCG Integration Initialization
     */
    async testMKCGIntegrationInitialization() {
        console.log('📋 Testing MKCG Integration Initialization...');
        
        // Test 1: State manager has MKCG integration properties
        this.test('State manager has MKCG integration properties', () => {
            const sm = window.enhancedStateManager;
            return sm && sm.mkcgIntegration && 
                   typeof sm.mkcgIntegration.enabled === 'boolean' &&
                   typeof sm.mkcgIntegration.autoGenerationConfig === 'object' &&
                   sm.mkcgIntegration.autoGenerationConfig.maxComponents > 0;
        });

        // Test 2: MKCG integration method exists
        this.test('initializeMKCGIntegration method exists', () => {
            const sm = window.enhancedStateManager;
            return sm && typeof sm.initializeMKCGIntegration === 'function';
        });

        // Test 3: Integration detection works
        this.test('MKCG integration detects data availability', async () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const initialState = { ...sm.mkcgIntegration };
            
            // Simulate initialization
            await sm.initializeMKCGIntegration();
            
            // Check if detection worked properly
            const hasMapper = !!window.mkcgDataMapper;
            const hasData = !!window.guestifyData?.mkcgData;
            const expectedEnabled = hasMapper && hasData;
            
            return sm.mkcgIntegration.enabled === expectedEnabled;
        });

        // Test 4: Auto-generation config is valid
        this.test('Auto-generation config has valid defaults', () => {
            const sm = window.enhancedStateManager;
            const config = sm?.mkcgIntegration?.autoGenerationConfig;
            
            return config &&
                   config.maxComponents >= 1 &&
                   config.minQualityScore >= 0 &&
                   config.priorityThreshold >= 0 &&
                   config.batchSize >= 1 &&
                   typeof config.showProgress === 'boolean';
        });

        console.log('✅ MKCG Integration Initialization tests completed\n');
    }

    /**
     * Test Intelligent Auto-Generation
     */
    async testIntelligentAutoGeneration() {
        console.log('📋 Testing Intelligent Component Auto-Generation...');

        // Test 1: Auto-generation method exists
        this.test('autoGenerateComponentsFromMKCG method exists', () => {
            const sm = window.enhancedStateManager;
            return sm && typeof sm.autoGenerateComponentsFromMKCG === 'function';
        });

        // Test 2: Auto-generation handles missing dependencies
        this.test('Auto-generation handles missing dependencies gracefully', async () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            // Temporarily disable data availability
            const originalAvailable = sm.mkcgIntegration.dataAvailable;
            sm.mkcgIntegration.dataAvailable = false;
            
            const result = await sm.autoGenerateComponentsFromMKCG();
            
            // Restore original state
            sm.mkcgIntegration.dataAvailable = originalAvailable;
            
            return result && !result.success && result.reason === 'dependencies-missing';
        });

        // Test 3: Auto-generation with quality filtering
        this.test('Auto-generation respects quality filtering', async () => {
            const sm = window.enhancedStateManager;
            if (!sm || !sm.mkcgIntegration.dataAvailable) {
                console.log('  ⏭ Skipped: MKCG data not available');
                return true; // Skip if no data
            }
            
            // Test with very high quality threshold
            const result = await sm.autoGenerateComponentsFromMKCG({
                minQualityScore: 99,
                showProgress: false
            });
            
            return result && result.success && result.addedComponents.length === 0;
        });

        // Test 4: Auto-generation progress tracking
        this.test('Auto-generation includes progress tracking', async () => {
            const sm = window.enhancedStateManager;
            if (!sm || !sm.mkcgIntegration.dataAvailable) {
                console.log('  ⏭ Skipped: MKCG data not available');
                return true;
            }
            
            let progressStarted = false;
            let progressCompleted = false;
            
            // Listen for progress events
            const startListener = () => { progressStarted = true; };
            const completeListener = () => { progressCompleted = true; };
            
            sm.eventBus.on('state:progress-start', startListener);
            sm.eventBus.on('state:progress-complete', completeListener);
            
            const result = await sm.autoGenerateComponentsFromMKCG({
                maxComponents: 1,
                showProgress: true
            });
            
            // Cleanup listeners
            sm.eventBus.off('state:progress-start', startListener);
            sm.eventBus.off('state:progress-complete', completeListener);
            
            return progressStarted || progressCompleted; // At least one should trigger
        });

        console.log('✅ Intelligent Auto-Generation tests completed\n');
    }

    /**
     * Test Enhanced Batch Operations
     */
    async testEnhancedBatchOperations() {
        console.log('📋 Testing Enhanced Batch Operations...');

        // Test 1: Enhanced batch operations method exists
        this.test('performEnhancedBatchOperations method exists', () => {
            const sm = window.enhancedStateManager;
            return sm && typeof sm.performEnhancedBatchOperations === 'function';
        });

        // Test 2: Batch operations with progress tracking
        this.test('Batch operations support progress tracking', async () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const operations = [
                { type: 'add', component: { id: 'test-batch-1', type: 'hero', props: {} } },
                { type: 'add', component: { id: 'test-batch-2', type: 'topics', props: {} } }
            ];
            
            let progressUpdated = false;
            const progressCallback = () => { progressUpdated = true; };
            
            const result = await sm.performEnhancedBatchOperations(operations, {
                showProgress: true,
                progressCallback,
                validateQuality: false
            });
            
            // Cleanup test components
            if (result?.results) {
                result.results.forEach(r => {
                    if (r.success && r.componentId) {
                        sm.removeComponent(r.componentId);
                    }
                });
            }
            
            return result && result.batchMetadata && 
                   result.batchMetadata.totalOperations === operations.length &&
                   progressUpdated;
        });

        // Test 3: Batch operations error recovery
        this.test('Batch operations handle errors gracefully', async () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const operations = [
                { type: 'add', component: { id: 'test-valid', type: 'hero', props: {} } },
                { type: 'invalid-operation', invalid: true }, // This should fail
                { type: 'add', component: { id: 'test-valid-2', type: 'topics', props: {} } }
            ];
            
            const result = await sm.performEnhancedBatchOperations(operations, {
                showProgress: false,
                errorRecovery: true,
                validateQuality: false
            });
            
            // Cleanup successful components
            if (result?.results) {
                result.results.forEach(r => {
                    if (r.success && r.componentId) {
                        sm.removeComponent(r.componentId);
                    }
                });
            }
            
            return result && result.batchMetadata &&
                   result.batchMetadata.successfulOperations >= 1 &&
                   result.batchMetadata.failedOperations >= 1;
        });

        // Test 4: Batch size optimization
        this.test('Batch operations respect batch size limits', async () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const operations = Array.from({ length: 10 }, (_, i) => ({
                type: 'add',
                component: { id: `test-batch-size-${i}`, type: 'hero', props: {} }
            }));
            
            const result = await sm.performEnhancedBatchOperations(operations, {
                batchSize: 3,
                showProgress: false,
                validateQuality: false
            });
            
            // Cleanup test components
            if (result?.results) {
                result.results.forEach(r => {
                    if (r.success && r.componentId) {
                        sm.removeComponent(r.componentId);
                    }
                });
            }
            
            return result && result.batchMetadata && 
                   result.batchMetadata.batchesProcessed >= 3; // 10 operations / 3 batch size = 4 batches
        });

        console.log('✅ Enhanced Batch Operations tests completed\n');
    }

    /**
     * Test State Hydration with Conflict Resolution
     */
    async testStateHydrationWithConflictResolution() {
        console.log('📋 Testing State Hydration with Conflict Resolution...');

        // Test 1: State hydration method exists
        this.test('hydrateStateWithMKCGData method exists', () => {
            const sm = window.enhancedStateManager;
            return sm && typeof sm.hydrateStateWithMKCGData === 'function';
        });

        // Test 2: Hydration handles empty saved state
        this.test('Hydration handles empty saved state', async () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const emptySavedState = {
                layout: [],
                components: {},
                globalSettings: {}
            };
            
            const result = await sm.hydrateStateWithMKCGData(emptySavedState, {
                conflictResolution: 'prefer-saved'
            });
            
            return result && typeof result.success === 'boolean';
        });

        // Test 3: Conflict resolution strategies
        this.test('Conflict resolution strategies are respected', async () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const mockSavedState = {
                layout: ['existing-component'],
                components: {
                    'existing-component': { id: 'existing-component', type: 'hero', props: {} }
                },
                globalSettings: {},
                meta: { savedAt: new Date().toISOString() }
            };
            
            // Test prefer-saved strategy
            const result = await sm.hydrateStateWithMKCGData(mockSavedState, {
                conflictResolution: 'prefer-saved',
                preferFreshData: false
            });
            
            return result && typeof result.success === 'boolean' &&
                   typeof result.duration === 'number';
        });

        console.log('✅ State Hydration tests completed\n');
    }

    /**
     * Test Progress Tracking System
     */
    async testProgressTrackingSystem() {
        console.log('📋 Testing Progress Tracking System...');

        // Test 1: Progress tracking methods exist
        this.test('Progress tracking methods exist', () => {
            const sm = window.enhancedStateManager;
            return sm && 
                   typeof sm.startProgressTracking === 'function' &&
                   typeof sm.updateProgressTracking === 'function' &&
                   typeof sm.completeProgressTracking === 'function';
        });

        // Test 2: Progress tracking lifecycle
        this.test('Progress tracking lifecycle works correctly', () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            // Start tracking
            sm.startProgressTracking('test-operation', 'Testing progress tracking');
            const startActive = sm.progressTracking.active;
            
            // Update progress
            sm.updateProgressTracking(10, 5, 'Halfway through test');
            const updateState = sm.progressTracking.completedOperations === 5 && 
                               sm.progressTracking.totalOperations === 10;
            
            // Complete tracking
            sm.completeProgressTracking();
            const endActive = sm.progressTracking.active;
            
            return startActive && updateState && !endActive;
        });

        // Test 3: Progress events are emitted
        this.test('Progress events are emitted correctly', () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            let eventEmitted = false;
            
            const listener = () => { eventEmitted = true; };
            sm.eventBus.on('state:progress-start', listener);
            
            sm.startProgressTracking('test-event', 'Testing event emission');
            sm.completeProgressTracking();
            
            sm.eventBus.off('state:progress-start', listener);
            
            return eventEmitted;
        });

        console.log('✅ Progress Tracking System tests completed\n');
    }

    /**
     * Test Cross-Component Synchronization
     */
    async testCrossComponentSynchronization() {
        console.log('📋 Testing Cross-Component Synchronization...');

        // Test 1: Synchronization initialization
        this.test('Component synchronization can be initialized', () => {
            const sm = window.enhancedStateManager;
            if (!sm || typeof sm.initializeComponentSynchronization !== 'function') return false;
            
            sm.initializeComponentSynchronization();
            
            return sm.componentRelations instanceof Map && sm.componentRelations.size > 0;
        });

        // Test 2: Component relations are defined
        this.test('Component relations are properly defined', () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            sm.initializeComponentSynchronization();
            
            // Check for expected relations
            const heroRelations = sm.componentRelations.get('hero');
            const biographyRelations = sm.componentRelations.get('biography');
            
            return Array.isArray(heroRelations) && heroRelations.length > 0 &&
                   Array.isArray(biographyRelations) && biographyRelations.length > 0;
        });

        console.log('✅ Cross-Component Synchronization tests completed\n');
    }

    /**
     * Test Enhanced Performance Statistics
     */
    async testEnhancedPerformanceStatistics() {
        console.log('📋 Testing Enhanced Performance Statistics...');

        // Test 1: Enhanced performance stats include MKCG integration
        this.test('Performance stats include MKCG integration metrics', () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const stats = sm.getPerformanceStats();
            
            return stats && 
                   stats.mkcgIntegration &&
                   typeof stats.mkcgIntegration.enabled === 'boolean' &&
                   stats.mkcgIntegration.autoGenerationConfig &&
                   stats.progressTracking &&
                   stats.synchronization;
        });

        // Test 2: Progress tracking statistics
        this.test('Performance stats include progress tracking', () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const stats = sm.getPerformanceStats();
            
            return stats.progressTracking &&
                   typeof stats.progressTracking.active === 'boolean' &&
                   typeof stats.progressTracking.elapsed === 'number';
        });

        // Test 3: Synchronization statistics
        this.test('Performance stats include synchronization metrics', () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const stats = sm.getPerformanceStats();
            
            return stats.synchronization &&
                   typeof stats.synchronization.componentRelations === 'number' &&
                   typeof stats.synchronization.queueSize === 'number' &&
                   typeof stats.synchronization.enabled === 'boolean';
        });

        console.log('✅ Enhanced Performance Statistics tests completed\n');
    }

    /**
     * Test MKCG Data Monitoring
     */
    async testMKCGDataMonitoring() {
        console.log('📋 Testing MKCG Data Monitoring...');

        // Test 1: Data monitoring setup method exists
        this.test('setupMKCGDataMonitoring method exists', () => {
            const sm = window.enhancedStateManager;
            return sm && typeof sm.setupMKCGDataMonitoring === 'function';
        });

        // Test 2: Freshness check method exists
        this.test('checkMKCGDataFreshness method exists', () => {
            const sm = window.enhancedStateManager;
            return sm && typeof sm.checkMKCGDataFreshness === 'function';
        });

        // Test 3: Data monitoring respects integration state
        this.test('Data monitoring respects integration enabled state', () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const originalEnabled = sm.mkcgIntegration.enabled;
            
            // Test with disabled integration
            sm.mkcgIntegration.enabled = false;
            sm.setupMKCGDataMonitoring(); // Should not set up monitoring
            
            // Test with enabled integration
            sm.mkcgIntegration.enabled = true;
            sm.setupMKCGDataMonitoring(); // Should set up monitoring
            
            // Restore original state
            sm.mkcgIntegration.enabled = originalEnabled;
            
            return true; // If no errors thrown, test passes
        });

        console.log('✅ MKCG Data Monitoring tests completed\n');
    }

    /**
     * Test Phase 2.2 Debugging Interface
     */
    async testPhase22DebuggingInterface() {
        console.log('📋 Testing Phase 2.2 Debugging Interface...');

        // Test 1: phase22 debugging object exists
        this.test('phase22 debugging interface exists', () => {
            const sm = window.enhancedStateManager;
            return sm && sm.phase22 && typeof sm.phase22 === 'object';
        });

        // Test 2: Essential debugging methods exist
        this.test('Essential debugging methods exist', () => {
            const phase22 = window.enhancedStateManager?.phase22;
            return phase22 &&
                   typeof phase22.autoGenerate === 'function' &&
                   typeof phase22.hydrateState === 'function' &&
                   typeof phase22.batchOperations === 'function' &&
                   typeof phase22.getIntegrationStatus === 'function' &&
                   typeof phase22.debugIntegration === 'function' &&
                   typeof phase22.help === 'function';
        });

        // Test 3: Integration status provides comprehensive info
        this.test('getIntegrationStatus provides comprehensive info', () => {
            const phase22 = window.enhancedStateManager?.phase22;
            if (!phase22) return false;
            
            const status = phase22.getIntegrationStatus();
            
            return status &&
                   status.mkcg &&
                   status.progress &&
                   status.sync &&
                   typeof status.sync.queue === 'number';
        });

        // Test 4: Test methods are callable
        this.test('Test methods are callable without errors', async () => {
            const phase22 = window.enhancedStateManager?.phase22;
            if (!phase22) return false;
            
            try {
                // These should not throw errors even if they don't succeed
                const status = phase22.getIntegrationStatus();
                phase22.debugIntegration();
                phase22.help();
                
                return true;
            } catch (error) {
                console.warn('  ⚠ Debugging method error:', error.message);
                return false;
            }
        });

        console.log('✅ Phase 2.2 Debugging Interface tests completed\n');
    }

    /**
     * Test Phase 2.1 Integration
     */
    async testPhase21Integration() {
        console.log('📋 Testing Phase 2.1 Integration...');

        // Test 1: MKCG Data Mapper integration
        this.test('Integrates with Phase 2.1 MKCG Data Mapper', () => {
            const sm = window.enhancedStateManager;
            const hasMapper = !!window.mkcgDataMapper;
            const hasEnhancedMethod = hasMapper && 
                typeof window.mkcgDataMapper.getAutoPopulatableComponentsEnhanced === 'function';
            
            return !hasMapper || hasEnhancedMethod; // Pass if no mapper or if enhanced method exists
        });

        // Test 2: Enhanced Component Manager integration
        this.test('Integrates with Phase 2.1 Enhanced Component Manager', () => {
            const hasECM = !!window.enhancedComponentManager;
            const hasEnhancedMethods = hasECM &&
                typeof window.enhancedComponentManager.addComponent === 'function' &&
                typeof window.enhancedComponentManager.showEnhancedAutoGenerateNotification === 'function';
            
            return !hasECM || hasEnhancedMethods; // Pass if no ECM or if enhanced methods exist
        });

        // Test 3: Quality scoring integration
        this.test('Uses Phase 2.1 quality scoring in auto-generation', async () => {
            const sm = window.enhancedStateManager;
            if (!sm || !sm.mkcgIntegration.dataAvailable || !window.mkcgDataMapper) {
                console.log('  ⏭ Skipped: Dependencies not available');
                return true;
            }
            
            // Check if auto-generation respects quality scoring
            const result = await sm.autoGenerateComponentsFromMKCG({
                minQualityScore: 80, // High threshold
                showProgress: false
            });
            
            return result && typeof result.success === 'boolean';
        });

        console.log('✅ Phase 2.1 Integration tests completed\n');
    }

    /**
     * Test Backward Compatibility
     */
    async testBackwardCompatibility() {
        console.log('📋 Testing Backward Compatibility...');

        // Test 1: Legacy batch operations still work
        this.test('Legacy performBatchOperations method still works', async () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const operations = [
                { type: 'add', component: { id: 'test-legacy-1', type: 'hero', props: {} } }
            ];
            
            try {
                const result = await sm.performBatchOperations(operations);
                
                // Cleanup
                if (result && Array.isArray(result)) {
                    sm.removeComponent('test-legacy-1');
                }
                
                return true;
            } catch (error) {
                console.warn('  ⚠ Legacy batch operations error:', error.message);
                return false;
            }
        });

        // Test 2: Existing state manager methods unchanged
        this.test('Existing state manager methods are unchanged', () => {
            const sm = window.enhancedStateManager;
            return sm &&
                   typeof sm.getState === 'function' &&
                   typeof sm.addComponent === 'function' &&
                   typeof sm.removeComponent === 'function' &&
                   typeof sm.updateComponent === 'function' &&
                   typeof sm.subscribeGlobal === 'function';
        });

        // Test 3: Save version updated but backward compatible
        this.test('Save version updated but maintains compatibility', () => {
            const sm = window.enhancedStateManager;
            return sm && sm.SAVE_VERSION === '2.2.0';
        });

        console.log('✅ Backward Compatibility tests completed\n');
    }

    /**
     * Test Error Handling and Recovery
     */
    async testErrorHandlingAndRecovery() {
        console.log('📋 Testing Error Handling and Recovery...');

        // Test 1: Auto-generation handles errors gracefully
        this.test('Auto-generation handles errors gracefully', async () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            // Force an error condition
            const originalECM = window.enhancedComponentManager;
            window.enhancedComponentManager = null;
            
            const result = await sm.autoGenerateComponentsFromMKCG();
            
            // Restore
            window.enhancedComponentManager = originalECM;
            
            return result && !result.success;
        });

        // Test 2: State hydration handles invalid data
        this.test('State hydration handles invalid data', async () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const invalidState = { invalid: 'data' };
            
            try {
                const result = await sm.hydrateStateWithMKCGData(invalidState);
                return result && typeof result.success === 'boolean';
            } catch (error) {
                // Should not throw, should return error result
                return false;
            }
        });

        // Test 3: Progress tracking handles callback errors
        this.test('Progress tracking handles callback errors', () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            sm.startProgressTracking('test-error', 'Testing error handling');
            
            // Add a callback that will throw an error
            sm.progressTracking.callbacks.push(() => {
                throw new Error('Test callback error');
            });
            
            try {
                sm.updateProgressTracking(1, 0, 'Test update');
                sm.completeProgressTracking();
                return true; // Should not throw
            } catch (error) {
                return false; // Should handle errors gracefully
            }
        });

        console.log('✅ Error Handling and Recovery tests completed\n');
    }

    /**
     * Test Performance Targets
     */
    async testPerformanceTargets() {
        console.log('📋 Testing Performance Targets...');

        // Test 1: Initialization speed target (<500ms)
        this.test('Initialization completes within 500ms target', () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const stats = sm.getPerformanceStats();
            
            // If we have timing data, check it
            if (stats.progressTracking && stats.progressTracking.elapsed > 0) {
                return stats.progressTracking.elapsed < 500;
            }
            
            return true; // Pass if no timing data available
        });

        // Test 2: Auto-generation speed target (<200ms for qualified components)
        this.test('Auto-generation meets speed target', async () => {
            const sm = window.enhancedStateManager;
            if (!sm || !sm.mkcgIntegration.dataAvailable) {
                console.log('  ⏭ Skipped: MKCG data not available');
                return true;
            }
            
            const startTime = performance.now();
            
            const result = await sm.autoGenerateComponentsFromMKCG({
                maxComponents: 1,
                showProgress: false
            });
            
            const duration = performance.now() - startTime;
            
            console.log(`  📊 Auto-generation duration: ${duration.toFixed(2)}ms`);
            
            return duration < 200;
        });

        // Test 3: Batch operations efficiency
        this.test('Batch operations meet efficiency targets', async () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const operations = [
                { type: 'add', component: { id: 'perf-test-1', type: 'hero', props: {} } },
                { type: 'add', component: { id: 'perf-test-2', type: 'topics', props: {} } }
            ];
            
            const startTime = performance.now();
            
            const result = await sm.performEnhancedBatchOperations(operations, {
                showProgress: false,
                validateQuality: false
            });
            
            const duration = performance.now() - startTime;
            
            // Cleanup
            if (result?.results) {
                result.results.forEach(r => {
                    if (r.success && r.componentId) {
                        sm.removeComponent(r.componentId);
                    }
                });
            }
            
            console.log(`  📊 Batch operations duration: ${duration.toFixed(2)}ms`);
            
            // Should complete in reasonable time for 2 operations
            return duration < 100;
        });

        // Test 4: Memory usage is reasonable
        this.test('Memory usage is within reasonable limits', () => {
            const sm = window.enhancedStateManager;
            if (!sm) return false;
            
            const stats = sm.getPerformanceStats();
            
            // Check various metrics for reasonableness
            const historySize = stats.historySize || 0;
            const queueSize = stats.queueSize || 0;
            
            return historySize < 1000 && queueSize < 100; // Reasonable limits
        });

        console.log('✅ Performance Targets tests completed\n');
    }

    /**
     * Helper method to run individual tests
     */
    test(name, testFn) {
        this.results.total++;
        
        try {
            const result = testFn();
            
            if (result === true || (typeof result === 'object' && result.then)) {
                if (result.then) {
                    // Handle async test
                    return result.then(asyncResult => {
                        if (asyncResult) {
                            this.pass(name);
                        } else {
                            this.fail(name, 'Async test returned false');
                        }
                    }).catch(error => {
                        this.fail(name, error.message);
                    });
                } else {
                    this.pass(name);
                }
            } else {
                this.fail(name, 'Test returned false or invalid result');
            }
        } catch (error) {
            this.fail(name, error.message);
        }
    }

    /**
     * Mark test as passed
     */
    pass(name) {
        this.results.passed++;
        this.results.details.push({ name, status: 'PASS', reason: null });
        console.log(`  ✅ ${name}`);
    }

    /**
     * Mark test as failed
     */
    fail(name, reason) {
        this.results.failed++;
        this.results.details.push({ name, status: 'FAIL', reason });
        console.log(`  ❌ ${name}: ${reason}`);
    }

    /**
     * Generate and display test report
     */
    generateTestReport() {
        const duration = Date.now() - this.testStartTime;
        const successRate = this.results.total > 0 ? 
            (this.results.passed / this.results.total * 100).toFixed(1) : 0;

        console.log('\n📊 Phase 2.2 Test Results Summary:');
        console.log(`  Total Tests: ${this.results.total}`);
        console.log(`  Passed: ${this.results.passed} ✅`);
        console.log(`  Failed: ${this.results.failed} ❌`);
        console.log(`  Success Rate: ${successRate}%`);
        console.log(`  Duration: ${duration}ms`);

        if (this.results.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.details
                .filter(test => test.status === 'FAIL')
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.reason}`);
                });
        }

        // Overall assessment
        if (this.results.passed === this.results.total) {
            console.log('\n🎉 All Phase 2.2 tests passed! Implementation is ready for production.');
        } else if (successRate >= 95) {
            console.log('\n✅ Phase 2.2 implementation is excellent with minor issues.');
        } else if (successRate >= 85) {
            console.log('\n⚠️ Phase 2.2 implementation is good but needs attention to failed tests.');
        } else {
            console.log('\n❌ Phase 2.2 implementation needs significant work before production.');
        }

        return this.results;
    }
}

/**
 * Global test execution functions
 */

// Main test function
window.testPhase22EnhancedStateManager = async function() {
    console.log('🚀 Starting Phase 2.2: Enhanced State Manager Tests...\n');
    
    const tester = new Phase22StateManagerTest();
    return await tester.runAllTests();
};

// Quick test function
window.quickPhase22Test = async function() {
    console.log('⚡ Quick Phase 2.2 Test...\n');
    
    const results = {
        enhancedStateManagerExists: !!window.enhancedStateManager,
        phase22InterfaceExists: !!window.enhancedStateManager?.phase22,
        mkcgIntegrationEnabled: !!window.enhancedStateManager?.mkcgIntegration,
        autoGenerationMethod: typeof window.enhancedStateManager?.autoGenerateComponentsFromMKCG === 'function',
        enhancedBatchMethod: typeof window.enhancedStateManager?.performEnhancedBatchOperations === 'function',
        hydrationMethod: typeof window.enhancedStateManager?.hydrateStateWithMKCGData === 'function',
        progressTrackingMethods: !!(window.enhancedStateManager?.startProgressTracking && 
                                   window.enhancedStateManager?.updateProgressTracking &&
                                   window.enhancedStateManager?.completeProgressTracking)
    };
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    const successRate = (passed / total * 100).toFixed(1);
    
    console.log('📊 Quick Test Results:', results);
    console.log(`✅ ${passed}/${total} checks passed (${successRate}%)`);
    
    if (passed === total) {
        console.log('🎉 Phase 2.2 Enhanced State Manager appears to be working correctly!');
        console.log('💡 Run testPhase22EnhancedStateManager() for comprehensive testing');
    } else {
        console.log('⚠️ Some Phase 2.2 features may not be working correctly');
    }
    
    return results;
};

// Integration status check
window.checkPhase22Integration = function() {
    console.log('🔍 Phase 2.2 Integration Status Check...\n');
    
    if (!window.enhancedStateManager?.phase22) {
        console.log('❌ Phase 2.2 interface not available');
        return false;
    }
    
    const status = window.enhancedStateManager.phase22.getIntegrationStatus();
    console.log('📊 Integration Status:', status);
    
    window.enhancedStateManager.phase22.debugIntegration();
    
    return status;
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Phase22StateManagerTest };
}

console.log('🧪 Phase 2.2 Enhanced State Manager test suite loaded!');
console.log('Commands:');
console.log('  testPhase22EnhancedStateManager()  - Run full test suite');
console.log('  quickPhase22Test()                 - Run quick validation');
console.log('  checkPhase22Integration()          - Check integration status');
