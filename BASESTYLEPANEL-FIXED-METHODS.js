// ROOT FIX: Helper to create immutable nested updates
// This ensures Vue reactivity triggers properly
const createSettingsUpdate = (component, path, value) => {
  const keys = path.split('.');
  const result = { ...component.settings };
  
  let current = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...current[key] };
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1];
  if (typeof value === 'object' && !Array.isArray(value)) {
    current[lastKey] = { ...current[lastKey], ...value };
  } else {
    current[lastKey] = value;
  }
  
  return result;
};

// Update methods - ALL must go through store.updateComponent for reactivity
const updateSpacing = (type, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.spacing) section.settings.style.spacing = {};
    
    section.settings.style.spacing[type] = value;
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (!component || !component.settings) return;
    
    // Create immutable update
    const updatedSettings = createSettingsUpdate(
      component,
      `style.spacing.${type}`,
      value
    );
    
    // Update through store to trigger Vue watcher
    store.updateComponent(props.componentId, { settings: updatedSettings });
  }
};

const updateBackground = (property, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.background) section.settings.style.background = {};
    
    section.settings.style.background[property] = value;
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (!component || !component.settings) return;
    
    // Create immutable update
    const updatedSettings = createSettingsUpdate(
      component,
      `style.background.${property}`,
      value
    );
    
    // Update through store to trigger Vue watcher
    store.updateComponent(props.componentId, { settings: updatedSettings });
  }
};

const updateTypography = (updates) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.typography) section.settings.style.typography = {};
    
    section.settings.style.typography = {
      ...section.settings.style.typography,
      ...updates
    };
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (!component || !component.settings) return;
    
    // Create immutable update with multiple properties
    const updatedSettings = {
      ...component.settings,
      style: {
        ...component.settings.style,
        typography: {
          ...component.settings.style.typography,
          ...updates
        }
      }
    };
    
    // Update through store to trigger Vue watcher
    store.updateComponent(props.componentId, { settings: updatedSettings });
  }
};

const updateBorderWidth = (side, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.border) section.settings.style.border = {};
    if (!section.settings.style.border.width) section.settings.style.border.width = {};
    
    section.settings.style.border.width[side] = value;
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (!component || !component.settings) return;
    
    // Create immutable update
    const updatedSettings = {
      ...component.settings,
      style: {
        ...component.settings.style,
        border: {
          ...component.settings.style.border,
          width: {
            ...component.settings.style.border.width,
            [side]: value
          }
        }
      }
    };
    
    // Update through store to trigger Vue watcher
    store.updateComponent(props.componentId, { settings: updatedSettings });
  }
};

const updateBorder = (property, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.border) section.settings.style.border = {};
    
    section.settings.style.border[property] = value;
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (!component || !component.settings) return;
    
    // Create immutable update
    const updatedSettings = {
      ...component.settings,
      style: {
        ...component.settings.style,
        border: {
          ...component.settings.style.border,
          [property]: value
        }
      }
    };
    
    // Update through store to trigger Vue watcher
    store.updateComponent(props.componentId, { settings: updatedSettings });
  }
};

const updateBorderRadius = (value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.border) section.settings.style.border = {};
    
    section.settings.style.border.radius = {
      topLeft: value,
      topRight: value,
      bottomRight: value,
      bottomLeft: value,
      unit: 'px'
    };
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (!component || !component.settings) return;
    
    // Create immutable update
    const updatedSettings = {
      ...component.settings,
      style: {
        ...component.settings.style,
        border: {
          ...component.settings.style.border,
          radius: {
            topLeft: value,
            topRight: value,
            bottomRight: value,
            bottomLeft: value,
            unit: 'px'
          }
        }
      }
    };
    
    // Update through store to trigger Vue watcher
    store.updateComponent(props.componentId, { settings: updatedSettings });
  }
};

const updateEffect = (property, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.effects) section.settings.style.effects = {};
    
    section.settings.style.effects[property] = value;
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (!component || !component.settings) return;
    
    // Create immutable update
    const updatedSettings = {
      ...component.settings,
      style: {
        ...component.settings.style,
        effects: {
          ...component.settings.style.effects,
          [property]: value
        }
      }
    };
    
    // Update through store to trigger Vue watcher
    store.updateComponent(props.componentId, { settings: updatedSettings });
  }
};
