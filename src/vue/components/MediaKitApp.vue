<template>
  <div class="media-kit-builder">
    <!-- Component Library Modal -->
    <ComponentLibrary />
    
    <!-- Theme Customizer Modal -->
    <ThemeCustomizer />
    
    <!-- Sections -->
    <div class="gmkb-sections-container">
      <MediaKitSection
        v-for="section in sections"
        :key="section.section_id"
        :section="section"
        :components="getSectionComponents(section.section_id)"
        @remove="removeSection"
        @move-up="moveSectionUp"
        @move-down="moveSectionDown"
      />
      
      <!-- Empty state -->
      <div v-if="sections.length === 0" class="gmkb-empty-state">
        <h3>No sections yet</h3>
        <p>Click "Add Section" to get started</p>
        <button @click="addSection('full_width')" class="btn btn-primary">
          Add First Section
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import MediaKitSection from './MediaKitSection.vue';
import ComponentLibrary from './ComponentLibraryNew.vue';
import ThemeCustomizer from './ThemeCustomizer.vue';
import ComponentRenderer from './ComponentRenderer.vue';

const store = useMediaKitStore();

// Computed properties
const sections = computed(() => store.sections);

// Methods
const getSectionComponents = (sectionId) => {
  return store.getSectionComponents(sectionId);
};

const addSection = (layout) => {
  store.addSection(layout);
};

const removeSection = (sectionId) => {
  if (confirm('Delete this section and all its components?')) {
    store.removeSection(sectionId);
  }
};

const moveSectionUp = (sectionId) => {
  const index = sections.value.findIndex(s => s.section_id === sectionId);
  if (index > 0) {
    const temp = sections.value[index];
    sections.value[index] = sections.value[index - 1];
    sections.value[index - 1] = temp;
  }
};

const moveSectionDown = (sectionId) => {
  const index = sections.value.findIndex(s => s.section_id === sectionId);
  if (index < sections.value.length - 1) {
    const temp = sections.value[index];
    sections.value[index] = sections.value[index + 1];
    sections.value[index + 1] = temp;
  }
};
</script>

<style scoped>
.media-kit-builder {
  width: 100%;
  height: 100%;
}

.gmkb-sections-container {
  padding: 20px;
  min-height: 400px;
}

.gmkb-empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
}

.gmkb-empty-state h3 {
  color: #e2e8f0;
  margin-bottom: 10px;
}

.gmkb-empty-state p {
  color: #94a3b8;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}
</style>
