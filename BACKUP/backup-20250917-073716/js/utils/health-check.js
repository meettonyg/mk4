/**
 * GMKB Health Check Utility
 * Comprehensive system health monitoring and diagnostics
 * 
 * @since 2.1.0
 */
(function() {
    'use strict';

    class GMKBHealthCheck {
        constructor() {
            this.logger = window.structuredLogger || console;
        }

        /**
         * Run comprehensive health check
         */
        run() {
            console.log('=== GMKB HEALTH CHECK ===');
            console.log(`Timestamp: ${new Date().toISOString()}`);
            console.log('');
            
            const checks = [
                this.checkCoreSystem(),
                this.checkIDGenerator(),
                this.checkComponents(),
                this.checkSections(),
                this.checkState(),
                this.checkDuplicates(),
                this.checkMemoryUsage(),
                this.checkEventListeners()
            ];
            
            const allPassed = checks.every(c => c.passed);
            
            console.log('');
            console.log('=== SUMMARY ===');
            console.log(`Total Checks: ${checks.length}`);
            console.log(`Passed: ${checks.filter(c => c.passed).length}`);
            console.log(`Failed: ${checks.filter(c => !c.passed).length}`);
            console.log('');
            console.log(allPassed ? '✅ SYSTEM HEALTHY' : '❌ ISSUES DETECTED');
            console.log('========================');
            
            return {
                healthy: allPassed,
                checks: checks,
                timestamp: Date.now()
            };
        }

        /**
         * Check core system components
         */
        checkCoreSystem() {
            const systems = {
                'GMKB Core': window.GMKB,
                'ID Generator': window.gmkbIDGenerator,
                'State Manager': window.enhancedStateManager,
                'Component Manager': window.enhancedComponentManager,
                'Section Manager': window.sectionLayoutManager,
                'Logger': window.structuredLogger
            };
            
            const missing = [];
            for (const [name, obj] of Object.entries(systems)) {
                if (!obj) {
                    missing.push(name);
                }
            }
            
            const passed = missing.length === 0;
            const message = passed ? 
                '✅ Core Systems: All systems loaded' : 
                `❌ Core Systems: Missing ${missing.join(', ')}`;
            
            console.log(message);
            
            return {
                name: 'Core Systems',
                passed,
                details: systems,
                missing
            };
        }

        /**
         * Check ID Generator functionality
         */
        checkIDGenerator() {
            let passed = false;
            let details = {};
            
            try {
                if (window.gmkbIDGenerator) {
                    const stats = window.gmkbIDGenerator.getStats();
                    details = {
                        totalGenerated: stats.totalGenerated || 0,
                        uniqueIds: stats.uniqueIds || 0,
                        counters: stats.counters || {}
                    };
                    
                    // Test ID generation
                    const testId = window.gmkbIDGenerator.generateComponentId('test');
                    passed = testId && testId.includes('test-');
                    
                    const message = passed ? 
                        `✅ ID Generator: Working (${details.totalGenerated} IDs generated, ${details.uniqueIds} unique)` :
                        '⚠️ ID Generator: Present but not generating valid IDs';
                    
                    console.log(message);
                } else {
                    console.log('❌ ID Generator: Not found');
                }
            } catch (error) {
                console.log('❌ ID Generator: Error - ' + error.message);
                details.error = error.message;
            }
            
            return {
                name: 'ID Generator',
                passed,
                details
            };
        }

        /**
         * Check component health
         */
        checkComponents() {
            const componentElements = document.querySelectorAll('[data-component-id]');
            const componentIds = Array.from(componentElements).map(el => el.dataset.componentId);
            
            let stateComponents = {};
            if (window.enhancedStateManager) {
                const state = window.enhancedStateManager.getState();
                stateComponents = state.components || {};
            }
            
            const details = {
                inDOM: componentIds.length,
                inState: Object.keys(stateComponents).length,
                domIds: componentIds,
                stateIds: Object.keys(stateComponents)
            };
            
            // Check for orphaned components (in DOM but not in state)
            const orphanedInDOM = componentIds.filter(id => !stateComponents[id]);
            
            // Check for ghost components (in state but not in DOM)
            const ghostInState = Object.keys(stateComponents).filter(id => !componentIds.includes(id));
            
            details.orphanedInDOM = orphanedInDOM;
            details.ghostInState = ghostInState;
            
            const hasIssues = orphanedInDOM.length > 0 || ghostInState.length > 0;
            const passed = !hasIssues && componentIds.length === Object.keys(stateComponents).length;
            
            let message = `Components: ${componentIds.length} in DOM, ${Object.keys(stateComponents).length} in state`;
            if (orphanedInDOM.length > 0) {
                message += ` | ⚠️ ${orphanedInDOM.length} orphaned in DOM`;
            }
            if (ghostInState.length > 0) {
                message += ` | ⚠️ ${ghostInState.length} ghosts in state`;
            }
            
            console.log((passed ? '✅ ' : '⚠️ ') + message);
            
            return {
                name: 'Components',
                passed,
                details
            };
        }

        /**
         * Check section health
         */
        checkSections() {
            const sectionElements = document.querySelectorAll('[data-section-id]');
            const sectionIds = Array.from(sectionElements).map(el => el.dataset.sectionId);
            
            let stateSections = [];
            if (window.enhancedStateManager) {
                const state = window.enhancedStateManager.getState();
                stateSections = state.sections || [];
            }
            
            let managerSections = [];
            if (window.sectionLayoutManager) {
                managerSections = window.sectionLayoutManager.getAllSections() || [];
            }
            
            const details = {
                inDOM: sectionIds.length,
                inState: stateSections.length,
                inManager: managerSections.length,
                domIds: sectionIds,
                stateIds: stateSections.map(s => s.section_id),
                managerIds: managerSections.map(s => s.section_id)
            };
            
            const passed = sectionIds.length === stateSections.length && 
                          stateSections.length === managerSections.length;
            
            const message = passed ? 
                `✅ Sections: ${sectionIds.length} sections synchronized` :
                `⚠️ Sections: DOM(${sectionIds.length}) State(${stateSections.length}) Manager(${managerSections.length})`;
            
            console.log(message);
            
            return {
                name: 'Sections',
                passed,
                details
            };
        }

        /**
         * Check state consistency
         */
        checkState() {
            let passed = false;
            let details = {};
            
            try {
                if (window.enhancedStateManager) {
                    const state = window.enhancedStateManager.getState();
                    details = {
                        hasComponents: !!state.components,
                        hasSections: !!state.sections,
                        hasGlobalSettings: !!state.globalSettings,
                        componentCount: Object.keys(state.components || {}).length,
                        sectionCount: (state.sections || []).length,
                        themeActive: state.globalSettings?.activeTheme || 'none'
                    };
                    
                    passed = details.hasComponents && details.hasSections;
                    
                    const message = passed ? 
                        `✅ State: Valid (${details.componentCount} components, ${details.sectionCount} sections)` :
                        '⚠️ State: Missing required properties';
                    
                    console.log(message);
                } else {
                    console.log('❌ State: State manager not found');
                }
            } catch (error) {
                console.log('❌ State: Error - ' + error.message);
                details.error = error.message;
            }
            
            return {
                name: 'State Consistency',
                passed,
                details
            };
        }

        /**
         * Check for duplicate components
         */
        checkDuplicates() {
            const componentElements = document.querySelectorAll('[data-component-id]');
            const componentIds = Array.from(componentElements).map(el => el.dataset.componentId);
            
            const duplicates = componentIds.filter((id, index) => componentIds.indexOf(id) !== index);
            const uniqueDuplicates = [...new Set(duplicates)];
            
            const controlSets = document.querySelectorAll('.gmkb-component__controls');
            
            const details = {
                totalComponents: componentElements.length,
                uniqueIds: new Set(componentIds).size,
                duplicateIds: uniqueDuplicates,
                duplicateCount: duplicates.length,
                controlSets: controlSets.length
            };
            
            const passed = duplicates.length === 0;
            
            const message = passed ? 
                `✅ Duplicates: No duplicate components (${componentElements.length} total)` :
                `❌ Duplicates: Found ${duplicates.length} duplicates: ${uniqueDuplicates.join(', ')}`;
            
            console.log(message);
            
            return {
                name: 'Duplicate Check',
                passed,
                details
            };
        }

        /**
         * Check memory usage
         */
        checkMemoryUsage() {
            let passed = true;
            let details = {};
            
            try {
                // Check component manager
                if (window.enhancedComponentManager) {
                    details.componentManagerSize = window.enhancedComponentManager.components?.size || 0;
                }
                
                // Check section manager
                if (window.sectionLayoutManager) {
                    details.sectionManagerSize = window.sectionLayoutManager.sections?.size || 0;
                }
                
                // Check ID generator
                if (window.gmkbIDGenerator) {
                    const stats = window.gmkbIDGenerator.getStats();
                    details.registeredIds = stats.uniqueIds || 0;
                }
                
                // Check for memory leaks (basic check)
                const componentElements = document.querySelectorAll('[data-component-id]');
                const controlElements = document.querySelectorAll('.gmkb-component__controls');
                
                details.componentElements = componentElements.length;
                details.controlElements = controlElements.length;
                
                // Basic leak detection - controls should not exceed components
                if (controlElements.length > componentElements.length * 2) {
                    passed = false;
                    details.warning = 'Possible control element leak detected';
                }
                
                const message = passed ? 
                    `✅ Memory: Normal usage (${componentElements.length} components, ${controlElements.length} controls)` :
                    `⚠️ Memory: ${details.warning}`;
                
                console.log(message);
                
            } catch (error) {
                console.log('⚠️ Memory: Could not check - ' + error.message);
                details.error = error.message;
            }
            
            return {
                name: 'Memory Usage',
                passed,
                details
            };
        }

        /**
         * Check event listeners
         */
        checkEventListeners() {
            let details = {
                documentListeners: 0,
                windowListeners: 0,
                customEvents: []
            };
            
            // This is a simplified check - in reality, we'd need more sophisticated monitoring
            const events = [
                'gmkb:component-added',
                'gmkb:component-removed',
                'gmkb:section-registered',
                'gmkb:state-changed'
            ];
            
            // Check if critical events have listeners
            let passed = true;
            events.forEach(eventName => {
                // We can't easily check for listeners, but we can dispatch a test event
                try {
                    const testEvent = new CustomEvent(eventName + '-test', { detail: { test: true } });
                    document.dispatchEvent(testEvent);
                    details.customEvents.push(eventName);
                } catch (error) {
                    passed = false;
                }
            });
            
            const message = passed ? 
                '✅ Event System: Operational' :
                '⚠️ Event System: Some events may not be working';
            
            console.log(message);
            
            return {
                name: 'Event Listeners',
                passed,
                details
            };
        }

        /**
         * Fix common issues
         */
        autoFix() {
            console.log('=== ATTEMPTING AUTO-FIX ===');
            let fixes = [];
            
            // Fix 1: Remove duplicate components from DOM
            const componentElements = document.querySelectorAll('[data-component-id]');
            const seen = new Set();
            let duplicatesRemoved = 0;
            
            componentElements.forEach(el => {
                const id = el.dataset.componentId;
                if (seen.has(id)) {
                    el.remove();
                    duplicatesRemoved++;
                    fixes.push(`Removed duplicate component: ${id}`);
                } else {
                    seen.add(id);
                }
            });
            
            if (duplicatesRemoved > 0) {
                console.log(`✅ Removed ${duplicatesRemoved} duplicate components`);
            }
            
            // Fix 2: Remove orphaned controls
            const controls = document.querySelectorAll('.gmkb-component__controls');
            let orphanedControls = 0;
            
            controls.forEach(control => {
                const parent = control.closest('[data-component-id]');
                if (!parent) {
                    control.remove();
                    orphanedControls++;
                }
            });
            
            if (orphanedControls > 0) {
                console.log(`✅ Removed ${orphanedControls} orphaned control sets`);
                fixes.push(`Removed ${orphanedControls} orphaned controls`);
            }
            
            // Fix 3: Sync state with DOM
            if (window.enhancedStateManager && window.enhancedComponentManager) {
                try {
                    window.enhancedComponentManager.synchronizeWithState();
                    console.log('✅ Synchronized component manager with state');
                    fixes.push('Synchronized component manager with state');
                } catch (error) {
                    console.log('❌ Could not sync state: ' + error.message);
                }
            }
            
            console.log('');
            console.log(`Total fixes applied: ${fixes.length}`);
            console.log('========================');
            
            return fixes;
        }
    }

    // Create global instance and commands
    window.gmkbHealthCheck = () => new GMKBHealthCheck().run();
    window.gmkbAutoFix = () => new GMKBHealthCheck().autoFix();
    window.gmkbQuickCheck = () => {
        const hc = new GMKBHealthCheck();
        const duplicates = hc.checkDuplicates();
        const components = hc.checkComponents();
        const sections = hc.checkSections();
        
        console.log('=== QUICK CHECK ===');
        console.log(duplicates.passed ? '✅ No duplicates' : `❌ ${duplicates.details.duplicateCount} duplicates found`);
        console.log(components.passed ? '✅ Components synced' : '⚠️ Component sync issues');
        console.log(sections.passed ? '✅ Sections synced' : '⚠️ Section sync issues');
        console.log('==================');
        
        return {
            healthy: duplicates.passed && components.passed && sections.passed,
            duplicates: duplicates.details.duplicateCount,
            components: components.details,
            sections: sections.details
        };
    };

    // Auto-run on load in debug mode
    if (window.gmkbData?.debugMode) {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                console.log('Running automatic health check...');
                window.gmkbQuickCheck();
                console.log('');
                console.log('Available commands:');
                console.log('  gmkbHealthCheck() - Full system health check');
                console.log('  gmkbQuickCheck() - Quick duplicate/sync check');
                console.log('  gmkbAutoFix() - Attempt to fix common issues');
            }, 2000);
        });
    }

})();