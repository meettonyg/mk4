<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--logogrid" :data-component-id="componentId">
    <div class="component-root logo-grid-content">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    <div class="logo-grid">
      <div v-for="(logo, index) in logos" :key="index" class="logo-item">
        <img :src="logo.url" :alt="logo.name || `Logo ${index + 1}`" />
      </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LogoGridRenderer',
  props: {
    componentId: String,
    title: {
      type: String,
      default: 'As Featured On'
    },
    logos: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles */
</style>
