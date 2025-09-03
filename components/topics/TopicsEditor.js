/**
 * Topics Component Editor - Simplified Version
 * Standalone editor that doesn't depend on ComponentLifecycle
 * 
 * @version 3.1.0-standalone
 */

(function(window) {
    'use strict';
    
    console.log('TopicsEditor.js loading...');
    
    class TopicsEditor {
        constructor(containerEl, componentId, initialData, onUpdate) {
            this.container = containerEl;
            this.componentId = componentId;
            this.componentType = 'topics';
            this.data = initialData || {};
            this.onUpdate = onUpdate;
            this.listeners = [];
            
            // Track sync state
            this._skipDOMUpdate = false;
            this._syncInProgress = false;
            
            console.log('Topics editor constructed for', componentId);
        }
        
        async render() {
            const topics = this.data.topics || [];
            
            console.log(`Rendering ${topics.length} topics`);
            
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
            this.attachEventListeners();
            
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
        
        addEventListener(element, event, handler) {
            if (!element) return;
            element.addEventListener(event, handler);
            this.listeners.push({ element, event, handler });
        }
        
        attachEventListeners() {
            const listEl = this.container.querySelector('#topics-editor-list');
            const addBtn = this.container.querySelector('#add-topic-btn');
            
            // Prevent clicks from bubbling up
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
            
            this.data.topics = topics;
            
            // Call the update callback if provided
            if (this.onUpdate && !this._skipDOMUpdate) {
                this.onUpdate(this.componentId, { topics });
            }
            
            console.log(`Updated ${topics.length} topics for ${this.componentId}`);
        }
        
        // Provide async render wrapper for compatibility
        async performRender() {
            return this.render();
        }
        
        // Cleanup method
        destroy() {
            // Remove all event listeners
            this.listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.listeners = [];
            
            // Clear container
            if (this.container) {
                this.container.innerHTML = '';
            }
            
            console.log(`Topics editor ${this.componentId} destroyed`);
        }
    }
    
    // Expose globally
    window.TopicsEditor = TopicsEditor;
    
    // Register with the registry if available
    if (window.componentEditorRegistry) {
        window.componentEditorRegistry.register('topics', TopicsEditor);
        console.log('Topics editor registered with componentEditorRegistry');
    } else {
        console.log('componentEditorRegistry not available yet, will retry...');
        
        // Try again after DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                if (window.componentEditorRegistry) {
                    window.componentEditorRegistry.register('topics', TopicsEditor);
                    console.log('Topics editor registered after DOM ready');
                }
            });
        } else {
            // DOM already loaded, try with a delay
            setTimeout(function() {
                if (window.componentEditorRegistry && !window.componentEditorRegistry.hasEditor('topics')) {
                    window.componentEditorRegistry.register('topics', TopicsEditor);
                    console.log('Topics editor registered after delay');
                }
            }, 1000);
        }
    }
    
    console.log('TopicsEditor.js loaded successfully');
    
    // Create a test function
    window.quickTestTopics = function() {
        const container = document.getElementById('custom-content-editor');
        if (!container) {
            console.error('No container found');
            return;
        }
        
        const editor = new TopicsEditor(
            container,
            'test-topics',
            { topics: ['Topic 1', 'Topic 2', 'Topic 3'] },
            (id, data) => console.log('Updated:', data)
        );
        
        editor.render();
        return editor;
    };
})(window);
