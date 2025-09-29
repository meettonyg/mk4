<template>
  <div class="gmkb-social" :class="classList">
    <div class="social-content">
      <h2 v-if="title" class="social-title">{{ title }}</h2>
      <p v-if="description" class="social-description">{{ description }}</p>
      
      <div class="social-links" :class="`social-links--${layout}`">
        <a
          v-for="platform in activePlatforms"
          :key="platform.name"
          :href="platform.url"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
          :class="`social-link--${platform.name}`"
          :title="`Follow on ${platform.label}`"
        >
          <svg class="social-icon" viewBox="0 0 24 24" width="24" height="24">
            <path :d="platform.icon" fill="currentColor" />
          </svg>
          <span v-if="showLabels" class="social-label">{{ platform.label }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePodsData } from '../../composables/usePodsData';

const props = defineProps({
  componentId: String,
  data: {
    type: Object,
    default: () => ({})
  },
  settings: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update', 'remove']);

// Social media platform icons (using path data from popular icon sets)
const platformIcons = {
  twitter: {
    label: 'Twitter',
    icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z'
  },
  facebook: {
    label: 'Facebook',
    icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z'
  },
  linkedin: {
    label: 'LinkedIn',
    icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 110-4 2 2 0 010 4z'
  },
  instagram: {
    label: 'Instagram',
    icon: 'M7 2a5 5 0 00-5 5v10a5 5 0 005 5h10a5 5 0 005-5V7a5 5 0 00-5-5H7zm5 3a7 7 0 110 14 7 7 0 010-14zm0 2a5 5 0 100 10 5 5 0 000-10zm6.5-2a1.5 1.5 0 110 3 1.5 1.5 0 010-3z'
  },
  youtube: {
    label: 'YouTube',
    icon: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z'
  }
};

// Get Pods data
const podsData = usePodsData();

const title = computed(() => 
  props.data?.title || 'Connect With Me'
);

const description = computed(() =>
  props.data?.description || ''
);

const showLabels = computed(() =>
  props.settings?.showLabels !== false
);

const layout = computed(() =>
  props.settings?.layout || 'horizontal'
);

// Get active social platforms with URLs
const activePlatforms = computed(() => {
  const platforms = [];
  
  // Check for data from props first, then Pods data
  Object.keys(platformIcons).forEach(platform => {
    const url = props.data?.[platform] || podsData.socialLinks.value[platform];
    if (url) {
      platforms.push({
        name: platform,
        url: url.includes('://') ? url : `https://${url}`,
        ...platformIcons[platform]
      });
    }
  });
  
  return platforms;
});

const classList = computed(() => ({
  'social--centered': props.settings?.alignment === 'center',
  'social--dark': props.settings?.variant === 'dark',
  'social--minimal': props.settings?.style === 'minimal',
  'social--outlined': props.settings?.style === 'outlined',
  'social--filled': props.settings?.style === 'filled'
}));
</script>

<style scoped>
.gmkb-social {
  padding: var(--spacing-lg, 2rem);
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-md, 8px);
}

.social-content {
  max-width: var(--max-width, 800px);
  margin: 0 auto;
}

.social-title {
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 700;
  color: var(--color-text, #1a1a1a);
  margin: 0 0 0.5rem;
}

.social-description {
  font-size: 1rem;
  color: var(--color-text-light, #666666);
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
}

.social-links--vertical {
  flex-direction: column;
  align-items: flex-start;
}

.social-links--grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--color-text, #1a1a1a);
  background: var(--color-surface-light, #f8f9fa);
  border-radius: var(--radius-sm, 6px);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.social-icon {
  flex-shrink: 0;
}

.social-label {
  font-size: 0.875rem;
  font-weight: 600;
}

/* Platform-specific colors on hover */
.social-link--twitter:hover {
  background: #1DA1F2;
  color: white;
  border-color: #1DA1F2;
}

.social-link--facebook:hover {
  background: #1877F2;
  color: white;
  border-color: #1877F2;
}

.social-link--linkedin:hover {
  background: #0077B5;
  color: white;
  border-color: #0077B5;
}

.social-link--instagram:hover {
  background: linear-gradient(45deg, #833AB4, #E1306C, #F77737);
  color: white;
  border-color: #E1306C;
}

.social-link--youtube:hover {
  background: #FF0000;
  color: white;
  border-color: #FF0000;
}

/* Style variations */
.social--minimal .social-link {
  background: transparent;
  padding: 0.5rem;
}

.social--outlined .social-link {
  background: transparent;
  border-color: var(--color-border, #e2e8f0);
}

.social--filled .social-link {
  background: var(--color-primary, #3b82f6);
  color: white;
}

/* Dark variant */
.social--dark {
  background: var(--color-surface-dark, #1a1a1a);
}

.social--dark .social-title {
  color: white;
}

.social--dark .social-description {
  color: rgba(255, 255, 255, 0.8);
}

.social--dark .social-link {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Centered variant */
.social--centered .social-content {
  text-align: center;
}

.social--centered .social-links {
  justify-content: center;
}

.social--centered .social-links--vertical {
  align-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .gmkb-social {
    padding: 1.5rem;
  }
  
  .social-links {
    gap: 0.75rem;
  }
  
  .social-link {
    padding: 0.5rem 0.75rem;
  }
}
</style>
