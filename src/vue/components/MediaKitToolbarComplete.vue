<template>
  <div class="gmkb-toolbar-complete">
    <!-- Left Section: Logo & Title -->
    <div class="toolbar-section toolbar-left">
      <div class="toolbar-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3b82f6"/>
          <path d="M2 17L12 22L22 17" stroke="#3b82f6" stroke-width="2"/>
        </svg>
        <span>Guestify</span>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-title-group">
        <h1 class="toolbar-title">{{ postTitle }}</h1>
        <span class="toolbar-subtitle">Media Kit Builder</span>
      </div>
    </div>
    
    <!-- Center Section: Device Preview & Actions -->
    <div class="toolbar-section toolbar-center">
      <DevicePreview />
      
      <div class="toolbar-divider"></div>
      <!-- Undo -->
      <button 
        @click="handleUndo"
        :disabled="!store.canUndo"
        class="toolbar-btn"
        title="Undo (Ctrl+Z)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 7v6h6M21 17a9 9 0 00-15-6.5L3 13"/>
        </svg>
        <span>Undo</span>
      </button>
      
      <!-- Redo -->
      <button 
        @click="handleRedo"
        :disabled="!store.canRedo"
        class="toolbar-btn"
        title="Redo (Ctrl+Shift+Z)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 7v6h-6M3 17a9 9 0 0115-6.5L21 13"/>
        </svg>
        <span>Redo</span>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <!-- Theme -->
      <button 
        id="global-theme-btn"
        @click.prevent="handleTheme"
        class="toolbar-btn"
        title="Change Theme"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
        <span>Theme</span>
      </button>
      
      <!-- Export -->
      <button 
        @click="handleExport"
        class="toolbar-btn"
        title="Export Media Kit"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        <span>Export</span>
      </button>
      
      <!-- Share -->
      <button 
        @click="handleShare"
        class="toolbar-btn"
        title="Share Media Kit"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
        </svg>
        <span>Share</span>
      </button>
      
    </div>
    
    <!-- Right Section: Status & Save -->
    <div class="toolbar-section toolbar-right">
      <div class="toolbar-status" :class="`toolbar-status--${saveStatus}`">
        <span v-if="saveStatus === 'saving'" class="status-spinner"></span>
        <span v-else class="status-dot"></span>
        <span class="status-text">{{ saveStatusText }}</span>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <!-- Save -->
      <button 
        id="save-btn"
        @click="handleSave"
        :disabled="saveStatus === 'saving'"
        class="toolbar-btn toolbar-btn--primary"
        title="Save Media Kit (Ctrl+S)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
          <path d="M17 21v-8H7v8M7 3v5h8"/>
        </svg>
        <span>{{ saveStatus === 'saving' ? 'Saving...' : 'Save' }}</span>
      </button>
    </div>
    
    <!-- Export Modal -->
    <ExportModal ref="exportModal" />
    
    <!-- Share Modal (placeholder for now) -->
    <Teleport to="body">
      <div v-if="showShareModal" class="modal-overlay" @click.self="showShareModal = false">
        <div class="modal share-modal">
          <div class="modal__header">
            <h2>Share Media Kit</h2>
            <button @click="showShareModal = false" class="modal__close">×</button>
          </div>
          <div class="modal__body">
            <p>Share functionality coming soon!</p>
            <div class="share-link">
              <input 
                type="text" 
                :value="shareLink" 
                readonly 
                class="share-input"
                @click="$event.target.select()"
              />
              <button @click="copyShareLink" class="btn btn--primary">Copy Link</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import DevicePreview from './DevicePreview.vue';
import ExportModal from './ExportModal.vue';

const store = useMediaKitStore();
const exportModal = ref(null);
const showShareModal = ref(false);

// Computed properties
const postTitle = computed(() => window.gmkbData?.postTitle || 'Media Kit');
const saveStatus = computed(() => store.saveStatus);

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saving': return 'Saving...';
    case 'saved': return 'All changes saved';
    case 'unsaved': return 'Unsaved changes';
    default: return '';
  }
});

