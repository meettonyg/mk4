/**
 * Shared API Utilities
 *
 * Common helper functions for REST API requests across composables.
 * Handles configuration from multiple contexts: media kit builder (gmkbData),
 * profile editor (gmkbProfileData), and public tools (gmkbPublicData).
 *
 * @package GMKB
 * @since 3.2.0
 */

/**
 * Get REST API base URL from available sources
 * Checks multiple window objects for the REST URL based on context.
 * FIX: Aggressively strips namespace (gmkb/v2) to prevent URL duplication
 *
 * @returns {string} REST API base URL with trailing slash (e.g. /wp-json/)
 */
export const getApiUrl = () => {
  let restUrl = window.gmkbData?.restUrl
    || window.gmkbProfileData?.apiUrl
    || '/wp-json/';

  // URL DUPLICATION FIX: Ensure we only have the root wp-json path
  // If the URL contains /wp-json/, strip everything after it
  if (restUrl.includes('/wp-json')) {
    const match = restUrl.match(/(.*?\/wp-json\/)/);
    if (match) {
      restUrl = match[1];
    } else {
      // Fallback if regex fails but string exists (e.g. missing trailing slash)
      const index = restUrl.indexOf('/wp-json');
      restUrl = restUrl.substring(0, index + 9); // +9 includes '/wp-json/'
    }
  }

  return restUrl.endsWith('/') ? restUrl : restUrl + '/';
};

/**
 * Get REST API nonce from available sources
 * Checks multiple window objects for authentication nonce based on context.
 *
 * @returns {string} REST API nonce for X-WP-Nonce header
 */
export const getNonce = () => {
  return window.gmkbData?.restNonce
    || window.gmkbProfileData?.nonce
    || window.wpApiSettings?.nonce
    || '';
};

/**
 * Make an authenticated API request to the GMKB REST API
 *
 * @param {string} endpoint - API endpoint path (without base URL)
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} Parsed JSON response
 * @throws {Error} On HTTP error with message from response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}gmkb/v2/${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': getNonce(),
    },
    credentials: 'same-origin',
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};
