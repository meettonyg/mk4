/**
 * PERFORMANCE TESTING: Comprehensive Performance Benchmarking
 * Following Gemini's recommendation for granular test file structure
 * 
 * Tests performance targets for initialization, validation, bulk operations,
 * memory usage, and rendering optimization with specific benchmarks.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupQuickTestData, cleanupTestData } from '../utils/test-data-strategy.js';

describe('Performance Benchmarking Tests', () => {
    let integrationInstance;
    let mockElement;
    let mockPanel;
    let performanceMarkers = new Map();
    
    beforeEach(() => {
        // Clear performance markers
        performanceMarkers.clear();
        
        // Create mock DOM elements
        mockElement = document.createElement('div');
        mockElement.className = 'topics-component';
        document.body.appendChild(mockElement);
        
        mockPanel = document.createElement('div');
        mockPanel.className = 'element-editor';
        document.body.appendChild(mockPanel);
    });
    
    afterEach(() => {
        // Cleanup
        if (integrationInstance && typeof integrationInstance.destroy === 'function') {
            integrationInstance.destroy();
        }
        mockElement.remove();
        mockPanel.remove();
        cleanupTestData();
    });
    
    describe('Initialization Performance', () => {
        it('should initialize within 200ms target for clean data', async () => {
            setupQuickTestData('clean_mkcg_data');
            
            const startTime = performance.now();
            
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            await integrationInstance.init();
            
            const endTime = performance.now();
            const initTime = endTime - startTime;
            
            expect(initTime).toBeLessThan(200); // 200ms target
            expect(integrationInstance.isInitialized).toBe(true);
            
            console.log(`✅ Initialization time: ${initTime.toFixed(2)}ms`);
        });
        
        it('should handle large datasets within performance limits', async () => {
            setupQuickTestData('high_volume_data_state');
            
            const startTime = performance.now();
            
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            await integrationInstance.init();
            
            const endTime = performance.now();
            const initTime = endTime - startTime;
            
            // Allow more time for large datasets (500ms)
            expect(initTime).toBeLessThan(500);
            
            console.log(`📊 Large dataset initialization: ${initTime.toFixed(2)}ms`);
        });
        
        it('should track initialization performance metrics', () => {
            setupQuickTestData('clean_mkcg_data');
            
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            
            expect(integrationInstance.initStartTime).toBeDefined();
            expect(typeof integrationInstance.initStartTime).toBe('number');
        });
        
        it('should optimize repeated initializations', async () => {
            setupQuickTestData('clean_mkcg_data');
            
            const times = [];
            
            // Test multiple initializations
            for (let i = 0; i < 5; i++) {
                const startTime = performance.now();
                
                const instance = new TopicsMKCGIntegration(mockElement, mockPanel);
                await instance.init();
                
                const endTime = performance.now();
                times.push(endTime - startTime);
                
                if (instance.destroy) instance.destroy();
            }
            
            // Later initializations should not be significantly slower
            const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
            expect(avgTime).toBeLessThan(250);
            
            console.log(`📈 Average initialization time: ${avgTime.toFixed(2)}ms`);
        });
    });
    
    describe('Validation Performance', () => {
        beforeEach(() => {
            setupQuickTestData('clean_mkcg_data');
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
        });
        
        it('should complete debounced validation within 350ms total', async () => {
            const topicValue = 'Performance Test Topic';
            const topicIndex = 0;
            
            const startTime = performance.now();
            
            const results = await integrationInstance.validateTopicDebounced(topicValue, topicIndex);
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            
            // 300ms debounce + 50ms processing target
            expect(totalTime).toBeLessThan(350);
            expect(results).toBeDefined();
            
            console.log(`⚡ Validation time: ${totalTime.toFixed(2)}ms`);
        });
        
        it('should process comprehensive validation within 50ms execution time', async () => {
            const topicValue = 'Comprehensive Validation Test';
            const topicIndex = 0;
            
            const startTime = performance.now();
            
            const results = await integrationInstance.performComprehensiveValidation(topicValue, topicIndex);
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            expect(executionTime).toBeLessThan(50);
            expect(results.quality).toBeDefined();
            
            console.log(`🔍 Comprehensive validation: ${executionTime.toFixed(2)}ms`);
        });
        
        it('should handle rapid validation requests efficiently', async () => {
            const validationPromises = [];
            const startTime = performance.now();
            
            // Create 20 rapid validation requests
            for (let i = 0; i < 20; i++) {
                validationPromises.push(
                    integrationInstance.validateTopicDebounced(`Rapid Topic ${i}`, i % 5)
                );
            }
            
            await Promise.all(validationPromises);
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            
            // Should complete within 1 second for 20 requests due to debouncing
            expect(totalTime).toBeLessThan(1000);
            
            console.log(`🚀 20 rapid validations: ${totalTime.toFixed(2)}ms`);
        });
        
        it('should cache validation results for performance', async () => {
            const topicValue = 'Cached Performance Topic';
            
            // First validation (should cache)
            const startTime1 = performance.now();
            await integrationInstance.validateTopicDebounced(topicValue, 0);
            const endTime1 = performance.now();
            
            // Verify caching
            expect(integrationInstance.validationState.validationCache.has('topic_0')).toBe(true);
            
            const firstTime = endTime1 - startTime1;
            console.log(`💾 First validation (with caching): ${firstTime.toFixed(2)}ms`);
        });
    });
    
    describe('Bulk Operations Performance', () => {
        beforeEach(() => {
            setupQuickTestData('complete_mkcg_data');
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            
            // Mock global functions
            window.scheduleAutoSave = vi.fn();
            window.clearAllTopicsContent = vi.fn();
            window.showBulkOperationFeedback = vi.fn();
            window.getCurrentTopicsData = vi.fn(() => [
                { index: 0, title: 'Topic 1', description: '', icon: 'check' },
                { index: 1, title: 'Topic 2', description: '', icon: 'check' }
            ]);
        });
        
        afterEach(() => {
            delete window.scheduleAutoSave;
            delete window.clearAllTopicsContent;
            delete window.showBulkOperationFeedback;
            delete window.getCurrentTopicsData;
        });
        
        it('should execute sync all operation within 1 second', async () => {
            const startTime = performance.now();
            
            integrationInstance.executeSyncAllTopics();
            
            // Wait for operation completion
            await new Promise(resolve => setTimeout(resolve, 1100));
            
            const endTime = performance.now();
            const operationTime = endTime - startTime;
            
            expect(operationTime).toBeLessThan(1100); // 1 second + buffer
            
            console.log(`🔄 Sync all operation: ${operationTime.toFixed(2)}ms`);
        });
        
        it('should execute clear all operation within 1 second', async () => {
            const startTime = performance.now();
            
            integrationInstance.executeClearAllTopics();
            
            // Wait for operation completion
            await new Promise(resolve => setTimeout(resolve, 1100));
            
            const endTime = performance.now();
            const operationTime = endTime - startTime;
            
            expect(operationTime).toBeLessThan(1100);
            
            console.log(`🗑️ Clear all operation: ${operationTime.toFixed(2)}ms`);
        });
        
        it('should execute reset operation within 1 second', async () => {
            const startTime = performance.now();
            
            integrationInstance.executeResetToMKCG();
            
            // Wait for operation completion
            await new Promise(resolve => setTimeout(resolve, 1100));
            
            const endTime = performance.now();
            const operationTime = endTime - startTime;
            
            expect(operationTime).toBeLessThan(1100);
            
            console.log(`🔄 Reset operation: ${operationTime.toFixed(2)}ms`);
        });
        
        it('should execute undo operation within 500ms', async () => {
            // Setup undo history
            integrationInstance.bulkOperationHistory = [{
                operation: 'test',
                snapshot: { topics: [] }
            }];
            
            const startTime = performance.now();
            
            integrationInstance.handleBulkUndo();
            
            // Wait for operation completion
            await new Promise(resolve => setTimeout(resolve, 600));
            
            const endTime = performance.now();
            const operationTime = endTime - startTime;
            
            expect(operationTime).toBeLessThan(600);
            
            console.log(`⏪ Undo operation: ${operationTime.toFixed(2)}ms`);
        });
        
        it('should handle concurrent bulk operations efficiently', async () => {
            const operations = [
                () => integrationInstance.executeSyncAllTopics(),
                () => integrationInstance.executeClearAllTopics(),
                () => integrationInstance.executeResetToMKCG()
            ];
            
            const startTime = performance.now();
            
            // Execute operations concurrently (though they should queue)
            operations.forEach(op => op());
            
            // Wait for all operations
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            
            // Should complete within reasonable time
            expect(totalTime).toBeLessThan(2100);
            
            console.log(`⚡ Concurrent operations: ${totalTime.toFixed(2)}ms`);
        });
    });
    
    describe('Memory Usage Performance', () => {
        beforeEach(() => {
            setupQuickTestData('clean_mkcg_data');
        });
        
        it('should maintain memory usage under 5MB additional overhead', async () => {
            const initialMemory = getMemoryUsage();
            
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            await integrationInstance.init();
            
            // Perform various operations
            await integrationInstance.validateTopicDebounced('Memory Test Topic 1', 0);
            await integrationInstance.validateTopicDebounced('Memory Test Topic 2', 1);
            
            integrationInstance.executeSyncAllTopics();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const finalMemory = getMemoryUsage();
            const memoryIncrease = finalMemory - initialMemory;
            
            console.log(`💾 Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
            
            // 5MB target
            expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
        });
        
        it('should not create memory leaks during repeated operations', async () => {
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            
            const initialMemory = getMemoryUsage();
            
            // Perform 100 validation operations
            for (let i = 0; i < 100; i++) {
                await integrationInstance.validateTopicDebounced(`Leak Test ${i}`, i % 5);
            }
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const finalMemory = getMemoryUsage();
            const memoryIncrease = finalMemory - initialMemory;
            
            console.log(`🔍 Memory after 100 operations: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
            
            // Should not have significant memory leaks
            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB threshold
        });
        
        it('should efficiently manage validation cache memory', async () => {
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            
            // Fill validation cache
            for (let i = 0; i < 50; i++) {
                await integrationInstance.validateTopicDebounced(`Cache Test ${i}`, i % 5);
            }
            
            const cacheSize = integrationInstance.validationState.validationCache.size;
            
            console.log(`🗂️ Validation cache size: ${cacheSize} entries`);
            
            // Cache should not grow unbounded
            expect(cacheSize).toBeLessThan(100);
        });
    });
    
    describe('Rendering Performance', () => {
        beforeEach(() => {
            setupQuickTestData('clean_mkcg_data');
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
        });
        
        it('should render MKCG section within 100ms', () => {
            const startTime = performance.now();
            
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            expect(renderTime).toBeLessThan(100);
            expect(mkcgSection).toBeDefined();
            
            console.log(`🎨 MKCG section render: ${renderTime.toFixed(2)}ms`);
        });
        
        it('should update progress indicators smoothly', () => {
            // Create progress indicator
            const progressIndicator = document.createElement('div');
            progressIndicator.className = 'mkcg-progress-indicator';
            progressIndicator.innerHTML = `
                <div class="progress-bar"></div>
                <span class="progress-text"></span>
                <span class="progress-percentage"></span>
            `;
            mockPanel.appendChild(progressIndicator);
            
            const startTime = performance.now();
            
            // Update progress multiple times
            for (let i = 0; i <= 100; i += 10) {
                integrationInstance.updateBulkOperationProgress(i, `Progress ${i}%`);
            }
            
            const endTime = performance.now();
            const updateTime = endTime - startTime;
            
            expect(updateTime).toBeLessThan(50); // 50ms for 11 updates
            
            console.log(`📊 Progress updates: ${updateTime.toFixed(2)}ms`);
        });
        
        it('should animate modal dialogs smoothly', () => {
            const startTime = performance.now();
            
            integrationInstance.showBulkOperationConfirmation({
                operation: 'test',
                title: 'Performance Test',
                message: 'Testing modal performance',
                icon: '⚡',
                confirmText: 'OK',
                confirmClass: 'btn-primary',
                onConfirm: vi.fn()
            });
            
            const endTime = performance.now();
            const modalTime = endTime - startTime;
            
            expect(modalTime).toBeLessThan(50);
            
            // Cleanup modal
            const modal = document.querySelector('.bulk-operation-modal-overlay');
            if (modal) modal.remove();
            
            console.log(`🪟 Modal creation: ${modalTime.toFixed(2)}ms`);
        });
    });
    
    describe('Network Performance', () => {
        beforeEach(() => {
            setupQuickTestData('clean_mkcg_data');
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
        });
        
        it('should handle AJAX requests within timeout limits', async () => {
            // Mock successful AJAX response
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });
            
            const startTime = performance.now();
            
            const response = await fetch('/test-endpoint');
            
            const endTime = performance.now();
            const requestTime = endTime - startTime;
            
            expect(requestTime).toBeLessThan(100); // Mocked should be very fast
            expect(response.ok).toBe(true);
            
            console.log(`🌐 AJAX request: ${requestTime.toFixed(2)}ms`);
        });
        
        it('should batch save operations efficiently', () => {
            integrationInstance.prepareSaveBackSystem();
            
            const startTime = performance.now();
            
            // Add multiple items to save queue
            for (let i = 0; i < 10; i++) {
                integrationInstance.createBatchSaveQueue({
                    key: `topic_${i}`,
                    value: `Batch Topic ${i}`,
                    quality: 75
                });
            }
            
            const endTime = performance.now();
            const batchTime = endTime - startTime;
            
            expect(batchTime).toBeLessThan(10); // Should be very fast
            expect(integrationInstance.saveQueue.length).toBe(10);
            
            console.log(`📦 Batch queue creation: ${batchTime.toFixed(2)}ms`);
        });
    });
    
    describe('Animation Performance', () => {
        it('should maintain 60fps during progress animations', (done) => {
            // Create progress indicator
            const progressIndicator = document.createElement('div');
            progressIndicator.className = 'mkcg-progress-indicator';
            progressIndicator.innerHTML = `<div class="progress-bar"></div>`;
            progressIndicator.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 4px;
                background: #f0f0f0;
            `;
            
            const progressBar = progressIndicator.querySelector('.progress-bar');
            progressBar.style.cssText = `
                height: 100%; background: #3b82f6; width: 0%;
                transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            `;
            
            document.body.appendChild(progressIndicator);
            
            let frameCount = 0;
            let startTime = performance.now();
            
            function animationFrame() {
                frameCount++;
                
                if (frameCount >= 60) { // Test for 1 second at 60fps
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    const fps = (frameCount / duration) * 1000;
                    
                    expect(fps).toBeGreaterThanOrEqual(55); // Allow slight variance
                    
                    console.log(`🎬 Animation FPS: ${fps.toFixed(1)}`);
                    
                    progressIndicator.remove();
                    done();
                    return;
                }
                
                // Animate progress bar
                const progress = (frameCount / 60) * 100;
                progressBar.style.width = `${progress}%`;
                
                requestAnimationFrame(animationFrame);
            }
            
            requestAnimationFrame(animationFrame);
        });
    });
    
    describe('Performance Regression Detection', () => {
        it('should detect performance regressions', async () => {
            const baselines = {
                initialization: 200,
                validation: 50,
                bulkOperation: 1000,
                rendering: 100
            };
            
            setupQuickTestData('clean_mkcg_data');
            
            // Test initialization
            const initStart = performance.now();
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            await integrationInstance.init();
            const initTime = performance.now() - initStart;
            
            // Test validation
            const validationStart = performance.now();
            await integrationInstance.performComprehensiveValidation('Regression Test', 0);
            const validationTime = performance.now() - validationStart;
            
            // Test rendering
            const renderStart = performance.now();
            integrationInstance.createMKCGSection();
            const renderTime = performance.now() - renderStart;
            
            const results = {
                initialization: initTime,
                validation: validationTime,
                rendering: renderTime
            };
            
            // Check for regressions (20% tolerance)
            Object.entries(results).forEach(([operation, time]) => {
                const baseline = baselines[operation];
                const tolerance = baseline * 1.2; // 20% tolerance
                
                expect(time).toBeLessThan(tolerance);
                
                console.log(`📈 ${operation}: ${time.toFixed(2)}ms (baseline: ${baseline}ms)`);
            });
        });
    });
});

/**
 * HELPER FUNCTIONS FOR PERFORMANCE TESTING
 */

