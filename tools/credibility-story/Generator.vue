<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'default'"
    title="Credibility Story Generator"
    subtitle="Create compelling credibility stories that establish your expertise and authority"
    intro-text="Generate powerful credibility stories that demonstrate your expertise through real experiences. Each story combines a client challenge, your unique approach, and measurable results to build trust with your audience."
    generator-type="credibility-story"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Expertise Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Your Expertise</h3>

        <div class="generator__field">
          <label class="generator__field-label">Area of Expertise *</label>
          <input
            v-model="formData.expertise"
            type="text"
            class="generator__field-input"
            placeholder="e.g., leadership development, digital marketing"
          />
        </div>
      </div>

      <!-- Experience Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Key Experience</h3>

        <div class="generator__field">
          <label class="generator__field-label">Describe the Experience *</label>
          <textarea
            v-model="formData.experience"
            class="generator__field-input generator__field-textarea"
            placeholder="A specific experience that demonstrates your expertise"
            rows="4"
          ></textarea>
          <p class="generator__field-helper">
            Share a specific situation where you helped a client or achieved a meaningful result.
          </p>
        </div>
      </div>

      <!-- Lesson Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Key Insight</h3>

        <div class="generator__field">
          <label class="generator__field-label">Key Lesson/Insight *</label>
          <textarea
            v-model="formData.lesson"
            class="generator__field-input generator__field-textarea"
            placeholder="What insight did you gain from this experience?"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            This becomes the takeaway for your audience.
          </p>
        </div>
      </div>

      <!-- Tone Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Story Settings</h3>

        <div class="generator__field">
          <label class="generator__field-label">Tone</label>
          <select v-model="formData.tone" class="generator__field-input">
            <option value="professional">Professional</option>
            <option value="conversational">Conversational</option>
            <option value="authoritative">Authoritative</option>
            <option value="friendly">Friendly</option>
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
          {{ isGenerating ? 'Crafting your credibility narrative...' : 'Generate Credibility Story with AI' }}
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
        title="Crafting Powerful Credibility Stories"
        subtitle="Credibility stories are your most powerful tool for establishing trust and demonstrating real-world expertise."
        :formula="credibilityFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Credibility Story Formats:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="credibility-story-generator__results">
        <div class="credibility-story-generator__results-header">
          <h3>Your Generated Credibility Story</h3>
          <p>Ready to use in your marketing materials, presentations, and client conversations</p>
        </div>

        <!-- Story Content -->
        <div class="credibility-story-generator__content">
          <p>{{ generatedContent }}</p>
        </div>

        <!-- Actions -->
        <div class="credibility-story-generator__actions">
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
    title="Credibility Story Generator"
    description="Build stories that establish your expertise and authority."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Credibility Story"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Expertise Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Area of Expertise</label>
        <input
          v-model="formData.expertise"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., leadership development, digital marketing"
        />
      </div>

      <!-- Experience Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Key Experience</label>
        <textarea
          v-model="formData.experience"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="A specific experience that demonstrates your expertise"
          rows="3"
        ></textarea>
      </div>

      <!-- Lesson Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Key Lesson/Insight</label>
        <textarea
          v-model="formData.lesson"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What insight did you gain from this experience?"
          rows="2"
        ></textarea>
        <span class="gmkb-ai-hint">
          This becomes the takeaway for your audience.
        </span>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="formData.tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate Credibility Story"
        loading-text="Crafting your credibility narrative..."
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

// Form data
const formData = reactive({
  expertise: '',
  experience: '',
  lesson: '',
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
} = useAIGenerator('credibility_story');

// History composable for UX enhancements
const {
  history,
  hasHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  formatTimestamp
} = useGeneratorHistory('credibility-story');

const showHistory = ref(false);

/**
 * Credibility story formula for guidance panel
 */
const credibilityFormula = '<span class="generator__highlight">[CLIENT CHALLENGE]</span> + <span class="generator__highlight">[YOUR APPROACH]</span> + <span class="generator__highlight">[MEASURABLE RESULTS]</span> = Credibility Story';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Credibility Stories Build Trust',
    description: 'Credibility stories demonstrate your expertise through real-world experiences rather than claims. They show potential clients exactly how you solve problems and what results they can expect when working with you.'
  },
  {
    title: 'What Makes Credibility Stories Convincing',
    description: 'The most powerful credibility stories are specific and results-focused. They identify a clear challenge, explain your unique approach or methodology, and provide measurable outcomes that prove your expertise.'
  },
  {
    title: 'How to Use Your Credibility Stories',
    description: 'Use credibility stories in your marketing materials, sales conversations, website content, and presentations. They work especially well when prospects are evaluating whether you can solve their specific problems.'
  }
];

