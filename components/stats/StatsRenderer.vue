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
    // Data from component JSON state (single source of truth)
    const title = computed(() => props.data?.title || props.props?.title || 'By The Numbers');

    // Stats from component data
    const stats = computed(() => {
      if (props.data?.stats && Array.isArray(props.data.stats)) {
        return props.data.stats;
      }

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
