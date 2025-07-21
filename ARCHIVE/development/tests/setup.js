/**
 * Vitest Setup File
 * Configure global mocks and setup for testing environment
 */

import { vi } from 'vitest';

// Mock WordPress globals
global.wp = {
  ajax: {
    post: vi.fn().mockImplementation((action, data) => {
      return {
        done: (callback) => {
          callback({ success: true });
          return { fail: vi.fn() };
        },
        fail: vi.fn()
      };
    })
  },
  i18n: {
    __: (text) => text,
    _x: (text) => text,
    _n: (single, plural, count) => count === 1 ? single : plural
  },
  hooks: {
    addAction: vi.fn(),
    addFilter: vi.fn(),
    doAction: vi.fn(),
    applyFilters: vi.fn(() => true)
  },
  element: {
    createElement: vi.fn()
  }
};

// Mock WordPress plugin globals
global.GMKB_VERSION = '2.2.0';
global.GMKB_PLUGIN_URL = 'https://example.com/wp-content/plugins/guestify-media-kit-builder/';
global.GMKB_PLUGIN_DIR = '/var/www/html/wp-content/plugins/guestify-media-kit-builder/';
global.GUESTIFY_VERSION = '2.2.0';
global.GUESTIFY_PLUGIN_URL = 'https://example.com/wp-content/plugins/guestify-media-kit-builder/';
global.GUESTIFY_PLUGIN_DIR = '/var/www/html/wp-content/plugins/guestify-media-kit-builder/';

// Mock jQuery
global.jQuery = vi.fn(() => ({
  on: vi.fn(),
  off: vi.fn(),
  trigger: vi.fn(),
  addClass: vi.fn(),
  removeClass: vi.fn(),
  attr: vi.fn(),
  data: vi.fn(),
  append: vi.fn(),
  prepend: vi.fn(),
  html: vi.fn(),
  text: vi.fn(),
  val: vi.fn(),
  closest: vi.fn(),
  find: vi.fn(),
  parent: vi.fn(),
  parents: vi.fn(),
  children: vi.fn(),
  css: vi.fn(),
  click: vi.fn()
}));
global.$ = global.jQuery;

// Mock plugin-specific globals
global.mkPerf = {
  start: vi.fn(),
  end: vi.fn(),
  measure: vi.fn(),
  report: vi.fn()
};

// Mock localStorage for state persistence
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// Mock fetch API
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  })
);

// Mock DOM elements that might be accessed directly
global.document.getElementById = vi.fn().mockImplementation((id) => {
  return {
    innerHTML: '',
    style: {},
    className: '',
    appendChild: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    getAttribute: vi.fn(),
    setAttribute: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({
      top: 0,
      left: 0,
      width: 100,
      height: 100
    }))
  };
});

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
};

// Silence React warnings in test environment
global.console.error = vi.fn((message) => {
  if (message.includes('React does not recognize the')) return;
  if (message.includes('Invalid DOM property')) return;
  console.error(message);
});
