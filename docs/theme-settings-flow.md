# Theme Settings Flow Documentation

## Executive Summary

This document provides a comprehensive explanation of how theme settings flow through the Media Kit Builder system, from the media kit builder interface to the custom post type storage and finally to the frontend display.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│         MEDIA KIT BUILDER (Editor)                  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Theme Customizer UI                         │  │
│  │  - Color pickers                             │  │
│  │  - Font selectors                            │  │
│  │  - Spacing controls                          │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Pinia Store (src/stores/theme.js)           │  │
│  │  - currentTheme: 'professional_clean'        │  │
│  │  - customizations: { ... }                   │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Media Kit Store (src/stores/mediaKit.js)    │  │
│  │  - Consolidates all state                    │  │
│  │  - theme: themeStore.currentTheme            │  │
│  │  - themeCustomizations: themeStore.customizations│
│  └──────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       ↓ SAVE
┌─────────────────────────────────────────────────────┐
│         WORDPRESS (Backend Storage)                  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Custom Post Type: 'mkcg'                    │  │
│  │  Post ID: 123                                │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Post Meta Fields:                           │  │
│  │  ┌────────────────────────────────────────┐  │  │
│  │  │ gmkb_media_kit_state (JSON):           │  │  │
│  │  │ {                                       │  │  │
│  │  │   "components": { ... },                │  │  │
│  │  │   "sections": [ ... ],                  │  │  │
│  │  │   "globalSettings": { ... },            │  │  │
│  │  │   "lastSaved": "2025-01-15 10:30:00"    │  │  │
│  │  │ }                                       │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────┐  │  │
│  │  │ gmkb_theme (String):                   │  │  │
│  │  │ "professional_clean"                   │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────┐  │  │
│  │  │ gmkb_theme_customizations (JSON):      │  │  │
│  │  │ {                                       │  │  │
│  │  │   "--gmkb-color-primary": "#007bff",   │  │  │
│  │  │   "--gmkb-spacing-md": "20px"          │  │  │
│  │  │ }                                       │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       ↓ LOAD
┌─────────────────────────────────────────────────────┐
│         FRONTEND DISPLAY                             │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  ThemeProvider.vue                           │  │
│  │  - Reads gmkbData.currentTheme               │  │
│  │  - Reads gmkbData.themeCustomizations        │  │
│  │  - Generates CSS variables                   │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Injects <style> tag to <head>:              │  │
│  │  :root {                                     │  │
│  │    --gmkb-color-primary: #007bff;            │  │
│  │    --gmkb-color-secondary: #6c757d;          │  │
│  │    --gmkb-spacing-md: 20px;                  │  │
│  │    ...                                       │  │
│  │  }                                           │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Components Use Variables                    │  │
│  │  GuestIntro.vue, LogoGrid.vue, etc.          │  │
│  │  CSS:                                        │  │
│  │  .component {                                │  │
│  │    color: var(--gmkb-color-text, #333);      │  │
│  │    padding: var(--gmkb-spacing-md, 1rem);    │  │
│  │  }                                           │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Detailed Flow Breakdown

### 1. Media Kit Builder (Editor Mode)

#### Theme Store Initialization
When the media kit builder loads:

1. **ThemeStore** (`src/stores/theme.js`) initializes
2. Reads available themes from `window.gmkbData.themes`
3. Loads current theme from `window.gmkbData.currentTheme`
4. Loads customizations from `window.gmkbData.themeCustomizations`

```javascript
// src/stores/theme.js
initializeFromWordPress() {
  if (window.gmkbData?.themes) {
    // Process server themes
    window.gmkbData.themes.forEach(serverTheme => {
      this.themeMetadata[serverTheme.id] = {
        name: serverTheme.name,
        description: serverTheme.description
      };
      
      const cssVars = this.convertThemeToCSSVariables(serverTheme);
      this.presets[serverTheme.id] = cssVars;
    });
  }
  
  // Load current selection
  this.currentTheme = window.gmkbData.currentTheme || 'professional_clean';
  this.customizations = window.gmkbData.themeCustomizations || {};
}
```

#### User Customization
When user makes changes:

1. User selects a theme → `themeStore.applyTheme(themeName)`
2. User customizes a variable → `themeStore.updateCustomization(property, value)`
3. Changes are immediately applied to the DOM
4. Changes are tracked in `themeStore.customizations`

```javascript
// Apply theme
applyTheme(themeName) {
  const theme = this.presets[themeName];
  
  // Apply base theme variables to DOM
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  
  // Apply customizations on top
  Object.entries(this.customizations).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  
  // Sync to MediaKitStore for saving
  const mediaKitStore = useMediaKitStore();
  mediaKitStore.theme = themeName;
  mediaKitStore.themeCustomizations = this.customizations;
  mediaKitStore._trackChange(); // Marks as dirty
}
```

#### Save to Database
When user clicks "Save":

1. **MediaKitStore** collects all state including theme data
2. Sends AJAX/REST request to WordPress
3. WordPress saves to post meta

```javascript
// src/stores/mediaKit.js
async save() {
  const payload = {
    components: this.components,
    sections: this.sections,
    globalSettings: this.globalSettings,
    theme: this.theme,
    themeCustomizations: this.themeCustomizations
  };
  
  const response = await fetch(ajaxUrl, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  if (response.ok) {
    this.isDirty = false;
    console.log('✅ Saved to database');
  }
}
```

### 2. WordPress Backend Storage

#### Post Meta Structure

WordPress stores the media kit data in three separate post meta fields:

```php
// Post Meta Fields for post_id = 123

// 1. Main state (components, sections, global settings)
update_post_meta($post_id, 'gmkb_media_kit_state', [
    'components' => [
        'hero-1' => [
            'type' => 'hero',
            'data' => [...],
            'settings' => [...]
        ],
        // ... more components
    ],
    'sections' => [
        [
            'section_id' => 'section-1',
            'type' => 'full_width',
            'components' => ['hero-1', 'bio-1']
        ]
    ],
    'globalSettings' => [
        'maxWidth' => '1200px',
        'padding' => '20px'
    ],
    'lastSaved' => current_time('mysql')
]);

// 2. Selected theme (string)
update_post_meta($post_id, 'gmkb_theme', 'professional_clean');

// 3. Theme customizations (JSON array)
update_post_meta($post_id, 'gmkb_theme_customizations', [
    '--gmkb-color-primary' => '#007bff',
    '--gmkb-color-secondary' => '#6c757d',
    '--gmkb-spacing-md' => '20px'
]);
```

#### Data Validation

Before saving, WordPress validates the data:

```php
// includes/class-media-kit-save-handler.php
class MediaKitSaveHandler {
    public function save_media_kit($post_id, $data) {
        // Validate theme exists
        if (!$this->theme_exists($data['theme'])) {
            return new WP_Error('invalid_theme', 'Theme does not exist');
        }
        
        // Validate customizations structure
        if (isset($data['themeCustomizations'])) {
            foreach ($data['themeCustomizations'] as $key => $value) {
                if (!$this->is_valid_css_variable($key)) {
                    return new WP_Error('invalid_css_var', "Invalid CSS variable: $key");
                }
            }
        }
        
        // Save if valid
        update_post_meta($post_id, 'gmkb_theme', sanitize_text_field($data['theme']));
        update_post_meta($post_id, 'gmkb_theme_customizations', $data['themeCustomizations']);
        
        return true;
    }
}
```

### 3. Frontend Display

#### Data Injection

WordPress injects the saved data into the frontend:

```php
// templates/frontend-template.php
function gmkb_enqueue_frontend_data($post_id) {
    // Load saved data
    $theme = get_post_meta($post_id, 'gmkb_theme', true) ?: 'professional_clean';
    $customizations = get_post_meta($post_id, 'gmkb_theme_customizations', true) ?: [];
    
    // Load theme definitions
    $themes = apply_filters('gmkb_available_themes', [
        [
            'id' => 'professional_clean',
            'name' => 'Professional Clean',
            'colors' => [
                'primary' => '#007bff',
                'secondary' => '#6c757d',
                // ... more colors
            ],
            'typography' => [...],
            'spacing' => [...],
            'effects' => [...]
        ],
        // ... more themes
    ]);
    
    // Inject into page
    wp_localize_script('gmkb-frontend', 'gmkbData', [
        'postId' => $post_id,
        'currentTheme' => $theme,
        'themeCustomizations' => $customizations,
        'themes' => $themes
    ]);
}
```

#### ThemeProvider Initialization

The `ThemeProvider.vue` component processes the injected data:

```vue
<!-- components/ThemeProvider.vue -->
<script>
export default {
  setup(props) {
    // Get themes from injected data or use defaults
    const availableThemes = computed(() => {
      if (window.gmkbData?.themes) {
        const themesObj = {};
        window.gmkbData.themes.forEach(theme => {
          themesObj[theme.id] = {
            name: theme.name,
            colors: theme.colors || {},
            typography: theme.typography || {},
            spacing: theme.spacing || {},
            effects: theme.effects || {}
          };
        });
        return themesObj;
      }
      return defaultThemes; // Fallback
    });
    
    // Get current theme
    const currentThemeId = computed(() => {
      return props.theme || window.gmkbData?.currentTheme || 'professional_clean';
    });
    
    // Merge theme with customizations
    const mergedTheme = computed(() => {
      const baseTheme = availableThemes.value[currentThemeId.value];
      const customizations = props.customizations || window.gmkbData?.themeCustomizations || {};
      
      return deepMerge(baseTheme, customizations);
    });
    
    // Generate and inject CSS
    const applyTheme = () => {
      const cssVariables = generateCSSVariables(mergedTheme.value);
      
      const styleTag = document.createElement('style');
      styleTag.id = 'gmkb-theme-styles';
      styleTag.innerHTML = `:root {\n  ${cssVariables};\n}`;
      document.head.appendChild(styleTag);
    };
    
    onMounted(() => {
      applyTheme();
    });
  }
}
</script>
```

#### CSS Variable Generation

The theme data is converted to CSS variables:

```javascript
function generateCSSVariables(theme) {
  const cssVars = [];
  
  // Colors
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssVars.push(`--gmkb-color-${cssKey}: ${value}`);
    });
  }
  
  // Typography
  if (theme.typography) {
    Object.entries(theme.typography).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssVars.push(`--gmkb-${cssKey}: ${value}`);
    });
  }
  
  // Spacing
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssVars.push(`--gmkb-spacing-${cssKey}: ${value}`);
    });
    
    // Generate numeric spacing (0-20)
    const baseUnit = parseInt(theme.spacing.baseUnit) || 4;
    for (let i = 0; i <= 20; i++) {
      cssVars.push(`--gmkb-space-${i}: ${i * baseUnit}px`);
    }
  }
  
  // Effects
  if (theme.effects) {
    Object.entries(theme.effects).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssVars.push(`--gmkb-${cssKey}: ${value}`);
    });
  }
  
  return cssVars.join(';\n  ');
}
```

The result is CSS like this:

```css
:root {
  --gmkb-color-primary: #007bff;
  --gmkb-color-primary-hover: #0056b3;
  --gmkb-color-secondary: #6c757d;
  --gmkb-color-text: #333333;
  --gmkb-font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --gmkb-font-size-base: 16px;
  --gmkb-spacing-md: 20px;
  --gmkb-space-0: 0px;
  --gmkb-space-1: 4px;
  --gmkb-space-2: 8px;
  /* ... and so on */
}
```

### 4. Component Usage

Components reference these CSS variables:

```vue
<!-- components/guest-intro/GuestIntro.vue -->
<style scoped>
.gmkb-guest-intro {
  /* Uses theme variables with fallbacks */
  padding: var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-surface, #ffffff);
  border-radius: var(--gmkb-border-radius, 8px);
}

.guest-name {
  font-family: var(--gmkb-font-heading, sans-serif);
  font-size: var(--gmkb-font-size-xl, 2rem);
  color: var(--gmkb-color-text, #333333);
}

.guest-tagline {
  background: linear-gradient(135deg, 
    var(--gmkb-color-primary, #007bff) 0%, 
    var(--gmkb-color-primary-hover, #0056b3) 100%);
}
</style>
```

## Data Persistence Flow

### Save Flow (Editor → Database)

```
User Action (Change Theme)
    ↓
ThemeStore.applyTheme('modern_dark')
    ↓
Update this.currentTheme = 'modern_dark'
    ↓
Apply CSS variables to DOM
    ↓
Sync to MediaKitStore
    ├─ mediaKitStore.theme = 'modern_dark'
    └─ mediaKitStore._trackChange() (mark dirty)
    ↓
User Clicks "Save"
    ↓
MediaKitStore.save()
    ↓
AJAX POST to WordPress
    ├─ URL: /wp-admin/admin-ajax.php
    ├─ Action: guestify_save_media_kit
    └─ Payload: {
          theme: 'modern_dark',
          themeCustomizations: { ... },
          components: { ... },
          sections: [ ... ]
        }
    ↓
WordPress Handler
    ├─ Validate data
    ├─ Sanitize input
    └─ Save to post meta
        ├─ update_post_meta($post_id, 'gmkb_theme', 'modern_dark')
        └─ update_post_meta($post_id, 'gmkb_theme_customizations', $customizations)
    ↓
Return Success
    ↓
MediaKitStore.isDirty = false
```

### Load Flow (Database → Frontend)

```
User Visits Frontend Page
    ↓
WordPress Template Loads
    ↓
Load Post Meta
    ├─ $theme = get_post_meta($post_id, 'gmkb_theme', true)
    ├─ $customizations = get_post_meta($post_id, 'gmkb_theme_customizations', true)
    └─ $themes = apply_filters('gmkb_available_themes', [...])
    ↓
Inject into Page (wp_localize_script)
    ↓
window.gmkbData = {
  postId: 123,
  currentTheme: 'modern_dark',
  themeCustomizations: { ... },
  themes: [ ... ]
}
    ↓
Vue App Mounts
    ↓
ThemeProvider.vue Initializes
    ├─ Read window.gmkbData
    ├─ Merge theme + customizations
    └─ Generate CSS variables
    ↓
Inject <style> Tag
:root {
  --gmkb-color-primary: #00d4ff;
  --gmkb-color-background: #0a0a0a;
  ...
}
    ↓
Components Render
    └─ Use var(--gmkb-color-primary) in CSS
```

## Component Theme Compliance

### Expected Behavior

All components MUST use CSS variables for theming. Here's what should happen:

#### ✅ CORRECT Implementation

```vue
<!-- GuestIntro.vue -->
<style scoped>
.guest-tagline {
  /* CORRECT: Uses theme variable */
  background: var(--gmkb-color-primary, #007bff);
  color: white;
  padding: var(--gmkb-spacing-md, 1rem);
}
</style>
```

**Result**: When theme changes from `professional_clean` (blue) to `modern_dark` (cyan), the tagline background automatically updates to cyan.

#### ❌ INCORRECT Implementation

```vue
<!-- AuthorityHook.vue (EXAMPLE OF PROBLEM) -->
<style scoped>
.authority-badge {
  /* WRONG: Hardcoded color */
  background: #007bff;
  color: white;
}
</style>
```

**Result**: When theme changes, the color stays blue instead of updating to the theme's primary color.

### How to Fix Non-Compliant Components

1. **Identify hardcoded values**:
```css
/* Before */
.component {
  color: #333333;
  background: #ffffff;
  padding: 16px;
  border-radius: 8px;
}
```

2. **Replace with CSS variables**:
```css
/* After */
.component {
  color: var(--gmkb-color-text, #333333);
  background: var(--gmkb-color-surface, #ffffff);
  padding: var(--gmkb-spacing-md, 16px);
  border-radius: var(--gmkb-border-radius, 8px);
}
```

3. **Test with multiple themes**:
   - Switch to each theme in the builder
   - Verify component updates correctly
   - Check that colors, fonts, spacing all change

### Compliance Checklist

For each component, verify:

- [ ] No hardcoded colors (except white/black for contrast)
- [ ] No hardcoded font families
- [ ] No hardcoded spacing values
- [ ] No hardcoded border-radius values
- [ ] No hardcoded box-shadows
- [ ] All CSS uses `var(--gmkb-*, fallback)`
- [ ] Component tested with all 4 themes
- [ ] Component maintains readability in all themes

## Common Issues & Solutions

### Issue 1: Component Doesn't Update with Theme

**Symptom**: Component keeps same colors when theme changes

**Cause**: Component uses hardcoded values instead of CSS variables

**Solution**:
```vue
<!-- Before -->
<style scoped>
.component {
  background: #007bff; /* Hardcoded */
}
</style>

<!-- After -->
<style scoped>
.component {
  background: var(--gmkb-color-primary, #007bff);
}
</style>
```

### Issue 2: Customizations Not Persisting

**Symptom**: User's color changes disappear on page reload

**Cause**: Customizations not being saved to post meta

**Solution**: Verify the save flow:

```javascript
// 1. Check ThemeStore syncs to MediaKitStore
themeStore.updateCustomization('--gmkb-color-primary', '#ff0000');
// Should trigger:
mediaKitStore._trackChange();

// 2. Check save includes themeCustomizations
const payload = {
  theme: this.theme,
  themeCustomizations: this.themeCustomizations // Must be included
};

// 3. Check WordPress saves to post meta
update_post_meta($post_id, 'gmkb_theme_customizations', $customizations);
```

### Issue 3: CSS Variables Not Available

**Symptom**: Console shows `var(--gmkb-color-primary)` returns empty

**Cause**: ThemeProvider not initialized or CSS not injected

**Solution**:
```javascript
// Check if ThemeProvider initialized
if (document.getElementById('gmkb-theme-styles')) {
  console.log('✅ Theme styles injected');
} else {
  console.error('❌ Theme styles missing');
}

// Check if variables exist
const primary = getComputedStyle(document.documentElement)
  .getPropertyValue('--gmkb-color-primary');
console.log('Primary color:', primary);
```

### Issue 4: Theme Data Not Loading

**Symptom**: Frontend shows default theme despite saved selection

**Cause**: `window.gmkbData` not properly injected

**Solution**:
```php
// Verify wp_localize_script is called
add_action('wp_enqueue_scripts', function() {
    wp_enqueue_script('gmkb-frontend');
    
    wp_localize_script('gmkb-frontend', 'gmkbData', [
        'currentTheme' => get_post_meta(get_the_ID(), 'gmkb_theme', true),
        'themeCustomizations' => get_post_meta(get_the_ID(), 'gmkb_theme_customizations', true),
        'themes' => apply_filters('gmkb_available_themes', [...])
    ]);
});
```

## Testing Theme Settings

### Manual Testing Checklist

1. **Save/Load Test**:
   - [ ] Select theme in builder
   - [ ] Customize a color
   - [ ] Click Save
   - [ ] Refresh page
   - [ ] Verify theme and customization persist

2. **Frontend Display Test**:
   - [ ] View frontend page
   - [ ] Verify theme matches selection
   - [ ] Verify customizations applied
   - [ ] Check all components reflect theme

3. **Theme Switch Test**:
   - [ ] Switch between all 4 themes
   - [ ] Verify immediate visual update
   - [ ] Save and verify persistence
   - [ ] Check frontend matches

4. **Component Compliance Test**:
   - [ ] Apply each theme
   - [ ] Inspect each component visually
   - [ ] Verify colors/fonts/spacing update
   - [ ] Identify any non-compliant components

### Automated Testing

Use the provided test suite:

```html
<!-- tests/theme-customizer-test.html -->
<!-- Open in browser to run automated tests -->
```

The test suite verifies:
- Theme availability
- CSS variable existence
- Theme application
- Component compliance
- Customization persistence

## Database Schema Reference

### Post Meta Keys

| Meta Key | Type | Description | Example |
|----------|------|-------------|---------|
| `gmkb_media_kit_state` | JSON | Complete component state | `{"components": {...}, "sections": [...]}` |
| `gmkb_theme` | String | Selected theme ID | `"professional_clean"` |
| `gmkb_theme_customizations` | JSON | CSS variable overrides | `{"--gmkb-color-primary": "#ff0000"}` |

### Theme Data Structure

```javascript
{
  id: 'professional_clean',
  name: 'Professional Clean',
  colors: {
    primary: '#007bff',
    primaryHover: '#0056b3',
    secondary: '#6c757d',
    accent: '#17a2b8',
    text: '#333333',
    textLight: '#666666',
    background: '#ffffff',
    surface: '#f8f9fa',
    border: '#dee2e6'
  },
  typography: {
    fontPrimary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontHeading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSizeBase: '16px',
    fontSizeSm: '14px',
    fontSizeLg: '20px',
    fontSizeXl: '32px',
    fontSizeXxl: '48px',
    lineHeightBase: '1.6',
    lineHeightHeading: '1.2',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightBold: '700'
  },
  spacing: {
    baseUnit: '4px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    componentGap: '16px',
    sectionGap: '32px'
  },
  effects: {
    borderRadius: '8px',
    borderRadiusSm: '4px',
    borderRadiusLg: '12px',
    borderRadiusFull: '9999px',
    shadowSm: '0 2px 4px rgba(0,0,0,0.1)',
    shadowMd: '0 4px 6px rgba(0,0,0,0.1)',
    shadowLg: '0 10px 20px rgba(0,0,0,0.15)',
    shadowXl: '0 20px 40px rgba(0,0,0,0.2)',
    transitionSpeed: '0.3s',
    transitionFast: '0.15s',
    transitionSlow: '0.5s'
  }
}
```

## Alignment Verification

### How to Verify Complete Alignment

Run these verification steps:

```javascript
// 1. Check Editor State
console.log('Editor Theme:', mediaKitStore.theme);
console.log('Editor Customizations:', mediaKitStore.themeCustomizations);

// 2. Check Database (WordPress admin)
// Run in browser console on edit page:
jQuery.post(ajaxurl, {
  action: 'gmkb_debug_theme_data',
  post_id: window.gmkbData.postId
}, function(response) {
  console.log('Database Theme:', response.theme);
  console.log('Database Customizations:', response.customizations);
});

// 3. Check Frontend
console.log('Frontend Theme:', window.gmkbData.currentTheme);
console.log('Frontend Customizations:', window.gmkbData.themeCustomizations);

// 4. Check Applied CSS
const primary = getComputedStyle(document.documentElement)
  .getPropertyValue('--gmkb-color-primary');
console.log('Applied Primary Color:', primary);
```

All four should match. If they don't, trace through the flow to find where the disconnect occurs.

## Conclusion

The theme settings flow through three main stages:

1. **Editor**: User makes changes → Pinia stores track state
2. **Database**: Save action → WordPress post meta stores data
3. **Frontend**: Page load → ThemeProvider generates CSS → Components use variables

For proper functioning:
- All components must use CSS variables
- ThemeStore must sync with MediaKitStore
- WordPress must save theme + customizations
- Frontend must inject window.gmkbData
- ThemeProvider must apply CSS to :root

When issues arise, check each stage in sequence to identify where the flow breaks.
