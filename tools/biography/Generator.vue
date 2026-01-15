<template>
  <!-- Integrated Mode: Compact widget for Media Kit Builder -->
  <AiWidgetFrame
    v-if="mode === 'integrated'"
    title="Biography Generator"
    description="Create a professional biography that establishes your credibility and expertise."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasVariations"
    :error="error"
    target-component="Biography"
    :show-cta="!hasVariations"
    @apply="handleApply"
    @regenerate="() => generateForSlot(activeSlot)"
    @copy="() => copyBio(currentBio)"
    @retry="() => generateForSlot(activeSlot)"
  >
    <!-- Compact Input Form -->
    <div class="gmkb-ai-form">
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Your Name</label>
        <input
          v-model="name"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Dr. Jane Smith"
        />
      </div>

      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">What do you do?</label>
        <textarea
          v-model="authorityHookTextCompact"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., I help busy executives achieve work-life balance through proven mindfulness techniques..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Describe who you help and what transformation you provide.
        </span>
      </div>

      <AiToneSelector v-model="tone" />
      <AiLengthSelector v-model="integratedLength" />
      <AiPovSelector v-model="pov" />

      <AiGenerateButton
        :loading="isGenerating"
        :disabled="!canGenerateIntegrated"
        full-width
        @click="handleGenerateIntegrated"
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
      <div class="gmkb-ai-results__tabs" v-if="lockedCount > 0 || hasVariations">
        <button
          v-for="len in ['short', 'medium', 'long']"
          :key="len"
          type="button"
          class="gmkb-ai-results__tab"
          :class="{ 'gmkb-ai-results__tab--active': activeSlot === len }"
          @click="setActiveSlot(len)"
        >
          {{ len }}
        </button>
      </div>
    </template>
  </AiWidgetFrame>

  <!-- Embedded Mode: Simple form for landing pages (like Guest Intro) -->
  <div v-else-if="mode === 'embedded'" class="gmkb-embedded-form">
    <div class="gmkb-embedded-fields">
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.name || 'Your Name' }} *</label>
        <input
          v-model="name"
          type="text"
          class="gmkb-embedded-input"
          :placeholder="currentIntent?.formPlaceholders?.name || 'e.g., Dr. Jane Smith'"
        />
      </div>
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.expertise || 'Your Authority Hook' }} *</label>
        <textarea
          v-model="embeddedAuthorityHook"
          class="gmkb-embedded-input gmkb-embedded-textarea"
          :placeholder="currentIntent?.formPlaceholders?.expertise || 'e.g., I help SaaS founders scale to $10M ARR through my Revenue Acceleration System...'"
          rows="3"
        ></textarea>
        <span class="gmkb-embedded-hint">Describe who you help and what transformation you provide.</span>
      </div>
    </div>
    <div v-if="error" class="gmkb-embedded-error">{{ error }}</div>
  </div>

  <!-- Default/Standalone Mode: Full Biography Toolkit -->
  <div v-else class="gfy-bio-generator">
    <!-- Phase 1: Input Form -->
    <div v-if="!showResults" class="gfy-bio-form">
      <!-- Hero Section (hidden in embedded mode - wrapper provides heading) -->
      <div v-if="mode !== 'embedded'" class="gfy-bio-hero">
        <h1 class="gfy-bio-hero__title">Professional Biography Generator</h1>
        <p class="gfy-bio-hero__subtitle">
          Create compelling professional biographies using the Authority Hook and Impact Intro frameworks.
        </p>
      </div>

      <!-- Form Container -->
      <div class="gfy-bio-form__container" :class="{ 'gfy-bio-form__container--embedded': mode === 'embedded' }">
        <!-- Basic Information -->
        <div class="gfy-form-section">
          <h3 class="gfy-form-section__title">
            <span class="gfy-form-section__icon">
              <i class="fas fa-user"></i>
            </span>
            Basic Information
          </h3>

          <div class="gfy-form-grid">
            <div class="gfy-form-group">
              <label class="gfy-form-label gfy-form-label--required">Your Name</label>
              <input
                v-model="name"
                type="text"
                class="gfy-form-input"
                placeholder="e.g., Dr. Jane Smith"
              />
            </div>

            <div class="gfy-form-group">
              <label class="gfy-form-label">Organization / Company</label>
              <input
                v-model="optionalFields.organization"
                type="text"
                class="gfy-form-input"
                placeholder="e.g., Acme Corporation"
              />
            </div>
          </div>
        </div>

        <!-- Authority Hook Section (WHO, WHAT, WHEN, HOW) -->
        <div class="gfy-highlight-box gfy-highlight-box--blue">
          <div class="gfy-highlight-box__header">
            <span class="gfy-highlight-box__icon">
              <i class="fas fa-star"></i>
            </span>
            <div>
              <h3 class="gfy-highlight-box__title">Authority Hook</h3>
              <p class="gfy-highlight-box__subtitle">Define WHO you help, WHAT results you deliver, WHEN they need it, and HOW you do it.</p>
            </div>
          </div>

          <div class="gfy-builder">
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">
                <span class="gfy-builder__label-badge">WHO</span>
                Who do you help?
              </label>
              <input
                v-model="authorityHook.who"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., SaaS Founders scaling to $10M ARR"
              />
            </div>

            <div class="gfy-builder__field">
              <label class="gfy-builder__label">
                <span class="gfy-builder__label-badge">WHAT</span>
                What result do you deliver?
              </label>
              <input
                v-model="authorityHook.what"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., Increase revenue by 40% in 90 days"
              />
            </div>

            <div class="gfy-builder__field">
              <label class="gfy-builder__label">
                <span class="gfy-builder__label-badge">WHEN</span>
                When do they need your help?
              </label>
              <input
                v-model="authorityHook.when"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., When they're stuck at a growth plateau"
              />
            </div>

            <div class="gfy-builder__field">
              <label class="gfy-builder__label">
                <span class="gfy-builder__label-badge">HOW</span>
                How do you achieve results?
              </label>
              <input
                v-model="authorityHook.how"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., My proven Revenue Acceleration System"
              />
            </div>
          </div>

          <!-- Live Preview -->
          <div v-if="authorityHookSummary" class="gfy-live-preview">
            <span class="gfy-live-preview__label">Preview:</span>
            "{{ authorityHookSummary }}"
          </div>
        </div>

        <!-- Impact Intro Section (WHERE, WHY) -->
        <div class="gfy-highlight-box gfy-highlight-box--green">
          <div class="gfy-highlight-box__header">
            <span class="gfy-highlight-box__icon">
              <i class="fas fa-trophy"></i>
            </span>
            <div>
              <h3 class="gfy-highlight-box__title">Impact Intro</h3>
              <p class="gfy-highlight-box__subtitle">Showcase WHERE you've made an impact and WHY you do what you do.</p>
            </div>
          </div>

          <div class="gfy-builder gfy-builder--two-col">
            <div class="gfy-builder__field gfy-builder__field--full">
              <label class="gfy-builder__label">
                <span class="gfy-builder__label-badge gfy-builder__label-badge--green">WHERE</span>
                Credentials & Achievements
              </label>
              <textarea
                v-model="impactIntro.where"
                class="gfy-builder__textarea"
                rows="2"
                placeholder="e.g., Featured in Forbes, Inc., and Entrepreneur. Keynoted at 50+ conferences worldwide."
              ></textarea>
            </div>

            <div class="gfy-builder__field gfy-builder__field--full">
              <label class="gfy-builder__label">
                <span class="gfy-builder__label-badge gfy-builder__label-badge--green">WHY</span>
                Your Mission or Purpose
              </label>
              <textarea
                v-model="impactIntro.why"
                class="gfy-builder__textarea"
                rows="2"
                placeholder="e.g., Help every founder achieve sustainable growth without sacrificing their health or relationships."
              ></textarea>
            </div>
          </div>

          <!-- Impact Preview -->
          <div v-if="impactIntroSummary" class="gfy-live-preview gfy-live-preview--green">
            <span class="gfy-live-preview__label">Preview:</span>
            "{{ impactIntroSummary }}"
          </div>
        </div>

        <!-- Optional Context Section -->
        <div class="gfy-form-section gfy-form-section--optional">
          <h3 class="gfy-form-section__title">
            <span class="gfy-form-section__icon">
              <i class="fas fa-plus-circle"></i>
            </span>
            Additional Context
            <span class="gfy-form-section__optional-badge">Optional</span>
          </h3>

          <div class="gfy-form-group">
            <label class="gfy-form-label">Existing Biography</label>
            <textarea
              v-model="optionalFields.existingBio"
              class="gfy-form-textarea"
              rows="3"
              placeholder="Paste your current bio here if you want to improve upon it..."
            ></textarea>
            <span class="gfy-form-hint">If you have an existing bio, we'll use it as inspiration while crafting new versions.</span>
          </div>

          <div class="gfy-form-group">
            <label class="gfy-form-label">Additional Notes</label>
            <textarea
              v-model="optionalFields.additionalNotes"
              class="gfy-form-textarea"
              rows="2"
              placeholder="Any specific achievements, tone preferences, or details to include..."
            ></textarea>
          </div>
        </div>

        <!-- Settings Row -->
        <div class="gfy-settings-row">
          <div class="gfy-form-group gfy-form-group--inline">
            <label class="gfy-form-label">Tone</label>
            <select v-model="tone" class="gfy-form-select">
              <option v-for="opt in TONE_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="gfy-form-group gfy-form-group--inline">
            <label class="gfy-form-label">Point of View</label>
            <select v-model="pov" class="gfy-form-select">
              <option v-for="opt in POV_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Generate Button (hidden in embedded mode - wrapper provides button) -->
        <div v-if="mode !== 'embedded'" class="gfy-form-actions">
          <button
            type="button"
            class="gfy-btn gfy-btn--primary gfy-btn--large gfy-btn--generate"
            :disabled="!canGenerate || isGenerating"
            @click="handleStartGeneration"
          >
            <i v-if="!isGenerating" class="fas fa-magic"></i>
            <span v-if="isGenerating" class="gfy-spinner"></span>
            {{ isGenerating ? 'Generating...' : 'Generate Biography Toolkit' }}
          </button>
          <p class="gfy-form-actions__hint">
            We'll create multiple variations for Short, Medium, and Long biographies
          </p>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="gfy-error-box">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ error }}</p>
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleStartGeneration">
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Phase 2: Results Dashboard -->
    <div v-else class="gfy-bio-results">
      <!-- Results Hero -->
      <div class="gfy-bio-hero gfy-bio-hero--compact">
        <h1 class="gfy-bio-hero__title">Biography Toolkit</h1>
        <p class="gfy-bio-hero__subtitle">
          Refine your professional presence. Select a slot and provide feedback to iterate with AI.
        </p>
      </div>

      <div class="gmkb-tool-embed">
        <div class="gfy-results-layout">
          <!-- SIDEBAR: Slot Selection -->
          <aside class="gfy-layout-sidebar">
            <div class="gfy-current-topics">
              <div class="gfy-sidebar-header">
                <h3 class="gfy-sidebar-title">Select Length to Refine</h3>
              </div>

              <!-- Long Slot -->
              <button
                type="button"
                class="gfy-bio-slot"
                :class="{
                  'gfy-bio-slot--active': activeSlot === 'long',
                  'gfy-bio-slot--locked': slots.long.locked,
                  'gfy-bio-slot--generating': slots.long.status === SLOT_STATUS.GENERATING
                }"
                @click="handleSlotClick('long')"
              >
                <div class="gfy-bio-slot__header">
                  <span class="gfy-bio-slot__label">Long Version (300w)</span>
                  <i v-if="slots.long.locked" class="fas fa-lock" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="slots.long.status === SLOT_STATUS.GENERATING" class="fas fa-spinner fa-spin" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="slots.long.variations.length > 0" class="fas fa-check-circle" style="color: var(--gfy-success-color);"></i>
                  <i v-else class="fas fa-plus" style="color: var(--gfy-text-muted);"></i>
                </div>
                <div class="gfy-bio-slot__preview">{{ getSlotPreview('long') }}</div>
              </button>

              <!-- Medium Slot -->
              <button
                type="button"
                class="gfy-bio-slot"
                :class="{
                  'gfy-bio-slot--active': activeSlot === 'medium',
                  'gfy-bio-slot--locked': slots.medium.locked,
                  'gfy-bio-slot--generating': slots.medium.status === SLOT_STATUS.GENERATING
                }"
                @click="handleSlotClick('medium')"
              >
                <div class="gfy-bio-slot__header">
                  <span class="gfy-bio-slot__label">Medium Version (150w)</span>
                  <i v-if="slots.medium.locked" class="fas fa-lock" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="slots.medium.status === SLOT_STATUS.GENERATING" class="fas fa-spinner fa-spin" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="slots.medium.variations.length > 0" class="fas fa-check-circle" style="color: var(--gfy-success-color);"></i>
                  <i v-else class="fas fa-plus" style="color: var(--gfy-text-muted);"></i>
                </div>
                <div class="gfy-bio-slot__preview">{{ getSlotPreview('medium') }}</div>
              </button>

              <!-- Short Slot -->
              <button
                type="button"
                class="gfy-bio-slot"
                :class="{
                  'gfy-bio-slot--active': activeSlot === 'short',
                  'gfy-bio-slot--locked': slots.short.locked,
                  'gfy-bio-slot--generating': slots.short.status === SLOT_STATUS.GENERATING
                }"
                @click="handleSlotClick('short')"
              >
                <div class="gfy-bio-slot__header">
                  <span class="gfy-bio-slot__label">Short Version (50w)</span>
                  <i v-if="slots.short.locked" class="fas fa-lock" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="slots.short.status === SLOT_STATUS.GENERATING" class="fas fa-spinner fa-spin" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="slots.short.variations.length > 0" class="fas fa-check-circle" style="color: var(--gfy-success-color);"></i>
                  <i v-else class="fas fa-plus" style="color: var(--gfy-text-muted);"></i>
                </div>
                <div class="gfy-bio-slot__preview">{{ getSlotPreview('short') }}</div>
              </button>

              <!-- Locked Summary -->
              <div v-if="lockedCount > 0" class="gfy-locked-summary">
                <i class="fas fa-lock"></i>
                {{ lockedCount }}/3 biographies locked
              </div>
            </div>
          </aside>

          <!-- MAIN: Variations + Feedback Loop -->
          <main class="gfy-layout-main">
            <!-- Results Header -->
            <div class="gfy-results__header">
              <h3 class="gfy-results__title">
                AI Variations:
                <span style="color: var(--gfy-primary-color)">{{ activeSlotLabel }} Biography</span>
              </h3>
            </div>

            <!-- Refinement Loop Box -->
            <div v-if="currentVariations.length > 0 && !currentSlot.locked" class="gfy-refinement-box">
              <div class="gfy-refinement-header">
                <i class="fas fa-magic" style="color: var(--gfy-primary-color); font-size: 14px;"></i>
                <span class="gfy-refinement-title">Refine these results</span>
              </div>
              <div class="gfy-refinement-input-wrapper">
                <textarea
                  v-model="refinementFeedback"
                  class="gfy-refinement-textarea"
                  rows="1"
                  placeholder="e.g. Make Option 1 more conversational or add my keynote experience..."
                  @keydown.enter.prevent="handleRefine"
                ></textarea>
                <button
                  type="button"
                  class="gfy-btn-refine"
                  :disabled="!refinementFeedback.trim() || isGenerating"
                  @click="handleRefine"
                >
                  <i v-if="!isGenerating" class="fas fa-sync-alt"></i>
                  <span v-else class="gfy-spinner gfy-spinner--small"></span>
                  {{ isGenerating ? '' : 'Refine' }}
                </button>
              </div>
              <span class="gfy-refinement-hint">AI will iterate on the drafts below based on your instructions.</span>
            </div>

            <!-- Loading State -->
            <div v-if="currentSlot.status === SLOT_STATUS.GENERATING" class="gfy-loading-state">
              <div class="gfy-loading-spinner"></div>
              <p>Generating {{ getVariationCount(activeSlot) }} variations for your {{ activeSlotLabel }} biography...</p>
            </div>

            <!-- Locked State -->
            <div v-else-if="currentSlot.locked" class="gfy-locked-state">
              <div class="gfy-locked-bio">
                <div class="gfy-locked-bio__badge">
                  <i class="fas fa-lock"></i>
                  LOCKED {{ activeSlotLabel.toUpperCase() }} BIO
                </div>
                <div class="gfy-locked-bio__text">
                  <p v-for="(paragraph, pIdx) in currentSlot.lockedBio.split('\n\n').filter(p => p.trim())" :key="pIdx">
                    {{ paragraph }}
                  </p>
                </div>
                <div class="gfy-locked-bio__actions">
                  <button type="button" class="gfy-btn gfy-btn--outline" @click="handleCopy(currentSlot.lockedBio)">
                    <i class="fas fa-copy"></i> Copy
                  </button>
                  <button type="button" class="gfy-btn gfy-btn--ghost" @click="unlockBio(activeSlot)">
                    <i class="fas fa-unlock"></i> Unlock & Edit
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="currentVariations.length === 0" class="gfy-empty-state">
              <i class="fas fa-file-alt"></i>
              <p>Click the button below to generate {{ getVariationCount(activeSlot) }} variations for your {{ activeSlotLabel }} biography.</p>
              <button
                type="button"
                class="gfy-btn gfy-btn--primary"
                :disabled="isGenerating"
                @click="handleGenerateForSlot(activeSlot)"
              >
                <i class="fas fa-magic"></i>
                Generate {{ activeSlotLabel }} Bio
              </button>
            </div>

            <!-- Variations List -->
            <template v-else>
              <div
                v-for="(variation, index) in currentVariations"
                :key="variation.id"
                class="gfy-bio-variation"
              >
                <div class="gfy-variation-badge">{{ variation.label }}</div>
                <div class="gfy-variation-text">
                  <p v-for="(paragraph, pIdx) in variation.text.split('\n\n').filter(p => p.trim())" :key="pIdx">
                    {{ paragraph }}
                  </p>
                </div>
                <div class="gfy-variation-footer">
                  <button
                    type="button"
                    class="gfy-btn gfy-btn--primary"
                    @click="handleLock(index)"
                  >
                    <i class="fas fa-lock"></i>
                    Lock as {{ activeSlotLabel }} Bio
                  </button>
                  <button
                    type="button"
                    class="gfy-btn gfy-btn--outline"
                    @click="handleCopy(variation.text)"
                  >
                    <i class="fas fa-copy"></i> Copy
                  </button>
                </div>
              </div>
            </template>

            <!-- Footer Actions -->
            <div class="gfy-results__footer">
              <button
                type="button"
                class="gfy-btn gfy-btn--primary gfy-btn--large"
                :disabled="lockedCount === 0 || isSaving"
                @click="handleSaveAll"
              >
                <i v-if="!isSaving" class="fas fa-save"></i>
                <span v-else class="gfy-spinner"></span>
                {{ isSaving ? 'Saving...' : 'Save Entire Toolkit' }}
              </button>
              <button type="button" class="gfy-btn gfy-btn--ghost" @click="handleStartOver">
                Start Over
              </button>
            </div>

            <!-- Save Success -->
            <div v-if="saveSuccess" class="gfy-save-success">
              <i class="fas fa-check-circle"></i>
              Biographies saved successfully!
            </div>

            <!-- Save Error -->
            <div v-if="saveError" class="gfy-save-error">
              <i class="fas fa-exclamation-triangle"></i>
              {{ saveError }}
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useAIBiography, SLOT_STATUS, LENGTH_OPTIONS, getVariationCount } from '../../src/composables/useAIBiography';
import { useProfileContext } from '../../src/composables/useProfileContext';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

