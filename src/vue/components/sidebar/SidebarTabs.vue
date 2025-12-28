<template>
  <div class="gmkb-sidebar" :class="{ 'dark-mode': isDarkMode, 'sidebar-collapsed': sidebarCollapsed }">
    <!-- ROOT FIX: Elementor-style dynamic sidebar content -->
    
    <!-- Collapse Toggle Button - Middle-Left Edge -->
    <button 
      class="sidebar-collapse-toggle"
      @click="toggleCollapse"
      :title="sidebarCollapsed ? 'Expand Sidebar ([ or Ctrl+B)' : 'Collapse Sidebar ([ or Ctrl+B)'"
    >
      <svg 
        class="collapse-icon" 
        :class="{ 'collapsed': sidebarCollapsed }"
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    
    <!-- Close Panel Button - Only visible in section/component editing modes -->
    <button 
      v-if="sidebarMode !== 'default'"
      class="panel-close-button"
      @click="closePanel"
      title="Close Panel (Return to Main)"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    <!-- DEFAULT MODE: Show tabs -->
    <template v-if="sidebarMode === 'default'">
    <!-- Tab Navigation -->
    <div class="sidebar-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    
    <!-- Search - Only for Components Tab -->
    <div v-if="activeTab === 'components'" class="search-container">
      <div class="search-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search Widget..."
          class="search-input"
        />
      </div>
    </div>
    
    <!-- Tab Content -->
    <div class="sidebar-content">
      <!-- COMPONENTS TAB -->
      <div v-show="activeTab === 'components'" class="tab-panel">
        <div
          v-for="[categoryId, category] in Object.entries(categories)"
          :key="categoryId"
          class="category-section"
        >
          <button
            @click="toggleCategory(categoryId)"
            class="category-header"
          >
            <svg 
              class="chevron-icon" 
              :class="{ expanded: expandedCategories.includes(categoryId) }"
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            <span class="category-label">{{ category.label }}</span>
            <span v-if="category.badge" class="pro-badge">{{ category.badge }}</span>
          </button>

          <div v-show="expandedCategories.includes(categoryId)" class="components-grid">
            <div
              v-for="component in category.components"
              :key="component.id"
              :draggable="!component.isPro"
              @dragstart="onDragStart($event, component.id)"
              @dragend="onDragEnd"
              @click="!component.isPro && addComponent(component.id)"
              class="component-card"
              :class="{ 'is-pro': component.isPro, 'is-dragging': draggingComponent === component.id }"
            >
              <div v-if="component.isPro" class="lock-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              
              <div class="component-icon-wrapper">
                <i :class="component.icon"></i>
              </div>
              
              <span class="component-label">{{ component.label }}</span>
            </div>
          </div>
        </div>

        <!-- Premium Upsell -->
        <div class="premium-cta">
          <div class="premium-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <h3>Unlock Premium</h3>
          </div>
          <p>Get advanced components and unlimited customization.</p>
          <button class="premium-button">Upgrade to Pro</button>
        </div>
      </div>

      <!-- LAYOUT TAB -->
      <div v-show="activeTab === 'layout'" class="tab-panel layout-panel">
        <div class="panel-section">
          <h3 class="panel-section-title">Section Layouts</h3>
          <div class="layout-list">
            <button
              v-for="layout in sectionLayouts"
              :key="layout.id"
              @click="selectLayout(layout.id)"
              class="layout-card"
              :class="{ active: selectedLayout === layout.id }"
            >
              <div class="layout-preview">
                <div
                  v-for="(col, index) in layout.columns"
                  :key="index"
                  class="layout-column"
                  :style="{ width: `${col.width}%` }"
                ></div>
              </div>
              
              <div class="layout-info">
                <div class="layout-name">{{ layout.label }}</div>
                <div class="layout-description">{{ layout.description }}</div>
              </div>

              <div v-if="selectedLayout === layout.id" class="selected-check">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </button>
          </div>

          <div class="layout-actions">
            <button @click="addSection" class="action-btn action-btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Section
            </button>
            <button @click="duplicateSection" class="action-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Duplicate
            </button>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="panel-section-title">Current Sections ({{ sections.length }})</h3>
          <div class="section-list">
            <div
              v-for="(section, index) in sections"
              :key="section.section_id"
              class="section-item"
              :class="{ 
                'dragging': draggingSection === section.section_id,
                'drag-over': dragOverSection === section.section_id
              }"
              draggable="true"
              @dragstart="onSectionDragStart($event, section.section_id)"
              @dragover="onSectionDragOver($event, section.section_id)"
              @dragenter="onSectionDragEnter($event, section.section_id)"
              @dragleave="onSectionDragLeave($event)"
              @drop="onSectionDrop($event, section.section_id)"
              @dragend="onSectionDragEnd($event)"
            >
              <button class="drag-handle" @mousedown.stop>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="5" r="1"></circle>
                  <circle cx="9" cy="12" r="1"></circle>
                  <circle cx="9" cy="19" r="1"></circle>
                  <circle cx="15" cy="5" r="1"></circle>
                  <circle cx="15" cy="12" r="1"></circle>
                  <circle cx="15" cy="19" r="1"></circle>
                </svg>
              </button>
              
              <div class="section-number">{{ index + 1 }}</div>
              
              <div class="section-details">
                <div class="section-name">{{ getSectionLabel(section.type) }}</div>
                <div class="section-meta">{{ getComponentCount(section) }} component{{ getComponentCount(section) !== 1 ? 's' : '' }}</div>
              </div>

              <button @click="removeSection(section.section_id)" class="delete-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SETTINGS TAB -->
      <div v-show="activeTab === 'settings'" class="tab-panel design-panel">
        <div class="panel-section">
          <h3 class="panel-section-title">Page Background</h3>
          
          <!-- Background Type Selector -->
          <div class="bg-type-selector">
            <button
              v-for="type in backgroundTypes"
              :key="type.id"
              @click="backgroundType = type.id"
              class="bg-type-btn"
              :class="{ active: backgroundType === type.id }"
            >
              <span class="bg-type-icon">
                <i :class="type.icon"></i>
              </span>
              <span class="bg-type-label">{{ type.label }}</span>
            </button>
          </div>
          
          <!-- SOLID COLOR -->
          <div v-show="backgroundType === 'color'" class="input-group">
            <label class="input-label">Background Color</label>
            <div class="color-picker-wrapper">
              <input
                type="color"
                v-model="pageBackgroundColor"
                @input="updatePageBackground"
                class="color-picker-input"
              />
              <input
                type="text"
                v-model="pageBackgroundColor"
                @input="updatePageBackground"
                class="text-input color-hex-input"
                placeholder="#ffffff"
              />
            </div>
          </div>
          
          <!-- GRADIENT -->
          <div v-show="backgroundType === 'gradient'" class="gradient-controls">
            <div class="input-group">
              <label class="input-label">Start Color</label>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  v-model="gradientStart"
                  @input="updatePageBackground"
                  class="color-picker-input"
                />
                <input
                  type="text"
                  v-model="gradientStart"
                  @input="updatePageBackground"
                  class="text-input color-hex-input"
                />
              </div>
            </div>
            
            <div class="input-group">
              <label class="input-label">End Color</label>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  v-model="gradientEnd"
                  @input="updatePageBackground"
                  class="color-picker-input"
                />
                <input
                  type="text"
                  v-model="gradientEnd"
                  @input="updatePageBackground"
                  class="text-input color-hex-input"
                />
              </div>
            </div>
            
            <div class="input-group">
              <label class="input-label">Gradient Angle</label>
              <div class="gradient-angle-control">
                <input
                  type="range"
                  v-model="gradientAngle"
                  @input="updatePageBackground"
                  min="0"
                  max="360"
                  class="angle-slider"
                />
                <input
                  type="number"
                  v-model="gradientAngle"
                  @input="updatePageBackground"
                  min="0"
                  max="360"
                  class="angle-input"
                />°
              </div>
            </div>
            
            <div class="gradient-preview" :style="gradientPreviewStyle"></div>
          </div>
          
          <!-- IMAGE -->
          <div v-show="backgroundType === 'image'" class="image-controls">
            <div class="input-group">
              <label class="input-label">Background Image</label>
              <div class="image-upload-wrapper">
                <button v-if="!backgroundImage" @click="openMediaLibrary" class="upload-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>Upload Image</span>
                </button>
                
                <div v-else class="image-preview-wrapper">
                  <img :src="backgroundImage" class="image-preview" />
                  <button @click="removeBackgroundImage" class="remove-image-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="backgroundImage" class="input-group">
              <label class="input-label">Image Size</label>
              <select v-model="backgroundImageSize" @change="updatePageBackground" class="select-input">
                <option value="cover">Cover (Fill)</option>
                <option value="contain">Contain (Fit)</option>
                <option value="auto">Auto (Original)</option>
              </select>
            </div>
            
            <div v-if="backgroundImage" class="input-group">
              <label class="input-label">Image Position</label>
              <select v-model="backgroundImagePosition" @change="updatePageBackground" class="select-input">
                <option value="center center">Center</option>
                <option value="top left">Top Left</option>
                <option value="top center">Top Center</option>
                <option value="top right">Top Right</option>
                <option value="center left">Center Left</option>
                <option value="center right">Center Right</option>
                <option value="bottom left">Bottom Left</option>
                <option value="bottom center">Bottom Center</option>
                <option value="bottom right">Bottom Right</option>
              </select>
            </div>
            
            <div v-if="backgroundImage" class="input-group">
              <label class="input-label">Image Repeat</label>
              <select v-model="backgroundImageRepeat" @change="updatePageBackground" class="select-input">
                <option value="no-repeat">No Repeat</option>
                <option value="repeat">Repeat</option>
                <option value="repeat-x">Repeat Horizontally</option>
                <option value="repeat-y">Repeat Vertically</option>
              </select>
            </div>
            
            <div v-if="backgroundImage" class="input-group">
              <label class="input-label">Overlay Color</label>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  v-model="backgroundOverlayColor"
                  @input="updatePageBackground"
                  class="color-picker-input"
                />
                <input
                  type="text"
                  v-model="backgroundOverlayColor"
                  @input="updatePageBackground"
                  class="text-input color-hex-input"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <div v-if="backgroundImage" class="input-group">
              <label class="input-label">Overlay Opacity</label>
              <div class="opacity-control">
                <input
                  type="range"
                  v-model="backgroundOverlayOpacity"
                  @input="updatePageBackground"
                  min="0"
                  max="100"
                  class="opacity-slider"
                />
                <span class="opacity-value">{{ backgroundOverlayOpacity }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel-section">
          <h3 class="panel-section-title">Active Theme</h3>
          <div class="theme-list">
            <button
              v-for="theme in themes"
              :key="theme.id"
              @click="selectTheme(theme.id)"
              class="theme-card"
              :class="{ active: selectedTheme === theme.id }"
            >
              <div class="theme-swatch" :style="{ backgroundColor: theme.color }"></div>
              <span class="theme-name">{{ theme.name }}</span>
              <div v-if="selectedTheme === theme.id" class="selected-check">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
          <button class="secondary-btn" @click="openThemeCustomizer">Browse All Themes</button>
        </div>

        <div class="panel-section">
          <h3 class="panel-section-title">Global Spacing</h3>
          <div class="input-group">
            <label class="input-label">Max Width</label>
            <input type="text" class="text-input" value="900px" />
          </div>
          <div class="input-group">
            <label class="input-label">Section Spacing</label>
            <input type="text" class="text-input" value="30px" />
          </div>
          <div class="input-group">
            <label class="input-label">Container Padding</label>
            <input type="text" class="text-input" value="20px" />
          </div>
        </div>

        <div class="panel-section">
          <h3 class="panel-section-title">Customize</h3>
          <button class="customize-btn" @click="openThemeCustomizer('colors')">
            <div class="customize-icon">
              <i class="fa-solid fa-palette"></i>
            </div>
            <span>Global Colors</span>
          </button>
          <button class="customize-btn" @click="openThemeCustomizer('typography')">
            <div class="customize-icon">
              <i class="fa-solid fa-font"></i>
            </div>
            <span>Global Fonts</span>
          </button>
          <button class="customize-btn" @click="openThemeCustomizer('spacing')">
            <div class="customize-icon">
              <i class="fa-solid fa-gear"></i>
            </div>
            <span>Advanced Settings</span>
          </button>
        </div>

        <!-- SEO & Visibility Section -->
        <div class="panel-section seo-section">
          <h3 class="panel-section-title">
            <i class="fa-solid fa-search"></i>
            SEO & Visibility
          </h3>

          <!-- AEO Score Badge -->
          <div v-if="seoData.aeoScore !== null" class="aeo-score-badge" :class="getAeoGradeClass(seoData.aeoScore)">
            <div class="aeo-score-value">{{ seoData.aeoScore }}</div>
            <div class="aeo-score-label">AEO Score</div>
          </div>

          <div class="input-group">
            <label class="input-label">Meta Title</label>
            <input
              type="text"
              class="text-input"
              v-model="seoData.metaTitle"
              @input="updateSeoData"
              :placeholder="seoData.profileName ? `${seoData.profileName} - Media Kit` : 'Page title for search engines'"
            />
            <span class="input-hint">{{ seoData.metaTitle?.length || 0 }}/60 characters</span>
          </div>

          <div class="input-group">
            <label class="input-label">Meta Description</label>
            <textarea
              class="text-input textarea-input"
              rows="3"
              v-model="seoData.metaDescription"
              @input="updateSeoData"
              :placeholder="seoData.profileBio ? seoData.profileBio.substring(0, 155) + '...' : 'Brief description for search results'"
            ></textarea>
            <span class="input-hint">{{ seoData.metaDescription?.length || 0 }}/160 characters</span>
          </div>

          <div class="input-group">
            <label class="input-label">Schema Type</label>
            <select class="select-input" v-model="seoData.schemaType" @change="updateSeoData">
              <option value="Person">Person (Individual)</option>
              <option value="Organization">Organization</option>
              <option value="ProfilePage">Profile Page</option>
            </select>
          </div>

          <button
            v-if="hasProfileSeo"
            class="secondary-btn sync-btn"
            @click="syncSeoFromProfile"
            :disabled="isSyncingSeo"
          >
            <i :class="isSyncingSeo ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-sync'"></i>
            {{ isSyncingSeo ? 'Syncing...' : 'Sync from Profile' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Action Button -->
    <div class="sidebar-footer">
      <button class="footer-action-btn" @click="handleFooterAction">
        <span class="plus-icon">+</span>
        {{ getFooterButtonText }}
      </button>
    </div>
    </template>
    
    <!-- SECTION EDITING MODE -->
    <template v-else-if="sidebarMode === 'section'">
      <SectionEditor
        :section-id="editingSectionId"
        key="section-editor"
      />
    </template>
    
    <!-- COMPONENT EDITING MODE -->
    <template v-else-if="sidebarMode === 'component'">
      <ComponentEditor
        :component-id="editingComponentId"
        key="component-editor"
      />
    </template>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted, onBeforeUnmount, watch } from 'vue';
import { useMediaKitStore } from '../../../stores/mediaKit';
import { useUIStore } from '../../../stores/ui';
import { useThemeStore } from '../../../stores/theme';
import UnifiedComponentRegistry from '../../../services/UnifiedComponentRegistry';
import SectionEditor from './SectionEditor.vue';
import ComponentEditor from './ComponentEditor.vue';

export default {
  name: 'SidebarTabs',
  
  components: {
    SectionEditor,
    ComponentEditor
  },
  
  setup() {
    const store = useMediaKitStore();
    const uiStore = useUIStore();
    const themeStore = useThemeStore();
    const isDarkMode = inject('isDarkMode', ref(false));
    
    // ROOT FIX: Sidebar mode state from UI store
    const sidebarMode = computed(() => uiStore.sidebarMode);
    const editingSectionId = computed(() => uiStore.editingSectionId);
    const editingComponentId = computed(() => uiStore.editingComponentId);
    
    // NEW: Sidebar collapse state
    const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed);
    
    // DEBUG: Watch sidebar mode changes
    watch(sidebarMode, (newMode, oldMode) => {
      console.log('🔄 SidebarTabs: Mode changed from', oldMode, 'to', newMode);
    });
    
    watch(editingSectionId, (newId) => {
      console.log('🔄 SidebarTabs: Editing section ID:', newId);
    });
    
    watch(editingComponentId, (newId) => {
      console.log('🔄 SidebarTabs: Editing component ID:', newId);
    });
    
    // State
    const activeTab = ref('components');
    const searchTerm = ref('');
    const expandedCategories = ref(['basic']);
    const selectedLayout = ref('full_width');
    const selectedTheme = ref(computed({
      get: () => store.theme || 'professional_clean',
      set: (value) => { store.theme = value; }
    }));
    const draggingComponent = ref(null);
    
    // ROOT FIX: Section drag-and-drop state
    const draggingSection = ref(null);
    const dragOverSection = ref(null);
    
    // Page background - Enhanced with multiple types
    const backgroundType = ref('color');
    const pageBackgroundColor = ref('#ffffff');
    
    // Gradient settings
    const gradientStart = ref('#4f46e5');
    const gradientEnd = ref('#ec4899');
    const gradientAngle = ref(135);
    
    // Image settings
    const backgroundImage = ref('');
    const backgroundImageSize = ref('cover');
    const backgroundImagePosition = ref('center center');
    const backgroundImageRepeat = ref('no-repeat');
    const backgroundOverlayColor = ref('#000000');
    const backgroundOverlayOpacity = ref(0);

    // SEO Data - auto-populated from profile
    const seoData = ref({
      metaTitle: '',
      metaDescription: '',
      schemaType: 'Person',
      aeoScore: null,
      profileName: '',
      profileBio: ''
    });
    const isSyncingSeo = ref(false);

    // Check if profile has SEO data available
    const hasProfileSeo = computed(() => {
      return !!(window.gmkbData?.profile_id || window.gmkbVueData?.pods_data);
    });

    // Get AEO grade class based on score
    const getAeoGradeClass = (score) => {
      if (score >= 80) return 'aeo-grade-a';
      if (score >= 60) return 'aeo-grade-b';
      if (score >= 40) return 'aeo-grade-c';
      return 'aeo-grade-d';
    };

    // Update SEO data in store
    const updateSeoData = () => {
      store.customSettings = {
        ...store.customSettings,
        seo: {
          metaTitle: seoData.value.metaTitle,
          metaDescription: seoData.value.metaDescription,
          schemaType: seoData.value.schemaType
        }
      };
      store._trackChange();
    };

    // Sync SEO data from profile
    const syncSeoFromProfile = async () => {
      isSyncingSeo.value = true;

      try {
        const profileId = window.gmkbData?.profile_id || store.profileId;
        if (!profileId) {
          console.warn('[SidebarTabs] No profile ID available for SEO sync');
          return;
        }

        // Fetch profile SEO data from API
        const response = await fetch(`/wp-json/gmkb/v2/profile/${profileId}`, {
          headers: {
            'X-WP-Nonce': window.gmkbData?.nonce || window.gmkbVueData?.nonce || ''
          }
        });

        if (response.ok) {
          const data = await response.json();

          // Auto-populate from profile data
          const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
          seoData.value.profileName = fullName;
          seoData.value.profileBio = data.biography || data.bio || '';

          // Set meta title if empty
          if (!seoData.value.metaTitle && fullName) {
            seoData.value.metaTitle = `${fullName} - Media Kit`;
          }

          // Set meta description from bio if empty
          if (!seoData.value.metaDescription && seoData.value.profileBio) {
            seoData.value.metaDescription = seoData.value.profileBio.substring(0, 155);
          }

          // Get AEO score if available
          if (data.seo?.aeo_score !== undefined) {
            seoData.value.aeoScore = data.seo.aeo_score;
          }

          updateSeoData();
          console.log('[SidebarTabs] ✅ SEO data synced from profile');
        }
      } catch (error) {
        console.error('[SidebarTabs] ❌ Failed to sync SEO from profile:', error);
      } finally {
        isSyncingSeo.value = false;
      }
    };

    // Background types
    const backgroundTypes = [
      { id: 'color', icon: 'fa-solid fa-palette', label: 'Color' },
      { id: 'gradient', icon: 'fa-solid fa-brush', label: 'Gradient' },
      { id: 'image', icon: 'fa-solid fa-image', label: 'Image' }
    ];
    
    // Tabs
    const tabs = [
      { id: 'components', label: 'Components', icon: '☰' },
      { id: 'layout', label: 'Layout', icon: '📐' },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];
    
    // Dynamic categories from registry - SELF-CONTAINED ARCHITECTURE
    // All component metadata including accordion grouping is defined in component.json
    const categories = computed(() => {
      const registryComponents = UnifiedComponentRegistry.getAll();
      
      const basic = [];
      const media = [];
      const premium = [];
      
      registryComponents.forEach(comp => {
        const componentData = {
          id: comp.type,
          // Read icon directly from component.json (required field)
          icon: comp.icon || 'fa-solid fa-cube',
          // Read label directly from component.json
          label: comp.name || comp.type,
          isPro: comp.isPremium || false
        };
        
        // ROOT FIX: Read accordion group from component.json instead of hardcoded logic
        // This maintains self-contained component architecture
        const accordionGroup = comp.accordionGroup || 'basic'; // Default to basic if not specified
        
        if (accordionGroup === 'premium') {
          premium.push(componentData);
        } else if (accordionGroup === 'media') {
          media.push(componentData);
        } else {
          basic.push(componentData);
        }
      });
      
      return {
        basic: {
          label: 'Basic',
          components: basic
        },
        media: {
          label: 'Media & Content',
          components: media
        },
        premium: {
          label: 'Premium',
          badge: 'PRO',
          components: premium
        }
      };
    });
    
    // Section Layouts
    const sectionLayouts = [
      { id: 'full_width', label: 'Full Width', columns: [{ width: 100 }], description: '100%' },
      { id: 'two_column', label: 'Two Column', columns: [{ width: 50 }, { width: 50 }], description: '50% / 50%' },
      { id: 'main_sidebar', label: 'Main + Sidebar', columns: [{ width: 70 }, { width: 30 }], description: '70% / 30%' },
      { id: 'sidebar_main', label: 'Sidebar + Main', columns: [{ width: 30 }, { width: 70 }], description: '30% / 70%' },
      { id: 'three_column', label: 'Three Column', columns: [{ width: 33 }, { width: 34 }, { width: 33 }], description: '33% / 33% / 33%' }
    ];
    
    // Themes
    const themes = computed(() => {
      if (themeStore.availableThemes && themeStore.availableThemes.length > 0) {
        return themeStore.availableThemes;
      }
      return [
        { id: 'professional_clean', name: 'Professional Clean', color: '#4f46e5' },
        { id: 'creative_bold', name: 'Creative Bold', color: '#f97316' },
        { id: 'minimal_elegant', name: 'Minimal Elegant', color: '#18181b' },
        { id: 'modern_dark', name: 'Modern Dark', color: '#8b5cf6' }
      ];
    });
    
    // Computed
    const sections = computed(() => store.sections || []);
    
    const gradientPreviewStyle = computed(() => {
      return {
        background: `linear-gradient(${gradientAngle.value}deg, ${gradientStart.value}, ${gradientEnd.value})`
      };
    });
    
    const getFooterButtonText = computed(() => {
      if (activeTab.value === 'components') return 'Add Component';
      if (activeTab.value === 'layout') return 'Add Section';
      return 'Save Changes';
    });
    
    // Methods
    const toggleCategory = (categoryId) => {
      const index = expandedCategories.value.indexOf(categoryId);
      if (index > -1) {
        expandedCategories.value.splice(index, 1);
      } else {
        expandedCategories.value.push(categoryId);
      }
    };
    
    const onDragStart = (event, componentId) => {
      draggingComponent.value = componentId;
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('component-type', componentId);
      event.dataTransfer.setData('text/plain', componentId);
      event.dataTransfer.setData('application/json', JSON.stringify({ type: componentId }));
      console.log('✅ Drag started:', componentId);
    };
    
    const onDragEnd = () => {
      draggingComponent.value = null;
    };
    
    // ROOT FIX: Section drag-and-drop handlers
    const onSectionDragStart = (event, sectionId) => {
      draggingSection.value = sectionId;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('section-id', sectionId);
      
      // Add visual feedback
      if (event.target) {
        event.target.style.opacity = '0.5';
      }
      
      console.log('✅ Section drag started:', sectionId);
    };
    
    const onSectionDragOver = (event, sectionId) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      dragOverSection.value = sectionId;
    };
    
    const onSectionDragEnter = (event, sectionId) => {
      event.preventDefault();
      dragOverSection.value = sectionId;
    };
    
    const onSectionDragLeave = (event) => {
      dragOverSection.value = null;
    };
    
    const onSectionDrop = (event, targetSectionId) => {
      event.preventDefault();
      
      const sourceSectionId = draggingSection.value;
      
      if (!sourceSectionId || sourceSectionId === targetSectionId) {
        return;
      }
      
      // Find the indices of source and target sections
      const sourceIndex = store.sections.findIndex(s => s.section_id === sourceSectionId);
      const targetIndex = store.sections.findIndex(s => s.section_id === targetSectionId);
      
      if (sourceIndex === -1 || targetIndex === -1) {
        console.error('Section not found:', { sourceSectionId, targetSectionId });
        return;
      }
      
      // Reorder sections in the store
      const sections = [...store.sections];
      const [movedSection] = sections.splice(sourceIndex, 1);
      sections.splice(targetIndex, 0, movedSection);
      
      store.sections = sections;
      store._trackChange();
      
      console.log('✅ Section reordered:', { from: sourceIndex, to: targetIndex });
    };
    
    const onSectionDragEnd = (event) => {
      // Clear visual feedback
      if (event.target) {
        event.target.style.opacity = '';
      }
      
      draggingSection.value = null;
      dragOverSection.value = null;
    };
    
    const addComponent = (componentId) => {
      // Ensure we have at least one section
      if (store.sections.length === 0) {
        store.addSection('full_width');
      }
      
      // Add component to first section
      const firstSection = store.sections[0];
      store.addComponent({
        type: componentId,
        sectionId: firstSection.section_id
      });
      
      console.log('✅ Added component:', componentId);
    };
    
    const selectLayout = (layoutId) => {
      selectedLayout.value = layoutId;
      console.log('✅ Selected layout:', layoutId);
    };
    
    const selectTheme = (themeId) => {
      console.log('=== THEME SELECTION START ===');
      console.log('1. themeId:', themeId);
      
      try {
        console.log('2. Updating media kit store...');
        console.log('   - Current theme:', store.theme);
        store.theme = themeId;
        console.log('   - New theme:', store.theme);
        console.log('   - SUCCESS');
        
        console.log('3. Calling store._trackChange()...');
        store._trackChange();
        console.log('   - SUCCESS');
        
        console.log('4. Updating theme store...');
        themeStore.selectTheme(themeId);
        console.log('   - SUCCESS');
        
        console.log('5. Updating local selectedTheme ref...');
        selectedTheme.value.value = themeId;
        console.log('   - SUCCESS');
        
        console.log('6. Dispatching event...');
        document.dispatchEvent(new CustomEvent('gmkb:change-theme', {
          detail: { themeId }
        }));
        console.log('   - SUCCESS');
        
        console.log('=== THEME SELECTION COMPLETE ===');
        console.log('✅ Theme changed to:', themeId);
        
      } catch (error) {
        console.error('=== THEME SELECTION ERROR ===');
        console.error('❌ Error:', error);
        console.error('❌ Message:', error.message);
        console.error('❌ Stack:', error.stack);
        console.error('=== END ERROR ===');
      }
    };
    
    const addSection = () => {
      if (selectedLayout.value) {
        store.addSection(selectedLayout.value);
        console.log('✅ Added section:', selectedLayout.value);
      }
    };
    
    const duplicateSection = () => {
      if (sections.value.length > 0) {
        const lastSection = sections.value[sections.value.length - 1];
        store.addSection(lastSection.type);
        console.log('✅ Duplicated section');
      }
    };
    
    const removeSection = (sectionId) => {
      if (confirm('Remove this section?')) {
        store.removeSection(sectionId);
        console.log('✅ Removed section:', sectionId);
      }
    };
    
    const getSectionLabel = (type) => {
      const labels = {
        'full_width': 'Full Width',
        'two_column': 'Two Column',
        'three_column': 'Three Column',
        'main_sidebar': 'Main + Sidebar',
        'sidebar_main': 'Sidebar + Main'
      };
      return labels[type] || type;
    };
    
    /**
     * ROOT FIX: Accurately count components in BOTH section structures
     * - Full-width sections: section.components array
     * - Multi-column sections: section.columns object (sum all column arrays)
     */
    const getComponentCount = (section) => {
      let count = 0;
      
      // Count components in full-width sections
      if (section.components && Array.isArray(section.components)) {
        count += section.components.length;
      }
      
      // Count components in multi-column sections
      if (section.columns && typeof section.columns === 'object') {
        Object.values(section.columns).forEach(column => {
          if (Array.isArray(column)) {
            count += column.length;
          }
        });
      }
      
      return count;
    };
    
    const openLibrary = () => {
      // Dispatch event to open component library
      document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
      console.log('✅ Opening component library');
    };
    
    const handleFooterAction = () => {
      if (activeTab.value === 'components') {
        openLibrary();
      } else if (activeTab.value === 'layout') {
        addSection();
      } else {
        console.log('Save changes');
      }
    };
    
    // Update page background color
    const updatePageBackground = () => {
      const previewElement = document.getElementById('media-kit-preview');
      if (!previewElement) return;
      
      // Clear all background styles first
      previewElement.style.background = '';
      previewElement.style.backgroundColor = '';
      previewElement.style.backgroundImage = '';
      previewElement.style.backgroundSize = '';
      previewElement.style.backgroundPosition = '';
      previewElement.style.backgroundRepeat = '';
      
      let backgroundConfig = {
        type: backgroundType.value
      };
      
      // Apply based on type
      if (backgroundType.value === 'color') {
        previewElement.style.backgroundColor = pageBackgroundColor.value;
        backgroundConfig.color = pageBackgroundColor.value;
        
      } else if (backgroundType.value === 'gradient') {
        const gradient = `linear-gradient(${gradientAngle.value}deg, ${gradientStart.value}, ${gradientEnd.value})`;
        previewElement.style.background = gradient;
        backgroundConfig.gradient = {
          start: gradientStart.value,
          end: gradientEnd.value,
          angle: gradientAngle.value
        };
        
      } else if (backgroundType.value === 'image' && backgroundImage.value) {
        // Base image
        previewElement.style.backgroundImage = `url(${backgroundImage.value})`;
        previewElement.style.backgroundSize = backgroundImageSize.value;
        previewElement.style.backgroundPosition = backgroundImagePosition.value;
        previewElement.style.backgroundRepeat = backgroundImageRepeat.value;
        
        // Overlay
        if (backgroundOverlayOpacity.value > 0) {
          const overlayRgba = hexToRgba(backgroundOverlayColor.value, backgroundOverlayOpacity.value / 100);
          previewElement.style.background = `linear-gradient(${overlayRgba}, ${overlayRgba}), url(${backgroundImage.value})`;
          previewElement.style.backgroundSize = backgroundImageSize.value;
          previewElement.style.backgroundPosition = backgroundImagePosition.value;
          previewElement.style.backgroundRepeat = backgroundImageRepeat.value;
        }
        
        backgroundConfig.image = {
          url: backgroundImage.value,
          size: backgroundImageSize.value,
          position: backgroundImagePosition.value,
          repeat: backgroundImageRepeat.value,
          overlayColor: backgroundOverlayColor.value,
          overlayOpacity: backgroundOverlayOpacity.value
        };
      }
      
      // Save to store for persistence
      store.customSettings = {
        ...store.customSettings,
        pageBackground: backgroundConfig
      };
      
      store._trackChange();
      console.log('✅ Page background updated:', backgroundType.value, backgroundConfig);
    };
    
    // Helper: Convert hex to rgba
    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    // Open WordPress Media Library
    const openMediaLibrary = () => {
      if (typeof wp !== 'undefined' && wp.media) {
        const frame = wp.media({
          title: 'Select Background Image',
          button: { text: 'Use Image' },
          multiple: false,
          library: { type: 'image' }
        });
        
        frame.on('select', () => {
          const attachment = frame.state().get('selection').first().toJSON();
          backgroundImage.value = attachment.url;
          updatePageBackground();
        });
        
        frame.open();
      } else {
        alert('WordPress Media Library is not available');
      }
    };
    
    // Remove background image
    const removeBackgroundImage = () => {
      backgroundImage.value = '';
      backgroundType.value = 'color';
      updatePageBackground();
    };
    
    // Open theme customizer
    const openThemeCustomizer = (panel = 'themes') => {
      // CRITICAL FIX: Pass panel directly to openCustomizer
      themeStore.openCustomizer(panel);
      console.log('✅ Opened theme customizer:', panel);
    };
    
    // Refresh components from registry
    const refreshComponents = () => {
      console.log('✅ Refreshed components from registry');
    };
    
    // Event handlers
    const handleComponentsDiscovered = () => {
      refreshComponents();
    };
    
    // NEW: Toggle sidebar collapse
    const toggleCollapse = () => {
      uiStore.toggleSidebarCollapse();
      console.log('✅ Sidebar collapse toggled:', uiStore.sidebarCollapsed);
    };
    
    // NEW: Close panel and return to main sidebar
    const closePanel = () => {
      uiStore.closeSidebarEditor();
      console.log('✅ Panel closed, returned to main sidebar');
    };
    
    // NEW: Keyboard shortcut handler
    const handleKeyboardShortcut = (event) => {
      // Listen for [ key or Ctrl+B
      if ((event.key === '[' && !event.ctrlKey && !event.metaKey) || 
          ((event.ctrlKey || event.metaKey) && event.key === 'b')) {
        // Only if not typing in an input/textarea
        const activeElement = document.activeElement;
        if (activeElement && 
            (activeElement.tagName === 'INPUT' || 
             activeElement.tagName === 'TEXTAREA' ||
             activeElement.contentEditable === 'true')) {
          return;
        }
        
        event.preventDefault();
        toggleCollapse();
      }
    };
    
    // Lifecycle
    onMounted(() => {
      // Load collapse state from localStorage
      uiStore.loadSidebarCollapseState();
      
      // Add keyboard shortcut listener
      document.addEventListener('keydown', handleKeyboardShortcut);
      
      document.addEventListener('gmkb:components-discovered', handleComponentsDiscovered);
      refreshComponents();
      
      // Initialize page background from store
      if (store.customSettings?.pageBackground) {
        const bg = store.customSettings.pageBackground;
        
        // Legacy support: if it's just a string, treat as color
        if (typeof bg === 'string') {
          backgroundType.value = 'color';
          pageBackgroundColor.value = bg;
        } else {
          // New format: object with type
          backgroundType.value = bg.type || 'color';
          
          if (bg.type === 'color' && bg.color) {
            pageBackgroundColor.value = bg.color;
          } else if (bg.type === 'gradient' && bg.gradient) {
            gradientStart.value = bg.gradient.start;
            gradientEnd.value = bg.gradient.end;
            gradientAngle.value = bg.gradient.angle;
          } else if (bg.type === 'image' && bg.image) {
            backgroundImage.value = bg.image.url;
            backgroundImageSize.value = bg.image.size;
            backgroundImagePosition.value = bg.image.position;
            backgroundImageRepeat.value = bg.image.repeat;
            backgroundOverlayColor.value = bg.image.overlayColor;
            backgroundOverlayOpacity.value = bg.image.overlayOpacity;
          }
        }

        updatePageBackground();
      }

      // Initialize SEO data from store or auto-sync from profile
      if (store.customSettings?.seo) {
        const seo = store.customSettings.seo;
        seoData.value.metaTitle = seo.metaTitle || '';
        seoData.value.metaDescription = seo.metaDescription || '';
        seoData.value.schemaType = seo.schemaType || 'Person';
      } else if (hasProfileSeo.value) {
        // Auto-sync from profile on first load
        syncSeoFromProfile();
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
      document.removeEventListener('gmkb:components-discovered', handleComponentsDiscovered);
    });
    
    return {
      isDarkMode,
      sidebarMode,
      editingSectionId,
      editingComponentId,
      sidebarCollapsed,
      toggleCollapse,
      closePanel,
      activeTab,
      searchTerm,
      expandedCategories,
      selectedLayout,
      selectedTheme,
      draggingComponent,
      backgroundType,
      backgroundTypes,
      pageBackgroundColor,
      gradientStart,
      gradientEnd,
      gradientAngle,
      gradientPreviewStyle,
      backgroundImage,
      backgroundImageSize,
      backgroundImagePosition,
      backgroundImageRepeat,
      backgroundOverlayColor,
      backgroundOverlayOpacity,
      tabs,
      categories,
      sectionLayouts,
      themes,
      sections,
      getFooterButtonText,
      toggleCategory,
      onDragStart,
      onDragEnd,
      addComponent,
      selectLayout,
      selectTheme,
      addSection,
      duplicateSection,
      removeSection,
      getSectionLabel,
      getComponentCount,
      openLibrary,
      handleFooterAction,
      updatePageBackground,
      openMediaLibrary,
      removeBackgroundImage,
      openThemeCustomizer,
      // ROOT FIX: Section drag-and-drop methods
      draggingSection,
      dragOverSection,
      onSectionDragStart,
      onSectionDragOver,
      onSectionDragEnter,
      onSectionDragLeave,
      onSectionDrop,
      onSectionDragEnd,
      // SEO data and methods
      seoData,
      hasProfileSeo,
      isSyncingSeo,
      getAeoGradeClass,
      updateSeoData,
      syncSeoFromProfile
    };
  }
};
</script>

<style>
/* Global box-sizing reset */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Base Sidebar Container - LIGHT MODE DEFAULT */
.gmkb-sidebar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
  position: relative;
  overflow: visible; /* CRITICAL: Allow toggle button to remain visible */
}

