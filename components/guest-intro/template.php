<?php
/**
 * Guest Intro Component Template
 * Perfect for podcast hosts to introduce their guests
 */

// ROOT FIX: Handle props data structure
if (isset($props) && is_array($props)) {
    // Extract from props array
    $title = $props['title'] ?? null;
    $guest_name = $props['guest_name'] ?? null;
    $guest_title = $props['guest_title'] ?? null;
    $tagline = $props['tagline'] ?? null;
    $intro_text = $props['intro_text'] ?? null;
    $topics = $props['topics'] ?? null;
    $guest_website = $props['guest_website'] ?? null;
    $guest_social = $props['guest_social'] ?? null;
    $componentId = $props['component_id'] ?? $props['componentId'] ?? null;
} else {
    // Direct variables might be set
    $title = $title ?? null;
    $guest_name = $guest_name ?? null;
    $guest_title = $guest_title ?? null;
    $tagline = $tagline ?? null;
    $intro_text = $intro_text ?? null;
    $topics = $topics ?? null;
    $guest_website = $guest_website ?? null;
    $guest_social = $guest_social ?? null;
    $componentId = $componentId ?? null;
}

// Set defaults
$componentId = $componentId ?? 'guest-intro-' . time();
?>
<div class="content-section guest-intro-component editable-element" data-element="guest-intro" data-component="guest-intro" data-component-id="<?php echo esc_attr($componentId); ?>" data-component-type="guest-intro">
    <!-- ROOT FIX: Controls removed - ComponentControlsManager handles all control functionality dynamically -->
    <h2 class="section-title"><?php echo esc_html($title ?? 'Guest Introduction'); ?></h2>
    
    <div class="guest-intro-content">
        <div class="intro-headline">
            <span class="intro-label">Introducing:</span>
            <h3 class="guest-name"><?php echo esc_html($guest_name ?? 'Your Guest Name'); ?></h3>
        </div>
        
        <div class="guest-credentials">
            <p class="guest-title"><?php echo esc_html($guest_title ?? 'Professional Title & Company'); ?></p>
            <p class="guest-tagline"><?php echo esc_html($tagline ?? 'Expert in [Field] | Author | Speaker'); ?></p>
        </div>
        
        <div class="intro-description">
            <p><?php echo wp_kses_post($intro_text ?? 'A brief, compelling introduction that highlights your guest\'s expertise, achievements, and what makes them a perfect fit for your show. This sets the stage for an engaging conversation.'); ?></p>
        </div>
        
        <div class="key-topics">
            <h4 class="topics-label">In This Episode We Discuss:</h4>
            <ul class="topics-list">
                <?php if (isset($topics) && is_array($topics)): ?>
                    <?php foreach ($topics as $topic): ?>
                        <li><?php echo esc_html($topic); ?></li>
                    <?php endforeach; ?>
                <?php else: ?>
                    <li>Key insight or topic #1</li>
                    <li>Major discussion point #2</li>
                    <li>Fascinating revelation #3</li>
                <?php endif; ?>
            </ul>
        </div>
        
        <?php if (isset($guest_website) || isset($guest_social)): ?>
        <div class="guest-links">
            <?php if (isset($guest_website)): ?>
                <a href="<?php echo esc_url($guest_website); ?>" class="guest-website" target="_blank" rel="noopener">
                    Visit Website →
                </a>
            <?php endif; ?>
            <?php if (isset($guest_social)): ?>
                <a href="<?php echo esc_url($guest_social); ?>" class="guest-social" target="_blank" rel="noopener">
                    Follow on Social →
                </a>
            <?php endif; ?>
        </div>
        <?php endif; ?>
    </div>
</div>
