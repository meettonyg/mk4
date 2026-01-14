<template>
  <div ref="containerRef" class="gfy-guest-intro-generator">
    <!-- ============================================
         FORM VIEW (When no results yet)
         ============================================ -->
    <div v-if="!showResults" class="gfy-intro-form">
      <!-- STEP 1: Guest & Episode Information -->
      <div class="gfy-input-group">
        <label class="gfy-label">Step 1: Guest & Episode Information</label>
        <div class="gfy-builder">
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Guest Name *</label>
            <input
              v-model="guestName"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g., John Smith"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Guest Title & Company</label>
            <input
              v-model="guestTitle"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g., CEO of Growthly"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Episode/Event Title</label>
            <input
              v-model="episodeTitle"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g., Scaling Sustainably"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Main Discussion Topic *</label>
            <input
              v-model="topic"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g., Plugging revenue leaks"
            />
          </div>
        </div>
      </div>

      <div class="section-divider"><span>Framework Integration</span></div>

      <!-- STEP 2: Authority Hook (Who-What-When-How) -->
      <div class="gfy-input-group">
        <label class="gfy-label">Step 2: Authority Hook</label>
        <div class="gfy-highlight-box gfy-highlight-box--blue">
          <div class="gfy-highlight-box__header">
            <span class="gfy-highlight-box__icon gfy-highlight-box__icon--gold">&#9733;</span>
            <h3 class="gfy-highlight-box__title">Who-What-When-How</h3>
          </div>
          <div class="gfy-builder">
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">WHO do you help?</label>
              <input
                v-model="hookWho"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., SaaS Founders"
              />
            </div>
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">WHAT is the result?</label>
              <input
                v-model="hookWhat"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., Increase revenue by 40%"
              />
            </div>
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">WHEN do they need it?</label>
              <input
                v-model="hookWhen"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., Scaling rapidly"
              />
            </div>
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">HOW do you do it?</label>
              <input
                v-model="hookHow"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., Proven 90-day system"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 3: Impact Intro (Where-Why) -->
      <div class="gfy-input-group">
        <label class="gfy-label">Step 3: Impact Intro</label>
        <div class="gfy-highlight-box gfy-highlight-box--green">
          <div class="gfy-highlight-box__header">
            <span class="gfy-highlight-box__icon gfy-highlight-box__icon--green">&#127919;</span>
            <h3 class="gfy-highlight-box__title">Where & Why</h3>
          </div>
          <div class="gfy-builder">
            <div class="gfy-builder__field gfy-builder__field--full">
              <label class="gfy-builder__label">WHERE is your authority (Credentials)?</label>
              <input
                v-model="credentials"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., Helped 200+ startups achieve 7-figure growth"
              />
            </div>
            <div class="gfy-builder__field gfy-builder__field--full">
              <label class="gfy-builder__label">WHY do you do it (Mission)?</label>
              <input
                v-model="mission"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., Democratize access to elite growth strategies"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="section-divider"><span>Settings</span></div>

      <!-- STEP 4: Settings -->
      <div class="gfy-input-group">
        <div class="gfy-builder">
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Tone of Intro</label>
            <select v-model="tone" class="gfy-select">
              <option v-for="opt in TONE_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Hook Style</label>
            <select v-model="hookStyle" class="gfy-select">
              <option v-for="opt in HOOK_STYLE_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="gfy-builder__field gfy-builder__field--full">
            <label class="gfy-builder__label">Additional Notes or Requests</label>
            <textarea
              v-model="notes"
              class="gfy-textarea"
              placeholder="e.g., Mention that I just released a new book..."
              rows="2"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="gfy-error-box">
        <p>{{ error }}</p>
      </div>
    </div>

    <!-- ============================================
         RESULTS VIEW (Slot-based Dashboard)
         ============================================ -->
    <div v-else class="gfy-intro-results">
      <div class="gfy-results-layout">
        <!-- SIDEBAR: Script Toolkit (Slot Selector) -->
        <aside class="gfy-layout-sidebar">
          <div class="gfy-current-topics">
            <div class="gfy-sidebar-header">
              <h3 class="gfy-sidebar-title">Script Toolkit</h3>
            </div>

            <!-- Slot Buttons -->
            <button
              v-for="(config, slotId) in LENGTH_SLOTS"
              :key="slotId"
              type="button"
              class="gfy-bio-slot"
              :class="{
                'gfy-bio-slot--active': activeSlot === slotId,
                'gfy-bio-slot--locked': slots[slotId].lockedIntro,
                'gfy-bio-slot--generating': slots[slotId].status === 'generating'
              }"
              @click="selectSlot(slotId)"
            >
              <div class="gfy-bio-slot__header">
                <span class="gfy-bio-slot__label">{{ config.label }}</span>
                <svg v-if="slots[slotId].lockedIntro" width="14" height="14" viewBox="0 0 24 24" fill="var(--gfy-primary-color)"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                <svg v-else-if="slots[slotId].status === 'generating'" class="gfy-icon--spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gfy-primary-color)" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                <svg v-else-if="slots[slotId].status === 'ready'" width="14" height="14" viewBox="0 0 24 24" fill="var(--gfy-success-color)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gfy-text-muted)" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div class="gfy-bio-slot__preview">{{ slots[slotId].preview }}</div>
            </button>

            <!-- Summary -->
            <div class="gfy-sidebar-summary">
              <span class="gfy-sidebar-locked">
                &#128274; {{ lockedCount }} locked
              </span>
            </div>
          </div>
        </aside>

        <!-- MAIN: Variations Display -->
        <main class="gfy-layout-main">
          <!-- Results Header -->
          <div class="gfy-results__header">
            <h3 class="gfy-results__title">
              AI Variations:
              <span style="color: var(--gfy-primary-color)">{{ activeSlotConfig.label }}</span>
            </h3>
            <div class="gfy-results__actions">
              <button
                type="button"
                class="gfy-btn gfy-btn--outline"
                :disabled="isGenerating"
                @click="handleRegenerate"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
                Regenerate
              </button>
            </div>
          </div>

          <!-- Refinement Box -->
          <div class="gfy-refinement-box">
            <div class="gfy-refinement-header">
              <svg class="gfy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span class="gfy-refinement-title">Refine Script</span>
            </div>
            <div class="gfy-refinement-input-wrapper">
              <textarea
                v-model="refinementText"
                class="gfy-refinement-textarea"
                rows="1"
                placeholder="e.g., Make it sound more enthusiastic or mention the SaaS background first..."
                :disabled="isRefining"
              ></textarea>
              <button
                type="button"
                class="gfy-btn-refine"
                :disabled="!refinementText.trim() || isRefining || selectedVariationIndex === null"
                @click="handleRefine"
              >
                <svg v-if="isRefining" class="gfy-icon gfy-icon--spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
                {{ isRefining ? 'Refining...' : 'Refine' }}
              </button>
            </div>
            <p v-if="selectedVariationIndex === null" class="gfy-refinement-hint">
              Select a variation below to refine it
            </p>
          </div>

          <!-- Locked Intro Display -->
          <div v-if="currentSlot.lockedIntro" class="gfy-intro-script gfy-intro-script--locked">
            <div class="gfy-script-badge gfy-script-badge--locked">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
              LOCKED INTRO
            </div>
            <p class="gfy-script-text">{{ currentSlot.lockedIntro.text }}</p>
            <div class="gfy-script-actions">
              <button
                type="button"
                class="gfy-btn gfy-btn--outline"
                @click="handleUnlock"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>
                Unlock
              </button>
              <button
                type="button"
                class="gfy-btn gfy-btn--outline"
                @click="handleCopyLocked"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                Copy Script
              </button>
            </div>
          </div>

          <!-- Variations List -->
          <div v-else-if="currentSlot.variations.length > 0" class="gfy-variations-list">
            <div
              v-for="(variation, index) in currentSlot.variations"
              :key="variation.id"
              class="gfy-intro-script"
              :class="{ 'gfy-intro-script--selected': selectedVariationIndex === index }"
              @click="selectVariation(index)"
            >
              <div class="gfy-script-badge">
                VARIATION {{ index + 1 }}: {{ variation.label }}
              </div>
              <p class="gfy-script-text">{{ variation.text }}</p>
              <div class="gfy-script-meta">
                <span>{{ variation.wordCount }} words</span>
              </div>
              <div class="gfy-script-actions">
                <button
                  type="button"
                  class="gfy-btn gfy-btn--primary"
                  @click.stop="handleLock(index)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                  Lock as {{ activeSlotConfig.label.split(' ')[0] }} Intro
                </button>
                <button
                  type="button"
                  class="gfy-btn gfy-btn--outline"
                  @click.stop="handleCopy(index)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  Copy Script
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="currentSlot.status === 'generating'" class="gfy-empty-state">
            <div class="gfy-spinner gfy-spinner--large"></div>
            <p>Generating {{ activeSlotConfig.variationCount }} variations...</p>
          </div>

          <div v-else class="gfy-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gfy-text-muted)" stroke-width="1.5" style="margin-bottom: 16px;">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            <p>No variations generated yet for this length.</p>
            <button
              type="button"
              class="gfy-btn gfy-btn--primary"
              @click="handleGenerateSlot"
            >
              Generate {{ activeSlotConfig.variationCount }} Variations
            </button>
          </div>

          <!-- Footer Actions -->
          <div class="gfy-results__footer">
            <button
              type="button"
              class="gfy-btn gfy-btn--primary gfy-btn--large"
              :disabled="!hasAnyLocked || isSaving"
              @click="handleSaveToProfile"
            >
              <svg v-if="isSaving" class="gfy-icon gfy-icon--spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ isSaving ? 'Saving...' : 'Save All to Profile' }}
            </button>
            <button
              type="button"
              class="gfy-btn gfy-btn--text"
              @click="handleStartOver"
            >
              Start Over
            </button>
          </div>

          <!-- Save Success Message -->
          <div v-if="saveSuccess" class="gfy-save-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--gfy-success-color)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Saved successfully!
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, nextTick } from 'vue';
import { useAIGuestIntro, LENGTH_SLOTS, TONE_OPTIONS, HOOK_STYLE_OPTIONS } from '../../src/composables/useAIGuestIntro';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';
import { useImpactIntro } from '../../src/composables/useImpactIntro';
import { useProfileContext } from '../../src/composables/useProfileContext';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