// Integrated mode components
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiLengthSelector from '../../src/vue/components/ai/AiLengthSelector.vue';
import AiPovSelector from '../../src/vue/components/ai/AiPovSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'default',
    // 'embedded' mode is used by EmbeddedToolWrapper and renders like 'default'
    validator: (v) => ['default', 'integrated', 'embedded'].includes(v)
  },
  intent: {
    type: Object,
    default: null
  },
  profileData: {
    type: Object,
    default: null
  },
  componentId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['generated', 'saved', 'applied', 'update:can-generate', 'preview-update']);

// Inject profile data from parent
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Use composables
const {
  // State
  name,
  tone,
  pov,
  authorityHook,
  impactIntro,
  optionalFields,
  refinementFeedback,
  slots,
  activeSlot,
  currentSlot,
  currentVariations,
  isGenerating,
  lockedCount,
  error,
  // Computed
  authorityHookSummary,
  impactIntroSummary,
  canGenerate,
  // Methods
  generateForSlot,
  refineVariations,
  lockBio,
  unlockBio,
  setActiveSlot,
  getSlotPreview,
  getLockedBios,
  copyBio,
  reset,
  populateFromProfile,
  // Options
  TONE_OPTIONS,
  POV_OPTIONS
} = useAIBiography();

const {
  profileId,
  isSaving,
  saveError,
  saveToProfile
} = useProfileContext();

