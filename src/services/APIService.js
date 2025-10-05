/**
 * GMKB API Service v2.0
 * 
 * Pure REST API implementation for Phase 2 migration
 * Uses unified gmkb/v2/mediakit/{id} endpoint
 * Eliminates N+1 queries with single-query data fetching
 * 
 * PHASE 6 ENHANCEMENTS:
 * - Retry logic with exponential backoff
 * - Improved caching with TTL
 * - Race condition prevention
 * - Better error handling
 * 
 * @package GMKB
 * @version 2.0.0
 */

import { retryOperation } from '../utils/retry.js';
import { DataValidator } from './DataValidator.js';

export class APIService {
  constructor(restUrl, restNonce, postId) {
    // Initialize with REST API endpoints
    this.restUrl = this.normalizeRestUrl(restUrl || window.gmkbData?.restUrl);
    this.restNonce = restNonce || window.gmkbData?.restNonce;
    this.postId = this.detectPostId(postId);
    
    // V2 API base URL
    this.baseUrl = `${this.restUrl}gmkb/v2/mediakit/${this.postId}`;
    
    // PHASE 6: Enhanced response cache with TTL
    this.cache = new Map();
    this.cacheExpiry = 60000; // 1 minute
    
    // PHASE 6: Track in-flight requests to prevent race conditions
    this.inflightRequests = new Map();
    
    // Validate initialization
    if (!this.restUrl || !this.restNonce) {
      console.error('APIService Critical Error: restUrl or restNonce is missing');
    }
    if (!this.postId) {
      console.error('APIService Critical Error: No post ID could be determined');
    }
    
    if (window.gmkbData?.debugMode) {
      console.log('✅ APIService v2.0 initialized:', {
        postId: this.postId,
        baseUrl: this.baseUrl,
        hasNonce: !!this.restNonce,
        restUrl: this.restUrl
      });
    }
  }

  /**
   * Normalizes the REST URL to ensure it's valid and has trailing slash
   * ROOT FIX: Use URL constructor for proper parsing and validation
   */
  normalizeRestUrl(url) {
    if (!url) {
      console.error('❌ APIService: No REST URL provided, using fallback');
      // Fallback: construct REST URL from current domain
      const origin = window.location.origin;
      return `${origin}/wp-json/`;
    }
    
    // ROOT FIX: If URL contains 'admin-ajax.php', it's wrong - use fallback
    if (url.includes('admin-ajax.php')) {
      console.warn('⚠️ APIService: Detected admin-ajax.php in REST URL, using fallback');
      const origin = window.location.origin;
      return `${origin}/wp-json/`;
    }
    
    try {
      // ROOT FIX: Use URL constructor for proper parsing
      let parsedUrl;
      
      // Handle relative URLs
      if (url.startsWith('/')) {
        parsedUrl = new URL(url, window.location.origin);
      } else if (!url.startsWith('http')) {
        parsedUrl = new URL(url, window.location.origin);
      } else {
        parsedUrl = new URL(url);
      }
      
      // Clean up the pathname - remove double slashes
      let pathname = parsedUrl.pathname.replace(/\/+/g, '/');
      
      // Ensure it ends with wp-json/
      if (!pathname.endsWith('wp-json/')) {
        if (pathname.endsWith('/')) {
          pathname += 'wp-json/';
        } else {
          pathname += '/wp-json/';
        }
      }
      
      // Rebuild the URL
      const normalizedUrl = `${parsedUrl.origin}${pathname}`;
      
      console.log('✅ APIService: Normalized REST URL to:', normalizedUrl);
      return normalizedUrl;
      
    } catch (error) {
      console.error('❌ APIService: Failed to parse URL:', error);
      // Fallback to origin-based URL
      const origin = window.location.origin;
      return `${origin}/wp-json/`;
    }
  }

  /**
   * Detects the post ID from multiple potential sources
   */
  detectPostId(passedPostId) {
    // Priority 1: URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mkcgId = urlParams.get('mkcg_id');
    if (mkcgId) {
      if (window.gmkbData?.debugMode) {
        console.log('APIService: Using mkcg_id from URL:', mkcgId);
      }
      return parseInt(mkcgId, 10);
    }
    
    // Priority 2: Passed parameter
    if (passedPostId) {
      return passedPostId;
    }
    
    // Priority 3: Window data
    if (window.gmkbData) {
      if (window.gmkbData.postId) return window.gmkbData.postId;
      if (window.gmkbData.post_id) return window.gmkbData.post_id;
    }
    
    // Priority 4: URL post_id parameter
    const postIdFromUrl = urlParams.get('post_id');
    if (postIdFromUrl) {
      return parseInt(postIdFromUrl, 10);
    }
    
    return null;
  }

