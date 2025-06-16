/**
 * Video Intro Component JavaScript
 */
class VideoIntroComponent {
    constructor(element) {
        this.element = element;
        this.videoUrl = '';
        this.videoType = '';
        this.init();
    }

    init() {
        // Initialize component
        console.log('Video Intro component initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addButton = this.element.querySelector('.add-video-btn');
        if (addButton) {
            addButton.addEventListener('click', this.handleAddVideo.bind(this));
        }
        
        const editButton = this.element.querySelector('.edit-video-btn');
        if (editButton) {
            editButton.addEventListener('click', this.handleEditVideo.bind(this));
        }
    }

    handleAddVideo() {
        console.log('Add video triggered');
        // Implementation for adding a new video
        // This would typically open a modal with video URL input and options
        this.openVideoEditor();
    }
    
    handleEditVideo() {
        console.log('Edit video triggered');
        // Implementation for editing an existing video
        this.openVideoEditor(true);
    }
    
    openVideoEditor(isEdit = false) {
        // Mock implementation of a video editor modal
        const action = isEdit ? 'Update' : 'Add';
        const mockVideoUrl = isEdit ? this.getCurrentVideoUrl() : '';
        
        const mockEditor = `
            <div class="mock-modal">
                <h3>${action} Video</h3>
                <div class="form-group">
                    <label>Video URL (YouTube, Vimeo, or direct file)</label>
                    <input type="text" value="${mockVideoUrl}" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label>Title (optional)</label>
                    <input type="text" placeholder="Video Introduction">
                </div>
                <div class="form-group">
                    <label>Description (optional)</label>
                    <textarea rows="3" placeholder="A short description about the video..."></textarea>
                </div>
                <div class="form-actions">
                    <button class="cancel-btn">Cancel</button>
                    <button class="save-btn">${action} Video</button>
                </div>
            </div>
        `;
        
        console.log('Video editor would look like:', mockEditor);
        alert(`This would open a ${action} Video modal in the real implementation.`);
    }
    
    getCurrentVideoUrl() {
        // Get current video URL from iframe or video element
        const iframe = this.element.querySelector('iframe');
        if (iframe) {
            const src = iframe.getAttribute('src');
            if (src.includes('youtube.com/embed/')) {
                const videoId = src.split('/').pop().split('?')[0];
                return `https://www.youtube.com/watch?v=${videoId}`;
            } else if (src.includes('player.vimeo.com/video/')) {
                const videoId = src.split('/').pop();
                return `https://vimeo.com/${videoId}`;
            }
        }
        
        const video = this.element.querySelector('video source');
        if (video) {
            return video.getAttribute('src');
        }
        
        return '';
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const videoIntroElements = document.querySelectorAll('.video-intro-component');
    videoIntroElements.forEach(element => {
        new VideoIntroComponent(element);
    });
});