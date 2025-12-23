<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Interview Prep Generator"
    subtitle="Prepare talking points and key messages for your next interview using AI"
    intro-text="Generate comprehensive interview preparation materials including talking points, key messages, and anticipated questions. Create a strategic plan to make the most of your interview opportunity."
    generator-type="interview-prep"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Interview Details Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Interview Details</h3>

        <div class="generator__field">
          <label class="generator__field-label">Show/Publication Name</label>
          <input
            v-model="showName"
            type="text"
            class="generator__field-input"
            placeholder="e.g., The Tim Ferriss Show, Forbes"
          />
          <p class="generator__field-helper">
            Optional: The name of the podcast, publication, or event.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Topics to Discuss *</label>
          <textarea
            v-model="topics"
            class="generator__field-input generator__field-textarea"
            placeholder="What topics will you be discussing?"
            rows="2"
          ></textarea>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Key Messages *</label>
          <textarea
            v-model="keyMessages"
            class="generator__field-input generator__field-textarea"
            placeholder="What are the main points you want to convey?"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            These will be woven into your talking points.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Call to Action</label>
          <input
            v-model="callToAction"
            type="text"
            class="generator__field-input"
            placeholder="What do you want listeners to do after?"
          />
          <p class="generator__field-helper">
            Optional: A specific action for the audience to take.
          </p>
        </div>
      </div>

      <!-- Interview Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Interview Settings</h3>

        <div class="generator__field">
          <label class="generator__field-label">Tone</label>
          <select v-model="tone" class="generator__field-input">
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
          {{ isGenerating ? 'Preparing your talking points...' : 'Generate Interview Prep with AI' }}
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
        title="Mastering Your Interview"
        subtitle="Interview success comes from preparation. This tool helps you organize your thoughts, anticipate questions, and deliver compelling messages."
        :formula="interviewFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Talking Point Formats:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="interview-prep-generator__results">
        <div class="interview-prep-generator__results-header">
          <h3>Your Interview Prep Materials</h3>
          <p>Strategic talking points and key messages for your interview</p>
        </div>

        <!-- Interview Prep Content -->
        <div class="interview-prep-generator__content">
          <div v-html="formattedContent"></div>
        </div>

        <!-- Actions -->
        <div class="interview-prep-generator__actions">
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
    title="Interview Prep Generator"
    description="Prepare talking points and key messages for your next interview."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="InterviewPrep"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Show Name Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Show/Publication Name</label>
        <input
          v-model="showName"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., The Tim Ferriss Show, Forbes"
        />
      </div>

      <!-- Topics Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Topics to Discuss</label>
        <textarea
          v-model="topics"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What topics will you be discussing?"
          rows="2"
        ></textarea>
      </div>

      <!-- Key Messages Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Key Messages</label>
        <textarea
          v-model="keyMessages"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What are the main points you want to convey?"
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          These will be woven into your talking points.
        </span>
      </div>

      <!-- Call to Action Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Call to Action</label>
        <input
          v-model="callToAction"
          type="text"
          class="gmkb-ai-input"
          placeholder="What do you want listeners to do after?"
        />
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        :loading="isGenerating"
        :disabled="!canGenerate"
        text="Generate Interview Prep"
        loading-text="Preparing your talking points..."
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <AiResultsDisplay
        v-if="content"
        :content="content"
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

// Use composable for AI generation
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  content,
  hasContent,
  generate,
  copyToClipboard,
  tone,
  setTone
} = useAIGenerator('interview_prep');

// Local form state
const showName = ref('');
const topics = ref('');
const keyMessages = ref('');
const callToAction = ref('');

/**
 * Interview prep formula for guidance panel
 */
const interviewFormula = '<span class="generator__highlight">[KEY MESSAGES]</span> + <span class="generator__highlight">[ANTICIPATED QUESTIONS]</span> + <span class="generator__highlight">[TALKING POINTS]</span> = Interview Prep';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Interview Preparation Matters',
    description: 'Effective interview preparation ensures you deliver your key messages clearly, handle unexpected questions confidently, and make the most of your media opportunity. Being prepared helps you stay on message while remaining authentic and engaging.'
  },
  {
    title: 'What Makes Interviews Successful',
    description: 'Great interviews balance preparation with spontaneity. By having clear talking points, anticipated questions, and key messages ready, you can navigate the conversation naturally while ensuring your most important points are communicated effectively.'
  },
  {
    title: 'How to Practice Your Talking Points',
    description: 'Review your generated materials before the interview. Practice delivering your key messages in different ways. Anticipate follow-up questions and prepare concise, memorable responses. Remember to weave in your call to action naturally throughout the conversation.'
  }
];

/**
 * Example talking points for guidance panel
 */
const examples = [
  {
    title: 'Story-Based Talking Point:',
    description: 'When I first started helping entrepreneurs, I noticed they were all making the same mistake: prioritizing growth over sustainability. That\'s why I developed my 3-phase scaling system that focuses on building foundations first.'
  },
  {
    title: 'Data-Driven Talking Point:',
    description: 'Our research with over 500 companies showed that businesses using strategic delegation grew 3x faster than those where founders tried to do everything themselves. This insight shaped our entire coaching methodology.'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return topics.value.trim() && keyMessages.value.trim();
});

/**
 * Format content with line breaks for display
 */
const formattedContent = computed(() => {
  if (!content.value) return '';
  return content.value.replace(/\n/g, '<br>');
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    const params = {
      topics: topics.value,
      keyMessages: keyMessages.value,
      tone: tone.value
    };

    // Add optional fields if provided
    if (showName.value.trim()) {
      params.showName = showName.value;
    }
    if (callToAction.value.trim()) {
      params.callToAction = callToAction.value;
    }

    await generate(params, context);

    emit('generated', {
      content: content.value,
      tone: tone.value
    });
  } catch (err) {
    console.error('[InterviewPrepGenerator] Generation failed:', err);
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
    content: content.value
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

/* Interview Prep Results */
.interview-prep-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.interview-prep-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.interview-prep-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.interview-prep-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.interview-prep-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.interview-prep-generator__content :deep(h4) {
  margin: var(--mkcg-space-md, 20px) 0 var(--mkcg-space-sm, 12px) 0;
  font-size: var(--mkcg-font-size-base, 16px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
}

.interview-prep-generator__content :deep(h4:first-child) {
  margin-top: 0;
}

.interview-prep-generator__content :deep(p) {
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
  color: var(--mkcg-text-primary, #2c3e50);
}

.interview-prep-generator__content :deep(ul) {
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
  padding-left: var(--mkcg-space-md, 20px);
}

.interview-prep-generator__content :deep(li) {
  margin-bottom: var(--mkcg-space-xs, 8px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.interview-prep-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}
</style>
