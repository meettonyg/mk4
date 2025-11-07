<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--questions" :data-component-id="componentId">
    <div class="component-root questions-content">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    <div class="questions-list">
      <div v-for="(question, index) in questions" :key="index" class="question-item">
        <div class="question-text">{{ question.question || question }}</div>
        <div v-if="question.answer" class="question-answer">{{ question.answer }}</div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'QuestionsRenderer',
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
    }
  },
  setup(props) {
    // COMPOSITION API: Access Pods data via composable
    const podsData = usePodsData();
    
    // TITLE: Component data > default
    const title = computed(() => {
      return props.data?.title || 'Frequently Asked Questions';
    });
    
    // QUESTIONS: Priority is component data > Pods fallback > empty array
    const questions = computed(() => {
      // Priority 1: Component data (user customization)
      if (props.data?.questions && Array.isArray(props.data.questions)) {
        return props.data.questions;
      }
      
      // Priority 2: Pods data (from database)
      // Pods stores questions as question_1, question_2, etc.
      if (podsData.rawPodsData?.value) {
        const podQuestions = [];
        const rawData = podsData.rawPodsData.value;
        
        // Extract questions 1-25
        for (let i = 1; i <= 25; i++) {
          const questionKey = `question_${i}`;
          if (rawData[questionKey]) {
            podQuestions.push({
              question: rawData[questionKey],
              answer: rawData[`question_${i}_answer`] || ''
            });
          }
        }
        
        if (podQuestions.length > 0) {
          return podQuestions;
        }
      }
      
      // Priority 3: Empty array (will show no questions)
      return [];
    });
    
    return {
      title,
      questions
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles */
</style>
