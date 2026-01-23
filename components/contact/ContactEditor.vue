<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Contact"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @close="handleClose"
  >
    <!-- Content Tab -->
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Section Content</h4>
          
          <div class="field-group">
            <label for="contact-title">Section Title</label>
            <input 
              id="contact-title"
              v-model="localData.title" 
              @input="updateComponent"
              type="text"
              placeholder="e.g., Get in Touch"
            />
          </div>
          
          <div class="field-group">
            <label for="contact-description">Description</label>
            <textarea 
              id="contact-description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="3"
              placeholder="Brief introduction text..."
            />
          </div>
        </section>

        <section class="editor-section">
          <div class="section-header">
            <h4>Contact Information</h4>
            <div class="section-actions">
              <button
                v-if="hasProfileData"
                type="button"
                class="profile-load-btn"
                @click="handleLoadFromProfile"
                title="Load contact info from your profile"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Load from Profile
              </button>
            </div>
          </div>

          <div class="field-group">
            <label for="contact-email">Email</label>
            <input 
              id="contact-email"
              v-model="localData.email" 
              @input="updateComponent"
              type="email"
              placeholder="contact@example.com"
            />
          </div>
          
          <div class="field-group">
            <label for="contact-phone">Phone</label>
            <input 
              id="contact-phone"
              v-model="localData.phone" 
              @input="updateComponent"
              type="tel"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div class="field-group">
            <label for="contact-skype">Skype</label>
            <input 
              id="contact-skype"
              v-model="localData.skype" 
              @input="updateComponent"
              type="text"
              placeholder="skype_username"
            />
          </div>
          
          <div class="field-group">
            <label for="contact-location">Location</label>
            <textarea
              id="contact-location"
              v-model="localData.location"
              @input="updateComponent"
              rows="2"
              placeholder="123 Main St, City, State 12345"
            />
          </div>

          <!-- Save to Profile button -->
          <div v-if="canSaveToProfile" class="section-footer">
            <button
              type="button"
              class="profile-save-btn profile-save-btn--full"
              :class="{ 'is-saving': isSaving }"
              :disabled="isSaving || (!localData.email && !localData.phone && !localData.location)"
              @click="handleSaveToProfile"
              title="Save contact info to your profile"
            >
              <svg v-if="!isSaving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              {{ isSaving ? 'Saving...' : 'Save to Profile' }}
            </button>
          </div>
        </section>


      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import ComponentEditorTemplate from '../../src/vue/components/sidebar/editors/ComponentEditorTemplate.vue';
import { useProfilePrePopulation } from '@composables/useProfilePrePopulation';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);

const store = useMediaKitStore();

// Active tab state
const activeTab = ref('content');

// Profile pre-population and save
const {
  hasProfileData,
  getPrePopulatedData,
  canSaveToProfile,
  isSaving,
  saveToProfile
} = useProfilePrePopulation('contact');

// Local data state
const localData = ref({
  title: 'Get in Touch',
  description: '',
  email: '',
  phone: '',
  skype: '',
  location: ''
});

// Load data from profile
const handleLoadFromProfile = () => {
  const profileData = getPrePopulatedData();
  if (profileData.email) localData.value.email = profileData.email;
  if (profileData.phone) localData.value.phone = profileData.phone;
  if (profileData.skype) localData.value.skype = profileData.skype;
  if (profileData.location) localData.value.location = profileData.location;
  updateComponent();
};

// Save data to profile
const handleSaveToProfile = async () => {
  const contactData = {
    email: localData.value.email || '',
    phone: localData.value.phone || '',
    skype: localData.value.skype || '',
    location: localData.value.location || ''
  };

  const result = await saveToProfile(contactData);

  if (result.success) {
    console.log('[ContactEditor] ✅ Contact info saved to profile');
  } else {
    console.error('[ContactEditor] ❌ Failed to save contact info:', result.errors);
  }
};

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'Get in Touch',
      description: component.data.description || '',
      email: component.data.email || '',
      phone: component.data.phone || '',
      skype: component.data.skype || '',
      location: component.data.location || component.data.address || ''
    };
  }
};

// Watch both componentId AND store component data for changes
// This ensures data is loaded even if the store initializes after the editor mounts
watch(
  () => [props.componentId, store.components[props.componentId]?.data],
  () => {
    loadComponentData();
  },
  { immediate: true, deep: true }
);

// Update component with debouncing
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

// Handle close button
const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.content-fields {
  padding: 20px;
}

.editor-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

body.dark-mode .editor-section {
  background: #1e293b;
  border-color: #334155;
}

.editor-section:last-child {
  margin-bottom: 0;
}

.editor-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

body.dark-mode .editor-section h4 {
  color: #94a3b8;
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

body.dark-mode .field-group label {
  color: #94a3b8;
}

.field-group input[type="text"],
.field-group input[type="email"],
.field-group input[type="tel"],
.field-group input[type="url"],
.field-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #1f2937;
  transition: all 0.2s;
  font-family: inherit;
}

body.dark-mode .field-group input,
body.dark-mode .field-group textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f3f4f6;
}

.field-group input:focus,
.field-group textarea:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.field-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* Section Header with Action Buttons */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.profile-load-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-load-btn:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.profile-load-btn svg {
  flex-shrink: 0;
}

body.dark-mode .profile-load-btn {
  color: #34d399;
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.25);
}

/* Section Footer with Save Button */
.section-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

body.dark-mode .section-footer {
  border-top-color: #334155;
}

.profile-save-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-save-btn:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
}

.profile-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.profile-save-btn.is-saving {
  opacity: 0.7;
}

.profile-save-btn svg {
  flex-shrink: 0;
}

.profile-save-btn svg.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

body.dark-mode .profile-save-btn {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.25);
}

.profile-save-btn--full {
  width: 100%;
  justify-content: center;
  padding: 10px 16px;
  font-size: 14px;
}
</style>
