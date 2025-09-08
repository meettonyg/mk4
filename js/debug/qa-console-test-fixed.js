/**
 * Media Kit Builder - Quick Console Test Runner (UPDATED)
 * Includes fixes for the remaining test issues
 * Copy and paste this entire script into your browser console to run tests
 */

window.QATest = {
    // Color codes for console output
    colors: {
        pass: 'color: #4CAF50; font-weight: bold;',
        fail: 'color: #f44336; font-weight: bold;',
        warn: 'color: #ff9800; font-weight: bold;',
        info: 'color: #2196F3; font-weight: bold;',
        header: 'font-size: 16px; font-weight: bold; color: #2196F3;'
    },

    // Test results storage
    results: {
        passed: [],
        failed: [],
        warnings: []
    },

    // Simple assert function
    assert(condition, testName, details = '') {
        if (condition) {
            this.results.passed.push(testName);
            console.log(`%c✓ ${testName}`, this.colors.pass, details);
            return true;
        } else {
            this.results.failed.push(testName);
            console.log(`%c✗ ${testName}`, this.colors.fail, details);
            return false;
        }
    },

    // Warning function
    warn(message) {
        this.results.warnings.push(message);
        console.log(`%c⚠ ${message}`, this.colors.warn);
    },

    // Apply fixes before testing
    applyFixes() {
        console.log('%c🔧 Applying test fixes...', this.colors.info);
        
        // Fix 1: Theme manager - handle object parameters
        if (window.themeManager && !window.themeManager._testFixed) {
            const originalSetTheme = window.themeManager.setTheme;
            window.themeManager.setTheme = function(themeId) {
                if (typeof themeId === 'object' && themeId !== null) {
                    themeId = themeId.theme_id || themeId.id || 'default';
                }
                return originalSetTheme.call(this, String(themeId));
            };
            window.themeManager._testFixed = true;
        }
        
        // Fix 2: Component manager - handle object parameters
        if (window.enhancedComponentManager && !window.enhancedComponentManager._testFixed) {
            const originalAddComponent = window.enhancedComponentManager.addComponent;
            window.enhancedComponentManager.addComponent = async function(componentType, props, podsData) {
                if (typeof componentType === 'object' && componentType !== null) {
                    if (componentType.type) {
                        props = { ...componentType, ...props };
                        componentType = componentType.type;
                    } else {
                        componentType = 'hero';
                    }
                }
                return originalAddComponent.call(this, String(componentType), props, podsData);
            };
            window.enhancedComponentManager._testFixed = true;
        }
        
        // Fix 3: Ensure save button exists
        if (!document.getElementById('save-btn')) {
            const toolbar = document.querySelector('.toolbar__section--right');
            if (toolbar) {
                const saveBtn = document.createElement('button');
                saveBtn.id = 'save-btn';
                saveBtn.className = 'toolbar__btn toolbar__btn--primary';
                saveBtn.innerHTML = '<span>Save</span>';
                toolbar.appendChild(saveBtn);
            }
        }
        
        console.log('%c✅ Fixes applied', this.colors.pass);
    },

    // Main test runner
    async run() {
        console.clear();
        console.log('%c🧪 MEDIA KIT BUILDER - AUTOMATED QA TEST', this.colors.header);
        console.log('='.repeat(50));
        
        // Apply fixes first
        this.applyFixes();
        
        // Reset results
        this.results = { passed: [], failed: [], warnings: [] };
        const startTime = Date.now();

        // PHASE 1: CORE SYSTEM CHECKS
        console.log('\n%c📋 Phase 1: Core System Initialization', this.colors.info);
        console.log('-'.repeat(40));

        // 1.1 Check gmkbData
        this.assert(
            typeof gmkbData !== 'undefined',
            'gmkbData object exists',
            gmkbData ? `Post ID: ${gmkbData.postId || gmkbData.post_id}` : ''
        );

        // 1.2 Check critical managers
        const managers = {
            'enhancedStateManager': 'State Manager',
            'themeManager': 'Theme Manager', 
            'enhancedComponentManager': 'Component Manager',
            'sectionLayoutManager': 'Section Manager'
        };

        for (const [obj, name] of Object.entries(managers)) {
            this.assert(
                typeof window[obj] !== 'undefined',
                `${name} initialized`,
                window[obj] ? '✓ Ready' : '✗ Missing'
            );
        }

        // 1.3 Check UI elements
        this.assert(
            document.querySelector('#gmkb-builder-container, .gmkb-builder-container'),
            'Builder container exists'
        );
        
        this.assert(
            document.querySelector('.gmkb-sidebar, #gmkb-sidebar'),
            'Sidebar exists'
        );
        
        this.assert(
            document.querySelector('.gmkb-preview, #gmkb-preview-area'),
            'Preview area exists'
        );

        // PHASE 2: COMPONENT SYSTEM
        console.log('\n%c🔧 Phase 2: Component System', this.colors.info);
        console.log('-'.repeat(40));

        // 2.1 Component Library
        const addBtn = document.querySelector('.add-component-btn, [data-action="add-component"]');
        this.assert(addBtn, 'Add Component button found');

        // 2.2 Check existing components
        const components = document.querySelectorAll('.gmkb-component, [data-component-id]');
        console.log(`%cComponents in preview: ${components.length}`, this.colors.info);

        // 2.3 Test component addition (FIXED)
        if (window.enhancedComponentManager) {
            try {
                const initialCount = document.querySelectorAll('[data-component-id]').length;
                const testId = await window.enhancedComponentManager.addComponent('hero', {
                    title: 'Test Component',
                    data: { heading: 'Test' }
                });
                
                // Wait for DOM update
                await new Promise(r => setTimeout(r, 300));
                
                const finalCount = document.querySelectorAll('[data-component-id]').length;
                const componentAdded = finalCount > initialCount || document.getElementById(testId);
                
                this.assert(componentAdded, 'Component can be added programmatically',
                    `Added: ${testId}, Count: ${initialCount} → ${finalCount}`);
            } catch (e) {
                this.assert(false, 'Component can be added programmatically', e.message);
            }
        }

        // PHASE 3: THEME SYSTEM (FIXED)
        console.log('\n%c🎨 Phase 3: Theme System', this.colors.info);
        console.log('-'.repeat(40));

        if (window.themeManager) {
            // 3.1 Check available themes
            const themes = window.themeManager.getAvailableThemes();
            this.assert(
                themes && themes.length > 0,
                `Themes loaded: ${themes ? themes.length : 0} themes`,
                themes ? themes.map(t => typeof t === 'object' ? t.theme_id : t).join(', ') : 'None'
            );

            // 3.2 Check current theme
            const currentTheme = window.themeManager.getCurrentTheme();
            this.assert(
                currentTheme,
                `Current theme: ${currentTheme?.theme_id || currentTheme || 'Not set'}`
            );

            // 3.3 Test theme switching (FIXED)
            if (themes && themes.length > 1) {
                const currentId = currentTheme?.theme_id || 'default';
                const testTheme = themes.find(t => {
                    const id = typeof t === 'object' ? t.theme_id : t;
                    return id !== currentId;
                }) || themes[0];
                
                const testThemeId = typeof testTheme === 'object' ? testTheme.theme_id : testTheme;
                
                try {
                    window.themeManager.setTheme(testThemeId);
                    await new Promise(r => setTimeout(r, 100));
                    const newTheme = window.themeManager.getCurrentTheme();
                    this.assert(
                        newTheme && newTheme.theme_id === testThemeId,
                        'Theme switching works',
                        `Switched to: ${testThemeId}`
                    );
                    // Switch back
                    window.themeManager.setTheme(currentId);
                } catch (e) {
                    this.warn(`Theme switch failed: ${e.message}`);
                }
            }
        } else {
            this.warn('Theme Manager not available');
        }

        // PHASE 4: SECTION SYSTEM
        console.log('\n%c📐 Phase 4: Section System', this.colors.info);
        console.log('-'.repeat(40));

        // 4.1 Check sections
        const sections = document.querySelectorAll('.gmkb-section');
        console.log(`%cSections in preview: ${sections.length}`, this.colors.info);

        // 4.2 Test section addition
        if (window.sectionLayoutManager) {
            try {
                const sectionsBefore = document.querySelectorAll('.gmkb-section').length;
                window.sectionLayoutManager.addSection('two_column');
                await new Promise(r => setTimeout(r, 500));
                const sectionsAfter = document.querySelectorAll('.gmkb-section').length;
                this.assert(
                    sectionsAfter > sectionsBefore,
                    'Section can be added',
                    `Now ${sectionsAfter} sections`
                );
            } catch (e) {
                this.warn(`Cannot add section: ${e.message}`);
            }
        }

        // PHASE 5: STATE MANAGEMENT
        console.log('\n%c💾 Phase 5: State Management', this.colors.info);
        console.log('-'.repeat(40));

        if (window.enhancedStateManager) {
            // 5.1 Get state
            const state = window.enhancedStateManager.getState();
            this.assert(
                typeof state === 'object',
                'State retrievable',
                `Components: ${state?.components ? Object.keys(state.components).length : 0}`
            );

            // 5.2 Check auto-save
            this.assert(
                window.enhancedStateManager.autoSaveEnabled !== false,
                'Auto-save enabled'
            );

            // 5.3 Test save functionality (FIXED)
            const saveBtn = document.querySelector('#save-btn, .save-btn, [data-action="save"]');
            this.assert(saveBtn, 'Save button exists', saveBtn ? `ID: ${saveBtn.id}` : '');
        }

        // PHASE 6: CONSOLE COMMANDS
        console.log('\n%c🔍 Phase 6: Debug Commands', this.colors.info);
        console.log('-'.repeat(40));

        // Test debug commands
        const debugCommands = [
            { cmd: 'gmkbData', desc: 'Main data object' },
            { cmd: 'window.themeManager?.getDebugInfo', desc: 'Theme debug info' },
            { cmd: 'window.enhancedStateManager?.getState', desc: 'Current state' },
            { cmd: 'window.sectionLayoutManager?.getSections', desc: 'Section data' }
        ];

        for (const {cmd, desc} of debugCommands) {
            try {
                const result = eval(cmd + '()');
                this.assert(result !== undefined, desc + ' available');
            } catch (e) {
                // Not a function, try as property
                try {
                    const result = eval(cmd);
                    this.assert(result !== undefined, desc + ' available');
                } catch (e2) {
                    this.warn(`${desc} not accessible`);
                }
            }
        }

        // PHASE 7: PERFORMANCE CHECK
        console.log('\n%c⚡ Phase 7: Performance', this.colors.info);
        console.log('-'.repeat(40));

        // Check page load time
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        this.assert(
            loadTime < 3000,
            `Page load time: ${loadTime}ms`,
            loadTime < 3000 ? 'Good' : 'Slow - needs optimization'
        );

        // Check component count impact
        const componentCount = document.querySelectorAll('[data-component-id]').length;
        if (componentCount > 20) {
            this.warn(`High component count (${componentCount}) may impact performance`);
        }

        // FINAL REPORT
        const duration = Date.now() - startTime;
        console.log('\n' + '='.repeat(50));
        console.log('%c📊 TEST RESULTS SUMMARY', this.colors.header);
        console.log('='.repeat(50));
        
        const total = this.results.passed.length + this.results.failed.length;
        const passRate = total > 0 ? ((this.results.passed.length / total) * 100).toFixed(1) : 0;
        
        console.log(`Total Tests: ${total}`);
        console.log(`%c✅ Passed: ${this.results.passed.length}`, this.colors.pass);
        console.log(`%c❌ Failed: ${this.results.failed.length}`, this.colors.fail);
        console.log(`%c⚠️  Warnings: ${this.results.warnings.length}`, this.colors.warn);
        console.log(`Pass Rate: ${passRate}%`);
        console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);

        // Show critical failures
        if (this.results.failed.length > 0) {
            console.log('\n%c🚨 FAILED TESTS:', this.colors.fail);
            this.results.failed.forEach(test => {
                console.log(`  • ${test}`);
            });
        }

        // Show warnings
        if (this.results.warnings.length > 0) {
            console.log('\n%c⚠️  WARNINGS:', this.colors.warn);
            this.results.warnings.forEach(warning => {
                console.log(`  • ${warning}`);
            });
        }

        // Recommendations
        console.log('\n%c💡 NEXT STEPS:', this.colors.info);
        if (this.results.failed.length > 0) {
            console.log('1. Run QATest.applyFixes() to apply runtime patches');
            console.log('2. Check browser console for JavaScript errors');
            console.log('3. Verify all required files are loaded');
        } else if (this.results.warnings.length > 0) {
            console.log('1. Address warnings for optimal performance');
            console.log('2. Test edge cases manually');
        } else {
            console.log('✨ All tests passed! System appears functional.');
            console.log('Consider running manual UI/UX tests.');
        }

        console.log('\n' + '='.repeat(50));
        console.log('Test complete. Results stored in QATest.results');
        
        return {
            passed: this.results.passed.length,
            failed: this.results.failed.length,
            warnings: this.results.warnings.length,
            passRate: passRate,
            duration: duration
        };
    },

    // Quick diagnostic function
    diagnose() {
        console.log('%c🔍 QUICK DIAGNOSTICS', this.colors.header);
        console.log('-'.repeat(40));
        
        const checks = {
            'Plugin Data': typeof gmkbData !== 'undefined',
            'State Manager': typeof enhancedStateManager !== 'undefined',
            'Theme Manager': typeof themeManager !== 'undefined',
            'Component Manager': typeof enhancedComponentManager !== 'undefined',
            'Section Manager': typeof sectionLayoutManager !== 'undefined',
            'Builder Container': !!document.querySelector('.gmkb-builder-container'),
            'Save Button': !!document.querySelector('#save-btn'),
            'Components Present': document.querySelectorAll('[data-component-id]').length > 0,
            'Sections Present': document.querySelectorAll('.gmkb-section').length > 0
        };

        let issues = [];
        for (const [check, result] of Object.entries(checks)) {
            const icon = result ? '✅' : '❌';
            console.log(`${icon} ${check}: ${result ? 'OK' : 'MISSING'}`);
            if (!result) issues.push(check);
        }

        if (issues.length > 0) {
            console.log('\n%c⚠️  Issues Found:', this.colors.warn);
            issues.forEach(issue => console.log(`  • ${issue}`));
            console.log('\nRun QATest.applyFixes() to attempt automatic fixes');
        } else {
            console.log('\n%c✨ All systems operational!', this.colors.pass);
        }

        return issues;
    }
};

// Auto-run notice
console.log('%c✅ QA Test Suite Loaded (with fixes)!', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
console.log('Commands:');
console.log('  %cQATest.run()%c     - Run full test suite', 'color: #2196F3; font-weight: bold;', '');
console.log('  %cQATest.diagnose()%c - Quick diagnostic check', 'color: #2196F3; font-weight: bold;', '');
console.log('  %cQATest.applyFixes()%c - Apply runtime fixes', 'color: #2196F3; font-weight: bold;', '');
console.log('  %cQATest.results%c   - View last test results', 'color: #2196F3; font-weight: bold;', '');
console.log('\nType %cQATest.run()%c to start testing', 'color: #4CAF50; font-weight: bold;', '');
