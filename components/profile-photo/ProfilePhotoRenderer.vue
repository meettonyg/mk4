<template>
  <div class="profile-photo-component" :class="componentClasses">
    <div v-if="photo" class="profile-photo-container" :class="containerClasses">
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
    <div v-else-if="showPlaceholder" class="profile-photo-placeholder" :class="placeholderClasses">
      <div class="placeholder-avatar">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="58" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" opacity="0.3"/>
          <circle cx="60" cy="45" r="20" fill="currentColor" opacity="0.15"/>
          <path d="M30 95c0-16.569 13.431-30 30-30s30 13.431 30 30" fill="currentColor" opacity="0.15"/>
          <circle cx="60" cy="45" r="18" stroke="currentColor" stroke-width="2" opacity="0.4"/>
          <path d="M32 95c0-15.464 12.536-28 28-28s28 12.536 28 28" stroke="currentColor" stroke-width="2" opacity="0.4"/>
        </svg>
      </div>
      <div class="placeholder-content">
        <p class="placeholder-title">Add Your Photo</p>
        <p class="placeholder-hint">Click to upload a professional headshot</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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
  },
  isBuilderMode: {
    type: Boolean,
    default: false
  }
});

// Read photo directly from component data
const photo = computed(() => {
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

// Show placeholder when in builder mode with no photo
const showPlaceholder = computed(() => {
  return !photo.value && (props.isBuilderMode || props.isEditing || props.isSelected);
});

const componentClasses = computed(() => ({
  'has-photo': !!photo.value,
  'no-photo': !photo.value,
  'custom-source': true
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

// ROOT FIX: Get alignment class for container positioning
const containerClasses = computed(() => {
  const alignment = props.settings?.advanced?.layout?.alignment || 'center';
  return `align-${alignment}`;
});

// Placeholder styling based on size
const placeholderClasses = computed(() => {
  const size = props.data?.size || props.settings?.size || 'medium';
  return `placeholder-size-${size}`;
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
  gap: var(--spacing-sm, 0.75rem);
}

/* ROOT FIX: Dynamic alignment based on advanced settings */
.profile-photo-container.align-left {
  align-items: flex-start;
}

.profile-photo-container.align-center {
  align-items: center;
}

.profile-photo-container.align-right {
  align-items: flex-end;
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
  color: var(--color-primary, #6366f1);
  background: linear-gradient(135deg, var(--color-surface, #f8fafc) 0%, rgba(99, 102, 241, 0.05) 100%);
  border-radius: var(--border-radius, 8px);
  border: 2px dashed rgba(99, 102, 241, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 200px;
}

.profile-photo-placeholder:hover {
  border-color: var(--color-primary, #6366f1);
  background: linear-gradient(135deg, var(--color-surface, #f8fafc) 0%, rgba(99, 102, 241, 0.1) 100%);
  transform: translateY(-2px);
}

.placeholder-avatar {
  width: 100px;
  height: 100px;
  margin-bottom: var(--spacing-md, 1rem);
}

.placeholder-avatar svg {
  width: 100%;
  height: 100%;
}

.placeholder-content {
  text-align: center;
}

.placeholder-title {
  margin: 0 0 4px 0;
  font-size: var(--font-size-base, 1rem);
  font-weight: 600;
  color: var(--color-text, #1e293b);
}

.placeholder-hint {
  margin: 0;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-muted, #64748b);
}

/* Size variations for placeholder */
.profile-photo-placeholder.placeholder-size-small {
  min-height: 150px;
  padding: var(--spacing-md, 1rem);
}

.profile-photo-placeholder.placeholder-size-small .placeholder-avatar {
  width: 60px;
  height: 60px;
}

.profile-photo-placeholder.placeholder-size-large {
  min-height: 300px;
  padding: var(--spacing-2xl, 3rem);
}

.profile-photo-placeholder.placeholder-size-large .placeholder-avatar {
  width: 140px;
  height: 140px;
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
  background: linear-gradient(135deg, var(--color-surface-dark, #1e293b) 0%, rgba(99, 102, 241, 0.1) 100%);
  border-color: rgba(99, 102, 241, 0.4);
}

body.dark-mode .profile-photo-placeholder:hover {
  background: linear-gradient(135deg, var(--color-surface-dark, #1e293b) 0%, rgba(99, 102, 241, 0.2) 100%);
}

body.dark-mode .placeholder-title {
  color: var(--color-text-dark, #f1f5f9);
}

body.dark-mode .placeholder-hint {
  color: var(--color-text-muted-dark, #94a3b8);
}

body.dark-mode .profile-photo-caption {
  color: var(--color-text-muted-dark, #94a3b8);
}
</style>
