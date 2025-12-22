# Unified AI Generator Architecture ("Modular Widgets")

> **Version:** 1.7
> **Created:** December 2024
> **Status:** ALL PHASES COMPLETE - Integration Finished

---

## Executive Summary

**Objective:** Migrate the legacy `aigen` (AI Content Generator) tools into the unified `mk4` Vue architecture while enabling dual deployment for both the premium builder AND free SEO marketing tools.

**Strategy:** Build **"Dual-Mode" Vue Components** that function in two contexts:
1. **Integrated Mode:** Inside the Media Kit Builder (Auth required, saves to Pinia Store)
2. **Standalone Mode:** On public WordPress pages (No auth, Copy-to-Clipboard, Lead Gen CTAs)

**Business Value:** Same codebase powers both paid product features AND free tools for SEO/lead generation (the "Veed.io Strategy")

---

## Table of Contents

- [Background & Assessment](#background--assessment)
- [Architecture Overview](#architecture-overview)
- [Phase 1: Backend API Unification](#phase-1-backend-api-unification-php-layer)
- [Phase 2: Headless Logic Migration](#phase-2-headless-logic-migration-vue-composables)
- [Phase 3: Dual-Mode Component Development](#phase-3-dual-mode-component-development-ui-layer)
- [Phase 4: Deployment & Wiring](#phase-4-deployment--wiring)
- [Phase 5: Migration, Testing & Legacy Retirement](#phase-5-migration-testing--legacy-retirement)
- [Final Directory Structure](#final-directory-structure)
- [Execution Summary](#execution-summary)

---

## Background & Assessment

### Current State Comparison

| Aspect | AI Content Generator (aigen) | Media Kit Builder (mk4) |
|--------|------------------------------|-------------------------|
| **Framework** | Vanilla JavaScript | Vue.js 3.4 + Pinia |
| **Build System** | None (direct loading) | Vite 5.0 |
| **Backend** | WordPress AJAX | WordPress REST API v2 |
| **Architecture** | Event-driven, service-oriented | Component-based, store-driven |
| **State Management** | Post meta + simple events | Pinia stores |
| **Components** | 6 generators | 18 components |

### Overlapping Content Types

Both systems handle the same content:
- Biography → Biography component in mk4
- Topics → Topics component in mk4
- Questions → Questions component in mk4
- Guest Intro → Guest-intro component in mk4

### Why Vue Conversion Makes Sense

| Benefit | Impact |
|---------|--------|
| **Unified state management** | AI-generated content updates Pinia stores directly |
| **Shared component library** | Editor panels embed AI generation buttons seamlessly |
| **Single build pipeline** | One Vite build, one deployment |
| **Consistent API layer** | Both use REST API v2 with same patterns |
| **Shared design system** | mk4's design tokens replace 223KB CSS file |
| **SEO/Marketing** | Free tools drive traffic and conversions |

---

## Architecture Overview

### Dual-Mode Component Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHARED CODEBASE (mk4)                        │
├─────────────────────────────────────────────────────────────────┤
│  Composables: useAIGenerator, useAIBiography, useAuthorityHook  │
│  Store: ai.js (Pinia)                                           │
│  Components: BiographyGenerator.vue, TopicsGenerator.vue, etc.  │
├─────────────────────────────────────────────────────────────────┤
│                              │                                   │
│         ┌────────────────────┴────────────────────┐             │
│         ▼                                         ▼              │
│  ┌─────────────────┐                    ┌─────────────────┐     │
│  │ INTEGRATED MODE │                    │ STANDALONE MODE │     │
│  │   (Builder)     │                    │  (Free Tools)   │     │
│  ├─────────────────┤                    ├─────────────────┤     │
│  │ • Auth required │                    │ • No auth       │     │
│  │ • Saves to      │                    │ • Copy to       │     │
│  │   Pinia Store   │                    │   clipboard     │     │
│  │ • 10/hr limit   │                    │ • 3/hr limit    │     │
│  │ • Full builder  │                    │ • Lead gen CTA  │     │
│  │   bundle        │                    │ • Lightweight   │     │
│  │   (~300KB)      │                    │   bundle (~50KB)│     │
│  └─────────────────┘                    └─────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### Edge Cases Addressed

| Concern | Resolution | Phase |
|---------|------------|-------|
| **CSS Isolation** | Scoped `.gmkb-standalone-scope` wrapper class + minimal standalone CSS build | Phase 3 & 4 |
| **Pinia Initialization** | Explicit Pinia instance creation in standalone entry point | Phase 4 |
| **Public API Security** | Public nonce generation on shortcode render + validation in controller | Phase 1 |
| **Vite Tree-Shaking** | Explicit entry point with no Builder imports + rollup external config | Phase 4 |

---

## Phase 1: Backend API Unification (PHP Layer)

**Goal:** Expose the existing robust OpenAI service via a standardized REST API that handles both authenticated and public traffic with proper security.

### 1.1 Create Unified REST Controller

- **File:** `mk4/includes/api/v2/class-gmkb-ai-controller.php`
- **Endpoint:** `POST /wp-json/gmkb/v2/ai/generate`

**Request Schema:**
```json
{
  "type": "biography|topics|questions|tagline|guest_intro|offers|authority_hook",
  "params": {
    "name": "...",
    "expertise": "...",
    "tone": "professional|casual|inspirational",
    "length": "short|medium|long"
  },
  "context": "builder|public",
  "nonce": "abc123..."
}
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "content": "Generated content...",
    "type": "biography",
    "metadata": {
      "tokens_used": 150,
      "model": "gpt-4o-mini"
    }
  },
  "usage": {
    "remaining": 2,
    "reset_time": 3600
  }
}
```

### 1.2 Implement Dual-Layer Security

#### Authentication Matrix

| Context | Nonce Type | Rate Limit | Capabilities |
|---------|------------|------------|--------------|
| **Builder** | `wp_rest` (standard WP) | 10/hour per user | `edit_posts` required |
| **Public** | `gmkb_public_ai` (custom) | 3/hour per IP | None required |

#### Public Nonce Strategy

```php
// In shortcode render (class-gmkb-free-tools-shortcode.php)
$public_nonce = wp_create_nonce('gmkb_public_ai');
// Pass to JavaScript via wp_localize_script

// In controller validation
public function validate_public_request($request) {
    $nonce = $request->get_param('nonce');

    // Verify the nonce came from our shortcode page
    if (!wp_verify_nonce($nonce, 'gmkb_public_ai')) {
        return new WP_Error(
            'invalid_nonce',
            'Invalid security token. Please refresh the page.',
            ['status' => 403]
        );
    }

    // Then check IP rate limit
    return $this->check_ip_rate_limit();
}
```

#### Rate Limiting Implementation

```php
private function check_ip_rate_limit() {
    $ip = $this->get_client_ip();
    $transient_key = 'gmkb_ai_limit_' . md5($ip);
    $usage = get_transient($transient_key) ?: ['count' => 0, 'first_request' => time()];

    if ($usage['count'] >= 3) {
        $reset_in = 3600 - (time() - $usage['first_request']);
        return new WP_Error(
            'rate_limited',
            "Free usage limit reached. Resets in {$reset_in} seconds.",
            ['status' => 429, 'reset_time' => $reset_in]
        );
    }

    $usage['count']++;
    set_transient($transient_key, $usage, 3600);

    return true;
}
```

### 1.3 Port MKCG_API_Service to mk4

| Source (aigen) | Destination (mk4) |
|----------------|-------------------|
| `class-mkcg-api-service.php` | `class-gmkb-ai-service.php` |
| `class-mkcg-config.php` | `class-gmkb-ai-config.php` |
| Generator-specific prompts | Consolidated into config |

**Modifications:**
- Remove aigen plugin dependencies
- Update namespace to `GMKB\Services`
- Keep all prompt engineering intact
- Add method to return token usage metadata

### 1.4 Phase 1 Deliverables

- [ ] `includes/api/v2/class-gmkb-ai-controller.php` - REST endpoint with dual auth
- [ ] `includes/services/class-gmkb-ai-service.php` - OpenAI API wrapper
- [ ] `includes/services/class-gmkb-ai-config.php` - Prompts and field mappings
- [ ] Public nonce generation hook
- [ ] IP-based rate limiting with transients
- [ ] Response headers with usage info (`X-RateLimit-Remaining`, `X-RateLimit-Reset`)
- [ ] PHPUnit tests for API endpoints

---

## Phase 2: Headless Logic Migration (Vue Composables)

**Goal:** Move the business logic into reusable Vue Composables that work in both contexts.

### 2.1 Create Core AI Composable

**File:** `mk4/src/composables/useAIGenerator.js`

```javascript
import { ref, computed } from 'vue'
import { useAIStore } from '@/stores/ai'

export function useAIGenerator(type) {
  // State
  const isGenerating = ref(false)
  const generatedContent = ref(null)
  const error = ref(null)
  const usageRemaining = ref(null)
  const resetTime = ref(null)

  // Store access (works in both modes due to Phase 4 Pinia setup)
  const aiStore = useAIStore()

  // Check cache first
  const getCacheKey = (params) => {
    return `${type}_${JSON.stringify(params)}`
  }

  async function generate(params, context = 'public') {
    const cacheKey = getCacheKey(params)

    // Check cache (30 min TTL)
    const cached = aiStore.getCachedResult(cacheKey)
    if (cached) {
      generatedContent.value = cached
      return cached
    }

    isGenerating.value = true
    error.value = null

    try {
      const response = await fetch(`${window.gmkbData?.restUrl || '/wp-json/'}gmkb/v2/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.gmkbData?.restNonce || ''
        },
        body: JSON.stringify({
          type,
          params,
          context,
          nonce: window.gmkbPublicNonce || ''
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Generation failed')
      }

      generatedContent.value = data.data.content
      usageRemaining.value = data.usage?.remaining
      resetTime.value = data.usage?.reset_time

      // Cache result
      aiStore.cacheResult(cacheKey, data.data.content)

      // Add to history
      aiStore.addToHistory({ type, params, content: data.data.content })

      return data.data.content
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  function validateFields(fields, requiredFields) {
    const missing = requiredFields.filter(f => !fields[f]?.trim())
    if (missing.length > 0) {
      return { valid: false, message: `Required: ${missing.join(', ')}` }
    }
    return { valid: true }
  }

  async function copyToClipboard() {
    if (generatedContent.value) {
      await navigator.clipboard.writeText(generatedContent.value)
      return true
    }
    return false
  }

  function reset() {
    generatedContent.value = null
    error.value = null
  }

  return {
    isGenerating,
    generatedContent,
    error,
    usageRemaining,
    resetTime,
    generate,
    validateFields,
    copyToClipboard,
    reset
  }
}
```

### 2.2 Create Pinia Store for AI State

**File:** `mk4/src/stores/ai.js`

```javascript
import { defineStore } from 'pinia'

export const useAIStore = defineStore('ai', {
  state: () => ({
    // Generation history (last 10)
    generationHistory: [],

    // Cache with TTL (key -> { content, timestamp })
    cachedResults: {},

    // Shared Authority Hook data (persists across generators)
    authorityHook: {
      who: '',
      what: '',
      when: '',
      how: '',
      where: '',
      why: ''
    },

    // Shared Impact Intro data
    impactIntro: {
      credentials: [],
      achievements: []
    },

    // User preferences
    preferences: {
      defaultTone: 'professional',
      defaultLength: 'medium',
      defaultPOV: 'third'
    }
  }),

  getters: {
    authorityHookSummary: (state) => {
      const parts = []
      if (state.authorityHook.who) parts.push(state.authorityHook.who)
      if (state.authorityHook.what) parts.push(`who ${state.authorityHook.what}`)
      return parts.join(' ')
    }
  },

  actions: {
    getCachedResult(key) {
      const cached = this.cachedResults[key]
      if (!cached) return null

      // Check TTL (30 minutes)
      const age = Date.now() - cached.timestamp
      if (age > 30 * 60 * 1000) {
        delete this.cachedResults[key]
        return null
      }

      return cached.content
    },

    cacheResult(key, content) {
      this.cachedResults[key] = {
        content,
        timestamp: Date.now()
      }
    },

    addToHistory(entry) {
      this.generationHistory.unshift({
        ...entry,
        timestamp: Date.now()
      })
      if (this.generationHistory.length > 10) {
        this.generationHistory.pop()
      }
    },

    updateAuthorityHook(field, value) {
      this.authorityHook[field] = value
    },

    setAuthorityHook(hook) {
      this.authorityHook = { ...this.authorityHook, ...hook }
    }
  }
})
```

### 2.3 Generator-Specific Composables

| Composable | Source File | Specific Features |
|------------|-------------|-------------------|
| `useAIBiography.js` | `biography-generator.js` | POV selection, length variants, tone |
| `useAITopics.js` | `topics-generator.js` | 5 topics, expertise integration |
| `useAIQuestions.js` | `questions-generator.js` | 25 questions, topic-based |
| `useAITagline.js` | `tagline-generator.js` | Multiple options, character limits |
| `useAIGuestIntro.js` | `guest-intro-generator.js` | Credential weaving |
| `useAIOffers.js` | `offers-generator.js` | Package structure |
| `useAuthorityHook.js` | `authority-hook-builder.js` | 6W framework, validation |
| `useImpactIntro.js` | `impact-intro-builder.js` | Credential management |

### 2.4 Phase 2 Deliverables

- [x] `src/composables/useAIGenerator.js` - Core generation logic
- [x] `src/stores/ai.js` - Pinia store
- [x] `src/composables/useAIBiography.js` - Biography generation
- [x] `src/composables/useAITopics.js` - Topics generation
- [x] `src/composables/useAIQuestions.js` - Questions generation
- [x] `src/composables/useAITagline.js` - Tagline generation
- [x] `src/composables/useAIGuestIntro.js` - Guest intro generation
- [x] `src/composables/useAIOffers.js` - Offers/packages generation
- [x] `src/composables/useAuthorityHook.js` - Authority hook framework
- [x] `src/composables/useImpactIntro.js` - Credentials/achievements management
- [ ] Shared validation utilities in `src/utils/aiValidation.js` (validation in composables)
- [x] JSDoc type definitions for IDE support

---

## Phase 3: Dual-Mode Component Development (UI Layer)

**Goal:** Build visual widgets with CSS isolation and context-aware behavior.

### 3.1 CSS Isolation Strategy

#### Scoped Wrapper Approach

```css
/* src/styles/ai-standalone.css */

/* Reset wrapper - prevents theme bleed */
.gmkb-standalone-scope {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #1a1a1a;
  box-sizing: border-box;
}

.gmkb-standalone-scope *,
.gmkb-standalone-scope *::before,
.gmkb-standalone-scope *::after {
  box-sizing: inherit;
}

/* All component styles nested under scope */
.gmkb-standalone-scope .gmkb-ai-widget { ... }
.gmkb-standalone-scope .gmkb-ai-input { ... }
.gmkb-standalone-scope .gmkb-ai-button { ... }
```

#### BEM Naming Convention

All AI components use prefixed BEM classes:
- `.gmkb-ai-widget` (block)
- `.gmkb-ai-widget__header` (element)
- `.gmkb-ai-widget--loading` (modifier)

### 3.2 Create Base Widget Frame

**File:** `mk4/src/vue/components/ai/AiWidgetFrame.vue`

```vue
<template>
  <div :class="wrapperClass">
    <div class="gmkb-ai-widget" :class="{ 'gmkb-ai-widget--loading': isLoading }">
      <!-- Header -->
      <div class="gmkb-ai-widget__header">
        <h3 class="gmkb-ai-widget__title">{{ title }}</h3>
        <p v-if="description" class="gmkb-ai-widget__description">{{ description }}</p>
      </div>

      <!-- Input Area -->
      <div class="gmkb-ai-widget__body">
        <slot></slot>
      </div>

      <!-- Results Area -->
      <div v-if="hasResults" class="gmkb-ai-widget__results">
        <slot name="results"></slot>
      </div>

      <!-- Footer (context-aware) -->
      <div class="gmkb-ai-widget__footer">
        <slot name="footer">
          <template v-if="mode === 'integrated'">
            <button
              class="gmkb-ai-button gmkb-ai-button--secondary"
              @click="$emit('regenerate')"
              :disabled="isLoading"
            >
              Regenerate
            </button>
            <button
              class="gmkb-ai-button gmkb-ai-button--primary"
              @click="$emit('apply')"
              :disabled="!hasResults || isLoading"
            >
              Apply to {{ targetComponent }}
            </button>
          </template>

          <template v-else>
            <UsageMeter
              v-if="usageRemaining !== null"
              :remaining="usageRemaining"
              :reset-time="resetTime"
            />
            <button
              class="gmkb-ai-button gmkb-ai-button--secondary"
              @click="$emit('copy')"
              :disabled="!hasResults"
            >
              Copy to Clipboard
            </button>
            <LeadGenCTA />
          </template>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import UsageMeter from './UsageMeter.vue'
import LeadGenCTA from './LeadGenCTA.vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  mode: {
    type: String,
    default: 'standalone',
    validator: v => ['integrated', 'standalone'].includes(v)
  },
  isLoading: { type: Boolean, default: false },
  hasResults: { type: Boolean, default: false },
  targetComponent: { type: String, default: 'Media Kit' },
  usageRemaining: { type: Number, default: null },
  resetTime: { type: Number, default: null }
})

defineEmits(['apply', 'regenerate', 'copy'])

const wrapperClass = computed(() => {
  return props.mode === 'standalone' ? 'gmkb-standalone-scope' : ''
})
</script>
```

### 3.3 Shared Sub-Components

| Component | Props | Purpose |
|-----------|-------|---------|
| `ToneSelector.vue` | `modelValue`, `options` | Professional/Casual/Inspirational dropdown |
| `LengthSelector.vue` | `modelValue` | Short/Medium/Long toggle buttons |
| `POVSelector.vue` | `modelValue` | First/Second/Third person |
| `GenerateButton.vue` | `loading`, `disabled` | Loading spinner, disabled state |
| `ResultsDisplay.vue` | `content`, `format` | Formatted output with syntax highlighting |
| `UsageMeter.vue` | `remaining`, `resetTime` | "2 of 3 free generations remaining" |
| `LeadGenCTA.vue` | `variant` | "Get unlimited generations" banner |
| `ErrorMessage.vue` | `message`, `retryable` | Error display with retry option |

### 3.4 Generator Components

| Component | Inputs | Output | Status |
|-----------|--------|--------|--------|
| `BiographyGenerator.vue` | Authority Hook, Tone, Length, POV | Bio text | Primary |
| `TopicsGenerator.vue` | Authority Hook, Expertise | 5 topics | Primary |
| `QuestionsGenerator.vue` | Authority Hook, Topics | 25 questions | Primary |
| `TaglineGenerator.vue` | Authority Hook, Tone | Tagline options | Primary |
| `GuestIntroGenerator.vue` | Impact Intro, Bio, Tagline | Introduction | Primary |
| `OffersGenerator.vue` | Authority Hook, Services | Packages | Secondary |
| `AuthorityHookBuilder.vue` | 6W fields | Hook object | Shared |
| `ImpactIntroBuilder.vue` | Credentials | Intro object | Shared |

### 3.5 Phase 3 Deliverables

- [x] `AiWidgetFrame.vue` - Base container with CSS isolation
- [x] `src/styles/ai-standalone.css` - Scoped standalone styles (~450 lines)
- [x] `src/styles/ai-shared.css` - Shared styles with CSS custom properties (~400 lines)
- [x] 8 shared sub-components:
  - [x] `AiErrorMessage.vue` - Error display with retry
  - [x] `AiUsageMeter.vue` - Usage tracking display
  - [x] `AiLeadGenCta.vue` - Lead generation call-to-action
  - [x] `AiToneSelector.vue` - Tone toggle buttons
  - [x] `AiLengthSelector.vue` - Length toggle buttons
  - [x] `AiPovSelector.vue` - POV toggle buttons
  - [x] `AiGenerateButton.vue` - Generate with loading state
  - [x] `AiResultsDisplay.vue` - Results in text/list/cards format
- [x] 8 generator components:
  - [x] `BiographyGenerator.vue` - Biography generation with length variants
  - [x] `TopicsGenerator.vue` - 5 speaking topics
  - [x] `QuestionsGenerator.vue` - 25 categorized questions
  - [x] `TaglineGenerator.vue` - Tagline options with selection
  - [x] `GuestIntroGenerator.vue` - Host-ready introductions
  - [x] `OffersGenerator.vue` - Tiered service packages
  - [x] `AuthorityHookBuilder.vue` - 6W framework builder
  - [x] `ImpactIntroBuilder.vue` - Credentials/achievements manager
- [x] `src/vue/components/ai/index.js` - Component exports
- [ ] Unit tests for each component (deferred to Phase 5)

---

## Phase 4: Deployment & Wiring

**Goal:** Wire up both deployment contexts with proper Pinia initialization and optimized builds.

### 4.1 Builder Integration (Integrated Mode)

#### Add AI Tab to Sidebar

**Modify:** `mk4/src/vue/components/Sidebar.vue`

```vue
<SidebarTab
  id="ai-assistant"
  label="AI Assistant"
  icon="sparkles"
>
  <AiAssistantPanel :selected-component="selectedComponent" />
</SidebarTab>
```

#### AI Assistant Panel

**File:** `mk4/src/vue/components/ai/AiAssistantPanel.vue`

```vue
<template>
  <div class="gmkb-ai-panel">
    <BiographyGenerator
      v-if="selectedComponent?.type === 'biography'"
      mode="integrated"
      :component-id="selectedComponent.id"
    />
    <TopicsGenerator
      v-else-if="selectedComponent?.type === 'topics'"
      mode="integrated"
      :component-id="selectedComponent.id"
    />

    <template v-else>
      <Accordion>
        <AccordionItem title="Biography Generator">
          <BiographyGenerator mode="integrated" />
        </AccordionItem>
      </Accordion>
    </template>
  </div>
</template>
```

#### Inline Editor Buttons

**Modify:** Each editor (e.g., `BiographyEditor.vue`)

```vue
<button
  class="gmkb-editor-ai-button"
  @click="showAiModal = true"
>
  Generate with AI
</button>

<AiModal v-model="showAiModal">
  <BiographyGenerator
    mode="integrated"
    :component-id="componentId"
    @applied="showAiModal = false"
  />
</AiModal>
```

### 4.2 Standalone Build Configuration

#### Vite Config for SEO Tools

**File:** `mk4/vite.seo-tools.config.js`

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'src/seo-tools-entry.js'),
      name: 'GMKBSeoTools',
      fileName: 'seo-tools',
      formats: ['iife']
    },

    outDir: 'dist/seo-tools',

    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
        globals: {}
      }
    },

    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  define: {
    __STANDALONE_MODE__: true
  }
})
```

#### Standalone Entry Point with Pinia

**File:** `mk4/src/seo-tools-entry.js`

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Only import AI components - NOT the full builder
import BiographyGenerator from './vue/components/ai/BiographyGenerator.vue'
import TopicsGenerator from './vue/components/ai/TopicsGenerator.vue'
import QuestionsGenerator from './vue/components/ai/QuestionsGenerator.vue'
import TaglineGenerator from './vue/components/ai/TaglineGenerator.vue'
import GuestIntroGenerator from './vue/components/ai/GuestIntroGenerator.vue'
import OffersGenerator from './vue/components/ai/OffersGenerator.vue'

import './styles/ai-standalone.css'

const components = {
  biography: BiographyGenerator,
  topics: TopicsGenerator,
  questions: QuestionsGenerator,
  tagline: TaglineGenerator,
  'guest-intro': GuestIntroGenerator,
  offers: OffersGenerator
}

const mountedApps = new Map()

window.GMKBSeoTools = {
  mount(elementId, type, options = {}) {
    const Component = components[type]

    if (!Component) {
      console.error(`[GMKB] Unknown generator type: ${type}`)
      return null
    }

    const container = document.getElementById(elementId)
    if (!container) {
      console.error(`[GMKB] Element not found: #${elementId}`)
      return null
    }

    const app = createApp(Component, {
      mode: 'standalone',
      ...options
    })

    // CRITICAL: Create and attach Pinia instance
    const pinia = createPinia()
    app.use(pinia)

    const instance = app.mount(container)
    mountedApps.set(elementId, { app, pinia })

    return { app, instance, pinia }
  },

  unmount(elementId) {
    const mounted = mountedApps.get(elementId)
    if (mounted) {
      mounted.app.unmount()
      mountedApps.delete(elementId)
    }
  },

  getTypes() {
    return Object.keys(components)
  },

  version: '1.0.0'
}

// Auto-init widgets with data attributes
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-gmkb-tool]').forEach(el => {
    const type = el.dataset.gmkbTool
    const id = el.id || `gmkb-tool-${Math.random().toString(36).substr(2, 9)}`
    el.id = id

    window.GMKBSeoTools.mount(id, type, {
      title: el.dataset.gmkbTitle
    })
  })
})
```

### 4.3 WordPress Shortcode with Nonce

**File:** `mk4/includes/shortcodes/class-gmkb-free-tools-shortcode.php`

```php
<?php
namespace GMKB\Shortcodes;

