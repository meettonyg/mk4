/**
 * useComponentProfileConfig Composable
 *
 * Dynamically loads profile-config.json from each component's directory
 * using Vite's import.meta.glob for build-time resolution.
 *
 * This composable is part of the self-contained component architecture,
 * where each component defines its own profile integration configuration.
 *
 * @package GMKB
 * @subpackage Composables
 * @since 2.6.0
 *
 * @example
 * const { config, loadConfig, isLoading } = useComponentProfileConfig('biography');
 * await loadConfig();
 * console.log(config.value.fieldMappings);
 */

import { ref } from 'vue';
import { ProfileDataTransformer } from '../core/ProfileDataTransformer.js';

/**
 * Pre-map ALL profile-config.json files at build time (Vite-safe)
 * This avoids the dynamic import limitation where bundlers can't
 * statically analyze variable paths in import()
 *
 * The path is relative from this file (src/composables/) up to project root
 * then into components directory.
 */
const configRegistry = import.meta.glob('/components/*/profile-config.json', { eager: false });

// Log available configs at startup for debugging
if (typeof window !== 'undefined') {
  if (Object.keys(configRegistry).length > 0) {
    console.log('[useComponentProfileConfig] Available configs:', Object.keys(configRegistry));
  } else {
    console.warn('[useComponentProfileConfig] No profile-config.json files found. Falling back to embedded configs.');
  }
}

/**
 * Cache for loaded configs to avoid repeated async fetches
 * @type {Map<string, object>}
 */
const configCache = new Map();

/**
 * Promise cache to prevent duplicate concurrent loads
 * @type {Map<string, Promise>}
 */
const loadingPromises = new Map();

/**
 * Component Profile Config composable
 *
 * @param {string} componentType - The component type (e.g., 'biography', 'topics')
 * @returns {object} Reactive state and methods for config access
 */
export function useComponentProfileConfig(componentType) {
  const config = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * Load the profile-config.json for this component type
   * Uses caching to prevent redundant loads
   *
   * @returns {Promise<object|null>} The loaded config or null
   */
  const loadConfig = async () => {
    // Return cached config if available
    if (configCache.has(componentType)) {
      config.value = configCache.get(componentType);
      return config.value;
    }

    // If already loading, wait for existing promise
    if (loadingPromises.has(componentType)) {
      try {
        config.value = await loadingPromises.get(componentType);
        return config.value;
      } catch (e) {
        // Fall through to try loading again
      }
    }

    isLoading.value = true;
    error.value = null;

    // Create loading promise
    const loadPromise = (async () => {
      try {
        // Path pattern matching the glob: /components/{type}/profile-config.json
        const expectedPath = `/components/${componentType}/profile-config.json`;

        // Find matching path in registry (try exact match first, then partial)
        let matchingPath = null;
        let registryLoader = null;

        // Exact match
        if (configRegistry[expectedPath]) {
          matchingPath = expectedPath;
          registryLoader = configRegistry[expectedPath];
        }

        // Partial match fallback (handle different path formats)
        if (!registryLoader) {
          for (const [regPath, loader] of Object.entries(configRegistry)) {
            if (regPath.includes(`/${componentType}/profile-config.json`)) {
              matchingPath = regPath;
              registryLoader = loader;
              break;
            }
          }
        }

        if (registryLoader) {
          console.log(`[useComponentProfileConfig] Loading config for "${componentType}" from: ${matchingPath}`);
          const module = await registryLoader();
          // Handle both default export and direct module
          const loadedConfig = module.default || module;

          // Validate config structure
          if (loadedConfig && typeof loadedConfig === 'object') {
            configCache.set(componentType, loadedConfig);
            return loadedConfig;
          } else {
            throw new Error(`Invalid config structure for ${componentType}`);
          }
        } else {
          // Config doesn't exist for this component - fallback to embedded configs
          console.log(`[useComponentProfileConfig] No profile config for "${componentType}", using embedded fallback`);
          return null;
        }
      } catch (e) {
        console.warn(`[useComponentProfileConfig] Error loading config for "${componentType}":`, e);
        throw e;
      }
    })();

    loadingPromises.set(componentType, loadPromise);

    try {
      config.value = await loadPromise;
      return config.value;
    } catch (e) {
      error.value = e.message;
      return null;
    } finally {
      isLoading.value = false;
      loadingPromises.delete(componentType);
    }
  };

  /**
   * Get field mappings from the loaded config
   * @returns {object|null} The fieldMappings object or null
   */
  const getFieldMappings = () => {
    return config.value?.fieldMappings || null;
  };

  /**
   * Get profile integration settings
   * @returns {object} Integration settings with defaults
   */
  const getIntegrationSettings = () => {
    return {
      enabled: config.value?.profileIntegration?.enabled ?? false,
      autoPopulate: config.value?.profileIntegration?.autoPopulate ?? false,
      showBadges: config.value?.profileIntegration?.showBadges ?? false
    };
  };

  /**
   * Check if this component supports profile pre-population
   * @returns {boolean}
   */
  const supportsPrePopulation = () => {
    return config.value?.profileIntegration?.enabled === true;
  };

  /**
   * Check if auto-populate is enabled for this component
   * @returns {boolean}
   */
  const shouldAutoPopulate = () => {
    return config.value?.profileIntegration?.autoPopulate === true;
  };

  /**
   * Transform profile data using this component's field mappings
   *
   * @param {object} profileData - Full profile data from WordPress
   * @returns {object} Transformed data for component
   */
  const transformProfileData = (profileData) => {
    const mappings = getFieldMappings();
    if (!mappings || !profileData) {
      return {};
    }
    return ProfileDataTransformer.transform(mappings, profileData);
  };

  /**
   * Get save-back field mappings
   * @returns {object|null} Fields that can be saved back to profile
   */
  const getSaveBackFields = () => {
    return config.value?.saveBackFields || null;
  };

  /**
   * Check if this component supports saving back to profile
   * @returns {boolean}
   */
  const supportsSaveBack = () => {
    const saveBackFields = getSaveBackFields();
    return saveBackFields !== null && Object.keys(saveBackFields).length > 0;
  };

  return {
    // State
    config,
    isLoading,
    error,

    // Methods
    loadConfig,
    getFieldMappings,
    getIntegrationSettings,
    supportsPrePopulation,
    shouldAutoPopulate,
    transformProfileData,
    getSaveBackFields,
    supportsSaveBack
  };
}

/**
 * Get all available component types that have profile configs
 * Useful for debugging and admin interfaces
 *
 * @returns {string[]} Array of component type names
 */
export function getAvailableProfileConfigs() {
  const types = [];
  for (const path of Object.keys(configRegistry)) {
    // Extract component type from path: ../../components/TYPE/profile-config.json
    const match = path.match(/\.\.\/\.\.\/components\/([^/]+)\/profile-config\.json/);
    if (match) {
      types.push(match[1]);
    }
  }
  return types;
}

/**
 * Preload all profile configs
 * Useful for initialization to avoid waterfall loading
 *
 * @returns {Promise<Map<string, object>>} Map of componentType -> config
 */
export async function preloadAllProfileConfigs() {
  const types = getAvailableProfileConfigs();
  const results = new Map();

  await Promise.all(
    types.map(async (type) => {
      const { loadConfig, config } = useComponentProfileConfig(type);
      await loadConfig();
      if (config.value) {
        results.set(type, config.value);
      }
    })
  );

  return results;
}

export default useComponentProfileConfig;
