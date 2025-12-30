<template>
  <div class="media-kit-app">
    <!-- Template Directory View -->
    <TemplateDirectory v-if="isDirectoryView" />

    <!-- Builder View -->
    <div v-else class="media-kit-builder">
      <!-- Theme Provider - Renderless component that manages CSS variables -->
      <ThemeProvider />

      <!-- Component Library Modal -->
      <ComponentLibrary />

      <!-- Theme Customizer Modal -->
      <ThemeCustomizer />

      <!-- Section Settings Panel -->
      <SectionSettings />

      <!-- Sections Container -->
      <div class="gmkb-sections-container">
        <!-- Render sections with their components -->
        <SectionRenderer
          v-for="section in sections"
          :key="section.section_id"
          :section="section"
          :components="getSectionComponents(section.section_id)"
          @remove="removeSection"
        />

        <!-- Empty state when no sections - ROOT FIX: Removed add buttons per user request -->
        <div v-if="sections.length === 0" class="gmkb-empty-state">
          <div class="empty-icon">📄</div>
          <h3>Start Building Your Media Kit</h3>
          <p>Use the Layout tab in the sidebar to add sections</p>
        </div>
      </div>

      <!-- Floating Action Button REMOVED - per user request, only sidebar can add sections -->
    </div>

    <!-- Template Demo Overlay (always mounted, visibility controlled internally) -->
    <TemplateDemoOverlay />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import { useUIStore } from '../../stores/ui';
import ThemeProvider from './ThemeProvider.vue';
import SectionRenderer from './SectionRenderer.vue';
import ComponentLibrary from './ComponentLibraryNew.vue';
import ThemeCustomizer from './ThemeCustomizer.vue';
import SectionSettings from './sections/SectionSettings.vue';
import TemplateDirectory from './templates/TemplateDirectory.vue';
import TemplateDemoOverlay from './templates/TemplateDemoOverlay.vue';

// Props
const props = defineProps({
  mode: {
    type: String,
    default: 'auto', // 'auto' | 'directory' | 'builder'
    validator: (v) => ['auto', 'directory', 'builder'].includes(v)
  }
});

const store = useMediaKitStore();
const uiStore = useUIStore();
// showAddMenu removed - no floating button per user request

// Computed properties
const sections = computed(() => store.sections);

// View mode - 'auto' uses UI store, otherwise respect prop
const isDirectoryView = computed(() => {
  if (props.mode === 'directory') return true;
  if (props.mode === 'builder') return false;
  // Auto mode: use UI store state
  return uiStore.isDirectoryView;
});

// Methods
const getSectionComponents = (sectionId) => {
  return store.getSectionComponents(sectionId);
};

const addSection = (layout) => {
  store.addSection(layout);
  
  // Hide empty state container if it exists (for backward compatibility)
  const emptyState = document.getElementById('empty-state');
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Show saved components container if it exists (for backward compatibility)
  const savedContainer = document.getElementById('saved-components-container');
  if (savedContainer) {
    savedContainer.style.display = 'none';
  }
};

const removeSection = (sectionId) => {
  if (confirm('Delete this section and all its components?')) {
    store.removeSection(sectionId);
  }
};
</script>

<style scoped>
.media-kit-app {
  width: 100%;
  height: 100%;
  min-height: 100vh;
}

.media-kit-builder {
  width: 100%;
  height: 100%;
  position: relative;
}

.gmkb-sections-container {
  padding: 20px;
  min-height: 400px;
  width: 100%;
}

/* Empty State */
.gmkb-empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  margin: 40px auto;
  max-width: 600px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.gmkb-empty-state h3 {
  color: #e2e8f0;
  margin-bottom: 10px;
  font-size: 24px;
}

.gmkb-empty-state p {
  color: #94a3b8;
  margin-bottom: 30px;
  font-size: 16px;
}

.empty-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn svg {
  flex-shrink: 0;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: #475569;
  color: white;
}

.btn-secondary:hover {
  background: #64748b;
  transform: translateY(-1px);
}
</style>
