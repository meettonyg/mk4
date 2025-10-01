# Data Flow Analysis - Phase 1

**Generated:** ${new Date().toLocaleString()}

## Current Data Sources

### 1. WordPress Post Meta
- `gmkb_media_kit_state` - Main state object containing:
  - `components` - Component configurations
  - `sections` - Section layout
  - `globalSettings` - Global preferences
- `gmkb_custom_themes` - User-created theme definitions
- `gmkb_selected_theme` - Currently selected theme ID
- Component-specific meta fields (varies by component)

### 2. Pods Data
The system uses Pods fields for guest information:

**Core Guest Fields:**
- Biography/description fields
- Contact information (email, phone, website)
- Social media links
- Headshot/images

**Topics (1-5):**
- `topic_1` through `topic_5`
- Each contains title and description

**Questions (1-25):**
- `question_1` through `question_25`
- Interview/podcast questions

**Additional Metadata:**
- Custom colors and branding
- Episode information
- CTAs and offers

### 3. Component Registry
- Loaded via `ComponentDiscovery` class
- Scans `/components` directory for `component.json` files
- Cached in WordPress transients
- Provides component metadata, categories, and settings

## Current API Endpoints

### WordPress AJAX Endpoints (Legacy):
```php
// Save operations
wp_ajax_guestify_save_media_kit (POST)
  - Saves complete state to post meta
  - Returns success/failure

// Load operations  
wp_ajax_guestify_load_media_kit (GET)
  - Loads state from post meta
  - Returns component data

// Component operations
wp_ajax_guestify_get_components (GET)
  - Returns component registry
  - Used by component library

wp_ajax_guestify_render_component (POST) ⚠️ TO BE REMOVED
  - Renders PHP template server-side
  - Not needed in pure Vue architecture
```

### REST API Endpoints (Current - Needs Enhancement):
```
GET /wp-json/gmkb/v1/mediakit/{id}
  - Current: Basic data retrieval
  - Needs: Unified endpoint with ALL data

POST /wp-json/gmkb/v1/mediakit/{id}
  - Current: Basic save
  - Needs: Complete state save with validation
```

## Required REST API Endpoints (Phase 2)

### Primary Endpoint (All-in-One):
```
GET /wp-json/gmkb/v2/mediakit/{id}
Response:
{
  "success": true,
  "version": "2.0",
  "post": {
    "id": 123,
    "title": "Guest Name",
    "status": "publish",
    "modified": "2025-01-03 10:30:00"
  },
  "state": {
    "components": {...},
    "sections": [...],
    "globalSettings": {...}
  },
  "theme": {
    "id": "professional_clean",
    "customizations": {...}
  },
  "podsData": {
    "biography": "...",
    "topic_1": "...",
    // ALL Pods fields in single fetch
  },
  "metadata": {
    "componentCount": 5,
    "sectionCount": 3,
    "lastSaved": "2025-01-03T10:30:00Z"
  }
}

POST /wp-json/gmkb/v2/mediakit/{id}
Request:
{
  "components": {...},
  "sections": [...],
  "globalSettings": {...},
  "theme": "professional_clean"
}
Response:
{
  "success": true,
  "timestamp": 1704278400,
  "data_size": 45678,
  "components_saved": 5,
  "sections_saved": 3
}
```

### Component Metadata Endpoint:
```
GET /wp-json/gmkb/v2/components
Response:
{
  "success": true,
  "components": [
    {
      "type": "hero",
      "name": "Hero Section",
      "category": "headers",
      "icon": "star",
      "isPremium": false
    },
    // ... more components
  ],
  "categories": ["headers", "content", "social", "media"],
  "total": 17
}
```

## Data Flow Optimization Strategy

### Current Issues:
1. **N+1 Query Problem**: Multiple separate queries for Pods data
2. **Multiple Round Trips**: Component data, Pods data, theme data loaded separately
3. **No Caching**: Same data fetched repeatedly
4. **Large Payloads**: Unnecessary metadata included in state

### Phase 2 Solutions:

#### 1. Single Query for All Pods Data
```php
// Instead of 25+ queries
$topics = [];
for ($i = 1; $i <= 5; $i++) {
    $topics[] = $pod->field("topic_$i"); // Query each time
}

// Do this: Single query
$pod_fields = ['biography', 'topic_1', 'topic_2', ...];
$data = [];
$pod = pods('mkcg', $post_id);
foreach ($pod_fields as $field) {
    $data[$field] = $pod->field($field);
}
```

#### 2. Response Caching
```php
// Cache the unified response for 5 minutes
$cache_key = "gmkb_mediakit_{$post_id}";
$cached = get_transient($cache_key);

if ($cached && !$force_refresh) {
    return $cached;
}

// ... fetch fresh data ...

set_transient($cache_key, $response, 300); // 5 minutes
```

#### 3. Conditional Requests
```javascript
// Client sends last modified timestamp
const response = await fetch(url, {
    headers: {
        'If-Modified-Since': lastFetchTime
    }
});

// Server returns 304 Not Modified if no changes
if (response.status === 304) {
    return cachedData;
}
```

## Migration Path

### Step 1: Create New REST API (Phase 2)
- Implement `GMKB_REST_API_V2` class
- Single unified endpoint with all data
- Optimize database queries
- Add response validation

### Step 2: Update Vue Services (Phase 2)
- Modify `APIService.js` to use new endpoint
- Add client-side caching
- Implement retry logic
- Add error handling

### Step 3: Deprecate Legacy AJAX (Phase 5)
- Keep old endpoints for backwards compatibility
- Add deprecation warnings
- Document migration for plugin users
- Remove in next major version

### Step 4: Performance Validation (Phase 7)
- Query count should be ≤5 per load
- Response time <200ms
- Bundle size <500KB
- No memory leaks

## Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|---------|-------|-------------|
| API Requests | 5-10 | 1 | 80-90% reduction |
| Database Queries | 25+ | ≤5 | 80% reduction |
| Load Time | 1-2s | <500ms | 60-75% faster |
| Data Transfer | 200KB+ | <100KB | 50% reduction |

## Data Dependencies by Component

### High Dependency (Pods + Meta):
- **Biography**: Pods biography, images
- **Topics**: Pods topic_1 through topic_5
- **Questions**: Pods question_1 through question_25
- **Contact**: Pods contact fields, social links
- **Guest Intro**: Pods multiple fields

### Medium Dependency (Meta Only):
- **Hero**: Component settings only
- **Social**: Settings + optional Pods
- **Stats**: Custom component data

### Low Dependency (Self-Contained):
- **Call to Action**: Component props only
- **Logo Grid**: Component configuration
- **Photo Gallery**: Settings + uploads

This dependency mapping helps prioritize which components need the most careful data migration planning.

## Next Steps for Phase 2

1. ✅ Create `GMKB_REST_API_V2` class
2. ✅ Implement unified GET endpoint
3. ✅ Implement unified POST endpoint
4. ✅ Optimize Pods data fetching
5. ✅ Update `APIService.js`
6. ✅ Add response caching
7. ✅ Create performance tests
8. ✅ Document new API

---

**Note**: This document will be updated as we progress through Phase 2 implementation.
