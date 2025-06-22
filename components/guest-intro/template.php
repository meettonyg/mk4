<?php
/**
 * Guest Intro Component Template
 * Perfect for podcast hosts to introduce their guests
 */
?>
<div class="content-section guest-intro-component editable-element" data-element="guest-intro" data-component="guest-intro" data-component-id="<?php echo esc_attr($componentId ?? $id ?? ''); ?>" data-component-type="guest-intro">
    <div class="element-controls">
        <button class="control-btn" title="Move Up">↑</button>
        <button class="control-btn" title="Move Down">↓</button>
        <button class="control-btn" title="Duplicate">⧉</button>
        <button class="control-btn" title="Delete">×</button>
    </div>
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
