<template>
  <div class="gmkb-toolbar" :class="{ 'gmkb-toolbar--dark': isDarkMode }">
    <!-- Left Section: Back Button & Consolidated Profile -->
    <div class="gmkb-toolbar__section gmkb-toolbar__section--left">
      <!-- Back Button -->
      <a :href="dashboardUrl" class="gmkb-toolbar__back-link" title="Back to Media Kits">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </a>

      <div class="gmkb-toolbar__divider"></div>

      <!-- Consolidated Profile Group -->
      <div class="gmkb-toolbar__profile-group">
        <!-- Merged Profile Button -->
        <button
          class="gmkb-toolbar__profile-combo-btn"
          @click="openProfileSelector"
          :title="selectedProfileName ? `Switch Profile: ${selectedProfileName}` : 'Select profile to pre-populate data'"
        >
          <div class="gmkb-toolbar__profile-avatar" :class="{ 'gmkb-toolbar__profile-avatar--icon': selectedProfileIcon }">
            <i v-if="selectedProfileIcon" :class="selectedProfileIcon"></i>
            <span v-else class="gmkb-toolbar__profile-initials">{{ selectedProfileInitials }}</span>
          </div>
          <div class="gmkb-toolbar__profile-info">
            <span class="gmkb-toolbar__profile-label">
              <span
                class="gmkb-toolbar__status-badge"
                :class="isPublished ? 'gmkb-toolbar__status-badge--published' : 'gmkb-toolbar__status-badge--draft'"
              >
                {{ isPublished ? 'Published' : 'Draft' }}
              </span>
            </span>
            <span class="gmkb-toolbar__profile-name">{{ selectedProfileName || postTitle }}</span>
          </div>
          <svg class="gmkb-toolbar__profile-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <!-- View Profile Link (only when a profile is linked) -->
        <a
          v-if="profileEditUrl"
          :href="profileEditUrl"
          target="_blank"
          class="gmkb-toolbar__view-btn"
          title="View Profile"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </a>
      </div>
    </div>

    <!-- Center Section - Device Preview -->
    <div class="gmkb-toolbar__section gmkb-toolbar__section--center">
      <div class="gmkb-toolbar__device-selector">
        <button
          v-for="device in devices"
          :key="device"
          @click="setDeviceMode(device)"
          class="gmkb-toolbar__device-btn"
          :class="{ 'gmkb-toolbar__device-btn--active': deviceMode === device }"
          :title="`${device} view`"
        >
          {{ device }}
        </button>
      </div>
    </div>

    <!-- Right Section -->
    <div class="gmkb-toolbar__section gmkb-toolbar__section--right">
      <!-- Save Status -->
      <div class="gmkb-toolbar__save-status" :class="`gmkb-toolbar__save-status--${saveStatus}`">
        <div class="gmkb-toolbar__save-indicator"></div>
        <span class="gmkb-toolbar__save-text">{{ saveStatusText }}</span>
      </div>

      <!-- Dark Mode Toggle -->
      <button
        @click="toggleDarkMode"
        class="gmkb-toolbar__btn gmkb-toolbar__btn--icon"
        :title="isDarkMode ? 'Light mode' : 'Dark mode'"
      >
        <svg v-if="isDarkMode" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>

      <!-- Theme Button -->
      <button id="global-theme-btn" class="gmkb-toolbar__btn" @click="handleTheme">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
        <span>Theme</span>
      </button>

      <!-- Export Button -->
      <button class="gmkb-toolbar__btn gmkb-toolbar__btn--success" @click="handleExport">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Export</span>
      </button>

      <!-- More Actions Dropdown -->
      <div ref="moreDropdownRef" class="gmkb-toolbar__more-dropdown">
        <button
          class="gmkb-toolbar__btn gmkb-toolbar__btn--icon"
          @click="toggleMoreMenu"
          title="More actions"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
        <div v-if="showMoreMenu" class="gmkb-toolbar__more-menu">
          <button class="gmkb-toolbar__more-item" @click="handleShare">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Share</span>
          </button>
          <div class="gmkb-toolbar__more-divider"></div>
          <button class="gmkb-toolbar__more-item gmkb-toolbar__more-item--danger" @click="handleReset">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
            <span>Reset All</span>
          </button>
        </div>
      </div>

      <!-- Undo -->
      <button
        @click="handleUndo"
        :disabled="!store.canUndo"
        class="gmkb-toolbar__btn gmkb-toolbar__btn--icon"
        title="Undo (Ctrl+Z)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 7v6h6"></path>
          <path d="M21 17a9 9 0 00-15-6.5L3 13"></path>
        </svg>
      </button>

      <!-- Redo -->
      <button
        @click="handleRedo"
        :disabled="!store.canRedo"
        class="gmkb-toolbar__btn gmkb-toolbar__btn--icon"
        title="Redo (Ctrl+Shift+Z)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 7v6h-6"></path>
          <path d="M3 17a9 9 0 0115-6.5L21 13"></path>
        </svg>
      </button>

      <!-- Save Button (only for drafts/new kits) -->
      <button
        v-if="!isPublished"
        @click="handleSave"
        class="gmkb-toolbar__btn gmkb-toolbar__btn--secondary"
        title="Save (Ctrl+S)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
          <path d="M17 21v-8H7v8M7 3v5h8"></path>
        </svg>
        <span>Save</span>
      </button>

      <!-- Preview Button -->
      <a
        v-if="(viewUrl || previewUrl) && !isNewMediaKit"
        :href="isPublished ? viewUrl : previewUrl"
        target="_blank"
        class="gmkb-toolbar__btn gmkb-toolbar__btn--primary"
        :title="isPublished ? 'View Published Kit' : 'Preview Draft'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>Preview</span>
      </a>

      <!-- Publish Button (when draft) -->
      <button
        v-if="!isNewMediaKit && !isPublished"
        @click="confirmPublish()"
        :disabled="store.isPublishing"
        class="gmkb-toolbar__btn gmkb-toolbar__btn--publish"
        title="Publish media kit"
      >
        <svg v-if="store.isPublishing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="gmkb-toolbar__spinner">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13"></path>
          <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
        </svg>
        <span>{{ store.isPublishing ? 'Publishing...' : 'Publish' }}</span>
      </button>

      <!-- Update Split Button (when published) - HubSpot style -->
      <div v-if="!isNewMediaKit && isPublished" ref="updateDropdownRef" class="gmkb-toolbar__split-btn">
        <button
          @click="handleSave"
          :disabled="store.isSaving"
          class="gmkb-toolbar__split-main"
          title="Save changes"
        >
          <svg v-if="store.isSaving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="gmkb-toolbar__spinner">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          <span>{{ store.isSaving ? 'Updating...' : 'Update' }}</span>
        </button>
        <button
          @click="toggleUpdateMenu"
          class="gmkb-toolbar__split-toggle"
          title="More options"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div v-if="showUpdateMenu" class="gmkb-toolbar__split-menu">
          <button class="gmkb-toolbar__split-item" @click="confirmUnpublish">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
            <span>Unpublish</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <ExportModal ref="exportModal" />
    
    <!-- RESET FUNCTIONALITY: Global Reset Modal -->
    <GlobalResetModal ref="resetModal" />
    
    <!-- Share Modal -->
    <Teleport to="body">
      <div v-if="showShareModal" class="gmkb-modal-overlay" @click.self="showShareModal = false">
        <div class="gmkb-modal gmkb-modal--share">
          <div class="gmkb-modal__header">
            <h2>Share Media Kit</h2>
            <button @click="showShareModal = false" class="gmkb-modal__close">×</button>
          </div>
          <div class="gmkb-modal__body">
            <p v-if="viewUrl">Share your media kit with this link:</p>
            <p v-else>Save your media kit first to get a shareable link.</p>
            <div v-if="viewUrl" class="gmkb-modal__share-link">
              <input
                type="text"
                :value="viewUrl"
                readonly
                class="gmkb-modal__share-input"
                @click="$event.target.select()"
              />
              <button @click="copyShareLink" class="gmkb-btn gmkb-btn--primary">Copy Link</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Publish Confirmation / Success Modal -->
    <Teleport to="body">
      <div v-if="showPublishModal" class="gmkb-modal-overlay" @click.self="closePublishModal">
        <div class="gmkb-modal" :class="publishSuccess ? 'gmkb-modal--success' : 'gmkb-modal--publish'">
          <!-- Success View (shown after successful publish) -->
          <template v-if="publishSuccess">
            <div class="gmkb-modal__header gmkb-modal__header--success">
              <button @click="closePublishModal" class="gmkb-modal__close gmkb-modal__close--success">×</button>
            </div>
            <div class="gmkb-modal__body">
              <div class="gmkb-success-celebration">
                <!-- Celebration Icon with confetti-like elements -->
                <div class="gmkb-success-celebration__icon">
                  <div class="gmkb-success-celebration__sparkle gmkb-success-celebration__sparkle--1"></div>
                  <div class="gmkb-success-celebration__sparkle gmkb-success-celebration__sparkle--2"></div>
                  <div class="gmkb-success-celebration__sparkle gmkb-success-celebration__sparkle--3"></div>
                  <div class="gmkb-success-celebration__sparkle gmkb-success-celebration__sparkle--4"></div>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h2 class="gmkb-success-celebration__title">Nicely done!</h2>
                <p class="gmkb-success-celebration__message">Your media kit is now live and ready to share</p>

                <!-- URL Box with Copy -->
                <div class="gmkb-success-celebration__url-box">
                  <div class="gmkb-success-celebration__url-label">Your media kit URL</div>
                  <div class="gmkb-success-celebration__url-row">
                    <input
                      type="text"
                      :value="viewUrl"
                      readonly
                      class="gmkb-success-celebration__url-input"
                      @click="$event.target.select()"
                    />
                    <button @click="copyPublishedUrl" class="gmkb-success-celebration__copy-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy
                    </button>
                  </div>
                </div>

                <div class="gmkb-success-celebration__actions">
                  <a :href="viewUrl" target="_blank" class="gmkb-btn gmkb-btn--lg gmkb-btn--guestify">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    View Media Kit
                  </a>
                  <button @click="closePublishModal" class="gmkb-btn gmkb-btn--secondary">
                    Done
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Confirmation View (before publish/unpublish) -->
          <template v-else>
            <div class="gmkb-modal__header">
              <h2>{{ publishModalAction === 'publish' ? 'Publish Media Kit' : 'Unpublish Media Kit' }}</h2>
              <button @click="closePublishModal" class="gmkb-modal__close">×</button>
            </div>
            <div class="gmkb-modal__body">
              <div class="gmkb-publish-prompt">
                <div class="gmkb-publish-prompt__icon" :class="publishModalAction === 'publish' ? '' : 'gmkb-publish-prompt__icon--warning'">
                  <svg v-if="publishModalAction === 'publish'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M22 2L11 13"></path>
                    <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                  </svg>
                  <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </div>
                <p class="gmkb-publish-prompt__message">
                  {{ publishModalAction === 'publish'
                    ? 'Your media kit will be publicly visible at:'
                    : 'Your media kit will be set to draft and will no longer be publicly accessible.'
                  }}
                </p>
                <div v-if="publishModalAction === 'publish' && viewUrl" class="gmkb-publish-prompt__url">
                  {{ viewUrl }}
                </div>
                <p class="gmkb-publish-prompt__subtext">
                  {{ publishModalAction === 'publish'
                    ? 'Anyone with the link will be able to view your media kit.'
                    : 'You can publish it again at any time.'
                  }}
                </p>
                <div class="gmkb-publish-prompt__actions">
                  <button
                    @click="executePublish"
                    class="gmkb-btn gmkb-btn--lg"
                    :class="publishModalAction === 'publish' ? 'gmkb-btn--publish' : 'gmkb-btn--warning'"
                    :disabled="store.isPublishing"
                  >
                    {{ store.isPublishing ? 'Please wait...' : (publishModalAction === 'publish' ? 'Publish Now' : 'Unpublish') }}
                  </button>
                  <button @click="closePublishModal" class="gmkb-btn gmkb-btn--secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Teleport>

    <!-- Auth Prompt Modal -->
    <Teleport to="body">
      <div v-if="showAuthPrompt" class="gmkb-modal-overlay" @click.self="closeAuthPrompt">
        <div class="gmkb-modal gmkb-modal--auth">
          <div class="gmkb-modal__header">
            <h2>{{ authPromptData.isNewMediaKit ? 'Save Your Media Kit' : 'Login Required' }}</h2>
            <button @click="closeAuthPrompt" class="gmkb-modal__close">×</button>
          </div>
          <div class="gmkb-modal__body gmkb-auth-prompt">
            <div class="gmkb-auth-prompt__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
                <path d="M17 21v-8H7v8M7 3v5h8"></path>
              </svg>
            </div>
            <p class="gmkb-auth-prompt__message">{{ authPromptData.message }}</p>

            <!-- URL Preview -->
            <div class="gmkb-auth-prompt__url-preview" v-if="authPromptData.isNewMediaKit">
              <label>Your media kit URL will be:</label>
              <div class="gmkb-auth-prompt__url">
                <span class="gmkb-auth-prompt__url-domain">guestify.ai/</span>
                <span class="gmkb-auth-prompt__url-username">yourname</span>
              </div>
            </div>

            <p class="gmkb-auth-prompt__subtext" v-if="authPromptData.isNewMediaKit">
              Share your professional media kit with anyone, anywhere.
            </p>
            <div class="gmkb-auth-prompt__actions">
              <button @click="goToRegister" class="gmkb-btn gmkb-btn--primary gmkb-btn--lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Create Free Account
              </button>
              <button @click="goToLogin" class="gmkb-btn gmkb-btn--secondary">
                Already have an account? Log in
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, provide, watch, onMounted, onUnmounted } from 'vue'
import { useMediaKitStore } from '../../stores/mediaKit'
import { useToast } from '../../composables/useToast'
import ExportModal from './ExportModal.vue'
// RESET FUNCTIONALITY: Import global reset modal
import GlobalResetModal from './ui/GlobalResetModal.vue'
// ROOT FIX: Import StorageService for centralized localStorage access
import storageService from '../../services/StorageService'
// Profile switching support
import ProfileSelector from './shared/ProfileSelector.vue'
import profileContextService from '../../services/ProfileContextService.js'

