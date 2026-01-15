<template>
  <div class="gfy-conversion-generator">
    <!-- Form Section -->
    <div v-if="!hasOffers" class="gfy-conversion-form">
      <!-- Authority Hook Builder -->
      <div class="gfy-authority-hook">
        <div class="gfy-authority-hook__header">
          <span class="gfy-authority-hook__icon">&#9733;</span>
          <h3 class="gfy-authority-hook__title">Your Authority Hook</h3>
        </div>

        <!-- Builder Grid -->
        <div class="gfy-builder">
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">WHO do you help?</label>
            <input
              v-model="hookWho"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g. SaaS Founders"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">WHAT is the result?</label>
            <input
              v-model="hookWhat"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g. Increase revenue by 40%"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">WHEN do they need it?</label>
            <input
              v-model="hookWhen"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g. When scaling rapidly"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">HOW do you do it?</label>
            <input
              v-model="hookHow"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g. My proven 90-day system"
            />
          </div>
        </div>

        <!-- Live Preview -->
        <div class="gfy-live-preview">
          "{{ hookPreview }}"
        </div>
      </div>

      <!-- Business Context Section -->
      <div class="gfy-business-context">
        <div class="gfy-business-context__header">
          <span class="gfy-business-context__icon">&#128188;</span>
          <h3 class="gfy-business-context__title">Business Context</h3>
        </div>

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
            <label class="gfy-builder__label">Variations per Tier</label>
            <input
              v-model.number="variationCount"
              type="number"
              class="gfy-builder__input"
              min="1"
              max="5"
            />
          </div>
        </div>

        <!-- Audience Challenges -->
        <div class="gfy-input-group">
          <label class="gfy-label">Target Audience Challenges</label>
          <textarea
            v-model="audienceChallenges"
            class="gfy-textarea"
            rows="3"
            placeholder="Describe what your target audience is struggling with right now..."
          ></textarea>
          <span class="gfy-hint">Pain points help generate more compelling offer copy.</span>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="hasOffers" class="gfy-results">
      <!-- Results Header -->
      <div class="gfy-results__header">
        <div class="gfy-results__title-row">
          <h3 class="gfy-results__title">Your Offer Suite</h3>
          <span class="gfy-results__count">{{ lockedCount }} of 3 locked</span>
        </div>
        <div class="gfy-results__actions">
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleCopy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            {{ selectedOfferIndex !== null ? 'Copy Selected' : 'Copy All' }}
          </button>
        </div>
      </div>

      <!-- Tier Tabs -->
      <div class="gfy-tier-tabs">
        <button
          v-for="tier in tiers"
          :key="tier.id"
          type="button"
          class="gfy-tier-tab"
          :class="{
            'gfy-tier-tab--active': activeTier === tier.id,
            'gfy-tier-tab--locked': lockedOffers[tier.id],
            'gfy-tier-tab--generating': generatingTier === tier.id
          }"
          @click="selectTier(tier.id)"
        >
          <span class="gfy-tier-tab__label">{{ tier.label }}</span>
          <span class="gfy-tier-tab__status">
            <i v-if="lockedOffers[tier.id]" class="fas fa-lock"></i>
            <i v-else-if="generatingTier === tier.id" class="fas fa-spinner fa-spin"></i>
            <i v-else-if="tierOffers[tier.id]?.length" class="fas fa-check"></i>
          </span>
        </button>
      </div>

      <!-- Refinement Box -->
      <div v-if="currentTierOffers.length && !lockedOffers[activeTier]" class="gfy-refinement-box">
        <div class="gfy-refinement-box__header">
          <i class="fas fa-magic"></i>
          <span class="gfy-refinement-box__title">Refine Offers</span>
        </div>
        <div class="gfy-refinement-box__input">
          <textarea
            v-model="refinementPrompt"
            class="gfy-refinement-box__textarea"
            rows="1"
            placeholder="e.g. Make Option 1 sound more exclusive or focus on the revenue result..."
          ></textarea>
          <button
            type="button"
            class="gfy-refinement-box__btn"
            :disabled="!refinementPrompt || !!generatingTier"
            @click="handleRefine"
          >
            <i class="fas fa-sync-alt"></i> Refine
          </button>
        </div>
      </div>

      <!-- Selection Banner -->
      <div v-if="currentTierOffers.length" class="gfy-selection-banner">
        <span class="gfy-selection-banner__text">
          Select your preferred {{ tierLabels[activeTier] }} variation
        </span>
        <span class="gfy-selection-banner__count">
          {{ selectedOfferIndex !== null ? '1 selected' : 'None selected' }}
        </span>
      </div>

      <!-- Offer Cards -->
      <div v-if="currentTierOffers.length" class="gfy-offers-list">
        <div
          v-for="(offer, index) in currentTierOffers"
          :key="index"
          class="gfy-offer-card"
          :class="{ 'gfy-offer-card--selected': selectedOfferIndex === index }"
          @click="selectOffer(index)"
        >
          <div class="gfy-offer-card__header">
            <div class="gfy-offer-card__number">{{ index + 1 }}</div>
            <div class="gfy-offer-card__checkbox">
              <svg v-if="selectedOfferIndex === index" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
          </div>
          <div class="gfy-offer-card__content">
            <h4 class="gfy-offer-card__title">{{ offer.title }}</h4>
            <p class="gfy-offer-card__desc">{{ offer.description }}</p>
            <div class="gfy-offer-card__meta">
              <div class="gfy-offer-card__meta-item">
                <span>Investment</span>
                <strong>{{ offer.investment || tierPriceHints[activeTier] }}</strong>
              </div>
              <div class="gfy-offer-card__meta-item">
                <span>Duration</span>
                <strong>{{ offer.duration || 'Varies' }}</strong>
              </div>
              <div class="gfy-offer-card__meta-item">
                <span>Delivery</span>
                <strong>{{ offer.delivery || deliveryLabels[deliveryMethod] }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!generatingTier && !lockedOffers[activeTier]" class="gfy-empty-state">
        <div class="gfy-empty-state__icon">
          <i class="fas fa-gift"></i>
        </div>
        <p class="gfy-empty-state__text">
          Click below to generate {{ tierLabels[activeTier] }} variations.
        </p>
        <button type="button" class="gfy-btn gfy-btn--primary" @click="generateForTier(activeTier)">
          <i class="fas fa-magic"></i> Generate {{ tierLabels[activeTier] }} Ideas
        </button>
      </div>

      <!-- Locked State -->
      <div v-else-if="lockedOffers[activeTier]" class="gfy-locked-offer">
        <div class="gfy-locked-offer__badge">
          <i class="fas fa-lock"></i> Locked
        </div>
        <h4 class="gfy-locked-offer__title">{{ lockedOffers[activeTier].title }}</h4>
        <p class="gfy-locked-offer__desc">{{ lockedOffers[activeTier].description }}</p>
        <button type="button" class="gfy-btn gfy-btn--outline gfy-btn--small" @click="unlockTier(activeTier)">
          <i class="fas fa-unlock"></i> Unlock to Edit
        </button>
      </div>

      <!-- Generating State -->
      <div v-else-if="generatingTier" class="gfy-generating-state">
        <div class="gfy-spinner gfy-spinner--large"></div>
        <p>Generating {{ tierLabels[activeTier] }} variations...</p>
      </div>

      <!-- Save Actions -->
      <div class="gfy-results__footer">
        <!-- Lock Current Offer -->
        <div v-if="!lockedOffers[activeTier] && currentTierOffers.length" class="gfy-lock-section">
          <button
            type="button"
            class="gfy-btn gfy-btn--primary"
            :disabled="selectedOfferIndex === null"
            @click="lockSelectedOffer"
          >
            <i class="fas fa-lock"></i> Lock as {{ tierLabels[activeTier] }}
          </button>
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleRegenerate" :disabled="!!generatingTier">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Regenerate
          </button>
        </div>

        <!-- Authority Hook Save Option -->
        <label v-if="hasHookData" class="gfy-checkbox-option">
          <input
            v-model="saveAuthorityHook"
            type="checkbox"
            class="gfy-checkbox-option__input"
          />
          <span class="gfy-checkbox-option__box">
            <svg v-if="saveAuthorityHook" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </span>
          <span class="gfy-checkbox-option__label">Also save Authority Hook to profile</span>
        </label>

        <div class="gfy-save-section">
          <button
            type="button"
            class="gfy-btn gfy-btn--primary gfy-btn--large"
            :disabled="lockedCount === 0 || isSaving || !selectedProfileId"
            @click="handleSaveToProfile"
          >
            <span v-if="isSaving" class="gfy-spinner"></span>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ isSaving ? 'Saving...' : 'Save Funnel to Media Kit' }}
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
import { useAIConversionOffers } from '../../src/composables/useAIConversionOffers';
import { useProfileContext } from '../../src/composables/useProfileContext';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

