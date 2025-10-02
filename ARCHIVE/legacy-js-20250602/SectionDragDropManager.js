/**
 * Section Drag Drop Manager - Self-Contained Architecture
 * Handles drag and drop between sections without DOM manipulation
 * Event-driven, no polling, uses state management
 */

export class SectionDragDropManager {
  constructor(stateManager, eventBus) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.draggedComponent = null;
    this.draggedFromSection = null;
    this.dropTarget = null;
    
    this.initialize();
  }

  initialize() {
    // Listen for drag events via event delegation
    document.addEventListener('dragstart', this.handleDragStart.bind(this), true);
    document.addEventListener('dragend', this.handleDragEnd.bind(this), true);
    document.addEventListener('dragover', this.handleDragOver.bind(this), true);
    document.addEventListener('drop', this.handleDrop.bind(this), true);
    document.addEventListener('dragleave', this.handleDragLeave.bind(this), true);
    
    // Listen for state changes to update draggable attributes
    this.stateManager.subscribe(() => {
      this.updateDraggableComponents();
    });
    
    console.log('✅ Section Drag Drop Manager initialized');
  }

  handleDragStart(e) {
    // Check if it's a component being dragged
    const componentEl = e.target.closest('[data-component-id]');
    if (!componentEl) {
      // Check if it's a new component from sidebar
      const sidebarItem = e.target.closest('.component-item[draggable="true"]');
      if (sidebarItem) {
        this.handleNewComponentDrag(sidebarItem, e);
      }
      return;
    }
    
    const componentId = componentEl.dataset.componentId;
    const state = this.stateManager.getState();
    const component = state.components[componentId];
    
    if (!component) return;
    
    // Find which section this component is in
    const sectionEl = componentEl.closest('[data-section-id]');
    const sectionId = sectionEl?.dataset.sectionId;
    
    this.draggedComponent = component;
    this.draggedFromSection = sectionId;
    
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'component-move',
      componentId: componentId,
      fromSection: sectionId
    }));
    
    // Add dragging class
    componentEl.classList.add('dragging');
    
    console.log(`🎯 Dragging component ${componentId} from section ${sectionId}`);
  }

  handleNewComponentDrag(sidebarItem, e) {
    const componentType = sidebarItem.dataset.component;
    
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'new-component',
      componentType: componentType
    }));
    
    console.log(`🎯 Dragging new component type: ${componentType}`);
  }

  handleDragEnd(e) {
    // Clean up dragging classes
    document.querySelectorAll('.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
    
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
    
    this.draggedComponent = null;
    this.draggedFromSection = null;
    this.dropTarget = null;
  }

  handleDragOver(e) {
    // Check if over a valid drop zone
    const dropZone = e.target.closest('.section__drop-zone, .section__column, [data-section-id]');
    if (!dropZone) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback
    dropZone.classList.add('drag-over');
    this.dropTarget = dropZone;
  }

  handleDragLeave(e) {
    // Remove visual feedback when leaving drop zone
    const dropZone = e.target.closest('.section__drop-zone, .section__column, [data-section-id]');
    if (dropZone && dropZone === this.dropTarget) {
      dropZone.classList.remove('drag-over');
    }
  }

  handleDrop(e) {
    const dropZone = e.target.closest('.section__drop-zone, .section__column, [data-section-id]');
    if (!dropZone) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Get the section ID from the drop zone
    const targetSectionEl = dropZone.closest('[data-section-id]');
    const targetSectionId = targetSectionEl?.dataset.sectionId;
    
    if (!targetSectionId) {
      console.warn('No target section found');
      return;
    }
    
    // Parse drag data
    let dragData;
    try {
      dragData = JSON.parse(e.dataTransfer.getData('application/json'));
    } catch (err) {
      console.warn('Invalid drag data');
      return;
    }
    
    // Clean up visual feedback
    dropZone.classList.remove('drag-over');
    
    if (dragData.type === 'component-move') {
      this.moveComponentToSection(dragData.componentId, dragData.fromSection, targetSectionId);
    } else if (dragData.type === 'new-component') {
      this.addNewComponentToSection(dragData.componentType, targetSectionId);
    }
  }

  moveComponentToSection(componentId, fromSectionId, toSectionId) {
    if (fromSectionId === toSectionId) {
      console.log('Component already in this section');
      return;
    }
    
    const state = this.stateManager.getState();
    const sections = [...state.sections];
    
    // Find the sections
    const fromSection = sections.find(s => s.section_id === fromSectionId);
    const toSection = sections.find(s => s.section_id === toSectionId);
    
    if (!fromSection || !toSection) {
      console.warn('Section not found');
      return;
    }
    
    // Remove component from source section
    fromSection.components = fromSection.components.filter(id => id !== componentId);
    
    // Add component to target section
    if (!toSection.components) {
      toSection.components = [];
    }
    toSection.components.push(componentId);
    
    // Update component's sectionId
    const component = state.components[componentId];
    if (component) {
      component.sectionId = toSectionId;
    }
    
    // Dispatch state update
    this.stateManager.dispatch({
      type: 'UPDATE_SECTIONS',
      payload: sections
    });
    
    // Also update the component
    this.stateManager.dispatch({
      type: 'UPDATE_COMPONENT',
      payload: {
        id: componentId,
        updates: { sectionId: toSectionId }
      }
    });
    
    console.log(`✅ Moved component ${componentId} from section ${fromSectionId} to ${toSectionId}`);
    
    // Emit event for other systems
    this.eventBus.emit('component:moved', {
      componentId,
      fromSection: fromSectionId,
      toSection: toSectionId
    });
  }

  addNewComponentToSection(componentType, sectionId) {
    // ROOT FIX: Properly add component directly to the section
    // Generate component ID
    const componentId = `${componentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create component data with section assignment
    const componentData = {
      id: componentId,
      type: componentType,
      sectionId: sectionId,
      props: {},
      data: {},
      createdAt: Date.now()
    };
    
    // If using Pods fields, configure the component
    if (window.gmkbVueData && window.gmkbVueData.podsFields) {
      const podsConfig = this.getPodsConfigForComponent(componentType);
      if (podsConfig) {
        componentData.dataSource = 'pods';
        componentData.fields = podsConfig.fields;
        console.log(`✅ Configured ${componentType} component to use Pods fields:`, podsConfig.fields);
      }
    }
    
    // Add component using state manager
    this.stateManager.addComponent(componentData);
    
    // ROOT FIX: Log what's happening
    console.log('Component added to state:', componentData.id);
    const newState = this.stateManager.getState();
    console.log('Component in components object?', !!newState.components[componentData.id]);
    console.log('Total components:', Object.keys(newState.components || {}).length);
    
    // ROOT FIX: Force a render update immediately
    // The state manager should automatically trigger a render, but let's ensure it happens
    setTimeout(() => {
      // Trigger a manual render if needed
      if (window.GMKB && window.GMKB.renderer) {
        window.GMKB.renderer.render();
      }
      
      // Also emit state change event
      this.eventBus.emit('state:changed');
    }, 100);
    
    console.log(`✅ Added new ${componentType} component to section ${sectionId}`);
  }
  
  /**
   * ROOT FIX: Get Pods configuration for component type
   */
  getPodsConfigForComponent(componentType) {
    const podsFieldMapping = {
      'biography': {
        fields: ['biography', 'biography_short']
      },
      'guest-intro': {
        fields: ['first_name', 'last_name', 'guest_title', 'tagline', 'company']
      },
      'topics-questions': {
        fields: ['topic_1', 'topic_2', 'topic_3', 'topic_4', 'question_1', 'question_2', 'question_3', 'question_4', 'question_5']
      }
    };
    
    return podsFieldMapping[componentType];
  }

  updateDraggableComponents() {
    // Add draggable attribute to all components
    document.querySelectorAll('[data-component-id]').forEach(el => {
      const handle = el.querySelector('.component__drag-handle, .component__header');
      if (handle) {
        handle.draggable = true;
        handle.style.cursor = 'move';
      } else {
        // Make the whole component draggable if no handle
        el.draggable = true;
      }
    });
  }

  destroy() {
    // Remove event listeners
    document.removeEventListener('dragstart', this.handleDragStart, true);
    document.removeEventListener('dragend', this.handleDragEnd, true);
    document.removeEventListener('dragover', this.handleDragOver, true);
    document.removeEventListener('drop', this.handleDrop, true);
    document.removeEventListener('dragleave', this.handleDragLeave, true);
  }
}

export default SectionDragDropManager;
