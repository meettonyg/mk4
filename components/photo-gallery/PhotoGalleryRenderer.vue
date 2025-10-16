<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--photogallery" :data-component-id="componentId">
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
</template>

<script>
export default {
  name: 'PhotoGalleryRenderer',
  props: {
    componentId: String,
    // ROOT FIX: Standardized prop names (data contract)
    title: {
      type: String,
      default: 'Photo Gallery'
    },
    photos: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles */
</style>
