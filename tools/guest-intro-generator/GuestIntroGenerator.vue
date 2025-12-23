<template>
  <AiWidgetFrame
    title="Guest Introduction Generator"
    description="Create a host-ready introduction that builds anticipation and establishes credibility."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasIntroduction"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Guest Intro"
    :show-cta="!hasIntroduction"
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
        <label class="gmkb-ai-label gmkb-ai-label--required">Guest Name</label>
        <input
          v-model="name"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Dr. Jane Smith"
        />
      </div>

      <!-- Biography Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Short Biography</label>
        <textarea
          v-model="biography"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., Dr. Jane Smith is a leadership coach and author who has helped over 500 executives transform their careers..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Provide a brief bio to pull key information from.
        </span>
      </div>

      <!-- Credentials Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Key Credentials</label>
        <input
          v-model="credentials"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., PhD, ICF Certified Coach, TEDx Speaker"
        />
        <span class="gmkb-ai-hint">
          Comma-separated list of credentials to highlight.
        </span>
      </div>

      <!-- Tagline Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Tagline (Optional)</label>
        <input
          v-model="tagline"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Helping leaders lead with purpose"
        />
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate Introduction"
        loading-text="Crafting introduction..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasIntroduction" class="gmkb-ai-intro">
        <div class="gmkb-ai-intro__content">
          <AiResultsDisplay
            :content="introduction"
            format="text"
            show-count
          />
        </div>

        <!-- Read-aloud tip -->
        <div class="gmkb-ai-intro__tip">
          <svg class="gmkb-ai-intro__tip-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>This introduction is designed to be read aloud by a podcast host or event MC.</span>
        </div>
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAIGuestIntro } from '@composables/useAIGuestIntro';
import { useImpactIntro } from '@composables/useImpactIntro';
import AiWidgetFrame from '@ai/AiWidgetFrame.vue';
import AiGenerateButton from '@ai/AiGenerateButton.vue';
import AiResultsDisplay from '@ai/AiResultsDisplay.vue';

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
   * Initial name
   */
  initialName: {
    type: String,
    default: ''
  },

  /**
   * Initial biography
   */
  initialBiography: {
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
  introduction,
  hasIntroduction,
  generate,
  copyToClipboard
} = useAIGuestIntro();

const { credentialsSummary, syncFromStore: syncImpactIntro } = useImpactIntro();

// Local state
const name = ref(props.initialName);
const biography = ref(props.initialBiography);
const credentials = ref('');
const tagline = ref('');

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return name.value.trim() && biography.value.trim();
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      name: name.value,
      biography: biography.value,
      credentials: credentials.value,
      tagline: tagline.value
    }, context);

    emit('generated', {
      introduction: introduction.value
    });
  } catch (err) {
    console.error('[GuestIntroGenerator] Generation failed:', err);
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
    introduction: introduction.value
  });
};

/**
 * Load credentials from store on mount
 */
onMounted(() => {
  syncImpactIntro();
  if (credentialsSummary.value) {
    credentials.value = credentialsSummary.value;
  }
});
</script>

<style scoped>
.gmkb-ai-intro__content {
  margin-bottom: 16px;
}

.gmkb-ai-intro__tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: var(--gmkb-ai-bg-tertiary, #f3f4f6);
  border-radius: var(--gmkb-ai-radius-md, 8px);
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

.gmkb-ai-intro__tip-icon {
  flex-shrink: 0;
  margin-top: 1px;
}
</style>
