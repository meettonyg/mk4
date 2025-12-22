# AI Generators Developer Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Adding a New AI Generator](#adding-a-new-ai-generator)
3. [Composable API Reference](#composable-api-reference)
4. [Store API Reference](#store-api-reference)
5. [REST API Reference](#rest-api-reference)
6. [Shortcode Usage](#shortcode-usage)
7. [Styling & Theming](#styling--theming)
8. [Security Considerations](#security-considerations)
9. [Testing Guide](#testing-guide)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The AI Generator system uses a **dual-mode architecture** that allows the same Vue components to work in two contexts:

### Integrated Mode (Builder)
- Used within the Media Kit Builder sidebar
- Full WordPress authentication required
- Access to Pods data and component state
- Premium feature for logged-in users

### Standalone Mode (Public)
- Embedded on public pages via shortcodes
- No authentication required
- IP-based rate limiting
- Lead generation CTA displayed
- Used for free SEO tools (the "Veed.io Strategy")

### Key Components

```
src/
├── composables/
│   └── useAIGenerator.js      # Headless logic (context detection, API calls)
├── stores/
│   └── ai.js                   # Pinia store (history, caching, preferences)
├── vue/components/ai/
│   ├── index.js                # Public exports
│   ├── AiModal.vue             # Modal wrapper for builder integration
│   ├── AiAssistantPanel.vue    # Floating assistant panel
│   ├── BiographyGenerator.vue  # Biography generation UI
│   ├── TopicsGenerator.vue     # Topics/talking points UI
│   ├── QuestionsGenerator.vue  # Q&A generation UI
│   ├── TaglineGenerator.vue    # Tagline/headline UI
│   ├── GuestIntroGenerator.vue # Introduction generation UI
│   └── AuthorityHookBuilder.vue # Authority hook framework UI
└── seo-tools-entry.js          # Standalone bundle entry point
```

---

## Adding a New AI Generator

### Step 1: Create the Vue Component

Create a new file in `src/vue/components/ai/`:

```vue
<!-- src/vue/components/ai/MyNewGenerator.vue -->
<template>
  <div :class="containerClass">
    <!-- Standalone header (only shown in standalone mode) -->
    <div v-if="mode === 'standalone'" class="generator-header">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>

    <!-- Input form -->
    <form @submit.prevent="handleGenerate" class="generator-form">
      <div class="form-group">
        <label for="input-field">Input Label</label>
        <input
          id="input-field"
          v-model="inputValue"
          type="text"
          :disabled="isGenerating"
          required
        />
      </div>

      <!-- Options (tone, length, etc.) -->
      <div class="form-row">
        <div class="form-group">
          <label for="tone">Tone</label>
          <select id="tone" v-model="options.tone">
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
          </select>
        </div>
      </div>

      <button type="submit" :disabled="isGenerating || !isValid">
        <span v-if="isGenerating">Generating...</span>
        <span v-else>Generate</span>
      </button>
    </form>

    <!-- Error display -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Results -->
    <div v-if="generatedContent" class="results-section">
      <div class="result-content">
        {{ generatedContent }}
      </div>

      <div class="result-actions">
        <button @click="copyToClipboard">
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>

        <!-- Apply button (integrated mode only) -->
        <button
          v-if="mode === 'integrated'"
          @click="applyContent"
          class="apply-btn"
        >
          Apply to Component
        </button>
      </div>
    </div>

    <!-- Lead gen CTA (standalone mode only) -->
    <div v-if="mode === 'standalone' && generatedContent" class="lead-gen-cta">
      <h3>Want more AI-powered features?</h3>
      <p>Create professional media kits with our builder.</p>
      <a href="/media-kit-builder" class="cta-button">
        Try Media Kit Builder Free
      </a>
    </div>

    <!-- Usage meter (standalone mode only) -->
    <UsageMeter v-if="mode === 'standalone'" :usage="usage" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAIGenerator } from '../../../composables/useAIGenerator';
import UsageMeter from './shared/UsageMeter.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'standalone',
    validator: (v) => ['integrated', 'standalone'].includes(v)
  },
  componentId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated']);

// Use the AI generator composable
const {
  isGenerating,
  error,
  generatedContent,
  usage,
  copied,
  generate,
  copyToClipboard,
  reset
} = useAIGenerator('my_new_type', props.mode);

// Local state
const inputValue = ref('');
const options = ref({
  tone: 'professional',
  length: 'medium'
});

// Validation
const isValid = computed(() => {
  return inputValue.value.trim().length >= 3;
});

// Container class based on mode
const containerClass = computed(() => [
  'ai-generator',
  'my-new-generator',
  `mode-${props.mode}`,
  { 'is-generating': isGenerating.value }
]);

// Handle generation
const handleGenerate = async () => {
  const result = await generate({
    input: inputValue.value,
    tone: options.value.tone,
    length: options.value.length
  });

  if (result) {
    emit('generated', result);
  }
};

// Apply content (integrated mode)
const applyContent = () => {
  emit('applied', {
    myField: generatedContent.value
  });
};
</script>

<style scoped>
/* Component styles - see Styling section */
</style>
```

### Step 2: Register in the Index

Add your component to `src/vue/components/ai/index.js`:

```javascript
// src/vue/components/ai/index.js
export { default as MyNewGenerator } from './MyNewGenerator.vue';
```

### Step 3: Add PHP Backend Handler

Add a handler in `includes/api/class-gmkb-ai-generator.php`:

```php
// In the handle_generation method, add a new case:
case 'my_new_type':
    $prompt = $this->build_my_new_prompt($params);
    break;

// Add the prompt builder method:
private function build_my_new_prompt($params) {
    $input = sanitize_text_field($params['input'] ?? '');
    $tone = sanitize_text_field($params['tone'] ?? 'professional');

    return "Generate content based on: {$input}\n\nTone: {$tone}";
}
```

### Step 4: Add to Editor Component (Integrated Mode)

In the relevant editor component (e.g., `components/my-component/MyComponentEditor.vue`):

```vue
<script setup>
import { AiModal, MyNewGenerator } from '../../src/vue/components/ai';

const showAiModal = ref(false);

const handleAiApplied = (data) => {
  if (data.myField) {
    localData.value.myField = data.myField;
    updateComponent();
  }
  showAiModal.value = false;
};
</script>

<template>
  <!-- Add AI button -->
  <button @click="showAiModal = true" class="ai-generate-btn">
    Generate with AI
  </button>

  <!-- Add modal -->
  <AiModal v-model="showAiModal" title="Generate with AI">
    <MyNewGenerator
      mode="integrated"
      :component-id="componentId"
      @applied="handleAiApplied"
    />
  </AiModal>
</template>
```

### Step 5: Add Standalone Shortcode (Optional)

Add to `includes/shortcodes/class-gmkb-ai-shortcodes.php`:

```php
public function my_new_generator_shortcode($atts) {
    $atts = shortcode_atts([
        'title' => 'My New Generator',
        'description' => 'Generate amazing content with AI.',
    ], $atts);

    wp_enqueue_script('gmkb-seo-tools');
    wp_enqueue_style('gmkb-seo-tools');

    return sprintf(
        '<div class="gmkb-standalone-scope" data-gmkb-tool="my-new" data-title="%s" data-description="%s"></div>',
        esc_attr($atts['title']),
        esc_attr($atts['description'])
    );
}
```

### Step 6: Register in Standalone Entry

Add to `src/seo-tools-entry.js`:

```javascript
import { MyNewGenerator } from './vue/components/ai';

const TOOL_COMPONENTS = {
  // ... existing tools
  'my-new': MyNewGenerator,
};
```

### Step 7: Build and Test

```bash
# Build standalone bundle
npm run build:seo-tools

# Build main bundle
npm run build

# Run tests
npm run test:unit
npm run test:e2e
```

---

## Composable API Reference

### `useAIGenerator(type, mode)`

The core composable for AI generation logic.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `string` | Generator type ('biography', 'topics', 'questions', etc.) |
| `mode` | `string` | Context mode ('integrated' \| 'standalone') |

#### Returns

```javascript
const {
  // State
  isGenerating,      // ref<boolean> - Generation in progress
  error,             // ref<string|null> - Error message
  generatedContent,  // ref<any> - Generated content
  usage,             // ref<object> - Rate limit usage info
  copied,            // ref<boolean> - Copy success state

  // Computed
  isIntegrated,      // computed<boolean> - Is integrated mode
  isStandalone,      // computed<boolean> - Is standalone mode
  canGenerate,       // computed<boolean> - Can trigger generation
  cacheKey,          // computed<string> - Cache key for current params

  // Methods
  generate,          // (params: object) => Promise<any>
  copyToClipboard,   // () => Promise<void>
  reset,             // () => void
  validateFields,    // (fields: object, rules: object) => boolean
} = useAIGenerator('biography', 'integrated');
```

#### Example Usage

```javascript
import { useAIGenerator } from '@/composables/useAIGenerator';

const {
  isGenerating,
  error,
  generatedContent,
  generate,
  copyToClipboard
} = useAIGenerator('biography', 'standalone');

// Generate content
const result = await generate({
  name: 'John Doe',
  expertise: 'Marketing',
  tone: 'professional',
  length: 'medium',
  pov: 'third'
});

// Copy to clipboard
await copyToClipboard();
```

---

## Store API Reference

### AI Store (`useAIStore`)

Pinia store for AI-related state management.

#### State

```javascript
const store = useAIStore();

// Generation history
store.generationHistory  // Array of past generations

// Cached results
store.cachedResults      // Object with cached API responses

// Authority Hook data
store.authorityHook      // { who, what, when, how, where, why }

// Impact Intro data
store.impactIntro        // { credentials: [], achievements: [] }

// Preferences
store.preferences        // { defaultTone, defaultLength, defaultPOV }

// Status
store.isGenerating       // boolean
store.currentGenerationType // string | null
store.lastError          // string | null

// Usage
store.usage              // { remaining, limit, resetTime }
```

#### Actions

```javascript
// Authority Hook
store.updateAuthorityHook(field, value)
store.setAuthorityHook(hookData)
store.resetAuthorityHook()

// Credentials/Achievements
store.addCredential(credential)
store.removeCredential(index)
store.setCredentials(array)
store.addAchievement(achievement)
store.removeAchievement(index)
store.setAchievements(array)

// Caching
store.cacheResult(key, content)
store.getCachedResult(key)      // returns null if expired
store.hasCachedResult(key)
store.clearCache()

// History
store.addToHistory({ type, params, content })
store.getHistoryByType(type)
store.clearHistory()

// Generation state
store.setGenerating(isGenerating, type)
store.setError(message)
store.clearError()

// Usage
store.updateUsage({ remaining, limit, reset_time })

// Preferences
store.updatePreferences(prefsObject)

// Load from Pods
store.loadFromPodsData(podsData)

// Reset
store.resetAll()
```

#### Getters

```javascript
store.authorityHookSummary   // Formatted summary string
store.hasValidAuthorityHook  // boolean - has minimum data
store.credentialsSummary     // Comma-separated credentials
store.usagePercentage        // 0-100 percentage used
store.isRateLimited          // boolean - at limit
```

---

## REST API Reference

### Endpoint

```
POST /wp-json/gmkb/v2/ai/generate
```

### Request Headers

**Integrated Mode (Builder):**
```
X-WP-Nonce: {wp_rest_nonce}
Content-Type: application/json
```

**Standalone Mode (Public):**
```
X-GMKB-Nonce: {custom_nonce}
Content-Type: application/json
```

### Request Body

```json
{
  "type": "biography",
  "params": {
    "name": "John Doe",
    "expertise": "Marketing",
    "tone": "professional",
    "length": "medium",
    "pov": "third"
  },
  "context": "integrated"
}
```

### Response (Success)

```json
{
  "success": true,
  "content": "John Doe is a distinguished marketing professional...",
  "usage": {
    "remaining": 9,
    "limit": 10,
    "reset_time": 3600
  },
  "cached": false
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "rate_limited",
  "usage": {
    "remaining": 0,
    "limit": 10,
    "reset_time": 1800
  }
}
```

### Generator Types

| Type | Description | Required Params |
|------|-------------|-----------------|
| `biography` | Professional bio | `name`, `expertise` |
| `topics` | Speaking topics | `expertise`, `audience` |
| `questions` | Interview Q&A | `expertise`, `context` |
| `tagline` | Headlines/taglines | `name`, `expertise` |
| `guest_intro` | Guest introduction | `name`, `expertise`, `achievements` |
| `authority_hook` | Authority statement | `who`, `what`, `how` |

---

## Shortcode Usage

### Available Shortcodes

```php
// Biography Generator
[gmkb_biography_generator title="Bio Generator" description="Create your bio"]

// Topics Generator
[gmkb_topics_generator title="Topic Ideas"]

// Questions Generator
[gmkb_questions_generator title="Interview Prep"]

// Tagline Generator
[gmkb_tagline_generator title="Headline Generator"]

// Guest Intro Generator
[gmkb_guest_intro_generator]

// Authority Hook Builder
[gmkb_authority_hook_builder]
```

### Shortcode Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `title` | Tool name | Header title |
| `description` | Default | Subheader text |
| `theme` | `light` | Color theme (`light` \| `dark`) |
| `accent_color` | `#ec4899` | Primary accent color |

### Example

```php
[gmkb_biography_generator
  title="Free Bio Generator"
  description="Create a professional biography in seconds"
  theme="light"
  accent_color="#6366f1"
]
```

### Page Template

```php
<?php
/**
 * Template Name: SEO Tools Page
 */
get_header();
?>

<div class="seo-tools-page">
  <div class="tool-container">
    <?php echo do_shortcode('[gmkb_biography_generator]'); ?>
  </div>
</div>

<?php get_footer(); ?>
```

---

## Styling & Theming

### CSS Variables

The standalone tools use CSS custom properties for theming:

```css
.gmkb-standalone-scope {
  --gmkb-color-primary: #ec4899;
  --gmkb-color-primary-hover: #db2777;
  --gmkb-color-background: #ffffff;
  --gmkb-color-surface: #f8fafc;
  --gmkb-color-text: #1e293b;
  --gmkb-color-text-muted: #64748b;
  --gmkb-color-border: #e5e7eb;
  --gmkb-color-error: #ef4444;
  --gmkb-color-success: #10b981;
  --gmkb-spacing-xs: 4px;
  --gmkb-spacing-sm: 8px;
  --gmkb-spacing-md: 16px;
  --gmkb-spacing-lg: 24px;
  --gmkb-spacing-xl: 32px;
  --gmkb-radius-sm: 4px;
  --gmkb-radius-md: 8px;
  --gmkb-radius-lg: 12px;
  --gmkb-font-family: system-ui, -apple-system, sans-serif;
  --gmkb-font-size-sm: 13px;
  --gmkb-font-size-base: 14px;
  --gmkb-font-size-lg: 16px;
  --gmkb-font-size-xl: 20px;
}
```

### Dark Mode

```css
.gmkb-standalone-scope[data-theme="dark"] {
  --gmkb-color-background: #0f172a;
  --gmkb-color-surface: #1e293b;
  --gmkb-color-text: #f3f4f6;
  --gmkb-color-text-muted: #94a3b8;
  --gmkb-color-border: #334155;
}
```

### CSS Isolation

Standalone tools use a scoped wrapper to prevent style conflicts:

```css
.gmkb-standalone-scope {
  all: initial;
  font-family: var(--gmkb-font-family);
  /* ... reset and base styles */
}

.gmkb-standalone-scope *,
.gmkb-standalone-scope *::before,
.gmkb-standalone-scope *::after {
  box-sizing: border-box;
}
```

### Customizing via Theme

```php
// In your theme's functions.php
add_filter('gmkb_standalone_styles', function($styles) {
  $styles['--gmkb-color-primary'] = '#your-brand-color';
  return $styles;
});
```

---

## Security Considerations

### Integrated Mode (Builder)

- WordPress REST API nonce verification
- `edit_posts` capability check
- User must be logged in
- Full rate limiting per user

### Standalone Mode (Public)

- Custom nonce verification (prevents direct API abuse)
- IP-based rate limiting (10 requests per hour default)
- No authentication required
- Input sanitization on all params
- Output escaping on all responses

### Rate Limiting Configuration

```php
// In wp-config.php or theme functions.php
define('GMKB_RATE_LIMIT_PUBLIC', 10);      // Requests per hour (public)
define('GMKB_RATE_LIMIT_AUTHENTICATED', 50); // Requests per hour (logged in)
define('GMKB_RATE_LIMIT_WINDOW', 3600);     // Window in seconds
```

### Content Security

- All user inputs are sanitized with `sanitize_text_field()` or `wp_kses_post()`
- AI-generated content is sanitized before storage
- XSS protection on output via `esc_html()` and `esc_attr()`

---

## Testing Guide

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:unit -- --coverage

# Run specific test file
npm run test:unit -- tests/unit/composables/useAIGenerator.spec.js
```

#### Test Structure

```
tests/
├── unit/
│   ├── composables/
│   │   └── useAIGenerator.spec.js
│   ├── stores/
│   │   └── ai.spec.js
│   └── components/
│       └── BiographyGenerator.spec.js
└── setup.js
```

### E2E Tests (Cypress)

```bash
# Open Cypress UI
npm run test:e2e

# Run headless
npm run test:e2e:ci

# Run specific spec
npm run test:e2e -- --spec cypress/e2e/ai-generators.cy.js
```

### Writing Tests

**Unit Test Example:**

```javascript
import { describe, it, expect, vi } from 'vitest';
import { useAIGenerator } from '@/composables/useAIGenerator';

describe('useAIGenerator', () => {
  it('generates content successfully', async () => {
    const { generate, generatedContent, isGenerating } = useAIGenerator('biography', 'standalone');

    // Mock API
    vi.mock('@/api/ai', () => ({
      generateContent: vi.fn().mockResolvedValue({ content: 'Generated bio' })
    }));

    await generate({ name: 'John', expertise: 'Marketing' });

    expect(generatedContent.value).toBe('Generated bio');
    expect(isGenerating.value).toBe(false);
  });
});
```

**E2E Test Example:**

```javascript
describe('Biography Generator', () => {
  it('generates a biography in standalone mode', () => {
    cy.visit('/free-tools/biography-generator');

    cy.get('[data-testid="name-input"]').type('Jane Doe');
    cy.get('[data-testid="expertise-input"]').type('Leadership');
    cy.get('[data-testid="generate-button"]').click();

    cy.get('[data-testid="result-content"]')
      .should('be.visible')
      .and('contain', 'Jane Doe');
  });
});
```

---

## Troubleshooting

### Common Issues

#### "Generation failed" error

1. Check browser console for specific error
2. Verify API endpoint is accessible: `/wp-json/gmkb/v2/ai/generate`
3. Check nonce validity (refresh page if expired)
4. Verify OpenAI API key is configured in settings

#### Rate limit reached immediately

1. Clear transient: `wp_delete_transient('gmkb_rate_limit_{ip_hash}')`
2. Check `GMKB_RATE_LIMIT_PUBLIC` constant
3. Verify IP detection is correct (check behind proxies)

#### Standalone tools not rendering

1. Verify shortcode is registered
2. Check that `gmkb-seo-tools.js` is enqueued
3. Inspect for JS errors in console
4. Verify `data-gmkb-tool` attribute matches tool name

#### Content not applying in builder

1. Check `@applied` event handler
2. Verify `componentId` prop is passed
3. Check store's `updateComponent` action
4. Look for validation errors in console

#### Styles not applying / CSS conflicts

1. Ensure `.gmkb-standalone-scope` wrapper is present
2. Check for `!important` overrides from theme
3. Verify CSS variables are defined
4. Use browser DevTools to inspect computed styles

### Debug Mode

Enable debug logging:

```php
// In wp-config.php
define('GMKB_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

```javascript
// In browser console
localStorage.setItem('gmkb_debug', 'true');
```

### Support

- GitHub Issues: [github.com/guestify/mk4/issues](https://github.com/guestify/mk4/issues)
- Documentation: [docs.guestify.com/mk4](https://docs.guestify.com/mk4)
- Email: support@guestify.com

---

## Changelog

### Version 1.0.0
- Initial release of dual-mode AI generators
- Biography, Topics, Questions, Tagline, Guest Intro generators
- Authority Hook Builder
- Standalone SEO tools with shortcodes
- Pinia store for state management
- Rate limiting and caching
- Migration from legacy aigen plugin
