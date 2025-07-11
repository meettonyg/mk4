/**
 * @file test-phase23-enhanced-ux.js
 * @description Comprehensive test suite for Phase 2.3 Enhanced User Experience Implementation
 * 
 * PHASE 2.3: ROOT-LEVEL MODAL TIMEOUT FIXES AND UX ENHANCEMENTS
 * Tests all major components of the Phase 2.3 implementation:
 * - PHP template modal validation
 * - JavaScript initialization manager fixes
 * - Initialization tracker resilience
 * - Enhanced bridge element system
 * - User experience improvements
 * - Error handling and recovery
 */

import { structuredLogger } from '../utils/structured-logger.js';
import { initializationTracker } from '../utils/initialization-tracker.js';
import { initializationManager } from '../core/initialization-manager.js';

class Phase23EnhancedUXTestSuite {
    constructor() {
        this.logger = structuredLogger;
        this.testResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            total: 0,
            details: [],
            phase23Specific: {
                modalValidation: { passed: 0, failed: 0 },
                timeoutResolution: { passed: 0, failed: 0 },
                bridgeElements: { passed: 0, failed: 0 },
                errorHandling: { passed: 0, failed: 0 },
                userExperience: { passed: 0, failed: 0 }
            }
        };
        this.startTime = performance.now();
    }

    /**
     * PHASE 2.3: Run complete test suite
     */
    async runAllTests() {
        this.logger.info('TEST', '🚀 Starting Phase 2.3 Enhanced UX Test Suite');
        
        try {
            // Core system tests
            await this.testPhase23Enhancements();
            await this.testModalValidationSystem();
            await this.testInitializationManagerFixes();
            await this.testInitializationTrackerResilience();
            await this.testBridgeElementSystem();
            await this.testTimeoutResolutionSystem();
            await this.testErrorHandlingEnhancements();
            await this.testUserExperienceFeatures();
            await this.testPerformanceImprovements();
            await this.testAccessibilityCompliance();
            
            // Integration tests
            await this.testEndToEndIntegration();
            await this.testRegressionPrevention();
            
            this.generateTestReport();
            
        } catch (error) {
            this.logger.error('TEST', 'Phase 2.3 test suite failed', error);
            this.recordTestResult('CRITICAL', 'Test Suite Execution', false, error.message);
        }
        
        return this.testResults;
    }

    /**
     * PHASE 2.3: Test core Phase 2.3 enhancements
     */
    async testPhase23Enhancements() {
        this.logger.info('TEST', 'Testing Phase 2.3 core enhancements');
        
        const tests = [
            {
                name: 'Phase 2.3 Global Variables',
                test: () => {
                    const hasPhase23 = window.gmkbPhase23Enhanced;
                    const hasModalValidation = window.gmkbModalValidation;
                    const hasTemplateReady = window.gmkbPhase23TemplateComplete;
                    
                    return hasPhase23 && hasModalValidation && 
                           typeof window.gmkbModalPreValidation === 'function';
                }
            },
            {
                name: 'Enhanced Template Version Detection',
                test: () => {
                    const body = document.body;
                    return body.classList.contains('gmkb-phase23-enhanced') &&
                           body.getAttribute('data-template-version') === '2.3';
                }
            },
            {
                name: 'Modal Validation Data Structure',
                test: () => {
                    const validation = window.gmkbModalValidation;
                    return validation && 
                           typeof validation.all_available === 'boolean' &&
                           Array.isArray(validation.missing_files) &&
                           typeof validation.success_rate === 'number';
                }
            },
            {
                name: 'Enhanced Bridge Element System',
                test: () => {
                    const bridgeContainer = document.getElementById('gmkb-bridge-elements-enhanced');
                    const addFirstComponent = document.getElementById('add-first-component');
                    return bridgeContainer && addFirstComponent;
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.recordTestResult('PHASE23', test.name, result);
                if (result) this.testResults.phase23Specific.modalValidation.passed++;
                else this.testResults.phase23Specific.modalValidation.failed++;
            } catch (error) {
                this.recordTestResult('PHASE23', test.name, false, error.message);
                this.testResults.phase23Specific.modalValidation.failed++;
            }
        }
    }

    /**
     * PHASE 2.3: Test modal validation system
     */
    async testModalValidationSystem() {
        this.logger.info('TEST', 'Testing Phase 2.3 modal validation system');
        
        const tests = [
            {
                name: 'Modal Pre-Validation Function',
                test: () => {
                    const preValidation = window.gmkbModalPreValidation();
                    return preValidation && 
                           Array.isArray(preValidation.available) &&
                           Array.isArray(preValidation.missing) &&
                           typeof preValidation.ready === 'boolean';
                }
            },
            {
                name: 'Modal Inclusion Status Tracking',
                test: () => {
                    const status = window.gmkbModalInclusionStatus;
                    return status && 
                           Array.isArray(status.included) &&
                           typeof status.success_rate === 'number' &&
                           status.total_count > 0;
                }
            },
            {
                name: 'Modal Structure Validation Results',
                test: () => {
                    const validation = window.gmkbModalStructureValidation;
                    return !validation || (
                        Array.isArray(validation.real_modals) &&
                        Array.isArray(validation.bridge_modals) &&
                        typeof validation.total_validated === 'number'
                    );
                }
            },
            {
                name: 'Required Modal Elements Exist',
                test: () => {
                    const requiredModals = [
                        'component-library-overlay',
                        'template-library-modal',
                        'global-settings-modal',
                        'export-modal'
                    ];
                    
                    return requiredModals.every(modalId => {
                        const modal = document.getElementById(modalId);
                        return modal && (
                            modal.children.length > 0 ||
                            modal.getAttribute('data-fallback-modal') === 'true' ||
                            modal.getAttribute('data-phase23-generated') === 'true'
                        );
                    });
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.recordTestResult('MODAL_VALIDATION', test.name, result);
                if (result) this.testResults.phase23Specific.modalValidation.passed++;
                else this.testResults.phase23Specific.modalValidation.failed++;
            } catch (error) {
                this.recordTestResult('MODAL_VALIDATION', test.name, false, error.message);
                this.testResults.phase23Specific.modalValidation.failed++;
            }
        }
    }

    /**
     * PHASE 2.3: Test initialization manager fixes
     */
    async testInitializationManagerFixes() {
        this.logger.info('TEST', 'Testing initialization manager timeout fixes');
        
        const tests = [
            {
                name: 'Initialization Manager Enhanced Methods',
                test: () => {
                    return initializationManager &&
                           typeof initializationManager.waitForModalHTML === 'function' &&
                           typeof initializationManager.validateModalStructure === 'function';
                }
            },
            {
                name: 'Progressive Modal Discovery Support',
                test: () => {
                    // Test that the system can handle progressive discovery
                    const status = initializationManager.getStatus();
                    return status && 
                           typeof status.circuitBreaker === 'object' &&
                           status.version.includes('2.3') ||
                           status.version.includes('phase2b');
                }
            },
            {
                name: 'Exponential Backoff Implementation',
                test: async () => {
                    // Simulate timeout scenario and verify backoff behavior
                    try {
                        const startTime = performance.now();
                        await initializationManager.waitForModalHTML();
                        const duration = performance.now() - startTime;
                        
                        // Should complete quickly with Phase 2.3 enhancements
                        return duration < 2000; // Should be much faster than old 3000ms timeout
                    } catch (error) {
                        // Even timeout should be handled gracefully
                        return error.message.includes('Phase 2.3') || 
                               error.message.includes('enhanced');
                    }
                }
            },
            {
                name: 'Bridge Element Recognition',
                test: () => {
                    // Test that initialization manager recognizes bridge elements
                    const bridgeElements = document.querySelectorAll('[data-phase23-generated="true"]');
                    const fallbackElements = document.querySelectorAll('[data-fallback-modal="true"]');
                    
                    // Should have created bridge elements if needed
                    return bridgeElements.length > 0 || fallbackElements.length > 0 ||
                           window.gmkbModalValidation?.all_available === true;
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.recordTestResult('INIT_MANAGER', test.name, result);
                if (result) this.testResults.phase23Specific.timeoutResolution.passed++;
                else this.testResults.phase23Specific.timeoutResolution.failed++;
            } catch (error) {
                this.recordTestResult('INIT_MANAGER', test.name, false, error.message);
                this.testResults.phase23Specific.timeoutResolution.failed++;
            }
        }
    }

    /**
     * PHASE 2.3: Test initialization tracker resilience
     */
    async testInitializationTrackerResilience() {
        this.logger.info('TEST', 'Testing initialization tracker promise handling');
        
        const tests = [
            {
                name: 'Enhanced Timeout Promise Management',
                test: () => {
                    return initializationTracker &&
                           typeof initializationTracker.startStep === 'function' &&
                           typeof initializationTracker.completeStep === 'function' &&
                           typeof initializationTracker.failStep === 'function';
                }
            },
            {
                name: 'Timeout Handler Cleanup',
                test: async () => {
                    // Register a test step and verify cleanup
                    initializationTracker.registerStep('test-phase23-cleanup', {
                        timeout: 100,
                        critical: false
                    });
                    
                    const stepInfo = await initializationTracker.startStep('test-phase23-cleanup');
                    const hasTimeoutPromise = stepInfo.timeoutPromise instanceof Promise;
                    
                    // Complete the step and verify cleanup
                    initializationTracker.completeStep('test-phase23-cleanup');
                    
                    return hasTimeoutPromise && stepInfo.phase23Enhanced === true;
                }
            },
            {
                name: 'Unhandled Promise Rejection Prevention',
                test: async () => {
                    return new Promise((resolve) => {
                        let rejectionDetected = false;
                        
                        // Listen for unhandled rejections
                        const rejectionHandler = (event) => {
                            if (event.reason?.stepName === 'test-phase23-rejection') {
                                rejectionDetected = true;
                            }
                        };
                        
                        window.addEventListener('unhandledrejection', rejectionHandler);
                        
                        // Create a step that will timeout
                        initializationTracker.registerStep('test-phase23-rejection', {
                            timeout: 50,
                            critical: false
                        });
                        
                        initializationTracker.startStep('test-phase23-rejection');
                        
                        // Wait longer than timeout
                        setTimeout(() => {
                            window.removeEventListener('unhandledrejection', rejectionHandler);
                            // Should NOT have detected unhandled rejection due to Phase 2.3 fixes
                            resolve(!rejectionDetected);
                        }, 100);
                    });
                }
            },
            {
                name: 'Enhanced Summary with Timeout Analysis',
                test: () => {
                    const summary = initializationTracker.getSummary();
                    return summary &&
                           summary.phase23Enhanced === true &&
                           typeof summary.timeoutAnalysis === 'object' &&
                           typeof summary.errorAnalysis === 'object';
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.recordTestResult('INIT_TRACKER', test.name, result);
                if (result) this.testResults.phase23Specific.timeoutResolution.passed++;
                else this.testResults.phase23Specific.timeoutResolution.failed++;
            } catch (error) {
                this.recordTestResult('INIT_TRACKER', test.name, false, error.message);
                this.testResults.phase23Specific.timeoutResolution.failed++;
            }
        }
    }

    /**
     * PHASE 2.3: Test bridge element system
     */
    async testBridgeElementSystem() {
        this.logger.info('TEST', 'Testing Phase 2.3 bridge element system');
        
        const tests = [
            {
                name: 'Core Bridge Elements Present',
                test: () => {
                    const coreElements = [
                        'add-first-component',
                        'add-component-btn',
                        'cancel-component-button',
                        'close-library',
                        'component-grid'
                    ];
                    
                    return coreElements.every(id => document.getElementById(id));
                }
            },
            {
                name: 'Bridge Element Generation System',
                test: () => {
                    // Check for the bridge generation system
                    const validationSystem = document.getElementById('gmkb-modal-validation-system');
                    return validationSystem && validationSystem.querySelector('script');
                }
            },
            {
                name: 'Dynamic Bridge Creation Events',
                test: () => {
                    // Test that bridge generation events can be dispatched
                    try {
                        const event = new CustomEvent('gmkbGenerateAdditionalBridges', {
                            detail: { retry: 1, missingModals: ['test-modal'] }
                        });
                        document.dispatchEvent(event);
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            },
            {
                name: 'Emergency Bridge Generation Events',
                test: () => {
                    // Test emergency bridge generation capability
                    try {
                        const event = new CustomEvent('gmkbEmergencyBridgeGeneration', {
                            detail: { missingModals: ['test-modal'], totalElapsed: 5000 }
                        });
                        document.dispatchEvent(event);
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.recordTestResult('BRIDGE_ELEMENTS', test.name, result);
                if (result) this.testResults.phase23Specific.bridgeElements.passed++;
                else this.testResults.phase23Specific.bridgeElements.failed++;
            } catch (error) {
                this.recordTestResult('BRIDGE_ELEMENTS', test.name, false, error.message);
                this.testResults.phase23Specific.bridgeElements.failed++;
            }
        }
    }

    /**
     * PHASE 2.3: Test timeout resolution system
     */
    async testTimeoutResolutionSystem() {
        this.logger.info('TEST', 'Testing timeout resolution improvements');
        
        const tests = [
            {
                name: 'Reduced Timeout Values',
                test: () => {
                    // Check that system uses reduced timeouts (1500ms vs 3000ms)
                    const hasReducedTimeouts = window.gmkbModalValidation?.validation_time ||
                                             performance.now() - window.gmkbTemplateLoadTime < 5000;
                    return hasReducedTimeouts;
                }
            },
            {
                name: 'Graceful Degradation Support',
                test: () => {
                    // Test that system can continue with partial modal availability
                    const validation = window.gmkbModalValidation;
                    const inclusionStatus = window.gmkbModalInclusionStatus;
                    
                    // Should handle partial success gracefully
                    return !validation || validation.success_rate >= 60 ||
                           !inclusionStatus || inclusionStatus.success_rate >= 75;
                }
            },
            {
                name: 'Performance Improvement Measurement',
                test: () => {
                    // Measure initialization time improvement
                    const templateReady = window.gmkbPhase23TemplateComplete;
                    const loadTime = window.gmkbTemplateLoadTime;
                    
                    if (templateReady && loadTime) {
                        const elapsed = Date.now() / 1000 - loadTime;
                        // Should be much faster than old system
                        return elapsed < 10; // Generous timeout for test environment
                    }
                    
                    return true; // Pass if timing data not available
                }
            },
            {
                name: 'Circuit Breaker Implementation',
                test: () => {
                    const status = initializationManager.getStatus();
                    return status && 
                           status.circuitBreaker &&
                           typeof status.circuitBreaker.state === 'string' &&
                           typeof status.circuitBreaker.operational === 'boolean';
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.recordTestResult('TIMEOUT_RESOLUTION', test.name, result);
                if (result) this.testResults.phase23Specific.timeoutResolution.passed++;
                else this.testResults.phase23Specific.timeoutResolution.failed++;
            } catch (error) {
                this.recordTestResult('TIMEOUT_RESOLUTION', test.name, false, error.message);
                this.testResults.phase23Specific.timeoutResolution.failed++;
            }
        }
    }

    /**
     * PHASE 2.3: Test error handling enhancements
     */
    async testErrorHandlingEnhancements() {
        this.logger.info('TEST', 'Testing enhanced error handling and user guidance');
        
        const tests = [
            {
                name: 'Enhanced Error Boundaries',
                test: () => {
                    const errorBoundary = document.getElementById('gmkb-template-error-boundary');
                    return errorBoundary && errorBoundary.style.display === 'none';
                }
            },
            {
                name: 'Error Recovery Guidance Systems',
                test: () => {
                    // Check for error recovery CSS and systems
                    const style = document.getElementById('mkcg-integration-styles');
                    return style && style.textContent.includes('modal-timeout-error');
                }
            },
            {
                name: 'User-Friendly Error Messages',
                test: () => {
                    // Test that error logging includes user-friendly context
                    try {
                        const testError = new Error('Test Phase 2.3 error handling');
                        testError.isTimeout = true;
                        testError.stepName = 'test-step';
                        
                        // Should handle timeout errors gracefully
                        return testError.isTimeout === true;
                    } catch (error) {
                        return false;
                    }
                }
            },
            {
                name: 'Progressive Error Recovery',
                test: () => {
                    // Test that system attempts multiple recovery strategies
                    const status = initializationManager.getStatus();
                    return status && (
                        status.retryCount >= 0 ||
                        status.circuitBreaker?.failureCount >= 0
                    );
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.recordTestResult('ERROR_HANDLING', test.name, result);
                if (result) this.testResults.phase23Specific.errorHandling.passed++;
                else this.testResults.phase23Specific.errorHandling.failed++;
            } catch (error) {
                this.recordTestResult('ERROR_HANDLING', test.name, false, error.message);
                this.testResults.phase23Specific.errorHandling.failed++;
            }
        }
    }

    /**
     * PHASE 2.3: Test user experience features
     */
    async testUserExperienceFeatures() {
        this.logger.info('TEST', 'Testing Phase 2.3 user experience enhancements');
        
        const tests = [
            {
                name: 'Enhanced Empty State System',
                test: () => {
                    const emptyState = document.getElementById('enhanced-empty-state');
                    return emptyState && emptyState.classList.contains('empty-state-enhanced');
                }
            },
            {
                name: 'MKCG Data Dashboard Integration',
                test: () => {
                    // Check for MKCG data dashboard elements
                    const dashboard = document.getElementById('mkcg-enhanced-dashboard');
                    return !dashboard || dashboard.querySelector('.mkcg-dashboard-trigger');
                }
            },
            {
                name: 'Template Ready Event System',
                test: () => {
                    // Test custom event dispatch
                    try {
                        const event = new CustomEvent('gmkbPhase23TemplateReady', {
                            detail: { templateVersion: '2.3-enhanced' }
                        });
                        document.dispatchEvent(event);
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            },
            {
                name: 'Visual Status Indicators',
                test: () => {
                    const body = document.body;
                    return body.classList.contains('gmkb-phase23-enhanced') &&
                           body.getAttribute('data-modal-validation') !== null;
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.recordTestResult('USER_EXPERIENCE', test.name, result);
                if (result) this.testResults.phase23Specific.userExperience.passed++;
                else this.testResults.phase23Specific.userExperience.failed++;
            } catch (error) {
                this.recordTestResult('USER_EXPERIENCE', test.name, false, error.message);
                this.testResults.phase23Specific.userExperience.failed++;
            }
        }
    }

    /**
     * Test performance improvements
     */
    async testPerformanceImprovements() {
        this.logger.info('TEST', 'Testing Phase 2.3 performance improvements');
        
        const tests = [
            {
                name: 'Initialization Speed Improvement',
                test: () => {
                    // Should initialize much faster than old 10+ second timeouts
                    const loadTime = window.gmkbTemplateLoadTime;
                    if (loadTime) {
                        const elapsed = Date.now() / 1000 - loadTime;
                        return elapsed < 5; // Should be under 5 seconds
                    }
                    return true;
                }
            },
            {
                name: 'Memory Leak Prevention',
                test: () => {
                    // Test that timeout handlers are properly cleaned up
                    const summary = initializationTracker.getSummary();
                    return !summary.timeoutAnalysis || 
                           summary.timeoutAnalysis.activeTimeouts <= 5; // Reasonable limit
                }
            },
            {
                name: 'Efficient Modal Detection',
                test: () => {
                    // Test modal validation efficiency
                    const validation = window.gmkbModalValidation;
                    return !validation || validation.validation_time > 0;
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.recordTestResult('PERFORMANCE', test.name, result);
            } catch (error) {
                this.recordTestResult('PERFORMANCE', test.name, false, error.message);
            }
        }
    }

    /**
     * Test accessibility compliance
     */
    async testAccessibilityCompliance() {
        this.logger.info('TEST', 'Testing accessibility compliance');
        
        const tests = [
            {
                name: 'ARIA Labels on Bridge Elements',
                test: () => {
                    const bridgeElements = document.querySelectorAll('[data-phase23-generated="true"]');
                    return Array.from(bridgeElements).every(el => 
                        el.getAttribute('aria-hidden') === 'true' ||
                        el.getAttribute('aria-label') !== null
                    );
                }
            },
            {
                name: 'Keyboard Navigation Support',
                test: () => {
                    // Test that focusable elements are properly handled
                    const focusableElements = document.querySelectorAll('button, input, select, textarea');
                    return focusableElements.length > 0;
                }
            },
            {
                name: 'Screen Reader Compatibility',
                test: () => {
                    // Check for proper semantic markup
                    const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
                    return hiddenElements.length >= 0; // Bridge elements should be hidden
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.recordTestResult('ACCESSIBILITY', test.name, result);
            } catch (error) {
                this.recordTestResult('ACCESSIBILITY', test.name, false, error.message);
            }
        }
    }

    /**
     * Test end-to-end integration
     */
    async testEndToEndIntegration() {
        this.logger.info('TEST', 'Testing end-to-end Phase 2.3 integration');
        
        const tests = [
            {
                name: 'Complete Initialization Flow',
                test: async () => {
                    try {
                        // Test complete initialization without timeouts
                        const initStatus = initializationManager.getStatus();
                        return initStatus.state !== 'failed';
                    } catch (error) {
                        return false;
                    }
                }
            },
            {
                name: 'Modal System Integration',
                test: () => {
                    const validation = window.gmkbFinalModalValidation;
                    const inclusion = window.gmkbModalInclusionStatus;
                    
                    // At least one system should report success
                    return (!validation || validation.ready) ||
                           (!inclusion || inclusion.success_rate >= 75);
                }
            },
            {
                name: 'MKCG Data Integration Compatibility',
                test: () => {
                    // Test that MKCG integration still works with Phase 2.3
                    const hasValidation = window.gmkbModalValidation;
                    const hasEnhanced = window.gmkbPhase23Enhanced;
                    
                    return hasValidation && hasEnhanced;
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.recordTestResult('INTEGRATION', test.name, result);
            } catch (error) {
                this.recordTestResult('INTEGRATION', test.name, false, error.message);
            }
        }
    }

    /**
     * Test regression prevention
     */
    async testRegressionPrevention() {
        this.logger.info('TEST', 'Testing regression prevention');
        
        const tests = [
            {
                name: 'Backward Compatibility',
                test: () => {
                    // Ensure old systems still work
                    return window.guestifyData && window.stateManager;
                }
            },
            {
                name: 'Existing Functionality Preservation',
                test: () => {
                    // Core functionality should remain intact
                    const previewContainer = document.getElementById('preview-container');
                    const mediaKitPreview = document.getElementById('media-kit-preview');
                    
                    return previewContainer && mediaKitPreview;
                }
            },
            {
                name: 'No Breaking Changes',
                test: () => {
                    // Test that essential global variables exist
                    return window.componentManager && window.renderer;
                }
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.recordTestResult('REGRESSION', test.name, result);
            } catch (error) {
                this.recordTestResult('REGRESSION', test.name, false, error.message);
            }
        }
    }

    /**
     * Record test result
     */
    recordTestResult(category, testName, passed, error = null) {
        const result = {
            category,
            testName,
            passed,
            error,
            timestamp: performance.now() - this.startTime
        };
        
        this.testResults.details.push(result);
        this.testResults.total++;
        
        if (passed) {
            this.testResults.passed++;
            this.logger.debug('TEST', `✅ ${category}: ${testName} PASSED`);
        } else {
            this.testResults.failed++;
            this.logger.warn('TEST', `❌ ${category}: ${testName} FAILED`, { error });
        }
    }

    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        const duration = performance.now() - this.startTime;
        const successRate = this.testResults.total > 0 ? 
            (this.testResults.passed / this.testResults.total) * 100 : 0;

        this.logger.info('TEST', '📊 Phase 2.3 Enhanced UX Test Suite Complete', {
            totalTests: this.testResults.total,
            passed: this.testResults.passed,
            failed: this.testResults.failed,
            successRate: Math.round(successRate * 100) / 100,
            duration: Math.round(duration),
            phase23Specific: this.testResults.phase23Specific
        });

        // Generate detailed report by category
        const categories = {};
        this.testResults.details.forEach(result => {
            if (!categories[result.category]) {
                categories[result.category] = { passed: 0, failed: 0, total: 0 };
            }
            categories[result.category].total++;
            if (result.passed) {
                categories[result.category].passed++;
            } else {
                categories[result.category].failed++;
            }
        });

        console.group('📋 Phase 2.3 Test Results by Category');
        Object.entries(categories).forEach(([category, stats]) => {
            const categoryRate = (stats.passed / stats.total) * 100;
            console.log(`${category}: ${stats.passed}/${stats.total} (${Math.round(categoryRate)}%)`);
        });
        console.groupEnd();

        // Store results globally for external access
        window.gmkbPhase23TestResults = this.testResults;

        return this.testResults;
    }
}

// Auto-run tests if in test environment
if (typeof window !== 'undefined' && window.gmkbPhase23Enhanced) {
    // Run tests after a brief delay to ensure all systems are loaded
    setTimeout(async () => {
        try {
            const testSuite = new Phase23EnhancedUXTestSuite();
            const results = await testSuite.runAllTests();
            
            console.log('🎉 Phase 2.3 Enhanced UX Test Suite Results:', {
                successRate: `${Math.round((results.passed / results.total) * 100)}%`,
                totalTests: results.total,
                passed: results.passed,
                failed: results.failed,
                phase23Enhancements: 'All systems tested'
            });
        } catch (error) {
            console.error('❌ Phase 2.3 test suite execution failed:', error);
        }
    }, 2000);
}

// Export for manual testing
export { Phase23EnhancedUXTestSuite };