const store = useMediaKitStore()
const { showSuccess, showInfo, showError } = useToast()
const exportModal = ref(null)
const showShareModal = ref(false)
// RESET FUNCTIONALITY: Global reset modal ref
const resetModal = ref(null)
// More actions dropdown state
const showMoreMenu = ref(false)
const moreDropdownRef = ref(null)

// Update split button dropdown state (for published kits)
const showUpdateMenu = ref(false)
const updateDropdownRef = ref(null)

// Auth prompt state
const showAuthPrompt = ref(false)
const authPromptData = ref({
  isNewMediaKit: false,
  loginUrl: '/wp-login.php',
  registerUrl: '/wp-login.php?action=register',
  message: ''
})

// Publish modal state
const showPublishModal = ref(false)
const publishModalAction = ref('publish') // 'publish' or 'unpublish'
const publishSuccess = ref(false) // Track successful publish for celebration modal

// Profile switching state
const isLoggedIn = computed(() => !!window.gmkbData?.user?.isLoggedIn)
const isNewMediaKit = computed(() => !!window.gmkbData?.isNewMediaKit)
const isPublished = computed(() => store.postStatus === 'publish')
const selectedProfileId = ref(window.gmkbData?.profileId || null)
const selectedProfileSlug = ref(window.gmkbData?.linkedProfileSlug || null)
const selectedProfileIconRef = ref(window.gmkbData?.linkedProfileIcon || null)

