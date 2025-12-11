<template>
  <div class="profile-selector" :class="{ 'profile-selector--inline': mode === 'inline' }">
    <!-- Loading State -->
    <div v-if="isLoading" class="profile-selector__loading">
      <span class="profile-selector__spinner"></span>
      <span>Loading profiles...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="profile-selector__error">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{{ error }}</span>
      <button type="button" @click="loadProfiles" class="profile-selector__retry">Retry</button>
    </div>

    <!-- No Profiles State -->
    <div v-else-if="profiles.length === 0" class="profile-selector__empty">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span>No profiles found</span>
      <a v-if="createProfileUrl" :href="createProfileUrl" class="profile-selector__create">
        Create Profile
      </a>
    </div>

    <!-- Dropdown Mode -->
    <div v-else-if="mode === 'dropdown'" class="profile-selector__dropdown">
      <label v-if="showLabel" class="profile-selector__label">
        {{ label }}
      </label>
      <select
        v-model="selectedId"
        @change="handleSelect"
        class="profile-selector__select"
        :disabled="disabled"
      >
        <option v-if="placeholder" :value="null" disabled>{{ placeholder }}</option>
        <option
          v-for="profile in profiles"
          :key="profile.id"
          :value="profile.id"
        >
          {{ profile.title || profile.name || `Profile #${profile.id}` }}
        </option>
      </select>
    </div>

    <!-- Inline Card Mode -->
    <div v-else class="profile-selector__cards">
      <label v-if="showLabel" class="profile-selector__label">
        {{ label }}
      </label>
      <div class="profile-selector__grid">
        <button
          v-for="profile in profiles"
          :key="profile.id"
          type="button"
          class="profile-selector__card"
          :class="{ 'profile-selector__card--selected': selectedId === profile.id }"
          @click="handleCardClick(profile.id)"
          :disabled="disabled"
        >
          <div class="profile-selector__avatar">
            <img
              v-if="profile.avatar || profile.headshot"
              :src="profile.avatar || profile.headshot"
              :alt="profile.title || profile.name"
            />
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="profile-selector__info">
            <span class="profile-selector__name">
              {{ profile.title || profile.name || `Profile #${profile.id}` }}
            </span>
            <span v-if="profile.status" class="profile-selector__status" :class="`profile-selector__status--${profile.status}`">
              {{ profile.status }}
            </span>
          </div>
          <div v-if="selectedId === profile.id" class="profile-selector__check">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- Currently Selected Info (when in context) -->
    <div v-if="showCurrentProfile && currentProfile" class="profile-selector__current">
      <span class="profile-selector__current-label">Saving to:</span>
      <span class="profile-selector__current-name">{{ currentProfile.title || currentProfile.name }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import profileContextService from '../../../services/ProfileContextService.js';

const props = defineProps({
  mode: {
    type: String,
    default: 'dropdown', // 'dropdown' | 'inline'
    validator: (v) => ['dropdown', 'inline'].includes(v)
  },
  label: {
    type: String,
    default: 'Select Profile'
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: String,
    default: 'Choose a profile...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Number,
    default: null
  },
  autoLoad: {
    type: Boolean,
    default: true
  },
  showCurrentProfile: {
    type: Boolean,
    default: false
  },
  createProfileUrl: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'select', 'loaded']);

// State
const profiles = ref([]);
const isLoading = ref(false);
const error = ref(null);
const selectedId = ref(props.modelValue);

// Get reactive state from service
const { currentProfileId } = profileContextService.getReactiveState();

// Computed
const currentProfile = computed(() => {
  if (!selectedId.value) return null;
  return profiles.value.find(p => p.id === selectedId.value);
});

// Methods
const loadProfiles = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    profiles.value = await profileContextService.fetchUserProfiles();

    // If no selection and we have a context profile, use it
    if (!selectedId.value && currentProfileId.value) {
      selectedId.value = currentProfileId.value;
    }

    // If still no selection and only one profile, auto-select
    if (!selectedId.value && profiles.value.length === 1) {
      selectedId.value = profiles.value[0].id;
      handleSelect();
    }

    emit('loaded', profiles.value);

  } catch (e) {
    error.value = e.message || 'Failed to load profiles';
  } finally {
    isLoading.value = false;
  }
};

