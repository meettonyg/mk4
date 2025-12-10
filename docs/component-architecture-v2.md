# Component Architecture V2

**Version:** 2.0  
**Date:** 2025-01-10  
**Status:** Active

## Overview

This document defines the simplified component architecture that replaces the previous 6-layer nested structure with a clean 3-layer approach.

## DOM Structure

### OLD Architecture (6 layers) - ❌ DEPRECATED

```html
<div class="component-wrapper">
  <div class="component-wrapper__content">
    <div class="component-renderer">
      <div class="gmkb-biography-component">
        <div class="biography-container">
          <div class="biography-content">
            <!-- Actual content -->
```

**Problems:**
- Too many nested layers
- CSS complexity
- Difficult to target for styling
- Performance overhead
- Inconsistent across components

### NEW Architecture (3 layers) - ✅ CURRENT

```html
<div class="component-wrapper" data-component-id="..." style="margin: ...">
  <ComponentControls />
  <BiographyComponent 
    class="component-root biography-component"
    :data="data"
    :settings="settings"
    style="padding: ...; background: ...; border: ..."
  />
</div>
```

**Benefits:**
- Minimal DOM nesting
- Direct style application
- Consistent across all components
- Better performance
- Easier to maintain

## Style Application Strategy

### Layer Responsibilities

| Layer | Class | Styles Applied |
|-------|-------|---------------|
| **Wrapper** | `.component-wrapper` | Margin only |
| **Component Root** | `.component-root` | Background, padding, border, typography, effects |
| **Content** | Component-specific | Component-specific styles |

### CSS Selectors

```css
/* Wrapper - Margin only */
[data-component-id="comp_123"] {
  margin: 32px 0 32px 0;
}

/* Component Root - All visual styles */
[data-component-id="comp_123"] .component-root {
  background-color: #ffffff;
  padding: 40px 20px 40px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
```

### Why This Works

- **No inheritance needed**: Direct style application to the correct layer
- **Predictable**: Same pattern across all components
- **Performance**: Fewer DOM queries, simpler selectors
- **Maintainable**: Clear separation of concerns

## Component Editor Structure

All components MUST have the following tab structure:

### 1. Content Tab
- Component-specific fields
- Data input and configuration
- Content management

### 2. Style Tab
- Uses `BaseStylePanel.vue`
- Consistent styling controls across all components
- Spacing, colors, typography, borders, effects

### 3. Advanced Tab
- Uses `BaseAdvancedPanel.vue`
- Layout options
- Responsive visibility
- Custom CSS

### Editor Template

```vue
<template>
  <div class="component-editor">
    <!-- Tab Navigation -->
    <div class="editor-tabs">
      <button @click="activeTab = 'content'" :class="{ active: activeTab === 'content' }">
        Content
      </button>
      <button @click="activeTab = 'style'" :class="{ active: activeTab === 'style' }">
        Style
      </button>
      <button @click="activeTab = 'advanced'" :class="{ active: activeTab === 'advanced' }">
        Advanced
      </button>
    </div>
    
    <!-- Tab Content -->
    <div class="editor-content">
      <div v-show="activeTab === 'content'">
        <!-- Component-specific content fields -->
      </div>
      
      <div v-show="activeTab === 'style'">
        <BaseStylePanel :component-id="componentId" />
      </div>
      
      <div v-show="activeTab === 'advanced'">
        <BaseAdvancedPanel :component-id="componentId" />
      </div>
    </div>
  </div>
</template>
```

## Component Implementation Pattern

### Vue Component Structure