// Local state
const showResults = ref(false);
const saveSuccess = ref(false);
const copiedText = ref('');

// Integrated mode specific state
const authorityHookTextCompact = ref('');
const integratedLength = ref('medium');

// Embedded mode specific state (for landing pages)
const embeddedAuthorityHook = ref('');

/**
 * Current intent (for embedded mode)
 */
const currentIntent = computed(() => {
  return props.intent || null;
});

/**
 * Can generate check for embedded mode
 */
const canGenerateEmbedded = computed(() => {
  return name.value.trim() && embeddedAuthorityHook.value.trim();
});

/**
 * Can generate check for integrated mode
 */
const canGenerateIntegrated = computed(() => {
  return name.value.trim() && authorityHookTextCompact.value.trim();
});

/**
 * Get current bio for integrated mode display
 */
const currentBio = computed(() => {
  const slot = slots[activeSlot.value];
  return slot?.lockedBio || (slot?.variations[0]?.text || null);
});

/**
 * Handle generate for integrated mode
 */
const handleGenerateIntegrated = async () => {
  // Parse the compact authority hook text into the structured format
  authorityHook.who = authorityHookTextCompact.value;
  setActiveSlot(integratedLength.value);
  await generateForSlot(integratedLength.value);
};

/**
 * Handle apply for integrated mode (applies to component)
 */
