/**
 * Import/Export System for Media Kit Builder
 * Enables backup, restore, and sharing of media kits
 * 
 * ARCHITECTURE COMPLIANT:
 * ✅ Self-contained export format
 * ✅ Version compatibility checking
 * ✅ Event-driven operations
 * ✅ No external dependencies
 */

export class ImportExportManager {
    constructor(stateManager, version = '3.0.0') {
        this.stateManager = stateManager;
        this.version = version;
        this.exportFormats = ['json', 'template'];
    }
    
    /**
     * Export current media kit
     */
    async exportMediaKit(format = 'json', options = {}) {
        const state = this.stateManager.getState();
        
        const exportData = {
            version: this.version,
            exportDate: new Date().toISOString(),
            format: format,
            metadata: {
                title: options.title || 'Media Kit Export',
                description: options.description || '',
                author: options.author || window.gmkbData?.currentUser || 'Unknown',
                wordpress: {
                    version: window.gmkbData?.wpVersion || 'Unknown',
                    siteUrl: window.location.origin,
                    postId: window.gmkbData?.postId
                }
            },
            components: state.components || {},
            layout: state.layout || [],
            sections: state.sections || [],
            theme: state.theme || 'default',
            themeSettings: state.themeSettings || {},
            globalSettings: state.globalSettings || {}
        };
        
        // Add Pods data if requested
        if (options.includePods && window.gmkbData?.pods_data) {
            exportData.podsData = window.gmkbData.pods_data;
        }
        
        // Format based on type
        if (format === 'template') {
            // Template format excludes content, only structure
            exportData.components = this.stripContent(exportData.components);
            delete exportData.podsData;
        }
        
        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `media-kit-${format}-${timestamp}.json`;
        
        // Trigger download
        this.downloadJSON(exportData, filename);
        
        console.log(`✅ Exported media kit as ${format}: ${filename}`);
        
        return exportData;
    }
    
