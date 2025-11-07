<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--photogallery" :data-component-id="componentId">
    <div class="component-root photo-gallery-content">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    
    <div class="photo-gallery-grid">
      <div
        v-for="(photo, index) in photos"
        :key="index"
        class="photo-item"
      >
        <img :src="photo.url" :alt="photo.caption || `Photo ${index + 1}`" />
        <div v-if="photo.caption" class="photo-caption">{{ photo.caption }}</div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { usePodsData } from '../../src/composables/usePodsData';

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
  setup(props) {
    // COMPOSITION API: Access Pods data via composable
    const podsData = usePodsData();
    
    // TITLE: Component data > default
    const title = computed(() => {
      return props.data?.title || 'Photo Gallery';
    });
    
    // PHOTOS: Priority is component data > Pods fallback > empty array
    const photos = computed(() => {
      // Priority 1: Component data (user customization)
      if (props.data?.photos && Array.isArray(props.data.photos)) {
        return props.data.photos;
      }
      
      // Priority 2: Pods data (from database)
      // Extract photos from Pods rawPodsData
      if (podsData.rawPodsData?.value) {
        const photosArray = [];
        const rawData = podsData.rawPodsData.value;
        
        // Extract photos 1-20
        for (let i = 1; i <= 20; i++) {
          const photoKey = `gallery_photo_${i}`;
          const captionKey = `gallery_photo_${i}_caption`;
          
          if (rawData[photoKey]) {
            const photo = rawData[photoKey];
            // Handle both URL strings and photo objects
            photosArray.push({
              url: typeof photo === 'object' 
                ? (photo.guid || photo.url || photo.ID) 
                : photo,
              caption: rawData[captionKey] || ''
            });
          }
        }
        
        if (photosArray.length > 0) {
          return photosArray;
        }
      }
      
      // Priority 3: Empty array (will show no photos)
      return [];
    });
    
    return {
      title,
      photos
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles */
</style>
