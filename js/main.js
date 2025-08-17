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
if (!window.gmkbComponentsData && (window.gmkbData || window.guestifyData)) {
    const data = window.gmkbData || window.guestifyData;
    if (data && data.components) {
        window.gmkbComponentsData = data.components;
        console.log('✅ GMKB: Component data exposed immediately', { count: data.components.length });
    }
} else if (!window.gmkbComponentsData) {
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
        
        // 1. Initialize state manager and WAIT for it to complete
        if (window.enhancedStateManager) {
            window.structuredLogger.info('STATE', 'Initializing Enhanced State Manager...');
            if (window.enhancedStateManager.initializeAfterSystems) {
                await window.enhancedStateManager.initializeAfterSystems();
            }
            window.structuredLogger.info('MAIN', 'State manager initialized');
        } else {
            window.structuredLogger.warn('MAIN', 'Enhanced state manager not available');
        }
        
        // 2. Initialize component renderer AFTER state manager completes
        if (window.enhancedComponentRenderer) {
            window.enhancedComponentRenderer.init();
            window.structuredLogger.info('MAIN', 'Component renderer initialized - will display saved components');
        } else {
            window.structuredLogger.error('MAIN', 'Enhanced component renderer not available - saved components will not display');
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
        
        // 8. Emit application ready event
        document.dispatchEvent(new CustomEvent('gmkb:application-ready', {
            detail: {
                timestamp: Date.now(),
                simplified: true,
                essential: true
            }
        }));
        
        console.log('✅ GMKB: Simplified application initialization completed successfully.');
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
        // Initialize tabs using the tabs.js module
        if (window.setupTabs) {
            window.setupTabs();
            window.structuredLogger.info('MAIN', 'Tabs system initialized');
        } else {
            setupTabs(); // fallback to local implementation
        }
        
        // Initialize preview toggle functionality
        if (window.setupPreviewToggle) {
            window.setupPreviewToggle();
            window.structuredLogger.info('MAIN', 'Preview toggle initialized');
        }
        
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
 * ROOT FIX: Setup component library functionality
 */
function setupComponentLibrary() {
    // Ensure component data is available globally
    if (!window.gmkbComponentsData && (window.gmkbData || window.guestifyData)) {
        const data = window.gmkbData || window.guestifyData;
        window.gmkbComponentsData = data.components || [];
        window.structuredLogger.info('MAIN', 'Component data made globally available', { count: window.gmkbComponentsData.length });
    }
    
    // Initialize component library modal if it exists
    const componentLibrary = document.getElementById('component-library-overlay');
    if (componentLibrary && window.componentLibrarySystem) {
        if (typeof window.componentLibrarySystem.initialize === 'function') {
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
 * ROOT FIX: Handle save button clicks
 */
function handleSaveClick() {
    if (!window.enhancedStateManager) {
        console.warn('⚠️ GMKB: Cannot save - state manager not available');
        return;
    }
    
    try {
        const state = window.enhancedStateManager.getState();
        const postId = (window.guestifyData || window.gmkbData)?.postId;
        
        if (!postId) {
            console.warn('⚠️ GMKB: Cannot save - no post ID available');
            return;
        }
        
        // Use existing WordPress AJAX save mechanism
        const formData = new FormData();
        formData.append('action', 'guestify_save_media_kit');
        formData.append('nonce', (window.guestifyData || window.gmkbData)?.nonce);
        formData.append('post_id', postId);
        formData.append('state', JSON.stringify(state));
        
        fetch((window.guestifyData || window.gmkbData)?.ajaxUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ GMKB: State saved successfully');
                window.structuredLogger.info('MAIN', 'State saved successfully');
            } else {
                console.error('❌ GMKB: Save failed:', data.message);
                window.structuredLogger.error('MAIN', 'Save failed', data.message);
            }
        })
        .catch(error => {
            console.error('❌ GMKB: Save error:', error);
            window.structuredLogger.error('MAIN', 'Save error', error);
        });
        
    } catch (error) {
        console.error('❌ GMKB: Save handler error:', error);
        window.structuredLogger.error('MAIN', 'Save handler error', error);
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

// ROOT FIX: Expose minimal global API for testing
window.gmkbApp = {
    initialize: safeInitialization,
    forceReinitialize: async () => {
        isInitialized = false;
        isInitializing = false;
        console.log('🔄 GMKB: Force reinitializing...');
        await safeInitialization();
    },
    save: handleSaveClick,
    getState: () => window.enhancedStateManager?.getState(),
    addComponent: (type, props) => window.enhancedComponentManager?.addComponent(type, props),
    removeComponent: (id) => window.enhancedComponentManager?.removeComponent(id),
    isReady: () => !!(window.structuredLogger && window.enhancedStateManager && window.enhancedComponentManager),
    isInitialized: () => isInitialized,
    isInitializing: () => isInitializing,
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
