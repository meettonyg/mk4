<template>
  <!-- Standalone Mode: Full two-panel layout with results dashboard -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Tagline Generator"
    subtitle="Distill your expertise into a memorable, powerful statement that sticks with your audience."
    intro-text="Generate 10 compelling taglines based on your Authority Framework. Each tagline is crafted to be memorable, concise, and aligned with your brand voice."
    generator-type="tagline"
    :has-results="hasTaglines"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form (shown when no results) -->
    <template #left>
      <div v-if="!hasTaglines" class="gfy-tagline-form">
        <!-- Trust Strip -->
        <div class="gfy-trust-strip">
          <div class="gfy-trust-item"><span class="gfy-trust-check">&#10003;</span> 10 Unique Options</div>
          <div class="gfy-trust-item"><span class="gfy-trust-check">&#10003;</span> Memorability Focused</div>
          <div class="gfy-trust-item"><span class="gfy-trust-check">&#10003;</span> Syncs with Profile</div>
        </div>

        <!-- Intent Tabs -->
        <div class="gmkb-intent-tabs">
          <button
            v-for="opt in INTENT_OPTIONS"
            :key="opt.value"
            type="button"
            class="gmkb-intent-tab"
            :class="{ active: intent === opt.value }"
            @click="setIntent(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- STEP 1: Authority Framework -->
        <div class="gfy-input-group">
          <label class="gfy-label">Step 1: Your Authority Framework</label>

          <!-- Authority Hook (Who, What, When, How) -->
          <div class="gfy-highlight-box gfy-highlight-box--blue">
            <div class="gfy-highlight-box__header">
              <span class="gfy-highlight-box__icon gfy-highlight-box__icon--gold">&#9733;</span>
              <h3 class="gfy-highlight-box__title">Your Authority Hook</h3>
            </div>
            <div class="gfy-builder">
              <div class="gfy-builder__field">
                <label class="gfy-builder__label">WHO</label>
                <input
                  v-model="authorityHook.who"
                  type="text"
                  class="gfy-builder__input"
                  placeholder="e.g. SaaS Founders"
                />
              </div>
              <div class="gfy-builder__field">
                <label class="gfy-builder__label">WHAT</label>
                <input
                  v-model="authorityHook.what"
                  type="text"
                  class="gfy-builder__input"
                  placeholder="e.g. Scale to 7-figures"
                />
              </div>
              <div class="gfy-builder__field">
                <label class="gfy-builder__label">WHEN</label>
                <input
                  v-model="authorityHook.when"
                  type="text"
                  class="gfy-builder__input"
                  placeholder="e.g. Feeling plateaued"
                />
              </div>
              <div class="gfy-builder__field">
                <label class="gfy-builder__label">HOW</label>
                <input
                  v-model="authorityHook.how"
                  type="text"
                  class="gfy-builder__input"
                  placeholder="e.g. 90-day framework"
                />
              </div>
            </div>
          </div>

          <!-- Impact Intro (Where, Why) -->
          <div class="gfy-highlight-box gfy-highlight-box--green">
            <div class="gfy-highlight-box__header">
              <span class="gfy-highlight-box__icon gfy-highlight-box__icon--green">&#127919;</span>
              <h3 class="gfy-highlight-box__title">Your Impact Intro</h3>
            </div>
            <div class="gfy-builder">
              <div class="gfy-builder__field gfy-builder__field--full">
                <label class="gfy-builder__label">WHERE is your authority?</label>
                <input
                  v-model="impactIntro.where"
                  type="text"
                  class="gfy-builder__input"
                  placeholder="e.g. Helped 200+ startups achieve milestones"
                />
              </div>
              <div class="gfy-builder__field gfy-builder__field--full">
                <label class="gfy-builder__label">WHY is this your mission?</label>
                <input
                  v-model="impactIntro.why"
                  type="text"
                  class="gfy-builder__input"
                  placeholder="e.g. Democratize elite growth strategies"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Section Divider -->
        <div class="gfy-section-divider">
          <span>Context & Style</span>
        </div>

        <!-- STEP 2: Brand Context -->
        <div class="gfy-input-group">
          <label class="gfy-label">Step 2: Brand Context</label>
          <div class="gfy-builder">
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">Industry</label>
              <input
                v-model="brandContext.industry"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g. SaaS, Consulting"
              />
            </div>
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">Unique Factor</label>
              <input
                v-model="brandContext.uniqueFactor"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g. No-BS approach, Zero-to-One focus"
              />
            </div>
            <div class="gfy-builder__field gfy-builder__field--full">
              <label class="gfy-builder__label">Existing Taglines (Optional)</label>
              <textarea
                v-model="brandContext.existingTaglines"
                class="gfy-textarea"
                rows="2"
                placeholder="List any slogans you currently use..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- STEP 3: Settings -->
        <div class="gfy-input-group">
          <label class="gfy-label">Step 3: Tagline Settings</label>
          <div class="gfy-builder">
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">Style Focus</label>
              <select v-model="styleFocus" class="gfy-select">
                <option v-for="opt in STYLE_FOCUS_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">Tone</label>
              <select v-model="tone" class="gfy-select">
                <option v-for="opt in TONE_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Generate Button -->
        <button
          type="button"
          class="gmkb-btn-generate"
          :class="{ 'gmkb-btn-generate--loading': isGenerating }"
          :disabled="!canGenerate || isGenerating"
          @click="handleGenerate"
        >
          <span v-if="!isGenerating" class="gmkb-btn-icon">&#10024;</span>
          {{ isGenerating ? 'Generating...' : 'Generate 10 Taglines' }}
        </button>

        <!-- Error Display -->
        <div v-if="error" class="gfy-error">
          <p>{{ error }}</p>
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleGenerate">
            Try Again
          </button>
        </div>
      </div>
    </template>

    <!-- Right Panel: Guidance (shown when no results) -->
    <template #right>
      <GuidancePanel
        v-if="!hasTaglines"
        title="Crafting Your Perfect Tagline"
        subtitle="A powerful tagline distills your Authority Hook into a memorable phrase that sticks in people's minds."
        :formula="taglineFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Taglines:"
      />
    </template>

    <!-- Results Dashboard -->
    <template #results>
      <div class="gfy-results-layout">
        <!-- Sidebar: Master Tagline Slot -->
        <aside class="gfy-layout-sidebar">
          <div class="gfy-current-topics">
            <div class="gfy-sidebar-header">
              <h3 class="gfy-sidebar-title">Your Master Tagline</h3>
            </div>

            <div
              class="gfy-bio-slot"
              :class="{ 'gfy-bio-slot--locked': lockedTagline }"
            >
              <div class="gfy-bio-slot__header">
                <span class="gfy-bio-slot__label">{{ lockedTagline ? 'Active Tagline' : 'Not Selected' }}</span>
                <svg v-if="lockedTagline" class="gfy-bio-slot__lock" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <div class="gfy-bio-slot__preview">
                {{ lockedTagline || 'Select a tagline to lock it here' }}
              </div>
            </div>

            <p class="gfy-sidebar-hint">
              This tagline will be used across your Media Kit and bio variations.
            </p>

            <!-- Actions for locked tagline -->
            <div v-if="lockedTagline" class="gfy-sidebar-actions">
              <button
                type="button"
                class="gfy-btn gfy-btn--outline gfy-btn--small"
                @click="handleCopy"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </button>
              <button
                type="button"
                class="gfy-btn gfy-btn--ghost gfy-btn--small"
                @click="unlockTagline"
              >
                Unlock
              </button>
            </div>
          </div>
        </aside>

        <!-- Main: Tagline Variations -->
        <main class="gfy-layout-main">
          <div class="gfy-results__header">
            <h3 class="gfy-results__title">10 AI Generated Ideas</h3>
            <div class="gfy-results__actions">
              <button
                type="button"
                class="gfy-btn gfy-btn--outline"
                :disabled="isGenerating"
                @click="handleRegenerate"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Regenerate
              </button>
            </div>
          </div>

          <!-- Refinement Box -->
          <div class="gfy-refinement-box">
            <div class="gfy-refinement-header">
              <svg class="gfy-refinement-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a.996.996 0 0 0-1.41 0L1.29 18.96a.996.996 0 0 0 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05a.996.996 0 0 0 0-1.41l-2.33-2.35z"/>
              </svg>
              <span class="gfy-refinement-title">Refine Taglines</span>
            </div>
            <div class="gfy-refinement-input-wrapper">
              <textarea
                v-model="refinementFeedback"
                class="gfy-refinement-textarea"
                rows="1"
                placeholder="e.g. Make them shorter or more focused on the 90-day timeline..."
                @keydown.enter.prevent="handleRefine"
              ></textarea>
              <button
                type="button"
                class="gfy-btn-refine"
                :disabled="!refinementFeedback.trim() || isGenerating"
                @click="handleRefine"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Refine
              </button>
            </div>
          </div>

          <!-- Tagline List -->
          <div class="gfy-tagline-list">
            <div
              v-for="(tagline, index) in taglines"
              :key="index"
              class="gfy-tagline-row"
              :class="{
                'gfy-tagline-row--selected': selectedIndex === index,
                'gfy-tagline-row--locked': lockedTaglineIndex === index
              }"
              @click="handleSelectTagline(index)"
            >
              <div
                class="gfy-tagline-row__checkbox"
                :class="{ 'gfy-tagline-row__checkbox--checked': selectedIndex === index || lockedTaglineIndex === index }"
              >
                <svg v-if="selectedIndex === index || lockedTaglineIndex === index" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p class="gfy-tagline-row__text">{{ tagline.text }}</p>
              <button
                v-if="selectedIndex === index && lockedTaglineIndex !== index"
                type="button"
                class="gfy-btn gfy-btn--primary gfy-btn--small"
                @click.stop="lockTagline(index)"
              >
                Lock
              </button>
              <svg v-if="lockedTaglineIndex === index" class="gfy-tagline-row__lock-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="gfy-results-footer">
            <button
              type="button"
              class="gfy-btn gfy-btn--primary gfy-btn--large"
              :disabled="!lockedTagline"
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
              class="gfy-btn gfy-btn--ghost"
              @click="handleStartOver"
            >
              Start Over
            </button>
          </div>
        </main>
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
      <!-- Authority Hook Fields -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Who do you help?</label>
        <input
          v-model="authorityHook.who"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., SaaS founders, entrepreneurs..."
        />
      </div>

      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">What do you help them achieve?</label>
        <input
          v-model="authorityHook.what"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., scale to 7-figures, build sustainable businesses..."
        />
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" :options="TONE_OPTIONS" />

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
        <p class="gmkb-ai-taglines__instruction">
          Click a tagline to select it:
        </p>
        <AiResultsDisplay
          :content="taglinesText"
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

  <!-- Embedded Mode: Landing page form (simplified) -->
  <div v-else class="gmkb-embedded-form">
    <div class="gmkb-embedded-fields">
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.name || 'Your Name or Brand' }} *</label>
        <input
          v-model="authorityHook.who"
          type="text"
          class="gmkb-embedded-input"
          :placeholder="currentIntent?.formPlaceholders?.name || 'e.g., SaaS Founders'"
        />
      </div>
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.background || 'What you help them achieve' }}</label>
        <textarea
          v-model="authorityHook.what"
          class="gmkb-embedded-input gmkb-embedded-textarea"
          :placeholder="currentIntent?.formPlaceholders?.background || 'e.g., Scale to 7-figures in 90 days...'"
          rows="2"
        ></textarea>
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
  mode: {
    type: String,
    default: 'standalone',
    validator: (v) => ['standalone', 'integrated', 'embedded'].includes(v)
  },
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

