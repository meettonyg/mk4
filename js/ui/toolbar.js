/**
 * @file toolbar.js
 * @description Simple toolbar functionality for device preview toggle and basic button interactions
 * ROOT FIX: WordPress-compatible global namespace approach, no ES6 modules
 */

/**
 * ROOT FIX: Setup toolbar functionality with initialization guard
 */
function setupToolbar() {
    // ROOT CAUSE FIX: Prevent duplicate initialization that causes the horizontal layout issue
    if (window._toolbarInitialized) {
        console.log('🚷 TOOLBAR: Toolbar already initialized, skipping duplicate setup');
        return;
    }
    
    console.log('🔧 TOOLBAR: Setting up toolbar functionality...');
    
    // Wait for DOM to be ready
    const initializeToolbar = () => {
        // ROOT CAUSE FIX: Mark as initialized BEFORE any setup to prevent race conditions
        window._toolbarInitialized = true;
        
        // Setup device preview toggle
        setupDevicePreviewToggle();
        
        // Setup basic button click handlers
        setupBasicButtonHandlers();
        
        // ROOT FIX: Setup close handlers for any existing modals
        setupExistingModalHandlers();
        
        console.log('✅ TOOLBAR: Toolbar setup complete');
    };
    
    // ROOT FIX: Initialize immediately to prevent race conditions
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeToolbar);
    } else {
        initializeToolbar();
    }
}

/**
 * ROOT FIX: Setup device preview toggle functionality with initialization guard
 */
function setupDevicePreviewToggle() {
    // ROOT CAUSE FIX: Prevent duplicate initialization that causes race conditions
    if (window._devicePreviewInitialized) {
        console.log('🚷 TOOLBAR: Device preview already initialized, skipping duplicate setup');
        return;
    }
    
    console.log('📱 TOOLBAR: Setting up device preview toggle...');
    
    const previewButtons = document.querySelectorAll('.toolbar__preview-btn');
    const previewContainer = document.getElementById('preview-container') || document.querySelector('.preview__container, .preview');
    
    if (previewButtons.length === 0) {
        console.warn('⚠️ TOOLBAR: No preview buttons found');
        return;
    }
    
    if (!previewContainer) {
        console.warn('⚠️ TOOLBAR: Preview container not found');
        return;
    }
    
    console.log(`🔍 TOOLBAR: Found ${previewButtons.length} preview buttons and preview container`);
    
    // ROOT CAUSE FIX: Mark as initialized BEFORE adding event listeners to prevent race conditions
    window._devicePreviewInitialized = true;
    
    previewButtons.forEach(button => {
        // ROOT CAUSE FIX: Check if event listener already exists to prevent duplicates
        if (button.hasAttribute('data-preview-listener-attached')) {
            return;
        }
        
        button.setAttribute('data-preview-listener-attached', 'true');
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const previewMode = button.getAttribute('data-preview');
            
            if (!previewMode) {
                console.warn('⚠️ TOOLBAR: Preview button missing data-preview attribute');
                return;
            }
            
            console.log(`📱 TOOLBAR: Switching to ${previewMode} preview mode`);
            
            // Remove active class from all buttons
            previewButtons.forEach(btn => {
                btn.classList.remove('toolbar__preview-btn--active');
            });
            
            // Add active class to clicked button
            button.classList.add('toolbar__preview-btn--active');
            
            // Remove all preview mode classes from container
            previewContainer.classList.remove('preview--desktop', 'preview--tablet', 'preview--mobile');
            
            // Add the selected preview mode class
            previewContainer.classList.add('preview--' + previewMode);
            
            // Update preview container data attribute for CSS targeting
            previewContainer.setAttribute('data-preview-mode', previewMode);
            
            // Emit event for other systems
            document.dispatchEvent(new CustomEvent('gmkb:preview-changed', {
                detail: {
                    mode: previewMode,
                    timestamp: Date.now()
                }
            }));
            
            // Visual feedback
            showPreviewFeedback(previewMode);
        });
    });
    
    console.log('✅ TOOLBAR: Device preview toggle setup complete');
}

