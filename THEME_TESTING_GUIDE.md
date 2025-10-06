# Theme Customizer Testing & Verification Suite

## Overview

This document provides a complete guide to testing and verifying the Media Kit Builder theme system, including all available settings, component compliance, and data flow alignment.

## Files Created

### 1. Test Suite
**Location**: `tests/theme-customizer-test.html`

**Purpose**: Automated browser-based testing of the theme system

**Features**:
- Theme availability verification
- CSS variable contract testing
- Theme application testing
- Component compliance checks
- Customization persistence testing
- Interactive theme preview

**Usage**:
```bash
# Open in browser
open tests/theme-customizer-test.html

# Or serve with local server
python -m http.server 8000
# Then visit: http://localhost:8000/tests/theme-customizer-test.html
```

### 2. Documentation
**Location**: `docs/theme-settings-flow.md`

**Purpose**: Complete documentation of theme settings data flow

**Covers**:
- Architecture overview
- Data flow from editor → database → frontend
- Component compliance requirements
- Common issues and solutions
- Database schema reference
- Alignment verification procedures

### 3. Compliance Checker
**Location**: `scripts/check-component-compliance.js`

**Purpose**: Automated scanning of Vue components for theme compliance

**Features**:
- Detects hardcoded colors
- Identifies hardcoded fonts
- Finds hardcoded spacing values
- Checks for hardcoded border-radius
- Flags hardcoded shadows
- Generates compliance report

**Usage**:
```bash
# Install Node.js if not already installed

# Run checker
node scripts/check-component-compliance.js components/

# With custom output file
node scripts/check-component-compliance.js components/ my-report.json
```

## Available Theme Settings

### Complete Settings Inventory

#### Colors (9 settings)
| CSS Variable | Purpose | Example Value |
|--------------|---------|---------------|
| `--gmkb-color-primary` | Primary brand color | `#007bff` |
| `--gmkb-color-primary-hover` | Primary hover state | `#0056b3` |
| `--gmkb-color-secondary` | Secondary brand color | `#6c757d` |
| `--gmkb-color-accent` | Accent/highlight color | `#17a2b8` |
| `--gmkb-color-text` | Main text color | `#333333` |
| `--gmkb-color-text-light` | Secondary text color | `#666666` |
| `--gmkb-color-background` | Page background | `#ffffff` |
| `--gmkb-color-surface` | Component background | `#f8f9fa` |
| `--gmkb-color-border` | Border color | `#dee2e6` |

#### Typography (12 settings)
| CSS Variable | Purpose | Example Value |
|--------------|---------|---------------|
| `--gmkb-font-primary` | Body text font | `"Inter", sans-serif` |
| `--gmkb-font-heading` | Heading font | `"Inter", sans-serif` |
| `--gmkb-font-size-base` | Base font size | `16px` |
| `--gmkb-font-size-sm` | Small text | `14px` |
| `--gmkb-font-size-lg` | Large text | `20px` |
| `--gmkb-font-size-xl` | Extra large | `32px` |
| `--gmkb-font-size-xxl` | Double XL | `48px` |
| `--gmkb-line-height-base` | Body line height | `1.6` |
| `--gmkb-line-height-heading` | Heading line height | `1.2` |
| `--gmkb-font-weight-normal` | Normal weight | `400` |
| `--gmkb-font-weight-medium` | Medium weight | `500` |
| `--gmkb-font-weight-bold` | Bold weight | `700` |

#### Spacing (30 settings)
| CSS Variable | Purpose | Example Value |
|--------------|---------|---------------|
| `--gmkb-spacing-base` | Base unit | `4px` |
| `--gmkb-spacing-xs` | Extra small | `4px` |
| `--gmkb-spacing-sm` | Small | `8px` |
| `--gmkb-spacing-md` | Medium | `16px` |
| `--gmkb-spacing-lg` | Large | `24px` |
| `--gmkb-spacing-xl` | Extra large | `32px` |
| `--gmkb-spacing-xxl` | Double XL | `48px` |
| `--gmkb-spacing-component-gap` | Gap between components | `16px` |
| `--gmkb-spacing-section-gap` | Gap between sections | `32px` |
| `--gmkb-space-0` through `--gmkb-space-20` | Numeric spacing (0-80px) | `0px` to `80px` |

#### Effects (11 settings)
| CSS Variable | Purpose | Example Value |
|--------------|---------|---------------|
| `--gmkb-border-radius` | Default radius | `8px` |
| `--gmkb-border-radius-sm` | Small radius | `4px` |
| `--gmkb-border-radius-lg` | Large radius | `12px` |
| `--gmkb-border-radius-full` | Fully rounded | `9999px` |
| `--gmkb-shadow-sm` | Small shadow | `0 2px 4px rgba(0,0,0,0.1)` |
| `--gmkb-shadow-md` | Medium shadow | `0 4px 6px rgba(0,0,0,0.1)` |
| `--gmkb-shadow-lg` | Large shadow | `0 10px 20px rgba(0,0,0,0.15)` |
| `--gmkb-shadow-xl` | Extra large shadow | `0 20px 40px rgba(0,0,0,0.2)` |
| `--gmkb-transition-speed` | Default transition | `0.3s` |
| `--gmkb-transition-fast` | Fast transition | `0.15s` |
| `--gmkb-transition-slow` | Slow transition | `0.5s` |

