<template>
  <!-- Integrated Mode: Compact widget for Media Kit Builder -->
  <AiWidgetFrame
    v-if="mode === 'integrated'"
    title="Guest Introduction Generator"
    description="Create a host-ready introduction that builds anticipation and establishes credibility."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasVariations"
    :error="error"
    target-component="Guest Intro"
    :show-cta="!hasVariations"
    @apply="handleApply"
    @regenerate="() => generateForSlot(activeSlot)"
    @copy="() => copyIntro(currentIntro)"
    @retry="() => generateForSlot(activeSlot)"
  >
    <!-- Compact Input Form -->
    <div class="gmkb-ai-form">
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Guest Name</label>
        <input
          v-model="guestInfo.name"
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
        v-if="currentIntro"
        :content="currentIntro"
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

  <!-- Default/Standalone Mode: Full Guest Intro Toolkit -->
  <div v-else class="gfy-intro-generator">
    <!-- Phase 1: Input Form -->
    <div v-if="!showResults" class="gfy-intro-form">
      <!-- Hero Section (only show when not inside wrapper) -->
      <div v-if="mode === 'default' && !isEmbedded" class="gfy-intro-hero">
        <h1 class="gfy-intro-hero__title">Guest Introduction Generator</h1>
        <p class="gfy-intro-hero__subtitle">
          Create compelling introductions designed to be read aloud by podcast hosts or event MCs using the Authority Hook and Impact Intro frameworks.
        </p>
      </div>

      <!-- Profile Selector (for logged-in users in standalone mode) -->
      <ProfileSelector
        v-if="mode === 'default'"
        @profile-selected="handleProfileSelected"
        @profile-cleared="handleProfileCleared"
      />

      <!-- Auto-save indicator -->
      <div v-if="isAutoSaving" class="gfy-autosave-indicator">
        <i class="fas fa-save"></i> Saving draft...
      </div>

      <!-- Form Container (no styling when inside wrapper) -->
      <div class="gfy-intro-form__container" :class="{ 'gfy-intro-form__container--no-chrome': isEmbedded }">
        <!-- STEP 1: Guest & Episode Information -->
        <div class="gfy-form-section">
          <div class="gfy-form-section__header">
            <span class="gfy-form-section__step">1</span>
            <div>
              <h3 class="gfy-form-section__title">Guest & Episode Information</h3>
              <p class="gfy-form-section__subtitle">Basic details about the guest and context</p>
            </div>
          </div>

          <div class="gfy-form-grid">
            <div class="gfy-form-group">
              <label class="gfy-form-label gfy-form-label--required">
                Guest Name
                <span v-if="isFieldPrefilled('guestName')" class="gfy-prefilled-badge">from profile</span>
              </label>
              <input
                v-model="guestInfo.name"
                type="text"
                class="gfy-form-input"
                :class="{ 'gfy-form-input--prefilled': isFieldPrefilled('guestName') }"
                placeholder="e.g., Dr. Jane Smith"
                @input="markFieldEdited('guestName')"
              />
            </div>

            <div class="gfy-form-group">
              <label class="gfy-form-label">
                Guest Title & Company
                <span v-if="isFieldPrefilled('titleCompany')" class="gfy-prefilled-badge">from profile</span>
              </label>
              <input
                v-model="guestInfo.titleCompany"
                type="text"
                class="gfy-form-input"
                :class="{ 'gfy-form-input--prefilled': isFieldPrefilled('titleCompany') }"
                placeholder="e.g., CEO of Growth Dynamics"
                @input="markFieldEdited('titleCompany')"
              />
            </div>
          </div>

          <div class="gfy-form-grid">
            <div class="gfy-form-group">
              <label class="gfy-form-label">Episode/Event Title</label>
              <input
                v-model="episodeInfo.title"
                type="text"
                class="gfy-form-input"
                placeholder="e.g., How to Scale Without Burnout"
              />
            </div>

            <div class="gfy-form-group">
              <label class="gfy-form-label">Main Discussion Topic</label>
              <input
                v-model="episodeInfo.topic"
                type="text"
                class="gfy-form-input"
                placeholder="e.g., Work-life balance for entrepreneurs"
              />
            </div>
          </div>
        </div>

        <!-- STEP 2: Authority Hook Section (WHO, WHAT, WHEN, HOW) -->
        <AuthorityHookBuilder
          :model-value="authorityHook"
          @update:model-value="Object.assign(authorityHook, $event)"
          title="Authority Hook"
          :placeholders="{
            who: 'e.g., SaaS Founders scaling to $10M ARR',
            what: 'e.g., Increase revenue by 40% in 90 days',
            when: 'e.g., When they\'re stuck at a growth plateau',
            how: 'e.g., My proven Revenue Acceleration System'
          }"
        />

        <!-- STEP 3: Impact Intro Section (WHERE, WHY) -->
        <ImpactIntroBuilder
          :model-value="impactIntro"
          @update:model-value="Object.assign(impactIntro, $event)"
          title="Impact Intro"
          :placeholders="{
            where: 'e.g., Featured in Forbes, Inc., and Entrepreneur. Keynoted at 50+ conferences worldwide.',
            why: 'e.g., Help every founder achieve sustainable growth without sacrificing their health or relationships.'
          }"
        />

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
            <label class="gfy-form-label">Hook Style</label>
            <select v-model="hookStyle" class="gfy-form-select">
              <option v-for="opt in HOOK_STYLE_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Actions & Restore Link (only show in default mode - landing page provides its own button) -->
        <div v-if="mode === 'default'" class="gfy-actions-wrapper">
          <!-- Restore Link (subtle text link) -->
          <button
            v-if="showDraftPrompt"
            type="button"
            class="gfy-restore-link"
            @click="handleRestoreDraft"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 4v6h6"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            Unsaved changes found. <strong>Restore?</strong>
          </button>

          <!-- Main Generate Button -->
          <button
            type="button"
            class="gfy-btn gfy-btn--primary gfy-btn--large gfy-btn--generate"
            :disabled="!canGenerate || isGenerating"
            @click="handleStartGeneration"
          >
            <i v-if="!isGenerating" class="fas fa-magic"></i>
            <span v-if="isGenerating" class="gfy-spinner"></span>
            {{ isGenerating ? 'Generating...' : 'Generate Guest Introduction Toolkit' }}
          </button>
          <p class="gfy-form-hint">
            We'll create multiple variations for Short, Medium, and Long introductions
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
    <div v-else class="gfy-intro-results">
      <!-- Results Hero (only show in default mode, not when embedded) -->
      <div v-if="mode === 'default' && !isEmbedded" class="gfy-intro-hero gfy-intro-hero--compact">
        <h1 class="gfy-intro-hero__title">Guest Introduction Toolkit</h1>
        <p class="gfy-intro-hero__subtitle">
          Refine your introductions. Select a length and provide feedback to iterate with AI.
        </p>
      </div>

      <div class="gfy-intro-results__container" :class="{ 'gfy-intro-results__container--no-chrome': isEmbedded }">
        <div class="gfy-results-layout">
          <!-- SIDEBAR: Slot Selection -->
          <aside class="gfy-layout-sidebar">
            <div class="gfy-current-topics">
              <div class="gfy-sidebar-header">
                <h3 class="gfy-sidebar-title">Select Length to Refine</h3>
              </div>

              <!-- Short Slot (30-45 sec) -->
              <button
                type="button"
                class="gfy-intro-slot"
                :class="{
                  'gfy-intro-slot--active': activeSlot === 'short',
                  'gfy-intro-slot--locked': slots.short.locked,
                  'gfy-intro-slot--generating': slots.short.status === SLOT_STATUS.GENERATING
                }"
                @click="handleSlotClick('short')"
              >
                <div class="gfy-intro-slot__header">
                  <span class="gfy-intro-slot__label">Short (30-45 sec)</span>
                  <i v-if="slots.short.locked" class="fas fa-lock" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="slots.short.status === SLOT_STATUS.GENERATING" class="fas fa-spinner fa-spin" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="slots.short.variations.length > 0" class="fas fa-check-circle" style="color: var(--gfy-success-color);"></i>
                  <i v-else class="fas fa-plus" style="color: var(--gfy-text-muted);"></i>
                </div>
                <div class="gfy-intro-slot__preview">{{ getSlotPreview('short') }}</div>
              </button>

              <!-- Medium Slot (60-90 sec) -->
              <button
                type="button"
                class="gfy-intro-slot"
                :class="{
                  'gfy-intro-slot--active': activeSlot === 'medium',
                  'gfy-intro-slot--locked': slots.medium.locked,
                  'gfy-intro-slot--generating': slots.medium.status === SLOT_STATUS.GENERATING
                }"
                @click="handleSlotClick('medium')"
              >
                <div class="gfy-intro-slot__header">
                  <span class="gfy-intro-slot__label">Medium (60-90 sec)</span>
                  <i v-if="slots.medium.locked" class="fas fa-lock" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="slots.medium.status === SLOT_STATUS.GENERATING" class="fas fa-spinner fa-spin" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="slots.medium.variations.length > 0" class="fas fa-check-circle" style="color: var(--gfy-success-color);"></i>
                  <i v-else class="fas fa-plus" style="color: var(--gfy-text-muted);"></i>
                </div>
                <div class="gfy-intro-slot__preview">{{ getSlotPreview('medium') }}</div>
              </button>

              <!-- Long Slot (2-3 min) -->
              <button
                type="button"
                class="gfy-intro-slot"
                :class="{
                  'gfy-intro-slot--active': activeSlot === 'long',
                  'gfy-intro-slot--locked': slots.long.locked,
                  'gfy-intro-slot--generating': slots.long.status === SLOT_STATUS.GENERATING
                }"
                @click="handleSlotClick('long')"
              >
                <div class="gfy-intro-slot__header">
                  <span class="gfy-intro-slot__label">Long (2-3 min)</span>
                  <i v-if="slots.long.locked" class="fas fa-lock" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="slots.long.status === SLOT_STATUS.GENERATING" class="fas fa-spinner fa-spin" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="slots.long.variations.length > 0" class="fas fa-check-circle" style="color: var(--gfy-success-color);"></i>
                  <i v-else class="fas fa-plus" style="color: var(--gfy-text-muted);"></i>
                </div>
                <div class="gfy-intro-slot__preview">{{ getSlotPreview('long') }}</div>
              </button>

              <!-- Locked Summary -->
              <div v-if="lockedCount > 0" class="gfy-locked-summary">
                <i class="fas fa-lock"></i>
                {{ lockedCount }}/3 introductions locked
              </div>
            </div>
          </aside>

          <!-- MAIN: Variations + Feedback Loop -->
          <main class="gfy-layout-main">
            <!-- Results Header -->
            <div class="gfy-results__header">
              <h3 class="gfy-results__title">
                AI Variations:
                <span style="color: var(--gfy-primary-color)">{{ activeSlotLabel }} Introduction</span>
              </h3>
              <div class="gfy-results__actions">
                <button
                  type="button"
                  class="gfy-btn gfy-btn--outline gfy-btn--small"
                  :disabled="lockedCount === 0 && currentVariations.length === 0"
                  @click="handleCopyAll"
                >
                  <i class="fas fa-copy"></i> Copy All
                </button>
              </div>
            </div>

            <!-- Read-aloud tip -->
            <div class="gfy-intro-tip">
              <i class="fas fa-microphone"></i>
              <span>These introductions are designed to be read aloud by a podcast host or event MC.</span>
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
              <p>Generating {{ getVariationCount(activeSlot) }} variations for your {{ activeSlotLabel }} introduction...</p>
            </div>

            <!-- Locked State -->
            <div v-else-if="currentSlot.locked" class="gfy-locked-intro">
              <div class="gfy-locked-intro__badge">
                <i class="fas fa-lock"></i>
                LOCKED {{ activeSlotLabel.toUpperCase() }} INTRO
              </div>
              <div class="gfy-locked-intro__text">
                <p v-for="(paragraph, pIdx) in currentSlot.lockedIntro.split('\n\n').filter(p => p.trim())" :key="pIdx">
                  {{ paragraph }}
                </p>
              </div>
              <div class="gfy-locked-intro__actions">
                <button type="button" class="gfy-btn gfy-btn--outline" @click="handleCopy(currentSlot.lockedIntro)">
                  <i class="fas fa-copy"></i> Copy
                </button>
                <button type="button" class="gfy-btn gfy-btn--ghost" @click="unlockIntro(activeSlot)">
                  <i class="fas fa-unlock"></i> Unlock & Edit
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="currentVariations.length === 0" class="gfy-empty-state">
              <div class="gfy-empty-state__icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <p>Click the button below to generate {{ getVariationCount(activeSlot) }} variations for your {{ activeSlotLabel }} introduction.</p>
              <button
                type="button"
                class="gfy-generate-intro-btn"
                :disabled="isGenerating"
                @click="generateForSlot(activeSlot)"
              >
                <svg v-if="!isGenerating" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="M2 2l7.586 7.586"/>
                </svg>
                <span v-if="isGenerating" class="gfy-spinner"></span>
                {{ isGenerating ? 'Generating...' : `Generate ${activeSlotLabel} Intro` }}
              </button>
            </div>

            <!-- Variations List -->
            <template v-else>
              <div
                v-for="(variation, index) in currentVariations"
                :key="variation.id"
                class="gfy-intro-variation"
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
                    Lock as {{ activeSlotLabel }} Intro
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
              Introductions saved successfully!
            </div>

            <!-- Save Error -->
            <div v-if="saveError" class="gfy-save-error">
              <i class="fas fa-exclamation-triangle"></i>
              {{ saveError }}
            </div>

            <!-- Cross-tool Navigation -->
            <div v-if="lockedCount > 0 && mode === 'default'" class="gfy-cross-tool-nav">
              <span class="gfy-cross-tool-nav__label">Continue building your media kit:</span>
              <div class="gfy-cross-tool-nav__links">
                <a href="/tools/biography/" class="gfy-cross-tool-nav__link">
                  <i class="fas fa-user"></i> Generate Biography
                </a>
                <a href="/tools/topics/" class="gfy-cross-tool-nav__link">
                  <i class="fas fa-list"></i> Generate Topics
                </a>
                <a href="/tools/questions/" class="gfy-cross-tool-nav__link">
                  <i class="fas fa-question-circle"></i> Generate Interview Questions
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject, onMounted, onUnmounted, toRef } from 'vue';
import { useGeneratorHistory } from '../../src/composables/useGeneratorHistory';
import { useProfileContext } from '../../src/composables/useProfileContext';
import { useStandaloneProfile } from '../../src/composables/useStandaloneProfile';
import { useProfileSelectionHandler } from '../../src/composables/useProfileSelectionHandler';
import { useDraftState } from '../../src/composables/useDraftState';
import { EMBEDDED_PROFILE_DATA_KEY, IS_EMBEDDED_CONTEXT_KEY, AuthorityHookBuilder, ImpactIntroBuilder, ProfileSelector } from '../_shared';

