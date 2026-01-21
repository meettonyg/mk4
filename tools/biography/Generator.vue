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
    @regenerate="handleGenerateForActiveSlot"
    @copy="() => copyBio(currentBio)"
    @retry="handleGenerateForActiveSlot"
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

  <!-- Default/Standalone Mode: Full Biography Toolkit -->
  <div v-else class="gfy-bio-generator">
    <!-- Phase 1: Input Form -->
    <div v-if="!showResults" class="gfy-bio-form">
      <!-- Hero Section (only show in default mode, not when embedded in landing page) -->
      <div v-if="mode === 'default' && !isEmbedded" class="gfy-bio-hero">
        <h1 class="gfy-bio-hero__title">Professional Biography Generator</h1>
        <p class="gfy-bio-hero__subtitle">
          Create compelling professional biographies using the Authority Hook and Impact Intro frameworks.
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
      <div class="gfy-bio-form__container" :class="{ 'gfy-bio-form__container--no-chrome': isEmbedded }">
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
              <label class="gfy-form-label gfy-form-label--required">
                Your Name
                <span v-if="isFieldPrefilled('name')" class="gfy-prefilled-badge">from profile</span>
              </label>
              <input
                v-model="name"
                type="text"
                class="gfy-form-input"
                :class="{ 'gfy-form-input--prefilled': isFieldPrefilled('name') }"
                placeholder="e.g., Dr. Jane Smith"
                @input="markFieldEdited('name')"
              />
            </div>

            <div class="gfy-form-group">
              <label class="gfy-form-label">
                Professional Title
                <span v-if="isFieldPrefilled('title')" class="gfy-prefilled-badge">from profile</span>
              </label>
              <input
                v-model="optionalFields.title"
                type="text"
                class="gfy-form-input"
                :class="{ 'gfy-form-input--prefilled': isFieldPrefilled('title') }"
                placeholder="e.g., Executive Coach & Leadership Strategist"
                @input="markFieldEdited('title')"
              />
            </div>
          </div>

          <div class="gfy-form-group">
            <label class="gfy-form-label">
              Organization / Company
              <span v-if="isFieldPrefilled('organization')" class="gfy-prefilled-badge">from profile</span>
            </label>
            <input
              v-model="optionalFields.organization"
              type="text"
              class="gfy-form-input"
              :class="{ 'gfy-form-input--prefilled': isFieldPrefilled('organization') }"
              placeholder="e.g., Acme Corporation"
              @input="markFieldEdited('organization')"
            />
          </div>
        </div>

        <!-- Authority Hook Section (WHO, WHAT, WHEN, HOW) -->
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

        <!-- Impact Intro Section (WHERE, WHY) -->
        <ImpactIntroBuilder
          :model-value="impactIntro"
          @update:model-value="Object.assign(impactIntro, $event)"
          title="Impact Intro"
          :placeholders="{
            where: 'e.g., Featured in Forbes, Inc., and Entrepreneur. Keynoted at 50+ conferences worldwide.',
            why: 'e.g., Help every founder achieve sustainable growth without sacrificing their health or relationships.'
          }"
        />

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
            <div class="gfy-form-footer">
              <span class="gfy-form-hint">If you have an existing bio, we'll use it as inspiration while crafting new versions.</span>
              <span v-if="optionalFields.existingBio" class="gfy-char-count">{{ optionalFields.existingBio.length }} characters</span>
            </div>
          </div>

          <div class="gfy-form-group">
            <label class="gfy-form-label">Additional Notes</label>
            <textarea
              v-model="optionalFields.additionalNotes"
              class="gfy-form-textarea"
              rows="2"
              placeholder="Any specific achievements, tone preferences, or details to include..."
            ></textarea>
            <div class="gfy-form-footer">
              <span class="gfy-form-hint"></span>
              <span v-if="optionalFields.additionalNotes" class="gfy-char-count">{{ optionalFields.additionalNotes.length }} characters</span>
            </div>
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
            {{ isGenerating ? 'Generating...' : 'Generate Biography Toolkit' }}
          </button>
          <p class="gfy-form-hint">
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
      <!-- Results Hero (only show when not embedded) -->
      <div v-if="!isEmbedded" class="gfy-bio-hero gfy-bio-hero--compact">
        <h1 class="gfy-bio-hero__title">Biography Toolkit</h1>
        <p class="gfy-bio-hero__subtitle">
          Refine your professional presence. Select a slot and provide feedback to iterate with AI.
        </p>
      </div>

      <div class="gfy-bio-results__container" :class="{ 'gfy-bio-results__container--no-chrome': isEmbedded }">
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
            <!-- Error Display in Results View -->
            <div v-if="error" class="gfy-error-box">
              <i class="fas fa-exclamation-circle"></i>
              <p>{{ error }}</p>
              <button type="button" class="gfy-btn gfy-btn--outline" @click="handleGenerateForActiveSlot">
                Try Again
              </button>
            </div>

            <!-- Results Header -->
            <div class="gfy-results__header">
              <h3 class="gfy-results__title">
                AI Variations:
                <span style="color: var(--gfy-primary-color)">{{ activeSlotLabel }} Biography</span>
              </h3>
              <div class="gfy-results__actions">
                <button
                  type="button"
                  class="gfy-btn gfy-btn--outline"
                  :disabled="isGenerating"
                  @click="handleGenerateForActiveSlot"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                  </svg>
                  {{ isGenerating ? 'Generating...' : 'Regenerate' }}
                </button>
                <button
                  type="button"
                  class="gfy-btn gfy-btn--outline"
                  @click="handleCopyAll"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy All
                </button>
              </div>
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
                  <button type="button" class="gfy-btn gfy-btn--ghost" @click="unlockBio()">
                    <i class="fas fa-unlock"></i> Unlock & Edit
                  </button>
                </div>
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
              <p>Click the button below to generate {{ getVariationCount(activeSlot) }} variations for your {{ activeSlotLabel }} biography.</p>
              <button
                type="button"
                class="gfy-generate-bio-btn"
                :disabled="isGenerating"
                @click="handleGenerateForActiveSlot"
              >
                <svg v-if="!isGenerating" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="M2 2l7.586 7.586"/>
                </svg>
                <span v-if="isGenerating" class="gfy-spinner"></span>
                {{ isGenerating ? 'Generating...' : `Generate ${activeSlotLabel} Bio` }}
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
                :disabled="lockedCount === 0 || isSaving || (mode === 'default' && !hasSelectedProfile)"
                :title="mode === 'default' && !hasSelectedProfile ? 'Select a profile above to save' : ''"
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

            <!-- Cross-tool Navigation -->
            <div v-if="lockedCount > 0 && mode === 'default'" class="gfy-cross-tool-nav">
              <span class="gfy-cross-tool-nav__label">Continue building your media kit:</span>
              <div class="gfy-cross-tool-nav__links">
                <a href="/tools/guest-intro/" class="gfy-cross-tool-nav__link">
                  <i class="fas fa-microphone"></i> Generate Guest Intro
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
import { ref, computed, watch, inject, reactive, onMounted, onUnmounted, toRef } from 'vue';
import { useProfileContext } from '../../src/composables/useProfileContext';
import { useStandaloneProfile } from '../../src/composables/useStandaloneProfile';
import { useProfileSelectionHandler } from '../../src/composables/useProfileSelectionHandler';
import { useDraftState } from '../../src/composables/useDraftState';
import { useGeneratorHistory } from '../../src/composables/useGeneratorHistory';
import { EMBEDDED_PROFILE_DATA_KEY, IS_EMBEDDED_CONTEXT_KEY, AuthorityHookBuilder, ImpactIntroBuilder, ProfileSelector } from '../_shared';

