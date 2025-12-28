/**
 * useProfilePrePopulation Composable
 *
 * Provides component editors with access to profile data for pre-population.
 * This is specifically designed for the Media Kit Builder to:
 * - Get pre-populated data for a component type
 * - Offer a "Load from Profile" button in editors
 * - Check if profile data is available for specific fields
 *
 * @package GMKB
 * @subpackage Composables
 * @since 2.5.0
 *
 * @example
 * // In a component editor
 * const {
 *   hasProfileData,
 *   getPrePopulatedData,
 *   getProfileField,
 *   loadFromProfile
 * } = useProfilePrePopulation('biography');
 *
 * // Check if profile has biography data
 * if (hasProfileData.value) {
 *   // Show "Load from Profile" button
 * }
 *
 * // Load data from profile into editor
 * const bioData = loadFromProfile();
 * localData.value.biography = bioData.biography;
 */

import { ref, computed, onMounted } from 'vue';
import profileDataIntegration from '../core/ProfileDataIntegration.js';
import { useMediaKitStore } from '../stores/mediaKit.js';
import aiSaveBridge from '../services/AISaveBridge.js';

/**
 * Profile Pre-Population composable for component editors
 *
 * @param {string} componentType - The component type (e.g., 'biography', 'topics')
 * @returns {object} Reactive state and methods for profile data access
 */
// Map component types to AISaveBridge types
const COMPONENT_TO_SAVE_TYPE = {
  'biography': 'biography',
  'topics': 'topics',
  'questions': 'questions',
  'guest-intro': 'guest_intro',
  'hero': 'biography', // Hero uses biography fields
  'tagline': 'tagline',
  'authority-hook': 'authority_hook',
  'contact': 'contact',
  'social': 'social'
};

