<template>
  <div>
    <!-- ROOT FIX: Use correct CSS classes that match styles.css -->
    <div class="photo-gallery-component" :class="[`layout-${galleryStyle}`]">
      <div class="photo-gallery-container">
        <h3 v-if="title" class="photo-gallery-title">{{ title }}</h3>
        
        <div v-if="displayImages.length > 0" 
             :class="['photo-gallery-grid', `spacing-medium`]"
             :data-columns="columns"
             :data-hover="'zoom'"
             :data-caption-style="showCaptions ? 'hover' : 'none'">
          <div 
            v-for="(image, index) in displayImages" 
            :key="`image-${index}`"
            :class="['photo-item', 'image-standard', getImageOrientation(image)]"
            @click="openLightbox(index)"
          >
            <div class="photo-wrapper">
              <img 
                class="photo-image"
                :src="image.url" 
                :alt="image.alt || `Gallery image ${index + 1}`"
                :loading="lazyLoad ? 'lazy' : 'eager'"
              />
            </div>
            <div v-if="showCaptions && image.caption" class="photo-caption">
              {{ image.caption }}
            </div>
          </div>
        </div>
        <!-- Placeholder when no images -->
        <div v-else class="photo-gallery-placeholder">
          <div class="placeholder-content">
            <div class="placeholder-icon"></div>
            <p>No images in gallery. Click "Edit" to add photos.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
    <div class="lightbox-content" @click.stop>
      <button class="lightbox-close" @click="closeLightbox">×</button>
      <button class="lightbox-prev" @click="prevImage" v-if="currentImageIndex > 0">‹</button>
      <button class="lightbox-next" @click="nextImage" v-if="currentImageIndex < displayImages.length - 1">›</button>
      
      <img 
        :src="displayImages[currentImageIndex].url" 
        :alt="displayImages[currentImageIndex].alt"
      />
      
      <div v-if="displayImages[currentImageIndex].caption" class="lightbox-caption">
        {{ displayImages[currentImageIndex].caption }}
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: 'PhotoGallery',
  props: {
    // Individual image fields from Pods
    vertical_image: {
      type: [String, Object],
      default: ''
    },
    horizontal_image: {
      type: [String, Object],
      default: ''
    },
    guest_headshot: {
      type: [String, Object],
      default: ''
    },
    guest_carousel_images: {
      type: [Array, String],
      default: () => []
    },
    // Manual images array
    images: {
      type: Array,
      default: () => []
    },
    // Display options
    title: {
      type: String,
      default: ''
    },
    columns: {
      type: Number,
      default: 3,
      validator: value => [1, 2, 3, 4, 5, 6].includes(value)
    },
    galleryStyle: {
      type: String,
      default: 'masonry',
      validator: value => ['masonry', 'uniform', 'mixed'].includes(value)
    },
    lazyLoad: {
      type: Boolean,
      default: true
    },
    showCaptions: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      lightboxOpen: false,
      currentImageIndex: 0
    };
  },
  computed: {
    displayImages() {
      const images = [];
      
      // Add manual images first (if provided)
      if (this.images && this.images.length > 0) {
        images.push(...this.normalizeImages(this.images));
      }
      
      // Add Pods images if no manual images provided
      if (images.length === 0) {
        // Add individual Pods images
        if (this.vertical_image) {
          images.push(this.normalizeImage(this.vertical_image, 'vertical'));
        }
        if (this.horizontal_image) {
          images.push(this.normalizeImage(this.horizontal_image, 'horizontal'));
        }
        if (this.guest_headshot) {
          images.push(this.normalizeImage(this.guest_headshot, 'square'));
        }
        
        // Add carousel images
        if (this.guest_carousel_images) {
          const carouselImages = Array.isArray(this.guest_carousel_images) 
            ? this.guest_carousel_images 
            : this.parseCarouselImages(this.guest_carousel_images);
          
          images.push(...this.normalizeImages(carouselImages));
        }
      }
      
      return images.filter(img => img && img.url);
    }
  },
  mounted() {
    // Auto-load from Pods data if available
    if (window.gmkbData?.pods_data && this.displayImages.length === 0) {
      this.loadFromPodsData();
    }
    
    // Add keyboard navigation for lightbox
    window.addEventListener('keydown', this.handleKeyboard);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyboard);
  },
  methods: {
    normalizeImage(image, orientation = 'auto') {
      if (!image) return null;
      
      if (typeof image === 'string') {
        return {
          url: image,
          alt: '',
          caption: '',
          orientation: orientation
        };
      }
      
      return {
        url: image.url || image.src || image,
        alt: image.alt || '',
        caption: image.caption || image.title || '',
        orientation: image.orientation || orientation
      };
    },
    normalizeImages(images) {
      if (!images) return [];
      const imageArray = Array.isArray(images) ? images : [images];
      return imageArray.map(img => this.normalizeImage(img));
    },
    parseCarouselImages(carouselString) {
      // Parse comma-separated URLs or JSON array string
      if (typeof carouselString === 'string') {
        try {
          return JSON.parse(carouselString);
        } catch {
          return carouselString.split(',').map(url => url.trim()).filter(Boolean);
        }
      }
      return [];
    },
    getImageOrientation(image) {
      if (image.orientation && image.orientation !== 'auto') {
        return `orientation-${image.orientation}`;
      }
      // Auto-detect orientation could be added here
      return 'orientation-auto';
    },
    loadFromPodsData() {
      const pods = window.gmkbData.pods_data;
      if (!pods) return;
      
      const updates = {};
      
      if (pods.vertical_image) updates.vertical_image = pods.vertical_image;
      if (pods.horizontal_image) updates.horizontal_image = pods.horizontal_image;
      if (pods.guest_headshot) updates.guest_headshot = pods.guest_headshot;
      if (pods.guest_carousel_images) updates.guest_carousel_images = pods.guest_carousel_images;
      
      if (Object.keys(updates).length > 0) {
        this.$emit('update:modelValue', updates);
      }
    },
    openLightbox(index) {
      this.currentImageIndex = index;
      this.lightboxOpen = true;
      document.body.style.overflow = 'hidden';
    },
    closeLightbox() {
      this.lightboxOpen = false;
      document.body.style.overflow = '';
    },
    nextImage() {
      if (this.currentImageIndex < this.displayImages.length - 1) {
        this.currentImageIndex++;
      }
    },
    prevImage() {
      if (this.currentImageIndex > 0) {
        this.currentImageIndex--;
      }
    },
    handleKeyboard(e) {
      if (!this.lightboxOpen) return;
      
      switch(e.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowRight':
          this.nextImage();
          break;
        case 'ArrowLeft':
          this.prevImage();
          break;
      }
    }
  }
};
</script>

