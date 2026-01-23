<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--questions" :data-component-id="componentId">
    <div class="component-root questions-content">
      <h2 v-if="title" class="section-title">{{ title }}</h2>
      <p v-if="description" class="section-description">{{ description }}</p>
      <div class="questions-list">
        <!-- Placeholder questions when editing with no data -->
        <template v-if="showPlaceholders">
          <div v-for="(question, index) in placeholderQuestions" :key="index" class="question-item question-item--placeholder">
            <div class="question-text">{{ question.question }}</div>
            <div class="question-answer">{{ question.answer }}</div>
          </div>
        </template>

        <!-- Actual questions when data exists -->
        <template v-else>
          <div v-for="(question, index) in questions" :key="index" class="question-item">
            <div class="question-text">{{ question.question || question }}</div>
            <div v-if="question.answer" class="question-answer">{{ question.answer }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

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
    // Data from component JSON state (single source of truth)
    const title = computed(() => props.data?.title || props.props?.title || 'Frequently Asked Questions');
    const description = computed(() => props.data?.description || props.props?.description || '');

    // Questions from component data
    const questions = computed(() => {
      if (props.data?.questions && Array.isArray(props.data.questions)) {
        return props.data.questions;
      }

      // Build from individual question fields
      const questionsList = [];
      for (let i = 1; i <= 25; i++) {
        const questionKey = `question_${i}`;
        const questionValue = props.data?.[questionKey] || props.props?.[questionKey];
        if (questionValue) {
          questionsList.push({
            question: questionValue,
            answer: props.data?.[`question_${i}_answer`] || props.props?.[`question_${i}_answer`] || ''
          });
        }
      }

      return questionsList;
    });

    // Show placeholders when editing with no questions
    const showPlaceholders = computed(() => {
      return questions.value.length === 0 && (props.isEditing || props.isSelected);
    });

    // Placeholder questions
    const placeholderQuestions = [
      { question: 'What is your first question?', answer: 'Add your answer here' },
      { question: 'Add another frequently asked question', answer: 'Provide a helpful answer' }
    ];

    return {
      title,
      description,
      questions,
      showPlaceholders,
      placeholderQuestions
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles */
</style>
