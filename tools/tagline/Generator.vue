<template>
  <!-- Standalone Mode: Full two-panel layout with 6 W's Framework -->
  <GeneratorLayout
    v-if="mode === 'default'"
    title="Tagline Generator"
    subtitle="Distill your expertise into a memorable, powerful statement"
    intro-text="Create memorable taglines using the 6 W's Framework. Generate options for your brand, podcast, or course that stick with your audience."
    generator-type="tagline"
    :has-results="hasTaglines"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>

      <!-- Intent Tabs -->
      <div class="generator__intent-tabs">
        <button
          v-for="option in INTENT_OPTIONS"
          :key="option.value"
          type="button"
          class="generator__intent-tab"
          :class="{ 'active': intent === option.value }"
          @click="intent = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <!-- STEP 1: Authority Framework -->
      <div class="generator__section">
        <h3 class="generator__section-title">Step 1: Your Authority Framework</h3>

        <!-- Authority Hook Box -->
        <div class="generator__subsection generator__subsection--authority">
          <div class="generator__subsection-header">
            <span class="generator__subsection-icon generator__subsection-icon--star">★</span>
            <h4 class="generator__subsection-title">Your Authority Hook</h4>
          </div>
          <div class="generator__grid">
            <div class="generator__field">
              <label class="generator__field-label">WHO do you help?</label>
              <input
                v-model="authorityHook.who"
                type="text"
                class="generator__field-input"
                placeholder="e.g. SaaS Founders"
              />
            </div>
            <div class="generator__field">
              <label class="generator__field-label">WHAT do they achieve?</label>
              <input
                v-model="authorityHook.what"
                type="text"
                class="generator__field-input"
                placeholder="e.g. Scale to 7-figures"
              />
            </div>
            <div class="generator__field">
              <label class="generator__field-label">WHEN do they need it?</label>
              <input
                v-model="authorityHook.when"
                type="text"
                class="generator__field-input"
                placeholder="e.g. Feeling plateaued"
              />
            </div>
            <div class="generator__field">
              <label class="generator__field-label">HOW do you deliver?</label>
              <input
                v-model="authorityHook.how"
                type="text"
                class="generator__field-input"
                placeholder="e.g. 90-day framework"
              />
            </div>
          </div>
        </div>

        <!-- Impact Intro Box -->
        <div class="generator__subsection generator__subsection--impact">
          <div class="generator__subsection-header">
            <span class="generator__subsection-icon generator__subsection-icon--target">🎯</span>
            <h4 class="generator__subsection-title">Your Impact Intro</h4>
          </div>
          <div class="generator__field">
            <label class="generator__field-label">WHERE is your authority? (Proof)</label>
            <input
              v-model="impactIntro.where"
              type="text"
              class="generator__field-input"
              placeholder="e.g. Helped 200+ startups achieve milestones"
            />
          </div>
          <div class="generator__field">
            <label class="generator__field-label">WHY is this your mission?</label>
            <input
              v-model="impactIntro.why"
              type="text"
              class="generator__field-input"
              placeholder="e.g. Democratize elite growth strategies"
            />
          </div>
        </div>
      </div>

      <!-- Section Divider -->
      <div class="generator__divider">
        <span>Context & Style</span>
      </div>

      <!-- STEP 2: Brand Context -->
      <div class="generator__section">
        <h3 class="generator__section-title">Step 2: Brand Context</h3>

        <div class="generator__grid">
          <div class="generator__field">
            <label class="generator__field-label">Industry</label>
            <input
              v-model="brandContext.industry"
              type="text"
              class="generator__field-input"
              placeholder="e.g. SaaS, Consulting"
            />
          </div>
          <div class="generator__field">
            <label class="generator__field-label">Unique Factor</label>
            <input
              v-model="brandContext.uniqueFactor"
              type="text"
              class="generator__field-input"
              placeholder="e.g. No-BS approach, Zero-to-One focus"
            />
          </div>
        </div>
        <div class="generator__field">
          <label class="generator__field-label">Existing Taglines (Optional)</label>
          <textarea
            v-model="brandContext.existingTaglines"
            class="generator__field-input generator__field-textarea"
            placeholder="List any slogans you currently use to help the AI improve upon them..."
            rows="2"
          ></textarea>
        </div>
      </div>

      <!-- STEP 3: Tagline Settings -->
      <div class="generator__section">
        <h3 class="generator__section-title">Step 3: Tagline Settings</h3>

        <div class="generator__grid">
          <div class="generator__field">
            <label class="generator__field-label">Style Focus</label>
            <select v-model="styleFocus" class="generator__field-input">
              <option v-for="opt in STYLE_FOCUS_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="generator__field">
            <label class="generator__field-label">Tone</label>
            <select v-model="tone" class="generator__field-input">
              <option v-for="opt in TONE_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
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
          {{ isGenerating ? 'Generating...' : generateButtonText }}
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
            <span class="tagline-generator__card-text">{{ tagline.text || tagline }}</span>
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
    v-else-if="mode === 'integrated'"
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
      <!-- Intent Tabs (Compact) -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Tagline Type</label>
        <select v-model="intent" class="gmkb-ai-input">
          <option v-for="opt in INTENT_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Authority Hook (Compact) -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Who do you help?</label>
        <input
          v-model="authorityHook.who"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., SaaS Founders"
        />
      </div>

      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">What do they achieve?</label>
        <input
          v-model="authorityHook.what"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Scale to 7-figures"
        />
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" :options="TONE_OPTIONS" />

      <!-- Generate Button -->
      <AiGenerateButton
        :text="generateButtonText"
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
          :content="taglines.map(t => t.text || t)"
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

  <!-- Embedded Mode: Landing page form (simplified, used with EmbeddedToolWrapper) -->
  <div v-else class="gmkb-embedded-form">
    <div class="gmkb-embedded-fields">
      <!-- Intent Selection -->
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">Tagline Type</label>
        <select v-model="intent" class="gmkb-embedded-input">
          <option v-for="opt in INTENT_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.who || 'Who do you help?' }} *</label>
        <input
          v-model="authorityHook.who"
          type="text"
          class="gmkb-embedded-input"
          :placeholder="currentIntent?.formPlaceholders?.who || 'e.g., SaaS Founders, Executives'"
        />
      </div>
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.what || 'What do they achieve?' }} *</label>
        <input
          v-model="authorityHook.what"
          type="text"
          class="gmkb-embedded-input"
          :placeholder="currentIntent?.formPlaceholders?.what || 'e.g., Scale to 7-figures, Work-life balance'"
        />
      </div>
    </div>
    <div v-if="error" class="gmkb-embedded-error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useAITagline, STYLE_FOCUS_OPTIONS, TONE_OPTIONS, INTENT_OPTIONS } from '../../src/composables/useAITagline';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