// Integrated mode components
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiLengthSelector from '../../src/vue/components/ai/AiLengthSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

// Constants
const SLOT_STATUS = {
  EMPTY: 'empty',
  GENERATING: 'generating',
  READY: 'ready'
};

// API endpoint constant
const API_ENDPOINT = '/wp-json/gmkb/v2/ai/tool/generate';

/**
 * Process API response variations into a standardized format for guest introductions
 * @param {Object} data - The API response data
 * @param {string} slotName - The slot name for generating unique IDs
 * @returns {Array} Processed variations array
 */
function processGuestIntroVariations(data, slotName) {
  const content = data.data?.content || data.content || data;
  const rawVariations = content.variations || content.results || content || [];
  return (Array.isArray(rawVariations) ? rawVariations : [rawVariations]).map((item, idx) => ({
    id: crypto.randomUUID(),
    label: typeof item === 'object' ? (item.label || `Option ${idx + 1}`) : `Option ${idx + 1}`,
    text: typeof item === 'string' ? item : (item.content || item.text || '')
  })).filter(v => v.text.trim().length > 0);
}

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'warm', label: 'Warm & Welcoming' }
];

const HOOK_STYLE_OPTIONS = [
  { value: 'question', label: 'Question Hook' },
  { value: 'statistic', label: 'Statistic Hook' },
  { value: 'problem', label: 'Problem Hook' },
  { value: 'story', label: 'Story Hook' },
  { value: 'direct', label: 'Direct Introduction' }
];

