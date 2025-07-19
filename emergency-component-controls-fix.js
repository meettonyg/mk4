/**
 * @file emergency-component-controls-fix.js
 * @description Emergency fix to ensure component controls appear and work
 * Diagnoses and fixes missing controls issue immediately
 */

console.log('%c🚨 EMERGENCY COMPONENT CONTROLS FIX', 'font-size: 16px; font-weight: bold; color: #dc3545; background: #f8d7da; padding: 8px; border-radius: 4px;');

// Emergency fix implementation
function emergencyComponentControlsFix() {
    console.log('🚨 Running emergency component controls fix...');
    
    // Step 1: Find all components without controls
    const components = document.querySelectorAll('.media-kit-component');
    console.log(`📋 Found ${components.length} components to check`);
    
    if (components.length === 0) {
        console.error('❌ No components found in .media-kit-component selector');
        // Try alternative selectors
        const altComponents = document.querySelectorAll('[data-component-type], [data-component-id]');
        console.log(`📋 Found ${altComponents.length} components with alternative selectors`);
        
        if (altComponents.length > 0) {
            altComponents.forEach(component => {
                processComponent(component);
            });
        }
        return;
    }
    
    // Step 2: Process each component
    components.forEach((component, index) => {
        console.log(`🔍 Processing component ${index + 1}: ${component.id}`);
        processComponent(component);
    });
    
    console.log('✅ Emergency fix completed');
}

function processComponent(component) {
    const componentId = component.id || `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure component has an ID
    if (!component.id) {
        component.id = componentId;
    }
    
    // Check if controls already exist
    const existingControls = component.querySelector('.component-controls');
    if (existingControls) {
        console.log(`  ✅ Component ${componentId} already has controls`);
        return;
    }
    
    console.log(`  🔧 Adding controls to ${componentId}`);
    
    // Create controls directly (emergency fallback)
    const controlsHTML = createControlsHTML(componentId);
    component.insertAdjacentHTML('afterbegin', controlsHTML);
    
    // Attach event listeners
    attachControlEventListeners(component, componentId);
    
    // Mark as processed
    component.setAttribute('data-emergency-controls-added', 'true');
    
    console.log(`  ✅ Emergency controls added to ${componentId}`);
}

function createControlsHTML(componentId) {
    return `
        <div class="component-controls component-controls--emergency" style="
            position: absolute;
            top: 8px;
            right: 8px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            z-index: 100;
            pointer-events: none;
        ">
            <div class="component-controls__toolbar" style="
                display: flex;
                align-items: center;
                gap: 4px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                border-radius: 6px;
                padding: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                pointer-events: all;
            ">
                <button class="component-control component-control--edit" 
                        data-action="edit" 
                        data-component-id="${componentId}"
                        title="Edit Component"
                        style="
                            width: 28px;
                            height: 28px;
                            border: none;
                            background: transparent;
                            color: white;
                            cursor: pointer;
                            border-radius: 4px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: all 0.2s ease;
                        ">
                    ✏️
                </button>
                
                <div class="component-control-group" style="display: flex; flex-direction: column; gap: 2px;">
                    <button class="component-control component-control--move-up" 
                            data-action="moveUp" 
                            data-component-id="${componentId}"
                            title="Move Up"
                            style="
                                width: 20px;
                                height: 20px;
                                border: none;
                                background: transparent;
                                color: white;
                                cursor: pointer;
                                border-radius: 4px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.2s ease;
                            ">
                        ⬆️
                    </button>
                    <button class="component-control component-control--move-down" 
                            data-action="moveDown" 
                            data-component-id="${componentId}"
                            title="Move Down"
                            style="
                                width: 20px;
                                height: 20px;
                                border: none;
                                background: transparent;
                                color: white;
                                cursor: pointer;
                                border-radius: 4px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.2s ease;
                            ">
                        ⬇️
                    </button>
                </div>
                
                <button class="component-control component-control--duplicate" 
                        data-action="duplicate" 
                        data-component-id="${componentId}"
                        title="Duplicate Component"
                        style="
                            width: 28px;
                            height: 28px;
                            border: none;
                            background: transparent;
                            color: white;
                            cursor: pointer;
                            border-radius: 4px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: all 0.2s ease;
                        ">
                    📋
                </button>
                
                <button class="component-control component-control--delete" 
                        data-action="delete" 
                        data-component-id="${componentId}"
                        title="Delete Component"
                        style="
                            width: 28px;
                            height: 28px;
                            border: none;
                            background: transparent;
                            color: white;
                            cursor: pointer;
                            border-radius: 4px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: all 0.2s ease;
                        ">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

function attachControlEventListeners(component, componentId) {
    const controlsContainer = component.querySelector('.component-controls');
    if (!controlsContainer) return;
    
    // Hover behavior
    component.addEventListener('mouseenter', () => {
        controlsContainer.style.opacity = '1';
        controlsContainer.style.visibility = 'visible';
        controlsContainer.style.pointerEvents = 'all';
    });
    
    component.addEventListener('mouseleave', () => {
        controlsContainer.style.opacity = '0';
        controlsContainer.style.visibility = 'hidden';
        controlsContainer.style.pointerEvents = 'none';
    });
    
    // Button hover effects
    const buttons = controlsContainer.querySelectorAll('.component-control');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(255, 255, 255, 0.1)';
            button.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = 'transparent';
            button.style.transform = 'scale(1)';
        });
    });
    
    // Click handlers
    controlsContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const button = e.target.closest('[data-action]');
        if (!button) return;
        
        const action = button.getAttribute('data-action');
        const targetComponentId = button.getAttribute('data-component-id');
        
        console.log(`🔧 Control action: ${action} on component: ${targetComponentId}`);
        
        // Disable button temporarily
        button.disabled = true;
        setTimeout(() => {
            button.disabled = false;
        }, 500);
        
        // Handle actions
        handleControlAction(action, targetComponentId, component);
    });
}

