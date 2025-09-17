/**
 * Inline Editor System
 * Enables direct text editing in the preview area
 * 
 * ARCHITECTURE COMPLIANT:
 * ✅ Event-driven
 * ✅ No polling
 * ✅ Integrates with state manager
 * ✅ Simple and maintainable
 */

export class InlineEditor {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.activeEditor = null;
        this.originalContent = null;
        this.isEditing = false;
        
        this.init();
    }
    
    init() {
        // Make text elements editable on double-click
        document.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        
        // Save on blur or Enter key
        document.addEventListener('blur', this.handleBlur.bind(this), true);
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Listen for state changes to update editable elements
        document.addEventListener('gmkb:state-changed', this.updateEditableElements.bind(this));
        
        // Initialize editable elements on existing components
        setTimeout(() => {
            this.updateEditableElements();
        }, 500);
        
        console.log('✅ Inline Editor initialized - double-click any text to edit');
    }
    
    handleDoubleClick(e) {
        // Check if the clicked element is editable
        const editable = e.target.closest('[data-editable]');
        if (!editable || this.isEditing) return;
        
        // Get component info
        const component = editable.closest('[data-component-id]');
        if (!component) return;
        
        const componentId = component.dataset.componentId;
        const field = editable.dataset.editable;
        
        this.startEditing(editable, componentId, field);
    }
    
    startEditing(element, componentId, field) {
        // Check if element exists
        if (!element) {
            console.error('Cannot edit - element not found');
            return;
        }
        
        // Prevent multiple editors
        if (this.isEditing) {
            this.stopEditing(false);
        }
        
        this.isEditing = true;
        this.activeEditor = element;
        this.originalContent = element.textContent;
        
        // Make element editable
        element.contentEditable = true;
        element.classList.add('inline-editing');
        
        // Focus and select all text
        element.focus();
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Store component info
        element.dataset.componentId = componentId;
        element.dataset.field = field;
        
        // Show editing indicator
        this.showEditingIndicator(element);
        
        console.log(`📝 Editing ${field} in component ${componentId}`);
    }
    
    stopEditing(save = true) {
        if (!this.activeEditor || !this.isEditing) return;
        
        const element = this.activeEditor;
        const componentId = element.dataset.componentId;
        const field = element.dataset.field;
        const newContent = element.textContent.trim();
        
        // Remove editable state
        element.contentEditable = false;
        element.classList.remove('inline-editing');
        
        // Hide editing indicator
        this.hideEditingIndicator();
        
        if (save && newContent !== this.originalContent) {
            // Save to state manager
            this.saveContent(componentId, field, newContent);
        } else if (!save) {
            // Restore original content
            element.textContent = this.originalContent;
        }
        
        this.isEditing = false;
        this.activeEditor = null;
        this.originalContent = null;
    }
    
    saveContent(componentId, field, value) {
        // Get current component data
        const component = this.stateManager.getComponent(componentId);
        if (!component) return;
        
        // Prepare updates based on field type
        const updates = {};
        
        // Map field to component data structure
        if (field === 'title' || field === 'heading') {
            updates.title = value;
            if (component.props) updates.props = { ...component.props, title: value };
            if (component.data) updates.data = { ...component.data, title: value };
        } else if (field === 'subtitle' || field === 'subheading') {
            updates.subtitle = value;
            if (component.props) updates.props = { ...component.props, subtitle: value };
            if (component.data) updates.data = { ...component.data, subtitle: value };
        } else if (field === 'text' || field === 'content' || field === 'biography') {
            updates[field] = value;
            if (component.props) updates.props = { ...component.props, [field]: value };
            if (component.data) updates.data = { ...component.data, [field]: value };
        } else {
            // Generic field update
            updates[field] = value;
            if (component.props) updates.props = { ...component.props, [field]: value };
            if (component.data) updates.data = { ...component.data, [field]: value };
        }
        
        // Update component in state
        this.stateManager.updateComponent(componentId, updates);
        
        // Show save indicator
        this.showSaveIndicator();
        
        console.log(`✅ Saved ${field} for component ${componentId}`);
    }
    
    handleBlur(e) {
        if (this.activeEditor && e.target === this.activeEditor) {
            // Small delay to allow for clicking save/cancel buttons
            setTimeout(() => {
                if (this.isEditing) {
                    this.stopEditing(true);
                }
            }, 200);
        }
    }
    
    handleKeydown(e) {
        if (!this.isEditing || !this.activeEditor) return;
        
        // Save on Enter (Shift+Enter for new line)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.stopEditing(true);
        }
        
        // Cancel on Escape
        if (e.key === 'Escape') {
            e.preventDefault();
            this.stopEditing(false);
        }
    }
    
    updateEditableElements() {
        // Add data-editable attributes to eligible elements
        const editableSelectors = [
            '.hero__title',
            '.hero__subtitle',
            '.biography__text',
            '.guest-intro__name',
            '.guest-intro__title',
            '.guest-intro__company',
            '.contact__email',
            '.contact__phone',
            '.cta__title',
            '.cta__text',
            'h1[class*="__title"]',
            'h2[class*="__title"]',
            'h3[class*="__title"]',
            'p[class*="__text"]',
            'p[class*="__subtitle"]',
            // Vue component selectors
            '.vue-hero h1',
            '.vue-hero h2',
            '.vue-biography .biography-content',
            '.vue-component [contenteditable="false"]'
        ];
        
        editableSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                if (!element.hasAttribute('data-editable')) {
                    // Determine field name from class
                    const className = element.className;
                    let field = 'text';
                    
                    if (className.includes('title')) field = 'title';
                    else if (className.includes('subtitle')) field = 'subtitle';
                    else if (className.includes('text')) field = 'text';
                    else if (className.includes('biography')) field = 'biography';
                    else if (className.includes('name')) field = 'name';
                    else if (className.includes('company')) field = 'company';
                    else if (className.includes('email')) field = 'email';
                    else if (className.includes('phone')) field = 'phone';
                    
                    element.setAttribute('data-editable', field);
                    element.style.cursor = 'text';
                    element.title = 'Double-click to edit';
                }
            });
        });
    }
    
    showEditingIndicator(element) {
        // Remove any existing indicator
        this.hideEditingIndicator();
        
        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = 'inline-edit-indicator';
        indicator.innerHTML = `
            <div class="inline-edit-toolbar">
                <span class="inline-edit-label">Editing (Enter to save, Esc to cancel)</span>
            </div>
        `;
        
        // Position near element
        const rect = element.getBoundingClientRect();
        indicator.style.position = 'fixed';
        indicator.style.left = `${rect.left}px`;
        indicator.style.top = `${rect.top - 30}px`;
        indicator.style.zIndex = '10000';
        
        document.body.appendChild(indicator);
    }
    
    hideEditingIndicator() {
        const indicator = document.querySelector('.inline-edit-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    showSaveIndicator() {
        // Create save indicator
        const indicator = document.createElement('div');
        indicator.className = 'inline-save-indicator';
        indicator.textContent = '✅ Saved';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            z-index: 10000;
            animation: fadeInOut 2s ease;
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 2000);
    }
    
    destroy() {
        // Clean up event listeners
        document.removeEventListener('dblclick', this.handleDoubleClick);
        document.removeEventListener('blur', this.handleBlur);
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('gmkb:state-changed', this.updateEditableElements);
        
        // Stop any active editing
        if (this.isEditing) {
            this.stopEditing(false);
        }
    }
}

// Add required styles
const style = document.createElement('style');
style.textContent = `
    [data-editable] {
        transition: background-color 0.2s;
    }
    
    [data-editable]:hover {
        background-color: rgba(59, 130, 246, 0.05);
        outline: 1px dashed rgba(59, 130, 246, 0.3);
    }
    
    .inline-editing {
        background-color: rgba(59, 130, 246, 0.1) !important;
        outline: 2px solid #3b82f6 !important;
        border-radius: 2px;
        padding: 2px 4px;
    }
    
    .inline-edit-indicator {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 4px 8px;
        font-size: 12px;
        color: #6b7280;
    }
    
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-10px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

export default InlineEditor;
