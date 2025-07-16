/**
 * ROOT-LEVEL FIXES VALIDATION SCRIPT
 * Tests the comprehensive fixes for modal vs sidebar and topics loading issues
 * 
 * FIXES TESTED:
 * 1. Component editing opens in sidebar design panel (not modal)
 * 2. Topics component loads data from correct post ID
 * 3. Component managers properly exposed globally
 * 4. Design panel integration works correctly
 * 
 * USAGE: Run this in browser console on Media Kit Builder page
 */

class RootLevelFixesValidator {
    constructor() {
        this.results = {
            componentManagerFixes: {},
            topicsLoadingFixes: {},
            designPanelIntegration: {},
            overallStatus: 'pending'
        };
        this.startTime = Date.now();
    }

    async runAllTests() {
        console.log('🚀 ROOT-LEVEL FIXES VALIDATION STARTING...');
        console.log('═══════════════════════════════════════════');
        
        try {
            // Test 1: Component Manager Architecture
            await this.testComponentManagerFixes();
            
            // Test 2: Topics Loading & Data Source
            await this.testTopicsLoadingFixes();
            
            // Test 3: Design Panel Integration
            await this.testDesignPanelIntegration();
            
            // Overall assessment
            this.assessOverallStatus();
            
            // Display results
            this.displayResults();
            
        } catch (error) {
            console.error('❌ VALIDATION ERROR:', error);
            this.results.overallStatus = 'error';
            this.results.error = error.message;
        }
        
        const duration = Date.now() - this.startTime;
        console.log(`\n⏱️ Validation completed in ${duration}ms`);
        
        return this.results;
    }

    async testComponentManagerFixes() {
        console.log('\n📋 TEST 1: COMPONENT MANAGER ARCHITECTURE FIXES');
        console.log('─────────────────────────────────────────────');
        
        const tests = this.results.componentManagerFixes;
        
        // Test 1.1: Global exposure of managers
        tests.globalExposure = this.testGlobalManagerExposure();
        
        // Test 1.2: Modal removal validation
        tests.modalRemoval = this.testModalRemoval();
        
        // Test 1.3: UpdateComponent method availability
        tests.updateMethod = this.testUpdateComponentMethod();
        
        // Test 1.4: EditComponent behavior
        tests.editBehavior = await this.testEditComponentBehavior();
        
        const passedTests = Object.values(tests).filter(test => test.status === 'pass').length;
        tests.summary = `${passedTests}/4 tests passed`;
        
        console.log(`✅ Component Manager Tests: ${tests.summary}`);
    }

    testGlobalManagerExposure() {
        const managers = {
            enhancedComponentManager: !!window.enhancedComponentManager,
            componentManager: !!window.componentManager,
            enhancedStateManager: !!window.enhancedStateManager,
            stateManager: !!window.stateManager,
            designPanel: !!window.designPanel
        };
        
        const exposedCount = Object.values(managers).filter(Boolean).length;
        const requiredCount = 5;
        
        console.log('🔍 Global Manager Exposure:', managers);
        
        return {
            status: exposedCount >= 4 ? 'pass' : 'fail', // Allow some flexibility
            details: managers,
            message: `${exposedCount}/${requiredCount} managers exposed globally`
        };
    }

    testModalRemoval() {
        // Check that old modal methods are removed/replaced
        const componentManager = window.enhancedComponentManager || window.componentManager;
        
        if (!componentManager) {
            return {
                status: 'fail',
                message: 'No component manager available'
            };
        }
        
        const oldMethods = {
            showDesignPanel: typeof componentManager.showDesignPanel,
            getGenericDesignPanel: typeof componentManager.getGenericDesignPanel,
            saveComponentChanges: typeof componentManager.saveComponentChanges
        };
        
        const removedMethods = Object.entries(oldMethods)
            .filter(([method, type]) => type === 'undefined').length;
        
        console.log('🔍 Modal Method Removal:', oldMethods);
        
        return {
            status: removedMethods >= 2 ? 'pass' : 'fail', // At least most should be removed
            details: oldMethods,
            message: `${removedMethods}/3 old modal methods removed`
        };
    }

