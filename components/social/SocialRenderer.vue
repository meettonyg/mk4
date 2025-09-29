<template>
  <div class="gmkb-social-component" :data-component-id="componentId">
    <div class="social-container">
      <h2 v-if="title" class="social-title">{{ title }}</h2>
      <p v-if="description" class="social-description">{{ description }}</p>
      
      <div class="social-links">
        <a
          v-for="(link, index) in socialLinks"
          :key="index"
          :href="link.url"
          :title="link.platform"
          class="social-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i :class="getSocialIcon(link.platform)"></i>
          <span v-if="showLabels">{{ link.platform }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'SocialRenderer',
  props: {
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    // Store and composables
    const store = useMediaKitStore();
    const { 
      twitter: podsTwitter, 
      linkedin: podsLinkedin, 
      facebook: podsFacebook,
      instagram: podsInstagram,
      youtube: podsYoutube 
    } = usePodsData();
    
    // Computed properties
    const title = computed(() => {
      return props.data.title || 'Connect With Me';
    });
    
    const description = computed(() => {
      return props.data.description || '';
    });
    
    const showLabels = computed(() => {
      return props.data.show_labels !== false;
    });
    
    const socialLinks = computed(() => {
      // Handle array format
      if (Array.isArray(props.data.links)) {
        return props.data.links;
      }
      
      // Build from individual fields with Pods data fallback
      const links = [];
      
      // ROOT FIX: Use Pods data as fallback, no global object checking
      const socialData = {
        facebook: props.data.facebook || podsFacebook.value,
        twitter: props.data.twitter || podsTwitter.value,
        linkedin: props.data.linkedin || podsLinkedin.value,
        instagram: props.data.instagram || podsInstagram.value,
        youtube: props.data.youtube || podsYoutube.value,
        github: props.data.github,
        pinterest: props.data.pinterest,
        tiktok: props.data.tiktok
      };
      
      Object.entries(socialData).forEach(([platform, url]) => {
        if (url) {
          // Ensure URL has protocol
          let finalUrl = url;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (platform === 'twitter') {
              finalUrl = `https://twitter.com/${url.replace('@', '')}`;
            } else if (platform === 'linkedin') {
              finalUrl = url.includes('linkedin.com') ? `https://${url}` : `https://linkedin.com/in/${url}`;
            } else if (platform === 'instagram') {
              finalUrl = `https://instagram.com/${url.replace('@', '')}`;
            } else if (platform === 'facebook') {
              finalUrl = url.includes('facebook.com') ? `https://${url}` : `https://facebook.com/${url}`;
            } else if (platform === 'youtube') {
              finalUrl = url.includes('youtube.com') ? `https://${url}` : `https://youtube.com/@${url}`;
            } else {
              finalUrl = `https://${url}`;
            }
          }
          
          links.push({
            platform: platform.charAt(0).toUpperCase() + platform.slice(1),
            url: finalUrl
          });
        }
      });
      
      return links.length ? links : getDefaultLinks();
    });
    
    // Methods
    const getSocialIcon = (platform) => {
      const icons = {
        'Facebook': 'fab fa-facebook-f',
        'Twitter': 'fab fa-twitter',
        'LinkedIn': 'fab fa-linkedin-in',
        'Instagram': 'fab fa-instagram',
        'Youtube': 'fab fa-youtube',
        'GitHub': 'fab fa-github',
        'Pinterest': 'fab fa-pinterest',
        'Tiktok': 'fab fa-tiktok'
      };
      return icons[platform] || 'fas fa-link';
    };
    
    const getDefaultLinks = () => {
      // Show empty state instead of dummy links
      return [];
    };
    
    // Lifecycle
    onMounted(() => {
      // ROOT FIX: No polling or global checking - use event-driven approach
      if (store.components[props.componentId]) {
        console.log('Social component mounted:', props.componentId);
        
        // Check if using Pods data
        const usingPodsData = !props.data.facebook && podsFacebook.value || 
                             !props.data.twitter && podsTwitter.value ||
                             !props.data.linkedin && podsLinkedin.value;
        
        // Dispatch mount event
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'social',
            id: props.componentId,
            podsDataUsed: usingPodsData
          }
        }));
      }
    });
    
    return {
      title,
      description,
      showLabels,
      socialLinks,
      getSocialIcon
    };
  }
};
</script>

<style scoped>
.gmkb-social-component {
  padding: var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-background, #f8f9fa);
}

.social-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.social-title {
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-2xl, 2rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  line-height: var(--gmkb-line-height-heading, 1.2);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}

.social-description {
  color: var(--gmkb-color-text-light, #666);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
}

.social-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--gmkb-spacing-md, 1rem);
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: var(--gmkb-space-2, 0.5rem);
  padding: var(--gmkb-spacing-sm, 0.75rem) var(--gmkb-spacing-lg, 1.5rem);
  background: var(--gmkb-color-surface, #fff);
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  font-weight: var(--gmkb-font-weight-medium, 500);
  text-decoration: none;
  border-radius: var(--gmkb-border-radius-full, 50px);
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0,0,0,0.1));
  transition: var(--gmkb-transition, all 0.3s ease);
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0,0,0,0.1));
  background: var(--gmkb-color-primary, #007cba);
  color: white;
}

.social-link i {
  font-size: var(--gmkb-font-size-lg, 1.25rem);
}

@media (max-width: 768px) {
  .social-links {
    justify-content: center;
  }
}
</style>
