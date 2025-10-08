<template>
  <div class="media-kit-builder">
    <BuilderToolbar 
      @add-section="showSectionSelector = true"
      @save="save"
      @undo="store.undo"
      @redo="store.redo"
      @export="exportMediaKit"
      @share="shareMediaKit"
      @open-theme="openThemeCustomizer"
      @device-change="handleDeviceChange"
      @dark-mode-change="handleDarkModeChange"
      :can-undo="store.canUndo"
      :can-redo="store.canRedo"
      :save-status="store.saveStatus"
      :document-title="documentTitle"
      :device-mode="deviceMode"
    />

    <div class="builder-content">
      <draggable 
        v-model="sections"
        group="sections"
        handle=".section-handle"
        :animation="200"
        :ghost-class="'section-ghost'"
        :drag-class="'section-drag'"
        @start="onSectionDragStart"
        @end="onSectionDragEnd"
        item-key="section_id"
      >
        <template #item="{ element }">
          <Section 
            :key="element.section_id"
            :section-id="element.section_id"
            :section="element"
            :is-editing="isEditMode"
            @duplicate="duplicateSection(element.section_id)"
            @remove="removeSection(element.section_id)"
            @update="updateSection(element.section_id, $event)"
          />
        </template>
      </draggable>

      <EmptyState 
        v-if="sections.length === 0"
        @add-section="showSectionSelector = true"
      />
    </div>

    <!-- Section Selector Modal -->
    <SectionSelector 
      v-if="showSectionSelector"
      @select="addSection"
      @close="showSectionSelector = false"
    />

    <!-- Toast Notifications -->
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <Toast 
        v-for="notification in notifications"
        :key="notification.id"
        :type="notification.type"
        :message="notification.message"
        @close="removeNotification(notification.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useMediaKitStore } from '@/stores/mediaKit'
import draggable from 'vuedraggable'
import Section from './sections/Section.vue'
import BuilderToolbar from './BuilderToolbar.vue'
import EmptyState from './EmptyState.vue'
import SectionSelector from './SectionSelector.vue'
import Toast from './Toast.vue'

const store = useMediaKitStore()
const { sections } = storeToRefs(store)

// UI State
const showSectionSelector = ref(false)
const isEditMode = ref(true)
const notifications = ref([])
const deviceMode = ref('desktop')
const documentTitle = computed(() => store.title || 'Untitled Media Kit')

