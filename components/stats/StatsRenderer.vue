<template>
  <!-- ROOT FIX: Use design system classes -->
  <div
    class="gmkb-component gmkb-component--stats"
    :class="[`style-${displayStyle}`]"
    :data-component-id="componentId"
  >
    <div class="component-root stats-content">
      <h2 v-if="title" class="section-title">{{ title }}</h2>
      <p v-if="description" class="section-description">{{ description }}</p>
      <div class="stats-container" :style="gridStyle">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="stat-item"
        >
          <span v-if="showIcons && stat.icon" class="stat-icon">{{ stat.icon }}</span>
          <div class="stat-value">
            <span v-if="stat.prefix" class="stat-prefix">{{ stat.prefix }}</span>
            {{ stat.value }}
            <span v-if="stat.suffix" class="stat-suffix">{{ stat.suffix }}</span>
          </div>
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
    const description = computed(() => props.data?.description || props.props?.description || '');

    // Stats from component data
    const stats = computed(() => {
      if (props.data?.stats && Array.isArray(props.data.stats)) {
        return props.data.stats;
      }
      return [];
    });

    // Display options from editor
    const columns = computed(() => parseInt(props.data?.columns) || 4);
    const displayStyle = computed(() => props.data?.style || 'default');
    const showIcons = computed(() => props.data?.showIcons !== false);

    // Dynamic grid style based on columns
    const gridStyle = computed(() => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
      gap: '24px'
    }));

    return {
      title,
      description,
      stats,
      columns,
      displayStyle,
      showIcons,
      gridStyle
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
