<?php
/**
 * Video Showcase Component Template
 * 
 * @package GMKB/Components
 */

// Security check
if (!defined('ABSPATH')) {
    exit;
}

// Get component props
$component_id = isset($props['component_id']) ? $props['component_id'] : 'video-showcase-' . uniqid();
$videos = isset($props['videos']) ? $props['videos'] : array();
$layout = isset($props['layout']) ? $props['layout'] : 'grid';
$columns = isset($props['columns']) ? intval($props['columns']) : 2;
$show_title = isset($props['showTitle']) ? $props['showTitle'] : true;

// Default videos for demo
if (empty($videos)) {
    $videos = array(
        array(
            'url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'title' => 'Sample Video 1',
            'thumbnail' => ''
        ),
        array(
            'url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'title' => 'Sample Video 2',
            'thumbnail' => ''
        )
    );
}
?>

<div class="gmkb-component gmkb-video-showcase" 
     id="<?php echo esc_attr($component_id); ?>"
     data-component-type="video-showcase"
     data-component-id="<?php echo esc_attr($component_id); ?>">
    
    <div class="gmkb-video-showcase__header">
        <h2 class="gmkb-video-showcase__title">Video Gallery</h2>
    </div>
    
    <div class="gmkb-video-showcase__grid" 
         data-layout="<?php echo esc_attr($layout); ?>"
         data-columns="<?php echo esc_attr($columns); ?>">
        
        <?php foreach ($videos as $index => $video): ?>
            <div class="gmkb-video-showcase__item">
                <?php if ($show_title && !empty($video['title'])): ?>
                    <h3 class="gmkb-video-showcase__item-title">
                        <?php echo esc_html($video['title']); ?>
                    </h3>
                <?php endif; ?>
                
                <div class="gmkb-video-showcase__video-wrapper">
                    <?php if (strpos($video['url'], 'youtube.com') !== false || strpos($video['url'], 'vimeo.com') !== false): ?>
                        <iframe 
                            src="<?php echo esc_url($video['url']); ?>"
                            frameborder="0"
                            allowfullscreen
                            class="gmkb-video-showcase__iframe">
                        </iframe>
                    <?php else: ?>
                        <video controls class="gmkb-video-showcase__video">
                            <source src="<?php echo esc_url($video['url']); ?>" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
        
    </div>
</div>

<style>
.gmkb-video-showcase {
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    margin: 20px 0;
}

.gmkb-video-showcase__header {
    margin-bottom: 20px;
    text-align: center;
}

.gmkb-video-showcase__title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.gmkb-video-showcase__grid {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(2, 1fr);
}

.gmkb-video-showcase__grid[data-columns="1"] {
    grid-template-columns: 1fr;
}

.gmkb-video-showcase__grid[data-columns="3"] {
    grid-template-columns: repeat(3, 1fr);
}

.gmkb-video-showcase__grid[data-columns="4"] {
    grid-template-columns: repeat(4, 1fr);
}

.gmkb-video-showcase__item {
    background: white;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.gmkb-video-showcase__item-title {
    padding: 10px;
    font-size: 16px;
    margin: 0;
}

.gmkb-video-showcase__video-wrapper {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
}

.gmkb-video-showcase__iframe,
.gmkb-video-showcase__video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

@media (max-width: 768px) {
    .gmkb-video-showcase__grid {
        grid-template-columns: 1fr;
    }
}
</style>