const handleApply = () => {
  emit('applied', {
    componentId: props.componentId,
    content: currentBio.value,
    length: activeSlot.value
  });
};

/**
 * Handle generate (called by EmbeddedToolApp for embedded mode)
 */
const handleGenerate = async () => {
  try {
    // For embedded mode, use the simplified authority hook field
    if (props.mode === 'embedded') {
      // Set the authority hook from the embedded field
      authorityHook.who = embeddedAuthorityHook.value;

      // Generate a medium bio (default for embedded)
      setActiveSlot('medium');
      await generateForSlot('medium');

      // Get the generated bio
      const bio = currentBio.value;

      // Emit result for EmbeddedToolWrapper to display
      emit('generated', {
        content: bio,
        hook: bio,
        result: bio
      });

      return bio;
    }

    // For default mode, use the full form
    await handleStartGeneration();
    const bio = currentBio.value;
    emit('generated', {
      content: bio,
      hook: bio,
      result: bio
    });
    return bio;
  } catch (err) {
    console.error('[Biography Generator] Generation failed:', err);
    throw err;
  }
};

/**
 * Get active slot label
 */
const activeSlotLabel = computed(() => {
  const labels = { short: 'Short', medium: 'Medium', long: 'Long' };
  return labels[activeSlot.value] || 'Long';
});