<style scoped>
/* ROOT FIX: Use external styles.css for component styling */
/* Only keep lightbox-specific styles that aren't in the external CSS */

/* Lightbox */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-content img {
  max-width: 100%;
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
  padding: 0.5rem 1rem;
  transition: background 0.2s;
  border-radius: 4px;
}

.lightbox-close:hover,
.lightbox-prev:hover,
.lightbox-next:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-close {
  top: -50px;
  right: 0;
}

.lightbox-prev {
  left: -60px;
  top: 50%;
  transform: translateY(-50%);
}

.lightbox-next {
  right: -60px;
  top: 50%;
  transform: translateY(-50%);
}

.lightbox-caption {
  margin-top: var(--gmkb-spacing-md, 1rem);
  color: white;
  text-align: center;
  font-size: var(--gmkb-font-size-base, 1rem);
}

/* Responsive */
@media (max-width: 768px) {
  .gallery-grid.columns-3,
  .gallery-grid.columns-4,
  .gallery-grid.columns-5,
  .gallery-grid.columns-6 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .gallery-grid.style-masonry .orientation-horizontal {
    grid-column: span 1;
  }
  
  .lightbox-prev,
  .lightbox-next {
    position: fixed;
    bottom: 20px;
    top: auto;
    transform: none;
  }
  
  .lightbox-prev {
    left: 20px;
  }
  
  .lightbox-next {
    right: 20px;
    left: auto;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
