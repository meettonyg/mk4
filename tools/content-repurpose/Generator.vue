<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Content Repurposer"
    subtitle="Transform existing content into new formats for different platforms using AI"
    intro-text="Maximize your content ROI by repurposing existing blog posts, articles, videos, or podcasts into multiple formats. Generate platform-optimized content that maintains your message while adapting to different audience expectations and consumption patterns."
    generator-type="content-repurposer"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Original Content Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Original Content</h3>

        <div class="generator__field">
          <label class="generator__field-label">Your Content *</label>
          <textarea
            v-model="originalContent"
            class="generator__field-input generator__field-textarea"
            placeholder="Paste your original content here (blog post, article, video transcript, podcast script, etc.)"
            rows="8"
          ></textarea>
          <p class="generator__field-helper">
            Paste the full text of your existing content. The AI will analyze and transform it.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Content Context (Optional)</label>
          <input
            v-model="contentContext"
            type="text"
            class="generator__field-input"
            placeholder="e.g., Blog post about productivity tips for remote workers"
          />
          <p class="generator__field-helper">
            Help the AI understand what your content is about for better repurposing.
          </p>
        </div>
      </div>

      <!-- Repurposing Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Repurposing Settings</h3>

        <div class="generator__settings-grid">
          <div class="generator__field">
            <label class="generator__field-label">Target Format *</label>
            <select v-model="targetFormat" class="generator__field-input">
              <option value="social_posts">Social Media Posts</option>
              <option value="email">Email Newsletter</option>
              <option value="linkedin_article">LinkedIn Article</option>
              <option value="twitter_thread">Twitter/X Thread</option>
              <option value="video_script">Video Script</option>
              <option value="podcast_outline">Podcast Outline</option>
              <option value="infographic_points">Infographic Key Points</option>
              <option value="carousel_slides">Carousel Slides</option>
            </select>
          </div>

          <div class="generator__field">
            <label class="generator__field-label">Tone</label>
            <select v-model="tone" class="generator__field-input">
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="engaging">Engaging</option>
              <option value="educational">Educational</option>
              <option value="inspirational">Inspirational</option>
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
          {{ isGenerating ? 'Transforming...' : 'Repurpose Content with AI' }}
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
        title="Maximize Your Content ROI"
        subtitle="One piece of content can become dozens of assets across multiple platforms when repurposed strategically."
        :formula="repurposingFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Repurposing Strategies:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="content-repurposer__results">
        <div class="content-repurposer__results-header">
          <h3>Your Repurposed Content</h3>
          <p>Optimized for {{ formatLabel }}</p>
        </div>

        <!-- Repurposed Content Display -->
        <div class="content-repurposer__content">
          <div v-if="Array.isArray(generatedContent)" class="content-repurposer__content-list">
            <div
              v-for="(item, index) in generatedContent"
              :key="index"
              class="content-repurposer__content-item"
            >
              <div class="content-repurposer__content-item-header">
                <span class="content-repurposer__content-item-number">{{ index + 1 }}</span>
                <span class="content-repurposer__content-item-label">{{ getItemLabel(index) }}</span>
              </div>
              <p>{{ item }}</p>
            </div>
          </div>
          <div v-else class="content-repurposer__content-text">
            <p>{{ generatedContent }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="content-repurposer__actions">
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
    v-else-if="mode === 'integrated'"
    title="Content Repurposer"
    description="Transform existing content into new formats for different platforms."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="ContentRepurposer"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Original Content Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Original Content</label>
        <textarea
          v-model="originalContent"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="Paste your original content here (blog post, article, transcript, etc.)"
          rows="5"
        ></textarea>
        <span class="gmkb-ai-hint">
          Paste the text you want to repurpose into a new format.
        </span>
      </div>

      <!-- Content Context Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Content Context (Optional)</label>
        <input
          v-model="contentContext"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Blog post about productivity tips"
        />
      </div>

      <!-- Target Format Selector -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Target Format</label>
        <select v-model="targetFormat" class="gmkb-ai-input">
          <option value="social_posts">Social Media Posts</option>
          <option value="email">Email Newsletter</option>
          <option value="linkedin_article">LinkedIn Article</option>
          <option value="twitter_thread">Twitter/X Thread</option>
          <option value="video_script">Video Script</option>
          <option value="podcast_outline">Podcast Outline</option>
          <option value="infographic_points">Infographic Key Points</option>
          <option value="carousel_slides">Carousel Slides</option>
        </select>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" />

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
        :content="formattedContent"
        format="text"
        show-count
      />
    </template>
  </AiWidgetFrame>

  <!-- Embedded Mode: Landing page form (simplified, used with EmbeddedToolWrapper) -->
  <div v-else class="gmkb-embedded-form">
    <!-- Simplified form for landing page -->
    <div class="gmkb-embedded-fields">
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">Original Content</label>
        <textarea
          v-model="originalContent"
          class="gmkb-embedded-input gmkb-embedded-textarea"
          placeholder="Paste your content here (blog post, article, transcript, etc.)"
          rows="5"
          @input="handleEmbeddedFieldChange"
        ></textarea>
      </div>

      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">Target Format</label>
        <select
          v-model="targetFormat"
          class="gmkb-embedded-input"
          @change="handleEmbeddedFieldChange"
        >
          <option value="social_posts">Social Media Posts</option>
          <option value="email">Email Newsletter</option>
          <option value="linkedin_article">LinkedIn Article</option>
          <option value="twitter_thread">Twitter/X Thread</option>
          <option value="video_script">Video Script</option>
          <option value="podcast_outline">Podcast Outline</option>
          <option value="infographic_points">Infographic Key Points</option>
          <option value="carousel_slides">Carousel Slides</option>
        </select>
      </div>
    </div>

    <!-- Results display for embedded mode -->
    <div v-if="generatedContent" class="gmkb-embedded-result">
      <div class="gmkb-embedded-result__content">
        {{ formattedContent }}
      </div>
    </div>

    <!-- Error display -->
    <div v-if="error" class="gmkb-embedded-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useAIGenerator } from '../../src/composables/useAIGenerator';

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
    default: 'standalone',
    validator: (v) => ['standalone', 'integrated', 'embedded'].includes(v)
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

// Use composable
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  generatedContent,
  hasContent,
  generate,
  copyToClipboard
} = useAIGenerator('content_repurpose');

