# Media Kit Template Directory - Implementation Plan

## Overview

Transform the media kit builder from a "tool" into a "platform" by creating a Carrd-like template selection experience. This plan builds on the existing architecture while adding visual template browsing, categories, demo mode, and user-saved templates.

**Goal:** A dedicated `/templates` route displaying a filtered grid of Media Kit designs. Clicking one instantiates a new builder session pre-loaded with that configuration.

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
- Template directory page/route
- Demo mode overlay
- "Blank Canvas" option
- User-saved templates system

---

## Phase 1: Enhanced Data Structure & Assets

### 1.1 Update Theme Schema

**File:** `themes/schema-v2.json`

The new schema adds `category`, `metadata`, and `defaultContent` fields to support the template directory features.

### 1.2 Update Existing Theme Files

**Tasks:**
1. Add `category` field to each theme JSON
2. Add `metadata` object with tags, description, premium flag
3. Add `defaultContent` with pre-configured sections/components
4. Create preview images

### 1.3 Create Preview Assets

**Directory Structure:**
- Each theme folder gets `preview.jpg` (1200x800) and `thumbnail.jpg` (400x300)
- Fallback images in `/assets/images/themes/`

### 1.4 PHP Changes

Update `class-theme-generator.php` with v2 schema validation and preview URL generation.

---

## Phase 2: Template Directory Vue Components

### 2.1 Directory Structure

```
src/vue/components/templates/
├── TemplateDirectory.vue       # Main directory page
├── TemplateCard.vue            # Individual template card
├── TemplateFilters.vue         # Category/tag filters
├── TemplateDemoOverlay.vue     # Full-screen demo modal
├── TemplateSearch.vue          # Search input component
└── BlankCanvasCard.vue         # Special "start fresh" card
```

### 2.2 Key Components

- **TemplateDirectory.vue:** Main page with Carrd-inspired gradient header, search, filters, and grid
- **TemplateCard.vue:** Card with thumbnail, badges (PRO/NEW), hover overlay with Select/Demo buttons
- **TemplateFilters.vue:** Category pill buttons (All, Speaker, Author, Startup, Portfolio, Corporate)
- **BlankCanvasCard.vue:** Special dashed-border card for starting fresh
- **TemplateDemoOverlay.vue:** Full-screen modal for previewing templates

---

## Phase 3: State Management & Store Updates

### 3.1 Create Template Store (`src/stores/templates.js`)

**State:**
- templates, userTemplates, isLoading, error, selectedTemplateId

**Getters:**
- allTemplates, getTemplateById, templatesByCategory, premiumTemplates, freeTemplates

**Actions:**
- fetchTemplates(), fetchUserTemplates(), initializeFromTemplate(), initializeBlank(), saveAsTemplate(), deleteUserTemplate()

### 3.2 Update MediaKitAppComplete.vue

Add `mode` prop support ('edit' | 'demo' | 'preview') for demo functionality.

---

## Phase 4: Routing & Navigation

### 4.1 Update PHP Routing

Add rewrite rules for:
- `/media-kit/templates` → Template directory
- `/media-kit/builder` → Builder (new/blank)
- `/media-kit/builder/{template_id}` → Builder with specific template

### 4.2 Vue Router Setup

Configure routes for templates and builder with props mapping.

---

## Phase 5: REST API Endpoints

### 5.1 Template REST Controller (`includes/api/class-rest-template-controller.php`)

**Endpoints:**
- GET `/gmkb/v1/templates` - Get all templates
- GET `/gmkb/v1/templates/{id}` - Get single template
- GET `/gmkb/v1/templates/user` - Get user's saved templates
- POST `/gmkb/v1/templates/user` - Create user template
- PUT `/gmkb/v1/templates/user/{id}` - Update user template
- DELETE `/gmkb/v1/templates/user/{id}` - Delete user template

---

## Phase 6: Additional Features

### 6.1 "Save as Template" Modal

Modal component for saving current design as a reusable template.

### 6.2 "My Templates" Tab

Tab in directory showing user-saved templates with delete capability.

---

## Implementation Timeline

### Sprint 1: Foundation (Phase 1)
- [ ] Create schema-v2.json
- [ ] Update class-theme-generator.php
- [ ] Update all 4 theme JSON files
- [ ] Create preview images
- [ ] Add defaultContent to themes

### Sprint 2: Core UI (Phase 2)
- [ ] Create TemplateDirectory.vue
- [ ] Create TemplateCard.vue
- [ ] Create TemplateFilters.vue
- [ ] Create BlankCanvasCard.vue
- [ ] Add Carrd-inspired CSS

### Sprint 3: State & Logic (Phase 3)
- [ ] Create templates.js store
- [ ] Add initializeFromTemplate()
- [ ] Add initializeBlank()
- [ ] Update MediaKitAppComplete.vue

### Sprint 4: Routing (Phase 4)
- [ ] Update class-gmkb-routing.php
- [ ] Create template-directory.php
- [ ] Set up URL handling
- [ ] Test navigation

### Sprint 5: API & Demo (Phase 5)
- [ ] Create class-rest-template-controller.php
- [ ] Implement REST endpoints
- [ ] Create TemplateDemoOverlay.vue
- [ ] Test demo flow

### Sprint 6: User Templates (Phase 6)
- [ ] Create SaveAsTemplateModal.vue
- [ ] Add "My Templates" tab
- [ ] Implement user template CRUD
- [ ] Add delete confirmation

### Sprint 7: Polish
- [ ] Responsive testing
- [ ] Performance optimization
- [ ] Error handling
- [ ] Documentation

---

## File Manifest

### New Files
- `src/stores/templates.js`
- `src/vue/components/templates/TemplateDirectory.vue`
- `src/vue/components/templates/TemplateCard.vue`
- `src/vue/components/templates/TemplateFilters.vue`
- `src/vue/components/templates/TemplateSearch.vue`
- `src/vue/components/templates/BlankCanvasCard.vue`
- `src/vue/components/templates/TemplateDemoOverlay.vue`
- `src/vue/components/templates/SaveAsTemplateModal.vue`
- `includes/api/class-rest-template-controller.php`
- `templates/template-directory.php`
- `themes/schema-v2.json`
- Theme preview images

### Files to Modify
- `src/main.js`
- `src/stores/mediaKit.js`
- `src/stores/theme.js`
- `src/vue/components/MediaKitAppComplete.vue`
- `includes/class-theme-generator.php`
- `includes/class-gmkb-routing.php`
- All theme JSON files

---

## Success Criteria

1. **Template Directory Page** - Accessible at `/media-kit/templates`, shows grid with filters and search
2. **Template Selection** - Loads theme + default content into builder
3. **Demo Mode** - Full-screen preview with "Edit This Template" CTA
4. **Blank Canvas** - Creates empty media kit with default theme
5. **User Templates** - Save, list, and delete custom templates
