<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="themeStore.customizerOpen" class="theme-customizer-modal">
        <div class="modal-overlay" @click="handleClose"></div>
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">Theme Customizer</h2>
            <div class="header-actions">
              <span v-if="themeStore.hasUnsavedChanges" class="unsaved-badge">
                • Unsaved changes
              </span>
              <button class="close-btn" @click="handleClose">✕</button>
            </div>
          </div>
          
          <!-- Body - Two Column Layout -->
          <div class="modal-body">
            <!-- Preview Section (Left) -->
            <div ref="previewSection" class="preview-section" :class="{ 'has-scroll': previewHasScroll }">
              <div class="preview-label">Live Preview</div>
              <div class="preview-frame" :style="previewFrameStyles">
                <!-- Typography Preview -->
                <h1 :style="headingStyles">Heading Level 1</h1>
                <h2 :style="headingStyles">Heading Level 2</h2>
                <h3 :style="headingStyles">Heading Level 3</h3>
                <p class="lead" :style="textStyles">
                  This is a lead paragraph with slightly larger text to make it stand out from regular body text.
                </p>
                <p :style="textStyles">
                  This is regular body text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  <a href="#" :style="linkStyles" @click.prevent>Learn more about styling options</a>.
                </p>
                <p class="small" :style="textStyles" style="opacity: 0.7; font-size: 0.875em">
                  This is small text, typically used for captions or secondary information.
                </p>

                <!-- Components Preview -->
                <div class="components-preview">
                  <div class="preview-section-title">Components</div>
                  
                  <!-- Buttons -->
                  <div class="button-group">
                    <button class="preview-btn preview-btn-primary" :style="primaryButtonStyles">
                      Primary Button
                    </button>
                    <button class="preview-btn preview-btn-secondary" :style="secondaryButtonStyles">
                      Secondary Button
                    </button>
                  </div>

                  <!-- Card -->
                  <div class="preview-card" :style="cardStyles">
                    <h4 :style="textStyles">Card Component</h4>
                    <p :style="textStyles" style="opacity: 0.7; margin: 0">
                      Cards use surface color with borders and subtle shadows for depth.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Settings Section (Right) -->
            <div class="settings-section">
              <!-- Horizontal Tabs -->
              <div class="tabs-container">
                <button 
                  v-for="(panel, index) in panels" 
                  :key="panel.id"
                  :class="['tab', { active: themeStore.activePanel === panel.id }]"
                  @click="switchPanel(panel.id)"
                >
                  <span>{{ panel.label }}</span>
                </button>
              </div>

              <!-- Tab Content -->
              <div ref="tabContent" class="tab-content" :class="{ 'has-scroll': tabContentHasScroll }">
                <!-- Themes Panel -->
                <div v-show="themeStore.activePanel === 'themes'" class="tab-pane">
                  <ThemesPanel />
                </div>
                
                <!-- Colors Panel -->
                <div v-show="themeStore.activePanel === 'colors'" class="tab-pane">
                  <ColorsPanel />
                </div>
                
                <!-- Typography Panel -->
                <div v-show="themeStore.activePanel === 'typography'" class="tab-pane">
                  <TypographyPanel />
                </div>
                
                <!-- Spacing Panel -->
                <div v-show="themeStore.activePanel === 'spacing'" class="tab-pane">
                  <SpacingPanel />
                </div>
                
                <!-- Effects Panel -->
                <div v-show="themeStore.activePanel === 'effects'" class="tab-pane">
                  <EffectsPanel />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="modal-footer">
            <div class="footer-left">
              <button class="btn btn-reset" @click="themeStore.resetToOriginal()">
                ↺ Reset to Original
              </button>
            </div>
            <div class="footer-right">
              <button class="btn btn-cancel" @click="handleClose">
                Cancel
              </button>
              <button class="btn btn-apply" @click="handleApply">
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
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue';
import { useThemeStore } from '../../stores/theme';
import ThemesPanel from './panels/ThemesPanel.vue';
import ColorsPanel from './panels/ColorsPanel.vue';
import TypographyPanel from './panels/TypographyPanel.vue';
import SpacingPanel from './panels/SpacingPanel.vue';
import EffectsPanel from './panels/EffectsPanel.vue';

const themeStore = useThemeStore();

// ROOT FIX: Use valid fallback theme that actually exists in the registry
// Check all available themes first before setting fallback
if (!themeStore.activeThemeId || !themeStore.getTheme(themeStore.activeThemeId)) {
  // Get first available theme as fallback
  const availableThemes = themeStore.availableThemes || [];
  if (availableThemes.length > 0) {
    themeStore.activeThemeId = availableThemes[0].id;
  } else {
    // Last resort: use 'professional_clean' which should always exist
    themeStore.activeThemeId = 'professional_clean';
  }
  console.log(`✅ ThemeCustomizer: Set fallback theme to ${themeStore.activeThemeId}`);
}

