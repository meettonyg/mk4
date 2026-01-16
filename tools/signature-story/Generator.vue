<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'default'"
    title="Signature Story Generator"
    subtitle="Create powerful client success stories that showcase your impact using AI"
    intro-text="Generate compelling signature stories based on your client's background, the challenge they faced, your solution, and the results achieved. Your signature story demonstrates your expertise through real-world impact."
    generator-type="signature_story"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Client Background Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Client Background</h3>

        <div class="generator__field">
          <label class="generator__field-label">Who was the client? *</label>
          <textarea
            v-model="clientBackground"
            class="generator__field-input generator__field-textarea"
            placeholder="Describe the client and their initial situation. For example: 'A mid-sized tech startup struggling with scaling their marketing efforts...'"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Provide context about who they are and where they were starting from.
          </p>
        </div>
      </div>

      <!-- Challenge Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">The Challenge</h3>

        <div class="generator__field">
          <label class="generator__field-label">What problem were they facing? *</label>
          <textarea
            v-model="challenge"
            class="generator__field-input generator__field-textarea"
            placeholder="Describe the specific challenge or pain point. For example: 'Their customer acquisition cost was 3x industry average and they were burning cash...'"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Focus on the specific problem that needed solving.
          </p>
        </div>
      </div>

      <!-- Solution Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Your Solution</h3>

        <div class="generator__field">
          <label class="generator__field-label">How did you help them? *</label>
          <textarea
            v-model="solution"
            class="generator__field-input generator__field-textarea"
            placeholder="Describe your approach and methodology. For example: 'I implemented a data-driven marketing framework that optimized their funnel...'"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Explain your unique approach or methodology.
          </p>
        </div>
      </div>

      <!-- Results Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">The Results</h3>

        <div class="generator__field">
          <label class="generator__field-label">What outcomes did they achieve? *</label>
          <textarea
            v-model="results"
            class="generator__field-input generator__field-textarea"
            placeholder="Include specific numbers and metrics. For example: 'Reduced CAC by 60% and increased conversion rate by 150% in just 90 days...'"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Include specific numbers or measurable outcomes whenever possible.
          </p>
        </div>
      </div>

      <!-- Story Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Story Settings</h3>

        <div class="generator__field">
          <label class="generator__field-label">Tone</label>
          <select v-model="tone" class="generator__field-input">
            <option value="professional">Professional</option>
            <option value="conversational">Conversational</option>
            <option value="inspiring">Inspiring</option>
            <option value="authoritative">Authoritative</option>
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
          {{ isGenerating ? 'Generating...' : 'Generate Signature Story with AI' }}
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
        title="Crafting Powerful Signature Stories"
        subtitle="A signature story demonstrates your expertise through real client transformation. It's your most powerful credibility tool."
        :formula="signatureStoryFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Signature Story Concepts:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="signature-story-generator__results">
        <div class="signature-story-generator__results-header">
          <h3>Your Generated Signature Story</h3>
          <p>A compelling narrative showcasing your impact</p>
        </div>

        <!-- Story Content -->
        <div class="signature-story-generator__content">
          <p>{{ generatedContent }}</p>
        </div>

        <!-- Actions -->
        <div class="signature-story-generator__actions">
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
    title="Signature Story Generator"
    description="Create a powerful client success story that showcases your impact."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Signature Story"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Client Background Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Client Background</label>
        <textarea
          v-model="clientBackground"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="Who was the client? What situation were they in?"
          rows="2"
        ></textarea>
      </div>

      <!-- Challenge Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">The Challenge</label>
        <textarea
          v-model="challenge"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What problem were they facing?"
          rows="2"
        ></textarea>
      </div>

      <!-- Solution Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Your Solution</label>
        <textarea
          v-model="solution"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="How did you help them?"
          rows="2"
        ></textarea>
      </div>

      <!-- Results Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">The Results</label>
        <textarea
          v-model="results"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What outcomes did they achieve?"
          rows="2"
        ></textarea>
        <span class="gmkb-ai-hint">
          Include specific numbers or metrics if possible.
        </span>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate Signature Story"
        loading-text="Building your success story..."
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

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
// This provides reactive updates when profile is selected from dropdown
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Use the AI generator composable
const {
  isGenerating,
  generatedContent,
  error,
  usageRemaining,
  resetTime,
  hasContent,
  generate,
  copyToClipboard
} = useAIGenerator('signature_story');

// History composable
const {
  history,
  hasHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  formatTimestamp
} = useGeneratorHistory('signature-story');

const showHistory = ref(false);

// Local state for form fields
const clientBackground = ref('');
const challenge = ref('');
const solution = ref('');
const results = ref('');
const tone = ref('professional');

/**
 * Signature Story formula for guidance panel
 */
