<?php
/**
 * Stats Component Template
 */
?>
<div class="content-section" data-element="stats" data-component="stats">
    <h2 class="section-title"><?php echo esc_html($title ?? 'Key Statistics'); ?></h2>
    <div class="stats-grid">
        <?php if (isset($stats) && !empty($stats)): ?>
            <?php foreach ($stats as $stat): ?>
                <div class="stat-item">
                    <span class="stat-item__number"><?php echo esc_html($stat['value']); ?></span>
                    <div class="stat-item__label"><?php echo esc_html($stat['label']); ?></div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="stat-item">
                <span class="stat-item__number">1.2M</span>
                <div class="stat-item__label">Followers</div>
            </div>
            <div class="stat-item">
                <span class="stat-item__number">150+</span>
                <div class="stat-item__label">Podcast Shows</div>
            </div>
            <div class="stat-item">
                <span class="stat-item__number">500K</span>
                <div class="stat-item__label">Downloads</div>
            </div>
            <div class="stat-item">
                <span class="stat-item__number">5</span>
                <div class="stat-item__label">Years Experience</div>
            </div>
        <?php endif; ?>
    </div>
</div>
