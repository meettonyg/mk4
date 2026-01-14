<template>
  <div class="gfy-conversion-offers-widget">
    <!-- Compact Form -->
    <div v-if="!hasOffers" class="gfy-widget-form">
      <!-- Authority Hook Summary -->
      <div class="gfy-widget-section">
        <label class="gfy-widget-label">Your Authority Hook</label>
        <div class="gfy-hook-preview" v-if="hookPreview">
          {{ hookPreview }}
        </div>
        <div class="gfy-hook-inputs">
          <input
            v-model="hookWho"
            type="text"
            class="gfy-widget-input"
            placeholder="WHO you help"
          />
          <input
            v-model="hookWhat"
            type="text"
            class="gfy-widget-input"
            placeholder="WHAT result"
          />
        </div>
      </div>

      <!-- Business Context -->
      <div class="gfy-widget-section">
        <label class="gfy-widget-label">Business Context</label>
        <div class="gfy-widget-row">
          <select v-model="businessType" class="gfy-widget-select">
            <option value="consulting">Consulting</option>
            <option value="coaching">Coaching</option>
            <option value="training">Training</option>
            <option value="service">Service Provider</option>
          </select>
          <select v-model="priceRange" class="gfy-widget-select">
            <option value="budget">Budget</option>
            <option value="midrange">Mid-range</option>
            <option value="premium">Premium</option>
            <option value="high-ticket">High-Ticket</option>
          </select>
        </div>
      </div>

      <!-- Generate Button -->
      <button
        type="button"
        class="gfy-widget-btn"
        :disabled="!canGenerate || isGenerating"
        @click="handleGenerate"
      >
        <span v-if="isGenerating" class="gfy-widget-spinner"></span>
        {{ isGenerating ? 'Generating...' : 'Generate Offer Suite' }}
      </button>
    </div>

    <!-- Compact Results -->
    <div v-else class="gfy-widget-results">
      <!-- Tier Pills -->
      <div class="gfy-tier-pills">
        <button
          v-for="tier in tiers"
          :key="tier.id"
          type="button"
          class="gfy-tier-pill"
          :class="{
            'gfy-tier-pill--active': activeTier === tier.id,
            'gfy-tier-pill--locked': lockedOffers[tier.id]
          }"
          @click="activeTier = tier.id"
        >
          <i v-if="lockedOffers[tier.id]" class="fas fa-lock"></i>
          {{ tier.label }}
        </button>
      </div>

      <!-- Current Offer Preview -->
      <div v-if="currentOffer" class="gfy-offer-preview">
        <h4 class="gfy-offer-preview__title">{{ currentOffer.title }}</h4>
        <p class="gfy-offer-preview__desc">{{ currentOffer.description }}</p>
        <div class="gfy-offer-preview__meta">
          {{ currentOffer.investment || 'Investment TBD' }}
        </div>
        <div class="gfy-offer-preview__actions">
          <button
            type="button"
            class="gfy-widget-btn gfy-widget-btn--small"
            @click="lockCurrentOffer"
          >
            Lock Offer
          </button>
          <button
            type="button"
            class="gfy-widget-btn gfy-widget-btn--outline gfy-widget-btn--small"
            @click="regenerateTier"
          >
            Regenerate
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="gfy-widget-empty">
        <button
          type="button"
          class="gfy-widget-btn"
          @click="generateForTier(activeTier)"
        >
          Generate {{ tierLabels[activeTier] }}
        </button>
      </div>

      <!-- Footer -->
      <div class="gfy-widget-footer">
        <button type="button" class="gfy-widget-link" @click="handleStartOver">
          Start Over
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useAIConversionOffers } from '../../src/composables/useAIConversionOffers';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

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

