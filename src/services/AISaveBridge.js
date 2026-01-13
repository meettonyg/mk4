/**
 * AISaveBridge Service
 *
 * Maps AI tool outputs to profile fields and handles saving.
 * Provides a unified interface for AI tools to save generated content
 * to either profile fields (via Profile API) or component data (via Media Kit store).
 *
 * Field mappings are now defined in each tool's meta.json for tool independence.
 *
 * @since 2.2.0
 */

import profileContextService from './ProfileContextService.js';
import { toolModules } from '../../tools/index.js';

/**
 * Get field mapping configuration from a tool's meta.json
 * @param {string} type - The API type (e.g., 'biography', 'topics')
 * @returns {Object|null} Field mapping config or null if not found
 */
function getFieldMappingConfig(type) {
  // Find the tool module by apiType
  for (const [slug, module] of Object.entries(toolModules)) {
    if (module.meta?.apiType === type && module.meta?.fieldMapping) {
      return module.meta.fieldMapping;
    }
  }
  return null;
}

/**
 * Apply field mapping based on declarative config from tool meta
 * @param {Object} config - Field mapping configuration from meta.json
 * @param {*} data - The AI-generated data to map
 * @returns {Object} Mapped fields
 */
function applyFieldMapping(config, data) {
  if (!config) return {};

  const fields = {};

  switch (config.type) {
    case 'simple': {
      // Simple 1:1 mapping to a single target field
      const targetField = config.targetField;
      const sourceKeys = config.sourceKeys || ['text', 'value'];

      if (typeof data === 'string') {
        fields[targetField] = data;
      } else if (typeof data === 'object' && data !== null) {
        // Try each source key in order
        for (const key of sourceKeys) {
          if (data[key]) {
            fields[targetField] = data[key];
            break;
          }
        }
        // Fallback to first non-empty value
        if (!fields[targetField]) {
          const firstValue = Object.values(data).find(v => v && typeof v === 'string');
          if (firstValue) fields[targetField] = firstValue;
        }
      }
      break;
    }

    case 'indexed_array': {
      // Map array to indexed fields (e.g., topic_1, topic_2, ...)
      const prefix = config.prefix;
      const maxItems = config.maxItems || 10;
      const sourceKeys = config.sourceKeys || ['text', 'value'];

      const dataArray = Array.isArray(data) ? data : [data];

      dataArray.slice(0, maxItems).forEach((item, index) => {
        const fieldName = `${prefix}${index + 1}`;
        if (typeof item === 'string') {
          fields[fieldName] = item;
        } else if (typeof item === 'object' && item !== null) {
          // Try each source key in order
          for (const key of sourceKeys) {
            if (item[key]) {
              fields[fieldName] = item[key];
              break;
            }
          }
        }
      });

      // Clear remaining fields
      for (let i = dataArray.length; i < maxItems; i++) {
        fields[`${prefix}${i + 1}`] = '';
      }
      break;
    }

    case 'object': {
      // Map object keys to specific field names
      const fieldMap = config.fields || {};

      if (typeof data === 'string') {
        // If string, try to find a default field
        const defaultField = Object.values(fieldMap)[0];
        if (defaultField) fields[defaultField] = data;
      } else if (typeof data === 'object' && data !== null) {
        for (const [sourceKey, targetField] of Object.entries(fieldMap)) {
          if (data[sourceKey]) {
            fields[targetField] = data[sourceKey];
          }
        }
      }
      break;
    }

    case 'native_api': {
      // Native API types (like offers) return empty - use specialized save methods
      break;
    }

    default:
      console.warn(`[AISaveBridge] Unknown field mapping type: ${config.type}`);
  }

  return fields;
}

/**
 * Check if a tool type requires native API handling
 * @param {string} type - The API type
 * @returns {boolean}
 */
function requiresNativeApi(type) {
  const config = getFieldMappingConfig(type);
  return config?.type === 'native_api';
}

/**
 * Legacy fallback mappings for types not yet migrated to tool meta
 * These handle non-tool types like 'contact' and 'social'
 */
