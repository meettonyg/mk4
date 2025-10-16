<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--questions" :data-component-id="componentId">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    <div class="questions-list">
      <div v-for="(question, index) in questions" :key="index" class="question-item">
        <div class="question-text">{{ question.question || question }}</div>
        <div v-if="question.answer" class="question-answer">{{ question.answer }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionsRenderer',
  props: {
    componentId: String,
    title: {
      type: String,
      default: 'Frequently Asked Questions'
    },
    questions: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles */
</style>
