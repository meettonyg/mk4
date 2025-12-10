<template>
  <AiWidgetFrame
    title="Biography Generator"
    description="Create a professional biography that establishes your credibility and expertise."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Biography"
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
        <label class="gmkb-ai-label gmkb-ai-label--required">Your Name</label>
        <input
          v-model="name"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Dr. Jane Smith"
        />
      </div>

      <!-- Authority Hook (simplified) -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">What do you do?</label>
        <textarea
          v-model="authorityHookText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., I help busy executives achieve work-life balance through proven mindfulness techniques..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Describe who you help and what transformation you provide.
        </span>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" />

      <!-- Length Selector -->
      <AiLengthSelector v-model="length" />

      <!-- POV Selector -->
      <AiPovSelector v-model="pov" />

      <!-- Generate Button -->
      <AiGenerateButton
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <AiResultsDisplay
        v-if="currentBio"
        :content="currentBio"
        format="text"
        show-count
      />
    </template>

    <!-- Results Actions -->
    <template #results-actions>
      <div class="gmkb-ai-results__tabs" v-if="hasMultipleBios">
        <button
          v-for="len in availableLengths"
          :key="len"
          type="button"
          class="gmkb-ai-results__tab"
          :class="{ 'gmkb-ai-results__tab--active': length === len }"
          @click="length = len"
        >
          {{ len }}
        </button>
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useAIBiography } from '../../../composables/useAIBiography';
import { useAuthorityHook } from '../../../composables/useAuthorityHook';
import AiWidgetFrame from './AiWidgetFrame.vue';
import AiToneSelector from './AiToneSelector.vue';
import AiLengthSelector from './AiLengthSelector.vue';
import AiPovSelector from './AiPovSelector.vue';
import AiGenerateButton from './AiGenerateButton.vue';
import AiResultsDisplay from './AiResultsDisplay.vue';

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
  },

  /**
   * Initial name value
   */
  initialName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['applied', 'generated']);

// Use composables
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  biographies,
  currentBio,
  hasContent,
  generate,
  copyToClipboard,
  tone,
  length,
  pov,
  setTone,
  setLength,
  setPOV
} = useAIBiography();

const { authorityHookSummary, syncFromStore } = useAuthorityHook();

// Local state
const name = ref(props.initialName);
const authorityHookText = ref('');

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return name.value.trim() && authorityHookText.value.trim();
});

/**
 * Check if multiple biography lengths are available
 */
const hasMultipleBios = computed(() => {
  return Object.keys(biographies.value).filter(k => biographies.value[k]).length > 1;
});

/**
 * Available lengths that have content
 */
const availableLengths = computed(() => {
  return ['short', 'medium', 'long'].filter(len => biographies.value[len]);
});

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
      content: currentBio.value,
      length: length.value,
      tone: tone.value,
      pov: pov.value
    });
  } catch (err) {
    console.error('[BiographyGenerator] Generation failed:', err);
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
    content: currentBio.value,
    length: length.value
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
.gmkb-ai-results__tabs {
  display: flex;
  gap: 4px;
}

.gmkb-ai-results__tab {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  color: var(--gmkb-ai-text-secondary, #64748b);
  background: transparent;
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gmkb-ai-results__tab:hover {
  border-color: var(--gmkb-ai-primary, #6366f1);
}

.gmkb-ai-results__tab--active {
  color: var(--gmkb-ai-primary, #6366f1);
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--gmkb-ai-primary, #6366f1);
}
</style>
