<template>
  <div class="gmkb-stats-component" :data-component-id="componentId">
    <div class="stats-container">
      <h2 v-if="title" class="stats-title">{{ title }}</h2>
      <p v-if="description" class="stats-description">{{ description }}</p>
      
      <div class="stats-grid">
        <div
          v-for="(stat, index) in displayStats"
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
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

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
  setup(props) {
    // Store and composables
    const store = useMediaKitStore();
    const { stats: podsStats } = usePodsData();
    
    // Computed properties
    const title = computed(() => {
      return props.data.title || 'By The Numbers';
    });
    
    const description = computed(() => {
      return props.data.description || '';
    });
    
    const displayStats = computed(() => {
      // Handle array format
      if (Array.isArray(props.data.stats)) {
        return props.data.stats;
      }
      
      // Build from individual stat fields
      const statsList = [];
      for (let i = 1; i <= 4; i++) {
        if (props.data[`stat_${i}_value`] && props.data[`stat_${i}_label`]) {
          statsList.push({
            value: props.data[`stat_${i}_value`],
            label: props.data[`stat_${i}_label`],
            description: props.data[`stat_${i}_description`] || ''
          });
        }
      }
      
      // ROOT FIX: Use Pods stats as fallback if no component data
      if (statsList.length === 0 && podsStats.value) {
        // Add Pods-based stats
        if (podsStats.value.downloads) {
          statsList.push({
            value: podsStats.value.downloads,
            label: 'Downloads',
            description: 'Total podcast downloads'
          });
        }
        if (podsStats.value.episodes) {
          statsList.push({
            value: podsStats.value.episodes,
            label: 'Episodes',
            description: 'Podcast episodes recorded'
          });
        }
        if (podsStats.value.followers) {
          statsList.push({
            value: podsStats.value.followers,
            label: 'Followers',
            description: 'Social media followers'
          });
        }
        if (podsStats.value.subscribers) {
          statsList.push({
            value: podsStats.value.subscribers,
            label: 'Subscribers',
            description: 'Email list subscribers'
          });
        }
      }
      
      return statsList.length ? statsList : [];
    });
    
    // Lifecycle
    onMounted(() => {
      // ROOT FIX: No polling or global checking - use event-driven approach
      if (store.components[props.componentId]) {
        console.log('Stats component mounted:', props.componentId);
        
        // Check if using Pods data
        const usingPodsData = displayStats.value.some(stat => 
          podsStats.value && Object.values(podsStats.value).includes(stat.value)
        );
        
        // Dispatch mount event
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'stats',
            id: props.componentId,
            podsDataUsed: usingPodsData
          }
        }));
      }
    });
    
    return {
      title,
      description,
      displayStats
    };
  }
};
</script>

<style scoped>
.gmkb-stats-component {
  padding: var(--gmkb-spacing-2xl, 3rem) var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-background, #f8f9fa);
}

.stats-container {
  max-width: var(--gmkb-container-max-width, 1200px);
  margin: 0 auto;
}

.stats-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-2xl, 2rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  line-height: var(--gmkb-line-height-heading, 1.2);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}

.stats-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin-bottom: var(--gmkb-spacing-2xl, 3rem);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--gmkb-spacing-xl, 2rem);
}

.stat-card {
  text-align: center;
  padding: var(--gmkb-spacing-xl, 2rem) var(--gmkb-spacing-md, 1rem);
  background: var(--gmkb-color-surface, #fff);
  border-radius: var(--gmkb-border-radius, 8px);
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0,0,0,0.05));
  transition: var(--gmkb-transition, all 0.3s ease);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0,0,0,0.1));
}

.stat-value {
  color: var(--gmkb-color-primary, #007cba);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-3xl, 3rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  margin-bottom: var(--gmkb-spacing-sm, 0.5rem);
  line-height: 1;
}

.stat-label {
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  font-weight: var(--gmkb-font-weight-semibold, 600);
  margin-bottom: var(--gmkb-spacing-sm, 0.5rem);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-description {
  color: var(--gmkb-color-text-light, #666);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-sm, 0.9rem);
  line-height: var(--gmkb-line-height-base, 1.6);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .stat-value {
    font-size: var(--gmkb-font-size-2xl, 2.5rem);
  }
}
</style>
