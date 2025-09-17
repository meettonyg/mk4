/**
 * @file main.js - Media Kit Builder (WordPress-Compatible Entry Point)
 * @description Simplified initialization with essential systems only
 * Phase 1: Clean baseline established
 */

// Force client-side rendering by removing obsolete server-render flags
(function() {
    'use strict';
    
    if (window.gmkbData && window.gmkbData.components) {
        window.gmkbData.components.forEach(comp => {
            comp.requiresServerRender = false;
            delete comp.serverTemplate;
            delete comp.phpRenderer;
            delete comp.needsServerData;
        });
        console.log('✅ Client-side rendering enabled for', window.gmkbData.components.length, 'components');
    }
    
    if (window.gmkbData && window.gmkbData.saved_components) {
        window.gmkbData.saved_components.forEach(saved => {
            delete saved.requiresServerRender;
            delete saved.serverRendered;
            delete saved.html;
            delete saved.rendered;
        });
    }
    
    if (window.gmkbData) {
        window.gmkbData.renderMode = 'client';
        window.gmkbData.serverSideRendering = false;
    }
})();

// WordPress data verification
(function verifyWordPressData() {
    'use strict';
    
    let retryCount = 0;
    const maxRetries = 10;
    
    function verifyDataAvailability() {
        if (window.gmkbData && window.gmkbData.components) {
            console.log('✅ WordPress data verified [' + window.gmkbData.components.length + ' components]');
            window.gmkbDataReady = true;
            
            if (window.enhancedStateManager && !window.enhancedStateManager.isInitialized) {
                if (window.structuredLogger) {
                    window.structuredLogger.info('STATE', 'Initializing state manager...');
                }
                
                if (window.enhancedStateManager.initializeAfterSystems) {
                    window.enhancedStateManager.initializeAfterSystems().then(() => {
                        if (window.structuredLogger) {
                            window.structuredLogger.info('STATE', 'State manager initialized');
                        }
                        dispatchReadyEvent();
                    }).catch(error => {
                        console.error('Failed to initialize state manager:', error);
                        dispatchReadyEvent();
                    });
                } else {
                    dispatchReadyEvent();
                }
            } else {
                dispatchReadyEvent();
            }
            
            return true;
        }
        
        retryCount++;
        if (retryCount <= maxRetries) {
            console.log('Waiting for WordPress data... (attempt ' + retryCount + '/' + maxRetries + ')');
            setTimeout(verifyDataAvailability, 100);
        } else {
            console.error('WordPress data not available after ' + maxRetries + ' attempts');
            document.dispatchEvent(new CustomEvent('gmkb:data-load-failed', {
                detail: { attempts: retryCount }
            }));
        }
        return false;
    }
    
    function dispatchReadyEvent() {
        setTimeout(function() {
            const gmkbReadyEvent = new CustomEvent('gmkb:ready', {
                detail: { 
                    componentCount: window.gmkbData.components.length,
                    stateInitialized: window.enhancedStateManager?.isInitialized || false
                }
            });
            document.dispatchEvent(gmkbReadyEvent);
            console.log('🚀 Ready event dispatched');
        }, 10);
    }
    
    verifyDataAvailability();
})();

// Component data exposure
function safeExposeComponentData() {
    try {
        if (!window.gmkbComponentsData && window.gmkbData) {
            const data = window.gmkbData;
            if (data && data.components) {
                if (Array.isArray(data.components)) {
                    window.gmkbComponentsData = data.components;
                } else if (typeof data.components === 'object') {
                    window.gmkbComponentsData = Object.values(data.components);
                }
                return true;
            }
        }
        
        if (!window.gmkbComponentsData) {
            window.gmkbComponentsData = [{
                type: 'hero',
                name: 'Hero Section',
                description: 'Essential header component',
                category: 'essential',
                premium: false,
                icon: 'fa-star'
            }];
            return true;
        }
    } catch (error) {
        console.error('Component data exposure error:', error);
        return false;
    }
    return false;
}

if (window.gmkbDataReady) {
    safeExposeComponentData();
} else {
    document.addEventListener('gmkb:ready', () => {
        safeExposeComponentData();
    });
}

