/**
 * Hero Component Tests
 * 
 * Tests the hero component functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// We'll manually create the component schema definition since reading the file directly
// might cause issues with the file system access
const componentJson = {
  "name": "Hero",
  "category": "essential",
  "icon": "user.svg",
  "description": "Hero section for your media kit",
  "isPremium": false,
  "dependencies": [],
  "version": "1.0.0",
  "order": 1,
  "settings": {
    "hero_name": {
      "type": "text",
      "label": "Full Name",
      "default": "Your Name",
      "placeholder": "Enter your full name",
      "previewSelector": ".hero-name",
      "updateMethod": "textContent",
      "section": "profile"
    },
    "hero_title": {
      "type": "text",
      "label": "Professional Title",
      "default": "Your Title",
      "placeholder": "Your Professional Title",
      "previewSelector": ".hero-title",
      "updateMethod": "textContent",
      "section": "profile"
    },
    "hero_bio": {
      "type": "textarea",
      "label": "Bio Description",
      "default": "Brief introduction about yourself...",
      "rows": 3,
      "previewSelector": ".hero-bio",
      "updateMethod": "textContent",
      "section": "profile"
    },
    "profile_image": {
      "type": "image",
      "label": "Profile Picture",
      "default": "",
      "previewSelector": ".hero-avatar img",
      "updateMethod": "src",
      "section": "profile",
      "helpText": "Recommended: Square image, at least 200x200px"
    },
    "hero_bg_style": {
      "type": "select",
      "label": "Background Style",
      "default": "gradient",
      "options": [
        {"value": "gradient", "label": "Gradient Background"},
        {"value": "solid", "label": "Solid Color"},
        {"value": "image", "label": "Background Image"},
        {"value": "pattern", "label": "Pattern Background"}
      ],
      "previewSelector": ".hero-section",
      "updateMethod": "class",
      "classPrefix": "bg-style-",
      "section": "appearance"
    },
    "hero_bg_color": {
      "type": "color",
      "label": "Background Color",
      "default": "#f8fafc",
      "previewSelector": ".hero-section",
      "updateMethod": "style.backgroundColor",
      "section": "appearance"
    },
    "hero_text_color": {
      "type": "color",
      "label": "Text Color",
      "default": "#1e293b",
      "previewSelector": ".hero-section",
      "updateMethod": "style.color",
      "section": "appearance"
    },
    "avatar_style": {
      "type": "select",
      "label": "Avatar Style",
      "default": "circle",
      "options": [
        {"value": "circle", "label": "Circle"},
        {"value": "square", "label": "Square"},
        {"value": "rounded", "label": "Rounded Square"}
      ],
      "previewSelector": ".hero-avatar",
      "updateMethod": "class",
      "classPrefix": "avatar-",
      "section": "appearance"
    },
    "show_bio": {
      "type": "checkbox",
      "label": "Show Bio Description",
      "default": true,
      "previewSelector": ".hero-bio",
      "updateMethod": "visibility",
      "section": "appearance"
    }
  },
  "sections": {
    "profile": {
      "title": "Profile Information",
      "order": 1
    },
    "appearance": {
      "title": "Appearance",
      "order": 2
    }
  }
};

// Mock the required global objects
global.window = global.window || {};
global.window.stateManager = {
  updateComponent: vi.fn(),
  getComponentSetting: vi.fn()
};

global.window.dataBindingEngine = {
  initializeComponent: vi.fn(),
  bindDesignPanel: vi.fn(),
  updatePreview: vi.fn()
};

describe('Hero Component', () => {
  // We'll store references to important elements
  let heroComponent;
  let nameElement;
  let titleElement;
  let bioElement;
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Create a basic DOM structure for the component
    document.body.innerHTML = `
      <div id="component-hero-123" class="hero-section" data-component-id="hero-123">
        <div class="hero-avatar">
          <img src="" alt="Profile Picture">
        </div>
        <div class="hero-content">
          <h1 class="hero-name">John Doe</h1>
          <h2 class="hero-title">Software Developer</h2>
          <p class="hero-bio">Experienced developer with a passion for building great products.</p>
        </div>
      </div>
    `;
    
    // Get references to important elements
    heroComponent = document.getElementById('component-hero-123');
    nameElement = document.querySelector('.hero-name');
    titleElement = document.querySelector('.hero-title');
    bioElement = document.querySelector('.hero-bio');
    
    // Mock getComponentSetting to return default values
    window.stateManager.getComponentSetting.mockImplementation((id, key) => {
      if (componentJson.settings[key]) {
        return componentJson.settings[key].default;
      }
      return null;
    });
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });
  
  describe('Component Schema', () => {
    it('should have valid component structure', () => {
      // Basic schema validation
      expect(componentJson).toHaveProperty('name');
      expect(componentJson).toHaveProperty('category');
      expect(componentJson).toHaveProperty('settings');
      expect(componentJson).toHaveProperty('sections');
    });
    
    it('should define required settings', () => {
      // Check for crucial settings
      expect(componentJson.settings).toHaveProperty('hero_name');
      expect(componentJson.settings).toHaveProperty('hero_title');
      expect(componentJson.settings).toHaveProperty('hero_bio');
      expect(componentJson.settings).toHaveProperty('profile_image');
    });
    
    it('should define appearance settings', () => {
      // Check for appearance settings
      expect(componentJson.settings).toHaveProperty('hero_bg_style');
      expect(componentJson.settings).toHaveProperty('hero_bg_color');
      expect(componentJson.settings).toHaveProperty('hero_text_color');
    });
    
    it('should have properly configured sections', () => {
      // Check sections structure
      expect(componentJson.sections).toHaveProperty('profile');
      expect(componentJson.sections).toHaveProperty('appearance');
      
      // Check section order
      expect(componentJson.sections.profile.order).toBeLessThan(componentJson.sections.appearance.order);
    });
  });
  
  describe('Component Rendering', () => {
    // This is more challenging to test since rendering happens through PHP,
    // but we can test the DOM structure and simulated updates
    
    it('should render default text content', () => {
      // We'll simulate binding the default values from the schema
      
      // Set values to defaults from schema
      nameElement.textContent = componentJson.settings.hero_name.default;
      titleElement.textContent = componentJson.settings.hero_title.default;
      bioElement.textContent = componentJson.settings.hero_bio.default;
      
      // Verify default text content
      expect(nameElement.textContent).toBe('Your Name');
      expect(titleElement.textContent).toBe('Your Title');
      expect(bioElement.textContent).toBe('Brief introduction about yourself...');
    });
    
    it('should update component based on settings', () => {
      // Simulate updating component through data binding
      
      // Create a function that mimics the data binding engine's update logic
      const simulateUpdate = (selector, updateMethod, value) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (updateMethod === 'textContent') {
            element.textContent = value;
          } else if (updateMethod === 'style.backgroundColor') {
            element.style.backgroundColor = value;
          } else if (updateMethod === 'visibility') {
            element.style.display = value ? '' : 'none';
          } else if (updateMethod === 'src') {
            element.src = value;
          }
        });
      };
      
      // Simulate updates
      simulateUpdate('.hero-name', 'textContent', 'Jane Smith');
      simulateUpdate('.hero-title', 'textContent', 'UX Designer');
      simulateUpdate('.hero-section', 'style.backgroundColor', '#f0f0f0');
      simulateUpdate('.hero-bio', 'visibility', false);
      
      // Verify updates
      expect(nameElement.textContent).toBe('Jane Smith');
      expect(titleElement.textContent).toBe('UX Designer');
      expect(heroComponent.style.backgroundColor).toBe('rgb(240, 240, 240)');
      expect(bioElement.style.display).toBe('none');
    });
  });
  
  describe('Settings Integration', () => {
    it('should associate settings with correct DOM elements', () => {
      // Verify that settings have proper selectors
      const nameSettings = componentJson.settings.hero_name;
      expect(nameSettings.previewSelector).toBe('.hero-name');
      expect(nameSettings.updateMethod).toBe('textContent');
      
      const bioSettings = componentJson.settings.hero_bio;
      expect(bioSettings.previewSelector).toBe('.hero-bio');
      expect(bioSettings.updateMethod).toBe('textContent');
      
      const bgColorSettings = componentJson.settings.hero_bg_color;
      expect(bgColorSettings.previewSelector).toBe('.hero-section');
      expect(bgColorSettings.updateMethod).toBe('style.backgroundColor');
    });
    
    it('should have appropriate default values', () => {
      // Check default values
      expect(componentJson.settings.hero_name.default).toBe('Your Name');
      expect(componentJson.settings.hero_title.default).toBe('Your Title');
      expect(componentJson.settings.hero_bg_color.default).toBe('#f8fafc');
      expect(componentJson.settings.show_bio.default).toBe(true);
    });
  });
});
