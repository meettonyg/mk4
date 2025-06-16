/**
 * Podcast Player Component JavaScript
 */
class PodcastPlayerComponent {
    constructor(element) {
        this.element = element;
        this.audioElement = null;
        this.activeEpisodeIndex = 0;
        this.episodes = [];
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volumeLevel = 1;
        this.init();
    }

    init() {
        // Initialize component
        console.log('Podcast Player component initialized');
        
        // Get audio element if it exists
        this.audioElement = this.element.querySelector('#podcast-audio');
        
        this.setupEventListeners();
        
        // Initialize time display if audio element exists
        if (this.audioElement) {
            this.audioElement.addEventListener('loadedmetadata', () => {
                this.updateTotalTime();
            });
            
            // Set volume
            this.audioElement.volume = this.volumeLevel;
        }
    }

    setupEventListeners() {
        // Player controls
        const playButton = this.element.querySelector('.play-button');
        const skipBackButton = this.element.querySelector('.skip-back-button');
        const skipForwardButton = this.element.querySelector('.skip-forward-button');
        const volumeButton = this.element.querySelector('.volume-button');
        const volumeSlider = this.element.querySelector('.volume-slider');
        const progressBar = this.element.querySelector('.progress-bar');
        
        if (playButton) {
            playButton.addEventListener('click', this.togglePlay.bind(this));
        }
        
        if (skipBackButton) {
            skipBackButton.addEventListener('click', () => this.skipTime(-15));
        }
        
        if (skipForwardButton) {
            skipForwardButton.addEventListener('click', () => this.skipTime(30));
        }
        
        if (volumeButton) {
            volumeButton.addEventListener('click', this.toggleMute.bind(this));
        }
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', this.setVolume.bind(this));
        }
        
        if (progressBar) {
            progressBar.addEventListener('click', this.seekToPosition.bind(this));
        }
        
