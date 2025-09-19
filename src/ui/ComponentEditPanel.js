/**
 * Component Edit Panel
 * Provides in-sidebar editing for components
 */

export class ComponentEditPanel {
  constructor() {
    this.componentTab = document.getElementById('components-tab');
    this.originalContent = null;
    this.currentComponent = null;
    
    this.init();
  }
  
  init() {
    // Listen for edit events
    document.addEventListener('gmkb:component-action', (e) => {
      if (e.detail.action === 'edit') {
        // ROOT FIX: Use component's own handler if available
        const state = window.GMKB?.getState();
        const component = state?.components[e.detail.componentId];
        
        if (component?.type === 'biography') {
          // ROOT FIX: Use the biography component's self-contained handler
          if (window.gmkbComponentHandlers?.biography?.openEditPanel) {
            window.gmkbComponentHandlers.biography.openEditPanel(e.detail.componentId);
          } else {
            // Fallback: Try direct instance access
            const componentEl = document.querySelector(`[data-component-id="${e.detail.componentId}"]`);
            if (componentEl?._biographyInstance?.openEditPanel) {
              componentEl._biographyInstance.openEditPanel();
            } else {
              console.warn('Biography edit handler not available yet');
            }
          }
        } else {
          // Standard components use this edit panel
          this.openEditPanel(e.detail.componentId);
        }
      }
    });
  }
  
  openEditPanel(componentId) {
    // Get component from state
    const state = window.GMKB?.getState();
    if (!state || !state.components[componentId]) {
      console.error('Component not found:', componentId);
      return;
    }
    
    this.currentComponent = state.components[componentId];
    
    // Fix data structure if needed (convert arrays to objects)
    if (Array.isArray(this.currentComponent.data)) {
      this.currentComponent.data = {};
    }
    if (Array.isArray(this.currentComponent.props)) {
      this.currentComponent.props = {};
    }
    
    // Store original sidebar content
    this.originalContent = this.componentTab.innerHTML;
    
    // Render edit panel
    this.renderEditPanel();
  }
  
