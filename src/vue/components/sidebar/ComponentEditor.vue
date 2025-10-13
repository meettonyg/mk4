<template>
  <div class="sidebar-editor">
    <!-- Dynamic Component Editor (editors handle their own headers, tabs, everything) -->
    <div class="editor-content">
      <!-- Component-specific editor or fallback to generic -->
      <component
        v-if="editorComponent"
        :is="editorComponent"
        :component-id="componentId"
        @close="handleBack"
      />
      <GenericComponentEditor
        v-else-if="component"
        :component-id="componentId"
        @close="handleBack"
      />
      <div v-else class="editor-empty">
        <i class="fa-solid fa-cube empty-icon"></i>
        <p>Component not found</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useMediaKitStore } from '../../../stores/mediaKit'
import { useUIStore } from '../../../stores/ui'
import GenericComponentEditor from './GenericComponentEditor.vue'

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
})

const store = useMediaKitStore()
const uiStore = useUIStore()

// Get component
const component = computed(() => {
  return store.components[props.componentId]
})

// Dynamically load component-specific editor
const editorComponent = computed(() => {
  if (!component.value?.type) return null
  
  const componentType = component.value.type
  
  // Map component types to their editor paths
  const editorMap = {
    'hero': () => import(`../../../../components/hero/HeroEditor.vue`),
    'biography': () => import(`../../../../components/biography/BiographyEditor.vue`),
    'topics': () => import(`../../../../components/topics/TopicsEditor.vue`),
    'contact': () => import(`../../../../components/contact/ContactEditor.vue`),
    'guest-intro': () => import(`../../../../components/guest-intro/GuestIntroEditor.vue`),
    'stats': () => import(`../../../../components/stats/StatsEditor.vue`),
    'social': () => import(`../../../../components/social/SocialEditor.vue`),
    'questions': () => import(`../../../../components/questions/QuestionsEditor.vue`),
    'testimonials': () => import(`../../../../components/testimonials/TestimonialsEditor.vue`),
    'call-to-action': () => import(`../../../../components/call-to-action/CallToActionEditor.vue`),
    'video-intro': () => import(`../../../../components/video-intro/VideoIntroEditor.vue`),
    'podcast-player': () => import(`../../../../components/podcast-player/PodcastPlayerEditor.vue`),
    'photo-gallery': () => import(`../../../../components/photo-gallery/PhotoGalleryEditor.vue`),
    'logo-grid': () => import(`../../../../components/logo-grid/LogoGridEditor.vue`),
    'booking-calendar': () => import(`../../../../components/booking-calendar/BookingCalendarEditor.vue`),
    'topics-questions': () => import(`../../../../components/topics-questions/TopicsQuestionsEditor.vue`)
  }
  
  // Return the editor loader if it exists
  if (editorMap[componentType]) {
    console.log(`✅ Loading component-specific editor for: ${componentType}`);
    return defineAsyncComponent({
      loader: editorMap[componentType],
      loadingComponent: null,
      errorComponent: null,
      delay: 0,
      timeout: 3000,
      suspensible: false,
      onError(error, retry, fail, attempts) {
        console.error(`❌ Failed to load editor for ${componentType}:`, error);
        console.log(`🔄 Falling back to GenericComponentEditor`);
        fail();
      }
    })
  }
  
  console.log(`⚠️ No specific editor found for: ${componentType}, using GenericComponentEditor`);
  return null
})

// Handle back button
function handleBack() {
  uiStore.closeSidebarEditor()
}

// DEBUG logging
onMounted(() => {
  console.log('✅ ComponentEditor mounted:', {
    componentId: props.componentId,
    componentType: component.value?.type
  });
});
</script>

<style scoped>
.sidebar-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  overflow: hidden;
}

body.dark-mode .sidebar-editor {
  background: #0f172a;
}

/* Content */
.editor-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Empty State */
.editor-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.editor-empty p {
  font-size: 14px;
  margin: 0;
}

/* Scrollbar */
.editor-content::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track {
  background: #f3f4f6;
}

body.dark-mode .editor-content::-webkit-scrollbar-track {
  background: #1e293b;
}

.editor-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

body.dark-mode .editor-content::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.editor-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

body.dark-mode .editor-content::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
