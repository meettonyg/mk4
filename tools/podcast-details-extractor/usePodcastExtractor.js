/**
 * Podcast Details Extractor - Composable
 *
 * Shared logic for extracting podcast information from URLs.
 * Used by both Generator.vue and Widget.vue components.
 *
 * @package GMKB
 * @subpackage Tools
 * @version 2.0.0
 */

import { ref, computed } from 'vue';

export function usePodcastExtractor() {
  // State
  const podcastUrl = ref('');
  const podcastInfo = ref({});
  const isExtracting = ref(false);
  const error = ref('');
  const emailCopied = ref(false);

  /**
   * Validation - can extract
   */
  const canExtract = computed(() => {
    const url = podcastUrl.value.trim();
    return url && (url.includes('podcasts.apple.com') || url.includes('podcasts.google.com'));
  });

  /**
   * Has results
   */
  const hasResults = computed(() => {
    return Object.keys(podcastInfo.value).length > 0 && podcastInfo.value.title;
  });

  /**
   * Truncated description for compact view
   */
  const truncatedDescription = computed(() => {
    if (!podcastInfo.value.description) return '';
    const desc = podcastInfo.value.description;
    return desc.length > 150 ? desc.substring(0, 150) + '...' : desc;
  });

  /**
   * Format date for display
   *
   * @param {string} dateString - Date string to format
   * @param {object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  /**
   * Handle extract button click
   *
   * @returns {Promise<object|null>} Extracted podcast info or null on error
   */
  const handleExtract = async () => {
    if (!canExtract.value) return null;

    isExtracting.value = true;
    error.value = '';
    podcastInfo.value = {};

    try {
      const response = await fetch(
        `/wp-json/podcast-details-extractor/v1/info?url=${encodeURIComponent(podcastUrl.value)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to extract podcast details');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      podcastInfo.value = data;
      return data;
    } catch (err) {
      console.error('[PodcastExtractor] Extraction failed:', err);
      error.value = err.message || 'Failed to extract podcast details. Please check the URL and try again.';
      return null;
    } finally {
      isExtracting.value = false;
    }
  };

  /**
   * Copy email to clipboard
   *
   * @returns {Promise<boolean>} Success status
   */
  const copyEmail = async () => {
    if (!podcastInfo.value.itunes_owner_email) return false;

    try {
      await navigator.clipboard.writeText(podcastInfo.value.itunes_owner_email);
      emailCopied.value = true;
      setTimeout(() => {
        emailCopied.value = false;
      }, 2000);
      return true;
    } catch (err) {
      console.error('[PodcastExtractor] Copy failed:', err);
      return false;
    }
  };

  /**
   * Copy all details to clipboard
   *
   * @returns {Promise<boolean>} Success status
   */
  const copyAllDetails = async () => {
    const details = [];

    if (podcastInfo.value.title) details.push(`Title: ${podcastInfo.value.title}`);
    if (podcastInfo.value.itunes_category) details.push(`Category: ${podcastInfo.value.itunes_category}`);
    if (podcastInfo.value.description) details.push(`Description: ${podcastInfo.value.description}`);
    if (podcastInfo.value.itunes_owner_name) details.push(`Owner: ${podcastInfo.value.itunes_owner_name}`);
    if (podcastInfo.value.itunes_owner_email) details.push(`Email: ${podcastInfo.value.itunes_owner_email}`);
    if (podcastInfo.value.link) details.push(`Website: ${podcastInfo.value.link}`);
    if (podcastInfo.value.lastBuildDate) details.push(`Last Episode: ${formatDate(podcastInfo.value.lastBuildDate)}`);

    try {
      await navigator.clipboard.writeText(details.join('\n'));
      return true;
    } catch (err) {
      console.error('[PodcastExtractor] Copy failed:', err);
      return false;
    }
  };

  /**
   * Reset state
   */
  const reset = () => {
    podcastUrl.value = '';
    podcastInfo.value = {};
    error.value = '';
    emailCopied.value = false;
  };

  return {
    // State
    podcastUrl,
    podcastInfo,
    isExtracting,
    error,
    emailCopied,

    // Computed
    canExtract,
    hasResults,
    truncatedDescription,

    // Methods
    formatDate,
    handleExtract,
    copyEmail,
    copyAllDetails,
    reset
  };
}
