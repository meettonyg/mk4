/**
 * @file toolbar.js
 * @description Simple toolbar functionality for device preview toggle and basic button interactions
 * ROOT FIX: WordPress-compatible global namespace approach, no ES6 modules
 */

/**
 * ROOT FIX: Setup toolbar functionality with initialization guard to prevent race conditions
 */
function setupToolbar() {
    // ROOT CAUSE FIX: Prevent duplicate toolbar initialization that causes the horizontal layout issue
    if (window._toolbarInitialized) {
        console.log('🚷 TOOLBAR: Toolbar already initialized, skipping duplicate setup');
        return;
    }
    
    console.log('🔧 TOOLBAR: Setting up toolbar functionality...');
    
    // ROOT CAUSE FIX: Mark as initialized IMMEDIATELY to prevent race conditions
    window._toolbarInitialized = true;
    
    // ROOT CAUSE FIX: Immediate layout protection before any other setup
    // Ensure media-kit container maintains vertical layout from the start
    const mediaKit = document.querySelector('.media-kit');
    if (mediaKit) {
        mediaKit.style.display = 'flex';
        mediaKit.style.flexDirection = 'column';
        mediaKit.style.width = '100%';
        console.log('✅ TOOLBAR: Protected media-kit vertical layout during toolbar setup');
    }
    
    // ROOT FIX: Initialize immediately instead of using setTimeout to prevent race conditions
    // Setup device preview toggle
    setupDevicePreviewToggle();
    
    // Setup basic button click handlers
    setupBasicButtonHandlers();
    
    // ROOT FIX: Setup close handlers for any existing modals
    setupExistingModalHandlers();
    
    console.log('✅ TOOLBAR: Toolbar setup complete');
}

function setupDevicePreviewToggle() {
    if (window._devicePreviewInitialized) {
        return;
    }
    window._devicePreviewInitialized = true;
    
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
    
    // Ensure media-kit stays vertical
    const mediaKit = previewContainer?.querySelector('.media-kit');
    if (mediaKit) {
        mediaKit.style.display = 'flex';
        mediaKit.style.flexDirection = 'column';
        mediaKit.style.width = '100%';
    }
    
    // ROOT CAUSE FIX: Simplified default mode application that doesn't touch media-kit layout
    const activeButton = document.querySelector('.toolbar__preview-btn--active') || previewButtons[0];
    if (activeButton) {
        const defaultMode = activeButton.getAttribute('data-preview') || 'desktop';
        console.log(`📱 TOOLBAR: Applying default preview mode: ${defaultMode}`);
        
        // Set the active button class correctly
        previewButtons.forEach(btn => btn.classList.remove('toolbar__preview-btn--active'));
        activeButton.classList.add('toolbar__preview-btn--active');
        
        // ROOT CAUSE FIX: Only apply preview classes to container, NOT media-kit
        previewContainer.classList.remove('preview--desktop', 'preview--tablet', 'preview--mobile');
        previewContainer.classList.add('preview--' + defaultMode);
        previewContainer.setAttribute('data-preview-mode', defaultMode);
        
        console.log(`✅ TOOLBAR: Applied default preview mode: ${defaultMode}`);
    } else {
        console.warn('⚠️ TOOLBAR: No active or default preview button found - applying desktop as fallback');
        // Fallback to desktop mode - only touch container, not media-kit
        previewContainer.classList.remove('preview--desktop', 'preview--tablet', 'preview--mobile');
        previewContainer.classList.add('preview--desktop');
        previewContainer.setAttribute('data-preview-mode', 'desktop');
        
        if (previewButtons[0]) {
            previewButtons[0].classList.add('toolbar__preview-btn--active');
        }
    }
    
    previewButtons.forEach(button => {
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
            
            // Maintain vertical layout
            const mediaKit = previewContainer?.querySelector('.media-kit');
            if (mediaKit) {
                mediaKit.style.display = 'flex';
                mediaKit.style.flexDirection = 'column';
                mediaKit.style.width = '100%';
            }
            
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
 * ROOT FIX: Setup close handlers for any existing modals in the DOM
 */
function setupExistingModalHandlers() {
    console.log('🔍 TOOLBAR: Looking for existing modals to setup close handlers...');
    
    // Common modal selectors
    const modalSelectors = [
        '#global-settings-modal',
        '#export-modal',
        '#component-library-overlay',
        '#template-library-modal',
        '.modal-overlay',
        '.library-modal',
        '[id*="modal"]',
        '[class*="modal"]'
    ];
    
    const foundModals = [];
    
    modalSelectors.forEach(selector => {
        const modals = document.querySelectorAll(selector);
        modals.forEach(modal => {
            if (!foundModals.includes(modal)) {
                foundModals.push(modal);
                console.log('🎯 TOOLBAR: Found existing modal:', modal.id || modal.className);
            }
        });
    });
    
    // Setup close handlers for all found modals
    foundModals.forEach(modal => {
        setupModalCloseHandlers(modal);
    });
    
    console.log(`✅ TOOLBAR: Setup close handlers for ${foundModals.length} existing modals`);
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

// ROOT CAUSE FIX: Global debug function to check media-kit layout status
window.debugMediaKitLayout = function() {
    console.group('🔧 Media Kit Layout Debug');
    
    const mediaKit = document.querySelector('.media-kit');
    if (!mediaKit) {
        console.error('❌ Media kit container not found');
        console.groupEnd();
        return;
    }
    
    const computedStyle = window.getComputedStyle(mediaKit);
    const inlineStyles = {
        display: mediaKit.style.display,
        flexDirection: mediaKit.style.flexDirection,
        width: mediaKit.style.width
    };
    
    console.log('✅ Media kit container found');
    console.log('📊 Computed styles:', {
        display: computedStyle.display,
        flexDirection: computedStyle.flexDirection,
        width: computedStyle.width,
        alignItems: computedStyle.alignItems,
        justifyContent: computedStyle.justifyContent
    });
    console.log('🎨 Inline styles:', inlineStyles);
    console.log('📋 Classes:', mediaKit.className);
    console.log('🔍 Layout Status:', {
        isVertical: computedStyle.flexDirection === 'column',
        isFlex: computedStyle.display === 'flex',
        hasLayoutProtection: mediaKit.classList.contains('layout-protected')
    });
    
    // Check for any horizontal indicators
    const horizontalIndicators = [];
    if (computedStyle.flexDirection === 'row') horizontalIndicators.push('flex-direction: row');
    if (computedStyle.display !== 'flex') horizontalIndicators.push('display: ' + computedStyle.display);
    if (mediaKit.classList.contains('horizontal')) horizontalIndicators.push('horizontal class');
    
    if (horizontalIndicators.length > 0) {
        console.warn('⚠️ HORIZONTAL LAYOUT DETECTED:', horizontalIndicators);
        console.log('🔧 Running automatic fix...');
        if (window.fixMediaKitLayout) {
            window.fixMediaKitLayout();
        }
    } else {
        console.log('✅ Layout is correctly vertical');
    }
    
    console.groupEnd();
};

// ROOT CAUSE FIX: Auto-check layout every 5 seconds if in debug mode
if (window.gmkbData && window.gmkbData.debugMode) {
    setInterval(() => {
        const mediaKit = document.querySelector('.media-kit');
        if (mediaKit) {
            const computedStyle = window.getComputedStyle(mediaKit);
            if (computedStyle.flexDirection !== 'column') {
                console.warn('🚨 LAYOUT DRIFT DETECTED - Media kit is not vertical!');
                window.debugMediaKitLayout();
            }
        }
    }, 5000);
}

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

// ROOT CAUSE FIX: Layout protection mechanism - runs after page load
// This ensures the media-kit always maintains vertical layout regardless of initialization order
function protectMediaKitLayout() {
    const mediaKit = document.querySelector('.media-kit');
    if (mediaKit) {
        // Force vertical layout
        mediaKit.style.display = 'flex';
        mediaKit.style.flexDirection = 'column';
        mediaKit.style.width = '100%';
        
        // Add a class to indicate protection is active
        mediaKit.classList.add('layout-protected');
        
        console.log('✅ TOOLBAR: Media-kit layout protection applied');
        
        // Set up a mutation observer to prevent any CSS overrides
        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const target = mutation.target;
                        if (target.classList.contains('media-kit')) {
                            // Re-enforce layout if something tries to change it
                            const currentDisplay = target.style.display;
                            const currentDirection = target.style.flexDirection;
                            const currentWidth = target.style.width;
                            
                            if (currentDisplay !== 'flex' || currentDirection !== 'column' || currentWidth !== '100%') {
                                target.style.display = 'flex';
                                target.style.flexDirection = 'column';
                                target.style.width = '100%';
                                console.warn('⚠️ TOOLBAR: Media-kit layout was changed, re-enforcing vertical layout');
                            }
                        }
                    }
                });
            });
            
            observer.observe(mediaKit, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
            
            console.log('✅ TOOLBAR: Layout protection observer active');
        }
    }
}