// Use composables
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  taglines,
  taglinesText,
  hasTaglines,
  selectedTagline,
  selectedIndex,
  lockedTagline,
  lockedTaglineIndex,
  refinementFeedback,
  authorityHook,
  impactIntro,
  brandContext,
  styleFocus,
  tone,
  intent,
  canGenerate,
  generate,
  refine,
  selectTagline,
  lockTagline,
  unlockTagline,
  selectNext,
  selectPrevious,
  copyToClipboard,
  setIntent,
  loadFromProfile,
  reset
} = useAITagline();

const { syncFromStore, loadFromProfileData } = useAuthorityHook();

/**
 * Tagline formula for guidance panel
 */
const taglineFormula = '<span class="generator__highlight">[WHO]</span> + <span class="generator__highlight">[WHAT]</span> + <span class="generator__highlight">[UNIQUE VALUE]</span> = Memorable Tagline';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Taglines Matter',
    description: 'A great tagline is your brand\'s first impression distilled into a single memorable phrase. It appears everywhere - your website header, social media profiles, business cards, and email signatures.'
  },
  {
    title: 'What Makes Taglines Stick',
    description: 'The best taglines are concise (5-10 words), unique to you, benefit-focused (what clients gain), and emotionally resonant. They combine your promise with what makes you different.'
  },
  {
    title: 'Where to Use Your Tagline',
    description: 'Your tagline should appear consistently: website headers, email signatures, social media bios, LinkedIn headlines, business cards, podcast intros, and marketing materials.'
  }
];

