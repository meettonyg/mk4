<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="isVisible" class="template-demo-overlay">
        <!-- Header Toolbar -->
        <header class="demo-header">
          <div class="demo-header-left">
            <button class="btn-back" @click="handleClose">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>Back to Templates</span>
            </button>
          </div>

          <div class="demo-header-center">
            <h2 v-if="template">{{ template.name }}</h2>
            <div v-if="template" class="template-meta">
              <span v-if="template.is_premium" class="badge premium">PRO</span>
              <span class="category">{{ template.category }}</span>
            </div>
          </div>

          <div class="demo-header-right">
            <div class="device-switcher">
              <button
                v-for="device in devices"
                :key="device.id"
                class="device-btn"
                :class="{ active: activeDevice === device.id }"
                @click="activeDevice = device.id"
                :title="device.label"
              >
                <component :is="device.icon" />
              </button>
            </div>
            <button class="btn-use-template" @click="handleUseTemplate">
              Use This Template
            </button>
          </div>
        </header>

        <!-- Preview Frame -->
        <div class="demo-content" :class="`device-${activeDevice}`">
          <div class="preview-frame" :style="frameStyle">
            <div v-if="isLoading" class="preview-loading">
              <div class="loading-spinner"></div>
              <p>Loading preview...</p>
            </div>

            <div v-else-if="error" class="preview-error">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              <p>{{ error }}</p>
              <button @click="loadPreview">Retry</button>
            </div>

            <!-- Render preview content -->
            <div v-else class="preview-render">
              <MediaKitPreview
                v-if="previewData"
                :sections="previewData.sections"
                :components="previewData.components"
                :theme="previewData.theme"
                :theme-customizations="previewData.themeCustomizations"
                :read-only="true"
              />
            </div>
          </div>
        </div>

        <!-- Footer Info -->
        <footer v-if="template?.description" class="demo-footer">
          <p>{{ template.description }}</p>
          <div v-if="template.tags?.length" class="template-tags">
            <span v-for="tag in template.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, h, defineAsyncComponent } from 'vue';
import { useTemplateStore } from '../../../stores/templates';
import { useUIStore } from '../../../stores/ui';

// Async load MediaKitPreview with loading/error handling
const MediaKitPreview = defineAsyncComponent({
  loader: () => import('../MediaKitPreview.vue'),
  loadingComponent: {
    template: '<div class="preview-loading"><div class="loading-spinner"></div><p>Loading preview...</p></div>'
  },
  errorComponent: {
    template: '<div class="preview-error"><p>Error loading preview component.</p></div>'
  },
  delay: 200,
  timeout: 15000
});

const templateStore = useTemplateStore();
const uiStore = useUIStore();

// State
const isLoading = ref(false);
const error = ref(null);
const previewData = ref(null);
const activeDevice = ref('desktop');

// Device options with Font Awesome icons
const devices = [
  {
    id: 'desktop',
    label: 'Desktop',
    icon: () => h('i', { class: 'fa-solid fa-desktop' })
  },
  {
    id: 'tablet',
    label: 'Tablet',
    icon: () => h('i', { class: 'fa-solid fa-tablet-screen-button' })
  },
  {
    id: 'mobile',
    label: 'Mobile',
    icon: () => h('i', { class: 'fa-solid fa-mobile-screen-button' })
  }
];

// Computed
const isVisible = computed(() => uiStore.isDemoActive);

const template = computed(() => {
  if (!uiStore.templateDemoId) return null;
  return templateStore.getById(uiStore.templateDemoId);
});

const frameStyle = computed(() => {
  switch (activeDevice.value) {
    case 'tablet':
      return { maxWidth: '768px' };
    case 'mobile':
      return { maxWidth: '375px' };
    default:
      return { maxWidth: '100%' };
  }
});

// Methods
const loadPreview = async () => {
  if (!uiStore.templateDemoId) return;

  isLoading.value = true;
  error.value = null;

  try {
    const fullTemplate = await templateStore.fetchTemplate(uiStore.templateDemoId);

    if (fullTemplate) {
      const sectionsSource = fullTemplate.sections ||
        fullTemplate.defaultContent?.sections ||
        fullTemplate.content?.defaultContent?.sections ||
        [];

      // Process template content for preview
      previewData.value = {
        sections: processPreviewSections(sectionsSource),
        components: {},
        theme: fullTemplate.theme_id || fullTemplate.theme || 'professional_clean',
        themeCustomizations: fullTemplate.themeCustomizations || {}
      };

      // Generate preview components
      if (sectionsSource.length > 0) {
        generatePreviewComponents(sectionsSource);
      }
    }
  } catch (err) {
    console.error('Failed to load preview:', err);
    error.value = 'Failed to load template preview';
  } finally {
    isLoading.value = false;
  }
};

