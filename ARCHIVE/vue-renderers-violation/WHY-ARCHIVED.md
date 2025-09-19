# Architecture Violation - ARCHIVED

## Why These Files Were Removed

These files violated the self-contained component architecture:

### ❌ WRONG: `/src/vue/components/renderers/`
- BiographyComponent.vue
- HeroComponent.vue  
- TopicsComponent.vue
- ContactComponent.vue
- etc.

### ✅ CORRECT: Self-Contained Components
All component files must be in their self-contained directories:
- `/components/biography/Biography.vue`
- `/components/biography/renderer.vue.js`
- `/components/biography/styles.css`
- `/components/biography/schema.json`
- etc.

## Architecture Principles Violated

1. **Self-Contained Components**: Each component must have ALL its files in `/components/[name]/`
2. **No Duplication**: Don't create parallel component systems
3. **Single Source of Truth**: One component, one location

## The Correct Structure

```
/components/
  /biography/
    Biography.vue          # Vue component
    renderer.vue.js        # Vue renderer module
    styles.css            # Component styles
    schema.json           # Component schema
    template.php          # PHP template
  /hero/
    Hero.vue
    renderer.vue.js
    styles.css
    schema.json
    template.php
```

## Why Separate Controls Were Wrong

The `/src/vue/controls/` system created floating controls separate from components.

**Wrong**: Separate ControlsOverlay system
**Right**: Integrated controls in MediaKitComponent.vue

Controls should be part of the component wrapper, not a separate overlay system.

## Summary

These files were archived because they:
1. Violated self-contained architecture
2. Created duplicate component definitions
3. Separated controls from components
4. Added unnecessary complexity

The correct approach uses the existing self-contained components in `/components/[name]/`.