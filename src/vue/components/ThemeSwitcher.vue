<template>
  <!-- Teleport the dropdown to body to avoid z-index issues -->
  <Teleport to="body">
    <div v-if="buttonElement" class="theme-switcher-wrapper" ref="wrapperRef">
    
    <Transition name="dropdown">
      <div v-if="dropdownOpen" class="theme-dropdown" ref="dropdown" :style="getDropdownStyle">
        <!-- Quick Theme Selection -->
        <div class="dropdown-section">
          <h4>Select Theme</h4>
          <div class="theme-list">
            <button 
              v-for="theme in availableThemes" 
              :key="theme.id"
              @click="selectTheme(theme.id)"
              class="theme-option"
              :class="{ active: theme.id === activeThemeId }"
            >
              <div class="theme-preview" :style="getPreviewStyle(theme)"></div>
              <div class="theme-info">
                <span class="theme-option-name">{{ theme.name }}</span>
                <span class="theme-option-desc">{{ theme.description }}</span>
              </div>
              <span v-if="theme.id === activeThemeId" class="active-indicator">✓</span>
            </button>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="dropdown-divider"></div>
        <div class="dropdown-section">
          <h4>Quick Actions</h4>
          <div class="color-presets">
            <button 
              v-for="(preset, name) in colorPresets" 
              :key="name"
              @click="applyPreset(name)"
              class="color-preset"
              :style="{ background: preset.primary }"
              :title="`Apply ${name} color scheme`"
            ></button>
          </div>
          <button @click="openCustomizer" class="customizer-button">
            <span>⚙️</span> Customize Theme
          </button>
        </div>
      </div>
    </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useThemeStore } from '../../stores/theme';

const themeStore = useThemeStore();
const dropdownOpen = ref(false);
const dropdown = ref(null);
const wrapperRef = ref(null);
const buttonElement = ref(null);
const buttonRect = ref(null);

// Computed properties
const currentTheme = computed(() => themeStore.activeTheme || { name: 'Default', id: 'professional' });
const activeThemeId = computed(() => themeStore.activeThemeId);
const availableThemes = computed(() => {
  const themes = themeStore.availableThemes;
  
  // DEBUG: Log themes to see structure
  if (themes && themes.length > 0) {
    console.log('[ThemeSwitcher] Available themes:', themes);
    console.log('[ThemeSwitcher] First theme:', themes[0]);
  }
  
  return themes;
});
const colorPresets = computed(() => themeStore.colorPresets);

// Methods
const toggleDropdown = () => {
  if (!dropdownOpen.value) {
    // Update button position before opening
    const btn = buttonElement.value || document.getElementById('global-theme-btn');
    if (btn) {
      buttonRect.value = btn.getBoundingClientRect();
    }
  }
  dropdownOpen.value = !dropdownOpen.value;
};

const selectTheme = (themeId) => {
  // ROOT FIX: Validate themeId before calling store
  if (!themeId) {
    console.error('[ThemeSwitcher] Cannot select theme: themeId is undefined');
    return;
  }
  
  console.log('[ThemeSwitcher] Selecting theme:', themeId);
  themeStore.selectTheme(themeId);
  dropdownOpen.value = false;
  
  // Show toast notification
  const themeName = themeStore.activeTheme?.name || themeId;
  showToast(`Theme changed to ${themeName}`);
};

const applyPreset = (presetName) => {
  themeStore.applyColorPreset(presetName);
  showToast(`Applied ${presetName} color preset`);
};

const openCustomizer = () => {
  themeStore.openCustomizer();
  dropdownOpen.value = false;
};

const getPreviewStyle = (theme) => {
  return {
    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
    borderColor: theme.colors.border
  };
};

const showToast = (message) => {
  // Use the global toast function if available
  if (window.showToast) {
    window.showToast(message, 'success', 2000);
  } else {
    // Fallback: create a simple toast
    const toast = document.createElement('div');
    toast.className = 'gmkb-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--gmkb-color-primary, #007cba);
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownOpen.value && dropdown.value && !dropdown.value.contains(event.target) && 
      !event.target.closest('#global-theme-btn')) {
    dropdownOpen.value = false;
  }
};