/* Collapsed State */
.gmkb-sidebar.sidebar-collapsed {
  width: 48px !important;
  min-width: 48px !important;
}

.gmkb-sidebar.sidebar-collapsed .sidebar-tabs,
.gmkb-sidebar.sidebar-collapsed .search-container,
.gmkb-sidebar.sidebar-collapsed .sidebar-content,
.gmkb-sidebar.sidebar-collapsed .sidebar-footer {
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  transition: opacity 0.2s ease; /* Smooth fade out */
}

/* Collapse Toggle Button - Middle-Left Edge (Option 3 - Enhanced Visibility) */
.sidebar-collapse-toggle {
  position: absolute;
  left: -8px; /* Reduced offset for better visibility */
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  width: 36px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, white, #f9fafb);
  border: 2px solid #d1d5db; /* Thicker border for visibility */
  border-right: none; /* No border on right side */
  border-radius: 8px 0 0 8px; /* More rounded for visibility */
  cursor: pointer;
  transition: all 0.2s;
  color: #374151; /* Darker for better contrast */
  box-shadow: -3px 0 10px rgba(0, 0, 0, 0.15); /* Stronger shadow */
}

.sidebar-collapse-toggle:hover {
  background: linear-gradient(to right, #ec4899, #f472b6); /* Pink gradient on hover */
  border-color: #ec4899;
  color: white;
  left: -10px; /* Slide out slightly on hover */
  box-shadow: -6px 0 16px rgba(236, 72, 153, 0.4);
  transform: translateY(-50%) scale(1.05);
}

.sidebar-collapsed .sidebar-collapse-toggle {
  left: -8px; /* Keep same position when collapsed */
}

body.dark-mode .sidebar-collapse-toggle {
  background: linear-gradient(to right, #1e293b, #334155);
  border-color: #475569;
  color: #d1d5db;
  box-shadow: -3px 0 10px rgba(0, 0, 0, 0.4);
}

body.dark-mode .sidebar-collapse-toggle:hover {
  background: linear-gradient(to right, #ec4899, #f472b6);
  border-color: #ec4899;
  color: white;
  box-shadow: -6px 0 16px rgba(236, 72, 153, 0.5);
}

/* Panel Close Button - Top-Right Corner */
.panel-close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 100;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.panel-close-button:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
  transform: scale(1.05);
}

body.dark-mode .panel-close-button {
  background: #1e293b;
  border-color: #334155;
  color: #9ca3af;
}

body.dark-mode .panel-close-button:hover {
  background: rgba(220, 38, 38, 0.2);
  border-color: #dc2626;
  color: #fca5a5;
}

/* Hide close button when sidebar is collapsed */
.sidebar-collapsed .panel-close-button {
  opacity: 0;
  pointer-events: none;
}

.collapse-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 18px;
  height: 18px;
  stroke-width: 2.5; /* Thicker stroke for visibility */
}

.collapse-icon.collapsed {
  transform: rotate(180deg); /* Points right when collapsed */
}

/* Enhanced icon visibility on hover */
.sidebar-collapse-toggle:hover .collapse-icon {
  stroke-width: 3; /* Even thicker on hover */
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
}

/* Ensure button stays visible when collapsed */
.sidebar-collapsed .sidebar-collapse-toggle:hover {
  transform: translateY(-50%) scale(1.05); /* Maintain vertical centering with scale */
  left: -10px; /* Same hover effect when collapsed */
}

/* Dark mode */
body.dark-mode .gmkb-sidebar {
  background: #0f172a;
  border-right-color: #334155;
}

/* Collapsed State - No visual indicator needed (collapse button always visible) */

/* Tab Navigation */
.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}

