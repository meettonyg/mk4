<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <div 
    class="component-root questions-component"
    :data-component-id="componentId"
  >
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
          :aria-expanded="openQuestions.includes(index)"
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

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

// Store and composables
const store = useMediaKitStore();
const { questions: podsQuestions } = usePodsData();

// Local state
const openQuestions = ref([]);

// Extract data from both data and props for compatibility
const title = computed(() => props.data?.title || props.props?.title || 'Frequently Asked Questions');
const description = computed(() => props.data?.description || props.props?.description || '');

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
    const question = props.data?.[`question_${i}`] || props.props?.[`question_${i}`] || 
                     props.data?.[`question${i}`] || props.props?.[`question${i}`];
    const answer = props.data?.[`answer_${i}`] || props.props?.[`answer_${i}`] || 
                   props.data?.[`answer${i}`] || props.props?.[`answer${i}`];
    
    if (question) {
      questionsList.push({
        question: String(question),
        answer: answer ? String(answer) : ''
      });
    }
  }
  
  // Use Pods questions as fallback if no component data
  if (questionsList.length === 0 && podsQuestions.value && podsQuestions.value.length > 0) {
    return podsQuestions.value.map(q => ({
      question: q.text || q.question,
      answer: q.answer || ''
    }));
  }
  
  return questionsList;
});

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
  if (store.components[props.componentId]) {
    document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
      detail: {
        type: 'questions',
        id: props.componentId,
        podsDataUsed: podsQuestions.value && podsQuestions.value.length > 0 && 
          displayQuestions.value.some(q => 
            podsQuestions.value.some(podQ => (podQ.text || podQ.question) === q.question)
          )
      }
    }));
  }
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.questions-component {
  /* Styles applied via inline styles from ComponentStyleService */
}

.questions-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: inherit;
}

.questions-description {
  text-align: center;
  color: #64748b;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.question-item {
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.question-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.question-header {
  width: 100%;
  padding: 1.25rem;
  background: none;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-align: left;
  transition: background 0.3s ease;
}

.question-header:hover {
  background: rgba(0, 0, 0, 0.03);
}

.question-text {
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 600;
  flex: 1;
  padding-right: 1rem;
}

.question-toggle {
  color: #3b82f6;
  font-size: 1.5rem;
  font-weight: 300;
  transition: transform 0.3s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.question-toggle.open {
  transform: rotate(180deg);
}

.question-answer {
  padding: 0 1.25rem 1.25rem;
}

.question-answer p {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

/* Transition */
.answer-enter-active, .answer-leave-active {
  transition: all 0.3s ease;
}

.answer-enter-from, .answer-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .questions-title {
    font-size: 1.5rem;
  }
  
  .question-text {
    font-size: 1rem;
  }
  
  .question-header {
    padding: 1rem;
  }
}
</style>
