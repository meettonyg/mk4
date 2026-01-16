<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'default'"
    title="Newsletter Writer"
    subtitle="Create engaging newsletters that nurture your audience with AI"
    intro-text="Generate compelling newsletter content that combines curated value with your personal voice. Our AI helps you create newsletters that build relationships, deliver value, and drive engagement with your audience."
    generator-type="newsletter"
    :has-results="hasContent"
    :is-loading="isGenerating"
    :hide-chrome="hideChrome"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Newsletter Content Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Newsletter Content</h3>

        <div class="generator__field">
          <label class="generator__field-label">Main Topic *</label>
          <input
            v-model="formData.topic"
            type="text"
            class="generator__field-input"
            placeholder="What is this newsletter about?"
          />
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Key Points/Updates *</label>
          <textarea
            v-model="formData.keyPoints"
            class="generator__field-input generator__field-textarea"
            placeholder="What do you want to share with your readers?"
            rows="4"
          ></textarea>
          <p class="generator__field-helper">
            List the main points, updates, or insights you want to cover in this newsletter.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Call to Action</label>
          <input
            v-model="formData.callToAction"
            type="text"
            class="generator__field-input"
            placeholder="e.g., Reply to this email, Register for webinar"
          />
          <p class="generator__field-helper">
            Optional: What action do you want readers to take?
          </p>
        </div>
      </div>

      <!-- Newsletter Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Newsletter Settings</h3>

        <div class="generator__settings-grid">
          <div class="generator__field">
            <label class="generator__field-label">Newsletter Style</label>
            <select v-model="formData.style" class="generator__field-input">
              <option value="educational">Educational/Tips</option>
              <option value="personal">Personal Update</option>
              <option value="curated">Curated Content</option>
              <option value="promotional">Promotional</option>
            </select>
          </div>

          <div class="generator__field">
            <label class="generator__field-label">Tone</label>
            <select v-model="formData.tone" class="generator__field-input">
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="friendly">Friendly</option>
              <option value="authoritative">Authoritative</option>
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
          {{ isGenerating ? 'Writing your newsletter...' : 'Generate Newsletter with AI' }}
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
        title="Newsletter Writing Formula"
        subtitle="Great newsletters combine curated value with personal voice and consistent format to build lasting relationships with your audience."
        :formula="newsletterFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Newsletter Sections:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="newsletter-generator__results">
        <div class="newsletter-generator__results-header">
          <h3>Your Generated Newsletter</h3>
          <p>Ready to send to your audience</p>
        </div>

        <!-- Newsletter Content -->
        <div class="newsletter-generator__content">
          <div v-html="formattedContent"></div>
        </div>

        <!-- Actions -->
        <div class="newsletter-generator__actions">
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
    title="Newsletter Writer"
    description="Create engaging newsletters that nurture your audience."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Newsletter"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Main Topic Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Main Topic</label>
        <input
          v-model="formData.topic"
          type="text"
          class="gmkb-ai-input"
          placeholder="What is this newsletter about?"
        />
      </div>

      <!-- Key Points Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Key Points/Updates</label>
        <textarea
          v-model="formData.keyPoints"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What do you want to share with your readers?"
          rows="3"
        ></textarea>
      </div>

      <!-- Call to Action Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Call to Action</label>
        <input
          v-model="formData.callToAction"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Reply to this email, Register for webinar"
        />
      </div>

      <!-- Newsletter Style Selector -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Newsletter Style</label>
        <select v-model="formData.style" class="gmkb-ai-input gmkb-ai-select">
          <option value="educational">Educational/Tips</option>
          <option value="personal">Personal Update</option>
          <option value="curated">Curated Content</option>
          <option value="promotional">Promotional</option>
        </select>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="formData.tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate Newsletter"
        loading-text="Writing your newsletter..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <AiResultsDisplay
        v-if="hasContent"
        :content="generatedContent"
        format="text"
        show-count
      />
    </template>
  </AiWidgetFrame>

</template>

<script setup>
import { ref, computed, reactive, watch, inject, onMounted, onUnmounted } from 'vue';
import { useAIGenerator } from '../../src/composables/useAIGenerator';
import { useGeneratorHistory } from '../../src/composables/useGeneratorHistory';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

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

// Initialize form data
const formData = reactive({
  topic: '',
  keyPoints: '',
  callToAction: '',
  style: 'educational',
  tone: 'professional'
});

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
} = useAIGenerator('newsletter');

// History for recent generations
const {
  history,
  hasHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  formatTimestamp
} = useGeneratorHistory('newsletter');

const showHistory = ref(false);

/**
 * Newsletter formula for guidance panel
 */