// Handle toolbar button click
const handleButtonClick = (event) => {
  event.preventDefault();
  event.stopPropagation();
  toggleDropdown();
};

// Position dropdown relative to button
const getDropdownStyle = computed(() => {
  if (!buttonRect.value) {
    console.log('⚠️ ThemeSwitcher: No button rect, using fallback position');
    return {
      position: 'fixed',
      top: '60px',
      right: '20px',
      zIndex: 10001
    };
  }
  
  const style = {
    position: 'fixed',
    top: `${buttonRect.value.bottom + 8}px`,
    left: `${Math.max(10, buttonRect.value.left)}px`,
    zIndex: 10001
  };
  
  console.log('🎨 ThemeSwitcher: Dropdown position:', style);
  return style;
});

// Lifecycle
onMounted(() => {
  // Listen for theme button clicks via custom event
  const handleThemeOpen = (event) => {
    console.log('🎨 ThemeSwitcher: Received open event');
    // Update button position
    const btn = document.getElementById('global-theme-btn');
    if (btn) {
      buttonElement.value = btn;
      buttonRect.value = btn.getBoundingClientRect();
      console.log('🎨 ThemeSwitcher: Button position updated', buttonRect.value);
    }
    toggleDropdown();
    console.log('🎨 ThemeSwitcher: Dropdown toggled, open:', dropdownOpen.value);
  };
  
  // Listen for custom event from toolbar
  document.addEventListener('gmkb:open-theme-switcher', handleThemeOpen);
  console.log('✅ ThemeSwitcher: Listening for gmkb:open-theme-switcher event');
  
  // LEGACY SUPPORT: Also listen for clicks on button (for backwards compatibility)
  const btn = document.getElementById('global-theme-btn');
  if (btn) {
    buttonElement.value = btn;
    btn.addEventListener('click', handleButtonClick);
    buttonRect.value = btn.getBoundingClientRect();
    console.log('✅ ThemeSwitcher: Attached to toolbar button');
  } else {
    console.warn('⚠️ ThemeSwitcher: Toolbar button not found');
  }
  
  document.addEventListener('click', handleClickOutside);
});

// ROOT FIX: Cleanup on unmount - must be separate from onMounted
onUnmounted(() => {
  document.removeEventListener('gmkb:open-theme-switcher', () => {});
  if (buttonElement.value) {
    buttonElement.value.removeEventListener('click', handleButtonClick);
  }
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.theme-switcher-wrapper {
  /* Wrapper is just for organization, no positioning needed */
}

.theme-dropdown {
  /* Position is set via inline style for fixed positioning */
  min-width: 320px;
  max-width: 360px;
  background: var(--gmkb-color-surface, #fff);
  border: 1px solid var(--gmkb-color-border, #e2e8f0);
  border-radius: var(--gmkb-border-radius, 8px);
  box-shadow: var(--gmkb-shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.1));
  padding: 12px;
}

.dropdown-section h4 {
  margin: 0 0 12px 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gmkb-color-text-light, #64748b);
  font-weight: 600;
}

.theme-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
  width: 100%;
  text-align: left;
}

.theme-option:hover {
  background: var(--gmkb-color-background, #f8fafc);
}

.theme-option.active {
  background: var(--gmkb-color-background, #f8fafc);
}

.theme-preview {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  flex-shrink: 0;
}

.theme-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.theme-option-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--gmkb-color-text, #1e293b);
}

.theme-option-desc {
  font-size: 11px;
  color: var(--gmkb-color-text-light, #64748b);
}

.active-indicator {
  color: var(--gmkb-color-primary, #3b82f6);
  font-size: 16px;
  font-weight: bold;
}

.dropdown-divider {
  height: 1px;
  background: var(--gmkb-color-border, #e2e8f0);
  margin: 12px 0;
}

.color-presets {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.color-preset {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--gmkb-color-border, #e2e8f0);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-preset:hover {
  transform: scale(1.1);
  border-color: var(--gmkb-color-text, #1e293b);
}

.customizer-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: var(--gmkb-color-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.customizer-button:hover {
  background: var(--gmkb-color-primary-hover, #2563eb);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Toast animation keyframes */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 480px) {
  .theme-dropdown {
    min-width: 280px;
    right: 0;
    left: auto;
  }
}
</style>
