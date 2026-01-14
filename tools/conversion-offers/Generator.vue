<template>
  <div class="gfy-conversion-offers-generator">
    <!-- Form Section -->
    <div v-if="!hasOffers" class="gfy-conversion-offers-form">
      <!-- Step 1: Authority Hook -->
      <div class="gfy-input-group">
        <label class="gfy-label">Step 1: Your Authority Framework</label>
        <div class="gfy-authority-hook">
          <div class="gfy-authority-hook__header">
            <span class="gfy-authority-hook__icon">&#9733;</span>
            <h3 class="gfy-authority-hook__title">The Authority Hook</h3>
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
            <select v-model="businessType" class="gfy-select">
              <option value="consulting">Consulting</option>
              <option value="coaching">Coaching</option>
              <option value="training">Training</option>
              <option value="service">Service Provider</option>
              <option value="product">Product Business</option>
            </select>
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Price Range</label>
            <select v-model="priceRange" class="gfy-select">
              <option value="budget">Budget ($100-$500)</option>
              <option value="midrange">Mid-range ($500-$2,000)</option>
              <option value="premium">Premium ($2,000-$10,000)</option>
              <option value="high-ticket">High-Ticket ($10,000+)</option>
            </select>
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Delivery Method</label>
            <select v-model="deliveryMethod" class="gfy-select">
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
          <div class="gfy-builder__field gfy-builder__field--full">
            <label class="gfy-builder__label">Target Audience Challenges</label>
            <textarea
              v-model="audienceChallenges"
              class="gfy-textarea"
              rows="3"
              placeholder="Describe what your target audience is struggling with right now..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Generate Button -->
      <button
        type="button"
        class="gfy-btn gfy-btn--generate"
        :disabled="!canGenerate || isGenerating"
        @click="handleGenerate"
      >
        <span v-if="isGenerating" class="gfy-spinner"></span>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        {{ isGenerating ? 'Generating Offers...' : 'Generate Offer Suggestions' }}
      </button>
    </div>

    <!-- Results Section -->
    <div v-if="hasOffers" class="gfy-results">
      <div class="gfy-results-layout">
        <!-- LEFT SIDEBAR: Offer Funnel Tiers -->
        <aside class="gfy-layout-sidebar">
          <div class="gfy-offer-suite">
            <div class="gfy-sidebar-header">
              <h3 class="gfy-sidebar-title">Your Offer Suite</h3>
            </div>

            <!-- Lead Magnet Slot -->
            <button
              type="button"
              class="gfy-offer-slot"
              :class="{
                'gfy-offer-slot--active': activeTier === 'lead-magnet',
                'gfy-offer-slot--locked': lockedOffers['lead-magnet'],
                'gfy-offer-slot--generating': generatingTier === 'lead-magnet'
              }"
              @click="selectTier('lead-magnet')"
            >
              <div class="gfy-offer-slot__header">
                <span class="gfy-offer-slot__label">Lead Magnet</span>
                <i v-if="lockedOffers['lead-magnet']" class="fas fa-lock" style="color: var(--gfy-primary-color);"></i>
                <i v-else-if="generatingTier === 'lead-magnet'" class="fas fa-spinner fa-spin" style="color: var(--gfy-primary-color);"></i>
                <i v-else-if="tierOffers['lead-magnet']?.length" class="fas fa-sparkles" style="color: var(--gfy-primary-color);"></i>
                <i v-else class="fas fa-plus" style="color: var(--gfy-text-muted);"></i>
              </div>
              <div class="gfy-offer-slot__preview">
                <template v-if="lockedOffers['lead-magnet']">
                  {{ lockedOffers['lead-magnet'].title }}
                </template>
                <template v-else-if="generatingTier === 'lead-magnet'">
                  Generating freebies...
                </template>
                <template v-else-if="tierOffers['lead-magnet']?.length">
                  {{ tierOffers['lead-magnet'].length }} variations ready
                </template>
                <template v-else>
                  Click to generate freebies
                </template>
              </div>
            </button>

            <!-- Core Offer Slot -->
            <button
              type="button"
              class="gfy-offer-slot"
              :class="{
                'gfy-offer-slot--active': activeTier === 'core-offer',
                'gfy-offer-slot--locked': lockedOffers['core-offer'],
                'gfy-offer-slot--generating': generatingTier === 'core-offer'
              }"
              @click="selectTier('core-offer')"
            >
              <div class="gfy-offer-slot__header">
                <span class="gfy-offer-slot__label">Core Offer</span>
                <i v-if="lockedOffers['core-offer']" class="fas fa-lock" style="color: var(--gfy-primary-color);"></i>
                <i v-else-if="generatingTier === 'core-offer'" class="fas fa-spinner fa-spin" style="color: var(--gfy-primary-color);"></i>
                <i v-else-if="tierOffers['core-offer']?.length" class="fas fa-sparkles" style="color: var(--gfy-primary-color);"></i>
                <i v-else class="fas fa-plus" style="color: var(--gfy-text-muted);"></i>
              </div>
              <div class="gfy-offer-slot__preview">
                <template v-if="lockedOffers['core-offer']">
                  {{ lockedOffers['core-offer'].title }}
                </template>
                <template v-else-if="generatingTier === 'core-offer'">
                  Generating core services...
                </template>
                <template v-else-if="tierOffers['core-offer']?.length">
                  {{ tierOffers['core-offer'].length }} variations ready
                </template>
                <template v-else>
                  Click to generate core services
                </template>
              </div>
            </button>

            <!-- High-Ticket Slot -->
            <button
              type="button"
              class="gfy-offer-slot"
              :class="{
                'gfy-offer-slot--active': activeTier === 'high-ticket',
                'gfy-offer-slot--locked': lockedOffers['high-ticket'],
                'gfy-offer-slot--generating': generatingTier === 'high-ticket'
              }"
              @click="selectTier('high-ticket')"
            >
              <div class="gfy-offer-slot__header">
                <span class="gfy-offer-slot__label">High-Ticket Upgrade</span>
                <i v-if="lockedOffers['high-ticket']" class="fas fa-lock" style="color: var(--gfy-primary-color);"></i>
                <i v-else-if="generatingTier === 'high-ticket'" class="fas fa-spinner fa-spin" style="color: var(--gfy-primary-color);"></i>
                <i v-else-if="tierOffers['high-ticket']?.length" class="fas fa-sparkles" style="color: var(--gfy-primary-color);"></i>
                <i v-else class="fas fa-plus" style="color: var(--gfy-text-muted);"></i>
              </div>
              <div class="gfy-offer-slot__preview">
                <template v-if="lockedOffers['high-ticket']">
                  {{ lockedOffers['high-ticket'].title }}
                </template>
                <template v-else-if="generatingTier === 'high-ticket'">
                  Generating premium tiers...
                </template>
                <template v-else-if="tierOffers['high-ticket']?.length">
                  {{ tierOffers['high-ticket'].length }} variations ready
                </template>
                <template v-else>
                  Click for premium consulting
                </template>
              </div>
            </button>

            <!-- Funnel Summary -->
            <div class="gfy-offer-suite__summary">
              <span class="gfy-offer-suite__locked-count">
                {{ Object.keys(lockedOffers).length }} of 3 locked
              </span>
            </div>
          </div>
        </aside>

        <!-- RIGHT MAIN: Generated Offers -->
        <main class="gfy-layout-main">
          <!-- Results Header -->
          <div class="gfy-results__header">
            <h3 class="gfy-results__title">
              AI Variations: <span class="gfy-results__tier-label">{{ tierLabels[activeTier] }}</span>
            </h3>
          </div>

          <!-- Refinement Box -->
          <div class="gfy-refinement-box">
            <div class="gfy-refinement-header">
              <i class="fas fa-magic" style="color: var(--gfy-primary-color); font-size: 14px;"></i>
              <span class="gfy-refinement-title">Refine Offers</span>
            </div>
            <div class="gfy-refinement-input-wrapper">
              <textarea
                v-model="refinementPrompt"
                class="gfy-refinement-textarea"
                rows="1"
                placeholder="e.g. Make Option 1 sound more exclusive or focus on the revenue result..."
              ></textarea>
              <button
                type="button"
                class="gfy-btn-refine"
                :disabled="!refinementPrompt || generatingTier"
                @click="handleRefine"
              >
                <i class="fas fa-sync-alt"></i> Refine
              </button>
            </div>
          </div>

          <!-- Offer Cards -->
          <div v-if="currentTierOffers.length" class="gfy-offers-list">
            <div
              v-for="(offer, index) in currentTierOffers"
              :key="index"
              class="gfy-offer-card"
              :class="{ 'gfy-offer-card--selected': selectedOfferIndex === index }"
              @click="selectedOfferIndex = index"
            >
              <h4 class="gfy-offer-card__title">{{ offer.title }}</h4>
              <p class="gfy-offer-card__desc">{{ offer.description }}</p>

              <div class="gfy-offer-meta">
                <div class="gfy-meta-item">
                  <span>Investment</span>
                  <strong>{{ offer.investment || 'TBD' }}</strong>
                </div>
                <div class="gfy-meta-item">
                  <span>Duration</span>
                  <strong>{{ offer.duration || 'Varies' }}</strong>
                </div>
                <div class="gfy-meta-item">
                  <span>Delivery</span>
                  <strong>{{ offer.delivery || deliveryLabels[deliveryMethod] }}</strong>
                </div>
              </div>

              <div class="gfy-offer-card__actions">
                <button
                  type="button"
                  class="gfy-btn gfy-btn--primary"
                  @click.stop="lockOffer(offer)"
                >
                  <i class="fas fa-lock"></i> Lock as {{ tierLabels[activeTier] }}
                </button>
                <button
                  type="button"
                  class="gfy-btn gfy-btn--outline"
                  @click.stop="copyOffer(offer)"
                >
                  <i class="fas fa-copy"></i> Copy
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!generatingTier" class="gfy-empty-state">
            <div class="gfy-empty-state__icon">
              <i class="fas fa-gift"></i>
            </div>
            <p class="gfy-empty-state__text">
              <template v-if="lockedOffers[activeTier]">
                You've locked your {{ tierLabels[activeTier] }}. Click another tier to continue building your funnel.
              </template>
              <template v-else>
                Click "Generate" below to create {{ tierLabels[activeTier] }} variations.
              </template>
            </p>
            <button
              v-if="!lockedOffers[activeTier]"
              type="button"
              class="gfy-btn gfy-btn--primary"
              @click="generateForTier(activeTier)"
            >
              <i class="fas fa-magic"></i> Generate {{ tierLabels[activeTier] }} Ideas
            </button>
          </div>

          <!-- Generating State -->
          <div v-else class="gfy-generating-state">
            <div class="gfy-spinner gfy-spinner--large"></div>
            <p>Generating {{ tierLabels[activeTier] }} variations...</p>
          </div>

          <!-- Footer Actions -->
          <div class="gfy-results__footer">
            <div class="gfy-save-section">
              <button
                type="button"
                class="gfy-btn gfy-btn--primary gfy-btn--large"
                :disabled="Object.keys(lockedOffers).length === 0 || isSaving"
                @click="handleSaveToMediaKit"
              >
                <span v-if="isSaving" class="gfy-spinner"></span>
                <i v-else class="fas fa-save"></i>
                {{ isSaving ? 'Saving...' : 'Save Funnel to Profile' }}
              </button>
              <button type="button" class="gfy-btn gfy-btn--text" @click="handleStartOver">
                Start Over
              </button>
            </div>
            <span v-if="saveSuccess" class="gfy-save-success">
              Saved successfully!
            </span>
            <span v-if="saveError" class="gfy-save-error">
              {{ saveError }}
            </span>
          </div>
        </main>
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
const OFFER_TIERS = {
  'lead-magnet': {
    label: 'Lead Magnet',
    priceHint: 'Free',
    complexity: 'Simple freebie or low-barrier entry'
  },
  'core-offer': {
    label: 'Core Offer',
    priceHint: '$500-$2,500',
    complexity: 'Main service or product offering'
  },
  'high-ticket': {
    label: 'High-Ticket',
    priceHint: '$5,000+',
    complexity: 'Premium consulting or VIP experience'
  }
};

