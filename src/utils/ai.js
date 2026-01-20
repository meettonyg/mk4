/**
 * Shared AI utilities
 *
 * Helpers for AI tool requests across composables.
 *
 * @package GMKB
 * @since 3.2.0
 */

/**
 * Get REST URL from available sources
 * Ensures trailing slash for proper URL concatenation
 * @returns {string} REST API base URL
 */
export const getRestUrl = () => {
  const url = window.gmkbData?.restUrl
    || window.gmkbProfileData?.apiUrl
    || window.gmkbStandaloneTools?.apiBase
    || window.gmkbPublicData?.restUrl
    || '/wp-json/gmkb/v2/';

  return url.endsWith('/') ? url : `${url}/`;
};

/**
 * Get nonce from available sources
 * @param {string} context 'builder' or 'public'
 * @returns {string} Security nonce
 */
export const getToolNonce = (context) => {
  if (context === 'builder') {
    return window.gmkbData?.restNonce
      || window.gmkbData?.nonce
      || window.gmkbProfileData?.nonce
      || window.gmkbStandaloneTools?.restNonce
      || '';
  }
  return window.gmkbPublicNonce
    || window.gmkbPublicData?.publicNonce
    || window.gmkbStandaloneTools?.nonce
    || '';
};

/**
 * Check if user is logged in from available sources
 * @returns {boolean}
 */
export const isUserLoggedIn = () => {
  return !!(
    window.gmkbData?.postId
    || window.gmkbData?.post_id
    || window.gmkbProfileData?.postId
    || window.gmkbStandaloneTools?.isLoggedIn
  );
};
