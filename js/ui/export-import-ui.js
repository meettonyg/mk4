/**
 * Export/Import UI Manager for Media Kit Builder
 * 
 * Provides UI controls for exporting and importing media kits.
 * Follows event-driven architecture with no polling.
 * 
 * @since 2.1.0
 */

(function() {
    'use strict';
    
    class ExportImportUI {
        constructor() {
            this.initialized = false;
            this.exportButton = null;
            this.importButton = null;
            
            // Wait for DOM and systems to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            } else {
                this.init();
            }
        }
        
        init() {
            // Prevent double initialization
            if (this.initialized) return;
            this.initialized = true;
            
            // Add export/import buttons to toolbar
            this.addToolbarButtons();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Add styles
            this.addStyles();
            
            if (window.gmkbData?.debugMode) {
                console.log('✅ Export/Import UI initialized');
            }
            
            // Dispatch ready event
            document.dispatchEvent(new CustomEvent('gmkb:export-import-ready', {
                detail: { manager: this }
            }));
        }
        
        addToolbarButtons() {
            const toolbar = document.querySelector('.builder-toolbar__actions, .toolbar__actions');
            if (!toolbar) {
                if (window.gmkbData?.debugMode) {
                    console.warn('Toolbar not found for export/import buttons');
                }
                return;
            }
            
            // Create button group
            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'toolbar__button-group export-import-group';
            
            // Export button
            this.exportButton = document.createElement('button');
            this.exportButton.className = 'toolbar__button toolbar__button--export';
            this.exportButton.innerHTML = `
                <i class="fas fa-download"></i>
                <span>Export</span>
            `;
            this.exportButton.title = 'Export Media Kit';
            
            // Import button  
            this.importButton = document.createElement('button');
            this.importButton.className = 'toolbar__button toolbar__button--import';
            this.importButton.innerHTML = `
                <i class="fas fa-upload"></i>
                <span>Import</span>
            `;
            this.importButton.title = 'Import Media Kit';
            
            // Add buttons to group
            buttonGroup.appendChild(this.exportButton);
            buttonGroup.appendChild(this.importButton);
            
            // Add to toolbar
            toolbar.appendChild(buttonGroup);
        }
        
        setupEventListeners() {
            // Export button click
            if (this.exportButton) {
                this.exportButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showExportDialog();
                });
            }
            
            // Import button click
            if (this.importButton) {
                this.importButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showImportDialog();
                });
            }
            
            // Listen for keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Ctrl+E for export
                if (e.ctrlKey && e.key === 'e' && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    this.showExportDialog();
                }
                
                // Ctrl+I for import
                if (e.ctrlKey && e.key === 'i' && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    this.showImportDialog();
                }
            });
        }
        
        showExportDialog() {
            // Create modal content
            const modalContent = `
                <div class="export-dialog">
                    <h2 class="export-dialog__title">Export Media Kit</h2>
                    
                    <div class="export-dialog__options">
                        <label class="export-option">
                            <input type="radio" name="export_type" value="full" checked>
                            <span class="export-option__label">Full Export</span>
                            <span class="export-option__description">
                                Export complete media kit with all components, data, and settings
                            </span>
                        </label>
                        
                        <label class="export-option">
                            <input type="radio" name="export_type" value="template">
                            <span class="export-option__label">Template Export</span>
                            <span class="export-option__description">
                                Export structure without content (useful for creating templates)
                            </span>
                        </label>
                        
                        <label class="export-option">
                            <input type="radio" name="export_type" value="components">
                            <span class="export-option__label">Components Only</span>
                            <span class="export-option__description">
                                Export only the components and their layout
                            </span>
                        </label>
                    </div>
                    
                    <div class="export-dialog__actions">
                        <button class="btn btn--primary" id="export-confirm">
                            <i class="fas fa-download"></i> Export
                        </button>
                        <button class="btn btn--secondary" id="export-cancel">
                            Cancel
                        </button>
                    </div>
                </div>
            `;
            
            // Show modal
            this.showModal(modalContent, () => {
                // Setup export confirm handler
                const confirmBtn = document.getElementById('export-confirm');
                const cancelBtn = document.getElementById('export-cancel');
                
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', () => {
                        const exportType = document.querySelector('input[name="export_type"]:checked')?.value || 'full';
                        this.performExport(exportType);
                        this.closeModal();
                    });
                }
                
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        this.closeModal();
                    });
                }
            });
        }
        
        showImportDialog() {
            // Create modal content
            const modalContent = `
                <div class="import-dialog">
                    <h2 class="import-dialog__title">Import Media Kit</h2>
                    
                    <div class="import-dialog__upload">
                        <input type="file" id="import-file" accept=".json" style="display: none;">
                        <label for="import-file" class="import-upload-area">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span>Click to select file or drag and drop</span>
                            <small>Accepts .json files exported from Media Kit Builder</small>
                        </label>
                        <div id="import-file-info" class="import-file-info" style="display: none;"></div>
                    </div>
                    
                    <div class="import-dialog__options">
                        <label class="import-option">
                            <input type="radio" name="import_mode" value="replace" checked>
                            <span class="import-option__label">Replace Current</span>
                            <span class="import-option__description">
                                Replace all current components with imported data
                            </span>
                        </label>
                        
                        <label class="import-option">
                            <input type="radio" name="import_mode" value="merge">
                            <span class="import-option__label">Merge</span>
                            <span class="import-option__description">
                                Add imported components to existing media kit
                            </span>
                        </label>
                        
                        <label class="import-option">
                            <input type="radio" name="import_mode" value="new">
                            <span class="import-option__label">Create New</span>
                            <span class="import-option__description">
                                Create a new media kit from imported data
                            </span>
                        </label>
                    </div>
                    
                    <div class="import-dialog__preview" id="import-preview" style="display: none;"></div>
                    
                    <div class="import-dialog__actions">
                        <button class="btn btn--primary" id="import-confirm" disabled>
                            <i class="fas fa-upload"></i> Import
                        </button>
                        <button class="btn btn--secondary" id="import-cancel">
                            Cancel
                        </button>
                    </div>
                </div>
            `;
            
            // Show modal
            this.showModal(modalContent, () => {
                this.setupImportHandlers();
            });
        }
        
        setupImportHandlers() {
            const fileInput = document.getElementById('import-file');
            const uploadArea = document.querySelector('.import-upload-area');
            const confirmBtn = document.getElementById('import-confirm');
            const cancelBtn = document.getElementById('import-cancel');
            
            let selectedFile = null;
            let importData = null;
            
            // File selection
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        this.handleImportFile(file);
                    }
                });
            }
            
            // Drag and drop
            if (uploadArea) {
                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.classList.add('drag-over');
                });
                
                uploadArea.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('drag-over');
                });
                
                uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('drag-over');
                    
                    const file = e.dataTransfer.files[0];
                    if (file && file.type === 'application/json') {
                        this.handleImportFile(file);
                    } else {
                        alert('Please drop a valid JSON file');
                    }
                });
            }
            
            // Import confirm
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    const importMode = document.querySelector('input[name="import_mode"]:checked')?.value || 'replace';
                    if (this.importFileData) {
                        this.performImport(this.importFileData, importMode);
                        this.closeModal();
                    }
                });
            }
            
            // Cancel
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeModal();
                });
            }
        }
        
        handleImportFile(file) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.importFileData = data;
                    
                    // Validate and show preview
                    this.validateAndPreviewImport(data);
                    
                    // Enable import button
                    const confirmBtn = document.getElementById('import-confirm');
                    if (confirmBtn) {
                        confirmBtn.disabled = false;
                    }
                    
                    // Show file info
                    const fileInfo = document.getElementById('import-file-info');
                    if (fileInfo) {
                        fileInfo.style.display = 'block';
                        fileInfo.innerHTML = `
                            <strong>File:</strong> ${file.name}<br>
                            <strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB<br>
                            <strong>Components:</strong> ${Object.keys(data.components || {}).length}
                        `;
                    }
                    
                } catch (error) {
                    alert('Invalid JSON file: ' + error.message);
                    console.error('Import file error:', error);
                }
            };
            
            reader.readAsText(file);
        }
        
        validateAndPreviewImport(data) {
            const preview = document.getElementById('import-preview');
            if (!preview) return;
            
            // Basic validation
            const hasComponents = data.components && Object.keys(data.components).length > 0;
            const version = data.version || 'Unknown';
            const exportDate = data.export_date || 'Unknown';
            
            preview.style.display = 'block';
            preview.innerHTML = `
                <h4>Import Preview</h4>
                <ul>
                    <li><strong>Version:</strong> ${version}</li>
                    <li><strong>Export Date:</strong> ${exportDate}</li>
                    <li><strong>Components:</strong> ${Object.keys(data.components || {}).length}</li>
                    <li><strong>Sections:</strong> ${Object.keys(data.sections || {}).length}</li>
                    <li><strong>Theme:</strong> ${data.theme || 'Default'}</li>
                </ul>
                ${!hasComponents ? '<p class="warning">⚠️ No components found in import file</p>' : ''}
            `;
        }
        
        async performExport(exportType) {
            try {
                // Get current post ID
                const postId = this.getPostId();
                if (!postId) {
                    alert('No media kit to export');
                    return;
                }
                
                // Show loading state
                if (this.exportButton) {
                    this.exportButton.disabled = true;
                    this.exportButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
                }
                
                // Prepare request
                const formData = new FormData();
                formData.append('action', 'gmkb_export_media_kit');
                formData.append('nonce', window.gmkbData?.nonce || '');
                formData.append('post_id', postId);
                formData.append('export_type', exportType);
                formData.append('format', 'json');
                
                // Send request
                const response = await fetch(window.gmkbData?.ajaxUrl || ajaxurl, {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Download the file
                    this.downloadJSON(result.data.export_data, result.data.filename);
                    
                    // Show success
                    if (window.showToast) {
                        window.showToast('Media kit exported successfully', 'success');
                    }
                } else {
                    throw new Error(result.data || 'Export failed');
                }
                
            } catch (error) {
                console.error('Export error:', error);
                alert('Export failed: ' + error.message);
                
            } finally {
                // Reset button state
                if (this.exportButton) {
                    this.exportButton.disabled = false;
                    this.exportButton.innerHTML = '<i class="fas fa-download"></i> Export';
                }
            }
        }
        
        async performImport(data, importMode) {
            try {
                // Get current post ID (for replace/merge modes)
                const postId = importMode === 'new' ? 0 : this.getPostId();
                
                // Show loading state
                if (this.importButton) {
                    this.importButton.disabled = true;
                    this.importButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
                }
                
                // Prepare request
                const formData = new FormData();
                formData.append('action', 'gmkb_import_media_kit');
                formData.append('nonce', window.gmkbData?.nonce || '');
                formData.append('post_id', postId);
                formData.append('import_mode', importMode);
                formData.append('import_data', JSON.stringify(data));
                
                // Send request
                const response = await fetch(window.gmkbData?.ajaxUrl || ajaxurl, {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Show success message
                    if (window.showToast) {
                        window.showToast(`Imported ${result.data.components_imported} components successfully`, 'success');
                    }
                    
                    // Show warnings if any
                    if (result.data.warnings && result.data.warnings.length > 0) {
                        console.warn('Import warnings:', result.data.warnings);
                    }
                    
                    // Reload the page to show imported data
                    if (importMode === 'new' && result.data.post_id) {
                        // Redirect to new media kit
                        const newUrl = new URL(window.location);
                        newUrl.searchParams.set('post_id', result.data.post_id);
                        window.location.href = newUrl.toString();
                    } else {
                        // Reload current page
                        window.location.reload();
                    }
                    
                } else {
                    throw new Error(result.data || 'Import failed');
                }
                
            } catch (error) {
                console.error('Import error:', error);
                alert('Import failed: ' + error.message);
                
            } finally {
                // Reset button state
                if (this.importButton) {
                    this.importButton.disabled = false;
                    this.importButton.innerHTML = '<i class="fas fa-upload"></i> Import';
                }
            }
        }
        
        downloadJSON(data, filename) {
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'media-kit-export.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
        }
        
        getPostId() {
            // Try multiple sources for post ID
            return window.gmkbData?.postId ||
                   window.gmkbData?.post_id ||
                   new URLSearchParams(window.location.search).get('post_id') ||
                   new URLSearchParams(window.location.search).get('mkcg_id') ||
                   document.body.getAttribute('data-post-id');
        }
        
        showModal(content, onReady) {
            // Remove any existing modal
            this.closeModal();
            
            // Create modal wrapper
            const modal = document.createElement('div');
            modal.className = 'gmkb-modal export-import-modal';
            modal.innerHTML = `
                <div class="gmkb-modal__backdrop"></div>
                <div class="gmkb-modal__content">
                    <button class="gmkb-modal__close">&times;</button>
                    ${content}
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Setup close handlers
            const backdrop = modal.querySelector('.gmkb-modal__backdrop');
            const closeBtn = modal.querySelector('.gmkb-modal__close');
            
            if (backdrop) {
                backdrop.addEventListener('click', () => this.closeModal());
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }
            
            // ESC key to close
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
            
            // Call ready callback
            if (onReady) {
                setTimeout(onReady, 10);
            }
        }
        
        closeModal() {
            const modal = document.querySelector('.export-import-modal');
            if (modal) {
                modal.remove();
            }
        }
        
        addStyles() {
            if (document.getElementById('export-import-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'export-import-styles';
            styles.textContent = `
                .export-import-group {
                    display: flex;
                    gap: 8px;
                    margin-left: 16px;
                    padding-left: 16px;
                    border-left: 1px solid rgba(255,255,255,0.2);
                }
                
                .toolbar__button--export,
                .toolbar__button--import {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }
                
                .toolbar__button--export:hover,
                .toolbar__button--import:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }
                
                .export-import-modal .gmkb-modal__content {
                    max-width: 600px;
                    padding: 32px;
                }
                
                .export-dialog__title,
                .import-dialog__title {
                    margin: 0 0 24px 0;
                    font-size: 24px;
                    color: #1a1a1a;
                }
                
                .export-dialog__options,
                .import-dialog__options {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .export-option,
                .import-option {
                    display: flex;
                    flex-direction: column;
                    padding: 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .export-option:hover,
                .import-option:hover {
                    border-color: #667eea;
                    background: #f9fafb;
                }
                
                .export-option input[type="radio"],
                .import-option input[type="radio"] {
                    margin-right: 12px;
                }
                
                .export-option__label,
                .import-option__label {
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                
                .export-option__description,
                .import-option__description {
                    font-size: 14px;
                    color: #6b7280;
                    margin-left: 24px;
                }
                
                .import-upload-area {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 48px;
                    border: 2px dashed #d1d5db;
                    border-radius: 8px;
                    background: #f9fafb;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                }
                
                .import-upload-area:hover,
                .import-upload-area.drag-over {
                    border-color: #667eea;
                    background: #ede9fe;
                }
                
                .import-upload-area i {
                    font-size: 48px;
                    color: #9ca3af;
                    margin-bottom: 16px;
                }
                
                .import-file-info {
                    padding: 12px;
                    background: #f3f4f6;
                    border-radius: 4px;
                    margin-top: 16px;
                    font-size: 14px;
                }
                
                .import-dialog__preview {
                    padding: 16px;
                    background: #f9fafb;
                    border-radius: 8px;
                    margin-bottom: 24px;
                }
                
                .import-dialog__preview h4 {
                    margin: 0 0 12px 0;
                }
                
                .import-dialog__preview ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .import-dialog__preview li {
                    padding: 4px 0;
                }
                
                .export-dialog__actions,
                .import-dialog__actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                
                .warning {
                    color: #f59e0b;
                    font-weight: 500;
                    margin-top: 12px;
                }
            `;
            
            document.head.appendChild(styles);
        }
    }
    
    // Initialize when ready
    window.gmkbExportImportUI = new ExportImportUI();
    
})();