/**
 * ROOT FIX: Show preview mode feedback
 * @param {string} mode - Preview mode (desktop, tablet, mobile)
 */
function showPreviewFeedback(mode) {
    const modeNames = {
        desktop: 'Desktop View',
        tablet: 'Tablet View', 
        mobile: 'Mobile View'
    };
    
    const modeName = modeNames[mode] || mode;
    
    // Simple console feedback for now
    console.log('✅ TOOLBAR: Preview mode changed to ' + modeName);
    
    // TODO: Add toast notification when toast system is available
}

/**
 * ROOT FIX: Setup basic button handlers for non-device buttons
 */
function setupBasicButtonHandlers() {
    console.log('🔘 TOOLBAR: Setting up basic button handlers...');
    
    // Save button (handled by main.js but we can add feedback)
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        // The actual save functionality is handled by main.js
        // This just provides visual feedback
        saveBtn.addEventListener('click', function() {
            console.log('💾 TOOLBAR: Save button clicked');
        });
        console.log('✅ TOOLBAR: Save button handler attached');
    }
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📤 TOOLBAR: Export button clicked');
            
            // Try to open export modal
            const exportModal = document.getElementById('export-modal');
            if (exportModal) {
                exportModal.style.display = 'flex';
                exportModal.classList.add('modal--open');
                console.log('✅ TOOLBAR: Export modal opened');
                
                // ROOT FIX: Immediately setup close handlers when modal opens
                setupModalCloseHandlers(exportModal);
            } else {
                console.warn('⚠️ TOOLBAR: Export modal not found');
            }
        });
        console.log('✅ TOOLBAR: Export button handler attached');
    }
    
    // Theme button
    const themeBtn = document.getElementById('global-theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🎨 TOOLBAR: Theme button clicked');
            
            // Try to open theme modal
            const themeModal = document.getElementById('global-settings-modal');
            if (themeModal) {
                themeModal.style.display = 'flex';
                themeModal.classList.add('modal--open');
                console.log('✅ TOOLBAR: Theme modal opened');
                
                // ROOT FIX: Immediately setup close handlers when modal opens
                setupModalCloseHandlers(themeModal);
            } else {
                console.warn('⚠️ TOOLBAR: Theme modal not found');
            }
        });
        console.log('✅ TOOLBAR: Theme button handler attached');
    }
    
    // Share button
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔗 TOOLBAR: Share button clicked');
            
            // Simple share functionality
            const url = window.location.href;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(function() {
                    console.log('✅ TOOLBAR: URL copied to clipboard');
                    // TODO: Show toast notification
                }).catch(function() {
                    console.warn('⚠️ TOOLBAR: Failed to copy to clipboard');
                });
            } else {
                console.warn('⚠️ TOOLBAR: Clipboard API not available');
            }
        });
        console.log('✅ TOOLBAR: Share button handler attached');
    }
    
    // Undo button
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
        undoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('↶ TOOLBAR: Undo button clicked');
            // TODO: Implement undo functionality
        });
        console.log('✅ TOOLBAR: Undo button handler attached');
    }
    
    // Redo button
    const redoBtn = document.getElementById('redo-btn');
    if (redoBtn) {
        redoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('↷ TOOLBAR: Redo button clicked');
            // TODO: Implement redo functionality
        });
        console.log('✅ TOOLBAR: Redo button handler attached');
    }
    
    console.log('✅ TOOLBAR: Basic button handlers setup complete');
}

/**
 * ROOT FIX: Setup close handlers for actual modals only (intelligent detection)
 */
