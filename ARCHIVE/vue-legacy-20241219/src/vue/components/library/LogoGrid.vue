<template>
  <div class="gmkb-logo-grid" :class="classList">
    <div class="logo-grid-content">
      <h2 v-if="title" class="logo-grid-title">{{ title }}</h2>
      <p v-if="description" class="logo-grid-description">{{ description }}</p>
      
      <div class="logos-container" :class="`logos--${layout}`">
        <div
          v-for="(logo, index) in logos"
          :key="`logo-${index}`"
          class="logo-item"
          :class="{ 'logo-item--clickable': logo.url }"
        >
          <component
            :is="logo.url ? 'a' : 'div'"
            :href="logo.url"
            :target="logo.url ? '_blank' : undefined"
            :rel="logo.url ? 'noopener noreferrer' : undefined"
            class="logo-wrapper"
          >
            <img
              :src="logo.image"
              :alt="logo.name || `Logo ${index + 1}`"
              class="logo-image"
              :style="logoStyle"
            />
            <span v-if="showNames && logo.name" class="logo-name">{{ logo.name }}</span>
          </component>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

const title = computed(() => 
  props.data?.title || 'Featured In'
);

const description = computed(() =>
  props.data?.description || ''
);

const layout = computed(() =>
  props.settings?.layout || 'grid'
);

const showNames = computed(() =>
  props.settings?.showNames === true
);

// Default logos (placeholders)
const defaultLogos = [
  { 
    name: 'Forbes',
    image: 'https://via.placeholder.com/200x80/000000/FFFFFF?text=Forbes',
    url: ''
  },
  { 
    name: 'TechCrunch',
    image: 'https://via.placeholder.com/200x80/00A562/FFFFFF?text=TechCrunch',
    url: ''
  },
  { 
    name: 'The Verge',
    image: 'https://via.placeholder.com/200x80/FA4B2A/FFFFFF?text=The+Verge',
    url: ''
  },
  { 
    name: 'Wired',
    image: 'https://via.placeholder.com/200x80/000000/FFFFFF?text=WIRED',
    url: ''
  },
  { 
    name: 'Fast Company',
    image: 'https://via.placeholder.com/200x80/FC6D26/FFFFFF?text=Fast+Company',
    url: ''
  },
  { 
    name: 'Inc.',
    image: 'https://via.placeholder.com/200x80/000000/FFFFFF?text=Inc.',
    url: ''
  }
];

const logos = computed(() => {
  if (props.data?.logos && Array.isArray(props.data.logos) && props.data.logos.length > 0) {
    return props.data.logos;
  }
  return defaultLogos;
});

const logoStyle = computed(() => {
  const styles = {};
  
  if (props.settings?.logoHeight) {
    styles.maxHeight = `${props.settings.logoHeight}px`;
  }
  
  if (props.settings?.grayscale) {
    styles.filter = 'grayscale(100%)';
  }
  
  return styles;
});

const classList = computed(() => ({
  'logo-grid--centered': props.settings?.alignment === 'center',
  'logo-grid--dark': props.settings?.variant === 'dark',
  'logo-grid--bordered': props.settings?.style === 'bordered',
  'logo-grid--shadowed': props.settings?.style === 'shadowed'
}));
</script>

<style scoped>
.gmkb-logo-grid {
  padding: var(--spacing-xl, 3rem);
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-md, 8px);
}

.logo-grid-content {
  max-width: var(--max-width, 1200px);
  margin: 0 auto;
}

.logo-grid-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--color-text, #1a1a1a);
  margin: 0 0 0.5rem;
}

.logo-grid-description {
  font-size: 1.125rem;
  color: var(--color-text-light, #666666);
  margin: 0 0 2rem;
  line-height: 1.6;
}

.logos-container {
  display: grid;
  gap: 2rem;
  align-items: center;
}

.logos--grid {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.logos--row {
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
}

.logos--masonry {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-auto-rows: minmax(80px, auto);
}

.logos--carousel {
  display: flex;
  overflow-x: auto;
  gap: 2rem;
  padding: 1rem 0;
  scrollbar-width: thin;
}

.logos--carousel .logo-item {
  flex: 0 0 auto;
}

.logo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--color-surface-light, transparent);
  border-radius: var(--radius-sm, 6px);
  transition: all 0.3s ease;
}

.logo-item--clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
  width: 100%;
}

.logo-image {
  max-width: 100%;
  height: auto;
  max-height: 80px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.logo-item:hover .logo-image {
  filter: grayscale(0%) !important;
  transform: scale(1.05);
}

.logo-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-light, #666666);
  text-align: center;
}

/* Style variations */
.logo-grid--bordered .logo-item {
  border: 2px solid var(--color-border, #e2e8f0);
}

.logo-grid--bordered .logo-item:hover {
  border-color: var(--color-primary, #3b82f6);
}

.logo-grid--shadowed .logo-item {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.logo-grid--shadowed .logo-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* Dark variant */
.logo-grid--dark {
  background: var(--color-surface-dark, #1a1a1a);
}

.logo-grid--dark .logo-grid-title {
  color: white;
}

.logo-grid--dark .logo-grid-description {
  color: rgba(255, 255, 255, 0.8);
}

.logo-grid--dark .logo-item {
  background: rgba(255, 255, 255, 0.05);
}

.logo-grid--dark .logo-name {
  color: rgba(255, 255, 255, 0.7);
}

.logo-grid--dark .logo-image {
  filter: grayscale(100%) invert(1) opacity(0.8);
}

.logo-grid--dark .logo-item:hover .logo-image {
  filter: grayscale(0%) invert(1) opacity(1);
}

/* Centered variant */
.logo-grid--centered .logo-grid-content {
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .gmkb-logo-grid {
    padding: 2rem 1.5rem;
  }
  
  .logos--grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
  }
  
  .logo-item {
    padding: 0.75rem;
  }
  
  .logo-image {
    max-height: 60px;
  }
}

/* Scrollbar styling for carousel */
.logos--carousel::-webkit-scrollbar {
  height: 6px;
}

.logos--carousel::-webkit-scrollbar-track {
  background: var(--color-surface-light, #f1f1f1);
  border-radius: 3px;
}

.logos--carousel::-webkit-scrollbar-thumb {
  background: var(--color-primary, #3b82f6);
  border-radius: 3px;
}

.logos--carousel::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary-hover, #2563eb);
}
</style>