// Handle profile switch - updates store's profileData with new profile data
const handleProfileSwitch = async (profileId) => {
  if (!profileId) return

  try {
    console.log('🔄 Switching to profile:', profileId)

    // Update selected profile ID
    selectedProfileId.value = profileId

    // Update URL to include profile_id for persistence
    updateUrlWithProfileId(profileId)

    // Fetch profile data via ProfileContextService
    const profileData = await profileContextService.loadProfileData(profileId)

    if (profileData) {
      // Update store's profileData with new profile data via action
      store.setProfileData(profileData)

      // Update profile slug for edit link (use post_name or slug from profile data)
      selectedProfileSlug.value = profileData.post_name || profileData.slug || profileData.entry || null

      // Update profile icon
      selectedProfileIconRef.value = profileData.icon || null

      // Dispatch event for components to refresh
      document.dispatchEvent(new CustomEvent('gmkb:profile-switched', {
        detail: { profileId, profileData }
      }))

      showSuccess('Profile switched successfully')
      console.log('✅ Profile switched to:', profileId, 'slug:', selectedProfileSlug.value)
    }
  } catch (error) {
    console.error('Failed to switch profile:', error)
    showError('Failed to switch profile')
  }
}

/**
 * Update URL with profile_id parameter without page reload
 */
const updateUrlWithProfileId = (profileId) => {
  if (!profileId) return
  const url = new URL(window.location.href)
  url.searchParams.set('profile_id', profileId)
  window.history.replaceState({}, '', url.toString())
}

// Dark mode state
const isDarkMode = ref(false)

// Provide dark mode to child components
provide('isDarkMode', isDarkMode)

// Device options
const devices = ['desktop', 'tablet', 'mobile']
const deviceMode = ref('desktop')

// Computed properties
const postTitle = computed(() => window.gmkbData?.postTitle || 'Untitled Media Kit')
const dashboardUrl = computed(() => window.gmkbData?.dashboardUrl || '/app/media-kits/')
const saveStatus = computed(() => store.saveStatus)

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saving':
      return 'Saving...'
    case 'saved':
      return 'Saved'
    case 'unsaved':
      return 'Unsaved changes'
    default:
      return ''
  }
})

// View URL for the published media kit (also used for sharing)
const viewUrl = computed(() => {
  // First try the direct permalink if available
  if (window.gmkbData?.viewUrl) {
    return window.gmkbData.viewUrl
  }
  // Fallback to constructing from post ID
  const postId = window.gmkbData?.postId
  if (postId) {
    return `${window.location.origin}/?p=${postId}`
  }
  return null
})

// Preview URL for draft media kits (requires authentication)
const previewUrl = computed(() => {
  if (window.gmkbData?.previewUrl) {
    return window.gmkbData.previewUrl
  }
  // Fallback to constructing preview URL
  const postId = window.gmkbData?.postId
  if (postId && !isPublished.value) {
    return `${window.location.origin}/?p=${postId}&preview=true`
  }
  return null
})

