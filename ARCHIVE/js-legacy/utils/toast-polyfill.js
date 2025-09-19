/**
 * Toast Notification Polyfill
 * Provides a simple toast notification system
 * 
 * ROOT FIX: Event-driven toast system with no external dependencies
 */

(function() {
    'use strict';
    
    /**
     * Show a toast notification
     * @param {string} message - Message to show
     * @param {string} type - Toast type: 'info', 'success', 'warning', 'error'
     * @param {number} duration - Duration in milliseconds (default: 3000)
     * @param {boolean} dismissible - Whether toast can be dismissed manually (default: false)
     */
    function showToast(message, type = 'info', duration = 3000, dismissible = false) {
    // Check if a toast container exists
    let toastContainer = document.querySelector('.gmkb-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'gmkb-toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `gmkb-toast gmkb-toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    // Style the toast
    const baseStyle = `
        background: #1e293b;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
        max-width: 400px;
        font-size: 14px;
        line-height: 1.5;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    // Type-specific colors
    const typeColors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    toast.style.cssText = baseStyle + `border-left: 4px solid ${typeColors[type] || typeColors.info};`;
    
    // Add icon
    const icon = document.createElement('span');
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    icon.textContent = icons[type] || icons.info;
    icon.style.cssText = `
        font-weight: bold;
        font-size: 16px;
        color: ${typeColors[type] || typeColors.info};
    `;
    toast.appendChild(icon);
    
    // Add message
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    messageSpan.style.flex = '1';
    toast.appendChild(messageSpan);
    
    // Add close button if dismissible
    if (dismissible) {
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            opacity: 0.7;
            cursor: pointer;
            font-size: 18px;
            padding: 0;
            margin-left: 10px;
        `;
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Close notification');
        closeBtn.addEventListener('click', () => {
            removeToast(toast);
        });
        toast.appendChild(closeBtn);
    }
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
    });
    
    // Remove after delay
    if (duration > 0) {
        setTimeout(() => {
            removeToast(toast);
        }, duration);
    }
    
    return toast;
}

    /**
     * Remove a toast with animation
     * @param {HTMLElement} toast - Toast element to remove
     */
    function removeToast(toast) {
        if (!toast || !document.body.contains(toast)) return;
        
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.remove();
            }
        }, 300);
    }
    
    // Expose globally for all scripts
    window.showToast = showToast;
    
    console.log('✅ Toast Polyfill: Available globally and ready');
})();
