<template>
  <div class="gmkb-ai-results-display">
    <!-- Text Content -->
    <template v-if="format === 'text'">
      <div class="gmkb-ai-results__content">
        {{ content }}
      </div>
    </template>

    <!-- List Content -->
    <template v-else-if="format === 'list'">
      <ol v-if="numbered" class="gmkb-ai-results__list gmkb-ai-results__list--numbered">
        <li
          v-for="(item, index) in contentItems"
          :key="index"
          class="gmkb-ai-results__list-item"
          :class="{ 'gmkb-ai-results__list-item--selected': selectedIndex === index }"
          @click="$emit('select', index)"
        >
          {{ item }}
        </li>
      </ol>
      <ul v-else class="gmkb-ai-results__list">
        <li
          v-for="(item, index) in contentItems"
          :key="index"
          class="gmkb-ai-results__list-item"
          :class="{ 'gmkb-ai-results__list-item--selected': selectedIndex === index }"
          @click="$emit('select', index)"
        >
          {{ item }}
        </li>
      </ul>
    </template>

    <!-- Selectable Cards -->
    <template v-else-if="format === 'cards'">
      <div class="gmkb-ai-results__cards">
        <div
          v-for="(item, index) in contentItems"
          :key="index"
          class="gmkb-ai-results__card"
          :class="{ 'gmkb-ai-results__card--selected': selectedIndex === index }"
          @click="$emit('select', index)"
        >
          <div class="gmkb-ai-results__card-number">{{ index + 1 }}</div>
          <div class="gmkb-ai-results__card-content">{{ item }}</div>
          <div v-if="selectedIndex === index" class="gmkb-ai-results__card-check">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
      </div>
    </template>

    <!-- Word/Character Count -->
    <div v-if="showCount" class="gmkb-ai-counter">
      <span v-if="showWordCount">{{ wordCount }} words</span>
      <span v-if="showWordCount && showCharCount"> &bull; </span>
      <span v-if="showCharCount">{{ charCount }} characters</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * Content to display (string or array)
   */
  content: {
    type: [String, Array],
    required: true
  },

  /**
   * Display format: 'text', 'list', 'cards'
   */
  format: {
    type: String,
    default: 'text',
    validator: (v) => ['text', 'list', 'cards'].includes(v)
  },

  /**
   * Whether list should be numbered
   */
  numbered: {
    type: Boolean,
    default: true
  },

  /**
   * Currently selected index (for list/cards)
   */
  selectedIndex: {
    type: Number,
    default: -1
  },

  /**
   * Whether to show word/char count
   */
  showCount: {
    type: Boolean,
    default: false
  },

  /**
   * Show word count
   */
  showWordCount: {
    type: Boolean,
    default: true
  },

  /**
   * Show character count
   */
  showCharCount: {
    type: Boolean,
    default: true
  }
});

defineEmits(['select']);

/**
 * Content as array of items
 */
const contentItems = computed(() => {
  if (Array.isArray(props.content)) {
    return props.content;
  }
  // Split string by newlines for list display
  return props.content.split('\n').filter(line => line.trim());
});

/**
 * Word count of content
 */
const wordCount = computed(() => {
  const text = Array.isArray(props.content)
    ? props.content.join(' ')
    : props.content;
  return text.trim().split(/\s+/).filter(word => word).length;
});

/**
 * Character count of content
 */
const charCount = computed(() => {
  const text = Array.isArray(props.content)
    ? props.content.join(' ')
    : props.content;
  return text.length;
});
</script>

<style scoped>
.gmkb-ai-results__list--numbered {
  counter-reset: list-counter;
  list-style: none;
  padding: 0;
  margin: 0;
}

.gmkb-ai-results__list--numbered .gmkb-ai-results__list-item {
  counter-increment: list-counter;
}

.gmkb-ai-results__list--numbered .gmkb-ai-results__list-item::before {
  content: counter(list-counter) ".";
  font-weight: 600;
  color: var(--gmkb-ai-primary, #6366f1);
  margin-right: 8px;
}

.gmkb-ai-results__cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gmkb-ai-results__card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: var(--gmkb-ai-bg, #ffffff);
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: var(--gmkb-ai-radius-md, 8px);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gmkb-ai-results__card:hover {
  border-color: var(--gmkb-ai-primary, #6366f1);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.1);
}

.gmkb-ai-results__card--selected {
  border-color: var(--gmkb-ai-primary, #6366f1);
  background: rgba(99, 102, 241, 0.05);
}

.gmkb-ai-results__card-number {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--gmkb-ai-primary, #6366f1);
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
}

.gmkb-ai-results__card-content {
  flex: 1;
  font-size: 15px;
  line-height: 1.5;
  color: var(--gmkb-ai-text, #1f2937);
}

.gmkb-ai-results__card-check {
  flex-shrink: 0;
  color: var(--gmkb-ai-primary, #6366f1);
}
</style>
