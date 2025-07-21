/**
 * FUNCTIONAL TESTS: MKCG Integration Core Functionality
 * Following Gemini's recommendation for granular test file structure
 * 
 * Tests the core MKCG integration functionality including data detection,
 * mapping, panel enhancement, and data injection capabilities.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupQuickTestData, cleanupTestData } from '../utils/test-data-strategy.js';

describe('MKCG Integration Core Functionality', () => {
    let testData;
    let integrationInstance;
    
    beforeEach(() => {
        // Setup clean test environment
        testData = setupQuickTestData('clean_mkcg_data');
        
        // Create test DOM elements
        const testElement = document.createElement('div');
        testElement.className = 'topics-component';
        testElement.id = 'test-topics-component';
        document.body.appendChild(testElement);
        
        const panelContainer = document.createElement('div');
        panelContainer.className = 'element-editor';
        panelContainer.id = 'test-panel-container';
        document.body.appendChild(panelContainer);
        
        // Initialize integration instance
        integrationInstance = new TopicsMKCGIntegration(testElement, panelContainer);
    });
    
    afterEach(() => {
        // Cleanup test environment
        if (integrationInstance && typeof integrationInstance.destroy === 'function') {
            integrationInstance.destroy();
        }
        
        // Remove test DOM elements
        document.querySelectorAll('#test-topics-component, #test-panel-container').forEach(el => el.remove());
        
        cleanupTestData();
    });
    
    describe('MKCG Data Detection', () => {
        it('should detect post ID from multiple sources', () => {
            // Test URL parameter detection
            const originalLocation = window.location;
            Object.defineProperty(window, 'location', {
                value: {
                    search: '?post_id=123&other_param=value'
                },
                writable: true
            });
            
            const detectedPostId = integrationInstance.detectPostId();
            expect(detectedPostId).toBe(123);
            
            // Restore original location
            window.location = originalLocation;
        });
        
        it('should detect MKCG data from global scope', async () => {
            const hasData = await integrationInstance.detectMKCGData();
            
            expect(hasData).toBe(true);
            expect(integrationInstance.mkcgData).toBeDefined();
            expect(integrationInstance.mkcgData.topics).toBeDefined();
            expect(integrationInstance.mkcgData.topics.topics).toBeDefined();
        });
        
        it('should validate data availability for Topics component', () => {
            const isValid = integrationInstance.validateDataAvailability();
            
            expect(isValid).toBe(true);
            expect(Object.keys(integrationInstance.mkcgData.topics.topics).length).toBeGreaterThan(0);
        });
        
        it('should handle missing MKCG data gracefully', async () => {
            // Remove MKCG data
            delete window.guestifyData.mkcgData;
            
            const hasData = await integrationInstance.detectMKCGData();
            expect(hasData).toBe(false);
        });
    });
    
    describe('Data Mapping and Extraction', () => {
        it('should map MKCG data to Topics component fields', () => {
            const mappedData = integrationInstance.mapMKCGDataToTopics();
            
            expect(mappedData).toBeDefined();
            expect(mappedData.topic_1).toBeDefined();
            expect(mappedData.topic_1.value).toBe('Digital Marketing Strategy');
            expect(mappedData.topic_1.source).toBe('mkcg');
            expect(mappedData.topic_1.quality).toBeDefined();
        });
        
        it('should extract and sanitize topics data from MKCG', () => {
            const extractedTopics = integrationInstance.extractTopicsFromMKCG();
            
            expect(Array.isArray(extractedTopics)).toBe(true);
            expect(extractedTopics.length).toBeGreaterThan(0);
            
            // Verify topic structure
            const firstTopic = extractedTopics[0];
            expect(firstTopic).toHaveProperty('id');
            expect(firstTopic).toHaveProperty('index');
            expect(firstTopic).toHaveProperty('value');
            expect(firstTopic).toHaveProperty('source');
            expect(firstTopic).toHaveProperty('quality');
        });
        
        it('should sanitize topic data for safe usage', () => {
            // Test with potentially unsafe data
            const unsafeData = '<script>alert("xss")</script>Safe Content';
            const sanitized = integrationInstance.sanitizeTopicData(unsafeData);
            
            expect(sanitized).toBeDefined();
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('Safe Content');
        });
        
        it('should calculate topic quality scores', () => {
            const quality = integrationInstance.calculateTopicQuality('Digital Marketing Strategy');
            
            expect(quality).toBeDefined();
            expect(typeof quality).toBe('number');
            expect(quality).toBeGreaterThanOrEqual(0);
            expect(quality).toBeLessThanOrEqual(100);
        });
    });
    
    describe('Panel Enhancement', () => {
        it('should enhance Topics panel with MKCG controls', () => {
            integrationInstance.enhancePanelWithMKCGControls();
            
            // Check for MKCG section
            const mkcgSection = document.querySelector('#topics-mkcg-section');
            expect(mkcgSection).toBeDefined();
            expect(mkcgSection.style.display).toBe('block');
        });
        
        it('should create MKCG section with all required controls', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            
            expect(mkcgSection).toBeDefined();
            expect(mkcgSection.className).toContain('mkcg-integration-section');
            
            // Check for required buttons
            expect(mkcgSection.querySelector('.mkcg-refresh-btn')).toBeDefined();
            expect(mkcgSection.querySelector('.mkcg-save-btn')).toBeDefined();
            expect(mkcgSection.querySelector('.mkcg-sync-all-btn')).toBeDefined();
            expect(mkcgSection.querySelector('.mkcg-clear-all-btn')).toBeDefined();
            expect(mkcgSection.querySelector('.mkcg-reset-btn')).toBeDefined();
            expect(mkcgSection.querySelector('.mkcg-bulk-undo-btn')).toBeDefined();
        });
        
        it('should display correct data quality information', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            const qualityElement = mkcgSection.querySelector('.data-quality');
            
            expect(qualityElement).toBeDefined();
            expect(qualityElement.textContent).toContain('%');
        });
    });
    
    describe('Data Injection', () => {
        it('should inject MKCG data into Topics panel fields', () => {
            // Create topics list container
            const topicsList = document.createElement('div');
            topicsList.id = 'design-topics-list';
            document.body.appendChild(topicsList);
            
            // Mock addTopicToPanel function
            integrationInstance.addTopicToPanel = vi.fn();
            integrationInstance.updateTopicsInComponent = vi.fn();
            
            integrationInstance.injectMKCGDataIntoPanel();
            
            // Verify injection was attempted
            expect(integrationInstance.addTopicToPanel).toHaveBeenCalled();
            expect(integrationInstance.updateTopicsInComponent).toHaveBeenCalled();
            
            // Cleanup
            topicsList.remove();
        });
        
        it('should handle missing topics list container gracefully', () => {
            // Ensure no topics list exists
            const existingList = document.getElementById('design-topics-list');
            if (existingList) existingList.remove();
            
            // Should not throw error
            expect(() => {
                integrationInstance.injectMKCGDataIntoPanel();
            }).not.toThrow();
        });
        
        it('should preserve topic order during injection', () => {
            const extractedTopics = integrationInstance.extractTopicsFromMKCG();
            
            // Verify topics are sorted by index
            for (let i = 1; i < extractedTopics.length; i++) {
                expect(extractedTopics[i].index).toBeGreaterThan(extractedTopics[i - 1].index);
            }
        });
    });
    
    describe('Save-Back System Foundation', () => {
        it('should prepare save-back system with correct configuration', () => {
            integrationInstance.prepareSaveBackSystem();
            
            expect(integrationInstance.saveBackConfig).toBeDefined();
            expect(integrationInstance.saveBackConfig.endpoint).toBe('wp_ajax_save_mkcg_topics');
            expect(integrationInstance.saveBackConfig.batchSize).toBe(5);
            expect(integrationInstance.saveBackConfig.autoSaveDelay).toBe(30000);
        });
        
        it('should create batch save queue for topic data', () => {
            integrationInstance.prepareSaveBackSystem();
            
            const topicData = {
                key: 'topic_1',
                value: 'Test Topic',
                quality: 75
            };
            
            integrationInstance.createBatchSaveQueue(topicData);
            
            expect(integrationInstance.saveQueue).toBeDefined();
            expect(integrationInstance.saveQueue.length).toBeGreaterThan(0);
            expect(integrationInstance.saveQueue[0].key).toBe('topic_1');
        });
        
        it('should validate AJAX configuration', () => {
            integrationInstance.prepareSaveBackSystem();
            
            // Check if AJAX URL and nonce are available
            expect(integrationInstance.saveBackConfig.ajaxUrl).toBeDefined();
            expect(integrationInstance.saveBackConfig.nonce).toBeDefined();
        });
    });
    
    describe('Event Listeners Setup', () => {
        it('should setup event listeners without errors', () => {
            // Create MKCG section first
            const mkcgSection = integrationInstance.createMKCGSection();
            document.body.appendChild(mkcgSection);
            
            expect(() => {
                integrationInstance.setupEventListeners();
            }).not.toThrow();
            
            // Cleanup
            mkcgSection.remove();
        });
        
        it('should initialize bulk operation history tracking', () => {
            integrationInstance.setupProgressHandlers();
            
            expect(integrationInstance.bulkOperationHistory).toBeDefined();
            expect(Array.isArray(integrationInstance.bulkOperationHistory)).toBe(true);
            expect(integrationInstance.maxBulkHistorySize).toBe(3);
        });
    });
    
    describe('Error Handling', () => {
        it('should handle initialization errors gracefully', async () => {
            // Create instance with invalid data
            const invalidElement = null;
            const invalidPanel = null;
            
            expect(() => {
                new TopicsMKCGIntegration(invalidElement, invalidPanel);
            }).not.toThrow();
        });
        
        it('should log errors with proper context', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            integrationInstance.handleError('Test error', 'test-context');
            
            expect(consoleSpy).toHaveBeenCalled();
            expect(integrationInstance.errors).toBeDefined();
            expect(integrationInstance.errors.length).toBeGreaterThan(0);
            
            consoleSpy.mockRestore();
        });
        
        it('should maintain error history for debugging', () => {
            integrationInstance.handleError('Error 1', 'context-1');
            integrationInstance.handleError('Error 2', 'context-2');
            
            expect(integrationInstance.errors.length).toBe(2);
            expect(integrationInstance.errors[0].message).toBe('Error 1');
            expect(integrationInstance.errors[1].context).toBe('context-2');
        });
    });
    
    describe('Performance Monitoring', () => {
        it('should track initialization performance', () => {
            expect(integrationInstance.initStartTime).toBeDefined();
            expect(typeof integrationInstance.initStartTime).toBe('number');
        });
        
        it('should complete initialization within performance targets', async () => {
            const startTime = performance.now();
            
            const testElement = document.createElement('div');
            const testPanel = document.createElement('div');
            
            const newInstance = new TopicsMKCGIntegration(testElement, testPanel);
            await newInstance.init();
            
            const endTime = performance.now();
            const initTime = endTime - startTime;
            
            // Should initialize within 100ms for clean data
            expect(initTime).toBeLessThan(100);
        });
        
        it('should provide performance status information', () => {
            if (typeof integrationInstance.getStatus === 'function') {
                const status = integrationInstance.getStatus();
                
                expect(status).toBeDefined();
                expect(status).toHaveProperty('isInitialized');
                expect(status).toHaveProperty('initTime');
            }
        });
    });
    
    describe('Integration Status Reporting', () => {
        it('should report correct initialization status', () => {
            expect(integrationInstance.isInitialized).toBe(true);
            expect(integrationInstance.postId).toBe(123);
            expect(integrationInstance.mkcgData).toBeDefined();
        });
        
        it('should provide comprehensive status information', () => {
            if (typeof integrationInstance.getStatus === 'function') {
                const status = integrationInstance.getStatus();
                
                expect(status.dataSource).toBeDefined();
                expect(status.topicsAvailable).toBeGreaterThan(0);
                expect(status.componentsReady).toBeDefined();
            }
        });
        
        it('should track component readiness', () => {
            expect(integrationInstance.componentType).toBe('topics');
            expect(integrationInstance.element).toBeDefined();
            expect(integrationInstance.panelContainer).toBeDefined();
        });
    });
});

/**
 * HELPER FUNCTIONS FOR TESTING
 */

/**
 * Create mock DOM structure for testing
 */
function createMockDOMStructure() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="topics-component">
            <div class="element-editor">
                <div id="design-topics-list"></div>
            </div>
        </div>
    `;
    document.body.appendChild(container);
    return container;
}

/**
 * Wait for async operations to complete
 */
function waitForAsync(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulate user interaction
 */
function simulateClick(element) {
    const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    element.dispatchEvent(event);
}

export {
    createMockDOMStructure,
    waitForAsync,
    simulateClick
};
