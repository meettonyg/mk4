# Media Kit Template Directory - Implementation Plan v2

> **Refined based on architectural review feedback**

## Overview

Transform the media kit builder from a "tool" into a "platform" by creating a Carrd-like template selection experience. This plan builds on the existing architecture while adding visual template browsing, categories, demo mode, and user-saved templates.

**Goal:** A dedicated template directory displaying a filtered grid of Media Kit designs. Clicking one instantiates a new builder session pre-loaded with that configuration.

---

## Architectural Decisions (Based on Review)

### Decision 1: State-Based Routing (Not Vue Router)

**Problem:** The current app uses a simple mount point without `vue-router`. Introducing full routing is a major architectural change.

**Solution:** Use **state-based routing** within the main store:
```javascript
currentView: 'directory' | 'builder'
```

This avoids:
- Configuring vue-router and server-side rewrite rules
- Modifying `main.js` and root App structure
- Allows faster iteration on UI before committing to full routing

**Implementation:** Add `currentView` state to UI store, conditionally render `TemplateDirectory` or `MediaKitAppComplete` based on state.

### Decision 2: Custom Post Type for User Templates

**Problem:** Storing full template content in `wp_options` risks hitting database limits and poor querying.

**Solution:** Use WordPress Custom Post Type `gmkb_user_template`:
- Stores full JSON content in post_content
- Supports meta fields for category, tags, preview
- Better scalability and querying
- Native WordPress revision support

### Decision 3: Normalized Default Content Structure

**Problem:** If `defaultContent` contains component IDs, they'll conflict when instantiated.

**Solution:** Use **ID-less, normalized structures** in theme JSONs:
```json
{
  "defaultContent": {
    "sections": [
      {
        "type": "full_width",
        "components": [
          {
            "type": "hero",
            "settings": { "style": { "padding": "large" } },
            "data": { "headline": "Your Name" }
          }
        ]
      }
    ]
  }
}
```

The builder generates fresh UUIDs when instantiating from template.

---

## Current State Analysis

### Existing Assets
- **4 Built-in Themes:** `professional_clean`, `creative_bold`, `minimal_elegant`, `modern_dark`
- **Theme JSON Structure:** Complete with typography, colors, spacing, effects, components
- **Theme Store:** Pinia store with `selectTheme()`, `initialize()`, custom theme support
- **ThemeSelectorGrid.vue:** Basic grid selector (not Carrd-like)
- **Routing:** PHP-based detection via `class-gmkb-routing.php`
- **REST API:** `/gmkb/v1/themes/*` endpoints

### Missing for Carrd-Like Experience
- Template categories and tags
- Preview images (thumbnails and full previews)
- Default content configurations (not just theme styles)
- Template directory view
- Demo mode overlay
- "Blank Canvas" option
- User-saved templates system

---

## Phase 1: Enhanced Data Structure & Assets

### 1.1 Schema Definition

**File:** `themes/schema-v2.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GMKB Theme Schema V2",
  "type": "object",
  "required": ["theme_id", "theme_name", "version"],
  "properties": {
    "theme_id": { "type": "string" },
    "theme_name": { "type": "string" },
    "version": { "type": "string" },
    "description": { "type": "string" },
    "category": {
      "type": "string",
      "enum": ["portfolio", "startup", "speaker", "corporate", "author", "creative", "minimal"]
    },
    "metadata": {
      "type": "object",
      "properties": {
        "tags": { 
          "type": "array", 
          "items": { "type": "string" },
          "maxItems": 5
        },
        "is_premium": { "type": "boolean", "default": false },
        "is_new": { "type": "boolean", "default": false },
        "sort_order": { "type": "integer", "default": 100 },
        "author": { "type": "string", "default": "Guestify" }
      }
    },
    "preview_image": { "type": "string" },
    "thumbnail_image": { "type": "string" },
    "defaultContent": {
      "description": "Pre-configured layout - NO IDs, builder generates UUIDs",
      "type": "object",
      "properties": {
        "sections": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": { "enum": ["full_width", "two_column", "three_column"] },
              "components": { "type": "array" },
              "columns": { "type": "object" }
            }
          }
        }
      }
    }
  }
}
```

