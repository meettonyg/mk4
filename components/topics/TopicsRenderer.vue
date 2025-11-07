<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--topics" :data-component-id="componentId">
    <div class="component-root topics-container">
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
import { computed } from 'vue';
import { usePodsData } from '../../src/composables/usePodsData';

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
    // COMPOSITION API: Access Pods data via composable
    const podsData = usePodsData();
    
    // TITLE: Component data > default
    const title = computed(() => {
      return props.data?.title || 'Speaking Topics';
    });
    
    // DESCRIPTION: Component data only
    const description = computed(() => {
      return props.data?.description || '';
    });
    
    // TOPICS: Priority is component data > Pods fallback > empty array
    const topics = computed(() => {
      // Priority 1: Component data (user customization)
      if (props.data?.topics && Array.isArray(props.data.topics)) {
        return props.data.topics;
      }
      
      // Priority 2: Pods data (from database)
      // Pods stores topics as topic_1, topic_2, etc.
      if (podsData.rawPodsData?.value) {
        const podTopics = [];
        const rawData = podsData.rawPodsData.value;
        
        // Extract topics 1-5
        for (let i = 1; i <= 5; i++) {
          const topicKey = `topic_${i}`;
          if (rawData[topicKey] && rawData[topicKey].trim()) {
            // Topics can be strings or objects with name/text/description
            podTopics.push(rawData[topicKey]);
          }
        }
        
        if (podTopics.length > 0) {
          return podTopics;
        }
      }
      
      // Priority 3: Empty array (will show no topics)
      return [];
    });
    
    return {
      title,
      description,
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
