/**
 * Topics Editor Save Handler
 * Saves topics directly to Pods custom fields
 */

class TopicsEditorSaveHandler {
    constructor() {
        this.logger = window.structuredLogger || console;
        this.init();
    }
    
    init() {
        // Listen for topics updates from the editor
        document.addEventListener('gmkb:component-content-updated', (event) => {
            if (event.detail && event.detail.data && event.detail.data.topics) {
                const componentId = event.detail.componentId;
                
                // Check if this is a topics component
                const component = window.enhancedStateManager?.getState()?.components?.[componentId];
                if (component && component.type === 'topics') {
                    this.saveTopicsToPods(event.detail.data.topics);
                }
            }
        });
    }
    
    saveTopicsToPods(topics) {
        const postId = window.gmkbData?.postId || window.gmkbData?.post_id;
        
        if (!postId) {
            this.logger.error('TOPICS_SAVE', 'No post ID available for saving');
            return;
        }
        
        // Prepare the data for Pods
        const formData = new FormData();
        formData.append('action', 'gmkb_save_topics_to_pods');
        formData.append('post_id', postId);
        formData.append('topics', JSON.stringify(topics));
        formData.append('nonce', window.gmkbData.nonce);
        
        // Save to Pods via AJAX
        fetch(window.gmkbData.ajaxUrl, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                this.logger.info('TOPICS_SAVE', `Saved ${topics.length} topics to Pods`);
                
                // Show success toast if available
                if (window.showToast) {
                    window.showToast('Topics saved', 'success');
                }
            } else {
                this.logger.error('TOPICS_SAVE', 'Failed to save topics:', result.data);
            }
        })
        .catch(error => {
            this.logger.error('TOPICS_SAVE', 'Error saving topics:', error);
        });
    }
}

// Initialize the save handler
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.topicsEditorSaveHandler = new TopicsEditorSaveHandler();
    });
} else {
    window.topicsEditorSaveHandler = new TopicsEditorSaveHandler();
}
