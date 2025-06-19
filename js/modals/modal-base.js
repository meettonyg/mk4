/**
 * Base modal functionality
 */

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
        modal.style.display = 'flex';
        modal.classList.add('modal--open');
        // Ensure close handlers are set up
        setupModalCloseHandlers(modal);
        console.log('Modal shown:', modal.id || 'unknown');
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
        modal.style.display = 'none';
        modal.classList.remove('modal--open');
        console.log('Modal hidden:', modal.id || 'unknown');
    }
}

/**
 * Setup modal close events
 * @param {string} modalId - The ID of the modal
 * @param {string} closeButtonId - The ID of the close button
 */
export function setupModalClose(modalId, closeButtonId) {
    const modal = document.getElementById(modalId);
    const closeBtn = closeButtonId ? document.getElementById(closeButtonId) : null;

    if (closeBtn) {
        closeBtn.addEventListener('click', () => hideModal(modalId));
    }
    
    // Also look for any close button within the modal
    if (modal) {
        const modalCloseBtns = modal.querySelectorAll('.modal__close, [data-close-modal]');
        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                hideModal(modalId);
            });
        });
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(modalId);
            }
        });
    }
}

/**
 * Setup all close handlers for a modal element
 * @param {HTMLElement} modal - The modal element
 */
function setupModalCloseHandlers(modal) {
    if (!modal || modal.hasAttribute('data-close-handlers-setup')) return;
    
    modal.setAttribute('data-close-handlers-setup', 'true');
    
    // Find all close buttons within the modal
    const closeBtns = modal.querySelectorAll('.modal__close, [data-close-modal], .library__close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            modal.style.display = 'none';
            modal.classList.remove('modal--open');
        });
    });
    
    // Click outside to close (only on the overlay element itself)
    modal.addEventListener('click', function(e) {
        // Check if click is on the modal backdrop itself (not its children)
        if (e.target === this) {
            modal.style.display = 'none';
            modal.classList.remove('modal--open');
        }
    });
}

// Global initialization for all modals
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGlobalModalHandlers);
} else {
    initializeGlobalModalHandlers();
}

function initializeGlobalModalHandlers() {
    // ESC key closes any open modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Look for any visible modals with various class names
            const openModals = document.querySelectorAll(
                '.modal-overlay[style*="flex"], .modal-overlay[style*="block"], ' +
                '.library-modal[style*="flex"], .library-modal[style*="block"], ' +
                '.modal[style*="flex"], .modal[style*="block"], ' +
                '.modal--open'
            );
            openModals.forEach(modal => {
                modal.style.display = 'none';
                modal.classList.remove('modal--open');
            });
        }
    });
    
    // Global click handler for dynamically created modals
    document.addEventListener('click', (e) => {
        // Handle close button clicks
        if (e.target.matches('.modal__close, [data-close-modal], .library__close')) {
            e.preventDefault();
            e.stopPropagation();
            const modal = e.target.closest('.modal-overlay, .library-modal, .modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('modal--open');
            }
        }
    }, true);
}
