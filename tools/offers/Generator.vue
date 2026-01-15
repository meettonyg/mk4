<template>
  <div class="gfy-offers-generator">
    <!-- Form Section -->
    <div v-if="!hasOffers" class="gfy-offers-form">
      <!-- Step 1: Authority Framework -->
      <div class="gfy-input-group">
        <label class="gfy-label">Step 1: Your Authority Framework</label>
        <div class="gfy-highlight-box">
          <div class="gfy-highlight-box__header">
            <span class="gfy-highlight-box__icon">&#9733;</span>
            <h3 class="gfy-highlight-box__title">The Authority Hook</h3>
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
                placeholder="e.g., My proven 90-day system"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Section Divider -->
      <div class="gfy-section-divider">
        <span>Business Context</span>
      </div>

      <!-- Step 2: Offer Specifications -->
      <div class="gfy-input-group">
        <label class="gfy-label">Step 2: Offer Specifications</label>
        <div class="gfy-builder">
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Business Type</label>
            <select v-model="businessType" class="gfy-builder__select">
              <option value="consulting">Consulting</option>
              <option value="coaching">Coaching</option>
              <option value="training">Training</option>
              <option value="service">Service Provider</option>
              <option value="product">Product Business</option>
            </select>
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Price Range</label>
            <select v-model="priceRange" class="gfy-builder__select">
              <option value="budget">Budget ($100-$500)</option>
              <option value="midrange">Mid-range ($500-$2,000)</option>
              <option value="premium">Premium ($2,000-$10,000)</option>
              <option value="high-ticket">High-Ticket ($10,000+)</option>
            </select>
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Delivery Method</label>
            <select v-model="deliveryMethod" class="gfy-builder__select">
              <option value="online">Online/Virtual</option>
              <option value="in-person">In-Person</option>
              <option value="hybrid">Hybrid</option>
              <option value="self-paced">Self-Paced Course</option>
            </select>
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Variations to Generate</label>
            <input
              v-model.number="variationCount"
              type="number"
              class="gfy-builder__input"
              min="1"
              max="10"
            />
          </div>
          <div class="gfy-builder__field gfy-builder__field--full">
            <label class="gfy-builder__label">Detailed Target Audience CHALLENGES</label>
            <textarea
              v-model="audienceChallenges"
              class="gfy-builder__textarea"
              rows="3"
              placeholder="Describe what they are struggling with right now..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="hasOffers" class="gfy-results">
      <!-- Results Header -->
      <div class="gfy-results__header">
        <div class="gfy-results__title-row">
          <h3 class="gfy-results__title">Your Service Packages</h3>
          <span class="gfy-results__count">{{ offers.length }} packages generated</span>
        </div>
        <div class="gfy-results__actions">
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleCopy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copy All
          </button>
        </div>
      </div>

      <!-- Package Cards -->
      <div class="gfy-packages-grid">
        <div
          v-for="(pkg, index) in offers"
          :key="index"
          class="gfy-package-card"
          :class="[`gfy-package-card--${pkg.tier || PACKAGE_TIERS[index]?.value || 'entry'}`]"
        >
          <div class="gfy-package-card__header">
            <span class="gfy-package-card__tier">
              {{ pkg.tier || PACKAGE_TIERS[index]?.label || 'Package' }}
            </span>
            <h4 class="gfy-package-card__name">{{ pkg.name }}</h4>
          </div>

          <p class="gfy-package-card__description">{{ pkg.description }}</p>

          <div class="gfy-package-card__section">
            <h5 class="gfy-package-card__section-title">Includes:</h5>
            <ul class="gfy-package-card__deliverables">
              <li
                v-for="(deliverable, dIndex) in pkg.deliverables"
                :key="dIndex"
              >
                {{ deliverable }}
              </li>
            </ul>
          </div>

          <div v-if="pkg.idealClient" class="gfy-package-card__ideal">
            <strong>Ideal for:</strong> {{ pkg.idealClient }}
          </div>
        </div>
      </div>

      <!-- Pricing Note -->
      <div class="gfy-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span>Add your own pricing to these packages based on your market positioning.</span>
      </div>

      <!-- Results Footer -->
      <div class="gfy-results__footer">
        <div class="gfy-save-section">
          <button
            type="button"
            class="gfy-btn gfy-btn--primary gfy-btn--large"
            :disabled="!selectedProfileId || isSaving"
            @click="handleSaveToProfile"
          >
            <span v-if="isSaving" class="gfy-spinner"></span>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ isSaving ? 'Saving...' : 'Save to Media Kit' }}
          </button>
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleRegenerate" :disabled="isGenerating">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Regenerate
          </button>
          <button type="button" class="gfy-btn gfy-btn--text" @click="handleStartOver">
            Start Over
          </button>
        </div>
        <!-- Save Success Message -->
        <span v-if="saveSuccess" class="gfy-save-success">
          ✓ Saved successfully!
        </span>
        <!-- Save Error Message -->
        <span v-if="saveError" class="gfy-save-error">
          {{ saveError }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useAIOffers, PACKAGE_TIERS } from '../../src/composables/useAIOffers';
