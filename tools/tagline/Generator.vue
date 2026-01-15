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
      <div class="tagline-results">
        <div class="tagline-results__layout">

          <!-- SIDEBAR: Master Tagline Slot -->
          <aside class="tagline-results__sidebar">
            <div class="tagline-master-slot">
              <div class="tagline-master-slot__header">
                <h3 class="tagline-master-slot__title">Your Master Tagline</h3>
              </div>

              <div
                class="tagline-master-slot__card"
                :class="{ 'tagline-master-slot__card--locked': lockedTagline }"
              >
                <div class="tagline-master-slot__card-header">
                  <span class="tagline-master-slot__label">
                    {{ lockedTagline ? 'Active Tagline' : 'Select a Tagline' }}
                  </span>
                  <svg v-if="lockedTagline" class="tagline-master-slot__lock" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                  </svg>
                </div>
                <div class="tagline-master-slot__preview">
                  {{ lockedTagline || selectedTagline || 'Click a tagline below to preview it here' }}
                </div>
              </div>

              <p class="tagline-master-slot__hint">
                This tagline will be used across your Media Kit and bio variations.
              </p>
            </div>
          </aside>

          <!-- MAIN: Tagline List -->
          <main class="tagline-results__main">
            <div class="tagline-results__header">
              <h3 class="tagline-results__title">{{ taglines.length }} AI Generated Ideas</h3>
              <div class="tagline-results__actions">
                <button
                  type="button"
                  class="generator__button generator__button--outline"
                  @click="handleGenerate"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                  </svg>
                  Regenerate
                </button>
              </div>
            </div>

            <!-- Refinement Loop Box -->
            <div class="tagline-refinement">
              <div class="tagline-refinement__header">
                <svg class="tagline-refinement__icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span class="tagline-refinement__title">Refine Taglines</span>
              </div>
              <div class="tagline-refinement__input-wrapper">
                <textarea
                  v-model="refinementFeedback"
                  class="tagline-refinement__textarea"
                  rows="1"
                  placeholder="e.g. Make them shorter or more focused on the 90-day timeline..."
                ></textarea>
                <button
                  type="button"
                  class="tagline-refinement__btn"
                  :disabled="!refinementFeedback.trim() || isGenerating"
                  @click="handleRefine"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                  </svg>
                  Refine
                </button>
              </div>
            </div>

            <!-- Tagline Row List -->
            <div class="tagline-list">
              <button
                v-for="(tagline, index) in taglines"
                :key="index"
                type="button"
                class="tagline-row"
                :class="{
                  'tagline-row--selected': selectedIndex === index,
                  'tagline-row--locked': lockedTaglineIndex === index
                }"
                @click="handleSelectTagline(index)"
              >
                <div class="tagline-row__checkbox" :class="{ 'tagline-row__checkbox--checked': selectedIndex === index }">
                  <svg v-if="selectedIndex === index" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="3" fill="none"/>
                  </svg>
                </div>
                <p class="tagline-row__text">{{ tagline.text }}</p>
                <button
                  v-if="selectedIndex === index && !lockedTagline"
                  type="button"
                  class="tagline-row__lock-btn"
                  title="Lock as Master Tagline"
                  @click.stop="handleLockTagline(index)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </button>
                <svg v-if="lockedTaglineIndex === index" class="tagline-row__locked-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                </svg>
              </button>
            </div>

            <!-- Footer Actions -->
            <div class="tagline-results__footer">
              <button
                type="button"
                class="generator__button generator__button--call-to-action"
                :disabled="!selectedTagline && !lockedTagline"
                @click="handleSaveToProfile"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Tagline to Profile
              </button>
              <button
                type="button"
                class="generator__button generator__button--ghost"
                @click="handleStartOver"
              >
                Start Over
              </button>
            </div>
          </main>
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
          :content="taglines.map(t => t.text)"
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
  loadFromProfile,
  // Locking & refinement
  lockedTagline,
  lockedTaglineIndex,
  lockTagline,
  unlockTagline,
  refine,
  refinementFeedback,
  reset
} = useAITagline();

const { syncFromStore, loadFromProfileData } = useAuthorityHook();

/**
 * The number of items to generate.
 */
const GENERATION_COUNT = 10;

/**
 * Dynamic button text based on intent
 */