const props = defineProps({
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['generated', 'saved']);

const {
  isGenerating,
  generate,
  generateForTier: generateTierApi,
  reset
} = useAIConversionOffers();

const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Form state
const hookWho = ref('');
const hookWhat = ref('');
const businessType = ref('consulting');
const priceRange = ref('midrange');

// Results state
const activeTier = ref('core-offer');
const tierOffers = ref({});
const lockedOffers = ref({});
const currentOfferIndex = ref(0);

// Computed
const hookPreview = computed(() => {
  if (!hookWho.value || !hookWhat.value) return '';
  return `I help ${hookWho.value} ${hookWhat.value}.`;
});

const canGenerate = computed(() => {
  return hookWho.value && hookWhat.value;
});

const hasOffers = computed(() => {
  return Object.values(tierOffers.value).some(offers => offers?.length > 0) ||
         Object.keys(lockedOffers.value).length > 0;
});

const currentOffer = computed(() => {
  if (lockedOffers.value[activeTier.value]) {
    return lockedOffers.value[activeTier.value];
  }
  const offers = tierOffers.value[activeTier.value] || [];
  return offers[currentOfferIndex.value] || null;
});

// Methods
function populateFromProfile(profileData) {
  if (!profileData) return;
  if (profileData.hook_who) hookWho.value = profileData.hook_who;
  if (profileData.hook_what) hookWhat.value = profileData.hook_what;
}

async function handleGenerate() {
  await generateForTier('core-offer');
}

async function generateForTier(tier) {
  if (lockedOffers.value[tier]) return;

  activeTier.value = tier;
  currentOfferIndex.value = 0;

  try {
    const result = await generateTierApi({
      tier,
      tierConfig: { label: tierLabels[tier] },
      authorityHook: hookPreview.value,
      businessType: businessType.value,
      priceRange: priceRange.value,
      count: 2
    });

    if (result && Array.isArray(result)) {
      tierOffers.value[tier] = result;
    }

    emit('generated', { tier, offers: result });
  } catch (err) {
    console.error('Generation error:', err);
  }
}

function lockCurrentOffer() {
  if (currentOffer.value) {
    lockedOffers.value[activeTier.value] = { ...currentOffer.value };
    tierOffers.value[activeTier.value] = [];

    // Move to next tier
    const nextTier = tiers.find(t => !lockedOffers.value[t.id] && t.id !== activeTier.value);
    if (nextTier) {
      activeTier.value = nextTier.id;
      if (!tierOffers.value[nextTier.id]?.length) {
        generateForTier(nextTier.id);
      }
    }
  }
}

function regenerateTier() {
  generateForTier(activeTier.value);
}

function handleStartOver() {
  tierOffers.value = {};
  lockedOffers.value = {};
  activeTier.value = 'core-offer';
  currentOfferIndex.value = 0;
  reset();
}

// Watch profile data
watch(
  [() => props.profileData, injectedProfileData],
  ([propsData, injectedData]) => {
    const data = propsData || injectedData;
    if (data) populateFromProfile(data);
  },
  { immediate: true }
);

defineExpose({
  handleGenerate,
  tierOffers,
  lockedOffers,
  hasOffers,
  isGenerating
});
</script>

<style scoped>
.gfy-conversion-offers-widget {
  --gfy-primary-color: #2563eb;
  --gfy-primary-light: #eff6ff;
  --gfy-text-primary: #0f172a;
  --gfy-text-secondary: #64748b;
  --gfy-border-color: #e2e8f0;
  --gfy-radius: 8px;

  font-family: 'Inter', -apple-system, sans-serif;
}

.gfy-widget-form,
.gfy-widget-results {
  padding: 1rem;
}

.gfy-widget-section {
  margin-bottom: 1rem;
}

.gfy-widget-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
  margin-bottom: 0.5rem;
}

.gfy-hook-preview {
  font-size: 0.875rem;
  font-style: italic;
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
  padding: 0.5rem;
  border-radius: var(--gfy-radius);
  margin-bottom: 0.5rem;
}

.gfy-hook-inputs,
.gfy-widget-row {
  display: flex;
  gap: 0.5rem;
}

.gfy-widget-input,
.gfy-widget-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius);
  font-size: 0.875rem;
  font-family: inherit;
}

.gfy-widget-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--gfy-primary-color);
  color: white;
  border: none;
  border-radius: var(--gfy-radius);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
}

.gfy-widget-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gfy-widget-btn--small {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
}

.gfy-widget-btn--outline {
  background: white;
  color: var(--gfy-text-secondary);
  border: 1px solid var(--gfy-border-color);
}

.gfy-tier-pills {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gfy-tier-pill {
  flex: 1;
  padding: 0.5rem;
  background: white;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-family: inherit;
}

.gfy-tier-pill--active {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
}

.gfy-tier-pill--locked {
  background: var(--gfy-primary-light);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
}

.gfy-offer-preview {
  background: #f8fafc;
  border-radius: var(--gfy-radius);
  padding: 1rem;
  margin-bottom: 1rem;
}

.gfy-offer-preview__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.gfy-offer-preview__desc {
  font-size: 0.8rem;
  color: var(--gfy-text-secondary);
  margin: 0 0 0.75rem;
  line-height: 1.5;
}

.gfy-offer-preview__meta {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gfy-primary-color);
  margin-bottom: 0.75rem;
}

.gfy-offer-preview__actions {
  display: flex;
  gap: 0.5rem;
}

.gfy-widget-empty {
  text-align: center;
  padding: 1.5rem;
}

.gfy-widget-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--gfy-border-color);
}

.gfy-widget-link {
  background: none;
  border: none;
  color: var(--gfy-text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
  font-family: inherit;
}

.gfy-widget-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
