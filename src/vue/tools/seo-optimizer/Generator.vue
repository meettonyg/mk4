<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="SEO Content Optimizer"
    subtitle="Optimize your content for search engines with AI-powered keyword analysis and meta tags"
    intro-text="Transform your content into search engine-friendly material with optimized keywords, meta descriptions, headers, and strategic recommendations. Our AI analyzes your content and target keywords to provide comprehensive SEO optimization strategies."
    generator-type="seo-optimizer"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Content Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Content to Optimize</h3>

        <div class="generator__field">
          <label class="generator__field-label">Your Content *</label>
          <textarea
            v-model="formData.content"
            class="generator__field-input generator__field-textarea"
            placeholder="Paste your content here (blog post, page content, product description, etc.)"
            rows="6"
          ></textarea>
          <p class="generator__field-helper">
            The content you want to optimize for search engines.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Target Keyword *</label>
          <input
            v-model="formData.targetKeyword"
            type="text"
            class="generator__field-input"
            placeholder="e.g., executive coaching services"
          />
          <p class="generator__field-helper">
            The main keyword phrase you want to rank for.
          </p>
        </div>
      </div>

      <!-- SEO Options Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">What Do You Need?</h3>

        <div class="generator__field">
          <label class="generator__field-label">Output Type</label>
          <select v-model="formData.outputType" class="generator__field-input">
            <option value="meta">Meta Title & Description</option>
            <option value="headers">Optimized Headers (H1, H2, etc.)</option>
            <option value="full">Full SEO Analysis & Suggestions</option>
            <option value="keywords">Related Keywords List</option>
          </select>
        </div>
      </div>

      <!-- Generate Button -->
      <div class="generator__actions">
        <button
          type="button"
          class="generator__button generator__button--call-to-action"
          :class="{ 'generator__button--loading': isGenerating }"
          :disabled="!canGenerate || isGenerating"
          @click="handleGenerate"
        >
          <svg v-if="!isGenerating" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {{ isGenerating ? 'Analyzing and optimizing...' : 'Optimize for SEO with AI' }}
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="generator__error">
        <p>{{ error }}</p>
        <button type="button" class="generator__button generator__button--outline" @click="handleGenerate">
          Try Again
        </button>
      </div>
    </template>

    <!-- Right Panel: Guidance -->
    <template #right>
      <GuidancePanel
        title="SEO Optimization Guide"
        subtitle="Search engine optimization helps your content get discovered by the right people at the right time."
        :formula="seoFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example SEO Strategies:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="seo-generator__results">
        <div class="seo-generator__results-header">
          <h3>Your SEO Optimization</h3>
          <p>{{ getResultDescription() }}</p>
        </div>

        <!-- Results Content -->
        <div class="seo-generator__content">
          <div v-html="formattedContent"></div>
        </div>

        <!-- Actions -->
        <div class="seo-generator__actions">
          <button
            type="button"
            class="generator__button generator__button--outline"
            @click="handleCopy"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy to Clipboard
          </button>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else
    title="SEO Content Optimizer"
    description="Optimize your content for search engines with keywords and meta descriptions."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="SEO Optimizer"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Content Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Content to Optimize</label>
        <textarea
          v-model="formData.content"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="Paste your content here (blog post, page content, etc.)"
          rows="5"
        ></textarea>
      </div>

      <!-- Target Keyword Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Target Keyword</label>
        <input
          v-model="formData.targetKeyword"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., executive coaching services"
        />
        <span class="gmkb-ai-hint">
          The main keyword phrase you want to rank for.
        </span>
      </div>

      <!-- Output Type Selector -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">What Do You Need?</label>
        <select v-model="formData.outputType" class="gmkb-ai-input gmkb-ai-select">
          <option value="meta">Meta Title & Description</option>
          <option value="headers">Optimized Headers (H1, H2, etc.)</option>
          <option value="full">Full SEO Analysis & Suggestions</option>
          <option value="keywords">Related Keywords List</option>
        </select>
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        text="Optimize for SEO"
        loading-text="Analyzing and optimizing..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <AiResultsDisplay
        v-if="generatedContent"
        :content="generatedContent"
        format="text"
      />
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useAIGenerator } from '../../../composables/useAIGenerator';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../components/ai/AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel } from '../_shared';

