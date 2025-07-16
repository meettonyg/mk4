/**
 * PHASE 3.2: Error State Handling Validation
 * Comprehensive validation for error states and graceful degradation
 * 
 * IMPLEMENTATION: Direct file editing per requirements
 * FOCUS: Root level error handling validation, graceful degradation
 * ARCHITECTURE: Event-driven error testing with no polling
 * 
 * @version 3.2.0-error-state-validation
 * @location components/topics/testing/error-state-validation.js
 */

(function() {
    'use strict';
    
    console.log('🧪 PHASE 3.2: Starting Error State Handling Validation');
    
    /**
     * PHASE 3.2: Error State Handling Validator
     */
    class TopicsErrorStateValidator {
        constructor() {
            this.testResults = {
                passed: 0,
                failed: 0,
                total: 0,
                tests: [],
                startTime: Date.now(),
                endTime: null
            };
            
            this.isValidating = false;
            this.originalFunctions = new Map();
            
            // Error scenarios to test
            this.errorScenarios = [
                'missing_post_id',
                'invalid_post_id',
                'ajax_failure',
                'network_error',
                'malformed_response',
                'empty_data',
                'missing_nonce',
                'invalid_nonce',
                'missing_permissions',
                'missing_dom_elements',
                'corrupted_data'
            ];
            
            console.log('📋 PHASE 3.2: Error validator initialized');
        }
        
        /**
         * PHASE 3.2: Start comprehensive error state validation
         */
        async startValidation() {
            if (this.isValidating) {
                console.warn('⚠️ PHASE 3.2: Validation already in progress');
                return this.testResults;
            }
            
            this.isValidating = true;
            this.testResults = { passed: 0, failed: 0, total: 0, tests: [], startTime: Date.now(), endTime: null };
            
            console.log('🚀 PHASE 3.2: Starting comprehensive error state validation...');
            
            try {
                // Test 1: Missing Data Scenarios
                await this.validateMissingDataScenarios();
                
                // Test 2: Invalid Data Scenarios
                await this.validateInvalidDataScenarios();
                
                // Test 3: Network Failure Scenarios
                await this.validateNetworkFailureScenarios();
                
                // Test 4: Permission Error Scenarios
                await this.validatePermissionErrorScenarios();
                
                // Test 5: DOM Corruption Scenarios
                await this.validateDomCorruptionScenarios();
                
                // Test 6: AJAX Error Scenarios
                await this.validateAjaxErrorScenarios();
                
                // Test 7: Empty State Handling
                await this.validateEmptyStateHandling();
                
                // Test 8: Recovery Mechanisms
                await this.validateRecoveryMechanisms();
                
                // Test 9: User Experience During Errors
                await this.validateUserExperienceDuringErrors();
                
                // Test 10: Error Logging and Debugging
                await this.validateErrorLoggingAndDebugging();
                
                console.log('✅ PHASE 3.2: All error state validation tests completed');
                
            } catch (error) {
                console.error('❌ PHASE 3.2: Error validation failed:', error);
                this.recordTestResult('Critical Error', false, error.message);
            } finally {
                this.restoreOriginalFunctions();
                this.isValidating = false;
                this.testResults.endTime = Date.now();
                this.generateValidationReport();
            }
            
            return this.testResults;
        }
        
        /**
         * PHASE 3.2: Test 1 - Missing Data Scenarios
         */
        async validateMissingDataScenarios() {
            console.log('🔍 PHASE 3.2: Test 1 - Missing Data Scenarios...');
            
            // Test 1.1: Missing Post ID
            const componentWithoutPostId = this.createTestComponent();
            delete componentWithoutPostId.dataset.postId;
            
            try {
                if (window.simplifiedTopicsManager) {
                    window.simplifiedTopicsManager.resolveComponentLoadingState(componentWithoutPostId);
                }
                
                // Should handle gracefully without throwing errors
                const hasError = componentWithoutPostId.querySelector('.error-message');
                this.recordTestResult('Missing Post ID', !hasError, 
                    hasError ? 'Error message shown for missing post ID' : 'Gracefully handled missing post ID');
                
            } catch (error) {
                this.recordTestResult('Missing Post ID', false, `Threw error: ${error.message}`);
            }
            
            // Test 1.2: Missing Component ID
            const componentWithoutComponentId = this.createTestComponent();
            delete componentWithoutComponentId.dataset.componentId;
            
            try {
                if (window.simplifiedTopicsManager) {
                    window.simplifiedTopicsManager.initializeComponent(componentWithoutComponentId, 0);
                }
                
                this.recordTestResult('Missing Component ID', true, 'Handled missing component ID gracefully');
                
            } catch (error) {
                this.recordTestResult('Missing Component ID', false, `Threw error: ${error.message}`);
            }
            
            // Test 1.3: Missing Topics Container
            const componentWithoutContainer = this.createTestComponent();
            const container = componentWithoutContainer.querySelector('.topics-container');
            if (container) {
                container.remove();
            }
            
            try {
                if (window.simplifiedTopicsManager) {
                    window.simplifiedTopicsManager.resolveComponentLoadingState(componentWithoutContainer);
                }
                
                this.recordTestResult('Missing Topics Container', true, 'Handled missing container gracefully');
                
            } catch (error) {
                this.recordTestResult('Missing Topics Container', false, `Threw error: ${error.message}`);
            }
        }
        
        /**
         * PHASE 3.2: Test 2 - Invalid Data Scenarios
         */
        async validateInvalidDataScenarios() {
            console.log('🔍 PHASE 3.2: Test 2 - Invalid Data Scenarios...');
            
            // Test 2.1: Invalid Post ID
            const componentWithInvalidPostId = this.createTestComponent();
            componentWithInvalidPostId.dataset.postId = 'invalid-post-id';
            
            try {
                if (window.simplifiedTopicsManager) {
                    await window.simplifiedTopicsManager.saveComponent(componentWithInvalidPostId);
                }
                
                this.recordTestResult('Invalid Post ID', true, 'Handled invalid post ID gracefully');
                
            } catch (error) {
                this.recordTestResult('Invalid Post ID', false, `Threw error: ${error.message}`);
            }
            
            // Test 2.2: Corrupted Topics Data
            const componentWithCorruptedData = this.createTestComponent();
            // Add corrupted data attributes
            componentWithCorruptedData.dataset.topicsData = 'corrupted-json-data';
            
            try {
                if (window.simplifiedTopicsManager) {
                    window.simplifiedTopicsManager.extractTopicsFromElement(componentWithCorruptedData);
                }
                
                this.recordTestResult('Corrupted Topics Data', true, 'Handled corrupted data gracefully');
                
            } catch (error) {
                this.recordTestResult('Corrupted Topics Data', false, `Threw error: ${error.message}`);
            }
            
            // Test 2.3: Invalid Component Structure
            const invalidComponent = document.createElement('div');
            invalidComponent.className = 'invalid-component';
            
            try {
                if (window.simplifiedTopicsManager) {
                    window.simplifiedTopicsManager.initializeComponent(invalidComponent, 0);
                }
                
                this.recordTestResult('Invalid Component Structure', true, 'Handled invalid structure gracefully');
                
            } catch (error) {
                this.recordTestResult('Invalid Component Structure', false, `Threw error: ${error.message}`);
            }
        }
        
        /**
         * PHASE 3.2: Test 3 - Network Failure Scenarios
         */
        async validateNetworkFailureScenarios() {
            console.log('🔍 PHASE 3.2: Test 3 - Network Failure Scenarios...');
            
            // Mock network failure by overriding fetch
            const originalFetch = window.fetch;
            this.originalFunctions.set('fetch', originalFetch);
            
            window.fetch = async (url, options) => {
                if (url.includes('admin-ajax.php')) {
                    throw new Error('Network error');
                }
                return originalFetch(url, options);
            };
            
            try {
                const testComponent = this.createTestComponent();
                testComponent.dataset.postId = '123';
                
                if (window.simplifiedTopicsManager) {
                    await window.simplifiedTopicsManager.saveComponent(testComponent);
                }
                
                // Check if error was handled gracefully
                const errorStatus = testComponent.querySelector('.save-status');
                const hasErrorState = errorStatus && errorStatus.textContent.includes('Error');
                
                this.recordTestResult('Network Failure', hasErrorState, 
                    hasErrorState ? 'Network error handled with user feedback' : 'Network error not properly handled');
                
            } catch (error) {
                this.recordTestResult('Network Failure', false, `Unhandled network error: ${error.message}`);
            }
        }
        
        /**
         * PHASE 3.2: Test 4 - Permission Error Scenarios
         */
        async validatePermissionErrorScenarios() {
            console.log('🔍 PHASE 3.2: Test 4 - Permission Error Scenarios...');
            
            // Mock permission error by overriding fetch
            const originalFetch = window.fetch;
            this.originalFunctions.set('fetch', originalFetch);
            
            window.fetch = async (url, options) => {
                if (url.includes('admin-ajax.php')) {
                    return {
                        json: async () => ({
                            success: false,
                            message: 'Insufficient permissions'
                        })
                    };
                }
                return originalFetch(url, options);
            };
            
            try {
                const testComponent = this.createTestComponent();
                testComponent.dataset.postId = '123';
                
                if (window.simplifiedTopicsManager) {
                    await window.simplifiedTopicsManager.saveComponent(testComponent);
                }
                
                // Check if permission error was handled
                const errorStatus = testComponent.querySelector('.save-status');
                const hasPermissionError = errorStatus && errorStatus.textContent.includes('Error');
                
                this.recordTestResult('Permission Error', hasPermissionError, 
                    hasPermissionError ? 'Permission error handled with user feedback' : 'Permission error not properly handled');
                
            } catch (error) {
                this.recordTestResult('Permission Error', false, `Unhandled permission error: ${error.message}`);
            }
        }
        
        /**
         * PHASE 3.2: Test 5 - DOM Corruption Scenarios
         */
        async validateDomCorruptionScenarios() {
            console.log('🔍 PHASE 3.2: Test 5 - DOM Corruption Scenarios...');
            
            // Test 5.1: Corrupted editable elements
            const testComponent = this.createTestComponent();
            const editableElements = testComponent.querySelectorAll('[contenteditable="true"]');
            
            // Corrupt the editable elements
            editableElements.forEach(el => {
                el.removeAttribute('contenteditable');
                el.removeAttribute('data-setting');
            });
            
            try {
                if (window.simplifiedTopicsManager) {
                    window.simplifiedTopicsManager.setupComponentEditing(testComponent);
                    window.simplifiedTopicsManager.extractTopicsFromElement(testComponent);
                }
                
                this.recordTestResult('DOM Corruption', true, 'Handled corrupted DOM elements gracefully');
                
            } catch (error) {
                this.recordTestResult('DOM Corruption', false, `DOM corruption caused error: ${error.message}`);
            }
            
            // Test 5.2: Missing required DOM elements
            const componentWithMissingElements = document.createElement('div');
            componentWithMissingElements.className = 'topics-component';
            
            try {
                if (window.simplifiedTopicsManager) {
                    window.simplifiedTopicsManager.resolveComponentLoadingState(componentWithMissingElements);
                }
                
                this.recordTestResult('Missing DOM Elements', true, 'Handled missing DOM elements gracefully');
                
            } catch (error) {
                this.recordTestResult('Missing DOM Elements', false, `Missing DOM elements caused error: ${error.message}`);
            }
        }
        
        /**
         * PHASE 3.2: Test 6 - AJAX Error Scenarios
         */
        async validateAjaxErrorScenarios() {
            console.log('🔍 PHASE 3.2: Test 6 - AJAX Error Scenarios...');
            
            // Mock various AJAX error responses
            const originalFetch = window.fetch;
            this.originalFunctions.set('fetch', originalFetch);
            
            const errorResponses = [
                { success: false, message: 'Security verification failed' },
                { success: false, message: 'Post not found' },
                { success: false, message: 'Invalid data' },
                { success: false, message: 'Server error' }
            ];
            
            let responseIndex = 0;
            window.fetch = async (url, options) => {
                if (url.includes('admin-ajax.php')) {
                    const response = errorResponses[responseIndex % errorResponses.length];
                    responseIndex++;
                    
                    return {
                        json: async () => response
                    };
                }
                return originalFetch(url, options);
            };
            
            try {
                const testComponent = this.createTestComponent();
                testComponent.dataset.postId = '123';
                
                if (window.simplifiedTopicsManager) {
                    await window.simplifiedTopicsManager.saveComponent(testComponent);
                }
                
                // Check if AJAX error was handled
                const errorStatus = testComponent.querySelector('.save-status');
                const hasAjaxError = errorStatus && errorStatus.textContent.includes('Error');
                
                this.recordTestResult('AJAX Error', hasAjaxError, 
                    hasAjaxError ? 'AJAX error handled with user feedback' : 'AJAX error not properly handled');
                
            } catch (error) {
                this.recordTestResult('AJAX Error', false, `Unhandled AJAX error: ${error.message}`);
            }
        }
        
        /**
         * PHASE 3.2: Test 7 - Empty State Handling
         */
        async validateEmptyStateHandling() {
            console.log('🔍 PHASE 3.2: Test 7 - Empty State Handling...');
            
            // Test empty state scenarios
            const emptyComponent = this.createTestComponent();
            emptyComponent.setAttribute('data-has-topics', 'false');
            emptyComponent.setAttribute('data-topics-count', '0');
            
            // Remove any existing topic items
            const topicItems = emptyComponent.querySelectorAll('.topic-item');
            topicItems.forEach(item => item.remove());
            
            try {
                if (window.simplifiedTopicsManager) {
                    window.simplifiedTopicsManager.resolveComponentLoadingState(emptyComponent);
                }
                
                // Check if empty state is properly displayed
                const noTopicsMessage = emptyComponent.querySelector('.no-topics-message');
                const hasEmptyState = !!noTopicsMessage;
                
                this.recordTestResult('Empty State Display', hasEmptyState, 
                    hasEmptyState ? 'Empty state properly displayed' : 'Empty state not displayed');
                
                // Check if empty state has proper actions
                if (hasEmptyState) {
                    const addButton = emptyComponent.querySelector('.btn-add-topic');
                    const hasAddButton = !!addButton;
                    
                    this.recordTestResult('Empty State Actions', hasAddButton, 
                        hasAddButton ? 'Empty state has add topic button' : 'Empty state missing add topic button');
                }
                
            } catch (error) {
                this.recordTestResult('Empty State Handling', false, `Empty state handling error: ${error.message}`);
            }
        }
        
        /**
         * PHASE 3.2: Test 8 - Recovery Mechanisms
         */
        async validateRecoveryMechanisms() {
            console.log('🔍 PHASE 3.2: Test 8 - Recovery Mechanisms...');
            
            // Test automatic recovery from errors
            const testComponent = this.createTestComponent();
            
            // Simulate error state
            testComponent.setAttribute('data-loading-resolved', 'false');
            
            try {
                if (window.simplifiedTopicsManager) {
                    // Force resolve loading state (recovery mechanism)
                    window.simplifiedTopicsManager.forceResolveLoadingStates();
                }
                
                // Check if recovery was successful
                const loadingResolved = testComponent.getAttribute('data-loading-resolved') === 'true';
                
                this.recordTestResult('Recovery Mechanism', loadingResolved, 
                    loadingResolved ? 'Recovery mechanism successfully resolved loading state' : 'Recovery mechanism failed');
                
            } catch (error) {
                this.recordTestResult('Recovery Mechanism', false, `Recovery mechanism error: ${error.message}`);
            }
            
            // Test retry mechanisms
            let retryCount = 0;
            const originalFetch = window.fetch;
            this.originalFunctions.set('fetch', originalFetch);
            
            window.fetch = async (url, options) => {
                if (url.includes('admin-ajax.php')) {
                    retryCount++;
                    if (retryCount < 3) {
                        throw new Error('Network error');
                    }
                    return {
                        json: async () => ({ success: true, message: 'Saved successfully' })
                    };
                }
                return originalFetch(url, options);
            };
            
            try {
                testComponent.dataset.postId = '123';
                
                if (window.simplifiedTopicsManager) {
                    await window.simplifiedTopicsManager.saveComponent(testComponent);
                }
                
                this.recordTestResult('Retry Mechanism', retryCount >= 3, 
                    `Retry mechanism attempted ${retryCount} times`);
                
            } catch (error) {
                this.recordTestResult('Retry Mechanism', false, `Retry mechanism error: ${error.message}`);
            }
        }
        
        /**
         * PHASE 3.2: Test 9 - User Experience During Errors
         */
        async validateUserExperienceDuringErrors() {
            console.log('🔍 PHASE 3.2: Test 9 - User Experience During Errors...');
            
            const testComponent = this.createTestComponent();
            
            // Test user feedback during errors
            try {
                if (window.simplifiedTopicsManager) {
                    window.simplifiedTopicsManager.showSaveStatus(testComponent, 'error');
                }
                
                // Check if error status is visible
                const errorStatus = testComponent.querySelector('.save-status');
                const hasErrorStatus = errorStatus && errorStatus.textContent.includes('Error');
                
                this.recordTestResult('Error User Feedback', hasErrorStatus, 
                    hasErrorStatus ? 'Error status properly displayed to user' : 'Error status not displayed');
                
                // Check if error status has proper styling
                if (hasErrorStatus) {
                    const hasErrorStyling = errorStatus.style.color === 'rgb(239, 68, 68)' || 
                                          errorStatus.style.color === '#ef4444';
                    
                    this.recordTestResult('Error Status Styling', hasErrorStyling, 
                        hasErrorStyling ? 'Error status has proper styling' : 'Error status missing proper styling');
                }
                
            } catch (error) {
                this.recordTestResult('Error User Feedback', false, `User feedback error: ${error.message}`);
            }
        }
        
        /**
         * PHASE 3.2: Test 10 - Error Logging and Debugging
         */
        async validateErrorLoggingAndDebugging() {
            console.log('🔍 PHASE 3.2: Test 10 - Error Logging and Debugging...');
            
            // Test error logging
            const originalConsoleError = console.error;
            let errorLogged = false;
            
            console.error = (...args) => {
                if (args.some(arg => typeof arg === 'string' && arg.includes('Topics'))) {
                    errorLogged = true;
                }
                originalConsoleError.apply(console, args);
            };
            
            try {
                // Trigger an error scenario
                const invalidComponent = document.createElement('div');
                
                if (window.simplifiedTopicsManager) {
                    try {
                        window.simplifiedTopicsManager.saveComponent(invalidComponent);
                    } catch (error) {
                        // Expected error
                    }
                }
                
                this.recordTestResult('Error Logging', errorLogged, 
                    errorLogged ? 'Errors are properly logged' : 'Errors not being logged');
                
            } finally {
                console.error = originalConsoleError;
            }
            
            // Test debug information availability
            const hasDebugFunction = typeof window.debugTopicsPhase13 === 'function' || 
                                   typeof window.debugTopicsPhase22 === 'function';
            
            this.recordTestResult('Debug Information', hasDebugFunction, 
                hasDebugFunction ? 'Debug functions available' : 'Debug functions not available');
        }
        
        /**
         * PHASE 3.2: Helper Methods
         */
        createTestComponent() {
            const component = document.createElement('div');
            component.className = 'topics-component';
            component.dataset.componentId = 'test-component';
            component.dataset.postId = '123';
            component.dataset.hasTopics = 'true';
            component.dataset.topicsCount = '2';
            
            component.innerHTML = `
                <div class="topics-container">
                    <div class="topic-item">
                        <div class="topic-title" contenteditable="true" data-setting="topic_1">Test Topic 1</div>
                    </div>
                    <div class="topic-item">
                        <div class="topic-title" contenteditable="true" data-setting="topic_2">Test Topic 2</div>
                    </div>
                </div>
            `;
            
            return component;
        }
        
        restoreOriginalFunctions() {
            this.originalFunctions.forEach((originalFn, name) => {
                if (name === 'fetch') {
                    window.fetch = originalFn;
                }
            });
            this.originalFunctions.clear();
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
            
            console.group('📋 PHASE 3.2: Error State Validation Report');
            console.log(`🎯 Tests Passed: ${this.testResults.passed}/${this.testResults.total} (${passRate}%)`);
            console.log(`⏱️ Duration: ${duration}ms`);
            console.log(`📊 Results:`);
            
            this.testResults.tests.forEach(test => {
                console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}: ${test.message}`);
            });
            
            console.groupEnd();
            
            // Store results globally for access
            window.phase3ErrorValidationResults = this.testResults;
            
            return this.testResults;
        }
    }
    
    /**
     * PHASE 3.2: Global Functions
     */
    window.runPhase3ErrorValidation = function() {
        const validator = new TopicsErrorStateValidator();
        return validator.startValidation();
    };
    
    window.getPhase3ErrorValidationResults = function() {
        return window.phase3ErrorValidationResults || null;
    };
    
    // Auto-run validation if debug mode is enabled
    if (window.gmkbData?.debugMode) {
        console.log('🔍 PHASE 3.2: Debug mode enabled - auto-running error validation in 3 seconds...');
        setTimeout(() => {
            window.runPhase3ErrorValidation();
        }, 3000);
    }
    
    console.log('✅ PHASE 3.2: Error State Validation System loaded');
    console.log('💡 Run error validation with: runPhase3ErrorValidation()');
    
})();
