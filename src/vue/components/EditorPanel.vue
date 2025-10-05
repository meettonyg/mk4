<template>
  <Teleport to="body">
    <div v-if="isEditing" class="editor-panel-overlay" @click.self="closeEditor">
      <div class="editor-panel" :class="{ 'editor-panel--open': isEditing }">
        <div class="editor-panel__content">
          <!-- Dynamically load component-specific editor or fallback to generic -->
          <component 
            v-if="editorComponent"
            :is="editorComponent"
            :component-id="editingComponentId"
            @close="closeEditor"
          />
          <GenericEditor 
            v-else-if="editingComponentId"
            :component-id="editingComponentId"
            @close="closeEditor"
          />
          <div v-else class="editor-panel__empty">
            <p>Select a component to edit</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, defineAsyncComponent, markRaw, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import GenericEditor from './GenericEditor.vue';

const store = useMediaKitStore();

// Check if editing
const isEditing = computed(() => !!store.editingComponentId);
const editingComponentId = computed(() => store.editingComponentId);

// Get the component being edited
const editingComponent = computed(() => {
  if (!editingComponentId.value) return null;
  return store.components[editingComponentId.value];
});

// Dynamically load component-specific editor
const editorComponent = computed(() => {
  if (!editingComponent.value?.type) return null;
  
  const componentType = editingComponent.value.type;
  
  // Map of component types to their editor components
  // This will be dynamically loaded from the component's directory
  const editorMap = {
    'hero': markRaw(defineAsyncComponent(() => 
      import('../../../components/hero/HeroEditor.vue')
        .catch(err => {
          console.log(`No custom editor for hero, using generic`);
          return null;
        })
    )),
    'biography': markRaw(defineAsyncComponent(() => 
      import('../../../components/biography/BiographyEditor.vue')
        .catch(err => {
          console.log(`No custom editor for biography, using generic`);
          return null;
        })
    )),
    'topics': markRaw(defineAsyncComponent(() => 
      import('../../../components/topics/TopicsEditor.vue')
        .catch(() => null)
    )),
    'contact': markRaw(defineAsyncComponent(() => 
      import('../../../components/contact/ContactEditor.vue')
        .catch(() => null)
    )),
    'questions': markRaw(defineAsyncComponent(() => 
      import('../../../components/questions/QuestionsEditor.vue')
        .catch(() => null)
    )),
    'social': markRaw(defineAsyncComponent(() => 
      import('../../../components/social/SocialEditor.vue')
        .catch(() => null)
    )),
    'call-to-action': markRaw(defineAsyncComponent(() => 
      import('../../../components/call-to-action/CallToActionEditor.vue')
        .catch(() => null)
    )),
    'testimonials': markRaw(defineAsyncComponent(() => 
      import('../../../components/testimonials/TestimonialsEditor.vue')
        .catch(() => null)
    )),
    'stats': markRaw(defineAsyncComponent(() => 
      import('../../../components/stats/StatsEditor.vue')
        .catch(() => null)
    )),
    'video-intro': markRaw(defineAsyncComponent(() => 
      import('../../../components/video-intro/VideoIntroEditor.vue')
        .catch(() => null)
    )),
    'photo-gallery': markRaw(defineAsyncComponent(() => 
      import('../../../components/photo-gallery/PhotoGalleryEditor.vue')
        .catch(() => null)
    )),
    'podcast-player': markRaw(defineAsyncComponent(() => 
      import('../../../components/podcast-player/PodcastPlayerEditor.vue')
        .catch(() => null)
    )),
    'booking-calendar': markRaw(defineAsyncComponent(() => 
      import('../../../components/booking-calendar/BookingCalendarEditor.vue')
        .catch(() => null)
    )),
    'authority-hook': markRaw(defineAsyncComponent(() => 
      import('../../../components/authority-hook/AuthorityHookEditor.vue')
        .catch(() => null)
    )),
    'guest-intro': markRaw(defineAsyncComponent(() => 
      import('../../../components/guest-intro/GuestIntroEditor.vue')
        .catch(() => null)
    )),
    'logo-grid': markRaw(defineAsyncComponent(() => 
      import('../../../components/logo-grid/LogoGridEditor.vue')
        .catch(() => null)
    )),
    'topics-questions': markRaw(defineAsyncComponent(() => 
      import('../../../components/topics-questions/TopicsQuestionsEditor.vue')
        .catch(() => null)
    ))
  };
  
  return editorMap[componentType] || null;
});

// Close editor
const closeEditor = () => {
  store.closeEditPanel();
};

// ROOT FIX: Store handler reference for proper cleanup
let escapeHandler = null;

// Create escape key handler
escapeHandler = (e) => {
  if (e.key === 'Escape' && isEditing.value) {
    closeEditor();
  }
};

// ROOT FIX: Add keyboard listener in onMounted
onMounted(() => {
  document.addEventListener('keydown', escapeHandler);
  console.log('✅ EditorPanel: Escape key listener registered');
});

// ROOT FIX: Proper cleanup in onUnmounted
onUnmounted(() => {
  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler);
    console.log('✅ EditorPanel: Escape key listener cleaned up');
  }
});
</script>

<style scoped>
.editor-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.editor-panel {
  width: 400px;
  height: 100%;
  background: white;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.editor-panel--open {
  transform: translateX(0);
}

.editor-panel__content {
  flex: 1;
  overflow-y: auto;
  height: 100%;
}

.editor-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 640px) {
  .editor-panel {
    width: 100%;
    max-width: 100%;
  }
}

/* Animation for panel slide */
.editor-panel {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
