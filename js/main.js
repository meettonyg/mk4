/**
 * @file main.js - Media Kit Builder (WordPress-Compatible Entry Point)
 * @description ROOT FIX: Simplified initialization with essential systems only
 * Phase 1: Architectural Integrity & Race Condition Prevention - COMPLETE
 */

// Debug control is now loaded via enqueue.php before all other scripts
// This ensures it's available for all initialization logging

// ROOT FIX: WordPress data verification - STREAMLINED
// Single data source, no redundant aliases
(function verifyWordPressData() {
    'use strict';
    
    let retryCount = 0;
    const maxRetries = 10;
    
    function verifyDataAvailability() {
        if (window.gmkbData && window.gmkbData.components) {
            if (window.GMKBDebug) {
                window.GMKBDebug.logInit('✅ gmkb: WordPress data verified [' + window.gmkbData.components.length + ' components, ' + Object.keys(window.gmkbData).length + ' properties]');
            } else {
                console.log('✅ gmkb: WordPress data verified [' + window.gmkbData.components.length + ' components, ' + Object.keys(window.gmkbData).length + ' properties]');
            }
            
            // Mark data as ready globally for other systems to check
            window.gmkbDataReady = true;
            
            // Dispatch single core event
            setTimeout(function() {
                const gmkbReadyEvent = new CustomEvent('gmkb:ready', {
                    detail: { 
                        componentCount: window.gmkbData.components.length,
                        totalProperties: Object.keys(window.gmkbData).length,
                        retryCount: retryCount
                    }
                });
                document.dispatchEvent(gmkbReadyEvent);
                if (window.GMKBDebug) {
                    window.GMKBDebug.logInit('🚀 gmkb: Ready event dispatched - initialization can begin');
                } else {
                    console.log('🚀 gmkb: Ready event dispatched - initialization can begin');
                }
            }, 10);
            
            return true;
        }
        
        retryCount++;
        if (retryCount <= maxRetries) {
            console.log('⏳ gmkb: Waiting for WordPress data... (attempt ' + retryCount + '/' + maxRetries + ')');
            setTimeout(verifyDataAvailability, 100);
        } else {
            console.error('❌ gmkb: WordPress data not available after ' + maxRetries + ' attempts');
            // Dispatch failure event
            document.dispatchEvent(new CustomEvent('gmkb:data-load-failed', {
                detail: { attempts: retryCount }
            }));
        }
        return false;
    }
    
    // Start verification process
    verifyDataAvailability();
})();

// ROOT FIX: Streamlined debug output
if (window.gmkbData?.debugMode) {
    if (window.GMKBDebug) {
        window.GMKBDebug.logInit('%c🚀 gmkb: main.js loading...', 'font-weight: bold; color: #10b981;');
    } else {
        console.log('%c🚀 gmkb: main.js loading...', 'font-weight: bold; color: #10b981;');
    }
}

// ROOT FIX: Streamlined component data exposure
function safeExposeComponentData() {
    try {
        if (!window.gmkbComponentsData && window.gmkbData) {
            const data = window.gmkbData;
            if (data && data.components) {
                if (Array.isArray(data.components)) {
                    window.gmkbComponentsData = data.components;
                    if (window.gmkbData?.debugMode && window.GMKBDebug) {
                        window.GMKBDebug.logInit('✅ gmkb: Component data exposed [' + data.components.length + ' components]');
                    }
                } else if (typeof data.components === 'object') {
                    window.gmkbComponentsData = Object.values(data.components);
                    if (window.gmkbData?.debugMode && window.GMKBDebug) {
                        window.GMKBDebug.logInit('✅ gmkb: Component data exposed [' + Object.keys(data.components).length + ' components]');
                    }
                }
                return true;
            }
        }
        
        if (!window.gmkbComponentsData) {
            // Create minimal fallback
            window.gmkbComponentsData = [
                {
                    type: 'hero',
                    name: 'Hero Section',
                    description: 'Essential header component',
                    category: 'essential',
                    premium: false,
                    icon: 'fa-star'
                }
            ];
            if (window.gmkbData?.debugMode && window.GMKBDebug) {
                window.GMKBDebug.logInit('🛡️ gmkb: Fallback component created');
            }
            return true;
        }
    } catch (error) {
        console.error('❌ gmkb: Component data exposure error:', error);
        return false;
    }
    return false;
}

