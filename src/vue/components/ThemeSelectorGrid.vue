<template>
  <div class="theme-selector-container" role="region" aria-label="Theme selector">
    <!-- Filter Tabs -->
    <div class="filter-section" aria-label="Theme filters">
      <!-- Audience Filter -->
      <div class="filter-group" role="group" aria-labelledby="audience-filter-label">
        <label id="audience-filter-label" class="filter-label">Audience</label>
        <div class="filter-tabs" role="tablist" aria-label="Filter by audience">
          <button
            v-for="(audience, index) in audienceFilters"
            :key="audience.value"
            @click="activeAudienceFilter = audience.value"
            @keydown="handleFilterKeydown($event, 'audience', index)"
            class="filter-tab"
            :class="{ active: activeAudienceFilter === audience.value }"
            role="tab"
            :aria-selected="activeAudienceFilter === audience.value"
            :tabindex="activeAudienceFilter === audience.value ? 0 : -1"
            :id="`audience-tab-${audience.value}`"
          >
            <i v-if="audience.icon" :class="audience.icon" aria-hidden="true"></i>
            {{ audience.label }}
          </button>
        </div>
      </div>

      <!-- Style Filter -->
      <div class="filter-group" role="group" aria-labelledby="style-filter-label">
        <label id="style-filter-label" class="filter-label">Style</label>
        <div class="filter-tabs" role="tablist" aria-label="Filter by style">
          <button
            v-for="(style, index) in styleFilters"
            :key="style.value"
            @click="activeStyleFilter = style.value"
            @keydown="handleFilterKeydown($event, 'style', index)"
            class="filter-tab"
            :class="{ active: activeStyleFilter === style.value }"
            role="tab"
            :aria-selected="activeStyleFilter === style.value"
            :tabindex="activeStyleFilter === style.value ? 0 : -1"
            :id="`style-tab-${style.value}`"
          >
            {{ style.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Theme Count -->
    <div class="results-count" role="status" aria-live="polite">
      {{ filteredThemes.length }} template{{ filteredThemes.length !== 1 ? 's' : '' }} found
    </div>

    <!-- Grouped Themes -->
    <div v-for="group in groupedThemes" :key="group.audience" class="theme-group" role="group" :aria-label="`${group.label} themes`">
      <h3 class="group-title" v-if="activeAudienceFilter === 'all'" :id="`group-${group.audience}`">
        <i :class="group.icon" aria-hidden="true"></i>
        {{ group.label }}
      </h3>

      <div
        class="theme-selector-grid"
        role="listbox"
        :aria-labelledby="activeAudienceFilter === 'all' ? `group-${group.audience}` : undefined"
        :aria-label="activeAudienceFilter !== 'all' ? 'Available themes' : undefined"
      >
        <button
          v-for="theme in group.themes"
          :key="theme.id"
          @click="selectTheme(theme.id)"
          @mouseenter="previewTheme(theme.id)"
          @mouseleave="clearPreview"
          @focus="previewTheme(theme.id)"
          @blur="clearPreview"
          @keydown.enter.prevent="selectTheme(theme.id)"
          @keydown.space.prevent="selectTheme(theme.id)"
          class="theme-card"
          :class="{
            active: theme.id === activeThemeId,
            previewing: theme.id === previewingThemeId,
            'is-new': theme.metadata?.is_new,
            'is-premium': theme.metadata?.is_premium
          }"
          role="option"
          :aria-selected="theme.id === activeThemeId"
          :aria-label="`${theme.name}${theme.metadata?.style_label ? ', ' + theme.metadata.style_label : ''}${theme.metadata?.is_new ? ', New' : ''}${theme.metadata?.is_premium ? ', Premium' : ''}${theme.id === activeThemeId ? ', Currently selected' : ''}`"
        >
          <!-- Badges -->
          <div v-if="theme.metadata?.is_new" class="theme-badge new" aria-hidden="true">
            <span>NEW</span>
          </div>
          <div v-else-if="theme.metadata?.is_premium" class="theme-badge premium" aria-hidden="true">
            <i class="fa-solid fa-crown"></i>
            <span>PREMIUM</span>
          </div>

          <!-- Preview with gradient from theme colors -->
          <div
            class="theme-preview"
            :style="getPreviewStyle(theme)"
            aria-hidden="true"
          >
            <i :class="getThemeIcon(theme)"></i>
          </div>

          <!-- Theme Info -->
          <div class="theme-info">
            <div class="theme-name">{{ theme.name }}</div>
            <div class="theme-style" v-if="theme.metadata?.style_label">
              {{ theme.metadata.style_label }}
            </div>
          </div>

          <!-- Active indicator -->
          <div v-if="theme.id === activeThemeId" class="active-check" aria-hidden="true">
            <i class="fa-solid fa-check"></i>
          </div>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredThemes.length === 0" class="empty-state" role="status" aria-live="polite">
      <i class="fa-solid fa-search" aria-hidden="true"></i>
      <p>No templates match your filters</p>
      <button @click="resetFilters" class="reset-button">Reset Filters</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useThemeStore } from '../../stores/theme';
