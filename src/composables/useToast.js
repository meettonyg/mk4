/**
 * Toast Notification Composable
 * 
 * Provides a simple API for showing toast notifications
 * 
 * @package Guestify
 * @version 4.0.0
 */

import { ref, readonly } from 'vue';

// Toast state
const toasts = ref([]);
let toastId = 0;

/**
 * Toast types
 */
export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Add a toast notification
 */
function addToast(message, type = ToastType.INFO, duration = 3000) {
  const id = ++toastId;
  
  const toast = {
    id,
    message,
    type,
    duration,
    visible: true
  };
  
  toasts.value.push(toast);
  
  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  
  return id;
}

/**
 * Remove a toast notification
 */
function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
}

/**
 * Clear all toasts
 */
function clearAllToasts() {
  toasts.value = [];
}

/**
 * Show success toast
 */
function showSuccess(message, duration = 3000) {
  return addToast(message, ToastType.SUCCESS, duration);
}

/**
 * Show error toast
 */
function showError(message, duration = 4000) {
  return addToast(message, ToastType.ERROR, duration);
}

/**
 * Show warning toast
 */
function showWarning(message, duration = 3500) {
  return addToast(message, ToastType.WARNING, duration);
}

/**
 * Show info toast
 */
function showInfo(message, duration = 3000) {
  return addToast(message, ToastType.INFO, duration);
}

/**
 * Composable hook
 */
export function useToast() {
  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastType
  };
}

export default useToast;