body.dark-mode .sidebar-tabs {
  border-bottom-color: #334155;
  background: #1e293b;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 500;
}

.tab-button:hover {
  color: #111827;
  background: rgba(0, 0, 0, 0.02);
}

body.dark-mode .tab-button {
  color: #9ca3af;
}

body.dark-mode .tab-button:hover {
  color: #f3f4f6;
  background: rgba(255, 255, 255, 0.05);
}

.tab-button.active {
  color: #ec4899;
  border-bottom-color: #ec4899;
  background: white;
}

body.dark-mode .tab-button.active {
  background: #0f172a;
}

/* Search Container */
.search-container {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

body.dark-mode .search-container {
  border-bottom-color: #334155;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

body.dark-mode .search-input {
  background: #1e293b;
  border-color: #334155;
  color: #f3f4f6;
}

/* Sidebar Content */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden; /* Prevent horizontal overflow when collapsed */
  transition: opacity 0.2s ease;
}

.tab-panel {
  padding-bottom: 16px;
}

/* Category Section */
.category-section {
  border-bottom: 1px solid #e5e7eb;
}

body.dark-mode .category-section {
  border-bottom-color: #334155;
}

.category-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.category-header:hover {
  background: #f9fafb;
}

body.dark-mode .category-header:hover {
  background: #1e293b;
}

.chevron-icon {
  color: #9ca3af;
  transition: transform 0.2s;
}

.chevron-icon.expanded {
  transform: rotate(90deg);
}

.category-label {
  flex: 1;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #374151;
}

body.dark-mode .category-label {
  color: #d1d5db;
}

.pro-badge {
  padding: 2px 6px;
  background: linear-gradient(to right, #ec4899, #a855f7);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
  text-transform: uppercase;
}

/* Components Grid */
.components-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 8px 12px 16px;
}

.component-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: move;
  transition: all 0.2s;
}

