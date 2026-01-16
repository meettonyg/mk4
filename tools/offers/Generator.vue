<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'default'"
    title="Service Packages Generator"
    subtitle="Create tiered service packages that communicate clear value and outcomes"
    intro-text="Generate three professionally-structured service packages (Entry, Signature, and Premium) based on your services and expertise. Each package will be designed to appeal to different client needs and budgets while showcasing the value and transformation you provide."
    generator-type="offers"
    :has-results="hasOffers"
    :is-loading="isGenerating"
  >
    <!-- Profile Context Banner (for logged-in users) -->
    <template #profile-context>
      <ProfileContextBanner
        @profile-loaded="handleProfileLoaded"
        @profile-cleared="handleProfileCleared"
      />
    </template>

    <!-- Left Panel: Form -->
    <template #left>
      <!-- Draft Restore Prompt -->
      <div v-if="showDraftPrompt" class="gfy-draft-prompt">
        <div class="gfy-draft-prompt__content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <div>
            <strong>Restore previous work?</strong>
            <p>You have a saved draft from {{ getLastSavedText() }}.</p>
          </div>
        </div>
        <div class="gfy-draft-prompt__actions">
          <button type="button" class="generator__button generator__button--call-to-action generator__button--small" @click="handleRestoreDraft">
            Restore Draft
          </button>
          <button type="button" class="generator__button generator__button--ghost generator__button--small" @click="handleDiscardDraft">
            Start Fresh
          </button>
        </div>
      </div>

      <!-- Auto-save Indicator -->
      <div v-if="isAutoSaving" class="gfy-auto-save-indicator">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        Saving draft...
      </div>

      <!-- Welcome Section (shown when form is empty) -->
      <div v-if="!services && !authorityHook.who" class="gfy-welcome-section">
        <div class="gfy-welcome-section__icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <h3 class="gfy-welcome-section__title">Generate Service Packages</h3>
        <p class="gfy-welcome-section__text">
          Tell us about your services and we'll create 3 tiered packages (Entry, Signature, Premium) to help you serve clients at every level.
        </p>
        <div class="gfy-welcome-section__tips">
          <span class="gfy-welcome-section__tip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            3 tiered packages
          </span>
          <span class="gfy-welcome-section__tip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            Deliverables included
          </span>
          <span class="gfy-welcome-section__tip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            Ctrl+Enter to generate
          </span>
        </div>
      </div>

      <!-- Form Completion Indicator -->
      <div class="gfy-form-progress" :class="{ 'gfy-form-progress--complete': formCompletion.isComplete }">
        <div class="gfy-form-progress__header">
          <span class="gfy-form-progress__label">
            <svg v-if="formCompletion.isComplete" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {{ formCompletion.isComplete ? 'Ready to generate!' : `${formCompletion.filledCount}/${formCompletion.totalCount} fields completed` }}
          </span>
        </div>
        <div class="gfy-form-progress__bar">
          <div class="gfy-form-progress__fill" :style="{ width: `${formCompletion.percentage}%` }"></div>
        </div>
      </div>

      <!-- Services Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Your Services</h3>

        <div class="generator__field">
          <label class="generator__field-label">
            Services You Offer *
            <span v-if="isFieldPrefilled('services')" class="gfy-prefilled-badge">from profile</span>
          </label>
          <textarea
            v-model="services"
            class="generator__field-input generator__field-textarea"
            :class="{ 'generator__field-input--prefilled': isFieldPrefilled('services') }"
            placeholder="e.g., 1-on-1 coaching, group workshops, keynote speaking, online courses, consulting..."
            rows="4"
            @input="markFieldEdited('services')"
          ></textarea>
          <div class="generator__field-footer">
            <p class="generator__field-helper">
              List the services you want to package and sell.
            </p>
            <span v-if="services" class="generator__char-count">{{ services.length }} chars</span>
          </div>
        </div>
      </div>

      <!-- Authority Hook Section -->
      <AuthorityHookBuilder
        :model-value="authorityHook"
        @update:model-value="Object.assign(authorityHook, $event)"
        title="Authority Context"
        :placeholders="{
          who: 'e.g., SaaS Founders scaling to $10M ARR',
          what: 'e.g., Increase revenue by 40% in 90 days',
          when: 'e.g., When they\'re stuck at a growth plateau',
          how: 'e.g., My proven Revenue Acceleration System'
        }"
      />

      <!-- Offer Details Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Offer Details</h3>

        <div class="generator__field-row">
          <div class="generator__field">
            <label class="generator__field-label">Price Range</label>
            <select v-model="priceRange" class="generator__field-input generator__field-select">
              <option v-for="opt in PRICE_RANGE_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="generator__field">
            <label class="generator__field-label">Delivery Method</label>
            <select v-model="delivery" class="generator__field-input generator__field-select">
              <option v-for="opt in DELIVERY_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">
            Audience Challenges
            <span v-if="isFieldPrefilled('audienceChallenges')" class="gfy-prefilled-badge">from profile</span>
          </label>
          <textarea
            v-model="audienceChallenges"
            class="generator__field-input generator__field-textarea"
            :class="{ 'generator__field-input--prefilled': isFieldPrefilled('audienceChallenges') }"
            placeholder="e.g., Struggling to find time, overwhelmed by options, not seeing results from current approach..."
            rows="3"
            @input="markFieldEdited('audienceChallenges')"
          ></textarea>
          <div class="generator__field-footer">
            <p class="generator__field-helper">
              What problems or challenges does your audience face that your offer solves?
            </p>
            <span v-if="audienceChallenges" class="generator__char-count">{{ audienceChallenges.length }} chars</span>
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
          {{ isGenerating ? 'Creating packages...' : 'Generate 3 Packages with AI' }}
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
        title="Creating Irresistible Service Packages"
        subtitle="Well-structured service packages make it easy for prospects to understand your value and choose the right option for their needs."
        :formula="offersFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Package Descriptions:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <!-- Loading Skeleton -->
      <div v-if="isGenerating && !hasOffers" class="offers-skeleton">
        <div class="offers-skeleton__header">
          <div class="offers-skeleton__title"></div>
        </div>
        <div class="offers-skeleton__grid">
          <div v-for="i in 3" :key="i" class="offers-skeleton__card">
            <div class="offers-skeleton__card-header"></div>
            <div class="offers-skeleton__card-desc"></div>
            <div class="offers-skeleton__card-line"></div>
            <div class="offers-skeleton__card-line offers-skeleton__card-line--short"></div>
            <div class="offers-skeleton__card-line"></div>
          </div>
        </div>
      </div>

      <div v-else class="offers-results">
        <div class="offers-results__layout">

          <!-- SIDEBAR: Offer Suite -->
          <aside class="offers-results__sidebar">
            <div class="offers-suite">
              <span class="offers-suite__title">Your Offer Suite</span>

              <!-- Entry Package Slot -->
              <button
                type="button"
                class="offers-slot"
                :class="{
                  'offers-slot--active': activeOfferTier === 'entry',
                  'offers-slot--locked': lockedOffers.entry
                }"
                :aria-label="lockedOffers.entry ? 'View locked Entry package' : 'Select Entry package'"
                :aria-pressed="activeOfferTier === 'entry'"
                @click="setActiveOfferTier('entry')"
              >
                <div class="offers-slot__header">
                  <span class="offers-slot__label">Entry Package</span>
                  <svg v-if="lockedOffers.entry" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                  </svg>
                </div>
                <div class="offers-slot__preview">
                  {{ lockedOffers.entry?.name || getOfferPreview('entry') || 'Click to generate' }}
                </div>
              </button>

              <!-- Signature Package Slot -->
              <button
                type="button"
                class="offers-slot"
                :class="{
                  'offers-slot--active': activeOfferTier === 'signature',
                  'offers-slot--locked': lockedOffers.signature
                }"
                :aria-label="lockedOffers.signature ? 'View locked Signature package' : 'Select Signature package'"
                :aria-pressed="activeOfferTier === 'signature'"
                @click="setActiveOfferTier('signature')"
              >
                <div class="offers-slot__header">
                  <span class="offers-slot__label">Signature Package</span>
                  <svg v-if="lockedOffers.signature" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                  </svg>
                </div>
                <div class="offers-slot__preview">
                  {{ lockedOffers.signature?.name || getOfferPreview('signature') || 'Click to generate' }}
                </div>
              </button>

              <!-- Premium Package Slot -->
              <button
                type="button"
                class="offers-slot"
                :class="{
                  'offers-slot--active': activeOfferTier === 'premium',
                  'offers-slot--locked': lockedOffers.premium
                }"
                :aria-label="lockedOffers.premium ? 'View locked Premium package' : 'Select Premium package'"
                :aria-pressed="activeOfferTier === 'premium'"
                @click="setActiveOfferTier('premium')"
              >
                <div class="offers-slot__header">
                  <span class="offers-slot__label">Premium Package</span>
                  <svg v-if="lockedOffers.premium" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                  </svg>
                </div>
                <div class="offers-slot__preview">
                  {{ lockedOffers.premium?.name || getOfferPreview('premium') || 'Click to generate' }}
                </div>
              </button>

              <!-- Locked Summary -->
              <div v-if="lockedOffersCount > 0" class="offers-suite__summary">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z"/>
                </svg>
                {{ lockedOffersCount }}/3 packages locked
              </div>
            </div>
          </aside>

          <!-- MAIN: Package Variations -->
          <main class="offers-results__main">
            <div class="offers-results__header">
              <h3 class="offers-results__title">
                {{ activeOfferTierLabel }} Package
                <span v-if="currentTierOffer" class="offers-results__count">Generated</span>
              </h3>
              <div class="offers-results__actions">
                <button
                  type="button"
                  class="generator__button generator__button--outline"
                  title="Generate new service packages"
                  aria-label="Regenerate all packages"
                  @click="handleGenerate"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                  </svg>
                  Regenerate All
                </button>
                <button
                  type="button"
                  class="generator__button generator__button--outline"
                  title="Copy all packages to clipboard"
                  aria-label="Copy all packages to clipboard"
                  @click="handleCopyAll"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy All
                </button>
                <button
                  type="button"
                  class="offers-action-btn"
                  @click="handleExport"
                  title="Download packages as markdown file"
                  aria-label="Export packages as markdown"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Export
                </button>
              </div>
            </div>

            <!-- Locked State -->
            <div v-if="lockedOffers[activeOfferTier]" class="offers-locked-card">
              <div class="offers-locked-card__badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z"/>
                </svg>
                LOCKED {{ activeOfferTierLabel.toUpperCase() }} PACKAGE
              </div>
              <h4 class="offers-locked-card__name">{{ lockedOffers[activeOfferTier].name }}</h4>
              <p class="offers-locked-card__description">{{ lockedOffers[activeOfferTier].description }}</p>
              <div class="offers-locked-card__actions">
                <button type="button" class="generator__button generator__button--outline" title="Copy this package to clipboard" aria-label="Copy package details to clipboard" @click="handleCopy">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </button>
                <button type="button" class="generator__button generator__button--ghost" title="Unlock to make changes" aria-label="Unlock package to edit" @click="unlockOffer(activeOfferTier)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                  </svg>
                  Unlock & Edit
                </button>
              </div>
            </div>

            <!-- Package Card (when not locked) -->
            <div v-else-if="currentTierOffer" class="offers-card">
              <div class="offers-card__tier-badge" :class="`offers-card__tier-badge--${activeOfferTier}`">
                {{ activeOfferTierLabel }}
              </div>
              <h4 class="offers-card__name">{{ currentTierOffer.name }}</h4>
              <p class="offers-card__description">{{ currentTierOffer.description }}</p>

              <!-- Metadata Row -->
              <div class="offers-card__meta">
                <div class="offers-card__meta-item">
                  <strong>Investment:</strong> {{ getPriceLabel(priceRange) }}
                </div>
                <div class="offers-card__meta-item">
                  <strong>Delivery:</strong> {{ getDeliveryLabel(delivery) }}
                </div>
              </div>

              <!-- Deliverables -->
              <div class="offers-card__section">
                <h5 class="offers-card__section-title">Includes:</h5>
                <ul class="offers-card__deliverables">
                  <li v-for="(item, idx) in currentTierOffer.deliverables" :key="idx">{{ item }}</li>
                </ul>
              </div>

              <div v-if="currentTierOffer.idealClient" class="offers-card__ideal">
                <strong>Ideal for:</strong> {{ currentTierOffer.idealClient }}
              </div>

              <div class="offers-card__actions">
                <button
                  type="button"
                  class="generator__button generator__button--call-to-action"
                  :title="`Lock ${activeOfferTierLabel} package to preserve it`"
                  :aria-label="`Lock ${activeOfferTierLabel} package`"
                  @click="lockOffer(activeOfferTier)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Lock {{ activeOfferTierLabel }} Package
                </button>
                <button type="button" class="generator__button generator__button--outline" title="Copy this package to clipboard" aria-label="Copy package details to clipboard" @click="handleCopy">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="offers-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              <p>Generate packages to see {{ activeOfferTierLabel }} offer variations here.</p>
            </div>

            <!-- Footer Actions -->
            <div v-if="lockedOffersCount > 0" class="offers-results__footer">
              <!-- Save Success Message -->
              <div v-if="saveSuccess" class="offers-save-success" role="status" aria-live="polite">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Offers saved to profile!
              </div>

              <!-- Save Error Message -->
              <div v-if="saveError" class="offers-save-error" role="alert" aria-live="assertive">
                {{ saveError }}
              </div>

              <button
                type="button"
                class="generator__button generator__button--call-to-action"
                :disabled="isSavingToProfile || !hasSelectedProfile"
                :title="!hasSelectedProfile ? 'Select a profile above to save' : 'Save all locked packages to your media kit'"
                aria-label="Save offer suite to media kit"
                @click="handleSaveAllOffers"
              >
                <svg v-if="!isSavingToProfile" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <svg v-else class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                {{ isSavingToProfile ? 'Saving...' : 'Save Offer Suite' }}
              </button>
              <button type="button" class="generator__button generator__button--ghost" title="Clear results and start fresh" aria-label="Start over with new packages" @click="handleStartOver">
                Start Over
              </button>
            </div>

            <!-- Cross-tool Navigation -->
            <div v-if="lockedOffersCount > 0" class="gfy-cross-tool-nav">
              <span class="gfy-cross-tool-nav__label">Continue building your media kit:</span>
              <div class="gfy-cross-tool-nav__links">
                <a href="/tools/biography/" class="gfy-cross-tool-nav__link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Generate Biography
                </a>
                <a href="/tools/topics/" class="gfy-cross-tool-nav__link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  Generate Topics
                </a>
                <a href="/tools/questions/" class="gfy-cross-tool-nav__link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Generate Questions
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
    title="Service Packages Generator"
    description="Create tiered service packages that communicate clear value and outcomes."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasOffers"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Offers"
    :show-cta="!hasOffers"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Services Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Services You Offer</label>
        <textarea
          v-model="services"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., 1-on-1 coaching, group workshops, keynote speaking, online courses, consulting..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          List the services you want to package and sell.
        </span>
      </div>

      <!-- Authority Hook -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Your Expertise</label>
        <textarea
          v-model="authorityHookText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., I help entrepreneurs scale their businesses through strategic planning and leadership development..."
          rows="2"
        ></textarea>
        <span class="gmkb-ai-hint">
          Describe what you do and who you help.
        </span>
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate 3 Packages"
        loading-text="Creating packages..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasOffers" class="gmkb-ai-packages">
        <!-- Package Cards -->
        <div class="gmkb-ai-packages__grid">
          <div
            v-for="(pkg, index) in offers"
            :key="index"
            class="gmkb-ai-package"
            :class="[`gmkb-ai-package--${pkg.tier || PACKAGE_TIERS[index]?.value || 'entry'}`]"
          >
            <div class="gmkb-ai-package__header">
              <span class="gmkb-ai-package__tier">
                {{ pkg.tier || PACKAGE_TIERS[index]?.label || 'Package' }}
              </span>
              <h4 class="gmkb-ai-package__name">{{ pkg.name }}</h4>
            </div>

            <p class="gmkb-ai-package__description">{{ pkg.description }}</p>

            <div class="gmkb-ai-package__section">
              <h5 class="gmkb-ai-package__section-title">Includes:</h5>
              <ul class="gmkb-ai-package__deliverables">
                <li
                  v-for="(deliverable, dIndex) in pkg.deliverables"
                  :key="dIndex"
                >
                  {{ deliverable }}
                </li>
              </ul>
            </div>

            <div v-if="pkg.idealClient" class="gmkb-ai-package__ideal">
              <strong>Ideal for:</strong> {{ pkg.idealClient }}
            </div>

            <!-- Copy Button -->
            <button
              type="button"
              class="gmkb-ai-package__copy-btn"
              :class="{ 'gmkb-ai-package__copy-btn--copied': copiedPackageIndex === index }"
              :title="copiedPackageIndex === index ? 'Copied!' : 'Copy package'"
              @click="handleCopySingleOffer(pkg, $event, index)"
            >
              <svg v-if="copiedPackageIndex === index" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              {{ copiedPackageIndex === index ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>

        <!-- Pricing Note -->
        <div class="gmkb-ai-packages__note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Add your own pricing to these packages based on your market positioning.</span>
        </div>
      </div>
    </template>
  </AiWidgetFrame>

  <!-- Embedded Mode: Landing page form (simplified, used with EmbeddedToolWrapper) -->
  <div v-else class="gmkb-embedded-form">
    <!-- Simplified 2-field form for landing page -->
    <div class="gmkb-embedded-fields">
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">Services You Offer</label>
        <input
          v-model="services"
          type="text"
          class="gmkb-embedded-input"
          placeholder="e.g., 1-on-1 coaching, group workshops, keynote speaking"
          @input="handleEmbeddedFieldChange"
        />
      </div>

      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">Your Expertise</label>
        <input
          v-model="authorityHookText"
          type="text"
          class="gmkb-embedded-input"
          placeholder="e.g., I help entrepreneurs scale their businesses through strategic planning"
          @input="handleEmbeddedFieldChange"
        />
      </div>
    </div>

    <!-- Results display for embedded mode -->
    <div v-if="hasOffers" class="gmkb-embedded-result">
      <div class="gmkb-embedded-result__content">
        <div
          v-for="(pkg, index) in offers"
          :key="index"
          class="gmkb-embedded-package"
        >
          <div class="gmkb-embedded-package__content">
            <strong>{{ pkg.name }}:</strong> {{ pkg.description }}
          </div>
          <button
            type="button"
            class="gmkb-embedded-package__copy"
            :class="{ 'gmkb-embedded-package__copy--copied': copiedPackageIndex === `embedded_${index}` }"
            :title="copiedPackageIndex === `embedded_${index}` ? 'Copied!' : 'Copy package'"
            @click="handleCopySingleOffer(pkg, $event, `embedded_${index}`)"
          >
            <svg v-if="copiedPackageIndex === `embedded_${index}`" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Error display -->
    <div v-if="error" class="gmkb-embedded-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, inject } from 'vue';
import { useAIOffers, PACKAGE_TIERS } from '../../src/composables/useAIOffers';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';
import { useStandaloneProfile } from '../../src/composables/useStandaloneProfile';
import { useDraftState } from '../../src/composables/useDraftState';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, AuthorityHookBuilder, ProfileContextBanner, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

// Options for select fields
const PRICE_RANGE_OPTIONS = [
  { value: '', label: 'Select price range...' },
  { value: 'budget', label: 'Budget ($0-$500)' },
  { value: 'mid', label: 'Mid-Range ($500-$2,000)' },
  { value: 'premium', label: 'Premium ($2,000-$10,000)' },
  { value: 'luxury', label: 'Luxury ($10,000+)' }
];

const DELIVERY_OPTIONS = [
  { value: '', label: 'Select delivery method...' },
  { value: 'digital', label: 'Digital / Online' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'hybrid', label: 'Hybrid (Both)' },
  { value: 'self-paced', label: 'Self-Paced Course' },
  { value: 'live', label: 'Live Sessions' }
];

const props = defineProps({
  /**
   * Mode: 'integrated', 'standalone', or 'embedded'
   * - standalone: Full two-panel layout with guidance
   * - integrated: Compact widget for embedding in other components
   * - embedded: Landing page embed with simplified form
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

  /**
   * Intent object for embedded mode
   * Contains: { id, label, contextHeading, contextDescription, formPlaceholders, formLabels }
   */
  intent: {
    type: Object,
    default: null
  },

  /**
   * Profile data for pre-population (embedded mode)
   * Passed from EmbeddedToolWrapper via scoped slot
   */
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated', 'change', 'preview-update', 'update:can-generate']);

// Use composables
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  offers,
  hasOffers,
  generate,
  copyToClipboard
} = useAIOffers();

const { authorityHookSummary, syncFromStore, loadFromProfileData } = useAuthorityHook();

// Profile save functionality (standalone mode)
const {
  selectedProfileId,
  hasSelectedProfile,
  saveMultipleToProfile
} = useStandaloneProfile();

// Save state
const isSavingToProfile = ref(false);
const saveSuccess = ref(false);
const saveError = ref(null);

// Track which package was just copied for visual feedback
const copiedPackageIndex = ref(null);

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
} = useDraftState('offers');

// Prefilled fields tracking
const prefilledFields = ref(new Set());
const showDraftPrompt = ref(false);

// Local state
const services = ref('');
const authorityHookText = ref('');

// Authority Hook (structured fields)
const authorityHook = reactive({
  who: '',
  what: '',
  when: '',
  how: ''
});

// Business context fields
const priceRange = ref('');
const delivery = ref('');
const audienceChallenges = ref('');

// Results UI state
const activeOfferTier = ref('entry');
const lockedOffers = reactive({
  entry: null,
  signature: null,
  premium: null
});

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Populate services from hook_what or services field
  if (profileData.hook_what && !services.value) {
    services.value = profileData.hook_what;
  }

  // Populate authority hook text (for integrated mode)
  if (profileData.authority_hook && !authorityHookText.value) {
    authorityHookText.value = profileData.authority_hook;
  }

  // Populate structured authority hook fields
  if (profileData.hook_who && !authorityHook.who) {
    authorityHook.who = profileData.hook_who;
  }
  if (profileData.hook_what && !authorityHook.what) {
    authorityHook.what = profileData.hook_what;
  }
  if (profileData.hook_when && !authorityHook.when) {
    authorityHook.when = profileData.hook_when;
  }
  if (profileData.hook_how && !authorityHook.how) {
    authorityHook.how = profileData.hook_how;
  }

  // Populate authority hook fields from profile data (for cross-tool sync)
  loadFromProfileData(profileData);
}

/**
 * Check if a field was prefilled from profile
 */
function isFieldPrefilled(fieldName) {
  return prefilledFields.value.has(fieldName);
}

/**
 * Mark a field as edited (removes prefilled status)
 */
function markFieldEdited(fieldName) {
  prefilledFields.value.delete(fieldName);
}

/**
 * Get current form state for draft saving
 */
function getDraftState() {
  return {
    services: services.value,
    authorityHookText: authorityHookText.value,
    authorityHook: { ...authorityHook },
    priceRange: priceRange.value,
    delivery: delivery.value,
    audienceChallenges: audienceChallenges.value
  };
}

/**
 * Restore form state from draft
 */
function restoreDraftState(draft) {
  if (draft.services) services.value = draft.services;
  if (draft.authorityHookText) authorityHookText.value = draft.authorityHookText;
  if (draft.authorityHook) Object.assign(authorityHook, draft.authorityHook);
  if (draft.priceRange) priceRange.value = draft.priceRange;
  if (draft.delivery) delivery.value = draft.delivery;
  if (draft.audienceChallenges) audienceChallenges.value = draft.audienceChallenges;
}

/**
 * Handle restore draft button click
 */
function handleRestoreDraft() {
  const draft = loadDraft();
  if (draft) {
    restoreDraftState(draft);
  }
  showDraftPrompt.value = false;
}

/**
 * Handle discard draft button click
 */
function handleDiscardDraft() {
  clearDraft();
  showDraftPrompt.value = false;
}

/**
 * Handle profile loaded from ProfileContextBanner (standalone mode)
 */
function handleProfileLoaded(data) {
  if (data && props.mode === 'default') {
    // Track which fields are being prefilled
    const newPrefilledFields = new Set();

    if (data.hook_what && !services.value) newPrefilledFields.add('services');
    if (data.authority_hook && !authorityHookText.value) newPrefilledFields.add('authorityHookText');
    if (data.hook_who && !authorityHook.who) newPrefilledFields.add('hook_who');
    if (data.hook_what && !authorityHook.what) newPrefilledFields.add('hook_what');
    if (data.hook_when && !authorityHook.when) newPrefilledFields.add('hook_when');
    if (data.hook_how && !authorityHook.how) newPrefilledFields.add('hook_how');

    prefilledFields.value = newPrefilledFields;
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
 * Offers formula for guidance panel
 */
const offersFormula = '<span class="generator__highlight">[VALUE PROPOSITION]</span> + <span class="generator__highlight">[TARGET AUDIENCE]</span> + <span class="generator__highlight">[TRANSFORMATION]</span> = Irresistible Offer';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Structured Packages Matter',
    description: 'Clear, tiered service packages eliminate confusion and decision paralysis. When prospects can easily understand the differences between your offerings and identify which option suits their needs, they\'re more likely to take action. Strategic packaging also positions you as an authority with well-defined solutions rather than someone who does "custom work."'
  },
  {
    title: 'What Makes Packages Convert',
    description: 'Effective service packages clearly articulate the value, outcomes, and transformation—not just the deliverables. Each tier should speak to a different client scenario or budget level, with the middle "Signature" tier positioned as the recommended option. Include specific deliverables, identify the ideal client for each package, and emphasize results over features.'
  },
  {
    title: 'How to Present Your Packages',
    description: 'Display your packages side-by-side to enable easy comparison. Use clear tier labels (Entry, Signature, Premium) and highlight your recommended option. Be specific about what\'s included, who each package is ideal for, and what transformation clients can expect. Add your own pricing based on your market positioning and the value you deliver.'
  }
];

/**
 * Example packages for guidance panel
 */
const examples = [
  {
    title: 'Business Coaching Entry Package:',
    description: '"Clarity Session" - A 90-minute strategic planning session with personalized action plan and 30-day email support. Ideal for entrepreneurs who need direction and a clear next step.'
  },
  {
    title: 'Marketing Consultant Signature Package:',
    description: '"Complete Marketing Accelerator" - 3-month engagement including marketing strategy, campaign implementation, weekly coaching calls, and analytics reporting. Ideal for established businesses ready to scale their customer acquisition.'
  }
];

/**
 * Computed authority hook summary from structured fields
 */
const computedAuthorityHookSummary = computed(() => {
  const { who, what, when, how } = authorityHook;
  if (!who && !what) return '';

  let summary = 'I help';
  if (who) summary += ` ${who}`;
  if (what) summary += ` ${what}`;
  if (when) summary += ` ${when}`;
  if (how) summary += ` through ${how}`;

  return summary + '.';
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  // Require services and at least WHO + WHAT from authority hook
  return services.value.trim() && authorityHook.who.trim() && authorityHook.what.trim();
});

/**
 * Form completion status for progress indicator
 */
const formCompletion = computed(() => {
  const fields = [
    { name: 'Services', filled: !!(services.value && services.value.trim()) },
    { name: 'Who you help', filled: !!authorityHook.who.trim() },
    { name: 'What you do', filled: !!authorityHook.what.trim() }
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
 * Get tier label for active tier
 */
const activeOfferTierLabel = computed(() => {
  const labels = { entry: 'Entry', signature: 'Signature', premium: 'Premium' };
  return labels[activeOfferTier.value] || 'Entry';
});

/**
 * Get the current tier's offer from generated offers
 */
const currentTierOffer = computed(() => {
  if (!offers.value || offers.value.length === 0) return null;
  const tierIndex = { entry: 0, signature: 1, premium: 2 };
  return offers.value[tierIndex[activeOfferTier.value]] || null;
});

/**
 * Count of locked offers
 */
const lockedOffersCount = computed(() => {
  return Object.values(lockedOffers).filter(Boolean).length;
});

/**
 * Get offer preview for sidebar
 */
const getOfferPreview = (tier) => {
  if (!offers.value || offers.value.length === 0) return null;
  const tierIndex = { entry: 0, signature: 1, premium: 2 };
  const offer = offers.value[tierIndex[tier]];
  return offer?.name || null;
};

/**
 * Set active offer tier
 */
const setActiveOfferTier = (tier) => {
  activeOfferTier.value = tier;
};

/**
 * Lock an offer
 */
const lockOffer = (tier) => {
  const tierIndex = { entry: 0, signature: 1, premium: 2 };
  const offer = offers.value[tierIndex[tier]];
  if (offer) {
    lockedOffers[tier] = { ...offer };
  }
};

/**
 * Unlock an offer
 */
const unlockOffer = (tier) => {
  lockedOffers[tier] = null;
};

/**
 * Get price label from value
 */
const getPriceLabel = (value) => {
  const opt = PRICE_RANGE_OPTIONS.find(o => o.value === value);
  return opt?.label || 'Contact for pricing';
};

/**
 * Get delivery label from value
 */
const getDeliveryLabel = (value) => {
  const opt = DELIVERY_OPTIONS.find(o => o.value === value);
  return opt?.label || 'Custom delivery';
};

/**
 * Handle save all offers
 */
const handleSaveAllOffers = async () => {
  // If we have a selected profile in standalone mode, save via API
  if (props.mode === 'default' && hasSelectedProfile.value && lockedOffersCount.value > 0) {
    isSavingToProfile.value = true;
    saveSuccess.value = false;
    saveError.value = null;

    try {
      // Build offer data to save
      const offerData = {};
      if (lockedOffers.entry) {
        offerData.offer_entry_name = lockedOffers.entry.name;
        offerData.offer_entry_description = lockedOffers.entry.description;
        offerData.offer_entry_price = lockedOffers.entry.price;
      }
      if (lockedOffers.signature) {
        offerData.offer_signature_name = lockedOffers.signature.name;
        offerData.offer_signature_description = lockedOffers.signature.description;
        offerData.offer_signature_price = lockedOffers.signature.price;
      }
      if (lockedOffers.premium) {
        offerData.offer_premium_name = lockedOffers.premium.name;
        offerData.offer_premium_description = lockedOffers.premium.description;
        offerData.offer_premium_price = lockedOffers.premium.price;
      }

      const success = await saveMultipleToProfile(offerData);
      if (success) {
        saveSuccess.value = true;
        setTimeout(() => {
          saveSuccess.value = false;
        }, 3000);
      } else {
        saveError.value = 'Failed to save offers to profile';
      }
    } catch (err) {
      saveError.value = err.message || 'Failed to save offers';
    } finally {
      isSavingToProfile.value = false;
    }
  }

  // Also emit for parent components
  emit('generated', {
    offers: lockedOffers
  });
};

/**
 * Handle start over
 */
const handleStartOver = () => {
  lockedOffers.entry = null;
  lockedOffers.signature = null;
  lockedOffers.premium = null;
  activeOfferTier.value = 'entry';
};

/**
 * Current intent (for embedded mode)
 */
const currentIntent = computed(() => {
  return props.intent || {
    id: 'default',
    label: 'Service Packages',
    formPlaceholders: {
      services: 'e.g., 1-on-1 coaching, group workshops, keynote speaking',
      expertise: 'e.g., I help entrepreneurs scale their businesses through strategic planning'
    },
    formLabels: {
      services: 'Services You Offer',
      expertise: 'Your Expertise'
    }
  };
});

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const servicesVal = services.value || '[SERVICES]';
  const expertiseVal = authorityHookText.value || '[EXPERTISE]';

  if (!services.value && !authorityHookText.value) {
    return null; // Show default preview
  }

  return `Creating tiered service packages for <strong>${servicesVal}</strong> based on expertise: <strong>${expertiseVal}</strong>`;
});

/**
 * Check if embedded form has minimum required fields
 */
const canGenerateEmbedded = computed(() => {
  return services.value?.trim() && authorityHookText.value?.trim();
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    // Use computed summary or fallback to text field for integrated mode
    const authorityHookValue = computedAuthorityHookSummary.value || authorityHookText.value;

    await generate({
      services: services.value,
      authorityHook: authorityHookValue,
      authorityHookFields: { ...authorityHook },
      priceRange: priceRange.value,
      delivery: delivery.value,
      audienceChallenges: audienceChallenges.value
    }, context);

    emit('generated', {
      offers: offers.value
    });
  } catch (err) {
    console.error('[OffersGenerator] Generation failed:', err);
  }
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  await copyToClipboard();
};

/**
 * Copy a single offer/package to clipboard
 */
const handleCopySingleOffer = async (pkg, event, index = null) => {
  // Prevent triggering parent click handlers
  if (event) event.stopPropagation();

  if (!pkg) return;

  // Format the package as readable text
  const formattedText = `${pkg.name || 'Package'}\n\n` +
    `${pkg.description || ''}\n\n` +
    `Includes:\n${pkg.deliverables?.map(d => `• ${d}`).join('\n') || 'N/A'}\n\n` +
    `${pkg.idealClient ? `Ideal for: ${pkg.idealClient}` : ''}`;

  try {
    await navigator.clipboard.writeText(formattedText.trim());
    // Show visual feedback
    copiedPackageIndex.value = index;
    setTimeout(() => {
      copiedPackageIndex.value = null;
    }, 1500);
  } catch (err) {
    console.error('[OffersGenerator] Failed to copy package:', err);
  }
};

/**
 * Handle copy all offers to clipboard as formatted text
 */
const handleCopyAll = async () => {
  // Collect all locked/generated offers
  const allOffers = [];

  ['entry', 'signature', 'premium'].forEach(tier => {
    const offer = lockedOffers.value[tier] || offers.value[tier];
    if (offer) {
      allOffers.push({
        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
        ...offer
      });
    }
  });

  if (allOffers.length === 0) return;

  // Format as readable text
  const formattedText = allOffers.map(offer => {
    return `== ${offer.tier} Package ==\n` +
      `Name: ${offer.name || 'N/A'}\n` +
      `Price: ${offer.price || 'N/A'}\n` +
      `Description: ${offer.description || 'N/A'}\n` +
      `Deliverables: ${offer.deliverables?.join(', ') || 'N/A'}`;
  }).join('\n\n');

  try {
    await navigator.clipboard.writeText(formattedText);
  } catch (err) {
    console.error('[OffersGenerator] Failed to copy all:', err);
  }
};

/**
 * Handle export as markdown file
 */
const handleExport = () => {
  // Collect all locked/generated offers
  const allOffers = [];

  ['entry', 'signature', 'premium'].forEach(tier => {
    const offer = lockedOffers.value[tier] || offers.value[tier];
    if (offer) {
      allOffers.push({
        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
        ...offer
      });
    }
  });

  if (allOffers.length === 0) return;

  // Format as markdown
  const content = `# Service Packages\n\n` +
    allOffers.map(offer => {
      const deliverables = offer.deliverables?.length > 0
        ? offer.deliverables.map(d => `  - ${d}`).join('\n')
        : '  - N/A';
      return `## ${offer.tier} Package\n\n` +
        `**${offer.name || 'Untitled'}**\n\n` +
        `**Price:** ${offer.price || 'TBD'}\n\n` +
        `${offer.description || ''}\n\n` +
        `**Deliverables:**\n${deliverables}`;
    }).join('\n\n---\n\n') +
    `\n\n---\n*Generated with Offers Generator*`;

  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'service-packages.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Handle apply (integrated mode)
 */
const handleApply = () => {
  emit('applied', {
    componentId: props.componentId,
    offers: offers.value
  });
};

/**
 * Handle embedded field change
 */
const handleEmbeddedFieldChange = () => {
  emit('change', {
    services: services.value,
    expertise: authorityHookText.value
  });
};

/**
 * Sync authority hook from store on mount
 */
/**
 * Keyboard shortcut handler (Ctrl/Cmd + Enter to generate)
 */
const handleKeyboardShortcut = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (canGenerate.value && !isGenerating.value && !hasOffers.value) {
      event.preventDefault();
      handleGenerate();
    }
  }
};

onMounted(() => {
  syncFromStore();
  if (authorityHookSummary.value) {
    authorityHookText.value = authorityHookSummary.value;
  }

  // Check for saved draft on mount (standalone mode only)
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

/**
 * Cleanup on unmount
 */
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardShortcut);
});

