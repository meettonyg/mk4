<template>
  <div class="dynamic-tool-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="dynamic-tool-page__loading">
      <div class="dynamic-tool-page__spinner"></div>
      <p>Loading tool...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="dynamic-tool-page__error gmkb-generator-root">
      <div class="dynamic-tool-page__error-content">
        <h1>Tool Not Found</h1>
        <p>{{ error }}</p>
        <a :href="directoryUrl" class="generator__button generator__button--primary">
          Browse All Tools
        </a>
      </div>
    </div>

    <!-- Tool with Standalone Layout -->
    <component
      v-else-if="toolConfig && toolConfig.hasStandaloneLayout"
      :is="toolComponent"
      mode="standalone"
      v-bind="toolProps"
    />

    <!-- Tool with Generic Layout (fallback for tools not yet updated) -->
    <GeneratorLayout
      v-else-if="toolConfig"
      :title="toolConfig.title"
      :subtitle="toolConfig.subtitle"
      :intro-text="toolConfig.introText"
      :generator-type="toolConfig.slug"
      :has-results="false"
    >
      <template #left>
        <component
          :is="toolComponent"
          mode="standalone"
          v-bind="toolProps"
        />
      </template>

      <template #right>
        <GuidancePanel
          v-if="toolConfig.guidance"
          :title="toolConfig.guidance.title"
          :subtitle="toolConfig.guidance.subtitle"
          :formula="toolConfig.guidance.formula"
          :process-steps="toolConfig.guidance.processSteps || []"
          :examples="toolConfig.guidance.examples || []"
        />
        <div v-else class="dynamic-tool-page__placeholder-guidance">
          <h2>{{ toolConfig.name }}</h2>
          <p>{{ toolConfig.description }}</p>
        </div>
      </template>
    </GeneratorLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent, shallowRef } from 'vue';
import { getToolBySlug } from './toolRegistry';
import { GeneratorLayout, GuidancePanel } from './_shared';

const props = defineProps({
  /**
   * Tool slug (e.g., 'biography', 'topics')
   * Can be passed as prop or detected from URL
   */
  toolSlug: {
    type: String,
    default: ''
  },

  /**
   * Base URL for directory page
   */
  directoryUrl: {
    type: String,
    default: '/tools/'
  },

  /**
   * Additional props to pass to the tool component
   */
  toolProps: {
    type: Object,
    default: () => ({})
  }
});

// State
const isLoading = ref(true);
const error = ref(null);
const toolComponent = shallowRef(null);

/**
 * Determine the tool slug from props or URL
 */
const resolvedSlug = computed(() => {
  if (props.toolSlug) {
    return props.toolSlug;
  }

  // Extract from URL path: /tools/biography/ -> biography
  const path = window.location.pathname;
  const match = path.match(/\/tools\/([^/]+)\/?/);
  return match ? match[1] : null;
});

/**
 * Get tool configuration from registry
 */
const toolConfig = computed(() => {
  if (!resolvedSlug.value) return null;
  return getToolBySlug(resolvedSlug.value);
});

/**
 * Dynamic component imports map
 * Maps component names to their import functions
 */
const componentImports = {
  BiographyGenerator: () => import('../ai/BiographyGenerator.vue'),
  TopicsGenerator: () => import('../ai/TopicsGenerator.vue'),
  QuestionsGenerator: () => import('../ai/QuestionsGenerator.vue'),
  TaglineGenerator: () => import('../ai/TaglineGenerator.vue'),
  GuestIntroGenerator: () => import('../ai/GuestIntroGenerator.vue'),
  OffersGenerator: () => import('../ai/OffersGenerator.vue'),
  ElevatorPitchGenerator: () => import('../ai/ElevatorPitchGenerator.vue'),
  SoundBiteGenerator: () => import('../ai/SoundBiteGenerator.vue'),
  PersonaGenerator: () => import('../ai/PersonaGenerator.vue'),
  ImpactIntroBuilder: () => import('../ai/ImpactIntroBuilder.vue'),
  AuthorityHookBuilder: () => import('../ai/AuthorityHookBuilder.vue'),
  BrandStoryGenerator: () => import('../ai/BrandStoryGenerator.vue'),
  SignatureStoryGenerator: () => import('../ai/SignatureStoryGenerator.vue'),
  CredibilityStoryGenerator: () => import('../ai/CredibilityStoryGenerator.vue'),
  FrameworkGenerator: () => import('../ai/FrameworkGenerator.vue'),
  InterviewPrepGenerator: () => import('../ai/InterviewPrepGenerator.vue'),
  BlogGenerator: () => import('../ai/BlogGenerator.vue'),
  ContentRepurposerGenerator: () => import('../ai/ContentRepurposerGenerator.vue'),
  PressReleaseGenerator: () => import('../ai/PressReleaseGenerator.vue'),
  SocialPostGenerator: () => import('../ai/SocialPostGenerator.vue'),
  EmailWriterGenerator: () => import('../ai/EmailWriterGenerator.vue'),
  NewsletterGenerator: () => import('../ai/NewsletterGenerator.vue'),
  YoutubeDescriptionGenerator: () => import('../ai/YoutubeDescriptionGenerator.vue'),
  PodcastNotesGenerator: () => import('../ai/PodcastNotesGenerator.vue'),
  SeoOptimizerGenerator: () => import('../ai/SeoOptimizerGenerator.vue')
};

/**
 * Load the tool component dynamically
 */
const loadToolComponent = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    if (!resolvedSlug.value) {
      throw new Error('No tool specified. Please select a tool from the directory.');
    }

    if (!toolConfig.value) {
      throw new Error(`Tool "${resolvedSlug.value}" not found. It may not exist or has been removed.`);
    }

    const componentName = toolConfig.value.component;
    const importFn = componentImports[componentName];

    if (!importFn) {
      throw new Error(`Component "${componentName}" is not yet implemented.`);
    }

    // Load the component
    const module = await importFn();
    toolComponent.value = module.default;

  } catch (err) {
    console.error('[DynamicToolPage] Failed to load tool:', err);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

// Load on mount
onMounted(() => {
  loadToolComponent();
});
</script>

<style scoped>
.dynamic-tool-page {
  min-height: 100vh;
}

/* Loading State */
.dynamic-tool-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.dynamic-tool-page__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--mkcg-border-light, #e9ecef);
  border-top-color: var(--mkcg-primary, #1a9bdc);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--mkcg-space-md, 20px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.dynamic-tool-page__error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--mkcg-space-xl, 40px);
}

.dynamic-tool-page__error-content {
  text-align: center;
  max-width: 400px;
}

.dynamic-tool-page__error-content h1 {
  font-size: var(--mkcg-font-size-xl, 24px);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
}

.dynamic-tool-page__error-content p {
  color: var(--mkcg-text-secondary, #5a6d7e);
  margin: 0 0 var(--mkcg-space-lg, 30px) 0;
}

/* Placeholder Guidance */
.dynamic-tool-page__placeholder-guidance {
  padding: var(--mkcg-space-md, 20px);
}

.dynamic-tool-page__placeholder-guidance h2 {
  font-size: var(--mkcg-font-size-xl, 24px);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
}

.dynamic-tool-page__placeholder-guidance p {
  color: var(--mkcg-text-secondary, #5a6d7e);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}
</style>
