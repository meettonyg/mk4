<template>
  <div class="gmkb-toolbar-complete" :class="{ 'dark-mode': isDarkMode }">
    <!-- Left Section -->
    <div class="toolbar-section toolbar-left">
      <div class="branding">
        <div class="brand-logo">Guestify</div>
        <div class="editing-info">
          <span class="editing-label">Editing:</span>
          <span class="document-title">{{ postTitle }}</span>
        </div>
      </div>
    </div>

    <!-- Center Section - Device Preview -->
    <div class="toolbar-section toolbar-center">
      <div class="device-selector">
        <button
          v-for="device in devices"
          :key="device"
          @click="setDeviceMode(device)"
          class="device-btn"
          :class="{ active: deviceMode === device }"
          :title="`${device} view`"
        >
          {{ device }}
        </button>
      </div>
    </div>

    <!-- Right Section -->
    <div class="toolbar-section toolbar-right">
      <!-- Save Status -->
      <div class="save-status" :class="`save-status--${saveStatus}`">
        <div class="save-indicator"></div>
        <span class="save-text">{{ saveStatusText }}</span>
      </div>

      <!-- Dark Mode Toggle -->
      <button
        @click="toggleDarkMode"
        class="toolbar-btn toolbar-btn-icon"
        :title="isDarkMode ? 'Light mode' : 'Dark mode'"
      >
        <svg v-if="isDarkMode" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>

      <!-- Theme Button -->
      <button class="toolbar-btn" @click="handleTheme">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
        <span>Theme</span>
      </button>

      <!-- Export Button -->
      <button class="toolbar-btn toolbar-btn-success" @click="handleExport">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Export</span>
      </button>

      <!-- Share Button -->
      <button class="toolbar-btn" @click="handleShare">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        <span>Share</span>
      </button>

      <!-- Undo -->
      <button
        @click="handleUndo"
        :disabled="!store.canUndo"
        class="toolbar-btn toolbar-btn-icon"
        title="Undo (Ctrl+Z)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 7v6h6"></path>
          <path d="M21 17a9 9 0 00-15-6.5L3 13"></path>
        </svg>
      </button>

      <!-- Redo -->
      <button
        @click="handleRedo"
        :disabled="!store.canRedo"
        class="toolbar-btn toolbar-btn-icon"
        title="Redo (Ctrl+Shift+Z)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 7v6h-6"></path>
          <path d="M3 17a9 9 0 0115-6.5L21 13"></path>
        </svg>
      </button>

      <!-- Save Button -->
      <button
        @click="handleSave"
        class="toolbar-btn toolbar-btn-primary"
        title="Save (Ctrl+S)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
          <path d="M17 21v-8H7v8M7 3v5h8"></path>
        </svg>
        <span>Save</span>
      </button>
    </div>
    
    <!-- Export Modal -->
    <ExportModal ref="exportModal" />
    
    <!-- Share Modal -->
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
import { ref, computed, provide, watch, onMounted, onUnmounted } from 'vue'
import { useMediaKitStore } from '../../stores/mediaKit'
import ExportModal from './ExportModal.vue'

const store = useMediaKitStore()
const exportModal = ref(null)
const showShareModal = ref(false)

// Dark mode state
const isDarkMode = ref(false)

// Provide dark mode to child components
provide('isDarkMode', isDarkMode)

// Device options
const devices = ['desktop', 'tablet', 'mobile']
const deviceMode = ref('desktop')

// Computed properties
const postTitle = computed(() => window.gmkbData?.postTitle || 'Untitled Media Kit')
const saveStatus = computed(() => store.saveStatus)

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saving':
      return 'Saving...'
    case 'saved':
      return 'Saved'
    case 'unsaved':
      return 'Unsaved changes'
    default:
      return ''
  }
})

const shareLink = computed(() => {
  const postId = window.gmkbData?.postId || ''
  return `${window.location.origin}/?mkcg_id=${postId}`
})

// Methods
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  
  // Apply to body for global dark mode
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
  }
  
  // Dispatch event
  document.dispatchEvent(new CustomEvent('gmkb:dark-mode-change', {
    detail: { isDark: isDarkMode.value }
  }))
  
  console.log('✅ Dark mode:', isDarkMode.value ? 'enabled' : 'disabled')
}

const setDeviceMode = (device) => {
  deviceMode.value = device
  document.dispatchEvent(new CustomEvent('gmkb:device-change', {
    detail: { device }
  }))
  console.log('✅ Device mode changed to:', device)
}

function handleUndo() {
  if (store.canUndo) {
    store.undo()
    console.log('↩️ Undo action')
  }
}

function handleRedo() {
  if (store.canRedo) {
    store.redo()
    console.log('↪️ Redo action')
  }
}

function handleTheme() {
  document.dispatchEvent(new CustomEvent('gmkb:open-theme-switcher', {
    detail: { trigger: 'click' }
  }))
  console.log('🎨 Opened theme switcher')
}