/**
 * Watch for store changes
 */
watch(authorityHookSummary, (newVal) => {
  if (newVal && !authorityHookText.value) {
    authorityHookText.value = newVal;
  }
});

/**
 * Watch for injected profile data changes (embedded mode)
 */
watch(
  injectedProfileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

/**
 * Watch for profileData prop changes (embedded mode with EmbeddedToolWrapper)
 * Pre-populates form fields when profile data is provided
 */
watch(
  () => props.profileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

/**
 * Watch for field changes in embedded mode and emit preview updates
 */
watch(
  () => [services.value, authorityHookText.value],
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: {
          services: services.value,
          expertise: authorityHookText.value
        }
      });
    }
  },
  { deep: true }
);

/**
 * Emit can-generate status changes to parent (for embedded mode)
 */
watch(canGenerateEmbedded, (newValue) => {
  if (props.mode === 'embedded') {
    emit('update:can-generate', !!newValue);
  }
}, { immediate: true });
</script>

<style scoped>
/* Standalone Mode Styles */
.generator__section {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.generator__field-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 4px;
}

.generator__field-footer .generator__field-helper {
  margin: 0;
  flex: 1;
}

.generator__char-count {
  font-size: 0.75rem;
  color: var(--mkcg-text-secondary, #64748b);
  white-space: nowrap;
  flex-shrink: 0;
}

.generator__section-title {
  font-size: var(--mkcg-font-size-lg, 18px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
}

.generator__field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--mkcg-space-md, 20px);
  margin-bottom: var(--mkcg-space-md, 20px);
}

