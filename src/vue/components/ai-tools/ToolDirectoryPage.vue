<template>
  <div class="tool-directory gmkb-generator-root">
    <div class="tool-directory__container">
      <!-- Header -->
      <div class="tool-directory__header">
        <h1 class="tool-directory__title">AI Content Tools</h1>
        <p class="tool-directory__subtitle">
          Generate professional content for your media kit, podcast appearances, and marketing materials.
        </p>
      </div>

      <!-- Categories -->
      <div class="tool-directory__categories">
        <div
          v-for="category in categorizedTools"
          :key="category.id"
          class="tool-directory__category"
        >
          <div class="tool-directory__category-header">
            <h2 class="tool-directory__category-title">
              <span class="tool-directory__category-icon">
                <component :is="getCategoryIcon(category.icon)" />
              </span>
              {{ category.name }}
            </h2>
            <p class="tool-directory__category-description">{{ category.description }}</p>
          </div>

          <div class="tool-directory__grid">
            <a
              v-for="tool in category.tools"
              :key="tool.id"
              :href="getToolUrl(tool.slug)"
              class="tool-card"
              :class="{ 'tool-card--featured': tool.hasStandaloneLayout }"
            >
              <div class="tool-card__icon">
                <component :is="getToolIcon(tool.icon)" />
              </div>
              <div class="tool-card__content">
                <h3 class="tool-card__title">{{ tool.name }}</h3>
                <p class="tool-card__description">{{ tool.description }}</p>
              </div>
              <div class="tool-card__arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
              <span v-if="tool.hasStandaloneLayout" class="tool-card__badge">Enhanced</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, h } from 'vue';
import { getToolsByCategory } from './toolRegistry';

const props = defineProps({
  /**
   * Base URL for tool pages
   */
  baseUrl: {
    type: String,
    default: '/tools/'
  }
});

/**
 * Get tools organized by category
 */
const categorizedTools = computed(() => {
  const grouped = getToolsByCategory();
  return Object.values(grouped).filter(cat => cat.tools.length > 0);
});

/**
 * Generate URL for a tool
 */
const getToolUrl = (slug) => {
  return `${props.baseUrl}${slug}/`;
};

/**
 * Icon components (simple SVG icons)
 */
const icons = {
  'message-square': () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
  ]),
  'target': () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('circle', { cx: 12, cy: 12, r: 10 }),
    h('circle', { cx: 12, cy: 12, r: 6 }),
    h('circle', { cx: 12, cy: 12, r: 2 })
  ]),
  'compass': () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('circle', { cx: 12, cy: 12, r: 10 }),
    h('polygon', { points: '16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76' })
  ]),
  'file-text': () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    h('polyline', { points: '14 2 14 8 20 8' }),
    h('line', { x1: 16, y1: 13, x2: 8, y2: 13 }),
    h('line', { x1: 16, y1: 17, x2: 8, y2: 17 }),
    h('polyline', { points: '10 9 9 9 8 9' })
  ]),
  'share-2': () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('circle', { cx: 18, cy: 5, r: 3 }),
    h('circle', { cx: 6, cy: 12, r: 3 }),
    h('circle', { cx: 18, cy: 19, r: 3 }),
    h('line', { x1: 8.59, y1: 13.51, x2: 15.42, y2: 17.49 }),
    h('line', { x1: 15.41, y1: 6.51, x2: 8.59, y2: 10.49 })
  ]),
  'user': () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: 12, cy: 7, r: 4 })
  ]),
  'list': () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('line', { x1: 8, y1: 6, x2: 21, y2: 6 }),
    h('line', { x1: 8, y1: 12, x2: 21, y2: 12 }),
    h('line', { x1: 8, y1: 18, x2: 21, y2: 18 }),
    h('line', { x1: 3, y1: 6, x2: 3.01, y2: 6 }),
    h('line', { x1: 3, y1: 12, x2: 3.01, y2: 12 }),
    h('line', { x1: 3, y1: 18, x2: 3.01, y2: 18 })
  ]),
  'default': () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 })
  ])
};

const getCategoryIcon = (iconName) => icons[iconName] || icons['default'];
const getToolIcon = (iconName) => icons[iconName] || icons['default'];
</script>

<style scoped>
.tool-directory {
  min-height: 100vh;
  background: var(--mkcg-bg-secondary, #f9fafb);
  padding: var(--mkcg-space-xl, 40px) var(--mkcg-space-md, 20px);
}

.tool-directory__container {
  max-width: 1200px;
  margin: 0 auto;
}

.tool-directory__header {
  text-align: center;
  margin-bottom: var(--mkcg-space-xxl, 60px);
}

.tool-directory__title {
  font-size: var(--mkcg-font-size-xxl, 32px);
  font-weight: var(--mkcg-font-weight-bold, 700);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
}

.tool-directory__subtitle {
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-secondary, #5a6d7e);
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.tool-directory__category {
  margin-bottom: var(--mkcg-space-xxl, 60px);
}

.tool-directory__category-header {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.tool-directory__category-title {
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-sm, 12px);
  font-size: var(--mkcg-font-size-xl, 24px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
}

.tool-directory__category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--mkcg-primary, #1a9bdc);
  color: white;
  border-radius: var(--mkcg-radius, 8px);
}

.tool-directory__category-description {
  color: var(--mkcg-text-secondary, #5a6d7e);
  margin: 0;
  font-size: var(--mkcg-font-size-md, 16px);
}

.tool-directory__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--mkcg-space-md, 20px);
}

/* Tool Card */
.tool-card {
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-md, 20px);
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius-lg, 12px);
  text-decoration: none;
  transition: var(--mkcg-transition-fast, 0.15s ease);
  position: relative;
}

.tool-card:hover {
  border-color: var(--mkcg-primary, #1a9bdc);
  box-shadow: var(--mkcg-shadow-md, 0 4px 8px rgba(0,0,0,0.1));
  transform: translateY(-2px);
}

.tool-card--featured {
  border-color: var(--mkcg-primary-light, #4db8e8);
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
}

.tool-card__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--mkcg-bg-tertiary, #f5f7fa);
  color: var(--mkcg-primary, #1a9bdc);
  border-radius: var(--mkcg-radius, 8px);
}

.tool-card__content {
  flex: 1;
  min-width: 0;
}

.tool-card__title {
  font-size: var(--mkcg-font-size-md, 16px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
}

.tool-card__description {
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
  margin: 0;
  line-height: var(--mkcg-line-height-normal, 1.5);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-card__arrow {
  flex-shrink: 0;
  color: var(--mkcg-text-light, #95a5a6);
  transition: var(--mkcg-transition-fast, 0.15s ease);
}

.tool-card:hover .tool-card__arrow {
  color: var(--mkcg-primary, #1a9bdc);
  transform: translateX(4px);
}

.tool-card__badge {
  position: absolute;
  top: var(--mkcg-space-xs, 8px);
  right: var(--mkcg-space-xs, 8px);
  padding: 2px 8px;
  background: var(--mkcg-primary, #1a9bdc);
  color: white;
  font-size: var(--mkcg-font-size-xs, 12px);
  font-weight: var(--mkcg-font-weight-medium, 500);
  border-radius: var(--mkcg-radius-sm, 4px);
}

@media (max-width: 768px) {
  .tool-directory__grid {
    grid-template-columns: 1fr;
  }

  .tool-card {
    flex-direction: column;
    text-align: center;
  }

  .tool-card__arrow {
    display: none;
  }
}
</style>
