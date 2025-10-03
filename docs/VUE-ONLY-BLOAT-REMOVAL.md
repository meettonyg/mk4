# Vue-Only Bloat Removal Plan

## Core Principle
Since the app is now **100% Vue**, we can remove ALL PHP template rendering code. The only PHP needed is:
1. REST API endpoints (data CRUD)
2. Vue app initialization (inject data, mount point)
3. WordPress integration (hooks, post types)

## Files to REMOVE (Archive First)

### 1. PHP Rendering System
```
❌ includes/class-gmkb-frontend-display.php (880 lines)
   - Entire section/component rendering system
   - Theme CSS generation
   - Template loading logic
   - BLOAT: ~35KB

❌ includes/frontend-template-router.php
   - Template routing logic for frontend
   - Now handled by Vue router
   
❌ templates/mediakit-frontend-template.php
   - PHP-based frontend rendering
   - Replaced by Vue SPA
```

### 2. Component PHP Templates
```
❌ components/*/template.php (all of them)
   - biography/template.php
   - hero/template.php
   - topics/template.php
   - etc.
   - BLOAT: ~50KB total
   
These are 100% replaced by:
✓ components/*/Component.vue
✓ components/*/ComponentRenderer.vue
```

### 3. Theme Generation System
```
❌ includes/class-theme-generator.php
   - PHP-based CSS generation
   - Replaced by Vue reactive styling
   
❌ system/ThemeDiscovery.php (if only used for PHP rendering)
```

### 4. Pods Enrichment (MAYBE)
```
⚠️  includes/component-pods-enrichment.php
   - Question: Does Vue fetch Pods data via API?
   - If YES → Remove, use REST API
   - If NO → Keep for server-side enrichment
```

## Files to KEEP

### 1. Vue Entry Points
```
✓ templates/builder-template-vue-pure.php
  - Minimal HTML shell
  - Injects window.gmkbData
  - Mounts Vue app
```

### 2. REST API
```
✓ includes/api/v2/class-gmkb-rest-api-v2.php
  - GET /gmkb/v2/mediakit/{id}
  - POST /gmkb/v2/mediakit/{id}
  - Data layer only
```

### 3. WordPress Integration
```
✓ guestify-media-kit-builder.php (main plugin)
✓ includes/enqueue.php (Vue bundle loading)
✓ includes/debug-rest-endpoint.php (diagnostics)
```

### 4. Component Discovery
```
✓ system/ComponentDiscovery.php
  - Provides component metadata to Vue
  - No rendering, just JSON
```

## Removal Steps

### Step 1: Archive Legacy Code
```bash
# Create dated archive
mkdir -p ARCHIVE/php-rendering-removal-$(date +%Y%m%d)
cd ARCHIVE/php-rendering-removal-$(date +%Y%m%d)

# Archive files
mv ../../includes/class-gmkb-frontend-display.php ./
mv ../../includes/frontend-template-router.php ./
mv ../../templates/mediakit-frontend-template.php ./
mv ../../includes/class-theme-generator.php ./

# Archive all component templates
mkdir -p component-templates
find ../../components -name "template.php" -exec cp {} component-templates/ \;
```

### Step 2: Update Main Plugin File
Remove references to:
- GMKB_Frontend_Display class
- Frontend template router
- Theme generator

### Step 3: Update enqueue.php
Remove CSS enqueuing for:
- Frontend display CSS
- Component CSS (now in Vue)
- Theme CSS (now in Vue)

Keep only:
- Vue bundle loading
- WordPress admin styles (if any)

### Step 4: Clean Component Directories
For each component:
```
REMOVE: template.php, frontend-template.php
KEEP: *.vue files, component.json, schema.json
```

### Step 5: Update REST API
Ensure API returns:
- Component data structure
- Pods-enriched data (if not fetched client-side)
- Theme configuration (if needed)

## New Slim Architecture

```
WordPress Backend (API Only)
├── REST API v2
│   ├── GET /mediakit/{id}  → Returns full state + Pods data
│   └── POST /mediakit/{id} → Saves state
├── Component Discovery
│   └── Returns metadata only (no rendering)
└── Vue Bundle Loader
    └── Enqueues dist/gmkb.iife.js

Vue Frontend (100% Client-Side)
├── Main App (builder-template-vue-pure.php)
│   └── <div id="app"></div> + window.gmkbData
├── Vue Components (*.vue)
│   ├── Component rendering
│   ├── Theme styling
│   └── All UI logic
└── Pinia Stores
    ├── Load data via API
    └── Manage state
```

