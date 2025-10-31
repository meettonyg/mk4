<template>
  <div class="profile-photo-component" :class="componentClasses">
    <div v-if="photo" class="profile-photo-container">
      <img 
        :src="photo.url" 
        :alt="photo.alt || 'Profile Photo'"
        class="profile-photo-image"
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
  componentId: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: () => ({})
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

const componentClasses = computed(() => ({
  'has-photo': !!photo.value,
  'no-photo': !photo.value,
  'pods-source': props.data?.usePodsData && !!profilePhoto.value,
  'custom-source': !props.data?.usePodsData || !profilePhoto.value
}));
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
  max-width: 300px;
  width: 100%;
  height: auto;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  object-fit: cover;
  aspect-ratio: 1 / 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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
