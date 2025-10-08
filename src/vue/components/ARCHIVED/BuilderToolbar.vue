<template>
  <div class="builder-toolbar" :class="{ 'dark-mode': isDarkMode }">
    <!-- Left Section -->
    <div class="toolbar-section toolbar-left">
      <div class="branding">
        <div class="brand-logo">Guestify</div>
        <div class="editing-info">
          <span class="editing-label">Editing:</span>
          <span class="document-title">{{ documentTitle }}</span>
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
      <button class="toolbar-btn" @click="$emit('open-theme')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
        <span>Theme</span>
      </button>

      <!-- Export Button -->
      <button class="toolbar-btn toolbar-btn-success" @click="$emit('export')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Export</span>
      </button>

      <!-- Share Button -->
      <button class="toolbar-btn" @click="$emit('share')">
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
        @click="$emit('undo')"
        :disabled="!canUndo"
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
        @click="$emit('redo')"
        :disabled="!canRedo"
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
        @click="$emit('save')"
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
  </div>
</template>

<script setup>
import { ref, computed, provide, watch } from 'vue'

const props = defineProps({
  canUndo: {
    type: Boolean,
    default: false
  },
  canRedo: {
    type: Boolean,
    default: false
  },
  saveStatus: {
    type: String,
    default: 'saved',
    validator: (value) => ['saving', 'saved', 'unsaved'].includes(value)
  },
  documentTitle: {
    type: String,
    default: 'Untitled Media Kit'
  },
  deviceMode: {
    type: String,
    default: 'desktop'
  }
})

const emit = defineEmits(['save', 'undo', 'redo', 'export', 'share', 'open-theme', 'device-change', 'dark-mode-change'])

// Dark mode state
const isDarkMode = ref(false)

// Provide dark mode to child components
provide('isDarkMode', isDarkMode)

// Device options
const devices = ['desktop', 'tablet', 'mobile']

// Save status text
const saveStatusText = computed(() => {
  switch (props.saveStatus) {
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

// Methods
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  emit('dark-mode-change', isDarkMode.value)
  
  // Apply to body for global dark mode
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
  }
}

const setDeviceMode = (device) => {
  emit('device-change', device)
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

initDarkMode()
</script>

<style scoped>
/* Base Toolbar */
.builder-toolbar {
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

.builder-toolbar.dark-mode {
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

/* Responsive */
@media (max-width: 1024px) {
  .editing-info {
    display: none;
  }
}

@media (max-width: 768px) {
  .builder-toolbar {
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