class Free_Tools_Shortcode {

    private static $instance = null;
    private $enqueued = false;

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_shortcode('gmkb_free_tool', [$this, 'render']);
    }

    public function render($atts) {
        $atts = shortcode_atts([
            'type'  => 'biography',
            'title' => '',
            'class' => ''
        ], $atts, 'gmkb_free_tool');

        $valid_types = ['biography', 'topics', 'questions', 'tagline', 'guest-intro', 'offers'];
        if (!in_array($atts['type'], $valid_types)) {
            return '<!-- Invalid GMKB tool type -->';
        }

        $this->enqueue_assets();

        $unique_id = 'gmkb-free-tool-' . wp_generate_uuid4();

        $classes = 'gmkb-free-tool-container';
        if (!empty($atts['class'])) {
            $classes .= ' ' . esc_attr($atts['class']);
        }

        $html = sprintf(
            '<div id="%s" class="%s" data-gmkb-tool="%s" data-gmkb-title="%s"></div>',
            esc_attr($unique_id),
            esc_attr($classes),
            esc_attr($atts['type']),
            esc_attr($atts['title'])
        );

        return $html;
    }

    private function enqueue_assets() {
        if ($this->enqueued) {
            return;
        }

        wp_enqueue_style(
            'gmkb-seo-tools',
            GMKB_PLUGIN_URL . 'dist/seo-tools/seo-tools.css',
            [],
            GMKB_VERSION
        );

        wp_enqueue_script(
            'gmkb-seo-tools',
            GMKB_PLUGIN_URL . 'dist/seo-tools/seo-tools.iife.js',
            [],
            GMKB_VERSION,
            true
        );

        // CRITICAL: Pass public nonce to JavaScript
        wp_localize_script('gmkb-seo-tools', 'gmkbPublicData', [
            'restUrl'     => rest_url('gmkb/v2/'),
            'publicNonce' => wp_create_nonce('gmkb_public_ai'),
            'siteUrl'     => home_url(),
            'signupUrl'   => home_url('/pricing/'),
        ]);

        $this->enqueued = true;
    }
}