@media (max-width: 600px) {
  .generator__field-row {
    grid-template-columns: 1fr;
  }
}

.generator__field-select {
  height: 48px;
  cursor: pointer;
}

.generator__actions {
  margin-top: var(--mkcg-space-lg, 30px);
  text-align: center;
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

/* Offers Results */
.offers-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.offers-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.offers-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.offers-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.offers-generator__packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--mkcg-space-md, 20px);
  margin-bottom: var(--mkcg-space-md, 20px);
}

.offers-generator__package {
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  padding: var(--mkcg-space-md, 20px);
  display: flex;
  flex-direction: column;
  transition: var(--mkcg-transition-fast, 0.15s ease);
}

.offers-generator__package:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.offers-generator__package--entry {
  border-top: 3px solid #94a3b8;
}

.offers-generator__package--signature {
  border-top: 3px solid var(--mkcg-primary, #1a9bdc);
  box-shadow: 0 4px 12px rgba(26, 155, 220, 0.15);
}

.offers-generator__package--premium {
  border-top: 3px solid #f59e0b;
}

.offers-generator__package-header {
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.offers-generator__package-tier {
  display: inline-block;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: var(--mkcg-radius-sm, 4px);
  margin-bottom: 8px;
}

.offers-generator__package--entry .offers-generator__package-tier {
  color: #475569;
  background: #f1f5f9;
}

.offers-generator__package--signature .offers-generator__package-tier {
  color: var(--mkcg-primary, #1a9bdc);
  background: rgba(26, 155, 220, 0.1);
}

.offers-generator__package--premium .offers-generator__package-tier {
  color: #d97706;
  background: #fef3c7;
}

.offers-generator__package-name {
  margin: 0;
  font-size: var(--mkcg-font-size-md, 16px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
}

.offers-generator__package-description {
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.offers-generator__package-section {
  flex: 1;
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.offers-generator__package-section-title {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: 12px;
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-secondary, #5a6d7e);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.offers-generator__package-deliverables {
  margin: 0;
  padding: 0 0 0 20px;
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-primary, #2c3e50);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.offers-generator__package-deliverables li {
  margin-bottom: 6px;
}

.offers-generator__package-ideal {
  padding-top: var(--mkcg-space-sm, 12px);
  border-top: 1px solid var(--mkcg-border-light, #e9ecef);
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.offers-generator__package-ideal strong {
  color: var(--mkcg-text-primary, #2c3e50);
}

.offers-generator__note {
  display: flex;
  align-items: flex-start;
  gap: var(--mkcg-space-xs, 8px);
  padding: var(--mkcg-space-md, 20px);
  background: #fef9f3;
  border: 1px solid #fed7aa;
  border-radius: var(--mkcg-radius, 8px);
  font-size: var(--mkcg-font-size-sm, 14px);
  color: #92400e;
}

.offers-generator__note svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #f59e0b;
}

.offers-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles (kept from original) */
.gmkb-ai-packages__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.gmkb-ai-package {
  background: var(--gmkb-ai-bg, #ffffff);
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: var(--gmkb-ai-radius-md, 8px);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.gmkb-ai-package--entry {
  border-top: 3px solid #94a3b8;
}

.gmkb-ai-package--signature {
  border-top: 3px solid var(--gmkb-ai-primary, #6366f1);
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.1);
}

.gmkb-ai-package--premium {
  border-top: 3px solid #f59e0b;
}

.gmkb-ai-package__header {
  margin-bottom: 12px;
}

.gmkb-ai-package__tier {
  display: inline-block;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.gmkb-ai-package--entry .gmkb-ai-package__tier {
  color: #475569;
  background: #f1f5f9;
}

.gmkb-ai-package--signature .gmkb-ai-package__tier {
  color: var(--gmkb-ai-primary, #6366f1);
  background: rgba(99, 102, 241, 0.1);
}

.gmkb-ai-package--premium .gmkb-ai-package__tier {
  color: #d97706;
  background: #fef3c7;
}

.gmkb-ai-package__name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--gmkb-ai-text, #1f2937);
}

.gmkb-ai-package__description {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
  line-height: 1.5;
}

.gmkb-ai-package__section {
  flex: 1;
  margin-bottom: 12px;
}

.gmkb-ai-package__section-title {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--gmkb-ai-text-secondary, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gmkb-ai-package__deliverables {
  margin: 0;
  padding: 0 0 0 16px;
  font-size: 13px;
  color: var(--gmkb-ai-text, #1f2937);
}

.gmkb-ai-package__deliverables li {
  margin-bottom: 4px;
}

.gmkb-ai-package__ideal {
  padding-top: 12px;
  border-top: 1px solid var(--gmkb-ai-border, #e5e7eb);
  font-size: 12px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

.gmkb-ai-package__copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  margin-top: 12px;
  background: var(--gmkb-ai-bg, #ffffff);
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--gmkb-ai-text-secondary, #64748b);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gmkb-ai-package__copy-btn:hover {
  border-color: var(--gmkb-ai-primary, #6366f1);
  color: var(--gmkb-ai-primary, #6366f1);
  background: rgba(99, 102, 241, 0.05);
}

.gmkb-ai-package__copy-btn--copied {
  border-color: #10b981;
  color: #10b981;
  background: #ecfdf5;
}

.gmkb-ai-packages__note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: var(--gmkb-ai-bg-tertiary, #f3f4f6);
  border-radius: var(--gmkb-ai-radius-md, 8px);
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

/* Embedded Mode Styles (for landing page) */
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
  border: 1px solid var(--mkcg-border, #e2e8f0);
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
  color: var(--mkcg-text-light, #94a3b8);
}

.gmkb-embedded-result {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-radius: 8px;
}

.gmkb-embedded-result__content {
  font-size: 15px;
  line-height: 1.6;
  color: #166534;
}

.gmkb-embedded-package {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(22, 101, 52, 0.1);
}

.gmkb-embedded-package:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.gmkb-embedded-package__content {
  flex: 1;
}

.gmkb-embedded-package strong {
  color: #15803d;
}

.gmkb-embedded-package__copy {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: rgba(22, 101, 52, 0.1);
  border: 1px solid rgba(22, 101, 52, 0.2);
  border-radius: 6px;
  color: #15803d;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.gmkb-embedded-package__copy:hover {
  background: rgba(22, 101, 52, 0.2);
  border-color: rgba(22, 101, 52, 0.3);
}

.gmkb-embedded-package__copy--copied {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
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

/* ===========================================
   OFFERS RESULTS - Sidebar + Main Layout
   =========================================== */
.offers-results {
  padding: 0;
}

.offers-results__layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: var(--mkcg-space-lg, 30px);
}

@media (min-width: 900px) {
  .offers-results__layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .offers-results__sidebar {
    position: sticky;
    top: 1rem;
    flex: 0 0 280px;
  }

  .offers-results__main {
    flex: 1;
    min-width: 0;
  }
}

/* Offer Suite Sidebar */
.offers-suite {
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 12px;
  padding: 1.25rem;
}

.offers-suite__title {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--mkcg-text-secondary, #64748b);
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.offers-slot {
  display: block;
  width: 100%;
  padding: 1rem;
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
  text-align: left;
}

.offers-slot:hover {
  border-color: var(--mkcg-primary, #3b82f6);
}

.offers-slot--active {
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 2px var(--mkcg-primary, #3b82f6);
}

.offers-slot--locked {
  background: rgba(59, 130, 246, 0.08);
  border-color: var(--mkcg-primary, #3b82f6);
}

.offers-slot__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.offers-slot__label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--mkcg-text-secondary, #64748b);
}

.offers-slot--locked .offers-slot__label {
  color: var(--mkcg-primary, #3b82f6);
}

.offers-slot--locked .offers-slot__header svg {
  color: var(--mkcg-primary, #3b82f6);
}

.offers-slot__preview {
  font-size: 11px;
  color: var(--mkcg-text-muted, #94a3b8);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.offers-suite__summary {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 10px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--mkcg-primary, #3b82f6);
}

/* Main Area */
.offers-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
}

.offers-results__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--mkcg-text-primary, #0f172a);
}

.offers-results__count {
  display: inline-block;
  background: var(--mkcg-primary, #3b82f6);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 10px;
  margin-left: 8px;
  vertical-align: middle;
}

.offers-results__actions {
  display: flex;
  gap: 8px;
}

/* Offer Card */
.offers-card {
  padding: 1.5rem;
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.offers-card__tier-badge {
  display: inline-block;
  padding: 4px 12px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.offers-card__tier-badge--entry {
  color: #475569;
  background: #f1f5f9;
}

.offers-card__tier-badge--signature {
  color: var(--mkcg-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.1);
}

.offers-card__tier-badge--premium {
  color: #d97706;
  background: #fef3c7;
}

.offers-card__name {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: var(--mkcg-text-primary, #0f172a);
}

.offers-card__description {
  font-size: 14px;
  line-height: 1.6;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0 0 16px 0;
}

.offers-card__meta {
  display: flex;
  gap: 20px;
  padding: 12px 16px;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border-radius: 8px;
  font-size: 12px;
  margin-bottom: 16px;
}

.offers-card__meta-item strong {
  color: var(--mkcg-text-primary, #0f172a);
}

.offers-card__section {
  margin-bottom: 16px;
}

.offers-card__section-title {
  margin: 0 0 8px 0;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--mkcg-text-secondary, #64748b);
  letter-spacing: 0.5px;
}

.offers-card__deliverables {
  margin: 0;
  padding: 0 0 0 20px;
  font-size: 14px;
  color: var(--mkcg-text-primary, #0f172a);
  line-height: 1.7;
}

.offers-card__deliverables li {
  margin-bottom: 6px;
}

.offers-card__ideal {
  padding-top: 16px;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
  font-size: 14px;
  color: var(--mkcg-text-secondary, #64748b);
}

.offers-card__ideal strong {
  color: var(--mkcg-text-primary, #0f172a);
}

.offers-card__actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
}

/* Locked Card */
.offers-locked-card {
  padding: 1.5rem;
  background: rgba(59, 130, 246, 0.08);
  border: 2px solid var(--mkcg-primary, #3b82f6);
  border-radius: 12px;
}

.offers-locked-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--mkcg-primary, #3b82f6);
  background: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.offers-locked-card__name {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: var(--mkcg-text-primary, #0f172a);
}

.offers-locked-card__description {
  font-size: 14px;
  line-height: 1.6;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0 0 16px 0;
}

.offers-locked-card__actions {
  display: flex;
  gap: 10px;
}

/* Empty State */
.offers-empty-state {
  text-align: center;
  padding: 60px 40px;
  color: var(--mkcg-text-secondary, #64748b);
}

.offers-empty-state svg {
  color: var(--mkcg-text-muted, #94a3b8);
  margin-bottom: 16px;
}

.offers-empty-state p {
  font-size: 14px;
  margin: 0;
}

/* Footer */
.offers-results__footer {
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
.offers-save-success {
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

.offers-save-error {
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

/* ===========================================
   ENHANCED UX FEATURES
   =========================================== */

/* Draft Restore Prompt */
.gfy-draft-prompt {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #93c5fd;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.gfy-draft-prompt__content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.gfy-draft-prompt__content svg {
  flex-shrink: 0;
  color: var(--mkcg-primary, #3b82f6);
  margin-top: 2px;
}

.gfy-draft-prompt__content strong {
  display: block;
  font-size: 0.9375rem;
  color: var(--mkcg-text-primary, #0f172a);
  margin-bottom: 0.25rem;
}

.gfy-draft-prompt__content p {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--mkcg-text-secondary, #64748b);
}

.gfy-draft-prompt__actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 2rem;
}

/* Auto-save Indicator */
.gfy-auto-save-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--mkcg-text-secondary, #64748b);
  margin-bottom: 1rem;
}

.gfy-auto-save-indicator svg {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Welcome Section */
.gfy-welcome-section {
  text-align: center;
  padding: 2rem 1.5rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border: 1px dashed var(--mkcg-border, #e2e8f0);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.gfy-welcome-section__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--mkcg-bg, #ffffff);
  border-radius: 50%;
  margin-bottom: 1rem;
  color: var(--mkcg-primary, #6366f1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.gfy-welcome-section__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0 0 0.5rem 0;
}

.gfy-welcome-section__text {
  font-size: 0.9375rem;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0 0 1rem 0;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
}

.gfy-welcome-section__tips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.gfy-welcome-section__tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--mkcg-text-secondary, #64748b);
  background: var(--mkcg-bg, #ffffff);
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
}

.gfy-welcome-section__tip svg {
  color: #10b981;
}

/* Form Progress Indicator */
.gfy-form-progress {
  padding: 12px 16px;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.gfy-form-progress--complete {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.gfy-form-progress__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.gfy-form-progress__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--mkcg-text-secondary, #64748b);
}

.gfy-form-progress--complete .gfy-form-progress__label {
  color: #059669;
}

.gfy-form-progress__bar {
  height: 6px;
  background: var(--mkcg-border, #e2e8f0);
  border-radius: 3px;
  overflow: hidden;
}

.gfy-form-progress__fill {
  height: 100%;
  background: var(--mkcg-primary, #6366f1);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.gfy-form-progress--complete .gfy-form-progress__fill {
  background: #10b981;
}

/* Prefilled Badge */
.gfy-prefilled-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--mkcg-primary, #3b82f6);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-radius: 4px;
  margin-left: 8px;
}

/* Prefilled Input State */
.generator__field-input--prefilled {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.02);
}

/* Cross-tool Navigation */
.gfy-cross-tool-nav {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
}

.gfy-cross-tool-nav__label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--mkcg-text-secondary, #64748b);
  margin-bottom: 0.75rem;
}

.gfy-cross-tool-nav__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.gfy-cross-tool-nav__link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--mkcg-text-primary, #0f172a);
  text-decoration: none;
  transition: all 0.2s ease;
}

.gfy-cross-tool-nav__link:hover {
  background: var(--mkcg-primary, #3b82f6);
  border-color: var(--mkcg-primary, #3b82f6);
  color: #fff;
}

.gfy-cross-tool-nav__link svg {
  flex-shrink: 0;
}

/* Small button variant */
.generator__button--small {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}

/* Loading Skeleton Styles */
.offers-skeleton {
  padding: 1.5rem;
  background: var(--mkcg-bg, #ffffff);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 12px;
}

.offers-skeleton__header {
  margin-bottom: 1.5rem;
}

.offers-skeleton__title {
  width: 200px;
  height: 24px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

.offers-skeleton__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .offers-skeleton__grid {
    grid-template-columns: 1fr;
  }
}

.offers-skeleton__card {
  padding: 1.5rem;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border-radius: 8px;
}

.offers-skeleton__card-header {
  width: 80%;
  height: 20px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

.offers-skeleton__card-desc {
  width: 100%;
  height: 40px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

.offers-skeleton__card-line {
  width: 100%;
  height: 14px;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

.offers-skeleton__card-line--short {
  width: 60%;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===========================================
   MOBILE RESPONSIVE STYLES
   =========================================== */
@media (max-width: 768px) {
  /* Results layout padding */
  .offers-results__layout {
    padding: 20px;
  }

  /* Results header stacks */
  .offers-results__header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .offers-results__title {
    font-size: 1.125rem;
  }

  /* Action buttons wrap */
  .offers-results__actions {
    flex-wrap: wrap;
    width: 100%;
  }

  .offers-results__actions .generator__button {
    flex: 1 1 auto;
    min-width: 100px;
    justify-content: center;
  }

  .offers-results__actions .offers-action-btn {
    flex: 1 1 auto;
    min-width: 80px;
    justify-content: center;
  }

  /* Offers suite sidebar */
  .offers-suite {
    padding: 1rem;
  }

  .offers-slot {
    padding: 12px;
  }

  /* Offer card adjustments */
  .offers-card {
    padding: 1.25rem;
  }

  .offers-card__name {
    font-size: 16px;
  }

  .offers-card__description {
    font-size: 13px;
  }

  .offers-card__meta {
    flex-direction: column;
    gap: 8px;
  }

  .offers-card__actions {
    flex-direction: column;
    width: 100%;
  }

  .offers-card__actions .generator__button {
    width: 100%;
    justify-content: center;
  }

  /* Locked card */
  .offers-locked-card {
    padding: 1.25rem;
  }

  .offers-locked-card__actions {
    flex-direction: column;
    width: 100%;
  }

  .offers-locked-card__actions .generator__button {
    width: 100%;
    justify-content: center;
  }

  /* Footer stacks */
  .offers-results__footer {
    flex-direction: column;
    gap: 1rem;
  }

  .offers-results__footer .generator__button {
    width: 100%;
    justify-content: center;
  }

  /* Welcome section */
  .gfy-welcome-section {
    padding: 1.5rem 1rem;
  }

  .gfy-welcome-section__icon {
    width: 56px;
    height: 56px;
  }

  .gfy-welcome-section__title {
    font-size: 1.125rem;
  }

  .gfy-welcome-section__text {
    font-size: 0.875rem;
  }

  /* Form progress compact */
  .gfy-form-progress {
    padding: 10px 12px;
  }

  /* Draft prompt */
  .gfy-draft-prompt__actions {
    margin-left: 0;
    width: 100%;
  }

  /* Cross-tool navigation */
  .gfy-cross-tool-nav__links {
    flex-direction: column;
  }

  .gfy-cross-tool-nav__link {
    width: 100%;
    justify-content: center;
  }

  /* Packages grid */
  .offers-generator__packages-grid {
    grid-template-columns: 1fr;
  }

  .gmkb-ai-packages__grid {
    grid-template-columns: 1fr;
  }

  /* Skeleton grid */
  .offers-skeleton__grid {
    grid-template-columns: 1fr;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .offers-results__layout {
    padding: 16px;
  }

  .offers-results__actions {
    gap: 6px;
  }

  .offers-results__actions .generator__button {
    padding: 8px 12px;
    font-size: 12px;
  }

  .offers-results__actions .offers-action-btn {
    padding: 8px 10px;
    font-size: 11px;
  }

  .offers-suite {
    padding: 12px;
  }

  .offers-slot {
    padding: 10px;
  }

  .offers-slot__label {
    font-size: 9px;
  }

  .offers-slot__preview {
    font-size: 10px;
  }

  .offers-card {
    padding: 1rem;
  }

  .offers-card__name {
    font-size: 15px;
  }

  .offers-card__deliverables {
    font-size: 13px;
  }

  .generator__button--large {
    padding: 12px 16px;
    font-size: 14px;
  }

  .gfy-welcome-section__tips {
    flex-direction: column;
    gap: 0.5rem;
  }

  .generator__field-row {
    gap: 12px;
  }

  .generator__section-title {
    font-size: 15px;
  }
}
</style>
