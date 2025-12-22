<template>
  <AiWidgetFrame
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
import AiWidgetFrame from './AiWidgetFrame.vue';
import AiToneSelector from './AiToneSelector.vue';
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
