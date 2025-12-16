<template>
  <div v-if="hasImages" class="profile-image-picker">
    <div class="picker-header">
      <span class="picker-icon">{{ icon }}</span>
      <span class="picker-title">{{ title }}</span>
    </div>
    <div class="picker-grid">
      <div
        v-for="image in availableImages"
        :key="image.id"
        class="picker-item"
        :class="{ 'picker-item--selected': isSelected(image) }"
        @click="selectImage(image)"
        :title="image.alt || 'Profile image'"
      >
        <img
          :src="image.sizes?.thumbnail || image.sizes?.medium || image.url"
          :alt="image.alt || 'Profile image'"
        />
        <div v-if="isSelected(image)" class="picker-check">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import profileBrandingService from '../../../services/ProfileBrandingService';

const props = defineProps({
  /**
   * Type of images to show: 'headshots', 'logos', or 'all'
   */
  type: {
    type: String,
    default: 'headshots',
    validator: (v) => ['headshots', 'logos', 'carousel', 'all'].includes(v)
  },
  /**
   * Currently selected image (for highlighting)
   */
  selectedId: {
    type: [Number, String],
    default: null
  },
  /**
   * Title to display
   */
  title: {
    type: String,
    default: 'Use from Profile'
  },
  /**
   * Icon to display
   */
  icon: {
    type: String,
    default: '👤'
  }
});

const emit = defineEmits(['select']);

/**
 * Get available images based on type
 */
const availableImages = computed(() => {
  const images = [];

  if (props.type === 'headshots' || props.type === 'all') {
    const headshots = profileBrandingService.getAllHeadshots();
    images.push(...headshots);
  }

  if (props.type === 'logos' || props.type === 'all') {
    const logos = profileBrandingService.getLogos();
    images.push(...logos);
  }

  if (props.type === 'carousel' || props.type === 'all') {
    const carousel = profileBrandingService.getCarouselImages();
    images.push(...carousel);
  }

  return images.filter(img => img && img.url);
});

/**
 * Check if there are any images to show
 */
const hasImages = computed(() => availableImages.value.length > 0);

/**
 * Check if an image is currently selected
 */
const isSelected = (image) => {
  return props.selectedId && image.id === props.selectedId;
};

/**
 * Handle image selection
 */
const selectImage = (image) => {
  emit('select', {
    id: image.id,
    url: image.url,
    alt: image.alt || '',
    sizes: image.sizes || {},
    source: 'profile'
  });
};
</script>

<style scoped>
.profile-image-picker {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.picker-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #166534;
}

.picker-icon {
  font-size: 16px;
}

.picker-title {
  flex: 1;
}

.picker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.picker-item {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.picker-item:hover {
  border-color: #22c55e;
  transform: scale(1.05);
}

.picker-item--selected {
  border-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
}

.picker-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.picker-check {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  background: #22c55e;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dark mode support */
body.dark-mode .profile-image-picker {
  background: linear-gradient(135deg, #052e16 0%, #14532d 100%);
  border-color: #166534;
}

body.dark-mode .picker-header {
  color: #86efac;
}
</style>