// Auto-detect if we're inside EmbeddedToolWrapper
const isEmbedded = inject(IS_EMBEDDED_CONTEXT_KEY, false);

const props = defineProps({
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated'].includes(v)
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

const emit = defineEmits(['generated', 'saved', 'applied', 'update:can-generate', 'preview-update', 'authority-hook-update']);

// Inject profile data from parent
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Profile context (for integrated mode)
const {
  profileId,
  isSaving,
  saveError,
  saveToProfile
} = useProfileContext();

// Standalone profile (for default mode)
const {
  isLoggedIn,
  profiles,
  selectedProfileId,
  profileData: standaloneProfileData,
  hasSelectedProfile,
  isLoadingProfiles,
  selectProfile,
  saveMultipleToProfile
} = useStandaloneProfile();

// Draft state for auto-save
const {
  hasDraft,
  lastSaved,
  isAutoSaving,
  saveDraft,
  loadDraft,
  clearDraft,
  startAutoSave,
  getLastSavedText
} = useDraftState('guest-intro');

// Generator history for UX enhancements
const {
  history,
  hasHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  formatTimestamp
} = useGeneratorHistory('guest-intro');

const showHistory = ref(false);

// Prefilled fields tracking
const prefilledFields = ref(new Set());
const showDraftPrompt = ref(false);

// Form State
const guestInfo = reactive({
  name: '',
  titleCompany: ''
});

const episodeInfo = reactive({
  title: '',
  topic: ''
});

const authorityHook = reactive({
  who: '',
  what: '',
  when: '',
  how: ''
});

const impactIntro = reactive({
  where: '',
  why: ''
});

const tone = ref('professional');
const hookStyle = ref('question');
const refinementFeedback = ref('');

// Slots state (Short, Medium, Long)
const slots = reactive({
  short: { variations: [], locked: false, lockedIntro: '', status: SLOT_STATUS.EMPTY },
  medium: { variations: [], locked: false, lockedIntro: '', status: SLOT_STATUS.EMPTY },
  long: { variations: [], locked: false, lockedIntro: '', status: SLOT_STATUS.EMPTY }
});

const activeSlot = ref('short');
const isGenerating = ref(false);
const error = ref(null);
const showResults = ref(false);
const saveSuccess = ref(false);

// Integrated mode state
const authorityHookTextCompact = ref('');
const integratedLength = ref('medium');

// Computed
const currentSlot = computed(() => slots[activeSlot.value]);
const currentVariations = computed(() => currentSlot.value?.variations || []);

const authorityHookSummary = computed(() => {
  const { who, what, when, how } = authorityHook;
  if (!who?.trim() || !what?.trim()) return '';
  let summary = `I help ${who.trim()} ${what.trim()}`;
  if (when?.trim()) summary += ` ${when.trim()}`;
  if (how?.trim()) summary += ` ${how.trim()}`;
  return summary + '.';
});

const impactIntroSummary = computed(() => {
  const { where, why } = impactIntro;
  const parts = [];
  if (where?.trim()) parts.push(where.trim());
  if (why?.trim()) parts.push(`I'm on a mission to ${why.trim()}`);
  return parts.join(' ');
});

const canGenerate = computed(() => {
  return guestInfo.name.trim() && (
    authorityHook.who.trim() || authorityHook.what.trim() ||
    impactIntro.where.trim() || impactIntro.why.trim()
  );
});

const canGenerateIntegrated = computed(() => {
  return guestInfo.name.trim() && authorityHookTextCompact.value.trim();
});

const lockedCount = computed(() => {
  return Object.values(slots).filter(s => s.locked).length;
});

const hasVariations = computed(() => {
  return Object.values(slots).some(s => s.variations.length > 0 || s.locked);
});

const activeSlotLabel = computed(() => {
  const labels = { short: 'Short', medium: 'Medium', long: 'Long' };
  return labels[activeSlot.value] || 'Short';
});

const currentIntro = computed(() => {
  const slot = slots[activeSlot.value];
  return slot?.lockedIntro || (slot?.variations[0]?.text || null);
});

// Form completion tracking for UX
const formCompletion = computed(() => {
  const fields = [
    { name: 'guestName', filled: !!guestInfo.name.trim(), required: true },
    { name: 'titleCompany', filled: !!guestInfo.titleCompany.trim(), required: false },
    { name: 'who', filled: !!authorityHook.who.trim(), required: false },
    { name: 'what', filled: !!authorityHook.what.trim(), required: false },
    { name: 'when', filled: !!authorityHook.when.trim(), required: false },
    { name: 'how', filled: !!authorityHook.how.trim(), required: false },
    { name: 'where', filled: !!impactIntro.where.trim(), required: false },
    { name: 'why', filled: !!impactIntro.why.trim(), required: false }
  ];
  const filledCount = fields.filter(f => f.filled).length;
  const totalCount = fields.length;
  return {
    fields,
    filledCount,
    totalCount,
    percentage: Math.round((filledCount / totalCount) * 100)
  };
});

// Keyboard shortcut handler
const handleKeyboardShortcut = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (canGenerate.value && !isGenerating.value) {
      event.preventDefault();
      handleStartGeneration();
    }
  }
};