const props = defineProps({
  /**
   * Mode: 'integrated' or 'standalone'
   */
  mode: {
    type: String,
    default: 'standalone'
  },

  /**
   * Component ID to apply results to (integrated mode)
   */
  componentId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated']);

// Form data
const formData = reactive({
  content: '',
  targetKeyword: '',
  outputType: 'full'
});

// Use composable
const {
  isGenerating,
  generatedContent,
  error,
  usageRemaining,
  resetTime,
  hasContent,
  generate,
  copyToClipboard
} = useAIGenerator('seo_optimizer');

/**
 * SEO formula for guidance panel
 */
const seoFormula = '<span class="generator__highlight">[KEYWORDS]</span> + <span class="generator__highlight">[META TAGS]</span> + <span class="generator__highlight">[CONTENT OPTIMIZATION]</span> = SEO-Optimized Page';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why SEO Matters',
    description: 'Search engine optimization is how potential customers discover your content online. Good SEO means your content appears in search results when people are actively looking for solutions you provide. It\'s the difference between being found by thousands of qualified prospects or being invisible online.'
  },
  {
    title: 'What Search Engines Look For',
    description: 'Search engines analyze keyword relevance, content quality, meta descriptions, header structure, and user engagement signals. They want to show users the most helpful, authoritative, and well-organized content. Your optimization should focus on both technical SEO elements and genuine value for readers.'
  },
  {
    title: 'How to Rank Higher',
    description: 'Use your target keyword naturally throughout your content, especially in titles and headers. Write compelling meta descriptions that improve click-through rates. Structure content with clear H1, H2, and H3 tags. Include related keywords and semantic variations. Focus on solving user problems with high-quality, comprehensive content.'
  }
];

/**
 * Example SEO strategies for guidance panel
 */
const examples = [
  {
    title: 'Keyword-Rich Meta Tags:',
    description: 'Title: "Executive Coaching Services | Transform Your Leadership in 90 Days" | Meta: "Discover proven executive coaching services that help C-suite leaders achieve clarity, confidence, and results. Schedule your free consultation today."'
  },
  {
    title: 'Header Optimization Strategy:',
    description: 'H1: "Executive Coaching Services for Transformational Leaders" | H2: "Why Choose Our Executive Coaching Program" | H2: "Results Our Clients Achieve" | H3: "Increased Leadership Effectiveness" | H3: "Better Work-Life Balance"'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return formData.content.trim().length > 0 && formData.targetKeyword.trim().length > 0;
});

/**
 * Formatted content for display (standalone mode)
 */
const formattedContent = computed(() => {
  if (!generatedContent.value) return '';

  // Convert markdown-style formatting to HTML
  let html = generatedContent.value;

  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert line breaks to paragraphs
  html = html.split('\n\n').map(para => {
    if (!para.startsWith('<h') && para.trim()) {
      return `<p>${para}</p>`;
    }
    return para;
  }).join('\n');

  return html;
});

/**
 * Get result description based on output type
 */
const getResultDescription = () => {
  const descriptions = {
    meta: 'Optimized meta title and description for search engines',
    headers: 'SEO-optimized header structure for your content',
    full: 'Comprehensive SEO analysis and optimization recommendations',
    keywords: 'Related keywords to improve your content coverage'
  };
  return descriptions[formData.outputType] || 'Your SEO optimization results';
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    const params = {
      content: formData.content,
      targetKeyword: formData.targetKeyword,
      outputType: formData.outputType
    };

    await generate(params, context);

    emit('generated', {
      content: generatedContent.value,
      outputType: formData.outputType
    });
  } catch (err) {
    console.error('[SeoOptimizerGenerator] Generation failed:', err);
  }
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  await copyToClipboard();
};

/**
 * Handle apply (integrated mode)
 */
const handleApply = () => {
  emit('applied', {
    componentId: props.componentId,
    content: generatedContent.value,
    outputType: formData.outputType
  });
};
</script>

<style scoped>
/* Standalone Mode Styles */
.generator__section {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.generator__section-title {
  font-size: var(--mkcg-font-size-lg, 18px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
}

.generator__actions {
  margin-top: var(--mkcg-space-lg, 30px);
  text-align: center;
}

.generator__error {
  margin-top: var(--mkcg-space-md, 20px);
  padding: var(--mkcg-space-md, 20px);
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--mkcg-radius, 8px);
  text-align: center;
}

.generator__error p {
  color: #991b1b;
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
}

/* SEO Results */
.seo-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.seo-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.seo-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.seo-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.seo-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.seo-generator__content :deep(h1) {
  font-size: var(--mkcg-font-size-xl, 24px);
  font-weight: var(--mkcg-font-weight-bold, 700);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
}

.seo-generator__content :deep(h2) {
  font-size: var(--mkcg-font-size-lg, 18px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: var(--mkcg-space-md, 20px) 0 var(--mkcg-space-sm, 12px) 0;
}

.seo-generator__content :deep(h3) {
  font-size: var(--mkcg-font-size-md, 16px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: var(--mkcg-space-sm, 12px) 0 var(--mkcg-space-xs, 8px) 0;
}

.seo-generator__content :deep(p) {
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
  color: var(--mkcg-text-primary, #2c3e50);
}

.seo-generator__content :deep(strong) {
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-primary, #1a9bdc);
}

.seo-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles */
.gmkb-ai-select {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: var(--gmkb-ai-radius-md, 8px);
  background: var(--gmkb-ai-bg, #fff);
  cursor: pointer;
  font-family: inherit;
}

.gmkb-ai-select:focus {
  outline: none;
  border-color: var(--gmkb-ai-primary, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
</style>
