<template>
  <div class="topics-questions-editor">
    <div class="editor-header">
      <h3>Topics & Questions Component</h3>
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
          <h4>Section Titles</h4>
          
          <div class="field-group">
            <label for="topics-title">Topics Section Title</label>
            <input 
              id="topics-title"
              v-model="localData.topicsTitle" 
              @input="updateComponent"
              placeholder="e.g., Speaking Topics"
            >
          </div>
          
          <div class="field-group">
            <label for="questions-title">Questions Section Title</label>
            <input 
              id="questions-title"
              v-model="localData.questionsTitle" 
              @input="updateComponent"
              placeholder="e.g., Interview Questions"
            >
          </div>
        </section>

        <section class="editor-section">
          <h4>Topics</h4>
          
          <div class="topics-list">
            <div 
              v-for="(topic, index) in localData.topics" 
              :key="`topic-${index}`"
              class="topic-item"
            >
              <input 
                v-model="topic.title" 
                @input="updateComponent"
                placeholder="Topic title"
                class="topic-field"
              >
              <textarea 
                v-model="topic.description" 
                @input="updateComponent"
                placeholder="Topic description (optional)"
                rows="2"
                class="topic-field"
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
          <h4>Interview Questions</h4>
          
          <div class="questions-list">
            <div 
              v-for="(question, index) in localData.questions" 
              :key="`question-${index}`"
              class="question-item"
            >
              <div class="question-number">Q{{ index + 1 }}</div>
              <textarea 
                v-model="question.question" 
                @input="updateComponent"
                placeholder="Enter question..."
                rows="2"
                class="question-field"
              />
              <textarea 
                v-model="question.answer" 
                @input="updateComponent"
                placeholder="Sample answer or talking points (optional)"
                rows="3"
                class="question-field"
              />
              <button 
                @click="removeQuestion(index)"
                class="remove-btn"
                title="Remove question"
              >×</button>
            </div>
            
            <button 
              @click="addQuestion"
              class="add-btn"
            >
              + Add Question
            </button>
          </div>
        </section>

        <section class="editor-section">
          <h4>Layout Options</h4>
          
          <div class="field-group">
            <label for="layout">Layout Style</label>
            <select 
              id="layout"
              v-model="localData.layout" 
              @change="updateComponent"
            >
              <option value="side-by-side">Side by Side</option>
              <option value="stacked">Stacked</option>
              <option value="tabs">Tabbed View</option>
              <option value="accordion">Accordion</option>
            </select>
          </div>
          
          <div class="field-group" v-if="localData.layout === 'side-by-side'">
            <label for="column-ratio">Column Ratio</label>
            <select 
              id="column-ratio"
              v-model="localData.columnRatio" 
              @change="updateComponent"
            >
              <option value="50-50">50/50</option>
              <option value="60-40">60/40</option>
              <option value="40-60">40/60</option>
            </select>
          </div>
          
          <div class="field-group">
            <label for="topics-style">Topics Display Style</label>
            <select 
              id="topics-style"
              v-model="localData.topicsStyle" 
              @change="updateComponent"
            >
              <option value="list">List</option>
              <option value="cards">Cards</option>
              <option value="grid">Grid</option>
              <option value="numbered">Numbered List</option>
            </select>
          </div>
          
          <div class="field-group">
            <label for="questions-style">Questions Display Style</label>
            <select 
              id="questions-style"
              v-model="localData.questionsStyle" 
              @change="updateComponent"
            >
              <option value="accordion">Accordion</option>
              <option value="list">Open List</option>
              <option value="cards">Cards</option>
            </select>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showTopicDescriptions" 
                @change="updateComponent"
              >
              Show Topic Descriptions
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showAnswers" 
                @change="updateComponent"
              >
              Show Sample Answers
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.expandFirst" 
                @change="updateComponent"
              >
              Expand First Item by Default (Accordion)
            </label>
          </div>
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'topics-questions'"
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
  topicsTitle: 'Speaking Topics',
  questionsTitle: 'Interview Questions',
  topics: [],
  questions: [],
  layout: 'side-by-side',
  columnRatio: '50-50',
  topicsStyle: 'list',
  questionsStyle: 'accordion',
  showTopicDescriptions: true,
  showAnswers: true,
  expandFirst: true
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      topicsTitle: component.data.topicsTitle || 'Speaking Topics',
      questionsTitle: component.data.questionsTitle || 'Interview Questions',
      topics: Array.isArray(component.data.topics) ? [...component.data.topics] : [],
      questions: Array.isArray(component.data.questions) ? [...component.data.questions] : [],
      layout: component.data.layout || 'side-by-side',
      columnRatio: component.data.columnRatio || '50-50',
      topicsStyle: component.data.topicsStyle || 'list',
      questionsStyle: component.data.questionsStyle || 'accordion',
      showTopicDescriptions: component.data.showTopicDescriptions !== false,
      showAnswers: component.data.showAnswers !== false,
      expandFirst: component.data.expandFirst !== false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Add topic
const addTopic = () => {
  localData.value.topics.push({
    title: '',
    description: ''
  });
  updateComponent();
};

// Remove topic
const removeTopic = (index) => {
  localData.value.topics.splice(index, 1);
  updateComponent();
};

// Add question
const addQuestion = () => {
  localData.value.questions.push({
    question: '',
    answer: ''
  });
  updateComponent();
};

// Remove question
const removeQuestion = (index) => {
  localData.value.questions.splice(index, 1);
  updateComponent();
};

// Update component
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        topicsTitle: localData.value.topicsTitle,
        questionsTitle: localData.value.questionsTitle,
        topics: localData.value.topics.filter(t => t.title),
        questions: localData.value.questions.filter(q => q.question),
        layout: localData.value.layout,
        columnRatio: localData.value.columnRatio,
        topicsStyle: localData.value.topicsStyle,
        questionsStyle: localData.value.questionsStyle,
        showTopicDescriptions: localData.value.showTopicDescriptions,
        showAnswers: localData.value.showAnswers,
        expandFirst: localData.value.expandFirst
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
.topics-questions-editor {
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
.field-group textarea,
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
.field-group textarea:focus,
.field-group select:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-group textarea {
  resize: vertical;
  font-family: inherit;
}

.topics-list,
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topic-item,
.question-item {
  padding: var(--gmkb-spacing-md, 16px);
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  position: relative;
}

.topic-field,
.question-field {
  margin-bottom: 8px !important;
  width: calc(100% - 40px) !important;
}

.topic-field:last-of-type,
.question-field:last-of-type {
  margin-bottom: 0 !important;
}

.question-number {
  position: absolute;
  top: 16px;
  right: 50px;
  font-weight: 600;
  color: #3b82f6;
  font-size: 14px;
}

.remove-btn {
  position: absolute;
  top: 16px;
  right: 16px;
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
