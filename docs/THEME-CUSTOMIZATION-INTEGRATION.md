# Theme Customization & User Overrides - Integration Guide

## CSS Cascade Architecture

The design system is the **BASE LAYER**. User customizations are **OVERRIDE LAYERS** on top.

```
Priority (low to high):
1. Design System (base)           → design-system/index.css
2. Theme Overrides (global)       → Applied via data attributes
3. Section Settings (per-section) → Inline styles
4. Component Settings (per-comp)  → Inline styles
```

---

## 1. Theme Customizer Integration

### How Themes Override Design System

Themes DON'T replace the design system - they override specific tokens using CSS custom properties.

#### Design System Base (Always Loaded)
```css
/* design-system/tokens.css */
:root {
  --gmkb-color-primary: #2563eb;
  --gmkb-color-secondary: #1e40af;
  --gmkb-color-background: #ffffff;
  --gmkb-color-text: #0f172a;
  --gmkb-radius-base: 8px;
}
```

#### Theme Override (Applied on Top)
```css
/* Applied when user selects "Modern Dark" theme */
[data-gmkb-theme="modern_dark"] {
  --gmkb-color-primary: #8b5cf6;      /* Override */
  --gmkb-color-secondary: #7c3aed;    /* Override */
  --gmkb-color-background: #0f172a;   /* Override */
  --gmkb-color-text: #f8fafc;         /* Override */
  /* radius-base NOT overridden, uses design system default */
}
```

### Implementation in PHP Frontend

**File**: `includes/class-gmkb-frontend-display.php`

```php
public function render() {
    $post_id = $this->post_id;
    
    // Get user's selected theme
    $theme_id = get_post_meta($post_id, 'gmkb_theme', true) ?: 'professional_clean';
    
    // Get user's theme customizations
    $theme_customizations = get_post_meta($post_id, 'gmkb_theme_customizations', true) ?: [];
    
    ?>
    <div class="gmkb-frontend-display" 
         data-gmkb-theme="<?php echo esc_attr($theme_id); ?>"
         data-gmkb-post-id="<?php echo esc_attr($post_id); ?>">
        
        <?php
        // Inject theme customizations as inline CSS
        $this->render_theme_customizations($theme_customizations);
        
        // Render sections
        $this->render_sections();
        ?>
    </div>
    <?php
}

private function render_theme_customizations($customizations) {
    if (empty($customizations)) {
        return;
    }
    
    ?>
    <style id="gmkb-theme-customizations">
        /* User's custom theme overrides */
        [data-gmkb-post-id="<?php echo $this->post_id; ?>"] {
            <?php
            // Color overrides
            if (!empty($customizations['colors']['primary'])) {
                echo '--gmkb-color-primary: ' . esc_attr($customizations['colors']['primary']) . ';';
            }
            if (!empty($customizations['colors']['secondary'])) {
                echo '--gmkb-color-secondary: ' . esc_attr($customizations['colors']['secondary']) . ';';
            }
            if (!empty($customizations['colors']['background'])) {
                echo '--gmkb-color-background: ' . esc_attr($customizations['colors']['background']) . ';';
            }
            
            // Typography overrides
            if (!empty($customizations['typography']['fontFamily'])) {
                echo '--gmkb-font-primary: ' . esc_attr($customizations['typography']['fontFamily']) . ';';
            }
            if (!empty($customizations['typography']['fontSize'])) {
                echo '--gmkb-font-size-base: ' . esc_attr($customizations['typography']['fontSize']) . 'px;';
            }
            
            // Spacing overrides
            if (!empty($customizations['spacing']['sectionGap'])) {
                echo '--gmkb-section-gap: ' . esc_attr($customizations['spacing']['sectionGap']) . 'px;';
            }
            if (!empty($customizations['spacing']['componentGap'])) {
                echo '--gmkb-component-gap: ' . esc_attr($customizations['spacing']['componentGap']) . 'px;';
            }
            
            // Border radius overrides
            if (!empty($customizations['effects']['borderRadius'])) {
                echo '--gmkb-radius-base: ' . esc_attr($customizations['effects']['borderRadius']) . 'px;';
            }
            ?>
        }
    </style>
    <?php
}
```