  /**
   * PHASE 6: Load complete media kit with retry logic and race condition prevention
   * 
   * Returns:
   * {
   *   components: {},
   *   sections: [],
   *   layout: [],
   *   theme: {},
   *   podsData: {},
   *   metadata: {}
   * }
   * 
   * @param {Object} options - Load options
   * @param {boolean} options.useCache - Use cached response if available
   * @param {boolean} options.forceRefresh - Force fresh load from server
   * @returns {Promise<Object>} Complete media kit data
   */
  async load(options = {}) {
    const { useCache = true, forceRefresh = false } = options;
    
    try {
      // PHASE 6: Check if there's already an in-flight request
      if (this.inflightRequests.has('load')) {
        console.log('⏳ Load already in progress, waiting...');
        return await this.inflightRequests.get('load');
      }

      // Check cache first
      if (useCache && !forceRefresh) {
        const cached = this.getFromCache('load');
        if (cached) {
          if (window.gmkbData?.debugMode) {
            console.log('✅ Loaded from cache');
          }
          return cached;
        }
      }
      
      if (!this.postId) {
        throw new Error('Cannot load: No post ID available');
      }
      
      // PHASE 6: Create load promise with retry logic
      const loadPromise = retryOperation(
        async () => {
          // Fetch from REST API v2
          const response = await fetch(this.baseUrl, {
            method: 'GET',
            headers: {
              'X-WP-Nonce': this.restNonce
            },
            credentials: 'same-origin'
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.message || 'API returned unsuccessful response');
          }

          // PHASE 6: Validate response structure
          DataValidator.validateAPIResponse(data);
          
          // Transform response to expected format
          const result = {
            components: data.state.components || {},
            sections: data.state.sections || [],
            layout: data.state.layout || [],
            globalSettings: data.state.globalSettings || {},
            theme: data.theme.id || 'professional_clean',
            themeCustomizations: data.theme.customizations || {},
            podsData: data.podsData || {},
            metadata: data.metadata || {}
          };
          
          // Cache response
          this.setCache('load', result);

          if (window.gmkbData?.debugMode) {
            console.log('✅ Loaded media kit data:', {
              components: Object.keys(result.components).length,
              sections: result.sections.length,
              podsFields: Object.keys(result.podsData).length,
              theme: result.theme
            });
          }

          return result;
        },
        {
          maxRetries: 3,
          delay: 1000,
          backoff: 2,
          onRetry: (attempt, max, wait, error) => {
            console.warn(`⚠️ Load attempt ${attempt}/${max} failed: ${error.message}. Retrying in ${wait}ms...`);
            
            // Dispatch retry event for UI feedback
            document.dispatchEvent(new CustomEvent('gmkb:load-retry', {
              detail: { attempt, max, wait, error: error.message }
            }));
          }
        }
      );

      // PHASE 6: Track in-flight request
      this.inflightRequests.set('load', loadPromise);

      try {
        const result = await loadPromise;
        return result;
      } finally {
        // Clear in-flight request
        this.inflightRequests.delete('load');
      }

    } catch (error) {
      console.error('Failed to load media kit:', error);
      
      // Dispatch error event
      document.dispatchEvent(new CustomEvent('gmkb:load-error', {
        detail: { error: error.message }
      }));
      
      throw error;
    }
  }