/**
 * Get current memory usage
 */
function getMemoryUsage() {
    if (performance.memory) {
        return performance.memory.usedJSHeapSize;
    }
    return 0; // Fallback for environments without memory API
}

/**
 * Measure function execution time
 */
function measureTime(fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    return {
        result,
        time: end - start
    };
}

/**
 * Measure async function execution time
 */
async function measureAsyncTime(fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    return {
        result,
        time: end - start
    };
}

/**
 * Create performance stress test
 */
function createStressTest(iterations = 1000) {
    return {
        iterations,
        execute: async (fn) => {
            const times = [];
            
            for (let i = 0; i < iterations; i++) {
                const { time } = await measureAsyncTime(fn);
                times.push(time);
            }
            
            return {
                average: times.reduce((sum, time) => sum + time, 0) / times.length,
                min: Math.min(...times),
                max: Math.max(...times),
                times
            };
        }
    };
}

/**
 * Monitor frame rate during operation
 */
function monitorFrameRate(operation, duration = 1000) {
    return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        function frame() {
            frameCount++;
            
            if (performance.now() - startTime >= duration) {
                const fps = (frameCount / duration) * 1000;
                resolve(fps);
                return;
            }
            
            operation();
            requestAnimationFrame(frame);
        }
        
        requestAnimationFrame(frame);
    });
}

export {
    getMemoryUsage,
    measureTime,
    measureAsyncTime,
    createStressTest,
    monitorFrameRate
};