// Local state
const originalContent = ref('');
const contentContext = ref('');
const targetFormat = ref('social_posts');
const tone = ref('professional');

/**
 * Format labels map
 */
const formatLabels = {
  social_posts: 'Social Media Posts',
  email: 'Email Newsletter',
  linkedin_article: 'LinkedIn Article',
  twitter_thread: 'Twitter/X Thread',
  video_script: 'Video Script',
  podcast_outline: 'Podcast Outline',
  infographic_points: 'Infographic Key Points',
  carousel_slides: 'Carousel Slides'
};

/**
 * Get format label
 */
const formatLabel = computed(() => {
  return formatLabels[targetFormat.value] || targetFormat.value;
});

/**
 * Repurposing formula for guidance panel
 */
const repurposingFormula = '<span class="generator__highlight">[ORIGINAL CONTENT]</span> + <span class="generator__highlight">[NEW FORMAT]</span> + <span class="generator__highlight">[PLATFORM OPTIMIZATION]</span> = Repurposed Content';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Content Repurposing Maximizes ROI',
    description: 'Creating quality content takes time and effort. Repurposing lets you multiply the value of every piece you create—one blog post can become 10+ social posts, an email series, a video script, and more. This approach saves time while reaching different audiences on their preferred platforms.'
  },
  {
    title: 'What Formats Work Best',
    description: 'The best repurposing strategy depends on your original format and target audience. Long-form content (blogs, podcasts) works great for creating short social posts, email newsletters, or carousel slides. Video content can become blog posts or Twitter threads. Match your format to platform expectations and consumption patterns.'
  },
  {
    title: 'How to Adapt for Each Platform',
    description: 'Each platform has unique characteristics: Twitter favors punchy threads with hooks, LinkedIn prefers professional storytelling, Instagram loves visual-first carousel content, and email newsletters benefit from personal, conversational tones. The AI adapts your content to match platform-specific best practices while maintaining your core message.'
  }
];

/**
 * Example repurposing strategies
 */
const examples = [
  {
    title: 'Blog Post → Multiple Formats:',
    description: 'Turn a 2000-word blog post into: 5-7 social media posts highlighting key insights, a Twitter thread with 8-10 tweets, an email newsletter with the main takeaways, and 6 carousel slides for Instagram/LinkedIn.'
  },
  {
    title: 'Podcast Episode → Content Suite:',
    description: 'Transform a 45-minute podcast interview into: A LinkedIn article summarizing key points, 10 quotable social posts, a video script for short-form content, and an infographic highlighting the 5 main insights discussed.'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return originalContent.value.trim().length > 50; // Require at least 50 characters
});

/**
 * Formatted content for display
 */