import { useProfileContext } from '../../src/composables/useProfileContext';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

const props = defineProps({
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:can-generate', 'authority-hook-update', 'generated', 'saved']);

// Use composables
const {
  isGenerating,
  error,
  offers,
  hasOffers,
  generate,
  copyToClipboard,
  reset
} = useAIOffers();

const {
  profileId: contextProfileId,
  isSaving,
  saveError,
  saveToProfile
} = useProfileContext();

// Inject profile data from parent (EmbeddedToolWrapper provides this)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Form state - Authority Hook
const hookWho = ref('');
const hookWhat = ref('');
const hookWhen = ref('');
const hookHow = ref('');

// Form state - Business Context
const businessType = ref('consulting');
const priceRange = ref('midrange');
const deliveryMethod = ref('online');
const variationCount = ref(5);
const audienceChallenges = ref('');

// Save state
const selectedProfileId = ref(null);
const saveSuccess = ref(false);

// Computed: resolved profile ID from all available sources
const resolvedProfileId = computed(() => {
  return props.profileData?.id
    || injectedProfileData.value?.id
    || contextProfileId.value
    || null;
});

// Keep selectedProfileId in sync with resolved ID
watch(resolvedProfileId, (newId) => {
  selectedProfileId.value = newId;
}, { immediate: true });

// Generate authority hook summary
const generatedHookSummary = computed(() => {
  if (!hookWho.value && !hookWhat.value) return '';
  let summary = `I help ${hookWho.value || ''} ${hookWhat.value || ''}`;
  if (hookWhen.value) summary += ` ${hookWhen.value}`;
  if (hookHow.value) summary += ` through ${hookHow.value}`;
  return summary.trim() + '.';
});

const canGenerate = computed(() => {
  return (hookWho.value && hookWhat.value) || audienceChallenges.value.trim().length > 10;
});

// Methods
function populateFromProfile(profileData) {
  if (!profileData) return;
  if (profileData.hook_who) hookWho.value = profileData.hook_who;
  if (profileData.hook_what) hookWhat.value = profileData.hook_what;
  if (profileData.hook_when) hookWhen.value = profileData.hook_when;
  if (profileData.hook_how) hookHow.value = profileData.hook_how;
}

const handleGenerate = async () => {
  try {
    await generate({
      services: generatedHookSummary.value,
      authorityHook: generatedHookSummary.value,
      businessType: businessType.value,
      priceRange: priceRange.value,
      deliveryMethod: deliveryMethod.value,
      audienceChallenges: audienceChallenges.value,
      count: variationCount.value
    }, 'public');

    emit('generated', { offers: offers.value });
  } catch (err) {
    console.error('[OffersGenerator] Generation failed:', err);
  }
};

function handleRegenerate() {
  if (isGenerating.value) return;
  handleGenerate();
}

function handleCopy() {
  copyToClipboard();
}

async function handleSaveToProfile() {
  if (!selectedProfileId.value) return;

  try {
    const offersData = {
      offer_free: offers.value[0]?.name || '',
      offer_free_description: offers.value[0]?.description || '',
      offer_1: offers.value[1]?.name || '',
      offer_1_description: offers.value[1]?.description || '',
      offer_2: offers.value[2]?.name || '',
      offer_2_description: offers.value[2]?.description || ''
    };

    const result = await saveToProfile('offers', offersData, {
      profileId: selectedProfileId.value
    });

    if (result.success) {
      saveSuccess.value = true;
      setTimeout(() => { saveSuccess.value = false; }, 3000);
      emit('saved', {
        profileId: selectedProfileId.value,
        offers: offers.value
      });
    }
  } catch (err) {
    console.error('[OffersGenerator] Save failed:', err);
  }
}

function handleStartOver() {
  reset();
}

// Watch for canGenerate changes
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Watch authority hook changes
watch(
  [hookWho, hookWhat, hookWhen, hookHow],
  () => {
    emit('authority-hook-update', {
      who: hookWho.value,
      what: hookWhat.value,
      when: hookWhen.value,
      how: hookHow.value,
      summary: generatedHookSummary.value
    });
  }
);

// Watch profile data from both props and inject
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
  offers,
  hasOffers,
  isGenerating,
  error
});
</script>