// Integrated mode components
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiLengthSelector from '../../src/vue/components/ai/AiLengthSelector.vue';
import AiPovSelector from '../../src/vue/components/ai/AiPovSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

// ============================================================================
// CONSTANTS (previously from useAIBiography composable)
// ============================================================================

const SLOT_STATUS = {
  EMPTY: 'empty',
  GENERATING: 'generating',
  HAS_VARIATIONS: 'has_variations',
  LOCKED: 'locked'
};

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'friendly', label: 'Friendly & Approachable' },
  { value: 'bold', label: 'Bold & Confident' }
];

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short (50 words)', description: 'Social media, brief intros', wordCount: 50, variations: 5 },
  { value: 'medium', label: 'Medium (150 words)', description: 'Speaker profiles, websites', wordCount: 150, variations: 3 },
  { value: 'long', label: 'Long (300 words)', description: 'Press kits, formal intros', wordCount: 300, variations: 2 }
];

const POV_OPTIONS = [
  { value: 'first', label: 'First Person (I/My)' },
  { value: 'second', label: 'Second Person (You/Your)' },
  { value: 'third', label: 'Third Person (He/She/They)' }
];

function getVariationCount(length) {
  const option = LENGTH_OPTIONS.find(o => o.value === length);
  return option?.variations || 3;
}

