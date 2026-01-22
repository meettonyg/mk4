<template>
  <div class="gmkb-toolbar" :class="{ 'gmkb-toolbar--dark': isDarkMode }">
    <!-- Left Section: Branding & Document Info -->
    <div class="gmkb-toolbar__section gmkb-toolbar__section--left">
      <!-- Logo -->
      <div class="gmkb-toolbar__logo">Guestify</div>

      <!-- Document Info Card -->
      <div class="gmkb-toolbar__doc-card">
        <div class="gmkb-toolbar__doc-info">
          <span class="gmkb-toolbar__doc-label">Editing</span>
          <span class="gmkb-toolbar__doc-title">{{ postTitle }}</span>
        </div>

        <!-- View Link (only for saved media kits) -->
        <a
          v-if="viewUrl && !isNewMediaKit"
          :href="viewUrl"
          target="_blank"
          class="gmkb-toolbar__view-link"
          title="View published media kit"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span>View</span>
        </a>
      </div>

      <!-- Profile Selector -->
      <div class="gmkb-toolbar__profile-area" v-if="isLoggedIn">
        <button
          class="gmkb-toolbar__profile-btn"
          @click="openProfileSelector"
          :title="selectedProfileName ? `Profile: ${selectedProfileName}` : 'Select profile to pre-populate data'"
        >
          <div class="gmkb-toolbar__profile-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span class="gmkb-toolbar__profile-text">
            {{ selectedProfileName || 'Select Profile' }}
          </span>
          <svg class="gmkb-toolbar__profile-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
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

      <!-- Share Button -->
      <button class="gmkb-toolbar__btn" @click="handleShare">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        <span>Share</span>
      </button>

      <!-- RESET FUNCTIONALITY: Global Reset Button -->
      <button
        @click="resetModal.open()"
        class="gmkb-toolbar__btn gmkb-toolbar__btn--danger"
        title="Reset entire media kit"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
          <path d="M3 21v-5h5"></path>
        </svg>
        <span>Reset All</span>
      </button>

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

      <!-- Save Button -->
      <button
        @click="handleSave"
        class="gmkb-toolbar__btn gmkb-toolbar__btn--primary"
        title="Save (Ctrl+S)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
          <path d="M17 21v-8H7v8M7 3v5h8"></path>
        </svg>
        <span>Save</span>
      </button>
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
            <p>Share functionality coming soon!</p>
            <div class="gmkb-modal__share-link">
              <input
                type="text"
                :value="shareLink"
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

// Auth prompt state
const showAuthPrompt = ref(false)
const authPromptData = ref({
  isNewMediaKit: false,
  loginUrl: '/wp-login.php',
  registerUrl: '/wp-login.php?action=register',
  message: ''
})

// Profile switching state
const isLoggedIn = computed(() => !!window.gmkbData?.user?.isLoggedIn)
const isNewMediaKit = computed(() => !!window.gmkbData?.isNewMediaKit)
const selectedProfileId = ref(window.gmkbData?.profileId || null)

// Handle profile switch - updates store's profileData with new profile data
const handleProfileSwitch = async (profileId) => {
  if (!profileId) return

  try {
    console.log('🔄 Switching to profile:', profileId)

    // Update URL to include profile_id for persistence
    updateUrlWithProfileId(profileId)

    // Fetch profile data via ProfileContextService
    const profileData = await profileContextService.loadProfileData(profileId)

    if (profileData) {
      // Update store's profileData with new profile data via action
      store.setProfileData(profileData)

      // Dispatch event for components to refresh
      document.dispatchEvent(new CustomEvent('gmkb:profile-switched', {
        detail: { profileId, profileData }
      }))

      showSuccess('Profile switched successfully')
      console.log('✅ Profile switched to:', profileId)
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

const shareLink = computed(() => {
  const postId = window.gmkbData?.postId || ''
  return `${window.location.origin}/?mkcg_id=${postId}`
})

// View URL for the published media kit
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

// Selected profile name for display
const selectedProfileName = computed(() => {
  // First check if we have a linked profile name from the backend
  if (window.gmkbData?.linkedProfileName) {
    return window.gmkbData.linkedProfileName
  }
  // Check postTitle if this is editing a profile-linked kit
  if (window.gmkbData?.profileId && window.gmkbData?.postTitle) {
    return window.gmkbData.postTitle
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
  showShareModal.value = true
}

function openProfileSelector() {
  // Dispatch event to open the profile selector modal in MediaKitApp
  document.dispatchEvent(new CustomEvent('gmkb:open-profile-selector'))
}

function copyShareLink() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareLink.value).then(() => {
      alert('Link copied to clipboard!')
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

// ROOT FIX: Use StorageService instead of direct localStorage
// Initialize dark mode from localStorage
const initDarkMode = () => {
  const savedMode = storageService.get('dark-mode', false)
  if (savedMode === true) {
    isDarkMode.value = true
    document.body.classList.add('dark-mode')
  }
}

onMounted(() => {
  initDarkMode()
  document.addEventListener('keydown', handleKeyboard)
  document.addEventListener('gmkb:save-requires-auth', handleSaveRequiresAuth)
  console.log('✅ Perfected toolbar mounted with BEM conventions')
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
  document.removeEventListener('gmkb:save-requires-auth', handleSaveRequiresAuth)
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

/* Element: logo */
.gmkb-toolbar__logo {
  font-size: 18px;
  font-weight: 700;
  color: #06b6d4;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

/* Element: document info card */
.gmkb-toolbar__doc-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-left: 16px;
}

.gmkb-toolbar--dark .gmkb-toolbar__doc-card {
  background: #1e293b;
  border-color: #334155;
}

.gmkb-toolbar__doc-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.gmkb-toolbar__doc-label {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.gmkb-toolbar--dark .gmkb-toolbar__doc-label {
  color: #64748b;
}

.gmkb-toolbar__doc-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gmkb-toolbar--dark .gmkb-toolbar__doc-title {
  color: #f1f5f9;
}

/* Element: view link */
.gmkb-toolbar__view-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  color: #0ea5e9;
  text-decoration: none;
  background: #f0f9ff;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.gmkb-toolbar__view-link:hover {
  background: #e0f2fe;
  color: #0284c7;
}

.gmkb-toolbar--dark .gmkb-toolbar__view-link {
  background: rgba(14, 165, 233, 0.1);
  color: #38bdf8;
}

.gmkb-toolbar--dark .gmkb-toolbar__view-link:hover {
  background: rgba(14, 165, 233, 0.2);
  color: #7dd3fc;
}

/* Element: profile area */
.gmkb-toolbar__profile-area {
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid #e2e8f0;
}

.gmkb-toolbar--dark .gmkb-toolbar__profile-area {
  border-left-color: #334155;
}

.gmkb-toolbar__profile-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gmkb-toolbar__profile-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.gmkb-toolbar--dark .gmkb-toolbar__profile-btn {
  background: #1e293b;
  border-color: #334155;
}

.gmkb-toolbar--dark .gmkb-toolbar__profile-btn:hover {
  background: #334155;
  border-color: #475569;
}

.gmkb-toolbar__profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-radius: 50%;
  color: white;
}

.gmkb-toolbar__profile-text {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gmkb-toolbar--dark .gmkb-toolbar__profile-text {
  color: #e2e8f0;
}

.gmkb-toolbar__profile-chevron {
  color: #94a3b8;
  transition: transform 0.15s ease;
}

.gmkb-toolbar__profile-btn:hover .gmkb-toolbar__profile-chevron {
  transform: translateY(1px);
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

/* SVG Icons */
.gmkb-toolbar__btn svg {
  flex-shrink: 0;
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
