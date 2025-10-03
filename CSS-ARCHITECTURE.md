# CSS Architecture - Complete Separation

## Two Distinct CSS Systems

### 1. Design System CSS (Frontend Display)
**Location**: `design-system/`
**Purpose**: Styles for the actual media kit content that users see
**Used by**: Both Vue Builder Preview AND PHP Frontend Display
**Contains**: 
- Component appearance (hero, biography, topics, etc.)
- Section layouts (full-width, 2-column, 3-column)
- Design tokens (colors, spacing, typography)

**Files**:
```
design-system/
├── index.css         → Master import file
├── tokens.css        → CSS variables
├── sections.css      → Section layouts
└── components.css    → Component styles
```

**Classes**: `.gmkb-component--hero`, `.gmkb-section__columns--2`, etc.

---

### 2. Builder UI CSS (Admin Interface)
**Location**: `dist/style.css` (compiled from Vue SFCs)
**Purpose**: Styles for the builder interface itself (sidebar, toolbar, panels, controls)
**Used by**: ONLY Vue Builder
**Contains**:
- Sidebar styling
- Component library modal
- Design panel (right sidebar)
- Toolbar buttons
- Drag-and-drop indicators
- Section controls

**Files**:
```
src/vue/components/
├── Sidebar.vue              → <style scoped> for sidebar
├── ComponentLibrary.vue     → <style scoped> for library modal
├── DesignPanel.vue          → <style scoped> for design panel
├── ComponentControls.vue    → <style scoped> for controls
└── ... (all Vue components)
```

**Classes**: `.gmkb-sidebar`, `.gmkb-modal-overlay`, `.design-panel`, etc.
**Scoped**: Each has unique `[data-v-xxxxx]` attribute

---

## Visual Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MEDIA KIT BUILDER                        │
│                                                             │
│  ┌───────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   SIDEBAR     │  │   CANVAS        │  │ DESIGN PANEL │ │
│  │               │  │                 │  │              │ │
│  │ [Builder UI]  │  │  [Design Sys]   │  │ [Builder UI] │ │
│  │ dist/style.css│  │ design-system/  │  │dist/style.css│ │
│  │               │  │                 │  │              │ │
│  └───────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                          SAVES TO
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND DISPLAY                          │
│                                                             │
│              ┌─────────────────────────┐                    │
│              │   MEDIA KIT CONTENT     │                    │
│              │                         │                    │
│              │    [Design System]      │                    │
│              │    design-system/       │                    │
│              │                         │                    │
│              └─────────────────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Load Order

### Builder Page (`/tools/media-kit/?mkcg_id=123`)

```html
<head>
  <!-- 1. Design System (for preview) -->
  <link rel="stylesheet" href="design-system/index.css">
  
  <!-- 2. Builder UI styles -->
  <link rel="stylesheet" href="dist/style.css">
</head>
```

### Frontend Display (`/guests/tonyg/`)

```html
<head>
  <!-- ONLY Design System -->
  <link rel="stylesheet" href="design-system/index.css">
  
  <!-- NO dist/style.css needed here -->
</head>
```

---

## What Goes Where?

### ✅ Design System (design-system/)

**Component Appearance**:
- Hero gradient background
- Biography card styling
- Topic item borders and hover effects
- Section spacing and gaps
- Responsive breakpoints

**Example**:
```css
/* design-system/components.css */
.gmkb-component--hero {
  padding: var(--gmkb-space-16);
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: var(--gmkb-radius-lg);
}
```

---

### ✅ Builder UI (dist/style.css)

**Interface Elements**:
- Sidebar tabs and navigation
- Component library modal
- Drag-and-drop indicators
- Delete buttons and controls
- Design panel fields
- Toolbar buttons

**Example**:
```vue
<!-- src/vue/components/Sidebar.vue -->
<style scoped>
.gmkb-sidebar {
  background: #0f172a;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-button {
  padding: 12px 8px;
  color: #64748b;
  cursor: pointer;
}
</style>
```

