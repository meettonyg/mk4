<template>
  <div v-if="isLoggedIn" class="profile-context-banner" :class="{ 'profile-context-banner--loading': isLoadingProfiles }">
    <!-- Loading State -->
    <div v-if="isLoadingProfiles" class="profile-context-banner__loading">
      <span class="profile-context-banner__spinner"></span>
      <span>Loading your profiles...</span>
    </div>

    <!-- No Profiles State -->
    <div v-else-if="!hasProfiles" class="profile-context-banner__empty">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span>No profiles found.</span>
      <a href="/app/profiles/" class="profile-context-banner__create">Create a Profile</a>
    </div>

    <!-- Profile Selector -->
    <div v-else class="profile-context-banner__content">
      <div class="profile-context-banner__info">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span class="profile-context-banner__label">
          {{ hasSelectedProfile ? 'Working on:' : 'Select a profile to pre-fill your data:' }}
        </span>
      </div>

      <div class="profile-context-banner__selector">
        <select
          v-model="selectedId"
          @change="handleProfileChange"
          class="profile-context-banner__select"
          :disabled="isLoadingProfile"
        >
          <option :value="null">-- Select a profile --</option>
          <option
            v-for="profile in profiles"
            :key="profile.id"
            :value="profile.id"
          >
            {{ getProfileDisplayName(profile) }}
          </option>
        </select>

        <!-- Loading indicator -->
        <span v-if="isLoadingProfile" class="profile-context-banner__loading-indicator">
          <span class="profile-context-banner__spinner profile-context-banner__spinner--small"></span>
        </span>
      </div>

      <!-- Selected Profile Info -->
      <div v-if="hasSelectedProfile && selectedProfile" class="profile-context-banner__selected">
        <div class="profile-context-banner__avatar">
          <img
            v-if="selectedProfile.avatar || selectedProfile.headshot"
            :src="selectedProfile.avatar || selectedProfile.headshot"
            :alt="selectedProfile.title"
          />
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <a
          v-if="selectedProfile.editUrl || selectedProfile.edit_url"
          :href="selectedProfile.editUrl || selectedProfile.edit_url"
          class="profile-context-banner__details-link"
          target="_blank"
          title="View Profile"
        >
          <strong>{{ selectedProfile.title || selectedProfile.name }}</strong>
          <span v-if="selectedProfile.completeness" class="profile-context-banner__completeness">
            {{ selectedProfile.completeness }}% complete
          </span>
        </a>
        <div v-else class="profile-context-banner__details">
          <strong>{{ selectedProfile.title || selectedProfile.name }}</strong>
          <span v-if="selectedProfile.completeness" class="profile-context-banner__completeness">
            {{ selectedProfile.completeness }}% complete
          </span>
        </div>
        <div class="profile-context-banner__actions">
          <a
            v-if="selectedProfile.editUrl || selectedProfile.edit_url"
            :href="selectedProfile.editUrl || selectedProfile.edit_url"
            class="profile-context-banner__link"
            target="_blank"
            title="Edit Profile"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </a>
          <button
            type="button"
            class="profile-context-banner__clear"
            @click="handleClear"
            title="Clear selection"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Pre-fill Notice -->
    <div v-if="hasSelectedProfile && showDataNotice" class="profile-context-banner__notice">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>Fields pre-filled from your profile. Generated content can be saved back to your profile.</span>
      <button type="button" class="profile-context-banner__dismiss" @click="showDataNotice = false">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useStandaloneProfile } from '../../src/composables/useStandaloneProfile';

const emit = defineEmits(['profile-selected', 'profile-cleared', 'profile-loaded']);

const {
  isLoggedIn,
  profiles,
  selectedProfileId,
  profileData,
  isLoadingProfiles,
  isLoadingProfile,
  hasProfiles,
  hasSelectedProfile,
  selectedProfile,
  loadProfiles,
  selectProfile,
  clearProfile
} = useStandaloneProfile();

// Local state
const selectedId = ref(null);
const showDataNotice = ref(true);

/**
 * Get display name for profile dropdown
 * Shows tagline or ID to distinguish profiles with same name
 */
const getProfileDisplayName = (profile) => {
  const name = profile.title || profile.name || `Profile #${profile.id}`;

  // If tagline exists, append it
  if (profile.tagline) {
    const shortTagline = profile.tagline.length > 30
      ? profile.tagline.substring(0, 30) + '...'
      : profile.tagline;
    return `${name} — ${shortTagline}`;
  }

  // Otherwise append ID to distinguish duplicates
  return `${name} (#${profile.id})`;
};

/**
 * Handle profile selection change
 */
