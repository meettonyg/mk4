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
});

const emit = defineEmits(['generated', 'applied', 'activate']);

/**
 * Map of component names to async component loaders
 * Loads Generator.vue from the /tools/ directory structure
 * (Generator.vue has the full form, Widget.vue is the compact version)
 */
const componentLoaders = {
  TopicsGenerator: () => import('../../../../tools/topics/Generator.vue'),
  BiographyGenerator: () => import('../../../../tools/biography/Generator.vue'),
  QuestionsGenerator: () => import('../../../../tools/questions/Generator.vue'),
  TaglineGenerator: () => import('../../../../tools/tagline/Generator.vue'),
  GuestIntroGenerator: () => import('../../../../tools/guest-intro/Generator.vue'),
  AuthorityHookBuilder: () => import('../../../../tools/authority-hook/Generator.vue'),
  OffersGenerator: () => import('../../../../tools/offers/Generator.vue'),
  ElevatorPitchGenerator: () => import('../../../../tools/elevator-pitch/Generator.vue'),
  SoundBiteGenerator: () => import('../../../../tools/sound-bite/Generator.vue'),
  PersonaGenerator: () => import('../../../../tools/persona/Generator.vue'),
  ImpactIntroBuilder: () => import('../../../../tools/impact-intro/Generator.vue'),
  BrandStoryGenerator: () => import('../../../../tools/brand-story/Generator.vue'),
  SignatureStoryGenerator: () => import('../../../../tools/signature-story/Generator.vue'),
  CredibilityStoryGenerator: () => import('../../../../tools/credibility-story/Generator.vue'),
  FrameworkGenerator: () => import('../../../../tools/framework/Generator.vue'),
  InterviewPrepGenerator: () => import('../../../../tools/interview-prep/Generator.vue'),
  BlogGenerator: () => import('../../../../tools/blog/Generator.vue'),
  ContentRepurposerGenerator: () => import('../../../../tools/content-repurpose/Generator.vue'),
  PressReleaseGenerator: () => import('../../../../tools/press-release/Generator.vue'),
  SocialPostGenerator: () => import('../../../../tools/social-post/Generator.vue'),
  EmailWriterGenerator: () => import('../../../../tools/email/Generator.vue'),
  NewsletterGenerator: () => import('../../../../tools/newsletter/Generator.vue'),
  YoutubeDescriptionGenerator: () => import('../../../../tools/youtube-description/Generator.vue'),
  PodcastNotesGenerator: () => import('../../../../tools/podcast-notes/Generator.vue'),
  SeoOptimizerGenerator: () => import('../../../../tools/seo-optimizer/Generator.vue'),
};

/**
 * Resolved tool component
 */
const toolComponent = shallowRef(null);

/**
 * Load the tool component on mount
 */
onMounted(async () => {
  const componentName = props.tool.componentName;

  if (componentLoaders[componentName]) {
    try {
      toolComponent.value = defineAsyncComponent(componentLoaders[componentName]);
    } catch (error) {
      console.error(`[ToolPreview] Failed to load component: ${componentName}`, error);
    }
  } else {
    console.warn(`[ToolPreview] Unknown component: ${componentName}`);
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
