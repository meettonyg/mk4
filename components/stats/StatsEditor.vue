<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Stats"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @back="handleBack"
  >
    <!-- Content Tab -->
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Section Settings</h4>
          
          <div class="field-group">
            <label for="stats-title">Section Title</label>
            <input 
              id="stats-title"
              v-model="localData.title" 
              @input="updateComponent"
              type="text"
              placeholder="e.g., By The Numbers"
            />
          </div>
          
          <div class="field-group">
            <label for="stats-description">Description</label>
            <textarea 
              id="stats-description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="3"
              placeholder="Optional description text..."
            />
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
                  />
                </div>
                
                <div class="field-group">
                  <label>Label</label>
                  <input 
                    v-model="stat.label" 
                    @input="updateComponent"
                    placeholder="e.g., Happy Customers"
                  />
                </div>
                
                <div class="field-group">
                  <label>Prefix</label>
                  <input 
                    v-model="stat.prefix" 
                    @input="updateComponent"
                    placeholder="$ or #"
                  />
                </div>
                
                <div class="field-group">
                  <label>Suffix</label>
                  <input 
                    v-model="stat.suffix" 
                    @input="updateComponent"
                    placeholder="% or +"
                  />
                </div>
                
                <div class="field-group">
                  <label>Icon (Emoji)</label>
                  <input 
                    v-model="stat.icon" 
                    @input="updateComponent"
                    placeholder="📊 or 🎯"
                  />
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
                v-model="localData.showIcons" 
                @change="updateComponent"
              />
              Show Icons
            </label>
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import ComponentEditorTemplate from '../../src/vue/components/sidebar/editors/ComponentEditorTemplate.vue';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);

const store = useMediaKitStore();

// Active tab state
const activeTab = ref('content');

// Local data state
const localData = ref({
  title: 'By The Numbers',
  description: '',
  stats: [],
  columns: '4',
  style: 'default',
  showIcons: true
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'By The Numbers',
      description: component.data.description || '',
      stats: Array.isArray(component.data.stats) 
        ? [...component.data.stats] 
        : [],
      columns: String(component.data.columns || '4'),
      style: component.data.style || 'default',
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

// Update component with debouncing
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        title: localData.value.title,
        description: localData.value.description,
        stats: localData.value.stats.filter(s => s.value || s.label),
        columns: parseInt(localData.value.columns),
        style: localData.value.style,
        showIcons: localData.value.showIcons
      }
    });
    store.isDirty = true;
  }, 300);
};

// Handle back button
const handleBack = () => {
  emit('close');
};
</script>

<style scoped>
.content-fields {
  padding: 20px;
}

.editor-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

body.dark-mode .editor-section {
  background: #1e293b;
  border-color: #334155;
}

.editor-section:last-child {
  margin-bottom: 0;
}

.editor-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

body.dark-mode .editor-section h4 {
  color: #94a3b8;
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

body.dark-mode .field-group label {
  color: #94a3b8;
}

.field-group input,
.field-group select,
.field-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #1f2937;
  transition: all 0.2s;
  font-family: inherit;
}

body.dark-mode .field-group input,
body.dark-mode .field-group select,
body.dark-mode .field-group textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f3f4f6;
}

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.field-group textarea {
  resize: vertical;
  min-height: 80px;
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

body.dark-mode .stat-item {
  background: #0f172a;
  border-color: #334155;
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

body.dark-mode .stat-number {
  color: #60a5fa;
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

body.dark-mode .remove-btn {
  background: #450a0a;
  border-color: #7f1d1d;
  color: #fca5a5;
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
  width: 100%;
}

.add-btn:hover {
  background: #e0f2fe;
}

body.dark-mode .add-btn {
  background: #0c4a6e;
  border-color: #0369a1;
  color: #7dd3fc;
}
</style>