// Section management
function addSection(layout = 'full_width') {
  const sectionId = store.addSection(layout)
  showSectionSelector.value = false
  showNotification(`Added ${layout.replace('_', ' ')} section`, 'success')
  
  // Scroll to new section
  setTimeout(() => {
    const element = document.querySelector(`[data-section-id="${sectionId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

function duplicateSection(sectionId) {
  const section = store.sections.find(s => s.section_id === sectionId)
  if (section) {
    const newSectionId = store.addSection(section.layout || section.type)
    
    // Copy components to new section
    if (section.components) {
      section.components.forEach(compId => {
        const comp = store.components[compId]
        if (comp) {
          store.addComponent({
            ...comp,
            sectionId: newSectionId
          })
        }
      })
    }
    
    // Copy column components
    if (section.columns) {
      Object.entries(section.columns).forEach(([col, components]) => {
        components.forEach(compId => {
          const comp = store.components[compId]
          if (comp) {
            store.addComponent({
              ...comp,
              sectionId: newSectionId,
              column: parseInt(col)
            })
          }
        })
      })
    }
    
    showNotification('Section duplicated', 'success')
  }
}

function removeSection(sectionId) {
  store.removeSection(sectionId)
  showNotification('Section removed', 'info')
}

function updateSection(sectionId, updates) {
  store.updateSection(sectionId, updates)
  showNotification('Section updated', 'success')
}

// Drag handlers for sections
function onSectionDragStart() {
  console.log('🎯 Section drag started')
}

function onSectionDragEnd() {
  console.log('✅ Section drag ended')
  store._trackChange()
}

// Save handler
async function save() {
  try {
    await store.save()
    showNotification('Media kit saved successfully', 'success')
  } catch (error) {
    showNotification(`Save failed: ${error.message}`, 'error')
  }
}

// Export handler
function exportMediaKit() {
  document.dispatchEvent(new CustomEvent('gmkb:open-export'))
  console.log('✅ Opened export modal')
}

// Share handler
function shareMediaKit() {
  // TODO: Implement share functionality
  showNotification('Share functionality coming soon', 'info')
}

// Theme customizer handler
function openThemeCustomizer() {
  document.dispatchEvent(new CustomEvent('gmkb:open-theme-customizer'))
  console.log('✅ Opened theme customizer')
}

// Device change handler
function handleDeviceChange(device) {
  deviceMode.value = device
  document.dispatchEvent(new CustomEvent('gmkb:device-change', {
    detail: { device }
  }))
  console.log('✅ Device mode changed to:', device)
}

// Dark mode handler
function handleDarkModeChange(isDark) {
  document.dispatchEvent(new CustomEvent('gmkb:dark-mode-change', {
    detail: { isDark }
  }))
  console.log('✅ Dark mode:', isDark ? 'enabled' : 'disabled')
}

// Notification system
function showNotification(message, type = 'info') {
  const notification = {
    id: Date.now(),
    message,
    type,
    timeout: setTimeout(() => {
      removeNotification(notification.id)
    }, 5000)
  }
  notifications.value.push(notification)
}

function removeNotification(id) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    clearTimeout(notifications.value[index].timeout)
    notifications.value.splice(index, 1)
  }
}

// Keyboard shortcuts
function handleKeyboard(event) {
  // Ctrl/Cmd + S to save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    save()
  }
  
  // Ctrl/Cmd + Z to undo
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    if (store.canUndo) {
      store.undo()
      showNotification('Undo successful', 'info')
    }
  }
  
  // Ctrl/Cmd + Shift + Z to redo
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') {
    event.preventDefault()
    if (store.canRedo) {
      store.redo()
      showNotification('Redo successful', 'info')
    }
  }
}

// ROOT FIX: Store handler references for proper cleanup
let keyboardHandler = null;
let notificationHandler = null;

// Create handlers
keyboardHandler = handleKeyboard;
notificationHandler = (event) => {
  showNotification(event.detail.message, event.detail.type);
};

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', keyboardHandler);
  document.addEventListener('gmkb:notification', notificationHandler);
  
  // Make showNotification available globally
  window.showToast = showNotification;
  
  console.log('✅ MediaKitBuilder: Event listeners registered');
});

onBeforeUnmount(() => {
  // ROOT FIX: Remove both listeners properly
  if (keyboardHandler) {
    document.removeEventListener('keydown', keyboardHandler);
  }
  if (notificationHandler) {
    document.removeEventListener('gmkb:notification', notificationHandler);
  }
  
  // Clean up global reference
  delete window.showToast;
  
  console.log('✅ MediaKitBuilder: All event listeners cleaned up');
});
</script>

<style scoped>
.media-kit-builder {
  min-height: 100vh;
  background: var(--builder-bg, #0a0a0a);
  color: var(--text-color, #fff);
}

.builder-content {
  padding: var(--spacing-xl, 40px) var(--spacing-lg, 20px);
  max-width: 1400px;
  margin: 0 auto;
}

/* Section drag states */
.section-ghost {
  opacity: 0.5;
  background: rgba(59, 130, 246, 0.1);
  border: 2px dashed var(--primary-color, #3b82f6);
}

.section-drag {
  opacity: 0;
}

/* Toast container */
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast-container > * {
  pointer-events: all;
}

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .builder-content {
    padding: var(--spacing-md, 16px);
  }
  
  .toast-container {
    left: 20px;
    right: 20px;
    align-items: center;
  }
}
</style>