const props = defineProps({
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:can-generate', 'generated', 'saved', 'applied']);

// Inject profile data from parent
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Use composables
const {
  isGenerating,
  error,
  guestName,
  guestTitle,
  episodeTitle,
  topic,
  tone,
  hookStyle,
  notes,
  activeSlot,
  slots,
  currentSlot,
  hasVariations,
  hasAnyLocked,
  lockedIntros,
  canGenerate,
  activeSlotConfig,
  refinementText,
  isRefining,
  generateForSlot,
  refineVariation,
  regenerate,
  lockVariation,
  unlockSlot,
  copyVariation,
  copyLockedIntro,
  loadFromProfileData,
  getProfileSaveData,
  reset
} = useAIGuestIntro();

// Authority Hook composable (syncs with store)
const {
  who: hookWho,
  what: hookWhat,
  when: hookWhen,
  how: hookHow,
  loadFromProfileData: loadAuthorityHookFromProfile
} = useAuthorityHook();

// Impact Intro composable
const {
  credentials: impactCredentials,
  achievements: impactAchievements,
  credentialsSummary,
  achievementsSummary,
  loadFromProfileData: loadImpactIntroFromProfile
} = useImpactIntro();

// Profile context for saving
const {
  isSaving,
  saveError,
  saveToProfile
} = useProfileContext();

// Local state
const showResults = ref(false);
const saveSuccess = ref(false);
const selectedVariationIndex = ref(null);
const selectedProfileId = ref(null);
const containerRef = ref(null);

// Local form fields for credentials/mission (synced with composable)
const credentials = computed({
  get: () => credentialsSummary.value,
  set: (val) => {
    // Parse comma-separated string into array
    const arr = val ? val.split(',').map(s => s.trim()).filter(s => s) : [];
    impactCredentials.value = arr;
  }
});

const mission = computed({
  get: () => achievementsSummary.value,
  set: (val) => {
    // Parse comma-separated string into array
    const arr = val ? val.split(',').map(s => s.trim()).filter(s => s) : [];
    impactAchievements.value = arr;
  }
});

// Computed: resolved profile ID
const resolvedProfileId = computed(() => {
  return props.profileData?.id
    || injectedProfileData.value?.id
    || null;
});

// Keep profile ID in sync
watch(resolvedProfileId, (newId) => {
  selectedProfileId.value = newId;
}, { immediate: true });

// Computed: locked count
const lockedCount = computed(() => {
  return Object.values(slots).filter(s => s.lockedIntro).length;
});

/**
 * Populate form from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Load guest intro data (name, title, existing intros)
  loadFromProfileData(profileData);

  // Load Authority Hook fields (who/what/when/how)
  loadAuthorityHookFromProfile(profileData);

  // Load Impact Intro fields (credentials/achievements)
  // This syncs to the store and our computed credentials/mission will reflect the values
  loadImpactIntroFromProfile(profileData);
}

/**
 * Select a slot
 */
function selectSlot(slotId) {
  activeSlot.value = slotId;
  selectedVariationIndex.value = null;

  // Auto-generate if slot is empty
  if (slots[slotId].status === 'empty' && canGenerate.value) {
    handleGenerateSlot();
  }
}

/**
 * Select a variation for refinement
 */
function selectVariation(index) {
  selectedVariationIndex.value = selectedVariationIndex.value === index ? null : index;
}

/**
 * Handle initial generate
 */
async function handleGenerate() {
  showResults.value = true;

  // Scroll to top of results after DOM updates
  await nextTick();
  if (containerRef.value) {
    containerRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  await generateForSlot('short');
  emit('generated', { slots });
}

/**
 * Handle generate for current slot
 */
async function handleGenerateSlot() {
  await generateForSlot(activeSlot.value);
}

/**
 * Handle regenerate
 */
async function handleRegenerate() {
  selectedVariationIndex.value = null;
  await regenerate();
}

/**
 * Handle refine
 */
async function handleRefine() {
  if (selectedVariationIndex.value === null) return;
  await refineVariation(selectedVariationIndex.value, refinementText.value);
}

/**
 * Handle lock variation
 */
function handleLock(index) {
  lockVariation(index);
  selectedVariationIndex.value = null;
}

/**
 * Handle unlock
 */
function handleUnlock() {
  unlockSlot();
}

/**
 * Handle copy variation
 */
async function handleCopy(index) {
  await copyVariation(index);
}

/**
 * Handle copy locked intro
 */
async function handleCopyLocked() {
  await copyLockedIntro();
}

/**
 * Handle save to profile
 */
async function handleSaveToProfile() {
  try {
    const saveData = getProfileSaveData();

    await saveToProfile('guest_intro', saveData, {
      profileId: selectedProfileId.value
    });

    saveSuccess.value = true;
    setTimeout(() => { saveSuccess.value = false; }, 3000);

    emit('saved', {
      profileId: selectedProfileId.value,
      intros: saveData
    });
  } catch (err) {
    console.error('[GuestIntroGenerator] Save failed:', err);
  }
}

/**
 * Handle start over - resets results but preserves profile-loaded form data
 */
function handleStartOver() {
  // Reset only the generation results, not the form
  showResults.value = false;
  selectedVariationIndex.value = null;

  // Reset slots to empty state (clears generated variations and locked intros)
  Object.keys(slots).forEach(slotId => {
    slots[slotId].status = 'empty';
    slots[slotId].variations = [];
    slots[slotId].lockedIntro = null;
    slots[slotId].preview = `Click to generate ${slots[slotId].variationCount || 5} variations`;
  });

  // Re-populate form from profile data if available
  const profileData = props.profileData || injectedProfileData.value;
  if (profileData) {
    populateFromProfile(profileData);
  }
}

// Watch canGenerate changes
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Watch profile data
watch(
  [() => props.profileData, injectedProfileData],
  ([propsData, injectedData]) => {
    const data = propsData || injectedData;
    if (data) populateFromProfile(data);
  },
  { immediate: true }
);

// Expose for parent
defineExpose({
  handleGenerate,
  showResults,
  slots,
  hasAnyLocked,
  isGenerating,
  error
});
</script>

<style scoped>
.gfy-guest-intro-generator {
  --gfy-primary-color: #2563eb;
  --gfy-primary-light: #eff6ff;
  --gfy-primary-dark: #1d4ed8;
  --gfy-text-primary: #0f172a;
  --gfy-text-secondary: #64748b;
  --gfy-text-muted: #94a3b8;
  --gfy-bg-color: #f8fafc;
  --gfy-bg-secondary: #f9fafb;
  --gfy-white: #ffffff;
  --gfy-border-color: #e2e8f0;
  --gfy-success-color: #10b981;
  --gfy-warning-color: #f59e0b;
  --gfy-radius-md: 8px;
  --gfy-radius-lg: 12px;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* ============================================
   FORM STYLES
   ============================================ */
.gfy-intro-form {
  padding: 20px 0;
}

.gfy-input-group {
  margin-bottom: 2rem;
}

.gfy-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--gfy-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gfy-builder {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.gfy-builder__field {
  margin-bottom: 0.5rem;
}

.gfy-builder__field--full {
  grid-column: span 2;
}

.gfy-builder__label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
  margin-bottom: 6px;
}

.gfy-builder__input,
.gfy-select,
.gfy-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gfy-border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--gfy-white);
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-builder__input:focus,
.gfy-select:focus,
.gfy-textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-builder__input::placeholder,
.gfy-textarea::placeholder {
  color: var(--gfy-text-muted);
}

.gfy-textarea {
  resize: vertical;
  min-height: 60px;
}

/* Section Divider */
.section-divider {
  height: 1px;
  background: var(--gfy-border-color);
  margin: 2.5rem 0;
  position: relative;
}

.section-divider span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--gfy-white);
  padding: 0 15px;
  font-size: 11px;
  font-weight: 800;
  color: var(--gfy-text-secondary);
  text-transform: uppercase;
}

/* Highlight Boxes */
.gfy-highlight-box {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-left: 4px solid var(--gfy-primary-color);
  padding: 1.5rem;
  border-radius: var(--gfy-radius-md);
}

.gfy-highlight-box--blue {
  border-left-color: var(--gfy-primary-color);
}

.gfy-highlight-box--green {
  border-left-color: var(--gfy-success-color);
}

.gfy-highlight-box__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gfy-highlight-box__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--gfy-text-primary);
}

