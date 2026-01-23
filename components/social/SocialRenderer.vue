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

// Static configuration - defined outside component for performance
const SOCIAL_PLATFORMS = [
  'facebook', 'twitter', 'linkedin', 'instagram',
  'youtube', 'tiktok', 'pinterest', 'website'
];

const SOCIAL_ICONS = {
  'facebook': 'fab fa-facebook-f',
  'twitter': 'fab fa-twitter',
  'linkedin': 'fab fa-linkedin-in',
  'instagram': 'fab fa-instagram',
  'youtube': 'fab fa-youtube',
  'pinterest': 'fab fa-pinterest',
  'tiktok': 'fab fa-tiktok',
  'website': 'fas fa-globe'
};

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
    // Data from component JSON state (single source of truth)
    // ROOT FIX: Handle both pre-built links array AND individual URL fields
    // Individual URL fields come from profile pre-population when component is first added
    const links = computed(() => {
      // First check for pre-built links array (from editor save)
      if (props.data?.links?.length) return props.data.links;
      if (props.props?.links?.length) return props.props.links;

      // Build from individual URL fields (profile pre-population format)
      const builtLinks = [];
      const data = props.data || props.props || {};

      SOCIAL_PLATFORMS.forEach(platform => {
        const url = data[platform]?.trim();
        if (url) {
          builtLinks.push({ platform, url });
        }
      });

      return builtLinks;
    });

    // Social icon mapper function
    const getSocialIcon = (platform) => {
      const lowerPlatform = platform.toLowerCase();
      return SOCIAL_ICONS[lowerPlatform] || 'fas fa-link';
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
