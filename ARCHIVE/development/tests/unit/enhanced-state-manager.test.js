/**
 * Enhanced State Manager Unit Tests
 * 
 * Tests the enhanced state management functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { enhancedStateManager } from '../../js/core/enhanced-state-manager.js';

describe('Enhanced State Manager', () => {
  // Reset state before each test
  beforeEach(() => {
    enhancedStateManager.clearState();
  });

  // Clean up after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with default state', () => {
      const state = enhancedStateManager.getState();
      
      expect(state).toBeDefined();
      expect(state.components).toBeDefined();
      expect(state.metadata).toBeDefined();
      expect(state.metadata.title).toBe('My Media Kit');
    });

    it('should proxy base state manager methods', () => {
      // Test that proxied methods work
      enhancedStateManager.updateMetadata({ title: 'Enhanced Test' });
      
      const state = enhancedStateManager.getState();
      expect(state.metadata.title).toBe('Enhanced Test');
    });
  });

  describe('Component Meta Management', () => {
    it('should initialize component with meta', () => {
      const componentId = 'meta-component-1';
      enhancedStateManager.initComponent(componentId, 'hero', { title: 'Test' });
      
      // Get component with meta
      const component = enhancedStateManager.getComponent(componentId);
      expect(component).toBeDefined();
      expect(component.meta).toBeDefined();
      expect(component.meta.isDirty).toBe(false);
      expect(component.meta.isDeleting).toBe(false);
      expect(component.meta.isMoving).toBe(false);
      expect(component.meta.lastModified).toBeDefined();
    });

    it('should update component meta', () => {
      const componentId = 'meta-component-2';
      enhancedStateManager.initComponent(componentId, 'hero', {});
      
      enhancedStateManager.updateComponentMeta(componentId, {
        isMoving: true,
        isDirty: true
      });
      
      const component = enhancedStateManager.getComponent(componentId);
      expect(component.meta.isMoving).toBe(true);
      expect(component.meta.isDirty).toBe(true);
    });

    it('should mark component as dirty when updated', () => {
      const componentId = 'meta-component-3';
      enhancedStateManager.initComponent(componentId, 'hero', { title: 'Initial' });
      
      // Initial state should be clean
      const initialComponent = enhancedStateManager.getComponent(componentId);
      expect(initialComponent.meta.isDirty).toBe(false);
      
      // Update the component
      enhancedStateManager.updateComponent(componentId, 'title', 'Updated');
      
      // Component should now be marked as dirty
      const updatedComponent = enhancedStateManager.getComponent(componentId);
      expect(updatedComponent.meta.isDirty).toBe(true);
    });

    it('should clean up meta when component is removed', () => {
      const componentId = 'meta-component-4';
      enhancedStateManager.initComponent(componentId, 'hero', {});
      
      // Verify meta exists
      expect(enhancedStateManager.componentMeta.get(componentId)).toBeDefined();
      
      // Remove component
      enhancedStateManager.removeComponent(componentId);
      
      // Meta should be cleaned up
      expect(enhancedStateManager.componentMeta.get(componentId)).toBeUndefined();
    });
  });

  describe('Enhanced Batch Updates', () => {
    it('should batch updates with proper notification', async () => {
      const globalListener = vi.fn();
      enhancedStateManager.subscribeGlobal(globalListener);
      
      await enhancedStateManager.batchUpdate(async () => {
        enhancedStateManager.initComponent('batch-1', 'hero', {});
        enhancedStateManager.initComponent('batch-2', 'stats', {});
        enhancedStateManager.updateMetadata({ title: 'Batch Test' });
      });
      
      // Should only notify once for the entire batch
      expect(globalListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Pending Actions', () => {
    it('should manage pending actions', () => {
      const componentId = 'action-component';
      const action = 'move';
      
      // Set a pending action
      enhancedStateManager.setPendingAction(action, componentId);
      
      // Check if action is pending
      expect(enhancedStateManager.isPendingAction(action, componentId)).toBe(true);
      
      // Clear the action
      enhancedStateManager.clearPendingAction(action, componentId);
      
      // Should no longer be pending
      expect(enhancedStateManager.isPendingAction(action, componentId)).toBe(false);
    });
  });

  describe('Ordered Components with Meta', () => {
    it('should return ordered components with meta', () => {
      // Add multiple components
      enhancedStateManager.initComponent('ordered-1', 'hero', {});
      enhancedStateManager.initComponent('ordered-2', 'stats', {});
      enhancedStateManager.initComponent('ordered-3', 'cta', {});
      
      // Update meta for one component
      enhancedStateManager.updateComponentMeta('ordered-2', { isMoving: true });
      
      // Get ordered components
      const orderedComponents = enhancedStateManager.getOrderedComponents();
      
      expect(orderedComponents.length).toBe(3);
      expect(orderedComponents[0].id).toBe('ordered-1');
      expect(orderedComponents[1].id).toBe('ordered-2');
      expect(orderedComponents[2].id).toBe('ordered-3');
      
      // Verify meta is included
      expect(orderedComponents[1].meta.isMoving).toBe(true);
    });
  });

  describe('State Serialization and Loading', () => {
    it('should handle serialized state loading with meta', () => {
      // Create a serialized state
      const serializedState = {
        metadata: {
          title: 'Serialized Test',
          theme: 'blue'
        },
        components: [
          {
            id: 'serialized-1',
            type: 'hero',
            order: 0,
            data: { title: 'Hero Title' }
          },
          {
            id: 'serialized-2',
            type: 'cta',
            order: 1,
            data: { buttonText: 'Click Me' }
          }
        ]
      };
      
      // Load the serialized state
      enhancedStateManager.loadSerializedState(serializedState);
      
      // Verify state was loaded
      const state = enhancedStateManager.getState();
      expect(state.metadata.title).toBe('Serialized Test');
      
      // Verify components were loaded
      const component1 = enhancedStateManager.getComponent('serialized-1');
      expect(component1.data.title).toBe('Hero Title');
      
      // Verify meta was initialized for loaded components
      expect(component1.meta).toBeDefined();
      expect(component1.meta.isDirty).toBe(false);
    });
  });
});