// Selected profile name for display (format: "Name - Title")
const selectedProfileName = computed(() => {
  // Get name from profile data or backend
  let name = null
  let title = null

  // Try to get from store's profileData first (most up-to-date)
  if (store.profileData) {
    name = store.profileData.guest_name || store.profileData.name
    title = store.profileData.guest_title
  }

  // Fallback to backend data
  if (!name && window.gmkbData?.linkedProfileName) {
    // Strip "'s Media Kit" suffix if present in the linkedProfileName
    name = window.gmkbData.linkedProfileName.replace(/'s Media Kit$/i, '').trim()
  }
  if (!title && window.gmkbData?.linkedProfileTitle) {
    title = window.gmkbData.linkedProfileTitle
  }

  // Fallback to postTitle, but strip "'s Media Kit" suffix if present
  if (!name && window.gmkbData?.profileId && window.gmkbData?.postTitle) {
    name = window.gmkbData.postTitle.replace(/'s Media Kit$/i, '').trim()
  }

  if (!name) return null

  // Return formatted name with title
  return title ? `${name} - ${title}` : name
})

// Selected profile icon for display
const selectedProfileIcon = computed(() => {
  // Try to get from local ref first (updated when profile is switched)
  if (selectedProfileIconRef.value) {
    return selectedProfileIconRef.value
  }
  // Try to get from store's profileData
  if (store.profileData?.icon) {
    return store.profileData.icon
  }
  // Fallback to backend data
  if (window.gmkbData?.linkedProfileIcon) {
    return window.gmkbData.linkedProfileIcon
  }
  return null
})

// Selected profile initials for display (when no icon)
const selectedProfileInitials = computed(() => {
  const name = selectedProfileName.value
  if (!name) return '?'
  // Strip the " - Title" part if present for initials
  const baseName = name.split(' - ')[0]
  return baseName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

// Profile edit URL (for linked profiles) - links to frontend profile editor
const profileEditUrl = computed(() => {
  // Use reactive slug first (updates when profile is switched)
  if (selectedProfileSlug.value) {
    return `/app/profiles/guest/profile/?entry=${selectedProfileSlug.value}`
  }
  // Fallback to reactive profileId (updated when profile is switched)
  if (selectedProfileId.value) {
    return `/app/profiles/guest/profile/?id=${selectedProfileId.value}`
  }
  // Fallback to initial data from backend
  if (window.gmkbData?.linkedProfileEditUrl) {
    return window.gmkbData.linkedProfileEditUrl
  }
  const profileSlug = window.gmkbData?.linkedProfileSlug
  if (profileSlug) {
    return `/app/profiles/guest/profile/?entry=${profileSlug}`
  }
  // Fallback to initial profileId if available
  const profileId = window.gmkbData?.profileId
  if (profileId) {
    return `/app/profiles/guest/profile/?id=${profileId}`
  }
  return null
})

// Methods
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  
  // Apply to body for global dark mode
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
  }
  
  // Dispatch event
  document.dispatchEvent(new CustomEvent('gmkb:dark-mode-change', {
    detail: { isDark: isDarkMode.value }
  }))
  
  console.log('✅ Dark mode:', isDarkMode.value ? 'enabled' : 'disabled')
}

const setDeviceMode = (device) => {
  deviceMode.value = device
  
  // Apply device-specific styling to preview area
  const previewArea = document.getElementById('media-kit-preview')
  const mainContent = document.getElementById('gmkb-main-content')
  
  if (previewArea) {
    // Remove all device classes
    previewArea.classList.remove('gmkb-device--desktop', 'gmkb-device--tablet', 'gmkb-device--mobile')
    if (mainContent) {
      mainContent.classList.remove('gmkb-device--desktop', 'gmkb-device--tablet', 'gmkb-device--mobile')
    }
    
    // Add current device class
    previewArea.classList.add(`gmkb-device--${device}`)
    if (mainContent) {
      mainContent.classList.add(`gmkb-device--${device}`)
    }
    
    // Apply device-specific widths
    if (device === 'desktop') {
      previewArea.style.maxWidth = ''
      previewArea.style.margin = ''
      previewArea.style.boxShadow = ''
    } else if (device === 'tablet') {
      previewArea.style.maxWidth = '768px'
      previewArea.style.margin = '0 auto'
      previewArea.style.boxShadow = '0 0 20px rgba(0,0,0,0.1)'
      previewArea.style.transition = 'all 0.3s ease'
    } else if (device === 'mobile') {
      previewArea.style.maxWidth = '375px'
      previewArea.style.margin = '0 auto'
      previewArea.style.boxShadow = '0 0 20px rgba(0,0,0,0.1)'
      previewArea.style.transition = 'all 0.3s ease'
    }
    
    console.log('✅ Device mode applied:', device)
  } else {
    console.warn('⚠️ Preview area not found for device mode')
  }
  
  // Dispatch event for other components
  document.dispatchEvent(new CustomEvent('gmkb:device-change', {
    detail: { device }
  }))
}

function handleUndo() {
  if (store.canUndo) {
    store.undo()
    showInfo('↩️ Undone')
    console.log('↩️ Undo action')
  }
}

function handleRedo() {
  if (store.canRedo) {
    store.redo()
    showInfo('↪️ Redone')
    console.log('↪️ Redo action')
  }
}

function handleTheme() {
  // Open the theme switcher modal that already exists in MediaKitApp
  const event = new CustomEvent('gmkb:open-theme-switcher', {
    detail: { trigger: 'toolbar' }
  });
  document.dispatchEvent(event);
  console.log('🎨 Theme switcher event dispatched');
}

function handleExport() {
  if (exportModal.value) {
    exportModal.value.open()
  }
  console.log('✅ Opened export modal')
}

function handleShare() {
  showMoreMenu.value = false
  showShareModal.value = true
}

// More actions dropdown methods
function toggleMoreMenu() {
  showMoreMenu.value = !showMoreMenu.value
}

function closeMoreMenu() {
  showMoreMenu.value = false
}

// Update split button dropdown methods
function toggleUpdateMenu() {
  showUpdateMenu.value = !showUpdateMenu.value
}

function closeUpdateMenu() {
  showUpdateMenu.value = false
}

function handleReset() {
  showMoreMenu.value = false
  if (resetModal.value) {
    resetModal.value.open()
  }
}

function openProfileSelector() {
  // Dispatch event to open the profile selector modal in MediaKitApp
  document.dispatchEvent(new CustomEvent('gmkb:open-profile-selector'))
}

function copyShareLink() {
  if (navigator.clipboard && viewUrl.value) {
    navigator.clipboard.writeText(viewUrl.value).then(() => {
      showSuccess('Link copied to clipboard!')
      showShareModal.value = false
    })
  }
}

// Publish/Unpublish methods
function confirmPublish() {
  publishModalAction.value = 'publish'
  publishSuccess.value = false // Reset success state
  showPublishModal.value = true
}

function confirmUnpublish() {
  showUpdateMenu.value = false // Close the dropdown first
  publishModalAction.value = 'unpublish'
  showPublishModal.value = true
}

async function executePublish() {
  try {
    const status = publishModalAction.value === 'publish' ? 'publish' : 'draft'
    const result = await store.publish(status)

    if (result.requiresAuth) {
      showPublishModal.value = false
      showInfo('Please log in to publish your media kit')
      return
    }

    if (result.success) {
      if (status === 'publish') {
        // Update viewUrl if returned
        if (result.viewUrl && window.gmkbData) {
          window.gmkbData.viewUrl = result.viewUrl
        }
        // Show celebration modal instead of closing
        publishSuccess.value = true
      } else {
        // For unpublish, close modal and show info
        showPublishModal.value = false
        publishSuccess.value = false
        showInfo('Media kit set to draft')
      }
    }
  } catch (error) {
    console.error('Publish error:', error)
    showError('Failed to update status: ' + error.message)
  }
}

// Close publish modal and reset success state
function closePublishModal() {
  showPublishModal.value = false
  publishSuccess.value = false
}

// Copy URL to clipboard from success modal
function copyPublishedUrl() {
  if (navigator.clipboard && viewUrl.value) {
    navigator.clipboard.writeText(viewUrl.value).then(() => {
      showSuccess('Link copied to clipboard!')
    })
  }
}

async function handleSave() {
  try {
    const result = await store.save()

    // Check if save requires authentication
    if (result?.requiresAuth) {
      // The store already dispatched the event, but we can also show a toast
      showInfo('Please log in or register to save your media kit')
      return
    }

    showSuccess('✅ Media kit saved successfully!')
    console.log('✅ Manual save triggered')
  } catch (error) {
    console.error('❌ Save failed:', error)
    showError('Failed to save: ' + error.message)
  }
}

// Handle auth required event
function handleSaveRequiresAuth(event) {
  const { isNewMediaKit, loginUrl, registerUrl, message } = event.detail
  authPromptData.value = { isNewMediaKit, loginUrl, registerUrl, message }
  showAuthPrompt.value = true
}

function closeAuthPrompt() {
  showAuthPrompt.value = false
}

function goToLogin() {
  window.location.href = authPromptData.value.loginUrl
}

function goToRegister() {
  window.location.href = authPromptData.value.registerUrl
}

// Keyboard shortcuts
function handleKeyboard(e) {
  // Save: Ctrl+S or Cmd+S
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    handleSave()
  }
  
  // Undo: Ctrl+Z or Cmd+Z
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    if (store.canUndo) handleUndo()
  }
  
  // Redo: Ctrl+Shift+Z or Cmd+Shift+Z
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault()
    if (store.canRedo) handleRedo()
  }
}

