<?php
/**
 * Photo Gallery Component Template
 */
?>
<div class="photo-gallery-component editable-element" data-element="photo-gallery" data-component="photo-gallery" data-component-id="<?php echo esc_attr($componentId ?? $id ?? ''); ?>" data-component-type="photo-gallery">
    <div class="element-controls">
        <button class="control-btn" title="Move Up">↑</button>
        <button class="control-btn" title="Move Down">↓</button>
        <button class="control-btn" title="Duplicate">⧉</button>
        <button class="control-btn" title="Delete">×</button>
    </div>
    <h2 class="photo-gallery-title"><?php echo $title ?? 'Photo Gallery'; ?></h2>
    <?php if (isset($description)): ?>
        <div class="photo-gallery-description"><?php echo $description; ?></div>
    <?php endif; ?>
    
    <div class="photo-gallery-container">
        <?php if (isset($photos) && !empty($photos)): ?>
            <div class="photo-gallery-grid">
                <?php foreach ($photos as $index => $photo): ?>
                    <div class="photo-item" data-index="<?php echo $index; ?>">
                        <div class="photo-wrapper">
                            <img 
                                src="<?php echo $photo['src']; ?>" 
                                alt="<?php echo $photo['caption'] ?? 'Gallery image'; ?>" 
                                class="photo-image"
                            >
                            <?php if (isset($photo['caption']) && !empty($photo['caption'])): ?>
                                <div class="photo-caption"><?php echo $photo['caption']; ?></div>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <!-- Lightbox for photo viewing -->
            <div class="photo-lightbox">
                <div class="lightbox-content">
                    <img src="" alt="" class="lightbox-image">
                    <div class="lightbox-caption"></div>
                </div>
                <button class="lightbox-prev">&lt;</button>
                <button class="lightbox-next">&gt;</button>
                <button class="lightbox-close">&times;</button>
            </div>
            
            <button class="add-photo-btn">+ Add Photo</button>
        <?php else: ?>
            <div class="photo-gallery-placeholder">
                <div class="placeholder-content">
                    <div class="placeholder-icon"></div>
                    <p>Add photos to your gallery to showcase your work or portfolio.</p>
                    <button class="add-photo-btn">+ Add Photos</button>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>