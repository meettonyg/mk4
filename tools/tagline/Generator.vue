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
    <!-- Profile Context Banner (for logged-in users) -->
    <template #profile-context>
      <ProfileContextBanner
        @profile-loaded="handleProfileLoaded"
        @profile-cleared="handleProfileCleared"
      />

      <!-- Draft Restore Prompt -->
      <div v-if="showDraftPrompt" class="gfy-draft-prompt">
        <div class="gfy-draft-prompt__content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <div>
            <strong>Restore your draft?</strong>
            <p>You have an unsaved draft from {{ getLastSavedText() }}</p>
          </div>
        </div>
        <div class="gfy-draft-prompt__actions">
          <button type="button" class="gfy-btn gfy-btn--primary gfy-btn--small" @click="restoreFromDraft(loadDraft())">
            Restore
          </button>
          <button type="button" class="gfy-btn gfy-btn--outline gfy-btn--small" @click="dismissDraftPrompt">
            Discard
          </button>
        </div>
      </div>

      <!-- History Toggle -->
      <div v-if="hasHistory" class="gfy-history">
        <button
          type="button"
          class="gfy-history__toggle"
          @click="showHistory = !showHistory"
          aria-expanded="showHistory"
          aria-controls="tagline-history-panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Recent Generations ({{ history.length }})
          <svg
            class="gfy-history__chevron"
            :class="{ 'gfy-history__chevron--open': showHistory }"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div v-if="showHistory" id="tagline-history-panel" class="gfy-history__panel">
          <div class="gfy-history__list">
            <div v-for="entry in history" :key="entry.id" class="gfy-history__item">
              <div class="gfy-history__item-content">
                <span class="gfy-history__item-preview">{{ entry.preview }}</span>
                <span class="gfy-history__item-time">{{ formatTimestamp(entry.timestamp) }}</span>
              </div>
              <div class="gfy-history__item-actions">
                <button
                  type="button"
                  class="gfy-history__action-btn gfy-history__action-btn--primary"
                  title="Restore inputs"
                  aria-label="Restore inputs from this generation"
                  @click="restoreFromHistory(entry)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                </button>
                <button
                  type="button"
                  class="gfy-history__action-btn gfy-history__action-btn--danger"
                  title="Delete"
                  aria-label="Delete this history entry"
                  @click="removeFromHistory(entry.id)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <button type="button" class="gfy-history__clear-btn" @click="clearHistory">
            Clear All History
          </button>
        </div>
      </div>

      <!-- Auto-save indicator -->
      <div v-if="isAutoSaving" class="gfy-auto-save-indicator">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"/>
        </svg>
        Saving draft...
      </div>
    </template>

    <!-- Left Panel: Form -->
    <template #left>
      <div class="gmkb-plg-tool-embed">
        <!-- Welcome Section (shown when form is empty) -->
        <div v-if="!authorityHook.who && !authorityHook.what && !hasTaglines" class="gfy-welcome-section">
          <div class="gfy-welcome-section__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3 class="gfy-welcome-section__title">Create Your Perfect Tagline</h3>
          <p class="gfy-welcome-section__text">
            Distill your expertise into a memorable, powerful statement that captures your unique value.
          </p>
          <div class="gfy-welcome-section__tips">
            <span class="gfy-welcome-section__tip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              10 unique options
            </span>
            <span class="gfy-welcome-section__tip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Ctrl+Enter to generate
            </span>
            <span class="gfy-welcome-section__tip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Save to profile
            </span>
          </div>
        </div>

        <!-- Form Progress Indicator -->
        <div class="gfy-form-progress" :class="{ 'gfy-form-progress--complete': formCompletion.isComplete }">
          <div class="gfy-form-progress__header">
            <span class="gfy-form-progress__label">
              <svg v-if="formCompletion.isComplete" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              {{ formCompletion.isComplete ? 'Ready to generate!' : `${formCompletion.filledCount}/${formCompletion.totalCount} fields completed` }}
            </span>
          </div>
          <div class="gfy-form-progress__bar">
            <div class="gfy-form-progress__fill" :style="{ width: `${formCompletion.percentage}%` }"></div>
          </div>
        </div>

        <!-- Intent Tabs -->
        <div class="gfy-intent-tabs">
          <button
            v-for="option in INTENT_OPTIONS"
            :key="option.value"
            type="button"
            class="gfy-intent-tab"
            :class="{ 'active': intent === option.value }"
            @click="intent = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <!-- STEP 1: Authority Framework -->
        <div class="gfy-form-section">
          <h3 class="gfy-form-section__title">Step 1: Your Authority Framework</h3>

          <!-- Authority Hook Box -->
          <div class="gfy-highlight-box gfy-highlight-box--blue">
            <AuthorityHookBuilder
              :model-value="authorityHook"
              @update:model-value="Object.assign(authorityHook, $event)"
              title="Your Authority Hook"
              :placeholders="{
                who: 'e.g. SaaS Founders',
                what: 'e.g. Scale to 7-figures',
                when: 'e.g. Feeling plateaued',
                how: 'e.g. 90-day framework'
              }"
            />
          </div>

          <!-- Impact Intro Box -->
          <div class="gfy-highlight-box gfy-highlight-box--green">
            <ImpactIntroBuilder
              :model-value="impactIntro"
              @update:model-value="Object.assign(impactIntro, $event)"
              title="Your Impact Intro"
              :placeholders="{
                where: 'e.g. Helped 200+ startups achieve milestones',
                why: 'e.g. Democratize elite growth strategies'
              }"
            />
          </div>
        </div>

        <!-- Section Divider -->
        <div class="gfy-section-divider">
          <span>Context & Style</span>
        </div>

        <!-- STEP 2: Brand Context -->
        <div class="gfy-form-section">
          <h3 class="gfy-form-section__title">Step 2: Brand Context</h3>

          <div class="gfy-form-grid">
            <div class="gfy-input-group">
              <label class="gfy-label">
                Industry
                <span v-if="isFieldPrefilled('industry')" class="gfy-prefilled-badge" title="Loaded from your profile">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  from profile
                </span>
              </label>
              <input
                v-model="brandContext.industry"
                type="text"
                class="gfy-builder__input"
                :class="{ 'gfy-builder__input--prefilled': isFieldPrefilled('industry') }"
                placeholder="e.g. SaaS, Consulting"
                @input="markFieldEdited('industry')"
              />
            </div>
            <div class="gfy-input-group">
              <label class="gfy-label">Unique Factor</label>
              <input
                v-model="brandContext.uniqueFactor"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g. No-BS approach, Zero-to-One focus"
              />
            </div>
          </div>
          <div class="gfy-input-group">
            <label class="gfy-label">Existing Taglines (Optional)</label>
            <textarea
              v-model="brandContext.existingTaglines"
              class="gfy-builder__input gfy-builder__textarea"
              placeholder="List any slogans you currently use to help the AI improve upon them..."
              rows="2"
            ></textarea>
          </div>
        </div>

        <!-- STEP 3: Tagline Settings -->
        <div class="gfy-form-section">
          <h3 class="gfy-form-section__title">Step 3: Tagline Settings</h3>

          <div class="gfy-form-grid">
            <div class="gfy-input-group">
              <label class="gfy-label">Style Focus</label>
              <select v-model="styleFocus" class="gfy-builder__input">
                <option v-for="opt in STYLE_FOCUS_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="gfy-input-group">
              <label class="gfy-label">Tone</label>
              <select v-model="tone" class="gfy-builder__input">
                <option v-for="opt in TONE_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Generate Button -->
        <div class="gfy-form-actions">
          <button
            type="button"
            class="gfy-btn gfy-btn--primary"
            :class="{ 'gfy-btn--loading': isGenerating }"
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
        <div v-if="error" class="gfy-form-error">
          <p>{{ error }}</p>
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleGenerate">
            Try Again
          </button>
        </div>
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
                  class="gfy-btn gfy-btn--outline"
                  @click="handleGenerate"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                  </svg>
                  Regenerate
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
              <!-- Save Success Message -->
              <div v-if="saveSuccess" class="tagline-save-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Tagline saved to profile!
              </div>

              <!-- Save Error Message -->
              <div v-if="saveError" class="tagline-save-error">
                {{ saveError }}
              </div>

              <button
                type="button"
                class="gfy-btn gfy-btn--primary"
                :disabled="(!selectedTagline && !lockedTagline) || isSavingToProfile || !hasSelectedProfile"
                :title="!hasSelectedProfile ? 'Select a profile above to save' : ''"
                @click="handleSaveToProfile"
              >
                <svg v-if="!isSavingToProfile" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <svg v-else class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                {{ isSavingToProfile ? 'Saving...' : 'Save Tagline to Profile' }}
              </button>
              <button
                type="button"
                class="gfy-btn gfy-btn--ghost"
                @click="handleStartOver"
              >
                Start Over
              </button>
            </div>

            <!-- Cross-tool Navigation -->
            <div v-if="lockedTagline || selectedTagline" class="tagline-cross-tool-nav">
              <span class="tagline-cross-tool-nav__label">Continue building your brand:</span>
              <div class="tagline-cross-tool-nav__links">
                <a href="/tools/biography/" class="tagline-cross-tool-nav__link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Create Biography
                </a>
                <a href="/tools/persona/" class="tagline-cross-tool-nav__link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Define Persona
                </a>
              </div>
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
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue';
import { useAITagline, STYLE_FOCUS_OPTIONS, TONE_OPTIONS, INTENT_OPTIONS } from '../../src/composables/useAITagline';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';
import { useStandaloneProfile } from '../../src/composables/useStandaloneProfile';
import { useDraftState } from '../../src/composables/useDraftState';
import { useGeneratorHistory } from '../../src/composables/useGeneratorHistory';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, AuthorityHookBuilder, ImpactIntroBuilder, ProfileContextBanner, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

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

