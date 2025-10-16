<?php
/**
 * Podcast Player Component Template
 */

// ROOT FIX: Handle props data structure
if (isset($props) && is_array($props)) {
    // Extract from props array
    $title = $props['title'] ?? null;
    $description = $props['description'] ?? null;
    $episodes = $props['episodes'] ?? null;
    $podcastRssUrl = $props['podcastRssUrl'] ?? null;
    $podcastAppleId = $props['podcastAppleId'] ?? null;
    $podcastSpotifyId = $props['podcastSpotifyId'] ?? null;
    $componentId = $props['component_id'] ?? $props['componentId'] ?? null;
} else {
    // Direct variables might be set
    $title = $title ?? null;
    $description = $description ?? null;
    $episodes = $episodes ?? null;
    $podcastRssUrl = $podcastRssUrl ?? null;
    $podcastAppleId = $podcastAppleId ?? null;
    $podcastSpotifyId = $podcastSpotifyId ?? null;
    $componentId = $componentId ?? $id ?? null;
}

// Set defaults
$title = $title ?? 'Podcast Episodes';
$componentId = $componentId ?? 'podcast-player-' . time();
?>
<div class="gmkb-component gmkb-component--podcastplayer editable-element" data-element="podcast-player" data-component="podcast-player" data-component-id="<?php echo esc_attr($componentId ?? $id ?? ''); ?>" data-component-type="podcast-player">
    <div class="element-controls">
        <button class="control-btn" title="Move Up">↑</button>
        <button class="control-btn" title="Move Down">↓</button>
        <button class="control-btn" title="Duplicate">⧉</button>
        <button class="control-btn" title="Delete">×</button>
    </div>
    <h2 class="podcast-player-title"><?php echo $title ?? 'Podcast Episodes'; ?></h2>
    <?php if (isset($description)): ?>
        <div class="podcast-player-description"><?php echo $description; ?></div>
    <?php endif; ?>
    
    <?php if (isset($episodes) && !empty($episodes)): ?>
        <div class="active-player-container">
            <div class="active-player">
                <div class="active-player-artwork">
                    <img src="<?php echo $episodes[0]['artwork'] ?? '/assets/images/default-podcast.jpg'; ?>" alt="Episode Artwork">
                </div>
                <div class="active-player-info">
                    <h3 class="active-player-title"><?php echo $episodes[0]['title']; ?></h3>
                    <div class="active-player-details">
                        <span class="active-player-date"><?php echo $episodes[0]['date'] ?? ''; ?></span>
                        <span class="active-player-duration"><?php echo $episodes[0]['duration'] ?? ''; ?></span>
                    </div>
                </div>
                <div class="audio-player">
                    <audio id="podcast-audio" src="<?php echo $episodes[0]['audioUrl']; ?>" preload="metadata"></audio>
                    <div class="player-controls">
                        <button class="player-button skip-back-button">-15s</button>
                        <button class="player-button play-button">Play</button>
                        <button class="player-button skip-forward-button">+30s</button>
                        <div class="volume-control">
                            <button class="player-button volume-button">Volume</button>
                            <div class="volume-slider-container">
                                <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="1">
                            </div>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <div class="time-display">
                            <span class="current-time">0:00</span>
                            <span class="total-time">0:00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="episode-list">
            <?php foreach ($episodes as $index => $episode): ?>
                <div class="episode-item <?php echo $index === 0 ? 'active' : ''; ?>" data-index="<?php echo $index; ?>" data-audio="<?php echo $episode['audioUrl']; ?>">
                    <div class="episode-number"><?php echo str_pad($index + 1, 2, '0', STR_PAD_LEFT); ?></div>
                    <div class="episode-artwork">
                        <img src="<?php echo $episode['artwork'] ?? '/assets/images/default-podcast.jpg'; ?>" alt="Episode Artwork">
                    </div>
                    <div class="episode-info">
                        <h3 class="episode-title"><?php echo $episode['title']; ?></h3>
                        <div class="episode-details">
                            <span class="episode-date"><?php echo $episode['date'] ?? ''; ?></span>
                            <span class="episode-duration"><?php echo $episode['duration'] ?? ''; ?></span>
                        </div>
                        <div class="episode-description"><?php echo $episode['description'] ?? ''; ?></div>
                    </div>
                    <div class="episode-actions">
                        <button class="episode-play-btn">Play</button>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        
        <div class="podcast-player-footer">
            <button class="add-episode-btn">+ Add Episode</button>
            <?php if (isset($podcastRssUrl)): ?>
                <div class="podcast-subscribe">
                    <span>Subscribe:</span>
                    <a href="https://podcasts.apple.com/podcast/id<?php echo $podcastAppleId ?? ''; ?>" target="_blank" class="subscribe-link apple">Apple Podcasts</a>
                    <a href="https://open.spotify.com/show/<?php echo $podcastSpotifyId ?? ''; ?>" target="_blank" class="subscribe-link spotify">Spotify</a>
                    <a href="<?php echo $podcastRssUrl; ?>" target="_blank" class="subscribe-link rss">RSS</a>
                </div>
            <?php endif; ?>
        </div>
    <?php else: ?>
        <div class="podcast-player-placeholder">
            <div class="placeholder-content">
                <div class="placeholder-icon"></div>
                <h3>Add Your Podcast Episodes</h3>
                <p>Showcase your podcast episodes or audio content directly in your media kit.</p>
                <div class="placeholder-actions">
                    <button class="add-episode-btn">+ Add Episode</button>
                    <button class="import-feed-btn">Import from RSS Feed</button>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>