/**
 * Handle starting generation - goes to results view
 */
const handleStartGeneration = async () => {
  showResults.value = true;
  // Auto-generate for the active slot (long by default)
  await handleGenerateForSlot('long');
};

/**
 * Handle slot click - select slot and generate if empty
 */
const handleSlotClick = async (slotName) => {
  setActiveSlot(slotName);

  // If slot is empty and not locked, generate variations
  if (slots[slotName].status === SLOT_STATUS.EMPTY) {
    await handleGenerateForSlot(slotName);
  }
};

/**
 * Handle generate for a specific slot
 */
const handleGenerateForSlot = async (slotName) => {
  try {
    await generateForSlot(slotName);
    emit('generated', { slot: slotName, variations: slots[slotName].variations });
  } catch (err) {
    console.error('[Biography Generator] Generation failed:', err);
  }
};

/**
 * Handle refinement
 */
const handleRefine = async () => {
  if (!refinementFeedback.value.trim()) return;

  try {
    await refineVariations(refinementFeedback.value);
  } catch (err) {
    console.error('[Biography Generator] Refinement failed:', err);
  }
};

/**
 * Handle locking a variation
 */
const handleLock = (variationIndex) => {
  lockBio(variationIndex);
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async (text) => {
  const success = await copyBio(text);
  if (success) {
    copiedText.value = text;
    setTimeout(() => { copiedText.value = ''; }, 2000);
  }
};

/**
 * Handle save all locked bios
 */
const handleSaveAll = async () => {
  const lockedBios = getLockedBios();

  if (Object.keys(lockedBios).length === 0) {
    return;
  }

  try {
    // Save each locked bio to the appropriate field
    const saveData = {};
    if (lockedBios.short) saveData.biography_short = lockedBios.short;
    if (lockedBios.medium) saveData.biography = lockedBios.medium;
    if (lockedBios.long) saveData.biography_long = lockedBios.long;

    const result = await saveToProfile('biography', saveData, {
      profileId: profileId.value
    });

    if (result?.success) {
      saveSuccess.value = true;
      setTimeout(() => { saveSuccess.value = false; }, 3000);
      emit('saved', { biographies: lockedBios });
    }
  } catch (err) {
    console.error('[Biography Generator] Save failed:', err);
  }
};

/**
 * Handle start over
 */
const handleStartOver = () => {
  reset();
  showResults.value = false;
};

/**
 * Populate from profile data
 */
function loadProfileData(data) {
  if (!data) return;
  console.log('[Biography Generator] loadProfileData called with:', data);
  console.log('[Biography Generator] impact_where:', data.impact_where);
  console.log('[Biography Generator] impact_why:', data.impact_why);
  console.log('[Biography Generator] where:', data.where);
  console.log('[Biography Generator] why:', data.why);
  populateFromProfile(data);
}

// Watch for injected profile data changes (from EmbeddedToolWrapper)
watch(
  injectedProfileData,
  (newData) => {
    if (newData) {
      console.log('[Biography Generator] injectedProfileData changed:', newData);
      loadProfileData(newData);
    }
  },
  { immediate: true }
);

// Watch for profile data prop changes
watch(
  () => props.profileData,
  (newData) => {
    if (newData) {
      console.log('[Biography Generator] props.profileData changed:', newData);
      loadProfileData(newData);
    }
  },
  { immediate: true }
);

// Watch canGenerate for parent (use appropriate check based on mode)
watch(
  () => props.mode === 'embedded' ? canGenerateEmbedded.value : canGenerate.value,
  (newValue) => {
    emit('update:can-generate', !!newValue);
  },
  { immediate: true }
);

// Expose for parent
defineExpose({
  handleStartGeneration,
  handleGenerate,
  showResults,
  isGenerating,
  error,
  canGenerate
});
</script>

<style scoped>
.gfy-bio-generator {
  --gfy-primary-color: #2563eb;
  --gfy-primary-light: #eff6ff;
  --gfy-primary-dark: #1d4ed8;
  --gfy-success-color: #10b981;
  --gfy-success-light: #d1fae5;
  --gfy-text-primary: #0f172a;
  --gfy-text-secondary: #64748b;
  --gfy-text-muted: #94a3b8;
  --gfy-bg-color: #f8fafc;
  --gfy-white: #ffffff;
  --gfy-border-color: #e2e8f0;
  --gfy-radius-md: 8px;
  --gfy-radius-lg: 12px;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* HERO */
.gfy-bio-hero {
  text-align: center;
  margin-bottom: 40px;
}

.gfy-bio-hero--compact {
  margin-bottom: 30px;
}

.gfy-bio-hero__title {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(to right, #0f172a, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gfy-bio-hero__subtitle {
  color: var(--gfy-text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* FORM CONTAINER */
.gfy-bio-form__container {
  background: var(--gfy-white);
  border-radius: 16px;
  border: 1px solid var(--gfy-border-color);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.gfy-bio-form__container--embedded {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

/* FORM SECTIONS */
.gfy-form-section {
  margin-bottom: 32px;
}

.gfy-form-section--optional {
  background: var(--gfy-bg-color);
  margin: 0 -40px;
  padding: 24px 40px;
  border-top: 1px solid var(--gfy-border-color);
  border-bottom: 1px solid var(--gfy-border-color);
  margin-bottom: 24px;
}

.gfy-form-section__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0 0 20px 0;
}

.gfy-form-section__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--gfy-primary-light);
  color: var(--gfy-primary-color);
  border-radius: 8px;
}

.gfy-form-section__optional-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--gfy-text-muted);
  background: var(--gfy-border-color);
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: auto;
}

/* FORM GRID */
.gfy-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 600px) {
  .gfy-form-grid {
    grid-template-columns: 1fr;
  }
}

/* FORM GROUPS */
.gfy-form-group {
  margin-bottom: 16px;
}

.gfy-form-group--inline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gfy-form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gfy-text-primary);
  margin-bottom: 8px;
}

