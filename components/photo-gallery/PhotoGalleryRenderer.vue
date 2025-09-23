<template>
  <div class="gmkb-photo-gallery-component" :data-component-id="componentId">
    <div class="gallery-container">
      <h2 v-if="title" class="gallery-title">{{ title }}</h2>
      <p v-if="description" class="gallery-description">{{ description }}</p>
      
      <div class="gallery-grid">
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
      <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
        <button class="lightbox-close">&times;</button>
        <button class="lightbox-prev" @click.stop="previousPhoto">‹</button>
        <img :src="photos[currentPhotoIndex].url" :alt="photos[currentPhotoIndex].caption" />
        <button class="lightbox-next" @click.stop="nextPhoto">›</button>
        <p v-if="photos[currentPhotoIndex].caption" class="lightbox-caption">
          {{ photos[currentPhotoIndex].caption }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhotoGalleryRenderer',
  props: {
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      lightboxOpen: false,
      currentPhotoIndex: 0
    }
  },
  computed: {
    title() {
      return this.data.title || 'Photo Gallery'
    },
    description() {
      return this.data.description || ''
    },
    photos() {
      // Handle array format
      if (Array.isArray(this.data.photos)) {
        return this.data.photos
      }
      
      // Build from individual photo fields
      const photosList = []
      for (let i = 1; i <= 12; i++) {
        if (this.data[`photo_${i}_url`]) {
          photosList.push({
            url: this.data[`photo_${i}_url`],
            thumbnail: this.data[`photo_${i}_thumbnail`] || this.data[`photo_${i}_url`],
            caption: this.data[`photo_${i}_caption`] || ''
          })
        }
      }
      
      return photosList.length ? photosList : this.getDefaultPhotos()
    }
  },
  methods: {
    openLightbox(index) {
      this.currentPhotoIndex = index
      this.lightboxOpen = true
      document.body.style.overflow = 'hidden'
    },
    closeLightbox() {
      this.lightboxOpen = false
      document.body.style.overflow = ''
    },
    nextPhoto() {
      this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.photos.length
    },
    previousPhoto() {
      this.currentPhotoIndex = this.currentPhotoIndex === 0 
        ? this.photos.length - 1 
        : this.currentPhotoIndex - 1
    },
    getDefaultPhotos() {
      return [
        { url: 'https://via.placeholder.com/400x300', caption: 'Event Photo 1' },
        { url: 'https://via.placeholder.com/400x300', caption: 'Event Photo 2' },
        { url: 'https://via.placeholder.com/400x300', caption: 'Event Photo 3' },
        { url: 'https://via.placeholder.com/400x300', caption: 'Event Photo 4' }
      ]
    }
  }
}
</script>

<style scoped>
.gmkb-photo-gallery-component {
  padding: 2rem;
  background: var(--gmkb-color-surface, #fff);
}

.gallery-container {
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-xl, 2rem);
  margin-bottom: 1rem;
}

.gallery-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  margin-bottom: 2rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.gallery-item {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: var(--gmkb-border-radius, 8px);
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0,0,0,0.1));
}

.gallery-item img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
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
  z-index: 1000;
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
  background: none;
  border: none;
  color: white;
  font-size: 3rem;
  cursor: pointer;
  padding: 1rem;
  transition: opacity 0.3s ease;
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
  opacity: 0.7;
}

.lightbox-caption {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  text-align: center;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: var(--gmkb-border-radius, 4px);
}
</style>