const LEGACY_MAPPINGS = {
  contact: {
    mapToFields: (contactData) => {
      const fields = {};
      if (typeof contactData === 'object') {
        if (contactData.email) fields.email = contactData.email;
        if (contactData.phone) fields.phone = contactData.phone;
        if (contactData.location) fields.location = contactData.location;
        if (contactData.website) fields.website = contactData.website;
      }
      return fields;
    }
  },

  social: {
    mapToFields: (socialData) => {
      const fields = {};
      if (typeof socialData === 'object') {
        if (socialData.linkedin) fields.linkedin = socialData.linkedin;
        if (socialData.twitter) fields.twitter = socialData.twitter;
        if (socialData.facebook) fields.facebook = socialData.facebook;
        if (socialData.instagram) fields.instagram = socialData.instagram;
        if (socialData.youtube) fields.youtube = socialData.youtube;
        if (socialData.tiktok) fields.tiktok = socialData.tiktok;
        if (socialData.github) fields.github = socialData.github;
        if (socialData.medium) fields.medium = socialData.medium;
        if (socialData.website) fields.website = socialData.website;
      }
      return fields;
    }
  }
};

/**
 * Map AI output to profile fields using tool-defined configuration
 * @param {string} type - The API type
 * @param {*} data - AI-generated data
 * @returns {Object} Mapped fields
 */
function mapToFields(type, data) {
  // First try tool-defined field mapping from meta.json
  const config = getFieldMappingConfig(type);
  if (config) {
    return applyFieldMapping(config, data);
  }

  // Fall back to legacy mappings for non-tool types
  const legacyMapping = LEGACY_MAPPINGS[type];
  if (legacyMapping?.mapToFields) {
    return legacyMapping.mapToFields(data);
  }

  console.warn(`[AISaveBridge] No field mapping found for type: ${type}`);
  return {};
}

/**
 * Helper to get REST API base URL and nonce
 * Supports multiple WordPress configurations (builder, standalone tools, legacy MKCG, etc.)
 */
const getApiConfig = () => ({
  baseUrl: window.gmkbData?.restUrl || window.gmkbStandaloneTools?.restUrl || '/wp-json/',
  nonce: window.gmkbData?.restNonce || window.gmkbData?.nonce || window.gmkbStandaloneTools?.restNonce || window.mkcg_vars?.restNonce || window.wpApiSettings?.nonce || ''
});

class AISaveBridge {
  constructor() {
    this._lastSaveResult = null;
  }

  /**
   * Save AI-generated offers to native Offers CPT and link to profile
   *
   * Creates offer posts via the Offers API and links them to the specified profile.
   * This is the preferred method for saving AI-generated offers.
   *
   * @param {number} profileId - The profile/post ID to link offers to
   * @param {Array} offers - Array of offer objects from AI generation
   * @param {Object} options - Additional options
   * @param {boolean} options.replaceExisting - Replace existing offers (default: false, appends)
   * @param {string} options.defaultType - Default offer type if not specified (gift, prize, deal)
   * @returns {Promise<{success: boolean, created: Array, linked: Array, errors: Array}>}
   */
  async saveOffersToProfile(profileId, offers, options = {}) {
    if (!profileId) {
      throw new Error('Profile ID is required');
    }

    const offersArray = Array.isArray(offers) ? offers : [offers];
    if (offersArray.length === 0) {
      return { success: true, created: [], linked: [], errors: [] };
    }

    const { baseUrl, nonce } = getApiConfig();
    const apiBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

    const createdOffers = [];
    const errors = [];

    console.log(`[AISaveBridge] Creating ${offersArray.length} native offers for profile #${profileId}`);

    // Step 1: Create each offer as a native gmkb_offer post
    for (const offerData of offersArray) {
      try {
        // Map AI output fields to offer API format
        const offerPayload = {
          title: offerData.title || offerData.name || 'Untitled Offer',
          description: offerData.description || '',
          type: offerData.type || options.defaultType || 'gift',
          status: 'publish',
          // Map additional fields
          format: offerData.format || '',
          cta_text: offerData.cta_text || offerData.ctaText || offerData.cta || 'Learn More',
          url: offerData.url || offerData.link || '',
          retail_value: offerData.retail_value || offerData.retailValue || offerData.value || null,
          code: offerData.code || offerData.promoCode || '',
          expiry_date: offerData.expiry_date || offerData.expiryDate || '',
          // Package/tier specific (from AI packages generator)
          ...(offerData.deliverables && {
            redemption_instructions: Array.isArray(offerData.deliverables)
              ? offerData.deliverables.join('\n- ')
              : offerData.deliverables
          }),
          ...(offerData.idealClient && {
            notes: `Ideal for: ${offerData.idealClient}`
          })
        };

        const response = await fetch(`${apiBase}gmkb/v2/offers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': nonce
          },
          credentials: 'same-origin',
          body: JSON.stringify(offerPayload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.offer) {
          createdOffers.push(result.offer);
          console.log(`[AISaveBridge] Created offer #${result.offer.id}: ${result.offer.title}`);
        }
      } catch (err) {
        console.error('[AISaveBridge] Failed to create offer:', err);
        errors.push(`Failed to create offer "${offerData.title}": ${err.message}`);
      }
    }

    // Step 2: Link created offers to the profile
    if (createdOffers.length > 0) {
      try {
        const newOfferIds = createdOffers.map(o => o.id);

        // Get existing linked offers if not replacing
        let allOfferIds = newOfferIds;
        if (!options.replaceExisting) {
          const existingResponse = await fetch(`${apiBase}gmkb/v2/profiles/${profileId}/offers`, {
            headers: { 'X-WP-Nonce': nonce },
            credentials: 'same-origin'
          });
          if (existingResponse.ok) {
            const existingData = await existingResponse.json();
            const existingIds = (existingData.offers || []).map(o => o.id);
            // Use Set to deduplicate IDs in case an offer is already linked
            allOfferIds = [...new Set([...existingIds, ...newOfferIds])];
          }
        }

        // Update profile's associated offers
        const linkResponse = await fetch(`${apiBase}gmkb/v2/profiles/${profileId}/offers`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': nonce
          },
          credentials: 'same-origin',
          body: JSON.stringify({ offer_ids: allOfferIds })
        });

        if (!linkResponse.ok) {
          const errorData = await linkResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${linkResponse.status}`);
        }

        console.log(`[AISaveBridge] Linked ${newOfferIds.length} offers to profile #${profileId}`);

      } catch (err) {
        console.error('[AISaveBridge] Failed to link offers to profile:', err);
        errors.push(`Failed to link offers to profile: ${err.message}`);
      }
    }

