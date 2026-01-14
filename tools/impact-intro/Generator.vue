<template>
  <div class="gfy-impact-intro-generator">
    <!-- Form Section (shown when no results) -->
    <div v-if="!hasIntros" class="gfy-impact-intro-form">
      <!-- Impact Intro Builder -->
      <div class="gfy-impact-intro">
        <div class="gfy-impact-intro__header">
          <span class="gfy-impact-intro__icon">&#128171;</span>
          <h3 class="gfy-impact-intro__title">Your Impact Intro</h3>
        </div>

        <!-- Credential Manager -->
        <div class="gfy-credential-manager">
          <div class="gfy-credential-manager__header">
            <span class="gfy-credential-manager__icon">&#128081;</span>
            <span class="gfy-credential-manager__title">Credential Manager</span>
            <span class="gfy-credential-manager__subtitle">- Add and Select Your Credentials:</span>
          </div>
          <p class="gfy-credential-manager__description">
            This is where you manage your credentials. Add new ones and check the boxes to include them in your Impact Intro.
          </p>

          <!-- Add Credential Input -->
          <div class="gfy-credential-manager__input-row">
            <input
              v-model="newCredential"
              type="text"
              class="gfy-credential-manager__input"
              placeholder="Enter a credential or achievement..."
              @keydown.enter.prevent="handleAddCredential"
            />
            <button
              type="button"
              class="gfy-btn gfy-btn--primary"
              :disabled="!newCredential.trim()"
              @click="handleAddCredential"
            >
              ADD
            </button>
          </div>

          <!-- Credentials List with Checkboxes -->
          <div v-if="credentials.length > 0" class="gfy-credential-manager__list">
            <div
              v-for="(credential, index) in credentials"
              :key="index"
              class="gfy-credential-tag"
              :class="{ 'gfy-credential-tag--selected': isCredentialSelected(credential) }"
            >
              <label class="gfy-credential-tag__checkbox-wrapper">
                <input
                  type="checkbox"
                  class="gfy-credential-tag__checkbox"
                  :checked="isCredentialSelected(credential)"
                  @change="toggleCredentialSelection(credential)"
                />
                <span class="gfy-credential-tag__checkmark"></span>
              </label>
              <span class="gfy-credential-tag__text">{{ credential }}</span>
              <button
                type="button"
                class="gfy-credential-tag__remove"
                @click="removeCredentialByValue(credential)"
                title="Remove credential"
              >
                &times;
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="gfy-credential-manager__empty">
            <span class="gfy-credential-manager__empty-icon">&#11088;</span>
            <span class="gfy-credential-manager__empty-text">Your credentials will appear here. Add some using the field above!</span>
          </div>

          <!-- Credential Counter -->
          <div class="gfy-credential-manager__counter">
            <span class="gfy-credential-manager__counter-icon">&#128202;</span>
            <span class="gfy-credential-manager__counter-text">
              {{ credentials.length }} credentials added | {{ selectedCredentialsCount }} selected for Impact Intro
            </span>
          </div>
        </div>

        <!-- Examples Section -->
        <div class="gfy-examples">
          <div class="gfy-examples__header">Examples:</div>
          <div class="gfy-examples__chips">
            <button
              v-for="(example, index) in CREDENTIAL_EXAMPLES"
              :key="index"
              type="button"
              class="gfy-example-chip"
              @click="handleAddExample(example.text)"
            >
              <span class="gfy-example-chip__text">{{ example.text }}</span>
              <span class="gfy-example-chip__add">+ Add</span>
            </button>
          </div>
        </div>

        <!-- Builder Grid -->
        <div class="gfy-builder">
          <div class="gfy-builder__field gfy-builder__field--full">
            <label class="gfy-builder__label">WHERE (Your Results & Achievements)</label>
            <textarea
              v-model="introWhere"
              class="gfy-builder__textarea"
              placeholder="e.g., helped 200+ SaaS founders break through the million-dollar ceiling"
              rows="3"
            ></textarea>
            <span class="gfy-builder__hint">What have you accomplished? Start with action verbs.</span>
          </div>
          <div class="gfy-builder__field gfy-builder__field--full">
            <label class="gfy-builder__label">WHY (Your Mission & Purpose)</label>
            <textarea
              v-model="introWhy"
              class="gfy-builder__textarea"
              placeholder="e.g., to make sustainable growth accessible to every ambitious entrepreneur"
              rows="3"
            ></textarea>
            <span class="gfy-builder__hint">What drives you? What change do you want to create?</span>
          </div>
        </div>

        <!-- Live Preview -->
        <div class="gfy-live-preview">
          "{{ introPreview }}"
        </div>
      </div>
    </div>

    <!-- Results Section - 2 Column Layout -->
    <div v-if="hasIntros" class="gfy-results">
      <!-- Layout wrapper for side-by-side on desktop -->
      <div class="gfy-results-layout">
        <!-- LEFT SIDEBAR: Impact Intro Inputs + Preview -->
        <aside class="gfy-layout-sidebar">
          <!-- Impact Intro Builder (Compact) -->
          <div class="gfy-sidebar-intro">
            <div class="gfy-sidebar-intro__header">
              <span class="gfy-sidebar-intro__icon">&#128171;</span>
              <h3 class="gfy-sidebar-intro__title">Your Inputs</h3>
            </div>

            <!-- Compact Builder -->
            <div class="gfy-sidebar-builder">
              <div class="gfy-sidebar-builder__field">
                <label class="gfy-sidebar-builder__label">WHERE</label>
                <textarea
                  v-model="introWhere"
                  class="gfy-sidebar-builder__textarea"
                  placeholder="Your results & achievements"
                  rows="2"
                ></textarea>
              </div>
              <div class="gfy-sidebar-builder__field">
                <label class="gfy-sidebar-builder__label">WHY</label>
                <textarea
                  v-model="introWhy"
                  class="gfy-sidebar-builder__textarea"
                  placeholder="Your mission & purpose"
                  rows="2"
                ></textarea>
              </div>
            </div>

            <!-- Base Intro Preview -->
            <div class="gfy-sidebar-preview">
              <div class="gfy-sidebar-preview__label">Base Intro</div>
              <div class="gfy-sidebar-preview__text">"{{ introPreview }}"</div>
            </div>
          </div>

          <!-- Current Intro from Profile (if logged in) -->
          <div v-if="hasCurrentIntro && selectedProfileId" class="gfy-current-intro">
            <div class="gfy-current-intro__header">
              <h4 class="gfy-current-intro__title">Current Saved Intro</h4>
            </div>
            <div class="gfy-current-intro__content">
              <p class="gfy-current-intro__text">{{ currentIntroText }}</p>
            </div>
          </div>
        </aside>

        <!-- RIGHT MAIN: Generated Intros and Actions -->
        <main class="gfy-layout-main">
          <!-- Results Header -->
          <div class="gfy-results__header">
            <div class="gfy-results__title-row">
              <h3 class="gfy-results__title">Generated Intros</h3>
              <span class="gfy-results__count">{{ intros.length }} Variations</span>
            </div>
            <div class="gfy-results__actions">
              <!-- View Toggle -->
              <div class="gfy-view-toggle">
                <button
                  type="button"
                  class="gfy-view-toggle__btn"
                  :class="{ 'gfy-view-toggle__btn--active': viewMode === 'card' }"
                  @click="viewMode = 'card'"
                  title="Card View"
                >
                  <i class="fas fa-th-large"></i>
                </button>
                <button
                  type="button"
                  class="gfy-view-toggle__btn"
                  :class="{ 'gfy-view-toggle__btn--active': viewMode === 'list' }"
                  @click="viewMode = 'list'"
                  title="List View"
                >
                  <i class="fas fa-list"></i>
                </button>
              </div>
              <button type="button" class="gfy-btn gfy-btn--outline" @click="handleRegenerate">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
                Regenerate
              </button>
              <button type="button" class="gfy-btn gfy-btn--outline" @click="handleCopy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                {{ selectedIntroIndex !== null ? 'Copy Selected' : 'Copy All' }}
              </button>
            </div>
          </div>

          <!-- Selection Banner -->
          <div class="gfy-selection-banner">
            <span class="gfy-selection-banner__text">
              Select your preferred impact intro variation
            </span>
            <span class="gfy-selection-banner__count">
              {{ selectedIntroIndex !== null ? '1 selected' : 'None selected' }}
            </span>
          </div>

          <!-- Intros Grid (Card View) -->
          <div v-if="viewMode === 'card'" class="gfy-intros-grid">
            <div
              v-for="(intro, index) in intros"
              :key="index"
              class="gfy-intro-card"
              :class="{ 'gfy-intro-card--selected': selectedIntroIndex === index }"
              @click="selectIntro(index)"
            >
              <div class="gfy-intro-card__header">
                <div class="gfy-intro-card__number">{{ index + 1 }}</div>
                <div class="gfy-intro-card__checkbox">
                  <svg v-if="selectedIntroIndex === index" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
              </div>
              <div class="gfy-intro-card__content">
                <p class="gfy-intro-card__text">{{ intro.text }}</p>
              </div>
            </div>
          </div>

          <!-- Intros List (List View) -->
          <div v-else class="gfy-intros-list">
            <div
              v-for="(intro, index) in intros"
              :key="index"
              class="gfy-intro-row"
              :class="{ 'gfy-intro-row--selected': selectedIntroIndex === index }"
              @click="selectIntro(index)"
            >
              <div class="gfy-intro-row__checkbox">
                <svg v-if="selectedIntroIndex === index" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <div class="gfy-intro-row__number">{{ index + 1 }}.</div>
              <div class="gfy-intro-row__content">
                <p class="gfy-intro-row__text">{{ intro.text }}</p>
              </div>
            </div>
          </div>

          <!-- Save Actions -->
          <div class="gfy-results__footer">
            <!-- Save Impact Intro Fields Option -->
            <label v-if="hasIntroData" class="gfy-checkbox-option">
              <input
                v-model="saveIntroFields"
                type="checkbox"
                class="gfy-checkbox-option__input"
              />
              <span class="gfy-checkbox-option__box">
                <svg v-if="saveIntroFields" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </span>
              <span class="gfy-checkbox-option__label">Also save WHERE/WHY fields to profile</span>
            </label>

            <div class="gfy-save-section">
              <button
                type="button"
                class="gfy-btn gfy-btn--primary gfy-btn--large"
                :disabled="selectedIntroIndex === null || localIsSaving || !selectedProfileId"
                @click="handleSaveToProfile"
              >
                <svg v-if="!localIsSaving" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span v-if="localIsSaving" class="gfy-spinner"></span>
                {{ localIsSaving ? 'Saving...' : 'Save to Media Kit' }}
              </button>
              <button type="button" class="gfy-btn gfy-btn--text" @click="handleStartOver">
                Start Over
              </button>
            </div>
            <!-- Save Success Message -->
            <span v-if="saveSuccess" class="gfy-save-success">
              Saved successfully!
            </span>
            <!-- Save Error Message -->
            <span v-if="localSaveError" class="gfy-save-error">
              {{ localSaveError }}
            </span>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useAIImpactIntros } from '../../src/composables/useAIImpactIntros';