const props = defineProps({
  /**
   * Mode: 'default', 'integrated', or 'embedded'
   */
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated', 'embedded'].includes(v)
  },

  /**
   * Component ID to apply results to (integrated mode)
   */
  componentId: {
    type: String,
    default: null
  },

  intent: {
    type: Object,
    default: null
  },

  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated', 'preview-update', 'update:can-generate']);

// Use composables - destructure all needed state from composable
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
  // Form state from composable (6 W's)
  authorityHook,
  impactIntro,
  brandContext,
  // Settings state from composable
  styleFocus,
  tone,
  intent,
  canGenerate,
  loadFromProfile
} = useAITagline();

const { syncFromStore, loadFromProfileData } = useAuthorityHook();

/**
 * Dynamic button text based on intent
 */
const generateButtonText = computed(() => {
  const count = 10;
  switch (intent.value) {
    case 'podcast':
      return `Generate ${count} Hooks`;
    case 'course':
      return `Generate ${count} Titles`;
    default:
      return `Generate ${count} Taglines`;
  }
});

/**
 * Tagline formula for guidance panel
 */
const taglineFormula = '<span class="generator__highlight">[PROMISE]</span> + <span class="generator__highlight">[DIFFERENTIATION]</span> + <span class="generator__highlight">[BREVITY]</span> = Memorable Tagline';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'The Framework',
    description: 'We use the 6 Ws (Who, What, Where, When, Why, How) to deconstruct your value proposition into its core components.'
  },
  {
    title: 'Brand Context',
    description: 'Adding industry context and unique factors helps the AI avoid generic cliches and create taglines specific to your niche.'
  },
  {
    title: 'Style Focus',
    description: 'Choose between Problem-Focused (pain points), Solution-Focused (what you offer), Outcome-Focused (results), or Authority-Focused (your credentials) to match your audience\'s mindset.'
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
  },
  {
    title: 'Leadership Expert:',
    description: '"Transforming managers into leaders people want to follow."'
  }
];

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
    // Generate uses the reactive state directly from the composable
    await generate({}, context);

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
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Use loadFromProfile from composable to populate 6 W's fields
  loadFromProfile(profileData);

  // Also sync authority hook store
  loadFromProfileData(profileData);
}

/**
 * Sync authority hook from store on mount
 */
onMounted(() => {
  syncFromStore();

  // Load from injected or prop profile data
  if (props.profileData) {
    populateFromProfile(props.profileData);
  }
  if (injectedProfileData.value) {
    populateFromProfile(injectedProfileData.value);
  }
});

/**
 * Watch for injected profile data from EmbeddedToolWrapper
 */
