# Quick Reference: Component Auto-Discovery

**100% auto-discovery achieved ✅** - No manual registrations needed!

---

## 🎯 Adding a New Component (3 Steps)

### 1. Create Directory Structure
```
components/your-component/
├── component.json          ← Required
├── YourComponentRenderer.vue  ← Required
└── YourComponentEditor.vue    ← Optional
```

### 2. Create component.json
```json
{
  "name": "Your Component",
  "type": "your-component",
  "category": "content",
  "icon": "fa-solid fa-cube",
  "aliases": ["alias1", "alias2"],
  "defaultProps": {
    "prop1": "default value"
  }
}
```

### 3. Done! 🎉
No code changes needed. System auto-discovers everything.

---

## 📋 Required Fields Only

```json
{
  "name": "Component Name",
  "type": "directory-name",
  "category": "content"
}
```

That's it! Everything else is optional and auto-discovered.

---

## 🔍 What Gets Auto-Discovered

| Feature | Before Fix | After Fix |
|---------|-----------|-----------|
| **Renderer** | Manual import | `import.meta.glob` |
| **Editor** | Manual import | `import.meta.glob` |
| **Default Props** | Hardcoded in JS | From `component.json` |
| **Aliases** | Hardcoded in PHP | From `component.json` |
| **Schema** | Manual load | Auto-loaded |
| **Icons** | Hardcoded | From `component.json` |

---

## 🎨 Available Categories

- `content` - Text and content
- `media` - Images, videos, galleries
- `social` - Social media
- `contact` - Contact info
- `engagement` - CTAs, forms
- `branding` - Logos, brand elements

---

## 🎭 Icon Examples

```json
"icon": "fa-solid fa-user"          // Biography
"icon": "fa-solid fa-envelope"      // Contact
"icon": "fa-brands fa-twitter"      // Social
"icon": "fa-solid fa-image"         // Media
"icon": "fa-solid fa-bullhorn"      // CTA
```

Browse all: https://fontawesome.com/icons

---

## 🔗 Aliases Usage

```json
{
  "type": "biography",
  "aliases": ["bio", "about", "profile"]
}
```

All these now work automatically:
```php
$discovery->getComponentByType('biography');
$discovery->getComponentByType('bio');
$discovery->getComponentByType('about');
```

---

## 🏗️ Default Props Priority

1. ✅ `defaultProps` in component.json (use this)
2. ↓ `schema.defaults` if no defaultProps
3. ↓ `schema.properties[].default` if no defaults
4. ↓ `{}` empty object fallback

---

## 🧪 Testing

```javascript
// Browser console:
window.gmkbComponentRegistry.get('your-component')
window.gmkbComponentRegistry.getDefaultProps('your-component')
```

```php
// PHP:
gmkb_clear_component_cache();
$discovery->getComponent('your-component');
```

---

## ❌ Common Mistakes

1. **Wrong type value**
   ```json
   // ❌ Wrong (doesn't match directory)
   { "type": "Bio", "directory": "biography" }
   
   // ✅ Correct (matches directory name)
   { "type": "biography" }
   ```

2. **Missing required fields**
   ```json
   // ❌ Missing category
   { "name": "Bio", "type": "biography" }
   
   // ✅ Complete minimum
   { "name": "Bio", "type": "biography", "category": "content" }
   ```

3. **Incorrect icon syntax**
   ```json
   // ❌ Wrong
   "icon": "user"
   
   // ✅ Correct
   "icon": "fa-solid fa-user"
   ```

---

## 📁 Files You DON'T Need to Edit

- ❌ `UnifiedComponentRegistry.js` (default props auto-discovered)
- ❌ `ComponentDiscovery.php` (aliases auto-discovered)
- ❌ `ComponentEditor.vue` (editors auto-discovered)
- ❌ Any core system files

**Just edit your component's own files!** 🎉

---

## 🚀 Performance

- Component discovery cached for 1 hour
- Clear cache: `gmkb_clear_component_cache()`
- Auto-clears on:
  - Plugin activation
  - Theme switch
  - Manual refresh

---

## 📚 Full Documentation

- **Complete Template:** `components/COMPONENT-JSON-TEMPLATE.md`
- **Architecture Details:** `COMPONENT-AUTO-DISCOVERY-FIXES-COMPLETE.md`
- **Audit Report:** `SELF-CONTAINED-ARCHITECTURE-AUDIT.md`

---

## ✅ Checklist for New Components

- [ ] Directory created in `components/`
- [ ] `component.json` with required fields
- [ ] `*Renderer.vue` component created
- [ ] Optional: `*Editor.vue` for custom editor
- [ ] Optional: `schema.json` for validation
- [ ] Test: Component appears in library
- [ ] Test: Default props work
- [ ] Test: Aliases resolve correctly

---

**Architecture Version:** 2.0 (Full Auto-Discovery)  
**Last Updated:** October 31, 2025
