<template>
  <div v-if="isOpen" class="gmkb-modal-overlay" @click.self="close">
    <div class="gmkb-modal import-export-modal">
      <div class="modal-header">
        <h2>{{ $t('Import/Export Media Kit') }}</h2>
        <button @click="close" class="close-btn" aria-label="Close">×</button>
      </div>

      <div class="modal-tabs">
        <button 
          :class="{ active: activeTab === 'export' }"
          @click="activeTab = 'export'"
        >
          Export
        </button>
        <button 
          :class="{ active: activeTab === 'import' }"
          @click="activeTab = 'import'"
        >
          Import
        </button>
      </div>

      <div class="modal-body">
        <!-- Export Tab -->
        <div v-if="activeTab === 'export'" class="export-panel">
          <div class="section-header">
            <h3>Export Options</h3>
            <p>Choose what to export from your media kit</p>
          </div>

          <div class="export-options">
            <label class="radio-option">
              <input 
                type="radio" 
                v-model="exportFormat" 
                value="full"
              >
              <div class="option-content">
                <strong>Full Export</strong>
                <p>Everything including components, content, theme, and settings</p>
              </div>
            </label>

            <label class="radio-option">
              <input 
                type="radio" 
                v-model="exportFormat" 
                value="template"
              >
              <div class="option-content">
                <strong>Template</strong>
                <p>Structure only (layout and component types, no content)</p>
              </div>
            </label>

            <label class="radio-option">
              <input 
                type="radio" 
                v-model="exportFormat" 
                value="components"
              >
              <div class="option-content">
                <strong>Components Only</strong>
                <p>All components with content, no layout or theme</p>
              </div>
            </label>
          </div>

          <div v-if="exportFormat !== 'components'" class="additional-options">
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                v-model="includeTheme"
                :disabled="exportFormat === 'components'"
              >
              <span>Include Theme Settings</span>
            </label>

            <label v-if="exportFormat === 'full'" class="checkbox-option">
              <input 
                type="checkbox" 
                v-model="includePodsData"
              >
              <span>Include Pods Data (Bio, Topics, etc.)</span>
            </label>
          </div>

          <div class="export-preview">
            <h4>What will be exported:</h4>
            <ul>
              <li>{{ componentCount }} components</li>
              <li>{{ sectionCount }} sections</li>
              <li v-if="includeTheme">Theme: {{ currentTheme }}</li>
              <li v-if="includePodsData && exportFormat === 'full'">Pods data included</li>
            </ul>
          </div>

          <button 
            @click="handleExport" 
            class="btn-primary"
            :disabled="isExporting"
          >
            <span v-if="isExporting">Exporting...</span>
            <span v-else>Download {{ exportFormat }} Export</span>
          </button>
        </div>

        <!-- Import Tab -->
        <div v-if="activeTab === 'import'" class="import-panel">
          <div class="section-header">
            <h3>Import Media Kit</h3>
            <p>Upload a previously exported media kit file</p>
          </div>

          <!-- File Drop Zone -->
          <div 
            class="file-drop-zone"
            :class="{ 'drag-over': isDragging, 'has-file': selectedFile }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleFileDrop"
          >
            <div v-if="!selectedFile" class="drop-zone-content">
              <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p class="drop-text">Drag & drop a JSON file here</p>
              <p class="drop-text-or">or</p>
              <label class="file-select-btn">
                <input 
                  type="file" 
                  ref="fileInput"
                  accept=".json,application/json"
                  @change="handleFileSelect"
                  style="display: none;"
                >
                Browse Files
              </label>
            </div>

            <div v-else class="file-selected">
              <svg class="file-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <div class="file-info">
                <p class="file-name">{{ selectedFile.name }}</p>
                <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button @click="clearFile" class="remove-file-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Import Preview -->
          <div v-if="importPreview" class="import-preview">
            <h4>Import Preview</h4>
            <div class="preview-grid">
              <div class="preview-item">
                <span class="label">Format:</span>
                <span class="value">{{ importPreview.format }}</span>
              </div>
              <div class="preview-item">
                <span class="label">Version:</span>
                <span class="value">{{ importPreview.version }}</span>
              </div>
              <div class="preview-item">
                <span class="label">Components:</span>
                <span class="value">{{ importPreview.componentCount }}</span>
              </div>
              <div class="preview-item">
                <span class="label">Sections:</span>
                <span class="value">{{ importPreview.sectionCount }}</span>
              </div>
              <div v-if="importPreview.hasTheme" class="preview-item">
                <span class="label">Theme:</span>
                <span class="value">{{ importPreview.metadata?.theme || 'Included' }}</span>
              </div>
              <div class="preview-item">
                <span class="label">Exported:</span>
                <span class="value">{{ formatDate(importPreview.created) }}</span>
              </div>
            </div>

            <!-- Conflicts Warning -->
            <div v-if="importConflicts.length > 0" class="conflicts-warning">
              <svg class="warning-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div class="conflict-details">
                <p><strong>Conflicts Detected</strong></p>
                <ul>
                  <li v-for="conflict in importConflicts" :key="conflict.type">
                    {{ conflict.count }} duplicate component{{ conflict.count > 1 ? 's' : '' }}
                  </li>
                </ul>
                <div class="conflict-resolution">
                  <label>
                    <input type="radio" v-model="conflictResolution" value="replace">
                    Replace existing components
                  </label>
                  <label>
                    <input type="radio" v-model="conflictResolution" value="rename">
                    Keep both (rename imported)
                  </label>
                  <label>
                    <input type="radio" v-model="conflictResolution" value="skip">
                    Skip duplicates
                  </label>
                </div>
              </div>
            </div>

            <!-- Import Mode Selection -->
            <div class="import-mode">
              <h4>Import Mode</h4>
              <label class="radio-option">
                <input type="radio" v-model="importMode" value="replace">
                <div class="option-content">
                  <strong>Replace All</strong>
                  <p>Clear current media kit and import</p>
                </div>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="importMode" value="merge">
                <div class="option-content">
                  <strong>Merge</strong>
                  <p>Add to existing components</p>
                </div>
              </label>
            </div>

            <button 
              @click="handleImport" 
              class="btn-primary"
              :disabled="isImporting"
            >
              <span v-if="isImporting">Importing...</span>
              <span v-else>Import Media Kit</span>
            </button>
          </div>

          <!-- Import Progress -->
          <div v-if="isImporting" class="import-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${importProgress}%` }"></div>
            </div>
            <p>{{ importProgressText }}</p>
          </div>

          <!-- Import Result -->
          <div v-if="importResult" class="import-result" :class="importResult.success ? 'success' : 'error'">
            <svg v-if="importResult.success" class="result-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <svg v-else class="result-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <div class="result-content">
              <p class="result-message">{{ importResult.message }}</p>
              <ul v-if="importResult.details" class="result-details">
                <li v-for="(detail, index) in importResult.details" :key="index">{{ detail }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="close" class="btn-secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import { useExportImport } from '../../composables/useExportImport';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'import-success']);

const store = useMediaKitStore();
const {
  isExporting,
  isImporting,
  importPreview,
  importConflicts,
  exportMediaKit,
  validateImport,
  executeImport,
  loadImportFile
} = useExportImport();

// Local state
const activeTab = ref('export');
const exportFormat = ref('full');
const includeTheme = ref(true);
const includePodsData = ref(false);
const selectedFile = ref(null);
const isDragging = ref(false);
const conflictResolution = ref('replace');
const importMode = ref('replace');
const importProgress = ref(0);
const importProgressText = ref('');
const importResult = ref(null);
const fileInput = ref(null);

// Computed properties
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const componentCount = computed(() => Object.keys(store.components).length);
const sectionCount = computed(() => store.sections.length);
const currentTheme = computed(() => store.theme || 'professional_clean');

// Methods
function close() {
  isOpen.value = false;
  resetState();
}

function resetState() {
  selectedFile.value = null;
  importResult.value = null;
  importProgress.value = 0;
  importProgressText.value = '';
  conflictResolution.value = 'replace';
  importMode.value = 'replace';
}

async function handleExport() {
  try {
    await exportMediaKit(exportFormat.value);
    
    // Show success notification
    store.showNotification('Export downloaded successfully', 'success');
    
    // Close modal after a brief delay
    setTimeout(() => {
      close();
    }, 1000);
  } catch (error) {
    console.error('Export failed:', error);
    store.showNotification('Export failed: ' + error.message, 'error');
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    processFile(file);
  }
}

function handleFileDrop(event) {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) {
    processFile(file);
  }
}