import { useProfileContext } from '../../src/composables/useProfileContext';
import { useImpactIntro, CREDENTIAL_EXAMPLES } from '../../src/composables/useImpactIntro';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

const props = defineProps({
  /**
   * Mode: 'embedded' for landing page usage
   */
  mode: {
    type: String,
    default: 'embedded',
    validator: (v) => ['standalone', 'integrated', 'embedded'].includes(v)
  },

  /**
   * Profile data for pre-population (embedded mode)
   */
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:can-generate', 'generated', 'saved']);

// Use composables - useAIImpactIntros parses string API response into array of intro objects
const {
  isGenerating,
  error,
  intros,
  hasIntros,
  generate,
  copyToClipboard,
  reset
} = useAIImpactIntros();

// Profile context for saving
const { saveToProfile } = useProfileContext();

// Credential Manager composable
const {
  credentials,
  newCredential,
  selectedCredentialsCount,
  selectedCredentialsText,
  isCredentialSelected,
  addCredential,
  removeCredentialByValue,
  toggleCredentialSelection
} = useImpactIntro();

// Inject profile data from parent (EmbeddedToolWrapper provides this)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Local state
const selectedIntroIndex = ref(null);
const saveSuccess = ref(false);
const selectedProfileId = ref(null);
const viewMode = ref('list'); // 'card' or 'list' - default to list
const localIsSaving = ref(false);
const localSaveError = ref(null);
const saveIntroFields = ref(true); // Whether to also save WHERE/WHY fields

// Impact intro form fields
const introWhere = ref('');
const introWhy = ref('');

// Current intro from profile
const currentIntroText = ref('');

// Computed: resolved profile ID from all available sources
const resolvedProfileId = computed(() => {
  // Priority: props > injected > context service
  return props.profileData?.id
    || injectedProfileData.value?.id
    || null;
});

/**
 * Generate intro preview from current field values
 */
const introPreview = computed(() => {
  const whereVal = introWhere.value?.trim() || '[your results/achievements]';
  const whyVal = introWhy.value?.trim() || '[your mission]';
  return `I've ${whereVal}. My mission is ${whyVal}.`;
});

/**
 * Check if we have minimum required form data
 */
const canGenerate = computed(() => {
  return (introWhere.value && introWhere.value.trim().length > 0) ||
         (introWhy.value && introWhy.value.trim().length > 0);
});

/**
 * Check if user has entered any impact intro data
 */
const hasIntroData = computed(() => {
  return !!(introWhere.value || introWhy.value);
});

/**
 * Check if profile has a current intro
 */
const hasCurrentIntro = computed(() => {
  return !!currentIntroText.value;
});

/**
 * Populate from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Set profile ID for saving
  selectedProfileId.value = profileData.id;

  // Populate WHERE from profile impact_where or similar
  if (profileData.impact_where && !introWhere.value) {
    introWhere.value = profileData.impact_where;
  }

  // Populate WHY from profile impact_why or similar
  if (profileData.impact_why && !introWhy.value) {
    introWhy.value = profileData.impact_why;
  }

  // Set current intro text if available
  if (profileData.impact_intro) {
    currentIntroText.value = profileData.impact_intro;
  }
}

/**
 * Handle generate - exposed for parent to call
 */
const handleGenerate = async () => {
  selectedIntroIndex.value = null;

  try {
    await generate({
      where: introWhere.value,
      why: introWhy.value,
      count: 5
    });

    // Emit generated event for parent (EmbeddedToolApp) to handle
    // Include 'intro' (singular) for previewContent compatibility
    const firstIntro = intros.value?.[0]?.text || '';
    emit('generated', {
      intros: intros.value,
      intro: firstIntro,
      content: firstIntro
    });

    return { intros: intros.value };
  } catch (err) {
    console.error('[Impact Intro Generator] Generation failed:', err);
    throw err;
  }
};

/**
 * Handle regenerate button
 */
const handleRegenerate = async () => {
  if (!canGenerate.value) return;
  await handleGenerate();
};

/**
 * Select an intro variation
 */
const selectIntro = (index) => {
  if (selectedIntroIndex.value === index) {
    selectedIntroIndex.value = null;
  } else {
    selectedIntroIndex.value = index;
  }
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  let textToCopy;
  if (selectedIntroIndex.value !== null) {
    textToCopy = intros.value[selectedIntroIndex.value].text;
  } else {
    textToCopy = intros.value.map((intro, i) => `${i + 1}. ${intro.text}`).join('\n');
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
  } catch (err) {
    console.error('[Impact Intro Generator] Failed to copy:', err);
  }
};

/**
 * Handle save to media kit - saves selected intro and optionally intro fields
 */
const handleSaveToProfile = async () => {
  if (selectedIntroIndex.value === null) return;
  if (!selectedProfileId.value) {
    localSaveError.value = 'Please select a profile first';
    return;
  }

  const selectedIntro = intros.value[selectedIntroIndex.value];
  localIsSaving.value = true;
  localSaveError.value = null;

  try {
    // Build save data - always include statement, conditionally include fields
    const saveData = {
      statement: selectedIntro.text
    };

    // Only include WHERE/WHY fields if checkbox is checked
    if (saveIntroFields.value && hasIntroData.value) {
      saveData.where = introWhere.value;
      saveData.why = introWhy.value;
    }

    const result = await saveToProfile('impact_intro', saveData, {
      profileId: selectedProfileId.value
    });

    if (result.success) {
      saveSuccess.value = true;
      currentIntroText.value = selectedIntro.text;
      setTimeout(() => { saveSuccess.value = false; }, 3000);

      emit('saved', {
        profileId: selectedProfileId.value,
        intro: selectedIntro.text,
        fieldsSaved: saveIntroFields.value && hasIntroData.value,
        fields: saveIntroFields.value ? {
          where: introWhere.value,
          why: introWhy.value
        } : null
      });
    } else {
      localSaveError.value = result.errors?.join(', ') || 'Failed to save';
    }
  } catch (err) {
    console.error('[Impact Intro Generator] Save failed:', err);
    localSaveError.value = err.message || 'Failed to save to profile';
  } finally {
    localIsSaving.value = false;
  }
};

/**
 * Handle start over - reset generated intros and clear selection
 */
const handleStartOver = () => {
  reset();
  selectedIntroIndex.value = null;
};

/**
 * Watch for profile data changes and populate form
 */
watch(
  [() => props.profileData, injectedProfileData],
  ([propsData, injected]) => {
    const data = propsData || injected;
    if (data) {
      populateFromProfile(data);
    }
  },
  { immediate: true }
);

/**
 * Watch for canGenerate changes
 */
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

/**
 * Watch selectedCredentialsText and sync to WHERE field
 * This auto-populates the WHERE field based on checked credentials
 */
watch(selectedCredentialsText, (newText) => {
  if (newText && credentials.value.length > 0) {
    introWhere.value = newText;
  }
}, { immediate: true });

/**
 * Handle adding a credential from input
 */
const handleAddCredential = () => {
  if (newCredential.value.trim()) {
    addCredential(newCredential.value.trim());
  }
};

/**
 * Handle adding an example credential
 */
const handleAddExample = (exampleText) => {
  addCredential(exampleText);
};

/**
 * Exposed for parent component (EmbeddedToolWrapper)
 */
defineExpose({
  handleGenerate,
  intros,
  hasIntros,
  isGenerating,
  error,
  copyToClipboard
});
</script>

<style scoped>
/* CSS Variables (inherit from parent or set defaults) */
.gfy-impact-intro-generator {
  --gfy-primary-color: #2563eb;
  --gfy-primary-light: #dbeafe;
  --gfy-primary-dark: #1d4ed8;
  --gfy-text-primary: #1e293b;
  --gfy-text-secondary: #64748b;
  --gfy-text-muted: #94a3b8;
  --gfy-border-color: #e2e8f0;
  --gfy-bg-color: #f8fafc;
  --gfy-white: #ffffff;
  --gfy-success-color: #10b981;
  --gfy-warning-color: #f59e0b;
  --gfy-error-color: #ef4444;
  --gfy-radius-sm: 4px;
  --gfy-radius-md: 8px;
  --gfy-radius-lg: 12px;
  width: 100%;
}

/* FORM SECTION */
.gfy-impact-intro-form {
  width: 100%;
}

.gfy-impact-intro {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-left: 4px solid var(--gfy-primary-color);
  border-radius: var(--gfy-radius-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.gfy-impact-intro__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.gfy-impact-intro__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-impact-intro__icon {
  font-size: 1.25rem;
}

/* BUILDER - Stacked layout for Impact Intro */
.gfy-builder {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.gfy-builder__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gfy-builder__field--full {
  width: 100%;
}

.gfy-builder__label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gfy-primary-color);
}

.gfy-builder__textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-size: 0.95rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-builder__textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-builder__textarea::placeholder {
  color: var(--gfy-text-muted);
}

.gfy-builder__hint {
  font-size: 0.75rem;
  color: var(--gfy-text-secondary);
  font-style: italic;
}

/* CREDENTIAL MANAGER */
.gfy-credential-manager {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.gfy-credential-manager__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.gfy-credential-manager__icon {
  font-size: 1.1rem;
}

.gfy-credential-manager__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gfy-primary-color);
}

.gfy-credential-manager__subtitle {
  font-size: 0.85rem;
  color: var(--gfy-text-secondary);
}

.gfy-credential-manager__description {
  font-size: 0.85rem;
  color: var(--gfy-text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.gfy-credential-manager__input-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gfy-credential-manager__input {
  flex: 1;
  padding: 0.6rem 0.875rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-size: 0.9rem;
  font-family: inherit;
  background: var(--gfy-white);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-credential-manager__input:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-credential-manager__input::placeholder {
  color: var(--gfy-text-muted);
}

.gfy-credential-manager__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* CREDENTIAL TAG */
.gfy-credential-tag {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.875rem;
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  transition: all 0.15s ease;
}

.gfy-credential-tag--selected {
  background: var(--gfy-primary-light);
  border-color: var(--gfy-primary-color);
}

.gfy-credential-tag__checkbox-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.gfy-credential-tag__checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.gfy-credential-tag__checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  background: var(--gfy-white);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.gfy-credential-tag__checkbox:checked + .gfy-credential-tag__checkmark {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
}

.gfy-credential-tag__checkbox:checked + .gfy-credential-tag__checkmark::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.gfy-credential-tag__checkbox:focus + .gfy-credential-tag__checkmark {
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-credential-tag__text {
  flex: 1;
  font-size: 0.9rem;
  color: var(--gfy-text-primary);
}

.gfy-credential-tag__remove {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--gfy-text-muted);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.15s ease;
}

.gfy-credential-tag__remove:hover {
  color: var(--gfy-error-color);
}

/* CREDENTIAL MANAGER EMPTY STATE */
.gfy-credential-manager__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
  color: var(--gfy-text-muted);
  font-style: italic;
}

.gfy-credential-manager__empty-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.gfy-credential-manager__empty-text {
  font-size: 0.85rem;
}

/* CREDENTIAL COUNTER */
.gfy-credential-manager__counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--gfy-bg-color);
  border-radius: var(--gfy-radius-md);
  border: 1px dashed var(--gfy-border-color);
}

.gfy-credential-manager__counter-icon {
  font-size: 1rem;
}

.gfy-credential-manager__counter-text {
  font-size: 0.85rem;
  color: var(--gfy-primary-color);
  font-weight: 500;
}

/* EXAMPLES SECTION */
.gfy-examples {
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gfy-border-color);
}

.gfy-examples__header {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gfy-text-secondary);
  margin-bottom: 0.75rem;
}

