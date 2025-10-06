/**
 * Debounced Search Composable
 * 
 * Provides optimized search functionality with debouncing,
 * history, and suggestions.
 * 
 * @version 2.0.0
 */

import { ref, computed, watch, onMounted } from 'vue';

/**
 * Use debounced search
 * 
 * @param {Function} searchFunction - Function to execute search
 * @param {Object} options - Configuration options
 * @returns {Object} Search state and methods
 */
export function useDebounceSearch(searchFunction, options = {}) {
  const {
    delay = 300,
    minLength = 2,
    maxResults = 50,
    enableHistory = true,
    historyKey = 'gmkb_search_history',
    maxHistoryItems = 10
  } = options;

  // State
  const searchTerm = ref('');
  const searchResults = ref([]);
  const isSearching = ref(false);
  const searchHistoryItems = ref([]);
  const suggestions = ref([]);
  const error = ref(null);
  
  let searchTimeout = null;
  let abortController = null;

  /**
   * Perform search with debouncing
   * 
   * @param {string} term - Search term
   */
  const performSearch = async (term) => {
    // Clear previous results if term is too short
    if (term.length < minLength) {
      searchResults.value = [];
      isSearching.value = false;
      return;
    }

    isSearching.value = true;
    error.value = null;

    // Abort previous request if exists
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    try {
      console.log('🔍 Searching for:', term);
      
      // Execute search function
      const results = await searchFunction(term, {
        signal: abortController.signal,
        maxResults
      });

      searchResults.value = Array.isArray(results) 
        ? results.slice(0, maxResults)
        : [];

      console.log('✅ Search complete:', searchResults.value.length, 'results');

      // Add to history
      if (enableHistory && !searchHistoryItems.value.includes(term)) {
        addToHistory(term);
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('🛑 Search aborted');
      } else {
        console.error('❌ Search error:', err);
        error.value = err.message;
        searchResults.value = [];
      }
    } finally {
      isSearching.value = false;
      abortController = null;
    }
  };

  /**
   * Add term to search history
   * 
   * @param {string} term - Search term
   */
  const addToHistory = (term) => {
    // Remove if already exists
    const filtered = searchHistoryItems.value.filter(item => item !== term);
    
    // Add to beginning
    filtered.unshift(term);
    
    // Limit size
    searchHistoryItems.value = filtered.slice(0, maxHistoryItems);
    
    // Save to localStorage
    try {
      localStorage.setItem(historyKey, JSON.stringify(searchHistoryItems.value));
    } catch (err) {
      console.warn('Failed to save search history:', err);
    }
  };

  /**
   * Load search history from localStorage
   */
  const loadHistory = () => {
    if (!enableHistory) return;
    
    try {
      const saved = localStorage.getItem(historyKey);
      if (saved) {
        searchHistoryItems.value = JSON.parse(saved);
        console.log('📚 Loaded search history:', searchHistoryItems.value.length, 'items');
      }
    } catch (err) {
      console.warn('Failed to load search history:', err);
      searchHistoryItems.value = [];
    }
  };

  /**
   * Clear search history
   */
  const clearHistory = () => {
    searchHistoryItems.value = [];
    
    try {
      localStorage.removeItem(historyKey);
      console.log('🗑️ Search history cleared');
    } catch (err) {
      console.warn('Failed to clear search history:', err);
    }
  };

  /**
   * Generate search suggestions
   */
  const generateSuggestions = () => {
    if (!searchTerm.value) {
      // Show recent searches when no term
      suggestions.value = searchHistoryItems.value.slice(0, 5);
      return;
    }

    // Filter history by current term
    const term = searchTerm.value.toLowerCase();
    suggestions.value = searchHistoryItems.value
      .filter(item => item.toLowerCase().includes(term))
      .slice(0, 5);
  };

  /**
   * Clear search
   */
  const clearSearch = () => {
    searchTerm.value = '';
    searchResults.value = [];
    error.value = null;
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchTimeout = null;
    }
    
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  /**
   * Execute search immediately (skip debounce)
   * 
   * @param {string} term - Search term
   */
  const searchImmediate = async (term) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchTimeout = null;
    }
    
    searchTerm.value = term;
    await performSearch(term);
  };

  // Watch search term with debounce
  watch(searchTerm, (newTerm) => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Clear results if empty
    if (!newTerm) {
      searchResults.value = [];
      isSearching.value = false;
      return;
    }

    // Generate suggestions
    generateSuggestions();

    // Set new timeout
    searchTimeout = setTimeout(() => {
      performSearch(newTerm);
    }, delay);
  });

  // Load history on mount
  onMounted(() => {
    loadHistory();
  });

  // Computed properties
  const hasResults = computed(() => searchResults.value.length > 0);
  const isEmpty = computed(() => searchTerm.value.length === 0);
  const hasSuggestions = computed(() => suggestions.value.length > 0);
  const showHistory = computed(() => 
    isEmpty.value && searchHistoryItems.value.length > 0
  );

  return {
    // State
    searchTerm,
    searchResults,
    isSearching,
    error,
    searchHistoryItems,
    suggestions,
    
    // Computed
    hasResults,
    isEmpty,
    hasSuggestions,
    showHistory,
    
    // Methods
    clearSearch,
    clearHistory,
    searchImmediate,
    generateSuggestions
  };
}

/**
 * Simple debounce utility
 * 
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay = 300) {
  let timeout;
  
  return function (...args) {
    const context = this;
    
    clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

/**
 * Throttle utility
 * 
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  
  return function (...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
