<template>
  <div class="topics-component">
    <h2 v-if="showTitle" class="topics-title">{{ title }}</h2>
    <div class="topics-list">
      <div v-for="(topic, index) in topics" :key="index" class="topic-item">
        <span class="topic-number">{{ index + 1 }}</span>
        <div class="topic-content">
          <h3 class="topic-heading">{{ topic.title || topic }}</h3>
          <p v-if="topic.description" class="topic-description">{{ topic.description }}</p>
        </div>
      </div>
      <div v-if="topics.length === 0" class="no-topics">
        No topics added yet
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: String,
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
  }
});

// Computed properties
const title = computed(() => props.data.title || props.props.title || 'Speaking Topics');
const showTitle = computed(() => props.settings.showTitle ?? true);

const topics = computed(() => {
  // Try different possible data structures
  if (props.data.topics && Array.isArray(props.data.topics)) {
    return props.data.topics;
  }
  if (props.props.topics && Array.isArray(props.props.topics)) {
    return props.props.topics;
  }
  // Default topics if none provided
  return [];
});
</script>

<style scoped>
.topics-component {
  padding: 30px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.topics-title {
  color: var(--gmkb-color-heading, #e2e8f0);
  font-size: 2rem;
  margin-bottom: 25px;
  font-weight: 600;
}

.topics-list {
  space-y: 15px;
}

.topic-item {
  display: flex;
  gap: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  margin-bottom: 15px;
  transition: all 0.2s;
}

.topic-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.topic-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: var(--gmkb-color-primary, #3b82f6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.topic-content {
  flex: 1;
}

.topic-heading {
  color: var(--gmkb-color-text, #e2e8f0);
  font-size: 1.2rem;
  margin-bottom: 8px;
  font-weight: 500;
}

.topic-description {
  color: var(--gmkb-color-text-light, #94a3b8);
  line-height: 1.5;
}

.no-topics {
  text-align: center;
  padding: 40px;
  color: #64748b;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
</style>
