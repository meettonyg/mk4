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
import podsDataIntegration from '../core/PodsDataIntegration.js';
import { useMediaKitStore } from '../stores/mediaKit.js';

/**
 * Profile Pre-Population composable for component editors
 *
 * @param {string} componentType - The component type (e.g., 'biography', 'topics')
 * @returns {object} Reactive state and methods for profile data access
 */
export function useProfilePrePopulation(componentType = null) {
  // Track if profile data is available
  const profileDataAvailable = ref(false);
  const isLoading = ref(false);
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

    const data = podsDataIntegration.getPrePopulatedData(componentType);
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
    return podsDataIntegration.getProfileData();
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
    return podsDataIntegration.getPrePopulatedData(targetType);
  };

  /**
   * Get a specific field from profile data
   * @param {string|string[]} fieldNames - Field name(s) to look up
   * @returns {*} The field value or null
   */
  const getProfileField = (fieldNames) => {
    return podsDataIntegration.getProfileField(fieldNames);
  };

  /**
   * Check if a specific field has data in the profile
   * @param {string|string[]} fieldNames - Field name(s) to check
   * @returns {boolean}
   */
  const hasProfileField = (fieldNames) => {
    return podsDataIntegration.hasProfileField(fieldNames);
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
    return podsDataIntegration.getComponentPodsConfig(targetType);
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
    prePopulatedData,

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

    // Direct access to integration (for advanced use)
    podsDataIntegration
  };
}

export default useProfilePrePopulation;
