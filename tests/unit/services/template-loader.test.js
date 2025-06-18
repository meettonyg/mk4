/**
 * Template Loader Tests
 * 
 * Tests the template loading functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { templateLoader } from '../../../js/services/template-loader.js';

// Mock global objects needed by templateLoader
global.window = global.window || {};
global.window.stateManager = {
  getState: vi.fn(),
  updateMetadata: vi.fn(),
  removeComponent: vi.fn(),
  initComponent: vi.fn(),
  notifyGlobalListeners: vi.fn(),
  getComponent: vi.fn(),
};
global.window.componentManager = {};
global.window.componentRenderer = {};
global.window.historyService = {
  showToast: vi.fn()
};

describe('Template Loader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock fetch API
    global.fetch = vi.fn();
    
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="preview-container"></div>
      <div id="media-kit-preview"></div>
      <div id="empty-state"></div>
    `;
    
    // Mock fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        name: 'Test Template',
        components: [
          { type: 'hero', data: { title: 'Test Hero' } },
          { type: 'stats', data: { stats: [10, 20, 30] } }
        ]
      })
    });
    
    // Mock getState to return empty component list
    window.stateManager.getState.mockReturnValue({
      components: {}
    });
    
    // Mock Date.now for predictable IDs
    vi.spyOn(Date, 'now').mockReturnValue(12345);
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });
  
  describe('Template Management', () => {
    it('should provide a list of available templates', () => {
      const templates = templateLoader.getTemplates();
      
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
      
      // Check template structure
      const template = templates[0];
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('file');
    });
    
    it('should throw error for non-existent template', async () => {
      await expect(templateLoader.loadTemplate('non-existent-template')).rejects.toThrow();
    });
  });
  
  describe('Template Loading', () => {
    it('should fetch template data from server', async () => {
      // Use a template ID that exists
      const templates = templateLoader.getTemplates();
      const templateId = templates[0].id;
      
      await templateLoader.loadTemplate(templateId);
      
      // Should call fetch with URL containing template file
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(templates[0].file));
    });
    
    it('should clear existing components before loading template', async () => {
      // Mock existing components
      window.stateManager.getState.mockReturnValue({
        components: {
          'existing-1': { type: 'hero' },
          'existing-2': { type: 'stats' }
        }
      });
      
      // Use a template ID that exists
      const templates = templateLoader.getTemplates();
      const templateId = templates[0].id;
      
      await templateLoader.loadTemplate(templateId);
      
      // Should remove each existing component
      expect(window.stateManager.removeComponent).toHaveBeenCalledTimes(2);
      expect(window.stateManager.removeComponent).toHaveBeenCalledWith('existing-1');
      expect(window.stateManager.removeComponent).toHaveBeenCalledWith('existing-2');
    });
    
    it('should initialize components from template data', async () => {
      // Use a template ID that exists
      const templates = templateLoader.getTemplates();
      const templateId = templates[0].id;
      
      await templateLoader.loadTemplate(templateId);
      
      // Should initialize components from template
      expect(window.stateManager.initComponent).toHaveBeenCalledTimes(2);
      
      // First component (hero)
      expect(window.stateManager.initComponent).toHaveBeenCalledWith(
        'hero-12345-0',
        'hero',
        { title: 'Test Hero' },
        expect.any(Boolean)
      );
      
      // Second component (stats)
      expect(window.stateManager.initComponent).toHaveBeenCalledWith(
        'stats-12345-1',
        'stats',
        { stats: [10, 20, 30] },
        expect.any(Boolean)
      );
    });
    
    it('should update metadata with template information', async () => {
      // Use a template ID that exists
      const templates = templateLoader.getTemplates();
      const templateId = templates[0].id;
      
      await templateLoader.loadTemplate(templateId);
      
      // Should update metadata
      expect(window.stateManager.updateMetadata).toHaveBeenCalledWith({
        templateId: templateId,
        templateName: 'Test Template'
      });
    });
    
    it('should show notification when template loads successfully', async () => {
      // Use a template ID that exists
      const templates = templateLoader.getTemplates();
      const templateId = templates[0].id;
      
      await templateLoader.loadTemplate(templateId);
      
      // Should show notification
      expect(window.historyService.showToast).toHaveBeenCalledWith(
        expect.stringContaining('Test Template')
      );
    });
    
    it('should handle template loading errors', async () => {
      // Mock fetch to fail
      global.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });
      
      // Use a template ID that exists
      const templates = templateLoader.getTemplates();
      const templateId = templates[0].id;
      
      // Mock console.error to prevent output spam
      const originalConsoleError = console.error;
      console.error = vi.fn();
      
      try {
        // Attempt to load template (should fail)
        await templateLoader.loadTemplate(templateId);
        // If we reach here, the test should fail
        expect('this should not be reached').toBe('test should have thrown');
      } catch (error) {
        // Verify error message contains expected text
        expect(error.message).toContain('Failed to load template');
      } finally {
        // Restore console.error
        console.error = originalConsoleError;
      }
    });
  });
});
