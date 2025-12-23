# AI Tools Design Fix - Phased Implementation Plan

## Executive Summary

The Vue AI tools in `/src/vue/components/ai/` need to be redesigned to match the legacy PHP templates in `/_legacy/aigen/media-kit-content-generator/templates/generators/`.

### Current State vs Target State

| Aspect | Current (Vue) | Target (Legacy) |
|--------|--------------|-----------------|
| **CSS System** | `.gmkb-ai-*` classes | `.generator__*` BEM classes |
| **Layout** | Single-panel compact widget | Two-panel (form + guidance) |
| **Header** | `h3` title + description | `h1.generator__title` + `p.generator__subtitle` |
| **Max Width** | 640px | 1200px |
| **Design Tokens** | `--gmkb-ai-*` | `--mkcg-*` |

---

## Phase 1: Create Unified Layout Component

**Goal:** Create a new shared Vue component that implements the legacy two-panel layout.

### Files to Create:
- `/src/vue/components/ai-tools/_shared/GeneratorLayout.vue` - New two-panel layout component
- `/src/styles/generator-unified.css` - Port of legacy CSS with Vue scoping

### Key Features:
```vue
<GeneratorLayout
  title="Professional Biography Generator"
  subtitle="Create compelling professional biographies in multiple lengths using AI"
  generator-type="biography"
>
  <!-- Left Panel Content (Form) -->
  <template #left>
    <IntroText>...</IntroText>
    <AuthorityHookSection />
    <FormFields />
    <GenerateButton />
  </template>

  <!-- Right Panel Content (Guidance) -->
  <template #right>
    <GuidancePanel />
  </template>

  <!-- Results (below panels) -->
  <template #results>
    <ResultsDisplay />
  </template>
</GeneratorLayout>
```

---

## Phase 2: Port CSS Design System

**Goal:** Port the legacy `mkcg-unified-styles.css` to work with Vue components.

### CSS Variables to Port:
```css
:root {
  /* Brand Colors */
  --mkcg-primary: #1a9bdc;
  --mkcg-secondary: #f87f34;

  /* Spacing System (8px base) */
  --mkcg-space-xs: 8px;
  --mkcg-space-sm: 12px;
  --mkcg-space-md: 20px;
  --mkcg-space-lg: 30px;
  --mkcg-space-xl: 40px;

  /* Typography */
  --mkcg-font-size-xxl: 32px;  /* h1 title */
  --mkcg-font-size-lg: 18px;   /* subtitle */
}
```

### Key Classes to Implement:
- `.generator__container` - Main wrapper (max-width: 1200px)
- `.generator__header` - Centered header with title + subtitle
- `.generator__content` - Flexbox two-panel layout
- `.generator__panel--left` - Form panel
- `.generator__panel--right` - Guidance panel (gray background)
- `.generator__authority-hook` - Authority Hook component styling
- `.generator__button` variants (primary, secondary, outline, call-to-action)

---

## Phase 3: Create Shared Sub-Components

**Goal:** Create reusable Vue components for common UI elements.

### Components to Create:

1. **AuthorityHookSection.vue**
   - Displays authority hook text
   - "Edit Authority Hook" toggle button
   - Expandable builder form

2. **ImpactIntroSection.vue**
   - Similar to AuthorityHook but for Impact Intro
   - WHERE + WHY components

3. **GuidancePanel.vue**
   - Right panel guidance content
   - Formula boxes, process steps, example cards

4. **GeneratorIntro.vue**
   - Introduction paragraph for each generator

---

## Phase 4: Update Core Generators

**Priority generators to update first:**

### 4.1 BiographyGenerator.vue
- Current: Uses `AiWidgetFrame` wrapper
- Target: Use new `GeneratorLayout` with two-panel design
- Add: Authority Hook section, Impact Intro section
- Add: Right panel guidance content

### 4.2 TopicsGenerator.vue
- Add: Two-panel layout
- Add: Authority Hook section
- Add: Guidance panel with topic creation tips

### 4.3 QuestionsGenerator.vue
- Add: Two-panel layout
- Add: Topic selector in left panel
- Add: Question crafting guidance in right panel

---

## Phase 5: Update Remaining Generators

### Generators to Update:
1. `OffersGenerator.vue`
2. `TaglineGenerator.vue`
3. `GuestIntroGenerator.vue`
4. `ElevatorPitchGenerator.vue`
5. `SoundBiteGenerator.vue`
6. `PersonaGenerator.vue`
7. `BrandStoryGenerator.vue`
8. `SignatureStoryGenerator.vue`
9. `CredibilityStoryGenerator.vue`
10. `FrameworkGenerator.vue`
11. `InterviewPrepGenerator.vue`
12. `BlogGenerator.vue`
13. `ContentRepurposerGenerator.vue`
14. `PressReleaseGenerator.vue`
15. `SocialPostGenerator.vue`
16. `EmailWriterGenerator.vue`
17. `NewsletterGenerator.vue`
18. `YoutubeDescriptionGenerator.vue`
19. `PodcastNotesGenerator.vue`
20. `SeoOptimizerGenerator.vue`

---

## Phase 6: Testing & Verification

### Checklist:
- [ ] All generators have consistent two-panel layout
- [ ] Header has h1 title + subtitle
- [ ] Authority Hook section displays correctly
- [ ] Guidance panels have proper styling
- [ ] Responsive design works on mobile (stacks panels)
- [ ] Dark mode support maintained
- [ ] Build process completes without errors
- [ ] All 25 tools visually match legacy design

---

## File Structure After Completion

```
/src/vue/components/ai/
├── _shared/
│   ├── AiWidgetFrame.vue        # DEPRECATED - keep for backward compat
│   ├── GeneratorLayout.vue      # NEW - Two-panel layout
│   ├── AuthorityHookSection.vue # NEW - Authority Hook component
│   ├── ImpactIntroSection.vue   # NEW - Impact Intro component
│   ├── GuidancePanel.vue        # NEW - Right panel guidance
│   └── index.js
├── BiographyGenerator.vue       # UPDATED - Uses GeneratorLayout
├── TopicsGenerator.vue          # UPDATED
├── QuestionsGenerator.vue       # UPDATED
├── ...
└── index.js

/src/styles/
├── ai-standalone.css            # DEPRECATED
├── ai-shared.css                # DEPRECATED
├── generator-unified.css        # NEW - Ported from legacy
└── generator-variables.css      # NEW - Design tokens
```

---

## Estimated Effort

| Phase | Complexity | Files Changed |
|-------|-----------|---------------|
| Phase 1 | High | 2 new files |
| Phase 2 | Medium | 2 new files |
| Phase 3 | Medium | 4 new files |
| Phase 4 | High | 3 updated files |
| Phase 5 | High | 20 updated files |
| Phase 6 | Low | Testing only |

---

## Decision Points (Need User Input)

1. **Backward Compatibility**: Should we keep `AiWidgetFrame.vue` or fully replace it?
2. **CSS Strategy**: Import legacy CSS directly or create Vue-scoped version?
3. **Standalone Mode**: Should standalone (public) tools use same design or stay compact?
4. **Right Panel Content**: Port existing guidance or create new content?

---

## Recommended Next Step

Start with **Phase 1**: Create the `GeneratorLayout.vue` component by studying the legacy Biography Generator structure and implementing the two-panel layout in Vue.