// Main initialization
async function initializeWhenReady() {
    console.log('🚀 Starting initialization sequence');
    
    if (!window.structuredLogger) {
        console.warn('Structured logger not available, using console fallback');
        createFallbackLogger();
    }
    
    try {
        window.structuredLogger.info('MAIN', 'Starting application initialization');
        
        // Initialize state manager
        if (window.enhancedStateManager && !window.enhancedStateManager.isInitialized) {
            window.structuredLogger.info('STATE', 'State manager initialization check');
            
            if (!window.enhancedStateManager.isInitialized && window.enhancedStateManager.initializeAfterSystems) {
                await window.enhancedStateManager.initializeAfterSystems();
                window.structuredLogger.info('MAIN', 'State manager initialized');
            }
        }
        
        // Initialize component controls manager
        if (window.componentControlsManager) {
            if (!window.componentControlsManager.isInitialized && !window.componentControlsManager._isInitializing) {
                if (window.componentControlsManager.init) {
                    window.componentControlsManager._isInitializing = true;
                    window.componentControlsManager.init();
                    window.structuredLogger.info('MAIN', 'Component controls manager initialized');
                }
            }
        }
        
        // Initialize component manager
        if (window.enhancedComponentManager) {
            if (!window.enhancedComponentManager.isInitialized && !window.enhancedComponentManager._isInitializing) {
                if (window.enhancedComponentManager.initialize) {
                    window.enhancedComponentManager._isInitializing = true;
                    window.enhancedComponentManager.initialize();
                    window.structuredLogger.info('MAIN', 'Component manager initialized');
                }
            }
        }
        
        // Event-driven component controls initialization
        document.addEventListener('gmkb:component-manager-ready', () => {
            if (window.componentControlsManager && !window.componentControlsManager.isInitialized) {
                if (window.componentControlsManager.completeInitialization) {
                    window.componentControlsManager.completeInitialization();
                }
            }
        });
        
        // Initialize DOM render coordinator
        if (window.domRenderCoordinator) {
            if (!window.domRenderCoordinator.isInitialized && !window.domRenderCoordinator._isInitializing) {
                window.domRenderCoordinator._isInitializing = true;
                window.domRenderCoordinator.init();
                window.structuredLogger.info('MAIN', 'DOM render coordinator initialized');
            }
        }
        
        // Initialize component renderer
        if (window.enhancedComponentRenderer) {
            if (window.enhancedComponentRenderer.initWhenReady) {
                try {
                    window.enhancedComponentRenderer.initWhenReady();
                    window.structuredLogger.info('MAIN', 'Component renderer initialized');
                } catch (error) {
                    window.structuredLogger.warn('MAIN', 'Component renderer initialization failed', error);
                }
            }
        }
        
        // Initialize empty state handlers
        if (window.emptyStateHandlers && window.emptyStateHandlers.init) {
            if (!window.emptyStateHandlers.isInitialized && !window.emptyStateHandlers._isInitializing) {
                window.emptyStateHandlers._isInitializing = true;
                window.emptyStateHandlers.init();
                window.structuredLogger.info('MAIN', 'Empty state handlers initialized');
            }
        }
        
        setupBasicEventListeners();
        setupCoreUI();
        hideLoadingState();
        
        // Update GMKB systems references
        if (window.GMKB) {
            window.GMKB.systems.StateManager = window.enhancedStateManager;
            window.GMKB.systems.ComponentManager = window.enhancedComponentManager;
            window.GMKB.systems.ComponentRenderer = window.enhancedComponentRenderer;
            window.GMKB.systems.ComponentControlsManager = window.componentControlsManager;
        }
        
        // Emit application ready event
        document.dispatchEvent(new CustomEvent('gmkb:application-ready', {
            detail: {
                timestamp: Date.now(),
                simplified: true
            }
        }));
        
        window.structuredLogger.info('MAIN', 'Application initialization complete');
        
    } catch (error) {
        console.error('Initialization failed:', error);
        window.structuredLogger.error('MAIN', 'Initialization failed', error);
        initializeMinimalFallback();
    }
}

