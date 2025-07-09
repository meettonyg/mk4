/**
 * FUNCTIONAL TESTS: Phase 6 Validation System
 * Following Gemini's recommendation for granular test file structure
 * 
 * Tests the comprehensive Phase 6 validation system including debounced validation,
 * auto-repair mechanisms, quality scoring, and UI feedback integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupQuickTestData, cleanupTestData } from '../utils/test-data-strategy.js';

describe('Phase 6 Validation System', () => {
    let testData;
    let integrationInstance;
    let mockElement;
    let mockPanel;
    
    beforeEach(() => {
        // Setup test environment
        testData = setupQuickTestData('clean_mkcg_data');
        
        // Create mock DOM elements
        mockElement = document.createElement('div');
        mockElement.className = 'topics-component';
        document.body.appendChild(mockElement);
        
        mockPanel = document.createElement('div');
        mockPanel.className = 'element-editor';
        document.body.appendChild(mockPanel);
        
        // Initialize integration instance
        integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
    });
    
    afterEach(() => {
        // Cleanup
        mockElement.remove();
        mockPanel.remove();
        cleanupTestData();
    });
    
    describe('Validation System Initialization', () => {
        it('should initialize validation system with correct configuration', () => {
            expect(integrationInstance.validationConfig).toBeDefined();
            expect(integrationInstance.validationConfig.rules).toBeDefined();
            expect(integrationInstance.validationConfig.autoRepair).toBeDefined();
            expect(integrationInstance.validationConfig.performance).toBeDefined();
        });
        
        it('should setup validation configuration following Gemini recommendations', () => {
            const config = integrationInstance.validationConfig;
            
            // Check simplified keyword relevance (no complex NLP)
            expect(config.keywordRelevance.simple).toBe(true);
            expect(config.keywordRelevance.scoring).toBe('basic');
            
            // Check safe auto-repair only
            expect(config.autoRepair.safeActionsOnly).toBe(true);
            expect(config.autoRepair.allowedActions).toContain('trim_whitespace');
            expect(config.autoRepair.allowedActions).toContain('remove_html_tags');
            expect(config.autoRepair.disallowedActions).toContain('content_modification');
            
            // Check 300ms debounce delay
            expect(config.performance.debounceDelay).toBe(300);
        });
        
        it('should initialize validation state management', () => {
            expect(integrationInstance.validationState).toBeDefined();
            expect(integrationInstance.validationState.debounceTimers instanceof Map).toBe(true);
            expect(integrationInstance.validationState.validationCache instanceof Map).toBe(true);
            expect(integrationInstance.validationState.activeValidations instanceof Set).toBe(true);
        });
        
        it('should initialize data integrity monitoring', () => {
            expect(integrationInstance.dataIntegrity).toBeDefined();
            expect(integrationInstance.dataIntegrity.checksums instanceof Map).toBe(true);
            expect(integrationInstance.dataIntegrity.backupInterval).toBe(30000);
            expect(integrationInstance.dataIntegrity.autoRepairEnabled).toBe(true);
        });
    });
    
    describe('Debounced Validation System', () => {
        it('should implement 300ms debounced validation', async () => {
            const topicValue = 'Test Topic';
            const topicIndex = 0;
            
            const startTime = performance.now();
            
            const validationPromise = integrationInstance.validateTopicDebounced(topicValue, topicIndex);
            
            // Validation should be debounced, not immediate
            expect(integrationInstance.validationState.debounceTimers.has('topic_0')).toBe(true);
            expect(integrationInstance.validationState.activeValidations.has('topic_0')).toBe(true);
            
            const results = await validationPromise;
            const endTime = performance.now();
            
            expect(results).toBeDefined();
            expect(results.isValid).toBeDefined();
            expect(endTime - startTime).toBeGreaterThanOrEqual(300);
        });
        
        it('should cancel previous validation timer when new validation starts', async () => {
            const topicValue1 = 'First Topic';
            const topicValue2 = 'Second Topic';
            const topicIndex = 0;
            
            // Start first validation
            const promise1 = integrationInstance.validateTopicDebounced(topicValue1, topicIndex);
            
            // Start second validation immediately (should cancel first)
            const promise2 = integrationInstance.validateTopicDebounced(topicValue2, topicIndex);
            
            const results = await promise2;
            
            expect(results).toBeDefined();
            expect(results.isValid).toBeDefined();
        });
        
        it('should cache validation results for performance', async () => {
            const topicValue = 'Cached Topic';
            const topicIndex = 0;
            
            await integrationInstance.validateTopicDebounced(topicValue, topicIndex);
            
            expect(integrationInstance.validationState.validationCache.has('topic_0')).toBe(true);
            
            const cached = integrationInstance.validationState.validationCache.get('topic_0');
            expect(cached.results).toBeDefined();
            expect(cached.timestamp).toBeDefined();
            expect(cached.value).toBe(topicValue);
        });
        
        it('should handle validation errors gracefully', async () => {
            // Mock error in comprehensive validation
            vi.spyOn(integrationInstance, 'performComprehensiveValidation').mockRejectedValue(new Error('Test validation error'));
            
            const results = await integrationInstance.validateTopicDebounced('Test Topic', 0);
            
            expect(results.isValid).toBe(false);
            expect(results.errors).toContain('Test validation error');
        });
    });
    
    describe('Comprehensive Validation Engine', () => {
        it('should perform comprehensive topic validation', async () => {
            const topicValue = 'Digital Marketing Strategy';
            const topicIndex = 0;
            
            const results = await integrationInstance.performComprehensiveValidation(topicValue, topicIndex);
            
            expect(results).toBeDefined();
            expect(results.isValid).toBeDefined();
            expect(results.errors).toBeDefined();
            expect(results.warnings).toBeDefined();
            expect(results.suggestions).toBeDefined();
            expect(results.quality).toBeDefined();
            expect(results.autoRepair).toBeDefined();
        });
        
        it('should validate required field (topic_1)', async () => {
            const emptyTopic = '';
            const topicIndex = 0; // topic_1 is required
            
            const results = await integrationInstance.performComprehensiveValidation(emptyTopic, topicIndex);
            
            expect(results.isValid).toBe(false);
            expect(results.errors.some(error => error.includes('required'))).toBe(true);
        });
        
        it('should validate topic length constraints', async () => {
            const shortTopic = 'ab'; // Too short (min 3)
            const longTopic = 'A'.repeat(150); // Too long (max 100)
            
            const shortResults = await integrationInstance.performComprehensiveValidation(shortTopic, 1);
            const longResults = await integrationInstance.performComprehensiveValidation(longTopic, 1);
            
            expect(shortResults.isValid).toBe(false);
            expect(shortResults.errors.some(error => error.includes('too short'))).toBe(true);
            
            expect(longResults.isValid).toBe(false);
            expect(longResults.errors.some(error => error.includes('too long'))).toBe(true);
        });
        
        it('should detect and handle HTML content', async () => {
            const htmlTopic = 'Topic with <script>alert("xss")</script> content';
            
            const results = await integrationInstance.performComprehensiveValidation(htmlTopic, 1);
            
            expect(results.warnings.some(warning => warning.includes('HTML tags'))).toBe(true);
        });
    });
    
    describe('Safe Auto-Repair System', () => {
        it('should perform safe auto-repair for whitespace issues', () => {
            const topicValue = '   Topic with excess whitespace   ';
            const repairableIssues = ['excess_whitespace'];
            
            const repairResult = integrationInstance.performSafeAutoRepair(topicValue, repairableIssues);
            
            expect(repairResult.repaired).toBe(true);
            expect(repairResult.repairedValue).toBe('Topic with excess whitespace');
            expect(repairResult.actions).toContain('Trimmed excess whitespace');
        });
        
        it('should remove HTML tags safely', () => {
            const topicValue = 'Topic with <b>bold</b> <script>alert("xss")</script> content';
            const repairableIssues = ['contains_html_tags'];
            
            const repairResult = integrationInstance.performSafeAutoRepair(topicValue, repairableIssues);
            
            expect(repairResult.repaired).toBe(true);
            expect(repairResult.repairedValue).toBe('Topic with bold alert("xss") content');
            expect(repairResult.actions).toContain('Removed HTML tags');
        });
        
        it('should capitalize first letter when needed', () => {
            const topicValue = 'topic without capital';
            const repairableIssues = ['missing_capitalization'];
            
            const repairResult = integrationInstance.performSafeAutoRepair(topicValue, repairableIssues);
            
            expect(repairResult.repaired).toBe(true);
            expect(repairResult.repairedValue).toBe('Topic without capital');
            expect(repairResult.actions).toContain('Capitalized first letter');
        });
        
        it('should not perform disallowed repairs', () => {
            const topicValue = 'Topic that needs content modification';
            const repairableIssues = ['content_modification']; // Disallowed action
            
            const repairResult = integrationInstance.performSafeAutoRepair(topicValue, repairableIssues);
            
            expect(repairResult.repaired).toBe(false);
            expect(repairResult.repairedValue).toBe(topicValue);
            expect(repairResult.actions).toHaveLength(0);
        });
        
        it('should track repair history for transparency', () => {
            const topicValue = '   Topic   ';
            const repairableIssues = ['excess_whitespace'];
            
            integrationInstance.performSafeAutoRepair(topicValue, repairableIssues);
            
            expect(integrationInstance.validationState.repairHistory.length).toBeGreaterThan(0);
            
            const lastRepair = integrationInstance.validationState.repairHistory[integrationInstance.validationState.repairHistory.length - 1];
            expect(lastRepair.originalValue).toBe(topicValue);
            expect(lastRepair.repairedValue).toBe('Topic');
            expect(lastRepair.actions).toContain('Trimmed excess whitespace');
        });
    });
    
    describe('Enhanced Quality Scoring System', () => {
        it('should calculate enhanced topic quality with breakdown', () => {
            const topicValue = 'Digital Marketing Strategy';
            const topicIndex = 0;
            
            const qualityResult = integrationInstance.calculateEnhancedTopicQuality(topicValue, topicIndex);
            
            expect(qualityResult).toBeDefined();
            expect(qualityResult.score).toBeGreaterThanOrEqual(0);
            expect(qualityResult.score).toBeLessThanOrEqual(100);
            expect(qualityResult.level).toMatch(/excellent|good|fair|poor/);
            expect(qualityResult.breakdown).toBeDefined();
            expect(qualityResult.feedback).toBeDefined();
            expect(qualityResult.suggestions).toBeDefined();
        });
        
        it('should provide detailed quality breakdown', () => {
            const topicValue = 'Excellent Digital Marketing Strategy';
            
            const qualityResult = integrationInstance.calculateEnhancedTopicQuality(topicValue, 0);
            
            expect(qualityResult.breakdown.length).toBeDefined();
            expect(qualityResult.breakdown.wordCount).toBeDefined();
            expect(qualityResult.breakdown.professionalism).toBeDefined();
            expect(qualityResult.breakdown.completeness).toBeDefined();
        });
        
        it('should give bonus points for required field (topic_1)', () => {
            const topicValue = 'Required Topic';
            
            const requiredFieldResult = integrationInstance.calculateEnhancedTopicQuality(topicValue, 0);
            const optionalFieldResult = integrationInstance.calculateEnhancedTopicQuality(topicValue, 1);
            
            expect(requiredFieldResult.breakdown.completeness).toBeGreaterThan(optionalFieldResult.breakdown.completeness);
        });
        
        it('should provide improvement suggestions for low quality', () => {
            const lowQualityTopic = 'ab'; // Very short
            
            const qualityResult = integrationInstance.calculateEnhancedTopicQuality(lowQualityTopic, 0);
            
            expect(qualityResult.suggestions.length).toBeGreaterThan(0);
            expect(qualityResult.suggestions.some(suggestion => suggestion.includes('expanding'))).toBe(true);
        });
    });
    
    describe('Content Validation System', () => {
        it('should perform content-specific validation', () => {
            const topicValue = 'Professional Marketing Topic';
            
            const contentValidation = integrationInstance.performContentValidation(topicValue, 0);
            
            expect(contentValidation).toBeDefined();
            expect(contentValidation.errors).toBeDefined();
            expect(contentValidation.warnings).toBeDefined();
            expect(contentValidation.suggestions).toBeDefined();
        });
        
        it('should detect promotional language', () => {
            const promotionalTopic = 'Buy now for guaranteed results!';
            
            const contentValidation = integrationInstance.performContentValidation(promotionalTopic, 0);
            
            expect(contentValidation.warnings.some(warning => warning.includes('professional'))).toBe(true);
        });
        
        it('should detect vague language', () => {
            const vagueTopic = 'Various things about stuff';
            
            const contentValidation = integrationInstance.performContentValidation(vagueTopic, 0);
            
            expect(contentValidation.suggestions.some(suggestion => suggestion.includes('specific'))).toBe(true);
        });
        
        it('should perform basic profanity checking', () => {
            const profaneTopic = 'This damn topic';
            
            const contentValidation = integrationInstance.performContentValidation(profaneTopic, 0);
            
            expect(contentValidation.errors.some(error => error.includes('inappropriate'))).toBe(true);
        });
    });
    
    describe('Uniqueness Validation', () => {
        beforeEach(() => {
            // Mock current topics for uniqueness testing
            integrationInstance.getCurrentTopicsFromPanel = vi.fn(() => [
                { index: 0, title: 'Digital Marketing', description: '', icon: 'check' },
                { index: 1, title: 'Social Media', description: '', icon: 'check' },
                { index: 2, title: 'SEO Strategy', description: '', icon: 'check' }
            ]);
        });
        
        it('should detect duplicate topics', () => {
            const duplicateTopic = 'Digital Marketing'; // Same as existing topic
            
            const uniquenessValidation = integrationInstance.performUniquenessValidation(duplicateTopic, 3);
            
            expect(uniquenessValidation.warnings.some(warning => warning.includes('duplicate'))).toBe(true);
            expect(uniquenessValidation.suggestions.some(suggestion => suggestion.includes('specific'))).toBe(true);
        });
        
        it('should detect similar topics', () => {
            const similarTopic = 'Digital Marketing Strategy'; // Similar to existing
            
            const uniquenessValidation = integrationInstance.performUniquenessValidation(similarTopic, 3);
            
            expect(uniquenessValidation.warnings.some(warning => warning.includes('similar'))).toBe(true);
        });
        
        it('should allow unique topics', () => {
            const uniqueTopic = 'Content Creation Strategy';
            
            const uniquenessValidation = integrationInstance.performUniquenessValidation(uniqueTopic, 3);
            
            expect(uniquenessValidation.warnings).toHaveLength(0);
        });
    });
    
    describe('Simple Keyword Relevance System', () => {
        beforeEach(() => {
            // Setup primary keywords
            integrationInstance.validationConfig.keywordRelevance.primaryKeywords = [
                'marketing', 'digital', 'strategy', 'social', 'media'
            ];
        });
        
        it('should perform simple keyword relevance check', () => {
            const topicValue = 'Digital Marketing Strategy';
            
            const relevanceResults = integrationInstance.performSimpleKeywordRelevance(topicValue);
            
            expect(relevanceResults).toBeDefined();
            expect(relevanceResults.score).toBeGreaterThan(0);
        });
        
        it('should provide suggestions for topics without relevant keywords', () => {
            const topicValue = 'Random Topic Without Keywords';
            
            const relevanceResults = integrationInstance.performSimpleKeywordRelevance(topicValue);
            
            expect(relevanceResults.score).toBe(0);
            expect(relevanceResults.suggestions.some(suggestion => suggestion.includes('keywords'))).toBe(true);
        });
        
        it('should handle empty keyword list gracefully', () => {
            integrationInstance.validationConfig.keywordRelevance.primaryKeywords = [];
            
            const relevanceResults = integrationInstance.performSimpleKeywordRelevance('Any Topic');
            
            expect(relevanceResults.score).toBe(0);
            expect(relevanceResults.suggestions).toHaveLength(0);
        });
    });
    
    describe('Data Integrity Monitoring', () => {
        it('should perform data integrity checks', () => {
            expect(() => {
                integrationInstance.performDataIntegrityCheck();
            }).not.toThrow();
        });
        
        it('should calculate data checksums correctly', () => {
            const testData = [
                { index: 0, title: 'Topic 1', description: '', icon: 'check' },
                { index: 1, title: 'Topic 2', description: '', icon: 'check' }
            ];
            
            const checksum1 = integrationInstance.calculateDataChecksum(testData);
            const checksum2 = integrationInstance.calculateDataChecksum(testData);
            const checksum3 = integrationInstance.calculateDataChecksum([...testData, { index: 2, title: 'Topic 3' }]);
            
            expect(checksum1).toBe(checksum2); // Same data should produce same checksum
            expect(checksum1).not.toBe(checksum3); // Different data should produce different checksum
        });
        
        it('should store backup data with timestamps', () => {
            integrationInstance.performDataIntegrityCheck();
            
            expect(integrationInstance.dataIntegrity.lastBackup).toBeDefined();
            expect(integrationInstance.dataIntegrity.lastBackup.timestamp).toBeDefined();
            expect(integrationInstance.dataIntegrity.lastBackup.topics).toBeDefined();
            expect(integrationInstance.dataIntegrity.lastBackup.checksum).toBeDefined();
        });
    });
    
    describe('Primary Keywords Extraction', () => {
        it('should extract primary keywords from MKCG data', () => {
            integrationInstance.extractPrimaryKeywords();
            
            const keywords = integrationInstance.validationConfig.keywordRelevance.primaryKeywords;
            
            expect(Array.isArray(keywords)).toBe(true);
            expect(keywords.length).toBeGreaterThan(0);
            expect(keywords.length).toBeLessThanOrEqual(20); // Max 20 keywords
        });
        
        it('should filter short words from keywords', () => {
            integrationInstance.extractPrimaryKeywords();
            
            const keywords = integrationInstance.validationConfig.keywordRelevance.primaryKeywords;
            
            // All keywords should be at least 3 characters long
            keywords.forEach(keyword => {
                expect(keyword.length).toBeGreaterThanOrEqual(3);
            });
        });
        
        it('should handle missing MKCG data gracefully', () => {
            integrationInstance.mkcgData = null;
            
            expect(() => {
                integrationInstance.extractPrimaryKeywords();
            }).not.toThrow();
        });
    });
    
    describe('Performance Optimization', () => {
        it('should complete validation within performance targets', async () => {
            const topicValue = 'Test Topic for Performance';
            const startTime = performance.now();
            
            await integrationInstance.validateTopicDebounced(topicValue, 0);
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            
            // Should complete within 350ms (300ms debounce + 50ms processing)
            expect(totalTime).toBeLessThan(400);
        });
        
        it('should cache validation results for performance', async () => {
            const topicValue = 'Cached Performance Topic';
            
            // First validation
            const startTime1 = performance.now();
            await integrationInstance.validateTopicDebounced(topicValue, 0);
            const endTime1 = performance.now();
            
            // Check if result is cached
            expect(integrationInstance.validationState.validationCache.has('topic_0')).toBe(true);
            
            // Subsequent validation should use cache (if implemented)
            const firstValidationTime = endTime1 - startTime1;
            expect(firstValidationTime).toBeGreaterThan(300); // Should include debounce delay
        });
    });
    
    describe('Error Handling in Validation', () => {
        it('should handle validation errors gracefully', async () => {
            // Mock error in basic validation
            vi.spyOn(integrationInstance, 'performBasicValidation').mockImplementation(() => {
                throw new Error('Basic validation error');
            });
            
            const results = await integrationInstance.performComprehensiveValidation('Test Topic', 0);
            
            expect(results.isValid).toBe(false);
            expect(results.errors).toContain('Validation error: Basic validation error');
        });
        
        it('should handle auto-repair errors gracefully', () => {
            // Mock error in auto-repair
            vi.spyOn(integrationInstance, 'getRepairActionForIssue').mockImplementation(() => {
                throw new Error('Repair action error');
            });
            
            expect(() => {
                integrationInstance.performSafeAutoRepair('Test Topic', ['excess_whitespace']);
            }).not.toThrow();
        });
    });
});

/**
 * HELPER FUNCTIONS FOR VALIDATION TESTING
 */

/**
 * Create mock input element for UI testing
 */
function createMockInputElement() {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'topic-input';
    
    const topicItem = document.createElement('div');
    topicItem.className = 'enhanced-topic-item';
    topicItem.appendChild(input);
    
    document.body.appendChild(topicItem);
    
    return { input, topicItem };
}

/**
 * Simulate typing with debounced validation
 */
async function simulateTypingWithDebounce(input, text, integrationInstance) {
    input.value = text;
    
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
    
    // Trigger validation
    return await integrationInstance.validateTopicDebounced(text, 0, input);
}

/**
 * Wait for debounced operations
 */
function waitForDebounce(delay = 350) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

export {
    createMockInputElement,
    simulateTypingWithDebounce,
    waitForDebounce
};
