/**
 * Brand Kit Service
 *
 * Provides API access to Brand Kit entities - standalone brand identity assets
 * that can be shared across profiles and media kits.
 *
 * @class BrandKitService
 * @version 1.0.0
 */

class BrandKitService {
  constructor() {
    /**
     * API base URL
     * @type {string}
     * @private
     */
    // Try multiple sources for the REST API URL:
    // - Media kit builder: gmkbData.restUrl (includes namespace /wp-json/gmkb/v2/)
    // - Profile editor: gmkbProfileData.apiUrl (just /wp-json/)
    // - Standard WordPress: wpApiSettings.root
    const restUrl = window.gmkbData?.restUrl || window.gmkbData?.apiSettings?.apiUrl;
    if (restUrl) {
      // restUrl is like "/wp-json/gmkb/v2/" - just append endpoint
      this._apiBase = `${restUrl.replace(/\/$/, '')}/brand-kits`;
    } else {
      // Profile page or fallback - construct from base API URL
      const apiRoot = window.gmkbProfileData?.apiUrl || window.wpApiSettings?.root || '/wp-json/';
      this._apiBase = `${apiRoot.replace(/\/$/, '')}/gmkb/v2/brand-kits`;
    }

    /**
     * Cached brand kits
     * @type {Array|null}
     * @private
     */
    this._cache = null;

    /**
     * Cache timestamp
     * @type {number}
     * @private
     */
    this._cacheTime = 0;

    /**
     * Cache duration in ms (5 minutes)
     * @type {number}
     * @private
     */
    this._cacheDuration = 5 * 60 * 1000;

    /**
     * Schema data (cached)
     * @type {Object|null}
     * @private
     */
    this._schema = null;
  }

  /**
   * Get API headers with nonce
   * @returns {Object} Headers object
   * @private
   */
  _getHeaders() {
    // Try multiple sources for the REST API nonce
    // Different pages inject data differently:
    // - Media kit builder: gmkbData.restNonce or gmkbData.apiSettings.nonce
    // - Profile editor: gmkbProfileData.nonce
    // - Standard WordPress: wpApiSettings.nonce
    const nonce = window.gmkbData?.restNonce ||
                  window.gmkbData?.apiSettings?.nonce ||
                  window.gmkbProfileData?.nonce ||
                  window.wpApiSettings?.nonce ||
                  '';

    return {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    };
  }

  /**
   * Make a fetch request with proper authentication
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   * @private
   */
  async _fetch(url, options = {}) {
    return fetch(url, {
      ...options,
      headers: this._getHeaders(),
      credentials: 'same-origin',
    });
  }

  /**
   * Handle API response
   * @param {Response} response Fetch response
   * @returns {Promise<Object>} Parsed response data
   * @private
   */
  async _handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'API request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * Invalidate cache
   */
  invalidateCache() {
    this._cache = null;
    this._cacheTime = 0;
  }

  /**
   * Get all brand kits for current user
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise<Array>} Array of brand kit objects
   */
  async getAll(forceRefresh = false) {
    // Return cached if valid
    if (!forceRefresh && this._cache && Date.now() - this._cacheTime < this._cacheDuration) {
      return this._cache;
    }

    const response = await this._fetch(this._apiBase, { method: 'GET' });
    const result = await this._handleResponse(response);

    // Cache results
    this._cache = result.data || [];
    this._cacheTime = Date.now();

    return this._cache;
  }

  /**
   * Get a single brand kit by ID
   * @param {number} id - Brand kit ID
   * @returns {Promise<Object>} Brand kit object with full media
   */
  async get(id) {
    const response = await this._fetch(`${this._apiBase}/${id}`, { method: 'GET' });
    const result = await this._handleResponse(response);
    return result.data;
  }

