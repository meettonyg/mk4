<template>
  <div class="gmkb-stats-component" :data-component-id="componentId">
    <div class="stats-container">
      <h2 v-if="title" class="stats-title">{{ title }}</h2>
      <p v-if="description" class="stats-description">{{ description }}</p>
      
      <div class="stats-grid">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="stat-card"
        >
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <p v-if="stat.description" class="stat-description">{{ stat.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsRenderer',
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
      return this.data.title || 'By The Numbers'
    },
    description() {
      return this.data.description || ''
    },
    stats() {
      // Handle array format
      if (Array.isArray(this.data.stats)) {
        return this.data.stats
      }
      
      // Build from individual stat fields
      const statsList = []
      for (let i = 1; i <= 4; i++) {
        if (this.data[`stat_${i}_value`] && this.data[`stat_${i}_label`]) {
          statsList.push({
            value: this.data[`stat_${i}_value`],
            label: this.data[`stat_${i}_label`],
            description: this.data[`stat_${i}_description`] || ''
          })
        }
      }
      
      return statsList.length ? statsList : this.getDefaultStats()
    }
  },
  methods: {
    getDefaultStats() {
      return [
        { value: '500+', label: 'Events', description: 'Speaking engagements delivered' },
        { value: '50K+', label: 'Audience', description: 'People reached globally' },
        { value: '15+', label: 'Years', description: 'Industry experience' },
        { value: '98%', label: 'Satisfaction', description: 'Client satisfaction rate' }
      ]
    }
  }
}
</script>

<style scoped>
.gmkb-stats-component {
  padding: 3rem 2rem;
  background: var(--gmkb-color-background, #f8f9fa);
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-xl, 2rem);
  margin-bottom: 1rem;
}

.stats-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-card {
  text-align: center;
  padding: 2rem 1rem;
}

.stat-value {
  color: var(--gmkb-color-primary, #007cba);
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-label {
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-description {
  color: var(--gmkb-color-text-light, #666);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .stat-value {
    font-size: 2.5rem;
  }
}
</style>
