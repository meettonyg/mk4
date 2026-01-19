<template>
  <Teleport to="body">
    <div v-if="isOpen" class="gmkb-profile-modal-overlay" @click.self="handleClose">
      <div class="gmkb-profile-modal">
        <div class="gmkb-profile-modal__header">
          <h2>{{ title }}</h2>
          <button class="gmkb-profile-modal__close" @click="handleClose" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="gmkb-profile-modal__content">
          <p v-if="subtitle" class="gmkb-profile-modal__subtitle">{{ subtitle }}</p>

          <!-- Loading state -->
          <div v-if="isLoading" class="gmkb-profile-modal__loading">
            <div class="gmkb-profile-modal__spinner"></div>
            <span>Loading profiles...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="gmkb-profile-modal__error">
            <p>{{ error }}</p>
            <button @click="fetchProfiles" class="gmkb-profile-modal__retry">Try Again</button>
          </div>

          <!-- Profiles list -->
          <div v-else class="gmkb-profile-modal__list">
            <button
              v-for="profile in profiles"
              :key="profile.id"
              class="gmkb-profile-modal__item"
              :class="{ 'gmkb-profile-modal__item--selected': selectedProfileId === profile.id }"
              @click="selectProfile(profile)"
            >
              <div class="gmkb-profile-modal__avatar">
                <img v-if="profile.headshot" :src="profile.headshot" :alt="profile.name" />
                <span v-else class="gmkb-profile-modal__initials">{{ getInitials(profile.name) }}</span>
              </div>
              <div class="gmkb-profile-modal__info">
                <h4>{{ profile.name || 'Unnamed Profile' }}</h4>
                <p v-if="profile.guest_title" class="gmkb-profile-modal__title">{{ profile.guest_title }}</p>
                <p v-if="profile.tagline">{{ profile.tagline }}</p>
                <span class="gmkb-profile-modal__meta">
                  {{ profile.completion || 0 }}% complete
                  <span v-if="profile.updated_at"> · Updated {{ formatDate(profile.updated_at) }}</span>
                </span>
              </div>
              <div class="gmkb-profile-modal__check" v-if="selectedProfileId === profile.id">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10L8 14L16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </button>

            <!-- Start Fresh option -->
            <button
              class="gmkb-profile-modal__item gmkb-profile-modal__item--fresh"
              :class="{ 'gmkb-profile-modal__item--selected': selectedProfileId === null }"
              @click="selectFresh"
            >
              <div class="gmkb-profile-modal__avatar gmkb-profile-modal__avatar--fresh">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="gmkb-profile-modal__info">
                <h4>Start Fresh</h4>
                <p>Use template placeholders, fill in details manually</p>
              </div>
              <div class="gmkb-profile-modal__check" v-if="selectedProfileId === null && hasSelected">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10L8 14L16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <div class="gmkb-profile-modal__footer">
          <button class="gmkb-profile-modal__btn gmkb-profile-modal__btn--secondary" @click="handleClose">
            Cancel
          </button>
          <button
            class="gmkb-profile-modal__btn gmkb-profile-modal__btn--primary"
            @click="confirmSelection"
            :disabled="!hasSelected || isApplying"
          >
            <span v-if="isApplying">Applying...</span>
            <span v-else>{{ confirmButtonText }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';

export default {
  name: 'ProfileSelectorModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Choose a Profile'
    },
    subtitle: {
      type: String,
      default: 'Select a profile to pre-populate your media kit with your existing data.'
    },
    confirmButtonText: {
      type: String,
      default: 'Use This Profile'
    },
    allowClose: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close', 'select', 'select-fresh'],
  setup(props, { emit }) {
    const profiles = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const selectedProfileId = ref(undefined); // undefined = no selection, null = fresh
    const hasSelected = ref(false);
    const isApplying = ref(false);

    // Fetch profiles when modal opens
    watch(() => props.isOpen, (open) => {
      if (open && profiles.value.length === 0) {
        fetchProfiles();
      }
    });

    async function fetchProfiles() {
      isLoading.value = true;
      error.value = null;

      try {
        const restUrl = window.gmkbData?.restUrl || '/wp-json/gmkb/v2/';
        const baseUrl = restUrl.replace(/gmkb\/v\d+\/?$/, '');
        const nonce = window.gmkbData?.restNonce || '';

        const response = await fetch(`${baseUrl}gmkb/v2/profiles`, {
          headers: {
            'X-WP-Nonce': nonce
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load profiles');
        }

        const data = await response.json();

        if (data.success) {
          // Map API response to our expected format
          profiles.value = (data.profiles || []).map(p => ({
            id: p.id,
            name: p.title || 'Unnamed Profile',
            tagline: p.tagline || p.guest_title || '',
            headshot: p.headshot,
            completion: p.completeness || 0,
            updated_at: p.modified
          }));

          // Auto-select if only one profile
          if (profiles.value.length === 1) {
            selectedProfileId.value = profiles.value[0].id;
            hasSelected.value = true;
          }
        } else {
          throw new Error(data.message || 'Failed to load profiles');
        }
      } catch (err) {
        console.error('Failed to fetch profiles:', err);
        error.value = err.message;
      } finally {
        isLoading.value = false;
      }
    }

    function selectProfile(profile) {
      selectedProfileId.value = profile.id;
      hasSelected.value = true;
    }

    function selectFresh() {
      selectedProfileId.value = null;
      hasSelected.value = true;
    }

    function handleClose() {
      if (props.allowClose) {
        emit('close');
      }
    }

    async function confirmSelection() {
      if (!hasSelected.value) return;

      isApplying.value = true;

      try {
        if (selectedProfileId.value === null) {
          emit('select-fresh');
        } else {
          const profile = profiles.value.find(p => p.id === selectedProfileId.value);
          emit('select', { id: selectedProfileId.value, profile });
        }
      } finally {
        isApplying.value = false;
      }
    }

    function getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return 'today';
      if (days === 1) return 'yesterday';
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return {
      profiles,
      isLoading,
      error,
      selectedProfileId,
      hasSelected,
      isApplying,
      fetchProfiles,
      selectProfile,
      selectFresh,
      handleClose,
      confirmSelection,
      getInitials,
      formatDate
    };
  }
};
</script>

<style>
.gmkb-profile-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.gmkb-profile-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.gmkb-profile-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.gmkb-profile-modal__header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.gmkb-profile-modal__close {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 6px;
  transition: all 0.15s;
}

.gmkb-profile-modal__close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.gmkb-profile-modal__content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.gmkb-profile-modal__subtitle {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #6b7280;
}

.gmkb-profile-modal__loading,
.gmkb-profile-modal__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
}

.gmkb-profile-modal__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.gmkb-profile-modal__retry {
  margin-top: 12px;
  padding: 8px 16px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.gmkb-profile-modal__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gmkb-profile-modal__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f9fafb;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  width: 100%;
}

.gmkb-profile-modal__item:hover {
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.gmkb-profile-modal__item--selected {
  background: #eef2ff;
  border-color: #6366f1;
}

.gmkb-profile-modal__item--fresh {
  background: white;
  border: 2px dashed #d1d5db;
}

.gmkb-profile-modal__item--fresh:hover {
  border-color: #9ca3af;
}

.gmkb-profile-modal__item--fresh.gmkb-profile-modal__item--selected {
  background: #f9fafb;
  border-style: solid;
  border-color: #6366f1;
}

.gmkb-profile-modal__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.gmkb-profile-modal__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gmkb-profile-modal__initials {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
}

.gmkb-profile-modal__avatar--fresh {
  background: #f3f4f6;
  color: #9ca3af;
}

.gmkb-profile-modal__info {
  flex: 1;
  min-width: 0;
}

.gmkb-profile-modal__info h4 {
  margin: 0 0 2px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.gmkb-profile-modal__title {
  color: #4f46e5 !important;
  font-weight: 500 !important;
  font-size: 13px !important;
}

.gmkb-profile-modal__info p {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gmkb-profile-modal__meta {
  font-size: 12px;
  color: #9ca3af;
}

.gmkb-profile-modal__check {
  color: #6366f1;
  flex-shrink: 0;
}

.gmkb-profile-modal__footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.gmkb-profile-modal__btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.gmkb-profile-modal__btn--secondary {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.gmkb-profile-modal__btn--secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.gmkb-profile-modal__btn--primary {
  background: #6366f1;
  border: 1px solid #6366f1;
  color: white;
}

.gmkb-profile-modal__btn--primary:hover:not(:disabled) {
  background: #4f46e5;
}

.gmkb-profile-modal__btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
