<template>
  <div class="ai-tool-layout" :class="layoutClasses">
    <!-- Main Container -->
    <div class="ai-tool-layout__container">
      <!-- Header (optional) -->
      <header v-if="$slots.header || title" class="ai-tool-layout__header">
        <slot name="header">
          <h1 class="ai-tool-layout__title">{{ title }}</h1>
          <p v-if="subtitle" class="ai-tool-layout__subtitle">{{ subtitle }}</p>
        </slot>
      </header>

      <!-- Two-Column Content -->
      <div class="ai-tool-layout__content">
        <!-- Left Panel: Tool/Generator -->
        <main class="ai-tool-layout__panel ai-tool-layout__panel--tool">
          <slot name="tool"></slot>
        </main>

        <!-- Right Panel: Guide/Help -->
        <aside class="ai-tool-layout__panel ai-tool-layout__panel--guide">
          <!-- Mobile Toggle Button -->
          <button
            v-if="collapsibleGuide"
            type="button"
            class="ai-tool-layout__guide-toggle"
            :aria-expanded="guideExpanded"
            @click="guideExpanded = !guideExpanded"
          >
            <span class="ai-tool-layout__guide-toggle-text">
              {{ guideExpanded ? 'Hide Guide' : 'Show Guide' }}
            </span>
            <svg
              class="ai-tool-layout__guide-toggle-icon"
              :class="{ 'ai-tool-layout__guide-toggle-icon--rotated': guideExpanded }"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <!-- Guide Content -->
          <div
            class="ai-tool-layout__guide-content"
            :class="{ 'ai-tool-layout__guide-content--collapsed': collapsibleGuide && !guideExpanded }"
          >
            <slot name="guide"></slot>
          </div>
        </aside>
      </div>

      <!-- Footer (optional) -->
      <footer v-if="$slots.footer" class="ai-tool-layout__footer">
        <slot name="footer"></slot>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  /**
   * Page title displayed in header
   */
  title: {
    type: String,
    default: ''
  },

  /**
   * Subtitle displayed below title
   */
  subtitle: {
    type: String,
    default: ''
  },

  /**
   * Whether the guide panel can be collapsed on mobile
   */
  collapsibleGuide: {
    type: Boolean,
    default: true
  },

  /**
   * Initial state of guide panel on mobile (expanded/collapsed)
   */
  guideInitiallyExpanded: {
    type: Boolean,
    default: false
  },

  /**
   * Layout variant: 'default', 'wide', 'compact'
   */
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'wide', 'compact'].includes(v)
  },

  /**
   * Column ratio: 'equal', 'tool-wide', 'guide-wide'
   */
  columnRatio: {
    type: String,
    default: 'equal',
    validator: (v) => ['equal', 'tool-wide', 'guide-wide'].includes(v)
  }
});

// Mobile guide expansion state
const guideExpanded = ref(props.guideInitiallyExpanded);

// Computed layout classes
const layoutClasses = computed(() => ({
  [`ai-tool-layout--${props.variant}`]: true,
  [`ai-tool-layout--${props.columnRatio}`]: true
}));
</script>

<style scoped>
/* ========================================
   AI TOOL LAYOUT - Two Column Grid
   ======================================== */

.ai-tool-layout {
  --aitl-max-width: 1400px;
  --aitl-spacing: 24px;
  --aitl-gap: 32px;
  --aitl-radius: 12px;
  --aitl-panel-bg: #ffffff;
  --aitl-guide-bg: #f8fafc;
  --aitl-border: #e2e8f0;
  --aitl-text: #1e293b;
  --aitl-text-secondary: #64748b;
  --aitl-primary: #6366f1;

  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--aitl-text);
  line-height: 1.6;
}

/* Container */
.ai-tool-layout__container {
  max-width: var(--aitl-max-width);
  margin: 0 auto;
  padding: var(--aitl-spacing);
}

/* Header */
.ai-tool-layout__header {
  text-align: center;
  margin-bottom: var(--aitl-gap);
}

.ai-tool-layout__title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--aitl-text);
  line-height: 1.2;
}

.ai-tool-layout__subtitle {
  margin: 0;
  font-size: 18px;
  color: var(--aitl-text-secondary);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Two-Column Content Grid */
.ai-tool-layout__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--aitl-gap);
  align-items: start;
}

