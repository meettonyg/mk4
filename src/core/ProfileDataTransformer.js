/**
 * ProfileDataTransformer - Transformation Utility
 *
 * Static utility class for transforming profile data based on component
 * field mappings defined in profile-config.json files.
 *
 * This class contains the transformation logic extracted from ProfileDataIntegration,
 * making it a pure transformation utility without any data storage responsibility.
 *
 * @package GMKB
 * @subpackage Core
 * @since 2.6.0
 *
 * @example
 * import { ProfileDataTransformer } from '../core/ProfileDataTransformer.js';
 *
 * const fieldMappings = {
 *   biography: { profileFields: ['biography', 'bio'], type: 'text' },
 *   name: { type: 'composite', fields: ['first_name', 'last_name'], format: '{first_name} {last_name}' }
 * };
 *
 * const profileData = { first_name: 'John', last_name: 'Doe', biography: 'Expert...' };
 * const result = ProfileDataTransformer.transform(fieldMappings, profileData);
 * // { biography: 'Expert...', name: 'John Doe' }
 */

export class ProfileDataTransformer {
  /**
   * Transform profile data using component's field mappings
   *
   * Supports three field mapping types:
   * - Simple: Array of profile field names with fallbacks
   * - Composite: Combines multiple fields using a format string
   * - Array: Collects values from numbered fields (e.g., topic_1, topic_2)
   *
   * @param {object} fieldMappings - From profile-config.json fieldMappings
   * @param {object} profileData - Full profile data from WordPress
   * @returns {object} Transformed data for component use
   */
  static transform(fieldMappings, profileData) {
    if (!fieldMappings || typeof fieldMappings !== 'object') {
      console.warn('[ProfileDataTransformer] Invalid fieldMappings:', fieldMappings);
      return {};
    }

    if (!profileData || typeof profileData !== 'object') {
      console.warn('[ProfileDataTransformer] Invalid profileData');
      return {};
    }

    const result = {};

    for (const [componentField, mapping] of Object.entries(fieldMappings)) {
      try {
        const value = this.resolveMapping(mapping, profileData);

        // Only include non-empty values
        if (value !== null && value !== undefined && value !== '') {
          // For arrays, only include if there's at least one item
          if (Array.isArray(value) && value.length === 0) {
            continue;
          }
          result[componentField] = value;
        }
      } catch (fieldError) {
        console.warn(`[ProfileDataTransformer] Error processing field "${componentField}":`, fieldError);
        // Continue to next field
      }
    }

    return result;
  }

  /**
   * Resolve a single field mapping to its value
   *
   * @param {object|array} mapping - The field mapping configuration
   * @param {object} profileData - Full profile data
   * @returns {*} Resolved value
   */
  static resolveMapping(mapping, profileData) {
    // Handle different mapping types
    if (typeof mapping === 'object' && mapping !== null) {
      if (mapping.type === 'composite') {
        return this.resolveComposite(mapping, profileData);
      } else if (mapping.type === 'array') {
        return this.resolveArray(mapping, profileData);
      } else if (mapping.profileFields) {
        // Standard mapping with profileFields array
        return this.resolveField(mapping.profileFields, profileData);
      }
    }

    // Legacy format: direct array of field names
    if (Array.isArray(mapping)) {
      return this.resolveField(mapping, profileData);
    }

    // String field name
    if (typeof mapping === 'string') {
      return profileData[mapping] || null;
    }

    return null;
  }

  /**
   * Resolve a simple field with fallbacks
   *
   * @param {string[]} fieldNames - Array of field names to try in order
   * @param {object} profileData - Profile data object
   * @returns {*} First non-empty value found, or null
   */
  static resolveField(fieldNames, profileData) {
    if (!Array.isArray(fieldNames)) {
      fieldNames = [fieldNames];
    }

    for (const fieldName of fieldNames) {
      const value = profileData[fieldName];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }

    return null;
  }