// Tier configurations
const tiers = [
  { id: 'lead-magnet', label: 'Lead Magnet' },
  { id: 'core-offer', label: 'Core Offer' },
  { id: 'high-ticket', label: 'High-Ticket' }
];

const tierLabels = {
  'lead-magnet': 'Lead Magnet',
  'core-offer': 'Core Offer',
  'high-ticket': 'High-Ticket'
};

const tierPriceHints = {
  'lead-magnet': 'Free',
  'core-offer': '$500-$2,500',
  'high-ticket': '$5,000+'
};

const deliveryLabels = {
  'online': 'Online/Virtual',
  'in-person': 'In-Person',
  'hybrid': 'Hybrid',
  'self-paced': 'Self-Paced'
};

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
  generateForTier: generateTierApi,
  reset
} = useAIConversionOffers();

const {
  profileId: contextProfileId,
  isSaving,
  saveError,
  saveToProfile
} = useProfileContext();

// Inject profile data from parent (EmbeddedToolWrapper provides this)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Form state
const hookWho = ref('');
const hookWhat = ref('');
const hookWhen = ref('');
const hookHow = ref('');
const businessType = ref('consulting');
const priceRange = ref('midrange');
const deliveryMethod = ref('online');
const variationCount = ref(3);
const audienceChallenges = ref('');

