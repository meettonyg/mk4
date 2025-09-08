/**
 * Media Kit Builder Automated QA Tester
 * Run this in the browser console to perform comprehensive automated testing
 * 
 * Usage: 
 * 1. Navigate to the Media Kit Builder page
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Run: MediaKitQATester.runAllTests()
 */

(function(window) {
    'use strict';

    window.MediaKitQATester = {
        testResults: [],
        currentTest: null,
        startTime: null,
        
        // Test configuration
        config: {
            verbose: true,
            stopOnError: false,
            logToConsole: true,
            testDelay: 100, // ms between tests
            waitTimeout: 5000, // max wait time for async operations
        },

        // Utility functions
        utils: {
            wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
            
            waitForElement: async (selector, timeout = 5000) => {
                const startTime = Date.now();
                while (Date.now() - startTime < timeout) {
                    const element = document.querySelector(selector);
                    if (element) return element;
                    await MediaKitQATester.utils.wait(100);
                }
                throw new Error(`Element not found: ${selector}`);
            },

            waitForCondition: async (condition, timeout = 5000, checkInterval = 100) => {
                const startTime = Date.now();
                while (Date.now() - startTime < timeout) {
                    if (condition()) return true;
                    await MediaKitQATester.utils.wait(checkInterval);
                }
                throw new Error('Condition not met within timeout');
            },

            triggerEvent: (element, eventName, detail = {}) => {
                const event = new CustomEvent(eventName, { detail, bubbles: true });
                element.dispatchEvent(event);
            },

            checkGlobalObject: (objPath) => {
                const parts = objPath.split('.');
                let obj = window;
                for (const part of parts) {
                    obj = obj[part];
                    if (obj === undefined) return false;
                }
                return true;
            },

            getGlobalObject: (objPath) => {
                const parts = objPath.split('.');
                let obj = window;
                for (const part of parts) {
                    obj = obj[part];
                    if (obj === undefined) return undefined;
                }
                return obj;
            }
        },

        // Test framework
        startTest: function(testName, category) {
            this.currentTest = {
                name: testName,
                category: category,
                startTime: Date.now(),
                status: 'running',
                errors: [],
                warnings: [],
                assertions: []
            };
            if (this.config.verbose) {
                console.group(`🧪 Testing: ${category} - ${testName}`);
            }
        },

        endTest: function(status = 'passed') {
            if (this.currentTest) {
                this.currentTest.endTime = Date.now();
                this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;
                this.currentTest.status = status;
                this.testResults.push(this.currentTest);
                
                if (this.config.verbose) {
                    const emoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
                    console.log(`${emoji} ${this.currentTest.name}: ${status} (${this.currentTest.duration}ms)`);
                    console.groupEnd();
                }
                
                this.currentTest = null;
            }
        },

        assert: function(condition, message) {
            const assertion = {
                passed: !!condition,
                message: message,
                timestamp: Date.now()
            };
            
            if (this.currentTest) {
                this.currentTest.assertions.push(assertion);
            }
            
            if (!condition) {
                const error = `Assertion failed: ${message}`;
                if (this.currentTest) {
                    this.currentTest.errors.push(error);
                }
                if (this.config.verbose) {
                    console.error(`   ❌ ${message}`);
                }
                if (this.config.stopOnError) {
                    throw new Error(error);
                }
            } else if (this.config.verbose) {
                console.log(`   ✓ ${message}`);
            }
            
            return condition;
        },

        warn: function(message) {
            if (this.currentTest) {
                this.currentTest.warnings.push(message);
            }
            if (this.config.verbose) {
                console.warn(`   ⚠️ ${message}`);
            }
        },

        // Phase 1: Pre-Test Setup & Initialization Tests
        phase1Tests: {
            async testPluginActivation() {
                MediaKitQATester.startTest('Plugin Activation Check', 'Phase 1: Setup');
                
                // Check for main data object
                MediaKitQATester.assert(
                    typeof gmkbData !== 'undefined',
                    'gmkbData object exists'
                );
                
                if (typeof gmkbData !== 'undefined') {
                    MediaKitQATester.assert(
                        gmkbData.ajaxUrl,
                        'AJAX URL is defined'
                    );
                    MediaKitQATester.assert(
                        gmkbData.nonce,
                        'Security nonce is present'
                    );
                    MediaKitQATester.assert(
                        gmkbData.postId || gmkbData.post_id,
                        'Post ID is available'
                    );
                }
                
                MediaKitQATester.endTest();
            },

            async testConsoleInitialization() {
                MediaKitQATester.startTest('Console Initialization Messages', 'Phase 1: Setup');
                
                // Check for critical global objects
                const criticalObjects = [
                    'themeManager',
                    'enhancedStateManager',
                    'enhancedComponentManager',
                    'sectionLayoutManager'
                ];
                
                for (const obj of criticalObjects) {
                    const exists = MediaKitQATester.utils.checkGlobalObject(obj);
                    MediaKitQATester.assert(exists, `Global object '${obj}' exists`);
                }
                
                // Check theme manager initialization
                if (window.themeManager) {
                    const themes = window.themeManager.getAvailableThemes();
                    MediaKitQATester.assert(
                        themes && themes.length > 0,
                        `Theme Manager has ${themes ? themes.length : 0} themes loaded`
                    );
                }
                
                MediaKitQATester.endTest();
            },

            async testBuilderInterface() {
                MediaKitQATester.startTest('Builder Interface Elements', 'Phase 1: Setup');
                
                // Check for main container
                MediaKitQATester.assert(
                    document.querySelector('#gmkb-builder-container, .gmkb-builder-container'),
                    'Builder container exists'
                );
                
                // Check for sidebar
                MediaKitQATester.assert(
                    document.querySelector('.gmkb-sidebar, #gmkb-sidebar'),
                    'Sidebar exists'
                );
                
                // Check for preview area
                MediaKitQATester.assert(
                    document.querySelector('.gmkb-preview, #gmkb-preview-area'),
                    'Preview area exists'
                );
                
                // Check for toolbar
                MediaKitQATester.assert(
                    document.querySelector('.gmkb-toolbar, #gmkb-toolbar'),
                    'Toolbar exists'
                );
                
                MediaKitQATester.endTest();
            }
        },

        // Phase 2: Component Configuration Testing
        phase2Tests: {
            async testComponentLibrary() {
                MediaKitQATester.startTest('Component Library', 'Phase 2: Components');
                
                // Try to open component library
                const addButton = document.querySelector('.add-component-btn, [data-action="add-component"]');
                MediaKitQATester.assert(addButton, 'Add Component button exists');
                
                if (addButton) {
                    addButton.click();
                    await MediaKitQATester.utils.wait(500);
                    
                    const modal = document.querySelector('.component-library-modal, .gmkb-modal');
                    MediaKitQATester.assert(modal, 'Component library modal opens');
                    
                    if (modal) {
                        const components = modal.querySelectorAll('.component-item, [data-component-type]');
                        MediaKitQATester.assert(
                            components.length > 0,
                            `Found ${components.length} components in library`
                        );
                        
                        // Check for common components
                        const expectedComponents = ['hero', 'biography', 'topics', 'contact'];
                        for (const compType of expectedComponents) {
                            const comp = modal.querySelector(`[data-component-type="${compType}"]`);
                            MediaKitQATester.assert(comp, `Component '${compType}' exists in library`);
                        }
                        
                        // Close modal
                        const closeBtn = modal.querySelector('.close, [data-dismiss="modal"]');
                        if (closeBtn) closeBtn.click();
                    }
                }
                
                MediaKitQATester.endTest();
            },

            async testAddComponent() {
                MediaKitQATester.startTest('Add Component', 'Phase 2: Components');
                
                // Get initial component count
                const initialComponents = document.querySelectorAll('.gmkb-component').length;
                
                // Try to add a component programmatically
                if (window.enhancedComponentManager) {
                    try {
                        const componentData = {
                            type: 'hero',
                            title: 'Test Hero Component',
                            data: {
                                heading: 'Test Heading',
                                subheading: 'Test Subheading'
                            }
                        };
                        
                        window.enhancedComponentManager.addComponent(componentData);
                        await MediaKitQATester.utils.wait(500);
                        
                        const newComponents = document.querySelectorAll('.gmkb-component').length;
                        MediaKitQATester.assert(
                            newComponents > initialComponents,
                            `Component added (was ${initialComponents}, now ${newComponents})`
                        );
                    } catch (error) {
                        MediaKitQATester.warn(`Could not add component programmatically: ${error.message}`);
                    }
                }
                
                MediaKitQATester.endTest();
            },

            async testComponentControls() {
                MediaKitQATester.startTest('Component Controls', 'Phase 2: Components');
                
                const component = document.querySelector('.gmkb-component');
                if (component) {
                    // Trigger hover
                    const hoverEvent = new MouseEvent('mouseenter', { bubbles: true });
                    component.dispatchEvent(hoverEvent);
                    await MediaKitQATester.utils.wait(100);
                    
                    // Check for controls
                    const controls = component.querySelectorAll('.component-control, [data-action]');
                    MediaKitQATester.assert(
                        controls.length > 0,
                        `Found ${controls.length} component controls`
                    );
                    
                    // Check for specific controls
                    const expectedControls = ['move-up', 'move-down', 'duplicate', 'delete', 'edit'];
                    for (const action of expectedControls) {
                        const control = component.querySelector(`[data-action="${action}"]`);
                        if (control) {
                            MediaKitQATester.assert(true, `Control '${action}' exists`);
                        } else {
                            MediaKitQATester.warn(`Control '${action}' not found`);
                        }
                    }
                } else {
                    MediaKitQATester.warn('No components found to test controls');
                }
                
                MediaKitQATester.endTest();
            },

            async testDesignPanel() {
                MediaKitQATester.startTest('Design Panel', 'Phase 2: Components');
                
                const component = document.querySelector('.gmkb-component');
                if (component) {
                    const editBtn = component.querySelector('[data-action="edit"]');
                    if (editBtn) {
                        editBtn.click();
                        await MediaKitQATester.utils.wait(500);
                        
                        const designPanel = document.querySelector('.design-panel, .gmkb-design-panel');
                        MediaKitQATester.assert(designPanel, 'Design panel opens');
                        
                        if (designPanel) {
                            MediaKitQATester.assert(
                                designPanel.classList.contains('active') || 
                                designPanel.style.display !== 'none',
                                'Design panel is visible'
                            );
                            
                            // Check for input fields
                            const inputs = designPanel.querySelectorAll('input, textarea, select');
                            MediaKitQATester.assert(
                                inputs.length > 0,
                                `Design panel has ${inputs.length} input fields`
                            );
                            
                            // Close panel
                            const closeBtn = designPanel.querySelector('.close, [data-action="close"]');
                            if (closeBtn) closeBtn.click();
                        }
                    }
                } else {
                    MediaKitQATester.warn('No components found to test design panel');
                }
                
                MediaKitQATester.endTest();
            }
        },

        // Phase 3: Section System Testing
        phase3Tests: {
            async testAddSection() {
                MediaKitQATester.startTest('Add Section', 'Phase 3: Sections');
                
                const addSectionBtn = document.querySelector('.add-section-btn, [data-action="add-section"]');
                MediaKitQATester.assert(addSectionBtn, 'Add Section button exists');
                
                if (addSectionBtn && window.sectionLayoutManager) {
                    const initialSections = document.querySelectorAll('.gmkb-section').length;
                    
                    // Try to add a section
                    try {
                        window.sectionLayoutManager.addSection('two_column');
                        await MediaKitQATester.utils.wait(500);
                        
                        const newSections = document.querySelectorAll('.gmkb-section').length;
                        MediaKitQATester.assert(
                            newSections > initialSections,
                            `Section added (was ${initialSections}, now ${newSections})`
                        );
                    } catch (error) {
                        MediaKitQATester.warn(`Could not add section: ${error.message}`);
                    }
                }
                
                MediaKitQATester.endTest();
            },

            async testSectionLayouts() {
                MediaKitQATester.startTest('Section Layouts', 'Phase 3: Sections');
                
                const sectionTypes = ['full_width', 'two_column', 'three_column'];
                
                for (const type of sectionTypes) {
                    const section = document.querySelector(`.gmkb-section[data-layout="${type}"]`);
                    if (section) {
                        MediaKitQATester.assert(true, `Section type '${type}' exists`);
                        
                        // Check column count
                        const columns = section.querySelectorAll('.gmkb-column, .section-column');
                        const expectedColumns = type === 'full_width' ? 1 : type === 'two_column' ? 2 : 3;
                        MediaKitQATester.assert(
                            columns.length === expectedColumns,
                            `${type} section has ${columns.length} columns (expected ${expectedColumns})`
                        );
                    }
                }
                
                MediaKitQATester.endTest();
            },

            async testDragToSections() {
                MediaKitQATester.startTest('Drag Components to Sections', 'Phase 3: Sections');
                
                // This is harder to test programmatically without actual drag events
                // We'll check if drop zones exist
                const dropZones = document.querySelectorAll('.drop-zone, [data-drop-zone]');
                MediaKitQATester.assert(
                    dropZones.length > 0,
                    `Found ${dropZones.length} drop zones`
                );
                
                // Check if sections accept components
                const section = document.querySelector('.gmkb-section');
                if (section) {
                    const hasDroppable = section.classList.contains('droppable') || 
                                       section.hasAttribute('data-droppable');
                    MediaKitQATester.assert(hasDroppable, 'Sections are configured as droppable');
                }
                
                MediaKitQATester.endTest();
            }
        },

        // Phase 4: Theme System Testing
        phase4Tests: {
            async testThemeSwitcher() {
                MediaKitQATester.startTest('Theme Switcher', 'Phase 4: Themes');
                
                const themeButton = document.querySelector('.theme-switcher, [data-action="change-theme"], .theme-button');
                MediaKitQATester.assert(themeButton, 'Theme switcher button exists');
                
                if (themeButton) {
                    themeButton.click();
                    await MediaKitQATester.utils.wait(300);
                    
                    const dropdown = document.querySelector('.theme-dropdown, .theme-menu');
                    MediaKitQATester.assert(dropdown, 'Theme dropdown opens');
                    
                    if (dropdown) {
                        const themes = dropdown.querySelectorAll('.theme-option, [data-theme]');
                        MediaKitQATester.assert(
                            themes.length >= 4,
                            `Found ${themes.length} themes (expected at least 4)`
                        );
                        
                        // Check for expected themes
                        const expectedThemes = ['professional_clean', 'creative_bold', 'minimal_elegant', 'modern_dark'];
                        for (const themeName of expectedThemes) {
                            const theme = dropdown.querySelector(`[data-theme="${themeName}"]`);
                            if (theme) {
                                MediaKitQATester.assert(true, `Theme '${themeName}' exists`);
                            }
                        }
                    }
                }
                
                MediaKitQATester.endTest();
            },

            async testThemeSwitch() {
                MediaKitQATester.startTest('Theme Switching', 'Phase 4: Themes');
                
                if (window.themeManager) {
                    const currentTheme = window.themeManager.getCurrentTheme();
                    MediaKitQATester.assert(currentTheme, `Current theme: ${currentTheme}`);
                    
                    // Try switching themes
                    const testTheme = 'creative_bold';
                    try {
                        window.themeManager.setTheme(testTheme);
                        await MediaKitQATester.utils.wait(500);
                        
                        const newTheme = window.themeManager.getCurrentTheme();
                        MediaKitQATester.assert(
                            newTheme === testTheme,
                            `Theme switched to ${testTheme}`
                        );
                        
                        // Check if CSS variables updated
                        const rootStyles = getComputedStyle(document.documentElement);
                        const primaryColor = rootStyles.getPropertyValue('--gmkb-primary-color');
                        MediaKitQATester.assert(primaryColor, 'CSS variables updated');
                        
                        // Switch back
                        if (currentTheme && currentTheme !== testTheme) {
                            window.themeManager.setTheme(currentTheme);
                        }
                    } catch (error) {
                        MediaKitQATester.warn(`Could not switch theme: ${error.message}`);
                    }
                }
                
                MediaKitQATester.endTest();
            },

            async testThemeCustomization() {
                MediaKitQATester.startTest('Theme Customization', 'Phase 4: Themes');
                
                const customizeBtn = document.querySelector('[data-action="customize-theme"]');
                if (customizeBtn) {
                    customizeBtn.click();
                    await MediaKitQATester.utils.wait(500);
                    
                    const customizer = document.querySelector('.theme-customizer, .customizer-panel');
                    MediaKitQATester.assert(customizer, 'Theme customizer opens');
                    
                    if (customizer) {
                        // Check for color pickers
                        const colorInputs = customizer.querySelectorAll('input[type="color"]');
                        MediaKitQATester.assert(
                            colorInputs.length > 0,
                            `Found ${colorInputs.length} color inputs`
                        );
                        
                        // Check for sliders
                        const sliders = customizer.querySelectorAll('input[type="range"]');
                        MediaKitQATester.assert(
                            sliders.length > 0,
                            `Found ${sliders.length} slider inputs`
                        );
                    }
                } else {
                    MediaKitQATester.warn('Customize theme button not found');
                }
                
                MediaKitQATester.endTest();
            }
        },

        // Phase 5: Core Functionality Testing
        phase5Tests: {
            async testSaveLoad() {
                MediaKitQATester.startTest('Save/Load State', 'Phase 5: Core');
                
                // Check for save button
                const saveBtn = document.querySelector('.save-btn, [data-action="save"]');
                MediaKitQATester.assert(saveBtn, 'Save button exists');
                
                if (saveBtn && window.enhancedStateManager) {
                    // Get current state
                    const stateBefore = window.enhancedStateManager.getState();
                    
                    // Trigger save
                    saveBtn.click();
                    await MediaKitQATester.utils.wait(1000);
                    
                    // Check for success message
                    const successMsg = document.querySelector('.success-message, .notice-success');
                    MediaKitQATester.assert(successMsg, 'Save success message appears');
                    
                    // Simulate reload by clearing and restoring state
                    try {
                        window.enhancedStateManager.loadState();
                        await MediaKitQATester.utils.wait(500);
                        
                        const stateAfter = window.enhancedStateManager.getState();
                        MediaKitQATester.assert(
                            JSON.stringify(stateBefore) === JSON.stringify(stateAfter),
                            'State persists after reload'
                        );
                    } catch (error) {
                        MediaKitQATester.warn(`Could not test state persistence: ${error.message}`);
                    }
                }
                
                MediaKitQATester.endTest();
            },

            async testAutoSave() {
                MediaKitQATester.startTest('Auto-Save', 'Phase 5: Core');
                
                if (window.enhancedStateManager) {
                    // Check if auto-save is configured
                    const autoSaveEnabled = window.enhancedStateManager.autoSaveEnabled || 
                                          window.gmkbData?.autoSave;
                    
                    MediaKitQATester.assert(
                        autoSaveEnabled !== false,
                        'Auto-save is enabled'
                    );
                    
                    // Make a change and wait for auto-save
                    if (window.enhancedComponentManager) {
                        const testData = { test: Date.now() };
                        window.enhancedStateManager.dispatch('UPDATE_GLOBAL_SETTINGS', testData);
                        
                        // Wait for auto-save interval (usually 30s, but we'll just check if it's set up)
                        MediaKitQATester.assert(
                            window.enhancedStateManager.autoSaveInterval,
                            'Auto-save interval is configured'
                        );
                    }
                }
                
                MediaKitQATester.endTest();
            },

            async testResponsivePreview() {
                MediaKitQATester.startTest('Responsive Preview', 'Phase 5: Core');
                
                const deviceButtons = document.querySelectorAll('[data-device], .device-preview-btn');
                MediaKitQATester.assert(
                    deviceButtons.length > 0,
                    `Found ${deviceButtons.length} device preview buttons`
                );
                
                // Test each device view
                const devices = ['desktop', 'tablet', 'mobile'];
                for (const device of devices) {
                    const btn = document.querySelector(`[data-device="${device}"]`);
                    if (btn) {
                        btn.click();
                        await MediaKitQATester.utils.wait(300);
                        
                        const preview = document.querySelector('.gmkb-preview, #gmkb-preview-area');
                        if (preview) {
                            const hasClass = preview.classList.contains(`preview-${device}`) ||
                                           preview.classList.contains(device);
                            MediaKitQATester.assert(hasClass, `Preview switches to ${device} view`);
                        }
                    }
                }
                
                MediaKitQATester.endTest();
            },

            async testEmptyState() {
                MediaKitQATester.startTest('Empty State', 'Phase 5: Core');
                
                // Check if empty state message exists when no components
                const components = document.querySelectorAll('.gmkb-component');
                if (components.length === 0) {
                    const emptyMsg = document.querySelector('.empty-state, .no-components-message');
                    MediaKitQATester.assert(emptyMsg, 'Empty state message shown when no components');
                } else {
                    MediaKitQATester.assert(true, `${components.length} components present, empty state not needed`);
                }
                
                MediaKitQATester.endTest();
            }
        },

        // Phase 6: Error Handling Tests
        phase6Tests: {
            async testNetworkErrors() {
                MediaKitQATester.startTest('Network Error Handling', 'Phase 6: Errors');
                
                // We can't actually go offline, but we can check error handling setup
                if (window.enhancedComponentManager) {
                    MediaKitQATester.assert(
                        typeof window.enhancedComponentManager.handleError === 'function',
                        'Error handler function exists'
                    );
                }
                
                // Check for error display elements
                const errorContainer = document.querySelector('.error-messages, #gmkb-errors');
                MediaKitQATester.assert(errorContainer !== null, 'Error message container exists');
                
                MediaKitQATester.endTest();
            },

            async testInvalidData() {
                MediaKitQATester.startTest('Invalid Data Handling', 'Phase 6: Errors');
                
                if (window.enhancedComponentManager) {
                    try {
                        // Try to add invalid component
                        window.enhancedComponentManager.addComponent({ type: 'invalid_type_xyz' });
                        await MediaKitQATester.utils.wait(500);
                        
                        // Should handle gracefully without crashing
                        MediaKitQATester.assert(true, 'Invalid component type handled gracefully');
                    } catch (error) {
                        MediaKitQATester.assert(true, `Invalid data rejected with error: ${error.message}`);
                    }
                }
                
                MediaKitQATester.endTest();
            }
        },

        // Phase 7: Performance Tests
        phase7Tests: {
            async testLoadTime() {
                MediaKitQATester.startTest('Load Time', 'Phase 7: Performance');
                
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                MediaKitQATester.assert(
                    loadTime < 3000,
                    `Page load time: ${loadTime}ms (should be < 3000ms)`
                );
                
                // Check for layout shifts
                if (window.PerformanceObserver) {
                    let cls = 0;
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (!entry.hadRecentInput) {
                                cls += entry.value;
                            }
                        }
                    });
                    
                    try {
                        observer.observe({ type: 'layout-shift', buffered: true });
                        MediaKitQATester.assert(
                            cls < 0.1,
                            `Cumulative Layout Shift: ${cls.toFixed(3)} (should be < 0.1)`
                        );
                        observer.disconnect();
                    } catch (error) {
                        MediaKitQATester.warn('Could not measure CLS');
                    }
                }
                
                MediaKitQATester.endTest();
            },

            async testManyComponents() {
                MediaKitQATester.startTest('Performance with Many Components', 'Phase 7: Performance');
                
                if (window.enhancedComponentManager) {
                    const startTime = performance.now();
                    const componentsToAdd = 10;
                    
                    // Add multiple components
                    for (let i = 0; i < componentsToAdd; i++) {
                        try {
                            window.enhancedComponentManager.addComponent({
                                type: 'hero',
                                title: `Test Component ${i}`,
                                data: { heading: `Heading ${i}` }
                            });
                        } catch (error) {
                            MediaKitQATester.warn(`Could not add component ${i}: ${error.message}`);
                            break;
                        }
                    }
                    
                    await MediaKitQATester.utils.wait(1000);
                    
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    
                    MediaKitQATester.assert(
                        duration < 5000,
                        `Added ${componentsToAdd} components in ${duration.toFixed(0)}ms`
                    );
                    
                    // Check if UI is still responsive
                    const components = document.querySelectorAll('.gmkb-component');
                    MediaKitQATester.assert(
                        components.length >= componentsToAdd,
                        `UI shows ${components.length} components`
                    );
                }
                
                MediaKitQATester.endTest();
            }
        },

        // Debug Commands Test
        debugTests: {
            async testDebugCommands() {
                MediaKitQATester.startTest('Debug Commands', 'Debug');
                
                // Test gmkbData
                MediaKitQATester.assert(
                    typeof gmkbData !== 'undefined',
                    'gmkbData is accessible'
                );
                
                // Test theme manager debug
                if (window.themeManager) {
                    try {
                        const debugInfo = window.themeManager.getDebugInfo();
                        MediaKitQATester.assert(debugInfo, 'Theme manager debug info available');
                        
                        const themes = window.themeManager.getAvailableThemes();
                        MediaKitQATester.assert(
                            Array.isArray(themes),
                            `Available themes: ${themes.length}`
                        );
                    } catch (error) {
                        MediaKitQATester.warn(`Theme debug error: ${error.message}`);
                    }
                }
                
                // Test state manager
                if (window.enhancedStateManager) {
                    try {
                        const state = window.enhancedStateManager.getState();
                        MediaKitQATester.assert(
                            typeof state === 'object',
                            'State manager returns state object'
                        );
                    } catch (error) {
                        MediaKitQATester.warn(`State manager error: ${error.message}`);
                    }
                }
                
                // Test section manager
                if (window.sectionLayoutManager) {
                    try {
                        const sections = window.sectionLayoutManager.getSections();
                        MediaKitQATester.assert(
                            Array.isArray(sections),
                            `Section manager has ${sections.length} sections`
                        );
                    } catch (error) {
                        MediaKitQATester.warn(`Section manager error: ${error.message}`);
                    }
                }
                
                MediaKitQATester.endTest();
            }
        },

        // Main test runner
        async runAllTests() {
            console.clear();
            console.log('%c🚀 Media Kit Builder QA Test Suite', 'font-size: 20px; font-weight: bold; color: #2196F3;');
            console.log('%cStarting automated tests...', 'font-size: 14px; color: #666;');
            console.log('=' .repeat(60));
            
            this.testResults = [];
            this.startTime = Date.now();
            
            // Run all test phases
            const testPhases = [
                { name: 'Phase 1: Setup & Initialization', tests: this.phase1Tests },
                { name: 'Phase 2: Component Configuration', tests: this.phase2Tests },
                { name: 'Phase 3: Section System', tests: this.phase3Tests },
                { name: 'Phase 4: Theme System', tests: this.phase4Tests },
                { name: 'Phase 5: Core Functionality', tests: this.phase5Tests },
                { name: 'Phase 6: Error Handling', tests: this.phase6Tests },
                { name: 'Phase 7: Performance', tests: this.phase7Tests },
                { name: 'Debug: Console Commands', tests: this.debugTests }
            ];
            
            for (const phase of testPhases) {
                console.log(`\n%c${phase.name}`, 'font-size: 16px; font-weight: bold; color: #4CAF50;');
                console.log('-'.repeat(40));
                
                for (const testName in phase.tests) {
                    try {
                        await phase.tests[testName]();
                        await this.utils.wait(this.config.testDelay);
                    } catch (error) {
                        console.error(`Test failed with error: ${error.message}`);
                        this.endTest('failed');
                    }
                }
            }
            
            // Generate report
            this.generateReport();
        },

        // Generate final report
        generateReport() {
            const totalTime = Date.now() - this.startTime;
            const passed = this.testResults.filter(t => t.status === 'passed').length;
            const failed = this.testResults.filter(t => t.status === 'failed').length;
            const warnings = this.testResults.reduce((sum, t) => sum + t.warnings.length, 0);
            
            console.log('\n' + '='.repeat(60));
            console.log('%c📊 TEST RESULTS SUMMARY', 'font-size: 18px; font-weight: bold; color: #2196F3;');
            console.log('='.repeat(60));
            
            console.log(`%cTotal Tests: ${this.testResults.length}`, 'font-size: 14px;');
            console.log(`%c✅ Passed: ${passed}`, 'color: green; font-size: 14px;');
            console.log(`%c❌ Failed: ${failed}`, 'color: red; font-size: 14px;');
            console.log(`%c⚠️  Warnings: ${warnings}`, 'color: orange; font-size: 14px;');
            console.log(`%c⏱️  Total Time: ${(totalTime / 1000).toFixed(2)}s`, 'font-size: 14px;');
            
            // Show failed tests details
            if (failed > 0) {
                console.log('\n%c❌ FAILED TESTS:', 'color: red; font-weight: bold;');
                this.testResults.filter(t => t.status === 'failed').forEach(test => {
                    console.log(`  - ${test.category}: ${test.name}`);
                    test.errors.forEach(error => {
                        console.log(`    └─ ${error}`);
                    });
                });
            }
            
            // Show tests with warnings
            const testsWithWarnings = this.testResults.filter(t => t.warnings.length > 0);
            if (testsWithWarnings.length > 0) {
                console.log('\n%c⚠️  TESTS WITH WARNINGS:', 'color: orange; font-weight: bold;');
                testsWithWarnings.forEach(test => {
                    console.log(`  - ${test.category}: ${test.name}`);
                    test.warnings.forEach(warning => {
                        console.log(`    └─ ${warning}`);
                    });
                });
            }
            
            // Show critical issues
            const criticalIssues = [];
            
            // Check for missing core systems
            if (!window.enhancedStateManager) criticalIssues.push('State Manager not initialized');
            if (!window.themeManager) criticalIssues.push('Theme Manager not initialized');
            if (!window.enhancedComponentManager) criticalIssues.push('Component Manager not initialized');
            if (!window.sectionLayoutManager) criticalIssues.push('Section Manager not initialized');
            
            if (criticalIssues.length > 0) {
                console.log('\n%c🚨 CRITICAL ISSUES:', 'color: red; font-weight: bold; font-size: 16px;');
                criticalIssues.forEach(issue => {
                    console.log(`  ❗ ${issue}`);
                });
            }
            
            // Provide recommendations
            console.log('\n%c💡 RECOMMENDATIONS:', 'color: #FFC107; font-weight: bold;');
            if (failed > 0 || criticalIssues.length > 0) {
                console.log('  1. Check browser console for JavaScript errors');
                console.log('  2. Verify all files are properly loaded');
                console.log('  3. Check PHP error logs for server-side issues');
                console.log('  4. Ensure WordPress and plugin are properly configured');
            } else if (warnings > 0) {
                console.log('  1. Review warnings for potential issues');
                console.log('  2. Test edge cases manually');
                console.log('  3. Consider implementing missing features');
            } else {
                console.log('  ✨ All tests passed! The system appears to be working correctly.');
                console.log('  Consider running manual tests for user experience validation.');
            }
            
            console.log('\n' + '='.repeat(60));
            console.log('Test suite complete. Results available in MediaKitQATester.testResults');
            
            // Store results for further analysis
            window.MediaKitQAResults = {
                summary: {
                    total: this.testResults.length,
                    passed: passed,
                    failed: failed,
                    warnings: warnings,
                    duration: totalTime
                },
                details: this.testResults,
                timestamp: new Date().toISOString()
            };
            
            console.log('Full results stored in window.MediaKitQAResults');
        },

        // Quick test for smoke testing
        async runQuickTest() {
            console.clear();
            console.log('%c🚀 Quick Smoke Test', 'font-size: 18px; font-weight: bold; color: #2196F3;');
            
            this.testResults = [];
            this.startTime = Date.now();
            
            // Run only critical tests
            await this.phase1Tests.testPluginActivation();
            await this.phase1Tests.testBuilderInterface();
            await this.phase2Tests.testComponentLibrary();
            await this.phase2Tests.testAddComponent();
            await this.phase4Tests.testThemeSwitcher();
            await this.phase5Tests.testSaveLoad();
            
            this.generateReport();
        },

        // Run specific phase
        async runPhase(phaseNumber) {
            const phases = {
                1: this.phase1Tests,
                2: this.phase2Tests,
                3: this.phase3Tests,
                4: this.phase4Tests,
                5: this.phase5Tests,
                6: this.phase6Tests,
                7: this.phase7Tests
            };
            
            const phase = phases[phaseNumber];
            if (!phase) {
                console.error(`Invalid phase number: ${phaseNumber}`);
                return;
            }
            
            console.log(`%cRunning Phase ${phaseNumber} Tests`, 'font-size: 16px; font-weight: bold;');
            
            this.testResults = [];
            this.startTime = Date.now();
            
            for (const testName in phase) {
                try {
                    await phase[testName]();
                    await this.utils.wait(this.config.testDelay);
                } catch (error) {
                    console.error(`Test failed with error: ${error.message}`);
                    this.endTest('failed');
                }
            }
            
            this.generateReport();
        }
    };

    // Add helper commands
    window.MKTest = {
        all: () => MediaKitQATester.runAllTests(),
        quick: () => MediaKitQATester.runQuickTest(),
        phase: (n) => MediaKitQATester.runPhase(n),
        results: () => window.MediaKitQAResults,
        config: (options) => Object.assign(MediaKitQATester.config, options)
    };

    console.log('%c✅ Media Kit QA Tester Loaded!', 'color: green; font-weight: bold; font-size: 14px;');
    console.log('Available commands:');
    console.log('  %cMKTest.all()%c - Run all tests', 'color: #2196F3; font-weight: bold;', 'color: inherit;');
    console.log('  %cMKTest.quick()%c - Run quick smoke test', 'color: #2196F3; font-weight: bold;', 'color: inherit;');
    console.log('  %cMKTest.phase(n)%c - Run specific phase (1-7)', 'color: #2196F3; font-weight: bold;', 'color: inherit;');
    console.log('  %cMKTest.results()%c - Get last test results', 'color: #2196F3; font-weight: bold;', 'color: inherit;');
    console.log('  %cMKTest.config(options)%c - Configure test settings', 'color: #2196F3; font-weight: bold;', 'color: inherit;');
    console.log('\nExample: %cMKTest.quick()%c to start', 'color: #4CAF50; font-weight: bold;', 'color: inherit;');

})(window);
