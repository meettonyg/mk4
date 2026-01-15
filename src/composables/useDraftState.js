/**
 * useDraftState - Composable for auto-saving form state to localStorage
 *
 * Provides automatic draft saving and restoration for AI tool generators.
 * Helps users avoid losing work when navigating away or refreshing.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.4.0
 */

import { ref, watch, onMounted, onUnmounted } from 'vue';

// Prefix for localStorage keys
const STORAGE_PREFIX = 'gmkb_draft_';

// Auto-save interval in milliseconds (30 seconds)
const AUTO_SAVE_INTERVAL = 30000;

/**
 * Create a draft state manager for a specific tool
 *
 * @param {string} toolId - Unique identifier for the tool (e.g., 'tagline', 'biography')
 * @param {object} options - Configuration options
 * @param {number} options.autoSaveInterval - Auto-save interval in ms (default: 30000)
 * @param {boolean} options.autoRestore - Whether to auto-restore on mount (default: true)
 *
 * @returns {object} Draft state methods and reactive state
 *
 * @example
 * const { saveDraft, loadDraft, clearDraft, hasDraft, lastSaved } = useDraftState('tagline');
 */
export function useDraftState(toolId, options = {}) {
  const {
    autoSaveInterval = AUTO_SAVE_INTERVAL,
    autoRestore = true
  } = options;

  const storageKey = `${STORAGE_PREFIX}${toolId}`;

  // Reactive state
  const hasDraft = ref(false);
  const lastSaved = ref(null);
  const isAutoSaving = ref(false);

  // Auto-save interval reference
  let autoSaveIntervalId = null;

  /**
   * Save draft state to localStorage
   * @param {object} state - The form state to save
   * @returns {boolean} Whether save was successful
   */
  const saveDraft = (state) => {
    if (!state || typeof state !== 'object') {
      return false;
    }

    try {
      const draftData = {
        state,
        timestamp: new Date().toISOString(),
        toolId
      };

      localStorage.setItem(storageKey, JSON.stringify(draftData));
      lastSaved.value = new Date();
      hasDraft.value = true;

      return true;
    } catch (err) {
      console.error(`[useDraftState:${toolId}] Failed to save draft:`, err);
      return false;
    }
  };

  /**
   * Load draft state from localStorage
   * @returns {object|null} The saved state or null if not found
   */
  const loadDraft = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        hasDraft.value = false;
        return null;
      }

      const draftData = JSON.parse(stored);

      // Validate the draft data
      if (!draftData || !draftData.state || draftData.toolId !== toolId) {
        hasDraft.value = false;
        return null;
      }

      // Check if draft is too old (24 hours)
      const savedDate = new Date(draftData.timestamp);
      const now = new Date();
      const hoursDiff = (now - savedDate) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        clearDraft();
        return null;
      }

      hasDraft.value = true;
      lastSaved.value = savedDate;

      return draftData.state;
    } catch (err) {
      console.error(`[useDraftState:${toolId}] Failed to load draft:`, err);
      return null;
    }
  };

  /**
   * Clear draft state from localStorage
   * @returns {boolean} Whether clear was successful
   */
  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
      hasDraft.value = false;
      lastSaved.value = null;
      return true;
    } catch (err) {
      console.error(`[useDraftState:${toolId}] Failed to clear draft:`, err);
      return false;
    }
  };

  /**
   * Check if a draft exists without loading it
   * @returns {boolean}
   */
  const checkDraftExists = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return false;

      const draftData = JSON.parse(stored);
      if (!draftData || !draftData.state || draftData.toolId !== toolId) return false;

      // Check if not too old
      const savedDate = new Date(draftData.timestamp);
      const now = new Date();
      const hoursDiff = (now - savedDate) / (1000 * 60 * 60);

      return hoursDiff <= 24;
    } catch {
      return false;
    }
  };

  /**
   * Start auto-saving with a state getter function
   * @param {Function} getState - Function that returns current state
   */
  const startAutoSave = (getState) => {
    if (autoSaveIntervalId) {
      clearInterval(autoSaveIntervalId);
    }

    autoSaveIntervalId = setInterval(() => {
      const state = getState();
      if (state && hasContent(state)) {
        isAutoSaving.value = true;
        saveDraft(state);
        setTimeout(() => { isAutoSaving.value = false; }, 1000);
      }
    }, autoSaveInterval);
  };

  /**
   * Stop auto-saving
   */
  const stopAutoSave = () => {
    if (autoSaveIntervalId) {
      clearInterval(autoSaveIntervalId);
      autoSaveIntervalId = null;
    }
  };

  /**
   * Check if state has meaningful content worth saving
   * @param {object} state
   * @returns {boolean}
   */
  const hasContent = (state) => {
    if (!state) return false;

    // Check for any non-empty string values
    for (const key in state) {
      const value = state[key];
      if (typeof value === 'string' && value.trim().length > 0) return true;
      if (Array.isArray(value) && value.length > 0) return true;
      if (typeof value === 'object' && value !== null && hasContent(value)) return true;
    }

    return false;
  };

  /**
   * Get formatted last saved time
   * @returns {string}
   */
  const getLastSavedText = () => {
    if (!lastSaved.value) return '';

    const now = new Date();
    const diff = now - lastSaved.value;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  // Check for existing draft on mount
  onMounted(() => {
    hasDraft.value = checkDraftExists();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    stopAutoSave();
  });

  return {
    // State
    hasDraft,
    lastSaved,
    isAutoSaving,

    // Methods
    saveDraft,
    loadDraft,
    clearDraft,
    checkDraftExists,
    startAutoSave,
    stopAutoSave,
    getLastSavedText
  };
}

export default useDraftState;
