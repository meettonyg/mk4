/**
 * @file toast-polyfill.js
 * @description A polyfill for showing toast notifications in the Media Kit Builder.
 * This ensures that a notification system is available even if the final environment
 * doesn't provide a global one.
 *
 * This version includes a fix to properly export the 'showToast' function,
 * making it accessible to other ES modules.
 */

let toastContainer = null;

/**
 * Creates the container for toast notifications if it doesn't already exist.
 */
function createToastContainer() {
    if (document.getElementById('toast-container')) {
        toastContainer = document.getElementById('toast-container');
        return;
    }
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'gmkb-toast-container';
    document.body.appendChild(toastContainer);
}

/**
 * Displays a toast notification with a message.
 * @param {string} message - The message to display in the toast.
 * @param {string} [type='info'] - The type of toast ('info', 'success', 'error', 'warning').
 * @param {number} [duration=3000] - The duration in milliseconds for the toast to be visible.
 */
export function showToast(message, type = 'info', duration = 3000) {
    if (!toastContainer) {
        createToastContainer();
    }

    const toast = document.createElement('div');
    toast.className = `gmkb-toast gmkb-toast--${type}`;
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('role', 'status');
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        toast.classList.add('closing');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }, duration);
}

// Initialize the container on script load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createToastContainer);
} else {
    createToastContainer();
}

// Expose globally for debugging
window.showToast = showToast;
