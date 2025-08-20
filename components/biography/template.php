<?php
/**
 * Biography Component Template
 * ROOT FIX: Enhanced with proper control attachment support
 */

// ROOT FIX: Ensure component ID is always available
$finalComponentId = $componentId ?? $id ?? 'biography-' . uniqid();
?>
<div class="content-section biography-component editable-element" 
     data-element="biography" 
     data-component="biography" 
     data-component-id="<?php echo esc_attr($finalComponentId); ?>" 
     data-component-type="biography"
     data-controls-enabled="true"
     style="position: relative; cursor: pointer;"
     tabindex="0">
    
    <!-- ROOT FIX: Controls now created dynamically by JavaScript - no server-side duplication -->
    <!-- EMERGENCY FIX: Ensure controls are attached via DOM ready event -->
    <script type="text/javascript">
    document.addEventListener('DOMContentLoaded', function() {
        const element = document.getElementById('<?php echo esc_js($finalComponentId); ?>');
        if (element && window.componentControlsManager) {
            setTimeout(() => {
                const success = window.componentControlsManager.attachControls(element, '<?php echo esc_js($finalComponentId); ?>');
                console.log('EMERGENCY FIX: Controls attached to <?php echo esc_js($finalComponentId); ?>:', success);
            }, 100);
        }
    });
    </script>
    
    <h2 class="section-title"><?php echo isset($title) ? esc_html($title) : 'About Me'; ?></h2>
    <div class="biography-content">
        <?php if (isset($content) && !empty($content)): ?>
            <p><?php echo wp_kses_post($content); ?></p>
        <?php else: ?>
            <p>Add your full biography and professional background here. This is where you can share your story, expertise, and what makes you unique as a speaker or expert in your field.</p>
        <?php endif; ?>
    </div>
</div>