Free_Tools_Shortcode::instance();
```

### 4.4 Build Commands

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:seo-tools": "vite build --config vite.seo-tools.config.js",
    "build:profile": "vite build --config vite.profile.config.js",
    "build:all": "npm run build && npm run build:seo-tools && npm run build:profile",
    "analyze:seo-tools": "vite build --config vite.seo-tools.config.js --mode analyze"
  }
}
```

### 4.5 Actual Bundle Sizes (Validated)

| Bundle | Contents | Size | Gzipped |
|--------|----------|------|---------|
| `gmkb.iife.js` | Full builder | 1,059 KB | 303 KB |
| `gmkb-seo-tools.iife.js` | AI widgets only | 122 KB | 41 KB |
| `gmkb-seo-tools.css` | Scoped styles | 26 KB | 5 KB |

### 4.6 Phase 4 Deliverables

- [x] `src/vue/components/ai/AiAssistantPanel.vue` - Sidebar panel with context-aware generators
- [x] `src/vue/components/ai/AiModal.vue` - Editor modal wrapper with Teleport
- [x] `vite.seo-tools.config.js` - Optimized build config
- [x] `src/seo-tools-entry.js` - Standalone entry with auto-mount and MutationObserver
- [x] `package.json` updated with `build:seo-tools` scripts
- [x] Component exports updated in `index.js`
- [x] AI buttons added to 5 editor components:
  - [x] BiographyEditor.vue - Generate Biography
  - [x] TopicsEditor.vue - Generate Topics
  - [x] QuestionsEditor.vue - Generate Questions
  - [x] GuestIntroEditor.vue - Generate Introduction
  - [x] HeroEditor.vue - Generate Tagline
