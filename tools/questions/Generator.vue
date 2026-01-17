<template>
  <!-- Standalone Mode: Tool card content (hero is provided by landing page wrapper) -->
  <div v-if="mode === 'default'" class="gfy-questions-wrapper gmkb-generator-root">
    <div class="gmkb-plg-tool-embed">
            <!-- Profile Selector (for logged-in users in standalone mode) -->
            <ProfileSelector
              @profile-selected="handleProfileSelected"
              @profile-cleared="handleProfileCleared"
            />

            <!-- Auto-save Indicator -->
            <div v-if="isAutoSaving" class="gfy-auto-save-indicator">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Saving draft...
            </div>

            <!-- Recent History Section -->
            <div v-if="hasHistory" class="gfy-history">
              <button
                type="button"
                class="gfy-history__toggle"
                :aria-expanded="showHistory"
                aria-controls="questions-history-panel"
                @click="showHistory = !showHistory"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>Recent Generations ({{ history.length }})</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="gfy-history__chevron"
                  :class="{ 'gfy-history__chevron--open': showHistory }"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              <div v-if="showHistory" id="questions-history-panel" class="gfy-history__panel" role="region" aria-label="Recent generations">
                <div class="gfy-history__list">
                  <div
                    v-for="entry in history"
                    :key="entry.id"
                    class="gfy-history__item"
                  >
                    <div class="gfy-history__item-content">
                      <span class="gfy-history__item-preview">{{ entry.preview }}</span>
                      <span class="gfy-history__item-time">{{ formatTimestamp(entry.timestamp) }}</span>
                    </div>
                    <div class="gfy-history__item-actions">
                      <button
                        type="button"
                        class="gfy-history__action-btn"
                        title="Restore inputs only"
                        aria-label="Restore inputs from this generation"
                        @click="restoreFromHistory(entry)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                          <path d="M3 3v5h5"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        class="gfy-history__action-btn gfy-history__action-btn--primary"
                        title="Restore inputs and results"
                        aria-label="Restore full generation with results"
                        @click="restoreFullHistory(entry)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        class="gfy-history__action-btn gfy-history__action-btn--danger"
                        title="Remove from history"
                        aria-label="Delete this history entry"
                        @click="removeFromHistory(entry.id)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  v-if="history.length > 1"
                  type="button"
                  class="gfy-history__clear-btn"
                  @click="clearHistory"
                >
                  Clear All History
                </button>
              </div>
            </div>

            <!-- STEP 1: Topic Selection -->
            <div class="gfy-form-section">
              <h3 class="gfy-form-section__title">Step 1: Choose or Tweak Your Topic</h3>

              <div class="gfy-highlight-box gfy-highlight-box--blue">
                <!-- Topic Selection Grid -->
                <div v-if="availableTopics.length > 0" class="questions-topic-grid" role="radiogroup" aria-label="Available topics">
                  <button
                    v-for="(topic, index) in availableTopics"
                    :key="index"
                    type="button"
                    class="questions-topic-card"
                    :class="{ 'questions-topic-card--active': selectedTopicIndex === index }"
                    role="radio"
                    :aria-checked="selectedTopicIndex === index"
                    :aria-label="`Topic ${index + 1}: ${topic}`"
                    @click="selectTopic(index)"
                  >
                    <span class="questions-topic-card__number" aria-hidden="true">{{ index + 1 }}</span>
                    <span class="questions-topic-card__text">{{ topic }}</span>
                  </button>
                </div>

                <!-- No Topics Message -->
                <div v-else class="questions-topic-empty">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                  <p>No topics available. Generate topics first using the Topics Generator, or enter a custom topic below.</p>
                </div>

                <!-- Refine Selected Topic Textarea -->
                <textarea
                  v-model="refinedTopic"
                  class="questions-refine-textarea"
                  rows="2"
                  placeholder="Refine topic or enter your own..."
                ></textarea>
              </div>
            </div>

            <!-- STEP 2: Authority Hook -->
            <div class="gfy-form-section">
              <h3 class="gfy-form-section__title">Step 2: Confirm Your Authority Hook</h3>

              <AuthorityHookBuilder
                :model-value="authorityHook"
                @update:model-value="Object.assign(authorityHook, $event)"
                title="Authority Hook"
                :placeholders="{
                  who: 'e.g. SaaS Founders',
                  what: 'e.g. Increase revenue by 40%',
                  when: 'e.g. When scaling rapidly',
                  how: 'e.g. My proven 90-day system'
                }"
                :prefilled-fields="prefilledFields"
              />
            </div>

            <!-- Step 3: Customize Details (new section from mockup) -->
            <div class="gfy-form-section">
              <h3 class="gfy-form-section__title">Step 3: Customize Details</h3>

              <div class="gfy-input-group">
                <label class="gfy-label">Guest Bio / Context</label>
                <textarea
                  v-model="guestBio"
                  class="gfy-textarea"
                  placeholder="Paste bio or interview context here..."
                  rows="4"
                ></textarea>
              </div>

              <div class="gfy-input-group">
                <label class="gfy-label">Target Audience</label>
                <input
                  v-model="targetAudience"
                  type="text"
                  class="gfy-input"
                  placeholder="e.g. HR Managers, Startup Founders"
                />
              </div>

              <div class="gfy-input-row">
                <div class="gfy-input-group">
                  <label class="gfy-label">Tone</label>
                  <select v-model="selectedTone" class="gfy-select">
                    <option value="professional">Professional</option>
                    <option value="conversational">Conversational</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
                <div class="gfy-input-group">
                  <label class="gfy-label">Question Count</label>
                  <div class="gfy-range-container">
                    <input
                      v-model="questionCount"
                      type="range"
                      class="gfy-range"
                      min="5"
                      max="15"
                    />
                    <span class="gfy-range-value">{{ questionCount }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions & Restore Link -->
            <div class="gfy-actions-wrapper">
              <!-- Redesigned Restore Link (subtle text link) -->
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
                class="gfy-btn gfy-btn--generate"
                :class="{ 'gfy-btn--loading': isGenerating }"
                :disabled="!canGenerate || isGenerating"
                @click="handleGenerate"
              >
                <svg v-if="!isGenerating" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                {{ isGenerating ? 'Generating Questions...' : 'Generate Questions' }}
              </button>

              <p class="gfy-form-hint">
                Generate questions for your specific audience in seconds.
              </p>
            </div>

            <!-- Error Display -->
            <div v-if="error" class="gfy-form-error">
              <p>{{ error }}</p>
              <button type="button" class="gfy-btn gfy-btn--outline" @click="handleGenerate">
                Try Again
              </button>
            </div>

          <!-- Results Container (appears below when generated) -->
          <div v-if="hasQuestions" class="gfy-results-container">
            <div class="questions-results">
              <div class="questions-results__layout">
                <!-- SIDEBAR: Interview Set (5 Lockable Slots) -->
                <aside class="questions-results__sidebar">
                  <div class="questions-interview-set">
                    <div class="questions-interview-set__header">
                      <h3 class="questions-interview-set__title">Your Interview Set</h3>
                      <span class="questions-interview-set__hint">Click lock to keep existing questions</span>
                    </div>

                    <div class="questions-interview-set__list">
                      <div
                        v-for="(slot, slotIndex) in interviewSet"
                        :key="slotIndex"
                        class="questions-interview-slot"
                        :class="{ 'questions-interview-slot--locked': slot.locked, 'questions-interview-slot--filled': slot.question }"
                      >
                        <span class="questions-interview-slot__position">{{ slotIndex + 1 }}</span>
                        <span class="questions-interview-slot__text" :class="{ 'questions-interview-slot__text--empty': !slot.question }">
                          {{ slot.question || 'Empty Slot' }}
                        </span>
                        <button
                          type="button"
                          class="questions-interview-slot__lock"
                          :title="slot.locked ? 'Unlock question' : 'Lock question'"
                          :aria-label="slot.locked ? 'Unlock this question to allow replacement' : 'Lock this question to preserve it'"
                          :aria-pressed="slot.locked"
                          @click="toggleSlotLock(slotIndex)"
                          :disabled="!slot.question"
                        >
                          <svg v-if="slot.locked" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                          </svg>
                          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div class="questions-interview-set__summary">
                      <span class="questions-interview-set__locked-count">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                        </svg>
                        {{ lockedSlotsCount }} locked
                      </span>
                      <span class="questions-interview-set__available">{{ availableSlotsCount }} slots available</span>
                    </div>
                  </div>
                </aside>

                <!-- MAIN: AI Generated Questions -->
                <main class="questions-results__main">
                  <div class="questions-results__header">
                    <div class="questions-results__title-row">
                      <h3 class="questions-results__title">AI Generated Questions</h3>
                      <span class="questions-results__count">{{ questions.length }} Ideas</span>
                    </div>
                    <div class="questions-results__actions">
                      <button
                        type="button"
                        class="gfy-btn gfy-btn--outline"
                        title="Generate new interview questions"
                        aria-label="Regenerate questions"
                        @click="handleGenerate"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path d="M23 4v6h-6M1 20v-6h6"/>
                          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                        </svg>
                        Regenerate
                      </button>
                      <button
                        type="button"
                        class="gfy-btn gfy-btn--outline"
                        title="Copy all questions to clipboard"
                        aria-label="Copy all questions to clipboard"
                        @click="handleCopy"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Copy All
                      </button>
                      <button
                        type="button"
                        class="questions-action-btn"
                        @click="handleExport"
                        title="Download questions as markdown file"
                        aria-label="Export questions as markdown"
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

                  <!-- Selection Banner -->
                  <div class="questions-selection-banner">
                    <span>Topic: <strong>"{{ refinedTopic }}"</strong></span>
                    <span class="questions-selection-banner__count">{{ selectedQuestionsCount }} of {{ availableSlotsCount }} selected</span>
                  </div>

                  <!-- Questions List with Checkboxes -->
                  <div class="questions-list" role="listbox" aria-label="Generated interview questions" :aria-multiselectable="true">
                    <div
                      v-for="(question, index) in questions"
                      :key="index"
                      class="questions-row"
                      :class="{ 'questions-row--selected': isQuestionSelected(index), 'questions-row--disabled': !canSelectMore && !isQuestionSelected(index) }"
                      role="option"
                      :aria-selected="isQuestionSelected(index)"
                      :aria-disabled="!canSelectMore && !isQuestionSelected(index)"
                      tabindex="0"
                      @click="toggleQuestionSelection(index)"
                      @keydown.enter.prevent="toggleQuestionSelection(index)"
                      @keydown.space.prevent="toggleQuestionSelection(index)"
                    >
                      <div class="questions-row__checkbox" :class="{ 'questions-row__checkbox--checked': isQuestionSelected(index) }">
                        <svg v-if="isQuestionSelected(index)" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="3" fill="none"/>
                        </svg>
                      </div>
                      <span class="questions-row__number">{{ index + 1 }}.</span>
                      <p class="questions-row__text">{{ question }}</p>
                      <button
                        type="button"
                        class="questions-copy-btn"
                        :class="{ 'questions-copy-btn--copied': copiedQuestionIndex === index }"
                        :title="copiedQuestionIndex === index ? 'Copied!' : 'Copy question'"
                        :aria-label="copiedQuestionIndex === index ? 'Question copied to clipboard' : 'Copy this question to clipboard'"
                        @click="copyQuestion(index, $event)"
                      >
                        <svg v-if="copiedQuestionIndex === index" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Footer Actions -->
                  <div class="questions-results__footer">
                    <div class="questions-results__save-area">
                      <button
                        type="button"
                        class="gfy-btn gfy-btn--primary gfy-btn--large"
                        :disabled="selectedQuestionsCount === 0 || isSavingToProfile"
                        title="Save selected questions to your media kit"
                        aria-label="Save selected questions to media kit"
                        @click="handleSaveToMediaKit"
                      >
                        <svg v-if="isSavingToProfile" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"/>
                        </svg>
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                          <polyline points="17 21 17 13 7 13 7 21"/>
                          <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        {{ isSavingToProfile ? 'Saving...' : (hasSelectedProfile ? 'Save to Profile & Media Kit' : 'Save to Media Kit') }}
                      </button>

                      <!-- Save Success Message -->
                      <div v-if="saveSuccess" class="questions-save-success" role="status" aria-live="polite">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Questions saved to your profile!
                      </div>

                      <!-- Save Error Message -->
                      <div v-if="saveError" class="questions-save-error" role="alert" aria-live="assertive">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        {{ saveError }}
                      </div>
                    </div>
                    <button
                      type="button"
                      class="gfy-btn gfy-btn--ghost"
                      title="Clear results and start fresh"
                      aria-label="Start over with new questions"
                      @click="handleStartOver"
                    >
                      Start Over
                    </button>
                  </div>

                  <!-- Cross-tool Navigation -->
                  <div v-if="lockedSlotsCount > 0" class="gfy-cross-tool-nav">
                    <span class="gfy-cross-tool-nav__label">Continue building your media kit:</span>
                    <div class="gfy-cross-tool-nav__links">
                      <a href="/tools/biography/" class="gfy-cross-tool-nav__link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Generate Biography
                      </a>
                      <a href="/tools/guest-intro/" class="gfy-cross-tool-nav__link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                          <line x1="12" y1="19" x2="12" y2="23"/>
                          <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                        Generate Guest Intro
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
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
          <!-- End Results Container -->
        </div>
        <!-- End Tool Embed -->
      </div>
      <!-- End Standalone Mode -->

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else-if="mode === 'integrated'"
    title="Interview Questions Generator"
    description="Generate thoughtful interview questions for your selected topic."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasQuestions"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Questions"
    :show-cta="!hasQuestions"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form - Same fields as standalone for consistent results -->
    <div class="gmkb-ai-form">
      <!-- Profile context indicator -->
      <div v-if="hasMediaKitContext" class="gmkb-ai-context-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Pre-filled from your profile</span>
      </div>

      <!-- Step 1: Topic -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Interview Topic</label>
        <textarea
          v-model="refinedTopic"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., The 3 Hidden Revenue Leaks Killing Your Growth"
          rows="2"
        ></textarea>
      </div>

      <!-- Step 2: Authority Hook (all 4 fields) -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Authority Hook</label>
        <div class="gmkb-ai-hook-grid">
          <div class="gmkb-ai-hook-field">
            <label class="gmkb-ai-label--small">Who do you help?</label>
            <input
              v-model="authorityHook.who"
              type="text"
              class="gmkb-ai-input"
              placeholder="e.g., SaaS Founders"
            />
          </div>
          <div class="gmkb-ai-hook-field">
            <label class="gmkb-ai-label--small">What result?</label>
            <input
              v-model="authorityHook.what"
              type="text"
              class="gmkb-ai-input"
              placeholder="e.g., Increase revenue by 40%"
            />
          </div>
          <div class="gmkb-ai-hook-field">
            <label class="gmkb-ai-label--small">When do they need it?</label>
            <input
              v-model="authorityHook.when"
              type="text"
              class="gmkb-ai-input"
              placeholder="e.g., When scaling rapidly"
            />
          </div>
          <div class="gmkb-ai-hook-field">
            <label class="gmkb-ai-label--small">How do you do it?</label>
            <input
              v-model="authorityHook.how"
              type="text"
              class="gmkb-ai-input"
              placeholder="e.g., My proven 90-day system"
            />
          </div>
        </div>
      </div>

      <!-- Step 3: Details -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Guest Bio / Context</label>
        <textarea
          v-model="guestBio"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="Brief background about you..."
          rows="2"
        ></textarea>
      </div>

      <div class="gmkb-ai-form-row">
        <div class="gmkb-ai-form-group">
          <label class="gmkb-ai-label">Target Audience</label>
          <input
            v-model="targetAudience"
            type="text"
            class="gmkb-ai-input"
            placeholder="e.g., HR Managers, Startup Founders"
          />
        </div>
        <div class="gmkb-ai-form-group">
          <label class="gmkb-ai-label">Tone</label>
          <select v-model="selectedTone" class="gmkb-ai-input gmkb-ai-select">
            <option value="professional">Professional</option>
            <option value="conversational">Conversational</option>
            <option value="bold">Bold</option>
          </select>
        </div>
      </div>

      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Question Count: {{ questionCount }}</label>
        <input
          v-model="questionCount"
          type="range"
          class="gmkb-ai-range"
          min="5"
          max="15"
        />
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        :text="`Generate ${questionCount} Questions`"
        loading-text="Generating questions..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasQuestions" class="gmkb-ai-questions">
        <ol class="gmkb-ai-questions__list">
          <li
            v-for="(question, index) in questions"
            :key="index"
            class="gmkb-ai-questions__item"
          >
            {{ question }}
          </li>
        </ol>

        <!-- Total Count -->
        <div class="gmkb-ai-questions__summary">
          {{ questions.length }} questions generated
        </div>
      </div>
    </template>
  </AiWidgetFrame>

</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAIQuestions, QUESTION_CATEGORIES } from '../../src/composables/useAIQuestions';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';
import { useStandaloneProfile } from '../../src/composables/useStandaloneProfile';
import { useProfilePrePopulation } from '../../src/composables/useProfilePrePopulation';
import { useDraftState } from '../../src/composables/useDraftState';
import { useGeneratorHistory } from '../../src/composables/useGeneratorHistory';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, AuthorityHookBuilder, ProfileSelector } from '../_shared';

