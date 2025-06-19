/**
 * Feature List Component Script
 * Handles dynamic feature addition/removal and state management
 * 
 * This script demonstrates:
 * - Component initialization pattern
 * - Event delegation for dynamic elements
 * - State management integration
 * - Data binding updates
 */

(function() {
    'use strict';
    
    // Component initialization
    document.addEventListener('DOMContentLoaded', initializeFeatureLists);
    
    // Re-initialize when new components are added
    if (window.componentRenderer) {
        window.componentRenderer.on('component-rendered', initializeFeatureLists);
    }
    
    /**
     * Initialize all feature list components on the page
     */
    function initializeFeatureLists() {
        const featureLists = document.querySelectorAll('[data-component-type="feature-list"]:not([data-initialized])');
        
        featureLists.forEach(component => {
            initializeComponent(component);
            component.dataset.initialized = 'true';
        });
    }
    
    /**
     * Initialize a single feature list component
     * @param {HTMLElement} component 
     */
    function initializeComponent(component) {
        const componentId = component.dataset.componentId;
        
        // Add feature button
        const addBtn = component.querySelector('.add-feature-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => addFeature(component));
        }
        
        // Remove feature buttons (use event delegation)
        component.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-feature-btn')) {
                removeFeature(component, e.target.dataset.index);
            }
        });
        
        // Handle contenteditable blur events for better state saving
        component.addEventListener('blur', (e) => {
            if (e.target.hasAttribute('contenteditable')) {
                saveContentEditableValue(e.target, componentId);
            }
        }, true);
    }
    
    /**
     * Add a new feature to the component
     * @param {HTMLElement} component 
     */
    function addFeature(component) {
        const grid = component.querySelector('.feature-list__grid');
        const featureCount = grid.querySelectorAll('.feature-item').length;
        const componentId = component.dataset.componentId;
        const iconStyle = getIconStyle(component);
        
        // Create new feature element
        const newFeature = createFeatureElement(featureCount, iconStyle);
        
        // Add to DOM
        grid.appendChild(newFeature);
        
        // Update state if state manager is available
        if (window.stateManager) {
            // Get current features array
            const currentData = window.stateManager.getComponentData(componentId) || {};
            const features = currentData.features || [];
            
            // Add new feature
            features.push({
                icon: '✨',
                title: 'New Feature',
                description: 'Describe this feature'
            });
            
            // Update state
            window.stateManager.updateComponent(componentId, 'features', features);
        }
        
        // Show toast notification
        if (window.historyService && window.historyService.showToast) {
            window.historyService.showToast('Feature added successfully', 'success');
        }
        
        // Focus on the new feature title for immediate editing
        const newTitle = newFeature.querySelector('.feature-item__title');
        if (newTitle) {
            newTitle.focus();
            selectAllText(newTitle);
        }
    }
    
    /**
     * Remove a feature from the component
     * @param {HTMLElement} component 
     * @param {string} index 
     */
    function removeFeature(component, index) {
        const componentId = component.dataset.componentId;
        const featureItem = component.querySelector(`[data-feature-index="${index}"]`);
        
        if (!featureItem) return;
        
        // Animate removal
        featureItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        featureItem.style.opacity = '0';
        featureItem.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            featureItem.remove();
            
            // Re-index remaining features
            reindexFeatures(component);
            
            // Update state if available
            if (window.stateManager) {
                const currentData = window.stateManager.getComponentData(componentId) || {};
                const features = currentData.features || [];
                
                // Remove feature at index
                features.splice(parseInt(index), 1);
                
                // Update state
                window.stateManager.updateComponent(componentId, 'features', features);
            }
            
            // Show toast notification
            if (window.historyService && window.historyService.showToast) {
                window.historyService.showToast('Feature removed', 'info');
            }
        }, 300);
    }
    
    /**
     * Create a new feature element
     * @param {number} index 
     * @param {string} iconStyle 
     * @returns {HTMLElement}
     */
    function createFeatureElement(index, iconStyle) {
        const div = document.createElement('div');
        div.className = 'feature-item';
        div.dataset.featureIndex = index;
        div.innerHTML = `
            <div class="feature-icon icon-style-${iconStyle}">
                <span class="feature-icon__emoji" contenteditable="true" 
                      data-setting="feature_${index}_icon">✨</span>
            </div>
            <h3 class="feature-item__title" contenteditable="true" 
                data-setting="feature_${index}_title">New Feature</h3>
            <p class="feature-item__description" contenteditable="true" 
                data-setting="feature_${index}_desc">Describe this feature</p>
            <button class="remove-feature-btn" title="Remove Feature" data-index="${index}">×</button>
        `;
        return div;
    }
    
    /**
     * Re-index features after removal
     * @param {HTMLElement} component 
     */
    function reindexFeatures(component) {
        const features = component.querySelectorAll('.feature-item');
        
        features.forEach((feature, index) => {
            feature.dataset.featureIndex = index;
            
            // Update data-setting attributes
            const icon = feature.querySelector('.feature-icon__emoji');
            const title = feature.querySelector('.feature-item__title');
            const desc = feature.querySelector('.feature-item__description');
            const removeBtn = feature.querySelector('.remove-feature-btn');
            
            if (icon) icon.dataset.setting = `feature_${index}_icon`;
            if (title) title.dataset.setting = `feature_${index}_title`;
            if (desc) desc.dataset.setting = `feature_${index}_desc`;
            if (removeBtn) removeBtn.dataset.index = index;
        });
    }
    
    /**
     * Get current icon style from component
     * @param {HTMLElement} component 
     * @returns {string}
     */
    function getIconStyle(component) {
        const existingIcon = component.querySelector('.feature-icon');
        if (!existingIcon) return 'circle';
        
        if (existingIcon.classList.contains('icon-style-square')) return 'square';
        if (existingIcon.classList.contains('icon-style-none')) return 'none';
        return 'circle';
    }
    
    /**
     * Save contenteditable value to state
     * @param {HTMLElement} element 
     * @param {string} componentId 
     */
    function saveContentEditableValue(element, componentId) {
        if (!window.stateManager || !element.dataset.setting) return;
        
        const settingKey = element.dataset.setting;
        const value = element.textContent.trim();
        
        // Update state
        window.stateManager.updateComponent(componentId, settingKey, value);
    }
    
    /**
     * Select all text in an element
     * @param {HTMLElement} element 
     */
    function selectAllText(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    // Export for external use
    window.FeatureListComponent = {
        initialize: initializeFeatureLists,
        addFeature: addFeature,
        removeFeature: removeFeature
    };
})();
