/**
 * AI Store - Pinia store for AI generation state
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Manages AI generation history, caching, and shared data across generators.
 *
 * @package GMKB
 * @subpackage Stores
 * @version 1.0.0
 * @since 2.2.0
 */

import { defineStore } from 'pinia';

/**
 * Cache TTL in milliseconds (30 minutes)
 */
const CACHE_TTL = 30 * 60 * 1000;

/**
 * Maximum history entries to keep
 */
const MAX_HISTORY = 10;

export const useAIStore = defineStore('ai', {
  state: () => ({
    /**
     * Generation history (most recent first)
     * @type {Array<{type: string, params: object, content: any, timestamp: number}>}
     */
    generationHistory: [],

    /**
     * Cached results with TTL
     * @type {Object<string, {content: any, timestamp: number}>}
     */
    cachedResults: {},

    /**
     * Shared Authority Hook data (persists across generators)
     * The 4W Framework: "Who/What/When/How"
     */
    authorityHook: {
      who: '',
      what: '',
      when: '',
      how: ''
    },

    /**
     * Shared Impact Intro data (credentials/achievements)
     */
    impactIntro: {
      credentials: [],
      achievements: []
    },

    /**
     * User preferences for generation
     */
    preferences: {
      defaultTone: 'professional',
      defaultLength: 'medium',
      defaultPOV: 'third'
    },

    /**
     * Current generation state
     */
    isGenerating: false,
    currentGenerationType: null,
    lastError: null,

    /**
     * Usage tracking (synced from API responses)
     */
    usage: {
      remaining: null,
      limit: null,
      resetTime: null
    }
  }),

  getters: {
    /**
     * Get formatted authority hook as a readable sentence (4W Framework)
     */
    authorityHookSummary: (state) => {
      const { who, what, when, how } = state.authorityHook;
      const parts = [];

      if (who) parts.push(`I help ${who}`);
      if (what) parts.push(what);
      if (when) parts.push(`when ${when}`);
      if (how) parts.push(`by ${how}`);

      return parts.length > 0 ? parts.join(' ') : '';
    },

    /**
     * Check if authority hook has minimum required data
     */
    hasValidAuthorityHook: (state) => {
      return !!(state.authorityHook.who || state.authorityHook.what);
    },

    /**
     * Get credentials as formatted string
     */
    credentialsSummary: (state) => {
      return state.impactIntro.credentials.join(', ');
    },

    /**
     * Get recent generations of a specific type
     */
    getHistoryByType: (state) => (type) => {
      return state.generationHistory.filter(entry => entry.type === type);
    },

    /**
     * Check if there's a valid cached result for given key
     */
    hasCachedResult: (state) => (key) => {
      const cached = state.cachedResults[key];
      if (!cached) return false;

      const age = Date.now() - cached.timestamp;
      return age < CACHE_TTL;
    },

    /**
     * Get usage percentage
     */
    usagePercentage: (state) => {
      if (state.usage.limit === null || state.usage.remaining === null) return null;
      return Math.round(((state.usage.limit - state.usage.remaining) / state.usage.limit) * 100);
    },

    /**
     * Check if rate limited
     */
    isRateLimited: (state) => {
      return state.usage.remaining === 0;
    }
  },

  actions: {
    /**
     * Get cached result if valid
     * @param {string} key Cache key
     * @returns {any|null} Cached content or null
     */
    getCachedResult(key) {
      const cached = this.cachedResults[key];
      if (!cached) return null;

      const age = Date.now() - cached.timestamp;
      if (age > CACHE_TTL) {
        // Expired - remove from cache
        delete this.cachedResults[key];
        return null;
      }

      console.log(`[AI Store] Cache hit for: ${key}`);
      return cached.content;
    },

    /**
     * Store result in cache
     * @param {string} key Cache key
     * @param {any} content Content to cache
     */
    cacheResult(key, content) {
      this.cachedResults[key] = {
        content,
        timestamp: Date.now()
      };
      console.log(`[AI Store] Cached result for: ${key}`);
    },

    /**
     * Add entry to generation history
     * @param {object} entry History entry
     */
    addToHistory(entry) {
      this.generationHistory.unshift({
        ...entry,
        id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      });

      // Keep only recent entries
      if (this.generationHistory.length > MAX_HISTORY) {
        this.generationHistory = this.generationHistory.slice(0, MAX_HISTORY);
      }

      console.log(`[AI Store] Added to history: ${entry.type}`);
    },

    /**
     * Clear generation history
     */
    clearHistory() {
      this.generationHistory = [];
      console.log('[AI Store] History cleared');
    },

    /**
     * Clear cache
     */
    clearCache() {
      this.cachedResults = {};
      console.log('[AI Store] Cache cleared');
    },

    /**
     * Update authority hook field
     * @param {string} field Field name (who, what, when, how, where, why)
     * @param {string} value Field value
     */
    updateAuthorityHook(field, value) {
      if (field in this.authorityHook) {
        this.authorityHook[field] = value;
        console.log(`[AI Store] Authority hook updated: ${field}`);
      }
    },

    /**
     * Set entire authority hook
     * @param {object} hook Authority hook object
     */
    setAuthorityHook(hook) {
      this.authorityHook = {
        ...this.authorityHook,
        ...hook
      };
      console.log('[AI Store] Authority hook set');
    },

    /**
     * Reset authority hook to defaults (4W Framework)
     */
    resetAuthorityHook() {
      this.authorityHook = {
        who: '',
        what: '',
        when: '',
        how: ''
      };
      console.log('[AI Store] Authority hook reset');
    },

    /**
     * Add credential to impact intro
     * @param {string} credential Credential to add
     */
    addCredential(credential) {
      if (credential && !this.impactIntro.credentials.includes(credential)) {
        this.impactIntro.credentials.push(credential);
      }
    },

    /**
     * Remove credential from impact intro
     * @param {number} index Index to remove
     */
    removeCredential(index) {
      this.impactIntro.credentials.splice(index, 1);
    },

    /**
     * Set credentials
     * @param {Array<string>} credentials Credentials array
     */
    setCredentials(credentials) {
      this.impactIntro.credentials = [...credentials];
    },

    /**
     * Add achievement to impact intro
     * @param {string} achievement Achievement to add
     */
    addAchievement(achievement) {
      if (achievement && !this.impactIntro.achievements.includes(achievement)) {
        this.impactIntro.achievements.push(achievement);
      }
    },

    /**
     * Remove achievement from impact intro
     * @param {number} index Index to remove
     */
    removeAchievement(index) {
      this.impactIntro.achievements.splice(index, 1);
    },

    /**
     * Set achievements
     * @param {Array<string>} achievements Achievements array
     */
    setAchievements(achievements) {
      this.impactIntro.achievements = [...achievements];
    },

    /**
     * Update user preferences
     * @param {object} prefs Preferences to update
     */
    updatePreferences(prefs) {
      this.preferences = {
        ...this.preferences,
        ...prefs
      };
    },

    /**
     * Update usage info from API response
     * @param {object} usage Usage info
     */
    updateUsage(usage) {
      if (usage) {
        this.usage = {
          remaining: usage.remaining ?? this.usage.remaining,
          limit: usage.limit ?? this.usage.limit,
          resetTime: usage.reset_time ?? usage.resetTime ?? this.usage.resetTime
        };
      }
    },

    /**
     * Set generation state
     * @param {boolean} isGenerating Is currently generating
     * @param {string|null} type Generation type
     */
    setGenerating(isGenerating, type = null) {
      this.isGenerating = isGenerating;
      this.currentGenerationType = isGenerating ? type : null;
    },

    /**
     * Set last error
     * @param {string|null} error Error message
     */
    setError(error) {
      this.lastError = error;
    },

    /**
     * Clear error
     */
    clearError() {
      this.lastError = null;
    },

    /**
     * Reset all AI state
     */
    resetAll() {
      this.generationHistory = [];
      this.cachedResults = {};
      this.authorityHook = {
        who: '',
        what: '',
        when: '',
        how: '',
        where: '',
        why: ''
      };
      this.impactIntro = {
        credentials: [],
        achievements: []
      };
      this.isGenerating = false;
      this.currentGenerationType = null;
      this.lastError = null;
      console.log('[AI Store] All state reset');
    },

    /**
     * Load authority hook from Pods data
     * @param {object} podsData Pods data object
     */
    loadFromPodsData(podsData) {
      if (!podsData) return;

      // Load authority hook fields if they exist
      const hookFields = {
        who: podsData.hook_who || podsData.guest_title || '',
        what: podsData.hook_what || '',
        when: podsData.hook_when || '',
        how: podsData.hook_how || '',
        where: podsData.hook_where || '',
        why: podsData.hook_why || ''
      };

      // Only update if we have some data
      if (Object.values(hookFields).some(v => v)) {
        this.setAuthorityHook(hookFields);
        console.log('[AI Store] Loaded authority hook from Pods data');
      }

      // Load credentials if available
      if (podsData.credentials) {
        const creds = Array.isArray(podsData.credentials)
          ? podsData.credentials
          : podsData.credentials.split(',').map(c => c.trim()).filter(c => c);
        this.setCredentials(creds);
      }

      // Load achievements if available
      if (podsData.achievements) {
        const achievements = Array.isArray(podsData.achievements)
          ? podsData.achievements
          : podsData.achievements.split(',').map(a => a.trim()).filter(a => a);
        this.setAchievements(achievements);
      }
    }
  }
});