// ============================================================================
// LOCAL STATE (previously from useAIBiography composable)
// ============================================================================

// Core form state
const name = ref('');
const tone = ref('professional');
const pov = ref('third');
const activeSlot = ref('long');
const refinementFeedback = ref('');
const error = ref(null);

// Slots state
const slots = reactive({
  short: { status: SLOT_STATUS.EMPTY, variations: [], locked: false, lockedBio: null },
  medium: { status: SLOT_STATUS.EMPTY, variations: [], locked: false, lockedBio: null },
  long: { status: SLOT_STATUS.EMPTY, variations: [], locked: false, lockedBio: null }
});

// Authority Hook (Who-What-When-How)
const authorityHook = reactive({
  who: '',
  what: '',
  when: '',
  how: ''
});

// Impact Intro (Where-Why)
const impactIntro = reactive({
  where: '',
  why: ''
});

// Optional fields
const optionalFields = reactive({
  title: '',
  organization: '',
  existingBio: '',
  additionalNotes: ''
});

// ============================================================================
// COMPUTED PROPERTIES (previously from useAIBiography composable)
// ============================================================================

const currentSlot = computed(() => slots[activeSlot.value]);
const currentVariations = computed(() => currentSlot.value?.variations || []);
const hasVariations = computed(() => currentVariations.value.length > 0);

const isGenerating = computed(() => {
  return Object.values(slots).some(s => s.status === SLOT_STATUS.GENERATING);
});

const lockedCount = computed(() => {
  return Object.values(slots).filter(s => s.locked).length;
});

const authorityHookSummary = computed(() => {
  const parts = [];
  if (authorityHook.who) parts.push(`I help ${authorityHook.who}`);
  if (authorityHook.what) parts.push(`achieve ${authorityHook.what}`);
  if (authorityHook.when) parts.push(`when ${authorityHook.when}`);
  if (authorityHook.how) parts.push(`through ${authorityHook.how}`);
  return parts.length > 0 ? parts.join(' ') + '.' : '';
});

const impactIntroSummary = computed(() => {
  const parts = [];
  if (impactIntro.where) parts.push(`I've ${impactIntro.where}`);
  if (impactIntro.why) parts.push(`My mission is to ${impactIntro.why}`);
  return parts.join('. ') + (parts.length > 0 ? '.' : '');
});

const canGenerate = computed(() => {
  const hasName = name.value.trim();
  const hasAuthorityHook = authorityHook.who || authorityHook.what || authorityHook.when || authorityHook.how;
  const hasImpactIntro = impactIntro.where || impactIntro.why;
  return hasName && (hasAuthorityHook || hasImpactIntro);
});

// ============================================================================
// HELPER METHODS (previously from useAIBiography composable)
// ============================================================================

function setActiveSlot(slotName) {
  if (slots[slotName]) {
    activeSlot.value = slotName;
  }
}

function lockBio(variationIndex) {
  const slot = slots[activeSlot.value];
  if (!slot || !slot.variations[variationIndex]) return;
  slot.locked = true;
  slot.lockedBio = slot.variations[variationIndex].text;
  slot.status = SLOT_STATUS.LOCKED;
}

function unlockBio(slotName = null) {
  const targetSlot = slotName || activeSlot.value;
  const slot = slots[targetSlot];
  if (!slot) return;
  slot.locked = false;
  slot.lockedBio = null;
  slot.status = slot.variations.length > 0 ? SLOT_STATUS.HAS_VARIATIONS : SLOT_STATUS.EMPTY;
}

function getSlotPreview(slotName) {
  const slot = slots[slotName];
  if (!slot) return '';
  if (slot.locked && slot.lockedBio) {
    return slot.lockedBio.substring(0, 80) + '...';
  }
  if (slot.status === SLOT_STATUS.GENERATING) {
    return 'Generating variations...';
  }
  if (slot.variations.length > 0) {
    return `${slot.variations.length} variations ready`;
  }
  const variationCount = getVariationCount(slotName);
  return `Click to generate ${variationCount} variations`;
}