const tierLabels = {
  'lead-magnet': 'Lead Magnet',
  'core-offer': 'Core Offer',
  'high-ticket': 'High-Ticket'
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
  generate,
  generateForTier: generateTier,
  reset
} = useAIConversionOffers();

const {
  profileId: contextProfileId,
  isSaving,
  saveError,
  saveToProfile
} = useProfileContext();

// Inject profile data from parent
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
const saveSuccess = ref(false);
const selectedProfileId = ref(null);

// Computed
const resolvedProfileId = computed(() => {
  return props.profileData?.id
    || injectedProfileData.value?.id
    || contextProfileId.value
    || null;
});

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

const hasOffers = computed(() => {
  return Object.values(tierOffers.value).some(offers => offers.length > 0) ||
         Object.keys(lockedOffers.value).length > 0;
});

const currentTierOffers = computed(() => {
  return tierOffers.value[activeTier.value] || [];
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

  // If tier has no offers and isn't locked, generate
  if (!tierOffers.value[tier]?.length && !lockedOffers.value[tier]) {
    generateForTier(tier);
  }
}

async function handleGenerate() {
  // Generate for the default tier (core-offer)
  await generateForTier('core-offer');
  emit('generated', { offers: tierOffers.value });
}

async function generateForTier(tier) {
  if (generatingTier.value || lockedOffers.value[tier]) return;

  generatingTier.value = tier;
  activeTier.value = tier;

  try {
    const tierConfig = OFFER_TIERS[tier];
    const result = await generateTier({
      tier,
      tierConfig,
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
    console.error('Generation error:', err);
  } finally {
    generatingTier.value = null;
  }
}

async function handleRefine() {
  if (!refinementPrompt.value || generatingTier.value) return;

  generatingTier.value = activeTier.value;

  try {
    const tierConfig = OFFER_TIERS[activeTier.value];
    const result = await generateTier({
      tier: activeTier.value,
      tierConfig,
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
  } catch (err) {
    console.error('Refinement error:', err);
  } finally {
    generatingTier.value = null;
  }
}

function lockOffer(offer) {
  lockedOffers.value[activeTier.value] = { ...offer };
  // Clear variations for this tier since we've locked one
  tierOffers.value[activeTier.value] = [];

  // Auto-advance to next unlocked tier
  const tiers = ['lead-magnet', 'core-offer', 'high-ticket'];
  const nextTier = tiers.find(t => !lockedOffers.value[t] && t !== activeTier.value);
  if (nextTier) {
    selectTier(nextTier);
  }
}

function copyOffer(offer) {
  const text = `${offer.title}\n\n${offer.description}\n\nInvestment: ${offer.investment || 'TBD'}\nDuration: ${offer.duration || 'Varies'}\nDelivery: ${offer.delivery || deliveryLabels[deliveryMethod.value]}`;
  navigator.clipboard.writeText(text);
}

async function handleSaveToMediaKit() {
  if (Object.keys(lockedOffers.value).length === 0) return;

  saveSuccess.value = false;

  try {
    const saveData = {
      offer_free: lockedOffers.value['lead-magnet']?.title || '',
      offer_free_description: lockedOffers.value['lead-magnet']?.description || '',
      offer_1: lockedOffers.value['core-offer']?.title || '',
      offer_1_description: lockedOffers.value['core-offer']?.description || '',
      offer_2: lockedOffers.value['high-ticket']?.title || '',
      offer_2_description: lockedOffers.value['high-ticket']?.description || '',
      hook_who: hookWho.value,
      hook_what: hookWhat.value,
      hook_when: hookWhen.value,
      hook_how: hookHow.value
    };

    await saveToProfile('conversion-offers', saveData, { profileId: selectedProfileId.value });
    saveSuccess.value = true;
    emit('saved', { offers: lockedOffers.value });

    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (err) {
    console.error('Save error:', err);
  }
}

function handleStartOver() {
  tierOffers.value = {
    'lead-magnet': [],
    'core-offer': [],
    'high-ticket': []
  };
  lockedOffers.value = {};
  activeTier.value = 'core-offer';
  selectedOfferIndex.value = null;
  refinementPrompt.value = '';
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
.gfy-conversion-offers-generator {
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
  --gfy-radius-md: 8px;
  --gfy-radius-lg: 12px;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* INPUT STYLES */
.gfy-input-group {
  margin-bottom: 1.5rem;
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

.gfy-textarea,
.gfy-select {
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

.gfy-textarea:focus,
.gfy-select:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-textarea {
  resize: vertical;
  min-height: 80px;
}

/* AUTHORITY HOOK BLOCK */
.gfy-authority-hook {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-left: 4px solid var(--gfy-primary-color);
  padding: 1.5rem;
  border-radius: var(--gfy-radius-md);
}

.gfy-authority-hook__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gfy-authority-hook__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-authority-hook__icon {
  color: var(--gfy-warning-color);
  font-size: 1.2rem;
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
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
  margin-bottom: 0.4rem;
}

.gfy-builder__input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-size: 0.9rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-builder__input:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
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
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--gfy-text-secondary);
  text-transform: uppercase;
}

/* RESULTS LAYOUT */
.gfy-results {
  width: 100%;
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
    flex: 0 0 300px;
  }

  .gfy-layout-main {
    flex: 1;
    min-width: 0;
  }
}

/* OFFER SUITE SIDEBAR */
.gfy-offer-suite {
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

/* OFFER SLOT */
.gfy-offer-slot {
  width: 100%;
  padding: 1rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  margin-bottom: 0.75rem;
  transition: all 0.2s;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.gfy-offer-slot:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-offer-slot--active {
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 2px var(--gfy-primary-color);
}

.gfy-offer-slot--locked {
  background: var(--gfy-primary-light);
  border-color: var(--gfy-primary-color);
}

.gfy-offer-slot__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.gfy-offer-slot__label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
}

.gfy-offer-slot--locked .gfy-offer-slot__label {
  color: var(--gfy-primary-color);
}

.gfy-offer-slot__preview {
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--gfy-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gfy-offer-slot--locked .gfy-offer-slot__preview {
  color: var(--gfy-text-primary);
  font-weight: 500;
}

.gfy-offer-suite__summary {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--gfy-border-color);
  text-align: center;
}

.gfy-offer-suite__locked-count {
  font-size: 0.85rem;
  color: var(--gfy-primary-color);
  font-weight: 600;
}

/* RESULTS HEADER */
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
  color: var(--gfy-text-primary);
}

.gfy-results__tier-label {
  color: var(--gfy-primary-color);
}

/* REFINEMENT BOX */
.gfy-refinement-box {
  background: linear-gradient(to bottom right, var(--gfy-white), var(--gfy-bg-color));
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.gfy-refinement-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.gfy-refinement-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--gfy-primary-color);
  text-transform: uppercase;
}

.gfy-refinement-input-wrapper {
  position: relative;
}

.gfy-refinement-textarea {
  width: 100%;
  padding: 0.875rem 7rem 0.875rem 1rem;
  border: 2px solid var(--gfy-border-color);
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.875rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  resize: none;
}

.gfy-refinement-textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
}

.gfy-btn-refine {
  position: absolute;
  right: 6px;
  top: 6px;
  bottom: 6px;
  padding: 0 1rem;
  background: var(--gfy-primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
}

.gfy-btn-refine:hover:not(:disabled) {
  background: var(--gfy-primary-dark);
}

.gfy-btn-refine:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* OFFER CARDS */
.gfy-offers-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.gfy-offer-card {
  padding: 1.5rem;
  background: var(--gfy-white);
  border: 2px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  position: relative;
  transition: all 0.15s ease;
  cursor: pointer;
}

.gfy-offer-card:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-offer-card--selected {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-offer-card__title {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--gfy-text-primary);
  margin: 0 0 0.625rem;
}

.gfy-offer-card__desc {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--gfy-text-secondary);
  margin: 0 0 1rem;
}

.gfy-offer-meta {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
  padding: 0.75rem 1rem;
  background: var(--gfy-bg-color);
  border-radius: var(--gfy-radius-md);
}

.gfy-meta-item {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--gfy-text-muted);
  text-transform: uppercase;
}

.gfy-meta-item strong {
  color: var(--gfy-text-primary);
  display: block;
  margin-top: 2px;
  font-size: 0.8rem;
  text-transform: none;
}

.gfy-offer-card__actions {
  display: flex;
  gap: 0.625rem;
}

/* EMPTY/GENERATING STATES */
.gfy-empty-state,
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

.gfy-btn--generate {
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
  font-size: 1rem;
  font-weight: 700;
  border-radius: var(--gfy-radius-md);
}

.gfy-btn--generate:hover:not(:disabled) {
  background: var(--gfy-primary-dark);
}

.gfy-btn--generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* RESULTS FOOTER */
.gfy-results__footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gfy-border-color);
}

.gfy-save-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.gfy-save-success {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gfy-success-color);
}

.gfy-save-error {
  font-size: 0.9rem;
  font-weight: 500;
  color: #dc2626;
}

/* SPINNER */
.gfy-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
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

  .gfy-builder__field--full {
    grid-column: span 1;
  }

  .gfy-offer-meta {
    flex-direction: column;
    gap: 0.75rem;
  }

  .gfy-offer-card__actions {
    flex-direction: column;
  }

  .gfy-save-section {
    flex-direction: column;
  }
}
</style>
