<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'default'"
    title="Elevator Pitch Generator"
    subtitle="Create compelling 30-60 second pitches that capture attention using AI"
    intro-text="Generate a powerful elevator pitch that clearly communicates who you help, what results you deliver, and how you achieve them. Perfect for networking events, introductions, and quick opportunities to make an impression."
    generator-type="elevator_pitch"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Personal Info Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Your Information</h3>

        <div class="generator__field">
          <label class="generator__field-label">Your Name</label>
          <input
            v-model="name"
            type="text"
            class="generator__field-input"
            placeholder="e.g., Jane Smith"
          />
          <p class="generator__field-helper">
            Optional - include your name in the pitch
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">What You Do *</label>
          <textarea
            v-model="authorityHook"
            class="generator__field-input generator__field-textarea"
            placeholder="e.g., I help busy executives achieve work-life balance through proven mindfulness techniques..."
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Describe who you help and what transformation you provide - this is the foundation of your pitch.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Target Audience</label>
          <input
            v-model="audience"
            type="text"
            class="generator__field-input"
            placeholder="e.g., startup founders, busy professionals"
          />
          <p class="generator__field-helper">
            Who is your ideal client or customer?
          </p>
        </div>
      </div>

      <!-- Pitch Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Pitch Settings</h3>

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
            <label class="generator__field-label">Pitch Length</label>
            <select v-model="duration" class="generator__field-input">
              <option value="30">30 seconds (short)</option>
              <option value="60">60 seconds (standard)</option>
              <option value="90">90 seconds (extended)</option>
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
          {{ isGenerating ? 'Crafting your pitch...' : 'Generate Pitch with AI' }}
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
        title="Crafting Your Perfect Elevator Pitch"
        subtitle="A powerful elevator pitch communicates your value proposition in the time it takes to ride an elevator—typically 30-60 seconds."
        :formula="pitchFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Elevator Pitches:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="elevator-pitch-generator__results">
        <div class="elevator-pitch-generator__results-header">
          <h3>Your Generated Elevator Pitch</h3>
          <p>A compelling pitch tailored to your audience</p>
        </div>

        <!-- Pitch Content -->
        <div class="elevator-pitch-generator__content">
          <p>{{ generatedContent }}</p>
        </div>

        <!-- Actions -->
        <div class="elevator-pitch-generator__actions">
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
    title="Elevator Pitch Generator"
    description="Create a compelling 30-60 second pitch that captures attention."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="ElevatorPitch"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Name Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Your Name</label>
        <input
          v-model="name"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Jane Smith"
        />
      </div>

      <!-- Authority Hook -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">What You Do</label>
        <textarea
          v-model="authorityHook"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="Describe who you help and what transformation you provide..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          This will be the foundation of your pitch.
        </span>
      </div>

      <!-- Target Audience -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Target Audience</label>
        <input
          v-model="audience"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., startup founders, busy professionals"
        />
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" />

      <!-- Duration Selector -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Pitch Length</label>
        <select v-model="duration" class="gmkb-ai-input gmkb-ai-select">
          <option value="30">30 seconds (short)</option>
          <option value="60">60 seconds (standard)</option>
          <option value="90">90 seconds (extended)</option>
        </select>
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate Pitch"
        loading-text="Crafting your pitch..."
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

  <!-- Embedded Mode: Landing page form (simplified, used with EmbeddedToolWrapper) -->
  <div v-else class="gmkb-embedded-form">
    <!-- Simplified form for landing page -->
    <div class="gmkb-embedded-fields">
      <div
        v-for="field in embeddedFields"
        :key="field.key"
        class="gmkb-embedded-field"
      >
        <label class="gmkb-embedded-label">{{ field.label }}</label>
        <component
          :is="field.type === 'textarea' ? 'textarea' : 'input'"
          v-model="embeddedFieldValues[field.key]"
          :type="field.type === 'textarea' ? undefined : 'text'"
          class="gmkb-embedded-input"
          :class="{ 'gmkb-embedded-textarea': field.type === 'textarea' }"
          :placeholder="field.placeholder"
          :rows="field.type === 'textarea' ? 3 : undefined"
          @input="handleEmbeddedFieldChange"
        />
      </div>
    </div>

    <!-- Results display for embedded mode -->
    <div v-if="hasContent" class="gmkb-embedded-result">
      <div class="gmkb-embedded-result__content">
        {{ generatedContent }}
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
    validator: (v) => ['default', 'integrated', 'embedded'].includes(v)
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
  generatedContent,
  error,
  usageRemaining,
  resetTime,
  hasContent,
  generate,
  copyToClipboard
} = useAIGenerator('elevator_pitch');

// Local state
const name = ref('');
const authorityHook = ref('');
const audience = ref('');
const tone = ref('professional');
const duration = ref('60');

/**
 * Elevator pitch formula for guidance panel
 */
