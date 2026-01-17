<template>
  <div id="gmkb-app" :class="themeClass">
    <!-- Loading State -->
    <LoadingScreen v-if="!isReady" :progress="loadingProgress" />

    <!-- Template Picker for new media kits without template -->
    <template v-else-if="showTemplatePicker">
      <TemplatePicker
        :templates="availableTemplates"
        :login-url="loginUrl"
        @template-selected="handleTemplateSelected"
        @resume-session="handleResumeSession"
      />
    </template>

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
        <ErrorBoundary :show-details="true">
          <SectionLayoutEnhanced />
        </ErrorBoundary>
      </Teleport>

      <!-- Modals rendered outside main content -->
      <Teleport to="body">
        <!-- Toast Notifications -->
        <ToastContainer />

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
          :initial-tab="importExportModalTab"
          @import-success="handleImportSuccess"
        />
      </Teleport>
    </template>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import { useThemeStore } from '../../stores/theme';
import { useTemplateStore } from '../../stores/templates';
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
import ErrorBoundary from './ErrorBoundary.vue';
import ToastContainer from './ToastContainer.vue';
import TemplatePicker from './TemplatePicker.vue';
import storageService from '../../services/StorageService';

// Store references
const store = useMediaKitStore();
const themeStore = useThemeStore();
const templateStore = useTemplateStore();
const { applyTheme } = useTheme();

// Loading states
const isReady = ref(false);
const loadingProgress = ref(0);
const previewMountReady = ref(false); // ROOT FIX: Track preview mount point availability

// Import/Export modal state
const showImportExportModal = ref(false);
const importExportModalTab = ref('export'); // Track which tab to open

// Template picker state
const urlParams = new URLSearchParams(window.location.search);
const hasTemplateParam = urlParams.has('template') || urlParams.has('resume');
const isNewMediaKit = window.gmkbData?.isNewMediaKit === true;

// Show template picker for new media kits without a template selection
const showTemplatePicker = computed(() => {
  return isNewMediaKit && !hasTemplateParam && isReady.value;
});

// Get available templates from theme store
const availableTemplates = computed(() => themeStore.availableThemes || []);

// Login URL from data
const loginUrl = computed(() => window.gmkbData?.user?.loginUrl || '/wp-login.php');

// Computed properties
const themeClass = computed(() => `theme-${store.theme || 'professional_clean'}`);

// ROOT FIX: Handle separate import and export modal events
function handleOpenImportExport() {
  showImportExportModal.value = true;
}

function handleOpenExport() {
  importExportModalTab.value = 'export';
  showImportExportModal.value = true;
}

function handleOpenImport() {
  importExportModalTab.value = 'import';
  showImportExportModal.value = true;
}

function handleCloseImportExport() {
  showImportExportModal.value = false;
}

function handleImportSuccess() {
  console.log('✅ Import completed successfully');
  // The store will automatically reload, no need to do anything else
}

// Template picker handlers
function handleTemplateSelected(template) {
  console.log('📋 Template selected:', template.id);
  // The TemplatePicker component handles the redirect with ?template=xxx
}

function handleResumeSession() {
  console.log('🔄 Resuming previous session');
  // The TemplatePicker component handles the redirect with ?resume=true
}