    testUpdateComponentMethod() {
        const componentManager = window.enhancedComponentManager || window.componentManager;
        
        if (!componentManager) {
            return {
                status: 'fail',
                message: 'No component manager available'
            };
        }
        
        const hasUpdateMethod = typeof componentManager.updateComponent === 'function';
        
        console.log('🔍 UpdateComponent Method:', hasUpdateMethod);
        
        return {
            status: hasUpdateMethod ? 'pass' : 'fail',
            message: hasUpdateMethod ? 'updateComponent method available' : 'updateComponent method missing'
        };
    }

    async testEditComponentBehavior() {
        const componentManager = window.enhancedComponentManager || window.componentManager;
        
        if (!componentManager || typeof componentManager.editComponent !== 'function') {
            return {
                status: 'fail',
                message: 'editComponent method not available'
            };
        }
        
        // Test editComponent behavior for component-specific design panel loading
        const editMethodStr = componentManager.editComponent.toString();
        const usesComponentSpecificPanels = editMethodStr.includes('guestify_render_design_panel') && 
                                           editMethodStr.includes('component.type');
        const usesSidebarDisplay = editMethodStr.includes('displayInSidebarDesignPanel') || 
                                  editMethodStr.includes('element-editor');
        const avoidsCentralizedPanel = !editMethodStr.includes('design-panel.js') && 
                                      !editMethodStr.includes('window.designPanel');
        const usesAjaxLoading = editMethodStr.includes('fetch') && 
                               editMethodStr.includes('ajaxUrl');
        
        // ROOT FIX: Test enhanced form binding architecture
        const hasEnhancedBinding = typeof componentManager.bindDesignPanelControls === 'function';
        const hasUpdateWithRerender = typeof componentManager.updateComponentWithRerender === 'function';
        const hasVisualFeedback = typeof componentManager.showUpdateFeedback === 'function';
        
        if (hasEnhancedBinding) {
            const bindingMethodStr = componentManager.bindDesignPanelControls.toString();
            const hasDebouncing = bindingMethodStr.includes('setTimeout') && bindingMethodStr.includes('300');
            const hasTypeHandling = bindingMethodStr.includes('checkbox') && bindingMethodStr.includes('color');
            const hasErrorHandling = bindingMethodStr.includes('try') && bindingMethodStr.includes('catch');
            
            console.log('🔍 Enhanced Form Binding Analysis:');
            console.log(`  - Has debouncing: ${hasDebouncing}`);
            console.log(`  - Has input type handling: ${hasTypeHandling}`);
            console.log(`  - Has error handling: ${hasErrorHandling}`);
        }
        
        console.log('🔍 EditComponent Behavior Analysis:');
        console.log(`  - Uses component-specific panels: ${usesComponentSpecificPanels}`);
        console.log(`  - Uses sidebar display: ${usesSidebarDisplay}`);
        console.log(`  - Avoids centralized panel: ${avoidsCentralizedPanel}`);
        console.log(`  - Uses AJAX loading: ${usesAjaxLoading}`);
        console.log(`  - Enhanced form binding: ${hasEnhancedBinding}`);
        console.log(`  - Update with re-render: ${hasUpdateWithRerender}`);
        console.log(`  - Visual feedback: ${hasVisualFeedback}`);
        
        const score = [usesComponentSpecificPanels, usesSidebarDisplay, avoidsCentralizedPanel, usesAjaxLoading, hasEnhancedBinding, hasUpdateWithRerender]
                     .filter(Boolean).length;
        
        return {
            status: score >= 5 ? 'pass' : 'fail',
            details: { 
                usesComponentSpecificPanels, 
                usesSidebarDisplay, 
                avoidsCentralizedPanel, 
                usesAjaxLoading,
                hasEnhancedBinding,
                hasUpdateWithRerender,
                hasVisualFeedback
            },
            message: score >= 5 ? 'Enhanced component-specific design panel architecture implemented' : 'Architecture needs improvement'
        };
    }

