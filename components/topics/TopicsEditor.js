/**
 * Topics Component Editor
 * PHASE 1 COMPLIANT: Uses ComponentLifecycle for standardized event-driven communication
 * 
 * Handles the specific needs of Topics list editing with proper lifecycle management
 * Follows checklist: Event-driven, no polling, proper lifecycle events
 * 
 * @version 3.0.0-lifecycle
 */

(function(window) {
    'use strict';
    
    // Wait for ComponentLifecycle to be available
    if (!window.ComponentLifecycle) {
        console.error('TopicsEditor: ComponentLifecycle not found. Deferring initialization.');
        document.addEventListener('DOMContentLoaded', () => {
            if (window.ComponentLifecycle) {
                initializeTopicsEditor();
            } else {
                console.error('TopicsEditor: ComponentLifecycle still not available after DOM ready');
            }
        });
        return;
    }
    
    initializeTopicsEditor();
    
    function initializeTopicsEditor() {
        
class TopicsEditor extends window.ComponentLifecycle {
    constructor(containerEl, componentId, initialData, onUpdate) {
        // Call parent constructor with proper parameters
        super(containerEl, componentId, 'topics', initialData);
        
        // Store the update callback
        this.onUpdate = onUpdate;
        
        // Track sync state
        this._skipDOMUpdate = false;
        this._syncInProgress = false;
    }
    
    async render() {
        // Topics are already in the data passed to the constructor
        // The component system has already loaded them from Pods
        const topics = this.data.topics || [];
        
        // Create the editor HTML
        let html = `
            <div class="topics-content-editor">
                <div class="editor-header">
                    <h4>Speaking Topics</h4>
                    <p>Manage your speaking topics list</p>
                </div>
                <div class="topics-list" id="topics-editor-list">
        `;
        
        // Add existing topics
        if (topics.length > 0) {
            topics.forEach((topic, index) => {
                const topicText = typeof topic === 'string' ? topic : (topic.title || topic.text || '');
                html += this.createTopicRow(topicText, index);
            });
        } else {
            html += '<p class="no-topics-msg">No topics yet. Click "Add Topic" to start.</p>';
        }
        
        html += `
                </div>
                <button type="button" class="btn btn--primary" id="add-topic-btn">
                    + Add Topic
                </button>
            </div>
        `;
        
        this.container.innerHTML = html;
        
        // Don't call attachEventListeners directly - it will be called by performRender
        return Promise.resolve();
    }
    
    createTopicRow(text, index) {
        return `
            <div class="topic-row" data-index="${index}">
                <input type="text" 
                       class="topic-input" 
                       value="${text.replace(/"/g, '&quot;')}"
                       data-index="${index}"
                       placeholder="Enter topic ${index + 1}">
                <button type="button" class="btn-remove" data-index="${index}">×</button>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Call parent method first
        super.attachEventListeners();
        
        const listEl = this.container.querySelector('#topics-editor-list');
        const addBtn = this.container.querySelector('#add-topic-btn');
        
        // Prevent clicks from bubbling up and potentially closing the editor
        this.addEventListener(this.container, 'click', (e) => {
            e.stopPropagation();
        });
        
        // Add topic button
        if (addBtn) {
            this.addEventListener(addBtn, 'click', (e) => {
                e.stopPropagation();
                this.addTopic();
            });
        }
        
        // Topic input changes
        if (listEl) {
            this.addEventListener(listEl, 'input', (e) => {
                if (e.target.classList.contains('topic-input')) {
                    e.stopPropagation();
                    this.updateTopics();
                }
            });
            
            // Remove topic buttons
            this.addEventListener(listEl, 'click', (e) => {
                if (e.target.classList.contains('btn-remove')) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.removeTopic(parseInt(e.target.dataset.index));
                }
            });
        }
        
        // Register with Sync Coordinator for bi-directional sync
        this.registerWithSyncCoordinator();
    }
    
    registerWithSyncCoordinator() {
        if (window.SyncCoordinator) {
            const preview = document.querySelector(`#${this.componentId}`);
            if (preview) {
                // Get all input fields
                const inputs = this.container.querySelectorAll('.topic-input');
                const fields = Array.from(inputs).map((input, index) => `topic_${index + 1}`);
                
                window.SyncCoordinator.register(this.componentId, {
                    editor: this.container,
                    preview: preview,
                    fields: fields
                });
                
                const logger = window.structuredLogger || console;
                logger.info('SYNC', `Registered Topics editor ${this.componentId} with SyncCoordinator`);
            }
        }
    }
    
    addTopic() {
        const listEl = this.container.querySelector('#topics-editor-list');
        
        // Remove "no topics" message if present
        const noTopicsMsg = listEl.querySelector('.no-topics-msg');
        if (noTopicsMsg) {
            noTopicsMsg.remove();
        }
        
        // Add new topic row
        const newIndex = listEl.querySelectorAll('.topic-row').length;
        const newRow = document.createElement('div');
        newRow.innerHTML = this.createTopicRow('', newIndex);
        listEl.appendChild(newRow.firstElementChild);
        
        // Focus the new input
        const newInput = listEl.querySelector(`[data-index="${newIndex}"]`);
        if (newInput) {
            newInput.focus();
        }
        
        this.updateTopics();
    }
    
    removeTopic(index) {
        const listEl = this.container.querySelector('#topics-editor-list');
        const rowToRemove = listEl.querySelector(`.topic-row[data-index="${index}"]`);
        
        if (rowToRemove) {
            rowToRemove.remove();
            
            // Re-index remaining topics
            const remainingRows = listEl.querySelectorAll('.topic-row');
            remainingRows.forEach((row, newIndex) => {
                row.dataset.index = newIndex;
                const input = row.querySelector('.topic-input');
                if (input) {
                    input.dataset.index = newIndex;
                    input.placeholder = `Enter topic ${newIndex + 1}`;
                }
                const removeBtn = row.querySelector('.btn-remove');
                if (removeBtn) {
                    removeBtn.dataset.index = newIndex;
                }
            });
            
            // Show "no topics" message if all removed
            if (remainingRows.length === 0) {
                listEl.innerHTML = '<p class="no-topics-msg">No topics yet. Click "Add Topic" to start.</p>';
            }
            
            this.updateTopics();
        }
    }
    
    updateTopics() {
        const inputs = this.container.querySelectorAll('.topic-input');
        const topics = Array.from(inputs)
            .map(input => input.value.trim())
            .filter(text => text.length > 0);
        
        // Update the data with lifecycle event emission
        this.updateData({ topics });
        
        // Call the update callback if provided
        if (this.onUpdate && !this._skipDOMUpdate) {
            this.onUpdate(this.componentId, { topics });
        }
        
        // Log the update for debugging
        const logger = window.structuredLogger || console;
        logger.info('EDITOR', `Updated ${topics.length} topics for ${this.componentId}`);
    }
}

// Register this editor with the registry
if (window.componentEditorRegistry) {
    window.componentEditorRegistry.register('topics', TopicsEditor);
}

// Make globally available
window.TopicsEditor = TopicsEditor;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TopicsEditor;
}

    } // End of initializeTopicsEditor function
    
})(window);