const processPreviewSections = (sections) => {
  return sections.map((section, idx) => ({
    section_id: `preview_sec_${idx}`,
    layout: section.type,
    type: section.type,
    components: [],
    columns: {}
  }));
};

const generatePreviewComponents = (sections) => {
  let compIndex = 0;

  sections.forEach((section, sIdx) => {
    const sectionId = `preview_sec_${sIdx}`;
    const previewSection = previewData.value.sections[sIdx];

    // Full width components
    if (section.components) {
      section.components.forEach(comp => {
        const compId = `preview_comp_${compIndex++}`;
        previewSection.components.push(compId);
        previewData.value.components[compId] = {
          component_id: compId,
          type: comp.type,
          section_id: sectionId,
          settings: comp.settings || {},
          data: comp.data || {},
          customization: {}
        };
      });
    }

    // Column components
    if (section.columns) {
      for (const [colNum, colComponents] of Object.entries(section.columns)) {
        if (!Array.isArray(colComponents)) {
          continue;
        }

        previewSection.columns[colNum] = [];
        colComponents.forEach(comp => {
          const compId = `preview_comp_${compIndex++}`;
          previewSection.columns[colNum].push(compId);
          previewData.value.components[compId] = {
            component_id: compId,
            type: comp.type,
            section_id: sectionId,
            column: parseInt(colNum, 10),
            settings: comp.settings || {},
            data: comp.data || {},
            customization: {}
          };
        });
      }
    }
  });
};

const handleClose = () => {
  uiStore.closeTemplateDemo();
  previewData.value = null;
  error.value = null;
};

const handleUseTemplate = async () => {
  if (!uiStore.templateDemoId) return;

  // Check if we're on the standalone template picker page
  const pickerData = window.gmkbTemplatePickerData;
  if (pickerData?.isTemplatePicker) {
    // Redirect to builder with template parameter (same as Select button)
    const builderUrl = pickerData.builderUrl || '/tools/media-kit/';
    const url = new URL(builderUrl, window.location.origin);
    url.searchParams.set('template', uiStore.templateDemoId);
    window.location.href = url.toString();
    return;
  }

  // In-app mode: initialize template directly
  try {
    await templateStore.initializeFromTemplate(uiStore.templateDemoId);
    uiStore.closeTemplateDemo();
  } catch (err) {
    console.error('Failed to use template:', err);
    uiStore.showToast?.('Failed to load template', 'error');
  }
};

// Handle escape key
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isVisible.value) {
    handleClose();
  }
};

// Watchers
watch(() => uiStore.templateDemoId, (newId) => {
  if (newId) {
    loadPreview();
  }
}, { immediate: true });

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.template-demo-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #0f0f0f;
  display: flex;
  flex-direction: column;
}

/* Header */
.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  flex-shrink: 0;
}

.demo-header-left,
.demo-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.demo-header-right {
  justify-content: flex-end;
}

.demo-header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.demo-header-center h2 {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.template-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.template-meta .badge.premium {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-weight: 700;
}

.template-meta .category {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: capitalize;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.btn-back:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* Device Switcher */
.device-switcher {
  display: flex;
  background: #2a2a2a;
  border-radius: 6px;
  padding: 0.25rem;
}

.device-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 32px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.device-btn:hover {
  color: #9ca3af;
}

.device-btn.active {
  background: #3b82f6;
  color: white;
}

.btn-use-template {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-use-template:hover {
  background: #2563eb;
  transform: scale(1.02);
}

/* Content */
.demo-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  overflow: auto;
  background: #1a1a1a;
}

.preview-frame {
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  transition: max-width 0.3s ease;
  min-height: 600px;
}

.device-tablet .preview-frame {
  max-width: 768px;
}

.device-mobile .preview-frame {
  max-width: 375px;
}

/* Loading State */
.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #9ca3af;
}

.preview-error svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.preview-error p {
  margin: 0 0 1rem;
  font-size: 0.9375rem;
}

.preview-error button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
}

/* Preview Render */
.preview-render {
  min-height: 100%;
}

/* Footer */
.demo-footer {
  padding: 1rem 1.5rem;
  background: #1a1a1a;
  border-top: 1px solid #333;
  text-align: center;
  flex-shrink: 0;
}

.demo-footer p {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0 0 0.5rem;
}

.template-tags {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: #2a2a2a;
  color: #9ca3af;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
}

/* Transitions */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .demo-header {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }

  .demo-header-left,
  .demo-header-right {
    flex: auto;
  }

  .demo-header-center {
    order: -1;
    width: 100%;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #333;
  }

  .btn-back span {
    display: none;
  }

  .demo-content {
    padding: 1rem;
  }

  .device-switcher {
    display: none;
  }
}
</style>