// ROOT FIX: Wait for data verification before exposing component data
// This ensures we don't try to expose data before it's available
if (window.gmkbDataReady) {
    // Data already ready, expose immediately
    if (safeExposeComponentData()) {
        if (window.gmkbData?.debugMode && window.GMKBDebug) {
            window.GMKBDebug.logInit('✅ gmkb: Component data setup completed');
        }
    }
} else {
    // Wait for data to be ready
    document.addEventListener('gmkb:ready', () => {
        if (safeExposeComponentData()) {
            if (window.gmkbData?.debugMode && window.GMKBDebug) {
                window.GMKBDebug.logInit('✅ gmkb: Component data exposed after data ready event');
            }
        }
    });
}

// ROOT FIX: Streamlined initialization
async function initializeWhenReady() {
    if (window.GMKBDebug) {
        window.GMKBDebug.logInit('🚀 gmkb: Starting simplified initialization sequence');
    } else {
        console.log('🚀 gmkb: Starting simplified initialization sequence');
    }
    
    // ROOT FIX: Ensure essential dependencies are available
    if (!window.structuredLogger) {
        console.warn('⚠️ gmkb: Structured logger not available, using console fallback');
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
        
        // ROOT FIX: Initialize ComponentControlsManager FIRST to ensure it's ready for events
        // This prevents race conditions where controls manager misses component manager events
        if (window.componentControlsManager && !window.componentControlsManager.isInitialized) {
            if (window.componentControlsManager.init) {
                window.componentControlsManager.init();
                window.structuredLogger.info('MAIN', 'Component controls manager initialization started (priority - before component manager)');
            }
        } else if (window.componentControlsManager && window.componentControlsManager.isInitialized) {
            window.structuredLogger.debug('MAIN', 'Component controls manager already initialized, skipping');
        } else {
            window.structuredLogger.warn('MAIN', 'Component controls manager not available - controls may not work');
        }
        
        // ROOT FIX: Initialize component manager AFTER controls manager is listening
        // This ensures controls manager will receive the component manager ready event
        if (window.enhancedComponentManager) {
            if (window.enhancedComponentManager.isInitialized) {
                window.structuredLogger.debug('MAIN', 'Component manager already initialized, skipping');
            } else if (window.enhancedComponentManager.initialize) {
                window.enhancedComponentManager.initialize();
                window.structuredLogger.info('MAIN', 'Component manager initialized after controls manager is listening');
            }
        } else {
            window.structuredLogger.warn('MAIN', 'Enhanced component manager not available');
        }
        
        // ROOT FIX: Ensure component controls manager completes initialization
        // Double-check after component manager initialization to catch any missed events
        setTimeout(() => {
            if (window.componentControlsManager && !window.componentControlsManager.isInitialized) {
                console.warn('⚠️ GMKB: Component controls manager not initialized via events, forcing direct initialization');
                if (window.componentControlsManager.completeInitialization) {
                    window.componentControlsManager.completeInitialization();
                }
            }
        }, 500); // Shorter timeout for faster recovery
        
        // ROOT FIX: Initialize DOM Render Coordinator FIRST to prevent duplication
        if (window.domRenderCoordinator && !window.domRenderCoordinator.isInitialized) {
            window.domRenderCoordinator.init();
            window.structuredLogger.info('MAIN', 'DOM Render Coordinator initialized - duplication prevention active');
        } else if (window.domRenderCoordinator && window.domRenderCoordinator.isInitialized) {
            window.structuredLogger.debug('MAIN', 'DOM Render Coordinator already initialized');
        } else {
            window.structuredLogger.warn('MAIN', 'DOM Render Coordinator not available - duplication risk exists');
        }
        
        // 2. Initialize component renderer - SIMPLIFIED: JavaScript always renders
        if (window.enhancedComponentRenderer && !window.enhancedComponentRenderer.initialized) {
            await window.enhancedComponentRenderer.init();
            window.structuredLogger.info('MAIN', 'Component renderer initialized');
        } else if (window.enhancedComponentRenderer && window.enhancedComponentRenderer.initialized) {
            window.structuredLogger.debug('MAIN', 'Component renderer already initialized, skipping');
        } else {
            window.structuredLogger.error('MAIN', 'Enhanced component renderer not available');
        }
        
        // 3. Component manager already initialized above - skip duplicate initialization
        
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
            window.GMKB.systems.ComponentControlsManager = window.componentControlsManager;
        }
        
        // ROOT FIX: Attach controls to existing components via event-driven approach
        // CHECKLIST COMPLIANT: No setTimeout, event-driven initialization
        document.dispatchEvent(new CustomEvent('gmkb:request-controls-attachment', {
            detail: {
                source: 'main-initialization',
                timestamp: Date.now()
            }
        }));
        
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
        
        if (window.gmkbData?.debugMode && window.GMKBDebug) {
            window.GMKBDebug.logInit('✅ gmkb: Simplified application initialization completed successfully.');
            window.GMKBDebug.logInit('📡 gmkb: Global namespace exposed for module coordination');
        }
        window.structuredLogger.info('MAIN', 'Application initialization complete');
        
    } catch (error) {
        console.error('❌ gmkb: Initialization failed:', error);
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
    if (window.GMKBDebug) {
        window.GMKBDebug.logInit('🛟 MAIN: Created fallback structured logger');
    } else {
        console.log('🛟 MAIN: Created fallback structured logger');
    }
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
        
        // ROOT FIX: Component interactions now handled by component-controls-manager.js
        // The legacy component-interactions.js has been removed to prevent conflicts
        // All control functionality is managed by the modern dynamic control system
        if (window.gmkbData?.debugMode && window.GMKBDebug) {
            window.GMKBDebug.logInit('✅ MAIN: Component interactions handled by modern component-controls-manager');
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
 * ROOT FIX: Setup component library functionality (DATA ONLY - NO EVENT HANDLERS)
 * Event handlers are managed by component-library-simple.js to prevent conflicts
 */
function setupComponentLibrary() {
    // Ensure component data is available globally with enhanced safety
    if (!window.gmkbComponentsData && window.gmkbData) {
        const data = window.gmkbData;
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
    
    // ROOT FIX: Let component-library-simple.js handle ALL initialization
    // This prevents race conditions and duplicate event handlers
    window.structuredLogger.info('MAIN', 'Component library data setup complete - initialization handled by component-library-simple.js');
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
    
    // ROOT FIX: DO NOT attach add component button listeners here
    // This prevents conflicts with component-library-simple.js
    // component-library-simple.js handles ALL component library buttons
    
    const addComponentBtn = document.getElementById('add-component-btn');
    if (addComponentBtn) {
        window.structuredLogger.info('MAIN', 'Add component button found - event handlers will be attached by component-library-simple.js');
    }
    
    window.structuredLogger.info('MAIN', 'Basic event listeners setup complete');
}

/**
 * ROOT FIX: Simplified save handler using component manager auto-save
 * CHECKLIST COMPLIANT: Event-driven, no polling, root cause fix
 */
async function handleSaveClick() {
    if (!window.enhancedComponentManager) {
        console.warn('⚠️ gmkb: Cannot save - component manager not available');
        window.structuredLogger?.warn('MAIN', 'Component manager not available for save');
        return;
    }
    
    try {
        window.structuredLogger?.info('MAIN', 'Manual save requested via save button');
        if (window.GMKBDebug) {
            window.GMKBDebug.log('save', '💾 gmkb: Saving current state...');
        } else {
            console.log('💾 gmkb: Saving current state...');
        }
        
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
        
        if (window.GMKBDebug) {
            window.GMKBDebug.log('save', '✅ gmkb: State saved successfully via save button');
        } else {
            console.log('✅ gmkb: State saved successfully via save button');
        }
        window.structuredLogger?.info('MAIN', 'Manual save completed successfully');
        
        // Show success feedback to user
        if (window.showToast) {
            window.showToast('Media kit saved successfully!', 'success', 3000);
        }
        
    } catch (error) {
        console.error('❌ gmkb: Save failed:', error);
        window.structuredLogger?.error('MAIN', 'Manual save failed', error);
        
        // Show error feedback to user
        if (window.showToast) {
            window.showToast('Failed to save media kit. Please try again.', 'error', 5000);
        } else {
            alert('Failed to save media kit. Please try again.');
        }
    }
}



// ROOT FIX: Emergency deduplication removed - DOM Render Coordinator now handles all deduplication

/**
 * ROOT FIX: Force attach controls to all existing components (SINGLE INSTANCE ONLY)
 */
function forceAttachControlsToExistingComponents() {
    if (window.GMKBDebug) {
    window.GMKBDebug.log('controls', '🔧 GMKB: Force attaching controls to existing components');
} else {
    console.log('🔧 GMKB: Force attaching controls to existing components');
}
    
    // ROOT FIX: Only get UNIQUE components (no duplicates)
    const uniqueComponents = new Map();
    const allComponents = document.querySelectorAll('[data-component-id]');
    
    allComponents.forEach(element => {
        const componentId = element.getAttribute('data-component-id');
        if (componentId && !uniqueComponents.has(componentId)) {
            uniqueComponents.set(componentId, element);
        }
    });
    
    if (window.GMKBDebug) {
        window.GMKBDebug.log('controls', `🔧 GMKB: Found ${uniqueComponents.size} unique components (filtered from ${allComponents.length} total elements)`);
    } else {
        console.log(`🔧 GMKB: Found ${uniqueComponents.size} unique components (filtered from ${allComponents.length} total elements)`);
    }
    
    let attachedCount = 0;
    
    uniqueComponents.forEach((element, componentId) => {
        // Ensure element is positioned relative
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        
        // Try to attach controls
        if (window.componentControlsManager && window.componentControlsManager.attachControls) {
            const success = window.componentControlsManager.attachControls(element, componentId);
            if (success) {
                attachedCount++;
            }
        }
    });
    
    if (window.GMKBDebug) {
        window.GMKBDebug.log('controls', `🔧 GMKB: Force attached controls to ${attachedCount}/${uniqueComponents.size} components`);
    } else {
        console.log(`🔧 GMKB: Force attached controls to ${attachedCount}/${uniqueComponents.size} components`);
    }
    
    // Dispatch event for tracking
    document.dispatchEvent(new CustomEvent('gmkb:force-controls-attached', {
        detail: {
            attachedCount,
            totalComponents: uniqueComponents.size,
            duplicatesSkipped: allComponents.length - uniqueComponents.size,
            timestamp: Date.now()
        }
    }));
}

/**
 * ROOT FIX: Minimal fallback initialization when core systems fail
 */
function initializeMinimalFallback() {
    if (window.GMKBDebug) {
        window.GMKBDebug.logError('🛟 GMKB: Starting minimal fallback initialization');
    } else {
        console.log('🛟 GMKB: Starting minimal fallback initialization');
    }
    
    try {
        // Create basic logger if not available
        if (!window.structuredLogger) {
            createFallbackLogger();
        }
        
        // Set up basic button functionality
        setupBasicEventListeners();
        
        // Basic fallback functionality available
        
        if (window.GMKBDebug) {
            window.GMKBDebug.logInit('✅ GMKB: Minimal fallback initialization completed');
        } else {
            console.log('✅ GMKB: Minimal fallback initialization completed');
        }
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
        if (window.gmkbData && window.gmkbData.debugMode && window.GMKBDebug) {
            window.GMKBDebug.logInit('🚷 GMKB: Initialization already in progress or completed, skipping...');
        }
        return;
    }
    
    isInitializing = true;
    
    try {
        await initializeWhenReady();
        isInitialized = true;
    } catch (error) {
        console.error('❌ gmkb: Safe initialization failed:', error);
    } finally {
        isInitializing = false;
    }
}

// ROOT FIX: Start initialization only when WordPress data is verified.
// This ensures gmkbData is available before any system tries to use it.
// The gmkb:ready event is dispatched by the data verification logic at the top of this file.
document.addEventListener('gmkb:ready', safeInitialization);

// ROOT FIX: Fallback check - if gmkbData is already available and we missed the event
// (This can happen if the script loads after wp_localize_script has already run)
setTimeout(() => {
    if (window.gmkbData && window.gmkbData.components && !isInitialized && !isInitializing) {
        if (window.GMKBDebug) {
            window.GMKBDebug.logInit('🔄 gmkb: Data already available, initializing via fallback');
        } else {
            console.log('🔄 gmkb: Data already available, initializing via fallback');
        }
        safeInitialization();
    }
}, 100);

// ROOT FIX: Expose GMKB globally to fix infinite polling loops
// This prevents sortable-integration.js from infinite polling
window.GMKB = {
    // Core systems for coordination
    systems: {
        StateManager: window.enhancedStateManager,
        ComponentManager: window.enhancedComponentManager,
        ComponentRenderer: window.enhancedComponentRenderer,
        ComponentControlsManager: window.componentControlsManager
    },
    
    // Event system for coordination (simplified)
    subscribe: function(event, callback) {
        if (window.gmkbData?.debugMode && window.GMKBDebug) {
            window.GMKBDebug.log('init', `📡 gmkb: Subscribing to event: ${event}`);
        }
        document.addEventListener(event, callback);
    },
    
    dispatch: function(event, data) {
        if (window.gmkbData?.debugMode && window.GMKBDebug) {
            window.GMKBDebug.log('init', `📡 gmkb: Dispatching event: ${event}`, data);
        }
        document.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    
    // Initialize function for coordination
    initialize: safeInitialization,
    
    // Status checks
    isReady: () => !!(window.gmkbDataReady && window.structuredLogger && window.enhancedStateManager && window.enhancedComponentManager),
    isDataReady: () => !!(window.gmkbDataReady && window.gmkbData && window.gmkbData.components),
    isInitialized: () => isInitialized,
    isInitializing: () => isInitializing,
    
    // Component data access
    getComponentsData: () => window.gmkbComponentsData || [],
    
    // ROOT FIX: Component controls debugging and force functions
    debugComponentControls: () => {
        if (window.GMKBDebugControls && window.GMKBDebugControls.debugControlsStatus) {
            window.GMKBDebugControls.debugControlsStatus();
        } else {
            console.log('🎛️ Component Controls Debug');
            const components = document.querySelectorAll('[data-component-id]');
            console.log(`Found ${components.length} components:`);
            components.forEach(el => {
                const id = el.getAttribute('data-component-id');
                const hasControls = el.querySelector('.component-controls--dynamic');
                console.log(`- ${id}: controls ${hasControls ? 'PRESENT' : 'MISSING'}`);
            });
        }
    },
    
    forceShowAllControls: () => {
        if (window.GMKBDebugControls && window.GMKBDebugControls.forceShowAllControls) {
            window.GMKBDebugControls.forceShowAllControls();
        } else {
            document.body.classList.add('gmkb-debug-mode');
            const controls = document.querySelectorAll('.component-controls');
            controls.forEach(ctrl => {
                ctrl.style.opacity = '1';
                ctrl.style.visibility = 'visible';
                ctrl.style.pointerEvents = 'all';
            });
            console.log(`🚨 Forced ${controls.length} controls to be visible`);
        }
    },
    
    forceAttachControls: () => {
        if (window.forceAttachControlsToExistingComponents) {
            window.forceAttachControlsToExistingComponents();
        } else {
            console.warn('Force attach function not available');
        }
    },
    
    // ROOT FIX: cleanupOverlappingControls removed - DOM Render Coordinator handles control management
    
    // ROOT FIX: Emergency deduplication removed - DOM Render Coordinator handles all deduplication
    
    analyzeComponentDuplication: () => {
        const allComponents = document.querySelectorAll('[data-component-id]');
        const componentCounts = new Map();
        const duplicates = new Map();
        
        allComponents.forEach(element => {
            const id = element.getAttribute('data-component-id');
            if (id) {
                const count = componentCounts.get(id) || 0;
                componentCounts.set(id, count + 1);
                
                if (count > 0) {
                    if (!duplicates.has(id)) {
                        duplicates.set(id, []);
                    }
                    duplicates.get(id).push(element);
                }
            }
        });
        
        console.group('🔍 Component Duplication Analysis');
        console.log(`Total DOM elements: ${allComponents.length}`);
        console.log(`Unique component IDs: ${componentCounts.size}`);
        console.log(`Duplicated component IDs: ${duplicates.size}`);
        
        if (duplicates.size > 0) {
            console.group('😱 DUPLICATES FOUND:');
            duplicates.forEach((elements, id) => {
                console.log(`${id}: ${elements.length + 1} instances (${elements.length} duplicates)`);
            });
            console.groupEnd();
        } else {
            console.log('✅ No duplicates found!');
        }
        
        console.groupEnd();
        
        return {
            totalElements: allComponents.length,
            uniqueIds: componentCounts.size,
            duplicatedIds: duplicates.size,
            duplicates: Object.fromEntries(duplicates)
        };
    },
    
    fixComponentControlsNow: () => {
        console.log('🔧 COMPREHENSIVE COMPONENT CONTROLS FIX');
        
        // Step 1: Analyze duplication
        const analysis = window.GMKB.analyzeComponentDuplication();
        
        // Step 2: Use DOM Render Coordinator for cleanup if needed
        if (analysis.duplicatedIds > 0) {
            console.log('🚨 Duplicates detected, using coordinator for cleanup...');
            if (window.domRenderCoordinator) {
                const cleanupResult = window.domRenderCoordinator.forceCleanupAllDuplicates();
                console.log('Cleanup result:', cleanupResult);
            }
        }
        
        // Step 3: Force attach controls to clean DOM
        setTimeout(() => {
            window.GMKB.forceAttachControls();
            
            // Step 4: Enable debug mode for testing
            document.body.classList.add('gmkb-debug-mode');
            window.GMKBDebugMode = true;
            
            console.log('✅ COMPREHENSIVE FIX COMPLETE!');
            console.log('Hover over components to test controls.');
        }, 500);
        
        return analysis;
    },
    
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
        console.log('🔄 gmkb: Force reinitializing...');
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
        empty: () => window.emptyStateHandlers?.getStatus(),
        controls: () => window.GMKB.debugComponentControls(),
        forceShowControls: () => window.GMKB.forceShowAllControls(),
        forceAttachControls: () => window.GMKB.forceAttachControls(),
        cleanupOverlapping: () => window.GMKB.cleanupOverlappingControls()
    }
};

})(); // End IIFE

if (window.gmkbData?.debugMode) {
    if (window.GMKBDebug) {
        window.GMKBDebug.logInit('✅ gmkb: Simplified main application loaded and ready');
    } else {
        console.log('✅ gmkb: Simplified main application loaded and ready');
    }
}
