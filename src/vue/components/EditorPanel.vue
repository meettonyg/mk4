<template>
  <Teleport to="body">
    <div v-if="isEditing" class="editor-panel-overlay" @click.self="closeEditor">
      <div class="editor-panel" :class="{ 'editor-panel--open': isEditing }">
        <div class="editor-panel__content">
          <!-- Dynamically load component-specific editor or fallback to generic -->
          <component 
            v-if="editorComponent"
            :is="editorComponent"
            :component-id="editingComponentId"
            @close="closeEditor"
          />
          <GenericEditor 
            v-else-if="editingComponentId"
            :component-id="editingComponentId"
            @close="closeEditor"
          />
          <div v-else class="editor-panel__empty">
            <p>Select a component to edit</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import GenericEditor from './GenericEditor.vue';

const store = useMediaKitStore();

// Check if editing
const isEditing = computed(() => !!store.editingComponentId);
const editingComponentId = computed(() => store.editingComponentId);

// Get the component being edited
const editingComponent = computed(() => {
  if (!editingComponentId.value) return null;
  return store.components[editingComponentId.value];
});

/**
 * ROOT FIX: Removed hardcoded editor map
 * 
 * ARCHITECTURE COMPLIANCE:
 * - No custom editor components exist in the codebase
 * - GenericEditor handles all component editing universally
 * - Removed 17 hardcoded defineAsyncComponent calls that loaded non-existent files
 * - If future custom editors are needed, they should be discovered via
 *   import.meta.glob pattern (similar to ComponentRenderer discovery)
 * 
 * BENEFITS:
 * - Eliminates failed import attempts in console
 * - Reduces bundle size
 * - Simplifies maintenance
 * - Follows single-source-of-truth principle
 * - GenericEditor already provides comprehensive editing for all components
 */
const editorComponent = computed(() => {
  // Always use GenericEditor - it handles all component types
  // Future: Could implement custom editor discovery via import.meta.glob if needed
  return null;
});

// Close editor
const closeEditor = () => {
  store.closeEditPanel();
};

// ROOT FIX: Store handler reference for proper cleanup
let escapeHandler = null;

// Create escape key handler
escapeHandler = (e) => {
  if (e.key === 'Escape' && isEditing.value) {
    closeEditor();
  }
};

// ROOT FIX: Add keyboard listener in onMounted
onMounted(() => {
  document.addEventListener('keydown', escapeHandler);
  console.log('✅ EditorPanel: Escape key listener registered');
});

// ROOT FIX: Proper cleanup in onUnmounted
onUnmounted(() => {
  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler);
    console.log('✅ EditorPanel: Escape key listener cleaned up');
  }
});
</script>

<style scoped>
.editor-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.editor-panel {
  width: 400px;
  height: 100%;
  background: white;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.editor-panel--open {
  transform: translateX(0);
}

.editor-panel__content {
  flex: 1;
  overflow-y: auto;
  height: 100%;
}

.editor-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 640px) {
  .editor-panel {
    width: 100%;
    max-width: 100%;
  }
}

/* Animation for panel slide */
.editor-panel {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