- [x] `includes/shortcodes/class-gmkb-free-tools-shortcode.php` - Created in Phase 1
- [x] Asset enqueueing with public nonce - Created in Phase 1
- [x] Bundle size validation - COMPLETE

---

## Phase 5: Migration, Testing & Legacy Retirement

**Goal:** Validate, migrate existing users, document, and remove legacy code.

### 5.1 Testing Strategy

#### Unit Tests (Vitest)

```javascript
describe('useAIGenerator', () => {
  it('should generate content and cache result', async () => { ... })
  it('should return cached result if available', async () => { ... })
  it('should handle API errors gracefully', async () => { ... })
  it('should track usage remaining', async () => { ... })
})
```

| Test Area | Coverage Target |
|-----------|-----------------|
| Composables | 90% |
| Pinia stores | 90% |
| API endpoints | 80% |
| Vue components | 70% |

#### Integration Tests

- [ ] Builder: Generate → Apply → Verify in store
- [ ] Public: Generate → Copy → Verify clipboard
- [ ] Rate limiting: Hit limit → See error → Wait → Retry
- [ ] Nonce: Invalid nonce → 403 error

#### E2E Tests (Cypress)

```javascript
describe('AI Tools', () => {
  describe('Builder Integration', () => {
    it('generates biography and applies to component', () => {
      cy.login()
      cy.visit('/media-kit-builder/')
      cy.get('[data-cy=add-biography]').click()
      cy.get('[data-cy=ai-generate-button]').click()
      cy.get('[data-cy=authority-who]').type('John Smith')
      cy.get('[data-cy=generate]').click()
      cy.get('[data-cy=results]').should('be.visible')
      cy.get('[data-cy=apply]').click()
      cy.get('[data-cy=biography-content]').should('contain', 'John Smith')
    })
  })

  describe('Public Free Tool', () => {
    it('generates content and allows copy', () => {
      cy.visit('/free-tools/biography-generator/')
      // ...
    })

    it('shows rate limit after 3 uses', () => {
      // ...
    })
  })
})
```

