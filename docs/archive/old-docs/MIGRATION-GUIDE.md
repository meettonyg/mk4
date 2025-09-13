# Media Kit Builder - Migration Guide
## From Legacy (60+ files) to Lean Architecture (1 file)

## Pre-Migration Checklist

### 1. Backup Current State
```bash
# Backup database
wp db export backup-before-lean.sql

# Backup plugin files
cp -r mk4/ mk4-backup/
```

### 2. Verify Current System Status
- [ ] Current media kits are working
- [ ] No critical errors in console
- [ ] Save/load functionality works
- [ ] Document any custom modifications

## Migration Steps

### Step 1: Install Build Tools
```bash
cd /path/to/mk4/
npm install
```

### Step 2: Build the Lean Bundle
```bash
npm run build
```

Verify output:
- Check that `dist/gmkb.js` exists
- File should be ~100KB
- No build errors

### Step 3: Enable Feature Flag (Testing Mode)

#### Option A: Via Admin UI
1. Go to WordPress Admin → Settings → Media Kit Builder
2. Check "Use Lean Bundle Architecture"
3. Save Changes

#### Option B: Via Database
```sql
INSERT INTO wp_options (option_name, option_value, autoload) 
VALUES ('gmkb_use_lean_bundle', '1', 'yes')
ON DUPLICATE KEY UPDATE option_value = '1';
```

#### Option C: Via WP-CLI
```bash
wp option update gmkb_use_lean_bundle 1
```

### Step 4: Test in Staging Environment

#### Basic Tests
1. **Load Builder Page**
   - Should load in <1 second
   - Check console for: "🚀 GMKB: Using LEAN BUNDLE architecture"
   - No red errors in console

2. **Component Operations**
   ```javascript
   // Test in console
   GMKB.addComponent('hero');
   GMKB.addComponent('biography');
   GMKB.getState(); // Should show 2 components
   ```

3. **Save/Load Test**
   - Add components
   - Click Save
   - Refresh page
   - Components should persist

4. **Theme Test**
   - Switch themes
   - Changes should apply immediately
   - Theme should persist after save

### Step 5: Performance Validation

#### Check Network Tab
- **Legacy**: 60+ JavaScript requests
- **Lean**: 1 JavaScript request (gmkb.js)

#### Check Load Time
```javascript
// Measure in console
performance.mark('start');
location.reload();
// After load:
performance.measure('loadTime', 'start');
performance.getEntriesByName('loadTime')[0].duration;
```

Target: <1000ms

### Step 6: Rollback Plan (If Needed)

#### Quick Rollback
```bash
# Via Admin UI
WordPress Admin → Settings → Media Kit Builder → Uncheck "Use Lean Bundle"

# Via Database
wp option update gmkb_use_lean_bundle 0

# Via SQL
UPDATE wp_options SET option_value = '0' WHERE option_name = 'gmkb_use_lean_bundle';
```

## Data Migration Considerations

### State Format Changes
The lean architecture maintains backward compatibility with saved states:

#### Old Format (Still Supported)
```javascript
{
  components: { /* object format */ },
  layout: [...],
  globalSettings: {...}
}
```

#### New Format (Optimized)
```javascript
{
  components: { /* same object format */ },
  sections: [...], // New: section support
  theme: 'default', // New: theme selection
  globalSettings: {...}
}
```

### No Data Migration Required
- Old media kits work without modification
- New fields are added automatically
- Backward compatible save/load

## Monitoring After Migration

### Key Metrics to Track

1. **Performance Metrics**
   ```javascript
   // Add to site footer for monitoring
   window.addEventListener('load', () => {
     if (window.GMKB) {
       console.log('GMKB Performance:', {
         loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
         bundleLoaded: !!window.GMKB,
         version: window.GMKB.version,
         componentCount: Object.keys(GMKB.getState().components || {}).length
       });
     }
   });
   ```

