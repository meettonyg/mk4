#!/usr/bin/env node

/**
 * Generate test files for all components
 * 
 * Usage: node scripts/generate-component-tests.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const components = [
  { name: 'Biography', type: 'biography', category: 'P0' },
  { name: 'Topics', type: 'topics', category: 'P0' },
  { name: 'Contact', type: 'contact', category: 'P0' },
  { name: 'Social', type: 'social', category: 'P0' },
  { name: 'Testimonials', type: 'testimonials', category: 'P1' },
  { name: 'GuestIntro', type: 'guest-intro', category: 'P1' },
  { name: 'AuthorityHook', type: 'authority-hook', category: 'P1' },
  { name: 'CallToAction', type: 'call-to-action', category: 'P1' },
  { name: 'Questions', type: 'questions', category: 'P1' },
  { name: 'PhotoGallery', type: 'photo-gallery', category: 'P2' },
  { name: 'VideoIntro', type: 'video-intro', category: 'P2' },
  { name: 'PodcastPlayer', type: 'podcast-player', category: 'P2' },
  { name: 'BookingCalendar', type: 'booking-calendar', category: 'P2' },
  { name: 'LogoGrid', type: 'logo-grid', category: 'P2' },
  { name: 'Stats', type: 'stats', category: 'P2' }
];

const testTemplate = (componentName, componentType) => `import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ${componentName}Renderer from '../../../components/${componentType}/${componentName}Renderer.vue';

describe('${componentName}Renderer', () => {
  let wrapper;

  const defaultProps = {
    componentId: '${componentType}-test-1',
    data: {
      // TODO: Add component-specific default data
    }
  };

  beforeEach(() => {
    wrapper = mount(${componentName}Renderer, {
      props: defaultProps,
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ]
      }
    });
  });

  describe('Rendering', () => {
    it('renders component correctly', () => {
      expect(wrapper.element).toBeTruthy();
    });

    it('displays content when provided', () => {
      expect(wrapper.html()).toBeTruthy();
    });

    it('handles missing data gracefully', () => {
      const wrapperNoData = mount(${componentName}Renderer, {
        props: {
          componentId: 'test',
          data: {}
        },
        global: {
          plugins: [createTestingPinia()]
        }
      });
      
      expect(wrapperNoData.element).toBeTruthy();
    });
  });

  describe('Props Handling', () => {
    it('handles all required props', () => {
      expect(wrapper.props('componentId')).toBe('${componentType}-test-1');
      expect(wrapper.props('data')).toBeDefined();
    });

    it('updates when props change', async () => {
      await wrapper.setProps({
        data: {
          updated: true
        }
      });
      expect(wrapper.props('data').updated).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles null data', () => {
      const wrapperNull = mount(${componentName}Renderer, {
        props: {
          componentId: 'test',
          data: null
        },
        global: {
          plugins: [createTestingPinia()]
        }
      });
      expect(wrapperNull.element).toBeTruthy();
    });

    it('handles undefined values', () => {
      const wrapperUndefined = mount(${componentName}Renderer, {
        props: {
          componentId: 'test',
          data: { field: undefined }
        },
        global: {
          plugins: [createTestingPinia()]
        }
      });
      expect(wrapperUndefined.element).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML', () => {
      // TODO: Add specific semantic HTML checks
      expect(wrapper.html()).toBeTruthy();
    });

    it('has proper ARIA labels where needed', () => {
      // TODO: Add ARIA label checks for interactive elements
    });
  });

  // TODO: Add component-specific tests based on functionality
  // Examples:
  // - User interactions (clicks, inputs)
  // - Computed properties
  // - Event emissions
  // - Data transformations
  // - Conditional rendering
});
`;

const testsDir = path.join(__dirname, '..', 'tests', 'unit', 'components');

// Ensure tests directory exists
if (!fs.existsSync(testsDir)) {
  fs.mkdirSync(testsDir, { recursive: true });
}

console.log('🧪 Generating test files for all components...\n');

let created = 0;
let skipped = 0;

components.forEach(({ name, type, category }) => {
  const testFile = path.join(testsDir, `${name}Renderer.spec.js`);
  
  if (fs.existsSync(testFile)) {
    console.log(`⏭️  ${category} - ${name}: Test file already exists, skipping`);
    skipped++;
  } else {
    fs.writeFileSync(testFile, testTemplate(name, type));
    console.log(`✅ ${category} - ${name}: Created ${name}Renderer.spec.js`);
    created++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Created: ${created} test files`);
console.log(`   Skipped: ${skipped} test files (already exist)`);
console.log(`   Total: ${components.length} components`);

console.log(`\n💡 Next steps:`);
console.log(`   1. Review generated test files`);
console.log(`   2. Add component-specific test data`);
console.log(`   3. Add component-specific test cases`);
console.log(`   4. Run tests: npm test`);
console.log(`   5. Check coverage: npm run test:coverage`);