.gfy-examples__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* EXAMPLE CHIP */
.gfy-example-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: 20px;
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gfy-example-chip:hover {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-example-chip__text {
  color: var(--gfy-text-primary);
}

.gfy-example-chip__add {
  color: var(--gfy-primary-color);
  font-weight: 600;
}

/* LIVE PREVIEW */
.gfy-live-preview {
  padding: 1rem 1.25rem;
  background: var(--gfy-primary-light);
  border-radius: var(--gfy-radius-md);
  border: 1px solid #bfdbfe;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--gfy-primary-dark);
  font-style: italic;
  text-align: center;
}

/* RESULTS SECTION */
.gfy-results {
  width: 100%;
}

/* SIDE-BY-SIDE LAYOUT */
.gfy-results-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Desktop: side-by-side */
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

  /* Stack header vertically when sidebar is present */
  .gfy-layout-main .gfy-results__header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* SIDEBAR INTRO BUILDER */
.gfy-sidebar-intro {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-left: 4px solid var(--gfy-primary-color);
  border-radius: var(--gfy-radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
}

.gfy-sidebar-intro__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.gfy-sidebar-intro__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-sidebar-intro__icon {
  font-size: 1rem;
}

/* SIDEBAR BUILDER - Compact stacked layout */
.gfy-sidebar-builder {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.gfy-sidebar-builder__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.gfy-sidebar-builder__label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gfy-primary-color);
}

.gfy-sidebar-builder__textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-size: 0.85rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-sidebar-builder__textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 2px var(--gfy-primary-light);
}

