/**
 * Version History UI for Media Kit Builder
 * Provides interface for viewing and managing version history
 * 
 * @since 2.2.0
 */

(function() {
    'use strict';
    
    class VersionHistoryUI {
        constructor() {
            this.logger = window.structuredLogger || console;
            this.modal = null;
            this.currentPostId = null;
            this.versions = [];
            this.isLoading = false;
            
            this.init();
        }
        
        /**
         * Initialize version history UI
         */
        init() {
            this.logger.info('VERSION-HISTORY', 'Initializing Version History UI...');
            
            // Add toolbar button
            this.addToolbarButton();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Get current post ID
            this.currentPostId = this.getCurrentPostId();
            
            this.logger.info('VERSION-HISTORY', '✅ Version History UI initialized');
        }
        
        /**
         * Get current post ID
         */
        getCurrentPostId() {
            // From gmkbData
            if (window.gmkbData && window.gmkbData.postId) {
                return window.gmkbData.postId;
            }
            
            // From body attribute
            const body = document.body;
            if (body.dataset.postId) {
                return parseInt(body.dataset.postId);
            }
            
            // From URL
            const urlParams = new URLSearchParams(window.location.search);
            return parseInt(urlParams.get('post_id') || urlParams.get('mkcg_id') || 0);
        }
        
        /**
         * Add version history button to toolbar
         */
        addToolbarButton() {
            // Wait for toolbar to be ready
            const checkToolbar = () => {
                const toolbar = document.querySelector('.gmkb-toolbar__actions, .toolbar-actions');
                if (toolbar) {
                    // Check if button already exists
                    if (!toolbar.querySelector('[data-action="version-history"]')) {
                        const button = document.createElement('button');
                        button.className = 'gmkb-toolbar__button toolbar-button';
                        button.setAttribute('data-action', 'version-history');
                        button.setAttribute('title', 'Version History');
                        button.innerHTML = `
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 5V10L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16C6.68629 16 4 13.3137 4 10Z" stroke="currentColor" stroke-width="2"/>
                                <path d="M1 1L3 3L5 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M15 19L17 17L19 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>History</span>
                        `;
                        
                        // Add before save button if exists, otherwise at the end
                        const saveBtn = toolbar.querySelector('[data-action="save"]');
                        if (saveBtn) {
                            toolbar.insertBefore(button, saveBtn);
                        } else {
                            toolbar.appendChild(button);
                        }
                        
                        // Add click handler
                        button.addEventListener('click', () => this.showVersionHistory());
                        
                        this.logger.info('VERSION-HISTORY', 'Added version history button to toolbar');
                    }
                } else {
                    // Retry after a delay
                    setTimeout(checkToolbar, 500);
                }
            };
            
            checkToolbar();
        }
        
        /**
         * Setup event listeners
         */
        setupEventListeners() {
            // Listen for save events to create versions
            document.addEventListener('gmkb:state-saved', (e) => {
                this.logger.info('VERSION-HISTORY', 'State saved, considering auto-version');
                // Version creation is handled server-side
            });
            
            // Listen for major changes
            document.addEventListener('gmkb:theme-changed', (e) => {
                this.createVersion('Theme changed to ' + (e.detail?.theme || 'unknown'));
            });
            
            document.addEventListener('gmkb:section-deleted', (e) => {
                this.createVersion('Section deleted');
            });
        }
        
        /**
         * Show version history modal
         */
        async showVersionHistory() {
            if (!this.currentPostId) {
                this.showToast('No media kit loaded', 'error');
                return;
            }
            
            // Create modal if it doesn't exist
            if (!this.modal) {
                this.createModal();
            }
            
            // Show modal
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Load versions
            await this.loadVersions();
        }
        
        /**
         * Create the version history modal
         */
        createModal() {
            const modal = document.createElement('div');
            modal.className = 'gmkb-version-history-modal';
            modal.innerHTML = `
                <div class="gmkb-version-history-modal__backdrop"></div>
                <div class="gmkb-version-history-modal__content">
                    <div class="gmkb-version-history-modal__header">
                        <h2>Version History</h2>
                        <button class="gmkb-version-history-modal__close" data-action="close">×</button>
                    </div>
                    <div class="gmkb-version-history-modal__toolbar">
                        <button class="btn btn--secondary btn--small" data-action="create-version">
                            <span>Create Version</span>
                        </button>
                        <button class="btn btn--secondary btn--small" data-action="refresh">
                            <span>Refresh</span>
                        </button>
                    </div>
                    <div class="gmkb-version-history-modal__body">
                        <div class="gmkb-version-history-modal__loading">
                            Loading versions...
                        </div>
                        <div class="gmkb-version-history-modal__list" style="display: none;">
                            <!-- Versions will be inserted here -->
                        </div>
                        <div class="gmkb-version-history-modal__empty" style="display: none;">
                            <p>No versions found</p>
                            <p>Version history will appear here after you save changes.</p>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            this.modal = modal;
            
            // Add event listeners
            modal.querySelector('[data-action="close"]').addEventListener('click', () => this.closeModal());
            modal.querySelector('.gmkb-version-history-modal__backdrop').addEventListener('click', () => this.closeModal());
            modal.querySelector('[data-action="create-version"]').addEventListener('click', () => this.createVersionDialog());
            modal.querySelector('[data-action="refresh"]').addEventListener('click', () => this.loadVersions());
            
            // Add CSS if not already added
            if (!document.querySelector('#gmkb-version-history-styles')) {
                const style = document.createElement('style');
                style.id = 'gmkb-version-history-styles';
                style.textContent = `
                    .gmkb-version-history-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 100000;
                        display: none;
                    }
                    
                    .gmkb-version-history-modal__backdrop {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                    }
                    
                    .gmkb-version-history-modal__content {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: white;
                        border-radius: 8px;
                        width: 90%;
                        max-width: 800px;
                        max-height: 80vh;
                        display: flex;
                        flex-direction: column;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    }
                    
                    .gmkb-version-history-modal__header {
                        padding: 20px;
                        border-bottom: 1px solid #e2e8f0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .gmkb-version-history-modal__header h2 {
                        margin: 0;
                        font-size: 20px;
                        font-weight: 600;
                    }
                    
                    .gmkb-version-history-modal__close {
                        background: none;
                        border: none;
                        font-size: 30px;
                        cursor: pointer;
                        color: #64748b;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .gmkb-version-history-modal__close:hover {
                        color: #334155;
                    }
                    
                    .gmkb-version-history-modal__toolbar {
                        padding: 15px 20px;
                        border-bottom: 1px solid #e2e8f0;
                        display: flex;
                        gap: 10px;
                    }
                    
                    .gmkb-version-history-modal__body {
                        flex: 1;
                        overflow-y: auto;
                        padding: 20px;
                    }
                    
                    .gmkb-version-history-modal__loading,
                    .gmkb-version-history-modal__empty {
                        text-align: center;
                        padding: 40px;
                        color: #64748b;
                    }
                    
                    .gmkb-version-history-modal__list {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .version-item {
                        border: 1px solid #e2e8f0;
                        border-radius: 6px;
                        padding: 15px;
                        background: #f8fafc;
                        transition: all 0.2s;
                    }
                    
                    .version-item:hover {
                        background: #f1f5f9;
                        border-color: #cbd5e1;
                    }
                    
                    .version-item__header {
                        display: flex;
                        justify-content: space-between;
                        align-items: start;
                        margin-bottom: 10px;
                    }
                    
                    .version-item__title {
                        font-weight: 600;
                        color: #334155;
                    }
                    
                    .version-item__auto {
                        display: inline-block;
                        padding: 2px 6px;
                        background: #e2e8f0;
                        color: #64748b;
                        border-radius: 3px;
                        font-size: 11px;
                        margin-left: 8px;
                    }
                    
                    .version-item__actions {
                        display: flex;
                        gap: 8px;
                    }
                    
                    .version-item__action {
                        padding: 4px 8px;
                        background: white;
                        border: 1px solid #cbd5e1;
                        border-radius: 4px;
                        font-size: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    
                    .version-item__action:hover {
                        background: #f1f5f9;
                        border-color: #94a3b8;
                    }
                    
                    .version-item__action--danger {
                        color: #dc2626;
                        border-color: #fca5a5;
                    }
                    
                    .version-item__action--danger:hover {
                        background: #fee2e2;
                        border-color: #f87171;
                    }
                    
                    .version-item__meta {
                        display: flex;
                        gap: 15px;
                        font-size: 13px;
                        color: #64748b;
                    }
                    
                    .version-item__meta-item {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        /**
         * Close the modal
         */
        closeModal() {
            if (this.modal) {
                this.modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
        
        /**
         * Load versions from server
         */
        async loadVersions() {
            if (this.isLoading) return;
            
            this.isLoading = true;
            this.showLoading(true);
            
            try {
                const response = await this.ajaxRequest('gmkb_list_versions', {
                    post_id: this.currentPostId
                });
                
                if (response.success && response.data) {
                    this.versions = response.data.versions || [];
                    this.displayVersions();
                } else {
                    throw new Error(response.data || 'Failed to load versions');
                }
            } catch (error) {
                this.logger.error('VERSION-HISTORY', 'Error loading versions', error);
                this.showToast('Failed to load versions', 'error');
                this.showEmpty();
            } finally {
                this.isLoading = false;
                this.showLoading(false);
            }
        }
        
        /**
         * Display versions in the modal
         */
        displayVersions() {
            const listEl = this.modal.querySelector('.gmkb-version-history-modal__list');
            const emptyEl = this.modal.querySelector('.gmkb-version-history-modal__empty');
            
            if (this.versions.length === 0) {
                this.showEmpty();
                return;
            }
            
            // Hide empty state
            emptyEl.style.display = 'none';
            
            // Build version items HTML
            let html = '';
            this.versions.forEach((version, index) => {
                const date = new Date(version.timestamp);
                const isLatest = index === this.versions.length - 1;
                
                html += `
                    <div class="version-item" data-version-id="${version.version_id}">
                        <div class="version-item__header">
                            <div>
                                <span class="version-item__title">${this.escapeHtml(version.message)}</span>
                                ${version.is_auto ? '<span class="version-item__auto">AUTO</span>' : ''}
                            </div>
                            <div class="version-item__actions">
                                ${!isLatest ? `
                                    <button class="version-item__action" data-action="restore" data-version-id="${version.version_id}">
                                        Restore
                                    </button>
                                    <button class="version-item__action" data-action="compare" data-version-id="${version.version_id}">
                                        Compare
                                    </button>
                                ` : ''}
                                <button class="version-item__action version-item__action--danger" data-action="delete" data-version-id="${version.version_id}">
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div class="version-item__meta">
                            <div class="version-item__meta-item">
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                                </svg>
                                ${this.escapeHtml(version.author_name || 'Unknown')}
                            </div>
                            <div class="version-item__meta-item">
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                                </svg>
                                ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
                            </div>
                            ${version.size ? `
                                <div class="version-item__meta-item">
                                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H4v10h12V5h-2a1 1 0 100-2 2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd"/>
                                    </svg>
                                    ${this.formatSize(version.size)}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            
            listEl.innerHTML = html;
            listEl.style.display = 'block';
            
            // Add event listeners to action buttons
            listEl.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.target.dataset.action;
                    const versionId = e.target.dataset.versionId;
                    
                    switch (action) {
                        case 'restore':
                            this.restoreVersion(versionId);
                            break;
                        case 'compare':
                            this.compareVersions(versionId);
                            break;
                        case 'delete':
                            this.deleteVersion(versionId);
                            break;
                    }
                });
            });
        }
        
        /**
         * Show loading state
         */
        showLoading(show) {
            const loadingEl = this.modal.querySelector('.gmkb-version-history-modal__loading');
            const listEl = this.modal.querySelector('.gmkb-version-history-modal__list');
            const emptyEl = this.modal.querySelector('.gmkb-version-history-modal__empty');
            
            if (show) {
                loadingEl.style.display = 'block';
                listEl.style.display = 'none';
                emptyEl.style.display = 'none';
            } else {
                loadingEl.style.display = 'none';
            }
        }
        
        /**
         * Show empty state
         */
        showEmpty() {
            const loadingEl = this.modal.querySelector('.gmkb-version-history-modal__loading');
            const listEl = this.modal.querySelector('.gmkb-version-history-modal__list');
            const emptyEl = this.modal.querySelector('.gmkb-version-history-modal__empty');
            
            loadingEl.style.display = 'none';
            listEl.style.display = 'none';
            emptyEl.style.display = 'block';
        }
        
        /**
         * Create a new version with dialog
         */
        createVersionDialog() {
            const message = prompt('Enter a description for this version:');
            if (message) {
                this.createVersion(message);
            }
        }
        
        /**
         * Create a new version
         */
        async createVersion(message = '') {
            // Get current state
            const state = window.enhancedStateManager ? window.enhancedStateManager.getState() : null;
            
            if (!state) {
                this.showToast('No state to save', 'error');
                return;
            }
            
            try {
                const response = await this.ajaxRequest('gmkb_save_version', {
                    post_id: this.currentPostId,
                    state: JSON.stringify(state),
                    message: message
                });
                
                if (response.success) {
                    this.showToast('Version created successfully', 'success');
                    await this.loadVersions();
                } else {
                    throw new Error(response.data || 'Failed to create version');
                }
            } catch (error) {
                this.logger.error('VERSION-HISTORY', 'Error creating version', error);
                this.showToast('Failed to create version', 'error');
            }
        }
        
        /**
         * Restore a version
         */
        async restoreVersion(versionId) {
            if (!confirm('Are you sure you want to restore this version? Current changes will be lost.')) {
                return;
            }
            
            try {
                const response = await this.ajaxRequest('gmkb_restore_version', {
                    post_id: this.currentPostId,
                    version_id: versionId
                });
                
                if (response.success && response.data) {
                    // Update state manager with restored state
                    if (window.enhancedStateManager) {
                        window.enhancedStateManager.loadState(response.data.state);
                    }
                    
                    this.showToast('Version restored successfully', 'success');
                    this.closeModal();
                    
                    // Trigger re-render
                    document.dispatchEvent(new CustomEvent('gmkb:version-restored', {
                        detail: {
                            versionId: versionId,
                            state: response.data.state
                        }
                    }));
                } else {
                    throw new Error(response.data || 'Failed to restore version');
                }
            } catch (error) {
                this.logger.error('VERSION-HISTORY', 'Error restoring version', error);
                this.showToast('Failed to restore version', 'error');
            }
        }
        
        /**
         * Compare versions
         */
        compareVersions(versionId) {
            // Get current version ID (latest)
            const currentVersionId = this.versions.length > 0 ? this.versions[this.versions.length - 1].version_id : null;
            
            if (!currentVersionId) {
                this.showToast('No current version to compare with', 'error');
                return;
            }
            
            // This would open a comparison view (not implemented in this basic version)
            this.showToast('Version comparison coming soon', 'info');
        }
        
        /**
         * Delete a version
         */
        async deleteVersion(versionId) {
            if (!confirm('Are you sure you want to delete this version? This cannot be undone.')) {
                return;
            }
            
            try {
                const response = await this.ajaxRequest('gmkb_delete_version', {
                    post_id: this.currentPostId,
                    version_id: versionId
                });
                
                if (response.success) {
                    this.showToast('Version deleted successfully', 'success');
                    await this.loadVersions();
                } else {
                    throw new Error(response.data || 'Failed to delete version');
                }
            } catch (error) {
                this.logger.error('VERSION-HISTORY', 'Error deleting version', error);
                this.showToast('Failed to delete version', 'error');
            }
        }
        
        /**
         * Make AJAX request
         */
        async ajaxRequest(action, data = {}) {
            const formData = new FormData();
            formData.append('action', action);
            formData.append('nonce', window.gmkbData?.nonce || '');
            
            for (const key in data) {
                formData.append(key, data[key]);
            }
            
            const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData
            });
            
            return await response.json();
        }
        
        /**
         * Show toast notification
         */
        showToast(message, type = 'info') {
            if (window.showToast) {
                window.showToast(message, type);
            } else {
                // Fallback
                const toast = document.createElement('div');
                toast.className = `gmkb-toast gmkb-toast--${type}`;
                toast.textContent = message;
                toast.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
                    color: white;
                    padding: 12px 20px;
                    border-radius: 6px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    z-index: 100001;
                    animation: slideIn 0.3s ease;
                `;
                
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            }
        }
        
        /**
         * Escape HTML for display
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        /**
         * Format file size
         */
        formatSize(bytes) {
            const sizes = ['B', 'KB', 'MB', 'GB'];
            if (bytes === 0) return '0 B';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
        }
    }
    
    // Create and expose globally
    window.VersionHistoryUI = VersionHistoryUI;
    window.versionHistoryUI = new VersionHistoryUI();
    
    console.log('✅ Version History UI: Initialized and ready');
    
})();