### Example Output

```html
<div class="gmkb-frontend-display" 
     data-gmkb-theme="modern_dark" 
     data-gmkb-post-id="32372">
    
    <!-- User's theme customizations -->
    <style id="gmkb-theme-customizations">
        [data-gmkb-post-id="32372"] {
            --gmkb-color-primary: #8b5cf6;
            --gmkb-color-background: #0f172a;
            --gmkb-font-size-base: 18px;
            --gmkb-section-gap: 80px;
        }
    </style>
    
    <!-- Content uses these overridden variables -->
    <section class="gmkb-section">
        <!-- Will use #8b5cf6 primary color, 18px font, etc. -->
    </section>
</div>
```

---

## 2. Section-Level Customizations

Users can customize individual sections (background, padding, alignment).

### Data Structure

```javascript
// In mediaKit store
{
  sections: [
    {
      section_id: 'section_abc123',
      type: 'two_column',
      settings: {
        // User customizations for THIS section
        backgroundColor: '#f8fafc',
        backgroundOpacity: 0.9,
        padding: {
          top: '60px',
          bottom: '60px',
          left: '20px',
          right: '20px'
        },
        alignment: 'center',
        customClass: 'my-special-section'
      }
    }
  ]
}
```

### Rendering with Inline Styles

**File**: `includes/class-gmkb-frontend-display.php`

```php
private function render_section($section) {
    $section_id = $section['section_id'];
    $layout = $section['layout'] ?? $section['type'] ?? 'full_width';
    $settings = $section['settings'] ?? [];
    
    // Build inline styles from section settings
    $inline_styles = $this->build_section_styles($settings);
    
    ?>
    <section 
        class="gmkb-section gmkb-section--<?php echo esc_attr($layout); ?>" 
        id="<?php echo esc_attr($section_id); ?>"
        <?php if ($inline_styles): ?>
            style="<?php echo esc_attr($inline_styles); ?>"
        <?php endif; ?>
        <?php if (!empty($settings['customClass'])): ?>
            data-custom-class="<?php echo esc_attr($settings['customClass']); ?>"
        <?php endif; ?>
    >
        <div class="gmkb-section__inner">
            <?php $this->render_section_content($section); ?>
        </div>
    </section>
    <?php
}

private function build_section_styles($settings) {
    $styles = [];
    
    // Background color with opacity
    if (!empty($settings['backgroundColor'])) {
        $bg_color = $settings['backgroundColor'];
        $opacity = $settings['backgroundOpacity'] ?? 1;
        
        // Convert hex to rgba if opacity < 1
        if ($opacity < 1) {
            $rgb = $this->hex_to_rgb($bg_color);
            $styles[] = "background-color: rgba({$rgb['r']}, {$rgb['g']}, {$rgb['b']}, $opacity)";
        } else {
            $styles[] = "background-color: $bg_color";
        }
    }
    
    // Padding
    if (!empty($settings['padding'])) {
        $padding = $settings['padding'];
        if (!empty($padding['top'])) $styles[] = "padding-top: {$padding['top']}";
        if (!empty($padding['bottom'])) $styles[] = "padding-bottom: {$padding['bottom']}";
        if (!empty($padding['left'])) $styles[] = "padding-left: {$padding['left']}";
        if (!empty($padding['right'])) $styles[] = "padding-right: {$padding['right']}";
    }
    
    // Text alignment
    if (!empty($settings['alignment'])) {
        $styles[] = "text-align: {$settings['alignment']}";
    }
    
    // Min height
    if (!empty($settings['minHeight'])) {
        $styles[] = "min-height: {$settings['minHeight']}";
    }
    
    return implode('; ', $styles);
}

private function hex_to_rgb($hex) {
    $hex = ltrim($hex, '#');
    return [
        'r' => hexdec(substr($hex, 0, 2)),
        'g' => hexdec(substr($hex, 2, 2)),
        'b' => hexdec(substr($hex, 4, 2))
    ];
}
```

