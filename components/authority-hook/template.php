<?php
/**
 * Authority Hook Component Template
 */

// Default values for component props
$title = $title ?? 'Authority Hook';
$who = $who ?? 'Who is your ideal audience or client?';
$what = $what ?? 'What specific expertise or value do you provide?';
$when = $when ?? 'When do people need your expertise most?';
$how = $how ?? 'How do you deliver unique results?';
?>
<div class="content-section authority-hook-component editable-element" data-element="authority-hook" data-component="authority-hook" data-component-type="authority-hook">
    <h2 class="section-title" contenteditable="true" data-setting="title"><?php echo esc_html($title); ?></h2>
    <div class="authority-hook-container">
        <div class="authority-item">
            <h3>WHO</h3>
            <p contenteditable="true" data-setting="who"><?php echo esc_html($who); ?></p>
        </div>
        <div class="authority-item">
            <h3>WHAT</h3>
            <p contenteditable="true" data-setting="what"><?php echo esc_html($what); ?></p>
        </div>
        <div class="authority-item">
            <h3>WHEN</h3>
            <p contenteditable="true" data-setting="when"><?php echo esc_html($when); ?></p>
        </div>
        <div class="authority-item">
            <h3>HOW</h3>
            <p contenteditable="true" data-setting="how"><?php echo esc_html($how); ?></p>
        </div>
    </div>
</div>