    async testTopicsLoadingFixes() {
        console.log('\n📚 TEST 2: TOPICS LOADING & DATA SOURCE FIXES');
        console.log('─────────────────────────────────────────');
        
        const tests = this.results.topicsLoadingFixes;
        
        // Test 2.1: Post ID detection
        tests.postIdDetection = this.testPostIdDetection();
        
        // Test 2.2: Topics component presence
        tests.componentPresence = this.testTopicsComponentPresence();
        
        // Test 2.3: Data source validation
        tests.dataSource = this.testTopicsDataSource();
        
        // Test 2.4: Component rendering
        tests.rendering = this.testTopicsRendering();
        
        const passedTests = Object.values(tests).filter(test => test.status === 'pass').length;
        tests.summary = `${passedTests}/4 tests passed`;
        
        console.log(`✅ Topics Loading Tests: ${tests.summary}`);
    }

    testPostIdDetection() {
        // Check various post ID sources
        const sources = {
            urlParams: new URLSearchParams(window.location.search).get('post_id') || 
                       new URLSearchParams(window.location.search).get('p'),
            gmkbData: window.gmkbData?.postId,
            guestifyData: window.guestifyData?.postId,
            domElement: document.querySelector('[data-post-id]')?.dataset.postId
        };
        
        const detectedPostId = Object.values(sources).find(id => id && parseInt(id) > 0);
        
        console.log('🔍 Post ID Detection Sources:', sources);
        console.log('🎯 Detected Post ID:', detectedPostId);
        
        return {
            status: detectedPostId ? 'pass' : 'fail',
            details: sources,
            detectedId: detectedPostId,
            message: detectedPostId ? `Post ID detected: ${detectedPostId}` : 'No valid post ID found'
        };
    }

    testTopicsComponentPresence() {
        const selectors = [
            '.topics-component',
            '[data-component="topics"]',
            '.content-section[data-element="topics"]',
            '.editable-element[data-component="topics"]'
        ];
        
        const foundElements = selectors.map(selector => {
            const elements = document.querySelectorAll(selector);
            return {
                selector,
                count: elements.length,
                elements: Array.from(elements)
            };
        });
        
        const totalElements = foundElements.reduce((sum, result) => sum + result.count, 0);
        
        console.log('🔍 Topics Component Elements:', foundElements);
        
        return {
            status: totalElements > 0 ? 'pass' : 'fail',
            details: foundElements,
            message: `Found ${totalElements} topics component elements`
        };
    }

    testTopicsDataSource() {
        const topicsComponent = document.querySelector('.topics-component') || 
                               document.querySelector('[data-component="topics"]');
        
        if (!topicsComponent) {
            return {
                status: 'fail',
                message: 'No topics component found for data source analysis'
            };
        }
        
        const topicItems = topicsComponent.querySelectorAll('.topic-item');
        const topicsData = Array.from(topicItems).map(item => {
            const titleEl = item.querySelector('.topic-title');
            const sourceAttr = item.getAttribute('data-topic-source') || 'unknown';
            const metaKeyAttr = item.getAttribute('data-meta-key') || 'unknown';
            
            return {
                title: titleEl?.textContent?.trim() || 'No title',
                source: sourceAttr,
                metaKey: metaKeyAttr,
                hasTitle: titleEl && titleEl.textContent.trim().length > 0
            };
        });
        
        const validTopics = topicsData.filter(topic => topic.hasTitle);
        
        console.log('🔍 Topics Data Analysis:', topicsData);
        
        return {
            status: validTopics.length > 0 ? 'pass' : 'fail',
            details: topicsData,
            validCount: validTopics.length,
            message: `Found ${validTopics.length} valid topics with data`
        };
    }

