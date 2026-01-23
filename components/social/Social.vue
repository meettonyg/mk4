<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root social-component"
  >
    <h2 v-if="title" class="social-title">{{ title }}</h2>
    <p v-if="description" class="social-description">{{ description }}</p>
    
    <div class="social-links">
      <!-- Placeholder icons (non-clickable) when editing with no configured links -->
      <template v-if="socialLinks.length > 0 && socialLinks[0].isPlaceholder">
        <span
          v-for="(link, index) in socialLinks"
          :key="index"
          :title="`${link.platform} (click to configure)`"
          class="social-link social-link--placeholder"
        >
          <i :class="getSocialIcon(link.platform)"></i>
          <span v-if="showLabels" class="social-label">{{ link.platform }}</span>
        </span>
      </template>
      <!-- Actual links when URLs are configured -->
      <template v-else>
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
          <span v-if="showLabels" class="social-label">{{ link.platform }}</span>
        </a>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
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
  isEditing: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

// Data from component JSON state (single source of truth)
const title = computed(() => props.data?.title || props.props?.title || 'Connect With Me');
const description = computed(() => props.data?.description || props.props?.description || '');
const showLabels = computed(() => {
  const val = props.data?.show_labels ?? props.props?.show_labels ?? props.data?.showLabels;
  return val !== false;
});

// Default platforms to show as placeholders when editing with no configured links
const defaultPlatforms = ['linkedin', 'twitter', 'instagram', 'youtube'];

// Social links from component data
const socialLinks = computed(() => {
  const links = [];
  const data = props.data || props.props || {};

  const socialData = {
    facebook: data.facebook,
    twitter: data.twitter,
    linkedin: data.linkedin,
    instagram: data.instagram,
    youtube: data.youtube,
    tiktok: data.tiktok,
    pinterest: data.pinterest,
    website: data.website
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
        } else if (platform === 'website') {
          finalUrl = url.startsWith('http') ? url : `https://${url}`;
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

  // Show placeholder icons when in editing mode with no configured links
  if (links.length === 0 && (props.isEditing || props.isSelected)) {
    return defaultPlatforms.map(platform => ({
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      url: '#', // Placeholder URL
      isPlaceholder: true
    }));
  }

  return links;
});

const getSocialIcon = (platform) => {
  const icons = {
    'Facebook': 'fab fa-facebook-f',
    'Twitter': 'fab fa-twitter',
    'LinkedIn': 'fab fa-linkedin-in',
    'Instagram': 'fab fa-instagram',
    'Youtube': 'fab fa-youtube',
    'GitHub': 'fab fa-github',
    'Pinterest': 'fab fa-pinterest',
    'Tiktok': 'fab fa-tiktok',
    'Website': 'fas fa-globe'
  };
  return icons[platform] || 'fas fa-link';
};
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.social-component {
  /* Styles applied via inline styles from ComponentStyleService */
  text-align: center;
}

.social-title {
  /* font-size and font-weight inherited from component-root */
  margin: 0 0 1rem 0;
  color: inherit;
}

.social-description {
  opacity: 0.8; /* Use opacity instead of fixed color */
  margin: 0 0 2rem 0;
  /* line-height inherited from component-root */
}

.social-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
  color: var(--text-color, #1f2937);
  text-decoration: none;
  border-radius: 50px;
  transition: all 0.3s ease;
  /* font-weight inherited from component-root */
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: var(--primary-color, #3b82f6);
  color: white;
}

.social-link i {
  font-size: 1.25rem;
  color: var(--icon-color, currentColor);
}

/* Placeholder styles for editing mode when no URLs configured */
.social-link--placeholder {
  cursor: default;
  opacity: 0.6;
  border: 2px dashed var(--border-color, #cbd5e1);
}

.social-label {
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .social-title {
    font-size: 1.5rem;
  }
  
  .social-links {
    flex-direction: column;
    align-items: center;
  }
  
  .social-link {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}
</style>