const pitchFormula = 'I help <span class="generator__highlight">[WHO]</span> achieve <span class="generator__highlight">[RESULT]</span> in <span class="generator__highlight">[TIMEFRAME]</span> through <span class="generator__highlight">[METHOD]</span>.';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Elevator Pitches Matter',
    description: 'You never know when opportunity will strike. Whether at a networking event, chance meeting, or formal introduction, having a polished elevator pitch ensures you\'re always ready to make a powerful first impression and communicate your value clearly.'
  },
  {
    title: 'What Makes an Effective Pitch',
    description: 'The best elevator pitches are concise, specific, and memorable. They clearly identify who you help (your target audience), what transformation you provide (the result), and how you achieve it (your unique method). Avoid jargon and focus on the outcome your clients care about most.'
  },
  {
    title: 'How to Use Your Pitch',
    description: 'Practice your elevator pitch until it feels natural and conversational. Adapt it based on your audience and context—you might emphasize different benefits for different listeners. Use it in networking situations, speaker introductions, social media bios, and anywhere you need to quickly communicate your value.'
  }
];

/**
 * Example elevator pitches for guidance panel
 */
const examples = [
  {
    title: 'Business Coach Example:',
    description: 'I help overwhelmed entrepreneurs build 6-figure businesses in 12 months without burning out. Through my proven 90-day framework, my clients gain clarity on their path, streamline their operations, and finally achieve the freedom they started their business for.'
  },
  {
    title: 'Marketing Consultant Example:',
    description: 'I help B2B companies generate 3x more qualified leads in 90 days through strategic content marketing. My data-driven approach has helped over 150 companies transform their digital presence and consistently attract their ideal clients—without spending more on ads.'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return authorityHook.value.trim().length > 0;
});

/**
 * Embedded mode field configuration
 * In embedded mode, we show a simplified 2-field form (authorityHook, audience)
 */
const embeddedFields = computed(() => {
  const defaultLabels = {
    authorityHook: 'What You Do',
    audience: 'Target Audience'
  };
  const defaultPlaceholders = {
    authorityHook: 'Describe who you help and what transformation you provide...',
    audience: 'e.g., startup founders, busy professionals'
  };

  return [
    {
      key: 'authorityHook',
      type: 'textarea',
      label: props.intent?.formLabels?.authorityHook || defaultLabels.authorityHook,
      placeholder: props.intent?.formPlaceholders?.authorityHook || defaultPlaceholders.authorityHook
    },
    {
      key: 'audience',
      type: 'input',
      label: props.intent?.formLabels?.audience || defaultLabels.audience,
      placeholder: props.intent?.formPlaceholders?.audience || defaultPlaceholders.audience
    }
  ];
});

/**
 * Embedded field values (reactive state for embedded mode)
 */
const embeddedFieldValues = ref({
  authorityHook: '',
  audience: ''
});

/**
 * Current intent for embedded mode
 */
const currentIntent = computed(() => props.intent?.id || 'default');

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const hookVal = embeddedFieldValues.value.authorityHook || '[What You Do]';
  const audienceVal = embeddedFieldValues.value.audience || '[Target Audience]';

  if (!embeddedFieldValues.value.authorityHook && !embeddedFieldValues.value.audience) {
    return null; // Show default preview
  }

  return `"${hookVal} for <strong>${audienceVal}</strong> in 60 seconds or less."`;
});

/**
 * Check if embedded form has minimum required fields
 */
const canGenerateEmbedded = computed(() => {
  return embeddedFieldValues.value.authorityHook?.trim();
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      name: name.value,
      authorityHook: authorityHook.value,
      audience: audience.value,
      tone: tone.value,
      duration: duration.value
    }, context);

    emit('generated', {
      content: generatedContent.value,
      tone: tone.value,
      duration: duration.value
    });
  } catch (err) {
    console.error('[ElevatorPitchGenerator] Generation failed:', err);
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
 * Handle embedded field change
 */
const handleEmbeddedFieldChange = () => {
  // Sync embedded field values to main form fields
  authorityHook.value = embeddedFieldValues.value.authorityHook;
  audience.value = embeddedFieldValues.value.audience;
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Build full name from profile
  const firstName = profileData.first_name || '';
  const lastName = profileData.last_name || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  if (fullName) {
    name.value = fullName;
  }

  // Use authority hook if available
  if (profileData.authority_hook) {
    authorityHook.value = profileData.authority_hook;
    if (props.mode === 'embedded') {
      embeddedFieldValues.value.authorityHook = profileData.authority_hook;
    }
  }

  // Use hook_who for audience if available
  if (profileData.hook_who) {
    audience.value = profileData.hook_who;
    if (props.mode === 'embedded') {
      embeddedFieldValues.value.audience = profileData.hook_who;
    }
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
    if (newData) {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

/**
 * Watch for field changes in embedded mode and emit preview updates
 */
watch(
  () => [embeddedFieldValues.value.authorityHook, embeddedFieldValues.value.audience],
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: {
          authorityHook: embeddedFieldValues.value.authorityHook,
          audience: embeddedFieldValues.value.audience
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

/* Elevator Pitch Results */
.elevator-pitch-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.elevator-pitch-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.elevator-pitch-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.elevator-pitch-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.elevator-pitch-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.elevator-pitch-generator__content p {
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
}

.elevator-pitch-generator__actions {
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

.gmkb-embedded-textarea {
  resize: vertical;
  min-height: 80px;
}

.gmkb-embedded-input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gmkb-embedded-input::placeholder {
  color: var(--mkcg-text-light, #94a3b8);
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
  font-style: italic;
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
