<?php
/**
 * Booking Calendar Component Design Panel
 * Settings and configuration options for the booking calendar component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
    Booking Calendar
</div>
<div class="element-editor__subtitle">Configure your booking calendar and appointment settings</div>

<div class="form-section">
    <h4 class="form-section__title">Calendar Settings</h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" class="form-input" data-property="title" placeholder="Book a Session">
    </div>
    
    <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-input form-textarea" data-property="description" rows="3" placeholder="Book a consultation or session with me..."></textarea>
    </div>
    
    <div class="form-group">
        <label class="form-label">Calendar Source</label>
        <select class="form-select" data-property="calendar_source">
            <option value="manual">Manual Calendar</option>
            <option value="google">Google Calendar</option>
            <option value="outlook">Outlook Calendar</option>
            <option value="calendly">Calendly</option>
        </select>
    </div>
    
    <div class="form-group" id="calendly-integration">
        <label class="form-label">Calendly Link</label>
        <input type="text" class="form-input" data-property="calendly_link" placeholder="https://calendly.com/your-username">
        <p class="form-help-text">Enter your Calendly link to embed your existing availability.</p>
    </div>
</div>

<div class="form-section" id="services-section">
    <h4 class="form-section__title">Services</h4>
    
    <div class="services-list" id="design-services-list">
        <!-- Services will be dynamically added here -->
    </div>
    
    <button class="add-item-btn" id="add-service-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Service
    </button>
</div>

<div class="form-section">
    <h4 class="form-section__title">Availability</h4>
    
    <div class="form-group">
        <label class="form-label">Business Hours</label>
        <div class="time-range-selector">
            <div class="day-selector">
                <label><input type="checkbox" data-property="monday_enabled" checked> Monday</label>
                <div class="time-inputs">
                    <input type="time" class="form-input time-input" data-property="monday_start" value="09:00">
                    <span>to</span>
                    <input type="time" class="form-input time-input" data-property="monday_end" value="17:00">
                </div>
            </div>
            <div class="day-selector">
                <label><input type="checkbox" data-property="tuesday_enabled" checked> Tuesday</label>
                <div class="time-inputs">
                    <input type="time" class="form-input time-input" data-property="tuesday_start" value="09:00">
                    <span>to</span>
                    <input type="time" class="form-input time-input" data-property="tuesday_end" value="17:00">
                </div>
            </div>
            <div class="day-selector">
                <label><input type="checkbox" data-property="wednesday_enabled" checked> Wednesday</label>
                <div class="time-inputs">
                    <input type="time" class="form-input time-input" data-property="wednesday_start" value="09:00">
                    <span>to</span>
                    <input type="time" class="form-input time-input" data-property="wednesday_end" value="17:00">
                </div>
            </div>
            <div class="day-selector">
                <label><input type="checkbox" data-property="thursday_enabled" checked> Thursday</label>
                <div class="time-inputs">
                    <input type="time" class="form-input time-input" data-property="thursday_start" value="09:00">
                    <span>to</span>
                    <input type="time" class="form-input time-input" data-property="thursday_end" value="17:00">
                </div>
            </div>
            <div class="day-selector">
                <label><input type="checkbox" data-property="friday_enabled" checked> Friday</label>
                <div class="time-inputs">
                    <input type="time" class="form-input time-input" data-property="friday_start" value="09:00">
                    <span>to</span>
                    <input type="time" class="form-input time-input" data-property="friday_end" value="17:00">
                </div>
            </div>
            <div class="day-selector">
                <label><input type="checkbox" data-property="saturday_enabled"> Saturday</label>
                <div class="time-inputs">
                    <input type="time" class="form-input time-input" data-property="saturday_start" value="10:00">
                    <span>to</span>
                    <input type="time" class="form-input time-input" data-property="saturday_end" value="15:00">
                </div>
            </div>
            <div class="day-selector">
                <label><input type="checkbox" data-property="sunday_enabled"> Sunday</label>
                <div class="time-inputs">
                    <input type="time" class="form-input time-input" data-property="sunday_start" value="10:00">
                    <span>to</span>
                    <input type="time" class="form-input time-input" data-property="sunday_end" value="15:00">
                </div>
            </div>
        </div>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Notification Settings</h4>
    
    <div class="form-group">
        <label class="form-label">Booking Notification Email</label>
        <input type="email" class="form-input" data-property="notification_email" placeholder="your@email.com">
        <p class="form-help-text">You'll receive booking notifications at this email address.</p>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="send_confirmation" checked>
            Send confirmation emails to clients
        </label>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Appearance</h4>
    
    <div class="form-group">
        <label class="form-label">Calendar Style</label>
        <select class="form-select" data-property="calendar_style">
            <option value="standard">Standard</option>
            <option value="compact">Compact</option>
            <option value="detailed">Detailed</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Calendar Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="calendar_color" value="#4f46e5">
            <input type="text" class="form-input" value="#4f46e5" style="flex: 1;">
        </div>
    </div>
</div>
