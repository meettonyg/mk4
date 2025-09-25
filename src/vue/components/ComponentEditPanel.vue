<template>
  <Transition name="slide-fade">
    <div v-if="editingComponent" class="component-edit-panel">
      <div class="edit-panel-header">
        <button @click="close" class="back-btn">← Back to Components</button>
        <h3>Edit {{ componentTypeLabel }}</h3>
      </div>
      
      <div class="edit-panel-content">
        <!-- Dynamic form based on component type -->
        <component 
          :is="editForm" 
          v-model="localData"
          :component="editingComponent"
        />
        
        <div class="edit-actions">
          <button @click="save" class="save-btn">Save Changes</button>
          <button @click="close" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';

// Import the generic edit form - specific forms will be created later
import GenericEditForm from './edit-forms/GenericEditForm.vue';

const store = useMediaKitStore();

// Component being edited
const editingComponent = computed(() => {
  if (!store.editingComponentId) return null;
  return store.components[store.editingComponentId];
});

// Local copy of component data for editing
const localData = reactive({});

// Watch for component changes and update local data
watch(editingComponent, (component) => {
  if (component) {
    Object.assign(localData, component.data || {});
  }
}, { immediate: true });

// Get the appropriate edit form component
// ROOT FIX: Use GenericEditForm for all components until specific forms are created
const editForm = computed(() => {
  if (!editingComponent.value) return null;
  
  // For now, use GenericEditForm for all component types
  // Specific forms can be added later as needed
  const formMap = {
    // 'hero': HeroEditForm, // To be created
    // 'biography': BiographyEditForm, // To be created
    // 'topics': TopicsEditForm, // To be created
    // 'contact': ContactEditForm, // To be created
  };
  
  return formMap[editingComponent.value.type] || GenericEditForm;
});

// Format component type for display
const componentTypeLabel = computed(() => {
  if (!editingComponent.value) return '';
  return editingComponent.value.type
    .charAt(0).toUpperCase() + 
    editingComponent.value.type.slice(1).replace(/-/g, ' ');
});

// Save changes
const save = () => {
  if (!editingComponent.value) return;
  
  store.updateComponent(editingComponent.value.id, {
    data: { ...localData }
  });
  
  store.closeEditPanel();
};

// Close without saving
const close = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.component-edit-panel {
  background: white;
  height: 100%;
  overflow-y: auto;
}

.edit-panel-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.edit-panel-header h3 {
  margin: 10px 0 0;
  font-size: 18px;
  font-weight: 600;
}

.back-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 5px 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #111827;
  background: #f3f4f6;
}

.edit-panel-content {
  padding: 20px;
}

.edit-actions {
  margin-top: 30px;
  display: flex;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.save-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.save-btn {
  background: #10b981;
  color: white;
}

.save-btn:hover {
  background: #059669;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

/* Slide fade transition */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
