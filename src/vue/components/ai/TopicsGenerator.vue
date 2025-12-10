<template>
  <AiWidgetFrame
    title="Speaking Topics Generator"
    description="Generate compelling interview and speaking topics that showcase your expertise."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasTopics"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Topics"
    :show-cta="!hasTopics"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Expertise Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Your Expertise</label>
        <textarea
          v-model="expertise"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., Leadership development, executive coaching, organizational psychology..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Describe your areas of expertise and unique methodologies.
        </span>
      </div>

      <!-- Authority Hook (optional) -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Authority Hook (Optional)</label>
        <textarea
          v-model="authorityHookText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., I help busy executives achieve work-life balance..."
          rows="2"
        ></textarea>
        <span class="gmkb-ai-hint">
          Add your positioning statement for more targeted topics.
        </span>
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate 5 Topics"
        loading-text="Generating topics..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <AiResultsDisplay
        v-if="topics.length > 0"
        :content="topics"
        format="cards"
        :selected-index="selectedTopicIndex"
        @select="handleSelectTopic"
      />
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAITopics } from '../../../composables/useAITopics';
import { useAuthorityHook } from '../../../composables/useAuthorityHook';
import AiWidgetFrame from './AiWidgetFrame.vue';
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
  topics,
  hasTopics,
  generate,
  copyToClipboard
} = useAITopics();

const { authorityHookSummary, syncFromStore } = useAuthorityHook();

// Local state
const expertise = ref('');
const authorityHookText = ref('');
const selectedTopicIndex = ref(-1);

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return expertise.value.trim().length > 0;
});

/**
 * Handle topic selection
 */
const handleSelectTopic = (index) => {
  selectedTopicIndex.value = selectedTopicIndex.value === index ? -1 : index;
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  selectedTopicIndex.value = -1;

  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      expertise: expertise.value,
      authorityHook: authorityHookText.value
    }, context);

    emit('generated', {
      topics: topics.value
    });
  } catch (err) {
    console.error('[TopicsGenerator] Generation failed:', err);
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
    topics: topics.value
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
