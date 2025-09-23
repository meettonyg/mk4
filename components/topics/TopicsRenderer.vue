<template>
  <div class="gmkb-topics-component" :data-component-id="componentId">
    <div class="topics-container">
      <h2 v-if="title" class="topics-title">{{ title }}</h2>
      <p v-if="description" class="topics-description">{{ description }}</p>
      
      <div class="topics-grid">
        <div 
          v-for="(topic, index) in topics" 
          :key="index"
          class="topic-card"
        >
          <div v-if="topic.icon" class="topic-icon">
            <i :class="topic.icon"></i>
          </div>
          <h3 class="topic-name">{{ topic.name || topic }}</h3>
          <p v-if="topic.description" class="topic-description">
            {{ topic.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
  computed: {
    title() {
      return this.data.title || 'Speaking Topics'
    },
    description() {
      return this.data.description || ''
    },
    topics() {
      // Handle various data formats
      if (Array.isArray(this.data.topics)) {
        return this.data.topics
      }
      
      // Handle individual topic fields (topic_1, topic_2, etc.)
      const topicsList = []
      for (let i = 1; i <= 5; i++) {
        if (this.data[`topic_${i}`]) {
          topicsList.push(this.data[`topic_${i}`])
        }
      }
      
      // Fallback to default topics
      return topicsList.length ? topicsList : [
        'Leadership & Innovation',
        'Digital Transformation',
        'Business Strategy'
      ]
    }
  }
}
</script>

<style scoped>
.gmkb-topics-component {
  padding: 2rem;
  background: var(--gmkb-color-background, #f8f9fa);
}

.topics-container {
  max-width: 1200px;
  margin: 0 auto;
}

.topics-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-xl, 2rem);
  margin-bottom: 1rem;
}

.topics-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  margin-bottom: 2rem;
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.topic-card {
  background: var(--gmkb-color-surface, #fff);
  padding: 1.5rem;
  border-radius: var(--gmkb-border-radius, 8px);
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0,0,0,0.1));
  transition: transform 0.3s ease;
}

.topic-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0,0,0,0.1));
}

.topic-icon {
  color: var(--gmkb-color-primary, #007cba);
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.topic-name {
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  margin-bottom: 0.5rem;
}

.topic-description {
  color: var(--gmkb-color-text-light, #666);
  line-height: var(--gmkb-line-height-base, 1.6);
}
</style>
