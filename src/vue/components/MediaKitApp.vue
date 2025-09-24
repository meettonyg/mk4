<template>
  <div class="media-kit-builder">
    <!-- Theme Provider - Renderless component that manages CSS variables -->
    <ThemeProvider />
    
    <!-- Component Library Modal -->
    <ComponentLibrary />
    
    <!-- Theme Customizer Modal -->
    <ThemeCustomizer />
    
    <!-- Enhanced Section Layout with Drag & Drop -->
    <SectionLayoutEnhanced />
    
    <!-- Editor Panel - Self-contained component editors -->
    <EditorPanel />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useTheme } from '../composables/useTheme';
import ThemeProvider from './ThemeProvider.vue';
import ComponentLibrary from './ComponentLibraryNew.vue';
import ThemeCustomizer from './ThemeCustomizer.vue';
import SectionLayoutEnhanced from './SectionLayoutEnhanced.vue';
import EditorPanel from './EditorPanel.vue';

// Initialize theme system
const { applyTheme } = useTheme();

// Apply theme on mount
onMounted(() => {
  applyTheme();
  console.log('✅ MediaKitApp: Theme system initialized');
});
</script>

<style scoped>
.media-kit-builder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
