# Media Kit Data Structure Alignment Guide

## Perfect Data Structure Specification

This document defines the CANONICAL data structure for media kits to ensure perfect alignment across builder, admin, and frontend.

## Core Data Structure

### Top Level
```json
{
    "components": {},      // Object/map of all components by ID
    "sections": [],        // Array of section configurations
    "layout": [],          // Optional: section order array
    "globalSettings": {},  // Optional: theme and global settings
    "lastSaved": "...",    // ISO datetime
    "version": "2.0"       // Data structure version
}
```

### Components Object

**Key Pattern**: `comp_<timestamp>_<random>`

```json
"components": {
    "comp_1759449715163_6212mrxlm": {
        "id": "comp_1759449715163_6212mrxlm",  // REQUIRED: Must match key
        "type": "biography",                     // REQUIRED: Component type
        "data": {},                              // OPTIONAL: Static config data
        "props": {},                             // OPTIONAL: Display properties
        "settings": {},                          // OPTIONAL: Component settings
        "_usesPods": true,                       // OPTIONAL: Marker for Pods components
        "_podsType": "biography"                 // OPTIONAL: Pods type identifier
    }
}
```

**Component Fields:**
- `id` (string, required): Unique identifier matching the object key
- `type` (string, required): Component type (hero, biography, topics, etc.)
- `data` (object, optional): Static configuration data
- `props` (object, optional): Display properties (enriched by Pods system)
- `settings` (array/object, optional): Additional settings
- `_usesPods` (boolean, optional): Flag indicating Pods data integration
- `_podsType` (string, optional): Specific Pods type for enrichment

### Sections Array

#### Full Width Section
```json
{
    "section_id": "section_1759441072483_nhp6amcbh",
    "type": "full_width",                    // REQUIRED
    "layout": "full_width",                  // Should match type
    "components": [                          // REQUIRED: Array of component IDs
        "comp_1759449715163_6212mrxlm"
    ],
    "settings": {}                           // OPTIONAL
}
```

#### Two-Column Section
```json
{
    "section_id": "section_1759443204103_316i6gjiy",
    "type": "two_column",                    // REQUIRED
    "layout": "two_column",                  // Should match type
    "columns": {                             // REQUIRED for multi-column
        "1": [                               // Column 1 component IDs
            "comp_1759496784367_9xe265x4s"
        ],
        "2": [                               // Column 2 component IDs
            "comp_1759496789365_y61yvplmg"
        ],
        "3": []                              // Empty for two-column
    },
    "settings": {}                           // OPTIONAL
}
```

#### Three-Column Section
```json
{
    "section_id": "section_xyz",
    "type": "three_column",
    "layout": "three_column",
    "columns": {
        "1": ["comp_id_1"],
        "2": ["comp_id_2"],
        "3": ["comp_id_3"]
    },
    "settings": {}
}
```

**Section Fields:**
- `section_id` (string, required): Unique section identifier
- `type` (string, required): Section type (full_width, two_column, three_column)
- `layout` (string, recommended): Layout type (should match `type`)
- `components` (array, required for full_width): Array of component ID strings
- `columns` (object, required for multi-column): Object with keys "1", "2", "3"
- `settings` (object/array, optional): Section-specific settings

## Critical Rules

### Rule 1: Component ID Consistency
```
✓ CORRECT:
{
    "components": {
        "comp_123": { "id": "comp_123", ... }
    }
}

✗ WRONG:
{
    "components": {
        "comp_123": { "id": "comp_456", ... }  // Mismatched!
    }
}
```

### Rule 2: Section-Specific Keys

**Full Width Sections:**
```json
{
    "type": "full_width",
    "components": ["comp_1", "comp_2"]  // Use 'components' array
}
```

**Multi-Column Sections:**
```json
{
    "type": "two_column",
    "columns": {                        // Use 'columns' object
        "1": ["comp_1"],
        "2": ["comp_2"],
        "3": []
    }
}
```

### Rule 3: Component References Must Exist
```
Every component ID referenced in sections must exist in the components object:

✓ VALID:
sections: [{ components: ["comp_123"] }]
components: { "comp_123": {...} }

✗ INVALID:
sections: [{ components: ["comp_123"] }]
components: { "comp_456": {...} }  // comp_123 missing!
```

### Rule 4: String IDs Only
```
✓ CORRECT:
"components": ["comp_123", "comp_456"]

✗ WRONG:
"components": [
    { "component_id": "comp_123" },  // Don't use objects
    { "component_id": "comp_456" }
]
```

## Pods Data Integration

### Enrichment Process

The `gmkb_load_media_kit_state` filter enriches components with Pods data:

```php
// BEFORE enrichment:
{
    "id": "comp_123",
    "type": "biography",
    "props": { "title": "About Me" }
}

// AFTER enrichment:
{
    "id": "comp_123",
    "type": "biography",
    "props": {
        "title": "About Me",
        "biography": "Tony has helped...",  // From Pods
        "content": "Tony has helped...",    // From Pods
        "podsDataLoaded": true,
        "enrichmentTimestamp": 1234567890
    },
    "data": {
        "biography": "Tony has helped...",  // Also in data
        "content": "Tony has helped..."
    }
}
```

### Component-Specific Pods Fields

**Biography:**
- `biography` (from `biography` meta)
- `introduction` (from `introduction` meta)
- `content` (fallback to biography)

**Hero:**
- `first_name`, `last_name` (from respective meta fields)
- `full_name` (combined)
- `guest_title` (from `guest_title` meta)
- `tagline` (from `tagline` meta)
- `guest_headshot` (from `guest_headshot` meta)