// Profile save functionality (standalone mode)
const {
  selectedProfileId,
  hasSelectedProfile,
  saveToProfile
} = useStandaloneProfile();

// Save state
const isSavingToProfile = ref(false);
const saveSuccess = ref(false);
const saveError = ref(null);

// Track which fields were pre-filled from profile
const prefilledFields = ref(new Set());

// Draft state for auto-saving (standalone mode only)
const {
  hasDraft,
  lastSaved,
  isAutoSaving,
  saveDraft,
  loadDraft,
  clearDraft,
  startAutoSave,
  getLastSavedText
} = useDraftState('tagline');

// History for recent generations
const {
  history,
  hasHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  formatTimestamp
} = useGeneratorHistory('tagline');

// Show/hide history panel
const showHistory = ref(false);

// Show draft restore prompt
const showDraftPrompt = ref(false);

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
 * Form completion status for progress indicator
 */
const formCompletion = computed(() => {
  const fields = [
    { name: 'Who you help', filled: !!authorityHook.who },
    { name: 'What you do', filled: !!authorityHook.what },
    { name: 'Industry', filled: !!(brandContext.industry && brandContext.industry.trim()) }
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
 * Tagline formula for guidance panel
 */
const taglineFormula = '<span class="gfy-highlight">[PROMISE]</span> + <span class="gfy-highlight">[DIFFERENTIATION]</span> + <span class="gfy-highlight">[BREVITY]</span> = Memorable Tagline';

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

    // Save to history on successful generation
    if (taglines.value && taglines.value.length > 0) {
      addToHistory({
        inputs: {
          authorityHook: { ...authorityHook },
          impactIntro: { ...impactIntro },
          brandContext: { ...brandContext },
          styleFocus: styleFocus.value,
          tone: tone.value,
          intent: intent.value
        },
        results: taglines.value,
        preview: taglines.value[0]?.text?.substring(0, 50) || 'Generated taglines'
      });
    }

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
 * Handle copy all taglines to clipboard as a numbered list
 */
const handleCopyAll = async () => {
  if (!taglines.value || taglines.value.length === 0) return;

  const formattedText = taglines.value
    .map((tagline, index) => `${index + 1}. ${tagline.text}`)
    .join('\n');

  try {
    await navigator.clipboard.writeText(formattedText);
  } catch (err) {
    console.error('[TaglineGenerator] Failed to copy all:', err);
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
const handleSaveToProfile = async () => {
  const taglineToSave = lockedTagline.value || selectedTagline.value;
  if (!taglineToSave) return;

  // If we have a selected profile in standalone mode, save via API
  if (props.mode === 'default' && hasSelectedProfile.value) {
    isSavingToProfile.value = true;
    saveSuccess.value = false;
    saveError.value = null;

    try {
      const success = await saveToProfile('tagline', taglineToSave);
      if (success) {
        saveSuccess.value = true;
        // Clear success message after 3 seconds
        setTimeout(() => {
          saveSuccess.value = false;
        }, 3000);
      } else {
        saveError.value = 'Failed to save tagline to profile';
      }
    } catch (err) {
      saveError.value = err.message || 'Failed to save tagline';
    } finally {
      isSavingToProfile.value = false;
    }
  }

  // Also emit for parent components
  emit('applied', {
    componentId: props.componentId,
    tagline: taglineToSave,
    allTaglines: taglines.value,
    action: 'save'
  });
};

/**
 * Handle start over - reset all state
 */
const handleStartOver = () => {
  reset();
  clearDraft(); // Clear saved draft when starting over
};

/**
 * Check if a field was pre-filled from profile
 */
const isFieldPrefilled = (fieldName) => prefilledFields.value.has(fieldName);

/**
 * Mark a field as user-edited (clear prefilled status)
 */
const markFieldEdited = (fieldName) => {
  prefilledFields.value.delete(fieldName);
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Track which fields get populated
  const newPrefilledFields = new Set();

  // Check which 6W fields will be populated
  if (profileData.hook_who || profileData.authority_hook_who) newPrefilledFields.add('who');
  if (profileData.hook_what || profileData.authority_hook_what) newPrefilledFields.add('what');
  if (profileData.hook_when || profileData.authority_hook_when) newPrefilledFields.add('when');
  if (profileData.hook_how || profileData.authority_hook_how) newPrefilledFields.add('how');
  if (profileData.hook_where || profileData.authority_hook_where) newPrefilledFields.add('where');
  if (profileData.hook_why || profileData.authority_hook_why) newPrefilledFields.add('why');
  if (profileData.industry) newPrefilledFields.add('industry');

  prefilledFields.value = newPrefilledFields;

  // Use loadFromProfile from composable to populate 6 W's fields
  loadFromProfile(profileData);

  // Also sync authority hook store
  loadFromProfileData(profileData);
}

/**
 * Handle profile loaded from ProfileContextBanner (standalone mode)
 */
function handleProfileLoaded(data) {
  if (data && props.mode === 'default') {
    populateFromProfile(data);
  }
}

/**
 * Handle profile cleared from ProfileContextBanner (standalone mode)
 */
function handleProfileCleared() {
  // Optionally clear form fields when profile is deselected
  // For now, we keep the existing data to avoid losing user input
}

/**
 * Get current form state for draft saving
 */
const getDraftState = () => {
  return {
    authorityHook: { ...authorityHook },
    impactIntro: { ...impactIntro },
    brandContext: { ...brandContext },
    styleFocus: styleFocus.value,
    tone: tone.value,
    intent: intent.value
  };
};

/**
 * Restore form state from draft
 */
const restoreFromDraft = (draftState) => {
  if (!draftState) return;

  if (draftState.authorityHook) {
    Object.assign(authorityHook, draftState.authorityHook);
  }
  if (draftState.impactIntro) {
    Object.assign(impactIntro, draftState.impactIntro);
  }
  if (draftState.brandContext) {
    Object.assign(brandContext, draftState.brandContext);
  }
  if (draftState.styleFocus) styleFocus.value = draftState.styleFocus;
  if (draftState.tone) tone.value = draftState.tone;
  if (draftState.intent) intent.value = draftState.intent;

  showDraftPrompt.value = false;
};

/**
 * Dismiss draft prompt without restoring
 */
const dismissDraftPrompt = () => {
  showDraftPrompt.value = false;
  clearDraft();
};

/**
 * Restore inputs from history entry
 */
const restoreFromHistory = (entry) => {
  if (!entry || !entry.inputs) return;

  const inputs = entry.inputs;
  if (inputs.authorityHook) {
    Object.assign(authorityHook, inputs.authorityHook);
  }
  if (inputs.impactIntro) {
    Object.assign(impactIntro, inputs.impactIntro);
  }
  if (inputs.brandContext) {
    Object.assign(brandContext, inputs.brandContext);
  }
  if (inputs.styleFocus) styleFocus.value = inputs.styleFocus;
  if (inputs.tone) tone.value = inputs.tone;
  if (inputs.intent) intent.value = inputs.intent;

  showHistory.value = false;
};

/**
 * Restore inputs and results from history entry
 */
const restoreFullHistory = (entry) => {
  restoreFromHistory(entry);
  // Results would need to be restored via the composable if supported
  // For now, just restore inputs
  showHistory.value = false;
};

/**
 * Keyboard shortcut handler (Ctrl/Cmd + Enter to generate)
 */
const handleKeyboardShortcut = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (canGenerate.value && !isGenerating.value && !hasTaglines.value) {
      event.preventDefault();
      handleGenerate();
    }
  }
};

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

  // Check for saved draft (only in standalone mode)
  if (props.mode === 'default' && hasDraft.value) {
    showDraftPrompt.value = true;
  }

  // Start auto-saving in standalone mode
  if (props.mode === 'default') {
    startAutoSave(getDraftState);
  }

  // Add keyboard shortcut listener
  window.addEventListener('keydown', handleKeyboardShortcut);
});

/**
 * Cleanup on unmount
 */
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardShortcut);
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
@import "../_shared/gfy-form-base.css";