## File Size Reduction Estimate

Before:
```
class-gmkb-frontend-display.php    ~35KB
component templates (30 files)     ~50KB
frontend-template-router.php       ~10KB
class-theme-generator.php          ~15KB
mediakit-frontend-template.php     ~20KB
────────────────────────────────────────
Total PHP rendering code:          ~130KB
```

After:
```
builder-template-vue-pure.php      ~5KB
class-gmkb-rest-api-v2.php        ~15KB
enqueue.php (slimmed)              ~3KB
────────────────────────────────────────
Total:                             ~23KB

Reduction: ~107KB (82% smaller)
```

## Critical Questions Before Removal

### 1. Frontend Display
**Q**: How do public visitors view published media kits?
**A**: If they visit `/guests/tonyg/`, what should they see?

**Options**:
- A) Vue SPA (requires Vue to render for guests)
- B) Static HTML snapshot (generated on save)
- C) Server-side rendered HTML (keep some PHP)

**If A**: Keep builder-template-vue-pure.php, remove everything else
**If B**: Need to add snapshot generation system
**If C**: Keep frontend-template-router.php but simplify

### 2. Pods Data
**Q**: How does Vue get Pods data?
**A**: 
- Option 1: REST API enriches server-side (keep enrichment.php)
- Option 2: Vue fetches from separate Pods API
- Option 3: Pre-loaded in window.gmkbData

### 3. SEO & Public Pages
**Q**: Do published media kits need to be crawlable by search engines?
**A**: 
- If YES: Need server-side HTML or static snapshots
- If NO: Pure Vue SPA is fine

## Recommended Approach

### For Builder Pages
```
✓ 100% Vue SPA
✓ Load via builder-template-vue-pure.php
✓ Remove all PHP rendering
```

### For Public Display (Guests Posts)
**Hybrid Approach**:
1. Keep minimal frontend template that:
   - Loads Pods data server-side
   - Injects into window.gmkbGuestData
   - Mounts Vue in "display mode"
2. Vue renders in display-only mode (no editor)
3. OR: Generate static HTML snapshot on save

**Pure Vue Approach**:
1. Single Vue app for both builder and display
2. Different routes: `/builder/:id` and `/display/:id`
3. API returns everything
4. Remove ALL PHP rendering

## Implementation Priority

**Phase 1: Archive & Test** (1 hour)
- Archive all PHP rendering code
- Update plugin file to remove references
- Test builder still works
- Rollback if broken

**Phase 2: Clean Components** (1 hour)
- Remove template.php files
- Keep only Vue components
- Verify component library works

**Phase 3: Simplify REST API** (1 hour)
- Ensure all data available via API
- Remove PHP rendering endpoints
- Test save/load cycle

**Phase 4: Frontend Strategy** (TBD)
- Decide: Vue SPA vs Snapshot vs Hybrid
- Implement chosen approach
- Test public display

## Testing Checklist

After removal:
- [ ] Builder loads at `/tools/media-kit/?mkcg_id=32372`
- [ ] Can add/edit/remove components
- [ ] Can save media kit
- [ ] Can load saved media kit
- [ ] Component library shows all components
- [ ] Theme switching works
- [ ] Public display works (if applicable)
- [ ] No PHP errors in logs
- [ ] Vue DevTools shows clean component tree

## Rollback Plan

If issues after removal:
```bash
# Restore archived files
cp ARCHIVE/php-rendering-removal-DATE/* includes/
cp ARCHIVE/php-rendering-removal-DATE/component-templates/* components/*/

# Restore git commit
git reset --hard HEAD~1
```

## Final Notes

**Conservative Approach**: Archive first, delete later
**Aggressive Approach**: Delete immediately, keep git history

**Question for Product Owner**: What's the strategy for public guest pages?
- A) Visitors see Vue-rendered page (like builder)?
- B) Visitors see static HTML snapshot?
- C) No public display, guests share builder link?

Answer determines how much PHP we can remove.
