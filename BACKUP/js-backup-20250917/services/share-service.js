/**
 * Share functionality
 */

/**
 * Set up share system
 */
export function setupShareSystem() {
    const shareBtn = document.getElementById('share-btn');

    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            shareMediaKit();
        });
    }
}

/**
 * Share the media kit
 */
function shareMediaKit() {
    const shareUrl = `https://guestify.com/share/${generateShareId()}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Daniel Jackson\'s Media Kit',
            text: 'Check out my professional media kit created with Guestify',
            url: shareUrl
        });
    } else {
        // Fallback for browsers without Web Share API
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Share link copied to clipboard!');
        });
    }
}

/**
 * Generate a random share ID
 * @returns {string} A random share ID
 */
function generateShareId() {
    return Math.random().toString(36).substr(2, 9);
}