.gfy-form-label--required::after {
  content: ' *';
  color: #dc2626;
}

.gfy-form-input,
.gfy-form-textarea,
.gfy-form-select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-family: inherit;
  font-size: 0.95rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-form-input:focus,
.gfy-form-textarea:focus,
.gfy-form-select:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-form-input::placeholder,
.gfy-form-textarea::placeholder {
  color: var(--gfy-text-muted);
}

.gfy-form-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--gfy-text-muted);
  margin-top: 6px;
  font-style: italic;
}

/* HIGHLIGHT BOXES */
.gfy-highlight-box {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 24px;
  margin-bottom: 24px;
}

.gfy-highlight-box--blue {
  border-left: 4px solid var(--gfy-primary-color);
  background: linear-gradient(to right, var(--gfy-primary-light), var(--gfy-white));
}

.gfy-highlight-box--green {
  border-left: 4px solid var(--gfy-success-color);
  background: linear-gradient(to right, var(--gfy-success-light), var(--gfy-white));
}

.gfy-highlight-box__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.gfy-highlight-box__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
  border-radius: 8px;
  flex-shrink: 0;
}

.gfy-highlight-box--green .gfy-highlight-box__icon {
  background: var(--gfy-success-color);
}

.gfy-highlight-box__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0 0 4px 0;
}

.gfy-highlight-box__subtitle {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
  margin: 0;
}

/* BUILDER GRID */
.gfy-builder {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.gfy-builder--two-col {
  grid-template-columns: 1fr;
}

.gfy-builder__field--full {
  grid-column: 1 / -1;
}

@media (max-width: 600px) {
  .gfy-builder {
    grid-template-columns: 1fr;
  }
}

.gfy-builder__field {
  margin-bottom: 0;
}

.gfy-builder__label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gfy-text-secondary);
  margin-bottom: 8px;
}

.gfy-builder__label-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
  border-radius: 4px;
}

.gfy-builder__label-badge--green {
  background: var(--gfy-success-color);
}