// Results state
const activeTier = ref('core-offer');
const tierOffers = ref({
  'lead-magnet': [],
  'core-offer': [],
  'high-ticket': []
});
const lockedOffers = ref({});
const selectedOfferIndex = ref(null);
const generatingTier = ref(null);
const refinementPrompt = ref('');

// Save state
const selectedProfileId = ref(null);
const saveSuccess = ref(false);
const saveAuthorityHook = ref(true);

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

const hookPreview = computed(() => {
  const who = hookWho.value || '[WHO]';
  const what = hookWhat.value || '[WHAT]';
  const when = hookWhen.value || '[WHEN]';
  const how = hookHow.value || '[HOW]';
  return `I help ${who} ${what} ${when} through ${how}.`;
});

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

const hasHookData = computed(() => {
  return !!(hookWho.value || hookWhat.value || hookWhen.value || hookHow.value);
});

const hasOffers = computed(() => {
  return Object.values(tierOffers.value).some(offers => offers.length > 0) ||
         Object.keys(lockedOffers.value).length > 0;
});

const currentTierOffers = computed(() => {
  return tierOffers.value[activeTier.value] || [];
});

const lockedCount = computed(() => {
  return Object.keys(lockedOffers.value).length;
});

// Methods
function populateFromProfile(profileData) {
  if (!profileData) return;
  if (profileData.hook_who) hookWho.value = profileData.hook_who;
  if (profileData.hook_what) hookWhat.value = profileData.hook_what;
  if (profileData.hook_when) hookWhen.value = profileData.hook_when;
  if (profileData.hook_how) hookHow.value = profileData.hook_how;
}

function selectTier(tier) {
  activeTier.value = tier;
  selectedOfferIndex.value = null;

  // Auto-generate if empty and not locked
  if (!tierOffers.value[tier]?.length && !lockedOffers.value[tier]) {
    generateForTier(tier);
  }
}

