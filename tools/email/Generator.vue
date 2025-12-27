<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Email Writer"
    subtitle="Create professional emails for outreach, follow-ups, and more using AI"
    intro-text="Generate compelling emails that get opened and get responses. Our AI helps you craft the perfect message for cold outreach, follow-ups, introductions, pitches, thank you notes, and booking requests."
    generator-type="email"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Email Purpose Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Email Details</h3>

        <div class="generator__field">
          <label class="generator__field-label">Email Purpose *</label>
          <select v-model="formData.purpose" class="generator__field-input">
            <option value="outreach">Cold Outreach</option>
            <option value="followup">Follow-Up</option>
            <option value="introduction">Self Introduction</option>
            <option value="pitch">Pitch/Proposal</option>
            <option value="thank_you">Thank You</option>
            <option value="booking">Booking Request</option>
          </select>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Who Are You Writing To? *</label>
          <input
            v-model="formData.recipient"
            type="text"
            class="generator__field-input"
            placeholder="e.g., podcast host, potential client, event organizer"
          />
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Context/Details *</label>
          <textarea
            v-model="formData.context"
            class="generator__field-input generator__field-textarea"
            placeholder="What do they need to know? What are you asking for?"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Be specific about your request or message goal.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">About You (Brief)</label>
          <textarea
            v-model="formData.aboutYou"
            class="generator__field-input generator__field-textarea"
            placeholder="A brief intro about yourself for context"
            rows="2"
          ></textarea>
          <p class="generator__field-helper">
            Optional: Helps personalize the email to your background.
          </p>
        </div>
      </div>

      <!-- Email Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Email Settings</h3>

        <div class="generator__field">
          <label class="generator__field-label">Tone</label>
          <select v-model="formData.tone" class="generator__field-input">
            <option value="professional">Professional</option>
            <option value="conversational">Conversational</option>
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
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
          {{ isGenerating ? 'Writing Your Email...' : 'Generate Email with AI' }}
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
        title="Writing Emails That Get Responses"
        subtitle="Effective emails combine a compelling subject line, strong opening hook, clear value proposition, and actionable CTA."
        :formula="emailFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Email Approaches:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="email-generator__results">
        <div class="email-generator__results-header">
          <h3>Your Generated Email</h3>
          <p>Ready to customize and send</p>
        </div>

        <!-- Email Content -->
        <div class="email-generator__content">
          <pre>{{ generatedContent }}</pre>
        </div>

        <!-- Actions -->
        <div class="email-generator__actions">
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
    title="Email Writer"
    description="Create professional emails for outreach, follow-ups, and more."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Email"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Email Purpose Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Email Purpose</label>
        <select v-model="formData.purpose" class="gmkb-ai-input gmkb-ai-select">
          <option value="outreach">Cold Outreach</option>
          <option value="followup">Follow-Up</option>
          <option value="introduction">Self Introduction</option>
          <option value="pitch">Pitch/Proposal</option>
          <option value="thank_you">Thank You</option>
          <option value="booking">Booking Request</option>
        </select>
      </div>

      <!-- Recipient Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Who Are You Writing To?</label>
        <input
          v-model="formData.recipient"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., podcast host, potential client, event organizer"
        />
      </div>

      <!-- Context Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Context/Details</label>
        <textarea
          v-model="formData.context"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What do they need to know? What are you asking for?"
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Be specific about your request or message goal.
        </span>
      </div>

      <!-- About You Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">About You (Brief)</label>
        <textarea
          v-model="formData.aboutYou"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="A brief intro about yourself for context"
          rows="2"
        ></textarea>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="formData.tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate Email"
        loading-text="Writing your email..."
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
        <input
          v-if="field.type === 'text'"
          v-model="formData[field.key]"
          type="text"
          class="gmkb-embedded-input"
          :placeholder="field.placeholder"
          @input="handleEmbeddedFieldChange"
        />
        <textarea
          v-else-if="field.type === 'textarea'"
          v-model="formData[field.key]"
          class="gmkb-embedded-input gmkb-embedded-textarea"
          :placeholder="field.placeholder"
          :rows="field.rows || 3"
          @input="handleEmbeddedFieldChange"
        ></textarea>
        <select
          v-else-if="field.type === 'select'"
          v-model="formData[field.key]"
          class="gmkb-embedded-input gmkb-embedded-select"
          @change="handleEmbeddedFieldChange"
        >
          <option
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Results display for embedded mode -->
    <div v-if="generatedContent" class="gmkb-embedded-result">
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
import { ref, computed, reactive, watch, inject } from 'vue';
import { useAIGenerator } from '../../src/composables/useAIGenerator';

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

