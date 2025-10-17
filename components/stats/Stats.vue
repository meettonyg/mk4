<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root stats-component"
  >
    <h2 v-if="title" class="stats-title">{{ title }}</h2>
    <p v-if="description" class="stats-description">{{ description }}</p>
    
    <div class="stats-grid" :class="`grid-${columns || 4}`">
      <div
        v-for="(stat, index) in displayStats"
        :key="index"
        class="stat-card"
        :class="`style-${style}`"
      >
        <div v-if="showIcons && stat.icon" class="stat-icon">
          {{ stat.icon }}
        </div>
        <div class="stat-value">
          <span v-if="stat.prefix" class="stat-prefix">{{ stat.prefix }}</span>
          <span class="stat-number">{{ stat.value }}</span>
          <span v-if="stat.suffix" class="stat-suffix">{{ stat.suffix }}</span>
        </div>
        <div class="stat-label">{{ stat.label }}</div>
        <p v-if="stat.description" class="stat-description-text">
          {{ stat.description }}
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
const { stats: podsStats } = usePodsData();

// Extract data from both data and props for compatibility
const title = computed(() => props.data?.title || props.props?.title || 'By The Numbers');
const description = computed(() => props.data?.description || props.props?.description || '');
const columns = computed(() => props.data?.columns || props.props?.columns || 4);
const style = computed(() => props.data?.style || props.props?.style || 'default');
const showIcons = computed(() => props.data?.showIcons !== false && props.props?.showIcons !== false);

// Display stats with Pods fallback
const displayStats = computed(() => {
  // Handle array format
  if (Array.isArray(props.data?.stats) && props.data.stats.length > 0) {
    return props.data.stats;
  }
  
  // Build from individual stat fields
  const statsList = [];
  for (let i = 1; i <= 6; i++) {
    const value = props.data?.[`stat_${i}_value`] || props.props?.[`stat_${i}_value`];
    const label = props.data?.[`stat_${i}_label`] || props.props?.[`stat_${i}_label`];
    
    if (value && label) {
      statsList.push({
        value: value,
        label: label,
        description: props.data?.[`stat_${i}_description`] || props.props?.[`stat_${i}_description`] || '',
        prefix: props.data?.[`stat_${i}_prefix`] || props.props?.[`stat_${i}_prefix`] || '',
        suffix: props.data?.[`stat_${i}_suffix`] || props.props?.[`stat_${i}_suffix`] || '',
        icon: props.data?.[`stat_${i}_icon`] || props.props?.[`stat_${i}_icon`] || ''
      });
    }
  }
  
  // Use Pods stats as fallback if no component data
  if (statsList.length === 0 && podsStats.value) {
    if (podsStats.value.downloads) {
      statsList.push({
        value: podsStats.value.downloads,
        label: 'Downloads',
        description: 'Total podcast downloads',
        icon: '📥'
      });
    }
    if (podsStats.value.episodes) {
      statsList.push({
        value: podsStats.value.episodes,
        label: 'Episodes',
        description: 'Podcast episodes recorded',
        icon: '🎙️'
      });
    }
    if (podsStats.value.followers) {
      statsList.push({
        value: podsStats.value.followers,
        label: 'Followers',
        description: 'Social media followers',
        icon: '👥'
      });
    }
    if (podsStats.value.subscribers) {
      statsList.push({
        value: podsStats.value.subscribers,
        label: 'Subscribers',
        description: 'Email list subscribers',
        icon: '📧'
      });
    }
  }
  
  return statsList;
});

// Lifecycle
onMounted(() => {
  if (store.components[props.componentId]) {
    // Dispatch mount event
    document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
      detail: {
        type: 'stats',
        id: props.componentId,
        podsDataUsed: displayStats.value.some(stat => 
          podsStats.value && Object.values(podsStats.value).includes(stat.value)
        )
      }
    }));
  }
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.stats-component {
  /* Styles applied via inline styles from ComponentStyleService */
}

.stats-title {
  /* font-size and font-weight inherited from component-root */
  margin: 0 0 1rem 0;
  text-align: center;
  color: inherit;
}

.stats-description {
  text-align: center;
  opacity: 0.8; /* Use opacity instead of fixed color */
  margin: 0 0 3rem 0;
}

.stats-grid {
  display: grid;
  gap: 2rem;
}

.stats-grid.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.stats-grid.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.stats-grid.grid-4 {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.stat-card {
  text-align: center;
  padding: 2rem 1rem;
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
  border-radius: var(--component-border-radius, 8px);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Card Styles */
.stat-card.style-cards {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card.style-minimal {
  background: transparent;
  padding: 1rem;
}

.stat-card.style-bold {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card.style-bold .stat-label,
.stat-card.style-bold .stat-description-text {
  color: rgba(255, 255, 255, 0.9);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.stat-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.stat-prefix,
.stat-suffix {
  font-size: 1.5rem; /* Keep for visual hierarchy with numbers */
  /* font-weight inherited from component-root */
  color: var(--primary-color, #3b82f6);
}

.stat-card.style-bold .stat-prefix,
.stat-card.style-bold .stat-suffix {
  color: rgba(255, 255, 255, 0.9);
}

.stat-number {
  font-size: 3rem; /* Keep large for emphasis */
  /* font-weight inherited from component-root */
  color: var(--primary-color, #3b82f6);
  line-height: 1; /* Keep tight for numbers */
}

.stat-card.style-bold .stat-number {
  color: white;
}

.stat-label {
  /* font-size and font-weight inherited from component-root */
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: inherit;
}

.stat-description-text {
  /* font-size inherited from component-root */
  opacity: 0.75; /* Use opacity for hierarchy */
  margin: 0;
  /* line-height inherited from component-root */
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
    gap: 1rem;
  }
  
  .stats-title {
    font-size: 1.5rem;
  }
  
  .stat-number {
    font-size: 2.5rem;
  }
  
  .stat-card {
    padding: 1.5rem 0.75rem;
  }
}
</style>
