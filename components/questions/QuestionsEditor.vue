<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Questions"
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
            <label for="questions-title">Section Title</label>
            <input 
              id="questions-title"
              v-model="localData.title" 
              @input="updateComponent"
              type="text"
              placeholder="e.g., Frequently Asked Questions"
            />
          </div>
          
          <div class="field-group">
            <label for="questions-description">Description</label>
            <textarea 
              id="questions-description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="2"
              placeholder="Optional description..."
            />
          </div>
        </section>

        <section class="editor-section">
          <div class="section-header">
            <h4>Questions & Answers</h4>
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

          <div class="questions-list">
            <div 
              v-for="(qa, index) in localData.questions" 
              :key="index"
              class="question-item"
            >
              <div class="question-header">
                <span class="question-number">Q{{ index + 1 }}</span>
                <button 
                  @click="removeQuestion(index)"
                  class="remove-btn"
                  title="Remove question"
                >×</button>
              </div>
              
              <div class="field-group">
                <label>Question *</label>
                <input 
                  v-model="qa.question" 
                  @input="updateComponent"
                  type="text"
                  placeholder="Your question here..."
                />
              </div>
              
              <div class="field-group">
                <label>Answer *</label>
                <textarea 
                  v-model="qa.answer" 
                  @input="updateComponent"
                  rows="3"
                  placeholder="Your answer here..."
                />
              </div>
            </div>
            
            <button 
              @click="addQuestion"
              class="add-btn"
            >
              + Add Question
            </button>
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>

  <!-- AI Generation Modal -->
  <AiModal v-model="showAiModal" title="Generate Questions with AI">
    <QuestionsGenerator
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
import AiModal from '../../src/vue/components/ai/AiModal.vue';
import QuestionsGenerator from '../../tools/questions/Generator.vue';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);
const store = useMediaKitStore();
const activeTab = ref('content');
const showAiModal = ref(false);

const localData = ref({
  title: 'Frequently Asked Questions',
  description: '',
  questions: []
});

const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'Frequently Asked Questions',
      description: component.data.description || '',
      questions: Array.isArray(component.data.questions) ? [...component.data.questions] : []
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

const addQuestion = () => {
  localData.value.questions.push({ question: '', answer: '' });
  updateComponent();
};

const removeQuestion = (index) => {
  localData.value.questions.splice(index, 1);
  updateComponent();
};

let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        title: localData.value.title,
        description: localData.value.description,
        questions: localData.value.questions.filter(q => q.question && q.answer)
      }
    });
    store.isDirty = true;
  }, 300);
};

const handleBack = () => emit('close');

// Handle AI content applied
const handleAiApplied = (data) => {
  if (data.questions && Array.isArray(data.questions)) {
    // Convert AI questions format to component format
    localData.value.questions = data.questions.map(q => ({
      question: typeof q === 'string' ? q : q.question || q,
      answer: typeof q === 'object' ? q.answer || '' : ''
    }));
    updateComponent();
  }
  showAiModal.value = false;
};
</script>

<style scoped>
.content-fields { padding: 20px; }
.editor-section { background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e5e7eb; }
body.dark-mode .editor-section { background: #1e293b; border-color: #334155; }
.editor-section:last-child { margin-bottom: 0; }
.editor-section h4 { margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
body.dark-mode .editor-section h4 { color: #94a3b8; }
.field-group { margin-bottom: 12px; }
.field-group:last-child { margin-bottom: 0; }
.field-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #64748b; }
body.dark-mode .field-group label { color: #94a3b8; }
.field-group input, .field-group select, .field-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; background: white; color: #1f2937; transition: all 0.2s; font-family: inherit; }
body.dark-mode .field-group input, body.dark-mode .field-group select, body.dark-mode .field-group textarea { background: #0f172a; border-color: #334155; color: #f3f4f6; }
.field-group input:focus, .field-group select:focus, .field-group textarea:focus { outline: none; border-color: #ec4899; box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1); }
.field-group textarea { resize: vertical; }
.questions-list { display: flex; flex-direction: column; gap: 16px; }
.question-item { padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb; }
body.dark-mode .question-item { background: #0f172a; border-color: #334155; }
.question-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.question-number { font-weight: 600; color: #3b82f6; font-size: 14px; }
body.dark-mode .question-number { color: #60a5fa; }
.remove-btn { width: 24px; height: 24px; background: #fef2f2; border: 1px solid #fecaca; color: #ef4444; border-radius: 4px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.remove-btn:hover { background: #fee2e2; border-color: #f87171; }
body.dark-mode .remove-btn { background: #450a0a; border-color: #7f1d1d; color: #fca5a5; }
.add-btn { padding: 12px; background: #f0f9ff; border: 1px solid #bae6fd; color: #0284c7; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-weight: 500; width: 100%; }
.add-btn:hover { background: #e0f2fe; }
body.dark-mode .add-btn { background: #0c4a6e; border-color: #0369a1; color: #7dd3fc; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h4 { margin: 0; }
.ai-generate-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 12px; font-weight: 500; color: #6366f1; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.ai-generate-btn:hover { background: rgba(99, 102, 241, 0.15); border-color: rgba(99, 102, 241, 0.3); }
.ai-generate-btn svg { flex-shrink: 0; }
body.dark-mode .ai-generate-btn { color: #818cf8; background: rgba(99, 102, 241, 0.15); border-color: rgba(99, 102, 241, 0.25); }
body.dark-mode .ai-generate-btn:hover { background: rgba(99, 102, 241, 0.2); border-color: rgba(99, 102, 241, 0.35); }
</style>
