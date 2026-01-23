/**
 * Profile Data Integration - Self-Contained Architecture Compliant
 *
 * This integration respects the self-contained component architecture:
 * - Each component defines its own data needs in /components/[name]/profile-config.json
 * - This class acts as a bridge between profile data and components
 * - No hardcoded field mappings here
 *
 * NOTE: Despite referencing "profile_data" in variable names (legacy), this class
 * works with native WordPress post_meta. The data source is abstracted in PHP
 * via gmkb_get_profile_data() which falls back to gmkb_get_native_meta_data()
 * when the Pods plugin is not installed.
 *
 * @since 2.5.0 Renamed from PodsDataIntegration to ProfileDataIntegration
 */

export class ProfileDataIntegration {
  constructor() {
    this.profileData = this.getProfileDataSource();

    if (Object.keys(this.profileData).length > 0) {
      console.log('[ProfileDataIntegration] Profile data available:', Object.keys(this.profileData).length, 'fields');
    }
  }

  /**
   * Get profile data from WordPress
   * Single source of truth for where profile data lives
   * Note: The variable name "profile_data" is legacy - data may come from native post_meta
   */
  getProfileDataSource() {
    return window.gmkbData?.profile_data || window.gmkbVueData?.profile_data || {};
  }

  /**
   * Get component's field configuration
   * Each component defines its own needs in profile-config.json
   */
  getComponentFieldConfig(componentType) {
    // First, try to get from the component's actual config if passed from PHP
    if (window.gmkbComponentConfigs && window.gmkbComponentConfigs[componentType]) {
      const config = window.gmkbComponentConfigs[componentType];
      if (config.profile_config) {
        return config.profile_config;
      }
    }

    // Check the actual registry singleton (window.gmkbComponentRegistry)
    if (window.gmkbComponentRegistry) {
      const component = window.gmkbComponentRegistry.get(componentType);
      if (component && component.profile_config) {
        return component.profile_config;
      }
    }

    // No config found - component should define its own profile-config.json
    return null;
  }

  /**
   * Transform profile data based on component's configuration
   * Added comprehensive error handling and null safety
   */
  transformProfileData(config, profileData) {
    const result = {};

    // Validate inputs
    if (!config || !config.fields || typeof config.fields !== 'object') {
      console.warn('[ProfileDataIntegration] Invalid config structure:', config);
      return result;
    }

    if (!profileData || typeof profileData !== 'object') {
      console.warn('[ProfileDataIntegration] Invalid profileData structure');
      return result;
    }

    // Wrap field processing in try-catch for each field
    for (const [targetField, sourceConfig] of Object.entries(config.fields)) {
      try {
      if (typeof sourceConfig === 'object' && sourceConfig.type === 'composite') {
        // Handle composite fields (like full name)
        let value = sourceConfig.format;
        for (const field of sourceConfig.fields) {
          const fieldValue = profileData[field] || '';
          value = value.replace(`{${field}}`, fieldValue);
        }
        result[targetField] = value.trim();
      } else if (typeof sourceConfig === 'object' && sourceConfig.type === 'array') {
        // Handle array fields (like topics)
        const values = [];
        for (const field of sourceConfig.fields) {
          if (profileData[field]) {
            values.push(profileData[field]);
          }
        }
        result[targetField] = values;
      } else {
        // Handle simple field mapping (with fallbacks)
        const possibleFields = Array.isArray(sourceConfig) ? sourceConfig : [sourceConfig];
        for (const field of possibleFields) {
          if (profileData[field]) {
            result[targetField] = profileData[field];
            break;
          }
        }
      }
      } catch (fieldError) {
        // Log but continue processing other fields
        console.warn(`[ProfileDataIntegration] Error processing field ${targetField}:`, fieldError);
        // Continue to next field
      }
    }

    return result;
  }

