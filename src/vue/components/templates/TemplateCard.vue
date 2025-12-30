<template>
  <div
    class="template-card"
    :class="{
      'is-premium': template.is_premium,
      'is-user': template.type === 'user'
    }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Thumbnail -->
    <div class="card-thumbnail">
      <img
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :alt="template.name"
        loading="lazy"
        @error="handleImageError"
      />
      <div v-else class="thumbnail-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="m21 15-5-5L5 21"/>
        </svg>
      </div>

      <!-- Badges -->
      <div class="card-badges">
        <span v-if="template.is_premium" class="badge premium">PRO</span>
        <span v-if="template.is_new" class="badge new">NEW</span>
      </div>

      <!-- Hover Overlay -->
      <Transition name="fade">
        <div v-if="isHovered" class="card-overlay">
          <button class="btn-select" @click.stop="$emit('select', template)">
            Select
          </button>
          <button class="btn-demo" @click.stop="$emit('demo', template)">
            Demo
          </button>
          <button
            v-if="deletable"
            class="btn-delete"
            @click.stop="$emit('delete', template)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
            </svg>
          </button>
        </div>
      </Transition>
    </div>

    <!-- Info -->
    <div class="card-info">
      <h3 class="card-title">{{ template.name }}</h3>
      <p v-if="template.description" class="card-description">
        {{ truncatedDescription }}
      </p>
      <div v-if="displayTags.length > 0" class="card-tags">
        <span v-for="tag in displayTags" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  template: {
    type: Object,
    required: true
  },
  deletable: {
    type: Boolean,
    default: false
  }
});

defineEmits(['select', 'demo', 'delete']);

// State
const isHovered = ref(false);
const imageError = ref(false);

// Computed
const thumbnailUrl = computed(() => {
  if (imageError.value) return null;
  return props.template.thumbnail_image || props.template.preview_image || null;
});

const truncatedDescription = computed(() => {
  const desc = props.template.description || '';
  if (desc.length > 80) {
    return desc.substring(0, 77) + '...';
  }
  return desc;
});

const displayTags = computed(() => {
  const tags = props.template.tags || [];
  return tags.slice(0, 3);
});

// Handlers
const handleImageError = () => {
  imageError.value = true;
};
</script>

<style scoped>
.template-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Thumbnail */
.card-thumbnail {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: #f3f4f6;
}

.card-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
  background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
}

/* Badges */
.card-badges {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.375rem;
}

.badge {
  padding: 0.1875rem 0.5rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.premium {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.badge.new {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

/* Hover Overlay */
.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  backdrop-filter: blur(2px);
}

.btn-select,
.btn-demo {
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 100px;
  border: none;
}

.btn-select {
  background: white;
  color: #1a1a2e;
}

.btn-select:hover {
  background: #f3f4f6;
  transform: scale(1.02);
}

.btn-demo {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-demo:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-delete {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(220, 38, 38, 0.9);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-delete:hover {
  background: #dc2626;
  transform: scale(1.05);
}

/* Card Info */
.card-info {
  padding: 0.875rem 1rem;
}

.card-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem;
  line-height: 1.3;
}

.card-description {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0 0 0.625rem;
  line-height: 1.4;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag {
  padding: 0.125rem 0.5rem;
  background: #f3f4f6;
  border-radius: 9999px;
  font-size: 0.6875rem;
  color: #6b7280;
}

/* User template styling */
.template-card.is-user .card-info {
  border-top: 2px solid #3b82f6;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
