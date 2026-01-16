<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'default'"
    title="Blog Post Generator"
    subtitle="Create engaging blog content that showcases your expertise using AI"
    intro-text="Generate compelling blog posts that attract readers, establish your authority, and drive engagement. Input your topic, key points, and target audience to create SEO-optimized content that resonates with your readers."
    generator-type="blog"
    :has-results="hasContent"
    :is-loading="isGenerating"
    :hide-chrome="hideChrome"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Blog Content Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Blog Content</h3>

        <div class="generator__field">
          <label class="generator__field-label">Blog Topic *</label>
          <input
            v-model="topic"
            type="text"
            class="generator__field-input"
            placeholder="e.g., 5 Ways to Improve Team Communication"
          />
          <p class="generator__field-helper">
            Enter the main topic or headline for your blog post.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Key Points to Cover *</label>
          <textarea
            v-model="keyPoints"
            class="generator__field-input generator__field-textarea"
            placeholder="What main points should the blog address?"
            rows="4"
          ></textarea>
          <p class="generator__field-helper">
            List the main ideas, arguments, or sections you want to include in the blog post.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Target Audience</label>
          <input
            v-model="audience"
            type="text"
            class="generator__field-input"
            placeholder="e.g., business owners, HR managers"
          />
          <p class="generator__field-helper">
            Who is this blog post written for? (Optional but recommended)
          </p>
        </div>
      </div>

      <!-- Blog Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Blog Settings</h3>

        <div class="generator__settings-grid">
          <div class="generator__field">
            <label class="generator__field-label">Tone</label>
            <select v-model="tone" class="generator__field-input">
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="authoritative">Authoritative</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          <div class="generator__field">
            <label class="generator__field-label">Post Length</label>
            <select v-model="length" class="generator__field-input">
              <option value="short">Short (300-500 words)</option>
              <option value="medium">Medium (600-900 words)</option>
              <option value="long">Long (1000-1500 words)</option>
            </select>
          </div>
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
          {{ isGenerating ? 'Generating...' : 'Generate Blog Post with AI' }}
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
        title="Creating Engaging Blog Posts"
        subtitle="Great blog posts combine compelling hooks, valuable content, clear structure, and actionable takeaways to engage readers and drive results."
        :formula="blogFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Blog Post Structures:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="blog-generator__results">
        <div class="blog-generator__results-header">
          <h3>Your Generated Blog Post</h3>
          <p>{{ lengthDescription }}</p>
        </div>

        <!-- Blog Content -->
        <div class="blog-generator__content">
          <div v-html="formattedBlogContent"></div>
        </div>

        <!-- Actions -->
        <div class="blog-generator__actions">
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
          <button
            type="button"
            class="generator__button generator__button--outline"
            @click="handleGenerate"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Regenerate
          </button>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else-if="mode === 'integrated'"
    title="Blog Post Generator"
    description="Create engaging blog content that showcases your expertise."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Blog"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Topic Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Blog Topic</label>
        <input
          v-model="topic"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., 5 Ways to Improve Team Communication"
        />
      </div>

      <!-- Key Points Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Key Points to Cover</label>
        <textarea
          v-model="keyPoints"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What main points should the blog address?"
          rows="3"
        ></textarea>
      </div>

      <!-- Audience Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Target Audience</label>
        <input
          v-model="audience"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., business owners, HR managers"
        />
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" />

      <!-- Length Selector -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Post Length</label>
        <select v-model="length" class="gmkb-ai-input">
          <option value="short">Short (300-500 words)</option>
          <option value="medium">Medium (600-900 words)</option>
          <option value="long">Long (1000-1500 words)</option>
        </select>
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
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
        show-count
      />
    </template>
  </AiWidgetFrame>

</template>

<script setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue';
import { useAIGenerator } from '../../src/composables/useAIGenerator';
import { useGeneratorHistory } from '../../src/composables/useGeneratorHistory';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
// This provides reactive updates when profile is selected from dropdown
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