const props = defineProps({
  /**
   * Mode: 'default' or 'integrated'
   */
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated'].includes(v)
  },
  /**
   * Component ID to apply results to (integrated mode)
   */
  componentId: {
    type: String,
    default: null
  },

  /**
   * Available topics from Topics Generator (passed as prop)
   */
  topics: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['applied', 'generated']);

// Use composables
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  questions,
  hasQuestions,
  generate,
  copyToClipboard,
  reset
} = useAIQuestions();

const { syncFromStore, loadFromProfileData } = useAuthorityHook();

// Profile functionality (standalone mode)
const {
  selectedProfileId,
  profileData,
  hasSelectedProfile,
  saveMultipleToProfile,
  getAuthorityHookData
} = useStandaloneProfile();

// Watch profileData and populate form when profile is selected (standalone mode)
watch(profileData, (newData) => {
  if (newData && props.mode === 'default') {
    populateFromProfile(newData);
  }
}, { immediate: true });

// Profile pre-population for integrated mode (media kit context)
const {
  hasProfileData: hasMediaKitProfileData,
  getPrePopulatedData,
  getProfileField
} = useProfilePrePopulation('questions');

// Direct access to profile data for reliable pre-fill
const getDirectProfileData = () => {
  return window.gmkbData?.pods_data || window.gmkbVueData?.pods_data || {};
};

