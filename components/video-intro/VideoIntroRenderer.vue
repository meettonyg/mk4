<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--videointro" :data-component-id="componentId">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    <div class="video-container">
      <iframe
        v-if="videoUrl"
        :src="videoUrl"
        frameborder="0"
        allowfullscreen
        class="video-embed"
      ></iframe>
      <p v-else class="video-placeholder">Add your video URL</p>
    </div>
    <p v-if="description" class="video-description">{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'VideoIntroRenderer',
  props: {
    componentId: String,
    title: String,
    videoUrl: String,
    description: String
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles */
</style>
