<template>
  <div class="stats-editor">
    <div class="editor-header">
      <h3>Stats Component</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <!-- Tab Navigation -->
    <div class="editor-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="editor-content">
      <!-- CONTENT TAB -->
      <div v-show="activeTab === 'content'" class="tab-panel">
        <section class="editor-section">
          <h4>Section Settings</h4>
          
          <div class="field-group">
            <label for="stats-title">Section Title</label>
            <input 
              id="stats-title"
              v-model="localData.title" 
              @input="updateComponent"
              placeholder="e.g., By The Numbers"
            >
          </div>
        </section>

        <section class="editor-section">
          <h4>Statistics</h4>
          
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
                <div class="field-group">
                  <label>Value</label>
                  <input 
                    v-model="stat.value" 
                    @input="updateComponent"
                    placeholder="e.g., 10,000+"
                  >
                </div>
                
                <div class="field-group">
                  <label>Label</label>
                  <input 
                    v-model="stat.label" 
                    @input="updateComponent"
                    placeholder="e.g., Happy Customers"
                  >
                </div>
                
                <div class="field-group">
                  <label>Prefix</label>
                  <input 
                    v-model="stat.prefix" 
                    @input="updateComponent"
                    placeholder="$ or #"
                  >
                </div>
                
                <div class="field-group">
                  <label>Suffix</label>
                  <input 
                    v-model="stat.suffix" 
                    @input="updateComponent"
                    placeholder="% or +"
                  >
                </div>
                
                <div class="field-group">
                  <label>Icon</label>
                  <input 
                    v-model="stat.icon" 
                    @input="updateComponent"
                    placeholder="Emoji or class"
                  >
                </div>
              </div>
            </div>
            
            <button 
              @click="addStat"
              class="add-btn"
            >
              + Add Statistic
            </button>
          </div>
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
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
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'stats'"
          :show-typography="true"
        />
      </div>
      
      <!-- ADVANCED TAB -->
      <div v-show="activeTab === 'advanced'" class="tab-panel">
        <BaseAdvancedPanel
          :component-id="componentId"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import BaseStylePanel from '../../src/vue/components/sidebar/editors/BaseStylePanel.vue';
import BaseAdvancedPanel from '../../src/vue/components/sidebar/editors/BaseAdvancedPanel.vue';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const store = useMediaKitStore();

// Tab state
const activeTab = ref('content');
const tabs = [
  { id: 'content', label: 'Content' },
  { id: 'style', label: 'Style' },
  { id: 'advanced', label: 'Advanced' }
];

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
    store.isDirty = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.stats-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gmkb-spacing-md, 16px) 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
}

.editor-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 24px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.tab-btn.active {
  color: #3b82f6;
  background: white;
  border-bottom-color: #3b82f6;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  background: #f9fafb;
}

.tab-panel {
  padding: 20px;
}

.editor-section {
  background: white;
  border-radius: 8px;
  padding: var(--gmkb-spacing-md, 16px);
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.editor-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-group {
  margin-bottom: 16px;
}

.field-group:last-child {
  margin-bottom: 0;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.field-group input,
.field-group select {
  width: 100%;
  padding: var(--gmkb-spacing-sm, 8px) 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.field-group input:focus,
.field-group select:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  padding: var(--gmkb-spacing-md, 16px);
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
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}

.stat-fields .field-group:nth-child(1),
.stat-fields .field-group:nth-child(2) {
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
  padding: var(--gmkb-spacing-md, 12px);
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

/* Scrollbar styling */
.editor-content::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.editor-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