    const success = createdOffers.length > 0 && errors.length === 0;

    this._lastSaveResult = {
      success,
      profileId,
      type: 'offers',
      created: createdOffers,
      errors,
      timestamp: Date.now()
    };

    // Dispatch success event
    if (success) {
      document.dispatchEvent(new CustomEvent('gmkb:ai-offers-saved', {
        detail: { profileId, offers: createdOffers }
      }));
    }

    return {
      success,
      created: createdOffers,
      linked: createdOffers.map(o => o.id),
      errors
    };
  }

  /**
   * Save AI-generated content to a profile
   *
   * @param {number} profileId - The profile/post ID to save to
   * @param {string} type - The AI tool type (topics, biography, questions, etc.)
   * @param {*} data - The AI-generated data to save
   * @param {Object} options - Additional options passed to specialized save methods
   * @returns {Promise<{success: boolean, saved: Object, errors: Array}>}
   */
  async saveToProfile(profileId, type, data, options = {}) {
    if (!profileId) {
      throw new Error('Profile ID is required');
    }

    // Handle offers specially - use native Offers API
    if (requiresNativeApi(type)) {
      const result = await this.saveOffersToProfile(profileId, data, options);
      return {
        success: result.success,
        saved: { offers: result.created },
        errors: result.errors
      };
    }

    // Map AI output to profile fields using tool-defined configuration
    const fields = mapToFields(type, data);

    if (Object.keys(fields).length === 0) {
      console.warn(`[AISaveBridge] No fields mapped for type: ${type}`);
    }

    console.log(`[AISaveBridge] Saving ${type} to profile #${profileId}:`, fields);

    try {
      const { baseUrl, nonce } = getApiConfig();
      const apiBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

      const response = await fetch(`${apiBase}gmkb/v2/profile/${profileId}/fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        credentials: 'same-origin',
        body: JSON.stringify(fields)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();

      this._lastSaveResult = {
        success: true,
        profileId,
        type,
        saved: fields,
        timestamp: Date.now()
      };

      // Dispatch success event
      document.dispatchEvent(new CustomEvent('gmkb:ai-content-saved', {
        detail: { profileId, type, fields }
      }));

      console.log(`[AISaveBridge] ✅ Successfully saved ${type} to profile #${profileId}`);

      return {
        success: true,
        saved: fields,
        errors: []
      };

    } catch (error) {
      console.error(`[AISaveBridge] ❌ Failed to save ${type}:`, error);

      this._lastSaveResult = {
        success: false,
        profileId,
        type,
        error: error.message,
        timestamp: Date.now()
      };

      return {
        success: false,
        saved: {},
        errors: [error.message]
      };
    }
  }

  /**
   * Save AI-generated content to a component in the Media Kit Builder
   * This updates the JSON state, not profile fields
   *
   * @param {Object} store - The mediaKit Pinia store
   * @param {string} componentId - The component ID to update
   * @param {string} type - The AI tool type
   * @param {*} data - The AI-generated data
   * @returns {{success: boolean, updated: Object}}
   */
  saveToComponent(store, componentId, type, data) {
    if (!store || !componentId) {
      throw new Error('Store and componentId are required');
    }

    const component = store.components[componentId];
    if (!component) {
      throw new Error(`Component not found: ${componentId}`);
    }

    // Map AI output to profile fields using tool-defined configuration
    const fields = mapToFields(type, data);
    let componentData = {};

    // Get field mapping config to understand structure
    const config = getFieldMappingConfig(type);

    if (config) {
      // Convert mapped fields to component data format based on mapping type
      switch (config.type) {
        case 'indexed_array': {
          // Convert indexed fields back to array for component storage
          const prefix = config.prefix;
          const items = Object.entries(fields)
            .filter(([key]) => key.startsWith(prefix) && fields[key])
            .sort(([a], [b]) => {
              const numA = parseInt(a.replace(prefix, ''), 10);
              const numB = parseInt(b.replace(prefix, ''), 10);
              return numA - numB;
            })
            .map(([, value]) => {
              // Use first sourceKey as the property name
              const keyName = config.sourceKeys?.[0] || 'text';
              return { [keyName]: value };
            });
          // Use type as the property name (e.g., 'topics', 'questions')
          componentData[type] = items;
          break;
        }

        case 'object':
          // For object mappings like biography, use mapped fields directly
          componentData = { ...fields };
          break;

        default:
          // For simple and other types, use fields directly
          componentData = fields;
      }
    } else {
      // No mapping config, use data directly
      componentData = typeof data === 'object' ? data : { content: data };
    }

    // Update component in store
    store.updateComponent(componentId, {
      data: {
        ...component.data,
        ...componentData
      }
    });

    store.isDirty = true;

    console.log(`[AISaveBridge] ✅ Updated component ${componentId} with ${type} data`);

    return {
      success: true,
      updated: componentData
    };
  }

  /**
   * Smart save - automatically determines where to save based on context
   *
   * @param {string} type - AI tool type
   * @param {*} data - AI-generated data
   * @param {Object} options - Options
   * @param {Object} options.store - Media Kit store (for builder context)
   * @param {string} options.componentId - Component ID (for builder context)
   * @param {number} options.profileId - Profile ID (overrides context detection)
   * @returns {Promise<{success: boolean, target: string, result: Object}>}
   */
  async smartSave(type, data, options = {}) {
    const context = profileContextService.getContext();
    const profileId = options.profileId || profileContextService.getCurrentProfileId();

    // In Media Kit Builder with component context - save to component
    if (context === 'media-kit' && options.store && options.componentId) {
      const result = this.saveToComponent(options.store, options.componentId, type, data);
      return {
        success: result.success,
        target: 'component',
        result
      };
    }

    // In Profile Editor or standalone - save to profile
    if (profileId) {
      const result = await this.saveToProfile(profileId, type, data);
      return {
        success: result.success,
        target: 'profile',
        result
      };
    }

    // No context - require profile selection
    throw new Error('No profile selected. Please select a profile before saving.');
  }

  /**
   * Get available field mappings (for documentation/debugging)
   * Now reads from tool meta files for tool independence
   */
  getAvailableTypes() {
    const types = [];
    for (const [, module] of Object.entries(toolModules)) {
      if (module.meta?.apiType && module.meta?.fieldMapping) {
        types.push(module.meta.apiType);
      }
    }
    // Add legacy types
    types.push(...Object.keys(LEGACY_MAPPINGS));
    return types;
  }

  /**
   * Get the last save result
   */
  getLastSaveResult() {
    return this._lastSaveResult;
  }
}

// Singleton instance
const aiSaveBridge = new AISaveBridge();

export default aiSaveBridge;
export { AISaveBridge, getFieldMappingConfig, applyFieldMapping, mapToFields };