const props = defineProps({
  /**
   * Mode: 'integrated', 'standalone', or 'embedded'
   * - standalone: Full two-panel layout with guidance
   * - integrated: Compact widget for embedding in other components
   * - embedded: Landing page embed with simplified form
   */
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated'].includes(v)
  },

  /**
   * Hide hero section and profile banner (when inside EmbeddedToolWrapper)
   */
  hideChrome: {
    type: Boolean,
    default: false
  },

  /**
   * Component ID to apply results to (integrated mode)
   */
  componentId: {
    type: String,
    default: null
  },

  /**
   * Intent object for embedded mode
   * Contains: { id, label, contextHeading, contextDescription, formPlaceholders, formLabels }
   */
  intent: {
    type: Object,
    default: null
  },

  /**
   * Profile data for pre-population (embedded mode)
   * Passed from EmbeddedToolWrapper via scoped slot
   */
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated', 'change', 'preview-update', 'update:can-generate']);

// Use AI Generator composable
const {
  isGenerating,
  generatedContent,
  error,
  usageRemaining,
  resetTime,
  hasContent,
  generate,
  copyToClipboard
} = useAIGenerator('blog');

// Generator history for UX enhancement
const {
  history,
  hasHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  formatTimestamp
} = useGeneratorHistory('blog');

const showHistory = ref(false);

// Local state for form fields
const topic = ref('');
const keyPoints = ref('');
const audience = ref('');
const tone = ref('professional');
const length = ref('medium');

/**
 * Blog formula for guidance panel
 */
const blogFormula = '<span class="generator__highlight">[HOOK]</span> + <span class="generator__highlight">[VALUE]</span> + <span class="generator__highlight">[STRUCTURE]</span> + <span class="generator__highlight">[CTA]</span> = Engaging Blog Post';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Blog Content Matters',
    description: 'Blog posts are essential for establishing thought leadership, driving organic traffic, and building trust with your audience. They showcase your expertise, answer common questions, and provide value that keeps readers coming back.'
  },
  {
    title: 'What Makes Posts Shareable',
    description: 'The most shareable blog posts combine actionable insights with clear structure. They address real problems, provide specific solutions, use engaging storytelling, and include concrete examples that readers can apply immediately.'
  },
  {
    title: 'How to Optimize for SEO',
    description: 'SEO-friendly blog posts naturally incorporate relevant keywords, use clear headings and subheadings, include internal and external links, and provide comprehensive coverage of the topic. Focus on user intent and readability first, and search engines will follow.'
  }
];

/**
 * Example blog structures for guidance panel
 */
const examples = [
  {
    title: 'List-Based Structure:',
    description: '"5 Ways to [Achieve Result]" - Hook with a common problem → Introduce the solution framework → Present each strategy with examples → Conclude with implementation steps and next actions.'
  },
  {
    title: 'Problem-Solution Structure:',
    description: '"How to [Solve Problem] Without [Common Pitfall]" - Identify the pain point → Explain why traditional approaches fail → Present your proven solution → Share case studies or data → Provide actionable takeaways.'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return topic.value.trim() && keyPoints.value.trim();
});

/**
 * Form completion tracking for UX enhancement
 */
const formCompletion = computed(() => {
  const fields = [
    { name: 'Blog Topic', filled: !!topic.value.trim() },
    { name: 'Key Points', filled: !!keyPoints.value.trim() },
    { name: 'Target Audience', filled: !!audience.value.trim() }
  ];
  const filledCount = fields.filter(f => f.filled).length;
  return {
    fields,
    filledCount,
    totalCount: fields.length,
    percentage: Math.round((filledCount / fields.length) * 100),
    isComplete: canGenerate.value
  };
});

/**
 * Length description for results header
 */
const lengthDescription = computed(() => {
  const descriptions = {
    short: '300-500 words, perfect for quick reads and social sharing',
    medium: '600-900 words, ideal for comprehensive coverage',
    long: '1000-1500 words, in-depth exploration of the topic'
  };
  return descriptions[length.value] || '';
});

/**
 * Format blog content with paragraphs
 */
