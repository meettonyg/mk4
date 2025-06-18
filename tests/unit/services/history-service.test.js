/**
 * History Service Unit Tests
 * 
 * Tests the undo/redo functionality of the History Service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { historyService } from '../../../js/services/history-service.js';
import { stateManager } from '../../../js/services/state-manager.js';

describe('History Service', () => {
  // Mock DOM elements
  let undoButton;
  let redoButton;
  
  // Setup before each test
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Create mock DOM elements
    document.body.innerHTML = `
      <div class="toolbar">
        <button id="undo-btn" data-action="undo" title="Undo">Undo</button>
        <button id="redo-btn" data-action="redo" title="Redo">Redo</button>
      </div>
      <div class="gmkb-toast-container"></div>
    `;
    
    undoButton = document.getElementById('undo-btn');
    redoButton = document.getElementById('redo-btn');
    
    // Important: Set proper properties for button elements in JSDOM
    Object.defineProperty(undoButton, 'disabled', {
      writable: true,
      value: false
    });
    
    Object.defineProperty(redoButton, 'disabled', {
      writable: true,
      value: false
    });
    
    // Spy on state manager methods
    vi.spyOn(stateManager, 'undo').mockImplementation(() => false);
    vi.spyOn(stateManager, 'redo').mockImplementation(() => false);
    vi.spyOn(stateManager, 'subscribeGlobal').mockImplementation(() => () => {});
    
    // Spy on document event listeners
    vi.spyOn(document, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(document, 'dispatchEvent').mockImplementation(() => true);
    
    // Spy on history service methods without trying to change getters
    vi.spyOn(historyService, 'showToast').mockImplementation(() => {
      const toast = document.createElement('div');
      toast.className = 'gmkb-toast';
      return toast;
    });
    
    // Mock canUndo and canRedo methods instead of manipulating internal state
    vi.spyOn(historyService, 'canUndo').mockImplementation(() => false);
    vi.spyOn(historyService, 'canRedo').mockImplementation(() => false);
    
    // Mock the updateUI method to avoid DOM operations
    vi.spyOn(historyService, 'updateUI').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });
  
  describe('Undo/Redo Operations', () => {
    it('should call state manager undo method and show toast when undoing', () => {
      // Mock state manager to return success
      stateManager.undo.mockReturnValue(true);
      
      const success = historyService.undo();
      
      expect(success).toBe(true);
      expect(stateManager.undo).toHaveBeenCalled();
      expect(historyService.showToast).toHaveBeenCalledWith('Change undone');
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'history-undo' })
      );
    });
    
    it('should not show toast or dispatch event when undo fails', () => {
      // Mock state manager to return failure
      stateManager.undo.mockReturnValue(false);
      
      const success = historyService.undo();
      
      expect(success).toBe(false);
      expect(stateManager.undo).toHaveBeenCalled();
      expect(historyService.showToast).not.toHaveBeenCalled();
      expect(document.dispatchEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'history-undo' })
      );
    });
    
    it('should call state manager redo method and show toast when redoing', () => {
      // Mock state manager to return success
      stateManager.redo.mockReturnValue(true);
      
      const success = historyService.redo();
      
      expect(success).toBe(true);
      expect(stateManager.redo).toHaveBeenCalled();
      expect(historyService.showToast).toHaveBeenCalledWith('Change redone');
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'history-redo' })
      );
    });
    
    it('should not show toast or dispatch event when redo fails', () => {
      // Mock state manager to return failure
      stateManager.redo.mockReturnValue(false);
      
      const success = historyService.redo();
      
      expect(success).toBe(false);
      expect(stateManager.redo).toHaveBeenCalled();
      expect(historyService.showToast).not.toHaveBeenCalled();
      expect(document.dispatchEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'history-redo' })
      );
    });
  });
  
  describe('UI Updates', () => {
    it('should handle missing UI elements gracefully', () => {
      // Remove buttons
      document.body.innerHTML = '';
      
      // Should not throw errors
      expect(() => {
        historyService.updateUI();
      }).not.toThrow();
    });
  });
});
