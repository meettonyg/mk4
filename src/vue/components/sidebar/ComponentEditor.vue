<template>
  <div class="sidebar-editor">
    <!-- Dynamic Component Editor (editors handle their own headers, tabs, everything) -->
    <div class="editor-content">
      <!-- Component-specific editor or fallback to generic -->
      <!-- ROOT FIX: Add stable :key to prevent remounting on store updates -->
      <component
        v-if="editorComponent"
        :is="editorComponent"
        :key="componentId"
        :component-id="componentId"
        @close="handleBack"
      />
      <GenericComponentEditor
        v-else-if="component"
        :component-id="componentId"
        @close="handleBack"
      />
      <div v-else class="editor-empty">
        <i class="fa-solid fa-cube empty-icon"></i>
        <p>Component not found</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent, shallowRef } from 'vue'
import { useMediaKitStore } from '../../../stores/mediaKit'
import { useUIStore } from '../../../stores/ui'
import GenericComponentEditor from './GenericComponentEditor.vue'

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
})

const store = useMediaKitStore()
const uiStore = useUIStore()

// ROOT FIX: Auto-discover editors using glob pattern (same as renderers)
// ARCHITECTURE COMPLIANCE: Self-contained components - no hardcoded maps
const editorModules = import.meta.glob('../../../../components/**/*Editor.vue')

// Get component TYPE only (shallow, won't trigger on data changes)
const componentType = computed(() => {
  return store.components[props.componentId]?.type
})

// Get full component data (for checking existence)
const component = computed(() => {
  return store.components[props.componentId]
})

// ROOT FIX: Dynamic editor discovery - finds editor automatically
const editorComponent = computed(() => {
  if (!componentType.value) return null
  
  const type = componentType.value
  
  // Find the editor module for this component type
  const editorPath = Object.keys(editorModules).find(path => {
    // Match pattern: components/{type}/*Editor.vue
    const match = path.match(/\/components\/([^\/]+)\/.*Editor\.vue$/)
    return match && match[1] === type
  })
  
  if (editorPath && editorModules[editorPath]) {
    console.log(`✅ Loading component-specific editor for: ${type}`);
    return defineAsyncComponent({
      loader: editorModules[editorPath],
      loadingComponent: null,
      errorComponent: null,
      delay: 0,
      timeout: 3000,
      suspensible: false,
      onError(error, retry, fail, attempts) {
        console.error(`❌ Failed to load editor for ${type}:`, error);
        console.log(`🔄 Falling back to GenericComponentEditor`);
        fail();
      }
    })
  }
  
  console.log(`⚠️ No specific editor found for: ${type}, using GenericComponentEditor`);
  return null
})

// Handle back button
function handleBack() {
  uiStore.closeSidebarEditor()
}

// DEBUG logging
onMounted(() => {
  console.log('✅ ComponentEditor mounted:', {
    componentId: props.componentId,
    componentType: componentType.value
  });
});
</script>

<style scoped>
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

/* Content */
.editor-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
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
