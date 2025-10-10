<template>
  <div class="theme-selector-grid">
    <button
      v-for="theme in themes"
      :key="theme.id"
      @click="selectTheme(theme.id)"
      class="theme-card"
      :class="{ 
        active: theme.id === activeThemeId,
        recommended: theme.recommended,
        'top-pick': theme.topPick
      }"
    >
      <!-- Badge -->
      <div v-if="theme.topPick" class="theme-badge top-pick">
        <i class="fa-solid fa-crown"></i>
        <span>TOP PICK</span>
      </div>
      <div v-else-if="theme.recommended" class="theme-badge recommended">
        <i class="fa-solid fa-star"></i>
        <span>RECOMMENDED</span>
      </div>

      <!-- Icon - Using Font Awesome instead of emoji -->
      <div class="theme-icon">
        <i :class="theme.iconClass"></i>
      </div>

      <!-- Name -->
      <div class="theme-name">{{ theme.name }}</div>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useThemeStore } from '../../stores/theme';

const themeStore = useThemeStore();

// Map of theme IDs to Font Awesome icons
const themeIconMap = {
  'classic': 'fa-solid fa-file-lines',
  'elegant': 'fa-solid fa-gem',
  'minimal': 'fa-solid fa-circle',
  'modern': 'fa-solid fa-star',
  'bold': 'fa-solid fa-dumbbell',
  'vibrant': 'fa-solid fa-palette',
  'compact': 'fa-solid fa-box',
  'spacious': 'fa-solid fa-building',
  'professional_clean': 'fa-solid fa-briefcase',
  'creative_bold': 'fa-solid fa-dumbbell',
  'minimal_elegant': 'fa-solid fa-circle',
  'modern_dark': 'fa-solid fa-moon'
};

const activeThemeId = computed(() => themeStore.activeThemeId);

// Process themes with icon classes and badges
const themes = computed(() => {
  return themeStore.availableThemes.map(theme => {
    // Determine icon class
    const iconClass = themeIconMap[theme.id] || 'fa-solid fa-palette';
    
    // Determine badges
    const topPick = theme.id === 'classic' || theme.id === 'professional_clean';
    const recommended = ['elegant', 'minimal', 'minimal_elegant'].includes(theme.id);
    
    return {
      ...theme,
      iconClass,
      topPick,
      recommended
    };
  });
});

function selectTheme(themeId) {
  themeStore.selectTheme(themeId);
  
  // Update media kit store
  const mediaKitStore = useMediaKitStore();
  mediaKitStore.theme = themeId;
  mediaKitStore.isDirty = true;
}
</script>

<style scoped>
.theme-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  padding: 20px;
}

.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

body.dark-mode .theme-card {
  background: #1e293b;
  border-color: #334155;
}

.theme-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.theme-card.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

body.dark-mode .theme-card.active {
  background: rgba(59, 130, 246, 0.1);
}

.theme-badge {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  z-index: 1;
}

.theme-badge.top-pick {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f;
}

.theme-badge.recommended {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
}

.theme-badge i {
  font-size: 10px;
}

.theme-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 50%;
  transition: all 0.2s;
}

body.dark-mode .theme-icon {
  background: linear-gradient(135deg, #334155, #475569);
}

.theme-card:hover .theme-icon {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

body.dark-mode .theme-card:hover .theme-icon {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
}

.theme-card.active .theme-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.theme-icon i {
  font-size: 28px;
  color: #64748b;
  transition: all 0.2s;
}

body.dark-mode .theme-icon i {
  color: #cbd5e1;
}

.theme-card:hover .theme-icon i {
  color: #3b82f6;
  transform: scale(1.1);
}

body.dark-mode .theme-card:hover .theme-icon i {
  color: #60a5fa;
}

.theme-card.active .theme-icon i {
  color: white;
  transform: scale(1.15);
}

.theme-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
}

body.dark-mode .theme-name {
  color: #f3f4f6;
}

.theme-card.active .theme-name {
  color: #3b82f6;
}

body.dark-mode .theme-card.active .theme-name {
  color: #60a5fa;
}

/* Responsive */
@media (max-width: 640px) {
  .theme-selector-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
  }
  
  .theme-card {
    padding: 20px 12px;
  }
  
  .theme-icon {
    width: 50px;
    height: 50px;
  }
  
  .theme-icon i {
    font-size: 24px;
  }
  
  .theme-name {
    font-size: 13px;
  }
}
</style>
