<template>
  <a
    :href="toolUrl"
    class="gmkb-tool-card"
    :class="{ 'gmkb-tool-card--compact': compact }"
  >
    <div class="gmkb-tool-card__icon">
      <IconRenderer
        :name="tool.icon"
        size="lg"
        variant="outline"
      />
    </div>

    <div class="gmkb-tool-card__content">
      <h3 class="gmkb-tool-card__title">{{ tool.name }}</h3>
      <p v-if="showDescription" class="gmkb-tool-card__description">
        {{ tool.shortDescription }}
      </p>
    </div>

    <div class="gmkb-tool-card__arrow">
      <IconRenderer name="ArrowRightIcon" size="sm" variant="outline" />
    </div>
  </a>
</template>

<script setup>
import { computed } from 'vue';
import IconRenderer from '../common/IconRenderer.vue';

const props = defineProps({
  /**
   * Tool metadata object from ToolRegistry
   */
  tool: {
    type: Object,
    required: true,
  },

  /**
   * Base URL for tool links
   */
  baseUrl: {
    type: String,
    default: '/tools/',
  },

  /**
   * Show description text
   */
  showDescription: {
    type: Boolean,
    default: true,
  },

  /**
   * Compact mode (icon + title only)
   */
  compact: {
    type: Boolean,
    default: false,
  },
});

/**
 * Computed tool URL
 */
const toolUrl = computed(() => {
  const base = props.baseUrl.endsWith('/') ? props.baseUrl : `${props.baseUrl}/`;
  return `${base}${props.tool.slug}/`;
});
</script>

<style scoped>
.gmkb-tool-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: var(--gmkb-tool-card-bg, #ffffff);
  border: 1px solid var(--gmkb-tool-card-border, #e5e7eb);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.gmkb-tool-card:hover {
  border-color: var(--gmkb-primary, #6366f1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  transform: translateY(-2px);
}

.gmkb-tool-card:hover .gmkb-tool-card__arrow {
  opacity: 1;
  transform: translateX(4px);
}

.gmkb-tool-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  background: var(--gmkb-primary-light, #eef2ff);
  color: var(--gmkb-primary, #6366f1);
  border-radius: 10px;
}

.gmkb-tool-card__content {
  flex: 1;
  min-width: 0;
}

.gmkb-tool-card__title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--gmkb-text-primary, #1f2937);
  line-height: 1.4;
}

.gmkb-tool-card__description {
  margin: 0;
  font-size: 14px;
  color: var(--gmkb-text-secondary, #64748b);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gmkb-tool-card__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--gmkb-primary, #6366f1);
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 12px;
}

/* Compact mode */
.gmkb-tool-card--compact {
  padding: 16px;
  gap: 12px;
}

.gmkb-tool-card--compact .gmkb-tool-card__icon {
  width: 40px;
  height: 40px;
}

.gmkb-tool-card--compact .gmkb-tool-card__title {
  margin: 0;
}

.gmkb-tool-card--compact .gmkb-tool-card__arrow {
  margin-top: 8px;
}

/* Dark mode */
:root.dark .gmkb-tool-card,
body.dark-mode .gmkb-tool-card {
  --gmkb-tool-card-bg: #1e293b;
  --gmkb-tool-card-border: #334155;
  --gmkb-primary-light: rgba(99, 102, 241, 0.15);
  --gmkb-text-primary: #f1f5f9;
  --gmkb-text-secondary: #94a3b8;
}
</style>
