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
    v-else
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
</style>