/**
 * Example credibility stories for guidance panel
 */
const examples = [
  {
    title: 'Leadership Coach Example:',
    description: 'A VP of Operations was struggling with team turnover (50% annual rate). Through my leadership development framework, we identified communication gaps and implemented weekly one-on-ones with structured feedback. Within 6 months, turnover dropped to 12% and employee satisfaction scores increased by 40%.'
  },
  {
    title: 'Marketing Consultant Example:',
    description: 'A B2B software company was spending $15K/month on ads with minimal results. I restructured their entire funnel, focusing on high-intent keywords and optimized landing pages. Within 90 days, their cost-per-lead dropped 60% and conversion rates tripled, generating 47 qualified demos.'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return formData.expertise.trim() &&
         formData.experience.trim() &&
         formData.lesson.trim();
});

/**
 * Form completion tracking for UX feedback
 */
const formCompletion = computed(() => {
  const fields = [
    { name: 'Area of Expertise', filled: !!formData.expertise.trim() },
    { name: 'Key Experience', filled: !!formData.experience.trim() },
    { name: 'Key Lesson/Insight', filled: !!formData.lesson.trim() }
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
 * Embedded mode field configuration
 * In embedded mode, we show a simplified 2-field form
 */
const embeddedFields = computed(() => {
  const defaultLabels = {
    expertise: 'What is your area of expertise?',
    experience: 'Describe a key experience that demonstrates your expertise'
  };
  const defaultPlaceholders = {
    expertise: 'e.g., leadership development, digital marketing',
    experience: 'A specific situation where you helped a client or achieved results'
  };

  return [
    {
      key: 'expertise',
      label: props.intent?.formLabels?.expertise || defaultLabels.expertise,
      placeholder: props.intent?.formPlaceholders?.expertise || defaultPlaceholders.expertise,
      type: 'text'
    },
    {
      key: 'experience',
      label: props.intent?.formLabels?.experience || defaultLabels.experience,
      placeholder: props.intent?.formPlaceholders?.experience || defaultPlaceholders.experience,
      type: 'textarea'
    }
  ];
});

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const expertiseVal = formData.expertise || '[EXPERTISE]';
  const experienceVal = formData.experience || '[EXPERIENCE]';

  if (!formData.expertise && !formData.experience) {
    return null; // Show default preview
  }

  return `"As a <strong>${expertiseVal}</strong> expert, I helped achieve results through: <strong>${experienceVal.substring(0, 80)}${experienceVal.length > 80 ? '...' : ''}</strong>."`;
});

/**
 * Check if embedded form has minimum required fields
 */
const canGenerateEmbedded = computed(() => {
  return formData.expertise?.trim() && formData.experience?.trim();
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate(formData, context);

    // Save to history on successful generation
    if (generatedContent.value) {
      addToHistory({
        inputs: {
          expertise: formData.expertise,
          experience: formData.experience,
          lesson: formData.lesson,
          tone: formData.tone
        },
        results: generatedContent.value,
        preview: generatedContent.value?.substring(0, 50) || 'Generated credibility story'
      });
    }

    emit('generated', {
      content: generatedContent.value
    });
  } catch (err) {
    console.error('[CredibilityStoryGenerator] Generation failed:', err);
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

/**
 * Keyboard shortcut handler for Ctrl/Cmd + Enter to generate
 */
const handleKeyboardShortcut = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (canGenerate.value && !isGenerating.value) {
      event.preventDefault();
      handleGenerate();
    }
  }
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

/* Credibility Story Results */
.credibility-story-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.credibility-story-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.credibility-story-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.credibility-story-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.credibility-story-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.credibility-story-generator__content p {
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
}

.credibility-story-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

</style>
