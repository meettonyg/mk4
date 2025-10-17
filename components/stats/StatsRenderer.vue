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
export default {
  name: 'StatsRenderer',
  props: {
    componentId: String,
    // ROOT FIX: Standardized prop names (data contract)
    title: {
      type: String,
      default: 'By The Numbers'
    },
    stats: {
      type: Array,
      default: () => []
    }
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
