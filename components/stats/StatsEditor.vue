<template>
  <div class="stats-editor">
    <div class="editor-header">
      <h3>Edit Stats Section</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Section Title -->
      <div class="field-group">
        <label for="stats-title">Section Title</label>
        <input 
          id="stats-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., By The Numbers"
        >
      </div>
      
      <!-- Stats List -->
      <div class="field-group">
        <label>Statistics</label>
        <div class="stats-list">
          <div 
            v-for="(stat, index) in localData.stats" 
            :key="index"
            class="stat-item"
          >
            <div class="stat-header">
              <span class="stat-number">Stat {{ index + 1 }}</span>
              <button 
                @click="removeStat(index)"
                class="remove-btn"
                title="Remove stat"
              >×</button>
            </div>
            
            <div class="stat-fields">
              <input 
                v-model="stat.value" 
                @input="updateComponent"
                placeholder="e.g., 10,000+"
                class="stat-field"
              >
              
              <input 
                v-model="stat.label" 
                @input="updateComponent"
                placeholder="e.g., Happy Customers"
                class="stat-field"
              >
              
              <input 
                v-model="stat.prefix" 
                @input="updateComponent"
                placeholder="Prefix (e.g., $)"
                class="stat-field-small"
              >
              
              <input 
                v-model="stat.suffix" 
                @input="updateComponent"
                placeholder="Suffix (e.g., %)"
                class="stat-field-small"
              >
              
              <input 
                v-model="stat.icon" 
                @input="updateComponent"
                placeholder="Icon (emoji or class)"
                class="stat-field-small"
              >
            </div>
          </div>
          
          <button 
            @click="addStat"
            class="add-btn"
          >
            + Add Statistic
          </button>
        </div>
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
        <div class="field-group">
          <label for="columns">Columns</label>
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
          <label for="style">Display Style</label>
          <select 
            id="style"
            v-model="localData.style" 
            @change="updateComponent"
          >
            <option value="default">Default</option>
            <option value="cards">Cards</option>
            <option value="minimal">Minimal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.animate" 
              @change="updateComponent"
            >
            Animate Numbers on Scroll
          </label>
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
  title: 'By The Numbers',
  stats: [],
  columns: '4',
  style: 'default',
  animate: true,
  showIcons: true
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'By The Numbers',
      stats: Array.isArray(component.data.stats) 
        ? [...component.data.stats] 
        : [],
      columns: String(component.data.columns || '4'),
      style: component.data.style || 'default',
      animate: component.data.animate !== false,
      showIcons: component.data.showIcons !== false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Add stat
const addStat = () => {
  localData.value.stats.push({
    value: '',
    label: '',
    prefix: '',
    suffix: '',
    icon: ''
  });
  updateComponent();
};

// Remove stat
const removeStat = (index) => {
  localData.value.stats.splice(index, 1);
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
        stats: localData.value.stats.filter(s => s.value || s.label),
        columns: parseInt(localData.value.columns),
        style: localData.value.style,
        animate: localData.value.animate,
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
.stats-editor {
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

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-number {
  font-weight: 600;
  color: #3b82f6;
  font-size: 14px;
}

.stat-fields {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
}

.stat-field {
  margin: 0 !important;
  grid-column: span 2;
}

.stat-field-small {
  margin: 0 !important;
}

.stat-fields input:nth-child(3),
.stat-fields input:nth-child(4) {
  grid-column: span 1;
}

.stat-fields input:nth-child(5) {
  grid-column: span 2;
}

.remove-btn {
  width: 24px;
  height: 24px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #ef4444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
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
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
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
