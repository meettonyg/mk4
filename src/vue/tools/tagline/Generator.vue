<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Tagline Generator"
    subtitle="Create memorable taglines that capture your unique value proposition using AI"
    intro-text="Generate five compelling taglines based on your unique value proposition and professional identity. Each tagline is crafted to be memorable, concise, and aligned with your brand voice."
    generator-type="tagline"
    :has-results="hasTaglines"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Personal Info Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Your Information</h3>

        <div class="generator__field">
          <label class="generator__field-label">Your Name (Optional)</label>
          <input
            v-model="name"
            type="text"
            class="generator__field-input"
            placeholder="e.g., Jane Smith"
          />
          <p class="generator__field-helper">
            Optional: Include your name to personalize your tagline.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">What You Do *</label>
          <textarea
            v-model="authorityHookText"
            class="generator__field-input generator__field-textarea"
            placeholder="e.g., I help entrepreneurs build sustainable businesses through strategic planning and mindset coaching..."
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Describe your work and the transformation you provide.
          </p>
        </div>
      </div>

      <!-- Tagline Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Tagline Tone</h3>

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
          {{ isGenerating ? 'Generating...' : 'Generate 5 Taglines with AI' }}
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
        title="Crafting Your Perfect Tagline"
        subtitle="A powerful tagline distills your Authority Hook into a memorable phrase that sticks in people's minds."
        :formula="taglineFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Taglines:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="tagline-generator__results">
        <div class="tagline-generator__results-header">
          <h3>Your Generated Taglines</h3>
          <p>Click a tagline to select it</p>
        </div>

        <!-- Tagline Cards -->
        <div class="tagline-generator__cards">
          <button
            v-for="(tagline, index) in taglines"
            :key="index"
            type="button"
            class="tagline-generator__card"
            :class="{ 'tagline-generator__card--selected': selectedIndex === index }"
            @click="handleSelectTagline(index)"
          >
            <span class="tagline-generator__card-number">{{ index + 1 }}</span>
            <span class="tagline-generator__card-text">{{ tagline }}</span>
            <svg v-if="selectedIndex === index" class="tagline-generator__card-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>

        <!-- Selected Preview -->
        <div v-if="selectedTagline" class="tagline-generator__preview">
          <span class="tagline-generator__preview-label">Selected:</span>
          <span class="tagline-generator__preview-text">"{{ selectedTagline }}"</span>
        </div>

        <!-- Navigation -->
        <div class="tagline-generator__nav">
          <button
            type="button"
            class="generator__button generator__button--outline"
            :disabled="selectedIndex <= 0"
            @click="selectPrevious"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Previous
          </button>
          <span class="tagline-generator__nav-count">
            {{ selectedIndex + 1 }} / {{ taglines.length }}
          </span>
          <button
            type="button"
            class="generator__button generator__button--outline"
            :disabled="selectedIndex >= taglines.length - 1"
            @click="selectNext"
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <!-- Actions -->
        <div class="tagline-generator__actions">
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
    title="Tagline Generator"
    description="Create memorable taglines that capture your unique value proposition."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasTaglines"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Tagline"
    :show-cta="!hasTaglines"
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
        <label class="gmkb-ai-label">Your Name (Optional)</label>
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
          v-model="authorityHookText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., I help entrepreneurs build sustainable businesses through strategic planning and mindset coaching..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Describe your work and the transformation you provide.
        </span>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate 5 Taglines"
        loading-text="Generating taglines..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasTaglines" class="gmkb-ai-taglines">
        <p class="gmkb-ai-taglines__instruction">
          Click a tagline to select it:
        </p>
        <AiResultsDisplay
          :content="taglines"
          format="cards"
          :selected-index="selectedIndex"
          @select="handleSelectTagline"
        />

        <!-- Selected Preview -->
        <div v-if="selectedTagline" class="gmkb-ai-taglines__preview">
          <span class="gmkb-ai-taglines__preview-label">Selected:</span>
          <span class="gmkb-ai-taglines__preview-text">"{{ selectedTagline }}"</span>
        </div>
      </div>
    </template>

    <!-- Results Actions -->
    <template #results-actions>
      <div v-if="hasTaglines" class="gmkb-ai-taglines__nav">
        <button
          type="button"
          class="gmkb-ai-button gmkb-ai-button--ghost"
          :disabled="selectedIndex <= 0"
          @click="selectPrevious"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span class="gmkb-ai-taglines__nav-count">
          {{ selectedIndex + 1 }} / {{ taglines.length }}
        </span>
        <button
          type="button"
          class="gmkb-ai-button gmkb-ai-button--ghost"
          :disabled="selectedIndex >= taglines.length - 1"
          @click="selectNext"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAITagline } from '../../../composables/useAITagline';
import { useAuthorityHook } from '../../../composables/useAuthorityHook';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../components/ai/AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel } from '../_shared';

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
  taglines,
  hasTaglines,
  selectedTagline,
  selectedIndex,
  selectTagline,
  selectNext,
  selectPrevious,
  generate,
  copyToClipboard,
  tone
} = useAITagline();

const { authorityHookSummary, syncFromStore } = useAuthorityHook();

// Local state
const name = ref('');
const authorityHookText = ref('');

/**
 * Tagline formula for guidance panel
 */