const shareLink = computed(() => {
  const postId = window.gmkbData?.postId || '';
  return `${window.location.origin}/?mkcg_id=${postId}`;
});

// Action handlers
function handleUndo() {
  store.undo();
  console.log('↩️ Undo action');
}

function handleRedo() {
  store.redo();
  console.log('↪️ Redo action');
}

function handleTheme() {
  // Dispatch custom event for ThemeSwitcher to listen to
  document.dispatchEvent(new CustomEvent('gmkb:open-theme-switcher'));
  console.log('🎨 Theme button clicked - event dispatched');
}

function handleExport() {
  if (exportModal.value) {
    exportModal.value.open();
  }
}

function handleShare() {
  showShareModal.value = true;
}

function copyShareLink() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareLink.value).then(() => {
      alert('Link copied to clipboard!');
    });
  }
}

async function handleSave() {
  try {
    await store.save();
    console.log('✅ Manual save triggered');
  } catch (error) {
    console.error('❌ Save failed:', error);
    alert('Failed to save: ' + error.message);
  }
}

// Keyboard shortcuts
function handleKeyboard(e) {
  // Save: Ctrl+S or Cmd+S
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    handleSave();
  }
  
  // Undo: Ctrl+Z or Cmd+Z
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    if (store.canUndo) handleUndo();
  }
  
  // Redo: Ctrl+Shift+Z or Cmd+Shift+Z
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault();
    if (store.canRedo) handleRedo();
  }
  
  // Export: Ctrl+E or Cmd+E
  if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault();
    handleExport();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyboard);
  console.log('✅ Complete toolbar mounted');
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard);
});
</script>

<style scoped>
.gmkb-toolbar-complete {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  gap: 24px;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-left {
  flex: 0 0 auto;
  min-width: 300px;
}

.toolbar-center {
  flex: 1 1 auto;
  justify-content: center;
}

.toolbar-right {
  flex: 0 0 auto;
  min-width: 250px;
  justify-content: flex-end;
}

/* Logo */
.toolbar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.toolbar-logo svg {
  flex-shrink: 0;
}

/* Title Group */
.toolbar-title-group {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.toolbar-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.toolbar-subtitle {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
}

/* Status Indicator */
.toolbar-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 20px;
  font-size: 12px;
  color: #64748b;
}

.toolbar-status--saving {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.toolbar-status--saved {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.toolbar-status--unsaved {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-text {
  white-space: nowrap;
}

/* Divider */
.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
}

/* Buttons */
.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toolbar-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.toolbar-btn:active:not(:disabled) {
  transform: translateY(0);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn--primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
}

.toolbar-btn--primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.toolbar-btn svg {
  flex-shrink: 0;
}

/* Share Modal */
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
  max-width: 500px;
  width: 90%;
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
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.modal__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 24px;
  color: #64748b;
  transition: all 0.2s;
}

.modal__close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal__body {
  padding: 24px;
}

.share-link {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.share-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  font-family: monospace;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn--primary {
  background: #3b82f6;
  color: #ffffff;
}

.btn--primary:hover {
  background: #2563eb;
}

/* Responsive */
@media (max-width: 1400px) {
  .toolbar-subtitle {
    display: none;
  }
}

@media (max-width: 1200px) {
  .toolbar-title {
    max-width: 200px;
  }
  
  .toolbar-btn span {
    display: none;
  }
  
  .toolbar-btn--primary span {
    display: inline;
  }
}

@media (max-width: 1024px) {
  .toolbar-status-text {
    display: none;
  }
  
  .toolbar-status {
    padding: 6px;
  }
}

@media (max-width: 768px) {
  .gmkb-toolbar-complete {
    padding: 0 12px;
    gap: 8px;
  }
  
  .toolbar-logo span {
    display: none;
  }
  
  .toolbar-title {
    font-size: 14px;
    max-width: 120px;
  }
  
  .toolbar-divider {
    display: none;
  }
  
  .toolbar-btn {
    padding: 8px;
  }
}
</style>
