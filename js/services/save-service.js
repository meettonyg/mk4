/**
 * Save functionality
 */

import { setState, getState } from '../state.js';

/**
 * Set up save system
 */
export function setupSaveSystem() {
    const saveBtn = document.getElementById('save-btn');

    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveMediaKit();
        });
    }

    // Auto-save every 30 seconds
    setInterval(() => {
        if (isUnsaved()) {
            autoSave();
        }
    }, 30000);
}

/**
 * Save the media kit
 */
export function saveMediaKit() {
    const saveBtn = document.getElementById('save-btn');
    const statusDot = document.querySelector('.toolbar__status-dot');
    const statusText = document.querySelector('.toolbar__status span');

    // Update UI to show saving state
    if (saveBtn) saveBtn.disabled = true;
    if (statusDot) statusDot.classList.add('toolbar__status-dot--saving');
    if (statusText) statusText.textContent = 'Saving...';

    // Collect all component data based on schemas
    const componentsData = collectComponentData();
    
    // Store the data
    const mediaKitData = {
        version: '1.0',
        updatedAt: new Date().toISOString(),
        components: componentsData
    };
    
    // Save to localStorage for demo purposes
    localStorage.setItem('mediaKitData', JSON.stringify(mediaKitData));
    
    // Log the schema-based data structure
    console.log('Media kit data (schema-based):', mediaKitData);

    // Simulate server save operation
    setTimeout(() => {
        setState('isUnsaved', false);
        if (saveBtn) saveBtn.disabled = false;
        if (statusDot) statusDot.classList.remove('toolbar__status-dot--saving');
        if (statusText) statusText.textContent = 'Saved';
        
        console.log('Media kit saved successfully');
    }, 1500);
}

/**
 * Collect component data based on schemas
 * @returns {Array} Component data array
 */
function collectComponentData() {
    const components = document.querySelectorAll('[data-component-id]');
    const componentsData = [];
    
    components.forEach(component => {
        const componentId = component.getAttribute('data-component-id');
        const componentType = component.getAttribute('data-component-type');
        const schemaData = component.getAttribute('data-schema');
        
        if (!componentId || !componentType) return;
        
        let schema;
        try {
            schema = schemaData ? JSON.parse(schemaData) : null;
        } catch (e) {
            console.error('Error parsing schema for component:', componentType, e);
            return;
        }
        
        if (!schema) {
            console.warn(`Component ${componentType} has no schema data. Skipping.`);
            return;
        }
        
        // Collect component data based on schema settings
        const componentData = {
            id: componentId,
            type: componentType,
            settings: {}
        };
        
        // Extract data based on schema definitions
        if (schema.settings) {
            Object.keys(schema.settings).forEach(settingKey => {
                const setting = schema.settings[settingKey];
                let value;
                
                // Get value based on setting type and selector
                if (setting.previewSelector) {
                    const previewEl = component.querySelector(setting.previewSelector);
                    if (previewEl) {
                        if (setting.updateMethod === 'textContent') {
                            value = previewEl.textContent;
                        } else if (setting.updateMethod === 'innerHTML') {
                            value = previewEl.innerHTML;
                        } else if (setting.updateMethod.startsWith('style.')) {
                            const styleProp = setting.updateMethod.substring(6);
                            value = previewEl.style[styleProp];
                        } else if (setting.updateMethod === 'src') {
                            value = previewEl.src;
                        } else if (setting.updateMethod === 'href') {
                            value = previewEl.href;
                        } else {
                            // Default to data attribute
                            value = previewEl.getAttribute(`data-${settingKey}`) || setting.default;
                        }
                    }
                }
                
                // Fallback to default if no value was found
                if (value === undefined && setting.default !== undefined) {
                    value = setting.default;
                }
                
                // Store the value
                componentData.settings[settingKey] = value;
            });
        }
        
        componentsData.push(componentData);
    });
    
    return componentsData;
}

/**
 * Auto-save the media kit
 */
function autoSave() {
    const statusText = document.querySelector('.toolbar__status span');
    if (statusText) statusText.textContent = 'Auto-saving...';
    
    setTimeout(() => {
        setState('isUnsaved', false);
        if (statusText) statusText.textContent = 'Saved';
    }, 1000);
}

/**
 * Mark the media kit as unsaved
 */
export function markUnsaved() {
    setState('isUnsaved', true);
    const statusText = document.querySelector('.toolbar__status span');
    if (statusText) statusText.textContent = 'Unsaved changes';
}

/**
 * Check if the media kit is unsaved
 * @returns {boolean} Whether the media kit is unsaved
 */
export function isUnsaved() {
    return getState('isUnsaved');
}
