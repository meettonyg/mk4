<?php
/**
 * Video Intro Component Template
 */
?>
<div class="video-intro-component editable-element" data-element="video-intro" data-component="video-intro" data-component-id="<?php echo esc_attr($componentId ?? $id ?? ''); ?>" data-component-type="video-intro">
    <div class="element-controls">
        <button class="control-btn" title="Move Up">↑</button>
        <button class="control-btn" title="Move Down">↓</button>
        <button class="control-btn" title="Duplicate">⧉</button>
        <button class="control-btn" title="Delete">×</button>
    </div>
    <h2 class="video-intro-title"><?php echo $title ?? 'Video Introduction'; ?></h2>
    <?php if (isset($description)): ?>
        <div class="video-intro-description"><?php echo $description; ?></div>
    <?php endif; ?>
    
    <div class="video-container">
        <?php if (isset($videoUrl) && !empty($videoUrl)): ?>
            <?php 
            // Determine video source (YouTube, Vimeo, or direct file)
            $videoType = 'unknown';
            if (strpos($videoUrl, 'youtube.com') !== false || strpos($videoUrl, 'youtu.be') !== false) {
                $videoType = 'youtube';
                // Extract YouTube video ID
                if (strpos($videoUrl, 'youtube.com/watch?v=') !== false) {
                    $videoId = substr($videoUrl, strpos($videoUrl, 'watch?v=') + 8);
                    if (strpos($videoId, '&') !== false) {
                        $videoId = substr($videoId, 0, strpos($videoId, '&'));
                    }
                } elseif (strpos($videoUrl, 'youtu.be/') !== false) {
                    $videoId = substr($videoUrl, strpos($videoUrl, 'youtu.be/') + 9);
                }
                
                if (isset($videoId)):
            ?>
                <div class="video-embed">
                    <iframe 
                        src="https://www.youtube.com/embed/<?php echo $videoId; ?>?rel=0" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                    ></iframe>
                </div>
            <?php endif; ?>
            <?php } elseif (strpos($videoUrl, 'vimeo.com') !== false) {
                $videoType = 'vimeo';
                // Extract Vimeo video ID
                $vimeoId = substr($videoUrl, strrpos($videoUrl, '/') + 1);
                if (isset($vimeoId)):
            ?>
                <div class="video-embed">
                    <iframe 
                        src="https://player.vimeo.com/video/<?php echo $vimeoId; ?>" 
                        frameborder="0" 
                        allow="autoplay; fullscreen; picture-in-picture" 
                        allowfullscreen
                    ></iframe>
                </div>
            <?php endif; ?>
            <?php } else {
                // Direct video file
                $videoType = 'direct';
            ?>
                <div class="video-player">
                    <video controls>
                        <source src="<?php echo $videoUrl; ?>" type="<?php echo $videoType ?? 'video/mp4'; ?>">
                        Your browser does not support the video tag.
                    </video>
                </div>
            <?php } ?>
        <?php else: ?>
            <div class="video-placeholder">
                <div class="video-placeholder-content">
                    <div class="video-placeholder-icon"></div>
                    <p>Add a video introduction to showcase your work or introduce yourself.</p>
                    <button class="add-video-btn">+ Add Video</button>
                </div>
            </div>
        <?php endif; ?>
    </div>
    
    <?php if (isset($videoUrl) && !empty($videoUrl)): ?>
        <button class="edit-video-btn">Edit Video</button>
    <?php endif; ?>
</div>