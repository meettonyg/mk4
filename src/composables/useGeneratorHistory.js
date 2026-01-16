/**
 * useGeneratorHistory - Composable for storing generation history in localStorage
 *
 * Provides history tracking for AI tool generators, allowing users to
 * view and restore recent generations.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.4.0
 */

import { ref, onMounted } from 'vue';

// Prefix for localStorage keys
const STORAGE_PREFIX = 'gmkb_history_';

// Default maximum history entries
const DEFAULT_MAX_ENTRIES = 10;

// History expiration in days
const HISTORY_EXPIRATION_DAYS = 30;

/**
 * Create a history manager for a specific generator tool
 *
 * @param {string} toolId - Unique identifier for the tool (e.g., 'topics', 'questions', 'offers')
 * @param {object} options - Configuration options
 * @param {number} options.maxEntries - Maximum history entries to keep (default: 10)
 *
 * @returns {object} History methods and reactive state
 *
 * @example
 * const { history, addToHistory, restoreFromHistory, clearHistory } = useGeneratorHistory('topics');
 */
export function useGeneratorHistory(toolId, options = {}) {
  const { maxEntries = DEFAULT_MAX_ENTRIES } = options;

  const storageKey = `${STORAGE_PREFIX}${toolId}`;

  // Reactive state
  const history = ref([]);
  const hasHistory = ref(false);

  /**
   * Generate a unique ID for history entries
   * @returns {string}
   */
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Load history from localStorage
   * @returns {Array} The history entries
   */
  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        history.value = [];
        hasHistory.value = false;
        return [];
      }

      let entries = JSON.parse(stored);

      // Filter out expired entries (older than 30 days)
      const now = Date.now();
      const expirationMs = HISTORY_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
      entries = entries.filter(entry => (now - entry.timestamp) < expirationMs);

      // Save cleaned list back
      if (entries.length !== JSON.parse(stored).length) {
        localStorage.setItem(storageKey, JSON.stringify(entries));
      }

      history.value = entries;
      hasHistory.value = entries.length > 0;

      return entries;
    } catch (err) {
      console.error(`[useGeneratorHistory:${toolId}] Failed to load history:`, err);
      history.value = [];
      hasHistory.value = false;
      return [];
    }
  };

  /**
   * Add an entry to history
   * @param {object} entry - The history entry
   * @param {object} entry.inputs - The input values used for generation
   * @param {any} entry.results - The generated results
   * @param {string} entry.preview - A short preview text for display
   * @returns {boolean} Whether add was successful
   */
  const addToHistory = (entry) => {
    if (!entry || !entry.inputs) {
      console.warn(`[useGeneratorHistory:${toolId}] Invalid entry:`, entry);
      return false;
    }

    try {
      // Load current history
      loadHistory();

      // Create new entry with metadata
      const newEntry = {
        id: generateId(),
        timestamp: Date.now(),
        inputs: entry.inputs,
        results: entry.results,
        preview: entry.preview || generatePreview(entry)
      };

      // Add to beginning and limit size
      history.value = [newEntry, ...history.value].slice(0, maxEntries);
      hasHistory.value = true;

      // Save to localStorage
      localStorage.setItem(storageKey, JSON.stringify(history.value));

      return true;
    } catch (err) {
      console.error(`[useGeneratorHistory:${toolId}] Failed to add to history:`, err);
      return false;
    }
  };

  /**
   * Generate a preview text from an entry
   * @param {object} entry
   * @returns {string}
   */
  const generatePreview = (entry) => {
    if (entry.preview) return entry.preview;

    // Try to extract a meaningful preview from inputs
    const inputs = entry.inputs || {};
    const previewFields = ['expertise', 'topic', 'refinedTopic', 'services', 'who'];

    for (const field of previewFields) {
      if (inputs[field] && typeof inputs[field] === 'string') {
        return inputs[field].substring(0, 50) + (inputs[field].length > 50 ? '...' : '');
      }
    }

    // Fallback to results preview
    if (entry.results) {
      if (Array.isArray(entry.results) && entry.results.length > 0) {
        const first = entry.results[0];
        if (typeof first === 'string') {
          return first.substring(0, 50) + (first.length > 50 ? '...' : '');
        }
        if (first.title) {
          return first.title.substring(0, 50);
        }
        if (first.name) {
          return first.name.substring(0, 50);
        }
      }
    }

    return 'Generated content';
  };

  /**
   * Get a specific history entry by ID
   * @param {string} id
   * @returns {object|null}
   */
  const getHistoryEntry = (id) => {
    return history.value.find(entry => entry.id === id) || null;
  };

  /**
   * Remove a specific history entry
   * @param {string} id
   * @returns {boolean}
   */
  const removeFromHistory = (id) => {
    try {
      history.value = history.value.filter(entry => entry.id !== id);
      hasHistory.value = history.value.length > 0;
      localStorage.setItem(storageKey, JSON.stringify(history.value));
      return true;
    } catch (err) {
      console.error(`[useGeneratorHistory:${toolId}] Failed to remove from history:`, err);
      return false;
    }
  };

  /**
   * Clear all history
   * @returns {boolean}
   */
  const clearHistory = () => {
    try {
      localStorage.removeItem(storageKey);
      history.value = [];
      hasHistory.value = false;
      return true;
    } catch (err) {
      console.error(`[useGeneratorHistory:${toolId}] Failed to clear history:`, err);
      return false;
    }
  };

  /**
   * Format timestamp for display
   * @param {number} timestamp
   * @returns {string}
   */
  const formatTimestamp = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    // Format as date for older entries
    return new Date(timestamp).toLocaleDateString();
  };

  // Load history on mount
  onMounted(() => {
    loadHistory();
  });

  return {
    // State
    history,
    hasHistory,

    // Methods
    loadHistory,
    addToHistory,
    getHistoryEntry,
    removeFromHistory,
    clearHistory,
    formatTimestamp
  };
}

export default useGeneratorHistory;
