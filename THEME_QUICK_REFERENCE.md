# Theme System Quick Reference

## Quick Links
- **Full Documentation**: `docs/theme-settings-flow.md`
- **Testing Guide**: `THEME_TESTING_GUIDE.md`
- **CSS Contract**: `docs/css-variable-contract.md`
- **Test Suite**: `tests/theme-customizer-test.html`
- **Compliance Checker**: `scripts/check-component-compliance.js`

## Common Commands

```bash
# Run compliance checker
node scripts/check-component-compliance.js components/

# Open test suite
open tests/theme-customizer-test.html

# Check a specific component
node scripts/check-component-compliance.js components/guest-intro/
```

## Quick Component Fix

### Before (Non-Compliant)
```vue
<style scoped>
.component {
  color: #333333;
  background: #ffffff;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
}
</style>
```

### After (Compliant)
```vue
<style scoped>
.component {
  color: var(--gmkb-color-text, #333333);
  background: var(--gmkb-color-surface, #ffffff);
  padding: var(--gmkb-spacing-md, 16px);
  border-radius: var(--gmkb-border-radius, 8px);
  font-family: var(--gmkb-font-primary, 'Inter', sans-serif);
}
</style>
```

## Variable Quick Reference

### Most Used Variables
```css
/* Colors */
--gmkb-color-primary           /* Brand primary */
--gmkb-color-text              /* Main text */
--gmkb-color-surface           /* Component background */
--gmkb-color-border            /* Borders */

/* Typography */
--gmkb-font-primary            /* Body font */
--gmkb-font-heading            /* Heading font */
--gmkb-font-size-base          /* Base size (16px) */
--gmkb-font-size-lg            /* Large (20px) */
--gmkb-font-size-xl            /* Extra large (32px) */

/* Spacing */
--gmkb-spacing-sm              /* 8px */
--gmkb-spacing-md              /* 16px */
--gmkb-spacing-lg              /* 24px */
--gmkb-space-4                 /* 16px (baseUnit × 4) */

/* Effects */
--gmkb-border-radius           /* 8px */
--gmkb-shadow-md               /* Medium shadow */
--gmkb-transition-speed        /* 0.3s */
```

## Debugging Snippets

### Check if theme variables are loaded
```javascript
const primary = getComputedStyle(document.documentElement)
  .getPropertyValue('--gmkb-color-primary').trim();
console.log('Primary color:', primary || 'NOT LOADED');
```

### Check current theme
```javascript
// In editor
console.log('Editor theme:', mediaKitStore?.theme);

// On frontend
console.log('Frontend theme:', window.gmkbData?.currentTheme);
```

### Verify alignment
```javascript
// Quick alignment check
const editorTheme = mediaKitStore?.theme;
const frontendTheme = window.gmkbData?.currentTheme;
console.log(editorTheme === frontendTheme ? '✅ Aligned' : '❌ Misaligned');
```

### Check if ThemeProvider loaded
```javascript
const styleTag = document.getElementById('gmkb-theme-styles');
console.log(styleTag ? '✅ ThemeProvider loaded' : '❌ ThemeProvider missing');
```

## Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Component not theming | Replace hardcoded values with `var()` |
| Customizations not saving | Check ThemeStore syncs to MediaKitStore |
| Frontend wrong theme | Verify `wp_localize_script` called |
| CSS variables undefined | Check ThemeProvider.vue mounted |

## Available Themes

1. **professional_clean** - Blue, clean, classic
2. **modern_dark** - Cyan on dark, tech-focused
3. **creative_bold** - Red/teal, vibrant
4. **minimal_elegant** - Black/white, sophisticated

## Data Flow Summary

```
Editor (Vue)
    ↓ Save
Database (WordPress Post Meta)
    ↓ Load
Frontend (ThemeProvider.vue)
    ↓ Apply
Components (CSS Variables)
```

## Testing Checklist

- [ ] Run `tests/theme-customizer-test.html`
- [ ] Run `scripts/check-component-compliance.js`
- [ ] Switch themes - verify all components update
- [ ] Customize color - save - reload - verify persists
- [ ] Check browser console for errors

## Post Meta Keys

```php
// Theme selection
get_post_meta($post_id, 'gmkb_theme', true);
// Returns: 'professional_clean'

// Customizations
get_post_meta($post_id, 'gmkb_theme_customizations', true);
// Returns: ['--gmkb-color-primary' => '#ff0000']

// Full state (includes theme reference)
get_post_meta($post_id, 'gmkb_media_kit_state', true);
// Returns: ['components' => [...], 'sections' => [...]]
```

## Emergency Fixes

### Reset to default theme
```javascript
// In browser console
mediaKitStore.theme = 'professional_clean';
mediaKitStore.themeCustomizations = {};
mediaKitStore.save();
```

### Clear broken customizations
```php
// In WordPress
delete_post_meta($post_id, 'gmkb_theme_customizations');
update_post_meta($post_id, 'gmkb_theme', 'professional_clean');
```

### Force theme reload
```javascript
// Reload ThemeProvider
location.reload();
```

## File Locations

### Source Files
```
src/stores/theme.js              # Theme Pinia store
src/stores/mediaKit.js           # Main state store
components/ThemeProvider.vue     # CSS variable injector
```

### Documentation
```
docs/theme-settings-flow.md      # Complete flow docs
docs/css-variable-contract.md    # Variable reference
THEME_TESTING_GUIDE.md           # Testing procedures
```

### Testing
```
tests/theme-customizer-test.html # Browser test suite
scripts/check-component-compliance.js # Compliance checker
```

## WordPress Integration

### Enqueue with theme data
```php
wp_localize_script('gmkb-frontend', 'gmkbData', [
    'currentTheme' => get_post_meta($post_id, 'gmkb_theme', true),
    'themeCustomizations' => get_post_meta($post_id, 'gmkb_theme_customizations', true),
    'themes' => apply_filters('gmkb_available_themes', [...])
]);
```

### Save handler
```php
update_post_meta($post_id, 'gmkb_theme', $theme_id);
update_post_meta($post_id, 'gmkb_theme_customizations', $customizations);
```

## Component Template

```vue
<template>
  <div class="my-component">
    <h3 class="title">{{ title }}</h3>
    <p class="content">{{ content }}</p>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  props: {
    title: { type: String, default: '' },
    content: { type: String, default: '' }
  }
};
</script>

<style scoped>
.my-component {
  /* Use theme variables */
  background: var(--gmkb-color-surface, #fff);
  padding: var(--gmkb-spacing-md, 1rem);
  border-radius: var(--gmkb-border-radius, 8px);
  border: 1px solid var(--gmkb-color-border, #ddd);
}

.title {
  font-family: var(--gmkb-font-heading, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  color: var(--gmkb-color-text, #333);
  margin-bottom: var(--gmkb-spacing-sm, 0.5rem);
}

.content {
  font-family: var(--gmkb-font-primary, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  color: var(--gmkb-color-text-light, #666);
}
</style>
```

## Key Principles

1. **Always use CSS variables** with fallbacks
2. **Never hardcode theme values** (except white/black for contrast)
3. **Test with all 4 themes** before committing
4. **Sync ThemeStore to MediaKitStore** on changes
5. **Include theme + customizations** in save payload

## Support

For issues or questions:
1. Check `docs/theme-settings-flow.md` for complete documentation
2. Run test suite to identify specific problems
3. Review compliance report for component issues
4. Check browser console for runtime errors

---

**Last Updated**: January 2025
**Version**: 1.0.0
