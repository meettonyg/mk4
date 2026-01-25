<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root topics-questions-component"
  >
    <!-- Display Mode Selector -->
    <div v-if="showModeSelector" class="display-mode-selector">
      <button 
        v-for="mode in modes" 
        :key="mode.value"
        @click="currentMode = mode.value"
        :class="['mode-btn', { active: currentMode === mode.value }]"
      >
        {{ mode.label }}
      </button>
    </div>

    <!-- Topics Section -->
    <div v-if="currentMode === 'topics' || currentMode === 'combined'" class="topics-section">
      <h3 v-if="topicsTitle" class="section-title">{{ topicsTitle }}</h3>
      <div :class="['topics-container', `display-${topicsDisplay}`]">
        <div 
          v-for="(topic, index) in filteredTopics" 
          :key="`topic-${index}`"
          :class="['topic-item', { 'card-style': topicsDisplay === 'cards' }]"
        >
          <span class="topic-number">{{ index + 1 }}</span>
          <span class="topic-text">{{ topic }}</span>
        </div>
      </div>
    </div>

    <!-- Questions Section -->
    <div v-if="currentMode === 'questions' || currentMode === 'combined'" class="questions-section">
      <h3 v-if="questionsTitle" class="section-title">{{ questionsTitle }}</h3>
      <div :class="['questions-container', `display-${questionsDisplay}`]">
        <div 
          v-for="(question, index) in filteredQuestions" 
          :key="`question-${index}`"
          :class="['question-item', { 'accordion-item': questionsDisplay === 'accordion' }]"
        >
          <div 
            v-if="questionsDisplay === 'accordion'"
            @click="toggleQuestion(index)"
            class="question-header"
          >
            <span class="question-number">Q{{ index + 1 }}</span>
            <span class="question-text">{{ question }}</span>
            <span class="accordion-icon">{{ expandedQuestions.includes(index) ? '−' : '+' }}</span>
          </div>
          <div 
            v-else 
            class="question-content"
          >
            <span class="question-number">Q{{ index + 1 }}:</span>
            <span class="question-text">{{ question }}</span>
          </div>
          
          <!-- Placeholder for answers in accordion mode -->
          <div 
            v-if="questionsDisplay === 'accordion' && expandedQuestions.includes(index)"
            class="answer-placeholder"
          >
            <p>Click to contact me about this topic</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: () => ({})
  },
  props: {
    type: Object,
    default: () => ({})
  },
  settings: {
    type: Object,
    default: () => ({})
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

// Local state
const currentMode = ref(props.data?.displayMode || props.props?.displayMode || 'combined');
const expandedQuestions = ref([]);

const modes = [
  { value: 'topics', label: 'Topics Only' },
  { value: 'questions', label: 'Questions Only' },
  { value: 'combined', label: 'Topics & Questions' }
];

// Data from component JSON state (single source of truth)
const showModeSelector = computed(() => {
  const val = props.data?.showModeSelector ?? props.props?.showModeSelector;
  return val !== false;
});

const topicsDisplay = computed(() => props.data?.topicsDisplay || props.props?.topicsDisplay || 'cards');
const questionsDisplay = computed(() => props.data?.questionsDisplay || props.props?.questionsDisplay || 'list');
const topicsTitle = computed(() => props.data?.topicsTitle || props.props?.topicsTitle || 'Topics of Expertise');
const questionsTitle = computed(() => props.data?.questionsTitle || props.props?.questionsTitle || 'Interview Questions');

// Topics from component data
const filteredTopics = computed(() => {
  const topics = [];
  for (let i = 1; i <= 10; i++) {
    const topic = props.data?.[`topic_${i}`] || props.props?.[`topic_${i}`];
    if (topic && topic.trim()) {
      topics.push(topic);
    }
  }
  return topics;
});

// Questions from component data
const filteredQuestions = computed(() => {
  const questions = [];
  for (let i = 1; i <= 25; i++) {
    const question = props.data?.[`question_${i}`] || props.props?.[`question_${i}`];
    if (question && question.trim()) {
      questions.push(question);
    }
  }
  return questions;
});

const toggleQuestion = (index) => {
  const pos = expandedQuestions.value.indexOf(index);
  if (pos >= 0) {
    expandedQuestions.value.splice(pos, 1);
  } else {
    expandedQuestions.value.push(index);
  }
};
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.topics-questions-component {
  /* Styles applied via inline styles from ComponentStyleService */
}

/* Mode Selector */
.display-mode-selector {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.mode-btn {
  padding: 0.5rem 1rem;
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
  border: 2px solid #e2e8f0;
  border-radius: var(--component-border-radius, 8px);
  color: inherit;
  /* font-size and font-weight inherited from component-root */
  cursor: pointer;
  transition: all 0.3s;
}

.mode-btn:hover {
  background: var(--primary-color, #3b82f6);
  color: white;
  border-color: var(--primary-color, #3b82f6);
}

.mode-btn.active {
  background: var(--primary-color, #3b82f6);
  color: white;
  border-color: var(--primary-color, #3b82f6);
}

/* Section Titles */
.section-title {
  /* font-size and font-weight inherited from component-root */
  margin: 0 0 1.5rem 0;
  text-align: center;
  color: inherit;
}

/* Topics Section */
.topics-section {
  margin-bottom: 3rem;
}

.topics-container.display-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.topics-container.display-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 800px;
  margin: 0 auto;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
  border-radius: var(--component-border-radius, 8px);
  transition: transform 0.3s;
}

.topic-item.card-style {
  /* box-shadow controlled by theme/ComponentStyleService when explicitly set */
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
}

.topic-item.card-style:hover {
  transform: translateY(-2px);
  /* box-shadow controlled by theme/ComponentStyleService when explicitly set */
}

.topic-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--primary-color, #3b82f6);
  color: white;
  border-radius: 50%;
  /* font-weight and font-size inherited from component-root */
  flex-shrink: 0;
}

.topic-text {
  flex: 1;
  /* font-size and line-height inherited from component-root */
  color: inherit;
}

/* Questions Section */
.questions-section {
  margin-bottom: 2rem;
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 800px;
  margin: 0 auto;
}

.question-item {
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
  border: 1px solid #e2e8f0;
  border-radius: var(--component-border-radius, 8px);
  overflow: hidden;
}

.question-header,
.question-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.question-header {
  cursor: pointer;
  transition: background 0.3s;
}

.question-header:hover {
  background: rgba(0, 0, 0, 0.03);
}

.question-number {
  /* font-weight inherited from component-root */
  color: var(--primary-color, #3b82f6);
  flex-shrink: 0;
}

.question-text {
  flex: 1;
  /* font-size and line-height inherited from component-root */
  color: inherit;
}

.accordion-icon {
  font-size: 1.5rem;
  color: var(--primary-color, #3b82f6);
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.answer-placeholder {
  padding: 1rem;
  background: rgba(59, 130, 246, 0.05);
  border-top: 1px solid #e2e8f0;
}

.answer-placeholder p {
  margin: 0;
  opacity: 0.8; /* Use opacity instead of fixed color */
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .topics-container.display-cards {
    grid-template-columns: 1fr;
  }
  
  .mode-btn {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
}
</style>
