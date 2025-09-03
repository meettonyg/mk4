/**
 * Phase 1-4 Migration Helper
 * Assists with migrating from old system to new Phase 1-4 architecture
 */
(function() {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    class Phase14MigrationHelper {
        constructor() {
            this.migrationSteps = [];
            this.migrationStatus = {
                componentsToMigrate: 0,
                componentsMigrated: 0,
                stateSize: {
                    before: 0,
                    after: 0
                },
                syncSystemMigrated: false,
                dataStateMigrated: false,
                ownershipEnforced: false
            };
            
            this.init();
        }
        
        init() {
            logger.info('MIGRATION', '🚀 Phase 1-4 Migration Helper initialized');
            this.analyzeCurrentSystem();
        }
        
        /**
         * Analyze current system state
         */
        analyzeCurrentSystem() {
            const report = {
                timestamp: new Date().toISOString(),
                currentState: {},
                recommendations: []
            };
            
            // Check for old sync system
            const hasOldSync = !!(window.universalSync || 
                                 document.querySelector('[data-universal-sync]') ||
                                 document.querySelector('.universal-sync-enabled'));
            
            if (hasOldSync) {
                report.currentState.oldSyncSystem = 'DETECTED';
                report.recommendations.push('Run migrateSyncSystem() to migrate to Phase 3 Sync Coordinator');
            } else {
                report.currentState.oldSyncSystem = 'NOT FOUND';
            }
            
            // Check current state size
            if (window.GMKB && window.GMKB.stateManager) {
                const state = window.GMKB.stateManager.getState();
                const stateString = JSON.stringify(state);
                const stateSize = new Blob([stateString]).size;
                
                report.currentState.stateSize = stateSize;
                report.currentState.stateSizeKB = (stateSize / 1024).toFixed(2) + ' KB';
                
                this.migrationStatus.stateSize.before = stateSize;
                
                if (stateSize > 50000) { // > 50KB
                    report.recommendations.push('State is bloated. Run migrateToCleanState() to reduce size');
                }
                
                // Count components
                if (state.components) {
                    const componentCount = Object.keys(state.components).length;
                    report.currentState.componentCount = componentCount;
                    this.migrationStatus.componentsToMigrate = componentCount;
                }
            }
            
            // Check for Phase 1-4 systems
            report.currentState.phase1 = !!window.ComponentLifecycle ? 'READY' : 'NOT LOADED';
            report.currentState.phase2 = !!window.DataState ? 'READY' : 'NOT LOADED';
            report.currentState.phase3 = !!window.SyncCoordinator ? 'READY' : 'NOT LOADED';
            report.currentState.phase4 = !!window.DOMOwnershipManager ? 'READY' : 'NOT LOADED';
            
            // Check for components using old system
            const oldComponents = document.querySelectorAll('[contenteditable]:not(.gmkb-ownership-editor)');
            if (oldComponents.length > 0) {
                report.currentState.componentsWithOldSystem = oldComponents.length;
                report.recommendations.push(`${oldComponents.length} components need migration to new lifecycle`);
            }
            
            this.systemReport = report;
            return report;
        }
        
        /**
         * Run complete migration
         */
        async runCompleteMigration() {
            console.group('🔄 Running Complete Phase 1-4 Migration');
            
            const steps = [
                { name: 'Analyze System', fn: () => this.analyzeCurrentSystem() },
                { name: 'Migrate Sync System', fn: () => this.migrateSyncSystem() },
                { name: 'Migrate State to Clean', fn: () => this.migrateStateToClean() },
                { name: 'Migrate Components', fn: () => this.migrateComponents() },
                { name: 'Enforce DOM Ownership', fn: () => this.enforceDOMOwnership() },
                { name: 'Verify Migration', fn: () => this.verifyMigration() }
            ];
            
            for (const step of steps) {
                console.log(`\n📋 Step: ${step.name}`);
                try {
                    const result = await step.fn();
                    console.log(`✅ ${step.name} completed`, result);
                    this.migrationSteps.push({ step: step.name, success: true, result });
                } catch (error) {
                    console.error(`❌ ${step.name} failed:`, error);
                    this.migrationSteps.push({ step: step.name, success: false, error });
                }
            }
            
            console.groupEnd();
            return this.generateMigrationReport();
        }
        
        /**
         * Migrate sync system
         */
        migrateSyncSystem() {
            if (window.migrateSyncSystem) {
                const result = window.migrateSyncSystem();
                this.migrationStatus.syncSystemMigrated = result;
                return result;
            }
            
            // Manual migration
            const oldSyncElements = document.querySelectorAll('[data-universal-sync], [contenteditable]');
            let migrated = 0;
            
            oldSyncElements.forEach(element => {
                // Remove old sync attributes
                element.removeAttribute('data-universal-sync');
                
                // Register with new sync coordinator if it's a component
                const componentId = element.closest('[data-component-id]')?.dataset.componentId;
                if (componentId && window.SyncCoordinator) {
                    const editor = element.querySelector('.component-editor');
                    const preview = element.querySelector('.component-preview');
                    
                    if (editor || preview) {
                        window.SyncCoordinator.register(componentId, {
                            editor: editor || element,
                            preview: preview || element,
                            fields: this.detectFields(element)
                        });
                        migrated++;
                    }
                }
            });
            
            this.migrationStatus.syncSystemMigrated = true;
            logger.info('MIGRATION', `Migrated ${migrated} components to new sync system`);
            return { migrated, total: oldSyncElements.length };
        }
        
        /**
         * Migrate state to clean data-only format
         */
        migrateStateToClean() {
            if (!window.dataState) {
                window.dataState = new DataState();
            }
            
            const oldState = window.GMKB?.stateManager?.getState();
            if (!oldState || !oldState.components) {
                return { migrated: false, reason: 'No old state found' };
            }
            
            let migratedCount = 0;
            const cleanComponents = {};
            
            // Migrate each component to clean format
            Object.entries(oldState.components).forEach(([id, component]) => {
                // Extract only essential data
                const cleanComponent = {
                    id: id,
                    type: component.type,
                    sectionId: component.sectionId || null,
                    data: {}
                };
                
                // Extract actual data fields, ignore metadata
                const dataFields = component.data || component.props || {};
                Object.keys(dataFields).forEach(key => {
                    // Skip metadata fields
                    if (!this.isMetadataField(key)) {
                        cleanComponent.data[key] = dataFields[key];
                    }
                });
                
                // Add to clean state
                window.dataState.updateComponent(id, cleanComponent);
                cleanComponents[id] = cleanComponent;
                migratedCount++;
            });
            
            // Calculate new state size
            const newStateString = JSON.stringify(cleanComponents);
            const newSize = new Blob([newStateString]).size;
            this.migrationStatus.stateSize.after = newSize;
            
            const reduction = ((this.migrationStatus.stateSize.before - newSize) / 
                              this.migrationStatus.stateSize.before * 100).toFixed(1);
            
            this.migrationStatus.dataStateMigrated = true;
            this.migrationStatus.componentsMigrated = migratedCount;
            
            logger.info('MIGRATION', `Migrated ${migratedCount} components to clean state`);
            logger.info('MIGRATION', `State size reduced by ${reduction}% (${this.migrationStatus.stateSize.before} → ${newSize} bytes)`);
            
            return {
                migrated: migratedCount,
                sizeReduction: reduction + '%',
                before: this.migrationStatus.stateSize.before,
                after: newSize
            };
        }
        
        /**
         * Check if a field is metadata (should be excluded)
         */
        isMetadataField(field) {
            const metadataFields = [
                'timestamp', 'lastModified', 'createdAt', 'updatedAt',
                'enrichmentTimestamp', 'dragDropCreated', 'loaded_topics',
                'topics_count', 'has_topics', 'data_source', 'podsDataLoaded',
                'renderTimestamp', 'syncTimestamp', 'version', '_internal',
                'cached', 'dirty', 'pending', 'syncing', 'loading'
            ];
            
            return metadataFields.includes(field) || field.startsWith('_');
        }
        
        /**
         * Migrate components to new lifecycle
         */
        migrateComponents() {
            const components = document.querySelectorAll('[data-component-id]');
            let migrated = 0;
            
            components.forEach(component => {
                const componentId = component.dataset.componentId;
                const componentType = component.dataset.componentType;
                
                // Mark as lifecycle-enabled
                if (!component.dataset.lifecycleInitialized) {
                    component.dataset.lifecycleInitialized = 'true';
                    
                    // Emit lifecycle events
                    document.dispatchEvent(new CustomEvent('component:rendering', {
                        detail: { componentId, type: componentType }
                    }));
                    
                    document.dispatchEvent(new CustomEvent('component:dom-ready', {
                        detail: { 
                            componentId, 
                            type: componentType,
                            container: component
                        }
                    }));
                    
                    // If it has an editor
                    const editor = component.querySelector('.component-editor');
                    if (editor) {
                        document.dispatchEvent(new CustomEvent('component:editor-ready', {
                            detail: {
                                componentId,
                                type: componentType,
                                container: editor
                            }
                        }));
                    }
                    
                    migrated++;
                }
            });
            
            logger.info('MIGRATION', `Migrated ${migrated} components to lifecycle system`);
            return { migrated, total: components.length };
        }
        
        /**
         * Enforce DOM ownership
         */
        enforceDOMOwnership() {
            if (window.domOwnershipManager) {
                // Scan and enforce ownership
                window.enforceOwnership();
                
                // Get stats
                const stats = window.domOwnershipManager.getStats();
                
                this.migrationStatus.ownershipEnforced = true;
                
                logger.info('MIGRATION', 'DOM ownership enforced', stats);
                return stats;
            }
            
            return { error: 'DOM Ownership Manager not found' };
        }
        
        /**
         * Detect fields in an element
         */
        detectFields(element) {
            const fields = [];
            const inputs = element.querySelectorAll('input, textarea, select, [contenteditable]');
            
            inputs.forEach(input => {
                const field = input.dataset.field || input.name || input.id;
                if (field && !fields.includes(field)) {
                    fields.push(field);
                }
            });
            
            return fields;
        }
        
        /**
         * Verify migration success
         */
        verifyMigration() {
            const verification = {
                success: true,
                checks: {}
            };
            
            // Check sync system
            verification.checks.syncSystem = {
                oldSystemRemoved: !window.universalSync,
                newSystemReady: !!window.SyncCoordinator,
                passed: !window.universalSync && !!window.SyncCoordinator
            };
            
            // Check state migration
            if (window.dataState) {
                const cleanStateSize = window.dataState.getStateSize();
                verification.checks.stateMigration = {
                    dataStateReady: true,
                    sizeReduced: cleanStateSize < this.migrationStatus.stateSize.before,
                    currentSize: cleanStateSize,
                    passed: cleanStateSize < 50000 // < 50KB
                };
            }
            
            // Check component lifecycle
            const lifecycleComponents = document.querySelectorAll('[data-lifecycle-initialized="true"]');
            verification.checks.componentLifecycle = {
                componentsWithLifecycle: lifecycleComponents.length,
                allMigrated: lifecycleComponents.length === this.migrationStatus.componentsToMigrate,
                passed: lifecycleComponents.length > 0
            };
            
            // Check DOM ownership
            if (window.domOwnershipManager) {
                const stats = window.domOwnershipManager.getStats();
                verification.checks.domOwnership = {
                    elementsRegistered: stats.elementsRegistered,
                    violationsDetected: stats.violationsDetected,
                    passed: stats.elementsRegistered > 0
                };
            }
            
            // Overall success
            verification.success = Object.values(verification.checks)
                .every(check => check.passed !== false);
            
            return verification;
        }
        
        /**
         * Generate migration report
         */
        generateMigrationReport() {
            const report = {
                timestamp: new Date().toISOString(),
                status: this.migrationStatus,
                steps: this.migrationSteps,
                verification: this.verifyMigration(),
                recommendations: []
            };
            
            // Add recommendations based on results
            if (!report.verification.success) {
                Object.entries(report.verification.checks).forEach(([check, result]) => {
                    if (!result.passed) {
                        report.recommendations.push(`Fix ${check}: ${JSON.stringify(result)}`);
                    }
                });
            } else {
                report.recommendations.push('Migration successful! System is ready for Phase 1-4 architecture.');
            }
            
            // Size reduction summary
            if (this.migrationStatus.stateSize.after > 0) {
                const reduction = this.migrationStatus.stateSize.before - this.migrationStatus.stateSize.after;
                const percentage = (reduction / this.migrationStatus.stateSize.before * 100).toFixed(1);
                report.summary = {
                    stateReduction: `${(reduction / 1024).toFixed(2)} KB (${percentage}%)`,
                    componentsMigrated: this.migrationStatus.componentsMigrated,
                    syncSystemMigrated: this.migrationStatus.syncSystemMigrated,
                    ownershipEnforced: this.migrationStatus.ownershipEnforced
                };
            }
            
            return report;
        }
        
        /**
         * Display migration report
         */
        displayReport(report) {
            console.group('📊 Phase 1-4 Migration Report');
            
            console.log('📅 Timestamp:', report.timestamp);
            
            if (report.summary) {
                console.group('📈 Summary');
                console.log('State Reduction:', report.summary.stateReduction);
                console.log('Components Migrated:', report.summary.componentsMigrated);
                console.log('Sync System:', report.summary.syncSystemMigrated ? '✅' : '❌');
                console.log('DOM Ownership:', report.summary.ownershipEnforced ? '✅' : '❌');
                console.groupEnd();
            }
            
            console.group('✔️ Verification');
            Object.entries(report.verification.checks).forEach(([check, result]) => {
                console.log(`${check}:`, result.passed ? '✅' : '❌', result);
            });
            console.groupEnd();
            
            if (report.recommendations.length > 0) {
                console.group('💡 Recommendations');
                report.recommendations.forEach(rec => console.log('•', rec));
                console.groupEnd();
            }
            
            console.groupEnd();
            
            return report;
        }
    }
    
    // Create instance
    const migrationHelper = new Phase14MigrationHelper();
    
    // Expose global functions
    window.runPhase14Migration = async () => {
        const report = await migrationHelper.runCompleteMigration();
        migrationHelper.displayReport(report);
        return report;
    };
    
    window.checkMigrationStatus = () => {
        const report = migrationHelper.analyzeCurrentSystem();
        console.group('🔍 Current System Status');
        console.table(report.currentState);
        if (report.recommendations.length > 0) {
            console.log('💡 Recommendations:');
            report.recommendations.forEach(rec => console.log('•', rec));
        }
        console.groupEnd();
        return report;
    };
    
    window.verifyPhase14Migration = () => {
        const verification = migrationHelper.verifyMigration();
        console.group('✅ Migration Verification');
        console.log('Overall Success:', verification.success ? '✅' : '❌');
        console.table(verification.checks);
        console.groupEnd();
        return verification;
    };
    
    // Auto-analyze on load
    const initialReport = migrationHelper.analyzeCurrentSystem();
    
    console.log('📋 Phase 1-4 Migration Helper Ready!');
    console.log('Commands available:');
    console.log('  - runPhase14Migration() - Run complete migration');
    console.log('  - checkMigrationStatus() - Check current system status');
    console.log('  - verifyPhase14Migration() - Verify migration success');
    console.log('\n💡 Recommendations:', initialReport.recommendations);
    
})();