// Helper functions
function getVariationCount(slotName) {
  return slotName === 'short' ? 2 : slotName === 'medium' ? 3 : 2;
}

function getSlotPreview(slotName) {
  const slot = slots[slotName];
  if (slot.locked && slot.lockedIntro) {
    return slot.lockedIntro.substring(0, 80) + '...';
  }
  if (slot.variations.length > 0) {
    return slot.variations[0].text.substring(0, 80) + '...';
  }
  return 'Click to generate variations';
}

function setActiveSlot(slotName) {
  activeSlot.value = slotName;
}

// API call to generate introductions
async function generateForSlot(slotName) {
  const slot = slots[slotName];
  slot.status = SLOT_STATUS.GENERATING;
  isGenerating.value = true;
  error.value = null;

  try {
    // Build the prompt context - field names must match prompts.php expectations
    const context = {
      guestName: guestInfo.name,
      guestTitle: guestInfo.titleCompany,  // PHP expects guestTitle
      episodeTitle: episodeInfo.title,
      topic: episodeInfo.topic,  // PHP expects topic, not episodeTopic
      // Authority Hook as object (PHP extracts who/what/when/how from this)
      authorityHook: {
        who: authorityHook.who,
        what: authorityHook.what,
        when: authorityHook.when,
        how: authorityHook.how
      },
      // Impact Intro as object (PHP expects credentials/mission)
      impactIntro: {
        credentials: impactIntro.where,  // PHP expects credentials
        mission: impactIntro.why         // PHP expects mission
      },
      tone: tone.value,
      hookStyle: hookStyle.value,
      length: slotName
    };

    // Get nonce from shortcode data
    const nonce = window.gmkbStandaloneTools?.nonce || '';

    // Build headers with nonce for authentication
    const headers = {
      'Content-Type': 'application/json'
    };
    if (nonce) {
      headers['X-WP-Nonce'] = nonce;
    }

    // Call the tool-based API endpoint
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tool: 'guest-intro-generator',
        params: context,
        context: 'public',
        nonce: nonce
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[GuestIntroGenerator] API response:', data);

    // Process variations from the response using helper function
    slot.variations = processGuestIntroVariations(data, slotName);

    slot.status = SLOT_STATUS.READY;

    // Save to history on success
    if (slot.variations.length > 0) {
      addToHistory({
        input: {
          guestName: guestInfo.name,
          titleCompany: guestInfo.titleCompany,
          who: authorityHook.who,
          what: authorityHook.what,
          length: slotName
        },
        output: slot.variations[0].text,
        metadata: {
          variationCount: slot.variations.length,
          tone: tone.value,
          hookStyle: hookStyle.value
        }
      });
    }

    emit('generated', { slot: slotName, variations: slot.variations });
  } catch (err) {
    console.error('[GuestIntroGenerator] Generation failed:', err);
    error.value = err.message || 'Failed to generate introductions. Please try again.';
    slot.status = SLOT_STATUS.EMPTY;
  } finally {
    isGenerating.value = false;
  }
}

