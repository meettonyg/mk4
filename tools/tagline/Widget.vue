<template>
  <AiWidgetFrame
    title="Tagline Generator"
    description="Create memorable taglines using the 6 W's Authority Framework."
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
    @regenerate="handleRegenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- STEP 1: Authority Framework -->
      <div class="gmkb-ai-form-section">
        <label class="gmkb-ai-section-label">Step 1: Your Authority Framework</label>

        <!-- Authority Hook (Who, What, When, How) -->
        <div class="gmkb-ai-highlight-box gmkb-ai-highlight-box--blue">
          <div class="gmkb-ai-highlight-header">
            <span class="gmkb-ai-highlight-icon gmkb-ai-highlight-icon--gold">&#9733;</span>
            <h3 class="gmkb-ai-highlight-title">Your Authority Hook</h3>
          </div>
          <div class="gmkb-ai-builder">
            <div class="gmkb-ai-builder__field">
              <label class="gmkb-ai-builder__label">WHO do you help?</label>
              <input
                v-model="hookWho"
                type="text"
                class="gmkb-ai-input"
                placeholder="e.g. SaaS Founders"
              />
            </div>
            <div class="gmkb-ai-builder__field">
              <label class="gmkb-ai-builder__label">WHAT is the result?</label>
              <input
                v-model="hookWhat"
                type="text"
                class="gmkb-ai-input"
                placeholder="e.g. Scale to 7-figures"
              />
            </div>
            <div class="gmkb-ai-builder__field">
              <label class="gmkb-ai-builder__label">WHEN do they need it?</label>
              <input
                v-model="hookWhen"
                type="text"
                class="gmkb-ai-input"
                placeholder="e.g. Feeling plateaued"
              />
            </div>
            <div class="gmkb-ai-builder__field">
              <label class="gmkb-ai-builder__label">HOW do you do it?</label>
              <input
                v-model="hookHow"
                type="text"
                class="gmkb-ai-input"
                placeholder="e.g. 90-day framework"
              />
            </div>
          </div>

          <!-- Live Preview -->
          <div class="gmkb-ai-live-preview">
            "{{ hookPreview }}"
          </div>
        </div>

        <!-- Impact Intro (Where, Why) -->
        <div class="gmkb-ai-highlight-box gmkb-ai-highlight-box--green">
          <div class="gmkb-ai-highlight-header">
            <span class="gmkb-ai-highlight-icon gmkb-ai-highlight-icon--green">&#127919;</span>
            <h3 class="gmkb-ai-highlight-title">Your Impact Intro</h3>
          </div>
          <div class="gmkb-ai-builder gmkb-ai-builder--single">
            <div class="gmkb-ai-builder__field gmkb-ai-builder__field--full">
              <label class="gmkb-ai-builder__label">WHERE is your authority?</label>
              <input
                v-model="impactWhere"
                type="text"
                class="gmkb-ai-input"
                placeholder="e.g. Helped 200+ startups achieve milestones"
              />
            </div>
            <div class="gmkb-ai-builder__field gmkb-ai-builder__field--full">
              <label class="gmkb-ai-builder__label">WHY is this your mission?</label>
              <input
                v-model="impactWhy"
                type="text"
                class="gmkb-ai-input"
                placeholder="e.g. Democratize elite growth strategies"
              />
            </div>
          </div>

          <!-- Live Preview -->
          <div class="gmkb-ai-live-preview gmkb-ai-live-preview--green">
            "{{ impactPreview }}"
          </div>
        </div>
      </div>

      <!-- Settings Row -->
      <div class="gmkb-ai-settings-row">
        <div class="gmkb-ai-form-group gmkb-ai-form-group--half">
          <label class="gmkb-ai-label">Style Focus</label>
          <select v-model="styleFocus" class="gmkb-ai-select">
            <option value="problem">Problem-Focused</option>
            <option value="solution">Solution-Focused</option>
            <option value="outcome">Outcome-Focused</option>
            <option value="authority">Authority-Focused</option>
          </select>
        </div>
        <div class="gmkb-ai-form-group gmkb-ai-form-group--half">
          <label class="gmkb-ai-label">Tone</label>
          <select v-model="tone" class="gmkb-ai-select">
            <option value="bold">Bold & Direct</option>
            <option value="professional">Professional & Polished</option>
            <option value="clever">Conversational & Clever</option>
            <option value="inspirational">Inspirational</option>
          </select>
        </div>
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate 10 Taglines"
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
        <!-- Regenerate with feedback -->
        <div class="gmkb-ai-regenerate-row">
          <span class="gmkb-ai-regenerate-label">
            <i class="fas fa-lightbulb"></i>
            Want different results?
          </span>
          <div class="gmkb-ai-regenerate-input-group">
            <input
              v-model="refinementFeedback"
              type="text"
              class="gmkb-ai-input"
              placeholder="Optional: e.g., 'shorter' or '3 words max'"
              @keydown.enter.prevent="handleRegenerate"
            />
            <button
              type="button"
              class="gmkb-ai-button gmkb-ai-button--primary"
              :disabled="isGenerating"
              @click="handleRegenerate"
            >
              Regenerate
            </button>
          </div>
        </div>

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
import { useAIGenerator } from '../../src/composables/useAIGenerator';
import AiWidgetFrame from '@ai/AiWidgetFrame.vue';
import AiGenerateButton from '@ai/AiGenerateButton.vue';
import AiResultsDisplay from '@ai/AiResultsDisplay.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'standalone'
  },
  componentId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated']);

