/**
 * Base modal functionality
 */

/**
 * Show a modal
 * @param {string} modalId - The ID of the modal to show
 */
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        // Ensure close handlers are set up
        setupModalCloseHandlers(modal);
    }
}

/**
 * Hide a modal
 * @param {string} modalId - The ID of the modal to hide
 */
export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
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
    const closeBtns = modal.querySelectorAll('.modal__close, [data-close-modal]');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            modal.style.display = 'none';
        });
    });
    
    // Click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            modal.style.display = 'none';
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
            const openModals = document.querySelectorAll('.modal-overlay[style*="flex"], .modal-overlay[style*="block"]');
            openModals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
    
    // Global click handler for dynamically created modals
    document.addEventListener('click', (e) => {
        // Handle close button clicks
        if (e.target.matches('.modal__close, [data-close-modal]')) {
            e.preventDefault();
            e.stopPropagation();
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    }, true);
}
