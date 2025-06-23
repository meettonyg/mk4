/**
 * Minimal History Service Tests
 * 
 * These tests focus on the most basic functionality without complex DOM operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { historyService } from '../../../js/services/history-service.js';
import { stateManager } from '../../../js/services/state-manager.js';

describe('History Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Create basic DOM for tests
    document.body.innerHTML = '<div id="test-container"></div>';
    
    // Mock stateManager methods
    vi.spyOn(stateManager, 'undo').mockImplementation(() => false);
    vi.spyOn(stateManager, 'redo').mockImplementation(() => false);
    
    // Mock document methods
    vi.spyOn(document, 'dispatchEvent').mockImplementation(() => true);
    
    // Mock historyService methods
    vi.spyOn(historyService, 'showToast').mockImplementation(() => {
      return document.createElement('div');
    });
  });
  
  describe('Undo/Redo Operations', () => {
    it('should call state manager undo when undoing', () => {
      stateManager.undo.mockReturnValueOnce(true);
      
      historyService.undo();
      
      expect(stateManager.undo).toHaveBeenCalled();
    });
    
    it('should call state manager redo when redoing', () => {
      stateManager.redo.mockReturnValueOnce(true);
      
      historyService.redo();
      
      expect(stateManager.redo).toHaveBeenCalled();
    });
    
    it('should show toast when undo succeeds', () => {
      stateManager.undo.mockReturnValueOnce(true);
      
      historyService.undo();
      
      expect(historyService.showToast).toHaveBeenCalledWith('Change undone');
    });
    
    it('should show toast when redo succeeds', () => {
      stateManager.redo.mockReturnValueOnce(true);
      
      historyService.redo();
      
      expect(historyService.showToast).toHaveBeenCalledWith('Change redone');
    });
    
    it('should not show toast when undo fails', () => {
      stateManager.undo.mockReturnValueOnce(false);
      
      historyService.undo();
      
      expect(historyService.showToast).not.toHaveBeenCalled();
    });
  });
  
  describe('Service Methods', () => {
    it('should have essential methods', () => {
      expect(typeof historyService.undo).toBe('function');
      expect(typeof historyService.redo).toBe('function');
      expect(typeof historyService.canUndo).toBe('function');
      expect(typeof historyService.canRedo).toBe('function');
      expect(typeof historyService.showToast).toBe('function');
    });
  });
});
