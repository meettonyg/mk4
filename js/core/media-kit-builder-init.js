/**
 * Media Kit Builder - Enhanced Initialization
 * Proper boot sequence with dependency management
 */

import enhancedStateManager from './enhanced-state-manager.js';
import { enhancedComponentManager } from './enhanced-component-manager.js';
import { enhancedComponentRenderer } from './enhanced-component-renderer.js';
import { templateLoader } from '../services/template-loader.js';
import { historyService } from '../services/history-service.js';
import { setupSaveSystem, saveMediaKit } from '../services/save-service.js';
import { setupShareSystem } from '../services/share-service.js';
import { setupKeyboardShortcuts } from '../services/keyboard-service.js';

// Import UI modules that were in main.js
import { setupTabs } from '../ui/tabs.js';
import { setupPreviewToggle } from '../ui/preview.js';
import { setupDragAndDrop } from '../ui/dnd.js';
import { setupElementSelection, setupContentEditableUpdates } from '../ui/element-editor.js';
import { setupLayoutOptions } from '../ui/layout.js';
import { setupComponentLibraryModal } from '../modals/component-library.js';
import { setupGlobalSettings } from '../modals/global-settings.js';
import { setupExportSystem } from '../modals/export.js';



class MediaKitBuilderInit {
    constructor() {
        this.initialized = false;
        this.services = {};
    }
    
    /**
     * Initialize the Media Kit Builder
     */
    async initialize() {
        if (this.initialized) {
            console.log('Media Kit Builder already initialized');
            return;
        }
        
        console.log('Media Kit Builder: Starting enhanced initialization...');
        
        try {
            // Phase 1: Core services
            await this.initializeCoreServices();
            
            // Phase 2: State restoration
            await this.restoreState();
            
            // Phase 3: UI initialization
            await this.initializeUI();
            
            // Phase 4: Template system
            await this.initializeTemplates();
            
            // Phase 5: Event listeners
            this.setupEventListeners();
            
            // Phase 6: Auxiliary services
            await this.initializeAuxiliaryServices();
            
            this.initialized = true;
            console.log('Media Kit Builder: Enhanced initialization complete');
            
            // Dispatch ready event
            document.dispatchEvent(new CustomEvent('media-kit-builder-ready'));
            
        } catch (error) {
            console.error('Media Kit Builder initialization failed:', error);
            this.showError('Failed to initialize Media Kit Builder');
        }
    }
    
    /**
     * Initialize core services in proper order
     */
    async initializeCoreServices() {
        console.log('Initializing core services...');
        
        // Make enhanced services globally available
        window.stateManager = enhancedStateManager;
        window.componentManager = enhancedComponentManager;
        window.componentRenderer = enhancedComponentRenderer;
        window.enhancedStateManager = enhancedStateManager;
        window.enhancedComponentManager = enhancedComponentManager;
        window.enhancedComponentRenderer = enhancedComponentRenderer;
        
        // Initialize in dependency order
        // 1. Component manager (no dependencies)
        await enhancedComponentManager.init();
        
        // 2. Component renderer (depends on state manager)
        await new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
        
        enhancedComponentRenderer.init();
        
        
        console.log('Core services initialized');
    }
    