.component-card:hover {
  border-color: #ec4899;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.component-card.is-pro {
  opacity: 0.6;
  cursor: not-allowed;
}

.component-card.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

body.dark-mode .component-card {
  background: #1e293b;
  border-color: #334155;
}

.lock-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #9ca3af;
}

.component-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 0;
}

body.dark-mode .component-icon-wrapper {  
  background: transparent;
}

.component-icon-wrapper i {
  font-size: 24px;
  color: #6b7280;
  opacity: 0.7;
  transition: all 0.2s;
}

.component-card:hover .component-icon-wrapper i {
  color: #374151;
  opacity: 1;
}

body.dark-mode .component-icon-wrapper i {
  color: #9ca3af;
  opacity: 0.6;
}

body.dark-mode .component-card:hover .component-icon-wrapper i {
  color: #d1d5db;
  opacity: 1;
}

.component-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: #374151;
  line-height: 1.3;
}

body.dark-mode .component-label {
  color: #d1d5db;
}

/* Premium CTA */
.premium-cta {
  margin: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
  border-radius: 8px;
  color: white;
}

.premium-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.premium-header h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.premium-cta p {
  font-size: 12px;
  opacity: 0.9;
  margin: 0 0 12px;
}

.premium-button {
  width: 100%;
  padding: 8px;
  background: white;
  color: #ec4899;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.premium-button:hover {
  background: #f9fafb;
}

