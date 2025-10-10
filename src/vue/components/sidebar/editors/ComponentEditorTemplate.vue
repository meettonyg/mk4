<template>
  <div class="component-editor-template">
    <div class="editor-header">
      <button @click="handleBack" class="back-btn" title="Back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h3 class="editor-title">Edit {{ componentType }}</h3>
    </div>
    
    <!-- Tab Navigation -->
    <div class="editor-tabs">
      <button 
        v-for="tab in tabs"
        :key="tab.id"
        @click="emit('update:activeTab', tab.id)"
        :class="['tab-button', { active: activeTab === tab.id }]"
        :title="tab.label"
      >
        <component :is="tab.icon" class="tab-icon" />
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    
    <!-- Tab Content -->
    <div class="editor-content">
      <!-- Content Tab -->
      <div v-show="activeTab === 'content'" class="tab-panel">
        <slot name="content">
          <div class="empty-state">
            <p>No content editor defined</p>
          </div>
        </slot>
      </div>
      
      <!-- Style Tab -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="componentType"
          :show-typography="showTypography"
        />
      </div>
      
      <!-- Advanced Tab -->
      <div v-show="activeTab === 'advanced'" class="tab-panel">
        <BaseAdvancedPanel
          :component-id="componentId"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from 'vue';
import BaseStylePanel from './BaseStylePanel.vue';
import BaseAdvancedPanel from './BaseAdvancedPanel.vue';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  },
  componentType: {
    type: String,
    required: true
  },
  showTypography: {
    type: Boolean,
    default: true
  },
  activeTab: {
    type: String,
    default: 'content'
  }
});

const emit = defineEmits(['back', 'update:activeTab']);

// Tab configuration
const tabs = [
  { 
    id: 'content', 
    label: 'Content',
    icon: () => h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      width: '18', 
      height: '18', 
      viewBox: '0 0 24 24', 
      fill: 'none', 
      stroke: 'currentColor', 
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' }),
      h('polyline', { points: '14 2 14 8 20 8' }),
      h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
      h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
      h('line', { x1: '10', y1: '9', x2: '8', y2: '9' })
    ])
  },
  { 
    id: 'style', 
    label: 'Style',
    icon: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '18',
      height: '18',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { d: 'm9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08' }),
      h('path', { d: 'M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z' })
    ])
  },
  { 
    id: 'advanced', 
    label: 'Advanced',
    icon: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '18',
      height: '18',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('line', { x1: '4', y1: '21', x2: '4', y2: '14' }),
      h('line', { x1: '4', y1: '10', x2: '4', y2: '3' }),
      h('line', { x1: '12', y1: '21', x2: '12', y2: '12' }),
      h('line', { x1: '12', y1: '8', x2: '12', y2: '3' }),
      h('line', { x1: '20', y1: '21', x2: '20', y2: '16' }),
      h('line', { x1: '20', y1: '12', x2: '20', y2: '3' }),
      h('line', { x1: '2', y1: '14', x2: '6', y2: '14' }),
      h('line', { x1: '10', y1: '8', x2: '14', y2: '8' }),
      h('line', { x1: '18', y1: '16', x2: '22', y2: '16' })
    ])
  }
];

function handleBack() {
  emit('back');
}
</script>

<style scoped>
.component-editor-template {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

body.dark-mode .component-editor-template {
  background: #0f172a;
}

/* Header */
.editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

body.dark-mode .editor-header {
  background: #1e293b;
  border-color: #334155;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

body.dark-mode .back-btn:hover {
  background: #334155;
  color: #f3f4f6;
}

.editor-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

body.dark-mode .editor-title {
  color: #f3f4f6;
}

/* Tabs */
.editor-tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

body.dark-mode .editor-tabs {
  background: #1e293b;
  border-color: #334155;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #ec4899;
  background: rgba(236, 72, 153, 0.05);
}

.tab-button.active {
  color: #ec4899;
  border-bottom-color: #ec4899;
}

body.dark-mode .tab-button {
  color: #94a3b8;
}

body.dark-mode .tab-button:hover {
  color: #ec4899;
  background: rgba(236, 72, 153, 0.1);
}

body.dark-mode .tab-button.active {
  color: #ec4899;
}

.tab-icon {
  width: 18px;
  height: 18px;
}

.tab-label {
  font-size: 14px;
}

/* Content */
.editor-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.tab-panel {
  min-height: 100%;
}

/* Empty State */
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Scrollbar */
.editor-content::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

body.dark-mode .editor-content::-webkit-scrollbar-track {
  background: #1e293b;
}

.editor-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

body.dark-mode .editor-content::-webkit-scrollbar-thumb {
  background: #475569;
}

.editor-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

body.dark-mode .editor-content::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Responsive */
@media (max-width: 768px) {
  .tab-label {
    display: none;
  }
  
  .tab-button {
    padding: 12px;
  }
}
</style>
