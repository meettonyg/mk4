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
    const closeBtn = document.getElementById(closeButtonId);

    if (closeBtn) {
        closeBtn.addEventListener('click', () => hideModal(modalId));
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(modalId);
            }
        });
    }
}
