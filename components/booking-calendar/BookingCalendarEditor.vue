<template>
  <div class="booking-calendar-editor">
    <div class="editor-header">
      <h3>Edit Booking Calendar</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Calendar Title -->
      <div class="field-group">
        <label for="calendar-title">Calendar Title</label>
        <input 
          id="calendar-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., Schedule a Meeting"
        >
      </div>
      
      <!-- Calendar Type -->
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
      
      <!-- Calendar URL/Embed -->
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
      
      <!-- Description -->
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
      
      <!-- Availability Settings -->
      <div class="field-group">
        <label>Availability</label>
        <div class="availability-fields">
          <input 
            v-model="localData.duration" 
            @input="updateComponent"
            placeholder="Meeting duration (e.g., 30 min)"
            class="availability-field"
          >
          <input 
            v-model="localData.timezone" 
            @input="updateComponent"
            placeholder="Timezone (e.g., EST, PST)"
            class="availability-field"
          >
        </div>
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
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
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const store = useMediaKitStore();
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
    store.hasUnsavedChanges = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.booking-calendar-editor {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.editor-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.editor-fields {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.field-group {
  margin-bottom: 20px;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 13px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-group input,
.field-group textarea,
.field-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.availability-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.availability-field {
  margin: 0 !important;
}

.advanced-section {
  margin-top: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.advanced-section summary {
  cursor: pointer;
  font-weight: 500;
  color: #475569;
  font-size: 14px;
  user-select: none;
}
</style>
