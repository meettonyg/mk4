<template>
  <teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="show = false">
      <div class="modal-container">
        <div class="modal-header">
          <h2>⚠️ Reset Entire Media Kit?</h2>
          <button @click="show = false" class="close-button">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="warning-box">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p><strong>This will delete ALL components, sections, and customizations.</strong></p>
          </div>
          
          <ul class="reset-details">
            <li>All {{ componentCount }} components will be deleted</li>
            <li>All {{ sectionCount }} sections will be deleted</li>
            <li>Theme customizations will be reset</li>
            <li>A single empty section will be created</li>
          </ul>
          
          <div class="info-box">
            <i class="fa-solid fa-info-circle"></i>
            <p>You can undo this action using Ctrl+Z / Cmd+Z</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="show = false" class="button secondary">
            Cancel
          </button>
          <button @click="confirmReset" class="button danger">
            <i class="fa-solid fa-rotate-left"></i>
            Yes, Reset Everything
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMediaKitStore } from '@/stores/mediaKit';

const show = ref(false);
const store = useMediaKitStore();

const componentCount = computed(() => Object.keys(store.components).length);
const sectionCount = computed(() => store.sections.length);

const open = () => {
  show.value = true;
};

const confirmReset = () => {
  const success = store.resetAll(true);
  
  if (success) {
    show.value = false;
    
    if (typeof window.showToast === 'function') {
      window.showToast('Media kit reset to defaults', 'success');
    }
  }
};

defineExpose({ open });
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
}

.close-button:hover {
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.warning-box {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}

.warning-box i {
  color: #dc2626;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-box p {
  margin: 0;
  color: #991b1b;
}

.reset-details {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
}

.reset-details li {
  padding: 0.5rem 0;
  padding-left: 2rem;
  position: relative;
}

.reset-details li::before {
  content: "•";
  position: absolute;
  left: 0.5rem;
  color: #dc2626;
  font-weight: bold;
}

.info-box {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.375rem;
}

.info-box i {
  color: #2563eb;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.info-box p {
  margin: 0;
  color: #1e40af;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.button.secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.button.secondary:hover {
  background: #f9fafb;
}

.button.danger {
  background: #dc2626;
  color: white;
}

.button.danger:hover {
  background: #b91c1c;
}
</style>
