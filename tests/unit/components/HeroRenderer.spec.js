import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import HeroRenderer from '../../../components/hero/HeroRenderer.vue';

describe('HeroRenderer', () => {
  let wrapper;
  let store;

  const defaultProps = {
    componentId: 'hero-test-1',
    data: {
      title: 'Test Hero Title',
      subtitle: 'Test Subtitle',
      description: 'Test description text',
      imageUrl: 'https://example.com/image.jpg',
      primaryButtonText: 'Get Started',
      primaryButtonUrl: 'https://example.com/contact'
    }
  };

  beforeEach(() => {
    wrapper = mount(HeroRenderer, {
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
      expect(wrapper.find('.gmkb-hero-component').exists()).toBe(true);
    });

    it('displays title when provided', () => {
      expect(wrapper.find('.hero-title').text()).toBe('Test Hero Title');
    });

    it('displays subtitle when provided', () => {
      expect(wrapper.find('.hero-subtitle').text()).toBe('Test Subtitle');
    });

    it('displays description when provided', () => {
      expect(wrapper.find('.hero-description').text()).toBe('Test description text');
    });

    it('displays image when provided', () => {
      const img = wrapper.find('.hero-image img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toBe('https://example.com/image.jpg');
      expect(img.attributes('alt')).toContain('Test Hero Title');
    });

    it('displays button when text provided', () => {
      const button = wrapper.find('.hero-button.primary');
      expect(button.exists()).toBe(true);
      expect(button.text()).toBe('Get Started');
    });

    it('hides image when not provided', async () => {
      await wrapper.setProps({
        data: {
          ...defaultProps.data,
          imageUrl: ''
        }
      });
      expect(wrapper.find('.hero-image').exists()).toBe(false);
    });

    it('uses fallback title when not provided', async () => {
      await wrapper.setProps({
        data: {}
      });
      expect(wrapper.find('.hero-title').text()).toBe('Welcome to Our Media Kit');
    });
  });

  describe('Props Handling', () => {
    it('handles alternative prop names (headline)', async () => {
      await wrapper.setProps({
        data: {
          headline: 'Alternative Title'
        }
      });
      expect(wrapper.find('.hero-title').text()).toBe('Alternative Title');
    });

    it('handles multiple button configurations', async () => {
      await wrapper.setProps({
        data: {
          primaryButtonText: 'Primary',
          primaryButtonUrl: '#primary',
          secondaryButtonText: 'Secondary',
          secondaryButtonUrl: '#secondary'
        }
      });
      
      const buttons = wrapper.findAll('.hero-button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].text()).toBe('Primary');
      expect(buttons[1].text()).toBe('Secondary');
      expect(buttons[1].classes()).toContain('secondary');
    });

    it('handles buttons array format', async () => {
      await wrapper.setProps({
        data: {
          buttons: [
            { text: 'Button 1', url: '#1', style: 'primary' },
            { text: 'Button 2', url: '#2', style: 'secondary' }
          ]
        }
      });
      
      const buttons = wrapper.findAll('.hero-button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0].text()).toBe('Button 1');
      expect(buttons[1].text()).toBe('Button 2');
    });
  });

  describe('User Interactions', () => {
    it('emits button-click event when button clicked', async () => {
      // Mock window.location to avoid jsdom navigation warning
      delete window.location;
      window.location = { href: '' };
      
      const button = wrapper.find('.hero-button.primary');
      await button.trigger('click');
      
      expect(wrapper.emitted('button-click')).toBeTruthy();
      expect(wrapper.emitted('button-click')[0][0]).toEqual({
        text: 'Get Started',
        url: 'https://example.com/contact',
        style: 'primary'
      });
    });

    it('opens URL in new tab when target="_blank"', async () => {
      const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

      await wrapper.setProps({
        data: {
          buttons: [
            { 
              text: 'External Link', 
              url: 'https://external.com', 
              target: '_blank',
              style: 'primary'
            }
          ]
        }
      });

      const button = wrapper.find('.hero-button');
      await button.trigger('click');
      
      expect(windowOpen).toHaveBeenCalledWith('https://external.com', '_blank');
      windowOpen.mockRestore();
    });

    it('does not navigate when button URL is #', async () => {
      const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
      
      await wrapper.setProps({
        data: {
          buttons: [
            { text: 'No Action', url: '#', style: 'primary' }
          ]
        }
      });

      const button = wrapper.find('.hero-button');
      await button.trigger('click');
      
      expect(windowOpen).not.toHaveBeenCalled();
      expect(wrapper.emitted('button-click')).toBeTruthy();
      windowOpen.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('handles missing data gracefully', () => {
      const wrapperNoData = mount(HeroRenderer, {
        props: {
          componentId: 'test',
          data: {}
        },
        global: {
          plugins: [createTestingPinia()]
        }
      });
      
      expect(wrapperNoData.find('.gmkb-hero-component').exists()).toBe(true);
      expect(wrapperNoData.find('.hero-title').text()).toBeTruthy();
    });

    it('handles null/undefined data properties', () => {
      const wrapperNullData = mount(HeroRenderer, {
        props: {
          componentId: 'test',
          data: {
            title: null,
            subtitle: undefined,
            description: ''
          }
        },
        global: {
          plugins: [createTestingPinia()]
        }
      });
      
      expect(wrapperNullData.find('.gmkb-hero-component').exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for images', () => {
      const img = wrapper.find('.hero-image img');
      expect(img.attributes('alt')).toBeTruthy();
      expect(img.attributes('alt')).toContain('Test Hero Title');
    });

    it('uses semantic HTML elements', () => {
      expect(wrapper.find('h1.hero-title').exists()).toBe(true);
      expect(wrapper.find('h2.hero-subtitle').exists()).toBe(true);
      expect(wrapper.find('p.hero-description').exists()).toBe(true);
    });

    it('buttons have proper role and text', () => {
      const button = wrapper.find('.hero-button');
      expect(button.element.tagName.toLowerCase()).toBe('button');
      expect(button.text()).toBeTruthy();
    });
  });
});
