<template>
  <div class="gmkb-topics-questions">
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

    <!-- Topics Only Mode -->
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

    <!-- Questions Only Mode -->
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
            <p>Answer content would go here...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopicsQuestionsRenderer',
  props: {
    // Component standard props
    componentId: {
      type: String,
      required: false
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
    
    // Topics (topic_1 through topic_5)
    topic_1: { type: String, default: '' },
    topic_2: { type: String, default: '' },
    topic_3: { type: String, default: '' },
    topic_4: { type: String, default: '' },
    topic_5: { type: String, default: '' },
    
    // Questions (question_1 through question_25)
    ...Object.fromEntries(
      Array.from({ length: 25 }, (_, i) => [
        `question_${i + 1}`,
        { type: String, default: '' }
      ])
    ),
    
    // Display options
    displayMode: {
      type: String,
      default: 'combined',
      validator: value => ['topics', 'questions', 'combined'].includes(value)
    },
    showModeSelector: {
      type: Boolean,
      default: true
    },
    topicsDisplay: {
      type: String,
      default: 'cards',
      validator: value => ['cards', 'list'].includes(value)
    },
    questionsDisplay: {
      type: String,
      default: 'list',
      validator: value => ['accordion', 'list'].includes(value)
    },
    topicsTitle: {
      type: String,
      default: 'Topics of Expertise'
    },
    questionsTitle: {
      type: String,
      default: 'Interview Questions'
    }
  },
  data() {
    return {
      currentMode: this.displayMode,
      expandedQuestions: [],
      modes: [
        { value: 'topics', label: 'Topics Only' },
        { value: 'questions', label: 'Questions Only' },
        { value: 'combined', label: 'Topics & Questions' }
      ]
    };
  },
  computed: {
    filteredTopics() {
      const topics = [];
      
      // Check data prop first
      if (this.data) {
        for (let i = 1; i <= 5; i++) {
          const topic = this.data[`topic_${i}`] || this[`topic_${i}`];
          if (topic && topic.trim()) {
            topics.push(topic);
          }
        }
      } else {
        // Fallback to direct props
        for (let i = 1; i <= 5; i++) {
          const topic = this[`topic_${i}`];
          if (topic && topic.trim()) {
            topics.push(topic);
          }
        }
      }
      
      return topics;
    },
    filteredQuestions() {
      const questions = [];
      
      // Check data prop first
      if (this.data) {
        for (let i = 1; i <= 25; i++) {
          const question = this.data[`question_${i}`] || this[`question_${i}`];
          if (question && question.trim()) {
            questions.push(question);
          }
        }
      } else {
        // Fallback to direct props
        for (let i = 1; i <= 25; i++) {
          const question = this[`question_${i}`];
          if (question && question.trim()) {
            questions.push(question);
          }
        }
      }
      
      return questions;
    }
  },
  mounted() {
    // Auto-load from Pods data if available
    if (window.gmkbData?.pods_data) {
      this.loadFromPodsData();
    }
  },
  methods: {
    loadFromPodsData() {
      const pods = window.gmkbData.pods_data;
      if (!pods) return;
      
      const updates = {};
      
      // Load topics
      for (let i = 1; i <= 5; i++) {
        if (pods[`topic_${i}`] && !this[`topic_${i}`]) {
          updates[`topic_${i}`] = pods[`topic_${i}`];
        }
      }
      
      // Load questions
      for (let i = 1; i <= 25; i++) {
        if (pods[`question_${i}`] && !this[`question_${i}`]) {
          updates[`question_${i}`] = pods[`question_${i}`];
        }
      }
      
      if (Object.keys(updates).length > 0) {
        this.$emit('update', updates);
      }
    },
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

<style scoped>
.gmkb-topics-questions {
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
@media (max-width: 768px) {
  .topics-container.display-cards {
    grid-template-columns: 1fr;
  }
  
  .mode-btn {
    font-size: var(--gmkb-font-size-sm, 0.875rem);
    padding: var(--gmkb-spacing-xs, 0.25rem) var(--gmkb-spacing-sm, 0.5rem);
  }
}
</style>
