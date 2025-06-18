/**
 * Additional History Service Tests
 * 
 * These tests focus on just the undo/redo functionality without trying to modify private properties
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { historyService } from '../../../js/services/history-service.js';
import { stateManager } from '../../../js/services/state-manager.js';

describe('History Service Extended Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Legacy Function Exports', () => {
    it('should provide legacy undo function', () => {
      // Mock historyService.undo
      vi.spyOn(historyService, 'undo').mockReturnValue(true);
      
      // Import legacy functions
      const { undo } = require('../../../js/services/history-service.js');
      
      const success = undo();
      
      expect(success).toBe(true);
      expect(historyService.undo).toHaveBeenCalled();
    });
    
    it('should provide legacy redo function', () => {
      // Mock historyService.redo
      vi.spyOn(historyService, 'redo').mockReturnValue(true);
      
      // Import legacy functions
      const { redo } = require('../../../js/services/history-service.js');
      
      const success = redo();
      
      expect(success).toBe(true);
      expect(historyService.redo).toHaveBeenCalled();
    });
  });
  
  describe('State Helper Methods', () => {
    it('should provide helpful methods for state checking', () => {
      // These are more general tests that don't try to manipulate internal state
      expect(typeof historyService.canUndo).toBe('function');
      expect(typeof historyService.canRedo).toBe('function');
      expect(typeof historyService.getStats).toBe('function');
    });
  });
  
  describe('Toast Helper', () => {
    it('should provide a toast notification method', () => {
      expect(typeof historyService.showToast).toBe('function');
      
      // Create a simple mock for DOM operations
      const mockToast = document.createElement('div');
      vi.spyOn(document, 'createElement').mockReturnValue(mockToast);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      
      // Basic functionality test that doesn't interact with DOM deeply
      const result = historyService.showToast('Test message');
      expect(result).toBe(mockToast);
    });
  });
});
