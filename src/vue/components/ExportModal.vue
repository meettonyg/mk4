<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal export-modal" @click.stop>
          <div class="modal__header">
            <h2>Export Media Kit</h2>
            <button @click="close" class="modal__close" title="Close">×</button>
          </div>
          
          <div class="modal__body">
            <div v-if="!exporting" class="export-options">
              <button 
                v-for="format in formats" 
                :key="format.value"
                @click="exportAs(format.value)"
                class="export-option"
              >
                <span class="export-icon">{{ format.icon }}</span>
                <div class="export-info">
                  <h4>{{ format.label }}</h4>
                  <p>{{ format.description }}</p>
                </div>
                <svg class="export-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            
            <div v-else class="export-progress">
              <div class="spinner"></div>
              <h3>Exporting as {{ currentFormatLabel }}</h3>
              <p>{{ exportStatus }}</p>
            </div>
            
            <div v-if="exportError" class="export-error">
              <span class="error-icon">⚠️</span>
              <p>{{ exportError }}</p>
              <button @click="exportError = null" class="btn btn--secondary">Try Again</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import { ExportService } from '../../services/ExportService';

const store = useMediaKitStore();
const exportService = new ExportService();

const isOpen = ref(false);
const exporting = ref(false);
const currentFormat = ref('');
const exportStatus = ref('');
const exportError = ref(null);

const formats = [
  { 
    value: 'html', 
    label: 'HTML Page', 
    icon: '🌐', 
    description: 'Standalone HTML file with embedded styles'
  },
  { 
    value: 'pdf', 
    label: 'PDF Document', 
    icon: '📄', 
    description: 'Printable PDF format (requires print to PDF)'
  },
  { 
    value: 'json', 
    label: 'JSON Data', 
    icon: '💾', 
    description: 'Backup/migration data format'
  },
  { 
    value: 'shortcode', 
    label: 'WordPress Shortcode', 
    icon: '📝', 
    description: 'Copy shortcode to embed in posts/pages'
  }
];

const currentFormatLabel = computed(() => {
  const format = formats.find(f => f.value === currentFormat.value);
  return format ? format.label : '';
});

const open = () => {
  isOpen.value = true;
  exportError.value = null;
};

const close = () => {
  if (!exporting.value) {
    isOpen.value = false;
    currentFormat.value = '';
    exportStatus.value = '';
  }
};

const exportAs = async (format) => {
  exporting.value = true;
  currentFormat.value = format;
  exportError.value = null;
  exportStatus.value = 'Preparing export...';
  
  try {
    // Get current state
    const state = {
      components: store.components,
      sections: store.sections,
      theme: store.theme,
      themeCustomizations: store.themeCustomizations,
      globalSettings: store.globalSettings,
      podsData: store.podsData,
      postTitle: window.gmkbData?.postTitle || 'Media Kit'
    };
    
    exportStatus.value = 'Generating export...';
    
    // Call export service
    await exportService.export(format, state);
    
    exportStatus.value = 'Export complete!';
    
    // Close after short delay
    setTimeout(() => {
      close();
      exporting.value = false;
    }, 1000);
    
  } catch (error) {
    console.error('Export failed:', error);
    exportError.value = error.message || 'Export failed. Please try again.';
    exporting.value = false;
  }
};

// Expose methods for external access
defineExpose({ open, close });

// Listen for global export event
document.addEventListener('gmkb:open-export', open);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.modal {
  background: #ffffff;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal__header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.modal__close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 28px;
  color: #64748b;
  transition: all 0.2s;
}

.modal__close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal__body {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.export-option:hover {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.export-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.export-info {
  flex: 1;
}

.export-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.export-info p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.export-arrow {
  flex-shrink: 0;
  color: #94a3b8;
  transition: transform 0.2s;
}

.export-option:hover .export-arrow {
  transform: translateX(4px);
  color: #3b82f6;
}

.export-progress {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.export-progress h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #1e293b;
}

.export-progress p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.export-error {
  text-align: center;
  padding: 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-top: 16px;
}

.error-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.export-error p {
  margin: 0 0 16px 0;
  color: #dc2626;
  font-size: 14px;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.9) translateY(-20px);
}
</style>
