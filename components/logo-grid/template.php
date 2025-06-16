<?php
/**
 * Logo Grid Component Template
 */
?>
<div class="logo-grid-component">
    <h2 class="logo-grid-title"><?php echo $title ?? 'Featured In'; ?></h2>
    <?php if (isset($description)): ?>
        <div class="logo-grid-description"><?php echo $description; ?></div>
    <?php endif; ?>
    
    <div class="logo-grid">
        <?php if (isset($logos) && !empty($logos)): ?>
            <?php foreach ($logos as $logo): ?>
                <div class="logo-item">
                    <?php if (isset($logo['url'])): ?>
                        <a href="<?php echo $logo['url']; ?>" target="_blank" rel="noopener noreferrer" class="logo-link">
                    <?php endif; ?>
                    
                    <img src="<?php echo $logo['image']; ?>" alt="<?php echo $logo['name'] ?? 'Logo'; ?>" class="logo-image">
                    
                    <?php if (isset($logo['url'])): ?>
                        </a>
                    <?php endif; ?>
                    
                    <?php if (isset($logo['name'])): ?>
                        <div class="logo-name"><?php echo $logo['name']; ?></div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="logo-grid-placeholder">
                <p>Add logos of companies, clients, or partners you've worked with.</p>
                <button class="add-logo-btn">+ Add Logo</button>
            </div>
        <?php endif; ?>
    </div>
    
    <?php if (isset($logos) && !empty($logos)): ?>
        <button class="add-logo-btn">+ Add Logo</button>
    <?php endif; ?>
</div>