function selectOffer(index) {
  if (selectedOfferIndex.value === index) {
    selectedOfferIndex.value = null;
  } else {
    selectedOfferIndex.value = index;
  }
}

const handleGenerate = async () => {
  await generateForTier('core-offer');
  emit('generated', { offers: tierOffers.value });
  return { offers: tierOffers.value };
};

async function generateForTier(tier) {
  if (generatingTier.value || lockedOffers.value[tier]) return;

  generatingTier.value = tier;
  activeTier.value = tier;
  selectedOfferIndex.value = null;

  try {
    const result = await generateTierApi({
      tier,
      tierConfig: { label: tierLabels[tier], priceHint: tierPriceHints[tier] },
      authorityHook: generatedHookSummary.value,
      businessType: businessType.value,
      priceRange: priceRange.value,
      deliveryMethod: deliveryMethod.value,
      audienceChallenges: audienceChallenges.value,
      count: variationCount.value
    });

    if (result && Array.isArray(result)) {
      tierOffers.value[tier] = result;
    }
  } catch (err) {
    console.error('[Conversion Generator] Generation failed:', err);
  } finally {
    generatingTier.value = null;
  }
}

async function handleRefine() {
  if (!refinementPrompt.value || generatingTier.value) return;

  generatingTier.value = activeTier.value;

  try {
    const result = await generateTierApi({
      tier: activeTier.value,
      tierConfig: { label: tierLabels[activeTier.value], priceHint: tierPriceHints[activeTier.value] },
      authorityHook: generatedHookSummary.value,
      businessType: businessType.value,
      priceRange: priceRange.value,
      deliveryMethod: deliveryMethod.value,
      audienceChallenges: audienceChallenges.value,
      count: variationCount.value,
      refinement: refinementPrompt.value,
      previousOffers: currentTierOffers.value
    });

    if (result && Array.isArray(result)) {
      tierOffers.value[activeTier.value] = result;
    }
    refinementPrompt.value = '';
    selectedOfferIndex.value = null;
  } catch (err) {
    console.error('[Conversion Generator] Refinement failed:', err);
  } finally {
    generatingTier.value = null;
  }
}

function handleRegenerate() {
  if (generatingTier.value || lockedOffers.value[activeTier.value]) return;
  generateForTier(activeTier.value);
}

function lockSelectedOffer() {
  if (selectedOfferIndex.value === null) return;
  const offer = currentTierOffers.value[selectedOfferIndex.value];
  lockedOffers.value[activeTier.value] = { ...offer };
  tierOffers.value[activeTier.value] = [];
  selectedOfferIndex.value = null;

  // Auto-advance to next unlocked tier
  const tierIds = ['lead-magnet', 'core-offer', 'high-ticket'];
  const nextTier = tierIds.find(t => !lockedOffers.value[t] && t !== activeTier.value);
  if (nextTier) {
    selectTier(nextTier);
  }
}

function unlockTier(tier) {
  delete lockedOffers.value[tier];
  generateForTier(tier);
}

function handleCopy() {
  let textToCopy;
  if (selectedOfferIndex.value !== null) {
    const offer = currentTierOffers.value[selectedOfferIndex.value];
    textToCopy = `${offer.title}\n\n${offer.description}\n\nInvestment: ${offer.investment || tierPriceHints[activeTier.value]}\nDuration: ${offer.duration || 'Varies'}\nDelivery: ${offer.delivery || deliveryLabels[deliveryMethod.value]}`;
  } else {
    textToCopy = currentTierOffers.value.map((offer, i) =>
      `${i + 1}. ${offer.title}\n${offer.description}`
    ).join('\n\n');
  }

  navigator.clipboard.writeText(textToCopy).catch(err => {
    console.error('[Conversion Generator] Failed to copy:', err);
  });
}