import { useMediaKitStore } from '../../stores/mediaKit';

const themeStore = useThemeStore();
const mediaKitStore = useMediaKitStore();

// Filter state
const activeAudienceFilter = ref('all');
const activeStyleFilter = ref('all');

// Preview state for hover preview (Carrd-like UX)
const previewingThemeId = ref(null);
const originalThemeId = ref(null);
let previewTimeout = null;

// Audience filter options
const audienceFilters = [
  { value: 'all', label: 'All', icon: null },
  { value: 'speaker', label: 'Speakers', icon: 'fa-solid fa-microphone' },
  { value: 'author', label: 'Authors', icon: 'fa-solid fa-book' },
  { value: 'podcaster', label: 'Podcasters', icon: 'fa-solid fa-podcast' },
  { value: 'creator', label: 'Creators', icon: 'fa-solid fa-video' },
  { value: 'developer', label: 'Developers', icon: 'fa-solid fa-code' },
  { value: 'executive', label: 'Executives', icon: 'fa-solid fa-user-tie' },
  { value: 'professional', label: 'Professionals', icon: 'fa-solid fa-briefcase' },
  { value: 'creative', label: 'Creatives', icon: 'fa-solid fa-palette' },
  { value: 'designer', label: 'Designers', icon: 'fa-solid fa-moon' }
];

// Style filter options
const styleFilters = [
  { value: 'all', label: 'All Styles' },
  { value: 'classic', label: 'Classic' },
  { value: 'bold', label: 'Bold' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'modern', label: 'Modern' },
  { value: 'dark', label: 'Dark Mode' }
];

const activeThemeId = computed(() => themeStore.activeThemeId);

// Filter themes based on active filters
const filteredThemes = computed(() => {
  return themeStore.availableThemes.filter(theme => {
    const audienceMatch = activeAudienceFilter.value === 'all' ||
      theme.metadata?.audience_type === activeAudienceFilter.value;
    const styleMatch = activeStyleFilter.value === 'all' ||
      theme.metadata?.style_variant === activeStyleFilter.value;
    return audienceMatch && styleMatch;
  });
});

// Group themes by audience
const groupedThemes = computed(() => {
  const groups = {};

  filteredThemes.value.forEach(theme => {
    const audience = theme.metadata?.audience_type || 'other';
    const audienceLabel = theme.metadata?.audience_label || 'Other Templates';
    const audienceIcon = theme.metadata?.icon || 'fa-solid fa-palette';

    if (!groups[audience]) {
      groups[audience] = {
        audience,
        label: audienceLabel,
        icon: audienceIcon,
        themes: []
      };
    }
    groups[audience].themes.push(theme);
  });

  // Sort groups by theme count (most first)
  return Object.values(groups).sort((a, b) => b.themes.length - a.themes.length);
});

// Get theme icon from metadata or fallback
function getThemeIcon(theme) {
  return theme.metadata?.icon || 'fa-solid fa-palette';
}

// Get preview style with gradient from theme colors
function getPreviewStyle(theme) {
  const colors = theme.metadata?.preview_colors;
  if (colors && colors.length >= 2) {
    return {
      background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
    };
  }
  // Fallback to theme's primary/secondary colors
  if (theme.colors?.primary && theme.colors?.secondary) {
    return {
      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
    };
  }
  // Default gradient
  return {
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
  };
}

function selectTheme(themeId) {
  // Clear any pending preview
  clearPreview();
  previewingThemeId.value = null;
  originalThemeId.value = null;

  themeStore.selectTheme(themeId);
  mediaKitStore.theme = themeId;
  mediaKitStore._trackChange();
}

// CARRD-LIKE UX: Preview theme on hover
function previewTheme(themeId) {
  // Don't preview if already the active theme
  if (themeId === activeThemeId.value) return;

  // Store original theme for restoration
  if (originalThemeId.value === null) {
    originalThemeId.value = activeThemeId.value;
  }

  // Clear any pending preview timeout
  if (previewTimeout) {
    clearTimeout(previewTimeout);
  }

  // Small delay before preview to avoid flickering on fast mouse movements
  previewTimeout = setTimeout(() => {
    previewingThemeId.value = themeId;
    // Apply theme preview without tracking change
    themeStore.previewTheme(themeId);
  }, 150);
}

// Clear theme preview and restore original
function clearPreview() {
  if (previewTimeout) {
    clearTimeout(previewTimeout);
    previewTimeout = null;
  }

  if (originalThemeId.value !== null && previewingThemeId.value !== null) {
    // Restore original theme
    themeStore.selectTheme(originalThemeId.value);
  }

  previewingThemeId.value = null;
  originalThemeId.value = null;
}

function resetFilters() {
  activeAudienceFilter.value = 'all';
  activeStyleFilter.value = 'all';
}