.gfy-sidebar-builder__textarea::placeholder {
  color: var(--gfy-text-muted);
  font-size: 0.8rem;
}

/* SIDEBAR PREVIEW */
.gfy-sidebar-preview {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--gfy-primary-light);
  border-radius: var(--gfy-radius-md);
  border: 1px solid #bfdbfe;
}

.gfy-sidebar-preview__label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gfy-text-secondary);
  margin-bottom: 0.5rem;
}

.gfy-sidebar-preview__text {
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--gfy-primary-dark);
  font-style: italic;
}

/* Sidebar panel styling */
.gfy-layout-sidebar .gfy-current-intro {
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  padding: 1rem;
  margin-bottom: 0;
}

.gfy-layout-sidebar .gfy-current-intro__header {
  margin-bottom: 0.5rem;
}

.gfy-layout-sidebar .gfy-current-intro__title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gfy-text-secondary);
  margin: 0;
}

.gfy-layout-sidebar .gfy-current-intro__content {
  padding: 0.75rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
}

.gfy-layout-sidebar .gfy-current-intro__text {
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--gfy-text-primary);
  font-style: italic;
  margin: 0;
}

.gfy-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gfy-border-color);
  flex-wrap: wrap;
  gap: 1rem;
}

.gfy-results__title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.gfy-results__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-results__count {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gfy-white);
  background: var(--gfy-primary-color);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
}