.gfy-highlight-box__icon {
  font-size: 1.2rem;
}

.gfy-highlight-box__icon--gold {
  color: var(--gfy-warning-color);
}

.gfy-highlight-box__icon--green {
  color: var(--gfy-success-color);
}

/* Error Box */
.gfy-error-box {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--gfy-radius-md);
  text-align: center;
}

.gfy-error-box p {
  color: #991b1b;
  margin: 0 0 1rem 0;
}

/* ============================================
   RESULTS LAYOUT
   ============================================ */
.gfy-intro-results {
  padding: 20px 0;
}

.gfy-results-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

/* Sidebar */
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

/* Bio Slot Buttons */
.gfy-bio-slot {
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gfy-sidebar-summary {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--gfy-border-color);
  font-size: 0.85rem;
}

.gfy-sidebar-locked {
  color: var(--gfy-primary-color);
  font-weight: 600;
}

/* Results Header */
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
  gap: 0.75rem;
}

/* Refinement Box */
.gfy-refinement-box {
  background: linear-gradient(to bottom right, var(--gfy-white), var(--gfy-bg-color));
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 20px;
  margin-bottom: 2rem;
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
}

.gfy-refinement-input-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.gfy-refinement-textarea {
  flex: 1;
  min-height: 44px;
  padding: 12px 16px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  background: var(--gfy-white);
  box-sizing: border-box;
  resize: vertical;
  line-height: 1.5;
}