function handleControlAction(action, componentId, componentElement) {
    console.log(`🔧 Handling ${action} for component ${componentId}`);
    
    switch (action) {
        case 'edit':
            handleEditAction(componentId, componentElement);
            break;
        case 'moveUp':
            handleMoveUpAction(componentId, componentElement);
            break;
        case 'moveDown':
            handleMoveDownAction(componentId, componentElement);
            break;
        case 'duplicate':
            handleDuplicateAction(componentId, componentElement);
            break;
        case 'delete':
            handleDeleteAction(componentId, componentElement);
            break;
        default:
            console.warn(`Unknown action: ${action}`);
    }
}

function handleEditAction(componentId, componentElement) {
    console.log(`✏️ Edit component: ${componentId}`);
    
    // Try to use existing ComponentManager
    if (window.GMKB && window.GMKB.systems && window.GMKB.systems.ComponentManager) {
        try {
            window.GMKB.systems.ComponentManager.editComponent(componentId);
            return;
        } catch (error) {
            console.warn('⚠️ ComponentManager.editComponent failed:', error);
        }
    }
    
    // Fallback: Switch to design tab and show generic editor
    switchToDesignTab();
    showGenericComponentEditor(componentId, componentElement);
}

function handleMoveUpAction(componentId, componentElement) {
    console.log(`⬆️ Move up component: ${componentId}`);
    
    const container = componentElement.parentNode;
    const previousSibling = componentElement.previousElementSibling;
    
    if (previousSibling && !previousSibling.classList.contains('empty-state')) {
        container.insertBefore(componentElement, previousSibling);
        showFeedback('Component moved up', 'success');
        
        // Update state if available
        updateComponentOrder();
    } else {
        showFeedback('Component is already at the top', 'warning');
    }
}

function handleMoveDownAction(componentId, componentElement) {
    console.log(`⬇️ Move down component: ${componentId}`);
    
    const container = componentElement.parentNode;
    const nextSibling = componentElement.nextElementSibling;
    
    if (nextSibling) {
        container.insertBefore(nextSibling, componentElement);
        showFeedback('Component moved down', 'success');
        
        // Update state if available
        updateComponentOrder();
    } else {
        showFeedback('Component is already at the bottom', 'warning');
    }
}