async function processFile(file) {
  // Validate file type
  if (!file.name.endsWith('.json') && file.type !== 'application/json') {
    store.showNotification('Please select a JSON file', 'error');
    return;
  }

  selectedFile.value = file;

  try {
    // Read file content
    importProgressText.value = 'Reading file...';
    const content = await loadImportFile(file);
    
    // Validate import
    importProgressText.value = 'Validating...';
    const validation = await validateImport(content);
    
    if (!validation.valid) {
      store.showNotification('Invalid import file: ' + validation.error, 'error');
      selectedFile.value = null;
      return;
    }

    importProgressText.value = '';
  } catch (error) {
    console.error('File processing failed:', error);
    store.showNotification('Failed to read file: ' + error.message, 'error');
    selectedFile.value = null;
  }
}

function clearFile() {
  selectedFile.value = null;
  importResult.value = null;
  importProgress.value = 0;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function handleImport() {
  if (!selectedFile.value) return;

  try {
    importProgress.value = 0;
    importProgressText.value = 'Starting import...';
    importResult.value = null;

    // Prepare resolutions
    const resolutions = {};
    if (importConflicts.value.length > 0) {
      resolutions.duplicate_components = conflictResolution.value;
    }

    importProgress.value = 25;
    importProgressText.value = 'Reading import data...';

    // Read file again for execution
    const content = await loadImportFile(selectedFile.value);
    const validation = await validateImport(content);

    importProgress.value = 50;
    importProgressText.value = 'Importing components...';

    // Execute import
    await executeImport(validation.data, resolutions);

    importProgress.value = 100;
    importProgressText.value = 'Import complete!';

    // Show success result
    importResult.value = {
      success: true,
      message: 'Media kit imported successfully!',
      details: [
        `${importPreview.value.componentCount} components imported`,
        `${importPreview.value.sectionCount} sections created`,
        importPreview.value.hasTheme ? 'Theme applied' : ''
      ].filter(Boolean)
    };

    // Emit success event
    emit('import-success');

    // Close modal after delay
    setTimeout(() => {
      close();
    }, 2000);

  } catch (error) {
    console.error('Import failed:', error);
    importResult.value = {
      success: false,
      message: 'Import failed: ' + error.message
    };
    store.showNotification('Import failed: ' + error.message, 'error');
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Expose methods for parent components if needed
defineExpose({
  open: () => { isOpen.value = true; },
  close
});
</script>

<style scoped>
.gmkb-modal-overlay {
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
  padding: 20px;
}

.gmkb-modal {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
}

.modal-tabs button {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-tabs button.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.modal-tabs button:hover {
  color: #111827;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.section-header p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.export-options,
.import-mode {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-option:hover {
  border-color: #cbd5e1;
  background: #f9fafb;
}

.radio-option input[type="radio"] {
  margin-top: 2px;
  flex-shrink: 0;
}

.radio-option input[type="radio"]:checked + .option-content strong {
  color: #2563eb;
}

.option-content strong {
  display: block;
  margin-bottom: 4px;
  color: #111827;
  font-size: 14px;
}

.option-content p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.additional-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #111827;
}

.checkbox-option input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.export-preview {
  padding: 16px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  margin-bottom: 24px;
}

.export-preview h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
}

.export-preview ul {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: #1e3a8a;
}

.export-preview li {
  margin-bottom: 4px;
}

.file-drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
  margin-bottom: 24px;
}

.file-drop-zone:hover,
.file-drop-zone.drag-over {
  border-color: #2563eb;
  background: #eff6ff;
}

.file-drop-zone.has-file {
  padding: 20px;
  cursor: default;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  color: #9ca3af;
}

.drop-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.drop-text-or {
  margin: 8px 0;
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.file-select-btn {
  display: inline-block;
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.file-select-btn:hover {
  background: #1d4ed8;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f3f4f6;
  border-radius: 8px;
}

.file-icon {
  color: #6b7280;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  word-break: break-all;
}

.file-size {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.remove-file-btn {
  background: #ef4444;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.remove-file-btn:hover {
  background: #dc2626;
}

.import-preview {
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
}

.import-preview h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-item .label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.conflicts-warning {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
  margin-bottom: 20px;
}

.warning-icon {
  color: #d97706;
  flex-shrink: 0;
}

.conflict-details {
  flex: 1;
}

.conflict-details strong {
  color: #92400e;
}

.conflict-details ul {
  margin: 8px 0;
  padding-left: 20px;
  font-size: 14px;
  color: #78350f;
}

.conflict-resolution {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.conflict-resolution label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #78350f;
  cursor: pointer;
}

.import-progress {
  margin-top: 20px;
  padding: 20px;
  background: #f3f4f6;
  border-radius: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  transition: width 0.3s ease;
}

.import-progress p {
  margin: 0;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.import-result {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.import-result.success {
  background: #ecfdf5;
  border: 1px solid #d1fae5;
}

.import-result.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.result-icon {
  flex-shrink: 0;
}

.import-result.success .result-icon {
  color: #059669;
}

.import-result.error .result-icon {
  color: #dc2626;
}

.result-content {
  flex: 1;
}

.result-message {
  margin: 0 0 8px 0;
  font-weight: 600;
  font-size: 14px;
}

.import-result.success .result-message {
  color: #065f46;
}

.import-result.error .result-message {
  color: #991b1b;
}

.result-details {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
}

.import-result.success .result-details {
  color: #047857;
}

.import-result.error .result-details {
  color: #b91c1c;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Responsive */
@media (max-width: 640px) {
  .gmkb-modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
