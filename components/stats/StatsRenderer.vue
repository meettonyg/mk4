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
        <!-- Placeholder stats when editing with no data -->
        <template v-if="showPlaceholders">
          <div v-for="(stat, index) in placeholderStats" :key="index" class="stat-item stat-item--placeholder">
            <span class="stat-icon">{{ stat.icon }}</span>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </template>

        <!-- Actual stats when data exists -->
        <template v-else>
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
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

// Static configuration - defined outside component for performance
const STAT_FIELDS = [
  { key: 'years_experience', label: 'Years of Experience', suffix: '+' },
  { key: 'projects_completed', label: 'Projects Completed' },
  { key: 'clients_served', label: 'Clients Served' },
  { key: 'awards_won', label: 'Awards Won', icon: '🏆' },
  { key: 'books_written', label: 'Books Written', icon: '📚' },
  { key: 'speaking_engagements', label: 'Speaking Engagements', icon: '🎤' },
  { key: 'countries_visited', label: 'Countries', icon: '🌍' },
  { key: 'team_size', label: 'Team Members', icon: '👥' }
];

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
    },
    isBuilderMode: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // Data from component JSON state (single source of truth)
    const title = computed(() => props.data?.title || props.props?.title || 'By The Numbers');
    const description = computed(() => props.data?.description || props.props?.description || '');

    // Stats from component data
    // ROOT FIX: Build stats array from individual fields if data.stats array not present
    const stats = computed(() => {
      // First check for pre-built stats array
      if (props.data?.stats && Array.isArray(props.data.stats) && props.data.stats.length > 0) {
        return props.data.stats;
      }

      // Build from individual stat fields (profile pre-population format)
      const builtStats = [];
      const data = props.data || props.props || {};

      STAT_FIELDS.forEach(field => {
        const value = data[field.key];
        if (value !== undefined && value !== null && value !== '') {
          builtStats.push({
            value: value,
            label: field.label,
            icon: field.icon || '',
            prefix: field.prefix || '',
            suffix: field.suffix || ''
          });
        }
      });

      return builtStats;
    });

    // Show placeholders when in builder mode with no stats configured
    const showPlaceholders = computed(() => {
      return stats.value.length === 0 && (props.isBuilderMode || props.isEditing || props.isSelected);
    });

    // Placeholder stats
    const placeholderStats = [
      { value: '10+', label: 'Years Experience', icon: '📅' },
      { value: '500+', label: 'Projects Completed', icon: '✅' },
      { value: '50+', label: 'Happy Clients', icon: '😊' },
      { value: '25', label: 'Awards Won', icon: '🏆' }
    ];

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
      gridStyle,
      showPlaceholders,
      placeholderStats
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