### Example Output

```html
<section 
    class="gmkb-section gmkb-section--two_column" 
    id="section_abc123"
    style="background-color: rgba(248, 250, 252, 0.9); padding-top: 60px; padding-bottom: 60px; text-align: center"
    data-custom-class="my-special-section">
    
    <div class="gmkb-section__inner">
        <!-- Section content -->
    </div>
</section>
```

---

## 3. Component-Level Customizations

Users can customize individual components (colors, sizes, visibility).

### Data Structure

```javascript
// In mediaKit store
{
  components: {
    'comp_hero_123': {
      type: 'hero',
      data: {
        title: 'Tony G',
        subtitle: 'Poker Legend'
      },
      settings: {
        // User customizations for THIS component
        backgroundColor: '#667eea',
        textColor: '#ffffff',
        fontSize: '48px',
        padding: '80px 40px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        customCSS: '.hero__title { font-weight: 900; }'
      }
    }
  }
}
```

### Rendering with Inline Styles

**File**: `includes/class-gmkb-frontend-display.php`

```php
private function render_component($component_id, $component) {
    $type = $component['type'];
    $data = $component['data'] ?? [];
    $settings = $component['settings'] ?? [];
    
    // Build inline styles from component settings
    $inline_styles = $this->build_component_styles($settings);
    
    // Build wrapper classes
    $classes = [
        'gmkb-component',
        "gmkb-component--{$type}"
    ];
    
    if (!empty($settings['customClass'])) {
        $classes[] = sanitize_html_class($settings['customClass']);
    }
    
    ?>
    <div 
        class="<?php echo esc_attr(implode(' ', $classes)); ?>"
        id="<?php echo esc_attr($component_id); ?>"
        <?php if ($inline_styles): ?>
            style="<?php echo esc_attr($inline_styles); ?>"
        <?php endif; ?>
        data-component-type="<?php echo esc_attr($type); ?>"
    >
        <?php
        // Inject custom CSS if provided
        if (!empty($settings['customCSS'])) {
            $this->render_component_custom_css($component_id, $settings['customCSS']);
        }
        
        // Render component content
        $this->render_component_content($type, $data, $settings);
        ?>
    </div>
    <?php
}

private function build_component_styles($settings) {
    $styles = [];
    
    // Background
    if (!empty($settings['backgroundColor'])) {
        $styles[] = "background-color: {$settings['backgroundColor']}";
    }
    
    // Text color
    if (!empty($settings['textColor'])) {
        $styles[] = "color: {$settings['textColor']}";
    }
    
    // Font size
    if (!empty($settings['fontSize'])) {
        $styles[] = "font-size: {$settings['fontSize']}";
    }
    
    // Padding
    if (!empty($settings['padding'])) {
        $styles[] = "padding: {$settings['padding']}";
    }
    
    // Border radius
    if (!empty($settings['borderRadius'])) {
        $styles[] = "border-radius: {$settings['borderRadius']}";
    }
    
    // Box shadow
    if (!empty($settings['boxShadow'])) {
        $styles[] = "box-shadow: {$settings['boxShadow']}";
    }
    
    // Margin
    if (!empty($settings['margin'])) {
        $styles[] = "margin: {$settings['margin']}";
    }
    
    // Display
    if (isset($settings['hidden']) && $settings['hidden']) {
        $styles[] = "display: none";
    }
    
    return implode('; ', $styles);
}

private function render_component_custom_css($component_id, $custom_css) {
    // Scope custom CSS to this component only
    $scoped_css = "#{$component_id} { {$custom_css} }";
    
    ?>
    <style id="<?php echo esc_attr($component_id); ?>-custom">
        <?php echo wp_strip_all_tags($scoped_css); ?>
    </style>
    <?php
}
```

