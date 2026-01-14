<template>
  <div class="gmkb-tool-preview" :class="{ 'gmkb-tool-preview--interactive': interactive }">
    <!-- Preview header with tool name -->
    <div v-if="showHeader" class="gmkb-tool-preview__header">
      <div class="gmkb-tool-preview__icon">
        <IconRenderer :name="tool.icon" size="md" variant="outline" />
      </div>
      <span class="gmkb-tool-preview__name">{{ tool.name }}</span>
    </div>

    <!-- Tool component container -->
    <div class="gmkb-tool-preview__container">
      <component
        v-if="toolComponent"
        :is="toolComponent"
        mode="standalone"
        :preview-mode="!interactive"
        @generated="handleGenerated"
        @applied="handleApplied"
      />
      <div v-else class="gmkb-tool-preview__loading">
        <IconRenderer name="ArrowPathIcon" size="lg" variant="outline" class="gmkb-tool-preview__spinner" />
        <span>Loading tool...</span>
      </div>
    </div>

    <!-- Interactive overlay (when not interactive) -->
    <div
      v-if="!interactive && showOverlay"
      class="gmkb-tool-preview__overlay"
      @click="$emit('activate')"
    >
      <button type="button" class="gmkb-tool-preview__cta">
        <IconRenderer name="PlayIcon" size="md" variant="solid" />
        <span>Try {{ tool.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, shallowRef, defineAsyncComponent } from 'vue';
import IconRenderer from '../common/IconRenderer.vue';
import { toolModules, resolveSlug } from '../../../../tools';

const props = defineProps({
  /**
   * Tool metadata object (from ToolRegistry or meta.json)
   */
  tool: {
    type: Object,
    required: true,
  },

  /**
   * Whether the tool is interactive (can be used)
   */
  interactive: {
    type: Boolean,
    default: true,
  },

  /**
   * Show header with tool name
   */
  showHeader: {
    type: Boolean,
    default: false,
  },

  /**
   * Show activation overlay when not interactive
   */
  showOverlay: {
    type: Boolean,
    default: true,
  },

  /**
   * Prefer Generator component over Widget when available
   * Generator provides the full-featured form, Widget is simplified
   */
  preferGenerator: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['generated', 'applied', 'activate']);

/**
 * Resolved tool component
 */
const toolComponent = shallowRef(null);

/**
 * Get the tool slug from metadata
 * Handles both direct slug and componentName-based lookup
 */
function getToolSlug() {
  // If tool has a direct slug property, use it
  if (props.tool.slug) {
    return resolveSlug(props.tool.slug);
  }

  // Fall back to deriving from componentName if available
  // e.g., "GuestIntroGenerator" -> "guest-intro"
  if (props.tool.componentName) {
    const name = props.tool.componentName
      .replace(/Generator$|Builder$/, '')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
    return resolveSlug(name);
  }

  return null;
}

/**
 * Load the tool component on mount
 * Dynamically loads from the tool's module - prefers Generator, falls back to Widget
 */
onMounted(async () => {
  const slug = getToolSlug();

  if (!slug) {
    console.warn('[ToolPreview] Could not determine tool slug from:', props.tool);
    return;
  }

  const toolModule = toolModules[slug];

  if (!toolModule) {
    console.warn(`[ToolPreview] Unknown tool module: ${slug}`);
    return;
  }

  try {
    // Prefer Generator component if available and preferGenerator is true
    // Otherwise fall back to Widget or default export
    let component = null;

    if (props.preferGenerator && toolModule.Generator) {
      component = toolModule.Generator;
    } else if (toolModule.Widget) {
      component = toolModule.Widget;
    } else if (toolModule.default) {
      component = toolModule.default;
    }

    if (component) {
      toolComponent.value = component;
    } else {
      console.warn(`[ToolPreview] No component found for: ${slug}`);
    }
  } catch (error) {
    console.error(`[ToolPreview] Failed to load component for: ${slug}`, error);
  }
});

/**
 * Handle generation events from the tool
 */
const handleGenerated = (data) => {
  emit('generated', data);
};

/**
 * Handle apply events from the tool
 */
const handleApplied = (data) => {
  emit('applied', data);
};
</script>

<style scoped>
.gmkb-tool-preview {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: var(--gmkb-bg, #ffffff);
  border: 1px solid var(--gmkb-border, #e5e7eb);
}

.gmkb-tool-preview__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--gmkb-bg-secondary, #f8fafc);
  border-bottom: 1px solid var(--gmkb-border, #e5e7eb);
}

.gmkb-tool-preview__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--gmkb-primary-light, #eef2ff);
  color: var(--gmkb-primary, #6366f1);
  border-radius: 8px;
}

.gmkb-tool-preview__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--gmkb-text-primary, #1f2937);
}

.gmkb-tool-preview__container {
  padding: 24px;
}

.gmkb-tool-preview__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 24px;
  color: var(--gmkb-text-secondary, #64748b);
}

.gmkb-tool-preview__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Non-interactive overlay */
.gmkb-tool-preview__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: background 0.2s ease;
}

.gmkb-tool-preview__overlay:hover {
  background: rgba(255, 255, 255, 0.95);
}

.gmkb-tool-preview__cta {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background: var(--gmkb-primary, #6366f1);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.gmkb-tool-preview__cta:hover {
  background: var(--gmkb-primary-dark, #4f46e5);
  transform: scale(1.02);
}

/* Interactive mode - hide overlay effects */
.gmkb-tool-preview--interactive {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Dark mode */
:root.dark .gmkb-tool-preview,
body.dark-mode .gmkb-tool-preview {
  --gmkb-bg: #1e293b;
  --gmkb-bg-secondary: #0f172a;
  --gmkb-border: #334155;
  --gmkb-text-primary: #f1f5f9;
  --gmkb-text-secondary: #94a3b8;
  --gmkb-primary-light: rgba(99, 102, 241, 0.15);
}

:root.dark .gmkb-tool-preview__overlay,
body.dark-mode .gmkb-tool-preview__overlay {
  background: rgba(15, 23, 42, 0.9);
}

:root.dark .gmkb-tool-preview__overlay:hover,
body.dark-mode .gmkb-tool-preview__overlay:hover {
  background: rgba(15, 23, 42, 0.95);
}
</style>
