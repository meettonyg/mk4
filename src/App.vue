<template>
  <div class="media-kit-app" :class="appClasses">
    <!-- Loading State -->
    <LoadingState v-if="mediaKit.isLoading" />
    
    <!-- Error State -->
    <ErrorState 
      v-else-if="mediaKit.hasError" 
      :message="mediaKit.errorMessage"
      @retry="handleRetry" 
    />
    
    <!-- Empty State -->
    <EmptyState 
      v-else-if="mediaKit.shouldShowEmptyState" 
      :pods-data="mediaKit.podsData"
      @add-component="handleAddComponent"
      @add-section="handleAddSection"
      @auto-generate="handleAutoGenerate"
    />
    
    <!-- Builder Canvas -->
    <BuilderCanvas 
      v-else 
      :components="mediaKit.currentComponents"
      :sections="mediaKit.currentSections"
      :layout="mediaKit.currentLayout"
      :theme="mediaKit.activeTheme"
      @update-component="handleUpdateComponent"
      @remove-component="handleRemoveComponent"
      @reorder="handleReorder"
    />
    
    <!-- Component Library Modal -->
    <ComponentLibrary 
      v-if="showComponentLibrary"
      :components="mediaKit.availableComponents"
      @close="showComponentLibrary = false"
      @select="handleComponentSelect"
    />
    
    <!-- Auto-save indicator -->
    <AutoSaveIndicator 
      v-if="wordpress.autoSaveEnabled"
      :last-saved="wordpress.lastAutoSave"
      :is-saving="isSaving"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useMediaKitStore } from './stores/mediaKit';
import { useWordPressIntegration } from './composables/useWordPressIntegration';

// Components
import LoadingState from './vue/components/LoadingState.vue';
import ErrorState from './vue/components/ErrorState.vue';
import EmptyState from './vue/components/EmptyState.vue';
import BuilderCanvas from './vue/components/BuilderCanvas.vue';
import ComponentLibrary from './vue/components/ComponentLibrary.vue';
import AutoSaveIndicator from './vue/components/AutoSaveIndicator.vue';

// Stores and composables
const mediaKit = useMediaKitStore();
const wordpress = useWordPressIntegration();

// Local state
const showComponentLibrary = ref(false);
const isSaving = ref(false);

// Computed properties
const appClasses = computed(() => ({
  'media-kit-app--loading': mediaKit.isLoading,
  'media-kit-app--error': mediaKit.hasError,
  'media-kit-app--empty': mediaKit.shouldShowEmptyState,
  'media-kit-app--has-content': mediaKit.hasContent,
  [`media-kit-app--theme-${mediaKit.globalSettings.theme}`]: true
}));

// Initialize on mount
onMounted(async () => {
  console.log('🚀 Vue App: Mounting Media Kit Builder');
  
  try {
    // Initialize WordPress bridge
    await wordpress.initializeBridge();
    
    // Initialize media kit store
    await mediaKit.initialize();
    
    // Start auto-save
    wordpress.startAutoSave(60000); // Every 60 seconds
    
    // Set up global commands
    setupGlobalCommands();
    
    console.log('✅ Vue App: Initialization complete');
  } catch (error) {
    console.error('❌ Vue App: Initialization failed', error);
  }
});

// Watch for dirty state to update save button
watch(() => mediaKit.isDirty, (isDirty) => {
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    if (isDirty) {
      saveBtn.classList.add('has-changes');
      saveBtn.querySelector('span').textContent = 'Save Changes';
    } else {
      saveBtn.classList.remove('has-changes');
      saveBtn.querySelector('span').textContent = 'Saved';
    }
  }
});

// Event handlers
async function handleRetry() {
  await mediaKit.initialize();
}

function handleAddComponent(type) {
  if (type) {
    const componentId = mediaKit.addComponent(type);
    console.log('➕ Added component:', componentId);
  } else {
    showComponentLibrary.value = true;
  }
}

function handleAddSection(type = 'full') {
  const sectionId = mediaKit.addSection(type);
  console.log('➕ Added section:', sectionId);
}

async function handleAutoGenerate() {
  console.log('⚡ Auto-generating components from Pods data');
  
  // Auto-generate based on available Pods data
  const podsData = mediaKit.podsData;
  
  if (podsData.biography || podsData.guest_biography) {
    mediaKit.addComponent('biography', {
      content: podsData.biography || podsData.guest_biography
    });
  }
  
  if (podsData.topic_1) {
    const topics = [];
    for (let i = 1; i <= 5; i++) {
      if (podsData[`topic_${i}`]) {
        topics.push(podsData[`topic_${i}`]);
      }
    }
    mediaKit.addComponent('topics', { topics });
  }
  
  // Add more auto-generation logic as needed
}

function handleComponentSelect(componentType) {
  showComponentLibrary.value = false;
  handleAddComponent(componentType);
}

function handleUpdateComponent(componentId, updates) {
  mediaKit.updateComponent(componentId, updates);
}

function handleRemoveComponent(componentId) {
  if (confirm('Are you sure you want to remove this component?')) {
    mediaKit.removeComponent(componentId);
  }
}

function handleReorder(newLayout) {
  mediaKit.currentLayout = newLayout;
  mediaKit.isDirty = true;
}

// Global commands setup
function setupGlobalCommands() {
  // Save button
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!isSaving.value) {
        isSaving.value = true;
        try {
          await mediaKit.save();
          showToast('Media kit saved successfully', 'success');
        } catch (error) {
          showToast('Failed to save media kit', 'error');
        } finally {
          isSaving.value = false;
        }
      }
    });
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveBtn?.click();
    }
    
    // Ctrl/Cmd + Z to undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      // Implement undo
    }
    
    // Ctrl/Cmd + Shift + Z to redo
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
      e.preventDefault();
      // Implement redo
    }
  });
}

// Helper function to show toast notifications
function showToast(message, type = 'info') {
  // Implement toast notification
  console.log(`[${type.toUpperCase()}] ${message}`);
}
</script>

<style scoped>
.media-kit-app {
  width: 100%;
  height: 100%;
  position: relative;
  background: var(--gmkb-bg-primary, #ffffff);
  transition: all 0.3s ease;
}

.media-kit-app--loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-kit-app--error {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gmkb-bg-error, #fef2f2);
}

.media-kit-app--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* Theme-specific styles */
.media-kit-app--theme-modern {
  --gmkb-primary: #3b82f6;
  --gmkb-secondary: #8b5cf6;
}

.media-kit-app--theme-classic {
  --gmkb-primary: #1f2937;
  --gmkb-secondary: #4b5563;
}

.media-kit-app--theme-bold {
  --gmkb-primary: #dc2626;
  --gmkb-secondary: #f59e0b;
}

.media-kit-app--theme-minimal {
  --gmkb-primary: #000000;
  --gmkb-secondary: #6b7280;
}
</style>