// Computed: has media kit context (for integrated mode)
const hasMediaKitContext = computed(() => {
  if (props.mode !== 'integrated') return false;
  const profileData = getDirectProfileData();
  return Object.keys(profileData).length > 0;
});

/**
 * Pre-fill form fields from media kit profile data
 */
function prefillFromMediaKitProfile() {
  const profileData = getDirectProfileData();
  if (!profileData || Object.keys(profileData).length === 0) {
    console.log('[QuestionsGenerator] No profile data available for pre-fill');
    return;
  }

  console.log('[QuestionsGenerator] Pre-filling from profile data:', Object.keys(profileData));

  // Authority hook fields (check multiple possible field names)
  const hookWho = profileData.hook_who || profileData.authority_hook_who || '';
  const hookWhat = profileData.hook_what || profileData.authority_hook_what || '';
  const hookWhen = profileData.hook_when || profileData.authority_hook_when || '';
  const hookHow = profileData.hook_how || profileData.authority_hook_how || '';

  // Bio field
  const bio = profileData.biography || profileData.guest_biography || profileData.bio || '';

  // Target audience
  const audience = profileData.target_audience || profileData.audience || '';

  // Only fill if form field is empty
  if (hookWho && !authorityHook.who) authorityHook.who = hookWho;
  if (hookWhat && !authorityHook.what) authorityHook.what = hookWhat;
  if (hookWhen && !authorityHook.when) authorityHook.when = hookWhen;
  if (hookHow && !authorityHook.how) authorityHook.how = hookHow;
  if (bio && !guestBio.value) guestBio.value = bio;
  if (audience && !targetAudience.value) targetAudience.value = audience;

  console.log('[QuestionsGenerator] Pre-fill complete:', {
    hookWho: !!hookWho, hookWhat: !!hookWhat, hookWhen: !!hookWhen, hookHow: !!hookHow, bio: !!bio
  });
}

