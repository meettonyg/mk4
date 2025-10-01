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

// Mock usePodsData composable
vi.mock('../../src/composables/usePodsData', () => ({
  usePodsData: () => ({
    biography: ref(''),
    fullName: ref(''),
    firstName: ref(''),
    lastName: ref(''),
    email: ref(''),
    phone: ref(''),
    website: ref(''),
    topics: ref([]),
    questions: ref([]),
    professional: ref({}),
    social: ref({}),
    stats: ref({}),
    headshot: ref(''),
    company: computed(() => ''),
    position: computed(() => '')
  })
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