  /**
   * DEPRECATED: Enrich component with profile data
   *
   * This method has been disabled to fix a critical data loss bug.
   *
   * BACKGROUND:
   * The "Write Arc" (component-field-sync.php) was broken due to an action hook typo:
   * - API fires: 'gmkb_after_save_mediakit' (no underscore)
   * - Sync listened for: 'gmkb_after_save_media_kit' (with underscore)
   *
   * This meant profile fields were NEVER being updated when users saved.
   * However, this "Read Arc" (enrichment) WAS active, causing stale profile data
   * to overwrite valid JSON state on every load - DATA LOSS.
   *
   * SOLUTION: The JSON state (gmkb_media_kit_state) is now the single source of truth.
   * This method now returns the component unchanged as a safety net.
   *
   * @deprecated Since 2.2.0 - JSON state is now single source of truth
   * @param {Object} component - The component to enrich (returned unchanged)
   * @returns {Object} The component, unchanged
   */
  enrichComponentData(component) {
    // DEPRECATED: Return component unchanged
    // This is a no-op safety net in case any code still calls this method
    console.warn('[ProfileDataIntegration] DEPRECATED: enrichComponentData() is disabled. JSON state is now single source of truth.');
    return component;
  }

  /**
   * Get pre-populated data for a NEW component being added
   *
   * Unlike enrichComponentData (which was used for loading existing components),
   * this method is specifically for PRE-POPULATING new components from profile data.
   *
   * This is safe because:
   * - It only affects NEW components being added to the builder
   * - User can still edit/override the pre-populated values
   * - It doesn't overwrite existing saved component data
   *
   * @param {string} componentType - The component type (e.g., 'biography', 'topics')
   * @returns {Object} Pre-populated data object for the component
   */
  getPrePopulatedData(componentType) {
    if (!componentType) {
      console.warn('[ProfileDataIntegration] getPrePopulatedData: No component type provided');
      return {};
    }

    // Get fresh profile data from window (in case it was updated)
    const profileData = this.getProfileDataSource();

    if (!profileData || Object.keys(profileData).length === 0) {
      console.log('[ProfileDataIntegration] getPrePopulatedData: No profile data available');
      return {};
    }

    // Get the component's config
    const config = this.getComponentFieldConfig(componentType);

    if (!config) {
      console.log(`[ProfileDataIntegration] getPrePopulatedData: No config for component type "${componentType}"`);
      return {};
    }

    // Transform the profile data into component data format
    const transformedData = this.transformProfileData(config, profileData);

    console.log(`[ProfileDataIntegration] Pre-populated data for "${componentType}":`, transformedData);

    return transformedData;
  }

  /**
   * Get all available profile data (for editors that need access to full profile)
   *
   * @returns {Object} Full profile data
   */
  getProfileData() {
    return this.getProfileDataSource();
  }

  /**
   * Get specific field value from profile data
   * Supports fallback field names (e.g., ['biography', 'guest_biography', 'bio'])
   *
   * @param {string|string[]} fieldNames - Field name or array of fallback field names
   * @returns {*} The field value or null
   */
  getProfileField(fieldNames) {
    const profileData = this.getProfileDataSource();

    if (!profileData || Object.keys(profileData).length === 0) {
      return null;
    }

    const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];

    for (const field of fields) {
      if (profileData[field] !== undefined && profileData[field] !== null && profileData[field] !== '') {
        return profileData[field];
      }
    }

    return null;
  }

  /**
   * Check if a specific field has data in the profile
   *
   * @param {string|string[]} fieldNames - Field name or array of fallback field names
   * @returns {boolean}
   */
  hasProfileField(fieldNames) {
    return this.getProfileField(fieldNames) !== null;
  }

  /**
   * Check if profile data is available
   */
  hasProfileData() {
    return Object.keys(this.profileData).length > 0;
  }
}

// Create singleton instance
const profileDataIntegration = new ProfileDataIntegration();

export default profileDataIntegration;