### 5.2 Data Migration

**File:** `mk4/includes/migrations/class-aigen-migration.php`

```php
class Aigen_Migration {

    public function maybe_migrate() {
        if (get_option('gmkb_aigen_migrated')) {
            return;
        }

        $migrated = $this->migrate_all_posts();

        update_option('gmkb_aigen_migrated', [
            'date'  => current_time('mysql'),
            'count' => $migrated
        ]);
    }

    private function migrate_all_posts() {
        // Find posts with aigen data
        // Map to new format
        // Update post meta
    }
}
```

### 5.3 Legacy Retirement Checklist

After validation (minimum 2 weeks in production):

#### Files to Remove from aigen

- [ ] `assets/js/generators/*.js` (8 files, ~300KB)
- [ ] `assets/js/authority-hook-builder.js` (27KB)
- [ ] `assets/js/impact-intro-builder.js` (25KB)
- [ ] `assets/js/simple-event-bus.js`
- [ ] `assets/css/generators/*.css`
- [ ] `assets/css/mkcg-unified-styles.css` (223KB)

#### Files to Archive (keep for reference)

- [ ] `templates/` - HTML templates
- [ ] `docs/` - Technical documentation
- [ ] `includes/generators/` - PHP generators (prompt logic already ported)

#### Plugin Status

