<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    </div>
    
    <h3 class="empty-state__title">
      {{ hasPodsData ? 'Ready to Auto-Generate' : 'Start Building Your Media Kit' }}
    </h3>
    
    <p class="empty-state__description">
      {{ hasPodsData 
        ? `Great! We found data for ${availableComponentCount} components. Click auto-generate to add them all.`
        : 'Add components to create your professional media kit.' 
      }}
    </p>
    
    <div class="empty-state__actions">
      <button 
        v-if="hasPodsData"
        class="btn btn--primary"
        @click="$emit('auto-generate')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        Auto-Generate All
      </button>
      
      <button 
        class="btn"
        :class="hasPodsData ? 'btn--secondary' : 'btn--primary'"
        @click="$emit('add-component')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Component
      </button>
      
      <button 
        class="btn btn--outline"
        @click="$emit('add-section')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <line x1="15" y1="3" x2="15" y2="21"></line>
        </svg>
        Add Section
      </button>
    </div>
    
    <div v-if="hasPodsData" class="empty-state__preview">
      <p class="preview-label">Available components:</p>
      <div class="preview-chips">
        <span v-if="podsData.biography || podsData.guest_biography" class="chip">Biography</span>
        <span v-if="podsData.topic_1" class="chip">Topics</span>
        <span v-if="podsData.question_1" class="chip">Interview Questions</span>
        <span v-if="podsData.company" class="chip">Company Info</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  podsData: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['add-component', 'add-section', 'auto-generate']);

const hasPodsData = computed(() => {
  return Object.keys(props.podsData).length > 0;
});

const availableComponentCount = computed(() => {
  let count = 0;
  if (props.podsData.biography || props.podsData.guest_biography) count++;
  if (props.podsData.topic_1) count++;
  if (props.podsData.question_1) count++;
  if (props.podsData.company) count++;
  return count;
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.empty-state__icon {
  margin-bottom: 24px;
  color: #9ca3af;
}

.empty-state__title {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 600;
  color: #111827;
}

.empty-state__description {
  margin: 0 0 32px;
  font-size: 16px;
  line-height: 1.5;
  color: #6b7280;
}

.empty-state__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 24px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn--primary {
  background: #3b82f6;
  color: white;
}

.btn--primary:hover {
  background: #2563eb;
}

.btn--secondary {
  background: #6b7280;
  color: white;
}

.btn--secondary:hover {
  background: #4b5563;
}

.btn--outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn--outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.empty-state__preview {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;
}

.preview-label {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9ca3af;
}

.preview-chips {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.chip {
  padding: 4px 12px;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}
</style>