// Initialize form data
const formData = reactive({
  purpose: 'outreach',
  recipient: '',
  context: '',
  aboutYou: '',
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
} = useAIGenerator('email');

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
// This provides reactive updates when profile is selected from dropdown
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

/**
 * Embedded mode field configuration
 * In embedded mode, we show a simplified form based on the email purpose
 */
const embeddedFields = computed(() => {
  const defaultLabels = {
    purpose: 'Email Purpose',
    recipient: 'Who are you writing to?',
    context: 'What do you want to say?'
  };
  const defaultPlaceholders = {
    purpose: 'Select email purpose',
    recipient: 'e.g., podcast host, potential client',
    context: 'What do they need to know? What are you asking for?'
  };

  return [
    {
      key: 'purpose',
      type: 'select',
      label: props.intent?.formLabels?.purpose || defaultLabels.purpose,
      placeholder: props.intent?.formPlaceholders?.purpose || defaultPlaceholders.purpose,
      options: [
        { value: 'outreach', label: 'Cold Outreach' },
        { value: 'followup', label: 'Follow-Up' },
        { value: 'introduction', label: 'Self Introduction' },
        { value: 'pitch', label: 'Pitch/Proposal' },
        { value: 'thank_you', label: 'Thank You' },
        { value: 'booking', label: 'Booking Request' }
      ]
    },
    {
      key: 'recipient',
      type: 'text',
      label: props.intent?.formLabels?.recipient || defaultLabels.recipient,
      placeholder: props.intent?.formPlaceholders?.recipient || defaultPlaceholders.recipient
    },
    {
      key: 'context',
      type: 'textarea',
      label: props.intent?.formLabels?.context || defaultLabels.context,
      placeholder: props.intent?.formPlaceholders?.context || defaultPlaceholders.context,
      rows: 3
    }
  ];
});

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const recipientVal = formData.recipient || '[RECIPIENT]';
  const contextVal = formData.context || '[YOUR MESSAGE]';
  const purposeLabel = embeddedFields.value.find(f => f.key === 'purpose')?.options.find(o => o.value === formData.purpose)?.label || 'Email';

  if (!formData.recipient && !formData.context) {
    return null; // Show default preview
  }

  return `<strong>${purposeLabel}</strong> to <strong>${recipientVal}</strong>: "${contextVal}"`;
});

/**
 * Check if embedded form has minimum required fields
 */
const canGenerateEmbedded = computed(() => {
  return formData.recipient?.trim() && formData.context?.trim();
});

/**
 * Email formula for guidance panel
 */
const emailFormula = '<span class="generator__highlight">[SUBJECT LINE]</span> + <span class="generator__highlight">[OPENING HOOK]</span> + <span class="generator__highlight">[VALUE]</span> + <span class="generator__highlight">[CTA]</span> = High-Converting Email';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Email Still Works',
    description: 'Email remains one of the highest-ROI marketing channels because it\'s direct, personal, and permission-based. A well-crafted email cuts through the noise and creates genuine connections with your target audience.'
  },
  {
    title: 'What Makes Emails Get Opened',
    description: 'Subject lines that create curiosity, urgency, or clear value get opened. The opening line must immediately hook the reader by showing you understand their situation or have something valuable to offer. Personalization and relevance are key.'
  },
  {
    title: 'How to Write Compelling CTAs',
    description: 'Your call-to-action should be specific, low-friction, and benefit-focused. Instead of "Let me know if you\'re interested," try "Would you be open to a 15-minute call next Tuesday?" Make it easy for them to say yes.'
  }
];

/**
 * Example email approaches for guidance panel
 */
const examples = [
  {
    title: 'Podcast Outreach Subject + Hook:',
    description: 'Subject: "Loved your episode with [Guest Name]" | Hook: "Your recent conversation about [topic] resonated with me because I\'ve spent the last 5 years helping [audience] overcome [specific challenge]..."'
  },
  {
    title: 'Client Follow-Up Subject + Hook:',
    description: 'Subject: "Quick question about [their project/challenge]" | Hook: "I was thinking about our conversation last week, and I had an idea that might help you [achieve specific result]..."'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return formData.recipient.trim() && formData.context.trim();
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
      content: generatedContent.value
    });
  } catch (err) {
    console.error('[EmailWriterGenerator] Generation failed:', err);
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
  emit('change', { formData: { ...formData } });
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Pre-populate fields from profile data if available
  // Email tool doesn't have specific profile fields, but we could use general info
  if (profileData.bio) {
    formData.aboutYou = profileData.bio;
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
  () => [formData.recipient, formData.context, formData.purpose],
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: {
          purpose: formData.purpose,
          recipient: formData.recipient,
          context: formData.context
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

/* Email Results */
.email-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.email-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.email-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.email-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.email-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.email-generator__content pre {
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
}

.email-generator__actions {
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
  min-height: 80px;
}

.gmkb-embedded-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
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
  word-wrap: break-word;
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
