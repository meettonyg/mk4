# Data Contract Specification v1.0

## Overview
This document defines the data contracts between WordPress backend and Vue.js frontend for the Media Kit Builder application.

## API Endpoints

### GET /wp-json/gmkb/v1/mediakit/{postId}
Retrieves complete media kit data with all Pods fields in a single request.

**Response Structure:**
```json
{
  "version": "1.0",
  "postId": 123,
  "components": {
    "comp_hero_1": {
      "id": "comp_hero_1",
      "type": "hero",
      "data": {
        "title": "Custom Title",
        "subtitle": "Custom Subtitle"
      },
      "settings": {
        "alignment": "center",
        "variant": "dark"
      }
    }
  },
  "sections": [
    {
      "id": "section_1",
      "layout": "full_width",
      "components": ["comp_hero_1"],
      "settings": {}
    }
  ],
  "theme": "professional_clean",
  "themeCustomizations": {
    "--color-primary": "#1a73e8"
  },
  "podsData": {
    "biography": "...",
    "first_name": "John",
    "last_name": "Doe",
    "topics": ["Topic 1", "Topic 2"]
  }
}
```

### POST /wp-json/gmkb/v1/mediakit/{postId}/save
Saves media kit state to WordPress database.

**Request Body:**
```json
{
  "components": {},
  "sections": [],
  "theme": "professional_clean",
  "themeCustomizations": {}
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-15 10:30:00",
  "message": "Media kit saved successfully"
}
```

## Component Data Structures

### Hero Component
**WordPress Meta Fields → API Response**
- `first_name` (post_meta) → `podsData.first_name` (string)
- `last_name` (post_meta) → `podsData.last_name` (string)
- `tagline` (post_meta) → `podsData.tagline` (string)
- `guest_headshot` (post_meta) → `podsData.guest_headshot` (string/url)

### Biography Component
**WordPress Meta Fields → API Response**
- `biography` (post_meta) → `podsData.biography` (string)
- `biography_short` (post_meta) → `podsData.biography_short` (string)

### Topics Component
**WordPress Meta Fields → API Response**
- `topic_1` through `topic_5` (post_meta) → `podsData.topic_1` ... `podsData.topic_5` (string)

### Questions Component
**WordPress Meta Fields → API Response**
- `question_1` through `question_10` (post_meta) → `podsData.question_1` ... `podsData.question_10` (string)

### Contact Component
**WordPress Meta Fields → API Response**
- `email` (post_meta) → `podsData.email` (string)
- `phone` (post_meta) → `podsData.phone` (string)
- `website` (post_meta) → `podsData.website` (string)

### Social Component
**WordPress Meta Fields → API Response**
- `linkedin` (post_meta) → `podsData.linkedin` (string/url)
- `twitter` (post_meta) → `podsData.twitter` (string/url)
- `facebook` (post_meta) → `podsData.facebook` (string/url)
- `instagram` (post_meta) → `podsData.instagram` (string/url)
- `youtube` (post_meta) → `podsData.youtube` (string/url)

## State Structure

### Component State
```typescript
interface Component {
  id: string;           // Unique component identifier
  type: string;         // Component type (hero, biography, etc.)
  data: object;         // Component-specific data
  settings: object;     // Component display settings
  order?: number;       // Display order (optional)
}
```

### Section State
```typescript
interface Section {
  id: string;           // Unique section identifier
  layout: 'full_width' | 'two_column' | 'three_column';
  components: string[]; // Array of component IDs
  settings: object;     // Section-specific settings
}
```

### Theme State
```typescript
interface ThemeState {
  theme: string;                    // Active theme name
  themeCustomizations: {            // CSS variable overrides
    [key: string]: string;
  };
}
```

## Data Flow

### Initial Load
1. Vue app calls `GET /wp-json/gmkb/v1/mediakit/{postId}`
2. API fetches all data in single query (no N+1)
3. Returns complete state including Pods data
4. Vue store initializes with received data

### Save Operation
1. Vue app calls `POST /wp-json/gmkb/v1/mediakit/{postId}/save`
2. Sends only components, sections, and theme data
3. API saves to `gmkb_media_kit_state` post meta
4. Returns success confirmation

### Data Enrichment
- Pods data is READ-ONLY from Vue perspective
- All Pods fields are fetched server-side
- Components reference Pods data via computed properties
- No direct Pods field updates from Vue

## Error Handling

### Standard Error Response
```json
{
  "code": "not_found",
  "message": "Media kit not found",
  "data": {
    "status": 404
  }
}
```

### Error Codes
- `not_found` (404): Resource not found
- `forbidden` (403): Insufficient permissions
- `invalid_request` (400): Invalid request parameters
- `save_failed` (500): Server error during save

## Performance Optimizations

### Single Query Pattern
- All Pods fields fetched in one operation
- No separate queries per field
- Cached in Vue store after initial load

### Efficient Updates
- Only modified data sent on save
- Pods data excluded from save operations
- Debounced auto-save (2 second delay)

## Version Compatibility

### Current Version: 1.0
- Minimum WordPress: 5.8
- Minimum PHP: 7.4
- Vue.js: 3.x
- Pinia: 2.x

### Migration from Legacy
- Legacy `saved_components` array converted to object format
- Empty arrays converted to empty objects for Vue compatibility
- Component IDs preserved during migration
