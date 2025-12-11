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
    const links = computed(() => {
      return props.data?.links || props.props?.links || [];
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
