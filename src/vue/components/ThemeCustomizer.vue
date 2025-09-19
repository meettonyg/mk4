<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="themeStore.customizerOpen" class="theme-customizer-modal">
        <div class="modal-overlay" @click="handleClose"></div>
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h2>Theme Customizer</h2>
            <div class="header-actions">
              <span v-if="themeStore.hasUnsavedChanges" class="unsaved-indicator">
                • Unsaved changes
              </span>
              <button class="close-btn" @click="handleClose">✕</button>
            </div>
          </div>
          
          <!-- Body -->
          <div class="modal-body">
            <div class="customizer-layout">
              <!-- Sidebar Navigation -->
              <nav class="customizer-sidebar">
                <button 
                  v-for="panel in panels" 
                  :key="panel.id"
                  :class="['nav-item', { active: themeStore.activePanel === panel.id }]"
                  @click="themeStore.setActivePanel(panel.id)"
                >
                  <span class="nav-icon">{{ panel.icon }}</span>
                  {{ panel.label }}
                </button>
              </nav>
              
              <!-- Content Panels -->
              <div class="customizer-content">
                <!-- Themes Panel -->
                <ThemesPanel v-if="themeStore.activePanel === 'themes'" />
                
                <!-- Colors Panel -->
                <ColorsPanel v-if="themeStore.activePanel === 'colors'" />
                
                <!-- Typography Panel -->
                <TypographyPanel v-if="themeStore.activePanel === 'typography'" />
                
                <!-- Spacing Panel -->
                <SpacingPanel v-if="themeStore.activePanel === 'spacing'" />
                
                <!-- Effects Panel -->
                <EffectsPanel v-if="themeStore.activePanel === 'effects'" />
                
                <!-- Save Theme Panel -->
                <SaveThemePanel v-if="themeStore.activePanel === 'save'" />
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="themeStore.resetToOriginal()">
              Reset to Original
            </button>
            <div class="footer-actions">
              <button class="btn btn-secondary" @click="handleClose">
                Cancel
              </button>
              <button class="btn btn-primary" @click="handleApply">
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useThemeStore } from '../../stores/theme';
import ThemesPanel from './panels/ThemesPanel.vue';
import ColorsPanel from './panels/ColorsPanel.vue';
import TypographyPanel from './panels/TypographyPanel.vue';
import SpacingPanel from './panels/SpacingPanel.vue';
import EffectsPanel from './panels/EffectsPanel.vue';
import SaveThemePanel from './panels/SaveThemePanel.vue';

const themeStore = useThemeStore();

const panels = [
  { id: 'themes', label: 'Themes', icon: '🎨' },
  { id: 'colors', label: 'Colors', icon: '🎨' },
  { id: 'typography', label: 'Typography', icon: '📝' },
  { id: 'spacing', label: 'Spacing', icon: '📐' },
  { id: 'effects', label: 'Effects', icon: '✨' },
  { id: 'save', label: 'Save Theme', icon: '💾' }
];

// Handle close with confirmation if there are unsaved changes
const handleClose = () => {
  if (themeStore.hasUnsavedChanges) {
    if (confirm('You have unsaved changes. Close without saving?')) {
      themeStore.closeCustomizer(false);
    }
  } else {
    themeStore.closeCustomizer(false);
  }
};

// Apply changes
const handleApply = () => {
  themeStore.applyCustomizations();
  themeStore.closeCustomizer(true);
  
  // Show success message if available
  if (window.showToast) {
    window.showToast('Theme changes applied successfully!', 'success');
  }
};

// Keyboard shortcuts
const handleKeydown = (e) => {
  if (e.key === 'Escape' && themeStore.customizerOpen) {
    handleClose();
  }
  // Ctrl+Shift+T to open (handled in main.js)
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  // Load custom themes from database
  themeStore.loadCustomThemes();
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.theme-customizer-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 1200px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.unsaved-indicator {
  color: #f59e0b;
  font-size: 14px;
  font-weight: 500;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  flex: 1;
  overflow: hidden;
}

.customizer-layout {
  display: flex;
  height: 100%;
}

.customizer-sidebar {
  width: 200px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  padding: 20px 0;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #4b5563;
}

.nav-item:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.nav-item.active {
  background: white;
  font-weight: 600;
  color: #1f2937;
  border-left: 3px solid #3b82f6;
  padding-left: 17px;
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.customizer-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background: #f9fafb;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
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
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

/* Transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
  
  .customizer-layout {
    flex-direction: column;
  }
  
  .customizer-sidebar {
    width: 100%;
    display: flex;
    overflow-x: auto;
    padding: 10px;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .nav-item {
    min-width: fit-content;
  }
}
</style>
