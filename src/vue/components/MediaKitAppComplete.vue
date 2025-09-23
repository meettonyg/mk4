<template>
  <div class="media-kit-builder">
    <!-- Component Library Modal -->
    <ComponentLibrary />
    
    <!-- Theme Customizer Modal -->
    <ThemeCustomizer />
    
    <!-- Sections Container -->
    <div class="gmkb-sections-container">
      <!-- Render sections with their components -->
      <SectionRenderer
        v-for="section in sections"
        :key="section.section_id"
        :section="section"
        :components="getSectionComponents(section.section_id)"
        @remove="removeSection"
      />
      
      <!-- Empty state when no sections -->
      <div v-if="sections.length === 0" class="gmkb-empty-state">
        <div class="empty-icon">📄</div>
        <h3>Start Building Your Media Kit</h3>
        <p>Add your first section to begin</p>
        <div class="empty-actions">
          <button @click="addSection('full_width')" class="btn btn-primary">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" fill="none" stroke-width="2"/>
            </svg>
            Full Width Section
          </button>
          <button @click="addSection('two_column')" class="btn btn-secondary">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <rect x="3" y="3" width="8" height="18" rx="1" stroke="currentColor" fill="none" stroke-width="2"/>
              <rect x="13" y="3" width="8" height="18" rx="1" stroke="currentColor" fill="none" stroke-width="2"/>
            </svg>
            Two Columns
          </button>
        </div>
      </div>
    </div>
    
    <!-- Floating Action Button for adding sections -->
    <div class="gmkb-fab" v-if="sections.length > 0">
      <button @click="showAddMenu = !showAddMenu" class="fab-button">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <div v-if="showAddMenu" class="fab-menu">
        <button @click="addSection('full_width'); showAddMenu = false">Full Width</button>
        <button @click="addSection('two_column'); showAddMenu = false">Two Columns</button>
        <button @click="addSection('three_column'); showAddMenu = false">Three Columns</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import SectionRenderer from './SectionRenderer.vue';
import ComponentLibrary from './ComponentLibraryNew.vue';
import ThemeCustomizer from './ThemeCustomizer.vue';

const store = useMediaKitStore();
const showAddMenu = ref(false);

// Computed properties
const sections = computed(() => store.sections);

// Methods
const getSectionComponents = (sectionId) => {
  return store.getSectionComponents(sectionId);
};

const addSection = (layout) => {
  store.addSection(layout);
  
  // Hide empty state container if it exists (for backward compatibility)
  const emptyState = document.getElementById('empty-state');
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Show saved components container if it exists (for backward compatibility)
  const savedContainer = document.getElementById('saved-components-container');
  if (savedContainer) {
    savedContainer.style.display = 'none';
  }
};

const removeSection = (sectionId) => {
  if (confirm('Delete this section and all its components?')) {
    store.removeSection(sectionId);
  }
};
</script>

<style scoped>
.media-kit-builder {
  width: 100%;
  height: 100%;
  position: relative;
}

.gmkb-sections-container {
  padding: 20px;
  min-height: 400px;
  width: 100%;
}

/* Empty State */
.gmkb-empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  margin: 40px auto;
  max-width: 600px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.gmkb-empty-state h3 {
  color: #e2e8f0;
  margin-bottom: 10px;
  font-size: 24px;
}

.gmkb-empty-state p {
  color: #94a3b8;
  margin-bottom: 30px;
  font-size: 16px;
}

.empty-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn svg {
  flex-shrink: 0;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: #475569;
  color: white;
}

.btn-secondary:hover {
  background: #64748b;
  transform: translateY(-1px);
}

/* Floating Action Button */
.gmkb-fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 100;
}

.fab-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.fab-button:hover {
  background: #2563eb;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.fab-menu {
  position: absolute;
  bottom: 70px;
  right: 0;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 8px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.fab-menu button {
  display: block;
  width: 100%;
  padding: 10px 20px;
  background: none;
  border: none;
  color: #e2e8f0;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  transition: background 0.2s;
}

.fab-menu button:hover {
  background: #334155;
}
</style>