function handleExport() {
  if (exportModal.value) {
    exportModal.value.open()
  }
  console.log('✅ Opened export modal')
}

function handleShare() {
  showShareModal.value = true
}

function copyShareLink() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareLink.value).then(() => {
      alert('Link copied to clipboard!')
    })
  }
}

async function handleSave() {
  try {
    await store.save()
    console.log('✅ Manual save triggered')
  } catch (error) {
    console.error('❌ Save failed:', error)
    alert('Failed to save: ' + error.message)
  }
}

// Keyboard shortcuts
function handleKeyboard(e) {
  // Save: Ctrl+S or Cmd+S
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    handleSave()
  }
  
  // Undo: Ctrl+Z or Cmd+Z
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    if (store.canUndo) handleUndo()
  }
  
  // Redo: Ctrl+Shift+Z or Cmd+Shift+Z
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault()
    if (store.canRedo) handleRedo()
  }
}

// Watch dark mode and sync with localStorage
watch(isDarkMode, (newValue) => {
  localStorage.setItem('gmkb-dark-mode', newValue ? 'true' : 'false')
}, { immediate: true })

// Initialize dark mode from localStorage
const initDarkMode = () => {
  const savedMode = localStorage.getItem('gmkb-dark-mode')
  if (savedMode === 'true') {
    isDarkMode.value = true
    document.body.classList.add('dark-mode')
  }
}

onMounted(() => {
  initDarkMode()
  document.addEventListener('keydown', handleKeyboard)
  console.log('✅ Perfected toolbar mounted')
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
})
</script>

<style>
/* Base Toolbar */
.gmkb-toolbar-complete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  gap: 24px;
  height: 60px;
  transition: all 0.2s;
}

.gmkb-toolbar-complete.dark-mode {
  background: #111827;
  border-bottom-color: #374151;
}

/* Toolbar Sections */
.toolbar-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-left {
  flex: 0 0 auto;
}

.toolbar-center {
  flex: 0 0 auto;
}

.toolbar-right {
  flex: 1;
  justify-content: flex-end;
}

/* Branding */
.branding {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  font-size: 18px;
  font-weight: 700;
  color: #06b6d4;
  letter-spacing: -0.02em;
}

.editing-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.editing-label {
  color: #6b7280;
}

.dark-mode .editing-label {
  color: #9ca3af;
}

.document-title {
  font-weight: 500;
  color: #111827;
}

.dark-mode .document-title {
  color: #f3f4f6;
}

/* Device Selector */
.device-selector {
  display: flex;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}

.dark-mode .device-selector {
  background: #1f2937;
  border-color: #374151;
}

.device-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.device-btn:hover {
  color: #111827;
}

.dark-mode .device-btn {
  color: #9ca3af;
}

.dark-mode .device-btn:hover {
  color: #f3f4f6;
}

.device-btn.active {
  background: #06b6d4;
  color: white;
  box-shadow: 0 2px 4px rgba(6, 182, 212, 0.3);
}

/* Save Status */
.save-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  font-size: 12px;
  transition: all 0.2s;
}

.dark-mode .save-status {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

.save-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.save-status--saving .save-indicator {
  background: #f59e0b;
  animation: pulse 1.5s ease-in-out infinite;
}

.save-status--saved .save-indicator {
  background: #10b981;
}

.save-status--unsaved .save-indicator {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.save-status--saving {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

.save-status--saved {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.save-status--unsaved {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.save-text {
  font-weight: 500;
}

/* Toolbar Buttons */
.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
  border-color: #d1d5db;
}

.toolbar-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dark-mode .toolbar-btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: #374151;
  color: #d1d5db;
}

.dark-mode .toolbar-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: #4b5563;
}

/* Icon-only buttons */
.toolbar-btn-icon {
  padding: 8px;
}

.toolbar-btn-icon span {
  display: none;
}

/* Primary Button (Save) */
.toolbar-btn-primary {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  border-color: #06b6d4;
  color: white;
  box-shadow: 0 2px 4px rgba(6, 182, 212, 0.3);
}

.toolbar-btn-primary:hover {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  border-color: #0891b2;
  box-shadow: 0 4px 8px rgba(6, 182, 212, 0.4);
  transform: translateY(-1px);
}

/* Success Button (Export) */
.toolbar-btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #10b981;
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.toolbar-btn-success:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-color: #059669;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

/* SVG Icons */
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
@media (max-width: 1024px) {
  .editing-info {
    display: none;
  }
}

@media (max-width: 768px) {
  .gmkb-toolbar-complete {
    padding: 8px 12px;
    gap: 8px;
  }
  
  .toolbar-btn span {
    display: none;
  }
  
  .toolbar-btn-icon span {
    display: none;
  }
  
  .save-status {
    display: none;
  }
  
  .device-selector {
    display: none;
  }
}
</style>
