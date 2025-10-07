// Test setup file
import { config } from '@vue/test-utils';
import { ref, computed } from 'vue';
import { vi } from 'vitest';

// Mock global objects that WordPress provides
global.window = global.window || {};
global.window.gmkbData = {
  postId: 123,
  postTitle: 'Test Media Kit',
  nonce: 'test-nonce',
  restUrl: 'http://test.local/wp-json/',
  restNonce: 'test-rest-nonce',
  ajaxUrl: 'http://test.local/wp-admin/admin-ajax.php',
  pluginUrl: 'http://test.local/wp-content/plugins/gmkb/',
  environment: 'test',
  version: '2.0.0',
  timestamp: Date.now()
};

// PHASE 2 FIX: Comprehensive Pods composable mock
// This prevents "Cannot read properties of undefined (reading 'value')" errors

// Mock function that returns all Pods refs
const createPodsMock = () => ({
  // Raw Pods data ref (most important for tests)
  rawPodsData: ref({}),
  
  // Basic information (matches actual composable)
  biography: ref(''),
  firstName: ref(''),
  lastName: ref(''),
  email: ref(''),
  phone: ref(''),
  fullName: ref(''),
  
  // Arrays
  topics: ref([]),
  questions: ref([]),
  
  // Social links object
  socialLinks: ref({}),
  
  // Professional object
  professional: ref({}),
  
  // Individual professional fields
  position: ref(''),
  company: ref(''),
  
  // Stats object
  stats: ref({}),
  
  // Media object
  media: ref({}),
  
  // Helper methods
  getField: () => ref(''),
  isLoaded: ref(false),
  allData: ref({})
});

// Mock with @ alias (for src imports)
vi.mock('@/composables/usePodsData', () => ({
  usePodsData: createPodsMock
}));

// Mock with relative path (for component imports)
vi.mock('../../src/composables/usePodsData', () => ({
  usePodsData: createPodsMock
}));

// Provide default mocks for Vue provide/inject
config.global.provide = {
  podsData: ref({}),
  mediaKitStore: {
    podsData: {},
    components: {}
  }
};

// Mock WordPress API
global.wp = {
  ajax: {
    post: vi.fn(),
    send: vi.fn()
  },
  api: {
    models: {},
    collections: {}
  }
};

// Suppress Vue warnings in tests
config.global.config.warnHandler = () => null;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