- [ ] Add deprecation notice to aigen plugin
- [ ] Point users to mk4 for AI features
- [ ] Eventually deactivate aigen entirely

### 5.4 Documentation

#### Developer Docs

- [ ] "Adding a New AI Generator" guide
- [ ] Composable API reference
- [ ] Shortcode usage guide

#### User Docs

- [ ] "Using AI to Generate Content" help article
- [ ] Free tools landing page copy
- [ ] FAQ for rate limits

### 5.5 Phase 5 Deliverables

- [x] Vitest unit test suite - `tests/unit/composables/useAIGenerator.spec.js` (25+ tests)
- [x] Vitest unit test suite - `tests/unit/stores/ai.spec.js` (40+ tests)
- [x] Cypress E2E test suite - `cypress/e2e/ai-generators.cy.js` (20+ tests)
- [x] Migration script with rollback - `includes/migrations/class-gmkb-aigen-migration.php`
- [x] Deprecation notices in aigen - `aigen/includes/deprecation-notice.php`
- [x] Developer documentation - `docs/AI-GENERATORS-DEVELOPER-GUIDE.md`
- [x] User documentation - `docs/AI-GENERATORS-USER-GUIDE.md`
- [ ] Legacy file removal PR (defer until 2 weeks production validation)

---

## Final Directory Structure