/* Intent Tabs */
.gfy-intent-tabs {
  display: flex;
  border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
  margin-bottom: 24px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  border-radius: var(--mkcg-radius, 8px) var(--mkcg-radius, 8px) 0 0;
  overflow: hidden;
}

.gfy-intent-tab {
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

.gfy-intent-tab:hover {
  color: var(--mkcg-text-primary, #0f172a);
  background: rgba(59, 130, 246, 0.05);
}

.gfy-intent-tab.active {
  color: var(--mkcg-primary, #3b82f6);
  background: #fff;
  border-bottom-color: var(--mkcg-primary, #3b82f6);
}

/* Highlight Boxes */
.gfy-highlight-box {
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.gfy-highlight-box--blue {
  border-left: 4px solid var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-bg-secondary, #f9fafb);
}

.gfy-highlight-box--green {
  border-left: 4px solid #10b981;
  background: #ecfdf5;
}

/* Grid Layout */
.gfy-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .gfy-form-grid {
    grid-template-columns: 1fr;
  }
}

/* Section Divider */
.gfy-section-divider {
  height: 1px;
  background: var(--mkcg-border, #e2e8f0);
  margin: 32px 0;
  position: relative;
}

.gfy-section-divider span {
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

/* Prefilled badge for fields loaded from profile */
.gfy-prefilled-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  color: #166534;
  font-size: 10px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: normal;
}

.gfy-prefilled-badge svg {
  flex-shrink: 0;
}

.gfy-form-section {
  margin-bottom: var(--mkcg-space-lg, 24px);
}

/* Prefilled input highlight */
.gfy-builder__input--prefilled {
  border-color: #86efac;
  background: linear-gradient(to right, #f0fdf4, #fff);
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

/* Save Success/Error Messages */
.tagline-save-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 6px;
  color: #166534;
  font-size: 0.875rem;
  font-weight: 500;
  width: 100%;
}

.tagline-save-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
  font-size: 0.875rem;
  font-weight: 500;
  width: 100%;
}

/* Spinner animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
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

/* Draft Restore Prompt */
.draft-restore-prompt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(to right, #fefce8, #fef9c3);
  border: 1px solid #fde047;
  border-radius: 8px;
  margin-top: 12px;
}

.draft-restore-prompt__icon {
  flex-shrink: 0;
  color: #ca8a04;
}

.draft-restore-prompt__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.draft-restore-prompt__title {
  font-size: 14px;
  font-weight: 600;
  color: #854d0e;
}

.draft-restore-prompt__text {
  font-size: 12px;
  color: #a16207;
}

.draft-restore-prompt__actions {
  display: flex;
  gap: 8px;
}

.draft-restore-prompt__btn {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.draft-restore-prompt__btn--restore {
  background: #ca8a04;
  color: white;
  border: none;
}

.draft-restore-prompt__btn--restore:hover {
  background: #a16207;
}

.draft-restore-prompt__btn--dismiss {
  background: transparent;
  color: #854d0e;
  border: 1px solid #ca8a04;
}

.draft-restore-prompt__btn--dismiss:hover {
  background: rgba(202, 138, 4, 0.1);
}

/* Auto-save Indicator */
.auto-save-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border-radius: 6px;
  font-size: 12px;
  color: var(--mkcg-text-secondary, #64748b);
  margin-top: 8px;
}

/* Cross-tool Navigation */
.tagline-cross-tool-nav {
  width: 100%;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
}

.tagline-cross-tool-nav__label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--mkcg-text-secondary, #64748b);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.tagline-cross-tool-nav__links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tagline-cross-tool-nav__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  color: var(--mkcg-text-primary, #0f172a);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}

.tagline-cross-tool-nav__link:hover {
  background: var(--mkcg-primary, #3b82f6);
  border-color: var(--mkcg-primary, #3b82f6);
  color: white;
}

.tagline-cross-tool-nav__link svg {
  flex-shrink: 0;
}
</style>
