# Media Kit Builder - Theme CSS Variable Audit & Fix Plan

## ✅ Phase 1: Core Theme System Status - COMPLETE
- ✅ ThemeProvider.vue created and working
- ✅ Theme store (theme.js) with mergedTheme getter fixed
- ✅ ThemeProvider integrated into MediaKitAppComplete.vue
- ✅ CSS variable documentation complete

## 🔍 Component CSS Variable Audit

### ✅ COMPLETE - Using CSS Variables Correctly
1. **hero/HeroRenderer.vue** - ✅ Fully migrated
2. **biography/BiographyRenderer.vue** - ✅ Fully migrated
3. **topics/TopicsRenderer.vue** - ✅ Fully migrated (FIXED)
4. **contact/ContactRenderer.vue** - ✅ Fully migrated (FIXED)
5. **social/SocialRenderer.vue** - ✅ Fully migrated (FIXED)
6. **testimonials/TestimonialsRenderer.vue** - ✅ Fully migrated (FIXED)

### ❌ NEEDS FULL MIGRATION - Components to Update
7. **call-to-action/CallToActionRenderer.vue**
8. **questions/QuestionsRenderer.vue**
9. **stats/StatsRenderer.vue**
10. **video-intro/VideoIntroRenderer.vue**
11. **photo-gallery/PhotoGalleryRenderer.vue**
12. **podcast-player/PodcastPlayerRenderer.vue**
13. **booking-calendar/BookingCalendarRenderer.vue**
14. **authority-hook/AuthorityHookRenderer.vue**
15. **guest-intro/GuestIntroRenderer.vue**
16. **logo-grid/LogoGridRenderer.vue**

## 📋 Implementation Checklist

### Quick Fixes (5 minutes each)
- [ ] Fix topics component padding/transitions
- [ ] Fix contact component spacing/fonts
- [ ] Fix social component padding/transitions

### Full Migrations (15 minutes each)
- [ ] Migrate testimonials component
- [ ] Migrate call-to-action component
- [ ] Migrate questions component
- [ ] Migrate stats component
- [ ] Migrate video-intro component
- [ ] Migrate photo-gallery component
- [ ] Migrate podcast-player component
- [ ] Migrate booking-calendar component
- [ ] Migrate authority-hook component
- [ ] Migrate guest-intro component
- [ ] Migrate logo-grid component

## 🎨 CSS Variable Replacement Guide

### Common Replacements
```css
/* Colors */
#333, #1e293b → var(--gmkb-color-text, #1e293b)
#666, #64748b → var(--gmkb-color-text-light, #64748b)
#fff, #ffffff → var(--gmkb-color-surface, #ffffff)
#f8f9fa → var(--gmkb-color-background, #f8f9fa)
#007cba, #3b82f6 → var(--gmkb-color-primary, #3b82f6)
#ddd, #e2e8f0 → var(--gmkb-color-border, #e2e8f0)

/* Spacing */
0.25rem → var(--gmkb-space-1, 0.25rem)
0.5rem → var(--gmkb-space-2, 0.5rem)
0.75rem → var(--gmkb-space-3, 0.75rem)
1rem → var(--gmkb-spacing-md, 1rem)
1.5rem → var(--gmkb-spacing-lg, 1.5rem)
2rem → var(--gmkb-spacing-xl, 2rem)
3rem → var(--gmkb-spacing-2xl, 3rem)
4rem → var(--gmkb-spacing-3xl, 4rem)

/* Typography */
font-size: 1rem → font-size: var(--gmkb-font-size-base, 1rem)
font-size: 1.25rem → font-size: var(--gmkb-font-size-lg, 1.25rem)
font-size: 1.5rem → font-size: var(--gmkb-font-size-xl, 1.5rem)
font-size: 2rem → font-size: var(--gmkb-font-size-2xl, 2rem)
line-height: 1.6 → line-height: var(--gmkb-line-height-base, 1.6)

/* Effects */
border-radius: 4px → border-radius: var(--gmkb-border-radius-sm, 4px)
border-radius: 8px → border-radius: var(--gmkb-border-radius, 8px)
box-shadow: 0 2px 4px rgba(0,0,0,0.1) → box-shadow: var(--gmkb-shadow-sm)
transition: all 0.3s ease → transition: var(--gmkb-transition)
```

## 🔧 Root Cause Issues Fixed
1. ✅ ThemeProvider now handles store not ready
2. ✅ Theme store mergedTheme getter circular dependency fixed
3. ✅ Default theme fallback implemented
4. ✅ CSS variable generation with proper naming

## 📊 Current Status Summary
- **Complete**: 6/16 components (37.5%)
- **Needs Migration**: 10/16 components (62.5%)

## 🚀 Next Steps
1. Fix the 3 partial components (quick fixes)
2. Migrate remaining 11 components systematically
3. Test all components with all 4 themes
4. Clean up any console.log statements
5. Update theme customizer UI if needed