### Example Output

```html
<div 
    class="gmkb-component gmkb-component--hero my-hero-style"
    id="comp_hero_123"
    style="background-color: #667eea; color: #ffffff; font-size: 48px; padding: 80px 40px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2)"
    data-component-type="hero">
    
    <!-- Custom CSS scoped to this component -->
    <style id="comp_hero_123-custom">
        #comp_hero_123 { .hero__title { font-weight: 900; } }
    </style>
    
    <!-- Component content -->
    <div class="hero__content">
        <h1 class="hero__title">Tony G</h1>
        <p class="hero__subtitle">Poker Legend</p>
    </div>
</div>
```

---

## 4. CSS Cascade Priority

Here's how all the layers work together:

```css
/* 1. DESIGN SYSTEM BASE (Lowest Priority) */
.gmkb-component--hero {
  padding: var(--gmkb-space-16);              /* 64px default */
  background: linear-gradient(...);
  color: var(--gmkb-color-text-inverse);      /* #ffffff default */
  border-radius: var(--gmkb-radius-lg);       /* 16px default */
}

/* 2. THEME OVERRIDE (Medium Priority) */
[data-gmkb-theme="modern_dark"] {
  --gmkb-color-primary: #8b5cf6;              /* Override primary */
  --gmkb-radius-lg: 12px;                     /* Override radius */
}

/* 3. USER THEME CUSTOMIZATION (Higher Priority) */
[data-gmkb-post-id="32372"] {
  --gmkb-color-primary: #ff6b6b;              /* User's custom primary */
  --gmkb-radius-lg: 24px;                     /* User's custom radius */
}

/* 4. INLINE STYLES (Highest Priority) */
<div class="gmkb-component--hero" 
     style="padding: 120px 60px; background-color: #667eea">
  <!-- This overrides everything above -->
</div>
```

### Visual Example

```
User edits hero component:
├─ Sets padding to 120px 60px     → Inline style (highest priority)
├─ Keeps gradient background       → Uses theme customization
├─ Keeps primary color             → Uses theme customization
└─ Changes border radius to 24px   → Inline style (highest priority)

Final result:
- padding: 120px 60px           (from inline style)
- background: gradient...        (from design system base)
- color: #ff6b6b                (from user theme customization)
- border-radius: 24px           (from inline style)
```

---

## 5. Vue Builder Integration

### Theme Customizer Store

**File**: `src/stores/themeCustomizer.js`

```javascript
import { defineStore } from 'pinia';

export const useThemeCustomizerStore = defineStore('themeCustomizer', {
  state: () => ({
    selectedTheme: 'professional_clean',
    customizations: {
      colors: {
        primary: null,      // null = use theme default
        secondary: null,
        background: null,
        text: null
      },
      typography: {
        fontFamily: null,
        fontSize: null,
        lineHeight: null
      },
      spacing: {
        sectionGap: null,
        componentGap: null,
        containerPadding: null
      },
      effects: {
        borderRadius: null,
        boxShadow: null,
        enableGradients: true,
        enableAnimations: true
      }
    }
  }),
  
  actions: {
    applyCustomizations() {
      const root = document.documentElement;
      
      // Apply color overrides
      if (this.customizations.colors.primary) {
        root.style.setProperty('--gmkb-color-primary', this.customizations.colors.primary);
      }
      
      // Apply typography overrides
      if (this.customizations.typography.fontSize) {
        root.style.setProperty('--gmkb-font-size-base', this.customizations.typography.fontSize + 'px');
      }
      
      // Apply spacing overrides
      if (this.customizations.spacing.sectionGap) {
        root.style.setProperty('--gmkb-section-gap', this.customizations.spacing.sectionGap + 'px');
      }
      
      // Apply effects
      if (this.customizations.effects.borderRadius !== null) {
        root.style.setProperty('--gmkb-radius-base', this.customizations.effects.borderRadius + 'px');
      }
    },
    
    resetCustomizations() {
      const root = document.documentElement;
      
      // Remove all custom properties
      root.style.removeProperty('--gmkb-color-primary');
      root.style.removeProperty('--gmkb-font-size-base');
      root.style.removeProperty('--gmkb-section-gap');
      root.style.removeProperty('--gmkb-radius-base');
      
      // Reset state
      this.customizations = { /* defaults */ };
    }
  }
});
```