const handleSelect = () => {
  emit('update:modelValue', selectedId.value);
  emit('select', selectedId.value);
  profileContextService.setActiveProfile(selectedId.value);
};

const handleCardClick = (profileId) => {
  selectedId.value = profileId;
  handleSelect();
};

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  selectedId.value = newVal;
});

// Watch context changes
watch(currentProfileId, (newVal) => {
  if (newVal && !selectedId.value) {
    selectedId.value = newVal;
  }
});

// Lifecycle
onMounted(() => {
  if (props.autoLoad) {
    loadProfiles();
  }
});

// Expose methods for parent components
defineExpose({
  loadProfiles,
  profiles
});
</script>

<style scoped>
.profile-selector {
  --ps-primary: #6366f1;
  --ps-primary-hover: #4f46e5;
  --ps-text: #1e293b;
  --ps-text-secondary: #64748b;
  --ps-border: #e2e8f0;
  --ps-bg: #ffffff;
  --ps-bg-secondary: #f8fafc;
  --ps-radius: 8px;
  --ps-success: #10b981;
  --ps-error: #ef4444;
}

/* Loading */
.profile-selector__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  color: var(--ps-text-secondary);
  font-size: 14px;
}

.profile-selector__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--ps-border);
  border-top-color: var(--ps-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.profile-selector__error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--ps-radius);
  color: var(--ps-error);
  font-size: 14px;
}

.profile-selector__retry {
  margin-left: auto;
  padding: 4px 12px;
  font-size: 13px;
  color: var(--ps-error);
  background: white;
  border: 1px solid currentColor;
  border-radius: 4px;
  cursor: pointer;
}

/* Empty */
.profile-selector__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: var(--ps-text-secondary);
  text-align: center;
}

.profile-selector__create {
  margin-top: 8px;
  padding: 8px 16px;
  font-size: 14px;
  color: white;
  background: var(--ps-primary);
  border-radius: var(--ps-radius);
  text-decoration: none;
}

/* Label */
.profile-selector__label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ps-text);
}

/* Dropdown */
.profile-selector__select {
  width: 100%;
  padding: 10px 36px 10px 12px;
  font-size: 14px;
  color: var(--ps-text);
  background: var(--ps-bg);
  border: 1px solid var(--ps-border);
  border-radius: var(--ps-radius);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 10px center;
  background-repeat: no-repeat;
  background-size: 20px;
}

.profile-selector__select:focus {
  outline: none;
  border-color: var(--ps-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.profile-selector__select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Cards Grid */
.profile-selector__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.profile-selector__card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--ps-bg);
  border: 2px solid var(--ps-border);
  border-radius: var(--ps-radius);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.profile-selector__card:hover:not(:disabled) {
  border-color: var(--ps-primary);
  background: var(--ps-bg-secondary);
}

.profile-selector__card--selected {
  border-color: var(--ps-primary);
  background: rgba(99, 102, 241, 0.05);
}

.profile-selector__card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.profile-selector__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--ps-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  color: var(--ps-text-secondary);
}

.profile-selector__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-selector__info {
  flex: 1;
  min-width: 0;
}

.profile-selector__name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--ps-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-selector__status {
  display: inline-block;
  margin-top: 2px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  border-radius: 4px;
}

.profile-selector__status--publish {
  color: var(--ps-success);
  background: rgba(16, 185, 129, 0.1);
}

.profile-selector__status--draft {
  color: var(--ps-text-secondary);
  background: var(--ps-bg-secondary);
}

.profile-selector__check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ps-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Current Profile Info */
.profile-selector__current {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--ps-radius);
  font-size: 13px;
}

.profile-selector__current-label {
  color: var(--ps-text-secondary);
}

.profile-selector__current-name {
  font-weight: 500;
  color: var(--ps-primary);
}

/* Inline Mode */
.profile-selector--inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.profile-selector--inline .profile-selector__label {
  margin-bottom: 0;
}

.profile-selector--inline .profile-selector__select {
  width: auto;
  min-width: 180px;
}
</style>
