/**
 * ProfileContextService
 *
 * Provides context-aware profile management for AI tools and components.
 * Detects whether we're in Media Kit Builder, Profile Editor, or standalone context,
 * and provides methods for profile selection and retrieval.
 *
 * @since 2.2.0
 */

import { ref, computed } from 'vue';

class ProfileContextService {
  constructor() {
    this._currentProfileId = ref(null);
    this._profiles = ref([]);
    this._isLoading = ref(false);
    this._error = ref(null);
    this._context = ref('unknown');
    this._initialized = false;
  }

  /**
   * Initialize the service and detect context
   */
  async initialize() {
    if (this._initialized) return;

    this._detectContext();
    await this._loadCurrentProfile();

    this._initialized = true;
  }

  /**
   * Detect the current context (media-kit, profile-editor, standalone)
   * @private
   */
  _detectContext() {
    // Check for Media Kit Builder context
    if (window.gmkbData?.postId || window.gmkbVueData?.postId) {
      this._context.value = 'media-kit';
      this._currentProfileId.value = window.gmkbData?.postId || window.gmkbVueData?.postId;
      return;
    }

    // Check for Profile Editor context
    if (window.gmkbProfileData?.postId) {
      this._context.value = 'profile-editor';
      this._currentProfileId.value = window.gmkbProfileData.postId;
      return;
    }

    // Check URL parameters for profile context
    const urlParams = new URLSearchParams(window.location.search);
    const entryParam = urlParams.get('entry');
    const profileParam = urlParams.get('profile_id') || urlParams.get('post_id');

    if (profileParam) {
      this._context.value = 'url-specified';
      this._currentProfileId.value = parseInt(profileParam, 10);
      return;
    }

    // Standalone context - no profile pre-selected
    this._context.value = 'standalone';
    this._currentProfileId.value = null;
  }

  /**
   * Load current profile data if in context
   * @private
   */
  async _loadCurrentProfile() {
    if (!this._currentProfileId.value) return;

    // Profile data is already available in window objects for builder/editor contexts
    // No additional fetch needed
  }

  /**
   * Get the current context type
   * @returns {'media-kit' | 'profile-editor' | 'standalone' | 'url-specified' | 'unknown'}
   */
  getContext() {
    return this._context.value;
  }

  /**
   * Get the current profile ID (if in context)
   * @returns {number|null}
   */
  getCurrentProfileId() {
    return this._currentProfileId.value;
  }

  /**
   * Check if we have a profile context
   * @returns {boolean}
   */
  hasProfileContext() {
    return this._currentProfileId.value !== null;
  }

  /**
   * Check if profile selection is needed (standalone without pre-selected profile)
   * @returns {boolean}
   */
  needsProfileSelection() {
    return this._context.value === 'standalone' && !this._currentProfileId.value;
  }

  /**
   * Set the active profile (for standalone context)
   * @param {number} profileId
   */
  setActiveProfile(profileId) {
    this._currentProfileId.value = profileId;

    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('gmkb:profile-selected', {
      detail: { profileId }
    }));
  }

  /**
   * Fetch all profiles for the current user
   * @returns {Promise<Array>} Array of profile objects
   */
  async fetchUserProfiles() {
    if (this._profiles.value.length > 0) {
      return this._profiles.value;
    }

    this._isLoading.value = true;
    this._error.value = null;

    try {
      const response = await fetch('/wp-json/gmkb/v2/profiles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.gmkbData?.nonce || window.wpApiSettings?.nonce || ''
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profiles: ${response.status}`);
      }

      const data = await response.json();
      this._profiles.value = data.profiles || data || [];

      // If we have exactly one profile and no context, auto-select it
      if (this._profiles.value.length === 1 && !this._currentProfileId.value) {
        this.setActiveProfile(this._profiles.value[0].id);
      }

      return this._profiles.value;

    } catch (error) {
      console.error('[ProfileContextService] Failed to fetch profiles:', error);
      this._error.value = error.message;
      return [];
    } finally {
      this._isLoading.value = false;
    }
  }

  /**
   * Get a specific profile by ID
   * @param {number} profileId
   * @returns {Promise<Object|null>}
   */
  async getProfile(profileId) {
    try {
      const response = await fetch(`/wp-json/gmkb/v2/profile/${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.gmkbData?.nonce || window.wpApiSettings?.nonce || ''
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('[ProfileContextService] Failed to fetch profile:', error);
      return null;
    }
  }

  /**
   * Get reactive refs for use in Vue components
   */
  getReactiveState() {
    return {
      currentProfileId: computed(() => this._currentProfileId.value),
      profiles: computed(() => this._profiles.value),
      isLoading: computed(() => this._isLoading.value),
      error: computed(() => this._error.value),
      context: computed(() => this._context.value),
      hasContext: computed(() => this.hasProfileContext()),
      needsSelection: computed(() => this.needsProfileSelection())
    };
  }
}

// Singleton instance
const profileContextService = new ProfileContextService();

export default profileContextService;
export { ProfileContextService };
