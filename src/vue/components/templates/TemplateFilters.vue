<template>
  <div class="template-filters">
    <button
      v-for="category in categories"
      :key="category.id"
      class="filter-btn"
      :class="{ active: activeCategory === category.id }"
      @click="$emit('select', category.id)"
    >
      <component :is="getIcon(category.icon)" class="filter-icon" />
      <span>{{ category.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { h } from 'vue';

defineProps({
  categories: {
    type: Array,
    required: true
  },
  activeCategory: {
    type: String,
    default: 'all'
  }
});

defineEmits(['select']);

// Icon components using render functions
const icons = {
  grid: () => h('svg', {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2
  }, [
    h('rect', { x: 3, y: 3, width: 7, height: 7 }),
    h('rect', { x: 14, y: 3, width: 7, height: 7 }),
    h('rect', { x: 14, y: 14, width: 7, height: 7 }),
    h('rect', { x: 3, y: 14, width: 7, height: 7 })
  ]),
  building: () => h('svg', {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2
  }, [
    h('rect', { x: 4, y: 2, width: 16, height: 20, rx: 2 }),
    h('path', { d: 'M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01' })
  ]),
  palette: () => h('svg', {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2
  }, [
    h('circle', { cx: 13.5, cy: 6.5, r: '.5' }),
    h('circle', { cx: 17.5, cy: 10.5, r: '.5' }),
    h('circle', { cx: 8.5, cy: 7.5, r: '.5' }),
    h('circle', { cx: 6.5, cy: 12.5, r: '.5' }),
    h('path', { d: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z' })
  ]),
  minus: () => h('svg', {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2
  }, [
    h('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
  ]),
  briefcase: () => h('svg', {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2
  }, [
    h('rect', { x: 2, y: 7, width: 20, height: 14, rx: 2 }),
    h('path', { d: 'M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16' })
  ]),
  bookmark: () => h('svg', {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2
  }, [
    h('path', { d: 'm19 21-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z' })
  ]),
  layout: () => h('svg', {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2
  }, [
    h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }),
    h('line', { x1: 3, y1: 9, x2: 21, y2: 9 }),
    h('line', { x1: 9, y1: 21, x2: 9, y2: 9 })
  ])
};

const getIcon = (iconName) => icons[iconName] || icons.grid;
</script>

<style scoped>
.template-filters {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 2rem 1rem;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.filter-btn.active {
  background: white;
  color: #1a1a2e;
  border-color: white;
}

.filter-icon {
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .template-filters {
    padding: 0.5rem 1rem 1rem;
    gap: 0.375rem;
  }

  .filter-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .filter-btn span {
    display: none;
  }

  .filter-btn.active span {
    display: inline;
  }
}
</style>
