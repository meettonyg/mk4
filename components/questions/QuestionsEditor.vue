<template>
  <div class="questions-editor">
    <div class="editor-header">
      <h3>Edit Q&A Section</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Section Title -->
      <div class="field-group">
        <label for="qa-title">Section Title</label>
        <input 
          id="qa-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., Frequently Asked Questions"
        >
      </div>
      
      <!-- Questions List -->
      <div class="field-group">
        <label>Questions & Answers</label>
        <div class="qa-list">
          <div 
            v-for="(qa, index) in localData.questions" 
            :key="index"
            class="qa-item"
          >
            <div class="qa-header">
              <span class="qa-number">Q{{ index + 1 }}</span>
              <button 
                @click="removeQuestion(index)"
                class="remove-btn"
                title="Remove question"
              >×</button>
            </div>
            
            <input 
              v-model="qa.question" 
              @input="updateComponent"
              placeholder="Enter question..."
              class="qa-question"
            >
            
            <textarea 
              v-model="qa.answer" 
              @input="updateComponent"
              placeholder="Enter answer..."
              rows="3"
              class="qa-answer"
            />
          </div>
          
          <button 
            @click="addQuestion"
            class="add-btn"
          >
            + Add Question
          </button>
        </div>
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
        <div class="field-group">
          <label for="display-style">Display Style</label>
          <select 
            id="display-style"
            v-model="localData.displayStyle" 
            @change="updateComponent"
          >
            <option value="accordion">Accordion (Expandable)</option>
            <option value="list">List (All Visible)</option>
            <option value="cards">Cards</option>
          </select>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.expandFirst" 
              @change="updateComponent"
            >
            Expand First Question by Default
          </label>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.showNumbers" 
              @change="updateComponent"
            >
            Show Question Numbers
          </label>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.allowMultiple" 
              @change="updateComponent"
            >
            Allow Multiple Questions Open (Accordion)
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
  title: 'Frequently Asked Questions',
  questions: [],
  displayStyle: 'accordion',
  expandFirst: true,
  showNumbers: false,
  allowMultiple: false
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'Frequently Asked Questions',
      questions: Array.isArray(component.data.questions) 
        ? [...component.data.questions] 
        : [],
      displayStyle: component.data.displayStyle || 'accordion',
      expandFirst: component.data.expandFirst !== false,
      showNumbers: component.data.showNumbers || false,
      allowMultiple: component.data.allowMultiple || false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

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
        title: localData.value.title,
        questions: localData.value.questions.filter(q => q.question || q.answer),
        displayStyle: localData.value.displayStyle,
        expandFirst: localData.value.expandFirst,
        showNumbers: localData.value.showNumbers,
        allowMultiple: localData.value.allowMultiple
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
.questions-editor {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gmkb-spacing-md, 16px) 20px;
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
.field-group textarea,
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

.qa-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qa-item {
  padding: var(--gmkb-spacing-md, 16px);
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.qa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.qa-number {
  font-weight: 600;
  color: #3b82f6;
  font-size: 14px;
}

.qa-question {
  margin-bottom: 8px !important;
}

.qa-answer {
  margin: 0 !important;
  resize: vertical;
  min-height: 60px;
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
  padding: var(--gmkb-space-3, 12px);
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
  padding: var(--gmkb-spacing-md, 16px);
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