function setupExistingModalHandlers() {
    console.log('🔍 TOOLBAR: Looking for actual modals (intelligent detection)...');
    
    // ROOT FIX: Specific known modal IDs only (no wildcards)
    const knownModalIds = [
        'global-settings-modal',
        'export-modal',
        'component-library-overlay',
        'template-library-modal'
    ];
    
    const foundModals = [];
    
    // ROOT FIX: Only check specific known modals
    knownModalIds.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && isActualModal(modal)) {
            foundModals.push(modal);
            console.log('🎯 TOOLBAR: Found valid modal:', modalId);
        }
    });
    
    // ROOT FIX: Additional check for any other legitimate modals
    // Use strict criteria to avoid false positives
    const potentialModals = document.querySelectorAll('.modal-overlay, .library-modal');
    potentialModals.forEach(modal => {
        if (isActualModal(modal) && !foundModals.includes(modal)) {
            foundModals.push(modal);
            console.log('🎯 TOOLBAR: Found additional modal:', modal.id || modal.className);
        }
    });
    
    // Setup close handlers for valid modals only
    foundModals.forEach(modal => {
        setupModalCloseHandlers(modal);
    });
    
    console.log(`✅ TOOLBAR: Setup close handlers for ${foundModals.length} actual modals (filtered from potential false positives)`);
}

/**
 * ROOT FIX: Intelligent modal detection to filter out false positives
 * @param {Element} element - Element to check
 * @returns {boolean} - True if element is actually a modal
 */
function isActualModal(element) {
    if (!element) return false;
    
    // ROOT FIX: Exclude script tags, style tags, and other non-modal elements
    if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE' || element.tagName === 'LINK') {
        return false;
    }
    
    // ROOT FIX: Exclude buttons and other interactive elements
    if (element.tagName === 'BUTTON' || element.tagName === 'INPUT' || element.tagName === 'A') {
        return false;
    }
    
    // ROOT FIX: Exclude elements that are too small to be modals
    if (element.offsetWidth < 100 || element.offsetHeight < 100) {
        return false;
    }
    
    // ROOT FIX: Must be a container element (div, section, article, etc.)
    const containerTags = ['DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'MAIN', 'DIALOG'];
    if (!containerTags.includes(element.tagName)) {
        return false;
    }
    
    // ROOT FIX: Should have modal-like characteristics
    const hasModalClass = element.classList.contains('modal') || 
                         element.classList.contains('modal-overlay') ||
                         element.classList.contains('library-modal') ||
                         element.id.endsWith('-modal') ||
                         element.id.includes('modal-') ||
                         element.id.includes('library');
    
    return hasModalClass;
}

/**
 * ROOT FIX: Setup modal close handlers for any modal
 */
function setupModalCloseHandlers(modal) {
    if (!modal || modal.hasAttribute('data-close-handlers-setup')) {
        return; // Already setup or invalid modal
    }
    
    console.log('🔧 TOOLBAR: Setting up close handlers for modal:', modal.id || modal.className);
    
    // Mark as setup to prevent duplicates
    modal.setAttribute('data-close-handlers-setup', 'true');
    
    // ROOT FIX: Enhanced close button detection with multiple selectors
    const closeBtnSelectors = [
        '.modal__close',
        '.library__close', 
        '[data-close-modal]',
        '.close-modal',
        '.modal-close',
        'button[title="Close"]',
        '.close-btn',
        '.btn-close'
    ];
    
    let closeBtn = null;
    for (const selector of closeBtnSelectors) {
        closeBtn = modal.querySelector(selector);
        if (closeBtn) {
            console.log('🎯 TOOLBAR: Found close button with selector:', selector);
            break;
        }
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚪 TOOLBAR: Close button clicked for modal:', modal.id);
            hideModal(modal);
        });
        console.log('✅ TOOLBAR: Close button handler attached');
    } else {
        console.warn('⚠️ TOOLBAR: No close button found in modal:', modal.id);
        // Log available buttons for debugging
        const allButtons = modal.querySelectorAll('button');
        console.log('Available buttons in modal:', Array.from(allButtons).map(btn => ({
            text: btn.textContent?.trim(),
            class: btn.className,
            id: btn.id,
            title: btn.title
        })));
    }
    
    // Backdrop click handler
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            console.log('🚪 TOOLBAR: Modal backdrop clicked for:', modal.id);
            hideModal(modal);
        }
    });
    
    // ESC key handler - ROOT FIX: More specific condition
    const escHandler = function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            console.log('🚪 TOOLBAR: ESC key pressed for modal:', modal.id);
            hideModal(modal);
        }
    };
    
    document.addEventListener('keydown', escHandler);
    
    // Store handler reference for cleanup
    modal._escHandler = escHandler;
    
    console.log('✅ TOOLBAR: Close handlers setup complete for modal:', modal.id);
}