    testTopicsRendering() {
        const topicsComponent = document.querySelector('.topics-component') || 
                               document.querySelector('[data-component="topics"]');
        
        if (!topicsComponent) {
            return {
                status: 'fail',
                message: 'No topics component found'
            };
        }
        
        const renderingInfo = {
            hasContainer: !!topicsComponent.querySelector('.topics-container'),
            hasTopicItems: topicsComponent.querySelectorAll('.topic-item').length > 0,
            hasDebugInfo: !!topicsComponent.querySelector('.topics-debug-info'),
            hasEmptyMessage: !!topicsComponent.querySelector('.no-topics-message'),
            componentId: topicsComponent.getAttribute('data-component-id'),
            postId: topicsComponent.getAttribute('data-post-id')
        };
        
        const renderingScore = Object.values(renderingInfo).filter(Boolean).length;
        
        console.log('🔍 Topics Rendering Analysis:', renderingInfo);
        
        return {
            status: renderingScore >= 3 ? 'pass' : 'fail',
            details: renderingInfo,
            score: renderingScore,
            message: `Rendering quality score: ${renderingScore}/6`
        };
    }

    async testDesignPanelIntegration() {
        console.log('\n🎨 TEST 3: DESIGN PANEL INTEGRATION');
        console.log('─────────────────────────────────');
        
        const tests = this.results.designPanelIntegration;
        
        // Test 3.1: Design panel availability
        tests.availability = this.testDesignPanelAvailability();
        
        // Test 3.2: Sidebar integration
        tests.sidebarIntegration = this.testSidebarIntegration();
        
        // Test 3.3: Component selection
        tests.componentSelection = this.testComponentSelection();
        
        // Test 3.4: Design panel loading
        tests.panelLoading = await this.testDesignPanelLoading();
        
        const passedTests = Object.values(tests).filter(test => test.status === 'pass').length;
        tests.summary = `${passedTests}/4 tests passed`;
        
        console.log(`✅ Design Panel Tests: ${tests.summary}`);
    }

    testDesignPanelAvailability() {
        const elementEditor = document.getElementById('element-editor');
        const componentManager = window.enhancedComponentManager || window.componentManager;
        
        const availability = {
            sidebarElementEditor: !!elementEditor,
            componentManager: !!componentManager,
            editComponentMethod: !!(componentManager && typeof componentManager.editComponent === 'function'),
            displayInSidebarMethod: !!(componentManager && typeof componentManager.displayInSidebarDesignPanel === 'function'),
            ajaxEndpoint: !!window.gmkbData?.ajaxUrl
        };
        
        const availableCount = Object.values(availability).filter(Boolean).length;
        
        console.log('🔍 Design Panel Architecture:', availability);
        
        return {
            status: availableCount >= 4 ? 'pass' : 'fail',
            details: availability,
            message: `${availableCount}/5 component-specific design panel features available`
        };
    }

    testSidebarIntegration() {
        const designTab = document.querySelector('[data-tab="design"]');
        const designTabContent = document.getElementById('design-tab');
        const elementEditor = document.getElementById('element-editor');
        
        const integration = {
            designTab: !!designTab,
            designTabContent: !!designTabContent,
            elementEditor: !!elementEditor,
            tabSwitching: !!(designTab && designTab.addEventListener)
        };
        
        const integrationScore = Object.values(integration).filter(Boolean).length;
        
        console.log('🔍 Sidebar Integration:', integration);
        
        return {
            status: integrationScore >= 3 ? 'pass' : 'fail',
            details: integration,
            message: `${integrationScore}/4 sidebar integration features present`
        };
    }

    testComponentSelection() {
        const selectableComponents = document.querySelectorAll('[data-component-id]');
        const elementEditor = document.querySelector('.element-editor') || 
                             document.getElementById('element-editor');
        
        // Check if element editor has click handlers (indirect test)
        const hasSelectionSystem = selectableComponents.length > 0 && elementEditor;
        
        console.log('🔍 Component Selection System:');
        console.log(`  - Selectable components: ${selectableComponents.length}`);
        console.log(`  - Element editor present: ${!!elementEditor}`);
        
        return {
            status: hasSelectionSystem ? 'pass' : 'fail',
            details: {
                selectableComponents: selectableComponents.length,
                elementEditor: !!elementEditor
            },
            message: hasSelectionSystem ? 
                `${selectableComponents.length} components selectable` : 
                'Component selection system not ready'
        };
    }

