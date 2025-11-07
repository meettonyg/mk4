<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--social" :data-component-id="componentId">
    <div class="component-root social-links">
      <a
        v-for="(link, index) in links"
        :key="index"
        :href="link.url"
        :title="link.platform"
        class="social-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i :class="getSocialIcon(link.platform)"></i>
      </a>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'SocialRenderer',
  props: {
    // STANDARD INTERFACE: All components accept the same props structure
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    },
    props: {
      type: Object,
      default: () => ({})
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    // Optional editing state
    isEditing: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // COMPOSITION API: Access Pods data via composable
    const podsData = usePodsData();
    
    // SOCIAL LINKS: Priority is component data > Pods fallback > empty array
    const links = computed(() => {
      // Priority 1: Component data (user customization)
      if (props.data?.links && Array.isArray(props.data.links)) {
        return props.data.links;
      }
      
      // Priority 2: Pods data (from database)
      // Extract social links from Pods rawPodsData
      if (podsData.rawPodsData?.value) {
        const socialLinks = [];
        const rawData = podsData.rawPodsData.value;
        
        // Map of social platforms to their Pods field names
        const socialPlatforms = [
          { platform: 'facebook', field: 'facebook_url' },
          { platform: 'twitter', field: 'twitter_url' },
          { platform: 'linkedin', field: 'linkedin_url' },
          { platform: 'instagram', field: 'instagram_url' },
          { platform: 'youtube', field: 'youtube_url' },
          { platform: 'pinterest', field: 'pinterest_url' },
          { platform: 'tiktok', field: 'tiktok_url' }
        ];
        
        // Extract each social link from Pods
        socialPlatforms.forEach(({ platform, field }) => {
          if (rawData[field] && rawData[field].trim()) {
            socialLinks.push({
              platform: platform,
              url: rawData[field]
            });
          }
        });
        
        if (socialLinks.length > 0) {
          return socialLinks;
        }
      }
      
      // Priority 3: Empty array (will show no links)
      return [];
    });
    
    // Social icon mapper function
    const getSocialIcon = (platform) => {
      const icons = {
        'facebook': 'fab fa-facebook-f',
        'twitter': 'fab fa-twitter',
        'linkedin': 'fab fa-linkedin-in',
        'instagram': 'fab fa-instagram',
        'youtube': 'fab fa-youtube',
        'pinterest': 'fab fa-pinterest',
        'tiktok': 'fab fa-tiktok'
      };
      const lowerPlatform = platform.toLowerCase();
      return icons[lowerPlatform] || 'fas fa-link';
    };
    
    return {
      links,
      getSocialIcon
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles
   All styling comes from design-system/components.css:
   - .gmkb-component (base component wrapper)
   - .gmkb-component--social (social-specific styles)
   - .social-links, .social-link
*/
</style>