// Watch dark mode and sync with StorageService
watch(isDarkMode, (newValue) => {
  storageService.set('dark-mode', newValue)
}, { immediate: true })

// Watch store profile data changes to update profile edit link
watch(() => store.profileData, (newProfileData) => {
  if (newProfileData) {
    // Extract slug from profile data
    const slug = newProfileData.post_name || newProfileData.slug || newProfileData.entry || null
    if (slug && slug !== selectedProfileSlug.value) {
      selectedProfileSlug.value = slug
      console.log('[MediaKitToolbar] Profile slug updated from store:', slug)
    }
  }
}, { deep: true })

// ROOT FIX: Use StorageService instead of direct localStorage
// Initialize dark mode from localStorage
const initDarkMode = () => {
  const savedMode = storageService.get('dark-mode', false)
  if (savedMode === true) {
    isDarkMode.value = true
    document.body.classList.add('dark-mode')
  }
}

// Click outside handler for dropdowns
const handleClickOutside = (event) => {
  if (moreDropdownRef.value && !moreDropdownRef.value.contains(event.target)) {
    showMoreMenu.value = false
  }
  if (updateDropdownRef.value && !updateDropdownRef.value.contains(event.target)) {
    showUpdateMenu.value = false
  }
}

// Handle profile selection event from MediaKitApp
function handleProfileSelectedEvent(event) {
  const { profileId, slug, icon, name, guest_title } = event.detail || {}
  console.log('🎯 Profile selected event received:', { profileId, slug, icon, name, guest_title })

  // Update local refs for toolbar display
  if (profileId) {
    selectedProfileId.value = profileId
  }
  if (slug) {
    selectedProfileSlug.value = slug
  }
  if (icon !== undefined) {
    selectedProfileIconRef.value = icon
  }
}

onMounted(() => {
  initDarkMode()
  document.addEventListener('keydown', handleKeyboard)
  document.addEventListener('gmkb:save-requires-auth', handleSaveRequiresAuth)
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('gmkb:profile-selected', handleProfileSelectedEvent)
  console.log('✅ Perfected toolbar mounted with BEM conventions')
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
  document.removeEventListener('gmkb:save-requires-auth', handleSaveRequiresAuth)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('gmkb:profile-selected', handleProfileSelectedEvent)
})
</script>

<style>
/* BEM Base Styles - Root level specificity */

/* Block: gmkb-toolbar */
.gmkb-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  gap: 24px;
  height: 60px;
  transition: all 0.2s;
}

/* Block Modifier: dark mode */
.gmkb-toolbar--dark {
  background: #0f172a;
  border-bottom-color: #334155;
}

/* Element: section */
.gmkb-toolbar__section {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Element Modifier: section positions */
.gmkb-toolbar__section--left {
  flex: 1;
  justify-content: flex-start;
}

.gmkb-toolbar__section--center {
  flex: 0 0 auto;
  justify-content: center;
}

.gmkb-toolbar__section--right {
  flex: 1;
  justify-content: flex-end;
}

/* Element: back link button */
.gmkb-toolbar__back-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  color: #64748b;
  background: #fff;
  transition: all 0.2s ease;
  text-decoration: none;
  flex-shrink: 0;
}

.gmkb-toolbar__back-link:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
  transform: translateX(-2px);
}