  /**
   * PHASE 6: Save complete media kit with retry logic
   * 
   * @param {Object} state - Complete state to save
   * @param {Object} options - Save options
   * @param {boolean} options.silent - Suppress console logging
   * @returns {Promise<Object>} Save result
   */
  async save(state, options = {}) {
    try {
      // PHASE 6: Check if there's already an in-flight save request
      if (this.inflightRequests.has('save')) {
        console.log('⏳ Save already in progress, waiting...');
        return await this.inflightRequests.get('save');
      }

      if (!this.postId) {
        throw new Error('Cannot save: No post ID available');
      }
      
      // PHASE 6: Validate and sanitize state before saving
      DataValidator.validateState(state);
      const sanitizedState = DataValidator.sanitizeState(state);
      
      // PHASE 6: Check state size
      const sizeCheck = DataValidator.validateStateSize(sanitizedState);
      if (!sizeCheck.valid) {
        throw new Error('State data too large');
      }
      
      // Prepare payload
      const payload = {
        components: sanitizedState.components || {},
        sections: sanitizedState.sections || [],
        layout: sanitizedState.layout || [],
        globalSettings: sanitizedState.globalSettings || {},
        theme: sanitizedState.theme || 'professional_clean',
        themeCustomizations: sanitizedState.themeCustomizations || {}
      };
      
      // Log payload size in debug mode
      if (window.gmkbData?.debugMode) {
        console.log('💾 Saving media kit:', {
          components: Object.keys(payload.components).length,
          sections: payload.sections.length,
          payloadSize: sizeCheck.sizeInKB + 'KB'
        });
      }

      // PHASE 6: Create save promise with retry logic
      const savePromise = retryOperation(
        async () => {
          const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': this.restNonce
            },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const error = await response.json();
            
            // Handle nonce expiration gracefully
            if (response.status === 403 || error.code === 'rest_forbidden') {
              return { success: false, silent: true, reason: 'nonce_expired' };
            }
            
            throw new Error(error.message || `HTTP ${response.status}`);
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || 'Save failed');
          }
          
          // Clear cache after successful save
          this.clearCache();

          if (!options.silent && window.gmkbData?.debugMode) {
            console.log('✅ Saved media kit:', {
              components: result.components_saved,
              sections: result.sections_saved,
              dataSize: Math.round(result.data_size / 1024) + 'KB'
            });
          }

          return result;
        },
        {
          maxRetries: 2, // Fewer retries for saves
          delay: 1000,
          backoff: 2,
          onRetry: (attempt, max, wait, error) => {
            console.warn(`⚠️ Save attempt ${attempt}/${max} failed: ${error.message}. Retrying in ${wait}ms...`);
            
            // Dispatch retry event for UI feedback
            document.dispatchEvent(new CustomEvent('gmkb:save-retry', {
              detail: { attempt, max, wait, error: error.message }
            }));
          }
        }
      );

      // PHASE 6: Track in-flight request
      this.inflightRequests.set('save', savePromise);

      try {
        const result = await savePromise;
        
        // Dispatch success event
        if (result.success && !result.silent) {
          document.dispatchEvent(new CustomEvent('gmkb:save-success', {
            detail: { result }
          }));
        }
        
        return result;
      } finally {
        // Clear in-flight request
        this.inflightRequests.delete('save');
      }

    } catch (error) {
      console.error('Failed to save media kit:', error);
      
      // Dispatch error event
      document.dispatchEvent(new CustomEvent('gmkb:save-error', {
        detail: { error: error.message }
      }));
      
      throw error;
    }
  }

  /**
   * Load component metadata
   * 
   * @returns {Promise<Array>} Array of component definitions
   */
  async loadComponents() {
    try {
      const response = await fetch(`${this.restUrl}gmkb/v2/components`, {
        method: 'GET',
        headers: {
          'X-WP-Nonce': this.restNonce
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load components');
      }
      
      if (window.gmkbData?.debugMode) {
        console.log('✅ Loaded ' + data.components.length + ' component definitions');
      }
      
      return data.components;

    } catch (error) {
      console.error('Failed to load components:', error);
      return [];
    }
  }

  /**
   * PHASE 6: Enhanced cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
    if (window.gmkbData?.debugMode) {
      console.log('🗑️ API cache cleared');
    }
  }

  /**
   * PHASE 6: Get current cache status for debugging
   */
  getCacheStatus() {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
      ageMinutes: Math.round((Date.now() - value.timestamp) / 60000),
      size: JSON.stringify(value.data).length
    }));
    
    return {
      entries,
      total: entries.length,
      totalSize: entries.reduce((sum, e) => sum + e.size, 0),
      totalSizeKB: Math.round(entries.reduce((sum, e) => sum + e.size, 0) / 1024)
    };
  }

  /**
   * PHASE 6: Get in-flight request status
   */
  getInflightStatus() {
    return {
      load: this.inflightRequests.has('load'),
      save: this.inflightRequests.has('save'),
      total: this.inflightRequests.size
    };
  }
}