### Section Settings Store

**File**: `src/stores/sectionSettings.js`

```javascript
import { defineStore } from 'pinia';

export const useSectionSettingsStore = defineStore('sectionSettings', {
  state: () => ({
    activeSectionId: null,
    settings: {} // Keyed by section_id
  }),
  
  actions: {
    updateSectionSettings(sectionId, newSettings) {
      if (!this.settings[sectionId]) {
        this.settings[sectionId] = {};
      }
      
      this.settings[sectionId] = {
        ...this.settings[sectionId],
        ...newSettings
      };
      
      // Save to main mediaKit store
      const mediaKitStore = useMediaKitStore();
      mediaKitStore.updateSectionSettings(sectionId, this.settings[sectionId]);
    },
    
    applySectionStyles(sectionId) {
      const settings = this.settings[sectionId];
      if (!settings) return {};
      
      const styles = {};
      
      if (settings.backgroundColor) {
        styles.backgroundColor = settings.backgroundColor;
      }
      
      if (settings.padding) {
        styles.padding = `${settings.padding.top} ${settings.padding.right} ${settings.padding.bottom} ${settings.padding.left}`;
      }
      
      return styles;
    }
  }
});
```

---

## 6. Complete Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  USER CUSTOMIZES                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Theme Customizer (Global)                               │
│     - User changes primary color to #ff6b6b                 │
│     - Stored in: gmkb_theme_customizations meta             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Section Settings (Per-Section)                          │
│     - User sets section background to #f8fafc               │
│     - Stored in: sections[0].settings.backgroundColor       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Component Settings (Per-Component)                      │
│     - User sets hero padding to 120px 60px                  │
│     - Stored in: components[id].settings.padding            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SAVED TO DATABASE                          │
│  - Post Meta: gmkb_theme_customizations                     │
│  - Post Meta: gmkb_media_kit_state                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND PHP RENDERING                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  HTML OUTPUT:                                               │
│                                                             │
│  <div data-gmkb-theme="modern_dark"                         │
│       data-gmkb-post-id="32372">                            │
│                                                             │
│    <!-- Theme customizations -->                            │
│    <style>                                                  │
│      [data-gmkb-post-id="32372"] {                          │
│        --gmkb-color-primary: #ff6b6b; /* User override */   │
│      }                                                      │
│    </style>                                                 │
│                                                             │
│    <!-- Section with settings -->                           │
│    <section style="background-color: #f8fafc;">             │
│                                                             │
│      <!-- Component with settings -->                       │
│      <div class="gmkb-component--hero"                      │
│           style="padding: 120px 60px;">                     │
│        ...                                                  │
│      </div>                                                 │
│                                                             │
│    </section>                                               │
│  </div>                                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Summary

### Design System = Base Layer
- Provides default styling
- Uses CSS variables (custom properties)
- Never modified by users

### User Customizations = Override Layers
1. **Theme Level**: Changes CSS variables globally
2. **Section Level**: Inline styles per section
3. **Component Level**: Inline styles per component

### Priority Order
```
1. Design System (lowest)
2. Selected Theme
3. Theme Customizations
4. Section Settings
5. Component Settings (highest)
```

### Key Benefits
✅ Design system provides consistent defaults  
✅ User customizations override without breaking base  
✅ Changes are isolated (don't affect other media kits)  
✅ Easy to reset (just remove overrides)  
✅ Themes work by changing variables, not replacing CSS

The design system is the **foundation**. User customizations are **layers on top**. Both work together perfectly through CSS cascade and custom properties.
