/**
 * AISaveBridge Service
 *
 * Maps AI tool outputs to profile fields and handles saving.
 * Provides a unified interface for AI tools to save generated content
 * to either profile fields (via Profile API) or component data (via Media Kit store).
 *
 * @since 2.2.0
 */

import profileContextService from './ProfileContextService.js';

/**
 * Field mappings for different AI tool types
 * Maps AI output keys to WordPress meta field names
 */
const FIELD_MAPPINGS = {
  topics: {
    // AI outputs an array of topics
    // Maps to topic_1 through topic_5
    mapToFields: (topics) => {
      const fields = {};
      const topicArray = Array.isArray(topics) ? topics : [topics];

      topicArray.slice(0, 5).forEach((topic, index) => {
        const fieldName = `topic_${index + 1}`;
        // Handle both string and object formats
        fields[fieldName] = typeof topic === 'object'
          ? (topic.title || topic.text || topic.value || '')
          : topic;
      });

      // Clear remaining topic fields if fewer than 5 provided
      for (let i = topicArray.length; i < 5; i++) {
        fields[`topic_${i + 1}`] = '';
      }

      return fields;
    }
  },

  questions: {
    // AI outputs an array of questions
    // Maps to question_1 through question_25
    mapToFields: (questions) => {
      const fields = {};
      const questionsArray = Array.isArray(questions) ? questions : [questions];

      questionsArray.slice(0, 25).forEach((question, index) => {
        const fieldName = `question_${index + 1}`;
        fields[fieldName] = typeof question === 'object'
          ? (question.question || question.text || question.value || '')
          : question;
      });

      // Clear remaining question fields
      for (let i = questionsArray.length; i < 25; i++) {
        fields[`question_${i + 1}`] = '';
      }

      return fields;
    }
  },

  biography: {
    // AI outputs biography object with short, medium, long versions
    mapToFields: (bioData) => {
      const fields = {};

      if (typeof bioData === 'string') {
        fields.biography = bioData;
      } else if (typeof bioData === 'object') {
        if (bioData.short) fields.biography_short = bioData.short;
        if (bioData.medium) fields.biography = bioData.medium;
        if (bioData.long) fields.biography_long = bioData.long;
        // Also support flat structure
        if (bioData.biography) fields.biography = bioData.biography;
        if (bioData.content) fields.biography = bioData.content;
      }

      return fields;
    }
  },

  tagline: {
    mapToFields: (tagline) => ({
      tagline: typeof tagline === 'object' ? tagline.text || tagline.value : tagline
    })
  },

  elevator_pitch: {
    mapToFields: (pitch) => ({
      elevator_pitch: typeof pitch === 'object' ? pitch.text || pitch.value : pitch
    })
  },

  guest_intro: {
    mapToFields: (intro) => ({
      introduction: typeof intro === 'object' ? intro.text || intro.value : intro
    })
  },

  authority_hook: {
    // Authority hook has multiple sub-fields
    mapToFields: (hookData) => {
      const fields = {};

      if (typeof hookData === 'object') {
        if (hookData.who) fields.hook_who = hookData.who;
        if (hookData.what) fields.hook_what = hookData.what;
        if (hookData.when) fields.hook_when = hookData.when;
        if (hookData.how) fields.hook_how = hookData.how;
        if (hookData.statement) fields.authority_statement = hookData.statement;
        if (hookData.summary) fields.authority_hook_summary = hookData.summary;
      }

      return fields;
    }
  },

  offers: {
    // AI outputs array of offers - now uses native Offers CPT
    // This mapping is used for legacy/fallback only
    // Use saveOffersToProfile() method for native offer creation
    mapToFields: (offers) => {
      // For native offers, we don't map to flat fields
      // Instead return empty - use saveOffersToProfile() method
      return {};
    },
    // Native offers require special handling via Offers API
    requiresNativeApi: true
  }
};

/**
 * Helper to get REST API base URL and nonce
 */
const getApiConfig = () => ({
  baseUrl: window.gmkbData?.restUrl || '/wp-json/',
  nonce: window.gmkbData?.restNonce || window.wpApiSettings?.nonce || ''
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

    const mapping = FIELD_MAPPINGS[type];
    if (!mapping) {
      throw new Error(`Unknown AI tool type: ${type}. Available types: ${Object.keys(FIELD_MAPPINGS).join(', ')}`);
    }

    // Handle offers specially - use native Offers API
    if (type === 'offers' && mapping.requiresNativeApi) {
      const result = await this.saveOffersToProfile(profileId, data, options);
      return {
        success: result.success,
        saved: { offers: result.created },
        errors: result.errors
      };
    }

    // Map AI output to profile fields
    const fields = mapping.mapToFields(data);

    console.log(`[AISaveBridge] Saving ${type} to profile #${profileId}:`, fields);

    try {
      const response = await fetch(`/wp-json/gmkb/v2/profile/${profileId}/fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.gmkbData?.nonce || window.wpApiSettings?.nonce || ''
        },
        credentials: 'same-origin',
        body: JSON.stringify({ fields })
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

    // Map AI output to component data format
    const mapping = FIELD_MAPPINGS[type];
    let componentData = {};

    if (mapping) {
      // Use field mapping but convert to component data format
      const fields = mapping.mapToFields(data);

      // Convert field names to component data keys
      switch (type) {
        case 'topics':
          componentData.topics = Object.entries(fields)
            .filter(([key]) => key.startsWith('topic_') && fields[key])
            .map(([key, value]) => ({ title: value }));
          break;

        case 'questions':
          componentData.questions = Object.entries(fields)
            .filter(([key]) => key.startsWith('question_') && fields[key])
            .map(([key, value]) => ({ question: value }));
          break;

        case 'biography':
          componentData = {
            biography: fields.biography || fields.biography_long || '',
            bio: fields.biography || '',
            shortBio: fields.biography_short || ''
          };
          break;

        default:
          // For other types, use fields directly
          componentData = fields;
      }
    } else {
      // No mapping, use data directly
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
   */
  getAvailableTypes() {
    return Object.keys(FIELD_MAPPINGS);
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
export { AISaveBridge, FIELD_MAPPINGS };
