/**
 * @file ui-init-coordinator.js
 * @description Coordinates initialization of UI components to prevent race conditions
 * ROOT FIX: Event-driven initialization without polling
 * @version 1.0.0
 */

(function(window) {
    'use strict';
    
    class UIInitCoordinator {
        constructor() {
            this.initialized = false;
            this.systems = new Map();
            this.readySystems = new Set();
            
            // Define UI systems to track
            this.uiSystems = [
                'modalBase',
                'tabs',
                'globalSettings',
                'toolbar'
            ];
            
            this.init();
        }
        
        init() {
            console.log('🎨 UI Init Coordinator: Starting initialization...');
            
            // Listen for system ready events
            this.listenForSystemEvents();
            
            // Check already loaded systems
            this.checkExistingSystems();
            
            // Set up initialization triggers
            this.setupInitializationTriggers();
        }
        
        listenForSystemEvents() {
            // Modal system ready
            document.addEventListener('gmkb:modal-base-ready', () => {
                this.markSystemReady('modalBase');
            });
            
            // Listen for main app ready
            document.addEventListener('gmkb:application-ready', () => {
                this.initializeUISystems();
            });
            
            // Listen for DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.checkExistingSystems();
                });
            }
        }
        
        checkExistingSystems() {
            // Check if systems are already available
            if (window.GMKB_Modals) {
                this.markSystemReady('modalBase');
            }
            
            if (window.setupTabs || window.GMKBTabs) {
                this.markSystemReady('tabs');
            }
            
            if (window.globalSettings || window.GMKBGlobalSettings) {
                this.markSystemReady('globalSettings');
            }
            
            if (window.setupToolbar) {
                this.markSystemReady('toolbar');
            }
        }
        
        setupInitializationTriggers() {
            // Initialize when core systems are ready
            document.addEventListener('gmkb:initialization-complete', () => {
                // Delay slightly to ensure all scripts are loaded
                setTimeout(() => {
                    this.initializeUISystems();
                }, 100);
            });
        }
        
        markSystemReady(systemName) {
            if (this.readySystems.has(systemName)) return;
            
            this.readySystems.add(systemName);
            console.log(`✅ UI System ready: ${systemName}`);
            
            // Check if all systems are ready
            if (this.readySystems.size === this.uiSystems.length && !this.initialized) {
                this.onAllSystemsReady();
            }
        }
        
        initializeUISystems() {
            if (this.initialized) return;
            
            console.log('🎨 UI Init Coordinator: Initializing UI systems...');
            
            // Initialize tabs
            if (window.setupTabs && !this.systems.has('tabs')) {
                window.setupTabs();
                this.systems.set('tabs', true);
                console.log('✅ Tabs initialized');
            }
            
            // Initialize global settings
            if (window.globalSettings && !this.systems.has('globalSettings')) {
                window.globalSettings.init().catch(err => {
                    console.warn('Global settings init failed (optional):', err);
                });
                this.systems.set('globalSettings', true);
                console.log('✅ Global settings initialized');
            }
            
            // Initialize toolbar
            if (window.setupToolbar && !this.systems.has('toolbar')) {
                window.setupToolbar();
                this.systems.set('toolbar', true);
                console.log('✅ Toolbar initialized');
            }
            
            this.initialized = true;
            this.emitUIReady();
        }
        
        onAllSystemsReady() {
            console.log('🎨 All UI systems loaded and ready');
            this.initializeUISystems();
        }
        
        emitUIReady() {
            document.dispatchEvent(new CustomEvent('gmkb:ui-ready', {
                detail: {
                    systems: Array.from(this.systems.keys()),
                    timestamp: Date.now()
                }
            }));
            console.log('🎨 UI Init Coordinator: All UI systems initialized');
        }
        
        // Public API
        isSystemReady(systemName) {
            return this.readySystems.has(systemName);
        }
        
        getStatus() {
            return {
                initialized: this.initialized,
                readySystems: Array.from(this.readySystems),
                initializedSystems: Array.from(this.systems.keys())
            };
        }
    }
    
    // Initialize coordinator
    window.uiInitCoordinator = new UIInitCoordinator();
    
})(window);