// Apply template when URL has template parameter
async function applySelectedTemplate() {
  const templateId = urlParams.get('template');
  if (!templateId) return;

  // Get theme override from URL parameter (allows ?theme=minimal-elegant)
  const themeOverride = urlParams.get('theme');

  console.log('🎨 Applying template:', templateId, themeOverride ? `with theme: ${themeOverride}` : '');

  // Normalize template ID: convert hyphens to underscores for matching
  // URLs use hyphens (author-bold) but theme IDs use underscores (author_bold)
  const normalizedId = templateId.replace(/-/g, '_');

  try {
    // Use templateStore.initializeFromTemplate() which:
    // 1. Fetches full template data via REST API (includes defaultContent)
    // 2. Generates fresh UUIDs for sections/components
    // 3. Properly applies theme and theme customizations
    // 4. Handles both built-in and user templates

    // NOTE: REST API uses directory names (hyphens) as lookup keys
    // Try original hyphenated ID first, then normalized underscored version
    let success = false;
    // Options for template initialization (includes theme override from URL)
    const initOptions = themeOverride ? { themeOverride } : undefined;

    try {
      // Try original (usually hyphenated from URL)
      await templateStore.initializeFromTemplate(templateId, initOptions);
      success = true;
      console.log('✅ Template initialized with ID:', templateId);
    } catch (err) {
      if (normalizedId !== templateId) {
        // Try normalized ID (underscores)
        console.log('🔄 Trying normalized template ID:', normalizedId);
        await templateStore.initializeFromTemplate(normalizedId, initOptions);
        success = true;
        console.log('✅ Template initialized with normalized ID:', normalizedId);
      } else {
        throw err;
      }
    }

    if (success) {
      // Mark as dirty so changes will be saved
      store._trackChange();
    }
  } catch (error) {
    console.error('❌ Failed to apply template:', error);
    // Template API failed - user will see empty builder
    // This should not happen once PHP permissions fix is deployed
  }
}

// Restore session from localStorage backup
function restoreSessionFromBackup() {
  const shouldResume = urlParams.get('resume') === 'true';
  if (!shouldResume) return false;

  const backup = storageService.get('gmkb_anonymous_backup');
  if (!backup) {
    console.warn('No backup found to restore');
    return false;
  }

  console.log('🔄 Restoring session from backup');
  try {
    store.applyState(backup);
    store._trackChange();
    return true;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return false;
  }
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
    
    // ROOT FIX: Stores are ALWAYS initialized before Vue mounts (see main.js)
    // We just verify the state is ready
    if (!store.isInitialized) {
      console.error('❌ MediaKitApp: Store not initialized - this should never happen!');
      console.error('Check main.js initialization order - stores must initialize BEFORE Vue mount');
      throw new Error('Store not initialized - initialization order bug in main.js');
    }
    
    console.log('✅ MediaKitApp: Store already initialized and ready');
    loadingProgress.value = 75;
    
    // ROOT FIX: Log Profile data status for debugging
    const profileFieldCount = store.profileData ? Object.keys(store.profileData).length : 0;
    console.log(`📊 MediaKitApp: Profile data loaded: ${profileFieldCount} fields`);
    if (profileFieldCount > 0 && window.gmkbData?.debugMode) {
      console.log('📊 Profile data fields:', Object.keys(store.profileData));
    }
    
    // Apply theme after data loaded
    await applyTheme();
    loadingProgress.value = 90;

    // Handle template selection or session restore for new media kits
    if (isNewMediaKit && hasTemplateParam) {
      // Try to restore from backup first
      const restored = restoreSessionFromBackup();
      if (!restored) {
        // Apply selected template if no backup to restore
        // IMPORTANT: Await to ensure template components are loaded before marking ready
        await applySelectedTemplate();
      }
    }

    // Mark as ready
    isReady.value = true;
    loadingProgress.value = 100;

    // ROOT FIX: Add class to body to show builder UI
    document.body.classList.add('gmkb-vue-ready');

    console.log('✅ MediaKitApp: Phase 1 initialization complete');
    console.log('📊 MediaKitApp: Profile data loaded:', store.profileData ? Object.keys(store.profileData).length : 0, 'fields');
    
    // ROOT FIX: Listen for BOTH combined and separate import/export events
    document.addEventListener('gmkb:open-import-export', handleOpenImportExport);
    document.addEventListener('gmkb:open-export', handleOpenExport);
    document.addEventListener('gmkb:open-import', handleOpenImport);
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
  document.removeEventListener('gmkb:open-export', handleOpenExport);
  document.removeEventListener('gmkb:open-import', handleOpenImport);
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
