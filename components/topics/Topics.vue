<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root topics-component"
  >
    <h2 v-if="title" class="topics-title">{{ title }}</h2>
    <p v-if="description" class="topics-description">{{ description }}</p>
    
    <div class="topics-grid" :class="`grid-${columns || 3}`">
      <div 
        v-for="(topic, index) in displayTopics" 
        :key="index"
        class="topic-card"
      >
        <div v-if="showIcons && topic.icon" class="topic-icon">
          <i :class="topic.icon"></i>
        </div>
        <h3 class="topic-name">{{ topic.name || topic.text || topic }}</h3>
        <p v-if="topic.description" class="topic-description">
          {{ topic.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
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
const { topics: podsTopics } = usePodsData();

// Extract data from both data and props for compatibility
const title = computed(() => props.data?.title || props.props?.title || 'Speaking Topics');
const description = computed(() => props.data?.description || props.props?.description || '');
const columns = computed(() => props.data?.columns || props.props?.columns || 3);
const showIcons = computed(() => props.data?.showIcons !== false && props.props?.showIcons !== false);

// Display topics with Pods fallback
const displayTopics = computed(() => {
  // Handle array format
  if (Array.isArray(props.data?.topics) && props.data.topics.length > 0) {
    return props.data.topics.map(topic => {
      if (typeof topic === 'string') {
        return { name: topic, description: '', icon: '' };
      }
      return topic;
    });
  }
  
  // Handle individual topic fields from component data
  const topicsList = [];
  for (let i = 1; i <= 10; i++) {
    const topicValue = props.data?.[`topic_${i}`] || props.props?.[`topic_${i}`];
    if (topicValue) {
      if (typeof topicValue === 'object') {
        topicsList.push(topicValue);
      } else {
        topicsList.push({
          name: topicValue,
          description: props.data?.[`topic_${i}_description`] || props.props?.[`topic_${i}_description`] || '',
          icon: props.data?.[`topic_${i}_icon`] || props.props?.[`topic_${i}_icon`] || ''
        });
      }
    }
  }
  
  // Use Pods topics as fallback if no component data
  if (topicsList.length === 0 && podsTopics.value && podsTopics.value.length > 0) {
    return podsTopics.value.map((topic, index) => ({
      name: topic.text || topic.name || topic,
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
  if (store.components[props.componentId]) {
    // Dispatch mount event
    document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
      detail: {
        type: 'topics',
        id: props.componentId,
        podsDataUsed: displayTopics.value.some(topic => 
          podsTopics.value?.some(podTopic => 
            (podTopic.text || podTopic.name) === topic.name
          )
        )
      }
    }));
  }
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.topics-component {
  /* Styles applied via inline styles from ComponentStyleService */
}

.topics-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-align: center;
  color: inherit;
}

.topics-description {
  text-align: center;
  color: #64748b;
  margin: 0 0 2rem 0;
}

.topics-grid {
  display: grid;
  gap: 1.5rem;
}

.topics-grid.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.topics-grid.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.topics-grid.grid-4 {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.topic-card {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.topic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.topic-icon {
  color: #3b82f6;
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.topic-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: inherit;
  text-align: center;
}

.topic-description {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  text-align: center;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .topics-grid {
    grid-template-columns: 1fr !important;
  }
  
  .topics-title {
    font-size: 1.5rem;
  }
  
  .topic-card {
    padding: 1rem;
  }
}
</style>
