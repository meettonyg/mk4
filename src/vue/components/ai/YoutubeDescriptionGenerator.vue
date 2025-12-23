<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="YouTube Description Generator"
    subtitle="Create SEO-optimized YouTube video descriptions using AI"
    intro-text="Generate compelling YouTube descriptions that boost discoverability and engagement. Include timestamps, relevant keywords, and key links to maximize your video's reach and SEO performance."
    generator-type="youtube_description"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Video Info Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Video Information</h3>

        <div class="generator__field">
          <label class="generator__field-label">Video Title *</label>
          <input
            v-model="videoTitle"
            type="text"
            class="generator__field-input"
            placeholder="What is your video called?"
          />
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Video Content Summary *</label>
          <textarea
            v-model="videoContent"
            class="generator__field-input generator__field-textarea"
            placeholder="What is the video about? What key topics are covered?"
            rows="4"
          ></textarea>
          <p class="generator__field-helper">
            Describe the main topics, key points, and value viewers will get from watching.
          </p>
        </div>
      </div>

      <!-- Description Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Description Settings</h3>

        <div class="generator__settings-grid">
          <div class="generator__field">
            <label class="generator__field-label">Include Timestamps?</label>
            <select v-model="timestamps" class="generator__field-input">
              <option value="yes">Yes, generate timestamps</option>
              <option value="no">No timestamps</option>
            </select>
          </div>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Links to Include</label>
          <textarea
            v-model="links"
            class="generator__field-input generator__field-textarea"
            placeholder="Website, social media, resources (one per line)"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Add any important links you want mentioned in the description.
          </p>
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
          {{ isGenerating ? 'Generating...' : 'Generate Description with AI' }}
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
        title="Optimizing Your YouTube Description"
        subtitle="A well-crafted YouTube description helps your videos rank higher in search results and provides viewers with essential information and links."
        :formula="youtubeFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example YouTube Description Formats:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="youtube-generator__results">
        <div class="youtube-generator__results-header">
          <h3>Your Generated Description</h3>
          <p>Optimized for SEO and engagement</p>
        </div>

        <!-- Description Content -->
        <div class="youtube-generator__content">
          <pre>{{ generatedContent }}</pre>
        </div>

        <!-- Actions -->
        <div class="youtube-generator__actions">
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
    title="YouTube Description Generator"
    description="Create SEO-optimized YouTube video descriptions."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="YouTube Description"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Video Title Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Video Title</label>
        <input
          v-model="videoTitle"
          type="text"
          class="gmkb-ai-input"
          placeholder="What is your video called?"
        />
      </div>

      <!-- Video Content Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Video Content Summary</label>
        <textarea
          v-model="videoContent"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What is the video about? Key topics covered?"
          rows="3"
        ></textarea>
      </div>

      <!-- Timestamps Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Include Timestamps?</label>
        <select v-model="timestamps" class="gmkb-ai-input gmkb-ai-select">
          <option value="yes">Yes, generate timestamps</option>
          <option value="no">No timestamps</option>
        </select>
      </div>

      <!-- Links Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Links to Include</label>
        <textarea
          v-model="links"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="Any links you want mentioned (website, social, etc.)"
          rows="2"
        ></textarea>
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate Description"
        loading-text="Writing your description..."
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
import { ref, computed } from 'vue';
import { useAIGenerator } from '../../../composables/useAIGenerator';

// Compact widget components (integrated mode)
import AiWidgetFrame from './AiWidgetFrame.vue';
import AiGenerateButton from './AiGenerateButton.vue';
import AiResultsDisplay from './AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel } from '../ai-tools/_shared';

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

// Use composable for YouTube description generation
const {
  isGenerating,
  generatedContent,
  error,
  usageRemaining,
  resetTime,
  hasContent,
  generate,
  copyToClipboard
} = useAIGenerator('youtube_description');

// Local state
const videoTitle = ref('');
const videoContent = ref('');
const timestamps = ref('yes');
const links = ref('');

/**
 * YouTube description formula for guidance panel
 */
const youtubeFormula = '<span class="generator__highlight">[HOOK]</span> + <span class="generator__highlight">[TIMESTAMPS]</span> + <span class="generator__highlight">[KEYWORDS]</span> + <span class="generator__highlight">[LINKS]</span> = Optimized YouTube Description';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why YouTube Descriptions Matter for SEO',
    description: 'YouTube\'s algorithm uses your description to understand your video\'s content and rank it in search results. A well-optimized description with relevant keywords helps your video appear in both YouTube and Google searches, increasing discoverability and views.'
  },
  {
    title: 'What to Include in Your Description',
    description: 'The best YouTube descriptions start with a compelling hook in the first 2-3 lines (visible before "Show More"), include timestamps for easy navigation, incorporate relevant keywords naturally, provide context about the video content, and add important links to your website, social media, or resources mentioned in the video.'
  },
  {
    title: 'How to Boost Discoverability',
    description: 'Use keywords strategically throughout your description without keyword stuffing. Include hashtags (3-5 relevant ones), add links to related videos or playlists, mention any tools or resources discussed, and ensure the first 150 characters are compelling since they appear in search results.'
  }
];

/**
 * Example YouTube descriptions for guidance panel
 */
const examples = [
  {
    title: 'Tutorial Video Description:',
    description: 'In this tutorial, you\'ll learn how to [specific outcome] in just 15 minutes. Perfect for [target audience].\n\n🕐 TIMESTAMPS:\n0:00 - Introduction\n2:15 - Setup\n5:30 - Main steps\n12:00 - Common mistakes\n\n🔗 RESOURCES:\nDownload template: [link]\nJoin our community: [link]'
  },
  {
    title: 'Educational Content Description:',
    description: 'Discover the [topic] that [benefit]. This video breaks down [complex topic] into simple, actionable steps.\n\nWhat you\'ll learn:\n✓ [Key point 1]\n✓ [Key point 2]\n✓ [Key point 3]\n\n📚 Additional Resources:\nBlog post: [link]\nFree guide: [link]\n\n#keyword1 #keyword2 #keyword3'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return videoTitle.value.trim() && videoContent.value.trim();
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      videoTitle: videoTitle.value,
      videoContent: videoContent.value,
      timestamps: timestamps.value,
      links: links.value
    }, context);

    emit('generated', {
      content: generatedContent.value
    });
  } catch (err) {
    console.error('[YoutubeDescriptionGenerator] Generation failed:', err);
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
    content: generatedContent.value
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

.generator__settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--mkcg-space-md, 20px);
  margin-bottom: var(--mkcg-space-md, 20px);
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

/* YouTube Results */
.youtube-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.youtube-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.youtube-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.youtube-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.youtube-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.youtube-generator__content pre {
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
}

.youtube-generator__actions {
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
}

.gmkb-ai-select:focus {
  outline: none;
  border-color: var(--gmkb-ai-primary, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
</style>