// Run layout protection when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', protectMediaKitLayout);
} else {
    protectMediaKitLayout();
}

// Also run after a short delay to catch any late modifications
setTimeout(protectMediaKitLayout, 1000);

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

// ROOT CAUSE FIX: Debug utility to manually fix media-kit layout
window.fixMediaKitLayout = function() {
    console.group('🔧 Media Kit Layout Fix');
    
    const mediaKit = document.querySelector('.media-kit');
    if (!mediaKit) {
        console.error('❌ Media kit container not found');
        console.groupEnd();
        return false;
    }
    
    console.log('✅ Media kit container found');
    console.log('Current styles:', {
        display: mediaKit.style.display,
        flexDirection: mediaKit.style.flexDirection,
        width: mediaKit.style.width,
        classes: mediaKit.className
    });
    
    // Force correct layout
    mediaKit.style.display = 'flex';
    mediaKit.style.flexDirection = 'column';
    mediaKit.style.width = '100%';
    mediaKit.classList.add('layout-protected');
    
    console.log('✅ Layout fixed - media kit should now display vertically');
    console.log('New styles:', {
        display: mediaKit.style.display,
        flexDirection: mediaKit.style.flexDirection,
        width: mediaKit.style.width,
        classes: mediaKit.className
    });
    
    // Also run the protection mechanism
    protectMediaKitLayout();
    
    console.groupEnd();
    return true;
};

// ROOT CAUSE FIX: Auto-run the layout fix on page load
window.addEventListener('load', function() {
    setTimeout(function() {
        console.log('🔍 TOOLBAR: Running final layout check after page load...');
        const mediaKit = document.querySelector('.media-kit');
        if (mediaKit) {
            const computedStyle = window.getComputedStyle(mediaKit);
            const isVertical = computedStyle.flexDirection === 'column' || computedStyle.flexDirection === 'column-reverse';
            
            if (!isVertical) {
                console.warn('⚠️ TOOLBAR: Media kit layout is not vertical after page load, fixing...');
                window.fixMediaKitLayout();
            } else {
                console.log('✅ TOOLBAR: Media kit layout is correctly vertical');
            }
        }
    }, 2000); // Run after 2 seconds to catch any late initialization
});


