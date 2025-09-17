/**
 * Main Initialization Script for Phase 1-4 Systems
 * Coordinates the startup of the new component communication architecture
 * 
 * Phase 1: Component Lifecycle Standard
 * Phase 2: Data-Only State Management
 * Phase 3: Unified Sync Coordinator
 * Phase 4: Clear DOM Ownership
 */
(function() {
    'use strict';

    class MainInitializer {
        constructor() {
            this.systems = {
                lifecycle: false,
                dataState: false,
                syncCoordinator: false,
                domOwnership: false,
                legacy: false
            };
            
            this.initComplete = false;
            this.startTime = performance.now();
            
            console.log('🚀 Media Kit Builder Phase 1-4 Initialization Starting...');
            this.init();
        }

        init() {
            // Listen for system ready events
            this.setupSystemListeners();
            
            // Wait for DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
            } else {
                this.onDOMReady();
            }
        }

        setupSystemListeners() {
            // Phase 1: Component Lifecycle
            document.addEventListener('component:lifecycle-ready', () => {
                this.systems.lifecycle = true;
                console.log('✅ Phase 1: Component Lifecycle Ready');
                this.checkAllSystemsReady();
            });

            // Phase 2: Data State
            document.addEventListener('data-state:ready', () => {
                this.systems.dataState = true;
                console.log('✅ Phase 2: Data State Management Ready');
                this.checkAllSystemsReady();
            });

            // Phase 3: Sync Coordinator
            document.addEventListener('sync-coordinator:ready', () => {
                this.systems.syncCoordinator = true;
                console.log('✅ Phase 3: Sync Coordinator Ready');
                this.checkAllSystemsReady();
            });

            // Phase 4: DOM Ownership
            document.addEventListener('dom-ownership:ready', () => {
                this.systems.domOwnership = true;
                console.log('✅ Phase 4: DOM Ownership Manager Ready');
                this.checkAllSystemsReady();
            });

            // Legacy systems (should already be loaded)
            document.addEventListener('gmkb:core-systems-ready', () => {
                this.systems.legacy = true;
                console.log('✅ Legacy Core Systems Ready');
                this.checkAllSystemsReady();
            });
        }

        onDOMReady() {
            console.log('📄 DOM Ready - Initializing Phase 1-4 Systems');
            
            // Initialize systems in order
            this.initializePhase1();
            this.initializePhase2();
            this.initializePhase3();
            this.initializePhase4();
            
            // Set up migration bridge
            this.setupMigrationBridge();
            
            // Wait for legacy systems
            this.waitForLegacySystems();
        }

        initializePhase1() {
            // Initialize Component Lifecycle
            if (window.ComponentLifecycle) {
                console.log('🔄 Initializing Phase 1: Component Lifecycle');
                // The class should auto-initialize, but we can trigger it
                document.dispatchEvent(new CustomEvent('component:lifecycle-ready'));
            } else {
                console.warn('⚠️ ComponentLifecycle not found - checking later');
                setTimeout(() => this.initializePhase1(), 100);
            }
        }

        initializePhase2() {
            // Initialize Data State
            if (window.DataState) {
                console.log('🔄 Initializing Phase 2: Data State');
                // Initialize the clean state manager
                if (!window.dataState) {
                    window.dataState = new DataState();
                }
                document.dispatchEvent(new CustomEvent('data-state:ready'));
            } else {
                console.warn('⚠️ DataState not found - checking later');
                setTimeout(() => this.initializePhase2(), 100);
            }
        }

        initializePhase3() {
            // Initialize Sync Coordinator
            if (window.SyncCoordinator) {
                console.log('🔄 Initializing Phase 3: Sync Coordinator');
                // The SyncCoordinator should auto-initialize
                document.dispatchEvent(new CustomEvent('sync-coordinator:ready'));
            } else {
                console.warn('⚠️ SyncCoordinator not found - checking later');
                setTimeout(() => this.initializePhase3(), 100);
            }
        }

        initializePhase4() {
            // Initialize DOM Ownership Manager
            if (window.DOMOwnershipManager) {
                console.log('🔄 Initializing Phase 4: DOM Ownership Manager');
                // The manager should auto-initialize
                document.dispatchEvent(new CustomEvent('dom-ownership:ready'));
            } else {
                console.warn('⚠️ DOMOwnershipManager not found - checking later');
                setTimeout(() => this.initializePhase4(), 100);
            }
        }

        setupMigrationBridge() {
            // Set up compatibility layer between old and new systems
            console.log('🌉 Setting up migration bridge...');
            
            // Listen for old system events and forward to new system
            document.addEventListener('component:data-changed', (event) => {
                // Forward to new sync coordinator
                if (window.SyncCoordinator && window.SyncCoordinator.handleDataChange) {
                    window.SyncCoordinator.handleDataChange(event.detail);
                }
            });

            // Listen for state changes and migrate to clean state
            if (window.GMKB && window.GMKB.stateManager) {
                const originalDispatch = window.GMKB.stateManager.dispatch;
                window.GMKB.stateManager.dispatch = function(action, data) {
                    // Call original
                    const result = originalDispatch.call(this, action, data);
                    
                    // Mirror to clean state if it's a component update
                    if (action === 'UPDATE_COMPONENT' && window.dataState) {
                        window.dataState.updateComponent(data.id, {
                            type: data.type,
                            data: data.props || data.data,
                            sectionId: data.sectionId
                        });
                    }
                    
                    return result;
                };
            }
        }

        waitForLegacySystems() {
            // Check if legacy systems are ready
            if (window.GMKB && window.GMKB.initialized) {
                this.systems.legacy = true;
                console.log('✅ Legacy systems already initialized');
                this.checkAllSystemsReady();
            } else {
                console.log('⏳ Waiting for legacy systems...');
                // The event listener will handle it
            }
        }

        checkAllSystemsReady() {
            // Check if all required systems are ready
            const required = ['lifecycle', 'dataState', 'syncCoordinator', 'domOwnership'];
            const allRequired = required.every(sys => this.systems[sys]);
            
            if (allRequired && !this.initComplete) {
                this.onAllSystemsReady();
            } else {
                const readySystems = Object.entries(this.systems)
                    .filter(([_, ready]) => ready)
                    .map(([name, _]) => name);
                console.log('⏳ Systems ready:', readySystems.join(', '));
            }
        }

        onAllSystemsReady() {
            this.initComplete = true;
            const elapsed = performance.now() - this.startTime;
            
            console.log('🎉 All Phase 1-4 Systems Ready!');
            console.log(`⏱️ Initialization time: ${elapsed.toFixed(2)}ms`);
            
            // Dispatch global ready event
            document.dispatchEvent(new CustomEvent('gmkb:phase1-4-ready', {
                detail: {
                    systems: this.systems,
                    initTime: elapsed
                }
            }));
            
            // Expose global status functions
            this.exposeGlobalFunctions();
            
            // Run migration if needed
            if (window.migrateSyncSystem) {
                console.log('🔄 Running sync system migration...');
                window.migrateSyncSystem();
            }
            
            // Initialize any waiting components
            this.initializeWaitingComponents();
        }

        initializeWaitingComponents() {
            // Find components that need the new lifecycle
            const components = document.querySelectorAll('[data-component-id]:not([data-lifecycle-initialized])');
            
            if (components.length > 0) {
                console.log(`🔧 Initializing ${components.length} components with new lifecycle`);
                
                components.forEach(component => {
                    const componentId = component.dataset.componentId;
                    const componentType = component.dataset.componentType;
                    
                    // Check if there's an editor for this component type
                    if (window[`${componentType}Editor`]) {
                        console.log(`📦 Initializing ${componentType} editor for ${componentId}`);
                        // Editor will self-initialize and register with systems
                    }
                    
                    // Mark as initialized
                    component.dataset.lifecycleInitialized = 'true';
                });
            }
        }

        exposeGlobalFunctions() {
            // Expose status and control functions
            window.getPhase14Status = () => {
                return {
                    initialized: this.initComplete,
                    systems: this.systems,
                    hasLifecycle: !!window.ComponentLifecycle,
                    hasDataState: !!window.DataState,
                    hasSyncCoordinator: !!window.SyncCoordinator,
                    hasDOMOwnership: !!window.DOMOwnershipManager,
                    dataStateInstance: !!window.dataState,
                    initTime: performance.now() - this.startTime
                };
            };

            window.testPhase14Integration = () => {
                console.group('🧪 Testing Phase 1-4 Integration');
                
                // Test each phase
                console.log('Phase 1 (Lifecycle):', !!window.ComponentLifecycle ? '✅' : '❌');
                console.log('Phase 2 (DataState):', !!window.dataState ? '✅' : '❌');
                console.log('Phase 3 (SyncCoordinator):', !!window.SyncCoordinator ? '✅' : '❌');
                console.log('Phase 4 (DOMOwnership):', !!window.DOMOwnershipManager ? '✅' : '❌');
                
                // Test integration points
                if (window.dataState) {
                    const testId = 'test-' + Date.now();
                    window.dataState.updateComponent(testId, {
                        type: 'test',
                        data: { value: 'test' }
                    });
                    const retrieved = window.dataState.getComponent(testId);
                    console.log('Data persistence:', retrieved ? '✅' : '❌');
                }
                
                console.groupEnd();
                return 'Test complete - check console for results';
            };

            window.reinitializePhases = () => {
                console.log('🔄 Reinitializing Phase 1-4 systems...');
                this.systems = {
                    lifecycle: false,
                    dataState: false,
                    syncCoordinator: false,
                    domOwnership: false,
                    legacy: this.systems.legacy
                };
                this.initComplete = false;
                this.onDOMReady();
                return 'Reinitialization started';
            };

            console.log('📋 Phase 1-4 functions available:');
            console.log('  - getPhase14Status()');
            console.log('  - testPhase14Integration()');
            console.log('  - reinitializePhases()');
        }
    }

    // Initialize the main coordinator
    const initializer = new MainInitializer();
    
    // Expose for debugging
    window.phase14Initializer = initializer;

})();
