<?php
/**
 * Contact Component Template
 */
?>
<div class="contact-component editable-element" data-element="contact" data-component="contact" data-component-id="<?php echo esc_attr($componentId ?? $id ?? ''); ?>" data-component-type="contact">
    <div class="element-controls">
        <button class="control-btn" title="Move Up">↑</button>
        <button class="control-btn" title="Move Down">↓</button>
        <button class="control-btn" title="Duplicate">⧉</button>
        <button class="control-btn" title="Delete">×</button>
    </div>
    <h2 class="contact-title"><?php echo $title ?? 'Contact Me'; ?></h2>
    <?php if (isset($description)): ?>
        <div class="contact-description"><?php echo $description; ?></div>
    <?php endif; ?>
    
    <?php if (isset($contactType) && $contactType === 'form'): ?>
        <form class="contact-form" action="<?php echo $formAction ?? '#'; ?>" method="<?php echo $formMethod ?? 'post'; ?>">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="subject">Subject</label>
                <input type="text" id="subject" name="subject" required>
            </div>
            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            <button type="submit" class="contact-submit-btn">Send Message</button>
        </form>
    <?php elseif (isset($contactType) && $contactType === 'info'): ?>
        <div class="contact-info">
            <?php if (isset($contactEmail)): ?>
                <div class="contact-info-item">
                    <div class="contact-info-icon email-icon"></div>
                    <div class="contact-info-content">
                        <div class="contact-info-label">Email</div>
                        <a href="mailto:<?php echo $contactEmail; ?>" class="contact-info-value"><?php echo $contactEmail; ?></a>
                    </div>
                </div>
            <?php endif; ?>
            
            <?php if (isset($contactPhone)): ?>
                <div class="contact-info-item">
                    <div class="contact-info-icon phone-icon"></div>
                    <div class="contact-info-content">
                        <div class="contact-info-label">Phone</div>
                        <a href="tel:<?php echo $contactPhone; ?>" class="contact-info-value"><?php echo $contactPhone; ?></a>
                    </div>
                </div>
            <?php endif; ?>
            
            <?php if (isset($contactAddress)): ?>
                <div class="contact-info-item">
                    <div class="contact-info-icon address-icon"></div>
                    <div class="contact-info-content">
                        <div class="contact-info-label">Address</div>
                        <div class="contact-info-value"><?php echo $contactAddress; ?></div>
                    </div>
                </div>
            <?php endif; ?>
            
            <?php if (isset($contactCustom) && !empty($contactCustom)): ?>
                <?php foreach ($contactCustom as $custom): ?>
                    <div class="contact-info-item">
                        <div class="contact-info-icon custom-icon"></div>
                        <div class="contact-info-content">
                            <div class="contact-info-label"><?php echo $custom['label']; ?></div>
                            <div class="contact-info-value"><?php echo $custom['value']; ?></div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    <?php else: ?>
        <div class="contact-placeholder">
            <p>Set up your contact information or a contact form.</p>
            <div class="contact-type-selection">
                <button class="contact-type-btn" data-type="form">Add Contact Form</button>
                <button class="contact-type-btn" data-type="info">Add Contact Info</button>
            </div>
        </div>
    <?php endif; ?>
</div>