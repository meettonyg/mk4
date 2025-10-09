<template>
  <div class="sidebar-editor">
    <!-- Header with Back Button -->
    <div class="editor-header">
      <button @click="handleBack" class="back-btn" title="Back to sidebar">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <h2 class="editor-title">Edit {{ componentTypeName }}</h2>
      <div class="header-spacer"></div>
    </div>
    
    <!-- Editor Tabs -->
    <div class="editor-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="editor-tab"
        :class="{ active: activeTab === tab.id }"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </button>
    </div>
    
    <!-- Dynamic Component Editor -->
    <div class="editor-content">
      <!-- Component-specific editor or fallback to generic -->
      <component
        v-if="editorComponent"
        :is="editorComponent"
        :component-id="componentId"
        :active-tab="activeTab"
      />
      <GenericComponentEditor
        v-else-if="component"
        :component-id="componentId"
        :active-tab="activeTab"
      />
      <div v-else class="editor-empty">
        <i class="fa-solid fa-cube empty-icon"></i>
        <p>Component not found</p>
      </div>
    </div>
    
    <!-- Footer Actions -->
    <div class="editor-footer">
      <button @click="handleBack" class="btn btn-secondary">Cancel</button>
      <button @click="handleSave" class="btn btn-primary">Save Changes</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMediaKitStore } from '@/stores/mediaKit'
import { useUIStore } from '@/stores/ui'
import GenericComponentEditor from './GenericComponentEditor.vue'

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
})

const store = useMediaKitStore()
const uiStore = useUIStore()

// Active tab
const activeTab = ref('content')

// Tabs configuration
const tabs = [
  { id: 'content', label: 'Content', icon: 'fa-solid fa-pen-to-square' },
  { id: 'style', label: 'Style', icon: 'fa-solid fa-palette' },
  { id: 'advanced', label: 'Advanced', icon: 'fa-solid fa-gear' }
]

// Get component
const component = computed(() => {
  return store.components[props.componentId]
})

// Get component type name
const componentTypeName = computed(() => {
  if (!component.value) return 'Component'
  const type = component.value.type || 'Component'
  return type
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

// Dynamically load component-specific editor
const editorComponent = computed(() => {
  // ROOT FIX: For now, always use GenericComponentEditor
  // Component-specific editors can be added later one by one
  return null
  
  // TODO: Add component-specific editors as they're created:
  // if (!component.value?.type) return null
  // 
  // const componentType = component.value.type
  // 
  // const editorMap = {
  //   'hero': markRaw(defineAsyncComponent(() =>
  //     import('../../../components/hero/HeroEditor.vue')
  //   ))
  // }
  // 
  // return editorMap[componentType] || null
})

// Handle back button
function handleBack() {
  uiStore.closeSidebarEditor()
}

// Handle save
function handleSave() {
  console.log('✅ ComponentEditor: Changes saved for component:', props.componentId)
  // Note: Actual saving is handled by individual editor components
  // This just closes the editor
  uiStore.closeSidebarEditor()
}
</script>

<style scoped>
/* Reuse same styles as SectionEditor */
.sidebar-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  overflow: hidden;
}

body.dark-mode .sidebar-editor {
  background: #0f172a;
}

/* Header */
.editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

body.dark-mode .editor-header {
  border-bottom-color: #334155;
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

body.dark-mode .back-btn {
  border-color: #334155;
  color: #d1d5db;
}

body.dark-mode .back-btn:hover {
  background: #1e293b;
}

.editor-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

body.dark-mode .editor-title {
  color: #f3f4f6;
}

.header-spacer {
  width: 32px;
  flex-shrink: 0;
}

/* Tabs */
.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}

body.dark-mode .editor-tabs {
  background: #1e293b;
  border-bottom-color: #334155;
}

.editor-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.editor-tab:hover {
  color: #111827;
  background: rgba(0, 0, 0, 0.02);
}

.editor-tab.active {
  color: #ec4899;
  border-bottom-color: #ec4899;
  background: white;
}

body.dark-mode .editor-tab {
  color: #9ca3af;
}

body.dark-mode .editor-tab:hover {
  color: #f3f4f6;
  background: rgba(255, 255, 255, 0.05);
}

body.dark-mode .editor-tab.active {
  background: #0f172a;
}

/* Content */
.editor-content {
  flex: 1;
  overflow-y: auto;
}

/* Empty State */
.editor-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.editor-empty p {
  font-size: 14px;
  margin: 0;
}

/* Footer */
.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

body.dark-mode .editor-footer {
  border-top-color: #334155;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

body.dark-mode .btn-secondary {
  background: #1e293b;
  border-color: #334155;
  color: #d1d5db;
}

.btn-primary {
  background: #ec4899;
  color: white;
}

.btn-primary:hover {
  background: #db2777;
}

/* Scrollbar */
.editor-content::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track {
  background: #f3f4f6;
}

body.dark-mode .editor-content::-webkit-scrollbar-track {
  background: #1e293b;
}

.editor-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

body.dark-mode .editor-content::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.editor-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

body.dark-mode .editor-content::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
