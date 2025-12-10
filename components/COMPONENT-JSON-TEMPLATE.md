# Component.json Template & Best Practices

This template shows the complete structure for a self-contained component in the Guestify Media Kit Builder. After the recent architecture fixes, ALL component metadata should be defined here - no hardcoded registrations needed!

---

## 📄 Complete component.json Template

```json
{
  "name": "Component Display Name",
  "type": "component-directory-name",
  "title": "Component Title for UI",
  "description": "Brief description of what this component does",
  "category": "content",
  "icon": "fa-solid fa-cube",
  "order": 100,
  "isPremium": false,
  
  "aliases": [
    "short-name",
    "alternative-name"
  ],
  
  "defaultProps": {
    "propertyName": "default value",
    "anotherProperty": true,
    "numericProperty": 0
  },
  
  "dependencies": [],
  
  "schema": {
    "type": "object",
    "defaults": {
      "propertyName": "default value"
    },
    "properties": {
      "propertyName": {
        "type": "string",
        "default": "default value",
        "description": "Property description"
      }
    }
  }
}
```

---

## 🔑 Field Definitions

### Required Fields

#### `name` (string, required)
Display name shown in the component library and UI.
```json
"name": "Biography"
```

#### `type` (string, required)
Component type identifier. Should match the directory name.
```json
"type": "biography"
```

#### `category` (string, required)
Component category for organization. Available categories:
- `content` - Text and content components
- `media` - Images, videos, galleries
- `social` - Social media links and integrations
- `contact` - Contact information components
- `engagement` - CTAs, forms, interactions
- `branding` - Logos, brand elements

```json
"category": "content"
```

---

### Optional Fields

#### `title` (string, optional)
Alternative title for the component. Falls back to `name` if not provided.
```json
"title": "Professional Biography Section"
```

#### `description` (string, optional)
Longer description explaining the component's purpose and features.
```json
"description": "Display your professional biography with optional photo and formatting options"
```

#### `icon` (string, optional)
Font Awesome icon class. Defaults to `fa-solid fa-cube` if not provided.
```json
"icon": "fa-solid fa-user"
```

**Available Icons:**
- Content: `fa-solid fa-align-left`, `fa-solid fa-file-text`
- Media: `fa-solid fa-image`, `fa-solid fa-video`, `fa-solid fa-camera`
- Social: `fa-brands fa-twitter`, `fa-brands fa-linkedin`
- Contact: `fa-solid fa-envelope`, `fa-solid fa-phone`
- Engagement: `fa-solid fa-bullhorn`, `fa-solid fa-hand-pointer`

#### `order` (number, optional)
Sort order within category (lower numbers appear first). Defaults to 999.
```json
"order": 20
```

#### `isPremium` (boolean, optional)
Whether this is a premium/pro feature. Defaults to `false`.
```json
"isPremium": false
```

---

### ✨ NEW: Auto-Discovery Fields

#### `aliases` (array, optional) - NEW! 🎉
Alternative names that can be used to reference this component. Automatically registered in PHP discovery system.

**Before the fix:** Had to manually update `ComponentDiscovery.php`  
**After the fix:** Just add them here!

```json
"aliases": [
  "bio",           // Short version
  "about",         // Common alternative
  "profile"        // Another alternative
]
```

**Usage:**
```php
// All of these now work automatically:
$component = $discovery->getComponentByType('biography');
$component = $discovery->getComponentByType('bio');
$component = $discovery->getComponentByType('about');
$component = $discovery->getComponentByType('profile');
```

#### `defaultProps` (object, optional) - AUTO-DISCOVERED! 🎉
Default values for component properties. Automatically used by UnifiedComponentRegistry.

**Before the fix:** Had to manually update `UnifiedComponentRegistry.js`  
**After the fix:** Just define them here!

```json
"defaultProps": {
  "biography": "Your professional biography...",
  "showPhoto": true,
  "photoPosition": "left",
  "fontSize": "medium",
  "textColor": "#333333"
}
```

**Priority System:**
1. `defaultProps` in component.json (highest priority)
2. `schema.defaults` in schema.json
3. `schema.properties[].default` values
4. Empty object (safe fallback)

---

### Advanced Fields

#### `dependencies` (array, optional)
List other components or plugins this component requires.
```json
"dependencies": [
  "profile-photo",
  "social-links"
]
```

#### `schema` (object, optional)
JSON schema for component data validation. Can also be in separate `schema.json` file.

