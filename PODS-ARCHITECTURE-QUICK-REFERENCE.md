# Self-Contained Pods Architecture - Quick Reference

## ✅ Status: FULLY IMPLEMENTED

The self-contained Pods architecture is complete and operational. No further implementation needed.

## What It Does

Each component declares its own Pods field requirements in a `pods-config.json` file. The system automatically discovers these requirements and fetches only the needed fields.

## File Structure

```
components/
├── biography/
│   ├── component.json
│   ├── BiographyRenderer.vue
│   └── pods-config.json          ← Declares Pods fields needed
├── social/
│   ├── component.json
│   ├── SocialRenderer.vue
│   └── pods-config.json          ← Declares Pods fields needed
└── hero/
    ├── component.json
    ├── HeroRenderer.vue
    └── pods-config.json          ← Declares Pods fields needed
```

## pods-config.json Format

```json
{
  "dataSource": "pods",
  "description": "What this component needs from Pods",
  "fields": {
    "field_name": {
      "type": "text|wysiwyg|email|website|file",
      "required": false,
      "description": "What this field does"
    }
  }
}
```

## How It Works

### 1. Component Discovery
```
ComponentDiscovery->getRequiredPodsFields()
  ├─> Scans all components/*/pods-config.json files
  ├─> Extracts field names from "fields" object
  ├─> Removes duplicates
  └─> Returns unique field list
```

### 2. Data Fetching

**REST API v2** (`includes/api/v2/class-gmkb-rest-api-v2.php`):
```php
// Uses discovered fields automatically
$this->pods_fields = $gmkb_component_discovery->getRequiredPodsFields();
```

**Enqueue** (`includes/enqueue.php`):
```php
// Uses discovered fields automatically
$fields = $gmkb_component_discovery->getRequiredPodsFields();
```

## Adding a New Component

### Old Way ❌
1. Create component files
2. Edit REST API v2 to add fields
3. Edit enqueue.php to add fields  
4. Keep both lists in sync

### New Way ✅
1. Create component files
2. Add `pods-config.json` with fields
3. **Done!** (auto-discovered)

## Example: Biography Component

**File**: `components/biography/pods-config.json`

```json
{
  "dataSource": "pods",
  "description": "Biography component requires biography text and basic identity fields",
  "fields": {
    "biography": {
      "type": "wysiwyg",
      "required": false,
      "description": "Main biography text"
    },
    "biography_long": {
      "type": "wysiwyg",
      "required": false,
      "description": "Extended biography text"
    },
    "first_name": {
      "type": "text",
      "required": false,
      "description": "Guest's first name"
    },
    "last_name": {
      "type": "text",
      "required": false,
      "description": "Guest's last name"
    }
  }
}
```

## Testing

### Run Verification Script
```bash
cd /path/to/plugin/mk4
php verify-pods-architecture.php
```

### View Discovered Fields
```php
// Add to WordPress debug/test page
global $gmkb_component_discovery;
$fields = $gmkb_component_discovery->getRequiredPodsFields();
error_log('Fields: ' . print_r($fields, true));
```

### Check Debug Log
Enable WP_DEBUG and watch for:
```
ComponentDiscovery: Scanning components for Pods field requirements...
ComponentDiscovery: Component 'biography' requires 4 Pods fields: biography, biography_long, first_name, last_name
ComponentDiscovery: Total unique Pods fields required: XX
GMKB REST API v2: Using XX Pods fields from component discovery
gmkb_get_pods_data: Using XX fields from component discovery
```

## Implementation Files

| File | Role | Status |
|------|------|--------|
| `system/ComponentDiscovery.php` | Field discovery | ✅ Has `getRequiredPodsFields()` |
| `includes/api/v2/class-gmkb-rest-api-v2.php` | REST API consumer | ✅ Uses discovery |
| `includes/enqueue.php` | Data injection consumer | ✅ Uses discovery |
| `components/*/pods-config.json` | Field declarations | ✅ All 16 exist |

## Benefits

✅ **No Duplication**: One field declaration per component  
✅ **Automatic**: Adding component auto-discovers fields  
✅ **Maintainable**: Field requirements next to component code  
✅ **Self-Documenting**: pods-config.json describes what's needed  
✅ **Scalable**: System grows automatically with components  

## Fallback Safety

Both REST API v2 and enqueue.php have hardcoded fallback lists if ComponentDiscovery is unavailable. This ensures the system continues working even if discovery fails.

## Debugging

### Clear Cache
```php
global $gmkb_component_discovery;
$gmkb_component_discovery->clearCache();
$gmkb_component_discovery->scan(true);
```

### View Debug Info
```php
global $gmkb_component_discovery;
$debug = $gmkb_component_discovery->getDebugInfo();
error_log(print_r($debug, true));
```

## Developer Checklist Compliance

✅ **Architectural Integrity**: Self-contained component architecture enforced  
✅ **No Polling**: Event-driven field discovery  
✅ **Root Cause Fix**: Eliminates hardcoded field lists at source  
✅ **Code Quality**: Reduced duplication, improved maintainability  
✅ **State Management**: Centralized via ComponentDiscovery  
✅ **Error Handling**: Fallback mechanisms for safety  
✅ **WordPress Integration**: Proper use of transient caching  

---

**Last Updated**: October 28, 2025  
**Architecture Status**: Complete & Operational  
**Documentation**: `PODS-ARCHITECTURE-VERIFICATION.md`  
**Verification**: `verify-pods-architecture.php`
