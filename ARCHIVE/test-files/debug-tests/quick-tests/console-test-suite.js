/**
 * GMKB Console Test Suite - Comprehensive Testing Harness
 * @version 1.0.0
 * @description Complete test harness for Guestify Media Kit Builder functionality
 * 
 * ARCHITECTURE:
 * - Event-driven design (no polling)
 * - WordPress compatible
 * - Browser DevTools ready
 * - Non-destructive by default
 * - Comprehensive error handling
 */

// ROOT FIX: Initialize test harness
(function() {
    'use strict';
    
    // Prevent multiple initialization
    if (window.GMKBTest) {
        console.warn('⚠️ GMKBTest already exists, skipping re-initialization');
        return;
    }
    
    /**
     * GMKB Test Harness - Main Testing Object
     */
    window.GMKBTest = {
        version: '1.0.0',
        initialized: false,
        
        // Test configuration
        config: {
            timeout: 5000,
            cleanup: true,
            verbose: true,
            failFast: false
        },
        
        // Test state
        state: {
            running: false,
            currentTest: null,
            results: {},
            snapshots: new Map(),
            cleanup: []
        },
        
        // Selectors for UI elements (customizable)
        selectors: {
            builderRoot: '#media-kit-builder, #media-kit-preview, .gmkb-builder',
            componentItem: '[data-component-id]',
            controlsStrip: '.component-controls, .component-controls--dynamic',
            btnEdit: '[data-action="edit"], .edit-btn, .component-edit',
            btnDuplicate: '[data-action="duplicate"], .duplicate-btn, .component-duplicate',
            btnDelete: '[data-action="delete"], .delete-btn, .component-delete',
            btnMove: '[data-action="move"], .move-btn',
            designPanel: '#design-panel, .design-panel, .element-editor',
            fieldInput: 'input, textarea, select',
            modalLibrary: '#component-library-modal, .component-library',
            toolbarSave: '#save-btn, .save-btn',
            toolbarExport: '#export-btn, .export-btn',
            deviceToggle: {
                desktop: '.device-desktop, [data-device="desktop"]',
                tablet: '.device-tablet, [data-device="tablet"]',
                mobile: '.device-mobile, [data-device="mobile"]'
            },
            addComponentBtn: '#add-component-btn, .add-component-btn'
        },
        
        /**
         * Initialize test harness
         */
        init() {
            if (this.initialized) return;
            
            this.log('🚀 GMKBTest: Initializing test harness v' + this.version);
            
            // Verify we're on builder page
            if (!this.verifyBuilderPage()) {
                throw new Error('❌ Not on Media Kit Builder page - tests cannot run');
            }
            
            // Verify core systems
            if (!this.verifyCoreSystem()) {
                throw new Error('❌ Core systems not available - tests cannot run');
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            this.log('✅ GMKBTest: Initialization complete');
            
            return this;
        },
        
        /**
         * Verify we're on the builder page
         */
        verifyBuilderPage() {
            const indicators = [
                document.querySelector(this.selectors.builderRoot),
                window.gmkbData,
                window.enhancedStateManager,
                document.querySelector('[data-post-id]')
            ];
            
            const verified = indicators.some(indicator => !!indicator);
            
            if (!verified) {
                this.log('❌ Builder page verification failed', {
                    builderRoot: !!document.querySelector(this.selectors.builderRoot),
                    gmkbData: !!window.gmkbData,
                    stateManager: !!window.enhancedStateManager,
                    postId: !!document.querySelector('[data-post-id]')
                });
            }
            
            return verified;
        },
        
        /**
         * Verify core systems are available
         */
        verifyCoreSystem() {
            const systems = {
                stateManager: window.enhancedStateManager,
                componentManager: window.enhancedComponentManager,
                renderer: window.enhancedComponentRenderer,
                logger: window.structuredLogger,
                GMKB: window.GMKB
            };
            
            const missing = Object.entries(systems)
                .filter(([name, system]) => !system)
                .map(([name]) => name);
            
            if (missing.length > 0) {
                this.log('❌ Missing core systems:', missing);
                return false;
            }
            
            // Check if gmkb:ready event was fired
            if (!window.gmkbDataReady && !document.body.classList.contains('gmkb-ready')) {
                this.log('⚠️ GMKB not fully ready, proceeding with caution');
            }
            
            return true;
        },
        
        /**
         * Setup event listeners for test coordination
         */
        setupEventListeners() {
            // Listen for component events
            document.addEventListener('gmkb:component-added', (e) => {
                this.log('📦 Component added:', e.detail);
            });
            
            document.addEventListener('gmkb:component-removed', (e) => {
                this.log('🗑️ Component removed:', e.detail);
            });
            
            document.addEventListener('gmkb:state:saved', (e) => {
                this.log('💾 State saved:', e.detail);
            });
            
            // Track test components for cleanup
            document.addEventListener('gmkb:component-added', (e) => {
                if (e.detail.id?.startsWith('test-')) {
                    this.state.cleanup.push(() => {
                        this.removeComponent(e.detail.id);
                    });
                }
            });
        },
        
        /**
         * Logging utility
         */
        log(...args) {
            if (this.config.verbose) {
                console.log('[GMKBTest]', ...args);
            }
        },
        
        /**
         * Error utility
         */
        error(...args) {
            console.error('[GMKBTest]', ...args);
        },
        
        /**
         * Assert utility
         */
        assert(condition, message) {
            if (!condition) {
                const error = new Error(`❌ Assertion failed: ${message}`);
                this.error(error.message);
                throw error;
            }
            this.log('✅', message);
            return true;
        },
        
        /**
         * Wait for event utility
         */
        waitForEvent(eventName, options = {}) {
            const { target = document, timeout = this.config.timeout } = options;
            
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    target.removeEventListener(eventName, handler);
                    reject(new Error(`Timeout waiting for event: ${eventName}`));
                }, timeout);
                
                const handler = (event) => {
                    clearTimeout(timer);
                    target.removeEventListener(eventName, handler);
                    resolve(event);
                };
                
                target.addEventListener(eventName, handler);
            });
        },
        
        /**
         * Wait for selector utility (MutationObserver-based)
         */
        waitForSelector(selector, options = {}) {
            const { within = document, timeout = this.config.timeout } = options;
            
            return new Promise((resolve, reject) => {
                // Check if element already exists
                const existing = within.querySelector(selector);
                if (existing) {
                    resolve(existing);
                    return;
                }
                
                const timer = setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Timeout waiting for selector: ${selector}`));
                }, timeout);
                
                const observer = new MutationObserver((mutations) => {
                    const element = within.querySelector(selector);
                    if (element) {
                        clearTimeout(timer);
                        observer.disconnect();
                        resolve(element);
                    }
                });
                
                observer.observe(within, {
                    childList: true,
                    subtree: true
                });
            });
        },
        
        /**
         * Wait idle utility
         */
        waitIdle() {
            return new Promise(resolve => {
                if (window.requestIdleCallback) {
                    requestIdleCallback(resolve);
                } else {
                    setTimeout(resolve, 0);
                }
            });
        },
        
        /**
         * Sleep utility
         */
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        
        /**
         * Get current state
         */
        getState() {
            if (window.enhancedStateManager) {
                return window.enhancedStateManager.getState();
            }
            
            // Fallback: try to read from DOM
            const components = document.querySelectorAll(this.selectors.componentItem);
            return {
                components: Array.from(components).map(el => ({
                    id: el.dataset.componentId,
                    type: el.dataset.componentType || 'unknown',
                    element: el
                })),
                layout: Array.from(components).map(el => el.dataset.componentId),
                globalSettings: {}
            };
        },
        
        /**
         * Set state (patch)
         */
        setState(patch) {
            if (window.enhancedStateManager) {
                // Apply patch via state manager
                if (patch.components) {
                    Object.entries(patch.components).forEach(([id, component]) => {
                        window.enhancedStateManager.addComponent(component);
                    });
                }
                if (patch.globalSettings) {
                    window.enhancedStateManager.updateGlobalSettings(patch.globalSettings);
                }
                return;
            }
            
            throw new Error('State manager not available');
        },
        
        /**
         * Select component by various criteria
         */
        selectComponent(criteria) {
            let element;
            
            if (typeof criteria === 'string') {
                // Assume it's an ID
                element = document.querySelector(`[data-component-id="${criteria}"]`);
            } else if (criteria.id) {
                element = document.querySelector(`[data-component-id="${criteria.id}"]`);
            } else if (criteria.index !== undefined) {
                const components = document.querySelectorAll(this.selectors.componentItem);
                element = components[criteria.index];
            } else if (criteria.type) {
                element = document.querySelector(`[data-component-type="${criteria.type}"]`);
            }
            
            if (!element) {
                throw new Error(`Component not found: ${JSON.stringify(criteria)}`);
            }
            
            // Get state data if available
            const state = this.getState();
            const stateData = state.components.find(c => c.id === element.dataset.componentId);
            
            return {
                element,
                id: element.dataset.componentId,
                type: element.dataset.componentType,
                state: stateData
            };
        },
        
        /**
         * Open design panel for component
         */
        async openDesignPanelFor(componentEl) {
            const editBtn = componentEl.querySelector(this.selectors.btnEdit);
            if (!editBtn) {
                throw new Error('Edit button not found for component');
            }
            
            // Click edit button
            editBtn.click();
            
            // Wait for design panel to appear
            await this.waitForSelector(this.selectors.designPanel);
            
            return document.querySelector(this.selectors.designPanel);
        },
        
        /**
         * Set field value in design panel
         */
        setField(fieldSelector, value) {
            const field = document.querySelector(fieldSelector);
            if (!field) {
                throw new Error(`Field not found: ${fieldSelector}`);
            }
            
            // Set value based on field type
            if (field.type === 'checkbox') {
                field.checked = Boolean(value);
            } else {
                field.value = value;
            }
            
            // Dispatch events
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            
            return field;
        },
        
        /**
         * Click component control button
         */
        clickControl(componentEl, controlName) {
            const selector = this.selectors[`btn${controlName.charAt(0).toUpperCase()}${controlName.slice(1)}`];
            const control = componentEl.querySelector(selector);
            
            if (!control) {
                throw new Error(`${controlName} control not found`);
            }
            
            control.click();
            return control;
        },
        
        /**
         * Reorder components
         */
        reorder(fromIndex, toIndex) {
            if (window.enhancedStateManager) {
                const state = this.getState();
                const newLayout = [...state.layout];
                const [moved] = newLayout.splice(fromIndex, 1);
                newLayout.splice(toIndex, 0, moved);
                
                window.enhancedStateManager.setLayout(newLayout);
                return;
            }
            
            // Fallback: DOM manipulation
            const components = document.querySelectorAll(this.selectors.componentItem);
            const fromEl = components[fromIndex];
            const toEl = components[toIndex];
            
            if (!fromEl || !toEl) {
                throw new Error('Invalid reorder indices');
            }
            
            // Move DOM elements
            const parent = fromEl.parentNode;
            const nextSibling = toIndex < fromIndex ? toEl : toEl.nextSibling;
            parent.insertBefore(fromEl, nextSibling);
        },
        
        /**
         * Take state snapshot
         */
        snapshot(label) {
            const state = this.getState();
            const snapshot = JSON.parse(JSON.stringify(state));
            snapshot.timestamp = Date.now();
            snapshot.label = label;
            
            this.state.snapshots.set(label, snapshot);
            this.log(`📸 Snapshot taken: ${label}`);
            
            return snapshot;
        },
        
        /**
         * Compare two states
         */
        diff(stateA, stateB) {
            const differences = [];
            
            // Compare component counts
            const countA = Object.keys(stateA.components || {}).length;
            const countB = Object.keys(stateB.components || {}).length;
            
            if (countA !== countB) {
                differences.push({
                    type: 'component-count',
                    before: countA,
                    after: countB,
                    change: countB - countA
                });
            }
            
            // Compare layout length
            const layoutA = (stateA.layout || []).length;
            const layoutB = (stateB.layout || []).length;
            
            if (layoutA !== layoutB) {
                differences.push({
                    type: 'layout-length',
                    before: layoutA,
                    after: layoutB,
                    change: layoutB - layoutA
                });
            }
            
            // Compare specific components (simplified)
            const componentsA = Object.keys(stateA.components || {});
            const componentsB = Object.keys(stateB.components || {});
            
            const added = componentsB.filter(id => !componentsA.includes(id));
            const removed = componentsA.filter(id => !componentsB.includes(id));
            
            if (added.length > 0) {
                differences.push({ type: 'components-added', components: added });
            }
            
            if (removed.length > 0) {
                differences.push({ type: 'components-removed', components: removed });
            }
            
            return differences;
        },
        
        /**
         * Execute function with rollback on error
         */
        async withRollback(fn) {
            const before = this.snapshot('rollback-point');
            
            try {
                const result = await fn();
                return result;
            } catch (error) {
                this.log('⚠️ Error occurred, rolling back...');
                
                // Attempt rollback
                if (window.enhancedStateManager && window.enhancedStateManager.rollbackLastTransaction) {
                    window.enhancedStateManager.rollbackLastTransaction();
                } else {
                    this.log('❌ Rollback not supported');
                }
                
                throw error;
            }
        },
        
        /**
         * Add component (test helper)
         */
        async addComponent(type, props = {}) {
            const componentId = props.id || `test-${type}-${Date.now()}`;
            const component = {
                id: componentId,
                type,
                props: {
                    title: `Test ${type}`,
                    ...props
                }
            };
            
            if (window.enhancedComponentManager) {
                await window.enhancedComponentManager.addComponent(type, component);
            } else {
                throw new Error('Component manager not available');
            }
            
            return componentId;
        },
        
        /**
         * Remove component (test helper)
         */
        async removeComponent(componentId) {
            if (window.enhancedComponentManager) {
                await window.enhancedComponentManager.removeComponent(componentId);
            } else {
                // Fallback: remove from DOM
                const element = document.querySelector(`[data-component-id="${componentId}"]`);
                if (element) {
                    element.remove();
                }
            }
        },
        
        /**
         * Cleanup test artifacts
         */
        cleanup() {
            this.log('🧹 Running cleanup...');
            
            // Execute cleanup functions
            this.state.cleanup.forEach(cleanupFn => {
                try {
                    cleanupFn();
                } catch (error) {
                    this.error('Cleanup error:', error);
                }
            });
            
            // Clear cleanup queue
            this.state.cleanup = [];
            
            // Remove test components
            const testComponents = document.querySelectorAll('[data-component-id^="test-"]');
            testComponents.forEach(el => el.remove());
            
            // Close any open panels/modals
            const modals = document.querySelectorAll('.modal.show, .modal[style*="block"]');
            modals.forEach(modal => {
                modal.style.display = 'none';
                modal.classList.remove('show');
            });
            
            const panels = document.querySelectorAll('.design-panel.open, .element-editor.show');
            panels.forEach(panel => {
                panel.classList.remove('open', 'show');
            });
            
            this.log('✅ Cleanup complete');
        },
        
        /**
         * Test runner
         */
        async run(testList = 'smoke') {
            if (!this.initialized) {
                this.init();
            }
            
            const tests = this.getTestList(testList);
            const results = {
                passed: 0,
                failed: 0,
                skipped: 0,
                errors: [],
                details: {}
            };
            
            this.state.running = true;
            
            console.group(`🧪 Running test suite: ${testList}`);
            
            for (const testName of tests) {
                if (!this.tests[testName]) {
                    this.error(`Test not found: ${testName}`);
                    results.skipped++;
                    continue;
                }
                
                this.state.currentTest = testName;
                
                try {
                    console.group(`🔬 ${testName}`);
                    
                    const testResult = await this.tests[testName]();
                    
                    if (testResult.ok) {
                        this.log(`✅ ${testName} - PASSED`);
                        results.passed++;
                    } else {
                        this.log(`❌ ${testName} - FAILED: ${testResult.error}`);
                        results.failed++;
                        results.errors.push({ test: testName, error: testResult.error });
                    }
                    
                    results.details[testName] = testResult;
                    
                } catch (error) {
                    this.error(`💥 ${testName} - EXCEPTION:`, error);
                    results.failed++;
                    results.errors.push({ test: testName, error: error.message });
                    results.details[testName] = { ok: false, error: error.message };
                    
                    if (this.config.failFast) {
                        break;
                    }
                } finally {
                    console.groupEnd();
                    
                    // Cleanup between tests if configured
                    if (this.config.cleanup) {
                        await this.sleep(100);
                        this.cleanup();
                        await this.sleep(100);
                    }
                }
            }
            
            this.state.running = false;
            this.state.currentTest = null;
            
            // Print summary
            console.groupEnd();
            console.group('📊 Test Results Summary');
            console.log(`✅ Passed: ${results.passed}`);
            console.log(`❌ Failed: ${results.failed}`);
            console.log(`⏭️ Skipped: ${results.skipped}`);
            console.log(`📈 Success Rate: ${(results.passed / (results.passed + results.failed) * 100).toFixed(1)}%`);
            
            if (results.errors.length > 0) {
                console.group('❌ Errors');
                results.errors.forEach(({ test, error }) => {
                    console.log(`${test}: ${error}`);
                });
                console.groupEnd();
            }
            
            console.groupEnd();
            
            return results;
        },
        
        /**
         * Get test list by name
         */
        getTestList(listName) {
            const lists = {
                smoke: ['A1', 'A2', 'A3', 'B2', 'C2', 'D1'],
                full: [
                    'A1', 'A2', 'A3', 'A4', 'A5', 'A6',
                    'B1', 'B2', 'B3', 'B4',
                    'C1', 'C2', 'C3', 'C4',
                    'D1', 'D2', 'D3',
                    'E1', 'E2',
                    'F1', 'F2', 'F3'
                ]
            };
            
            return lists[listName] || [listName];
        },
        
        /**
         * Individual tests will be added to this object
         */
        tests: {}
    };
    
    // Initialize immediately
    try {
        GMKBTest.init();
    } catch (error) {
        console.warn('⚠️ GMKBTest initialization delayed:', error.message);
        // Try again after a short delay
        setTimeout(() => {
            try {
                GMKBTest.init();
            } catch (err) {
                console.error('❌ GMKBTest initialization failed:', err.message);
            }
        }, 1000);
    }
    
    // Export for global access
    window.GMKBTest = GMKBTest;
    
    console.log('✅ GMKBTest harness loaded - use GMKBTest.run("smoke") to start testing');
    
})();