function getLockedBios() {
  const result = {};
  Object.entries(slots).forEach(([key, slot]) => {
    if (slot.locked && slot.lockedBio) {
      result[key] = slot.lockedBio;
    }
  });
  return result;
}

async function copyBio(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('[Biography] Failed to copy:', err);
    return false;
  }
}

function reset() {
  name.value = '';
  tone.value = 'professional';
  pov.value = 'third';
  authorityHook.who = '';
  authorityHook.what = '';
  authorityHook.when = '';
  authorityHook.how = '';
  impactIntro.where = '';
  impactIntro.why = '';
  optionalFields.title = '';
  optionalFields.organization = '';
  optionalFields.existingBio = '';
  optionalFields.additionalNotes = '';
  refinementFeedback.value = '';
  error.value = null;

  Object.keys(slots).forEach(key => {
    slots[key] = {
      status: SLOT_STATUS.EMPTY,
      variations: [],
      locked: false,
      lockedBio: null
    };
  });
  activeSlot.value = 'long';
}

function populateFromProfile(profileData) {
  if (!profileData) return;

  // Name
  const firstName = profileData.first_name || profileData.firstName || '';
  const lastName = profileData.last_name || profileData.lastName || '';
  const fullName = profileData.full_name || profileData.fullName || profileData.name || '';
  name.value = fullName || [firstName, lastName].filter(Boolean).join(' ');

  // Title/Role
  const title = profileData.guest_title || profileData.title || profileData.professional_title || '';
  if (title) optionalFields.title = title;

  // Organization/Company
  const org = profileData.organization || profileData.company || profileData.org || '';
  if (org) optionalFields.organization = org;

  // Authority Hook
  const hookWho = profileData.hook_who || profileData.hookWho || profileData.who || '';
  const hookWhat = profileData.hook_what || profileData.hookWhat || profileData.what || '';
  const hookWhen = profileData.hook_when || profileData.hookWhen || profileData.when || '';
  const hookHow = profileData.hook_how || profileData.hookHow || profileData.how || '';
  if (hookWho) authorityHook.who = hookWho;
  if (hookWhat) authorityHook.what = hookWhat;
  if (hookWhen) authorityHook.when = hookWhen;
  if (hookHow) authorityHook.how = hookHow;

  // Impact Intro
  const impactData = profileData.impact_intro || profileData.impactIntro || {};
  const whereVal = profileData.hook_where || profileData.hookWhere ||
                   profileData.impact_where || profileData.impactWhere ||
                   impactData.where || profileData.where ||
                   profileData.credentials || profileData.achievements || '';
  const whyVal = profileData.hook_why || profileData.hookWhy ||
                 profileData.impact_why || profileData.impactWhy ||
                 impactData.why || profileData.why ||
                 profileData.mission || profileData.purpose || '';
  if (whereVal) impactIntro.where = whereVal;
  if (whyVal) impactIntro.why = whyVal;

  // Existing biography
  const existingBio = profileData.biography || profileData.bio || '';
  if (existingBio) optionalFields.existingBio = existingBio;

  // Pre-populate locked bios if they exist
  if (profileData.biography_short || profileData.biographyShort) {
    slots.short.locked = true;
    slots.short.lockedBio = profileData.biography_short || profileData.biographyShort;
    slots.short.status = SLOT_STATUS.LOCKED;
  }
  if (profileData.biography) {
    slots.medium.locked = true;
    slots.medium.lockedBio = profileData.biography;
    slots.medium.status = SLOT_STATUS.LOCKED;
  }
  if (profileData.biography_long || profileData.biographyLong) {
    slots.long.locked = true;
    slots.long.lockedBio = profileData.biography_long || profileData.biographyLong;
    slots.long.status = SLOT_STATUS.LOCKED;
  }
}

// ============================================================================
// COMPONENT SETUP
// ============================================================================

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

const emit = defineEmits(['generated', 'saved', 'applied', 'update:can-generate']);

// Inject profile data from parent
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

const {
  profileId,
  isSaving,
  saveError,
  saveToProfile
} = useProfileContext();

// Profile save functionality (standalone mode)
const {
  selectedProfileId: standaloneProfileId,
  hasSelectedProfile,
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
} = useDraftState('biography');