    /**
     * Restore saved state
     */
    async restoreState() {
        console.log('Restoring state...');
        
        const savedData = localStorage.getItem('mediaKitData');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                console.log('Found saved data, loading...');
                
                // Disable rendering during load
                document.dispatchEvent(new CustomEvent('disable-rendering'));
                
                // Load state with skipInitialRender option
                enhancedStateManager.loadSerializedState(data, { 
                    skipInitialRender: true 
                });
                
                // Re-enable rendering
                document.dispatchEvent(new CustomEvent('enable-rendering'));
                
                // Force a single render
                document.dispatchEvent(new CustomEvent('force-render'));
                
                console.log('State restored successfully');
                
            } catch (error) {
                console.error('Failed to restore state:', error);
                this.showError('Failed to load saved data');
                
                // Clear corrupted data
                localStorage.removeItem('mediaKitData');
            }
        } else {
            console.log('No saved state found, starting fresh');
        }
    }
    
    /**
     * Initialize UI components
     */
    async initializeUI() {
        console.log('Initializing UI...');
        
        // Setup core UI components from main.js
        setupTabs();
        setupPreviewToggle();
        setupDragAndDrop();
        setupElementSelection();
        setupContentEditableUpdates();
        setupLayoutOptions();
        setupComponentLibraryModal();
        setupGlobalSettings();
        setupExportSystem();
        
        // Initialize toolbar
        await this.initializeToolbar();
        
        // Initialize sidebar
        await this.initializeSidebar();
        
        // Initialize modals
        await this.initializeModals();
        
        // Make UI setup functions globally accessible for component renderer
        window.setupElementSelection = setupElementSelection;
        window.setupContentEditableUpdates = setupContentEditableUpdates;
        
        console.log('UI initialized');
    }
    
    /**
     * Initialize toolbar
     */
    async initializeToolbar() {
        // Setup toolbar buttons
        const saveBtn = document.getElementById('save-btn');
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        const themeBtn = document.getElementById('global-theme-btn');
        const exportBtn = document.getElementById('export-btn');
        const shareBtn = document.getElementById('share-btn');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                saveMediaKit();
            });
        }
        
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                if (window.historyService) {
                    window.historyService.undo();
                }
            });
        }
        
        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                if (window.historyService) {
                    window.historyService.redo();
                }
            });
        }
        
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('show-theme-settings'));
            });
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('show-export-modal'));
            });
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                // Share functionality might not have a showShareDialog method
                document.dispatchEvent(new CustomEvent('share-media-kit'));
            });
        }
        
        // Setup preview toggles
        const previewBtns = document.querySelectorAll('.toolbar__preview-btn');
        previewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const preview = btn.getAttribute('data-preview');
                this.setPreviewMode(preview);
                
                // Update active state
                previewBtns.forEach(b => b.classList.remove('toolbar__preview-btn--active'));
                btn.classList.add('toolbar__preview-btn--active');
            });
        });
    }
    
    /**
     * Initialize sidebar
     */
    async initializeSidebar() {
        // The sidebar is initialized by its own modules
        // Just ensure the tabs are working
        const tabs = document.querySelectorAll('.sidebar__tab');
        const panels = document.querySelectorAll('.sidebar__panel');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');
                
                // Update active states
                tabs.forEach(t => t.classList.remove('sidebar__tab--active'));
                panels.forEach(p => p.classList.remove('sidebar__panel--active'));
                
                tab.classList.add('sidebar__tab--active');
                const panel = document.getElementById(`${target}-panel`);
                if (panel) {
                    panel.classList.add('sidebar__panel--active');
                }
            });
        });
    }
    
    /**
     * Initialize modals
     */
    async initializeModals() {
        // Component library modal is handled by component-library.js
        // Template library modal is handled by template-library.js
        // Just ensure the close buttons work
        
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal__close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('modal--active');
                });
            }
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('modal--active');
                }
            });
        });
    }
    
    /**
     * Initialize template system
     */
    async initializeTemplates() {
        console.log('Initializing template system...');
        
        if (window.templateLoader && typeof window.templateLoader.init === 'function') {
            await window.templateLoader.init();
        }
        
        // Setup template library if not already done
        const loadTemplateBtn = document.getElementById('load-template');
        if (loadTemplateBtn && !loadTemplateBtn.hasAttribute('data-init')) {
            loadTemplateBtn.setAttribute('data-init', 'true');
            
            // Import template library module from correct location
            import('../modals/template-library.js').then(() => {
                console.log('Template library loaded');
            }).catch(error => {
                console.error('Failed to load template library:', error);
            });
        }
        
        console.log('Template system initialized');
    }
    
    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Save on state changes (with debounce)
        let saveTimeout;
        enhancedStateManager.subscribeGlobal(() => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                const data = enhancedStateManager.getSerializableState();
                localStorage.setItem('mediaKitData', JSON.stringify(data));
                console.log('State auto-saved');
            }, 1000);
        });
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                document.dispatchEvent(new CustomEvent('window-resized'));
            }, 250);
        });
        
        // Prevent accidental navigation
        window.addEventListener('beforeunload', (e) => {
            const state = enhancedStateManager.getState();
            if (Object.keys(state.components).length > 0) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
        
        console.log('Event listeners setup complete');
    }
    
    /**
     * Initialize auxiliary services
     */
    async initializeAuxiliaryServices() {
        console.log('Initializing auxiliary services...');
        
        // Initialize history service
        if (window.historyService && typeof window.historyService.init === 'function') {
            window.historyService.init();
        }
        
        // Initialize save service
        setupSaveSystem();
        
        // Initialize share service
        setupShareSystem();
        
        // Initialize keyboard shortcuts
        setupKeyboardShortcuts();
        
        console.log('Auxiliary services initialized');
    }
    
    /**
     * Set preview mode
     */
    setPreviewMode(mode) {
        const container = document.getElementById('preview-container');
        if (!container) return;
        
        // Remove existing classes
        container.classList.remove('preview--desktop', 'preview--tablet', 'preview--mobile');
        
        // Add new class
        container.classList.add(`preview--${mode}`);
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('preview-mode-changed', {
            detail: { mode }
        }));
    }
    
    /**
     * Show error message
     */
    showError(message) {
        console.error(message);
        
        // Try to use toast service
        if (window.historyService && window.historyService.showToast) {
            window.historyService.showToast(message, 'error');
        } else {
            // Fallback to alert
            alert(message);
        }
    }
}

// Create and export singleton instance
const mediaKitBuilderInit = new MediaKitBuilderInit();

// Auto-initialize when DOM is ready and only if enhanced init is enabled
if (window.guestifyData?.features?.useEnhancedInit || window.mediaKitFeatures?.FEATURES?.USE_ENHANCED_INITIALIZATION) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Check if not already initialized by main.js
            if (!window.mediaKitBuilderInitialized) {
                window.mediaKitBuilderInitialized = true;
                mediaKitBuilderInit.initialize();
            }
        });
    } else {
        // DOM already loaded
        if (!window.mediaKitBuilderInitialized) {
            window.mediaKitBuilderInitialized = true;
            mediaKitBuilderInit.initialize();
        }
    }
}

// Export for manual initialization if needed
export { mediaKitBuilderInit };