/* Layout Panel */
.panel-section {
  margin: 16px;
  margin-bottom: 24px;
}

.panel-section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #374151;
  margin: 0 0 12px;
}

body.dark-mode .panel-section-title {
  color: #d1d5db;
}

.layout-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.layout-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.layout-card:hover {
  border-color: #ec4899;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.layout-card.active {
  border-color: #ec4899;
  background: #fdf2f8;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.15);
}

body.dark-mode .layout-card {
  background: #1e293b;
  border-color: #334155;
}

body.dark-mode .layout-card.active {
  background: rgba(236, 72, 153, 0.1);
}

.layout-preview {
  width: 64px;
  height: 48px;
  display: flex;
  gap: 2px;
  padding: 6px;
  background: #f3f4f6;
  border-radius: 4px;
  flex-shrink: 0;
}

body.dark-mode .layout-preview {
  background: #334155;
}

.layout-column {
  background: #9ca3af;
  border-radius: 2px;
}

body.dark-mode .layout-column {
  background: #6b7280;
}

.layout-info {
  flex: 1;
  text-align: left;
}

.layout-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

body.dark-mode .layout-name {
  color: #f3f4f6;
}

.layout-description {
  font-size: 12px;
  color: #6b7280;
}

body.dark-mode .layout-description {
  color: #9ca3af;
}