// Generator history for UX enhancement
const {
  history,
  hasHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  formatTimestamp
} = useGeneratorHistory('biography');

const showHistory = ref(false);

// Prefilled fields tracking
const prefilledFields = ref(new Set());
const showDraftPrompt = ref(false);

// Local state
const showResults = ref(false);
const saveSuccess = ref(false);
const copiedText = ref('');

// Integrated mode specific state
const authorityHookTextCompact = ref('');
const integratedLength = ref('medium');

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
  await handleGenerateForSlot(integratedLength.value);
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
 * Handle generate (called by EmbeddedToolApp)
 */
const handleGenerate = async () => {
  try {
    // Start generation with long bio by default
    await handleStartGeneration();

    // Get the generated bio
    const bio = currentBio.value;

    // Emit result for EmbeddedToolWrapper to display
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
 * Form completion tracking for UX enhancement
 */
const formCompletion = computed(() => {
  const fields = [
    { name: 'Name', filled: !!name.value },
    { name: 'Who You Help', filled: !!authorityHook.who },
    { name: 'What You Do', filled: !!authorityHook.what },
    { name: 'When They Need You', filled: !!authorityHook.when },
    { name: 'How You Help', filled: !!authorityHook.how }
  ];
  const filledCount = fields.filter(f => f.filled).length;
  return {
    fields,
    filledCount,
    totalCount: fields.length,
    percentage: Math.round((filledCount / fields.length) * 100),
    isComplete: canGenerate.value
  };
});

/**
 * Keyboard shortcut handler for Ctrl/Cmd + Enter
 */
const handleKeyboardShortcut = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (canGenerate.value && !isGenerating.value) {
      event.preventDefault();
      handleStartGeneration();
    }
  }
};

/**
 * Handle starting generation - goes to results view
 */