// Auto-fill from media kit profile when in integrated mode (on mount)
onMounted(() => {
  if (props.mode === 'integrated') {
    // Small delay to ensure window data is available
    setTimeout(() => {
      prefillFromMediaKitProfile();
    }, 100);
  }
});

// Save to profile state
const isSavingToProfile = ref(false);
const saveSuccess = ref(false);
const saveError = ref(null);

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
} = useDraftState('questions');

// History for recent generations
const {
  history,
  hasHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  formatTimestamp
} = useGeneratorHistory('questions');

// Show/hide history panel
const showHistory = ref(false);

// Prefilled fields tracking
const prefilledFields = ref(new Set());
const showDraftPrompt = ref(false);

// Local state
const selectedTopicIndex = ref(-1);
const refinedTopic = ref('');

// Authority Hook state (reactive object for 4 W's)
const authorityHook = reactive({
  who: '',
  what: '',
  when: '',
  how: ''
});

// ===========================================
// PROFILE SELECTOR HANDLERS
// ===========================================
/**
 * Handle profile selected from ProfileSelector (standalone mode)
 */
function handleProfileSelected({ data }) {
  if (data && props.mode === 'default') {
    populateFromProfile(data);
  }
}

/**
 * Handle profile cleared from ProfileSelector (standalone mode)
 */
function handleProfileCleared() {
  // Clear topics loaded from profile when profile is deselected
  profileTopics.value = [];
  selectedTopicIndex.value = -1;
  refinedTopic.value = '';
  // Clear prefilled fields tracking
  prefilledFields.value = new Set();
}

// ===========================================
// STEP 3: CUSTOMIZE DETAILS STATE
// ===========================================
const guestBio = ref('');
const targetAudience = ref('');
const selectedTone = ref('professional');
const questionCount = ref(10);

// Topics loaded from selected profile (standalone mode)
const profileTopics = ref([]);

// Available topics (from props or profile selection)
const availableTopics = computed(() => {
  // First check props (from embedded/integrated mode)
  if (props.topics && props.topics.length > 0) {
    return props.topics;
  }
  // Then check topics loaded from selected profile (standalone mode)
  if (profileTopics.value.length > 0) {
    return profileTopics.value;
  }
  // Return empty array - topics should come from profile selection
  return [];
});

// Authority Hook live preview
const authorityHookPreview = computed(() => {
  const { who, what, when, how } = authorityHook;
  if (!who && !what) return '';

  let preview = 'I help';
  if (who) preview += ` ${who}`;
  if (what) preview += ` ${what}`;
  if (when) preview += ` ${when}`;
  if (how) preview += ` through ${how}`;

  return preview + '.';
});

// ===========================================
// INTERVIEW SET STATE (5 Lockable Slots)
// ===========================================
const MAX_INTERVIEW_SLOTS = 5;

// Interview set: 5 slots that can be locked
const interviewSet = ref([
  { question: null, locked: false },
  { question: null, locked: false },
  { question: null, locked: false },
  { question: null, locked: false },
  { question: null, locked: false }
]);

// Selected question indices from the generated list
const selectedQuestionIndices = ref([]);

// Track which question was just copied for visual feedback
const copiedQuestionIndex = ref(null);

// Count of locked slots
const lockedSlotsCount = computed(() => {
  return interviewSet.value.filter(slot => slot.locked).length;
});

// Count of available (unlocked empty) slots
const availableSlotsCount = computed(() => {
  return MAX_INTERVIEW_SLOTS - lockedSlotsCount.value;
});

// Count of selected questions
const selectedQuestionsCount = computed(() => {
  return selectedQuestionIndices.value.length;
});

// Can select more questions?
const canSelectMore = computed(() => {
  return selectedQuestionsCount.value < availableSlotsCount.value;
});

