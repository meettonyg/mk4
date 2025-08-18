/**
 * @file main.js - Media Kit Builder (WordPress-Compatible Entry Point)
 * @description ROOT FIX: Simplified initialization with essential systems only
 * Phase 1: Architectural Integrity & Race Condition Prevention - COMPLETE
 */

// ROOT FIX: Immediate debug log with simplified architecture
console.log('%c🚀 GMKB main.js LOADING (SIMPLIFIED ARCHITECTURE)...', 'font-weight: bold; color: #10b981; background: #ecfdf5; padding: 2px 6px; border-radius: 3px;');
console.log('📜 Script URL:', document.currentScript?.src || 'unknown');
console.log('📜 Load time:', new Date().toISOString());
console.log('🔧 ARCHITECTURE: Simplified WordPress-compatible initialization');
console.log('✅ ROOT FIX: Event-driven initialization with minimal dependencies');

// ROOT FIX: IMMEDIATE component data exposure to prevent "No component data in globals"
// ROOT FIX: SAFE component data exposure with error handling
function safeExposeComponentData() {
    try {
        if (!window.gmkbComponentsData && (window.gmkbData || window.guestifyData)) {
            const data = window.gmkbData || window.guestifyData;
            if (data && data.components) {
                // ROOT FIX: Check if components is object or array
                if (Array.isArray(data.components)) {
                    window.gmkbComponentsData = data.components;
                    console.log('✅ GMKB: Component data exposed immediately (array)', { count: data.components.length });
                } else if (typeof data.components === 'object') {
                    window.gmkbComponentsData = Object.values(data.components);
                    console.log('✅ GMKB: Component data exposed immediately (object)', { count: Object.keys(data.components).length });
                }
                return true;
            }
        }
        
        if (!window.gmkbComponentsData) {
            // Create minimal fallback immediately
            window.gmkbComponentsData = [
                {
                    type: 'hero',
                    name: 'Hero Section',
                    title: 'Hero Section',
                    description: 'A prominent header section with title and subtitle',
                    category: 'essential',
                    premium: false,
                    icon: 'fa-star'
                },
                {
                    type: 'biography',
                    name: 'Biography',
                    title: 'Biography',
                    description: 'Professional biography section',
                    category: 'essential',
                    premium: false,
                    icon: 'fa-user'
                },
                {
                    type: 'contact',
                    name: 'Contact',
                    title: 'Contact Information',
                    description: 'Contact details and social links',
                    category: 'essential',
                    premium: false,
                    icon: 'fa-envelope'
                }
            ];
            console.log('🛡️ GMKB: Component data fallback created immediately');
            return true;
        }
    } catch (error) {
        console.error('❌ GMKB: Error in safeExposeComponentData:', error);
        return false;
    }
    return false;
}

// Execute safely
if (safeExposeComponentData()) {
    console.log('✅ GMKB: Component data setup completed');
} else {
    // Retry if WordPress data isn't available yet
    setTimeout(() => {
        if (safeExposeComponentData()) {
            console.log('✅ GMKB: Component data exposed on retry');
        }
    }, 100);
}