.gfy-builder__input,
.gfy-builder__textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-family: inherit;
  font-size: 0.95rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-builder__input:focus,
.gfy-builder__textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-builder__input::placeholder,
.gfy-builder__textarea::placeholder {
  color: var(--gfy-text-muted);
}

/* LIVE PREVIEW */
.gfy-live-preview {
  margin-top: 16px;
  padding: 14px 18px;
  background: var(--gfy-primary-light);
  border: 1px solid #bfdbfe;
  border-radius: var(--gfy-radius-md);
  font-size: 0.95rem;
  font-style: italic;
  color: var(--gfy-primary-dark);
}

.gfy-live-preview--green {
  background: var(--gfy-success-light);
  border-color: #6ee7b7;
  color: #047857;
}

.gfy-live-preview__label {
  font-weight: 600;
  font-style: normal;
  margin-right: 4px;
}

/* SETTINGS ROW */
.gfy-settings-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 600px) {
  .gfy-settings-row {
    flex-direction: column;
    gap: 16px;
  }
}

/* FORM ACTIONS */
.gfy-form-actions {
  text-align: center;
  padding-top: 16px;
}

.gfy-form-actions__hint {
  font-size: 0.85rem;
  color: var(--gfy-text-muted);
  margin-top: 12px;
}

/* BUTTONS */
.gfy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  white-space: nowrap;
}

.gfy-btn--primary {
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-btn--primary:hover:not(:disabled) {
  background: var(--gfy-primary-dark);
}

.gfy-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gfy-btn--outline {
  background: var(--gfy-white);
  border-color: var(--gfy-border-color);
  color: var(--gfy-text-secondary);
}

.gfy-btn--outline:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-btn--ghost {
  background: transparent;
  color: var(--gfy-text-secondary);
  border: none;
}

.gfy-btn--ghost:hover {
  color: var(--gfy-text-primary);
}

.gfy-btn--large {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
}

.gfy-btn--generate {
  padding: 16px 32px;
  font-size: 1.1rem;
  border-radius: 10px;
}

/* SPINNER */
.gfy-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

.gfy-spinner--small {
  width: 12px;
  height: 12px;
  border-width: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ERROR BOX */
.gfy-error-box {
  margin-top: 24px;
  padding: 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--gfy-radius-md);
  text-align: center;
  color: #991b1b;
}

.gfy-error-box i {
  font-size: 24px;
  margin-bottom: 8px;
}

.gfy-error-box p {
  margin: 0 0 12px 0;
}

/* ============================================
   RESULTS PHASE
   ============================================ */

.gmkb-tool-embed {
  background: var(--gfy-white);
  border-radius: 16px;
  border: 1px solid var(--gfy-border-color);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

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
    flex: 0 0 320px;
  }

  .gfy-layout-main {
    flex: 1;
    min-width: 0;
  }
}

/* SIDEBAR */
.gfy-current-topics {
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 1.25rem;
}

.gfy-sidebar-header {
  margin-bottom: 1rem;
}

.gfy-sidebar-title {
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--gfy-text-secondary);
  margin: 0;
}

/* BIO SLOTS */
.gfy-bio-slot {
  display: block;
  width: 100%;
  padding: 1rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  margin-bottom: 0.75rem;
  transition: all 0.2s;
  cursor: pointer;
  text-align: left;
}

.gfy-bio-slot:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-bio-slot--active {
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 2px var(--gfy-primary-color);
}

.gfy-bio-slot--locked {
  background: var(--gfy-primary-light);
  border-color: var(--gfy-primary-color);
}

.gfy-bio-slot--generating {
  opacity: 0.7;
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
  color: var(--gfy-text-secondary);
}

.gfy-bio-slot--locked .gfy-bio-slot__label {
  color: var(--gfy-primary-color);
}

.gfy-bio-slot__preview {
  font-size: 11px;
  line-height: 1.4;
  color: var(--gfy-text-muted);
}

.gfy-locked-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--gfy-primary-light);
  border-radius: var(--gfy-radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gfy-primary-color);
  margin-top: 12px;
}

/* MAIN AREA */
.gfy-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gfy-border-color);
}

.gfy-results__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

/* REFINEMENT BOX */
.gfy-refinement-box {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  background: linear-gradient(to bottom right, var(--gfy-white), var(--gfy-bg-color));
}

.gfy-refinement-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.gfy-refinement-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--gfy-primary-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gfy-refinement-input-wrapper {
  position: relative;
}

.gfy-refinement-textarea {
  width: 100%;
  padding: 14px 110px 14px 16px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  background: var(--gfy-white);
  box-sizing: border-box;
  transition: all 0.2s;
  resize: none;
  min-height: 52px;
}

.gfy-refinement-textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 4px var(--gfy-primary-light);
}