/**
 * Check if a question is selected
 */
const isQuestionSelected = (index) => {
  return selectedQuestionIndices.value.includes(index);
};

/**
 * Toggle question selection
 */
const toggleQuestionSelection = (index) => {
  const idx = selectedQuestionIndices.value.indexOf(index);
  if (idx > -1) {
    // Deselect
    selectedQuestionIndices.value.splice(idx, 1);
    // Also remove from interview set if it was there
    const slotIdx = interviewSet.value.findIndex(
      slot => !slot.locked && slot.question === questions.value[index]
    );
    if (slotIdx > -1) {
      interviewSet.value[slotIdx].question = null;
    }
  } else if (canSelectMore.value) {
    // Select
    selectedQuestionIndices.value.push(index);
    // Add to first available unlocked slot
    const emptySlotIdx = interviewSet.value.findIndex(
      slot => !slot.locked && !slot.question
    );
    if (emptySlotIdx > -1) {
      interviewSet.value[emptySlotIdx].question = questions.value[index];
    }
  }
};

/**
 * Toggle lock on a slot
 */
const toggleSlotLock = (slotIndex) => {
  const slot = interviewSet.value[slotIndex];
  if (slot.question) {
    slot.locked = !slot.locked;
  }
};

/**
 * Select a topic from the grid
 */
const selectTopic = (index) => {
  selectedTopicIndex.value = index;
  refinedTopic.value = availableTopics.value[index] || '';
};

/**
 * Copy single question to clipboard
 */
const copyQuestion = async (index, event) => {
  // Prevent triggering row selection
  if (event) event.stopPropagation();

  const question = questions.value[index];
  if (question) {
    try {
      await navigator.clipboard.writeText(question);
      // Show visual feedback
      copiedQuestionIndex.value = index;
      setTimeout(() => {
        copiedQuestionIndex.value = null;
      }, 1500);
    } catch (err) {
      console.error('[QuestionsGenerator] Failed to copy question:', err);
    }
  }
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  const newPrefilledFields = new Set();

  // Populate authority hook fields (check multiple field name patterns)
  const hookWho = profileData.hook_who || profileData.authority_hook_who || '';
  const hookWhat = profileData.hook_what || profileData.authority_hook_what || '';
  const hookWhen = profileData.hook_when || profileData.authority_hook_when || '';
  const hookHow = profileData.hook_how || profileData.authority_hook_how || '';

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

  // Populate authority hook fields from profile data (for cross-tool sync)
  loadFromProfileData(profileData);

  // Extract topics from profile (stored as topic_1, topic_2, etc.)
  const topics = [];
  for (let i = 1; i <= 5; i++) {
    const topicText = profileData[`topic_${i}`];
    if (topicText && topicText.trim()) {
      topics.push(topicText.trim());
    }
  }
  if (topics.length > 0) {
    profileTopics.value = topics;
    // Auto-select first topic if none selected
    if (selectedTopicIndex.value === -1) {
      selectTopic(0);
    }
  }

  // Update prefilled fields tracking
  prefilledFields.value = newPrefilledFields;
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
    refinedTopic: refinedTopic.value,
    selectedTopicIndex: selectedTopicIndex.value,
    authorityHook: { ...authorityHook }
  };
}

/**
 * Restore form state from draft
 */
function restoreDraftState(draft) {
  if (draft.refinedTopic) refinedTopic.value = draft.refinedTopic;
  if (draft.selectedTopicIndex !== undefined) selectedTopicIndex.value = draft.selectedTopicIndex;
  if (draft.authorityHook) Object.assign(authorityHook, draft.authorityHook);
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
 * Restore inputs from a history entry (without results)
 */
function restoreFromHistory(entry) {
  if (entry.inputs) {
    if (entry.inputs.topic) refinedTopic.value = entry.inputs.topic;
    if (entry.inputs.authorityHook) Object.assign(authorityHook, entry.inputs.authorityHook);
  }
  showHistory.value = false;
}

/**
 * Restore full history entry (inputs + results)
 */
function restoreFullHistory(entry) {
  restoreFromHistory(entry);
  if (entry.results && Array.isArray(entry.results)) {
    questions.value = entry.results;
    // Reset selections
    selectedQuestionIndices.value = [];
    interviewSet.value.forEach(slot => {
      if (!slot.locked) {
        slot.question = null;
      }
    });
  }
}


/**
 * Questions formula for guidance panel
 */
const questionsFormula = '<span class="gfy-highlight">[TOPIC]</span> + <span class="gfy-highlight">[AUTHORITY]</span> + <span class="gfy-highlight">[CONTEXT]</span> = Interview Questions';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Great Questions Matter',
    description: 'The quality of your interview is directly tied to the quality of your questions. Great questions go beyond surface-level conversation to uncover deep insights, compelling stories, and actionable advice.'
  },
  {
    title: 'What Makes Questions Memorable',
    description: 'The best interview questions are specific, open-ended, and designed to elicit stories and examples. They focus on experiences, transformations, and practical wisdom.'
  },
  {
    title: 'How to Use Your Questions',
    description: 'Use your generated questions as a strategic framework, not a rigid script. Select questions that best align with your guest\'s expertise, and be ready to ask follow-up questions.'
  }
];

/**
 * Example interview questions for guidance panel
 */
const examples = [
  {
    title: 'Deep-Dive Question:',
    description: 'Can you walk me through a specific moment when you realized your approach needed to fundamentally change?'
  },
  {
    title: 'Actionable Question:',
    description: 'If someone listening is struggling with this, what\'s one practical step they could implement this week?'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return refinedTopic.value.trim().length > 0;
});

/**
 * Form completion status for progress indicator
 */