async function refineVariations(feedback) {
  const slot = currentSlot.value;
  slot.status = SLOT_STATUS.GENERATING;
  isGenerating.value = true;
  error.value = null;

  try {
    // Get nonce from shortcode data
    const nonce = window.gmkbStandaloneTools?.nonce || '';

    // Build headers with nonce for authentication
    const headers = {
      'Content-Type': 'application/json'
    };
    if (nonce) {
      headers['X-WP-Nonce'] = nonce;
    }

    // Refinement uses the same generate endpoint with refinement params
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tool: 'guest-intro-generator',
        params: {
          guestName: guestInfo.name,
          guestTitle: guestInfo.titleCompany,
          // Authority Hook as object
          authorityHook: {
            who: authorityHook.who,
            what: authorityHook.what,
            when: authorityHook.when,
            how: authorityHook.how
          },
          // Impact Intro as object
          impactIntro: {
            credentials: impactIntro.where,
            mission: impactIntro.why
          },
          tone: tone.value,
          hookStyle: hookStyle.value,
          length: activeSlot.value,
          // Refinement-specific params
          currentDraft: slot.variations.map(v => v.text).join('\n\n---\n\n'),
          refinementInstructions: feedback
        },
        context: 'public',
        nonce: nonce
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Refinement failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[GuestIntroGenerator] Refine API response:', data);

    // Process variations from the response using helper function
    slot.variations = processGuestIntroVariations(data, activeSlot.value);

    slot.status = SLOT_STATUS.READY;
    refinementFeedback.value = '';
  } catch (err) {
    console.error('[GuestIntroGenerator] Refinement failed:', err);
    error.value = err.message || 'Failed to refine introductions. Please try again.';
    slot.status = SLOT_STATUS.READY;
  } finally {
    isGenerating.value = false;
  }
}

