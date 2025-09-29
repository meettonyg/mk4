# Archived Vue Legacy Files

## Archive Date
December 19, 2024

## Reason for Archiving
These files were archived because they:
1. **Are duplicates of self-contained components** in components/ folder
2. **Use old architecture patterns** (not self-contained)
3. **Contain legacy bridge/adapter code**
4. **Are superseded by new implementations**

## Architecture Decision
We are using the **self-contained component architecture** where:
- Each component lives in its own folder under `components/`
- Components are self-contained with their own Vue, styles, scripts, pods-config.json
- No separate library folder for Vue components
- Composables live in `src/composables` (not `src/vue/composables`)

## Files to Archive

### 1. Duplicate Component Files
**Location**: `src/vue/components/library/`
- `Contact.vue` → Duplicate of `components/contact/ContactRenderer.vue`
- `LogoGrid.vue` → Duplicate of `components/logo-grid/LogoGridRenderer.vue`
- `Social.vue` → Duplicate of `components/social/SocialRenderer.vue`
- `Stats.vue` → Duplicate of `components/stats/StatsRenderer.vue`

### 2. Duplicate Composables
**Location**: `src/vue/composables/`
- `usePodsData.js` → Duplicate of `src/composables/usePodsData.js`

### 3. Legacy Files
- `src/vue/VueComponentBridge.js` → Legacy bridge pattern
- `src/vue/discovery/` → Old discovery pattern
- Various old component files in `src/vue/components/`
