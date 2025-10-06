/**
 * Unified Toast Service - Phase 2 Item #3 Enhancement
 * 
 * Centralized notification system to replace all alerts and custom toast implementations.
 * Provides consistent UI feedback across the application.
 * 
 * PHASE 2 ENHANCEMENTS:
 * - Queue management for multiple toasts
 * - Position options (top/bottom, left/right/center)
 * - Stacking with proper spacing
 * - Auto-dismiss with progress bar
 * - Accessibility improvements
 * 
 * @version 2.1.0
 * @implements Phase 2 Item #3: Unified Toast Service
 */

class ToastServiceClass {
  constructor() {
    this.toasts = [];
    this.containers = {}; // Support multiple containers for different positions
    this.nextId = 1;
    this.maxToasts = 5; // PHASE 2: Limit simultaneous toasts
    this.defaultDuration = 3000;
    this.defaultPosition = 'bottom-right';
    this.init();
  }

  init() {
    // Create default container
    this.getContainer(this.defaultPosition);
    
    // Inject styles
    this.initStyles();
    
    // PHASE 2: Listen for cleanup events
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.clear());
    }
  }
  
  /**
   * PHASE 2: Get or create container for specific position
   * @param {string} position - Position identifier (e.g., 'bottom-right', 'top-center')
   */
  getContainer(position = 'bottom-right') {
    if (this.containers[position]) {
      return this.containers[position];
    }
    
    if (typeof document === 'undefined') return null;
    
    const container = document.createElement('div');
    container.id = `gmkb-toast-container-${position}`;
    container.className = 'gmkb-toast-container';
    container.dataset.position = position;
    
    // Position styles
    const positions = {
      'top-left': { top: '20px', left: '20px' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      'top-right': { top: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-right': { bottom: '20px', right: '20px' }
    };
    
    const pos = positions[position] || positions['bottom-right'];
    const styles = Object.entries(pos)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
    
    container.style.cssText = `
      position: fixed;
      ${styles};
      z-index: 100000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: 420px;
    `;
    
    // Append to body when ready
    if (document.body) {
      document.body.appendChild(container);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(container);
      });
    }
    
    this.containers[position] = container;
    return container;
  }

  /**
   * Show a toast notification
   * PHASE 2: Enhanced with queue management and options
   * 
   * @param {string} message - The message to display
   * @param {string} type - Type of toast (success, error, warning, info)
   * @param {number|object} options - Duration in ms OR options object
   * @returns {number} Toast ID for manual removal
   */
  show(message, type = 'info', options = {}) {
    // Handle legacy duration parameter
    if (typeof options === 'number') {
      options = { duration: options };
    }
    
    const {
      duration = this.defaultDuration,
      position = this.defaultPosition,
      closeable = true,
      showProgress = duration > 0 && duration < 10000
    } = options;
    
    const container = this.getContainer(position);
    if (!container) return -1;
    
    // PHASE 2: Enforce max toasts limit
    if (this.toasts.length >= this.maxToasts) {
      // Remove oldest toast
      const oldest = this.toasts[0];
      if (oldest) this.remove(oldest.id);
    }
    
    const id = this.nextId++;
    
    const toast = document.createElement('div');
    toast.className = `gmkb-toast gmkb-toast--${type}`;
    toast.dataset.toastId = id;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    
    // Add icon based on type
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    const closeBtn = closeable 
      ? `<button class="gmkb-toast__close" aria-label="Close notification">×</button>`
      : '';
    
    const progressBar = showProgress
      ? `<div class="gmkb-toast__progress" style="animation-duration: ${duration}ms"></div>`
      : '';
    
    toast.innerHTML = `
      <span class="gmkb-toast__icon" aria-hidden="true">${icons[type] || icons.info}</span>
      <span class="gmkb-toast__message">${message}</span>
      ${closeBtn}
      ${progressBar}
    `;
    
    // Add close button handler
    if (closeable) {
      const closeBtnEl = toast.querySelector('.gmkb-toast__close');
      if (closeBtnEl) {
        closeBtnEl.onclick = () => this.remove(id);
      }
    }
    
    // Add to container
    container.appendChild(toast);
    this.toasts.push({ id, element: toast, container: position });
    
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
      
      /* PHASE 2: Progress bar for auto-dismiss */
      .gmkb-toast__progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 0 0 8px 8px;
        overflow: hidden;
      }
      
      .gmkb-toast__progress::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.7);
        transform-origin: left;
        animation: progress-shrink linear forwards;
      }
      
      @keyframes progress-shrink {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
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