function lockIntro(variationIndex) {
  const slot = currentSlot.value;
  const variation = slot.variations[variationIndex];
  if (variation) {
    slot.lockedIntro = variation.text;
    slot.locked = true;
  }
}

function unlockIntro(slotName) {
  const slot = slots[slotName];
  slot.locked = false;
  slot.lockedIntro = '';
}

function getLockedIntros() {
  const locked = {};
  Object.entries(slots).forEach(([name, slot]) => {
    if (slot.locked && slot.lockedIntro) {
      locked[name] = slot.lockedIntro;
    }
  });
  return locked;
}

async function copyIntro(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('[GuestIntroGenerator] Copy failed:', err);
    return false;
  }
}

function reset() {
  Object.keys(slots).forEach(key => {
    slots[key] = { variations: [], locked: false, lockedIntro: '', status: SLOT_STATUS.EMPTY };
  });
  activeSlot.value = 'short';
  refinementFeedback.value = '';
  error.value = null;
  saveSuccess.value = false;
}

// Event Handlers
async function handleStartGeneration() {
  showResults.value = true;
  await handleGenerateForSlot('short');
}

async function handleSlotClick(slotName) {
  setActiveSlot(slotName);
  if (slots[slotName].status === SLOT_STATUS.EMPTY) {
    await handleGenerateForSlot(slotName);
  }
}

async function handleGenerateForSlot(slotName) {
  try {
    await generateForSlot(slotName);
  } catch (err) {
    console.error('[GuestIntroGenerator] Generation failed:', err);
  }
}

async function handleRefine() {
  if (!refinementFeedback.value.trim()) return;
  try {
    await refineVariations(refinementFeedback.value);
  } catch (err) {
    console.error('[GuestIntroGenerator] Refinement failed:', err);
  }
}

function handleLock(variationIndex) {
  lockIntro(variationIndex);
}

async function handleCopy(text) {
  const success = await copyIntro(text);
  if (success) {
    // Could show a toast notification here
  }
}

async function handleSaveAll() {
  const lockedIntros = getLockedIntros();
  if (Object.keys(lockedIntros).length === 0) return;

  try {
    const saveData = {};
    if (lockedIntros.short) saveData.guest_intro_short = lockedIntros.short;
    if (lockedIntros.medium) saveData.guest_intro = lockedIntros.medium;
    if (lockedIntros.long) saveData.guest_intro_long = lockedIntros.long;

    const result = await saveToProfile('guest-intro', saveData, {
      profileId: profileId.value
    });

    if (result?.success) {
      saveSuccess.value = true;
      setTimeout(() => { saveSuccess.value = false; }, 3000);
      emit('saved', { introductions: lockedIntros });
    }
  } catch (err) {
    console.error('[GuestIntroGenerator] Save failed:', err);
  }
}

function handleStartOver() {
  reset();
  showResults.value = false;
}

// Integrated mode handlers
async function handleGenerateIntegrated() {
  authorityHook.who = authorityHookTextCompact.value;
  setActiveSlot(integratedLength.value);
  await generateForSlot(integratedLength.value);
}

function handleApply() {
  emit('applied', {
    componentId: props.componentId,
    content: currentIntro.value,
    length: activeSlot.value
  });
}

// Handle generate (called by EmbeddedToolApp)
async function handleGenerate() {
  try {
    await handleStartGeneration();
    const intro = currentIntro.value;
    emit('generated', {
      content: intro,
      hook: intro,
      result: intro
    });
    return intro;
  } catch (err) {
    console.error('[GuestIntroGenerator] Generation failed:', err);
    throw err;
  }
}

// Prefilled field helpers
function isFieldPrefilled(fieldName) {
  return prefilledFields.value.has(fieldName);
}

function markFieldEdited(fieldName) {
  prefilledFields.value.delete(fieldName);
}

// Draft state helpers
function getDraftState() {
  return {
    guestInfo: { ...guestInfo },
    episodeInfo: { ...episodeInfo },
    authorityHook: { ...authorityHook },
    impactIntro: { ...impactIntro },
    tone: tone.value,
    hookStyle: hookStyle.value
  };
}

function restoreDraftState(draft) {
  if (draft.guestInfo) Object.assign(guestInfo, draft.guestInfo);
  if (draft.episodeInfo) Object.assign(episodeInfo, draft.episodeInfo);
  if (draft.authorityHook) Object.assign(authorityHook, draft.authorityHook);
  if (draft.impactIntro) Object.assign(impactIntro, draft.impactIntro);
  if (draft.tone) tone.value = draft.tone;
  if (draft.hookStyle) hookStyle.value = draft.hookStyle;
}

function handleRestoreDraft() {
  const draft = loadDraft();
  if (draft) {
    restoreDraftState(draft);
  }
  showDraftPrompt.value = false;
}

