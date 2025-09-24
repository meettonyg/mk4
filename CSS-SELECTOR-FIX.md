# Fixed Deprecated CSS Selectors

## Issue
Vue 3 compiler warning about deprecated CSS selectors:
```
[@vue/compiler-sfc] the >>> and /deep/ combinators have been deprecated. Use :deep() instead.
```

## Solution Applied

### Fixed BiographyRenderer.vue:
```css
/* OLD (deprecated) */
.biography-text >>> p {
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}

/* NEW (Vue 3 compatible) */
.biography-text :deep(p) {
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}
```

## Vue 3 Deep Selector Syntax

### Deprecated Syntaxes (Don't Use):
- `>>>` - The "deep" combinator
- `/deep/` - Alternative deep syntax
- `::v-deep` - Old Vue 2 syntax

### Correct Vue 3 Syntax:
- `:deep(selector)` - New standard for Vue 3
- `::v-deep(selector)` - Also supported but `:deep()` is preferred

## Examples:

```css
/* Target child component elements */
.parent :deep(.child-class) {
  color: red;
}

/* Target nested HTML from v-html */
.content :deep(p) {
  margin: 1rem 0;
}

/* Target slotted content */
.wrapper :deep(.slot-content) {
  padding: 10px;
}
```

## Build Steps:

1. Clear cache:
```bash
rm -rf node_modules/.vite
rm -rf dist
```

2. Rebuild:
```bash
npm run build
```

The warning should now be resolved. All components use the modern `:deep()` syntax which is Vue 3 compliant.