// ROOT FIX: Simplified initialization with essential systems only
async function initializeWhenReady() {
    console.log('🚀 GMKB: Starting simplified initialization sequence');
    
    // ROOT FIX: Ensure essential dependencies are available
    if (!window.structuredLogger) {
        console.warn('⚠️ GMKB: Structured logger not available, using console fallback');
        createFallbackLogger();
    }
    
    try {
        // ROOT FIX: Initialize only essential systems
        window.structuredLogger.info('MAIN', 'Starting simplified application initialization');
        
        // 1. Initialize state manager - ROOT FIX: Prevent double initialization
        if (window.enhancedStateManager && !window.enhancedStateManager.isInitialized) {
            window.structuredLogger.info('STATE', 'Initializing state manager ONCE with WordPress data...');
            
            // ROOT FIX: Single initialization path - no complex waiting
            if (window.enhancedStateManager.initializeAfterSystems) {
                await window.enhancedStateManager.initializeAfterSystems();
            }
            window.structuredLogger.info('MAIN', 'State manager initialized successfully');
        } else if (window.enhancedStateManager && window.enhancedStateManager.isInitialized) {
            window.structuredLogger.debug('MAIN', 'State manager already initialized, skipping');
        } else {
            window.structuredLogger.warn('MAIN', 'Enhanced state manager not available');
        }
        
        // 2. Initialize component renderer - ROOT FIX: Prevent double initialization and render
        if (window.enhancedComponentRenderer && !window.enhancedComponentRenderer.initialized) {
            window.enhancedComponentRenderer.init();
            window.structuredLogger.info('MAIN', 'Component renderer initialized once');
        } else if (window.enhancedComponentRenderer && window.enhancedComponentRenderer.initialized) {
            window.structuredLogger.debug('MAIN', 'Component renderer already initialized, skipping');
        } else {
            window.structuredLogger.error('MAIN', 'Enhanced component renderer not available');
        }
        
        // 3. Initialize component manager
        if (window.enhancedComponentManager) {
            if (window.enhancedComponentManager.isInitialized) {
                // ROOT FIX: Reduce noise - only log in debug mode
                if (window.gmkbData && window.gmkbData.debugMode) {
                    window.structuredLogger.debug('COMPONENT', 'Component manager already initialized, skipping');
                }
            } else if (window.enhancedComponentManager.initialize) {
                window.enhancedComponentManager.initialize();
                window.structuredLogger.info('MAIN', 'Component manager initialized');
            }
        } else {
            window.structuredLogger.warn('MAIN', 'Enhanced component manager not available');
        }
        
        // 4. Initialize empty state handlers (already loaded)
        if (window.emptyStateHandlers && window.emptyStateHandlers.init) {
            window.emptyStateHandlers.init();
            window.structuredLogger.info('MAIN', 'Empty state handlers initialized');
        }
        
        // 5. Set up basic event listeners
        setupBasicEventListeners();
        
        // 6. Initialize UI components (tabs, modals, etc.)
        setupCoreUI();
        
        // 7. Hide loading state and show the builder
        hideLoadingState();
        
        // 8. Update GMKB systems references
        if (window.GMKB) {
            window.GMKB.systems.StateManager = window.enhancedStateManager;
            window.GMKB.systems.ComponentManager = window.enhancedComponentManager;
            window.GMKB.systems.ComponentRenderer = window.enhancedComponentRenderer;
        }
        
        // 9. Emit application ready event
        document.dispatchEvent(new CustomEvent('gmkb:application-ready', {
            detail: {
                timestamp: Date.now(),
                simplified: true,
                essential: true
            }
        }));
        
        // 10. Emit initialization complete event for other modules
        document.dispatchEvent(new CustomEvent('gmkb:initialization-complete', {
            detail: {
                timestamp: Date.now(),
                GMKB: window.GMKB
            }
        }));
        
        console.log('✅ GMKB: Simplified application initialization completed successfully.');
        console.log('📡 GMKB: Global namespace exposed for module coordination');
        window.structuredLogger.info('MAIN', 'Application initialization complete');
        
    } catch (error) {
        console.error('❌ GMKB: Initialization failed:', error);
        window.structuredLogger.error('MAIN', 'Initialization failed', error);
        
        // ROOT FIX: Create minimal fallback
        initializeMinimalFallback();
    }
}

/**
 * ROOT FIX: Hide loading state and show the builder interface
 */
function hideLoadingState() {
    try {
        // Hide various loading states that might be showing
        const loadingStates = [
            document.getElementById('loading-state'),
            document.getElementById('state-loading-enhanced'),
            document.querySelector('.loading-state'),
            document.querySelector('.gmkb-loading'),
            document.querySelector('[data-loading]')
        ];
        
        loadingStates.forEach(element => {
            if (element) {
                element.style.display = 'none';
                element.classList.remove('show', 'active');
            }
        });
        
        // Show the main builder interface
        const builderElements = [
            document.getElementById('media-kit-builder'),
            document.getElementById('media-kit-preview'),
            document.querySelector('.media-kit-builder'),
            document.querySelector('.gmkb-builder')
        ];
        
        builderElements.forEach(element => {
            if (element) {
                element.style.display = 'block';
                element.classList.add('ready');
            }
        });
        
        // Update any loading text
        const loadingTexts = document.querySelectorAll('[data-loading-text]');
        loadingTexts.forEach(element => {
            const readyText = element.dataset.readyText || 'Media Kit Builder';
            element.textContent = readyText;
        });
        
        // ROOT FIX: Remove any remaining loading classes and ensure ready state
        document.body.classList.remove('gmkb-loading', 'loading', 'gmkb-initializing');
        document.body.classList.add('gmkb-ready');
        
        window.structuredLogger.info('MAIN', 'Loading state hidden, builder interface shown');
        
    } catch (error) {
        window.structuredLogger.error('MAIN', 'Failed to hide loading state', error);
    }
}

