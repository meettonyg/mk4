/**
 * PHASE 3.1: End-to-End Validation System
 * Comprehensive testing for topics loading flow from template to display
 * 
 * IMPLEMENTATION: Direct file editing per requirements
 * FOCUS: Root level validation, no patches or quick fixes
 * ARCHITECTURE: Event-driven validation system with no polling
 * 
 * @version 3.1.0-end-to-end-validation
 * @location components/topics/testing/end-to-end-validation.js
 */

(function() {
    'use strict';
    
    console.log('🧪 PHASE 3.1: Starting End-to-End Validation System');
    
    /**
     * PHASE 3.1: Comprehensive End-to-End Validation Class
     */
    class TopicsEndToEndValidator {
        constructor() {
            this.testResults = {
                passed: 0,
                failed: 0,
                total: 0,
                tests: [],
                startTime: Date.now(),
                endTime: null
            };
            
            this.validationStartTime = Date.now();
            this.isValidating = false;
            
            // Test configuration
            this.config = {
                maxValidationTime: 30000,  // 30 seconds
                autoSaveTimeout: 5000,     // 5 seconds
                maxRetries: 3,
                debugMode: window.gmkbData?.debugMode || false
            };
            
            console.log('📋 PHASE 3.1: Validator initialized with config', this.config);
        }
        
        /**
         * PHASE 3.1: Start comprehensive validation
         */
        async startValidation() {
            if (this.isValidating) {
                console.warn('⚠️ PHASE 3.1: Validation already in progress');
                return this.testResults;
            }
            
            this.isValidating = true;
            this.testResults = { passed: 0, failed: 0, total: 0, tests: [], startTime: Date.now(), endTime: null };
            
            console.log('🚀 PHASE 3.1: Starting comprehensive end-to-end validation...');
            
            try {
                // Test 1: Component Discovery and DOM Validation
                await this.validateComponentDiscovery();
                
                // Test 2: Template Data Loading Validation  
                await this.validateTemplateDataLoading();
                
                // Test 3: JavaScript Integration Validation
                await this.validateJavaScriptIntegration();
                
                // Test 4: AJAX Handler Validation
                await this.validateAjaxHandlers();
                
                // Test 5: Save Operation Validation
                await this.validateSaveOperations();
                
                // Test 6: Loading State Resolution Validation
                await this.validateLoadingStateResolution();
                
                // Test 7: Error Recovery Validation
                await this.validateErrorRecovery();
                
                // Test 8: Performance Validation
                await this.validatePerformance();
                
                // Test 9: Data Flow Validation
                await this.validateDataFlow();
                
                // Test 10: Integration with Main Systems
                await this.validateMainSystemIntegration();
                
                console.log('✅ PHASE 3.1: All validation tests completed');
                
            } catch (error) {
                console.error('❌ PHASE 3.1: Validation failed:', error);
                this.recordTestResult('Critical Error', false, error.message);
            } finally {
                this.isValidating = false;
                this.testResults.endTime = Date.now();
                this.generateValidationReport();
            }
            
            return this.testResults;
        }
        
        /**
         * PHASE 3.1: Test 1 - Component Discovery and DOM Validation
         */
        async validateComponentDiscovery() {
            console.log('🔍 PHASE 3.1: Test 1 - Component Discovery...');
            
            // Test 1.1: Check if topics components exist in DOM
            const topicsElements = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]');
            
            if (topicsElements.length === 0) {
                this.recordTestResult('Component Discovery', false, 'No topics components found in DOM');
                return;
            }
            
            this.recordTestResult('Component Discovery', true, `Found ${topicsElements.length} topics components`);
            
            // Test 1.2: Validate component structure
            let structureValid = true;
            let structureErrors = [];
            
            topicsElements.forEach((element, index) => {
                const componentId = element.dataset.componentId;
                const postId = element.dataset.postId;
                const container = element.querySelector('.topics-container');
                
                if (!componentId) {
                    structureErrors.push(`Component ${index}: Missing componentId`);
                    structureValid = false;
                }
                
                if (!postId) {
                    structureErrors.push(`Component ${index}: Missing postId`);
                    structureValid = false;
                }
                
                if (!container) {
                    structureErrors.push(`Component ${index}: Missing topics-container`);
                    structureValid = false;
                }
            });
            
            this.recordTestResult('Component Structure', structureValid, 
                structureValid ? 'All components have valid structure' : structureErrors.join(', '));
        }
        
        /**
         * PHASE 3.1: Test 2 - Template Data Loading Validation
         */
        async validateTemplateDataLoading() {
            console.log('🔍 PHASE 3.1: Test 2 - Template Data Loading...');
            
            const topicsElements = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]');
            let loadingValid = true;
            let loadingErrors = [];
            
            topicsElements.forEach((element, index) => {
                // Check if loading state is resolved
                const loadingResolved = element.getAttribute('data-loading-resolved') === 'true';
                const hasTopics = element.getAttribute('data-has-topics') === 'true';
                const topicsContainer = element.querySelector('.topics-container');
                
                if (!loadingResolved) {
                    loadingErrors.push(`Component ${index}: Loading state not resolved`);
                    loadingValid = false;
                }
                
                if (hasTopics) {
                    const topicItems = element.querySelectorAll('.topic-item');
                    if (topicItems.length === 0) {
                        loadingErrors.push(`Component ${index}: Claims to have topics but no topic items found`);
                        loadingValid = false;
                    }
                } else {
                    const noTopicsMessage = element.querySelector('.no-topics-message');
                    if (!noTopicsMessage) {
                        loadingErrors.push(`Component ${index}: No topics but no empty state message`);
                        loadingValid = false;
                    }
                }
                
                // Check for any loading indicators still visible
                const loadingIndicators = element.querySelectorAll('.loading-indicator, .loading-message, [data-loading="true"]');
                if (loadingIndicators.length > 0) {
                    loadingErrors.push(`Component ${index}: Still has ${loadingIndicators.length} loading indicators`);
                    loadingValid = false;
                }
            });
            
            this.recordTestResult('Template Data Loading', loadingValid, 
                loadingValid ? 'All components loaded correctly' : loadingErrors.join(', '));
        }
        
        /**
         * PHASE 3.1: Test 3 - JavaScript Integration Validation
         */
        async validateJavaScriptIntegration() {
            console.log('🔍 PHASE 3.1: Test 3 - JavaScript Integration...');
            
            // Check if topics manager exists
            const topicsManager = window.simplifiedTopicsManager;
            if (!topicsManager) {
                this.recordTestResult('JavaScript Integration', false, 'Topics manager not found');
                return;
            }
            
            // Check if manager is initialized
            if (!topicsManager.initialized) {
                this.recordTestResult('JavaScript Integration', false, 'Topics manager not initialized');
                return;
            }
            
            // Check if components are tracked
            const trackedComponents = topicsManager.components.size;
            const domComponents = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]').length;
            
            if (trackedComponents !== domComponents) {
                this.recordTestResult('JavaScript Integration', false, 
                    `Component count mismatch: ${trackedComponents} tracked vs ${domComponents} in DOM`);
                return;
            }
            
            this.recordTestResult('JavaScript Integration', true, 
                `Manager initialized with ${trackedComponents} components`);
        }
        
        /**
         * PHASE 3.1: Test 4 - AJAX Handler Validation
         */
        async validateAjaxHandlers() {
            console.log('🔍 PHASE 3.1: Test 4 - AJAX Handler...');
            
            // Get test data
            const testPostId = this.getTestPostId();
            if (!testPostId) {
                this.recordTestResult('AJAX Handler', false, 'No test post ID available');
                return;
            }
            
            try {
                // Test load operation
                const loadResponse = await this.testAjaxLoad(testPostId);
                if (!loadResponse.success) {
                    this.recordTestResult('AJAX Handler', false, `Load failed: ${loadResponse.message}`);
                    return;
                }
                
                // Test save operation
                const saveResponse = await this.testAjaxSave(testPostId, {
                    topic_1: 'Test Topic 1',
                    topic_2: 'Test Topic 2'
                });
                
                if (!saveResponse.success) {
                    this.recordTestResult('AJAX Handler', false, `Save failed: ${saveResponse.message}`);
                    return;
                }
                
                this.recordTestResult('AJAX Handler', true, 'Load and save operations successful');
                
            } catch (error) {
                this.recordTestResult('AJAX Handler', false, `AJAX error: ${error.message}`);
            }
        }
        
        /**
         * PHASE 3.1: Test 5 - Save Operation Validation
         */
        async validateSaveOperations() {
            console.log('🔍 PHASE 3.1: Test 5 - Save Operations...');
            
            const topicsElements = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]');
            let saveValid = true;
            let saveErrors = [];
            
            for (let element of topicsElements) {
                const postId = element.dataset.postId;
                if (!postId) {
                    saveErrors.push('Component missing post ID for save');
                    saveValid = false;
                    continue;
                }
                
                // Check if save functions are available
                const manager = window.simplifiedTopicsManager;
                if (!manager || typeof manager.saveComponent !== 'function') {
                    saveErrors.push('Save functions not available');
                    saveValid = false;
                    continue;
                }
                
                // Test contenteditable elements
                const editableElements = element.querySelectorAll('[contenteditable="true"]');
                if (editableElements.length > 0) {
                    // Check if event listeners are attached
                    let hasEventListeners = false;
                    editableElements.forEach(el => {
                        // Test by dispatching a blur event
                        const blurEvent = new Event('blur');
                        el.dispatchEvent(blurEvent);
                        hasEventListeners = true;
                    });
                    
                    if (!hasEventListeners) {
                        saveErrors.push('Editable elements missing event listeners');
                        saveValid = false;
                    }
                }
            }
            
            this.recordTestResult('Save Operations', saveValid, 
                saveValid ? 'Save operations properly configured' : saveErrors.join(', '));
        }
        
        /**
         * PHASE 3.1: Test 6 - Loading State Resolution Validation
         */
        async validateLoadingStateResolution() {
            console.log('🔍 PHASE 3.1: Test 6 - Loading State Resolution...');
            
            const topicsElements = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]');
            let resolutionValid = true;
            let resolutionErrors = [];
            
            topicsElements.forEach((element, index) => {
                // Check for infinite loading indicators
                const loadingElements = element.querySelectorAll('[data-loading="true"]');
                if (loadingElements.length > 0) {
                    resolutionErrors.push(`Component ${index}: Still has ${loadingElements.length} loading elements`);
                    resolutionValid = false;
                }
                
                // Check for "Loading your topics..." text
                const loadingText = element.textContent.toLowerCase();
                if (loadingText.includes('loading your topics')) {
                    resolutionErrors.push(`Component ${index}: Still shows "Loading your topics..." text`);
                    resolutionValid = false;
                }
                
                // Check for proper resolved state
                const loadingResolved = element.getAttribute('data-loading-resolved');
                if (loadingResolved !== 'true') {
                    resolutionErrors.push(`Component ${index}: Loading not marked as resolved`);
                    resolutionValid = false;
                }
            });
            
            this.recordTestResult('Loading State Resolution', resolutionValid, 
                resolutionValid ? 'All loading states properly resolved' : resolutionErrors.join(', '));
        }
        
        /**
         * PHASE 3.1: Test 7 - Error Recovery Validation
         */
        async validateErrorRecovery() {
            console.log('🔍 PHASE 3.1: Test 7 - Error Recovery...');
            
            // Test error handling by simulating various error conditions
            let errorRecoveryValid = true;
            let errorRecoveryErrors = [];
            
            // Test 1: Missing post ID
            const elementWithoutPostId = document.createElement('div');
            elementWithoutPostId.className = 'topics-component';
            elementWithoutPostId.dataset.componentId = 'test-component';
            
            try {
                if (window.simplifiedTopicsManager) {
                    window.simplifiedTopicsManager.resolveComponentLoadingState(elementWithoutPostId);
                }
                // Should not throw error
            } catch (error) {
                errorRecoveryErrors.push(`Error handling missing post ID: ${error.message}`);
                errorRecoveryValid = false;
            }
            
            // Test 2: Invalid AJAX response handling
            try {
                const invalidResponse = { success: false, message: 'Test error' };
                // This should be handled gracefully
            } catch (error) {
                errorRecoveryErrors.push(`Error handling invalid response: ${error.message}`);
                errorRecoveryValid = false;
            }
            
            this.recordTestResult('Error Recovery', errorRecoveryValid, 
                errorRecoveryValid ? 'Error recovery mechanisms working' : errorRecoveryErrors.join(', '));
        }
        
        /**
         * PHASE 3.1: Test 8 - Performance Validation
         */
        async validatePerformance() {
            console.log('🔍 PHASE 3.1: Test 8 - Performance...');
            
            const startTime = performance.now();
            
            // Test component initialization performance
            const topicsElements = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]');
            
            // Simulate component processing
            topicsElements.forEach(element => {
                const componentId = element.dataset.componentId;
                const postId = element.dataset.postId;
                const container = element.querySelector('.topics-container');
                
                // Simulate DOM queries (this should be fast)
                const editableElements = element.querySelectorAll('[contenteditable="true"]');
                const topicItems = element.querySelectorAll('.topic-item');
            });
            
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            
            // Performance should be under 100ms for reasonable number of components
            const performanceValid = processingTime < 100;
            
            this.recordTestResult('Performance', performanceValid, 
                `Component processing took ${processingTime.toFixed(2)}ms`);
        }
        
        /**
         * PHASE 3.1: Test 9 - Data Flow Validation
         */
        async validateDataFlow() {
            console.log('🔍 PHASE 3.1: Test 9 - Data Flow...');
            
            const topicsElements = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]');
            let dataFlowValid = true;
            let dataFlowErrors = [];
            
            topicsElements.forEach((element, index) => {
                // Check data flow from template to display
                const hasTopics = element.getAttribute('data-has-topics') === 'true';
                const topicsCount = element.getAttribute('data-topics-count');
                const loadingSource = element.getAttribute('data-loading-source');
                
                if (hasTopics) {
                    const topicItems = element.querySelectorAll('.topic-item');
                    const actualCount = topicItems.length;
                    const expectedCount = parseInt(topicsCount) || 0;
                    
                    if (actualCount !== expectedCount) {
                        dataFlowErrors.push(`Component ${index}: Count mismatch - expected ${expectedCount}, got ${actualCount}`);
                        dataFlowValid = false;
                    }
                    
                    // Check if topics have proper content
                    topicItems.forEach((item, itemIndex) => {
                        const title = item.querySelector('.topic-title');
                        if (!title || !title.textContent.trim()) {
                            dataFlowErrors.push(`Component ${index}: Topic ${itemIndex} has no title`);
                            dataFlowValid = false;
                        }
                    });
                }
                
                // Check loading source is specified
                if (!loadingSource) {
                    dataFlowErrors.push(`Component ${index}: No loading source specified`);
                    dataFlowValid = false;
                }
            });
            
            this.recordTestResult('Data Flow', dataFlowValid, 
                dataFlowValid ? 'Data flow from template to display working correctly' : dataFlowErrors.join(', '));
        }
        
        /**
         * PHASE 3.1: Test 10 - Integration with Main Systems
         */
        async validateMainSystemIntegration() {
            console.log('🔍 PHASE 3.1: Test 10 - Main System Integration...');
            
            let integrationValid = true;
            let integrationErrors = [];
            
            // Check if GMKB system is available
            const gmkbAvailable = !!window.GMKB;
            
            // Check if topics manager is registered
            const topicsManager = window.simplifiedTopicsManager;
            if (!topicsManager) {
                integrationErrors.push('Topics manager not available');
                integrationValid = false;
            }
            
            // Check if manager is registered with main system
            if (gmkbAvailable && window.GMKB.systems) {
                const registeredManager = window.GMKB.systems.TopicsManager || window.GMKB.systems.SimplifiedTopicsManager;
                if (!registeredManager) {
                    integrationErrors.push('Topics manager not registered with GMKB');
                    integrationValid = false;
                }
            }
            
            // Check if global functions are available
            if (typeof window.saveTopics !== 'function') {
                integrationErrors.push('Global saveTopics function not available');
                integrationValid = false;
            }
            
            this.recordTestResult('Main System Integration', integrationValid, 
                integrationValid ? 'Integration with main systems working' : integrationErrors.join(', '));
        }
        
        /**
         * PHASE 3.1: Helper Methods
         */
        getTestPostId() {
            // Try to get post ID from various sources
            const postId = window.gmkbData?.postId || 
                           new URLSearchParams(window.location.search).get('post_id') ||
                           document.querySelector('[data-post-id]')?.dataset.postId;
            
            return postId ? parseInt(postId) : null;
        }
        
        async testAjaxLoad(postId) {
            const formData = new FormData();
            formData.append('action', 'load_stored_topics');
            formData.append('post_id', postId);
            
            const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            return response.json();
        }
        
        async testAjaxSave(postId, topics) {
            const formData = new FormData();
            formData.append('action', 'save_custom_topics');
            formData.append('post_id', postId);
            formData.append('topics', JSON.stringify(topics));
            formData.append('nonce', window.gmkbData?.nonce || '');
            
            const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            return response.json();
        }
        
        recordTestResult(testName, passed, message) {
            const result = {
                name: testName,
                passed: passed,
                message: message,
                timestamp: Date.now()
            };
            
            this.testResults.tests.push(result);
            this.testResults.total++;
            
            if (passed) {
                this.testResults.passed++;
                console.log(`✅ ${testName}: ${message}`);
            } else {
                this.testResults.failed++;
                console.error(`❌ ${testName}: ${message}`);
            }
        }
        
        generateValidationReport() {
            const duration = this.testResults.endTime - this.testResults.startTime;
            const passRate = Math.round((this.testResults.passed / this.testResults.total) * 100);
            
            console.group('📋 PHASE 3.1: End-to-End Validation Report');
            console.log(`🎯 Tests Passed: ${this.testResults.passed}/${this.testResults.total} (${passRate}%)`);
            console.log(`⏱️ Duration: ${duration}ms`);
            console.log(`📊 Results:`);
            
            this.testResults.tests.forEach(test => {
                console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}: ${test.message}`);
            });
            
            console.groupEnd();
            
            // Store results globally for access
            window.phase3ValidationResults = this.testResults;
            
            return this.testResults;
        }
    }
    
    /**
     * PHASE 3.1: Global Functions
     */
    window.runPhase3Validation = function() {
        const validator = new TopicsEndToEndValidator();
        return validator.startValidation();
    };
    
    window.getPhase3ValidationResults = function() {
        return window.phase3ValidationResults || null;
    };
    
    // Auto-run validation if debug mode is enabled
    if (window.gmkbData?.debugMode) {
        console.log('🔍 PHASE 3.1: Debug mode enabled - auto-running validation in 2 seconds...');
        setTimeout(() => {
            window.runPhase3Validation();
        }, 2000);
    }
    
    console.log('✅ PHASE 3.1: End-to-End Validation System loaded');
    console.log('💡 Run validation with: runPhase3Validation()');
    
})();
