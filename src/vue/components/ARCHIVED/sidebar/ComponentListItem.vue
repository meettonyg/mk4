<template>
  <div 
    class="component-item"
    :class="{ 
      'component-item--selected': isSelected,
      'component-item--hovering': isHovering 
    }"
    @click="handleSelect"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div class="component-item__content">
      <div class="component-item__icon">
        <component :is="getComponentIcon(component.type)" />
      </div>
      
      <div class="component-item__info">
        <div class="component-item__type">{{ getComponentLabel(component.type) }}</div>
        <div v-if="component.data?.title" class="component-item__title">
          {{ truncate(component.data.title, 30) }}
        </div>
      </div>
    </div>
    
    <div v-show="isHovering" class="component-item__actions">
      <button 
        class="component-item__action"
        title="Edit"
        @click.stop="$emit('edit', component.id)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      
      <button 
        class="component-item__action"
        title="Duplicate"
        @click.stop="$emit('duplicate', component.id)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      
      <button 
        class="component-item__action component-item__action--danger"
        title="Delete"
        @click.stop="$emit('delete', component.id)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Props
const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['select', 'delete', 'duplicate', 'edit']);

// State
const isHovering = ref(false);

// Methods
const handleSelect = () => {
  emit('select', props.component.id);
};

const truncate = (text, length) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const getComponentLabel = (type) => {
  const labels = {
    'hero': 'Hero Section',
    'biography': 'Biography',
    'topics': 'Topics',
    'contact': 'Contact',
    'testimonials': 'Testimonials',
    'call-to-action': 'Call to Action',
    'social': 'Social Links',
    'questions': 'Q&A',
    'stats': 'Statistics',
    'photo-gallery': 'Photo Gallery',
    'video-intro': 'Video Intro',
    'podcast-player': 'Podcast',
    'booking-calendar': 'Booking',
    'authority-hook': 'Authority Hook',
    'guest-intro': 'Guest Intro',
    'logo-grid': 'Logo Grid'
  };
  return labels[type] || type;
};

const getComponentIcon = (type) => {
  // Return a simple div for now, can be enhanced with actual icons later
  return 'div';
};
</script>

<style scoped>
.component-item {
  background: white;
  border: 1px solid var(--gmkb-color-border, #e0e0e0);
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.component-item:hover {
  border-color: var(--gmkb-color-primary, #4a90e2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.component-item--selected {
  border-color: var(--gmkb-color-primary, #4a90e2);
  background: var(--gmkb-color-primary-light, #f0f7ff);
}

.component-item__content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.component-item__icon {
  width: 32px;
  height: 32px;
  background: var(--gmkb-color-surface, #f5f5f5);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.component-item__info {
  flex: 1;
  min-width: 0;
}

.component-item__type {
  font-size: 13px;
  font-weight: 500;
  color: var(--gmkb-color-text, #333);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.component-item__title {
  font-size: 11px;
  color: var(--gmkb-color-text-light, #666);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.component-item__actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.component-item__action {
  width: 28px;
  height: 28px;
  border: none;
  background: var(--gmkb-color-surface, #f5f5f5);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gmkb-color-text, #333);
}

.component-item__action:hover {
  background: var(--gmkb-color-primary, #4a90e2);
  color: white;
}

.component-item__action--danger:hover {
  background: #dc3545;
  color: white;
}
</style>