async function handleSaveToProfile() {
  if (lockedCount.value === 0) return;

  try {
    // Save offers
    const offersResult = await saveToProfile('conversion_offers', {
      offer_free: lockedOffers.value['lead-magnet']?.title || '',
      offer_free_description: lockedOffers.value['lead-magnet']?.description || '',
      offer_1: lockedOffers.value['core-offer']?.title || '',
      offer_1_description: lockedOffers.value['core-offer']?.description || '',
      offer_2: lockedOffers.value['high-ticket']?.title || '',
      offer_2_description: lockedOffers.value['high-ticket']?.description || ''
    }, {
      profileId: selectedProfileId.value
    });

    // Save authority hook if checkbox is checked
    let hookResult = { success: true };
    if (saveAuthorityHook.value && hasHookData.value) {
      hookResult = await saveToProfile('authority_hook', {
        who: hookWho.value,
        what: hookWhat.value,
        when: hookWhen.value,
        how: hookHow.value,
        summary: generatedHookSummary.value
      }, {
        profileId: selectedProfileId.value
      });
    }

    if (offersResult.success && hookResult.success) {
      saveSuccess.value = true;
      setTimeout(() => { saveSuccess.value = false; }, 3000);
      emit('saved', {
        profileId: selectedProfileId.value,
        offers: lockedOffers.value,
        hookSaved: saveAuthorityHook.value && hasHookData.value
      });
    }
  } catch (err) {
    console.error('[Conversion Generator] Save failed:', err);
  }
}

function handleStartOver() {
  reset();
  tierOffers.value = {
    'lead-magnet': [],
    'core-offer': [],
    'high-ticket': []
  };
  lockedOffers.value = {};
  activeTier.value = 'core-offer';
  selectedOfferIndex.value = null;
  refinementPrompt.value = '';
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
  tierOffers,
  lockedOffers,
  hasOffers,
  isGenerating,
  error
});
</script>

<style scoped>
.gfy-conversion-generator {
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

/* INPUT STYLES */
.gfy-input-group {
  margin-top: 1.5rem;
}

.gfy-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
  margin-bottom: 0.5rem;
}

.gfy-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-family: inherit;
  font-size: 0.95rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.gfy-textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--gfy-text-muted);
  margin-top: 0.5rem;
  font-style: italic;
}

/* AUTHORITY HOOK & BUSINESS CONTEXT BLOCKS */
.gfy-authority-hook,
.gfy-business-context {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-left: 4px solid var(--gfy-primary-color);
  padding: 1.5rem;
  border-radius: var(--gfy-radius-md);
  margin-bottom: 1.5rem;
}

.gfy-authority-hook__header,
.gfy-business-context__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gfy-authority-hook__title,
.gfy-business-context__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-authority-hook__icon {
  color: var(--gfy-warning-color);
  font-size: 1.2rem;
}

.gfy-business-context__icon {
  font-size: 1.2rem;
}

/* BUILDER GRID */
.gfy-builder {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.gfy-builder__field {
  margin-bottom: 0.5rem;
}

.gfy-builder__label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
  margin-bottom: 0.4rem;
}

.gfy-builder__input,
.gfy-builder__select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: var(--gfy-radius-md);
  font-size: 0.9rem;
  background: #ffffff;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-builder__input:focus,
.gfy-builder__select:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  background: #ffffff;
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

/* LIVE PREVIEW */
.gfy-live-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--gfy-primary-light);
  border-radius: var(--gfy-radius-md);
  border: 1px solid #bfdbfe;
  color: var(--gfy-primary-dark);
  font-size: 0.95rem;
  font-style: italic;
  text-align: center;
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

/* TIER TABS */
.gfy-tier-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.gfy-tier-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gfy-text-secondary);
  transition: all 0.15s ease;
}

.gfy-tier-tab:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-tier-tab--active {
  background: var(--gfy-primary-light);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
}

.gfy-tier-tab--locked {
  background: var(--gfy-primary-light);
  border-color: var(--gfy-primary-color);
}

.gfy-tier-tab__status {
  color: var(--gfy-text-muted);
}

.gfy-tier-tab--locked .gfy-tier-tab__status,
.gfy-tier-tab--active .gfy-tier-tab__status {
  color: var(--gfy-primary-color);
}