/* Column Ratio Variants */
.ai-tool-layout--tool-wide .ai-tool-layout__content {
  grid-template-columns: 1.2fr 0.8fr;
}

.ai-tool-layout--guide-wide .ai-tool-layout__content {
  grid-template-columns: 0.8fr 1.2fr;
}

/* Panels */
.ai-tool-layout__panel {
  min-width: 0; /* Prevent grid blowout */
}

.ai-tool-layout__panel--tool {
  background: var(--aitl-panel-bg);
  border: 1px solid var(--aitl-border);
  border-radius: var(--aitl-radius);
  padding: var(--aitl-spacing);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ai-tool-layout__panel--guide {
  background: var(--aitl-guide-bg);
  border: 1px solid var(--aitl-border);
  border-radius: var(--aitl-radius);
  padding: var(--aitl-spacing);
  position: sticky;
  top: 24px;
}

/* Guide Toggle (Mobile) */
.ai-tool-layout__guide-toggle {
  display: none; /* Hidden on desktop */
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  color: var(--aitl-primary);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--aitl-border);
  cursor: pointer;
  align-items: center;
  justify-content: space-between;
  margin: calc(-1 * var(--aitl-spacing));
  margin-bottom: 0;
  width: calc(100% + 2 * var(--aitl-spacing));
}

.ai-tool-layout__guide-toggle-icon {
  transition: transform 0.2s ease;
}

.ai-tool-layout__guide-toggle-icon--rotated {
  transform: rotate(180deg);
}

/* Guide Content */
.ai-tool-layout__guide-content {
  /* Default: visible */
}

/* Footer */
.ai-tool-layout__footer {
  margin-top: var(--aitl-gap);
  padding-top: var(--aitl-spacing);
  border-top: 1px solid var(--aitl-border);
}

/* ========================================
   VARIANT: Wide
   ======================================== */
.ai-tool-layout--wide {
  --aitl-max-width: 1600px;
}

/* ========================================
   VARIANT: Compact
   ======================================== */
.ai-tool-layout--compact {
  --aitl-max-width: 1200px;
  --aitl-gap: 24px;
  --aitl-spacing: 20px;
}

/* ========================================
   RESPONSIVE: Tablet (< 1024px)
   ======================================== */
@media (max-width: 1024px) {
  .ai-tool-layout__content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .ai-tool-layout__panel--guide {
    position: static;
    order: 2; /* Move guide below tool */
  }

  .ai-tool-layout__guide-toggle {
    display: flex;
  }

  .ai-tool-layout__guide-content--collapsed {
    display: none;
  }

  .ai-tool-layout__guide-content:not(.ai-tool-layout__guide-content--collapsed) {
    padding-top: var(--aitl-spacing);
  }

  .ai-tool-layout__title {
    font-size: 28px;
  }

  .ai-tool-layout__subtitle {
    font-size: 16px;
  }
}

/* ========================================
   RESPONSIVE: Mobile (< 640px)
   ======================================== */
@media (max-width: 640px) {
  .ai-tool-layout {
    --aitl-spacing: 16px;
    --aitl-gap: 16px;
  }

  .ai-tool-layout__container {
    padding: 16px;
  }

  .ai-tool-layout__title {
    font-size: 24px;
  }

  .ai-tool-layout__subtitle {
    font-size: 15px;
  }

  .ai-tool-layout__panel--tool,
  .ai-tool-layout__panel--guide {
    border-radius: 8px;
  }
}

/* ========================================
   DARK MODE SUPPORT
   ======================================== */
@media (prefers-color-scheme: dark) {
  .ai-tool-layout {
    --aitl-panel-bg: #1e293b;
    --aitl-guide-bg: #0f172a;
    --aitl-border: #334155;
    --aitl-text: #f1f5f9;
    --aitl-text-secondary: #94a3b8;
  }
}

/* Explicit dark mode class (for manual toggle) */
.dark-mode .ai-tool-layout,
[data-theme="dark"] .ai-tool-layout {
  --aitl-panel-bg: #1e293b;
  --aitl-guide-bg: #0f172a;
  --aitl-border: #334155;
  --aitl-text: #f1f5f9;
  --aitl-text-secondary: #94a3b8;
}
</style>