.gfy-results__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* VIEW TOGGLE */
.gfy-view-toggle {
  display: flex;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  overflow: hidden;
}

.gfy-view-toggle__btn {
  padding: 0.5rem 0.75rem;
  background: var(--gfy-white);
  border: none;
  color: var(--gfy-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gfy-view-toggle__btn:hover {
  background: var(--gfy-bg-color);
}

.gfy-view-toggle__btn--active {
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
}

/* SELECTION BANNER */
.gfy-selection-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  margin-bottom: 1rem;
}

.gfy-selection-banner__text {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
}

.gfy-selection-banner__count {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gfy-primary-color);
}

/* INTROS GRID - Card View */
.gfy-intros-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Single column on mobile */
@media (max-width: 768px) {
  .gfy-intros-grid {
    grid-template-columns: 1fr;
  }
}

.gfy-intro-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: var(--gfy-white);
  border: 2px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 120px;
}

.gfy-intro-card:hover {
  border-color: var(--gfy-primary-color);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.gfy-intro-card--selected {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-intro-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.gfy-intro-card__number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: var(--gfy-bg-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--gfy-text-secondary);
}

.gfy-intro-card--selected .gfy-intro-card__number {
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-intro-card__content {
  flex: 1;
}

.gfy-intro-card__text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-intro-card__checkbox {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gfy-white);
}

.gfy-intro-card--selected .gfy-intro-card__checkbox {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

/* INTROS LIST - List View */
.gfy-intros-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.gfy-intro-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--gfy-white);
  border: 2px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gfy-intro-row:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-intro-row--selected {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-intro-row__checkbox {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gfy-white);
  margin-top: 2px;
}

.gfy-intro-row--selected .gfy-intro-row__checkbox {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-intro-row__number {
  flex-shrink: 0;
  font-weight: 600;
  color: var(--gfy-text-secondary);
  min-width: 24px;
}

.gfy-intro-row__content {
  flex: 1;
  min-width: 0;
}

.gfy-intro-row__text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--gfy-text-primary);
  margin: 0;
}

/* BUTTONS */
.gfy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  text-decoration: none;
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
  color: var(--gfy-text-secondary);
  border: 1px solid var(--gfy-border-color);
}

.gfy-btn--outline:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
}

.gfy-btn--large {
  padding: 0.75rem 1.5rem;
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

/* CHECKBOX OPTION */
.gfy-checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.gfy-checkbox-option__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.gfy-checkbox-option__box {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gfy-white);
  transition: all 0.15s ease;
}

.gfy-checkbox-option__input:checked + .gfy-checkbox-option__box {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-checkbox-option__input:focus + .gfy-checkbox-option__box {
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-checkbox-option__label {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
}

/* RESULTS FOOTER */
.gfy-results__footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gfy-border-color);
}

.gfy-save-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.gfy-save-success {
  color: var(--gfy-success-color);
  font-size: 0.9rem;
  font-weight: 500;
}

.gfy-save-error {
  color: var(--gfy-error-color);
  font-size: 0.9rem;
}

/* SPINNER */
.gfy-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .gfy-results__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .gfy-selection-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
