<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Ideal Client Persona Generator"
    subtitle="Define your ideal client avatar with detailed demographics and psychographics"
    intro-text="Generate a comprehensive ideal client persona based on your services, industry, and current best clients. This AI-powered tool creates detailed demographics, psychographics, pain points, and goals to help you better target and serve your ideal clients."
    generator-type="persona"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Services Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Your Business Information</h3>

        <div class="generator__field">
          <label class="generator__field-label">Your Services/Offers *</label>
          <textarea
            v-model="formData.services"
            class="generator__field-input generator__field-textarea"
            placeholder="What do you offer? What problems do you solve?"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Describe the services or products you provide and the main problems you solve.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Industry/Niche</label>
          <input
            v-model="formData.industry"
            type="text"
            class="generator__field-input"
            placeholder="e.g., tech startups, healthcare, coaching"
          />
          <p class="generator__field-helper">
            Specify your industry or niche to create a more targeted persona.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Current Best Clients</label>
          <textarea
            v-model="formData.currentClients"
            class="generator__field-input generator__field-textarea"
            placeholder="Describe your best current clients (optional)"
            rows="2"
          ></textarea>
          <p class="generator__field-helper">
            This helps create a more accurate persona based on real client patterns.
          </p>
        </div>
      </div>

      <!-- Tone Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Generation Settings</h3>

        <div class="generator__field">
          <label class="generator__field-label">Tone</label>
          <select v-model="formData.tone" class="generator__field-input">
            <option value="professional">Professional</option>
            <option value="conversational">Conversational</option>
            <option value="detailed">Detailed</option>
            <option value="concise">Concise</option>
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
          {{ isGenerating ? 'Building your ideal client profile...' : 'Generate Persona with AI' }}
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
        title="Creating Your Ideal Client Persona"
        subtitle="Understanding your ideal client persona allows you to create more targeted marketing, better products, and stronger client relationships."
        :formula="personaFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Persona Descriptions:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="persona-generator__results">
        <div class="persona-generator__results-header">
          <h3>Your Ideal Client Persona</h3>
          <p>A comprehensive profile to guide your marketing and service delivery</p>
        </div>

        <!-- Persona Content -->
        <div class="persona-generator__content">
          <div class="persona-generator__text">
            {{ displayContent }}
          </div>
        </div>

        <!-- Actions -->
        <div class="persona-generator__actions">
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
    :title="config.title"
    :description="config.description"
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    :target-component="config.title"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Dynamic Fields Based on Config -->
      <div
        v-for="field in config.fields"
        :key="field.name"
        class="gmkb-ai-form-group"
      >
        <label :class="['gmkb-ai-label', field.required ? 'gmkb-ai-label--required' : '']">
          {{ field.label }}
        </label>

        <!-- Textarea for longer inputs -->
        <textarea
          v-if="field.type === 'textarea'"
          v-model="formData[field.name]"
          class="gmkb-ai-input gmkb-ai-textarea"
          :placeholder="field.placeholder"
          :rows="field.rows || 3"
        ></textarea>

        <!-- Select dropdown -->
        <select
          v-else-if="field.type === 'select'"
          v-model="formData[field.name]"
          class="gmkb-ai-input gmkb-ai-select"
        >
          <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <!-- Default text input -->
        <input
          v-else
          v-model="formData[field.name]"
          type="text"
          class="gmkb-ai-input"
          :placeholder="field.placeholder"
        />

        <span v-if="field.hint" class="gmkb-ai-hint">{{ field.hint }}</span>
      </div>

      <!-- Tone Selector (optional) -->
      <AiToneSelector v-if="config.showTone" v-model="formData.tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        :text="config.buttonText || 'Generate'"
        :loading-text="config.loadingText || 'Generating...'"
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasContent" class="gmkb-ai-results">
        <AiResultsDisplay
          :content="displayContent"
          :format="config.resultFormat || 'text'"
          :selected-index="selectedIndex"
          @select="handleSelect"
        />
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useAIGenerator } from '../../../composables/useAIGenerator';

// Compact widget components (integrated mode)
import AiWidgetFrame from './AiWidgetFrame.vue';
import AiToneSelector from './AiToneSelector.vue';
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