const formattedBlogContent = computed(() => {
  if (!generatedContent.value) return '';

  // Split content by newlines and wrap in paragraphs
  const paragraphs = generatedContent.value
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${p.trim()}</p>`)
    .join('');

  return paragraphs;
});

/**
 * Embedded mode field configuration
 * In embedded mode, we show a simplified 3-field form
 */
const embeddedFields = computed(() => {
  const defaultLabels = {
    topic: 'Blog Topic',
    keyPoints: 'Key Points to Cover',
    audience: 'Target Audience (optional)'
  };
  const defaultPlaceholders = {
    topic: 'e.g., 5 Ways to Improve Team Communication',
    keyPoints: 'What main points should the blog address?',
    audience: 'e.g., business owners, HR managers'
  };

  return [
    {
      key: 'topic',
      type: 'text',
      label: props.intent?.formLabels?.topic || defaultLabels.topic,
      placeholder: props.intent?.formPlaceholders?.topic || defaultPlaceholders.topic
    },
    {
      key: 'keyPoints',
      type: 'textarea',
      label: props.intent?.formLabels?.keyPoints || defaultLabels.keyPoints,
      placeholder: props.intent?.formPlaceholders?.keyPoints || defaultPlaceholders.keyPoints
    },
    {
      key: 'audience',
      type: 'text',
      label: props.intent?.formLabels?.audience || defaultLabels.audience,
      placeholder: props.intent?.formPlaceholders?.audience || defaultPlaceholders.audience
    }
  ];
});

/**
 * Current intent for embedded mode
 */
const currentIntent = computed(() => props.intent || null);

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const topicVal = topic.value || '[TOPIC]';
  const keyPointsVal = keyPoints.value || '[KEY POINTS]';

  if (!topic.value && !keyPoints.value) {
    return null; // Show default preview
  }

  return `Blog post about "<strong>${topicVal}</strong>" covering: <strong>${keyPointsVal}</strong>`;
});

/**
 * Check if embedded form has minimum required fields
 */
const canGenerateEmbedded = computed(() => {
  return topic.value.trim() && keyPoints.value.trim();
});

/**
 * Keyboard shortcut handler for Ctrl/Cmd + Enter
 */
const handleKeyboardShortcut = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (canGenerate.value && !isGenerating.value) {
      event.preventDefault();
      handleGenerate();
    }
  }
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      topic: topic.value,
      keyPoints: keyPoints.value,
      audience: audience.value,
      tone: tone.value,
      length: length.value
    }, context);

    emit('generated', {
      content: generatedContent.value,
      topic: topic.value,
      tone: tone.value,
      length: length.value
    });

    // Save to history on success
    if (generatedContent.value) {
      addToHistory({
        inputs: {
          topic: topic.value,
          keyPoints: keyPoints.value,
          audience: audience.value,
          tone: tone.value,
          length: length.value
        },
        results: [{ text: generatedContent.value }],
        preview: generatedContent.value.substring(0, 50) || 'Generated blog post'
      });
    }
  } catch (err) {
    console.error('[BlogGenerator] Generation failed:', err);
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
    topic: topic.value,
    length: length.value
  });
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Pre-populate fields from profile data
  if (profileData.blog_topic) topic.value = profileData.blog_topic;
  if (profileData.blog_key_points) keyPoints.value = profileData.blog_key_points;
  if (profileData.blog_audience) audience.value = profileData.blog_audience;
  if (profileData.blog_tone) tone.value = profileData.blog_tone;
  if (profileData.blog_length) length.value = profileData.blog_length;
}

// Initialize on mount
onMounted(() => {
  // Add keyboard shortcut listener
  window.addEventListener('keydown', handleKeyboardShortcut);
});

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardShortcut);
});

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

.generator__settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--mkcg-space-md, 20px);
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

/* Blog Results */
.blog-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.blog-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.blog-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.blog-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.blog-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.blog-generator__content :deep(p) {
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
  color: var(--mkcg-text-primary, #2c3e50);
}

.blog-generator__content :deep(p:last-child) {
  margin-bottom: 0;
}

.blog-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

</style>
