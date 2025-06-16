/**
 * Template Loading Service
 * Loads pre-configured templates from JSON files
 */

import { stateManager } from './state-manager.js';
import { componentManager } from '../components/component-manager.js';

class TemplateLoader {
    constructor() {
        this.templates = [];
        this.loadAvailableTemplates();
    }
    
    /**
     * Load available templates
     */
    async loadAvailableTemplates() {
        // Define available templates
        this.templates = [
            {
                id: 'professional-speaker',
                name: 'Professional Speaker',
                description: 'Perfect for keynote speakers and conference presenters',
                thumbnail: '/wp-content/plugins/guestify-media-kit-builder/assets/templates/speaker.jpg',
                file: 'professional-speaker.json'
            },
            {
                id: 'podcast-host',
                name: 'Podcast Host',
                description: 'Ideal for podcast hosts and audio content creators',
                thumbnail: '/wp-content/plugins/guestify-media-kit-builder/assets/templates/podcast.jpg',
                file: 'podcast-host.json'
            },
            {
                id: 'minimal-professional',
                name: 'Minimal Professional',
                description: 'Clean and simple layout for any professional',
                thumbnail: '/wp-content/plugins/guestify-media-kit-builder/assets/templates/minimal.jpg',
                file: 'minimal-professional.json'
            }
        ];
    }
    
    /**
     * Get available templates
     */
    getTemplates() {
        return this.templates;
    }
    
    /**
     * Load a specific template
     * @param {string} templateId - Template ID
     */
    async loadTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }
        
        try {
            // Construct the URL for the template file
            const baseUrl = window.guestifyMediaKitBuilder?.pluginUrl || 
                          window.guestifyData?.pluginUrl || 
                          '/wp-content/plugins/guestify-media-kit-builder/';
            
            const templateUrl = `${baseUrl}templates/presets/${template.file}`;
            
            // Fetch the template data
            const response = await fetch(templateUrl);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.statusText}`);
            }
            
            const templateData = await response.json();
            
            // Clear existing components
            await this.clearExistingComponents();
            
            // Load components from template
            await this.loadComponentsFromTemplate(templateData);
            
            // Update metadata
            if (stateManager) {
                stateManager.updateMetadata({
                    templateId: templateId,
                    templateName: templateData.name
                });
            }
            
            return templateData;
            
        } catch (error) {
            console.error('Error loading template:', error);
            throw error;
        }
    }
    
    /**
     * Clear existing components
     */
    async clearExistingComponents() {
        if (!stateManager) return;
        
        // Get all component IDs
        const state = stateManager.getState();
        const componentIds = Object.keys(state.components || {});
        
        // Remove each component
        componentIds.forEach(id => {
            stateManager.removeComponent(id);
        });
        
        // Clear the preview
        const preview = document.getElementById('media-kit-preview');
        if (preview) {
            preview.innerHTML = '';
        }
    }
    
    /**
     * Load components from template data
     * @param {Object} templateData - Template data
     */
    async loadComponentsFromTemplate(templateData) {
        if (!templateData.components || !componentManager) return;
        
        // Hide empty state
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        // Disable rendering during batch update
        if (window.componentRenderer) {
            window.componentRenderer.disableRendering = true;
        }
        
        // Collect all components to add
        const componentsToAdd = [];
        
        // Process each component from the template
        for (const [index, component] of templateData.components.entries()) {
            try {
                // Generate component ID
                const componentId = `${component.type}-${Date.now()}-${index}`;
                componentsToAdd.push({
                    id: componentId,
                    type: component.type,
                    data: component.data,
                    order: index
                });
            } catch (error) {
                console.error(`Failed to prepare component ${component.type}:`, error);
            }
        }
        
        // Add all components at once
        if (componentsToAdd.length > 0) {
            // Initialize all components in state without triggering individual renders
            componentsToAdd.forEach(comp => {
                stateManager.initComponent(comp.id, comp.type, comp.data, true); // Skip notifications
            });
            
            // Re-enable rendering
            if (window.componentRenderer) {
                window.componentRenderer.disableRendering = false;
            }
            
            // Now trigger a single render for all components
            stateManager.notifyGlobalListeners();
        }
        
        // Mark as unsaved
        if (window.markUnsaved) {
            window.markUnsaved();
        }
        
        // Show success notification
        this.showNotification(`Template "${templateData.name}" loaded successfully`);
    }
    
    /**
     * Show notification
     * @param {string} message - Message to show
     */
    showNotification(message) {
        if (window.historyService && window.historyService.showToast) {
            window.historyService.showToast(message);
        } else {
            console.log(message);
        }
    }
}

// Create singleton instance
export const templateLoader = new TemplateLoader();

// Make it globally available
window.templateLoader = templateLoader;
