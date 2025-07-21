/**
 * Data Binding Engine Unit Tests
 * 
 * Tests the functionality of the schema-driven data binding system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { dataBindingEngine } from '../../../js/services/data-binding-engine.js';
import { stateManager } from '../../../js/services/state-manager.js';

describe('Data Binding Engine', () => {
  // Mock DOM elements
  let mockComponentElement;
  let mockPanelElement;
  
  // Mock component data
  const componentId = 'test-component-1';
  const componentType = 'hero';
  
  // Mock schema
  const mockSchema = {
    sections: {
      content: {
        title: 'Content',
        order: 1
      },
      style: {
        title: 'Style',
        order: 2
      }
    },
    settings: {
      title: {
        type: 'text',
        label: 'Title',
        section: 'content',
        default: 'Default Title',
        previewSelector: '.hero-title',
        updateMethod: 'textContent'
      },
      subtitle: {
        type: 'textarea',
        label: 'Subtitle',
        section: 'content',
        default: 'Default subtitle text',
        previewSelector: '.hero-subtitle',
        updateMethod: 'textContent'
      },
      bgColor: {
        type: 'color',
        label: 'Background Color',
        section: 'style',
        default: '#ffffff',
        previewSelector: '.hero-container',
        updateMethod: 'style.backgroundColor'
      },
      showButton: {
        type: 'checkbox',
        label: 'Show Button',
        section: 'content',
        default: true,
        previewSelector: '.hero-button',
        updateMethod: 'visibility'
      }
    }
  };
  
  // Setup before each test
  beforeEach(() => {
    // Reset state
    stateManager.clearState();
    
    // Create mock DOM
    document.body.innerHTML = `
      <div data-component-id="${componentId}" class="hero-component">
        <div class="hero-container">
          <h1 class="hero-title">Title Placeholder</h1>
          <p class="hero-subtitle">Subtitle Placeholder</p>
          <button class="hero-button">Click Me</button>
        </div>
      </div>
      <div class="design-panel">
        <input type="text" data-setting="title" value="">
        <textarea data-setting="subtitle"></textarea>
        <input type="color" data-setting="bgColor" value="#ffffff">
        <input type="checkbox" data-setting="showButton">
      </div>
    `;
    
    mockComponentElement = document.querySelector(`[data-component-id="${componentId}"]`);
    mockPanelElement = document.querySelector('.design-panel');
    
    // Spy on stateManager methods
    vi.spyOn(stateManager, 'initComponent');
    vi.spyOn(stateManager, 'updateComponent');
    vi.spyOn(stateManager, 'subscribe');
  });
  
  // Cleanup after tests
  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('Component Initialization', () => {
    it('should initialize component with default values from schema', async () => {
      await dataBindingEngine.initializeComponent(componentId, componentType, mockSchema);
      
      expect(stateManager.initComponent).toHaveBeenCalledWith(
        componentId,
        componentType,
        expect.objectContaining({
          title: 'Default Title',
          subtitle: 'Default subtitle text',
          bgColor: '#ffffff',
          showButton: true
        })
      );
    });
    
    it('should create bindings for component settings', async () => {
      await dataBindingEngine.initializeComponent(componentId, componentType, mockSchema);
      
      // Check internal bindings map
      expect(dataBindingEngine.bindings.has(componentId)).toBe(true);
      
      const componentBindings = dataBindingEngine.bindings.get(componentId);
      expect(componentBindings.size).toBe(4); // 4 settings in mock schema
      expect(componentBindings.has('title')).toBe(true);
      expect(componentBindings.has('subtitle')).toBe(true);
      expect(componentBindings.has('bgColor')).toBe(true);
      expect(componentBindings.has('showButton')).toBe(true);
    });
  });
  
  describe('Design Panel Binding', () => {
    it('should bind inputs to state updates', async () => {
      // Initialize component
      await dataBindingEngine.initializeComponent(componentId, componentType, mockSchema);
      
      // Bind panel
      dataBindingEngine.bindDesignPanel(mockPanelElement, componentId);
      
      // Trigger input change
      const titleInput = mockPanelElement.querySelector('[data-setting="title"]');
      titleInput.value = 'Updated Title';
      titleInput.dispatchEvent(new Event('input'));
      
      // Check state update
      expect(stateManager.updateComponent).toHaveBeenCalledWith(
        componentId,
        'title',
        'Updated Title'
      );
    });
    
    it('should set initial input values from state', async () => {
      // Initialize component
      await dataBindingEngine.initializeComponent(componentId, componentType, mockSchema);
      
      // Mock state value retrieval
      vi.spyOn(stateManager, 'getComponentSetting').mockImplementation((id, key) => {
        if (id === componentId) {
          const values = {
            title: 'Existing Title',
            subtitle: 'Existing subtitle',
            bgColor: '#ff0000',
            showButton: true
          };
          return values[key];
        }
        return null;
      });
      
      // Bind panel
      dataBindingEngine.bindDesignPanel(mockPanelElement, componentId);
      
      // Check input values
      const titleInput = mockPanelElement.querySelector('[data-setting="title"]');
      const subtitleInput = mockPanelElement.querySelector('[data-setting="subtitle"]');
      const colorInput = mockPanelElement.querySelector('[data-setting="bgColor"]');
      const checkboxInput = mockPanelElement.querySelector('[data-setting="showButton"]');
      
      expect(titleInput.value).toBe('Existing Title');
      expect(subtitleInput.value).toBe('Existing subtitle');
      expect(colorInput.value).toBe('#ff0000');
      expect(checkboxInput.checked).toBe(true);
    });
    
    it('should subscribe to state changes for updating preview', async () => {
      // Initialize component
      await dataBindingEngine.initializeComponent(componentId, componentType, mockSchema);
      
      // Bind panel
      dataBindingEngine.bindDesignPanel(mockPanelElement, componentId);
      
      // Check subscription
      expect(stateManager.subscribe).toHaveBeenCalledWith(
        componentId,
        expect.any(Function)
      );
    });
  });
  
  describe('Preview Updates', () => {
    it('should update text content in preview', async () => {
      // Initialize component
      await dataBindingEngine.initializeComponent(componentId, componentType, mockSchema);
      
      // Manually trigger updatePreview
      dataBindingEngine.updatePreview(componentId, {
        title: 'New Title',
        subtitle: 'New subtitle'
      });
      
      // Check preview elements
      const titleEl = mockComponentElement.querySelector('.hero-title');
      const subtitleEl = mockComponentElement.querySelector('.hero-subtitle');
      
      expect(titleEl.textContent).toBe('New Title');
      expect(subtitleEl.textContent).toBe('New subtitle');
    });
    
    it('should update styles in preview', async () => {
      // Initialize component
      await dataBindingEngine.initializeComponent(componentId, componentType, mockSchema);
      
      // Manually trigger updatePreview
      dataBindingEngine.updatePreview(componentId, {
        bgColor: '#ff0000'
      });
      
      // Check preview elements
      const container = mockComponentElement.querySelector('.hero-container');
      expect(container.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });
    
    it('should toggle visibility based on boolean values', async () => {
      // Initialize component
      await dataBindingEngine.initializeComponent(componentId, componentType, mockSchema);
      
      // Manually trigger updatePreview with false
      dataBindingEngine.updatePreview(componentId, {
        showButton: false
      });
      
      // Check button is hidden
      const button = mockComponentElement.querySelector('.hero-button');
      expect(button.style.display).toBe('none');
      
      // Manually trigger updatePreview with true
      dataBindingEngine.updatePreview(componentId, {
        showButton: true
      });
      
      // Check button is visible
      expect(button.style.display).toBe('');
    });
  });
  
  describe('Panel Generation', () => {
    it('should generate design panel HTML from schema', () => {
      const html = dataBindingEngine.generateDesignPanel(mockSchema);
      
      // Basic HTML structure checks
      expect(html).toContain('Content'); // Section title
      expect(html).toContain('Style'); // Section title
      expect(html).toContain('data-setting="title"');
      expect(html).toContain('data-setting="subtitle"');
      expect(html).toContain('data-setting="bgColor"');
      expect(html).toContain('data-setting="showButton"');
      
      // Input type checks
      expect(html).toContain('input type="text"');
      expect(html).toContain('<textarea');
      expect(html).toContain('input type="color"');
      expect(html).toContain('input type="checkbox"');
    });
    
    it('should generate different input types correctly', () => {
      // Test select input generation
      const selectSchema = {
        settings: {
          alignment: {
            type: 'select',
            label: 'Text Alignment',
            options: [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' }
            ]
          }
        }
      };
      
      const html = dataBindingEngine.generateDesignPanel(selectSchema);
      expect(html).toContain('<select');
      expect(html).toContain('option value="left"');
      expect(html).toContain('option value="center"');
      expect(html).toContain('option value="right"');
      
      // Additional input types could be tested similarly
    });
  });
});