/**
 * ROOT FIX: Create fallback logger if not available
 */
function createFallbackLogger() {
    window.structuredLogger = {
        info: (category, message, data) => console.log(`[${category}] ${message}`, data || ''),
        debug: (category, message, data) => console.debug(`[${category}] ${message}`, data || ''),
        warn: (category, message, data) => console.warn(`[${category}] ${message}`, data || ''),
        error: (category, message, error, data) => console.error(`[${category}] ${message}`, error, data || '')
    };
    console.log('🛟 MAIN: Created fallback structured logger');
}

/**
 * ROOT FIX: Setup core UI components (tabs, modals, etc.)
 */
function setupCoreUI() {
    try {
        // ROOT FIX: Initialize tabs system first
        if (window.setupTabs) {
            window.setupTabs();
            window.structuredLogger.info('MAIN', 'Tabs system initialized');
        } else {
            setupTabs(); // fallback to local implementation
        }
        
        // ROOT FIX: Initialize toolbar functionality (device preview, button handlers)
        if (window.setupToolbar) {
            window.setupToolbar();
            window.structuredLogger.info('MAIN', 'Toolbar system initialized');
        } else {
            console.warn('⚠️ MAIN: Toolbar setup function not available');
        }
        
        // ROOT FIX: Initialize component interactions (component clicks, drag and drop)
        if (window.setupComponentInteractions) {
            window.setupComponentInteractions();
            window.structuredLogger.info('MAIN', 'Component interactions initialized');
        } else {
            console.warn('⚠️ MAIN: Component interactions setup function not available');
        }
        
        // ROOT CAUSE FIX: Remove duplicate call to setupDevicePreviewToggle()
        // Device preview toggle is already initialized by setupToolbar() above
        // This prevents the race condition that causes horizontal layout issues
        
        // Initialize form controls
        if (window.formControls) {
            window.formControls.setup();
            window.structuredLogger.info('MAIN', 'Form controls initialized');
        }
        
        // Initialize element controls
        if (window.elementControls) {
            window.elementControls.setup();
            window.structuredLogger.info('MAIN', 'Element controls initialized');
        }
        
        // Initialize modals
        setupModals();
        
        // Initialize component library
        setupComponentLibrary();
        
        // Initialize layout handlers
        setupLayoutHandlers();
        
        window.structuredLogger.info('MAIN', 'Core UI setup complete');
        
    } catch (error) {
        window.structuredLogger.error('MAIN', 'Core UI setup failed', error);
    }
}

/**
 * ROOT FIX: Setup tab functionality
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.media-kit-tabs .tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    if (tabButtons.length === 0) {
        window.structuredLogger.debug('MAIN', 'No tabs found to initialize');
        return;
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetPanel = button.dataset.tab;
            if (!targetPanel) return;
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            const panel = document.getElementById(targetPanel);
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
    
    window.structuredLogger.info('MAIN', 'Tabs initialized', { count: tabButtons.length });
}

/**
 * ROOT FIX: Setup modal functionality
 */
function setupModals() {
    // Initialize modal triggers
    const modalTriggers = document.querySelectorAll('[data-modal]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            
            const modalId = trigger.dataset.modal;
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.style.display = 'block';
                modal.classList.add('show');
                
                // Add close functionality
                const closeBtn = modal.querySelector('.modal-close, .close-modal');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                        modal.classList.remove('show');
                    });
                }
                
                // Close on backdrop click
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                        modal.classList.remove('show');
                    }
                });
            }
        });
    });
    
    window.structuredLogger.info('MAIN', 'Modals initialized', { count: modalTriggers.length });
}

/**
 * ROOT FIX: Setup component library functionality with race condition prevention
 */