**Total: 62 customizable settings per theme**

## Component Compliance Issues

### Known Non-Compliant Components

Based on the current codebase review, the following components have been verified:

#### ✅ Compliant Components
1. **GuestIntro.vue** - Fully uses CSS variables
2. **LogoGrid.vue** - Fully uses CSS variables  
3. **TopicsQuestions.vue** - Fully uses CSS variables
4. **PhotoGallery.vue** - Not examined yet (need to check)

#### ⚠️ Components to Verify
These components were not in the provided files and need manual verification:

1. **AuthorityHook.vue** - Mentioned as having issues with theme colors
2. **Hero.vue** - Need to verify
3. **Biography.vue** - Need to verify
4. **Contact.vue** - Need to verify
5. **Social.vue** - Need to verify
6. **Testimonials.vue** - Need to verify
7. **CallToAction.vue** - Need to verify

### How to Fix Non-Compliant Components

**Step 1**: Run the compliance checker
```bash
node scripts/check-component-compliance.js components/
```

**Step 2**: Review the report
```json
{
  "summary": {
    "total": 10,
    "compliant": 7,
    "nonCompliant": 3,
    "complianceRate": "70.0%"
  },
  "components": [
    {
      "file": "AuthorityHook.vue",
      "compliant": false,
      "issues": [
        {
          "type": "color",
          "value": "background: #007bff",
          "suggestion": "Use var(--gmkb-color-primary)"
        }
      ]
    }
  ]
}
```

**Step 3**: Fix each issue
```vue
<!-- Before -->
<style scoped>
.authority-badge {
  background: #007bff; /* Hardcoded */
  color: white;
  padding: 16px; /* Hardcoded */
  border-radius: 8px; /* Hardcoded */
}
</style>

<!-- After -->
<style scoped>
.authority-badge {
  background: var(--gmkb-color-primary, #007bff); /* Uses variable with fallback */
  color: white;
  padding: var(--gmkb-spacing-md, 16px);
  border-radius: var(--gmkb-border-radius, 8px);
}
</style>
```

**Step 4**: Test with all themes
```bash
# Open theme test suite
open tests/theme-customizer-test.html

# Click through all 4 theme buttons
# Verify component updates correctly
```

## Data Alignment Verification

### Verifying Editor → Database → Frontend Alignment

Run this comprehensive check:

```javascript
// 1. EDITOR STATE (in Media Kit Builder)
console.log('=== EDITOR STATE ===');
console.log('Current Theme:', mediaKitStore.theme);
console.log('Customizations:', mediaKitStore.themeCustomizations);

// 2. DATABASE STATE (WordPress Admin)
// Add this temporary action to your theme or plugin:
add_action('wp_ajax_gmkb_debug_theme', function() {
    $post_id = $_POST['post_id'];
    wp_send_json([
        'theme' => get_post_meta($post_id, 'gmkb_theme', true),
        'customizations' => get_post_meta($post_id, 'gmkb_theme_customizations', true)
    ]);
});

// Then in browser console:
jQuery.post(ajaxurl, {
    action: 'gmkb_debug_theme',
    post_id: window.gmkbData.postId
}, function(response) {
    console.log('=== DATABASE STATE ===');
    console.log('Saved Theme:', response.theme);
    console.log('Saved Customizations:', response.customizations);
});

// 3. FRONTEND STATE (on public page)
console.log('=== FRONTEND STATE ===');
console.log('Loaded Theme:', window.gmkbData.currentTheme);
console.log('Loaded Customizations:', window.gmkbData.themeCustomizations);

// 4. APPLIED CSS
console.log('=== APPLIED CSS ===');
const root = document.documentElement;
const computedStyle = getComputedStyle(root);
console.log('Primary Color:', computedStyle.getPropertyValue('--gmkb-color-primary'));
console.log('Font Primary:', computedStyle.getPropertyValue('--gmkb-font-primary'));
console.log('Spacing MD:', computedStyle.getPropertyValue('--gmkb-spacing-md'));

// 5. ALIGNMENT CHECK
function checkAlignment() {
    const editorTheme = mediaKitStore?.theme;
    const frontendTheme = window.gmkbData?.currentTheme;
    
    if (editorTheme === frontendTheme) {
        console.log('✅ Themes are aligned');
    } else {
        console.error('❌ Theme mismatch!');
        console.error('  Editor:', editorTheme);
        console.error('  Frontend:', frontendTheme);
    }
    
    // Check customizations
    const editorCustom = mediaKitStore?.themeCustomizations || {};
    const frontendCustom = window.gmkbData?.themeCustomizations || {};
    
    const editorKeys = Object.keys(editorCustom);
    const frontendKeys = Object.keys(frontendCustom);
    
    if (editorKeys.length === frontendKeys.length) {
        console.log('✅ Customizations count matches');
    } else {
        console.warn('⚠️  Customization count mismatch');
        console.warn('  Editor:', editorKeys.length);
        console.warn('  Frontend:', frontendKeys.length);
    }
}

checkAlignment();
```

