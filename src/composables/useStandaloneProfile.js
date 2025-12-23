/**
 * useStandaloneProfile - Composable for profile management in standalone tools
 *
 * Handles profile selection, loading, and data pre-population for logged-in users
 * using the standalone AI tools (via /tools/ pages or shortcodes).
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.4.0
 */

import { ref, computed, watch, onMounted } from 'vue';

/**
 * Get standalone tools config from window
 * @returns {object} Configuration object
 */
function getConfig() {
  return window.gmkbStandaloneTools || {};
}

/**
 * Standalone Profile composable for AI tools
 *
 * @returns {object} Reactive state and methods for profile management
 *
 * @example
 * const { isLoggedIn, profiles, selectedProfileId, profileData, loadProfiles, selectProfile } = useStandaloneProfile();
 */
export function useStandaloneProfile() {
  const config = getConfig();

  // State
  const isLoggedIn = ref(config.isLoggedIn || false);
  const profiles = ref([]);
  const selectedProfileId = ref(null);
  const profileData = ref(null);
  const isLoadingProfiles = ref(false);
  const isLoadingProfile = ref(false);
  const error = ref(null);

  // Computed
  const hasProfiles = computed(() => profiles.value.length > 0);
  const hasSelectedProfile = computed(() => !!selectedProfileId.value);
  const selectedProfile = computed(() => {
    if (!selectedProfileId.value) return null;
    return profiles.value.find(p => p.id === selectedProfileId.value);
  });

  /**
   * Load user's profiles from REST API
   * @returns {Promise<Array>}
   */
  const loadProfiles = async () => {
    if (!isLoggedIn.value) {
      return [];
    }

    isLoadingProfiles.value = true;
    error.value = null;

    try {
      const response = await fetch(config.profilesEndpoint || '/wp-json/gmkb/v2/profiles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': config.restNonce || ''
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profiles: ${response.status}`);
      }

      const data = await response.json();
      profiles.value = data.profiles || data || [];

      // Auto-select single profile
      if (profiles.value.length === 1 && !selectedProfileId.value) {
        await selectProfile(profiles.value[0].id);
      }

      console.log('[useStandaloneProfile] Loaded profiles:', profiles.value.length);
      return profiles.value;

    } catch (err) {
      console.error('[useStandaloneProfile] Error loading profiles:', err);
      error.value = err.message;
      return [];
    } finally {
      isLoadingProfiles.value = false;
    }
  };

  /**
   * Load full profile data by ID
   * @param {number} profileId
   * @returns {Promise<object|null>}
   */
  const loadProfileData = async (profileId) => {
    if (!profileId || !isLoggedIn.value) {
      return null;
    }

    isLoadingProfile.value = true;
    error.value = null;

    try {
      const endpoint = config.profileEndpoint || '/wp-json/gmkb/v2/profile';
      const response = await fetch(`${endpoint}/${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': config.restNonce || ''
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      profileData.value = data.data || data;

      console.log('[useStandaloneProfile] Loaded profile data:', profileId);
      return profileData.value;

    } catch (err) {
      console.error('[useStandaloneProfile] Error loading profile:', err);
      error.value = err.message;
      return null;
    } finally {
      isLoadingProfile.value = false;
    }
  };

  /**
   * Select a profile and load its data
   * @param {number} profileId
   */
  const selectProfile = async (profileId) => {
    selectedProfileId.value = profileId;

    if (profileId) {
      await loadProfileData(profileId);

      // Dispatch event for other components
      document.dispatchEvent(new CustomEvent('gmkb:standalone-profile-selected', {
        detail: { profileId, profileData: profileData.value }
      }));
    } else {
      profileData.value = null;
    }
  };

  /**
   * Get authority hook data from profile
   * @returns {object} Authority hook fields
   */
  const getAuthorityHookData = computed(() => {
    if (!profileData.value) {
      return { who: '', what: '', when: '', how: '', where: '', why: '' };
    }

    return {
      who: profileData.value.hook_who || '',
      what: profileData.value.hook_what || '',
      when: profileData.value.hook_when || '',
      how: profileData.value.hook_how || '',
      where: profileData.value.hook_where || '',
      why: profileData.value.hook_why || ''
    };
  });

  /**
   * Get identity data from profile
   * @returns {object} Identity fields
   */
  const getIdentityData = computed(() => {
    if (!profileData.value) {
      return { name: '', title: '', company: '', tagline: '' };
    }

    const firstName = profileData.value.first_name || '';
    const lastName = profileData.value.last_name || '';

    return {
      name: profileData.value.full_name || `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      title: profileData.value.guest_title || '',
      company: profileData.value.company || '',
      tagline: profileData.value.tagline || ''
    };
  });

  /**
   * Get biography data from profile
   * @returns {object} Biography fields
   */
  const getBiographyData = computed(() => {
    if (!profileData.value) {
      return { biography: '', biographyAlt: '', podcastIntro: '' };
    }

    return {
      biography: profileData.value.biography || '',
      biographyAlt: profileData.value.biography_alt || '',
      podcastIntro: profileData.value.podcast_intro || '',
      whyBookYou: profileData.value.why_book_you || ''
    };
  });

  /**
   * Get topics from profile
   * @returns {Array<string>}
   */
  const getTopicsData = computed(() => {
    if (!profileData.value) {
      return [];
    }

    const topics = [];
    for (let i = 1; i <= 5; i++) {
      const topic = profileData.value[`topic_${i}`];
      if (topic) {
        topics.push(topic);
      }
    }
    return topics;
  });

  /**
   * Get questions from profile
   * @returns {Array<string>}
   */
  const getQuestionsData = computed(() => {
    if (!profileData.value) {
      return [];
    }

    const questions = [];
    for (let i = 1; i <= 25; i++) {
      const question = profileData.value[`question_${i}`];
      if (question) {
        questions.push(question);
      }
    }
    return questions;
  });

  /**
   * Save data back to profile
   * @param {string} field Field name
   * @param {any} value Field value
   * @returns {Promise<boolean>}
   */
  const saveToProfile = async (field, value) => {
    if (!selectedProfileId.value || !isLoggedIn.value) {
      console.warn('[useStandaloneProfile] Cannot save - no profile selected or not logged in');
      return false;
    }

    try {
      const endpoint = config.profileEndpoint || '/wp-json/gmkb/v2/profile';
      const response = await fetch(`${endpoint}/${selectedProfileId.value}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': config.restNonce || ''
        },
        credentials: 'same-origin',
        body: JSON.stringify({ [field]: value })
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }

      // Update local data
      if (profileData.value) {
        profileData.value[field] = value;
      }

      console.log('[useStandaloneProfile] Saved field:', field);
      return true;

    } catch (err) {
      console.error('[useStandaloneProfile] Error saving:', err);
      return false;
    }
  };

  /**
   * Save multiple fields to profile
   * @param {object} fields Object with field:value pairs
   * @returns {Promise<boolean>}
   */
  const saveMultipleToProfile = async (fields) => {
    if (!selectedProfileId.value || !isLoggedIn.value) {
      console.warn('[useStandaloneProfile] Cannot save - no profile selected or not logged in');
      return false;
    }

    try {
      const endpoint = config.profileEndpoint || '/wp-json/gmkb/v2/profile';
      const response = await fetch(`${endpoint}/${selectedProfileId.value}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': config.restNonce || ''
        },
        credentials: 'same-origin',
        body: JSON.stringify(fields)
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }

      // Update local data
      if (profileData.value) {
        Object.assign(profileData.value, fields);
      }

      console.log('[useStandaloneProfile] Saved fields:', Object.keys(fields));
      return true;

    } catch (err) {
      console.error('[useStandaloneProfile] Error saving:', err);
      return false;
    }
  };

  /**
   * Clear profile selection
   */
  const clearProfile = () => {
    selectedProfileId.value = null;
    profileData.value = null;
  };

  // Auto-load profiles on mount if logged in
  onMounted(() => {
    if (isLoggedIn.value) {
      loadProfiles();
    }
  });

  return {
    // State
    isLoggedIn,
    profiles,
    selectedProfileId,
    profileData,
    isLoadingProfiles,
    isLoadingProfile,
    error,

    // Computed
    hasProfiles,
    hasSelectedProfile,
    selectedProfile,
    getAuthorityHookData,
    getIdentityData,
    getBiographyData,
    getTopicsData,
    getQuestionsData,

    // Methods
    loadProfiles,
    loadProfileData,
    selectProfile,
    saveToProfile,
    saveMultipleToProfile,
    clearProfile
  };
}

export default useStandaloneProfile;