  renderEditPanel() {
    const component = this.currentComponent;
    const podsData = window.gmkbData?.pods_data || {};
    
    // Get current values
    const currentValues = this.getComponentValues(component, podsData);
    
    // Create edit panel HTML
    this.componentTab.innerHTML = `
      <div class="component-edit-panel">
        <div class="edit-panel-header">
          <button class="back-btn">← Back to Components</button>
          <h3>Edit ${this.formatComponentType(component.type)}</h3>
        </div>
        <div class="edit-panel-content">
          ${this.renderEditFields(component.type, currentValues)}
          <div class="edit-actions">
            <button class="save-btn">Save Changes</button>
            <button class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    // Add styles
    this.addStyles();
    
    // Attach event handlers
    this.attachHandlers();
  }
  
  getComponentValues(component, podsData) {
    const values = {};
    
    switch (component.type) {
      case 'biography':
        values.biography = component.data?.biography || 
                          component.props?.biography || 
                          podsData.biography || '';
        values.title = component.data?.title || 'Biography';
        values.showTitle = component.data?.showTitle !== false;
        break;
        
      case 'hero':
        values.title = component.data?.title || 
                      component.props?.title || 
                      `${podsData.first_name || ''} ${podsData.last_name || ''}`.trim() || 
                      'Hero Title';
        values.subtitle = component.data?.subtitle || 
                         component.props?.subtitle || 
                         podsData.tagline || '';
        values.ctaText = component.data?.ctaText || 'Contact Now';
        values.ctaUrl = component.data?.ctaUrl || '#contact';
        break;
        
      case 'topics':
        const topics = component.data?.topics || component.props?.topics || [];
        // Load from Pods if empty
        if (topics.length === 0) {
          for (let i = 1; i <= 5; i++) {
            if (podsData[`topic_${i}`]) {
              topics.push(podsData[`topic_${i}`]);
            }
          }
        }
        values.topics = topics;
        values.title = component.data?.title || 'Topics';
        break;
        
      case 'contact':
        values.email = component.data?.email || podsData.email || '';
        values.phone = component.data?.phone || podsData.phone || '';
        values.website = component.data?.website || podsData.website || '';
        values.title = component.data?.title || 'Contact';
        break;
        
      default:
        // Generic component
        values.content = component.data?.content || '';
        values.title = component.data?.title || component.type;
    }
    
    return values;
  }
  
  renderEditFields(type, values) {
    switch (type) {
      case 'biography':
        return `
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="edit-title" value="${this.escapeHtml(values.title)}">
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="edit-show-title" ${values.showTitle ? 'checked' : ''}>
              Show Title
            </label>
          </div>
          <div class="form-group">
            <label>Biography Text</label>
            <textarea id="edit-biography" rows="12">${this.escapeHtml(values.biography)}</textarea>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="use-pods-data">
              Auto-sync with guest post data
            </label>
          </div>
        `;
        
      case 'hero':
        return `
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="edit-title" value="${this.escapeHtml(values.title)}">
          </div>
          <div class="form-group">
            <label>Subtitle</label>
            <input type="text" id="edit-subtitle" value="${this.escapeHtml(values.subtitle)}">
          </div>
          <div class="form-group">
            <label>Button Text</label>
            <input type="text" id="edit-cta-text" value="${this.escapeHtml(values.ctaText)}">
          </div>
          <div class="form-group">
            <label>Button Link</label>
            <input type="text" id="edit-cta-url" value="${this.escapeHtml(values.ctaUrl)}">
          </div>
        `;
        
      case 'topics':
        return `
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="edit-title" value="${this.escapeHtml(values.title)}">
          </div>
          <div class="form-group">
            <label>Topics (one per line)</label>
            <textarea id="edit-topics" rows="8">${values.topics.join('\n')}</textarea>
          </div>
        `;
        
      case 'contact':
        return `
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="edit-title" value="${this.escapeHtml(values.title)}">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="edit-email" value="${this.escapeHtml(values.email)}">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" id="edit-phone" value="${this.escapeHtml(values.phone)}">
          </div>
          <div class="form-group">
            <label>Website</label>
            <input type="url" id="edit-website" value="${this.escapeHtml(values.website)}">
          </div>
        `;
        
      default:
        return `
          <div class="form-group">
            <label>Content</label>
            <textarea id="edit-content" rows="10">${this.escapeHtml(values.content)}</textarea>
          </div>
        `;
    }
  }
  
  attachHandlers() {
    // Back button
    const backBtn = this.componentTab.querySelector('.back-btn');
    if (backBtn) {
      backBtn.onclick = () => this.closeEditPanel();
    }
    
    // Cancel button
    const cancelBtn = this.componentTab.querySelector('.cancel-btn');
    if (cancelBtn) {
      cancelBtn.onclick = () => this.closeEditPanel();
    }
    
    // Save button
    const saveBtn = this.componentTab.querySelector('.save-btn');
    if (saveBtn) {
      saveBtn.onclick = () => this.saveChanges();
    }
  }
  
  saveChanges() {
    const component = this.currentComponent;
    const newData = {};
    
    switch (component.type) {
      case 'biography':
        newData.title = document.getElementById('edit-title')?.value || 'Biography';
        newData.showTitle = document.getElementById('edit-show-title')?.checked;
        newData.biography = document.getElementById('edit-biography')?.value || '';
        break;
        
      case 'hero':
        newData.title = document.getElementById('edit-title')?.value || '';
        newData.subtitle = document.getElementById('edit-subtitle')?.value || '';
        newData.ctaText = document.getElementById('edit-cta-text')?.value || '';
        newData.ctaUrl = document.getElementById('edit-cta-url')?.value || '';
        break;
        
      case 'topics':
        newData.title = document.getElementById('edit-title')?.value || 'Topics';
        const topicsText = document.getElementById('edit-topics')?.value || '';
        newData.topics = topicsText.split('\n').filter(t => t.trim());
        break;
        
      case 'contact':
        newData.title = document.getElementById('edit-title')?.value || 'Contact';
        newData.email = document.getElementById('edit-email')?.value || '';
        newData.phone = document.getElementById('edit-phone')?.value || '';
        newData.website = document.getElementById('edit-website')?.value || '';
        break;
        
      default:
        newData.content = document.getElementById('edit-content')?.value || '';
    }
    
    // Update component in state
    if (window.GMKB?.stateManager) {
      window.GMKB.stateManager.dispatch({
        type: 'UPDATE_COMPONENT',
        payload: {
          id: component.id,
          data: newData,
          props: newData // Update both data and props
        }
      });
      
      console.log('Component updated:', component.id, newData);
    }
    
    // Close panel
    this.closeEditPanel();
  }
  
  closeEditPanel() {
    if (this.originalContent) {
      this.componentTab.innerHTML = this.originalContent;
      this.originalContent = null;
      this.currentComponent = null;
    }
  }
  
  formatComponentType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ');
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }
  
  addStyles() {
    if (document.getElementById('component-edit-panel-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'component-edit-panel-styles';
    styles.textContent = `
      .component-edit-panel {
        padding: 20px;
      }
      
      .edit-panel-header {
        margin-bottom: 20px;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 15px;
      }
      
      .edit-panel-header h3 {
        margin: 10px 0 0 0;
        font-size: 18px;
      }
      
      .back-btn {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 5px 10px;
        font-size: 14px;
      }
      
      .back-btn:hover {
        color: #333;
        background: #f0f0f0;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        font-size: 13px;
        color: #333;
      }
      
      .form-group input[type="text"],
      .form-group input[type="email"],
      .form-group input[type="tel"],
      .form-group input[type="url"],
      .form-group textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .form-group textarea {
        resize: vertical;
        font-family: inherit;
      }
      
      .edit-actions {
        margin-top: 20px;
        display: flex;
        gap: 10px;
      }
      
      .save-btn, .cancel-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
      }
      
      .save-btn {
        background: #4CAF50;
        color: white;
      }
      
      .save-btn:hover {
        background: #45a049;
      }
      
      .cancel-btn {
        background: #f0f0f0;
        color: #333;
      }
      
      .cancel-btn:hover {
        background: #e0e0e0;
      }
    `;
    
    document.head.appendChild(styles);
  }
}

// Initialize when ready
export function initializeEditPanel() {
  if (document.getElementById('components-tab')) {
    return new ComponentEditPanel();
  }
  return null;
}