function hideLoadingState() {
    try {
        const loadingStates = [
            document.getElementById('loading-state'),
            document.getElementById('state-loading-enhanced'),
            document.querySelector('.loading-state'),
            document.querySelector('.gmkb-loading')
        ];
        
        loadingStates.forEach(element => {
            if (element) {
                element.style.display = 'none';
                element.classList.remove('show', 'active');
            }
        });
        
        const builderElements = [
            document.getElementById('media-kit-builder'),
            document.getElementById('media-kit-preview'),
            document.querySelector('.media-kit-builder')
        ];
        
        builderElements.forEach(element => {
            if (element) {
                element.style.display = 'block';
                element.classList.add('ready');
            }
        });
        
        document.body.classList.remove('gmkb-loading', 'loading', 'gmkb-initializing');
        document.body.classList.add('gmkb-ready');
        
        window.structuredLogger.info('MAIN', 'Loading state hidden');
        
    } catch (error) {
        window.structuredLogger.error('MAIN', 'Failed to hide loading state', error);
    }
}

function createFallbackLogger() {
    window.structuredLogger = {
        info: (category, message, data) => console.log(`[${category}] ${message}`, data || ''),
        debug: (category, message, data) => console.debug(`[${category}] ${message}`, data || ''),
        warn: (category, message, data) => console.warn(`[${category}] ${message}`, data || ''),
        error: (category, message, error, data) => console.error(`[${category}] ${message}`, error, data || '')
    };
    console.log('Fallback logger created');
}

function setupCoreUI() {
    try {
        if (window.setupTabs) {
            if (!window._tabsInitialized) {
                window.setupTabs();
                window._tabsInitialized = true;
                window.structuredLogger.info('MAIN', 'Tabs initialized');
            }
        }
        
        if (window.setupToolbar) {
            if (!window._toolbarInitialized) {
                window.setupToolbar();
                window._toolbarInitialized = true;
                window.structuredLogger.info('MAIN', 'Toolbar initialized');
            }
        }
        
        if (window.formControls && window.formControls.setup) {
            if (!window.formControls.isInitialized && !window.formControls._isInitializing) {
                window.formControls._isInitializing = true;
                window.formControls.setup();
                window.structuredLogger.info('MAIN', 'Form controls initialized');
            }
        }
        
        setupModals();
        
        if (!window._componentLibraryInitialized) {
            setupComponentLibrary();
            window._componentLibraryInitialized = true;
        }
        
        if (!window._layoutHandlersInitialized) {
            setupLayoutHandlers();
            window._layoutHandlersInitialized = true;
        }
        
        window.structuredLogger.info('MAIN', 'Core UI setup complete');
        
    } catch (error) {
        window.structuredLogger.error('MAIN', 'Core UI setup failed', error);
    }
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.media-kit-tabs .tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    if (tabButtons.length === 0) {
        return;
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetPanel = button.dataset.tab;
            if (!targetPanel) return;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            button.classList.add('active');
            const panel = document.getElementById(targetPanel);
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
    
    window.structuredLogger.info('MAIN', 'Tabs initialized', { count: tabButtons.length });
}

function setupModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            
            const modalId = trigger.dataset.modal;
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.style.display = 'block';
                modal.classList.add('show');
                
                const closeBtn = modal.querySelector('.modal-close, .close-modal');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                        modal.classList.remove('show');
                    });
                }
                
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

function setupComponentLibrary() {
    if (!window.gmkbComponentsData && window.gmkbData) {
        const data = window.gmkbData;
        if (data && data.components) {
            if (Array.isArray(data.components)) {
                window.gmkbComponentsData = data.components;
            } else if (typeof data.components === 'object') {
                window.gmkbComponentsData = Object.values(data.components);
            } else {
                window.gmkbComponentsData = [];
            }
            window.structuredLogger.info('MAIN', 'Component data available', { count: window.gmkbComponentsData.length });
        }
    }
    
    window.structuredLogger.info('MAIN', 'Component library setup complete');
}

function setupLayoutHandlers() {
    const previewContainer = document.getElementById('media-kit-preview');
    if (previewContainer) {
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
        });
        
        window.structuredLogger.info('MAIN', 'Layout handlers initialized');
    }
}

