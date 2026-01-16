<template>
  <div class="template-picker">
    <!-- Header -->
    <header class="template-picker__header">
      <div class="template-picker__brand">
        <span class="template-picker__logo">Guestify</span>
        <span class="template-picker__tagline">Media Kit Builder</span>
      </div>
      <div class="template-picker__actions">
        <a v-if="hasBackup" @click.prevent="resumeSession" href="#" class="template-picker__resume-btn">
          <i class="fa-solid fa-clock-rotate-left"></i>
          Resume Previous Session
        </a>
        <a :href="loginUrl" class="template-picker__login-link">
          Already have an account? <strong>Log in</strong>
        </a>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="template-picker__hero">
      <h1 class="template-picker__title">Create Your Professional Media Kit</h1>
      <p class="template-picker__subtitle">
        Choose a template to get started. You can customize everything later.
      </p>
    </section>

    <!-- Filters - Multi-Dimensional (Persona > Use Case > Layout) -->
    <section class="template-picker__filters">
      <div class="filter-section">
        <!-- Persona Filter (Primary) -->
        <div class="filter-group">
          <label class="filter-label">
            <span class="filter-step">1</span>
            I am a...
          </label>
          <div class="filter-tabs">
            <button
              v-for="persona in personaFilters"
              :key="persona.value"
              @click="activePersonaFilter = persona.value"
              class="filter-tab"
              :class="{ active: activePersonaFilter === persona.value }"
            >
              <i v-if="persona.icon" :class="persona.icon"></i>
              {{ persona.label }}
            </button>
          </div>
        </div>

        <!-- Use Case Filter (Secondary) -->
        <div class="filter-group" v-if="useCaseFilters.length > 1">
          <label class="filter-label">
            <span class="filter-step">2</span>
            Use case
          </label>
          <div class="filter-tabs">
            <button
              v-for="useCase in useCaseFilters"
              :key="useCase.value"
              @click="activeUseCaseFilter = useCase.value"
              class="filter-tab filter-tab--secondary"
              :class="{ active: activeUseCaseFilter === useCase.value }"
            >
              {{ useCase.label }}
            </button>
          </div>
        </div>

        <!-- Layout Variant Filter (Tertiary) -->
        <div class="filter-group" v-if="layoutFilters.length > 1">
          <label class="filter-label">
            <span class="filter-step">3</span>
            Layout style
          </label>
          <div class="filter-tabs">
            <button
              v-for="layout in layoutFilters"
              :key="layout.value"
              @click="activeLayoutFilter = layout.value"
              class="filter-tab filter-tab--layout"
              :class="{ active: activeLayoutFilter === layout.value }"
            >
              {{ layout.label }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Results Count -->
    <div class="template-picker__count">
      {{ filteredTemplates.length }} template{{ filteredTemplates.length !== 1 ? 's' : '' }} available
    </div>

    <!-- Template Grid -->
    <section class="template-picker__grid">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        @click="selectTemplate(template)"
        class="template-card"
        :class="{ 'is-new': template.metadata?.is_new }"
      >
        <!-- Badge -->
        <div v-if="template.metadata?.is_new" class="template-card__badge">NEW</div>

        <!-- Preview -->
        <div class="template-card__preview" :style="getPreviewStyle(template)">
          <i :class="getTemplateIcon(template)"></i>
        </div>

        <!-- Info -->
        <div class="template-card__info">
          <h3 class="template-card__name">{{ template.name }}</h3>
          <p class="template-card__description">{{ template.description }}</p>
          <div class="template-card__meta">
            <span class="template-card__persona" v-if="template.persona?.label">
              <i :class="template.persona?.icon || 'fa-solid fa-user'"></i>
              {{ template.persona.label }}
            </span>
            <span class="template-card__use-case" v-if="template.use_case || template.persona?.use_case">
              {{ template.use_case || template.persona?.use_case }}
            </span>
            <span class="template-card__layout" v-if="template.layout_variant || template.persona?.layout_variant">
              {{ getLayoutLabel(template.layout_variant || template.persona?.layout_variant) }}
            </span>
          </div>
        </div>

        <!-- Select Button -->
        <button class="template-card__select">
          <i class="fa-solid fa-arrow-right"></i>
          Use This Template
        </button>
      </div>
    </section>

    <!-- Empty State -->
    <div v-if="filteredTemplates.length === 0" class="template-picker__empty">
      <i class="fa-solid fa-search"></i>
      <p>No templates match your filters</p>
      <button @click="resetFilters" class="template-picker__reset-btn">Show All Templates</button>
    </div>

    <!-- Footer -->
    <footer class="template-picker__footer">
      <p>Free to create. Register only when you're ready to save.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import storageService from '../../services/StorageService';

const emit = defineEmits(['template-selected', 'resume-session']);

// Props for templates data
const props = defineProps({
  templates: {
    type: Array,
    default: () => []
  },
  loginUrl: {
    type: String,
    default: '/wp-login.php'
  }
});

// Filter state - Multi-dimensional filtering
const activePersonaFilter = ref('all');
const activeUseCaseFilter = ref('all');
const activeLayoutFilter = ref('all');
const hasBackup = ref(false);

// Dynamic filter options from API manifest
const filterManifest = ref(null);
const isLoadingManifest = ref(false);

// Layout variant labels for display (constant, defined once)
const LAYOUT_LABELS = {
  'standard': 'Standard',
  'image-left': 'Image Left',
  'image-right': 'Image Right',
  'center-stack': 'Centered',
  'split-layout': 'Split Screen',
  'minimal': 'Minimal',
  'bold': 'Bold'
};

/**
 * Helper to extract unique filter options from templates
 * @param {Function} keyExtractor - Function to extract the key from a template
 * @param {Function} labelExtractor - Function to create the filter object
 * @returns {Array} Array of unique filter options
 */
function extractUniqueFromTemplates(keyExtractor, labelExtractor) {
  const seen = new Set();
  const results = [];
  props.templates.forEach(template => {
    const value = keyExtractor(template);
    if (value && !seen.has(value)) {
      seen.add(value);
      results.push(labelExtractor(template, value));
    }
  });
  return results;
}

// Fetch filter manifest from API
async function fetchFilterManifest() {
  isLoadingManifest.value = true;
  try {
    const restUrl = window.gmkbData?.restUrl || '/wp-json/';
    const response = await fetch(`${restUrl}gmkb/v1/filter-manifest`);
    const data = await response.json();
    if (data.success) {
      filterManifest.value = data.manifest;
    }
  } catch (err) {
    console.error('Failed to load filter manifest:', err);
  } finally {
    isLoadingManifest.value = false;
  }
}

// Computed: Persona filter options (dynamic from manifest or fallback to templates)
const personaFilters = computed(() => {
  const filters = [{ value: 'all', label: 'All Personas', icon: null }];

  if (filterManifest.value?.personas) {
    filterManifest.value.personas.forEach(persona => {
      filters.push({
        value: persona.type,
        label: persona.label,
        icon: persona.icon
      });
    });
  } else {
    // Fallback: Extract from templates using helper
    const extracted = extractUniqueFromTemplates(
      template => template.persona?.type,
      (template, value) => ({
        value,
        label: template.persona?.label || value,
        icon: template.persona?.icon || 'fa-solid fa-user'
      })
    );
    filters.push(...extracted);
  }

  return filters;
});

// Computed: Use Case filter options (dynamic based on selected persona)
const useCaseFilters = computed(() => {
  const filters = [{ value: 'all', label: 'All Use Cases' }];

  if (filterManifest.value?.use_cases) {
    // If a persona is selected, only show use cases available for that persona
    if (activePersonaFilter.value !== 'all' && filterManifest.value?.manifest) {
      const personaUseCases = filterManifest.value.manifest?.[activePersonaFilter.value];
      if (personaUseCases) {
        Object.keys(personaUseCases).forEach(useCase => {
          filters.push({ value: useCase, label: useCase });
        });
      }
    } else {
      // Show all use cases
      filterManifest.value.use_cases.forEach(useCase => {
        filters.push({ value: useCase, label: useCase });
      });
    }
  } else {
    // Fallback: Extract from templates using helper
    const extracted = extractUniqueFromTemplates(
      template => template.use_case || template.persona?.use_case,
      (template, value) => ({ value, label: value })
    );
    filters.push(...extracted);
  }

  return filters;
});

// Computed: Layout Variant filter options (dynamic based on selected persona + use case)
const layoutFilters = computed(() => {
  const filters = [{ value: 'all', label: 'All Layouts' }];

  if (filterManifest.value?.layout_variants) {
    // If persona and use case selected, filter layouts accordingly
    if (activePersonaFilter.value !== 'all' && activeUseCaseFilter.value !== 'all' && filterManifest.value?.manifest) {
      const personaManifest = filterManifest.value.manifest?.[activePersonaFilter.value];
      const useCaseLayouts = personaManifest?.[activeUseCaseFilter.value];
      if (useCaseLayouts) {
        useCaseLayouts.forEach(layout => {
          filters.push({ value: layout, label: LAYOUT_LABELS[layout] || layout });
        });
      }
    } else if (activePersonaFilter.value !== 'all' && filterManifest.value?.manifest) {
      // Show all layouts for selected persona
      const personaManifest = filterManifest.value.manifest?.[activePersonaFilter.value];
      if (personaManifest) {
        const seenLayouts = new Set();
        Object.values(personaManifest).forEach(layouts => {
          layouts.forEach(layout => {
            if (!seenLayouts.has(layout)) {
              seenLayouts.add(layout);
              filters.push({ value: layout, label: LAYOUT_LABELS[layout] || layout });
            }
          });
        });
      }
    } else {
      // Show all layouts
      filterManifest.value.layout_variants.forEach(layout => {
        filters.push({ value: layout, label: LAYOUT_LABELS[layout] || layout });
      });
    }
  } else {
    // Fallback: Extract from templates using helper
    const extracted = extractUniqueFromTemplates(
      template => template.layout_variant || template.persona?.layout_variant,
      (template, value) => ({ value, label: LAYOUT_LABELS[value] || value })
    );
    filters.push(...extracted);
  }

  return filters;
});

// Reset dependent filters when parent filter changes
watch(activePersonaFilter, () => {
  activeUseCaseFilter.value = 'all';
  activeLayoutFilter.value = 'all';
});

watch(activeUseCaseFilter, () => {
  activeLayoutFilter.value = 'all';
});

// Filter templates - Multi-dimensional
const filteredTemplates = computed(() => {
  return props.templates.filter(template => {
    // Persona filter
    const personaType = template.persona?.type;
    const personaMatch = activePersonaFilter.value === 'all' || personaType === activePersonaFilter.value;

    // Use Case filter
    const useCase = template.use_case || template.persona?.use_case || 'General Bio';
    const useCaseMatch = activeUseCaseFilter.value === 'all' || useCase === activeUseCaseFilter.value;

    // Layout Variant filter
    const layoutVariant = template.layout_variant || template.persona?.layout_variant || 'standard';
    const layoutMatch = activeLayoutFilter.value === 'all' || layoutVariant === activeLayoutFilter.value;

    return personaMatch && useCaseMatch && layoutMatch;
  });
});

// Get template icon
function getTemplateIcon(template) {
  return template.persona?.icon || template.metadata?.icon || 'fa-solid fa-palette';
}

// Get human-readable layout label
function getLayoutLabel(layoutVariant) {
  return LAYOUT_LABELS[layoutVariant] || layoutVariant;
}

// Get preview style
function getPreviewStyle(template) {
  const colors = template.metadata?.preview_colors;
  if (colors && colors.length >= 2) {
    return { background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` };
  }
  if (template.colors?.primary && template.colors?.secondary) {
    return { background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})` };
  }
  return { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' };
}

// Select template and redirect to builder
function selectTemplate(template) {
  // Save selection to localStorage for anonymous users
  storageService.set('gmkb_selected_template', template.id);

  // Redirect to builder with template parameter
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('template', template.id);
  window.location.href = currentUrl.toString();
}

// Resume previous session
function resumeSession() {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('resume', 'true');
  window.location.href = currentUrl.toString();
}

// Reset all filters
function resetFilters() {
  activePersonaFilter.value = 'all';
  activeUseCaseFilter.value = 'all';
  activeLayoutFilter.value = 'all';
}

// Check for existing backup on mount and fetch filter manifest
onMounted(() => {
  const backup = storageService.get('gmkb_anonymous_backup');
  hasBackup.value = !!backup;

  // Fetch the filter manifest for dynamic filtering
  fetchFilterManifest();
});
</script>

<style scoped>
.template-picker {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Header */
.template-picker__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.template-picker__brand {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.template-picker__logo {
  font-size: 24px;
  font-weight: 700;
  color: #06b6d4;
  letter-spacing: -0.02em;
}

.template-picker__tagline {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.template-picker__actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.template-picker__resume-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.template-picker__resume-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.template-picker__login-link {
  font-size: 14px;
  color: #64748b;
  text-decoration: none;
}

.template-picker__login-link strong {
  color: #3b82f6;
}

.template-picker__login-link:hover strong {
  text-decoration: underline;
}

/* Hero */
.template-picker__hero {
  text-align: center;
  padding: 60px 40px 40px;
}

.template-picker__title {
  font-size: 42px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px;
  letter-spacing: -0.02em;
}

.template-picker__subtitle {
  font-size: 18px;
  color: #64748b;
  margin: 0;
  max-width: 500px;
  margin: 0 auto;
}

/* Filters */
.template-picker__filters {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.filter-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 12px;
  font-weight: 700;
  color: #3b82f6;
  background: #eff6ff;
  border-radius: 50%;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #f1f5f9;
  color: #3b82f6;
}

.filter-tab.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.filter-tab--secondary {
  background: #f0fdf4;
  color: #059669;
}

.filter-tab--secondary:hover {
  background: #dcfce7;
  color: #059669;
}

.filter-tab--secondary.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.filter-tab--layout {
  background: #fef3c7;
  color: #d97706;
}

.filter-tab--layout:hover {
  background: #fde68a;
  color: #d97706;
}

.filter-tab--layout.active {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.filter-tab i {
  font-size: 14px;
}

/* Count */
.template-picker__count {
  max-width: 1200px;
  margin: 32px auto 20px;
  padding: 0 40px;
  font-size: 14px;
  color: #94a3b8;
}

/* Grid */
.template-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px 60px;
}

/* Template Card */
.template-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.template-card:hover .template-card__select {
  opacity: 1;
  transform: translateY(0);
}

.template-card__badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-radius: 20px;
  z-index: 2;
}

.template-card__preview {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.template-card__preview i {
  font-size: 56px;
  color: white;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s;
}

.template-card:hover .template-card__preview i {
  transform: scale(1.1);
}

.template-card__info {
  padding: 24px;
  flex: 1;
}

.template-card__name {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px;
}

.template-card__description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.template-card__persona,
.template-card__use-case,
.template-card__layout {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  white-space: nowrap;
}

.template-card__persona {
  background: #eff6ff;
  color: #3b82f6;
}

.template-card__persona i {
  font-size: 11px;
}

.template-card__use-case {
  background: #f0fdf4;
  color: #059669;
}

.template-card__layout {
  background: #fef3c7;
  color: #d97706;
}

.template-card__select {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: #3b82f6;
  color: white;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.3s;
}

.template-card__select:hover {
  background: #2563eb;
}

/* Empty State */
.template-picker__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
}

.template-picker__empty i {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 24px;
}

.template-picker__empty p {
  font-size: 18px;
  color: #64748b;
  margin: 0 0 24px;
}

.template-picker__reset-btn {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.template-picker__reset-btn:hover {
  background: #2563eb;
}

/* Footer */
.template-picker__footer {
  text-align: center;
  padding: 40px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.template-picker__footer p {
  margin: 0;
  font-size: 14px;
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .template-picker__header {
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
  }

  .template-picker__actions {
    flex-direction: column;
    gap: 12px;
  }

  .template-picker__hero {
    padding: 40px 20px 30px;
  }

  .template-picker__title {
    font-size: 28px;
  }

  .template-picker__subtitle {
    font-size: 16px;
  }

  .template-picker__filters {
    padding: 0 20px;
  }

  .filter-section {
    padding: 20px;
  }

  .filter-tabs {
    gap: 8px;
  }

  .filter-tab {
    padding: 8px 14px;
    font-size: 13px;
  }

  .template-picker__grid {
    grid-template-columns: 1fr;
    padding: 0 20px 40px;
    gap: 20px;
  }

  .template-picker__count {
    padding: 0 20px;
  }

  .template-card__select {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