.gmkb-toolbar--dark .gmkb-toolbar__back-link {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.gmkb-toolbar--dark .gmkb-toolbar__back-link:hover {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

/* Element: divider */
.gmkb-toolbar__divider {
  width: 1px;
  height: 24px;
  background-color: #e2e8f0;
  margin: 0 4px;
}

.gmkb-toolbar--dark .gmkb-toolbar__divider {
  background-color: #334155;
}

/* Element: profile group (consolidated container) */
.gmkb-toolbar__profile-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Element: profile combo button (merged profile selector) */
.gmkb-toolbar__profile-combo-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 4px 6px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  height: 40px;
}

.gmkb-toolbar__profile-combo-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.gmkb-toolbar--dark .gmkb-toolbar__profile-combo-btn {
  background: #1e293b;
  border-color: #334155;
}

.gmkb-toolbar--dark .gmkb-toolbar__profile-combo-btn:hover {
  background: #334155;
  border-color: #475569;
}

/* Element: profile avatar */
.gmkb-toolbar__profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-radius: 50%;
  color: white;
  flex-shrink: 0;
}

.gmkb-toolbar__profile-avatar--icon i {
  font-size: 14px;
}

.gmkb-toolbar__profile-initials {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Element: profile info (container for label and name) */
.gmkb-toolbar__profile-info {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

/* Element: profile label ("Editing") */
.gmkb-toolbar__profile-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  font-weight: 600;
}

.gmkb-toolbar--dark .gmkb-toolbar__profile-label {
  color: #64748b;
}

/* Element: status badge */
.gmkb-toolbar__status-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 4px;
}

.gmkb-toolbar__status-badge--draft {
  background: #fef3c7;
  color: #92400e;
}

.gmkb-toolbar__status-badge--published {
  background: #d1fae5;
  color: #065f46;
}

.gmkb-toolbar--dark .gmkb-toolbar__status-badge--draft {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.gmkb-toolbar--dark .gmkb-toolbar__status-badge--published {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

/* Element: profile name */
.gmkb-toolbar__profile-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gmkb-toolbar--dark .gmkb-toolbar__profile-name {
  color: #f1f5f9;
}

/* Element: profile chevron */
.gmkb-toolbar__profile-chevron {
  color: #94a3b8;
  margin-left: 4px;
  transition: transform 0.15s ease;
}

.gmkb-toolbar__profile-combo-btn:hover .gmkb-toolbar__profile-chevron {
  transform: translateY(1px);
}

/* Element: view button (icon-only) */
.gmkb-toolbar__view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #0ea5e9;
  background: #f0f9ff;
  transition: all 0.15s ease;
  text-decoration: none;
}

.gmkb-toolbar__view-btn:hover {
  background: #e0f2fe;
  color: #0284c7;
}

.gmkb-toolbar--dark .gmkb-toolbar__view-btn {
  background: rgba(14, 165, 233, 0.1);
  color: #38bdf8;
}

.gmkb-toolbar--dark .gmkb-toolbar__view-btn:hover {
  background: rgba(14, 165, 233, 0.2);
  color: #7dd3fc;
}

/* View button preview variant (for drafts) */
.gmkb-toolbar__view-btn--preview {
  background: #fef3c7;
  color: #d97706;
}

.gmkb-toolbar__view-btn--preview:hover {
  background: #fde68a;
  color: #b45309;
}

.gmkb-toolbar--dark .gmkb-toolbar__view-btn--preview {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.gmkb-toolbar--dark .gmkb-toolbar__view-btn--preview:hover {
  background: rgba(251, 191, 36, 0.25);
  color: #fcd34d;
}

/* Element: device-selector */
.gmkb-toolbar__device-selector {
  display: flex;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}

.gmkb-toolbar--dark .gmkb-toolbar__device-selector {
  background: #1e293b;
  border-color: #334155;
}

.gmkb-toolbar__device-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-toolbar__device-btn:hover {
  color: #111827;
  background: rgba(0, 0, 0, 0.05);
}

.gmkb-toolbar--dark .gmkb-toolbar__device-btn {
  color: #cbd5e1;
}

.gmkb-toolbar--dark .gmkb-toolbar__device-btn:hover {
  color: #f3f4f6;
  background: rgba(255, 255, 255, 0.1);
}

.gmkb-toolbar__device-btn--active {
  background: #06b6d4;
  color: white;
  box-shadow: 0 2px 4px rgba(6, 182, 212, 0.3);
}

/* Element: save-status */
.gmkb-toolbar__save-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  font-size: 12px;
  transition: all 0.2s;
}

.gmkb-toolbar--dark .gmkb-toolbar__save-status {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

.gmkb-toolbar__save-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.gmkb-toolbar__save-status--saving .gmkb-toolbar__save-indicator {
  background: #f59e0b;
  animation: gmkb-pulse 1.5s ease-in-out infinite;
}

.gmkb-toolbar__save-status--saved .gmkb-toolbar__save-indicator {
  background: #10b981;
}

.gmkb-toolbar__save-status--unsaved .gmkb-toolbar__save-indicator {
  background: #ef4444;
}

@keyframes gmkb-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.gmkb-toolbar__save-status--saving {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

.gmkb-toolbar__save-status--saved {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.gmkb-toolbar__save-status--unsaved {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.gmkb-toolbar__save-text {
  font-weight: 500;
}

/* Element: btn - Base button styles */
.gmkb-toolbar__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-toolbar__btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
  border-color: #d1d5db;
}

.gmkb-toolbar__btn:active:not(:disabled) {
  transform: translateY(1px);
}

.gmkb-toolbar__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.gmkb-toolbar--dark .gmkb-toolbar__btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: #334155;
  color: #d1d5db;
}

.gmkb-toolbar--dark .gmkb-toolbar__btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: #475569;
}

/* Element Modifier: icon-only button */
.gmkb-toolbar__btn--icon {
  padding: 8px;
}

.gmkb-toolbar__btn--icon span {
  display: none;
}

/* Element Modifier: primary button (Save) */
.gmkb-toolbar__btn--primary {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  border-color: #06b6d4;
  color: white;
  box-shadow: 0 2px 4px rgba(6, 182, 212, 0.3);
}

.gmkb-toolbar__btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  border-color: #0891b2;
  box-shadow: 0 4px 8px rgba(6, 182, 212, 0.4);
  transform: translateY(-1px);
}

/* Element Modifier: secondary button (Save for drafts) */
.gmkb-toolbar__btn--secondary {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  border-color: #475569;
  color: white;
  box-shadow: 0 2px 4px rgba(71, 85, 105, 0.3);
}

.gmkb-toolbar__btn--secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
  border-color: #334155;
  box-shadow: 0 4px 8px rgba(71, 85, 105, 0.4);
  transform: translateY(-1px);
}