```
mk4/
├── src/
│   ├── composables/
│   │   ├── useAIGenerator.js           # Core AI logic
│   │   ├── useAIBiography.js
│   │   ├── useAITopics.js
│   │   ├── useAIQuestions.js
│   │   ├── useAITagline.js
│   │   ├── useAIGuestIntro.js
│   │   ├── useAIOffers.js
│   │   ├── useAuthorityHook.js
│   │   └── useImpactIntro.js
│   ├── stores/
│   │   ├── ai.js                       # AI state (NEW)
│   │   ├── mediaKit.js                 # Extended
│   │   └── [existing stores]
│   ├── vue/components/
│   │   ├── ai/                         # NEW DIRECTORY
│   │   │   ├── AiWidgetFrame.vue       # Base container
│   │   │   ├── AiAssistantPanel.vue    # Sidebar panel
│   │   │   ├── AiModal.vue             # Editor modal
│   │   │   ├── BiographyGenerator.vue
│   │   │   ├── TopicsGenerator.vue
│   │   │   ├── QuestionsGenerator.vue
│   │   │   ├── TaglineGenerator.vue
│   │   │   ├── GuestIntroGenerator.vue
│   │   │   ├── OffersGenerator.vue
│   │   │   ├── AuthorityHookBuilder.vue
│   │   │   ├── ImpactIntroBuilder.vue
│   │   │   ├── ToneSelector.vue
│   │   │   ├── LengthSelector.vue
│   │   │   ├── POVSelector.vue
│   │   │   ├── GenerateButton.vue
│   │   │   ├── ResultsDisplay.vue
│   │   │   ├── UsageMeter.vue
│   │   │   ├── LeadGenCTA.vue
│   │   │   └── ErrorMessage.vue
│   │   ├── Sidebar.vue                 # Updated
│   │   └── [existing editors]          # Updated with AI buttons
│   ├── styles/
│   │   ├── ai-shared.css               # Shared AI styles
│   │   └── ai-standalone.css           # Scoped standalone styles
│   ├── utils/
│   │   └── aiValidation.js             # Shared validation
│   ├── seo-tools-entry.js              # Standalone entry
│   └── main.js                         # Builder entry
├── includes/
│   ├── api/v2/
│   │   ├── class-gmkb-ai-controller.php  # NEW
│   │   └── class-gmkb-rest-api-v2.php
│   ├── services/
│   │   ├── class-gmkb-ai-service.php     # Ported from aigen
│   │   └── class-gmkb-ai-config.php      # Ported from aigen
│   ├── shortcodes/
│   │   └── class-gmkb-free-tools-shortcode.php  # NEW
│   └── migrations/
│       └── class-aigen-migration.php     # NEW
├── dist/
│   ├── gmkb.iife.js                    # Full builder (~300KB)
│   ├── gmkb.css
│   └── seo-tools/
│       ├── seo-tools.iife.js           # AI only (~50KB)
│       └── seo-tools.css
├── tests/
│   ├── unit/
│   │   ├── composables/
│   │   └── stores/
│   └── e2e/
│       └── ai-tools.cy.js
├── vite.config.js
├── vite.seo-tools.config.js            # NEW
└── package.json
```

