/**
 * Toast Service
 * Provides user notification functionality
 * Extracted from main.js to follow single responsibility principle
 */

export class ToastService {
  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - Type of toast: 'info', 'success', 'warning', 'error'
   * @param {number} duration - How long to show the toast in milliseconds
   */
  static show(message, type = 'info', duration = 3000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `gmkb-toast gmkb-toast--${type}`;
    
    // Add icon based on type
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    toast.innerHTML = `
      <span class="gmkb-toast__icon">${icons[type] || icons.info}</span>
      <span class="gmkb-toast__message">${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('gmkb-toast--visible');
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      toast.classList.remove('gmkb-toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  
  /**
   * Show success toast
   */
  static success(message, duration) {
    return this.show(message, 'success', duration);
  }
  
  /**
   * Show error toast
   */
  static error(message, duration) {
    return this.show(message, 'error', duration);
  }
  
  /**
   * Show warning toast
   */
  static warning(message, duration) {
    return this.show(message, 'warning', duration);
  }
  
  /**
   * Show info toast
   */
  static info(message, duration) {
    return this.show(message, 'info', duration);
  }
  
  /**
   * Initialize toast styles if needed
   */
  static initStyles() {
    // Check if styles already exist
    if (document.getElementById('gmkb-toast-styles')) return;
    
    const styles = `
      .gmkb-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 100000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
      }
      
      .gmkb-toast--visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .gmkb-toast--success {
        background: #10b981;
      }
      
      .gmkb-toast--error {
        background: #ef4444;
      }
      
      .gmkb-toast--warning {
        background: #f59e0b;
      }
      
      .gmkb-toast--info {
        background: #3b82f6;
      }
      
      .gmkb-toast__icon {
        font-size: 18px;
      }
      
      .gmkb-toast__message {
        flex: 1;
        line-height: 1.4;
      }
    `;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'gmkb-toast-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }
}

// Initialize styles when module loads
if (typeof document !== 'undefined') {
  ToastService.initStyles();
}

// Export convenience functions
export const showToast = ToastService.show.bind(ToastService);
export const showSuccess = ToastService.success.bind(ToastService);
export const showError = ToastService.error.bind(ToastService);
export const showWarning = ToastService.warning.bind(ToastService);
export const showInfo = ToastService.info.bind(ToastService);
