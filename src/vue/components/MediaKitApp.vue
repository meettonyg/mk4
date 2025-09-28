<template>
  <div id="gmkb-app" :class="themeClass">
    <!-- Loading State -->
    <LoadingScreen v-if="!isReady" :progress="loadingProgress" />
    
    <!-- Main App -->
    <template v-else>
      <!-- Theme Provider - Manages CSS variables -->
      <ThemeProvider />
      
      <!-- Theme Switcher - Integrated with toolbar -->
      <ThemeSwitcher />
      
      <!-- Sidebar Integration - Component list -->
      <SidebarIntegration />
      
      <!-- Main builder content -->
      <SectionLayoutEnhanced />
      
      <!-- Modals rendered outside main content -->
      <Teleport to="body">
        <!-- Component Library Modal -->
        <ComponentLibrary />
        
        <!-- Theme Customizer Modal -->
        <ThemeCustomizer />
        
        <!-- Editor Panel -->
        <EditorPanel />
        
        <!-- Design Panel -->
        <DesignPanel />
      </Teleport>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useMediaKitStore } from '../stores/mediaKit';
import { useTheme } from '../composables/useTheme';
import LoadingScreen from './LoadingScreen.vue';
import ThemeProvider from './ThemeProvider.vue';
import ThemeSwitcher from './ThemeSwitcher.vue';
import ComponentLibrary from './ComponentLibraryNew.vue';
import ThemeCustomizer from './ThemeCustomizer.vue';
import SectionLayoutEnhanced from './SectionLayoutEnhanced.vue';
import EditorPanel from './EditorPanel.vue';
import SidebarIntegration from './SidebarIntegration.vue';
import DesignPanel from './panels/DesignPanel.vue';

// Store references
const store = useMediaKitStore();
const { applyTheme } = useTheme();

// Loading states
const isReady = ref(false);
const loadingProgress = ref(0);

// Computed properties
const themeClass = computed(() => `theme-${store.theme || 'professional_clean'}`);

// Initialize app with optimized data loading
onMounted(async () => {
  try {
    console.log('🚀 MediaKitApp: Starting Phase 1 initialization');
    loadingProgress.value = 10;
    
    // PHASE 1: Single API call for ALL data
    console.log('📡 MediaKitApp: Making single API call for all data');
    loadingProgress.value = 25;
    
    await store.initialize(); // Single API call as per Phase 1 specification
    loadingProgress.value = 75;
    console.log('✅ MediaKitApp: Data loaded in single API call');
    
    // Apply theme after data loaded
    await applyTheme();
    loadingProgress.value = 90;
    
    // Mark as ready
    isReady.value = true;
    loadingProgress.value = 100;
    
    console.log('✅ MediaKitApp: Phase 1 initialization complete');
    console.log('📊 MediaKitApp: Pods data loaded:', store.podsData ? Object.keys(store.podsData).length : 0, 'fields');
    
  } catch (error) {
    console.error('❌ MediaKitApp: Initialization failed:', error);
    
    // Show error state
    isReady.value = false;
    
    // Dispatch error event for handling
    window.dispatchEvent(new CustomEvent('gmkb:initialization-error', {
      detail: { error: error.message }
    }));
  }
});
</script>

<style scoped>
#gmkb-app {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Theme class will apply theme-specific styles */
#gmkb-app.theme-professional_clean {
  --color-primary: #1a73e8;
  --color-background: #ffffff;
}

#gmkb-app.theme-modern_dark {
  --color-primary: #bb86fc;
  --color-background: #121212;
}
</style>