// Use the AI generator
const generator = useAIGenerator('tagline');

// Authority Hook fields (4 W's)
const hookWho = ref('');
const hookWhat = ref('');
const hookWhen = ref('');
const hookHow = ref('');

// Impact Intro fields (2 W's)
const impactWhere = ref('');
const impactWhy = ref('');

// Settings
const styleFocus = ref('outcome');
const tone = ref('bold');

// Results state
const selectedIndex = ref(0);
const refinementFeedback = ref('');
const previousTaglines = ref([]);

// Computed from generator
const isGenerating = computed(() => generator.isGenerating.value);
const error = computed(() => generator.error.value);
const usageRemaining = ref(null);
const resetTime = ref(null);

/**
 * Computed: Live preview of authority hook
 */
const hookPreview = computed(() => {
  const who = hookWho.value || '[WHO]';
  const what = hookWhat.value || '[WHAT]';
  const when = hookWhen.value || '[WHEN]';
  const how = hookHow.value || '[HOW]';
  return `I help ${who} ${what} ${when} through ${how}.`;
});

/**
 * Computed: Live preview of impact intro
 */
const impactPreview = computed(() => {
  const where = impactWhere.value || '[WHERE]';
  const why = impactWhy.value || '[WHY]';
  return `${where}. My mission is to ${why}.`;
});

/**
 * Computed: Generated authority hook summary
 */
const generatedHookSummary = computed(() => {
  if (!hookWho.value && !hookWhat.value) return '';
  let summary = `I help ${hookWho.value || ''} ${hookWhat.value || ''}`;
  if (hookWhen.value) summary += ` ${hookWhen.value}`;
  if (hookHow.value) summary += ` through ${hookHow.value}`;
  return summary.trim() + '.';
});

/**
 * Computed: Taglines array from generator
 */
const taglines = computed(() => {
  const content = generator.generatedContent.value;
  if (!content) return [];
  if (Array.isArray(content)) {
    return content.map((item) => {
      if (typeof item === 'string') return item;
      return item.text || item;
    });
  }
  return [];
});

/**
 * Has taglines check
 */
const hasTaglines = computed(() => taglines.value.length > 0);

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return (hookWho.value && hookWho.value.trim().length > 0) ||
         (hookWhat.value && hookWhat.value.trim().length > 0);
});

/**
 * Selected tagline
 */
const selectedTagline = computed(() => {
  if (selectedIndex.value >= 0 && selectedIndex.value < taglines.value.length) {
    return taglines.value[selectedIndex.value];
  }
  return null;
});

/**
 * Handle tagline selection
 */
const handleSelectTagline = (index) => {
  selectedIndex.value = index;
};

/**
 * Select previous tagline
 */
const selectPrevious = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--;
  }
};

/**
 * Select next tagline
 */
const selectNext = () => {
  if (selectedIndex.value < taglines.value.length - 1) {
    selectedIndex.value++;
  }
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const params = {
      who: hookWho.value,
      what: hookWhat.value,
      when: hookWhen.value,
      how: hookHow.value,
      where: impactWhere.value,
      why: impactWhy.value,
      styleFocus: styleFocus.value,
      tone: tone.value,
      authorityHook: generatedHookSummary.value,
      count: 10
    };

    await generator.generate(params);
    selectedIndex.value = 0;

    emit('generated', {
      taglines: taglines.value
    });
  } catch (err) {
    console.error('[TaglineWidget] Generation failed:', err);
  }
};