const formattedContent = computed(() => {
  if (!generatedContent.value) return '';

  if (Array.isArray(generatedContent.value)) {
    return generatedContent.value.join('\n\n---\n\n');
  }

  return generatedContent.value;
});

/**
 * Get item label based on format and index
 */
const getItemLabel = (index) => {
  const labels = {
    social_posts: `Post ${index + 1}`,
    twitter_thread: `Tweet ${index + 1}`,
    carousel_slides: `Slide ${index + 1}`,
    infographic_points: `Point ${index + 1}`
  };

  return labels[targetFormat.value] || `Item ${index + 1}`;
};

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const formatVal = formatLabels[targetFormat.value] || targetFormat.value;
  const contentPreview = originalContent.value?.substring(0, 100) || '[Your content]';

  if (!originalContent.value) {
    return null;
  }

  return `"Transform <strong>${contentPreview}...</strong> into <strong>${formatVal}</strong>"`;
});

/**
 * Check if embedded form has minimum required fields
 */
const canGenerateEmbedded = computed(() => {
  return originalContent.value?.trim().length > 50;
});

/**
 * Handle field change in embedded mode
 */
const handleEmbeddedFieldChange = () => {
  emit('change', {
    originalContent: originalContent.value,
    targetFormat: targetFormat.value
  });
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      originalContent: originalContent.value,
      targetFormat: targetFormat.value,
      tone: tone.value,
      contentContext: contentContext.value || undefined
    }, context);

    emit('generated', {
      content: generatedContent.value,
      targetFormat: targetFormat.value,
      tone: tone.value
    });
  } catch (err) {
    console.error('[ContentRepurposerGenerator] Generation failed:', err);
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
    content: formattedContent.value,
    targetFormat: targetFormat.value
  });
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Pre-populate fields from profile data if available
  // Content repurposer doesn't have specific profile fields, but we can use general content if available
  if (profileData.content_samples) {
    originalContent.value = profileData.content_samples || originalContent.value;
  }
}

/**
 * Watch for profileData prop changes (embedded mode with EmbeddedToolWrapper)
 * Pre-populates form fields when profile data is provided
 */
watch(
  () => props.profileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

/**
 * Watch for injected profile data from EmbeddedToolWrapper (embedded mode)
 * This is the primary reactive source for profile changes in embedded mode
 */
watch(
  injectedProfileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

/**
 * Watch for field changes in embedded mode and emit preview updates
 */
watch(
  () => [originalContent.value, targetFormat.value],
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: {
          originalContent: originalContent.value,
          targetFormat: targetFormat.value
        }
      });
    }
  },
  { deep: true }
);

/**
 * Emit can-generate status changes to parent (for embedded mode)
 */
watch(canGenerateEmbedded, (newValue) => {
  if (props.mode === 'embedded') {
    emit('update:can-generate', !!newValue);
  }
}, { immediate: true });
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

/* Content Repurposer Results */
.content-repurposer__results {
  padding: var(--mkcg-space-md, 20px);
}

.content-repurposer__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.content-repurposer__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.content-repurposer__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.content-repurposer__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
}

.content-repurposer__content-list {
  display: flex;
  flex-direction: column;
  gap: var(--mkcg-space-md, 20px);
}

.content-repurposer__content-item {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-secondary, #f8f9fa);
  border-radius: var(--mkcg-radius-sm, 4px);
}

.content-repurposer__content-item-header {
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-sm, 12px);
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.content-repurposer__content-item-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--mkcg-primary, #1a9bdc);
  color: white;
  border-radius: 50%;
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
}

.content-repurposer__content-item-label {
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: var(--mkcg-font-weight-medium, 500);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.content-repurposer__content-item p {
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.content-repurposer__content-text p {
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
  white-space: pre-wrap;
}

.content-repurposer__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Embedded Mode Styles (for landing page) */
.gmkb-embedded-form {
  width: 100%;
}

.gmkb-embedded-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gmkb-embedded-field {
  display: flex;
  flex-direction: column;
}

.gmkb-embedded-label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--mkcg-text-primary, #0f172a);
}

.gmkb-embedded-input {
  width: 100%;
  padding: 14px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  box-sizing: border-box;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gmkb-embedded-input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gmkb-embedded-input::placeholder {
  color: var(--mkcg-text-light, #94a3b8);
}

.gmkb-embedded-textarea {
  resize: vertical;
  min-height: 120px;
}

.gmkb-embedded-result {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-radius: 8px;
}

.gmkb-embedded-result__content {
  font-size: 15px;
  line-height: 1.6;
  color: #166534;
  white-space: pre-wrap;
}

.gmkb-embedded-error {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
}
</style>