.gfy-btn-refine {
  position: absolute;
  right: 6px;
  top: 6px;
  bottom: 6px;
  padding: 0 16px;
  background: var(--gfy-primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.gfy-btn-refine:hover:not(:disabled) {
  background: var(--gfy-primary-dark);
}

.gfy-btn-refine:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gfy-refinement-hint {
  font-size: 11px;
  color: var(--gfy-text-muted);
  margin-top: 8px;
  display: block;
  font-style: italic;
}

/* STATES */
.gfy-loading-state,
.gfy-empty-state {
  text-align: center;
  padding: 60px 40px;
  color: var(--gfy-text-secondary);
}

.gfy-loading-state i,
.gfy-empty-state i {
  font-size: 48px;
  color: var(--gfy-text-muted);
  margin-bottom: 16px;
}

.gfy-loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--gfy-border-color);
  border-radius: 50%;
  border-top-color: var(--gfy-primary-color);
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

/* LOCKED STATE */
.gfy-locked-bio {
  background: var(--gfy-primary-light);
  border: 2px solid var(--gfy-primary-color);
  border-radius: var(--gfy-radius-lg);
  padding: 24px;
}

.gfy-locked-bio__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--gfy-primary-color);
  background: var(--gfy-white);
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.gfy-locked-bio__text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--gfy-text-primary);
  margin: 0 0 20px 0;
}

.gfy-locked-bio__text p {
  margin: 0 0 1em 0;
}

.gfy-locked-bio__text p:last-child {
  margin-bottom: 0;
}

.gfy-locked-bio__actions {
  display: flex;
  gap: 12px;
}

/* VARIATIONS */
.gfy-bio-variation {
  padding: 2rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: 10px;
  margin-bottom: 1.5rem;
  position: relative;
  transition: border-color 0.2s;
}

.gfy-bio-variation:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-variation-badge {
  font-size: 10px;
  font-weight: 800;
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
  padding: 4px 10px;
  border-radius: 4px;
  margin-bottom: 12px;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gfy-variation-text {
  font-size: 15px;
  line-height: 1.7;
  color: var(--gfy-text-primary);
  margin: 0 0 20px;
}

.gfy-variation-text p {
  margin: 0 0 1em 0;
}

.gfy-variation-text p:last-child {
  margin-bottom: 0;
}

.gfy-variation-footer {
  display: flex;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
}

/* FOOTER */
.gfy-results__footer {
  margin-top: 2rem;
  border-top: 1px solid var(--gfy-border-color);
  padding-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gfy-save-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--gfy-success-light);
  color: #047857;
  border-radius: var(--gfy-radius-md);
  font-weight: 600;
  margin-top: 16px;
}

.gfy-save-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  color: #991b1b;
  border-radius: var(--gfy-radius-md);
  font-weight: 600;
  margin-top: 16px;
}

/* ============================================
   INTEGRATED MODE STYLES
   ============================================ */

.gmkb-ai-results__tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.gmkb-ai-results__tab {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  background: transparent;
  border: 1px solid var(--gfy-border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--gfy-text-secondary);
}

.gmkb-ai-results__tab:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
}

.gmkb-ai-results__tab--active {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: white;
}

/* ============================================
   EMBEDDED MODE STYLES (for landing page)
   ============================================ */

.gmkb-embedded-form {
  width: 100%;
}

.gmkb-embedded-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gmkb-embedded-hint {
  display: block;
  font-size: 12px;
  color: var(--mkcg-text-light, #94a3b8);
  margin-top: 6px;
}

.gmkb-embedded-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gmkb-embedded-section-header {
  font-size: 14px;
  font-weight: 700;
  color: var(--mkcg-text-primary, #0f172a);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--mkcg-border, #e2e8f0);
}

.gmkb-embedded-optional {
  font-weight: 400;
  text-transform: none;
  color: var(--mkcg-text-light, #94a3b8);
}

.gmkb-embedded-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.gmkb-embedded-row--3col {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 768px) {
  .gmkb-embedded-row,
  .gmkb-embedded-row--3col {
    grid-template-columns: 1fr;
  }
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

.gmkb-embedded-input,
.gmkb-embedded-textarea,
.gmkb-embedded-select {
  width: 100%;
  padding: 14px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  box-sizing: border-box;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gmkb-embedded-textarea {
  resize: vertical;
  min-height: 80px;
}

.gmkb-embedded-input:focus,
.gmkb-embedded-textarea:focus,
.gmkb-embedded-select:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gmkb-embedded-input::placeholder,
.gmkb-embedded-textarea::placeholder {
  color: var(--mkcg-text-light, #94a3b8);
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

/* Highlight boxes for embedded mode */
.gmkb-embedded-highlight {
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gmkb-embedded-highlight--blue {
  border-left: 4px solid var(--mkcg-primary, #3b82f6);
  background: linear-gradient(to right, #eff6ff, #fff);
}

.gmkb-embedded-highlight--green {
  border-left: 4px solid #10b981;
  background: linear-gradient(to right, #d1fae5, #fff);
}

.gmkb-embedded-highlight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.gmkb-embedded-highlight-icon {
  font-size: 18px;
}

.gmkb-embedded-highlight-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--mkcg-text-primary, #0f172a);
}

/* Embedded Mode Wrapper */
.gmkb-embedded-mode {
  width: 100%;
}

/* Embedded mode uses full results dashboard - inherits gfy-bio-results styles */
.gfy-bio-results--embedded {
  /* Embedded mode inherits all default mode styles */
  /* Adjust max-width to fit within landing page container */
  max-width: 100%;
}

.gfy-bio-results--embedded .gfy-bio-hero {
  margin-bottom: 24px;
}

.gfy-bio-results--embedded .gfy-bio-hero__title {
  font-size: 28px;
}

.gfy-bio-results--embedded .gfy-results-layout {
  padding: 24px;
}

@media (max-width: 900px) {
  .gfy-bio-results--embedded .gfy-layout-sidebar {
    position: static;
  }
}
</style>