const formCompletion = computed(() => {
  const fields = [
    { name: 'Topic', filled: !!(refinedTopic.value && refinedTopic.value.trim()) },
    { name: 'Who you help', filled: !!authorityHook.who },
    { name: 'What you do', filled: !!authorityHook.what }
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
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';

    // Build authority hook string from components
    let authorityHookStr = '';
    if (authorityHook.who || authorityHook.what) {
      authorityHookStr = authorityHookPreview.value;
    }

    await generate({
      topics: refinedTopic.value,
      authorityHook: authorityHookStr
    }, context);

    // Clear selections (but keep locked items)
    selectedQuestionIndices.value = [];
    // Clear unlocked slots
    interviewSet.value.forEach(slot => {
      if (!slot.locked) {
        slot.question = null;
      }
    });

    // Save to history on successful generation
    if (questions.value && questions.value.length > 0) {
      addToHistory({
        inputs: {
          topic: refinedTopic.value,
          authorityHook: { ...authorityHook }
        },
        results: questions.value,
        preview: refinedTopic.value?.substring(0, 50) || questions.value[0]
      });
    }

    emit('generated', {
      questions: questions.value
    });
  } catch (err) {
    console.error('[QuestionsGenerator] Generation failed:', err);
  }
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  await copyToClipboard();
};

/**
 * Export questions as a downloadable markdown file
 */
const handleExport = () => {
  if (!questions.value || questions.value.length === 0) return;

  // Create markdown-formatted content
  const content = `# Interview Questions\n\n` +
    `**Topic:** ${refinedTopic.value}\n\n` +
    questions.value.map((question, index) => `${index + 1}. ${question}`).join('\n') +
    `\n\n---\nGenerated with Interview Questions Generator`;

  // Create and trigger download
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'interview-questions.md';
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
    questions: questions.value
  });
};

/**
 * Handle save to media kit - save selected questions
 * Also saves to profile if in standalone mode with a profile selected
 */
const handleSaveToMediaKit = async () => {
  // Get all questions from the interview set (both locked and selected)
  const savedQuestions = interviewSet.value
    .filter(slot => slot.question)
    .map(slot => slot.question);

  // Save to profile if in standalone mode with profile selected
  if (props.mode === 'default' && hasSelectedProfile.value && savedQuestions.length > 0) {
    isSavingToProfile.value = true;
    saveSuccess.value = false;
    saveError.value = null;

    try {
      // Build question fields object (question_1 through question_10)
      const questionFields = {};
      savedQuestions.forEach((question, index) => {
        if (index < 10) { // Max 10 questions
          questionFields[`question_${index + 1}`] = question;
        }
      });

      const success = await saveMultipleToProfile(questionFields);
      if (success) {
        saveSuccess.value = true;
        setTimeout(() => { saveSuccess.value = false; }, 3000);
      } else {
        saveError.value = 'Failed to save questions to profile';
      }
    } catch (err) {
      saveError.value = err.message || 'Failed to save questions';
    } finally {
      isSavingToProfile.value = false;
    }
  }

  emit('applied', {
    componentId: props.componentId,
    questions: savedQuestions,
    interviewSet: interviewSet.value,
    action: 'save'
  });
};

/**
 * Handle start over - reset all state
 */
const handleStartOver = () => {
  reset();
  selectedTopicIndex.value = -1;
  refinedTopic.value = '';
  // Reset interview set
  selectedQuestionIndices.value = [];
  interviewSet.value = [
    { question: null, locked: false },
    { question: null, locked: false },
    { question: null, locked: false },
    { question: null, locked: false },
    { question: null, locked: false }
  ];
};

/**
 * Sync authority hook from store on mount
 */
/**
 * Keyboard shortcut handler (Ctrl/Cmd + Enter to generate)
 */
const handleKeyboardShortcut = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (canGenerate.value && !isGenerating.value && !hasQuestions.value) {
      event.preventDefault();
      handleGenerate();
    }
  }
};

