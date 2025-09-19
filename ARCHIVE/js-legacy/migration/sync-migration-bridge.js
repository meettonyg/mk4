/**
 * Sync Migration Bridge
 * PHASE 3: Component Communication Redesign - Migration from universal-component-sync to sync-coordinator
 * 
 * Provides compatibility layer and migration path from old sync system to new
 * 
 * @version 1.0.0
 * @package GMKB/Migration
 */

(function(window) {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    /**
     * Create compatibility layer for old sync API
     * This allows existing code to work while transitioning to new system
     */
    class SyncMigrationBridge {
        constructor() {
            this.syncCoordinator = window.syncCoordinator;
            
            // Check if old system exists
            this.hasOldSystem = !!window.UniversalComponentSync;
            
            // Migration stats
            this.stats = {
                apiCallsIntercepted: 0,
                componentsTransitioned: 0
            };
            
            this.init();
        }
        
        init() {
            // Create compatibility API if old system doesn't exist
            if (!window.ComponentSync) {
                this.createCompatibilityAPI();
            } else {
                // Intercept old API calls
                this.interceptOldAPI();
            }
            
            // Listen for old sync events and translate to new ones
            this.translateEvents();
            
            logger.info('SYNC_MIGRATION', 'Sync Migration Bridge initialized');
        }
        
        /**
         * Create compatibility API that mirrors old ComponentSync global
         */
        createCompatibilityAPI() {
            window.ComponentSync = {
                debug: () => {
                    logger.info('SYNC_MIGRATION', 'Redirecting debug() to new system');
                    this.stats.apiCallsIntercepted++;
                    
                    if (this.syncCoordinator) {
                        this.syncCoordinator.debug();
                    }
                },
                
                forceSync: (componentId, direction) => {
                    logger.info('SYNC_MIGRATION', `Redirecting forceSync(${componentId}) to new system`);
                    this.stats.apiCallsIntercepted++;
                    
                    // New system doesn't have forceSync, but we can trigger a refresh
                    const registration = this.syncCoordinator?.registry.get(componentId);
                    if (registration) {
                        // Re-setup listeners
                        this.syncCoordinator.setupSyncListeners(registration);
                    }
                },
                
                enableAll: () => {
                    logger.info('SYNC_MIGRATION', 'Redirecting enableAll() to new system');
                    this.stats.apiCallsIntercepted++;
                    
                    // New system auto-registers on component:editor-ready events
                    // For existing components, dispatch ready events
                    document.querySelectorAll('[data-component-id]').forEach(element => {
                        const componentId = element.dataset.componentId;
                        const componentType = element.dataset.componentType;
                        
                        if (componentId && componentType) {
                            document.dispatchEvent(new CustomEvent('component:editor-ready', {
                                detail: {
                                    componentId,
                                    componentType,
                                    container: element,
                                    timestamp: Date.now()
                                }
                            }));
                        }
                    });
                },
                
                addComponentType: (type, mapping) => {
                    logger.info('SYNC_MIGRATION', `Component type registration not needed in new system: ${type}`);
                    this.stats.apiCallsIntercepted++;
                    // New system auto-detects fields, no manual mapping needed
                },
                
                initTopicsSync: () => {
                    logger.info('SYNC_MIGRATION', 'Redirecting initTopicsSync() to new system');
                    this.stats.apiCallsIntercepted++;
                    
                    // Find topics component and trigger registration
                    const topicsElement = document.querySelector('[data-component-type="topics"]');
                    if (topicsElement) {
                        const componentId = topicsElement.dataset.componentId;
                        
                        // Dispatch editor ready event
                        document.dispatchEvent(new CustomEvent('component:editor-ready', {
                            detail: {
                                componentId,
                                componentType: 'topics',
                                container: document.querySelector('#custom-content-editor') || topicsElement,
                                timestamp: Date.now()
                            }
                        }));
                        
                        return true;
                    }
                    return false;
                },
                
                refreshSync: (componentId, componentType) => {
                    logger.info('SYNC_MIGRATION', `Redirecting refreshSync(${componentId}) to new system`);
                    this.stats.apiCallsIntercepted++;
                    
                    // Unregister and re-register
                    if (this.syncCoordinator) {
                        this.syncCoordinator.unregister(componentId);
                        
                        // Re-trigger registration
                        setTimeout(() => {
                            document.dispatchEvent(new CustomEvent('component:editor-ready', {
                                detail: {
                                    componentId,
                                    componentType,
                                    container: document.querySelector(`[data-component-id="${componentId}"]`),
                                    timestamp: Date.now()
                                }
                            }));
                        }, 100);
                    }
                }
            };
            
            logger.info('SYNC_MIGRATION', 'Created compatibility API for ComponentSync');
        }
        
        /**
         * Intercept calls to old API and redirect to new system
         */
        interceptOldAPI() {
            const originalAPI = window.ComponentSync;
            
            // Wrap each method
            Object.keys(originalAPI).forEach(method => {
                const originalMethod = originalAPI[method];
                
                window.ComponentSync[method] = (...args) => {
                    logger.debug('SYNC_MIGRATION', `Intercepted ComponentSync.${method}()`, args);
                    this.stats.apiCallsIntercepted++;
                    
                    // Call compatibility method
                    if (this.createCompatibilityAPI()[method]) {
                        this.createCompatibilityAPI()[method](...args);
                    }
                    
                    // Still call original if it exists
                    if (typeof originalMethod === 'function') {
                        return originalMethod(...args);
                    }
                };
            });
        }
        
        /**
         * Translate old events to new lifecycle events
         */
        translateEvents() {
            // Old system events → New lifecycle events
            const eventMappings = {
                'gmkb:component-editor-ready': 'component:editor-ready',
                'gmkb:component-updated': 'component:data-changed',
                'gmkb:component-rendered': 'component:dom-ready'
            };
            
            Object.entries(eventMappings).forEach(([oldEvent, newEvent]) => {
                document.addEventListener(oldEvent, (event) => {
                    logger.debug('SYNC_MIGRATION', `Translating ${oldEvent} → ${newEvent}`);
                    
                    // Translate event detail structure
                    const detail = this.translateEventDetail(oldEvent, event.detail);
                    
                    // Dispatch new event
                    document.dispatchEvent(new CustomEvent(newEvent, { detail }));
                });
            });
        }
        
        /**
         * Translate event detail from old format to new format
         */
        translateEventDetail(eventType, oldDetail) {
            if (!oldDetail) return {};
            
            switch (eventType) {
                case 'gmkb:component-editor-ready':
                    return {
                        componentId: oldDetail.componentId,
                        componentType: oldDetail.componentType,
                        container: oldDetail.container,
                        data: oldDetail.data || {},
                        timestamp: Date.now()
                    };
                    
                case 'gmkb:component-updated':
                    return {
                        componentId: oldDetail.componentId,
                        componentType: oldDetail.componentData?.type,
                        oldData: {},
                        newData: oldDetail.componentData || {},
                        changes: oldDetail.componentData || {},
                        timestamp: Date.now()
                    };
                    
                case 'gmkb:component-rendered':
                    return {
                        componentId: oldDetail.componentId,
                        componentType: oldDetail.componentData?.type,
                        container: document.querySelector(`[data-component-id="${oldDetail.componentId}"]`),
                        timestamp: Date.now()
                    };
                    
                default:
                    return oldDetail;
            }
        }
        
        /**
         * Migrate a component from old sync to new sync
         */
        migrateComponent(componentId) {
            // Check if component is in old system
            if (window.UniversalComponentSync?.syncedComponents?.has(componentId)) {
                const oldData = window.UniversalComponentSync.syncedComponents.get(componentId);
                
                logger.info('SYNC_MIGRATION', `Migrating component ${componentId} from old sync`);
                
                // Unregister from old system if possible
                if (window.UniversalComponentSync.syncedComponents) {
                    window.UniversalComponentSync.syncedComponents.delete(componentId);
                }
                
                // Register with new system
                this.syncCoordinator?.register(componentId, {
                    componentType: oldData.type,
                    editorContainer: oldData.sidebarElements,
                    fields: oldData.mapping?.fields || []
                });
                
                this.stats.componentsTransitioned++;
                
                return true;
            }
            
            return false;
        }
        
        /**
         * Migrate all components from old to new system
         */
        migrateAll() {
            if (!window.UniversalComponentSync?.syncedComponents) {
                logger.info('SYNC_MIGRATION', 'No components to migrate from old system');
                return;
            }
            
            const componentsToMigrate = Array.from(window.UniversalComponentSync.syncedComponents.keys());
            
            logger.info('SYNC_MIGRATION', `Migrating ${componentsToMigrate.length} components`);
            
            componentsToMigrate.forEach(componentId => {
                this.migrateComponent(componentId);
            });
            
            logger.info('SYNC_MIGRATION', `Migration complete: ${this.stats.componentsTransitioned} components migrated`);
        }
        
        /**
         * Check migration status
         */
        getStatus() {
            const status = {
                hasOldSystem: this.hasOldSystem,
                hasNewSystem: !!this.syncCoordinator,
                stats: this.stats,
                oldComponents: window.UniversalComponentSync?.syncedComponents?.size || 0,
                newComponents: this.syncCoordinator?.registry?.size || 0
            };
            
            return status;
        }
        
        /**
         * Show migration report
         */
        showReport() {
            const status = this.getStatus();
            
            console.group('%c🔄 Sync Migration Status', 'font-size: 14px; font-weight: bold; color: #FF9800');
            console.log('Old System Present:', status.hasOldSystem);
            console.log('New System Present:', status.hasNewSystem);
            console.log('Components in Old System:', status.oldComponents);
            console.log('Components in New System:', status.newComponents);
            console.log('API Calls Intercepted:', status.stats.apiCallsIntercepted);
            console.log('Components Transitioned:', status.stats.componentsTransitioned);
            console.groupEnd();
        }
    }
    
    // Create migration bridge
    window.syncMigrationBridge = new SyncMigrationBridge();
    
    // Console commands
    window.migrateSyncSystem = () => {
        window.syncMigrationBridge.migrateAll();
    };
    
    window.syncMigrationStatus = () => {
        window.syncMigrationBridge.showReport();
    };
    
    logger.info('SYNC_MIGRATION', 'Migration bridge loaded');
    logger.info('SYNC_MIGRATION', 'Commands: migrateSyncSystem(), syncMigrationStatus()');
    
})(window);
