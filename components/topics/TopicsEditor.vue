<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Topics"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @close="handleClose"
  >
    <!-- Content Tab -->
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Section Settings</h4>
          
          <div class="field-group">
            <label for="topics-title">Section Title</label>
            <input 
              id="topics-title"
              v-model="localData.title" 
              @input="updateComponent"
              type="text"
              placeholder="e.g., Areas of Expertise"
            />
          </div>
          
          <div class="field-group">
            <label for="topics-description">Description</label>
            <textarea 
              id="topics-description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="3"
              placeholder="Optional description text..."
            />
          </div>
        </section>

        <section class="editor-section">
          <div class="section-header">
            <h4>Topics List</h4>
            <button
              type="button"
              class="ai-generate-btn"
              @click="showAiModal = true"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Generate with AI
            </button>
          </div>

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
              />
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
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
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
              />
              Show Icons
            </label>
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>

  <!-- AI Generation Modal -->
  <AiModal v-model="showAiModal" title="Generate Topics with AI">
    <TopicsGenerator
      mode="integrated"
      :component-id="componentId"
      @applied="handleAiApplied"
    />
  </AiModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import ComponentEditorTemplate from '../../src/vue/components/sidebar/editors/ComponentEditorTemplate.vue';
import { AiModal, TopicsGenerator } from '../../src/vue/components/ai';

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

// AI Modal state
const showAiModal = ref(false);

// Local data state
const localData = ref({
  title: 'Areas of Expertise',
  description: '',
  topics: [],
  columns: '3',
  showIcons: false
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'Areas of Expertise',
      description: component.data.description || '',
      topics: Array.isArray(component.data.topics) 
        ? [...component.data.topics]
        : [],
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

// Update component with debouncing
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        title: localData.value.title,
        description: localData.value.description,
        topics: localData.value.topics.filter(t => t.trim()),
        columns: parseInt(localData.value.columns),
        showIcons: localData.value.showIcons
      }
    });
    store.isDirty = true;
  }, 300);
};

// Handle close button
const handleClose = () => {
  emit('close');
};

// Handle AI content applied
const handleAiApplied = (data) => {
  if (data.topics && Array.isArray(data.topics)) {
    localData.value.topics = data.topics;
    updateComponent();
  }
  showAiModal.value = false;
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

.field-group input[type="text"],
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
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #1f2937;
  font-family: inherit;
}

body.dark-mode .topic-input {
  background: #0f172a;
  border-color: #334155;
  color: #f3f4f6;
}

.topic-input:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.remove-btn {
  width: 38px;
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

body.dark-mode .remove-btn {
  background: #450a0a;
  border-color: #7f1d1d;
  color: #fca5a5;
}

.add-btn {
  padding: 10px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
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

/* Section Header with AI Button */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
}

.ai-generate-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-generate-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
}

.ai-generate-btn svg {
  flex-shrink: 0;
}

body.dark-mode .ai-generate-btn {
  color: #818cf8;
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.25);
}

body.dark-mode .ai-generate-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.35);
}
</style>