const generateButtonText = computed(() => {
  switch (intent.value) {
    case 'podcast':
      return `Generate ${GENERATION_COUNT} Hooks`;
    case 'course':
      return `Generate ${GENERATION_COUNT} Titles`;
    default:
      return `Generate ${GENERATION_COUNT} Taglines`;
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
 * Handle refine button click
 */
const handleRefine = async () => {
  if (!refinementFeedback.value?.trim()) return;
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await refine(refinementFeedback.value, context);
    emit('generated', { taglines: taglines.value });
  } catch (err) {
    console.error('[TaglineGenerator] Refinement failed:', err);
  }
};

/**
 * Handle locking a tagline as master
 */
const handleLockTagline = (index) => {
  lockTagline(index);
};

/**
 * Handle save to profile
 */
const handleSaveToProfile = () => {
  const taglineToSave = lockedTagline.value || selectedTagline.value;
  if (taglineToSave) {
    emit('applied', {
      componentId: props.componentId,
      tagline: taglineToSave,
      allTaglines: taglines.value,
      action: 'save'
    });
  }
};

/**
 * Handle start over - reset all state
 */
const handleStartOver = () => {
  reset();
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

  // Load from injected or prop profile data. Props take precedence.
  const profileToLoad = props.profileData || injectedProfileData.value;
  if (profileToLoad) {
    populateFromProfile(profileToLoad);
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

/* ===========================================
   TAGLINE RESULTS - Sidebar + Main Layout
   =========================================== */
.tagline-results {
  padding: 0;
}

.tagline-results__layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 32px;
}

@media (min-width: 900px) {
  .tagline-results__layout {
    flex-direction: row;
    align-items: flex-start;
  }
  .tagline-results__sidebar {
    position: sticky;
    top: 1rem;
    flex: 0 0 280px;
  }
  .tagline-results__main {
    flex: 1;
    min-width: 0;
  }
}

/* Sidebar: Master Tagline Slot */
.tagline-master-slot {
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 12px;
  padding: 1.25rem;
}

.tagline-master-slot__header {
  margin-bottom: 1rem;
}

.tagline-master-slot__title {
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0;
  letter-spacing: 0.5px;
}

.tagline-master-slot__card {
  padding: 1.25rem;
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  transition: all 0.2s;
}

.tagline-master-slot__card--locked {
  background: var(--mkcg-primary-light, #eff6ff);
  border-color: var(--mkcg-primary, #3b82f6);
}

.tagline-master-slot__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tagline-master-slot__label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--mkcg-text-secondary, #64748b);
}

.tagline-master-slot__card--locked .tagline-master-slot__label {
  color: var(--mkcg-primary, #3b82f6);
}

.tagline-master-slot__lock {
  color: var(--mkcg-primary, #3b82f6);
}

.tagline-master-slot__preview {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--mkcg-text-primary, #0f172a);
}

.tagline-master-slot__hint {
  font-size: 11px;
  color: var(--mkcg-text-muted, #94a3b8);
  margin-top: 15px;
  font-style: italic;
  text-align: center;
  margin-bottom: 0;
}

/* Main Area Header */
.tagline-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
}

.tagline-results__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--mkcg-text-primary, #0f172a);
}

.tagline-results__actions {
  display: flex;
  gap: 8px;
}

/* Refinement Loop Box */
.tagline-refinement {
  background: linear-gradient(to bottom right, #fff, var(--mkcg-bg-secondary, #f8fafc));
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 1.5rem;
}

.tagline-refinement__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tagline-refinement__icon {
  color: var(--mkcg-primary, #3b82f6);
}

.tagline-refinement__title {
  font-size: 13px;
  font-weight: 800;
  color: var(--mkcg-primary, #3b82f6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tagline-refinement__input-wrapper {
  position: relative;
}

.tagline-refinement__textarea {
  width: 100%;
  padding: 14px 110px 14px 16px;
  border: 2px solid var(--mkcg-border, #e2e8f0);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  background: #fff;
  box-sizing: border-box;
  resize: none;
  transition: border-color 0.2s;
}

.tagline-refinement__textarea:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
}

.tagline-refinement__btn {
  position: absolute;
  right: 6px;
  top: 6px;
  bottom: 6px;
  padding: 0 16px;
  background: var(--mkcg-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}

.tagline-refinement__btn:hover:not(:disabled) {
  background: var(--mkcg-primary-hover, #2563eb);
}

.tagline-refinement__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tagline Row List */
.tagline-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tagline-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
}

.tagline-row:hover {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-bg-secondary, #f8fafc);
}

.tagline-row--selected {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-primary-light, #eff6ff);
}

.tagline-row--locked {
  border-color: var(--mkcg-primary, #3b82f6);
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.tagline-row__checkbox {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid var(--mkcg-border, #e2e8f0);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.tagline-row__checkbox--checked {
  background: var(--mkcg-primary, #3b82f6);
  border-color: var(--mkcg-primary, #3b82f6);
  color: white;
}

.tagline-row__text {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0;
  line-height: 1.4;
}

.tagline-row__lock-btn {
  flex-shrink: 0;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 6px;
  cursor: pointer;
  color: var(--mkcg-text-secondary, #64748b);
  transition: all 0.15s;
  display: flex;
  align-items: center;
}

.tagline-row__lock-btn:hover {
  background: var(--mkcg-primary, #3b82f6);
  border-color: var(--mkcg-primary, #3b82f6);
  color: white;
}

.tagline-row__locked-icon {
  flex-shrink: 0;
  color: var(--mkcg-primary, #3b82f6);
}

/* Results Footer */
.tagline-results__footer {
  margin-top: 2rem;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
  padding-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* Ghost button variant */
.generator__button--ghost {
  background: transparent;
  border: none;
  color: var(--mkcg-text-secondary, #64748b);
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}

.generator__button--ghost:hover {
  color: var(--mkcg-text-primary, #0f172a);
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
