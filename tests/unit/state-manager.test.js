/**
 * State Manager Unit Tests
 * 
 * Tests the core functionality of the state management system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { stateManager } from '../../js/services/state-manager.js';

describe('State Manager', () => {
  // Reset state before each test
  beforeEach(() => {
    stateManager.clearState();
  });

  // Clean up listeners after each test
  afterEach(() => {
    // Reset spies and mocks
    vi.clearAllMocks();
  });

  describe('Basic State Management', () => {
    it('should initialize with default state', () => {
      const state = stateManager.getState();
      
      expect(state).toBeDefined();
      expect(state.components).toBeDefined();
      expect(state.metadata).toBeDefined();
      expect(state.metadata.title).toBe('My Media Kit');
      expect(state.metadata.theme).toBe('default');
      expect(Object.keys(state.components).length).toBe(0);
    });

    it('should update metadata', () => {
      const newTitle = 'Custom Media Kit';
      stateManager.updateMetadata({ title: newTitle });
      
      const state = stateManager.getState();
      expect(state.metadata.title).toBe(newTitle);
      expect(state.metadata.lastModified).toBeDefined();
    });
  });

  describe('Component Management', () => {
    it('should initialize a component', () => {
      const componentId = 'test-component-1';
      const componentType = 'hero';
      const initialData = { title: 'Test Title' };
      
      stateManager.initComponent(componentId, componentType, initialData);
      
      const component = stateManager.getComponent(componentId);
      expect(component).toBeDefined();
      expect(component.type).toBe(componentType);
      expect(component.data.title).toBe(initialData.title);
      expect(component.order).toBe(0);
    });

    it('should update a component', () => {
      const componentId = 'test-component-2';
      stateManager.initComponent(componentId, 'hero', { title: 'Initial Title' });
      
      stateManager.updateComponent(componentId, 'title', 'Updated Title');
      
      const component = stateManager.getComponent(componentId);
      expect(component.data.title).toBe('Updated Title');
    });

    it('should update a component with an object of values', () => {
      const componentId = 'test-component-3';
      stateManager.initComponent(componentId, 'hero', { title: 'Initial Title', subtitle: 'Initial Subtitle' });
      
      stateManager.updateComponent(componentId, { 
        title: 'Updated Title', 
        subtitle: 'Updated Subtitle' 
      });
      
      const component = stateManager.getComponent(componentId);
      expect(component.data.title).toBe('Updated Title');
      expect(component.data.subtitle).toBe('Updated Subtitle');
    });

    it('should remove a component', () => {
      const componentId = 'test-component-4';
      stateManager.initComponent(componentId, 'hero', {});
      
      stateManager.removeComponent(componentId);
      
      const component = stateManager.getComponent(componentId);
      expect(component).toBeNull();
    });

    it('should maintain component order', () => {
      // Add three components
      stateManager.initComponent('comp-1', 'hero', {});
      stateManager.initComponent('comp-2', 'stats', {});
      stateManager.initComponent('comp-3', 'cta', {});
      
      // Check default ordering
      const orderedComponents = stateManager.getOrderedComponents();
      expect(orderedComponents.length).toBe(3);
      expect(orderedComponents[0].id).toBe('comp-1');
      expect(orderedComponents[1].id).toBe('comp-2');
      expect(orderedComponents[2].id).toBe('comp-3');
      
      // Reorder components
      stateManager.reorderComponents(['comp-3', 'comp-1', 'comp-2']);
      
      const reorderedComponents = stateManager.getOrderedComponents();
      expect(reorderedComponents[0].id).toBe('comp-3');
      expect(reorderedComponents[1].id).toBe('comp-1');
      expect(reorderedComponents[2].id).toBe('comp-2');
    });
  });

  describe('State Subscriptions', () => {
    it('should notify component listeners when component state changes', () => {
      const componentId = 'test-component-5';
      stateManager.initComponent(componentId, 'hero', { title: 'Test' });
      
      const listener = vi.fn();
      stateManager.subscribe(componentId, listener);
      
      stateManager.updateComponent(componentId, 'title', 'Updated');
      
      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][0].title).toBe('Updated');
    });

    it('should notify global listeners when any state changes', () => {
      const globalListener = vi.fn();
      stateManager.subscribeGlobal(globalListener);
      
      stateManager.initComponent('test-component-6', 'hero', {});
      
      expect(globalListener).toHaveBeenCalled();
    });

    it('should not notify after unsubscribe', () => {
      const componentId = 'test-component-7';
      stateManager.initComponent(componentId, 'hero', {});
      
      const listener = vi.fn();
      const unsubscribe = stateManager.subscribe(componentId, listener);
      
      unsubscribe();
      
      stateManager.updateComponent(componentId, 'title', 'Updated');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Batch Updates', () => {
    it('should perform multiple updates in a batch', async () => {
      const globalListener = vi.fn();
      stateManager.subscribeGlobal(globalListener);
      
      await stateManager.batchUpdate(() => {
        stateManager.initComponent('batch-1', 'hero', {});
        stateManager.initComponent('batch-2', 'stats', {});
        stateManager.updateMetadata({ title: 'Batch Test' });
      });
      
      // Should only be called once for the entire batch
      expect(globalListener).toHaveBeenCalledTimes(1);
      
      const state = stateManager.getState();
      expect(Object.keys(state.components).length).toBe(2);
      expect(state.metadata.title).toBe('Batch Test');
    });
  });

  describe('History Management', () => {
    it('should save history entries', () => {
      stateManager.initComponent('history-1', 'hero', {});
      stateManager.updateComponent('history-1', 'title', 'Test');
      stateManager.updateComponent('history-1', 'subtitle', 'Subtitle');
      
      // Private access to history for testing
      expect(stateManager.history.length).toBeGreaterThan(0);
    });

    it('should undo the last action', () => {
      stateManager.initComponent('undo-1', 'hero', { title: 'Initial' });
      stateManager.updateComponent('undo-1', 'title', 'Updated');
      
      const beforeUndo = stateManager.getComponent('undo-1').data.title;
      expect(beforeUndo).toBe('Updated');
      
      stateManager.undo();
      
      const afterUndo = stateManager.getComponent('undo-1').data.title;
      expect(afterUndo).toBe('Initial');
    });

    it('should redo an undone action', () => {
      stateManager.initComponent('redo-1', 'hero', { title: 'Initial' });
      stateManager.updateComponent('redo-1', 'title', 'Updated');
      
      stateManager.undo(); // Back to 'Initial'
      const component = stateManager.getComponent('redo-1');
      expect(component.data.title).toBe('Initial');
      
      stateManager.redo(); // Forward to 'Updated'
      const redoneComponent = stateManager.getComponent('redo-1');
      expect(redoneComponent.data.title).toBe('Updated');
    });
  });

  describe('Serialization', () => {
    it('should produce serializable state', () => {
      stateManager.initComponent('serialize-1', 'hero', { title: 'Test' });
      stateManager.initComponent('serialize-2', 'stats', { data: [1, 2, 3] });
      
      const serialized = stateManager.getSerializableState();
      
      expect(serialized.version).toBeDefined();
      expect(serialized.metadata).toBeDefined();
      expect(serialized.components).toBeInstanceOf(Array);
      expect(serialized.components.length).toBe(2);
      
      // Should be JSON serializable
      const jsonString = JSON.stringify(serialized);
      expect(jsonString).toBeDefined();
      expect(typeof jsonString).toBe('string');
      
      // Should be able to parse back
      const parsed = JSON.parse(jsonString);
      expect(parsed.components.length).toBe(2);
    });

    it('should load from serialized state', () => {
      const serialized = {
        version: '1.0.0',
        metadata: {
          title: 'Loaded State',
          theme: 'dark'
        },
        components: [
          {
            id: 'loaded-1',
            type: 'hero',
            order: 0,
            data: { title: 'Loaded Title' }
          },
          {
            id: 'loaded-2',
            type: 'cta',
            order: 1,
            data: { buttonText: 'Contact Me' }
          }
        ]
      };
      
      stateManager.loadSerializedState(serialized);
      
      const state = stateManager.getState();
      expect(state.metadata.title).toBe('Loaded State');
      expect(state.metadata.theme).toBe('dark');
      expect(Object.keys(state.components).length).toBe(2);
      
      const component = stateManager.getComponent('loaded-1');
      expect(component.type).toBe('hero');
      expect(component.data.title).toBe('Loaded Title');
    });
  });
});