/**
 * Example taglines for guidance panel
 */
const examples = [
  {
    title: 'Problem-Focused:',
    description: '"Stop Leaking Revenue. Start Scaling Sustainably."'
  },
  {
    title: 'Outcome-Focused:',
    description: '"Turning Overwhelmed Owners Into Strategic CEOs"'
  },
  {
    title: 'Authority-Focused:',
    description: '"The 90-Day Blueprint for SaaS Growth"'
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
    await generate({}, context);

    emit('generated', {
      taglines: taglinesText.value
    });
  } catch (err) {
    console.error('[TaglineGenerator] Generation failed:', err);
  }
};

/**
 * Handle regenerate
 */
const handleRegenerate = async () => {
  await handleGenerate();
};

/**
 * Handle refine button click
 */
const handleRefine = async () => {
  if (!refinementFeedback.value.trim()) return;

  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await refine(refinementFeedback.value, context);

    emit('generated', {
      taglines: taglinesText.value,
      refined: true
    });
  } catch (err) {
    console.error('[TaglineGenerator] Refinement failed:', err);
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
    tagline: lockedTagline.value || selectedTagline.value,
    allTaglines: taglinesText.value
  });
};

/**
 * Handle save to profile
 */
const handleSaveToProfile = () => {
  emit('applied', {
    tagline: lockedTagline.value,
    action: 'save'
  });
};