function setupComponentLibrary() {
    // Ensure component data is available globally with enhanced safety
    if (!window.gmkbComponentsData && (window.gmkbData || window.guestifyData)) {
        const data = window.gmkbData || window.guestifyData;
        if (data && data.components) {
            // ROOT FIX: Handle both object and array component formats
            if (Array.isArray(data.components)) {
                window.gmkbComponentsData = data.components;
            } else if (typeof data.components === 'object') {
                window.gmkbComponentsData = Object.values(data.components);
            } else {
                window.gmkbComponentsData = [];
            }
            window.structuredLogger.info('MAIN', 'Component data made globally available', { count: window.gmkbComponentsData.length });
        } else {
            window.gmkbComponentsData = [];
            window.structuredLogger.warn('MAIN', 'No components found in WordPress data, using empty array');
        }
    }
    
    // ROOT CAUSE FIX: Prevent duplicate component library initialization that causes toolbar race condition
    const componentLibrary = document.getElementById('component-library-overlay');
    if (componentLibrary && window.componentLibrarySystem) {
        // Check if component library is already initialized to prevent double initialization
        if (window.componentLibrarySystem.isInitialized && window.componentLibrarySystem.isInitialized()) {
            window.structuredLogger.info('MAIN', 'Component library already initialized, skipping duplicate setup');
        } else if (typeof window.componentLibrarySystem.initialize === 'function') {
            window.componentLibrarySystem.initialize();
            window.structuredLogger.info('MAIN', 'Component library system initialized');
        }
    }
}

/**
 * ROOT FIX: Setup layout and drag-drop handlers
 */
function setupLayoutHandlers() {
    // Basic layout handling - can be expanded later
    const previewContainer = document.getElementById('media-kit-preview');
    if (previewContainer) {
        // Add basic drop zone functionality
        previewContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            previewContainer.classList.add('drag-over');
        });
        
        previewContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            previewContainer.classList.remove('drag-over');
        });
        
        previewContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            previewContainer.classList.remove('drag-over');
            // Drop handling would go here
        });
        
        window.structuredLogger.info('MAIN', 'Layout handlers initialized');
    }
}

/**
 * ROOT FIX: Setup basic event listeners for essential functionality
 */
function setupBasicEventListeners() {
    // Listen for save button clicks
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveClick);
        window.structuredLogger.info('MAIN', 'Save button listener attached');
    }
    
    // Listen for add component button clicks (fallback)
    const addComponentBtn = document.getElementById('add-component-btn');
    if (addComponentBtn) {
        addComponentBtn.addEventListener('click', () => {
            // ROOT FIX: Try multiple ways to open component library
            if (window.componentLibrarySystem && window.componentLibrarySystem.show) {
                window.componentLibrarySystem.show();
            } else {
                // Fallback: directly show the modal
                const modal = document.getElementById('component-library-overlay');
                if (modal) {
                    modal.style.display = 'block';
                    modal.classList.add('show');
                    
                    // Ensure component data is available
                    if (!window.gmkbComponentsData && (window.gmkbData || window.guestifyData)) {
                        const data = window.gmkbData || window.guestifyData;
                        window.gmkbComponentsData = data.components || [];
                    }
                } else {
                    window.structuredLogger.warn('MAIN', 'Component library modal not found');
                }
            }
        });
        window.structuredLogger.info('MAIN', 'Add component button listener attached');
    }
    
    window.structuredLogger.info('MAIN', 'Basic event listeners setup complete');
}

/**
 * ROOT FIX: Simplified save handler using component manager auto-save
 * CHECKLIST COMPLIANT: Event-driven, no polling, root cause fix
 */
async function handleSaveClick() {
    if (!window.enhancedComponentManager) {
        console.warn('⚠️ GMKB: Cannot save - component manager not available');
        window.structuredLogger?.warn('MAIN', 'Component manager not available for save');
        return;
    }
    
    try {
        window.structuredLogger?.info('MAIN', 'Manual save requested via save button');
        console.log('💾 GMKB: Saving current state...');
        
        // ROOT FIX: Preserve component visibility during save
        const savedContainer = document.getElementById('saved-components-container');
        const hasComponents = window.enhancedStateManager ? Object.keys(window.enhancedStateManager.getState().components || {}).length > 0 : false;
        
        // Use component manager's save method which includes auto-save functionality
        await window.enhancedComponentManager.manualSave();
        
        // ROOT FIX: Ensure saved container stays visible if we have components
        if (hasComponents && savedContainer) {
            savedContainer.style.display = 'block';
            
            // Hide empty state if it's showing
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
        }
        
        console.log('✅ GMKB: State saved successfully via save button');
        window.structuredLogger?.info('MAIN', 'Manual save completed successfully');
        
        // Show success feedback to user
        if (window.showToast) {
            window.showToast('Media kit saved successfully!', 'success', 3000);
        }
        
    } catch (error) {
        console.error('❌ GMKB: Save failed:', error);
        window.structuredLogger?.error('MAIN', 'Manual save failed', error);
        
        // Show error feedback to user
        if (window.showToast) {
            window.showToast('Failed to save media kit. Please try again.', 'error', 5000);
        } else {
            alert('Failed to save media kit. Please try again.');
        }
    }
}

