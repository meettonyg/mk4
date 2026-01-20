<template>
  <div v-if="isLoggedIn && showSelector" class="gfy-profile-selector-container">
    <label class="gfy-profile-label">{{ label }}</label>
    <div class="gfy-profile-selector-row">
      <select
        v-model="localSelectedId"
        class="gfy-profile-select"
        @change="handleSelect"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option
          v-for="profile in profiles"
          :key="profile.id"
          :value="profile.id"
        >
          {{ profile.title }}{{ profile.guest_title ? ` — ${profile.guest_title}` : '' }}
        </option>
        <option v-if="showCreateNew" value="new">+ Create New Profile</option>
      </select>
      <a
        v-if="hasSelectedProfile && selectedProfile"
        :href="editProfileUrl"
        class="gfy-profile-link"
        title="Edit this profile"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Edit Profile
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStandaloneProfile } from '../../src/composables/useStandaloneProfile';

const props = defineProps({
  /**
   * Label text for the selector
   */
  label: {
    type: String,
    default: 'Pre-fill from Profile:'
  },
  /**
   * Placeholder text for empty state
   */
  placeholder: {
    type: String,
    default: 'Select a guest profile to pre-fill...'
  },
  /**
   * URL to redirect when creating a new profile
   */
  newProfileUrl: {
    type: String,
    default: '/profile/new/'
  },
  /**
   * Whether to show "Create New Profile" option
   */
  showCreateNew: {
    type: Boolean,
    default: true
  },
  /**
   * Model value for two-way binding
   */
  modelValue: {
    type: [String, Number],
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'profile-selected', 'profile-cleared', 'create-new']);

// Use the standalone profile composable
const {
  isLoggedIn,
  profiles,
  selectedProfileId,
  profileData,
  hasSelectedProfile,
  selectedProfile,
  loadProfiles,
  selectProfile
} = useStandaloneProfile();

// Local state
const localSelectedId = ref(props.modelValue || '');

// Computed
const showSelector = computed(() => profiles.value.length > 0);

const editProfileUrl = computed(() => {
  if (!selectedProfile.value) return '';
  return selectedProfile.value.editUrl || `/app/profiles/guest/profile/?entry=${selectedProfile.value.slug}`;
});

// Handle profile selection
async function handleSelect() {
  if (!localSelectedId.value) {
    emit('profile-cleared');
    return;
  }

  if (localSelectedId.value === 'new') {
    emit('create-new');
    window.location.href = props.newProfileUrl;
    return;
  }

  // Update the composable
  await selectProfile(localSelectedId.value);

  // Emit events
  emit('update:modelValue', localSelectedId.value);
  emit('profile-selected', {
    id: localSelectedId.value,
    profile: selectedProfile.value,
    data: profileData.value
  });
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newVal) => {
  if (newVal !== localSelectedId.value) {
    localSelectedId.value = newVal;
  }
});

// Watch for profile data changes from composable
watch(profileData, (newData) => {
  if (newData) {
    emit('profile-selected', {
      id: selectedProfileId.value,
      profile: selectedProfile.value,
      data: newData
    });
  }
});

// Load profiles on mount
onMounted(async () => {
  if (isLoggedIn.value) {
    await loadProfiles();
  }
});

// Expose for parent components
defineExpose({
  profiles,
  selectedProfile,
  profileData,
  isLoggedIn,
  hasSelectedProfile,
  loadProfiles,
  selectProfile
});
</script>

<style scoped>
.gfy-profile-selector-container {
  padding: 16px 20px;
  background: var(--gfy-bg-page, #F9FAFB);
  border-bottom: 1px solid var(--gfy-border, #E5E7EB);
}

.gfy-profile-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gfy-text-secondary, #4B5563);
  margin-bottom: 8px;
}

.gfy-profile-selector-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gfy-profile-select {
  flex: 1;
  padding: 10px 14px;
  font-size: 0.9375rem;
  border: 1px solid var(--gfy-border, #E5E7EB);
  border-radius: var(--gfy-radius-sm, 8px);
  background: var(--gfy-bg-surface, #ffffff);
  color: var(--gfy-text-main, #111827);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-profile-select:hover {
  border-color: var(--gfy-border-light, #D1D5DB);
}

.gfy-profile-select:focus {
  outline: none;
  border-color: var(--gfy-primary, #4F46E5);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.gfy-profile-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gfy-primary, #4F46E5);
  background: transparent;
  border: 1px solid var(--gfy-primary, #4F46E5);
  border-radius: var(--gfy-radius-sm, 8px);
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s;
}

.gfy-profile-link:hover {
  background: var(--gfy-primary-light, #EEF2FF);
  color: var(--gfy-primary-hover, #4338CA);
}

.gfy-profile-link svg {
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .gfy-profile-selector-row {
    flex-direction: column;
    align-items: stretch;
  }

  .gfy-profile-link {
    justify-content: center;
  }
}
</style>
