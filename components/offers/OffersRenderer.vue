<template>
  <div class="component-root offers-component">
    <h2 v-if="title" class="offers-title" :style="{ textAlign: titleAlignment }">
      {{ title }}
    </h2>

    <!-- Loading State -->
    <div v-if="isLoading" class="offers-loading">
      <div class="offers-spinner"></div>
      <p>Loading offers...</p>
    </div>

    <!-- Empty State - only show in builder mode -->
    <div v-else-if="displayOffers.length === 0 && showPlaceholder" class="offers-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
      <p>Add your special offers</p>
    </div>

    <!-- Grid Layout -->
    <div
      v-else-if="layout === 'grid'"
      class="offers-grid"
      :class="`grid-${columns}`"
    >
      <div
        v-for="offer in displayOffers"
        :key="offer.id"
        class="offer-card"
        :class="cardStyleClass"
      >
        <div v-if="showImage && offer.image?.url" class="offer-image">
          <img :src="offer.image.sizes?.medium?.url || offer.image.url" :alt="offer.title" />
          <span v-if="offer.type" class="offer-type-badge" :class="`badge-${offer.type}`">
            {{ offer.type }}
          </span>
        </div>

        <div class="offer-content">
          <h3 class="offer-title">{{ offer.title }}</h3>

          <div v-if="showValue && offer.retail_value" class="offer-value">
            ${{ formatValue(offer.retail_value) }} Value
          </div>

          <p v-if="showDescription && offer.description" class="offer-description">
            {{ truncateText(stripHtml(offer.description), 120) }}
          </p>

          <div v-if="showExpiry && offer.expiry_date" class="offer-expiry">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Expires {{ formatDate(offer.expiry_date) }}
          </div>

          <a
            v-if="showCTA && offer.url"
            :href="offer.url"
            class="offer-cta"
            target="_blank"
            rel="noopener"
            @click="trackClick(offer.id)"
          >
            {{ offer.cta_text || 'Get Offer' }}
          </a>
        </div>
      </div>
    </div>

    <!-- List Layout -->
    <div v-else-if="layout === 'list'" class="offers-list">
      <div
        v-for="offer in displayOffers"
        :key="offer.id"
        class="offer-list-item"
        :class="cardStyleClass"
      >
        <div v-if="showImage && offer.image?.url" class="offer-list-image">
          <img :src="offer.image.sizes?.thumbnail?.url || offer.image.url" :alt="offer.title" />
        </div>

        <div class="offer-list-content">
          <div class="offer-list-header">
            <h3 class="offer-title">{{ offer.title }}</h3>
            <span v-if="offer.type" class="offer-type-badge" :class="`badge-${offer.type}`">
              {{ offer.type }}
            </span>
          </div>

          <p v-if="showDescription && offer.description" class="offer-description">
            {{ truncateText(stripHtml(offer.description), 200) }}
          </p>

          <div class="offer-list-footer">
            <span v-if="showValue && offer.retail_value" class="offer-value">
              ${{ formatValue(offer.retail_value) }}
            </span>
            <span v-if="showExpiry && offer.expiry_date" class="offer-expiry">
              Expires {{ formatDate(offer.expiry_date) }}
            </span>
            <a
              v-if="showCTA && offer.url"
              :href="offer.url"
              class="offer-cta"
              target="_blank"
              rel="noopener"
              @click="trackClick(offer.id)"
            >
              {{ offer.cta_text || 'Get Offer' }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Layout (Single) -->
    <div v-else-if="layout === 'featured' && displayOffers[0]" class="offers-featured">
      <div class="offer-featured-card" :class="cardStyleClass">
        <div v-if="showImage && displayOffers[0].image?.url" class="offer-featured-image">
          <img :src="displayOffers[0].image.url" :alt="displayOffers[0].title" />
          <span v-if="displayOffers[0].type" class="offer-type-badge" :class="`badge-${displayOffers[0].type}`">
            {{ displayOffers[0].type }}
          </span>
        </div>

        <div class="offer-featured-content">
          <h3 class="offer-featured-title">{{ displayOffers[0].title }}</h3>

          <div v-if="showValue && displayOffers[0].retail_value" class="offer-featured-value">
            ${{ formatValue(displayOffers[0].retail_value) }} Value
          </div>

          <div v-if="showDescription && displayOffers[0].description" class="offer-featured-description" v-html="displayOffers[0].description"></div>

          <div class="offer-featured-meta">
            <span v-if="showExpiry && displayOffers[0].expiry_date" class="offer-expiry">
              Expires {{ formatDate(displayOffers[0].expiry_date) }}
            </span>
          </div>

          <a
            v-if="showCTA && displayOffers[0].url"
            :href="displayOffers[0].url"
            class="offer-featured-cta"
            target="_blank"
            rel="noopener"
            @click="trackClick(displayOffers[0].id)"
          >
            {{ displayOffers[0].cta_text || 'Claim This Offer' }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';

const props = defineProps({
  componentId: { type: String, required: true },
  data: { type: Object, default: () => ({}) },
  props: { type: Object, default: () => ({}) },
  settings: { type: Object, default: () => ({}) },
  isEditing: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  isBuilderMode: { type: Boolean, default: false }
});

const store = useMediaKitStore();
const isLoading = ref(false);
const fetchedOffers = ref([]);

// Component options
const title = computed(() => props.data?.customTitle || props.props?.customTitle || 'Special Offers');
const titleAlignment = computed(() => props.data?.titleAlignment || props.props?.titleAlignment || 'center');
const layout = computed(() => props.data?.layout || props.props?.layout || 'grid');
const columns = computed(() => props.data?.columns || props.props?.columns || '3');
const filterByType = computed(() => props.data?.filterByType || props.props?.filterByType || 'all');
const maxOffers = computed(() => props.data?.maxOffers || props.props?.maxOffers || 6);
const cardStyle = computed(() => props.data?.cardStyle || props.props?.cardStyle || 'elevated');
const showImage = computed(() => props.data?.showImage !== false && props.props?.showImage !== false);
const showValue = computed(() => props.data?.showValue !== false && props.props?.showValue !== false);
const showDescription = computed(() => props.data?.showDescription !== false && props.props?.showDescription !== false);
const showExpiry = computed(() => props.data?.showExpiry !== false && props.props?.showExpiry !== false);
const showCTA = computed(() => props.data?.showCTA !== false && props.props?.showCTA !== false);

// Selected offer IDs (from component data or profile association)
const selectedOfferIds = computed(() => {
  return props.data?.selectedOfferIds || props.props?.selectedOfferIds || props.data?.offers || [];
});

// Card style class
const cardStyleClass = computed(() => `card-${cardStyle.value}`);

// Show placeholder when in builder mode with no offers
const showPlaceholder = computed(() => {
  return props.isBuilderMode || props.isEditing || props.isSelected;
});

// Display offers (filtered and limited)
const displayOffers = computed(() => {
  let offers = [];

  // Use embedded offers data if available
  if (Array.isArray(props.data?.offersData) && props.data.offersData.length > 0) {
    offers = props.data.offersData;
  } else if (fetchedOffers.value.length > 0) {
    offers = fetchedOffers.value;
  }

  // Filter by type
  if (filterByType.value !== 'all') {
    offers = offers.filter(o => o.type === filterByType.value);
  }

  // Filter out expired (unless in editor)
  if (!props.isEditing) {
    const now = new Date();
    offers = offers.filter(o => !o.expiry_date || new Date(o.expiry_date) > now);
  }

  // Limit
  return offers.slice(0, maxOffers.value);
});

// Fetch offers from API
const fetchOffers = async () => {
  if (!selectedOfferIds.value.length && !props.data?.profileId) return;

  isLoading.value = true;
  try {
    const apiUrl = window.gmkbData?.apiUrl || '/wp-json/';
    let url;

    if (selectedOfferIds.value.length > 0) {
      // Fetch specific offers
      url = `${apiUrl}gmkb/v2/offers?include=${selectedOfferIds.value.join(',')}`;
    } else if (props.data?.profileId) {
      // Fetch profile's associated offers
      url = `${apiUrl}gmkb/v2/profiles/${props.data.profileId}/offers`;
    }

    const response = await fetch(url, {
      headers: { 'X-WP-Nonce': window.gmkbData?.nonce || '' }
    });

    if (response.ok) {
      const data = await response.json();
      fetchedOffers.value = Array.isArray(data) ? data : (data.offers || []);
    }
  } catch (error) {
    console.error('Failed to fetch offers:', error);
  } finally {
    isLoading.value = false;
  }
};

// Track click
const trackClick = async (offerId) => {
  try {
    const apiUrl = window.gmkbData?.apiUrl || '/wp-json/';
    await fetch(`${apiUrl}gmkb/v2/offers/${offerId}/track`, {
      method: 'POST',
      headers: { 'X-WP-Nonce': window.gmkbData?.nonce || '' }
    });
  } catch (e) {
    // Silent fail for tracking
  }
};

// Helpers
const formatValue = (value) => {
  const num = parseFloat(value);
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const stripHtml = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Lifecycle
onMounted(() => {
  if (!props.data?.offersData?.length) {
    fetchOffers();
  }

  document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
    detail: { type: 'offers', id: props.componentId, hasData: displayOffers.value.length > 0 }
  }));
});