// ROOT FIX: Removed 'save' panel - streamlined to essential panels only
const panels = [
  { id: 'themes', label: 'Themes' },
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'effects', label: 'Effects' }
];

// Refs for scroll detection
const previewSection = ref(null);
const tabContent = ref(null);
const previewHasScroll = ref(false);
const tabContentHasScroll = ref(false);

// Computed styles for live preview
const currentTheme = computed(() => themeStore.mergedTheme);

const headingStyles = computed(() => ({
  fontFamily: currentTheme.value.typography?.headingFamily || 'inherit',
  color: currentTheme.value.colors?.text || '#1f2937'
}));

const textStyles = computed(() => ({
  fontFamily: currentTheme.value.typography?.fontFamily || 'inherit',
  fontSize: `${currentTheme.value.typography?.baseFontSize || 16}px`,
  color: currentTheme.value.colors?.text || '#1f2937'
}));

const linkStyles = computed(() => ({
  color: currentTheme.value.colors?.linkColor || currentTheme.value.colors?.primary || '#3b82f6',
  textDecoration: 'none',
  fontWeight: '500'
}));

const primaryButtonStyles = computed(() => ({
  background: currentTheme.value.colors?.primary || '#3b82f6',
  color: currentTheme.value.colors?.primaryText || '#ffffff',
  borderRadius: currentTheme.value.effects?.borderRadius || '6px'
}));

const secondaryButtonStyles = computed(() => ({
  background: currentTheme.value.colors?.secondary || '#6b7280',
  color: '#ffffff',
  borderRadius: currentTheme.value.effects?.borderRadius || '6px'
}));

const cardStyles = computed(() => ({
  background: currentTheme.value.colors?.surface || '#f8fafc',
  border: `1px solid ${currentTheme.value.colors?.surface || '#e2e8f0'}`,
  borderRadius: currentTheme.value.effects?.borderRadius || '8px'
}));

// ROOT FIX: Dynamic preview frame background based on active theme
const previewFrameStyles = computed(() => {
  const styles = {
    background: currentTheme.value.colors?.background || '#ffffff',
    color: currentTheme.value.colors?.text || '#1f2937',
    transition: 'background-color 0.3s ease, color 0.3s ease'
  };
  
  // CRITICAL DEBUG: Log when preview styles change
  if (window.gmkbData?.debugMode) {
    console.log('[ThemeCustomizer] Preview styles updated:', styles);
  }
  
  return styles;
});

// ROOT FIX: Event-driven scroll detection using ResizeObserver
const detectScrollableContent = () => {
  // Check tab content
  if (tabContent.value) {
    const isScrollable = tabContent.value.scrollHeight > tabContent.value.clientHeight;
    tabContentHasScroll.value = isScrollable;
  }
  
  // Check preview section
  if (previewSection.value) {
    const isScrollable = previewSection.value.scrollHeight > previewSection.value.clientHeight;
    previewHasScroll.value = isScrollable;
  }
};

// Switch panel and detect scroll
const switchPanel = (panelId) => {
  themeStore.setActivePanel(panelId);
  // ROOT FIX: Use nextTick to ensure DOM updates, then detect immediately
  nextTick(detectScrollableContent);
};

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

// ROOT FIX: Watch for theme changes to update preview
watch(() => themeStore.mergedTheme, (newTheme, oldTheme) => {
  // CRITICAL DEBUG: Log theme changes
  if (window.gmkbData?.debugMode) {
    console.log('[ThemeCustomizer] mergedTheme changed');
    console.log('  Old background:', oldTheme?.colors?.background);
    console.log('  New background:', newTheme?.colors?.background);
  }
  
  // Theme changed, scroll detection may be needed
  nextTick(detectScrollableContent);
}, { deep: true });

// CRITICAL FIX: Also watch tempCustomizations directly
watch(() => themeStore.tempCustomizations, (newCustomizations) => {
  if (window.gmkbData?.debugMode) {
    console.log('[ThemeCustomizer] tempCustomizations changed:', newCustomizations);
  }
}, { deep: true });

// ROOT FIX: Setup ResizeObserver for automatic scroll detection
let resizeObserver = null;

