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

    // Otherwise, return embedded configs that match what's in the component folders
    // This is a fallback - in production, these should come from the actual files
    const configs = this.getEmbeddedConfigs();
    return configs[componentType] || null;
  }

  /**
   * @deprecated 2.6.0 - Embedded configs are deprecated in favor of component-level profile-config.json files.
   * Components should define their own profile integration config in:
   *   components/{type}/profile-config.json
   *
   * These embedded configs are kept as a fallback for backward compatibility.
   * They will be removed in a future version once all components have migrated.
   *
   * Migration: Create a profile-config.json in your component's directory.
   * See components/biography/profile-config.json for an example.
   */
  getEmbeddedConfigs() {
    console.warn('[ProfileDataIntegration] Using deprecated embedded configs. Components should use profile-config.json instead.');
    return {
      biography: {
        dataSource: "profile",
        fields: {
          biography: ["biography", "guest_biography", "bio"],
          name: {
            type: "composite",
            fields: ["first_name", "last_name"],
            format: "{first_name} {last_name}"
          },
          title: ["guest_title", "professional_title", "title"],
          image: ["guest_photo", "profile_image", "photo"]
        }
      },
      hero: {
        dataSource: "profile",
        fields: {
          title: {
            type: "composite",
            fields: ["first_name", "last_name"],
            format: "{first_name} {last_name}"
          },
          subtitle: ["guest_title", "tagline", "professional_title"],
          description: ["tagline", "introduction", "bio_short"]
        }
      },
      contact: {
        dataSource: "profile",
        fields: {
          email: ["email", "contact_email"],
          phone: ["phone", "contact_phone"],
          skype: ["skype", "skype_handle", "skype_id"],
          location: ["location", "address", "city", "full_address"]
        }
      },
      topics: {
        dataSource: "profile",
        fields: {
          topics: {
            type: "array",
            fields: ["topic_1", "topic_2", "topic_3", "topic_4", "topic_5"],
            filter: "non-empty"
          }
        }
      },
      questions: {
        dataSource: "profile",
        fields: {
          questions: {
            type: "array",
            fields: [
              "question_1", "question_2", "question_3", "question_4", "question_5",
              "question_6", "question_7", "question_8", "question_9", "question_10",
              "question_11", "question_12", "question_13", "question_14", "question_15",
              "question_16", "question_17", "question_18", "question_19", "question_20",
              "question_21", "question_22", "question_23", "question_24", "question_25"
            ],
            filter: "non-empty"
          }
        }
      },
      'guest-intro': {
        dataSource: "profile",
        fields: {
          first_name: ["first_name", "fname"],
          last_name: ["last_name", "lname"],
          full_name: {
            type: "composite",
            fields: ["first_name", "last_name"],
            format: "{first_name} {last_name}"
          },
          title: ["guest_title", "professional_title", "job_title"],
          company: ["company", "organization", "employer"],
          introduction: ["introduction", "intro", "guest_intro"],
          tagline: ["tagline", "slogan", "motto"]
        }
      },
      'topics-questions': {
        dataSource: "profile",
        fields: {
          topics: {
            type: "array",
            fields: ["topic_1", "topic_2", "topic_3", "topic_4", "topic_5"],
            filter: "non-empty"
          },
          questions: {
            type: "array",
            fields: [
              "question_1", "question_2", "question_3", "question_4", "question_5",
              "question_6", "question_7", "question_8", "question_9", "question_10",
              "question_11", "question_12", "question_13", "question_14", "question_15",
              "question_16", "question_17", "question_18", "question_19", "question_20",
              "question_21", "question_22", "question_23", "question_24", "question_25"
            ],
            filter: "non-empty"
          }
        }
      },
      social: {
        dataSource: "profile",
        fields: {
          linkedin: ["linkedin", "linkedin_url", "linkedin_profile"],
          twitter: ["twitter", "twitter_handle", "twitter_url", "x_handle"],
          facebook: ["facebook", "facebook_url", "facebook_page"],
          instagram: ["instagram", "instagram_handle", "instagram_url"],
          youtube: ["youtube", "youtube_channel", "youtube_url"],
          tiktok: ["tiktok", "tiktok_handle", "tiktok_url"],
          website: ["website", "web_url", "personal_website"],
          email: ["email", "contact_email"],
          github: ["github", "github_url", "github_handle"],
          medium: ["medium", "medium_url", "medium_profile"]
        }
      },
      testimonials: {
        dataSource: "profile",
        fields: {
          testimonials: {
            type: "array",
            fields: ["testimonial_1", "testimonial_2", "testimonial_3", "testimonial_4", "testimonial_5"],
            filter: "non-empty"
          },
          testimonial_authors: {
            type: "array",
            fields: ["testimonial_author_1", "testimonial_author_2", "testimonial_author_3", "testimonial_author_4", "testimonial_author_5"],
            filter: "non-empty"
          },
          testimonial_roles: {
            type: "array",
            fields: ["testimonial_role_1", "testimonial_role_2", "testimonial_role_3", "testimonial_role_4", "testimonial_role_5"],
            filter: "non-empty"
          }
        }
      },
      'call-to-action': {
        dataSource: "profile",
        fields: {
          cta_title: ["cta_title", "call_to_action_title", "action_title"],
          cta_text: ["cta_text", "call_to_action_text", "action_text"],
          cta_button_text: ["cta_button_text", "button_text", "action_button"],
          cta_button_url: ["cta_button_url", "button_link", "action_link"],
          booking_url: ["booking_url", "calendar_link", "schedule_link"],
          contact_email: ["email", "contact_email"],
          phone: ["phone", "contact_phone"]
        }
      },
      stats: {
        dataSource: "profile",
        fields: {
          years_experience: ["years_experience", "experience_years", "years_in_field"],
          projects_completed: ["projects_completed", "total_projects", "projects"],
          clients_served: ["clients_served", "total_clients", "clients"],
          awards_won: ["awards_won", "total_awards", "awards"],
          books_written: ["books_written", "books_published", "publications"],
          speaking_engagements: ["speaking_engagements", "talks_given", "speeches"],
          countries_visited: ["countries_visited", "countries_worked"],
          team_size: ["team_size", "employees", "staff_count"],
          revenue: ["revenue", "annual_revenue"],
          growth_rate: ["growth_rate", "growth_percentage"]
        }
      },
      'video-intro': {
        dataSource: "profile",
        fields: {
          video_url: ["video_url", "intro_video", "youtube_video"],
          video_title: ["video_title", "intro_video_title"],
          video_description: ["video_description", "intro_video_description"],
          video_thumbnail: ["video_thumbnail", "video_poster"],
          youtube_channel: ["youtube_channel", "youtube_url"],
          vimeo_url: ["vimeo_url", "vimeo_video"]
        }
      },
      'photo-gallery': {
        dataSource: "profile",
        fields: {
          gallery_images: {
            type: "array",
            fields: [
              "gallery_image_1", "gallery_image_2", "gallery_image_3",
              "gallery_image_4", "gallery_image_5", "gallery_image_6",
              "gallery_image_7", "gallery_image_8", "gallery_image_9",
              "gallery_image_10"
            ],
            filter: "non-empty"
          },
          gallery_captions: {
            type: "array",
            fields: [
              "gallery_caption_1", "gallery_caption_2", "gallery_caption_3",
              "gallery_caption_4", "gallery_caption_5", "gallery_caption_6",
              "gallery_caption_7", "gallery_caption_8", "gallery_caption_9",
              "gallery_caption_10"
            ],
            filter: "non-empty"
          },
          portfolio_images: {
            type: "array",
            fields: ["portfolio_1", "portfolio_2", "portfolio_3", "portfolio_4", "portfolio_5"],
            filter: "non-empty"
          }
        }
      },
      'podcast-player': {
        dataSource: "profile",
        fields: {
          podcast_url: ["podcast_url", "podcast_link"],
          podcast_name: ["podcast_name", "podcast_title"],
          podcast_description: ["podcast_description", "podcast_about"],
          spotify_url: ["spotify_url", "spotify_podcast"],
          apple_podcasts_url: ["apple_podcasts_url", "apple_podcast"],
          google_podcasts_url: ["google_podcasts_url", "google_podcast"],
          latest_episode_url: ["latest_episode_url", "recent_episode"],
          episode_count: ["episode_count", "total_episodes"],
          podcast_host: {
            type: "composite",
            fields: ["first_name", "last_name"],
            format: "{first_name} {last_name}"
          }
        }
      },
      'booking-calendar': {
        dataSource: "profile",
        fields: {
          calendar_url: ["calendar_url", "booking_url", "calendly_url", "schedule_link"],
          calendar_embed_code: ["calendar_embed", "booking_embed", "calendly_embed"],
          availability_text: ["availability_text", "booking_instructions"],
          timezone: ["timezone", "time_zone"],
          meeting_duration: ["meeting_duration", "session_length", "appointment_length"],
          booking_email: ["booking_email", "appointment_email", "email"]
        }
      },
      'authority-hook': {
        dataSource: "profile",
        fields: {
          authority_hook: ["authority_hook", "authority_statement", "credibility_statement", "why_me"],
          unique_value: ["unique_value", "unique_value_proposition", "uvp"],
          mission_statement: ["mission_statement", "mission", "purpose"],
          core_message: ["core_message", "key_message", "main_message"],
          achievements: {
            type: "array",
            fields: ["achievement_1", "achievement_2", "achievement_3", "achievement_4", "achievement_5"],
            filter: "non-empty"
          },
          credentials: {
            type: "array",
            fields: ["credential_1", "credential_2", "credential_3", "credential_4", "credential_5"],
            filter: "non-empty"
          }
        }
      },
      'logo-grid': {
        dataSource: "profile",
        fields: {
          client_logos: {
            type: "array",
            fields: [
              "client_logo_1", "client_logo_2", "client_logo_3",
              "client_logo_4", "client_logo_5", "client_logo_6",
              "client_logo_7", "client_logo_8", "client_logo_9",
              "client_logo_10"
            ],
            filter: "non-empty"
          },
          client_names: {
            type: "array",
            fields: [
              "client_name_1", "client_name_2", "client_name_3",
              "client_name_4", "client_name_5", "client_name_6",
              "client_name_7", "client_name_8", "client_name_9",
              "client_name_10"
            ],
            filter: "non-empty"
          },
          partner_logos: {
            type: "array",
            fields: ["partner_logo_1", "partner_logo_2", "partner_logo_3", "partner_logo_4", "partner_logo_5"],
            filter: "non-empty"
          },
          certification_logos: {
            type: "array",
            fields: ["certification_logo_1", "certification_logo_2", "certification_logo_3", "certification_logo_4", "certification_logo_5"],
            filter: "non-empty"
          }
        }
      }
    };
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