    /**
     * Import media kit from file
     */
    async importMediaKit(file, options = {}) {
        try {
            const content = await this.readFile(file);
            const data = JSON.parse(content);
            
            // Validate import data
            const validation = this.validateImport(data);
            if (!validation.valid) {
                throw new Error(`Import validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Check version compatibility
            if (!this.isVersionCompatible(data.version)) {
                if (!confirm(`This export is from version ${data.version}. Current version is ${this.version}. Import may not work correctly. Continue?`)) {
                    return null;
                }
            }
            
            // Import based on options
            if (options.mode === 'merge') {
                return await this.mergeImport(data);
            } else if (options.mode === 'template') {
                return await this.importAsTemplate(data);
            } else {
                // Default: replace
                return await this.replaceImport(data);
            }
            
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    }
    
    /**
     * Replace current state with imported data
     */
    async replaceImport(data) {
        // Confirm replacement
        if (!confirm('This will replace all current components. Are you sure?')) {
            return null;
        }
        
        // Clear current state
        this.stateManager.resetState();
        
        // Import new state
        const newState = {
            components: data.components || {},
            layout: data.layout || [],
            sections: data.sections || [],
            theme: data.theme || 'default',
            themeSettings: data.themeSettings || {},
            globalSettings: data.globalSettings || {}
        };
        
        // Apply new state
        this.stateManager.setState(newState);
        
        // Apply theme
        if (window.themeManager && data.theme) {
            window.themeManager.applyTheme(data.theme);
        }
        
        console.log('✅ Import complete: Replaced current media kit');
        
        // Dispatch import complete event
        document.dispatchEvent(new CustomEvent('gmkb:import-complete', {
            detail: { mode: 'replace', data }
        }));
        
        return newState;
    }
    
    /**
     * Merge imported data with current state
     */
    async mergeImport(data) {
        const currentState = this.stateManager.getState();
        
        // Generate new IDs for imported components to avoid conflicts
        const idMap = {};
        const newComponents = {};
        const newLayout = [];
        
        Object.entries(data.components || {}).forEach(([oldId, component]) => {
            const newId = `${component.type}_imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            idMap[oldId] = newId;
            
            newComponents[newId] = {
                ...component,
                id: newId,
                imported: true,
                importDate: new Date().toISOString()
            };
            
            newLayout.push(newId);
        });
        
        // Update section references
        const newSections = (data.sections || []).map(section => ({
            ...section,
            section_id: `${section.section_id}_imported_${Date.now()}`,
            components: section.components.map(comp => {
                const compId = typeof comp === 'string' ? comp : comp.component_id;
                return idMap[compId] || comp;
            })
        }));
        
        // Merge with current state
        const mergedState = {
            components: { ...currentState.components, ...newComponents },
            layout: [...currentState.layout, ...newLayout],
            sections: [...currentState.sections, ...newSections]
        };
        
        // Apply merged state
        this.stateManager.setState(mergedState);
        
        console.log(`✅ Import complete: Merged ${Object.keys(newComponents).length} components`);
        
        // Dispatch import complete event
        document.dispatchEvent(new CustomEvent('gmkb:import-complete', {
            detail: { mode: 'merge', data, imported: Object.keys(newComponents) }
        }));
        
        return mergedState;
    }
    
    /**
     * Import as template (structure only, no content)
     */
    async importAsTemplate(data) {
        const templates = [];
        
        Object.values(data.components || {}).forEach(component => {
            const template = {
                type: component.type,
                props: this.getStructureOnly(component.props || component.data || {}),
                layout: component.layout || {}
            };
            templates.push(template);
        });
        
        console.log(`✅ Imported ${templates.length} component templates`);
        
        // Save as custom template if ComponentTemplates is available
        if (window.componentTemplates) {
            const templateName = prompt('Enter a name for this template:');
            if (templateName) {
                window.componentTemplates.saveCustomTemplate(
                    templateName,
                    `Imported from ${data.metadata?.title || 'Unknown'}`,
                    templates,
                    this.stateManager
                );
            }
        }
        
        return templates;
    }
    
    /**
     * Validate import data structure
     */
    validateImport(data) {
        const errors = [];
        
        // Check required fields
        if (!data.version) errors.push('Missing version');
        if (!data.components && !data.layout) errors.push('Missing components or layout');
        
        // Validate component structure
        if (data.components) {
            Object.entries(data.components).forEach(([id, component]) => {
                if (!component.type) {
                    errors.push(`Component ${id} missing type`);
                }
            });
        }
        
        // Validate sections
        if (data.sections) {
            data.sections.forEach((section, index) => {
                if (!section.section_id) {
                    errors.push(`Section ${index} missing section_id`);
                }
            });
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Check version compatibility
     */
    isVersionCompatible(importVersion) {
        if (!importVersion) return false;
        
        const [importMajor] = importVersion.split('.');
        const [currentMajor] = this.version.split('.');
        
        // Major version must match
        return importMajor === currentMajor;
    }
    
    /**
     * Strip content from components (for template export)
     */
    stripContent(components) {
        const stripped = {};
        
        Object.entries(components).forEach(([id, component]) => {
            stripped[id] = {
                id: component.id,
                type: component.type,
                layout: component.layout || {},
                props: this.getStructureOnly(component.props || {})
            };
        });
        
        return stripped;
    }
    
    /**
     * Get structure without content
     */
    getStructureOnly(props) {
        const structure = {};
        
        Object.entries(props).forEach(([key, value]) => {
            if (typeof value === 'boolean' || typeof value === 'number') {
                structure[key] = value;
            } else if (typeof value === 'string') {
                // Keep structure indicators, remove actual content
                if (key.includes('style') || key.includes('align') || key.includes('type')) {
                    structure[key] = value;
                } else {
                    structure[key] = '';
                }
            } else if (Array.isArray(value)) {
                structure[key] = [];
            } else if (typeof value === 'object') {
                structure[key] = this.getStructureOnly(value);
            }
        });
        
        return structure;
    }
    
    /**
     * Read file content
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            
            reader.readAsText(file);
        });
    }
    
    /**
     * Download JSON file
     */
    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Create import UI
     */
    createImportUI() {
        const modal = document.createElement('div');
        modal.className = 'gmkb-import-modal';
        modal.innerHTML = `
            <div class="import-modal-content">
                <h2>Import Media Kit</h2>
                
                <div class="import-options">
                    <label class="import-option">
                        <input type="radio" name="import-mode" value="replace" checked>
                        <span>Replace Current</span>
                        <small>Replace all current components with imported ones</small>
                    </label>
                    
                    <label class="import-option">
                        <input type="radio" name="import-mode" value="merge">
                        <span>Merge</span>
                        <small>Add imported components to current ones</small>
                    </label>
                    
                    <label class="import-option">
                        <input type="radio" name="import-mode" value="template">
                        <span>As Template</span>
                        <small>Import structure only, without content</small>
                    </label>
                </div>
                
                <div class="import-file">
                    <input type="file" id="import-file-input" accept=".json">
                    <label for="import-file-input" class="btn btn-primary">Choose File</label>
                </div>
                
                <div class="import-actions">
                    <button class="btn btn-primary" id="import-confirm">Import</button>
                    <button class="btn btn-secondary" id="import-cancel">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle import
        const fileInput = modal.querySelector('#import-file-input');
        const confirmBtn = modal.querySelector('#import-confirm');
        const cancelBtn = modal.querySelector('#import-cancel');
        
        confirmBtn.addEventListener('click', async () => {
            const file = fileInput.files[0];
            if (!file) {
                alert('Please select a file');
                return;
            }
            
            const mode = modal.querySelector('input[name="import-mode"]:checked').value;
            
            try {
                await this.importMediaKit(file, { mode });
                modal.remove();
                alert('Import successful!');
            } catch (error) {
                alert(`Import failed: ${error.message}`);
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        return modal;
    }
}

// Add styles
const style = document.createElement('style');
style.textContent = `
    .gmkb-import-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .import-modal-content {
        background: white;
        border-radius: 8px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
    }
    
    .import-modal-content h2 {
        margin: 0 0 20px;
        color: #1a1a1a;
    }
    
    .import-options {
        margin: 20px 0;
    }
    
    .import-option {
        display: block;
        padding: 15px;
        margin: 10px 0;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .import-option:hover {
        border-color: #3b82f6;
        background: #f0f9ff;
    }
    
    .import-option input {
        margin-right: 10px;
    }
    
    .import-option span {
        font-weight: 600;
        color: #1a1a1a;
    }
    
    .import-option small {
        display: block;
        margin-top: 5px;
        color: #6b7280;
    }
    
    .import-file {
        margin: 20px 0;
    }
    
    .import-file input[type="file"] {
        display: none;
    }
    
    .import-file label {
        display: inline-block;
        padding: 10px 20px;
        background: #f3f4f6;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .import-file label:hover {
        background: #e5e7eb;
    }
    
    .import-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }
`;
document.head.appendChild(style);

export default ImportExportManager;