/**
 * Handle regenerate with optional feedback
 */
const handleRegenerate = async () => {
  try {
    const hasFeedback = refinementFeedback.value.trim().length > 0;

    const params = {
      who: hookWho.value,
      what: hookWhat.value,
      when: hookWhen.value,
      how: hookHow.value,
      where: impactWhere.value,
      why: impactWhy.value,
      styleFocus: styleFocus.value,
      tone: tone.value,
      authorityHook: generatedHookSummary.value,
      count: 10
    };

    if (hasFeedback && taglines.value.length > 0) {
      params.previousTaglines = taglines.value;
      params.refinementFeedback = refinementFeedback.value;
      params._refineTimestamp = Date.now();
      await generator.generate(params);
    } else {
      await generator.regenerate();
    }

    selectedIndex.value = 0;
    refinementFeedback.value = '';

    emit('generated', {
      taglines: taglines.value
    });
  } catch (err) {
    console.error('[TaglineWidget] Regeneration failed:', err);
  }
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  if (selectedTagline.value) {
    try {
      await navigator.clipboard.writeText(selectedTagline.value);
    } catch (err) {
      console.error('[TaglineWidget] Copy failed:', err);
    }
  }
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
</script>

<style scoped>
/* Section Label */
.gmkb-ai-section-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--gmkb-ai-text-primary, #0f172a);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Highlight Boxes */
.gmkb-ai-highlight-box {
  background: var(--gmkb-ai-bg, #ffffff);
  border: 1px solid var(--gmkb-ai-border, #e2e8f0);
  border-left: 4px solid var(--gmkb-ai-primary, #3b82f6);
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.gmkb-ai-highlight-box--blue {
  border-left-color: var(--gmkb-ai-primary, #3b82f6);
}

.gmkb-ai-highlight-box--green {
  border-left-color: #10b981;
}

.gmkb-ai-highlight-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gmkb-ai-highlight-icon {
  font-size: 1.125rem;
}

.gmkb-ai-highlight-icon--gold {
  color: #f59e0b;
}

.gmkb-ai-highlight-icon--green {
  color: #10b981;
}

.gmkb-ai-highlight-title {
  font-size: 0.9375rem;
  font-weight: 700;
  margin: 0;
  color: var(--gmkb-ai-text-primary, #0f172a);
}

/* Builder Grid */
.gmkb-ai-builder {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
}

.gmkb-ai-builder--single {
  grid-template-columns: 1fr;
}

.gmkb-ai-builder__field {
  display: flex;
  flex-direction: column;
}

.gmkb-ai-builder__field--full {
  grid-column: span 2;
}

.gmkb-ai-builder__label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--gmkb-ai-text-secondary, #64748b);
  margin-bottom: 6px;
}

/* Live Preview */
.gmkb-ai-live-preview {
  margin-top: 1rem;
  padding: 0.875rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 8px;
  font-style: italic;
  color: var(--gmkb-ai-primary, #3b82f6);
  font-weight: 500;
  text-align: center;
  font-size: 0.875rem;
}

.gmkb-ai-live-preview--green {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #059669;
}

/* Settings Row */
.gmkb-ai-settings-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.gmkb-ai-form-group--half {
  flex: 1;
}

.gmkb-ai-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gmkb-ai-border, #e2e8f0);
  border-radius: 6px;
  font-size: 14px;
  background: var(--gmkb-ai-bg, #ffffff);
  font-family: inherit;
}

/* Regenerate Row */
.gmkb-ai-regenerate-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid var(--gmkb-ai-primary, #3b82f6);
  border-radius: 10px;
  margin-bottom: 1rem;
}

.gmkb-ai-regenerate-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--gmkb-ai-text-primary, #0f172a);
}

.gmkb-ai-regenerate-label i {
  color: #f59e0b;
}

.gmkb-ai-regenerate-input-group {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.gmkb-ai-regenerate-input-group .gmkb-ai-input {
  flex: 1;
}

/* Taglines Results */
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

/* Responsive */
@media (max-width: 640px) {
  .gmkb-ai-builder {
    grid-template-columns: 1fr;
  }

  .gmkb-ai-builder__field--full {
    grid-column: span 1;
  }

  .gmkb-ai-settings-row {
    flex-direction: column;
  }

  .gmkb-ai-regenerate-input-group {
    flex-direction: column;
  }
}
</style>
