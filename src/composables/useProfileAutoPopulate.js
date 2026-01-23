/**
 * useProfileAutoPopulate Composable
 *
 * Single composable that handles auto-population logic for component editors.
 * This follows the DRY principle - all auto-populate behavior is centralized here
 * rather than duplicated across each editor file.
 *
 * @package GMKB
 * @subpackage Composables
 * @since 2.6.0
 *
 * @example
 * // In BiographyEditor.vue - minimal footprint
 * const { isFromProfile, markEdited, prefilledFields } = useProfileAutoPopulate(
 *   'biography',
 *   localData,
 *   { autoRun: true }
 * );
 *
 * // In template
 * <ProfileFieldBadge v-if="isFromProfile('biography')" />
 * <textarea v-model="localData.biography" @input="markEdited('biography')" />
 */

import { ref, onMounted, watch } from 'vue';
import { useComponentProfileConfig } from './useComponentProfileConfig.js';
import { useProfilePrePopulation } from './useProfilePrePopulation.js';

/**
 * Auto-populate composable for component editors
 *
 * @param {string} componentType - The component type (e.g., 'biography', 'topics')
 * @param {Ref} localData - Reactive ref to the editor's local data object
 * @param {object} options - Configuration options
 * @param {boolean} options.autoRun - Whether to auto-populate on mount (default: true)
 * @param {boolean} options.onlyEmpty - Only populate empty fields (default: true)
 * @param {Function} options.onPopulate - Callback when fields are populated
 * @returns {object} Methods and state for auto-population
 */
export function useProfileAutoPopulate(componentType, localData, options = {}) {
  const {
    autoRun = true,
    onlyEmpty = true,
    onPopulate = null
  } = options;

  // Track which fields were populated from profile
  const prefilledFields = ref(new Set());
  const isPopulating = ref(false);
  const populateError = ref(null);

  // Get config and profile data access
  const { config, loadConfig, transformProfileData, shouldAutoPopulate } = useComponentProfileConfig(componentType);
  const { hasProfileData, getProfileData, initialize: initProfileData } = useProfilePrePopulation(componentType);

  /**
   * Check if a field was populated from the profile
   * @param {string} fieldName - The field name to check
   * @returns {boolean}
   */
  const isFromProfile = (fieldName) => {
    return prefilledFields.value.has(fieldName);
  };

  /**
   * Mark a field as edited by user (removes "from profile" status)
   * @param {string} fieldName - The field name that was edited
   */
  const markEdited = (fieldName) => {
    prefilledFields.value.delete(fieldName);
  };

  /**
   * Clear all prefilled field tracking
   */
  const clearPrefilledTracking = () => {
    prefilledFields.value.clear();
  };

  /**
   * Apply auto-population from profile data
   * @param {boolean} force - Force populate even non-empty fields
   * @returns {Promise<object>} Object with populated field names
   */
  const applyAutoPopulation = async (force = false) => {
    isPopulating.value = true;
    populateError.value = null;

    try {
      // Load config if not already loaded
      await loadConfig();

      // Check if auto-populate is enabled for this component
      if (!config.value?.profileIntegration?.autoPopulate && !force) {
        console.log(`[useProfileAutoPopulate] Auto-populate disabled for "${componentType}"`);
        return { populated: [] };
      }

      // Initialize profile data
      await initProfileData();

      if (!hasProfileData.value) {
        console.log(`[useProfileAutoPopulate] No profile data available for "${componentType}"`);
        return { populated: [] };
      }

      // Get raw profile data and transform it
      const rawProfileData = getProfileData();
      const transformedData = transformProfileData(rawProfileData);

      if (!transformedData || Object.keys(transformedData).length === 0) {
        return { populated: [] };
      }

      const populated = [];

      // Apply transformed data to localData
      for (const [fieldName, value] of Object.entries(transformedData)) {
        // Skip if value is empty
        if (value === null || value === undefined || value === '') {
          continue;
        }

        // Skip arrays with no items
        if (Array.isArray(value) && value.length === 0) {
          continue;
        }

        // Check if we should only populate empty fields
        const currentValue = localData.value?.[fieldName];
        const isEmpty = currentValue === null ||
                       currentValue === undefined ||
                       currentValue === '' ||
                       (Array.isArray(currentValue) && currentValue.length === 0);

        if (onlyEmpty && !isEmpty && !force) {
          continue;
        }

        // Populate the field
        if (localData.value) {
          localData.value[fieldName] = value;
          prefilledFields.value.add(fieldName);
          populated.push(fieldName);
        }
      }

      if (populated.length > 0) {
        console.log(`[useProfileAutoPopulate] Populated "${componentType}" fields:`, populated);

        if (onPopulate && typeof onPopulate === 'function') {
          onPopulate(populated, transformedData);
        }
      }

      return { populated, data: transformedData };

    } catch (error) {
      console.error(`[useProfileAutoPopulate] Error populating "${componentType}":`, error);
      populateError.value = error.message;
      return { populated: [], error: error.message };
    } finally {
      isPopulating.value = false;
    }
  };

  /**
   * Get all fields that can be populated from profile
   * @returns {string[]} Array of field names
   */
  const getPopulatableFields = () => {
    if (!config.value?.fieldMappings) {
      return [];
    }
    return Object.keys(config.value.fieldMappings);
  };

  /**
   * Check if component supports showing "from profile" badges
   * @returns {boolean}
   */
  const shouldShowBadges = () => {
    return config.value?.profileIntegration?.showBadges === true;
  };

  // Auto-run on mount if requested
  onMounted(async () => {
    if (autoRun) {
      await applyAutoPopulation();
    }
  });

  return {
    // State
    prefilledFields,
    isPopulating,
    populateError,

    // Methods
    isFromProfile,
    markEdited,
    clearPrefilledTracking,
    applyAutoPopulation,
    getPopulatableFields,
    shouldShowBadges,

    // Access to underlying composables
    config,
    hasProfileData
  };
}

export default useProfileAutoPopulate;
