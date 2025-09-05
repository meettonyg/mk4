<?php
/**
 * Section Template: Two Column
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
$section_classes = array('gmkb-section', 'gmkb-section--two-column');
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

// Column ratio (default 1fr 1fr for equal columns)
$column_ratio = $layout['column_ratio'] ?? '1fr 1fr';
?>

<section 
    class="<?php echo esc_attr(implode(' ', $section_classes)); ?>" 
    data-section-id="<?php echo esc_attr($section_id); ?>"
    data-section-type="two_column"
    style="<?php echo esc_attr(implode('; ', $section_styles)); ?>"
>
    <div class="gmkb-section__container">
        <div class="gmkb-section__grid" style="grid-template-columns: <?php echo esc_attr($column_ratio); ?>; gap: <?php echo esc_attr($layout['column_gap'] ?? '40px'); ?>;">
            <!-- Column 1 -->
            <div class="gmkb-section__column" data-column="1">
                <div class="gmkb-components-container" data-section-components="<?php echo esc_attr($section_id); ?>" data-column="1">
                    <?php
                    // Render components for column 1
                    if (!empty($section['components'])) {
                        foreach ($section['components'] as $component) {
                            if (($component['column'] ?? 1) == 1) {
                                echo '<div class="gmkb-component-placeholder" data-component-id="' . esc_attr($component['component_id']) . '"></div>';
                            }
                        }
                    }
                    ?>
                </div>
            </div>
            
            <!-- Column 2 -->
            <div class="gmkb-section__column" data-column="2">
                <div class="gmkb-components-container" data-section-components="<?php echo esc_attr($section_id); ?>" data-column="2">
                    <?php
                    // Render components for column 2
                    if (!empty($section['components'])) {
                        foreach ($section['components'] as $component) {
                            if (($component['column'] ?? 1) == 2) {
                                echo '<div class="gmkb-component-placeholder" data-component-id="' . esc_attr($component['component_id']) . '"></div>';
                            }
                        }
                    }
                    ?>
                </div>
            </div>
        </div>
    </div>
</section>
