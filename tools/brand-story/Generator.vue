<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Brand Story Generator"
    subtitle="Craft compelling origin stories that connect with your audience using AI"
    intro-text="Transform your journey into a powerful brand narrative. Share your background, pivotal transformation moment, and mission to create an authentic story that resonates with your ideal audience and establishes an emotional connection."
    generator-type="brand-story"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Brand Story Inputs -->
      <div class="generator__section">
        <h3 class="generator__section-title">Your Story Elements</h3>

        <div class="generator__field">
          <label class="generator__field-label">Your Background *</label>
          <textarea
            v-model="background"
            class="generator__field-input generator__field-textarea"
            placeholder="Where did you start? What was your journey?"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Share your origin story - where you came from and what led you here.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Your Transformation Moment *</label>
          <textarea
            v-model="transformation"
            class="generator__field-input generator__field-textarea"
            placeholder="What pivotal moment led you to do what you do now?"
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            The turning point that shaped your mission - your "aha" moment.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Your Mission</label>
          <textarea
            v-model="mission"
            class="generator__field-input generator__field-textarea"
            placeholder="Why do you do what you do? Who do you serve?"
            rows="2"
          ></textarea>
          <p class="generator__field-helper">
            Your purpose and the impact you want to create.
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
            <option value="inspirational">Inspirational</option>
            <option value="authentic">Authentic</option>
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
          {{ isGenerating ? 'Crafting your story...' : 'Generate Brand Story with AI' }}
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
        title="The Anatomy of a Compelling Brand Story"
        subtitle="Your brand story is more than a timeline—it's the emotional journey that helps your audience see themselves in your transformation."
        :formula="brandStoryFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Brand Story Elements:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="brand-story-generator__results">
        <div class="brand-story-generator__results-header">
          <h3>Your Generated Brand Story</h3>
          <p>A compelling narrative that connects with your audience</p>
        </div>

        <!-- Story Content -->
        <div class="brand-story-generator__content">
          <p>{{ generatedStory }}</p>
        </div>

        <!-- Actions -->
        <div class="brand-story-generator__actions">
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
    title="Brand Story Generator"
    description="Craft your compelling origin story that connects with your audience."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="BrandStory"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Background Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Your Background</label>
        <textarea
          v-model="background"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="Where did you start? What was your journey?"
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Share your origin story and what led you here.
        </span>
      </div>

      <!-- Transformation Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Your Transformation Moment</label>
        <textarea
          v-model="transformation"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="What pivotal moment led you to do what you do now?"
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          The turning point that shaped your mission.
        </span>
      </div>

      <!-- Mission Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Your Mission</label>
        <textarea
          v-model="mission"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="Why do you do what you do? Who do you serve?"
          rows="2"
        ></textarea>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" :options="toneOptions" />

      <!-- Generate Button -->
      <AiGenerateButton
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      >
        {{ isGenerating ? 'Crafting your story...' : 'Generate Brand Story' }}
      </AiGenerateButton>
    </div>

    <!-- Results -->
    <template #results>
      <AiResultsDisplay
        v-if="generatedStory"
        :content="generatedStory"
        format="text"
        show-count
      />
    </template>
  </AiWidgetFrame>
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

// Use composable for AI functionality
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  generate,
  copyToClipboard
} = useAIGenerator('brand_story');

// Local state
const background = ref('');
const transformation = ref('');
const mission = ref('');
const tone = ref('professional');
const generatedStory = ref('');

/**
 * Tone options for integrated mode
 */
const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'authentic', label: 'Authentic' }
];

/**
 * Brand story formula for guidance panel
 */
const brandStoryFormula = '<span class="generator__highlight">[ORIGIN]</span> + <span class="generator__highlight">[CHALLENGE]</span> + <span class="generator__highlight">[TRANSFORMATION]</span> + <span class="generator__highlight">[MISSION]</span> = Compelling Brand Story';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Brand Stories Connect',
    description: 'Authentic brand stories create emotional bonds with your audience. When people see themselves in your journey—your struggles, breakthroughs, and mission—they\'re more likely to trust you and become loyal supporters. Stories are memorable where facts are forgotten.'
  },
  {
    title: 'What Makes Stories Authentic',
    description: 'The most powerful brand stories are honest and specific. Share real challenges you faced, the actual moment that changed everything, and the genuine reason you do what you do. Authenticity builds trust; perfection creates distance.'
  },
  {
    title: 'Where to Share Your Story',
    description: 'Use your brand story on your About page, in speaker bios, during networking introductions, on podcast interviews, in social media content, and throughout your marketing materials. Your story is a versatile asset that humanizes your brand everywhere.'
  }
];

/**
 * Example brand stories for guidance panel
 */
const examples = [
  {
    title: 'Fitness Coach Origin Story:',
    description: '"After struggling with my own weight for years and trying every fad diet, I hit rock bottom at 280 pounds. The transformation began when I stopped chasing quick fixes and started building sustainable habits. Now I help busy professionals achieve lasting health without extreme diets or hours in the gym."'
  },
  {
    title: 'Business Consultant Transformation:',
    description: '"I spent 15 years climbing the corporate ladder, hitting every metric but feeling empty inside. When I was laid off during the recession, I discovered my passion for helping small businesses thrive. Today, I empower entrepreneurs to build profitable businesses aligned with their values, so they never have to choose between success and fulfillment."'
  }
];

/**
 * Has content check
 */
const hasContent = computed(() => {
  return !!generatedStory.value;
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return background.value.trim() && transformation.value.trim();
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    const result = await generate({
      background: background.value,
      transformation: transformation.value,
      mission: mission.value,
      tone: tone.value
    }, context);

    generatedStory.value = result.content || result;

    emit('generated', {
      content: generatedStory.value,
      tone: tone.value
    });
  } catch (err) {
    console.error('[BrandStoryGenerator] Generation failed:', err);
  }
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  await copyToClipboard(generatedStory.value);
};

/**
 * Handle apply (integrated mode)
 */
const handleApply = () => {
  emit('applied', {
    componentId: props.componentId,
    content: generatedStory.value
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

/* Brand Story Results */
.brand-story-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.brand-story-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.brand-story-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.brand-story-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.brand-story-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
  white-space: pre-wrap;
}

.brand-story-generator__content p {
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
}

.brand-story-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}
</style>