        // Episode list interactions
        const episodeItems = this.element.querySelectorAll('.episode-item');
        episodeItems.forEach(item => {
            item.addEventListener('click', () => {
                this.changeEpisode(parseInt(item.dataset.index));
            });
            
            const playButton = item.querySelector('.episode-play-btn');
            if (playButton) {
                playButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.changeEpisode(parseInt(item.dataset.index));
                    this.playAudio();
                });
            }
        });
        
        // Add episode button
        const addEpisodeBtn = this.element.querySelector('.add-episode-btn');
        if (addEpisodeBtn) {
            addEpisodeBtn.addEventListener('click', this.handleAddEpisode.bind(this));
        }
        
        // Import feed button
        const importFeedBtn = this.element.querySelector('.import-feed-btn');
        if (importFeedBtn) {
            importFeedBtn.addEventListener('click', this.handleImportFeed.bind(this));
        }
        
        // Audio element events
        if (this.audioElement) {
            this.audioElement.addEventListener('timeupdate', this.updateProgress.bind(this));
            this.audioElement.addEventListener('ended', this.handleEpisodeEnd.bind(this));
            this.audioElement.addEventListener('play', () => {
                this.isPlaying = true;
                this.updatePlayButton();
            });
            this.audioElement.addEventListener('pause', () => {
                this.isPlaying = false;
                this.updatePlayButton();
            });
        }
    }
    
    togglePlay() {
        if (this.audioElement) {
            if (this.audioElement.paused) {
                this.playAudio();
            } else {
                this.pauseAudio();
            }
        }
    }
    
    playAudio() {
        if (this.audioElement) {
            this.audioElement.play()
                .then(() => {
                    this.isPlaying = true;
                    this.updatePlayButton();
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                });
        }
    }
    
    pauseAudio() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.isPlaying = false;
            this.updatePlayButton();
        }
    }
    
    skipTime(seconds) {
        if (this.audioElement) {
            this.audioElement.currentTime += seconds;
        }
    }
    
    toggleMute() {
        if (this.audioElement) {
            this.audioElement.muted = !this.audioElement.muted;
            const volumeButton = this.element.querySelector('.volume-button');
            if (volumeButton) {
                volumeButton.textContent = this.audioElement.muted ? 'Unmute' : 'Volume';
            }
        }
    }
    
    setVolume(e) {
        if (this.audioElement) {
            this.volumeLevel = e.target.value;
            this.audioElement.volume = this.volumeLevel;
            this.audioElement.muted = this.volumeLevel === 0;
        }
    }
    
    seekToPosition(e) {
        if (this.audioElement) {
            const progressBar = this.element.querySelector('.progress-bar');
            const progressBarRect = progressBar.getBoundingClientRect();
            const clickPosition = e.clientX - progressBarRect.left;
            const progressPercentage = clickPosition / progressBarRect.width;
            
            this.audioElement.currentTime = this.audioElement.duration * progressPercentage;
        }
    }
    
    updateProgress() {
        if (this.audioElement) {
            this.currentTime = this.audioElement.currentTime;
            
            // Update progress bar
            const progressFill = this.element.querySelector('.progress-fill');
            if (progressFill) {
                const progressPercentage = (this.currentTime / this.audioElement.duration) * 100;
                progressFill.style.width = `${progressPercentage}%`;
            }
            
            // Update current time display
            const currentTimeDisplay = this.element.querySelector('.current-time');
            if (currentTimeDisplay) {
                currentTimeDisplay.textContent = this.formatTime(this.currentTime);
            }
        }
    }
    
    updateTotalTime() {
        if (this.audioElement) {
            this.duration = this.audioElement.duration;
            
            // Update total time display
            const totalTimeDisplay = this.element.querySelector('.total-time');
            if (totalTimeDisplay) {
                totalTimeDisplay.textContent = this.formatTime(this.duration);
            }
        }
    }
    
    updatePlayButton() {
        const playButton = this.element.querySelector('.play-button');
        if (playButton) {
            playButton.textContent = this.isPlaying ? 'Pause' : 'Play';
        }
        
        // Update the episode item play button
        const episodeItems = this.element.querySelectorAll('.episode-item');
        episodeItems.forEach((item, index) => {
            const episodePlayBtn = item.querySelector('.episode-play-btn');
            if (episodePlayBtn) {
                if (index === this.activeEpisodeIndex) {
                    episodePlayBtn.textContent = this.isPlaying ? 'Pause' : 'Play';
                } else {
                    episodePlayBtn.textContent = 'Play';
                }
            }
        });
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    changeEpisode(index) {
        // Update active episode
        const episodeItems = this.element.querySelectorAll('.episode-item');
        if (index < 0 || index >= episodeItems.length) return;
        
        // Remove active class from all episodes
        episodeItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to selected episode
        episodeItems[index].classList.add('active');
        
        // Update active episode index
        this.activeEpisodeIndex = index;
        
        // Update audio source
        if (this.audioElement) {
            const wasPaused = this.audioElement.paused;
            
            this.audioElement.src = episodeItems[index].dataset.audio;
            this.audioElement.load();
            
            if (!wasPaused) {
                this.playAudio();
            }
        }
        
        // Update active player info
        const activePlayerTitle = this.element.querySelector('.active-player-title');
        const activePlayerArtwork = this.element.querySelector('.active-player-artwork img');
        const activePlayerDate = this.element.querySelector('.active-player-date');
        const activePlayerDuration = this.element.querySelector('.active-player-duration');
        
        if (activePlayerTitle) {
            activePlayerTitle.textContent = episodeItems[index].querySelector('.episode-title').textContent;
        }
        
        if (activePlayerArtwork) {
            activePlayerArtwork.src = episodeItems[index].querySelector('.episode-artwork img').src;
        }
        
        if (activePlayerDate) {
            activePlayerDate.textContent = episodeItems[index].querySelector('.episode-date').textContent;
        }
        
        if (activePlayerDuration) {
            activePlayerDuration.textContent = episodeItems[index].querySelector('.episode-duration').textContent;
        }
    }
    
    handleEpisodeEnd() {
        // Play next episode if available
        const nextIndex = this.activeEpisodeIndex + 1;
        const episodeItems = this.element.querySelectorAll('.episode-item');
        
        if (nextIndex < episodeItems.length) {
            this.changeEpisode(nextIndex);
            this.playAudio();
        } else {
            // Reset to beginning of current episode
            this.audioElement.currentTime = 0;
            this.isPlaying = false;
            this.updatePlayButton();
        }
    }
    
    handleAddEpisode() {
        console.log('Add episode triggered');
        // Implementation for adding a new episode
        // This would typically open a modal with episode details input
        alert('This would open the add episode form in the real implementation.');
    }
    
    handleImportFeed() {
        console.log('Import feed triggered');
        // Implementation for importing episodes from an RSS feed
        // This would typically open a modal with RSS feed URL input
        alert('This would open the import RSS feed form in the real implementation.');
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const podcastPlayerElements = document.querySelectorAll('.podcast-player-component');
    podcastPlayerElements.forEach(element => {
        new PodcastPlayerComponent(element);
    });
});