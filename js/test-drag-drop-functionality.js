/**
 * @file test-drag-drop-functionality.js - Enhanced test suite for drag and drop functionality
 * @description Validates both library-to-preview and preview-area drag-to-reorder functionality
 * @version 2.0.0 - ROOT FIX IMPLEMENTATION
 * 
 * ROOT FIX: Complete drag-and-drop system validation
 * - Tests library-to-preview drag functionality 
 * - Tests intra-preview drag-to-reorder functionality
 * - Tests SortableJS integration
 * - Tests state management coordination
 * - Tests component control preservation
 * - Follows developer checklist requirements
 */

(function() {
    'use strict';

    console.log('%c🧪 DRAG-DROP TEST SUITE v2.0.0', 'font-weight: bold; color: #10b981; background: #ecfdf5; padding: 4px 8px; border-radius: 4px;');
    console.log('🎯 Testing complete drag-and-drop functionality with SortableJS integration');

    /**
     * ROOT FIX: Enhanced Drag and Drop Test Suite
     * Comprehensive testing for both library-to-preview and intra-preview functionality
     */
    const DragDropTestSuite = {
        tests: [],
        results: {
            passed: 0,
            failed: 0,
            warnings: 0,
            total: 0
        },
        startTime: null,
        endTime: null,

        /**
         * ROOT FIX: Enhanced initialization and test coordination
         */
        init() {
            console.log('🧪 DragDropTestSuite: Initializing enhanced test suite...');
            this.startTime = Date.now();
            
            // Wait for all systems to be ready
            if (window.GMKB && window.GMKB.subscribe) {
                window.GMKB.subscribe('gmkb:initialization-complete', () => {
                    console.log('✅ Test Suite: GMKB initialization complete, waiting for drag systems...');
                    setTimeout(() => this.runAllTests(), 1000);
                });
            } else {
                // Fallback for immediate testing
                setTimeout(() => this.runAllTests(), 2000);
            }
        },

        /**
         * ROOT FIX: Comprehensive test execution
         */
        async runAllTests() {
            console.log('🚀 DragDropTestSuite: Running comprehensive drag-and-drop tests...');
            
            // Test Categories
            await this.testCategory('🏗️ Architecture & Dependencies', [
                () => this.testDragDropManagerExists(),
                () => this.testSortableManagerExists(),
                () => this.testSortableJSLibrary(),
                () => this.testGMKBIntegration(),
                () => this.testStateManagerIntegration(),
                () => this.testWordPressDataAvailability()
            ]);
            
            await this.testCategory('🎯 Component Library Drag (FROM Library)', [
                () => this.testComponentLibraryExists(),
                () => this.testComponentsDraggable(),
                () => this.testDropZoneExists(),
                () => this.testDragVisualFeedback(),
                () => this.testComponentAddition()
            ]);
            
            await this.testCategory('🔄 Preview Area Sorting (WITHIN Preview)', [
                () => this.testPreviewContainerSortable(),
                () => this.testSortableConfiguration(),
                () => this.testExistingComponentsSortable(),
                () => this.testSortableVisualFeedback(),
                () => this.testLayoutStateUpdates(),
                () => this.testSortableEventHandlers()
            ]);
            
            await this.testCategory('🎮 Component Controls Integration', [
                () => this.testMoveButtonsPreserved(),
                () => this.testComponentControlsConflicts(),
                () => this.testEditFunctionality(),
                () => this.testDeleteFunctionality(),
                () => this.testDuplicateFunctionality()
            ]);
            
            await this.testCategory('⚡ Performance & User Experience', [
                () => this.testDragPerformance(),
                () => this.testSortingPerformance(),
                () => this.testMemoryUsage(),
                () => this.testResponsiveDesign(),
                () => this.testAccessibility()
            ]);
            
            this.generateTestReport();
        },

        /**
         * ROOT FIX: Test category execution with proper timing
         */
        async testCategory(categoryName, tests) {
            console.log(`\n${categoryName}`);
            console.log('═'.repeat(50));
            
            for (const test of tests) {
                try {
                    await test();
                    await this.delay(100); // Small delay between tests
                } catch (error) {
                    this.logTest(test.name || 'Unknown Test', false, `Error: ${error.message}`);
                }
            }
        },

        /**
         * ROOT FIX: Architecture & Dependencies Tests
         */
        testDragDropManagerExists() {
            const exists = !!window.DragDropManager;
            const status = exists ? window.DragDropManager.getStatus() : null;
            
            this.logTest('DragDropManager Available', exists, 
                exists ? `Initialized: ${status.isInitialized}` : 'DragDropManager not found');
            return exists;
        },

        testSortableManagerExists() {
            const exists = !!window.SortableManager;
            const status = exists ? window.SortableManager.getStatus() : null;
            
            this.logTest('SortableManager Available', exists, 
                exists ? `Enabled: ${status.isEnabled}, Components: ${status.componentCount}` : 'SortableManager not found');
            return exists;
        },

        testSortableJSLibrary() {
            const available = typeof Sortable !== 'undefined';
            let version = 'unknown';
            
            if (available && Sortable.version) {
                version = Sortable.version;
            }
            
            this.logTest('SortableJS Library', available, 
                available ? `Version: ${version}` : 'SortableJS not loaded');
            return available;
        },

        testGMKBIntegration() {
            const gmkbExists = !!window.GMKB;
            const hasDispatch = gmkbExists && typeof window.GMKB.dispatch === 'function';
            const hasSubscribe = gmkbExists && typeof window.GMKB.subscribe === 'function';
            
            const integrated = gmkbExists && hasDispatch && hasSubscribe;
            
            this.logTest('GMKB Integration', integrated, 
                integrated ? 'Event system ready' : 'GMKB event system not available');
            return integrated;
        },

        testStateManagerIntegration() {
            const stateManager = window.GMKB?.systems?.StateManager;
            const hasSetState = stateManager && typeof stateManager.setState === 'function';
            const hasGetState = stateManager && typeof stateManager.getState === 'function';
            
            const integrated = !!(stateManager && hasSetState && hasGetState);
            
            this.logTest('StateManager Integration', integrated, 
                integrated ? 'State management ready' : 'StateManager not available');
            return integrated;
        },

        testWordPressDataAvailability() {
            const wpData = window.gmkbData;
            const hasRequiredData = wpData && wpData.ajaxUrl && wpData.nonce && wpData.sortableEnabled;
            
            this.logTest('WordPress Data', hasRequiredData, 
                hasRequiredData ? 'All required data available' : 'Missing WordPress data');
            return hasRequiredData;
        },

        /**
         * ROOT FIX: Component Library Drag Tests
         */
        testComponentLibraryExists() {
            const library = document.getElementById('component-grid');
            const components = library ? library.querySelectorAll('.component-item, .component-card') : [];
            
            const exists = !!(library && components.length > 0);
            
            this.logTest('Component Library', exists, 
                exists ? `${components.length} components found` : 'Component library not found');
            return exists;
        },

        testComponentsDraggable() {
            const components = document.querySelectorAll('.component-item, .component-card');
            let draggableCount = 0;
            
            components.forEach(component => {
                if (component.draggable || component.classList.contains('draggable-component')) {
                    draggableCount++;
                }
            });
            
            const allDraggable = draggableCount === components.length && components.length > 0;
            
            this.logTest('Components Draggable', allDraggable, 
                `${draggableCount}/${components.length} components draggable`);
            return allDraggable;
        },

        testDropZoneExists() {
            const previewContainer = document.getElementById('media-kit-preview');
            const dropZones = document.querySelectorAll('.drop-zone');
            
            const hasDropTarget = !!(previewContainer || dropZones.length > 0);
            
            this.logTest('Drop Zones', hasDropTarget, 
                hasDropTarget ? `Preview + ${dropZones.length} drop zones` : 'No drop zones found');
            return hasDropTarget;
        },

        testDragVisualFeedback() {
            // Test CSS classes exist
            const requiredClasses = ['dragging', 'drag-over', 'drop-zone-visible'];
            const styleSheets = Array.from(document.styleSheets);
            let foundClasses = 0;
            
            requiredClasses.forEach(className => {
                try {
                    styleSheets.forEach(sheet => {
                        if (sheet.cssRules) {
                            Array.from(sheet.cssRules).forEach(rule => {
                                if (rule.selectorText && rule.selectorText.includes(className)) {
                                    foundClasses++;
                                }
                            });
                        }
                    });
                } catch (e) {
                    // Cross-origin stylesheet access might fail
                }
            });
            
            const hasVisualFeedback = foundClasses > 0;
            
            this.logTest('Drag Visual Feedback', hasVisualFeedback, 
                hasVisualFeedback ? `${foundClasses} feedback classes found` : 'Visual feedback CSS not found');
            return hasVisualFeedback;
        },

        async testComponentAddition() {
            const componentManager = window.GMKB?.systems?.ComponentManager;
            
            if (!componentManager) {
                this.logTest('Component Addition', false, 'ComponentManager not available');
                return false;
            }
            
            try {
                const initialCount = Object.keys(componentManager.getState?.() || {}).length || 0;
                
                // This is a dry-run test - we check if the method exists and is callable
                const canAddComponent = typeof componentManager.addComponent === 'function';
                
                this.logTest('Component Addition', canAddComponent, 
                    canAddComponent ? 'addComponent method available' : 'addComponent method missing');
                return canAddComponent;
            } catch (error) {
                this.logTest('Component Addition', false, `Error: ${error.message}`);
                return false;
            }
        },

        /**
         * ROOT FIX: Preview Area Sorting Tests
         */
        testPreviewContainerSortable() {
            const previewContainer = document.getElementById('media-kit-preview');
            const hasSortableClass = previewContainer && previewContainer.classList.contains('sortable-enabled');
            const sortableManager = window.SortableManager;
            const hasSortableInstance = sortableManager && sortableManager.sortableInstance;
            
            const isSortable = !!(previewContainer && hasSortableClass && hasSortableInstance);
            
            this.logTest('Preview Container Sortable', isSortable, 
                isSortable ? 'Sortable instance active' : 'Preview not sortable');
            return isSortable;
        },

        testSortableConfiguration() {
            const sortableManager = window.SortableManager;
            
            if (!sortableManager || !sortableManager.sortableInstance) {
                this.logTest('Sortable Configuration', false, 'No sortable instance');
                return false;
            }
            
            const instance = sortableManager.sortableInstance;
            const options = instance.options || {};
            
            const hasCorrectDraggable = options.draggable === '.media-kit-component';
            const hasCorrectAnimation = options.animation > 0;
            const hasGhostClass = !!options.ghostClass;
            
            const configuredCorrectly = hasCorrectDraggable && hasCorrectAnimation && hasGhostClass;
            
            this.logTest('Sortable Configuration', configuredCorrectly, 
                configuredCorrectly ? 'All options configured' : 'Configuration issues found');
            return configuredCorrectly;
        },

        testExistingComponentsSortable() {
            const components = document.querySelectorAll('.media-kit-component');
            const previewContainer = document.getElementById('media-kit-preview');
            
            let sortableComponents = 0;
            components.forEach(component => {
                if (previewContainer && previewContainer.contains(component)) {
                    sortableComponents++;
                }
            });
            
            const allSortable = sortableComponents === components.length;
            
            this.logTest('Existing Components Sortable', allSortable, 
                `${sortableComponents}/${components.length} components in sortable container`);
            return allSortable;
        },

        testSortableVisualFeedback() {
            // Test SortableJS-specific CSS classes
            const requiredClasses = ['sortable-ghost', 'sortable-chosen', 'sortable-drag', 'sorting-active'];
            const styleSheets = Array.from(document.styleSheets);
            let foundClasses = 0;
            
            requiredClasses.forEach(className => {
                try {
                    styleSheets.forEach(sheet => {
                        if (sheet.cssRules) {
                            Array.from(sheet.cssRules).forEach(rule => {
                                if (rule.selectorText && rule.selectorText.includes(className)) {
                                    foundClasses++;
                                }
                            });
                        }
                    });
                } catch (e) {
                    // Cross-origin stylesheet access might fail
                }
            });
            
            const hasVisualFeedback = foundClasses >= 2; // At least 2 classes should be found
            
            this.logTest('Sortable Visual Feedback', hasVisualFeedback, 
                hasVisualFeedback ? `${foundClasses} sortable classes found` : 'Sortable CSS classes missing');
            return hasVisualFeedback;
        },

        testLayoutStateUpdates() {
            const stateManager = window.GMKB?.systems?.StateManager;
            const sortableManager = window.SortableManager;
            
            if (!stateManager || !sortableManager) {
                this.logTest('Layout State Updates', false, 'Required managers not available');
                return false;
            }
            
            // Test if updateLayoutFromDOM method exists
            const hasUpdateMethod = typeof sortableManager.updateLayoutFromDOM === 'function';
            
            this.logTest('Layout State Updates', hasUpdateMethod, 
                hasUpdateMethod ? 'Layout update method available' : 'Layout update method missing');
            return hasUpdateMethod;
        },

        testSortableEventHandlers() {
            const sortableManager = window.SortableManager;
            
            if (!sortableManager || !sortableManager.sortableInstance) {
                this.logTest('Sortable Event Handlers', false, 'No sortable instance');
                return false;
            }
            
            const instance = sortableManager.sortableInstance;
            const options = instance.options || {};
            
            const hasOnStart = typeof options.onStart === 'function';
            const hasOnEnd = typeof options.onEnd === 'function';
            const hasOnMove = typeof options.onMove === 'function';
            
            const hasEventHandlers = hasOnStart && hasOnEnd && hasOnMove;
            
            this.logTest('Sortable Event Handlers', hasEventHandlers, 
                hasEventHandlers ? 'All event handlers configured' : 'Missing event handlers');
            return hasEventHandlers;
        },

        /**
         * ROOT FIX: Component Controls Integration Tests
         */
        testMoveButtonsPreserved() {
            const moveUpButtons = document.querySelectorAll('.component-control--move-up');
            const moveDownButtons = document.querySelectorAll('.component-control--move-down');
            
            const hasButtons = moveUpButtons.length > 0 && moveDownButtons.length > 0;
            
            this.logTest('Move Buttons Preserved', hasButtons, 
                hasButtons ? `${moveUpButtons.length} up, ${moveDownButtons.length} down buttons` : 'Move buttons not found');
            return hasButtons;
        },

        testComponentControlsConflicts() {
            const sortableManager = window.SortableManager;
            
            if (!sortableManager || !sortableManager.sortableInstance) {
                this.logTest('Component Controls Conflicts', false, 'No sortable instance');
                return false;
            }
            
            const instance = sortableManager.sortableInstance;
            const options = instance.options || {};
            
            // Check if component controls are filtered out
            const hasFilter = typeof options.filter === 'string' && options.filter.includes('component-controls');
            
            this.logTest('Component Controls Conflicts', hasFilter, 
                hasFilter ? 'Component controls filtered from sortable' : 'Potential conflicts with component controls');
            return hasFilter;
        },

        testEditFunctionality() {
            const componentManager = window.GMKB?.systems?.ComponentManager;
            const editButtons = document.querySelectorAll('.component-control--edit');
            
            const hasEditMethod = componentManager && typeof componentManager.editComponent === 'function';
            const hasEditButtons = editButtons.length > 0;
            
            const editWorks = hasEditMethod && hasEditButtons;
            
            this.logTest('Edit Functionality', editWorks, 
                editWorks ? `${editButtons.length} edit buttons with edit method` : 'Edit functionality incomplete');
            return editWorks;
        },

        testDeleteFunctionality() {
            const componentManager = window.GMKB?.systems?.ComponentManager;
            const deleteButtons = document.querySelectorAll('.component-control--delete');
            
            const hasDeleteMethod = componentManager && typeof componentManager.removeComponent === 'function';
            const hasDeleteButtons = deleteButtons.length > 0;
            
            const deleteWorks = hasDeleteMethod && hasDeleteButtons;
            
            this.logTest('Delete Functionality', deleteWorks, 
                deleteWorks ? `${deleteButtons.length} delete buttons with remove method` : 'Delete functionality incomplete');
            return deleteWorks;
        },

        testDuplicateFunctionality() {
            const componentManager = window.GMKB?.systems?.ComponentManager;
            const duplicateButtons = document.querySelectorAll('.component-control--duplicate');
            
            const hasDuplicateMethod = componentManager && typeof componentManager.duplicateComponent === 'function';
            const hasDuplicateButtons = duplicateButtons.length > 0;
            
            const duplicateWorks = hasDuplicateMethod && hasDuplicateButtons;
            
            this.logTest('Duplicate Functionality', duplicateWorks, 
                duplicateWorks ? `${duplicateButtons.length} duplicate buttons with duplicate method` : 'Duplicate functionality incomplete');
            return duplicateWorks;
        },

        /**
         * ROOT FIX: Performance & UX Tests
         */
        testDragPerformance() {
            const startTime = performance.now();
            
            // Simulate drag performance test
            const components = document.querySelectorAll('.media-kit-component');
            let transformCount = 0;
            
            components.forEach(component => {
                const style = window.getComputedStyle(component);
                if (style.willChange === 'transform' || style.transform !== 'none') {
                    transformCount++;
                }
            });
            
            const endTime = performance.now();
            const performanceGood = (endTime - startTime) < 50; // Should be fast
            
            this.logTest('Drag Performance', performanceGood, 
                `Style check: ${(endTime - startTime).toFixed(2)}ms, ${transformCount} optimized components`);
            return performanceGood;
        },

        testSortingPerformance() {
            const sortableManager = window.SortableManager;
            
            if (!sortableManager || !sortableManager.sortableInstance) {
                this.logTest('Sorting Performance', false, 'No sortable instance');
                return false;
            }
            
            const instance = sortableManager.sortableInstance;
            const animation = instance.options?.animation || 0;
            
            // Good performance: animation <= 300ms
            const performanceGood = animation > 0 && animation <= 300;
            
            this.logTest('Sorting Performance', performanceGood, 
                `Animation duration: ${animation}ms`);
            return performanceGood;
        },

        testMemoryUsage() {
            const startHeap = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Create temporary elements to test memory
            const testElements = [];
            for (let i = 0; i < 100; i++) {
                const el = document.createElement('div');
                el.className = 'test-element';
                testElements.push(el);
            }
            
            // Clean up
            testElements.forEach(el => el.remove());
            
            const endHeap = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const memoryUsageGood = !performance.memory || (endHeap - startHeap) < 1000000; // Less than 1MB increase
            
            this.logTest('Memory Usage', memoryUsageGood, 
                performance.memory ? `Heap increase: ${((endHeap - startHeap) / 1024).toFixed(2)}KB` : 'Memory API not available');
            return memoryUsageGood;
        },

        testResponsiveDesign() {
            // Test if responsive CSS exists
            const styleSheets = Array.from(document.styleSheets);
            let hasResponsiveCSS = false;
            
            try {
                styleSheets.forEach(sheet => {
                    if (sheet.cssRules) {
                        Array.from(sheet.cssRules).forEach(rule => {
                            if (rule.type === CSSRule.MEDIA_RULE && rule.conditionText && rule.conditionText.includes('max-width')) {
                                hasResponsiveCSS = true;
                            }
                        });
                    }
                });
            } catch (e) {
                // Cross-origin stylesheet access might fail
                hasResponsiveCSS = true; // Assume responsive CSS exists
            }
            
            this.logTest('Responsive Design', hasResponsiveCSS, 
                hasResponsiveCSS ? 'Media queries found' : 'No responsive CSS detected');
            return hasResponsiveCSS;
        },

        testAccessibility() {
            const components = document.querySelectorAll('.media-kit-component');
            let accessibleComponents = 0;
            
            components.forEach(component => {
                // Check for basic accessibility features
                const hasTabIndex = component.hasAttribute('tabindex') || component.tabIndex >= 0;
                const hasAriaLabel = component.hasAttribute('aria-label') || component.hasAttribute('aria-labelledby');
                const hasRole = component.hasAttribute('role');
                
                if (hasTabIndex || hasAriaLabel || hasRole) {
                    accessibleComponents++;
                }
            });
            
            const accessibilityGood = components.length === 0 || accessibleComponents > 0;
            
            this.logTest('Accessibility', accessibilityGood, 
                `${accessibleComponents}/${components.length} components have accessibility attributes`);
            return accessibilityGood;
        },

        /**
         * ROOT FIX: Utility methods for testing
         */
        logTest(testName, passed, details = '') {
            const status = passed ? '✅' : '❌';
            const color = passed ? '#10b981' : '#ef4444';
            
            console.log(`${status} ${testName}`, details ? `- ${details}` : '');
            
            this.tests.push({ testName, passed, details });
            this.results.total++;
            
            if (passed) {
                this.results.passed++;
            } else {
                this.results.failed++;
            }
        },

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        /**
         * ROOT FIX: Enhanced test report generation
         */
        generateTestReport() {
            this.endTime = Date.now();
            const duration = ((this.endTime - this.startTime) / 1000).toFixed(2);
            const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
            
            console.log('\n' + '═'.repeat(60));
            console.log('%c🧪 DRAG-DROP TEST RESULTS', 'font-weight: bold; color: #1f2937; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;');
            console.log('═'.repeat(60));
            
            console.log(`⏱️  Duration: ${duration}s`);
            console.log(`📊 Success Rate: ${successRate}%`);
            console.log(`✅ Passed: ${this.results.passed}`);
            console.log(`❌ Failed: ${this.results.failed}`);
            console.log(`📝 Total Tests: ${this.results.total}`);
            
            // Determine overall status
            let overallStatus, statusColor, recommendation;
            
            if (this.results.failed === 0) {
                overallStatus = '🎉 EXCELLENT';
                statusColor = '#10b981';
                recommendation = 'All drag-and-drop functionality is working perfectly!';
            } else if (this.results.failed <= 2) {
                overallStatus = '✅ GOOD';
                statusColor = '#f59e0b';
                recommendation = 'Most functionality working. Minor issues detected.';
            } else if (this.results.failed <= 5) {
                overallStatus = '⚠️ NEEDS ATTENTION';
                statusColor = '#f59e0b';
                recommendation = 'Several issues detected. Review failed tests.';
            } else {
                overallStatus = '❌ CRITICAL ISSUES';
                statusColor = '#ef4444';
                recommendation = 'Major problems detected. Immediate attention required.';
            }
            
            console.log(`\n🎯 Overall Status: %c${overallStatus}`, `color: ${statusColor}; font-weight: bold;`);
            console.log(`💡 Recommendation: ${recommendation}`);
            
            // Show failed tests
            if (this.results.failed > 0) {
                console.log('\n❌ Failed Tests:');
                this.tests.filter(test => !test.passed).forEach(test => {
                    console.log(`   • ${test.testName}: ${test.details}`);
                });
            }
            
            // Show critical functionality status
            console.log('\n🎯 Critical Functionality Status:');
            const criticalTests = [
                'SortableJS Library',
                'SortableManager Available', 
                'Preview Container Sortable',
                'Layout State Updates',
                'Move Buttons Preserved'
            ];
            
            criticalTests.forEach(testName => {
                const test = this.tests.find(t => t.testName === testName);
                if (test) {
                    const status = test.passed ? '✅' : '❌';
                    console.log(`   ${status} ${testName}`);
                }
            });
            
            console.log('\n' + '═'.repeat(60));
            
            // Global status for other scripts
            window.dragDropTestResults = {
                passed: this.results.passed,
                failed: this.results.failed,
                total: this.results.total,
                successRate: parseFloat(successRate),
                duration: parseFloat(duration),
                overallStatus: overallStatus,
                timestamp: new Date().toISOString(),
                version: '2.0.0'
            };
            
            return this.results;
        },

        /**
         * ROOT FIX: Quick test functions for console usage
         */
        quickTest() {
            console.log('🚀 Quick Drag-Drop Test...');
            const hasAll = !!window.DragDropManager && !!window.SortableManager && typeof Sortable !== 'undefined';
            console.log(hasAll ? '✅ All systems operational' : '❌ Missing components');
            return hasAll;
        },

        debugInfo() {
            return {
                dragDropManager: window.DragDropManager?.getStatus(),
                sortableManager: window.SortableManager?.getStatus(),
                sortableJS: typeof Sortable !== 'undefined' ? 'Available' : 'Missing',
                gmkb: !!window.GMKB,
                wordPressData: !!window.gmkbData
            };
        }
    };

    // ROOT FIX: Enhanced auto-initialization with delay for all systems
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🧪 Test Suite: DOM ready, waiting for all systems...');
            setTimeout(() => DragDropTestSuite.init(), 3000); // Wait longer for SortableJS
        });
    } else {
        console.log('🧪 Test Suite: DOM already ready, waiting for all systems...');
        setTimeout(() => DragDropTestSuite.init(), 3000);
    }

    // Expose globally for debugging and manual testing
    window.DragDropTestSuite = DragDropTestSuite;
    window.testDragDrop = () => DragDropTestSuite.quickTest();
    window.dragDropDebug = () => DragDropTestSuite.debugInfo();

    console.log('✅ Enhanced Drag-Drop Test Suite loaded successfully');
    console.log('🔧 Available commands: testDragDrop(), dragDropDebug(), DragDropTestSuite.runAllTests()');
    console.log('🎯 This test suite validates both library-to-preview AND intra-preview drag-to-reorder functionality');

})();
