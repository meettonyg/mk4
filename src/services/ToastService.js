/**
 * Unified Toast Service - Phase 5 Fix
 * 
 * Centralized notification system to replace all alerts and custom toast implementations.
 * Provides consistent UI feedback across the application.
 * 
 * @version 2.0.0
 * @implements Phase 5: Unified Notification System
 */

class ToastServiceClass {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.nextId = 1;
    this.init();
  }

  init() {
    // Create container if it doesn't exist
    if (!this.container && typeof document !== 'undefined') {
      this.container = document.createElement('div');
      this.container.id = 'gmkb-toast-container';
      this.container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 100000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      
      // Append to body when DOM is ready
      if (document.body) {
        document.body.appendChild(this.container);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(this.container);
        });
      }
      
      // Inject styles
      this.initStyles();
    }
  }

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - Type of toast (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds (0 for persistent)
   * @returns {number} Toast ID for manual removal
   */
  show(message, type = 'info', duration = 3000) {
    if (!this.container) this.init();
    
    const id = this.nextId++;
    
    const toast = document.createElement('div');
    toast.className = `gmkb-toast gmkb-toast--${type}`;
    toast.dataset.toastId = id;
    
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
      <button class="gmkb-toast__close">×</button>
    `;
    
    // Add close button handler
    const closeBtn = toast.querySelector('.gmkb-toast__close');
    if (closeBtn) {
      closeBtn.onclick = () => this.remove(id);
    }
    
    // Add to container
    this.container.appendChild(toast);
    this.toasts.push({ id, element: toast });
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('gmkb-toast--visible');
    }, 10);
    
    // Auto-remove if duration is set
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
    
    return id;
  }

  /**
   * Remove a toast by ID
   * @param {number} id - Toast ID
   */
  remove(id) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index === -1) return;

    const toast = this.toasts[index].element;
    toast.classList.remove('gmkb-toast--visible');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
      this.toasts.splice(index, 1);
    }, 300);
  }

  /**
   * Clear all toasts
   */
  clear() {
    this.toasts.forEach(t => this.remove(t.id));
  }

  /**
   * Convenience methods
   */
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
  
  /**
   * Initialize toast styles if needed
   */
  initStyles() {
    // Check if styles already exist
    if (document.getElementById('gmkb-toast-styles')) return;
    
    const styles = `
      .gmkb-toast {
        position: relative;
        background: #333;
        color: white;
        padding: 12px 16px;
        padding-right: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        pointer-events: auto;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
      }
      
      .gmkb-toast--visible {
        opacity: 1;
        transform: translateX(0);
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
        flex-shrink: 0;
      }
      
      .gmkb-toast__message {
        flex: 1;
        line-height: 1.4;
        font-size: 14px;
      }
      
      .gmkb-toast__close {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        opacity: 0.8;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .gmkb-toast__close:hover {
        opacity: 1;
      }
      
      @media (max-width: 640px) {
        #gmkb-toast-container {
          bottom: 10px !important;
          left: 10px !important;
          right: 10px !important;
        }
        
        .gmkb-toast {
          max-width: none !important;
        }
      }
    `;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'gmkb-toast-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }
}

// Create singleton instance
const ToastService = new ToastServiceClass();

// Make available globally - PHASE 5 FIX: Unified interface
if (typeof window !== 'undefined') {
  // Primary interface
  window.ToastService = ToastService;
  
  // Backward compatibility
  window.showToast = (message, type, duration) => {
    return ToastService.show(message, type, duration);
  };
  
  // Additional convenience methods
  window.showSuccess = (message, duration) => ToastService.success(message, duration);
  window.showError = (message, duration) => ToastService.error(message, duration);
  window.showWarning = (message, duration) => ToastService.warning(message, duration);
  window.showInfo = (message, duration) => ToastService.info(message, duration);
  
  // PHASE 5 FIX: Replace alert() calls with toast
  if (!window._originalAlert) {
    window._originalAlert = window.alert;
    window.alert = (message) => {
      ToastService.warning(message, 5000);
      console.warn('Alert replaced with toast:', message);
    };
  }
  
  console.log('[ToastService] ✅ Unified notification system ready');
}

// Export for module usage
export default ToastService;
export { ToastService };

// Export convenience functions for backward compatibility
export const showToast = ToastService.show.bind(ToastService);
export const showSuccess = ToastService.success.bind(ToastService);
export const showError = ToastService.error.bind(ToastService);
export const showWarning = ToastService.warning.bind(ToastService);
export const showInfo = ToastService.info.bind(ToastService);