function handleDuplicateAction(componentId, componentElement) {
    console.log(`📋 Duplicate component: ${componentId}`);
    
    // Try to use existing ComponentManager
    if (window.GMKB && window.GMKB.systems && window.GMKB.systems.ComponentManager) {
        try {
            window.GMKB.systems.ComponentManager.duplicateComponent(componentId);
            return;
        } catch (error) {
            console.warn('⚠️ ComponentManager.duplicateComponent failed:', error);
        }
    }
    
    // Fallback: Clone the element
    const clonedElement = componentElement.cloneNode(true);
    const newId = `component-${Date.now()}-clone`;
    clonedElement.id = newId;
    
    // Remove emergency controls from clone and re-add
    const clonedControls = clonedElement.querySelector('.component-controls--emergency');
    if (clonedControls) {
        clonedControls.remove();
    }
    
    // Insert after original
    componentElement.parentNode.insertBefore(clonedElement, componentElement.nextSibling);
    
    // Add controls to cloned element
    processComponent(clonedElement);
    
    showFeedback('Component duplicated', 'success');
}

function handleDeleteAction(componentId, componentElement) {
    console.log(`🗑️ Delete component: ${componentId}`);
    
    if (confirm('Are you sure you want to delete this component?')) {
        // Try to use existing ComponentManager
        if (window.GMKB && window.GMKB.systems && window.GMKB.systems.ComponentManager) {
            try {
                window.GMKB.systems.ComponentManager.removeComponent(componentId);
                return;
            } catch (error) {
                console.warn('⚠️ ComponentManager.removeComponent failed:', error);
            }
        }
        
        // Fallback: Remove element directly
        componentElement.remove();
        showFeedback('Component deleted', 'success');
        
        // Update state if available
        updateComponentOrder();
    }
}

function switchToDesignTab() {
    // Remove active from all tabs
    document.querySelectorAll('.sidebar__tab').forEach(tab => {
        tab.classList.remove('sidebar__tab--active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('tab-content--active');
    });
    
    // Activate design tab
    const designTab = document.querySelector('[data-tab="design"]');
    const designTabContent = document.getElementById('design-tab');
    
    if (designTab && designTabContent) {
        designTab.classList.add('sidebar__tab--active');
        designTabContent.classList.add('tab-content--active');
        console.log('🎯 Switched to Design tab');
    }
}

function showGenericComponentEditor(componentId, componentElement) {
    const elementEditor = document.getElementById('element-editor');
    if (!elementEditor) return;
    
    const componentType = componentElement.getAttribute('data-component-type') || 'unknown';
    
    elementEditor.innerHTML = `
        <div class="element-editor__title">Emergency Component Editor</div>
        <div class="element-editor__subtitle">Component: ${componentId}</div>
        
        <div class="form-section">
            <h4 class="form-section__title">Component Information</h4>
            <div class="form-group">
                <label class="form-label">Component ID</label>
                <input type="text" class="form-input" value="${componentId}" readonly>
            </div>
            <div class="form-group">
                <label class="form-label">Component Type</label>
                <input type="text" class="form-input" value="${componentType}" readonly>
            </div>
        </div>
        
        <div class="form-section">
            <h4 class="form-section__title">Emergency Controls</h4>
            <div class="form-help-text">
                The component controls have been added via emergency fix. 
                You can edit content directly by clicking on text in the preview.
            </div>
            <div class="form-group">
                <button type="button" class="btn btn--primary" onclick="emergencyComponentControlsFix()">
                    Reapply Controls to All Components
                </button>
            </div>
        </div>
    `;
}

function updateComponentOrder() {
    // Try to update state manager if available
    if (window.GMKB && window.GMKB.systems && window.GMKB.systems.StateManager) {
        try {
            const components = document.querySelectorAll('.media-kit-component');
            const newLayout = Array.from(components).map(comp => comp.id).filter(id => id);
            
            const currentState = window.GMKB.systems.StateManager.getState();
            window.GMKB.systems.StateManager.setState({ 
                ...currentState, 
                layout: newLayout 
            });
            
            console.log('✅ Component order updated in state');
        } catch (error) {
            console.warn('⚠️ Failed to update component order:', error);
        }
    }
}

function showFeedback(message, type = 'success') {
    const feedback = document.createElement('div');
    feedback.className = `emergency-feedback emergency-feedback--${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10001;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(feedback);
    
    // Animate in
    setTimeout(() => {
        feedback.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        feedback.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }, 3000);
}

// Auto-run emergency fix
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(emergencyComponentControlsFix, 1000);
    });
} else {
    setTimeout(emergencyComponentControlsFix, 1000);
}

// Export for manual use
window.emergencyComponentControlsFix = emergencyComponentControlsFix;

console.log('🚨 Emergency component controls fix loaded - will run automatically');
console.log('💡 Run manually with: emergencyComponentControlsFix()');
