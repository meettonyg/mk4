<template>
  <div class="gmkb-questions-component" :data-component-id="componentId">
    <div class="questions-container">
      <h2 v-if="title" class="questions-title">{{ title }}</h2>
      <p v-if="description" class="questions-description">{{ description }}</p>
      
      <div class="questions-list">
        <div
          v-for="(qa, index) in displayQuestions"
          :key="index"
          class="question-item"
        >
          <button
            @click="toggleQuestion(index)"
            class="question-header"
          >
            <span class="question-text">{{ qa.question || qa.text }}</span>
            <span class="question-toggle" :class="{ open: openQuestions.includes(index) }">
              {{ openQuestions.includes(index) ? '−' : '+' }}
            </span>
          </button>
          
          <transition name="answer">
            <div v-if="openQuestions.includes(index)" class="question-answer">
              <p>{{ qa.answer || 'Please contact me for more information about this topic.' }}</p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'QuestionsRenderer',
  props: {
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    // Store and composables
    const store = useMediaKitStore();
    const { questions: podsQuestions } = usePodsData();
    
    // Local state
    const openQuestions = ref([]);
    
    // Computed properties
    const title = computed(() => {
      return props.data?.title || 'Frequently Asked Questions';
    });
    
    const description = computed(() => {
      return props.data?.description || '';
    });
    
    // PHASE 2 FIX: Add null safety with optional chaining
    const displayQuestions = computed(() => {
      // Handle array format (new structure)
      if (Array.isArray(props.data?.questions) && props.data.questions.length > 0) {
        // If questions is an array of objects with question and answer
        if (typeof props.data.questions[0] === 'object') {
          return props.data.questions.filter(q => q && q.question);
        }
        // If questions is an array of strings paired with answers array
        if (Array.isArray(props.data.answers)) {
          return props.data.questions.map((question, index) => ({
            question: question || `Question ${index + 1}`,
            answer: props.data.answers[index] || ''
          })).filter(q => q.question && q.answer);
        }
      }
      
      // Build from individual question fields (legacy format)
      const questionsList = [];
      for (let i = 1; i <= 10; i++) {
        const question = props.data?.[`question_${i}`] || props.data?.[`question${i}`];
        const answer = props.data?.[`answer_${i}`] || props.data?.[`answer${i}`];
        
        if (question) {
          questionsList.push({
            question: String(question),
            answer: answer ? String(answer) : ''
          });
        }
      }
      
      // ROOT FIX: Use Pods questions as fallback if no component data
      if (questionsList.length === 0 && podsQuestions.value && podsQuestions.value.length > 0) {
        // Convert Pods questions to display format
        return podsQuestions.value.map(q => ({
          question: q.text,
          answer: '' // Pods questions typically don't have pre-defined answers
        }));
      }
      
      return questionsList;
    });
    
    // Methods
    const toggleQuestion = (index) => {
      const idx = openQuestions.value.indexOf(index);
      if (idx > -1) {
        openQuestions.value.splice(idx, 1);
      } else {
        openQuestions.value.push(index);
      }
    };
    
    // Lifecycle
    onMounted(() => {
      // ROOT FIX: No polling or global checking - use event-driven approach
      if (store.components[props.componentId]) {
        console.log('Questions component mounted:', props.componentId);
        
        // Check if using Pods data
        const usingPodsData = podsQuestions.value && podsQuestions.value.length > 0 && 
          displayQuestions.value.some(q => 
            podsQuestions.value.some(podQ => podQ.text === (q.question || q.text))
          );
        
        // Dispatch mount event
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'questions',
            id: props.componentId,
            podsDataUsed: usingPodsData
          }
        }));
      }
    });
    
    return {
      title,
      description,
      displayQuestions,
      openQuestions,
      toggleQuestion
    };
  }
};
</script>

<style scoped>
.gmkb-questions-component {
  padding: var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-surface, #fff);
}

.questions-container {
  max-width: 800px;
  margin: 0 auto;
}

.questions-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-2xl, 2rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  line-height: var(--gmkb-line-height-heading, 1.2);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}

.questions-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: var(--gmkb-spacing-md, 1rem);
}

.question-item {
  background: var(--gmkb-color-background, #f8f9fa);
  border-radius: var(--gmkb-border-radius, 8px);
  overflow: hidden;
  transition: var(--gmkb-transition, all 0.3s ease);
}

.question-item:hover {
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0,0,0,0.05));
}

.question-header {
  width: 100%;
  padding: var(--gmkb-spacing-lg, 1.25rem);
  background: none;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-align: left;
  transition: var(--gmkb-transition, background 0.3s ease);
}

.question-header:hover {
  background: rgba(0, 0, 0, 0.03);
}

.question-text {
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.125rem);
  font-weight: var(--gmkb-font-weight-semibold, 600);
  flex: 1;
}

.question-toggle {
  color: var(--gmkb-color-primary, #007cba);
  font-size: var(--gmkb-font-size-xl, 1.5rem);
  font-weight: var(--gmkb-font-weight-light, 300);
  transition: var(--gmkb-transition, transform 0.3s ease);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-toggle.open {
  transform: rotate(180deg);
}

.question-answer {
  padding: 0 var(--gmkb-spacing-lg, 1.25rem) var(--gmkb-spacing-lg, 1.25rem);
}

.question-answer p {
  color: var(--gmkb-color-text-light, #666);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
}

/* Transition */
.answer-enter-active, .answer-leave-active {
  transition: all 0.3s ease;
}

.answer-enter-from, .answer-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-max-width: var(--gmkb-max-width-content, 768px)) {
  .question-text {
    font-size: var(--gmkb-font-size-base, 1rem);
  }
}
</style>
