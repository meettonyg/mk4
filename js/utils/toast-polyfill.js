/**
 * Toast Service Polyfill
 * Provides a toast notification fallback if historyService is not available
 */

(function() {
    // Only create the polyfill if window.historyService doesn't exist or doesn't have showToast
    if (!window.historyService || typeof window.historyService.showToast !== 'function') {
        
        // Create a minimal toast notification service
        window.historyService = window.historyService || {};
        
        /**
         * Show a toast notification
         * @param {string} message - Message to show
         * @param {string} type - Toast type: 'info', 'success', 'warning', 'error'
         * @param {number} duration - Duration in milliseconds (default: 3000)
         * @param {boolean} dismissible - Whether toast can be dismissed manually (default: false)
         */
        window.historyService.showToast = function(message, type = 'info', duration = 3000, dismissible = false) {
            // Check if a toast container exists
            let toastContainer = document.querySelector('.gmkb-toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.className = 'gmkb-toast-container';
                document.body.appendChild(toastContainer);
            }
            
            // Create toast element
            const toast = document.createElement('div');
            toast.className = `gmkb-toast gmkb-toast--${type}`;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'polite');
            toast.textContent = message;
            
            // Add close button if dismissible
            if (dismissible) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'gmkb-toast__close';
                closeBtn.innerHTML = '&times;';
                closeBtn.setAttribute('aria-label', 'Close notification');
                closeBtn.addEventListener('click', () => {
                    toast.classList.add('closing');
                    setTimeout(() => toast.remove(), 300);
                });
                toast.appendChild(closeBtn);
            }
            
            // Add to container
            toastContainer.appendChild(toast);
            
            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
            
            // Remove after delay
            if (duration > 0) {
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        toast.classList.remove('show');
                        setTimeout(() => {
                            if (document.body.contains(toast)) {
                                toast.remove();
                            }
                        }, 300);
                    }
                }, duration);
            }
            
            return toast; // Return toast element for potential future reference
        };

        console.log('Toast notification polyfill activated');
    }
})();
