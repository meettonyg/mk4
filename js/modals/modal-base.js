/**
 * Base modal functionality - FIXED VERSION
 * 
 * This version resolves the event handler conflicts that were causing
 * the modal closing functionality to fail in diagnostic tests.
 */

// Track active modals for ESC key handling
let activeModals = new Set();

/**
 * Show a modal
 * @param {string|HTMLElement} modalIdOrElement - The ID of the modal or the modal element itself
 */
export function showModal(modalIdOrElement) {
    let modal;
    if (typeof modalIdOrElement === 'string') {
        modal = document.getElementById(modalIdOrElement);
    } else if (modalIdOrElement instanceof HTMLElement) {
        modal = modalIdOrElement;
    }
    
    if (modal) {
        // Show the modal
        modal.style.display = 'flex';
        modal.classList.add('modal--open');
        
        // Set up close handlers if not already done
        setupModalCloseHandlers(modal);
        
        console.log('Modal shown:', modal.id || 'unknown');
        
        // Add to active modals tracking for ESC key handling
        activeModals.add(modal);
        console.log('Modal added to active set. Total active:', activeModals.size);
        
        // Focus management for accessibility
        const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
    } else {
        console.error('Modal not found:', modalIdOrElement);
    }
}

/**
 * Hide a modal
 * @param {string|HTMLElement} modalIdOrElement - The ID of the modal or the modal element itself
 */
export function hideModal(modalIdOrElement) {
    let modal;
    if (typeof modalIdOrElement === 'string') {
        modal = document.getElementById(modalIdOrElement);
    } else if (modalIdOrElement instanceof HTMLElement) {
        modal = modalIdOrElement;
    }
    
    if (modal) {
        // Hide the modal
        modal.style.display = 'none';
        modal.classList.remove('modal--open');
        
        console.log('Modal hidden:', modal.id || 'unknown');
        
        // Remove from active modals tracking
        activeModals.delete(modal);
        console.log('Modal removed from active set. Total active:', activeModals.size);
        
        // Return focus to the element that opened the modal if available
        const opener = modal.dataset.openedBy;
        if (opener) {
            const openerElement = document.getElementById(opener);
            if (openerElement) {
                openerElement.focus();
            }
            delete modal.dataset.openedBy;
        }
    } else {
        console.error('Modal not found for hiding:', modalIdOrElement);
    }
}

/**
 * Setup modal close events - LEGACY COMPATIBILITY
 * This function is kept for backward compatibility but now uses the improved close handler system
 * @param {string} modalId - The ID of the modal
 * @param {string} closeButtonId - The ID of the close button
 */
export function setupModalClose(modalId, closeButtonId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        setupModalCloseHandlers(modal);
        console.log('Legacy setupModalClose called for:', modalId);
    }
}

/**
 * Setup all close handlers for a modal element - IMPROVED VERSION
 * This is the main function that sets up all close functionality
 * @param {HTMLElement} modal - The modal element
 */
function setupModalCloseHandlers(modal) {
    if (!modal) {
        console.error('setupModalCloseHandlers: modal element is null');
        return;
    }
    
    // Prevent duplicate setup
    if (modal.hasAttribute('data-close-handlers-setup')) {
        console.log('Close handlers already setup for modal:', modal.id);
        return;
    }
    
    console.log('Setting up close handlers for modal:', modal.id);
    
    // Mark as setup to prevent duplicates
    modal.setAttribute('data-close-handlers-setup', 'true');
    
    // 1. CLOSE BUTTON HANDLERS
    // Find all possible close buttons with various selectors
    const closeSelectors = [
        '.modal__close',
        '.library__close', 
        '[data-close-modal]',
        '.close-modal',
        '.btn-close',
        '[aria-label*="close" i]',
        '[title*="close" i]'
    ];
    
    closeSelectors.forEach(selector => {
        const closeBtns = modal.querySelectorAll(selector);
        closeBtns.forEach(btn => {
            // Remove any existing listeners to prevent duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add the close handler
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked:', selector, 'for modal:', modal.id);
                hideModal(modal);
            });
        });
    });
    
    // 2. BACKDROP CLICK HANDLER
    // Click outside modal to close (only on the modal overlay itself)
    const backdropHandler = function(e) {
        // Only close if clicking directly on the modal overlay (not its children)
        if (e.target === modal) {
            console.log('Backdrop clicked for modal:', modal.id);
            hideModal(modal);
        }
    };
    
    // Remove existing backdrop listener if any
    modal.removeEventListener('click', backdropHandler);
    modal.addEventListener('click', backdropHandler);
    
    console.log('Close handlers setup complete for modal:', modal.id);
}

// Global initialization for all modals
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGlobalModalHandlers);
} else {
    initializeGlobalModalHandlers();
}

/**
 * Global initialization for all modals - IMPROVED VERSION
 */
function initializeGlobalModalHandlers() {
    console.log('Initializing global modal handlers');
    
    // ESC key closes the topmost modal - ENHANCED VERSION
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
            console.log('ESC key detected, active modals:', activeModals.size);
            
            if (activeModals.size > 0) {
                // Get the last modal that was opened (topmost)
                const modalsArray = Array.from(activeModals);
                const topmostModal = modalsArray[modalsArray.length - 1];
                
                if (topmostModal && (topmostModal.offsetParent !== null || topmostModal.classList.contains('modal--open'))) {
                    console.log('ESC key pressed, closing modal:', topmostModal.id);
                    e.preventDefault();
                    e.stopPropagation();
                    hideModal(topmostModal);
                } else {
                    console.log('ESC key pressed but modal not visible:', topmostModal?.id);
                }
            } else {
                console.log('ESC key pressed but no active modals');
            }
        }
    }, true);
    
    // Global click handler for dynamically created close buttons
    document.addEventListener('click', (e) => {
        // Handle close button clicks that might not have been set up yet
        if (e.target.matches('.modal__close, [data-close-modal], .library__close, .close-modal, .btn-close')) {
            e.preventDefault();
            e.stopPropagation();
            const modal = e.target.closest('.modal-overlay, .library-modal, .modal, [id*="modal"], [id*="overlay"]');
            if (modal) {
                console.log('Global close button handler triggered for modal:', modal.id);
                hideModal(modal);
            }
        }
    }, true);
    
    console.log('Global modal handlers initialized');
}

/**
 * DEBUG: Get active modals count for testing
 * @returns {number} Number of currently active modals
 */
export function getActiveModalsCount() {
    return activeModals.size;
}

/**
 * DEBUG: Get active modals array for testing
 * @returns {Array} Array of active modal elements
 */
export function getActiveModals() {
    return Array.from(activeModals);
}

/**
 * DEBUG: Force clear all active modals (for testing)
 */
export function clearActiveModals() {
    console.log('DEBUG: Clearing all active modals');
    activeModals.clear();
}

// Expose debug functions globally for testing
if (typeof window !== 'undefined') {
    window.modalDebug = {
        getActiveModalsCount,
        getActiveModals,
        clearActiveModals,
        showModal,
        hideModal
    };
}