2. **Error Tracking**
   ```javascript
   window.addEventListener('error', (e) => {
     if (e.filename && e.filename.includes('gmkb.js')) {
       console.error('GMKB Bundle Error:', e);
       // Send to error tracking service
     }
   });
   ```

3. **User Feedback**
   - Monitor support tickets
   - Check for performance complaints
   - Track save/load success rate

## Common Migration Issues & Solutions

### Issue 1: Bundle Not Loading
**Symptom**: Old system loads instead of lean bundle

**Solution**:
```bash
# Rebuild bundle
npm run build

# Clear WordPress cache
wp cache flush

# Clear browser cache
Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Issue 2: Components Not Found
**Symptom**: "Component type not found" errors

**Solution**:
```javascript
// Check registered components
console.log(Object.keys(ComponentRegistry));

// Re-scan components
await loadComponentRenderers();
```

### Issue 3: Save Failing
**Symptom**: Save button doesn't work

**Solution**:
```javascript
// Check WordPress data
console.log(window.gmkbData);

// Verify nonce
console.log(gmkbData.nonce);

// Test AJAX
GMKB.apiService.save(GMKB.getState());
```

### Issue 4: Theme Not Applied
**Symptom**: Theme changes don't stick

**Solution**:
```javascript
// Check current theme
GMKB.getState().theme;

// Manually set theme
GMKB.stateManager.dispatch({ 
  type: 'SET_THEME', 
  payload: 'professional_clean' 
});
```

## Post-Migration Optimization

### 1. Remove Legacy Code (After 30 Days)
```bash
# Archive old JavaScript files
mkdir js/archived-legacy
mv js/*.js js/archived-legacy/

# Keep only essential files
git rm js/archived-legacy/*
git commit -m "Remove legacy JavaScript files after successful lean migration"
```

### 2. Database Cleanup
```sql
-- Remove old transients
DELETE FROM wp_options WHERE option_name LIKE '%gmkb_cache%';

-- Optimize media kit meta
DELETE FROM wp_postmeta 
WHERE meta_key = 'gmkb_media_kit_state' 
AND post_id NOT IN (SELECT ID FROM wp_posts);
```

### 3. Update Documentation
- Update user guides
- Update developer documentation
- Remove references to old architecture

## Success Criteria

### Technical Success
- [ ] Page load time <1 second
- [ ] Bundle size <150KB
- [ ] No console errors
- [ ] All features working

### User Success
- [ ] No user complaints
- [ ] Improved performance feedback
- [ ] Successful saves/loads
- [ ] Happy users!

## Support During Migration

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('gmkb_debug', 'true');

// View debug info
GMKB.stateManager.getState();
GMKB.eventBus.events;
```

### Health Check
```javascript
// Run health check
function gmkbHealthCheck() {
  const checks = {
    bundleLoaded: !!window.GMKB,
    stateManager: !!GMKB?.stateManager,
    eventBus: !!GMKB?.eventBus,
    renderer: !!GMKB?.renderer,
    apiService: !!GMKB?.apiService,
    version: GMKB?.version,
    componentCount: Object.keys(GMKB?.getState?.()?.components || {}).length
  };
  
  console.table(checks);
  return Object.values(checks).every(check => check !== false);
}

gmkbHealthCheck();
```

## Timeline Recommendation

### Week 1: Development Environment
- Enable lean bundle in dev
- Run all tests
- Fix any issues

### Week 2: Staging Environment
- Deploy to staging
- User acceptance testing
- Performance testing

### Week 3: Production (Soft Launch)
- Enable for admin users only
- Monitor closely
- Gather feedback

### Week 4: Full Production
- Enable for all users
- Monitor metrics
- Prepare to remove legacy code

### Week 8: Cleanup
- Remove legacy code
- Update all documentation
- Celebrate! 🎉

---

**Status**: Ready for Migration
**Risk Level**: Low (feature flag allows instant rollback)
**Expected Improvement**: 75% faster, 80% smaller
