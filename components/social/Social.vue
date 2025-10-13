<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <div 
    class="component-root social-component"
    :data-component-id="componentId"
  >
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
        <span v-if="showLabels" class="social-label">{{ link.platform }}</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

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

// Store and composables
const store = useMediaKitStore();
const { socialLinks: podsSocialLinks } = usePodsData();

// Extract data from both data and props for compatibility
const title = computed(() => props.data?.title || props.props?.title || 'Connect With Me');
const description = computed(() => props.data?.description || props.props?.description || '');
const showLabels = computed(() => {
  const val = props.data?.show_labels ?? props.props?.show_labels;
  return val !== false;
});

const socialLinks = computed(() => {
  // Handle array format
  if (Array.isArray(props.data?.links) && props.data.links.length > 0) {
    return props.data.links;
  }
  
  // Build from individual fields with Pods data fallback
  const links = [];
  const socialData = {
    facebook: props.data?.facebook || props.props?.facebook || podsSocialLinks.value?.facebook,
    twitter: props.data?.twitter || props.props?.twitter || podsSocialLinks.value?.twitter,
    linkedin: props.data?.linkedin || props.props?.linkedin || podsSocialLinks.value?.linkedin,
    instagram: props.data?.instagram || props.props?.instagram || podsSocialLinks.value?.instagram,
    youtube: props.data?.youtube || props.props?.youtube || podsSocialLinks.value?.youtube,
    github: props.data?.github || props.props?.github,
    pinterest: props.data?.pinterest || props.props?.pinterest,
    tiktok: props.data?.tiktok || props.props?.tiktok
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
    'Tiktok': 'fab fa-tiktok'
  };
  return icons[platform] || 'fas fa-link';
};

// Lifecycle
onMounted(() => {
  if (store.components[props.componentId]) {
    document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
      detail: {
        type: 'social',
        id: props.componentId,
        podsDataUsed: socialLinks.value.some(link => 
          podsSocialLinks.value && Object.values(podsSocialLinks.value).includes(link.url)
        )
      }
    }));
  }
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.social-component {
  /* Styles applied via inline styles from ComponentStyleService */
  text-align: center;
}

.social-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: inherit;
}

.social-description {
  color: #64748b;
  margin: 0 0 2rem 0;
  line-height: 1.6;
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
  background: #f8fafc;
  color: #1e293b;
  text-decoration: none;
  border-radius: 50px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: #3b82f6;
  color: white;
}

.social-link i {
  font-size: 1.25rem;
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