```json
"schema": {
  "type": "object",
  "defaults": {
    "biography": "",
    "showPhoto": true
  },
  "properties": {
    "biography": {
      "type": "string",
      "default": "",
      "description": "Biography text content"
    },
    "showPhoto": {
      "type": "boolean",
      "default": true,
      "description": "Whether to display profile photo"
    },
    "photoPosition": {
      "type": "string",
      "enum": ["left", "right", "top"],
      "default": "left",
      "description": "Position of the photo"
    }
  },
  "required": ["biography"]
}
```

---

## 📁 Component Directory Structure

Complete self-contained component with all files:

```
components/
└── biography/
    ├── component.json          ← Main metadata (required)
    ├── BiographyRenderer.vue   ← Display component (required)
    ├── BiographyEditor.vue     ← Edit panel (optional)
    ├── schema.json             ← Data schema (optional, can be in component.json)
    ├── pods-config.json        ← Pods field requirements (if using Pods)
    ├── styles.css              ← Component-specific styles (optional)
    └── README.md               ← Documentation (optional)
```

---

## 🎯 Real-World Examples

### Example 1: Simple Content Component

```json
{
  "name": "Call to Action",
  "type": "call-to-action",
  "category": "engagement",
  "icon": "fa-solid fa-bullhorn",
  "order": 50,
  
  "aliases": ["cta", "button"],
  
  "defaultProps": {
    "title": "Get Started",
    "buttonText": "Contact Me",
    "buttonUrl": "#contact",
    "backgroundColor": "#3b82f6"
  }
}
```

### Example 2: Media Component with Schema

```json
{
  "name": "Photo Gallery",
  "type": "photo-gallery",
  "description": "Display a grid of images with lightbox functionality",
  "category": "media",
  "icon": "fa-solid fa-images",
  "order": 60,
  "isPremium": true,
  
  "aliases": ["gallery", "photos", "images"],
  
  "defaultProps": {
    "images": [],
    "columns": 3,
    "spacing": "medium",
    "lightbox": true
  },
  
  "schema": {
    "type": "object",
    "properties": {
      "images": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "url": { "type": "string" },
            "caption": { "type": "string" }
          }
        },
        "default": []
      },
      "columns": {
        "type": "integer",
        "minimum": 1,
        "maximum": 6,
        "default": 3
      }
    }
  }
}
```

### Example 3: Social Integration Component

```json
{
  "name": "Social Links",
  "type": "social",
  "title": "Social Media Links",
  "description": "Display links to your social media profiles",
  "category": "social",
  "icon": "fa-solid fa-share-nodes",
  "order": 30,
  
  "aliases": [
    "social-links",
    "social-media",
    "socials"
  ],
  
  "defaultProps": {
    "links": [],
    "style": "icons",
    "size": "medium",
    "showLabels": false
  },
  
  "dependencies": []
}
```

---

## ✅ Validation Checklist

Before deploying your component, verify:

- [ ] `component.json` exists in component directory
- [ ] `name`, `type`, and `category` are defined
- [ ] `type` matches directory name exactly
- [ ] `icon` is a valid Font Awesome class
- [ ] `defaultProps` includes all required properties
- [ ] `aliases` are unique across all components
- [ ] `order` is appropriate for category
- [ ] Schema validates correctly (if provided)
- [ ] Renderer component exists (`*Renderer.vue`)
- [ ] Component auto-discovers without errors

---

## 🚀 Testing Your Component

After creating your `component.json`:

1. **Clear Discovery Cache:**
```php
gmkb_clear_component_cache();
```

2. **Verify Registration:**
```javascript
// In browser console:
const registry = window.gmkbComponentRegistry;
console.log(registry.get('your-component-type'));
```

3. **Check Aliases:**
```php
$discovery->getComponentByType('alias-name'); // Should work
```

4. **Verify Default Props:**
```javascript
console.log(registry.getDefaultProps('your-component-type'));
// Should show your defaultProps, not empty object
```

---

## 📚 Related Documentation

- `COMPONENT-AUTO-DISCOVERY-FIXES-COMPLETE.md` - Architecture fixes details
- `SELF-CONTAINED-ARCHITECTURE-AUDIT.md` - Original audit findings
- `components/README.md` - Component development guide

---

**Last Updated:** October 31, 2025  
**Architecture Version:** 2.0 (Full Auto-Discovery)