### 1.2 Example Updated Theme

**File:** `themes/creative_bold/theme.json` (additions)

```json
{
  "theme_id": "creative_bold",
  "theme_name": "Creative Bold",
  "version": "2.0.0",
  "description": "A vibrant, bold theme for creative professionals and artists",
  "category": "creative",
  "metadata": {
    "tags": ["bold", "vibrant", "artist", "speaker"],
    "is_premium": false,
    "is_new": false,
    "sort_order": 20,
    "author": "Guestify"
  },
  "preview_image": "preview.jpg",
  "thumbnail_image": "thumbnail.jpg",
  "defaultContent": {
    "sections": [
      {
        "type": "full_width",
        "components": [
          {
            "type": "hero",
            "settings": {
              "style": { "padding": "large", "background": "primary" }
            },
            "data": {
              "headline": "Make an Impact",
              "subheadline": "Creative strategies for the modern era"
            }
          }
        ]
      },
      {
        "type": "two_column",
        "columns": {
          "1": [
            { "type": "biography", "settings": { "style": { "card": true } } }
          ],
          "2": [
            { "type": "stats", "settings": { "style": { "accent": true } } }
          ]
        }
      },
      {
        "type": "full_width",
        "components": [
          { "type": "topics", "settings": { "layout": "grid" } }
        ]
      }
    ]
  }
}
```

### 1.3 Theme Updates Required

| Theme | Category | Tags | Default Content |
|-------|----------|------|-----------------|
| `professional_clean` | corporate | business, clean, consultant | Hero + Bio + Topics + Contact |
| `creative_bold` | creative | bold, vibrant, artist, speaker | Hero + Bio/Stats + Topics |
| `minimal_elegant` | minimal | minimal, sophisticated, author | Hero + Bio + Gallery |
| `modern_dark` | portfolio | dark, modern, tech, developer | Hero + Skills + Projects |

### 1.4 Preview Assets

**Directory Structure:**
```
themes/
├── professional_clean/
│   ├── theme.json
│   ├── preview.jpg      (1200x800)
│   └── thumbnail.jpg    (400x300)
├── creative_bold/
│   └── ...
assets/images/themes/
├── default-preview.jpg  (fallback)
└── default-thumbnail.jpg
```

---

## Phase 2: Template Directory Vue Components

### 2.1 Directory Structure

```
src/vue/components/templates/
├── TemplateDirectory.vue       # Main directory view
├── TemplateCard.vue            # Individual template card
├── TemplateFilters.vue         # Category filter pills
├── TemplateSearch.vue          # Search input
├── BlankCanvasCard.vue         # "Start fresh" card
└── TemplateDemoOverlay.vue     # Full-screen preview modal
```

### 2.2 TemplateDirectory.vue