/**
 * Handle start over
 */
const handleStartOver = () => {
  reset();
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;
  loadFromProfile(profileData);
  loadFromProfileData(profileData);
}

/**
 * Sync authority hook from store on mount
 */
onMounted(() => {
  syncFromStore();
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

const currentIntent = computed(() => props.intent || null);

const embeddedPreviewText = computed(() => {
  if (!authorityHook.who) return null;
  return `<strong>Professional tagline</strong> for <strong>${authorityHook.who}</strong>`;
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
  () => authorityHook.who,
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: { who: authorityHook.who }
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
/* ============================================================================
   TAGLINE GENERATOR - FORM STYLES
   Following gmkb- and gfy- naming conventions
   ============================================================================ */

/* Trust Strip */
.gfy-trust-strip {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
  color: var(--mkcg-text-secondary, #64748b);
  font-size: 14px;
  font-weight: 500;
}

.gfy-trust-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gfy-trust-check {
  color: var(--mkcg-success, #16a34a);
  font-weight: 700;
}

/* Intent Tabs */
.gmkb-intent-tabs {
  display: flex;
  background: var(--mkcg-bg-secondary, #f9fafb);
  border-radius: 8px;
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  margin-bottom: 24px;
  overflow: hidden;
}

.gmkb-intent-tab {
  flex: 1;
  padding: 16px 20px;
  text-align: center;
  background: transparent;
  border: none;
  border-right: 1px solid var(--mkcg-border-light, #e2e8f0);
  cursor: pointer;
  font-weight: 600;
  color: var(--mkcg-text-secondary, #64748b);
  transition: all 0.2s;
  font-size: 14px;
  font-family: inherit;
}

.gmkb-intent-tab:last-child {
  border-right: none;
}

.gmkb-intent-tab:hover {
  background: var(--mkcg-bg-primary, #ffffff);
}

.gmkb-intent-tab.active {
  background: var(--mkcg-bg-primary, #ffffff);
  color: var(--mkcg-primary, #3b82f6);
  border-bottom: 3px solid var(--mkcg-primary, #3b82f6);
}

/* Input Groups */
.gfy-input-group {
  margin-bottom: 2rem;
}

.gfy-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--mkcg-text-primary, #0f172a);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Highlight Boxes */
.gfy-highlight-box {
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-left: 4px solid var(--mkcg-primary, #3b82f6);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.gfy-highlight-box--blue {
  border-left-color: var(--mkcg-primary, #3b82f6);
}

.gfy-highlight-box--green {
  border-left-color: #10b981;
}

.gfy-highlight-box__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gfy-highlight-box__icon {
  font-size: 1.25rem;
}

.gfy-highlight-box__icon--gold {
  color: #f59e0b;
}

.gfy-highlight-box__icon--green {
  color: #10b981;
}

.gfy-highlight-box__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--mkcg-text-primary, #0f172a);
}

/* Builder Grid */
.gfy-builder {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.gfy-builder__field {
  display: flex;
  flex-direction: column;
}

.gfy-builder__field--full {
  grid-column: span 2;
}

.gfy-builder__label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--mkcg-text-secondary, #64748b);
  margin-bottom: 6px;
}

.gfy-builder__input,
.gfy-select,
.gfy-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 6px;
  font-size: 14px;
  background: var(--mkcg-bg-primary, #ffffff);
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-builder__input:focus,
.gfy-select:focus,
.gfy-textarea:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gfy-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Section Divider */
.gfy-section-divider {
  height: 1px;
  background: var(--mkcg-border-light, #e2e8f0);
  margin: 2.5rem 0;
  position: relative;
}

.gfy-section-divider span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--mkcg-bg-primary, #ffffff);
  padding: 0 15px;
  font-size: 11px;
  font-weight: 800;
  color: var(--mkcg-text-secondary, #64748b);
  text-transform: uppercase;
}

/* Generate Button */
.gmkb-btn-generate {
  width: 100%;
  padding: 18px;
  background: var(--mkcg-primary, #3b82f6);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: inherit;
  transition: background 0.2s;
}

.gmkb-btn-generate:hover:not(:disabled) {
  background: var(--mkcg-primary-dark, #2563eb);
}

.gmkb-btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gmkb-btn-generate--loading {
  opacity: 0.8;
}

.gmkb-btn-icon {
  font-size: 1.25rem;
}

/* Error Display */
.gfy-error {
  margin-top: 20px;
  padding: 20px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  text-align: center;
}

.gfy-error p {
  color: #991b1b;
  margin: 0 0 12px 0;
}

/* ============================================================================
   RESULTS LAYOUT
   ============================================================================ */

.gfy-results-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 40px;
}

@media (min-width: 900px) {
  .gfy-results-layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .gfy-layout-sidebar {
    position: sticky;
    top: 1rem;
    flex: 0 0 300px;
  }

  .gfy-layout-main {
    flex: 1;
    min-width: 0;
  }
}

/* Sidebar */
.gfy-current-topics {
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 12px;
  padding: 1.25rem;
}

.gfy-sidebar-header {
  margin-bottom: 1rem;
}

.gfy-sidebar-title {
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0;
}

.gfy-bio-slot {
  padding: 1.25rem;
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 8px;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.gfy-bio-slot--locked {
  background: rgba(59, 130, 246, 0.05);
  border-color: var(--mkcg-primary, #3b82f6);
}

.gfy-bio-slot__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.gfy-bio-slot__label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--mkcg-text-secondary, #64748b);
}

.gfy-bio-slot--locked .gfy-bio-slot__label {
  color: var(--mkcg-primary, #3b82f6);
}

.gfy-bio-slot__lock {
  color: var(--mkcg-primary, #3b82f6);
}

.gfy-bio-slot__preview {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--mkcg-text-primary, #0f172a);
}

.gfy-sidebar-hint {
  font-size: 11px;
  color: var(--mkcg-text-tertiary, #94a3b8);
  margin-top: 15px;
  font-style: italic;
  text-align: center;
}

.gfy-sidebar-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

/* Main Area */
.gfy-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--mkcg-border-light, #e2e8f0);
}

.gfy-results__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.gfy-results__actions {
  display: flex;
  gap: 8px;
}

/* Refinement Box */
.gfy-refinement-box {
  background: linear-gradient(to bottom right, var(--mkcg-bg-primary, #ffffff), var(--mkcg-bg-secondary, #f8fafc));
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 2rem;
}

.gfy-refinement-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.gfy-refinement-icon {
  color: var(--mkcg-primary, #3b82f6);
}

.gfy-refinement-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--mkcg-primary, #3b82f6);
  text-transform: uppercase;
}

.gfy-refinement-input-wrapper {
  position: relative;
}

.gfy-refinement-textarea {
  width: 100%;
  padding: 14px 110px 14px 16px;
  border: 2px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  background: var(--mkcg-bg-primary, #ffffff);
  box-sizing: border-box;
  resize: none;
  transition: border-color 0.2s;
}

.gfy-refinement-textarea:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
}

.gfy-btn-refine {
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
  font-family: inherit;
  transition: background 0.2s;
}

.gfy-btn-refine:hover:not(:disabled) {
  background: var(--mkcg-primary-dark, #2563eb);
}

.gfy-btn-refine:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tagline List */
.gfy-tagline-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gfy-tagline-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.gfy-tagline-row:hover {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-bg-secondary, #f8fafc);
}

.gfy-tagline-row--selected {
  border-color: var(--mkcg-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
}

.gfy-tagline-row--locked {
  border-color: var(--mkcg-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.1);
}

.gfy-tagline-row__checkbox {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.gfy-tagline-row__checkbox--checked {
  background: var(--mkcg-primary, #3b82f6);
  border-color: var(--mkcg-primary, #3b82f6);
  color: white;
}

.gfy-tagline-row__text {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0;
}

.gfy-tagline-row__lock-icon {
  color: var(--mkcg-primary, #3b82f6);
}

/* Buttons */
.gfy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  font-family: inherit;
  transition: all 0.15s;
}

.gfy-btn--primary {
  background: var(--mkcg-primary, #3b82f6);
  color: white;
  border: none;
}

.gfy-btn--primary:hover:not(:disabled) {
  background: var(--mkcg-primary-dark, #2563eb);
}

.gfy-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gfy-btn--outline {
  background: var(--mkcg-bg-primary, #ffffff);
  color: var(--mkcg-text-secondary, #64748b);
}

.gfy-btn--outline:hover {
  background: var(--mkcg-bg-secondary, #f8fafc);
  border-color: var(--mkcg-primary, #3b82f6);
  color: var(--mkcg-primary, #3b82f6);
}

.gfy-btn--ghost {
  background: transparent;
  border: none;
  color: var(--mkcg-text-secondary, #64748b);
}

.gfy-btn--ghost:hover {
  color: var(--mkcg-text-primary, #0f172a);
}

.gfy-btn--small {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.gfy-btn--large {
  padding: 12px 24px;
  font-size: 1rem;
}

/* Footer */
.gfy-results-footer {
  margin-top: 2rem;
  border-top: 1px solid var(--mkcg-border-light, #e2e8f0);
  padding-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .gfy-builder {
    grid-template-columns: 1fr;
  }

  .gfy-builder__field--full {
    grid-column: span 1;
  }

  .gfy-trust-strip {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .gmkb-intent-tabs {
    flex-direction: column;
  }

  .gmkb-intent-tab {
    border-right: none;
    border-bottom: 1px solid var(--mkcg-border-light, #e2e8f0);
  }

  .gfy-results-footer {
    flex-direction: column;
    gap: 12px;
  }
}

/* Integrated Mode Styles */
.gmkb-ai-taglines__instruction {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--mkcg-text-secondary, #64748b);
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
  color: var(--mkcg-text-secondary, #64748b);
}

/* Embedded Mode Styles */
.gmkb-embedded-form {
  width: 100%;
}

.gmkb-embedded-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gmkb-embedded-field {
  display: flex;
  flex-direction: column;
}

.gmkb-embedded-label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--mkcg-text-primary, #0f172a);
}

.gmkb-embedded-input {
  width: 100%;
  padding: 14px;
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 8px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  box-sizing: border-box;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gmkb-embedded-input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gmkb-embedded-input::placeholder {
  color: var(--mkcg-text-tertiary, #94a3b8);
}

.gmkb-embedded-textarea {
  resize: vertical;
  min-height: 80px;
}

.gmkb-embedded-error {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
}
</style>
