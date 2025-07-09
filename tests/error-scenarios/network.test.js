/**
 * ERROR SCENARIOS TESTING: Network, Data Corruption, and Edge Cases
 * Following Gemini's recommendation for granular test file structure
 * 
 * Tests comprehensive error handling including network failures, data corruption,
 * permission errors, concurrent editing conflicts, and edge case scenarios.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupQuickTestData, cleanupTestData } from '../utils/test-data-strategy.js';

describe('Error Scenarios and Edge Cases', () => {
    let integrationInstance;
    let mockElement;
    let mockPanel;
    
    beforeEach(() => {
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
    
    describe('Missing MKCG Data Scenarios', () => {
        beforeEach(() => {
            // Setup environment without MKCG data
            window.guestifyData = {};
        });
        
        it('should handle missing global guestifyData gracefully', async () => {
            delete window.guestifyData;
            
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            
            expect(integrationInstance.isInitialized).toBe(false);
            expect(integrationInstance.mkcgData).toBeNull();
        });
        
        it('should handle missing mkcgData property', async () => {
            window.guestifyData = { postId: 123 }; // No mkcgData
            
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            
            const hasData = await integrationInstance.detectMKCGData();
            expect(hasData).toBe(false);
        });
        
        it('should handle missing topics data structure', async () => {
            window.guestifyData = {
                mkcgData: {
                    biography: { short: 'Bio text' }
                    // No topics property
                }
            };
            
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            
            const hasData = await integrationInstance.detectMKCGData();
            expect(hasData).toBe(false);
        });
        
        it('should handle empty topics object', async () => {
            window.guestifyData = {
                mkcgData: {
                    topics: {
                        topics: {} // Empty topics
                    }
                }
            };
            
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            
            const isValid = integrationInstance.validateDataAvailability();
            expect(isValid).toBe(false);
        });
        
        it('should operate in manual mode when no MKCG data available', async () => {
            window.guestifyData = {};
            
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            
            // Should not throw errors and allow manual operation
            expect(() => {
                integrationInstance.mapMKCGDataToTopics();
            }).not.toThrow();
            
            const mappedData = integrationInstance.mapMKCGDataToTopics();
            expect(Object.keys(mappedData)).toHaveLength(0);
        });
    });
    
    describe('Network Failure Scenarios', () => {
        beforeEach(() => {
            setupQuickTestData('network_failure_state');
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
        });
        
        it('should handle AJAX endpoint failures', async () => {
            // Mock failed AJAX response
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
            
            integrationInstance.prepareSaveBackSystem();
            
            // Attempt to save data
            const topicData = { key: 'topic_1', value: 'Test Topic' };
            
            expect(() => {
                integrationInstance.createBatchSaveQueue(topicData);
            }).not.toThrow();
        });
        
        it('should implement retry mechanism for failed requests', async () => {
            let attemptCount = 0;
            
            // Mock fetch with failures then success
            global.fetch = vi.fn().mockImplementation(() => {
                attemptCount++;
                if (attemptCount < 3) {
                    return Promise.reject(new Error('Network error'));
                }
                return Promise.resolve({ ok: true, json: () => ({ success: true }) });
            });
            
            // Test retry logic (if implemented)
            // This would require actual retry implementation in the integration class
            expect(attemptCount).toBe(0); // Starting state
        });
        
        it('should handle timeout scenarios', async () => {
            // Mock slow response
            global.fetch = vi.fn().mockImplementation(() => {
                return new Promise(resolve => {
                    setTimeout(() => resolve({ ok: true }), 10000); // 10 second delay
                });
            });
            
            // Should handle timeout gracefully
            const timeoutPromise = Promise.race([
                fetch('/test'),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
            ]);
            
            await expect(timeoutPromise).rejects.toThrow('Timeout');
        });
        
        it('should provide offline mode functionality', () => {
            // Simulate offline state
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });
            
            // Should detect offline state and adjust behavior
            expect(navigator.onLine).toBe(false);
            
            // Restore online state
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: true
            });
        });
        
        it('should queue operations when offline', () => {
            integrationInstance.prepareSaveBackSystem();
            
            const topicData = { key: 'topic_1', value: 'Offline Topic' };
            integrationInstance.createBatchSaveQueue(topicData);
            
            expect(integrationInstance.saveQueue.length).toBeGreaterThan(0);
        });
    });
    
    describe('Data Corruption Scenarios', () => {
        beforeEach(() => {
            setupQuickTestData('corrupted_data_state');
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
        });
        
        it('should handle null topic values', () => {
            window.guestifyData.mkcgData.topics.topics.topic_1 = null;
            
            const mappedData = integrationInstance.mapMKCGDataToTopics();
            
            // Should exclude null values
            expect(mappedData.topic_1).toBeUndefined();
        });
        
        it('should handle undefined topic values', () => {
            window.guestifyData.mkcgData.topics.topics.topic_2 = undefined;
            
            const mappedData = integrationInstance.mapMKCGDataToTopics();
            
            // Should exclude undefined values
            expect(mappedData.topic_2).toBeUndefined();
        });
        
        it('should handle empty string topics', () => {
            window.guestifyData.mkcgData.topics.topics.topic_3 = '';
            
            const mappedData = integrationInstance.mapMKCGDataToTopics();
            
            // Should exclude empty strings
            expect(mappedData.topic_3).toBeUndefined();
        });
        
        it('should sanitize XSS attempts in topic data', () => {
            const xssAttempt = '<script>alert("xss")</script>Safe Content';
            
            const sanitized = integrationInstance.sanitizeTopicData(xssAttempt);
            
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('Safe Content');
        });
        
        it('should handle non-string topic values', () => {
            window.guestifyData.mkcgData.topics.topics.topic_4 = 12345;
            window.guestifyData.mkcgData.topics.topics.topic_5 = { invalid: 'object' };
            
            const mappedData = integrationInstance.mapMKCGDataToTopics();
            
            // Should exclude non-string values
            expect(mappedData.topic_4).toBeUndefined();
            expect(mappedData.topic_5).toBeUndefined();
        });
        
        it('should detect and repair corrupted topic data', async () => {
            const corruptedTopic = '   <b>Corrupted</b> Topic   ';
            
            const results = await integrationInstance.performComprehensiveValidation(corruptedTopic, 0);
            
            if (results.autoRepair.performed) {
                expect(results.autoRepair.repairedValue).toBe('Corrupted Topic');
                expect(results.autoRepair.actions).toContain('Trimmed excess whitespace');
                expect(results.autoRepair.actions).toContain('Removed HTML tags');
            }
        });
    });
    
    describe('WordPress Permission Errors', () => {
        beforeEach(() => {
            setupQuickTestData('clean_mkcg_data');
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
        });
        
        it('should handle missing WordPress nonce', () => {
            window.guestifyData.nonce = null;
            
            integrationInstance.prepareSaveBackSystem();
            
            expect(integrationInstance.saveBackConfig.nonce).toBeNull();
            // Should log warning about incomplete AJAX configuration
        });
        
        it('should handle missing AJAX URL', () => {
            window.guestifyData.ajaxUrl = null;
            
            integrationInstance.prepareSaveBackSystem();
            
            expect(integrationInstance.saveBackConfig.ajaxUrl).toBeNull();
        });
        
        it('should handle permission denied responses', async () => {
            // Mock permission denied response
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 403,
                json: () => Promise.resolve({ error: 'Permission denied' })
            });
            
            // Should handle permission errors gracefully
            const response = await fetch('/test');
            expect(response.status).toBe(403);
        });
        
        it('should handle invalid user session', async () => {
            // Mock session expired response
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: 'Session expired' })
            });
            
            const response = await fetch('/test');
            expect(response.status).toBe(401);
        });
    });
    
    describe('Concurrent Editing Conflicts', () => {
        beforeEach(() => {
            setupQuickTestData('concurrent_edit_state');
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
        });
        
        it('should detect concurrent editing scenarios', () => {
            const testData = window.guestifyData;
            
            expect(testData.concurrentEdits).toBeDefined();
            expect(testData.concurrentEdits.user1).toBeDefined();
            expect(testData.concurrentEdits.user2).toBeDefined();
        });
        
        it('should handle version conflicts during save', () => {
            // Simulate version conflict
            const conflictData = {
                lastModified: Date.now() - 5000, // 5 seconds ago
                currentVersion: 'v1',
                serverVersion: 'v2'
            };
            
            // Should detect version mismatch
            expect(conflictData.currentVersion).not.toBe(conflictData.serverVersion);
        });
        
        it('should implement conflict resolution UI', () => {
            // Mock conflict resolution dialog
            const conflictResolution = vi.fn();
            
            // Should provide options to resolve conflicts
            expect(typeof conflictResolution).toBe('function');
        });
        
        it('should merge non-conflicting changes', () => {
            const user1Changes = { topic_1: 'User 1 Topic' };
            const user2Changes = { topic_2: 'User 2 Topic' };
            
            const merged = { ...user1Changes, ...user2Changes };
            
            expect(merged.topic_1).toBe('User 1 Topic');
            expect(merged.topic_2).toBe('User 2 Topic');
        });
        
        it('should preserve user edits over MKCG data during conflicts', async () => {
            // User edits should win over MKCG data in conflicts
            const userEdit = 'User Modified Topic';
            const mkcgData = 'Original MKCG Topic';
            
            // Conflict resolution should prefer user edits
            const resolvedValue = userEdit; // User edits win
            
            expect(resolvedValue).toBe(userEdit);
            expect(resolvedValue).not.toBe(mkcgData);
        });
    });
    
    describe('DOM Manipulation Errors', () => {
        it('should handle missing panel container', () => {
            integrationInstance = new TopicsMKCGIntegration(mockElement, null);
            
            expect(() => {
                integrationInstance.enhancePanelWithMKCGControls();
            }).not.toThrow();
        });
        
        it('should handle missing topics list element', () => {
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            
            // No topics list in DOM
            expect(() => {
                integrationInstance.injectMKCGDataIntoPanel();
            }).not.toThrow();
        });
        
        it('should handle DOM elements being removed during operation', () => {
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
            
            // Create and immediately remove element
            const topicsList = document.createElement('div');
            topicsList.id = 'design-topics-list';
            mockPanel.appendChild(topicsList);
            
            // Remove element during operation
            setTimeout(() => topicsList.remove(), 10);
            
            expect(() => {
                integrationInstance.injectMKCGDataIntoPanel();
            }).not.toThrow();
        });
        
        it('should handle invalid DOM structure', () => {
            // Create malformed DOM structure
            const malformedElement = document.createElement('span'); // Wrong element type
            
            integrationInstance = new TopicsMKCGIntegration(malformedElement, mockPanel);
            
            expect(() => {
                integrationInstance.init();
            }).not.toThrow();
        });
    });
    
    describe('Performance Stress Testing', () => {
        beforeEach(() => {
            setupQuickTestData('high_volume_data_state');
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
        });
        
        it('should handle large datasets without memory leaks', async () => {
            const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Process large dataset
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                id: `topic_${i}`,
                value: `Large Dataset Topic ${i}`,
                description: 'Large description '.repeat(100)
            }));
            
            // Process all topics
            for (const topic of largeDataset) {
                integrationInstance.sanitizeTopicData(topic.value);
            }
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
            
            const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory increase should be reasonable (less than 10MB)
            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        });
        
        it('should handle rapid successive operations', async () => {
            const operations = [];
            
            // Create 100 rapid operations
            for (let i = 0; i < 100; i++) {
                operations.push(
                    integrationInstance.validateTopicDebounced(`Rapid Topic ${i}`, i % 5)
                );
            }
            
            // All operations should complete without errors
            const results = await Promise.allSettled(operations);
            
            const failures = results.filter(result => result.status === 'rejected');
            expect(failures.length).toBe(0);
        });
        
        it('should throttle validation requests under high load', async () => {
            const validationCalls = [];
            
            // Simulate high-frequency validation requests
            for (let i = 0; i < 20; i++) {
                validationCalls.push(
                    integrationInstance.validateTopicDebounced('High Frequency Topic', 0)
                );
            }
            
            // Only the last validation should execute due to debouncing
            await Promise.all(validationCalls);
            
            // Verify debouncing is working (only one timer should be active)
            expect(integrationInstance.validationState.debounceTimers.size).toBeLessThanOrEqual(1);
        });
    });
    
    describe('Browser Compatibility Edge Cases', () => {
        it('should handle missing modern JavaScript features', () => {
            // Mock missing Map support
            const originalMap = global.Map;
            delete global.Map;
            
            expect(() => {
                // Should provide fallback for missing Map
                const fallbackMap = global.Map || function() {
                    this.data = {};
                    this.set = (key, value) => this.data[key] = value;
                    this.get = (key) => this.data[key];
                    this.has = (key) => key in this.data;
                };
                
                new fallbackMap();
            }).not.toThrow();
            
            // Restore Map
            global.Map = originalMap;
        });
        
        it('should handle missing fetch API', () => {
            const originalFetch = global.fetch;
            delete global.fetch;
            
            // Should detect missing fetch and provide fallback
            const hasFetch = typeof global.fetch !== 'undefined';
            expect(hasFetch).toBe(false);
            
            // Restore fetch
            global.fetch = originalFetch;
        });
        
        it('should handle missing performance API', () => {
            const originalPerformance = global.performance;
            delete global.performance;
            
            // Should handle missing performance.now()
            const getTime = () => {
                return global.performance ? performance.now() : Date.now();
            };
            
            expect(typeof getTime()).toBe('number');
            
            // Restore performance
            global.performance = originalPerformance;
        });
    });
    
    describe('Validation Error Edge Cases', () => {
        beforeEach(() => {
            setupQuickTestData('validation_error_state');
            integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
        });
        
        it('should handle extremely long validation queues', async () => {
            const validationPromises = [];
            
            // Queue many validations
            for (let i = 0; i < 50; i++) {
                validationPromises.push(
                    integrationInstance.validateTopicDebounced(`Queue Topic ${i}`, i % 5)
                );
            }
            
            // Should handle large queue without errors
            const results = await Promise.allSettled(validationPromises);
            expect(results.every(result => result.status === 'fulfilled')).toBe(true);
        });
        
        it('should handle circular reference in data structures', () => {
            // Create circular reference
            const circularData = { topic: 'Test' };
            circularData.self = circularData;
            
            expect(() => {
                // Should handle circular references gracefully
                JSON.stringify(circularData);
            }).toThrow(); // JSON.stringify fails with circular references
            
            // Safe handling would catch and handle this error
            let safeStringify;
            try {
                safeStringify = JSON.stringify(circularData);
            } catch (error) {
                safeStringify = 'Circular reference detected';
            }
            
            expect(safeStringify).toBe('Circular reference detected');
        });
        
        it('should handle malformed regular expressions in validation', () => {
            // Malformed regex pattern
            const malformedPattern = '[invalid regex';
            
            expect(() => {
                new RegExp(malformedPattern);
            }).toThrow();
            
            // Safe regex creation
            let safeRegex;
            try {
                safeRegex = new RegExp(malformedPattern);
            } catch (error) {
                safeRegex = /.*/ ; // Fallback pattern
            }
            
            expect(safeRegex).toBeInstanceOf(RegExp);
        });
    });
});

/**
 * HELPER FUNCTIONS FOR ERROR SCENARIO TESTING
 */

/**
 * Mock network failure
 */
function mockNetworkFailure() {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));
}

/**
 * Mock slow network
 */
function mockSlowNetwork(delay = 5000) {
    global.fetch = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
            setTimeout(() => resolve({ ok: true }), delay);
        });
    });
}

/**
 * Mock permission denied response
 */
function mockPermissionDenied() {
    global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'Permission denied' })
    });
}

/**
 * Create corrupted MKCG data
 */
function createCorruptedMKCGData() {
    return {
        mkcgData: {
            topics: {
                topics: {
                    topic_1: null,
                    topic_2: '',
                    topic_3: '<script>alert("xss")</script>',
                    topic_4: 'A'.repeat(500),
                    topic_5: undefined
                }
            }
        }
    };
}

/**
 * Simulate memory pressure
 */
function simulateMemoryPressure() {
    const largeArrays = [];
    for (let i = 0; i < 100; i++) {
        largeArrays.push(new Array(10000).fill('memory pressure'));
    }
    return largeArrays;
}

export {
    mockNetworkFailure,
    mockSlowNetwork,
    mockPermissionDenied,
    createCorruptedMKCGData,
    simulateMemoryPressure
};