const taglineFormula = '<span class="generator__highlight">[PROMISE]</span> + <span class="generator__highlight">[DIFFERENTIATION]</span> + <span class="generator__highlight">[BREVITY]</span> = Memorable Tagline';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Taglines Matter',
    description: 'A great tagline is your brand\'s first impression distilled into a single memorable phrase. It appears everywhere—your website header, social media profiles, business cards, and email signatures. A powerful tagline makes you unforgettable and immediately communicates your unique value.'
  },
  {
    title: 'What Makes Taglines Stick',
    description: 'The best taglines are concise (5-10 words), unique to you (not generic), benefit-focused (what clients gain), and emotionally resonant. They combine your promise to clients with what makes you different, wrapped in language that\'s easy to remember and impossible to forget.'
  },
  {
    title: 'Where to Use Your Tagline',
    description: 'Your tagline should appear consistently across all touchpoints: website headers and footers, email signatures, social media bios, LinkedIn headlines, business cards, podcast intros, speaker introductions, and marketing materials. Consistent use builds brand recognition and reinforces your positioning.'
  }
];

/**
 * Example taglines for guidance panel
 */
const examples = [
  {
    title: 'Business Coach:',
    description: '"Building profitable businesses without the burnout."'
  },
  {
    title: 'Marketing Consultant:',
    description: '"Turning invisible brands into industry leaders."'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return authorityHookText.value.trim().length > 0;
});

/**
 * Handle tagline selection
 */
const handleSelectTagline = (index) => {
  selectTagline(index);
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      name: name.value,
      authorityHook: authorityHookText.value
    }, context);

    emit('generated', {
      taglines: taglines.value
    });
  } catch (err) {
    console.error('[TaglineGenerator] Generation failed:', err);
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
    tagline: selectedTagline.value,
    allTaglines: taglines.value
  });
};

/**
 * Sync authority hook from store on mount
 */
onMounted(() => {
  syncFromStore();
  if (authorityHookSummary.value) {
    authorityHookText.value = authorityHookSummary.value;
  }
});

/**
 * Watch for store changes
 */
watch(authorityHookSummary, (newVal) => {
  if (newVal && !authorityHookText.value) {
    authorityHookText.value = newVal;
  }
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

/* Tagline Results */
.tagline-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.tagline-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.tagline-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.tagline-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.tagline-generator__cards {
  display: flex;
  flex-direction: column;
  gap: var(--mkcg-space-sm, 12px);
  margin-bottom: var(--mkcg-space-md, 20px);
}

.tagline-generator__card {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-sm, 12px);
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 2px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  cursor: pointer;
  transition: var(--mkcg-transition-fast, 0.15s ease);
  text-align: left;
}

.tagline-generator__card:hover {
  border-color: var(--mkcg-primary, #1a9bdc);
  box-shadow: 0 2px 8px rgba(26, 155, 220, 0.1);
}

.tagline-generator__card--selected {
  border-color: var(--mkcg-primary, #1a9bdc);
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.tagline-generator__card-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  background: var(--mkcg-bg-secondary, #f8f9fa);
  border-radius: 50%;
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.tagline-generator__card--selected .tagline-generator__card-number {
  background: var(--mkcg-primary, #1a9bdc);
  color: #ffffff;
}

.tagline-generator__card-text {
  flex: 1;
  font-size: var(--mkcg-font-size-base, 16px);
  color: var(--mkcg-text-primary, #2c3e50);
  line-height: var(--mkcg-line-height-normal, 1.5);
}

.tagline-generator__card--selected .tagline-generator__card-text {
  font-weight: var(--mkcg-font-weight-medium, 500);
}

.tagline-generator__card-check {
  flex-shrink: 0;
  color: var(--mkcg-primary, #1a9bdc);
}

.tagline-generator__preview {
  margin-bottom: var(--mkcg-space-md, 20px);
  padding: var(--mkcg-space-md, 20px);
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #7dd3fc;
  border-radius: var(--mkcg-radius, 8px);
}

.tagline-generator__preview-label {
  display: block;
  font-size: var(--mkcg-font-size-xs, 12px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: #0369a1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--mkcg-space-xs, 4px);
}

.tagline-generator__preview-text {
  font-size: var(--mkcg-font-size-lg, 18px);
  font-weight: var(--mkcg-font-weight-medium, 500);
  color: #0c4a6e;
  font-style: italic;
}

.tagline-generator__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--mkcg-space-md, 20px);
  margin-bottom: var(--mkcg-space-md, 20px);
  padding-bottom: var(--mkcg-space-md, 20px);
  border-bottom: 1px solid var(--mkcg-border-light, #e9ecef);
}

.tagline-generator__nav-count {
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-weight: var(--mkcg-font-weight-medium, 500);
}

.tagline-generator__actions {
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles (kept from original) */
.gmkb-ai-taglines__instruction {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

.gmkb-ai-taglines__preview {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #7dd3fc;
  border-radius: 8px;
}

.gmkb-ai-taglines__preview-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #0369a1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.gmkb-ai-taglines__preview-text {
  font-size: 18px;
  font-weight: 500;
  color: #0c4a6e;
  font-style: italic;
}

.gmkb-ai-taglines__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gmkb-ai-taglines__nav-count {
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}
</style>
