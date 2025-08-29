/**
 * Component Options UI Panel
 * PHASE 2: Configuration interface for component customization
 * 
 * Provides real-time component configuration editing with live preview
 * 
 * @version 2.0.0-phase2
 * @package GMKB/UI
 */

class ComponentOptionsUI {
    constructor() {
        this.logger = window.structuredLogger || console;
        this.stateManager = window.enhancedStateManager;
        this.configManager = window.componentConfigurationManager;
        this.currentComponentId = null;
        this.currentSchema = null;
        this.isUpdating = false;
        
        this.logger.info('UI', 'Component Options UI initializing');
        this.init();
    }
    
    init() {
        // Wait for core systems
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.onCoreSystemsReady();
        });
        
        // Listen for component selection events
        document.addEventListener('gmkb:component-selected', (event) => {
            this.onComponentSelected(event.detail);
        });
        
        // Listen for component deselection
        document.addEventListener('gmkb:component-deselected', () => {
            this.onComponentDeselected();
        });
        
        this.logger.info('UI', 'ComponentOptionsUI initialized');
    }
    
    onCoreSystemsReady() {
        this.setupUI();
    }
    
    setupUI() {
        this.createOptionsPanel();
        this.attachEventListeners();
    }
    
    createOptionsPanel() {
        // Find the design sidebar - ROOT FIX: Correct ID from template
        const designTab = document.getElementById('design-tab');
        if (!designTab) {
            this.logger.warn('UI', 'Design tab not found');
            return;
        }
        
        // Create options panel container
        const optionsPanel = document.createElement('div');
        optionsPanel.id = 'component-options-panel';
        optionsPanel.className = 'component-options-panel';
        optionsPanel.innerHTML = this.getOptionsPanelHTML();
        
        // Insert at the top of design tab
        designTab.insertBefore(optionsPanel, designTab.firstChild);
        
        this.logger.info('UI', 'Component options panel created');
    }
    
    getOptionsPanelHTML() {
        return `
            <div class="options-panel">
                <div class="options-panel__header">
                    <h3 class="options-panel__title">Component Options</h3>
                    <div class="options-panel__badge">[PHASE 2]</div>
                </div>
                
                <div class="options-panel__content">
                    <div class="options-panel__no-selection">
                        <p>Select a component to customize its options</p>
                    </div>
                    
                    <div class="options-panel__form" style="display: none;">
                        <div class="component-info">
                            <h4 class="component-info__type"></h4>
                            <p class="component-info__description"></p>
                        </div>
                        
                        <div class="options-sections"></div>
                        
                        <div class="options-panel__actions">
                            <button type="button" class="btn btn--secondary" id="reset-component-options">
                                Reset to Defaults
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const resetBtn = document.getElementById('reset-component-options');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetComponentToDefaults();
            });
        }
    }
    
    onComponentSelected(detail) {
        const { componentId, componentType } = detail;
        
        this.currentComponentId = componentId;
        this.currentSchema = this.configManager?.getSchema(componentType);
        
        if (!this.currentSchema) {
            this.logger.warn('UI', `No schema found for ${componentType}`);
            return;
        }
        
        this.showComponentOptions(componentId, componentType);
    }
    
    onComponentDeselected() {
        this.currentComponentId = null;
        this.currentSchema = null;
        this.hideComponentOptions();
    }
    
    showComponentOptions(componentId, componentType) {
        const optionsPanel = document.getElementById('component-options-panel');
        if (!optionsPanel) return;
        
        const noSelectionDiv = optionsPanel.querySelector('.options-panel__no-selection');
        const formDiv = optionsPanel.querySelector('.options-panel__form');
        
        if (noSelectionDiv) noSelectionDiv.style.display = 'none';
        if (formDiv) formDiv.style.display = 'block';
        
        this.updateComponentInfo(componentType);
        this.generateOptionsForm(componentId, componentType);
    }
    
    hideComponentOptions() {
        const optionsPanel = document.getElementById('component-options-panel');
        if (!optionsPanel) return;
        
        const noSelectionDiv = optionsPanel.querySelector('.options-panel__no-selection');
        const formDiv = optionsPanel.querySelector('.options-panel__form');
        
        if (noSelectionDiv) noSelectionDiv.style.display = 'block';
        if (formDiv) formDiv.style.display = 'none';
    }
    
    updateComponentInfo(componentType) {
        if (!this.currentSchema) return;
        
        const typeElement = document.querySelector('.component-info__type');
        const descElement = document.querySelector('.component-info__description');
        
        if (typeElement) {
            typeElement.textContent = this.currentSchema.name || componentType;
        }
        
        if (descElement) {
            descElement.textContent = this.currentSchema.description || 'Configure component options';
        }
    }
    
    generateOptionsForm(componentId, componentType) {
        const sectionsContainer = document.querySelector('.options-sections');
        if (!sectionsContainer) return;
        
        sectionsContainer.innerHTML = '<p>Component options will appear here when implemented.</p>';
        this.logger.info('UI', `Generated placeholder form for ${componentType}`);
    }
    
    resetComponentToDefaults() {
        this.logger.info('UI', 'Reset to defaults clicked');
    }
}

// Initialize safely
try {
    window.ComponentOptionsUI = ComponentOptionsUI;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.componentOptionsUI = new ComponentOptionsUI();
            console.log('ComponentOptionsUI initialized on DOM ready');
        });
    } else {
        window.componentOptionsUI = new ComponentOptionsUI();
        console.log('ComponentOptionsUI initialized immediately');
    }
} catch (error) {
    console.error('ComponentOptionsUI initialization failed:', error);
}
