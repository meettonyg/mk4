<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--topics" :data-component-id="componentId">
    <div class="topics-container">
      <h2 v-if="title" class="topics-title">{{ title }}</h2>
      <p v-if="description" class="topics-description">{{ description }}</p>
      
      <div v-for="(topic, index) in topics" :key="index" class="topic-item">
        <div class="topic-title">{{ topic.name || topic.text || topic }}</div>
        <p v-if="topic.description" class="topic-description">{{ topic.description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopicsRenderer',
  props: {
    componentId: String,
    // ROOT FIX: Standardized prop names (data contract)
    title: {
      type: String,
      default: 'Speaking Topics'
    },
    description: String,
    topics: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style>
/* ROOT FIX: NO scoped styles
   All styling comes from design-system/components.css:
   - .gmkb-component (base component wrapper)
   - .gmkb-component--topics (topics-specific styles)
   - .topics-container, .topic-item, .topic-title, .topic-description
*/
</style>