<style scoped>
.gfy-offers-generator {
  --gfy-primary-color: #2563eb;
  --gfy-primary-light: #eff6ff;
  --gfy-primary-dark: #1d4ed8;
  --gfy-text-primary: #0f172a;
  --gfy-text-secondary: #64748b;
  --gfy-text-muted: #94a3b8;
  --gfy-bg-color: #f8fafc;
  --gfy-white: #ffffff;
  --gfy-border-color: #e2e8f0;
  --gfy-warning-color: #f59e0b;
  --gfy-success-color: #10b981;
  --gfy-error-color: #ef4444;
  --gfy-radius-md: 6px;
  --gfy-radius-lg: 12px;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* INPUT GROUP */
.gfy-input-group {
  margin-bottom: 2.5rem;
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

/* HIGHLIGHT BOX (Authority Hook) */
.gfy-highlight-box {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-left: 4px solid var(--gfy-primary-color);
  padding: 1.5rem;
  border-radius: var(--gfy-radius-md);
}

.gfy-highlight-box__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gfy-highlight-box__icon {
  color: var(--gfy-warning-color);
  font-size: 1.2rem;
}

.gfy-highlight-box__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--gfy-text-primary);
}

/* SECTION DIVIDER */
.gfy-section-divider {
  height: 1px;
  background: var(--gfy-border-color);
  margin: 2.5rem 0;
  position: relative;
}

.gfy-section-divider span {
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

/* BUILDER GRID */
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
.gfy-builder__select,
.gfy-builder__textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-size: 14px;
  background: var(--gfy-white);
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-builder__textarea {
  resize: vertical;
  min-height: 80px;
}

.gfy-builder__input:focus,
.gfy-builder__select:focus,
.gfy-builder__textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

/* RESULTS SECTION */
.gfy-results {
  width: 100%;
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
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-results__count {
  background: var(--gfy-primary-light);
  color: var(--gfy-primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.gfy-results__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* PACKAGE CARDS */
.gfy-packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.gfy-package-card {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.15s ease;
}

.gfy-package-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.gfy-package-card--entry {
  border-top: 3px solid #94a3b8;
}

.gfy-package-card--signature {
  border-top: 3px solid var(--gfy-primary-color);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.gfy-package-card--premium {
  border-top: 3px solid var(--gfy-warning-color);
}

.gfy-package-card__header {
  margin-bottom: 0.75rem;
}

.gfy-package-card__tier {
  display: inline-block;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.gfy-package-card--entry .gfy-package-card__tier {
  color: #475569;
  background: #f1f5f9;
}

.gfy-package-card--signature .gfy-package-card__tier {
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-package-card--premium .gfy-package-card__tier {
  color: #d97706;
  background: #fef3c7;
}

.gfy-package-card__name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
}

.gfy-package-card__description {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
  line-height: 1.6;
}

.gfy-package-card__section {
  flex: 1;
  margin-bottom: 0.75rem;
}

.gfy-package-card__section-title {
  margin: 0 0 0.5rem 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--gfy-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gfy-package-card__deliverables {
  margin: 0;
  padding: 0 0 0 1.25rem;
  font-size: 0.875rem;
  color: var(--gfy-text-primary);
  line-height: 1.6;
}

.gfy-package-card__deliverables li {
  margin-bottom: 4px;
}

.gfy-package-card__ideal {
  padding-top: 0.75rem;
  border-top: 1px solid var(--gfy-border-color);
  font-size: 0.875rem;
  color: var(--gfy-text-secondary);
}

.gfy-package-card__ideal strong {
  color: var(--gfy-text-primary);
}

/* NOTE BOX */
.gfy-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1rem;
  background: #fef9f3;
  border: 1px solid #fed7aa;
  border-radius: var(--gfy-radius-md);
  font-size: 0.875rem;
  color: #92400e;
  margin-bottom: 1.5rem;
}

.gfy-note svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--gfy-warning-color);
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
  border: none;
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
  border: 1px solid var(--gfy-border-color);
  color: var(--gfy-text-secondary);
}

.gfy-btn--outline:hover:not(:disabled) {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-btn--outline:disabled {
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
  flex-wrap: wrap;
}

.gfy-save-success {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gfy-success-color);
}

.gfy-save-error {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gfy-error-color);
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* RESPONSIVE */
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
  }

  .gfy-packages-grid {
    grid-template-columns: 1fr;
  }

  .gfy-save-section {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
