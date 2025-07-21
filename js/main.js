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

// ROOT FIX: Simplified initialization with essential systems only
function initializeWhenReady() {
    console.log('🚀 GMKB: Starting simplified initialization sequence');
    
    // ROOT FIX: Ensure essential dependencies are available
    if (!window.structuredLogger) {
        console.warn('⚠️ GMKB: Structured logger not available, using console fallback');
        createFallbackLogger();
    }
    
    if (!window.enhancedStateManager) {
        console.warn('⚠️ GMKB: Enhanced state manager not available');
        return;
    }
    
    if (!window.enhancedComponentManager) {
        console.warn('⚠️ GMKB: Enhanced component manager not available');
        return;
    }
    
    if (!window.GMKB_Modals) {
        console.warn('⚠️ GMKB: Modal system not available');
        return;
    }
    
    try {
        // ROOT FIX: Initialize only essential systems
        window.structuredLogger.info('MAIN', 'Starting simplified application initialization');
        
        // 1. Initialize state manager
        if (window.enhancedStateManager.initializeAfterSystems) {
            window.enhancedStateManager.initializeAfterSystems();
            window.structuredLogger.info('MAIN', 'State manager initialized');
        }
        
        // 2. Initialize component manager
        if (window.enhancedComponentManager.initialize) {
            window.enhancedComponentManager.initialize();
            window.structuredLogger.info('MAIN', 'Component manager initialized');
        }
        
        // 3. Initialize empty state handlers (already loaded)
        if (window.emptyStateHandlers && window.emptyStateHandlers.init) {
            window.emptyStateHandlers.init();
            window.structuredLogger.info('MAIN', 'Empty state handlers initialized');
        }
        
        // 4. Set up basic event listeners
        setupBasicEventListeners();
        
        // 5. Emit application ready event
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
            if (window.componentLibrarySystem && window.componentLibrarySystem.show) {
                window.componentLibrarySystem.show();
            } else if (window.GMKB_Modals) {
                window.GMKB_Modals.show('component-library-overlay');
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

// ROOT FIX: Simplified DOM ready handler
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhenReady);
} else {
    // DOM is already ready
    initializeWhenReady();
}

// ROOT FIX: Expose minimal global API for testing
window.gmkbApp = {
    initialize: initializeWhenReady,
    save: handleSaveClick,
    getState: () => window.enhancedStateManager?.getState(),
    addComponent: (type, props) => window.enhancedComponentManager?.addComponent(type, props),
    removeComponent: (id) => window.enhancedComponentManager?.removeComponent(id),
    isReady: () => !!(window.structuredLogger && window.enhancedStateManager && window.enhancedComponentManager && window.GMKB_Modals)
};

console.log('✅ GMKB: Simplified main application loaded and ready');