// Config for integrated mode (SimpleGenerator compatibility)
const config = {
  title: 'Ideal Client Persona Generator',
  description: 'Define your ideal client avatar with detailed demographics and psychographics.',
  buttonText: 'Generate Persona',
  loadingText: 'Building your ideal client profile...',
  resultFormat: 'text',
  showTone: false,
  fields: [
    {
      name: 'services',
      label: 'Your Services/Offers',
      type: 'textarea',
      placeholder: 'What do you offer? What problems do you solve?',
      required: true,
      rows: 3
    },
    {
      name: 'industry',
      label: 'Industry/Niche',
      type: 'text',
      placeholder: 'e.g., tech startups, healthcare, coaching',
      required: false
    },
    {
      name: 'currentClients',
      label: 'Current Best Clients',
      type: 'textarea',
      placeholder: 'Describe your best current clients (optional)',
      hint: 'This helps create a more accurate persona.',
      required: false,
      rows: 2
    }
  ]
};

// Initialize form data based on config fields
const formData = reactive({});
config.fields.forEach(field => {
  formData[field.name] = field.default || '';
});
formData.tone = 'professional';

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
} = useAIGenerator('persona');

// Selection state for list/cards results
const selectedIndex = ref(0);

/**
 * Persona formula for guidance panel
 */
const personaFormula = '<span class="generator__highlight">[DEMOGRAPHICS]</span> + <span class="generator__highlight">[PSYCHOGRAPHICS]</span> + <span class="generator__highlight">[PAIN POINTS]</span> = Ideal Client Persona';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Personas Matter',
    description: 'An ideal client persona transforms vague target audiences into specific, relatable people. Instead of marketing to "everyone," you create focused messaging that resonates with the exact people who need your services most.'
  },
  {
    title: 'What Makes a Persona Actionable',
    description: 'The best personas go beyond basic demographics to include psychographics (values, motivations, fears), pain points (specific problems they face), goals (what they want to achieve), and objections (what holds them back from taking action).'
  },
  {
    title: 'How to Use Your Persona',
    description: 'Reference your persona when creating marketing content, developing new offers, writing sales copy, or making business decisions. Ask yourself: "Would my ideal client resonate with this?" This keeps your business aligned with your best clients.'
  }
];

/**
 * Example personas for guidance panel
 */
const examples = [
  {
    title: 'Business Coach Ideal Client:',
    description: 'Meet Sarah, a 38-year-old entrepreneur running a 6-figure online business. She\'s overwhelmed trying to scale while maintaining quality. She values work-life balance but feels guilty taking time off. Her biggest fear is burnout, and she needs proven systems to grow sustainably.'
  },
  {
    title: 'Marketing Consultant Ideal Client:',
    description: 'Meet David, a 45-year-old VP of Marketing at a B2B SaaS company. He\'s under pressure to generate more qualified leads with a flat budget. He values data-driven strategies but lacks in-house expertise for complex campaigns. His biggest challenge is proving marketing ROI to the C-suite.'
  }
];

/**
 * Format content for display
 */
const displayContent = computed(() => {
  if (!generatedContent.value) return null;

  // If result is already an array, return as-is
  if (Array.isArray(generatedContent.value)) {
    return generatedContent.value;
  }

  // If it's a string and should be split into items
  if (config.resultFormat === 'cards' || config.resultFormat === 'list') {
    // Split by newlines and numbered items
    const lines = generatedContent.value.split('\n').filter(l => l.trim());
    return lines.map(line => line.replace(/^\d+[\.\)]\s*/, '').trim());
  }

  return generatedContent.value;
});

/**
 * Check if we can generate
 */
const canGenerate = computed(() => {
  // Check all required fields have values
  return config.fields
    .filter(f => f.required)
    .every(f => formData[f.name]?.trim?.()?.length > 0);
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
    console.error('[PersonaGenerator] Generation failed:', err);
  }
};

/**
 * Handle selection
 */
const handleSelect = (index) => {
  selectedIndex.value = index;
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
  const content = Array.isArray(displayContent.value)
    ? displayContent.value[selectedIndex.value]
    : displayContent.value;

  emit('applied', {
    componentId: props.componentId,
    content,
    fullContent: generatedContent.value
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

/* Persona Results */
.persona-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.persona-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.persona-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.persona-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.persona-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.persona-generator__text {
  color: var(--mkcg-text-primary, #2c3e50);
  white-space: pre-wrap;
}

.persona-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles (kept from SimpleGenerator) */
.gmkb-ai-results {
  margin-top: 16px;
}

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
