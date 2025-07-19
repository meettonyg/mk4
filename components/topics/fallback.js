/**
 * Topics Component Fallback System - ARCHITECTURAL COMPLIANCE
 * 
 * This file handles topics-specific fallback rendering when server-side
 * rendering fails, following the scalable architecture principles.
 * 
 * @version 1.0.0-architectural-compliance
 */

(function() {
    'use strict';
    
    console.log('📚 Topics Fallback: Loading fallback system...');
    
    /**
     * Topics Fallback Handler Class
     */
    class TopicsFallback {
        constructor() {
            this.initializeEventListeners();
        }
        
        /**
         * Initialize event listeners for fallback requests
         */
        initializeEventListeners() {
            // Listen for fallback requests from main system
            document.addEventListener('gmkb:component-fallback-requested', (event) => {
                const { componentId, componentType, component } = event.detail;
                
                if (componentType === 'topics') {
                    console.log(`📚 Topics Fallback: Handling fallback for ${componentId}`);
                    this.renderTopicsFallback(componentId, component);
                }
            });
            
            console.log('📚 Topics Fallback: Event listeners initialized');
        }
        
        /**
         * Render topics fallback when server rendering fails
         */
        renderTopicsFallback(componentId, component) {
            try {
                console.log(`🔧 Topics Fallback: Rendering fallback for ${componentId}`);
                
                const fallbackHtml = this.generateTopicsFallbackHTML(component);
                this.insertTopicsIntoDOM(componentId, fallbackHtml, component);
                
                console.log(`✅ Topics Fallback: Successfully rendered fallback for ${componentId}`);
                return true;
                
            } catch (error) {
                console.error(`❌ Topics Fallback: Failed to render fallback for ${componentId}:`, error);
                return false;
            }
        }
        
        /**
         * Generate topics-specific fallback HTML
         */
        generateTopicsFallbackHTML(component) {
            const data = component.data || {};
            const topics = data.topics || ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5'];
            
            return `
                <div class="content-section editable-element topics-component layout-grid columns-2 has-topics" 
                     data-element="topics" 
                     data-component="topics" 
                     data-loading-resolved="true"
                     data-fallback-rendered="true">
                    
                    <div class="topics-header">
                        <h2 class="section-title" contenteditable="true" data-setting="title">
                            ${data.title || 'Speaking Topics'}
                        </h2>
                    </div>
                    
                    <div class="topics-container" 
                         data-has-topics="true"
                         data-loading-source="fallback"
                         data-loading-resolved="true">
                        
                        ${topics.map((topic, index) => `
                            <div class="topic-item" data-topic-index="${index}">
                                <div class="topic-content">
                                    <div class="topic-title" 
                                         contenteditable="true" 
                                         data-setting="topic_${index + 1}">
                                        ${topic}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="fallback-notice" style="
                        margin-top: 1rem;
                        padding: 0.5rem;
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 4px;
                        font-size: 0.875rem;
                        color: #856404;
                    ">
                        ⚠️ Fallback mode: Topics loaded from cache. Click to edit directly.
                    </div>
                </div>
            `;
        }
        
        /**
         * Insert topics component into DOM
         */
        insertTopicsIntoDOM(componentId, html, component) {
            const previewContainer = document.getElementById('media-kit-preview');
            if (!previewContainer) {
                console.error('❌ Topics Fallback: Preview container not found');
                return;
            }
            
            // Remove existing component if it exists
            const existingElement = document.getElementById(componentId);
            if (existingElement) {
                existingElement.remove();
            }
            
            // Create wrapper element
            const componentElement = document.createElement('div');
            componentElement.id = componentId;
            componentElement.className = 'media-kit-component topics-component';
            componentElement.setAttribute('data-component-type', 'topics');
            componentElement.setAttribute('data-component-id', componentId);
            componentElement.setAttribute('data-loading-complete', 'true');
            componentElement.setAttribute('data-fallback-rendered', 'true');
            
            // Insert the component HTML
            componentElement.innerHTML = html;
            
            // Append to preview container
            previewContainer.appendChild(componentElement);
            
            // Attach component interaction handlers if available
            if (window.componentControlsManager) {
                window.componentControlsManager.attachControls(componentElement, componentId);
            }
            
            // Dispatch completion event
            if (window.GMKB && window.GMKB.dispatch) {
                window.GMKB.dispatch('gmkb:topics-fallback-rendered', {
                    componentId: componentId,
                    timestamp: Date.now(),
                    fallbackComplete: true
                });
            }
            
            console.log(`✅ Topics Fallback: Component ${componentId} inserted into DOM`);
        }
        
        /**
         * Create topics-specific loading overlay
         */
        createTopicsLoadingOverlay(componentId) {
            const previewContainer = document.getElementById('media-kit-preview');
            if (!previewContainer) return;
            
            const overlay = document.createElement('div');
            overlay.id = `topics-loading-${componentId}`;
            overlay.className = 'topics-loading-overlay';
            overlay.innerHTML = `
                <div class="topics-loading-content">
                    <div class="topics-loading-spinner">📚</div>
                    <div class="topics-loading-title">Loading Topics Component</div>
                    <div class="topics-loading-description">Retrieving your topics data...</div>
                    <div class="topics-loading-progress">
                        <div class="progress-bar"></div>
                    </div>
                </div>
            `;
            
            overlay.style.cssText = `
                position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(255, 255, 255, 0.95); display: flex;
                align-items: center; justify-content: center; z-index: 1000;
                border-radius: 8px;
            `;
            
            previewContainer.appendChild(overlay);
            
            // Animate progress bar
            const progressBar = overlay.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.cssText = `
                    width: 0%; height: 4px; background: #3b82f6;
                    border-radius: 2px; transition: width 0.3s ease;
                `;
                
                setTimeout(() => progressBar.style.width = '30%', 100);
                setTimeout(() => progressBar.style.width = '60%', 1000);
                setTimeout(() => progressBar.style.width = '90%', 3000);
            }
        }
        
        /**
         * Remove topics loading overlay
         */
        removeTopicsLoadingOverlay(componentId) {
            const overlay = document.getElementById(`topics-loading-${componentId}`);
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            }
        }
    }
    
    // Initialize the fallback system when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.topicsFallback = new TopicsFallback();
            console.log('✅ Topics Fallback: System initialized');
        });
    } else {
        window.topicsFallback = new TopicsFallback();
        console.log('✅ Topics Fallback: System initialized');
    }
    
    // Export for debugging
    window.TopicsFallback = TopicsFallback;
    
})();