---

## Execution Summary

| Phase | Focus | Key Deliverables | Dependencies |
|-------|-------|------------------|--------------|
| **Phase 1** | Backend API | REST controller, AI service, rate limiting, public nonce | None |
| **Phase 2** | Business Logic | Vue composables, Pinia store | Phase 1 |
| **Phase 3** | UI Components | 8 generators, CSS isolation | Phase 2 |
| **Phase 4** | Deployment | Builder integration, shortcodes, dual builds | Phase 3 |
| **Phase 5** | Cleanup | Testing, migration, legacy removal | Phase 4 |

---

## Benefits Summary

| Benefit | Description |
|---------|-------------|
| **Single Codebase** | Fix a bug once, it's fixed in builder AND free tools |
| **SEO/Lead Gen** | Free tools drive traffic → conversions |
| **Consistent UX** | Free tools ARE the premium product (just limited) |
| **CSS Safety** | Scoped styles prevent theme conflicts |
| **Proper Initialization** | Each standalone widget gets its own Pinia |
| **API Security** | Public nonce prevents direct CURL abuse |
| **Optimized Bundles** | Tree-shaking ensures minimal standalone size |
| **Maintainability** | Modern Vue 3 + Composition API |
| **Testability** | Composables are easy to unit test |

---

## Approval Status

- **Plan Approved:** Yes
- **Phase 1 Approved:** Yes (with public nonce security)
- **Phase 1 Status:** COMPLETE
- **Phase 2 Approved:** Yes
- **Phase 2 Status:** COMPLETE
- **Phase 3 Approved:** Yes
- **Phase 3 Status:** COMPLETE
- **Phase 4 Approved:** Yes
- **Phase 4 Status:** COMPLETE
- **Phase 5 Approved:** Yes
- **Phase 5 Status:** COMPLETE
- **Integration Status:** FINISHED - All phases complete

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2024 | Initial plan created |
| 1.1 | Dec 2024 | Added edge case refinements (CSS isolation, Pinia init, public nonce, tree-shaking) |
| 1.2 | Dec 2024 | **Phase 1 COMPLETE** - Created AI Controller, AI Service, AI Config, Free Tools Shortcode |
| 1.3 | Dec 2024 | **Phase 2 COMPLETE** - Created 10 Vue composables: useAIGenerator, useAIBiography, useAITopics, useAIQuestions, useAITagline, useAIGuestIntro, useAIOffers, useAuthorityHook, useImpactIntro, and ai.js Pinia store |
| 1.4 | Dec 2024 | **Phase 3 COMPLETE** - Created 17 Vue components: AiWidgetFrame, 8 shared sub-components, 8 generator/builder components, plus ai-standalone.css and ai-shared.css |
| 1.5 | Dec 2024 | **Phase 4 IN PROGRESS** - Created AiAssistantPanel.vue, AiModal.vue, vite.seo-tools.config.js, seo-tools-entry.js, updated package.json with build scripts |
| 1.6 | Dec 2024 | **Phase 4 COMPLETE** - Added AI buttons to 5 editor components (Biography, Topics, Questions, GuestIntro, Hero). Validated bundle sizes: SEO tools 41KB gzipped, main builder 303KB gzipped |
| 1.7 | Dec 2024 | **Phase 5 COMPLETE** - Created Vitest unit tests (65+ tests), Cypress E2E tests (20+ tests), migration script with rollback, deprecation notice, developer guide, and user guide. All integration phases finished. |
