<template>
  <div class="topics-editor">
    <div class="editor-header">
      <h3>Edit Topics Section</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Section Title -->
      <div class="field-group">
        <label for="topics-title">Section Title</label>
        <input 
          id="topics-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., Areas of Expertise"
        >
      </div>
      
      <!-- Topics List -->
      <div class="field-group">
        <label>Topics</label>
        <div class="topics-list">
          <div 
            v-for="(topic, index) in localData.topics" 
            :key="index"
            class="topic-item"
          >
            <input 
              v-model="localData.topics[index]" 
              @input="updateComponent"
              placeholder="Enter topic..."
              class="topic-input"
            >
            <button 
              @click="removeTopic(index)"
              class="remove-btn"
              title="Remove topic"
            >×</button>
          </div>
          
          <button 
            @click="addTopic"
            class="add-btn"
          >
            + Add Topic
          </button>
        </div>
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
        <div class="field-group">
          <label for="layout-style">Layout Style</label>
          <select 
            id="layout-style"
            v-model="localData.layoutStyle" 
            @change="updateComponent"
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
            <option value="tags">Tags</option>
            <option value="cards">Cards</option>
          </select>
        </div>
        
        <div class="field-group">
          <label for="columns">Columns (Desktop)</label>
          <select 
            id="columns"
            v-model="localData.columns" 
            @change="updateComponent"
          >
            <option value="2">2 Columns</option>
            <option value="3">3 Columns</option>
            <option value="4">4 Columns</option>
          </select>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.showIcons" 
              @change="updateComponent"
            >
            Show Icons
          </label>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const store = useMediaKitStore();
const localData = ref({
  title: 'Areas of Expertise',
  topics: [],
  layoutStyle: 'grid',
  columns: '3',
  showIcons: false
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'Areas of Expertise',
      topics: Array.isArray(component.data.topics) ? [...component.data.topics] : [],
      layoutStyle: component.data.layoutStyle || 'grid',
      columns: String(component.data.columns || '3'),
      showIcons: component.data.showIcons || false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Add topic
const addTopic = () => {
  localData.value.topics.push('');
  updateComponent();
};

// Remove topic
const removeTopic = (index) => {
  localData.value.topics.splice(index, 1);
  updateComponent();
};

// Update component
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        title: localData.value.title,
        topics: localData.value.topics.filter(t => t.trim()),
        layoutStyle: localData.value.layoutStyle,
        columns: parseInt(localData.value.columns),
        showIcons: localData.value.showIcons
      }
    });
    store.hasUnsavedChanges = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.topics-editor {
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

.field-group {
  margin-bottom: 20px;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 13px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-group input,
.field-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.topic-item {
  display: flex;
  gap: 8px;
}

.topic-input {
  flex: 1;
}

.remove-btn {
  width: 32px;
  height: 38px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}

.add-btn {
  padding: 10px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #e0f2fe;
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
</style>
