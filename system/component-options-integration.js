/**
 * Component Options Integration
 * Connects Component Options UI with edit button clicks
 * 
 * CHECKLIST COMPLIANT: Event-driven integration
 */

(function() {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    // Wait for Component Options UI to be ready
    document.addEventListener('gmkb:component-options-ui-ready', function(e) {
        logger.info('📋 Component Options UI integration ready');
        setupEditButtonIntegration();
    });
    
    function setupEditButtonIntegration() {
        // Listen for edit button clicks on components
        document.addEventListener('click', function(e) {
            // Check if clicked element is an edit button
            const editBtn = e.target.closest('.component-control-edit');
            if (!editBtn) return;
            
            // Get component element
            const component = editBtn.closest('.media-kit-component');
            if (!component) return;
            
            const componentId = component.dataset.componentId || component.id;
            const componentType = component.dataset.componentType || 
                                 component.className.match(/component-([^\s]+)/)?.[1] || 
                                 'unknown';
            
            logger.info('Edit button clicked for component:', componentId, componentType);
            
            // Open design panel
            openDesignPanelWithOptions(componentId, componentType, component);
        });
    }
    
    function openDesignPanelWithOptions(componentId, componentType, componentElement) {
        // Create or get existing design panel
        let sidebar = document.querySelector('.element-editor-sidebar');
        
        if (!sidebar) {
            sidebar = createDesignPanel(componentId, componentType);
            document.body.appendChild(sidebar);
        }
        
        // Show the sidebar
        sidebar.classList.add('show');
        
        // Fire event for Component Options UI
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('gmkb:design-panel-opened', {
                detail: {
                    componentId: componentId,
                    componentType: componentType,
                    panelElement: sidebar
                }
            }));
        }, 100);
    }
    
    function createDesignPanel(componentId, componentType) {
        const sidebar = document.createElement('div');
        sidebar.className = 'element-editor-sidebar show';
        sidebar.innerHTML = `
            <div class="element-editor__header">
                <div class="element-editor__title">${formatComponentName(componentType)} Settings</div>
                <button class="element-editor__close" aria-label="Close">&times;</button>
            </div>
            <div class="element-editor__body">
                <div class="form-section">
                    <h4 class="form-section__title">Loading Options...</h4>
                    <div class="component-options-loading">
                        Fetching component configuration...
                    </div>
                </div>
            </div>
        `;
        
        // Add close functionality
        const closeBtn = sidebar.querySelector('.element-editor__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.remove('show');
                setTimeout(() => sidebar.remove(), 300);
            });
        }
        
        // Close on ESC key
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                sidebar.classList.remove('show');
                setTimeout(() => sidebar.remove(), 300);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        return sidebar;
    }
    
    function formatComponentName(type) {
        return type.replace(/_/g, ' ').replace(/-/g, ' ')
                   .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Also integrate with component selection events
    document.addEventListener('gmkb:component-selected', function(e) {
        const { componentId, componentType } = e.detail || {};
        
        if (componentId && componentType) {
            logger.info('Component selected, checking for design panel');
            
            const sidebar = document.querySelector('.element-editor-sidebar');
            if (sidebar && sidebar.classList.contains('show')) {
                // Update the existing panel
                document.dispatchEvent(new CustomEvent('gmkb:design-panel-opened', {
                    detail: {
                        componentId: componentId,
                        componentType: componentType,
                        panelElement: sidebar
                    }
                }));
            }
        }
    });
    
    // Add basic styling if not present
    if (!document.getElementById('component-options-integration-styles')) {
        const styles = document.createElement('style');
        styles.id = 'component-options-integration-styles';
        styles.textContent = `
            .element-editor-sidebar {
                position: fixed;
                top: 0;
                right: -400px;
                width: 400px;
                height: 100vh;
                background: white;
                box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                transition: right 0.3s ease;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .element-editor-sidebar.show {
                right: 0;
            }
            
            .element-editor__header {
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f9fafb;
            }
            
            .element-editor__title {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .element-editor__close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .element-editor__close:hover {
                color: #374151;
            }
            
            .element-editor__body {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }
            
            .component-control-edit {
                cursor: pointer;
                padding: 4px 8px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 12px;
            }
            
            .component-control-edit:hover {
                background: #2563eb;
            }
        `;
        document.head.appendChild(styles);
    }
})();