  /**
   * Resolve a composite field (combines multiple fields)
   *
   * @param {object} mapping - Composite mapping config
   * @param {object} mapping.fields - Array of field names to combine
   * @param {string} mapping.format - Format string with {fieldName} placeholders
   * @param {object} profileData - Profile data object
   * @returns {string} Formatted composite value
   */
  static resolveComposite(mapping, profileData) {
    if (!mapping.fields || !Array.isArray(mapping.fields)) {
      console.warn('[ProfileDataTransformer] Composite mapping missing fields array');
      return null;
    }

    // Check if any of the composite fields have values
    const hasAnyValue = mapping.fields.some(
      field => profileData[field] !== undefined &&
               profileData[field] !== null &&
               profileData[field] !== ''
    );

    if (!hasAnyValue) {
      return null;
    }

    // Use format string if provided
    if (mapping.format) {
      let result = mapping.format;
      for (const field of mapping.fields) {
        const value = profileData[field] || '';
        result = result.replace(new RegExp(`\\{${field}\\}`, 'g'), value);
      }
      return result.trim();
    }

    // Default: join with space
    const values = mapping.fields
      .map(field => profileData[field] || '')
      .filter(v => v !== '');

    return values.join(' ');
  }

  /**
   * Resolve an array field (collects from numbered fields)
   *
   * @param {object} mapping - Array mapping config
   * @param {string[]} mapping.fields - Array of field names to collect from
   * @param {string} mapping.filter - Filter type ('non-empty' to exclude empty values)
   * @param {object} profileData - Profile data object
   * @returns {array} Array of collected values
   */
  static resolveArray(mapping, profileData) {
    if (!mapping.fields || !Array.isArray(mapping.fields)) {
      console.warn('[ProfileDataTransformer] Array mapping missing fields array');
      return [];
    }

    const values = [];

    for (const field of mapping.fields) {
      const value = profileData[field];

      if (mapping.filter === 'non-empty') {
        // Only include non-empty values
        if (value !== undefined && value !== null && value !== '') {
          values.push(value);
        }
      } else {
        // Include all values (even empty ones)
        values.push(value || null);
      }
    }

    return values;
  }

  /**
   * Transform component data back to profile format for saving
   *
   * @param {object} componentData - Data from the component
   * @param {object} saveBackFields - From profile-config.json saveBackFields
   * @returns {object} Data formatted for saving to profile
   */
  static transformForSave(componentData, saveBackFields) {
    if (!saveBackFields || typeof saveBackFields !== 'object') {
      return {};
    }

    if (!componentData || typeof componentData !== 'object') {
      return {};
    }

    const result = {};

    for (const [componentField, profileMapping] of Object.entries(saveBackFields)) {
      const value = componentData[componentField];

      if (value === undefined || value === null) {
        continue;
      }

      if (typeof profileMapping === 'string') {
        // Simple string mapping: componentField -> profileField
        result[profileMapping] = value;
      } else if (typeof profileMapping === 'object') {
        if (profileMapping.type === 'array' && Array.isArray(value)) {
          // Array mapping: distribute array values to numbered fields
          const targetFields = profileMapping.targetFields || [];
          value.forEach((item, index) => {
            if (targetFields[index]) {
              result[targetFields[index]] = item;
            }
          });
        } else if (profileMapping.targetField) {
          // Object with targetField
          result[profileMapping.targetField] = value;
        }
      }
    }

    return result;
  }

  /**
   * Validate a profile-config.json structure
   *
   * @param {object} config - The config object to validate
   * @returns {object} Validation result with { valid: boolean, errors: string[] }
   */
  static validateConfig(config) {
    const errors = [];

    if (!config || typeof config !== 'object') {
      return { valid: false, errors: ['Config must be an object'] };
    }

    // Check profileIntegration
    if (config.profileIntegration) {
      if (typeof config.profileIntegration !== 'object') {
        errors.push('profileIntegration must be an object');
      }
    }

    // Check fieldMappings
    if (config.fieldMappings) {
      if (typeof config.fieldMappings !== 'object') {
        errors.push('fieldMappings must be an object');
      } else {
        for (const [field, mapping] of Object.entries(config.fieldMappings)) {
          if (typeof mapping === 'object' && mapping !== null) {
            if (mapping.type === 'composite' && !mapping.fields) {
              errors.push(`Composite field "${field}" missing fields array`);
            }
            if (mapping.type === 'array' && !mapping.fields) {
              errors.push(`Array field "${field}" missing fields array`);
            }
            if (!mapping.type && !mapping.profileFields && !Array.isArray(mapping)) {
              errors.push(`Field "${field}" has invalid mapping structure`);
            }
          }
        }
      }
    }

    // Check saveBackFields
    if (config.saveBackFields) {
      if (typeof config.saveBackFields !== 'object') {
        errors.push('saveBackFields must be an object');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default ProfileDataTransformer;
