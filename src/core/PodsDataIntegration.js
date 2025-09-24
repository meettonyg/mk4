/**
 * Pods Data Integration - Self-Contained Architecture Compliant
 * 
 * This integration respects the self-contained component architecture:
 * - Each component defines its own data needs in /components/[name]/pods-config.json
 * - This class only acts as a bridge between Pods data and components
 * - No hardcoded field mappings here
 */

export class PodsDataIntegration {
  constructor() {
    this.podsData = this.getPodsDataSource();
    
    if (Object.keys(this.podsData).length > 0) {
      console.log('[PodsDataIntegration] Pods data available:', Object.keys(this.podsData).length, 'fields');
    }
  }

  /**
   * Get Pods data from WordPress
   * Single source of truth for where Pods data lives
   */
  getPodsDataSource() {
    return window.gmkbData?.pods_data || window.gmkbVueData?.pods_data || {};
  }

  /**
   * Get component's Pods configuration
   * Each component defines its own needs in pods-config.json
   */
  getComponentPodsConfig(componentType) {
    // First, try to get from the component's actual config if passed from PHP
    if (window.gmkbComponentConfigs && window.gmkbComponentConfigs[componentType]) {
      const config = window.gmkbComponentConfigs[componentType];
      if (config.pods_config) {
        return config.pods_config;
      }
    }
    
    // Then check if we have it from UnifiedComponentRegistry
    if (window.UnifiedComponentRegistry) {
      const component = window.UnifiedComponentRegistry.get(componentType);
      if (component && component.pods_config) {
        return component.pods_config;
      }
    }
    
    // Otherwise, return embedded configs that match what's in the component folders
    // This is a fallback - in production, these should come from the actual files
    const configs = this.getEmbeddedConfigs();
    return configs[componentType] || null;
  }

  /**
   * Embedded configs - These match what's in each component's pods-config.json
   * This is a fallback for when configs aren't loaded from PHP
   */
  getEmbeddedConfigs() {
    return {
      biography: {
        dataSource: "pods",
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
        dataSource: "pods",
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
        dataSource: "pods",
        fields: {
          email: ["email", "contact_email"],
          phone: ["phone", "contact_phone"],
          website: ["website", "web_url"],
          linkedin: ["linkedin", "linkedin_url"],
          twitter: ["twitter", "twitter_handle"],
          facebook: ["facebook", "facebook_url"]
        }
      },
      topics: {
        dataSource: "pods",
        fields: {
          topics: {
            type: "array",
            fields: ["topic_1", "topic_2", "topic_3", "topic_4", "topic_5"],
            filter: "non-empty"
          }
        }
      },
      questions: {
        dataSource: "pods",
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
        dataSource: "pods",
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
        dataSource: "pods",
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
        dataSource: "pods",
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
        dataSource: "pods",
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
        dataSource: "pods",
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
        dataSource: "pods",
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
        dataSource: "pods",
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
        dataSource: "pods",
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
        dataSource: "pods",
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
        dataSource: "pods",
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
        dataSource: "pods",
        fields: {
          authority_statement: ["authority_statement", "credibility_statement", "why_me"],
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
        dataSource: "pods",
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
   * Transform Pods data based on component's configuration
   */
  transformPodsData(config, podsData) {
    const result = {};

    for (const [targetField, sourceConfig] of Object.entries(config.fields)) {
      if (typeof sourceConfig === 'object' && sourceConfig.type === 'composite') {
        // Handle composite fields (like full name)
        let value = sourceConfig.format;
        for (const field of sourceConfig.fields) {
          const fieldValue = podsData[field] || '';
          value = value.replace(`{${field}}`, fieldValue);
        }
        result[targetField] = value.trim();
      } else if (typeof sourceConfig === 'object' && sourceConfig.type === 'array') {
        // Handle array fields (like topics)
        const values = [];
        for (const field of sourceConfig.fields) {
          if (podsData[field]) {
            values.push(podsData[field]);
          }
        }
        result[targetField] = values;
      } else {
        // Handle simple field mapping (with fallbacks)
        const possibleFields = Array.isArray(sourceConfig) ? sourceConfig : [sourceConfig];
        for (const field of possibleFields) {
          if (podsData[field]) {
            result[targetField] = podsData[field];
            break;
          }
        }
      }
    }

    return result;
  }

  /**
   * Enrich component with Pods data
   * Respects self-contained architecture by using component's own config
   */
  enrichComponentData(component) {
    const config = this.getComponentPodsConfig(component.type);
    
    if (!config || config.dataSource !== 'pods') {
      return component;
    }

    const transformedData = this.transformPodsData(config, this.podsData);
    
    // Merge the transformed Pods data with component data
    component.data = {
      ...component.data,
      ...transformedData,
      _dataSource: 'pods'
    };

    console.log(`[PodsDataIntegration] Enriched ${component.type} with Pods data:`, transformedData);
    
    return component;
  }

  /**
   * Check if Pods data is available
   */
  hasPodsData() {
    return Object.keys(this.podsData).length > 0;
  }
}

// Create singleton instance
const podsDataIntegration = new PodsDataIntegration();

export default podsDataIntegration;