/**
 * ROOT FIX: Hide modal properly
 */
function hideModal(modal) {
    if (!modal) return;
    
    console.log('🚪 TOOLBAR: Hiding modal:', modal.id);
    
    // ROOT FIX: Multiple hiding strategies
    modal.style.display = 'none';
    modal.classList.remove('modal--open', 'show');
    
    // Remove any inline styles that might keep it visible
    modal.style.visibility = '';
    modal.style.opacity = '';
    
    // Cleanup ESC handler if it exists
    if (modal._escHandler) {
        document.removeEventListener('keydown', modal._escHandler);
        delete modal._escHandler;
    }
    
    // Reset the setup flag so handlers can be re-attached if needed
    modal.removeAttribute('data-close-handlers-setup');
    
    console.log('✅ TOOLBAR: Modal hidden successfully:', modal.id);
    
    // Emit event for other systems
    document.dispatchEvent(new CustomEvent('gmkb:modal-closed', {
        detail: {
            modalId: modal.id,
            timestamp: Date.now()
        }
    }));
}

// ROOT FIX: Make toolbar system available globally instead of ES6 export
window.setupToolbar = setupToolbar;
window.setupDevicePreviewToggle = setupDevicePreviewToggle;
window.setupModalCloseHandlers = setupModalCloseHandlers;
window.setupExistingModalHandlers = setupExistingModalHandlers;
window.hideModal = hideModal;

// ROOT FIX: Global toolbar API for other scripts
window.GMKBToolbar = {
    setupToolbar: setupToolbar,
    setupDevicePreviewToggle: setupDevicePreviewToggle,
    setupModalCloseHandlers: setupModalCloseHandlers,
    setupExistingModalHandlers: setupExistingModalHandlers,
    hideModal: hideModal,
    
    // ROOT FIX: Utility function to manually close any modal
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            hideModal(modal);
            return true;
        }
        return false;
    },
    
    // ROOT FIX: Utility function to close all open modals
    closeAllModals: function() {
        const openModals = document.querySelectorAll('[style*="display: flex"], .modal--open, .show');
        openModals.forEach(modal => {
            if (modal.classList.contains('modal-overlay') || modal.id.includes('modal')) {
                hideModal(modal);
            }
        });
        console.log('🚪 TOOLBAR: Closed all open modals');
    }
};

console.log('✅ Toolbar System: Available globally and ready');

// ROOT FIX: Debug function to test modal close functionality
window.debugModalClose = function() {
    console.group('🔧 Modal Close Debug');
    
    const themeModal = document.getElementById('global-settings-modal');
    if (!themeModal) {
        console.error('❌ Global settings modal not found');
        console.groupEnd();
        return;
    }
    
    console.log('✅ Global settings modal found:', themeModal);
    console.log('Modal display style:', themeModal.style.display);
    console.log('Modal classes:', themeModal.className);
    
    // Check for close button
    const closeBtn = themeModal.querySelector('.modal__close');
    if (closeBtn) {
        console.log('✅ Close button found:', closeBtn);
        console.log('Close button text:', closeBtn.textContent);
        console.log('Close button id:', closeBtn.id);
        
        // Test click
        console.log('🧪 Testing close button click...');
        closeBtn.click();
    } else {
        console.error('❌ Close button not found');
        const allButtons = themeModal.querySelectorAll('button');
        console.log('Available buttons:', Array.from(allButtons).map(btn => ({
            text: btn.textContent?.trim(),
            class: btn.className,
            id: btn.id
        })));
    }
    
    console.groupEnd();
};

// ROOT FIX: Debug function to manually close the theme modal
window.closeThemeModal = function() {
    const modal = document.getElementById('global-settings-modal');
    if (modal) {
        hideModal(modal);
        console.log('✅ Theme modal closed manually');
        return true;
    }
    console.error('❌ Theme modal not found');
    return false;
};
