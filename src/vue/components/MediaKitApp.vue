<template>
  <div class="media-kit-builder">
    <!-- Component Library Modal -->
    <ComponentLibrary />
    
    <!-- Theme Customizer Modal -->
    <ThemeCustomizer />
    
    <!-- Enhanced Section Layout with Drag & Drop -->
    <SectionLayoutEnhanced />
  </div>
</template>

<script setup>
import ComponentLibrary from './ComponentLibraryNew.vue';
import ThemeCustomizer from './ThemeCustomizer.vue';
import SectionLayoutEnhanced from './SectionLayoutEnhanced.vue';
</script>

<style scoped>
.media-kit-builder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
