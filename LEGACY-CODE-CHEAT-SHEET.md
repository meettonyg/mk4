# 🚨 Legacy Code Pattern Quick Reference

## ONE-PAGE CHEAT SHEET - Print or Keep Open

---

## 🔴 CRITICAL VIOLATIONS (Fix Immediately)

### 1. Hardcoded Component Maps
```javascript
❌ const componentMap = { 'type': import('...') }
✅ UnifiedComponentRegistry.getVueComponent(type)
```

### 2. Polling Patterns
```javascript
❌ setTimeout(checkReady, 100)
❌ setInterval(poll, 50)
✅ document.addEventListener('event', handler)
✅ store.$subscribe((m, s) => ...)
```

### 3. Global Object Sniffing
```javascript
❌ if (window.gmkbRegistry) { ... }
❌ while (!window.manager) { ... }
✅ import Registry from '@/services/...'
```

---

## 🟡 MEDIUM PRIORITY (Fix This Sprint)

### 4. Duplicate Service Logic
```javascript
❌ fetch('/wp-json/...')
✅ APIService.get(...)

❌ document.createElement('style')
✅ ComponentStyleService.generate(...)
```

### 5. Hardcoded Field Mappings
```javascript
❌ const bio = pods.guestify_biography
❌ const fieldMap = { bio: 'guestify_...' }
✅ const { biography } = usePodsData()
```

### 6. Deprecated Patterns
```javascript
❌ $.ajax({ ... })
✅ await APIService.get(...)

❌ EventBus.$emit('event')
✅ store.dispatch('action')

❌ this.$root.method()
✅ provide/inject or props
```

---

## 🔵 LOW PRIORITY (Fix During Refactor)

### 7. Direct Store Mutations
```javascript
❌ store.data.title = 'New'
✅ store.updateData({ title: 'New' })
```

### 8. Missing Null Safety
```javascript
❌ component.data.title.toUpperCase()
✅ component?.data?.title?.toUpperCase() ?? ''
```

---

## 🔍 SEARCH PATTERNS (VS Code Regex)

```
componentMap\s*=                    # Hardcoded maps
setTimeout.*(retry|wait|check)      # Polling
if.*window\.(gmkb|guestify)        # Global sniffing
\$\.ajax|\$\.get                    # jQuery
EventBus\.\$                        # EventBus
fieldMapping\s*=                    # Field maps
this\.\$root|this\.\$parent        # Vue 2 patterns
```

---

## 🛠️ TOOLS

```powershell
.\FIND-LEGACY-CODE.ps1    # Full scan
.\QUICK-SEARCH.ps1        # Interactive search
.\BUILD.ps1               # Build project
.\VERIFY-COMPONENTS.ps1   # Check structure
```

---

## ✅ SERVICES TO USE (Not Duplicate)

```
APIService              → All WP REST API calls
ComponentStyleService   → CSS generation
ThemeStyleInjector     → Theme application
SecurityService        → XSS protection
EnhancedErrorHandler   → Error logging
```

---

## 📋 COMPOSABLES TO USE

```
usePodsData()          → Access Pods fields
useMediaKitStore()     → State management
useCleanup()           → Event cleanup
```

---

## 🎯 QUICK REVIEW CHECKLIST

Before committing code, ask:

□ No hardcoded component maps?
□ No polling with setTimeout/setInterval?
□ No checking window.* for existence?
□ Using existing services?
□ No hardcoded field names?
□ No jQuery/EventBus/Vue 2 patterns?
□ Proper null safety?
□ Event-driven, not polling?

---

## 🆘 IF YOU FIND A VIOLATION

1. **Understand WHY it's bad** (check MANUAL-REVIEW-CHECKLIST.md)
2. **Find the root cause** (not just the symptom)
3. **Fix the architecture** (not patch the symptom)
4. **Search for similar patterns** (fix all at once)
5. **Test thoroughly** (npm run build + browser test)
6. **Document the fix** (comment + update docs)

---

## 💡 REMEMBER

- **Single Source of Truth** - component.json for all config
- **Event-Driven** - No polling, use events
- **Services** - Don't duplicate logic
- **Root Cause** - Fix architecture, not symptoms

---

## 📚 FULL DOCS

- `LEGACY-CODE-DETECTION-README.md` - Complete guide
- `MANUAL-REVIEW-CHECKLIST.md` - Detailed patterns + fixes
- `ROOT_CAUSE_FIX_SUMMARY.md` - Example architectural fix
- `Post-Update Developer Checklist` - Must follow

---

**Print this page and keep it visible while coding!**