const newsletterFormula = '<span class="generator__highlight">[CURATED VALUE]</span> + <span class="generator__highlight">[PERSONAL VOICE]</span> + <span class="generator__highlight">[CONSISTENT FORMAT]</span> = Engaging Newsletter';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Newsletters Build Relationships',
    description: 'Newsletters are one of the most effective ways to nurture your audience over time. Unlike social media posts that disappear into the feed, newsletters land directly in your subscribers\' inboxes, creating a more intimate connection. Regular newsletters position you as a trusted resource and keep your expertise top-of-mind.'
  },
  {
    title: 'What Makes Newsletters Readable',
    description: 'The best newsletters are scannable, valuable, and personal. They balance curated information with your unique perspective and insights. Great newsletters use clear sections, compelling subject lines, and a conversational tone that makes readers feel like they\'re hearing from a friend, not a corporation.'
  },
  {
    title: 'How to Structure Your Newsletter',
    description: 'Start with a personal greeting or story to build connection. Share your key insights or curated content in digestible sections. Include actionable takeaways readers can implement immediately. End with a clear call-to-action that invites engagement, whether that\'s a reply, registration, or share.'
  }
];

/**
 * Example newsletter sections for guidance panel
 */
const examples = [
  {
    title: 'Educational Newsletter Opening:',
    description: '"Hey there! This week I discovered something fascinating about productivity that completely changed how I approach my mornings. Here are 3 insights that might transform yours too..."'
  },
  {
    title: 'Curated Content Newsletter Section:',
    description: '"What I\'m Reading This Week: → The Psychology of Habit Formation (5 min read) - Why your environment matters more than willpower. → 10 Questions for Better Decision Making - A simple framework I\'ve been using with clients."'
  }
];

/**
 * Format content for display with line breaks
 */
const formattedContent = computed(() => {
  if (!generatedContent.value) return '';
  return generatedContent.value.replace(/\n/g, '<br>');
});

/**
 * Check if we can generate
 */
const canGenerate = computed(() => {
  return formData.topic.trim() && formData.keyPoints.trim();
});

/**
 * Form completion status for progress indicator
 */
const formCompletion = computed(() => {
  const fields = [
    { name: 'Main Topic', filled: !!formData.topic.trim() },
    { name: 'Key Points', filled: !!formData.keyPoints.trim() }
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
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    const params = { ...formData };

    await generate(params, context);

    emit('generated', {
      content: generatedContent.value,
      style: formData.style,
      tone: formData.tone
    });

    // Save to history on successful generation
    if (generatedContent.value) {
      addToHistory({
        inputs: {
          topic: formData.topic,
          keyPoints: formData.keyPoints,
          callToAction: formData.callToAction,
          style: formData.style,
          tone: formData.tone
        },
        results: generatedContent.value,
        preview: generatedContent.value.substring(0, 50) || 'Generated newsletter'
      });
    }
  } catch (err) {
    console.error('[NewsletterGenerator] Generation failed:', err);
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
    style: formData.style
  });
};

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
// This provides reactive updates when profile is selected from dropdown
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

/**
 * Embedded mode field configuration
 * In embedded mode, we show a simplified form (topic, key points)
 */
const embeddedFields = computed(() => {
  const defaultLabels = {
    topic: 'Main Topic',
    keyPoints: 'Key Points/Updates'
  };
  const defaultPlaceholders = {
    topic: 'What is this newsletter about?',
    keyPoints: 'What do you want to share with your readers?'
  };

  return [
    {
      key: 'topic',
      type: 'input',
      label: props.intent?.formLabels?.topic || defaultLabels.topic,
      placeholder: props.intent?.formPlaceholders?.topic || defaultPlaceholders.topic
    },
    {
      key: 'keyPoints',
      type: 'textarea',
      label: props.intent?.formLabels?.keyPoints || defaultLabels.keyPoints,
      placeholder: props.intent?.formPlaceholders?.keyPoints || defaultPlaceholders.keyPoints
    }
  ];
});

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const topicVal = formData.topic || '[TOPIC]';
  const keyPointsVal = formData.keyPoints || '[KEY POINTS]';

  if (!formData.topic && !formData.keyPoints) {
    return null; // Show default preview
  }

  return `Newsletter about <strong>${topicVal}</strong> covering <strong>${keyPointsVal}</strong>`;
});

/**
 * Handle field change for embedded mode
 */
const handleEmbeddedFieldChange = (key, value) => {
  emit('change', { field: key, value, formData });
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Pre-populate fields from profile data
  // Newsletter doesn't have specific profile fields, but we could use them if they exist
  if (profileData.newsletter_topic) {
    formData.topic = profileData.newsletter_topic;
  }
  if (profileData.newsletter_style) {
    formData.style = profileData.newsletter_style;
  }
  if (profileData.newsletter_tone) {
    formData.tone = profileData.newsletter_tone;
  }
}

/**
 * Keyboard shortcut handler (Ctrl/Cmd + Enter to generate)
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
 * Initialize on mount
 */
onMounted(() => {
  // Add keyboard shortcut listener
  window.addEventListener('keydown', handleKeyboardShortcut);
});

/**
 * Cleanup on unmount
 */
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

/* Newsletter Results */
.newsletter-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.newsletter-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.newsletter-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.newsletter-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.newsletter-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
  color: var(--mkcg-text-primary, #2c3e50);
}

.newsletter-generator__actions {
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