const setupScrollObserver = () => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  
  resizeObserver = new ResizeObserver(() => {
    detectScrollableContent();
  });
  
  // Observe both scrollable elements
  if (tabContent.value) {
    resizeObserver.observe(tabContent.value);
  }
  
  if (previewSection.value) {
    resizeObserver.observe(previewSection.value);
  }
};

// ROOT FIX: Watch for customizer open state to detect scroll
watch(() => themeStore.customizerOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      detectScrollableContent();
      setupScrollObserver();
    });
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', detectScrollableContent);
  
  // Load custom themes from database
  themeStore.loadCustomThemes();
  
  // Initial scroll detection and setup observer
  nextTick(() => {
    detectScrollableContent();
    setupScrollObserver();
  });
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', detectScrollableContent);
  
  // Cleanup ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});
</script>

<style scoped>
/* ============================================
   ROOT FIX: Modal Layout - Two Column Design
   ============================================ */
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
  padding: 1.5rem;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.modal-content {
  position: relative;
  z-index: 2;
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 1400px;
  height: 90vh;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

/* ============================================
   Header
   ============================================ */
.modal-header {
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.unsaved-badge {
  font-size: 0.8rem;
  color: #f59e0b;
  font-weight: 500;
}

.close-btn {
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 1.5rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

/* ============================================
   Body - Two Column Grid
   ============================================ */
.modal-body {
  display: grid;
  grid-template-columns: 1fr 540px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* ============================================
   Preview Section (Left)
   ============================================ */
.preview-section {
  background: #f9fafb;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid #e5e7eb;
  min-height: 0;
}

.preview-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.preview-frame {
  /* ROOT FIX: Background color is now dynamic via :style binding */
  /* background: white; -- REMOVED */
  border-radius: 8px;
  padding: 3rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.preview-frame h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.preview-frame h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.preview-frame h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.preview-frame .lead {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.preview-frame p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.preview-frame .small {
  font-size: 0.875rem;
}

.components-preview {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.preview-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.preview-btn {
  padding: 0.625rem 1.25rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.preview-card {
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.preview-card h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.preview-card p {
  font-size: 0.875rem;
  margin: 0;
}

/* ============================================
   Settings Section (Right)
   ============================================ */
.settings-section {
  display: flex;
  flex-direction: column;
  background: white;
  min-height: 0;
  overflow: hidden;
}

/* Horizontal Tabs */
.tabs-container {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  padding: 0;
  background: #fafafa;
  overflow-x: auto;
  overflow-y: hidden;
  flex-wrap: nowrap;
  flex-shrink: 0;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.tab {
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  white-space: nowrap;
  flex: 0 0 auto;
  min-width: fit-content;
}

.tab:hover {
  color: #374151;
  background: rgba(0, 0, 0, 0.02);
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: white;
}

.tab-content {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem;
  min-height: 0;
  height: 0;
  position: relative;
}

.tab-pane {
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ============================================
   Footer
   ============================================ */
.modal-footer {
  padding: 1.25rem 1.75rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  flex-shrink: 0;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-reset {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-reset:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-cancel {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-apply {
  background: #3b82f6;
  color: white;
}

.btn-apply:hover {
  background: #2563eb;
}

/* ============================================
   Scrollbar Styling - ROOT FIX
   ============================================ */
::-webkit-scrollbar {
  width: 14px;
  height: 14px;
}

::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-left: 1px solid #d1d5db;
}

::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 7px;
  border: 3px solid #e5e7eb;
}

::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}

::-webkit-scrollbar-thumb:active {
  background: #374151;
}

/* Firefox Scrollbar */
* {
  scrollbar-width: auto;
  scrollbar-color: #6b7280 #e5e7eb;
}

/* ============================================
   Scroll Indicators - ROOT FIX
   ============================================ */
.tab-content.has-scroll::before {
  content: '';
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to bottom, white, transparent);
  pointer-events: none;
  z-index: 1;
}

.tab-content.has-scroll::after {
  content: '';
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to top, white, transparent);
  pointer-events: none;
  z-index: 1;
}

.preview-section.has-scroll::after {
  content: '';
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(to top, rgba(249, 250, 251, 1), rgba(249, 250, 251, 0));
  pointer-events: none;
  z-index: 1;
}

/* ============================================
   Transitions
   ============================================ */
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

/* ============================================
   Responsive
   ============================================ */
@media (max-width: 1200px) {
  .modal-body {
    grid-template-columns: 1fr 480px;
  }
}

@media (max-width: 1024px) {
  .modal-body {
    grid-template-columns: 1fr;
    grid-template-rows: 300px 1fr;
  }
  
  .preview-section {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
  
  .modal-body {
    grid-template-rows: 250px 1fr;
  }
}
</style>