// Re-fetch when selection changes
watch(selectedOfferIds, () => {
  if (!props.data?.offersData?.length) {
    fetchOffers();
  }
}, { deep: true });
</script>

<style scoped>
.offers-component {
  width: 100%;
}

.offers-title {
  margin: 0 0 1.5rem 0;
  color: inherit;
}

/* Loading */
.offers-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: inherit;
  opacity: 0.6;
}

.offers-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.offers-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: inherit;
  opacity: 0.5;
}

.offers-empty svg {
  margin-bottom: 1rem;
}

/* Grid Layout */
.offers-grid {
  display: grid;
  gap: 1.5rem;
}

.offers-grid.grid-1 { grid-template-columns: 1fr; }
.offers-grid.grid-2 { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.offers-grid.grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
.offers-grid.grid-4 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

/* Card Styles */
.offer-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--component-border-radius, 12px);
  transition: transform 0.2s, box-shadow 0.2s;
}

.offer-card:hover {
  transform: translateY(-4px);
}

.card-bordered {
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--card-bg, #fff);
}

.card-elevated {
  background: var(--card-bg, #fff);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-elevated:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-flat {
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
}

.card-gradient {
  background: linear-gradient(135deg, var(--card-bg, #fff) 0%, rgba(59, 130, 246, 0.05) 100%);
}

/* Offer Image */
.offer-image {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.offer-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.offer-type-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 9999px;
  color: #fff;
}

.badge-gift { background: #10b981; }
.badge-prize { background: #f59e0b; }
.badge-deal { background: #3b82f6; }

/* Offer Content */
.offer-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.offer-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: inherit;
}

.offer-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color, #3b82f6);
  margin-bottom: 0.75rem;
}

.offer-description {
  margin: 0 0 1rem 0;
  opacity: 0.8;
  font-size: 0.9rem;
  line-height: 1.5;
  flex: 1;
}

.offer-expiry {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.6;
  margin-bottom: 1rem;
}

.offer-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color, #3b82f6);
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
  margin-top: auto;
}

.offer-cta:hover {
  background: var(--primary-color-dark, #2563eb);
}

/* List Layout */
.offers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.offer-list-item {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: var(--component-border-radius, 12px);
}

.offer-list-image {
  flex-shrink: 0;
  width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
}

.offer-list-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.offer-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.offer-list-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.offer-list-footer {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: auto;
}

/* Featured Layout */
.offers-featured {
  max-width: 600px;
  margin: 0 auto;
}

.offer-featured-card {
  overflow: hidden;
  border-radius: var(--component-border-radius, 16px);
}

.offer-featured-image {
  position: relative;
  aspect-ratio: 16/9;
}

.offer-featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.offer-featured-content {
  padding: 2rem;
  text-align: center;
}

.offer-featured-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.5rem;
}

.offer-featured-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color, #3b82f6);
  margin-bottom: 1rem;
}

.offer-featured-description {
  margin-bottom: 1.5rem;
  opacity: 0.8;
  line-height: 1.6;
}

.offer-featured-meta {
  margin-bottom: 1.5rem;
}

.offer-featured-cta {
  display: inline-flex;
  padding: 1rem 2.5rem;
  background: var(--primary-color, #3b82f6);
  color: #fff;
  text-decoration: none;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.offer-featured-cta:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .offers-grid {
    grid-template-columns: 1fr !important;
  }

  .offer-list-item {
    flex-direction: column;
  }

  .offer-list-image {
    width: 100%;
    height: 160px;
  }

  .offer-list-footer {
    flex-wrap: wrap;
  }
}
</style>