/* Element Modifier: success button (Export) */
.gmkb-toolbar__btn--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #10b981;
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.gmkb-toolbar__btn--success:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-color: #059669;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

/* Profile selector button for new media kits */
.gmkb-toolbar__btn--profile {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border-color: #8b5cf6;
  color: white;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
}

.gmkb-toolbar__btn--profile:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  border-color: #7c3aed;
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
  transform: translateY(-1px);
}

/* RESET FUNCTIONALITY: Element Modifier: danger button (Reset All) */
.gmkb-toolbar__btn--danger {
  background: rgba(239, 68, 68, 0.1);
  border-color: #fecaca;
  color: #dc2626;
}

.gmkb-toolbar__btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: #ef4444;
  color: white;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.gmkb-toolbar--dark .gmkb-toolbar__btn--danger {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(220, 38, 38, 0.3);
  color: #fca5a5;
}

.gmkb-toolbar--dark .gmkb-toolbar__btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: #ef4444;
  color: white;
}

/* Element Modifier: publish button */
.gmkb-toolbar__btn--publish {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #10b981;
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.gmkb-toolbar__btn--publish:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-color: #059669;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

/* Element Modifier: unpublish button */
.gmkb-toolbar__btn--unpublish {
  background: rgba(245, 158, 11, 0.1);
  border-color: #fde68a;
  color: #d97706;
}

.gmkb-toolbar__btn--unpublish:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.15);
  border-color: #fbbf24;
  color: #b45309;
}

.gmkb-toolbar--dark .gmkb-toolbar__btn--unpublish {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.gmkb-toolbar--dark .gmkb-toolbar__btn--unpublish:hover:not(:disabled) {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.5);
  color: #fcd34d;
}

/* Split Button (Update dropdown - HubSpot style) */
.gmkb-toolbar__split-btn {
  position: relative;
  display: flex;
}

.gmkb-toolbar__split-main {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border: 1px solid #f97316;
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);
}

.gmkb-toolbar__split-main:hover:not(:disabled) {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  box-shadow: 0 4px 8px rgba(249, 115, 22, 0.4);
}

.gmkb-toolbar__split-main:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gmkb-toolbar__split-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  border: 1px solid #ea580c;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0 8px 8px 0;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gmkb-toolbar__split-toggle:hover {
  background: linear-gradient(135deg, #c2410c 0%, #9a3412 100%);
}

.gmkb-toolbar__split-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 140px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  z-index: 1000;
}

.gmkb-toolbar--dark .gmkb-toolbar__split-menu {
  background: #1e293b;
  border-color: #334155;
}

.gmkb-toolbar__split-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.gmkb-toolbar__split-item:hover {
  background: #f3f4f6;
}

.gmkb-toolbar--dark .gmkb-toolbar__split-item {
  color: #e2e8f0;
}

.gmkb-toolbar--dark .gmkb-toolbar__split-item:hover {
  background: #334155;
}

/* Dark mode for split button */
.gmkb-toolbar--dark .gmkb-toolbar__split-main {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border-color: #f97316;
}

.gmkb-toolbar--dark .gmkb-toolbar__split-main:hover:not(:disabled) {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
}

.gmkb-toolbar--dark .gmkb-toolbar__split-toggle {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  border-color: #ea580c;
}

.gmkb-toolbar--dark .gmkb-toolbar__split-toggle:hover {
  background: linear-gradient(135deg, #c2410c 0%, #9a3412 100%);
}

/* Spinner animation for loading states */
.gmkb-toolbar__spinner {
  animation: gmkb-spin 1s linear infinite;
}

@keyframes gmkb-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* SVG Icons */
.gmkb-toolbar__btn svg {
  flex-shrink: 0;
}

/* Element: More actions dropdown */
.gmkb-toolbar__more-dropdown {
  position: relative;
}

.gmkb-toolbar__more-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 160px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  z-index: 1000;
}

.gmkb-toolbar--dark .gmkb-toolbar__more-menu {
  background: #1e293b;
  border-color: #334155;
}

.gmkb-toolbar__more-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.gmkb-toolbar__more-item:hover {
  background: #f3f4f6;
}

.gmkb-toolbar--dark .gmkb-toolbar__more-item {
  color: #e2e8f0;
}

.gmkb-toolbar--dark .gmkb-toolbar__more-item:hover {
  background: #334155;
}

.gmkb-toolbar__more-item--danger {
  color: #dc2626;
}

.gmkb-toolbar__more-item--danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}

.gmkb-toolbar--dark .gmkb-toolbar__more-item--danger {
  color: #fca5a5;
}

.gmkb-toolbar--dark .gmkb-toolbar__more-item--danger:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #fecaca;
}

.gmkb-toolbar__more-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 4px 0;
}

.gmkb-toolbar--dark .gmkb-toolbar__more-divider {
  background: #334155;
}

/* Block: gmkb-modal */
.gmkb-modal-overlay {
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
  backdrop-filter: blur(4px);
}

.gmkb-modal {
  background: #ffffff;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.gmkb-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.gmkb-modal__header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.gmkb-modal__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 24px;
  color: #64748b;
  transition: all 0.2s;
}

.gmkb-modal__close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.gmkb-modal__body {
  padding: 24px;
}

.gmkb-modal__share-link {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.gmkb-modal__share-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  font-family: monospace;
}

/* Block: gmkb-btn (for modal buttons) */
.gmkb-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.gmkb-btn--primary {
  background: #3b82f6;
  color: #ffffff;
}

.gmkb-btn--primary:hover {
  background: #2563eb;
}

.gmkb-btn--publish {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.gmkb-btn--publish:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.gmkb-btn--warning {
  background: #f59e0b;
  color: white;
}

.gmkb-btn--warning:hover {
  background: #d97706;
}

/* Publish prompt modal */
.gmkb-modal--publish {
  max-width: 440px;
}

.gmkb-publish-prompt {
  text-align: center;
  padding: 16px 8px;
}

.gmkb-publish-prompt__icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 16px;
  color: white;
}

.gmkb-publish-prompt__icon--warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.gmkb-publish-prompt__message {
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 12px;
}

.gmkb-publish-prompt__url {
  font-size: 14px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  color: #0ea5e9;
  background: #f0f9ff;
  padding: 10px 16px;
  border-radius: 8px;
  margin: 0 0 12px;
  word-break: break-all;
}

.gmkb-publish-prompt__subtext {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px;
}

