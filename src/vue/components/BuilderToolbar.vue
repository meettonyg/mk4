<template>
  <div class="builder-toolbar">
    <div class="toolbar-left">
      <button @click="$emit('add-section')" class="toolbar-btn toolbar-btn--primary">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Add Section</span>
      </button>
      
      <div class="toolbar-separator"></div>
      
      <button 
        @click="$emit('undo')" 
        :disabled="!canUndo"
        class="toolbar-btn"
        title="Undo (Ctrl+Z)"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M3 7v6h6M21 17a9 9 0 00-15-6.5L3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </button>
      
      <button 
        @click="$emit('redo')" 
        :disabled="!canRedo"
        class="toolbar-btn"
        title="Redo (Ctrl+Shift+Z)"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M21 7v6h-6M3 17a9 9 0 0115-6.5L21 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </button>
    </div>
    
    <div class="toolbar-center">
      <div class="save-status" :class="`save-status--${saveStatus}`">
        <span v-if="saveStatus === 'saving'" class="saving-spinner"></span>
        <span v-else-if="saveStatus === 'saved'" class="save-icon">✓</span>
        <span v-else class="save-icon">●</span>
        <span>{{ saveStatusText }}</span>
      </div>
    </div>
    
    <div class="toolbar-right">
      <button 
        @click="$emit('save')"
        class="toolbar-btn toolbar-btn--save"
        title="Save (Ctrl+S)"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
        <span>Save</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  canUndo: Boolean,
  canRedo: Boolean,
  saveStatus: {
    type: String,
    default: 'saved'
  }
})

const emit = defineEmits(['add-section', 'save', 'undo', 'redo'])

const saveStatusText = computed(() => {
  switch (props.saveStatus) {
    case 'saving': return 'Saving...'
    case 'saved': return 'All changes saved'
    case 'unsaved': return 'Unsaved changes'
    default: return ''
  }
})
</script>

<style scoped>
.builder-toolbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--toolbar-bg, rgba(0, 0, 0, 0.95));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-color, #fff);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.toolbar-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn svg {
  width: 16px;
  height: 16px;
}

.toolbar-btn--primary {
  background: var(--primary-color, #3b82f6);
  border-color: var(--primary-color, #3b82f6);
}

.toolbar-btn--primary:hover {
  background: var(--primary-hover, #2563eb);
  border-color: var(--primary-hover, #2563eb);
}

.toolbar-btn--save {
  background: var(--success-color, #10b981);
  border-color: var(--success-color, #10b981);
}

.toolbar-btn--save:hover {
  background: var(--success-hover, #059669);
  border-color: var(--success-hover, #059669);
}

/* Save Status */
.save-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-muted, #94a3b8);
}

.save-status--saving {
  color: var(--warning-color, #f59e0b);
}

.save-status--saved {
  color: var(--success-color, #10b981);
}

.save-status--unsaved {
  color: var(--text-color, #fff);
}

.save-icon {
  font-size: 10px;
}

.saving-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-top-color: var(--warning-color, #f59e0b);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .toolbar-btn span {
    display: none;
  }
  
  .toolbar-btn--primary span,
  .toolbar-btn--save span {
    display: inline;
  }
  
  .save-status {
    display: none;
  }
}
</style>
