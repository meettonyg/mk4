<template>
  <div
    class="offer-card"
    :class="{
      'offer-card--selected': selected,
      'offer-card--draft': offer.status === 'draft',
      'offer-card--expired': isExpired
    }"
    @click="$emit('click', offer)"
  >
    <!-- Image -->
    <div class="offer-card__image">
      <img
        v-if="offer.image?.url"
        :src="offer.image.sizes?.medium?.url || offer.image.url"
        :alt="offer.title"
      />
      <div v-else class="offer-card__image-placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
      </div>
      <!-- Type Badge -->
      <span v-if="offer.type" class="offer-card__type" :class="`offer-card__type--${offer.type}`">
        {{ typeLabel }}
      </span>
    </div>

    <!-- Content -->
    <div class="offer-card__content">
      <h3 class="offer-card__title">{{ offer.title }}</h3>

      <!-- Value -->
      <div v-if="offer.retail_value" class="offer-card__value">
        <span class="offer-card__value-label">Value:</span>
        <span class="offer-card__value-amount">${{ formatValue(offer.retail_value) }}</span>
      </div>

      <!-- CTA -->
      <div v-if="offer.cta_text" class="offer-card__cta">
        {{ offer.cta_text }}
      </div>

      <!-- Meta -->
      <div class="offer-card__meta">
        <span v-if="offer.format" class="offer-card__format">
          {{ formatLabel }}
        </span>
        <span v-if="offer.expiry_date" class="offer-card__expiry" :class="{ 'offer-card__expiry--soon': expiresSoon }">
          {{ expiryText }}
        </span>
      </div>

      <!-- Stats -->
      <div v-if="showStats" class="offer-card__stats">
        <span class="offer-card__stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          {{ offer.clicks || 0 }} clicks
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="showActions" class="offer-card__actions" @click.stop>
      <button
        type="button"
        class="offer-card__action"
        title="Edit"
        @click="$emit('edit', offer)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button
        type="button"
        class="offer-card__action"
        title="Duplicate"
        @click="$emit('duplicate', offer)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      </button>
      <button
        type="button"
        class="offer-card__action offer-card__action--danger"
        title="Delete"
        @click="$emit('delete', offer)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>

    <!-- Selection Checkbox -->
    <div v-if="selectable" class="offer-card__select" @click.stop>
      <input
        type="checkbox"
        :checked="selected"
        @change="$emit('select', offer, $event.target.checked)"
      />
    </div>

    <!-- Status Badge -->
    <div v-if="offer.status === 'draft'" class="offer-card__status">
      Draft
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  offer: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  selectable: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  showStats: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['click', 'edit', 'duplicate', 'delete', 'select']);

const typeLabels = {
  gift: 'Gift',
  prize: 'Prize',
  deal: 'Deal',
};

const formatLabels = {
  discount: 'Discount',
  trial: 'Trial',
  content: 'Content',
  event: 'Event',
  consultation: 'Consultation',
  addon: 'Add-on',
  delivery: 'Delivery',
};

const typeLabel = computed(() => typeLabels[props.offer.type] || props.offer.type);
const formatLabel = computed(() => formatLabels[props.offer.format] || props.offer.format);

const formatValue = (value) => {
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const isExpired = computed(() => {
  if (!props.offer.expiry_date) return false;
  return new Date(props.offer.expiry_date) < new Date();
});

const expiresSoon = computed(() => {
  if (!props.offer.expiry_date) return false;
  const expiry = new Date(props.offer.expiry_date);
  const now = new Date();
  const daysUntil = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return daysUntil > 0 && daysUntil <= 7;
});

const expiryText = computed(() => {
  if (!props.offer.expiry_date) return '';
  const expiry = new Date(props.offer.expiry_date);
  const now = new Date();

  if (expiry < now) {
    return 'Expired';
  }

  const daysUntil = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  if (daysUntil === 0) return 'Expires today';
  if (daysUntil === 1) return 'Expires tomorrow';
  if (daysUntil <= 7) return `Expires in ${daysUntil} days`;

  return `Expires ${expiry.toLocaleDateString()}`;
});
</script>

<style scoped>
.offer-card {
  position: relative;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.offer-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.offer-card--selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.offer-card--draft {
  opacity: 0.8;
}

.offer-card--expired {
  opacity: 0.6;
}

.offer-card__image {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #f3f4f6;
  overflow: hidden;
}

.offer-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.offer-card__image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.offer-card__type {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 4px;
  color: #fff;
}

.offer-card__type--gift {
  background: #10b981;
}

.offer-card__type--prize {
  background: #8b5cf6;
}

.offer-card__type--deal {
  background: #f59e0b;
}

.offer-card__content {
  padding: 12px;
}

.offer-card__title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.offer-card__value {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.offer-card__value-label {
  font-size: 12px;
  color: #6b7280;
}

.offer-card__value-amount {
  font-size: 16px;
  font-weight: 700;
  color: #059669;
}

.offer-card__cta {
  font-size: 12px;
  color: #3b82f6;
  font-weight: 500;
  margin-bottom: 8px;
}

.offer-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: #6b7280;
}

.offer-card__format {
  padding: 2px 6px;
  background: #f3f4f6;
  border-radius: 4px;
}

.offer-card__expiry {
  color: #6b7280;
}

.offer-card__expiry--soon {
  color: #f59e0b;
  font-weight: 500;
}

.offer-card--expired .offer-card__expiry {
  color: #ef4444;
}

.offer-card__stats {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}

.offer-card__stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.offer-card__actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.offer-card:hover .offer-card__actions {
  opacity: 1;
}

.offer-card__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.offer-card__action:hover {
  background: #fff;
  color: #111827;
  border-color: #d1d5db;
}

.offer-card__action--danger:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.offer-card__select {
  position: absolute;
  top: 8px;
  left: 8px;
}

.offer-card__select input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.offer-card__status {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
}
</style>
