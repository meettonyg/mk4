<template>
  <div class="gmkb-tool-grid">
    <!-- Category sections -->
    <section
      v-for="(category, categorySlug) in groupedTools"
      :key="categorySlug"
      class="gmkb-tool-grid__section"
    >
      <header class="gmkb-tool-grid__header">
        <h2 class="gmkb-tool-grid__category-title">{{ category.name }}</h2>
        <p v-if="showCategoryDescriptions" class="gmkb-tool-grid__category-desc">
          {{ category.description }}
        </p>
      </header>

      <div
        class="gmkb-tool-grid__cards"
        :style="{ '--columns': columns }"
      >
        <ToolCard
          v-for="tool in category.tools"
          :key="tool.slug"
          :tool="tool"
          :base-url="baseUrl"
          :show-description="showDescriptions"
          :compact="compact"
        />
      </div>
    </section>

    <!-- Empty state -->
    <div v-if="isEmpty" class="gmkb-tool-grid__empty">
      <IconRenderer name="MagnifyingGlassIcon" size="xl" variant="outline" />
      <p>No tools found.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ToolCard from './ToolCard.vue';
import IconRenderer from '../common/IconRenderer.vue';
import ToolRegistry from '../../services/ToolRegistry.js';

const props = defineProps({
  /**
   * Filter to specific category (optional)
   */
  category: {
    type: String,
    default: null,
  },

  /**
   * Base URL for tool links
   */
  baseUrl: {
    type: String,
    default: '/tools/',
  },

  /**
   * Number of columns (1-4)
   */
  columns: {
    type: Number,
    default: 3,
    validator: (v) => v >= 1 && v <= 4,
  },

  /**
   * Show tool descriptions
   */
  showDescriptions: {
    type: Boolean,
    default: true,
  },

  /**
   * Show category descriptions
   */
  showCategoryDescriptions: {
    type: Boolean,
    default: true,
  },

  /**
   * Compact mode for cards
   */
  compact: {
    type: Boolean,
    default: false,
  },
});

/**
 * Get tools grouped by category, optionally filtered
 */
const groupedTools = computed(() => {
  const allGrouped = ToolRegistry.getToolsGroupedByCategory();

  if (props.category) {
    // Filter to single category
    const filtered = {};
    if (allGrouped[props.category]) {
      filtered[props.category] = allGrouped[props.category];
    }
    return filtered;
  }

  // Filter out empty categories
  const nonEmpty = {};
  Object.entries(allGrouped).forEach(([slug, category]) => {
    if (category.tools && category.tools.length > 0) {
      nonEmpty[slug] = category;
    }
  });

  return nonEmpty;
});

/**
 * Check if grid is empty
 */
const isEmpty = computed(() => {
  return Object.keys(groupedTools.value).length === 0;
});
</script>

<style scoped>
.gmkb-tool-grid {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.gmkb-tool-grid__section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.gmkb-tool-grid__header {
  text-align: center;
}

.gmkb-tool-grid__category-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--gmkb-text-primary, #1f2937);
}

.gmkb-tool-grid__category-desc {
  margin: 0;
  font-size: 16px;
  color: var(--gmkb-text-secondary, #64748b);
}

.gmkb-tool-grid__cards {
  display: grid;
  grid-template-columns: repeat(var(--columns, 3), minmax(0, 1fr));
  gap: 20px;
}

/* Responsive columns */
@media (max-width: 1024px) {
  .gmkb-tool-grid__cards {
    grid-template-columns: repeat(min(var(--columns, 3), 2), minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .gmkb-tool-grid__cards {
    grid-template-columns: 1fr;
  }

  .gmkb-tool-grid__category-title {
    font-size: 20px;
  }
}

/* Empty state */
.gmkb-tool-grid__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px 24px;
  color: var(--gmkb-text-secondary, #64748b);
  text-align: center;
}

.gmkb-tool-grid__empty p {
  margin: 0;
  font-size: 16px;
}

/* Dark mode */
:root.dark .gmkb-tool-grid,
body.dark-mode .gmkb-tool-grid {
  --gmkb-text-primary: #f1f5f9;
  --gmkb-text-secondary: #94a3b8;
}
</style>
