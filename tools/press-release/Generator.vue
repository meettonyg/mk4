<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'default'"
    title="Press Release Generator"
    subtitle="Create professional press releases for announcements and news using AI"
    intro-text="Generate compelling press releases that capture media attention and communicate your news effectively. Our AI helps you craft professional announcements with proper structure, newsworthy angles, and journalist-friendly formatting."
    generator-type="press_release"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Announcement Details Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Announcement Details</h3>

        <div class="generator__field">
          <label class="generator__field-label">Announcement Headline *</label>
          <input
            v-model="headline"
            type="text"
            class="generator__field-input"
            placeholder="e.g., Company X Launches Revolutionary New Product"
          />
          <p class="generator__field-helper">
            Make it newsworthy and specific. Include the who, what, and why.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">What Are You Announcing? *</label>
          <textarea
            v-model="announcement"
            class="generator__field-input generator__field-textarea"
            placeholder="Describe the news, launch, event, or milestone..."
            rows="4"
          ></textarea>
          <p class="generator__field-helper">
            Include key facts, dates, and what makes this newsworthy.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Key Quote</label>
          <textarea
            v-model="quote"
            class="generator__field-input generator__field-textarea"
            placeholder="A quote from you or a key stakeholder"
            rows="2"
          ></textarea>
          <p class="generator__field-helper">
            Optional but recommended. Adds a human element to your release.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Company/Person Background *</label>
          <textarea
            v-model="companyInfo"
            class="generator__field-input generator__field-textarea"
            placeholder="Brief description of who is making the announcement"
            rows="2"
          ></textarea>
          <p class="generator__field-helper">
            This becomes the boilerplate section at the end of your press release.
          </p>
        </div>
      </div>

      <!-- Tone Setting -->
      <div class="generator__section">
        <h3 class="generator__section-title">Tone</h3>

        <div class="generator__field">
          <label class="generator__field-label">Writing Tone</label>
          <select v-model="tone" class="generator__field-input">
            <option value="professional">Professional</option>
            <option value="formal">Formal</option>
            <option value="conversational">Conversational</option>
            <option value="enthusiastic">Enthusiastic</option>
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
          {{ isGenerating ? 'Writing your press release...' : 'Generate Press Release with AI' }}
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
        title="Writing Effective Press Releases"
        subtitle="A press release is your opportunity to share newsworthy announcements with journalists, media outlets, and the public."
        :formula="pressReleaseFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Press Release Openings:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="press-release-generator__results">
        <div class="press-release-generator__results-header">
          <h3>Your Generated Press Release</h3>
          <p>Ready to share with media and stakeholders</p>
        </div>

        <!-- Press Release Content -->
        <div class="press-release-generator__content">
          <div v-html="formattedContent"></div>
        </div>

        <!-- Actions -->
        <div class="press-release-generator__actions">
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
    title="Press Release Generator"
    description="Create professional press releases for announcements and news."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Press Release"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Headline Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Announcement Headline</label>
        <input
          v-model="headline"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Company X Launches Revolutionary New Product"
        />
      </div>

      <!-- Announcement Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">What Are You Announcing?</label>
        <textarea
          v-model="announcement"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="Describe the news, launch, event, or milestone..."
          rows="3"
        ></textarea>
      </div>

      <!-- Quote Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Key Quote</label>
        <textarea
          v-model="quote"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="A quote from you or a key stakeholder"
          rows="2"
        ></textarea>
      </div>

      <!-- Company Info Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Company/Person Background</label>
        <textarea
          v-model="companyInfo"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="Brief description of who is making the announcement"
          rows="2"
        ></textarea>
        <span class="gmkb-ai-hint">This becomes the boilerplate section.</span>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate Press Release"
        loading-text="Writing your press release..."
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
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue';
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

// Use the generic AI generator
const {
  isGenerating,
  generatedContent,
  error,
  usageRemaining,
  resetTime,
  hasContent,
  generate,
  copyToClipboard
} = useAIGenerator('press_release');

// History composable
const {
  history,
  hasHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  formatTimestamp
} = useGeneratorHistory('press-release');

const showHistory = ref(false);

// Local state
const headline = ref('');
const announcement = ref('');
const quote = ref('');
const companyInfo = ref('');
const tone = ref('professional');

/**
 * Press release formula for guidance panel
 */
