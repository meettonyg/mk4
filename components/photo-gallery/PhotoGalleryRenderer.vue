<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--photogallery" :data-component-id="componentId">
    <div class="component-root photo-gallery-content">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    
    <!-- ✅ STANDARD GRID (default/fallback) -->
    <div 
      v-if="layoutStyle === 'grid' || !layoutStyle"
      class="photo-gallery-grid" 
      :data-caption-style="captionStyle"
      :style="gridStyles"
    >
      <div
        v-for="(photo, index) in photos"
        :key="index"
        class="photo-item"
        @click="openLightbox(index)"
        role="button"
        tabindex="0"
        @keydown.enter="openLightbox(index)"
        @keydown.space.prevent="openLightbox(index)"
      >
        <img 
          :src="photo.url" 
          :alt="photo.alt || photo.caption || `Photo ${index + 1}`" 
          :title="photo.caption || undefined"
          loading="lazy"
        />
        <div v-if="photo.caption" class="photo-caption">{{ photo.caption }}</div>
        <!-- Lightbox indicator overlay -->
        <div class="photo-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </div>
      </div>
    </div>

    <!-- ✅ MASONRY LAYOUT -->
    <MasonryGrid
      v-else-if="layoutStyle === 'masonry'"
      :items="photos"
      :column-width="250"
      :gap="20"
      item-key="url"
    >
      <template #item="{ item, index }">
        <div
          class="photo-item photo-item--masonry"
          :data-caption-style="captionStyle"
          @click="openLightbox(index)"
          role="button"
          tabindex="0"
          @keydown.enter="openLightbox(index)"
          @keydown.space.prevent="openLightbox(index)"
        >
          <img 
            :src="item.url" 
            :alt="item.alt || item.caption || `Photo ${index + 1}`" 
            :title="item.caption || undefined"
            loading="lazy"
          />
          <div v-if="item.caption" class="photo-caption">{{ item.caption }}</div>
          <!-- Lightbox indicator overlay -->
          <div class="photo-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </div>
        </div>
      </template>
    </MasonryGrid>

    <!-- ✅ CAROUSEL LAYOUT -->
    <CarouselGrid
      v-else-if="layoutStyle === 'carousel'"
      :items="photos"
      :settings="carouselSettings"
      :space-between="20"
    >
      <template #item="{ item, index }">
        <div
          class="photo-item photo-item--carousel"
          :data-caption-style="captionStyle"
          @click="openLightbox(index)"
          role="button"
          tabindex="0"
          @keydown.enter="openLightbox(index)"
          @keydown.space.prevent="openLightbox(index)"
        >
          <img 
            :src="item.url" 
            :alt="item.alt || item.caption || `Photo ${index + 1}`" 
            :title="item.caption || undefined"
            loading="lazy"
          />
          <div v-if="item.caption" class="photo-caption">{{ item.caption }}</div>
          <!-- Lightbox indicator overlay -->
          <div class="photo-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </div>
        </div>
      </template>
    </CarouselGrid>
    </div>
    
    <!-- Lightbox Component -->
    <Lightbox 
      ref="lightboxRef"
      :items="photos"
      :initial-index="currentPhotoIndex"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { usePodsData } from '@/composables/usePodsData';
import Lightbox from '@/vue/components/shared/Lightbox.vue';
import MasonryGrid from '@/vue/components/shared/MasonryGrid.vue'; // ✅ NEW
import CarouselGrid from '@/vue/components/shared/CarouselGrid.vue'; // ✅ NEW

export default {
  name: 'PhotoGalleryRenderer',
  props: {
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
  },
  components: {
    Lightbox,
    MasonryGrid, // ✅ NEW
    CarouselGrid // ✅ NEW
  },
  setup(props) {
    // COMPOSITION API: Access Pods data via composable
    const { podsData } = usePodsData();
    
    // Lightbox state
    const lightboxRef = ref(null);
    const currentPhotoIndex = ref(0);
    
    // TITLE: Component data > default
    const title = computed(() => {
      return props.data?.title || 'Photo Gallery';
    });
    
    // CAPTION STYLE: Component data > default
    const captionStyle = computed(() => {
      return props.data?.captionStyle || 'overlay';
    });
    
    // ✅ NEW: LAYOUT STYLE: Component data > default (graceful fallback to grid)
    const layoutStyle = computed(() => {
      return props.data?.layoutStyle || 'grid';
    });
    
    // ✅ NEW: CAROUSEL SETTINGS: Component data > defaults
    const carouselSettings = computed(() => {
      return props.data?.carouselSettings || {
        autoplay: true,
        autoplaySpeed: 3000,
        slidesToShow: 3,
        slidesToShowTablet: 2,
        slidesToShowMobile: 1,
        infinite: true,
        arrows: true,
        dots: true
      };
    });
    
    // ✅ NEW: GRID STYLES: Dynamic columns based on component data
    const gridStyles = computed(() => {
      const columns = props.data?.columns || '3';
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '20px',
        width: '100%'
      };
    });
    
    // ROOT FIX: PHOTOS - Priority: component data > Pods data > empty array
    const photos = computed(() => {
      // Priority 1: Use component data if usePodsData is false or component has custom photos
      if (props.data?.usePodsData === false && props.data?.photos && Array.isArray(props.data.photos)) {
        return props.data.photos;
      }
      
      // Priority 2: If usePodsData is true, check Pods for photos
      if (props.data?.usePodsData !== false) {
        const photosArray = [];
        
        // Gallery photos (repeatable field - returns array)
        const galleryPhotos = podsData.value?.gallery_photos;
        if (galleryPhotos && Array.isArray(galleryPhotos) && galleryPhotos.length > 0) {
          galleryPhotos.forEach((photo, index) => {
            if (photo) {
              const photoUrl = typeof photo === 'object' 
                ? (photo.guid || photo.url) 
                : photo;
              const photoCaption = typeof photo === 'object' 
                ? (photo.post_excerpt || photo.caption || '')
                : '';
              
              if (photoUrl) {
                photosArray.push({
                  url: photoUrl,
                  caption: photoCaption,
                  alt: photoCaption || `Photo ${index + 1}`,
                  type: 'gallery',
                  source: 'pods'
                });
              }
            }
          });
        }
        
        // If we found Pods photos, use them
        if (photosArray.length > 0) {
          return photosArray;
        }
      }
      
      // Priority 3: Fall back to component custom photos if no Pods data
      if (props.data?.photos && Array.isArray(props.data.photos)) {
        return props.data.photos;
      }
      
      // Priority 4: Empty array (show no photos)
      return [];
    });
    
    // Open lightbox at specific index
    const openLightbox = (index) => {
      currentPhotoIndex.value = index;
      lightboxRef.value?.open(index);
    };
    
    return {
      title,
      photos,
      captionStyle,
      layoutStyle, // ✅ NEW
      carouselSettings, // ✅ NEW
      gridStyles, // ✅ NEW
      lightboxRef,
      currentPhotoIndex,
      openLightbox
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles */
</style>
