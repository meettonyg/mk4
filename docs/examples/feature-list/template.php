<?php
/**
 * Feature List Component Template
 * 
 * This template demonstrates:
 * - Using default values with null coalescing operator
 * - Proper escaping for security
 * - Contenteditable integration
 * - Dynamic CSS variables
 * - Repeatable items pattern
 */

// Extract variables with defaults
$title = $title ?? 'Key Features';
$subtitle = $subtitle ?? 'What makes you unique';
$layout = $layout ?? 'grid';
$columns = $columns ?? 3;
$icon_style = $icon_style ?? 'circle';
$primary_color = $primary_color ?? '#3b82f6';
$show_descriptions = $show_descriptions ?? true;

// Features array - in production this comes from component state
$features = $features ?? [
    [
        'icon' => '🚀',
        'title' => 'Fast Performance',
        'description' => 'Lightning-fast load times for better user experience'
    ],
    [
        'icon' => '🔒',
        'title' => 'Secure & Reliable',
        'description' => 'Built with security best practices in mind'
    ],
    [
        'icon' => '📱',
        'title' => 'Mobile Responsive',
        'description' => 'Looks great on all devices and screen sizes'
    ]
];
?>

<div class="feature-list editable-element layout-<?php echo esc_attr($layout); ?>" 
     data-element="feature-list" 
     data-component="feature-list" 
     data-component-id="<?php echo esc_attr($componentId); ?>" 
     data-component-type="feature-list"
     style="--primary-color: <?php echo esc_attr($primary_color); ?>">
    
    <!-- Component Controls -->
    <div class="element-controls">
        <button class="control-btn" title="Move Up">↑</button>
        <button class="control-btn" title="Move Down">↓</button>
        <button class="control-btn" title="Duplicate">⧉</button>
        <button class="control-btn" title="Delete">×</button>
    </div>
    
    <!-- Header Section -->
    <div class="feature-list__header">
        <h2 class="feature-list__title" contenteditable="true" data-setting="title">
            <?php echo esc_html($title); ?>
        </h2>
        <p class="feature-list__subtitle" contenteditable="true" data-setting="subtitle">
            <?php echo esc_html($subtitle); ?>
        </p>
    </div>
    
    <!-- Features Grid -->
    <div class="feature-list__grid" style="grid-template-columns: repeat(<?php echo esc_attr($columns); ?>, 1fr)">
        <?php foreach ($features as $index => $feature): ?>
        <div class="feature-item" data-feature-index="<?php echo $index; ?>">
            <div class="feature-icon icon-style-<?php echo esc_attr($icon_style); ?>">
                <span class="feature-icon__emoji" contenteditable="true" 
                      data-setting="feature_<?php echo $index; ?>_icon">
                    <?php echo esc_html($feature['icon']); ?>
                </span>
            </div>
            <h3 class="feature-item__title" contenteditable="true" 
                data-setting="feature_<?php echo $index; ?>_title">
                <?php echo esc_html($feature['title']); ?>
            </h3>
            <p class="feature-item__description" 
               contenteditable="true" 
               data-setting="feature_<?php echo $index; ?>_desc"
               style="<?php echo !$show_descriptions ? 'display: none;' : ''; ?>">
                <?php echo esc_html($feature['description']); ?>
            </p>
            <button class="remove-feature-btn" title="Remove Feature" data-index="<?php echo $index; ?>">×</button>
        </div>
        <?php endforeach; ?>
    </div>
    
    <!-- Add Feature Button -->
    <div class="feature-list__actions">
        <button class="add-feature-btn">+ Add Feature</button>
    </div>
</div>

<style>
/* Component Base Styles */
.feature-list {
    padding: 3rem 0;
    position: relative;
}

/* Header Styles */
.feature-list__header {
    text-align: center;
    margin-bottom: 3rem;
}

.feature-list__title {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #1e293b;
}

.feature-list__subtitle {
    font-size: 1.125rem;
    color: #6b7280;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
}

/* Grid Layout */
.feature-list__grid {
    display: grid;
    gap: 2rem;
    margin-bottom: 2rem;
}

/* Feature Item */
.feature-item {
    text-align: center;
    padding: 1.5rem;
    position: relative;
    transition: transform 0.2s ease;
}

.feature-item:hover {
    transform: translateY(-2px);
}

/* Feature Icon */
.feature-icon {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    background: var(--primary-color, #3b82f6);
    color: white;
    font-size: 2rem;
    transition: all 0.3s ease;
}

.feature-icon.icon-style-circle {
    border-radius: 50%;
}

.feature-icon.icon-style-square {
    border-radius: 0.5rem;
}

.feature-icon.icon-style-none {
    background: none;
    color: var(--primary-color, #3b82f6);
}

.feature-icon__emoji {
    display: block;
    line-height: 1;
}

/* Feature Content */
.feature-item__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1e293b;
}

.feature-item__description {
    color: #6b7280;
    line-height: 1.6;
    font-size: 0.95rem;
}

/* Layout Variations */
.layout-list .feature-list__grid {
    grid-template-columns: 1fr;
    max-width: 800px;
    margin: 0 auto 2rem;
}

.layout-list .feature-item {
    display: flex;
    align-items: flex-start;
    text-align: left;
    gap: 1.5rem;
}

.layout-list .feature-icon {
    margin: 0;
    flex-shrink: 0;
}

.layout-list .feature-item__title {
    margin-top: 0.5rem;
}

/* Card Layout */
.layout-cards .feature-item {
    background: #f9fafb;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 2rem;
}

.layout-cards .feature-item:hover {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* Actions */
.feature-list__actions {
    text-align: center;
    margin-top: 2rem;
}

.add-feature-btn {
    background: var(--primary-color, #3b82f6);
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.add-feature-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

/* Remove Button */
.remove-feature-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 24px;
    height: 24px;
    border: none;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.feature-item:hover .remove-feature-btn {
    opacity: 1;
}

.remove-feature-btn:hover {
    background: #dc2626;
}

/* Contenteditable Styling */
.feature-list [contenteditable="true"]:focus {
    outline: 2px solid var(--primary-color, #3b82f6);
    outline-offset: 2px;
    border-radius: 0.25rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .feature-list__grid {
        grid-template-columns: 1fr !important;
    }
    
    .feature-list__title {
        font-size: 2rem;
    }
    
    .layout-list .feature-item {
        flex-direction: column;
        text-align: center;
    }
    
    .layout-list .feature-icon {
        margin: 0 auto 1rem;
    }
}

/* Loading State */
.feature-list.is-loading {
    opacity: 0.6;
    pointer-events: none;
}

.feature-list.is-loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    margin: -20px 0 0 -20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--primary-color, #3b82f6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