  /**
   * Create a new brand kit
   * @param {Object} data - Brand kit data
   * @param {string} data.name - Brand kit name
   * @param {string} [data.color_primary] - Primary color
   * @param {string} [data.color_secondary] - Secondary color
   * @param {string} [data.font_primary] - Primary font
   * @param {string} [data.font_heading] - Heading font
   * @returns {Promise<Object>} Created brand kit
   */
  async create(data) {
    const response = await this._fetch(this._apiBase, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result = await this._handleResponse(response);
    this.invalidateCache();
    return result.data;
  }

  /**
   * Update a brand kit
   * @param {number} id - Brand kit ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Updated brand kit
   */
  async update(id, data) {
    const response = await this._fetch(`${this._apiBase}/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result = await this._handleResponse(response);
    this.invalidateCache();
    return result.data;
  }

  /**
   * Delete a brand kit
   * @param {number} id - Brand kit ID
   * @param {boolean} force - Force delete (skip trash)
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, force = false) {
    const url = force ? `${this._apiBase}/${id}?force=true` : `${this._apiBase}/${id}`;
    const response = await this._fetch(url, { method: 'DELETE' });
    await this._handleResponse(response);
    this.invalidateCache();
    return true;
  }

  /**
   * Duplicate a brand kit
   * @param {number} id - Brand kit ID to duplicate
   * @returns {Promise<Object>} New brand kit
   */
  async duplicate(id) {
    const response = await this._fetch(`${this._apiBase}/${id}/duplicate`, { method: 'POST' });
    const result = await this._handleResponse(response);
    this.invalidateCache();
    return result.data;
  }

  /**
   * Get brand kit usage (profiles/media kits using it)
   * @param {number} id - Brand kit ID
   * @returns {Promise<Object>} Usage data with profiles and media_kits arrays
   */
  async getUsage(id) {
    const response = await this._fetch(`${this._apiBase}/${id}/usage`, { method: 'GET' });
    const result = await this._handleResponse(response);
    return result.data;
  }

  // ==========================================
  // MEDIA MANAGEMENT
  // ==========================================

  /**
   * Get all media for a brand kit
   * @param {number} brandKitId - Brand kit ID
   * @param {Object} [options] - Filter options
   * @param {string} [options.category] - Filter by category
   * @param {Array<string>} [options.tags] - Filter by tags
   * @returns {Promise<Object>} Media data with items, grouped, and total
   */
  async getMedia(brandKitId, options = {}) {
    let url = `${this._apiBase}/${brandKitId}/media`;
    const params = new URLSearchParams();

    if (options.category) {
      params.append('category', options.category);
    }
    if (options.tags && options.tags.length) {
      options.tags.forEach(tag => params.append('tags[]', tag));
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await this._fetch(url, { method: 'GET' });
    const result = await this._handleResponse(response);
    return result.data;
  }

  /**
   * Add media to a brand kit
   * @param {number} brandKitId - Brand kit ID
   * @param {Object} mediaData - Media data
   * @param {number} mediaData.media_id - WordPress attachment ID
   * @param {string} [mediaData.category='photo'] - Category (headshot, logo, photo, background)
   * @param {Array<string>} [mediaData.tags=[]] - Tags
   * @param {string} [mediaData.label=''] - Display label
   * @param {boolean} [mediaData.is_primary=false] - Primary in category
   * @param {Object} [mediaData.metadata={}] - Additional metadata (link, etc.)
   * @returns {Promise<Object>} Updated media list
   */
  async addMedia(brandKitId, mediaData) {
    const response = await this._fetch(`${this._apiBase}/${brandKitId}/media`, {
      method: 'POST',
      body: JSON.stringify(mediaData),
    });

    const result = await this._handleResponse(response);
    return result.data;
  }

  /**
   * Update a media entry
   * @param {number} brandKitId - Brand kit ID
   * @param {number} mediaEntryId - Media entry ID (not attachment ID)
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Updated media list
   */
  async updateMedia(brandKitId, mediaEntryId, data) {
    const response = await this._fetch(`${this._apiBase}/${brandKitId}/media/${mediaEntryId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result = await this._handleResponse(response);
    return result.data;
  }

  /**
   * Remove media from brand kit
   * @param {number} brandKitId - Brand kit ID
   * @param {number} mediaEntryId - Media entry ID
   * @returns {Promise<Object>} Updated media list
   */
  async removeMedia(brandKitId, mediaEntryId) {
    const response = await this._fetch(`${this._apiBase}/${brandKitId}/media/${mediaEntryId}`, {
      method: 'DELETE',
    });

    const result = await this._handleResponse(response);
    return result.data;
  }

  /**
   * Reorder media in brand kit
   * @param {number} brandKitId - Brand kit ID
   * @param {Array<Object>} order - Array of {id, sort_order} objects
   * @returns {Promise<Object>} Updated media list
   */
  async reorderMedia(brandKitId, order) {
    const response = await this._fetch(`${this._apiBase}/${brandKitId}/media/reorder`, {
      method: 'POST',
      body: JSON.stringify({ order }),
    });

    const result = await this._handleResponse(response);
    return result.data;
  }

  // ==========================================
  // SCHEMA & UTILITIES
  // ==========================================

  /**
   * Get brand kit schema (colors, fonts, categories, defaults)
   * @returns {Promise<Object>} Schema data
   */
  async getSchema() {
    if (this._schema) {
      return this._schema;
    }

    const response = await this._fetch(`${this._apiBase}/schema`, { method: 'GET' });
    const result = await this._handleResponse(response);
    this._schema = result.data;
    return this._schema;
  }

  /**
   * Get available media categories
   * @returns {Promise<Object>} Categories with labels, icons, and suggested tags
   */
  async getMediaCategories() {
    const schema = await this.getSchema();
    return schema.media_categories || {};
  }

  /**
   * Get color field definitions
   * @returns {Promise<Object>} Color fields with labels and defaults
   */
  async getColorFields() {
    const schema = await this.getSchema();
    return schema.colors || {};
  }

  /**
   * Get typography field definitions
   * @returns {Promise<Object>} Typography fields with labels and defaults
   */
  async getTypographyFields() {
    const schema = await this.getSchema();
    return schema.typography || {};
  }

  /**
   * Get default values for a new brand kit
   * @returns {Promise<Object>} Default values
   */
  async getDefaults() {
    const schema = await this.getSchema();
    return schema.defaults || {};
  }

  // ==========================================
  // QUICK ACCESS METHODS
  // ==========================================

  /**
   * Get primary headshot from a brand kit
   * @param {number} brandKitId - Brand kit ID
   * @returns {Promise<Object|null>} Primary headshot media or null
   */
  async getPrimaryHeadshot(brandKitId) {
    const media = await this.getMedia(brandKitId, { category: 'headshot' });
    return media.items?.find(item => item.is_primary) || media.items?.[0] || null;
  }

  /**
   * Get all headshots from a brand kit
   * @param {number} brandKitId - Brand kit ID
   * @returns {Promise<Array>} Headshot media items
   */
  async getHeadshots(brandKitId) {
    const media = await this.getMedia(brandKitId, { category: 'headshot' });
    return media.items || [];
  }

  /**
   * Get all logos from a brand kit
   * @param {number} brandKitId - Brand kit ID
   * @param {Array<string>} [tags] - Optional tag filter (e.g., ['client', 'media'])
   * @returns {Promise<Array>} Logo media items
   */
  async getLogos(brandKitId, tags = null) {
    const options = { category: 'logo' };
    if (tags) {
      options.tags = tags;
    }
    const media = await this.getMedia(brandKitId, options);
    return media.items || [];
  }

  /**
   * Get brand kit colors as CSS custom properties
   * @param {Object} brandKit - Brand kit object
   * @returns {Object} CSS variable map
   */
  getCSSVariables(brandKit) {
    return {
      '--brand-color-primary': brandKit.color_primary || '#3b82f6',
      '--brand-color-secondary': brandKit.color_secondary || '#2563eb',
      '--brand-color-accent': brandKit.color_accent || '#f59e0b',
      '--brand-color-background': brandKit.color_background || '#ffffff',
      '--brand-color-surface': brandKit.color_surface || '#f8fafc',
      '--brand-color-text': brandKit.color_text || '#1e293b',
      '--brand-color-text-muted': brandKit.color_text_muted || '#64748b',
      '--brand-color-link': brandKit.color_link || '#3b82f6',
      '--brand-font-primary': brandKit.font_primary || 'Inter',
      '--brand-font-heading': brandKit.font_heading || 'Inter',
      '--brand-font-accent': brandKit.font_accent || 'inherit',
    };
  }

  /**
   * Apply brand kit colors as CSS custom properties to an element
   * @param {Object} brandKit - Brand kit object
   * @param {HTMLElement} [element=document.documentElement] - Target element
   */
  applyToElement(brandKit, element = document.documentElement) {
    const variables = this.getCSSVariables(brandKit);
    Object.entries(variables).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  }
}

// Export singleton instance
const brandKitService = new BrandKitService();
export default brandKitService;

// Also export class for testing
export { BrandKitService };
