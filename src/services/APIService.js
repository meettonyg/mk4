/**
 * GMKB API Service v2.0.1
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
 * - New Media Kit Support (null postId handling)
 *
 * @package GMKB
 * @version 2.0.1
 */

import { retryOperation } from '../utils/retry.js';
import { DataValidator } from './DataValidator.js';

export class APIService {
  constructor(restUrl, restNonce, postId) {
    // Initialize with REST API endpoints
    this.restUrl = this.normalizeRestUrl(restUrl || window.gmkbData?.restUrl);
    this.restNonce = restNonce || window.gmkbData?.restNonce;
    this.postId = this.detectPostId(postId);

    // V2 API base URL - only constructed if postId exists
    if (this.postId) {
      this.baseUrl = `${this.restUrl}gmkb/v2/mediakit/${this.postId}`;
    } else {
      this.baseUrl = null;
    }

    // PHASE 6: Enhanced response cache with TTL
    this.cache = new Map();
    this.cacheExpiry = 60000; // 1 minute

    // PHASE 6: Track in-flight requests to prevent race conditions
    this.inflightRequests = new Map();

    // Validate initialization
    if (!this.restUrl || !this.restNonce) {
      console.error('APIService Critical Error: restUrl or restNonce is missing');
    }

    // FIX: Don't error on missing postId - this is valid for new media kits
    if (!this.postId) {
      if (window.gmkbData?.debugMode) {
        console.log('ℹ️ APIService initialized in "creation mode" (no post ID yet)');
      }
    } else if (window.gmkbData?.debugMode) {
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
   * PHASE 6 FIX: Properly handle forward slashes (not backslashes)
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
      
      // PHASE 6 FIX: Use correct regex for forward slashes (not backslashes)
      // The original used /\\/+/g which targets backslashes, not forward slashes
      let pathname = parsedUrl.pathname.replace(/\/+/g, '/');
      
      // ROOT FIX: Check if wp-json is already in the path
      if (pathname.includes('/wp-json')) {
        // Already has wp-json, just ensure trailing slash
        if (!pathname.endsWith('/')) {
          pathname += '/';
        }
      } else {
        // Doesn't have wp-json, add it
        if (pathname.endsWith('/')) {
          pathname += 'wp-json/';
        } else {
          pathname += '/wp-json/';
        }
      }
      
      // PHASE 6 FIX: Final cleanup - remove any double forward slashes
      pathname = pathname.replace(/\/+/g, '/');
      
      // Rebuild the URL
      const normalizedUrl = `${parsedUrl.origin}${pathname}`;
      
      if (window.gmkbData?.debugMode) {
        console.log('✅ APIService: Normalized REST URL:', url, '→', normalizedUrl);
      }
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
   *   profileData: {},
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
      // Check for postId first - this is required for loading
      if (!this.postId) {
        throw new Error('Cannot load: No post ID available (New Media Kit)');
      }

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
      
      // PHASE 6: Create load promise with retry logic and timeout
      const loadPromise = retryOperation(
        async () => {
          // CRITICAL: Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
          
          try {
            // Fetch from REST API v2
            const response = await fetch(this.baseUrl, {
              method: 'GET',
              headers: {
                'X-WP-Nonce': this.restNonce
              },
              credentials: 'same-origin',
              signal: controller.signal
            });

            // P0 FIX #10: Handle nonce expiration gracefully
            if (response.status === 403) {
              const error = await response.json();
              if (error.code === 'rest_cookie_invalid_nonce' || error.code === 'rest_forbidden') {
                console.error('⚠️ Nonce expired or invalid - page reload required');
                // Dispatch event for UI to handle
                document.dispatchEvent(new CustomEvent('gmkb:nonce-expired', {
                  detail: { action: 'load' }
                }));
                throw new Error('Authentication expired. Please reload the page.');
              }
            }

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
            
            // CRITICAL FIX: Backend now returns theme as STRING (not object)
            // After fixing class-gmkb-rest-api-v2.php, theme is now data.theme (string)
            // not data.theme.id (object property)
            const result = {
              components: data.state.components || {},
              sections: data.state.sections || [],
              layout: data.state.layout || [],
              globalSettings: data.state.globalSettings || {},
              theme: data.theme || 'professional_clean', // ✅ NOW STRING!
              themeCustomizations: data.themeCustomizations || {},
              profileData: data.profileData || {},
              metadata: data.metadata || {}
            };
            
            // CRITICAL DEBUG: Log theme loading
            console.log('🎨 APIService LOAD: Theme data received:', {
              'data.theme (should be string)': data.theme,
              'data.theme type': typeof data.theme,
              'data.themeCustomizations': data.themeCustomizations ? 'present' : 'missing',
              'result.theme (what store will get)': result.theme,
              'Full response keys': Object.keys(data)
            });
            
            // Cache response
            this.setCache('load', result);

            if (window.gmkbData?.debugMode) {
              console.log('✅ Loaded media kit data:', {
                components: Object.keys(result.components).length,
                sections: result.sections.length,
                profileFields: Object.keys(result.profileData).length,
                theme: result.theme
              });
            }

            return result;
          } catch (error) {
            if (error.name === 'AbortError') {
              throw new Error('Request timeout after 30 seconds');
            }
            throw error;
          } finally {
            clearTimeout(timeoutId);
          }
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
        themeCustomizations: sanitizedState.themeCustomizations || {},
        // PRE-RENDER ARCHITECTURE: Include rendered HTML for frontend display
        rendered_content: sanitizedState.rendered_content || '',
        // PRE-RENDER ARCHITECTURE: Include component CSS for frontend styling
        rendered_css: sanitizedState.rendered_css || ''
      };

      // CRITICAL DEBUG: Log what's being saved
      console.log('🎨 APIService SAVE: Payload details:', {
        'payload.theme': payload.theme,
        'rendered_content length': payload.rendered_content?.length || 0,
        'rendered_css length': payload.rendered_css?.length || 0,
        'rendered_content preview': payload.rendered_content?.substring(0, 200) || '(empty)',
        'components': Object.keys(payload.components).length,
        'sections': payload.sections.length
      });
      
      // Log payload size in debug mode
      if (window.gmkbData?.debugMode) {
        console.log('💾 Saving media kit:', {
          components: Object.keys(payload.components).length,
          sections: payload.sections.length,
          payloadSize: sizeCheck.sizeInKB + 'KB'
        });
      }

      // PHASE 6: Create save promise with retry logic and timeout
      const savePromise = retryOperation(
        async () => {
          // CRITICAL: Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
          
          try {
            const response = await fetch(this.baseUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': this.restNonce
              },
              credentials: 'same-origin',
              body: JSON.stringify(payload),
              signal: controller.signal
            });

            // P0 FIX #10: Enhanced nonce expiration handling
            if (response.status === 403) {
              const error = await response.json();
              
              // Handle nonce expiration gracefully
              if (error.code === 'rest_cookie_invalid_nonce' || error.code === 'rest_forbidden') {
                console.error('⚠️ Nonce expired or invalid - page reload required');
                // Dispatch event for UI to handle
                document.dispatchEvent(new CustomEvent('gmkb:nonce-expired', {
                  detail: { action: 'save', unsavedData: payload }
                }));
                return { success: false, silent: true, reason: 'nonce_expired' };
              }
            }

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || `HTTP ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
              throw new Error(result.message || 'Save failed');
            }
            
            // CRITICAL DEBUG: Log theme save response
            console.log('🎨 APIService SAVE: Backend response received:', {
              'result.theme_save_status': result.theme_save_status,
              'theme attempted': result.theme_save_status?.attempted,
              'theme success': result.theme_save_status?.success,
              'theme verified': result.theme_save_status?.verified,
              'theme value sent': result.theme_save_status?.theme_value,
              'theme value saved': result.theme_save_status?.saved_value,
              'theme error': result.theme_save_status?.error || 'none'
            });
            
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
          } catch (error) {
            if (error.name === 'AbortError') {
              throw new Error('Save timeout after 30 seconds');
            }
            throw error;
          } finally {
            clearTimeout(timeoutId);
          }
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
