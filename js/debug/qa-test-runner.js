/**
 * Media Kit Builder - Automated Test Runner with Fix Detection
 * This script not only tests but also identifies root causes and suggests fixes
 */

(function(window) {
    'use strict';

    window.MKTestRunner = {
        issues: [],
        fixes: [],
        
        // Main diagnostic runner
        async runDiagnostics() {
            console.clear();
            console.log('%c🔬 Media Kit Builder Diagnostic Test Runner', 'font-size: 18px; font-weight: bold; color: #2196F3;');
            console.log('='.repeat(60));
            
            this.issues = [];
            this.fixes = [];
            
            // Run all diagnostic checks
            await this.checkCriticalSystems();
            await this.checkComponentSystem();
            await this.checkThemeSystem();
            await this.checkSectionSystem();
            await this.checkStateManagement();
            await this.checkEventSystem();
            await this.checkUIElements();
            await this.checkAjaxEndpoints();
            
            // Generate report with fixes
            this.generateFixReport();
        },
        
        // Check critical systems initialization
        async checkCriticalSystems() {
            console.log('\n%c🔍 Checking Critical Systems...', 'color: #FFC107;');
            
            // Check gmkbData
            if (typeof gmkbData === 'undefined') {
                this.issues.push({
                    severity: 'critical',
                    system: 'Core',
                    issue: 'gmkbData not defined',
                    cause: 'PHP localization failed or script enqueue order issue',
                    fix: 'Check wp_localize_script in enqueue.php'
                });
            } else {
                // Check gmkbData properties
                const requiredProps = ['ajaxUrl', 'nonce', 'postId'];
                requiredProps.forEach(prop => {
                    if (!gmkbData[prop] && !gmkbData[prop.replace(/([A-Z])/g, '_$1').toLowerCase()]) {
                        this.issues.push({
                            severity: 'high',
                            system: 'Core',
                            issue: `gmkbData.${prop} missing`,
                            cause: 'Incomplete data localization',
                            fix: `Add ${prop} to wp_localize_script array`
                        });
                    }
                });
            }
            
            // Check managers initialization
            const managers = [
                { name: 'enhancedStateManager', file: 'enhanced-state-manager.js' },
                { name: 'themeManager', file: 'theme-manager.js' },
                { name: 'enhancedComponentManager', file: 'enhanced-component-manager.js' },
                { name: 'sectionLayoutManager', file: 'section-layout-manager.js' }
            ];
            
            for (const manager of managers) {
                if (typeof window[manager.name] === 'undefined') {
                    this.issues.push({
                        severity: 'critical',
                        system: 'Initialization',
                        issue: `${manager.name} not initialized`,
                        cause: `${manager.file} not loaded or initialization failed`,
                        fix: `Check if ${manager.file} is enqueued and has no JS errors`
                    });
                    
                    // Check if file is in DOM
                    const scriptTag = document.querySelector(`script[src*="${manager.file}"]`);
                    if (!scriptTag) {
                        this.fixes.push({
                            file: 'includes/enqueue.php',
                            action: `Add wp_enqueue_script for ${manager.file}`,
                            code: `wp_enqueue_script('gmkb-${manager.name}', GMKB_PLUGIN_URL . 'js/managers/${manager.file}', array('gmkb-core'), GMKB_VERSION, true);`
                        });
                    }
                } else {
                    console.log(`✅ ${manager.name} initialized`);
                }
            }
        },
        
        // Check component system
        async checkComponentSystem() {
            console.log('\n%c🔧 Checking Component System...', 'color: #FFC107;');
            
            // Check if component discovery worked
            if (window.enhancedComponentManager) {
                try {
                    const components = await this.getAvailableComponents();
                    if (!components || components.length === 0) {
                        this.issues.push({
                            severity: 'high',
                            system: 'Components',
                            issue: 'No components discovered',
                            cause: 'ComponentDiscovery.php not finding component directories',
                            fix: 'Check /components/ directory structure and ComponentDiscovery.php'
                        });
                    } else {
                        console.log(`✅ Found ${components.length} components`);
                    }
                } catch (error) {
                    this.issues.push({
                        severity: 'high',
                        system: 'Components',
                        issue: 'Component discovery failed',
                        cause: error.message,
                        fix: 'Check AJAX endpoint gmkb_get_available_components'
                    });
                }
            }
            
            // Check component library modal
            const libButton = document.querySelector('.add-component-btn, [data-action="add-component"]');
            if (!libButton) {
                this.issues.push({
                    severity: 'medium',
                    system: 'UI',
                    issue: 'Add Component button missing',
                    cause: 'Button not rendered in template',
                    fix: 'Check builder template for add component button'
                });
            }
        },
        
        // Check theme system
        async checkThemeSystem() {
            console.log('\n%c🎨 Checking Theme System...', 'color: #FFC107;');
            
            if (window.themeManager) {
                try {
                    const themes = window.themeManager.getAvailableThemes();
                    if (!themes || themes.length === 0) {
                        this.issues.push({
                            severity: 'high',
                            system: 'Themes',
                            issue: 'No themes loaded',
                            cause: 'ThemeDiscovery.php not finding theme directories',
                            fix: 'Check /themes/ directory and ThemeDiscovery.php'
                        });
                        
                        this.fixes.push({
                            file: 'includes/discovery/ThemeDiscovery.php',
                            action: 'Verify theme directory scanning',
                            code: `
// In ThemeDiscovery.php, ensure:
public function discover_themes() {
    $theme_dir = GMKB_PLUGIN_DIR . 'themes/';
    if (!is_dir($theme_dir)) {
        error_log('Theme directory not found: ' . $theme_dir);
        return [];
    }
    // ... rest of discovery logic
}`
                        });
                    } else {
                        console.log(`✅ Found ${themes.length} themes`);
                        
                        // Check if themes are applying
                        const currentTheme = window.themeManager.getCurrentTheme();
                        if (!currentTheme) {
                            this.issues.push({
                                severity: 'medium',
                                system: 'Themes',
                                issue: 'No theme currently set',
                                cause: 'Theme not initialized or saved',
                                fix: 'Set default theme in initialization'
                            });
                        }
                    }
                } catch (error) {
                    this.issues.push({
                        severity: 'high',
                        system: 'Themes',
                        issue: 'Theme system error',
                        cause: error.message,
                        fix: 'Check theme-manager.js for errors'
                    });
                }
            }
        },
        
        // Check section system
        async checkSectionSystem() {
            console.log('\n%c📐 Checking Section System...', 'color: #FFC107;');
            
            if (window.sectionLayoutManager) {
                try {
                    const sections = window.sectionLayoutManager.getSections();
                    console.log(`✅ Section manager has ${sections.length} sections`);
                    
                    // Check if sections render properly
                    const sectionElements = document.querySelectorAll('.gmkb-section');
                    if (sections.length > 0 && sectionElements.length === 0) {
                        this.issues.push({
                            severity: 'high',
                            system: 'Sections',
                            issue: 'Sections not rendering',
                            cause: 'Section renderer not working',
                            fix: 'Check section rendering in preview area'
                        });
                    }
                } catch (error) {
                    this.issues.push({
                        severity: 'medium',
                        system: 'Sections',
                        issue: 'Section system error',
                        cause: error.message,
                        fix: 'Check section-layout-manager.js'
                    });
                }
            }
        },
        
        // Check state management
        async checkStateManagement() {
            console.log('\n%c💾 Checking State Management...', 'color: #FFC107;');
            
            if (window.enhancedStateManager) {
                try {
                    const state = window.enhancedStateManager.getState();
                    if (!state) {
                        this.issues.push({
                            severity: 'critical',
                            system: 'State',
                            issue: 'State is null/undefined',
                            cause: 'State not initialized',
                            fix: 'Check state initialization in enhanced-state-manager.js'
                        });
                    } else {
                        console.log(`✅ State loaded with ${state.components?.length || 0} components`);
                        
                        // Check if state structure is valid
                        const requiredKeys = ['components', 'layout', 'sections', 'theme'];
                        requiredKeys.forEach(key => {
                            if (!(key in state)) {
                                this.issues.push({
                                    severity: 'medium',
                                    system: 'State',
                                    issue: `State missing '${key}' property`,
                                    cause: 'Incomplete state structure',
                                    fix: `Add ${key} to initial state in state-schema.js`
                                });
                            }
                        });
                    }
                    
                    // Check save functionality
                    const saveEndpoint = gmkbData?.ajaxUrl;
                    if (!saveEndpoint) {
                        this.issues.push({
                            severity: 'critical',
                            system: 'State',
                            issue: 'Cannot save - no AJAX URL',
                            cause: 'AJAX URL not provided',
                            fix: 'Check wp_localize_script in enqueue.php'
                        });
                    }
                } catch (error) {
                    this.issues.push({
                        severity: 'critical',
                        system: 'State',
                        issue: 'State manager error',
                        cause: error.message,
                        fix: 'Debug enhanced-state-manager.js'
                    });
                }
            }
        },
        
        // Check event system
        async checkEventSystem() {
            console.log('\n%c📡 Checking Event System...', 'color: #FFC107;');
            
            // Check if event system is working
            let eventReceived = false;
            const testHandler = () => { eventReceived = true; };
            
            document.addEventListener('gmkb:test-event', testHandler);
            document.dispatchEvent(new CustomEvent('gmkb:test-event'));
            
            await new Promise(r => setTimeout(r, 100));
            
            if (!eventReceived) {
                this.issues.push({
                    severity: 'critical',
                    system: 'Events',
                    issue: 'Event system not working',
                    cause: 'Events not propagating',
                    fix: 'Check event initialization'
                });
            } else {
                console.log('✅ Event system working');
            }
            
            document.removeEventListener('gmkb:test-event', testHandler);
            
            // Check for race conditions
            if (window.gmkbInitOrder) {
                const order = window.gmkbInitOrder;
                console.log('Initialization order:', order);
                
                // Check if systems initialized in wrong order
                const correctOrder = ['state', 'theme', 'component', 'section'];
                // Analysis would go here
            }
        },
        
        // Check UI elements
        async checkUIElements() {
            console.log('\n%c🖼️ Checking UI Elements...', 'color: #FFC107;');
            
            const elements = [
                { selector: '.gmkb-builder-container, #gmkb-builder-container', name: 'Builder Container' },
                { selector: '.gmkb-sidebar, #gmkb-sidebar', name: 'Sidebar' },
                { selector: '.gmkb-preview, #gmkb-preview-area', name: 'Preview Area' },
                { selector: '.gmkb-toolbar, #gmkb-toolbar', name: 'Toolbar' },
                { selector: '.save-btn, [data-action="save"]', name: 'Save Button' },
                { selector: '.add-component-btn', name: 'Add Component Button' }
            ];
            
            elements.forEach(({ selector, name }) => {
                const element = document.querySelector(selector);
                if (!element) {
                    this.issues.push({
                        severity: 'medium',
                        system: 'UI',
                        issue: `${name} not found`,
                        cause: 'Element not rendered',
                        fix: `Check template for ${name}`
                    });
                } else {
                    console.log(`✅ ${name} found`);
                }
            });
        },
        
        // Check AJAX endpoints
        async checkAjaxEndpoints() {
            console.log('\n%c🔌 Checking AJAX Endpoints...', 'color: #FFC107;');
            
            if (!gmkbData?.ajaxUrl || !gmkbData?.nonce) {
                console.log('⚠️ Cannot test AJAX - missing URL or nonce');
                return;
            }
            
            const endpoints = [
                'gmkb_get_available_components',
                'gmkb_save_media_kit',
                'gmkb_load_media_kit',
                'gmkb_get_themes'
            ];
            
            for (const action of endpoints) {
                try {
                    const response = await fetch(gmkbData.ajaxUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            action: action,
                            nonce: gmkbData.nonce,
                            post_id: gmkbData.postId || gmkbData.post_id || ''
                        })
                    });
                    
                    if (!response.ok) {
                        this.issues.push({
                            severity: 'high',
                            system: 'AJAX',
                            issue: `Endpoint ${action} failed`,
                            cause: `HTTP ${response.status}`,
                            fix: `Check PHP handler for ${action}`
                        });
                    } else {
                        const data = await response.json();
                        if (!data.success) {
                            this.issues.push({
                                severity: 'medium',
                                system: 'AJAX',
                                issue: `${action} returned error`,
                                cause: data.data || 'Unknown error',
                                fix: `Debug ${action} handler in PHP`
                            });
                        } else {
                            console.log(`✅ ${action} working`);
                        }
                    }
                } catch (error) {
                    this.issues.push({
                        severity: 'high',
                        system: 'AJAX',
                        issue: `${action} request failed`,
                        cause: error.message,
                        fix: 'Check network and PHP errors'
                    });
                }
            }
        },
        
        // Helper to get available components
        async getAvailableComponents() {
            if (!gmkbData?.ajaxUrl) return [];
            
            const response = await fetch(gmkbData.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'gmkb_get_available_components',
                    nonce: gmkbData.nonce
                })
            });
            
            const data = await response.json();
            return data.success ? data.data : [];
        },
        
        // Generate fix report
        generateFixReport() {
            console.log('\n' + '='.repeat(60));
            console.log('%c📊 DIAGNOSTIC REPORT', 'font-size: 18px; font-weight: bold; color: #2196F3;');
            console.log('='.repeat(60));
            
            if (this.issues.length === 0) {
                console.log('%c✨ No issues found! System appears to be working correctly.', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
                return;
            }
            
            // Group issues by severity
            const critical = this.issues.filter(i => i.severity === 'critical');
            const high = this.issues.filter(i => i.severity === 'high');
            const medium = this.issues.filter(i => i.severity === 'medium');
            
            // Show critical issues
            if (critical.length > 0) {
                console.log('\n%c🚨 CRITICAL ISSUES (Fix immediately):', 'color: #f44336; font-weight: bold; font-size: 14px;');
                critical.forEach(issue => {
                    console.log(`\n  ❌ ${issue.issue}`);
                    console.log(`     System: ${issue.system}`);
                    console.log(`     Cause: ${issue.cause}`);
                    console.log(`     Fix: ${issue.fix}`);
                });
            }
            
            // Show high priority issues
            if (high.length > 0) {
                console.log('\n%c⚠️  HIGH PRIORITY ISSUES:', 'color: #ff9800; font-weight: bold; font-size: 14px;');
                high.forEach(issue => {
                    console.log(`\n  ⚠️  ${issue.issue}`);
                    console.log(`     System: ${issue.system}`);
                    console.log(`     Cause: ${issue.cause}`);
                    console.log(`     Fix: ${issue.fix}`);
                });
            }
            
            // Show medium priority issues
            if (medium.length > 0) {
                console.log('\n%c📍 MEDIUM PRIORITY ISSUES:', 'color: #FFC107; font-weight: bold; font-size: 14px;');
                medium.forEach(issue => {
                    console.log(`\n  📍 ${issue.issue}`);
                    console.log(`     System: ${issue.system}`);
                    console.log(`     Fix: ${issue.fix}`);
                });
            }
            
            // Show specific fixes
            if (this.fixes.length > 0) {
                console.log('\n%c🔧 SPECIFIC FIXES TO APPLY:', 'color: #2196F3; font-weight: bold; font-size: 14px;');
                this.fixes.forEach(fix => {
                    console.log(`\n  File: ${fix.file}`);
                    console.log(`  Action: ${fix.action}`);
                    if (fix.code) {
                        console.log(`  Code:\n${fix.code}`);
                    }
                });
            }
            
            // Priority order
            console.log('\n%c📋 FIX PRIORITY ORDER:', 'color: #2196F3; font-weight: bold; font-size: 14px;');
            console.log('1. Fix gmkbData localization if missing');
            console.log('2. Ensure all manager files are enqueued');
            console.log('3. Fix initialization order (state → theme → component → section)');
            console.log('4. Verify AJAX endpoints are registered');
            console.log('5. Check component and theme discovery');
            console.log('6. Fix UI template issues');
            
            // Store results
            window.MKDiagnosticResults = {
                issues: this.issues,
                fixes: this.fixes,
                timestamp: new Date().toISOString()
            };
            
            console.log('\n' + '='.repeat(60));
            console.log('Full results stored in window.MKDiagnosticResults');
            console.log('Run MKTestRunner.exportReport() to get a text report');
        },
        
        // Export report as text
        exportReport() {
            let report = 'MEDIA KIT BUILDER DIAGNOSTIC REPORT\n';
            report += `Generated: ${new Date().toISOString()}\n`;
            report += '='.repeat(50) + '\n\n';
            
            if (this.issues.length === 0) {
                report += 'No issues found!\n';
            } else {
                report += `TOTAL ISSUES: ${this.issues.length}\n\n`;
                
                // Group by severity
                ['critical', 'high', 'medium'].forEach(severity => {
                    const severityIssues = this.issues.filter(i => i.severity === severity);
                    if (severityIssues.length > 0) {
                        report += `${severity.toUpperCase()} PRIORITY (${severityIssues.length}):\n`;
                        report += '-'.repeat(30) + '\n';
                        severityIssues.forEach(issue => {
                            report += `\nIssue: ${issue.issue}\n`;
                            report += `System: ${issue.system}\n`;
                            report += `Cause: ${issue.cause}\n`;
                            report += `Fix: ${issue.fix}\n`;
                        });
                        report += '\n';
                    }
                });
                
                if (this.fixes.length > 0) {
                    report += '\nSPECIFIC FIXES:\n';
                    report += '-'.repeat(30) + '\n';
                    this.fixes.forEach(fix => {
                        report += `\nFile: ${fix.file}\n`;
                        report += `Action: ${fix.action}\n`;
                        if (fix.code) {
                            report += `Code:\n${fix.code}\n`;
                        }
                    });
                }
            }
            
            // Copy to clipboard
            navigator.clipboard.writeText(report).then(() => {
                console.log('✅ Report copied to clipboard!');
            });
            
            return report;
        }
    };
    
    // Add convenience shortcuts
    window.MKDiag = {
        run: () => MKTestRunner.runDiagnostics(),
        report: () => MKTestRunner.exportReport(),
        issues: () => MKTestRunner.issues,
        fixes: () => MKTestRunner.fixes
    };
    
    console.log('%c✅ Media Kit Diagnostic Runner Loaded!', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
    console.log('Commands:');
    console.log('  %cMKDiag.run()%c    - Run full diagnostics', 'color: #2196F3; font-weight: bold;', '');
    console.log('  %cMKDiag.report()%c - Export text report', 'color: #2196F3; font-weight: bold;', '');
    console.log('  %cMKDiag.issues%c  - View found issues', 'color: #2196F3; font-weight: bold;', '');
    console.log('  %cMKDiag.fixes%c   - View suggested fixes', 'color: #2196F3; font-weight: bold;', '');
    console.log('\nRun %cMKDiag.run()%c to start diagnostics', 'color: #4CAF50; font-weight: bold;', '');
    
})(window);
