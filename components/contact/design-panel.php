<?php
/**
 * Contact Component Design Panel
 * Settings and configuration options for the contact component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
    Contact
</div>
<div class="element-editor__subtitle">Configure how visitors can reach out to you</div>

<div class="form-section">
    <h4 class="form-section__title">General Settings</h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" class="form-input" data-property="title" placeholder="Contact Me">
    </div>
    
    <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-input form-textarea" data-property="description" rows="3" placeholder="Get in touch with me for speaking engagements, interviews, or collaborations."></textarea>
    </div>
    
    <div class="form-group">
        <label class="form-label">Contact Type</label>
        <select class="form-select" data-property="contactType">
            <option value="form">Contact Form</option>
            <option value="info">Contact Information</option>
            <option value="both">Both Form and Information</option>
        </select>
    </div>
</div>

<div class="form-section" id="contact-form-section">
    <h4 class="form-section__title">Contact Form Settings</h4>
    
    <div class="form-group">
        <label class="form-label">Form Action URL</label>
        <input type="url" class="form-input" data-property="formAction" placeholder="https://example.com/form-handler">
        <p class="form-help-text">Where your form data will be submitted. Leave empty for default handling.</p>
    </div>
    
    <div class="form-group">
        <label class="form-label">Form Method</label>
        <select class="form-select" data-property="formMethod">
            <option value="post">POST</option>
            <option value="get">GET</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Notification Email</label>
        <input type="email" class="form-input" data-property="notificationEmail" placeholder="your@email.com">
        <p class="form-help-text">Where form submissions will be sent.</p>
    </div>
    
    <div class="form-group">
        <label class="form-label">Form Fields</label>
        <div class="checkbox-group">
            <label>
                <input type="checkbox" data-property="showNameField" checked>
                Name
            </label>
            <label>
                <input type="checkbox" data-property="showEmailField" checked>
                Email
            </label>
            <label>
                <input type="checkbox" data-property="showSubjectField" checked>
                Subject
            </label>
            <label>
                <input type="checkbox" data-property="showMessageField" checked>
                Message
            </label>
            <label>
                <input type="checkbox" data-property="showPhoneField">
                Phone
            </label>
            <label>
                <input type="checkbox" data-property="showCompanyField">
                Company
            </label>
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Submit Button Text</label>
        <input type="text" class="form-input" data-property="submitButtonText" placeholder="Send Message">
    </div>
</div>

<div class="form-section" id="contact-info-section">
    <h4 class="form-section__title">Contact Information</h4>
    
    <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-input" data-property="contactEmail" placeholder="your@email.com">
    </div>
    
    <div class="form-group">
        <label class="form-label">Phone Number</label>
        <input type="tel" class="form-input" data-property="contactPhone" placeholder="+1 (123) 456-7890">
    </div>
    
    <div class="form-group">
        <label class="form-label">Address</label>
        <textarea class="form-input form-textarea" data-property="contactAddress" rows="2" placeholder="Your business address"></textarea>
    </div>
    
    <div class="form-group">
        <h5 class="subsection-title">Additional Contact Points</h5>
        <div class="custom-contacts-list" id="custom-contacts-list">
            <!-- Custom contacts will be added here dynamically -->
        </div>
        <button class="add-item-btn" id="add-contact-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Contact Point
        </button>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Appearance</h4>
    
    <div class="form-group">
        <label class="form-label">Layout</label>
        <select class="form-select" data-property="layout">
            <option value="standard">Standard (Stacked)</option>
            <option value="columns">Two Columns</option>
            <option value="compact">Compact</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Accent Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="accentColor" value="#4f46e5">
            <input type="text" class="form-input" value="#4f46e5" style="flex: 1;">
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Show Social Media Links</label>
        <div class="toggle-switch">
            <input type="checkbox" id="showSocial" data-property="showSocial">
            <label for="showSocial"></label>
        </div>
    </div>
</div>
