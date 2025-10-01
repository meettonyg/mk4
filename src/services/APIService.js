/**
 * GMKB API Service v2.0
 * 
 * Pure REST API implementation for Phase 2 migration
 * Uses unified gmkb/v2/mediakit/{id} endpoint
 * Eliminates N+1 queries with single-query data fetching
 * 
 * @package GMKB
 * @version 2.0.0
 */

export class APIService {
  constructor(restUrl, restNonce, postId) {
    // Initialize with REST API endpoints
    this.restUrl = restUrl || window.gmkbData?.restUrl;
    this.restNonce = restNonce || window.gmkbData?.restNonce;
    this.postId = this.detectPostId(postId);
    
    // V2 API base URL
    this.baseUrl = `${this.restUrl}gmkb/v2/mediakit/${this.postId}`;
    
    // Response cache
    this.cache = new Map();
    this.cacheExpiry = 60000; // 1 minute
    
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
        hasNonce: !!this.restNonce
      });
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
   * Load complete media kit in ONE API call
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

    } catch (error) {
      console.error('Failed to load media kit:', error);
      throw error;
    }
  }

  /**
   * Save complete media kit in ONE API call
   * 
   * @param {Object} state - Complete state to save
   * @param {Object} options - Save options
   * @param {boolean} options.silent - Suppress console logging
   * @returns {Promise<Object>} Save result
   */
  async save(state, options = {}) {
    try {
      if (!this.postId) {
        throw new Error('Cannot save: No post ID available');
      }
      
      // Prepare payload
      const payload = {
        components: state.components || {},
        sections: state.sections || [],
        layout: state.layout || [],
        globalSettings: state.globalSettings || {},
        theme: state.theme || 'professional_clean',
        themeCustomizations: state.themeCustomizations || {}
      };
      
      // Log payload size in debug mode
      if (window.gmkbData?.debugMode) {
        const payloadSize = JSON.stringify(payload).length;
        console.log('💾 Saving media kit:', {
          components: Object.keys(payload.components).length,
          sections: payload.sections.length,
          payloadSize: Math.round(payloadSize / 1024) + 'KB'
        });
      }

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

    } catch (error) {
      console.error('Failed to save media kit:', error);
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
   * Cache management
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
   * Get current cache status for debugging
   */
  getCacheStatus() {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
      size: JSON.stringify(value.data).length
    }));
    
    return {
      entries,
      total: entries.length,
      totalSize: entries.reduce((sum, e) => sum + e.size, 0)
    };
  }
}
