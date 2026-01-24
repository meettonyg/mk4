<template>
  <div class="gmkb-component gmkb-component--topicsquestions" :data-component-id="componentId">
    <!-- Display Mode Selector -->
    <div class="display-mode-selector" v-if="showModeSelector">
      <button 
        v-for="mode in modes" 
        :key="mode.value"
        @click="currentMode = mode.value"
        :class="['mode-btn', { active: currentMode === mode.value }]"
      >
        {{ mode.label }}
      </button>
    </div>

    <!-- Placeholder content when editing with no data -->
    <div v-if="showPlaceholders" class="placeholder-content">
      <div class="topics-section">
        <h3 class="section-title">{{ topicsTitle }}</h3>
        <div :class="['topics-container', `display-${topicsDisplay}`]">
          <div
            v-for="(topic, index) in placeholderTopics"
            :key="`placeholder-topic-${index}`"
            :class="['topic-item', 'topic-item--placeholder', { 'card-style': topicsDisplay === 'cards' }]"
          >
            <span class="topic-number">{{ index + 1 }}</span>
            <span class="topic-text">{{ topic }}</span>
          </div>
        </div>
      </div>
      <div class="questions-section">
        <h3 class="section-title">{{ questionsTitle }}</h3>
        <div :class="['questions-container', `display-${questionsDisplay}`]">
          <div
            v-for="(question, index) in placeholderQuestions"
            :key="`placeholder-question-${index}`"
            class="question-item question-item--placeholder"
          >
            <div class="question-content">
              <span class="question-number">Q{{ index + 1 }}:</span>
              <span class="question-text">{{ question }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Topics Only Mode -->
    <div v-else-if="currentMode === 'topics' || currentMode === 'combined'" class="topics-section">
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

    <!-- Questions Only Mode -->
    <div v-if="!showPlaceholders && (currentMode === 'questions' || currentMode === 'combined')" class="questions-section">
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
            <p>Answer content would go here...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'TopicsQuestionsRenderer',
  props: {
    // STANDARD INTERFACE: All components accept the same props structure
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
    // Optional editing state
    isEditing: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    isBuilderMode: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // Display configuration from props.data or defaults
    const displayMode = computed(() => props.data?.displayMode || 'combined');
    const showModeSelector = computed(() => props.data?.showModeSelector !== false);
    const topicsDisplay = computed(() => props.data?.topicsDisplay || 'cards');
    const questionsDisplay = computed(() => props.data?.questionsDisplay || 'list');
    const topicsTitle = computed(() => props.data?.topicsTitle || 'Topics of Expertise');
    const questionsTitle = computed(() => props.data?.questionsTitle || 'Interview Questions');
    
    // TOPICS: Extract from component data
    const filteredTopics = computed(() => {
      const topics = [];

      // Priority 1: Check component data array first
      if (props.data?.topics && Array.isArray(props.data.topics)) {
        return props.data.topics;
      }

      // Priority 2: Extract individual topic fields from component data
      for (let i = 1; i <= 5; i++) {
        const topicKey = `topic_${i}`;
        if (props.data?.[topicKey] && props.data[topicKey].trim()) {
          topics.push(props.data[topicKey]);
        }
      }

      return topics;
    });
    
    // QUESTIONS: Extract from component data
    const filteredQuestions = computed(() => {
      const questions = [];

      // Priority 1: Check component data array first
      if (props.data?.questions && Array.isArray(props.data.questions)) {
        return props.data.questions;
      }

      // Priority 2: Extract individual question fields from component data
      for (let i = 1; i <= 25; i++) {
        const questionKey = `question_${i}`;
        if (props.data?.[questionKey] && props.data[questionKey].trim()) {
          questions.push(props.data[questionKey]);
        }
      }

      return questions;
    });

    // Show placeholders when in builder mode with no data
    const showPlaceholders = computed(() => {
      return filteredTopics.value.length === 0 && filteredQuestions.value.length === 0 && (props.isBuilderMode || props.isEditing || props.isSelected);
    });

    // Placeholder data
    const placeholderTopics = ['Topic 1', 'Topic 2', 'Topic 3'];
    const placeholderQuestions = ['Question 1?', 'Question 2?'];

    return {
      // Configuration
      displayMode,
      showModeSelector,
      topicsDisplay,
      questionsDisplay,
      topicsTitle,
      questionsTitle,
      // Data
      filteredTopics,
      filteredQuestions,
      // UI state
      modes: [
        { value: 'topics', label: 'Topics Only' },
        { value: 'questions', label: 'Questions Only' },
        { value: 'combined', label: 'Topics & Questions' }
      ],
      // Placeholders
      showPlaceholders,
      placeholderTopics,
      placeholderQuestions
    };
  },
  data() {
    return {
      currentMode: this.displayMode,
      expandedQuestions: []
    };
  },
  methods: {
    toggleQuestion(index) {
      const pos = this.expandedQuestions.indexOf(index);
      if (pos >= 0) {
        this.expandedQuestions.splice(pos, 1);
      } else {
        this.expandedQuestions.push(index);
      }
    }
  }
};
</script>