**Topics:**
- `topic_1` through `topic_5` (from respective meta fields)
- `topics` (array of topic objects)
- `topics_count` (number of non-empty topics)

## Alignment Verification

### Command Line Tool

```bash
# Run diagnostic
php data-alignment-check.php 32372

# Export full data
php data-alignment-check.php 32372 --export-json
```

### Expected Output

```
✓ Components in map: 3
✓ Components referenced: 3
✓ Missing references: 0
✓ Orphaned components: 0
✓ All sections have correct structure
✓ Data structure looks good!
```

### REST API Check

```bash
# View raw state
curl https://guestify.ai/wp-json/gmkb/v1/debug/32372

# Check specific fields
curl https://guestify.ai/wp-json/gmkb/v1/debug/32372 | jq '.components'
curl https://guestify.ai/wp-json/gmkb/v1/debug/32372 | jq '.sections'
```

## Common Issues & Fixes

### Issue 1: Empty Sections on Frontend

**Symptom:** Section renders but no components inside

**Cause:** Component IDs in section don't match components map

**Fix:**
```bash
# Check cross-references
php data-alignment-check.php POST_ID

# Look for "Missing references" or "Orphaned components"
```

### Issue 2: Multi-Column Not Rendering

**Symptom:** Two/three column layout shows nothing

**Cause:** Using `components` array instead of `columns` object

**Fix:**
```json
// BEFORE (wrong):
{
    "type": "two_column",
    "components": ["comp_1", "comp_2"]
}

// AFTER (correct):
{
    "type": "two_column",
    "columns": {
        "1": ["comp_1"],
        "2": ["comp_2"],
        "3": []
    }
}
```

### Issue 3: Components Not Enriched

**Symptom:** Biography shows placeholder text

**Cause:** Pods fields empty OR enrichment not running

**Fix:**
```bash
# Check Pods data exists
php data-alignment-check.php POST_ID

# Look for "PODS DATA AVAILABILITY" section
# Should show ✓ for biography, topics, etc.
```

### Issue 4: Builder vs Frontend Mismatch

**Symptom:** Builder shows components, frontend doesn't

**Cause:** Data structure incompatibility

**Steps:**
1. Check builder preview: `/tools/media-kit/?mkcg_id=32372`
2. Check data viewer: `/wp-admin/admin.php?page=gmkb-data-viewer&post_id=32372`
3. Check frontend: `/guests/tonyg/`
4. Run diagnostic: `php data-alignment-check.php 32372`
5. Compare outputs

## Migration Path

### From Legacy Format

If you have old data with different structure:

```php
// Legacy format
$legacy = [
    'saved_components' => [
        ['id' => 'comp_1', 'type' => 'hero', ...],
        ['id' => 'comp_2', 'type' => 'biography', ...]
    ],
    'layout' => ['comp_1', 'comp_2']
];

// Convert to new format
$new = [
    'components' => [],
    'sections' => [[
        'section_id' => 'section_default',
        'type' => 'full_width',
        'layout' => 'full_width',
        'components' => []
    ]],
    'version' => '2.0'
];

foreach ($legacy['saved_components'] as $comp) {
    $new['components'][$comp['id']] = $comp;
    $new['sections'][0]['components'][] = $comp['id'];
}
```

## Best Practices

### 1. Always Use String IDs
```json
"components": ["comp_123"]  // ✓
"components": [{"component_id": "comp_123"}]  // ✗
```

### 2. Match Section Type to Structure
```json
// Full width → use 'components'
{ "type": "full_width", "components": [...] }

// Multi-column → use 'columns'
{ "type": "two_column", "columns": {...} }
```

### 3. Verify After Save
Always check that saved data matches expected structure:
```bash
php data-alignment-check.php POST_ID
```

### 4. Test All Three Views
- Builder: `/tools/media-kit/?mkcg_id=POST_ID`
- Admin: `/wp-admin/admin.php?page=gmkb-data-viewer&post_id=POST_ID`
- Frontend: `/guests/SLUG/`

### 5. Enable Debug Logging
```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);

// Check: /wp-content/debug.log
```

## Validation Schema

```javascript
// JSON Schema for validation
{
  "type": "object",
  "required": ["components", "sections", "version"],
  "properties": {
    "components": {
      "type": "object",
      "patternProperties": {
        "^comp_": {
          "type": "object",
          "required": ["id", "type"],
          "properties": {
            "id": { "type": "string", "pattern": "^comp_" },
            "type": { "type": "string" },
            "data": { "type": "object" },
            "props": { "type": "object" },
            "settings": { "type": ["object", "array"] }
          }
        }
      }
    },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["section_id", "type"],
        "properties": {
          "section_id": { "type": "string" },
          "type": { "enum": ["full_width", "two_column", "three_column"] },
          "components": { "type": "array", "items": { "type": "string" } },
          "columns": { "type": "object" }
        }
      }
    },
    "version": { "const": "2.0" }
  }
}
```

## Summary Checklist

Before deploying:

- [ ] All component IDs in sections exist in components map
- [ ] Full-width sections use `components` array
- [ ] Multi-column sections use `columns` object
- [ ] All component IDs match their object keys
- [ ] Pods fields populated for relevant post
- [ ] Diagnostic tool shows 0 issues
- [ ] Builder preview works
- [ ] Frontend display works
- [ ] All three views show same content

Run: `php data-alignment-check.php POST_ID` to verify!