This gets compiled to:
```css
/* dist/style.css */
.gmkb-sidebar[data-v-abc123] {
  background: #0f172a;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## Decision Matrix

**When adding new CSS, ask:**

| Question | Design System | Builder UI |
|----------|--------------|------------|
| Will users see this on frontend? | ✅ Yes | ❌ No |
| Is it a component's appearance? | ✅ Yes | ❌ No |
| Is it the builder's UI? | ❌ No | ✅ Yes |
| Does it use data-v-xxx attribute? | ❌ No | ✅ Yes |
| Needs to work in PHP display? | ✅ Yes | ❌ No |

**Examples**:

- **Hero component gradient** → Design System
- **Sidebar background color** → Builder UI
- **Topic card hover effect** → Design System
- **Component library modal** → Builder UI
- **Section layout grid** → Design System
- **Drag handle cursor** → Builder UI
- **Typography scale** → Design System
- **Design panel input fields** → Builder UI

---

## File Organization

### Current (Correct)

```
mk4/
├── design-system/          ← Frontend display styles
│   ├── index.css
│   ├── tokens.css
│   ├── sections.css
│   └── components.css
│
├── dist/                   ← Builder UI styles (compiled)
│   ├── gmkb.iife.js
│   └── style.css          ← From Vue SFCs
│
├── src/vue/components/     ← Builder UI source
│   ├── Sidebar.vue        ← Has <style scoped>
│   ├── DesignPanel.vue    ← Has <style scoped>
│   └── ...
│
└── css/                    ← LEGACY (to be archived)
    ├── frontend-mediakit.css
    └── modules/
        └── components.css
```

### Action Items

1. ✅ **Keep**: `design-system/` - This is correct
2. ✅ **Keep**: `dist/style.css` - This is correct (builder UI)
3. ✅ **Keep**: Vue SFC `<style scoped>` blocks - This is correct
4. ❌ **Archive**: `css/frontend-mediakit.css` - Replaced by design-system/
5. ❌ **Archive**: `css/modules/components.css` - Replaced by design-system/

---

## Testing Checklist

### Builder Page
- [ ] Sidebar visible and styled
- [ ] Component library modal works
- [ ] Design panel opens on right
- [ ] Canvas shows component preview using design system
- [ ] Drag-and-drop has visual feedback

### Frontend Display
- [ ] Hero component styled correctly
- [ ] Two-column layout works
- [ ] NO builder UI elements visible
- [ ] Only design-system/index.css loaded
- [ ] Mobile responsive

---

## Common Mistakes to Avoid

### ❌ Wrong: Adding builder UI to design system
```css
/* design-system/components.css */
.design-panel {  /* ❌ This is builder UI, not frontend */
  position: fixed;
  right: 0;
  width: 400px;
}
```

### ✅ Right: Builder UI in Vue SFC
```vue
<!-- src/vue/components/DesignPanel.vue -->
<style scoped>
.design-panel {  /* ✅ Correct - builder UI in Vue */
  position: fixed;
  right: 0;
  width: 400px;
}
</style>
```

### ❌ Wrong: Adding component appearance to Vue SFC
```vue
<!-- src/vue/components/HeroComponent.vue -->
<style scoped>
.hero {  /* ❌ This needs to work on frontend too */
  background: linear-gradient(...);
}
</style>
```

### ✅ Right: Component appearance in design system
```css
/* design-system/components.css */
.gmkb-component--hero {  /* ✅ Correct - works everywhere */
  background: linear-gradient(...);
}
```

---

## Summary

**Two separate CSS systems**:

1. **Design System** (`design-system/`) = What users see (frontend + builder preview)
2. **Builder UI** (`dist/style.css`) = Admin interface only (sidebar, panels, controls)

**Key principle**: If it appears on `/guests/slug/`, it belongs in the design system. If it only appears in `/tools/media-kit/` admin interface, it stays in Vue SFCs.

The CSS in `/css/` folder is legacy and should be archived because it duplicates the design system.
