/**
 * GMKB Field Verification & Diagnostic Test
 * 
 * Console utility to verify all field values and compare:
 * - Database saved values → Frontend displayed values
 * - Theme customizations → Applied CSS variables
 * - Component settings → Rendered output
 * - State synchronization → DOM representation
 * 
 * USAGE:
 * 1. Open frontend media kit page
 * 2. Open browser console (F12)
 * 3. Paste this entire file and press Enter
 * 4. Run: GMKB_FieldTest.runFullDiagnostic()
 * 
 * Or run specific tests:
 * - GMKB_FieldTest.testThemeCustomizations()
 * - GMKB_FieldTest.testComponentFields()
 * - GMKB_FieldTest.testCSSVariables()
 * - GMKB_FieldTest.compareAdminToFrontend()
 */

window.GMKB_FieldTest = {
    
    /**
     * Run full diagnostic suite
     */
    async runFullDiagnostic() {
        console.clear();
        console.log('%c🔍 GMKB FIELD VERIFICATION TEST', 'font-size: 20px; font-weight: bold; color: #2563eb;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #94a3b8;');
        console.log('Timestamp:', new Date().toISOString());
        console.log('');
        
        const results = {
            timestamp: new Date().toISOString(),
            postId: window.GMKB_DEBUG?.postId || this.getPostIdFromDOM(),
            tests: {}
        };
        
        // Test 1: Theme Customizations
        console.log('%c━━ TEST 1: Theme Customizations ━━', 'color: #f59e0b; font-weight: bold;');
        results.tests.themeCustomizations = await this.testThemeCustomizations();
        console.log('');
        
        // Test 2: CSS Variables
        console.log('%c━━ TEST 2: CSS Variables ━━', 'color: #8b5cf6; font-weight: bold;');
        results.tests.cssVariables = this.testCSSVariables();
        console.log('');
        
        // Test 3: Component Fields
        console.log('%c━━ TEST 3: Component Fields ━━', 'color: #10b981; font-weight: bold;');
        results.tests.componentFields = this.testComponentFields();
        console.log('');
        
        // Test 4: State vs DOM
        console.log('%c━━ TEST 4: State vs DOM ━━', 'color: #ef4444; font-weight: bold;');
        results.tests.stateVsDOM = this.testStateVsDOM();
        console.log('');
        
        // Test 5: Saved vs Displayed
        console.log('%c━━ TEST 5: Database Saved vs Frontend Display ━━', 'color: #06b6d4; font-weight: bold;');
        results.tests.savedVsDisplayed = await this.testSavedVsDisplayed();
        console.log('');
        
        // Summary
        this.printSummary(results);
        
        // Store results globally for inspection
        window.GMKB_TestResults = results;
        console.log('');
        console.log('%c✅ Test results stored in: window.GMKB_TestResults', 'color: #10b981; font-weight: bold;');
        
        return results;
    },
    
    /**
     * Test 1: Theme Customizations
     * Verifies theme ID, loaded config, and customizations
     */
    async testThemeCustomizations() {
        const test = {
            name: 'Theme Customizations',
            passed: true,
            errors: [],
            data: {}
        };
        
        try {
            // Get theme from GMKB_DEBUG
            const savedTheme = window.GMKB_DEBUG?.theme;
            const themeObject = window.GMKB_DEBUG?.themeObject;
            
            test.data.savedTheme = savedTheme;
            test.data.loadedTheme = themeObject?.theme_id;
            test.data.themeMatch = (savedTheme === themeObject?.theme_id);
            
            console.log('Saved Theme:', savedTheme);
            console.log('Loaded Theme:', themeObject?.theme_id);
            console.log('Theme Match:', test.data.themeMatch ? '✅' : '❌');
            
            if (!test.data.themeMatch) {
                test.passed = false;
                test.errors.push(`Theme mismatch! Saved: ${savedTheme}, Loaded: ${themeObject?.theme_id}`);
            }
            
            // Check if theme object has required properties
            const requiredProps = ['colors', 'typography', 'spacing', 'effects'];
            const missingProps = requiredProps.filter(prop => !themeObject?.[prop]);
            
            if (missingProps.length > 0) {
                test.passed = false;
                test.errors.push(`Theme missing properties: ${missingProps.join(', ')}`);
                console.warn('❌ Missing theme properties:', missingProps);
            } else {
                console.log('✅ Theme object complete');
            }
            
            // Try to fetch customizations from post meta
            const postId = test.data.postId = this.getPostIdFromDOM();
            if (postId) {
                try {
                    const customizations = await this.fetchThemeCustomizations(postId);
                    test.data.customizations = customizations;
                    test.data.hasCustomizations = !this.isEmpty(customizations);
                    
                    console.log('Customizations found:', test.data.hasCustomizations ? '✅' : '⚠️ None');
                    if (test.data.hasCustomizations) {
                        console.log('Customization sections:', Object.keys(customizations));
                    }
                } catch (error) {
                    console.warn('Could not fetch customizations:', error.message);
                }
            }
            
        } catch (error) {
            test.passed = false;
            test.errors.push(error.message);
            console.error('❌ Test failed:', error);
        }
        
        return test;
    },
    
    /**
     * Test 2: CSS Variables
     * Checks if CSS variables are properly injected and have values
     */
    testCSSVariables() {
        const test = {
            name: 'CSS Variables',
            passed: true,
            errors: [],
            data: {}
        };
        
        try {
            const root = document.documentElement;
            const computed = getComputedStyle(root);
            
            // Get all GMKB CSS variables
            const vars = {};
            for (let i = 0; i < computed.length; i++) {
                const prop = computed[i];
                if (prop.startsWith('--gmkb-')) {
                    const value = computed.getPropertyValue(prop).trim();
                    vars[prop] = value;
                }
            }
            
            test.data.variableCount = Object.keys(vars).length;
            test.data.variables = vars;
            
            console.log('CSS Variables Found:', test.data.variableCount);
            
            // Check critical variables
            const criticalVars = [
                '--gmkb-color-primary',
                '--gmkb-color-background',
                '--gmkb-font-primary',
                '--gmkb-border-radius',
                '--gmkb-spacing-md'
            ];
            
            const missing = [];
            const empty = [];
            
            criticalVars.forEach(varName => {
                const value = vars[varName];
                if (!value) {
                    missing.push(varName);
                } else if (value.trim() === '') {
                    empty.push(varName);
                }
            });
            
            test.data.criticalVars = {
                total: criticalVars.length,
                found: criticalVars.length - missing.length,
                missing,
                empty
            };
            
            if (missing.length > 0) {
                test.passed = false;
                test.errors.push(`Missing critical CSS variables: ${missing.join(', ')}`);
                console.error('❌ Missing variables:', missing);
            }
            
            if (empty.length > 0) {
                test.passed = false;
                test.errors.push(`Empty CSS variables: ${empty.join(', ')}`);
                console.error('❌ Empty variables:', empty);
            }
            
            // Sample critical values
            console.log('Sample Values:');
            console.table({
                'Primary Color': vars['--gmkb-color-primary'],
                'Background': vars['--gmkb-color-background'],
                'Font Family': vars['--gmkb-font-primary'],
                'Border Radius': vars['--gmkb-border-radius'],
                'Spacing': vars['--gmkb-spacing-md']
            });
            
            if (test.passed) {
                console.log('✅ All critical CSS variables present and valid');
            }
            
        } catch (error) {
            test.passed = false;
            test.errors.push(error.message);
            console.error('❌ Test failed:', error);
        }
        
        return test;
    },
    
    /**
     * Test 3: Component Fields
     * Verifies component data and rendered output
     */
    testComponentFields() {
        const test = {
            name: 'Component Fields',
            passed: true,
            errors: [],
            data: {}
        };
        
        try {
            const components = document.querySelectorAll('[data-component-id]');
            test.data.componentCount = components.length;
            test.data.components = [];
            
            console.log('Components Found:', components.length);
            
            components.forEach((el, index) => {
                const componentData = {
                    id: el.dataset.componentId,
                    type: el.dataset.componentType,
                    visible: el.offsetParent !== null,
                    hasContent: el.textContent.trim().length > 0,
                    classes: Array.from(el.classList),
                    computedStyles: {}
                };
                
                // Get computed styles for verification
                const computed = getComputedStyle(el);
                componentData.computedStyles = {
                    backgroundColor: computed.backgroundColor,
                    color: computed.color,
                    padding: computed.padding,
                    margin: computed.margin,
                    borderRadius: computed.borderRadius
                };
                
                // Check for empty/missing content
                if (!componentData.hasContent && componentData.type !== 'spacer') {
                    test.errors.push(`Component ${componentData.id} (${componentData.type}) has no content`);
                    console.warn(`⚠️ Empty component: ${componentData.type} (${componentData.id})`);
                }
                
                test.data.components.push(componentData);
            });
            
            // Log component summary
            console.log('Component Summary:');
            const summary = test.data.components.reduce((acc, comp) => {
                acc[comp.type] = (acc[comp.type] || 0) + 1;
                return acc;
            }, {});
            console.table(summary);
            
            if (test.errors.length === 0) {
                console.log('✅ All components have content');
            }
            
        } catch (error) {
            test.passed = false;
            test.errors.push(error.message);
            console.error('❌ Test failed:', error);
        }
        
        return test;
    },
    
    /**
     * Test 4: State vs DOM
     * Compares JavaScript state to actual DOM
     */
    testStateVsDOM() {
        const test = {
            name: 'State vs DOM',
            passed: true,
            errors: [],
            data: {}
        };
        
        try {
            // Get state from GMKB_DEBUG
            const components = window.GMKB_DEBUG?.components || {};
            const stateComponentCount = Object.keys(components).length;
            
            // Get DOM components
            const domComponents = document.querySelectorAll('[data-component-id]');
            const domComponentCount = domComponents.length;
            
            test.data.stateCount = stateComponentCount;
            test.data.domCount = domComponentCount;
            test.data.match = (stateComponentCount === domComponentCount);
            
            console.log('State Components:', stateComponentCount);
            console.log('DOM Components:', domComponentCount);
            console.log('Match:', test.data.match ? '✅' : '❌');
            
            if (!test.data.match) {
                test.passed = false;
                test.errors.push(`Component count mismatch! State: ${stateComponentCount}, DOM: ${domComponentCount}`);
            }
            
            // Check each component in state exists in DOM
            const missingInDOM = [];
            const missingInState = [];
            
            Object.keys(components).forEach(compId => {
                const el = document.querySelector(`[data-component-id="${compId}"]`);
                if (!el) {
                    missingInDOM.push(compId);
                }
            });
            
            domComponents.forEach(el => {
                const compId = el.dataset.componentId;
                if (!components[compId]) {
                    missingInState.push(compId);
                }
            });
            
            test.data.missingInDOM = missingInDOM;
            test.data.missingInState = missingInState;
            
            if (missingInDOM.length > 0) {
                test.passed = false;
                test.errors.push(`Components in state but not in DOM: ${missingInDOM.join(', ')}`);
                console.error('❌ Missing in DOM:', missingInDOM);
            }
            
            if (missingInState.length > 0) {
                console.warn('⚠️ Components in DOM but not in state:', missingInState);
            }
            
            if (test.passed && test.data.match) {
                console.log('✅ State and DOM are synchronized');
            }
            
        } catch (error) {
            test.passed = false;
            test.errors.push(error.message);
            console.error('❌ Test failed:', error);
        }
        
        return test;
    },
    
    /**
     * Test 5: Database Saved vs Frontend Display
     * Fetches saved data from WordPress and compares to frontend
     */
    async testSavedVsDisplayed() {
        const test = {
            name: 'Saved vs Displayed',
            passed: true,
            errors: [],
            data: {}
        };
        
        try {
            const postId = this.getPostIdFromDOM();
            
            if (!postId) {
                test.passed = false;
                test.errors.push('Could not determine post ID');
                console.error('❌ No post ID found');
                return test;
            }
            
            test.data.postId = postId;
            
            // Fetch saved state from WordPress
            console.log('Fetching saved state for post:', postId);
            const savedState = await this.fetchMediaKitState(postId);
            
            if (!savedState) {
                test.passed = false;
                test.errors.push('Could not fetch saved state from database');
                console.error('❌ Failed to fetch saved state');
                return test;
            }
            
            test.data.savedState = savedState;
            console.log('✅ Saved state fetched successfully');
            
            // Compare saved theme to displayed theme
            const savedTheme = savedState.theme || savedState.globalSettings?.theme;
            const displayedTheme = window.GMKB_DEBUG?.theme;
            test.data.themeMatch = (savedTheme === displayedTheme);
            
            console.log('Saved Theme:', savedTheme);
            console.log('Displayed Theme:', displayedTheme);
            console.log('Theme Match:', test.data.themeMatch ? '✅' : '❌');
            
            if (!test.data.themeMatch) {
                test.passed = false;
                test.errors.push(`Theme mismatch! Saved: ${savedTheme}, Displayed: ${displayedTheme}`);
            }
            
            // Compare component counts
            const savedComponentCount = Object.keys(savedState.components || {}).length;
            const displayedComponentCount = document.querySelectorAll('[data-component-id]').length;
            test.data.componentCountMatch = (savedComponentCount === displayedComponentCount);
            
            console.log('Saved Components:', savedComponentCount);
            console.log('Displayed Components:', displayedComponentCount);
            console.log('Count Match:', test.data.componentCountMatch ? '✅' : '❌');
            
            if (!test.data.componentCountMatch) {
                console.warn('⚠️ Component count mismatch');
            }
            
            // Sample component data comparison
            if (savedState.components) {
                const sampleComps = Object.entries(savedState.components).slice(0, 3);
                console.log('Sample Component Data:');
                sampleComps.forEach(([id, comp]) => {
                    const el = document.querySelector(`[data-component-id="${id}"]`);
                    console.group(`Component: ${comp.type} (${id})`);
                    console.log('Saved Data:', {
                        type: comp.type,
                        hasData: !!comp.data,
                        hasProps: !!comp.props,
                        hasSettings: !!comp.settings
                    });
                    console.log('DOM Element:', {
                        exists: !!el,
                        visible: el ? el.offsetParent !== null : false,
                        hasContent: el ? el.textContent.trim().length > 0 : false
                    });
                    console.groupEnd();
                });
            }
            
            if (test.passed) {
                console.log('✅ Saved data matches displayed data');
            }
            
        } catch (error) {
            test.passed = false;
            test.errors.push(error.message);
            console.error('❌ Test failed:', error);
        }
        
        return test;
    },
    
    /**
     * Compare admin builder values to frontend display
     * Requires admin state data (from localStorage or provided)
     */
    compareAdminToFrontend(adminState = null) {
        console.group('🔄 Admin Builder vs Frontend Comparison');
        
        if (!adminState) {
            // Try to get from localStorage (if on same domain)
            try {
                const stored = localStorage.getItem('gmkb_current_media_kit_state');
                if (stored) {
                    adminState = JSON.parse(stored);
                }
            } catch (e) {
                // Ignore
            }
        }
        
        if (!adminState) {
            console.warn('⚠️ Admin state not provided. To compare:');
            console.log('1. Open admin builder');
            console.log('2. Copy state: copy(window.GMKB.stores.mediaKit.getState())');
            console.log('3. Come back to frontend');
            console.log('4. Run: GMKB_FieldTest.compareAdminToFrontend(pastedStateHere)');
            console.groupEnd();
            return;
        }
        
        const results = {
            theme: {},
            components: {},
            customizations: {}
        };
        
        // Compare themes
        const adminTheme = adminState.theme || adminState.globalSettings?.theme;
        const frontendTheme = window.GMKB_DEBUG?.theme;
        results.theme.match = (adminTheme === frontendTheme);
        results.theme.admin = adminTheme;
        results.theme.frontend = frontendTheme;
        
        console.log('Theme Comparison:');
        console.log('  Admin:', adminTheme);
        console.log('  Frontend:', frontendTheme);
        console.log('  Match:', results.theme.match ? '✅' : '❌');
        
        // Compare component counts
        const adminCompCount = Object.keys(adminState.components || {}).length;
        const frontendCompCount = document.querySelectorAll('[data-component-id]').length;
        results.components.match = (adminCompCount === frontendCompCount);
        results.components.admin = adminCompCount;
        results.components.frontend = frontendCompCount;
        
        console.log('Component Count:');
        console.log('  Admin:', adminCompCount);
        console.log('  Frontend:', frontendCompCount);
        console.log('  Match:', results.components.match ? '✅' : '❌');
        
        // Compare customizations
        const adminCustoms = adminState.themeCustomizations || {};
        console.log('Customizations:');
        console.log('  Admin has customizations:', !this.isEmpty(adminCustoms));
        console.log('  Admin customization sections:', Object.keys(adminCustoms));
        
        console.groupEnd();
        
        return results;
    },
    
    /**
     * Print test summary
     */
    printSummary(results) {
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #94a3b8;');
        console.log('%c📊 TEST SUMMARY', 'font-size: 18px; font-weight: bold; color: #2563eb;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #94a3b8;');
        
        const allTests = Object.values(results.tests);
        const passedTests = allTests.filter(t => t.passed).length;
        const failedTests = allTests.length - passedTests;
        const totalErrors = allTests.reduce((sum, t) => sum + t.errors.length, 0);
        
        console.log('');
        console.log(`Total Tests: ${allTests.length}`);
        console.log(`%c✅ Passed: ${passedTests}`, 'color: #10b981; font-weight: bold;');
        if (failedTests > 0) {
            console.log(`%c❌ Failed: ${failedTests}`, 'color: #ef4444; font-weight: bold;');
        }
        if (totalErrors > 0) {
            console.log(`%c⚠️ Total Errors: ${totalErrors}`, 'color: #f59e0b; font-weight: bold;');
        }
        console.log('');
        
        // List failed tests
        if (failedTests > 0) {
            console.log('%c━━ Failed Tests ━━', 'color: #ef4444; font-weight: bold;');
            allTests.forEach(test => {
                if (!test.passed) {
                    console.group(`❌ ${test.name}`);
                    test.errors.forEach(err => console.error('  →', err));
                    console.groupEnd();
                }
            });
            console.log('');
        }
        
        // Overall result
        if (failedTests === 0) {
            console.log('%c🎉 ALL TESTS PASSED!', 'font-size: 16px; color: #10b981; font-weight: bold; background: #d1fae5; padding: 8px;');
        } else {
            console.log('%c⚠️ SOME TESTS FAILED', 'font-size: 16px; color: #ef4444; font-weight: bold; background: #fee2e2; padding: 8px;');
            console.log('Review errors above and check:');
            console.log('  1. Theme loaded correctly');
            console.log('  2. CSS variables injected');
            console.log('  3. Components rendered');
            console.log('  4. Saved data matches display');
        }
        
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #94a3b8;');
    },
    
    /**
     * Helper: Get post ID from DOM
     */
    getPostIdFromDOM() {
        const el = document.querySelector('[data-media-kit-id], [data-gmkb-post-id]');
        return el ? (el.dataset.mediaKitId || el.dataset.gmkbPostId) : null;
    },
    
    /**
     * Helper: Check if object is empty
     */
    isEmpty(obj) {
        return !obj || Object.keys(obj).length === 0;
    },
    
    /**
     * Helper: Fetch media kit state from WordPress
     */
    async fetchMediaKitState(postId) {
        try {
            const response = await fetch(
                `/wp-json/gmkb/v1/media-kit/${postId}`,
                {
                    credentials: 'same-origin'
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data.state || data;
            
        } catch (error) {
            console.error('Failed to fetch state:', error);
            
            // Fallback: Try via AJAX
            return new Promise((resolve, reject) => {
                if (!window.jQuery) {
                    reject(new Error('jQuery not available'));
                    return;
                }
                
                jQuery.ajax({
                    url: window.ajaxurl || '/wp-admin/admin-ajax.php',
                    method: 'POST',
                    data: {
                        action: 'gmkb_get_media_kit_state',
                        post_id: postId
                    },
                    success: (response) => {
                        if (response.success) {
                            resolve(response.data);
                        } else {
                            reject(new Error(response.data || 'Failed to fetch'));
                        }
                    },
                    error: (xhr, status, error) => {
                        reject(new Error(error || status));
                    }
                });
            });
        }
    },
    
    /**
     * Helper: Fetch theme customizations from post meta
     */
    async fetchThemeCustomizations(postId) {
        try {
            const response = await fetch(
                `/wp-json/gmkb/v1/media-kit/${postId}/customizations`,
                {
                    credentials: 'same-origin'
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.warn('Could not fetch customizations via REST API');
            return null;
        }
    },
    
    /**
     * Quick helper commands
     */
    help() {
        console.log('%c🔍 GMKB Field Verification Test - Commands', 'font-size: 16px; font-weight: bold; color: #2563eb;');
        console.log('');
        console.log('%cMain Commands:', 'font-weight: bold;');
        console.log('  GMKB_FieldTest.runFullDiagnostic()          - Run all tests');
        console.log('  GMKB_FieldTest.testThemeCustomizations()    - Test theme only');
        console.log('  GMKB_FieldTest.testCSSVariables()           - Test CSS vars only');
        console.log('  GMKB_FieldTest.testComponentFields()        - Test components only');
        console.log('  GMKB_FieldTest.testStateVsDOM()             - Test state sync');
        console.log('  GMKB_FieldTest.testSavedVsDisplayed()       - Test DB vs frontend');
        console.log('');
        console.log('%cComparison:', 'font-weight: bold;');
        console.log('  GMKB_FieldTest.compareAdminToFrontend()     - Compare admin to frontend');
        console.log('');
        console.log('%cResults:', 'font-weight: bold;');
        console.log('  window.GMKB_TestResults                     - Last test results');
        console.log('');
    }
};

// Auto-run help on load
console.log('');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #94a3b8;');
console.log('%c✅ GMKB Field Verification Test Loaded', 'font-size: 16px; font-weight: bold; color: #10b981;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #94a3b8;');
console.log('');
console.log('Type %cGMKB_FieldTest.help()%c for commands', 'color: #2563eb; font-weight: bold;', '');
console.log('or run: %cGMKB_FieldTest.runFullDiagnostic()%c', 'color: #10b981; font-weight: bold;', '');
console.log('');
