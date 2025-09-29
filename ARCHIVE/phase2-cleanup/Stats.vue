<template>
  <div class="gmkb-stats" :class="classList">
    <div class="stats-content">
      <h2 v-if="title" class="stats-title">{{ title }}</h2>
      <p v-if="description" class="stats-description">{{ description }}</p>
      
      <div class="stats-grid" :class="`stats-grid--${layout}`">
        <div
          v-for="(stat, index) in stats"
          :key="`stat-${index}`"
          class="stat-item"
        >
          <div class="stat-value" :class="{ 'stat-value--animated': animated }">
            <span v-if="stat.prefix" class="stat-prefix">{{ stat.prefix }}</span>
            <span class="stat-number">{{ formatNumber(stat.value) }}</span>
            <span v-if="stat.suffix" class="stat-suffix">{{ stat.suffix }}</span>
          </div>
          <div v-if="stat.label" class="stat-label">{{ stat.label }}</div>
          <div v-if="stat.description" class="stat-description">{{ stat.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  componentId: String,
  data: {
    type: Object,
    default: () => ({})
  },
  settings: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update', 'remove']);

const animated = ref(false);

const title = computed(() => 
  props.data?.title || 'By the Numbers'
);

const description = computed(() =>
  props.data?.description || ''
);

const layout = computed(() =>
  props.settings?.layout || 'grid'
);

// Default stats data
const defaultStats = [
  { value: 100, suffix: '+', label: 'Podcast Appearances', description: 'Featured on top industry podcasts' },
  { value: 50, suffix: 'K', label: 'Social Followers', description: 'Engaged community across platforms' },
  { value: 15, label: 'Years Experience', description: 'Building and scaling businesses' },
  { value: 500, suffix: '+', label: 'Speaking Events', description: 'Conferences and workshops delivered' }
];

const stats = computed(() => {
  if (props.data?.stats && Array.isArray(props.data.stats)) {
    return props.data.stats;
  }
  return defaultStats;
});

const formatNumber = (value) => {
  if (typeof value !== 'number') return value;
  
  // Format large numbers with commas
  if (value >= 1000) {
    return value.toLocaleString();
  }
  return value.toString();
};

const classList = computed(() => ({
  'stats--centered': props.settings?.alignment === 'center',
  'stats--dark': props.settings?.variant === 'dark',
  'stats--minimal': props.settings?.style === 'minimal',
  'stats--bordered': props.settings?.style === 'bordered'
}));

onMounted(() => {
  // Add a small delay for animation effect
  setTimeout(() => {
    animated.value = true;
  }, 100);
});
</script>

<style scoped>
.gmkb-stats {
  padding: var(--spacing-xl, 3rem);
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-md, 8px);
}

.stats-content {
  max-width: var(--max-width, 1200px);
  margin: 0 auto;
}

.stats-title {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 700;
  color: var(--color-text, #1a1a1a);
  margin: 0 0 0.5rem;
}

.stats-description {
  font-size: 1.125rem;
  color: var(--color-text-light, #666666);
  margin: 0 0 2.5rem;
  line-height: 1.6;
}

.stats-grid {
  display: grid;
  gap: 2rem;
}

.stats-grid--grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.stats-grid--row {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.stats-grid--column {
  grid-template-columns: 1fr;
  max-width: 400px;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: var(--color-surface-light, transparent);
  border-radius: var(--radius-sm, 6px);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-number {
  font-size: clamp(2rem, 4vw, 3rem);
  color: var(--color-primary, #3b82f6);
  transition: all 0.5s ease;
}

.stat-value--animated .stat-number {
  animation: countUp 1s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-prefix,
.stat-suffix {
  font-size: 1.5rem;
  color: var(--color-text, #1a1a1a);
}

.stat-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
  margin-bottom: 0.25rem;
}

.stat-description {
  font-size: 0.875rem;
  color: var(--color-text-light, #666666);
  line-height: 1.4;
}

/* Style variations */
.stats--minimal .stat-item {
  background: transparent;
  padding: 1rem;
}

.stats--bordered .stat-item {
  border: 2px solid var(--color-border, #e2e8f0);
  background: transparent;
}

.stats--bordered .stat-item:hover {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-surface-light, #f8f9fa);
}

/* Dark variant */
.stats--dark {
  background: var(--color-surface-dark, #1a1a1a);
}

.stats--dark .stats-title,
.stats--dark .stat-label,
.stats--dark .stat-prefix,
.stats--dark .stat-suffix {
  color: white;
}

.stats--dark .stats-description,
.stats--dark .stat-description {
  color: rgba(255, 255, 255, 0.8);
}

.stats--dark .stat-item {
  background: rgba(255, 255, 255, 0.05);
}

.stats--dark.stats--bordered .stat-item {
  border-color: rgba(255, 255, 255, 0.2);
}

/* Centered variant */
.stats--centered .stats-content {
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .gmkb-stats {
    padding: 2rem 1.5rem;
  }
  
  .stats-grid--grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
  }
  
  .stat-item {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}
</style>