// Keyboard navigation for filter tabs
function handleFilterKeydown(event, filterType, currentIndex) {
  const { key } = event;
  let filters;
  let setFilter;
  let prefix;

  if (filterType === 'audience') {
    filters = audienceFilters;
    setFilter = (val) => { activeAudienceFilter.value = val; };
    prefix = 'audience-tab';
  } else {
    filters = styleFilters;
    setFilter = (val) => { activeStyleFilter.value = val; };
    prefix = 'style-tab';
  }

  let newIndex = currentIndex;

  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      newIndex = (currentIndex + 1) % filters.length;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      newIndex = (currentIndex - 1 + filters.length) % filters.length;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = filters.length - 1;
      break;
    default:
      return;
  }

  if (newIndex !== currentIndex) {
    setFilter(filters[newIndex].value);
    nextTick(() => {
      const tabId = `${prefix}-${filters[newIndex].value}`;
      document.getElementById(tabId)?.focus();
    });
  }
}
</script>

<style scoped>
.theme-selector-container {
  padding: 16px;
}

/* Filter Section */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--gmkb-color-border, #e5e7eb);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gmkb-color-text-light, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--gmkb-color-text-light, #64748b);
  background: var(--gmkb-color-surface, #f8fafc);
  border: 1px solid var(--gmkb-color-border, #e5e7eb);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover,
.filter-tab:focus {
  background: var(--gmkb-color-surface-hover, #f1f5f9);
  border-color: var(--gmkb-color-primary, #3b82f6);
  color: var(--gmkb-color-primary, #3b82f6);
  outline: none;
}

.filter-tab:focus-visible {
  box-shadow: 0 0 0 2px var(--gmkb-color-primary, #3b82f6);
}

.filter-tab.active {
  background: var(--gmkb-color-primary, #3b82f6);
  border-color: var(--gmkb-color-primary, #3b82f6);
  color: white;
}

.filter-tab i {
  font-size: 12px;
}

/* Results Count */
.results-count {
  font-size: 13px;
  color: var(--gmkb-color-text-muted, #94a3b8);
  margin-bottom: 16px;
}

/* Theme Groups */
.theme-group {
  margin-bottom: 32px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--gmkb-color-text, #1e293b);
}

.group-title i {
  font-size: 18px;
  color: var(--gmkb-color-primary, #3b82f6);
}

body.dark-mode .group-title {
  color: #f3f4f6;
}

/* Theme Grid */
.theme-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
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

.theme-card:hover,
.theme-card:focus {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
  outline: none;
}

.theme-card:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4), 0 8px 20px rgba(59, 130, 246, 0.15);
}

.theme-card.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

body.dark-mode .theme-card.active {
  background: rgba(59, 130, 246, 0.1);
}

/* Previewing state (hover preview - Carrd-like UX) */
.theme-card.previewing {
  border-color: #8b5cf6;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.25);
}

.theme-card.previewing::after {
  content: 'Previewing';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: #8b5cf6;
  border-radius: 12px;
  white-space: nowrap;
  z-index: 10;
}

/* Badges */
.theme-badge {
  position: absolute;
  top: -8px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 1;
}

.theme-badge.new {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.theme-badge.premium {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f;
}

.theme-badge i {
  font-size: 9px;
}

/* Theme Preview */
.theme-preview {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  transition: all 0.2s;
}

.theme-preview i {
  font-size: 28px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.theme-card:hover .theme-preview {
  transform: scale(1.05);
}

.theme-card.active .theme-preview {
  transform: scale(1.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

/* Theme Info */
.theme-info {
  text-align: center;
}

.theme-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
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

.theme-style {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Active Check */
.active-check {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  border-radius: 50%;
  color: white;
  font-size: 11px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.reset-button {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #3b82f6;
  background: transparent;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  background: #3b82f6;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-tabs {
    gap: 6px;
  }

  .filter-tab {
    padding: 8px 12px;
    font-size: 12px;
    min-height: 40px; /* Touch-friendly target */
  }

  .theme-selector-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .theme-card {
    padding: 16px 12px;
    min-height: 140px; /* Consistent touch target */
  }

  .theme-preview {
    width: 56px;
    height: 56px;
  }

  .theme-preview i {
    font-size: 22px;
  }

  .theme-name {
    font-size: 13px;
  }

  .reset-button {
    min-height: 44px;
    padding: 12px 24px;
  }
}

/* Touch-friendly styles for touch devices */
@media (hover: none) and (pointer: coarse) {
  /* Remove hover-only transforms on touch */
  .theme-card:hover {
    transform: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .theme-card:hover .theme-preview {
    transform: none;
  }

  /* Use active state for touch feedback */
  .theme-card:active {
    transform: scale(0.97);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* Touch feedback for filter tabs */
  .filter-tab:active {
    transform: scale(0.95);
  }

  /* Touch feedback for reset button */
  .reset-button:active {
    transform: scale(0.98);
  }

  /* Hide previewing label on touch (confusing UX) */
  .theme-card.previewing::after {
    display: none;
  }
}
</style>
