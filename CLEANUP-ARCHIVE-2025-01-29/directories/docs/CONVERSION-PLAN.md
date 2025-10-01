# Component Conversion Plan
## Phase 4 Preparation Document

**Purpose:** This document will be populated after Phase 1 audit runs  
**Generated From:** phase1-audit.js results  
**Used In:** Phase 4 - Vue Component Completion

---

## 📋 How to Use This Document

1. **Run the Phase 1 audit** to populate component data
2. **Review the priority matrix** (P0, P1, P2)
3. **Use this as your conversion checklist** during Phase 4
4. **Update status** as components are converted

---

## 🎯 Priority Matrix

### P0 - Must Have for Launch
**Criteria:** Essential functionality, high user visibility, foundational components

Components will be listed here after audit runs. Example format:

- [ ] **Hero** - Low complexity, 0.5d effort
  - Status: ⏳ Awaiting audit results
  - Vue Path: TBD
  - Dependencies: TBD
  
- [ ] **Biography** - Medium complexity, 1d effort
  - Status: ⏳ Awaiting audit results
  - Vue Path: TBD
  - Dependencies: Pods (biography field)

### P1 - Should Have for Launch  
**Criteria:** Important but not blocking, can be added shortly after

Components will be listed here after audit runs.

### P2 - Nice to Have
**Criteria:** Low priority, can be added post-launch

Components will be listed here after audit runs.

---

## 📊 Component Conversion Tracker

**Instructions:** After audit, copy each component that needs conversion here.

### Template for Each Component:

#### Component Name: _________
- **Current Status:** ⏳ Not Started | 🔄 In Progress | ✅ Complete
- **Priority:** P0 | P1 | P2
- **Complexity:** Low | Medium | High
- **Effort Estimate:** ___ days
- **Dependencies:** 
  - Pods fields: ___________
  - Post meta: ___________
  - AJAX: ___________
  - Other: ___________

**Conversion Checklist:**
- [ ] PHP template analyzed
- [ ] Data dependencies documented
- [ ] Vue SFC created (`src/vue/components/[name].vue`)
- [ ] Props defined
- [ ] Emits defined
- [ ] Scoped styles added
- [ ] Component registered in registry
- [ ] Unit test created
- [ ] Visual test passed
- [ ] Pods data integration working
- [ ] Component library preview working

**Notes:**
- Issues encountered: ___________
- Improvements made: ___________
- Breaking changes: ___________

---

## 🔍 Per-Component Analysis Template

Use this template to analyze each PHP component before conversion:

### PHP Template Analysis
```php
// File: components/[name]/template.php

Key Elements Found:
□ HTML Structure
□ PHP Logic
□ Pods Data Fetching
□ Conditional Rendering
□ Loops/Iterations
□ AJAX Calls
□ Media Handling
□ Custom Queries
```

### Vue Conversion Strategy
```vue
<!-- File: src/vue/components/[Name].vue -->

<template>
  <!-- HTML structure goes here -->
</template>

<script setup>
// Props required:
// - componentId
// - data
// - settings

// Emits required:
// - update
// - remove

// Composables needed:
// - useMediaKitStore (if accessing global state)
// - usePodsData (if fetching Pods fields)
</script>

<style scoped>
/* Component-specific styles */
</style>
```

### Data Migration Notes
- **Pods Fields Used:** List all Pods fields this component uses
- **Meta Fields Used:** List all post meta fields
- **Data Transformation:** Note any data format changes needed
- **Validation Rules:** Document any validation required

---

## 🚀 Conversion Workflow

For EACH component to convert, follow these steps:

### Step 1: Analyze (30-60 min)
1. Open `components/[name]/template.php`
2. Read through entire template
3. Document:
   - HTML structure
   - Data dependencies (Pods fields, meta)
   - Settings/props used
   - Interactive behaviors
   - Edge cases handled

### Step 2: Plan (15-30 min)
1. Sketch out Vue component structure
2. Define props interface
3. Define emits interface
4. Identify composables needed
5. Plan state management approach

### Step 3: Create Vue SFC (1-4 hours)
1. Create `src/vue/components/[Name].vue`
2. Convert HTML structure to Vue template
3. Implement script setup with props/emits
4. Add scoped styles
5. Handle data fetching (Pods integration)
6. Implement reactive logic
7. Add error handling

### Step 4: Register (15 min)
1. Add to `src/registry/UnifiedComponentRegistry.js`
2. Use lazy loading: `() => import('@/components/[Name].vue')`
3. Verify component type matches PHP version

### Step 5: Test (30-60 min)
1. Create unit test: `src/vue/components/__tests__/[Name].spec.js`
2. Test rendering with mock data
3. Test props validation
4. Test emit events
5. Test Pods data integration
6. Test edge cases

### Step 6: Integration (30 min)
1. Add to component library
2. Test drag-and-drop
3. Test settings panel
4. Test save/load
5. Verify styling in theme

---

## ⚠️ Common Pitfalls to Avoid

Based on the migration plan warnings:

### ❌ DON'T:
1. Copy inefficient old PHP logic blindly
2. Bring over unnecessary jQuery dependencies
3. Use inline styles (use scoped CSS)
4. Forget to handle loading states
5. Skip error handling
6. Hardcode data (use props/composables)
7. Create tightly coupled components

### ✅ DO:
1. Simplify complex conditionals
2. Use Vue reactivity properly
3. Leverage composables for shared logic
4. Add proper TypeScript types (if using TS)
5. Use Tailwind utility classes
6. Follow Vue 3 Composition API patterns
7. Make components self-contained

---

## 📈 Progress Tracking

**Overall Conversion Progress:**

```
Total Components: __ (from audit)
P0 Completed: __ / __
P1 Completed: __ / __
P2 Completed: __ / __

Overall: __ / __ (___%)
```

**Velocity Tracking:**
- Week 1: ___ components completed
- Week 2: ___ components completed
- Week 3: ___ components completed

**Estimated Completion:** Based on velocity

---

## 🎓 Component Conversion Examples

### Example 1: Simple Component (Hero)

**Before (PHP):**
```php
<div class="hero-component">
    <h1><?php echo esc_html($component_data['title']); ?></h1>
    <p><?php echo esc_html($component_data['subtitle']); ?></p>
</div>
```

**After (Vue):**
```vue
<template>
  <div class="hero-component">
    <h1>{{ data.title }}</h1>
    <p>{{ data.subtitle }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  componentId: String,
  data: Object
});
</script>
```

### Example 2: Complex Component (Biography with Pods)

**Before (PHP):**
```php
<?php
$bio = pods('mkcg', get_the_ID())->field('biography');
?>
<div class="biography-component">
    <?php echo wp_kses_post($bio); ?>
</div>
```

**After (Vue):**
```vue
<template>
  <div class="biography-component">
    <div v-html="biographyContent"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePodsData } from '@/composables/usePodsData';

const props = defineProps({
  componentId: String,
  data: Object
});

const { getField } = usePodsData();
const biographyContent = computed(() => 
  getField('biography') || props.data.biography || ''
);
</script>
```

---

## 📝 Notes Section

Use this space for:
- Architectural decisions made during conversion
- Patterns discovered that can be reused
- Issues that need escalation
- Ideas for future improvements

---

**This document will be automatically populated when you run:**
```bash
node scripts/phase1-audit.js
```

The audit will generate a complete inventory with:
- All component names and status
- Complexity ratings
- Effort estimates
- Priority assignments
- Data dependencies

Use that data to populate the checklists above and track your Phase 4 progress.
