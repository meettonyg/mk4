<template>
  <div class="section-reset-controls">
    <button
      @click="handleResetSettings"
      class="reset-button"
      title="Reset section settings to defaults"
    >
      <i class="fa-solid fa-rotate-left"></i>
      Reset Settings
    </button>
    
    <button
      @click="handleClearSection"
      class="reset-button danger"
      title="Remove all components from this section"
    >
      <i class="fa-solid fa-trash"></i>
      Clear Section
    </button>
  </div>
</template>

<script setup>
import { useMediaKitStore } from '../../../stores/mediaKit';

const props = defineProps({
  sectionId: {
    type: String,
    required: true
  }
});

const store = useMediaKitStore();

const handleResetSettings = () => {
  if (!confirm('Reset this section\'s settings to defaults?')) return;
  
  const success = store.resetSectionSettings(props.sectionId);
  
  if (success && typeof window.showToast === 'function') {
    window.showToast('Section settings reset', 'success');
  }
};

const handleClearSection = () => {
  const section = store.sections.find(s => s.section_id === props.sectionId);
  let componentCount = 0;
  
  if (section?.components) {
    componentCount = section.components.length;
  }
  if (section?.columns) {
    Object.values(section.columns).forEach(col => {
      componentCount += col.length;
    });
  }
  
  const message = componentCount > 0
    ? `Remove all ${componentCount} component(s) from this section?\n\n⚠️ Components will not be deleted, just removed from this section.`
    : 'This section has no components to clear.';
  
  if (componentCount === 0 || !confirm(message)) return;
  
  const success = store.clearSection(props.sectionId);
  
  if (success && typeof window.showToast === 'function') {
    window.showToast(`Cleared ${componentCount} component(s)`, 'success');
  }
};
</script>

<style scoped>
.section-reset-controls {
  display: flex;
  gap: 0.5rem;
}

.reset-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: white;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.reset-button.danger {
  color: #dc2626;
  border-color: #fecaca;
}

.reset-button.danger:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}
</style>
