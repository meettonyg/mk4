<template>
  <Teleport to="body">
    <div v-if="isPanelOpen" class="section-settings-overlay" @click.self="handleClose">
      <div class="section-settings-panel" :class="{ 'section-settings-panel--open': isPanelOpen }">
        <div class="section-settings-panel__content">
          <!-- Header -->
          <div class="settings-header">
            <div class="header-left">
              <h3>Section Settings</h3>
            </div>
            
            <div class="header-right">
              <!-- RESET FUNCTIONALITY: Section reset button added -->
              <SectionResetButton 
                v-if="sectionId" 
                :sectionId="sectionId" 
              />
              
              <button @click="handleClose" class="close-btn" title="Close">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- NEW: Tab Navigation -->
          <div class="settings-tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="['tab-button', { active: activeTab === tab.id }]"
            >
              {{ tab.label }}
            </button>
          </div>
          
          <!-- NEW: Tab Panels -->
          <div class="settings-content">
            <!-- Content Tab -->
            <div v-show="activeTab === 'content'" class="tab-panel">
              <SectionContentPanel 
                v-if="sectionId && section"
                :section-id="sectionId"
                :section="section"
              />
            </div>
            
            <!-- Style Tab -->
            <div v-show="activeTab === 'style'" class="tab-panel">
              <BaseStylePanel
                v-if="sectionId"
                :section-id="sectionId"
                :show-typography="false"
                mode="section"
              />
            </div>
            
            <!-- Advanced Tab -->
            <div v-show="activeTab === 'advanced'" class="tab-panel">
              <BaseAdvancedPanel
                v-if="sectionId"
                :section-id="sectionId"
                mode="section"
              />
            </div>
          </div>
          
          <!-- Footer removed - real-time updates instead -->
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useMediaKitStore } from '@/stores/mediaKit'
import { useUIStore } from '@/stores/ui'
import SectionContentPanel from './SectionContentPanel.vue'
import BaseStylePanel from '../sidebar/editors/BaseStylePanel.vue'
import BaseAdvancedPanel from '../sidebar/editors/BaseAdvancedPanel.vue'
// RESET FUNCTIONALITY: Import section reset button
import SectionResetButton from '../ui/SectionResetButton.vue'

const store = useMediaKitStore()
const uiStore = useUIStore()

// Tab configuration
const tabs = [
  { id: 'content', label: 'Content' },
  { id: 'style', label: 'Style' },
  { id: 'advanced', label: 'Advanced' }
]

const activeTab = ref('content')

// Check if panel is open
const isPanelOpen = computed(() => uiStore.sectionSettingsPanelOpen)
const sectionId = computed(() => uiStore.editingSectionId)

// Get current section
const section = computed(() => {
  if (!sectionId.value) return null
  return store.sections.find(s => s.section_id === sectionId.value)
})

// ROOT FIX: Debug panel open state
watch(isPanelOpen, (isOpen) => {
  if (isOpen) {
    console.log('✅ SectionSettings: Panel OPENED for section:', sectionId.value)
    console.log('📊 SectionSettings: Current section data:', section.value)
    // Reset to content tab when opening
    activeTab.value = 'content'
  } else {
    console.log('✅ SectionSettings: Panel CLOSED')
  }
})

// Close handler
function handleClose() {
  uiStore.closeSectionSettings()
}

// Escape key handler
let escapeHandler = null

escapeHandler = (e) => {
  if (e.key === 'Escape' && isPanelOpen.value) {
    handleClose()
  }
}

// Add keyboard listener
onMounted(() => {
  document.addEventListener('keydown', escapeHandler)
  console.log('✅ SectionSettings: Escape key listener registered')
})

// Cleanup
onUnmounted(() => {
  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler)
    console.log('✅ SectionSettings: Escape key listener cleaned up')
  }
})
</script>

<style scoped>
/* ROOT FIX: Bulletproof Elementor-style sidebar panel - ABSOLUTE POSITIONING */
.section-settings-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.5) !important;
  z-index: 999999 !important;
  animation: fadeIn 0.2s ease;
  pointer-events: auto !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.section-settings-panel {
  /* CRITICAL ROOT FIX: Absolute positioning for bulletproof right-side placement */
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 400px !important;
  max-width: 400px !important;
  height: 100% !important;
  background: var(--panel-bg, #1a1a1a) !important;
  color: var(--text-color, #fff) !important;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3) !important;
  transform: translateX(100%) !important;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  z-index: 1000000 !important;
}

.section-settings-panel--open {
  transform: translateX(0) !important;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.section-settings-panel__content {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

/* RESET FUNCTIONALITY: Header layout for reset buttons */
.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.settings-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-color, #fff);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-color, #fff);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* NEW: Tab Navigation Styles */
.settings-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 20px;
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.tab-button {
  padding: 16px 24px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.tab-button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  /* Removed padding - let tab panels handle their own padding */
}

.tab-panel {
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

/* Responsive */
@media (max-width: 640px) {
  .section-settings-panel {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .settings-tabs {
    padding: 0 12px;
  }
  
  .tab-button {
    padding: 14px 16px;
    font-size: 13px;
  }
  
  .tab-panel {
    padding: 16px;
  }
}

/* Custom Scrollbar */
.settings-content::-webkit-scrollbar {
  width: 6px;
}

.settings-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.settings-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.settings-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
