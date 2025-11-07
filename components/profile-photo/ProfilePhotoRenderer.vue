<template>
  <div class="profile-photo-component" :class="componentClasses">
    <div v-if="photo" class="profile-photo-container">
      <img 
        :src="sanitizedPhotoUrl" 
        :alt="photo.alt || 'Profile Photo'"
        class="profile-photo-image"
        :class="imageClasses"
        :style="imageStyles"
        loading="lazy"
      />
      <p v-if="photo.caption" class="profile-photo-caption">
        {{ photo.caption }}
      </p>
    </div>
    <div v-else class="profile-photo-placeholder">
      <i class="fa-solid fa-user-circle"></i>
      <p>No profile photo available</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePodsData } from '@composables/usePodsData';

const props = defineProps({
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
});

const { profilePhoto, allData: podsData } = usePodsData();

// SINGLE FIELD PATTERN: Simple photo object or null
const photo = computed(() => {
  // Check if using Pods data
  if (props.data?.usePodsData && profilePhoto.value) {
    const podsPhoto = profilePhoto.value;
    
    // Handle both simple URL and complex object formats
    return {
      url: typeof podsPhoto === 'object' 
        ? (podsPhoto.guid || podsPhoto.url || podsPhoto.ID) 
        : podsPhoto,
      caption: typeof podsPhoto === 'object' 
        ? (podsPhoto.post_excerpt || podsPhoto.caption || '') 
        : '',
      alt: typeof podsPhoto === 'object' 
        ? (podsPhoto.post_title || 'Profile Photo') 
        : 'Profile Photo'
    };
  }
  
  // Fallback to custom photo
  return props.data?.photo || null;
});

// ROOT FIX: Fix URL encoding issues
// WordPress sometimes returns HTML-encoded URLs, we need to decode them
const sanitizedPhotoUrl = computed(() => {
  if (!photo.value?.url) return '';
  
  let url = photo.value.url;
  
  // ROOT FIX: Decode HTML entities
  // This fixes issues like &amp; becoming & and &#x2F; becoming /
  const textarea = document.createElement('textarea');
  textarea.innerHTML = url;
  url = textarea.value;
  
  // ROOT FIX: Ensure URL is properly formatted
  // Remove any double slashes except after protocol
  url = url.replace(/([^:]\/)\/+/g, '$1');
  
  return url;
});

const componentClasses = computed(() => ({
  'has-photo': !!photo.value,
  'no-photo': !photo.value,
  'pods-source': props.data?.usePodsData && !!profilePhoto.value,
  'custom-source': !props.data?.usePodsData || !profilePhoto.value
}));

// ROOT FIX: Apply shape and size settings from component data
const imageClasses = computed(() => {
  const classes = [];
  
  // Apply shape class
  const shape = props.data?.shape || 'circle';
  classes.push(`photo-shape-${shape}`);
  
  // Apply size class
  const size = props.data?.size || 'medium';
  classes.push(`photo-size-${size}`);
  
  return classes.join(' ');
});

// ROOT FIX: Dynamic image styles based on size setting
const imageStyles = computed(() => {
  const styles = {};
  const size = props.data?.size || 'medium';
  
  // Define size mappings
  const sizeMap = {
    'small': '150px',
    'medium': '250px',
    'large': '350px'
  };
  
  styles.maxWidth = sizeMap[size] || '250px';
  styles.maxHeight = sizeMap[size] || '250px';
  
  return styles;
});
</script>

<style scoped>
.profile-photo-component {
  width: 100%;
  padding: var(--spacing-md, 1rem);
}

.profile-photo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
}

.profile-photo-image {
  width: 100%;
  height: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  object-fit: cover;
  aspect-ratio: 1 / 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* ROOT FIX: Shape variations */
.profile-photo-image.photo-shape-circle {
  border-radius: 50%;
}

.profile-photo-image.photo-shape-square {
  border-radius: 0;
}

.profile-photo-image.photo-shape-rounded {
  border-radius: 16px;
}

/* ROOT FIX: Size variations (these are overridden by inline styles) */
.profile-photo-image.photo-size-small {
  max-width: 150px;
  max-height: 150px;
}

.profile-photo-image.photo-size-medium {
  max-width: 250px;
  max-height: 250px;
}

.profile-photo-image.photo-size-large {
  max-width: 350px;
  max-height: 350px;
}

.profile-photo-image:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.profile-photo-caption {
  margin: 0;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-muted, #64748b);
  text-align: center;
  max-width: 300px;
}

.profile-photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl, 2rem);
  color: var(--color-text-muted, #94a3b8);
  background: var(--color-surface, #f8fafc);
  border-radius: var(--border-radius, 8px);
  border: 2px dashed var(--color-border, #e2e8f0);
}

.profile-photo-placeholder i {
  font-size: 4rem;
  margin-bottom: var(--spacing-md, 1rem);
  opacity: 0.5;
}

.profile-photo-placeholder p {
  margin: 0;
  font-size: var(--font-size-sm, 0.875rem);
  font-style: italic;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-photo-image {
    max-width: 200px;
  }
  
  .profile-photo-caption {
    max-width: 200px;
  }
}

/* Dark mode support */
body.dark-mode .profile-photo-placeholder {
  background: var(--color-surface-dark, #1e293b);
  border-color: var(--color-border-dark, #334155);
  color: var(--color-text-muted-dark, #94a3b8);
}

body.dark-mode .profile-photo-caption {
  color: var(--color-text-muted-dark, #94a3b8);
}
</style>
