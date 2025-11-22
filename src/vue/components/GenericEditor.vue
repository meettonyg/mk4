<template>
  <div class="generic-editor">
    <div class="editor-header">
      <h3>Edit {{ componentType }}</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <div v-if="Object.keys(editableData).length === 0" class="no-data">
        <p>This component has no editable properties.</p>
      </div>
      
      <div v-for="(value, key) in editableData" :key="key" class="field-group">
        <label :for="`field-${key}`">{{ formatLabel(key) }}</label>
        
        <!-- Text Input for strings and numbers -->
        <input 
          v-if="typeof value !== 'object' && typeof value !== 'boolean'"
          :id="`field-${key}`"
          v-model="editableData[key]" 
          @input="updateComponent"
          :type="typeof value === 'number' ? 'number' : 'text'"
        >
        
        <!-- Checkbox for booleans -->
        <input 
          v-else-if="typeof value === 'boolean'"
          :id="`field-${key}`"
          type="checkbox"
          v-model="editableData[key]"
          @change="updateComponent"
        >
        
        <!-- Textarea for objects (as JSON) -->
        <textarea 
          v-else
          :id="`field-${key}`"
          :value="JSON.stringify(value, null, 2)"
          @input="updateJsonField(key, $event.target.value)"
          rows="4"
        />
      </div>
      
      <!-- Raw JSON Editor (Advanced) -->
      <details class="advanced-section">
        <summary>Raw Data (Advanced)</summary>
        <div class="field-group">
          <label for="raw-json">Component Data (JSON)</label>
          <textarea
            id="raw-json"
            :value="JSON.stringify(editableData, null, 2)"
            @input="updateRawJson"
            rows="10"
            class="code-editor"
          />
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const store = useMediaKitStore();
const editableData = ref({});

// FIX: Track timeout for cleanup
let updateTimeout = null;

// Get component from store
const component = computed(() => store.components[props.componentId]);
const componentType = computed(() => {
  if (!component.value) return 'Component';
  
  // Format component type for display
  const type = component.value.type || 'Component';
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/[-_]/g, ' ');
});

// Load component data
const loadComponentData = () => {
  if (component.value && component.value.data) {
    // Deep clone the data to avoid direct mutations
    editableData.value = JSON.parse(JSON.stringify(component.value.data));
  } else {
    editableData.value = {};
  }
};

// Watch for component changes
watch(component, () => {
  loadComponentData();
}, { immediate: true, deep: true });

// Format field labels
const formatLabel = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
};

// Update component with debouncing
const updateComponent = () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: { ...editableData.value }
    });
    // FIX: Use isDirty instead of hasUnsavedChanges (which is a getter)
    if (typeof store.markDirty === 'function') {
      store.markDirty();
    } else {
      store.isDirty = true;
    }
  }, 300);
};

// FIX: Cleanup timeout on component unmount to prevent memory leaks
onUnmounted(() => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
  }
});

// Update JSON field
const updateJsonField = (key, value) => {
  try {
    editableData.value[key] = JSON.parse(value);
    updateComponent();
  } catch (error) {
    console.warn('Invalid JSON for field:', key);
  }
};

// Update raw JSON
const updateRawJson = (event) => {
  try {
    const newData = JSON.parse(event.target.value);
    editableData.value = newData;
    updateComponent();
  } catch (error) {
    console.warn('Invalid JSON');
  }
};

// Close editor
const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.generic-editor {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.editor-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.editor-fields {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

.field-group {
  margin-bottom: 20px;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 13px;
  color: #475569;
}

.field-group input[type="text"],
.field-group input[type="number"],
.field-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.field-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.field-group input:focus,
.field-group textarea:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-group textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.code-editor {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border: 1px solid #334155;
}

.advanced-section {
  margin-top: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.advanced-section summary {
  cursor: pointer;
  font-weight: 500;
  color: #475569;
  font-size: 14px;
  user-select: none;
}

.advanced-section[open] summary {
  margin-bottom: 16px;
}

/* Scrollbar styling */
.editor-fields::-webkit-scrollbar {
  width: 6px;
}

.editor-fields::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.editor-fields::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.editor-fields::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