**Layout (Carrd-inspired):**
```
┌─────────────────────────────────────────────────────────────┐
│                    [Gradient Header]                         │
│                                                              │
│              Choose a Starting Point                         │
│     Select a template or start with a blank canvas           │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🔍 Search templates...                                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  [All] [Speaker] [Author] [Startup] [Portfolio] [Corporate] │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  [White Background Grid Area]                                │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Blank   │ │ Prof.    │ │ Creative │ │ Minimal  │        │
│  │  Canvas  │ │ Clean    │ │ Bold     │ │ Elegant  │        │
│  │    +     │ │          │ │ [PRO]    │ │ [NEW]    │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│  ┌──────────┐ ┌──────────┐                                   │
│  │ Modern   │ │ My       │                                   │
│  │ Dark     │ │ Saved    │                                   │
│  └──────────┘ └──────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Gradient header (#1a1a2e → #16213e → #0f3460)
- Category filter pills with active state
- Search with debounced filtering
- Responsive grid (auto-fill, minmax 280px)
- White background for grid area with rounded top corners

### 2.3 TemplateCard.vue

**Hover Behavior:**
```
┌────────────────────┐       ┌────────────────────┐
│                    │       │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│   [Thumbnail]      │  →    │ ▓▓  [Select]  ▓▓▓▓ │
│                    │ hover │ ▓▓   [Demo]   ▓▓▓▓ │
│      [PRO]         │       │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
├────────────────────┤       ├────────────────────┤
│ Template Name      │       │ Template Name      │
│ Short description  │       │ Short description  │
│ [tag] [tag]        │       │ [tag] [tag]        │
└────────────────────┘       └────────────────────┘
```

**Props:**
```typescript
interface TemplateCardProps {
  template: {
    id: string
    name: string
    description: string
    category: string
    tags: string[]
    preview_image: string
    thumbnail_image: string
    is_premium: boolean
    is_new: boolean
    has_default_content: boolean
  }
  deletable?: boolean  // For user templates
}
```

### 2.4 BlankCanvasCard.vue

Special card with:
- Dashed border (2px dashed #d1d5db)
- Plus icon in circle
- "Blank Canvas" title
- "Start from scratch" subtitle
- Blue highlight on hover

---

## Phase 3: State Management

### 3.1 UI Store Updates (`src/stores/ui.js`)

Add view state for state-based routing:

```javascript
// Add to existing ui.js state
state: () => ({
  // ... existing state
  currentView: 'builder',  // 'directory' | 'builder'
  templateDemoId: null,    // ID of template being demoed
})

// Add actions
actions: {
  showTemplateDirectory() {
    this.currentView = 'directory'
  },
  
  showBuilder() {
    this.currentView = 'builder'
  },
  
  openTemplateDemo(templateId) {
    this.templateDemoId = templateId
  },
  
  closeTemplateDemo() {
    this.templateDemoId = null
  }
}
```

### 3.2 New Template Store (`src/stores/templates.js`)

```javascript
import { defineStore } from 'pinia'
import { useMediaKitStore } from './mediaKit'
import { useThemeStore } from './theme'
import { useUIStore } from './ui'

