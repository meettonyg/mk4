/**
 * Migration script to transition from old sync system to new Phase 3 Sync Coordinator
 * This provides a smooth transition path without breaking existing functionality
 */
(function() {
    'use strict';

    class SyncSystemMigration {
        constructor() {
            this.oldSystemDetected = false;
            this.newSystemReady = false;
            this.migrationComplete = false;
            
            this.init();
        }

        init() {
            // Wait for both systems to be available
            document.addEventListener('DOMContentLoaded', () => {
                this.checkSystems();
            });

            // Listen for new system ready
            document.addEventListener('sync-coordinator:ready', () => {
                this.newSystemReady = true;
                this.attemptMigration();
            });

            // Listen for component lifecycle ready
            document.addEventListener('component:lifecycle-ready', () => {
                console.log('✅ Component lifecycle system is ready');
                this.checkSystems();
            });
        }

        checkSystems() {
            // Check for old universal-component-sync
            if (typeof window.universalSync !== 'undefined' || 
                document.querySelector('[data-universal-sync]')) {
                this.oldSystemDetected = true;
                console.warn('⚠️ Old sync system detected. Will migrate to new system.');
            }

            // Check for new sync coordinator
            if (window.SyncCoordinator) {
                this.newSystemReady = true;
            }

            this.attemptMigration();
        }

        attemptMigration() {
            if (this.migrationComplete) return;
            
            if (this.oldSystemDetected && this.newSystemReady) {
                console.log('🔄 Starting sync system migration...');
                this.migrateComponents();
            } else if (this.newSystemReady && !this.oldSystemDetected) {
                console.log('✅ New sync system ready. No migration needed.');
                this.migrationComplete = true;
                this.exposeGlobalFunctions();
            }
        }

        migrateComponents() {
            try {
                // Find all components using old sync
                const oldSyncComponents = document.querySelectorAll('[data-universal-sync]');
                
                if (oldSyncComponents.length > 0) {
                    console.log(`📦 Found ${oldSyncComponents.length} components to migrate`);
                    
                    oldSyncComponents.forEach(component => {
                        const componentId = component.dataset.componentId;
                        if (componentId) {
                            // Register with new sync coordinator
                            if (window.SyncCoordinator && typeof window.SyncCoordinator.register === 'function') {
                                const editor = component.querySelector('.component-editor');
                                const preview = component.querySelector('.component-preview');
                                
                                if (editor && preview) {
                                    window.SyncCoordinator.register(componentId, {
                                        editor: editor,
                                        preview: preview,
                                        fields: this.detectFields(component)
                                    });
                                    
                                    console.log(`✅ Migrated component: ${componentId}`);
                                }
                            }
                        }
                    });
                    
                    // Disable old system
                    this.disableOldSystem();
                }
                
                this.migrationComplete = true;
                console.log('✅ Sync system migration complete!');
                this.exposeGlobalFunctions();
                
            } catch (error) {
                console.error('❌ Migration failed:', error);
            }
        }

        detectFields(component) {
            // Detect editable fields in the component
            const fields = [];
            const editables = component.querySelectorAll('[contenteditable], input, textarea, select');
            
            editables.forEach(el => {
                const fieldName = el.dataset.field || el.name || el.id;
                if (fieldName) {
                    fields.push(fieldName);
                }
            });
            
            return fields;
        }

        disableOldSystem() {
            // Remove old sync attributes
            document.querySelectorAll('[data-universal-sync]').forEach(el => {
                delete el.dataset.universalSync;
            });
            
            // Clear old global references
            if (window.universalSync) {
                delete window.universalSync;
            }
            
            console.log('🔒 Old sync system disabled');
        }

        exposeGlobalFunctions() {
            // Expose migration function globally for testing
            window.migrateSyncSystem = () => {
                console.log('🔄 Manual migration triggered');
                this.checkSystems();
                if (!this.migrationComplete) {
                    this.attemptMigration();
                } else {
                    console.log('✅ Migration already complete');
                }
                return this.migrationComplete;
            };

            // Expose status function
            window.getSyncMigrationStatus = () => {
                return {
                    oldSystemDetected: this.oldSystemDetected,
                    newSystemReady: this.newSystemReady,
                    migrationComplete: this.migrationComplete,
                    syncCoordinatorAvailable: !!window.SyncCoordinator,
                    componentLifecycleAvailable: !!window.ComponentLifecycle
                };
            };

            console.log('📋 Migration functions available:');
            console.log('  - migrateSyncSystem()');
            console.log('  - getSyncMigrationStatus()');
        }
    }

    // Initialize migration system
    const migration = new SyncSystemMigration();
    
    // Also expose the migration instance for debugging
    window.syncSystemMigration = migration;

})();
