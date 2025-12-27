<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Framework Builder"
    subtitle="Create a proprietary methodology or framework that showcases your unique approach"
    intro-text="Build a memorable framework that establishes you as a thought leader. Define the problem you solve, your unique approach, and the outcomes you deliver. Your framework will be presented in a clear, step-by-step format that positions you as an authority in your field."
    generator-type="framework"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Problem Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Problem You Solve</h3>

        <div class="generator__field">
          <label class="generator__field-label">Problem *</label>
          <textarea
            v-model="problem"
            class="generator__field-input generator__field-textarea"
            placeholder="What problem does your framework address? e.g., Businesses struggle to maintain consistent brand messaging across multiple channels..."
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Describe the specific problem or challenge your framework solves.
          </p>
        </div>
      </div>

      <!-- Approach Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Your Approach</h3>

        <div class="generator__field">
          <label class="generator__field-label">Your Approach *</label>
          <textarea
            v-model="approach"
            class="generator__field-input generator__field-textarea"
            placeholder="How do you solve this problem? What are your key steps? e.g., I use a systematic process that aligns brand values with customer touchpoints..."
            rows="4"
          ></textarea>
          <p class="generator__field-helper">
            Explain your unique methodology and the key steps in your process.
          </p>
        </div>
      </div>

      <!-- Outcome Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Desired Outcome</h3>

        <div class="generator__field">
          <label class="generator__field-label">Outcome *</label>
          <textarea
            v-model="outcome"
            class="generator__field-input generator__field-textarea"
            placeholder="What results does following your framework produce? e.g., Companies achieve 40% better brand recognition and increased customer loyalty..."
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Describe the measurable results and transformation clients can expect.
          </p>
        </div>
      </div>

      <!-- Framework Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Framework Settings</h3>

        <div class="generator__settings-grid">
          <div class="generator__field">
            <label class="generator__field-label">Number of Steps</label>
            <select v-model="steps" class="generator__field-input">
              <option value="3">3 Steps</option>
              <option value="4">4 Steps</option>
              <option value="5">5 Steps</option>
              <option value="7">7 Steps</option>
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
          {{ isGenerating ? 'Building your framework...' : 'Generate Framework with AI' }}
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
        title="Building Your Proprietary Framework"
        subtitle="A well-crafted framework positions you as a thought leader and makes your methodology teachable and memorable."
        :formula="frameworkFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Framework Concepts:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="framework-generator__results">
        <div class="framework-generator__results-header">
          <h3>Your Generated Framework</h3>
          <p>A proprietary methodology that establishes your authority</p>
        </div>

        <!-- Framework Content -->
        <div class="framework-generator__content" v-html="formattedFramework"></div>

        <!-- Actions -->
        <div class="framework-generator__actions">
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
    title="Framework Builder"
    description="Create a proprietary methodology or framework that showcases your unique approach."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Framework"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Problem Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Problem You Solve</label>
        <textarea
          v-model="problem"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What problem does your framework address?"
          rows="2"
        ></textarea>
      </div>

      <!-- Approach Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Your Approach</label>
        <textarea
          v-model="approach"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="How do you solve this problem? What are your key steps?"
          rows="3"
        ></textarea>
      </div>

      <!-- Outcome Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Desired Outcome</label>
        <textarea
          v-model="outcome"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What results does following your framework produce?"
          rows="2"
        ></textarea>
      </div>

      <!-- Steps Selector -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Number of Steps</label>
        <select v-model="steps" class="gmkb-ai-input">
          <option value="3">3 Steps</option>
          <option value="4">4 Steps</option>
          <option value="5">5 Steps</option>
          <option value="7">7 Steps</option>
        </select>
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      >
        Generate Framework
      </AiGenerateButton>
    </div>

    <!-- Results -->
    <template #results>
      <AiResultsDisplay
        v-if="generatedFramework"
        :content="generatedFramework"
        format="html"
      />
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useAIGenerator } from '../../src/composables/useAIGenerator';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
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

// Use composables
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  generatedContent,
  generate,
  copyToClipboard
} = useAIGenerator('framework');

// Local state
const problem = ref('');
const approach = ref('');
const outcome = ref('');
const steps = ref('5');

/**
 * Framework formula for guidance panel
 */
const frameworkFormula = '<span class="generator__highlight">[CORE CONCEPT]</span> + <span class="generator__highlight">[STEP-BY-STEP PROCESS]</span> + <span class="generator__highlight">[MEMORABLE NAME]</span> = Proprietary Framework';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Frameworks Establish Authority',
    description: 'A proprietary framework transforms your methodology into intellectual property. It demonstrates you\'ve systematized your approach, making you more credible and memorable. Frameworks are shareable, teachable, and position you as a thought leader rather than just another service provider.'
  },
  {
    title: 'What Makes a Framework Teachable',
    description: 'The best frameworks are simple to understand but powerful in application. They break complex processes into clear, sequential steps with a memorable structure. Each step should be distinct, actionable, and build on the previous one to create a complete system.'
  },
  {
    title: 'How to Present Your Framework',
    description: 'Give your framework a unique name that reflects its purpose or outcome. Present it as a proven system with specific steps that lead to predictable results. Use it consistently in your marketing, speaking, and client work to build recognition and authority.'
  }
];

/**
 * Example frameworks for guidance panel
 */
const examples = [
  {
    title: 'The CLARITY Framework:',
    description: 'A 5-step process for business decision-making: Collect data, List options, Analyze outcomes, Refine choices, Implement with confidence, Track results and adjust.'
  },
  {
    title: 'The IMPACT Method:',
    description: 'A 6-step coaching system: Identify goals, Map current state, Plan action steps, Activate accountability, Check progress, Transform results.'
  }
];

/**
 * Has content check
 */
const hasContent = computed(() => {
  return !!generatedContent.value;
});

/**
 * Generated framework accessor
 */
const generatedFramework = computed(() => {
  return generatedContent.value;
});

/**
 * Formatted framework for standalone mode (with HTML styling)
 */
const formattedFramework = computed(() => {
  if (!generatedContent.value) return '';
  // Preserve HTML formatting from the AI response
  return generatedContent.value;
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return problem.value.trim() && approach.value.trim() && outcome.value.trim();
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      problem: problem.value,
      approach: approach.value,
      outcome: outcome.value,
      steps: steps.value
    }, context);

    emit('generated', {
      content: generatedContent.value,
      steps: steps.value
    });
  } catch (err) {
    console.error('[FrameworkGenerator] Generation failed:', err);
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

/* Framework Results */
.framework-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.framework-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.framework-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.framework-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.framework-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.framework-generator__content :deep(h4) {
  margin: var(--mkcg-space-md, 20px) 0 var(--mkcg-space-sm, 12px) 0;
  font-size: var(--mkcg-font-size-base, 16px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
}

.framework-generator__content :deep(h4:first-child) {
  margin-top: 0;
}

.framework-generator__content :deep(p) {
  margin: var(--mkcg-space-sm, 12px) 0;
  color: var(--mkcg-text-primary, #2c3e50);
}

.framework-generator__content :deep(ul),
.framework-generator__content :deep(ol) {
  margin: var(--mkcg-space-sm, 12px) 0;
  padding-left: var(--mkcg-space-lg, 30px);
}

.framework-generator__content :deep(li) {
  margin: var(--mkcg-space-xs, 8px) 0;
  color: var(--mkcg-text-primary, #2c3e50);
}

.framework-generator__content :deep(strong) {
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-primary, #1a9bdc);
}

.framework-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}
</style>