function setupBasicEventListeners() {
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveClick);
        window.structuredLogger.info('MAIN', 'Save button listener attached');
    }
    
    window.structuredLogger.info('MAIN', 'Basic event listeners setup complete');
}

async function handleSaveClick() {
    if (!window.enhancedComponentManager) {
        console.warn('Cannot save - component manager not available');
        return;
    }
    
    try {
        window.structuredLogger?.info('MAIN', 'Manual save requested');
        
        const savedContainer = document.getElementById('saved-components-container');
        const hasComponents = window.enhancedStateManager ? 
            Object.keys(window.enhancedStateManager.getState().components || {}).length > 0 : false;
        
        await window.enhancedComponentManager.manualSave();
        
        if (hasComponents && savedContainer) {
            savedContainer.style.display = 'block';
            
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
        }
        
        window.structuredLogger?.info('MAIN', 'Save completed successfully');
        
        if (window.showToast) {
            window.showToast('Media kit saved successfully!', 'success', 3000);
        }
        
    } catch (error) {
        console.error('Save failed:', error);
        window.structuredLogger?.error('MAIN', 'Save failed', error);
        
        if (window.showToast) {
            window.showToast('Failed to save media kit. Please try again.', 'error', 5000);
        } else {
            alert('Failed to save media kit. Please try again.');
        }
    }
}

function initializeMinimalFallback() {
    console.log('Starting minimal fallback initialization');
    
    try {
        if (!window.structuredLogger) {
            createFallbackLogger();
        }
        
        setupBasicEventListeners();
        
        console.log('Minimal fallback initialization completed');
        window.structuredLogger.info('MAIN', 'Minimal fallback active');
        
    } catch (error) {
        console.error('Even minimal fallback failed:', error);
    }
}

// Main initialization wrapper
(function() {
'use strict';

let isInitializing = false;
let isInitialized = false;

async function safeInitialization() {
    if (isInitializing || isInitialized) {
        return;
    }
    
    isInitializing = true;
    
    try {
        await initializeWhenReady();
        isInitialized = true;
    } catch (error) {
        console.error('Safe initialization failed:', error);
    } finally {
        isInitializing = false;
    }
}

document.addEventListener('gmkb:ready', safeInitialization);

if (window.gmkbData && window.gmkbData.components && !isInitialized && !isInitializing) {
    console.log('Data already available, initializing immediately');
    safeInitialization();
}

// Global GMKB namespace
window.GMKB = {
    systems: {
        StateManager: window.enhancedStateManager,
        ComponentManager: window.enhancedComponentManager,
        ComponentRenderer: window.enhancedComponentRenderer,
        ComponentControlsManager: window.componentControlsManager
    },
    
    subscribe: function(event, callback) {
        document.addEventListener(event, callback);
    },
    
    dispatch: function(event, data) {
        document.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    
    initialize: safeInitialization,
    
    isReady: () => !!(window.gmkbDataReady && window.structuredLogger && window.enhancedStateManager && window.enhancedComponentManager),
    isDataReady: () => !!(window.gmkbDataReady && window.gmkbData && window.gmkbData.components),
    isInitialized: () => isInitialized,
    isInitializing: () => isInitializing,
    
    getComponentsData: () => window.gmkbComponentsData || [],
    
    version: '4.0.0',
    architecture: 'simplified-wordpress-compatible'
};

// Backwards compatibility
window.gmkbApp = {
    initialize: safeInitialization,
    save: handleSaveClick,
    manualSave: () => window.enhancedComponentManager?.manualSave(),
    getState: () => window.enhancedStateManager?.getState(),
    addComponent: (type, props) => window.enhancedComponentManager?.addComponent(type, props),
    removeComponent: (id) => window.enhancedComponentManager?.removeComponent(id),
    isReady: () => window.GMKB.isReady(),
    isInitialized: () => window.GMKB.isInitialized(),
    isInitializing: () => window.GMKB.isInitializing()
};

})();

console.log('✅ Media Kit Builder main.js loaded and ready');