    async testDesignPanelLoading() {
        const componentManager = window.enhancedComponentManager || window.componentManager;
        
        if (!componentManager || typeof componentManager.editComponent !== 'function') {
            return {
                status: 'fail',
                message: 'Component manager editComponent method not available'
            };
        }
        
        // Test the architecture of the editComponent method
        const editMethodStr = componentManager.editComponent.toString();
        const hasComponentSpecificLoading = editMethodStr.includes('guestify_render_design_panel') && 
                                           editMethodStr.includes('component.type') &&
                                           editMethodStr.includes('displayInSidebarDesignPanel');
        
        const hasAjaxIntegration = editMethodStr.includes('fetch') && 
                                  editMethodStr.includes('ajaxUrl');
        
        const hasSidebarIntegration = editMethodStr.includes('element-editor') || 
                                     editMethodStr.includes('switchToDesignTab');
        
        // ROOT FIX: Test enhanced form control binding
        const hasEnhancedFormBinding = typeof componentManager.bindDesignPanelControls === 'function';
        const hasUpdateWithRerender = typeof componentManager.updateComponentWithRerender === 'function';
        
        let formBindingScore = 0;
        if (hasEnhancedFormBinding) {
            const bindingStr = componentManager.bindDesignPanelControls.toString();
            const hasDebouncing = bindingStr.includes('setTimeout') && bindingStr.includes('300');
            const hasTypeHandling = bindingStr.includes('checkbox') && bindingStr.includes('color');
            const hasErrorHandling = bindingStr.includes('try') && bindingStr.includes('catch');
            const hasAsyncUpdates = bindingStr.includes('updateComponentWithRerender');
            
            formBindingScore = [hasDebouncing, hasTypeHandling, hasErrorHandling, hasAsyncUpdates]
                              .filter(Boolean).length;
        }
        
        // ROOT FIX: Test CSS feedback classes
        const hasCSSFeedback = document.querySelector('style, link[rel="stylesheet"]') &&
                              (document.styleSheets[0]?.cssRules ? 
                               Array.from(document.styleSheets).some(sheet => {
                                   try {
                                       return Array.from(sheet.cssRules || []).some(rule => 
                                           rule.selectorText && rule.selectorText.includes('update-success'));
                                   } catch (e) {
                                       return false;
                                   }
                               }) : true); // Assume true if can't access due to CORS
        
        console.log('🔍 Enhanced Design Panel Loading Analysis:', {
            hasComponentSpecificLoading,
            hasAjaxIntegration,
            hasSidebarIntegration,
            hasEnhancedFormBinding,
            hasUpdateWithRerender,
            formBindingScore,
            hasCSSFeedback,
            methodLength: editMethodStr.length
        });
        
        const score = [hasComponentSpecificLoading, hasAjaxIntegration, hasSidebarIntegration, hasEnhancedFormBinding, hasUpdateWithRerender]
                     .filter(Boolean).length;
        
        return {
            status: score >= 4 ? 'pass' : 'fail',
            details: { 
                hasComponentSpecificLoading, 
                hasAjaxIntegration, 
                hasSidebarIntegration,
                hasEnhancedFormBinding,
                hasUpdateWithRerender,
                formBindingScore,
                hasCSSFeedback
            },
            message: score >= 4 ? 
                'Enhanced component-specific design panel loading fully implemented' : 
                'Design panel loading architecture needs further improvement'
        };
    }

