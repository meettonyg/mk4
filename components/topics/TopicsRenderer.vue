<template>
  <div class="gmkb-topics-component" :data-component-id="componentId">
    <div class="topics-container">
      <h2 v-if="title" class="topics-title">{{ title }}</h2>
      <p v-if="description" class="topics-description">{{ description }}</p>
      
      <div class="topics-grid">
        <div 
          v-for="(topic, index) in displayTopics" 
          :key="index"
          class="topic-card"
        >
          <div v-if="topic.icon" class="topic-icon">
            <i :class="topic.icon"></i>
          </div>
          <h3 class="topic-name">{{ topic.name || topic.text || topic }}</h3>
          <p v-if="topic.description" class="topic-description">
            {{ topic.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'TopicsRenderer',
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
    const { topics: podsTopics } = usePodsData();
    
    // Computed properties
    const title = computed(() => {
      return props.data.title || 'Speaking Topics';
    });
    
    const description = computed(() => {
      return props.data.description || '';
    });
    
    const displayTopics = computed(() => {
      // Handle various data formats
      if (Array.isArray(props.data.topics) && props.data.topics.length > 0) {
        return props.data.topics;
      }
      
      // Handle individual topic fields from component data
      const topicsList = [];
      for (let i = 1; i <= 10; i++) {
        if (props.data[`topic_${i}`]) {
          const topicValue = props.data[`topic_${i}`];
          if (typeof topicValue === 'object') {
            topicsList.push(topicValue);
          } else {
            topicsList.push({
              name: topicValue,
              description: props.data[`topic_${i}_description`] || '',
              icon: props.data[`topic_${i}_icon`] || ''
            });
          }
        }
      }
      
      // ROOT FIX: Use Pods topics as fallback if no component data
      if (topicsList.length === 0 && podsTopics.value && podsTopics.value.length > 0) {
        // Convert Pods topics to display format
        return podsTopics.value.map((topic, index) => ({
          name: topic.text,
          description: '',
          icon: getTopicIcon(index)
        }));
      }
      
      return topicsList;
    });
    
    // Helper function to assign default icons
    const getTopicIcon = (index) => {
      const icons = [
        'fas fa-rocket',
        'fas fa-lightbulb',
        'fas fa-chart-line',
        'fas fa-users',
        'fas fa-brain',
        'fas fa-globe',
        'fas fa-award',
        'fas fa-book',
        'fas fa-heart',
        'fas fa-star'
      ];
      return icons[index % icons.length];
    };
    
    // Lifecycle
    onMounted(() => {
      // ROOT FIX: No polling or global checking - use event-driven approach
      if (store.components[props.componentId]) {
        console.log('Topics component mounted:', props.componentId);
        
        // Check if using Pods data
        const usingPodsData = podsTopics.value && podsTopics.value.length > 0 && 
          displayTopics.value.some(topic => 
            podsTopics.value.some(podTopic => podTopic.text === (topic.name || topic.text || topic))
          );
        
        // Dispatch mount event
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'topics',
            id: props.componentId,
            podsDataUsed: usingPodsData
          }
        }));
      }
    });
    
    return {
      title,
      description,
      displayTopics
    };
  }
};
</script>

<style scoped>
.gmkb-topics-component {
  padding: var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-background, #f8f9fa);
}

.topics-container {
  max-width: var(--gmkb-container-max-width, 1200px);
  margin: 0 auto;
}

.topics-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-2xl, 2rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  line-height: var(--gmkb-line-height-heading, 1.2);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}

.topics-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--gmkb-spacing-lg, 1.5rem);
}

.topic-card {
  background: var(--gmkb-color-surface, #fff);
  padding: var(--gmkb-spacing-lg, 1.5rem);
  border-radius: var(--gmkb-border-radius, 8px);
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0,0,0,0.1));
  transition: var(--gmkb-transition, all 0.3s ease);
}

.topic-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0,0,0,0.1));
}

.topic-icon {
  color: var(--gmkb-color-primary, #007cba);
  font-size: var(--gmkb-font-size-2xl, 2rem);
  margin-bottom: var(--gmkb-space-2, 0.5rem);
}

.topic-name {
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  font-weight: var(--gmkb-font-weight-bold, 600);
  line-height: var(--gmkb-line-height-heading, 1.2);
  margin-bottom: var(--gmkb-space-2, 0.5rem);
}

.topic-description {
  color: var(--gmkb-color-text-light, #666);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
}

@media (max-width: 768px) {
  .topics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