```vue
<template>
  <div 
    class="component-root biography-component"
    :data-component-id="componentId"
  >
    <!-- Component content -->
    <div class="biography-image" v-if="imageUrl">
      <img :src="imageUrl" :alt="name" />
    </div>
    
    <div class="biography-content">
      <h2 v-if="name">{{ name }}</h2>
      <p v-if="title">{{ title }}</p>
      <div v-html="bio"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  componentId: String,
  data: Object,
  props: Object,
  settings: Object
});

// Extract data
const imageUrl = computed(() => props.data?.imageUrl || props.props?.imageUrl);
const name = computed(() => props.data?.name || props.props?.name);
// ... etc
</script>

<style scoped>
.component-root {
  /* Styles applied via ComponentStyleService */
  display: block;
}

/* Component-specific styles */
.biography-image {
  margin-bottom: 1.5rem;
}

.biography-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

/* DO NOT add background, padding, border here - handled by StyleService */
</style>
```

### Key Principles

1. **Single root element** with `.component-root` class
2. **No nested containers** for styling purposes
3. **All styling** applied via inline styles from ComponentStyleService
4. **Component-specific styles** only for layout and structure
5. **Props interface**: `componentId`, `data`, `props`, `settings`

## Default Settings Schema

All components start with these default settings:

```javascript
{
  style: {
    spacing: {
      margin: { top: 32, right: 0, bottom: 32, left: 0, unit: 'px' },
      padding: { top: 40, right: 20, bottom: 40, left: 20, unit: 'px' }
    },
    background: {
      color: '#ffffff',
      opacity: 100
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: { value: 16, unit: 'px' },
      fontWeight: '400',
      lineHeight: { value: 1.6, unit: 'unitless' },
      color: '#1e293b',
      textAlign: 'left'
    },
    border: {
      width: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
      style: 'solid',
      color: '#e5e7eb',
      radius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8, unit: 'px' }
    },
    effects: {
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }
  },
  advanced: {
    layout: {
      width: { type: 'auto', value: 100, unit: '%' },
      alignment: 'left'
    },
    responsive: {
      hideOnMobile: false,
      hideOnTablet: false,
      hideOnDesktop: false
    },
    custom: {
      cssClasses: '',
      cssId: '',
      customCSS: ''
    }
  }
}
```

## Migration Checklist

When updating a component to V2 architecture:

- [ ] Remove nested wrapper divs (keep only `.component-root`)
- [ ] Add `.component-root` class to root element
- [ ] Remove inline background/padding styles from template
- [ ] Update editor to use tab structure (Content/Style/Advanced)
- [ ] Verify BaseStylePanel integration
- [ ] Verify BaseAdvancedPanel integration
- [ ] Test style changes apply correctly
- [ ] Test responsive visibility
- [ ] Verify no console errors
- [ ] Update component documentation

## Performance Benefits

### Before (6 layers)
- **DOM nodes per component**: ~6
- **CSS selector complexity**: High (nested targeting)
- **Style recalculation**: Expensive (cascade through layers)
- **Memory footprint**: Higher

### After (3 layers)
- **DOM nodes per component**: ~3 (50% reduction)
- **CSS selector complexity**: Low (direct targeting)
- **Style recalculation**: Fast (no cascade)
- **Memory footprint**: Lower

### Measured Impact
- Faster initial render
- Smoother drag & drop
- Better scrolling performance
- Reduced memory usage

## Troubleshooting

### Styles Not Applying

**Problem**: Background color not visible  
**Solution**: Check that styles are targeting `.component-root`, not wrapper

**Problem**: Padding not working  
**Solution**: Verify ComponentStyleService is applying to correct selector

### Editor Issues

**Problem**: Tabs not switching  
**Solution**: Ensure `activeTab` state is properly managed

**Problem**: Style changes not reflected  
**Solution**: Check ComponentStyleService is watching store changes

## Related Files

- `src/vue/components/ComponentWrapper.vue` - Main wrapper
- `src/services/ComponentStyleService.js` - Style application
- `src/vue/components/sidebar/editors/BaseStylePanel.vue` - Style editor
- `src/vue/components/sidebar/editors/BaseAdvancedPanel.vue` - Advanced editor
- `src/utils/componentSchema.js` - Default settings

## Version History

- **V2.0** (2025-01-10): Initial simplified architecture
- **V1.0** (2024): Original nested architecture (deprecated)