export const useTemplateStore = defineStore('templates', {
  state: () => ({
    templates: [],
    userTemplates: [],
    isLoading: false,
    error: null,
    activeFilter: 'all',
    searchQuery: ''
  }),

  getters: {
    // Combine built-in and user templates
    allTemplates: (state) => [
      ...state.templates,
      ...state.userTemplates.map(t => ({ ...t, type: 'user' }))
    ],
    
    // Filter by category and search
    filteredTemplates: (state) => {
      let results = state.allTemplates
      
      if (state.activeFilter !== 'all') {
        results = results.filter(t => t.category === state.activeFilter)
      }
      
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        results = results.filter(t =>
          t.name.toLowerCase().includes(query) ||
          t.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      return results.sort((a, b) => 
        (a.metadata?.sort_order || 100) - (b.metadata?.sort_order || 100)
      )
    },
    
    getById: (state) => (id) => {
      return state.templates.find(t => t.id === id) ||
             state.userTemplates.find(t => t.id === id)
    }
  },

  actions: {
    async fetchTemplates() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await fetch(
          `${window.gmkbData.restUrl}gmkb/v1/templates`,
          { headers: { 'X-WP-Nonce': window.gmkbData.nonce } }
        )
        
        if (!response.ok) throw new Error('Failed to fetch templates')
        
        const data = await response.json()
        if (data.success) {
          this.templates = data.templates.filter(t => t.type === 'built_in')
          this.userTemplates = data.templates.filter(t => t.type === 'user')
        }
      } catch (err) {
        this.error = err.message
        console.error('Template fetch error:', err)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * CRITICAL: Instantiate template into builder
     * Generates fresh UUIDs for all sections/components
     */
    async initializeFromTemplate(templateId) {
      const mediaKitStore = useMediaKitStore()
      const themeStore = useThemeStore()
      const uiStore = useUIStore()
      
      // 1. Fetch full template data (may need separate call for defaultContent)
      const template = this.getById(templateId)
      if (!template) throw new Error(`Template not found: ${templateId}`)
      
      // 2. Reset current builder state
      mediaKitStore.sections = []
      mediaKitStore.components = {}
      
      // 3. Apply theme styles
      themeStore.selectTheme(template.id)
      
      // 4. Instantiate defaultContent with fresh IDs
      if (template.defaultContent?.sections) {
        for (const sectionDef of template.defaultContent.sections) {
          const sectionId = this._generateId('sec')
          
          const section = {
            section_id: sectionId,
            layout: sectionDef.type,
            type: 'layout',
            components: [],
            columns: {}
          }
          
          // Handle full_width sections
          if (sectionDef.components) {
            for (const compDef of sectionDef.components) {
              const compId = this._generateId('comp')
              section.components.push(compId)
              
              mediaKitStore.components[compId] = {
                component_id: compId,
                type: compDef.type,
                section_id: sectionId,
                settings: compDef.settings || {},
                data: compDef.data || {}
              }
            }
          }
          
          // Handle multi-column sections
          if (sectionDef.columns) {
            for (const [colNum, colComponents] of Object.entries(sectionDef.columns)) {
              section.columns[colNum] = []
              
              for (const compDef of colComponents) {
                const compId = this._generateId('comp')
                section.columns[colNum].push(compId)
                
                mediaKitStore.components[compId] = {
                  component_id: compId,
                  type: compDef.type,
                  section_id: sectionId,
                  column: parseInt(colNum),
                  settings: compDef.settings || {},
                  data: compDef.data || {}
                }
              }
            }
          }
          
          mediaKitStore.sections.push(section)
        }
      }
      
      // 5. Mark as dirty (unsaved)
      mediaKitStore.isDirty = true
      
      // 6. Navigate to builder
      uiStore.showBuilder()
    },

    initializeBlank() {
      const mediaKitStore = useMediaKitStore()
      const themeStore = useThemeStore()
      const uiStore = useUIStore()
      
      // Reset
      mediaKitStore.sections = []
      mediaKitStore.components = {}
      
      // Default theme
      themeStore.selectTheme('professional_clean')
      
      // Add single empty section
      mediaKitStore.addSection('full_width')
      
      mediaKitStore.isDirty = true
      uiStore.showBuilder()
    },

    async saveAsTemplate(name, description) {
      const mediaKitStore = useMediaKitStore()
      const themeStore = useThemeStore()
      
      const response = await fetch(
        `${window.gmkbData.restUrl}gmkb/v1/templates/user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': window.gmkbData.nonce
          },
          body: JSON.stringify({
            name,
            description,
            content: {
              theme: themeStore.activeThemeId,
              themeCustomizations: mediaKitStore.themeCustomizations,
              sections: mediaKitStore.sections,
              components: mediaKitStore.components
            }
          })
        }
      )
      
      if (!response.ok) throw new Error('Failed to save template')
      
      const data = await response.json()
      await this.fetchTemplates() // Refresh list
      
      return data
    },

    async deleteUserTemplate(templateId) {
      const response = await fetch(
        `${window.gmkbData.restUrl}gmkb/v1/templates/user/${templateId}`,
        {
          method: 'DELETE',
          headers: { 'X-WP-Nonce': window.gmkbData.nonce }
        }
      )
      
      if (!response.ok) throw new Error('Failed to delete template')
      
      this.userTemplates = this.userTemplates.filter(t => t.id !== templateId)
    },

    _generateId(prefix) {
      return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }
})
```

### 3.3 Update MediaKitAppComplete.vue

Add mode support for demo:

```vue
<script setup>
const props = defineProps({
  mode: {
    type: String,
    default: 'edit',
    validator: (v) => ['edit', 'demo', 'preview'].includes(v)
  },
  templateId: String,
  readOnly: Boolean
})

const isEditable = computed(() => props.mode === 'edit' && !props.readOnly)
const showSidebar = computed(() => props.mode === 'edit')
const showToolbar = computed(() => props.mode === 'edit')
</script>

<template>
  <div class="gmkb-app" :class="{ 'demo-mode': mode === 'demo' }">
    <ThemeProvider>
      <BuilderToolbar v-if="showToolbar" />
      
      <div class="builder-content">
        <BuilderSidebar v-if="showSidebar" />
        <BuilderCanvas :read-only="!isEditable" />
      </div>
      
      <template v-if="isEditable">
        <ComponentLibrary />
        <ThemeCustomizer />
        <SectionSettings />
      </template>
    </ThemeProvider>
  </div>
</template>
```

---

## Phase 4: REST API

### 4.1 Template REST Controller

**File:** `includes/api/class-rest-template-controller.php`

```php
<?php
class GMKB_REST_Template_Controller {
    
    const NAMESPACE = 'gmkb/v1';
    const USER_TEMPLATE_CPT = 'gmkb_user_template';
    
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
        add_action('init', [$this, 'register_post_type']);
    }
    
    /**
     * Register Custom Post Type for User Templates
     */
    public function register_post_type() {
        register_post_type(self::USER_TEMPLATE_CPT, [
            'labels' => [
                'name' => 'User Templates',
                'singular_name' => 'User Template'
            ],
            'public' => false,
            'show_ui' => false,
            'supports' => ['title', 'editor', 'author', 'revisions'],
            'capability_type' => 'post'
        ]);
    }
    
    public function register_routes() {
        // GET /templates - All templates (built-in + user)
        register_rest_route(self::NAMESPACE, '/templates', [
            'methods' => 'GET',
            'callback' => [$this, 'get_templates'],
            'permission_callback' => [$this, 'read_permission']
        ]);
        
        // GET /templates/(?P<id>[\w-]+) - Single template with full content
        register_rest_route(self::NAMESPACE, '/templates/(?P<id>[\w-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_template'],
            'permission_callback' => [$this, 'read_permission']
        ]);
        
        // POST /templates/user - Create user template
        register_rest_route(self::NAMESPACE, '/templates/user', [
            'methods' => 'POST',
            'callback' => [$this, 'create_user_template'],
            'permission_callback' => [$this, 'write_permission']
        ]);
        
        // DELETE /templates/user/(?P<id>\d+) - Delete user template
        register_rest_route(self::NAMESPACE, '/templates/user/(?P<id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'delete_user_template'],
            'permission_callback' => [$this, 'write_permission']
        ]);
    }
    
    public function read_permission() {
        return is_user_logged_in();
    }
    
    public function write_permission() {
        return current_user_can('edit_posts');
    }
    
    /**
     * Get all templates (lightweight list)
     */
    public function get_templates($request) {
        $templates = [];
        
        // 1. Built-in themes as templates
        require_once GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php';
        $discovery = new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
        
        foreach ($discovery->getThemes() as $theme) {
            $templates[] = [
                'id' => $theme['slug'],
                'type' => 'built_in',
                'name' => $theme['name'],
                'description' => $theme['description'] ?? '',
                'category' => $theme['category'] ?? 'portfolio',
                'tags' => $theme['metadata']['tags'] ?? [],
                'is_premium' => $theme['metadata']['is_premium'] ?? false,
                'is_new' => $theme['metadata']['is_new'] ?? false,
                'preview_image' => $this->get_preview_url($theme['slug']),
                'thumbnail_image' => $this->get_thumbnail_url($theme['slug']),
                'has_default_content' => !empty($theme['defaultContent'])
            ];
        }
        
        // 2. User templates (CPT)
        $user_posts = get_posts([
            'post_type' => self::USER_TEMPLATE_CPT,
            'author' => get_current_user_id(),
            'posts_per_page' => -1,
            'post_status' => 'publish'
        ]);
        
        foreach ($user_posts as $post) {
            $templates[] = [
                'id' => $post->ID,
                'type' => 'user',
                'name' => $post->post_title,
                'description' => get_post_meta($post->ID, '_description', true),
                'category' => 'saved',
                'tags' => ['custom'],
                'created_at' => $post->post_date,
                'has_default_content' => true
            ];
        }
        
        return rest_ensure_response([
            'success' => true,
            'templates' => $templates
        ]);
    }
    
    /**
     * Get single template with full defaultContent
     */
    public function get_template($request) {
        $id = $request->get_param('id');
        
        // Check if user template (numeric ID)
        if (is_numeric($id)) {
            $post = get_post($id);
            if (!$post || $post->post_type !== self::USER_TEMPLATE_CPT) {
                return new WP_Error('not_found', 'Template not found', ['status' => 404]);
            }
            
            return rest_ensure_response([
                'success' => true,
                'template' => [
                    'id' => $post->ID,
                    'type' => 'user',
                    'name' => $post->post_title,
                    'content' => json_decode($post->post_content, true)
                ]
            ]);
        }
        
        // Built-in theme
        require_once GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php';
        $discovery = new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
        $themes = $discovery->getThemes();
        
        if (!isset($themes[$id])) {
            return new WP_Error('not_found', 'Template not found', ['status' => 404]);
        }
        
        return rest_ensure_response([
            'success' => true,
            'template' => $themes[$id]
        ]);
    }
    
    /**
     * Create user template
     */
    public function create_user_template($request) {
        $params = $request->get_json_params();
        
        if (empty($params['name']) || empty($params['content'])) {
            return new WP_Error('invalid_data', 'Name and content required', ['status' => 400]);
        }
        
        $post_id = wp_insert_post([
            'post_type' => self::USER_TEMPLATE_CPT,
            'post_title' => sanitize_text_field($params['name']),
            'post_content' => wp_json_encode($params['content']),
            'post_status' => 'publish',
            'post_author' => get_current_user_id()
        ]);
        
        if (is_wp_error($post_id)) {
            return new WP_Error('create_failed', $post_id->get_error_message(), ['status' => 500]);
        }
        
        if (!empty($params['description'])) {
            update_post_meta($post_id, '_description', sanitize_text_field($params['description']));
        }
        
        return rest_ensure_response([
            'success' => true,
            'id' => $post_id
        ]);
    }
    
    /**
     * Delete user template
     */
    public function delete_user_template($request) {
        $id = $request->get_param('id');
        $post = get_post($id);
        
        if (!$post || $post->post_type !== self::USER_TEMPLATE_CPT) {
            return new WP_Error('not_found', 'Template not found', ['status' => 404]);
        }
        
        if ($post->post_author != get_current_user_id() && !current_user_can('delete_others_posts')) {
            return new WP_Error('forbidden', 'Cannot delete this template', ['status' => 403]);
        }
        
        wp_delete_post($id, true);
        
        return rest_ensure_response(['success' => true]);
    }
    
    private function get_preview_url($theme_id) {
        $path = GMKB_PLUGIN_DIR . "themes/{$theme_id}/preview.jpg";
        if (file_exists($path)) {
            return GMKB_PLUGIN_URL . "themes/{$theme_id}/preview.jpg";
        }
        return GMKB_PLUGIN_URL . 'assets/images/themes/default-preview.jpg';
    }
    
    private function get_thumbnail_url($theme_id) {
        $path = GMKB_PLUGIN_DIR . "themes/{$theme_id}/thumbnail.jpg";
        if (file_exists($path)) {
            return GMKB_PLUGIN_URL . "themes/{$theme_id}/thumbnail.jpg";
        }
        return GMKB_PLUGIN_URL . 'assets/images/themes/default-thumbnail.jpg';
    }
}
```

---

## Phase 5: Integration & Entry Point

### 5.1 Update main.js

```javascript
// Add to imports
import { useTemplateStore } from './stores/templates'

// In initialization
const templateStore = useTemplateStore()
const uiStore = useUIStore()

// Determine initial view (check URL or default)
if (window.location.hash === '#templates' || window.gmkbData.showTemplates) {
  uiStore.showTemplateDirectory()
  templateStore.fetchTemplates()
}
```

### 5.2 Root App Component

```vue
<template>
  <div id="gmkb-app">
    <!-- State-based routing -->
    <TemplateDirectory v-if="uiStore.currentView === 'directory'" />
    <MediaKitAppComplete v-else />
    
    <!-- Demo overlay (always available) -->
    <TemplateDemoOverlay 
      v-if="uiStore.templateDemoId"
      :template-id="uiStore.templateDemoId"
    />
  </div>
</template>

<script setup>
import { useUIStore } from './stores/ui'
import TemplateDirectory from './components/templates/TemplateDirectory.vue'
import MediaKitAppComplete from './components/MediaKitAppComplete.vue'
import TemplateDemoOverlay from './components/templates/TemplateDemoOverlay.vue'

const uiStore = useUIStore()
</script>
```

---

## Implementation Timeline (Revised)

### Sprint 1: Data Foundation
- [ ] Create `themes/schema-v2.json`
- [ ] Update all 4 theme JSONs with category, metadata, defaultContent
- [ ] Update ThemeDiscovery to read new fields
- [ ] Create placeholder preview images (400x300 thumbnails)

### Sprint 2: API & Storage
- [ ] Create `class-rest-template-controller.php`
- [ ] Register `gmkb_user_template` CPT
- [ ] Implement GET /templates endpoint
- [ ] Implement POST/DELETE user template endpoints
- [ ] Test via REST API directly

### Sprint 3: State Management
- [ ] Add `currentView` and `templateDemoId` to UI store
- [ ] Create `templates.js` store
- [ ] Implement `initializeFromTemplate()` with UUID generation
- [ ] Implement `initializeBlank()`
- [ ] Update `MediaKitAppComplete.vue` with mode prop

### Sprint 4: Core UI Components
- [ ] Create `TemplateDirectory.vue`
- [ ] Create `TemplateCard.vue` with hover overlay
- [ ] Create `TemplateFilters.vue`
- [ ] Create `BlankCanvasCard.vue`
- [ ] Add Carrd-inspired CSS (gradient header, grid)

### Sprint 5: Demo & User Features
- [ ] Create `TemplateDemoOverlay.vue`
- [ ] Create `SaveAsTemplateModal.vue`
- [ ] Add "My Templates" section in directory
- [ ] Wire up state-based navigation
- [ ] Integration testing

### Sprint 6: Polish
- [ ] Responsive design (mobile filters, card sizes)
- [ ] Loading states and error handling
- [ ] Transition animations
- [ ] Accessibility audit
- [ ] Performance optimization (lazy load images)

---

## File Manifest

### New Files (12)
```
src/stores/templates.js
src/vue/components/templates/TemplateDirectory.vue
src/vue/components/templates/TemplateCard.vue
src/vue/components/templates/TemplateFilters.vue
src/vue/components/templates/TemplateSearch.vue
src/vue/components/templates/BlankCanvasCard.vue
src/vue/components/templates/TemplateDemoOverlay.vue
src/vue/components/templates/SaveAsTemplateModal.vue
includes/api/class-rest-template-controller.php
themes/schema-v2.json
assets/images/themes/default-preview.jpg
assets/images/themes/default-thumbnail.jpg
```

### Modified Files (8)
```
src/main.js                              # Initialize template store, check initial view
src/stores/ui.js                         # Add currentView, templateDemoId
src/stores/mediaKit.js                   # Ensure resetAll() exists
src/vue/components/MediaKitAppComplete.vue  # Add mode prop
themes/professional_clean/theme.json     # Add v2 fields
themes/creative_bold/theme.json          # Add v2 fields
themes/minimal_elegant/theme.json        # Add v2 fields
themes/modern_dark/theme.json            # Add v2 fields
```

---

## Success Criteria

| Feature | Acceptance Test |
|---------|-----------------|
| Template Directory | Shows at `currentView: 'directory'`, displays all templates in grid |
| Category Filters | Clicking filter updates grid, "All" shows everything |
| Search | Typing filters by name and tags with debounce |
| Template Selection | "Select" loads theme + defaultContent, navigates to builder |
| Demo Mode | "Demo" opens full-screen preview with read-only builder |
| Blank Canvas | Creates empty kit with default theme and one section |
| Save as Template | Saves current state to CPT, appears in "My Templates" |
| Delete Template | User templates can be deleted, built-ins cannot |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large defaultContent bloats theme JSON | Lazy-load full content only on select/demo |
| UUID collision on instantiation | Use timestamp + random string pattern |
| User template data loss | CPT has revision support built-in |
| Slow template grid | Lazy load thumbnails, virtualize if >50 templates |
