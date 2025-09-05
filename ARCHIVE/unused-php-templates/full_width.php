<?php
/**
 * Section Template: Full Width
 * Phase 3: Section Layer Architecture
 * 
 * @package GMKB
 * @since 3.0.0
 */

$section = $args['section'] ?? null;
if (!$section) return;

$section_id = $section['section_id'] ?? '';
$section_options = $section['section_options'] ?? array();
$layout = $section['layout'] ?? array();

// Apply section styling
$section_classes = array('gmkb-section', 'gmkb-section--full-width');
if (isset($section_options['additional_classes'])) {
    $section_classes[] = $section_options['additional_classes'];
}

$section_styles = array();
if (isset($section_options['background_color']) && $section_options['background_color'] !== 'transparent') {
    $section_styles[] = 'background-color: ' . $section_options['background_color'];
}
if (isset($layout['padding'])) {
    $section_styles[] = 'padding: ' . $layout['padding'];
}
?>

<section 
    class="<?php echo esc_attr(implode(' ', $section_classes)); ?>" 
    data-section-id="<?php echo esc_attr($section_id); ?>"
    data-section-type="full_width"
    style="<?php echo esc_attr(implode('; ', $section_styles)); ?>"
>
    <div class="gmkb-section__container">
        <div class="gmkb-section__content">
            <!-- Components will be rendered here -->
            <div class="gmkb-components-container" data-section-components="<?php echo esc_attr($section_id); ?>">
                <?php
                // Render any existing components
                if (!empty($section['components'])) {
                    foreach ($section['components'] as $component) {
                        echo '<div class="gmkb-component-placeholder" data-component-id="' . esc_attr($component['component_id']) . '"></div>';
                    }
                }
                ?>
            </div>
        </div>
    </div>
</section>