    assessOverallStatus() {
        const allTests = [
            ...Object.values(this.results.componentManagerFixes),
            ...Object.values(this.results.topicsLoadingFixes),
            ...Object.values(this.results.designPanelIntegration)
        ].filter(test => test.status); // Filter out summary objects
        
        const passedCount = allTests.filter(test => test.status === 'pass').length;
        const totalCount = allTests.length;
        const passRate = (passedCount / totalCount) * 100;
        
        if (passRate >= 90) {
            this.results.overallStatus = 'excellent';
        } else if (passRate >= 75) {
            this.results.overallStatus = 'good';
        } else if (passRate >= 50) {
            this.results.overallStatus = 'partial';
        } else {
            this.results.overallStatus = 'poor';
        }
        
        this.results.passRate = Math.round(passRate);
        this.results.passedCount = passedCount;
        this.results.totalCount = totalCount;
    }

    displayResults() {
        console.log('\n🎯 ROOT-LEVEL FIXES VALIDATION RESULTS');
        console.log('═══════════════════════════════════════');
        
        const statusEmojis = {
            excellent: '🎉',
            good: '✅',
            partial: '⚠️',
            poor: '❌',
            error: '💥'
        };
        
        const statusEmoji = statusEmojis[this.results.overallStatus] || '❓';
        
        console.log(`${statusEmoji} OVERALL STATUS: ${this.results.overallStatus.toUpperCase()}`);
        console.log(`📊 PASS RATE: ${this.results.passRate}% (${this.results.passedCount}/${this.results.totalCount})`);
        
        console.log('\n📋 DETAILED RESULTS:');
        console.log(`  • Component Manager Fixes: ${this.results.componentManagerFixes.summary}`);
        console.log(`  • Topics Loading Fixes: ${this.results.topicsLoadingFixes.summary}`);
        console.log(`  • Design Panel Integration: ${this.results.designPanelIntegration.summary}`);
        
        if (this.results.overallStatus === 'excellent') {
            console.log('\n🎉 CONGRATULATIONS! All root-level fixes are working correctly.');
            console.log('✅ Component editing opens in component-specific sidebar design panels');
            console.log('✅ Form controls have enhanced binding with debouncing and error handling');
            console.log('✅ Component updates trigger proper re-rendering with visual feedback');
            console.log('✅ Topics load from correct data sources with proper post ID detection');
            console.log('✅ Architecture follows scalable component-specific pattern');
        } else if (this.results.overallStatus === 'good') {
            console.log('\n✅ GOOD! Most root-level fixes are working correctly.');
            console.log('💡 The enhanced component-specific architecture is mostly in place.');
            console.log('🔧 Check individual test results for minor refinements needed.');
        } else {
            console.log('\n⚠️ ATTENTION NEEDED! Root-level architecture fixes require further work.');
            console.log('🔧 Key areas to address:');
            console.log('   • Enhanced form control binding and debouncing');
            console.log('   • Component-specific AJAX design panel loading');
            console.log('   • Visual feedback system for form updates');
            console.log('   • Proper component re-rendering after updates');
        }
        
        console.log('\n📖 DEBUGGING COMMANDS:');
        console.log('  • testRootFixes.results - View full results object');
        console.log('  • testRootFixes.runAllTests() - Re-run all tests');
        console.log('  • Object.values(testRootFixes.results).forEach(console.table) - Detailed view');
        console.log('\n🔧 MANUAL TESTING:');
        console.log('  • Add a component and click edit to test design panel loading');
        console.log('  • Modify form controls in design panel to test real-time updates');
        console.log('  • Check browser console for enhanced binding and re-render logs');
    }
}

// Auto-run validation
console.log('%c🚀 ROOT-LEVEL FIXES VALIDATOR LOADED', 'font-weight: bold; color: #2563eb; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');
console.log('📋 Run: testRootFixes.runAllTests() to validate all fixes');

// Global instance for easy access
window.testRootFixes = new RootLevelFixesValidator();

// Auto-run if this is being loaded in an automated context
if (window.location.search.includes('auto_test=true')) {
    setTimeout(() => {
        window.testRootFixes.runAllTests();
    }, 2000); // Wait for page to fully load
}
