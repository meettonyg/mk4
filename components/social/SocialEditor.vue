<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Social Links"
    :show-typography="false"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @close="handleClose"
  >
    <!-- Content Tab -->
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Section Settings</h4>
          
          <div class="field-group">
            <label for="social-title">Section Title</label>
            <input 
              id="social-title"
              v-model="displaySettings.title" 
              @input="updateDisplaySettings"
              type="text"
              placeholder="e.g., Connect With Me"
            />
          </div>
          
          <div class="field-group">
            <label for="social-description">Description</label>
            <textarea 
              id="social-description"
              v-model="displaySettings.description" 
              @input="updateDisplaySettings"
              rows="2"
              placeholder="Optional description..."
            />
          </div>
        </section>
        
        <section class="editor-section">
          <div class="section-header">
            <h4>Social Networks</h4>
            <div class="section-actions">
              <button
                v-if="hasProfileData"
                type="button"
                class="profile-load-btn"
                @click="handleLoadFromProfile"
                title="Load social links from your profile"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Load from Profile
              </button>
            </div>
          </div>

          <div class="social-network" v-for="(network, key) in socialNetworks" :key="key">
            <div class="network-header">
              <span class="network-icon">{{ network.icon }}</span>
              <span class="network-name">{{ network.name }}</span>
            </div>
            <input
              v-model="socialUrls[key]"
              @input="updateSocialUrl(key)"
              :placeholder="network.placeholder"
              type="url"
            />
          </div>

          <!-- Save to Profile button -->
          <div v-if="canSaveToProfile" class="section-footer">
            <button
              type="button"
              class="profile-save-btn profile-save-btn--full"
              :class="{ 'is-saving': isSaving }"
              :disabled="isSaving || !hasSocialLinks"
              @click="handleSaveToProfile"
              title="Save social links to your profile"
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

        <section class="editor-section">
          <h4>Display Options</h4>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="displaySettings.showLabels" 
                @change="updateDisplaySettings"
              />
              Show Network Names
            </label>
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
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
} = useProfilePrePopulation('social');

const socialNetworks = {
  facebook: { name: 'Facebook', icon: '👤', placeholder: 'https://facebook.com/username' },
  twitter: { name: 'Twitter/X', icon: '🐦', placeholder: 'https://twitter.com/username' },
  linkedin: { name: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/username' },
  instagram: { name: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/instagram' },
  youtube: { name: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/@channel' },
  tiktok: { name: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@username' },
  pinterest: { name: 'Pinterest', icon: '📌', placeholder: 'https://pinterest.com/username' }
};

// Data from component JSON state (single source of truth)
const socialUrls = ref({
  facebook: '',
  twitter: '',
  linkedin: '',
  instagram: '',
  youtube: '',
  tiktok: '',
  pinterest: ''
});

const displaySettings = ref({
  title: 'Connect With Me',
  description: '',
  showLabels: false
});

// Check if any social links are filled
const hasSocialLinks = computed(() => {
  return Object.values(socialUrls.value).some(url => url && url.trim());
});

// Load data from profile
const handleLoadFromProfile = () => {
  const profileData = getPrePopulatedData();
  if (profileData.linkedin) socialUrls.value.linkedin = profileData.linkedin;
  if (profileData.twitter) socialUrls.value.twitter = profileData.twitter;
  if (profileData.facebook) socialUrls.value.facebook = profileData.facebook;
  if (profileData.instagram) socialUrls.value.instagram = profileData.instagram;
  if (profileData.youtube) socialUrls.value.youtube = profileData.youtube;
  if (profileData.tiktok) socialUrls.value.tiktok = profileData.tiktok;
  updateDisplaySettings();
};

// Save data to profile
const handleSaveToProfile = async () => {
  const socialData = {};
  for (const [key, url] of Object.entries(socialUrls.value)) {
    if (url && url.trim()) {
      socialData[key] = url.trim();
    }
  }

  const result = await saveToProfile(socialData);

  if (result.success) {
    console.log('[SocialEditor] ✅ Social links saved to profile');
  } else {
    console.error('[SocialEditor] ❌ Failed to save social links:', result.errors);
  }
};

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];

  if (component && component.data) {
    displaySettings.value = {
      title: component.data.title || 'Connect With Me',
      description: component.data.description || '',
      showLabels: component.data.showLabels !== undefined ? component.data.showLabels : false
    };

    // Load social URLs from component data
    socialUrls.value = {
      facebook: component.data.facebook || '',
      twitter: component.data.twitter || '',
      linkedin: component.data.linkedin || '',
      instagram: component.data.instagram || '',
      youtube: component.data.youtube || '',
      tiktok: component.data.tiktok || '',
      pinterest: component.data.pinterest || ''
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

onMounted(() => {
  loadComponentData();
});

// Build links array from individual social URLs (for renderer compatibility)
const buildLinksArray = () => {
  const links = [];
  for (const [platform, url] of Object.entries(socialUrls.value)) {
    if (url && url.trim()) {
      links.push({ platform, url: url.trim() });
    }
  }
  return links;
};

// Update social URL in component data
let urlUpdateTimeout = null;
const updateSocialUrl = (fieldKey) => {
  if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);

  urlUpdateTimeout = setTimeout(() => {
    const component = store.components[props.componentId];
    store.updateComponent(props.componentId, {
      data: {
        ...component.data,
        ...displaySettings.value,
        ...socialUrls.value,
        links: buildLinksArray() // Add links array for renderer
      }
    });
    store.isDirty = true;
    console.log(`Updated social URL: ${fieldKey} = ${socialUrls.value[fieldKey]}`);
  }, 300);
};

// Update display settings
let displayUpdateTimeout = null;
const updateDisplaySettings = () => {
  if (displayUpdateTimeout) clearTimeout(displayUpdateTimeout);

  displayUpdateTimeout = setTimeout(() => {
    const component = store.components[props.componentId];
    store.updateComponent(props.componentId, {
      data: {
        ...component.data,
        ...displaySettings.value,
        ...socialUrls.value,
        links: buildLinksArray() // Add links array for renderer
      }
    });
    store.isDirty = true;
    console.log('Updated display settings:', displaySettings.value);
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

.editor-note {
  background: #f0f9ff;
  border-left: 3px solid #3b82f6;
  padding: 12px;
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #1e40af;
  border-radius: 4px;
}

body.dark-mode .editor-note {
  background: #1e3a5f;
  color: #93c5fd;
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

.field-group input,
.field-group select,
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
body.dark-mode .field-group select,
body.dark-mode .field-group textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f3f4f6;
}

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.field-group textarea {
  resize: vertical;
  min-height: 60px;
}

.social-network {
  margin-bottom: 16px;
}

.social-network:last-child {
  margin-bottom: 0;
}

.network-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.network-icon {
  font-size: 18px;
}

.network-name {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

body.dark-mode .network-name {
  color: #94a3b8;
}

.social-network input {
  width: 100%;
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
