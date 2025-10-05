<template>
  <div id="gmkb-app" :class="themeClass">
    <!-- Loading State -->
    <LoadingScreen v-if="!isReady" :progress="loadingProgress" />
    
    <!-- Main App -->
    <template v-else>
      <!-- Complete Toolbar with all P0 features -->
      <Teleport to="#gmkb-toolbar">
        <MediaKitToolbarComplete />
      </Teleport>
      
      <!-- Theme Provider - Manages CSS variables -->
      <ThemeProvider />
      
      <!-- Theme Switcher - Integrated with toolbar -->
      <ThemeSwitcher />
      
      <!-- Sidebar Integration - Component list -->
      <SidebarIntegration />
      
      <!-- ROOT FIX: Main builder content renders in #media-kit-preview -->
      <Teleport to="#media-kit-preview" v-if="previewMountReady">
        <SectionLayoutEnhanced />
      </Teleport>
      
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
        
        <!-- Import/Export Modal -->
        <ImportExportModal 
          v-model="showImportExportModal"
          @import-success="handleImportSuccess"
        />
      </Teleport>
    </template>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
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
import ImportExportModal from './ImportExportModal.vue';
import MediaKitToolbarComplete from './MediaKitToolbarComplete.vue';

// Store references
const store = useMediaKitStore();
const { applyTheme } = useTheme();

// Loading states
const isReady = ref(false);
const loadingProgress = ref(0);
const previewMountReady = ref(false); // ROOT FIX: Track preview mount point availability

// Import/Export modal state
const showImportExportModal = ref(false);

// Computed properties
const themeClass = computed(() => `theme-${store.theme || 'professional_clean'}`);

// Handle import/export modal events
function handleOpenImportExport() {
  showImportExportModal.value = true;
}

function handleCloseImportExport() {
  showImportExportModal.value = false;
}

function handleImportSuccess() {
  console.log('✅ Import completed successfully');
  // The store will automatically reload, no need to do anything else
}

// Initialize app with optimized data loading
onMounted(async () => {
  try {
    console.log('🚀 MediaKitApp: Starting Phase 1 initialization');
    loadingProgress.value = 10;
    
    // ROOT FIX: Verify preview mount point exists
    const previewMount = document.getElementById('media-kit-preview');
    if (previewMount) {
      previewMountReady.value = true;
      console.log('✅ Preview mount point ready');
    } else {
      console.warn('⚠️ Preview mount point not found yet, will retry...');
      // Retry after a tick
      await nextTick();
      const retryMount = document.getElementById('media-kit-preview');
      if (retryMount) {
        previewMountReady.value = true;
        console.log('✅ Preview mount point ready (retry)');
      } else {
        console.error('❌ Preview mount point not found!');
      }
    }
    
    // ROOT FIX: Check if store is already initialized (by main.js)
    if (store.isInitialized) {
      console.log('✅ MediaKitApp: Store already initialized by main.js');
      loadingProgress.value = 75;
    } else {
      // This should rarely happen - only if main.js initialization failed
      console.warn('⚠️ MediaKitApp: Store not initialized, performing fallback initialization');
      loadingProgress.value = 25;
      
      try {
        await store.initialize();
        loadingProgress.value = 75;
        console.log('✅ MediaKitApp: Fallback initialization complete');
      } catch (initError) {
        console.error('❌ MediaKitApp: Fallback initialization failed:', initError);
        throw initError;
      }
    }
    
    // Apply theme after data loaded
    await applyTheme();
    loadingProgress.value = 90;
    
    // Mark as ready
    isReady.value = true;
    loadingProgress.value = 100;
    
    // ROOT FIX: Add class to body to show builder UI
    document.body.classList.add('gmkb-vue-ready');
    
    console.log('✅ MediaKitApp: Phase 1 initialization complete');
    console.log('📊 MediaKitApp: Pods data loaded:', store.podsData ? Object.keys(store.podsData).length : 0, 'fields');
    
    // Listen for import/export events
    document.addEventListener('gmkb:open-import-export', handleOpenImportExport);
    document.addEventListener('gmkb:close-import-export', handleCloseImportExport);
    
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

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('gmkb:open-import-export', handleOpenImportExport);
  document.removeEventListener('gmkb:close-import-export', handleCloseImportExport);
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