const handleProfileChange = async () => {
  if (selectedId.value) {
    await selectProfile(selectedId.value);
    emit('profile-selected', {
      profileId: selectedId.value,
      profile: selectedProfile.value,
      data: profileData.value
    });
    showDataNotice.value = true;
  } else {
    clearProfile();
    emit('profile-cleared');
  }
};

/**
 * Handle clear button
 */
const handleClear = () => {
  selectedId.value = null;
  clearProfile();
  emit('profile-cleared');
};

// Sync selectedId with composable
watch(selectedProfileId, (newVal) => {
  selectedId.value = newVal;
});

// Emit loaded event when profile data is available
// Include the profile ID explicitly since API response may not include it
watch(profileData, (newData) => {
  if (newData) {
    emit('profile-loaded', { ...newData, id: selectedId.value });
  }
});
</script>

<style scoped>
.profile-context-banner {
  --pcb-primary: #6366f1;
  --pcb-primary-light: rgba(99, 102, 241, 0.1);
  --pcb-success: #10b981;
  --pcb-success-light: rgba(16, 185, 129, 0.1);
  --pcb-text: #1e293b;
  --pcb-text-secondary: #64748b;
  --pcb-border: #e2e8f0;
  --pcb-bg: #f8fafc;
  --pcb-radius: 8px;

  background: var(--pcb-bg);
  border: 1px solid var(--pcb-border);
  border-radius: var(--pcb-radius);
  padding: 12px 16px;
  margin-bottom: 20px;
}

/* Loading */
.profile-context-banner__loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--pcb-text-secondary);
  font-size: 14px;
}

.profile-context-banner__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--pcb-border);
  border-top-color: var(--pcb-primary);
  border-radius: 50%;
  animation: pcb-spin 0.8s linear infinite;
}

.profile-context-banner__spinner--small {
  width: 14px;
  height: 14px;
}

@keyframes pcb-spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.profile-context-banner__empty {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--pcb-text-secondary);
  font-size: 14px;
}

.profile-context-banner__create {
  margin-left: auto;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  background: var(--pcb-primary);
  border-radius: 6px;
  text-decoration: none;
  transition: background 0.15s;
}

.profile-context-banner__create:hover {
  background: #4f46e5;
}

/* Content */
.profile-context-banner__content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.profile-context-banner__info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--pcb-text-secondary);
  font-size: 14px;
}

.profile-context-banner__label {
  font-weight: 500;
}

/* Selector */
.profile-context-banner__selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-context-banner__select {
  padding: 8px 32px 8px 12px;
  font-size: 14px;
  color: var(--pcb-text);
  background: white;
  border: 1px solid var(--pcb-border);
  border-radius: 6px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 18px;
  min-width: 200px;
}

.profile-context-banner__select:focus {
  outline: none;
  border-color: var(--pcb-primary);
  box-shadow: 0 0 0 3px var(--pcb-primary-light);
}

.profile-context-banner__select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.profile-context-banner__loading-indicator {
  display: flex;
  align-items: center;
}

/* Selected Profile */
.profile-context-banner__selected {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  padding: 6px 12px;
  background: white;
  border: 1px solid var(--pcb-border);
  border-radius: 6px;
}

.profile-context-banner__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--pcb-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--pcb-text-secondary);
}

.profile-context-banner__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-context-banner__details,
.profile-context-banner__details-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-context-banner__details-link {
  text-decoration: none;
  border-radius: 4px;
  padding: 4px 8px;
  margin: -4px -8px;
  transition: background 0.15s;
}

.profile-context-banner__details-link:hover {
  background: var(--pcb-primary-light);
}

.profile-context-banner__details strong,
.profile-context-banner__details-link strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--pcb-text);
}

.profile-context-banner__details-link:hover strong {
  color: var(--pcb-primary);
}

.profile-context-banner__completeness {
  font-size: 12px;
  color: var(--pcb-success);
}

.profile-context-banner__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.profile-context-banner__link,
.profile-context-banner__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  color: var(--pcb-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
}

.profile-context-banner__link:hover {
  color: var(--pcb-primary);
  background: var(--pcb-primary-light);
}

.profile-context-banner__clear:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* Notice */
.profile-context-banner__notice {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--pcb-success-light);
  border-radius: 6px;
  font-size: 13px;
  color: #065f46;
}

.profile-context-banner__notice svg {
  flex-shrink: 0;
  color: var(--pcb-success);
}

.profile-context-banner__dismiss {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #065f46;
  opacity: 0.6;
}

.profile-context-banner__dismiss:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}

/* Responsive */
@media (max-width: 640px) {
  .profile-context-banner__content {
    flex-direction: column;
    align-items: stretch;
  }

  .profile-context-banner__selected {
    margin-left: 0;
  }

  .profile-context-banner__select {
    width: 100%;
    min-width: 0;
  }
}
</style>