watch(
  injectedProfileData,
  (newData) => {
    if (newData) {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

const currentIntent = computed(() => {
  const found = INTENT_OPTIONS.find(opt => opt.value === intent.value);
  return found || props.intent || null;
});

const embeddedPreviewText = computed(() => {
  if (!authorityHook.who && !authorityHook.what) return null;
  const whoText = authorityHook.who || 'your audience';
  const whatText = authorityHook.what || 'achieve their goals';
  return `<strong>Professional tagline</strong> for helping <strong>${whoText}</strong> ${whatText}`;
});

watch(
  () => props.profileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

watch(
  [() => authorityHook.who, () => authorityHook.what],
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: { who: authorityHook.who, what: authorityHook.what }
      });
    }
  }
);

watch(canGenerate, (newValue) => {
  if (props.mode === 'embedded') {
    emit('update:can-generate', !!newValue);
  }
}, { immediate: true });
</script>

<style scoped>
/* Intent Tabs */
.generator__intent-tabs {
  display: flex;
  border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
  margin-bottom: 24px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  border-radius: var(--mkcg-radius, 8px) var(--mkcg-radius, 8px) 0 0;
  overflow: hidden;
}

.generator__intent-tab {
  flex: 1;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-weight: 600;
  font-size: 14px;
  color: var(--mkcg-text-secondary, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;
}

.generator__intent-tab:hover {
  color: var(--mkcg-text-primary, #0f172a);
  background: rgba(59, 130, 246, 0.05);
}

.generator__intent-tab.active {
  color: var(--mkcg-primary, #3b82f6);
  background: #fff;
  border-bottom-color: var(--mkcg-primary, #3b82f6);
}

/* Sections */
.generator__section {
  margin-bottom: var(--mkcg-space-lg, 24px);
}

.generator__section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Grid Layout */
.generator__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .generator__grid {
    grid-template-columns: 1fr;
  }
}

/* Subsection Boxes (Authority Hook & Impact Intro) */
.generator__subsection {
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.generator__subsection--authority {
  border-left: 4px solid #f59e0b;
}

.generator__subsection--impact {
  border-left: 4px solid #10b981;
}

.generator__subsection-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.generator__subsection-icon {
  font-size: 16px;
}

.generator__subsection-icon--star {
  color: #f59e0b;
}

.generator__subsection-icon--target {
  color: #10b981;
}

.generator__subsection-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--mkcg-text-primary, #0f172a);
}

/* Section Divider */
.generator__divider {
  height: 1px;
  background: var(--mkcg-border, #e2e8f0);
  margin: 32px 0;
  position: relative;
}

.generator__divider span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 0 16px;
  font-size: 11px;
  font-weight: 800;
  color: var(--mkcg-text-secondary, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Fields */
.generator__field {
  margin-bottom: 12px;
}

.generator__field:last-child {
  margin-bottom: 0;
}

.generator__field-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--mkcg-text-secondary, #64748b);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.generator__field-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: #fff;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.generator__field-input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.generator__field-input::placeholder {
  color: var(--mkcg-text-light, #94a3b8);
}

.generator__field-textarea {
  resize: vertical;
  min-height: 60px;
}

/* Actions */
.generator__actions {
  margin-top: var(--mkcg-space-lg, 30px);
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
  padding: var(--mkcg-space-md, 16px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 2px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  cursor: pointer;
  transition: var(--mkcg-transition-fast, 0.15s ease);
  text-align: left;
  width: 100%;
}

.tagline-generator__card:hover {
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.tagline-generator__card--selected {
  border-color: var(--mkcg-primary, #3b82f6);
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
  background: var(--mkcg-primary, #3b82f6);
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
  color: var(--mkcg-primary, #3b82f6);
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

/* Integrated Mode Styles */
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

/* Embedded Mode Styles (for landing page) */
.gmkb-embedded-form { width: 100%; }
.gmkb-embedded-fields { display: flex; flex-direction: column; gap: 20px; }
.gmkb-embedded-field { display: flex; flex-direction: column; }
.gmkb-embedded-label { display: block; font-weight: 600; font-size: 13px; margin-bottom: 8px; color: var(--mkcg-text-primary, #0f172a); }
.gmkb-embedded-input { width: 100%; padding: 14px; border: 1px solid var(--mkcg-border, #e2e8f0); border-radius: 8px; background: var(--mkcg-bg-secondary, #f9fafb); box-sizing: border-box; font-size: 15px; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; }
.gmkb-embedded-input:focus { outline: none; border-color: var(--mkcg-primary, #3b82f6); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.gmkb-embedded-input::placeholder { color: var(--mkcg-text-light, #94a3b8); }
.gmkb-embedded-textarea { resize: vertical; min-height: 80px; }
.gmkb-embedded-error { margin-top: 16px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 14px; }
</style>