/* REFINEMENT BOX */
.gfy-refinement-box {
  background: linear-gradient(to bottom right, var(--gfy-white), var(--gfy-bg-color));
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
}

.gfy-refinement-box__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.gfy-refinement-box__header i {
  color: var(--gfy-primary-color);
  font-size: 0.9rem;
}

.gfy-refinement-box__title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--gfy-primary-color);
}

.gfy-refinement-box__input {
  position: relative;
  display: flex;
  gap: 0.5rem;
}

.gfy-refinement-box__textarea {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-size: 0.875rem;
  font-family: inherit;
  background: var(--gfy-white);
  box-sizing: border-box;
  resize: none;
}

.gfy-refinement-box__textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
}

.gfy-refinement-box__btn {
  padding: 0 1rem;
  background: var(--gfy-primary-color);
  color: white;
  border: none;
  border-radius: var(--gfy-radius-md);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: inherit;
  white-space: nowrap;
}

.gfy-refinement-box__btn:hover:not(:disabled) {
  background: var(--gfy-primary-dark);
}

.gfy-refinement-box__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* SELECTION BANNER */
.gfy-selection-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gfy-primary-light);
  border: 1px solid #bfdbfe;
  border-radius: var(--gfy-radius-md);
  padding: 0.75rem 1rem;
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

/* OFFER CARDS */
.gfy-offers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.gfy-offer-card {
  padding: 1.25rem;
  background: var(--gfy-white);
  border: 2px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gfy-offer-card:hover {
  border-color: var(--gfy-primary-color);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.gfy-offer-card--selected {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-offer-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.gfy-offer-card__number {
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

.gfy-offer-card--selected .gfy-offer-card__number {
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-offer-card__checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gfy-white);
}

.gfy-offer-card--selected .gfy-offer-card__checkbox {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-offer-card__content {
  flex: 1;
}

.gfy-offer-card__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0 0 0.5rem;
}

.gfy-offer-card__desc {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--gfy-text-secondary);
  margin: 0 0 1rem;
}

.gfy-offer-card__meta {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1rem;
  background: var(--gfy-bg-color);
  border-radius: var(--gfy-radius-md);
}

.gfy-offer-card__meta-item {
  font-size: 0.75rem;
  color: var(--gfy-text-muted);
  text-transform: uppercase;
}

.gfy-offer-card__meta-item strong {
  display: block;
  color: var(--gfy-text-primary);
  font-size: 0.85rem;
  text-transform: none;
  margin-top: 2px;
}

/* EMPTY/LOCKED/GENERATING STATES */
.gfy-empty-state,
.gfy-locked-offer,
.gfy-generating-state {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--gfy-bg-color);
  border-radius: var(--gfy-radius-lg);
  margin-bottom: 1.5rem;
}

.gfy-empty-state__icon {
  font-size: 3rem;
  color: var(--gfy-text-muted);
  margin-bottom: 1rem;
}

.gfy-empty-state__text {
  color: var(--gfy-text-secondary);
  margin: 0 0 1.5rem;
}

.gfy-generating-state p {
  color: var(--gfy-text-secondary);
  margin-top: 1rem;
}

.gfy-locked-offer__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--gfy-primary-light);
  color: var(--gfy-primary-color);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 20px;
  margin-bottom: 1rem;
}

.gfy-locked-offer__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0 0 0.5rem;
}

.gfy-locked-offer__desc {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
  margin: 0 0 1rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
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

.gfy-btn--small {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
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

.gfy-lock-section {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
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

.gfy-checkbox-option__label {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
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

.gfy-spinner--large {
  width: 40px;
  height: 40px;
  border-width: 3px;
  border-color: var(--gfy-border-color);
  border-top-color: var(--gfy-primary-color);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .gfy-builder {
    grid-template-columns: 1fr;
  }

  .gfy-tier-tabs {
    flex-wrap: wrap;
  }

  .gfy-results__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .gfy-selection-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .gfy-offer-card__meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .gfy-lock-section,
  .gfy-save-section {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