const signatureStoryFormula = '<span class="generator__highlight">[DEFINING MOMENT]</span> + <span class="generator__highlight">[LESSON LEARNED]</span> + <span class="generator__highlight">[UNIVERSAL TRUTH]</span> = Signature Story';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Signature Stories Resonate',
    description: 'Signature stories work because they combine emotional connection with concrete proof. Rather than telling prospects what you can do, you show them through the transformation of a real client. This builds trust and credibility in a way that credentials alone cannot.'
  },
  {
    title: 'What Makes Them Memorable',
    description: 'The best signature stories follow a clear arc: situation, challenge, solution, and results. They include specific details and numbers that make the transformation tangible. They focus on the client as the hero, with you as the guide who helped them succeed.'
  },
  {
    title: 'When to Tell Them',
    description: 'Use your signature story in sales conversations, on your website, during speaking engagements, in podcast interviews, and in your marketing materials. It\'s your go-to proof point that demonstrates your methodology creates real results.'
  }
];

/**
 * Example signature stories for guidance panel
 */
const examples = [
  {
    title: 'Business Coach Story:',
    description: 'A struggling consultant was working 70-hour weeks but barely breaking even. Through my profitability framework, they identified and eliminated low-value activities, restructured their pricing, and within 6 months tripled their income while working 30 hours per week.'
  },
  {
    title: 'Marketing Consultant Story:',
    description: 'A B2B software company was spending $50K monthly on ads with minimal ROI. I implemented a targeted content strategy that reduced ad spend to $15K while generating 3x more qualified leads, resulting in $2M in new revenue over 12 months.'
  }
];

/**
 * Embedded mode field configuration
 * In embedded mode, we show a simplified 2-field form
 */
const embeddedFields = computed(() => {
  const defaultLabels = {
    clientBackground: 'Client Background',
    challenge: 'The Challenge'
  };
  const defaultPlaceholders = {
    clientBackground: 'e.g. A mid-sized tech startup struggling with scaling',
    challenge: 'e.g. Customer acquisition cost was 3x industry average'
  };

  return [
    {
      key: 'clientBackground',
      label: props.intent?.formLabels?.clientBackground || defaultLabels.clientBackground,
      placeholder: props.intent?.formPlaceholders?.clientBackground || defaultPlaceholders.clientBackground
    },
    {
      key: 'challenge',
      label: props.intent?.formLabels?.challenge || defaultLabels.challenge,
      placeholder: props.intent?.formPlaceholders?.challenge || defaultPlaceholders.challenge
    }
  ];
});

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const clientVal = clientBackground.value || '[CLIENT]';
  const challengeVal = challenge.value || '[CHALLENGE]';

  if (!clientBackground.value && !challenge.value) {
    return null; // Show default preview
  }

  return `"<strong>${clientVal}</strong> faced <strong>${challengeVal}</strong>. Through our proven approach, they achieved remarkable transformation."`;
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return clientBackground.value.trim() &&
         challenge.value.trim() &&
         solution.value.trim() &&
         results.value.trim();
});

/**
 * Form completion tracking
 */
const formCompletion = computed(() => {
  const fields = [
    { name: 'Client Background', filled: !!clientBackground.value.trim() },
    { name: 'Challenge', filled: !!challenge.value.trim() },
    { name: 'Solution', filled: !!solution.value.trim() },
    { name: 'Results', filled: !!results.value.trim() }
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
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      clientBackground: clientBackground.value,
      challenge: challenge.value,
      solution: solution.value,
      results: results.value,
      tone: tone.value
    }, context);

    // Save to history on success
    if (generatedContent.value) {
      addToHistory({
        inputs: {
          clientBackground: clientBackground.value,
          challenge: challenge.value,
          solution: solution.value,
          results: results.value,
          tone: tone.value
        },
        results: generatedContent.value,
        preview: generatedContent.value.substring(0, 50) || 'Generated signature story'
      });
    }

    emit('generated', {
      content: generatedContent.value,
      tone: tone.value
    });
  } catch (err) {
    console.error('[SignatureStoryGenerator] Generation failed:', err);
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
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Pre-populate fields from profile data
  // Use fallback to existing values if profile doesn't have the field
  clientBackground.value = profileData.story_client_background || clientBackground.value || '';
  challenge.value = profileData.story_challenge || challenge.value || '';
  solution.value = profileData.story_solution || solution.value || '';
  results.value = profileData.story_results || results.value || '';
  tone.value = profileData.story_tone || tone.value || 'professional';
}

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

/* Signature Story Results */
.signature-story-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.signature-story-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.signature-story-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.signature-story-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.signature-story-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.signature-story-generator__content p {
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
  white-space: pre-wrap;
}

.signature-story-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

</style>
