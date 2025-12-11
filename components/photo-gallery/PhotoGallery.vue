<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root photo-gallery-component"
  >
    <h2 v-if="title" class="gallery-title">{{ title }}</h2>
    <p v-if="description" class="gallery-description">{{ description }}</p>
    
    <div class="gallery-grid" :class="`columns-${columns || 3}`">
      <div
        v-for="(photo, index) in photos"
        :key="index"
        class="gallery-item"
        @click="openLightbox(index)"
      >
        <img :src="photo.thumbnail || photo.url" :alt="photo.caption || `Photo ${index + 1}`" />
        <div class="gallery-overlay">
          <span class="overlay-icon">🔍</span>
        </div>
      </div>
    </div>
    
    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox" aria-label="Close lightbox">&times;</button>
        <button 
          v-if="photos.length > 1"
          class="lightbox-prev" 
          @click.stop="previousPhoto"
          aria-label="Previous photo"
        >‹</button>
        <img :src="photos[currentPhotoIndex].url" :alt="photos[currentPhotoIndex].caption" />
        <button 
          v-if="photos.length > 1"
          class="lightbox-next" 
          @click.stop="nextPhoto"
          aria-label="Next photo"
        >›</button>
        <p v-if="photos[currentPhotoIndex].caption" class="lightbox-caption">
          {{ photos[currentPhotoIndex].caption }}
        </p>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';

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

// Store
const store = useMediaKitStore();

// Local state
const lightboxOpen = ref(false);
const currentPhotoIndex = ref(0);

// Extract data from both data and props for compatibility
const title = computed(() => props.data?.title || props.props?.title || 'Photo Gallery');
const description = computed(() => props.data?.description || props.props?.description || '');
const columns = computed(() => props.data?.columns || props.props?.columns || 3);

const photos = computed(() => {
  // Handle array format
  if (Array.isArray(props.data?.photos) && props.data.photos.length > 0) {
    return props.data.photos;
  }

  // Build from individual photo fields
  const photosList = [];
  for (let i = 1; i <= 12; i++) {
    const url = props.data?.[`photo_${i}_url`] || props.props?.[`photo_${i}_url`];
    if (url) {
      photosList.push({
        url: url,
        thumbnail: props.data?.[`photo_${i}_thumbnail`] || props.props?.[`photo_${i}_thumbnail`] || url,
        caption: props.data?.[`photo_${i}_caption`] || props.props?.[`photo_${i}_caption`] || ''
      });
    }
  }

  return photosList;
});

const openLightbox = (index) => {
  currentPhotoIndex.value = index;
  lightboxOpen.value = true;
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  lightboxOpen.value = false;
  document.body.style.overflow = '';
};

const nextPhoto = () => {
  if (photos.value.length > 0) {
    currentPhotoIndex.value = (currentPhotoIndex.value + 1) % photos.value.length;
  }
};

const previousPhoto = () => {
  if (photos.value.length > 0) {
    currentPhotoIndex.value = currentPhotoIndex.value === 0 
      ? photos.value.length - 1 
      : currentPhotoIndex.value - 1;
  }
};

// Lifecycle
onMounted(() => {
  if (store.components[props.componentId]) {
    document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
      detail: {
        type: 'photo-gallery',
        id: props.componentId
      }
    }));
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.photo-gallery-component {
  /* Styles applied via inline styles from ComponentStyleService */
}

.gallery-title {
  text-align: center;
  /* font-size and font-weight inherited from component-root */
  margin: 0 0 1rem 0;
  color: inherit;
}

.gallery-description {
  text-align: center;
  opacity: 0.8; /* Use opacity instead of fixed color */
  margin: 0 0 2rem 0;
  /* line-height inherited from component-root */
}

.gallery-grid {
  display: grid;
  gap: 1rem;
}

.gallery-grid.columns-2 {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.gallery-grid.columns-3 {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.gallery-grid.columns-4 {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.gallery-item {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: var(--component-border-radius, 8px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.gallery-item img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
  display: block;
}

.gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.overlay-icon {
  font-size: 2rem;
  color: white;
}

/* Lightbox */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.lightbox img {
  max-width: 90%;
  max-height: 80vh;
  object-fit: contain;
}

.lightbox-close,
.lightbox-prev,
.lightbox-next {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 3rem;
  cursor: pointer;
  padding: 1rem;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.lightbox-close {
  top: 20px;
  right: 40px;
}

.lightbox-prev {
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.lightbox-next {
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.lightbox-close:hover,
.lightbox-prev:hover,
.lightbox-next:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-caption {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  text-align: center;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  max-width: 80%;
}

/* Responsive */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
  }
  
  .gallery-item img {
    height: 180px;
  }
  
  .gallery-title {
    font-size: 1.5rem;
  }
  
  .lightbox-prev,
  .lightbox-next {
    font-size: 2rem;
    padding: 0.5rem;
  }
}
</style>
