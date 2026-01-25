/**
 * Media Library Service
 *
 * Provides API access to the standalone Media Library - media assets that
 * exist independently and can be linked to multiple Brand Kits.
 *
 * @class MediaLibraryService
 * @version 1.0.0
 */

class MediaLibraryService {
  constructor() {
    // Build API base URL from available sources
    const restUrl = window.gmkbData?.restUrl || window.gmkbData?.apiSettings?.apiUrl;
    if (restUrl) {
      this._apiBase = `${restUrl.replace(/\/$/, '')}/media-library`;
    } else {
      const apiRoot = window.gmkbProfileData?.apiUrl ||
                      window.gmkbBrandKitsData?.apiUrl ||
                      window.gmkbMediaGalleryData?.apiUrl ||
                      window.wpApiSettings?.root ||
                      '/wp-json/';
      this._apiBase = `${apiRoot.replace(/\/$/, '')}/gmkb/v2/media-library`;
    }
  }

  /**
   * Get API headers with nonce
   */
  _getHeaders() {
    const nonce = window.gmkbData?.restNonce ||
                  window.gmkbData?.apiSettings?.nonce ||
                  window.gmkbProfileData?.nonce ||
                  window.gmkbBrandKitsData?.nonce ||
                  window.gmkbMediaGalleryData?.nonce ||
                  window.wpApiSettings?.nonce ||
                  '';

    return {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    };
  }

  /**
   * Make a fetch request
   */
  async _fetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: this._getHeaders(),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response;
  }

  /**
   * Get all media for current user
   *
   * @param {Object} params Query parameters
   * @returns {Promise<Array>} Array of media items
   */
  async getAll(params = {}) {
    const url = new URL(this._apiBase, window.location.origin);

    if (params.category) {
      url.searchParams.set('category', params.category);
    }
    if (params.per_page) {
      url.searchParams.set('per_page', params.per_page);
    }
    if (params.page) {
      url.searchParams.set('page', params.page);
    }

    const response = await this._fetch(url.toString());
    return response.json();
  }

  /**
   * Get a single media item
   *
   * @param {number} id Media ID
   * @returns {Promise<Object>} Media item
   */
  async get(id) {
    const response = await this._fetch(`${this._apiBase}/${id}`);
    return response.json();
  }

  /**
   * Create a new media item
   *
   * @param {Object} data Media data
   * @returns {Promise<Object>} Created media item
   */
  async create(data) {
    const response = await this._fetch(this._apiBase, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Update a media item
   *
   * @param {number} id Media ID
   * @param {Object} data Data to update
   * @returns {Promise<Object>} Updated media item
   */
  async update(id, data) {
    const response = await this._fetch(`${this._apiBase}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Delete a media item
   *
   * @param {number} id Media ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(id) {
    const response = await this._fetch(`${this._apiBase}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  /**
   * Get brand kits linked to a media item
   *
   * @param {number} id Media ID
   * @returns {Promise<Array>} Array of brand kits
   */
  async getLinkedBrandKits(id) {
    const response = await this._fetch(`${this._apiBase}/${id}/brand-kits`);
    return response.json();
  }

  /**
   * Link media to a brand kit
   *
   * @param {number} mediaId Media ID
   * @param {number} brandKitId Brand kit ID
   * @param {Object} options Link options (is_primary, sort_order)
   * @returns {Promise<Object>} Link result
   */
  async linkToBrandKit(mediaId, brandKitId, options = {}) {
    const response = await this._fetch(`${this._apiBase}/${mediaId}/brand-kits/${brandKitId}`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return response.json();
  }

  /**
   * Update link between media and brand kit
   *
   * @param {number} mediaId Media ID
   * @param {number} brandKitId Brand kit ID
   * @param {Object} data Data to update
   * @returns {Promise<Object>} Update result
   */
  async updateLink(mediaId, brandKitId, data) {
    const response = await this._fetch(`${this._apiBase}/${mediaId}/brand-kits/${brandKitId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Unlink media from a brand kit
   *
   * @param {number} mediaId Media ID
   * @param {number} brandKitId Brand kit ID
   * @returns {Promise<Object>} Unlink result
   */
  async unlinkFromBrandKit(mediaId, brandKitId) {
    const response = await this._fetch(`${this._apiBase}/${mediaId}/brand-kits/${brandKitId}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  /**
   * Get media for a specific brand kit
   *
   * @param {number} brandKitId Brand kit ID
   * @returns {Promise<Array>} Array of media items
   */
  async getForBrandKit(brandKitId) {
    const apiRoot = this._apiBase.replace('/media-library', '');
    const response = await this._fetch(`${apiRoot}/brand-kits/${brandKitId}/media-library`);
    return response.json();
  }

  /**
   * Get schema (categories)
   *
   * @returns {Promise<Object>} Schema data
   */
  async getSchema() {
    const response = await this._fetch(`${this._apiBase}/schema`);
    return response.json();
  }
}

// Export singleton instance
export const mediaLibraryService = new MediaLibraryService();
export default mediaLibraryService;
