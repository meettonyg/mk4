<template>
  <div class="media-kit-builder-vue">
    <!-- Theme Provider - Renderless component that manages CSS variables -->
    <ThemeProvider />
    
    <!-- Sidebar Integration - Teleports component list to sidebar -->
    <SidebarIntegration />
    
    <!-- Main builder content - handles both empty and populated states -->
    <SectionLayoutEnhanced />
    
    <!-- Modals are rendered outside the main content area -->
    <Teleport to="body">
      <!-- Component Library Modal -->
      <ComponentLibrary />
      
      <!-- Theme Customizer Modal -->
      <ThemeCustomizer />
      
      <!-- Editor Panel - Self-contained component editors -->
      <EditorPanel />
      
      <!-- Design Panel - Enhanced property editor -->
      <DesignPanel />
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useTheme } from '../composables/useTheme';
import ThemeProvider from './ThemeProvider.vue';
import ComponentLibrary from './ComponentLibraryNew.vue';  // Using the new enhanced version
import ThemeCustomizer from './ThemeCustomizer.vue';
import SectionLayoutEnhanced from './SectionLayoutEnhanced.vue';
import EditorPanel from './EditorPanel.vue';
import SidebarIntegration from './SidebarIntegration.vue';
import DesignPanel from './panels/DesignPanel.vue';

// Initialize theme system
const { applyTheme } = useTheme();

// Apply theme on mount
onMounted(() => {
  applyTheme();
  console.log('✅ MediaKitApp: Theme system initialized');
});
</script>

<style scoped>
/* No custom styles needed - using existing template structure */
</style>
