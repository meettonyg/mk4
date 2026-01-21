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
    || window.gmkbToolPageData?.restUrl
    || '/wp-json/gmkb/v2/';

  return url.endsWith('/') ? url : `${url}/`;
};

/**
 * Get public nonce from available sources (for anonymous/public API requests)
 * @returns {string} Public security nonce
 */
export const getPublicNonce = () => {
  return window.gmkbPublicNonce
    || window.gmkbPublicData?.publicNonce
    || window.gmkbToolPageData?.publicNonce
    || window.gmkbStandaloneTools?.nonce
    || '';
};

/**
 * Get builder/REST nonce from available sources (for authenticated API requests)
 * @returns {string} Builder/REST security nonce
 */
export const getBuilderNonce = () => {
  return window.gmkbData?.restNonce
    || window.gmkbData?.nonce
    || window.gmkbProfileData?.nonce
    || window.gmkbStandaloneTools?.restNonce
    || '';
};

/**
 * Get nonce from available sources
 * @param {string} context 'builder' or 'public'
 * @returns {string} Security nonce
 */
export const getToolNonce = (context) => {
  if (context === 'builder') {
    return getBuilderNonce();
  }
  return getPublicNonce();
};

/**
 * Get REST API nonce for X-WP-Nonce header (needed for authenticated REST requests)
 * This is separate from the public AI nonce and includes WordPress standard sources
 * @returns {string} REST API nonce
 */
export const getRestNonce = () => {
  return window.gmkbData?.restNonce
    || window.gmkbStandaloneTools?.restNonce
    || window.gmkbProfileData?.nonce
    || window.wpApiSettings?.nonce
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
