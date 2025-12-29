<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--topics" :data-component-id="componentId">
    <div class="component-root topics-container">
      <h2 v-if="title" class="topics-title">{{ title }}</h2>
      <p v-if="description" class="topics-description">{{ description }}</p>

      <div class="topics-grid" :style="gridStyle">
        <div v-for="(topic, index) in topics" :key="index" class="topic-item">
          <span v-if="showIcons" class="topic-icon">💡</span>
          <div class="topic-title">{{ topic.name || topic.text || topic }}</div>
          <p v-if="topic.description" class="topic-description">{{ topic.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'TopicsRenderer',
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
    const title = computed(() => props.data?.title || props.props?.title || 'Speaking Topics');

    const description = computed(() => props.data?.description || props.props?.description || '');

    // Display options from editor
    const columns = computed(() => parseInt(props.data?.columns) || 3);
    const showIcons = computed(() => props.data?.showIcons || false);

    // Dynamic grid style based on columns
    const gridStyle = computed(() => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
      gap: '16px'
    }));

    // Topics from component data
    const topics = computed(() => {
      if (props.data?.topics && Array.isArray(props.data.topics)) {
        return props.data.topics;
      }

      // Build from individual topic fields
      const topicsList = [];
      for (let i = 1; i <= 10; i++) {
        const topicKey = `topic_${i}`;
        const topicValue = props.data?.[topicKey] || props.props?.[topicKey];
        if (topicValue) {
          topicsList.push(topicValue);
        }
      }

      return topicsList;
    });

    return {
      title,
      description,
      columns,
      showIcons,
      gridStyle,
      topics
    };
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
