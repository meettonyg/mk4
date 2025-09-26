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
  computed: {
    title() {
      return this.data.title || 'Connect With Me'
    },
    description() {
      return this.data.description || ''
    },
    showLabels() {
      return this.data.show_labels !== false
    },
    socialLinks() {
      // Handle array format
      if (Array.isArray(this.data.links)) {
        return this.data.links
      }
      
      // Build from individual fields
      const links = []
      
      // Common social platforms
      const platforms = [
        'facebook', 'twitter', 'linkedin', 'instagram', 
        'youtube', 'github', 'pinterest', 'tiktok'
      ]
      
      platforms.forEach(platform => {
        if (this.data[platform]) {
          links.push({
            platform: platform.charAt(0).toUpperCase() + platform.slice(1),
            url: this.data[platform]
          })
        }
      })
      
      return links.length ? links : this.getDefaultLinks()
    }
  },
  methods: {
    getSocialIcon(platform) {
      const icons = {
        'Facebook': 'fab fa-facebook-f',
        'Twitter': 'fab fa-twitter',
        'LinkedIn': 'fab fa-linkedin-in',
        'Instagram': 'fab fa-instagram',
        'YouTube': 'fab fa-youtube',
        'GitHub': 'fab fa-github',
        'Pinterest': 'fab fa-pinterest',
        'TikTok': 'fab fa-tiktok'
      }
      return icons[platform] || 'fas fa-link'
    },
    getDefaultLinks() {
      return [
        { platform: 'Facebook', url: '#' },
        { platform: 'Twitter', url: '#' },
        { platform: 'LinkedIn', url: '#' }
      ]
    }
  }
}
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