<style>
.gmkb-component--topicsquestions {
  padding: var(--gmkb-spacing-lg, 1.5rem) 0;
}

/* Mode Selector */
.display-mode-selector {
  display: flex;
  gap: var(--gmkb-spacing-sm, 0.5rem);
  justify-content: center;
  margin-bottom: var(--gmkb-spacing-lg, 1.5rem);
  flex-wrap: wrap;
}

.mode-btn {
  padding: var(--gmkb-spacing-sm, 0.5rem) var(--gmkb-spacing-md, 1rem);
  background: var(--gmkb-color-surface, #f5f5f5);
  border: 2px solid var(--gmkb-color-border, #e0e0e0);
  border-radius: var(--gmkb-border-radius, 8px);
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-base, 1rem);
  cursor: pointer;
  transition: all var(--gmkb-transition-speed, 0.3s);
}

.mode-btn:hover {
  background: var(--gmkb-color-primary, #007bff);
  color: white;
  border-color: var(--gmkb-color-primary, #007bff);
}

.mode-btn.active {
  background: var(--gmkb-color-primary, #007bff);
  color: white;
  border-color: var(--gmkb-color-primary, #007bff);
}

/* Section Titles */
.section-title {
  font-family: var(--gmkb-font-heading, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  font-weight: 600;
  color: var(--gmkb-color-text, #333);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
  text-align: center;
}

/* Topics Section */
.topics-section {
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
}

.topics-container.display-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--gmkb-spacing-md, 1rem);
}

.topics-container.display-list {
  display: flex;
  flex-direction: column;
  gap: var(--gmkb-spacing-sm, 0.5rem);
}

.topic-item {
  display: flex;
  align-items: center;
  gap: var(--gmkb-spacing-sm, 0.5rem);
  padding: var(--gmkb-spacing-md, 1rem);
  background: var(--gmkb-color-surface, #ffffff);
  border-radius: var(--gmkb-border-radius, 8px);
  transition: transform var(--gmkb-transition-speed, 0.3s);
}

.topic-item.card-style {
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));
  border: 1px solid var(--gmkb-color-border, #e0e0e0);
}

.topic-item.card-style:hover {
  transform: translateY(-2px);
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
}

.topic-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: var(--gmkb-color-primary, #007bff);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: var(--gmkb-font-size-sm, 0.875rem);
  flex-shrink: 0;
}

.topic-text {
  flex: 1;
  font-size: var(--gmkb-font-size-base, 1rem);
  color: var(--gmkb-color-text, #333);
  line-height: var(--gmkb-line-height-base, 1.6);
}

/* Questions Section */
.questions-section {
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: var(--gmkb-spacing-sm, 0.5rem);
}

.question-item {
  background: var(--gmkb-color-surface, #ffffff);
  border: 1px solid var(--gmkb-color-border, #e0e0e0);
  border-radius: var(--gmkb-border-radius, 8px);
  overflow: hidden;
}

.question-header,
.question-content {
  display: flex;
  align-items: center;
  gap: var(--gmkb-spacing-sm, 0.5rem);
  padding: var(--gmkb-spacing-md, 1rem);
}

.question-header {
  cursor: pointer;
  transition: background var(--gmkb-transition-speed, 0.3s);
}

.question-header:hover {
  background: var(--gmkb-color-surface, #f5f5f5);
}

.question-number {
  font-weight: 600;
  color: var(--gmkb-color-primary, #007bff);
  flex-shrink: 0;
}

.question-text {
  flex: 1;
  font-size: var(--gmkb-font-size-base, 1rem);
  color: var(--gmkb-color-text, #333);
  line-height: var(--gmkb-line-height-base, 1.6);
}

.accordion-icon {
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  color: var(--gmkb-color-primary, #007bff);
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.answer-placeholder {
  padding: var(--gmkb-spacing-md, 1rem);
  background: var(--gmkb-color-surface, #f9f9f9);
  border-top: 1px solid var(--gmkb-color-border, #e0e0e0);
}

.answer-placeholder p {
  margin: 0;
  color: var(--gmkb-color-text-light, #666);
  font-style: italic;
}

/* Responsive */
@media (max-max-width: var(--gmkb-max-width-content, 768px)) {
  .topics-container.display-cards {
    grid-template-columns: 1fr;
  }
  
  .mode-btn {
    font-size: var(--gmkb-font-size-sm, 0.875rem);
    padding: var(--gmkb-spacing-xs, 0.25rem) var(--gmkb-spacing-sm, 0.5rem);
  }
}
</style>