function handleDiscardDraft() {
  clearDraft();
  showDraftPrompt.value = false;
}

// Copy All functionality
async function handleCopyAll() {
  const lockedIntros = getLockedIntros();
  if (Object.keys(lockedIntros).length === 0) {
    // If nothing locked, copy current variations
    if (currentVariations.value.length > 0) {
      const formattedVariations = currentVariations.value
        .map((v, i) => `Option ${i + 1}:\n${v.text}`)
        .join('\n\n');
      await navigator.clipboard.writeText(formattedVariations);
    }
    return;
  }

  const parts = [];
  if (lockedIntros.short) parts.push(`== SHORT INTRO (30-45 sec) ==\n${lockedIntros.short}`);
  if (lockedIntros.medium) parts.push(`== MEDIUM INTRO (60-90 sec) ==\n${lockedIntros.medium}`);
  if (lockedIntros.long) parts.push(`== LONG INTRO (2-3 min) ==\n${lockedIntros.long}`);

  await navigator.clipboard.writeText(parts.join('\n\n'));
}

// Profile data population
function populateFromProfile(data) {
  if (!data) return;

  console.log('[GuestIntroGenerator] Populating from profile:', data);

  const newPrefilledFields = new Set();

  // Guest info - always update from profile (overwrite existing)
  const firstName = data.first_name || '';
  const lastName = data.last_name || '';
  const fullName = data.full_name || [firstName, lastName].filter(Boolean).join(' ');
  if (fullName) {
    guestInfo.name = fullName;
    newPrefilledFields.add('guestName');
  }

  // Title & Company
  const title = data.guest_title || data.title || '';
  const company = data.company || data.organization || '';
  if (title || company) {
    guestInfo.titleCompany = company && title ? `${title} at ${company}` : (title || company);
    newPrefilledFields.add('titleCompany');
  }

  // Authority Hook components (profile uses hook_who, hook_what, etc.)
  const hookWho = data.hook_who || data.authority_who || data.who || '';
  const hookWhat = data.hook_what || data.authority_what || data.what || '';
  const hookWhen = data.hook_when || data.authority_when || data.when || '';
  const hookHow = data.hook_how || data.authority_how || data.how || '';

  if (hookWho) {
    authorityHook.who = hookWho;
    newPrefilledFields.add('who');
  }
  if (hookWhat) {
    authorityHook.what = hookWhat;
    newPrefilledFields.add('what');
  }
  if (hookWhen) {
    authorityHook.when = hookWhen;
    newPrefilledFields.add('when');
  }
  if (hookHow) {
    authorityHook.how = hookHow;
    newPrefilledFields.add('how');
  }

  // Impact Intro components (WHERE = credentials, WHY = mission)
  // Profile uses hook_where and hook_why as part of 6 W's framework
  const impactWhere = data.hook_where || data.impact_where || data.where || data.credentials || '';
  const impactWhy = data.hook_why || data.impact_why || data.why || data.mission || data.why_book_you || '';

  if (impactWhere) {
    impactIntro.where = impactWhere;
    newPrefilledFields.add('where');
  }
  if (impactWhy) {
    impactIntro.why = impactWhy;
    newPrefilledFields.add('why');
  }

  prefilledFields.value = newPrefilledFields;
}

// Profile selection handlers (using shared composable)
const { handleProfileSelected, handleProfileCleared } = useProfileSelectionHandler({
  profileIdRef: selectedProfileId,
  onDataLoaded: populateFromProfile,
  mode: toRef(props, 'mode'),
});

// Watchers
watch(injectedProfileData, (newData) => {
  if (newData) {
    populateFromProfile(newData);
  }
}, { immediate: true });

watch(() => props.profileData, (newData) => {
  if (newData) {
    populateFromProfile(newData);
  }
}, { immediate: true });

watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Emit preview updates when authority hook changes
watch(authorityHookSummary, (newValue) => {
  if (newValue) {
    emit('preview-update', { previewHtml: newValue });
  }
});

// Watch standalone profile data
watch(standaloneProfileData, (newData) => {
  if (newData && props.mode === 'default') {
    populateFromProfile(newData);
  }
}, { immediate: true });

// Initialize on mount
onMounted(() => {
  // Check for draft in standalone mode
  if (props.mode === 'default' && hasDraft.value) {
    showDraftPrompt.value = true;
  }

  // Start auto-save in standalone mode
  if (props.mode === 'default') {
    startAutoSave(getDraftState);
  }

  // Add keyboard shortcut listener
  document.addEventListener('keydown', handleKeyboardShortcut);
});

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcut);
});

// Expose for parent
defineExpose({
  handleStartGeneration,
  handleGenerate,
  showResults,
  isGenerating,
  error,
  canGenerate,
  handleCopyAll
});
</script>

<style scoped>
@import "../_shared/gfy-form-base.css";

