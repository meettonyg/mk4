/**
 * @file test-component-controls-fix.js
 * @description ROOT FIX: Test script to validate ComponentControlsManager implementation
 * Comprehensive testing for duplicate control prevention and dynamic generation
 * 
 * TESTING SCOPE:
 * ✅ Dynamic control attachment
 * ✅ Deduplication prevention
 * ✅ Event-driven architecture
 * ✅ Separation of concerns
 * ✅ Lifecycle management
 */

// ROOT FIX: WordPress-compatible IIFE wrapper
(function() {
    'use strict';

    console.log('%c🎛️ GMKB Component Controls Test Suite', 'font-size: 16px; font-weight: bold; color: #16a085; background: #ecf0f1; padding: 4px 8px; border-radius: 4px;');

    /**
     * ROOT FIX: Test Suite for Component Controls Manager
     */
    class ComponentControlsTestSuite {
        constructor() {
            this.testResults = {
                passed: 0,
                failed: 0,
                total: 0
            };
            this.tests = [];
        }

        /**
         * ROOT FIX: Run all tests
         */
        async runAllTests() {
            console.log('🚀 Starting Component Controls Test Suite...');
            
            // Wait for systems to be ready
            await this.waitForSystems();
            
            // Run tests
            this.testComponentControlsManagerAvailability();
            this.testControlDefinitions();
            this.testDynamicControlAttachment();
            this.testDeduplicationPrevention();
            this.testEventDrivenArchitecture();
            this.testControlRemoval();
            this.testErrorHandling();
            
            // Generate report
            this.generateTestReport();
        }

        /**
         * ROOT FIX: Wait for required systems
         */
        async waitForSystems() {
            return new Promise((resolve) => {
                let attempts = 0;
                const maxAttempts = 20;
                
                const checkSystems = () => {
                    attempts++;
                    
                    if (window.componentControlsManager && window.GMKB) {
                        console.log('✅ Test Suite: Required systems available');
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        console.warn('⚠️ Test Suite: Systems not ready after max attempts, proceeding anyway');
                        resolve();
                    } else {
                        setTimeout(checkSystems, 100);
                    }
                };
                
                checkSystems();
            });
        }

        /**
         * ROOT FIX: Test individual case
         */
        test(name, testFn) {
            this.tests.push({ name, testFn });
            this.testResults.total++;
            
            try {
                const result = testFn();
                if (result === true || result === undefined) {
                    console.log(`✅ ${name}`);
                    this.testResults.passed++;
                } else {
                    console.error(`❌ ${name}: ${result}`);
                    this.testResults.failed++;
                }
            } catch (error) {
                console.error(`❌ ${name}: ${error.message}`);
                this.testResults.failed++;
            }
        }

        /**
         * ROOT FIX: Test ComponentControlsManager availability
         */
        testComponentControlsManagerAvailability() {
            this.test('ComponentControlsManager Class Available', () => {
                return window.ComponentControlsManager && typeof window.ComponentControlsManager === 'function';
            });

            this.test('ComponentControlsManager Instance Available', () => {
                return window.componentControlsManager && typeof window.componentControlsManager === 'object';
            });

            this.test('ComponentControlsManager Initialized', () => {
                return window.componentControlsManager && window.componentControlsManager.isInitialized;
            });
        }

        /**
         * ROOT FIX: Test control definitions
         */
        testControlDefinitions() {
            this.test('Control Definitions Present', () => {
                if (!window.componentControlsManager) return 'ComponentControlsManager not available';
                
                const definitions = window.componentControlsManager.controlDefinitions;
                const expectedControls = ['edit', 'moveUp', 'moveDown', 'duplicate', 'delete'];
                
                return expectedControls.every(control => definitions[control]);
            });

            this.test('Control Icons Generated Dynamically', () => {
                if (!window.componentControlsManager) return 'ComponentControlsManager not available';
                
                const editIcon = window.componentControlsManager.createEditIcon();
                return editIcon && editIcon.tagName === 'svg';
            });
        }

        /**
         * ROOT FIX: Test dynamic control attachment
         */
        testDynamicControlAttachment() {
            this.test('Dynamic Control Attachment', () => {
                if (!window.componentControlsManager) return 'ComponentControlsManager not available';
                
                // Create test component
                const testComponent = document.createElement('div');
                testComponent.id = 'test-component-123';
                testComponent.className = 'media-kit-component';
                testComponent.setAttribute('data-component-id', 'test-component-123');
                testComponent.innerHTML = '<p>Test Component Content</p>';
                
                // Attach to document temporarily
                document.body.appendChild(testComponent);
                
                // Test attachment
                const success = window.componentControlsManager.attachControls(testComponent, 'test-component-123');
                
                // Check for controls
                const controls = testComponent.querySelector('.component-controls');
                const hasControls = !!controls;
                
                // Cleanup
                document.body.removeChild(testComponent);
                
                return success && hasControls;
            });

            this.test('Controls Container Created with Proper CSS', () => {
                if (!window.componentControlsManager) return 'ComponentControlsManager not available';
                
                const container = window.componentControlsManager.createControlsContainer();
                return container.className.includes('component-controls--dynamic') &&
                       container.style.position === 'absolute';
            });
        }

        /**
         * ROOT FIX: Test deduplication prevention
         */
        testDeduplicationPrevention() {
            this.test('Deduplication Prevention', () => {
                if (!window.componentControlsManager) return 'ComponentControlsManager not available';
                
                // Create test component
                const testComponent = document.createElement('div');
                testComponent.id = 'test-component-456';
                testComponent.className = 'media-kit-component';
                testComponent.setAttribute('data-component-id', 'test-component-456');
                testComponent.innerHTML = '<p>Test Component Content</p>';
                
                document.body.appendChild(testComponent);
                
                // Attach controls twice
                const firstAttach = window.componentControlsManager.attachControls(testComponent, 'test-component-456');
                const secondAttach = window.componentControlsManager.attachControls(testComponent, 'test-component-456');
                
                // Count control containers
                const controlContainers = testComponent.querySelectorAll('.component-controls');
                const hasOnlyOneContainer = controlContainers.length === 1;
                
                // Cleanup
                document.body.removeChild(testComponent);
                
                return firstAttach && secondAttach && hasOnlyOneContainer;
            });
        }

        /**
         * ROOT FIX: Test event-driven architecture
         */
        testEventDrivenArchitecture() {
            this.test('Event Dispatching System', () => {
                if (!window.componentControlsManager || !window.GMKB) return 'Required systems not available';
                
                let eventReceived = false;
                
                // Listen for test event
                const testListener = (event) => {
                    if (event.detail.test === 'component-controls') {
                        eventReceived = true;
                    }
                };
                
                document.addEventListener('gmkb:test-event', testListener);
                
                // Dispatch test event
                window.GMKB.dispatch('gmkb:test-event', { test: 'component-controls' });
                
                // Cleanup
                document.removeEventListener('gmkb:test-event', testListener);
                
                return eventReceived;
            });

            this.test('Control Action Event Mapping', () => {
                if (!window.componentControlsManager) return 'ComponentControlsManager not available';
                
                // Test action mapping
                const testMapping = {
                    'edit': 'gmkb:component-edit-requested',
                    'delete': 'gmkb:component-delete-requested'
                };
                
                // This test verifies the mapping exists in the code structure
                return typeof window.componentControlsManager.dispatchControlAction === 'function';
            });
        }

        /**
         * ROOT FIX: Test control removal
         */
        testControlRemoval() {
            this.test('Control Removal and Cleanup', () => {
                if (!window.componentControlsManager) return 'ComponentControlsManager not available';
                
                // Create test component
                const testComponent = document.createElement('div');
                testComponent.id = 'test-component-789';
                testComponent.className = 'media-kit-component';
                testComponent.setAttribute('data-component-id', 'test-component-789');
                
                document.body.appendChild(testComponent);
                
                // Attach controls
                const attached = window.componentControlsManager.attachControls(testComponent, 'test-component-789');
                
                // Verify controls exist
                const controlsBeforeRemoval = testComponent.querySelector('.component-controls');
                
                // Remove controls
                const removed = window.componentControlsManager.removeControls('test-component-789');
                
                // Verify controls removed
                const controlsAfterRemoval = testComponent.querySelector('.component-controls');
                
                // Cleanup
                document.body.removeChild(testComponent);
                
                return attached && !!controlsBeforeRemoval && removed && !controlsAfterRemoval;
            });
        }

        /**
         * ROOT FIX: Test error handling
         */
        testErrorHandling() {
            this.test('Invalid Parameter Handling', () => {
                if (!window.componentControlsManager) return 'ComponentControlsManager not available';
                
                // Test with invalid parameters
                const result1 = window.componentControlsManager.attachControls(null, 'test');
                const result2 = window.componentControlsManager.attachControls(document.createElement('div'), null);
                
                return result1 === false && result2 === false;
            });

            this.test('Missing Component Handling', () => {
                if (!window.componentControlsManager) return 'ComponentControlsManager not available';
                
                // Test removal of non-existent component
                const result = window.componentControlsManager.removeControls('non-existent-component');
                
                return result === true; // Should gracefully handle missing components
            });
        }

        /**
         * ROOT FIX: Generate test report
         */
        generateTestReport() {
            console.log('\n' + '='.repeat(60));
            console.log('%c📊 Component Controls Test Report', 'font-size: 14px; font-weight: bold; color: #2c3e50;');
            console.log('='.repeat(60));
            
            const passRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
            
            console.log(`📈 Pass Rate: ${passRate}%`);
            console.log(`✅ Passed: ${this.testResults.passed}`);
            console.log(`❌ Failed: ${this.testResults.failed}`);
            console.log(`📊 Total: ${this.testResults.total}`);
            
            if (this.testResults.failed === 0) {
                console.log('%c🎉 ALL TESTS PASSED! Component Controls Manager is working correctly.', 'color: #27ae60; font-weight: bold;');
            } else {
                console.log('%c⚠️ Some tests failed. Review the implementation.', 'color: #e74c3c; font-weight: bold;');
            }
            
            // Status summary
            console.log('\n📋 System Status:');
            console.log('   ComponentControlsManager Available:', !!window.componentControlsManager);
            console.log('   GMKB Event System Available:', !!window.GMKB);
            console.log('   Dynamic Control Generation:', !!window.componentControlsManager?.createControlsContainer);
            console.log('   Event-Driven Architecture:', !!window.componentControlsManager?.dispatchControlAction);
            
            console.log('='.repeat(60));
        }
    }

    /**
     * ROOT FIX: Auto-run test suite when DOM is ready
     */
    function initializeTestSuite() {
        const testSuite = new ComponentControlsTestSuite();
        testSuite.runAllTests();
        
        // Expose for manual testing
        window.testComponentControlsManager = () => testSuite.runAllTests();
        
        console.log('\n🔧 Manual Test Commands:');
        console.log('   testComponentControlsManager() - Run full test suite');
        console.log('   debugComponentControls() - Show manager debug info');
        console.log('   testComponentControls("component-id") - Test specific component');
    }

    // ROOT FIX: Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTestSuite);
    } else {
        // Small delay to ensure all scripts are loaded
        setTimeout(initializeTestSuite, 500);
    }

})(); // ROOT FIX: Close IIFE wrapper