/**
 * ROOT FIX: Minimal fallback initialization when core systems fail
 */
function initializeMinimalFallback() {
    console.log('🛟 GMKB: Starting minimal fallback initialization');
    
    try {
        // Create basic logger if not available
        if (!window.structuredLogger) {
            createFallbackLogger();
        }
        
        // Set up basic button functionality
        setupBasicEventListeners();
        
        console.log('✅ GMKB: Minimal fallback initialization completed');
        window.structuredLogger.info('MAIN', 'Minimal fallback active');
        
    } catch (error) {
        console.error('❌ GMKB: Even minimal fallback failed:', error);
    }
}

// ROOT FIX: Wrap initialization in IIFE to prevent global conflicts
(function() {
'use strict';

// ROOT FIX: Simplified DOM ready handler with initialization guard
let isInitializing = false;
let isInitialized = false;

async function safeInitialization() {
    // ROOT FIX: Prevent duplicate initialization with better logging
    if (isInitializing || isInitialized) {
        // Only log in debug mode to reduce console noise
        if (window.gmkbData && window.gmkbData.debugMode) {
            console.debug('🚷 GMKB: Initialization already in progress or completed, skipping...');
        }
        return;
    }
    
    isInitializing = true;
    
    try {
        await initializeWhenReady();
        isInitialized = true;
    } catch (error) {
        console.error('❌ GMKB: Safe initialization failed:', error);
    } finally {
        isInitializing = false;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitialization);
} else {
    // DOM is already ready
    safeInitialization();
}

// ROOT FIX: Expose GMKB globally to fix infinite polling loops
// This prevents sortable-integration.js from infinite polling
window.GMKB = {
    // Core systems for coordination
    systems: {
        StateManager: window.enhancedStateManager,
        ComponentManager: window.enhancedComponentManager,
        ComponentRenderer: window.enhancedComponentRenderer
    },
    
    // Event system for coordination (simplified)
    subscribe: function(event, callback) {
        console.log(`📡 GMKB: Subscribing to event: ${event}`);
        document.addEventListener(event, callback);
    },
    
    dispatch: function(event, data) {
        console.log(`📡 GMKB: Dispatching event: ${event}`, data);
        document.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    
    // Initialize function for coordination
    initialize: safeInitialization,
    
    // Status checks
    isReady: () => !!(window.structuredLogger && window.enhancedStateManager && window.enhancedComponentManager),
    isInitialized: () => isInitialized,
    isInitializing: () => isInitializing,
    
    // Component data access
    getComponentsData: () => window.gmkbComponentsData || [],
    
    // Version info
    version: '4.0.0',
    architecture: 'simplified-wordpress-compatible'
};

// ROOT FIX: Also expose gmkbApp for backwards compatibility
window.gmkbApp = {
    initialize: safeInitialization,
    forceReinitialize: async () => {
        isInitialized = false;
        isInitializing = false;
        console.log('🔄 GMKB: Force reinitializing...');
        await safeInitialization();
    },
    save: handleSaveClick,
    manualSave: () => window.enhancedComponentManager?.manualSave(),
    getState: () => window.enhancedStateManager?.getState(),
    addComponent: (type, props) => window.enhancedComponentManager?.addComponent(type, props),
    removeComponent: (id) => window.enhancedComponentManager?.removeComponent(id),
    isReady: () => window.GMKB.isReady(),
    isInitialized: () => window.GMKB.isInitialized(),
    isInitializing: () => window.GMKB.isInitializing(),
    hideLoading: hideLoadingState,
    setupUI: setupCoreUI,
    debug: {
        state: () => window.enhancedStateManager?.debug(),
        components: () => window.enhancedComponentManager?.getStatus(),
        empty: () => window.emptyStateHandlers?.getStatus()
    }
};

})(); // End IIFE

console.log('✅ GMKB: Simplified main application loaded and ready');