.gmkb-publish-prompt__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Success Modal - Guestify Branding */
.gmkb-modal--success {
  max-width: 480px;
  overflow: hidden;
}

.gmkb-modal__header--success {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-bottom: none;
  padding: 16px 24px;
  position: relative;
}

.gmkb-modal__close--success {
  color: rgba(255, 255, 255, 0.8);
  position: absolute;
  right: 16px;
  top: 16px;
}

.gmkb-modal__close--success:hover {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

/* Success Celebration Content */
.gmkb-success-celebration {
  text-align: center;
  padding: 40px 32px 32px;
}

.gmkb-success-celebration__icon {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  color: white;
  animation: gmkb-success-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes gmkb-success-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Sparkle decorations */
.gmkb-success-celebration__sparkle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #f97316;
  border-radius: 50%;
  animation: gmkb-sparkle 1s ease-out forwards;
}

.gmkb-success-celebration__sparkle--1 {
  top: -8px;
  left: 50%;
  animation-delay: 0.1s;
}

.gmkb-success-celebration__sparkle--2 {
  top: 50%;
  right: -8px;
  animation-delay: 0.2s;
  background: #fbbf24;
}

.gmkb-success-celebration__sparkle--3 {
  bottom: -8px;
  left: 50%;
  animation-delay: 0.3s;
  background: #34d399;
}

.gmkb-success-celebration__sparkle--4 {
  top: 50%;
  left: -8px;
  animation-delay: 0.4s;
  background: #60a5fa;
}

@keyframes gmkb-sparkle {
  0% {
    transform: scale(0) translateY(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.5) translateY(-10px);
    opacity: 1;
  }
  100% {
    transform: scale(0) translateY(-20px);
    opacity: 0;
  }
}

.gmkb-success-celebration__title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
  animation: gmkb-fade-in 0.4s ease-out 0.2s both;
}

@keyframes gmkb-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gmkb-success-celebration__message {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 24px;
  animation: gmkb-fade-in 0.4s ease-out 0.3s both;
}

/* URL Box */
.gmkb-success-celebration__url-box {
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  animation: gmkb-fade-in 0.4s ease-out 0.4s both;
}

.gmkb-success-celebration__url-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ea580c;
  margin-bottom: 8px;
}

.gmkb-success-celebration__url-row {
  display: flex;
  gap: 8px;
}

.gmkb-success-celebration__url-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  color: #c2410c;
  background: white;
}

.gmkb-success-celebration__url-input:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.gmkb-success-celebration__copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #c2410c;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gmkb-success-celebration__copy-btn:hover {
  background: #fff7ed;
  border-color: #f97316;
}

/* Action Buttons */
.gmkb-success-celebration__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: gmkb-fade-in 0.4s ease-out 0.5s both;
}

/* Guestify branded button */
.gmkb-btn--guestify {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  text-decoration: none;
}

.gmkb-btn--guestify:hover {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
  transform: translateY(-1px);
  text-decoration: none;
  color: white;
}

/* Device Preview Styles - Applied to #media-kit-preview */
#media-kit-preview {
  transition: all 0.3s ease;
}

/* Global dark mode overrides - Clean approach */
body.dark-mode .gmkb-toolbar {
  background: #0f172a;
  border-bottom-color: #334155;
}

body.dark-mode .gmkb-toolbar__editing-label {
  color: #9ca3af;
}

body.dark-mode .gmkb-toolbar__document-title {
  color: #f3f4f6;
}

body.dark-mode .gmkb-toolbar__device-selector {
  background: #1e293b;
  border-color: #334155;
}

body.dark-mode .gmkb-toolbar__device-btn {
  color: #cbd5e1;
}

body.dark-mode .gmkb-toolbar__device-btn:hover {
  color: #f3f4f6;
  background: rgba(255, 255, 255, 0.1);
}

body.dark-mode .gmkb-toolbar__save-status {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

body.dark-mode .gmkb-toolbar__btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: #334155;
  color: #d1d5db;
}

body.dark-mode .gmkb-toolbar__btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: #475569;
}

/* Desktop - Full width */
#media-kit-preview.gmkb-device--desktop {
  max-width: 100%;
  margin: 0;
  box-shadow: none;
}

/* Tablet - 768px centered */
#media-kit-preview.gmkb-device--tablet {
  max-width: 768px;
  margin: 0 auto;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

/* Mobile - 375px centered */
#media-kit-preview.gmkb-device--mobile {
  max-width: 375px;
  margin: 0 auto;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 1024px) {
  .gmkb-toolbar__editing-info {
    display: none;
  }
}

@media (max-width: 768px) {
  .gmkb-toolbar {
    padding: 8px 12px;
    gap: 8px;
  }

  .gmkb-toolbar__btn span {
    display: none;
  }

  .gmkb-toolbar__btn--icon span {
    display: none;
  }

  .gmkb-toolbar__save-status {
    display: none;
  }

  .gmkb-toolbar__device-selector {
    display: none;
  }

  /* Hide profile text on mobile, show only avatar */
  .gmkb-toolbar__profile-info,
  .gmkb-toolbar__profile-chevron {
    display: none;
  }

  .gmkb-toolbar__profile-combo-btn {
    padding: 6px;
    gap: 0;
  }

  .gmkb-toolbar__divider {
    margin: 0 2px;
  }
}

/* Auth Prompt Modal */
.gmkb-modal--auth {
  max-width: 420px;
}

.gmkb-auth-prompt {
  text-align: center;
  padding: 32px 24px;
}

.gmkb-auth-prompt__icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  color: white;
}

.gmkb-auth-prompt__message {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px;
}

.gmkb-auth-prompt__subtext {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px;
}

.gmkb-auth-prompt__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gmkb-btn--secondary {
  background: transparent;
  color: #64748b;
  border: none;
}

.gmkb-btn--secondary:hover {
  color: #3b82f6;
  text-decoration: underline;
}

.gmkb-btn--lg {
  padding: 14px 24px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* URL Preview */
.gmkb-auth-prompt__url-preview {
  margin: 20px 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 12px;
  border: 1px solid #bae6fd;
}

.gmkb-auth-prompt__url-preview label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #0369a1;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.gmkb-auth-prompt__url {
  font-size: 18px;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.gmkb-auth-prompt__url-domain {
  color: #64748b;
}

.gmkb-auth-prompt__url-username {
  color: #0ea5e9;
  background: linear-gradient(135deg, #0ea5e9, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
