<?php
/**
 * Booking Calendar Component Template
 */

// ROOT FIX: Handle props data structure
if (isset($props) && is_array($props)) {
    // Extract from props array
    $title = $props['title'] ?? null;
    $description = $props['description'] ?? null;
    $calendarConfigured = $props['calendarConfigured'] ?? null;
    $services = $props['services'] ?? null;
    $componentId = $props['component_id'] ?? $props['componentId'] ?? null;
} else {
    // Direct variables might be set
    $title = $title ?? null;
    $description = $description ?? null;
    $calendarConfigured = $calendarConfigured ?? null;
    $services = $services ?? null;
    $componentId = $componentId ?? $id ?? null;
}

// Set defaults
$title = $title ?? 'Book a Session';
$componentId = $componentId ?? 'booking-calendar-' . time();
?>
<div class="gmkb-component gmkb-component--bookingcalendar editable-element" data-element="booking-calendar" data-component="booking-calendar" data-component-id="<?php echo esc_attr($componentId ?? $id ?? ''); ?>" data-component-type="booking-calendar">
    <!-- ROOT FIX: Removed hardcoded element-controls - dynamic controls added by component-controls-manager.js -->
    <h2 class="booking-calendar-title"><?php echo $title ?? 'Book a Session'; ?></h2>
    <?php if (isset($description)): ?>
        <div class="booking-calendar-description"><?php echo $description; ?></div>
    <?php endif; ?>
    
    <?php if (isset($calendarConfigured) && $calendarConfigured): ?>
        <div class="booking-calendar-container">
            <div class="booking-sidebar">
                <div class="service-selection">
                    <h3 class="sidebar-title">Select Service</h3>
                    <div class="service-options">
                        <?php if (isset($services) && !empty($services)): ?>
                            <?php foreach ($services as $index => $service): ?>
                                <div class="service-option <?php echo $index === 0 ? 'active' : ''; ?>" data-service-id="<?php echo $service['id']; ?>">
                                    <div class="service-name"><?php echo $service['name']; ?></div>
                                    <div class="service-duration"><?php echo $service['duration']; ?> min</div>
                                    <div class="service-price"><?php echo $service['price']; ?></div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
                
                <div class="selected-info">
                    <div class="selected-date-display">
                        <span class="selected-date-label">Date:</span>
                        <span class="selected-date-value">Select a date</span>
                    </div>
                    <div class="selected-time-display">
                        <span class="selected-time-label">Time:</span>
                        <span class="selected-time-value">Select a time</span>
                    </div>
                </div>
            </div>
            
            <div class="booking-main">
                <div class="calendar-container">
                    <div class="calendar-header">
                        <button class="prev-month-btn">&lt;</button>
                        <div class="current-month">June 2025</div>
                        <button class="next-month-btn">&gt;</button>
                    </div>
                    <div class="calendar-grid">
                        <div class="calendar-day-header">Sun</div>
                        <div class="calendar-day-header">Mon</div>
                        <div class="calendar-day-header">Tue</div>
                        <div class="calendar-day-header">Wed</div>
                        <div class="calendar-day-header">Thu</div>
                        <div class="calendar-day-header">Fri</div>
                        <div class="calendar-day-header">Sat</div>
                        
                        <!-- Calendar days would be generated dynamically -->
                        <div class="calendar-day disabled">30</div>
                        <div class="calendar-day disabled">31</div>
                        <div class="calendar-day">1</div>
                        <div class="calendar-day">2</div>
                        <div class="calendar-day">3</div>
                        <div class="calendar-day">4</div>
                        <div class="calendar-day">5</div>
                        <div class="calendar-day">6</div>
                        <div class="calendar-day">7</div>
                        <div class="calendar-day">8</div>
                        <div class="calendar-day">9</div>
                        <div class="calendar-day">10</div>
                        <div class="calendar-day">11</div>
                        <div class="calendar-day">12</div>
                        <div class="calendar-day">13</div>
                        <div class="calendar-day active">14</div>
                        <div class="calendar-day today">15</div>
                        <div class="calendar-day">16</div>
                        <div class="calendar-day">17</div>
                        <div class="calendar-day available">18</div>
                        <div class="calendar-day available">19</div>
                        <div class="calendar-day">20</div>
                        <div class="calendar-day">21</div>
                        <div class="calendar-day">22</div>
                        <div class="calendar-day">23</div>
                        <div class="calendar-day">24</div>
                        <div class="calendar-day">25</div>
                        <div class="calendar-day">26</div>
                        <div class="calendar-day">27</div>
                        <div class="calendar-day">28</div>
                        <div class="calendar-day">29</div>
                        <div class="calendar-day">30</div>
                        <div class="calendar-day disabled">1</div>
                        <div class="calendar-day disabled">2</div>
                        <div class="calendar-day disabled">3</div>
                    </div>
                </div>
                
                <div class="time-slots-container">
                    <h3 class="time-slots-title">Available Times on June 14</h3>
                    <div class="time-slots-grid">
                        <div class="time-slot">9:00 AM</div>
                        <div class="time-slot">10:00 AM</div>
                        <div class="time-slot">11:00 AM</div>
                        <div class="time-slot booked">12:00 PM</div>
                        <div class="time-slot">1:00 PM</div>
                        <div class="time-slot active">2:00 PM</div>
                        <div class="time-slot">3:00 PM</div>
                        <div class="time-slot booked">4:00 PM</div>
                        <div class="time-slot">5:00 PM</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="booking-form-container">
            <h3 class="booking-form-title">Complete Your Booking</h3>
            <form class="booking-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="booking-name">Full Name</label>
                        <input type="text" id="booking-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="booking-email">Email</label>
                        <input type="email" id="booking-email" name="email" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="booking-phone">Phone Number</label>
                        <input type="tel" id="booking-phone" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="booking-notes">Special Requests (Optional)</label>
                        <textarea id="booking-notes" name="notes" rows="3"></textarea>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="booking-submit-btn">Book Appointment</button>
                </div>
            </form>
        </div>
        
        <button class="edit-calendar-btn">Edit Calendar Settings</button>
    <?php else: ?>
        <div class="booking-calendar-placeholder">
            <div class="placeholder-content">
                <div class="placeholder-icon"></div>
                <h3>Set Up Your Booking Calendar</h3>
                <p>Allow visitors to book appointments or sessions with you directly from your media kit.</p>
                <button class="setup-calendar-btn">Set Up Calendar</button>
            </div>
        </div>
    <?php endif; ?>
</div>