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

// Provide default mocks for Vue provide/inject
config.global.provide = {
  mediaKitStore: {
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