.gfy-refinement-textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
}

.gfy-btn-refine {
  flex-shrink: 0;
  height: 44px;
  padding: 0 16px;
  background: var(--gfy-primary-color);
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
  white-space: nowrap;
}

.gfy-btn-refine:hover:not(:disabled) {
  background: var(--gfy-primary-dark);
}

.gfy-btn-refine:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gfy-refinement-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--gfy-text-muted);
  font-style: italic;
}

/* Intro Script Box */
.gfy-intro-script {
  padding: 2rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: 10px;
  margin-bottom: 1.5rem;
  line-height: 1.8;
  cursor: pointer;
  transition: all 0.2s;
}

.gfy-intro-script:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-intro-script--selected {
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 2px var(--gfy-primary-light);
}

.gfy-intro-script--locked {
  background: var(--gfy-primary-light);
  border-color: var(--gfy-primary-color);
  cursor: default;
}

.gfy-script-badge {
  font-size: 10px;
  font-weight: 800;
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 12px;
  display: inline-block;
}

.gfy-script-badge--locked {
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-script-text {
  font-size: 16px;
  color: var(--gfy-text-primary);
  font-style: italic;
  margin: 0 0 16px 0;
}

.gfy-script-meta {
  font-size: 12px;
  color: var(--gfy-text-muted);
  margin-bottom: 16px;
}

.gfy-script-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Empty State */
.gfy-empty-state {
  text-align: center;
  padding: 3rem;
  background: var(--gfy-bg-color);
  border-radius: var(--gfy-radius-lg);
  margin-bottom: 1.5rem;
}

.gfy-empty-state p {
  color: var(--gfy-text-secondary);
  margin: 0 0 1rem;
}

/* Buttons */
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
  border: none;
  white-space: nowrap;
}

.gfy-btn--outline {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  color: var(--gfy-text-secondary);
}

.gfy-btn--outline:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
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

.gfy-btn--large {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
}

.gfy-btn--text {
  background: transparent;
  color: var(--gfy-text-secondary);
  padding: 0.6rem 1rem;
}

.gfy-btn--text:hover {
  color: var(--gfy-text-primary);
}

/* Results Footer */
.gfy-results__footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gfy-border-color);
  margin-top: 2rem;
}

.gfy-save-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gfy-success-color);
  margin-top: 1rem;
}

/* Spinner */
.gfy-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

.gfy-spinner--large {
  width: 32px;
  height: 32px;
  border-width: 3px;
  border-color: rgba(37, 99, 235, 0.2);
  border-top-color: var(--gfy-primary-color);
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* SVG Icon spin animation */
.gfy-icon--spin {
  animation: spin 0.8s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .gfy-builder {
    grid-template-columns: 1fr;
  }

  .gfy-builder__field--full {
    grid-column: span 1;
  }

  .gfy-results__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .gfy-script-actions {
    flex-direction: column;
  }

  .gfy-script-actions .gfy-btn {
    width: 100%;
  }
}
</style>