### Expected Output (Aligned System)

```
=== EDITOR STATE ===
Current Theme: "modern_dark"
Customizations: {
  "--gmkb-color-primary": "#00d4ff",
  "--gmkb-spacing-md": "20px"
}

=== DATABASE STATE ===
Saved Theme: "modern_dark"
Saved Customizations: {
  "--gmkb-color-primary": "#00d4ff",
  "--gmkb-spacing-md": "20px"
}

=== FRONTEND STATE ===
Loaded Theme: "modern_dark"
Loaded Customizations: {
  "--gmkb-color-primary": "#00d4ff",
  "--gmkb-spacing-md": "20px"
}

=== APPLIED CSS ===
Primary Color: "#00d4ff"
Font Primary: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
Spacing MD: "20px"

✅ Themes are aligned
✅ Customizations count matches
```

## Testing Checklist

### Pre-Deployment Testing

- [ ] **Theme Availability**
  - [ ] All 4 themes load in editor
  - [ ] All 4 themes load on frontend
  - [ ] Theme switcher works
  - [ ] Theme metadata displays correctly

- [ ] **CSS Variables**
  - [ ] Run automated test suite
  - [ ] All 62 variables present
  - [ ] Variables have correct values
  - [ ] Variables update on theme change

- [ ] **Component Compliance**
  - [ ] Run compliance checker
  - [ ] Fix all non-compliant components
  - [ ] Verify components in all 4 themes
  - [ ] Check responsive behavior

- [ ] **Customizations**
  - [ ] Apply color customization
  - [ ] Apply font customization
  - [ ] Apply spacing customization
  - [ ] Verify preview shows changes
  - [ ] Save and reload
  - [ ] Verify customizations persist

- [ ] **Data Persistence**
  - [ ] Save in editor
  - [ ] Check database values
  - [ ] Reload editor
  - [ ] View frontend
  - [ ] Verify full alignment

- [ ] **Error Handling**
  - [ ] Invalid theme ID
  - [ ] Missing customizations
  - [ ] Corrupted post meta
  - [ ] Missing gmkbData

### Post-Deployment Monitoring

- [ ] Check browser console for errors
- [ ] Verify theme applies on page load
- [ ] Test theme switching
- [ ] Verify mobile responsiveness
- [ ] Check cross-browser compatibility
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

## Troubleshooting Guide

### Issue: Component not updating with theme

**Diagnosis**:
```javascript
// Check if component uses CSS variables
const element = document.querySelector('.your-component');
const styles = getComputedStyle(element);
console.log('Background:', styles.background);
// If it shows hardcoded value instead of theme color, component is non-compliant
```

**Solution**: Update component CSS to use variables

### Issue: Customizations not saving

**Diagnosis**:
```javascript
// Check save payload
mediaKitStore.save(); // Observe Network tab

// Should include:
{
  "theme": "professional_clean",
  "themeCustomizations": {
    "--gmkb-color-primary": "#ff0000"
  }
}
```

**Solution**: Verify ThemeStore syncs to MediaKitStore

### Issue: Frontend shows wrong theme

**Diagnosis**:
```php
// In WordPress template
$theme = get_post_meta(get_the_ID(), 'gmkb_theme', true);
var_dump($theme); // Check saved value

$injected = wp_scripts()->get_data('gmkb-frontend', 'data');
var_dump($injected); // Check injected value
```

**Solution**: Verify wp_localize_script is called

### Issue: CSS variables not defined

**Diagnosis**:
```javascript
// Check if ThemeProvider loaded
const styleTag = document.getElementById('gmkb-theme-styles');
console.log('Theme styles:', styleTag ? 'Present' : 'Missing');

// Check variable
const primary = getComputedStyle(document.documentElement)
  .getPropertyValue('--gmkb-color-primary');
console.log('Primary:', primary || 'NOT DEFINED');
```

**Solution**: Verify ThemeProvider.vue is mounted

## Summary

### What We've Created

1. **Comprehensive test suite** - Automated browser-based testing
2. **Complete documentation** - Full data flow explanation
3. **Compliance checker** - Automated component scanning
4. **Testing procedures** - Step-by-step verification

### What You Need to Do

1. **Run the tests**:
   ```bash
   # Automated tests
   open tests/theme-customizer-test.html
   
   # Component compliance
   node scripts/check-component-compliance.js components/
   ```

2. **Fix non-compliant components**:
   - Review compliance report
   - Update hardcoded values to CSS variables
   - Test with all themes

3. **Verify alignment**:
   - Check editor state
   - Check database state
   - Check frontend state
   - Confirm all match

4. **Document findings**:
   - Note any persistent issues
   - Update component list
   - Create fix tickets if needed

### Next Steps

1. **Immediate**: Run the test suite to identify issues
2. **Short-term**: Fix all non-compliant components
3. **Medium-term**: Add theme customizer UI to builder
4. **Long-term**: Add more themes and customization options

All tools and documentation are now in place to ensure theme settings work correctly across the entire system!
