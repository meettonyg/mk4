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
export default {
  name: 'SocialRenderer',
  props: {
    componentId: String,
    // ROOT FIX: Standardized prop names (data contract)
    links: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getSocialIcon(platform) {
      const icons = {
        'facebook': 'fab fa-facebook-f',
        'twitter': 'fab fa-twitter',
        'linkedin': 'fab fa-linkedin-in',
        'instagram': 'fab fa-instagram',
        'youtube': 'fab fa-youtube',
        'github': 'fab fa-github',
        'pinterest': 'fab fa-pinterest',
        'tiktok': 'fab fa-tiktok'
      };
      const lowerPlatform = platform.toLowerCase();
      return icons[lowerPlatform] || 'fas fa-link';
    }
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