const handleStartGeneration = async () => {
  console.log('[Biography Generator] handleStartGeneration called');
  console.log('[Biography Generator] canGenerate:', canGenerate.value);
  console.log('[Biography Generator] Form data:', {
    name: name.value,
    authorityHook: { ...authorityHook },
    impactIntro: { ...impactIntro }
  });

  showResults.value = true;

  // Scroll to top to prevent page shift when switching views
  window.scrollTo({ top: 0, behavior: 'instant' });

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
 * Handle generate for a specific slot - using direct API call
 */
const handleGenerateForSlot = async (slotName) => {
  console.log('[Biography Generator] handleGenerateForSlot called with:', slotName);
  console.log('[Biography Generator] Current state:', {
    name: name.value,
    authorityHook: { ...authorityHook },
    impactIntro: { ...impactIntro },
    canGenerate: canGenerate.value
  });

  const slot = slots[slotName];
  slot.status = SLOT_STATUS.GENERATING;
  setActiveSlot(slotName);
  error.value = null;

  try {
    // Build context for the API
    const context = {
      name: name.value,
      title: optionalFields.title,
      organization: optionalFields.organization,
      authorityHook: {
        who: authorityHook.who,
        what: authorityHook.what,
        when: authorityHook.when,
        how: authorityHook.how
      },
      impactIntro: impactIntroSummary.value,
      existingBio: optionalFields.existingBio,
      additionalNotes: optionalFields.additionalNotes,
      tone: tone.value,
      length: slotName,
      pov: pov.value
    };

    console.log('[Biography Generator] Calling API with context:', context);

    // Get the public nonce for API authentication
    const nonce = window.gmkbStandaloneTools?.nonce ||
                  window.gmkbPublicNonce ||
                  window.gmkbPublicData?.publicNonce || '';

    // Call the tool-based API endpoint
    const response = await fetch('/wp-json/gmkb/v2/ai/tool/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'biography-generator',
        params: context,
        context: 'public',
        nonce
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Biography Generator] API response:', data);

    // Process variations from the response
    // API returns { success, data: { content: { variations: [...] } } }
    const content = data.data?.content || data.content || data;
    const rawVariations = content.variations || content.results || content || [];
    slot.variations = (Array.isArray(rawVariations) ? rawVariations : [rawVariations]).map((item, idx) => ({
      id: `${slotName}-${Date.now()}-${idx}`,
      label: typeof item === 'object' ? (item.label || `OPTION ${idx + 1}`) : `OPTION ${idx + 1}`,
      text: typeof item === 'string' ? item : (item.content || item.text || '')
    })).filter(v => v.text.trim().length > 0);

    slot.status = SLOT_STATUS.HAS_VARIATIONS;
    console.log('[Biography Generator] Parsed variations:', slot.variations);

    emit('generated', { slot: slotName, variations: slot.variations });

    // Save to history on success
    if (slot.variations.length > 0) {
      addToHistory({
        inputs: {
          name: name.value,
          authorityHook: { ...authorityHook },
          impactIntro: { ...impactIntro },
          tone: tone.value,
          pov: pov.value,
          slot: slotName
        },
        results: slot.variations,
        preview: slot.variations[0]?.text?.substring(0, 50) || 'Generated biography'
      });
    }
  } catch (err) {
    console.error('[Biography Generator] Generation failed:', err);
    error.value = err.message || 'Failed to generate biographies. Please try again.';
    slot.status = SLOT_STATUS.EMPTY;
  }
};

/**
 * Handle generate for the currently active slot
 * Wrapper that explicitly uses activeSlot.value to avoid ref issues
 */
const handleGenerateForActiveSlot = async () => {
  console.log('[Biography Generator] handleGenerateForActiveSlot called, activeSlot:', activeSlot.value);
  await handleGenerateForSlot(activeSlot.value);
};

/**
 * Handle refinement - using direct API call
 */
const handleRefine = async () => {
  if (!refinementFeedback.value.trim()) return;

  const slotName = activeSlot.value;
  const slot = slots[slotName];

  slot.status = SLOT_STATUS.GENERATING;
  error.value = null;

  try {
    // Get the public nonce for API authentication
    const nonce = window.gmkbStandaloneTools?.nonce ||
                  window.gmkbPublicNonce ||
                  window.gmkbPublicData?.publicNonce || '';

    // Refinement uses the same generate endpoint with refinement params
    const response = await fetch('/wp-json/gmkb/v2/ai/tool/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'biography-generator',
        params: {
          name: name.value,
          authorityHook: {
            who: authorityHook.who,
            what: authorityHook.what,
            when: authorityHook.when,
            how: authorityHook.how
          },
          impactIntro: impactIntroSummary.value,
          tone: tone.value,
          length: slotName,
          pov: pov.value,
          // Refinement-specific params
          currentDraft: slot.variations.map(v => v.text).join('\n\n---\n\n'),
          refinementInstructions: refinementFeedback.value
        },
        context: 'public',
        nonce
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Refinement failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Biography Generator] Refine API response:', data);

    // Process variations from the response
    // API returns { success, data: { content: { variations: [...] } } }
    const content = data.data?.content || data.content || data;
    const rawVariations = content.variations || content.results || content || [];
    slot.variations = (Array.isArray(rawVariations) ? rawVariations : [rawVariations]).map((item, idx) => ({
      id: `${slotName}-${Date.now()}-${idx}`,
      label: typeof item === 'object' ? (item.label || `OPTION ${idx + 1}`) : `OPTION ${idx + 1}`,
      text: typeof item === 'string' ? item : (item.content || item.text || '')
    })).filter(v => v.text.trim().length > 0);

    slot.status = SLOT_STATUS.HAS_VARIATIONS;
    refinementFeedback.value = '';
  } catch (err) {
    console.error('[Biography Generator] Refinement failed:', err);
    error.value = err.message || 'Failed to refine biographies. Please try again.';
    slot.status = SLOT_STATUS.HAS_VARIATIONS; // Keep existing variations
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
 * Handle copy all locked bios to clipboard
 */
const handleCopyAll = async () => {
  const lockedBios = getLockedBios();
  const parts = [];

  if (lockedBios.short) {
    parts.push(`== SHORT BIO ==\n${lockedBios.short}`);
  }
  if (lockedBios.medium) {
    parts.push(`== MEDIUM BIO ==\n${lockedBios.medium}`);
  }
  if (lockedBios.long) {
    parts.push(`== LONG BIO ==\n${lockedBios.long}`);
  }

  if (parts.length === 0) {
    // Fallback to current variations
    if (currentVariations.value && currentVariations.value.length > 0) {
      const formattedVariations = currentVariations.value
        .map((v, i) => `Option ${i + 1}:\n${v}`)
        .join('\n\n');
      try {
        await navigator.clipboard.writeText(formattedVariations);
      } catch (err) {
        console.error('[BiographyGenerator] Failed to copy:', err);
      }
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(parts.join('\n\n'));
  } catch (err) {
    console.error('[BiographyGenerator] Failed to copy all:', err);
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

  // Build save data
  const saveData = {};
  if (lockedBios.short) saveData.biography_short = lockedBios.short;
  if (lockedBios.medium) saveData.biography = lockedBios.medium;
  if (lockedBios.long) saveData.biography_long = lockedBios.long;

  // Use standalone profile save in default mode
  if (props.mode === 'default' && hasSelectedProfile.value) {
    try {
      const success = await saveMultipleToProfile(saveData);
      if (success) {
        saveSuccess.value = true;
        setTimeout(() => { saveSuccess.value = false; }, 3000);
        emit('saved', { biographies: lockedBios });
      }
    } catch (err) {
      console.error('[Biography Generator] Standalone save failed:', err);
    }
    return;
  }

  // Fallback to useProfileContext save (for integrated/embedded modes)
  try {
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
  clearDraft(); // Clear saved draft when starting over
};

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
    name: name.value,
    authorityHook: { ...authorityHook },
    impactIntro: { ...impactIntro },
    optionalFields: { ...optionalFields },
    tone: tone.value,
    pov: pov.value
  };
}

function restoreDraftState(draft) {
  if (draft.name) name.value = draft.name;
  if (draft.authorityHook) Object.assign(authorityHook, draft.authorityHook);
  if (draft.impactIntro) Object.assign(impactIntro, draft.impactIntro);
  if (draft.optionalFields) Object.assign(optionalFields, draft.optionalFields);
  if (draft.tone) tone.value = draft.tone;
  if (draft.pov) pov.value = draft.pov;
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

/**
 * Populate from profile data
 */
function loadProfileData(data) {
  if (!data) return;

  // Track prefilled fields
  const newPrefilledFields = new Set();

  if (data.full_name || data.first_name) newPrefilledFields.add('name');
  if (data.guest_title || data.title) newPrefilledFields.add('title');
  if (data.company || data.organization) newPrefilledFields.add('organization');
  if (data.hook_who || data.authority_hook_who) newPrefilledFields.add('who');
  if (data.hook_what || data.authority_hook_what) newPrefilledFields.add('what');
  if (data.hook_when || data.authority_hook_when) newPrefilledFields.add('when');
  if (data.hook_how || data.authority_hook_how) newPrefilledFields.add('how');
  if (data.hook_where || data.authority_hook_where) newPrefilledFields.add('where');
  if (data.hook_why || data.authority_hook_why) newPrefilledFields.add('why');

  prefilledFields.value = newPrefilledFields;

  populateFromProfile(data);
}

// Profile selection handlers (using shared composable)
const { handleProfileSelected, handleProfileCleared } = useProfileSelectionHandler({
  profileIdRef: standaloneProfileId,
  onDataLoaded: loadProfileData,
  mode: toRef(props, 'mode'),
});

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

// Watch canGenerate for parent
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
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
  window.addEventListener('keydown', handleKeyboardShortcut);
});

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardShortcut);
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

/* Remove container styling when inside wrapper */
.gfy-bio-form__container--no-chrome {
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

.gfy-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 6px;
}

.gfy-form-footer .gfy-form-hint {
  margin-top: 0;
  flex: 1;
}

.gfy-char-count {
  font-size: 0.75rem;
  color: var(--gfy-text-muted, #94a3b8);
  white-space: nowrap;
  flex-shrink: 0;
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

.gfy-bio-results__container {
  background: var(--gfy-white);
  border-radius: 16px;
  border: 1px solid var(--gfy-border-color);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Remove container styling when embedded */
.gfy-bio-results__container--no-chrome {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.gfy-bio-results__container--no-chrome .gfy-results-layout {
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

.gfy-results__actions {
  display: flex;
  gap: 8px;
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

/* Generate Bio Button - Premium Style */
.gfy-generate-bio-btn {
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

.gfy-generate-bio-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.45);
}

.gfy-generate-bio-btn:active:not(:disabled) {
  transform: translateY(0);
}

.gfy-generate-bio-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.gfy-generate-bio-btn svg {
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
