<template>
  <div class="topics-component">
    <h2 class="topics-title">{{ title || 'Speaking Topics' }}</h2>
    <ul class="topics-list">
      <li v-for="(topic, index) in displayTopics" :key="index" class="topic-item">
        {{ topic }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  topics: {
    type: Array,
    default: () => []
  }
});

const displayTopics = computed(() => {
  if (props.topics.length > 0) {
    return props.topics;
  }
  // Default topics
  return [
    'Topic 1 - Add your first topic',
    'Topic 2 - Add your second topic',
    'Topic 3 - Add your third topic'
  ];
});
</script>

<style scoped>
.topics-component {
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.topics-title {
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.topics-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.topic-item {
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #f9fafb;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
  color: #374151;
  line-height: 1.5;
}

.topic-item:last-child {
  margin-bottom: 0;
}
</style>