.gfy-intro-generator {
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
.gfy-intro-hero {
  text-align: center;
  margin-bottom: 40px;
}

.gfy-intro-hero--compact {
  margin-bottom: 30px;
}

.gfy-intro-hero__title {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(to right, #0f172a, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gfy-intro-hero__subtitle {
  color: var(--gfy-text-secondary);
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
}

/* FORM CONTAINER */
.gfy-intro-form__container {
  background: var(--gfy-white);
  border-radius: 16px;
  border: 1px solid var(--gfy-border-color);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

/* Remove container styling when inside wrapper */
.gfy-intro-form__container--no-chrome {
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

.gfy-form-section__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.gfy-form-section__step {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
  font-size: 14px;
  font-weight: 700;
  border-radius: 50%;
  flex-shrink: 0;
}

.gfy-form-section__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0 0 4px 0;
}

.gfy-form-section__subtitle {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
  margin: 0;
}

/* FORM GRID */
.gfy-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 16px;
}

@media (max-width: 600px) {
  .gfy-form-grid {
    grid-template-columns: 1fr;
  }
}

/* FORM GROUPS */
.gfy-form-group {
  margin-bottom: 0;
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
  gap: 16px;
  margin-bottom: 20px;
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

.gfy-intro-results__container {
  background: var(--gfy-white);
  border-radius: 16px;
  border: 1px solid var(--gfy-border-color);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Remove container styling when embedded */
.gfy-intro-results__container--no-chrome {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.gfy-intro-results__container--no-chrome .gfy-results-layout {
  padding: 0;
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

/* INTRO SLOTS */
.gfy-intro-slot {
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

.gfy-intro-slot:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-intro-slot--active {
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 2px var(--gfy-primary-color);
}

.gfy-intro-slot--locked {
  background: var(--gfy-primary-light);
  border-color: var(--gfy-primary-color);
}

.gfy-intro-slot--generating {
  opacity: 0.7;
}

.gfy-intro-slot__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.gfy-intro-slot__label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
}

.gfy-intro-slot--locked .gfy-intro-slot__label {
  color: var(--gfy-primary-color);
}

.gfy-intro-slot__preview {
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

/* INTRO TIP */
.gfy-intro-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: var(--gfy-radius-md);
  font-size: 0.9rem;
  color: #92400e;
  margin-bottom: 1.5rem;
}

.gfy-intro-tip i {
  color: #d97706;
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

.gfy-empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: var(--gfy-bg-color);
  border-radius: 50%;
  color: var(--gfy-text-muted);
}

.gfy-empty-state p {
  max-width: 320px;
  margin: 0 auto 24px;
  line-height: 1.6;
}

/* Generate Intro Button - Premium Style */
.gfy-generate-intro-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 32px;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.35);
}

.gfy-generate-intro-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.45);
}

.gfy-generate-intro-btn:active:not(:disabled) {
  transform: translateY(0);
}

.gfy-generate-intro-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.gfy-generate-intro-btn svg {
  flex-shrink: 0;
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
.gfy-locked-intro {
  background: var(--gfy-primary-light);
  border: 2px solid var(--gfy-primary-color);
  border-radius: var(--gfy-radius-lg);
  padding: 24px;
}

.gfy-locked-intro__badge {
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

.gfy-locked-intro__text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--gfy-text-primary);
  margin: 0 0 20px 0;
}

.gfy-locked-intro__text p {
  margin: 0 0 1em 0;
}

.gfy-locked-intro__text p:last-child {
  margin-bottom: 0;
}

.gfy-locked-intro__actions {
  display: flex;
  gap: 12px;
}

/* VARIATIONS */
.gfy-intro-variation {
  padding: 2rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: 10px;
  margin-bottom: 1.5rem;
  position: relative;
  transition: border-color 0.2s;
}

.gfy-intro-variation:hover {
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
   NEW FEATURES: PREFILLED, DRAFT, CROSS-TOOL NAV
   ============================================ */

/* Prefilled Badge */
.gfy-prefilled-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--gfy-success-light);
  color: #047857;
  border-radius: 4px;
}

.gfy-form-input--prefilled {
  border-color: var(--gfy-success-color);
  background: linear-gradient(to right, var(--gfy-success-light), var(--gfy-white));
}

/* Draft Prompt */
.gfy-draft-prompt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: var(--gfy-radius-md);
  margin-bottom: 24px;
}

.gfy-draft-prompt__content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gfy-draft-prompt__content i {
  font-size: 20px;
  color: #d97706;
}

.gfy-draft-prompt__content strong {
  display: block;
  color: #92400e;
  margin-bottom: 2px;
}

.gfy-draft-prompt__content p {
  margin: 0;
  font-size: 0.85rem;
  color: #92400e;
}

.gfy-draft-prompt__actions {
  display: flex;
  gap: 8px;
}

/* Auto-save Indicator */
.gfy-autosave-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--gfy-primary-light);
  color: var(--gfy-primary-color);
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: var(--gfy-radius-md);
  margin-bottom: 16px;
}

.gfy-autosave-indicator i {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Results Actions */
.gfy-results__actions {
  display: flex;
  gap: 8px;
}

/* Small Button Variant */
.gfy-btn--small {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
}

/* Cross-tool Navigation */
.gfy-cross-tool-nav {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gfy-border-color);
}

.gfy-cross-tool-nav__label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gfy-text-secondary);
  margin-bottom: 12px;
}

.gfy-cross-tool-nav__links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.gfy-cross-tool-nav__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--gfy-text-secondary);
  text-decoration: none;
  transition: all 0.15s;
}

.gfy-cross-tool-nav__link:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-cross-tool-nav__link i {
  font-size: 12px;
}
</style>