onMounted(() => {
  syncFromStore();

  // Auto-select first topic if available
  if (availableTopics.value.length > 0 && selectedTopicIndex.value === -1) {
    selectTopic(0);
  }

  // Check for saved draft on mount (standalone mode only)
  if (props.mode === 'default' && hasDraft.value) {
    showDraftPrompt.value = true;
  }

  // Start auto-save in standalone mode
  if (props.mode === 'default') {
    startAutoSave(getDraftState);
    // Load available profiles for the profile selector
    loadProfiles();
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
 * Watch for topics prop changes
 */
watch(
  () => props.topics,
  (newTopics) => {
    if (newTopics && newTopics.length > 0 && selectedTopicIndex.value === -1) {
      selectTopic(0);
    }
  },
  { immediate: true }
);

/**
 * Watch for profile data changes from composable
 * Pre-fill form fields when a profile is selected
 */
watch(
  profileData,
  (newProfileData) => {
    if (newProfileData) {
      // Pre-fill authority hook from profile
      if (profileAuthorityHook.value) {
        authorityHook.who = profileAuthorityHook.value.who || '';
        authorityHook.what = profileAuthorityHook.value.what || '';
        authorityHook.when = profileAuthorityHook.value.when || '';
        authorityHook.how = profileAuthorityHook.value.how || '';
      }

      // Pre-fill guest bio from profile content
      if (profileContentFields.value?.biography) {
        guestBio.value = profileContentFields.value.biography;
      }

      // Pre-fill target audience if available
      if (newProfileData.target_audience) {
        targetAudience.value = newProfileData.target_audience;
      }

      // Pre-fill tone if available
      if (newProfileData.tone) {
        selectedTone.value = newProfileData.tone;
      }
    }
  },
  { deep: true }
);

</script>

<style scoped>
@import "../_shared/gfy-form-base.css";

/* Standalone Mode Styles */
.gfy-highlight-box {
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 10px;
  padding: 16px;
}

.gfy-highlight-box--blue {
  border-left: 4px solid var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-bg-secondary, #f9fafb);
}

.gfy-highlight-box--green {
  border-left: 4px solid #10b981;
  background: #ecfdf5;
}

.gfy-form-hint {
  text-align: center;
  font-size: 13px;
  color: var(--mkcg-text-secondary, #64748b);
  margin-top: 20px;
}

/* ===========================================
   TOPIC SELECTION GRID
   =========================================== */
.questions-topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .questions-topic-grid {
    grid-template-columns: 1fr;
  }
}

.questions-topic-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.questions-topic-card:hover {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-bg-secondary, #f9fafb);
}

.questions-topic-card--active {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-primary-light, rgba(59, 130, 246, 0.1));
  box-shadow: 0 0 0 2px var(--mkcg-primary, #3b82f6);
}

.questions-topic-card__number {
  width: 24px;
  height: 24px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--mkcg-text-secondary, #64748b);
  flex-shrink: 0;
}

.questions-topic-card--active .questions-topic-card__number {
  background: var(--mkcg-primary, #3b82f6);
  color: #fff;
}

.questions-topic-card__text {
  font-size: 13px;
  font-weight: 600;
  color: var(--mkcg-text-primary, #0f172a);
  flex: 1;
  line-height: 1.4;
}

.questions-topic-empty {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  border: 1px dashed var(--mkcg-border, #e2e8f0);
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.questions-topic-empty svg {
  flex-shrink: 0;
  color: var(--mkcg-text-secondary, #64748b);
}

.questions-topic-empty p {
  margin: 0;
  font-size: 14px;
  color: var(--mkcg-text-secondary, #64748b);
  line-height: 1.5;
}

/* Refine Topic Textarea */
.questions-refine-container {
  position: relative;
  margin-top: 1rem;
}

.questions-refine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.questions-refine-hint {
  background: var(--mkcg-primary, #3b82f6);
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.questions-char-count {
  font-size: 0.75rem;
  color: var(--mkcg-text-secondary, #64748b);
}

.questions-refine-textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 10px;
  font-family: inherit;
  font-size: 1rem;
  background: #fff;
  box-sizing: border-box;
  transition: all 0.2s;
  resize: none;
  color: var(--mkcg-text-primary, #0f172a);
}

.questions-refine-textarea:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* ===========================================
   QUESTIONS RESULTS - Sidebar + Main Layout
   =========================================== */
.questions-results {
  padding: 0;
}

.questions-results__layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 32px;
}

@media (min-width: 900px) {
  .questions-results__layout {
    flex-direction: row;
    align-items: flex-start;
  }
  .questions-results__sidebar {
    position: sticky;
    top: 1rem;
    flex: 0 0 280px;
  }
  .questions-results__main {
    flex: 1;
    min-width: 0;
  }
}

/* ===========================================
   INTERVIEW SET SIDEBAR (5 Lockable Slots)
   =========================================== */
.questions-interview-set {
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 12px;
  padding: 1.25rem;
}

.questions-interview-set__header {
  margin-bottom: 1rem;
}

.questions-interview-set__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0 0 4px 0;
}

.questions-interview-set__hint {
  font-size: 11px;
  color: var(--mkcg-text-muted, #94a3b8);
  font-style: italic;
}

.questions-interview-set__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Individual Interview Slot */
.questions-interview-slot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  transition: all 0.15s;
}

.questions-interview-slot--filled {
  border-color: var(--mkcg-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
}

.questions-interview-slot--locked {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.08);
}

.questions-interview-slot__position {
  width: 22px;
  height: 22px;
  background: var(--mkcg-bg-secondary, #f1f5f9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--mkcg-text-secondary, #64748b);
  flex-shrink: 0;
}

.questions-interview-slot--filled .questions-interview-slot__position {
  background: var(--mkcg-primary, #3b82f6);
  color: #fff;
}

.questions-interview-slot--locked .questions-interview-slot__position {
  background: #22c55e;
  color: #fff;
}

.questions-interview-slot__text {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: var(--mkcg-text-primary, #0f172a);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.questions-interview-slot__text--empty {
  color: var(--mkcg-text-muted, #94a3b8);
  font-style: italic;
}

.questions-interview-slot__lock {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 6px;
  cursor: pointer;
  color: var(--mkcg-text-secondary, #64748b);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.questions-interview-slot__lock:hover:not(:disabled) {
  background: var(--mkcg-bg-secondary, #f1f5f9);
  border-color: var(--mkcg-text-secondary, #64748b);
}

.questions-interview-slot__lock:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.questions-interview-slot--locked .questions-interview-slot__lock {
  background: #22c55e;
  border-color: #22c55e;
  color: #fff;
}

.questions-interview-slot--locked .questions-interview-slot__lock:hover {
  background: #16a34a;
  border-color: #16a34a;
}

/* Interview Set Summary */
.questions-interview-set__summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
  font-size: 11px;
}

.questions-interview-set__locked-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #22c55e;
  font-weight: 600;
}

.questions-interview-set__available {
  color: var(--mkcg-text-muted, #94a3b8);
}

/* ===========================================
   MAIN AREA HEADER
   =========================================== */
.questions-results__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 12px;
}

.questions-results__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.questions-results__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--mkcg-text-primary, #0f172a);
}

.questions-results__count {
  background: var(--mkcg-primary, #3b82f6);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}

.questions-results__actions {
  display: flex;
  gap: 8px;
}

/* ===========================================
   SELECTION BANNER
   =========================================== */
.questions-selection-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 13px;
  color: var(--mkcg-text-secondary, #64748b);
}

.questions-selection-banner strong {
  color: var(--mkcg-text-primary, #0f172a);
}

.questions-selection-banner__count {
  font-weight: 600;
  color: var(--mkcg-primary, #3b82f6);
}

/* ===========================================
   QUESTIONS LIST - Checkbox Style Rows
   =========================================== */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.questions-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
}

.questions-row:hover:not(:disabled) {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-bg-secondary, #f8fafc);
}

.questions-row--selected {
  border-color: var(--mkcg-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.08);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.questions-row:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.questions-row__checkbox {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid var(--mkcg-border, #d1d5db);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  transition: all 0.15s;
  background: #fff;
}

.questions-row__checkbox--checked {
  background: var(--mkcg-primary, #3b82f6);
  border-color: var(--mkcg-primary, #3b82f6);
}

.questions-row__checkbox--checked svg {
  color: #fff;
}

.questions-row__number {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--mkcg-text-secondary, #64748b);
  min-width: 24px;
  margin-top: 2px;
}

.questions-row__text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0;
  line-height: 1.5;
}

/* Results Footer */
.questions-results__footer {
  margin-top: 2rem;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
  padding-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.questions-results__save-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Save Success/Error Messages */
.questions-save-success {
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
}

.questions-save-error {
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
.gmkb-ai-questions__list {
  margin: 0;
  padding: 0 0 0 20px;
  list-style: decimal;
}

.gmkb-ai-questions__item {
  padding: 8px 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--gmkb-ai-text, #1f2937);
  border-bottom: 1px solid var(--gmkb-ai-border, #e5e7eb);
}

.gmkb-ai-questions__item:last-child {
  border-bottom: none;
}

.gmkb-ai-questions__summary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--gmkb-ai-border, #e5e7eb);
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
  text-align: center;
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
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
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
  color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
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
  max-width: 400px;
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
  background: var(--mkcg-primary, #3b82f6);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.gfy-form-progress--complete .gfy-form-progress__fill {
  background: #10b981;
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
.gfy-btn--small {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}

/* Copy Button for Individual Questions */
.questions-copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 6px;
  color: var(--mkcg-text-secondary, #64748b);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin-left: auto;
}

.questions-copy-btn:hover {
  border-color: var(--mkcg-primary, #3b82f6);
  color: var(--mkcg-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.08);
}

.questions-copy-btn--copied {
  border-color: #10b981;
  color: #10b981;
  background: #ecfdf5;
}

/* Disabled state for question rows */
.questions-row--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.questions-row--disabled .questions-copy-btn {
  pointer-events: auto;
  opacity: 1;
}

/* Loading Skeleton Styles */
.questions-skeleton {
  padding: 1.5rem;
  background: var(--mkcg-bg, #ffffff);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 12px;
}

.questions-skeleton__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.questions-skeleton__title {
  width: 180px;
  height: 24px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

.questions-skeleton__badge {
  width: 100px;
  height: 20px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

.questions-skeleton__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.questions-skeleton__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border-radius: 8px;
}

.questions-skeleton__number {
  width: 24px;
  height: 24px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
  flex-shrink: 0;
}

.questions-skeleton__text {
  flex: 1;
  height: 16px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
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
  .questions-results__layout {
    padding: 20px;
  }

  /* Results header stacks on mobile */
  .questions-results__header {
    flex-direction: column;
    align-items: stretch;
  }

  .questions-results__title-row {
    margin-bottom: 0.5rem;
  }

  .questions-results__title {
    font-size: 1.125rem;
  }

  /* Action buttons wrap */
  .questions-results__actions {
    flex-wrap: wrap;
    width: 100%;
  }

  .questions-results__actions .gfy-btn {
    flex: 1 1 auto;
    min-width: 100px;
    justify-content: center;
  }

  /* Selection banner stacks */
  .questions-selection-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  /* Questions row adjustments */
  .questions-row {
    padding: 12px;
    gap: 10px;
  }

  .questions-row__text {
    font-size: 13px;
  }

  /* Footer stacks on mobile */
  .questions-results__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .questions-results__save-area {
    width: 100%;
  }

  .questions-results__save-area .gfy-btn {
    width: 100%;
    justify-content: center;
  }

  /* Interview set sidebar */
  .questions-interview-set {
    padding: 1rem;
  }

  .questions-interview-set__summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
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
}

/* Extra small screens */
@media (max-width: 480px) {
  .questions-results__layout {
    padding: 16px;
  }

  .questions-results__actions {
    gap: 6px;
  }

  .questions-results__actions .gfy-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .questions-results__actions .questions-action-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .questions-row {
    flex-wrap: wrap;
  }

  .questions-row__checkbox {
    order: -1;
  }

  .questions-copy-btn {
    width: 28px;
    height: 28px;
  }

  .questions-interview-slot {
    padding: 8px 10px;
  }

  .questions-interview-slot__text {
    font-size: 11px;
  }

  .gfy-btn--large {
    padding: 12px 16px;
    font-size: 14px;
  }

  .gfy-welcome-section__tips {
    flex-direction: column;
    gap: 0.5rem;
  }

  .questions-topic-card {
    padding: 12px;
  }

  .questions-topic-card__text {
    font-size: 12px;
  }
}

/* ===========================================
   HISTORY SECTION STYLES
   =========================================== */
.gfy-history {
  margin-bottom: 1.5rem;
}

.gfy-history__toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--mkcg-text-secondary, #64748b);
  transition: all 0.2s ease;
}

.gfy-history__toggle:hover {
  background: var(--mkcg-bg, #ffffff);
  border-color: var(--mkcg-primary, #3b82f6);
  color: var(--mkcg-primary, #3b82f6);
}

.gfy-history__toggle span {
  flex: 1;
  text-align: left;
}

.gfy-history__chevron {
  transition: transform 0.2s ease;
}

.gfy-history__chevron--open {
  transform: rotate(180deg);
}

.gfy-history__panel {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--mkcg-bg, #ffffff);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
}

.gfy-history__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gfy-history__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border-radius: 6px;
  transition: background 0.15s ease;
}

.gfy-history__item:hover {
  background: var(--mkcg-bg-tertiary, #f1f5f9);
}

.gfy-history__item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.gfy-history__item-preview {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--mkcg-text-primary, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gfy-history__item-time {
  font-size: 0.6875rem;
  color: var(--mkcg-text-muted, #94a3b8);
}

.gfy-history__item-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.gfy-history__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--mkcg-bg, #ffffff);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 4px;
  color: var(--mkcg-text-secondary, #64748b);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gfy-history__action-btn:hover {
  border-color: var(--mkcg-text-secondary, #64748b);
  background: var(--mkcg-bg-secondary, #f8fafc);
}

.gfy-history__action-btn--primary {
  background: var(--mkcg-primary, #3b82f6);
  border-color: var(--mkcg-primary, #3b82f6);
  color: #ffffff;
}

.gfy-history__action-btn--primary:hover {
  background: var(--mkcg-primary-dark, #2563eb);
  border-color: var(--mkcg-primary-dark, #2563eb);
}

.gfy-history__action-btn--danger:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

.gfy-history__clear-btn {
  display: block;
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: transparent;
  border: 1px dashed var(--mkcg-border, #e2e8f0);
  border-radius: 6px;
  color: var(--mkcg-text-muted, #94a3b8);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gfy-history__clear-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

/* Mobile responsive for history */
@media (max-width: 480px) {
  .gfy-history__item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .gfy-history__item-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