export function useProfilePrePopulation(componentType = null) {
  // Track if profile data is available
  const profileDataAvailable = ref(false);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const saveError = ref(null);
  const lastSaveResult = ref(null);
  const prePopulatedData = ref({});

  // Get the media kit store for accessing podsData
  let store = null;
  try {
    store = useMediaKitStore();
  } catch (e) {
    // Not in a context where the store is available
  }

  /**
   * Initialize and check for profile data availability
   */
  const initialize = () => {
    if (!componentType) return;

    const data = profileDataIntegration.getPrePopulatedData(componentType);
    prePopulatedData.value = data;
    profileDataAvailable.value = Object.keys(data).length > 0;

    console.log(`[useProfilePrePopulation] Initialized for "${componentType}":`, {
      available: profileDataAvailable.value,
      fields: Object.keys(data)
    });
  };

  /**
   * Check if profile has data for this component type
   */
  const hasProfileData = computed(() => profileDataAvailable.value);

  /**
   * Get the full raw profile data
   */
  const getProfileData = () => {
    return profileDataIntegration.getProfileData();
  };

  /**
   * Get pre-populated data for a specific component type
   * @param {string} type - Component type (optional, uses constructor type if not provided)
   * @returns {object} Pre-populated data for the component
   */
  const getPrePopulatedData = (type = null) => {
    const targetType = type || componentType;
    if (!targetType) {
      console.warn('[useProfilePrePopulation] No component type specified');
      return {};
    }
    return profileDataIntegration.getPrePopulatedData(targetType);
  };

  /**
   * Get a specific field from profile data
   * @param {string|string[]} fieldNames - Field name(s) to look up
   * @returns {*} The field value or null
   */
  const getProfileField = (fieldNames) => {
    return profileDataIntegration.getProfileField(fieldNames);
  };

  /**
   * Check if a specific field has data in the profile
   * @param {string|string[]} fieldNames - Field name(s) to check
   * @returns {boolean}
   */
  const hasProfileField = (fieldNames) => {
    return profileDataIntegration.hasProfileField(fieldNames);
  };

  /**
   * Load pre-populated data from profile
   * This is useful for "Load from Profile" button functionality
   * @returns {object} Pre-populated data
   */
  const loadFromProfile = () => {
    isLoading.value = true;
    try {
      const data = getPrePopulatedData();
      prePopulatedData.value = data;
      profileDataAvailable.value = Object.keys(data).length > 0;
      return data;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Apply pre-populated data to a component in the store
   * @param {string} componentId - The component ID to update
   * @param {object} data - Data to apply (optional, uses cached prePopulatedData if not provided)
   */
  const applyToComponent = (componentId, data = null) => {
    if (!store) {
      console.warn('[useProfilePrePopulation] Store not available');
      return false;
    }

    const dataToApply = data || prePopulatedData.value;
    if (!Object.keys(dataToApply).length) {
      console.warn('[useProfilePrePopulation] No data to apply');
      return false;
    }

    const component = store.components[componentId];
    if (!component) {
      console.warn(`[useProfilePrePopulation] Component ${componentId} not found`);
      return false;
    }

    // Merge pre-populated data with existing data
    store.updateComponent(componentId, {
      data: {
        ...component.data,
        ...dataToApply
      }
    });

    console.log(`[useProfilePrePopulation] Applied profile data to component ${componentId}:`, dataToApply);
    return true;
  };

  /**
   * Get the data mapping config for a component type
   * Useful for understanding what fields are available
   */
  const getFieldMappings = (type = null) => {
    const targetType = type || componentType;
    if (!targetType) return null;
    return profileDataIntegration.getComponentFieldConfig(targetType);
  };

  /**
   * Check if the profile data matches what's in a component
   * Returns true if component already has the profile data
   */
  const isComponentPrePopulated = (componentId) => {
    if (!store) return false;

    const component = store.components[componentId];
    if (!component || !component._prePopulated) return false;

    return component._prePopulated === true;
  };

  /**
   * Get the current profile/post ID
   * The profile ID is the WordPress post ID of the guest/profile custom post
   */
  const getProfileId = () => {
    // Try multiple sources for the profile ID
    return window.gmkbData?.postId ||
           window.gmkbData?.post_id ||
           window.gmkbVueData?.postId ||
           store?.postId ||
           null;
  };

  /**
   * Check if we can save to profile
   * Returns true if we have a valid profile ID and the component type is supported
   */
  const canSaveToProfile = computed(() => {
    const profileId = getProfileId();
    const saveType = COMPONENT_TO_SAVE_TYPE[componentType];
    return !!profileId && !!saveType;
  });

  /**
   * Save component data back to the profile/custom post
   *
   * @param {object} data - The data to save (should match the component's data structure)
   * @returns {Promise<{success: boolean, saved: object, errors: array}>}
   *
   * @example
   * // In BiographyEditor
   * await saveToProfile({ biography: localData.value.biography });
   *
   * // In TopicsEditor
   * await saveToProfile({ topics: localData.value.topics });
   */
  const saveToProfile = async (data) => {
    const profileId = getProfileId();

    if (!profileId) {
      const error = 'No profile ID available. Cannot save to profile.';
      console.error('[useProfilePrePopulation]', error);
      saveError.value = error;
      return { success: false, saved: {}, errors: [error] };
    }

    const saveType = COMPONENT_TO_SAVE_TYPE[componentType];
    if (!saveType) {
      const error = `Component type "${componentType}" is not supported for saving to profile.`;
      console.error('[useProfilePrePopulation]', error);
      saveError.value = error;
      return { success: false, saved: {}, errors: [error] };
    }

    isSaving.value = true;
    saveError.value = null;

    try {
      // Transform data to match AISaveBridge expected format
      let saveData = data;

      // For some types, we need to transform the data
      if (componentType === 'questions' && Array.isArray(data.questions)) {
        // Questions editor uses { question, answer } format
        // AISaveBridge expects array of questions (strings or objects with question property)
        saveData = data.questions.map(q => q.question || q);
      } else if (componentType === 'topics' && Array.isArray(data.topics)) {
        // Topics are already in the right format (array of strings)
        saveData = data.topics;
      } else if (componentType === 'biography' && data.biography) {
        // Biography can be a string or object with short/medium/long
        saveData = data.biography;
      } else if (componentType === 'guest-intro' && data.introduction) {
        // Guest intro is a string
        saveData = data.introduction;
      }

      console.log(`[useProfilePrePopulation] Saving ${componentType} to profile #${profileId}:`, saveData);

      const result = await aiSaveBridge.saveToProfile(profileId, saveType, saveData);

      lastSaveResult.value = result;

      if (result.success) {
        console.log(`[useProfilePrePopulation] ✅ Successfully saved ${componentType} to profile`);
      } else {
        saveError.value = result.errors.join(', ');
      }

      return result;

    } catch (error) {
      console.error('[useProfilePrePopulation] Save failed:', error);
      saveError.value = error.message;
      return {
        success: false,
        saved: {},
        errors: [error.message]
      };
    } finally {
      isSaving.value = false;
    }
  };

  // Initialize on mount if component type is provided
  onMounted(() => {
    if (componentType) {
      initialize();
    }
  });

  return {
    // State
    hasProfileData,
    isLoading,
    isSaving,
    saveError,
    lastSaveResult,
    prePopulatedData,
    canSaveToProfile,

    // Methods
    initialize,
    getProfileData,
    getPrePopulatedData,
    getProfileField,
    hasProfileField,
    loadFromProfile,
    applyToComponent,
    getFieldMappings,
    isComponentPrePopulated,
    getProfileId,
    saveToProfile,

    // Direct access to services (for advanced use)
    profileDataIntegration,
    aiSaveBridge
  };
}

export default useProfilePrePopulation;