const pressReleaseFormula = '<span class="generator__highlight">[HEADLINE]</span> + <span class="generator__highlight">[LEAD]</span> + <span class="generator__highlight">[BODY]</span> + <span class="generator__highlight">[BOILERPLATE]</span> = Professional Press Release';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Press Releases Matter',
    description: 'Press releases are essential tools for sharing newsworthy announcements with journalists, media outlets, and stakeholders. A well-crafted press release can earn media coverage, build credibility, drive traffic, and establish your authority in your industry. They provide a controlled narrative for your news and serve as official records of company milestones.'
  },
  {
    title: 'What Journalists Look For',
    description: 'Journalists receive hundreds of press releases daily. They look for genuine newsworthiness—announcements that matter to their audience. Strong press releases answer the 5 W\'s (Who, What, When, Where, Why) in the first paragraph, include compelling quotes from key stakeholders, provide concrete facts and data, and are free from excessive marketing jargon.'
  },
  {
    title: 'How to Distribute Your Press Release',
    description: 'Once generated, distribute your press release through wire services (PR Newswire, Business Wire), directly to targeted journalists covering your industry, on your company website\'s newsroom or blog, through social media channels, and to your email subscribers. Include multimedia elements like images or videos when possible to increase engagement and pickup rates.'
  }
];

/**
 * Example press releases for guidance panel
 */
const examples = [
  {
    title: 'Product Launch Example:',
    description: '[Company Name] Launches AI-Powered Analytics Platform, Helping Businesses Reduce Data Processing Time by 70%. New SaaS solution combines machine learning with intuitive dashboards to deliver real-time insights for growing enterprises.'
  },
  {
    title: 'Funding Announcement Example:',
    description: '[Startup Name] Raises $10M Series A to Revolutionize Remote Team Collaboration. Investment led by [VC Firm] will accelerate product development and expand market reach across North America and Europe.'
  }
];

/**
 * Format content with proper line breaks for display
 */
const formattedContent = computed(() => {
  if (!generatedContent.value) return '';

  // Convert line breaks to HTML
  return generatedContent.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p>${line}</p>`)
    .join('');
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return headline.value.trim() &&
         announcement.value.trim() &&
         companyInfo.value.trim();
});

/**
 * Form completion tracking
 */
const formCompletion = computed(() => {
  const fields = [
    { name: 'Headline', filled: !!headline.value.trim() },
    { name: 'Announcement', filled: !!announcement.value.trim() },
    { name: 'Company Info', filled: !!companyInfo.value.trim() }
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
 * Embedded mode field configuration
 * In embedded mode, we show a simplified 2-field form (headline, announcement)
 */
const embeddedFields = computed(() => {
  const defaultLabels = {
    headline: 'Announcement Headline',
    announcement: 'What Are You Announcing?'
  };
  const defaultPlaceholders = {
    headline: 'e.g., Company X Launches Revolutionary New Product',
    announcement: 'Describe the news, launch, event, or milestone...'
  };

  return [
    {
      key: 'headline',
      label: props.intent?.formLabels?.headline || defaultLabels.headline,
      placeholder: props.intent?.formPlaceholders?.headline || defaultPlaceholders.headline
    },
    {
      key: 'announcement',
      label: props.intent?.formLabels?.announcement || defaultLabels.announcement,
      placeholder: props.intent?.formPlaceholders?.announcement || defaultPlaceholders.announcement
    }
  ];
});

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const headlineVal = headline.value || '[HEADLINE]';
  const announcementVal = announcement.value || '[ANNOUNCEMENT]';

  if (!headline.value && !announcement.value) {
    return null; // Show default preview
  }

  return `<strong>${headlineVal}</strong><br><br>${announcementVal}`;
});

/**
 * Check if embedded form has minimum required fields
 */
const canGenerateEmbedded = computed(() => {
  return headline.value?.trim() && announcement.value?.trim();
});

/**
 * Handle field change
 */
const handleFieldChange = (key, value) => {
  emit('change', { field: key, value });
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';

    const params = {
      headline: headline.value,
      announcement: announcement.value,
      quotes: quote.value,
      companyInfo: companyInfo.value,
      tone: tone.value
    };

    await generate(params, context);

    // Save to history on success
    if (generatedContent.value) {
      addToHistory({
        inputs: {
          headline: headline.value,
          announcement: announcement.value,
          quote: quote.value,
          companyInfo: companyInfo.value,
          tone: tone.value
        },
        results: generatedContent.value,
        preview: generatedContent.value.substring(0, 50) || 'Generated press release'
      });
    }

    emit('generated', {
      content: generatedContent.value,
      tone: tone.value
    });
  } catch (err) {
    console.error('[PressReleaseGenerator] Generation failed:', err);
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

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('keydown', handleKeyboardShortcut);
});

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

/* Press Release Results */
.press-release-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.press-release-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.press-release-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.press-release-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.press-release-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.press-release-generator__content :deep(p) {
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
  color: var(--mkcg-text-primary, #2c3e50);
}

.press-release-generator__content :deep(p:last-child) {
  margin-bottom: 0;
}

.press-release-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

</style>