.selected-check {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ec4899;
  border-radius: 50%;
  color: white;
  flex-shrink: 0;
}

/* Action Buttons */
.layout-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

body.dark-mode .action-btn {
  background: #1e293b;
  border-color: #334155;
  color: #d1d5db;
}

body.dark-mode .action-btn:hover {
  background: #334155;
}

.action-btn-primary {
  flex: 1.5;
}

/* Section List */
.section-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: move;
}

.section-item:hover {
  background: #f9fafb;
}

/* ROOT FIX: Drag-and-drop visual feedback */
.section-item.dragging {
  opacity: 0.5;
  border-color: #ec4899;
  background: #fdf2f8;
}

.section-item.drag-over {
  border-color: #ec4899;
  border-width: 2px;
  background: #fdf2f8;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

body.dark-mode .section-item {
  background: #1e293b;
  border-color: #334155;
}

body.dark-mode .section-item:hover {
  background: #334155;
}

/* ROOT FIX: Dark mode drag-and-drop styles */
body.dark-mode .section-item.dragging {
  opacity: 0.5;
  border-color: #ec4899;
  background: rgba(236, 72, 153, 0.1);
}

body.dark-mode .section-item.drag-over {
  border-color: #ec4899;
  background: rgba(236, 72, 153, 0.15);
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.2);
}

