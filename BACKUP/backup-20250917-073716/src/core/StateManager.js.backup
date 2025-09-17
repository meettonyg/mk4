/**
 * Simple State Manager - Single Source of Truth
 * No external dependencies, ~50 lines of code
 */
export class StateManager {
  constructor(initialState = {}) {
    this.state = {
      components: {},
      sections: [],
      theme: 'default',
      globalSettings: {},
      ...initialState
    };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  dispatch(action) {
    console.log('🔄 Action:', action.type, action.payload);
    
    switch (action.type) {
      case 'SET_STATE':
        this.state = { ...this.state, ...action.payload };
        break;
        
      case 'ADD_COMPONENT':
        const component = action.payload;
        this.state.components[component.id] = component;
        this.addComponentToSection(component.id, component.sectionId);
        break;
        
      case 'REMOVE_COMPONENT':
        const componentId = action.payload;
        const comp = this.state.components[componentId];
        if (comp) {
          this.removeComponentFromSection(componentId, comp.sectionId);
          delete this.state.components[componentId];
        }
        break;
        
      case 'UPDATE_COMPONENT':
        const { id, updates } = action.payload;
        if (this.state.components[id]) {
          this.state.components[id] = {
            ...this.state.components[id],
            ...updates
          };
        }
        break;
        
      case 'ADD_SECTION':
        this.state.sections.push(action.payload);
        break;
        
      case 'UPDATE_SECTIONS':
        this.state.sections = action.payload;
        break;
        
      case 'SET_THEME':
        this.state.theme = action.payload;
        break;
        
      default:
        console.warn('Unknown action type:', action.type);
    }
    
    this.notify();
  }

  addComponentToSection(componentId, sectionId) {
    const section = this.state.sections.find(s => s.section_id === sectionId);
    if (section && !section.components.includes(componentId)) {
      section.components.push(componentId);
    }
  }

  removeComponentFromSection(componentId, sectionId) {
    const section = this.state.sections.find(s => s.section_id === sectionId);
    if (section) {
      section.components = section.components.filter(id => id !== componentId);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}
