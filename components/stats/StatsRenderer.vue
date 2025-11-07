<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--stats" :data-component-id="componentId">
    <div class="component-root stats-content">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    <div class="stats-container">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="stat-item"
      >
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'StatsRenderer',
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
      return props.data?.title || 'By The Numbers';
    });
    
    // STATS: Priority is component data > Pods fallback > empty array
    const stats = computed(() => {
      // Priority 1: Component data (user customization)
      if (props.data?.stats && Array.isArray(props.data.stats)) {
        return props.data.stats;
      }
      
      // Priority 2: Pods data (from database)
      // Extract stats from Pods stats object
      if (podsData.stats?.value) {
        const statsData = podsData.stats.value;
        const statsArray = [];
        
        // Common stat fields to extract
        const statFields = [
          { key: 'years_experience', label: 'Years Experience' },
          { key: 'presentations', label: 'Presentations' },
          { key: 'audiences', label: 'Audience Members' },
          { key: 'events', label: 'Events' },
          { key: 'countries', label: 'Countries' },
          { key: 'episodes', label: 'Podcast Episodes' },
          { key: 'downloads', label: 'Downloads' }
        ];
        
        // Extract each stat from Pods
        statFields.forEach(({ key, label }) => {
          if (statsData[key]) {
            statsArray.push({
              value: statsData[key],
              label: label
            });
          }
        });
        
        if (statsArray.length > 0) {
          return statsArray;
        }
      }
      
      // Priority 3: Empty array (will show no stats)
      return [];
    });
    
    return {
      title,
      stats
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles
   All styling comes from design-system/components.css:
   - .gmkb-component (base component wrapper)
   - .gmkb-component--stats (stats-specific styles)
   - .stats-container, .stat-item, .stat-value, .stat-label
*/
</style>