.drag-handle {
  padding: 4px;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: grab;
  border-radius: 4px;
  transition: all 0.2s;
}

.drag-handle:hover {
  background: rgba(156, 163, 175, 0.1);
  color: #6b7280;
}

.drag-handle:active {
  cursor: grabbing;
}

.section-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 4px;
  color: #06b6d4;
  font-size: 12px;
  font-weight: 600;
}

.section-details {
  flex: 1;
}

.section-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

body.dark-mode .section-name {
  color: #f3f4f6;
}

.section-meta {
  font-size: 12px;
  color: #6b7280;
}

body.dark-mode .section-meta {
  color: #9ca3af;
}

.delete-btn {
  padding: 4px;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
  opacity: 0;
}

.section-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #ef4444;
}

/* Design Panel */
.theme-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.theme-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.theme-card:hover {
  border-color: #ec4899;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.theme-card.active {
  border-color: #ec4899;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.15);
}

body.dark-mode .theme-card {
  background: #1e293b;
  border-color: #334155;
}

.theme-swatch {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #d1d5db;
  flex-shrink: 0;
}

.theme-name {
  flex: 1;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

body.dark-mode .theme-name {
  color: #f3f4f6;
}

.secondary-btn {
  width: 100%;
  padding: 8px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:hover {
  background: #f9fafb;
}

body.dark-mode .secondary-btn {
  background: #1e293b;
  border-color: #334155;
  color: #d1d5db;
}

/* Input Groups */
.input-group {
  margin-bottom: 12px;
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

body.dark-mode .input-label {
  color: #d1d5db;
}

.text-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.text-input:focus {
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

body.dark-mode .text-input {
  background: #1e293b;
  border-color: #334155;
  color: #f3f4f6;
}

/* Color Picker */
.color-picker-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-picker-input {
  width: 48px;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
  background: white;
  transition: all 0.2s;
}

.color-picker-input:hover {
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

body.dark-mode .color-picker-input {
  background: #1e293b;
  border-color: #334155;
}

.color-hex-input {
  flex: 1;
  font-family: 'Monaco', 'Courier New', monospace;
  text-transform: uppercase;
}

/* Background Type Selector */
.bg-type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.bg-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.bg-type-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.bg-type-btn.active {
  border-color: #ec4899;
  background: #fdf2f8;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

body.dark-mode .bg-type-btn {
  background: #1e293b;
  border-color: #334155;
}

body.dark-mode .bg-type-btn:hover {
  background: #334155;
  border-color: #475569;
}

body.dark-mode .bg-type-btn.active {
  background: rgba(236, 72, 153, 0.1);
  border-color: #ec4899;
}

.bg-type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.bg-type-icon i {
  font-size: 20px;
  color: #6b7280;
  transition: color 0.2s;
}

.bg-type-btn:hover .bg-type-icon i {
  color: #374151;
}

.bg-type-btn.active .bg-type-icon i {
  color: #ec4899;
}

body.dark-mode .bg-type-icon i {
  color: #9ca3af;
}

body.dark-mode .bg-type-btn:hover .bg-type-icon i {
  color: #d1d5db;
}

body.dark-mode .bg-type-btn.active .bg-type-icon i {
  color: #ec4899;
}

.bg-type-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

body.dark-mode .bg-type-label {
  color: #d1d5db;
}

/* Gradient Controls */
.gradient-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gradient-angle-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.angle-slider {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.angle-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #ec4899;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.angle-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #ec4899;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

body.dark-mode .angle-slider {
  background: #334155;
}

.angle-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  background: white;
}

body.dark-mode .angle-input {
  background: #1e293b;
  border-color: #334155;
  color: #f3f4f6;
}

.gradient-preview {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  margin-top: 8px;
}

body.dark-mode .gradient-preview {
  border-color: #334155;
}

/* Image Controls */
.image-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-upload-wrapper {
  width: 100%;
}

.upload-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  border-color: #ec4899;
  background: #fdf2f8;
  color: #ec4899;
}

body.dark-mode .upload-btn {
  background: #1e293b;
  border-color: #334155;
  color: #9ca3af;
}

body.dark-mode .upload-btn:hover {
  border-color: #ec4899;
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.image-preview-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

body.dark-mode .image-preview-wrapper {
  border-color: #334155;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background: rgba(239, 68, 68, 0.9);
}

.select-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

body.dark-mode .select-input {
  background: #1e293b;
  border-color: #334155;
  color: #f3f4f6;
}

.opacity-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.opacity-slider {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #ec4899;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.opacity-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #ec4899;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

body.dark-mode .opacity-slider {
  background: #334155;
}

.opacity-value {
  min-width: 45px;
  text-align: right;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

body.dark-mode .opacity-value {
  color: #d1d5db;
}

/* Customize Buttons */
.customize-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
  text-align: left;
}

.customize-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

body.dark-mode .customize-btn {
  background: #1e293b;
  border-color: #334155;
  color: #d1d5db;
}

.customize-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(236, 72, 153, 0.1);
  border-radius: 6px;
}

.customize-icon i {
  font-size: 16px;
  color: #ec4899;
}

body.dark-mode .customize-icon {
  background: rgba(236, 72, 153, 0.15);
}

body.dark-mode .customize-icon i {
  color: #ec4899;
}

/* Footer */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

body.dark-mode .sidebar-footer {
  border-top-color: #334155;
  background: #1e293b;
}

.footer-action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: #ec4899;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.footer-action-btn:hover {
  background: #db2777;
}

.plus-icon {
  font-size: 18px;
  line-height: 1;
}

/* Scrollbar */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: #f3f4f6;
}

body.dark-mode .sidebar-content::-webkit-scrollbar-track {
  background: #1e293b;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

body.dark-mode .sidebar-content::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

body.dark-mode .sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* SEO Section Styles */
.seo-section .panel-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.seo-section .panel-section-title i {
  color: #06b6d4;
  font-size: 14px;
}

.textarea-input {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.input-hint {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

body.dark-mode .input-hint {
  color: #6b7280;
}

/* AEO Score Badge */
.aeo-score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  background: #f0fdf4;
  border: 1px solid #86efac;
}

.aeo-score-badge.aeo-grade-a {
  background: #f0fdf4;
  border-color: #86efac;
}

.aeo-score-badge.aeo-grade-b {
  background: #fefce8;
  border-color: #fde047;
}

.aeo-score-badge.aeo-grade-c {
  background: #fff7ed;
  border-color: #fdba74;
}

.aeo-score-badge.aeo-grade-d {
  background: #fef2f2;
  border-color: #fca5a5;
}

body.dark-mode .aeo-score-badge.aeo-grade-a {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

body.dark-mode .aeo-score-badge.aeo-grade-b {
  background: rgba(234, 179, 8, 0.1);
  border-color: rgba(234, 179, 8, 0.3);
}

body.dark-mode .aeo-score-badge.aeo-grade-c {
  background: rgba(249, 115, 22, 0.1);
  border-color: rgba(249, 115, 22, 0.3);
}

body.dark-mode .aeo-score-badge.aeo-grade-d {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.aeo-score-value {
  font-size: 28px;
  font-weight: 700;
  color: #059669;
}

.aeo-grade-b .aeo-score-value {
  color: #ca8a04;
}

.aeo-grade-c .aeo-score-value {
  color: #ea580c;
}

.aeo-grade-d .aeo-score-value {
  color: #dc2626;
}

body.dark-mode .aeo-score-value {
  color: #34d399;
}

body.dark-mode .aeo-grade-b .aeo-score-value {
  color: #fbbf24;
}

body.dark-mode .aeo-grade-c .aeo-score-value {
  color: #fb923c;
}

body.dark-mode .aeo-grade-d .aeo-score-value {
  color: #f87171;
}

.aeo-score-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

body.dark-mode .aeo-score-label {
  color: #9ca3af;
}

/* Sync Button */
.sync-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.sync-btn i {
  font-size: 12px;
}

.sync-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Design Panel Layout Fix */
.design-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.design-panel .panel-section {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.design-panel .panel-section:last-child {
  border-bottom: none;
}

body.dark-mode .design-panel .panel-section {
  border-bottom-color: #334155;
}
</style>
