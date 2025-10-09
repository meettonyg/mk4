<template>
  <div class="booking-calendar-editor">
    <div class="editor-header">
      <h3>Booking Calendar Component</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <!-- Tab Navigation -->
    <div class="editor-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="editor-content">
      <!-- CONTENT TAB -->
      <div v-show="activeTab === 'content'" class="tab-panel">
        <section class="editor-section">
          <h4>Calendar Settings</h4>
          
          <div class="field-group">
            <label for="calendar-title">Calendar Title</label>
            <input 
              id="calendar-title"
              v-model="localData.title" 
              @input="updateComponent"
              placeholder="e.g., Schedule a Meeting"
            >
          </div>
          
          <div class="field-group">
            <label for="calendar-type">Calendar Integration</label>
            <select 
              id="calendar-type"
              v-model="localData.calendarType" 
              @change="updateComponent"
            >
              <option value="calendly">Calendly</option>
              <option value="cal-com">Cal.com</option>
              <option value="google">Google Calendar</option>
              <option value="custom">Custom Calendar</option>
            </select>
          </div>
          
          <div class="field-group">
            <label for="calendar-url">Calendar URL or Embed Code</label>
            <input 
              v-if="localData.calendarType !== 'custom'"
              id="calendar-url"
              v-model="localData.calendarUrl" 
              @input="updateComponent"
              placeholder="e.g., https://calendly.com/username"
            >
            <textarea 
              v-else
              id="calendar-embed"
              v-model="localData.embedCode" 
              @input="updateComponent"
              rows="6"
              placeholder="Paste your calendar embed code here..."
            />
          </div>
          
          <div class="field-group">
            <label for="description">Description</label>
            <textarea 
              id="description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="4"
              placeholder="Briefly describe what this booking is for..."
            />
          </div>
        </section>

        <section class="editor-section">
          <h4>Availability Settings</h4>
          
          <div class="field-group">
            <label for="duration">Meeting Duration</label>
            <input 
              id="duration"
              v-model="localData.duration" 
              @input="updateComponent"
              placeholder="e.g., 30 min"
            >
          </div>
          
          <div class="field-group">
            <label for="timezone">Timezone</label>
            <input 
              id="timezone"
              v-model="localData.timezone" 
              @input="updateComponent"
              placeholder="e.g., EST, PST, UTC"
            >
          </div>
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
          <div class="field-group">
            <label for="display-mode">Display Mode</label>
            <select 
              id="display-mode"
              v-model="localData.displayMode" 
              @change="updateComponent"
            >
              <option value="embed">Embedded Calendar</option>
              <option value="button">Book Now Button</option>
              <option value="both">Calendar + Button</option>
            </select>
          </div>
          
          <div class="field-group">
            <label for="button-text">Button Text</label>
            <input 
              id="button-text"
              v-model="localData.buttonText" 
              @input="updateComponent"
              placeholder="e.g., Book a Call"
            >
          </div>
          
          <div class="field-group">
            <label for="button-style">Button Style</label>
            <select 
              id="button-style"
              v-model="localData.buttonStyle" 
              @change="updateComponent"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
            </select>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showAvailability" 
                @change="updateComponent"
              >
              Show Availability Status
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.openInNewTab" 
                @change="updateComponent"
              >
              Open in New Tab
            </label>
          </div>
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'booking-calendar'"
          :show-typography="false"
        />
      </div>
      
      <!-- ADVANCED TAB -->
      <div v-show="activeTab === 'advanced'" class="tab-panel">
        <BaseAdvancedPanel
          :component-id="componentId"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import BaseStylePanel from '../../src/vue/components/sidebar/editors/BaseStylePanel.vue';
import BaseAdvancedPanel from '../../src/vue/components/sidebar/editors/BaseAdvancedPanel.vue';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const store = useMediaKitStore();

// Tab state
const activeTab = ref('content');
const tabs = [
  { id: 'content', label: 'Content' },
  { id: 'style', label: 'Style' },
  { id: 'advanced', label: 'Advanced' }
];

const localData = ref({
  title: 'Schedule a Meeting',
  calendarType: 'calendly',
  calendarUrl: '',
  embedCode: '',
  description: '',
  duration: '30 min',
  timezone: '',
  displayMode: 'embed',
  buttonText: 'Book a Call',
  buttonStyle: 'primary',
  showAvailability: true,
  openInNewTab: true
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'Schedule a Meeting',
      calendarType: component.data.calendarType || 'calendly',
      calendarUrl: component.data.calendarUrl || '',
      embedCode: component.data.embedCode || '',
      description: component.data.description || '',
      duration: component.data.duration || '30 min',
      timezone: component.data.timezone || '',
      displayMode: component.data.displayMode || 'embed',
      buttonText: component.data.buttonText || 'Book a Call',
      buttonStyle: component.data.buttonStyle || 'primary',
      showAvailability: component.data.showAvailability !== false,
      openInNewTab: component.data.openInNewTab !== false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Update component
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: { ...localData.value }
    });
    store.isDirty = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.booking-calendar-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gmkb-spacing-md, 16px) 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
}

.editor-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 24px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.tab-btn.active {
  color: #3b82f6;
  background: white;
  border-bottom-color: #3b82f6;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  background: #f9fafb;
}

.tab-panel {
  padding: 20px;
}

.editor-section {
  background: white;
  border-radius: 8px;
  padding: var(--gmkb-spacing-md, 16px);
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.editor-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-group {
  margin-bottom: 16px;
}

.field-group:last-child {
  margin-bottom: 0;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.field-group input,
.field-group textarea,
.field-group select {
  width: 100%;
  padding: var(--gmkb-spacing-sm, 8px) 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.field-group input:focus,
.field-group textarea:focus,
.field-group select:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-group textarea {
  resize: vertical;
  font-family: inherit;
}

/* Scrollbar styling */
.editor-content::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.editor-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
