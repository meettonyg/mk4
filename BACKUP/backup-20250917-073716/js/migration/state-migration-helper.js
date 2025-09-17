/**
 * State Migration Helper
 * PHASE 2: Component Communication Redesign - Migration from bloated to clean state
 * 
 * Helps migrate existing 260KB+ bloated state to clean <1KB per component state
 * 
 * @version 1.0.0
 * @package GMKB/Migration
 */

(function(window) {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    class StateMigrationHelper {
        constructor() {
            this.dataState = window.dataState;
            this.stateManager = window.enhancedStateManager;
            this.migrationStats = {
                startSize: 0,
                endSize: 0,
                componentsProcessed: 0,
                fieldsRemoved: 0,
                reductionPercent: 0
            };
        }
        
        /**
         * Analyze current state and show what would be removed
         */
        analyzeState() {
            const currentState = this.stateManager?.getState();
            if (!currentState || !currentState.components) {
                logger.warn('MIGRATION', 'No state to analyze');
                return null;
            }
            
            const analysis = {
                totalComponents: Object.keys(currentState.components).length,
                currentSize: new Blob([JSON.stringify(currentState)]).size,
                components: {}
            };
            
            // Analyze each component
            Object.entries(currentState.components).forEach(([id, component]) => {
                const componentSize = new Blob([JSON.stringify(component)]).size;
                const cleanComponent = this.dataState.extractEssentialData(component);
                const cleanSize = new Blob([JSON.stringify(cleanComponent)]).size;
                
                analysis.components[id] = {
                    type: component.type,
                    currentSize: componentSize,
                    cleanSize: cleanSize,
                    reduction: Math.round((1 - cleanSize / componentSize) * 100),
                    fieldsToRemove: this.getFieldsToRemove(component)
                };
            });
            
            // Calculate total clean size
            const cleanState = this.dataState.cleanExistingState(currentState);
            analysis.projectedSize = new Blob([JSON.stringify(cleanState)]).size;
            analysis.projectedReduction = Math.round((1 - analysis.projectedSize / analysis.currentSize) * 100);
            
            return analysis;
        }
        
        /**
         * Get list of fields that would be removed from a component
         */
        getFieldsToRemove(component) {
            const fieldsToRemove = [];
            const metadataFields = [
                'timestamp', 'enrichmentTimestamp', 'lastModified', 'createdAt',
                'updatedAt', 'loaded_topics', 'topics_count', 'has_topics',
                'data_source', 'podsDataLoaded', 'dragDropCreated', 'isLoading',
                'isError', 'error', 'loading', 'loaded', 'initialized', 'ready'
            ];
            
            Object.keys(component).forEach(key => {
                // Check if this field would be removed
                if (metadataFields.includes(key) || key.startsWith('_') || 
                    key.includes('loading') || key.includes('error') || 
                    key.includes('timestamp') || key.includes('cache')) {
                    fieldsToRemove.push(key);
                }
            });
            
            return fieldsToRemove;
        }
        
        /**
         * Perform the migration from bloated to clean state
         */
        async migrate(options = {}) {
            const { dryRun = false, backup = true } = options;
            
            logger.info('MIGRATION', `Starting state migration (dryRun: ${dryRun})`);
            
            // Get current state
            const currentState = this.stateManager?.getState();
            if (!currentState || !currentState.components) {
                logger.error('MIGRATION', 'No state to migrate');
                return { success: false, error: 'No state found' };
            }
            
            // Record start size
            this.migrationStats.startSize = new Blob([JSON.stringify(currentState)]).size;
            
            // Create backup if requested
            if (backup && !dryRun) {
                this.createBackup(currentState);
            }
            
            // Clean the state
            const cleanState = this.dataState.cleanExistingState(currentState);
            
            // Record end size
            this.migrationStats.endSize = new Blob([JSON.stringify(cleanState)]).size;
            this.migrationStats.componentsProcessed = Object.keys(cleanState.components).length;
            this.migrationStats.reductionPercent = Math.round(
                (1 - this.migrationStats.endSize / this.migrationStats.startSize) * 100
            );
            
            if (dryRun) {
                logger.info('MIGRATION', 'Dry run complete - no changes made', this.migrationStats);
                return {
                    success: true,
                    dryRun: true,
                    stats: this.migrationStats,
                    cleanState
                };
            }
            
            // Apply the clean state
            try {
                // Load clean state into DataState
                this.dataState.loadFromPersistence(cleanState);
                
                // Update the main state manager
                this.stateManager.dispatch({
                    type: 'SET_STATE',
                    payload: cleanState
                });
                
                logger.info('MIGRATION', 'Migration complete', this.migrationStats);
                
                // Save to database
                if (window.enhancedComponentManager?.autoSaveState) {
                    await window.enhancedComponentManager.autoSaveState('migration_complete', {
                        stats: this.migrationStats
                    });
                }
                
                return {
                    success: true,
                    stats: this.migrationStats
                };
                
            } catch (error) {
                logger.error('MIGRATION', 'Migration failed', error);
                return {
                    success: false,
                    error: error.message,
                    stats: this.migrationStats
                };
            }
        }
        
        /**
         * Create a backup of current state
         */
        createBackup(state) {
            const backupKey = `gmkb_state_backup_${Date.now()}`;
            try {
                localStorage.setItem(backupKey, JSON.stringify(state));
                logger.info('MIGRATION', `State backed up to ${backupKey}`);
                
                // Keep only last 3 backups
                this.cleanOldBackups();
                
                return backupKey;
            } catch (error) {
                logger.error('MIGRATION', 'Failed to create backup', error);
                return null;
            }
        }
        
        /**
         * Clean old backups, keeping only the most recent 3
         */
        cleanOldBackups() {
            const backupKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('gmkb_state_backup_')) {
                    backupKeys.push(key);
                }
            }
            
            // Sort by timestamp (newest first)
            backupKeys.sort().reverse();
            
            // Remove all but the 3 most recent
            if (backupKeys.length > 3) {
                backupKeys.slice(3).forEach(key => {
                    localStorage.removeItem(key);
                    logger.debug('MIGRATION', `Removed old backup: ${key}`);
                });
            }
        }
        
        /**
         * Restore from backup
         */
        restoreFromBackup(backupKey) {
            try {
                const backupData = localStorage.getItem(backupKey);
                if (!backupData) {
                    logger.error('MIGRATION', `Backup not found: ${backupKey}`);
                    return false;
                }
                
                const state = JSON.parse(backupData);
                
                // Apply the restored state
                this.stateManager.dispatch({
                    type: 'SET_STATE',
                    payload: state
                });
                
                logger.info('MIGRATION', `Restored from backup: ${backupKey}`);
                return true;
                
            } catch (error) {
                logger.error('MIGRATION', 'Failed to restore backup', error);
                return false;
            }
        }
        
        /**
         * List available backups
         */
        listBackups() {
            const backups = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('gmkb_state_backup_')) {
                    const timestamp = parseInt(key.replace('gmkb_state_backup_', ''));
                    const data = localStorage.getItem(key);
                    backups.push({
                        key,
                        timestamp,
                        date: new Date(timestamp).toISOString(),
                        size: data ? new Blob([data]).size : 0
                    });
                }
            }
            return backups.sort((a, b) => b.timestamp - a.timestamp);
        }
        
        /**
         * Show migration report in console
         */
        showReport() {
            const analysis = this.analyzeState();
            if (!analysis) return;
            
            console.group('%c📊 State Migration Analysis', 'font-size: 14px; font-weight: bold; color: #4CAF50');
            console.log(`Current State Size: ${(analysis.currentSize / 1024).toFixed(2)} KB`);
            console.log(`Projected Clean Size: ${(analysis.projectedSize / 1024).toFixed(2)} KB`);
            console.log(`Reduction: ${analysis.projectedReduction}%`);
            console.log(`Components: ${analysis.totalComponents}`);
            
            console.group('Component Details:');
            Object.entries(analysis.components).forEach(([id, info]) => {
                console.log(`${id} (${info.type}):`);
                console.log(`  Current: ${info.currentSize}B → Clean: ${info.cleanSize}B (${info.reduction}% reduction)`);
                if (info.fieldsToRemove.length > 0) {
                    console.log(`  Fields to remove: ${info.fieldsToRemove.join(', ')}`);
                }
            });
            console.groupEnd();
            
            console.groupEnd();
        }
    }
    
    // Create global instance
    window.stateMigrationHelper = new StateMigrationHelper();
    
    // Add console commands for easy access
    window.analyzeBloatedState = () => {
        window.stateMigrationHelper.showReport();
    };
    
    window.migrateToCleanState = async (dryRun = true) => {
        const result = await window.stateMigrationHelper.migrate({ dryRun });
        if (result.success) {
            console.log('✅ Migration ' + (dryRun ? 'preview' : 'complete'), result.stats);
            if (dryRun) {
                console.log('Run migrateToCleanState(false) to apply changes');
            }
        } else {
            console.error('❌ Migration failed:', result.error);
        }
        return result;
    };
    
    window.listStateBackups = () => {
        const backups = window.stateMigrationHelper.listBackups();
        console.table(backups);
        return backups;
    };
    
    window.restoreStateBackup = (backupKey) => {
        if (!backupKey) {
            console.log('Usage: restoreStateBackup("gmkb_state_backup_1234567890")');
            console.log('Run listStateBackups() to see available backups');
            return;
        }
        return window.stateMigrationHelper.restoreFromBackup(backupKey);
    };
    
    logger.info('MIGRATION', 'State Migration Helper loaded');
    logger.info('MIGRATION', 'Commands available: analyzeBloatedState(), migrateToCleanState(dryRun), listStateBackups(), restoreStateBackup(key)');
    
})(window);
